import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, archPts, archHead, archStrip, circlePts, pinnacle, statue, opening, FZ, FF, NW, AW, MARBLE, RECESS, REVIVAL } from './shared';
import { rose } from './07-gothic-duomo';
import { baroqueChapel } from './09-baroque-duomo';

const FW = 10.2;
const GREEN = P.marbleGreen;
const PINK = tint(P.marbleRed, 0.3);

/** An inlaid panel: green frame, pink field, white centre. Laid flat on the front. */
function inlay(b: Builder, x: number, y0: number, w: number, h: number) {
  b.box(w, h, 0.05, GREEN, { at: [x, y0, FF + 0.025], jitter: false });
  b.box(w - 0.3, h - 0.3, 0.07, PINK, { at: [x, y0 + 0.15, FF + 0.035], jitter: false });
  if (w > 1.2 && h > 1.2) b.box(w - 0.8, h - 0.8, 0.09, MARBLE, { at: [x, y0 + 0.4, FF + 0.045], jitter: false });
}

/** A revival portal: pointed arch in banded green and white, mosaic lunette, gable with a rosette. */
function portal(b: Builder, x: number, w: number, h: number) {
  const y0 = 0.6;
  const z = FF;
  b.extrude(archPts('pointed', w + 1.2, h + 0.7, x, y0), 0.45, MARBLE, { at: [0, 0, z + 0.22], holes: [archPts('pointed', w + 0.5, h + 0.35, x, y0 + 0.02)] });
  b.extrude(archPts('pointed', w + 0.5, h + 0.35, x, y0), 0.3, GREEN, { at: [0, 0, z + 0.15], holes: [archPts('pointed', w, h, x, y0 + 0.02)] });
  const dh = h - (w / 2) * Math.sqrt(3);
  b.box(w, dh, 0.08, P.bronze, { at: [x, y0, z + 0.02], jitter: false });
  b.box(w + 0.1, 0.22, 0.14, MARBLE, { at: [x, y0 + dh, z + 0.05], jitter: false });
  b.extrude(archHead('pointed', w / 2, y0 + dh + 0.22, x, 3), 0.06, P.gold, { at: [0, 0, z + 0.03], jitter: false });
  const gb = y0 + h + 0.75;
  const gw = w / 2 + 0.8;
  const gh = gw * 1.1;
  b.extrude([[x - gw, gb], [x + gw, gb], [x, gb + gh]], 0.35, MARBLE, { at: [0, 0, z + 0.6] });
  b.extrude([[x - gw + 0.35, gb + 0.2], [x + gw - 0.35, gb + 0.2], [x, gb + gh - 0.4]], 0.05, PINK, { at: [0, 0, z + 0.8], jitter: false });
  b.extrude(circlePts(x, gb + gh * 0.4, gw * 0.22, 10), 0.05, GREEN, { at: [0, 0, z + 0.84], jitter: false });
  b.box(gw * 2 + 0.2, 0.25, 0.8, MARBLE, { at: [x, gb - 0.25, z + 0.4], jitter: false });
  b.sym((s) => pinnacle(b, [x + s * (gw + 0.05), gb - 0.25, z + 0.45], 0.16, 1.8, MARBLE));
}

/**
 * The new front of the 1880s, after De Fabris’s front for Florence: polychrome panelling of white,
 * green and pink marble, gabled portals, a long row of statues in niches, a rose, square-topped side
 * bays with a little arcaded frieze, and a low central gable with a tondo.
 */
