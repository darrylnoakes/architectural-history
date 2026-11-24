import * as THREE from 'three';
import type { Built, MatKind, Part } from '@ah/kit';

/**
 * What changes between two models on the same plot, piece by piece: the pieces of the old one that
 * are gone from the new one, the pieces of the new one that were not in the old one, and the pieces
 * the two share, which stay where they are.
 */
export interface Diff {
  /** Pieces of the old model that go. */
  leaving: Part[];
  /** Pieces of the new model that were already there, and the ones that are new. */
  kept: Part[];
  arriving: Part[];
  /** Share of the old model (by size) that the new one keeps: 1 for no change, 0 for a new building. */
  keptShare: number;
}

export function diffBuilt(prev: Built | null, next: Built | null): Diff {
  const pool = new Map<string, Part[]>();
  for (const p of prev?.parts ?? []) {
    const list = pool.get(p.key);
    if (list) list.push(p);
    else pool.set(p.key, [p]);
  }
  const kept: Part[] = [];
  const arriving: Part[] = [];
  let keptVerts = 0;
  for (const p of next?.parts ?? []) {
    const twin = pool.get(p.key);
    if (twin?.length) {
      twin.pop();
      kept.push(p);
      keptVerts += p.count;
    } else arriving.push(p);
  }
  const leaving = [...pool.values()].flat();
  const total = (prev?.parts ?? []).reduce((a, p) => a + p.count, 0);
  return { leaving, kept, arriving, keptShare: total ? keptVerts / total : 0 };
}

const LEAVE = 0.22;
const ARRIVE = 0.32;

/**
 * The clock every moving piece reads. The pieces are moved on the graphics card: each vertex carries
 * the point it grows from and the moment its piece starts, so a whole town changing at once costs
 * the processor nothing per frame.
 */
const clock = { value: 0 };

/** Advance the clock the moving pieces read (once a frame, by the town). */
export function tickMorphs(dt: number) {
  clock.value += dt;
}

const VERT_HEAD = /* glsl */ `
attribute vec3 aPivot;
attribute vec2 aWhen;
uniform float uMorphNow;`;

// aWhen.x is when the piece starts; aWhen.y how long it takes, positive to grow and negative to shrink
const VERT_MOVE = /* glsl */ `
{
  float mk = clamp((uMorphNow - aWhen.x) / abs(aWhen.y), 0.0, 1.0);
  float mu = mk - 1.0;
  float ms = aWhen.y > 0.0 ? (mk <= 0.0 ? 0.0 : 1.0 + 2.1 * mu * mu * mu + 1.1 * mu * mu) : 1.0 - mk * mk;
  transformed = aPivot + (transformed - aPivot) * ms;
}`;

function moving<T extends THREE.Material>(src: T, make: () => T): T {
  const m = make();
  m.onBeforeCompile = (shader, renderer) => {
    src.onBeforeCompile(shader, renderer);
    shader.uniforms.uMorphNow = clock;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>' + VERT_HEAD)
      .replace('#include <begin_vertex>', '#include <begin_vertex>' + VERT_MOVE);
  };
  m.customProgramCacheKey = () => src.customProgramCacheKey() + '|moving';
  return m;
}

const surfaces = new WeakMap<THREE.Material, THREE.Material>();
const depths = new WeakMap<THREE.Material, THREE.Material>();
let plainDepth: THREE.Material | null = null;

/** The material a mesh's moving pieces are drawn with: its own, with the movement added. */
function movingSurface(src: THREE.Material): THREE.Material {
  let m = surfaces.get(src);
  if (!m) surfaces.set(src, (m = moving(src, () => src.clone())));
  return m;
}

/** The same for the shadow it casts, so the shadow grows with the piece. */
function movingDepth(src: THREE.Material | undefined): THREE.Material {
  if (!src) {
    if (!plainDepth) {
      const base = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
      plainDepth = moving(base, () => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }));
    }
    return plainDepth;
  }
  let m = depths.get(src);
  if (!m) depths.set(src, (m = moving(src, () => src.clone())));
  return m;
}

function meshOf(b: Built, kind: MatKind): THREE.Mesh | undefined {
  return b.object.children.find((c) => c.userData.kind === kind) as THREE.Mesh | undefined;
}

/**
 * A mesh holding just the given pieces of a model. If they are the whole of the model's mesh it
 * shares the mesh's own data (nothing is copied); otherwise the pieces are copied out of it.
 */
