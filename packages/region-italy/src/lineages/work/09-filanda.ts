import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, WATER, lin, millRace, quayWall, roofRise } from './shared';

export const filanda: BuildingDef = {
  id: 'filanda',
  name: 'Steam silk-reeling mill (filanda)',
  style: 'Neoclassical industrial',
  date: 'c. 1840',
  summary:
    'In the nineteenth century silk was Italy’s leading export, and reeling the silk off the cocoons moved from farmhouse kitchens into long mills called filande. ' +
    'Inside, rows of women and girls sat at basins of hot water, now heated by steam piped from a coal-fired boiler, picking up the ends of the filaments from several cocoons at once and reeling them together into a single thread. ' +
    'The work needed all the daylight it could get, so the building is a long block of big, evenly spaced windows, the cocoons stored and dried on the floors above, with a tall brick chimney for the boiler: the old weir and mill channel still hold back the river, but the power now comes from coal. ' +
    'The dress is plain Neoclassical: pilasters, a pediment over the centre and a clock to keep the long shifts.',
  materials: ['brick', 'lime plaster', 'coppi roof tiles', 'cast iron', 'glass'],
  lookFor: [
    { label: 'Boiler chimney', note: 'The tall brick stack drew the fire under the boiler that made steam to heat the reeling basins.', at: [14.0, 22.0, -7.5] },
    { label: 'Reeling hall windows', note: 'Tall windows all along the ground floor lit the long rows of basins where the reelers worked.', at: [-8, 3.0, 4.2] },
    { label: 'Cocoon lofts', note: 'The upper floors, with smaller windows and louvres, were for storing and drying the cocoons.', at: [6, 9.4, 4.2] },
    { label: 'Clock pediment', note: 'A clock in the pediment over the entrance ruled the working day, which could last thirteen hours.', at: [-1, 13.0, 4.6] },
    { label: 'Mulberry trees', note: 'Silkworms eat only mulberry leaves, and the trees were planted along every road and field of silk country.', at: [-12, 4.5, 8.0] },
  ],
  influences: [],
  build(b) {
    const plaster = b.pick([P.intonacoOchre, P.intonacoCream, P.intonacoRose]);
    const trim = b.pick([P.stucco, P.travertine]);
    const brick = P.brickOrange;
    const W = 30;
    const D = 10;
    const x0 = -2;
    const z0 = -1;
    const g = 5.2; // reeling hall
    const f = 3.6; // loft floors
    const H = g + 2 * f;
    const front = z0 + D / 2;
    const back = z0 - D / 2;

    // the Roman quay wall, given a new coping; the old weir and mill channel still hold the river
    quayWall(b, tint(brick, -0.05));
    b.box(36.1, 0.18, 1.1, trim, { at: [0, 0.15, BANK + 0.3] });
    millRace(b, tint(P.pietraForte, -0.1));
    b.box(34, 0.04, 20, tint(P.gravel, -0.02), { at: [0, 0, 0], jitter: false });

    // ---- the long block
    b.box(W, H, D, plaster, { at: [x0, 0, z0] });
    b.box(W + 0.06, 0.7, D + 0.06, tint(trim, -0.08), { at: [x0, 0, z0] }); // plinth
    b.box(W + 0.1, 0.25, D + 0.1, trim, { at: [x0, g, z0] }); // string courses
    b.box(W + 0.1, 0.5, D + 0.1, trim, { at: [x0, H - 0.5, z0] }); // cornice
    b.hip(W + 1.0, D + 1.0, roofRise(D + 1, 20), P.coppi, { at: [x0, H, z0] });
    // pilasters dividing the bays, front and back
    const bays = 11;
    const pitch = W / bays;
    for (let i = 0; i <= bays; i++) {
      const x = x0 - W / 2 + i * pitch;
      b.box(0.5, H - 1.2, 0.18, tint(plaster, 0.06), { at: [x, 0.7, front + 0.09] });
      b.box(0.5, H - 1.2, 0.18, tint(plaster, 0.06), { at: [x, 0.7, back - 0.09] });
    }
    // the windows: tall in the hall, smaller (with louvred shutters) in the lofts
    for (let i = 0; i < bays; i++) {
      const x = x0 - W / 2 + (i + 0.5) * pitch;
      const centre = i === Math.floor(bays / 2);
      for (const [z, facing] of [
        [front, '+z'],
        [back, '-z'],
      ] as const) {
        if (!(centre && facing === '+z')) b.window(1.6, 3.4, { at: [x, 1.1, z], facing, frame: P.white, glass: P.windowDark, bars: [3, 5] });
        b.window(1.2, 1.7, { at: [x, g + 0.9, z], facing, frame: P.white, glass: P.windowDark, bars: [2, 3] });
        b.panel(1.2, 1.0, P.doorGreen, { at: [x, g + f + 0.9, z], facing }); // louvres to air the cocoons
        b.panel(1.0, 0.8, tint(P.doorGreen, -0.05), { at: [x, g + f + 1.0, z], facing, depth: 0.1 });
      }
    }
    b.sym((s) => {
      for (const k of [0, 1]) b.window(1.2, 1.7, { at: [x0 + s * (W / 2), g + 0.9 + k * f, z0], facing: s > 0 ? '+x' : '-x', frame: P.white, glass: P.windowDark, bars: [2, 3] });
    });
    // the centre: a slightly projecting bay with the door, a pediment and a clock
    const cw = pitch * 1.2;
    b.box(cw, H, 0.4, tint(plaster, 0.04), { at: [x0, 0, front + 0.2] });
    b.panel(1.9, 3.4, P.doorGreen, { at: [x0, 0.7, front + 0.4], facing: '+z', shape: 'round' });
    b.panel(2.4, 3.7, trim, { at: [x0, 0.7, front + 0.38], facing: '+z', shape: 'round', depth: 0.04 });
    b.stairs(3.0, 0.7, 1.2, 3, trim, { at: [x0, 0, front + 1.0] });
    b.window(1.3, 2.0, { at: [x0, g + 0.7, front + 0.4], facing: '+z', frame: P.white, glass: P.windowDark, bars: [2, 3] });
    b.extrude(
      [
        [-cw / 2 - 0.2, 0],
        [cw / 2 + 0.2, 0],
        [0, 1.6],
      ],
      0.6,
      trim,
      { at: [x0, H, front + 0.2] },
    );
    b.panel(1.3, 1.3, P.white, { at: [x0, H - 2.4, front + 0.4], facing: '+z', shape: 'circle', depth: 0.08 });
    b.panel(0.08, 0.5, P.black, { at: [x0, H - 1.75, front + 0.48], facing: '+z', depth: 0.06 });
    b.panel(0.4, 0.08, P.black, { at: [x0 + 0.15, H - 1.8, front + 0.48], facing: '+z', depth: 0.06 });
    b.panel(5.0, 0.5, trim, { at: [x0, g + 2.9, front + 0.4], facing: '+z' }); // name band

    // ---- the boiler house at the downstream end, and its chimney
    const bx = 15.0;
    const bz = -5.5;
    b.box(5.0, 5.0, 7.0, brick, { at: [bx, 0, bz] });
    b.gable(5.0, 7.0, roofRise(5, 20), P.coppi, { at: [bx, 5.0, bz], ridge: 'z', overhang: 0.35, wall: brick });
    b.panel(2.0, 3.0, P.doorBlack, { at: [bx, 0, bz + 3.5], facing: '+z', shape: 'segmental' });
    b.window(1.0, 1.6, { at: [bx + 2.5, 2.2, bz], facing: '+x', frame: trim, glass: P.windowDark, bars: [2, 2] });
    // a steam pipe on brackets from the boiler house into the reeling hall
    b.beam([bx - 2.5, 3.8, bz + 1.5], [x0 + W / 2, 3.8, bz + 1.5], 0.25, 0.25, P.castIron);
    const cx = bx - 1.0;
    const cz = bz - 2.4;
    b.box(2.6, 2.4, 2.6, brick, { at: [cx, 0, cz] }); // square base
    b.box(2.9, 0.3, 2.9, trim, { at: [cx, 2.4, cz] });
    b.lathe(
      [
        [1.15, 0],
        [0.75, 21],
        [0.95, 21.4],
        [0.95, 22.0],
        [0.7, 22.0],
      ],
      brick,
      { at: [cx, 2.7, cz], segs: 12 },
    );
    // a coal heap and barrows
    b.blob(1.5, 0x3e3e40, { at: [bx - 0.5, 0, bz + 5.4], stretch: [1.2, 0.45, 0.9] });

    // ---- the river side: a pump house drawing water for the boiler and basins
    b.box(3.0, 3.0, 2.6, brick, { at: [-11, 0, -8.6] });
    b.hip(3.4, 3.0, 1.0, P.coppi, { at: [-11, 3.0, -8.6] });
    b.panel(1.0, 2.0, P.doorBlack, { at: [-11, 0, -7.3], facing: '+z' });
    b.beam([-11, 0.4, -9.9], [-11, WATER - 0.3, BANK - 1.4], 0.3, 0.3, P.castIron);
    b.cyl(0.1, 4.6, P.castIron, { at: [-9.0, 0, back - 0.4], segs: 6 }); // a downpipe

    // ---- the street front: railings on a low wall, a gate, mulberry trees
    const sz = 10.4;
    b.box(30, 0.7, 0.5, trim, { at: [0, 0, sz] });
    for (const x of lin(60, -15, 15)) if (Math.abs(x - x0) > 2.3) b.box(0.05, 1.3, 0.05, P.castIron, { at: [x, 0.7, sz] });
    b.box(30, 0.08, 0.08, P.castIron, { at: [0, 1.9, sz] });
    b.sym((s) => {
      b.box(0.7, 2.8, 0.7, trim, { at: [x0 + s * 2.4, 0, sz] });
      b.sphere(0.35, trim, { at: [x0 + s * 2.4, 3.1, sz], segs: 8 });
    });
    for (const x of [-14, -9.5, 7.5, 12]) b.tree(4.6, { at: [x, 0, 7.8], kind: 'round', color: tint(P.leaf, -0.04) });
    b.box(4.0, 0.05, sz - front, P.paving, { at: [x0, 0, (front + sz) / 2], jitter: false });

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(5, 7, { at: [bx, 0, bz] });
    b.collider(30, 0.5, { at: [0, 0, sz] });
  },
};
