import { P, mix, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';
import * as THREE from 'three';

// Local helpers for the market lineage.

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
 * The travertine paving of the Roman forum, laid with the forum shops and kept by the macellum and by
 * the medieval market held in its ruins. Draw it first in `build`, before any other random number,
 * so its flags fall in the same places in every stage.
 */
export function forumPaving(b: Builder): void {
  paving(b, 25.6, 21.6, P.travertine, 0.12, [0, 0, 0], 12);
}

/**
 * The paving the commune laid on the market square, kept when the Renaissance loggia replaced the
 * grain loggia. Draw it first in `build`.
 */
export function squarePaving(b: Builder): void {
  paving(b, 25.6, 21.6, tint(P.pietraForte, -0.04), 0.1, [0, 0, 0], 12);
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

const FACE: Record<string, number> = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 };
/** Facing as an angle. */
export const faceAngle = (f: Facing): number => (typeof f === 'number' ? f : FACE[f]);

/** Outline of an opening w wide and h tall (to the apex), as few points as will read: 'round' or 'pointed' head. */
export function archOutline(w: number, h: number, shape: 'round' | 'pointed' | 'rect', n = 4): [number, number][] {
  const a = w / 2;
  if (shape === 'rect') return [[-a, 0], [a, 0], [a, h], [-a, h]];
  if (shape === 'round') {
    const hs = Math.max(0, h - a);
    const pts: [number, number][] = [[-a, 0], [a, 0]];
    for (let i = 0; i <= 2 * n; i++) {
      const t = (i / (2 * n)) * Math.PI;
      pts.push([Math.cos(t) * a, hs + Math.sin(t) * a]);
    }
    return pts;
  }
  // pointed: two arcs of radius w (equilateral), springing at h - rise
  const rise = Math.min(h * 0.6, w * 0.866);
  const hs = h - rise;
  const R = (a * a + rise * rise) / (2 * a);
  const pts: [number, number][] = [[-a, 0], [a, 0]];
  const phi = Math.atan2(rise, R - a);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * phi;
    pts.push([a - R + R * Math.cos(t), hs + R * Math.sin(t)]);
  }
  for (let i = n - 1; i >= 0; i--) {
    const t = (i / n) * phi;
    pts.push([-(a - R + R * Math.cos(t)), hs + R * Math.sin(t)]);
  }
  return pts;
}

/** A cheap low-poly arched panel on a wall: like b.panel but with few facets. `at` is its bottom centre on the wall. */
export function archPanel(b: Builder, w: number, h: number, color: number, at: Vec3, facing: Facing, shape: 'round' | 'pointed' | 'rect' = 'round', depth = 0.06, mat?: 'glass', n = 3): void {
  b.group({ at, rotY: faceAngle(facing) }, () => {
    b.extrude(archOutline(w, h, shape, n), depth, color, { at: [0, 0, depth / 2], jitter: false, mat });
  });
}

/**
 * Rows of coppi on all four faces of a hipped roof made with b.hip(w, d, h, …, { at, overhang }).
 * `n` is the spacing of the rows in metres. Only works for w >= d (ridge along X).
 */
export function hipRibs(b: Builder, w: number, d: number, h: number, at: Vec3, overhang: number, color: number, n = 0.6): void {
  const L = w + 2 * overhang;
  const S = d + 2 * overhang;
  const drop = overhang > 0 ? (overhang * h) / (S / 2) : 0;
  const y0 = at[1] - drop + 0.04;
  const r = (L - S) / 2;
  const hl = S / 2;
  // front and back faces
  for (let x = -L / 2 + n / 2; x < L / 2; x += n) {
    const zTop = Math.abs(x) <= r ? 0 : ((Math.abs(x) - r) / (L / 2 - r)) * hl;
    if (hl - zTop < 0.4) continue;
    const yTop = y0 + h * (1 - zTop / hl);
    for (const s of [-1, 1]) b.beam([at[0] + x, y0 + 0.05, at[2] + s * hl], [at[0] + x, yTop + 0.03, at[2] + s * zTop], 0.12, 0.08, color);
  }
  // the hipped ends
  for (let z = -hl + n / 2; z < hl; z += n) {
    const xTop = r + (Math.abs(z) / hl) * (L / 2 - r);
    if (L / 2 - xTop < 0.4) continue;
    const yTop = y0 + h * (1 - (xTop - r) / (L / 2 - r));
    for (const s of [-1, 1]) b.beam([at[0] + s * L / 2, y0 + 0.05, at[2] + z], [at[0] + s * xTop, yTop + 0.03, at[2] + z], 0.12, 0.08, color);
  }
}

