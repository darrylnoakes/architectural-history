import * as THREE from 'three';
import { P, mix, tint, facingAngle, type Builder, type Facing, type Vec3 } from '@ah/kit';

/*
 * The abbey from 830 on is one complex that grows. The church lies along the -X side of the plot,
 * entrance (west) front at +Z, choir (east end) at -Z; the cloister and its three ranges fill the
 * +X side. Plan, in plot metres:
 *
 *   church axis        x = CX (-11)
 *   nave               x CX ± 3, from the west wall (z 11) to the crossing (z -5)
 *   aisles             x CX ± 3 .. ± 6
 *   transept           x CX ± 8.5, z -5 .. -11 (crossing tower over the middle)
 *   choir              Carolingian apse, Romanesque ambulatory centred on z -13, Gothic double
 *                      ambulatory centred on z -12 (reaching z -21.4)
 *   westwork/narthex   z 11 .. 14.5 (830), z 11 .. 17 with twin towers (from 1090)
 *   east range         x -2.5 .. 19, z -11.5 .. -5 (chapter house below, dormitory above)
 *   refectory range    x 12.5 .. 19, z -5 .. 11
 *   west range         x -5 .. 19, z 11 .. 17 (cellars and guests; gate passage at x 3.75)
 *   cloister walks     2.6 m wide inside the ranges; the garth x -2.4 .. 9.9, z -2.4 .. 8.4
 */

export type Pt = [number, number];
export type Arch = 'rect' | 'round' | 'pointed';

/** The growth stages of the one complex. */
export type Phase = 0 | 1 | 2 | 3 | 4 | 5;
export const CAROL = 0;
export const ROM = 1;
export const GOTH = 2;
export const MAUR = 3;
export const QUAR = 4;
export const MUSE = 5;

// ------------------------------------------------------------------ plan

export const CX = -11;
export const NW = 3;
export const AW = 6;
export const FZ = 11;
export const T0 = -5;
export const T1 = -11;
export const TW = 8.5;
export const RH = -13;
export const GH = -12;
export const NZ = 17;
export const TOWER = { dx: 4.1, z: 15.1, w: 3.8, h: 25 };
/** The Gothic choir of 1144: ring radii, column height, the foot of the upper wall, chapel height. */
export const G = { r1: 3, r2: 5.6, r3: 8.2, bulge: 1.1, colH: 6.2, upY: 8.8, chapH: 6.4, n: 7 };
export const RANGE = {
  E: { x0: -2.5, x1: 19, z0: -11.5, z1: -5 },
  R: { x0: 12.5, x1: 19, z0: -5, z1: 11 },
  W: { x0: -5, x1: 19, z0: 11, z1: 17 },
};
export const GARTH = { x0: -2.4, x1: 9.9, z0: -2.4, z1: 8.4 };
export const GATE_X = 3.75;

export function heights(ph: Phase) {
  return ph === CAROL ? { aH: 5.5, nH: 10.5 } : { aH: 7.5, nH: 16 };
}

// ------------------------------------------------------------------ materials

export const STONE = P.pierreBlonde;
export const FRAME = tint(P.pierreBlonde, 0.05);
export const CAROL_WALL = mix(P.limewash, P.rubble, 0.25);
export const RUBBLE = mix(P.rubble, P.pierreBlonde, 0.3);
export const ROOF = P.tuilePlate;
export const SLATE = P.ardoise;
export const SPIRE = tint(P.pierreBlonde, -0.12);
export const DARK = P.windowDark;
export const DOOR = P.oakDark;
export const PAVING = mix(P.paving, P.craie, 0.4);
export const RIB = tint(P.pierreBlonde, -0.06);

// ------------------------------------------------------------------ raw geometry

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: { at?: Vec3; mat?: 'matte' | 'glass' }): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { at: o?.at, mat: o?.mat });
}

/** Point at radius r and angle t about (cx, cz); t = 0 is +Z, t = PI / 2 is +X (as in LatheGeometry). */
export function pol(cx: number, cz: number, r: number, t: number): Pt {
  return [cx + r * Math.sin(t), cz + r * Math.cos(t)];
}

/** Outline of an opening w wide and h tall (to the apex), bottom centre at (0, y0). */
export function archPts(kind: Arch, w: number, h: number, segs = 2, y0 = 0): Pt[] {
  const a = w / 2;
  if (kind === 'rect') return [[-a, y0], [a, y0], [a, y0 + h], [-a, y0 + h]];
  const pts: Pt[] = [[-a, y0], [a, y0]];
  if (kind === 'round') {
    const hs = y0 + Math.max(0.01, h - a);
    for (let i = 0; i <= segs * 2; i++) {
      const t = (Math.PI * i) / (segs * 2);
      pts.push([a * Math.cos(t), hs + a * Math.sin(t)]);
    }
    return pts;
  }
  const rise = Math.max(0.05, Math.min(h - 0.01, a * 1.7));
  const hs = y0 + h - rise;
  const R = (a * a + rise * rise) / (2 * a);
  const phi = Math.atan2(rise, R - a);
  for (let i = 0; i < segs; i++) {
    const t = (phi * i) / segs;
    pts.push([a - R + R * Math.cos(t), hs + R * Math.sin(t)]);
  }
  pts.push([0, hs + rise]);
  for (let i = segs - 1; i >= 0; i--) {
    const t = (phi * i) / segs;
    pts.push([-(a - R + R * Math.cos(t)), hs + R * Math.sin(t)]);
  }
  return pts;
}

/** A flat single-sided shape lying on a wall: `at` is a point on the wall surface, `off` its standoff. */
export function flat(b: Builder, pts: Pt[], color: number, at: Vec3, facing: Facing, off = 0.04, mat?: 'matte' | 'glass'): void {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), 3);
  g.translate(0, 0, off);
  b.add(g, color, { at, rotY: facingAngle(facing), jitter: false, mat });
}

