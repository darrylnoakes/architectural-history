import * as THREE from 'three';
import { CutField, P, mix, tint, facingAngle, type Builder, type Cut, type Facing, type Vec3 } from '@ah/kit';

/*
 * The castle site, shared by the motte (960), the keep (1100), the castle of Philip Augustus (1220),
 * the residential castle (1395) and its restoration (1865). The earth mound of 960 stays under every
 * keep that follows, at the back left corner of the plot:
 *
 *   motte            centre (-10, -12), foot radius 11.5, summit radius 7 at 6 m
 *   bailey (960)     a palisaded enclosure towards +X and +Z, its gate at the front
 *   castle (1220)    a regular four-sided circuit, corners (-10, -12) (the keep on the mound),
 *                    (14, -12), (14, 15) and (-10, 15); round corner and flank towers, the gate
 *                    between twin towers in the middle of the front (x 2, z 15)
 *
 * The châteaux of 1520 and 1660 are another building on another plot and share only the helpers.
 */

export type Pt = [number, number];
export type Arch = 'rect' | 'round' | 'pointed';

export type Phase = 0 | 1 | 2 | 3 | 4;
export const MOTTE_P = 0;
export const DONJON = 1;
export const PHILIP = 2;
export const RESID = 3;
export const RESTORED = 4;

export const STONE = mix(P.pierreBlonde, P.limestone, 0.4);
export const STONE_NEW = mix(P.craie, P.pierreBlonde, 0.12);
export const DARK = P.windowDark;
export const SLIT = P.black;
export const SLATE = P.ardoise;
export const TILE = P.tuilePlate;
export const DITCH = mix(P.soil, P.earth, 0.45);

// ------------------------------------------------------------------ raw geometry

export function soup(b: Builder, pos: number[], color: number, o?: { at?: Vec3; mat?: 'matte' | 'glass' }): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { at: o?.at, mat: o?.mat });
}

/** Point at radius r and angle t about (cx, cz); t = 0 is +Z, t = PI / 2 is +X. */
export function pol(cx: number, cz: number, r: number, t: number): Pt {
  return [cx + r * Math.sin(t), cz + r * Math.cos(t)];
}

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

export function rectPts(x0: number, y0: number, x1: number, y1: number): Pt[] {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

/** A flat single-sided shape on a wall: `at` is a point on the wall surface. */
export function flat(b: Builder, pts: Pt[], color: number, at: Vec3, facing: Facing, off = 0.04, mat?: 'matte' | 'glass'): void {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), 3);
  g.translate(0, 0, off);
  b.add(g, color, { at, rotY: facingAngle(facing), jitter: false, mat });
}

/** A cheap window or door, flat on the wall, with optional surround, mullion and transom. */
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
  const fr = o?.frame ?? STONE;
  const t = Math.min(0.1, w * 0.09);
  const straight = kind === 'rect' ? h : kind === 'round' ? h - w / 2 : h - Math.min(h - 0.01, (w / 2) * 1.7);
  if (o?.mullion) flat(b, rectPts(-t / 2, 0, t / 2, straight), fr, at, facing, 0.08);
  if (o?.transom) flat(b, rectPts(-w / 2, straight * o.transom - t / 2, w / 2, straight * o.transom + t / 2), fr, at, facing, 0.08);
}

