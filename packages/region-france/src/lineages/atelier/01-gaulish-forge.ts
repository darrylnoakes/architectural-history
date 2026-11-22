import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { BANK, WATER, boat, charcoalStack, fence, heap, lin, logPile, rise, stakeBank, thatchRoof, water } from './shared';

/** A smith's hearth: a waist-high clay platform with a fire bed and a pair of bag bellows behind it. */
function hearth(b: Builder, at: Vec3, clay: number) {
  const [x, y, z] = at;
  b.box(1.5, 0.75, 1.1, clay, { at: [x, y, z] });
  b.box(0.7, 0.12, 0.6, P.timberBlack, { at: [x, y + 0.75, z + 0.1] }); // the charcoal fire bed
  b.box(0.35, 0.06, 0.3, 0xd8762f, { at: [x, y + 0.86, z + 0.1], jitter: false }); // glowing coals
  // a clay wall shielding the bellows, with the nozzle (tuyère) through it
  b.box(1.5, 0.5, 0.25, tint(clay, -0.06), { at: [x, y + 0.75, z - 0.42] });
  // two leather bag bellows, worked by hand
  for (const dx of [-0.35, 0.35]) {
    b.blob(0.32, 0x6b4a32, { at: [x + dx, y + 0.95, z - 0.95], stretch: [0.8, 0.5, 1.3], detail: 0 });
    b.beam([x + dx, y + 1.05, z - 1.3], [x + dx, y + 1.4, z - 1.55], 0.05, 0.05, P.oak);
  }
}

/** An anvil block on an oak stump, with a hammer laid on it. */
function anvil(b: Builder, at: Vec3) {
  const [x, y, z] = at;
  b.cyl(0.32, 0.55, P.oakDark, { at: [x, y, z], segs: 7 });
  b.box(0.36, 0.22, 0.24, P.iron, { at: [x, y + 0.55, z] });
  b.box(0.05, 0.05, 0.35, P.oak, { at: [x + 0.1, y + 0.78, z + 0.1], jitter: false });
}

/** A bipyramidal iron ingot (the Gaulish trade bar), lying along X. */
function ingot(b: Builder, at: Vec3) {
  b.group({ at, rot: [0, 0, Math.PI / 2] }, () => {
    b.cone(0.07, 0.25, P.iron, { at: [0, 0, 0], segs: 4 });
    b.cone(0.07, 0.25, P.iron, { at: [0, 0, 0], segs: 4, rot: [Math.PI, 0, 0] });
  });
}

