import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { amphora, beast, goods, hurdlePen, pot, sack, trestle } from './shared';

/** A granary raised on posts: wattle walls daubed with clay, a steep thatched roof, a notched-log ladder. */
function granary(b: Builder, w: number, d: number, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    const fy = 1.15; // floor level, above damp and vermin
    for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) {
      for (const z of [-d / 2 + 0.15, d / 2 - 0.15]) {
        b.cyl(0.13, fy, P.oakDark, { at: [x, 0, z], segs: 6 });
        b.cyl(0.24, 0.07, P.oakSilver, { at: [x, fy - 0.12, z], segs: 6 }); // rat guard: a flat disc on the post
      }
    }
    b.box(w + 0.2, 0.14, d + 0.2, P.oak, { at: [0, fy, 0] });
    b.box(w, 1.5, d, P.daub, { at: [0, fy + 0.14, 0] });
    b.frame(w, 1.5, P.oakDark, { at: [0, fy + 0.14, d / 2], facing: '+z', studs: 2, rails: 0, beam: 0.1 });
    b.frame(w, 1.5, P.oakDark, { at: [0, fy + 0.14, -d / 2], facing: '-z', studs: 2, rails: 0, beam: 0.1 });
    b.panel(0.6, 1.0, P.oakDark, { at: [0, fy + 0.2, d / 2], facing: '+z', depth: 0.05 }); // hatch
    b.gable(w, d, 1.9, P.thatch, { at: [0, fy + 1.64, 0], ridge: 'z', overhang: 0.45, thick: 0.4, wall: P.daub });
    // a notched log for a ladder
    b.beam([0.1, 0, d / 2 + 1.1], [0.1, fy + 0.1, d / 2 + 0.1], 0.16, 0.16, P.oak);
  });
}

/**
 * The moneyer's booth: a thatched shelter open on three sides with a furnace for melting the metal,
 * a bench of clay flan moulds and a block with an anvil on which the blanks were struck between dies.
 */
function mint(b: Builder, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    const w = 4.2;
    const d = 3.2;
    for (const x of [-w / 2, 0, w / 2]) for (const z of [-d / 2, d / 2]) b.cyl(0.11, 2.1, P.oakDark, { at: [x, 0, z], segs: 6 });
    for (const z of [-d / 2, d / 2]) b.box(w + 0.2, 0.16, 0.16, P.oak, { at: [0, 2.05, z] });
    b.gable(w + 0.2, d, 1.7, P.thatchOld, { at: [0, 2.2, 0], overhang: 0.45, thick: 0.38 });
    // back wall of wattle and daub, against the wind
    b.box(w, 2.1, 0.14, P.daub, { at: [0, 0, -d / 2] });
    // trodden floor
    b.box(w + 0.6, 0.05, d + 0.6, tint(P.earth, -0.06), { jitter: false });
    // the furnace: a clay dome with a crucible, bellows of hide beside it
    b.dome(0.55, P.cob, { at: [-1.35, 0, -0.6], squash: 0.9, segs: 8 });
    b.cyl(0.14, 0.18, P.tileBrown, { at: [-1.35, 0.46, -0.6], segs: 6 });
    b.box(0.5, 0.16, 0.3, P.oakDark, { at: [-0.75, 0.05, -0.75], rotY: 0.4 });
    b.blob(0.18, P.timberBlack, { at: [-1.35, 0.25, -0.05], stretch: [1, 0.4, 1], detail: 0 });
    // the bench with clay moulds: slabs pitted with rows of little cups for casting blanks
    trestle(b, 1.6, 0.6, [0.2, 0, -1.05]);
    for (let i = 0; i < 3; i++) {
      const x = -0.35 + i * 0.5;
      b.box(0.38, 0.05, 0.3, P.terracotta, { at: [x, 0.88, -1.05] });
      for (let k = 0; k < 3; k++) b.box(0.05, 0.02, 0.22, tint(P.terracotta, -0.18), { at: [x - 0.12 + k * 0.12, 0.93, -1.05], jitter: false });
    }
    // the striking block: a log with an iron anvil and the die set in it, a hammer beside
    b.cyl(0.28, 0.6, P.oak, { at: [1.2, 0, 0.2], segs: 7 });
    b.box(0.26, 0.14, 0.2, P.iron, { at: [1.2, 0.6, 0.2] });
    b.cyl(0.04, 0.16, P.bronze, { at: [1.2, 0.74, 0.2], segs: 5 }); // the upper die
    b.beam([1.55, 0.6, 0.35], [1.75, 0.62, 0.7], 0.04, 0.04, P.oak);
    b.box(0.14, 0.09, 0.09, P.iron, { at: [1.53, 0.58, 0.31], rotY: 0.6 });
    // a little chest for the coins
    b.box(0.5, 0.35, 0.35, P.oakDark, { at: [1.5, 0, -1.1] });
    b.box(0.52, 0.06, 0.37, P.iron, { at: [1.5, 0.35, -1.1] });
  });
}

