import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { ground, shutteredWindow, tiledGable, word } from './shared';

const XO = 10.3;
const ZF = 9.0; // street face
const ZFI = 4.0; // court face of the front range
const G = 4.6;
const F1 = 3.6;
const TOP = G + F1;
const AW = 3.8; // carriage arch
// arcaded stables on both sides of the court
const XS = 5.4; // their arcade line
const SH = 4.0; // stable storey; hayloft above
const STOP = SH + 2.0;
const ZS = -5.8; // back of the side ranges / court face of the coach house
const ZB = -10.3;
const CH = 5.2; // coach-house height

/** A horse standing, facing local +Z. */
function horse(b: Builder, at: [number, number, number], rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    b.box(0.5, 0.65, 1.5, color, { at: [0, 0.85, 0] });
    for (const [x, z] of [[-0.17, 0.6], [0.17, 0.6], [-0.17, -0.6], [0.17, -0.6]] as const) b.box(0.12, 0.88, 0.12, tint(color, -0.08), { at: [x, 0, z] });
    b.box(0.26, 0.8, 0.32, color, { at: [0, 1.3, 0.75], rot: [0.5, 0, 0] });
    b.box(0.22, 0.24, 0.6, color, { at: [0, 1.75, 1.05], rot: [0.3, 0, 0] });
    b.box(0.08, 0.6, 0.1, tint(color, -0.25), { at: [0, 0.75, -0.8], rot: [-0.3, 0, 0] });
  });
}

