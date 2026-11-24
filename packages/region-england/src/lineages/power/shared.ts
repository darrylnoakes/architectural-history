import * as THREE from 'three';
import { CutField, P, facingAngle, mix, tint, type Builder, type Cut, type Facing, type Opts } from '@ah/kit';

/*
 * Local helpers for the power lineage: raw triangle meshes (partial lathes, serrated palisades,
 * bowed roofs), the motte that carries the castle from 1068 to 1575, the bailey outline that the
 * palisade, then the curtain walls follow, and the 1874 clock tower that survives to 2008.
 */

type XZ = [number, number];

// ------------------------------------------------------------------ raw triangles

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: Opts): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  b.add(g, color, o);
}

/** Push a quad (a, b, c, d in order around its edge) as two triangles. */
export function quad(out: number[], a: number[], b: number[], c: number[], d: number[]): void {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/**
 * A lathe swept only between angles a0 and a1 (radians, measured in the XZ plane: x = r cos a,
 * z = r sin a, so +Z, the front, is a = PI / 2). Profile is [radius, height] from outside in or
 * bottom up; it is not capped.
 */
export function arcLathe(
  b: Builder,
  profile: [number, number][],
  a0: number,
  a1: number,
  segs: number,
  color: number,
  o?: Opts,
): void {
  const out: number[] = [];
  for (let i = 0; i < segs; i++) {
    const t0 = a0 + ((a1 - a0) * i) / segs;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / segs;
    for (let j = 0; j < profile.length - 1; j++) {
      const [r0, y0] = profile[j];
      const [r1, y1] = profile[j + 1];
      quad(
        out,
        [r0 * Math.cos(t0), y0, r0 * Math.sin(t0)],
        [r0 * Math.cos(t1), y0, r0 * Math.sin(t1)],
        [r1 * Math.cos(t1), y1, r1 * Math.sin(t1)],
        [r1 * Math.cos(t0), y1, r1 * Math.sin(t0)],
      );
    }
  }
  soup(b, out, color, o);
}

/** Points along an arc of radius r about (cx, cz) between angles a0 and a1. */
export function arcPts(cx: number, cz: number, r: number, a0: number, a1: number, n: number): XZ[] {
  const pts: XZ[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * A palisade of split oak stakes with pointed tops, following a polyline of [x, z] points.
 * `base(x, z)` gives the ground height under each stake (for palisades climbing a motte or a bank).
 */
export function palisade(
  b: Builder,
  pts: XZ[],
  h: number,
  color: number,
  o?: { stake?: number; base?: (x: number, z: number) => number; rail?: number },
): void {
  const s = o?.stake ?? 0.38;
  const base = o?.base ?? (() => 0);
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(L / s));
    for (let k = 0; k < n; k++) {
      const u0 = k / n;
      const u1 = (k + 1) / n;
      const ax = x0 + (x1 - x0) * u0;
      const az = z0 + (z1 - z0) * u0;
      const bx = x0 + (x1 - x0) * u1;
      const bz = z0 + (z1 - z0) * u1;
      const mx = (ax + bx) / 2;
      const mz = (az + bz) / 2;
      const y0 = base(mx, mz) - 0.3;
      const top = base(mx, mz) + h * (0.94 + 0.06 * (((k * 7) % 5) / 4));
      quad(out, [ax, y0, az], [bx, y0, bz], [bx, top, bz], [ax, top, az]);
      out.push(ax, top, az, bx, top, bz, mx, top + s * 1.1, mz);
    }
  }
  soup(b, out, color);
  // a horizontal rail on the inside face, every stake pegged to it
  if (o?.rail !== undefined) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i];
      const [x1, z1] = pts[i + 1];
      const y = Math.min(base(x0, z0), base(x1, z1)) + o.rail;
      beam(b, [x0, z0], [x1, z1], 0.12, 0.16, tint(color, -0.06), y);
    }
  }
}

