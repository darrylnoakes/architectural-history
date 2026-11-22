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

export type WallStage = 'gaulish' | 'castrum' | 'philippian' | 'fortified' | 'vauban';

/** For walk collisions: the z of the wall's centre line and its thickness at ground level, per stage; height of the top of the defences. */
export const CURTAIN: Record<WallStage, { z: number; thick: number; height: number }> = {
  gaulish: { z: -3.3, thick: 8.6, height: 5.7 }, // stone face at +1.0 to the toe of the earth ramp at -7.6
  castrum: { z: 0, thick: 3.9, height: 9.8 }, // footing of reused blocks 3.9, the wall itself 3.6
  philippian: { z: -3.5, thick: 3.2, height: 9.8 }, // battered foot 3.2, the wall 2.6
  fortified: { z: -3.5, thick: 3.2, height: 9.8 },
  vauban: { z: -4.3, thick: 7.4, height: 7.6 }, // scarp foot at -0.6 to the foot of the inner slope at -8
};

/** Grid positions k·step + off that fall inside a..b (with a margin). */
function grid(a: number, c: number, step: number, off = 0, margin = 0.15): number[] {
  const xs: number[] = [];
  for (let k = Math.ceil((a + margin - off) / step); k * step + off <= c - margin; k++) xs.push(k * step + off);
  return xs;
}

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
    prismX(b, x0, x1, [[ditch[0], 0.02], [ditch[0] + 1.3, 0.02]], tint(c.ditch, 0.07));
    prismX(b, x0, x1, [[ditch[0] + 1.3, 0.03], [ditch[1] - 1.3, 0.03]], c.ditch);
    prismX(b, x0, x1, [[ditch[1] - 1.3, 0.02], [ditch[1], 0.02]], tint(c.ditch, 0.07));
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
  b.lathe([[ditch[0], 0.02], [ditch[0] + 1.3, 0.02]], tint(c.ditch, 0.06), q);
  b.lathe([[ditch[0] + 1.3, 0.03], [ditch[1] - 1.3, 0.03]], c.ditch, q);
  b.lathe([[ditch[1] - 1.3, 0.02], [ditch[1], 0.02]], tint(c.ditch, 0.06), q);
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

function gaulishTerminal(b: Builder): void {
  const c = WALL_COLOURS.gaulish;
  const { face, h, top, toe } = GAULISH;
  // the stone face returns round the end of the core; the ramp ends in a slope of earth
  b.box(0.7, h, face - top + 0.7, c.stone, { at: [0.35, 0, (face + top) / 2 - 0.35 + 0.35], ...NJ });
  const ends: number[] = [];
  GAULISH.rows.forEach((y, i) => {
    for (let z = top + (i % 2 ? 0.4 : 1.2); z < face - 0.2; z += 1.6) {
      quad(ends, [0.712, y, z - 0.13], [0.712, y, z + 0.13], [0.712, y + 0.26, z + 0.13], [0.712, y + 0.26, z - 0.13]);
    }
  });
  soup(b, ends, c.beam);
  b.group({ at: [0.02, 0, 0], rotY: Math.PI / 2 }, () => b.extrude([[-top, h], [-toe, 0], [-top + 0.01, 0]], 0.04, c.earth, NJ));
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
 */
export const PHILIP = { z: -3.5, t: 2.6, h: 8.0, spacing: 60, tower: { r: 3.0, h: 12.0, z: -1.7 }, ditch: [2.0, 7.2] as [number, number] };

function philipStretch(b: Builder, x0: number, x1: number, towers: boolean, late: boolean): void {
  const { stone, dress, ditch } = WALL_COLOURS.philippian;
  const { z, t, h } = PHILIP;
  const WF = z + t / 2;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, h, t, stone, { at: [xc, 0, z], ...NJ });
  b.box(L, 1.1, t + 0.6, tint(stone, -0.06), { at: [xc, 0, z], ...NJ }); // battered foot
  b.box(L, 0.18, t + 0.1, dress, { at: [xc, h - 0.18, z], ...NJ }); // string course at the walk
  // course lines on the field face
  const lines: number[] = [];
  for (const y of [2.4, 3.6, 4.8, 6.0]) quad(lines, [x0, y, WF + 0.01], [x1, y, WF + 0.01], [x1, y + 0.05, WF + 0.01], [x0, y + 0.05, WF + 0.01]);
  soup(b, lines, tint(stone, -0.14));
  const xs = towers ? evenly(x0, x1, PHILIP.spacing) : [];
  for (const [a, c] of gaps(x0, x1, xs, PHILIP.tower.r - 0.3)) merlonsX(b, a, c, h, WF - 0.25, stone, { w: 1.1, h: 1.8, t: 0.5, gap: 0.75 });
  b.box(L, 0.8, 0.4, stone, { at: [xc, h, z - t / 2 + 0.2], ...NJ });
  for (const x of xs) philipTower(b, x, PHILIP.tower.z, PHILIP.tower.r, PHILIP.tower.h, { roof: late, guns: late });
  // the dry ditch, and the low stone lip of its counterscarp
  const [d0, d1] = PHILIP.ditch;
  prismX(b, x0, x1, [[d0, 0.02], [d0 + 1.2, 0.02]], tint(ditch, 0.05));
  prismX(b, x0, x1, [[d0 + 1.2, 0.03], [d1 - 1.0, 0.03]], ditch);
  prismX(b, x0, x1, [[d1 - 1.0, 0.02], [d1, 0.02]], tint(ditch, 0.05));
  b.box(L, 0.45, 0.5, tint(stone, -0.04), { at: [xc, 0, d1 + 0.25], ...NJ });
}