export function rectPts(x0: number, y0: number, x1: number, y1: number): Pt[] {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

/**
 * A cheap window or door: an optional surround and a dark opening, both flat on the wall, with an
 * optional mullion and transom. `at` is the bottom centre of the opening on the wall surface.
 */
export function win(
  b: Builder,
  kind: Arch,
  w: number,
  h: number,
  at: Vec3,
  facing: Facing,
  o?: { frame?: number; glass?: number; bd?: number; mullion?: boolean; transom?: number; segs?: number },
): void {
  const segs = o?.segs ?? 2;
  if (o?.frame !== undefined) {
    const bd = o.bd ?? 0.14;
    flat(b, archPts(kind, w + bd * 2, h + bd * 2, segs, -bd), o.frame, at, facing, 0.03);
  }
  flat(b, archPts(kind, w, h, segs), o?.glass ?? DARK, at, facing, 0.06);
  const fr = o?.frame ?? FRAME;
  const t = Math.min(0.1, w * 0.1);
  const straight = kind === 'rect' ? h : kind === 'round' ? h - w / 2 : h - Math.min(h - 0.01, (w / 2) * 1.7);
  if (o?.mullion) flat(b, rectPts(-t / 2, 0, t / 2, straight), fr, at, facing, 0.08);
  if (o?.transom) flat(b, rectPts(-w / 2, straight * o.transom - t / 2, w / 2, straight * o.transom + t / 2), fr, at, facing, 0.08);
}

/** A box between two plan points (a wall, a kerb), `t` thick and `h` tall, base at y0. */
export function wallSeg(b: Builder, p: Pt, q: Pt, y0: number, h: number, t: number, color: number, ext = 0.1): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  if (L < 1e-4) return;
  b.box(L + ext, h, t, color, { at: [(p[0] + q[0]) / 2, y0, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** Outward facing angle and wall-face point for the wall from p to q round a centre (cx, cz). */
export function faceOf(p: Pt, q: Pt, cx: number, cz: number, t: number): { at: Pt; ang: number } {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz) || 1;
  let nx = dz / L;
  let nz = -dx / L;
  const mx = (p[0] + q[0]) / 2;
  const mz = (p[1] + q[1]) / 2;
  if (nx * (mx - cx) + nz * (mz - cz) < 0) {
    nx = -nx;
    nz = -nz;
  }
  return { at: [mx + nx * t, mz + nz * t], ang: Math.atan2(nx, nz) };
}

/**
 * An arch between two plan points: a slab from the springing (ys) to yTop with an arched opening
 * cut from its underside. Its thickness is t.
 */
export function archSpan(b: Builder, p: Pt, q: Pt, ys: number, yTop: number, t: number, color: number, kind: Arch = 'pointed'): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  const a = L / 2;
  const rise = kind === 'round' ? a : Math.min(yTop - ys - 0.2, a * 1.7);
  const head = archPts(kind, L, rise + 0.01, 2, ys - 0.01).slice(2).reverse();
  const poly: Pt[] = [[-a, yTop], ...head, [a, yTop]];
  b.group({ at: [(p[0] + q[0]) / 2, 0, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) }, () => {
    b.extrude(poly, t, color, { jitter: false });
  });
}

/**
 * A wall slab w long, h high and t thick pierced by n arched openings (openW wide, openH to the
 * apex) standing on `sill`. Placed with its centre at `at`, running along X, then turned by rotY.
 */
export function arcadeWall(
  b: Builder,
  w: number,
  h: number,
  t: number,
  color: number,
  o: { at: Vec3; rotY?: number; n: number; openW: number; openH: number; kind?: Arch; sill?: number },
): void {
  const kind = o.kind ?? 'round';
  const sill = o.sill ?? 0;
  const pitch = w / o.n;
  const pts: Pt[] = [[-w / 2, 0]];
  const holes: Pt[][] = [];
  for (let i = 0; i < o.n; i++) {
    const xc = -w / 2 + (i + 0.5) * pitch;
    const ol = archPts(kind, o.openW, o.openH, 2, sill);
    if (sill <= 0) {
      pts.push([xc - o.openW / 2, 0]);
      for (const [x, y] of ol.slice(2).reverse()) pts.push([xc + x, y]);
      pts.push([xc + o.openW / 2, 0]);
    } else holes.push(ol.map(([x, y]) => [xc + x, y] as Pt));
  }
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  b.group({ at: o.at, rotY: o.rotY ?? 0 }, () => b.extrude(pts, t, color, { holes, jitter: false }));
}

// ------------------------------------------------------------------ the saint's crypt (560 to the end)

/** The half-sunk crypt over the saint's grave, built in 560 east of the first church's apse. */
export const CRYPT = { z0: -18, z1: -11.2, w: 8, h: 2.6 };
/** The top of its vault: the floor of every later choir built over it. */
export const CRYPT_TOP = CRYPT.h + 0.25;

/** A trapezoidal stone coffin, wider at the head, with a ridged lid. */
export function sarcophagus(b: Builder, x: number, z: number, rotY: number, color: number, lid = true) {
  const wh = 0.36;
  const wf = 0.26;
  const L = 1.0;
  const h = 0.55;
  const c = [[-wh, 0, -L], [wh, 0, -L], [wf, 0, L], [-wf, 0, L]];
  const t = [[-wh, h, -L], [wh, h, -L], [wf, h, L], [-wf, h, L]];
  const pos: number[] = [];
  const q = (a: number[], bb: number[], cc: number[], d: number[]) => pos.push(...a, ...bb, ...cc, ...a, ...cc, ...d);
  for (let i = 0; i < 4; i++) q(c[i], c[(i + 1) % 4], t[(i + 1) % 4], t[i]);
  q(t[0], t[1], t[2], t[3]);
  b.group({ at: [x, 0, z], rotY }, () => {
    soup(b, pos, color);
    if (lid) {
      const r = [[0, h + 0.18, -L], [0, h + 0.14, L]];
      const lp: number[] = [];
      lp.push(...t[0], ...r[0], ...r[1], ...t[0], ...r[1], ...t[3]);
      lp.push(...t[1], ...t[2], ...r[1], ...t[1], ...r[1], ...r[0]);
      lp.push(...t[0], ...t[1], ...r[0], ...t[3], ...r[1], ...t[2]);
      soup(b, lp, tint(color, 0.05));
    }
  });
}

/**
 * The crypt: rubble walls banded with brick rising a man's height out of the ground, low round-headed
 * lights, a vault (a slab, the floor of the choir above), and inside the saint's tomb among reused
 * marble columns and the founders' sarcophagi. Built in 560 and never pulled down: the Carolingian
 * apse is raised on it, the Romanesque and Gothic choirs cover it, and it outlives the church. With
 * `stair` the open stair down to its door along the +X side (560 and 830, before the choirs grew
 * over it); with `vault` false it is shown open to study (the first church's cut-away).
 */
export function crypt(b: Builder, wall: number, band: number, o: { stair: boolean; vault: boolean }) {
  const { z0, z1, w: cw, h } = CRYPT;
  const cz = (z0 + z1) / 2;
  const cl = z1 - z0;
  for (const s of [-1, 1]) b.box(0.6, h, cl, wall, { at: [CX + s * (cw / 2 - 0.3), 0, cz] });
  b.box(cw, h, 0.6, wall, { at: [CX, 0, z0 + 0.3] });
  b.box(cw, h, 0.6, wall, { at: [CX, 0, z1 - 0.3] });
  b.sym((s) => {
    b.box(0.66, 0.22, cl + 0.06, band, { at: [CX + s * (cw / 2 - 0.3), h - 0.5, cz], jitter: false });
    b.box(cw + 0.06, 0.22, 0.66, band, { at: [CX, h - 0.5, s > 0 ? z1 - 0.3 : z0 + 0.3], jitter: false });
  });
  b.box(cw - 1.2, 0.04, cl - 1.2, mix(P.chalk, P.paving, 0.5), { at: [CX, 0.02, cz], jitter: false });
  // low round-headed lights just above the ground, and the door on the +X side
  for (const z of [-16.2, -13.2]) {
    win(b, 'round', 0.6, 0.9, [CX + cw / 2, 0.6, z], '+x', { frame: band, bd: 0.1 });
    win(b, 'round', 0.6, 0.9, [CX - cw / 2, 0.6, z], '-x', { frame: band, bd: 0.1 });
  }
  win(b, 'round', 0.6, 0.9, [CX, 0.6, z0], '-z', { frame: band, bd: 0.1 });
  flat(b, archPts('round', 1.0, 1.3, 2), DOOR, [CX + cw / 2, 0, cz - 1.6], '+x', 0.06);
  // inside: marble columns, the saint's tomb and the founders' sarcophagi
  for (const sx2 of [-1.5, 1.5]) for (const z of [-16.2, -14.6, -13]) {
    b.cyl(0.17, 2.1, P.marble, { at: [CX + sx2, 0, z], segs: 6 });
    b.box(0.45, 0.22, 0.45, P.craie, { at: [CX + sx2, 2.1, z], jitter: false });
  }
  b.box(1.3, 0.9, 2.2, P.marble, { at: [CX, 0, -14.6] });
  b.box(1.5, 0.15, 2.4, P.marbleGreen, { at: [CX, 0.9, -14.6] });
  sarcophagus(b, CX + 2.8, -15.6, 0, P.craie);
  sarcophagus(b, CX - 2.8, -15.6, 0, P.craie);
  sarcophagus(b, CX - 2.8, -12.9, Math.PI, P.craie);
  if (o.vault) b.box(cw + 0.2, 0.25, cl + 0.2, wall, { at: [CX, h, cz] });
  if (o.stair) {
    const sx = CX + cw / 2 + 1.3;
    b.box(1.6, 0.03, 4.2, P.timberBlack, { at: [sx, 0.01, cz + 0.6], jitter: false });
    for (let i = 0; i < 5; i++) b.box(1.5, 0.05, 0.36, P.rubble, { at: [sx, 0.03, cz + 2.5 - i * 0.75], jitter: false });
    b.sym((s) => b.box(0.35, 0.7, 4.4, wall, { at: [sx + s * 0.95, 0, cz + 0.6] }));
  }
  b.collider(cw, cl, { at: [CX, 0, cz] });
}

/** The monks' well of 560, which the Carolingian cloister is laid out round: the middle of the garth. */
export const WELL = { x: (GARTH.x0 + GARTH.x1) / 2, z: (GARTH.z0 + GARTH.z1) / 2 };

/** The well's stone curb and water (560 to the end). */
export function well(b: Builder, stone: number) {
  b.cyl(0.9, 0.8, stone, { at: [WELL.x, 0, WELL.z], segs: 8 });
  b.cyl(0.65, 0.05, P.water, { at: [WELL.x, 0.78, WELL.z], segs: 8, mat: 'glass' });
}

/** The monks' vegetable garden behind the east range (560, kept to 1090). */
export function garden(b: Builder) {
  for (let i = 0; i < 5; i++) b.box(1.2, 0.18, 7, i % 2 ? P.soil : mix(P.soil, P.leaf, 0.35), { at: [-1.5 + i * 1.6, 0, -15.5] });
}

// ------------------------------------------------------------------ the church

function wallColor(ph: Phase) {
  return ph === CAROL ? CAROL_WALL : STONE;
}

/** A tiered round Carolingian tower with a spire, standing on y0 at (x, z). */
function carolTower(b: Builder, x: number, z: number, y0: number, wall: number) {
  const tiers: [number, number][] = [[2.9, 4.8], [2.3, 3.0], [1.7, 2.6]];
  let y = y0;
  for (const [r, h] of tiers) {
    b.cyl(r, h, wall, { at: [x, y, z], segs: 10 });
    b.cyl(r + 0.2, 0.25, tint(wall, -0.08), { at: [x, y + h - 0.25, z], segs: 10, jitter: false });
    for (let k = 0; k < 6; k++) {
      const t = (k * Math.PI) / 3 + Math.PI / 6;
      const [px, pz] = pol(x, z, r * 0.97, t);
      win(b, 'round', 0.45, Math.min(1.3, h * 0.45), [px, y + h * 0.35, pz], t);
    }
    y += h;
  }
  b.cone(2.0, 4.8, P.lead, { at: [x, y, z], segs: 10 });
  b.box(0.08, 1.2, 0.08, P.iron, { at: [x, y + 4.7, z] });
}

/** Paired round-headed openings on the four faces of a square tower w wide, centred (x, z), at height y. */
function towerOpenings(b: Builder, x: number, z: number, w: number, y: number, ow: number, oh: number, pair = true) {
  const faces: [Facing, number, number, 'x' | 'z'][] = [
    ['+z', 0, w / 2, 'x'],
    ['-z', 0, -w / 2, 'x'],
    ['+x', w / 2, 0, 'z'],
    ['-x', -w / 2, 0, 'z'],
  ];
  for (const [f, fx, fz, ax] of faces) {
    for (const u of pair ? [-ow * 0.7, ow * 0.7] : [0]) {
      const at: Vec3 = ax === 'x' ? [x + u, y, z + fz] : [x + fx, y, z + u];
      win(b, 'round', ow, oh, at, f);
    }
  }
}

/** One of the twin west towers of 1090. */
export function westTower(b: Builder, x: number, wall: number) {
  const { z, w, h } = TOWER;
  b.box(w, h, w, wall, { at: [x, 0, z] });
  for (const y of [12, 17, 21.2]) b.box(w + 0.24, 0.28, w + 0.24, FRAME, { at: [x, y, z], jitter: false });
  towerOpenings(b, x, z, w, 13.4, 0.5, 1.6, false);
  towerOpenings(b, x, z, w, 17.7, 0.7, 2.6);
  towerOpenings(b, x, z, w, 21.8, 0.7, 2.4);
  b.box(w + 0.4, 0.4, w + 0.4, FRAME, { at: [x, h - 0.1, z], jitter: false });
  b.pyramid(w + 0.3, w + 0.3, 6.5, SPIRE, { at: [x, h + 0.3, z] });
}

/** The front wall of the narthex with its portal, between the towers; `alone` adds the scarred back. */
export function westFront(b: Builder, wall: number, alone: boolean) {
  const nh = 12;
  if (alone) {
    b.box(12, nh, 0.9, wall, { at: [CX, 0, NZ - 0.45] });
    b.extrude([[-6, 0], [6, 0], [0, 4.2]], 0.9, wall, { at: [CX, nh, NZ - 0.45] });
    // stubs of the narthex side walls, broken off where the quarrymen stopped
    b.sym((s) => {
      b.box(0.9, 5.5, 1.6, wall, { at: [CX + s * 5.55, 0, NZ - 2.9] });
      b.box(0.9, 2.4, 1.4, wall, { at: [CX + s * 5.55, 0, NZ - 4.3] });
    });
    // the scar of the vault on the back of the front wall
    flat(b, archPts('round', 9, 11, 3), tint(wall, -0.12), [CX, 0, NZ - 0.9], '-z', 0.03);
  }
  // portal: stepped round arch, tympanum and door
  flat(b, archPts('round', 3.9, 5.7, 3), FRAME, [CX, 0, NZ], '+z', 0.03);
  flat(b, archPts('round', 3.1, 5.1, 3), tint(wall, -0.1), [CX, 0, NZ], '+z', 0.06);
  flat(b, archPts('round', 2.4, 4.5, 3), tint(STONE, 0.06), [CX, 0, NZ], '+z', 0.09);
  flat(b, rectPts(-1.2, 0, 1.2, 3.3), DOOR, [CX, 0, NZ], '+z', 0.12);
  win(b, 'round', 1.5, 3.0, [CX, 7.0, NZ], '+z', { frame: FRAME, bd: 0.2 });
  b.sym((s) => westTower(b, CX + s * TOWER.dx, wall));
}

/** The narthex of 1090: a two-storey porch block with the twin towers at its front corners. */
function narthex(b: Builder, wall: number) {
  const nh = 12;
  const zc = (FZ + NZ) / 2;
  b.box(12, nh, NZ - FZ, wall, { at: [CX, 0, zc] });
  b.gable(12, NZ - FZ, 4.2, ROOF, { ridge: 'z', at: [CX, nh, zc], overhang: 0.2, wall });
  b.sym((s) => {
    const f: Facing = s > 0 ? '+x' : '-x';
    win(b, 'round', 0.9, 2.0, [CX + s * 6, 2.2, 12.6], f, { frame: FRAME });
    win(b, 'round', 1.0, 2.2, [CX + s * 6, 7.0, 12.6], f, { frame: FRAME });
  });
  westFront(b, wall, false);
}

/** The Carolingian westwork: a towered entrance block with a chapel upstairs. */
function westwork(b: Builder, wall: number) {
  const z1 = 14.5;
  const zc = (FZ + z1) / 2;
  b.box(12, 12, z1 - FZ, wall, { at: [CX, 0, zc] });
  b.gable(12, z1 - FZ, 2.6, ROOF, { ridge: 'x', at: [CX, 12, zc], overhang: 0.2, wall });
  carolTower(b, CX, zc, 12.6, wall);
  b.sym((s) => {
    b.cyl(1.3, 15.2, wall, { at: [CX + s * 5.3, 0, z1 - 0.2], segs: 8 });
    b.cone(1.55, 3, ROOF, { at: [CX + s * 5.3, 15.2, z1 - 0.2], segs: 8 });
    for (const y of [3.5, 7.5, 11.5]) win(b, 'round', 0.3, 0.9, [CX + s * 5.3, y, z1 + 1.06], '+z');
  });
  win(b, 'round', 2.2, 3.6, [CX, 0, z1], '+z', { frame: tint(wall, -0.1), glass: DOOR, bd: 0.25 });
  for (const x of [-2.4, 0, 2.4]) win(b, 'round', 0.8, 1.7, [CX + x, 7.2, z1], '+z', { frame: tint(wall, -0.06) });
  b.sym((s) => win(b, 'round', 0.8, 1.7, [CX + s * 6, 7.2, zc], s > 0 ? '+x' : '-x'));
}

/** Romanesque east end: a short straight bay, the apse, an ambulatory and three radiating chapels. */
function romanesqueChevet(b: Builder, wall: number, nH: number, aH: number) {
  const sbl = T1 - RH;
  const sbz = (T1 + RH) / 2;
  const half = { start: Math.PI / 2, sweep: Math.PI };
  b.box(NW * 2, nH, sbl, wall, { at: [CX, 0, sbz] });
  b.box(AW * 2, aH, sbl, wall, { at: [CX, 0, sbz] });
  b.gable(NW * 2, sbl, 3.6, ROOF, { ridge: 'z', at: [CX, nH, sbz], wall });
  b.sym((s) => b.shed(AW - NW + 0.4, sbl, 1.8, ROOF, { at: [CX + s * ((AW + NW) / 2 + 0.2), aH, sbz], high: s > 0 ? '-x' : '+x' }));
  b.lathe([[NW, 0], [NW, nH]], wall, { ...half, at: [CX, 0, RH], segs: 8 });
  b.lathe([[NW + 0.35, nH - 0.1], [0, nH + 3.6]], ROOF, { ...half, at: [CX, 0, RH], segs: 8 });
  b.lathe([[AW, 0], [AW, aH]], wall, { ...half, at: [CX, 0, RH], segs: 10 });
  b.lathe([[AW + 0.4, aH - 0.1], [NW, aH + 1.8]], ROOF, { ...half, at: [CX, 0, RH], segs: 10 });
  for (const t of [(3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4]) {
    const [x, z] = pol(CX, RH, NW * 0.98, t);
    win(b, 'round', 0.9, 2.2, [x, aH + 2.4, z], t, { frame: FRAME });
    const [cx, cz] = pol(CX, RH, AW - 0.3, t);
    b.group({ at: [cx, 0, cz], rotY: t }, () => {
      b.lathe([[1.9, 0], [1.9, 5.2]], wall, { start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
      b.lathe([[2.15, 5.1], [0, 7.2]], ROOF, { start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
      win(b, 'round', 0.6, 1.7, [0, 2.2, 1.88], '+z', { frame: FRAME, bd: 0.1 });
    });
  }
  for (const t of [(5 * Math.PI) / 8, (7 * Math.PI) / 8, (9 * Math.PI) / 8, (11 * Math.PI) / 8]) {
    const [x, z] = pol(CX, RH, AW * 0.99, t);
    win(b, 'round', 0.7, 1.8, [x, 3.0, z], t, { frame: FRAME, bd: 0.1 });
  }
}

/**
 * The Gothic choir of 1144: a hemicycle on slender columns, a double ambulatory of rib-vaulted bays,
 * and seven shallow chapels so wide-windowed and so close together that the outer wall becomes a
 * continuous ring of glass between buttresses. With `cut`, the ambulatory roof is left off to show
 * the columns, pointed arches and ribs.
 */
export function gothicChoir(b: Builder, wall: number, nH: number, cut: boolean) {
  const { r1, r2, r3, bulge, colH, upY, chapH, n } = G;
  const cz = GH;
  const th = (k: number) => Math.PI / 2 + (k * Math.PI) / n;
  const at = (r: number, t: number) => pol(CX, cz, r, t);
  const half = { start: Math.PI / 2, sweep: Math.PI };
  const sbl = T1 - cz;
  const sbz = (T1 + cz) / 2;

  // paving inside, so the pattern of columns reads from above
  b.lathe([[r3 + 0.2, 0.04], [0.01, 0.04]], PAVING, { ...half, at: [CX, 0, cz], segs: 14 });
  // straight bay: upper wall block over the arcade and the outer walls of the double aisles
  b.box(NW * 2, nH - upY, sbl, wall, { at: [CX, upY, sbz] });
  b.gable(NW * 2, sbl, 3.8, ROOF, { ridge: 'z', at: [CX, nH, sbz], wall });
  b.sym((s) => b.box(0.4, chapH, sbl, wall, { at: [CX + s * r3, 0, sbz] }));

  // the two rings of slender monolithic columns
  for (let k = 0; k <= n; k++) {
    for (const r of [r1, r2]) {
      const [x, z] = at(r, th(k));
      b.cyl(0.19, colH - 0.35, P.craie, { at: [x, 0, z], segs: 6 });
      b.box(0.5, 0.35, 0.5, wall, { at: [x, colH - 0.35, z], rotY: th(k), jitter: false });
    }
  }
  // the hemicycle: pointed arches on the inner columns carry the upper wall
  for (let k = 0; k < n; k++) archSpan(b, at(r1, th(k)), at(r1, th(k + 1)), colH, upY, 0.44, wall);
  b.lathe([[r1 - 0.22, upY], [r1 + 0.22, upY], [r1 + 0.22, nH], [r1 - 0.22, nH], [r1 - 0.22, upY]], wall, { ...half, at: [CX, 0, cz], segs: n });
  for (let k = 0; k < n; k++) {
    const t = th(k + 0.5);
    const [x, z] = at((r1 + 0.22) * Math.cos(Math.PI / (2 * n)), t);
    win(b, 'pointed', 0.85, 3.4, [x, nH - 4.6, z], t, { frame: FRAME, bd: 0.1 });
  }
  b.lathe([[r1 + 0.55, nH - 0.1], [0, nH + 3.8]], ROOF, { ...half, at: [CX, 0, cz], segs: n });

  // the ring of chapels: three facets each, nearly all window, buttresses between them
  const D = Math.PI / n;
  for (let i = 0; i < n; i++) {
    const t0 = th(i);
    const t1 = th(i + 1);
    const pts: Pt[] = [at(r3, t0 + 0.03), at(r3 + bulge, t0 + D * 0.3), at(r3 + bulge, t0 + D * 0.7), at(r3, t1 - 0.03)];
    for (let j = 0; j < 3; j++) {
      wallSeg(b, pts[j], pts[j + 1], 0, chapH, 0.35, wall, 0.18);
      const f = faceOf(pts[j], pts[j + 1], CX, cz, 0.18);
      win(b, 'pointed', 1.05, 4.0, [f.at[0], 1.25, f.at[1]], f.ang, { frame: FRAME, bd: 0.09, mullion: true });
    }
    b.box(Math.hypot(pts[0][0] - pts[3][0], pts[0][1] - pts[3][1]) + 0.4, 0.3, 0.6, FRAME, {
      at: [(pts[1][0] + pts[2][0]) / 2, chapH - 0.3, (pts[1][1] + pts[2][1]) / 2],
      rotY: Math.atan2(-(pts[2][1] - pts[1][1]), pts[2][0] - pts[1][0]),
      jitter: false,
    });
  }
  for (let k = 0; k <= n; k++) {
    const t = th(k);
    const [x, z] = at(r3 + 0.55, t);
    b.box(0.6, chapH + 0.5, 1.6, wall, { at: [x, 0, z], rotY: t });
    const [x2, z2] = at(r3 + 0.95, t);
    b.cone(0.45, 1.3, SPIRE, { at: [x2, chapH + 0.5, z2], segs: 4, rotY: t + Math.PI / 4 });
  }

  if (!cut) {
    b.lathe([[r3 + bulge + 0.45, chapH - 0.1], [r1 + 0.22, upY + 1.0]], ROOF, { ...half, at: [CX, 0, cz], segs: 14 });
    b.sym((s) =>
      b.shed(r3 + bulge + 0.45 - r1, sbl, upY + 1.1 - chapH, ROOF, {
        at: [CX + s * (r1 + (r3 + bulge + 0.45 - r1) / 2), chapH - 0.1, sbz],
        high: s > 0 ? '-x' : '+x',
      }),
    );
  } else {
    // the middle ring's arches, the transverse arches and the diagonal ribs of every bay
    for (let k = 0; k < n; k++) archSpan(b, at(r2, th(k)), at(r2, th(k + 1)), colH, colH + 2.0, 0.3, wall);
    for (let k = 0; k <= n; k++) {
      const t = th(k);
      archSpan(b, at(r1, t), at(r2, t), colH, colH + 1.75, 0.24, wall);
      archSpan(b, at(r2, t), at(r3 - 0.1, t), colH, colH + 1.95, 0.24, wall);
    }
    const yE = colH + 1.55;
    for (let i = 0; i < n; i++) {
      const a = th(i);
      const c = th(i + 1);
      const m = th(i + 0.5);
      const E1 = at((r1 + r2) / 2, m);
      for (const Q of [at(r1, a), at(r1, c), at(r2, a), at(r2, c)]) b.beam([Q[0], colH, Q[1]], [E1[0], yE, E1[1]], 0.15, 0.18, RIB, { jitter: false });
      const E2 = at((r2 + r3 + bulge * 0.5) / 2, m);
      for (const Q of [at(r2, a), at(r2, c), at(r3, a + 0.03), at(r3, c - 0.03)]) b.beam([Q[0], colH, Q[1]], [E2[0], yE + 0.2, E2[1]], 0.15, 0.18, RIB, { jitter: false });
      const K = at(r3 + bulge - 0.15, m);
      b.beam([E2[0], yE + 0.2, E2[1]], [K[0], colH - 0.2, K[1]], 0.15, 0.18, RIB, { jitter: false });
    }
  }
}

/** The church for phases CAROL to MAUR. */
export function church(b: Builder, ph: Phase, cut: boolean) {
  const { aH, nH } = heights(ph);
  const rom = ph >= ROM;
  const wall = wallColor(ph);
  const len = FZ - T0;
  const zc = (FZ + T0) / 2;
  const aisleRise = rom ? 1.8 : 1.4;

  // nave and aisles
  b.box(AW * 2, aH, len, wall, { at: [CX, 0, zc] });
  b.box(NW * 2, nH, len, wall, { at: [CX, 0, zc] });
  b.box(NW * 2 + 0.3, 0.3, len, tint(wall, -0.06), { at: [CX, nH - 0.3, zc], jitter: false });
  b.sym((s) => b.shed(AW - NW + 0.4, len, aisleRise, ROOF, { at: [CX + s * ((AW + NW) / 2 + 0.2), aH, zc], high: s > 0 ? '-x' : '+x' }));
  b.gable(NW * 2, len, 3.6, ROOF, { ridge: 'z', at: [CX, nH, zc], overhang: 0.3, wall });
  const bays = [9, 5, 1, -3];
  b.sym((s) => {
    const f: Facing = s > 0 ? '+x' : '-x';
    for (const z of bays) {
      if (rom) {
        win(b, 'round', 1.0, 2.1, [CX + s * AW, aH - 2.8, z], f, { frame: FRAME });
        win(b, 'round', 1.1, 2.7, [CX + s * NW, aH + 2.4, z], f, { frame: FRAME });
      } else {
        win(b, 'round', 0.7, 1.3, [CX + s * AW, aH - 1.65, z], f);
        win(b, 'round', 0.8, 1.5, [CX + s * NW, aH + 1.8, z], f);
      }
    }
    if (rom) {
      for (const z of [7, 3, -1]) {
        b.box(0.3, aH, 0.8, wall, { at: [CX + s * (AW + 0.15), 0, z] });
        b.box(0.3, nH - aH - aisleRise, 0.8, wall, { at: [CX + s * (NW + 0.15), aH + aisleRise, z] });
      }
    }
  });

  // transept and crossing tower
  const td = T0 - T1;
  const tz = (T0 + T1) / 2;
  b.box(TW * 2, nH, td, wall, { at: [CX, 0, tz] });
  b.gable(TW * 2, td, 3.6, ROOF, { ridge: 'x', at: [CX, nH, tz], overhang: 0.3, wall });
  b.sym((s) => {
    const f: Facing = s > 0 ? '+x' : '-x';
    if (s < 0) {
      win(b, 'round', rom ? 1.2 : 0.8, rom ? 2.6 : 1.5, [CX - TW, rom ? 3.0 : 2.4, tz], f, { frame: rom ? FRAME : undefined });
      win(b, 'round', rom ? 1.4 : 0.9, rom ? 3.0 : 1.7, [CX - TW, rom ? 9.6 : 6.4, tz], f, { frame: rom ? FRAME : undefined });
    } else if (ph === ROM || ph === GOTH) {
      win(b, 'round', 1.3, 2.2, [CX + TW, 12.6, tz], f, { frame: FRAME });
    }
    for (const zf of [T0, T1]) {
      if (zf === T1 && rom) continue;
      win(b, 'round', rom ? 1.0 : 0.7, rom ? 2.4 : 1.4, [CX + s * 7.3, rom ? 9.8 : 6.6, zf], zf === T0 ? '+z' : '-z', { frame: rom ? FRAME : undefined });
    }
  });
  if (rom) {
    b.box(NW * 2 + 0.2, 4.6, td + 0.2, wall, { at: [CX, nH, tz] });
    b.cyl(3.15, 6.8, wall, { at: [CX, nH + 4.6, tz], segs: 8, rotY: Math.PI / 8 });
    b.cyl(3.4, 0.35, FRAME, { at: [CX, nH + 11.4, tz], segs: 8, rotY: Math.PI / 8, jitter: false });
    for (let k = 0; k < 8; k++) {
      const t = (k * Math.PI) / 4;
      const [x, z] = pol(CX, tz, 3.15 * Math.cos(Math.PI / 8), t);
      win(b, 'round', 0.55, 2.2, [x, nH + 7.6, z], t, { frame: FRAME, bd: 0.1 });
    }
    b.cone(3.45, 7.5, SPIRE, { at: [CX, nH + 11.75, tz], segs: 8, rotY: Math.PI / 8 });
    // apsidioles on the east side of the transept arms
    b.sym((s) => {
      b.group({ at: [CX + s * 6.6, 0, T1], rotY: Math.PI }, () => {
        b.lathe([[1.5, 0], [1.5, 6]], wall, { start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
        b.lathe([[1.75, 5.9], [0, 7.8]], ROOF, { start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
        win(b, 'round', 0.5, 1.6, [0, 2.6, 1.48], '+z', { frame: FRAME, bd: 0.1 });
      });
    });
  } else {
    carolTower(b, CX, tz, nH + 0.2, wall);
  }

  // the west end
  if (rom) narthex(b, wall);
  else westwork(b, wall);

  // the east end
  if (ph === CAROL) {
    // the apse raised on the vault of the old crypt, a lean-to over the crypt's east end
    const half = { start: Math.PI / 2, sweep: Math.PI, segs: 8 };
    b.lathe([[NW, CRYPT_TOP], [NW, 8]], wall, { ...half, at: [CX, 0, T1] });
    b.hip(CRYPT.w + 0.6, T1 - NW - CRYPT.z0 + 0.6, 1.3, ROOF, { at: [CX, CRYPT_TOP, (T1 - NW + CRYPT.z0) / 2 - 0.1] });
    b.lathe([[NW + 0.3, 7.9], [0, 10.2]], ROOF, { ...half, at: [CX, 0, T1] });
    for (const t of [(3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4]) {
      const [x, z] = pol(CX, T1, NW * 0.98, t);
      win(b, 'round', 0.6, 1.4, [x, 4.6, z], t);
    }
  } else if (ph === ROM) romanesqueChevet(b, wall, nH, aH);
  else gothicChoir(b, wall, nH, cut);

  // the crypt of 560 under the east end, its stair given up once the Romanesque chevet covers it
  crypt(b, wall, ph === CAROL ? mix(P.brickRed, P.romanTile, 0.5) : tint(wall, -0.05), { stair: ph === CAROL, vault: true });

  // a step and paving before the door
  b.box(12, 0.05, 4.5, PAVING, { at: [CX, 0, (rom ? NZ : 14.5) + 2.3], jitter: false });

  b.collider(AW * 2, len, { at: [CX, 0, zc] });
  b.collider(TW * 2, td, { at: [CX, 0, tz] });
  if (rom) b.collider(12, NZ - FZ, { at: [CX, 0, (FZ + NZ) / 2] });
  else b.collider(12, 3.5, { at: [CX, 0, 12.75] });
  if (ph === CAROL) b.collider(NW * 2, 3, { at: [CX, 0, T1 - 1.5] });
  else if (ph === ROM) b.collider(AW * 2 + 3, 9, { at: [CX, 0, -15.5] });
  else {
    const R = G.r3 + G.bulge;
    b.collider(R * 2, R, { at: [CX, 0, GH - R / 2] });
  }
}

// ------------------------------------------------------------------ the church after 1792

/** Broken wall stumps along a polyline: ragged, waist to head high. */
function stumps(b: Builder, pts: Pt[], hmax: number, t: number, color: number) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(L / 2.2));
    for (let k = 0; k < n; k++) {
      const u0 = k / n;
      const u1 = (k + 1) / n;
      const h = 0.3 + b.rand() * b.rand() * hmax;
      wallSeg(b, [x0 + (x1 - x0) * u0, z0 + (z1 - z0) * u0], [x0 + (x1 - x0) * u1, z0 + (z1 - z0) * u1], 0, h, t, color, 0.02);
    }
  }
}

/** Flat stone strips marking a lost wall in the grass. */
function outline(b: Builder, pts: Pt[], t: number, color: number) {
  for (let i = 0; i < pts.length - 1; i++) wallSeg(b, pts[i], pts[i + 1], 0, 0.12, t, color, t);
}

/** The plan lines of the church at its fullest: aisles, transept and the ring of chapels. */
function churchLines(): Pt[][] {
  const lines: Pt[][] = [];
  for (const s of [-1, 1]) {
    lines.push([
      [CX + s * AW, FZ],
      [CX + s * AW, T0],
      [CX + s * TW, T0],
      [CX + s * TW, T1],
      [CX + s * G.r3, T1],
      [CX + s * G.r3, GH],
    ]);
  }
  const ring: Pt[] = [];
  const D = Math.PI / G.n;
  for (let i = 0; i < G.n; i++) {
    const t0 = Math.PI / 2 + i * D;
    ring.push(pol(CX, GH, G.r3, t0), pol(CX, GH, G.r3 + G.bulge, t0 + D * 0.3), pol(CX, GH, G.r3 + G.bulge, t0 + D * 0.7));
  }
  ring.push(pol(CX, GH, G.r3, Math.PI * 1.5));
  lines.push(ring);
  return lines;
}

/** Where the nave piers and the choir columns stood. */
function pierSites(): { at: Pt; round: boolean }[] {
  const out: { at: Pt; round: boolean }[] = [];
  for (const s of [-1, 1]) for (const z of [7, 3, -1]) out.push({ at: [CX + s * NW, z], round: false });
  for (let k = 0; k <= G.n; k++) {
    const t = Math.PI / 2 + (k * Math.PI) / G.n;
    out.push({ at: pol(CX, GH, G.r1, t), round: true }, { at: pol(CX, GH, G.r2, t), round: true });
  }
  // the columns that stood on the crypt went with its vault's paving
  const inCrypt = ([x, z]: Pt) => Math.abs(x - CX) < CRYPT.w / 2 + 0.4 && z > CRYPT.z0 - 0.4 && z < CRYPT.z1 + 0.4;
  return out.filter((p) => !inCrypt(p.at));
}

/**
 * What is left of the church: in 1800 the west front alone among stumps, rubble and stacked stone;
 * in 1995 the same front restored and the rest of the plan marked out in the lawn.
 */
export function churchRemains(b: Builder, ph: Phase) {
  const museum = ph === MUSE;
  const wall = museum ? tint(STONE, 0.03) : tint(STONE, -0.05);
  westFront(b, wall, true);
  // the crypt under the choir, vaulted and half sunk, outlives the church above it
  crypt(b, tint(STONE, -0.05), tint(STONE, -0.1), { stair: false, vault: true });
  b.collider(12, 1.2, { at: [CX, 0, NZ - 0.6] });
  b.sym((s) => b.collider(TOWER.w, TOWER.w, { at: [CX + s * TOWER.dx, 0, TOWER.z] }));
  if (museum) {
    b.box(TW * 2 + 2, 0.04, 36, P.grass, { at: [CX, 0, -3.5], jitter: false });
    for (const line of churchLines()) outline(b, line, 0.6, PAVING);
    outline(b, [[CX - AW, FZ], [CX + AW, FZ]], 0.6, PAVING);
    for (const p of pierSites()) {
      if (p.round) b.cyl(0.32, 0.25, PAVING, { at: [p.at[0], 0, p.at[1]], segs: 8 });
      else b.box(1.1, 0.3, 1.1, PAVING, { at: [p.at[0], 0, p.at[1]] });
    }
    b.box(2.2, 0.06, 0.6, P.bronze, { at: [CX, 0.2, 8], rot: [-0.4, 0, 0], jitter: false });
    return;
  }
  b.box(TW * 2 + 2, 0.04, 36, mix(P.earth, P.grassDry, 0.4), { at: [CX, 0, -3.5], jitter: false });
  for (const line of churchLines()) stumps(b, line, 2.6, 1.1, wall);
  for (const p of pierSites()) {
    const h = 0.3 + b.rand() * 1.2;
    if (p.round) b.cyl(0.22, h * 0.6, P.craie, { at: [p.at[0], 0, p.at[1]], segs: 6 });
    else b.box(1.1, h, 1.1, wall, { at: [p.at[0], 0, p.at[1]] });
  }
  // rubble heaps where the vaults came down, and squared blocks sorted for sale
  for (const [x, z, r] of [[-11, 2, 2.4], [-14, -9, 2.0], [-3.6, -15, 2.2], [-11, -7, 1.8], [-15, 6, 1.5]] as const) {
    b.blob(r, mix(P.rubble, STONE, 0.4), { at: [x, -r * 0.12, z], stretch: [1.3, 0.5, 1.1], detail: 0 });
  }
  for (const [x, z] of [[-5.5, 12.5], [-3.5, 14.5]] as const) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) b.box(0.9, 0.5, 0.6, tint(STONE, -0.02 * i), { at: [x + (i - 1) * 0.92, j * 0.5, z] });
  }
  // shear-legs over the crossing, lowering a block on to a cart
  const top: Vec3 = [-9.5, 9, -7];
  for (const [x, z] of [[-12.5, -8.5], [-6.5, -8.5], [-9.5, -3.5]] as const) b.beam([x, 0, z], top, 0.25, 0.25, P.oak);
  b.beam(top, [-9.5, 3.4, -7], 0.04, 0.04, P.timberBlack);
  b.box(0.9, 0.6, 0.7, STONE, { at: [-9.5, 2.8, -7] });
  cart(b, [-7.5, 0, 9.5], Math.PI / 2, true);
}

/** A two-wheeled cart, optionally loaded with stone blocks. */
export function cart(b: Builder, at: Vec3, rotY: number, stone: boolean) {
  b.group({ at, rotY }, () => {
    b.box(1.5, 0.15, 2.6, P.oak, { at: [0, 0.75, 0] });
    b.sym((s) => b.log(0.6, 0.12, P.oakDark, { at: [s * 0.85, 0.15, 0], segs: 8 }));
    b.beam([0.4, 0.8, 1.3], [0.4, 0.6, 3.2], 0.1, 0.1, P.oak);
    b.beam([-0.4, 0.8, 1.3], [-0.4, 0.6, 3.2], 0.1, 0.1, P.oak);
    if (stone) {
      b.box(0.8, 0.5, 0.6, STONE, { at: [0, 0.9, -0.5] });
      b.box(0.8, 0.5, 0.6, tint(STONE, -0.05), { at: [0, 0.9, 0.4] });
    } else {
      for (const z of [-0.6, 0.2]) b.box(1.1, 0.7, 0.7, P.cream, { at: [0, 0.9, z] });
    }
  });
}

// ------------------------------------------------------------------ cloister and ranges

/** The cloister walks: a lean-to roof on an arcade round the garth, with a well in the middle. */
export function cloister(b: Builder, ph: Phase) {
  const g = GARTH;
  const gx = (g.x0 + g.x1) / 2;
  const gz = (g.z0 + g.z1) / 2;
  const museum = ph === MUSE;
  b.box(g.x1 - g.x0, 0.05, g.z1 - g.z0, museum ? P.grass : P.meadow, { at: [gx, 0, gz], jitter: false });
  b.box(RANGE.R.x0 - RANGE.W.x0, 0.03, RANGE.W.z0 - RANGE.E.z1, PAVING, { at: [(RANGE.W.x0 + RANGE.R.x0) / 2, 0, (RANGE.W.z0 + RANGE.E.z1) / 2], jitter: false });
  const kind = ph === CAROL ? 'timber' : ph <= GOTH ? 'rom' : 'classical';
  const yA = kind === 'timber' ? 2.5 : kind === 'rom' ? 3.2 : 4.0;
  const yW = yA + (kind === 'classical' ? 1.0 : 1.3);
  const roof = kind === 'timber' ? P.shingle : kind === 'rom' ? ROOF : SLATE;
  // which walks stand: after 1792 the church walk and the west walk were pulled down
  const keep = { church: ph !== QUAR, west: ph !== QUAR, east: true, ref: true };
  // the four arcades as [p, q, outward facing] round the garth
  const sides: { p: Pt; q: Pt; key: keyof typeof keep; roofAt: [number, number, number, number]; high: '+x' | '-x' | '+z' | '-z' }[] = [
    { p: [g.x0, g.z1], q: [g.x0, g.z0], key: 'church', roofAt: [RANGE.W.x0, g.x0, g.z0, g.z1], high: '-x' },
    { p: [g.x1, g.z0], q: [g.x1, g.z1], key: 'ref', roofAt: [g.x1, RANGE.R.x0, g.z0, g.z1], high: '+x' },
    { p: [g.x0, g.z0], q: [g.x1, g.z0], key: 'east', roofAt: [RANGE.W.x0, RANGE.R.x0, RANGE.E.z1, g.z0], high: '-z' },
    { p: [g.x0, g.z1], q: [g.x1, g.z1], key: 'west', roofAt: [RANGE.W.x0, RANGE.R.x0, g.z1, RANGE.W.z0], high: '+z' },
  ];
  for (const sd of sides) {
    if (!keep[sd.key]) continue;
    const [x0, x1, z0, z1] = sd.roofAt;
    b.shed(x1 - x0 + 0.1, z1 - z0 + 0.1, yW - yA, roof, { at: [(x0 + x1) / 2, yA, (z0 + z1) / 2], high: sd.high });
    const L = Math.hypot(sd.q[0] - sd.p[0], sd.q[1] - sd.p[1]);
    const mid: Vec3 = [(sd.p[0] + sd.q[0]) / 2, 0, (sd.p[1] + sd.q[1]) / 2];
    const rotY = Math.atan2(-(sd.q[1] - sd.p[1]), sd.q[0] - sd.p[0]);
    if (kind === 'timber') {
      b.group({ at: mid, rotY }, () => {
        b.box(L + 0.3, 0.5, 0.45, CAROL_WALL, { at: [0, 0, 0] });
        const n = Math.round(L / 1.8);
        for (let i = 0; i <= n; i++) b.box(0.2, yA - 0.5, 0.2, P.oak, { at: [-L / 2 + (i * L) / n, 0.5, 0], jitter: false });
        b.box(L + 0.3, 0.22, 0.25, P.oak, { at: [0, yA - 0.22, 0], jitter: false });
      });
    } else if (kind === 'rom') {
      const n = Math.max(4, Math.round(L / 2.1));
      arcadeWall(b, L + 0.5, yA, 0.5, STONE, { at: mid, rotY, n, openW: (L / n) * 0.66, openH: 2.0, sill: 0.6, kind: 'round' });
      // paired colonnettes in the middle of every opening
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;
        const x = sd.p[0] + (sd.q[0] - sd.p[0]) * u;
        const z = sd.p[1] + (sd.q[1] - sd.p[1]) * u;
        b.cyl(0.08, 1.3, P.craie, { at: [x, 0.6, z], segs: 5, jitter: false });
      }
    } else {
      const n = Math.max(4, Math.round(L / 3));
      arcadeWall(b, L + 0.6, yA, 0.6, ph === MUSE ? tint(STONE, 0.03) : STONE, { at: mid, rotY, n, openW: (L / n) * 0.62, openH: 3.0, kind: 'round' });
      b.group({ at: mid, rotY }, () => b.box(L + 0.8, 0.28, 0.75, FRAME, { at: [0, yA - 0.28, 0], jitter: false }));
    }
  }
  if (ph === QUAR) {
    // the pulled-down walks: footings and heaps of stone
    stumps(b, [[g.x0, g.z1], [g.x0, g.z0]], 0.8, 0.5, STONE);
    stumps(b, [[g.x0, g.z1], [g.x1, g.z1]], 0.8, 0.5, STONE);
    b.blob(1.4, mix(P.rubble, STONE, 0.4), { at: [-3.6, -0.6, 4], stretch: [1, 0.6, 1.6], detail: 0 });
  }
  // well or fountain in the middle of the garth
  if (museum) {
    for (const [w, d] of [[g.x1 - g.x0 - 1, 1.2], [1.2, g.z1 - g.z0 - 1]] as const) b.box(w, 0.06, d, P.gravel, { at: [gx, 0, gz], jitter: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(3.6, 0.5, 2.8, P.hedge, { at: [gx + sx * 3.3, 0, gz + sz * 2.8] });
  }
  well(b, STONE);
  if (ph !== CAROL) {
    b.sym((s) => b.box(0.15, 2.0, 0.15, P.iron, { at: [gx + s * 0.75, 0.8, gz], jitter: false }));
    b.box(1.7, 0.12, 0.15, P.iron, { at: [gx, 2.75, gz], jitter: false });
  }
}

/** Dark gable louvre for smoke, on a roof ridge (before chimneys). */
function louvre(b: Builder, x: number, y: number, z: number, roof: number) {
  b.box(0.8, 0.7, 0.8, P.oakDark, { at: [x, y - 0.2, z] });
  b.pyramid(1.1, 1.1, 0.6, roof, { at: [x, y + 0.5, z] });
}

/** The monastic ranges of 830 (rubble and shingle) and of 1090 (ashlar and tile). */
function medievalRanges(b: Builder, rom: boolean) {
  const wall = rom ? STONE : CAROL_WALL;
  const roof = rom ? ROOF : P.shingle;
  const { E, R, W } = RANGE;
  const hE = rom ? 8 : 6.5;
  const hR = rom ? 8.5 : 6;
  const hW = rom ? 7.5 : 6;
  const fr = rom ? FRAME : undefined;
  const kind: Arch = 'round';

  // east range: chapter house below, dormitory above
  const ex = (E.x0 + E.x1) / 2;
  const ez = (E.z0 + E.z1) / 2;
  b.box(E.x1 - E.x0, hE, E.z1 - E.z0, wall, { at: [ex, 0, ez] });
  b.gable(E.x1 - E.x0, E.z1 - E.z0, 3.9, roof, { ridge: 'x', at: [ex, hE, ez], overhang: 0.3, wall });
  for (let x = -0.5; x <= 18; x += 2.4) {
    win(b, kind, 0.6, 1.2, [x, hE - 2.0, E.z1], '+z', { frame: fr, bd: 0.1 });
    win(b, kind, 0.6, 1.2, [x, hE - 2.0, E.z0], '-z', { frame: fr, bd: 0.1 });
  }
  // the chapter house opens on to the cloister walk by a door between two windows
  win(b, 'round', 1.4, 2.7, [GATE_X, 0, E.z1], '+z', { frame: fr ?? tint(wall, -0.1), glass: DOOR });
  for (const dx of [-1.9, 1.9]) win(b, 'round', 1.1, 1.8, [GATE_X + dx, 0.8, E.z1], '+z', { frame: fr ?? tint(wall, -0.1) });
  for (const x of [1.5, 4.0, 6.5]) win(b, kind, 0.8, 1.6, [x, 1.4, E.z0], '-z', { frame: fr });
  win(b, kind, 0.9, 1.8, [E.x1, hE - 3.0, ez], '+x', { frame: fr });
  // the latrine block (reredorter) behind the dormitory
  b.box(4, hE - 1.5, 3, wall, { at: [15.5, 0, E.z0 - 1.5] });
  b.gable(4, 3, 2.2, roof, { ridge: 'z', at: [15.5, hE - 1.5, E.z0 - 1.5], overhang: 0.2, wall });
  b.box(4, 0.05, 1.2, P.water, { at: [15.5, 0, E.z0 - 3.4], mat: 'glass', jitter: false });

  // refectory: one tall hall with high windows
  const rx = (R.x0 + R.x1) / 2;
  const rz = (R.z0 + R.z1) / 2;
  b.box(R.x1 - R.x0, hR, R.z1 - R.z0, wall, { at: [rx, 0, rz] });
  b.gable(R.x1 - R.x0, R.z1 - R.z0, 3.9, roof, { ridge: 'z', at: [rx, hR, rz], overhang: 0.3, wall });
  for (const z of [-2.4, 0.6, 3.6, 6.6, 9.4]) {
    win(b, kind, rom ? 1.1 : 0.8, rom ? 3.4 : 2.0, [R.x1, rom ? 3.0 : 2.6, z], '+x', { frame: fr });
    win(b, kind, 0.8, 1.6, [R.x0, hR - 2.5, z], '-x', { frame: fr });
  }
  win(b, 'round', 1.3, 2.5, [R.x0, 0, 3.0], '-x', { frame: fr ?? tint(wall, -0.1), glass: DOOR });
  louvre(b, rx, hR + 3.9, 7.5, roof);

  // west range: cellars below, the cellarer's and guests' rooms above, the gate passage through
  const wx = (W.x0 + W.x1) / 2;
  const wz = (W.z0 + W.z1) / 2;
  b.box(W.x1 - W.x0, hW, W.z1 - W.z0, wall, { at: [wx, 0, wz] });
  b.gable(W.x1 - W.x0, W.z1 - W.z0, 3.6, roof, { ridge: 'x', at: [wx, hW, wz], overhang: 0.3, wall });
  for (const [zf, f] of [[W.z1, '+z'], [W.z0, '-z']] as const) {
    win(b, 'round', 2.4, 3.4, [GATE_X, 0, zf], f, { frame: fr ?? tint(wall, -0.1), glass: P.timberBlack, bd: 0.2 });
    for (const x of [-2.2, 0.4, 7.4, 10, 12.6, 15.2, 17.6]) {
      if (f === '+z' || x > 10) win(b, kind, 0.5, 1.0, [x, 1.6, zf], f, { frame: fr, bd: 0.08 });
      win(b, kind, 0.7, 1.4, [x, hW - 2.4, zf], f, { frame: fr, bd: 0.1 });
    }
  }
  win(b, kind, 0.8, 1.6, [W.x1, hW - 2.6, wz], '+x', { frame: fr });
  win(b, 'round', 1.2, 2.3, [W.x1, 0, wz], '+x', { frame: fr ?? tint(wall, -0.1), glass: DOOR });
}

/** A small dormer window on a roof slope facing `f`. */
function dormer(b: Builder, x: number, y: number, z: number, f: Facing, roof: number, wall: number) {
  b.group({ at: [x, y, z], rotY: facingAngle(f) }, () => {
    b.box(1.1, 1.4, 1.4, wall, { at: [0, 0, 0] });
    b.gable(1.1, 1.6, 0.7, roof, { ridge: 'z', at: [0, 1.4, -0.1], overhang: 0.12, wall });
    flat(b, rectPts(-0.35, 0.15, 0.35, 1.15), DARK, [0, 0, 0.7], '+z', 0.02);
  });
}

/**
 * The Maurist ranges of about 1700: long three-storey blocks of ashlar under hipped slate roofs, with
 * regular tall windows, string courses and a pedimented frontispiece on the outer fronts. After 1792
 * the east range is a spinning mill and the west range a barracks; in 1995 a museum.
 */
function mauristRanges(b: Builder, ph: Phase) {
  const wall = ph === MUSE ? tint(STONE, 0.03) : ph === QUAR ? tint(STONE, -0.04) : STONE;
  const H = 12;
  const { E, R, W } = RANGE;
  const fr = tint(wall, 0.06);
  type Face = { x0: number; x1: number; z0: number; z1: number; ridge: 'x' | 'z' };
  const blocks: Face[] = [
    { ...E, ridge: 'x' },
    { ...R, ridge: 'z' },
    { ...W, ridge: 'x' },
  ];
  for (const k of blocks) {
    const w = k.x1 - k.x0;
    const d = k.z1 - k.z0;
    const cx = (k.x0 + k.x1) / 2;
    const cz = (k.z0 + k.z1) / 2;
    b.box(w, H, d, wall, { at: [cx, 0, cz] });
    for (const y of [4.3, 8.3]) b.box(w + 0.12, 0.22, d + 0.12, fr, { at: [cx, y, cz], jitter: false });
    b.box(w + 0.4, 0.4, d + 0.4, fr, { at: [cx, H - 0.4, cz], jitter: false });
    b.hip(w + 0.3, d + 0.3, 4.6, SLATE, { at: [cx, H, cz] });
  }
  // windows on all faces, three storeys, on a 3 m rhythm; ground floor hidden behind the walks
  const ys = [1.2, 5.0, 9.0];
  const hs = [2.5, 2.6, 2.1];
  const row = (x0: number, x1: number, fixed: number, f: Facing, along: 'x' | 'z', ground: boolean, skip?: (u: number) => boolean) => {
    const n = Math.max(1, Math.round((x1 - x0) / 3));
    for (let i = 0; i < n; i++) {
      const u = x0 + ((i + 0.5) * (x1 - x0)) / n;
      if (skip?.(u)) continue;
      for (let s = ground ? 0 : 1; s < 3; s++) {
        const at: Vec3 = along === 'x' ? [u, ys[s], fixed] : [fixed, ys[s], u];
        win(b, 'rect', 1.15, hs[s], at, f, { frame: fr, bd: 0.13 });
      }
    }
  };
  const nearGate = (u: number) => Math.abs(u - GATE_X) < 1.7;
  row(E.x0 + 0.5, E.x1, E.z0, '-z', 'x', true);
  row(-2.4, E.x1 - 6.5, E.z1, '+z', 'x', false);
  row(R.z0 + 0.5, R.z1 - 0.5, R.x1, '+x', 'z', true, (u) => Math.abs(u - 3) < 2);
  row(R.z0 + 0.5, R.z1 - 0.5, R.x0, '-x', 'z', false);
  row(W.x0 + 0.5, W.x1, W.z1, '+z', 'x', true, nearGate);
  row(W.x0 + 0.5, W.x1 - 6.5, W.z0, '-z', 'x', false);
  row(W.z0 + 0.5, W.z1 - 0.5, W.x1, '+x', 'z', true);
  row(E.z0 + 0.5, E.z1 - 0.5, E.x1, '+x', 'z', true);
  // frontispieces with pediments: the refectory front (+X) and the entrance front (+Z) with its gate
  const front = (x: number, z: number, f: Facing, door: boolean) => {
    b.group({ at: [x, 0, z], rotY: facingAngle(f) }, () => {
      b.box(4.6, H, 0.35, wall, { at: [0, 0, 0.17] });
      b.sym((s) => b.box(0.5, H - 0.4, 0.2, fr, { at: [s * 2.05, 0, 0.42], jitter: false }));
      b.extrude([[-2.6, 0], [2.6, 0], [0, 1.9]], 0.5, fr, { at: [0, H, 0.2] });
      flat(b, [[-1.9, 0.25], [1.9, 0.25], [0, 1.45]], tint(wall, -0.05), [0, H, 0.45], '+z', 0.02);
      if (door) {
        win(b, 'round', 2.4, 3.6, [0, 0, 0.35], '+z', { frame: fr, glass: P.doorGreen, bd: 0.2 });
      } else {
        win(b, 'round', 1.4, 3.0, [0, 0, 0.35], '+z', { frame: fr, glass: DARK, bd: 0.15, transom: 0.7 });
      }
      for (let s = 1; s < 3; s++) win(b, 'rect', 1.15, hs[s], [0, ys[s], 0.35], '+z', { frame: fr, bd: 0.13 });
    });
  };
  front(R.x1, 3, '+x', false);
  front(GATE_X, W.z1, '+z', true);
  win(b, 'round', 2.4, 3.6, [GATE_X, 0, W.z0], '-z', { frame: fr, glass: P.timberBlack, bd: 0.2 });
  // dormers on the outer slopes
  for (const x of [1, 6.5, 12, 17]) dormer(b, x, H + 0.5, E.z0 + 0.9, '-z', SLATE, wall);
  for (const z of [-1, 7]) dormer(b, R.x1 - 0.9, H + 0.5, z, '+x', SLATE, wall);
  for (const x of [-1.5, 9, 14.5]) dormer(b, x, H + 0.5, W.z1 - 0.9, '+z', SLATE, wall);
  // tall stone chimneys (the monks now have fireplaces in their cells)
  for (const [x, z] of [[2, -8.2], [12, -8.2], [15.8, 3], [0, 14], [12, 14]] as const) b.chimney(0.8, 3.4, 1.4, wall, { at: [x, H + 2.6, z] });
}

/** The ranges for any phase. */
export function ranges(b: Builder, ph: Phase) {
  if (ph === CAROL) medievalRanges(b, false);
  else if (ph <= GOTH) medievalRanges(b, true);
  else mauristRanges(b, ph);
  const { E, R, W } = RANGE;
  b.collider(E.x1 - E.x0, E.z1 - E.z0, { at: [(E.x0 + E.x1) / 2, 0, (E.z0 + E.z1) / 2] });
  b.collider(R.x1 - R.x0, R.z1 - R.z0, { at: [(R.x0 + R.x1) / 2, 0, (R.z0 + R.z1) / 2] });
  const g0 = GATE_X - 1.3;
  const g1 = GATE_X + 1.3;
  b.collider(g0 - W.x0, W.z1 - W.z0, { at: [(W.x0 + g0) / 2, 0, (W.z0 + W.z1) / 2] });
  b.collider(W.x1 - g1, W.z1 - W.z0, { at: [(g1 + W.x1) / 2, 0, (W.z0 + W.z1) / 2] });
  if (ph <= GOTH) b.collider(4, 3, { at: [15.5, 0, E.z0 - 1.5] });
}

/** Everything that stands from 830 on, for the given phase. */
export function abbey(b: Builder, ph: Phase) {
  const cut = ph === GOTH || ph === MAUR ? b.cutaway : false;
  if (ph <= MAUR) church(b, ph, cut);
  else churchRemains(b, ph);
  cloister(b, ph);
  ranges(b, ph);
}
