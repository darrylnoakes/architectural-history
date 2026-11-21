import * as THREE from 'three';
import type { Builder, Vec3 } from '@ah/kit';

export type Pt = [number, number];

// ---------------------------------------------------------------------------------------------
// The oval plan shared by the amphitheatre and the ring of houses that later grows into it.
//
// Two ellipses: the outer face of the amphitheatre and the arena wall. Each is divided into N
// equal lengths, so pier k of the outer arcade and vertex k of the arena wall correspond, and any
// ring in between (s = 0 at the arena, s = 1 at the outer face) is the straight blend of the two.
// Bay k is the stretch between pier k and pier k + 1; bay 0 is centred on +Z (the street front),
// bay N/4 on +X, bay N/2 on -Z and bay 3N/4 on -X.
// ---------------------------------------------------------------------------------------------

export const OVAL = {
  /** Outer semi-axes, along X and Z. */
  ax: 19.2,
  az: 16.0,
  /** Arena semi-axes. */
  rx: 9.0,
  rz: 5.6,
  /** Number of bays round the outer arcade. */
  n: 24,
  /** Thickness of the outer arcade wall. */
  wallT: 1.0,
} as const;

export const N = OVAL.n;

/** Bases of the three arcaded storeys of the outer wall, and the top of the wall. */
export const STOREY_Y = [0, 4.8, 9.0, 13.0] as const;
/** Arch openings of each storey: width and height to the crown. */
export const ARCH = [
  { w: 2.7, h: 4.0 },
  { w: 2.5, h: 3.4 },
  { w: 2.4, h: 3.2 },
] as const;

/** n points spaced evenly by length round an ellipse; point k sits at arc fraction (k - 0.5) / n from +Z, turning toward +X. */
function ellipseEven(a: number, c: number, n: number): Pt[] {
  const M = 2048;
  const cum: number[] = [0];
  let prev: Pt = [0, c];
  for (let i = 1; i <= M; i++) {
    const t = (i / M) * Math.PI * 2;
    const p: Pt = [a * Math.sin(t), c * Math.cos(t)];
    cum.push(cum[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const total = cum[M];
  const out: Pt[] = [];
  for (let k = 0; k < n; k++) {
    let f = (k - 0.5) / n;
    if (f < 0) f += 1;
    const target = f * total;
    let i = 1;
    while (i < M && cum[i] < target) i++;
    const u = (target - cum[i - 1]) / (cum[i] - cum[i - 1]);
    const t = ((i - 1 + u) / M) * Math.PI * 2;
    out.push([a * Math.sin(t), c * Math.cos(t)]);
  }
  return out;
}

const OUT = ellipseEven(OVAL.ax, OVAL.az, N);
const IN = ellipseEven(OVAL.rx, OVAL.rz, N);

const wrap = (k: number) => ((k % N) + N) % N;

/** Vertex k (pier k) of the ring at s (0 = arena wall, 1 = outer face; values outside 0..1 extrapolate). */
export function vert(k: number, s: number): Pt {
  if (!Number.isInteger(k)) return ringPt(k, s);
  const i = wrap(k);
  return [IN[i][0] + s * (OUT[i][0] - IN[i][0]), IN[i][1] + s * (OUT[i][1] - IN[i][1])];
}

/** A point on ring s at fractional pier position k (k = 3.5 is the middle of bay 3). */
export function ringPt(k: number, s: number): Pt {
  const k0 = Math.floor(k);
  const f = k - k0;
  const a = vert(k0, s);
  const c = vert(k0 + 1, s);
  return [a[0] + f * (c[0] - a[0]), a[1] + f * (c[1] - a[1])];
}

/** Outward facing angle (0 = +Z, PI/2 = +X) of the chord from p0 to p1 on a ring round the origin. */
function chordAngle(p0: Pt, p1: Pt): number {
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  let nx = dz;
  let nz = -dx;
  const mx = (p0[0] + p1[0]) / 2;
  const mz = (p0[1] + p1[1]) / 2;
  if (nx * mx + nz * mz < 0) {
    nx = -nx;
    nz = -nz;
  }
  return Math.atan2(nx, nz);
}

export interface Frame {
  x: number;
  z: number;
  /** Outward facing angle. */
  ang: number;
  /** Chord length (for a bay). */
  w: number;
}

/** Bay k on ring s: the middle of the chord from pier k to pier k + 1, its length and outward facing. */
export function bayFrame(k: number, s: number): Frame {
  const p0 = vert(k, s);
  const p1 = vert(k + 1, s);
  return { x: (p0[0] + p1[0]) / 2, z: (p0[1] + p1[1]) / 2, ang: chordAngle(p0, p1), w: Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) };
}

/** Pier k on ring s: its position and the outward facing halfway between its two bays. */
export function pierFrame(k: number, s: number): Frame {
  const [x, z] = vert(k, s);
  const a0 = bayFrame(k - 1, s).ang;
  const a1 = bayFrame(k, s).ang;
  const ang = Math.atan2(Math.sin(a0) + Math.sin(a1), Math.cos(a0) + Math.cos(a1));
  return { x, z, ang, w: 0 };
}

/** Push triangles (as flat [x,y,z] lists) into one geometry and add it. */
function addTris(b: Builder, tris: number[], color: number, o?: { mat?: 'matte' | 'glass' }): void {
  if (!tris.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris), 3));
  g.computeVertexNormals();
  b.add(g, color, { mat: o?.mat });
}