/**
 * A round tower of Philip Augustus's pattern, centred at (x, z): a battered foot, tall arrow loops,
 * a crenellated top. Options for the later Middle Ages: `roof` (a steep conical roof of slate),
 * `machi` (a parapet carried out on corbels, with holes between them: machicolations), `guns`
 * (keyhole gunports low down), `h` raised.
 */
export function philipTower(b: Builder, x: number, z: number, r: number, h: number, o?: { roof?: boolean; machi?: boolean; guns?: boolean; loops?: number[] }): void {
  const { stone, dress, roof } = WALL_COLOURS.philippian;
  const segs = 16;
  b.group({ at: [x, 0, z] }, () => {
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

function philipCorner(b: Builder, late: boolean): void {
  const { ditch, stone } = WALL_COLOURS.philippian;
  const [d0, d1] = PHILIP.ditch;
  const q = { segs: 6, start: 0, sweep: Math.PI / 2, ...NJ };
  philipTower(b, -2.0, -2.0, 4.1, 13.0, { roof: late, guns: late, loops: [-0.2, 0.78, 1.77] });
  b.lathe([[d0, 0.02], [d0 + 1.2, 0.02]], tint(ditch, 0.05), q);
  b.lathe([[d0 + 1.2, 0.03], [d1 - 1.0, 0.03]], ditch, q);
  b.lathe([[d1 - 1.0, 0.02], [d1, 0.02]], tint(ditch, 0.05), q);
  b.lathe([[d1, 0], [d1, 0.45], [d1 + 0.5, 0.45], [d1 + 0.5, 0]], tint(stone, -0.04), q);
}

function philipTerminal(b: Builder, late: boolean): void {
  philipTower(b, 0, -2.5, 3.4, 12.5, { roof: late, guns: late, loops: [-0.6, 0.5, 1.6] });
}

// ================================================================== Vauban (1670s to 1700s)

/**
 * The bastioned front in the plot's frame. The curtain's scarp foot runs along z = CF. Bastions are
 * centred at x = c with flanks at c ± G (from the scarp foot out to the shoulders at z = SH) and faces
 * meeting at the salient (c, SH + K·G). The gate plot's two bastions sit at x = ±PLOT_C, so their inner
 * flanks are at ±11.5. Between every pair of bastions a ravelin (demi-lune) stands in the ditch in front
 * of the curtain: on the gate plot it covers the gate. The real fronts were three times as long (about
 * 350 m from salient to salient), the ditch much wider: everything is compressed to fit the town.
 */
export const VAUBAN = {
  CF: -0.6,
  SH: 3.0,
  G: 13,
  K: 0.6,
  PLOT_C: 11.5 + 13,
  spacing: 105,
  top: 6.2, // the terreplein behind the parapet
  cs: 7.7, // the counterscarp wall
  // the brick scarp, battered, up to the stone cordon; then a parapet of turf
  scarp: [[0, 0], [1.0, 6.0], [4.5, 6.0], [4.5, 0]] as XY[],
  parapet: [[1.05, 6.0], [1.5, 7.55], [3.9, 7.3], [4.6, 6.15]] as XY[],
  ravelin: { gorge: 2.4, half: 5.6, tip: 7.4, h: 4.2 },
};

/** Centres of the bastions that touch the stretch x0..x1. */
function bastionCentres(x0: number, x1: number): number[] {
  const { G, PLOT_C, spacing } = VAUBAN;
  const eps = 0.01;
  if (x0 >= -HALF - eps && x1 <= HALF + eps) return [-PLOT_C, PLOT_C].filter((c) => c + G > x0 && c - G < x1);
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
  const pts: XY[] = [[Math.min(x0, ...cs.map((c) => c - G)) - 1, CF]];
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G, CF], [c - G, SH], [c, SH + K * G], [c + G, SH], [c + G, CF]);
  pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 1, CF]);
  return pts;
}