/** A box between two plan points, `t` thick and `h` tall, base at y0. */
export function wallSeg(b: Builder, p: Pt, q: Pt, y0: number, h: number, t: number, color: number, ext = 0.1): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  if (L < 1e-4) return;
  b.box(L + ext, h, t, color, { at: [(p[0] + q[0]) / 2, y0, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** One walk collider along a segment. */
export function segCollider(b: Builder, p: Pt, q: Pt, t: number): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  b.collider(Math.hypot(dx, dz) + t * 0.5, t, { at: [(p[0] + q[0]) / 2, 0, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** A flat strip on the ground along a polyline (ditches, paths). */
export function strip(b: Builder, pts: Pt[], width: number, y: number, color: number, mat?: 'matte' | 'glass'): void {
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (-(z1 - z0) / L) * (width / 2);
    const nz = ((x1 - x0) / L) * (width / 2);
    const ex = ((x1 - x0) / L) * (width / 2);
    const ez = ((z1 - z0) / L) * (width / 2);
    const a = [x0 - ex + nx, y, z0 - ez + nz];
    const bb = [x1 + ex + nx, y, z1 + ez + nz];
    const c = [x1 + ex - nx, y, z1 + ez - nz];
    const d = [x0 - ex - nx, y, z0 - ez - nz];
    out.push(...a, ...bb, ...c, ...a, ...c, ...d);
  }
  soup(b, out, color, { mat });
}

/** A palisade of split oak stakes with pointed tops along a polyline; `base` gives the ground height. */
export function palisade(b: Builder, pts: Pt[], h: number, color: number, base: (x: number, z: number) => number = () => 0): void {
  const s = 0.42;
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(L / s));
    for (let k = 0; k < n; k++) {
      const ax = x0 + ((x1 - x0) * k) / n;
      const az = z0 + ((z1 - z0) * k) / n;
      const bx = x0 + ((x1 - x0) * (k + 1)) / n;
      const bz = z0 + ((z1 - z0) * (k + 1)) / n;
      const mx = (ax + bx) / 2;
      const mz = (az + bz) / 2;
      const g = base(mx, mz);
      const top = g + h * (0.94 + 0.06 * (((k * 7) % 5) / 4));
      out.push(ax, g - 0.4, az, bx, g - 0.4, bz, bx, top, bz, ax, g - 0.4, az, bx, top, bz, ax, top, az);
      out.push(ax, top, az, bx, top, bz, mx, top + s * 1.1, mz);
    }
  }
  soup(b, out, color);
}

// ------------------------------------------------------------------ the motte

export const MOTTE = { x: -10, z: -12, rBase: 11.5, rTop: 7, h: 6 };
const PROFILE: [number, number][] = [
  [MOTTE.rBase, 0],
  [10.8, 0.6],
  [9.4, 2.6],
  [8.1, 4.5],
  [7.3, 5.6],
  [MOTTE.rTop, MOTTE.h],
  [0, MOTTE.h],
];

/** Height of the mound at plan point (x, z); 0 off it. */
export function motteY(x: number, z: number): number {
  const r = Math.hypot(x - MOTTE.x, z - MOTTE.z);
  if (r >= MOTTE.rBase) return 0;
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [r0, y0] = PROFILE[i];
    const [r1, y1] = PROFILE[i + 1];
    if (r <= r0 && r >= r1) return y0 + ((y1 - y0) * (r0 - r)) / (r0 - r1 || 1);
  }
  return MOTTE.h;
}

/** The mound, its walkable summit and (960 and 1100) the ditch dug round its foot on the bailey side. */
export function motte(b: Builder, color: number, ditch: boolean): void {
  b.lathe(PROFILE, color, { at: [MOTTE.x, 0, MOTTE.z], segs: 22 });
  b.deck(MOTTE.rTop * 1.4, MOTTE.rTop * 1.4, MOTTE.h, { at: [MOTTE.x, 0, MOTTE.z] });
  if (ditch) {
    const c = MOTTE_CUTS[0];
    b.dig(c.pts, c.depth, { slope: c.slope, color: c.color });
  }
}

// ------------------------------------------------------------------ the earthworks of 960 and 1220

/** The bailey boundary, from the foot of the mound at the back round to the mound on the left. */
export const BAILEY_A: Pt[] = [[-2.5, -19], [10, -20], [17.5, -12], [18, 6], [13, 17], [6.6, 18.2]];
export const BAILEY_B: Pt[] = [[2.4, 18.2], [-8, 17], [-16.5, 9], [-18.5, -5]];
export const GATE: Pt = [4.5, 18.2];

/**
 * Offset a polyline sideways by d along its right-hand normal (-dz, dx), mitring the corners. For the
 * bailey line and the castle's circuit, as they run here, a positive d moves the line inwards.
 */
export function offsetLine(pts: Pt[], d: number): Pt[] {
  const n = (i: number): Pt => {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    return [-(z1 - z0) / L, (x1 - x0) / L];
  };
  return pts.map(([x, z], i) => {
    if (i === 0 || i === pts.length - 1) {
      const m = n(Math.min(i, pts.length - 2));
      return [x + m[0] * d, z + m[1] * d] as Pt;
    }
    const a = n(i - 1);
    const c = n(i);
    let mx = a[0] + c[0];
    let mz = a[1] + c[1];
    const L = Math.hypot(mx, mz) || 1;
    mx /= L;
    mz /= L;
    const k = d / (mx * a[0] + mz * a[1]);
    return [x + mx * k, z + mz * k] as Pt;
  });
}

/**
 * The ditch of 960, kept in 1100: a V-shaped ring round the bailey side of the mound (the rest of
 * its foot lies at the edge of the plot), and the bailey ditch outside the palisade, which runs out of
 * the motte ditch at the back, round the bailey and across the gate, and back into it on the left.
 */
export const MOTTE_DITCH = { r0: MOTTE.rBase, r1: MOTTE.rBase + 3, a0: -0.8, a1: 2.45, depth: 1.6, slope: 1.5 };
export const BAILEY_DITCH = { off: 2.4, half: 1.4, depth: 1.4, slope: 1.4 };
/** The ditch of 1220 round the castle's circuit, kept until the end: from 3.6 to 7.6 m out from the curtain. */
export const CASTLE_DITCH = { inner: 3.6, outer: 7.6, depth: 2.4, slope: 1.5 };

function ringOutline(r0: number, r1: number, a0: number, a1: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push(pol(MOTTE.x, MOTTE.z, r0, a0 + ((a1 - a0) * i) / n));
  for (let i = n; i >= 0; i--) pts.push(pol(MOTTE.x, MOTTE.z, r1, a0 + ((a1 - a0) * i) / n));
  return pts;
}

/** Centre line of the bailey ditch: out of the motte ditch at the back, round, and into it on the left. */
export const BAILEY_DITCH_PATH: Pt[] = (() => {
  const mid = offsetLine([...BAILEY_A, ...BAILEY_B], -BAILEY_DITCH.off);
  const rm = (MOTTE_DITCH.r0 + MOTTE_DITCH.r1) / 2;
  return [...mid.slice(0, -1), pol(MOTTE.x, MOTTE.z, rm, MOTTE_DITCH.a0 + 0.12)];
})();

export const MOTTE_CUTS: Cut[] = (() => {
  const { r0, r1, a0, a1, depth, slope } = MOTTE_DITCH;
  const band = [...offsetLine(BAILEY_DITCH_PATH, -BAILEY_DITCH.half), ...offsetLine(BAILEY_DITCH_PATH, BAILEY_DITCH.half).reverse()];
  return [
    { pts: ringOutline(r0, r1, a0, a1, 18), depth, slope, color: DITCH },
    { pts: band, depth: BAILEY_DITCH.depth, slope: BAILEY_DITCH.slope, color: DITCH },
  ];
})();

/** The circuit of 1220 as one line, from the foot of the mound at the back round to it on the left. */
const CIRCUIT_PATH: Pt[] = [[0, -12], [14, -12], [14, 15], [-10, 15], [-10, -1]];

export const CASTLE_CUT: Cut = {
  pts: [...offsetLine(CIRCUIT_PATH, -CASTLE_DITCH.inner), ...offsetLine(CIRCUIT_PATH, -CASTLE_DITCH.outer).reverse()],
  depth: CASTLE_DITCH.depth,
  slope: CASTLE_DITCH.slope,
  color: DITCH,
};

let motteField: CutField | null = null;
let castleField: CutField | null = null;

/** The ground of 960 and 1100: the mound, less the ditches. */
export function ground960(x: number, z: number): number {
  motteField ??= new CutField(MOTTE_CUTS);
  return motteY(x, z) - motteField.depth(x, z);
}

/** The ground from 1220: the mound, less the castle ditch. */
export function ground1220(x: number, z: number): number {
  castleField ??= new CutField([CASTLE_CUT]);
  return motteY(x, z) - castleField.depth(x, z);
}

/** Dig the bailey ditch (the motte's own ring is dug by `motte`). */
export function baileyDitch(b: Builder): void {
  const c = MOTTE_CUTS[1];
  b.dig(c.pts, c.depth, { slope: c.slope, color: c.color });
}

// ------------------------------------------------------------------ towers and walls

/** Arrow slits round a tower of radius r, `n` to a ring, at each height in ys. */
function slits(b: Builder, x: number, z: number, r: number, ys: number[], n: number, a0 = 0, sweep = Math.PI * 2) {
  for (const [j, y] of ys.entries()) {
    for (let k = 0; k < n; k++) {
      const t = a0 + ((k + 0.5 + (j % 2) * 0.5) / n) * sweep;
      const [px, pz] = pol(x, z, r * 0.985, t);
      flat(b, rectPts(-0.09, 0, 0.09, 1.6), SLIT, [px, y, pz], t, 0.03);
    }
  }
}

export type TopStyle = 'crenel' | 'mach' | 'restored';

/**
 * A round tower standing at (x, z) on ground y0, rising h above it. 'crenel': battlements on top;
 * 'mach': a parapet on machicolations and a conical slate roof; 'restored': the same, taller and
 * finished with a lead finial and weathervane.
 */
export function roundTower(
  b: Builder,
  x: number,
  z: number,
  r: number,
  y0: number,
  h: number,
  stone: number,
  o: { top: TopStyle; roofH?: number; segs?: number; slitN?: number; outward?: number; windows?: number; lift?: number },
): void {
  const segs = o.segs ?? 12;
  const top = y0 + h;
  b.cyl(r + 0.7, 2.6, tint(stone, -0.04), { at: [x, y0 - 0.6, z], rTop: r, segs });
  // a tower raised later is built in two lifts, the old shaft and the new top on it
  const h1 = o.lift !== undefined ? Math.min(h, o.lift) : h;
  b.cyl(r, h1, stone, { at: [x, y0, z], segs });
  if (h > h1 + 1e-6) b.cyl(r, h - h1, stone, { at: [x, y0 + h1, z], segs });
  const sweep = o.outward !== undefined ? Math.PI * 1.3 : Math.PI * 2;
  const a0 = o.outward !== undefined ? o.outward - sweep / 2 : 0;
  const ys: number[] = [];
  for (let y = y0 + 2.2; y < top - 3; y += 3.6) ys.push(y);
  slits(b, x, z, r, ys, o.slitN ?? 4, a0, sweep);
  if (o.windows && o.outward !== undefined) {
    // later, larger windows towards the courtyard side
    for (let i = 0; i < o.windows; i++) {
      const t = o.outward + Math.PI + (i - (o.windows - 1) / 2) * 0.55;
      const [px, pz] = pol(x, z, r * 0.985, t);
      win(b, 'rect', 0.9, 1.7, [px, top - 5.5 - i * 0.2, pz], t, { frame: tint(stone, 0.06), bd: 0.1, mullion: true, transom: 0.6 });
    }
  }
  if (o.top === 'crenel') {
    b.cyl(r + 0.15, 0.4, tint(stone, -0.03), { at: [x, top, z], segs });
    const n = Math.max(6, Math.round(r * 2.6));
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2;
      const [px, pz] = pol(x, z, r - 0.1, t);
      b.box(Math.min(0.9, (r * 2 * Math.PI) / n / 2), 0.9, 0.5, stone, { at: [px, top + 0.4, pz], rotY: t, jitter: false });
    }
    return;
  }
  // machicolations: a parapet carried out on corbels, the gaps between them dark
  const R = r + 0.75;
  const yb = top - 1.8;
  const yp = top - 0.5;
  const restored = o.top === 'restored';
  b.lathe([[r + 0.03, yb], [r + 0.03, yp]], tint(stone, -0.45), { at: [x, 0, z], segs, jitter: false });
  const n = Math.max(10, Math.round((2 * Math.PI * r) / 0.95));
  const pos: number[] = [];
  for (let k = 0; k < n; k++) {
    const t = ((k + 0.5) / n) * Math.PI * 2;
    const dl = 0.19 / r;
    const [ax, az] = pol(x, z, r + 0.04, t - dl);
    const [bx, bz] = pol(x, z, r + 0.04, t + dl);
    const [cx, cz] = pol(x, z, R - 0.06, t + dl);
    const [dx, dz] = pol(x, z, R - 0.06, t - dl);
    pos.push(ax, yb, az, bx, yb, bz, cx, yp - 0.3, cz, ax, yb, az, cx, yp - 0.3, cz, dx, yp - 0.3, dz);
    pos.push(dx, yp - 0.3, dz, cx, yp - 0.3, cz, cx, yp, cz, dx, yp - 0.3, dz, cx, yp, cz, dx, yp, dz);
  }
  soup(b, pos, tint(stone, 0.03));
  b.lathe([[r, yp], [R, yp], [R, top + 1.3], [r - 0.2, top + 1.3]], stone, { at: [x, 0, z], segs });
  const roofH = o.roofH ?? r * 2.2;
  b.cone(R + 0.25, roofH, restored ? SLATE : P.slate, { at: [x, top + 1.25, z], segs });
  if (restored) {
    b.cyl(R + 0.3, 0.2, P.lead, { at: [x, top + 1.2, z], segs, jitter: false });
    b.cyl(0.12, 2.0, P.lead, { at: [x, top + 1.25 + roofH - 0.3, z], segs: 5 });
    b.sphere(0.25, P.gold, { at: [x, top + 1.25 + roofH + 0.9, z], segs: 6 });
    b.box(0.7, 0.4, 0.03, P.gold, { at: [x + 0.25, top + 1.25 + roofH + 1.25, z], jitter: false });
    // a dormer in the roof, towards the court
    const t = (o.outward ?? 0) + Math.PI;
    const rr = (R + 0.25) * (1 - 1.9 / roofH) - 0.15;
    const [dx, dz] = pol(x, z, rr, t);
    b.group({ at: [dx, top + 1.5, dz], rotY: t }, () => {
      b.box(0.9, 1.5, 1.6, stone, { at: [0, 0, -0.4] });
      b.extrude([[-0.6, 0], [0.6, 0], [0, 1.1]], 0.2, stone, { at: [0, 1.5, 0.35] });
      flat(b, rectPts(-0.28, 0.15, 0.28, 1.25), DARK, [0, 0, 0.4], '+z', 0.02);
    });
  }
}

/**
 * A curtain wall from p to q in pieces about 4 m long, each standing on the ground under it (so it
 * climbs the motte), the wall-walk h above the ground. `out` is any point outside the castle, used to
 * put the battlements or machicolations on the outer face.
 */
export function curtain(
  b: Builder,
  p: Pt,
  q: Pt,
  h: number,
  t: number,
  stone: number,
  o: { top: TopStyle; inside: Pt; base?: (x: number, z: number) => number; lift?: number },
): void {
  const base = o.base ?? motteY;
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  const onMound = Math.min(Math.hypot(p[0] - MOTTE.x, p[1] - MOTTE.z), Math.hypot(q[0] - MOTTE.x, q[1] - MOTTE.z)) < MOTTE.rBase + 1;
  const n = Math.max(1, Math.ceil(L / (onMound ? 3.2 : 9)));
  const ang = Math.atan2(-dz, dx);
  let nx = dz / L;
  let nz = -dx / L;
  const mx0 = (p[0] + q[0]) / 2;
  const mz0 = (p[1] + q[1]) / 2;
  if (nx * (o.inside[0] - mx0) + nz * (o.inside[1] - mz0) > 0) {
    nx = -nx;
    nz = -nz;
  }
  const dark = tint(stone, -0.35);
  for (let k = 0; k < n; k++) {
    const ax = p[0] + (dx * k) / n;
    const az = p[1] + (dz * k) / n;
    const bx = p[0] + (dx * (k + 1)) / n;
    const bz = p[1] + (dz * (k + 1)) / n;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const lo = Math.min(base(ax, az), base(bx, bz)) - 0.6;
    const top = base(mx, mz) + h;
    const len = L / n + 0.5;
    // a wall raised later is built in two lifts: the old wall up to its wall-walk, then the new courses
    const cut = o.lift !== undefined ? Math.min(top, base(mx, mz) + o.lift) : top;
    b.box(len, cut - lo, t, stone, { at: [mx, lo, mz], rotY: ang });
    if (top > cut + 1e-6) b.box(len, top - cut, t, stone, { at: [mx, cut, mz], rotY: ang });
    // a low parapet on the inner edge
    b.box(len, 0.6, 0.35, stone, { at: [mx - nx * (t / 2 - 0.17), top, mz - nz * (t / 2 - 0.17)], rotY: ang, jitter: false });
    const ox = mx + nx * (t / 2);
    const oz = mz + nz * (t / 2);
    if (o.top === 'crenel') {
      const m = Math.max(1, Math.round(len / 1.7));
      for (let j = 0; j < m; j++) {
        const u = (j + 0.5) / m - 0.5;
        b.box(0.85, 1.0, 0.45, stone, { at: [ox - nx * 0.22 + (dx / L) * u * len, top, oz - nz * 0.22 + (dz / L) * u * len], rotY: ang, jitter: false });
      }
      b.box(len, 0.06, t - 0.6, tint(stone, -0.08), { at: [mx, top, mz], rotY: ang, jitter: false });
      continue;
    }
    // machicolated parapet standing out from the outer face on corbels
    const ux = dx / L;
    const uz = dz / L;
    const yb = top - 1.9;
    const yp = top - 0.6;
    b.box(len, yp - yb, 0.06, dark, { at: [ox + nx * 0.03, yb, oz + nz * 0.03], rotY: ang, jitter: false });
    const m = Math.max(2, Math.round(len / 0.95));
    const pos: number[] = [];
    for (let j = 0; j < m; j++) {
      const u = ((j + 0.5) / m - 0.5) * (len - 0.3);
      const cx = ox + ux * u;
      const cz = oz + uz * u;
      const w = 0.18;
      pos.push(cx - ux * w, yb, cz - uz * w, cx + ux * w, yb, cz + uz * w, cx + ux * w + nx * 0.32, yp, cz + uz * w + nz * 0.32);
      pos.push(cx - ux * w, yb, cz - uz * w, cx + ux * w + nx * 0.32, yp, cz + uz * w + nz * 0.32, cx - ux * w + nx * 0.32, yp, cz - uz * w + nz * 0.32);
    }
    soup(b, pos, tint(stone, 0.03));
    b.box(len, 1.9, 0.5, stone, { at: [ox + nx * 0.55, yp, oz + nz * 0.55], rotY: ang });
    b.box(len, 0.06, t - 0.6, tint(stone, -0.08), { at: [mx, top, mz], rotY: ang, jitter: false });
    if (o.top === 'restored') {
      // restored: the wall-walk covered by a slate roof
      b.group({ at: [mx + nx * 0.25, top + 1.3, mz + nz * 0.25], rotY: ang }, () => {
        b.gable(len, t + 1.0, 1.7, SLATE, { ridge: 'x', overhang: 0.15, wall: stone });
      });
    }
  }
}

/** Walk colliders along a curtain. */
export function curtainColliders(b: Builder, pts: Pt[], t: number): void {
  for (let i = 0; i < pts.length - 1; i++) segCollider(b, pts[i], pts[i + 1], t);
}

// ------------------------------------------------------------------ the castle plan (1220 on)

export const C = { x0: -10, x1: 14, z0: -12, z1: 15, gateX: 2, gateHalf: 4.5, inside: [2, 2] as Pt };
export const KEEP_R = 5.0;
/** The height of the curtains of 1220, at which the walls of 1395 are raised in a second lift. */
export const GATE_LIFT = 9;
export const CHEMISE_R = 6.6;

/** The ring wall on the summit of the mound, round the keep (from 1100). */
export function chemise(b: Builder, stone: number, top: TopStyle, gap = 0.0) {
  const n = 18;
  const y = MOTTE.h;
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * Math.PI * 2;
    const t1 = ((i + 1) / n) * Math.PI * 2;
    const tm = (t0 + t1) / 2;
    // the gate in the ring faces the bailey
    if (gap && Math.abs(Math.atan2(Math.sin(tm - 0.68), Math.cos(tm - 0.68))) < gap) continue;
    const p = pol(MOTTE.x, MOTTE.z, CHEMISE_R, t0);
    const q = pol(MOTTE.x, MOTTE.z, CHEMISE_R, t1);
    wallSeg(b, p, q, y - 1.2, 5.2, 0.9, stone, 0.25);
    const m = pol(MOTTE.x, MOTTE.z, CHEMISE_R + 0.25, tm);
    if (top === 'crenel') b.box(0.9, 0.9, 0.4, stone, { at: [m[0], y + 4.0, m[1]], rotY: tm, jitter: false });
    else wallSeg(b, pol(MOTTE.x, MOTTE.z, CHEMISE_R + 0.25, t0), pol(MOTTE.x, MOTTE.z, CHEMISE_R + 0.25, t1), y + 3.6, 1.2, 0.5, stone, 0.3);
  }
}

