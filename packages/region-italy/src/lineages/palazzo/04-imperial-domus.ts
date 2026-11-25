import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archPts, block, col, coppiRibs, onFace, pediment, plate, win } from './shared';

/** Height of the two-storey ranges of the imperial house. */
const H = 7.6;

/**
 * The street range of the imperial house: two storeys, arched shops below, a balcony on travertine
 * corbels above. The late Roman mansion keeps it, with the shops walled in and the balcony gone.
 */
export function imperialStreetRange(b: Builder, brick: number, trav: number, tile: number, late = false): void {
  b.sym((s) => block(b, 9.8, H, 5, brick, s * 6.1, 9.5));
  b.box(2.4, H - 3.6, 5, brick, { at: [0, 3.6, 9.5] });
  b.box(2.4, 0.06, 5, P.paving, { at: [0, 0, 9.5] });
  b.gable(22, 5, 1.4, tile, { at: [0, H, 9.5], overhang: 0.4, wall: brick });
  coppiRibs(b, -11, 11, 9.5, 5, H, 1.4, 0.4, tint(tile, -0.06), 0.9, [1]);
  onFace(b, '+z', [0, 0, 12], () => {
    for (const x of [-8.5, -4, 4, 8.5]) {
      win(b, x, 0, 2.6, 3.0, trav, { shape: 'round', border: 0.24, glass: 0x2b2520, n: 5 });
      if (!late) {
        b.box(2.6, 0.12, 0.1, P.oak, { at: [x, 1.7, 0.1] });
        b.panel(0.9, 0.7, P.windowDark, { at: [x, 1.85, 0.05], depth: 0.06 });
      } else {
        // the shops given up and their arches walled in, leaving a small window high up
        plate(b, archPts(x, 0, 2.5, 2.95, 'round', 5), 0.12, tint(brick, -0.08), 0.02);
        b.panel(0.6, 0.8, P.windowDark, { at: [x, 1.9, 0.14], depth: 0.04 });
      }
      win(b, x, 4.7, 1.1, 1.6, trav, { border: 0.12 });
    }
    // doorway: brick pilasters and a pediment
    b.panel(1.8, 3.2, P.oakDark, { at: [0, 0, -0.02], depth: 0.08 });
    for (const s of [-1, 1]) b.box(0.4, 3.4, 0.25, brick, { at: [s * 1.25, 0, 0.12] });
    b.box(3.2, 0.3, 0.35, trav, { at: [0, 3.4, 0.17] });
    pediment(b, 0, 3.7, 3.4, 0.8, 'tri', brick, 0.3);
    win(b, 0, 4.7, 1.1, 1.6, trav, { border: 0.12 });
    // the balcony on travertine corbels (later only the corbels are left)
    for (let i = 0; i < 12; i++) b.box(0.3, 0.35, 0.9, trav, { at: [-10.5 + i * 1.9, 3.9, 0.45] });
    if (!late) {
      b.box(21.6, 0.15, 0.95, P.oak, { at: [0, 4.25, 0.48] });
      b.box(21.6, 0.1, 0.1, P.oak, { at: [0, 5.25, 0.9] });
      for (let i = 0; i < 23; i++) b.box(0.07, 1.0, 0.07, P.oak, { at: [-10.8 + i * 0.98, 4.3, 0.9] });
    }
    b.box(22, 0.25, 0.25, trav, { at: [0, 3.6, 0.12] });
  });
}

