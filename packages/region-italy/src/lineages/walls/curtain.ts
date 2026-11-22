import { P, mix, mulberry32, tint, type Builder } from '@ah/kit';
import {
  HALF,
  archPanel,
  blockWall,
  clipPolyX,
  clipX,
  merlonsX,
  prismX,
  quad,
  run,
  segBox,
  slab,
  soup,
  stakes,
  type XY,
} from './shared';

/*
 * The town wall between the gates, stage by stage. The gate plots build their own wall stubs with
 * `curtain`, so a stretch drawn by the town continues them exactly. Outside (field side) is +Z, town -Z.
 *
 * Joining pieces: stretches that meet at a corner should both run right up to the corner's origin
 * (the point where their reference lines, local z = 0, cross); `corner` covers the overlap. A stretch
 * that ends at the river runs to the terminal's origin.
 *
 * Everything here is pure geometry with fixed colours and no use of the builder's random numbers,
 * so it can be called inside any group, any number of times.
 */

export type WallStage = 'rampart' | 'etruscan' | 'roman' | 'aurelian' | 'communal' | 'bastion';

/** For walk collisions: the z of the wall's centre line and its thickness at ground level, per stage; height of the top of the defences. */
export const CURTAIN: Record<WallStage, { z: number; thick: number; height: number }> = {
  rampart: { z: -3.2, thick: 8.8, height: 4.9 }, // bank toe to toe; crest 3.2 m plus the palisade
  etruscan: { z: 0, thick: 3.7, height: 8.5 }, // footing 3.7, wall 3.2
  roman: { z: 0, thick: 2.9, height: 8.3 },
  aurelian: { z: 0, thick: 3.4, height: 9.3 },
  communal: { z: 0.3, thick: 2.8, height: 12.35 }, // battered foot; the wall itself is 2.2
  bastion: { z: -4.3, thick: 7.4, height: 7.9 }, // scarp foot at -0.6 to the foot of the inner slope at -8
};

/** Fixed colours per stage, shared with the gate plots. */
export const WALL_COLOURS = {
  rampart: { earth: mix(P.earth, P.turf, 0.35), grass: mix(P.turf, P.grassDry, 0.4), timber: mix(P.oak, P.oakSilver, 0.2), stake: mix(P.oak, P.oakSilver, 0.35) },
  etruscan: { stone: mix(P.tufa, P.pietraForte, 0.47) },
  roman: { stone: mix(P.travertine, P.limestone, 0.5), face: mix(P.rubble, P.tufa, 0.35) },
  aurelian: { brick: mix(mix(P.brickRed, P.brickDark, 0.3), P.brickBuff, 0.28) },
  communal: { stone: mix(P.pietraForte, P.rubble, 0.4), dress: tint(P.pietraForte, 0.04) },
  bastion: { brick: mix(P.brickRed, P.brickBuff, 0.25), grass: mix(P.turf, P.grassDry, 0.45), ditch: mix(P.turf, P.hedge, 0.5) },
};

const NJ = { jitter: false } as const;

/** Evenly spaced interior positions for features `spacing` apart on x0..x1 (none if the stretch is short). */
function evenly(x0: number, x1: number, spacing: number, min = spacing * 0.6): number[] {
  const L = x1 - x0;
  if (L < min) return [];
  const n = Math.max(1, Math.round(L / spacing));
  const xs: number[] = [];
  for (let i = 1; i < n; i++) xs.push(x0 + (i * L) / n);
  // a stretch about one spacing long still gets one, in the middle
  if (n === 1 && L >= spacing * 0.75) xs.push((x0 + x1) / 2);
  return xs;
}

/** Ranges of x0..x1 left between features of half-width hw centred at xs. */
function gaps(x0: number, x1: number, xs: number[], hw: number): [number, number][] {
  const res: [number, number][] = [];
  let a = x0;
  for (const x of [...xs].sort((p, q) => p - q)) {
    if (x - hw > a) res.push([a, x - hw]);
    a = Math.max(a, x + hw);
  }
  if (x1 > a) res.push([a, x1]);
  return res;
}

// ================================================================== rampart (c. 750 BC)

export const RAMPART = {
  bank: [[-7.6, 0], [-4.4, 2.6], [-2.2, 3.2], [-0.9, 3.0], [1.2, 0]] as XY[],
  turf: [[-7.65, 0.02], [-4.45, 2.63], [-2.2, 3.23], [-1.2, 3.12]] as XY[],
  ditch: [[1.2, 0.02], [5.2, 0.02]] as XY[],
  counter: [[5.0, 0], [6.0, 0.75], [6.8, 0.7], [7.8, 0]] as XY[],
  palisade: { z: -1.2, y: 3.0, h: 1.7 },
};

