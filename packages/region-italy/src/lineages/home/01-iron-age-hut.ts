import { P, tint, type BuildingDef } from '@ah/kit';
import { ovalRoof, vegBed } from './shared';

export const ironAgeHut: BuildingDef = {
  id: 'iron-age-hut',
  name: 'Oval hut',
  style: 'Latial Iron Age',
  date: 'c. 750 BC',
  summary:
    'The first houses on the hill were single-roomed huts, oval or rectangular with rounded corners and five or six metres long. ' +
    'A ring of posts set in holes cut in the soft tufa carried walls of wattle daubed with clay and a steep roof of thatch, with ' +
    'a hearth inside and a small porch at the door. We know them from the post-holes found on the Palatine in Rome and from the ' +
    'clay urns shaped like huts in which the people of Latium and southern Etruria buried the ashes of their dead.',
  materials: ['timber posts', 'wattle and clay daub', 'reed and straw thatch', 'tufa bedrock'],
  lookFor: [
    {
      label: 'Crossed ridge timbers',
      note: 'Pairs of poles crossed over the ridge held the thatch down against the wind; the hut urns show them clearly, sometimes carved as birds’ heads.',
      at: [0, 4.15, 0.6],
    },
    {
      label: 'Porch',
      note: 'Two posts in front of the door carry a short roof, a sheltered place to work in the doorway; it is marked by two extra post-holes on the Palatine.',
      at: [0.75, 1.5, 4.15],
    },
    {
      label: 'Wattle and daub',
      note: 'Woven branches plastered with clay mixed with chaff, laid between the posts: cheap, quick, and easily patched after the rains.',
      at: [-2.1, 0.9, -0.6],
    },
    {
      label: 'Post frame',
      note: 'A ring of posts in holes cut into the rock; the holes are all that survive, and from them archaeologists work out the shape of the hut.',
      at: [2.25, 1.2, 0],
    },
    {
      label: 'Steep thatch',
      note: 'Thatch must be steep, around fifty degrees, to shed rain; the roof comes down low over the walls to keep them dry.',
      at: [1.4, 2.6, -1.6],
    },
  ],
  build(b) {
    const a = 2.15; // half-width of the wall oval (X)
    const c = 3.0; // half-length (Z)
    const wallH = 1.5;
    const daub = tint(b.pick([P.daub, P.cob, tint(P.daub, -0.05)]), b.range(-0.02, 0.02));
    const thatch = b.pick([P.thatch, P.reed, tint(P.thatch, -0.05)]);
    const post = P.oak;

    // a low platform of trodden earth and tufa outcrop
    b.cyl(1, 0.12, P.earth, { at: [0, 0, 0.3], segs: 14 });
    b.group({ scale: [a + 1.4, 1, c + 1.9] }, () => b.cyl(1, 0.06, tint(P.earth, 0.04), { segs: 16 }));

    // walls: wattle and daub on the post ring
    b.group({ scale: [a, 1, c] }, () => b.cyl(1, wallH, daub, { segs: 20 }));
    const nPost = 14;
    for (let i = 0; i < nPost; i++) {
      const t = ((i + 0.5) / nPost) * Math.PI * 2;
      const x = Math.sin(t) * (a + 0.05);
      const z = Math.cos(t) * (c + 0.05);
      if (z > c - 0.4) continue; // leave the door free
      b.cyl(0.09, wallH + 0.05, post, { at: [x, 0, z], segs: 5 });
    }
    // wattle weave showing at the bottom where the daub has washed off
    b.group({ scale: [a + 0.03, 1, c + 0.03] }, () => b.cyl(1, 0.3, P.wattle, { segs: 20 }));

    // door with a timber frame
    const zf = c;
    b.panel(0.95, 1.4, P.oakDark, { at: [0, 0.08, zf - 0.04], facing: '+z', depth: 0.08 });
    b.panel(0.75, 1.3, P.timberBlack, { at: [0, 0.08, zf], facing: '+z', depth: 0.08 });
    b.box(1.2, 0.12, 0.5, P.tufa, { at: [0, 0, zf + 0.2] }); // threshold slab

    // the roof: steep thatch on an oval, with a short ridge along the hut
    const eaves = wallH - 0.05;
    const rise = 2.75;
    ovalRoof(b, a + 0.55, c + 0.55, rise, 1.6, thatch, { at: [0, eaves, 0], segs: 22, skirt: 0.32 });
    const ry = eaves + rise;
    b.log(0.1, 3.7, P.oakDark, { at: [0, ry - 0.06, 0], axis: 'z', segs: 6 });
    // crossed timbers over the ridge
    for (const z of [-1.5, -0.75, 0, 0.75, 1.5]) {
      b.sym((s) => b.beam([s * 0.75, ry - 0.72, z], [-s * 0.32, ry + 0.38, z], 0.09, 0.09, P.oakDark));
    }
    // smoke holes at the ridge ends
    b.sym((s) => {
      b.extrude([[-0.28, 0], [0.28, 0], [0, 0.4]], 0.08, P.timberBlack, { at: [0, ry - 0.55, s * 1.92], rotY: s > 0 ? 0 : Math.PI });
    });

    // porch on two posts
    const pz = zf + 1.15;
    b.sym((s) => b.cyl(0.1, 1.75, post, { at: [s * 0.75, 0, pz], segs: 6 }));
    b.box(1.8, 0.14, 0.14, post, { at: [0, 1.75, pz] });
    b.gable(1.9, 1.5, 0.75, thatch, { at: [0, 1.82, zf + 0.55], ridge: 'z', overhang: 0.15, thick: 0.25 });

    // household things: a storage jar, a quern, a log pile, a fenced plot with a pig
    b.cyl(0.32, 0.7, tint(P.mud, 0.08), { at: [-1.4, 0, zf - 0.1], rTop: 0.2, segs: 8 });
    b.cyl(0.3, 0.25, P.peperino, { at: [1.5, 0, zf - 0.3], segs: 8 });
    for (let i = 0; i < 4; i++) b.log(0.09, 1.3, P.bark, { at: [2.5, i * 0.17, -1.2 + (i % 2) * 0.1], axis: 'z', segs: 5 });

    // a hearth outside for summer cooking
    b.cyl(0.55, 0.12, P.peperino, { at: [-2.9, 0, 2.6], segs: 8 });
    b.cyl(0.35, 0.14, P.timberBlack, { at: [-2.9, 0, 2.6], segs: 8 });

    // hurdle-fenced pen behind, with crops beside it
    const pen = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) }, () => {
        b.box(0.06, 0.9, len, P.wattle, { at: [0, 0.05, 0] });
        for (let i = 0; i <= Math.round(len / 1.1); i++) b.cyl(0.04, 1.05, P.oak, { at: [0, 0, -len / 2 + (i * len) / Math.round(len / 1.1)], segs: 4 });
      });
    };
    pen(-5.5, -4.6, -1.5, -4.6);
    pen(-5.5, -7.8, -1.5, -7.8);
    pen(-5.5, -4.6, -5.5, -7.8);
    pen(-1.5, -4.6, -1.5, -6.6);
    b.group({ at: [-3.3, 0, -6.4], rotY: 0.6 }, () => {
      b.box(0.45, 0.45, 0.9, 0x6a5048, { at: [0, 0.22, 0] });
      b.box(0.3, 0.3, 0.3, 0x6a5048, { at: [0, 0.32, 0.55] });
    });
    vegBed(b, 3.4, -6.0, 3.0, 4.4, { rows: 5, color: P.crop });
    b.tree(b.range(5, 6), { at: [-5.0, 0, -1.6], kind: 'round' });
    b.tree(b.range(1.4, 1.8), { at: [-5.2, 0, 6.6], kind: 'bush', color: P.hedge });
    b.tree(b.range(1.2, 1.6), { at: [-6.0, 0, 5.2], kind: 'bush', color: P.hedge });
  },
};
