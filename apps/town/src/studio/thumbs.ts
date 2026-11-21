import * as THREE from 'three';
import { createRenderer, createRig, type Rig } from '@ah/engine';
import { stageSubject, type Subject } from './subject';

const W = 360;
const H = 270;

const cache = new Map<string, string>();
const waiting = new Map<string, { subject: Subject; resolve: ((url: string) => void)[] }>();
let renderer: THREE.WebGLRenderer | null = null;
let rig: Rig | null = null;
let running = false;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

const keyOf = (s: Subject) => `${s.lineage.id}/${s.def.id}/${s.seed}`;

function ensure() {
  if (renderer) return;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  renderer = createRenderer(canvas, { maxPixelRatio: 1, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  rig = createRig(renderer, { shadowExtent: 60, shadowMapSize: 1024, fog: false });
  rig.camera.aspect = W / H;
  rig.camera.fov = 32;
  rig.camera.updateProjectionMatrix();
}

function release() {
  // a WebGL context is too scarce on phones to keep one only for pictures already taken
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer = null;
  rig = null;
}

function shoot(subject: Subject): string {
  ensure();
  const r = renderer!;
  const g = rig!;
  const staged = stageSubject(subject, { trees: false });
  g.scene.add(staged.group);
  const dir = new THREE.Vector3(0.62, 0.52, 0.78).normalize();
  const fov = (g.camera.fov * Math.PI) / 180;
  const dist = (staged.radius * 1.12) / Math.sin(fov / 2);
  g.camera.position.copy(staged.centre).addScaledVector(dir, dist);
  g.camera.lookAt(staged.centre);
  g.setShadowCentre(staged.centre.x, staged.centre.z);
  r.render(g.scene, g.camera);
  const url = r.domElement.toDataURL('image/webp', 0.82);
  g.scene.remove(staged.group);
  staged.dispose();
  return url;
}

function pump() {
  if (idleTimer) clearTimeout(idleTimer);
  const next = waiting.entries().next();
  if (next.done) {
    running = false;
    idleTimer = setTimeout(release, 4000);
    return;
  }
  const [key, job] = next.value;
  waiting.delete(key);
  let url = '';
  try {
    url = shoot(job.subject);
  } catch (err) {
    console.error('Thumbnail failed', key, err);
  }
  cache.set(key, url);
  for (const fn of job.resolve) fn(url);
  // one picture per frame keeps the page responsive while the library fills in
  requestAnimationFrame(pump);
}

/** A small picture of a building, rendered from its model on first request and remembered. */
export function thumbnail(subject: Subject): Promise<string> {
  const key = keyOf(subject);
  const hit = cache.get(key);
  if (hit !== undefined) return Promise.resolve(hit);
  return new Promise((resolve) => {
    const job = waiting.get(key);
    if (job) job.resolve.push(resolve);
    else waiting.set(key, { subject, resolve: [resolve] });
    if (!running) {
      running = true;
      requestAnimationFrame(pump);
    }
  });
}

/** The picture if it has already been made. */
export function cachedThumbnail(subject: Subject): string | undefined {
  return cache.get(keyOf(subject));
}
