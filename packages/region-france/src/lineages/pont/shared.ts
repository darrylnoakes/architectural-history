import * as THREE from 'three';
import { tint, type Builder, type Vec3 } from '@ah/kit';

/**
 * Local helpers for Le Pont. Geometry rules (from the brief): the road runs along Z through the
 * origin; the river flows along X between z = -12 and z = +12 (upstream is taken to be -X). Banks are
 * at y = 0, the water at y = -1.2 and the bed at about y = -2.4. Decks meet the road (y = 0) at z = ±17.
 */
export const BANK = 12;
export const END = 17;
export const WATER = -1.2;
export const BED = -2.4;
/** Foundations go a little below the bed so nothing shows a gap. */
export const FOOT = BED - 0.15;

export type ZY = [number, number];

/** Height of the walkable hump used by `b.deck(w, 34, crown, { yEnds: 0 })`. */
export function hump(crown: number, half = END): (z: number) => number {
  return (z) => crown * (1 - (z / half) * (z / half));
}

/** n + 1 evenly spaced values from a to b. */
export function steps(n: number, a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  return out;
}

/**
 * Extrude a profile drawn in the bridge elevation (Z along the road, Y up) across the river
 * direction: the solid is `width` thick along X, centred on `x`.
 */
export function side(b: Builder, pts: ZY[], width: number, color: number, x = 0, holes?: ZY[][], mat?: 'matte' | 'glass'): void {
  b.extrude(
    pts.map(([z, y]) => [-z, y] as [number, number]),
    width,
    color,
    { at: [x, 0, 0], rotY: Math.PI / 2, holes: holes?.map((h) => h.map(([z, y]) => [-z, y] as [number, number])), mat },
  );
}

/** A band between two curves lo(z) and hi(z) from z0 to z1, extruded `width` along X at `x`. */
export function band(
  b: Builder,
  x: number,
  width: number,
  z0: number,
  z1: number,
  lo: (z: number) => number,
  hi: (z: number) => number,
  color: number,
  n = 12,
  mat?: 'matte' | 'glass',
): void {
  const zs = steps(n, z0, z1);
  const pts: ZY[] = [...zs.map((z) => [z, hi(z)] as ZY), ...zs.reverse().map((z) => [z, lo(z)] as ZY)];
  side(b, pts, width, color, x, undefined, mat);
}

/** A straight bar of square section `s` (or [sx, sy]) from p0 to p1. */
export function bar(b: Builder, p0: Vec3, p1: Vec3, s: number | [number, number], color: number): void {
  const [sx, sy] = typeof s === 'number' ? [s, s] : s;
  b.beam(p0, p1, sx, sy, color);
}

/** A round tube of radius r from p0 to p1 (cables, rods, tubes). */
export function tube(b: Builder, p0: Vec3, p1: Vec3, r: number, color: number, segs = 6): void {
  const a = new THREE.Vector3(...p0);
  const c = new THREE.Vector3(...p1);
  const d = c.clone().sub(a);
  const len = d.length();
  if (len < 1e-4) return;
  const g = new THREE.CylinderGeometry(r, r, len, segs, 1, true);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  const m = a.clone().add(c).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  b.add(g, color);
}

/** Slope angle to pass as rot[0] so a box laid at z follows the curve f. */
export function tilt(f: (z: number) => number, z: number): number {
  const e = 0.05;
  return -Math.atan((f(z + e) - f(z - e)) / (2 * e));
}

// ------------------------------------------------------------------ arches

/**
 * round = semicircle; segmental = a shallow arc of one circle meeting the pier at an angle;
 * ellipse = half an ellipse (a basket-handle arch, anse de panier); pointed = two arcs meeting at a
 * point at the crown (their centres below the springing when the arch is lower than a half-circle,
 * so it meets the pier at an angle, as on most medieval bridges).
 */
export type ArchKind = 'round' | 'segmental' | 'ellipse' | 'pointed';

export interface Opening {
  z0: number;
  z1: number;
  spring: number;
  rise: number;
  kind: ArchKind;
}

