import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { barrel, cart, ground, horse, innPavement, innStables, innWell, pole } from './shared';

const XO = 10.2;
const ZF = 9.4; // street face of the stone ground storey
const ZFI = 4.4; // yard face of the front range
const G = 3.4; // stone ground storey
const F1 = 2.7; // first floor, jettied
const F2 = 2.5; // second floor, jettied again
const J = 0.5; // each jetty
const AW = 3.2; // carriage arch
const AX = -4.0; // its centre
// east range with the galleries
const XG = 3.6; // yard edge of the galleries
const XR = 5.2; // yard face of the rooms behind them
const EG = 3.0; // its storeys
const ETOP = EG * 2;
// stables across the back
const ZB = -10.2;
const ZS = -5.6;
const SH = 3.2;

/** Plank shutters either side of a small unglazed window. */
function plankWindow(b: Builder, x: number, y: number, z: number, facing: '+z' | '-z' | '+x' | '-x', frame: number, shutter: number, w = 0.8, h = 1.0): void {
  b.window(w, h, { at: [x, y, z], facing, frame, glass: P.windowDark, bars: [2, 1], border: 0.08 });
  const a = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  b.group({ at: [x, y, z], rotY: a }, () => b.sym((s) => b.panel(w / 2, h, shutter, { at: [s * (w * 0.75 + 0.03), 0, 0], depth: 0.05 })));
}