function rampartStretch(b: Builder, x0: number, x1: number): void {
  const c = WALL_COLOURS.rampart;
  prismX(b, x0, x1, RAMPART.bank, c.earth);
  prismX(b, x0, x1, RAMPART.turf, c.grass);
  prismX(b, x0, x1, RAMPART.ditch, tint(P.mud, 0.04));
  prismX(b, x0, x1, RAMPART.counter, c.grass);
  if (x1 - x0 > 0.5) b.box(x1 - x0 - 0.4, 0.04, 1.4, tint(P.soil, -0.06), { at: [(x0 + x1) / 2, 0, 3.2], ...NJ });
  stakes(b, x0, x1, RAMPART.palisade.z, RAMPART.palisade.y, RAMPART.palisade.h, c.stake);
  b.box(x1 - x0, 0.14, 0.12, tint(c.stake, -0.08), { at: [(x0 + x1) / 2, 3.9, -1.42], ...NJ });
}

/** The timber-revetted end of the bank at plan x, `s` = +1 if the bank lies to +X of it. */
export function rampartEnd(b: Builder, x: number, s: 1 | -1): void {
  const c = WALL_COLOURS.rampart;
  b.group({ at: [x, 0, 0], rotY: -Math.PI / 2 }, () => b.extrude(RAMPART.bank, 0.14, tint(c.timber, -0.04), NJ));
  for (const z of [-6.4, -4.6, -2.8, -1.2, 0.6]) {
    const yTop = z < -4.4 ? ((z + 7.6) / 3.2) * 2.6 + 0.3 : 3.4;
    b.box(0.26, yTop, 0.26, c.timber, { at: [x - s * 0.1, 0, z], ...NJ });
  }
}

function rampartCorner(b: Builder): void {
  const c = WALL_COLOURS.rampart;
  // the parts of the section outside the reference line, swept round the outer quadrant
  const sweep = (prof: XY[], color: number) => b.lathe(prof, color, { segs: 6, start: 0, sweep: Math.PI / 2, ...NJ });
  sweep([[0.001, 1.71], [1.2, 0]], c.earth);
  sweep([[1.2, 0.02], [5.2, 0.02]], tint(P.mud, 0.04));
  sweep([[5.0, 0], [6.0, 0.75], [6.8, 0.7], [7.8, 0]], c.grass);
  // a timber lookout platform where the two palisades cross
  const t = c.timber;
  const z = RAMPART.palisade.z;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.3, 6.2, 0.3, t, { at: [z + sx * 1.3, 0, z + sz * 1.3], ...NJ });
  b.box(3.1, 0.3, 3.1, tint(t, -0.06), { at: [z, 5.0, z], ...NJ });
  stakes(b, z - 1.5, z + 1.5, z + 1.45, 5.3, 1.0, c.stake);
  b.group({ at: [z + 1.45, 0, z], rotY: Math.PI / 2 }, () => stakes(b, -1.5, 1.5, 0, 5.3, 1.0, c.stake));
  b.pyramid(3.6, 3.6, 1.2, P.thatch, { at: [z, 6.2, z], ...NJ });
}

function rampartTerminal(b: Builder): void {
  rampartEnd(b, 0, -1);
}

// ================================================================== Etruscan (4th to 3rd century BC)

export const ETRUSCAN = { t: 3.2, h: 7.4, parapet: { z: 3.2 / 2 - 0.35, t: 0.7, h: 1.1 } };

function etruscanStretch(b: Builder, x0: number, x1: number, detail: boolean): void {
  const stone = WALL_COLOURS.etruscan.stone;
  const { t, h, parapet } = ETRUSCAN;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  if (detail) {
    // the plot stub: every block its own box, laid out by a private seeded sequence
    const rnd = mulberry32(Math.round(Math.abs(x0) * 100 + 7));
    blockWall(b, x0, x1, 0, t, h, stone, { course: [0.62, 0.9], len: [1.3, 2.4], tone: 0.06, rnd });
    b.group({ at: [0, h, 0] }, () => blockWall(b, x0, x1, parapet.z, parapet.t, parapet.h, stone, { course: [1.1, 1.1], len: [1.4, 2.2], tone: 0.05, rnd }));
  } else {
    // long stretches: one box per course, nudged in and out, with the vertical joints drawn on the faces
    const joints: number[] = [];
    const jc = tint(stone, -0.2);
    let y = 0;
    let row = 0;
    while (y < h - 0.05) {
      const ch = Math.min(h - y, 0.62 + 0.28 * (((row * 37) % 11) / 10));
      b.box(L, ch - 0.03, t + (row % 2 ? 0.05 : -0.03), tint(stone, ((row * 5) % 7) / 70 - 0.04), { at: [xc, y, (row % 3) * 0.02 - 0.02], ...NJ });
      const step = 1.85;
      for (let x = x0 + (row % 2 ? step / 2 : step * 0.15); x < x1 - 0.2; x += step) {
        for (const f of [1, -1]) {
          const z = f * (t / 2 + 0.035);
          quad(joints, [x, y, z], [x + 0.05, y, z], [x + 0.05, y + ch, z], [x, y + ch, z]);
        }
      }
      y += ch;
      row++;
    }
    b.box(L, parapet.h - 0.03, parapet.t, tint(stone, 0.02), { at: [xc, h, parapet.z], ...NJ });
    for (let x = x0 + 0.9; x < x1 - 0.2; x += 1.8) quad(joints, [x, h, parapet.z + 0.36], [x + 0.05, h, parapet.z + 0.36], [x + 0.05, h + 1.07, parapet.z + 0.36], [x, h + 1.07, parapet.z + 0.36]);
    soup(b, joints, jc);
  }
  b.box(L, 0.05, t - 0.8, tint(stone, -0.12), { at: [xc, h, -0.35], ...NJ });
  b.box(L, 0.5, t + 0.5, tint(stone, -0.06), { at: [xc, 0, 0], ...NJ });
}

