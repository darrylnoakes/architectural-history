import * as THREE from 'three';
import { P, facingAngle, spread, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** A flat ground surface (yard, pavement, terrace) w × d, a few centimetres thick, centred on [x, z]. */
export function ground(b: Builder, w: number, d: number, color: number, at: [number, number], h = 0.04): void {
  b.box(w, h, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** A straight round pole between two points. */
export function pole(b: Builder, a: Vec3, c: Vec3, r: number, color: number, segs = 5): void {
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

/** A wooden barrel standing on end. */
export function barrel(b: Builder, at: Vec3, color: number = P.oak): void {
  b.lathe([[0.0, 0], [0.26, 0], [0.32, 0.4], [0.26, 0.8], [0.0, 0.8]], color, { at, segs: 7 });
  b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.18, at[2]], segs: 7 });
  b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.58, at[2]], segs: 7 });
}

/**
 * A Roman wine amphora of the Dressel 1 kind: a tall cylindrical body, a sharp shoulder, a long neck
 * with two straight handles and a solid spike at the foot. `tilt` leans it (radians about X).
 */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta, tilt = 0, rotY = 0): void {
  b.group({ at, rotY, rot: [tilt, 0, 0] }, () => {
    b.lathe(
      [[0.0, 0], [0.03, 0], [0.04, 0.18], [0.14, 0.4], [0.16, 0.7], [0.15, 0.82], [0.06, 0.88], [0.05, 1.2], [0.075, 1.24], [0.0, 1.25]],
      color,
      { segs: 6 },
    );
    b.sym((s) => b.box(0.03, 0.32, 0.04, color, { at: [s * 0.1, 0.86, 0] }));
  });
}

/** A low wooden table with a pair of benches; `rotY` turns it. */
export function tableBenches(b: Builder, at: Vec3, rotY = 0, color: number = P.oak, len = 1.8): void {
  b.group({ at, rotY }, () => {
    b.box(len, 0.06, 0.7, color, { at: [0, 0.72, 0] });
    b.sym((s) => b.box(0.08, 0.72, 0.55, tint(color, -0.08), { at: [s * (len / 2 - 0.15), 0, 0] }));
    b.sym((s) => {
      b.box(len, 0.05, 0.26, color, { at: [0, 0.42, s * 0.6] });
      b.sym((t) => b.box(0.06, 0.42, 0.22, tint(color, -0.08), { at: [t * (len / 2 - 0.15), 0, s * 0.6] }));
    });
  });
}

/** A small round café table with chairs (bentwood in spirit). */
export function cafeTable(b: Builder, at: Vec3, top: number, frame: number, chairs = 2, rot = 0): void {
  b.group({ at, rotY: rot }, () => {
    b.cyl(0.34, 0.04, top, { at: [0, 0.72, 0], segs: 8 });
    b.cyl(0.03, 0.72, frame, { segs: 4 });
    for (let i = 0; i < chairs; i++) {
      const a = (i / chairs) * Math.PI * 2 + Math.PI / 2;
      b.group({ at: [Math.sin(a) * 0.62, 0, Math.cos(a) * 0.62], rotY: a }, () => {
        b.box(0.4, 0.44, 0.4, frame, { at: [0, 0, 0], jitter: false });
        b.box(0.4, 0.45, 0.04, frame, { at: [0, 0.44, 0.19], jitter: false });
      });
    }
  });
}

/** A horse standing, facing local +Z. */
export function horse(b: Builder, at: Vec3, rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    b.box(0.5, 0.65, 1.5, color, { at: [0, 0.85, 0] });
    for (const [x, z] of [[-0.17, 0.6], [0.17, 0.6], [-0.17, -0.6], [0.17, -0.6]] as const) b.box(0.12, 0.88, 0.12, tint(color, -0.08), { at: [x, 0, z] });
    b.box(0.26, 0.8, 0.32, color, { at: [0, 1.3, 0.75], rot: [0.5, 0, 0] });
    b.box(0.22, 0.24, 0.6, color, { at: [0, 1.75, 1.05], rot: [0.3, 0, 0] });
    b.box(0.08, 0.6, 0.1, tint(color, -0.25), { at: [0, 0.75, -0.8], rot: [-0.3, 0, 0] });
  });
}

