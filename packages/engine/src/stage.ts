import * as THREE from 'three';
import { getMaterials } from '@ah/kit';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** Half-size in metres of the area that receives sun shadows. */
  shadowExtent?: number;
  shadowMapSize?: number;
  shadows?: boolean;
  maxPixelRatio?: number;
}

export interface Stage3D {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  sky: THREE.Mesh;
  resize(): void;
  setShadowCentre(x: number, z: number): void;
  dispose(): void;
}

const SKY_TOP = new THREE.Color(0x6fa3d8);
const SKY_HORIZON = new THREE.Color(0xdfe9ee);
const SKY_GROUND = new THREE.Color(0xcfd6c4);

function makeSky(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(4000, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: SKY_TOP },
      horizon: { value: SKY_HORIZON },
      ground: { value: SKY_GROUND },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * p;
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top; uniform vec3 horizon; uniform vec3 ground;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(horizon, ground, clamp(-h * 6.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return mesh;
}

export interface Rig {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  sky: THREE.Mesh;
  setShadowCentre(x: number, z: number): void;
}

/** A WebGL renderer set up the way every view in the project expects. */
export function createRenderer(
  canvas: HTMLCanvasElement,
  opts: { shadows?: boolean; maxPixelRatio?: number; preserveDrawingBuffer?: boolean } = {},
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxPixelRatio ?? 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  return renderer;
}

/** A scene with the standard sky, sun and soft fill light, and a camera to look at it with. */
export function createRig(
  renderer: THREE.WebGLRenderer,
  opts: { shadowExtent?: number; shadowMapSize?: number; shadows?: boolean; fog?: boolean } = {},
): Rig {
  const scene = new THREE.Scene();
  scene.background = SKY_HORIZON.clone();
  if (opts.fog !== false) scene.fog = new THREE.Fog(0xdfe9ee, 260, 1500);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 5000);

  const sky = makeSky();
  scene.add(sky);

  // image-based light from the sky itself, so glass picks up a believable reflection
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(makeSky());
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xdcebff, 0x9a9278, 0.75);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.position.set(-120, 190, 150);
  sun.castShadow = opts.shadows !== false;
  const e = opts.shadowExtent ?? 220;
  sun.shadow.camera.left = -e;
  sun.shadow.camera.right = e;
  sun.shadow.camera.top = e;
  sun.shadow.camera.bottom = -e;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 700;
  const size = opts.shadowMapSize ?? 4096;
  sun.shadow.mapSize.set(size, size);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.12 * (e / 220) * (4096 / size);
  sun.shadow.radius = 2.5;
  scene.add(sun);
  scene.add(sun.target);

  const sunOffset = sun.position.clone();

  // make sure the shared building materials exist before the first compile
  getMaterials();

  return {
    scene,
    camera,
    sun,
    hemi,
    sky,
    setShadowCentre(x, z) {
      sun.target.position.set(x, 0, z);
      sun.position.set(x + sunOffset.x, sunOffset.y, z + sunOffset.z);
      sun.target.updateMatrixWorld();
    },
  };
}

/** Renderer, sky, sun and soft fill light shared by the town, the lineage street and the gallery. */
export function createStage(opts: StageOptions): Stage3D {
  const renderer = createRenderer(opts.canvas, opts);
  const rig = createRig(renderer, opts);
  const resize = () => {
    const w = opts.canvas.clientWidth || window.innerWidth;
    const h = opts.canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    rig.camera.aspect = w / h;
    rig.camera.updateProjectionMatrix();
  };
  resize();
  return {
    renderer,
    ...rig,
    resize,
    dispose() {
      renderer.dispose();
    },
  };
}
