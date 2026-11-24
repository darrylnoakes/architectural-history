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

interface Moving {
  mesh: THREE.Mesh;
  /** Where each vertex belongs, the point it grows from, and when its piece starts to move. */
  base: Float32Array;
  pivot: Float32Array;
  start: Float32Array;
  grow: boolean;
}

const LEAVE = 0.22;
const ARRIVE = 0.32;

function meshOf(b: Built, kind: MatKind): THREE.Mesh | undefined {
  return b.object.children.find((c) => c.userData.kind === kind) as THREE.Mesh | undefined;
}

/** A mesh holding just the given pieces of a model, copied out of its merged mesh. */
function subset(b: Built, kind: MatKind, parts: Part[]): THREE.Mesh | null {
  const src = meshOf(b, kind);
  const list = parts.filter((p) => p.kind === kind);
  if (!src || !list.length) return null;
  const n = list.reduce((a, p) => a + p.count, 0);
  const g = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'color']) {
    const from = src.geometry.attributes[name]?.array as Float32Array | undefined;
    if (!from) continue;
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
  return mesh;
}

function easeOutBack(t: number) {
  const c1 = 1.1;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * One model turning into another in place: the pieces they share stand still, the pieces that go
 * shrink away from the top down, and the new pieces grow where they belong from the bottom up. A
 * building going up on an empty plot, or coming down, is the same thing with nothing shared.
 */
export class Morph {
  readonly group = new THREE.Group();
  readonly duration: number;
  private moving: Moving[] = [];

  constructor(prev: Built | null, next: Built | null, d: Diff) {
    const gap = d.leaving.length ? LEAVE + 0.12 : 0;
    let end = 0;
    for (const kind of ['matte', 'glass'] as MatKind[]) {
      if (next) {
        const still = subset(next, kind, d.kept);
        if (still) this.group.add(still);
      }
      for (const [built, parts, grow] of [
        [prev, d.leaving, false],
        [next, d.arriving, true],
      ] as [Built | null, Part[], boolean][]) {
        if (!built) continue;
        const mesh = subset(built, kind, parts);
        if (!mesh) continue;
        const list = parts.filter((p) => p.kind === kind);
        const lo = Math.min(...parts.map((p) => p.y0));
        const hi = Math.max(...parts.map((p) => p.y1));
        const span = Math.max(0.5, hi - lo);
        const n = mesh.geometry.attributes.position.count;
        const pivot = new Float32Array(n * 3);
        const start = new Float32Array(n);
        let k = 0;
        for (const p of list) {
          // the new go up from the ground; the old come down from the top
          const t = grow ? gap + 0.34 * ((p.y0 - lo) / span) : 0.16 * (1 - (p.y1 - lo) / span);
          end = Math.max(end, t + (grow ? ARRIVE : LEAVE));
          for (let i = 0; i < p.count; i++, k++) {
            pivot[k * 3] = p.cx;
            pivot[k * 3 + 1] = p.y0;
            pivot[k * 3 + 2] = p.cz;
            start[k] = t;
          }
        }
        this.moving.push({ mesh, base: Float32Array.from(mesh.geometry.attributes.position.array as Float32Array), pivot, start, grow });
        this.group.add(mesh);
      }
    }
    this.duration = end;
    this.update(0);
  }

  /** Whether anything actually moves (two forms of a building can be piece for piece the same). */
  get idle(): boolean {
    return this.moving.length === 0;
  }

  /** Move the pieces to where they are `t` seconds in. Returns true when it is over. */
  update(t: number): boolean {
    for (const m of this.moving) {
      const pos = m.mesh.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const dur = m.grow ? ARRIVE : LEAVE;
      let last = NaN;
      let s = 0;
      for (let i = 0; i < m.start.length; i++) {
        if (m.start[i] !== last) {
          last = m.start[i];
          const k = Math.min(1, Math.max(0, (t - last) / dur));
          s = m.grow ? (k <= 0 ? 0 : easeOutBack(k)) : 1 - k * k;
        }
        const j = i * 3;
        arr[j] = m.pivot[j] + (m.base[j] - m.pivot[j]) * s;
        arr[j + 1] = m.pivot[j + 1] + (m.base[j + 1] - m.pivot[j + 1]) * s;
        arr[j + 2] = m.pivot[j + 2] + (m.base[j + 2] - m.pivot[j + 2]) * s;
      }
      pos.needsUpdate = true;
    }
    return t >= this.duration;
  }

  dispose() {
    this.group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
  }
}
