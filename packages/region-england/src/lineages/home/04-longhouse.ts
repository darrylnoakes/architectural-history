import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { cow, hipGablet, hurdle } from './shared';

export const longhouse: BuildingDef = {
  id: 'longhouse',
  name: 'Longhouse',
  style: 'Medieval peasant vernacular',
  date: 'c. 1100',
  summary:
    'A peasant family and its cattle lived under one long, low roof, the people at the upper end round an open hearth and the ' +
    'beasts at the lower end, whose warmth helped heat the house. A cross passage between two opposite doors divided them. ' +
    'The thick walls are of cob, clay and straw trodden in layers on a stone footing, and with no chimney the smoke drifts up to ' +
    'a hole at the top of the hipped thatch. Excavated deserted villages, such as Hound Tor on Dartmoor, show houses of this kind.',
  materials: ['cob on a rubble footing', 'oak and ash roof timbers', 'straw thatch', 'wattle hurdles'],
  lookFor: [
    {
      label: 'Cross passage',
      note: 'Two doors facing each other across the house; the passage between them separated the family from the animals.',
      at: [1.1, 2.3, 2.9],
    },
    {
      label: 'Byre end',
      note: 'The lower end housed the cattle; a drain ran down its floor and out through the end wall to the muck heap.',
      at: [5.6, 1.1, 1.4],
    },
    {
      label: 'Smoke hole',
      note: 'A small opening at the top of the hipped end let out the smoke of the open hearth; there was no chimney.',
      at: [-4.7, 4.6, 0.3],
    },
    {
      label: 'Cob walls',
      note: 'Thick, low walls of mud and straw with rounded corners, raised on a few courses of stone to keep the damp out.',
      at: [-3.6, 1.0, 2.9],
    },
  ],
  build(b) {
    const L = b.pick([12.6, 13]);
    const D = 5.2;
    const z0 = 0.4;
    const wallH = 1.75;
    const cob = tint(P.cob, b.range(-0.06, 0.0));
    const thatch = b.pick([P.thatchOld, tint(P.thatchOld, 0.05), tint(P.thatch, -0.08)]);
    const zf = z0 + D / 2;
    const zb = z0 - D / 2;

    // footing and thick cob walls
    b.box(L + 0.1, 0.35, D + 0.1, P.rubble, { at: [0, 0, z0] });
    b.box(L, wallH - 0.35, D, cob, { at: [0, 0.35, z0] });
    // soften the corners with buttress-like rounded cob
    for (const [x, z] of [[-L / 2, zf], [L / 2, zf], [-L / 2, zb], [L / 2, zb]]) {
      b.cyl(0.32, wallH - 0.1, cob, { at: [x * 0.995, 0, z * 0.995 + z0 * 0.005], segs: 7 });
    }

    // steep hipped thatch with a smoke gablet at the domestic (-X) end
    hipGablet(b, L, D, 3.4, thatch, { at: [0, wallH - 0.05, z0], overhang: 0.55, g: 0.6, ends: [-1] });
    b.log(0.12, L - D + 0.4, tint(thatch, -0.12), { at: [0, wallH + 3.3, z0], segs: 6 });

    // cross passage: opposite doors, a little toward the byre end
    const xp = 1.1;
    for (const s of [1, -1] as const) {
      b.panel(1.0, 1.75, P.oakDark, { at: [xp, 0.05, z0 + s * D / 2], facing: s > 0 ? '+z' : '-z' });
      b.panel(1.2, 0.14, P.oak, { at: [xp, 1.8, z0 + s * D / 2], facing: s > 0 ? '+z' : '-z' });
    }
    // small shuttered openings to the living end
    for (const x of [-4.0, -2.2]) b.window(0.5, 0.45, { at: [x, 1.0, zf], facing: '+z', frame: P.oak, bars: [2, 1] });
    b.window(0.5, 0.45, { at: [-3.2, 1.0, zb], facing: '-z', frame: P.oak, bars: [2, 1] });

    // byre end: a drain outlet and the muck heap
    b.panel(0.35, 0.25, P.timberBlack, { at: [L / 2, 0.02, z0], facing: '+x' });
    b.box(0.5, 0.06, 1.4, P.soil, { at: [L / 2 + 0.6, 0, z0] });
    b.blob(0.9, tint(P.soil, -0.05), { at: [L / 2 + 0.5, 0.15, z0 - 1.7], stretch: [1, 0.45, 1.2] });
    // an outshot byre door, wider, for the beasts
    b.panel(1.3, 1.6, tint(P.oakDark, 0.04), { at: [L / 2 - 1.8, 0.05, zb], facing: '-z' });

    // toft: a muddy yard in front and a fenced croft behind with a beast or two
    b.box(L, 0.03, 3.2, tint(P.earth, 0.06), { at: [0, 0, zf + 1.8], jitter: false });
    hurdle(b, -6.8, zb - 0.6, -6.8, -8.8, 1.1);
    hurdle(b, -6.8, -8.8, 6.8, -8.8, 1.1);
    hurdle(b, 6.8, -8.8, 6.8, zb - 0.6, 1.1);
    cow(b, [3.2, 0, -5.8], 1.2 + b.range(-0.3, 0.3), b.pick([0x7a5a42, 0x5a4a3c, 0x8e6e50]));
    if (b.chance(0.7)) cow(b, [0.8, 0, -7.0], -0.4, b.pick([0xe6dccb, 0x6a4a34]));
    // vegetable plot
    for (const x of spread(6, -6.0, -2.4)) b.box(0.45, 0.12, 3.2, P.soil, { at: [x, 0, -6.4] });
    for (const x of spread(6, -6.0, -2.4)) for (const z of spread(4, -7.6, -5.2)) b.blob(0.17, P.leaf, { at: [x, 0.22, z], detail: 0 });
    // woodpile by the hall end
    for (let i = 0; i < 3; i++) b.log(0.11, 1.8, tint(P.bark, 0.04 * i), { at: [-L / 2 - 0.6, i * 0.19, z0 + 0.8 + (i % 2) * 0.1], axis: 'z', segs: 6 });
  },
};
