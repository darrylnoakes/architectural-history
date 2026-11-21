import { P, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';
import * as THREE from 'three';

/** Points of a semicircle of radius r centred on (cx, cy), from the left springing over to the right. */
export function semi(r: number, cx = 0, cy = 0, n = 12): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI - (i / n) * Math.PI;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * A moulded arch band (archivolt) standing proud of a wall: a half ring from radius r to r + t,
 * springing at `springY`, `depth` thick, set on a wall surface at `at` facing `facing`.
 */
export function archivolt(b: Builder, r: number, t: number, springY: number, depth: number, color: number, at: Vec3, facing: Facing = '+z', n = 10): void {
  const outer = semi(r + t, 0, springY, n);
  const inner = semi(r, 0, springY, n).reverse();
  b.group({ at, rotY: typeof facing === 'number' ? facing : { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 }[facing] }, () => {
    b.extrude([...outer, ...inner], depth, color, { at: [0, 0, depth / 2] });
  });
}

/** A level moulded band (cornice, string course) running round a w × d rectangle at height y. */
export function ring(b: Builder, w: number, d: number, y: number, h: number, color: number, at: Vec3 = [0, 0, 0]): void {
  b.box(w, h, d, color, { at: [at[0], y, at[2]] });
}

/** Turned pot or jar. */
export function pot(b: Builder, at: Vec3, s = 1, color: number = P.terracotta): void {
  b.lathe(
    [
      [0.01, 0],
      [0.13 * s, 0],
      [0.2 * s, 0.17 * s],
      [0.1 * s, 0.36 * s],
      [0.11 * s, 0.4 * s],
    ],
    color,
    { at, segs: 6 },
  );
}

/** Roman amphora standing on its point (propped in a ring of stones, or leant on a wall). */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta, tilt = 0): void {
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
    { at, segs: 7, rot: [tilt, 0, 0] },
  );
}

/** Little heaps of produce on a surface: baskets, sacks, pots, cloth, fruit, fish. Laid out along local X. */
export function goods(
  b: Builder,
  w: number,
  at: Vec3,
  rotY = 0,
  kinds: ('basket' | 'sack' | 'pot' | 'cloth' | 'fruit' | 'fish' | 'cheese')[] = ['basket', 'sack', 'pot'],
): void {
  b.group({ at, rotY }, () => {
    const n = Math.max(1, Math.floor(w / 0.55));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + ((i + 0.5) * w) / n;
      const k = kinds[(i + Math.floor(b.rand() * 3)) % kinds.length];
      if (k === 'basket') {
        b.cyl(0.2, 0.16, P.wattle, { at: [x, 0, 0], rTop: 0.24, segs: 7 });
        b.blob(0.17, b.pick([P.crop, P.leaf, P.doorRed, P.leafAutumn, P.olive]), { at: [x, 0.17, 0], stretch: [1, 0.45, 1], detail: 0 });
      } else if (k === 'sack') {
        b.blob(0.2, P.daub, { at: [x, 0.18, 0], stretch: [1, 1.2, 0.9], detail: 0 });
      } else if (k === 'pot') {
        pot(b, [x, 0, 0], 0.9, b.pick([P.terracotta, P.tileBrown, P.cotto]));
      } else if (k === 'cloth') {
        b.box(0.42, 0.14, 0.32, b.pick([P.doorBlue, P.doorRed, P.ochreWash, P.doorGreen, P.porphyry]), { at: [x, 0, 0] });
        b.box(0.38, 0.1, 0.3, b.pick([P.cream, P.pinkWash, P.cladBlue, P.gold]), { at: [x, 0.14, 0] });
      } else if (k === 'fish') {
        for (let j = 0; j < 3; j++) b.box(0.1, 0.06, 0.38, tint(P.steel, 0.06 * j), { at: [x - 0.13 + j * 0.13, 0, (j % 2) * 0.06 - 0.03], rotY: 0.2 * (j - 1) });
      } else if (k === 'cheese') {
        b.cyl(0.17, 0.12, P.cream, { at: [x, 0, 0], segs: 8 });
        b.cyl(0.13, 0.1, P.limestoneWarm, { at: [x, 0.12, 0], segs: 8 });
      } else {
        b.blob(0.18, b.pick([P.doorRed, P.leafAutumn, P.leaf, P.cladYellow]), { at: [x, 0.07, 0], stretch: [1.1, 0.5, 0.9], detail: 0 });
      }
    }
  });
}

