import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { PW, patch, railing, shuttered, washing } from './shared';

const G = 4.0; // ground storey
const FH = 3.2; // upper storeys
const NF = 3; // upper storeys
const TOP = G + NF * FH;
const FZ0 = 3.2; // front range: courtyard face
const FZ1 = 7.6; // street face
const BZ0 = -7.8; // back range: back face
const BZ1 = -3.4; // courtyard face
const WX0 = -12.6; // left wing
const WX1 = -8.8; // its courtyard face
const RX0 = 10.2; // low range on the right
const XF = 2.4; // right end of the street range
const GD = 1.0; // gallery depth
const L_HALF = (PW - 0.6) / 2;

/** A ballatoio: a stone slab on iron brackets with an iron railing, along X (facing ±z) or along Z (facing ±x). */
function gallery(b: Builder, a0: number, a1: number, wall: number, y: number, facing: '+z' | '+x', stone: number, railFrom = a0): void {
  const len = a1 - a0;
  const mid = (a0 + a1) / 2;
  const alongX = facing === '+z';
  const at = (a: number, out: number, yy: number): [number, number, number] => (alongX ? [a, yy, wall + out] : [wall + out, yy, a]);
  if (alongX) b.box(len, 0.12, GD, stone, { at: at(mid, GD / 2, y - 0.12) });
  else b.box(GD, 0.12, len, stone, { at: at(mid, GD / 2, y - 0.12) });
  const nb = Math.max(2, Math.round(len / 1.6));
  for (let k = 0; k <= nb; k++) {
    const a = a0 + 0.15 + ((len - 0.3) * k) / nb;
    b.beam(at(a, 0.02, y - 0.75), at(a, GD - 0.1, y - 0.14), 0.05, 0.05, P.iron);
    b.beam(at(a, 0.02, y - 0.14), at(a, GD - 0.1, y - 0.14), 0.05, 0.05, P.iron);
  }
  railing(b, at(railFrom, GD - 0.04, y), at(a1, GD - 0.04, y), 1.0, P.iron, 0.3);
}