/** A box running from p to q (plan points), `w` thick and `h` tall, its base at height y. */
export function beam(b: Builder, p: XZ, q: XZ, w: number, h: number, color: number, y = 0, extend = 0): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  b.box(L + extend * 2, h, w, color, { at: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** One walk collider per segment of a polyline. */
export function lineColliders(b: Builder, pts: XZ[], thick: number): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const dx = x1 - x0;
    const dz = z1 - z0;
    b.collider(Math.hypot(dx, dz) + thick * 0.5, thick, {
      at: [(x0 + x1) / 2, 0, (z0 + z1) / 2],
      rotY: Math.atan2(-dz, dx),
    });
  }
}

/** A long earth bank of triangular section along a polyline. */
export function bank(b: Builder, pts: XZ[], w: number, h: number, color: number): void {
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (-(z1 - z0) / L) * (w / 2);
    const nz = ((x1 - x0) / L) * (w / 2);
    const ex = 0;
    const ez = 0;
    const a = [x0 - ex, 0, z0 - ez];
    const c = [x1 + ex, 0, z1 + ez];
    quad(out, [a[0] + nx, 0, a[2] + nz], [c[0] + nx, 0, c[2] + nz], [c[0], h, c[2]], [a[0], h, a[2]]);
    quad(out, [a[0] - nx, 0, a[2] - nz], [a[0], h, a[2]], [c[0], h, c[2]], [c[0] - nx, 0, c[2] - nz]);
  }
  soup(b, out, color);
  // round off the joints
  for (const [x, z] of pts.slice(1, -1)) b.cone(w / 2, h, color, { at: [x, 0, z], segs: 8 });
}

// ------------------------------------------------------------------ the motte (1068 to 1575)

/** The earth mound thrown up in 1068. Its centre and size are fixed so later stages can reuse it. */
export const MOTTE = { x: -9.8, z: -9.8, rBase: 12, rTop: 6.8, h: 6.5 };

const MOTTE_PROFILE: [number, number][] = [
  [MOTTE.rBase, 0],
  [11.2, 0.7],
  [9.6, 2.8],
  [8, 5.2],
  [7.2, 6.2],
  [MOTTE.rTop, MOTTE.h],
  [0, MOTTE.h],
];

/** Height of the motte surface at plan point (x, z); 0 off the mound. */
export function motteY(x: number, z: number): number {
  const r = Math.hypot(x - MOTTE.x, z - MOTTE.z);
  if (r >= MOTTE.rBase) return 0;
  for (let i = 0; i < MOTTE_PROFILE.length - 1; i++) {
    const [r0, y0] = MOTTE_PROFILE[i];
    const [r1, y1] = MOTTE_PROFILE[i + 1];
    if (r <= r0 && r >= r1) return y0 + ((y1 - y0) * (r0 - r)) / (r0 - r1 || 1);
  }
  return MOTTE.h;
}

/**
 * The motte: a turfed (or, later, grown-over) cone of rammed earth with a flat top, and the walkable
 * deck on its summit. Its ditch is dug with the bailey's (see `castleDitches`).
 */
export function motte(b: Builder, o?: { color?: number }): void {
  const col = o?.color ?? P.turf;
  b.lathe(MOTTE_PROFILE, col, { at: [MOTTE.x, 0, MOTTE.z], segs: 20 });
  b.deck(MOTTE.rTop * 1.4, MOTTE.rTop * 1.4, MOTTE.h, { at: [MOTTE.x, 0, MOTTE.z] });
}

// ------------------------------------------------------------------ the bailey outline

/**
 * The bailey boundary, clockwise from where it leaves the motte at the back to where it rejoins it
 * on the left. The gate gap is between BAILEY_FRONT_R and BAILEY_FRONT_L on the front (z = 19).
 */
export const BAILEY_RIGHT: XZ[] = [
  [-1.6, -14.2],
  [3, -19],
  [16, -19],
  [19.5, -6],
  [19.5, 11],
  [13, 19],
  [4.2, 19],
];
export const BAILEY_LEFT: XZ[] = [
  [-1.2, 19],
  [-12, 19],
  [-19.5, 11],
  [-19.5, 2],
  [-16.6, -3.8],
];
/** Centre of the gateway on the front line. */
export const GATE: XZ = [1.5, 19];

/** Extend a bailey line from where it meets the motte slope up to the summit. */
export function toSummit(p: XZ, r = MOTTE.rTop - 0.4): XZ {
  const a = Math.atan2(p[1] - MOTTE.z, p[0] - MOTTE.x);
  return [MOTTE.x + r * Math.cos(a), MOTTE.z + r * Math.sin(a)];
}


