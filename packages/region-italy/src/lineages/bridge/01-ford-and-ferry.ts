import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, BED, WATER, side, bar } from './shared';

export const fordAndFerry: BuildingDef = {
  id: 'ford-and-ferry',
  name: 'Ford and rope ferry',
  style: 'Iron Age (Villanovan)',
  date: 'c. 750 BC',
  summary:
    'The track from the hill-top huts comes down to the river where it runs wide and shallow over a gravel bar, and in summer people and cattle simply wade across. ' +
    'The ford is why the settlement is here: it is where the salt and cattle routes cross the river, and the cattle market is held beside it. ' +
    'When the river is up, a raft of lashed logs is hauled across on a rope stretched between two posts, so goods and animals can still cross. ' +
    'Nothing here is permanent; every flood moves the gravel and every spring the rope and posts are renewed.',
  materials: ['river gravel', 'boulders', 'oak and poplar logs', 'plant-fibre rope'],
  modelledOn: 'The Tiber ford below the Palatine, where Rome grew up beside the cattle market (Forum Boarium)',
  lookFor: [
    { label: 'Ford', note: 'A gravel bar where the water is shallow enough to wade; the banks are worn into gentle ramps by feet and hooves.', at: [-2.0, -0.9, -6.0] },
    { label: 'Rope ferry', note: 'The raft is pulled along a rope fixed to both banks, so the current cannot carry it away.', at: [4.4, 0.8, 4.0] },
    { label: 'Log raft', note: 'Logs lashed side by side under cross-pieces: no nails, just rope and pegs.', at: [3.4, -1.0, -2.6] },
    { label: 'Ferry post', note: 'A stout post driven into each bank anchors the rope and marks the landing.', at: [4.4, 2.0, 13.0] },
  ],
  build(b) {
    b.noCollide();
    const gravel = mix(P.gravel, P.sand, 0.25);
    const fx = -2.0; // the ford runs a little upstream of the road line

    // gravel ramps worn down into both banks, and a gravel bar across the bed
    b.sym((s) => {
      const ramp: [number, number][] = [
        [s * (BANK + 2.6), 0.02],
        [s * BANK, -0.25],
        [s * (BANK - 3.2), BED + 0.95],
        [s * (BANK - 3.2), BED - 0.05],
        [s * BANK, BED - 0.05],
        [s * BANK, -0.6],
        [s * (BANK + 2.6), -0.6],
      ];
      side(b, s > 0 ? ramp : ramp.reverse(), 5.0, mix(gravel, P.mud, 0.3), fx);
      // trodden earth track up from the ford
      b.box(3.6, 0.04, 4.6, mix(P.earth, P.mud, 0.35), { at: [fx * 0.5, 0, s * (BANK + 2.8)], jitter: false });
      // reeds along the bank either side of the crossing
      for (const x of [-7.2, -5.6, 1.4, 6.6]) {
        for (let k = 0; k < 5; k++) {
          b.cone(0.05, b.range(0.9, 1.5), P.reed, { at: [x + b.range(-0.5, 0.5), 0, s * (BANK + b.range(0.2, 0.9))], segs: 3 });
        }
      }
    });
    // the shallow bar itself, just under the water
    side(b, [[-BANK + 3.2, BED - 0.05], [BANK - 3.2, BED - 0.05], [BANK - 3.2, BED + 0.95], [3.5, WATER + 0.06], [-3.5, WATER + 0.06], [-BANK + 3.2, BED + 0.95]], 5.0, gravel, fx);
    // the crest of the bar breaks the surface at low water: a pale shoal of pebbles
    side(b, [[-3.6, WATER - 0.1], [3.6, WATER - 0.1], [2.6, WATER + 0.1], [-2.6, WATER + 0.1]], 3.6, tint(gravel, 0.06), fx + 0.3);
    // boulders and a few marker stakes along the line of the ford
    const stones = [P.peperino, P.tufa, P.rubble, tint(P.peperino, 0.06)];
    for (let z = -8.4; z <= 8.5; z += 1.4) {
      b.blob(b.range(0.38, 0.5), b.pick(stones), { at: [fx + 2.6 + b.range(-0.2, 0.2), WATER, z + b.range(-0.2, 0.2)], stretch: [1.2, 0.6, 1], detail: 0 });
    }
    // a herdsman wading across with a cow
    b.figure({ at: [fx - 0.6, WATER - 0.7, -5.4], color: P.wattle });
    b.group({ at: [fx + 0.4, WATER - 0.6, -4.2], rotY: 0.1 }, () => {
      b.box(0.7, 0.8, 1.9, P.cream, { at: [0, 0.4, 0] });
      b.box(0.45, 0.5, 0.6, P.cream, { at: [0, 0.9, 1.15], rot: [0.3, 0, 0] });
      b.sym((k) => b.cone(0.05, 0.3, P.cream, { at: [k * 0.25, 1.35, 1.2], segs: 4 }));
    });
    for (const z of [-9, -4.5, 0, 4.5, 9]) b.cyl(0.06, 1.7, P.oakDark, { at: [fx - 2.4, BED + 0.6, z], segs: 5, rTop: 0.04 });

    // ferry posts and the rope between them
    const px = 4.4;
    const ropeY = 1.6;
    b.sym((s) => {
      b.cyl(0.16, 2.6, P.oak, { at: [px, -0.4, s * (BANK + 1.0)], segs: 6, rTop: 0.13 });
      b.cyl(0.2, 0.2, P.oakDark, { at: [px, ropeY - 0.1, s * (BANK + 1.0)], segs: 6 });
      // a bracing stake behind each post
      bar(b, [px, ropeY + 0.2, s * (BANK + 1.0)], [px, -0.1, s * (BANK + 2.6)], 0.09, P.oakDark);
      // landing stage of logs at the water's edge
      for (let i = 0; i < 4; i++) b.log(0.13, 3.2, tint(P.oak, 0.05), { at: [px, -0.32, s * (BANK + 0.2 + i * 0.27)], segs: 6 });
    });
    // the rope sags a little toward the middle
    const ropePts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const z = -(BANK + 1.0) + (2 * (BANK + 1.0) * i) / 8;
      ropePts.push([z, ropeY - 0.9 * (1 - (z / (BANK + 1.0)) ** 2)]);
    }
    for (let i = 0; i < ropePts.length - 1; i++) {
      bar(b, [px, ropePts[i][1], ropePts[i][0]], [px, ropePts[i + 1][1], ropePts[i + 1][0]], 0.04, P.reed);
    }

    // the raft, part way across, with a short guide line up to the rope
    const rz = -2.6;
    const rope = (z: number) => ropeY - 0.9 * (1 - (z / (BANK + 1.0)) ** 2);
    b.group({ at: [px - 1.0, WATER - 0.12, rz] }, () => {
      for (let i = 0; i < 7; i++) b.log(0.17, 5.0, tint(P.oak, b.range(-0.04, 0.06)), { at: [0, 0, -1.2 + i * 0.4], segs: 7 });
      for (const x of [-1.9, 0, 1.9]) b.box(0.18, 0.14, 2.9, P.oakDark, { at: [x, 0.32, 0.0] });
      // a pair of cattle-hurdle rails along the sides
      b.sym((t) => {
        for (const x of [-2.1, -0.7, 0.7, 2.1]) b.cyl(0.05, 0.9, P.oakDark, { at: [x, 0.34, t * 1.25], segs: 5 });
        bar(b, [-2.1, 1.15, t * 1.25], [2.1, 1.15, t * 1.25], 0.06, P.wattle);
      });
      // a sack and a jar going across
      b.blob(0.32, P.daub, { at: [-1.0, 0.65, 0.3], stretch: [1, 0.8, 1], detail: 0 });
      b.lathe([[0.01, 0], [0.18, 0.04], [0.26, 0.3], [0.12, 0.62], [0.1, 0.7]], P.terracotta, { at: [-0.4, 0.46, -0.5], segs: 8 });
    });
    // guide lines from the raft up to the rope
    for (const dz of [-1.2, 1.2]) bar(b, [px, WATER + 0.25, rz + dz], [px, rope(rz + dz) - 0.02, rz + dz], 0.035, P.reed);

    // an umbrella pine and a few olives on the far bank, poplars on the near
    b.tree(7.5, { kind: 'pine', at: [-4.6, 0, -16.0] });
    b.tree(4.0, { kind: 'olive', at: [5.8, 0, -17.2] });
    b.tree(8.0, { kind: 'poplar', at: [-6.0, 0, 15.6] });
  },
};