export const gaulishForge: BuildingDef = {
  id: 'gaulish-forge',
  name: 'Smithy and bronze-caster’s workshop',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 300 to 50 BC',
  summary:
    'In the oppidum the metalworkers keep to the edge of town, near the river and away from the houses, because their fires are dangerous. ' +
    'The smith works under a thatched shelter open at the front for light and air, with a clay hearth blown by leather bellows, an anvil on an oak stump and a trough of water for quenching. ' +
    'Iron came to him already smelted, as bars shaped like two pyramids joined at the base; he forged them into tools, tyres, nails and weapons. ' +
    'Next door a bronze-caster melts copper and tin in small crucibles for brooches, harness fittings and the blanks for the tribe’s coins, and heaps of charcoal, the only fuel hot enough, stand ready in the yard.',
  materials: ['oak posts', 'wattle and daub', 'thatch', 'clay', 'iron and bronze'],
  lookFor: [
    { label: 'Smith’s hearth and bellows', note: 'A waist-high clay hearth, its fire blown hot through a clay nozzle by two leather bag bellows worked by hand.', at: [-6.4, 1.6, -1.0] },
    { label: 'Anvil and quenching trough', note: 'Hot iron was hammered on an iron block set in an oak stump and hardened by plunging it into water.', at: [-4.2, 1.1, 0.9] },
    { label: 'Iron trade bars', note: 'Iron travelled in bars shaped like two pyramids base to base, a stock the smith could test and cut as he needed.', at: [-2.2, 0.9, 2.6] },
    { label: 'Bronze-caster’s crucible hearth', note: 'A small pit fire where copper and tin were melted together in clay crucibles and poured into moulds.', at: [8.2, 1.0, -2.4] },
    { label: 'Charcoal stacks', note: 'Wood slowly charred under a skin of earth makes charcoal, which burns far hotter than wood.', at: [-14.2, 2.0, -5.5] },
  ],
  influences: [],
  build(b) {
    const clay = b.pick([P.daub, tint(P.daub, -0.05), P.cob]);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.05), P.thatchOld]);
    const timber = P.oak;

    // ---- the ground: trodden earth, a stake revetment along the river bank
    b.box(35, 0.04, 21.6, tint(P.earth, 0.04), { at: [0, 0, 0], jitter: false });
    stakeBank(b, -17.5, 17.5);

    // ---- the smithy: posts and a steep thatch, wattle at the back and one end, open to the yard
    const sx = -6;
    const sz = -0.8;
    const SW = 8;
    const SD = 5.6;
    const ph = 2.7;
    for (const x of lin(4, sx - SW / 2 + 0.15, sx + SW / 2 - 0.15)) {
      for (const z of [sz - SD / 2 + 0.15, sz + SD / 2 - 0.15]) b.cyl(0.14, ph, timber, { at: [x, 0, z], segs: 6 });
    }
    b.box(SW, 0.2, 0.22, timber, { at: [sx, ph - 0.2, sz - SD / 2 + 0.15] });
    b.box(SW, 0.2, 0.22, timber, { at: [sx, ph - 0.2, sz + SD / 2 - 0.15] });
    // wattle and daub walls on the back (river side) and the west end
    b.box(SW - 0.3, ph - 0.2, 0.16, clay, { at: [sx, 0, sz - SD / 2 + 0.15] });
    b.box(0.16, ph - 0.2, SD - 0.3, clay, { at: [sx - SW / 2 + 0.15, 0, sz] });
    thatchRoof(b, SW, SD, [sx, ph, sz], { color: thatch, overhang: 0.5 });
    // a smoke hole: the gable ends left open under the ridge, shown as dark triangles
    const rr = rise(SD, 50);
    for (const s of [-1, 1]) {
      b.extrude([[-0.6, 0], [0.6, 0], [0, 0.9]], 0.05, P.timberBlack, { at: [sx + s * (SW / 2 + 0.02), ph + rr - 1.3, sz], rot: [0, Math.PI / 2, 0] });
    }
    hearth(b, [sx - 0.6, 0, sz - 1.0], clay);
    anvil(b, [sx + 1.8, 0, sz + 0.9]);
    b.box(1.3, 0.45, 0.55, P.oakDark, { at: [sx + 2.6, 0, sz - 0.3] }); // quenching trough (a hollowed log)
    water(b, 1.1, 0.4, [sx + 2.6, 0.42, sz - 0.3]);
    // tools hung on the back wall: tongs and hammers
    for (const x of lin(5, sx + 0.8, sx + 3.2)) b.box(0.05, 0.7, 0.05, P.iron, { at: [x, 1.0, sz - SD / 2 + 0.28], jitter: false });
    b.box(2.6, 0.08, 0.1, P.oak, { at: [sx + 2.0, 1.7, sz - SD / 2 + 0.28] });
    // a stock of iron trade bars by the door and a heap of scale and slag outside
    for (let i = 0; i < 6; i++) ingot(b, [sx + 3.6 + (i % 3) * 0.14, 0.1 + Math.floor(i / 3) * 0.12, sz + SD / 2 + 0.3]);
    b.box(0.8, 0.1, 0.5, P.oak, { at: [sx + 3.8, 0, sz + SD / 2 + 0.3] });
    heap(b, [sx - SW / 2 - 1.2, 0, sz - 1.4], 1.0, 0.6, 0x4a423c);

    // ---- the bronze-caster's shelter: smaller, on four posts, with a crucible hearth in a pit
    const bx = 8.2;
    const bz = -2.2;
    const BW = 5.0;
    const BD = 4.2;
    for (const x of [bx - BW / 2 + 0.15, bx + BW / 2 - 0.15]) for (const z of [bz - BD / 2 + 0.15, bz + BD / 2 - 0.15]) b.cyl(0.13, 2.0, timber, { at: [x, 0, z], segs: 6 });
    b.box(BW - 0.3, 1.8, 0.16, clay, { at: [bx, 0, bz - BD / 2 + 0.15] });
    b.box(BW, 0.18, 0.2, timber, { at: [bx, 1.82, bz + BD / 2 - 0.15] });
    b.box(BW, 0.18, 0.2, timber, { at: [bx, 1.82, bz - BD / 2 + 0.15] });
    b.hip(BW + 1.0, BD + 1.0, rise(BD + 1.0, 48), thatch, { at: [bx, 1.95, bz] });
    // the crucible hearth: a clay-lined ring with the crucible sitting in the coals
    b.cyl(0.6, 0.3, tint(clay, -0.08), { at: [bx, 0, bz - 0.2], segs: 9 });
    b.cyl(0.42, 0.04, P.timberBlack, { at: [bx, 0.28, bz - 0.2], segs: 9, jitter: false });
    b.cyl(0.12, 0.22, 0xb07850, { at: [bx, 0.3, bz - 0.2], rTop: 0.15, segs: 7 });
    b.blob(0.25, 0x6b4a32, { at: [bx - 0.85, 0.3, bz - 0.4], stretch: [1.2, 0.6, 0.9], detail: 0 }); // bellows
    // a bench with clay moulds, and a basket of scrap bronze
    b.box(2.0, 0.7, 0.6, P.oak, { at: [bx + 1.1, 0, bz + 1.2] });
    for (const x of lin(4, bx + 0.4, bx + 1.8)) b.box(0.28, 0.14, 0.2, tint(clay, -0.12), { at: [x, 0.7, bz + 1.2] });
    b.cyl(0.3, 0.4, P.wattle, { at: [bx - 1.6, 0, bz + 1.3], rTop: 0.36, segs: 8 });
    b.cyl(0.26, 0.04, P.bronze, { at: [bx - 1.6, 0.38, bz + 1.3], segs: 8, jitter: false });

    // ---- the smith's house: wattle and daub walls on posts, a door to the yard, a steep thatch
    const hx = 11.2;
    const hz = 5.0;
    const HW = 7.0;
    const HD = 5.2;
    b.box(HW, 2.0, HD, clay, { at: [hx, 0, hz] });
    for (const x of lin(5, hx - HW / 2, hx + HW / 2)) for (const z of [hz - HD / 2, hz + HD / 2]) b.box(0.2, 2.0, 0.2, P.oakDark, { at: [x, 0, z] });
    thatchRoof(b, HW, HD, [hx, 2.0, hz], { color: tint(thatch, 0.03), overhang: 0.6 });
    b.panel(1.0, 1.8, P.oakDark, { at: [hx - 1.2, 0, hz + HD / 2], facing: '+z' });
    b.panel(1.0, 1.8, P.oakDark, { at: [hx - 1.2, 0, hz - HD / 2], facing: '-z' });
    b.box(1.6, 0.12, 1.4, P.oak, { at: [hx - 1.2, 0, hz + HD / 2 + 0.7] }); // a plank porch step

    // ---- the yard: charcoal stacks, a woodpile, baskets of charcoal, a fence and gate to the street
    charcoalStack(b, [-14.2, 0, -5.5], 2.2, 1.7);
    charcoalStack(b, [-13.0, 0, -1.2], 1.4, 1.0, tint(P.timberBlack, 0.08)); // a heap of finished charcoal
    logPile(b, [-14.5, 0, 3.5], 3.2, 3);
    for (const [x, z] of [
      [-11.4, 0.4],
      [-11.0, 1.2],
    ]) {
      b.cyl(0.32, 0.55, P.wattle, { at: [x, 0, z], rTop: 0.4, segs: 8 });
      b.cyl(0.36, 0.05, P.timberBlack, { at: [x, 0.52, z], segs: 8, jitter: false });
    }
    fence(b, -17.6, -1.6, 9.6);
    fence(b, 2.2, 17.6, 9.6);
    for (const x of [-1.6, 2.2]) b.cyl(0.14, 2.0, P.oakDark, { at: [x, 0, 9.6], segs: 6 });
    fence(b, -9.6, 9.6, 17.6, true);

    // ---- the river: a dugout canoe drawn up, a landing of planks, a clay pit for the moulds
    b.box(2.4, 0.1, 1.6, P.oak, { at: [0.5, 0.0, BANK - 0.7] });
    for (const x of [-0.5, 1.5]) b.cyl(0.1, 1.6, P.oakDark, { at: [x, WATER - 1.0, BANK - 1.3], segs: 5 });
    boat(b, [3.6, 0, BANK - 2.4], 5.5, 0.8, P.oakDark, 0.1);
    b.box(2.6, 0.06, 1.8, tint(P.mud, 0.05), { at: [13.5, 0, -8.2], jitter: false });
    water(b, 1.6, 1.0, [13.5, 0.05, -8.2], tint(P.water, -0.15));

    b.collider(SW, SD, { at: [sx, 0, sz] });
    b.collider(BW, BD, { at: [bx, 0, bz] });
    b.collider(4.6, 4.4, { at: [-14.2, 0, -5.5] });
    b.collider(HW, HD, { at: [hx, 0, hz] });
  },
};