/** Height and width of the bailey bank. */
export const BAILEY_BANK_H = 1.0;
export const BAILEY_BANK_W = 2.4;

/**
 * The bank of the bailey, thrown up in 1068 and kept by the stone castle: the palisade (later the
 * curtain wall) stands on its crest.
 */
export function baileyBank(b: Builder): void {
  bank(b, BAILEY_RIGHT.slice(1), BAILEY_BANK_W, BAILEY_BANK_H, tint(P.turf, 0.03));
  bank(b, BAILEY_LEFT.slice(0, -1), BAILEY_BANK_W, BAILEY_BANK_H, tint(P.turf, 0.03));
}

/** Height of the bank at plan point (x, z); 0 off it. */
export function bankY(x: number, z: number): number {
  let best = 0;
  for (const line of [BAILEY_RIGHT.slice(1), BAILEY_LEFT.slice(0, -1)]) {
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, az] = line[i];
      const [bx, bz] = line[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      const d = Math.hypot(x - (ax + t * dx), z - (az + t * dz));
      best = Math.max(best, BAILEY_BANK_H * (1 - d / (BAILEY_BANK_W / 2)));
    }
  }
  return best;
}

// ------------------------------------------------------------------ the castle ditches (1068 to 1575)

/**
 * The ditches dug in 1068 and kept, then flooded, until the castle was given up: depth and side
 * slope (a V with a narrow bottom), how far the bailey ditch's centre line runs outside the bank's
 * crest, its half width, and the level of the water when it is a moat.
 */
export const DITCH = { depth: 1.6, slope: 1.4, off: 2.6, half: 1.4, water: -0.6 };
/** The motte ditch: a ring round the bailey side of the mound, between these radii and angles. */
export const MOTTE_DITCH = { r0: MOTTE.rBase, r1: MOTTE.rBase + 2 * DITCH.half, a0: 0.45, a1: 2.45 };

/**
 * Offset a polyline sideways by d along its right-hand normal (-dz, dx), mitring the corners (so a
 * positive d moves the bailey line inwards).
 */
export function offsetLine(pts: XZ[], d: number): XZ[] {
  const n = (i: number): XZ => {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    return [-(z1 - z0) / L, (x1 - x0) / L];
  };
  return pts.map(([x, z], i) => {
    if (i === 0 || i === pts.length - 1) {
      const m = n(Math.min(i, pts.length - 2));
      return [x + m[0] * d, z + m[1] * d] as XZ;
    }
    const a = n(i - 1);
    const c = n(i);
    let mx = a[0] + c[0];
    let mz = a[1] + c[1];
    const L = Math.hypot(mx, mz) || 1;
    mx /= L;
    mz /= L;
    const k = d / (mx * a[0] + mz * a[1]);
    return [x + mx * k, z + mz * k] as XZ;
  });
}

/**
 * Centre line of the bailey ditch: from the foot of the motte at the back, round the outside of the
 * bank (across the front of the gate) and into the motte ditch on the left.
 */
export const BAILEY_DITCH_PATH: XZ[] = (() => {
  const line: XZ[] = [BAILEY_RIGHT[1], ...BAILEY_RIGHT.slice(2, -1), ...BAILEY_LEFT.slice(1, -1)];
  const mid = offsetLine(line, -DITCH.off);
  const am = MOTTE_DITCH.a1 - 0.05;
  const rm = (MOTTE_DITCH.r0 + MOTTE_DITCH.r1) / 2;
  return [[-3, mid[0][1]] as XZ, ...mid, [MOTTE.x + rm * Math.cos(am), MOTTE.z + rm * Math.sin(am)] as XZ];
})();

function ringOutline(cx: number, cz: number, r0: number, r1: number, a0: number, a1: number, n: number): XZ[] {
  return [...arcPts(cx, cz, r0, a0, a1, n), ...arcPts(cx, cz, r1, a1, a0, n)];
}