/** A square tower of big blocks at a corner or the end of the Etruscan wall. */
function etruscanTower(b: Builder): void {
  const stone = WALL_COLOURS.etruscan.stone;
  const w = 6.2;
  const h = 10.2;
  b.box(w + 0.5, 0.5, w + 0.5, tint(stone, -0.06), NJ);
  const joints: number[] = [];
  let y = 0;
  for (let row = 0; y < h - 0.05; row++) {
    const ch = Math.min(h - y, 0.7 + 0.2 * (((row * 37) % 11) / 10));
    b.box(w, ch - 0.03, w, tint(stone, ((row * 5) % 7) / 70 - 0.04), { at: [0, y, 0], ...NJ });
    for (let x = -w / 2 + (row % 2 ? 0.9 : 1.6); x < w / 2 - 0.2; x += 1.8) {
      for (const [ax, az, bx, bz] of [[x, w / 2 + 0.01, x + 0.05, w / 2 + 0.01], [w / 2 + 0.01, -x, w / 2 + 0.01, -x - 0.05], [x + 0.05, -w / 2 - 0.01, x, -w / 2 - 0.01], [-w / 2 - 0.01, x, -w / 2 - 0.01, x + 0.05]] as const) {
        quad(joints, [ax, y, az], [bx, y, bz], [bx, y + ch, bz], [ax, y + ch, az]);
      }
    }
    y += ch;
  }
  soup(b, joints, tint(stone, -0.2));
  // a parapet of blocks round the top
  for (const [sx, sz, ww, dd] of [[0, 1, w, 0.7], [0, -1, w, 0.7], [1, 0, 0.7, w], [-1, 0, 0.7, w]] as const) {
    b.box(ww, 1.1, dd, tint(stone, 0.02), { at: [sx * (w / 2 - 0.35), h, sz * (w / 2 - 0.35)], ...NJ });
  }
  b.box(w - 1.4, 0.05, w - 1.4, tint(stone, -0.12), { at: [0, h, 0], ...NJ });
}

// ================================================================== Roman (Augustan)

export const ROMAN = { t: 2.6, h: 7.2, spacing: 80, tower: { r: 2.4, h: 11.5, z: 0.9 } };

function romanStretch(b: Builder, x0: number, x1: number, towers: boolean): void {
  const { stone, face } = WALL_COLOURS.roman;
  const shade = tint(stone, -0.07);
  const { t, h } = ROMAN;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h, t, face, { at: [xc, 0, 0], ...NJ });
  b.box(L, 0.4, t + 0.3, shade, { at: [xc, 0, 0], ...NJ });
  for (const y of [1.6, 3.2, 4.8]) b.box(L, 0.06, t + 0.04, tint(face, -0.1), { at: [xc, y, 0], ...NJ });
  b.box(L, 0.3, t + 0.2, stone, { at: [xc, h - 0.3, 0], ...NJ });
  const xs = towers ? evenly(x0, x1, ROMAN.spacing) : [];
  for (const [a, c] of gaps(x0, x1, xs, ROMAN.tower.r)) merlonsX(b, a, c, h, t / 2 - 0.25, stone, { w: 0.9, h: 1.1, t: 0.5, gap: 0.8 });
  for (const x of xs) romanTower(b, x, ROMAN.tower.z, ROMAN.tower.r, ROMAN.tower.h);
}

/** A sixteen-sided Roman tower with a tiled conical roof. */
export function romanTower(b: Builder, x: number, z: number, r: number, h: number): void {
  const { stone } = WALL_COLOURS.roman;
  const shade = tint(stone, -0.07);
  const segs = 16;
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r + 0.25, 0.6, shade, { segs, ...NJ });
    b.cyl(r, h, stone, { segs, ...NJ });
    b.cyl(r + 0.03, 0.06, shade, { at: [0, 5.4, 0], segs, ...NJ });
    b.cyl(r + 0.2, 0.35, tint(stone, 0.04), { at: [0, h - 0.35, 0], segs, ...NJ });
    b.cone(r + 0.5, 1.8, P.coppi, { at: [0, h, 0], segs, ...NJ });
    for (const a of [-0.9, 0, 0.9]) {
      const at = (y: number): [number, number, number] => [Math.sin(a) * (r - 0.02), y, Math.cos(a) * (r - 0.02)];
      archPanel(b, 0.7, 1.5, P.windowDark, { at: at(h - 3.2), facing: a, depth: 0.08 });
      b.panel(0.16, 1.0, P.black, { at: at(3.4), facing: a, depth: 0.06 });
    }
  });
}

