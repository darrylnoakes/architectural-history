import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { BANK, WATER, lin, water } from './shared';

/** A Villanovan double-cone urn: two cones meeting at a sharp shoulder, with a flared neck. */
function doubleCone(b: Builder, at: Vec3, h: number, color: number) {
  b.lathe(
    [
      [h * 0.14, 0],
      [h * 0.42, h * 0.48],
      [h * 0.22, h * 0.82],
      [h * 0.2, h * 0.9],
      [h * 0.26, h],
    ],
    color,
    { at, segs: 9 },
  );
}

/** A simple round-bellied jar. */
function pot(b: Builder, at: Vec3, h: number, color: number) {
  b.lathe(
    [
      [h * 0.18, 0],
      [h * 0.38, h * 0.35],
      [h * 0.32, h * 0.8],
      [h * 0.26, h * 0.9],
      [h * 0.3, h],
    ],
    color,
    { at, segs: 8 },
  );
}

export const pottersYard: BuildingDef = {
  id: 'potters-yard',
  name: 'Potter’s and bronzesmith’s yard',
  style: 'Iron Age (Villanovan)',
  date: 'c. 750 BC',
  summary:
    'In the first villages on the hill, making things happened in the open air, in a fenced yard close to the river where the clay was dug. ' +
    'Potters shaped dark burnished impasto by hand, building up coils of clay on a slow turntable, dried the pots under a thatched shelter and fired them in a small updraught kiln, probably a recent improvement on firing in an open bonfire. ' +
    'Beside them a bronzesmith melted metal in a clay crucible over a charcoal hearth blown by bellows, and cast brooches, razors and axes in stone moulds. ' +
    'Nothing here is meant to last: the shelter is posts and thatch, the kiln is clay that is patched after every firing.',
  materials: ['oak posts', 'reed thatch', 'wattle', 'clay', 'river stones'],
  lookFor: [
    { label: 'Updraught kiln', note: 'Fire is lit in the stoke-hole below; the heat rises through a pierced clay floor to the pots stacked above.', at: [6.0, 2.0, -1.5] },
    { label: 'Clay pit', note: 'River clay was dug here, then soaked and trodden in the shallow tank beside it to clean it of stones.', at: [10.5, 0.8, -7.5] },
    { label: 'Bronze-casting hearth', note: 'A charcoal fire in a clay ring, blown hot by leather bag bellows through a clay nozzle, melts bronze in a crucible.', at: [-1.5, 1.0, 6.4] },
    { label: 'Double-cone urns', note: 'Jars shaped like two cones meeting at a sharp shoulder, capped with a bowl, are the hallmark of the Villanovan culture; many were made to hold the ashes of the dead.', at: [-9.0, 2.0, 0.2] },
    { label: 'Thatched work shelter', note: 'An open-sided shed on posts where pots were shaped and left to dry out of the sun and rain.', at: [-8, 4.6, 2.5] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, P.reed]);
    const post = P.oak;
    const clay = b.pick([P.mudbrick, P.daub]);
    const impasto = b.pick([0x3b302a, 0x4a3a2e, 0x55432f]);

    // ---- trodden yard
    b.box(30, 0.05, 18, tint(P.earth, 0.05), { at: [0, 0, 0], jitter: false });

    // ---- the work shelter: posts, a steep hipped thatch, a wattle back wall
    const sx = -8;
    const sz = 2.5;
    const SW = 8.5;
    const SD = 5.4;
    const eave = 2.2;
    for (const x of lin(4, sx - SW / 2 + 0.2, sx + SW / 2 - 0.2)) {
      for (const z of [sz - SD / 2 + 0.2, sz + SD / 2 - 0.2]) b.cyl(0.13, eave, post, { at: [x, 0, z], segs: 6 });
    }
    b.box(SW, 0.18, 0.2, post, { at: [sx, eave - 0.18, sz + SD / 2 - 0.2] });
    b.box(SW, 0.18, 0.2, post, { at: [sx, eave - 0.18, sz - SD / 2 + 0.2] });
    b.hip(SW + 1.2, SD + 1.2, 3.0, thatch, { at: [sx, eave - 0.2, sz] });
    // crossed ridge logs, as on the hut-shaped urns
    b.sym((s) => {
      b.beam([sx + s * 1.9, eave + 2.5, sz - 0.6], [sx + s * 1.3, eave + 3.4, sz + 0.6], 0.12, 0.12, P.oakDark);
      b.beam([sx + s * 1.9, eave + 2.5, sz + 0.6], [sx + s * 1.3, eave + 3.4, sz - 0.6], 0.12, 0.12, P.oakDark);
    });
    b.box(SW - 0.4, 1.6, 0.14, P.wattle, { at: [sx, 0, sz - SD / 2 + 0.2] }); // wattle screen at the back
    b.box(0.14, 1.6, SD - 0.6, P.wattle, { at: [sx - SW / 2 + 0.2, 0, sz] });
    // inside: a bench of planks, a turntable, pots drying on a rack
    b.box(3.2, 0.7, 0.8, P.oak, { at: [sx + 1.5, 0, sz - 1.4] });
    b.cyl(0.1, 0.5, P.oakDark, { at: [sx - 1.6, 0, sz + 0.3], segs: 6 });
    b.cyl(0.45, 0.1, P.oak, { at: [sx - 1.6, 0.5, sz + 0.3], segs: 10 });
    pot(b, [sx - 1.6, 0.6, sz + 0.3], 0.4, tint(clay, -0.05));
    // drying rack: two shelves of planks on posts with pots in rows
    const rx = sx - 1.0;
    const rz = sz - 2.0;
    for (const x of [rx - 1.6, rx + 1.6]) b.box(0.1, 1.5, 0.1, post, { at: [x, 0, rz] });
    for (const y of [0.55, 1.15]) b.box(3.4, 0.06, 0.55, P.oak, { at: [rx, y, rz] });
    for (const x of lin(5, rx - 1.3, rx + 1.3)) pot(b, [x, 0.61, rz], b.range(0.3, 0.4), clay);
    for (const x of lin(4, rx - 1.2, rx + 1.2)) doubleCone(b, [x, 1.21, rz], 0.45, impasto);
    // finished urns set out on the ground by the shelter
    for (let i = 0; i < 4; i++) doubleCone(b, [sx - 2.8 + i * 0.6, 0.05, sz + SD / 2 + 0.6], 0.55, impasto);
    for (let i = 0; i < 3; i++) b.dome(0.2, impasto, { at: [sx - 2.8 + i * 0.6, 0.6, sz + SD / 2 + 0.6], squash: 0.5, segs: 8 });

    // ---- the updraught kiln: a round clay chamber over a firebox, with a stoking pit in front
    const kx = 6;
    const kz = -1.5;
    b.lathe(
      [
        [1.35, 0],
        [1.35, 0.9],
        [1.25, 1.45],
        [1.05, 1.7],
      ],
      clay,
      { at: [kx, 0, kz], segs: 14 },
    );
    b.dome(1.05, tint(clay, -0.1), { at: [kx, 1.7, kz], squash: 0.45, segs: 12 }); // temporary clay-and-sherd cover
    b.cyl(0.25, 0.25, tint(clay, -0.2), { at: [kx, 2.12, kz], segs: 8 }); // vent
    b.panel(0.7, 0.6, P.timberBlack, { at: [kx, 0.05, kz + 1.33], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(0.5, 0.4, 0xd2662f, { at: [kx, 0.1, kz + 1.36], facing: '+z', shape: 'round', depth: 0.04 });
    b.box(1.5, 0.06, 1.6, P.soil, { at: [kx, 0.01, kz + 2.1], jitter: false }); // ash-filled stoking pit
    // firewood stack
    for (let i = 0; i < 5; i++) b.log(0.09, 1.8, P.bark, { at: [kx + 2.6, 0.05 + (i % 2) * 0.17, kz + 0.2 + i * 0.2], segs: 5 });
    for (let i = 0; i < 4; i++) b.log(0.09, 1.8, P.bark, { at: [kx + 2.6, 0.35, kz + 0.3 + i * 0.22], segs: 5 });

    // ---- the clay pit near the bank, a soaking tank and a heap of worked clay
    const px = 10.5;
    const pz = -7.5;
    b.box(4.4, 0.08, 3.2, tint(P.mud, -0.08), { at: [px, 0.01, pz], jitter: false });
    b.box(4.8, 0.35, 0.4, P.earth, { at: [px, 0, pz + 1.8] });
    b.box(0.4, 0.35, 3.2, P.earth, { at: [px + 2.4, 0, pz] });
    b.blob(0.9, tint(P.mud, 0.1), { at: [px - 3.2, 0.25, pz + 0.5], stretch: [1.2, 0.5, 1] });
    // soaking (levigation) tank lined with clay
    b.box(2.0, 0.3, 1.4, tint(clay, -0.12), { at: [px - 3.6, 0, pz - 2.0] });
    water(b, 1.7, 1.1, [px - 3.6, 0.27, pz - 2.0], 0x8a8a6c);
    // wooden spade and baskets
    b.beam([px + 1.2, 0.0, pz - 1.0], [px + 1.6, 1.4, pz - 0.8], 0.06, 0.06, P.oak);
    b.cyl(0.3, 0.35, P.wattle, { at: [px + 0.4, 0.05, pz + 2.6], rTop: 0.36, segs: 8 });

    // ---- the bronze-casting hearth: clay ring, crucible, bag bellows, stone moulds
    const hx = -1.5;
    const hz = 6.4;
    b.lathe(
      [
        [0.7, 0],
        [0.7, 0.35],
        [0.55, 0.45],
        [0.45, 0.4],
      ],
      tint(clay, -0.1),
      { at: [hx, 0, hz], segs: 12 },
    );
    b.cyl(0.42, 0.06, 0x2a2420, { at: [hx, 0.35, hz], segs: 10 }); // charcoal bed
    b.cyl(0.42, 0.04, 0xd8642c, { at: [hx, 0.4, hz], segs: 10 });
    b.cyl(0.14, 0.22, P.mudbrick, { at: [hx, 0.42, hz], rTop: 0.16, segs: 8 }); // crucible
    // tuyère and two bag bellows
    b.beam([hx - 0.6, 0.3, hz], [hx - 1.4, 0.3, hz], 0.1, 0.1, tint(clay, -0.2));
    for (const dz of [-0.35, 0.35]) {
      b.blob(0.32, 0x8c6a4a, { at: [hx - 1.75, 0.22, hz + dz], stretch: [1.4, 0.6, 1] });
      b.beam([hx - 1.4, 0.3, hz], [hx - 1.55, 0.22, hz + dz], 0.06, 0.06, 0x8c6a4a);
    }
    // anvil stone and moulds
    b.box(0.5, 0.4, 0.4, P.peperino, { at: [hx + 1.3, 0, hz + 0.2] });
    for (let i = 0; i < 3; i++) b.box(0.4, 0.12, 0.25, P.pietraSerena, { at: [hx + 0.9 + i * 0.3, 0.02, hz - 0.8] });
    b.blob(0.5, 0x2a2420, { at: [hx - 0.4, 0.05, hz - 1.6], stretch: [1.3, 0.35, 1] }); // charcoal heap

    // ---- the potter's oval hut: wattle and daub under a steep thatch, a porch on two posts
    b.group({ at: [9.5, 0, 5.2], scale: [1.35, 1, 1] }, () => {
      b.cyl(2.3, 1.7, P.daub, { segs: 14 });
      b.cone(3.0, 3.6, thatch, { at: [0, 1.4, 0], segs: 14 });
    });
    b.box(1.0, 1.7, 0.2, P.timberBlack, { at: [9.5, 0, 7.5] });
    b.shed(1.8, 1.2, 0.4, thatch, { at: [9.5, 1.8, 7.9], high: '-z' });
    for (const x of [8.7, 10.3]) b.cyl(0.08, 1.8, post, { at: [x, 0, 8.4], segs: 5 });
    b.beam([8.6, 4.6, 5.2], [10.4, 5.2, 5.2], 0.1, 0.1, P.oakDark);
    b.beam([10.4, 4.6, 5.2], [8.6, 5.2, 5.2], 0.1, 0.1, P.oakDark);
    // a stack of fired jars beside the kiln
    for (let i = 0; i < 5; i++) pot(b, [3.2 + (i % 3) * 0.55, 0.05, 0.6 + Math.floor(i / 3) * 0.6], 0.5, i % 2 ? impasto : tint(clay, -0.15));

    // ---- a wattle fence on the street side, with a gap for the path
    const fz = 9.6;
    for (const [x0, x1] of [
      [-15, -4],
      [1, 15],
    ] as const) {
      b.box(x1 - x0, 1.1, 0.12, P.wattle, { at: [(x0 + x1) / 2, 0, fz] });
      for (const x of lin(Math.round((x1 - x0) / 1.5) + 1, x0, x1)) b.cyl(0.07, 1.3, post, { at: [x, 0, fz], segs: 5 });
    }
    b.box(0.12, 1.1, 18.6, P.wattle, { at: [-15, 0, 0.3] });
    b.box(0.12, 1.1, 18.6, P.wattle, { at: [15, 0, 0.3] });
    // path down to the river and a landing of flat stones
    b.box(2.2, 0.04, 20, tint(P.earth, -0.12), { at: [-2.5, 0.01, -1], jitter: false });
    for (let i = 0; i < 4; i++) b.box(1.2, 0.2, 0.7, P.rubble, { at: [-2.5 + (i % 2) * 0.6, WATER - 0.1 + i * 0.3, BANK - 1.4 + i * 0.4] });
    b.log(0.25, 4.2, P.bark, { at: [-6.5, WATER - 0.2, BANK - 1.2], segs: 6 }); // a dugout drawn up
    b.box(3.0, 0.08, 0.5, P.oakDark, { at: [-6.5, WATER + 0.25, BANK - 1.2] });

    // ---- oaks and scrub at the edges
    b.tree(7.5, { at: [-14, 0, -8] });
    b.tree(6.5, { at: [14, 0, 6] });
    b.tree(1.6, { at: [2.5, 0, -8.5], kind: 'bush' });
    b.tree(1.4, { at: [-13.5, 0, 8.2], kind: 'bush' });

    b.collider(SW, SD, { at: [sx, 0, sz] });
    b.collider(2.8, 2.8, { at: [kx, 0, kz] });
  },
};