/** The main range on the left: hall below, family rooms above. Kept by the late Roman mansion. */
export function imperialMainRange(b: Builder, brick: number, trav: number, tile: number): void {
  block(b, 6, H, 19, brick, -8, -2.5);
  b.gable(6, 19, 1.3, tile, { at: [-8, H, -2.5], ridge: 'z', overhang: 0.4, wall: brick });
  onFace(b, '+x', [-5, 0, -2.5], () => {
    b.panel(2.4, 3.6, P.oakDark, { at: [0, 0, 0], shape: 'round', depth: 0.06 });
    for (const x of [-6, 6]) b.panel(1.2, 2.6, P.oakDark, { at: [x, 0, 0], depth: 0.06 });
    for (const x of [-6, -2, 2, 6]) win(b, x, 4.6, 1.1, 1.7, trav, { border: 0.12 });
  });
  onFace(b, '-x', [-11, 0, -2.5], () => {
    for (const x of [-6, -2, 2, 6]) win(b, x, 4.6, 1.0, 1.5, trav, { border: 0.12 });
  });
  onFace(b, '-z', [0, 0, -12], () => {
    for (const x of [6.5, 9.5]) win(b, x, 4.6, 1.0, 1.5, trav, { border: 0.12 });
  });
}

/** The bath suite: cold and warm rooms under barrel vaults, a domed hot room with an apse. Kept by the late Roman mansion. */
export function imperialBaths(b: Builder, brick: number, trav: number, tile: number): void {
  const bx = 8;
  const rooms: [number, number, number][] = [[0.6, 4.6, 4.8], [-4.2, 4.6, 5.0]];
  for (const [z, d, h] of rooms) {
    block(b, 6, h, d, brick, bx, z);
    b.vault(6, d, tint(P.concrete, 0.05), { at: [bx, h, z], axis: 'x', squash: 0.45, segs: 8 });
  }
  block(b, 6, 5.0, 5, brick, bx, -9.3);
  b.box(6.2, 0.4, 5.2, trav, { at: [bx, 5.0, -9.3] });
  b.cyl(2.6, 0.8, brick, { at: [bx, 5.4, -9.3], segs: 10 });
  b.dome(2.6, tint(P.concrete, 0.05), { at: [bx, 6.2, -9.3], segs: 10, squash: 0.6 });
  b.cyl(0.4, 0.3, trav, { at: [bx, 7.7, -9.3], segs: 6 });
  b.lathe([[1.8, 0], [1.8, 4.2], [0.01, 4.2]], brick, { at: [bx - 3, 0, -9.3], segs: 6, start: Math.PI, sweep: Math.PI });
  b.lathe([[1.9, 4.2], [0.01, 5.0]], tile, { at: [bx - 3, 0, -9.3], segs: 6, start: Math.PI, sweep: Math.PI });
  onFace(b, '+x', [11, 0, -4], () => {
    win(b, 5.3, 2.4, 1.4, 1.8, trav, { shape: 'round', border: 0.14, glass: P.glassDark });
    win(b, 0.2, 2.4, 1.1, 1.4, trav, { shape: 'round', border: 0.14 });
    win(b, -4.6, 2.4, 1.1, 1.4, trav, { shape: 'round', border: 0.14 });
  });
  for (const z of [-10.8, -7.8]) b.cyl(0.12, 1.2, P.terracotta, { at: [bx + 2.4, 4.8, z], segs: 5 });
  b.panel(1.2, 2.4, P.oakDark, { at: [5, 0, 0.6], facing: '-x', depth: 0.06 });
  onFace(b, '-z', [0, 0, -12], () => win(b, -8, 2.4, 1.1, 1.4, trav, { shape: 'round', border: 0.14, z: -0.2 }));
}

