import { P, linspace, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { barrel, columnArcade, frasca, tiledGable, tiledShed } from './shared';
import { BH, BTOP, ZB, ZBI, innStables, innStreet, innWell, innYard, innYardWall } from './06-locanda';

export { BH, BTOP, ZB, ZBI };

// street range along the front, a side range down the side street (+X), stables across the back
export const XO = 10.2;
export const ZF = 9.1; // street face, on the old inn's building line
export const ZFI = 3.8; // yard face of the street range
export const G = 4.4; // ground storey: portico and tavern
export const F1 = 4.0; // piano nobile with the corner loggia
export const F2 = 3.2; // upper chambers
export const TOP = G + F1 + F2;
// the street portico and the loggia above it occupy the right-hand end of the front
export const PX0 = -0.6; // where the portico begins
export const PZ = 6.6; // back wall of the portico and loggia
export const LX0 = 3.4; // where the upper loggia begins
// side range
export const SX = 5.2; // its yard face
// the old inn's stables across the back (see 06-locanda), with a loggia added in front of them
export const BZI = ZBI + 1.6; // line of the loggia columns
export const GX = -6.6; // the carriage gate in the street front

/** A cross window (finestra crociata): stone frame, mullion and transom in the form of a cross. */
export function crossWindow(b: Builder, x: number, y: number, z: number, facing: '+z' | '-z' | '+x' | '-x', frame: number, head: number): void {
  const w = 1.3;
  const h = 2.0;
  const at: [number, number, number] = [x, y, z];
  b.window(w, h, { at, facing, frame, border: 0.14, bars: [2, 1] });
  b.group({ at, rotY: { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing] }, () => {
    b.panel(w - 0.2, 0.12, frame, { at: [0, h * 0.62, 0], depth: 0.1 });
    b.panel(w + 0.4, 0.22, head, { at: [0, h + 0.02, 0], depth: 0.16 });
    b.panel(w + 0.3, 0.1, head, { at: [0, -0.1, 0], depth: 0.14 });
  });
}

/** The whole inn; `restored` gives its 2016 state as a small hotel and wine bar. */
export function buildRenaissanceInn(b: Builder, restored: boolean): void {
  const plaster = restored ? P.intonacoCream : b.pick([P.intonacoCream, tint(P.intonacoOchre, 0.08), P.plaster]);
  const cotto = b.pick([P.cotto, tint(P.cotto, -0.04)]);
  const trav = P.travertine;
  const tile = b.pick([P.coppi, tint(P.coppi, -0.05)]);
  const wood = restored ? P.oakDark : b.pick([P.oak, P.oakDark]);
  const shaft = P.granite; // reused ancient granite columns
  const fz = (ZF + ZFI) / 2;

  // the old inn's street paving and yard floor (relaid in 2016)
  innStreet(b, restored ? P.paving : P.cobble);
  innYard(b, restored ? P.travertine : tint(P.cobble, 0.1));

  // ---------------- street range, ground storey: closed on the left, portico on the right
  b.box(PX0 + XO, G, ZF - ZFI, plaster, { at: [(PX0 - XO) / 2, 0, fz] });
  b.box(XO - PX0, G, PZ - ZFI, plaster, { at: [(XO + PX0) / 2, 0, (PZ + ZFI) / 2] });
  b.box(PX0 + XO + 0.04, 0.6, ZF - ZFI + 0.04, trav, { at: [(PX0 - XO) / 2, 0, fz] });
  // portico: arches on reused granite columns along the street and round the corner
  const colH = 3.0;
  const plen = XO - PX0;
  columnArcade(b, plen, 6, colH, G - colH, plaster, { at: [(XO + PX0) / 2, 0, ZF - 0.25], colColor: shaft, r: 0.22, order: 'ionic', t: 0.5 });
  columnArcade(b, ZF - PZ, 2, colH, G - colH, plaster, { at: [XO - 0.25, 0, (ZF + PZ) / 2], rotY: Math.PI / 2, colColor: shaft, r: 0.22, order: 'ionic', t: 0.5 });
  b.box(plen, 0.1, ZF - PZ, trav, { at: [(XO + PX0) / 2, 0, (ZF + PZ) / 2], jitter: false });
  // terracotta roundels in the spandrels
  for (let i = 1; i < 6; i++) {
    const x = PX0 + (i * plen) / 6;
    b.panel(0.55, 0.55, cotto, { at: [x, colH + 0.5, ZF], facing: '+z', shape: 'circle', depth: 0.05 });
    b.panel(0.3, 0.3, tint(cotto, -0.12), { at: [x, colH + 0.62, ZF], facing: '+z', shape: 'circle', depth: 0.08 });
  }
  // under the portico: the tavern doors, and in 2016 the arches of the wine bar glazed
  for (const x of [1.8, 5.4, 8.6]) {
    if (restored) {
      b.window(2.0, 3.0, { at: [x, 0.1, PZ], facing: '+z', frame: P.steel, border: 0.05, mat: 'glass', glass: P.glassDark });
    } else {
      b.panel(1.4, 2.8, wood, { at: [x, 0.1, PZ], facing: '+z', shape: 'round' });
      b.panel(1.8, 3.1, trav, { at: [x, 0.1, PZ], facing: '+z', shape: 'round', depth: 0.04 });
    }
  }
  // the carriage gate to the yard: a rusticated round arch
  const gw = 3.0;
  b.panel(gw + 1.0, 4.1, trav, { at: [GX, 0, ZF], facing: '+z', shape: 'round', depth: 0.08 });
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (i / 6);
    const r = gw / 2 + 0.02;
    b.panel(0.45, 0.5, tint(trav, -0.06), { at: [GX + Math.cos(a) * r, 2.1 + Math.sin(a) * r, ZF], facing: '+z', depth: 0.12, rot: [0, 0, a - Math.PI / 2] });
  }
  b.panel(gw, 3.6, restored ? P.glassDark : wood, { at: [GX, 0, ZF], facing: '+z', shape: 'round', depth: 0.1, mat: restored ? 'glass' : 'matte' });
  if (!restored) b.panel(0.05, 3.5, tint(wood, -0.15), { at: [GX, 0, ZF], facing: '+z', depth: 0.13 });
  for (const x of [-9.0, -2.6]) {
    b.window(1.0, 1.2, { at: [x, 1.9, ZF], facing: '+z', frame: trav, glass: P.windowDark, bars: [4, 4], border: 0.12 });
  }
  if (!restored) frasca(b, [-1.4, G - 0.4, ZF], '+z', 1.6);

  // ---------------- street range, upper floors
  b.box(XO + LX0, F1, ZF - ZFI, plaster, { at: [(LX0 - XO) / 2, G, fz] });
  b.box(XO - LX0, F1, PZ - ZFI, plaster, { at: [(XO + LX0) / 2, G, (PZ + ZFI) / 2] });
  b.box(2 * XO, F2, ZF - ZFI, plaster, { at: [0, G + F1, fz] });
  // string courses
  b.box(2 * XO + 0.08, 0.22, ZF - ZFI + 0.08, trav, { at: [0, G - 0.1, fz] });
  b.box(2 * XO + 0.08, 0.18, ZF - ZFI + 0.08, trav, { at: [0, G + F1 - 0.08, fz] });
  // the corner loggia: columns carrying a flat architrave, a balustrade between them
  const ly = G + 0.12;
  const lcol = F1 - 0.75;
  for (const x of linspace(4, LX0 + 0.3, XO - 0.3)) {
    b.column(0.18, lcol, trav, { at: [x, ly, ZF - 0.3], order: 'ionic' });
  }
  b.column(0.18, lcol, trav, { at: [XO - 0.3, ly, (ZF + PZ) / 2], order: 'ionic' });
  b.box(XO - LX0, 0.6, 0.45, trav, { at: [(XO + LX0) / 2, ly + lcol, ZF - 0.3] });
  b.box(0.45, 0.6, ZF - PZ, trav, { at: [XO - 0.3, ly + lcol, (ZF + PZ) / 2] });
  b.box(XO - LX0 - 0.3, 0.12, 0.3, trav, { at: [(XO + LX0) / 2, ly + 0.95, ZF - 0.3] });
  b.box(0.3, 0.12, ZF - PZ, trav, { at: [XO - 0.3, ly + 0.95, (ZF + PZ) / 2] });
  for (const x of spread(16, LX0 + 0.2, XO - 0.5)) b.cyl(0.07, 0.95, trav, { at: [x, ly, ZF - 0.3], segs: 5, rTop: 0.05 });
  for (const z of spread(6, PZ + 0.2, ZF - 0.5)) b.cyl(0.07, 0.95, trav, { at: [XO - 0.3, ly, z], segs: 5, rTop: 0.05 });
  for (const x of [5.0, 8.4]) {
    if (restored) b.window(1.4, 2.6, { at: [x, ly, PZ], facing: '+z', frame: P.steel, border: 0.05, mat: 'glass', glass: P.glassDark });
    else b.panel(1.2, 2.5, wood, { at: [x, ly, PZ], facing: '+z', shape: 'rect' });
  }
  // cross windows on the piano nobile, smaller windows above
  for (const x of [-8.8, -5.6, -2.4, 0.8]) crossWindow(b, x, G + 0.9, ZF, '+z', trav, cotto);
  for (const x of [-8.8, -5.6, -2.4, 0.8, 4.2, 7.4]) b.window(0.9, 1.1, { at: [x, G + F1 + 0.9, ZF], facing: '+z', frame: trav, border: 0.1, bars: [2, 2] });
  // terracotta frieze and a deep moulded cornice
  const fy = TOP - 0.9;
  b.box(2 * XO + 0.06, 0.6, ZF - ZFI + 0.06, cotto, { at: [0, fy, fz] });
  for (const x of spread(18, -XO + 0.4, XO - 0.4)) {
    b.panel(0.36, 0.36, tint(cotto, -0.14), { at: [x, fy + 0.12, ZF + 0.03], facing: '+z', shape: 'circle', depth: 0.06 });
  }
  b.box(2 * XO + 0.4, 0.15, ZF - ZFI + 0.4, cotto, { at: [0, TOP - 0.3, fz] });
  b.box(2 * XO + 0.8, 0.18, ZF - ZFI + 0.8, trav, { at: [0, TOP - 0.15, fz] });
  // yard face of the street range
  for (const x of [-8.8, -4.4, 0.8]) {
    b.window(1.0, 1.6, { at: [x, G + 1.0, ZFI], facing: '-z', frame: trav, border: 0.12, bars: [2, 2] });
    b.window(0.9, 1.1, { at: [x, G + F1 + 0.9, ZFI], facing: '-z', frame: trav, border: 0.1 });
  }
  b.panel(1.2, 2.5, wood, { at: [-2.2, 0, ZFI], facing: '-z', shape: 'round' });
  b.window(1.0, 1.4, { at: [-XO, G + 1.2, fz], facing: '-x', frame: trav, border: 0.12, bars: [2, 2] });
  const fspan = ZF - ZFI + 0.0;
  const fRise = (fspan / 2) * 0.42;
  tiledGable(b, 2 * XO, fspan, fRise, tile, { at: [0, TOP, fz], overhang: 0.55, wall: plaster, step: 0.9 });

  // ---------------- side range along the side street: three storeys, the same storey lines
  const sLen = ZFI - ZBI;
  const sz = (ZFI + ZBI) / 2;
  const sxm = (SX + XO) / 2;
  b.box(XO - SX, TOP, sLen, plaster, { at: [sxm, 0, sz] });
  b.box(XO - SX + 0.04, 0.6, sLen + 0.04, trav, { at: [sxm, 0, sz] });
  b.box(XO - SX + 0.08, 0.22, sLen + 0.08, trav, { at: [sxm, G - 0.1, sz] });
  b.box(XO - SX + 0.08, 0.18, sLen + 0.08, trav, { at: [sxm, G + F1 - 0.08, sz] });
  b.box(XO - SX + 0.06, 0.6, sLen + 0.06, cotto, { at: [sxm, fy, sz] });
  b.box(XO - SX + 0.8, 0.18, sLen + 0.8, trav, { at: [sxm, TOP - 0.15, sz] });
  for (const z of [1.6, -2.4]) {
    crossWindow(b, XO, G + 0.9, z, '+x', trav, cotto);
    b.window(0.9, 1.1, { at: [XO, G + F1 + 0.9, z], facing: '+x', frame: trav, border: 0.1, bars: [2, 2] });
    b.window(1.0, 1.2, { at: [XO, 1.9, z], facing: '+x', frame: trav, bars: [4, 4], border: 0.12 });
    b.window(1.0, 1.6, { at: [SX, G + 1.0, z], facing: '-x', frame: trav, border: 0.12, bars: [2, 2] });
    b.window(0.9, 1.1, { at: [SX, G + F1 + 0.9, z], facing: '-x', frame: trav, border: 0.1 });
    b.panel(1.1, 2.4, wood, { at: [SX, 0, z - 1.1], facing: '-x', shape: 'round' });
  }
  for (const x of [6.6, 9.0]) b.window(0.9, 1.1, { at: [x, G + F1 + 0.9, ZBI], facing: '-z', frame: trav, border: 0.1 });
  const sspan = XO - SX;
  const sRise = (sspan / 2) * 0.42;
  const zEnd = fz - (1 - sRise / fRise) * (fspan / 2) + 0.1;
  tiledGable(b, sspan, zEnd - ZBI, sRise, tile, { at: [sxm, TOP, (zEnd + ZBI) / 2], ridge: 'z', overhang: 0.5, wall: plaster, step: 0.9 });
  b.chimney(0.7, 2.0, 0.7, plaster, { at: [sxm + 0.8, TOP + sRise - 1.0, -3.4] });
  b.chimney(0.7, 2.0, 0.7, plaster, { at: [-5.0, TOP + fRise - 1.0, fz - 0.8] });

  // ---------------- the old inn's stone stables across the back, kept, with a loggia of Tuscan
  // columns built in front of them; in 2016 the openings are glazed and the roof is a terrace
  innStables(b, tint(P.pietraForte, -0.02), tint(plaster, -0.03), wood, tile, restored ? 'hotel' : 'inn');
  const lx0 = -XO + 0.5;
  const lLen = SX - lx0;
  const lxm = (SX + lx0) / 2;
  columnArcade(b, lLen, 6, 2.2, 1.1, plaster, { at: [lxm, 0, BZI - 0.2], colColor: trav, r: 0.2, order: 'tuscan', t: 0.4 });
  tiledShed(b, lLen, BZI - ZBI + 0.1, 0.4, tile, { at: [lxm, 3.33, ZBI + (BZI - ZBI + 0.1) / 2], high: '-z' });
  b.box(lLen, 0.06, BZI - ZBI, trav, { at: [lxm, 0, (BZI + ZBI) / 2], jitter: false });
  if (restored) {
    // the stable roof made into a roof terrace: paving, a glass balustrade, a pergola, umbrellas
    const tz = (ZB + ZBI) / 2;
    const tw = 2 * XO;
    b.box(tw, 0.25, ZBI - ZB, trav, { at: [0, BTOP, tz] });
    b.box(SX + XO, 1.05, 0.06, P.glass, { at: [(SX - XO) / 2, BTOP + 0.25, ZBI - 0.05], mat: 'glass', jitter: false });
    b.sym((e) => b.box(0.06, 1.05, ZBI - ZB, P.glass, { at: [e * (XO - 0.05), BTOP + 0.25, tz], mat: 'glass', jitter: false }));
    b.box(tw, 1.05, 0.25, plaster, { at: [0, BTOP + 0.25, ZB + 0.12] });
    for (const x of spread(4, -XO + 1, -1)) for (const z of [ZBI - 0.6, ZB + 0.8]) b.box(0.1, 2.4, 0.1, P.castIron, { at: [x, BTOP + 0.25, z] });
    for (const x of spread(4, -XO + 1, -1)) b.box(0.08, 0.1, ZBI - ZB - 1.2, P.castIron, { at: [x, BTOP + 2.65, tz] });
    for (const z of spread(7, ZB + 0.8, ZBI - 0.6)) b.box(9.4, 0.05, 0.08, P.oak, { at: [-5.6, BTOP + 2.75, z] });
    b.blob(1.1, P.leaf, { at: [-8.6, BTOP + 2.8, tz], stretch: [1.4, 0.3, 1.6], detail: 0 });
    b.blob(0.9, P.leafDark, { at: [-4.0, BTOP + 2.8, tz + 0.6], stretch: [1.6, 0.3, 1.2], detail: 0 });
  }

  // ---------------- left side of the yard: the old inn's wall, given a tiled coping
  innYardWall(b, plaster);
  b.box(0.7, 0.12, ZFI - ZBI, tile, { at: [-XO + 0.25, 4.2, (ZFI + ZBI) / 2] });

  // ---------------- the yard: the old inn's well
  innWell(b);

  if (!restored) {
    barrel(b, [1.4, 0, -2.8]);
    barrel(b, [2.1, 0, -3.1], tint(P.oak, 0.05));
    b.box(2.2, 0.6, 0.7, trav, { at: [-7.6, 0, -4.5] });
    b.tree(5, { at: [-8.2, 0, 1.6], kind: 'round', color: P.leafDark });
  }

  // ---------------- colliders: the solid blocks (portico, gate passage and yard stay open)
  b.collider(PX0 + XO, ZF - ZFI, { at: [(PX0 - XO) / 2, 0, fz] });
  b.collider(XO - PX0, PZ - ZFI, { at: [(XO + PX0) / 2, 0, (PZ + ZFI) / 2] });
  b.collider(XO - SX, sLen, { at: [sxm, 0, sz] });
  b.collider(0.5, ZFI - ZBI, { at: [-XO + 0.25, 0, (ZFI + ZBI) / 2] });

  // ---------------- later alterations, built last so that nothing else moves
  // c. 1680: the corner loggia walled in for more rooms (the 2016 restoration opened it again)
  if (!restored && b.since(1680)) {
    const ly = G + 0.12;
    const lh = F1 - 0.12;
    b.box(XO - LX0 - 0.2, lh, 0.3, plaster, { at: [(XO + LX0) / 2 - 0.1, ly, ZF - 0.3], jitter: false });
    b.box(0.3, lh, ZF - PZ - 0.3, plaster, { at: [XO - 0.3, ly, (ZF + PZ) / 2 - 0.15], jitter: false });
    for (const x of [5.0, 8.4]) b.window(0.9, 1.4, { at: [x, ly + 1.0, ZF - 0.15], facing: '+z', frame: trav, border: 0.1, bars: [2, 2] });
    b.window(0.9, 1.4, { at: [XO - 0.15, ly + 1.0, (ZF + PZ) / 2], facing: '+x', frame: trav, border: 0.1, bars: [2, 2] });
  }
  // c. 1780: louvred shutters (persiane) on the street windows, kept in the restoration
  if (restored || b.since(1780)) {
    const green = P.doorGreen;
    for (const x of [-8.8, -5.6, -2.4, 0.8]) b.sym((t) => b.panel(0.62, 2.0, green, { at: [x + t * 1.12, G + 0.9, ZF], facing: '+z', depth: 0.05, jitter: false }));
    for (const x of [-8.8, -5.6, -2.4, 0.8, 4.2, 7.4]) b.sym((t) => b.panel(0.45, 1.1, green, { at: [x + t * 0.75, G + F1 + 0.9, ZF], facing: '+z', depth: 0.05, jitter: false }));
  }
}

