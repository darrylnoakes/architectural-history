import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { BATHS } from './02-roman-baths';
import { facet, roundArch, ruinWall } from './shared';

export const ruinedBaths: BuildingDef = {
  id: 'ruined-baths',
  name: 'Ruined baths',
  style: 'Sub-Roman ruin',
  date: 'c. 430',
  summary:
    'Many town baths had fallen out of use even before Roman rule ended around 410. With no money, no imported goods and no one paid to stoke ' +
    'the furnace or mend the roof, the timber roofs rotted and fell, frost split the vaults, and people carted off the dressed stone and tile to reuse. ' +
    'Saplings rooted in the rubble. A later Anglo-Saxon poem, The Ruin, looks at walls like these and calls them the work of giants.',
  materials: ['limestone rubble', 'red tile', 'fallen roof tile', 'self-seeded trees'],
  lookFor: [
    { label: 'Broken vault', note: 'Half of the tepidarium vault still hangs between its walls; the rest lies in the rubble below.', at: [-2.25, 9.6, -9.6] },
    { label: 'Hypocaust pilae', note: 'With the floor fallen in, the little stacks of tile that held it over the hot air are exposed.', at: [6.25, 1.4, -7.6] },
    { label: 'Fallen columns', note: 'Drums and shafts from the portico lie where they toppled, capitals still attached.', at: [9.5, 1.0, 6] },
    { label: 'Robbed walls', note: 'The tops are ragged because good squared stone was taken for reuse, leaving the rubble core.', at: [-15.2, 3.0, 2] },
    { label: 'Trees through the floor', note: 'Ash and elder seed into the rubble within a few years of a roof failing.', at: [-10.5, 6.5, -7.6] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    b.noCollide();
    const stone = tint(P.limestone, b.range(-0.05, -0.02));
    const core = mix(stone, P.rubble, 0.5);
    const tile = P.romanTile;
    const { back, front } = BATHS;
    const D = front - back;
    const zc = (front + back) / 2;
    const t = 0.8;
    const rubble = (x: number, z: number, r: number) =>
      b.blob(r, b.chance(0.5) ? core : tint(stone, -0.08), { at: [x, 0, z], stretch: [1.4, 0.5, 1.1], detail: 0 });

    // weedy ground over the old floors
    b.box(BATHS.C[1] - BATHS.F[0] + 1, 0.3, D + 1, tint(P.grassDry, -0.03), { at: [(BATHS.C[1] + BATHS.F[0]) / 2, 0, zc] });

    // ---------------------------------------------------------------- frigidarium: knee-high walls
    const [f0, f1] = BATHS.F;
    ruinWall(b, f1 - f0, 0.6, 2.6, t, stone, { at: [(f0 + f1) / 2, 0, front - t / 2] });
    ruinWall(b, f1 - f0, 1.2, 3.4, t, stone, { at: [(f0 + f1) / 2, 0, back + t / 2] });
    ruinWall(b, D, 1.0, 3.6, t, core, { at: [f0 + t / 2, 0, zc], rotY: Math.PI / 2 });
    b.tree(7.5, { at: [-10.5, 0.3, -7.6] });
    b.tree(2.2, { at: [-13, 0.3, -5], kind: 'bush', color: P.hedge });

    // ---------------------------------------------------------------- tepidarium: the half vault
    const [t0, t1, th] = BATHS.T;
    const tx = (t0 + t1) / 2;
    const tw = t1 - t0;
    const top = th + 0.4;
    // back half survives to the springing: back wall and the two cross walls
    b.box(tw + t, top, t, stone, { at: [tx, 0, back + t / 2] });
    for (const x of [t0, t1]) {
      b.box(t, top, D / 2, stone, { at: [x, 0, back + D / 4] });
      ruinWall(b, D / 2, 1.5, top - 0.6, t, core, { at: [x, 0, back + (D * 3) / 4], rotY: Math.PI / 2, endHigh: top - 0.4 });
    }
    for (let y = 1.1; y < top - 0.4; y += 1.25) {
      b.box(tw + t + 0.06, 0.22, t + 0.06, tile, { at: [tx, y, back + t / 2], jitter: false });
    }
    b.vault(tw + t, D / 2 - 0.4, tile, { at: [tx, top, back + D / 4 - 0.2], squash: 0.75, segs: 10 });
    b.vault(tw - t, D / 2 - 0.3, core, { at: [tx, top - 0.01, back + D / 4 - 0.2], squash: 0.75, segs: 10 });
    ruinWall(b, tw - 0.6, 0.4, 1.4, t, stone, { at: [tx, 0, front - t / 2] });
    for (let i = 0; i < 5; i++) rubble(tx + b.range(-2.5, 2.5), front - b.range(1, 3.5), b.range(0.6, 1.1));
    b.box(1.6, 0.25, 0.9, tile, { at: [tx - 1, 0.4, front - 2.5], rotY: 0.4, rot: [0.2, 0, 0] });

    // ---------------------------------------------------------------- caldarium: tall walls, no roof, pilae exposed
    const [c0, c1, chH] = BATHS.C;
    const cx = (c0 + c1) / 2;
    const cw = c1 - c0;
    const win = (xc: number) => roundArch(xc, 3.0, 0.9, 1.6, 6);
    ruinWall(b, cw + t, 4.5, chH + 0.2, t, stone, { at: [cx, 0, back + t / 2], holes: spread(2, -cw / 2, cw / 2).map(win) });
    ruinWall(b, cw + t, 2.0, chH - 1.6, t, stone, { at: [cx, 0, front - t / 2] });
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (b.chance(0.15)) continue;
        b.box(0.45, b.range(0.6, 0.95), 0.45, tint(tile, -0.05), { at: [c0 + 1.3 + i * 1.4, 0.3, back + 1.6 + j * 1.6] });
      }
    }
    b.box(cw - 1.4, 0.12, 1.8, tint(stone, 0.04), { at: [cx + 1.5, 1.2, back + 2.4] }); // a surviving patch of floor
    rubble(cx - 2, front - 1.5, 1.1);
    b.tree(3.2, { at: [c1 - 0.6, chH - 1.2, back + 0.4], kind: 'bush', color: P.leaf });

    // apse: a ragged half ring of wall
    for (let i = 0; i < 7; i++) {
      const [fx, fz, fa] = facet(i, 14, BATHS.apseR);
      const h = i === 3 ? 4.8 : b.range(0.8, 4.2);
      b.box(1.45, h, 0.7, stone, { at: [c1 + fx, 0, zc + fz], rotY: fa });
    }
    // furnace house: stumps and the blackened stoke-hole
    const pz = back - 1.1;
    ruinWall(b, 6, 0.5, 1.8, 0.6, stone, { at: [cx, 0, pz - 0.8] });
    b.box(1.3, 0.9, 0.62, P.black, { at: [cx, 0, pz - 0.8] });
    rubble(cx + 2, pz, 0.8);

    // ---------------------------------------------------------------- palaestra
    const Y = BATHS.yard;
    const yz = (Y.front + front) / 2;
    const yardD = Y.front - front;
    b.box(Y.x * 2 - 1.2, 0.06, yardD - 0.6, tint(P.grass, 0.03), { at: [0, 0, yz - 0.3] });
    b.sym((s) => {
      ruinWall(b, yardD, 0.4, s > 0 ? 3.6 : 2.4, 0.6, stone, { at: [s * (Y.x - 0.3), 0, yz], rotY: Math.PI / 2 });
      ruinWall(b, Y.x - 2.2, 0.3, 2.2, 0.6, stone, { at: [(s * (Y.x + 2.2)) / 2, 0, Y.front - 0.3] });
    });
    b.box(1.0, 5.2, 0.9, tint(stone, 0.05), { at: [-2.4, 0, Y.front - 0.3] });
    b.box(1.0, 1.4, 0.9, tint(stone, 0.05), { at: [2.4, 0, Y.front - 0.3] });

    // the colonnade: a few still standing, some broken, some fallen
    const colH = 3.2;
    const sx = Y.x - 0.6 - Y.depth;
    const sz = Y.front - 0.6 - Y.depth;
    const spots: [number, number][] = [];
    b.sym((s) => spread(5, front, sz).forEach((z) => spots.push([s * sx, z])));
    spread(9, -sx, sx).forEach((x) => spots.push([x, sz]));
    const col = tint(stone, 0.05);
    for (const [x, z] of spots) {
      const r = b.rand();
      if (r < 0.3) b.column(0.24, colH, col, { at: [x, 0, z], order: 'tuscan', segs: 7 });
      else if (r < 0.7) b.cyl(0.29, b.range(0.3, 1.4), col, { at: [x, 0, z], segs: 7 });
      else {
        b.cyl(0.31, 0.2, col, { at: [x, 0, z], segs: 7 });
        const a = b.range(0, Math.PI * 2);
        b.log(0.24, colH * 0.8, col, { at: [x + Math.cos(a) * 1.4, 0, z - Math.sin(a) * 1.4], rotY: a, segs: 7 });
      }
    }
    b.log(0.24, 2.4, col, { at: [9.5, 0, 6], rotY: 0.3, segs: 7 });
    b.box(0.7, 0.35, 0.7, col, { at: [10.8, 0, 6.5], rotY: 0.5 });
    b.log(0.24, 1.6, col, { at: [-8, 0, 9], rotY: 1.2, segs: 7 });

    // the plunge pool, silted and reedy
    b.box(6.4, 0.45, 3.4, tint(stone, 0.02), { at: [-5, 0, 3.8] });
    b.box(5.8, 0.06, 2.8, mix(P.water, P.leafDark, 0.5), { at: [-5, 0.4, 3.8] });
    for (const x of spread(5, -7.5, -2.5)) b.cone(0.25, b.range(0.8, 1.3), P.reed, { at: [x, 0.4, 3.8 + b.range(-1, 1)], segs: 4 });

    b.tree(8, { at: [6, 0, 9.5] });
    b.tree(5, { at: [-12, 0, 11.5], color: P.leafDark });
    for (const [x, z] of [[13.5, 2], [-13.5, -1], [3, 12.5], [12.5, -14]]) b.tree(b.range(1.2, 1.8), { at: [x, 0, z], kind: 'bush', color: P.hedge });
    for (let i = 0; i < 6; i++) rubble(b.range(-13, 13), b.range(-2, 12), b.range(0.3, 0.6));
  },
};
