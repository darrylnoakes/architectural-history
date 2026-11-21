import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, jetty } from './shared';

/** An upright warp-weighted loom, about 2 m tall, facing +Z, standing on `at`. */
function loom(b: Builder, x: number, z: number, cloth: number) {
  b.group({ at: [x, 0, z], rot: [-0.18, 0, 0] }, () => {
    b.sym((s) => b.box(0.12, 2.2, 0.12, P.oak, { at: [s * 0.8, 0, 0] }));
    b.log(0.07, 1.9, P.oak, { at: [0, 1.95, 0.05] }); // cloth beam
    b.box(1.45, 0.06, 0.02, P.oakDark, { at: [0, 0.75, 0.05] }); // shed rod
    b.box(1.4, 1.1, 0.02, mixCloth(cloth), { at: [0, 0.85, 0.06], jitter: false }); // warp threads
    b.box(1.4, 0.55, 0.03, cloth, { at: [0, 1.4, 0.07], jitter: false }); // woven cloth
    for (let i = 0; i < 9; i++) b.sphere(0.07, P.earth, { at: [-0.64 + i * 0.16, 0.42, 0.06], segs: 5 }); // loom weights
  });
}

function mixCloth(c: number) {
  return tint(c, 0.18);
}

export const ironAgeSmithy: BuildingDef = {
  id: 'iron-age-smithy',
  name: 'Smithy, kiln and weaving hut',
  style: 'Iron Age',
  date: 'c. 500 BC',
  summary:
    'Before there were factories, making things happened in the farmyard. A smith smelted iron from bog ore in a small clay bowl furnace, ' +
    'then hammered the spongy bloom into tools at a hearth under an open-sided thatched shelter, left open so the smoke could escape. ' +
    'Pots were fired in a clamp, a heap of fuel and turf over the stacked pots, and cloth was woven on an upright loom held taut by clay weights.',
  materials: ['oak posts', 'wattle and daub', 'straw thatch', 'clay'],
  lookFor: [
    { label: 'Bowl furnace', note: 'A low clay chimney over a bowl in the ground. Charcoal and ore went in the top; bellows blew air in at the base.', at: [-8.6, 1.3, 1] },
    { label: 'Open-sided shelter', note: 'Just posts and a steep thatched roof, so the smith had light and the smoke and sparks could get out.', at: [-5.5, 3.6, 4.2] },
    { label: 'Clamp kiln', note: 'Pots stacked under fuel and turves and fired in one go. Afterwards the heap was pulled apart, so nothing of it survives but ash.', at: [3.2, 1.3, 7] },
    { label: 'Warp-weighted loom', note: 'The threads hang from a beam and are pulled straight by a row of clay loom weights, which archaeologists find by the dozen.', at: [9, 2.3, 5.1] },
    { label: 'Roundhouse', note: 'The usual British building for a thousand years: a circle of wattle and daub under a cone of thatch.', at: [9, 4.5, -1] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, P.reed]);
    const post = P.oak;

    // ---- the smithy: an open-sided shelter on six posts
    const sx = -6;
    const sz = 1;
    const W = 7;
    const D = 5;
    const eave = 2.1;
    for (const x of [-W / 2 + 0.2, 0, W / 2 - 0.2]) {
      b.sym((s) => b.cyl(0.13, eave, post, { at: [sx + x, 0, sz + s * (D / 2 - 0.2)], segs: 6 }));
    }
    b.sym((s) => b.box(W, 0.18, 0.2, post, { at: [sx, eave - 0.18, sz + s * (D / 2 - 0.2)] }));
    b.gable(W, D, 3.1, thatch, { at: [sx, eave, sz], overhang: 0.6, thick: 0.4 });
    // floor of trodden earth
    b.box(W + 1, 0.04, D + 1, P.earth, { at: [sx, 0, sz], jitter: false });
    // bowl furnace: a short clay shaft with a tuyere and a pair of skin bellows
    b.lathe([[0.62, 0], [0.6, 0.4], [0.42, 0.9], [0.28, 1.15], [0.2, 1.15], [0.2, 1.0]], P.cob, { at: [sx - 2.6, 0, sz], segs: 10 });
    b.log(0.06, 0.6, P.terracotta, { at: [sx - 2.0, 0.2, sz], segs: 6 });
    b.blob(0.3, P.mud, { at: [sx - 1.5, 0.25, sz - 0.25], stretch: [1.3, 0.6, 0.9] });
    b.blob(0.3, P.mud, { at: [sx - 1.5, 0.25, sz + 0.3], stretch: [1.3, 0.6, 0.9] });
    // smithing hearth, anvil stone and quench trough
    b.box(1.2, 0.5, 1.0, P.cob, { at: [sx + 0.6, 0, sz - 1.1] });
    b.box(0.7, 0.08, 0.5, P.brickDark, { at: [sx + 0.6, 0.5, sz - 1.1], jitter: false });
    b.cyl(0.32, 0.55, P.gritstone, { at: [sx + 0.6, 0, sz + 0.4], segs: 7 });
    b.box(0.3, 0.12, 0.14, P.iron, { at: [sx + 0.6, 0.55, sz + 0.4] });
    b.box(1.2, 0.35, 0.45, P.oakDark, { at: [sx + 2.2, 0, sz + 0.8] });
    // slag heap and charcoal behind
    for (let i = 0; i < 5; i++) b.blob(0.3 + b.rand() * 0.2, i % 2 ? P.iron : P.castIron, { at: [sx - 4.2 + b.rand() * 0.8, 0.1, sz - 2.2 + b.rand() * 1.2], stretch: [1, 0.5, 1] });
    b.cone(0.9, 0.7, P.timberBlack, { at: [sx + 2.6, 0, sz - 3.3], segs: 8 });

    // ---- the weaving hut: a roundhouse with a porch
    const hx = 9;
    const hz = -1;
    const R = 3.6;
    b.cyl(R, 1.7, P.daub, { at: [hx, 0, hz], segs: 16 });
    b.cone(R + 0.8, 4.9, thatch, { at: [hx, 1.45, hz], segs: 16 });
    b.cone(0.3, 0.3, tint(thatch, -0.1), { at: [hx, 6.2, hz], segs: 8 });
    // porch: two posts and a short gabled thatch
    const pz = hz + R;
    b.panel(1.1, 1.6, P.oakDark, { at: [hx, 0, pz - 0.02], facing: '+z' });
    b.sym((s) => b.cyl(0.11, 1.9, post, { at: [hx + s * 1.3, 0, pz + 2.1], segs: 6 }));
    b.gable(3.0, 2.6, 1.7, thatch, { at: [hx, 1.9, pz + 1.0], ridge: 'z', overhang: 0.25, thick: 0.3 });
    loom(b, hx, pz + 1.9, b.pick([P.doorBlue, P.ochreWash, P.doorRed, P.daub]));

    // ---- clamp kiln: a low turf-covered mound with pots waiting to be fired
    const kx = 2.5;
    const kz = 6.6;
    b.blob(1.5, P.turf, { at: [kx, 0.15, kz], stretch: [1, 0.55, 0.9] });
    b.blob(0.5, P.earth, { at: [kx + 0.4, 0.75, kz + 0.2], stretch: [1, 0.4, 1] });
    b.cyl(0.08, 0.3, P.timberBlack, { at: [kx, 0.85, kz], segs: 5 });
    for (let i = 0; i < 6; i++) {
      b.lathe([[0.01, 0], [0.16, 0.04], [0.2, 0.18], [0.14, 0.32], [0.15, 0.36]], P.mud, { at: [kx - 2.2 + (i % 3) * 0.45, 0, kz + 1.4 + Math.floor(i / 3) * 0.45], segs: 7 });
    }
    // woodpile and fence
    for (let i = 0; i < 4; i++) b.log(0.12, 1.8, P.bark, { at: [-14, i < 3 ? 0 : 0.22, 6 + (i < 3 ? i * 0.26 : 0.13)] });
    for (let i = 0; i < 18; i++) b.cyl(0.05, 1.0, P.wattle, { at: [-16 + i * 1.8, 0, 10], segs: 4 });
    b.box(32, 0.5, 0.1, P.wattle, { at: [-0.7, 0.4, 10] });

    // ---- the river: a landing stage and a logboat
    jetty(b, -1, 2, 2.5, { y: 0.05 });
    b.group({ at: [1.5, WATER - 0.15, BANK - 1.6] }, () => {
      b.box(4.2, 0.45, 0.75, P.oakDark);
      b.box(3.8, 0.1, 0.55, P.oak, { at: [0, 0.38, 0] });
    });

    b.collider(W, D, { at: [sx, 0, sz] });
    b.collider(R * 2, R * 2, { at: [hx, 0, hz] });
  },
};