// ---------------------------------------------------------------- the concrete market of 1936

/* Shared by `rationalist-market` (as built) and `food-hall` (the same hall restored in 2014), so
   the two can never drift apart. Front faces +Z; the hall is SPAN across X and LEN along Z. */
export const SPAN = 20; // across X
export const LEN = 18; // along Z
export const HP = 11; // rise of the parabola
const half = SPAN / 2;
export const par = (x: number, off = 0) => HP * (1 - (x / half) ** 2) + off;
/** x where the parabola reaches height y. */
export const xAt = (y: number) => half * Math.sqrt(Math.max(0, 1 - y / HP));

/** A strip of the parabolic shell between x0 and x1 (x0 < x1), `t` thick, extruded along Z for `len`. */
function shellStrip(b: Builder, x0: number, x1: number, t: number, len: number, color: number, z = 0, mat?: 'glass'): void {
  const n = Math.max(2, Math.ceil((x1 - x0) / 1.0));
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    outer.push([x, par(x, t)]);
    inner.push([x, par(x)]);
  }
  b.extrude([...outer, ...inner.reverse()], len, color, { at: [0, 0, z], mat });
}

/** An exposed parabolic rib standing out from the shell. */
function rib(b: Builder, z: number, color: number): void {
  const n = 16;
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = -half - 0.25 + ((SPAN + 0.5) * i) / n;
    const xx = Math.max(-half, Math.min(half, x));
    outer.push([x, Math.max(0, par(xx, 0.7))]);
    inner.push([xx, Math.max(0, par(xx, 0.05))]);
  }
  b.extrude([...outer, ...inner.reverse()], 0.45, color, { at: [0, 0, z] });
}

/** A parabolic end wall of glass block with a grid of mortar joints. Local frame: wall face at z = 0, facing +z. */
function glassBlockEnd(b: Builder, z: number, facingSign: 1 | -1, block: number, frame: number, doorW: number, doorH: number): void {
  const d = doorW / 2;
  const pts: [number, number][] = [[-half, 0], [-d, 0], [-d, doorH], [d, doorH], [d, 0], [half, 0]];
  for (let i = 15; i >= 1; i--) {
    const x = -half + (SPAN * i) / 16;
    pts.push([x, par(x)]);
  }
  b.extrude(pts, 0.2, block, { at: [0, 0, z], mat: 'glass' });
  const zf = z + facingSign * 0.12;
  for (let y = 1.0; y < HP - 0.3; y += 0.9) {
    const w = 2 * xAt(y) - 0.1;
    if (y > doorH) b.box(w, 0.07, 0.06, frame, { at: [0, y, zf], jitter: false });
    else for (const s of [-1, 1]) b.box(w / 2 - d, 0.07, 0.06, frame, { at: [s * (d + w / 2) / 2, y, zf], jitter: false });
  }
  for (let x = -half + 1; x < half; x += 1.0) {
    const h = par(x) - 0.05;
    const y0 = Math.abs(x) < d ? doorH : 0;
    b.box(0.07, h - y0, 0.06, frame, { at: [x, y0, zf], jitter: false });
  }
}


/** Width and height of the clear glazing put into the front end in the restoration. */
export const GW = 10;
export const GH = 7.6;

/**
 * The covered market of 1936: parabolic shell and ribs, glass-block ends, entrances with cantilevered
 * canopies, the travertine clock tower, and colliders for the walls. `restored` gives the hall as it
 * is after 2014: cleaned concrete, clear glazing in the middle of the front, the lettering moved onto
 * the canopy. Fittings inside are left to the caller.
 */
