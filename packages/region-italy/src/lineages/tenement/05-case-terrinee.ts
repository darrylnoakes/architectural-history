import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdles, patch, patchwork, wellHead } from './shared';

/**
 * One single-storey house: a socle of reused brick and stone, clay walls on a timber frame, a thatched
 * or shingled roof with the ridge along X. The door faces +Z. `at` is the centre of the floor.
 */
function terrinea(b: Builder, x: number, z: number, w: number, d: number, roofKind: 'thatch' | 'shingle'): void {
  const wh = 2.4;
  const socle = 0.85;
  const clay = b.pick([P.daub, P.cob, tint(P.daub, -0.05), P.mudbrick]);
  const post = P.oakDark;
  b.group({ at: [x, 0, z] }, () => {
    // socle of reused material on all four sides
    patchwork(b, w, socle, 0.45, [0, 0, d / 2 - 0.22]);
    patchwork(b, w, socle, 0.45, [0, 0, -d / 2 + 0.22]);
    patchwork(b, d - 0.9, socle, 0.45, [-w / 2 + 0.22, 0, 0], true);
    patchwork(b, d - 0.9, socle, 0.45, [w / 2 - 0.22, 0, 0], true);
    // clay walls above, with the posts of the frame showing
    b.box(w - 0.1, wh - socle, d - 0.1, clay, { at: [0, socle, 0] });
    b.box(w - 0.5, socle, d - 0.5, clay, { at: [0, 0, 0] });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box(0.18, wh - socle, 0.18, post, { at: [(sx * (w - 0.1)) / 2, socle, (sz * (d - 0.1)) / 2] });
    }
    b.box(0.16, wh - socle, 0.14, post, { at: [0, socle, d / 2 - 0.02] });
    b.box(w, 0.16, 0.16, post, { at: [0, wh - 0.16, d / 2 - 0.02] });
    b.box(w, 0.16, 0.16, post, { at: [0, wh - 0.16, -d / 2 + 0.02] });
    // the door, a step of a reused column drum, a small unglazed window with a board shutter
    const dx = -w / 4;
    b.panel(0.95, 1.9, post, { at: [dx, 0.05, d / 2], facing: '+z', depth: 0.07 });
    b.panel(0.8, 1.8, b.pick([P.oak, P.oakSilver]), { at: [dx, 0.08, d / 2], facing: '+z', depth: 0.1 });
    b.cyl(0.4, 0.2, P.marble, { at: [dx, 0, d / 2 + 0.35], segs: 9 });
    b.panel(0.55, 0.45, P.timberBlack, { at: [w / 4, 1.3, d / 2], facing: '+z', depth: 0.06 });
    b.panel(0.3, 0.45, P.oak, { at: [w / 4 + 0.45, 1.3, d / 2], facing: '+z', depth: 0.08 });
    b.panel(0.8, 1.8, P.oak, { at: [w / 4, 0.05, -d / 2], facing: '-z', depth: 0.08 }); // back door to the garden
    // roof
    if (roofKind === 'thatch') {
      const rh = (d / 2) * Math.tan((47 * Math.PI) / 180);
      b.gable(w, d, rh, P.thatchOld, { at: [0, wh, 0], overhang: 0.5, thick: 0.38, wall: clay });
      b.log(0.2, w + 1.0, tint(P.thatchOld, -0.1), { at: [0, wh + rh + 0.2, 0], segs: 6 });
    } else {
      const rh = (d / 2) * Math.tan((33 * Math.PI) / 180);
      b.gable(w, d, rh, P.shingle, { at: [0, wh, 0], overhang: 0.4, thick: 0.14, wall: clay });
      // courses of shingles
      for (let k = 1; k < 5; k++) {
        const t = k / 5;
        for (const s of [-1, 1]) b.box(w + 0.8, 0.04, 0.06, tint(P.shingle, -0.12), { at: [0, wh + rh * (1 - t) + 0.12 - 0.02, s * (d / 2) * t], jitter: false });
      }
      b.box(w + 0.85, 0.12, 0.3, P.oakDark, { at: [0, wh + rh + 0.06, 0] });
    }
    // a smoke hole: a small hooded gap at one gable end
    b.panel(0.5, 0.4, P.timberBlack, { at: [w / 2, wh + 0.4, 0], facing: '+x', depth: 0.04 });
  });
}

