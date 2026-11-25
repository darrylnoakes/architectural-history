import { P, mix, mulberry32, tint, type Builder } from '@ah/kit';
import {
  HALF,
  NJ,
  WALL_COLOURS,
  archPanel,
  blockWall,
  clipPolyX,
  clipX,
  evenly,
  gaps,
  merlonRing,
  merlonsX,
  prismX,
  quad,
  rectZ,
  ring,
  run,
  segBox,
  slab,
  soup,
  type XY,
} from './shared';

/*
 * The town wall between the gates, stage by stage. The gate plots build their own wall stubs with
 * `curtain`, so a stretch drawn by the town continues them exactly. Outside (field side) is +Z, town -Z.
 *
 * Joining pieces: stretches that meet at a corner both run right up to the corner's origin (the point
 * where their reference lines, local z = 0, cross); `corner` covers the overlap and the outer quadrant.
 * A stretch that ends at the river runs to the terminal's origin.
 *
 * Everything here is pure geometry with fixed colours and no use of the builder's random numbers, no
 * colliders and no decks, so it can be called inside any group, any number of times. Features along a
 * stretch (beam ends, merlons, putlog holes) are placed on a grid fixed to local x, so a stretch that
 * continues a plot stub continues its pattern.
 */

/** `vauban-surviving`: what was kept of the bastioned front after 1885, once the north gate had gone (see `vaubanStretch`). */
export type WallStage = 'gaulish' | 'castrum' | 'philippian' | 'fortified' | 'vauban' | 'vauban-surviving';

/** For walk collisions: the z of the wall's centre line and its thickness at ground level, per stage; height of the top of the defences. */
export const CURTAIN: Record<WallStage, { z: number; thick: number; height: number }> = {
  gaulish: { z: -3.3, thick: 8.6, height: 5.7 }, // stone face at +1.0 to the toe of the earth ramp at -7.6
  castrum: { z: 0, thick: 3.9, height: 9.8 }, // footing of reused blocks 3.9, the wall itself 3.6
  philippian: { z: -3.5, thick: 3.2, height: 9.8 }, // battered foot 3.2, the wall 2.6
  fortified: { z: -3.5, thick: 3.2, height: 9.8 },
  vauban: { z: -4.3, thick: 7.4, height: 7.6 }, // scarp foot at -0.6 to the foot of the inner slope at -8
  'vauban-surviving': { z: -4.3, thick: 7.4, height: 7.6 },
};

/** Grid positions k·step + off that fall inside a..b (with a margin). */
function grid(a: number, c: number, step: number, off = 0, margin = 0.15): number[] {
  const xs: number[] = [];
  for (let k = Math.ceil((a + margin - off) / step); k * step + off <= c - margin; k++) xs.push(k * step + off);
  return xs;
}

/**
 * The outline of a ditch turning a corner: a quarter ring between radii r0 and r1 in the corner's
 * outer quadrant (+X, +Z). Its two straight ends join the stretches either side, so dig it with
 * `open: ringEnds(n)`.
 */
export function quarterRing(r0: number, r1: number, n = 6): XY[] {
  const pts: XY[] = [];
  for (let i = 0; i <= n; i++) pts.push([Math.sin((Math.PI / 2) * (i / n)) * r0, Math.cos((Math.PI / 2) * (i / n)) * r0]);
  for (let i = n; i >= 0; i--) pts.push([Math.sin((Math.PI / 2) * (i / n)) * r1, Math.cos((Math.PI / 2) * (i / n)) * r1]);
  return pts;
}

/** The two open ends of a `quarterRing(r0, r1, n)` outline, as edge indices for `b.dig`. */
export const ringEnds = (n = 6): number[] => [n, 2 * n + 1];

// ================================================================== the murus gallicus (2nd to 1st century BC)

/**
 * Section of the Gaulish rampart: a vertical face of dry stone at z = FACE with the ends of the timber
 * lacing in rows, the earth-and-timber core 3 m deep behind it, then a long earth ramp down into the
 * town; a berm and a ditch outside.
 */
export const GAULISH = {
  face: 1.0,
  h: 4.4,
  top: -2.0,
  toe: -7.6,
  ditch: [2.2, 7.2] as [number, number],
  /** Depth of the ditch and the run of its sloping sides: a V with a narrow flat bottom. */
  depth: 1.9,
  slope: 1.8,
  beamStep: 1.6,
  rows: [0.5, 1.25, 2.0, 2.75, 3.5],
};

/** Beam ends on a stone face at z = zf between x0 and x1 (rows staggered, so they read as a chequer). */
function beamEnds(out: number[], x0: number, x1: number, zf: number): void {
  const { rows, beamStep } = GAULISH;
  rows.forEach((y, i) => {
    for (const x of grid(x0, x1, beamStep, i % 2 ? beamStep / 2 : 0, 0.25)) rectZ(out, x, y, zf, 0.26, 0.26);
  });
}

/**
 * A straight stretch of the Gaulish rampart along X. `ditch: false` leaves out the berm and ditch (for
 * the inturned wings of the funnel entrance, which face the road).
 */
export function gaulishStretch(b: Builder, x0: number, x1: number, o?: { ditch?: boolean; top?: number; toe?: number }): void {
  const c = WALL_COLOURS.gaulish;
  const { face, h, ditch } = GAULISH;
  const top = o?.top ?? GAULISH.top;
  const toe = o?.toe ?? GAULISH.toe;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  // the dry-stone face, and the earth core and ramp behind it
  b.box(L, h, 0.7, c.stone, { at: [xc, 0, face - 0.35], ...NJ });
  prismX(b, x0, x1, [[face - 0.68, 0], [face - 0.68, h], [top, h], [toe, 0]], c.earth);
  prismX(b, x0, x1, [[top - 0.25, h - 0.17], [toe + 0.05, 0.05]], c.grass);
  // the timber lacing: beam ends in rows, and thin dark joints between the courses of stone
  const ends: number[] = [];
  beamEnds(ends, x0, x1, face + 0.012);
  soup(b, ends, c.beam);
  const joints: number[] = [];
  for (const y of [0.88, 1.63, 2.38, 3.13, 3.88]) quad(joints, [x0, y, face + 0.01], [x1, y, face + 0.01], [x1, y + 0.04, face + 0.01], [x0, y + 0.04, face + 0.01]);
  soup(b, joints, tint(c.stone, -0.18));
  // a breastwork of wattle between posts along the front of the walk
  b.box(L, 1.15, 0.12, c.wattle, { at: [xc, h, face - 0.25], ...NJ });
  for (const x of grid(x0, x1, 2.0, 1.0, 0.1)) b.box(0.18, 1.45, 0.18, c.timber, { at: [x, h, face - 0.25], ...NJ });
  if (o?.ditch !== false) {
    // the ditch is dug out of the ground itself, its ends open to run on into the next stretch
    b.trench(x0, x1, ditch[0], ditch[1], GAULISH.depth, { slope: GAULISH.slope, color: c.ditch });
    // the spoil not needed for the rampart, thrown up in a low bank beyond the ditch
    prismX(b, x0, x1, [[ditch[1], 0], [ditch[1] + 0.3, 0.45], [ditch[1] + 0.75, 0.4], [ditch[1] + 0.8, 0]], c.grass);
  }
}