export const gaulishMarket: BuildingDef = {
  id: 'gaulish-market',
  name: 'Market ground by the gate',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 300 to 52 BC',
  summary:
    'There is no market building yet: just open, trodden ground inside the rampart by the main gate, where people from the farms bring beasts and grain. ' +
    'Pigs, sheep and small cattle wait in pens of woven hurdles, grain is kept dry in granaries raised on posts, and potters, salt sellers and smiths set out their wares on trestles. ' +
    'In a shelter of its own a moneyer casts metal blanks in clay moulds and strikes them between engraved dies: by the second century BC the Belgic tribes minted their own gold and bronze, and Italian wine arrived by the shipload in tall amphorae, paid for in slaves, metal and coin.',
  materials: ['oak posts', 'wattle and daub', 'thatch', 'beaten earth'],
  lookFor: [
    { label: 'Granary on posts', note: 'Grain was stored off the ground on four posts, with flat discs on the posts to stop rats climbing.', at: [-8.6, 2.6, -6.2] },
    { label: 'Moneyer’s booth', note: 'Blanks cast in a clay mould pitted with little cups were struck between two engraved dies on an anvil set in a log.', at: [7.4, 1.4, -5.2] },
    { label: 'Hurdle pens', note: 'Pens of woven hazel hurdles held the pigs and sheep: Gaulish salt pork was sold as far as Rome.', at: [-6.8, 1.2, 4.6] },
    { label: 'Wine amphorae', note: 'Tall Italian wine jars, the type archaeologists call Dressel 1, are found by the thousand in the oppida of the late second and first centuries BC.', at: [4.6, 1.1, 2.0] },
  ],
  modelledOn: 'A general picture drawn from excavated oppida of northern Gaul; the clay flan moulds and minting debris follow finds from sites such as Villeneuve-Saint-Germain (Aisne)',
  build(b) {
    b.noCollide();
    // beaten earth, darker where feet and hooves have churned it, and the road in from the gate
    b.box(25.4, 0.04, 21.4, P.earth, { jitter: false });
    b.box(4.2, 0.02, 21.4, tint(P.mud, 0.05), { at: [0.4, 0.04, 0], jitter: false });
    for (const z of [-7, -1, 5]) b.box(0.25, 0.015, 3.2, tint(P.mud, -0.06), { at: [b.pick([-0.6, 1.3]), 0.06, z], jitter: false });
    for (let i = 0; i < 10; i++) b.box(b.range(0.8, 2.2), 0.012, b.range(0.6, 1.6), tint(P.earth, b.range(-0.08, 0.04)), { at: [b.range(-11, 11), 0.04, b.range(-9.5, 9.5)], rotY: b.range(0, 3), jitter: false });

    // ---- pens of hurdles on the west side, with pigs, sheep and two small cattle
    hurdlePen(b, 5.2, 4.0, [-7.6, 0, 6.6], 0);
    for (const [x, z, r] of [[-9.0, 6.0, 0.4], [-7.6, 7.4, 2.6], [-6.2, 5.8, 1.2], [-8.6, 7.8, 4]] as [number, number, number][]) beast(b, [x, 0, z], r, 'pig');
    hurdlePen(b, 5.2, 4.0, [-7.6, 0, 1.6], 0);
    for (const [x, z, r] of [[-9.2, 1.0, 0.2], [-8.0, 2.4, 2.2], [-6.7, 0.8, 5.1], [-6.0, 2.2, 3.4], [-8.6, 2.6, 1]] as [number, number, number][]) beast(b, [x, 0, z], r, 'sheep');
    // cattle tethered to a rail
    b.box(4.2, 0.1, 0.1, P.oak, { at: [-3.6, 0.9, 9.2] });
    for (const x of [-5.6, -1.6]) b.box(0.12, 1.0, 0.12, P.oakDark, { at: [x, 0, 9.2] });
    beast(b, [-4.5, 0, 8.3], -Math.PI / 2, 'cow');
    beast(b, [-2.7, 0, 8.4], -Math.PI / 2 + 0.2, 'cow', P.oak);

    // ---- two granaries at the back
    granary(b, 2.4, 2.6, [-8.6, 0, -6.2], 0);
    granary(b, 2.2, 2.4, [-4.4, 0, -7.6], 0.1);

    // ---- the moneyer's booth
    mint(b, [7.4, 0, -6.4], 0);

    // ---- traders on trestles along the road: pots, salt in clay moulds, ironwork, cloth
    trestle(b, 2.4, 0.9, [4.4, 0, -1.6], -Math.PI / 2);
    goods(b, 2.0, [4.4, 0.88, -1.6], -Math.PI / 2, ['pot', 'pot', 'basket']);
    trestle(b, 2.4, 0.9, [4.4, 0, 6.2], -Math.PI / 2);
    goods(b, 2.0, [4.4, 0.88, 6.2], -Math.PI / 2, ['cloth', 'basket']);
    // salt in its clay briquetage, broken from the moulds in grey-white cakes
    trestle(b, 1.8, 0.8, [-3.0, 0, -1.2], Math.PI / 2);
    for (let i = 0; i < 3; i++) b.box(0.36, 0.2, 0.22, P.chalk, { at: [-3.0, 0.88, -1.8 + i * 0.6] });
    for (let i = 0; i < 2; i++) b.box(0.3, 0.12, 0.18, P.terracotta, { at: [-2.9, 1.08, -1.5 + i * 0.6] });
    // a smith's goods: bars of iron in the double-pointed trade shape, a sword, sickles
    trestle(b, 1.8, 0.8, [-3.0, 0, 3.6], Math.PI / 2);
    for (let i = 0; i < 4; i++) b.box(0.08, 0.06, 0.6, P.iron, { at: [-3.1 + (i % 2) * 0.15, 0.88 + Math.floor(i / 2) * 0.06, 3.2 + i * 0.18] });
    b.box(0.05, 0.03, 0.85, P.steel, { at: [-2.9, 0.88, 4.1] });
    // potter's wares on the ground
    for (let i = 0; i < 5; i++) pot(b, [6.3 + (i % 3) * 0.45, 0, 1.0 + Math.floor(i / 3) * 0.5], 1.3, b.pick([P.tileBrown, P.timberBlack, P.terracotta]));

    // ---- a merchant's stack of Italian wine amphorae, some propped, one lying in the straw
    b.box(2.0, 0.08, 1.4, P.thatch, { at: [4.8, 0, 2.6], jitter: false });
    for (let i = 0; i < 5; i++) amphora(b, [4.2 + (i % 3) * 0.42, 0.06, 2.3 + Math.floor(i / 3) * 0.55], P.terracotta, b.range(-0.12, 0.12));
    amphora(b, [5.4, 0.25, 3.1], P.terracotta, Math.PI / 2 - 0.1, 0.5);

    // ---- a weaver's lean-to of poles and hides at the front, horses tied up beside it
    b.group({ at: [8.6, 0, 6.6], rotY: -Math.PI / 2 }, () => {
      for (const x of [-1.6, 1.6]) {
        b.cyl(0.08, 2.2, P.oakDark, { at: [x, 0, -1.0], segs: 5 });
        b.cyl(0.08, 1.5, P.oakDark, { at: [x, 0, 1.0], segs: 5 });
      }
      b.box(3.6, 0.05, 2.3, tint(P.oak, 0.12), { at: [0, 1.8, 0], rot: [-0.33, 0, 0] });
      trestle(b, 2.6, 0.8, [0, 0, 0.1]);
      goods(b, 2.2, [0, 0.88, 0.1], 0, ['cloth', 'cloth', 'basket']);
      b.box(0.1, 1.6, 0.9, P.oak, { at: [-1.2, 0, -0.75] }); // an upright loom against the back
      for (let k = 0; k < 5; k++) b.box(0.02, 1.2, 0.02, b.pick([P.doorRed, P.cream, P.ochreWash]), { at: [-1.16, 0.3, -1.1 + k * 0.18] });
    });
    b.box(0.1, 0.1, 3.0, P.oak, { at: [10.7, 1.0, 0.6] });
    for (const z of [-0.8, 2.0]) b.box(0.12, 1.1, 0.12, P.oakDark, { at: [10.7, 0, z] });
    beast(b, [9.5, 0, -0.1], 0, 'horse', P.oak);
    beast(b, [9.5, 0, 1.4], 0.15, 'horse', tint(P.cream, -0.1));

    // ---- sacks of grain by the granaries, a cart in from the country
    for (let i = 0; i < 5; i++) sack(b, [-6.4 + (i % 3) * 0.55, 0, -4.6 + Math.floor(i / 3) * 0.55]);
    b.group({ at: [1.0, 0, -8.2], rotY: 0.15 }, () => {
      b.box(1.5, 0.12, 2.6, P.oak, { at: [0, 0.75, 0] });
      for (const s of [-1, 1]) {
        b.box(0.08, 0.4, 2.6, P.oak, { at: [s * 0.72, 0.87, 0] });
        b.cyl(0.6, 0.12, P.oakDark, { at: [s * 0.86, 0.6, 0], rot: [0, 0, Math.PI / 2], segs: 10 });
      }
      b.beam([0, 0.8, 1.3], [0, 0.4, 3.2], 0.1, 0.1, P.oak);
      for (let i = 0; i < 3; i++) sack(b, [-0.3 + i * 0.3, 0.87, -0.4 + (i % 2) * 0.5], 0.9);
    });
  },
};
