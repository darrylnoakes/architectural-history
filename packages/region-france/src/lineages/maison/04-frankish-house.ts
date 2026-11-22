import { P, tint, type BuildingDef } from '@ah/kit';
import { hurdle, pitched, vegBed, woodpile } from './shared';

export const frankishHouse: BuildingDef = {
  id: 'frankish-house',
  name: 'Post house and sunken hut',
  style: 'Merovingian',
  date: 'c. AD 600 to 1000',
  summary:
    'Under the Frankish kings the old Roman town was half empty, much of it gardens, vineyards and ruins, and ordinary houses were built of timber again. ' +
    'Posts set in the ground carry a hipped roof of thatch that comes down almost to head height, over low walls of wattle and daub. ' +
    'Beside the house stands a sunken hut (fond de cabane): its floor is dug half a metre into the ground and its roof rests almost on the earth. The damp, even air suited weaving, and the loom weights of fired clay found on their floors are among the commonest finds of the period in northern France.',
  materials: ['oak posts set in the ground', 'wattle and daub', 'straw thatch', 'fired clay loom weights'],
  lookFor: [
    {
      label: 'Thatch down to head height',
      note: 'The hipped roof does most of the work of a wall: its eaves are no higher than a man, and the low walls beneath are hardly seen.',
      at: [-4.6, 1.9, 5.2],
    },
    {
      label: 'Posts set in the ground',
      note: 'Each post stands in its own hole; they rot at ground level in a generation, so the house was rebuilt every thirty years or so.',
      at: [1.85, 0.9, 5.0],
    },
    {
      label: 'Sunken hut (fond de cabane)',
      note: 'A pit roofed by a tent of thatch on two gable posts, with the spoil banked round it. Dug floors like this are found by the hundred.',
      at: [4.3, 2.3, 3.9],
    },
    {
      label: 'Warp-weighted loom',
      note: 'The warp threads hang from a beam and are kept taut by rings of fired clay; the weaver works standing in the pit.',
      at: [4.3, 1.0, 5.3],
    },
  ],
  build(b) {
    const daub = tint(b.pick([P.daub, P.cob, P.torchis]), b.range(-0.03, 0.02));
    const thatch = tint(b.pick([P.thatch, P.thatchOld, P.reed]), b.range(-0.03, 0.03));
    const post = P.oak;

    b.box(13.6, 0.03, 17.6, tint(P.earth, 0.12), { at: [0, 0, 0], jitter: false });

    // the long post house, eaves to the street
    const xc = -2.2;
    const zc = 1.6;
    const W = 8.6;
    const D = 5.6;
    const wallH = 1.5;
    b.box(W, wallH, D, daub, { at: [xc, 0, zc] });
    b.box(W + 0.04, 0.28, D + 0.04, P.wattle, { at: [xc, 0, zc] });
    for (const s of [1, -1]) {
      for (let i = 0; i <= 6; i++) b.cyl(0.14, wallH + 0.1, post, { at: [xc - W / 2 + (i * W) / 6, 0, zc + s * (D / 2 + 0.06)], segs: 6 });
    }
    for (const s of [1, -1]) b.cyl(0.14, wallH + 0.1, post, { at: [xc + s * (W / 2 + 0.06), 0, zc], segs: 6 });
    b.hip(W + 1.2, D + 1.4, 4.2, thatch, { at: [xc, wallH + 0.3, zc] });
    b.hip(W + 0.7, D + 0.9, 3.9, tint(thatch, -0.12), { at: [xc, wallH, zc] });
    // door under the eaves
    const dz = zc + D / 2;
    b.panel(1.1, 1.65, P.oakDark, { at: [xc + 1.2, 0, dz], facing: '+z', depth: 0.08 });
    b.panel(0.9, 1.55, P.timberBlack, { at: [xc + 1.2, 0, dz], facing: '+z', depth: 0.1 });
    b.box(1.2, 0.06, 0.8, P.earth, { at: [xc + 1.2, 0, dz + 0.4], jitter: false });
    b.panel(0.55, 0.4, P.oakDark, { at: [xc - 2.5, 0.85, dz], facing: '+z', depth: 0.08 });
    b.panel(0.9, 1.5, P.oakDark, { at: [xc - 2.0, 0, zc - D / 2], facing: '-z', depth: 0.08 });

    // the sunken hut: spoil bank, two gable posts, a ridge pole and a thatch tent to the ground
    const hx = 4.3;
    const hz = 3.4;
    const hw = 3.4; // across
    const hl = 3.8; // along z
    b.box(hw + 0.8, 0.3, hl + 0.6, tint(P.earth, -0.06), { at: [hx, 0, hz] });
    b.box(hw - 0.2, 0.31, hl - 0.2, P.soil, { at: [hx, 0, hz], jitter: false });
    for (const s of [1, -1]) b.cyl(0.13, 2.55, post, { at: [hx, 0, hz + s * (hl / 2 - 0.05)], segs: 6 });
    b.log(0.09, hl + 0.5, post, { at: [hx, 2.35, hz], axis: 'z', segs: 6 });
    pitched(b, hw, hl, 2.15, thatch, { at: [hx, 0.3, hz], ridge: 'z', overhang: 0.15, ends: 0.2, wall: tint(P.wattle, 0.04), thick: 0.32, noFill: true });
    // the back gable is closed with wattle, the front left open below the apex
    b.extrude([[-hw / 2, 0], [hw / 2, 0], [0, 2.15]], 0.1, tint(P.wattle, 0.04), { at: [hx, 0.3, hz - hl / 2 + 0.05] });
    b.extrude([[-hw / 2 + 0.1, 0], [hw / 2 - 0.1, 0], [0, 2.0]], 0.05, tint(P.soil, -0.1), { at: [hx, 0.3, hz - hl / 2 + 0.13] });
    b.extrude([[-0.9, 1.15], [0.9, 1.15], [0, 2.1]], 0.12, tint(P.wattle, 0.04), { at: [hx, 0.3, hz + hl / 2 + 0.03] });
    // the loom just inside: two uprights leaning back, the warp, a row of clay weights
    const lz = hz + hl / 2 - 0.35;
    b.group({ at: [hx, 0.3, lz], rot: [-0.18, 0, 0] }, () => {
      b.sym((s) => b.box(0.1, 1.85, 0.1, P.oak, { at: [s * 0.8, 0, 0] }));
      b.box(1.9, 0.12, 0.12, P.oak, { at: [0, 1.65, 0] });
      b.box(1.5, 1.2, 0.02, P.cream, { at: [0, 0.45, 0.02] });
      b.box(1.5, 0.12, 0.05, 0xb9553a, { at: [0, 0.9, 0.04] });
      for (let i = 0; i < 6; i++) b.cyl(0.08, 0.1, P.terracotta, { at: [-0.62 + i * 0.25, 0.3, 0.05], rot: [Math.PI / 2, 0, 0], segs: 6 });
    });

    // a fenced garden plot behind and a bread oven
    hurdle(b, -6.7, -8.7, 6.7, -8.7);
    hurdle(b, -6.7, -8.7, -6.7, 8.7);
    hurdle(b, 6.7, -8.7, 6.7, 8.7);
    hurdle(b, -6.7, 8.7, 0.0, 8.7);
    hurdle(b, 2.0, 8.7, 6.7, 8.7);
    hurdle(b, -6.4, -2.4, 2.6, -2.4, 0.9);
    vegBed(b, -3.8, -5.6, 4.6, 4.6, { rows: 7 });
    vegBed(b, 1.0, -5.8, 2.4, 4.2, { rows: 3, color: P.crop });
    b.dome(0.9, tint(P.mud, 0.18), { at: [4.6, 0, -2.6], squash: 0.85, segs: 10 });
    b.box(0.45, 0.4, 0.25, P.timberBlack, { at: [4.6, 0, -1.75] });
    woodpile(b, [4.4, 0, -4.4], 2.0);
    b.tree(b.range(4.6, 5.4), { at: [4.6, 0, -7.0], kind: 'round' });
    b.tree(b.range(1.2, 1.5), { at: [-6.0, 0, 7.6], kind: 'bush', color: P.hedge });
  },
};
