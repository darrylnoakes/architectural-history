import type { Builder, Vec3 } from '@ah/kit';

/**
 * Local helpers for the river crossing. Geometry rules (from the brief): the road runs along Z
 * through the origin; the river flows along X between z = -8 and z = +8. Banks are at y = 0, the
 * water at y = -1.2 and the bed at about y = -2.2. Decks meet the road at z = ±13.
 */
export const BANK = 8;
export const END = 13;
export const WATER = -1.2;
export const BED = -2.2;

export type ZY = [number, number];

/** Height of the walkable hump used by `b.deck(w, 26, crown, { yEnds: 0 })`. */
export function hump(crown: number, half = END): (z: number) => number {
  return (z) => crown * (1 - (z / half) * (z / half));
}

/** n + 1 evenly spaced values from a to b. */
export function steps(n: number, a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  return out;
}

/**
 * Extrude a profile drawn in the bridge elevation (Z along the road, Y up) across the river
 * direction: the solid is `width` thick along X, centred on `x`.
 */
export function side(b: Builder, pts: ZY[], width: number, color: number, x = 0, holes?: ZY[][], mat?: 'matte' | 'glass'): void {
  b.extrude(
    pts.map(([z, y]) => [-z, y] as [number, number]),
    width,
    color,
    { at: [x, 0, 0], rotY: Math.PI / 2, holes: holes?.map((h) => h.map(([z, y]) => [-z, y] as [number, number])), mat },
  );
}

/** A band between two curves lo(z) and hi(z) from z0 to z1, extruded `width` along X at `x`. */
export function band(
  b: Builder,
  x: number,
  width: number,
  z0: number,
  z1: number,
  lo: (z: number) => number,
  hi: (z: number) => number,
  color: number,
  n = 12,
  mat?: 'matte' | 'glass',
): void {
  const zs = steps(n, z0, z1);
  const pts: ZY[] = [...zs.map((z) => [z, hi(z)] as ZY), ...zs.reverse().map((z) => [z, lo(z)] as ZY)];
  side(b, pts, width, color, x, undefined, mat);
}

/** A straight bar of square section `s` (or [sx, sz]) from p0 to p1. */
export function bar(b: Builder, p0: Vec3, p1: Vec3, s: number | [number, number], color: number): void {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-4) return;
  const hz = Math.hypot(dx, dz);
  const yaw = hz < 1e-6 ? 0 : Math.atan2(dx, dz);
  const pitch = Math.atan2(hz, dy);
  const [sx, sz] = typeof s === 'number' ? [s, s] : s;
  b.group({ at: p0, rotY: yaw }, () => {
    b.group({ rot: [pitch, 0, 0] }, () => b.box(sx, len, sz, color));
  });
}

export type ArchKind = 'round' | 'segmental' | 'pointed' | 'ellipse';

/**
 * Intrados of an arch from (z0, spring) over the top to (z1, spring).
 * `rise` is the height of the apex above the springing. 'pointed' is two-centred and needs
 * rise >= half the span; 'segmental' and 'round' are single-centred circles.
 */
export function archCurve(z0: number, z1: number, spring: number, rise: number, kind: ArchKind, n = 10): ZY[] {
  const a = (z1 - z0) / 2;
  const cz = (z0 + z1) / 2;
  const out: ZY[] = [];
  if (kind === 'ellipse') {
    for (let i = 0; i <= n; i++) {
      const t = Math.PI - (Math.PI * i) / n;
      out.push([cz + a * Math.cos(t), spring + rise * Math.sin(t)]);
    }
  } else if (kind === 'pointed') {
    const r = Math.max(rise, a);
    const R = (r * r + a * a) / (2 * a);
    const h = Math.ceil(n / 2);
    // left arc centred at (cz + R - a, spring)
    const ccL = cz + R - a;
    const phi = Math.atan2(r, cz - ccL); // angle of apex from left centre
    for (let i = 0; i <= h; i++) {
      const t = Math.PI + ((phi - Math.PI) * i) / h;
      out.push([ccL + R * Math.cos(t), spring + R * Math.sin(t)]);
    }
    const ccR = cz - (R - a);
    const phiR = Math.atan2(r, cz - ccR);
    for (let i = 1; i <= h; i++) {
      const t = phiR + ((0 - phiR) * i) / h;
      out.push([ccR + R * Math.cos(t), spring + R * Math.sin(t)]);
    }
  } else {
    const r = kind === 'round' ? a : rise;
    const R = (a * a + r * r) / (2 * r);
    const cy = spring + r - R;
    const t0 = Math.atan2(spring - cy, z0 - cz);
    const t1 = Math.atan2(spring - cy, z1 - cz);
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      out.push([cz + R * Math.cos(t), cy + R * Math.sin(t)]);
    }
  }
  return out;
}

/** Offset an arch curve outward by `d` (approximately, along the local normal). */
export function offsetCurve(c: ZY[], d: number): ZY[] {
  return c.map((p, i) => {
    const a = c[Math.max(0, i - 1)];
    const q = c[Math.min(c.length - 1, i + 1)];
    const tz = q[0] - a[0];
    const ty = q[1] - a[1];
    const l = Math.hypot(tz, ty) || 1;
    // left-to-right curve over the top: outward normal is (-ty, tz)
    return [p[0] - (ty / l) * d, p[1] + (tz / l) * d] as ZY;
  });
}

