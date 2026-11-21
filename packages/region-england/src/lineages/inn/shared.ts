import { P, facingAngle, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** A vertical prism from a plan outline given as [x, z] points (world plan), from y0 rising h. */
export function prism(b: Builder, pts: [number, number][], h: number, color: number, y0 = 0): void {
  b.extrude(
    pts.map(([x, z]) => [x, -z] as [number, number]),
    h,
    color,
    { at: [0, y0 + h / 2, 0], rot: [-Math.PI / 2, 0, 0] },
  );
}

/** A flat ground surface (yard, car park, terrace) w × d, a few centimetres thick. */
export function ground(b: Builder, w: number, d: number, color: number, at: [number, number], h = 0.04): void {
  b.box(w, h, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** A straight timber pole between two points (round section). */
export function pole(b: Builder, a: Vec3, c: Vec3, r: number, color: number, segs = 6): void {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  const dz = c[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(Math.hypot(dx, dz), dy);
  b.group({ at: a, rotY: yaw }, () => {
    b.group({ rot: [pitch, 0, 0] }, () => b.cyl(r, len, color, { segs }));
  });
}

/**
 * An ale-stake: a pole projecting from a wall with a bush (or garland) tied to its end,
 * the sign that new ale was ready. `at` is where the pole meets the wall.
 */
export function aleStake(b: Builder, at: Vec3, facing: Facing, len = 2.6, rise = 0.5): void {
  const a = facingAngle(facing);
  const end: Vec3 = [at[0] + Math.sin(a) * len, at[1] + rise, at[2] + Math.cos(a) * len];
  pole(b, at, end, 0.06, P.oakDark);
  b.blob(0.6, P.leafDark, { at: [end[0], end[1] - 0.4, end[2]], stretch: [1, 1.2, 1], detail: 0 });
  b.blob(0.42, P.leaf, { at: [end[0], end[1] - 0.85, end[2]], detail: 0 });
}

/**
 * A hanging sign on a wall bracket. `at` is the bracket root on the wall surface,
 * the board hangs `out` metres from the wall, its face perpendicular to the wall.
 */
export function hangingSign(
  b: Builder,
  at: Vec3,
  facing: Facing,
  board: number,
  o?: { out?: number; w?: number; h?: number; bracket?: number; picture?: number; frame?: number },
): void {
  const out = o?.out ?? 1.5;
  const w = o?.w ?? 1.0;
  const h = o?.h ?? 1.2;
  const br = o?.bracket ?? P.castIron;
  b.group({ at, rotY: facingAngle(facing) }, () => {
    // bracket arm and diagonal stay
    b.box(0.06, 0.08, out + 0.15, br, { at: [0, 0, (out + 0.15) / 2] });
    const sl = Math.hypot(out * 0.75, 0.6);
    b.group({ at: [0, -0.6, 0], rot: [Math.atan2(out * 0.75, 0.6), 0, 0] }, () => b.box(0.04, sl, 0.04, br));
    // chains and board (the board's faces look along the street, ±X in local space)
    b.box(0.02, 0.15, 0.02, br, { at: [0, -0.15, out - w / 2 + 0.1] });
    b.box(0.02, 0.15, 0.02, br, { at: [0, -0.15, out + w / 2 - 0.1 - 0.0] });
    b.box(0.08, h, w, o?.frame ?? P.timberBlack, { at: [0, -0.15 - h, out] });
    b.box(0.1, h - 0.16, w - 0.16, board, { at: [0, -0.07 - h, out] });
    if (o?.picture !== undefined) {
      b.box(0.12, (h - 0.16) * 0.5, (w - 0.16) * 0.55, o.picture, { at: [0, -0.15 - h * 0.72, out] });
    }
  });
}

/** A trestle table with two benches. */
export function trestle(b: Builder, at: Vec3, rotY = 0, color: number = P.oak): void {
  b.group({ at, rotY }, () => {
    b.box(1.8, 0.06, 0.7, color, { at: [0, 0.72, 0] });
    b.sym((s) => b.box(0.08, 0.72, 0.6, tint(color, -0.08), { at: [s * 0.7, 0, 0] }));
    b.sym((s) => {
      b.box(1.8, 0.05, 0.28, color, { at: [0, 0.42, s * 0.62] });
      b.sym((t) => b.box(0.06, 0.42, 0.24, tint(color, -0.08), { at: [t * 0.7, 0, s * 0.62] }));
    });
  });
}

/** A barrel lying on or standing on the ground. */
export function barrel(b: Builder, at: Vec3, color: number = P.oak, standing = true): void {
  if (standing) {
    b.lathe([[0.0, 0], [0.26, 0], [0.32, 0.4], [0.26, 0.8], [0.0, 0.8]], color, { at, segs: 8 });
    b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.18, at[2]], segs: 8 });
    b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.58, at[2]], segs: 8 });
  } else {
    b.log(0.3, 0.8, color, { at, segs: 8 });
  }
}

