import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { beam, hurdle } from './shared';

export const saxonGrubenhaus: BuildingDef = {
  id: 'saxon-grubenhaus',
  name: 'Sunken-featured building and hall',
  style: 'Early Anglo-Saxon',
  date: 'c. 450',
  summary:
    'When Roman rule ended the towns emptied, and the settlers who came from northern Germany and Denmark built in timber, thatch ' +
    'and earth as they had at home. A family farmstead had a rectangular hall on earth-fast posts and one or more small huts built ' +
    'over a pit, which archaeologists call sunken-featured buildings or Grubenhäuser. Many held a loom, judging by the clay loom ' +
    'weights found in them; whether the pit was the floor or was covered by planks is still argued. Tile, mortar and squared ' +
    'masonry had all gone: nothing like the strip house was built again for centuries.',
  materials: ['oak posts', 'split-plank and wattle walls', 'daub', 'straw thatch'],
  lookFor: [
    {
      label: 'Thatch to the ground',
      note: 'The hut has no side walls at all: the two slopes of thatch run straight down to the earth like a tent.',
      at: [4.9, 1.6, 4.2],
    },
    {
      label: 'Sunken pit',
      note: 'The hut stands over a pit about half a metre deep, with the dug earth banked round the edge; here the low door steps down into it.',
      at: [3.4, 0.6, 5.8],
    },
    {
      label: 'Gable posts',
      note: 'One post at each gable end carries the ridge pole; two large postholes are the tell-tale sign of these huts in excavations.',
      at: [3.4, 3.0, 5.5],
    },
    {
      label: 'Earth-fast post hall',
      note: 'The main house is built on posts set straight into holes in the ground, so it rotted and was rebuilt every generation or so.',
      at: [-2.6, 1.6, -1.8],
    },
  ],
  build(b) {
    const thatch = b.pick([P.thatchOld, tint(P.thatch, -0.06), P.reed]);
    const plank = tint(P.oak, b.range(0, 0.06));
    const daub = tint(P.daub, -0.04);

    // ---- sunken-featured building, front right
    const gx = b.pick([3.4, 3.2]);
    const gz = 3.4;
    const gw = 3.6; // across
    const gl = 4.4; // along the ridge (z)
    const gh = 2.7;
    b.group({ at: [gx, 0, gz] }, () => {
      // spoil bank round the pit
      b.box(gw + 1.0, 0.18, gl + 0.8, tint(P.earth, 0.04), { at: [0, 0, 0] });
      b.gable(gw, gl, gh, thatch, { at: [0, 0.12, 0], ridge: 'z', thick: 0.45, wall: plank });
      b.sym((s) => {
        // gable end: split planks and a low door down into the pit
        b.panel(0.9, 1.35, P.timberBlack, { at: [0, 0.12, s * gl / 2], facing: s > 0 ? '+z' : '-z', depth: 0.03 });
        // gable post, standing proud of the end wall, and ridge pole ends
        b.cyl(0.11, gh + 0.55, P.oakDark, { at: [0, 0, s * (gl / 2 + 0.12)], segs: 6 });
      });
      b.log(0.08, gl + 0.7, P.oakDark, { at: [0, gh + 0.4, 0], axis: 'z', segs: 6 });
      // plank lines on the front gable
      for (const x of spread(6, -gw / 2 + 0.5, gw / 2 - 0.5)) {
        if (Math.abs(x) > 0.5) b.box(0.03, gh * (1 - Math.abs(x) / (gw / 2)) * 0.9, 0.02, tint(plank, -0.12), { at: [x, 0.15, gl / 2 + 0.02] });
      }
      // two steps down, seen as dark treads at the threshold
      b.box(0.9, 0.04, 0.4, P.soil, { at: [0, 0.14, gl / 2 + 0.25] });
    });

    // ---- the hall, at the back
    const hw = b.pick([9, 9.6]);
    const hd = 4.8;
    const hz = -4.6;
    const eave = 2.1;
    b.group({ at: [0, 0, hz] }, () => {
      b.box(hw, eave, hd, daub);
      // earth-fast posts all round, close-set
      b.sym((s) => {
        for (const x of spread(Math.round(hw / 0.95), -hw / 2 + 0.1, hw / 2 - 0.1)) {
          b.box(0.18, eave, 0.12, P.oak, { at: [x, 0, s * (hd / 2 + 0.02)] });
        }
      });
      for (const z of spread(5, -hd / 2 + 0.1, hd / 2 - 0.1)) {
        b.sym((s) => b.box(0.12, eave, 0.18, P.oak, { at: [s * (hw / 2 + 0.02), 0, z] }));
      }
      // doors in the middle of both long walls, opposite each other
      b.panel(1.1, 1.9, P.oakDark, { at: [0, 0, hd / 2 + 0.06], facing: '+z' });
      b.panel(1.1, 1.9, P.oakDark, { at: [0, 0, -hd / 2 - 0.06], facing: '-z' });
      // steep thatch, gabled, with ridge
      b.gable(hw, hd, 3.2, thatch, { at: [0, eave, 0], overhang: 0.55, thick: 0.45, wall: daub });
      b.log(0.12, hw + 1.0, tint(thatch, -0.12), { at: [0, eave + 3.25, 0], segs: 6 });
    });
    // the smoke gaps sit on the gable faces
    b.sym((s) => b.panel(0.5, 0.45, P.timberBlack, { at: [s * (hw / 2 + 0.01), eave + 1.9, hz], facing: s > 0 ? '+x' : '-x' }));

    // ---- yard: fence, woodpile, a clay oven and a small cultivated plot
    hurdle(b, -6.6, 7.6, 0.6, 7.6, 1.0);
    hurdle(b, -6.6, 7.6, -6.6, -1.4, 1.0);
    b.dome(0.75, tint(P.cob, -0.08), { at: [-1.8, 0, 2.2], squash: 0.8, segs: 8 });
    b.panel(0.35, 0.35, P.timberBlack, { at: [-1.8, 0.05, 2.95], facing: '+z' });
    for (const z of spread(5, 2.0, 6.4)) b.box(3.0, 0.12, 0.45, P.soil, { at: [-4.4, 0, z] });
    for (const z of spread(5, 2.0, 6.4)) for (const x of spread(4, -5.6, -3.2)) b.blob(0.16, P.leaf, { at: [x, 0.2, z], detail: 0 });
    beam(b, [5.6, 0, -0.8], [5.6, 1.4, -0.4], 0.08, 0.08, P.bark);
    for (let i = 0; i < 4; i++) b.log(0.1, 1.5, tint(P.bark, 0.04 * i), { at: [5.6, i * 0.18, -1.4 + (i % 2) * 0.1], axis: 'z', segs: 6 });
  },
};
