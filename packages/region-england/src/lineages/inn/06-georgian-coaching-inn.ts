import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { ground, hangingSign } from './shared';

const XO = 10.5;
const ZF = 10.3; // street face
const ZFB = 3.0; // back of the street range
const G = 3.6;
const F1 = 3.4;
const F2 = 2.8;
const TOP = G + F1 + F2; // 9.8
const PW = 2.0; // half-width of the passage behind the arch
const BAYS = [-8.7, -6.0, -3.3, 0, 3.3, 6.0, 8.7];

/** A stagecoach, front toward local +X. */
function coach(b: Builder, body: number) {
  const wheelC = P.postRed;
  b.box(2.4, 1.3, 1.5, body, { at: [0, 1.0, 0] });
  b.box(2.5, 0.4, 1.55, P.black, { at: [0, 2.0, 0] });
  b.box(2.2, 0.1, 1.4, P.black, { at: [0, 2.6, 0] });
  b.box(1.4, 0.5, 1.2, tint(P.mud, -0.1), { at: [-0.1, 2.5, 0] });
  b.sym((s) => b.window(0.7, 0.55, { at: [0.0, 1.55, s * 0.76], facing: s > 0 ? '+z' : '-z', frame: P.black, border: 0.06 }));
  b.box(0.7, 0.6, 1.4, P.black, { at: [1.55, 1.3, 0] }); // driver's box
  b.box(0.5, 0.1, 1.4, P.black, { at: [1.6, 1.9, 0] });
  b.box(1.2, 0.08, 0.08, P.oakDark, { at: [2.4, 0.6, 0] }); // pole
  b.sym((s) => {
    b.log(0.75, 0.1, wheelC, { at: [-0.85, 0, s * 0.85], axis: 'z', segs: 12 });
    b.log(0.55, 0.1, wheelC, { at: [1.1, 0, s * 0.85], axis: 'z', segs: 10 });
  });
  b.box(0.08, 0.08, 1.8, P.black, { at: [-0.85, 0.71, 0] });
  b.box(0.08, 0.08, 1.8, P.black, { at: [1.1, 0.51, 0] });
}