/** A two-wheeled cart with shafts, facing local +Z. */
export function cart(b: Builder, at: Vec3, rotY: number, wood: number = P.oak): void {
  b.group({ at, rotY }, () => {
    b.box(1.4, 0.12, 2.2, wood, { at: [0, 0.75, 0] });
    b.sym((s) => b.box(0.08, 0.4, 2.2, tint(wood, -0.06), { at: [s * 0.68, 0.87, 0] }));
    b.box(1.4, 0.4, 0.08, tint(wood, -0.06), { at: [0, 0.87, -1.08] });
    b.sym((s) => {
      b.log(0.62, 0.08, P.oakDark, { at: [s * 0.82, 0, 0], segs: 10 });
      b.beam([s * 0.45, 0.8, 1.0], [s * 0.4, 0.35, 2.8], 0.08, 0.08, wood);
    });
  });
}

/**
 * Block letters on a grid, one cell = `cell` metres, five cells tall. Letters are drawn as merged runs
 * of filled cells, so a word costs a few dozen triangles. `at` is the bottom centre of the word on the
 * wall surface; `facing` the way the wall faces.
 */
const GLYPHS: Record<string, string[]> = {
  A: ['111', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '111'],
  K: ['101', '110', '100', '110', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['1001', '1101', '1011', '1001', '1001'],
  O: ['111', '101', '101', '101', '111'],
  P: ['111', '101', '111', '100', '100'],
  Q: ['111', '101', '101', '111', '001'],
  R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '011', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  '-': ['000', '000', '111', '000', '000'],
  '.': ['0', '0', '0', '0', '1'],
  "'": ['1', '1', '0', '0', '0'],
  ' ': ['00', '00', '00', '00', '00'],
};

export function wordWidth(text: string, cell: number): number {
  let w = 0;
  for (const ch of text.toUpperCase()) w += ((GLYPHS[ch] ?? GLYPHS[' '])[0].length + 1) * cell;
  return w - cell;
}

export function word(
  b: Builder,
  text: string,
  cell: number,
  color: number,
  o: { at: Vec3; facing: Facing; depth?: number; mat?: 'glass' | 'matte' },
): void {
  const total = wordWidth(text, cell);
  const dp = o.depth ?? 0.05;
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    let x0 = -total / 2;
    for (const ch of text.toUpperCase()) {
      const g = GLYPHS[ch] ?? GLYPHS[' '];
      g.forEach((row, r) => {
        let c = 0;
        while (c < row.length) {
          if (row[c] !== '1') {
            c++;
            continue;
          }
          let e = c;
          while (e + 1 < row.length && row[e + 1] === '1') e++;
          const wbar = (e - c + 1) * cell;
          b.box(wbar, cell, dp, color, { at: [x0 + c * cell + wbar / 2, (4 - r) * cell, dp / 2], jitter: false, mat: o.mat });
          c = e + 1;
        }
      });
      x0 += (g[0].length + 1) * cell;
    }
  });
}

/**
 * A pattern of glazed lozenges laid over one or both slopes of a gable roof made with the same
 * arguments (`b.gable(w, d, rise, …, { at, overhang, thick })`, ridge along X). Each lozenge is a flat
 * quad of two triangles lying just proud of the roof surface; `colors` are cycled in diagonal chains.
 * `slopes` picks which slopes get the pattern: +1 is the +Z slope, -1 the -Z slope.
 */
