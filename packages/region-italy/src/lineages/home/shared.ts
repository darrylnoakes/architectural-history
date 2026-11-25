import * as THREE from 'three';
import { P, tint, facingAngle, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** The street front line of the row houses (the plot runs from z = -9 to +9). */
export const FRONT = 8.4;

// ---------------------------------------------------------------- the back of the plot
// An urban plot kept its boundaries for centuries, so the back garden is closed by the same walls
// from the Roman atrium house to the Baroque palazzetto: built once, here, and called with the same
// numbers by every stage that keeps them, so they stand still while the houses change.

/** Plot width, and the line where the garden walls of the atrium house's hortus begin. */
export const PLOT_W = 13.6;
const YARD_Z0 = -4.4;
const YARD_Z1 = -8.8;
const YARD_H = 2.4;
const YARD_T = 0.4;

/**
 * The walls of the Roman hortus, built with the atrium house: the back wall across the plot and the
 * two side walls from the back of that house (z = -4.4) to it. Every later stage keeps them.
 */
export function gardenWalls(b: Builder, color: number, o: { jitter?: boolean } = {}): void {
  const X = PLOT_W / 2;
  b.box(PLOT_W, YARD_H, YARD_T, color, { at: [0, 0, YARD_Z1 + YARD_T / 2], jitter: o.jitter });
  b.sym((s) => b.box(YARD_T, YARD_H, YARD_Z0 - YARD_Z1, color, { at: [s * (X - YARD_T / 2), 0, (YARD_Z0 + YARD_Z1) / 2], jitter: o.jitter }));
}

/** The side walls carried on from the Roman garden walls to the back of a house standing at `zb`. */
export function gardenWallsTo(b: Builder, zb: number, color: number, o: { h?: number; jitter?: boolean } = {}): void {
  if (zb <= YARD_Z0) return;
  const X = PLOT_W / 2;
  b.sym((s) => b.box(YARD_T, o.h ?? YARD_H, zb - YARD_Z0, color, { at: [s * (X - YARD_T / 2), 0, (zb + YARD_Z0) / 2], jitter: o.jitter }));
}

/** Where the plot's well was dug, under the medieval house; its well-head stays while the houses change. */
export const WELL: Vec3 = [-4.6, 0, -3.6];

/** A plaster colour for a central Italian house front. */
export function plasterPick(b: Builder): number {
  return tint(b.pick([P.intonacoOchre, P.intonacoSienna, P.intonacoRose, P.intonacoCream, P.intonacoOchre]), b.range(-0.03, 0.03));
}

/** A shutter colour: mostly green, some brown or grey. */
export function shutterPick(b: Builder): number {
  return b.pick([P.doorGreen, 0x4f6b4a, 0x5f6f58, P.oakDark, 0x6b5a48, 0x6d7470]);
}

/**
 * Gable roof of clay pan-and-cover tiles (coppi): the kit gable plus the ribs of the cover tiles
 * running down each slope and a ridge of capping tiles. Ridge along X unless `ridge: 'z'`.
 */
export function coppiRoof(
  b: Builder,
  w: number,
  d: number,
  h: number,
  color: number,
  o: { at: Vec3; overhang?: number; ends?: number; wall?: number; thick?: number; step?: number; ridge?: 'x' | 'z'; sides?: (1 | -1)[] },
): void {
  const ov = o.overhang ?? 0.3;
  const oe = o.ends ?? ov; // overhang at the gable ends (0 for a row house between party walls)
  const thick = o.thick ?? 0.14;
  const alongX = (o.ridge ?? 'x') === 'x';
  const span = alongX ? d : w;
  const run = alongX ? w : d;
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = (thick * Math.hypot(half, h)) / half;
  const rot = alongX ? Math.PI / 2 : 0;
  b.extrude(
    [[-half - ov, -drop], [0, h], [half + ov, -drop], [half + ov, -drop + t], [0, h + t], [-half - ov, -drop + t]],
    run + oe * 2,
    color,
    { at: o.at, rotY: rot },
  );
  b.extrude([[-half, 0], [half, 0], [0, h]], run, o.wall ?? color, { at: o.at, rotY: rot });
  const [x0, y0, z0] = o.at;
  const rib = tint(color, -0.06);
  const n = Math.max(2, Math.round((run + oe * 2) / (o.step ?? 0.5)));
  const L = run + oe * 2 - 0.2;
  for (const s of o.sides ?? [1, -1]) {
    for (let i = 0; i < n; i++) {
      const u = -L / 2 + ((i + 0.5) / n) * L;
      const e = half + ov - 0.02;
      const pe: Vec3 = alongX ? [x0 + u, y0 - drop + t + 0.04, z0 + s * e] : [x0 + s * e, y0 - drop + t + 0.04, z0 + u];
      const pr: Vec3 = alongX ? [x0 + u, y0 + h + t + 0.02, z0 + s * 0.05] : [x0 + s * 0.05, y0 + h + t + 0.02, z0 + u];
      b.beam(pe, pr, 0.13, 0.08, rib, { jitter: false });
    }
  }
  const rl = run + oe * 2;
  if (alongX) b.box(rl, 0.14, 0.26, rib, { at: [x0, y0 + h + t - 0.04, z0] });
  else b.box(0.26, 0.14, rl, rib, { at: [x0, y0 + h + t - 0.04, z0] });
}

/** Mono-pitch roof of coppi with ribs; `high` as in b.shed. */
export function coppiShed(
  b: Builder,
  w: number,
  d: number,
  h: number,
  color: number,
  o: { at: Vec3; high?: '+z' | '-z' | '+x' | '-x'; step?: number },
): void {
  const high = o.high ?? '-z';
  b.shed(w, d, h, color, { at: o.at, high });
  const [x0, y0, z0] = o.at;
  const rib = tint(color, -0.06);
  const alongZ = high === '+z' || high === '-z';
  const run = alongZ ? w : d;
  const sgn = high === '+z' || high === '+x' ? 1 : -1;
  const n = Math.max(2, Math.round(run / (o.step ?? 0.5)));
  const span = alongZ ? d : w;
  for (let i = 0; i < n; i++) {
    const u = -run / 2 + ((i + 0.5) / n) * run;
    const lo = -sgn * (span / 2 - 0.02);
    const hi = sgn * (span / 2 - 0.05);
    const pl: Vec3 = alongZ ? [x0 + u, y0 + 0.05, z0 + lo] : [x0 + lo, y0 + 0.05, z0 + u];
    const ph: Vec3 = alongZ ? [x0 + u, y0 + h + 0.03, z0 + hi] : [x0 + hi, y0 + h + 0.03, z0 + u];
    b.beam(pl, ph, 0.12, 0.07, rib, { jitter: false });
  }
}

/** Run fn in the frame of a wall surface: local x along the wall (to the viewer's right), y up, +z out of the wall. */
export function onWall(b: Builder, at: Vec3, facing: Facing, fn: () => void): void {
  b.group({ at, rotY: facingAngle(facing) }, fn);
}

/**
 * A pair of louvred shutters (persiane) folded back either side of a window of w × h whose bottom
 * centre is `at` on the wall. Closed shutters cover the opening instead.
 */
export function persiane(b: Builder, w: number, h: number, at: Vec3, facing: Facing, color: number, o: { closed?: boolean; slats?: number } = {}): void {
  const slat = tint(color, -0.1);
  const n = o.slats ?? Math.max(3, Math.round(h / 0.3));
  onWall(b, at, facing, () => {
    const leaf = (cx: number, lw: number) => {
      b.panel(lw, h, color, { at: [cx, 0, 0.02], depth: 0.05 });
      for (let i = 1; i < n; i++) b.panel(lw - 0.1, 0.035, slat, { at: [cx, (h * i) / n, 0.02], depth: 0.08 });
    };
    if (o.closed) {
      leaf(-w / 4, w / 2 - 0.01);
      leaf(w / 4, w / 2 - 0.01);
    } else {
      leaf(-w / 2 - w / 4 - 0.03, w / 2);
      leaf(w / 2 + w / 4 + 0.03, w / 2);
    }
  });
}

/** A stone (or stucco) surround behind a window or door: a flat band `bd` wide round the opening. */
export function surround(b: Builder, w: number, h: number, at: Vec3, facing: Facing, color: number, o: { bd?: number; shape?: 'rect' | 'round' | 'segmental' | 'pointed'; sill?: boolean } = {}): void {
  const bd = o.bd ?? 0.14;
  onWall(b, at, facing, () => {
    b.panel(w + bd * 2, h + bd, color, { at: [0, 0, 0], depth: 0.04, shape: o.shape ?? 'rect' });
    if (o.sill !== false) b.box(w + bd * 2 + 0.12, 0.1, 0.16, color, { at: [0, -0.08, 0.06], jitter: false });
  });
}

/** A low-poly well-head (puteale) with a cross-bar and pulley. */
export function well(b: Builder, at: Vec3, stone: number, o: { r?: number; frame?: 'iron' | 'wood' | 'none' } = {}): void {
  const r = o.r ?? 0.6;
  b.cyl(r, 0.85, stone, { at, segs: 10 });
  b.cyl(r * 0.72, 0.87, P.windowDark, { at, segs: 10, jitter: false });
  b.cyl(r + 0.06, 0.08, tint(stone, 0.05), { at: [at[0], at[1] + 0.85, at[2]], segs: 10 });
  const f = o.frame ?? 'wood';
  if (f === 'none') return;
  const col = f === 'iron' ? P.iron : P.oak;
  const pw = f === 'iron' ? 0.05 : 0.12;
  b.sym((s) => b.box(pw, 1.5, pw, col, { at: [at[0] + s * (r - 0.05), at[1] + 0.85, at[2]] }));
  b.box(r * 2 + 0.1, pw, pw, col, { at: [at[0], at[1] + 2.3, at[2]] });
  b.cyl(0.12, 0.06, col, { at: [at[0], at[1] + 2.15, at[2]], rot: [Math.PI / 2, 0, 0], segs: 8 });
  b.cyl(0.13, 0.25, P.oak, { at: [at[0], at[1] + 1.4, at[2]], segs: 6 }); // bucket
  b.box(0.02, 0.75, 0.02, P.timberBlack, { at: [at[0], at[1] + 1.65, at[2]] });
}

/** A vegetable bed: dark soil and rows of green plants. */
export function vegBed(b: Builder, x: number, z: number, w: number, d: number, o: { rows?: number; alongX?: boolean; color?: number } = {}): void {
  b.box(w, 0.08, d, P.soil, { at: [x, 0, z], jitter: false });
  const rows = o.rows ?? Math.max(2, Math.round((o.alongX ? d : w) / 0.6));
  const col = o.color ?? P.leaf;
  for (let i = 0; i < rows; i++) {
    const t = -0.5 + (i + 0.5) / rows;
    const c = i % 2 ? tint(col, 0.06) : col;
    if (o.alongX) b.box(w - 0.3, 0.28, 0.26, c, { at: [x, 0.08, z + t * d] });
    else b.box(0.26, 0.28, d - 0.3, c, { at: [x + t * w, 0.08, z] });
  }
}

/** A thin paved surface just above the ground. */
export function pave(b: Builder, w: number, d: number, color: number, at: Vec3): void {
  b.box(w, 0.04, d, color, { at: [at[0], at[1] + 0.005, at[2]], jitter: false });
}

/** A terracotta pot with a shrub (lemon, oleander, geranium). */
export function pot(b: Builder, at: Vec3, s = 1, leaf: number = P.leafDark): void {
  b.cyl(0.25 * s, 0.4 * s, P.terracotta, { at, rTop: 0.3 * s, segs: 8 });
  b.blob(0.38 * s, leaf, { at: [at[0], at[1] + 0.75 * s, at[2]], detail: 0 });
}

/** Stack of drying washing on a line between two points (a line and a few cloths). */
export function washing(b: Builder, p0: Vec3, p1: Vec3, cols: number[]): void {
  b.beam(p0, p1, 0.02, 0.02, P.white, { jitter: false });
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    const yaw = Math.atan2(p1[0] - p0[0], p1[2] - p0[2]);
    b.box(0.03, 0.55, 0.45, cols[i], { at: [x, y - 0.56, z], rotY: yaw });
  }
}

