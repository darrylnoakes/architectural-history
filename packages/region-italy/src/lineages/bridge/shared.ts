import * as THREE from 'three';
import { P, tint, mix, type Builder, type Vec3 } from '@ah/kit';

/**
 * Local helpers for the bridge. Geometry rules (from the brief): the road runs along Z through the
 * origin; the river flows along X between z = -12 and z = +12. Banks are at y = 0, the water at
 * y = -1.2 and the bed at about y = -2.4. Decks meet the road (y = 0) at z = ±17.
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

/** A straight bar of square section `s` (or [sx, sz]) from p0 to p1. */
export function bar(b: Builder, p0: Vec3, p1: Vec3, s: number | [number, number], color: number): void {
  const [sx, sy] = typeof s === 'number' ? [s, s] : s;
  b.beam(p0, p1, sx, sy, color);
}

/** Slope angle to pass as rot[0] so a box laid at z follows the curve f. */
export function tilt(f: (z: number) => number, z: number): number {
  const e = 0.05;
  return -Math.atan((f(z + e) - f(z - e)) / (2 * e));
}

// ------------------------------------------------------------------ arches

/**
 * round = semicircle; segmental = a shallow arc of one circle meeting the pier at an angle;
 * ellipse = half an ellipse; ammannati = Ammannati's flattened curve at Santa Trinita: it rises
 * almost vertically from the pier, runs very flat, and meets itself at a faint point at the crown.
 */
export type ArchKind = 'round' | 'segmental' | 'ellipse' | 'ammannati';

export interface Opening {
  z0: number;
  z1: number;
  spring: number;
  rise: number;
  kind: ArchKind;
}

