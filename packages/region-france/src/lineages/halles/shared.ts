import { P, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';
import * as THREE from 'three';

// Local helpers for the halles lineage.

const FACE: Record<string, number> = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 };
/** Facing as an angle. */
export const faceAngle = (f: Facing): number => (typeof f === 'number' ? f : FACE[f]);

/** Outline of an opening w wide and h tall (to the apex): 'round', 'pointed' or 'rect' head, few facets. */
export function archOutline(w: number, h: number, shape: 'round' | 'rect', n = 4): [number, number][] {
  const a = w / 2;
  if (shape === 'rect') return [[-a, 0], [a, 0], [a, h], [-a, h]];
  const hs = Math.max(0, h - a);
  const pts: [number, number][] = [[-a, 0], [a, 0]];
  for (let i = 0; i <= 2 * n; i++) {
    const t = (i / (2 * n)) * Math.PI;
    pts.push([Math.cos(t) * a, hs + Math.sin(t) * a]);
  }
  return pts;
}

/** A cheap arched panel on a wall: like b.panel but with few facets. `at` is its bottom centre on the wall. */
export function archPanel(b: Builder, w: number, h: number, color: number, at: Vec3, facing: Facing, shape: 'round' | 'rect' = 'round', depth = 0.06, mat?: 'glass', n = 3): void {
  b.group({ at, rotY: faceAngle(facing) }, () => {
    b.extrude(archOutline(w, h, shape, n), depth, color, { at: [0, 0, depth / 2], jitter: false, mat });
  });
}

/**
 * A solid standing on a polygon drawn in plan: `pts` are [x, z] pairs (any winding), the solid
 * rises from y0 to y0 + h. For blocks that are not rectangles (round the rotunda of a passage, say).
 */
export function planSolid(b: Builder, pts: [number, number][], h: number, color: number, y0 = 0, mat?: 'glass'): void {
  b.extrude(
    pts.map(([x, z]) => [x, -z] as [number, number]),
    h,
    color,
    { at: [0, y0 + h / 2, 0], rot: [-Math.PI / 2, 0, 0], mat },
  );
}

/**
 * A thin slab whose top face is the quad a, b, c, d (any four points, in order round the edge),
 * `t` thick, hanging below it. Roof planes, hips, canopies.
 */
export function slab(b: Builder, q: [Vec3, Vec3, Vec3, Vec3], t: number, color: number, mat?: 'glass'): void {
  const dn = (p: Vec3): Vec3 => [p[0], p[1] - t, p[2]];
  const [A, B, C, D] = q;
  const pos: number[] = [];
  const quad = (p: Vec3, q2: Vec3, r: Vec3, s: Vec3) => pos.push(...p, ...q2, ...r, ...p, ...r, ...s);
  quad(A, B, C, D);
  quad(dn(A), dn(D), dn(C), dn(B));
  const ring = [A, B, C, D];
  for (let i = 0; i < 4; i++) {
    const p = ring[i];
    const r = ring[(i + 1) % 4];
    quad(p, dn(p), dn(r), r);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  b.add(g, color, { mat, jitter: mat ? false : undefined });
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

/** Wine amphora of the Italian kind (Dressel 1), standing propped or leant on its point. */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta, tilt = 0, rotY = 0): void {
  b.lathe(
    [
      [0.01, 0],
      [0.05, 0.12],
      [0.16, 0.42],
      [0.15, 0.72],
      [0.05, 0.84],
      [0.045, 1.05],
      [0.065, 1.08],
    ],
    color,
    { at, segs: 6, rot: [tilt, rotY, 0] },
  );
}

/** A wooden barrel on its end (the Gauls' invention), or lying on its side if `lying`. */
export function barrel(b: Builder, at: Vec3, lying = false, rotY = 0): void {
  const prof: [number, number][] = [
    [0.01, 0],
    [0.27, 0],
    [0.33, 0.4],
    [0.27, 0.8],
    [0.01, 0.8],
  ];
  if (lying) b.lathe(prof, P.oak, { at: [at[0], at[1] + 0.33, at[2]], segs: 8, rot: [Math.PI / 2, rotY, 0] });
  else b.lathe(prof, P.oak, { at, segs: 8 });
  // hoops
  if (!lying) for (const y of [0.12, 0.68]) b.cyl(0.31, 0.05, P.oakDark, { at: [at[0], at[1] + y, at[2]], segs: 8 });
}

/** Little heaps of produce on a surface: baskets, sacks, pots, cloth, fruit, fish, cheese. Laid out along local X. */
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
        pot(b, [x, 0, 0], 0.9, b.pick([P.terracotta, P.tileBrown, P.tuilePlate]));
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
export function stall(b: Builder, w: number, at: Vec3, rotY: number, cloth: number, stripe?: number, kinds?: Parameters<typeof goods>[4]): void {
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
    b.box(w + 0.4, 0.22, 0.03, stripe ?? tint(cloth, -0.08), { at: [0, hf - 0.2, d / 2 + 0.55] });
  });
}

