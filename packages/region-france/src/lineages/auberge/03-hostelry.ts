import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { fence, ground, horse, tableBenches } from './shared';

const HL = 13.0; // guest hall length along X
const HWD = 6.6; // its width
const HZ = 3.2; // its centre
const WH = 2.7;
const RISE = 3.6;

export const hostelry: BuildingDef = {
  id: 'hostelry',
  name: 'Abbey hostelry',
  style: 'Carolingian',
  date: 'c. 800',
  summary:
    'The Rule of Saint Benedict tells monks to receive every guest as Christ, and Charlemagne’s capitulary of 802 orders that no one refuse a traveller a roof, a fire and water. In practice the traveller of the ninth century slept at a monastery, and the great abbey outside the walls keeps this guest house by the road at its gate. ' +
    'It is a timber hall on a low stone sill, its walls of posts and daub under a steep roof of oak shingles; the fire burns on an open hearth in the middle and the smoke leaves through a louvre on the ridge, for there are no chimneys yet. ' +
    'As on the Plan of Saint Gall, drawn about 820, the hall has its own kitchen and bread oven set apart against fire, and a stable for the guests’ horses. The Roman inns are long gone: hospitality is now a work of charity.',
  materials: ['oak posts and shingles', 'wattle and daub', 'limestone rubble', 'straw thatch'],
  modelledOn: 'The guest houses on the Plan of Saint Gall (c. 820), much simplified',
  lookFor: [
    { label: 'Smoke louvre', note: 'A little hooded opening on the ridge lets out the smoke of the open hearth below. Chimneys did not reach northern France until about 1200.', at: [0, WH + RISE + 0.8, HZ] },
    { label: 'Shingle roof', note: 'Split oak shingles, laid like scales on a steep hipped roof: longer-lasting than thatch, and the roofing of choice where oak was plentiful.', at: [-4.0, WH + 1.6, HZ + HWD / 2 + 0.3] },
    { label: 'Kitchen and oven', note: 'Cooking was done in a separate kitchen beside a domed clay bread oven, away from the hall in case of fire.', at: [-6.6, 2.6, -5.6] },
    { label: 'Stable', note: 'A long thatched stable for the guests’ horses and mules, with a hayloft in the roof.', at: [5.4, 2.0, -4.6] },
    { label: 'Abbey wall', note: 'The guest house lay at the edge of the abbey’s enclosure, so that travellers need not disturb the monks within.', at: [0, 2.8, -9.9] },
  ],
  build(b) {
    const daub = b.pick([P.daub, tint(P.daub, -0.04), P.torchis]);
    const post = P.oakDark;
    const shingle = b.pick([P.shingle, tint(P.shingle, -0.05)]);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.05)]);
    const stone = b.pick([P.rubble, tint(P.pierreBlonde, -0.1)]);

    ground(b, 21.4, 21.0, tint(P.earth, 0.04), [0, 0], 0.03);
    ground(b, 3.0, 4.0, P.gravel, [0, 8.8], 0.05);

    // ---------------- the guest hall
    const zf = HZ + HWD / 2;
    const zb = HZ - HWD / 2;
    b.box(HL + 0.2, 0.45, HWD + 0.2, stone, { at: [0, 0, HZ] });
    b.box(HL, WH - 0.45, HWD, daub, { at: [0, 0.45, HZ] });
    for (const x of spread(9, -HL / 2 + 0.1, HL / 2 - 0.1)) {
      b.box(0.22, WH - 0.45, 0.1, post, { at: [x, 0.45, zf + 0.03] });
      b.box(0.22, WH - 0.45, 0.1, post, { at: [x, 0.45, zb - 0.03] });
    }
    for (const z of spread(4, zb + 0.1, zf - 0.1)) b.sym((s) => b.box(0.1, WH - 0.45, 0.22, post, { at: [s * (HL / 2 + 0.03), 0.45, z] }));
    b.box(HL + 0.1, 0.18, HWD + 0.1, post, { at: [0, WH - 0.18, HZ] });
    // doors and small shuttered openings (no glass)
    b.panel(1.3, 2.0, P.oak, { at: [0, 0.45, zf], facing: '+z', shape: 'round' });
    b.panel(1.2, 1.8, P.oak, { at: [-HL / 2, 0.45, HZ + 1.0], facing: '-x' });
    for (const x of [-4.6, -2.3, 2.3, 4.6]) {
      b.panel(0.55, 0.6, P.timberBlack, { at: [x, 1.4, zf], facing: '+z' });
      b.panel(0.3, 0.6, P.oak, { at: [x + 0.45, 1.4, zf], facing: '+z', depth: 0.08 });
      b.panel(0.55, 0.6, P.timberBlack, { at: [x, 1.4, zb], facing: '-z' });
    }
    b.stairs(1.8, 0.45, 0.8, 2, stone, { at: [0, 0, zf + 0.5] });
    // the roof: steep, hipped, of oak shingles, with a louvre on the ridge
    b.hip(HL, HWD, RISE, shingle, { at: [0, WH, HZ], overhang: 0.6 });
    b.group({ at: [0, WH + RISE - 0.5, HZ] }, () => {
      b.box(1.2, 0.9, 0.9, post);
      b.gable(1.2, 1.3, 0.55, shingle, { at: [0, 0.9, 0], overhang: 0.15 });
      b.sym((s) => b.panel(0.9, 0.45, P.timberBlack, { at: [0, 0.3, s * 0.45], facing: s > 0 ? '+z' : '-z' }));
    });
    // a cross on the gable end of the hall
    const rx = (HL - HWD) / 2;
    b.box(0.12, 1.2, 0.12, post, { at: [rx, WH + RISE - 0.2, HZ] });
    b.box(0.12, 0.1, 0.55, post, { at: [rx, WH + RISE + 0.65, HZ] });
    // benches out front for the poor waiting at the gate
    tableBenches(b, [-4.4, 0, zf + 1.6], 0, P.oak, 2.2);

    // ---------------- the kitchen and bread oven
    b.group({ at: [-6.6, 0, -5.6] }, () => {
      b.box(4.4, 0.4, 4.0, stone);
      b.box(4.2, 2.0, 3.8, daub, { at: [0, 0.4, 0] });
      for (const x of spread(4, -2.05, 2.05)) b.sym((s) => b.box(0.18, 2.0, 0.08, post, { at: [x, 0.4, s * 1.93] }));
      b.pyramid(4.2, 3.8, 3.0, thatch, { at: [0, 2.4, 0], overhang: 0.5 });
      // a smoke hole: the thatch left open under a little hood at the top
      b.box(0.8, 0.4, 0.8, P.timberBlack, { at: [0, 4.7, 0] });
      b.pyramid(1.1, 1.1, 0.5, thatch, { at: [0, 5.15, 0] });
      b.panel(1.0, 1.8, P.oak, { at: [1.0, 0.4, 1.9], facing: '+z' });
    });
    b.group({ at: [-3.2, 0, -7.6] }, () => {
      b.box(2.0, 0.7, 2.2, stone);
      b.dome(0.95, P.cob, { at: [0, 0.7, 0], squash: 0.9, segs: 8 });
      b.panel(0.45, 0.4, P.timberBlack, { at: [0, 0.75, 0.93], facing: '+z', shape: 'round' });
      b.pyramid(2.4, 2.6, 0.9, thatch, { at: [0, 2.1, 0], overhang: 0.1 });
      b.sym((s) => b.box(0.14, 2.1, 0.14, post, { at: [s * 1.1, 0, 1.2] }));
      b.sym((s) => b.box(0.14, 2.1, 0.14, post, { at: [s * 1.1, 0, -1.2] }));
    });
    for (let i = 0; i < 6; i++) b.log(0.1, 1.4, P.bark, { at: [-1.4, i < 4 ? 0 : 0.2, -8.2 + (i % 4) * 0.22], segs: 5 });

    // ---------------- the stable
    b.group({ at: [5.4, 0, -6.0] }, () => {
      b.box(9.2, 0.35, 4.2, stone);
      b.box(9.0, 2.1, 4.0, daub, { at: [0, 0.35, 0] });
      for (const x of spread(6, -4.45, 4.45)) b.sym((s) => b.box(0.2, 2.1, 0.08, post, { at: [x, 0.35, s * 2.03] }));
      b.gable(9.0, 4.0, 2.6, thatch, { at: [0, 2.45, 0], overhang: 0.55, thick: 0.4, wall: daub });
      for (const x of [-2.6, 0.4, 3.2]) b.panel(1.5, 2.0, P.oak, { at: [x, 0.35, 2.0], facing: '+z' });
      b.panel(0.9, 0.7, P.timberBlack, { at: [-4.5, 3.0, 0], facing: '-x' });
    });
    horse(b, [1.6, 0, -2.6], 2.2, 0x6b4a32);

    // ---------------- the abbey wall behind, with a gate in it
    b.box(21.4, 3.0, 0.7, stone, { at: [0, 0, -10.4] });
    b.box(21.6, 0.2, 0.9, tint(stone, -0.08), { at: [0, 3.0, -10.4] });
    for (const x of spread(6, -10.2, 10.2)) b.box(0.7, 2.4, 0.5, stone, { at: [x, 0, -9.85] });
    b.panel(1.8, 2.5, P.oakDark, { at: [0, 0, -10.05], facing: '+z', shape: 'round' });
    b.panel(2.3, 2.85, tint(stone, 0.08), { at: [0, 0, -10.05], facing: '+z', shape: 'round', depth: 0.03 });
    // a hurdle fence round the yard on the road and sides
    fence(b, [-10.4, 10.2], [-1.6, 10.2], 1.1, post, P.wattle, 1.5);
    fence(b, [1.6, 10.2], [10.4, 10.2], 1.1, post, P.wattle, 1.5);
    b.sym((s) => fence(b, [s * 10.4, 10.2], [s * 10.4, -10.0], 1.1, post, P.wattle, 1.5));
    // a wayside cross at the gate
    b.box(0.9, 0.5, 0.9, stone, { at: [2.6, 0, 10.6] });
    b.box(0.2, 2.6, 0.2, post, { at: [2.6, 0.5, 10.6] });
    b.box(1.0, 0.18, 0.2, post, { at: [2.6, 2.4, 10.6] });

    // ---------------- colliders
    b.collider(HL, HWD, { at: [0, 0, HZ] });
    b.collider(4.4, 4.0, { at: [-6.6, 0, -5.6] });
    b.collider(2.4, 2.6, { at: [-3.2, 0, -7.6] });
    b.collider(9.2, 4.2, { at: [5.4, 0, -6.0] });
    b.collider(21.4, 0.7, { at: [0, 0, -10.4] });
  },
};
