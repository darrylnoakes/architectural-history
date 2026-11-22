import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { granary, heap, hurdles, patch, thatchRoof } from './shared';

/**
 * A sunken hut (fond de cabane): a pit about 3 m by 2.5 m and half a metre deep, roofed by a
 * thatched ridge roof that comes right down to the ground, carried on a post at each gable. The
 * gable ends are wattle, one with the door, reached by a step down. Ridge along local X, door at +x.
 */
function sunkenHut(b: Builder, x: number, z: number, turn: number, thatch: number, loom: boolean): void {
  const L = 3.6;
  const W = 3.4;
  const H = 2.6;
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    // the pit floor showing at the door, a little darker; spoil banked against the roof foot
    b.box(L + 0.6, 0.12, W + 0.5, P.soil, { jitter: false });
    // the roof: two slopes of thatch from the ground to the ridge
    b.gable(L, W, H, thatch, { at: [0, 0.05, 0], overhang: 0.25, thick: 0.35, wall: P.wattle });
    b.log(0.17, L + 0.6, tint(thatch, -0.12), { at: [0, H + 0.05, 0], segs: 6 });
    // gable posts poking out under the ridge
    for (const s of [-1, 1]) b.cyl(0.1, H + 0.35, P.oakDark, { at: [s * (L / 2 + 0.05), 0, 0], segs: 5 });
    // door in the +x gable, the step down in front of it
    b.panel(0.75, 1.3, P.timberBlack, { at: [L / 2 + 0.02, 0.05, 0], facing: '+x', depth: 0.05 });
    b.box(0.9, 0.06, 1.0, tint(P.soil, -0.06), { at: [L / 2 + 0.6, 0, 0], jitter: false });
    if (loom) {
      // seen through the door: the uprights of a warp-weighted loom against the back gable
      b.box(0.08, 1.5, 0.08, P.oak, { at: [-L / 2 + 0.4, 0.1, 0.55] });
      b.box(0.08, 1.5, 0.08, P.oak, { at: [-L / 2 + 0.4, 0.1, -0.55] });
    }
  });
}

/** A Frankish byre-house of earth-fast posts: long, low, walls of wattle and daub, a hipped thatch. */
function postHouse(b: Builder, x: number, z: number, turn: number, thatch: number): void {
  const L = 10.5;
  const W = 5.4;
  const wallH = 1.8;
  const daub = b.pick([P.daub, P.torchis, tint(P.daub, -0.04)]);
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    b.box(L, wallH, W, daub);
    b.box(L + 0.04, 0.2, W + 0.04, P.mud);
    for (let i = 0; i <= 8; i++) {
      const px = -L / 2 + (L * i) / 8;
      for (const s of [-1, 1]) b.box(0.18, wallH, 0.07, P.oakDark, { at: [px, 0, s * (W / 2 + 0.02)] });
    }
    // two doors facing each other across the middle; the byre end at -x has a wide one
    b.panel(0.9, 1.6, P.oakDark, { at: [0.6, 0, W / 2], facing: '+z', depth: 0.06 });
    b.panel(0.9, 1.6, P.oakDark, { at: [0.6, 0, -W / 2], facing: '-z', depth: 0.06 });
    b.panel(1.5, 1.6, P.oak, { at: [-L / 2, 0, 0], facing: '-x', depth: 0.06 });
    thatchRoof(b, L, W, 50, thatch, { at: [0, wallH, 0], hip: true, ov: 0.55 });
  });
}