function gaulishCorner(b: Builder): void {
  const c = WALL_COLOURS.gaulish;
  const { face, h, ditch } = GAULISH;
  const q = { segs: 5, start: 0, sweep: Math.PI / 2, ...NJ };
  // the face swept round the outer quadrant, the core top inside it, the breastwork and the ditch
  b.lathe([[face, 0], [face, h]], c.stone, q);
  b.lathe([[0.001, h], [face, h]], c.earth, q);
  b.lathe([[face - 0.25, h], [face - 0.25, h + 1.15]], c.wattle, q);
  b.dig(quarterRing(ditch[0], ditch[1]), GAULISH.depth, { slope: GAULISH.slope, color: c.ditch, open: ringEnds() });
  b.lathe([[ditch[1], 0], [ditch[1] + 0.3, 0.45], [ditch[1] + 0.75, 0.4], [ditch[1] + 0.8, 0]], c.grass, q);
  // beam ends on the curve
  for (const [i, y] of GAULISH.rows.entries()) {
    const a = i % 2 ? Math.PI / 4 : Math.PI / 8;
    for (const t of i % 2 ? [a] : [a, Math.PI / 2 - a]) {
      b.panel(0.26, 0.26, c.beam, { at: [Math.sin(t) * face, y, Math.cos(t) * face], facing: t, depth: 0.02 });
    }
  }
  b.box(0.2, 1.45, 0.2, c.timber, { at: [(face - 0.25) * 0.71, h, (face - 0.25) * 0.71], ...NJ });
}

/**
 * How far past the end of the wall a ditch runs on toward the river (the walls end on the bank a few
 * metres short of the water, and the ditch drains into it).
 */
const RIVER_RUN = 5;

/** The ditch carried on past a terminal at x = 0 into the river, on the side away from the wall (sx). */
function riverDitch(b: Builder, sx: number, z0: number, z1: number, depth: number, slope: number, color: number): void {
  b.trench(sx > 0 ? 0 : -RIVER_RUN, sx > 0 ? RIVER_RUN : 0, z0, z1, depth, { slope, color });
}

function gaulishTerminal(b: Builder, sx: number): void {
  const c = WALL_COLOURS.gaulish;
  const { face, h, top, toe, ditch } = GAULISH;
  // the stone face returns round the end of the core; the ramp ends in a slope of earth
  b.box(0.7, h, face - top + 0.7, c.stone, { at: [sx * 0.35, 0, (face + top) / 2 - 0.35 + 0.35], ...NJ });
  const ends: number[] = [];
  GAULISH.rows.forEach((y, i) => {
    for (let z = top + (i % 2 ? 0.4 : 1.2); z < face - 0.2; z += 1.6) {
      const x = sx * 0.712;
      quad(ends, [x, y, z - 0.13], [x, y, z + 0.13], [x, y + 0.26, z + 0.13], [x, y + 0.26, z - 0.13]);
    }
  });
  soup(b, ends, c.beam);
  b.group({ at: [sx * 0.02, 0, 0], rotY: Math.PI / 2 }, () => b.extrude([[-top, h], [-toe, 0], [-top + 0.01, 0]], 0.04, c.earth, NJ));
  riverDitch(b, sx, ditch[0], ditch[1], GAULISH.depth, GAULISH.slope, c.ditch);
}

// ================================================================== the late Roman castrum (late 3rd century)

/**
 * The late Roman wall: a footing of big reused blocks, then a core of mortared rubble faced with small
 * squared stones and laced every metre and a half with bands of brick; half-round towers about every
 * thirty metres, solid below and with a chamber lit by arched windows at the top.
 */
export const CASTRUM = { t: 3.6, h: 8.2, base: 1.7, bands: [2.75, 4.35, 5.95, 7.55], band: 0.34, spacing: 30, tower: { r: 3.0, h: 11.8, z: 1.8 } };

function castrumStretch(b: Builder, x0: number, x1: number, towers: boolean, detail: boolean): void {
  const { stone, brick, spolia } = WALL_COLOURS.castrum;
  const { t, h, base, bands, band } = CASTRUM;
  const WF = t / 2;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h - base, t, stone, { at: [xc, base, 0], ...NJ });
  if (detail) {
    // the plot stub: every reused block its own box, laid out by a private seeded sequence
    const rnd = mulberry32(Math.round(Math.abs(x0) * 100 + 11));
    blockWall(b, x0, x1, 0, t + 0.3, base, spolia, rnd, { course: [0.8, 0.9], len: [1.1, 2.1], tone: 0.07 });
  } else {
    b.box(L, base, t + 0.3, spolia, { at: [xc, 0, 0], ...NJ });
    const joints: number[] = [];
    for (const f of [1, -1]) {
      const z = f * (WF + 0.155);
      for (const x of grid(x0, x1, 1.7, 0.4)) rectZ(joints, x, 0, z, 0.05, 0.85);
      for (const x of grid(x0, x1, 1.7, 1.25)) rectZ(joints, x, 0.85, z, 0.05, 0.85);
      quad(joints, [x0, 0.84, z], [x1, 0.84, z], [x1, 0.88, z], [x0, 0.88, z]);
    }
    soup(b, joints, tint(spolia, -0.2));
  }
  for (const y of bands) b.box(L, band, t + 0.06, brick, { at: [xc, y, 0], ...NJ });
  // putlog holes left by the builders' scaffolding, on the field side
  const holes: number[] = [];
  for (const x of grid(x0, x1, 2.2, 0.6)) for (const y of [3.4, 6.6]) rectZ(holes, x, y, WF + 0.012, 0.2, 0.2);
  soup(b, holes, P.black);
  // the parapet: merlons on the field side, a low wall on the town side
  const xs = towers ? evenly(x0, x1, CASTRUM.spacing) : [];
  for (const [a, c] of gaps(x0, x1, xs, CASTRUM.tower.r - 0.2)) merlonsX(b, a, c, h, WF - 0.3, stone, { w: 1.0, h: 1.6, t: 0.6, gap: 0.85 });
  b.box(L, 0.9, 0.45, stone, { at: [xc, h, -WF + 0.22], ...NJ });
  b.box(L, 0.05, t - 1.1, tint(stone, -0.12), { at: [xc, h, -0.1], ...NJ });
  for (const x of xs) castrumTower(b, x, CASTRUM.tower.z, CASTRUM.tower.r, CASTRUM.tower.h);
}

