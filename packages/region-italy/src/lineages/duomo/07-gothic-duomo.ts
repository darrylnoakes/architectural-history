import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, archPts, archHead, circlePts, pinnacle, statue, opening, FZ, FF, NW, MARBLE, RECESS, GOTHIC, type Pt } from './shared';

const FW = 10.2; // half-width of the front
const PINK = tint(P.marbleRed, 0.28);
const MOSAIC_BLUE = 0x3a5a8c;

/** A gabled portal: a pointed opening in stepped frames, a bronze door, a mosaic lunette and a gable. */
function portal(b: Builder, x: number, w: number, h: number) {
  const y0 = 0.6;
  const z = FF;
  b.extrude(archPts('pointed', w + 1.4, h + 0.8, x, y0), 0.5, MARBLE, { at: [0, 0, z + 0.25], holes: [archPts('pointed', w + 0.6, h + 0.4, x, y0 + 0.02)] });
  b.extrude(archPts('pointed', w + 0.6, h + 0.4, x, y0), 0.3, PINK, { at: [0, 0, z + 0.15], holes: [archPts('pointed', w, h, x, y0 + 0.02)] });
  const dh = h - (w / 2) * Math.sqrt(3);
  b.box(w, dh, 0.08, P.bronze, { at: [x, y0, z + 0.02], jitter: false });
  b.box(w + 0.1, 0.22, 0.14, MARBLE, { at: [x, y0 + dh, z + 0.05], jitter: false });
  b.extrude(archHead('pointed', w / 2, y0 + dh + 0.22, x, 3), 0.06, P.gold, { at: [0, 0, z + 0.03], jitter: false });
  // the gable (wimperg) above, with a mosaic in it, and pinnacles either side
  const gb = y0 + h + 0.9;
  const gw = w / 2 + 0.9;
  const gh = gw * 1.45;
  b.extrude([[x - gw, gb], [x + gw, gb], [x, gb + gh]], 0.4, MARBLE, { at: [0, 0, z + 0.3] });
  b.extrude([[x - gw + 0.45, gb + 0.25], [x + gw - 0.45, gb + 0.25], [x, gb + gh - 0.5]], 0.06, P.gold, { at: [0, 0, z + 0.52], jitter: false });
  b.box(gw * 2 + 0.2, 0.3, 0.7, MARBLE, { at: [x, gb - 0.3, z + 0.3], jitter: false });
}

/** A plate-tracery rose: a white wheel pierced by a ring of circles, over a dark glazed disc. */
export function rose(b: Builder, x: number, y: number, r: number, z: number, frame = MARBLE) {
  const holes: Pt[][] = [circlePts(x, y, r * 0.24, 10)];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    holes.push(circlePts(x + r * 0.63 * Math.cos(t), y + r * 0.63 * Math.sin(t), r * 0.16, 8));
  }
  b.extrude(circlePts(x, y, r * 0.98, 24), 0.06, P.windowDark, { at: [0, 0, z + 0.03], jitter: false });
  b.extrude(circlePts(x, y, r, 24), 0.22, frame, { at: [0, 0, z + 0.12], holes, jitter: false });
  b.extrude(circlePts(x, y, r + 0.35, 24), 0.12, frame, { at: [0, 0, z + 0.05], holes: [circlePts(x, y, r - 0.05, 24)], jitter: false });
}

/**
 * The Gothic front of Siena and Orvieto: four piers rising to pinnacles divide it into three; three
 * gabled portals below; a rose in a square frame in the middle; three tall gables filled with gold
 * mosaic above, the central one far taller than the roof behind it.
 */