export const casaDiRinghiera: BuildingDef = {
  id: 'casa-di-ringhiera',
  name: 'Casa di ringhiera',
  style: 'Late nineteenth-century speculative tenement',
  date: 'c. 1880',
  summary:
    'After unification the towns grew fast, and builders put up tenements for the incoming workers as cheaply as rent and land allowed. In the casa di ringhiera ("railing house") the flats, often of one or two rooms, open off long balconies (ballatoi) of stone slabs on iron brackets running round the courtyard on every floor. ' +
    'The galleries saved the cost of staircases, and they became the street of the building: a single tap and a single privy on each landing served everyone on that floor. ' +
    'The type is best known from Milan and Turin, but courtyard tenements, some with galleries, were also built in the new working quarters of Rome, Florence and other central Italian cities; to the street they show a plain stuccoed front with shops below.',
  materials: ['brick, stuccoed', 'stone gallery slabs', 'wrought and cast iron', 'louvred wooden shutters (persiane)', 'coppi roof'],
  modelledOn: 'The case di ringhiera of Milan and Turin; working-class courtyard tenements of Rome and Florence',
  lookFor: [
    { label: 'Ballatoio (access gallery)', note: 'Every flat is reached from an open gallery round the courtyard, a stone slab on iron brackets with an iron railing.', at: [3.0, G + FH + 1.0, BZ1 + GD] },
    { label: 'Privy on the landing', note: 'One privy at the end of each gallery for every family on that floor; stacked one above another.', at: [RX0 - 0.6, G + FH * 2 + 1.2, BZ1 + 1.2] },
    { label: 'Shared tap', note: 'A single stone sink with a tap on each landing was the only running water.', at: [-7.6, G + 0.7, -1.4] },
    { label: 'Courtyard gate', note: 'An iron gate from the street into the courtyard, where children played, laundry was done and everyone knew everyone else’s business.', at: [(XF + RX0) / 2, 2.2, FZ1 + 0.1] },
    { label: 'Persiane', note: 'Louvred wooden shutters, painted green, let air in and keep the sun out.', at: [-L_HALF + 3.5 * ((XF + L_HALF) / 4) + 0.9, G + 1.6, FZ1 + 0.25] },
  ],
  influences: [],
  build(b) {
    const stucco = b.pick([P.intonacoOchre, P.intonacoCream, tint(P.intonacoOchre, -0.05), P.intonacoRose, P.stucco]);
    const court = tint(stucco, -0.06);
    const base = tint(stucco, -0.12);
    const stone = b.pick([P.pietraSerena, P.travertine, P.peperino]);
    const green = b.pick([P.doorGreen, tint(P.doorGreen, 0.06), P.cladGreen]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const L = PW - 0.6;

    // pavement, courtyard of cobbles
    patch(b, PW, 8 - FZ1, P.paving, [0, (FZ1 + 8) / 2], 0.12);
    const cobbles = mix(P.paving, P.earth, 0.35);
    patch(b, RX0 - WX1, FZ0 - BZ1, cobbles, [(RX0 + WX1) / 2, (FZ0 + BZ1) / 2], 0.04);
    patch(b, RX0 - XF, FZ1 - FZ0, cobbles, [(RX0 + XF) / 2, (FZ0 + FZ1) / 2], 0.04);

    // --- the street range, on the left of the plot; the courtyard opens to the street on the right
    const fzc = (FZ0 + FZ1) / 2;
    const fd = FZ1 - FZ0;
    const fl = XF + L / 2;
    const fx = (XF - L / 2) / 2;
    b.box(fl, TOP, fd, stucco, { at: [fx, 0, fzc] });
    b.box(fl + 0.06, G, fd + 0.06, base, { at: [fx, 0, fzc] });
    for (let y = 0.5; y < G - 0.1; y += 0.5) b.panel(fl, 0.05, tint(base, -0.08), { at: [fx, y, FZ1 + 0.03], facing: '+z', depth: 0.02 }); // banded rustication
    b.box(fl + 0.1, 0.2, fd + 0.1, P.stucco, { at: [fx, G - 0.05, fzc] });
    b.box(fl + 0.5, 0.35, fd + 0.5, P.stucco, { at: [fx, TOP - 0.35, fzc] }); // cornice
    b.hip(fl + 1.0, fd + 1.0, 1.55, roof, { at: [fx, TOP - 0.05, fzc] });
    for (let f = 1; f < NF; f++) b.box(fl + 0.08, 0.12, fd + 0.08, P.stucco, { at: [fx, G + f * FH, fzc] });
    const bays = 4;
    const bp = fl / bays;
    for (let i = 0; i < bays; i++) {
      const x = -L / 2 + (i + 0.5) * bp;
      if (i === 1) {
        // the street door to the front stair
        b.panel(1.9, 3.2, P.stucco, { at: [x, 0, FZ1 + 0.03], facing: '+z', shape: 'round', depth: 0.06 });
        b.panel(1.5, 2.9, P.oakDark, { at: [x, 0, FZ1 + 0.06], facing: '+z', shape: 'round', depth: 0.05 });
      } else {
        // shop: arched opening, glazed shopfront, painted sign
        b.panel(2.4, 3.3, P.stucco, { at: [x, 0.1, FZ1 + 0.03], facing: '+z', shape: 'segmental', depth: 0.05 });
        b.window(2.1, 3.0, { at: [x, 0.1, FZ1 + 0.06], facing: '+z', frame: tint(green, -0.05), glass: P.glassDark, bars: [3, 2], mat: 'glass', border: 0.1 });
        if (i !== 2) b.panel(1.6, 0.35, P.cream, { at: [x, 3.45, FZ1 + 0.03], facing: '+z', depth: 0.05 });
      }
      for (let f = 0; f < NF; f++) {
        const y = G + f * FH + 0.95;
        const wh = f === NF - 1 ? 1.35 : 1.6;
        shuttered(b, x, y, FZ1, 0.95, wh, '+z', { shutter: green, surround: P.stucco, open: b.chance(0.55), louvred: true, frame: P.white });
        b.window(0.85, 1.4, { at: [x, y, FZ0], facing: '-z', frame: P.white, glass: P.windowDark, border: 0.06 });
      }
    }
    // the end wall over the courtyard: a column of windows
    for (let f = 0; f < NF; f++) {
      for (const z of [4.4, 6.4]) b.window(0.85, 1.4, { at: [XF, G + f * FH + 0.95, z], facing: '+x', frame: P.white, glass: P.windowDark, border: 0.06 });
    }
    // the street wall and gate into the courtyard
    const gx = (XF + RX0) / 2;
    for (const [a, c] of [
      [XF, gx - 1.7],
      [gx + 1.7, RX0],
    ]) b.box(c - a, 2.6, 0.4, base, { at: [(a + c) / 2, 0, FZ1 - 0.2] });
    for (const s of [-1, 1]) {
      b.box(0.6, 3.4, 0.6, P.stucco, { at: [gx + s * 1.7, 0, FZ1 - 0.2] });
      b.box(0.75, 0.15, 0.75, P.stucco, { at: [gx + s * 1.7, 3.4, FZ1 - 0.2] });
    }
    railing(b, [gx - 1.4, 0.05, FZ1 - 0.2], [gx + 1.4, 0.05, FZ1 - 0.2], 2.6, P.iron, 0.18);
    b.box(2.8, 0.1, 0.06, P.iron, { at: [gx, 1.3, FZ1 - 0.2] });

    // --- the back range and the left wing, galleries on the courtyard side
    const bzc = (BZ0 + BZ1) / 2;
    const bd = BZ1 - BZ0;
    const bx0 = WX0;
    const bx1 = L / 2;
    b.box(bx1 - bx0, TOP, bd, court, { at: [(bx0 + bx1) / 2, 0, bzc] });
    b.box(bx1 - bx0 + 0.3, 0.3, bd + 0.3, P.stucco, { at: [(bx0 + bx1) / 2, TOP - 0.3, bzc] });
    b.hip(bx1 - bx0 + 0.9, bd + 0.9, 1.4, roof, { at: [(bx0 + bx1) / 2, TOP - 0.05, bzc] });
    const wzc = (BZ1 + FZ0) / 2;
    const wd = FZ0 - BZ1;
    b.box(WX1 - WX0, TOP, wd, court, { at: [(WX0 + WX1) / 2, 0, wzc] });
    b.box(WX1 - WX0 + 0.3, 0.3, wd, P.stucco, { at: [(WX0 + WX1) / 2, TOP - 0.3, wzc] });
    b.gable(WX1 - WX0 + 0.6, wd, 1.4, roof, { at: [(WX0 + WX1) / 2, TOP - 0.05, wzc], ridge: 'z', thick: 0.12 });

    const doorCol = P.oakDark;
    for (let f = 0; f <= NF; f++) {
      const y = f === 0 ? 0 : G + (f - 1) * FH;
      // doors and windows of the flats along the galleries
      for (let k = 0; k < 6; k++) {
        const x = WX1 + 1.8 + k * 3.0;
        b.panel(0.9, 2.15, doorCol, { at: [x, y + 0.02, BZ1], facing: '+z', depth: 0.06 });
        b.window(0.85, 1.3, { at: [x + 1.1, y + 0.9, BZ1], facing: '+z', frame: P.white, glass: P.windowDark, border: 0.06 });
      }
      for (let k = 0; k < 2; k++) {
        const z = BZ1 + 2.0 + k * 3.0;
        b.panel(0.9, 2.15, doorCol, { at: [WX1, y + 0.02, z], facing: '+x', depth: 0.06 });
        b.window(0.85, 1.3, { at: [WX1, y + 0.9, z + 1.15], facing: '+x', frame: P.white, glass: P.windowDark, border: 0.06 });
      }
      // the back face onto the yard behind: plain windows
      for (let k = 0; k < 8; k++) b.window(0.85, 1.3, { at: [WX0 + 1.4 + k * 3.0, y + 0.9, BZ0], facing: '-z', frame: P.white, glass: P.windowDark, border: 0.06 });
      for (let k = 0; k < 2; k++) b.window(0.85, 1.3, { at: [WX0, y + 0.9, BZ1 + 1.6 + k * 3.2], facing: '-x', frame: P.white, glass: P.windowDark, border: 0.06 });
      if (f === 0) continue;
      gallery(b, WX1, RX0 - 1.2, BZ1, y, '+z', stone, WX1 + GD);
      gallery(b, BZ1 + GD, FZ0, WX1, y, '+x', stone);
      // the privy at the end of the gallery, and the shared sink
      b.box(1.15, 2.5, 1.15, tint(court, -0.05), { at: [RX0 - 0.6, y - 0.12, BZ1 + 0.58] });
      b.box(1.3, 0.1, 1.3, roof, { at: [RX0 - 0.6, y + 2.38, BZ1 + 0.58] });
      b.panel(0.65, 1.85, P.oak, { at: [RX0 - 1.18, y, BZ1 + 0.55], facing: '-x', depth: 0.05 });
      b.window(0.3, 0.3, { at: [RX0 - 0.6, y + 1.8, BZ1 + 1.16], facing: '+z', frame: P.white, glass: P.windowDark, border: 0.04 });
      b.box(0.7, 0.85, 0.45, stone, { at: [WX1 + 0.35, y, -1.4] });
      b.box(0.05, 0.3, 0.05, P.castIron, { at: [WX1 + 0.08, y + 0.85, -1.4] });
    }
    // the stair: a tall slot of windows at the inner corner
    b.panel(1.0, 2.3, P.oakDark, { at: [WX1 + 0.6, 0.02, BZ1], facing: '+z', shape: 'round', depth: 0.06 });

    // --- the low range on the right: wash-house open to the courtyard
    const rzc = (BZ1 + FZ1 - 0.4) / 2;
    const rd = FZ1 - 0.4 - BZ1;
    b.box(L / 2 - RX0 - 2.0, 3.4, rd, court, { at: [(RX0 + 2.0 + L / 2) / 2, 0, rzc] });
    patch(b, 1.8, rd, tint(P.paving, -0.1), [RX0 + 1.1, rzc], 0.06);
    b.archWall(rd, 3.4, 0.4, court, { at: [RX0 + 0.2, 0, rzc], facing: '-x', openings: 4, openW: 1.6, openH: 2.6, shape: 'round' });
    b.shed(L / 2 - RX0 + 0.4, rd + 0.2, 0.8, roof, { at: [(RX0 + L / 2) / 2, 3.4, rzc], high: '+x' });
    for (let k = 0; k < 4; k++) b.box(0.9, 0.75, 1.1, stone, { at: [RX0 + 1.2, 0, BZ1 + 1.4 + k * 2.6] });

    // the courtyard: a drinking fountain, washing across, a handcart
    b.cyl(0.18, 1.2, P.castIron, { at: [1.6, 0, 0.2], segs: 8 });
    b.cyl(0.22, 0.12, P.castIron, { at: [1.6, 1.2, 0.2], segs: 8 });
    b.box(0.6, 0.2, 0.6, stone, { at: [1.6, 0, 0.55] });
    washing(b, [-1.5, G + FH + 1.9, BZ1 + GD], [-1.3, G + FH + 1.6, FZ0], 4);
    washing(b, [-5.0, G + 1.9, BZ1 + GD], [-5.2, G + 1.7, FZ0], 4);
    b.group({ at: [5.2, 0, 1.8], rotY: 0.4 }, () => {
      b.box(1.8, 0.12, 1.0, P.oak, { at: [0, 0.6, 0] });
      for (const s of [-1, 1]) b.cyl(0.45, 0.06, P.oakDark, { at: [0, 0.15, s * 0.55], rot: [Math.PI / 2, 0, 0], segs: 10 });
      for (const s of [-1, 1]) b.beam([0.9, 0.66, s * 0.4], [2.0, 0.4, s * 0.4], 0.06, 0.06, P.oak);
    });

    b.collider(fl, fd, { at: [fx, 0, fzc] });
    b.collider(RX0 - XF, 0.6, { at: [(RX0 + XF) / 2, 0, FZ1 - 0.2] });
    b.collider(bx1 - bx0, bd, { at: [(bx0 + bx1) / 2, 0, bzc] });
    b.collider(WX1 - WX0, wd, { at: [(WX0 + WX1) / 2, 0, wzc] });
    b.collider(L / 2 - RX0, rd, { at: [(RX0 + L / 2) / 2, 0, rzc] });
  },
};
