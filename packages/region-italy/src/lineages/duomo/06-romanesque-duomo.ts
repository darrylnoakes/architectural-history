import { P, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, gallery, bands, blindArcade, archHead, framed, statue, FZ, FF, NW, AW, MARBLE, STRIPE_R, RECESS, ROMANESQUE, TOWER } from './shared';

const FW = 9.8; // half-width of the front

/**
 * The Pisan-Lucchese front: a ground storey of blind arches holding three doors, then tiers of open
 * dwarf galleries, the lowest across the whole front, the upper ones across the nave and the gable.
 */
export function romanesqueFacade(b: Builder) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  // ground storey: banded wall with a relief of seven blind arches
  b.box(FW * 2, 8.8, t, MARBLE, { at: [0, 0, zc] });
  bands(b, FW * 2, t, 0.6, 8.6, 1.1, 0.22, STRIPE_R, 0, zc);
  blindArcade(b, { len: FW * 2, y0: 0.6, y1: 8.8, n: 7, archTop: 7.5, at: [0, 0, FF], facing: '+z', color: MARBLE, depth: 0.28, pier: 0.6 });
  const pitch = (FW * 2) / 7;
  for (let i = 0; i < 7; i++) {
    const x = -FW + pitch * (i + 0.5);
    const door = i === 3 ? 2.4 : i === 1 || i === 5 ? 1.7 : 0;
    if (door) {
      const dh = i === 3 ? 4.4 : 3.6;
      framed(b, 'rect', door, dh, [x, 0.6, FF], '+z', P.travertine, P.bronze, 0.22);
      // the lunette over the door, filled with a gilded mosaic
      b.extrude(archHead('round', door / 2, 0.6 + dh + 0.22, x), 0.06, P.gold, { at: [0, 0, FF + 0.03], jitter: false });
      b.box(door + 0.5, 0.25, 0.12, P.travertine, { at: [x, 0.6 + dh, FF + 0.04], jitter: false });
    } else {
      // a lozenge of dark marble inlaid in the head of each blind arch: a Pisan signature
      b.box(0.75, 0.75, 0.06, STRIPE_R, { at: [x, 5.4, FF + 0.03], rot: [0, 0, Math.PI / 4], jitter: false });
      b.box(0.9, 0.9, 0.05, P.marbleRed, { at: [x, 2.6, FF + 0.03], rot: [0, 0, Math.PI / 4], jitter: false });
    }
  }
  b.box(FW * 2 + 0.2, 0.3, t + 0.4, MARBLE, { at: [0, 8.6, zc + 0.15] });

  // first gallery, the whole width of the front
  b.box(FW * 2, 2.9, t, MARBLE, { at: [0, 8.8, zc] });
  gallery(b, { x0: -FW, x1: FW, y0: 8.9, h: 2.8, n: 11, z: FF });
  // sloping shoulders over the aisles
  b.sym((s) => {
    b.extrude([[s * NW, 11.7], [s * FW, 11.7], [s * NW, 13.6]], t, MARBLE, { at: [0, 0, zc] });
    b.beam([s * FW, 11.75, FF + 0.1], [s * NW, 13.7, FF + 0.1], 0.35, 0.3, MARBLE);
  });
  // two galleries across the nave, then a sloping one in the gable
  for (const y of [11.7, 14.4]) {
    b.box(NW * 2 + 0.2, 2.7, t, MARBLE, { at: [0, y, zc] });
    gallery(b, { x0: -NW - 0.1, x1: NW + 0.1, y0: y, h: 2.7, n: 7, z: FF });
  }
  const g0 = 17.1;
  const apex = 20.0;
  b.box(NW * 2 + 0.6, 0.25, 0.85, MARBLE, { at: [0, g0, FF + 0.35] });
  b.extrude([[-NW - 0.1, g0], [NW + 0.1, g0], [0, apex]], t, MARBLE, { at: [0, 0, zc] });
  b.extrude([[-NW + 0.4, g0 + 0.2], [NW - 0.4, g0 + 0.2], [0, apex - 0.45]], 0.06, RECESS, { at: [0, 0, FF + 0.03], jitter: false });
  for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) {
    const top = g0 + ((NW + 0.1 - Math.abs(x)) * (apex - g0)) / (NW + 0.1) - 0.45;
    b.cyl(0.1, top - g0 - 0.25, MARBLE, { at: [x, g0 + 0.25, FF + 0.42], segs: 6, jitter: false });
  }
  b.sym((s) => b.beam([s * (NW + 0.4), g0 + 0.05, FF + 0.35], [0, apex + 0.2, FF + 0.35], 0.5, 0.35, MARBLE));
  statue(b, [0, apex + 0.1, FZ + 0.4], 2.0, MARBLE);
}

export const romanesqueDuomo: BuildingDef = {
  id: 'romanesque-duomo',
  name: 'Romanesque cathedral',
  style: 'Tuscan Romanesque',
  date: 'c. 1120',
  summary:
    'With trade booming and the commune proud of itself, the city pulled down the old basilica and built a new, larger cathedral on the same lines, adding a transept to make a cross-shaped plan. ' +
    'It is faced in white marble banded with grey-green, and its front is a screen of round arches: blind arches below, then tiers of little open galleries on slender columns, a fashion set by Pisa Cathedral (begun 1064) and followed at Lucca. ' +
    'A freestanding bell tower, its openings multiplying towards the top, now stands beside it. ' +
    'Only the eight-sided baptistery survives from before, refaced in green and white marble; inside, ancient columns were very likely reused again, as at Pisa.',
  materials: ['white marble', 'grey-green marble or serpentine', 'brick and rubble core', 'clay tiles'],
  lookFor: [
    { label: 'Galleries', note: 'Tiers of open arcades on small columns across the front: decoration, not passages anyone used much.', at: [0, 13.0, FF + 0.8] },
    { label: 'Banded marble', note: 'Courses of dark stone laid in the white, a taste Pisa and Lucca shared with the Islamic Mediterranean they traded with.', at: [AW + 0.3, 4.0, 4.0] },
    { label: 'Blind arcading', note: 'Round arches on pilasters laid over the wall: they frame windows and doors and pattern the whole building.', at: [0, 6.6, FF + 0.5] },
    { label: 'Lozenge inlay', note: 'Diamonds of coloured marble set into the arches, a Pisan ornament.', at: [-2.8, 5.4, FF + 0.2] },
    { label: 'Campanile', note: 'The bell tower stands apart; its openings grow from one to four per storey, lightening the top where the bells swing.', at: [TOWER.x, 24.0, TOWER.z + TOWER.s / 2 + 0.3] },
  ],
  modelledOn: 'Pisa Cathedral (begun 1064) and San Martino, Lucca (front begun 1204)',
  influences: ['islamic-mediterranean'],
  build(b) {
    cathedral(b, ROMANESQUE);
    romanesqueFacade(b);
  },
};
