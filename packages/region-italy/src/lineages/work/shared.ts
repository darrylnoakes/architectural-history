import { P, type Builder, type Vec3 } from '@ah/kit';

/** Plot-local z of the river bank (water lies beyond it, toward -Z). */
export const BANK = -11;
/** Height of the river surface. */
export const WATER = -1.2;

type Pt = [number, number];

/** A circle as an outline of n points (for extrude). */
export function circlePts(r: number, n = 20, cx = 0, cy = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** A flat ring (annulus) in the XY plane, `depth` thick along Z, centred on `at`. */
export function ring(b: Builder, rOut: number, rIn: number, depth: number, color: number, at: Vec3, n = 20): void {
  b.extrude(circlePts(rOut, n), depth, color, { at, holes: [circlePts(rIn, n).reverse()] });
}

/** A horizontal ring lying flat (in the XZ plane), its underside at `at`. */
export function flatRing(b: Builder, rOut: number, rIn: number, t: number, color: number, at: Vec3, n = 20): void {
  b.group({ at: [at[0], at[1], at[2]], rot: [-Math.PI / 2, 0, 0] }, () => ring(b, rOut, rIn, t, color, [0, 0, t / 2], n));
}

/** A bar from (x0, y0) to (x1, y1) in the local XY plane, `t` square, centred on z. */
export function bar(b: Builder, x0: number, y0: number, x1: number, y1: number, t: number, depth: number, color: number, z = 0): void {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const a = Math.atan2(x1 - x0, y1 - y0);
  b.group({ at: [(x0 + x1) / 2, (y0 + y1) / 2, z], rot: [0, 0, -a] }, () => {
    b.box(t, len, depth, color, { at: [0, -len / 2, 0] });
  });
}

export interface WheelOpts {
  /** Centre of the axle. */
  at: Vec3;
  /** Outer radius. */
  r: number;
  /** Width of the wheel along its axle. */
  width: number;
  /** 'z' (default): axle along Z, the wheel turns in the XY plane. 'x': axle along X. */
  axis?: 'x' | 'z';
  /** 'undershot': open floats driven by the current. 'breast': closed buckets between shrouds. */
  kind?: 'undershot' | 'breast';
  paddles?: number;
  spokes?: number;
  color?: number;
  iron?: boolean;
  spin?: number;
  /** Which way along the axle the shaft runs on: +1 (default) or -1. */
  axleDir?: 1 | -1;
  /** Length of axle beyond the wheel (default 1.6). */
  axle?: number;
}

/** A waterwheel: rims, floats or buckets, arms, hub and axle. */
export function waterwheel(b: Builder, o: WheelOpts): void {
  const kind = o.kind ?? 'undershot';
  const timber = o.color ?? P.oak;
  const metal = o.iron ? P.castIron : timber;
  const r = o.r;
  const w = o.width;
  const n = o.paddles ?? Math.max(8, Math.round(r * 6));
  const spokes = o.spokes ?? (r > 3 ? 8 : 6);
  const rot: Vec3 = o.axis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0];
  b.group({ at: o.at, rot }, () => {
    b.group({ rot: [0, 0, o.spin ?? 0] }, () => {
      const closed = kind === 'breast';
      const rimD = closed ? Math.min(0.7, r * 0.2) : Math.min(0.28, r * 0.1);
      const rimT = 0.12;
      const seg = r > 3 ? 28 : 18;
      for (const s of [-1, 1]) ring(b, r, r - rimD, rimT, o.iron ? metal : timber, [0, 0, (s * (w - rimT)) / 2], seg);
      if (closed) {
        b.extrude(circlePts(r - rimD + 0.04, seg), w - rimT * 2, P.oakDark, { holes: [circlePts(r - rimD - 0.06, seg).reverse()] });
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => {
            b.group({ at: [0, r - rimD, 0], rot: [0, 0, 0.45] }, () => b.box(0.06, rimD * 1.05, w - rimT * 2, timber));
          });
        }
      } else {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => b.box(0.07, rimD + 0.35, w, timber, { at: [0, r - rimD - 0.05, 0] }));
        }
      }
      for (const s of [-1, 1]) {
        for (let i = 0; i < spokes / 2; i++) {
          const a = (i / (spokes / 2)) * Math.PI;
          const L = r - rimD + 0.05;
          bar(b, -Math.sin(a) * L, -Math.cos(a) * L, Math.sin(a) * L, Math.cos(a) * L, o.iron ? 0.1 : 0.16, 0.14, metal, (s * (w - 0.4)) / 2);
        }
      }
    });
    const ax = o.axle ?? 1.6;
    b.log(o.iron ? 0.2 : 0.24, w + ax, o.iron ? P.iron : P.oakDark, { at: [0, -(o.iron ? 0.2 : 0.24), (ax / 2 - 0.3) * (o.axleDir ?? 1)], axis: 'z', segs: 8 });
    b.log(r * 0.12 + 0.15, w * 0.85, metal, { at: [0, -(r * 0.12 + 0.15), 0], axis: 'z', segs: 8 });
  });
}