export const imperialDomus: BuildingDef = {
  id: 'imperial-domus',
  name: 'Imperial town house',
  style: 'Roman Imperial',
  date: 'c. AD 120',
  summary:
    'Under the emperors the great house is built of brick-faced concrete and dressed inside with coloured marble. ' +
    'It rises to an upper storey, and its street front is let out in arched shops below a balcony on travertine brackets, as in the houses of Ostia. ' +
    'The old dark atrium has gone; the house now centres on a bright court with a long pool and a fountain wall (nymphaeum) of marble niches and falling water. ' +
    'Concrete vaults let the family build its own small bath suite, with a cold room, a warm room and a domed hot room heated from below.',
  materials: ['brick-faced concrete', 'travertine', 'coloured marble veneer', 'concrete vaults', 'fired clay roof tiles'],
  influences: ['roman-concrete'],
  lookFor: [
    { label: 'Nymphaeum', note: 'A fountain wall faced with marble, with niches for statues and water spilling down steps into a basin.', at: [0, 3.0, -10.6] },
    { label: 'Private bath suite', note: 'Barrel-vaulted cold and warm rooms lead to a domed hot room, heated by hot air under the floor and in the walls.', at: [8, 6.6, -9.0] },
    { label: 'Brick-faced concrete', note: 'The walls are concrete faced with neat triangular bricks, with travertine for arches, brackets and sills.', at: [-9.5, 3.0, 12.2] },
    { label: 'Balcony on brackets', note: 'A timber balcony on travertine corbels runs along the upper storey over the shops.', at: [-4, 4.4, 13.0] },
    { label: 'Shops with arched openings', note: 'The street front is let as shops, each a broad brick arch with a mezzanine window above.', at: [8.5, 1.6, 12.3] },
  ],
  build(b) {
    const brick = b.pick([P.brickOrange, tint(P.brickOrange, -0.04), P.brickRed]);
    const trav = P.travertine;
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05)]);
    const marble = P.marble;

    imperialStreetRange(b, brick, trav, tile);
    imperialMainRange(b, brick, trav, tile);
    // marble portico in front of it
    for (const z of [-7.5, -4, -0.5, 3]) col(b, -4.0, z, 0.2, 3.6, marble, { cap: 'corinthian', segs: 6 });
    b.box(0.5, 0.35, 11.5, marble, { at: [-4.0, 3.6, -2.25] });
    b.shed(1.4, 11.5, 0.5, tile, { at: [-4.4, 3.95, -2.25], high: '-x' });

    imperialBaths(b, brick, trav, tile);
    // a door from the court through the nymphaeum wall to the back lane
    onFace(b, '-z', [0, 0, -12], () => b.panel(1.2, 2.3, P.oakDark, { at: [3.0, 0, 0], depth: 0.06 }));

    // ---- the court: marble paving, a long pool and the fountain wall
    b.box(10, 0.05, 18, tint(marble, -0.05), { at: [0, 0, -2.0] });
    b.box(2.4, 0.3, 8, marble, { at: [0.5, 0, -2.5] });
    b.box(2.0, 0.32, 7.6, P.water, { at: [0.5, 0, -2.5], mat: 'glass' });
    for (const [x, z] of [[-2.2, 3.5], [3.3, 3.5], [3.3, -7.5]]) b.blob(0.6, P.hedge, { at: [x, 0.5, z], stretch: [1, 0.8, 1] });
    b.tree(5, { kind: 'cypress', at: [3.6, 0, 5.4] });
    // nymphaeum
    block(b, 10, 5.4, 1.2, brick, 0, -11.4);
    onFace(b, '+z', [0, 0, -10.8], () => {
      b.box(9.4, 4.6, 0.12, marble, { at: [0, 0.4, 0.06] });
      b.box(9.8, 0.4, 0.5, trav, { at: [0, 5.0, 0.25] });
      for (const [x, shape] of [[-3.2, 'rect'], [0, 'round'], [3.2, 'rect']] as const) {
        b.panel(1.4, 2.6, P.marbleGreen, { at: [x, 1.4, 0.12], shape, depth: 0.04 });
        b.cyl(0.22, 1.6, marble, { at: [x, 1.5, 0.3], segs: 6 });
        b.sphere(0.2, marble, { at: [x, 3.3, 0.3], segs: 5 });
        b.box(0.9, 0.3, 0.6, P.marbleRed, { at: [x, 1.1, 0.3] });
      }
      b.stairs(2.4, 1.1, 1.2, 4, P.marbleGreen, { at: [0, 0, 1.0] });
      b.box(2.2, 0.06, 1.1, P.water, { at: [0, 1.14, 0.9], mat: 'glass' });
    });
    b.box(5.4, 0.45, 2.2, marble, { at: [0, 0, -9.0] });
    b.box(5.0, 0.47, 1.8, P.water, { at: [0, 0, -9.0], mat: 'glass' });
  },
};
