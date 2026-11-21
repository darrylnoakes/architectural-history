import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdleFence, roundedRing } from './shared';

/** A roundhouse: daub wall ring, steep thatch cone, porch on the door side. */
function roundhouse(b: Builder, r: number, wallH: number, porchAng: number, thatch: number, porch: boolean) {
  b.cyl(r, wallH, P.daub, { segs: 18 });
  // thatch cone: about 45 degrees, eaves brought low past the wall
  const ov = r * 0.14;
  const R = r + ov;
  const H = R * 1.0;
  const base = wallH - (H * ov) / R;
  b.cone(R, H, thatch, { at: [0, base, 0], segs: 18 });
  // thicker eaves lip of the thatch
  b.cyl(R, 0.22, tint(thatch, -0.05), { at: [0, base - 0.12, 0], rTop: R - 0.2, segs: 18 });
  // smoke-darkened apex
  b.cone(R * 0.16 + 0.04, H * 0.16 + 0.04, tint(thatch, -0.18), { at: [0, base + H * 0.84, 0], segs: 18 });
  b.group({ rotY: porchAng }, () => {
    const doorW = Math.min(1.3, r * 0.3);
    const doorH = Math.min(1.75, wallH - 0.05);
    b.panel(doorW, doorH, P.oakDark, { at: [0, 0, r - 0.02], facing: '+z', depth: 0.08 });
    if (!porch) return;
    // projecting porch passage with its own little thatched gable
    const len = ov + 1.0;
    const pw = doorW + 0.9;
    b.sym((s) => b.box(0.3, doorH, len + 0.4, P.daub, { at: [s * (pw / 2 - 0.15), 0, r - 0.2 + len / 2] }));
    b.gable(pw, len + 0.4, 1.1, thatch, { at: [0, doorH, r - 0.2 + len / 2], ridge: 'z', overhang: 0.25, thick: 0.3 });
    b.sym((s) => b.cyl(0.09, doorH, P.oak, { at: [s * (pw / 2 - 0.15), 0, r + len], segs: 6 }));
  });
}

export const greatRoundhouse: BuildingDef = {
  id: 'great-roundhouse',
  name: 'Great roundhouse',
  style: 'Iron Age',
  date: 'c. 300 BC',
  summary:
    'The leading family of the settlement lived in a roundhouse like everyone else, only a much bigger one: the largest were 15 metres across. ' +
    'A low ring of wattle and daub carried a steep cone of thatch with no chimney; smoke from the central hearth seeped out through the roof, curing the timbers and killing pests. ' +
    'Around it, inside a hurdle fence, stood a smaller hut for work or sleeping and a granary raised on four posts.',
  materials: ['oak posts', 'hazel wattle', 'clay daub', 'wheat straw thatch'],
  lookFor: [
    { label: 'Conical thatched roof', note: 'Pitched at about 45 degrees so rain runs off fast. There is no chimney: smoke escapes through the thatch.', at: [-1.5, 6.4, 1.5] },
    { label: 'Porch', note: 'A short entrance passage. Doorways usually faced east or south-east, toward the rising sun and away from the wind.', at: [1.2, 2.5, 9.1] },
    { label: 'Wattle and daub wall', note: 'Woven hazel rods plastered with clay, dung and straw. The wall is low because the roof carries itself.', at: [-6.2, 1.0, 3.0] },
    { label: 'Four-post granary', note: 'Seed corn kept off the ground on stilts, away from damp and rats.', at: [-5.6, 3.0, -7.6] },
    { label: 'Hurdle fence', note: 'Panels of woven hazel between posts, enclosing the yard and keeping the animals in.', at: [8.6, 1.2, -3] },
  ],
  build(b) {
    const side = b.variant === 0 ? 1 : b.pick([1, -1] as const);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.03), P.reed]);
    const r = b.range(6.0, 6.4);

    // the great house, set forward and to one side of the yard
    b.group({ at: [-1.4 * side, 0, 1.4] }, () => roundhouse(b, r, 1.9, 0.32 * side + b.range(-0.08, 0.08), thatch, true));

    // the smaller hut behind
    b.group({ at: [5.3 * side, 0, -6.6] }, () => roundhouse(b, 2.7, 1.5, 0.9 * side, tint(thatch, -0.04), false));

    // four-post granary
    const gx = -5.6 * side;
    const gz = -7.6;
    b.group({ at: [gx, 0, gz], rotY: b.range(-0.2, 0.2) }, () => {
      for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(0.12, 1.0, P.oak, { at: [px * 0.9, 0, pz * 0.9], segs: 6 });
      b.box(2.4, 0.18, 2.4, P.oak, { at: [0, 1.0, 0] });
      b.box(2.0, 1.3, 2.0, P.wattle, { at: [0, 1.18, 0] });
      b.pyramid(2.0, 2.0, 1.5, thatch, { at: [0, 2.48, 0], overhang: 0.35 });
      b.box(0.3, 1.0, 0.08, P.oak, { at: [0.5, 0, 1.25], rot: [0.35, 0, 0] });
    });

    // woodpile and a quern stone by the door
    b.group({ at: [3.6 * side, 0, 7.2], rotY: 0.4 * side }, () => {
      for (let i = 0; i < 3; i++) b.log(0.16, 2.0, P.bark, { at: [0, i * 0.26, i * 0.15 - 0.15], axis: 'x', segs: 6 });
      b.log(0.16, 2.0, P.bark, { at: [0, 0, 0.32], axis: 'x', segs: 6 });
    });
    b.cyl(0.35, 0.25, P.gritstone, { at: [-4.8 * side, 0, 6.8], segs: 8 });

    // the yard enclosure: hurdles on posts with a gateway in front
    const ring = roundedRing(9.3, 11.3, 28, 3.2);
    hurdleFence(b, ring, 1.1, { closed: true, gaps: [0] });
    for (const [x, z] of [ring[0], ring[1]]) b.cyl(0.14, 2.0, P.oak, { at: [x, 0, z], segs: 6 });
  },
};