export function revivalFacade(b: Builder) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  b.box(FW * 2, 10.2, t, MARBLE, { at: [0, 0, zc] });
  b.sym((s) => b.box(FW - NW, 5.8, t, MARBLE, { at: [s * (FW + NW) / 2, 10.2, zc] }));
  b.box(NW * 2, 11.2, t, MARBLE, { at: [0, 10.2, zc] });
  b.box(FW * 2 + 0.1, 0.6, t + 0.1, GREEN, { at: [0, 0.6, zc], jitter: false });

  portal(b, 0, 3.0, 6.4);
  b.sym((s) => portal(b, s * 7.6, 1.9, 4.8));
  b.sym((s) => {
    inlay(b, s * 4.0, 1.4, 2.5, 3.2);
    inlay(b, s * 4.0, 4.9, 2.5, 4.6);
  });
  // a band of green and the row of niches with statues across the whole front
  b.box(FW * 2 + 0.3, 0.3, 0.7, GREEN, { at: [0, 10.2, FF + 0.1], jitter: false });
  const n = 11;
  const pitch = (FW * 2 - 0.6) / n;
  for (let i = 0; i < n; i++) {
    const x = -FW + 0.3 + pitch * (i + 0.5);
    opening(b, 'pointed', 1.05, 2.7, [x, 10.6, FF], '+z', RECESS, 0.06);
    statue(b, [x, 10.62, FF + 0.22], 2.0, MARBLE);
  }
  b.box(FW * 2 + 0.3, 0.3, 0.6, GREEN, { at: [0, 13.6, FF + 0.1], jitter: false });
  b.box(FW * 2 + 0.1, 0.25, 0.5, MARBLE, { at: [0, 13.9, FF + 0.1], jitter: false });

  // side bays: panels, an arcaded frieze and a flat top with a parapet
  b.sym((s) => {
    const xc = s * (FW + NW) / 2;
    inlay(b, xc, 14.3, 2.8, 1.5);
    b.extrude(archStrip('round', -1.7, 1.7, 6, 15.9, 16.3, 0.2, 2), 0.2, MARBLE, { at: [xc, 0, FF + 0.1], jitter: false });
    b.box(FW - NW + 0.2, 0.35, 0.7, MARBLE, { at: [xc, 16.0, FZ + 0.4], jitter: false });
  });
  // the centre: rose in a square of inlay, then the low gable with its tondo
  b.box(6.4, 6.4, 0.05, GREEN, { at: [0, 14.3, FF + 0.025], jitter: false });
  b.box(6.0, 6.0, 0.07, PINK, { at: [0, 14.5, FF + 0.035], jitter: false });
  rose(b, 0, 17.5, 2.45, FF + 0.1);
  const gb = 21.4;
  const apex = 25.4;
  b.box(NW * 2 + 0.4, 0.35, t + 0.5, MARBLE, { at: [0, gb - 0.35, zc + 0.25], jitter: false });
  b.extrude([[-NW, gb], [NW, gb], [0, apex]], t, MARBLE, { at: [0, 0, zc] });
  b.extrude([[-NW + 0.6, gb + 0.3], [NW - 0.6, gb + 0.3], [0, apex - 0.6]], 0.05, PINK, { at: [0, 0, FF + 0.03], jitter: false });
  b.extrude(circlePts(0, gb + 1.5, 1.15, 14), 0.07, GREEN, { at: [0, 0, FF + 0.05], jitter: false });
  b.extrude(circlePts(0, gb + 1.5, 0.95, 14), 0.07, P.gold, { at: [0, 0, FF + 0.08], jitter: false });
  b.sym((s) => b.beam([s * (NW + 0.3), gb - 0.05, FF + 0.1], [0, apex + 0.2, FF + 0.1], 0.45, 0.3, MARBLE));
  b.cyl(0.1, 1.3, MARBLE, { at: [0, apex + 0.1, FF], segs: 6 });
  b.box(0.8, 0.12, 0.12, MARBLE, { at: [0, apex + 1.0, FF] });

  // four piers: white with a green strip, ending in pinnacles
  for (const [x, top] of [[-FW + 0.45, 16.6], [FW - 0.45, 16.6], [-NW, 22.0], [NW, 22.0]] as const) {
    b.box(0.9, top, 1.0, MARBLE, { at: [x, 0, FZ + 0.5] });
    b.box(0.4, top - 1.4, 0.05, GREEN, { at: [x, 0.9, FZ + 1.02], jitter: false });
    pinnacle(b, [x, top, FZ + 0.5], 0.4, 3.4, MARBLE);
  }
}

export const completedFacade: BuildingDef = {
  id: 'completed-facade',
  name: 'The cathedral "completed"',
  style: 'Gothic Revival',
  date: 'c. 1887',
  summary:
    'The nineteenth century saw the medieval cathedral as the pride of the nation and wanted it finished and pure. Often it gave a front to a church that had never had a finished one: at Florence the unfinished medieval front was pulled down in 1587 and the cathedral stood bare-fronted until Emilio De Fabris’s façade was finished in 1887. Here, as at Naples, where Enrico Alvino’s revived Gothic front (built 1877 to 1905) replaced an older, much-altered one but kept its fifteenth-century doorways, a front already stood. Cracked by earthquakes, worn and patched over nearly six centuries, it was judged past saving, and restorers replaced it with a new one in revived Gothic, a drastic choice that few towns made. ' +
    'It is a patterned front of white, green and pink marble: gabled doors with mosaic lunettes, a long row of saints in niches, a rose window, and a low gable with a tondo, more regular and more horizontal than the real Gothic front it replaced. ' +
    'The houses that had leaned against the flanks for seven centuries were pulled down to leave the cathedral standing free in a wider square. Behind the new front, the dome, the striped nave, the Romanesque apse, the Baroque chapel, the bell tower and the baptistery all stand as before.',
  materials: ['white Carrara marble', 'green marble of Prato', 'red and pink marble', 'mosaic', 'bronze doors'],
  lookFor: [
    { label: 'Polychrome marble', note: 'Panels of green and pink framed in white, a nineteenth-century reading of Florence’s medieval marble patterns.', at: [-4.0, 7.0, FF + 0.5] },
    { label: 'Statues in niches', note: 'A row of saints in pointed niches runs across the whole front.', at: [2.2, 13.0, FF + 0.8] },
    { label: 'Tondo', note: 'A round panel in the gable, the place for a relief or mosaic of the Virgin.', at: [0, 22.9, FF + 0.5] },
    { label: 'Cleared square', note: 'The houses against the flanks are gone; the cathedral now stands free, as nineteenth-century planners liked their monuments.', at: [AW + 3.0, 0.6, -2.0] },
  ],
  modelledOn: 'The façade of Florence Cathedral, by Emilio De Fabris (1876 to 1887)',
  build(b) {
    cathedral(b, REVIVAL);
    revivalFacade(b);
    baroqueChapel(b);
  },
};
