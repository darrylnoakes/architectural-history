import { P, tint, type BuildingDef } from '@ah/kit';
import { PW, patch, washing } from './shared';

const W = 22; // block along the street
const ZF = 5.2; // street front
const ZB = -5.6; // back
const D = ZF - ZB;
const ZC = (ZF + ZB) / 2;
const BAYS = 7;
const BP = W / BAYS;
/** storeys: base y, height, window w, window h, window sill above floor */
const FL: [number, number, number, number, number][] = [
  [0, 4.4, 0, 0, 0], // shops with mezzanines
  [4.4, 3.4, 1.15, 1.6, 0.8], // the best flats, behind the balcony
  [7.8, 3.1, 1.0, 1.35, 0.85],
  [10.9, 2.9, 0.9, 1.15, 0.85],
  [13.8, 2.6, 0.6, 0.8, 0.95], // garrets: the cheapest rooms
];
const TOP = 16.4;

export const insula: BuildingDef = {
  id: 'insula',
  name: 'Insula',
  style: 'Roman Imperial',
  date: 'c. AD 60 to 150',
  summary:
    'Under the empire most townspeople rented rooms in an insula, a block of flats of five storeys or so built in concrete faced with brick, which could be raised higher and burnt less than the timber-framed blocks before it. ' +
    'Shops with mezzanines filled the street front; the best flats, on the first floor, had a balcony on stone brackets, and rents fell as you climbed, so the poorest lived under the roof in small rooms that were the last to escape a fire. ' +
    'There was no running water above the ground floor, and tenants carried it upstairs from the street fountain. Augustus limited street fronts to 70 Roman feet, about 21 metres, and Trajan to 60.',
  materials: ['concrete faced with brick (opus testaceum)', 'travertine brackets and thresholds', 'timber floors and balconies', 'fired roof tiles'],
  modelledOn: 'The insulae of Ostia (House of Diana, 2nd century AD) and the Insula dell’Ara Coeli, Rome',
  lookFor: [
    { label: 'Brick-faced concrete', note: 'A core of concrete faced with neat triangular bricks; string courses of brick mark each floor.', at: [-9.5, 9.4, ZF + 0.1] },
    { label: 'Balcony on travertine brackets', note: 'A long balcony (maenianum) runs along the first floor on stone corbels, as on the House of Diana at Ostia.', at: [-4.8, 4.0, ZF + 1.2] },
    { label: 'Shops with mezzanines', note: 'Each shop has a wide doorway and a small window above it lighting the loft where its keeper lived.', at: [-8.0, 2.0, ZF + 0.2] },
    { label: 'Stair from the street', note: 'Stairs rose straight from the street to the flats, so tenants never passed through the shops.', at: [11.6, 3.0, 1.0] },
    { label: 'Garrets under the roof', note: 'The top storey has the smallest windows and the flimsiest timber balconies: the cheapest rooms, and the most dangerous in a fire.', at: [3.1, 15.2, ZF + 0.9] },
  ],
  influences: ['roman-concrete'],
  build(b) {
    const brick = b.pick([P.brickOrange, tint(P.brickOrange, -0.04), P.cotto, tint(P.cotto, 0.03)]);
    const course = tint(brick, -0.1);
    const lintel = tint(brick, -0.16);
    const roof = b.pick([P.romanTile, tint(P.romanTile, -0.04)]);
    const trav = P.travertine;

    // pavement in front, a cobbled lane behind
    patch(b, PW, 8 - ZF, P.paving, [0, (ZF + 8) / 2], 0.15);
    b.box(PW, 0.18, 0.25, trav, { at: [0, 0, 7.75] });
    patch(b, PW, 8 + ZB, tint(P.cobble, 0.06), [0, (ZB - 8) / 2], 0.03);

    // the block
    b.box(W, TOP, D, brick, { at: [0, 0, ZC] });
    for (const [y] of FL.slice(1)) b.box(W + 0.12, 0.18, D + 0.12, course, { at: [0, y - 0.1, ZC] });
    b.box(W + 0.4, 0.3, D + 0.4, course, { at: [0, TOP - 0.3, ZC] }); // eaves cornice
    // a low hipped roof of tegulae and imbrices
    const rh = (D / 2 + 0.5) * Math.tan((20 * Math.PI) / 180);
    b.hip(W + 1.0, D + 1.0, rh, roof, { at: [0, TOP - 0.05, ZC] });
    b.box(W - D + 0.1, 0.16, 0.2, tint(roof, -0.08), { at: [0, TOP - 0.05 + rh - 0.04, ZC] });

    // ground floor: six shops and the entrance to a stair in the middle bay
    for (let i = 0; i < BAYS; i++) {
      const x = -W / 2 + (i + 0.5) * BP;
      if (i === 3) {
        // the main doorway: brick pilasters and a little pediment, a door with bronze studs
        b.panel(1.8, 3.0, P.timberBlack, { at: [x, 0.15, ZF], facing: '+z', depth: 0.02 });
        b.panel(1.6, 2.8, P.oakDark, { at: [x, 0.15, ZF], facing: '+z', depth: 0.05 });
        for (const s of [-1, 1]) b.box(0.35, 3.3, 0.25, tint(brick, 0.05), { at: [x + s * 1.1, 0, ZF + 0.12] });
        b.box(2.7, 0.25, 0.32, tint(brick, 0.05), { at: [x, 3.3, ZF + 0.14] });
        b.extrude(
          [
            [-1.4, 0],
            [1.4, 0],
            [0, 0.55],
          ],
          0.3,
          tint(brick, 0.05),
          { at: [x, 3.55, ZF + 0.14] },
        );
        b.box(1.8, 0.15, 0.6, trav, { at: [x, 0, ZF + 0.3] });
        continue;
      }
      const open = b.chance(0.6);
      b.panel(2.6, 2.85, lintel, { at: [x, 0.15, ZF], facing: '+z', depth: 0.02 });
      b.panel(2.35, 2.65, open ? P.timberBlack : tint(P.oak, -0.06), { at: [x, 0.15, ZF], facing: '+z', depth: 0.04 });
      if (!open) for (let k = 1; k < 7; k++) b.panel(0.03, 2.65, P.oakDark, { at: [x - 1.175 + (2.35 * k) / 7, 0.15, ZF], facing: '+z', depth: 0.06 });
      else {
        b.box(1.3, 0.95, 0.4, tint(P.plaster, -0.12), { at: [x - 0.5, 0.15, ZF + 0.2] });
        b.box(1.36, 0.06, 0.46, trav, { at: [x - 0.5, 1.1, ZF + 0.2] });
      }
      b.box(2.7, 0.15, 0.4, trav, { at: [x, 0, ZF + 0.2] }); // threshold
      // flat brick arch over the opening, relieving arch above it, mezzanine window
      b.panel(2.8, 0.3, lintel, { at: [x, 3.0, ZF], facing: '+z', depth: 0.04 });
      b.window(0.9, 0.7, { at: [x, 3.4, ZF], facing: '+z', frame: lintel, glass: P.windowDark, border: 0.08 });
    }

    // upper floors: windows under flat brick arches, front and back
    for (let f = 1; f < FL.length; f++) {
      const [y0, , ww, wh, sill] = FL[f];
      const n = f === FL.length - 1 ? BAYS + 2 : BAYS;
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + (i + 0.5) * (W / n);
        for (const [z, facing] of [
          [ZF, '+z'],
          [ZB, '-z'],
        ] as const) {
          b.window(ww, wh, { at: [x, y0 + sill, z], facing, frame: tint(brick, -0.05), glass: P.windowDark, border: 0.06 });
          b.panel(ww + 0.35, 0.22, lintel, { at: [x, y0 + sill + wh, z], facing, depth: 0.04 });
          if (facing === '+z' && f < FL.length - 1) b.panel(ww + 0.3, 0.42, lintel, { at: [x, y0 + sill + wh + 0.24, z], facing, shape: 'segmental', depth: 0.02 });
          b.box(ww + 0.25, 0.08, 0.16, lintel, { at: [x, y0 + sill - 0.08, z + (facing === '+z' ? 0.06 : -0.06)] });
        }
        // a wooden shutter closed over the odd window (there was little glass in a poor flat)
        if (b.chance(0.2)) b.panel(ww - 0.14, wh - 0.12, P.oak, { at: [x, y0 + sill + 0.06, ZF], facing: '+z', depth: 0.1 });
      }
    }
    // side walls: a few windows on the left flank, the stair flank mostly blind
    for (let f = 1; f < FL.length; f++) {
      const [y0, , ww, wh, sill] = FL[f];
      for (const z of [-3.0, 0.2, 3.2]) b.window(ww * 0.9, wh, { at: [-W / 2, y0 + sill, z], facing: '-x', frame: tint(brick, -0.05), glass: P.windowDark, border: 0.06 });
      if (f > 1) b.window(ww * 0.9, wh, { at: [W / 2, y0 + sill, -3.2], facing: '+x', frame: tint(brick, -0.05), glass: P.windowDark, border: 0.06 });
    }

    // the first-floor balcony on travertine corbels, with a brick parapet
    const by = FL[1][0];
    const bd = 1.15;
    for (let i = 0; i <= 14; i++) {
      const x = -W / 2 + 0.4 + ((W - 0.8) * i) / 14;
      b.extrude(
        [
          [0, 0],
          [0, 0.55],
          [bd, 0.55],
          [bd, 0.38],
          [0.3, 0],
        ],
        0.28,
        trav,
        { at: [x, by - 0.55, ZF], rotY: -Math.PI / 2 },
      );
    }
    b.box(W - 0.2, 0.16, bd, trav, { at: [0, by, ZF + bd / 2] });
    b.box(W - 0.2, 0.95, 0.22, brick, { at: [0, by + 0.16, ZF + bd - 0.11] });
    b.box(W - 0.1, 0.07, 0.3, trav, { at: [0, by + 1.11, ZF + bd - 0.11] });
    for (const s of [-1, 1]) b.box(0.22, 0.95, bd - 0.22, brick, { at: [s * (W / 2 - 0.21), by + 0.16, ZF + (bd - 0.22) / 2] });
    // pots of herbs on the parapet
    for (let i = 0; i < 5; i++) {
      const x = b.range(-W / 2 + 1, W / 2 - 1);
      b.cyl(0.16, 0.25, P.terracotta, { at: [x, by + 1.18, ZF + bd - 0.11], rTop: 0.2, segs: 6 });
      b.blob(0.22, P.leaf, { at: [x, by + 1.5, ZF + bd - 0.11], detail: 0 });
    }

    // timber balconies on the upper floors: beams through the wall, plank floors, rails
    const tb = [
      [-6.3, FL[3][0], 3.4],
      [3.1, FL[4][0], 4.4],
    ];
    if (b.chance(0.6)) tb.push([8.2, FL[3][0], 2.6]);
    for (const [x, y, w] of tb) {
      for (let k = 0; k <= 3; k++) b.box(0.14, 0.16, 1.0, P.oakDark, { at: [x - w / 2 + 0.2 + ((w - 0.4) * k) / 3, y - 0.16, ZF + 0.5] });
      b.box(w, 0.08, 0.95, P.oak, { at: [x, y, ZF + 0.48] });
      b.box(w, 0.07, 0.07, P.oakDark, { at: [x, y + 0.95, ZF + 0.92] });
      for (let k = 0; k <= Math.round(w / 0.3); k++) b.box(0.05, 0.95, 0.05, P.oak, { at: [x - w / 2 + (w * k) / Math.round(w / 0.3), y, ZF + 0.92] });
      for (const s of [-1, 1]) b.box(0.07, 0.95, 0.9, P.oak, { at: [x + (s * w) / 2, y, ZF + 0.48] });
    }
    washing(b, [-8.0, FL[3][0] + 2.0, ZF + 0.9], [-4.6, FL[3][0] + 2.0, ZF + 0.9], 4);

    // the outside stair up the right flank on a rising brick vault, to a first-floor door
    const sx = W / 2 + 0.65;
    const z0 = ZF - 0.2; // foot, at the street
    const z1 = -2.6; // landing
    const steps = 16;
    const run = (z0 - z1) / steps;
    for (let k = 0; k < steps; k++) b.box(1.2, (by * (k + 1)) / steps, run, k % 2 ? brick : tint(brick, 0.03), { at: [sx, 0, z0 - (k + 0.5) * run] });
    b.box(1.2, by, 2.0, brick, { at: [sx, 0, z1 - 1.0] }); // landing
    b.panel(1.3, 1.9, lintel, { at: [sx, 0, z1 - 1.0 + 0.0], facing: '+x', shape: 'round', depth: 0.02 }); // relieving arch under the landing
    // parapet along the open side of the stair
    b.beam([sx + 0.6, 1.0, z0], [sx + 0.6, by + 1.0, z1], 0.14, 0.14, trav);
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      b.box(0.12, 1.0, 0.12, brick, { at: [sx + 0.6, by * t, z0 - (z0 - z1) * t] });
    }
    b.box(0.2, 1.0, 2.0, brick, { at: [sx + 0.6, by, z1 - 1.0] });
    b.panel(1.0, 2.1, P.oakDark, { at: [W / 2, by, z1 - 1.0], facing: '+x', depth: 0.06 });
    b.panel(1.2, 2.3, lintel, { at: [W / 2, by, z1 - 1.0], facing: '+x', depth: 0.03 });
    // a street fountain basin at the corner, where everyone drew water
    b.box(1.6, 0.7, 0.9, trav, { at: [-W / 2 - 0.9, 0.15, 6.9] });
    b.box(1.4, 0.05, 0.7, P.water, { at: [-W / 2 - 0.9, 0.78, 6.9], mat: 'glass' });
    b.box(0.35, 1.3, 0.3, trav, { at: [-W / 2 - 0.9, 0.15, 6.35] });

    b.collider(W, D, { at: [0, 0, ZC] });
    b.collider(1.6, ZF - z1 + 2.0, { at: [sx, 0, (ZF + z1 - 2.0) / 2] });
  },
};