/** The two hollows of the castle ditch, as cuts in the plot's own frame. */
export const CASTLE_CUTS: Cut[] = (() => {
  const color = mix(P.soil, P.earth, 0.4);
  const { r0, r1, a0, a1 } = MOTTE_DITCH;
  const band = [...offsetLine(BAILEY_DITCH_PATH, DITCH.half), ...offsetLine(BAILEY_DITCH_PATH, -DITCH.half).reverse()];
  return [
    { pts: ringOutline(MOTTE.x, MOTTE.z, r0, r1, a0, a1, 16), depth: DITCH.depth, slope: DITCH.slope, color },
    { pts: band, depth: DITCH.depth, slope: DITCH.slope, color },
  ];
})();

let castleField: CutField | null = null;

/** How far the castle ditches lower the ground at (x, z). */
export function ditchDepth(x: number, z: number): number {
  castleField ??= new CutField(CASTLE_CUTS);
  return castleField.depth(x, z);
}

/** Ground height in the castle while its ditches are open: the motte, less the ditches. */
export function castleGround(x: number, z: number): number {
  return motteY(x, z) - ditchDepth(x, z);
}

/**
 * Dig the motte ditch and the bailey ditch (1068 to 1575). `wet` floods them as a moat: a flat sheet
 * of water DITCH.water below the ground, inside the hollow, with its sloping banks showing above.
 */
export function castleDitches(b: Builder, o?: { wet?: boolean }): void {
  for (const c of CASTLE_CUTS) b.dig(c.pts, c.depth, { slope: c.slope, color: c.color });
  if (!o?.wet) return;
  // how far in from the lip the sides have sunk below the water level
  const inset = (-DITCH.water / DITCH.depth) * DITCH.slope;
  const { r0, r1, a0, a1 } = MOTTE_DITCH;
  const da = inset / ((r0 + r1) / 2);
  arcLathe(b, [[r0 + inset, DITCH.water], [r1 - inset, DITCH.water]], a0 + da, a1 - da, 16, P.water, {
    at: [MOTTE.x, 0, MOTTE.z],
    mat: 'glass',
    jitter: false,
  });
  // the bailey moat, drawn back from the closed end at the foot of the motte
  const path = BAILEY_DITCH_PATH.slice();
  const [p0, p1] = path;
  const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  path[0] = [p0[0] + ((p1[0] - p0[0]) / L) * inset, p0[1] + ((p1[1] - p0[1]) / L) * inset];
  const lo = offsetLine(path, DITCH.half - inset);
  const hi = offsetLine(path, -(DITCH.half - inset));
  const out: number[] = [];
  const y = DITCH.water;
  for (let i = 0; i < path.length - 1; i++) {
    quad(out, [lo[i][0], y, lo[i][1]], [hi[i][0], y, hi[i][1]], [hi[i + 1][0], y, hi[i + 1][1]], [lo[i + 1][0], y, lo[i + 1][1]]);
  }
  soup(b, out, P.water, { mat: 'glass', jitter: false });
}

/**
 * The timber bridge over the ditch in front of the gate (1068, kept in front of the stone gate
 * tower): a plank deck on two trestles standing on the bottom of the ditch.
 */
export function gateBridge(b: Builder): void {
  const z = DITCH.off; // over the middle of the ditch
  const len = 2 * DITCH.half + 1.4;
  b.group({ at: [GATE[0], 0, GATE[1]] }, () => {
    b.box(3.2, 0.25, len, P.oak, { at: [0, 0.35, z] });
    b.sym((s) => {
      b.box(0.12, 1.0, len, P.oakDark, { at: [s * 1.5, 0.6, z] });
      for (const dz of [-0.7, 0.7]) b.box(0.24, DITCH.depth + 0.45, 0.24, P.oakDark, { at: [s * 1.4, -DITCH.depth - 0.1, z + dz] });
    });
    for (const dz of [-0.7, 0.7]) b.box(3.1, 0.2, 0.26, P.oakDark, { at: [0, 0.15, z + dz] }); // trestle caps
  });
  b.deck(3.0, len, 0.6, { at: [GATE[0], 0, GATE[1] + z] });
}

/** The timber stables along the right side of the bailey, thatched (1068, kept in 1130). */
export function baileyStables(b: Builder): void {
  b.group({ at: [15.3, 0, 4.5] }, () => {
    b.box(4.2, 2.6, 12, mix(P.oak, P.oakSilver, 0.3));
    b.shed(5, 12.6, 1.3, P.thatchOld, { at: [0, 2.6, 0], high: '+x' });
    for (const z of [-4, 0, 4]) b.panel(1.6, 2.0, P.oakDark, { at: [-2.1, 0, z], facing: '-x' });
  });
}