/**
 * An outline with a ragged top for ruined walls: the wall runs from x = -w/2 to w/2 and stands to
 * the heights `tops` (evenly spaced along it, at least two). Returns points for b.extrude.
 */
export function raggedOutline(w: number, tops: number[]): [number, number][] {
  const pts: [number, number][] = [[-w / 2, 0], [w / 2, 0]];
  const n = tops.length;
  for (let i = n - 1; i >= 0; i--) {
    const x = -w / 2 + (i / (n - 1)) * w;
    pts.push([x, tops[i]]);
  }
  return pts;
}

/** A rectangle hole (or round-headed if `round`) for b.extrude, bottom-left at (x0, y0). */
export function hole(cx: number, y0: number, w: number, h: number, round = false): [number, number][] {
  if (!round) return [[cx - w / 2, y0], [cx + w / 2, y0], [cx + w / 2, y0 + h], [cx - w / 2, y0 + h]];
  const pts: [number, number][] = [[cx - w / 2, y0], [cx + w / 2, y0]];
  const r = w / 2;
  const hs = h - r;
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    pts.push([cx + Math.cos(a) * r, y0 + hs + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * A roof over an oval plan with a short ridge: eaves on an ellipse of semi-axes a (X) and c (Z) at
 * height y0, rising to a ridge of half-length r along Z at height y0 + h. `skirt` drops the eaves edge
 * to show the thickness of the thatch.
 */
export function ovalRoof(b: Builder, a: number, c: number, h: number, r: number, color: number, o: { at?: Vec3; segs?: number; skirt?: number } = {}): void {
  const n = o.segs ?? 20;
  const skirt = o.skirt ?? 0.35;
  const pos: number[] = [];
  const ring: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    ring.push([Math.sin(t) * a, Math.cos(t) * c]);
  }
  const top = (p: [number, number]): [number, number, number] => [0, h, Math.max(-r, Math.min(r, p[1] * (r / c) * 1.6))];
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % n];
    const tp = top(p);
    const tq = top(q);
    pos.push(p[0], 0, p[1], q[0], 0, q[1], tq[0], tq[1], tq[2]);
    if (tp[2] !== tq[2]) pos.push(p[0], 0, p[1], tq[0], tq[1], tq[2], tp[0], tp[1], tp[2]);
    // skirt
    pos.push(p[0], 0, p[1], p[0], -skirt, p[1], q[0], -skirt, q[1]);
    pos.push(p[0], 0, p[1], q[0], -skirt, q[1], q[0], 0, q[1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  b.add(g, color, { at: o.at });
}