/** Grain sack standing on end, tied at the top. */
export function sack(b: Builder, at: Vec3, s = 1): void {
  b.blob(0.24 * s, P.daub, { at: [at[0], at[1] + 0.26 * s, at[2]], stretch: [1, 1.35, 0.9], detail: 0 });
  b.cyl(0.06 * s, 0.1 * s, tint(P.daub, -0.1), { at: [at[0], at[1] + 0.56 * s, at[2]], segs: 5 });
}

/** Cattle, sheep or pig for the pens. Head toward local +X. The Gaulish breeds were small. */
export function beast(b: Builder, at: Vec3, rotY: number, kind: 'cow' | 'sheep' | 'pig' | 'horse' = 'cow', color?: number): void {
  const body = color ?? (kind === 'sheep' ? P.cream : kind === 'pig' ? tint(P.oakDark, 0.08) : kind === 'horse' ? P.oak : P.sandstone);
  const s = kind === 'cow' ? 1.35 : kind === 'horse' ? 1.5 : 1;
  b.group({ at, rotY }, () => {
    const legH = kind === 'horse' ? 0.48 : 0.34;
    for (const x of [-0.2, 0.2]) for (const z of [-0.1, 0.1]) b.box(0.07 * s, legH * s, 0.07 * s, kind === 'sheep' || kind === 'pig' ? P.oakDark : tint(body, -0.12), { at: [x * s, 0, z * s] });
    const by = (legH + 0.16) * s;
    b.blob(0.3 * s, body, { at: [0, by, 0], stretch: [1.4, 0.8, 0.8], detail: 0 });
    if (kind === 'horse') {
      b.beam([0.3 * s, by + 0.1 * s, 0], [0.5 * s, by + 0.45 * s, 0], 0.14 * s, 0.2 * s, body);
      b.box(0.14 * s, 0.13 * s, 0.32 * s, body, { at: [0.6 * s, by + 0.38 * s, 0], rotY: Math.PI / 2 });
    } else {
      b.blob(0.13 * s, kind === 'sheep' ? P.timberBlack : body, { at: [0.45 * s, by + 0.1 * s, 0], stretch: [1.2, 1, 0.9], detail: 0 });
    }
    if (kind === 'cow') for (const z of [-1, 1]) b.beam([0.47 * s, by + 0.2 * s, 0.05 * z * s], [0.48 * s, by + 0.3 * s, 0.16 * z * s], 0.03, 0.03, P.cream);
  });
}

/**
 * A pen of woven wattle hurdles, w × d, centred on `at`, with a gap (gate) on the +Z side. The
 * hurdles are low panels between stakes, as the Gauls used for sheep and pigs.
 */
