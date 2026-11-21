import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { arcLathe, arcPts, beam, lineColliders, palisade } from './shared';

const R_PAL = 17; // palisade line on the crest of the bank
const GAP = 0.15; // half-angle of the gateway gap, radians
const FRONT = Math.PI / 2; // +Z

/** A round house: low wattle-and-daub wall, steep conical thatch, a short porch. */
function roundhouse(b: Builder, x: number, z: number, r: number, wallH: number, doorAng: number) {
  const thatch = tint(P.thatch, b.range(-0.04, 0.01));
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r, wallH, P.daub, { segs: 18 });
    // roof pitched at about 45 degrees, eaves well out over the wall
    const ov = 0.8;
    b.cone(r + ov, r + ov, thatch, { at: [0, wallH - ov * 0.9, 0], segs: 18 });
    b.cyl(r + ov, 0.35, tint(thatch, -0.06), { at: [0, wallH - ov * 0.9 - 0.35, 0], rTop: r + ov, segs: 18 });
    // porch
    b.group({ rotY: doorAng }, () => {
      const pw = Math.max(1.6, r * 0.32);
      b.box(0.2, wallH, 1.6, P.oak, { at: [-pw / 2, 0, r + 0.5] });
      b.box(0.2, wallH, 1.6, P.oak, { at: [pw / 2, 0, r + 0.5] });
      b.gable(pw + 0.4, 1.9, 1.1, thatch, { at: [0, wallH, r + 0.55], ridge: 'z', overhang: 0.15, thick: 0.3 });
      b.panel(pw - 0.4, Math.min(1.75, wallH - 0.05), P.oakDark, { at: [0, 0, r - 0.02] });
    });
  });
}

/** A four-post granary: a small wattled store raised on posts to keep grain from damp and rats. */
function granary(b: Builder, x: number, z: number, rotY: number) {
  b.group({ at: [x, 0, z], rotY }, () => {
    const s = 2.6;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.24, 1.3, 0.24, P.oak, { at: [sx * (s / 2 - 0.2), 0, sz * (s / 2 - 0.2)] });
    b.box(s + 0.2, 0.18, s + 0.2, P.oakDark, { at: [0, 1.15, 0] });
    b.box(s, 1.5, s, P.wattle, { at: [0, 1.33, 0] });
    b.frame(s, 1.5, P.oak, { at: [0, 1.33, s / 2], facing: '+z', studs: 2, rails: 0 });
    b.frame(s, 1.5, P.oak, { at: [0, 1.33, -s / 2], facing: '-z', studs: 2, rails: 0 });
    b.gable(s, s, 1.7, P.thatch, { at: [0, 2.83, 0], overhang: 0.35, thick: 0.35, wall: P.wattle });
    // notched log ladder
    b.box(0.3, 1.6, 0.18, P.oakDark, { at: [0.5, 0, s / 2 + 0.45], rot: [-0.35, 0, 0] });
  });
}