/** The square stone keep of 1100 on the summit, 9 by 7.5 m and 18 m tall. */
export function squareKeep(b: Builder, stone: number) {
  const w = 9;
  const d = 7.5;
  const H = 18;
  const y0 = MOTTE.h;
  b.group({ at: [MOTTE.x, y0, MOTTE.z] }, () => {
    b.box(w + 1.0, 1.6, d + 1.0, tint(stone, -0.05), { at: [0, -0.8, 0] });
    b.box(w, H, d, stone);
    // flat pilaster buttresses: two on each long face, one on each end, clasping at the corners
    for (const s of [-1, 1]) {
      for (const x of [-w / 2 + 0.3, -1.5, 1.5, w / 2 - 0.3]) b.box(0.9, H - 0.4, 0.35, stone, { at: [x, 0, s * (d / 2 + 0.17)] });
      for (const z of [-d / 2 + 0.3, 0, d / 2 - 0.3]) b.box(0.35, H - 0.4, 0.9, stone, { at: [s * (w / 2 + 0.17), 0, z] });
    }
    // windows: slits below, small round-headed lights higher up, paired lights to the lord's hall
    for (const [f, fx, fz, len] of [['+z', 0, d / 2, w], ['-z', 0, -d / 2, w], ['+x', w / 2, 0, d], ['-x', -w / 2, 0, d]] as const) {
      const along = f === '+z' || f === '-z';
      const us = len > 8 ? [-2.9, 0, 2.9] : [-1.9, 1.9];
      for (const u of us) {
        const at = (y: number): Vec3 => (along ? [u, y, fz] : [fx, y, u]);
        flat(b, rectPts(-0.1, 0, 0.1, 1.3), SLIT, at(2.2), f, 0.03);
        win(b, 'round', 0.5, 1.3, at(7.6), f, { frame: tint(stone, 0.06), bd: 0.1 });
        win(b, 'round', 0.9, 2.0, at(12.4), f, { frame: tint(stone, 0.06), bd: 0.12, mullion: true });
      }
    }
    // the first-floor door, high in the face towards the bailey, reached by a timber stair
    win(b, 'round', 1.2, 2.4, [w / 2 + 0.35, 4.6, 1.8], '+x', { frame: tint(stone, 0.06), glass: P.oakDark, bd: 0.16 });
    b.crenel(w, d, stone, { at: [0, H, 0], merlonW: 0.7, merlonH: 0.9, t: 0.45 });
    b.box(w - 0.8, 0.1, d - 0.8, P.lead, { at: [0, H - 0.3, 0] });
    b.hip(w - 1.2, d - 1.2, 1.6, TILE, { at: [0, H - 0.2, 0] });
  });
  // the stair up to the door: a timber flight on posts
  const sx = MOTTE.x + w / 2 + 1.3;
  b.stairs(1.4, 4.6, 5.4, 10, P.oak, { at: [sx, y0, MOTTE.z + 1.8 + 2.4], rotY: Math.PI });
  b.box(1.6, 0.2, 1.4, P.oak, { at: [sx, y0 + 4.5, MOTTE.z + 1.8] });
}

