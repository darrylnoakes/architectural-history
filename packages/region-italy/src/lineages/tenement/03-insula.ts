import { P, tint, type BuildingDef } from '@ah/kit';
import { PORTICO, PW, patch, streetKerb, streetPortico, washing } from './shared';

const W = 22; // block along the street
const ZF = 4.4; // street front, behind the portico
const ZB = -6.4; // back
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
    'Under the empire most people in Rome, Ostia and the larger towns rented rooms in an insula, a block of flats of five storeys or so built in concrete faced with brick, which could be raised higher and burnt less than the timber-framed blocks before it. ' +
    'Shops with mezzanines filled the street front, and between them narrow doorways opened straight onto stairs up to the flats, so tenants never passed through a shop. The best flats, on the first floor, opened onto the flat roof of a street portico, of the kind Nero ordered in front of the blocks after the fire of AD 64, and rents fell as you climbed, so the poorest lived under the roof in small rooms that were the last to escape a fire. ' +
    'There was no running water above the ground floor, and tenants carried it upstairs from the street fountain. Augustus limited the height of buildings on the street to 70 Roman feet, about 21 metres, and Trajan is said to have lowered it to 60.',
  materials: ['concrete faced with brick (opus testaceum)', 'travertine brackets and thresholds', 'timber floors and balconies', 'fired roof tiles'],
  modelledOn: 'The insulae of Ostia (House of Diana, 2nd century AD) and the Insula dell’Ara Coeli, Rome',
  lookFor: [
    { label: 'Brick-faced concrete', note: 'A core of concrete faced with neat triangular bricks; string courses of brick mark each floor.', at: [-9.5, 9.4, ZF + 0.1] },
    { label: 'Street portico', note: 'After the great fire of AD 64 Nero had porticoes built in front of the blocks of flats, to shade the pavement and so that fires could be fought from their flat roofs; here the roof is a terrace for the first-floor flats.', at: [-5.4, 2.6, PORTICO.z + 0.4] },
    { label: 'Shops with mezzanines', note: 'Each shop has a wide doorway and a small window above it lighting the loft where its keeper lived.', at: [-3.1, 2.0, ZF + 0.2] },
    { label: 'Stair doorway', note: 'A narrow door on the street with a travertine threshold, the first steps of the stair to the upper flats rising just inside, as at Ostia.', at: [-W / 2 + 1.5 * BP, 1.6, ZF + 0.25] },
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
    streetKerb(b, trav);
    patch(b, PW, 8 + ZB, tint(P.cobble, 0.06), [0, (ZB - 8) / 2], 0.03);

    // the block
    b.box(W, TOP, D, brick, { at: [0, 0, ZC] });
    for (const [y] of FL.slice(1)) b.box(W + 0.12, 0.18, D + 0.12, course, { at: [0, y - 0.1, ZC] });
    b.box(W + 0.4, 0.3, D + 0.4, course, { at: [0, TOP - 0.3, ZC] }); // eaves cornice
    // a low hipped roof of tegulae and imbrices
    const rh = (D / 2 + 0.5) * Math.tan((20 * Math.PI) / 180);
    b.hip(W + 1.0, D + 1.0, rh, roof, { at: [0, TOP - 0.05, ZC] });
    b.box(W - D + 0.1, 0.16, 0.2, tint(roof, -0.08), { at: [0, TOP - 0.05 + rh - 0.04, ZC] });

    // ground floor: shops, two stair doorways, and the entrance to the courtyard in the middle bay
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
      if (i === 1 || i === 5) {
        // a stair doorway: travertine jambs, lintel and threshold, the first steps rising inside
        const dw = 1.1;
        const dh = 2.5;
        b.panel(dw, dh, P.timberBlack, { at: [x, 0.15, ZF], facing: '+z', depth: 0.02 });
        for (let k = 0; k < 7; k++) {
          const y = 0.15 + k * 0.25;
          const shade = tint(trav, -0.12 - k * 0.07);
          b.panel(dw - 0.04, 0.25, tint(brick, -0.2 - k * 0.05), { at: [x, y, ZF], facing: '+z', depth: 0.03 }); // riser
          b.panel(dw - 0.04, 0.05, shade, { at: [x, y + 0.2, ZF], facing: '+z', depth: 0.04 }); // tread nosing
        }
        for (const sd of [-1, 1]) b.box(0.22, dh + 0.15, 0.2, trav, { at: [x + sd * (dw / 2 + 0.11), 0, ZF + 0.08] });
        b.box(dw + 0.64, 0.3, 0.24, trav, { at: [x, dh + 0.15, ZF + 0.1] });
        b.box(dw + 0.5, 0.15, 0.45, trav, { at: [x, 0, ZF + 0.2] }); // threshold
        b.panel(dw + 0.8, 0.4, lintel, { at: [x, dh + 0.5, ZF], facing: '+z', shape: 'segmental', depth: 0.03 }); // relieving arch
        b.window(0.35, 0.8, { at: [x, 3.3, ZF], facing: '+z', frame: lintel, glass: P.windowDark, border: 0.06 }); // slit lighting the stair
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
    // side walls: a column of windows on each flank, under flat brick arches
    for (let f = 1; f < FL.length; f++) {
      const [y0, , ww, wh, sill] = FL[f];
      for (const [sx, facing] of [
        [-W / 2, '-x'],
        [W / 2, '+x'],
      ] as const) {
        for (const z of [-3.8, -0.6, 2.4]) {
          b.window(ww * 0.9, wh, { at: [sx, y0 + sill, z], facing, frame: tint(brick, -0.05), glass: P.windowDark, border: 0.06 });
          b.panel(ww * 0.9 + 0.35, 0.22, lintel, { at: [sx, y0 + sill + wh, z], facing, depth: 0.04 });
        }
      }
    }
    // a small window to the ground-floor back rooms on each flank
    for (const [sx, facing] of [
      [-W / 2, '-x'],
      [W / 2, '+x'],
    ] as const) b.window(0.7, 0.6, { at: [sx, 2.6, -2.8], facing, frame: lintel, glass: P.windowDark, border: 0.06 });

    // the street portico, of the kind Nero ordered in front of the blocks after the fire of AD 64, its
    // flat roof a terrace for the first-floor flats, with a brick parapet
    streetPortico(b, b.pick([P.granite, P.marble, P.peperino]));
    const by = FL[1][0];
    const tz0 = ZF;
    const tz1 = PORTICO.z + 0.4;
    b.box(W - 0.2, 0.16, tz1 - tz0, trav, { at: [0, by, (tz0 + tz1) / 2] });
    b.box(W - 0.2, 0.95, 0.22, brick, { at: [0, by + 0.16, tz1 - 0.11] });
    b.box(W - 0.1, 0.07, 0.3, trav, { at: [0, by + 1.11, tz1 - 0.11] });
    for (const s of [-1, 1]) b.box(0.22, 0.95, tz1 - tz0 - 0.22, brick, { at: [s * (W / 2 - 0.21), by + 0.16, (tz0 + tz1 - 0.22) / 2] });
    // pots of herbs on the parapet
    for (let i = 0; i < 5; i++) {
      const x = b.range(-W / 2 + 1, W / 2 - 1);
      b.cyl(0.16, 0.25, P.terracotta, { at: [x, by + 1.18, tz1 - 0.11], rTop: 0.2, segs: 6 });
      b.blob(0.22, P.leaf, { at: [x, by + 1.5, tz1 - 0.11], detail: 0 });
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

    // a street fountain basin on the side street, where everyone drew water
    b.box(0.9, 0.7, 1.6, trav, { at: [-W / 2 - 0.9, 0, 1.0] });
    b.box(0.7, 0.05, 1.4, P.water, { at: [-W / 2 - 0.9, 0.63, 1.0], mat: 'glass' });
    b.box(0.3, 1.3, 0.35, trav, { at: [-W / 2 - 0.25, 0, 1.0] });

    b.collider(W, D, { at: [0, 0, ZC] });
  },
};