export const chieftainsEnclosure: BuildingDef = {
  id: 'chieftains-enclosure',
  name: "Chieftain's enclosure",
  style: 'Iron Age',
  date: 'c. 300 BC',
  summary:
    'Before towns, power meant a defended farmstead. A chalk-and-earth bank thrown up from a ditch outside it, topped by an oak palisade, ' +
    'rings the household of the leading family, entered through a single timber gate. Inside stands a great roundhouse built of wattle, ' +
    'daub and thatch, the hall where the chief\'s household lived and feasted, and raised four-post granaries holding the harvest that was the real measure of wealth.',
  materials: ['earth and chalk', 'oak', 'hazel wattle and daub', 'straw thatch'],
  lookFor: [
    { label: 'Bank and ditch', note: 'Soil dug from the outer ditch was heaped into the bank, so an attacker faced a double climb.', at: [-15.5, 1.8, 9.5] },
    { label: 'Palisade', note: 'A fence of split oak stakes set along the crest of the bank, pointed at the top.', at: [12.2, 4.6, -12.2] },
    { label: 'Inturned gateway', note: 'The bank ends turn inwards beside the gate, making a corridor that could be defended from above, with a fighting platform over the gate.', at: [0, 6.2, 17.2] },
    { label: 'Great roundhouse', note: 'A circular wattle wall under a steep cone of thatch; there is no chimney, and smoke seeps out through the roof.', at: [-2, 7.5, -0.5] },
    { label: 'Four-post granary', note: 'A small store lifted on four posts so air flows underneath and vermin cannot climb in.', at: [10.5, 3.2, -4] },
  ],
  build(b) {
    const earth = tint(P.turf, 0.02);
    const ditchCol = mix(P.earth, P.chalk, 0.3);
    // bank (with a gap at the gate) and the outer ditch, with a causeway left across it
    arcLathe(
      b,
      [
        [19.3, 0],
        [18.2, 1.4],
        [17.2, 1.75],
        [16.2, 1.3],
        [15.1, 0],
      ],
      FRONT + GAP,
      FRONT + Math.PI * 2 - GAP,
      44,
      earth,
    );
    arcLathe(
      b,
      [
        [19.3, 0.03],
        [21.6, 0.03],
      ],
      FRONT + GAP * 1.3,
      FRONT + Math.PI * 2 - GAP * 1.3,
      44,
      ditchCol,
    );
    // inturned bank ends: short banks running into the enclosure either side of the gate passage
    b.sym((s) => {
      b.extrude([[-1.8, 0], [0, 1.75], [1.8, 0]], 5.2, earth, { at: [s * 4.3, 0, 13.8] });
    });

    // palisade on the crest, and returning inwards along the gate passage
    const crest = (x: number, z: number) => {
      const r = Math.hypot(x, z);
      return r > 15 ? 1.7 : 1.6;
    };
    palisade(b, arcPts(0, 0, R_PAL, FRONT + GAP, FRONT + Math.PI * 2 - GAP, 64), 2.6, tint(P.oak, 0.06), { base: crest, stake: 0.4 });
    b.sym((s) => {
      palisade(b, [[s * 2.6, 16.8], [s * 2.6, 11.4]], 2.4, P.oak, { base: () => 1.5, stake: 0.4 });
    });

    // gate: four big posts carrying a fighting platform over the passage, double gates hung inside
    const G = 2.4;
    for (const sx of [-1, 1])
      for (const z of [11.6, 16.6]) b.box(0.42, 6.2, 0.42, P.oakDark, { at: [sx * G, 0, z] });
    b.box(G * 2 + 0.8, 0.3, 6, P.oak, { at: [0, 4.2, 14.1] });
    palisade(b, [[-G - 0.2, 16.8], [G + 0.2, 16.8]], 1.2, P.oak, { base: () => 4.5, stake: 0.32 });
    palisade(b, [[G + 0.2, 11.4], [-G - 0.2, 11.4]], 1.2, P.oak, { base: () => 4.5, stake: 0.32 });
    b.sym((s) => b.box(1.15, 0.12, 5.4, P.oak, { at: [s * (G + 0.1), 5.4, 14.1] }));
    b.sym((s) => {
      // gate leaves standing open against the passage sides
      b.box(0.14, 3.1, 2.1, P.oakDark, { at: [s * 2.25, 0, 12.7] });
    });
    b.box(4.8, 0.2, 0.3, P.oakDark, { at: [0, 3.9, 11.6] });
    // a trackway across the causeway
    b.box(4.2, 0.03, 9, mix(P.earth, P.chalk, 0.3), { at: [0, 0, 17.5], jitter: false });

    // the chief's great roundhouse, door facing the gate
    roundhouse(b, -2, -2.5, 7, 1.9, 0);
    // a lesser roundhouse and a work hut
    roundhouse(b, -11, 6.5, 3.6, 1.6, 0.7);
    roundhouse(b, 9.5, 7.5, 3, 1.5, -0.6);

    // granaries in a row on the drier ground to the right
    const g0 = b.range(-0.2, 0.2);
    granary(b, 10.5, -5.5, g0);
    granary(b, 7.5, -10.5, g0 + 0.3);
    granary(b, 12.4, 0, g0 - 0.15);

    // a hurdle pen and a log pile
    const pen: [number, number][] = [[-12, -6], [-8, -10], [-11, -14], [-15, -10], [-12, -6]];
    for (let i = 0; i < pen.length - 1; i++) {
      beam(b, pen[i], pen[i + 1], 0.12, 1.0, P.wattle);
    }
    for (let i = 0; i < 3; i++) b.log(0.18, 2.6, P.bark, { at: [-4.5, i * 0.3, 8.5 + i * 0.2], axis: 'x', segs: 6 });

    // colliders: the bank in pieces (leaving the gate passage open), the houses, the granaries
    const ring = arcPts(0, 0, R_PAL, FRONT + GAP * 0.9, FRONT + Math.PI * 2 - GAP * 0.9, 26);
    lineColliders(b, ring, 2.4);
    b.sym((s) => b.collider(0.8, 5.6, { at: [s * 2.9, 0, 14.1] }));
    b.collider(13, 13, { at: [-2, 0, -2.5] });
    b.collider(6.6, 6.6, { at: [-11, 0, 6.5] });
    b.collider(5.6, 5.6, { at: [9.5, 0, 7.5] });
    b.collider(2.6, 2.6, { at: [10.5, 0, -5.5] });
    b.collider(2.6, 2.6, { at: [7.5, 0, -10.5] });
    b.collider(2.6, 2.6, { at: [12.4, 0, 0] });
  },
};