/** The great round keep of 1220 on the summit: 10 m across, 25 m tall, battered at the foot. */
export function roundKeep(b: Builder, stone: number, top: TopStyle) {
  const H = 25;
  roundTower(b, MOTTE.x, MOTTE.z, KEEP_R, MOTTE.h, H, stone, { top, roofH: top === 'restored' ? 13 : 10.5, segs: 14, slitN: 5, outward: undefined });
  // the door on the first floor, towards the court, reached by a bridge from the ring wall
  const t = 0.68;
  const [dx, dz] = pol(MOTTE.x, MOTTE.z, KEEP_R * 0.99, t);
  win(b, 'pointed', 1.2, 2.5, [dx, MOTTE.h + 4.4, dz], t, { frame: tint(stone, 0.06), glass: P.oakDark, bd: 0.15 });
  const [ex, ez] = pol(MOTTE.x, MOTTE.z, CHEMISE_R, t);
  b.beam([dx, MOTTE.h + 4.3, dz], [ex, MOTTE.h + 4.3, ez], 1.4, 0.25, P.oak);
  b.stairs(1.4, 4.3, 4.0, 8, tint(stone, -0.05), { at: [(dx + ex) / 2 + 1.6, MOTTE.h, (dz + ez) / 2 + 1.6], rotY: t });
  if (top !== 'crenel') {
    for (const tt of [t + Math.PI, t + Math.PI * 0.6, t - Math.PI * 0.6]) {
      const [px, pz] = pol(MOTTE.x, MOTTE.z, KEEP_R * 0.99, tt);
      win(b, 'rect', 0.9, 1.8, [px, MOTTE.h + 16, pz], tt, { frame: tint(stone, 0.06), bd: 0.1, mullion: true, transom: 0.6 });
    }
  }
}