export function lozengeRoof(
  b: Builder,
  w: number,
  d: number,
  rise: number,
  colors: number[],
  o: { at: Vec3; overhang?: number; thick?: number; slopes?: (1 | -1)[]; cell?: number; skipX?: [number, number][] },
): void {
  const ov = o.overhang ?? 0;
  const half = d / 2;
  const t = ((o.thick ?? 0.16) * Math.hypot(half, rise)) / half;
  const run = half + ov;
  const len = w + ov * 2;
  const cell = o.cell ?? 0.9;
  const slopeLen = Math.hypot(run, (run * rise) / half);
  const nu = Math.max(1, Math.floor(len / cell));
  const nv = Math.max(1, Math.floor((slopeLen - 0.3) / (cell * 1.2)));
  const cu = len / nu;
  const cv = (slopeLen - 0.3) / nv;
  const ang = Math.atan2(rise, half);
  const per: number[][] = colors.map(() => []);
  for (const s of o.slopes ?? [1, -1]) {
    // a point at u along the ridge and v down the slope from the ridge
    const pt = (u: number, v: number): [number, number, number] => {
      const hz = v * Math.cos(ang);
      return [o.at[0] + u, o.at[1] + rise + t - hz * Math.tan(ang) + 0.025, o.at[2] + s * hz];
    };
    for (let i = 0; i < nu; i++) {
      const u = -len / 2 + (i + 0.5) * cu;
      if (o.skipX?.some(([a, c]) => u > a && u < c)) continue;
      for (let j = 0; j < nv; j++) {
        const v = 0.15 + (j + 0.5) * cv;
        const k = ((i + j) % colors.length + (Math.floor(j / 2) % 2)) % colors.length;
        const A = pt(u - cu * 0.5, v);
        const B = pt(u, v - cv * 0.5);
        const C = pt(u + cu * 0.5, v);
        const D = pt(u, v + cv * 0.5);
        per[k].push(...A, ...B, ...C, ...A, ...C, ...D);
      }
    }
  }
  per.forEach((pos, k) => {
    if (!pos.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.computeVertexNormals();
    b.add(g, colors[k], { jitter: false });
  });
}

/**
 * A gabled dormer standing on a roof slope that faces `facing`. `at` is the bottom centre of its front
 * face (where it rises from the slope); it reaches `back` metres into the roof.
 */
export function dormer(
  b: Builder,
  w: number,
  h: number,
  roof: number,
  wall: number,
  o: { at: Vec3; facing: Facing; back?: number; rise?: number; frame?: number; glass?: number; bars?: [number, number]; finial?: number },
): void {
  const back = o.back ?? 1.6;
  const rise = o.rise ?? w * 0.6;
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    b.box(w, h, back, wall, { at: [0, 0, -back / 2] });
    b.gable(w, back, rise, roof, { at: [0, h, -back / 2], ridge: 'z', overhang: 0.12, wall, thick: 0.1 });
    b.window(w * 0.6, h * 0.72, { at: [0, h * 0.12, 0], facing: '+z', frame: o.frame ?? P.white, glass: o.glass, bars: o.bars, border: 0.06 });
    if (o.finial !== undefined) {
      b.cyl(0.05, 0.9, o.finial, { at: [0, h + rise, 0.1], segs: 4 });
      b.cone(0.09, 0.35, o.finial, { at: [0, h + rise + 0.9, 0.1], segs: 4 });
    }
  });
}

/**
 * A window with a pair of shutters (volets) folded back against the wall either side. Plank shutters
 * until the eighteenth century; `louvred` gives the later persiennes. `at` is the bottom centre on the wall.
 */
export function shutteredWindow(
  b: Builder,
  w: number,
  h: number,
  o: { at: Vec3; facing: Facing; frame: number; shutter: number; surround?: number; louvred?: boolean; bars?: [number, number]; closed?: boolean },
): void {
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    if (o.surround !== undefined) b.panel(w + 0.3, h + 0.25, o.surround, { at: [0, -0.12, 0], depth: 0.04 });
    if (o.closed) {
      b.panel(w, h, o.shutter, { depth: 0.1 });
      b.panel(0.03, h - 0.1, tint(o.shutter, -0.15), { at: [0, 0.05, 0], depth: 0.12 });
      return;
    }
    b.window(w, h, { frame: o.frame, bars: o.bars ?? [2, 3], border: 0.07 });
    b.sym((s) => {
      b.panel(w / 2, h, o.shutter, { at: [s * (w * 0.75 + 0.2), 0, 0], depth: 0.05 });
      if (o.louvred) b.panel(w / 2 - 0.12, h * 0.8, tint(o.shutter, -0.1), { at: [s * (w * 0.75 + 0.2), h * 0.1, 0], depth: 0.07 });
    });
  });
}

