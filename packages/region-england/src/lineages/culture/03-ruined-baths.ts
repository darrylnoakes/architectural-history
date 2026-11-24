import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { BATHS, BATH_RUIN, WALL_T, bathFabric } from './02-roman-baths';
import { facet, ruinWall, type Pt } from './shared';

export const ruinedBaths: BuildingDef = {
  id: 'ruined-baths',
  name: 'Ruined baths',
  style: 'Sub-Roman ruin',
  date: 'c. 430',
  summary:
    'Some town baths had fallen out of use in the 4th century, even before Roman rule ended around 410. With no money, no imported goods and no one paid to stoke ' +
    'the furnace or mend the roof, the timber roofs rotted and fell, frost split the vaults, and people carted off the dressed stone and tile to reuse. ' +
    'What is left is the same building robbed down: the walls of the rooms and of the yard stand to ragged heights, half of the tepidarium vault still hangs, and a few columns of the colonnade are upright. ' +
    'Saplings rooted in the rubble. A later Anglo-Saxon poem, The Ruin, looks at walls like these and calls them the work of giants.',
  materials: ['limestone rubble', 'red tile', 'fallen roof tile', 'self-seeded trees'],
  lookFor: [
    { label: 'Broken vault', note: 'Half of the tepidarium vault still hangs between its walls; the rest lies in the rubble below.', at: [-2.25, 9.6, -9.6] },
    { label: 'Hypocaust pilae', note: 'With the floor fallen in, the little stacks of tile that held it over the hot air are exposed.', at: [6.25, 1.4, -7.6] },
    { label: 'Fallen columns', note: 'Drums and shafts from the portico lie where they toppled, and only stumps of others still stand.', at: [9.5, 1.0, 6] },
    { label: 'Robbed walls', note: 'The tops are ragged because good squared stone was taken for reuse, leaving the rubble core.', at: [-15.2, 3.0, 2] },
    { label: 'Trees through the floor', note: 'Ash and elder seed into the rubble within a few years of a roof failing.', at: [-10.5, 6.5, -7.6] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    b.noCollide();
    const stone = tint(P.limestone, b.range(-0.05, -0.02));
    const core = mix(stone, P.rubble, 0.5);
    const tile = P.romanTile;
    const R = BATH_RUIN;
    const { back, front } = BATHS;
    const D = front - back;
    const zc = (front + back) / 2;
    const t = WALL_T;
    const B = 0.4;
    const rubble = (x: number, z: number, r: number, y = 0) =>
      b.blob(r, b.chance(0.5) ? core : tint(stone, -0.08), { at: [x, y, z], stretch: [1.4, 0.5, 1.1], detail: 0 });

    // the baths' own walls, robbed down to the lifts that still stand, and the half vault
    bathFabric(b, stone, true);
    // weeds over the old floors
    b.box(BATHS.C[1] - BATHS.F[0] + 0.4, 0.04, D + 0.4, tint(P.grassDry, -0.03), { at: [(BATHS.C[1] + BATHS.F[0]) / 2, B, zc], jitter: false });

    // ragged tops where the robbers stopped: the rubble core above the last good course
    const [f0, f1] = BATHS.F;
    const [t0, t1] = BATHS.T;
    const [c0, c1] = BATHS.C;
    const ragX = (x0: number, x1: number, z: number, cut: number, lo: number, hi: number, col = core) =>
      ruinWall(b, x1 - x0, lo, hi, t, col, { at: [(x0 + x1) / 2, B + cut, z] });
    const ragZ = (x: number, z0: number, z1: number, cut: number, lo: number, hi: number, col = core) =>
      ruinWall(b, z1 - z0, lo, hi, t, col, { at: [x, B + cut, (z0 + z1) / 2], rotY: Math.PI / 2 });
    ragX(f0, f1, front - t / 2, R.fFront, 0.1, 1.3);
    ragX(f0, f1, back + t / 2, R.fBack, 0.1, 1.0);
    ragZ(f0 + t / 2, back, front, R.fEnd, 0.2, 1.2);
    ragZ(t0, zc, front, R.ftFront, 0.3, 2.6);
    ragX(t0, t1, front - t / 2, R.tFront, 0.1, 0.9);
    ragZ(t1, zc, front, R.tcFront, 0.4, 2.4);
    ragX(c0, c1, front - t / 2, R.cFront, 0.2, 1.6);
    ragX(c0, c1, back + t / 2, R.cBack, 0.3, 1.8);
    R.apse.forEach((cut, i) => {
      const [fx, fz, fa] = facet(i, 14, BATHS.apseR);
      if (cut < 4) ruinWall(b, 1.45, 0.1, 0.7, 0.7, core, { at: [c1 + fx, cut, zc + fz], rotY: fa });
    });

    // frigidarium: a tree through the floor
    b.tree(7.5, { at: [-10.5, B, -7.6] });
    b.tree(2.2, { at: [-13, B, -5], kind: 'bush', color: P.hedge });

    // tepidarium: broken stubs of the fallen front half of the vault, still clinging to the walls
    const tx = (t0 + t1) / 2;
    const tw = t1 - t0;
    const top = BATHS.T[2] + B;
    const band = (ro: number, ri: number, a0: number, a1: number, len: number, z: number, color: number) => {
      const pts: Pt[] = [];
      const n = Math.max(3, Math.round((a1 - a0) * 3));
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push([ro * Math.cos(a), ro * Math.sin(a) * 0.75]);
      }
      for (let i = n; i >= 0; i--) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push([ri * Math.cos(a), ri * Math.sin(a) * 0.75]);
      }
      b.extrude(pts, len, color, { at: [tx, top, z] });
    };
    const vo = (tw + 0.3) / 2;
    const vi = vo - t;
    band(vo, vi, 0, 1.1, 1.4, zc + 0.7, core);
    band(vo, vi, Math.PI - 0.7, Math.PI, 0.9, zc + 0.45, core);
    for (let i = 0; i < 5; i++) rubble(tx + b.range(-2.5, 2.5), front - b.range(1, 3.5), b.range(0.6, 1.1), B);
    b.box(1.6, 0.25, 0.9, tile, { at: [tx - 1, B, front - 2.5], rotY: 0.4, rot: [0.2, 0, 0] });

    // caldarium: no roof, the hypocaust pilae exposed where the floor has fallen in
    const cx = (c0 + c1) / 2;
    const cw = c1 - c0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (b.chance(0.15)) continue;
        b.box(0.45, b.range(0.6, 0.95), 0.45, tint(tile, -0.05), { at: [c0 + 1.3 + i * 1.4, B, back + 1.6 + j * 1.6] });
      }
    }
    b.box(cw - 1.4, 0.12, 1.8, tint(stone, 0.04), { at: [cx + 1.5, 1.3, back + 2.4] }); // a surviving patch of floor
    rubble(cx - 2, front - 1.5, 1.1, B);
    b.tree(3.2, { at: [c1 - 0.6, BATHS.C[2] - 1.2, back + 0.4], kind: 'bush', color: P.leaf });

    // furnace house: the blackened stoke-hole in its stump
    const pz = back - 1.1;
    b.box(1.3, 0.9, 0.62, P.black, { at: [cx, 0, pz - 0.8] });
    rubble(cx + 2, pz, 0.8);

    // ---------------------------------------------------------------- palaestra
    const Y = BATHS.yard;
    const yz = (Y.front + front) / 2;
    const yardD = Y.front - front;
    b.sym((s) => {
      const k = s > 0 ? 0 : 1;
      ruinWall(b, yardD, 0.1, s > 0 ? 1.0 : 0.6, 0.6, core, { at: [s * (Y.x - 0.3), R.yardSide[k], yz], rotY: Math.PI / 2 });
      ruinWall(b, Y.x - 2.2, 0.1, 0.9, 0.6, core, { at: [(s * (Y.x + 2.2)) / 2, R.yardFront[k], Y.front - 0.3] });
    });
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
    b.box(5.8, 0.06, 2.8, mix(P.water, P.leafDark, 0.5), { at: [-5, 0.46, 3.8] });
    for (const x of spread(5, -7.5, -2.5)) b.cone(0.25, b.range(0.8, 1.3), P.reed, { at: [x, 0.45, 3.8 + b.range(-1, 1)], segs: 4 });

    b.tree(8, { at: [6, 0, 9.5] });
    b.tree(5, { at: [-12, 0, 11.5], color: P.leafDark });
    for (const [x, z] of [[13.5, 2], [-13.5, -1], [3, 12.5], [12.5, -14]]) b.tree(b.range(1.2, 1.8), { at: [x, 0, z], kind: 'bush', color: P.hedge });
    for (let i = 0; i < 6; i++) rubble(b.range(-13, 13), b.range(-2, 12), b.range(0.3, 0.6));
  },
};
