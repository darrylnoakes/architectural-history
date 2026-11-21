import { P, spread, tint, type BuildingDef } from '@ah/kit';

/**
 * EXEMPLAR. Read this file before writing a building: it shows the conventions every
 * generator follows (front faces +Z, `at` is the base centre, card text style, feature anchors).
 */
export const georgianChapel: BuildingDef = {
  id: 'georgian-chapel',
  name: 'Nonconformist chapel',
  style: 'Georgian classical',
  date: 'c. 1790',
  summary:
    'Methodists, Baptists and Quakers were shut out of the parish church, so they built meeting houses of their own. ' +
    'This one is a plain brick preaching box: no tower, no chancel, no carving. All the money went on a wide, well-lit ' +
    'room where everyone could hear the sermon, and its only gesture of grandeur is a temple-front pediment borrowed from the classical pattern books.',
  materials: ['red brick', 'Welsh slate', 'painted timber'],
  lookFor: [
    { label: 'Pediment', note: 'The low triangular gable of a Greek temple, here in brick, turning a barn into a public building.', at: [0, 9.3, 6.6] },
    { label: 'Round-headed windows', note: 'Tall, clear-glazed and evenly spaced. Light for reading, not coloured glass for mystery.', at: [4.8, 5.2, 1.6] },
    { label: 'Doorcase', note: 'Columns and a small pediment framing the door: the one place the builders spent on ornament.', at: [0, 3.2, 6.9] },
    { label: 'Symmetry', note: 'Everything mirrors about the centre line. Georgian builders treated symmetry as a rule, not a choice.', at: [0, 5.6, 6.6] },
  ],
  influences: ['palladianism'],
  build(b) {
    const W = 9.6; // width (X)
    const D = 13; // depth (Z)
    const H = 7; // eaves height
    const brick = b.pick([P.brickRed, P.brickOrange, tint(P.brickRed, -0.04)]);
    const stone = P.portland;

    // body: stone plinth, brick walls, stone cornice
    b.box(W + 0.3, 0.45, D + 0.3, stone);
    b.box(W, H, D, brick);
    b.box(W + 0.36, 0.28, D + 0.36, stone, { at: [0, H - 0.28, 0] });

    // roof: the ridge runs front to back, so the gable end makes the pediment over the front
    const roofH = 2.6;
    // (`wall` paints the gable-end triangles brick, so the front reads as a brick pediment)
    b.gable(W, D, roofH, P.slate, { at: [0, H, 0], ridge: 'z', overhang: 0.3, wall: brick });
    b.window(1.1, 1.1, { at: [0, H + 0.45, D / 2], facing: '+z', shape: 'circle', frame: stone });

    // front: central doorcase flanked by two tall windows, with a date stone over the door
    const front = D / 2;
    b.stairs(2.6, 0.45, 0.9, 3, stone, { at: [0, 0, front + 0.45] });
    b.panel(1.5, 2.6, P.doorGreen, { at: [0, 0.45, front], facing: '+z' });
    b.sym((s) => b.column(0.16, 2.7, stone, { at: [s * 1.0, 0.45, front + 0.22], order: 'tuscan' }));
    b.box(2.6, 0.25, 0.5, stone, { at: [0, 3.15, front + 0.2] });
    b.extrude([[-1.3, 0], [1.3, 0], [0, 0.55]], 0.5, stone, { at: [0, 3.4, front + 0.2] });
    b.panel(1.3, 0.7, stone, { at: [0, 4.5, front], facing: '+z' });
    b.sym((s) =>
      b.window(1.25, 3.6, { at: [s * 3.1, 1.9, front], facing: '+z', shape: 'round', frame: P.white, bars: [3, 5] }),
    );

    // sides: four tall round-headed windows each
    b.sym((s) => {
      for (const z of spread(4, -D / 2, D / 2)) {
        b.window(1.25, 3.9, { at: [(s * W) / 2, 1.9, z], facing: s > 0 ? '+x' : '-x', shape: 'round', bars: [3, 5] });
      }
    });

    // forecourt: low wall with iron railings and gate piers
    b.sym((s) => {
      b.box(2.9, 0.5, 0.3, brick, { at: [s * 3.25, 0, front + 2.6] });
      for (const x of spread(7, 1.9, 4.6)) b.box(0.05, 0.9, 0.05, P.castIron, { at: [s * x, 0.5, front + 2.6] });
      b.box(0.5, 1.7, 0.5, brick, { at: [s * 1.6, 0, front + 2.6] });
      b.pyramid(0.6, 0.6, 0.25, stone, { at: [s * 1.6, 1.7, front + 2.6] });
    });
  },
};