/** Half the length of wall a plain gate of the late Roman wall takes up, and half the width of its passage. */
export const CASTRUM_GATE = { half: 7, way: 1.9, spring: 2.7 };

/**
 * A plain gate of the late Roman wall, centred on the origin, the wall running along X and the field
 * to +Z: one arched passage through the thickness of the wall, between two towers that stand out from
 * its face. (The wall's fourth gate is grander: the old triumphal arch, built into it.)
 */
export function castrumGate(b: Builder): void {
  const { stone, brick } = WALL_COLOURS.castrum;
  const { t, h, bands, band } = CASTRUM;
  const { half, way, spring } = CASTRUM_GATE;
  const WF = t / 2;
  castrumStretch(b, -half, -way, false, false);
  castrumStretch(b, way, half, false, false);
  // the wall over the passage, with its round arch cut through
  const head: XY[] = [[-way, spring]];
  for (let i = 1; i < 8; i++) {
    const a = Math.PI - (Math.PI * i) / 8;
    head.push([Math.cos(a) * way, spring + Math.sin(a) * way]);
  }
  head.push([way, spring], [way, h], [-way, h]);
  b.extrude(head, t, stone, NJ);
  for (const y of bands) if (y > spring + way + 0.2) b.box(2 * way, band, t + 0.06, brick, { at: [0, y, 0], ...NJ });
  // the arch turned in brick on both faces
  for (const f of [1, -1]) {
    const ring: XY[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI - (Math.PI * i) / 8;
      ring.push([Math.cos(a) * (way + 0.45), spring + Math.sin(a) * (way + 0.45)]);
    }
    for (let i = 8; i >= 0; i--) {
      const a = Math.PI - (Math.PI * i) / 8;
      ring.push([Math.cos(a) * way, spring + Math.sin(a) * way]);
    }
    b.extrude(ring, 0.08, brick, { at: [0, 0, f * (WF + 0.04)], ...NJ });
  }
  merlonsX(b, -way, way, h, WF - 0.3, stone, { w: 1.0, h: 1.6, t: 0.6, gap: 0.85 });
  b.box(2 * way, 0.9, 0.45, stone, { at: [0, h, -WF + 0.22], ...NJ });
  b.box(2 * way, 0.05, t - 1.1, tint(stone, -0.12), { at: [0, h, -0.1], ...NJ });
  for (const s of [-1, 1]) castrumTower(b, s * (way + 3.2), CASTRUM.tower.z, 2.6, 12.6, { windows: [0, s * 1.1] });
}

/**
 * A half-round tower of the late Roman wall, centred on the outer face of the wall so that half of it
 * stands proud: solid below, a chamber at the top with arched windows, a tiled conical roof.
 */
export function castrumTower(b: Builder, x: number, z: number, r: number, h: number, o?: { windows?: number[] }): void {
  const { stone, brick, spolia, roof } = WALL_COLOURS.castrum;
  const segs = 14;
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r + 0.18, CASTRUM.base, spolia, { segs, ...NJ });
    b.cyl(r, h - CASTRUM.base, stone, { at: [0, CASTRUM.base, 0], segs, ...NJ });
    for (const y of CASTRUM.bands) if (y < h - 3.5) ring(b, r + 0.03, y, CASTRUM.band, brick, segs);
    ring(b, r + 0.03, h - 0.95, CASTRUM.band, brick, segs);
    b.cyl(r + 0.22, 0.3, tint(stone, 0.04), { at: [0, h, 0], segs, ...NJ });
    b.cone(r + 0.55, 2.3, roof, { at: [0, h + 0.3, 0], segs, ...NJ });
    // the chamber's windows, each under an arch of brick, facing out and along the wall
    for (const a of o?.windows ?? [-1.1, 0, 1.1]) {
      const at = (y: number): [number, number, number] => [Math.sin(a) * (r - 0.02), y, Math.cos(a) * (r - 0.02)];
      archPanel(b, 1.15, 1.95, brick, { at: at(h - 3.05), facing: a, depth: 0.05 });
      archPanel(b, 0.8, 1.75, P.windowDark, { at: at(h - 3.0), facing: a, depth: 0.08 });
    }
  });
}

// ================================================================== Philip Augustus (c. 1190 to 1220), and the same wall in the Hundred Years' War

/**
 * The wall of Philip Augustus: a curtain about 2.6 m thick and 8 m to the wall-walk, crenellated, with
 * round towers about every sixty metres and a dry ditch. In the Hundred Years' War ('fortified') the
 * towers are roofed in slate and pierced low down for small guns.
 *
 * The ditch is dug with earth sides from a narrow berm at the foot of the wall, so the towers stand out
 * into it and are built up from its bottom.
 */
export const PHILIP = {
  z: -3.5,
  t: 2.6,
  h: 8.0,
  spacing: 60,
  tower: { r: 3.0, h: 12.0, z: -1.7 },
  /** The lips of the ditch (z), its depth and the run of its sloping sides. */
  ditch: [-1.0, 7.6] as [number, number],
  depth: 2.8,
  slope: 1.6,
};

function philipStretch(b: Builder, x0: number, x1: number, towers: boolean, late: boolean): void {
  const { stone, dress, ditch } = WALL_COLOURS.philippian;
  const { z, t, h } = PHILIP;
  const WF = z + t / 2;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h, t, stone, { at: [xc, 0, z], ...NJ });
  b.box(L, 2.3, t + 0.6, tint(stone, -0.06), { at: [xc, -1.2, z], ...NJ }); // battered foot, carried down below the lip of the ditch
  b.box(L, 0.18, t + 0.1, dress, { at: [xc, h - 0.18, z], ...NJ }); // string course at the walk
  // course lines on the field face
  const lines: number[] = [];
  for (const y of [2.4, 3.6, 4.8, 6.0]) quad(lines, [x0, y, WF + 0.01], [x1, y, WF + 0.01], [x1, y + 0.05, WF + 0.01], [x0, y + 0.05, WF + 0.01]);
  soup(b, lines, tint(stone, -0.14));
  const xs = towers ? evenly(x0, x1, PHILIP.spacing) : [];
  for (const [a, c] of gaps(x0, x1, xs, PHILIP.tower.r - 0.3)) merlonsX(b, a, c, h, WF - 0.25, stone, { w: 1.1, h: 1.8, t: 0.5, gap: 0.75 });
  b.box(L, 0.8, 0.4, stone, { at: [xc, h, z - t / 2 + 0.2], ...NJ });
  for (const x of xs) philipTower(b, x, PHILIP.tower.z, PHILIP.tower.r, PHILIP.tower.h, { roof: late, guns: late });
  // the dry ditch, dug out of the ground, its ends open to run on into the next stretch
  b.trench(x0, x1, PHILIP.ditch[0], PHILIP.ditch[1], PHILIP.depth, { slope: PHILIP.slope, color: ditch });
}