function subset(b: Built, kind: MatKind, parts: Part[]): { mesh: THREE.Mesh; list: Part[]; shared: boolean } | null {
  const src = meshOf(b, kind);
  const list = parts.filter((p) => p.kind === kind);
  if (!src || !list.length) return null;
  const n = list.reduce((a, p) => a + p.count, 0);
  const g = new THREE.BufferGeometry();
  const whole = n === src.geometry.attributes.position.count;
  if (whole) list.sort((p, q) => p.start - q.start);
  for (const name of ['position', 'normal', 'color']) {
    const attr = src.geometry.attributes[name] as THREE.BufferAttribute | undefined;
    if (!attr) continue;
    if (whole) {
      g.setAttribute(name, attr);
      continue;
    }
    const from = attr.array as Float32Array;
    const to = new Float32Array(n * 3);
    let k = 0;
    for (const p of list) {
      to.set(from.subarray(p.start * 3, (p.start + p.count) * 3), k);
      k += p.count * 3;
    }
    g.setAttribute(name, new THREE.BufferAttribute(to, 3));
  }
  const mesh = new THREE.Mesh(g, src.material);
  mesh.customDepthMaterial = src.customDepthMaterial;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { ...src.userData };
  // the pieces move, so the box round them is not worth keeping up to date
  mesh.frustumCulled = false;
  return { mesh, list, shared: whole };
}

/**
 * One model turning into another in place: the pieces they share stand still, the pieces that go
 * shrink away from the top down, and the new pieces grow where they belong from the bottom up. A
 * building going up on an empty plot, or coming down, is the same thing with nothing shared.
 */
export class Morph {
  readonly group = new THREE.Group();
  readonly duration: number;
  private moves = false;
  /** Geometry made here that borrows a model's own data, which must outlive this. */
  private borrowed: THREE.BufferGeometry[] = [];

  constructor(prev: Built | null, next: Built | null, d: Diff) {
    const gap = d.leaving.length ? LEAVE + 0.12 : 0;
    const t0 = clock.value;
    let end = 0;
    for (const kind of ['matte', 'glass'] as MatKind[]) {
      if (next) {
        const still = subset(next, kind, d.kept);
        if (still) {
          this.group.add(still.mesh);
          if (still.shared) this.borrowed.push(still.mesh.geometry);
        }
      }
      for (const [built, parts, grow] of [
        [prev, d.leaving, false],
        [next, d.arriving, true],
      ] as [Built | null, Part[], boolean][]) {
        if (!built) continue;
        const sub = subset(built, kind, parts);
        if (!sub) continue;
        const { mesh, list } = sub;
        const lo = Math.min(...parts.map((p) => p.y0));
        const hi = Math.max(...parts.map((p) => p.y1));
        const span = Math.max(0.5, hi - lo);
        const n = mesh.geometry.attributes.position.count;
        const pivot = new Float32Array(n * 3);
        const when = new Float32Array(n * 2);
        let k = 0;
        for (const p of list) {
          // the new go up from the ground; the old come down from the top
          const t = grow ? gap + 0.34 * ((p.y0 - lo) / span) : 0.16 * (1 - (p.y1 - lo) / span);
          end = Math.max(end, t + (grow ? ARRIVE : LEAVE));
          for (let i = 0; i < p.count; i++, k++) {
            pivot[k * 3] = p.cx;
            pivot[k * 3 + 1] = p.y0;
            pivot[k * 3 + 2] = p.cz;
            when[k * 2] = t0 + t;
            when[k * 2 + 1] = grow ? ARRIVE : -LEAVE;
          }
        }
        mesh.geometry.setAttribute('aPivot', new THREE.BufferAttribute(pivot, 3));
        mesh.geometry.setAttribute('aWhen', new THREE.BufferAttribute(when, 2));
        if (sub.shared) this.borrowed.push(mesh.geometry);
        mesh.customDepthMaterial = movingDepth(mesh.customDepthMaterial);
        mesh.material = movingSurface(mesh.material as THREE.Material);
        this.moves = true;
        this.group.add(mesh);
      }
    }
    this.duration = end;
  }

  /** Whether anything actually moves (two forms of a building can be piece for piece the same). */
  get idle(): boolean {
    return !this.moves;
  }

  /** True when the change, `t` seconds in, is over. */
  update(t: number): boolean {
    return t >= this.duration;
  }

  dispose() {
    for (const o of this.group.children) {
      const g = (o as THREE.Mesh).geometry;
      // a borrowed model's positions, normals and colours are not ours to free
      if (this.borrowed.includes(g)) for (const name of ['position', 'normal', 'color']) g.deleteAttribute(name);
      g.dispose();
    }
  }
}
