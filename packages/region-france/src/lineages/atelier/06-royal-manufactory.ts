import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, lin, rise, riverWall, tenter } from './shared';

/** Stone quoins up a brick corner: alternating long and short blocks on two faces. */
function quoins(b: Builder, x: number, z: number, h: number, sx: 1 | -1, sz: 1 | -1, stone: number) {
  for (let y = 0, i = 0; y < h - 0.4; y += 0.75, i++) {
    const long = i % 2 === 0;
    b.box(long ? 0.9 : 0.5, 0.72, 0.12, stone, { at: [x - sx * (long ? 0.45 : 0.25), y, z + sz * 0.05], jitter: false });
    b.box(0.12, 0.72, long ? 0.5 : 0.9, stone, { at: [x + sx * 0.05, y, z - sz * (long ? 0.25 : 0.45)], jitter: false });
  }
}

export const royalManufactory: BuildingDef = {
  id: 'royal-manufactory',
  name: 'Royal manufactory (manufacture royale)',
  style: 'Louis XIV classical',
  date: 'c. 1680',
  summary:
    'Colbert, Louis XIV’s minister, wanted France to stop buying fine cloth, glass and lace from abroad, so from the 1660s he granted chosen firms the title of royal manufactory, with monopolies, loans, tax exemptions and foreign craftsmen. ' +
    'Under one roof the looms, the shearers and the pressers worked to rules, by the bell, under inspectors: a step from the scattered workshops of the guilds toward the factory. ' +
    'The building says so: one long symmetrical range of brick with stone dressings and a tall slate roof, a central pavilion with a pediment carrying the royal arms, a bell turret over it, and a court closed by a gate, like a château of work. ' +
    'Behind, on the river, the cloth is washed; in the court it is stretched on the tenter frames that gave the Van Robais works at Abbeville its name, the Rames.',
  materials: ['red brick', 'limestone dressings', 'slate', 'wrought iron gate'],
  modelledOn: 'The Manufacture des Rames at Abbeville, founded in 1665 by the Dutch clothier Josse van Robais under letters patent from Colbert to weave fine cloth in the Dutch manner. Taken from it: the brick and stone range round a court, and the tenter frames; the pavilion, turret and gate are generic, and the buildings that survive at Abbeville are later than this date',
  lookFor: [
    { label: 'Pediment with the royal arms', note: 'The king’s arms over the centre proclaim the royal privilege granted to the works.', at: [0, 10.6, -1.0] },
    { label: 'Bell turret', note: 'The bell rang the start and end of the working day, a new discipline for craftsmen used to their own hours.', at: [0, 16.8, -6.0] },
    { label: 'Long workshop range', note: 'Rows of tall windows lit the looms and benches on both floors of the long range.', at: [-9.0, 5.8, -1.7] },
    { label: 'Carriage gate and court', note: 'Stone piers and an iron gate close the court, so that wool, cloth and workers all came in under the porter’s eye.', at: [0, 3.6, 10.6] },
    { label: 'Tenter frames (rames)', note: 'The washed and fulled cloth was stretched to size on these frames in the court.', at: [7.0, 2.2, 4.0] },
  ],
  influences: [],
  build(b) {
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, 0.03), P.brickRed]);
    const stone = b.pick([P.pierreBlonde, P.craie]);
    const slate = P.ardoise;
    const glass = P.windowDark;
    const W = 32;
    const D = 8;
    const z0 = -6;
    const g = 4.4;
    const f = 4.0;
    const H = g + f;
    const front = z0 + D / 2;
    const back = z0 - D / 2;

    b.box(35, 0.04, 21.6, P.gravel, { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tint(stone, -0.08), { coping: stone, top: 0.3 });

    // ---- the main range
    b.box(W, H, D, brick, { at: [0, 0, z0] });
    b.box(W + 0.1, 0.8, D + 0.1, stone, { at: [0, 0, z0] }); // plinth
    b.box(W + 0.12, 0.25, D + 0.12, stone, { at: [0, g - 0.1, z0] }); // floor band
    b.box(W + 0.3, 0.45, D + 0.3, stone, { at: [0, H - 0.2, z0] }); // cornice
    for (const sx of [1, -1] as const) for (const sz of [1, -1] as const) quoins(b, sx * W / 2, z0 + sz * D / 2, H, sx, sz, stone);
    const rr = rise(D, 55);
    b.hip(W + 0.4, D + 0.4, rr, slate, { at: [0, H + 0.2, z0] });
    // windows: tall, in strict rows, stone surrounds; dormers on the roof
    const bays = 13;
    const pitch = W / bays;
    for (let i = 0; i < bays; i++) {
      const x = -W / 2 + (i + 0.5) * pitch;
      const centre = Math.abs(x) < pitch * 1.6;
      for (const [z, facing] of [
        [front, '+z'],
        [back, '-z'],
      ] as const) {
        const riverDoor = facing === '-z' && (i === 3 || i === 9);
        if (riverDoor) b.panel(2.0, 3.0, P.doorGreen, { at: [x, 0.8, z], facing, shape: 'segmental' });
        if (!(centre && facing === '+z')) {
          if (!riverDoor) b.window(1.3, 2.6, { at: [x, 1.2, z], facing, frame: stone, glass, bars: [2, 3], border: 0.16 });
          b.window(1.3, 2.4, { at: [x, g + 0.8, z], facing, frame: stone, glass, bars: [2, 3], border: 0.16 });
        }
        if (i % 2 === 1 && !centre) {
          const dz = z + (facing === '+z' ? -1.3 : 1.3);
          b.box(1.2, 1.5, 1.0, stone, { at: [x, H + 0.6, dz] });
          b.gable(1.4, 1.2, 0.6, slate, { at: [x, H + 2.1, dz], ridge: 'z' });
          b.window(0.8, 1.1, { at: [x, H + 0.8, dz + (facing === '+z' ? 0.5 : -0.5)], facing, frame: P.white, glass, bars: [2, 2] });
        }
      }
    }
    // end walls: a window on each floor
    b.sym((s) => {
      for (const y of [1.2, g + 0.8]) for (const z of [z0 - 1.6, z0 + 1.6]) b.window(1.3, 2.4, { at: [s * W / 2, y, z], facing: s > 0 ? '+x' : '-x', frame: stone, glass, bars: [2, 3] });
    });

    // ---- the central pavilion: stone, projecting, a pediment, the door, the bell turret
    const CW = 8.4;
    b.box(CW, H + 0.4, 0.8, stone, { at: [0, 0, front + 0.4] });
    b.box(CW + 0.3, 0.45, 1.1, tint(stone, 0.04), { at: [0, H, front + 0.45] });
    b.sym((s) => {
      for (const x of [s * (CW / 2 - 0.4)]) b.box(0.7, H - 0.8, 0.12, tint(stone, 0.05), { at: [x, 0.8, front + 0.86] }); // pilasters
    });
    b.panel(2.4, 3.6, P.doorGreen, { at: [0, 0.4, front + 0.8], facing: '+z', shape: 'segmental' });
    b.panel(3.0, 4.0, tint(stone, -0.06), { at: [0, 0.4, front + 0.79], facing: '+z', shape: 'segmental', depth: 0.04 });
    b.stairs(3.4, 0.4, 1.2, 2, stone, { at: [0, 0, front + 1.4] });
    for (const x of [-2.4, 0, 2.4]) b.window(1.3, 2.4, { at: [x, g + 0.8, front + 0.8], facing: '+z', frame: tint(stone, 0.05), glass, bars: [2, 4] });
    for (const x of [-2.4, 2.4]) b.window(1.3, 2.6, { at: [x, 1.2, front + 0.8], facing: '+z', frame: tint(stone, 0.05), glass, bars: [2, 4] });
    // the pediment, with the royal arms in an oval
    const ph = 2.0;
    b.extrude(
      [
        [-CW / 2 - 0.15, 0],
        [CW / 2 + 0.15, 0],
        [0, ph],
      ],
      1.0,
      stone,
      { at: [0, H + 0.45, front + 0.4] },
    );
    b.panel(1.4, 1.1, P.voletBleu, { at: [0, H + 0.6, front + 0.9], facing: '+z', shape: 'circle' });
    b.panel(0.6, 0.6, P.gold, { at: [0, H + 0.85, front + 0.95], facing: '+z', shape: 'circle' });
    // the bell turret: a square stone base on the ridge, an open belfry, a slate dome and finial
    const ty = H + rr - 0.4;
    b.box(2.0, 1.4, 2.0, stone, { at: [0, ty, z0] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.3, 1.8, 0.3, stone, { at: [sx * 0.85, ty + 1.4, z0 + sz * 0.85] });
    b.lathe([[0.25, 0], [0.45, 0.25], [0.45, 0.65], [0.2, 0.8]], P.bronze, { at: [0, ty + 1.6, z0], segs: 8 });
    b.box(2.2, 0.25, 2.2, stone, { at: [0, ty + 3.2, z0] });
    b.lathe([[1.1, 0], [1.05, 0.5], [0.7, 1.0], [0.15, 1.3], [0.1, 1.8], [0.25, 2.0], [0.02, 2.4]], slate, { at: [0, ty + 3.45, z0], segs: 8 });
    b.panel(0.9, 0.9, P.white, { at: [0, ty + 0.25, z0 + 1.0], facing: '+z', shape: 'circle' }); // a clock

    // ---- the side wings closing the court
    const ww = 5.0;
    const wd = 11;
    const wh = 4.6;
    b.sym((s) => {
      const x = s * (W / 2 - ww / 2);
      const z = front + wd / 2;
      b.box(ww, wh, wd, brick, { at: [x, 0, z] });
      b.box(ww + 0.1, 0.7, wd + 0.1, stone, { at: [x, 0, z] });
      b.box(ww + 0.25, 0.35, wd + 0.25, stone, { at: [x, wh - 0.2, z] });
      b.hip(ww + 0.3, wd + 0.3, rise(ww, 55), slate, { at: [x, wh + 0.15, z] });
      for (const zz of lin(4, z - wd / 2 + 1.6, z + wd / 2 - 1.4)) {
        b.window(1.2, 2.4, { at: [x - s * (ww / 2), 1.1, zz], facing: s > 0 ? '-x' : '+x', frame: stone, glass, bars: [2, 3] });
        b.window(1.2, 2.4, { at: [x + s * (ww / 2), 1.1, zz], facing: s > 0 ? '+x' : '-x', frame: stone, glass, bars: [2, 3] });
      }
      b.window(1.2, 2.4, { at: [x, 1.1, z + wd / 2], facing: '+z', frame: stone, glass, bars: [2, 3] });
      quoins(b, x + (s * ww) / 2, z + wd / 2, wh, s, 1, stone);
      quoins(b, x - (s * ww) / 2, z + wd / 2, wh, (-s) as 1 | -1, 1, stone);
    });

    // ---- the court wall and gate on the street
    const gz = 10.6;
    const gw = W - 2 * ww;
    b.sym((s) => {
      b.box(gw / 2 - 2.4, 2.6, 0.5, brick, { at: [s * (gw / 4 + 1.2), 0, gz] });
      b.box(gw / 2 - 2.3, 0.2, 0.65, stone, { at: [s * (gw / 4 + 1.2), 2.6, gz] });
      b.box(1.1, 4.0, 1.1, stone, { at: [s * 2.4, 0, gz] });
      b.box(1.3, 0.3, 1.3, tint(stone, 0.04), { at: [s * 2.4, 4.0, gz] });
      b.sphere(0.45, stone, { at: [s * 2.4, 4.75, gz], segs: 8 });
      b.sym((t) => b.box(0.16, 1.4, 0.16, stone, { at: [s * (gw / 4 + 1.2) + t * 2, 2.8, gz] }));
    });
    for (const x of lin(12, -1.8, 1.8)) b.box(0.05, 2.9, 0.05, P.castIron, { at: [x, 0, gz], jitter: false });
    b.box(3.8, 0.1, 0.1, P.castIron, { at: [0, 0.3, gz] });
    b.box(3.8, 0.1, 0.1, P.castIron, { at: [0, 2.7, gz] });

    // ---- the court: tenter frames and bales; behind, a washing place on the river
    for (const z of [2.0, 4.0, 6.0]) tenter(b, 6.0, z, 7, b.pick([P.doorBlue, P.cream, P.voletGris, 0x7a2e2a]));
    for (let i = 0; i < 4; i++) b.box(0.9, 0.7, 0.8, P.cream, { at: [-6.5 + (i % 2), Math.floor(i / 2) * 0.7, 3.0] });
    b.stairs(3.0, -WATER + 0.3, 2.2, 7, stone, { at: [7.38, WATER - 0.3, BANK - 1.0], rotY: Math.PI });
    
    b.stairs(3.0, -WATER + 0.3, 2.2, 7, stone, { at: [-7.38, WATER - 0.3, BANK - 1.0], rotY: Math.PI });

    b.collider(W, D, { at: [0, 0, z0] });
    b.sym((s) => b.collider(ww, wd, { at: [s * (W / 2 - ww / 2), 0, front + wd / 2] }));
    b.sym((s) => b.collider(gw / 2 - 1.4, 0.6, { at: [s * (gw / 4 + 1.6), 0, gz] }));
    for (const z of [2.0, 4.0, 6.0]) b.collider(7.2, 0.3, { at: [6.0, 0, z] });
  },
};
