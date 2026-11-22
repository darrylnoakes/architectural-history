import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, archStrip, circlePts, pinnacle, statue, opening, FZ, FF, NW, AW, MARBLE, RECESS, REVIVAL } from './shared';
import { rose, lowerRegister, FW, PIERS } from './07-gothic-duomo';
import { baroqueChapel } from './09-baroque-duomo';

const GREEN = P.marbleGreen;
const PINK = tint(P.marbleRed, 0.3);

/** An inlaid panel: green frame, pink field, white centre. Laid flat on the front. */
function inlay(b: Builder, x: number, y0: number, w: number, h: number) {
  b.box(w, h, 0.05, GREEN, { at: [x, y0, FF + 0.025], jitter: false });
  b.box(w - 0.3, h - 0.3, 0.07, PINK, { at: [x, y0 + 0.15, FF + 0.035], jitter: false });
  if (w > 1.2 && h > 1.2) b.box(w - 0.8, h - 0.8, 0.09, MARBLE, { at: [x, y0 + 0.4, FF + 0.045], jitter: false });
}

/**
 * The front finished in the 1880s, after De Fabris’s front for Florence, above the surviving medieval
 * ground storey (whose gables now get gold mosaic): a row of saints in niches, polychrome panels of
 * white, green and pink marble, a rose in a square frame, three gables filled with mosaic, the middle
 * one with a tondo, and four pinnacled piers.
 */
export function revivalFacade(b: Builder) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  lowerRegister(b, true);
  const y0 = 10.75;
  b.sym((s) => b.box(FW - NW, 15.2 - y0, t, MARBLE, { at: [s * (FW + NW) / 2, y0, zc] }));
  b.box(NW * 2, 20.4 - y0, t, MARBLE, { at: [0, y0, zc] });

  // the row of niches with statues across the whole front
  const n = 11;
  const pitch = (FW * 2 - 0.6) / n;
  for (let i = 0; i < n; i++) {
    const x = -FW + 0.3 + pitch * (i + 0.5);
    opening(b, 'pointed', 1.0, 2.5, [x, 10.85, FF], '+z', RECESS, 0.06);
    statue(b, [x, 10.87, FF + 0.22], 1.9, MARBLE);
  }
  b.box(FW * 2 + 0.3, 0.3, 0.6, GREEN, { at: [0, 13.55, FF + 0.1], jitter: false });
  b.box(FW * 2 + 0.1, 0.25, 0.5, MARBLE, { at: [0, 13.85, FF + 0.1], jitter: false });

  // side bays: a polychrome panel, then a gable filled with gold mosaic
  b.sym((s) => {
    const xc = s * 7.6;
    inlay(b, xc, 14.2, 2.6, 0.9);
    b.box(FW - NW + 0.2, 0.3, 0.7, MARBLE, { at: [s * (FW + NW) / 2, 15.1, FZ + 0.4], jitter: false });
    b.extrude([[xc - 1.7, 15.4], [xc + 1.7, 15.4], [xc, 19.6]], 0.5, MARBLE, { at: [0, 0, zc + 0.05] });
    b.extrude([[xc - 1.15, 15.7], [xc + 1.15, 15.7], [xc, 18.6]], 0.06, P.gold, { at: [0, 0, FF + 0.33], jitter: false });
    b.extrude(archStrip('round', -1.6, 1.6, 6, 14.85, 15.15, 0.2, 2), 0.15, GREEN, { at: [xc, 0, FF + 0.1], jitter: false });
  });
  // the centre: rose in a square of inlay
  b.box(6.6, 6.2, 0.05, GREEN, { at: [0, 14.1, FF + 0.025], jitter: false });
  b.box(6.2, 5.8, 0.07, PINK, { at: [0, 14.3, FF + 0.035], jitter: false });
  rose(b, 0, 17.2, 2.5, FF + 0.1);
  // the central gable with mosaic and a tondo, taller than the roof behind
  const gb = 20.4;
  const apex = 26.6;
  b.box(NW * 2 + 0.4, 0.35, t + 0.6, MARBLE, { at: [0, gb - 0.35, zc + 0.3], jitter: false });
  b.extrude([[-NW, gb], [NW, gb], [0, apex]], t, MARBLE, { at: [0, 0, zc] });
  b.extrude([[-NW + 0.7, gb + 0.35], [NW - 0.7, gb + 0.35], [0, apex - 1.0]], 0.05, P.gold, { at: [0, 0, FF + 0.03], jitter: false });
  b.extrude(circlePts(0, gb + 2.0, 1.2, 14), 0.07, GREEN, { at: [0, 0, FF + 0.06], jitter: false });
  b.extrude(circlePts(0, gb + 2.0, 1.0, 14), 0.07, MARBLE, { at: [0, 0, FF + 0.09], jitter: false });
  b.sym((s) => b.beam([s * (NW + 0.3), gb - 0.05, FF + 0.1], [0, apex + 0.2, FF + 0.1], 0.45, 0.3, MARBLE));
  b.cyl(0.1, 1.3, MARBLE, { at: [0, apex + 0.1, FF], segs: 6 });
  b.box(0.8, 0.12, 0.12, MARBLE, { at: [0, apex + 1.0, FF] });

  // the four piers carried up on the medieval bases, green-striped, ending in pinnacles
  for (const [x, w] of PIERS) {
    const top = Math.abs(x) < 8 ? 22.6 : 18.6;
    b.box(w, top - 10.75, 1.3, MARBLE, { at: [x, 10.75, FZ + 0.6] });
    b.box(w * 0.4, top - 12.0, 0.05, GREEN, { at: [x, 11.4, FZ + 1.27], jitter: false });
    pinnacle(b, [x, top, FZ + 0.6], w * 0.42, 3.8, MARBLE);
  }
}

