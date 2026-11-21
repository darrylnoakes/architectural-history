import { P, linspace, tint, type Builder, type BuildingDef } from '@ah/kit';
import { beam } from './shared';

/** Cover-tile (imbrex) ribs running down one slope of a hipped roof that faces +Z. */
function imbrices(b: Builder, x0: number, x1: number, zEave: number, yEave: number, zRidge: number, yRidge: number, col: number) {
  const n = Math.round((x1 - x0) / 0.55);
  for (const x of linspace(n, x0, x1)) beam(b, [x, yEave + 0.07, zEave], [x, yRidge + 0.07, zRidge], 0.11, col, 0.08);
}

export const romanTownhouse: BuildingDef = {
  id: 'roman-townhouse',
  name: 'Roman town house (domus)',
  style: 'Romano-British',
  date: 'c. AD 200',
  summary:
    'Within a few generations of the conquest the richest Britons were living like Romans. ' +
    'The house turns its back on the street: ranges of rooms with mortared stone footings, painted plaster and roofs of fired clay tile wrap round a private garden lined with a colonnade. ' +
    'One room is heated by a hypocaust, hot air from a furnace stoked outside passing under the floor and up flues in the walls. ' +
    'The mortar, roof tile, painted plaster and window glass were all new to Britain.',
  materials: ['mortared stone footings', 'painted lime plaster', 'fired clay roof tile', 'window glass'],
  lookFor: [
    { label: 'Peristyle garden', note: 'A colonnade on all four sides of a private garden, with a pool at its centre: the heart of the house.', at: [0, 2.0, 0.3] },
    { label: 'Tegulae and imbrices', note: 'Flat tiles with raised edges, their joints covered by half-round tiles, give the roof its ribbed look.', at: [-3, 4.4, 10.2] },
    { label: 'Stoke-hole (praefurnium)', note: 'The furnace for the hypocaust was fed from outside; its hot gases ran under the floor and up hollow box-tiles in the walls, venting at the eaves.', at: [6.8, 1.2, -11.8] },
    { label: 'Shops (tabernae)', note: 'The rooms either side of the entrance open to the street and were let as shops.', at: [-5.5, 2.6, 11.2] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const plaster = b.pick([P.plaster, P.limewash, tint(P.ochreWash, 0.1)]);
    const dado = b.pick([0xa44a3a, 0x9a5a3a]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04)]);
    const stone = P.rubble;
    const H = 3.6; // main ranges
    const Hw = 3.2; // side wings

    const block = (w: number, h: number, d: number, x: number, z: number) => {
      b.box(w + 0.1, 0.5, d + 0.1, stone, { at: [x, 0, z] });
      b.box(w, h, d, plaster, { at: [x, 0, z] });
      b.box(w + 0.04, 0.5, d + 0.04, dado, { at: [x, 0.5, z], jitter: false });
    };

    // ---- the four ranges round the courtyard
    block(19, H, 4.5, 0, 8.75); // street range
    block(14, H, 5, -2.5, -8.5); // back range (hall and dining room)
    block(5, H + 0.6, 5, 7, -8.5); // heated room (higher, with its own roof)
    b.sym((s) => block(4, Hw, 12.5, s * 7.5, 0.25)); // side wings

    b.hip(19, 4.5, 1.1, tile, { at: [0, H, 8.75], overhang: 0.4 });
    b.hip(14, 5, 1.2, tile, { at: [-2.5, H, -8.5], overhang: 0.4 });
    b.pyramid(5, 5, 1.25, tile, { at: [7, H + 0.6, -8.5], overhang: 0.4 });
    b.sym((s) => b.gable(4, 12.5, 1.0, tile, { at: [s * 7.5, Hw, 0.25], ridge: 'z', overhang: 0.35 }));
    // ribs of cover tiles on the street slope and on the back slope
    imbrices(b, -7, 7, 11.4, H - 0.166, 8.75, H + 1.1, tint(tile, -0.05));
    b.group({ rotY: Math.PI, at: [2.5, 0, 0] }, () => imbrices(b, 0.8, 9.2, 11.4, H - 0.16, 8.5, H + 1.2, tint(tile, -0.05)));
    // ridge tiles
    b.box(14.6, 0.14, 0.22, tint(tile, -0.08), { at: [0, H + 1.08, 8.75] });

    // ---- street front: entrance passage between two shops
    const zf = 11;
    b.panel(1.9, 2.7, P.oakDark, { at: [0, 0.5, zf], facing: '+z' });
    b.panel(2.3, 0.35, P.limestone, { at: [0, 3.2, zf], facing: '+z' });
    b.stairs(2.4, 0.5, 0.6, 2, P.limestone, { at: [0, 0, zf + 0.3] });
    b.sym((s) => {
      // open shop front with a masonry counter and folded shutters
      b.panel(3.2, 2.6, 0x3a3029, { at: [s * 5.5, 0.5, zf], facing: '+z' });
      b.box(3.2, 0.95, 0.5, stone, { at: [s * 5.5, 0, zf + 0.25] });
      b.panel(0.25, 2.6, P.oak, { at: [s * 5.5 + 1.75, 0.5, zf], facing: '+z', depth: 0.12 });
      b.window(0.7, 0.8, { at: [s * 2.4, 2.3, zf], facing: '+z', frame: plaster, glass: P.glassDark, bars: [2, 2] });
      b.window(0.7, 0.8, { at: [s * 8.4, 2.3, zf], facing: '+z', frame: plaster, glass: P.glassDark, bars: [2, 2] });
    });

    // ---- outer walls: small high windows
    b.sym((s) => {
      for (const z of [-3.2, 0.25, 3.7]) {
        b.window(0.7, 0.8, { at: [s * 9.5, 2.0, z], facing: s > 0 ? '+x' : '-x', frame: plaster, glass: P.glassDark, bars: [2, 2] });
      }
      b.window(0.7, 0.8, { at: [s * 9.5, 2.3, 8.75], facing: s > 0 ? '+x' : '-x', frame: plaster, glass: P.glassDark, bars: [2, 2] });
    });
    for (const x of [-7.5, -3.5, 0.5]) b.window(0.7, 0.8, { at: [x, 2.3, -11], facing: '-z', frame: plaster, glass: P.glassDark, bars: [2, 2] });
    b.panel(1.2, 2.3, P.oakDark, { at: [-9.5, 0.5, -8.5], facing: '-x' });
    b.window(0.9, 0.9, { at: [9.5, 2.6, -8.5], facing: '+x', frame: plaster, glass: P.glassDark, bars: [2, 2] });

    // ---- hypocaust furnace: stoke-hole under a lean-to at the back of the heated room (the hot gases
    // left through box-tiles in the walls, venting at the eaves, so there is no chimney stack)
    b.archWall(1.8, 1.1, 0.5, P.brickRed, { at: [7, 0, -11.25], facing: '-z', openings: 1, openW: 0.7, openH: 0.8, shape: 'round' });
    b.panel(0.7, 0.8, 0x1d1714, { at: [7, 0, -11.05], facing: '-z', shape: 'round', depth: 0.02 });
    b.sym((s) => b.cyl(0.08, 1.5, P.oak, { at: [7 + s * 1.2, 0, -11.85], segs: 5 }));
    b.shed(2.8, 1.0, 0.45, tile, { at: [7, 1.5, -11.5], high: '+z' });
    for (let i = 0; i < 4; i++) b.log(0.12, 1.1, P.bark, { at: [5.4, i * 0.2, -11.5 - (i % 2) * 0.12], axis: 'x', segs: 6 });

    // ---- the colonnaded courtyard
    b.box(11, 0.06, 12.5, P.paving, { at: [0, 0, 0.25] });
    b.box(7.0, 0.1, 8.5, P.grass, { at: [0, 0, 0.25] });
    b.box(1.0, 0.11, 8.5, P.gravel, { at: [0, 0, 0.25] });
    b.box(7.0, 0.11, 1.0, P.gravel, { at: [0, 0, 0.25] });
    b.cyl(1.0, 0.35, P.limestone, { at: [0, 0, 0.25], segs: 12 });
    b.cyl(0.85, 0.36, P.water, { at: [0, 0, 0.25], segs: 12, mat: 'glass' });
    for (const [x, z] of [[-2.2, -2.6], [2.2, -2.6], [-2.2, 3.1], [2.2, 3.1]]) {
      b.blob(0.5, P.hedge, { at: [x, 0.4, z], stretch: [1, 0.8, 1] });
    }
    const colX = 3.7;
    const zBack = -4.2;
    const zFront = 4.7;
    const colH = 2.5;
    const cols: [number, number][] = [];
    for (const z of linspace(5, zBack, zFront)) cols.push([-colX, z], [colX, z]);
    for (const x of linspace(4, -colX, colX).slice(1, -1)) cols.push([x, zBack], [x, zFront]);
    for (const [x, z] of cols) {
      b.column(0.14, colH, P.limestone, { at: [x, 0.06, z], order: 'tuscan' });
    }
    // entablature beams on the columns and the lean-to portico roofs
    const top = colH + 0.06;
    b.sym((s) => b.box(0.3, 0.25, zFront - zBack + 0.3, plaster, { at: [s * colX, top, (zFront + zBack) / 2] }));
    for (const z of [zBack, zFront]) b.box(2 * colX + 0.3, 0.25, 0.3, plaster, { at: [0, top, z] });
    const rt = top + 0.25;
    b.shed(11, 1.8, Hw - rt + 0.15, tile, { at: [0, rt, 5.6], high: '+z' });
    b.shed(11, 1.8, Hw - rt + 0.15, tile, { at: [0, rt, -5.1], high: '-z' });
    b.sym((s) => b.shed(1.8, zFront - zBack, Hw - rt + 0.15, tile, { at: [s * 4.6, rt, (zFront + zBack) / 2], high: s > 0 ? '+x' : '-x' }));
    // doors from the portico into the rooms
    for (const x of [-3, 0, 3]) b.panel(1.2, 2.3, P.oakDark, { at: [x, 0.06, -6], facing: '+z' });
    b.sym((s) => {
      for (const z of [-2, 2.5]) b.panel(1.1, 2.2, P.oakDark, { at: [s * 5.5, 0.06, z], facing: s > 0 ? '-x' : '+x' });
    });
  },
};
