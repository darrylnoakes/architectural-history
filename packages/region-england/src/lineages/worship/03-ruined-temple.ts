import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { AMB, CELLA, PLASTER, TZ, WALLSTONE, colPos, precinctWall } from './02-romano-celtic-temple';
import { graveMounds } from './shared';

/** A wall run broken into pieces of uneven height (ragged top of a robbed wall). */
function brokenWall(b: Builder, x0: number, z0: number, x1: number, z1: number, t: number, heights: number[], col: number, base = 0) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = heights.length;
  const ang = Math.atan2(x1 - x0, z1 - z0);
  heights.forEach((h, i) => {
    if (h <= 0.05) return;
    const f = (i + 0.5) / n;
    b.box(t, h, len / n + 0.02, col, { at: [x0 + (x1 - x0) * f, base, z0 + (z1 - z0) * f], rotY: ang });
  });
}

export const ruinedTemple: BuildingDef = {
  id: 'ruined-temple',
  name: 'Ruined temple',
  style: 'Post-Roman ruin',
  date: 'c. 410 to 650',
  summary:
    'When Roman government ended in Britain around 410 the money and the priests went too, and Christianity was already the official religion of the empire. ' +
    'The roof was stripped for its tiles and timber, the walls were quarried for building stone, and saplings took root in the ambulatory. ' +
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
    // podium, overgrown
    b.box(AMB + 0.8, 0.5, AMB + 0.8, tint(stone, -0.08), { at: [0, 0, TZ] });
    b.box(AMB - 1, 0.04, AMB - 1, moss, { at: [0, 0.5, TZ], jitter: false });
    // cella walls broken down to uneven heights; the east wall with the door mostly gone
    const c = CELLA / 2;
    const t = 0.7;
    brokenWall(b, -c, TZ + c - t / 2, c, TZ + c - t / 2, t, [7.5, 8.4, 6.2, 4.0], PLASTER, 0.5);
    brokenWall(b, c - t / 2, TZ - c, c - t / 2, TZ + c, t, [3.1, 5.0, 6.8, 7.8], PLASTER, 0.5);
    brokenWall(b, -c + t / 2, TZ - c, -c + t / 2, TZ + c, t, [1.4, 2.6, 4.6, 5.2], PLASTER, 0.5);
    brokenWall(b, -c, TZ - c + t / 2, c, TZ - c + t / 2, t, [2.3, 0.2, 0, 1.2], PLASTER, 0.5);
    // patches of exposed flint core where the plaster has fallen
    b.box(0.08, 2.0, 1.6, WALLSTONE, { at: [c + 0.02, 2.6, TZ + 1.4] });
    b.box(1.8, 1.8, 0.08, WALLSTONE, { at: [-1.0, 3.6, TZ + c + 0.02] });
    // rubble inside the cella and heaps against the walls
    for (const [x, z, r] of [[0.5, TZ + 0.5, 1.7], [-1.6, TZ - 1.4, 1.1], [c + 1.0, TZ - 2.2, 1.0], [-c - 1.2, TZ + 1.8, 1.2]] as [number, number, number][]) {
      b.blob(r, tint(P.rubble, -0.04), { at: [x, 0.5, z], stretch: [1.2, 0.45, 1.1], detail: 0 });
    }

    // ambulatory: the low wall survives in stretches; some columns stand, others lie fallen
    const half = AMB / 2;
    brokenWall(b, -half, TZ + half - 0.25, half, TZ + half - 0.25, 0.5, [0.9, 0.6, 0, 0.9, 0.4], PLASTER, 0.5);
    brokenWall(b, half - 0.25, TZ - half, half - 0.25, TZ + half, 0.5, [0.7, 0.9, 0.3, 0, 0.8], PLASTER, 0.5);
    brokenWall(b, -half + 0.25, TZ - half, -half + 0.25, TZ + half, 0.5, [0.9, 0.2, 0.8, 0.9, 0], PLASTER, 0.5);
    brokenWall(b, -half, TZ - half + 0.25, -2.0, TZ - half + 0.25, 0.5, [0.5, 0.9], PLASTER, 0.5);
    brokenWall(b, 2.0, TZ - half + 0.25, half, TZ - half + 0.25, 0.5, [0.9, 0.3], PLASTER, 0.5);
    const standing = [true, false, true, true, false, false, true];
    colPos.forEach((p, i) => {
      if (standing[i]) b.column(0.2, 2.6, stone, { at: [half - 0.25, 1.4, TZ + p], order: 'tuscan' });
      if (standing[(i + 3) % 7]) b.column(0.2, i % 2 ? 1.4 : 2.6, stone, { at: [p, 1.4, TZ + half - 0.25], order: i % 2 ? 'plain' : 'tuscan' });
      if (standing[(i + 5) % 7] && i !== 3) b.column(0.2, 2.6, stone, { at: [-half + 0.25, 1.4, TZ + p], order: 'tuscan' });
    });
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
      b.box(0.42, 0.04, 0.55, P.romanTile, { at: [x, Math.abs(x) < half && Math.abs(z - TZ) < half ? 0.5 : 0, z], rotY: b.range(0, 3) });
    }
    // stone robbers' stack of squared blocks
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) b.box(0.6, 0.38, 0.9, stone, { at: [-8.6 + j * 0.65 + i * 0.32, i * 0.38, -12] });

    // precinct wall broken down, with gaps
    const hs = [1.6, 0.8, 0, 1.9, 1.2, 0.4, 2.1, 0, 0.9, 1.5, 0.6, 2.0, 0, 1.1, 1.7, 0.5, 0, 1.3, 2.2, 0.8, 1.0, 0];
    precinctWall(b, (i) => hs[i % hs.length]);

    // early graves outside the east end, aligned east-west; two marked with a stone
    graveMounds(b, [[3.2, -13.5], [5.0, -13.6], [6.8, -14.0], [3.6, -17.0], [5.6, -17.2], [7.6, -16.8]], tint(P.grass, -0.1));
    b.box(0.5, 0.6, 0.15, stone, { at: [3.2, 0, -12.6] });
    b.box(0.45, 0.5, 0.15, stone, { at: [5.6, 0, -16.3] });

    // saplings, brambles and an ash tree growing in the ruin
    b.tree(6, { at: [-5.4, 0.5, TZ + 5.6], kind: 'round' });
    b.tree(3, { at: [5.8, 0.5, TZ - 5.4], kind: 'round' });
    b.tree(8, { at: [-9.5, 0, -6], kind: 'round' });
    for (const [x, z] of [[c + 1.5, TZ + 2.8], [-c - 2.0, TZ - 3.5], [2.0, TZ + c + 1.6], [9.5, 14], [-10.5, 18], [10.5, -18]]) {
      b.tree(1.5, { at: [x, 0.3, z], kind: 'bush' });
    }
    b.collider(CELLA + 0.4, CELLA + 0.4, { at: [0, 0, TZ] });
  },
};