export const postingInn: BuildingDef = {
  id: 'posting-inn',
  name: 'Posting inn',
  style: 'Late Baroque',
  date: 'c. 1740',
  summary:
    'The Grand Tour has put the road through the town on a European itinerary, and the posting inn (stazione di posta) lives off it. ' +
    'Couriers and travelling carriages changed horses here at the end of each stage, about ten or fifteen kilometres, while their passengers ate and slept; the postmaster held his licence from the state that ran the post. ' +
    'The building is late Baroque in the plain provincial way: ochre plaster, moulded window frames, a rusticated carriage arch under a clock, and behind it a court with arcaded stables for the post horses. Grand Tourists grumbled about the beds, the bugs and the bills, and filled their letters home with them.',
  materials: ['brick and rubble, plastered', 'travertine', 'stucco', 'clay pan-and-cover tiles'],
  lookFor: [
    { label: 'Carriage arch', note: 'Wide and tall enough for a loaded travelling coach, framed in rusticated stone.', at: [0, 4.2, ZF + 0.4] },
    { label: 'Clock', note: 'A public clock over the gate: the post ran to set times, and so did the travellers who used it.', at: [0, TOP + 1.4, ZF + 0.2] },
    { label: 'Arcaded stables', note: 'Long stables open onto the court behind arcades, where fresh post horses stood ready to be harnessed.', at: [-XS - 0.2, 2.4, -1.0] },
    { label: 'Persiane', note: 'Louvred shutters, painted green, keep out the sun but let in the air. They became general in Italy during the eighteenth century.', at: [-6.5, G + 1.4, ZF + 0.3] },
    { label: 'Fontanile', note: 'A long stone trough fed by a spout, for watering the horses as they came in.', at: [0, 1.0, ZS + 0.6] },
  ],
  influences: ['pompeii-neoclassicism'],
  build(b) {
    const plaster = b.pick([P.intonacoOchre, tint(P.intonacoOchre, 0.04), P.intonacoSienna]);
    const trim = b.pick([P.intonacoCream, P.travertine]);
    const tile = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const shutter = b.pick([P.doorGreen, tint(P.doorGreen, 0.06)]);
    const trav = P.travertine;
    const fz = (ZF + ZFI) / 2;

    ground(b, 21.6, 1.4, P.cobble, [0, ZF + 0.8], 0.06);
    ground(b, 2 * XS, ZFI - ZS, tint(P.cobble, 0.08), [0, (ZFI + ZS) / 2], 0.04);

    // ---------------- front range
    const fw = XO - AW / 2;
    b.sym((s) => b.box(fw, G, ZF - ZFI, plaster, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.box(2 * XO, F1, ZF - ZFI, plaster, { at: [0, G, fz] });
    b.box(AW, G - 4.3, ZF - ZFI, plaster, { at: [0, 4.3, fz] });
    b.box(AW, 0.06, ZF - ZFI, P.cobble, { at: [0, 0, fz], jitter: false });
    // stucco plinth, band, corner quoins and cornice
    b.box(2 * XO + 0.06, 0.7, ZF - ZFI + 0.06, trim, { at: [0, 0, fz] });
    b.box(2 * XO + 0.08, 0.2, ZF - ZFI + 0.08, trim, { at: [0, G - 0.1, fz] });
    b.sym((s) => {
      for (let y = 0.7; y < TOP - 0.4; y += 0.7) {
        const w = (Math.round(y / 0.7) % 2) ? 0.9 : 0.6;
        b.box(w, 0.6, 0.08, trim, { at: [s * (XO - w / 2), y, ZF + 0.04] });
        b.box(0.08, 0.6, w, trim, { at: [s * (XO + 0.04), y, ZF - w / 2] });
      }
    });
    b.box(2 * XO + 0.5, 0.22, ZF - ZFI + 0.5, trim, { at: [0, TOP - 0.35, fz] });
    b.box(2 * XO + 0.9, 0.2, ZF - ZFI + 0.9, trim, { at: [0, TOP - 0.15, fz] });
    b.hip(2 * XO, ZF - ZFI, ((ZF - ZFI) / 2) * 0.45, tile, { at: [0, TOP, fz], overhang: 0.5 });
    // the carriage arch with its rusticated surround, at both faces
    for (const [z, f] of [[ZF, '+z'], [ZFI, '-z']] as const) {
      b.archWall(AW + 0.4, G, 0.3, plaster, { at: [0, 0, z + (f === '+z' ? -0.12 : 0.12)], facing: f, openings: 1, openW: AW - 0.4, openH: 4.3 });
    }
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (i / 8);
      const r = (AW - 0.4) / 2 + 0.02;
      b.panel(0.5, 0.6, trav, { at: [Math.cos(a) * r, 4.3 - (AW - 0.4) / 2 + Math.sin(a) * r, ZF], facing: '+z', depth: 0.14, rot: [0, 0, a - Math.PI / 2] });
    }
    b.sym((s) => {
      for (let y = 0; y < 2.6; y += 0.55) {
        const w = i2(y) ? 0.9 : 0.6;
        b.panel(w, 0.48, trav, { at: [s * ((AW - 0.4) / 2 + w / 2), y, ZF], facing: '+z', depth: 0.14 });
      }
    });
    // the clock attic over the gate, with a bell
    const ay = TOP - 0.2;
    b.box(5.0, 2.4, 0.7, plaster, { at: [0, ay, ZF - 0.35] });
    b.box(5.3, 0.2, 0.9, trim, { at: [0, ay + 2.4, ZF - 0.35] });
    b.sym((s) => b.extrude([[0, 0], [0.9, 0], [0, 1.2]], 0.5, trim, { at: [s * 2.5, ay, ZF - 0.35], rotY: s > 0 ? 0 : Math.PI }));
    b.extrude([[-2.6, 0], [2.6, 0], [2.0, 0.45], [1.0, 0.7], [0, 0.78], [-1.0, 0.7], [-2.0, 0.45]], 0.7, trim, { at: [0, ay + 2.6, ZF - 0.35] });
    b.panel(1.5, 1.5, P.white, { at: [0, ay + 0.55, ZF], facing: '+z', shape: 'circle', depth: 0.06 });
    b.panel(1.25, 1.25, P.cream, { at: [0, ay + 0.67, ZF], facing: '+z', shape: 'circle', depth: 0.08 });
    b.panel(0.06, 0.5, P.black, { at: [0, ay + 1.28, ZF], facing: '+z', depth: 0.11 });
    b.panel(0.06, 0.38, P.black, { at: [0.15, ay + 1.18, ZF], facing: '+z', depth: 0.11, rot: [0, 0, -1.2] });
    b.extrude([[-0.7, 0], [0.7, 0], [0.7, 1.2], [0, 1.6], [-0.7, 1.2]], 0.4, plaster, { at: [0, ay + 3.3, ZF - 0.35], holes: [[[-0.4, 0.15], [0.4, 0.15], [0.4, 0.9], [0, 1.2], [-0.4, 0.9]]] });
    b.lathe([[0, 0], [0.26, 0], [0.2, 0.1], [0.14, 0.38], [0.06, 0.45], [0, 0.45]], P.bronze, { at: [0, ay + 3.55, ZF - 0.35], segs: 8 });
    // windows: shuttered, with moulded surrounds and little cornices on the first floor
    for (const x of [-8.4, -5.8, -3.3, 3.3, 5.8, 8.4]) {
      shutteredWindow(b, 1.0, 1.9, { at: [x, G + 0.9, ZF], facing: '+z', frame: P.white, shutter, surround: trim });
      b.panel(1.6, 0.18, trim, { at: [x, G + 3.0, ZF], facing: '+z', depth: 0.16 });
      shutteredWindow(b, 1.0, 1.9, { at: [x, G + 0.9, ZFI], facing: '-z', frame: P.white, shutter, surround: trim });
    }
    for (const x of [-8.4, -5.8, -3.3, 7.4]) {
      shutteredWindow(b, 1.0, 1.7, { at: [x, 1.4, ZF], facing: '+z', frame: P.white, shutter, surround: trim, open: x > 0 });
    }
    b.sym((s) => shutteredWindow(b, 1.0, 1.9, { at: [s * XO, G + 0.9, fz], facing: s > 0 ? '+x' : '-x', frame: P.white, shutter, surround: trim }));
    // the posta sign and a mounting block, and the inn door
    b.panel(2.4, 0.7, P.white, { at: [-6.0, 3.65, ZF], facing: '+z', depth: 0.05 });
    word(b, 'POSTA', 0.1, P.doorBlue, { at: [-6.0, 3.75, ZF + 0.05], facing: '+z', depth: 0.04 });
    b.panel(1.3, 2.7, P.oakDark, { at: [4.6, 0.7, ZF], facing: '+z', shape: 'segmental' });
    b.panel(1.7, 3.0, trim, { at: [4.6, 0.7, ZF], facing: '+z', shape: 'segmental', depth: 0.04 });
    b.stairs(1.8, 0.7, 0.8, 2, trav, { at: [4.6, 0, ZF + 0.4] });
    b.stairs(1.0, 0.8, 1.2, 3, trav, { at: [-3.2, 0, ZF + 0.9], rotY: Math.PI / 2 });
    b.cyl(0.25, 0.9, trav, { at: [-AW / 2 - 0.5, 0, ZF + 0.35], segs: 8, rTop: 0.2 });
    b.cyl(0.25, 0.9, trav, { at: [AW / 2 + 0.5, 0, ZF + 0.35], segs: 8, rTop: 0.2 });

    // ---------------- arcaded stables down both sides of the court
    const sLen = ZFI - ZS;
    const sz = (ZFI + ZS) / 2;
    b.sym((s) => {
      const out = s * XO;
      const inner = s * XS;
      const xm = (out + inner) / 2;
      const depth = XO - XS;
      // the stable behind its arcade
      b.box(depth - 1.6, STOP, sLen, plaster, { at: [s * (XO - (depth - 1.6) / 2), 0, sz] });
      b.box(1.6, STOP - SH, sLen, plaster, { at: [s * (XS + 0.8), SH, sz] });
      b.archWall(sLen, SH, 0.45, plaster, { at: [inner + s * 0.22, 0, sz], facing: s > 0 ? '-x' : '+x', openings: 5, openW: 1.4, openH: 3.0 });
      b.box(0.5, 0.2, sLen, trim, { at: [inner + s * 0.22, SH - 0.1, sz] });
      for (const z of spread(5, ZS, ZFI)) {
        b.panel(1.4, 2.3, P.oakDark, { at: [s * (XS + 1.6), 0, z], facing: s > 0 ? '-x' : '+x', shape: 'segmental' });
        b.panel(0.6, 0.6, P.timberBlack, { at: [inner, SH + 0.6, z], facing: s > 0 ? '-x' : '+x', shape: 'circle' });
        b.panel(0.4, 0.9, P.windowDark, { at: [out, 2.2, z], facing: s > 0 ? '+x' : '-x' });
      }
      tiledGable(b, depth, sLen + 0.2, (depth / 2) * 0.42, tile, { at: [xm, STOP, sz - 0.1], ridge: 'z', overhang: 0.4, wall: plaster, step: 0.9 });
      b.collider(depth - 1.6, sLen, { at: [s * (XO - (depth - 1.6) / 2), 0, sz] });
      void xm;
    });

    // ---------------- coach house and smithy across the back, with a fontanile
    const bz = (ZS + ZB) / 2;
    b.box(2 * XO, CH, ZS - ZB, plaster, { at: [0, 0, bz] });
    b.box(2 * XO + 0.06, 0.6, ZS - ZB + 0.06, trim, { at: [0, 0, bz] });
    b.box(2 * XO + 0.5, 0.2, ZS - ZB + 0.5, trim, { at: [0, CH - 0.2, bz] });
    for (const x of [-6.8, -3.4, 3.4, 6.8]) {
      b.panel(2.6, 3.6, P.oakDark, { at: [x, 0, ZS], facing: '+z', shape: 'segmental' });
      b.panel(3.0, 3.9, trim, { at: [x, 0, ZS], facing: '+z', shape: 'segmental', depth: 0.04 });
      b.panel(0.04, 3.4, P.timberBlack, { at: [x, 0, ZS], facing: '+z', depth: 0.09 });
      b.panel(0.9, 0.9, P.windowDark, { at: [x, 1.6, ZB], facing: '-z' });
    }
    b.hip(2 * XO, ZS - ZB, ((ZS - ZB) / 2) * 0.45, tile, { at: [0, CH, bz], overhang: 0.5 });
    // the fontanile: a wall fountain with a spout over a long trough
    b.panel(2.4, 2.8, trav, { at: [0, 0, ZS], facing: '+z', shape: 'round', depth: 0.12 });
    b.panel(0.7, 0.7, tint(trav, -0.15), { at: [0, 1.7, ZS], facing: '+z', shape: 'circle', depth: 0.16 });
    b.box(0.08, 0.08, 0.5, P.bronze, { at: [0, 1.6, ZS + 0.4] });
    b.box(4.0, 0.8, 1.0, trav, { at: [0, 0, ZS + 0.6] });
    b.box(3.8, 0.05, 0.8, P.water, { at: [0, 0.74, ZS + 0.6], jitter: false, mat: 'glass' });

    // ---------------- in the court: a travelling coach and the post horses
    b.group({ at: [-1.6, 0, -1.2], rotY: 0.15 }, () => {
      b.box(1.5, 1.4, 2.4, P.doorRed, { at: [0, 1.0, 0] });
      b.box(1.6, 0.1, 2.5, P.black, { at: [0, 2.4, 0] });
      b.sym((s) => b.window(0.7, 0.6, { at: [s * 0.76, 1.55, 0], facing: s > 0 ? '+x' : '-x', frame: P.gold, border: 0.05 }));
      b.box(1.3, 0.12, 1.0, P.black, { at: [0, 1.3, 1.6] });
      b.box(1.2, 0.5, 0.1, P.black, { at: [0, 1.4, 2.05] });
      b.box(0.08, 0.08, 4.6, P.oakDark, { at: [0, 0.6, 0.3] });
      b.sym((s) => {
        b.log(0.6, 0.08, P.oakDark, { at: [s * 0.85, 0, -0.8], segs: 10 });
        b.log(0.45, 0.08, P.oakDark, { at: [s * 0.85, 0, 1.0], segs: 10 });
      });
    });
    horse(b, [1.8, 0, 1.6], 2.6, 0x6b4a32);
    horse(b, [2.8, 0, 0.9], 2.4, 0x3d2c22);
    horse(b, [-XS + 1.2, 0, -3.6], Math.PI / 2, 0x8a6a4a);

    // ---------------- colliders: front range (the arch and the court stay open), coach house
    b.sym((s) => b.collider(fw, ZF - ZFI, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.collider(2 * XO, ZS - ZB, { at: [0, 0, bz] });
  },
};

/** Alternate long and short blocks up the jambs of a rusticated arch. */
function i2(y: number): boolean {
  return Math.round(y / 0.55) % 2 === 0;
}