/** A run of plain upright railings: a top rail and bars every `step` metres between two points (same height). */
export function railing(b: Builder, p0: Vec3, p1: Vec3, h: number, color: number, step = 0.5): void {
  const len = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
  b.beam([p0[0], p0[1] + h, p0[2]], [p1[0], p1[1] + h, p1[2]], 0.06, 0.06, color);
  const n = Math.max(2, Math.round(len / step));
  for (const t of spread(n, 0, 1)) {
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    b.box(0.04, h, 0.04, color, { at: [x, p0[1], z], jitter: false });
  }
}

/** A wattle fence or palisade line of posts between two ground points, with a woven band. */
export function fence(b: Builder, p0: [number, number], p1: [number, number], h: number, post: number, weave: number, step = 1.2): void {
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const n = Math.max(2, Math.round(len / step) + 1);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    b.box(0.12, h + 0.1, 0.12, post, { at: [p0[0] + (p1[0] - p0[0]) * t, 0, p0[1] + (p1[1] - p0[1]) * t] });
  }
  const yaw = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  b.box(0.07, h * 0.75, len, weave, { at: [(p0[0] + p1[0]) / 2, 0.1, (p0[1] + p1[1]) / 2], rotY: yaw });
}

// ---------------------------------------------------------------- the inn of 1380, kept in 1690
// The posting inn of 1690 is the medieval inn with its street range rebuilt: these are the parts
// of the hostellerie it keeps, built by the same code in both stages so they stay put in the town.

/** The street pavement in front of the inn, its top 0.1 m above the town's ground. */
export function innPavement(b: Builder): void {
  ground(b, 21.0, 1.6, P.cobble, [0, 10.2], 0.1);
}

/** The stone stable range across the back of the yard, with its hayloft door (1380). */
export const STABLE = { X0: -5.2, X1: 10.2, ZB: -10.2, ZS: -5.6, H: 3.2 };
export function innStables(b: Builder, stone: number, timber: number, tile: number): void {
  const { X0, X1, ZB, ZS, H } = STABLE;
  const w = X1 - X0;
  const x = (X0 + X1) / 2;
  const sd = ZS - ZB;
  const sz = (ZS + ZB) / 2;
  b.box(w, H, sd, stone, { at: [x, 0, sz] });
  for (const dx of [-3.6, -0.6, 2.4, 7.4]) {
    b.panel(1.4, 2.3, timber, { at: [dx, 0, ZS], facing: '+z' });
    b.panel(0.12, 2.3, tint(timber, -0.1), { at: [dx, 0, ZS], facing: '+z', depth: 0.08 });
  }
  for (const dx of spread(5, -4.0, 9.4)) b.panel(0.25, 0.7, P.windowDark, { at: [dx, 1.8, ZB], facing: '-z' });
  b.gable(w, sd, (sd / 2) * 1.15, tile, { at: [x, H, sz], overhang: 0.4, wall: stone });
  b.group({ at: [-2.1, H - 0.05, ZS + 0.05] }, () => {
    b.box(1.6, 1.6, 1.4, stone, { at: [0, 0, -0.7] });
    b.panel(1.1, 1.3, timber, { at: [0, 0.15, 0], facing: '+z' });
    b.gable(1.6, 1.6, 1.2, tile, { at: [0, 1.6, -0.7], ridge: 'z', overhang: 0.15, wall: stone });
    b.box(0.14, 0.14, 1.2, timber, { at: [0, 2.4, 0.3] });
  });
  b.collider(w, sd, { at: [x, 0, sz] });
}

/** The well in the yard: a stone kerb, two posts and a windlass. */
export function innWell(b: Builder, stone: number, timber: number): void {
  const [x, z] = [-3.8, 1.4];
  b.cyl(0.75, 0.9, stone, { at: [x, 0, z], segs: 8 });
  b.cyl(0.6, 0.05, P.windowDark, { at: [x, 0.88, z], segs: 8 });
  b.sym((s) => b.box(0.14, 1.6, 0.14, timber, { at: [x + s * 0.7, 0.9, z] }));
  b.log(0.12, 1.5, timber, { at: [x, 2.3, z], segs: 6 });
  b.collider(1.5, 1.5, { at: [x, 0, z] });
}
