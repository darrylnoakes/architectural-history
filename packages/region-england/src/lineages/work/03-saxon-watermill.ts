import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, WATER, waterwheel, water } from './shared';

export const saxonWatermill: BuildingDef = {
  id: 'saxon-watermill',
  name: 'Horizontal watermill',
  style: 'Anglo-Saxon',
  date: 'c. 850',
  summary:
    'Grinding grain by hand in a quern took hours every day; a watermill did it for a whole settlement. ' +
    'Some early English mills, like the one excavated at Tamworth, used a horizontal wheel: a jet of water from a steep wooden chute struck paddles on a vertical shaft, ' +
    'which turned the upper millstone directly in the room above, with no gears at all. The mill is small, timber-built and thatched, ' +
    'but behind it is real engineering: an embanked millpond to store a head of water, and a sluice to let it go.',
  materials: ['oak planks', 'straw thatch', 'earth banks', 'millstones'],
  modelledOn: 'Loosely after the excavated 9th-century mill at Tamworth, Staffordshire; the layout is simplified',
  lookFor: [
    { label: 'Horizontal wheel', note: 'Paddles round a vertical shaft, spinning flat like a top beneath the floor. The shaft drives the millstone directly.', at: [2.4, -0.4, -12.2] },
    { label: 'Chute (flume)', note: 'A steep wooden trough that narrows the water into a fast jet aimed at the paddles.', at: [6.5, 0.6, -12.3] },
    { label: 'Millpond', note: 'Banked up with earth and lined with timber, it stores water so the mill can run even when the stream is low.', at: [10.3, 1.6, -3] },
    { label: 'Sluice gate', note: 'A board that slides up and down in a timber frame to start and stop the flow.', at: [9, 2.4, -10.6] },
    { label: 'Thatched roof', note: 'Steeply pitched so rain runs off the straw quickly.', at: [2.4, 5.4, -8] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld]);
    const timber = b.pick([P.oak, tint(P.oak, 0.04)]);

    // ---- the mill: a small plank-walled building jutting out over the river on posts
    const mx = 2.4;
    const mz = -9.6;
    const W = 5.2;
    const D = 5.4;
    const fl = 0.5; // floor level
    const H = 2.6;
    // posts under the river end, standing in the water
    for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) {
      for (const z of [-D / 2 + 0.2, -D / 2 + 1.4]) b.box(0.28, fl - WATER + 0.5, 0.28, P.oakDark, { at: [mx + x, WATER - 0.5, mz + z] });
    }
    // a sill beam frame and the floor
    b.box(W, 0.3, D, P.oakDark, { at: [mx, fl - 0.3, mz] });
    // landward footing of turf and stone
    b.box(W + 0.4, fl - 0.3, D - 1.6, P.rubble, { at: [mx, 0, mz + 0.8] });
    // plank walls with corner posts and studs
    b.box(W, H, D, timber, { at: [mx, fl, mz] });
    b.sym((s) => b.frame(D, H, P.oakDark, { at: [mx + (s * W) / 2, fl, mz], facing: s > 0 ? '+x' : '-x', studs: 6, rails: 0, beam: 0.12 }));
    b.sym((s) => b.frame(W, H, P.oakDark, { at: [mx, fl, mz + (s * D) / 2], facing: s > 0 ? '+z' : '-z', studs: 5, rails: 0, beam: 0.12 }));
    // door and shutter
    b.panel(1.1, 1.9, P.oakDark, { at: [mx - 0.9, fl, mz + D / 2 + 0.05], facing: '+z' });
    b.panel(0.6, 0.5, P.timberBlack, { at: [mx + 1.3, fl + 1.3, mz + D / 2 + 0.05], facing: '+z' });
    b.panel(0.6, 0.5, P.timberBlack, { at: [mx, fl + 1.3, mz - D / 2 - 0.05], facing: '-z' });
    b.stairs(1.2, fl, 0.8, 2, P.oakDark, { at: [mx - 0.9, 0, mz + D / 2 + 0.4] });
    // steep thatch, about 50 degrees
    b.gable(W, D, 3.2, thatch, { at: [mx, fl + H, mz], overhang: 0.5, thick: 0.4, wall: timber });

    // ---- the horizontal wheel under the river end, on its vertical shaft
    const wz = mz - D / 2 + 0.7;
    waterwheel(b, { at: [mx, -0.55, wz], r: 0.85, width: 0.4, kind: 'horizontal', paddles: 12, color: P.oakDark });
    b.cyl(0.11, fl + 0.5, P.oakDark, { at: [mx, -0.55, wz], segs: 6 });
    // a splash of white water under the wheel
    b.blob(0.6, tint(P.water, 0.2), { at: [mx, WATER + 0.02, wz], stretch: [1.6, 0.15, 1.2], mat: 'glass' });

    // ---- millpond: an earth-banked pond lined with timber, raised above the plot
    const px = 10.3;
    const pz = -3;
    const pw = 10;
    const pd = 12;
    const ph = 1.3;
    b.box(pw, ph - 0.25, pd, P.earth, { at: [px, 0, pz] });
    water(b, pw - 1.4, pd - 1.4, [px, ph - 0.25, pz]);
    // turf banks all round
    b.sym((s) => {
      b.extrude([[-0.9, 0], [0.9, 0], [0.35, ph], [-0.35, ph]], pd, P.turf, { at: [px + s * (pw / 2 - 0.35), 0, pz] });
      b.extrude([[-0.9, 0], [0.9, 0], [0.35, ph], [-0.35, ph]], pw, P.turf, { at: [px, 0, pz + s * (pd / 2 - 0.35)], rotY: Math.PI / 2 });
    });
    // timber lining on the inside of the banks
    b.box(pw - 1.3, 0.35, 0.1, P.oakDark, { at: [px, ph - 0.4, pz + pd / 2 - 0.7] });
    b.box(pw - 1.3, 0.35, 0.1, P.oakDark, { at: [px, ph - 0.4, pz - pd / 2 + 0.7] });
    // the leat bringing water in from upstream (off the plot to the right)
    b.box(2.4, ph - 0.25, 2.4, P.earth, { at: [px + pw / 2 + 1.1, 0, pz + 2] });
    water(b, 2.4, 1.2, [px + pw / 2 + 1.1, ph - 0.25, pz + 2]);
    b.sym((s) => b.box(2.4, ph, 0.6, P.turf, { at: [px + pw / 2 + 1.1, 0, pz + 2 + s * 0.9] }));

    // ---- sluice and chute: out of the back of the pond, then steeply down to the wheel
    const sx = 9;
    const sz = pz - pd / 2;
    b.box(1.0, ph, 1.6, P.earth, { at: [sx, 0, sz - 0.5] });
    b.box(0.7, 0.1, 1.6, P.oak, { at: [sx, ph - 0.3, sz - 0.5] });
    b.sym((s) => b.box(0.18, 1.5, 0.18, P.oakDark, { at: [sx + s * 0.45, ph - 0.3, sz - 0.6] }));
    b.box(1.1, 0.16, 0.2, P.oakDark, { at: [sx, ph + 1.1, sz - 0.6] });
    b.box(0.72, 0.8, 0.06, P.oak, { at: [sx, ph + 0.05, sz - 0.6] }); // the gate, half raised
    // trough out to the bank edge
    const cz = wz - 0.6;
    b.box(0.8, 0.12, sz - 1.3 - cz + 0.4, P.oak, { at: [sx, ph - 0.4, (sz - 1.3 + cz) / 2] });
    b.sym((s) => b.box(0.1, 0.4, sz - 1.3 - cz + 0.4, P.oakDark, { at: [sx + s * 0.4, ph - 0.4, (sz - 1.3 + cz) / 2] }));
    // the chute: a sloping trough along the river edge, narrowing to the wheel
    const x0 = sx + 0.4;
    const x1 = mx + 0.9;
    const y0 = ph - 0.4;
    const y1 = -0.35;
    const len = Math.hypot(x0 - x1, y0 - y1);
    const ang = Math.atan2(y0 - y1, x0 - x1);
    b.group({ at: [(x0 + x1) / 2, (y0 + y1) / 2, cz], rot: [0, 0, ang] }, () => {
      b.box(len, 0.1, 0.6, P.oak, { at: [0, -0.05, 0] });
      b.sym((s) => b.box(len, 0.4, 0.08, P.oakDark, { at: [0, -0.05, s * 0.3] }));
      b.box(len - 0.6, 0.04, 0.45, P.water, { at: [0.3, 0.05, 0], mat: 'glass', jitter: false });
    });
    // trestles holding the chute up out of the water
    for (const t of [0.25, 0.55, 0.85]) {
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      b.box(0.18, y - WATER + 0.3, 0.18, P.oakDark, { at: [x, WATER - 0.4, cz] });
    }

    // ---- yard: a hurdle fence, sacks of grain waiting, a tree by the pond
    for (let i = 0; i < 3; i++) b.blob(0.3, P.wattle, { at: [mx - 2.4 + i * 0.55, 0.3, mz + D / 2 + 1.2], stretch: [1, 1.3, 1] });
    for (let i = 0; i < 14; i++) b.cyl(0.05, 1.0, P.wattle, { at: [-16 + i * 1.6, 0, 6], segs: 4 });
    b.box(20.8, 0.55, 0.08, P.wattle, { at: [-5.6, 0.35, 6] });
    b.tree(7, { at: [-10, 0, -4] });
    b.tree(5.5, { at: [5.5, 0, 6.5], kind: 'round' });

    b.collider(W, D, { at: [mx, 0, mz] });
    b.collider(pw + 1.8, pd + 1.8, { at: [px, 0, pz] });
  },
};