/** Corner and flank towers of the circuit: [x, z, r, outward angle]. */
export const TOWERS: [number, number, number, number][] = [
  [C.x1, C.z0, 3.1, (3 * Math.PI) / 4],
  [C.x1, C.z1, 3.1, Math.PI / 4],
  [C.x0, C.z1, 3.1, -Math.PI / 4],
  [C.x1, (C.z0 + C.z1) / 2, 2.6, Math.PI / 2],
  [C.x0, (C.z0 + C.z1) / 2 + 3, 2.6, -Math.PI / 2],
  [(C.x0 + C.x1) / 2 + 3, C.z0, 2.6, Math.PI],
];

/** The curtain lines between towers, and the two halves of the front either side of the gate. */
export function curtainLines(): Pt[][] {
  const g0 = C.gateX - C.gateHalf;
  const g1 = C.gateX + C.gateHalf;
  return [
    [pol(MOTTE.x, MOTTE.z, CHEMISE_R - 0.3, Math.PI / 2), [C.x1, C.z0]],
    [[C.x1, C.z0], [C.x1, C.z1]],
    [[C.x1, C.z1], [g1, C.z1]],
    [[g0, C.z1], [C.x0, C.z1]],
    [[C.x0, C.z1], pol(MOTTE.x, MOTTE.z, CHEMISE_R - 0.3, 0)],
  ];
}