// ================================================================== Aurelian (late 3rd century AD)

export const AURELIAN = { t: 3.4, h: 8.0, spacing: 29.6, tower: { w: 3.6, h: 11.2, out: 3.0 } };

function aurelianStretch(b: Builder, x0: number, x1: number, towers: boolean, detail: boolean): void {
  const { brick } = WALL_COLOURS.aurelian;
  const band = tint(brick, -0.08);
  const { t, h } = AURELIAN;
  const WF = t / 2;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h, t, brick, { at: [xc, 0, 0], ...NJ });
  // levelling courses where the gangs stopped, and putlog holes for their scaffolding
  for (const y of [1.9, 3.9, 5.9]) b.box(L, 0.08, t + 0.04, band, { at: [xc, y, 0], ...NJ });
  if (detail) {
    for (let x = x0 + 1; x < x1; x += 1.6) for (const y of [2.5, 4.5]) b.panel(0.18, 0.18, P.black, { at: [x, y, WF], depth: 0.02 });
  } else {
    const holes: number[] = [];
    for (let x = x0 + 1; x < x1; x += 1.6) for (const y of [2.5, 4.5]) quad(holes, [x - 0.09, y, WF + 0.02], [x + 0.09, y, WF + 0.02], [x + 0.09, y + 0.18, WF + 0.02], [x - 0.09, y + 0.18, WF + 0.02]);
    soup(b, holes, P.black);
  }
  // parapet with merlons on the outer edge and a low wall on the inner edge
  b.box(L, 0.25, t + 0.15, tint(brick, 0.03), { at: [xc, h - 0.25, 0], ...NJ });
  merlonsX(b, x0, x1, h, WF - 0.3, brick, { w: 0.85, h: 1.3, t: 0.6, gap: 0.75 });
  b.box(L, 0.4, 0.35, brick, { at: [xc, h, -WF + 0.18], ...NJ });
  if (towers) for (const x of evenly(x0, x1, AURELIAN.spacing)) aurelianTower(b, x, 1);
}

/**
 * The square interval tower of the Aurelian wall: a chamber with arched windows for ballistas, battlements
 * on top. `s` says which way the side window faces (+1: toward -X).
 */
export function aurelianTower(b: Builder, x: number, s: 1 | -1, o?: { w?: number; out?: number; h?: number }): void {
  const { brick } = WALL_COLOURS.aurelian;
  const band = tint(brick, -0.08);
  const WF = AURELIAN.t / 2;
  const w = o?.w ?? AURELIAN.tower.w;
  const out = o?.out ?? AURELIAN.tower.out;
  const h = o?.h ?? AURELIAN.tower.h;
  b.group({ at: [x, 0, 0] }, () => {
    const d = AURELIAN.t + out;
    const zc = -WF + d / 2;
    b.box(w, h, d, brick, { at: [0, 0, zc], ...NJ });
    for (const y of [1.9, 3.9, 5.9]) b.box(w + 0.04, 0.08, d + 0.04, band, { at: [0, y, zc], ...NJ });
    b.crenel(w, d, brick, { at: [0, h, zc], merlonW: 0.8, merlonH: 1.1, t: 0.5 });
    b.box(w, 0.5, d, brick, { at: [0, h - 0.5, zc], ...NJ });
    const zf = WF + out;
    for (const xx of [-0.75, 0.75]) {
      archPanel(b, 1.0, 1.7, P.travertine, { at: [xx, h - 4.2, zf], depth: 0.04 });
      archPanel(b, 0.8, 1.55, P.windowDark, { at: [xx, h - 4.15, zf], depth: 0.07 });
    }
    archPanel(b, 0.8, 1.55, P.windowDark, { at: [-s * w / 2, h - 4.15, WF + out / 2], facing: s > 0 ? '-x' : '+x', depth: 0.07 });
    b.panel(0.18, 1.1, P.black, { at: [0, 3.2, zf], depth: 0.04 });
    b.panel(0.9, 1.9, P.oakDark, { at: [-s * 0.6, AURELIAN.h, -WF], facing: '-z', shape: 'round' });
  });
}

// ================================================================== communal (12th to 14th century)

export const COMMUNAL = { t: 2.2, h: 10.5, spacing: 115, tower: { w: 6.6, out: 3.6, h: 17.5 } };