/**
 * A round tower of Philip Augustus's pattern, centred at (x, z): a battered foot, tall arrow loops,
 * a crenellated top. Options for the later Middle Ages: `roof` (a steep conical roof of slate),
 * `machi` (a parapet carried out on corbels, with holes between them: machicolations), `guns`
 * (keyhole gunports low down), `h` raised. The foot is carried down to the bottom of the ditch, which
 * the towers stand out into.
 */
export function philipTower(b: Builder, x: number, z: number, r: number, h: number, o?: { roof?: boolean; machi?: boolean; guns?: boolean; loops?: number[] }): void {
  const { stone, dress, roof } = WALL_COLOURS.philippian;
  const segs = 16;
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r + 0.45, PHILIP.depth + 0.02, tint(stone, -0.08), { at: [0, -PHILIP.depth, 0], segs, ...NJ });
    b.cyl(r + 0.45, 1.6, tint(stone, -0.06), { segs, rTop: r, ...NJ });
    b.cyl(r, h - 1.6, stone, { at: [0, 1.6, 0], segs, ...NJ });
    ring(b, r + 0.04, PHILIP.h - 0.18, 0.18, dress, segs);
    // arrow loops (archères): tall slits, the lower ones splayed at the foot
    for (const a of o?.loops ?? [-1.2, 0, 1.2]) {
      const at = (y: number): [number, number, number] => [Math.sin(a) * (r - 0.02), y, Math.cos(a) * (r - 0.02)];
      b.panel(0.42, 2.2, dress, { at: at(2.7), facing: a, depth: 0.04 });
      b.panel(0.14, 2.0, P.black, { at: at(2.8), facing: a, depth: 0.06 });
      b.panel(0.4, 0.14, P.black, { at: at(2.8), facing: a, depth: 0.06 });
      b.panel(0.14, 1.6, P.black, { at: at(PHILIP.h + 0.6), facing: a + 0.5, depth: 0.06 });
      if (o?.guns) {
        // a keyhole gunport: a round hole for the barrel under a sighting slit
        b.panel(0.42, 0.42, P.black, { at: at(0.75), facing: a + 0.55, shape: 'circle', depth: 0.06 });
        b.panel(0.12, 0.6, P.black, { at: at(1.15), facing: a + 0.55, depth: 0.06 });
      }
    }
    if (o?.machi) {
      // corbels round the top, then the parapet carried out over them
      const n = 18;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        b.box(0.32, 1.0, 0.75, dress, { at: [Math.sin(a) * (r + 0.2), h - 1.0, Math.cos(a) * (r + 0.2)], rotY: a, ...NJ });
      }
      b.cyl(r + 0.55, 0.25, dress, { at: [0, h - 0.05, 0], segs, ...NJ });
      b.cyl(r + 0.55, 1.6, stone, { at: [0, h + 0.2, 0], segs, ...NJ });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        b.panel(0.5, 0.75, P.windowDark, { at: [Math.sin(a) * (r + 0.54), h + 0.55, Math.cos(a) * (r + 0.54)], facing: a, depth: 0.04 });
      }
      b.cone(r + 0.75, (r + 0.75) * 1.7, roof, { at: [0, h + 1.8, 0], segs, ...NJ });
      b.cyl(0.08, 1.2, P.lead, { at: [0, h + 1.8 + (r + 0.75) * 1.7 - 0.2, 0], segs: 5, ...NJ });
    } else if (o?.roof) {
      b.cyl(r + 0.12, 0.3, dress, { at: [0, h, 0], segs, ...NJ });
      b.cone(r + 0.4, (r + 0.4) * 1.8, roof, { at: [0, h + 0.3, 0], segs, ...NJ });
    } else {
      b.cyl(r + 0.1, 0.25, dress, { at: [0, h - 0.25, 0], segs, ...NJ });
      merlonRing(b, r + 0.1, h, 10, stone, { w: 1.1, h: 1.6, t: 0.5 });
      b.cyl(r - 0.5, 0.04, tint(stone, -0.14), { at: [0, h, 0], segs: 10, ...NJ });
    }
  });
}

/**
 * The outline of a ditch filling a corner's outer quadrant out to radius r: a quarter disc whose two
 * straight sides join the stretches either side (dig it with `open: fanEnds(n)`). Used where the
 * stretches' ditches start right at the corner's origin or inside it.
 */
export function quarterFan(r: number, n = 6): XY[] {
  const pts: XY[] = [[0, 0]];
  for (let i = 0; i <= n; i++) pts.push([Math.sin((Math.PI / 2) * (i / n)) * r, Math.cos((Math.PI / 2) * (i / n)) * r]);
  return pts;
}

/** The two open sides of a `quarterFan(r, n)` outline. */
export const fanEnds = (n = 6): number[] => [0, n + 1];

function philipCorner(b: Builder, late: boolean): void {
  const { ditch } = WALL_COLOURS.philippian;
  philipTower(b, -2.0, -2.0, 4.1, 13.0, { roof: late, guns: late, loops: [-0.2, 0.78, 1.77] });
  b.dig(quarterFan(PHILIP.ditch[1]), PHILIP.depth, { slope: PHILIP.slope, color: ditch, open: fanEnds() });
}

function philipTerminal(b: Builder, late: boolean, sx: number): void {
  philipTower(b, 0, -2.5, 3.4, 12.5, { roof: late, guns: late, loops: [-0.6 * sx, 0.5 * sx, 1.6 * sx] });
  riverDitch(b, sx, PHILIP.ditch[0], PHILIP.ditch[1], PHILIP.depth, PHILIP.slope, WALL_COLOURS.philippian.ditch);
}

// ================================================================== Vauban (1670s to 1700s)

/**
 * The bastioned front in the plot's frame. The curtain's scarp foot runs along z = CF. Bastions are
 * centred at x = c with flanks at c ± G (from the scarp foot out to the shoulders at z = SH) and faces
 * meeting at the salient (c, SH + K·G). The gate plot's two bastions sit at x = ±PLOT_C, so their inner
 * flanks are at ±10.2. Between every pair of bastions a ravelin (demi-lune) stands in the ditch in front
 * of the curtain: on the gate plot it covers the gate. The real fronts were three times as long (about
 * 350 m from salient to salient), the ditch much wider: everything is compressed to fit the town.
 *
 * The ditch is dug `depth` deep with walled sides: the brick scarp of the rampart and the counterscarp
 * opposite, which runs straight at z = cs and turns out round each bastion to keep W metres from its
 * faces. The dig reaches `behind` metres in under the rampart and under the covered way that runs along
 * the top of the counterscarp, behind its low crest, the glacis.
 */