/** Dig the ditch of 1220 outside the circuit, from the mound round to the mound (dry; grassed by 1865). */
export function castleDitch(b: Builder, color?: number) {
  b.dig(CASTLE_CUT.pts, CASTLE_CUT.depth, { slope: CASTLE_CUT.slope, color: color ?? CASTLE_CUT.color });
}

/**
 * The gatehouse: twin round towers with the passage between them, a portcullis and a bridge over the
 * ditch. Its towers take the circuit's top style.
 */
export function gatehouse(b: Builder, stone: number, top: TopStyle, wallH: number) {
  const { gateX: x, gateHalf: hw, z1: z } = C;
  const th = wallH + 3;
  b.sym((s) => roundTower(b, x + s * hw, z + 0.6, 2.4, 0, th, stone, { top, roofH: top === 'restored' ? 8 : 6.5, slitN: 3, outward: 0, lift: GATE_LIFT + 3 }));
  // the block between the towers, with the passage through it; raised in two lifts like the curtains
  const { inner, outer, depth } = CASTLE_DITCH;
  b.group({ at: [x, 0, z] }, () => {
    const w = hw * 2 - 2;
    const y1 = Math.min(wallH, GATE_LIFT) + 1;
    b.extrude([[-w / 2, 0], [-1.6, 0], ...archPts('pointed', 3.2, 4.6, 3).slice(2).reverse().map(([px, py]) => [px, py] as Pt), [1.6, 0], [w / 2, 0], [w / 2, y1], [-w / 2, y1]], 4.2, stone, { at: [0, 0, 0] });
    if (wallH + 1 > y1 + 1e-6) b.box(w, wallH + 1 - y1, 4.2, stone, { at: [0, y1, 0] });
    flat(b, rectPts(-1.5, 2.2, 1.5, 4.3), P.timberBlack, [0, 0, 2.1], '+z', 0.03);
    for (let i = -3; i <= 3; i++) flat(b, rectPts(i * 0.42 - 0.05, 2.2, i * 0.42 + 0.05, 4.3), P.iron, [0, 0, 2.1], '+z', 0.05);
    if (top === 'crenel') b.crenel(w, 4.2, stone, { at: [0, wallH + 1, 0], merlonW: 0.7, merlonH: 0.9, t: 0.4 });
    else {
      b.box(w + 0.6, 1.6, 4.8, stone, { at: [0, wallH + 0.4, 0] });
      b.box(w + 0.5, 0.5, 4.7, tint(stone, -0.35), { at: [0, wallH, 0], jitter: false });
      b.gable(w + 0.6, 4.8, 2.6, SLATE, { ridge: 'x', at: [0, wallH + 2, 0], overhang: 0.2, wall: stone });
    }
    // the bridge over the ditch, from the gate passage to beyond the far lip, its pier on the bottom
    const z0 = 2.1;
    const z1 = outer + 0.6;
    const zp = (inner + outer) / 2;
    if (top === 'restored') {
      // 1865: a fixed stone bridge of one arch for carriages
      const L = z1 - z0;
      const a = 1.3;
      const arch: Pt[] = [[-L / 2, -depth - 0.1], [zp - z0 - L / 2 - a, -depth - 0.1]];
      for (let i = 0; i <= 6; i++) {
        const t = Math.PI - (i * Math.PI) / 6;
        arch.push([zp - z0 - L / 2 + a * Math.cos(t), -1.5 + a * Math.sin(t)]);
      }
      arch.push([zp - z0 - L / 2 + a, -depth - 0.1], [L / 2, -depth - 0.1], [L / 2, 0.55], [-L / 2, 0.55]);
      b.extrude(arch, 3.8, stone, { at: [0, 0, (z0 + z1) / 2], rotY: -Math.PI / 2 });
      b.sym((sx) => b.box(0.35, 0.9, L, stone, { at: [sx * 1.75, 0.55, (z0 + z1) / 2] }));
    } else {
      // a drawbridge let down from the gate on to a fixed timber span, which rests on a stone pier
      b.box(3.2, 0.3, zp - z0, P.oakDark, { at: [0, 0.25, (z0 + zp) / 2] });
      b.box(3.2, 0.3, z1 - zp, P.oak, { at: [0, 0.25, (zp + z1) / 2] });
      b.box(2.6, depth + 0.35, 1.2, tint(stone, -0.08), { at: [0, -depth - 0.1, zp] });
      b.sym((sx) => b.box(0.14, 1, z1 - zp, P.oakDark, { at: [sx * 1.55, 0.55, (zp + z1) / 2] }));
    }
  });
  b.deck(3.2, outer + 0.6 - 2.1, 0.55, { at: [x, 0, z + (2.1 + outer + 0.6) / 2] });
}

