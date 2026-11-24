import { P, type Builder, type Vec3 } from '@ah/kit';

/** A straight bar (post, rail, brace, ladder side) of square section th between two 3D points. */
export function bar(b: Builder, p0: Vec3, p1: Vec3, th: number, color: number): void {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const horiz = Math.hypot(dx, dz);
  const len = Math.hypot(horiz, dy);
  const mid: Vec3 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
  b.group({ at: mid, rotY: Math.atan2(-dz, dx) }, () =>
    b.group({ rot: [0, 0, Math.atan2(dy, horiz)] }, () => b.box(len, th, th, color, { at: [0, -th / 2, 0] })),
  );
}

/**
 * Pyramid with a thick vertical lip at the eaves (a lathe with four sides, scaled to w × d).
 * `at` is the eaves (bottom) level. Total height h + lip.
 */
export function thickPyramid(b: Builder, w: number, d: number, h: number, lip: number, color: number, at: Vec3): void {
  const R = Math.SQRT1_2;
  b.group({ at, scale: [w, 1, d] }, () =>
    b.lathe(
      [
        [0, 0],
        [R, 0],
        [R, lip],
        [0, h + lip],
      ],
      color,
      { segs: 4, rotY: Math.PI / 4 },
    ),
  );
}

/**
 * Hipped roof with real thickness (good for thatch). w × d is the wall-top rectangle, `at` the wall-top
 * centre; `ov` the overhang; h the rise above the wall top. `ridge` is the ridge length (default w - d).
 * `gablet` > 0 adds a half-hip: a small vertical gable (smoke hole) of that height at each ridge end.
 * Ridge always runs along X: rotate with a group for the other way.
 */
export function thickHip(
  b: Builder,
  w: number,
  d: number,
  h: number,
  color: number,
  o: { at?: Vec3; ov?: number; t?: number; ridge?: number; gablet?: number; hole?: number } = {},
): void {
  const at = o.at ?? [0, 0, 0];
  const ov = o.ov ?? 0;
  const t = o.t ?? 0.35;
  const half = d / 2;
  const drop = (ov * h) / half;
  const W = w + ov * 2;
  const D = d + ov * 2;
  const H = h + drop;
  const r = Math.max(0, Math.min(W - 0.01, o.ridge ?? w - d));
  const y0 = at[1] - drop;
  if (r > 0.01) {
    b.gable(r, D, H, color, { at: [at[0], y0, at[2]], thick: t * (half / Math.hypot(half, h)) });
  }
  const pw = W - r;
  for (const s of r > 0.01 ? [-1, 1] : [0]) {
    thickPyramid(b, pw, D, H, t, color, [at[0] + (s * r) / 2, y0, at[2]]);
  }
  if (o.gablet && r > 0.01) {
    const g = o.gablet;
    const span = (g * D) / H; // same pitch as the long slopes
    const th = 0.08;
    const tv = (th * Math.hypot(span / 2, g)) / (span / 2);
    const yb = y0 + H + t - g - tv; // cap top surface lies on the main roof's top surface
    const xg = r / 2 + ((pw / 2) * (g + tv)) / H; // where the hip end's top surface meets the gablet base
    for (const s of [-1, 1]) {
      const len = xg - r / 2 + 0.3;
      const cx = at[0] + s * (xg - len / 2);
      b.gable(len, span, g, color, { at: [cx, yb, at[2]], thick: th, wall: o.hole ?? P.timberBlack });
    }
  }
}

/** Conical roof with a thick eave lip. `at` is the eaves centre. */
export function coneRoof(b: Builder, R: number, h: number, color: number, at: Vec3, o: { t?: number; segs?: number } = {}): void {
  const t = o.t ?? 0.35;
  b.lathe(
    [
      [0, 0],
      [R, 0],
      [R, t],
      [0, h + t],
    ],
    color,
    { at, segs: o.segs ?? 16 },
  );
}

/** A run of wattle hurdles (woven fence panels) with stakes, from p0 to p1 on the ground. */
export function hurdles(
  b: Builder,
  p0: [number, number],
  p1: [number, number],
  o: { h?: number; color?: number; post?: number; panel?: number } = {},
): void {
  const h = o.h ?? 1.0;
  const color = o.color ?? P.wattle;
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const n = Math.max(1, Math.round(len / (o.panel ?? 1.8)));
  const ang = Math.atan2(-dz, dx);
  b.group({ at: [(p0[0] + p1[0]) / 2, 0, (p0[1] + p1[1]) / 2], rotY: ang }, () => {
    b.box(len, h * 0.85, 0.07, color, { at: [0, 0.08, 0] });
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + (len * i) / n;
      b.box(0.09, h, 0.09, o.post ?? P.oak, { at: [x, 0, 0] });
    }
  });
}

/** A paling or picket fence (vertical boards on rails) from p0 to p1. */
export function paling(
  b: Builder,
  p0: [number, number],
  p1: [number, number],
  o: { h?: number; color?: number; gap?: number } = {},
): void {
  const h = o.h ?? 1.1;
  const color = o.color ?? P.oak;
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(-dz, dx);
  const gap = o.gap ?? 0.22;
  const n = Math.max(2, Math.round(len / gap));
  b.group({ at: [(p0[0] + p1[0]) / 2, 0, (p0[1] + p1[1]) / 2], rotY: ang }, () => {
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (len * (i + 0.5)) / n;
      b.box(0.11, h * (0.92 + ((i * 37) % 7) * 0.012), 0.06, color, { at: [x, 0, 0] });
    }
    b.box(len, 0.08, 0.06, color, { at: [0, h * 0.25, -0.06] });
    b.box(len, 0.08, 0.06, color, { at: [0, h * 0.75, -0.06] });
  });
}

/** A low flat patch of ground (yard, path, court). Slightly raised to avoid z-fighting. */
export function patch(b: Builder, w: number, d: number, color: number, at: [number, number], y = 0.02): void {
  b.box(w, y, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** A sheep, for scale and life. */
export function sheep(b: Builder, x: number, z: number, rotY: number): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    for (const [lx, lz] of [
      [0.22, 0.12],
      [0.22, -0.12],
      [-0.22, 0.12],
      [-0.22, -0.12],
    ]) {
      b.box(0.06, 0.32, 0.06, P.timberBlack, { at: [lx, 0, lz] });
    }
    b.blob(0.3, P.cream, { at: [0, 0.5, 0], stretch: [1.45, 0.95, 1], detail: 0 });
    b.box(0.17, 0.2, 0.15, P.timberBlack, { at: [0.5, 0.5, 0] });
  });
}

/**
 * The wattle fence round the crofts behind the row: across the back of the plot and down both ends.
 * Put up for the cob cottages and kept on the same lines when the landlord's row replaced them.
 */
export function croftFence(b: Builder): void {
  hurdles(b, [-12.5, -6.8], [12.5, -6.8]);
  hurdles(b, [-12.5, -6.8], [-12.5, -1.2]);
  hurdles(b, [12.5, -6.8], [12.5, -1.2]);
}
