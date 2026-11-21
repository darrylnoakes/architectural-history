import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, BED, WATER, side, bar, cutwaterPier, type ZY } from './shared';
import { ROMAN_PIERS, ROMAN_PIER } from './02-roman-timber-bridge';

export const ruinedPiers: BuildingDef = {
  id: 'ruined-piers',
  name: 'Fallen bridge and rope ferry',
  style: 'Sub-Roman',
  date: 'c. 450',
  summary:
    'When Roman government ended in the early fifth century, nobody was left to pay for repairs. The timber deck rotted or was swept away in a flood, and the stone piers were left as broken stumps in the stream, robbed for their squared blocks. ' +
    'People went back to wading at low water and, the rest of the time, to a ferry: a flat-bottomed boat hauled across along a rope tied to posts on each bank. ' +
    'The skill of building in mortared stone would not return for centuries.',
  materials: ['ruined sandstone', 'oak', 'hemp rope'],
  lookFor: [
    { label: 'Broken pier', note: 'The stump of a Roman pier, its upper courses fallen or carried off for reuse elsewhere.', at: [2.4, 0.4, 2.9] },
    { label: 'Fallen ashlar', note: 'Squared blocks lying in the riverbed where the masonry collapsed.', at: [1.2, -0.7, -0.8] },
    { label: 'Rope ferry', note: 'A flat-bottomed boat pulled across hand over hand along a fixed rope, so the current cannot carry it downstream.', at: [-5.2, -0.3, -2.0] },
    { label: 'Ferry post', note: 'A stout post on each bank holds the ferry rope taut across the river.', at: [-6.0, 2.4, 9.6] },
  ],
  build(b) {
    b.noCollide();
    const stone = tint(b.pick([P.sandstone, P.limestoneWarm]), -0.04);
    const moss = mix(stone, P.turf, 0.35);

    // ruined abutments: lower courses only, grassed over on top, with a bush growing out
    b.sym((s) => {
      const pts: ZY[] = [
        [s * (BANK - 0.6), BED - 0.1],
        [s * (BANK - 0.6), -0.9 + b.range(-0.2, 0.1)],
        [s * (BANK - 0.2), -0.5],
        [s * BANK, -0.1],
        [s * (BANK + 1.5), -0.1],
        [s * (BANK + 1.5), BED - 0.1],
      ];
      side(b, pts, 5.0, stone);
      b.box(4.4, 0.18, 2.0, P.turf, { at: [b.range(-0.3, 0.3), -0.1, s * (BANK + 0.8)] });
      b.tree(1.4, { kind: 'bush', at: [s * 1.6, 0, s * (BANK + 0.9)] });
    });

    // the pier stumps: the cutwater footings survive just above the water, with a few ragged
    // courses of ashlar still standing on them
    ROMAN_PIERS.forEach((z, i) => {
      const { len, thick, nose } = ROMAN_PIER;
      cutwaterPier(b, { z, len: len + 0.3, thick: thick + 0.3, nose: nose + 0.15, y0: BED - 0.1, h: 0.5, color: tint(stone, -0.05) });
      const top = WATER + 0.3 + i * 0.15;
      cutwaterPier(b, { z, len, thick, nose, y0: BED + 0.4, h: top - BED - 0.4, color: tint(stone, -0.02) });
      const courses = i === 0 ? [7, 4, 2] : [8, 6, 3, 1];
      const bw = len / 6;
      courses.forEach((n, k) => {
        const first = i === 0 ? 0 : 1 + k * 0.5; // broken back from one end
        for (let j = 0; j < n && first + j < 7; j++) {
          if (k > 0 && b.chance(0.2)) continue;
          const x = -len / 2 + bw * (first + j) - bw * 0.5 + b.range(-0.04, 0.04);
          b.box(bw - 0.06, 0.42, thick - 0.1 - k * 0.12, k % 2 ? moss : stone, { at: [Math.min(x, len / 2 - bw / 2), top + k * 0.44, z + b.range(-0.06, 0.06)], rotY: b.range(-0.05, 0.05) });
        }
      });
      // a rotted timber post stump left on one pier
      if (i === 1) b.cyl(0.15, 0.7, P.oakSilver, { at: [len / 2 - 0.4, top + 0.44, z], segs: 6, rTop: 0.1 });
    });

    // fallen ashlar in the bed and the shallows
    const fallen: [number, number, number][] = [
      [1.2, -0.8, 0.4],
      [-0.6, 0.6, 1.2],
      [2.6, 1.0, -0.6],
      [-1.8, -4.8, 0.9],
      [0.4, 4.6, 0.2],
      [3.4, -2.2, 1.4],
    ];
    for (const [x, z, r] of fallen) {
      b.box(b.range(0.8, 1.1), b.range(0.5, 0.75), b.range(0.5, 0.7), stone, { at: [x, BED, z], rot: [b.range(-0.3, 0.3), r, b.range(-0.25, 0.25)] });
    }
    // a broken beam caught against a pier
    bar(b, [1.9, WATER + 0.05, -3.4], [4.6, WATER + 0.2, -4.4], 0.28, P.oakSilver);

    // rope ferry: posts on both banks, a sagging rope, and a flat-bottomed ferry boat
    const fx = -5.2;
    b.sym((s) => {
      b.cyl(0.18, 2.9, P.oakDark, { at: [fx - 0.8, 0, s * (BANK + 1.6)], segs: 6, rTop: 0.15 });
      bar(b, [fx - 0.8, 1.2, s * (BANK + 1.6)], [fx - 0.8, 0, s * (BANK + 2.8)], 0.14, P.oakDark); // stay
      // muddy landing worn into the bank
      side(b, [[s * (BANK + 1.0), 0.02], [s * BANK, -0.05], [s * (BANK - 2.6), BED], [s * BANK, BED]], 2.6, mix(P.mud, P.gravel, 0.3), fx);
    });
    const ropeY = (z: number) => 2.6 - 1.0 * (1 - (z / (BANK + 1.6)) ** 2);
    const rz = [-(BANK + 1.6), -6, -3, 0, 3, 6, BANK + 1.6];
    for (let i = 0; i < rz.length - 1; i++) bar(b, [fx - 0.8, ropeY(rz[i]), rz[i]], [fx - 0.8, ropeY(rz[i + 1]), rz[i + 1]], 0.05, P.reed);

    b.group({ at: [fx, WATER - 0.15, -2.0] }, () => {
      const hull = tint(P.oak, 0.02);
      // flat bottom with raked ends (a punt-like ferry flat)
      side(b, [[-2.1, 0.55], [-1.6, 0], [1.6, 0], [2.1, 0.55]], 1.9, hull);
      b.box(1.6, 0.08, 3.6, tint(P.oak, 0.1), { at: [0, 0.5, 0] });
      b.sym((s) => b.box(0.1, 0.4, 4.0, tint(hull, -0.08), { at: [s * 0.9, 0.5, 0] }));
      b.figure({ at: [-0.3, 0.58, 0.6], color: tint(P.wattle, -0.25) });
      // hauling line from the boat up to the ferry rope
      bar(b, [-0.8, 0.9, 0.0], [-0.8, ropeY(-2.0) - (WATER - 0.15), 0.0], 0.04, P.reed);
      b.box(0.5, 0.45, 0.5, P.wattle, { at: [0.3, 0.58, -1.0] }); // a bale of goods
    });
  },
};