/** A masonry river wall along the bank from x0 to x1, its face at about z = BANK - 0.2. */
export function riverWall(b: Builder, x0: number, x1: number, color: number, o?: { coping?: number; top?: number }): void {
  const top = o?.top ?? 0.15;
  const w = x1 - x0;
  b.box(w, top - WATER + 0.6, 0.8, color, { at: [(x0 + x1) / 2, WATER - 0.6, BANK + 0.2] });
  if (o?.coping !== undefined) b.box(w + 0.1, 0.18, 0.95, o.coping, { at: [(x0 + x1) / 2, top, BANK + 0.2] });
}

/** A timber landing stage: planked deck at `y` from the bank out over the water, on piles. */
export function jetty(b: Builder, x: number, w: number, len: number, o?: { y?: number; color?: number }): void {
  const y = o?.y ?? 0.1;
  const col = o?.color ?? P.oak;
  const z0 = BANK + 1;
  const zc = z0 - (len + 1) / 2;
  b.box(w, 0.14, len + 1, col, { at: [x, y, zc] });
  const nz = Math.max(2, Math.round(len / 2) + 1);
  for (let i = 0; i < nz; i++) {
    const z = BANK - (len * i) / (nz - 1) + (i === 0 ? 0 : 0.15);
    for (const s of [-1, 1]) b.cyl(0.13, y - WATER + 0.9, P.oakDark, { at: [x + s * (w / 2 - 0.12), WATER - 0.7, z], segs: 6 });
  }
  b.deck(w, len + 1, y + 0.14, { at: [x, 0, zc] });
}

/** Steps from the bank top down into the water, centred on x, `w` wide, projecting `run` past the bank. */
export function waterSteps(b: Builder, x: number, w: number, run: number, color: number): void {
  b.stairs(w, -WATER + 0.3, run, 6, color, { at: [x, WATER - 0.3, BANK - run / 2 + 0.2], rotY: Math.PI });
}

/** Water lying in a channel (a mill race, vat or basin) at height y: a thin glossy slab. */
export function water(b: Builder, w: number, d: number, at: Vec3, color: number = P.water): void {
  b.box(w, 0.05, d, color, { at, mat: 'glass', jitter: false });
}

/** A Roman amphora standing on `at` (about 1.1 m tall). */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta): void {
  b.lathe(
    [
      [0.02, 0],
      [0.06, 0.12],
      [0.17, 0.4],
      [0.19, 0.62],
      [0.15, 0.78],
      [0.07, 0.84],
      [0.06, 1.05],
      [0.08, 1.1],
    ],
    color,
    { at, segs: 8 },
  );
}

/** A rounded storage jar (dolium or orcio), its base on `at`. */
export function jar(b: Builder, at: Vec3, h: number, color: number = P.terracotta): void {
  b.lathe(
    [
      [h * 0.15, 0],
      [h * 0.34, h * 0.25],
      [h * 0.36, h * 0.55],
      [h * 0.24, h * 0.88],
      [h * 0.18, h * 0.92],
      [h * 0.2, h],
    ],
    color,
    { at, segs: 9 },
  );
}

/** A donkey (or mule), about 1.2 m at the shoulder, facing +X before rotY. */
export function donkey(b: Builder, at: Vec3, rotY = 0, color = 0x8a7b6c): void {
  b.group({ at, rotY }, () => {
    b.box(1.1, 0.5, 0.42, color, { at: [0, 0.65, 0] });
    for (const x of [-0.42, 0.42]) for (const z of [-0.13, 0.13]) b.box(0.1, 0.68, 0.1, color, { at: [x, 0, z] });
    b.beam([0.5, 1.0, 0], [0.75, 1.25, 0], 0.22, 0.24, color);
    b.box(0.42, 0.2, 0.2, color, { at: [0.92, 1.12, 0], rot: [0, 0, -0.5] });
    for (const z of [-0.06, 0.06]) b.box(0.05, 0.28, 0.06, color, { at: [0.72, 1.32, z] });
    b.beam([-0.55, 1.05, 0], [-0.7, 0.55, 0], 0.05, 0.05, color);
  });
}

