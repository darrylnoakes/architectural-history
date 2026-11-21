import { P, tint, type Builder, type Vec3 } from '@ah/kit';

/** A square-section timber or bar from p0 to p1 (any direction). */
export function beam(b: Builder, p0: Vec3, p1: Vec3, size: number, color: number, depth = size): void {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-4) return;
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(Math.hypot(dx, dz), dy);
  b.box(size, len, depth, color, { at: p0, rot: [pitch, yaw, 0] });
}

/** Octagonal prism with circumradius r, a flat face toward +Z. */
export function oct(b: Builder, r: number, h: number, color: number, at: Vec3 = [0, 0, 0], rTop = r): void {
  b.cyl(r, h, color, { at, rTop, segs: 8, rotY: Math.PI / 8 });
}

/** Points of a rounded rectangle w (X) × d (Z) with corner radius r, as [x, z] pairs, anticlockwise from above. */
export function roundRect(w: number, d: number, r: number, n = 5): [number, number][] {
  const pts: [number, number][] = [];
  const cs: [number, number, number][] = [
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, Math.PI / 2],
    [-w / 2 + r, -d / 2 + r, Math.PI],
    [w / 2 - r, -d / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cz, a0] of cs) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  }
  return pts;
}

/** A horizontal slab whose plan outline is `pts` ([x, z] pairs), from height y0, h thick. */
export function slab(b: Builder, pts: [number, number][], y0: number, h: number, color: number, mat?: 'glass'): void {
  b.extrude(
    pts.map(([x, z]) => [x, -z] as [number, number]),
    h,
    color,
    { at: [0, y0 + h / 2, 0], rot: [-Math.PI / 2, 0, 0], mat },
  );
}

/** Woven hazel hurdle panel `len` long, standing on `at`, running along X (rotate with rotY). */
export function hurdle(b: Builder, len: number, h: number, at: Vec3, rotY = 0, color: number = P.wattle): void {
  b.group({ at, rotY }, () => {
    const n = Math.max(2, Math.round(len / 0.45));
    for (let i = 0; i <= n; i++) b.box(0.05, h + 0.15, 0.05, P.bark, { at: [-len / 2 + (i * len) / n, 0, 0] });
    const rows = Math.max(3, Math.round(h / 0.14));
    for (let j = 0; j < rows; j++) {
      const y = 0.06 + (j * (h - 0.06)) / rows;
      b.box(len, (h - 0.06) / rows - 0.02, 0.07, j % 2 ? color : tint(color, -0.06), { at: [0, y, (j % 2 ? 1 : -1) * 0.01] });
    }
  });
}

/** Turned pot or jar. */
export function pot(b: Builder, at: Vec3, s = 1, color: number = P.terracotta): void {
  b.lathe(
    [
      [0.01, 0],
      [0.12 * s, 0],
      [0.2 * s, 0.14 * s],
      [0.17 * s, 0.3 * s],
      [0.1 * s, 0.36 * s],
      [0.11 * s, 0.4 * s],
      [0.09 * s, 0.4 * s],
    ],
    color,
    { at, segs: 7 },
  );
}

/** Roman amphora, standing on its point. */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta): void {
  b.lathe(
    [
      [0.01, 0],
      [0.06, 0.1],
      [0.18, 0.45],
      [0.17, 0.7],
      [0.06, 0.82],
      [0.05, 0.98],
      [0.07, 1.0],
    ],
    color,
    { at, segs: 7 },
  );
}

/** A plain trestle stall w × d with goods on top. Front (customer side) faces +Z of the local frame. */
export function trestle(b: Builder, w: number, d: number, at: Vec3, rotY: number, top: number = P.oak): void {
  b.group({ at, rotY }, () => {
    b.box(w, 0.06, d, top, { at: [0, 0.82, 0] });
    for (const sx of [-1, 1]) {
      b.box(0.06, 0.82, d * 0.9, tint(top, -0.08), { at: [sx * (w / 2 - 0.2), 0, 0] });
    }
  });
}

/** Little heaps of produce on a surface: a mixture of baskets, sacks and pots. */
export function goods(b: Builder, w: number, at: Vec3, rotY = 0, kinds: ('basket' | 'sack' | 'pot' | 'cloth' | 'fruit')[] = ['basket', 'sack', 'pot']): void {
  b.group({ at, rotY }, () => {
    const n = Math.max(1, Math.floor(w / 0.55));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + ((i + 0.5) * w) / n;
      const k = kinds[(i + Math.floor(b.rand() * 3)) % kinds.length];
      if (k === 'basket') {
        b.cyl(0.2, 0.16, P.wattle, { at: [x, 0, 0], rTop: 0.24, segs: 7 });
        b.blob(0.17, b.pick([P.crop, P.leaf, P.doorRed, P.leafAutumn]), { at: [x, 0.17, 0], stretch: [1, 0.45, 1], detail: 0 });
      } else if (k === 'sack') {
        b.blob(0.2, P.daub, { at: [x, 0.18, 0], stretch: [1, 1.2, 0.9], detail: 0 });
      } else if (k === 'pot') {
        pot(b, [x, 0, 0], 0.9, b.pick([P.terracotta, P.tileBrown, P.oakDark]));
      } else if (k === 'cloth') {
        b.box(0.42, 0.14, 0.32, b.pick([P.doorBlue, P.doorRed, P.ochreWash, P.doorGreen]), { at: [x, 0, 0] });
        b.box(0.38, 0.1, 0.3, b.pick([P.cream, P.pinkWash, P.cladBlue]), { at: [x, 0.14, 0] });
      } else {
        for (let j = 0; j < 3; j++) b.sphere(0.08, b.pick([P.doorRed, P.leafAutumn, P.leaf]), { at: [x - 0.1 + j * 0.1, 0.08, (j % 2) * 0.06], segs: 5 });
      }
    }
  });
}

/** Barrel standing upright. */
export function barrel(b: Builder, at: Vec3, s = 1): void {
  b.lathe(
    [
      [0.01, 0],
      [0.22 * s, 0],
      [0.27 * s, 0.35 * s],
      [0.22 * s, 0.7 * s],
      [0.01, 0.7 * s],
    ],
    P.oak,
    { at, segs: 8 },
  );
  b.cyl(0.235 * s, 0.04, P.iron, { at: [at[0], at[1] + 0.12 * s, at[2]], segs: 8 });
  b.cyl(0.235 * s, 0.04, P.iron, { at: [at[0], at[1] + 0.54 * s, at[2]], segs: 8 });
}

/** A sheep or pig for the stock pens. */
export function beast(b: Builder, at: Vec3, rotY: number, kind: 'sheep' | 'pig' | 'cow' = 'sheep'): void {
  const body = kind === 'sheep' ? P.cream : kind === 'pig' ? P.pinkWash : P.oak;
  const s = kind === 'cow' ? 1.6 : 1;
  b.group({ at, rotY }, () => {
    for (const x of [-0.18, 0.18]) for (const z of [-0.1, 0.1]) b.box(0.06 * s, 0.32 * s, 0.06 * s, P.oakDark, { at: [x * s, 0, z * s] });
    b.blob(0.3 * s, body, { at: [0, 0.48 * s, 0], stretch: [1.35, 0.8, 0.85], detail: 0 });
    b.blob(0.13 * s, kind === 'sheep' ? P.timberBlack : body, { at: [0.42 * s, 0.6 * s, 0], detail: 0 });
  });
}