function communalStretch(b: Builder, x0: number, x1: number, towers: boolean): void {
  const { stone, dress } = WALL_COLOURS.communal;
  const shade = tint(stone, -0.1);
  const { t, h } = COMMUNAL;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h, t, stone, { at: [xc, 0, 0], ...NJ });
  b.box(L, 1.2, t + 0.6, shade, { at: [xc, 0, 0.3], ...NJ }); // battered foot
  for (const y of [3.2, 6.4]) b.box(L, 0.07, t + 0.04, tint(stone, -0.14), { at: [xc, y, 0], ...NJ });
  const xs = towers ? evenly(x0, x1, COMMUNAL.spacing) : [];
  for (const [a, c] of gaps(x0, x1, xs, COMMUNAL.tower.w / 2)) {
    // the wall-walk carried out on corbels, with square (Guelph) merlons
    for (let x = a + 0.5; x < c; x += 1.1) b.box(0.35, 0.6, 0.6, dress, { at: [x, h - 0.6, t / 2 + 0.25], ...NJ });
    b.box(c - a, 0.35, 0.6, dress, { at: [(a + c) / 2, h, t / 2 + 0.25], ...NJ });
    merlonsX(b, a, c, h + 0.35, t / 2 + 0.2, stone, { w: 1.0, h: 1.5, t: 0.5, gap: 0.8 });
  }
  b.box(L, 0.08, t + 0.3, tint(stone, -0.2), { at: [xc, h, 0.2], ...NJ });
  for (const x of xs) communalTower(b, x, { open: true });
}

/**
 * A square tower of the communal wall, standing out from the wall face. Interval towers are open on
 * the town side, so an enemy who took one had no cover from the defenders inside.
 */
export function communalTower(b: Builder, x: number, o: { open: boolean; w?: number; out?: number; h?: number; back?: number }): void {
  const { stone, dress } = WALL_COLOURS.communal;
  const w = o.w ?? COMMUNAL.tower.w;
  const h = o.h ?? COMMUNAL.tower.h;
  const zf = COMMUNAL.t / 2 + (o.out ?? COMMUNAL.tower.out);
  const zb = o.back ?? -COMMUNAL.t / 2;
  const d = zf - zb;
  const zc = (zf + zb) / 2;
  const wall = 1.1;
  b.group({ at: [x, 0, 0] }, () => {
    if (o.open) {
      b.box(w, h, wall, stone, { at: [0, 0, zf - wall / 2], ...NJ });
      for (const s of [1, -1]) b.box(wall, h, d, stone, { at: [s * (w / 2 - wall / 2), 0, zc], ...NJ });
      // timber floors seen through the open back
      for (const y of [COMMUNAL.h, 13.8]) b.box(w - wall * 2, 0.22, d - wall, mix(P.oak, P.oakDark, 0.3), { at: [0, y, zc - wall / 2], ...NJ });
    } else {
      b.box(w, h, d, stone, { at: [0, 0, zc], ...NJ });
    }
    b.box(w + 0.5, 1.2, d + 0.3, tint(stone, -0.1), { at: [0, 0, zc + 0.15], ...NJ });
    // corbelled parapet round the top, square merlons
    b.box(w + 0.7, 0.45, d + 0.35, dress, { at: [0, h - 0.6, zc + 0.17], ...NJ });
    b.box(w + 0.7, 1.0, d + 0.35, stone, { at: [0, h - 0.15, zc + 0.17], ...NJ });
    for (let i = 0; i < 4; i++) b.box(0.9, 1.3, 0.45, stone, { at: [-w / 2 + (i + 0.5) * (w / 4), h + 0.85, zf + 0.25], ...NJ });
    for (const s of [1, -1]) for (let i = 0; i < 3; i++) b.box(0.45, 1.3, 0.9, stone, { at: [s * (w / 2 + 0.12), h + 0.85, zb + (i + 0.5) * (d / 3)], ...NJ });
    for (const y of [6.0, 11.5]) archPanel(b, 0.6, 1.4, P.windowDark, { at: [0, y, zf], depth: 0.06 });
  });
}

// ================================================================== bastioned (16th century)

/**
 * The bastioned trace. Bastions are centred at x = c with flanks at c ± G (running out from the scarp
 * foot at z = CF to the shoulders at z = SH) and faces meeting at the salient (c, SH + K·G). The gate
 * plot's two bastions sit at x = ±PLOT_C, so their inner flanks are at ±8.6 and the faces leave the plot
 * at (±15, 7.2).
 */
export const BASTION = {
  CF: -0.6,
  SH: 3.4,
  G: 13,
  K: 3.8 / 6.4,
  PLOT_C: 8.6 + 13,
  spacing: 105,
  top: 6.2, // the terreplein behind the parapet
  cs: 7.6, // the counterscarp wall
  section: [[0, 0], [1.0, 6.0], [1.05, 7.3], [1.9, 7.9], [3.9, 7.55], [4.5, 6.3], [4.5, 0]] as XY[],
};