export function gothicFacade(b: Builder) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  // the wall itself: full width to 10.4, the side bays to 14.6, the centre to the gable
  b.box(FW * 2, 10.4, t, MARBLE, { at: [0, 0, zc] });
  b.sym((s) => b.box(FW - NW, 4.2, t, MARBLE, { at: [s * (FW + NW) / 2, 10.4, zc] }));
  b.box(NW * 2, 9.6, t, MARBLE, { at: [0, 10.4, zc] });
  // a plinth band of pink marble and a cornice over the portals
  b.box(FW * 2 + 0.1, 0.6, t + 0.1, PINK, { at: [0, 0.6, zc], jitter: false });
  b.box(FW * 2 + 0.4, 0.35, t + 0.9, MARBLE, { at: [0, 10.4, zc + 0.45], jitter: false });

  portal(b, 0, 3.0, 7.0);
  b.sym((s) => portal(b, s * 7.6, 2.0, 5.0));

  // the rose window in its square frame, with gold mosaic in the corners and a row of niches above
  b.box(6.6, 6.6, 0.12, P.gold, { at: [0, 11.6, FF + 0.06], jitter: false });
  for (const [w, h, x, y] of [[6.9, 0.3, 0, 11.4], [6.9, 0.3, 0, 18.2], [0.3, 7.1, -3.45, 11.4], [0.3, 7.1, 3.45, 11.4]] as const) {
    b.box(w, h, 0.3, PINK, { at: [x, y, FF + 0.15], jitter: false });
  }
  rose(b, 0, 14.9, 2.75, FF + 0.1);
  for (let i = 0; i < 9; i++) {
    const x = -4.0 + i;
    opening(b, 'pointed', 0.6, 1.25, [x, 18.75, FF], '+z', RECESS, 0.06);
    statue(b, [x, 18.75, FF + 0.12], 1.05, MARBLE);
  }
  // side bays: tall mosaic panels over the side portals, then gables
  b.sym((s) => {
    b.box(2.4, 3.0, 0.12, P.gold, { at: [s * 7.6, 10.95, FF + 0.06], jitter: false });
    b.box(1.6, 2.2, 0.06, MOSAIC_BLUE, { at: [s * 7.6, 11.35, FF + 0.12], jitter: false });
    const gb = 14.6;
    b.extrude([[s * 5.9, gb], [s * 9.3, gb], [s * 7.6, gb + 4.6]], 0.5, MARBLE, { at: [0, 0, zc + 0.05] });
    b.extrude([[s * 6.6, gb + 0.3], [s * 8.6, gb + 0.3], [s * 7.6, gb + 3.6]], 0.06, P.gold, { at: [0, 0, FF + 0.33], jitter: false });
  });
  // the central gable, taller than the nave roof behind it
  const gb = 20.0;
  const apex = 27.0;
  b.box(NW * 2 + 0.4, 0.35, t + 0.7, MARBLE, { at: [0, gb - 0.3, zc + 0.35], jitter: false });
  b.extrude([[-NW, gb], [NW, gb], [0, apex]], t, MARBLE, { at: [0, 0, zc] });
  b.extrude([[-NW + 0.7, gb + 0.4], [NW - 0.7, gb + 0.4], [0, apex - 1.1]], 0.06, P.gold, { at: [0, 0, FF + 0.03], jitter: false });
  b.extrude([[-1.3, gb + 1.0], [1.3, gb + 1.0], [1.3, gb + 3.6], [0, gb + 4.4], [-1.3, gb + 3.6]], 0.05, MOSAIC_BLUE, { at: [0, 0, FF + 0.07], jitter: false });
  b.sym((s) => {
    b.beam([s * (NW + 0.3), gb - 0.1, FF + 0.1], [0, apex + 0.25, FF + 0.1], 0.5, 0.35, MARBLE);
    // crockets along the raking edges
    for (let i = 1; i < 6; i++) {
      const f = i / 6;
      b.box(0.3, 0.3, 0.3, MARBLE, { at: [s * NW * (1 - f) + s * 0.15, gb + (apex - gb) * f + 0.25, FF + 0.1], jitter: false });
    }
  });
  b.cyl(0.12, 1.4, MARBLE, { at: [0, apex + 0.2, FF], segs: 6 });
  b.box(0.9, 0.14, 0.14, MARBLE, { at: [0, apex + 1.1, FF] });

  // the four piers and their pinnacles
  for (const [x, top, w] of [[-FW + 0.6, 19.4, 1.2], [FW - 0.6, 19.4, 1.2], [-NW - 0.1, 23.6, 1.1], [NW + 0.1, 23.6, 1.1]] as const) {
    b.box(w, top, 1.3, MARBLE, { at: [x, 0, FZ + 0.6] });
    b.box(w + 0.04, 0.3, 1.34, PINK, { at: [x, 10.0, FZ + 0.6], jitter: false });
    b.box(w + 0.04, 0.3, 1.34, PINK, { at: [x, 14.6, FZ + 0.6], jitter: false });
    opening(b, 'pointed', w * 0.5, 2.2, [x, top - 3.2, FZ + 1.25], '+z', RECESS, 0.04);
    pinnacle(b, [x, top, FZ + 0.6], w * 0.42, 4.2, MARBLE);
  }
}

export const gothicDuomo: BuildingDef = {
  id: 'gothic-duomo',
  name: 'Gothic cathedral',
  style: 'Italian Gothic',
  date: 'c. 1310',
  summary:
    'Two centuries on, the city remade the front in the new Gothic manner. As at Siena and Orvieto it is still a screen of marble set against the church, not a wall of glass: four pinnacled piers, three gabled doorways, a rose window in a square frame, and three tall gables glittering with gold mosaic, the middle one rising well above the roof behind. ' +
    'The nave was raised on pointed arcades and its new upper walls laid in bold black and white bands, with pointed two-light windows; the old round-headed clerestory windows were blocked. ' +
    'Italian builders used pointed arches and rose windows but kept thick walls and small windows, and almost never flying buttresses. The Romanesque aisles, transept and apse, the bell tower (now topped with a spire) and the baptistery all survive.',
  materials: ['white, pink and dark marble', 'gold and coloured glass mosaic', 'bronze doors', 'brick spire', 'clay tiles'],
  lookFor: [
    { label: 'Gables', note: 'Three steep triangular gables crown the front; they hide the low-pitched roofs behind rather than following them.', at: [0, 24.5, FF + 0.6] },
    { label: 'Rose window', note: 'A great round window of stone tracery, set in a square frame as at Orvieto.', at: [0, 14.9, FF + 0.6] },
    { label: 'Mosaic', note: 'Gold-ground glass mosaic fills the gables and the lunettes over the doors, catching the sun across the square.', at: [7.6, 16.5, FF + 0.6] },
    { label: 'Pinnacles', note: 'The four piers that divide the front end in slender pointed pinnacles.', at: [NW + 0.1, 26.0, FZ + 1.4] },
    { label: 'Striped upper nave', note: 'The heightened nave walls are laid in equal bands of dark and white stone, as at Siena and Orvieto; the blocked Romanesque windows show below the new ones.', at: [-NW - 0.3, 15.5, 2.0] },
  ],
  modelledOn: 'The fronts of Siena Cathedral (lower part 1284 to 1297) and Orvieto Cathedral (designed by Lorenzo Maitani from 1310)',
  influences: ['cistercian-gothic'],
  build(b) {
    cathedral(b, GOTHIC);
    gothicFacade(b);
  },
};