export const VAUBAN = {
  CF: -0.6,
  SH: 3.0,
  G: 13,
  K: 0.6,
  PLOT_C: 10.2 + 13,
  spacing: 105,
  top: 6.2, // the terreplein behind the parapet
  cs: 7.6, // the counterscarp where it runs straight
  W: 3.0, // the ditch in front of a bastion's face
  depth: 3.2,
  behind: 2.0,
  cw: 2.0, // the covered way
  S: 9.4, // the salient of a corner bastion, on the diagonal
  // the brick scarp, battered, from the bottom of the ditch up to the stone cordon; then a parapet of turf
  scarp: [[-3.2 / 6, -3.2], [1.0, 6.0], [4.5, 6.0], [4.5, -3.2]] as XY[],
  parapet: [[1.05, 6.0], [1.5, 7.55], [3.9, 7.3], [4.6, 6.15]] as XY[],
  /** The ravelin: an island in the ditch whose brick sides rise from the bottom to the level of the field. */
  ravelin: { gorge: 2.4, half: 5.4, tip: 5.4 },
};

/** The line n·p = c parallel to the face p→q, moved w to its left (the outside of a trace). */
function faceLine(p: XY, q: XY, w: number): { n: XY; c: number } {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n: XY = [-(q[1] - p[1]) / L, (q[0] - p[0]) / L];
  return { n, c: n[0] * p[0] + n[1] * p[1] + w };
}
const zOn = (l: { n: XY; c: number }, x: number): number => (l.c - l.n[0] * x) / l.n[1];
const xOn = (l: { n: XY; c: number }, z: number): number => (l.c - l.n[1] * z) / l.n[0];
/** Where the line meets the diagonal x = z (a corner's line of symmetry). */
const dOn = (l: { n: XY; c: number }): number => l.c / (l.n[0] + l.n[1]);

// a bastion's left face (centred on x = 0), and the counterscarp line W in front of it
const BASTION_FACE: [XY, XY] = [[-VAUBAN.G, VAUBAN.SH], [0, VAUBAN.SH + VAUBAN.K * VAUBAN.G]];
const BASTION_CS = faceLine(...BASTION_FACE, VAUBAN.W);
/** The counterscarp leaves z = cs at c - G + BA and reaches its salient (c, BZ). */
const BA = xOn(BASTION_CS, VAUBAN.cs) + VAUBAN.G;
const BZ = zOn(BASTION_CS, 0);
// a corner bastion's face along the arm that arrives along -X (the corner's origin at x = 0); the
// half-bastion at the river end has its face on the same line
const CORNER_FACE: [XY, XY] = [[-VAUBAN.G, VAUBAN.SH], [VAUBAN.S, VAUBAN.S]];
const CORNER_CS = faceLine(...CORNER_FACE, VAUBAN.W);
/** The counterscarp turns out CB before a corner and crosses the corner's origin line at z = ZC. */
const CB = -xOn(CORNER_CS, VAUBAN.cs);
const ZC = zOn(CORNER_CS, 0);
const CSLOPE = -CORNER_CS.n[0] / CORNER_CS.n[1];
/** Where the half-bastion's face meets the river end (x = 0). */
const ZS = zOn(faceLine(...CORNER_FACE, 0), 0);

/**
 * Centres of the bastions of the stretch x0..x1. On the gate plot, its two; on a stretch the town draws
 * from a gate to a corner or the river, the gate's bastion and then evenly spaced ones short of the
 * bastion at the far end (which the corner or terminal piece draws).
 */
function bastionCentres(x0: number, x1: number): number[] {
  const { G, PLOT_C, spacing } = VAUBAN;
  const eps = 0.01;
  if (x0 >= -HALF - eps && x1 <= HALF + eps) return [-PLOT_C, PLOT_C].filter((c) => c + G > x0 && c - G < x1);
  if (Math.abs(x0 - HALF) < eps) {
    const L = x1 - PLOT_C;
    const n = Math.max(1, Math.round(L / spacing));
    return Array.from({ length: n }, (_, i) => PLOT_C + (i * L) / n);
  }
  if (Math.abs(x1 + HALF) < eps) {
    const L = -PLOT_C - x0;
    const n = Math.max(1, Math.round(L / spacing));
    return Array.from({ length: n }, (_, i) => -PLOT_C - ((n - 1 - i) * L) / n);
  }
  const L = x1 - x0;
  if (L < 60) return [];
  const n = Math.max(1, Math.round(L / spacing));
  return Array.from({ length: n }, (_, i) => x0 + ((i + 0.5) * L) / n);
}

/** Ravelins stand midway between neighbouring bastions (on the gate plot, in front of the gate). */
function ravelinCentres(cs: number[]): number[] {
  const s = [...cs].sort((a, c) => a - c);
  const res: number[] = [];
  for (let i = 0; i < s.length - 1; i++) if (s[i + 1] - s[i] > 2 * VAUBAN.G + 2 * VAUBAN.ravelin.half) res.push((s[i] + s[i + 1]) / 2);
  return res;
}

function bastionTrace(cs: number[], x0: number, x1: number): XY[] {
  const { CF, SH, G, K } = VAUBAN;
  const pts: XY[] = [[Math.min(x0, ...cs.map((c) => c - G)) - 3, CF]];
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G, CF], [c - G, SH], [c, SH + K * G], [c + G, SH], [c + G, CF]);
  pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 3, CF]);
  return pts;
}

/** The part of the segment p→q with x0 <= x <= x1, and which of its ends were cut. */
function clipSeg(p: XY, q: XY, x0: number, x1: number): { p: XY; q: XY; clipP: boolean; clipQ: boolean } | null {
  const eps = 1e-6;
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  if (Math.hypot(dx, dz) < eps) return null;
  if (Math.abs(dx) < eps) return p[0] < x0 - eps || p[0] > x1 + eps ? null : { p, q, clipP: false, clipQ: false };
  if (Math.max(p[0], q[0]) <= x0 + eps || Math.min(p[0], q[0]) >= x1 - eps) return null;
  const at = (x: number): XY => [x, p[1] + (dz * (x - p[0])) / dx];
  let a = p;
  let c = q;
  let clipP = false;
  let clipQ = false;
  if (dx > 0) {
    if (p[0] < x0) (a = at(x0)), (clipP = true);
    if (q[0] > x1) (c = at(x1)), (clipQ = true);
  } else {
    if (p[0] > x1) (a = at(x1)), (clipP = true);
    if (q[0] < x0) (c = at(x0)), (clipQ = true);
  }
  return { p: a, q: c, clipP, clipQ };
}