/** Centres of the bastions that touch the stretch x0..x1. */
function bastionCentres(x0: number, x1: number): number[] {
  const { G, PLOT_C, spacing } = BASTION;
  const eps = 0.01;
  // inside the gate plot, and the stretches that continue it from its two edges
  if (x0 >= -HALF - eps && x1 <= HALF + eps) return [-PLOT_C, PLOT_C].filter((c) => c + G > x0 && c - G < x1);
  // continuing the plot: the next bastions follow the plot's own at the proper spacing
  if (Math.abs(x0 - HALF) < eps) {
    const res = [PLOT_C];
    while (res[res.length - 1] + spacing + G <= x1 - 2) res.push(res[res.length - 1] + spacing);
    return res;
  }
  if (Math.abs(x1 + HALF) < eps) {
    const res = [-PLOT_C];
    while (res[0] - spacing - G >= x0 + 2) res.unshift(res[0] - spacing);
    return res;
  }
  return spread(x0, x1);
  function spread(a: number, c: number): number[] {
    const L = c - a;
    if (L < 60) return [];
    const n = Math.max(1, Math.round(L / spacing));
    return Array.from({ length: n }, (_, i) => a + ((i + 0.5) * L) / n);
  }
}

function bastionTrace(cs: number[], x0: number, x1: number): XY[] {
  const { CF, SH, G, K } = BASTION;
  const pts: XY[] = [[Math.min(x0, ...cs.map((c) => c - G)) - 1, CF]];
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G, CF], [c - G, SH], [c, SH + K * G], [c + G, SH], [c + G, CF]);
  pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 1, CF]);
  return pts;
}

/** Draw the scarped runs of a trace (with cordon and turf parapet top), clipped to x0..x1. */
function scarpRuns(b: Builder, pts: XY[], x0: number, x1: number, o?: { lift?: number }): void {
  const { brick, grass } = WALL_COLOURS.bastion;
  const sec = BASTION.section.map(([d, y]) => [d, y + (y > 0 ? o?.lift ?? 0 : 0)] as XY);
  const lift = o?.lift ?? 0;
  const eps = 1e-6;
  for (let i = 0; i < pts.length - 1; i++) {
    let p = pts[i];
    let q = pts[i + 1];
    const dx = q[0] - p[0];
    const dz = q[1] - p[1];
    const L = Math.hypot(dx, dz);
    if (L < eps) continue;
    const n: XY = [dz / L, -dx / L];
    let clipP = false;
    let clipQ = false;
    if (Math.abs(dx) < eps) {
      if (p[0] < x0 - eps || p[0] > x1 + eps) continue;
    } else {
      const lo = Math.min(p[0], q[0]);
      const hi = Math.max(p[0], q[0]);
      if (hi <= x0 + eps || lo >= x1 - eps) continue;
      const at = (x: number): XY => [x, p[1] + (dz * (x - p[0])) / dx];
      if (dx > 0) {
        if (p[0] < x0) (p = at(x0)), (clipP = true);
        if (q[0] > x1) (q = at(x1)), (clipQ = true);
      } else {
        if (p[0] > x1) (p = at(x1)), (clipP = true);
        if (q[0] < x0) (q = at(x0)), (clipQ = true);
      }
    }
    run(b, p, q, n, sec, brick, { clipP, clipQ });
    run(b, p, q, n, [[1.6, 7.92 + lift], [1.9, 7.93 + lift], [3.9, 7.58 + lift], [4.3, 6.9 + lift]], grass, { clipP, clipQ });
    // the travertine cordon at the top of the scarp, cut square to X where clipped
    const u: XY = [dx / L, dz / L];
    // isQ: the far end, where the cordon is pulled back inside the cut
    const off = (r: XY, clip: boolean, isQ: boolean): [number, number, number] => {
      let x = r[0] + n[0] * 0.85;
      let z = r[1] + n[1] * 0.85;
      if (clip && Math.abs(u[0]) > eps) {
        const xt = r[0] + (isQ ? -1 : 1) * Math.sign(u[0]) * 0.22;
        const t = (xt - x) / u[0];
        x += u[0] * t;
        z += u[1] * t;
      }
      return [x, 6.1 + lift, z];
    };
    b.beam(off(p, clipP, false), off(q, clipQ, true), 0.45, 0.45, P.travertine, NJ);
  }
}

/** Gunports in a flank at plan x, facing -X (s = 1) or +X (s = -1). */
function gunports(b: Builder, x: number, s: 1 | -1): void {
  for (const z of [0.6, 2.2]) {
    b.group({ at: [x + s * 0.42, 2.2, z], rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 }, () => {
      b.panel(1.3, 1.1, P.travertine, { shape: 'round', depth: 0.1 });
      b.panel(0.9, 0.85, P.black, { at: [0, 0.05, 0], shape: 'round', depth: 0.14 });
    });
  }
}

