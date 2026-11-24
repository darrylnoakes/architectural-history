import { P, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** A squared timber (or any bar) running from p0 to p1 in 3D, w wide and h deep. */
export function beam(b: Builder, p0: Vec3, p1: Vec3, w: number, h: number, color: number): void {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const len = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(dy, Math.hypot(dx, dz));
  const mid: Vec3 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
  b.group({ at: mid, rotY: yaw, rot: [-pitch, 0, 0] }, () => {
    b.box(w, h, len, color, { at: [0, -h / 2, 0] });
  });
}

/** Points along a quadratic curve from a to c bending toward control point m. */
export function curve(a: [number, number], m: [number, number], c: [number, number], n = 6): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * m[0] + t * t * c[0], u * u * a[1] + 2 * u * t * m[1] + t * t * c[1]]);
  }
  return out;
}

/** A curved timber of thickness t lying in a vertical plane, following a quadratic curve. */
export function curvedTimber(
  b: Builder,
  a: [number, number],
  m: [number, number],
  c: [number, number],
  t: number,
  depth: number,
  color: number,
  o: { at?: Vec3; rotY?: number } = {},
): void {
  const mid = curve(a, m, c, 7);
  // offset inward by t along the normal of each segment
  const inner: [number, number][] = mid.map((p, i) => {
    const q = mid[Math.min(i + 1, mid.length - 1)];
    const r = mid[Math.max(i - 1, 0)];
    const tx = q[0] - r[0];
    const ty = q[1] - r[1];
    const l = Math.hypot(tx, ty) || 1;
    return [p[0] - (ty / l) * t, p[1] + (tx / l) * t];
  });
  b.extrude([...mid, ...inner.reverse()], depth, color, o);
}

/** A hurdle (woven wattle) fence between two ground points. */
export function hurdle(b: Builder, x0: number, z0: number, x1: number, z1: number, h = 1.0, color: number = P.wattle): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(2, Math.round(len / 1.1));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    b.cyl(0.045, h + 0.1, P.oak, { at: [x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t], segs: 4 });
  }
  b.group({ at: [(x0 + x1) / 2, 0.08, (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) }, () => {
    b.box(0.06, h - 0.12, len, color);
  });
}

/** A simple post-and-rail or picket fence along X or Z. */
export function paling(b: Builder, x0: number, z0: number, x1: number, z1: number, h: number, color: number, gap = 0.18): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(2, Math.round(len / gap));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    b.box(0.07, h, 0.07, color, { at: [x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t], jitter: false });
  }
  b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) }, () => {
    b.box(0.04, 0.07, len, color, { at: [0, h * 0.25, 0] });
    b.box(0.04, 0.07, len, color, { at: [0, h * 0.75, 0] });
  });
}

/** A cow-ish beast for scale (about 1.3 m at the shoulder) standing on `at`, facing +Z then rotated. */
export function cow(b: Builder, at: Vec3, rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    b.box(0.7, 0.7, 1.6, color, { at: [0, 0.6, 0] });
    b.box(0.36, 0.4, 0.5, color, { at: [0, 0.95, 1.0], rot: [0.5, 0, 0] });
    for (const [x, z] of [[-0.25, -0.6], [0.25, -0.6], [-0.25, 0.6], [0.25, 0.6]]) {
      b.box(0.14, 0.62, 0.14, color, { at: [x, 0, z] });
    }
  });
}

/** A Georgian or Victorian sash: frame, dark glass, glazing bars and a meeting rail. */
export function sash(
  b: Builder,
  w: number,
  h: number,
  at: Vec3,
  facing: Facing,
  panes: [number, number],
  o: { frame?: number; shape?: 'rect' | 'segmental' | 'round' } = {},
): void {
  b.window(w, h, { at, facing, frame: o.frame ?? P.white, bars: panes, border: 0.08, shape: o.shape ?? 'rect' });
}

/** A ground-level path or yard surface, a thin slab just above the grass. */
export function pave(b: Builder, w: number, d: number, color: number, at: Vec3): void {
  b.box(w, 0.03, d, color, { at: [at[0], at[1] + 0.005, at[2]], jitter: false });
}

/**
 * Hipped roof (ridge along X, so w must exceed d) with small gablets at the ends of the ridge,
 * the triangular smoke outlets of houses with an open hearth. `ends` picks which ends get one.
 */
export function hipGablet(
  b: Builder,
  w: number,
  d: number,
  h: number,
  color: number,
  o: { at?: Vec3; overhang?: number; g?: number; ends?: (1 | -1)[]; hole?: number },
): void {
  const at = o.at ?? [0, 0, 0];
  const ov = o.overhang ?? 0;
  const L = w + ov * 2;
  const S = d + ov * 2;
  const r = (L - S) / 2;
  const drop = (ov * h) / (S / 2);
  const k = (h + drop) / (S / 2);
  const g = o.g ?? 0.7;
  b.hip(w, d, h, color, { at, overhang: ov });
  for (const s of o.ends ?? [1, -1]) {
    const hg = g * k;
    const len = g + 0.6;
    b.gable(len, 2 * g, hg, color, {
      at: [at[0] + s * (r + g - len / 2), at[1] + h - hg + 0.02, at[2]],
      thick: 0.12,
      wall: o.hole ?? P.timberBlack,
    });
  }
}

/*
 * The plot's boundaries, laid out with the late Saxon town and kept for centuries after the houses on
 * them were rebuilt. Each is built by the same call in every stage that keeps it, so it stands still
 * while the house changes.
 */

/** Wattle fences down both sides of the tenement, from near the street to the back. */
export function tenementSides(b: Builder): void {
  hurdle(b, -6.6, 6.1, -6.6, -8.6, 1.2);
  hurdle(b, 6.6, 6.1, 6.6, -8.6, 1.2);
}

/** The wattle fence across the back of the tenement. */
export function tenementBack(b: Builder): void {
  hurdle(b, -6.6, -8.6, 6.6, -8.6, 1.2);
}

/** A paling along the street front, with a gap for the path a little right of centre. */
export function streetPaling(b: Builder): void {
  paling(b, -6.6, 7.6, 1.2, 7.6, 1.0, P.oakSilver, 0.22);
  paling(b, 3.0, 7.6, 6.6, 7.6, 1.0, P.oakSilver, 0.22);
}

/**
 * The brick walls round the back garden, first built for the Georgian house (its back wall stands at
 * z -4) and kept by the terrace and the semi that followed, so they stay in the old red brick.
 */
export function gardenWalls(b: Builder): void {
  const brick = tint(P.brickRed, -0.04);
  b.sym((s) => b.box(0.24, 1.8, 4.9, brick, { at: [s * 6.8, 0, -6.45] }));
  b.box(13.84, 1.8, 0.24, brick, { at: [0, 0, -8.9] });
}
