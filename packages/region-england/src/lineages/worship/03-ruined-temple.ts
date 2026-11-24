import { P, tint, type BuildingDef } from '@ah/kit';
import { AMB, CELLA, TZ, WALLSTONE, colPos, templeFabric } from './02-romano-celtic-temple';
import { graveMounds } from './shared';

export const ruinedTemple: BuildingDef = {
  id: 'ruined-temple',
  name: 'Ruined temple',
  style: 'Post-Roman ruin',
  date: 'c. 410 to 680',
  summary:
    'Christianity had been the official religion of the empire since 380, and when Roman government ended in Britain around 410 the money that kept temples going went too. ' +
    'The roofs were stripped for their tiles and timber and the walls quarried for building stone, but the podium, the cella walls to ragged heights, stretches of the precinct wall and a few columns still stand, with saplings rooting in the ambulatory. ' +
    'Yet the place was not forgotten: a few people were buried here, laid east to west, perhaps already as Christians.',
  materials: ['robbed flint and mortar', 'broken tile', 'grass'],
  lookFor: [
    { label: 'Robbed walls', note: 'The cella walls stand to ragged heights where builders took the good stone away.', at: [3.8, 5.0, TZ - 1] },
    { label: 'Fallen columns', note: 'Ambulatory columns lie where they toppled once the roof that tied them together had gone.', at: [9.0, 0.6, TZ - 3] },
    { label: 'Broken roof tile', note: 'Smashed tegulae litter the ground; whole ones were carried off for reuse.', at: [-6.5, 0.6, -5.5] },
    { label: 'East-west graves', note: 'Burials laid with the head to the west, the custom Christians followed.', at: [5.8, 0.6, -14.5] },
    { label: 'Stone stacked for reuse', note: 'Squared blocks set aside by stone robbers. Some will end up in the walls of the first church.', at: [-8.6, 1.3, -12] },
  ],
  build(b) {
    const stone = P.limestone;
    const moss = tint(P.grass, -0.08);
    // the temple's own podium, steps and walls, robbed down to ragged heights; the east wall with
    // the door mostly gone, the precinct wall broken into stretches with gaps
    templeFabric(b, true);
    b.box(AMB - 1, 0.04, AMB - 1, moss, { at: [0, 0.6, TZ], jitter: false });
    const c = CELLA / 2;
    // patches of exposed flint core where the plaster has fallen
    b.box(0.08, 2.0, 1.6, WALLSTONE, { at: [c + 0.02, 2.6, TZ + 1.4] });
    b.box(1.8, 1.8, 0.08, WALLSTONE, { at: [-1.0, 3.6, TZ + c + 0.02] });
    // rubble inside the cella and heaps against the walls
    for (const [x, z, r] of [[0.5, TZ + 0.5, 1.7], [-1.6, TZ - 1.4, 1.1], [c + 1.0, TZ - 2.2, 1.0], [-c - 1.2, TZ + 1.8, 1.2]] as [number, number, number][]) {
      b.blob(r, tint(P.rubble, -0.04), { at: [x, 0.6, z], stretch: [1.2, 0.45, 1.1], detail: 0 });
    }

    // ambulatory: some columns still stand on the surviving stretches of the low wall
    const half = AMB / 2;
    const up = (i: number) => colPos[i];
    for (const i of [0, 4, 6]) b.column(0.2, 2.6, stone, { at: [up(i), 1.5, TZ + half - 0.25], order: 'tuscan', segs: 7 });
    for (const i of [0, 2, 6]) b.column(0.2, 2.6, stone, { at: [half - 0.25, 1.5, TZ + up(i)], order: 'tuscan', segs: 7 });
    for (const i of [1, 4, 5]) b.column(0.2, 2.6, stone, { at: [-half + 0.25, 1.5, TZ + up(i)], order: 'tuscan', segs: 7 });
    b.column(0.2, 1.4, stone, { at: [up(1), 1.5, TZ + half - 0.25], order: 'plain', segs: 7 });
    // fallen drums
    b.log(0.2, 2.4, stone, { at: [half + 1.4, 0, TZ - 3.0], axis: 'z', rotY: 0.3 });
    b.log(0.2, 2.0, stone, { at: [half + 1.2, 0, TZ + 4.4], rotY: 0.5 });
    b.log(0.2, 2.2, stone, { at: [-half - 1.3, 0, TZ - 1.0], axis: 'z', rotY: -0.4 });
    b.log(0.2, 1.4, stone, { at: [1.5, 0, TZ + half + 1.4], rotY: 0.2 });
    // scattered roof tiles
    for (let i = 0; i < 26; i++) {
      const x = b.range(-half - 2, half + 2);
      const z = TZ + b.range(-half - 3, half + 2);
      if (Math.abs(x) < c + 0.3 && Math.abs(z - TZ) < c + 0.3) continue;
      b.box(0.42, 0.04, 0.55, P.romanTile, { at: [x, Math.abs(x) < half && Math.abs(z - TZ) < half ? 0.6 : 0, z], rotY: b.range(0, 3) });
    }
    // stone robbers' stack of squared blocks
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) b.box(0.6, 0.38, 0.9, stone, { at: [-8.6 + j * 0.65 + i * 0.32, i * 0.38, -12] });

    // early graves outside the east end, aligned east-west; two marked with a stone
    graveMounds(b, [[3.2, -13.5], [5.0, -13.6], [6.8, -14.0], [3.6, -17.0], [5.6, -17.2], [7.6, -16.8]], tint(P.grass, -0.1));
    b.box(0.5, 0.6, 0.15, stone, { at: [3.2, 0, -12.6] });
    b.box(0.45, 0.5, 0.15, stone, { at: [5.6, 0, -16.3] });

    // saplings, brambles and an ash tree growing in the ruin
    b.tree(6, { at: [-5.4, 0.6, TZ + 5.6], kind: 'round' });
    b.tree(3, { at: [5.8, 0.6, TZ - 5.4], kind: 'round' });
    b.tree(8, { at: [-9.5, 0, -6], kind: 'round' });
    for (const [x, z] of [[c + 1.5, TZ + 2.8], [-c - 2.0, TZ - 3.5], [2.0, TZ + c + 1.6], [9.5, 14], [-10.5, 18], [10.5, -18]]) {
      b.tree(1.5, { at: [x, 0.3, z], kind: 'bush' });
    }
    b.collider(CELLA + 0.4, CELLA + 0.4, { at: [0, 0, TZ] });
  },
};
