import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdles, patch } from './shared';

/** Walls of earth-fast posts with split-oak planks between them; a gap left for each door. */
function postWall(b: Builder, w: number, d: number, h: number, plank: number, doors: { side: '+z' | '-z' | '+x'; at: number }[]): void {
  b.box(w - 0.1, h, d - 0.1, plank);
  const step = 0.95;
  const nx = Math.round(w / step);
  const nz = Math.round(d / step);
  for (let i = 0; i <= nx; i++) {
    const x = -w / 2 + (w * i) / nx;
    for (const z of [-d / 2, d / 2]) b.cyl(0.11, h + 0.05, P.oakDark, { at: [x, 0, z], segs: 6 });
  }
  for (let j = 1; j < nz; j++) {
    const z = -d / 2 + (d * j) / nz;
    for (const x of [-w / 2, w / 2]) b.cyl(0.11, h + 0.05, P.oakDark, { at: [x, 0, z], segs: 6 });
  }
  for (const dr of doors) {
    if (dr.side === '+x') b.panel(0.95, 1.75, P.timberBlack, { at: [w / 2 - 0.02, 0, dr.at], facing: '+x' });
    else b.panel(0.95, 1.75, P.timberBlack, { at: [dr.at, 0, ((dr.side === '+z' ? 1 : -1) * (d - 0.1)) / 2], facing: dr.side });
  }
}

export const saxonHuts: BuildingDef = {
  id: 'saxon-huts',
  name: 'Anglo-Saxon farmstead',
  style: 'Early Anglo-Saxon vernacular',
  date: 'c. 450 to 650',
  summary:
    'When Roman rule ended the town emptied, and incoming Anglo-Saxon families settled among its ruins in the way they knew from home. ' +
    'A rectangular hall of earth-fast oak posts and planks held the household, with smaller sunken-floored huts beside it for weaving, storage or sleeping. ' +
    'There was no tile, mortar or straight street any more: everything was timber, thatch and wattle, and the family plot was marked off by a fence.',
  materials: ['oak posts and split planks', 'thatch', 'wattle'],
  lookFor: [
    { label: 'Earth-fast posts', note: 'Each wall post was set straight into a hole in the ground; archaeologists find these buildings as rows of post holes.', at: [-8.5, 1.2, 2.65] },
    { label: 'Doors in the middle of the long walls', note: 'The hall had opposed doorways halfway along each side, a habit brought from the Continent.', at: [-4, 1.0, 2.6] },
    { label: 'Sunken-featured building', note: 'A hut built over a shallow pit with a tent-like roof almost to the ground. Loom weights are often found in them.', at: [5.6, 1.8, 3.4] },
    { label: 'Fenced toft', note: 'A wattle fence enclosed the family plot (the toft) with its buildings, garden and animals.', at: [12.5, 1.0, 2] },
    { label: 'Ruined Roman wall', note: 'Settlers rarely reused Roman buildings; their crumbling walls stood as quarries and curiosities.', at: [-10.4, 1.6, -5.55] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.reed, tint(P.thatchOld, 0.06), P.thatch]);
    const plank = b.pick([P.oakSilver, tint(P.oakSilver, -0.06), P.oak]);
    patch(b, 25.2, 13.2, tint(P.earth, 0.06), [0, 0]);

    // the hall: 9 × 4.8 m, posts and planks, steep thatch, doors opposite in the long walls
    const hx = -4;
    const hz = 0.2;
    b.group({ at: [hx, 0, hz], rotY: b.range(-0.06, 0.06) }, () => {
      postWall(b, 9, 4.8, 1.9, plank, [
        { side: '+z', at: 0 },
        { side: '-z', at: 0 },
      ]);
      b.gable(9, 4.8, 3.3, thatch, { at: [0, 1.9, 0], overhang: 0.55, thick: 0.4, wall: plank });
      // a smoke hole: a gap in the gable ends under the ridge
      b.sym((s) => b.panel(0.6, 0.6, P.timberBlack, { at: [s * 4.5, 4.1, 0], facing: s > 0 ? '+x' : '-x', shape: 'circle' }));
    });

    // sunken-featured building: a pit with a low bank, tent roof to the ground, door in the gable end
    const sx = 5.6;
    const sz = 1.1;
    b.group({ at: [sx, 0, sz], rotY: b.range(-0.12, 0.12) }, () => {
      b.box(3.8, 0.3, 4.6, tint(P.earth, -0.06));
      b.gable(3.4, 4.2, 2.7, thatch, { at: [0, 0.3, 0], ridge: 'z', overhang: 0.25, thick: 0.35, wall: plank });
      b.panel(0.85, 1.4, P.timberBlack, { at: [0, 0.3, 2.12], facing: '+z' });
      b.box(0.14, 3.0, 0.14, P.oakDark, { at: [0, 0, 2.15] });
    });

    // small post-built store behind
    b.group({ at: [7.8, 0, -4.2], rotY: b.range(-0.1, 0.1) }, () => {
      postWall(b, 3.6, 2.6, 1.6, plank, [{ side: '+x', at: 0 }]);
      b.gable(3.6, 2.6, 2.0, thatch, { at: [0, 1.6, 0], overhang: 0.35, thick: 0.32, wall: plank });
    });

    // garden beds and a hearth outside the hall
    for (let i = 0; i < 5; i++) b.box(3.4, 0.16, 0.55, P.soil, { at: [1.5, 0, -3.6 - i * 0.75] });
    for (let i = 0; i < 5; i++) if (i % 2 === 0) b.box(3.2, 0.24, 0.28, P.leaf, { at: [1.5, 0.12, -3.6 - i * 0.75] });
    b.cyl(0.6, 0.12, P.rubble, { at: [-0.6, 0, 4.4], segs: 7 });
    b.cyl(0.45, 0.13, P.timberBlack, { at: [-0.6, 0, 4.4], segs: 7 });

    // the ruined Roman wall in the back corner: rubble with courses of red tile
    b.group({ at: [-9.6, 0, -5.9] }, () => {
      const segs = [
        [-2.0, 1.6],
        [-0.8, 2.4],
        [0.4, 1.8],
        [1.6, 0.9],
      ];
      for (const [x, h] of segs) {
        b.box(1.2, h, 0.6, P.rubble, { at: [x, 0, 0] });
        for (let y = 0.5; y < h - 0.1; y += 0.7) b.box(1.22, 0.12, 0.62, P.romanTile, { at: [x, y, 0], jitter: false });
      }
      b.blob(0.35, P.rubble, { at: [2.7, 0.15, 0.4], detail: 0 });
      b.blob(0.25, P.rubble, { at: [2.2, 0.1, 0.9], detail: 0 });
    });

    // the toft fence: wattle round the plot, open at the front where the track runs past
    const X = 12.5;
    const Z = 6.5;
    hurdles(b, [-X, -Z], [X, -Z], { h: 1.1 });
    hurdles(b, [-X, -Z], [-X, Z], { h: 1.1 });
    hurdles(b, [X, -Z], [X, Z], { h: 1.1 });
    hurdles(b, [-X, Z], [-2.4, Z], { h: 1.1 });
    hurdles(b, [1.6, Z], [X, Z], { h: 1.1 });
    // gate hurdle swung open
    hurdles(b, [-2.4, Z], [-2.0, Z - 1.6], { h: 1.0 });
  },
};
