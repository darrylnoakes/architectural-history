import * as THREE from 'three';
import { P, facingAngle, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/*
 * Local helpers for the faubourg lineage. The plot is 26 m along the road (X) by 16 m deep (Z);
 * the road is at +Z (z = +8).
 */

export const PW = 26;
export const PD = 16;
export const HX = PW / 2;
export const HZ = PD / 2;
export const DEG = Math.PI / 180;

/** A low flat patch of ground (yard, garden bed, paving), slightly raised to avoid z-fighting. */
export function patch(b: Builder, w: number, d: number, color: number, at: [number, number], y = 0.03): void {
  b.box(w, y, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: { mat?: 'matte' | 'glass' }): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { mat: o?.mat, jitter: false });
}

/** Push a quad (a, b, c, d in order round its edge) as two triangles. */
export function quad(out: number[], a: number[], b: number[], c: number[], d: number[]): void {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/**
 * Flat rectangles on a wall, all in one cheap mesh: windows, panel joints, spandrels. `rects` are
 * [u, y, w, h] with u along the wall (to the right as you face it) and y the bottom. The wall is the
 * plane through `at` facing `facing`; the rectangles stand `push` proud of it.
 */
export function wallRects(b: Builder, rects: [number, number, number, number][], color: number, at: Vec3, facing: Facing, push = 0.04, mat?: 'matte' | 'glass'): void {
  const a = facingAngle(facing);
  const c = Math.cos(a);
  const s = Math.sin(a);
  // local x (along the wall) is (c, 0, -s); out of the wall is (s, 0, c)
  const P3 = (u: number, y: number): number[] => [at[0] + u * c + push * s, y, at[2] - u * s + push * c];
  const out: number[] = [];
  for (const [u, y, w, h] of rects) quad(out, P3(u - w / 2, y), P3(u + w / 2, y), P3(u + w / 2, y + h), P3(u - w / 2, y + h));
  soup(b, out, color, { mat });
}

/** A thatched roof: a thick gable or hip of thatch with a darker ridge roll. `at` is the wall-top centre. */
export function thatchRoof(b: Builder, w: number, d: number, deg: number, color: number, o: { at: Vec3; hip?: boolean; ridge?: 'x' | 'z'; ov?: number; wall?: number }): number {
  const alongX = (o.ridge ?? 'x') === 'x';
  const span = alongX ? d : w;
  const h = (span / 2) * Math.tan(deg * DEG);
  const ov = o.ov ?? 0.5;
  if (o.hip) {
    b.hip(w + ov * 2, d + ov * 2, h + ov * Math.tan(deg * DEG), color, { at: [o.at[0], o.at[1] - ov * Math.tan(deg * DEG) * 0.9, o.at[2]] });
  } else {
    b.gable(w, d, h, color, { at: o.at, ridge: o.ridge, overhang: ov, thick: 0.4, wall: o.wall });
  }
  // ridge roll
  const top = o.at[1] + h + (o.hip ? 0 : 0.42);
  const run = (alongX ? w : d) + (o.hip ? -(span - 0.4) : ov * 2);
  if (run > 0.3) {
    b.log(0.2, run, tint(color, -0.12), { at: [o.at[0], top - 0.28, o.at[2]], axis: alongX ? 'x' : 'z', segs: 6 });
  }
  return h;
}

/**
 * A pitched roof of flat clay tiles (or slate) with a thin ridge: a gable `deg` degrees steep over
 * w × d. `at` is the wall-top centre. Returns the rise.
 */
export function tileRoof(
  b: Builder,
  w: number,
  d: number,
  deg: number,
  color: number,
  o: { at: Vec3; ridge?: 'x' | 'z'; ov?: number; wall?: number; ribs?: number; thick?: number },
): number {
  const alongX = (o.ridge ?? 'x') === 'x';
  const span = alongX ? d : w;
  const run = alongX ? w : d;
  const half = span / 2;
  const h = half * Math.tan(deg * DEG);
  const ov = o.ov ?? 0.35;
  const thick = o.thick ?? 0.12;
  b.gable(w, d, h, color, { at: o.at, ridge: o.ridge, overhang: ov, thick, wall: o.wall });
  const tv = (thick * Math.hypot(half, h)) / half;
  const top = o.at[1] + h + tv;
  b.group({ at: [o.at[0], 0, o.at[2]], rotY: alongX ? 0 : Math.PI / 2 }, () => {
    b.box(run + ov * 2 + 0.04, 0.12, 0.22, tint(color, -0.08), { at: [0, top - 0.08, 0] });
    // the raised courses of round cover tiles of a Roman roof (imbrices), if asked
    const rib = o.ribs ?? 0;
    if (rib > 0) {
      const drop = (ov * h) / half;
      const L = run + ov * 2;
      const n = Math.floor((L - 0.2) / rib);
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + 0.1 + ((L - 0.2) * i) / n;
        for (const s of [-1, 1]) {
          b.beam([x, o.at[1] - drop + tv + 0.02, s * (half + ov)], [x, top - 0.02, s * 0.1], 0.1, 0.07, tint(color, 0.05), { jitter: false });
        }
      }
    }
  });
  return h;
}

