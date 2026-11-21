import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { paling, sash } from './shared';

export const georgianTownhouse: BuildingDef = {
  id: 'georgian-townhouse',
  name: 'Georgian town house',
  style: 'Georgian',
  date: 'c. 1740',
  summary:
    'The timber house was taken down and replaced in brick, in a style learned from pattern books that spread Palladian rules of ' +
    'proportion to every builder in the country. The front is flat and symmetrical: three bays, a central door and sash windows that ' +
    'are tallest on the main first floor and smaller on the floor above. The roof is hidden behind a parapet, and all the ornament is ' +
    'gathered round the front door. Brick was now a sign of respectability, and after the great town fires many towns encouraged it.',
  materials: ['red brick', 'rubbed brick arches', 'painted timber sashes', 'Portland stone dressings', 'clay tiles'],
  lookFor: [
    {
      label: 'Sash windows',
      note: 'Two sliding frames, each divided by glazing bars into small panes; they get shorter on the upper floor.',
      at: [-2.8, 6.0, 4.15],
    },
    {
      label: 'Doorcase with fanlight',
      note: 'A pediment on pilasters frames the door, and a semicircular fanlight above it lights the hall.',
      at: [0, 3.9, 4.45],
    },
    {
      label: 'Parapet',
      note: 'A low wall above the cornice hides the roof, so from the street the house looks like a neat classical box.',
      at: [2.8, 10.4, 4.15],
    },
    {
      label: 'Gauged brick arches',
      note: 'Flat arches of soft, finely rubbed bricks over each window, in a brighter red than the walls.',
      at: [2.8, 3.25, 4.15],
    },
    {
      label: 'Symmetry',
      note: 'Three equal bays mirror each other about the door, following the classical rules of the pattern books.',
      at: [0, 8.4, 4.15],
    },
  ],
  influences: ['palladianism', 'dutch-classicism'],
  build(b) {
    const W = 8.4;
    const D = 8.0;
    const zf = 4.0;
    const zc = zf - D / 2;
    const plinth = 0.6;
    const f1 = plinth + 3.2;
    const f2 = f1 + 3.4;
    const top = f2 + 2.6;
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), tint(P.brickOrange, -0.04)]);
    const rubbed = tint(P.brickOrange, 0.08);
    const stone = P.portland;
    const tile = b.pick([P.tileRed, P.tileBrown]);
    const door = b.pick([P.doorBlack, P.doorGreen, P.doorBlue, P.doorRed]);
    const bays = [-2.8, 0, 2.8];

    // the brick box, plinth, string course, cornice and parapet
    b.box(W, top, D, brick, { at: [0, 0, zc] });
    b.box(W + 0.1, plinth, D + 0.1, tint(brick, -0.08), { at: [0, 0, zc] });
    b.box(W + 0.08, 0.18, 0.08, stone, { at: [0, f1 - 0.1, zf + 0.04] });
    b.box(W + 0.3, 0.3, D + 0.3, stone, { at: [0, top, zc] });
    b.box(W, 0.8, 0.3, brick, { at: [0, top + 0.3, zf - 0.15] });
    b.box(W + 0.12, 0.1, 0.38, stone, { at: [0, top + 1.1, zf - 0.15] });
    // rubbed-brick quoins on some
    if (b.chance(0.5)) {
      b.sym((s) => {
        for (let y = plinth; y < top - 0.3; y += 0.6) {
          b.box(0.5, 0.3, 0.05, rubbed, { at: [s * (W / 2 - 0.25), y, zf + 0.02] });
        }
      });
    }

    // roof behind the parapet: two parallel ranges with a valley between (an M roof)
    b.sym((s) => b.gable(W, D / 2, 1.6, tile, { at: [0, top + 0.3, zc + (s * D) / 4], overhang: 0.0, wall: brick }));
    // dormers on the front slope
    for (const x of [-2.0, 2.0]) {
      b.box(1.0, 1.0, 0.9, P.white, { at: [x, top + 0.6, zf - 1.1] });
      b.window(0.7, 0.75, { at: [x, top + 0.7, zf - 0.65], facing: '+z', bars: [2, 2] });
      b.gable(1.1, 1.2, 0.45, tile, { at: [x, top + 1.6, zf - 1.15], ridge: 'z', overhang: 0.05 });
    }
    // end stacks
    b.sym((s) => {
      for (const z of [zc + 1.8, zc - 1.8]) {
        b.chimney(0.9, 2.4, 0.6, brick, { at: [s * (W / 2 - 0.4), top + 0.3, z], pots: b.chance(0.5) ? 2 : 0 });
      }
    });

    // windows: tallest on the first floor, shorter above, each with a gauged flat arch
    const arch = (x: number, y: number, w: number, z: number, f: '+z' | '-z') =>
      b.panel(w + 0.3, 0.32, rubbed, { at: [x, y, z], facing: f, depth: 0.03 });
    for (const x of bays) {
      sash(b, 1.1, 2.4, [x, f1 + 0.5, zf - 0.04], '+z', [3, 4]);
      arch(x, f1 + 2.92, 1.1, zf, '+z');
      b.box(1.3, 0.08, 0.14, stone, { at: [x, f1 + 0.44, zf + 0.04] });
      sash(b, 1.1, 1.45, [x, f2 + 0.45, zf - 0.04], '+z', [3, 2]);
      arch(x, f2 + 1.92, 1.1, zf, '+z');
      if (x !== 0) {
        sash(b, 1.1, 2.0, [x, plinth + 0.55, zf - 0.04], '+z', [3, 4]);
        arch(x, plinth + 2.57, 1.1, zf, '+z');
      }
    }
    // basement lights in the plinth
    for (const x of [-2.8, 2.8]) b.window(0.9, 0.4, { at: [x, 0.1, zf + 0.04], facing: '+z', bars: [3, 1] });

    // doorcase: pilasters, entablature and pediment, fanlight over a six-panel door
    const dz = zf;
    b.stairs(1.9, plinth, 0.9, 3, stone, { at: [0, 0, dz + 0.45] });
    b.panel(1.05, 2.3, door, { at: [0, plinth, dz], facing: '+z' });
    for (const y of [0.25, 1.0, 1.65]) {
      b.sym((s) => b.panel(0.36, y === 1.65 ? 0.45 : 0.6, tint(door, 0.06), { at: [s * 0.24, plinth + y, dz + 0.06], facing: '+z', depth: 0.02 }));
    }
    b.window(1.05, 0.55, { at: [0, plinth + 2.32, dz - 0.02], facing: '+z', shape: 'circle', bars: [4, 1] });
    b.panel(1.05, 0.55, brick, { at: [0, plinth + 2.32, dz - 0.03], facing: '+z', depth: 0.01 });
    b.sym((s) => {
      b.box(0.24, 2.95, 0.16, P.white, { at: [s * 0.78, plinth, dz + 0.08] });
      b.box(0.3, 0.14, 0.2, P.white, { at: [s * 0.78, plinth + 2.95, dz + 0.1] });
    });
    b.box(1.9, 0.25, 0.32, P.white, { at: [0, plinth + 3.05, dz + 0.16] });
    b.extrude([[-1.05, 0], [1.05, 0], [0, 0.55]], 0.32, P.white, { at: [0, plinth + 3.3, dz + 0.16] });
    // boot scraper and a little forecourt with railings
    paling(b, -W / 2, zf + 2.2, -1.0, zf + 2.2, 1.1, P.castIron, 0.14);
    paling(b, 1.0, zf + 2.2, W / 2, zf + 2.2, 1.1, P.castIron, 0.14);
    b.box(W + 0.2, 0.03, 2.2, P.paving, { at: [0, 0, zf + 1.1], jitter: false });

    // sides: blind brick with a couple of windows
    b.sym((s) => {
      sash(b, 1.0, 1.9, [s * (W / 2 + 0.04), f1 + 0.6, zc - 1.6], s > 0 ? '+x' : '-x', [3, 4]);
    });
    // back: tall round-headed stair window in the middle, ordinary sashes either side
    sash(b, 1.2, 3.3, [0, f1 - 0.5, zc - D / 2 - 0.04], '-z', [3, 6], { shape: 'round' });
    for (const x of [-2.6, 2.6]) {
      sash(b, 1.05, 1.9, [x, plinth + 0.6, zc - D / 2 - 0.04], '-z', [3, 4]);
      sash(b, 1.05, 2.2, [x, f1 + 0.5, zc - D / 2 - 0.04], '-z', [3, 4]);
      sash(b, 1.05, 1.4, [x, f2 + 0.45, zc - D / 2 - 0.04], '-z', [3, 2]);
    }
    b.panel(1.0, 2.1, P.doorBlack, { at: [-1.2, 0.15, zc - D / 2 - 0.04], facing: '-z' });
    // walled garden behind
    const zg = zc - D / 2;
    b.sym((s) => b.box(0.24, 1.8, -8.9 - zg, brick, { at: [s * 6.8, 0, (zg - 8.9) / 2] }));
    b.box(13.84, 1.8, 0.24, brick, { at: [0, 0, -8.9] });
    b.box(1.2, 0.03, -8.9 - zg, P.gravel, { at: [-1.2, 0, (zg - 8.9) / 2], jitter: false });
    for (const x of spread(3, 2.0, 5.6)) b.tree(b.range(1.6, 2.4), { at: [x, 0, -6.8], kind: 'bush' });
    b.tree(b.range(3.5, 4.5), { at: [-4.6, 0, -6.6] });
  },
};
