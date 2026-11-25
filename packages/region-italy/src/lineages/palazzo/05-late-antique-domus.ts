import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { imperialBaths, imperialMainRange, imperialStreetRange } from './04-imperial-domus';
import { block, col, onFace, win } from './shared';

/** Where the apse of the late Roman hall stands; the Lombard chapel is later built against it. */
export const APSE = { x: -1, z: -10, r: 2.6 };

/** The apse of the reception hall: its curved wall, half-dome roof and three windows. */
export function lateApse(b: Builder, brick: number, tufa: number, tile: number): void {
  const { x, z, r } = APSE;
  b.lathe([[r, 0], [r, 6.0]], brick, { at: [x, 0, z], segs: 8, start: Math.PI / 2, sweep: Math.PI });
  b.lathe([[r + 0.15, 6.0], [r - 0.4, 6.9], [r * 0.48, 7.4], [0.01, 7.6]], tile, { at: [x, 0, z], segs: 8, start: Math.PI / 2, sweep: Math.PI });
  for (const a of [Math.PI * 0.75, Math.PI, Math.PI * 1.25]) {
    b.group({ at: [x + r * Math.sin(a), 0, z + r * Math.cos(a)], rotY: a }, () => win(b, 0, 3.4, 0.9, 1.8, tufa, { shape: 'round', border: 0.12 }));
  }
  b.collider(2 * r, r, { at: [x, 0, z - r / 2] });
}

export const lateAntiqueDomus: BuildingDef = {
  id: 'late-antique-domus',
  name: 'Late Roman mansion',
  style: 'Late Antique',
  date: 'c. AD 380',
  summary:
    'In the late empire the town has fewer rich families, but they live more grandly than ever, and the house is arranged for receiving. ' +
    'This one is the imperial house remodelled rather than rebuilt: its street range, main wing and baths still stand, though the shops on the street are walled up, while the nymphaeum and the long pool have made way for a tall hall ending in an apse, where the master sat in state. ' +
    'The new work is of brick with bands of small tufa blocks, and reuses columns and marble taken from older buildings, so that no two columns match. ' +
    'In the fountain court the arches spring straight from the tops of the columns, a late Roman habit that the earlier domus rarely used.',
  materials: ['brick with tufa bands', 'reused marble columns', 'marble floors and veneer', 'fired clay roof tiles'],
  modelledOn: 'House of Cupid and Psyche, Ostia (about AD 300, early fourth century), enlarged',
  influences: [],
  lookFor: [
    { label: 'Apsed reception hall', note: 'A tall hall ending in a semicircular apse under a half-dome, where the owner received guests as an official would.', at: [-1, 5.5, -12.4] },
    { label: 'Arches on columns', note: 'The arches of the fountain court rest directly on the columns, with no entablature between.', at: [-4.6, 3.6, 4.0] },
    { label: 'Reused columns (spolia)', note: 'Columns of green, red and white marble, taken from older buildings, stand side by side.', at: [-4.3, 1.5, 0.95] },
    { label: 'Fountain court', note: 'A nymphaeum of marble niches and a pool fill the court in front of the hall.', at: [0, 0.6, 3.0] },
    { label: 'Brick and tufa bands', note: 'Courses of brick alternate with bands of small tufa blocks (opus vittatum mixtum).', at: [2.5, 2.0, -1.4] },
  ],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.04), P.brickOrange]);
    const tufa = P.tufa;
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05)]);
    const marble = P.marble;
    const trav = P.travertine;
    const bands = (w: number, d: number, x: number, z: number, h: number) => {
      for (let y = 1.0; y < h - 0.5; y += 1.4) b.box(w + 0.04, 0.4, d + 0.04, tufa, { at: [x, y, z], jitter: false });
    };

    // ---- the old house kept: the street range (its shops walled in), the main range, the baths
    imperialStreetRange(b, brick, trav, tile, true);
    imperialMainRange(b, brick, trav, tile);
    imperialBaths(b, brick, trav, tile);

    // ---- the apsed hall, new, at the back of the old court where the nymphaeum stood
    const { x: hx, z: hz } = APSE;
    const Hh = 7.5;
    const zh = (hz - 1.5) / 2;
    block(b, 8, Hh, -1.5 - hz, brick, hx, zh);
    bands(8, -1.5 - hz, hx, zh, Hh);
    b.gable(8, -1.5 - hz, 1.6, tile, { at: [hx, Hh, zh], ridge: 'z', overhang: 0.4, wall: brick });
    lateApse(b, brick, tufa, tile);
    onFace(b, '+x', [hx + 4, 0, zh], () => {
      for (const x of [-2.5, 0.5, 3.0]) win(b, x, 4.2, 1.1, 2.2, tufa, { shape: 'round', border: 0.14 });
    });
    onFace(b, '+z', [hx, 0, -1.5], () => {
      b.panel(2.6, 4.2, P.oakDark, { at: [0, 0, 0], shape: 'round', depth: 0.08 });
      b.panel(3.2, 4.6, marble, { at: [0, 0, 0], shape: 'round', depth: 0.05 });
      win(b, 0, 5.3, 1.6, 1.6, tufa, { shape: 'round', border: 0.14 });
    });

    // ---- the fountain court: arcade on reused columns, niches, a pool
    b.box(10, 0.05, 8.5, tint(marble, -0.08), { at: [0, 0, 2.75] });
    const cols = [P.marbleGreen, marble, P.porphyry, P.marbleYellow, marble];
    b.archWall(7.8, 4.6, 0.4, brick, { at: [-4.6, 0, 2.9], facing: '+x', openings: 4, openW: 1.55, openH: 3.7, shape: 'round' });
    for (let i = 0; i < 5; i++) col(b, -4.3, 2.9 + 3.9 - i * 1.95, 0.2, 2.95, cols[i], { cap: 'corinthian', segs: 6 });
    bands(0.4, 7.8, -4.6, 2.9, 4.6);
    // niches on the court side of the street range, either side of the entrance passage
    onFace(b, '-z', [0, 0, 7], () => {
      for (const [x, shape] of [[-3.9, 'round'], [-2.4, 'rect'], [2.4, 'rect'], [3.9, 'round']] as const) {
        b.panel(1.0, 2.0, P.marbleGreen, { at: [x, 0.8, 0], shape, depth: 0.04 });
        b.box(1.2, 0.6, 0.5, marble, { at: [x, 0, 0.25] });
      }
    });
    b.box(4.0, 0.4, 5.0, marble, { at: [0.6, 0, 3.6] });
    b.box(3.6, 0.42, 4.6, P.water, { at: [0.6, 0, 3.6], mat: 'glass' });
    b.cyl(0.25, 1.4, marble, { at: [0.6, 0.4, 3.6], segs: 6 });
    b.box(2.4, 0.5, 0.8, marble, { at: [3.6, 0, 6.2] });
    b.tree(4.5, { kind: 'olive', at: [3.5, 0, 0.6] });
  },
};