export const completedFacade: BuildingDef = {
  id: 'completed-facade',
  name: 'The cathedral "completed"',
  style: 'Gothic Revival',
  date: 'c. 1887',
  summary:
    'For more than five centuries the front had stopped at the top of its doorways, bare brick above. The nineteenth century, which saw the medieval cathedral as the pride of the town and of the new nation, at last finished it, in a revived Gothic of patterned marble. Florence did the same: its half-built medieval front was pulled down in 1587, and the cathedral stood bare-fronted until Emilio De Fabris’s façade was finished in 1887; Santa Croce in Florence got its marble front in 1857 to 1863. ' +
    'The medieval ground storey and its three doorways were kept, their gables now filled with gold mosaic. Above them rise a row of saints in niches, panels of white, green and pink marble, the long-awaited rose window, three gables of gold mosaic (the middle one with a tondo) and four pinnacled piers: more regular and more polished than anything the fourteenth century built. ' +
    'The houses that had leaned against the flanks for seven centuries were pulled down to leave the cathedral standing free in a wider square. Behind the new front, the dome, the striped nave, the Romanesque apse, the Baroque chapel, the bell tower and the baptistery all stand as before.',
  materials: ['white Carrara marble', 'green marble of Prato', 'red and pink marble', 'gold mosaic', 'medieval portals and bronze doors'],
  lookFor: [
    { label: 'Medieval portals', note: 'The three gabled doorways of about 1310 survive at the bottom; only their gables got new mosaic.', at: [0, 9.3, FF + 1.0] },
    { label: 'Statues in niches', note: 'A row of saints in pointed niches runs across the whole front.', at: [2.2, 13.0, FF + 0.8] },
    { label: 'Rose window', note: 'At last the round opening left in the brick gets its stone tracery, framed in green and pink marble.', at: [0, 17.2, FF + 0.6] },
    { label: 'Mosaic gables', note: 'Three gables filled with gold-ground mosaic, the middle one with a tondo, the round panel for an image of the Virgin.', at: [0, 23.4, FF + 0.5] },
    { label: 'Cleared square', note: 'The houses against the flanks are gone; the cathedral now stands free, as nineteenth-century planners liked their monuments.', at: [AW + 3.0, 0.6, -2.0] },
  ],
  modelledOn: 'The façade of Florence Cathedral, by Emilio De Fabris (1876 to 1887)',
  build(b) {
    cathedral(b, REVIVAL);
    revivalFacade(b);
    baroqueChapel(b);
  },
};