/** Intrados of an arch from (z0, spring) over the top to (z1, spring). */
export function archCurve(op: Opening, n = 12): ZY[] {
  const { z0, z1, spring, rise, kind } = op;
  const a = (z1 - z0) / 2;
  const cz = (z0 + z1) / 2;
  const out: ZY[] = [];
  if (kind === 'ellipse') {
    for (let i = 0; i <= n; i++) {
      const t = Math.PI - (Math.PI * i) / n;
      out.push([cz + a * Math.cos(t), spring + rise * Math.sin(t)]);
    }
  } else if (kind === 'pointed') {
    const e = a * 0.3;
    const A = a + e;
    const D = (e * e + rise * rise - A * A) / (2 * rise);
    const h = Math.ceil(n / 2);
    const zc = cz + e;
    if (D <= 0) {
      const yc = spring + D;
      const R = Math.hypot(A, D);
      const t0 = Math.atan2(spring - yc, z0 - zc);
      const t1 = Math.atan2(spring + rise - yc, cz - zc);
      for (let i = 0; i <= h; i++) {
        const t = t0 + ((t1 - t0) * i) / h;
        out.push([zc + R * Math.cos(t), yc + R * Math.sin(t)]);
      }
    } else {
      // taller than a half-circle with these centres: stilt the arch on short upright jambs
      const yc = spring + rise - Math.sqrt(A * A - e * e);
      out.push([z0, spring]);
      const t1 = Math.atan2(spring + rise - yc, cz - zc);
      for (let i = 0; i <= h; i++) {
        const t = Math.PI + ((t1 - Math.PI) * i) / h;
        out.push([zc + A * Math.cos(t), yc + A * Math.sin(t)]);
      }
    }
    for (let i = out.length - 2; i >= 0; i--) out.push([2 * cz - out[i][0], out[i][1]]);
  } else {
    const r = kind === 'round' ? a : rise;
    const R = (a * a + r * r) / (2 * r);
    const cy = spring + r - R;
    const t0 = Math.atan2(spring - cy, z0 - cz);
    const t1 = Math.atan2(spring - cy, z1 - cz);
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      out.push([cz + R * Math.cos(t), cy + R * Math.sin(t)]);
    }
  }
  return out;
}

/** Height of an arch's intrados at z (linear between curve samples). */
export function archY(op: Opening, z: number): number {
  const c = archCurve(op, 48);
  if (z <= c[0][0]) return c[0][1];
  for (let i = 1; i < c.length; i++) {
    if (z <= c[i][0]) {
      const [za, ya] = c[i - 1];
      const [zb, yb] = c[i];
      return ya + ((yb - ya) * (z - za)) / Math.max(1e-6, zb - za);
    }
  }
  return c[c.length - 1][1];
}

/** Offset a curve outward by `d` (along the local normal). */
export function offsetCurve(c: ZY[], d: number): ZY[] {
  return c.map((p, i) => {
    const a = c[Math.max(0, i - 1)];
    const q = c[Math.min(c.length - 1, i + 1)];
    const tz = q[0] - a[0];
    const ty = q[1] - a[1];
    const l = Math.hypot(tz, ty) || 1;
    return [p[0] - (ty / l) * d, p[1] + (tz / l) * d] as ZY;
  });
}

/** The ring of an arch on one face: voussoirs of alternating tone, `d` deep, `width` thick at x. */
export function voussoirs(
  b: Builder,
  op: Opening,
  o: { d: number; width: number; x: number; color: number; blocks?: number; key?: number },
): void {
  const n = o.blocks ?? 11;
  const c = archCurve(op, n * 2);
  const out = offsetCurve(c, o.d);
  const m = Math.floor((c.length - 1) / 2);
  for (let i = 0; i < m; i++) {
    const k = i * 2;
    const isKey = o.key !== undefined && i === Math.floor(m / 2);
    const pts: ZY[] = [c[k], c[k + 1], c[k + 2], out[k + 2], out[k + 1], out[k]];
    side(b, pts, o.width, isKey ? (o.key as number) : tint(o.color, i % 2 ? 0.025 : -0.02), o.x);
  }
}