/** A ring (voussoirs or an iron rib) following an arch: thickness `d` outward from the intrados. */
export function archRing(b: Builder, curve: ZY[], d: number, width: number, color: number, x = 0): void {
  const outer = offsetCurve(curve, d);
  side(b, [...curve, ...outer.reverse()], width, color, x);
}

export interface Opening {
  z0: number;
  z1: number;
  spring: number;
  rise: number;
  kind: ArchKind;
}

/**
 * A solid bridge body seen in elevation: top follows `top(z)` from -END to END, sits on the banks
 * (at `base`) beyond ±BANK, goes down to the bed between, and has arched openings cut from below.
 */
export function elevation(
  b: Builder,
  o: { x?: number; width: number; color: number; top: (z: number) => number; openings: Opening[]; base?: number; bed?: number; ends?: number; n?: number },
): void {
  const ends = o.ends ?? END;
  const base = o.base ?? -0.3;
  const bed = o.bed ?? BED - 0.1;
  const pts: ZY[] = [];
  for (const z of steps(o.n ?? 24, -ends, ends)) pts.push([z, o.top(z)]);
  pts.push([ends, base], [BANK, base], [BANK, bed]);
  const ops = [...o.openings].sort((p, q) => q.z1 - p.z1);
  for (const op of ops) {
    pts.push([op.z1, bed]);
    const c = archCurve(op.z0, op.z1, op.spring, op.rise, op.kind, 12).reverse();
    pts.push(...c);
    pts.push([op.z0, bed]);
  }
  pts.push([-BANK, bed], [-BANK, base], [-ends, base]);
  // drop consecutive duplicates
  const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4);
  side(b, clean, o.width, o.color, o.x ?? 0);
}

/** A pier footprint with pointed cutwaters at both ends (pointing ±X, up and down stream). */
export function cutwaterPier(
  b: Builder,
  o: { z: number; len: number; thick: number; y0: number; h: number; color: number; nose?: number; capColor?: number; cap?: number },
): void {
  const nose = o.nose ?? o.thick * 0.8;
  const L = o.len / 2;
  const t = o.thick / 2;
  // plan outline in XZ; extrude upward by rotating the extrusion
  const plan: [number, number][] = [
    [-L - nose, 0],
    [-L, -t],
    [L, -t],
    [L + nose, 0],
    [L, t],
    [-L, t],
  ];
  // extrude along local z, then tip it up so the depth runs along +Y
  b.group({ at: [0, o.y0, o.z], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(plan, o.h, o.color, { at: [0, 0, o.h / 2] });
  });
  if (o.cap) {
    const c = o.cap;
    const capPlan: [number, number][] = [
      [-L - nose - c, 0],
      [-L - c * 0.4, -t - c],
      [L + c * 0.4, -t - c],
      [L + nose + c, 0],
      [L + c * 0.4, t + c],
      [-L - c * 0.4, t + c],
    ];
    b.group({ at: [0, o.y0 + o.h, o.z], rot: [-Math.PI / 2, 0, 0] }, () => {
      b.extrude(capPlan, 0.25, o.capColor ?? o.color, { at: [0, 0, 0.125] });
    });
  }
}

/** Slope angle to pass as rot[0] so a box laid at z follows the curve f. */
export function tilt(f: (z: number) => number, z: number): number {
  const e = 0.05;
  return -Math.atan((f(z + e) - f(z - e)) / (2 * e));
}

/** Transverse planks laid along the curve f (their top surface on f), from z0 to z1. */
export function plankDeck(
  b: Builder,
  o: { width: number; f: (z: number) => number; z0: number; z1: number; pitch?: number; thick?: number; color: number; x?: number },
): void {
  const pitch = o.pitch ?? 0.45;
  const th = o.thick ?? 0.08;
  const n = Math.round((o.z1 - o.z0) / pitch);
  const p = (o.z1 - o.z0) / n;
  for (let i = 0; i < n; i++) {
    const z = o.z0 + (i + 0.5) * p;
    const w = o.width + b.range(-0.12, 0.12);
    b.box(w, th, p - 0.04, o.color, { at: [(o.x ?? 0) + b.range(-0.05, 0.05), o.f(z) - th, z], rot: [tilt(o.f, z), 0, 0] });
  }
}

/** Post-and-rail handrail along the edge at x, following the deck curve f. */
export function handrail(
  b: Builder,
  o: { x: number; f: (z: number) => number; z0: number; z1: number; posts: number; h?: number; color: number; post?: number; mid?: boolean },
): void {
  const h = o.h ?? 1.0;
  const ps = o.post ?? 0.14;
  const zs = steps(o.posts - 1, o.z0, o.z1);
  for (const z of zs) b.box(ps, h, ps, o.color, { at: [o.x, o.f(z) - 0.05, z] });
  for (let i = 0; i < zs.length - 1; i++) {
    const za = zs[i];
    const zb = zs[i + 1];
    bar(b, [o.x, o.f(za) + h - 0.1, za], [o.x, o.f(zb) + h - 0.1, zb], [0.12, 0.1], o.color);
    if (o.mid) bar(b, [o.x, o.f(za) + h * 0.5, za], [o.x, o.f(zb) + h * 0.5, zb], [0.08, 0.08], o.color);
  }
}