/** The well in the bailey, from 1068 to the end of the castle. */
export function baileyWell(b: Builder): void {
  b.cyl(0.8, 0.8, P.rubble, { at: [5, 0, 6], segs: 8 });
}

/** Points along a polyline, `step` apart, with the direction of travel at each. */
export function along(pts: XZ[], step: number): { x: number; z: number; ang: number }[] {
  const res: { x: number; z: number; ang: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      res.push({ x: x0 + (x1 - x0) * u, z: z0 + (z1 - z0) * u, ang: Math.atan2(-(z1 - z0), x1 - x0) });
    }
  }
  return res;
}

// ------------------------------------------------------------------ the 1874 clock tower

/** Plan position and size of the Victorian clock tower, kept when the town hall around it goes. */
export const TOWER = { x: -11, z: 12, w: 6.4, shaft: 27 };

/**
 * The clock tower of 1874: polychrome brick shaft with stone bands and corner buttresses, a clock
 * stage with four dials, an open belfry with pointed openings, corner pinnacles and a steep spire.
 * Total height about 44 m. `weathered` tones it down for its later life as a survivor.
 */
export function clockTower(b: Builder, o?: { brick?: number; stone?: number }): void {
  const brick = o?.brick ?? P.brickRed;
  const stone = o?.stone ?? P.limestoneWarm;
  const W = TOWER.w;
  const S = TOWER.shaft;
  b.group({ at: [TOWER.x, 0, TOWER.z] }, () => {
    // plinth and shaft
    b.box(W + 0.6, 1.2, W + 0.6, stone);
    b.box(W, S, W, brick, { at: [0, 1.2, 0] });
    // polychrome bands: pale stone stripes every 2.6 m, dark blue brick between pairs
    for (let y = 3.4; y < S; y += 2.6) b.box(W + 0.08, 0.32, W + 0.08, stone, { at: [0, y, 0], jitter: false });
    for (let y = 4.7; y < S - 4; y += 5.2) b.box(W + 0.05, 0.22, W + 0.05, P.brickBlue, { at: [0, y, 0], jitter: false });
    // stepped corner buttresses
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.box(0.9, S * 0.55, 0.9, brick, { at: [sx * (W / 2 - 0.15), 1.2, sz * (W / 2 - 0.15)] });
        b.box(0.7, S * 0.35, 0.7, brick, { at: [sx * (W / 2 - 0.1), 1.2 + S * 0.55, sz * (W / 2 - 0.1)] });
        b.box(0.9, 0.3, 0.9, stone, { at: [sx * (W / 2 - 0.15), 1.2 + S * 0.55, sz * (W / 2 - 0.15)] });
      }
    // lancet windows up the shaft on all four faces
    const B0 = S + 1.8;
    const BH = 5;
    for (const f of ['+z', '-z', '+x', '-x'] as const) {
      const rot = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[f];
      b.group({ rotY: rot }, () => {
        if (f === '+z') {
          arch(b, 2.0, 3.8, stone, { at: [0, 1.2, W / 2], depth: 0.1 });
          arch(b, 1.5, 3.3, P.doorBlack, { at: [0, 1.2, W / 2 + 0.05], depth: 0.1 });
        } else archWindow(b, 1.1, 3.0, { at: [0, 2.0, W / 2], frame: stone });
        archWindow(b, 0.9, 2.8, { at: [0, 11, W / 2], frame: stone });
        arch(b, 0.7, 2.2, P.windowDark, { at: [0, 18.6, W / 2] });
        // clock stage: projecting stone frame with a big white dial
        b.box(W - 0.6, 3.8, 0.25, stone, { at: [0, S - 3.2, W / 2] });
        b.panel(3.1, 3.1, P.white, { at: [0, S - 3.0, W / 2 + 0.25], shape: 'circle', depth: 0.08 });
        b.panel(0.12, 1.2, P.black, { at: [0, S - 1.45, W / 2 + 0.36], depth: 0.03 });
        b.panel(0.9, 0.12, P.black, { at: [0.45, S - 1.45, W / 2 + 0.36], depth: 0.03 });
        // gablet over each dial
        b.extrude([[-1.9, 0], [1.9, 0], [0, 1.6]], 0.4, stone, { at: [0, S + 0.6, W / 2 - 0.05] });
        // open belfry: two tall pointed openings with louvres
        for (const x of [-1.25, 1.25]) {
          arch(b, 1.7, 4.3, stone, { at: [x, B0 + 0.3, W / 2 - 0.5], depth: 0.12 });
          arch(b, 1.3, 3.9, P.doorBlack, { at: [x, B0 + 0.5, W / 2 - 0.45], depth: 0.12 });
        }
      });
    }
    // cornice and the belfry stage above
    b.box(W + 0.5, 0.6, W + 0.5, stone, { at: [0, S + 1.2, 0] });
    b.box(W - 1, BH, W - 1, brick, { at: [0, B0, 0] });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.box(1, BH, 1, brick, { at: [sx * (W / 2 - 0.5), B0, sz * (W / 2 - 0.5)] });
        // corner pinnacles
        b.box(0.8, 1.6, 0.8, stone, { at: [sx * (W / 2 - 0.45), B0 + BH + 0.4, sz * (W / 2 - 0.45)] });
        b.cone(0.55, 3.2, stone, { at: [sx * (W / 2 - 0.45), B0 + BH + 2, sz * (W / 2 - 0.45)], segs: 4, rotY: Math.PI / 4 });
      }
    b.box(W + 0.4, 0.4, W + 0.4, stone, { at: [0, B0 + BH, 0] });
    // parapet and the steep slate spire with lucarnes, finished with a gilded vane
    b.box(W + 0.2, 0.7, W + 0.2, stone, { at: [0, B0 + BH + 0.4, 0] }); // pierced parapet, solid at this scale
    const SP = B0 + BH + 0.4;
    b.cone((W - 0.8) * 0.72, 11, P.slate, { at: [0, SP, 0], segs: 8, rotY: Math.PI / 8 });
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.group({ rotY: f, at: [0, SP + 1.2, 0] }, () => {
        b.box(1.0, 1.3, 1.2, stone, { at: [0, 0, 1.6] });
        b.gable(1.0, 1.2, 0.8, P.slate, { at: [0, 1.3, 1.6], ridge: 'z', wall: stone });
      });
    }
    b.cyl(0.07, 2.4, P.iron, { at: [0, SP + 10.6, 0], segs: 4 });
    b.box(0.9, 0.35, 0.04, P.gold, { at: [0.2, SP + 12.2, 0] });
  });
}