export const renaissanceInn: BuildingDef = {
  id: 'renaissance-inn',
  name: 'Renaissance inn',
  style: 'Early Renaissance, Roman',
  date: 'c. 1470',
  modelledOn: 'The Albergo dell’Orso, Rome (later 15th century), simplified and set on a corner',
  summary:
    'With the popes back in Rome and the Jubilees bringing pilgrims in hundreds of thousands, innkeeping has become a respectable trade, and the best inns look like the palaces of the rich. ' +
    'This one is plastered and ordered in the new manner: a portico of round arches on reused ancient granite columns, an open loggia on the corner of the first floor, cross windows framed in travertine, and a frieze and cornice of moulded terracotta. ' +
    'The street range is rebuilt on the old building line, but behind the carriage gate the yard, its well and the old inn’s stone stables are kept, the stables now behind a loggia of their own. The Albergo dell’Orso in Rome, on which it is modelled, is said to have lodged Montaigne in 1580.',
  materials: ['brick and rubble, plastered', 'travertine', 'moulded terracotta', 'reused granite columns', 'clay pan-and-cover tiles'],
  lookFor: [
    { label: 'Corner loggia', note: 'An open gallery on the first floor at the corner, its columns carrying a flat architrave: a cool, airy room for guests to look out on the street.', at: [8.0, G + 2.2, ZF + 0.2] },
    { label: 'Portico', note: 'Round arches on reused ancient columns shelter the tavern doors. Many such porticoes in Rome were later walled up; this one survives open.', at: [2.0, 2.0, ZF + 0.4] },
    { label: 'Cross windows', note: 'A stone mullion and transom divide each window into a cross: the finestra crociata of fifteenth-century Rome.', at: [-5.6, G + 2.0, ZF + 0.2] },
    { label: 'Terracotta ornament', note: 'A frieze of roundels under the cornice and roundels between the arches, moulded in fired clay: cheaper than carved stone and just as crisp.', at: [-3.0, TOP - 0.6, ZF + 0.3] },
    { label: 'Stable loggia', note: 'The stables across the back of the yard open behind a loggia of Tuscan columns, with the hay above.', at: [-4.0, 1.8, BZI + 0.3] },
  ],
  influences: ['renaissance-birth'],
  revisions: [
    { year: 1680, note: 'The corner loggia is walled in to make more rooms, as most open loggias in Rome were in the seventeenth century; two windows are set in the new wall.' },
    { year: 1780, note: 'Green louvred shutters (persiane) are hung at the street windows, as they were all over Italy in the eighteenth century.' },
  ],
  build(b) {
    buildRenaissanceInn(b, false);
  },
};
