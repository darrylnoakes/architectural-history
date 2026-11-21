import { P, tint, type BuildingDef } from '@ah/kit';
import { hurdles, thickHip } from './shared';

const L = 23.2;
const D = 7.2;
const ZF = 3.4;
const PL = 0.3;
const G = 2.7;
const F = 2.55;
const H = PL + G + F;

export const councilCottages: BuildingDef = {
  id: 'council-cottages',
  name: 'Council cottages',
  style: 'Neo-Georgian cottage (Arts and Crafts influenced)',
  date: 'c. 1921',
  summary:
    'After the First World War the government promised "homes fit for heroes", and the 1919 Housing Act made councils build them with a state subsidy. ' +
    'They followed the Tudor Walters Report of 1918, much shaped by Raymond Unwin of the garden city movement: no more than twelve houses to the acre, wide fronts so every main room got sun, a bathroom, and gardens front and back. ' +
    'The result looks like a village cottage, a block of four under one big roof, and for many families it was the first home with a bath and a garden. ' +
    'For the first time the cheapest housing on the plot was built by the council, not by a landlord or a charity.',
  materials: ['roughcast render over brick', 'clay plain tile', 'painted timber casements'],
  lookFor: [
    { label: 'Block of four', note: 'Four houses under one roof, with the end houses marked by gables, so the group reads as one big cottage rather than a terrace.', at: [-8.7, 6.5, 3.95] },
    { label: 'Wide frontage', note: 'Each house is far wider than a Victorian terraced house, so more of its rooms get windows and sunlight.', at: [-2.9, 1.5, 3.45] },
    { label: 'Small-paned casements', note: 'Cottage-style windows with many panes, set high under the deep eaves.', at: [2.3, 4.0, 3.45] },
    { label: 'Big hipped roof and chimneys', note: 'A steep plain-tile roof and massive stacks: the comfortable look of the Arts and Crafts country house, done cheaply.', at: [-3, 8.2, 1.2] },
    { label: 'Front garden and hedge', note: 'Tudor Walters asked for gardens front and back; the privet hedge became a council estate trademark.', at: [6, 1.0, 6.6] },
  ],
  influences: ['arts-and-crafts-export'],
  build(b) {
    const rendered = b.variant === 0 || b.chance(0.65);
    const brick = b.pick([P.brickRed, P.brickOrange, tint(P.brickRed, 0.04)]);
    const wall = rendered ? b.pick([P.pebbledash, P.cream, tint(P.pebbledash, 0.04)]) : brick;
    const tile = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, 0.04)]);
    const joinery = b.pick([P.white, P.cream]);
    const doors = [P.doorGreen, P.doorBlue, P.doorRed, P.oakDark];
    const zc = ZF - D / 2;
    const hw = L / 4;

    // plinth of brick, walls, eaves; one big hipped roof over the four
    b.box(L + 0.08, PL + 0.25, D + 0.08, brick, { at: [0, 0, zc] });
    b.box(L, H, D, wall, { at: [0, 0, zc] });
    const rh = (D / 2) * Math.tan((47 * Math.PI) / 180);
    thickHip(b, L, D, rh, tile, { at: [0, H, zc], ov: 0.45, t: 0.18 });
    // end houses: front gables rising into the roof
    b.sym((s) => {
      const gx = s * (L / 2 - hw / 2);
      const gw = 4.4;
      b.box(gw, H, 0.5, wall, { at: [gx, 0, ZF + 0.25] });
      b.box(gw + 0.08, PL + 0.25, 0.58, brick, { at: [gx, 0, ZF + 0.25] });
      b.gable(gw, 4.4, 2.3, tile, { at: [gx, H, ZF - 1.4], ridge: 'z', overhang: 0.3, thick: 0.16, wall });
    });
    // stacks: on the ridge at the party walls, each serving two houses
    for (const x of [-hw, 0, hw]) b.chimney(1.3, rh + 0.8, 0.8, brick, { at: [x, H + 0.5, zc], pots: 4 });

    for (let i = 0; i < 4; i++) {
      const x = -L / 2 + hw * (i + 0.5);
      const end = i === 0 || i === 3;
      const s = x < 0 ? -1 : 1;
      const zf = end ? ZF + 0.5 : ZF;
      // door with a little canopy on brackets, towards the middle of the block for the end houses
      const dx = end ? x - s * 2.05 : x + s * 1.6;
      b.panel(0.95, 2.05, b.pick(doors), { at: [dx, PL, end ? ZF : ZF], facing: '+z', depth: 0.08 });
      b.box(1.4, 0.1, 0.65, tile, { at: [dx, PL + 2.25, (end ? ZF : ZF) + 0.32] });
      b.sym((k) => b.box(0.08, 0.35, 0.5, joinery, { at: [dx + k * 0.6, PL + 1.92, (end ? ZF : ZF) + 0.25] }));
      b.box(1.2, 0.15, 0.5, P.concrete, { at: [dx, 0, (end ? ZF : ZF) + 0.25] });
      // ground-floor three-light casement, upstairs two casements under the eaves
      const wx = end ? x + s * 0.2 : x - s * 0.6;
      b.window(1.9, 1.35, { at: [wx, PL + 0.85, zf], facing: '+z', frame: joinery, bars: [3, 3], border: 0.08 });
      b.box(2.1, 0.08, 0.14, P.tileRed, { at: [wx, PL + 0.78, zf + 0.06] });
      b.window(1.45, 1.15, { at: [wx, PL + G + 0.45, zf], facing: '+z', frame: joinery, bars: [2, 3], border: 0.08 });
      if (!end) b.window(0.7, 0.85, { at: [dx, PL + G + 0.6, ZF], facing: '+z', frame: joinery, bars: [1, 2], border: 0.07 });
      // back: scullery outshot under a lean-to, windows and back door
      const bx = x - s * 0.9;
      b.box(2.6, 2.6, 1.3, wall, { at: [bx, 0, ZF - D - 0.65] });
      b.shed(2.8, 1.45, 0.5, tile, { at: [bx, 2.6, ZF - D - 0.72], high: '+z' });
      b.panel(0.85, 2.0, b.pick(doors), { at: [bx + 0.5, PL, ZF - D - 1.3], facing: '-z' });
      b.window(0.8, 0.8, { at: [bx - 0.65, 1.3, ZF - D - 1.3], facing: '-z', frame: joinery, bars: [2, 2] });
      b.window(1.5, 1.25, { at: [x + s * 1.4, PL + 0.85, ZF - D], facing: '-z', frame: joinery, bars: [3, 3], border: 0.08 });
      b.window(1.3, 1.1, { at: [x + s * 1.4, PL + G + 0.45, ZF - D], facing: '-z', frame: joinery, bars: [2, 3], border: 0.08 });
      b.window(0.7, 0.85, { at: [bx, PL + G + 0.55, ZF - D], facing: '-z', frame: joinery, bars: [1, 2], border: 0.07 });

      // front garden: lawn, path to the door, hedge with a gate gap
      b.box(0.9, 0.05, 7 - ZF - 0.3, P.paving, { at: [dx, 0, (7 + ZF + 0.3) / 2] });
      const left = x - hw / 2 + 0.15;
      const right = x + hw / 2 - 0.15;
      if (dx - 0.6 > left) b.box(dx - 0.6 - left, 0.95, 0.55, P.hedge, { at: [(left + dx - 0.6) / 2, 0, 6.6] });
      if (right > dx + 0.6) b.box(right - dx - 0.6, 0.95, 0.55, P.hedge, { at: [(right + dx + 0.6) / 2, 0, 6.6] });
      b.box(0.9, 0.9, 0.05, joinery, { at: [dx, 0, 6.6] });
      if (i > 0) b.box(0.4, 0.75, 7 - ZF - 0.9, P.hedge, { at: [x - hw / 2, 0, (7 + ZF + 0.5) / 2] });
      // back garden: fences and a vegetable plot
      if (i > 0) hurdles(b, [x - hw / 2, ZF - D], [x - hw / 2, -6.9], { h: 1.2, color: tint(P.oakSilver, -0.08), post: P.oakSilver });
      b.box(4.2, 0.25, 0.5, b.pick([P.leaf, P.leafDark]), { at: [x, 0, -6.35] });
    }
    hurdles(b, [-L / 2, -6.9], [L / 2, -6.9], { h: 1.2, color: tint(P.oakSilver, -0.08), post: P.oakSilver });
    b.box(L, 0.03, 7 - ZF, P.grass, { at: [0, 0, (7 + ZF) / 2] });
  },
};