/** Height of the top of the vane above the ground, for anchors and checks. */
export const TOWER_TOP = TOWER.shaft + 1.8 + 5 + 0.4 + 13;

/** Like Builder.colonnade but with a facet count, to keep long colonnades within budget. */
export function columns(
  b: Builder,
  n: number,
  spacing: number,
  r: number,
  h: number,
  color: number,
  o: { at: [number, number, number]; axis?: 'x' | 'z'; order?: 'plain' | 'tuscan' | 'doric' | 'ionic' | 'corinthian'; segs?: number },
): void {
  for (let i = 0; i < n; i++) {
    const p = (i - (n - 1) / 2) * spacing;
    const at: [number, number, number] =
      o.axis === 'z' ? [o.at[0], o.at[1], o.at[2] + p] : [o.at[0] + p, o.at[1], o.at[2]];
    b.column(r, h, color, { at, order: o.order ?? 'tuscan', segs: o.segs ?? 7 });
  }
}

/** One straight length of a curtain wall, as `curtainPieces` cuts a polyline into them. */
export interface WallPiece {
  /** Index of the polyline segment and of the piece within it. */
  seg: number;
  k: number;
  /** Ends and middle of the piece in plan, its turn, length (with overlap), foot and wall-walk height. */
  ax: number;
  az: number;
  bx: number;
  bz: number;
  mx: number;
  mz: number;
  ang: number;
  len: number;
  lo: number;
  top: number;
  /** Plan length of the piece and the right-hand normal of the segment. */
  run: number;
  nx: number;
  nz: number;
}

