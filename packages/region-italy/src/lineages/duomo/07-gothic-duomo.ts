import { P, tint, mix, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, archPts, archHead, circlePts, FZ, FF, NW, MARBLE, BRICK, ROOF, GOTHIC, type Pt } from './shared';

export const FW = 10.2; // half-width of the front
export const PINK = tint(P.marbleRed, 0.28);
/** The rough brick core of the unfinished front, waiting for its marble. */
const ROUGH = mix(BRICK, P.rubble, 0.35);
/** The four piers of the front: x, width. */
export const PIERS: [number, number][] = [[-FW + 0.6, 1.2], [FW - 0.6, 1.2], [-NW - 0.1, 1.1], [NW + 0.1, 1.1]];

/**
 * A gabled portal: a pointed opening in stepped frames, a bronze door, a lunette and a gable. In 1310
 * the lunette and the gable field are plain pink marble; `mosaic` fills them with gold, as in 1887.
 */
function portal(b: Builder, x: number, w: number, h: number, mosaic: boolean) {
  const y0 = 0.6;
  const z = FF;
  const field = mosaic ? P.gold : PINK;
  b.extrude(archPts('pointed', w + 1.4, h + 0.8, x, y0), 0.5, MARBLE, { at: [0, 0, z + 0.25], holes: [archPts('pointed', w + 0.6, h + 0.4, x, y0 + 0.02)] });
  b.extrude(archPts('pointed', w + 0.6, h + 0.4, x, y0), 0.3, PINK, { at: [0, 0, z + 0.15], holes: [archPts('pointed', w, h, x, y0 + 0.02)] });
  const dh = h - (w / 2) * Math.sqrt(3);
  b.box(w, dh, 0.08, P.bronze, { at: [x, y0, z + 0.02], jitter: false });
  b.box(w + 0.1, 0.22, 0.14, MARBLE, { at: [x, y0 + dh, z + 0.05], jitter: false });
  b.extrude(archHead('pointed', w / 2, y0 + dh + 0.22, x, 3), 0.06, field, { at: [0, 0, z + 0.03], jitter: false });
  // the gable (wimperg) above the arch
  const gb = y0 + h + 0.9;
  const gw = w / 2 + 0.9;
  const gh = gw * 1.1;
  b.extrude([[x - gw, gb], [x + gw, gb], [x, gb + gh]], 0.4, MARBLE, { at: [0, 0, z + 0.62] });
  b.extrude([[x - gw + 0.45, gb + 0.25], [x + gw - 0.45, gb + 0.25], [x, gb + gh - 0.45]], 0.06, field, { at: [0, 0, z + 0.84], jitter: false });
  b.box(gw * 2 + 0.2, 0.3, 0.9, MARBLE, { at: [x, gb - 0.3, z + 0.45], jitter: false });
}

/**
 * The part of the Gothic front that was actually built: a marble ground storey with three gabled
 * portals and the bases of four piers, up to a cornice at 10.4 m. It survives in every later stage.
 */
export function lowerRegister(b: Builder, mosaic: boolean) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  b.box(FW * 2, 10.4, t, MARBLE, { at: [0, 0, zc] });
  b.box(FW * 2 + 0.1, 0.6, t + 0.1, PINK, { at: [0, 0.6, zc], jitter: false });
  b.box(FW * 2 + 0.4, 0.35, 0.9, MARBLE, { at: [0, 10.4, FF], jitter: false });
  portal(b, 0, 3.0, 6.3, mosaic);
  b.sym((s) => portal(b, s * 7.6, 2.0, 5.0, mosaic));
  for (const [x, w] of PIERS) {
    b.box(w, 10.4, 1.3, MARBLE, { at: [x, 0, FZ + 0.6] });
    b.box(w + 0.04, 0.3, 1.34, PINK, { at: [x, 10.0, FZ + 0.6], jitter: false });
  }
}

/** A plate-tracery rose: a white wheel pierced by a ring of circles, over a dark glazed disc. */
export function rose(b: Builder, x: number, y: number, r: number, z: number, frame = MARBLE) {
  const holes: Pt[][] = [circlePts(x, y, r * 0.24, 8)];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    holes.push(circlePts(x + r * 0.63 * Math.cos(t), y + r * 0.63 * Math.sin(t), r * 0.16, 6));
  }
  b.extrude(circlePts(x, y, r * 0.98, 16), 0.06, P.windowDark, { at: [0, 0, z + 0.03], jitter: false });
  b.extrude(circlePts(x, y, r + 0.3, 20), 0.22, frame, { at: [0, 0, z + 0.12], holes, jitter: false });
}

/**
 * The front as it stood for centuries: the marble ground storey, and above it the bare brick core
 * with putlog holes from the scaffolding, stumps of the piers with toothing left to bond the marble
 * facing, a plain round opening where the rose was meant to go, and a low temporary gable.
 */
