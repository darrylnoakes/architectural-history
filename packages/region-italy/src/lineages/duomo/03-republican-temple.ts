import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { REP_PODIUM, honorificStatue, oldAltar, republicanPodiumCore } from './shared';

const TZ = REP_PODIUM.z;
const W = REP_PODIUM.w;
const D = REP_PODIUM.d;
const PH = REP_PODIUM.h;
const CH = 8.2; // column height
const STUCCO = P.stucco;
const TUFA = P.tufa;
const TRAV = P.travertine;

export const republicanTemple: BuildingDef = {
  id: 'republican-temple',
  name: 'Republican temple',
  style: 'Late Republican, Hellenised Italic',
  date: 'c. 120 BC',
  summary:
    'Rome now rules Italy, and the old timber-and-terracotta temple has been rebuilt in stone in the Hellenised fashion of the capital; only the ancient altar in front is kept. ' +
    'It keeps the Italian plan, a high podium with a single front stair and a deep porch, but the columns are now slender and Ionic, and along the sides and back of the cella they become half-columns engaged in the wall, so the building looks surrounded by columns without the cost (a "pseudo-peripteral" temple). ' +
    'It is built of local tufa with harder travertine where the load is greatest, and the whole is coated in white stucco to look like the marble of Greek temples. The roof is now a closed, steeper pediment.',
  materials: ['tufa', 'travertine', 'white stucco', 'clay roof tiles'],
  lookFor: [
    { label: 'Ionic columns', note: 'Slender columns with scrolled (volute) capitals, a Greek order adopted by Rome.', at: [-1.6, PH + CH - 0.4, TZ + D / 2 - 0.4] },
    { label: 'Engaged half-columns', note: 'Along the cella the columns are only half-round and built into the wall: the look of a colonnade with a wall behind.', at: [W / 2 - 0.2, 5.5, TZ - 3] },
    { label: 'Pediment', note: 'A closed triangular gable over the porch, finished with a moulded cornice.', at: [0, PH + CH + 2.6, TZ + D / 2 + 0.4] },
    { label: 'Podium', note: 'The high platform of tufa faced with travertine; the stair is still only at the front.', at: [W / 2 + 0.2, 1.2, TZ + 4] },
  ],
  modelledOn: 'The Temple of Portunus in the Forum Boarium, Rome (c. 120 to 80 BC)',
  influences: ['hellenistic-luxury'],
  build(b) {
    const front = TZ + D / 2;
    const back = TZ - D / 2;
    // podium of tufa with a travertine base and crown
    b.box(W + 0.6, 0.4, D + 0.6, TRAV, { at: [0, 0, TZ] });
    republicanPodiumCore(b, mix(TUFA, TRAV, 0.35));
    b.box(W + 0.4, 0.3, D + 0.4, TRAV, { at: [0, PH - 0.3, TZ] });
    b.stairs(8.4, PH, 3.6, 11, TRAV, { at: [0, 0, front + 1.8] });
    b.sym((s) => b.box(1.0, PH * 0.55, 3.6, mix(TUFA, TRAV, 0.35), { at: [s * 4.7, 0, front + 1.8] }));

    // column grid: four across, two deep in the porch, then half-columns on the cella
    const xs = [-4.5, -1.5, 1.5, 4.5];
    const pitch = 3.0;
    const z0 = front - 0.7;
    const cellaFront = z0 - pitch * 2 + 0.7;
    const cellaBack = back + 0.7;
    // the cella, its walls set back so the half-columns stand proud
    b.box(9.0, CH, cellaFront - cellaBack, STUCCO, { at: [0, PH, (cellaFront + cellaBack) / 2] });
    b.box(2.4, 5.2, 0.12, P.bronze, { at: [0, PH, cellaFront + 0.04], jitter: false });
    b.box(3.0, 5.6, 0.08, TRAV, { at: [0, PH, cellaFront + 0.01], jitter: false });
    for (const x of xs) b.column(0.42, CH, STUCCO, { at: [x, PH, z0], order: 'ionic', segs: 8 });
    b.sym((s) => b.column(0.42, CH, STUCCO, { at: [s * 4.5, PH, z0 - pitch], order: 'ionic', segs: 8 }));
    for (let z = z0 - pitch * 2; z >= cellaBack - 0.01; z -= pitch) {
      b.sym((s) => b.column(0.42, CH, STUCCO, { at: [s * 4.5, PH, z], order: 'ionic', segs: 8 }));
    }
    for (const x of [-1.5, 1.5]) b.column(0.42, CH, STUCCO, { at: [x, PH, cellaBack], order: 'ionic', segs: 8 });

    // entablature: architrave, a frieze of garlands, cornice
    const ey = PH + CH;
    const ez = (front + back) / 2;
    const ed = front - back - 0.6;
    b.box(9.9, 0.65, ed, STUCCO, { at: [0, ey, ez] });
    b.box(9.9, 0.7, ed, tint(STUCCO, -0.03), { at: [0, ey + 0.65, ez] });
    for (let i = 0; i < 7; i++) {
      const z = front - 0.3 - (ed * (i + 0.5)) / 7;
      b.sym((s) => b.box(0.06, 0.32, 0.9, tint(STUCCO, -0.12), { at: [s * 4.96, ey + 0.82, z], jitter: false }));
    }
    b.sym((s) => b.box(0.9, 0.32, 0.06, tint(STUCCO, -0.12), { at: [s * 2.4, ey + 0.82, front - 0.3], jitter: false }));
    b.box(10.5, 0.4, ed + 0.6, STUCCO, { at: [0, ey + 1.35, ez] });
    // the closed pediment and tiled roof
    const ry = ey + 1.75;
    b.gable(10.3, ed + 0.4, 2.5, P.romanTile, { ridge: 'z', at: [0, ry, ez], overhang: 0.3, wall: STUCCO });
    b.sym((s) => b.beam([s * 5.35, ry - 0.05, front + 0.05], [0, ry + 2.65, front + 0.05], 0.35, 0.35, STUCCO));
    b.box(10.6, 0.2, 0.5, STUCCO, { at: [0, ry - 0.15, front - 0.05] });

    // the paved forum, the old altar kept before the stair, and a bronze statue on a base
    b.box(26, 0.04, 40, P.paving, { at: [0, 0, 1], jitter: false });
    oldAltar(b, TRAV);
    honorificStatue(b);
    b.tree(9, { at: [10.5, 0, -12], kind: 'cypress' });
    b.tree(8.5, { at: [-10.5, 0, -14], kind: 'cypress' });
    b.tree(9.5, { at: [10.5, 0, -17], kind: 'cypress' });

    b.collider(W, D + 3.6, { at: [0, 0, TZ + 1.8] });
  },
};