/** Openings and pier centres for a row of spans centred on the road, piers `pierT` thick. */
export function layout(spans: number[], pierT: number, spring: number | number[], rise: (span: number, i: number) => number, kind: ArchKind): { ops: Opening[]; piers: number[] } {
  const ops: Opening[] = [];
  const piers: number[] = [];
  let z = -(spans.reduce((a, s) => a + s, 0) + pierT * (spans.length - 1)) / 2;
  spans.forEach((s, i) => {
    const sp = typeof spring === 'number' ? spring : spring[i];
    ops.push({ z0: z, z1: z + s, spring: sp, rise: rise(s, i), kind });
    z += s;
    if (i < spans.length - 1) {
      piers.push(z + pierT / 2);
      z += pierT;
    }
  });
  return { ops, piers };
}

// ------------------------------------------------------------------ masonry bodies

/**
 * The outline of a masonry bridge body between za and zb, in elevation: its top follows `top`,
 * its underside sits on the banks (at `base`) beyond ±BANK, goes down to the foundations between,
 * and rises over each arched opening.
 */
export function bodyOutline(o: { za: number; zb: number; top: (z: number) => number; openings: Opening[]; base?: number; foot?: number; n?: number }): ZY[] {
  const base = o.base ?? -0.35;
  const foot = o.foot ?? FOOT;
  const bottom = (z: number): number => {
    if (Math.abs(z) >= BANK) return base;
    for (const op of o.openings) if (z > op.z0 && z < op.z1) return archY(op, z);
    return foot;
  };
  const pts: ZY[] = [];
  for (const z of steps(o.n ?? 34, o.za, o.zb)) pts.push([z, o.top(z)]);
  const brk = new Set<number>([o.za, o.zb, -BANK, BANK]);
  for (const op of o.openings) {
    for (const [z] of archCurve(op, 24)) brk.add(z);
  }
  const zs = [...brk].filter((z) => z >= o.za - 1e-6 && z <= o.zb + 1e-6).sort((p, q) => q - p);
  const e = 1e-4;
  for (const z of zs) {
    const right = z >= o.zb - 1e-6 ? null : bottom(z + e);
    const left = z <= o.za + 1e-6 ? null : bottom(z - e);
    if (right !== null) pts.push([z, right]);
    if (left !== null && (right === null || Math.abs(left - right) > 1e-3)) pts.push([z, left]);
  }
  return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4);
}

/** A prism standing on the ground plane from a plan outline given as [x, z] points. */
export function prism(b: Builder, plan: [number, number][], y0: number, h: number, color: number): void {
  b.group({ at: [0, y0, 0], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(
      plan.map(([x, z]) => [x, -z] as [number, number]),
      h,
      color,
      { at: [0, 0, h / 2] },
    );
  });
}

/**
 * One cutwater against a pier face. `x` is the face it stands against (its sign says which side),
 * `thick` the pier thickness along Z, `len` how far the nose projects. kind: 'point' (a triangle),
 * 'round' (a half-round) or 'square'.
 */
export function cutwater(
  b: Builder,
  o: { x: number; z: number; thick: number; len: number; y0: number; h: number; color: number; kind?: 'point' | 'round' | 'square' },
): void {
  const s = Math.sign(o.x) || 1;
  const t = o.thick / 2;
  const x0 = o.x - s * 0.05;
  const kind = o.kind ?? 'point';
  let plan: [number, number][];
  if (kind === 'point') {
    plan = [[x0, o.z - t], [o.x + s * o.len, o.z], [x0, o.z + t]];
  } else if (kind === 'square') {
    plan = [[x0, o.z - t], [o.x + s * o.len, o.z - t], [o.x + s * o.len, o.z + t], [x0, o.z + t]];
  } else {
    plan = [[x0, o.z - t]];
    for (let i = 1; i < 8; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / 8;
      plan.push([o.x + s * o.len * Math.cos(a), o.z + t * Math.sin(a)]);
    }
    plan.push([x0, o.z + t]);
  }
  prism(b, plan, o.y0, o.h, o.color);
}