export const georgianCoachingInn: BuildingDef = {
  id: 'georgian-coaching-inn',
  name: 'Coaching inn',
  style: 'Georgian',
  date: 'c. 1750',
  summary:
    'Turnpike roads and scheduled stagecoaches made the market-town inn a busy staging post, where coaches changed horses and passengers dined while they waited. ' +
    'Prosperous innkeepers refronted the old timber ranges in fashionable brick with tall sash windows, a parapet and a classical cornice, keeping the medieval plan of a yard behind. ' +
    'The carriage arch grew tall enough for a coach with luggage and passengers on the roof, and stables for dozens of horses filled the yard.',
  materials: ['red brick', 'Portland stone dressings', 'Welsh slate', 'painted timber sashes'],
  lookFor: [
    { label: 'Carriage arch', note: 'Tall and wide enough for a loaded stagecoach with passengers riding on the roof.', at: [0, 4.7, ZF + 0.3] },
    { label: 'Sash windows', note: 'Two sliding frames, six panes each, set in a regular grid. Tallest on the first floor, where the best rooms were.', at: [-6, 5.8, ZF + 0.3] },
    { label: 'Venetian window', note: 'An arched light between two square-headed ones, a Palladian motif marking the centre of the front.', at: [0, 6.4, ZF + 0.4] },
    { label: 'Swinging sign', note: 'A painted board on a wrought-iron bracket, readable by coachmen from far down the street.', at: [4.65, 2.6, ZF + 2.0] },
    { label: 'Parapet', note: 'A low wall above the cornice that hides the roof, so the front reads as a neat brick box.', at: [-8, TOP + 0.9, ZF + 0.2] },
  ],
  influences: ['palladianism', 'dutch-classicism'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), P.brickOrange]);
    const stone = P.portland;
    const sash = P.white;
    const roof = b.pick([P.slate, P.slateBlue]);
    const door = b.pick([P.doorGreen, P.doorBlack, P.doorBlue]);
    const zm = (ZF + ZFB) / 2;
    const dep = ZF - ZFB;

    ground(b, 2 * XO, 13.4, P.cobble, [0, -3.7]);
    ground(b, 2 * PW, dep, P.cobble, [0, zm]);
    ground(b, 21.4, 0.9, P.paving, [0, ZF + 0.45], 0.08);

    // ---------------- street range
    const sw = XO - PW;
    b.sym((s) => {
      b.box(sw, TOP, dep, brick, { at: [s * (PW + sw / 2), 0, zm] });
      b.box(sw + 0.06, 0.5, dep + 0.06, stone, { at: [s * (PW + sw / 2), 0, zm] });
    });
    b.box(2 * PW, TOP - 5.0, dep, brick, { at: [0, 5.0, zm] });
    // arch faces in brick with a stone ring and keystone
    for (const [z, f] of [[ZF, '+z'], [ZFB, '-z']] as const) {
      const zz = f === '+z' ? z - 0.25 : z + 0.25;
      b.archWall(2 * PW, 5.0, 0.5, brick, { at: [0, 0, zz], facing: f, openings: 1, openW: 3.2, openH: 4.6, shape: 'round' });
    }
    b.panel(3.8, 4.9, stone, { at: [0, 0, ZF], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(3.2, 4.6, P.cobble, { at: [0, 0, ZF], facing: '+z', shape: 'round', depth: 0.09 });
    b.panel(0.5, 0.7, stone, { at: [0, 4.35, ZF], facing: '+z', depth: 0.12 });
    b.box(2 * PW, 0.2, dep, tint(P.plaster, -0.1), { at: [0, 4.8, zm] });

    // stone dressings: band courses, cornice, parapet with coping, quoins
    for (const y of [G, G + F1]) b.box(2 * XO + 0.1, 0.22, dep + 0.1, stone, { at: [0, y - 0.1, zm] });
    b.box(2 * XO + 0.5, 0.35, dep + 0.5, stone, { at: [0, TOP - 0.35, zm] });
    b.box(2 * XO, 0.8, 0.3, brick, { at: [0, TOP, ZF - 0.15] });
    b.box(2 * XO, 0.8, 0.3, brick, { at: [0, TOP, ZFB + 0.15] });
    b.sym((s) => b.box(0.3, 0.8, dep, brick, { at: [s * (XO - 0.15), TOP, zm] }));
    b.box(2 * XO + 0.1, 0.12, dep + 0.1, stone, { at: [0, TOP + 0.8, zm] });
    b.sym((s) => {
      for (let i = 0; i < 12; i++) {
        const w = i % 2 ? 0.5 : 0.8;
        b.box(w, 0.4, 0.08, stone, { at: [s * (XO - w / 2), 0.6 + i * 0.75, ZF + 0.02] });
      }
    });
    // hipped slate roof behind the parapet, with end stacks
    b.hip(2 * XO - 0.6, dep - 0.6, 3.0, roof, { at: [0, TOP, zm] });
    b.sym((s) => b.chimney(1.4, 4.6, 0.8, brick, { at: [s * (XO - 1.5), TOP, zm], pots: 3 }));
    b.chimney(1.2, 4.0, 0.7, brick, { at: [-3.3, TOP + 0.5, zm], pots: 2 });

    // front windows: tall 6-over-6 sashes, keystones over the ground and first floors
    const sashWin = (x: number, y: number, h: number, rows: number, key: boolean) => {
      b.window(1.25, h, { at: [x, y, ZF], facing: '+z', frame: sash, bars: [3, rows], border: 0.09 });
      b.box(1.45, 0.08, 0.16, stone, { at: [x, y - 0.08, ZF + 0.05] });
      if (key) {
        b.panel(1.45, 0.28, brick === P.brickOrange ? P.brickRed : tint(brick, 0.08), { at: [x, y + h, ZF], facing: '+z', depth: 0.04 });
        b.panel(0.3, 0.36, stone, { at: [x, y + h, ZF], facing: '+z', depth: 0.07 });
      }
    };
    for (const x of BAYS) {
      if (x === 0) continue;
      if (x !== -3.3) sashWin(x, 0.95, 2.2, 4, true);
      sashWin(x, G + 0.7, 2.4, 4, true);
      sashWin(x, G + F1 + 0.6, 1.55, 3, false);
    }
    // Venetian window over the arch
    b.window(1.3, 2.0, { at: [0, G + 1.4, ZF], facing: '+z', frame: sash, shape: 'round', bars: [3, 4], border: 0.09 });
    b.sym((s) => b.window(0.7, 1.45, { at: [s * 1.12, G + 1.4, ZF], facing: '+z', frame: sash, bars: [2, 3], border: 0.08 }));
    b.sym((s) => b.panel(0.12, 1.45, stone, { at: [s * 0.78, G + 1.4, ZF], facing: '+z', depth: 0.09 }));
    b.box(2.9, 0.12, 0.18, stone, { at: [0, G + 1.3, ZF + 0.06] });
    sashWin(0, G + F1 + 0.6, 1.55, 3, false);
    // front door with a pedimented doorcase and steps
    const dx = -3.3;
    b.stairs(2.0, 0.45, 0.9, 3, stone, { at: [dx, 0, ZF + 0.45] });
    b.panel(1.2, 2.5, door, { at: [dx, 0.45, ZF], facing: '+z', depth: 0.06 });
    b.panel(1.0, 0.45, P.windowDark, { at: [dx, 3.0, ZF], facing: '+z', shape: 'round', depth: 0.06 });
    b.sym((s) => b.column(0.12, 2.9, sash, { at: [dx + s * 0.85, 0.45, ZF + 0.15], order: 'doric' }));
    b.box(2.1, 0.2, 0.36, sash, { at: [dx, 3.35, ZF + 0.12] });
    b.extrude([[-1.1, 0], [1.1, 0], [0, 0.45]], 0.36, sash, { at: [dx, 3.55, ZF + 0.12] });
    // lamps either side of the arch and the swinging sign
    b.sym((s) => {
      b.box(0.06, 0.06, 0.6, P.castIron, { at: [s * 2.35, 3.5, ZF + 0.3] });
      b.box(0.24, 0.4, 0.24, P.windowLit, { at: [s * 2.35, 3.1, ZF + 0.6], jitter: false });
      b.pyramid(0.34, 0.34, 0.2, P.castIron, { at: [s * 2.35, 3.5, ZF + 0.6] });
    });
    hangingSign(b, [4.65, 4.3, ZF], '+z', P.doorBlue, { out: 2.0, w: 1.4, h: 1.5, picture: P.gold, frame: P.black });

    // back of the street range: plainer sashes and a stair window
    for (const x of [-8.7, -6, 6, 8.7]) {
      b.window(1.2, 2.0, { at: [x, 1.0, ZFB], facing: '-z', frame: sash, bars: [3, 4] });
      b.window(1.2, 2.2, { at: [x, G + 0.7, ZFB], facing: '-z', frame: sash, bars: [3, 4] });
      b.window(1.2, 1.5, { at: [x, G + F1 + 0.6, ZFB], facing: '-z', frame: sash, bars: [3, 3] });
    }
    b.window(1.3, 2.8, { at: [-3.3, 4.6, ZFB], facing: '-z', frame: sash, shape: 'round', bars: [3, 5] });
    b.panel(1.1, 2.3, door, { at: [3.3, 0.5, ZFB], facing: '-z' });
    // ends of the street range
    b.sym((s) => {
      for (const z of [ZFB + 2, ZF - 2]) {
        b.window(1.2, 2.2, { at: [s * XO, G + 0.7, z], facing: s > 0 ? '+x' : '-x', frame: sash, bars: [3, 4] });
      }
    });

    // ---------------- yard ranges
    const WZ0 = -6.6; // back of the wings
    const wd = ZFB - WZ0;
    const wz = (ZFB + WZ0) / 2;
    // west wing: kitchen and chambers, two storeys
    const wH = 6.2;
    b.box(5.4, wH, wd, brick, { at: [-XO + 2.7, 0, wz] });
    b.box(5.5, 0.4, wd + 0.06, stone, { at: [-XO + 2.7, 0, wz] });
    b.gable(5.4, wd, 2.0, roof, { at: [-XO + 2.7, wH, wz], ridge: 'z', overhang: 0.25, wall: brick });
    for (const z of spread(3, WZ0 + 1.6, ZFB - 1.6)) {
      b.window(1.1, 1.9, { at: [-XO + 5.4, 0.9, z], facing: '+x', frame: sash, bars: [3, 4] });
      b.window(1.1, 1.7, { at: [-XO + 5.4, 3.8, z], facing: '+x', frame: sash, bars: [3, 3] });
      b.window(1.1, 1.7, { at: [-XO, 3.8, z], facing: '-x', frame: sash, bars: [3, 3] });
    }
    b.panel(1.0, 2.1, door, { at: [-XO + 5.4, 0.4, ZFB - 0.8], facing: '+x' });
    b.chimney(1.0, 2.0, 0.8, brick, { at: [-XO + 1.2, wH + 1.0, wz], pots: 2 });
    // east wing: stables below, hayloft above with a hoist door
    const sH = 5.2;
    b.box(5.4, sH, wd, tint(brick, -0.04), { at: [XO - 2.7, 0, wz] });
    b.gable(5.4, wd, 2.2, roof, { at: [XO - 2.7, sH, wz], ridge: 'z', overhang: 0.25, wall: tint(brick, -0.04) });
    for (const z of spread(4, WZ0 + 1.2, ZFB - 1.2)) {
      b.panel(1.2, 2.3, P.doorGreen, { at: [XO - 5.4, 0, z], facing: '-x' });
      b.panel(1.2, 0.08, P.white, { at: [XO - 5.4, 1.2, z], facing: '-x', depth: 0.08 });
      b.panel(0.9, 0.5, P.windowDark, { at: [XO, 1.8, z], facing: '+x', shape: 'segmental' });
    }
    b.panel(1.4, 1.6, P.doorGreen, { at: [XO - 5.4, 3.1, wz], facing: '-x' });
    b.box(0.1, 0.1, 1.2, P.oakDark, { at: [XO - 5.9, 4.9, wz], rot: [0, Math.PI / 2, 0] });
    // coach house across the back: three open arches
    const cz = (WZ0 + -10.5) / 2;
    b.box(2 * XO, 4.6, 0.4, brick, { at: [0, 0, -10.3] });
    b.sym((s) => b.box(0.4, 4.6, 3.9, brick, { at: [s * (XO - 0.2), 0, cz] }));
    b.archWall(10.2, 4.6, 0.4, brick, { at: [0, 0, WZ0], facing: '+z', openings: 3, openW: 2.8, openH: 3.6, shape: 'segmental' });
    b.box(10.2, 0.3, 3.9, tint(P.plaster, -0.15), { at: [0, 4.3, cz] });
    b.box(10, 0.05, 3.6, P.soil, { at: [0, 0.01, cz] });
    b.hip(2 * XO, 4.1, 1.9, roof, { at: [0, 4.6, cz], overhang: 0.25 });
    for (const x of [-3.4, 0, 3.4]) b.panel(2.6, 3.2, P.windowDark, { at: [x, 0, -10.1], facing: '+z', shape: 'segmental' });
    b.box(0.5, 3.4, 0.5, brick, { at: [-1.7, 0, -7.3] });
    b.box(0.5, 3.4, 0.5, brick, { at: [1.7, 0, -7.3] });
    for (const x of [-10.5 + 1.8, 10.5 - 1.8]) b.panel(1.0, 0.6, P.windowDark, { at: [x, 2.0, -10.5], facing: '-z', shape: 'segmental' });

    // a stagecoach waiting in the yard, a mounting block and a pump
    b.group({ at: [-0.6, 0, -2.6], rotY: -Math.PI / 2 + 0.25 }, () => coach(b, b.pick([P.doorRed, P.doorGreen, tint(P.doorRed, -0.1)])));
    b.stairs(1.0, 0.8, 1.2, 3, stone, { at: [-4.4, 0, 1.6], rotY: -Math.PI / 2 });
    b.group({ at: [3.5, 0, 1.8] }, () => {
      b.box(0.4, 1.4, 0.4, P.castIron);
      b.box(0.08, 0.08, 0.6, P.castIron, { at: [0, 1.2, 0.4] });
      b.box(1.2, 0.4, 0.6, P.rubble, { at: [0, 0, 0.8] });
    });

    // ---------------- colliders: the ranges, leaving the arch and yard open
    b.sym((s) => b.collider(sw, dep, { at: [s * (PW + sw / 2), 0, zm] }));
    b.collider(5.4, wd, { at: [-XO + 2.7, 0, wz] });
    b.collider(5.4, wd, { at: [XO - 2.7, 0, wz] });
    b.collider(2 * XO, 3.9, { at: [0, 0, cz] });
  },
};
