import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { barrel, beam, beast, goods, hurdle, trestle } from './shared';

/** A trestle stall under a lean-to awning of hides on two forked poles. */
function awningStall(b: Builder, x: number, z: number, rotY: number, cover: number, kinds: ('basket' | 'sack' | 'pot' | 'cloth' | 'fruit')[]): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    const w = 2.8;
    trestle(b, w, 0.9, [0, 0, 0], 0, P.oak);
    goods(b, w - 0.4, [0, 0.88, 0], 0, kinds);
    // two tall poles at the back, two short at the front, hide cover between
    for (const s of [-1, 1]) {
      b.cyl(0.05, 2.3, P.bark, { at: [s * 1.45, 0, -0.75], segs: 5 });
      b.cyl(0.05, 1.8, P.bark, { at: [s * 1.45, 0, 0.75], segs: 5 });
    }
    b.group({ at: [0, 2.05, 0], rot: [0.32, 0, 0] }, () => b.box(3.1, 0.04, 1.75, cover));
  });
}

export const saxonMarket: BuildingDef = {
  id: 'saxon-market',
  name: 'Open market with preaching cross',
  style: 'Anglo-Saxon',
  date: 'c. 750 to 900',
  summary:
    'After Rome the stone market fell to ruin and trade went back to the open ground, now under the eye of the Church and the king’s reeve. ' +
    'A tall cross stands on a stepped base, a place to preach from and perhaps to swear bargains. Only stone crosses survive from this period, but many were probably of timber, like this one. ' +
    'Stalls are trestle tables under hide awnings, put up on market day and carried away at night. Everything is timber and wicker again: no tile, no mortar.',
  materials: ['oak', 'hazel wattle', 'cowhide', 'rubble stone'],
  lookFor: [
    { label: 'Preaching cross', note: 'A tall timber cross marking holy ground. An oath or a sale made at the cross was made in the sight of God.', at: [0, 5.4, 0.3] },
    { label: 'Stepped base', note: 'Rough stone steps that raise the cross above the crowd, and a place to stand and preach from.', at: [0, 0.8, 1.6] },
    { label: 'Trestle stall', note: 'A loose board on two trestles: a stall that could be set up at dawn and gone by dusk.', at: [-5.6, 1.4, 4.5] },
    { label: 'Hide awning', note: 'A cover of oiled leather on poles keeps rain off the goods.', at: [5.6, 2.5, 4.4] },
  ],
  influences: ['roman-christianity'],
  build(b) {
    b.noCollide();
    // trodden ground
    b.group({ scale: [1.1, 1, 0.85] }, () => b.cyl(9.5, 0.04, tint(P.earth, 0.06), { segs: 18 }));

    // stepped base of rough stone, three steps
    const stone = P.rubble;
    b.box(3.6, 0.35, 3.6, tint(stone, -0.04), { at: [0, 0.02, 0] });
    b.box(2.6, 0.35, 2.6, stone, { at: [0, 0.37, 0] });
    b.box(1.6, 0.35, 1.6, tint(stone, 0.04), { at: [0, 0.72, 0] });
    // the cross: squared oak shaft and arms
    const oak = P.oakDark;
    b.box(0.34, 5.4, 0.3, oak, { at: [0, 1.07, 0] });
    b.box(2.0, 0.34, 0.3, oak, { at: [0, 4.75, 0] });
    // a small gabled weather-board cap and carved bosses
    b.gable(0.5, 0.42, 0.22, P.shingle, { at: [0, 6.47, 0], ridge: 'z', overhang: 0.05 });
    for (const s of [-1, 1]) b.box(0.4, 0.42, 0.36, oak, { at: [s * 0.95, 4.71, 0] });
    b.box(0.42, 0.42, 0.38, oak, { at: [0, 4.71, 0] });
    b.panel(0.18, 2.6, tint(oak, 0.12), { at: [0, 1.6, 0.15], facing: '+z', depth: 0.03 }); // carved interlace strip
    b.panel(0.18, 2.6, tint(oak, 0.12), { at: [0, 1.6, -0.15], facing: '-z', depth: 0.03 });

    // stalls round the cross
    const covers = [P.oak, P.mud, tint(P.daub, -0.1), P.shingle];
    awningStall(b, -5.6, 4.2, 0.15, b.pick(covers), ['pot', 'pot', 'basket']);
    awningStall(b, 5.6, 4.2, -0.15, b.pick(covers), ['cloth', 'cloth', 'sack']);
    awningStall(b, -6.4, -1.2, Math.PI / 2 + 0.1, b.pick(covers), ['basket', 'fruit', 'basket']);
    awningStall(b, 6.4, -1.4, -Math.PI / 2, b.pick(covers), ['sack', 'basket', 'sack']);
    awningStall(b, -2.4, -5.6, Math.PI, b.pick(covers), ['pot', 'cloth', 'basket']);
    // an uncovered trestle
    trestle(b, 2.4, 0.8, [2.6, 0, -5.4], Math.PI - 0.2, P.oak);
    goods(b, 2.0, [2.6, 0.88, -5.4], Math.PI - 0.2, ['fruit', 'basket', 'fruit']);

    // barrels and a handcart
    barrel(b, [3.6, 0, 1.8]);
    barrel(b, [4.2, 0, 2.3], 0.9);
    b.group({ at: [-3.2, 0, 1.6], rotY: 0.5 }, () => {
      b.box(1.2, 0.3, 0.9, P.oak, { at: [0, 0.45, 0] });
      for (const s of [-1, 1]) b.log(0.35, 0.06, P.oakDark, { at: [0, 0.1, s * 0.5], axis: 'z', segs: 8 });
      for (const s of [-1, 1]) beam(b, [0.6, 0.55, s * 0.35], [1.7, 0.2, s * 0.35], 0.06, P.oak);
    });

    // pig pen of hurdles at the back right
    hurdle(b, 3, 0.85, [5.6, 0, -5.8]);
    hurdle(b, 3, 0.85, [5.6, 0, -3.6]);
    hurdle(b, 2.2, 0.85, [7.1, 0, -4.7], Math.PI / 2);
    hurdle(b, 2.2, 0.85, [4.1, 0, -4.7], Math.PI / 2);
    beast(b, [5.2, 0, -4.9], 0.4, 'pig');
    beast(b, [6.1, 0, -4.4], 2.6, 'pig');
    // a tethered cow
    beast(b, [-6.8, 0, -5.0], 1.2, 'cow');
    b.cyl(0.06, 1.1, P.bark, { at: [-7.8, 0, -5.4], segs: 5 });
  },
};