/** A rowing or cargo boat: a hull of length L and beam w along X, its waterline at WATER. */
export function boat(b: Builder, at: Vec3, L: number, w: number, color: number = P.oak, rotY = 0): void {
  b.group({ at: [at[0], WATER - 0.25, at[2]], rotY }, () => {
    // hull profile in XY, extruded across the beam, then the deck inside
    const h = Math.min(1.1, w * 0.45);
    b.extrude(
      [
        [-L / 2, h],
        [-L / 2 + 0.6, 0],
        [L / 2 - 0.9, 0],
        [L / 2, h + 0.2],
        [L / 2 - 0.3, h + 0.2],
        [L / 2 - 0.9, h],
      ],
      w,
      color,
    );
    b.box(L - 1.2, 0.06, w - 0.24, P.oakDark, { at: [-0.1, h - 0.18, 0] });
  });
}

/** A coppi (pan-and-cover tile) roof: a low gable at about 22 degrees. */
export function coppiRoof(b: Builder, w: number, d: number, at: Vec3, o?: { ridge?: 'x' | 'z'; wall?: number; overhang?: number; color?: number; pitch?: number }): void {
  const span = (o?.ridge ?? 'x') === 'x' ? d : w;
  const h = (span / 2) * Math.tan(((o?.pitch ?? 22) * Math.PI) / 180);
  b.gable(w, d, h, o?.color ?? P.coppi, { at, ridge: o?.ridge, overhang: o?.overhang ?? 0.45, wall: o?.wall, thick: 0.18 });
}

/** The rise of a coppi roof of the given span (for placing things on the ridge). */
export function roofRise(span: number, pitch = 22): number {
  return (span / 2) * Math.tan((pitch * Math.PI) / 180);
}

/** A row of evenly spaced items between a and b (inclusive of both ends). */
export function lin(n: number, a: number, c: number): number[] {
  if (n === 1) return [(a + c) / 2];
  return Array.from({ length: n }, (_, i) => a + ((c - a) * i) / (n - 1));
}

// ---------------------------------------------------------------- the river works the plot keeps

/**
 * The Roman quay wall, faced in travertine, built with the warehouse in the second century. Every
 * later building on the plot stands behind it: the boat mills tie up to it, the medieval mills build
 * their channel off it, the power station lets its tailrace out through it.
 */
export function quayWall(b: Builder, color: number): void {
  b.box(36, 0.15 - WATER + 0.6, 1.0, color, { at: [0, WATER - 0.6, BANK + 0.3] });
}

/** Line of the stone wall built out in the riverbed to make the mill channel. */
export const RACE_Z = -13.6;
/** Middle of the mill channel, where the wheels hang. */
export const RACE_MID = (RACE_Z + BANK) / 2;

/**
 * The medieval weir (pescaia) and mill channel, first built for the fulling mill of about 1150:
 * a stone wall out in the river making a channel along the bank, the fast water in it, and a low dam
 * of stone and stakes slanting upstream across the river to turn the water in. Weirs like this were
 * kept and repaired for centuries by one mill after another, and many on Italian rivers still stand.
 */
export function millRace(b: Builder, stone: number): void {
  const cz = RACE_Z;
  b.box(26, 0.7 - WATER + 0.6, 0.9, stone, { at: [-1, WATER - 0.6, cz] });
  b.box(26, 0.12, 1.0, stone, { at: [-1, 0.7, cz] });
  water(b, 26, 2.1, [-1, WATER + 0.12, (cz + BANK) / 2 - 0.15]); // the fast water in the channel, a little higher
  const wx0 = -14;
  const wz0 = cz;
  const wx1 = -18;
  const wz1 = -25;
  const wy = WATER + 0.22;
  b.beam([wx0, wy - 0.25, wz0], [wx1, wy - 0.25, wz1], 1.2, 0.5, stone); // crest
  b.beam([wx0 + 1.0, WATER - 0.12, wz0], [wx1 + 1.0, WATER - 0.12, wz1], 1.0, 0.3, stone); // apron below
  b.beam([wx0 + 0.75, WATER + 0.06, wz0], [wx1 + 0.75, WATER + 0.06, wz1], 0.5, 0.06, 0xeef3f4); // white water spilling over
  for (let i = 0; i < 12; i++) {
    const f = i / 11;
    b.cyl(0.08, 0.9, P.oakDark, { at: [wx0 + (wx1 - wx0) * f - 0.55, WATER - 0.4, wz0 + (wz1 - wz0) * f], segs: 5, jitter: false });
  }
}