/** A polyline moved d to the left of travel (mitred at the bends). */
function offsetLine(pts: XY[], d: number): XY[] {
  const P = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-6);
  const nrm = (i: number): XY => {
    const dx = P[i + 1][0] - P[i][0];
    const dz = P[i + 1][1] - P[i][1];
    const L = Math.hypot(dx, dz);
    return [-dz / L, dx / L];
  };
  return P.map((p, i): XY => {
    if (i === 0 || i === P.length - 1) {
      const m = nrm(i === 0 ? 0 : i - 1);
      return [p[0] + m[0] * d, p[1] + m[1] * d];
    }
    const a = nrm(i - 1);
    const c = nrm(i);
    const k = 1 + a[0] * c[0] + a[1] * c[1];
    if (k < 1e-6) return [p[0] + c[0] * d, p[1] + c[1] * d];
    return [p[0] + ((a[0] + c[0]) * d) / k, p[1] + ((a[1] + c[1]) * d) / k];
  });
}

/**
 * Draw the runs of a trace (the polyline `pts`, outside to its left as it runs toward +X) with the given
 * scarp and parapet sections and a stone cordon at `cordon`, clipped to x0..x1.
 */
function scarpRuns(b: Builder, pts: XY[], x0: number, x1: number, o?: { scarp?: XY[]; parapet?: XY[]; cordon?: number }): void {
  const { brick, grass, stone } = WALL_COLOURS.vauban;
  const scarp = o?.scarp ?? VAUBAN.scarp;
  const parapet = o?.parapet ?? VAUBAN.parapet;
  const cy = o?.cordon ?? 6.0;
  const eps = 1e-6;
  for (let i = 0; i < pts.length - 1; i++) {
    const s = clipSeg(pts[i], pts[i + 1], x0, x1);
    if (!s) continue;
    const { p, q, clipP, clipQ } = s;
    const dx = q[0] - p[0];
    const dz = q[1] - p[1];
    const L = Math.hypot(dx, dz);
    const n: XY = [dz / L, -dx / L];
    run(b, p, q, n, scarp, brick, { clipP, clipQ });
    run(b, p, q, n, parapet, grass, { clipP, clipQ });
    // the stone cordon along the top of the scarp, cut square to X where clipped
    const u: XY = [dx / L, dz / L];
    const off = (r: XY, clip: boolean, isQ: boolean): [number, number, number] => {
      let x = r[0] + n[0] * 0.95;
      let z = r[1] + n[1] * 0.95;
      if (clip && Math.abs(u[0]) > eps) {
        const xt = r[0] + (isQ ? -1 : 1) * Math.sign(u[0]) * 0.22;
        const t = (xt - x) / u[0];
        x += u[0] * t;
        z += u[1] * t;
      }
      return [x, cy - 0.1, z];
    };
    b.beam(off(p, clipP, false), off(q, clipQ, true), 0.42, 0.4, stone, NJ);
  }
}

/** A stone sentry box (guérite) on a corbel, standing on the angle of a bastion. */
export function guerite(b: Builder, x: number, y: number, z: number, rotY: number): void {
  const stone = WALL_COLOURS.vauban.stone;
  b.group({ at: [x, y, z], rotY }, () => {
    b.cyl(0.25, 0.9, stone, { at: [0, -0.9, 0], segs: 8, rTop: 0.82, ...NJ }); // the cul-de-lampe
    b.cyl(0.78, 1.9, stone, { segs: 8, ...NJ });
    b.panel(0.16, 0.65, P.black, { at: [0, 1.0, 0.77], depth: 0.04 });
    b.panel(0.16, 0.65, P.black, { at: [0.77, 1.0, 0], facing: '+x', depth: 0.04 });
    b.panel(0.16, 0.65, P.black, { at: [-0.77, 1.0, 0], facing: '-x', depth: 0.04 });
    b.cyl(0.9, 0.16, stone, { at: [0, 1.9, 0], segs: 8, ...NJ });
    b.dome(0.82, stone, { at: [0, 2.06, 0], segs: 8, squash: 0.75, ...NJ });
    b.cone(0.1, 0.45, stone, { at: [0, 2.65, 0], segs: 5, ...NJ });
  });
}

/**
 * The counterscarp line of a stretch: straight at z = cs, turning out round each bastion so that the
 * ditch keeps W metres in front of its faces, and round the bastion of a corner or the river end at
 * x0 (`endLo`) or x1 (`endHi`). It runs on a little past both ends, for the dig.
 */
function counterscarpLine(cs: number[], x0: number, x1: number, endLo: boolean, endHi: boolean): XY[] {
  const { G, cs: z } = VAUBAN;
  const pts: XY[] = [];
  if (endLo) pts.push([x0 - 3, ZC + 3 * CSLOPE], [x0, ZC], [x0 + CB, z]);
  else pts.push([Math.min(x0, ...cs.map((c) => c - G)) - 3, z]);
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G + BA, z], [c, BZ], [c + G - BA, z]);
  if (endHi) pts.push([x1 - CB, z], [x1, ZC], [x1 + 3, ZC + 3 * CSLOPE]);
  else pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 3, z]);
  return pts;
}

/**
 * Along a counterscarp line (outside to its left), clipped to x0..x1: the brick revetment from the
 * bottom of the ditch to a stone coping level with the ground; behind it the covered way, a path of
 * gravel; and beyond that the crest of the glacis, a low bank of turf that slopes away to the field.
 * `gaps` are x ranges where the glacis is cut for a road (the covered way and the revetment carry on,
 * level with the road).
 */
