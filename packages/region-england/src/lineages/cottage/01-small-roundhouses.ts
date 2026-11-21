import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bar, coneRoof, hurdles, patch, sheep, thickPyramid } from './shared';

/** One small roundhouse: daubed wattle ring wall, steep conical thatch, porch turned by `turn`. */
function roundhouse(b: Builder, x: number, z: number, r: number, turn: number, thatch: number): void {
  const wallH = 1.6;
  const ov = 0.45;
  const R = r + ov;
  const pitch = (50 * Math.PI) / 180;
  const k = Math.tan(pitch);
  const h = R * k;
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    // ring wall of wattle, daubed with clay and dung
    b.cyl(r, wallH, b.pick([P.daub, tint(P.daub, -0.04), P.cob]), { segs: 16 });
    // a ring of stakes showing at the foot where the daub has worn
    b.cyl(r + 0.03, 0.25, P.wattle, { segs: 16 });
    // roof: cone seated so its underside meets the wall head
    coneRoof(b, R, h, thatch, [0, wallH - ov * k, 0], { t: 0.3 });
    // porch: two short cheek walls and a little thatched gable
    b.sym((s) => b.box(0.22, 1.35, 1.1, P.daub, { at: [s * 0.68, 0, r + 0.35] }));
    b.gable(1.8, 1.5, 0.85, thatch, { at: [0, 1.35, r + 0.3], ridge: 'z', thick: 0.22, wall: P.daub });
    b.panel(1.0, 1.3, P.oakDark, { at: [0, 0, r + 0.15], facing: '+z' });
  });
}

export const smallRoundhouses: BuildingDef = {
  id: 'small-roundhouses',
  name: 'Iron Age roundhouses',
  style: 'Iron Age vernacular',
  date: 'c. 500 BC',
  summary:
    'A farming household lived in a cluster of small round houses: one for sleeping and cooking round a central hearth, others perhaps for stores, crafts or a married son. ' +
    'Walls were woven hazel daubed with clay, and the steep cone of thatch shed rain fast and let the smoke seep out, since there was no chimney or window. ' +
    'Grain for next year was probably kept in a raised four-post granary, and animals were penned in moveable wattle hurdles.',
  materials: ['wattle and daub', 'straw or reed thatch', 'oak and hazel'],
  lookFor: [
    { label: 'Conical thatched roof', note: 'Pitched at about 50 degrees so rain runs off before it soaks in; smoke from the hearth filtered out through it.', at: [-8, 5.6, 1] },
    { label: 'Wattle-and-daub wall', note: 'Hazel rods woven between stakes and plastered with clay, dung and straw. Low, so the roof did most of the work.', at: [-8, 0.9, 4.3] },
    { label: 'Porch', note: 'Doorways usually face east or south-east, towards the morning sun and away from the prevailing wind.', at: [-6.5, 1.9, 4.3] },
    { label: 'Four-post granary', note: 'A small store raised on posts, thought to have kept seed corn dry and out of reach of mice.', at: [10, 2.0, -3.2] },
    { label: 'Hurdle pen', note: 'Panels of woven hazel staked into the ground: a fence that could be moved and rebuilt in an afternoon.', at: [-5.5, 1.2, -3.5] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.thatchOld, P.reed, tint(P.thatchOld, 0.05)]);
    const three = b.variant === 0 || b.chance(0.6);

    // trodden yard
    patch(b, 25, 13, tint(P.earth, 0.04), [0, 0]);

    // houses: the main house (left), a second (centre back) and sometimes a third (right)
    const t = b.range(0.35, 0.6);
    roundhouse(b, -8, 1, 3.1, t, thatch);
    roundhouse(b, 0.5, -1.6, 2.8, t + b.range(-0.2, 0.2), tint(thatch, 0.03));
    if (three) roundhouse(b, 7.2, 2.6, 2.3, t + b.range(-0.2, 0.2), tint(thatch, -0.03));

    // hearth smoke stains and a woodpile against the main house
    for (let i = 0; i < 4; i++) {
      b.log(0.12, 1.6, P.bark, { at: [-3.9, i < 3 ? 0 : 0.22, 2.6 + (i % 3) * 0.25 - (i === 3 ? -0.12 : 0)], axis: 'z', segs: 6 });
    }

    // four-post granary on the back right
    b.group({ at: [10, 0, -4.2], rotY: b.range(-0.2, 0.2) }, () => {
      for (const [px, pz] of [
        [0.8, 0.8],
        [-0.8, 0.8],
        [0.8, -0.8],
        [-0.8, -0.8],
      ]) {
        b.cyl(0.1, 1.15, P.oak, { at: [px, 0, pz], segs: 6 });
        b.cyl(0.2, 0.08, P.oakDark, { at: [px, 1.07, pz], segs: 8 }); // rat guard
      }
      b.box(2.1, 0.14, 2.1, P.oak, { at: [0, 1.15, 0] });
      b.box(1.8, 1.05, 1.8, P.wattle, { at: [0, 1.29, 0] });
      b.panel(0.6, 0.75, P.oakDark, { at: [0, 1.35, 0.9], facing: '+z' });
      thickPyramid(b, 2.6, 2.6, 1.55, 0.22, thatch, [0, 2.2, 0]);
      // ladder
      bar(b, [-0.25, 0, 2.0], [-0.25, 1.3, 1.05], 0.06, P.oakSilver);
      bar(b, [0.25, 0, 2.0], [0.25, 1.3, 1.05], 0.06, P.oakSilver);
      for (let i = 1; i <= 3; i++) {
        const f = i / 4;
        b.box(0.5, 0.05, 0.05, P.oakSilver, { at: [0, 1.3 * f, 2.0 - 0.95 * f] });
      }
    });

    // hurdle pen behind the main house, with a gap for a gate
    const px0 = -8.4;
    const px1 = -2.8;
    const pz0 = -6.4;
    const pz1 = -3.4;
    hurdles(b, [px0, pz0], [px1, pz0]);
    hurdles(b, [px0, pz0], [px0, pz1]);
    hurdles(b, [px1, pz0], [px1, pz1]);
    hurdles(b, [px0, pz1], [px1 - 1.4, pz1]);
    const flock = b.variant === 0 ? 3 : 2 + Math.floor(b.rand() * 2);
    for (let i = 0; i < flock; i++) sheep(b, px0 + 1.2 + i * 1.5, pz0 + 1.1 + (i % 2) * 0.9, b.range(-1, 1));

    // quern stone and a water pot by the second house
    b.cyl(0.3, 0.22, P.gritstone, { at: [3.6, 0, 1.2], segs: 8 });
    b.cyl(0.28, 0.12, P.gritstone, { at: [3.6, 0.22, 1.2], segs: 8 });
    b.lathe([[0.01, 0], [0.18, 0.05], [0.24, 0.3], [0.14, 0.5], [0.16, 0.55]], P.mud, { at: [4.2, 0, 1.5], segs: 8 });
  },
};