/** A plain trestle table w × d whose top is at about 0.85 m. Front (customer side) faces local +Z. */
export function trestle(b: Builder, w: number, d: number, at: Vec3, rotY = 0, top: number = P.oak): void {
  b.group({ at, rotY }, () => {
    b.box(w, 0.06, d, top, { at: [0, 0.82, 0] });
    for (const sx of [-1, 1]) b.box(0.07, 0.82, d * 0.85, tint(top, -0.08), { at: [sx * (w / 2 - 0.2), 0, 0] });
  });
}

/**
 * A market stall: a trestle with goods under a cloth awning on four poles, the awning sloping
 * down to the customer side (+Z). `stripe` gives a second awning colour in bands.
 */
export function stall(
  b: Builder,
  w: number,
  at: Vec3,
  rotY: number,
  cloth: number,
  stripe?: number,
  kinds?: Parameters<typeof goods>[4],
): void {
  const d = 1.0;
  b.group({ at, rotY }, () => {
    trestle(b, w, d, [0, 0, 0], 0, P.pine);
    goods(b, w - 0.3, [0, 0.88, 0], 0, kinds);
    const hb = 2.45;
    const hf = 2.05;
    for (const sx of [-1, 1]) {
      b.box(0.07, hb, 0.07, P.oakDark, { at: [sx * (w / 2 + 0.05), 0, -d / 2 - 0.25] });
      b.box(0.07, hf, 0.07, P.oakDark, { at: [sx * (w / 2 + 0.05), 0, d / 2 + 0.35] });
    }
    const run = d + 0.6 + 0.4;
    const ang = Math.atan2(hb - hf, run - 0.4);
    const len = Math.hypot(run, hb - hf);
    const n = stripe ? Math.max(3, Math.round(w / 0.5)) : 1;
    for (let i = 0; i < n; i++) {
      const sw = (w + 0.4) / n;
      b.box(sw, 0.04, len, i % 2 && stripe ? stripe : cloth, {
        at: [-(w + 0.4) / 2 + (i + 0.5) * sw, (hb + hf) / 2 + 0.02, 0.05],
        rot: [ang, 0, 0],
        jitter: false,
      });
    }
    // valance hanging at the front edge
    b.box(w + 0.4, 0.22, 0.03, stripe ?? tint(cloth, -0.08), { at: [0, hf - 0.2, d / 2 + 0.55] });
  });
}

/** Grain sack standing on end, tied at the top. */
export function sack(b: Builder, at: Vec3, s = 1): void {
  b.blob(0.24 * s, P.daub, { at: [at[0], at[1] + 0.26 * s, at[2]], stretch: [1, 1.35, 0.9], detail: 0 });
  b.cyl(0.06 * s, 0.1 * s, tint(P.daub, -0.1), { at: [at[0], at[1] + 0.56 * s, at[2]], segs: 5 });
}

/** Cattle, sheep or pig for the pens. Head toward local +X. */
export function beast(b: Builder, at: Vec3, rotY: number, kind: 'cow' | 'sheep' | 'pig' = 'cow', color?: number): void {
  const body = color ?? (kind === 'sheep' ? P.cream : kind === 'pig' ? tint(P.oakDark, 0.06) : P.limestone);
  const s = kind === 'cow' ? 1.6 : 1;
  b.group({ at, rotY }, () => {
    for (const x of [-0.2, 0.2]) for (const z of [-0.1, 0.1]) b.box(0.07 * s, 0.34 * s, 0.07 * s, kind === 'cow' ? P.gritstone : P.oakDark, { at: [x * s, 0, z * s] });
    b.blob(0.3 * s, body, { at: [0, 0.5 * s, 0], stretch: [1.4, 0.8, 0.8], detail: 0 });
    b.blob(0.13 * s, kind === 'sheep' ? P.timberBlack : body, { at: [0.45 * s, 0.62 * s, 0], stretch: [1.2, 1, 0.9], detail: 0 });
    if (kind === 'cow') {
      // the long lyre-shaped horns of the old grey cattle of central Italy
      for (const z of [-1, 1]) b.beam([0.47 * s, 0.7 * s, 0.05 * z * s], [0.5 * s, 0.82 * s, 0.24 * z * s], 0.03, 0.03, P.cream);
    }
  });
}