export function concreteMarket(b: Builder, restored: boolean): void {
    const pickedConc = b.pick([P.concreteWhite, tint(P.concrete, 0.06)]);
    const conc = restored ? tint(P.concreteWhite, 0.03) : pickedConc; // cleaned in the restoration
    const block = mix(P.glassGreen, P.white, 0.45);
    const trav = P.travertine;

    // forecourt paving
    b.box(25.6, 0.08, 21.6, P.paving, { jitter: false });
    b.box(SPAN + 1.2, 0.2, LEN + 1.0, tint(trav, -0.05), { at: [0, 0.08, 0] });

    // the shell: concrete at the foot, a band of glass block, concrete above, glazing at the crown
    const t = 0.18;
    const yB = 1.4;
    const yT = 4.6;
    for (const s of [-1, 1]) {
      const a = (x: number) => (s > 0 ? x : -x);
      const seg = (x0: number, x1: number, c: number, mat?: 'glass') => {
        const [p, q] = [a(x0), a(x1)].sort((m, n) => m - n);
        shellStrip(b, p, q, t, LEN, c, 0, mat);
      };
      seg(xAt(yB), half, conc);
      seg(xAt(yT), xAt(yB), block, 'glass');
      seg(2.0, xAt(yT), conc);
    }
    shellStrip(b, -2.0, 2.0, t, LEN, P.glass, 0, 'glass');
    // ribs over the shell, every three metres
    for (let z = -LEN / 2 + 0.25; z <= LEN / 2; z += 2.9) rib(b, z, conc);
    // a raised edge to the skylight
    for (const s of [-1, 1]) b.box(0.15, 0.35, LEN, conc, { at: [s * 2.0, par(2.0, t) - 0.05, 0] });

    // the two glass-block ends
    if (restored) {
      // the middle of the front glass block replaced by clear glazing in a slender steel grid
      glassBlockEnd(b, LEN / 2 - 0.1, 1, block, conc, GW, GH);
      const zg = LEN / 2 - 0.1;
      b.box(GW, 0.12, 0.16, P.steel, { at: [0, GH - 0.12, zg] });
      for (const y of [3.9, 5.8]) for (const sx of [-1, 1]) b.box(GW / 2 - 2.4, 0.07, 0.1, P.steel, { at: [sx * (GW / 4 + 1.2), y, zg] });
      b.box(4.8, 0.07, 0.1, P.steel, { at: [0, 5.8, zg] });
      for (const x of [-4.95, -3.6, -2.4, 2.4, 3.6, 4.95]) b.box(0.08, GH, 0.1, P.steel, { at: [x, 0.08, zg] });
      for (const x of [-1.2, 0, 1.2]) b.box(0.08, GH - 3.9, 0.1, P.steel, { at: [x, 3.9, zg] });
    } else glassBlockEnd(b, LEN / 2 - 0.1, 1, block, conc, 4.4, 3.9);
    glassBlockEnd(b, -LEN / 2 + 0.1, -1, block, conc, 3.2, 3.9);
    for (const s of [-1, 1] as const) {
      const ze = s * (LEN / 2 + 0.05);
      const facing = s > 0 ? '+z' : '-z';
      // a concrete frame round the entrance, glazed doors in steel
      const dw = s > 0 ? 4.4 : 3.2;
      for (const sx of [-1, 1]) b.box(0.4, 3.9, 0.45, conc, { at: [sx * (dw / 2 + 0.2), 0.28, ze] });
      // steel-framed glazed doors folded back to the jambs, a fanlight over them
      for (const sx of [-1, 1]) b.box(0.9, 2.9, 0.06, P.glassDark, { at: [sx * (dw / 2 - 0.1), 0.28, ze + s * 0.5], rotY: sx * s * 1.3, mat: 'glass' });
      b.box(dw, 0.9, 0.08, P.glassDark, { at: [0, 3.1, ze], mat: 'glass' });
      for (const x of [-dw / 4, 0, dw / 4]) b.box(0.06, 0.9, 0.12, P.steel, { at: [x, 3.1, ze] });
      // the cantilevered canopy
      b.box(dw + 2.6, 0.22, 1.8, conc, { at: [0, 4.0, ze + s * 0.9] });
      // name over the door: travertine panel with letters
      if (s > 0) {
        if (restored) {
          // the old bronze letters, cleaned and remounted standing on the canopy so the new glazing is clear
          for (let k = 0; k < 7; k++) b.box(0.5, 0.6, 0.08, P.bronze, { at: [-2.4 + k * 0.8, 4.22, ze + 1.6] });
        } else {
          b.box(8.0, 1.1, 0.12, trav, { at: [0, 4.6, ze + 0.12] });
          for (let k = 0; k < 7; k++) b.box(0.5, 0.6, 0.08, P.bronze, { at: [-2.4 + k * 0.8, 4.85, ze + 0.2] });
        }
        b.collider(SPAN / 2 - 2.6, 0.6, { at: [-(SPAN / 2 + 2.6) / 2 - 0.3, 0, ze] });
        b.collider(SPAN / 2 - 2.6, 0.6, { at: [(SPAN / 2 + 2.6) / 2 + 0.3, 0, ze] });
      } else b.collider(SPAN, 0.6, { at: [0, 0, ze] });
    }
    for (const s of [-1, 1]) b.collider(1.6, LEN, { at: [s * (half - 0.8), 0, 0] });

    // the clock tower at the front corner
    b.group({ at: [11.6, 0.08, 8.2] }, () => {
      b.box(1.9, 14.0, 1.9, trav);
      for (let y = 1.2; y < 13; y += 1.2) b.box(1.94, 0.03, 1.94, tint(trav, -0.06), { at: [0, y, 0], jitter: false });
      b.box(2.2, 0.3, 2.2, trav, { at: [0, 14.0, 0] });
      for (const [f, dx, dz] of [
        ['+z', 0, 0.95],
        ['-x', -0.95, 0],
      ] as ['+z' | '-x', number, number][]) {
        b.panel(1.5, 1.5, P.white, { at: [dx, 11.5, dz], facing: f, shape: 'circle', depth: 0.06 });
        b.panel(0.08, 0.6, P.black, { at: [dx * 1.04, 12.25, dz * 1.04], facing: f, depth: 0.08 });
        b.panel(0.45, 0.08, P.black, { at: [dx * 1.04 + (f === '+z' ? 0.2 : 0), 12.25, dz * 1.04 + (f === '-x' ? 0.2 : 0)], facing: f, depth: 0.08 });
      }
      b.cyl(0.04, 3.0, P.steel, { at: [0, 14.3, 0], segs: 4 }); // flagpole
      b.panel(0.6, 4.2, P.glassDark, { at: [0, 3.0, 0.95], facing: '+z', depth: 0.04 }); // stair slit
    });
    b.collider(1.9, 1.9, { at: [11.6, 0, 8.2] });

}

/** The concrete stall counters of 1936 with their marble tops, in two rows down the side aisles (kept in the restoration). */
export const COUNTERS: [number, number][] = [-5.5, 5.5].flatMap((x) => [-5, 0, 5].map((z) => [x, z] as [number, number]));
export function marketCounter(b: Builder, x: number, z: number): void {
  b.box(3.6, 0.85, 1.1, P.concrete, { at: [x, 0.28, z], rotY: Math.PI / 2 });
  b.box(1.2, 0.05, 3.7, P.marble, { at: [x, 1.13, z] });
  b.collider(1.1, 3.6, { at: [x, 0, z] });
}

/** The cast-iron lamp standard in the forecourt. */
export function forecourtLamp(b: Builder): void {
  b.cyl(0.07, 4.2, P.castIron, { at: [-11.6, 0.08, 9.6], segs: 5 });
  b.box(0.6, 0.12, 0.3, P.castIron, { at: [-11.4, 4.2, 9.6] });
}