/**
 * The straight pieces a curtain wall along `pts` is built in (see `curtain`). Each segment is cut
 * into equal pieces no longer than `piece`; a piece depends only on its own segment, so a later
 * stage that keeps a stretch of wall gets exactly the same pieces for it.
 */
export function curtainPieces(
  pts: XZ[],
  h: number,
  t: number,
  o?: { base?: (x: number, z: number) => number; foot?: (x: number, z: number) => number; piece?: number },
): WallPiece[] {
  const base = o?.base ?? (() => 0);
  const foot = o?.foot;
  const piece = o?.piece ?? 4;
  const out: WallPiece[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.ceil(L / piece));
    const ang = Math.atan2(-(z1 - z0), x1 - x0);
    const nx = -(z1 - z0) / L;
    const nz = (x1 - x0) / L;
    for (let k = 0; k < n; k++) {
      const u0 = k / n;
      const u1 = (k + 1) / n;
      const ax = x0 + (x1 - x0) * u0;
      const az = z0 + (z1 - z0) * u0;
      const bx = x0 + (x1 - x0) * u1;
      const bz = z0 + (z1 - z0) * u1;
      const mx = (ax + bx) / 2;
      const mz = (az + bz) / 2;
      out.push({
        seg: i,
        k,
        ax,
        az,
        bx,
        bz,
        mx,
        mz,
        ang,
        len: L / n + t * 0.6,
        // the foot goes down to the lowest ground under the piece (into a ditch it crosses)
        lo: foot
          ? Math.min(...[0, 0.25, 0.5, 0.75, 1].map((u) => foot(ax + (bx - ax) * u, az + (bz - az) * u))) - 0.6
          : Math.min(base(ax, az), base(bx, bz)) - 0.6,
        top: base(mx, mz) + h,
        run: L / n,
        nx,
        nz,
      });
    }
  }
  return out;
}

/** The body of one curtain piece, from below the ground up to its wall-walk. */
export function wallBody(b: Builder, p: WallPiece, t: number, color: number): void {
  b.box(p.len, p.top - p.lo, t, color, { at: [p.mx, p.lo, p.mz], rotY: p.ang });
}

/**
 * A battlemented stone curtain wall along a polyline, stepping up where it climbs the motte.
 * `h` is the height of the wall-walk above the ground under it; merlons stand on the outer edge.
 * `outer` is +1 if the outside is to the right of the direction of travel, -1 if to the left.
 * `foot` gives the ground the wall is founded on, where it differs from `base` (a ditch it crosses).
 * `raise` builds the wall to `h` as before and then heightens it by that much: the old wall body
 * stays the same piece, and the battlements are rebuilt on top of the new course.
 */
export function curtain(
  b: Builder,
  pts: XZ[],
  h: number,
  t: number,
  color: number,
  o?: {
    base?: (x: number, z: number) => number;
    foot?: (x: number, z: number) => number;
    outer?: 1 | -1;
    merlon?: number;
    piece?: number;
    walk?: number;
    raise?: number;
  },
): void {
  const outer = o?.outer ?? 1;
  const mw = o?.merlon ?? 0.8;
  const walk = o?.walk ?? tint(color, -0.08);
  const raise = o?.raise ?? 0;
  for (const p of curtainPieces(pts, h, t, o)) {
    wallBody(b, p, t, color);
    if (raise > 0) b.box(p.len, raise, t, color, { at: [p.mx, p.top, p.mz], rotY: p.ang });
    const top = p.top + raise;
    const { ax, az, bx, bz, mx, mz, ang, len, nx, nz } = p;
    if (!raise) b.box(len, 0.06, t - 0.2, walk, { at: [mx, top, mz], rotY: ang, jitter: false });
    // merlons along the outer edge
    const m = Math.max(1, Math.round(p.run / (mw * 2)));
    for (let j = 0; j < m; j++) {
      const u = (j + 0.5) / m;
      const px = ax + (bx - ax) * u - nx * outer * -1 * (t / 2 - 0.2);
      const pz = az + (bz - az) * u - nz * outer * -1 * (t / 2 - 0.2);
      b.box(mw, 0.9, 0.4, color, { at: [px, top, pz], rotY: ang, jitter: false });
    }
    // a low parapet on the inner edge
    b.box(len, 0.5, 0.3, color, {
      at: [mx - nx * outer * (t / 2 - 0.15), top, mz - nz * outer * (t / 2 - 0.15)],
      rotY: ang,
      jitter: false,
    });
  }
}

