import { P, tint, type BuildingDef } from '@ah/kit';
import { hurdle, pitched, vegBed, woodpile } from './shared';

export const gaulishHouse: BuildingDef = {
  id: 'gaulish-house',
  name: 'Gaulish farmhouse',
  style: 'La Tène (late Iron Age)',
  date: 'c. 200 BC',
  summary:
    'In northern Gaul people lived not in round houses, as across the Channel in Britain, but in rectangular ones. ' +
    'Oak posts set in holes in the chalk carry walls of woven wattle daubed with clay and a steep roof of thatch, with a porch over the door; one room holds the hearth, the beds, the loom and the stores. ' +
    'In the fenced yard grain is kept in a small granary raised on four posts, out of reach of damp and mice, and in pits dug into the chalk and sealed with clay, where it keeps for months. ' +
    'Archaeologists know these farms from rows of post-holes and the pits.',
  materials: ['oak posts', 'wattle and clay daub', 'straw thatch', 'clay pit seals'],
  modelledOn:
    'The arrangement of house, four-post granary and storage pits follows the village of the Remi excavated at Acy-Romance (Ardennes), lived in during the second and first centuries BC. The house is a generic reconstruction from post-hole plans, not one particular building.',
  lookFor: [
    {
      label: 'Porch',
      note: 'The roof runs on past the front wall onto two posts, giving a dry place to work in the light of the doorway.',
      at: [-1.0, 2.2, 6.45],
    },
    {
      label: 'Wattle and daub between posts',
      note: 'The posts carry the roof; the walls between them are hazel rods woven like a basket and plastered with clay, dung and straw.',
      at: [0.45, 0.9, 1.5],
    },
    {
      label: 'Steep thatch',
      note: 'At about fifty degrees the rain runs off before it can soak in; smoke from the hearth seeps out through the thatch and a hole at the gable.',
      at: [-0.6, 4.2, -1.0],
    },
    {
      label: 'Granary on four posts',
      note: 'A small store lifted on four posts: four post-holes in a square are one of the commonest finds on Gaulish sites.',
      at: [4.0, 1.4, -3.6],
    },
    {
      label: 'Storage pit (silo)',
      note: 'Grain sealed in an airtight pit in the chalk stops breathing and keeps; the clay cap was broken open when the seed was needed.',
      at: [4.3, 0.5, 2.6],
    },
  ],
  build(b) {
    const daub = tint(b.pick([P.daub, P.cob, P.torchis]), b.range(-0.03, 0.02));
    const thatch = tint(b.pick([P.thatch, P.reed, P.thatchOld]), b.range(-0.03, 0.03));
    const post = P.oak;
    const xc = -2.6;
    const W = 6.0;
    const z0 = -4.0;
    const z1 = 5.0;
    const wallH = 2.2;
    const L = z1 - z0;
    const zc = (z0 + z1) / 2;

    // trodden yard
    b.box(13.6, 0.03, 17.6, tint(P.earth, 0.1), { at: [0, 0, 0], jitter: false });

    // walls of wattle and daub, with the bottom of the weave showing where the daub has worn
    b.box(W, wallH, L, daub, { at: [xc, 0, zc] });
    b.box(W + 0.04, 0.3, L + 0.04, P.wattle, { at: [xc, 0, zc] });
    for (const s of [1, -1]) {
      for (let i = 0; i <= 6; i++) b.cyl(0.13, wallH + 0.05, post, { at: [xc + s * (W / 2 + 0.04), 0, z0 + (i * L) / 6], segs: 6 });
    }
    b.cyl(0.13, wallH + 0.05, post, { at: [xc - 1.2, 0, z0 - 0.05], segs: 6 });
    b.cyl(0.13, wallH + 0.05, post, { at: [xc + 1.2, 0, z0 - 0.05], segs: 6 });

    // the roof, carried forward over the porch
    const porch = 1.6;
    const rise = 4.0;
    pitched(b, W, L + porch, rise, thatch, { at: [xc, wallH, zc + porch / 2], ridge: 'z', overhang: 0.45, ends: 0.25, wall: daub, thick: 0.45 });
    // smoke hole in each gable, under the ridge
    for (const s of [1, -1]) {
      const z = s > 0 ? z1 + porch + 0.26 : z0 - 0.26;
      b.extrude([[-0.35, 0], [0.35, 0], [0, 0.55]], 0.06, P.timberBlack, { at: [xc, wallH + rise - 0.95, z] });
    }
    // the front gable: a ridge post and a tie beam showing through the daub
    b.box(0.2, rise - 1.2, 0.08, post, { at: [xc, wallH, z1 + porch + 0.02] });
    b.box(W - 0.4, 0.18, 0.08, post, { at: [xc, wallH + 0.05, z1 + porch + 0.02] });
    // porch posts and the door
    b.sym((s) => b.cyl(0.13, wallH + 0.05, post, { at: [xc + s * 1.6, 0, z1 + porch - 0.15], segs: 6 }));
    b.box(3.4, 0.16, 0.16, post, { at: [xc, wallH - 0.02, z1 + porch - 0.15] });
    b.panel(1.2, 1.75, P.oakDark, { at: [xc, 0, z1], facing: '+z', depth: 0.08 });
    b.panel(0.95, 1.65, P.timberBlack, { at: [xc, 0, z1], facing: '+z', depth: 0.1 });
    b.box(1.5, 0.08, 1.0, P.earth, { at: [xc, 0, z1 + 0.5], jitter: false });
    // a small shuttered opening in the side wall
    b.panel(0.6, 0.45, P.oakDark, { at: [xc + W / 2, 1.0, 1.5], facing: '+x', depth: 0.06 });
    b.panel(0.6, 0.45, P.oakDark, { at: [xc - W / 2, 1.0, -1.5], facing: '-x', depth: 0.06 });
    // things in the porch: a storage jar, a rotary quern
    b.cyl(0.3, 0.7, tint(P.mud, 0.1), { at: [xc - 1.9, 0, z1 + 0.6], rTop: 0.18, segs: 8 });
    b.cyl(0.3, 0.14, P.gritstone, { at: [xc + 1.6, 0, z1 + 0.6], segs: 8 });
    b.cyl(0.29, 0.12, tint(P.gritstone, 0.06), { at: [xc + 1.6, 0.14, z1 + 0.6], segs: 8 });
    b.box(0.04, 0.25, 0.04, P.oak, { at: [xc + 1.75, 0.26, z1 + 0.6] });

    // granary on four posts, with a notched log ladder
    const gx = 4.0;
    const gz = -3.6;
    const gy = 1.2;
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.cyl(0.12, gy, post, { at: [gx + dx * 0.95, 0, gz + dz * 0.95], segs: 6 });
    b.box(2.5, 0.14, 2.5, P.oakDark, { at: [gx, gy, gz] });
    b.box(2.0, 1.5, 2.0, tint(daub, 0.03), { at: [gx, gy + 0.14, gz] });
    b.panel(0.6, 0.9, P.oakDark, { at: [gx, gy + 0.3, gz + 1.0], facing: '+z' });
    pitched(b, 2.0, 2.0, 1.25, thatch, { at: [gx, gy + 1.64, gz], ridge: 'x', overhang: 0.35, ends: 0.25, wall: tint(daub, 0.03), thick: 0.3 });
    b.beam([gx + 0.1, 0, gz + 2.1], [gx + 0.05, gy + 0.2, gz + 1.15], 0.18, 0.14, P.bark);

    // storage pits: one sealed with a clay cap, one opened
    b.cyl(0.95, 0.1, tint(P.chalk, -0.06), { at: [4.3, 0, 2.6], segs: 12 });
    b.dome(0.7, tint(P.mud, 0.15), { at: [4.3, 0.08, 2.6], squash: 0.45, segs: 10 });
    b.cyl(0.85, 0.08, tint(P.chalk, -0.08), { at: [2.4, 0, 3.6], segs: 12 });
    b.cyl(0.62, 0.1, P.timberBlack, { at: [2.4, 0, 3.6], segs: 12, jitter: false });
    b.box(1.4, 0.06, 0.25, P.oak, { at: [2.4, 0.1, 3.4], rotY: 0.4 });

    // fenced yard: wattle hurdles round the plot, a gap for the gate
    hurdle(b, -6.7, 8.7, -0.2, 8.7);
    hurdle(b, 2.2, 8.7, 6.7, 8.7);
    hurdle(b, -6.7, -8.7, 6.7, -8.7);
    hurdle(b, -6.7, -8.7, -6.7, 8.7);
    hurdle(b, 6.7, -8.7, 6.7, 8.7);
    b.sym((s) => b.cyl(0.11, 1.6, post, { at: [1.0 + s * 1.2, 0, 8.7], segs: 6 }));

    // a pig pen and a vegetable plot behind the house
    hurdle(b, -6.4, -5.6, -3.0, -5.6, 0.9);
    hurdle(b, -3.0, -5.6, -3.0, -8.4, 0.9);
    b.group({ at: [-4.8, 0, -7.0], rotY: 0.5 }, () => {
      b.box(0.45, 0.45, 0.9, 0x5c4438, { at: [0, 0.2, 0] });
      b.box(0.3, 0.3, 0.3, 0x5c4438, { at: [0, 0.3, 0.55] });
    });
    vegBed(b, 1.2, -6.8, 3.4, 2.8, { rows: 5, color: P.crop });
    woodpile(b, [-5.95, 0, 2.0], 2.4);
    b.tree(b.range(4.8, 5.6), { at: [4.6, 0, -6.6], kind: 'round' });
    b.tree(b.range(1.4, 1.8), { at: [-6.0, 0, 7.4], kind: 'bush', color: P.hedge });
  },
};