export function hurdlePen(b: Builder, w: number, d: number, at: Vec3, rotY = 0, gate = 1.4): void {
  b.group({ at, rotY }, () => {
    const h = 0.95;
    const side = (len: number, x: number, z: number, along: 'x' | 'z') => {
      if (len < 0.1) return;
      const n = Math.max(1, Math.round(len / 1.6));
      for (let i = 0; i < n; i++) {
        const c = -len / 2 + ((i + 0.5) * len) / n;
        const px = along === 'x' ? x + c : x;
        const pz = along === 'z' ? z + c : z;
        b.box(along === 'x' ? len / n - 0.06 : 0.08, h, along === 'x' ? 0.08 : len / n - 0.06, P.wattle, { at: [px, 0.05, pz] });
      }
      for (let i = 0; i <= n; i++) {
        const c = -len / 2 + (i * len) / n;
        b.box(0.08, h + 0.25, 0.08, P.oakDark, { at: [along === 'x' ? x + c : x, 0, along === 'z' ? z + c : z] });
      }
    };
    side(w, 0, -d / 2, 'x');
    side(d, -w / 2, 0, 'z');
    side(d, w / 2, 0, 'z');
    const half = (w - gate) / 2;
    side(half, -(gate / 2 + half / 2), d / 2, 'x');
    side(half, gate / 2 + half / 2, d / 2, 'x');
  });
}

/**
 * Lines of tile or slate courses on a sloping roof plane: `n` thin strips across the slope between
 * the eaves line (y0, z0) and the ridge line (y1, z1), `w` long along X. For a slope facing ±X wrap
 * the call in a group with rotY.
 */
export function courses(b: Builder, w: number, y0: number, z0: number, y1: number, z1: number, n: number, color: number, x = 0): void {
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const y = y0 + (y1 - y0) * t + 0.03;
    const z = z0 + (z1 - z0) * t;
    b.box(w, 0.04, 0.09, color, { at: [x, y, z], jitter: false });
  }
}

/** A cast-iron column: a base, a slender shaft and a flared capital. */
export function ironColumn(b: Builder, h: number, at: Vec3, r = 0.13, color: number = P.castIron): void {
  b.cyl(r * 1.8, 0.35, color, { at, segs: 8 });
  b.cyl(r, h - 0.75, color, { at: [at[0], at[1] + 0.35, at[2]], segs: 8, rTop: r * 0.9 });
  b.cyl(r * 0.9, 0.4, color, { at: [at[0], at[1] + h - 0.4, at[2]], segs: 8, rTop: r * 2.0 });
}

/** A run of iron railing: a top rail, a bottom rail and balusters, from p0 to p1 at height h. */
export function railing(b: Builder, p0: Vec3, p1: Vec3, h: number, color: number = P.castIron, gap = 0.3): void {
  b.beam([p0[0], p0[1] + h, p0[2]], [p1[0], p1[1] + h, p1[2]], 0.06, 0.06, color);
  b.beam([p0[0], p0[1] + 0.1, p0[2]], [p1[0], p1[1] + 0.1, p1[2]], 0.04, 0.04, color);
  const len = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
  const n = Math.max(1, Math.round(len / gap));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    b.box(0.025, h, 0.025, color, { at: [x, y, z], jitter: false });
  }
}

/** A row of tall shutters-and-window bays on a wall, for the plainer faces of town buildings. */
export function windowRow(b: Builder, xs: number[], y: number, w: number, h: number, facing: Facing, z: number, frame: number, shutter?: number, alongZ = false): void {
  for (const c of xs) {
    const at: Vec3 = alongZ ? [z, y, c] : [c, y, z];
    b.window(w, h, { at, facing, frame, bars: [2, 3] });
    if (shutter !== undefined) {
      for (const s of [-1, 1]) {
        const off = s * (w / 2 + w * 0.27);
        b.panel(w * 0.5, h, shutter, { at: alongZ ? [z, y, c + off * (facing === '+x' ? -1 : 1)] : [c + off, y, z], facing, depth: 0.05 });
      }
    }
  }
}