/** Intrados of an arch from (z0, spring) over the top to (z1, spring), n + 1 points. */
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
  } else if (kind === 'ammannati') {
    // two quarter-ellipses whose centres are pulled apart a little, so they meet at a faint point
    const d = a * 0.22;
    const A = a + d;
    const B = rise / Math.sqrt(1 - (d / A) * (d / A));
    const tc = Math.acos(-d / A);
    const h = Math.ceil(n / 2);
    for (let i = 0; i <= h; i++) {
      const t = Math.PI + ((tc - Math.PI) * i) / h;
      out.push([cz + d + A * Math.cos(t), spring + B * Math.sin(t)]);
    }
    for (let i = h - 1; i >= 0; i--) {
      const [z, y] = out[i];
      out.push([2 * cz - z, y]);
    }
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

/**
 * The ring of an arch on one face: `blocks` voussoirs of alternating tone, `d` deep, standing
 * `width` thick at x. `from`/`to` (0..1) draw only part of the ring (a broken arch).
 */
export function voussoirs(
  b: Builder,
  op: Opening,
  o: { d: number; width: number; x: number; color: number; blocks?: number; from?: number; to?: number; key?: number },
): void {
  const n = o.blocks ?? 11;
  const c = archCurve(op, n * 2);
  const out = offsetCurve(c, o.d);
  const i0 = Math.round((o.from ?? 0) * n);
  const i1 = Math.round((o.to ?? 1) * n);
  for (let i = i0; i < i1; i++) {
    const k = i * 2;
    const isKey = o.key !== undefined && i === Math.floor(n / 2);
    const pts: ZY[] = [c[k], c[k + 1], c[k + 2], out[k + 2], out[k + 1], out[k]];
    side(b, pts, o.width, isKey ? (o.key as number) : tint(o.color, i % 2 ? 0.025 : -0.02), o.x);
  }
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
  // break points along the underside, from zb back to za
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

/** A pier with pointed cutwaters at both ends, pointing up and down stream (±X). */
export function cutwaterPier(
  b: Builder,
  o: { z: number; len: number; thick: number; y0: number; h: number; color: number; nose?: number; capColor?: number; cap?: number; x?: number },
): void {
  const nose = o.nose ?? o.thick * 0.8;
  const L = o.len / 2;
  const t = o.thick / 2;
  const plan: [number, number][] = [
    [-L - nose, 0],
    [-L, -t],
    [L, -t],
    [L + nose, 0],
    [L, t],
    [-L, t],
  ];
  b.group({ at: [o.x ?? 0, o.y0, o.z], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(plan, o.h, o.color, { at: [0, 0, o.h / 2] });
  });
  if (o.cap) {
    const c = o.cap;
    const capPlan: [number, number][] = [
      [-L - nose - c, 0],
      [-L - c * 0.4, -t - c],
      [L + c * 0.4, -t - c],
      [L + nose + c, 0],
      [L + c * 0.4, t + c],
      [-L - c * 0.4, t + c],
    ];
    b.group({ at: [o.x ?? 0, o.y0 + o.h, o.z], rot: [-Math.PI / 2, 0, 0] }, () => {
      b.extrude(capPlan, 0.22, o.capColor ?? o.color, { at: [0, 0, 0.11] });
    });
  }
}

/**
 * The sloping stone hood on top of a cutwater: a three-sided pyramid whose back leans on the
 * bridge face at x (sign gives the side), rising h from y over a cutwater of the given thickness.
 */
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

// ------------------------------------------------------------------ the Roman bridge

export interface RomanBridge {
  f: (z: number) => number;
  ops: Opening[];
  piers: number[];
  pierT: number;
  W: number;
}

/** The Roman layout: five round arches, the middle one largest, piers 1.5 m thick. */
export function romanLayout(): RomanBridge {
  const spans = [3.2, 3.5, 3.8, 3.5, 3.2];
  const pierT = 1.5;
  const spring = -1.35;
  const ops: Opening[] = [];
  const piers: number[] = [];
  let z = -(spans.reduce((a, s) => a + s, 0) + pierT * (spans.length - 1)) / 2;
  spans.forEach((s, i) => {
    ops.push({ z0: z, z1: z + s, spring, rise: s / 2, kind: 'round' });
    z += s;
    if (i < spans.length - 1) {
      piers.push(z + pierT / 2);
      z += pierT;
    }
  });
  return { f: hump(1.15), ops, piers, pierT, W: 6.2 };
}

/**
 * The Roman stone bridge: a tufa core faced in travertine, five round arches on piers with
 * cutwaters, a small flood arch through each pier, low parapets.
 *  - broken: index of an arch cut away (the Gothic War), leaving stubs at each pier;
 *  - repaired: index of an arch rebuilt in rubble and brick (the medieval repair);
 *  - aged: weathering and patching for the later stages.
 */
export function romanBridge(b: Builder, o: { broken?: number; repaired?: number; aged?: number } = {}): RomanBridge {
  const L = romanLayout();
  const { f, ops, piers, pierT, W } = L;
  const aged = o.aged ?? 0;
  const trav = mix(P.travertine, P.rubble, aged * 0.35);
  const tufa = mix(P.tufa, P.rubble, aged * 0.2);
  const ring = tint(trav, 0.04);
  const top = (z: number) => f(z) - 0.16;

  // flood openings through the pier spandrels
  const flood = (z: number): ZY[] => {
    const w = 0.72;
    const y0 = -0.55;
    const hs = 0.5;
    const pts: ZY[] = [[z - w / 2, y0], [z + w / 2, y0]];
    for (let i = 0; i <= 8; i++) {
      const t = (Math.PI * i) / 8;
      pts.push([z + (w / 2) * Math.cos(t), y0 + hs + (w / 2) * Math.sin(t)]);
    }
    return pts;
  };

  // segments of the body (split where an arch is cut)
  type Seg = { za: number; zb: number; holes: ZY[][]; facing: number };
  const segs: Seg[] = [];
  const holesIn = (za: number, zb: number) => piers.filter((z) => z > za && z < zb).map(flood);
  if (o.broken !== undefined) {
    const op = ops[o.broken];
    const ca = op.z0 + 0.7;
    const cb = op.z1 - 0.7;
    segs.push({ za: -END, zb: ca, holes: holesIn(-END, ca), facing: trav });
    segs.push({ za: cb, zb: END, holes: holesIn(cb, END), facing: trav });
  } else if (o.repaired !== undefined) {
    const op = ops[o.repaired];
    const ca = op.z0 - 0.35;
    const cb = op.z1 + 0.35;
    segs.push({ za: -END, zb: ca, holes: holesIn(-END, ca), facing: trav });
    segs.push({ za: ca, zb: cb, holes: [], facing: mix(P.rubble, P.tufa, 0.3) });
    segs.push({ za: cb, zb: END, holes: holesIn(cb, END), facing: trav });
  } else {
    segs.push({ za: -END, zb: END, holes: piers.map(flood), facing: trav });
  }
  for (const s of segs) {
    const pts = bodyOutline({ za: s.za, zb: s.zb, top, openings: ops });
    side(b, pts, W - 0.1, tufa, 0, s.holes);
    // travertine facing on both faces
    b.sym((k) => side(b, pts, 0.06, s.facing, k * (W / 2 - 0.02), s.holes));
  }

  // voussoir rings on both faces
  b.sym((k) => {
    ops.forEach((op, i) => {
      const x = k * (W / 2 + 0.03);
      const d = Math.min(0.5, f((op.z0 + op.z1) / 2) - 0.2 - (op.spring + op.rise));
      if (i === o.broken) {
        voussoirs(b, op, { d, width: 0.1, x, color: ring, to: 0.18 });
        voussoirs(b, op, { d, width: 0.1, x, color: ring, from: 0.82 });
      } else if (i === o.repaired) {
        voussoirs(b, op, { d: d * 0.8, width: 0.1, x, color: P.brickRed, blocks: 15 });
      } else {
        voussoirs(b, op, { d, width: 0.1, x, color: ring });
      }
    });
    // flood-arch rings
    for (const z of piers) {
      const fo: Opening = { z0: z - 0.36, z1: z + 0.36, spring: -0.05, rise: 0.36, kind: 'round' };
      voussoirs(b, fo, { d: 0.2, width: 0.08, x: k * (W / 2 + 0.03), color: ring, blocks: 5 });
    }
  });

  // pier cutwaters, up and down stream, up to just above flood level
  for (const z of piers) {
    cutwaterPier(b, { z, len: W, thick: pierT, nose: 1.1, y0: FOOT, h: -0.75 - FOOT, color: trav, cap: 0.08, capColor: ring });
  }

  // cornice, road and parapets
  if (o.broken === undefined) {
    band(b, 0, W - 0.9, -END, END, (z) => f(z) - 0.17, (z) => f(z) + 0.01, mix(P.peperino, P.gravel, 0.35 + aged * 0.3), 34);
  }
  b.sym((k) => {
    const x = k * (W / 2 - 0.22);
    const runs: [number, number][] =
      o.broken !== undefined
        ? [
            [-END + 0.4, ops[o.broken].z0 + 0.6],
            [ops[o.broken].z1 - 0.6, END - 0.4],
          ]
        : [[-END + 0.4, END - 0.4]];
    for (const [za, zb] of runs) {
      band(b, x, 0.44, za, zb, (z) => f(z) - 0.17, (z) => f(z) + 0.85 - aged * 0.15, trav, 24);
      band(b, x, 0.54, za, zb, (z) => f(z) + 0.85 - aged * 0.15, (z) => f(z) + 0.95 - aged * 0.15, ring, 24);
      // cornice under the parapet
      band(b, k * (W / 2 + 0.05), 0.14, za, zb, (z) => f(z) - 0.32, (z) => f(z) - 0.16, ring, 24);
    }
  });
  return L;
}

// ------------------------------------------------------------------ the Renaissance bridge

export interface TrinitaBridge {
  f: (z: number) => number;
  ops: Opening[];
  piers: number[];
  pierT: number;
  W: number;
}

export function trinitaLayout(): TrinitaBridge {
  const pierT = 1.8;
  const spans = [6.5, 7.0, 6.5];
  const spring = -1.25;
  const ops: Opening[] = [];
  const piers: number[] = [];
  let z = -(spans.reduce((a, s) => a + s, 0) + pierT * 2) / 2;
  spans.forEach((s, i) => {
    ops.push({ z0: z, z1: z + s, spring, rise: i === 1 ? 1.75 : 1.62, kind: 'ammannati' });
    z += s;
    if (i < spans.length - 1) {
      piers.push(z + pierT / 2);
      z += pierT;
    }
  });
  return { f: hump(1.15), ops, piers, pierT, W: 7.6 };
}

/** A standing statue on a pedestal (the Four Seasons at Santa Trinita). */
export function statue(b: Builder, at: Vec3, color: number, rotY = 0, head = true): void {
  b.group({ at, rotY }, () => {
    const ped = tint(color, -0.06);
    b.box(0.9, 1.15, 0.9, ped);
    b.box(1.05, 0.12, 1.05, ped, { at: [0, 1.15, 0] });
    b.box(1.05, 0.1, 1.05, ped, { at: [0, 0, 0] });
    // the figure: draped body, a turned torso, an arm holding an attribute
    b.cyl(0.32, 1.1, color, { at: [0, 1.27, 0], rTop: 0.22, segs: 7 });
    b.cyl(0.2, 0.45, color, { at: [0.02, 2.37, 0], rTop: 0.17, segs: 7 });
    if (head) b.sphere(0.14, color, { at: [0.03, 2.95, 0], segs: 7 });
    b.beam([0.15, 2.7, 0.05], [0.42, 2.35, 0.2], 0.11, 0.11, color);
    b.blob(0.17, color, { at: [0.45, 2.3, 0.22], detail: 0 });
  });
}

/**
 * Ammannati's bridge: three flattened arches, piers with pointed cutwaters, a moulded cornice,
 * a parapet and statues on the four corners.
 *  - fresh: the 1958 rebuilding (cleaner stone, some darker blocks dredged from the river, modern lamps).
 */
export function trinitaBridge(b: Builder, o: { rebuilt?: boolean } = {}): TrinitaBridge {
  const L = trinitaLayout();
  const { f, ops, piers, pierT, W } = L;
  const stone = o.rebuilt ? tint(P.pietraForte, 0.06) : P.pietraForte;
  const dress = tint(stone, 0.1);
  const marble = P.marble;
  const top = (z: number) => f(z) - 0.12;

  const pts = bodyOutline({ za: -END, zb: END, top, openings: ops });
  side(b, pts, W, stone);
  // fine-jointed arch rings, flush but a shade lighter, with a carved cartouche at each crown
  b.sym((k) => {
    for (const op of ops) {
      const d = Math.max(0.22, Math.min(0.42, f((op.z0 + op.z1) / 2) - 0.45 - (op.spring + op.rise)));
      voussoirs(b, op, { d, width: 0.06, x: k * (W / 2 + 0.01), color: dress, blocks: 15 });
      const zc = (op.z0 + op.z1) / 2;
      const yc = op.spring + op.rise;
      // cartouche hiding the meeting point of the two curves
      b.group({ at: [k * (W / 2 + 0.06), yc - 0.25, zc], rotY: k > 0 ? Math.PI / 2 : -Math.PI / 2 }, () => {
        b.extrude(
          [
            [-0.32, 0.25],
            [-0.2, 0.0],
            [0, -0.12],
            [0.2, 0.0],
            [0.32, 0.25],
            [0.26, 0.55],
            [0, 0.7],
            [-0.26, 0.55],
          ],
          0.14,
          marble,
        );
      });
    }
    // where the old stone was dredged up: a few darker blocks in the rebuilt spandrels
    if (o.rebuilt) {
      for (let i = 0; i < 14; i++) {
        const z = b.range(-11, 11);
        const y = b.range(-0.6, f(z) - 0.6);
        let ok = true;
        for (const op of ops) if (z > op.z0 - 0.2 && z < op.z1 + 0.2 && y < op.spring + op.rise + 0.5) ok = false;
        if (ok) b.box(0.05, 0.3, b.range(0.5, 0.9), tint(P.pietraForte, -0.12), { at: [k * (W / 2 + 0.01), y, z] });
      }
    }
  });

  // pointed cutwaters both sides, carried up nearly to the cornice and capped
  const capY = -0.05;
  for (const z of piers) {
    cutwaterPier(b, { z, len: W, thick: pierT, nose: 1.5, y0: FOOT, h: capY - FOOT, color: stone, cap: 0.08, capColor: dress });
    // a sloping stone hood over each cutwater
    b.sym((k) => cutwaterHood(b, { x: k * (W / 2), z, thick: pierT + 0.16, nose: 1.58, y: capY + 0.22, h: f(z) - 0.42 - capY - 0.22, color: dress }));
  }

  // cornice, roadway, parapet
  b.sym((k) => {
    band(b, k * (W / 2 + 0.06), 0.18, -END + 0.2, END - 0.2, (z) => f(z) - 0.42, (z) => f(z) - 0.12, dress, 34);
    const x = k * (W / 2 - 0.25);
    band(b, x, 0.46, -END + 1.4, END - 1.4, (z) => f(z) - 0.12, (z) => f(z) + 0.8, stone, 30);
    band(b, x, 0.58, -END + 1.4, END - 1.4, (z) => f(z) + 0.8, (z) => f(z) + 0.92, dress, 30);
    // the four statues of the Seasons on the corners, facing the roadway
    b.sym((t) => {
      const z = t * (END - 0.7);
      statue(b, [x, f(z) - 0.12, z], marble, k > 0 ? -Math.PI / 2 : Math.PI / 2);
    });
  });
  const road = o.rebuilt ? P.asphalt : mix(P.pietraForte, P.gravel, 0.5);
  band(b, 0, W - 0.9, -END, END, (z) => f(z) - 0.14, (z) => f(z) + 0.01, road, 34);
  if (o.rebuilt) {
    // kerbed pavements each side
    b.sym((k) => band(b, k * (W / 2 - 0.85), 0.7, -END + 1.4, END - 1.4, (z) => f(z), (z) => f(z) + 0.14, P.pietraSerena, 30));
  }
  void pierT;
  return L;
}
