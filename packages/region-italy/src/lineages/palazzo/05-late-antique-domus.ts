import { P, tint, type BuildingDef } from '@ah/kit';
import { block, col, onFace, win } from './shared';

export const lateAntiqueDomus: BuildingDef = {
  id: 'late-antique-domus',
  name: 'Late Roman mansion',
  style: 'Late Antique',
  date: 'c. AD 380',
  summary:
    'In the late empire the town has fewer rich families, but they live more grandly than ever. ' +
    'Their mansions are built of brick, often with bands of small tufa blocks, and reuse columns and marble taken from older buildings, so that no two columns match. ' +
    'The house is arranged for receiving: a tall hall ending in an apse, where the master sat in state, and a fountain court where arches spring straight from the tops of the columns, a late Roman habit that the earlier domus never used.',
  materials: ['brick with tufa bands', 'reused marble columns', 'marble floors and veneer', 'fired clay roof tiles'],
  modelledOn: 'House of Cupid and Psyche, Ostia (early fourth century), enlarged',
  influences: ['christian-basilica'],
  lookFor: [
    { label: 'Apsed reception hall', note: 'A tall hall ending in a semicircular apse under a half-dome, where the owner received guests as an official would.', at: [0, 5.5, -12.0] },
    { label: 'Arches on columns', note: 'The arches of the fountain court rest directly on the columns, with no entablature between.', at: [-4.6, 3.6, 4.0] },
    { label: 'Reused columns (spolia)', note: 'Columns of green, red and white marble, taken from older buildings, stand side by side.', at: [-4.6, 1.5, 1.6] },
    { label: 'Fountain court', note: 'A nymphaeum of marble niches and a pool fill the court in front of the hall.', at: [0, 0.6, 3.0] },
    { label: 'Brick and tufa bands', note: 'Courses of brick alternate with bands of small tufa blocks (opus vittatum mixtum).', at: [10.0, 2.0, 12.2] },
  ],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.04), P.brickOrange]);
    const tufa = P.tufa;
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05)]);
    const marble = P.marble;
    const bands = (w: number, d: number, x: number, z: number, h: number) => {
      for (let y = 1.0; y < h - 0.5; y += 1.4) b.box(w + 0.04, 0.4, d + 0.04, tufa, { at: [x, y, z], jitter: false });
    };

    // ---- the apsed hall at the back
    const Hh = 7.5;
    block(b, 10, Hh, 8.5, brick, 0, -5.75);
    bands(10, 8.5, 0, -5.75, Hh);
    b.gable(10, 8.5, 1.8, tile, { at: [0, Hh, -5.75], ridge: 'z', overhang: 0.4, wall: brick });
    b.lathe([[3.2, 0], [3.2, 6.0]], brick, { at: [0, 0, -10], segs: 8, start: Math.PI / 2, sweep: Math.PI });
    b.lathe([[3.4, 6.0], [2.6, 6.9], [1.4, 7.4], [0.01, 7.6]], tile, { at: [0, 0, -10], segs: 8, start: Math.PI / 2, sweep: Math.PI });
    for (const a of [Math.PI * 0.75, Math.PI, Math.PI * 1.25]) {
      b.group({ at: [3.2 * Math.sin(a), 0, -10 + 3.2 * Math.cos(a)], rotY: a }, () => win(b, 0, 3.4, 0.9, 1.8, tufa, { shape: 'round', border: 0.12 }));
    }
    b.collider(6.4, 3.2, { at: [0, 0, -11.6] });
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * 5, 0, -5.75], () => {
        for (const x of [-2.5, 0.5, 3.0]) win(b, x, 4.2, 1.1, 2.2, tufa, { shape: 'round', border: 0.14 });
      });
    }
    onFace(b, '+z', [0, 0, -1.5], () => {
      b.panel(2.6, 4.2, P.oakDark, { at: [0, 0, 0], shape: 'round', depth: 0.08 });
      b.panel(3.2, 4.6, marble, { at: [0, 0, 0], shape: 'round', depth: 0.05 });
      win(b, 0, 5.3, 1.6, 1.6, tufa, { shape: 'round', border: 0.14 });
    });

    // ---- ranges of rooms round the court
    block(b, 6, 5.0, 22, brick, -8, 1);
    bands(6, 22, -8, 1, 5);
    b.gable(6, 22, 1.2, tile, { at: [-8, 5, 1], ridge: 'z', overhang: 0.4, wall: brick });
    block(b, 6, 5.6, 19, brick, 8, -0.5);
    bands(6, 19, 8, -0.5, 5.6);
    b.gable(6, 19, 1.2, tile, { at: [8, 5.6, -0.5], ridge: 'z', overhang: 0.4, wall: brick });
    // front range with the street door
    b.sym((s) => block(b, 4.2, 4.6, 3.0, brick, s * 2.9, 10.5));
    b.box(1.6, 0.06, 3, P.paving, { at: [0, 0, 10.5] });
    b.box(1.6, 1.4, 3, brick, { at: [0, 3.2, 10.5] });
    b.gable(10, 3, 0.8, tile, { at: [0, 4.6, 10.5], overhang: 0.3, wall: brick });
    bands(10, 3, 0, 10.5, 4.6);
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * 11, 0, 0], () => {
        for (const x of [-7, -2, 3, 8]) win(b, x, 2.8, 0.8, 1.2, tufa, { shape: 'round', border: 0.12 });
      });
    }
    onFace(b, '+z', [0, 0, 12], () => {
      for (const x of [-8, 8]) win(b, x, 2.8, 0.8, 1.2, tufa, { shape: 'round', border: 0.12 });
      b.panel(1.4, 3.0, P.oakDark, { at: [0, 0, 0], shape: 'round', depth: 0.08 });
      b.panel(1.9, 3.3, P.travertine, { at: [0, 0, 0], shape: 'round', depth: 0.05 });
    });
    onFace(b, '-z', [0, 0, -12], () => {
      for (const x of [-8, 8]) win(b, x, 2.8, 0.8, 1.2, tufa, { shape: 'round', border: 0.12 });
    });

    // ---- the fountain court: arcade on reused columns, niches, a pool
    b.box(10, 0.05, 10.5, tint(marble, -0.08), { at: [0, 0, 3.75] });
    const cols = [P.marbleGreen, marble, P.porphyry, P.marbleYellow, marble];
    b.archWall(9.0, 4.6, 0.4, brick, { at: [-4.6, 0, 3.6], facing: '+x', openings: 4, openW: 1.9, openH: 3.9, shape: 'round' });
    for (let i = 0; i < 5; i++) {
      const z = 3.6 + 4.5 - i * 2.25;
      col(b, -4.3, z, 0.2, 2.95, cols[i], { cap: 'corinthian', segs: 6 });
    }
    // niches behind the arcade, on the wall of the left range
    onFace(b, '+x', [-5, 0, 3.6], () => {
      for (const [x, shape] of [[-3.4, 'round'], [-1.1, 'rect'], [1.1, 'round'], [3.4, 'rect']] as const) {
        b.panel(1.0, 2.0, P.marbleGreen, { at: [x, 0.8, 0], shape, depth: 0.04 });
        b.box(1.2, 0.6, 0.5, marble, { at: [x, 0, 0.25] });
      }
    });
    b.box(4.0, 0.4, 5.0, marble, { at: [0.6, 0, 3.6] });
    b.box(3.6, 0.42, 4.6, P.water, { at: [0.6, 0, 3.6], mat: 'glass' });
    b.cyl(0.25, 1.4, marble, { at: [0.6, 0.4, 3.6], segs: 6 });
    b.box(2.4, 0.5, 0.8, marble, { at: [3.6, 0, 7.4] });
    b.tree(4.5, { kind: 'olive', at: [3.5, 0, 0.6] });
  },
};