/** A run of wattle hurdles (woven fence panels) with stakes, from p0 to p1 on the ground. */
export function hurdles(b: Builder, p0: [number, number], p1: [number, number], o: { h?: number; color?: number } = {}): void {
  const h = o.h ?? 1.0;
  const color = o.color ?? P.wattle;
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const n = Math.max(1, Math.round(len / 1.8));
  b.group({ at: [(p0[0] + p1[0]) / 2, 0, (p0[1] + p1[1]) / 2], rotY: Math.atan2(-dz, dx) }, () => {
    b.box(len, h * 0.85, 0.07, color, { at: [0, 0.08, 0] });
    for (let i = 0; i <= n; i++) b.box(0.09, h, 0.09, P.oak, { at: [-len / 2 + (len * i) / n, 0, 0] });
  });
}

/** A paling fence (pales on two rails) from p0 to p1. */
export function paling(b: Builder, p0: [number, number], p1: [number, number], o: { h?: number; color?: number; gap?: number } = {}): void {
  const h = o.h ?? 1.0;
  const color = o.color ?? P.oakSilver;
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const n = Math.max(1, Math.round(len / (o.gap ?? 0.35)));
  b.group({ at: [(p0[0] + p1[0]) / 2, 0, (p0[1] + p1[1]) / 2], rotY: Math.atan2(-dz, dx) }, () => {
    for (const y of [0.25, h - 0.2]) b.box(len, 0.07, 0.04, tint(color, -0.1), { at: [0, y, -0.03], jitter: false });
    const out: number[] = [];
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + (len * i) / n;
      quad(out, [x - 0.05, 0, 0], [x + 0.05, 0, 0], [x + 0.05, h, 0], [x - 0.05, h, 0]);
    }
    soup(b, out, color);
  });
}

/** Rows of vegetables in a garden bed: low green ridges along X. */
export function vegBed(b: Builder, w: number, d: number, at: [number, number], o: { rows?: number; color?: number } = {}): void {
  patch(b, w, d, P.soil, at, 0.06);
  const n = o.rows ?? Math.max(2, Math.round(d / 0.6));
  for (let i = 0; i < n; i++) {
    const z = at[1] - d / 2 + (d * (i + 0.5)) / n;
    b.box(w - 0.4, 0.22, 0.25, o.color ?? (i % 3 === 2 ? P.leafAutumn : P.leaf), { at: [at[0], 0.06, z] });
  }
}

/** A storage pit with a clay lip, its lid of wicker and daub half pulled aside. */
export function storagePit(b: Builder, x: number, z: number, r = 0.6): void {
  b.cyl(r + 0.18, 0.1, P.mud, { at: [x, 0, z], segs: 9 });
  b.cyl(r, 0.02, P.timberBlack, { at: [x, 0.1, z], segs: 9 });
  b.cyl(r + 0.05, 0.08, P.wattle, { at: [x + r * 0.7, 0.1, z + r * 0.3], segs: 8 });
}

