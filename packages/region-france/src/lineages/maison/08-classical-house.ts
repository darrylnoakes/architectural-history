import { P, tint, type BuildingDef } from '@ah/kit';
import { YARD_WELL, dormer, mansard, quoins, well, yardBounds } from './shared';

export const classicalHouse: BuildingDef = {
  id: 'classical-house',
  name: 'Brick and stone town house',
  style: 'Classical (Louis XIV)',
  date: 'c. 1680',
  revisions: [
    { year: 1860, note: 'A shop is cut into the ground floor: a painted timber shopfront with big panes of plate glass is fixed across two bays of the brick.' },
  ],
  summary:
    'After a century of fires, timber gave way in the towns of Picardy and the north to red brick, dressed with pale stone at the corners, round the openings and in bands across the front. ' +
    'The new house is a flat, ordered front of identical bays: tall windows with small panes (petits-bois) in strict rows, the same on every floor. ' +
    'A carriage door (porte cochère) leads through to the yard and the coach house, and the attic is a near-full storey under a mansard roof, steep below and shallow above, named after the architect François Mansart, with dormers in the steep slope.',
  materials: ['red brick', 'limestone quoins, bands and window surrounds', 'oak casements with small panes', 'slate mansard'],
  lookFor: [
    {
      label: 'Mansard roof',
      note: 'A steep lower slope (the brisis) with dormers, and a low upper slope (the terrasson): the attic gains almost a whole storey of rooms.',
      at: [3.9, 9.4, 7.8],
    },
    {
      label: 'Stone quoins',
      note: 'Long and short blocks of stone alternate up the corners, tying the brick and giving the front its frame.',
      at: [-6.5, 4.0, 8.5],
    },
    {
      label: 'Porte cochère',
      note: 'A carriage door wide enough for a coach or a cart leads through the house to the yard behind.',
      at: [-5.2, 3.7, 8.55],
    },
    {
      label: 'Windows with small panes',
      note: 'Tall casements of many small panes, the petits-bois, set in stone surrounds in strict rows: order is the new beauty.',
      at: [0.0, 5.6, 8.55],
    },
    {
      label: 'Stone band',
      note: 'A plain band of stone (bandeau) marks the floor level across the brick and links the windows.',
      at: [2.6, 3.95, 8.6],
    },
  ],
  build(b) {
    const brick = tint(P.briqueNord, b.range(-0.04, 0.04));
    const stone = tint(b.pick([P.pierreBlonde, P.craie]), b.range(-0.03, 0.01));
    const slate = tint(P.ardoise, b.range(-0.02, 0.03));
    const door = b.pick([P.doorGreen, P.oakDark, P.doorRed, tint(P.voletGris, -0.2)]);
    const frame = b.pick([P.white, P.cream, tint(P.voletGris, 0.1)]);
    const W = 13.6;
    const zF = 8.4;
    const zB = -1.6;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const G = 3.9;
    const F1 = 3.6;
    const eaves = G + F1;
    const bays = [-5.2, -2.6, 0, 2.6, 5.2];

    // the brick block on a stone plinth
    b.box(W, eaves, D, brick, { at: [0, 0, zc] });
    b.box(W + 0.06, 0.6, D + 0.06, stone, { at: [0, 0, zc] });
    b.box(W + 0.04, 0.22, 0.14, stone, { at: [0, G, zF + 0.05] }); // bandeau
    b.box(W + 0.04, 0.22, 0.14, stone, { at: [0, G, zB - 0.05] });
    // cornice
    b.box(W, 0.3, 0.4, stone, { at: [0, eaves - 0.05, zF + 0.12] });
    b.box(W, 0.14, 0.55, tint(stone, 0.04), { at: [0, eaves + 0.2, zF + 0.18] });
    b.box(W, 0.3, 0.4, stone, { at: [0, eaves - 0.05, zB - 0.12] });
    quoins(b, -W / 2 + 0.01, zF, 0.6, eaves - 0.05, -1, stone, 0.48);
    quoins(b, W / 2 - 0.01, zF, 0.6, eaves - 0.05, 1, stone, 0.48);

    // windows in stone surrounds with keystones
    const win = (x: number, y: number, h: number, z: number, facing: '+z' | '-z', dressed: boolean) => {
      if (dressed) {
        b.panel(1.75, h + 0.35, stone, { at: [x, y - 0.18, z], facing, depth: 0.04, shape: 'segmental' });
        b.panel(0.38, 0.45, tint(stone, 0.05), { at: [x, y + h - 0.12, z], facing, depth: 0.08 });
        b.box(1.85, 0.12, 0.2, stone, { at: [x, y - 0.2, z + (facing === '+z' ? 0.08 : -0.08)] });
      }
      b.window(1.3, h, { at: [x, y, z], facing, frame, glass: P.glassDark, bars: [2, 5], mat: 'glass', border: 0.08, shape: 'segmental' });
    };
    for (const x of bays) win(x, G + 0.55, 2.6, zF + 0.02, '+z', true);
    // the carriage door
    const cx = bays[0];
    b.panel(3.2, 3.85, stone, { at: [cx, 0, zF + 0.02], facing: '+z', depth: 0.05, shape: 'segmental' });
    b.panel(2.6, 3.55, door, { at: [cx, 0, zF + 0.02], facing: '+z', depth: 0.09, shape: 'segmental' });
    b.panel(0.04, 3.2, tint(door, -0.12), { at: [cx, 0, zF + 0.02], facing: '+z', depth: 0.11 });
    for (const s of [1, -1]) {
      for (const y of [0.4, 1.4, 2.4]) b.panel(1.0, 0.8, tint(door, 0.06), { at: [cx + s * 0.65, y, zF + 0.02], facing: '+z', depth: 0.11 });
      b.cyl(0.18, 0.55, stone, { at: [cx + s * 1.55, 0, zF + 0.25], rTop: 0.12, segs: 6 }); // wheel guards (chasse-roues)
    }
    b.panel(0.45, 0.55, tint(stone, 0.05), { at: [cx, 3.35, zF + 0.02], facing: '+z', depth: 0.12 });

    // the mansard with its dormers, raised party walls and chimneys
    const hLow = 2.7;
    const inset = 1.0;
    mansard(b, W, D + 0.3, hLow, 1.6, inset, slate, tint(slate, 0.05), brick, { at: [0, eaves + 0.34, zc] });
    for (const x of [-2.6, 2.6, 0]) {
      dormer(b, [x, eaves + 0.34, zF - 0.1], '+z', 1.4, 2.1, slate, stone, { frame, bars: [2, 3], pediment: stone, shape: 'segmental', depth: 1.1 });
    }
    for (const x of [-2.6, 2.6]) dormer(b, [x, eaves + 0.34, zB + 0.1], '-z', 1.3, 1.9, slate, stone, { frame, bars: [2, 3], depth: 1.1 });
    for (const s of [1, -1]) b.chimney(1.3, 2.0, 0.8, brick, { at: [s * (W / 2 - 0.9), eaves + hLow + 0.6, zc + 1.6] });

    // back: plainer brick, windows without stone dressings except the sills
    for (const x of [-2.6, 0, 2.6, 5.2]) {
      win(x, 1.0, 2.3, zB - 0.02, '-z', false);
      b.box(1.5, 0.1, 0.2, stone, { at: [x, 0.92, zB - 0.1] });
    }
    for (const x of bays) {
      win(x, G + 0.55, 2.5, zB - 0.02, '-z', false);
      b.box(1.5, 0.1, 0.2, stone, { at: [x, G + 0.47, zB - 0.1] });
    }
    b.panel(2.6, 3.4, door, { at: [cx, 0, zB - 0.02], facing: '-z', depth: 0.08, shape: 'segmental' });

    // the yard: paving, a coach house at the back, a small garden of box-edged beds
    // the old rubble walls of the plot and its well are kept; the yard is paved and a garden laid out
    yardBounds(b, zB, tint(P.rubble, 0.03), stone);
    b.box(6.6, 0.04, 7.0, P.cobble, { at: [-3.3, 0, -5.1], jitter: false });
    // coach house and stable
    b.box(5.4, 3.0, 3.0, brick, { at: [-4.05, 0, -7.25] });
    b.gable(5.4, 3.0, 1.6, slate, { at: [-4.05, 3.0, -7.25], overhang: 0.2, wall: brick });
    b.panel(2.4, 2.6, door, { at: [-4.6, 0, -5.75], facing: '+z', shape: 'segmental', depth: 0.08 });
    b.panel(0.8, 0.6, P.windowDark, { at: [-2.4, 1.8, -5.75], facing: '+z' });
    // garden: gravel walks, box-edged beds, a clipped yew
    b.box(6.4, 0.04, 7.0, P.gravel, { at: [3.4, 0, -5.1], jitter: false });
    for (const [x, z] of [[2.0, -3.4], [5.0, -3.4], [2.0, -6.8], [5.0, -6.8]]) {
      b.box(2.4, 0.3, 2.6, P.hedge, { at: [x, 0, z] });
      b.box(2.0, 0.32, 2.2, b.pick([P.leaf, P.soil, tint(P.leaf, 0.08)]), { at: [x, 0, z], jitter: false });
    }
    b.cone(0.55, 2.0, P.leafDark, { at: [3.5, 0, -5.1], segs: 7 });
    well(b, YARD_WELL, P.pierreBlonde, { frame: 'iron' });

    // the ground-floor windows last, so that the shop cut into two of them in 1860 moves nothing else
    const shop = b.since(1860);
    for (const x of bays.slice(1)) if (!(shop && x > 1)) win(x, 0.95, 2.45, zF + 0.02, '+z', true);
    if (shop) {
      // a timber shopfront (devanture) applied to the brick across two bays: pilasters, plate glass, a fascia
      const sx = 3.9;
      const paint = b.pick([P.doorGreen, tint(P.doorRed, -0.1), P.doorBlack, tint(P.voletBleu, -0.15)]);
      b.box(4.8, 3.5, 0.2, paint, { at: [sx, 0, zF + 0.1], jitter: false });
      b.window(1.7, 2.1, { at: [sx - 1.25, 0.7, zF + 0.2], facing: '+z', frame: tint(paint, 0.1), glass: P.glass, bars: [1, 1], mat: 'glass', border: 0.06 });
      b.window(1.7, 2.1, { at: [sx + 1.25, 0.7, zF + 0.2], facing: '+z', frame: tint(paint, 0.1), glass: P.glass, bars: [1, 1], mat: 'glass', border: 0.06 });
      b.panel(0.9, 2.5, tint(paint, -0.08), { at: [sx, 0.3, zF + 0.2], facing: '+z', depth: 0.06 });
      b.box(5.0, 0.6, 0.32, paint, { at: [sx, 2.95, zF + 0.16], jitter: false }); // fascia
      b.box(3.6, 0.3, 0.34, P.cream, { at: [sx, 3.1, zF + 0.16], jitter: false }); // the name board
    }
  },
};