export const hostellerie: BuildingDef = {
  id: 'hostellerie',
  name: 'Hostellerie (medieval inn)',
  style: 'Late Gothic vernacular',
  date: 'c. 1380',
  summary:
    'By the fourteenth century innkeeping is a trade, licensed and taxed by the town, and the inn (hostellerie) stands on the main street near the gate to catch merchants, pilgrims, carters and the king’s officers. ' +
    'It is built as the houses of the town are: a ground storey of stone, and above it floors of oak framing filled with cob, each jettied out over the one below, under a steep roof of flat tiles with a great stone chimney. ' +
    'A carriage arch leads to the yard, where the guest rooms open off timber galleries reached by an outside stair, and the stables and hayloft close the far side. The same arrangement served inns all over Europe until the coming of the railway.',
  materials: ['limestone', 'oak framing', 'cob (torchis) infill', 'flat clay tiles', 'wrought iron'],
  lookFor: [
    { label: 'Hanging sign', note: 'A painted board on a wrought-iron bracket: in a town where few could read, the inn was known by its sign, here a swan.', at: [1.4, G + 0.2, ZF + 1.9] },
    { label: 'Carriage arch', note: 'A pointed arch through the front range, wide and high enough for a loaded waggon, leading to the yard behind.', at: [AX, 3.0, ZF + 0.3] },
    { label: 'Jetties', note: 'Each timber storey oversails the one below (en encorbellement), gaining floor space over the street and throwing the rain clear of the wall beneath.', at: [6.0, G + F1 + 0.1, ZF + J * 2 + 0.2] },
    { label: 'Galleries', note: 'Open timber galleries on two floors along the yard, so that each chamber had its own door without passages inside.', at: [XG, EG + 1.2, -0.6] },
    { label: 'Stables and hayloft', note: 'Stalls across the back of the yard, with hay pitched up through the loft door in the roof.', at: [-2.1, SH + 1.0, ZS + 0.3] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, tint(P.pierreBlonde, -0.05), P.limestone]);
    const torchis = b.pick([P.torchis, P.daub, tint(P.torchis, 0.03)]);
    const timber = b.pick([P.oakDark, P.oak]);
    const tile = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.05)]);
    const shutter = b.pick([P.oak, P.voletVert, tint(P.oakDark, 0.06)]);

    innPavement(b);
    ground(b, XG + XO, ZFI - ZS, tint(P.cobble, 0.06), [(XG - XO) / 2, (ZFI + ZS) / 2], 0.04);

    // ---------------- front range: stone ground storey with the carriage arch
    const fz = (ZF + ZFI) / 2;
    const fd = ZF - ZFI;
    const lw = AX - AW / 2 + XO; // length west of the arch
    const rw = XO - (AX + AW / 2);
    b.box(lw, G, fd, stone, { at: [-XO + lw / 2, 0, fz] });
    b.box(rw, G, fd, stone, { at: [XO - rw / 2, 0, fz] });
    b.box(AW, 0.5, fd, stone, { at: [AX, G - 0.5, fz] });
    b.box(AW, 0.06, fd, P.cobble, { at: [AX, 0, fz], jitter: false });
    for (const [z, f] of [[ZF, '+z'], [ZFI, '-z']] as const) {
      b.archWall(AW + 0.8, G, 0.24, stone, { at: [AX, 0, z + (f === '+z' ? 0.12 : -0.12)], facing: f, openings: 1, openW: AW, openH: G - 0.25, shape: 'pointed' });
    }
    b.sym((s) => b.box(0.3, 0.3, 0.3, tint(stone, -0.08), { at: [AX + s * (AW / 2 + 0.05), 0, ZF + 0.2] }));
    // the tavern: a door and a wide window with a shutter let down as a counter
    b.panel(1.1, 2.3, timber, { at: [3.0, 0, ZF], facing: '+z', shape: 'pointed' });
    b.panel(1.4, 2.6, tint(stone, 0.06), { at: [3.0, 0, ZF], facing: '+z', shape: 'pointed', depth: 0.03 });
    for (const x of [-8.0, 6.6]) {
      b.window(1.8, 1.1, { at: [x, 1.0, ZF], facing: '+z', frame: tint(stone, 0.06), glass: P.windowDark, bars: [2, 1], border: 0.1 });
      b.box(1.8, 0.07, 0.55, shutter, { at: [x, 0.95, ZF + 0.28] });
    }
    plankWindow(b, -1.0, 1.3, ZF, '+z', tint(stone, 0.06), shutter, 0.7, 0.9);
    for (const x of [-8.0, -1.2, 3.0, 7.0]) plankWindow(b, x, 1.2, ZFI, '-z', tint(stone, 0.06), shutter, 0.7, 0.9);
    b.panel(1.0, 2.1, timber, { at: [0.6, 0, ZFI], facing: '-z' });

    // ---------------- the timber storeys, each jettied over the one below
    const storeys: [number, number, number][] = [
      [G, F1, J],
      [G + F1, F2, 2 * J],
    ];
    for (const [y, h, j] of storeys) {
      const zf = ZF + j;
      const d = zf - ZFI;
      b.box(2 * XO, h, d, torchis, { at: [0, y, ZFI + d / 2] });
      // floor joist ends under the jetty and a sill beam
      b.box(2 * XO + 0.1, 0.22, 0.3, timber, { at: [0, y, zf - 0.1] });
      for (const x of spread(11, -XO + 0.3, XO - 0.3)) b.box(0.14, 0.14, J + 0.05, timber, { at: [x, y - 0.12, zf - J / 2 - 0.05] });
      b.frame(2 * XO, h, timber, { at: [0, y, zf], facing: '+z', studs: 11, rails: 1, brace: 'corner', beam: 0.17 });
      b.frame(2 * XO, h, timber, { at: [0, y, ZFI], facing: '-z', studs: 6, rails: 1, brace: 'none', beam: 0.17 });
      b.sym((s) => b.frame(d, h, timber, { at: [s * XO, y, ZFI + d / 2], facing: s > 0 ? '+x' : '-x', studs: 2, rails: 1, beam: 0.17 }));
      for (const x of [-8.2, -5.0, -1.8, 1.4, 4.6, 7.8]) {
        plankWindow(b, x, y + 0.75, zf + 0.07, '+z', timber, shutter, 0.8, h > 2.6 ? 1.1 : 0.95);
      }
      for (const x of [-6.6, -1.8, 6.4]) plankWindow(b, x, y + 0.8, ZFI - 0.07, '-z', timber, shutter, 0.7, 0.9);
      // brackets under the jetty at the posts
      for (const x of [-XO + 0.2, -3.4, 3.4, XO - 0.2]) b.beam([x, y - 0.9, zf - J - 0.02], [x, y - 0.05, zf - 0.1], 0.16, 0.16, timber);
    }
    // the steep roof over the front range, and a great stone chimney stack
    const rz0 = ZFI;
    const rz1 = ZF + 2 * J;
    const rd = rz1 - rz0;
    const rRise = (rd / 2) * 1.2;
    const rtop = G + F1 + F2;
    b.gable(2 * XO, rd, rRise, tile, { at: [0, rtop, (rz0 + rz1) / 2], overhang: 0.45, wall: torchis, thick: 0.16 });
    b.sym((s) => {
      const zc = (rz0 + rz1) / 2;
      b.box(0.16, rRise - 0.3, 0.16, timber, { at: [s * (XO + 0.02), rtop, zc] });
      b.box(0.16, 0.16, rd * 0.5, timber, { at: [s * (XO + 0.02), rtop + rRise * 0.5, zc] });
      b.sym((t) => b.beam([s * (XO + 0.02), rtop + 0.1, zc + t * (rd / 2 - 0.3)], [s * (XO + 0.02), rtop + rRise * 0.5, zc + t * 0.4], 0.14, 0.14, timber));
    });
    b.chimney(1.2, rRise + 1.6, 0.8, stone, { at: [-6.0, rtop + 0.4, (rz0 + rz1) / 2 - 0.2] });
    b.chimney(1.0, rRise + 1.4, 0.7, stone, { at: [6.4, rtop + 0.4, (rz0 + rz1) / 2 - 0.2] });
    // a hoist gablet over the middle of the street front
    b.group({ at: [1.2, rtop - 0.05, rz1 - 0.2] }, () => {
      b.box(1.6, 1.5, 1.2, torchis, { at: [0, 0, -0.6] });
      b.frame(1.6, 1.5, timber, { at: [0, 0, 0], facing: '+z', studs: 0, rails: 0, beam: 0.15 });
      b.panel(0.9, 1.1, P.timberBlack, { at: [0, 0.15, 0], facing: '+z' });
      b.gable(1.6, 1.4, 1.2, tile, { at: [0, 1.5, -0.6], ridge: 'z', overhang: 0.15, wall: torchis });
      b.box(0.15, 0.15, 1.0, timber, { at: [0, 2.3, 0.3] });
    });

    // ---------------- the hanging sign: a swan on a board, from an iron bracket
    const sx = 1.4;
    const sy = G + 0.6;
    b.beam([sx, sy, ZF + J], [sx, sy, ZF + 2.3], 0.06, 0.06, P.iron);
    b.beam([sx, sy - 0.7, ZF + J], [sx, sy - 0.02, ZF + 1.6], 0.04, 0.04, P.iron);
    b.group({ at: [sx, sy - 1.05, ZF + 1.85] }, () => {
      b.box(0.06, 1.1, 1.0, P.doorBlue, { at: [0, -0.05, 0] });
      b.box(0.08, 0.06, 0.95, P.gold, { at: [0, 0.97, 0] });
      b.sym((s) => {
        b.blob(0.22, P.white, { at: [s * 0.05, 0.4, 0.05], stretch: [0.15, 0.7, 1.3], detail: 0 });
        b.box(0.08, 0.32, 0.05, P.white, { at: [s * 0.05, 0.5, -0.22] });
        b.box(0.08, 0.06, 0.12, P.cladYellow, { at: [s * 0.05, 0.8, -0.27] });
      });
      b.sym((s) => b.box(0.02, 0.1, 0.02, P.iron, { at: [0, 1.0, s * 0.35] }));
    });
    // a bush hung out on a pole: wine sold here
    pole(b, [-1.5, G + 0.4, ZF + J], [-1.5, G + 0.6, ZF + 1.6], 0.04, P.oakDark);
    b.blob(0.35, P.leafDark, { at: [-1.5, G + 0.15, ZF + 1.6], stretch: [1, 1.3, 1], detail: 0 });

    // ---------------- east range: chambers opening off two tiers of galleries
    const ez = (ZFI + ZS) / 2;
    const el = ZFI - ZS;
    const ex = (XR + XO) / 2;
    b.box(XO - XR, EG, el, stone, { at: [ex, 0, ez] });
    b.box(XO - XR, EG, el, torchis, { at: [ex, EG, ez] });
    b.frame(el, EG, timber, { at: [XR, EG, ez], facing: '-x', studs: 7, rails: 1, beam: 0.16 });
    b.frame(el, EG, timber, { at: [XO, EG, ez], facing: '+x', studs: 6, rails: 1, brace: 'corner', beam: 0.16 });
    for (const z of spread(4, ZS + 1.2, ZFI - 1.2)) {
      b.panel(0.9, 2.0, timber, { at: [XR, 0, z - 0.5], facing: '-x' });
      b.panel(0.9, 2.0, timber, { at: [XR, EG + 0.05, z - 0.5], facing: '-x' });
      plankWindow(b, XR, 1.2, z + 0.6, '-x', tint(stone, 0.06), shutter, 0.6, 0.8);
      plankWindow(b, XR + 0.04, EG + 1.0, z + 0.6, '-x', timber, shutter, 0.6, 0.8);
      plankWindow(b, XO + 0.04, EG + 1.0, z, '+x', timber, shutter, 0.6, 0.8);
    }
    // the galleries: posts, a floor, a rail, the roof carried down over them
    const gx = XG + 0.12;
    for (const z of spread(6, ZS + 0.2, ZFI - 0.2)) {
      b.box(0.2, ETOP, 0.2, timber, { at: [gx, 0, z] });
      b.beam([gx, EG - 0.7, z - 0.5], [gx, EG - 0.1, z], 0.1, 0.1, timber);
    }
    b.box(XR - XG, 0.18, el, timber, { at: [(XR + XG) / 2, EG - 0.1, ez] });
    b.box(0.12, 0.12, el, timber, { at: [gx, EG + 0.95, ez] });
    for (const z of spread(11, ZS + 0.3, ZFI - 0.3)) b.box(0.05, 0.95, 0.05, timber, { at: [gx, EG + 0.05, z], jitter: false });
    b.box(0.16, 0.2, el, timber, { at: [gx, ETOP - 0.2, ez] });
    const ew = XO - XG;
    b.gable(ew, el + 0.2, (ew / 2) * 1.1, tile, { at: [(XG + XO) / 2, ETOP, ez - 0.1], ridge: 'z', overhang: 0.4, wall: torchis });
    // the outside stair up to the first gallery
    b.stairs(1.0, EG - 0.1, 3.4, 9, timber, { at: [XG - 0.6, 0, ZS + 2.2], rotY: Math.PI });
    b.box(0.08, 0.9, 3.4, timber, { at: [XG - 1.1, EG * 0.5, ZS + 2.2] });

    // ---------------- stables across the back, with a loft door in the roof
    innStables(b, stone, timber, tile);

    // ---------------- the west side of the yard: a wall, the well, a trough
    b.box(0.6, 3.4, ZFI - ZB, stone, { at: [-XO + 0.3, 0, (ZFI + ZB) / 2] });
    b.box(0.8, 0.12, ZFI - ZB, tile, { at: [-XO + 0.3, 3.4, (ZFI + ZB) / 2] });
    b.box(4.7, 2.6, 0.6, stone, { at: [-7.55, 0, ZB + 0.3] });
    innWell(b, stone, timber);
    // the back corner: the dung heap and a stack of firewood
    ground(b, 4.7, ZS - ZB - 0.6, tint(P.earth, 0.02), [-7.55, (ZS + ZB + 0.6) / 2], 0.03);
    b.blob(1.2, 0x6a5a3c, { at: [-7.8, 0, -8.0], stretch: [1.2, 0.45, 1.0], detail: 0 });
    for (let i = 0; i < 6; i++) b.log(0.1, 1.4, P.bark, { at: [-6.2, i < 4 ? 0 : 0.2, -9.6 + (i % 4) * 0.22], segs: 5 });
    b.box(2.4, 0.6, 0.8, stone, { at: [-8.8, 0, -2.6], rotY: Math.PI / 2 });
    b.box(0.6, 0.04, 2.2, P.water, { at: [-8.8, 0.58, -2.6], mat: 'glass', jitter: false });
    cart(b, [-1.2, 0, -1.2], 2.4, P.oak);
    horse(b, [-4.4, 0, -3.0], 1.2, 0x5a4030);
    horse(b, [1.8, 0, 1.6], 3.6, 0x8a6a4a);
    barrel(b, [2.6, 0, ZFI - 0.6]);
    barrel(b, [3.2, 0, ZFI - 0.9], tint(P.oak, 0.05));

    // ---------------- colliders: one per range; the arch passage and yard stay open
    b.collider(lw, fd + 2 * J, { at: [-XO + lw / 2, 0, fz + J] });
    b.collider(rw, fd + 2 * J, { at: [XO - rw / 2, 0, fz + J] });
    b.collider(XO - XR, el, { at: [ex, 0, ez] });
    b.collider(0.6, ZFI - ZB, { at: [-XO + 0.3, 0, (ZFI + ZB) / 2] });
    b.collider(4.7, 0.6, { at: [-7.55, 0, ZB + 0.3] });
  },
};
