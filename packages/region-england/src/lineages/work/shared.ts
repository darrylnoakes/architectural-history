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
  /**
   * 'z' (default): axle runs along Z, the wheel turns in the XY plane (hung on a wall facing the river).
   * 'x': axle along X. 'y': a horizontal wheel on a vertical shaft (the early "Norse" mill).
   */
  axis?: 'x' | 'y' | 'z';
  /**
   * 'undershot': open paddles (floats) between two light rims, driven by the current.
   * 'breast' / 'overshot': closed buckets between solid shrouds, fed at mid-height or over the top.
   * 'horizontal': spoon-shaped paddles round a hub, for a vertical-shaft mill.
   */
  kind?: 'undershot' | 'breast' | 'overshot' | 'horizontal';
  /** Number of floats or buckets. */
  paddles?: number;
  /** Number of arms (spokes). */
  spokes?: number;
  /** Timber colour (oak by default). */
  color?: number;
  /** Iron rims, arms and hub (the cast and wrought iron wheels of the 1780s on). */
  iron?: boolean;
  /** Turn the whole wheel by this angle (radians) so repeated wheels do not look identical. */
  spin?: number;
  /** Which way along the axle the shaft runs on into the building: +1 (default, toward +Z/+X) or -1. */
  axleDir?: 1 | -1;
}

/**
 * A waterwheel: rims, floats or buckets, arms, hub and axle. Low-poly, about 300 to 900 triangles.
 * Place the axle centre with `at`; for a wheel dipping into the river set at[1] to about r + WATER - 0.3.
 */
export function waterwheel(b: Builder, o: WheelOpts): void {
  const kind = o.kind ?? 'undershot';
  const axis = o.axis ?? (kind === 'horizontal' ? 'y' : 'z');
  const timber = o.color ?? P.oak;
  const metal = o.iron ? P.castIron : timber;
  const r = o.r;
  const w = o.width;
  const n = o.paddles ?? Math.max(8, Math.round(r * 6));
  const spokes = o.spokes ?? (r > 3 ? 8 : 6);
  const rot: Vec3 = axis === 'x' ? [0, Math.PI / 2, 0] : axis === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0];

  b.group({ at: o.at, rot }, () => {
    b.group({ rot: [0, 0, o.spin ?? 0] }, () => {
      if (kind === 'horizontal') {
        // a hub on the shaft with angled spoon paddles round it, all lying in one plane
        b.log(r * 0.22, w * 1.4, timber, { at: [0, -r * 0.22, 0], axis: 'z', segs: 8 });
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => {
            b.group({ at: [0, r * 0.2, 0], rot: [0, 0.6, 0] }, () => {
              b.box(0.1, r * 0.8, w, timber, { at: [0, 0, 0] });
            });
          });
        }
        return;
      }
      const closed = kind === 'breast' || kind === 'overshot';
      const rimD = closed ? Math.min(0.7, r * 0.2) : Math.min(0.28, r * 0.1);
      const rimT = 0.12;
      const seg = r > 3 ? 28 : 20;
      // rims (or solid shrouds) on both faces
      for (const s of [-1, 1]) ring(b, r, r - rimD, rimT, o.iron ? metal : timber, [0, 0, (s * (w - rimT)) / 2], seg);
      if (closed) {
        // sole boards: the inner drum that closes the buckets
        b.extrude(circlePts(r - rimD + 0.04, seg), w - rimT * 2, tintSole(timber), { at: [0, 0, 0], holes: [circlePts(r - rimD - 0.06, seg).reverse()] });
        // buckets: angled boards between the shrouds
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => {
            b.group({ at: [0, r - rimD, 0], rot: [0, 0, 0.45] }, () => b.box(0.06, rimD * 1.05, w - rimT * 2, timber));
          });
        }
      } else {
        // floats: flat boards standing out beyond the rims, so they bite the current
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => b.box(0.07, rimD + 0.35, w, timber, { at: [0, r - rimD - 0.05, 0] }));
        }
      }
      // arms: pairs of crossing spokes on each face
      for (const s of [-1, 1]) {
        for (let i = 0; i < spokes / 2; i++) {
          const a = (i / (spokes / 2)) * Math.PI;
          const L = r - rimD + 0.05;
          bar(b, -Math.sin(a) * L, -Math.cos(a) * L, Math.sin(a) * L, Math.cos(a) * L, o.iron ? 0.1 : 0.16, 0.14, metal, (s * (w - 0.4)) / 2);
        }
      }
    });
    // axle and hub (axle runs through into the building behind)
    b.log(o.iron ? 0.2 : 0.24, w + 1.6, o.iron ? P.iron : P.oakDark, { at: [0, -(o.iron ? 0.2 : 0.24), 0.5 * (o.axleDir ?? 1)], axis: 'z', segs: 8 });
    b.log(r * 0.12 + 0.15, w * 0.85, metal, { at: [0, -(r * 0.12 + 0.15), 0], axis: 'z', segs: 8 });
  });
}

function tintSole(c: number): number {
  return c === P.oak ? P.oakDark : c;
}

/** A stone or brick river wall along the bank from x0 to x1, its face at z = BANK - 0.2. */
export function riverWall(b: Builder, x0: number, x1: number, color: number, o?: { coping?: number; top?: number }): void {
  const top = o?.top ?? 0.15;
  const w = x1 - x0;
  b.box(w, top - WATER + 0.6, 0.8, color, { at: [(x0 + x1) / 2, WATER - 0.6, BANK + 0.2] });
  if (o?.coping !== undefined) b.box(w + 0.1, 0.18, 0.95, o.coping, { at: [(x0 + x1) / 2, top, BANK + 0.2] });
}

/** A timber landing stage: planked deck at `y` from the bank out over the water, on piles. */
export function jetty(b: Builder, x: number, w: number, len: number, o?: { y?: number; color?: number; piles?: number }): void {
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
  // stairs() climbs toward -Z from its +Z foot; turn it round so it climbs from the water up to the bank
  b.stairs(w, -WATER + 0.3, run, 6, color, { at: [x, WATER - 0.3, BANK - run / 2 + 0.2], rotY: Math.PI });
}

/** Water lying in a channel (a mill race or pond) at height y: a thin glossy slab. */
export function water(b: Builder, w: number, d: number, at: Vec3): void {
  b.box(w, 0.05, d, P.water, { at, mat: 'glass', jitter: false });
}
