import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { strip } from './shared';

// The court: a long hall along X. Outer walls x X0..X1, z Z0..Z1, T thick.
const X0 = -19.4;
const X1 = 10.6;
const Z0 = -7;
const Z1 = 5;
const T = 0.8;
const LOW = 5.2; // top of the solid lower wall
const EAVES = 9.4;
const RIDGE_H = 6.6;
const XM = (X0 + X1) / 2;
const ZM = (Z0 + Z1) / 2;
const IX0 = X0 + T;
const IX1 = X1 - T;
const IZ0 = Z0 + T;
const IZ1 = Z1 - T;
/** Depth of the galleries under the penthouse. */
const GAL = 2.1;
/** Where the court's front door is. */
const DOOR_X = 7.4;
/** The keeper's house at the +X end. */
const HX0 = X1;
const HX1 = 18.6;
const HZ0 = -4.6;
const HZ1 = 5.6;

export const jeuDePaume: BuildingDef = {
  id: 'jeu-de-paume',
  name: 'Jeu de paume',
  style: 'Renaissance (vernacular)',
  date: 'c. 1560',
  summary:
    'Jeu de paume, the ancestor of tennis, was the passion of the French Renaissance: players hit the ball first with the palm (paume) and then with a racket, off the walls and the sloping roof of a gallery. ' +
    'A covered court is a plain, very tall hall: solid walls below, where the ball is played, and openings high up hung with nets to let in the light. Inside, a gallery under a lean-to roof, the penthouse, runs along one side and one end, and spectators watch through its openings. ' +
    'Courts were businesses kept by a master (maître paumier), who lived next door, and they were long, roofed and had galleries: so when travelling actors needed a hall, they hired one. In Paris the Théâtre du Marais (1634) and Molière’s Illustre Théâtre (1643) both opened in tennis courts, and the long, narrow French playhouse grew out of them.',
  materials: ['brick with stone dressings', 'oak roof frame', 'flat clay tiles', 'stone floor', 'walls painted black inside', 'nets'],
  influences: ['italian-renaissance'],
  lookFor: [
    {
      label: 'Penthouse (le toit)',
      note: 'The sloping lean-to roof over the galleries. It is part of the game: the server must hit the ball on to it.',
      at: [-6, 3.4, IZ0 + 1.0],
    },
    {
      label: 'Galleries',
      note: 'Openings under the penthouse where spectators and waiting players sat, protected by nets. When a troupe took over a court, they became the first boxes.',
      at: [-12, 1.6, IZ0 + GAL],
    },
    {
      label: 'High openings with nets',
      note: 'The lower walls are solid for play and painted black so the ball shows; all the light comes from openings above them, netted to keep the balls in.',
      at: [XM, LOW + 1.8, Z1 + 0.2],
    },
    {
      label: 'The net',
      note: 'At first a cord with a fringe hung across the middle of the court; a full net came later.',
      at: [-4.4, 1.2, ZM + 2],
    },
    {
      label: 'The keeper’s house',
      note: 'The maître paumier lived beside his court, hired out rackets and balls, and sold drink. Players and audiences came in through his house.',
      at: [(HX0 + HX1) / 2, 2.0, HZ1 + 0.2],
    },
  ],
  build(b) {
    const cutaway = b.cutaway;
    const brick = tint(P.briqueNord, b.range(-0.03, 0.02));
    const stone = tint(P.pierreBlonde, -0.02);
    const tile = tint(P.tuilePlate, b.range(-0.03, 0.02));
    const black = mix(P.black, P.doorBlue, 0.12);
    const oak = P.oak;
    const net = mix(P.windowDark, P.white, 0.18);
    const floor = tint(P.gritstone, -0.04);

    /** A band round the outside of the hall walls at height y (plinth, string course, cornice). */
    const ring = (y: number, h: number, proud: number) => {
      const w = X1 - X0 + 2 * proud;
      const d = Z1 - Z0 + 2 * proud;
      const t = T * 0.5 + proud;
      for (const z of [Z0 - proud + t / 2, Z1 + proud - t / 2]) b.box(w, h, t, stone, { at: [XM, y, z] });
      for (const x of [X0 - proud + t / 2, X1 + proud - t / 2]) b.box(t, h, d - 2 * t, stone, { at: [x, y, ZM] });
    };

    // ------------------------------------------------ the hall: solid lower walls, open upper walls, roof
    // back and end walls
    b.box(X1 - X0, LOW, T, brick, { at: [XM, 0, Z0 + T / 2] });
    b.sym((s) => {
      const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
      b.box(T, LOW, Z1 - Z0 - 2 * T, brick, { at: [x, 0, ZM] });
    });
    // front wall, with the door into the court
    const dl = DOOR_X - 0.8;
    const dr = DOOR_X + 0.8;
    b.box(dl - X0, LOW, T, brick, { at: [(X0 + dl) / 2, 0, Z1 - T / 2] });
    b.box(X1 - dr, LOW, T, brick, { at: [(dr + X1) / 2, 0, Z1 - T / 2] });
    b.box(dr - dl, LOW - 2.5, T, brick, { at: [DOOR_X, 2.5, Z1 - T / 2] });
    b.panel(2.1, 2.9, stone, { at: [DOOR_X, 0, Z1], shape: 'segmental', depth: 0.08 });
    b.panel(1.5, 2.45, P.doorBlack, { at: [DOOR_X, 0, Z1 + 0.04], shape: 'segmental', depth: 0.06 });
    // the upper walls: piers between tall netted openings
    const up = EAVES - LOW;
    const n = 9;
    // (when the building is opened, the front upper wall comes off with the roof)
    if (!cutaway) b.archWall(X1 - X0, up, T, brick, { at: [XM, LOW, Z1 - T / 2], openings: n, openW: 2.1, openH: 3.0, shape: 'rect', sill: 0.5 });
    b.archWall(X1 - X0, up, T, brick, { at: [XM, LOW, Z0 + T / 2], facing: '-z', openings: n, openW: 2.1, openH: 3.0, shape: 'rect', sill: 0.5 });
    b.sym((s) => {
      const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
      b.archWall(Z1 - Z0 - 2 * T, up, T, brick, { at: [x, LOW, ZM], facing: s > 0 ? '+x' : '-x', openings: 3, openW: 2.1, openH: 3.0, shape: 'rect', sill: 0.5 });
    });
    const pitch = (X1 - X0) / n;
    for (let i = 0; i < n; i++) {
      const x = X0 + (i + 0.5) * pitch;
      for (const [z, f] of [[Z1 - T / 2, '+z'], [Z0 + T / 2, '-z']] as const) {
        if (cutaway && f === '+z') continue;
        b.panel(2.1, 3.0, net, { at: [x, LOW + 0.5, z], facing: f, depth: 0.02 });
        b.panel(2.4, 0.2, stone, { at: [x, LOW + 0.3, z + (f === '+z' ? T / 2 : -T / 2)], facing: f, depth: 0.12 });
      }
    }
    b.sym((s) => {
      const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
      const p = (Z1 - Z0 - 2 * T) / 3;
      for (let i = 0; i < 3; i++) {
        const z = Z0 + T + (i + 0.5) * p;
        b.panel(2.1, 3.0, net, { at: [x, LOW + 0.5, z], facing: s > 0 ? '+x' : '-x', depth: 0.02 });
        b.panel(2.4, 0.2, stone, { at: [x + s * T / 2, LOW + 0.3, z], facing: s > 0 ? '+x' : '-x', depth: 0.12 });
      }
    });
    // stone plinth, string course, quoins and eaves cornice
    ring(0, 0.5, 0.08);
    ring(LOW - 0.15, 0.3, 0.1);
    if (!cutaway) ring(EAVES - 0.3, 0.3, 0.15);
    else {
      b.box(X1 - X0 + 0.3, 0.3, T / 2 + 0.15, stone, { at: [XM, EAVES - 0.3, Z0 - 0.15 + (T / 2 + 0.15) / 2] });
      for (const x of [X0 - 0.15 + (T / 2 + 0.15) / 2, X1 + 0.15 - (T / 2 + 0.15) / 2]) {
        b.box(T / 2 + 0.15, 0.3, Z1 - Z0 - T, stone, { at: [x, EAVES - 0.3, ZM - T / 2] });
      }
    }
    for (const x of [X0, X1]) {
      for (const z of [Z0, Z1]) {
        for (let y = 0.5; y < EAVES - 0.6; y += 0.9) {
          const long = Math.round(y / 0.9) % 2 === 0;
          b.box(long ? 0.95 : 0.55, 0.45, long ? 0.55 : 0.95, stone, { at: [x - Math.sign(x - XM) * (long ? 0.35 : 0.15), y, z - Math.sign(z - ZM) * (long ? 0.15 : 0.35)] });
        }
      }
    }
    // gable ends stand even when the roof is lifted off
    b.sym((s) => {
      const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
      const hw = (Z1 - Z0) / 2;
      b.extrude([[-hw, 0], [hw, 0], [0, RIDGE_H]], T, brick, { at: [x, EAVES, ZM], rotY: Math.PI / 2 });
      b.window(0.8, 1.2, { at: [x + s * T / 2, EAVES + 1.4, ZM], facing: s > 0 ? '+x' : '-x', frame: stone, shape: 'round' });
    });
    // the roof frame: tie beams and king posts
    for (let i = 1; i < n; i++) {
      if (cutaway) break;
      const x = X0 + i * pitch;
      b.beam([x, EAVES - 0.1, Z0 + 0.4], [x, EAVES - 0.1, Z1 - 0.4], 0.28, 0.3, oak);
      b.beam([x, EAVES, ZM], [x, EAVES + RIDGE_H - 0.3, ZM], 0.24, 0.24, oak);
      b.sym((s) => b.beam([x, EAVES, ZM + s * ((Z1 - Z0) / 2 - 0.4)], [x, EAVES + RIDGE_H - 0.3, ZM], 0.2, 0.22, oak));
    }
    if (!cutaway) {
      b.gable(X1 - X0 - 2 * T + 0.02, Z1 - Z0, RIDGE_H, tile, { at: [XM, EAVES, ZM], overhang: 0.45, wall: brick, jitter: false });
      // the verges over the gable walls
      b.sym((s) => {
        const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
        b.gable(T + 0.9, Z1 - Z0, RIDGE_H, tile, { at: [x, EAVES, ZM], overhang: 0.45, jitter: false });
      });
    } else {
      b.sym((s) => {
        const x = s > 0 ? X1 - T / 2 : X0 + T / 2;
        b.gable(T + 0.9, Z1 - Z0, RIDGE_H, tile, { at: [x, EAVES, ZM], overhang: 0.45, jitter: false });
      });
      // the wall plates the roof sat on
      b.box(X1 - X0 - 2 * T, 0.25, 0.4, oak, { at: [XM, EAVES, Z0 + 0.4] });
    }

    // ------------------------------------------------ inside: the court
    b.box(IX1 - IX0, 0.05, IZ1 - IZ0, floor, { at: [XM, 0, (IZ0 + IZ1) / 2] });
    // the playing walls, painted black
    b.box(dl - IX0, LOW, 0.05, black, { at: [(IX0 + dl) / 2, 0, IZ1 - 0.025] });
    b.box(IX1 - dr, LOW, 0.05, black, { at: [(dr + IX1) / 2, 0, IZ1 - 0.025] });
    b.box(0.05, LOW, IZ1 - IZ0, black, { at: [IX1 - 0.025, 0, (IZ0 + IZ1) / 2] });
    // lines (chases) on the floor
    for (let i = 1; i < 8; i++) {
      for (const x of [-4.4 - i * 1.6, -4.4 + i * 1.6]) {
        if (x < IX0 + GAL + 0.3 || x > IX1 - 0.3) continue;
        b.box(0.06, 0.02, IZ1 - IZ0 - GAL - 0.4, P.white, { at: [x, 0.05, (IZ0 + GAL + IZ1) / 2], jitter: false });
      }
    }
    // the side gallery and its penthouse
    const gz = IZ0 + GAL;
    b.box(IX1 - IX0 - GAL, 1.0, 0.3, black, { at: [(IX0 + GAL + IX1) / 2, 0, gz] });
    const posts = 12;
    for (let i = 0; i <= posts; i++) {
      const x = IX0 + GAL + ((IX1 - IX0 - GAL) * i) / posts;
      b.box(0.22, 1.5, 0.22, black, { at: [x, 1.0, gz] });
    }
    b.box(IX1 - IX0 - GAL, 0.2, 0.3, black, { at: [(IX0 + GAL + IX1) / 2, 2.5, gz] });
    b.panel(IX1 - IX0 - GAL, 1.5, net, { at: [(IX0 + GAL + IX1) / 2, 1.0, gz - 0.1], depth: 0.01 });
    b.beam([(IX0 + GAL + IX1) / 2, 2.62, gz + 0.12], [(IX0 + GAL + IX1) / 2, 3.95, IZ0], IX1 - IX0 - GAL, 0.16, tile);
    // benches in the gallery
    b.box(IX1 - IX0 - GAL - 0.4, 0.45, 0.4, oak, { at: [(IX0 + GAL + IX1) / 2, 0, IZ0 + 0.5] });
    // the end gallery and its penthouse
    const gx = IX0 + GAL;
    b.box(0.3, 1.0, IZ1 - IZ0, black, { at: [gx, 0, (IZ0 + IZ1) / 2] });
    for (let i = 0; i <= 5; i++) b.box(0.22, 1.5, 0.22, black, { at: [gx, 1.0, IZ0 + ((IZ1 - IZ0) * i) / 5] });
    b.box(0.3, 0.2, IZ1 - IZ0, black, { at: [gx, 2.5, (IZ0 + IZ1) / 2] });
    b.panel(IZ1 - IZ0, 1.5, net, { at: [gx - 0.1, 1.0, (IZ0 + IZ1) / 2], facing: '+x', depth: 0.01 });
    b.beam([gx + 0.12, 2.62, (IZ0 + IZ1) / 2], [IX0, 3.95, (IZ0 + IZ1) / 2], IZ1 - IZ0, 0.16, tile);
    b.box(0.4, 0.45, IZ1 - IZ0 - 0.4, oak, { at: [IX0 + 0.5, 0, (IZ0 + IZ1) / 2] });
    // the net: a cord sagging across the middle, with a fringe
    const nx = -4.4;
    const cord: [number, number, number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      const z = gz + 0.2 + (IZ1 - gz - 0.2) * u;
      const y = 0.95 + 0.6 * Math.pow(2 * u - 1, 2);
      cord.push([nx, z, y - 0.55, y]);
    }
    strip(b, cord, mix(P.cream, P.white, 0.5));
    b.box(0.12, 1.6, 0.12, oak, { at: [nx, 0, IZ1 - 0.15] });

    // ------------------------------------------------ the keeper's house, at the street end
    const hxm = (HX0 + HX1) / 2;
    const hzm = (HZ0 + HZ1) / 2;
    const hw = HX1 - HX0;
    const hd = HZ1 - HZ0;
    const G = 3.2;
    const U = 2.8;
    const plaster = tint(P.torchis, b.range(-0.02, 0.03));
    b.box(hw, G, hd, brick, { at: [hxm, 0, hzm] });
    b.box(hw + 0.04, 0.3, hd + 0.04, stone, { at: [hxm, G - 0.3, hzm] });
    b.box(hw, U, hd, plaster, { at: [hxm, G, hzm] });
    b.frame(hw, U, oak, { at: [hxm, G, HZ1], studs: 5, rails: 1, brace: 'saltire' });
    b.frame(hd, U, oak, { at: [HX1, G, hzm], facing: '+x', studs: 6, rails: 1, brace: 'corner' });
    b.frame(hd, U, oak, { at: [hxm, G, HZ0], facing: '-z', studs: 5, rails: 1, brace: 'corner' });
    b.gable(hw, hd, 4.8, tile, { at: [hxm, G + U, hzm], ridge: 'z', overhang: 0.4, wall: plaster });
    b.chimney(0.9, 2.2, 0.7, brick, { at: [HX1 - 1.2, G + U + 2.6, hzm - 1.5] });
    // ground floor: door and a window with a stone cross (mullion and transom)
    b.panel(1.6, 2.6, stone, { at: [hxm - 1.8, 0, HZ1], shape: 'segmental', depth: 0.08 });
    b.panel(1.1, 2.2, tint(P.oakDark, 0.05), { at: [hxm - 1.8, 0, HZ1 + 0.04], shape: 'segmental', depth: 0.06 });
    b.window(1.6, 1.8, { at: [hxm + 1.6, 0.9, HZ1], frame: stone, bars: [2, 2], border: 0.14 });
    for (const x of [hxm - 2.0, hxm + 1.6]) b.window(1.0, 1.4, { at: [x, G + 0.7, HZ1 + 0.06], frame: oak, bars: [2, 3] });
    b.window(0.8, 1.1, { at: [hxm, G + U + 1.0, HZ1], frame: oak, bars: [2, 2] });
    b.window(1.2, 1.5, { at: [HX1, 0.9, hzm + 2], facing: '+x', frame: stone, bars: [2, 2] });
    for (const z of [hzm - 2.5, hzm + 2.5]) b.window(1.0, 1.4, { at: [HX1 + 0.06, G + 0.7, z], facing: '+x', frame: oak, bars: [2, 3] });
    // a sign: an iron bracket with a painted board showing a racket
    b.box(0.08, 0.08, 1.3, P.iron, { at: [hxm + 3.6, 3.0, HZ1 + 0.65] });
    b.box(0.08, 0.8, 0.8, tint(P.doorRed, 0.05), { at: [hxm + 3.6, 2.1, HZ1 + 0.75] });
    b.box(0.1, 0.4, 0.04, P.cream, { at: [hxm + 3.6, 2.3, HZ1 + 0.75], rot: [0.6, 0, 0] });

    // ------------------------------------------------ walk collisions: walls, galleries and the house
    b.collider(X1 - X0, T, { at: [XM, 0, Z0 + T / 2] });
    b.collider(dl - X0, T, { at: [(X0 + dl) / 2, 0, Z1 - T / 2] });
    b.collider(X1 - dr, T, { at: [(dr + X1) / 2, 0, Z1 - T / 2] });
    b.sym((s) => b.collider(T, Z1 - Z0, { at: [s > 0 ? X1 - T / 2 : X0 + T / 2, 0, ZM] }));
    b.collider(IX1 - IX0, GAL + 0.3, { at: [XM, 0, IZ0 + (GAL + 0.3) / 2] });
    b.collider(GAL + 0.3, IZ1 - IZ0, { at: [IX0 + (GAL + 0.3) / 2, 0, (IZ0 + IZ1) / 2] });
    b.collider(hw, hd, { at: [hxm, 0, hzm] });
  },
};