/** A post-and-rail pen of split timber, w × d, centred on `at`, with a gap (gate) on the +Z side. */
export function pen(b: Builder, w: number, d: number, at: Vec3, rotY = 0, gate = 1.4): void {
  b.group({ at, rotY }, () => {
    const posts: [number, number][] = [];
    const nx = Math.max(2, Math.round(w / 1.6));
    const nz = Math.max(2, Math.round(d / 1.6));
    for (let i = 0; i <= nx; i++) {
      const x = -w / 2 + (i * w) / nx;
      posts.push([x, -d / 2]);
      if (Math.abs(x) > gate / 2 - 0.01) posts.push([x, d / 2]);
    }
    for (let j = 1; j < nz; j++) {
      const z = -d / 2 + (j * d) / nz;
      posts.push([-w / 2, z], [w / 2, z]);
    }
    for (const [x, z] of posts) b.box(0.1, 1.25, 0.1, P.oakDark, { at: [x, 0, z] });
    for (const y of [0.45, 0.95]) {
      b.box(w, 0.07, 0.06, P.oak, { at: [0, y, -d / 2] });
      b.box(0.06, 0.07, d, P.oak, { at: [-w / 2, y, 0] });
      b.box(0.06, 0.07, d, P.oak, { at: [w / 2, y, 0] });
      const half = (w - gate) / 2;
      for (const sx of [-1, 1]) b.box(half, 0.07, 0.06, P.oak, { at: [sx * (gate / 2 + half / 2), y, d / 2] });
    }
  });
}

/** Paving: a slab of stone with a few lighter and darker flags to break it up. */
export function paving(b: Builder, w: number, d: number, color: number, h = 0.08, at: Vec3 = [0, 0, 0], flags = 10): void {
  b.box(w, h, d, color, { at, jitter: false });
  for (let i = 0; i < flags; i++) {
    const fw = b.range(0.8, 1.6);
    const fd = b.range(0.6, 1.2);
    b.box(fw, 0.012, fd, tint(color, b.range(-0.05, 0.04)), {
      at: [at[0] + b.range(-w / 2 + fw / 2, w / 2 - fw / 2), at[1] + h, at[2] + b.range(-d / 2 + fd / 2, d / 2 - fd / 2)],
      jitter: false,
    });
  }
}

/**
 * Rows of cover tiles (imbrices or coppi) running down a roof slope: one rib per x in `xs`, from
 * (yLow, zLow) at the eaves up to (yHigh, zHigh) at the ridge. Slopes along Z; for an X slope use a group with rotY.
 */
export function tileRibs(b: Builder, xs: number[], yLow: number, zLow: number, yHigh: number, zHigh: number, color: number, size = 0.13): void {
  for (const x of xs) b.beam([x, yLow + 0.05, zLow], [x, yHigh + 0.05, zHigh], size, size * 0.7, color);
}

/**
 * A roof that slopes inward all round a courtyard (like a Roman peristyle or the roof round an
 * atrium): the outer edge of an ow × od rectangle at yOut, the inner edge of an iw × id rectangle at
 * yIn, `t` thick. Centred on `at` (x, z).
 */
export function ringRoof(b: Builder, ow: number, od: number, iw: number, id: number, yOut: number, yIn: number, color: number, t = 0.16, at: Vec3 = [0, 0, 0]): void {
  const O: Vec3[] = [
    [-ow / 2, yOut, -od / 2],
    [ow / 2, yOut, -od / 2],
    [ow / 2, yOut, od / 2],
    [-ow / 2, yOut, od / 2],
  ];
  const I: Vec3[] = [
    [-iw / 2, yIn, -id / 2],
    [iw / 2, yIn, -id / 2],
    [iw / 2, yIn, id / 2],
    [-iw / 2, yIn, id / 2],
  ];
  const pos: number[] = [];
  const quad = (a: Vec3, b2: Vec3, c: Vec3, d: Vec3) => pos.push(...a, ...b2, ...c, ...a, ...c, ...d);
  const dn = (p: Vec3): Vec3 => [p[0], p[1] - t, p[2]];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    quad(O[i], I[i], I[j], O[j]); // top
    quad(dn(O[i]), dn(O[j]), dn(I[j]), dn(I[i])); // underside
    quad(I[i], dn(I[i]), dn(I[j]), I[j]); // inner fascia
    quad(O[i], O[j], dn(O[j]), dn(O[i])); // outer fascia
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  b.add(g, color, { at });
}