// ------------------------------------------------------------------ low-poly arched openings

/** Outline of an arched opening w wide and h tall (to the apex), sampled with few points. */
export function archOutline(w: number, h: number, shape: 'pointed' | 'round' | 'rect', n = 3): [number, number][] {
  const a = w / 2;
  if (shape === 'rect') return [[-a, 0], [a, 0], [a, h], [-a, h]];
  const pts: [number, number][] = [[-a, 0], [a, 0]];
  if (shape === 'round') {
    const hs = Math.max(0, h - a);
    const m = n * 2;
    for (let i = 0; i <= m; i++) {
      const t = (i / m) * Math.PI;
      pts.push([a * Math.cos(t), hs + a * Math.sin(t)]);
    }
    return pts;
  }
  const rise = Math.min(h * 0.6, w * 0.866);
  const hs = h - rise;
  const R = (a * a + rise * rise) / (2 * a);
  const phi = Math.atan2(rise, R - a);
  // right side: circle centred at (a - R, hs) from angle 0 up to phi
  for (let i = 0; i < n; i++) {
    const t = (i / n) * phi;
    pts.push([a - R + R * Math.cos(t), hs + R * Math.sin(t)]);
  }
  pts.push([0, h]);
  for (let i = n - 1; i >= 0; i--) {
    const t = (i / n) * phi;
    pts.push([-(a - R + R * Math.cos(t)), hs + R * Math.sin(t)]);
  }
  return pts;
}

/** A cheap arched panel standing `depth` proud of a wall (same placement rules as Builder.panel). */
export function arch(
  b: Builder,
  w: number,
  h: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; shape?: 'pointed' | 'round' | 'rect'; depth?: number; mat?: 'matte' | 'glass'; n?: number },
): void {
  const depth = o.depth ?? 0.06;
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(archOutline(w, h, o.shape ?? 'pointed', o.n ?? 3), depth + 0.03, color, {
      at: [0, 0, (depth - 0.03) / 2],
      mat: o.mat,
      jitter: false,
    });
  });
}

/** A cheap arched window: frame, dark glazing and an optional central mullion. */
export function archWindow(
  b: Builder,
  w: number,
  h: number,
  o: { at?: [number, number, number]; facing?: Facing; shape?: 'pointed' | 'round'; frame?: number; glass?: number; mullion?: boolean; border?: number },
): void {
  const frame = o.frame ?? P.limestone;
  const border = o.border ?? Math.min(0.12, w * 0.12);
  const shape = o.shape ?? 'pointed';
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    arch(b, w, h, frame, { shape, depth: 0.05 });
    arch(b, w - border * 2, h - border * 2, o.glass ?? P.windowDark, { at: [0, border, 0], shape, depth: 0.075 });
    if (o.mullion) b.box(Math.min(0.1, w * 0.08), h - border * 2 - (shape === 'round' ? w / 2 : w * 0.4), 0.1, frame, { at: [0, border, 0.06], jitter: false });
  });
}

/**
 * A wall pierced by a row of arched openings down to the ground: a cheap stand-in for
 * Builder.archWall (same placement: w wide, h tall, t thick, standing on `at`, facing `facing`).
 */
export function arcade(
  b: Builder,
  w: number,
  h: number,
  t: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; openings: number; openW: number; openH: number; shape?: 'pointed' | 'round'; n?: number },
): void {
  const pitch = w / o.openings;
  const pts: [number, number][] = [[-w / 2, 0]];
  for (let i = 0; i < o.openings; i++) {
    const xc = -w / 2 + (i + 0.5) * pitch;
    const ol = archOutline(o.openW, o.openH, o.shape ?? 'pointed', o.n ?? 3);
    pts.push([xc - o.openW / 2, 0]);
    for (const [x, y] of ol.slice(2).reverse()) pts.push([xc + x, y]);
    pts.push([xc + o.openW / 2, 0]);
  }
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(pts, t, color);
  });
}