/**
 * A surface swept round the oval, like b.lathe but on the shared plan: `profile` is a list of
 * [s, y] points (s = 0 arena wall, 1 outer face). It runs from pier k0 to pier k1 (default all the way round).
 */
export function ringBand(b: Builder, profile: Pt[], color: number, o?: { k0?: number; k1?: number; mat?: 'matte' | 'glass' }): void {
  const k0 = o?.k0 ?? 0;
  const k1 = o?.k1 ?? N;
  const t: number[] = [];
  for (let k = k0; k < k1; k++) {
    for (let j = 0; j < profile.length - 1; j++) {
      const [sa, ya] = profile[j];
      const [sb, yb] = profile[j + 1];
      const a0 = vert(k, sa);
      const a1 = vert(k + 1, sa);
      const b0 = vert(k, sb);
      const b1 = vert(k + 1, sb);
      t.push(a0[0], ya, a0[1], a1[0], ya, a1[1], b1[0], yb, b1[1]);
      t.push(a0[0], ya, a0[1], b1[0], yb, b1[1], b0[0], yb, b0[1]);
    }
  }
  addTris(b, t, color, o);
}

/** The flat oval inside ring s at height y (the arena floor, a piazza). */
export function ringDisc(b: Builder, s: number, y: number, color: number): void {
  const t: number[] = [];
  for (let k = 0; k < N; k++) {
    const a = vert(k, s);
    const c = vert(k + 1, s);
    t.push(0, y, 0, a[0], y, a[1], c[0], y, c[1]);
  }
  addTris(b, t, color);
}

/**
 * A thin vertical wall standing on a polyline of [x, z, yBottom, yTop] points: radial walls under
 * the seats, passage walls, end walls of houses in the ring.
 */
export function strip(b: Builder, pts: [number, number, number, number][], color: number): void {
  const t: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0, b0, t0] = pts[i];
    const [x1, z1, b1, t1] = pts[i + 1];
    t.push(x0, b0, z0, x1, b1, z1, x1, t1, z1);
    t.push(x0, b0, z0, x1, t1, z1, x0, t0, z0);
  }
  addTris(b, t, color);
}

/** A thick vertical wall (two strips and a top) between two points, following a top-height function. */
export function thickWall(
  b: Builder,
  p0: Pt,
  p1: Pt,
  thick: number,
  top: (u: number) => number,
  color: number,
  steps = 6,
): void {
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const nx = (-dz / len) * (thick / 2);
  const nz = (dx / len) * (thick / 2);
  const side = (sgn: number) => {
    const pts: [number, number, number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      pts.push([p0[0] + dx * u + sgn * nx, p0[1] + dz * u + sgn * nz, 0, top(u)]);
    }
    strip(b, pts, color);
  };
  side(1);
  side(-1);
  const t: number[] = [];
  for (let i = 0; i < steps; i++) {
    const u0 = i / steps;
    const u1 = (i + 1) / steps;
    const ax = p0[0] + dx * u0;
    const az = p0[1] + dz * u0;
    const bx = p0[0] + dx * u1;
    const bz = p0[1] + dz * u1;
    t.push(ax + nx, top(u0), az + nz, bx + nx, top(u1), bz + nz, bx - nx, top(u1), bz - nz);
    t.push(ax + nx, top(u0), az + nz, bx - nx, top(u1), bz - nz, ax - nx, top(u0), az - nz);
  }
  addTris(b, t, color);
}

/** Half a column (an engaged column) of radius r and height h, standing on `at`, its round face toward `ang`. */
export function halfColumn(b: Builder, at: Vec3, ang: number, r: number, h: number, color: number): void {
  const g = new THREE.CylinderGeometry(r, r, h, 4, 1, true, -Math.PI / 2, Math.PI);
  g.translate(0, h / 2, 0);
  b.add(g, color, { at, rotY: ang, jitter: false });
}