/**
 * Draw the runs of a trace (the polyline `pts`, outside to its left as it runs toward +X) with the given
 * scarp and parapet sections and a stone cordon at `cordon`, clipped to x0..x1.
 */
function scarpRuns(b: Builder, pts: XY[], x0: number, x1: number, o?: { scarp?: XY[]; parapet?: XY[]; cordon?: number }): void {
  const { brick, grass, stone } = { ...WALL_COLOURS.vauban };
  const scarp = o?.scarp ?? VAUBAN.scarp;
  const parapet = o?.parapet ?? VAUBAN.parapet;
  const cy = o?.cordon ?? 6.0;
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

/** The counterscarp line, bulging round each bastion so the ditch follows its faces. */
function counterscarpLine(cs: number[], x0: number, x1: number): XY[] {
  const { G, cs: z, SH, K } = VAUBAN;
  const sal = SH + K * G;
  const pts: XY[] = [[Math.min(x0, ...cs.map((c) => c - G)) - 1, z]];
  for (const c of [...cs].sort((a, d) => a - d)) pts.push([c - G + 7.5, z], [c, sal + 3.6], [c + G - 7.5, z]);
  pts.push([Math.max(x1, ...cs.map((c) => c + G)) + 1, z]);
  return clipX(pts, x0, x1);
}

function counterscarp(b: Builder, line: XY[]): void {
  const { brick, ditch, stone } = WALL_COLOURS.vauban;
  for (let i = 0; i < line.length - 1; i++) {
    segBox(b, line[i], line[i + 1], 0.6, 0.9, brick);
    segBox(b, line[i], line[i + 1], 0.7, 0.14, stone, 0.9);
  }
  if (line.length > 1) slab(b, [[line[0][0], VAUBAN.CF + 0.2], [line[line.length - 1][0], VAUBAN.CF + 0.2], ...[...line].reverse().map(([x, z]) => [x, z - 0.3] as XY)], 0, 0.03, ditch);
}

/**
 * The ravelin (demi-lune) centred at x = c: a low triangle of brick-faced earth in the ditch, its two
 * faces meeting at a point toward the field, clipped to x0..x1.
 */
export function ravelin(b: Builder, c: number, x0: number, x1: number): void {
  const { grass } = WALL_COLOURS.vauban;
  const { gorge, half, tip, h } = VAUBAN.ravelin;
  const scarp: XY[] = [[0, 0], [0.7, h - 0.2], [2.6, h - 0.2], [2.6, 0]];
  const parapet: XY[] = [[0.75, h - 0.2], [1.1, h + 0.9], [2.4, h + 0.75], [2.9, h - 0.1]];
  // faces drawn from the left shoulder to the tip to the right shoulder, outside to the left of travel
  scarpRuns(b, [[c - half, gorge], [c, tip], [c + half, gorge]], x0, x1, { scarp, parapet, cordon: h - 0.2 });
  const fill = clipPolyX([[c - half + 1.6, gorge + 0.3], [c, tip - 2.4], [c + half - 1.6, gorge + 0.3]], x0, x1);
  if (fill.length > 2) slab(b, fill, 0, h - 0.15, grass);
  // the open gorge toward the curtain: a low brick wall
  const gx0 = Math.max(x0, c - half + 0.2);
  const gx1 = Math.min(x1, c + half - 0.2);
  if (gx1 - gx0 > 0.2) b.box(gx1 - gx0, 1.3, 0.5, WALL_COLOURS.vauban.brick, { at: [(gx0 + gx1) / 2, 0, gorge + 0.25], ...NJ });
}

function vaubanStretch(b: Builder, x0: number, x1: number, o?: { ravelins?: boolean }): void {
  const { grass } = WALL_COLOURS.vauban;
  const { G, SH, K, top } = VAUBAN;
  const cs = bastionCentres(x0, x1);
  scarpRuns(b, bastionTrace(cs, x0, x1), x0, x1);
  // the terreplein: one fill behind the curtain, and one inside each bastion
  slab(b, [[x0, -1.5], [x1, -1.5], [x1, -6.0], [x0, -6.0]], 0, top, grass);
  for (const c of cs) {
    const poly = clipPolyX([[c - G + 1, -1.5], [c - G + 1, SH - 0.4], [c, SH + K * G - 1.9], [c + G - 1, SH - 0.4], [c + G - 1, -1.5]], x0, x1);
    if (poly.length > 2) slab(b, poly, 0, top, grass);
    if (c >= x0 && c <= x1) guerite(b, c, 6.3, SH + K * G - 0.75, 0);
  }
  if (o?.ravelins !== false) for (const r of ravelinCentres(cs)) if (r + VAUBAN.ravelin.half > x0 && r - VAUBAN.ravelin.half < x1) ravelin(b, r, x0, x1);
  // the inner slope down to the town
  prismX(b, x0, x1, [[-6.0, top], [-8, 0], [-6.0, 0]], tint(grass, -0.04));
  counterscarp(b, counterscarpLine(cs, x0, x1));
}

function vaubanCorner(b: Builder): void {
  const { CF, SH, top, cs } = VAUBAN;
  const { grass, ditch, brick, stone } = WALL_COLOURS.vauban;
  const G = 13;
  const S = 9.4; // the salient lies on the diagonal
  scarpRuns(b, [[-G, CF], [-G, SH], [S, S], [SH, -G], [CF, -G]], -1e9, 1e9);
  slab(b, [[-G + 1, -1.5], [-G + 1, SH - 0.4], [S - 2.2, S - 2.2], [SH - 0.4, -G + 1], [-1.5, -G + 1], [-1.5, -1.5]], 0, top, grass);
  guerite(b, S - 0.6, 6.3, S - 0.6, Math.PI / 4);
  const line: XY[] = [[0, cs], [S + 3.6, S + 3.6], [cs, 0]];
  for (let i = 0; i < 2; i++) {
    segBox(b, line[i], line[i + 1], 0.6, 0.9, brick);
    segBox(b, line[i], line[i + 1], 0.7, 0.14, stone, 0.9);
  }
  slab(b, [[0, 0], [0, cs - 0.3], [S + 3.3, S + 3.3], [cs - 0.3, 0]], 0, 0.03, ditch);
}

function vaubanTerminal(b: Builder): void {
  const { CF, SH, top } = VAUBAN;
  const { grass } = WALL_COLOURS.vauban;
  const G = 13;
  const ZS = 6.6; // a half-bastion whose face ends on the river bank
  scarpRuns(b, [[-G, CF], [-G, SH], [0, ZS], [0, CF - 0.01]], -1e9, 1e9);
  slab(b, [[-G + 1, -1.5], [-G + 1, SH - 0.4], [-1.0, ZS - 1.6], [-1.0, -1.5]], 0, top, grass);
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
      return vaubanCorner(b);
  }
}

/** A terminal piece centred on the origin for where a stretch arriving along -X simply ends (at the river bank). */
export function terminal(b: Builder, stage: WallStage): void {
  switch (stage) {
    case 'gaulish':
      return gaulishTerminal(b);
    case 'castrum':
      return castrumTower(b, 0, 1.0, 3.2, 12.2, { windows: [0, Math.PI / 2, 1.0] });
    case 'philippian':
      return philipTerminal(b, false);
    case 'fortified':
      return philipTerminal(b, true);
    case 'vauban':
      return vaubanTerminal(b);
  }
}

/** Colours re-exported for the gate plots. */
export { WALL_COLOURS, mix };