/** A stone sentry box (garitta) standing on the parapet. */
export function sentryBox(b: Builder, x: number, y: number, z: number, look: 1 | -1): void {
  const { brick } = WALL_COLOURS.bastion;
  const trav = P.travertine;
  b.group({ at: [x, y, z] }, () => {
    b.cyl(0.8, 0.6, trav, { segs: 10, rTop: 0.95, ...NJ });
    b.cyl(0.95, 0.2, trav, { at: [0, 0.6, 0], segs: 10, ...NJ });
    b.cyl(0.8, 1.9, brick, { at: [0, 0.8, 0], segs: 10, ...NJ });
    b.panel(0.18, 0.7, P.black, { at: [0, 1.5, 0.8], depth: 0.04 });
    b.panel(0.18, 0.7, P.black, { at: [look * 0.8, 1.5, 0], facing: look > 0 ? '+x' : '-x', depth: 0.04 });
    b.cyl(0.95, 0.15, trav, { at: [0, 2.7, 0], segs: 10, ...NJ });
    b.dome(0.9, trav, { at: [0, 2.85, 0], segs: 10, squash: 0.8, ...NJ });
    b.cone(0.12, 0.5, trav, { at: [0, 3.55, 0], segs: 6, ...NJ });
  });
}

/** The counterscarp line, bulging round each bastion so the ditch follows its faces. */
function counterscarpLine(cs: number[], x0: number, x1: number): XY[] {
  const { G, cs: z } = BASTION;
  const pts: XY[] = [[Math.min(x0, ...cs.map((c) => c - G)) - 1, z]];
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G + 6.4, z], [c, z + 0.8 * (G - 6.4)], [c + G - 6.4, z]);
  pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 1, z]);
  return clipX(pts, x0, x1);
}

function counterscarp(b: Builder, line: XY[]): void {
  const { brick, ditch } = WALL_COLOURS.bastion;
  for (let i = 0; i < line.length - 1; i++) {
    segBox(b, line[i], line[i + 1], 0.6, 0.9, brick);
    segBox(b, line[i], line[i + 1], 0.7, 0.15, P.travertine, 0.9);
  }
  // the ditch floor between the scarp foot and the counterscarp
  if (line.length > 1) slab(b, [[line[0][0], BASTION.CF + 0.2], [line[line.length - 1][0], BASTION.CF + 0.2], ...[...line].reverse().map(([x, z]) => [x, z + 0.3] as XY)], 0, 0.03, ditch);
}

function bastionStretch(b: Builder, x0: number, x1: number): void {
  const { grass } = WALL_COLOURS.bastion;
  const { G, SH, K, top } = BASTION;
  const cs = bastionCentres(x0, x1);
  scarpRuns(b, bastionTrace(cs, x0, x1), x0, x1);
  // the terreplein: one fill behind the curtain, and one inside each bastion
  slab(b, [[x0, -1.5], [x1, -1.5], [x1, -6.0], [x0, -6.0]], 0, top, grass);
  for (const c of cs) {
    const poly = clipPolyX([[c - G + 1, -1.5], [c - G + 1, SH - 0.4], [c, SH + K * G - 1.9], [c + G - 1, SH - 0.4], [c + G - 1, -1.5]], x0, x1);
    if (poly.length > 2) slab(b, poly, 0, top, grass);
    if (c - G >= x0 - 0.01 && c - G <= x1 + 0.01) {
      gunports(b, c - G, 1);
      if (c - G + 1 <= x1) sentryBox(b, c - G + 1.0, 7.0, SH + 0.4, 1);
    }
    if (c + G >= x0 - 0.01 && c + G <= x1 + 0.01) {
      gunports(b, c + G, -1);
      if (c + G - 1 >= x0) sentryBox(b, c + G - 1.0, 7.0, SH + 0.4, -1);
    }
  }
  // the inner slope down to the town
  prismX(b, x0, x1, [[-6.0, top], [-8, 0], [-6.0, 0]], tint(grass, -0.04));
  counterscarp(b, counterscarpLine(cs, x0, x1));
}

/** A raised gun platform (cavalier) of earth faced in brick over the gorge of a bastion. */
function cavalier(b: Builder, poly: XY[], h: number): void {
  const { brick, grass } = WALL_COLOURS.bastion;
  slab(b, poly, 0, h, brick);
  slab(b, poly, h, h + 0.08, grass);
}

