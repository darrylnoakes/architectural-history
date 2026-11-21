import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { beast, goods, pen, pot } from './shared';

/** An oval hut of wattle and daub with a steep thatched roof and a little porch (the Latial capanna). */
function hut(b: Builder, x: number, z: number, rotY: number): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    b.group({ scale: [1.3, 1, 1] }, () => {
      b.cyl(2.0, 1.55, P.daub, { segs: 12 });
      b.cyl(2.08, 0.3, tint(P.mud, 0.05), { segs: 12 });
      b.cone(2.55, 3.1, P.thatch, { at: [0, 1.4, 0], segs: 12 });
      b.cone(0.5, 0.5, P.thatchOld, { at: [0, 4.0, 0], segs: 8 });
    });
    // smoke-hole gablets and the crossed ridge poles seen on the hut urns of the period
    for (const s of [-1, 1]) b.beam([s * 0.5, 4.0, 0], [s * 1.1, 4.7, 0], 0.08, 0.08, P.oakDark);
    // porch on two posts in front of the door
    b.panel(0.9, 1.45, P.oakDark, { at: [0, 0, 1.99], facing: '+z' });
    for (const s of [-1, 1]) b.box(0.12, 1.9, 0.12, P.oak, { at: [s * 0.75, 0, 2.95] });
    b.box(1.9, 0.35, 1.3, P.thatch, { at: [0, 1.85, 2.45], rot: [-0.3, 0, 0] });
    b.collider(5.3, 4.1);
  });
}