/** Colliders for the circuit: curtains, towers and the gate block (the passage left open). */
export function castleColliders(b: Builder) {
  for (const line of curtainLines()) curtainColliders(b, line, 2.0);
  for (const [x, z, r] of TOWERS) b.collider(r * 2, r * 2, { at: [x, 0, z] });
  const { gateX: x, gateHalf: hw, z1: z } = C;
  b.sym((s) => b.collider(2.4 * 2, 2.4 * 2, { at: [x + s * hw, 0, z + 0.6] }));
  b.sym((s) => b.collider(1.9, 4.2, { at: [x + s * 2.55, 0, z] }));
  b.collider(MOTTE.rTop * 1.6, MOTTE.rTop * 0.4, { at: [MOTTE.x, 0, MOTTE.z - MOTTE.rTop - 2] });
  b.collider(KEEP_R * 2, KEEP_R * 2, { at: [MOTTE.x, 0, MOTTE.z] });
}

/** A steep-roofed range of buildings inside the walls. */
export function range(
  b: Builder,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  h: number,
  stone: number,
  roof: number,
  o: { ridge: 'x' | 'z'; rise: number; hip?: boolean },
) {
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  b.box(w, h, d, stone, { at: [cx, 0, cz] });
  b.box(w + 0.3, 0.3, d + 0.3, tint(stone, 0.05), { at: [cx, h - 0.3, cz], jitter: false });
  if (o.hip) b.hip(w + 0.3, d + 0.3, o.rise, roof, { at: [cx, h, cz] });
  else b.gable(w, d, o.rise, roof, { ridge: o.ridge, at: [cx, h, cz], overhang: 0.25, wall: stone });
  b.collider(w, d, { at: [cx, 0, cz] });
}