/** A raised granary: a wattle box on four or six posts under a small thatched or shingled roof. */
export function granary(b: Builder, x: number, z: number, w: number, d: number, roof: number, o: { rotY?: number; posts?: number } = {}): void {
  b.group({ at: [x, 0, z], rotY: o.rotY ?? 0 }, () => {
    const lift = 1.1;
    const n = o.posts ?? 4;
    const pts: [number, number][] = n === 6
      ? [[-w / 2 + 0.15, -d / 2 + 0.15], [0, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [0, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]
      : [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]];
    for (const [px, pz] of pts) b.cyl(0.11, lift + 0.1, P.oak, { at: [px, 0, pz], segs: 5 });
    b.box(w + 0.2, 0.15, d + 0.2, P.oak, { at: [0, lift, 0] });
    b.box(w, 1.3, d, P.wattle, { at: [0, lift + 0.15, 0] });
    b.panel(0.6, 0.8, P.oakDark, { at: [0, lift + 0.3, d / 2], facing: '+z', depth: 0.04 });
    // a notched log ladder up to the hatch
    b.beam([0.1, 0, d / 2 + 1.0], [0.1, lift + 0.15, d / 2 + 0.1], 0.16, 0.16, P.oakDark);
    thatchRoof(b, w, d, 50, roof, { at: [0, lift + 1.45, 0], ov: 0.35 });
  });
}

/** A rough heap of stuff (firewood, dung, manure, sand): a squashed blob. */
export function heap(b: Builder, x: number, z: number, r: number, color: number): void {
  b.blob(r, color, { at: [x, 0, z], stretch: [1.4, 0.5, 1], detail: 0 });
}

/** A washing line from p0 to p1 with `n` garments pegged on it. */
export function washing(b: Builder, p0: Vec3, p1: Vec3, n: number): void {
  b.beam(p0, p1, 0.02, 0.02, P.oakSilver, { jitter: false });
  const cols = [P.white, P.cream, P.doorBlue, P.pinkWash, P.limewash, P.voletBleu, P.white, P.cladRed];
  const yaw = Math.atan2(-(p1[2] - p0[2]), p1[0] - p0[0]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.6) / (n + 0.2);
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    const w = b.range(0.4, 0.75);
    const h = b.range(0.45, 0.85);
    b.box(w, h, 0.03, b.pick(cols), { at: [x, y - h, z], rotY: yaw });
  }
}

/** An iron railing from p0 to p1 (top rail, bottom rail, uprights every `gap` metres), `h` tall. */
export function railing(b: Builder, p0: Vec3, p1: Vec3, h = 1.0, color: number = P.iron, gap = 0.15): void {
  const len = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
  const n = Math.max(1, Math.round(len / gap));
  b.beam([p0[0], p0[1] + h, p0[2]], [p1[0], p1[1] + h, p1[2]], 0.05, 0.05, color, { jitter: false });
  b.beam([p0[0], p0[1] + 0.1, p0[2]], [p1[0], p1[1] + 0.1, p1[2]], 0.03, 0.03, color, { jitter: false });
  const out: number[] = [];
  const dx = (p1[0] - p0[0]) / len;
  const dz = (p1[2] - p0[2]) / len;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    quad(out, [x - dx * 0.015, y, z - dz * 0.015], [x + dx * 0.015, y, z + dz * 0.015], [x + dx * 0.015, y + h, z + dz * 0.015], [x - dx * 0.015, y + h, z - dz * 0.015]);
  }
  soup(b, out, color);
}

/** A cast-iron hand pump on a stone slab with a trough. */
export function pump(b: Builder, x: number, z: number, rotY = 0): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    b.box(1.2, 0.12, 1.0, P.paving, { jitter: false });
    b.cyl(0.13, 1.25, P.castIron, { at: [0, 0.12, -0.2], segs: 8 });
    b.cyl(0.17, 0.12, P.castIron, { at: [0, 1.37, -0.2], segs: 8 });
    b.beam([0, 1.1, -0.05], [0, 1.0, 0.25], 0.06, 0.06, P.castIron); // spout
    b.beam([0, 1.45, -0.2], [0.05, 1.7, -0.75], 0.05, 0.05, P.castIron); // handle
    b.box(0.8, 0.4, 0.45, tint(P.paving, -0.1), { at: [0, 0.12, 0.25] });
  });
}

/** A stone well with a timber windlass under a little roof. */
export function well(b: Builder, x: number, z: number, stone: number, roof: number): void {
  b.cyl(0.75, 0.85, stone, { at: [x, 0, z], segs: 10 });
  b.cyl(0.58, 0.02, P.windowDark, { at: [x, 0.85, z], segs: 10 });
  for (const s of [-1, 1]) b.box(0.14, 2.0, 0.14, P.oak, { at: [x + s * 0.72, 0.4, z] });
  b.log(0.12, 1.4, P.oak, { at: [x, 1.45, z], segs: 6 });
  b.beam([x + 0.72, 1.57, z], [x + 0.95, 1.57, z + 0.25], 0.05, 0.05, P.oakDark);
  b.gable(1.7, 1.2, 0.6, roof, { at: [x, 2.35, z], overhang: 0.08, thick: 0.08 });
  b.cyl(0.14, 0.26, P.oakDark, { at: [x + 0.4, 0.85, z + 0.45], segs: 6 });
}