export function counterscarpWorks(b: Builder, line: XY[], x0: number, x1: number, o?: { gaps?: [number, number][] }): void {
  const { brick, stone, grass, path } = WALL_COLOURS.vauban;
  const { depth: D, cw } = VAUBAN;
  const revet: XY[] = [[0, -D], [0, 0], [0.6, 0], [0.6, -D]];
  const coping: XY[] = [[0, 0], [0, 0.1], [0.6, 0.1], [0.6, 0]];
  const way: XY[] = [[0.6, -D], [0.6, 0.08], [cw + 0.1, 0.08], [cw + 0.1, -D]];
  const glacis: XY[] = [[cw, 0], [cw + 0.3, 0.9], [cw + 0.9, 1.0], [cw + 4.5, 0]];
  const gaps = [...(o?.gaps ?? [])].sort((a, c) => a[0] - c[0]);
  const ranges: [number, number][] = [];
  let a = x0;
  for (const [g0, g1] of gaps) {
    if (g0 > a) ranges.push([a, Math.min(g0, x1)]);
    a = Math.max(a, g1);
  }
  if (x1 > a) ranges.push([a, x1]);
  const normal = (p: XY, q: XY): XY => {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [-(q[1] - p[1]) / L, (q[0] - p[0]) / L];
  };
  for (let i = 0; i < line.length - 1; i++) {
    const s = clipSeg(line[i], line[i + 1], x0, x1);
    if (!s) continue;
    const out = normal(s.p, s.q);
    const o2 = { clipP: s.clipP, clipQ: s.clipQ };
    run(b, s.p, s.q, out, revet, brick, o2);
    run(b, s.p, s.q, out, coping, stone, o2);
    run(b, s.p, s.q, out, way, path, o2);
    for (const [r0, r1] of ranges) {
      const g = clipSeg(line[i], line[i + 1], r0, r1);
      if (g) run(b, g.p, g.q, out, glacis, grass, { clipP: g.clipP, clipQ: g.clipQ });
    }
  }
  // where the line bends away from the ditch the runs part on the outside: fill the angle with a turned piece
  for (let i = 1; i < line.length - 1; i++) {
    const v = line[i];
    if (v[0] <= x0 + 1e-6 || v[0] >= x1 - 1e-6) continue;
    const n1 = normal(line[i - 1], v);
    const n2 = normal(v, line[i + 1]);
    const cross = n1[0] * n2[1] - n1[1] * n2[0];
    if (cross > -1e-6) continue;
    const start = Math.atan2(n1[0], n1[1]);
    let sweep = Math.atan2(n2[0], n2[1]) - start;
    while (sweep < 0) sweep += Math.PI * 2;
    const q = { segs: 4, start, sweep, ...NJ };
    const inGap = gaps.some(([g0, g1]) => v[0] > g0 && v[0] < g1);
    b.group({ at: [v[0], 0, v[1]] }, () => {
      b.lathe([[0.6, -D], [0.6, 0.1], [0.001, 0.1]], stone, q);
      b.lathe([[cw + 0.1, -D], [cw + 0.1, 0.08], [0.6, 0.08]], path, q);
      if (!inGap) b.lathe([...glacis].reverse(), grass, q);
    });
  }
}

/**
 * The outline of the ditch between a scarp trace and a counterscarp line, reaching `behind` metres in
 * under each, clipped to xa..xb and dug. Ends listed open carry on into the next cut.
 */
function vaubanDitch(b: Builder, trace: XY[], line: XY[], xa: number, xb: number, openLo: boolean, openHi: boolean): void {
  const { depth, behind, cw } = VAUBAN;
  const poly = clipPolyX([...offsetLine(trace, -behind), ...offsetLine(line, cw).reverse()], xa, xb);
  if (poly.length < 3) return;
  const on = (x: number, v: number) => Math.abs(x - v) < 1e-4;
  const open: number[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    if ((openLo && on(p[0], xa) && on(q[0], xa)) || (openHi && on(p[0], xb) && on(q[0], xb))) open.push(i);
  });
  b.dig(poly, depth, { slope: behind, color: WALL_COLOURS.vauban.ditch, open });
}

/**
 * The ravelin (demi-lune) centred at x = c: a triangular island in the ditch, its two faces meeting at
 * a point toward the field. Its brick sides rise from the bottom of the ditch to a stone cordon level
 * with the field; a parapet of turf runs along the faces, cut for the road where `road` is given (its
 * half-width). The gorge toward the curtain is open. Clipped to x0..x1.
 */
export function ravelin(b: Builder, c: number, x0: number, x1: number, o?: { road?: number }): void {
  const { brick, stone, grass } = WALL_COLOURS.vauban;
  const { gorge, half, tip } = VAUBAN.ravelin;
  const D = VAUBAN.depth;
  const tri = clipPolyX([[c - half, gorge], [c, tip], [c + half, gorge]], x0, x1);
  if (tri.length < 3) return;
  slab(b, tri, -D, -0.15, brick);
  slab(b, tri, -0.15, 0.06, stone);
  const inner = clipPolyX([[c - half + 1.1, gorge + 0.3], [c, tip - 0.7], [c + half - 1.1, gorge + 0.3]], x0, x1);
  if (inner.length > 2) slab(b, inner, 0.06, 0.1, grass);
  const parapet: XY[] = [[0.5, 0.06], [1.0, 1.6], [2.0, 1.5], [2.6, 0.06]];
  const road = o?.road ?? 0;
  const ranges: [number, number][] = road ? [[x0, Math.min(x1, c - road)], [Math.max(x0, c + road), x1]] : [[x0, x1]];
  const faces: [XY, XY][] = [[[c - half, gorge], [c, tip]], [[c, tip], [c + half, gorge]]];
  for (const [r0, r1] of ranges) {
    if (r1 - r0 < 0.05) continue;
    for (const [p, q] of faces) {
      const s = clipSeg(p, q, r0, r1);
      if (!s) continue;
      const L = Math.hypot(s.q[0] - s.p[0], s.q[1] - s.p[1]);
      run(b, s.p, s.q, [(s.q[1] - s.p[1]) / L, -(s.q[0] - s.p[0]) / L], parapet, grass, { clipP: s.clipP, clipQ: s.clipQ });
    }
  }
}

/**
 * A stretch of the bastioned front from x0 to x1. On the gate plot (both ends within it) the ditch is
 * closed at the plot's edges and open toward the gate, whose model digs the middle. A stretch the town
 * draws digs 2 m on into the gate plot it leaves, so that the two cuts overlap and the plot's closed end
 * disappears; at a corner or the river its scarp stops at the flank of the bastion the corner or terminal
 * piece draws. `surviving`: the gate at x1 = -HALF has gone (the north gate after 1885), so the stretch
 * closes its own ditch there.
 */
function vaubanStretch(b: Builder, x0: number, x1: number, o?: { ravelins?: boolean; surviving?: boolean }): void {
  const { grass } = WALL_COLOURS.vauban;
  const { G, SH, K, top, depth: D } = VAUBAN;
  const eps = 0.01;
  const plot = x0 >= -HALF - eps && x1 <= HALF + eps;
  const gateLo = !plot && Math.abs(x0 - HALF) < eps;
  const gateHi = !plot && Math.abs(x1 + HALF) < eps;
  const endLo = !plot && !gateLo;
  const endHi = !plot && !gateHi;
  const cs = bastionCentres(x0, x1);
  const trace = bastionTrace(cs, x0, x1);
  scarpRuns(b, trace, x0 + (endLo ? G : 0), x1 - (endHi ? G : 0));
  // the terreplein: one fill behind the curtain, and one inside each bastion, built up from the bottom of the ditch
  const ta = x0 + (endLo ? 6 : 0);
  const tb = x1 - (endHi ? 6 : 0);
  if (tb > ta) slab(b, [[ta, -1.5], [tb, -1.5], [tb, -6.0], [ta, -6.0]], -D, top, grass);
  for (const c of cs) {
    const poly = clipPolyX([[c - G + 1, -1.5], [c - G + 1, SH - 0.4], [c, SH + K * G - 1.9], [c + G - 1, SH - 0.4], [c + G - 1, -1.5]], x0, x1);
    if (poly.length > 2) slab(b, poly, -D, top, grass);
    if (c >= x0 && c <= x1) guerite(b, c, 6.3, SH + K * G - 0.75, 0);
  }
  if (o?.ravelins !== false) {
    const all = [...cs, ...(endLo ? [x0] : []), ...(endHi ? [x1] : [])];
    for (const r of ravelinCentres(all)) if (r + VAUBAN.ravelin.half > x0 && r - VAUBAN.ravelin.half < x1) ravelin(b, r, x0, x1);
  }
  // the inner slope down to the town
  prismX(b, x0, x1, [[-6.0, top], [-8, 0], [-6.0, 0]], tint(grass, -0.04));
  const line = counterscarpLine(cs, x0, x1, endLo, endHi);
  counterscarpWorks(b, line, x0, x1);
  const closeLo = plot && Math.abs(x0 + HALF) < eps;
  const closeHi = (plot && Math.abs(x1 - HALF) < eps) || (gateHi && !!o?.surviving);
  vaubanDitch(b, trace, line, gateLo ? x0 - 2 : x0, gateHi && !o?.surviving ? x1 + 2 : x1, !closeLo, !closeHi);
}