export const caseTerrinee: BuildingDef = {
  id: 'case-terrinee',
  name: 'Single-storey houses (domus terrineae)',
  style: 'Early medieval vernacular',
  date: 'c. 850',
  summary:
    'By the ninth century the town was a scatter of houses, gardens and vineyards inside the old walls. Leases and sales in the church archives call the simplest of them domus terrineae: single-storey houses, as against the two-storey domus solaratae of the better off. ' +
    'They were built of whatever came to hand: a footing of brick and stone pulled from the Roman ruins, walls of clay on a timber frame, a roof of thatch or wooden shingles where the Romans had used tiles. ' +
    'Behind each one is the most valuable thing a poor family had, its vegetable garden (orto), with a shared well.',
  materials: ['reused Roman brick and stone', 'clay on a timber frame', 'straw thatch', 'oak or chestnut shingles'],
  lookFor: [
    { label: 'Footing of reused Roman brick', note: 'The base of the wall is a patchwork of brick, tufa and marble from the ruins.', at: [-9.0, 0.5, 4.2] },
    { label: 'Clay walls on a timber frame', note: 'Above the footing the walls are clay packed round posts, the posts left showing at corners and doors.', at: [0.5, 1.7, 3.8] },
    { label: 'Thatch and shingle roofs', note: 'Steep roofs of straw or wooden shingles: fired tile had become too dear for the poor.', at: [8.5, 4.0, 1.2] },
    { label: 'Vegetable gardens', note: 'Each house had its orto behind, fenced with wattle; these plots appear in almost every lease of the period.', at: [-1.5, 0.6, -4.6] },
    { label: 'Column drum doorstep', note: 'A slice of a Roman column serves as a step: the ruins were a quarry for everything.', at: [-10.3, 0.4, 4.6] },
  ],
  influences: [],
  build(b) {
    patch(b, 26, 16, tint(P.earth, 0.05), [0, 0], 0.02);
    // the lane in front
    patch(b, 26, 2.6, tint(P.earth, -0.06), [0, 6.7], 0.04);

    const z = 2.1;
    const kinds: ('thatch' | 'shingle')[] = b.chance(0.5) ? ['thatch', 'shingle', 'thatch'] : ['thatch', 'thatch', 'shingle'];
    terrinea(b, -8.6, z, 6.0, 4.2, kinds[0]);
    terrinea(b, 0.4, z + 0.3, 5.6, 4.0, kinds[1]);
    terrinea(b, 8.8, z - 0.1, 6.2, 4.4, kinds[2]);

    // gardens behind: beds of greens and beans, fences between the plots
    for (const gx of [-8.6, 0.4, 8.8]) {
      for (let k = 0; k < 4; k++) {
        patch(b, 4.4, 0.6, P.soil, [gx, -1.6 - k * 1.25], 0.1);
        for (let j = 0; j < 4; j++) b.blob(0.22, b.pick([P.leaf, P.leafDark, P.hedge]), { at: [gx - 1.6 + j * 1.05, 0.18, -1.6 - k * 1.25], detail: 0 });
      }
    }
    for (const fx of [-4.2, 4.6]) hurdles(b, [fx, -0.6], [fx, -7.2], { h: 0.95 });
    hurdles(b, [-12.6, -7.4], [12.6, -7.4], { h: 0.95 });
    // bean poles in one plot
    for (let k = 0; k < 6; k++) {
      const px = 7.0 + (k % 3) * 0.8;
      const pz = -5.4 - Math.floor(k / 3) * 0.9;
      b.beam([px, 0, pz], [px + 0.2, 1.8, pz + 0.1], 0.04, 0.04, P.oakSilver);
    }
    // a shared well at the edge of the gardens, a fig tree, a pig in a little sty
    wellHead(b, -4.2, 5.8, P.tufa);
    b.tree(4.2, { at: [-0.6, 0, -6.4], kind: 'round', color: P.leafDark });
    b.box(2.0, 0.8, 1.6, P.oakSilver, { at: [11.6, 0, -2.0] });
    b.shed(2.2, 1.8, 0.5, P.thatchOld, { at: [11.6, 0.8, -2.0], high: '-z' });
    b.group({ at: [10.9, 0.05, -0.6], rotY: 0.3 }, () => {
      for (const [lx, lz] of [
        [0.22, 0.12],
        [0.22, -0.12],
        [-0.22, 0.12],
        [-0.22, -0.12],
      ]) b.box(0.07, 0.25, 0.07, tint(P.pinkWash, -0.15), { at: [lx, 0, lz] });
      b.blob(0.3, tint(P.pinkWash, -0.12), { at: [0, 0.42, 0], stretch: [1.6, 0.85, 0.95], detail: 0 });
      b.box(0.2, 0.2, 0.2, tint(P.pinkWash, -0.15), { at: [0.5, 0.33, 0] });
    });
    // a stack of firewood and a bread oven shared by the households
    b.dome(0.9, P.mud, { at: [4.8, 0.3, 5.9], squash: 0.85, segs: 8 });
    b.box(2.0, 0.3, 2.0, P.rubble, { at: [4.8, 0, 5.9] });
    b.panel(0.45, 0.4, P.timberBlack, { at: [4.8, 0.35, 6.8], facing: '+z', shape: 'round', depth: 0.05 });
    for (let i = 0; i < 4; i++) b.log(0.1, 1.5, P.bark, { at: [-12.0, i < 3 ? 0 : 0.18, 3.2 + (i % 3) * 0.22], axis: 'x', segs: 5 });

    b.collider(6.1, 4.3, { at: [-8.6, 0, z] });
    b.collider(5.7, 4.1, { at: [0.4, 0, z + 0.3] });
    b.collider(6.3, 4.5, { at: [8.8, 0, z - 0.1] });
  },
};