/**
 * A wall slab w wide, h tall and t thick with one round-headed walk-through arch (openW × openH to
 * the crown), built lean: front and back faces and the arch soffit only (the ends and top are hidden
 * by its neighbours and the cornice). Local frame: centred on x, base at y 0, faces ±Z.
 */
function archSlab(w: number, h: number, t: number, openW: number, openH: number, segs = 6): THREE.BufferGeometry {
  const a = openW / 2;
  const hs = openH - a;
  const open: Pt[] = [[-a, 0], [-a, hs]];
  for (let i = 1; i < segs; i++) {
    const u = Math.PI - (i / segs) * Math.PI;
    open.push([a * Math.cos(u), hs + a * Math.sin(u)]);
  }
  open.push([a, hs], [a, 0]);
  const contour: Pt[] = [[-w / 2, 0], ...open, [w / 2, 0], [w / 2, h], [-w / 2, h]];
  const faces = THREE.ShapeUtils.triangulateShape(
    contour.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  const tris: number[] = [];
  for (const z of [t / 2, -t / 2]) {
    for (const [i, j, k] of faces) {
      for (const v of [i, j, k]) tris.push(contour[v][0], contour[v][1], z);
    }
  }
  for (let i = 0; i < open.length - 1; i++) {
    const [x0, y0] = open[i];
    const [x1, y1] = open[i + 1];
    tris.push(x0, y0, t / 2, x1, y1, t / 2, x1, y1, -t / 2);
    tris.push(x0, y0, t / 2, x1, y1, -t / 2, x0, y0, -t / 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris), 3));
  g.computeVertexNormals();
  return g;
}

/** One bay of one storey of the outer arcade: a slab of wall with a round-headed arch, its outer face on the ellipse. */
export function arcadeBay(b: Builder, k: number, storey: number, color: number): void {
  const f = bayFrame(k, 1);
  const t = OVAL.wallT;
  const y0 = STOREY_Y[storey];
  const h = STOREY_Y[storey + 1] - y0;
  b.add(archSlab(f.w + 0.04, h, t, ARCH[storey].w, ARCH[storey].h), color, {
    at: [f.x - Math.sin(f.ang) * (t / 2), y0, f.z - Math.cos(f.ang) * (t / 2)],
    rotY: f.ang,
  });
}

/** The same bay with its arch walled up in another material, set back a little (as in houses built into the ruin). */
export function blockedBay(b: Builder, k: number, storey: number, color: number, fill: number): void {
  arcadeBay(b, k, storey, color);
  const f = bayFrame(k, 1);
  const t = OVAL.wallT;
  const { w, h } = ARCH[storey];
  b.panel(w + 0.02, h + 0.02, fill, {
    at: [f.x - Math.sin(f.ang) * (t * 0.35), STOREY_Y[storey], f.z - Math.cos(f.ang) * (t * 0.35)],
    facing: f.ang,
    shape: 'round',
    depth: 0.2,
  });
}

/**
 * The capital and base of an engaged column on pier k of storey j: Tuscan below, Ionic in the middle,
 * Corinthian above, as on the Colosseum.
 */
export function arcadeOrder(b: Builder, k: number, storey: number, color: number, r = 0.32): void {
  const p = pierFrame(k, 1);
  const y0 = STOREY_Y[storey];
  const h = STOREY_Y[storey + 1] - y0 - 0.55; // up to the underside of the entablature
  const sx = Math.sin(p.ang);
  const sz = Math.cos(p.ang);
  halfColumn(b, [p.x, y0 + 0.2, p.z], p.ang, r, h - 0.2, color);
  const capH = storey === 2 ? 0.55 : storey === 1 ? 0.32 : 0.26;
  const capW = storey === 1 ? r * 3.2 : r * 2.7;
  b.box(capW, capH, r * 1.5, color, { at: [p.x + sx * r * 0.25, y0 + h - capH, p.z + sz * r * 0.25], rotY: p.ang, jitter: false });
}

/** The projecting entablature (cornice band) of the outer wall at height y, thickness h. */
export function arcadeBelt(b: Builder, y: number, h: number, color: number, proud = 0.036): void {
  ringBand(
    b,
    [
      [1, y],
      [1 + proud, y + 0.06],
      [1 + proud, y + h],
      [1, y + h],
    ],
    color,
  );
}

/** A standing statue of h metres on `at`: a draped body and a head. */
export function statue(b: Builder, at: Vec3, h: number, color: number): void {
  b.cyl(h * 0.13, h * 0.78, color, { at, rTop: h * 0.09, segs: 5, jitter: false });
  b.sphere(h * 0.08, color, { at: [at[0], at[1] + h * 0.87, at[2]], segs: 5, jitter: false });
}