/** A cart wheel standing on edge, axis along X (or Z). */
export function wheel(b: Builder, at: Vec3, r: number, axis: 'x' | 'z', color: number = P.oakDark): void {
  b.log(r, 0.08, color, { at: [at[0], at[1], at[2]], axis, segs: 10 });
}

/**
 * A simple car, front toward +X in local space. `era` 1930s gives separate mudguards and an upright
 * radiator; 1960s a flat-sided saloon; 2010s a rounded hatchback.
 */
export function car(b: Builder, at: Vec3, rotY: number, color: number, era: 1930 | 1965 | 2012): void {
  b.group({ at, rotY }, () => {
    const tyre = P.timberBlack;
    if (era === 1930) {
      b.box(3.6, 0.5, 1.3, color, { at: [0, 0.45, 0] });
      b.box(1.9, 0.75, 1.3, color, { at: [-0.5, 0.95, 0] });
      b.box(1.7, 0.08, 1.36, tint(color, -0.1), { at: [-0.5, 1.7, 0] });
      b.box(0.08, 0.6, 1.1, P.windowDark, { at: [0.47, 1.0, 0] });
      b.box(0.1, 0.6, 0.6, P.steel, { at: [1.8, 0.45, 0] });
      b.sym((s) => {
        b.box(1.0, 0.12, 0.3, P.black, { at: [1.1, 0.75, s * 0.75] });
        b.box(1.0, 0.12, 0.3, P.black, { at: [-1.2, 0.75, s * 0.75] });
        b.box(1.5, 0.06, 0.2, P.black, { at: [0, 0.35, s * 0.75] });
        b.sphere(0.12, P.windowLit, { at: [1.75, 1.0, s * 0.45], segs: 6 });
        for (const x of [1.15, -1.2]) b.log(0.38, 0.22, tyre, { at: [x, 0, s * 0.75], axis: 'z', segs: 10 });
      });
      return;
    }
    const L = era === 1965 ? 4.0 : 4.1;
    b.box(L, 0.65, 1.6, color, { at: [0, 0.3, 0] });
    if (era === 1965) {
      b.box(2.0, 0.55, 1.5, P.windowDark, { at: [-0.2, 0.95, 0] });
      b.box(2.0, 0.06, 1.55, color, { at: [-0.2, 1.5, 0] });
      b.sym((s) => b.box(0.08, 0.55, 0.08, color, { at: [0.78, 0.95, s * 0.72] }));
    } else {
      b.box(2.3, 0.6, 1.5, P.windowDark, { at: [-0.35, 0.95, 0], mat: 'glass' });
      b.box(2.2, 0.08, 1.52, color, { at: [-0.4, 1.53, 0] });
    }
    b.box(0.05, 0.25, 1.4, P.aluminium, { at: [L / 2, 0.38, 0] });
    b.sym((s) => {
      for (const x of [L * 0.32, -L * 0.32]) b.log(0.3, 0.22, tyre, { at: [x, 0, s * 0.72], axis: 'z', segs: 10 });
    });
  });
}

/** White painted parking-bay lines across a strip. */
export function bayLines(b: Builder, x0: number, x1: number, n: number, z: number, len: number): void {
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    b.box(0.1, 0.012, len, P.white, { at: [x, 0.04, z], jitter: false });
  }
}