function bastionCorner(b: Builder): void {
  const { CF, SH, top } = BASTION;
  const { grass, ditch } = WALL_COLOURS.bastion;
  const G = 13;
  const S = 9; // the salient lies on the diagonal
  const trace: XY[] = [[-G, CF], [-G, SH], [S, S], [SH, -G], [CF, -G]];
  scarpRuns(b, trace, -1e9, 1e9);
  // terreplein inside the bastion, and a cavalier over the gorge where the two curtains run in
  slab(b, [[-G + 1, -1.5], [-G + 1, SH - 0.4], [S - 2.2, S - 2.2], [SH - 0.4, -G + 1], [-1.5, -G + 1], [-1.5, -1.5]], 0, top, grass);
  cavalier(b, [[-8.4, -5.4], [-8.4, -0.3], [2.5, 2.5], [-0.3, -8.4], [-5.4, -8.4], [-5.4, -5.4]], 8.6);
  gunports(b, -G, 1);
  // the second flank faces -Z: the same ports, reflected across the diagonal
  for (const x of [0.6, 2.2]) {
    b.group({ at: [x, 2.2, -G + 0.42], rotY: Math.PI }, () => {
      b.panel(1.3, 1.1, P.travertine, { shape: 'round', depth: 0.1 });
      b.panel(0.9, 0.85, P.black, { at: [0, 0.05, 0], shape: 'round', depth: 0.14 });
    });
  }
  sentryBox(b, S - 1.6, 7.0, S - 1.6, 1);
  // ditch and counterscarp round the salient
  const line: XY[] = [[0, BASTION.cs], [12.5, 12.5], [BASTION.cs, 0]];
  for (let i = 0; i < 2; i++) {
    segBox(b, line[i], line[i + 1], 0.6, 0.9, WALL_COLOURS.bastion.brick);
    segBox(b, line[i], line[i + 1], 0.7, 0.15, P.travertine, 0.9);
  }
  slab(b, [[0, 0], [0, BASTION.cs + 0.3], [12.8, 12.8], [BASTION.cs + 0.3, 0]], 0, 0.03, ditch);
}

function bastionTerminal(b: Builder): void {
  const { CF, SH, top } = BASTION;
  const { grass } = WALL_COLOURS.bastion;
  const G = 13;
  const ZS = 6.6; // a half-bastion whose face stops short of the counterscarp
  scarpRuns(b, [[-G, CF], [-G, SH], [0, ZS], [0, CF - 0.01]], -1e9, 1e9);
  slab(b, [[-G + 1, -1.5], [-G + 1, SH - 0.4], [-1.0, ZS - 1.6], [-1.0, -1.5]], 0, top, grass);
  cavalier(b, [[-8.4, -5.4], [-8.4, 0.4], [-4.6, 1.6], [-4.6, -5.4]], 8.6);
  gunports(b, -G, 1);
  sentryBox(b, -G + 1.0, 7.0, SH + 0.4, 1);
}

// ================================================================== the public functions

/**
 * A straight stretch of the town wall of the given stage along X from x0 to x1 (x0 < x1), matching the
 * wall stubs on that stage's gate plot. `o.towers: false` and `o.detail: true` are for the plot stubs
 * themselves (which place their own towers and use more detailed masonry).
 */
export function curtain(b: Builder, stage: WallStage, x0: number, x1: number, o?: { towers?: boolean; detail?: boolean }): void {
  if (x1 - x0 < 1e-3) return;
  const towers = o?.towers ?? true;
  const detail = o?.detail ?? false;
  switch (stage) {
    case 'rampart':
      return rampartStretch(b, x0, x1);
    case 'etruscan':
      return etruscanStretch(b, x0, x1, detail);
    case 'roman':
      return romanStretch(b, x0, x1, towers);
    case 'aurelian':
      return aurelianStretch(b, x0, x1, towers, detail);
    case 'communal':
      return communalStretch(b, x0, x1, towers);
    case 'bastion':
      return bastionStretch(b, x0, x1);
  }
}

/**
 * A corner piece centred on the origin, where a stretch arriving along -X (its outside to +Z) meets a
 * stretch arriving along -Z (its outside to +X): the outside of the corner is the +X, +Z quadrant.
 * Both stretches should run up to the origin.
 */
export function corner(b: Builder, stage: WallStage): void {
  switch (stage) {
    case 'rampart':
      return rampartCorner(b);
    case 'etruscan':
      return etruscanTower(b);
    case 'roman':
      return romanTower(b, 0.6, 0.6, 3.6, 13.0);
    case 'aurelian':
      return aurelianTower(b, 0.7, 1, { w: 5.2, out: 2.7, h: 12.4 });
    case 'communal':
      return communalTower(b, 0.5, { open: false, w: 8.0, out: 3.7, back: -3.4, h: 19 });
    case 'bastion':
      return bastionCorner(b);
  }
}

/** A terminal piece centred on the origin for where a stretch arriving along -X simply ends (at the river bank). */
export function terminal(b: Builder, stage: WallStage): void {
  switch (stage) {
    case 'rampart':
      return rampartTerminal(b);
    case 'etruscan':
      return etruscanTower(b);
    case 'roman':
      return romanTower(b, 0, 0.6, 3.2, 12.5);
    case 'aurelian':
      return aurelianTower(b, 0, 1, { w: 4.6, out: 3.0, h: 12.0 });
    case 'communal':
      return communalTower(b, 0, { open: false, w: 7.0, out: 3.4, back: -2.8, h: 18 });
    case 'bastion':
      return bastionTerminal(b);
  }
}