/** A dormer window rising from the wall-head on a face looking `f`. */
export function dormer(b: Builder, at: Vec3, f: Facing, stone: number, roof: number, o?: { w?: number; h?: number; pinnacles?: boolean; gable?: 'stone' | 'roof' }) {
  const w = o?.w ?? 1.3;
  const h = o?.h ?? 1.8;
  b.group({ at, rotY: facingAngle(f) }, () => {
    b.box(w + 0.3, h, 1.4, stone, { at: [0, 0, -0.55] });
    win(b, 'rect', w - 0.3, h - 0.45, [0, 0.2, 0.15], '+z', { frame: tint(stone, 0.05), bd: 0.08, mullion: true, transom: 0.6 });
    if (o?.gable === 'roof') {
      b.gable(w + 0.4, 1.6, h * 0.55, roof, { ridge: 'z', at: [0, h, -0.6], overhang: 0.1, wall: stone });
    } else {
      b.extrude([[-(w + 0.3) / 2, 0], [(w + 0.3) / 2, 0], [0, h * 0.9]], 0.3, stone, { at: [0, h, 0.0] });
      b.gable(w + 0.2, 1.4, h * 0.85, roof, { ridge: 'z', at: [0, h, -0.75], overhang: 0.05, wall: stone });
      if (o?.pinnacles) {
        b.sym((s) => b.cone(0.14, 0.9, stone, { at: [s * (w + 0.3) / 2, h, 0.05], segs: 4 }));
        b.cone(0.16, 1.0, stone, { at: [0, h + h * 0.9 - 0.1, 0.05], segs: 4 });
      }
    }
  });
}