export const sunkenHuts: BuildingDef = {
  id: 'sunken-huts',
  name: 'Frankish hamlet',
  style: 'Merovingian vernacular',
  date: 'c. 500',
  summary:
    'After the invasions the suburb of the Roman town was abandoned and its stone carted off to build the wall; when people settled outside again, under the Frankish kings, they lived as country people did. ' +
    'A family had a long house of earth-fast posts, wattle and daub and thatch, often with the cattle at one end, and round it a few sunken huts: shallow pits with a roof right down to the ground, used for weaving, storage and crafts because their damp, steady air kept wool and flax supple. ' +
    'Excavations on the edges of towns such as Reims, Soissons and Saint-Denis find dozens of these pits, with loom weights still lying in rows where the loom stood.',
  materials: ['oak posts', 'wattle and daub', 'thatch', 'earth'],
  lookFor: [
    { label: 'Sunken hut (fond de cabane)', note: 'A pit about half a metre deep under a roof that reaches the ground; the floor is below the doorstep.', at: [3.6, 2.8, -4.4] },
    { label: 'Gable post', note: 'A post at each end carries the ridge: two holes are all an archaeologist finds of the frame.', at: [5.5, 2.7, -4.0] },
    { label: 'Post-built long house', note: 'The family’s house on earth-fast posts, with a wide door at the byre end where the beasts were kept in winter.', at: [-6.4, 1.6, 4.0] },
    { label: 'Granary on posts', note: 'Grain was kept off the ground on four or six posts, a tradition unbroken since the Gauls.', at: [9.6, 2.4, 3.2] },
  ],
  build(b) {
    const thatch = b.pick([P.thatchOld, tint(P.thatchOld, -0.04), P.reed]);
    patch(b, 25.6, 15.6, mix(P.earth, P.grass, 0.25), [0, 0]);
    patch(b, 25.6, 2.0, tint(P.earth, -0.05), [0, 7.0], 0.05); // the road
    patch(b, 2.0, 6.0, tint(P.earth, -0.02), [1.0, 3.6], 0.045);

    postHouse(b, -6.4, 1.4 + b.range(-0.3, 0.3), b.range(-0.06, 0.06), thatch);
    sunkenHut(b, 3.6, -4.2, b.range(-0.25, 0.1), tint(thatch, 0.04), true);
    sunkenHut(b, 7.8 + b.range(-0.3, 0.3), 0.4, Math.PI * 0.55 + b.range(-0.2, 0.2), tint(thatch, -0.03), false);
    if (b.chance(0.6)) sunkenHut(b, -2.6, -5.6, -0.3 + b.range(-0.2, 0.2), tint(thatch, 0.02), b.chance(0.5));
    granary(b, 9.6, 4.0, 2.2, 1.9, tint(thatch, 0.05), { posts: b.chance(0.5) ? 6 : 4, rotY: b.range(-0.2, 0.2) });

    // the yard: a fenced garden plot, a dung heap, a hearth pit, fences of hurdles along the road
    hurdles(b, [-12.6, -1.8], [-12.6, -7.6]);
    hurdles(b, [-12.6, -7.6], [-5.8, -7.6]);
    hurdles(b, [-5.8, -7.6], [-5.8, -3.0]);
    patch(b, 6.4, 5.2, P.soil, [-9.2, -5.0], 0.06);
    for (let i = 0; i < 6; i++) b.box(5.8, 0.18, 0.25, P.leaf, { at: [-9.2, 0.06, -7.0 + i * 0.8] });
    hurdles(b, [-12.6, 5.8], [-3.0, 5.8], { h: 0.9 });
    hurdles(b, [4.6, 5.8], [12.6, 5.8], { h: 0.9 });
    heap(b, 0.8, -1.4, 0.8, P.mud);
    b.cyl(0.6, 0.12, P.rubble, { at: [11.0, 0, -3.6], segs: 8 });
    b.cyl(0.4, 0.13, P.timberBlack, { at: [11.0, 0, -3.6], segs: 8 });
    // a few squared blocks robbed from the ruins, reused as a step and a seat
    for (const [bx, bz] of [[-1.6, 4.0], [-0.6, 4.2]] as const) b.box(0.8, 0.4, 0.5, P.pierreBlonde, { at: [bx, 0, bz], rotY: b.range(-0.3, 0.3) });

    b.collider(11.0, 6.0, { at: [-6.4, 0, 1.4] });
    b.collider(4.0, 4.0, { at: [3.6, 0, -4.2] });
    b.collider(4.0, 4.0, { at: [7.8, 0, 0.4] });
    b.collider(2.4, 2.2, { at: [9.6, 0, 4.0] });
  },
};
