import { P, tint, type BuildingDef } from '@ah/kit';
import { beam, hurdle } from './shared';

export const roundhouse: BuildingDef = {
  id: 'roundhouse',
  name: 'Roundhouse',
  style: 'Iron Age',
  date: 'c. 500 BC',
  summary:
    'For more than a thousand years most people in Britain lived in round houses like this one. A ring of stakes woven with hazel ' +
    'and plastered with daub carries a steep cone of rafters, thatched so thickly that the smoke of the central hearth simply seeps out ' +
    'through it. One room held the whole household, with a single doorway in a short porch, usually turned to the south-east, ' +
    'towards the morning sun and away from the prevailing wind.',
  materials: ['oak posts', 'hazel wattle', 'daub of clay, dung and straw', 'wheat straw or reed thatch'],
  lookFor: [
    {
      label: 'Conical thatched roof',
      note: 'Pitched at about 45 degrees so rain runs off fast; there is no chimney or smoke hole, the smoke filters out through the thatch.',
      at: [0, 5.6, 2.4],
    },
    {
      label: 'Wattle-and-daub wall',
      note: 'Hazel rods woven between upright stakes, then daubed with clay; the low wall carries the feet of the rafters, and the deep eaves keep the rain off it.',
      at: [-3.6, 1.0, 3.5],
    },
    {
      label: 'Porch',
      note: 'A short covered passage protecting the only door, turned to the south-east, towards the morning sun and away from the wind.',
      at: [3.3, 2.4, 5.6],
    },
    {
      label: 'Four-post store',
      note: 'A small store raised on four posts, usually taken to be a granary keeping seed corn dry and away from mice; their postholes are found on many Iron Age sites.',
      at: [-4.3, 2.4, -5.6],
    },
  ],
  build(b) {
    const R = 4.9; // wall radius
    const wallH = b.range(1.75, 1.95);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.04), P.reed]);
    const daub = tint(P.daub, b.range(-0.05, 0.02));

    // a beaten-earth yard
    b.cyl(6.6, 0.03, tint(P.earth, 0.12), { segs: 18, jitter: false });

    // ring wall: daub skin with a band of exposed wattle near the base where the plaster has worn
    b.cyl(R, wallH, daub, { segs: 18 });
    b.cyl(R + 0.03, 0.35, tint(P.wattle, -0.04), { segs: 18 });

    // thatch: thick cone, eaves well out over the wall, roughly 45 degrees
    const eR = R + 0.75;
    const eY = wallH - 0.2;
    const apex = eY + eR * 1.02;
    b.lathe(
      [
        [0.01, eY - 0.05],
        [eR - 0.2, eY - 0.05],
        [eR, eY + 0.1],
        [eR - 0.15, eY + 0.45],
        [0.35, apex - 0.1],
        [0.01, apex],
      ],
      thatch,
      { segs: 20 },
    );

    // porch, turned to the south-east (front-right)
    const ang = 0.55 + b.range(-0.08, 0.08);
    b.group({ rotY: ang }, () => {
      const z0 = R - 0.3;
      const len = 2.0;
      // low side walls of daub
      b.sym((s) => b.box(0.25, 1.6, len, daub, { at: [s * 0.9, 0, z0 + len / 2] }));
      // posts at the mouth
      b.sym((s) => b.cyl(0.11, 1.8, P.oakDark, { at: [s * 0.9, 0, z0 + len], segs: 6 }));
      // porch roof: a short thatched gable running into the main cone
      b.gable(2.3, len + 0.4, 0.95, thatch, { at: [0, 1.75, z0 + (len + 0.4) / 2 - 0.2], ridge: 'z', overhang: 0.15, thick: 0.3, wall: daub });
      // doorway: a dark opening in the main wall with a hurdle door leaned aside
      b.panel(1.1, 1.55, P.timberBlack, { at: [0, 0, R - 0.05], facing: '+z', depth: 0.1 });
      b.box(0.9, 1.4, 0.08, P.wattle, { at: [0.95, 0, z0 + 0.4], rotY: 0.2 });
    });

    // central hearth glow is invisible from outside, but the smoke stains the thatch at the apex
    b.cone(0.5, 0.35, tint(thatch, -0.22), { at: [0, apex - 0.36, 0], segs: 10 });

    // four-post granary at the back-left
    b.group({ at: [-4.3, 0, -5.6], rotY: 0.3 }, () => {
      for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
        b.cyl(0.1, 1.2, P.oak, { at: [x, 0, z], segs: 6 });
      }
      b.box(2.0, 0.12, 2.0, P.oak, { at: [0, 1.2, 0] });
      b.box(1.8, 1.0, 1.8, daub, { at: [0, 1.32, 0] });
      b.pyramid(2.4, 2.4, 1.3, thatch, { at: [0, 2.32, 0], overhang: 0.1 });
      beam(b, [0.9, 0, 1.6], [0.9, 1.25, 0.95], 0.08, 0.08, P.oak); // notched-log ladder
    });

    // hurdle fence round a small stock pen on the right
    hurdle(b, 3.4, -3.6, 6.4, -3.6, 1.0);
    hurdle(b, 6.4, -3.6, 6.4, -7.6, 1.0);
    hurdle(b, 6.4, -7.6, 2.0, -7.6, 1.0);
    hurdle(b, 2.0, -7.6, 2.0, -5.8, 1.0);

    // woodpile and a quern stone by the door
    b.group({ at: [-3.2, 0, 4.6], rotY: -0.5 }, () => {
      for (let i = 0; i < 3; i++) b.log(0.12, 1.6, tint(P.bark, 0.05 * i), { at: [0, i * 0.2, (i % 2) * 0.12 - 0.06], segs: 6 });
    });
    b.cyl(0.32, 0.18, P.gritstone, { at: [1.0, 0, 6.6], segs: 9 });
    b.cyl(0.3, 0.14, tint(P.gritstone, 0.05), { at: [1.0, 0.18, 6.6], segs: 9 });
  },
};