function vaubanCorner(b: Builder): void {
  const { CF, SH, top, G, S, depth: D, behind, W, cw } = VAUBAN;
  const { grass, ditch } = WALL_COLOURS.vauban;
  scarpRuns(b, [[-G, CF], [-G, SH], [S, S], [SH, -G], [CF, -G]], -1e9, 1e9);
  // the fill, taking in the inner angle of the two stretches' terrepleins
  slab(b, [[-G + 1, -1.5], [-G + 1, SH - 0.4], [S - 2.2, S - 2.2], [SH - 0.4, -G + 1], [-1.5, -G + 1], [-1.5, -6], [-6, -6], [-6, -1.5]], -D, top, grass);
  guerite(b, S - 0.6, 6.3, S - 0.6, Math.PI / 4);
  // the counterscarp round the salient
  const dc = dOn(CORNER_CS);
  counterscarpWorks(b, [[0, ZC], [dc, dc], [ZC, 0]], -1e9, 1e9);
  // the ditch in the outer quadrant; the stretches dig the rest up to the origin
  const inn = faceLine(...CORNER_FACE, -behind);
  const out = faceLine(...CORNER_FACE, W + cw);
  const zi = zOn(inn, 0);
  const zo = zOn(out, 0);
  b.dig([[0, zi], [0, zo], [dOn(out), dOn(out)], [zo, 0], [zi, 0], [dOn(inn), dOn(inn)]], D, { slope: behind, color: ditch, open: [0, 3] });
}

/**
 * The end of the bastioned front on the river bank: a half-bastion whose face ends on the bank, the
 * ditch carried on into the river. sx = 1 for a stretch arriving along -X, -1 for one arriving along +X.
 */
function vaubanTerminal(b: Builder, sx: number): void {
  const { CF, SH, top, G, depth: D, behind, W, cw } = VAUBAN;
  const { grass, ditch } = WALL_COLOURS.vauban;
  const mx = (pts: XY[]): XY[] => pts.map(([x, z]) => [sx * x, z] as XY);
  // the flank and face, then the end on the bank, walled but with no parapet
  const trace = mx([[-G, CF], [-G, SH], [0, ZS]]);
  const end = mx([[0, ZS], [0, CF - 0.01]]);
  scarpRuns(b, sx > 0 ? trace : trace.reverse(), -1e9, 1e9);
  scarpRuns(b, sx > 0 ? end : end.reverse(), -1e9, 1e9, { parapet: [] });
  slab(b, mx([[-G + 1, -1.5], [-G + 1, SH - 0.4], [-1.0, ZS - 1.6], [-1.0, CF], [0, CF], [0, -6], [-6, -6], [-6, -1.5]]), -D, top, grass);
  const R = RIVER_RUN;
  const line = mx([[0, ZC], [R, ZC + R * CSLOPE]]);
  counterscarpWorks(b, sx > 0 ? line : line.reverse(), -1e9, 1e9);
  const zi = zOn(faceLine(...CORNER_FACE, -behind), 0);
  const zo = zOn(faceLine(...CORNER_FACE, W + cw), 0);
  b.dig(mx([[0, zi], [0, zo], [R, zo + R * CSLOPE], [R, zi]]), D, { slope: behind, color: ditch, open: [0, 2] });
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
    case 'gaulish':
      return gaulishStretch(b, x0, x1);
    case 'castrum':
      return castrumStretch(b, x0, x1, towers, detail);
    case 'philippian':
      return philipStretch(b, x0, x1, towers, false);
    case 'fortified':
      return philipStretch(b, x0, x1, towers, true);
    case 'vauban':
      return vaubanStretch(b, x0, x1, { ravelins: towers });
    case 'vauban-surviving':
      return vaubanStretch(b, x0, x1, { ravelins: towers, surviving: true });
  }
}

/**
 * A corner piece centred on the origin, where a stretch arriving along -X (its outside to +Z) meets a
 * stretch arriving along -Z (its outside to +X): the outside of the corner is the +X, +Z quadrant.
 * Both stretches should run up to the origin.
 */
export function corner(b: Builder, stage: WallStage): void {
  switch (stage) {
    case 'gaulish':
      return gaulishCorner(b);
    case 'castrum':
      return castrumTower(b, 1.2, 1.2, 3.5, 12.6, { windows: [-0.3, Math.PI / 4, Math.PI / 2 + 0.3] });
    case 'philippian':
      return philipCorner(b, false);
    case 'fortified':
      return philipCorner(b, true);
    case 'vauban':
    case 'vauban-surviving':
      return vaubanCorner(b);
  }
}

/**
 * A terminal piece centred on the origin for where a stretch simply ends (at the river bank), outside
 * to +Z. sx = 1 (the default) for a stretch arriving along -X, -1 for one arriving along +X (the mirror
 * image). The ditch runs on past the origin into the river.
 */
export function terminal(b: Builder, stage: WallStage, sx: 1 | -1 = 1): void {
  switch (stage) {
    case 'gaulish':
      return gaulishTerminal(b, sx);
    case 'castrum':
      return castrumTower(b, 0, 1.0, 3.2, 12.2, { windows: [0, sx * (Math.PI / 2), sx * 1.0] });
    case 'philippian':
      return philipTerminal(b, false, sx);
    case 'fortified':
      return philipTerminal(b, true, sx);
    case 'vauban':
    case 'vauban-surviving':
      return vaubanTerminal(b, sx);
  }
}

/** Colours re-exported for the gate plots. */
export { WALL_COLOURS, mix };