export function unfinishedFacade(b: Builder) {
  const zc = (FZ + FF) / 2;
  const t = FF - FZ;
  lowerRegister(b, false);
  const top = 19.6;
  b.box(NW * 2 + 0.2, top - 10.75, t, ROUGH, { at: [0, 10.75, zc] });
  b.extrude([[-NW - 0.1, top], [NW + 0.1, top], [0, top + 2.0]], t, ROUGH, { at: [0, 0, zc] });
  b.sym((s) => {
    b.beam([s * (NW + 0.35), top - 0.05, zc], [0, top + 2.15, zc], 0.5, 0.18, ROOF);
    b.box(FW - NW - 0.1, 1.1, t, ROUGH, { at: [s * (FW + NW + 0.1) / 2, 10.75, zc] });
    b.extrude([[s * NW, 11.85], [s * FW, 11.85], [s * NW, 13.8]], t, ROUGH, { at: [0, 0, zc] });
  });
  // the round opening left for the rose, glazed plainly
  b.extrude(circlePts(0, 15.3, 2.55, 14), 0.08, tint(ROUGH, -0.1), { at: [0, 0, FF + 0.04], jitter: false });
  b.extrude(circlePts(0, 15.3, 2.2, 14), 0.08, P.windowDark, { at: [0, 0, FF + 0.07], jitter: false });
  // putlog holes left by the scaffolding
  const dark = tint(ROUGH, -0.45);
  for (const y of [11.6, 13.2, 14.8, 16.4, 18.0]) {
    for (const x of [-4.4, -2.2, 0, 2.2, 4.4]) {
      if (Math.hypot(x, y - 15.3) < 3.0) continue;
      b.box(0.22, 0.22, 0.04, dark, { at: [x, y, FF + 0.01], jitter: false });
    }
  }
  b.sym((s) => b.box(0.22, 0.22, 0.04, dark, { at: [s * 7.8, 11.1, FF + 0.01], jitter: false }));
  // brick stumps of the piers, toothed on their faces for the marble that never came
  for (const [x, w] of PIERS) {
    const inner = Math.abs(x) < 8;
    const h = inner ? 3.4 : 1.5;
    b.box(w, h, 1.3, ROUGH, { at: [x, 10.75, FZ + 0.6] });
    for (let y = 11.0; y < 10.75 + h - 0.3; y += 0.7) {
      const wide = Math.round((y - 11) / 0.7) % 2 === 0;
      b.box(wide ? w + 0.3 : w + 0.1, 0.32, 1.45, tint(ROUGH, 0.06), { at: [x, y, FZ + 0.6], jitter: false });
    }
  }
}

export const gothicDuomo: BuildingDef = {
  id: 'gothic-duomo',
  name: 'Gothic cathedral, front unfinished',
  style: 'Italian Gothic',
  date: 'c. 1310',
  summary:
    'Two centuries on, the city rebuilt the cathedral in the Gothic manner. The nave and transept were raised on pointed arcades, and the new upper walls laid in bold black and white bands with pointed two-light windows, as at Siena and Orvieto; the old round-headed clerestory windows were blocked. ' +
    'A grand new marble front was begun as well, meant to rise in three mosaic gables round a rose window like the fronts planned at Siena and Orvieto. Only the ground storey was finished: three gabled doorways and the bases of the piers. Money, plague (the Black Death of 1348) and politics stopped the work, and the rest was left as bare brick with scaffold holes, a plain round opening for the rose and a makeshift gable. ' +
    'Many Italian cathedral and church fronts stayed like this for centuries; some, like San Petronio at Bologna, still do. The Romanesque aisles, transept and apse, the bell tower (now topped with a spire) and the baptistery all survive.',
  materials: ['white and pink marble', 'brick core', 'bronze doors', 'dark and white banded stone', 'brick spire', 'clay tiles'],
  lookFor: [
    { label: 'Gabled portals', note: 'The three pointed doorways, each under a sharp marble gable: the only part of the planned front that was built.', at: [0, 9.3, FF + 1.0] },
    { label: 'Unfinished brick front', note: 'Above the cornice the rough brick core was never faced in marble; Italian church fronts were often left like this for centuries.', at: [-3.4, 17.0, FF + 0.4] },
    { label: 'Putlog holes', note: 'Square holes left where the beams of the builders’ scaffolding were set into the wall.', at: [4.4, 18.0, FF + 0.3] },
    { label: 'Toothing', note: 'Brick courses left jutting from the pier stumps so that the marble facing could later be bonded in.', at: [NW + 0.1, 13.0, FZ + 1.5] },
    { label: 'Striped upper nave', note: 'The heightened nave walls are laid in equal bands of dark and white stone, as at Siena and Orvieto; the blocked Romanesque windows show below the new ones.', at: [-NW - 0.3, 15.5, 2.0] },
  ],
  modelledOn: 'The striped nave of Siena and Orvieto cathedrals; for the unfinished front, Florence Cathedral (Arnolfo di Cambio’s front, never finished and pulled down in 1587), Santa Croce, Florence (bare until 1857) and San Petronio, Bologna (still unfinished)',
  influences: ['cistercian-gothic'],
  build(b) {
    cathedral(b, GOTHIC);
    unfinishedFacade(b);
  },
};