export const cattleMarket: BuildingDef = {
  id: 'cattle-market',
  name: 'Cattle market by the ford',
  style: 'Iron Age (Latial and early Etruscan)',
  date: 'c. 750 to 300 BC',
  summary:
    'The town exists because the river can be waded here, and wherever a road crosses a river people meet to trade. ' +
    'Herdsmen bring cattle, sheep and pigs down to pens of split timber on the open ground by the ford, and salt and pots change hands beside them. ' +
    'An open-air altar makes the deals sacred: Rome’s own cattle market, the Forum Boarium beside the Tiber ford, had the Ara Maxima of Hercules, said to be older than the city. ' +
    'There are no market buildings yet, only a thatched hut where the dealers can shelter.',
  materials: ['oak and chestnut posts', 'wattle and daub', 'straw thatch', 'tufa blocks'],
  lookFor: [
    { label: 'Open-air altar', note: 'A block of squared tufa where offerings were burnt; trade and oaths were made under the eye of the gods.', at: [0.0, 1.4, 1.2] },
    { label: 'Stock pens', note: 'Post-and-rail pens of split timber hold the animals brought down from the hills to be sold.', at: [-7.2, 1.4, -2.2] },
    { label: 'Hut (capanna)', note: 'An oval hut of wattle and daub with a steep thatch, the house type of Iron Age Latium known from post-holes and from clay urns made in its shape.', at: [7.4, 3.6, -4.6] },
    { label: 'Water trough', note: 'A hollowed log, filled by bucket from the river, for animals that have walked in from the hills.', at: [-2.6, 0.8, -6.6] },
  ],
  influences: ['etruscan-legacy'],
  build(b) {
    // the trodden ground: dusty in the middle, grassy at the margins
    b.group({ scale: [1.2, 1, 0.98] }, () => b.cyl(10.6, 0.03, tint(P.grassDry, -0.02), { segs: 20 }));
    b.group({ scale: [1.25, 1, 1] }, () => b.cyl(8.2, 0.05, tint(P.earth, 0.04), { segs: 18 }));

    // pens on the west, with cattle in one and sheep or pigs in the other
    pen(b, 6.4, 4.6, [-7.6, 0, -3.6], 0.08);
    pen(b, 4.6, 4.2, [-8.2, 0, 3.4], -0.06);
    const cows = 3 + (b.variant % 2);
    for (let i = 0; i < cows; i++) beast(b, [-9.6 + i * 1.6, 0, -4.4 + (i % 2) * 1.5], b.range(-0.6, 0.6) + (i % 2) * 3.1, 'cow', b.pick([P.limestone, P.granite, P.cream]));
    const small = b.pick(['sheep', 'pig'] as const);
    for (let i = 0; i < 5; i++) beast(b, [-9.4 + (i % 3) * 1.2, 0, 2.6 + Math.floor(i / 3) * 1.4], b.range(0, 6.28), small);
    b.collider(6.6, 4.8, { at: [-7.6, 0, -3.6] });
    b.collider(4.8, 4.4, { at: [-8.2, 0, 3.4] });

    // a pair of oxen being led to the altar from the ford side
    beast(b, [3.2, 0, 4.6], Math.PI, 'cow', P.cream);
    b.figure({ at: [4.6, 0, 4.9], color: P.oak });

    // the altar: squared tufa blocks on a low base, ash and a fire on top, pots of offerings
    b.box(2.6, 0.25, 1.8, tint(P.tufa, -0.06), { at: [0, 0, 0] });
    b.box(1.9, 0.85, 1.1, P.tufa, { at: [0, 0.25, 0] });
    b.box(2.1, 0.16, 1.3, tint(P.tufa, 0.05), { at: [0, 1.1, 0] });
    b.box(1.3, 0.06, 0.6, P.timberBlack, { at: [0, 1.26, 0] });
    for (const dx of [-0.3, 0.05, 0.35]) b.cone(0.13, 0.32, P.doorYellow, { at: [dx, 1.3, b.range(-0.1, 0.1)], segs: 5 });
    pot(b, [1.25, 0.25, 0.55], 0.9, P.tileBrown);
    pot(b, [-1.2, 0.25, 0.6], 0.8, P.timberBlack);
    b.collider(2.6, 1.8);

    // a herm-like boundary stone and a sacred tree beside the altar
    b.box(0.35, 1.2, 0.35, P.peperino, { at: [2.8, 0, -1.1], rotY: 0.2 });
    b.tree(7.5, { at: [-3.4, 0, -1.2], kind: 'round', color: P.leafDark });
    b.collider(0.9, 0.9, { at: [-3.4, 0, -1.2] });

    // the watering trough: a hollowed log on two chocks
    b.group({ at: [-2.6, 0, -6.6], rotY: 0.1 }, () => {
      for (const x of [-1.1, 1.1]) b.box(0.3, 0.25, 0.7, P.oakDark, { at: [x, 0, 0] });
      b.box(3.2, 0.12, 0.62, P.oak, { at: [0, 0.2, 0] });
      for (const z of [-1, 1]) b.box(3.2, 0.42, 0.1, P.oak, { at: [0, 0.2, z * 0.26] });
      for (const x of [-1, 1]) b.box(0.1, 0.42, 0.62, P.oakDark, { at: [x * 1.55, 0.2, 0] });
      b.box(3.0, 0.02, 0.42, P.water, { at: [0, 0.52, 0], jitter: false });
    });
    b.collider(3.2, 0.8, { at: [-2.6, 0, -6.6] });

    // the dealers' hut, and a lean-to of poles and hides where salt and pots are traded
    hut(b, 7.4, -4.6, -0.5 + b.range(-0.15, 0.15));
    b.group({ at: [6.8, 0, 3.6], rotY: -0.2 }, () => {
      for (const sx of [-1, 1]) {
        b.box(0.1, 2.1, 0.1, P.oak, { at: [sx * 1.6, 0, 0.8] });
        b.box(0.1, 1.4, 0.1, P.oak, { at: [sx * 1.6, 0, -0.8] });
      }
      b.box(3.6, 0.05, 1.9, tint(P.mudbrick, -0.08), { at: [0, 1.72, 0], rot: [0.38, 0, 0] });
      // goods on mats: salt cakes, pots, bundles
      b.box(2.8, 0.03, 1.2, P.wattle, { at: [0, 0, 0.1] });
      goods(b, 2.6, [0, 0.03, -0.2], 0, ['pot', 'sack', 'basket']);
      for (let i = 0; i < 4; i++) b.box(0.3, 0.16, 0.22, P.chalk, { at: [-1.0 + i * 0.6, 0.03, 0.55] });
    });
    b.collider(3.4, 1.8, { at: [6.8, 0, 3.6], rotY: -0.2 });

    // a few olives at the edge of the ground
    b.tree(4.2, { at: [10.6, 0, -0.4], kind: 'olive' });
    b.tree(3.8, { at: [-11.0, 0, -8.2], kind: 'olive' });
  },
};