/** The sloping stone cap on a pointed cutwater: a three-sided pyramid leaning on the face at x. */
export function cutwaterHood(b: Builder, o: { x: number; z: number; thick: number; nose: number; y: number; h: number; color: number }): void {
  const s = Math.sign(o.x) || 1;
  const t = o.thick / 2;
  const A = [o.x, o.y, o.z - t];
  const B = [o.x + s * o.nose, o.y, o.z];
  const C = [o.x, o.y, o.z + t];
  const D = [o.x, o.y + o.h, o.z];
  const tris = [A, B, D, B, C, D, A, C, B];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
  g.computeVertexNormals();
  b.add(g, o.color);
}

/** A half-cone cap on a round cutwater. */
export function roundHood(b: Builder, o: { x: number; z: number; r: number; y: number; h: number; color: number }): void {
  const s = Math.sign(o.x) || 1;
  b.lathe([[o.r, 0], [0.01, o.h]], o.color, { at: [o.x, o.y, o.z], start: s > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 6 });
}

/** A parapet wall following f between za and zb at x. */
export function parapet(b: Builder, o: { x: number; za: number; zb: number; f: (z: number) => number; lo?: number; h: number; t: number; color: number; cap?: number; n?: number }): void {
  const lo = o.lo ?? -0.1;
  const n = o.n ?? 24;
  band(b, o.x, o.t, o.za, o.zb, (z) => o.f(z) + lo, (z) => o.f(z) + o.h, o.color, n);
  if (o.cap !== undefined) band(b, o.x, o.t + 0.1, o.za, o.zb, (z) => o.f(z) + o.h, (z) => o.f(z) + o.h + 0.1, o.cap, n);
}

/**
 * A stone balustrade along a nearly level deck: a plinth, turned balusters (four-sided, to keep the
 * count down), a coping rail, and a pedestal every `every` balusters.
 */
export function balustrade(b: Builder, o: { x: number; za: number; zb: number; f: (z: number) => number; color: number; pitch?: number; every?: number; h?: number }): void {
  const h = o.h ?? 1.0;
  const pitch = o.pitch ?? 0.42;
  const every = o.every ?? 8;
  const col = o.color;
  const dark = tint(col, -0.05);
  band(b, o.x, 0.42, o.za, o.zb, (z) => o.f(z) - 0.05, (z) => o.f(z) + 0.18, dark, 16);
  band(b, o.x, 0.46, o.za, o.zb, (z) => o.f(z) + h - 0.16, (z) => o.f(z) + h, col, 16);
  const n = Math.round((o.zb - o.za) / pitch);
  const bh = h - 0.34;
  for (let i = 0; i <= n; i++) {
    const z = o.za + (i * (o.zb - o.za)) / n;
    const y = o.f(z) + 0.18;
    if (i % every === 0) {
      b.box(0.44, h - 0.18, 0.44, dark, { at: [o.x, y, z] });
    } else {
      b.lathe(
        [
          [0.07, 0],
          [0.12, bh * 0.3],
          [0.06, bh * 0.75],
          [0.09, bh],
        ],
        col,
        { at: [o.x, y, z], segs: 4, jitter: false },
      );
    }
  }
}

/** A plain iron railing: posts and two rails following f. */
export function railing(b: Builder, o: { x: number; za: number; zb: number; f: (z: number) => number; color: number; h?: number; posts?: number; y0?: number }): void {
  const h = o.h ?? 1.05;
  const y0 = o.y0 ?? 0;
  const zs = steps(o.posts ?? 20, o.za, o.zb);
  for (const z of zs) b.box(0.05, h, 0.05, o.color, { at: [o.x, o.f(z) + y0, z], jitter: false });
  band(b, o.x, 0.07, o.za, o.zb, (z) => o.f(z) + y0 + h - 0.05, (z) => o.f(z) + y0 + h + 0.02, o.color, 24);
  band(b, o.x, 0.04, o.za, o.zb, (z) => o.f(z) + y0 + h * 0.45, (z) => o.f(z) + y0 + h * 0.45 + 0.04, o.color, 24);
}

/** Reeds in a clump at the water's edge. */
export function reeds(b: Builder, x: number, z: number, color: number, n = 5): void {
  for (let k = 0; k < n; k++) {
    b.cone(0.05, b.range(0.9, 1.5), color, { at: [x + b.range(-0.5, 0.5), 0, z + b.range(-0.3, 0.3)], segs: 3 });
  }
}
