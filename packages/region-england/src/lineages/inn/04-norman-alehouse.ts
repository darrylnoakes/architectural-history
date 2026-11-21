import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { aleStake, barrel, ground, trestle } from './shared';

const W = 13; // hall length (X)
const D = 6.4; // hall width (Z)
const H = 2.7; // eaves
const HX = -2.4;
const HZ = -1.6;
const RISE = 3.9; // about 50 degrees

export const normanAlehouse: BuildingDef = {
  id: 'norman-alehouse',
  name: 'Alehouse with brewhouse',
  style: 'Norman vernacular',
  date: '12th century',
  summary:
    'As the town grew round its market, so did its alehouse. This is a long timber-framed hall with wattle-and-daub panels, limewashed against the weather, under a steep gabled roof of thatch. ' +
    'There is still no chimney: smoke from the open hearth rises to a louvre on the ridge. ' +
    'Brewing has moved out of the living room into a lean-to brewhouse with its own fire and a big metal vessel for heating water and wort, a sign that ale was becoming a trade, very often run by a woman, the alewife.',
  materials: ['oak posts', 'wattle and daub', 'limewash', 'straw thatch'],
  lookFor: [
    { label: 'Lean-to brewhouse', note: 'A single-slope roof against the gable end, sheltering the brewing fire and its big metal vessel.', at: [HX + W / 2 + 1.8, 2.7, HZ] },
    { label: 'Smoke louvre', note: 'A little hooded vent on the ridge. The hall had an open hearth in the middle of the floor and no chimney.', at: [HX - 1, H + RISE + 0.9, HZ] },
    { label: 'Wattle and daub', note: 'Panels of woven hazel daubed with clay between the oak posts, then limewashed white.', at: [HX - 4.5, 1.4, HZ + D / 2 + 0.1] },
    { label: 'Ale-stake', note: 'The bush on a pole is still the sign of a new brew, now big enough to be seen across the market.', at: [HX + 2.9, 2.6, HZ + D / 2 + 3.1] },
    { label: 'Shuttered windows', note: 'Unglazed openings closed with timber shutters. Glass was far too costly for an alehouse.', at: [HX - 3.2, 1.8, HZ + D / 2 + 0.3] },
  ],
  build(b) {
    const daub = b.pick([P.limewash, tint(P.limewash, -0.03), P.plaster]);
    const post = b.pick([P.oak, tint(P.oak, -0.04)]);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.04)]);

    ground(b, 21.4, 21.4, tint(P.earth, 0.05), [0, 0]);

    b.group({ at: [HX, 0, HZ] }, () => {
      // rubble footing, daubed walls, exposed posts and rails
      b.box(W + 0.2, 0.3, D + 0.2, P.rubble);
      b.box(W, H, D, daub);
      b.frame(W, H - 0.3, post, { at: [0, 0.3, D / 2], facing: '+z', studs: 6, rails: 1, beam: 0.2 });
      b.frame(W, H - 0.3, post, { at: [0, 0.3, -D / 2], facing: '-z', studs: 6, rails: 1, beam: 0.2 });
      b.frame(D, H - 0.3, post, { at: [-W / 2, 0.3, 0], facing: '-x', studs: 2, rails: 1, beam: 0.2 });
      // gable: daub triangle, steep thatch, louvre
      b.gable(W, D, RISE, thatch, { at: [0, H, 0], overhang: 0.55, thick: 0.45, wall: daub });
      b.box(W + 1.1, 0.25, 0.5, tint(thatch, -0.12), { at: [0, H + RISE + 0.2, 0] });
      b.group({ at: [-1, H + RISE + 0.2, 0] }, () => {
        b.box(0.9, 0.6, 0.9, P.oakDark);
        b.pyramid(1.3, 1.3, 0.55, thatch, { at: [0, 0.6, 0] });
      });
      // door in the long front wall, plank door
      b.panel(1.2, 2.0, P.oakDark, { at: [0.9, 0.3, D / 2 + 0.05], facing: '+z', depth: 0.1 });
      b.panel(1.0, 1.85, tint(post, 0.05), { at: [0.9, 0.3, D / 2 + 0.1], facing: '+z', depth: 0.06 });
      // shuttered window openings, one shutter propped open on each
      for (const x of [-4.4, -2.0, 3.6]) {
        b.panel(0.9, 0.7, P.windowDark, { at: [x, 1.45, D / 2 + 0.05], facing: '+z', depth: 0.08 });
        b.box(0.9, 0.06, 0.6, post, { at: [x, 2.13, D / 2 + 0.35], rot: [-0.5, 0, 0] });
      }
      for (const x of [-3.5, 2.5]) b.panel(0.9, 0.7, tint(post, 0.04), { at: [x, 1.45, -D / 2 - 0.05], facing: '-z', depth: 0.08 });
      b.panel(1.1, 1.95, P.oakDark, { at: [-2.5, 0.3, -D / 2 - 0.05], facing: '-z', depth: 0.1 });
      b.panel(0.8, 0.6, tint(post, 0.04), { at: [-W / 2 - 0.05, 1.6, 0], facing: '-x', depth: 0.08 });

      // ---- lean-to brewhouse against the east gable
      const lw = 3.6;
      const lx = W / 2 + lw / 2;
      b.box(lw, 2.1, D - 0.6, daub, { at: [lx, 0, 0] });
      b.frame(D - 0.6, 1.8, post, { at: [W / 2 + lw, 0.3, 0], facing: '+x', studs: 2, rails: 0, beam: 0.18 });
      b.shed(lw + 0.5, D, 1.6, thatch, { at: [lx + 0.2, 2.1, 0], high: '-x' });
      b.shed(lw + 0.5, D - 0.2, 1.6, thatch, { at: [lx + 0.2, 2.1 + 0.35, 0], high: '-x' });
      // wide opening on the front, showing the copper on its hearth
      b.panel(2.2, 1.8, P.windowDark, { at: [lx, 0, (D - 0.6) / 2 + 0.02], facing: '+z', depth: 0.06 });
      b.box(0.9, 0.5, 0.9, P.rubble, { at: [lx, 0, D / 2 - 0.6] });
      b.lathe([[0.01, 0], [0.38, 0.02], [0.45, 0.3], [0.42, 0.55], [0.46, 0.58]], P.bronze, { at: [lx, 0.5, D / 2 - 0.6], segs: 10 });
      b.cyl(0.08, 1.5, P.rubble, { at: [lx + 1.0, 2.2, -1.0], segs: 6 });
    });

    aleStake(b, [HX + 2.0, 1.85, HZ + D / 2 + 0.02], 0.25, 3.2, 0.6);

    // ---- outside: drinkers' benches, barrels, a well and a cart
    trestle(b, [-5.0, 0, 5.2], 0.05);
    trestle(b, [1.6, 0, 6.2], -0.12);
    for (const [x, z] of [[HX + W / 2 + 3.9, HZ + 2.6], [HX + W / 2 + 4.2, HZ + 1.8], [HX + W / 2 + 3.6, HZ + 1.6]]) barrel(b, [x, 0, z]);
    barrel(b, [HX + W / 2 + 3.9, 0.15, HZ + 2.2], tint(P.oak, 0.05), false);
    // well
    b.cyl(0.75, 0.8, P.rubble, { at: [7.4, 0, 6.6], segs: 10 });
    b.cyl(0.55, 0.05, P.windowDark, { at: [7.4, 0.78, 6.6], segs: 10 });
    b.sym((s) => b.box(0.12, 1.7, 0.12, P.oak, { at: [7.4 + s * 0.65, 0.8, 6.6] }));
    b.gable(1.6, 1.2, 0.5, thatch, { at: [7.4, 2.5, 6.6], overhang: 0.1 });
    // hand-cart
    b.group({ at: [-8.4, 0, -6.6], rotY: 0.4 }, () => {
      b.box(1.6, 0.4, 1.0, P.oak, { at: [0, 0.6, 0] });
      b.sym((s) => b.log(0.45, 0.08, P.oakDark, { at: [0, 0.15, s * 0.6], axis: 'z', segs: 10 }));
      b.sym((s) => b.box(1.4, 0.08, 0.08, P.oak, { at: [1.4, 0.7, s * 0.35] }));
    });
    // stack of firewood for the brewing fire
    for (let i = 0; i < 4; i++) b.log(0.12, 1.6, P.bark, { at: [HX + W / 2 + 2, 0, HZ - D / 2 - 1.0 - i * 0.26], segs: 6 });
    b.tree(7.5, { at: [-8.6, 0, 7.8] });

    b.collider(W + 3.6, D, { at: [HX + 1.8, 0, HZ] });
    b.collider(1.6, 1.6, { at: [7.4, 0, 6.6] });
  },
};
