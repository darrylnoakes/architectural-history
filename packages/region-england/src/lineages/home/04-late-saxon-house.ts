import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { hurdle } from './shared';

export const lateSaxonHouse: BuildingDef = {
  id: 'late-saxon-house',
  name: 'Timber town house',
  style: 'Late Saxon and Norman timber building',
  date: 'c. 900 to 1200',
  summary:
    'From the 880s the kings of Wessex and the rulers of Mercia founded fortified towns called burhs, with measured streets ' +
    'and long, narrow house plots. The house is still a thatched timber building with posts set in the ground and an open hearth, ' +
    'but where the farmstead before it spread across an open yard, this house stands with its gable end on the street, and the yard behind is ' +
    'busy with a workshop, a well and rubbish pits. Excavations at Coppergate in York and in the City of London have found plots like this. ' +
    'Ordinary town houses went on being built this way, in timber and thatch, for a century and more after the Norman Conquest.',
  materials: ['split oak planks and posts', 'wattle and daub', 'straw thatch', 'wattle fencing'],
  lookFor: [
    {
      label: 'Gable to the street',
      note: 'The narrow end faces the street so that many plots can share the frontage: a sign that this is now a planned town.',
      at: [-1.5, 3.6, 6.7],
    },
    {
      label: 'Plank walls',
      note: 'Upright split-oak planks set between posts sunk into the earth. Houses were still built wholly of timber; stone was kept for churches.',
      at: [1.2, 1.2, 3.0],
    },
    {
      label: 'Smoke vent',
      note: 'There is no chimney. Smoke from the hearth in the middle of the floor drifts out through an opening high in the gable, under the ridge.',
      at: [-1.5, 5.3, 6.6],
    },
    {
      label: 'Tenement fence',
      note: 'Wattle fences mark a long plot running back from the street. Boundaries laid out like this often survive as property lines today.',
      at: [6.5, 1.1, -2.0],
    },
    {
      label: 'Workshop and well',
      note: 'The yard is a workplace: a wattle-walled shed for a craft such as leather or bone working, a barrel-lined well and a pit for rubbish.',
      at: [3.2, 2.2, -5.4],
    },
  ],
  build(b) {
    const W = 5.0; // across the street front
    const L = b.pick([9.4, 9.8]);
    const cx = -1.5;
    const zf = 6.5; // street gable
    const zc = zf - L / 2;
    const wallH = 2.0;
    const roofH = 3.5;
    const plank = b.pick([P.oak, tint(P.oak, 0.05), P.oakSilver]);
    const thatch = b.pick([P.thatch, P.thatchOld, tint(P.thatch, -0.05)]);

    // plank walls on a sill beam, with the earthfast posts showing proud of the planking
    b.box(W + 0.12, 0.22, L + 0.12, P.oakDark, { at: [cx, 0, zc] });
    b.box(W, wallH - 0.2, L, plank, { at: [cx, 0.2, zc] });
    for (const z of spread(6, zf - L, zf)) {
      for (const s of [1, -1]) b.box(0.24, wallH + 0.05, 0.24, P.oakDark, { at: [cx + (s * W) / 2, 0, z] });
    }
    for (const s of [1, -1]) {
      for (const x of [-W / 2, 0, W / 2]) b.box(0.24, wallH + 0.05, 0.24, P.oakDark, { at: [cx + x, 0, zc + (s * L) / 2] });
    }
    // the joints between the upright planks
    for (const z of spread(18, zf - L, zf)) {
      for (const s of [1, -1]) {
        b.panel(0.05, wallH - 0.3, tint(plank, -0.12), { at: [cx + (s * W) / 2, 0.25, z], facing: s > 0 ? '+x' : '-x', depth: 0.03 });
      }
    }

    // steep thatched roof, ridge running back from the street, with a planked gable and a smoke vent
    b.gable(W, L, roofH, thatch, { at: [cx, wallH, zc], ridge: 'z', overhang: 0.5, thick: 0.4, wall: plank });
    b.log(0.14, L + 0.9, tint(thatch, -0.12), { at: [cx, wallH + roofH + 0.3, zc], axis: 'z', segs: 6 });
    for (const s of [1, -1]) {
      b.panel(0.6, 0.5, P.timberBlack, { at: [cx, wallH + roofH - 1.25, zc + (s * L) / 2], facing: s > 0 ? '+z' : '-z', depth: 0.04 });
    }

    // street door in the gable, a side door to the yard, and small shuttered openings
    b.panel(1.05, 1.75, P.oakDark, { at: [cx - 0.6, 0.2, zf], facing: '+z' });
    b.box(1.5, 0.12, 0.5, P.oakDark, { at: [cx - 0.6, 0, zf + 0.25] });
    b.window(0.5, 0.45, { at: [cx + 1.3, 1.1, zf], facing: '+z', frame: P.oakDark, bars: [1, 1] });
    b.panel(0.95, 1.7, P.oakDark, { at: [cx + W / 2, 0.2, zc - 2.2], facing: '+x' });
    b.window(0.5, 0.4, { at: [cx + W / 2, 1.15, zc + 1.6], facing: '+x', frame: P.oakDark, bars: [1, 1] });
    b.window(0.5, 0.4, { at: [cx - W / 2, 1.15, zc + 0.4], facing: '-x', frame: P.oakDark, bars: [1, 1] });

    // the yard: trodden earth, a wattle workshop with a lean-to thatch, a barrel-lined well and a rubbish pit
    b.box(6.2, 0.03, 9.5, tint(P.earth, 0.05), { at: [2.4, 0, -3.6], jitter: false });
    const wx = 3.3;
    const wz = -5.6;
    b.box(3.4, 1.5, 2.8, P.wattle, { at: [wx, 0, wz] });
    for (const x of [-1.7, 0, 1.7]) for (const z of [-1.4, 1.4]) b.cyl(0.08, 1.7, P.oak, { at: [wx + x, 0, wz + z], segs: 5 });
    b.gable(3.4, 2.8, 1.6, tint(thatch, -0.04), { at: [wx, 1.5, wz], overhang: 0.35, thick: 0.3, wall: P.wattle });
    b.panel(0.8, 1.3, P.timberBlack, { at: [wx - 0.5, 0.05, wz + 1.4], facing: '+z' });
    // well
    b.cyl(0.55, 0.5, P.oak, { at: [0.6, 0, -6.6], segs: 9 });
    b.cyl(0.42, 0.52, P.timberBlack, { at: [0.6, 0, -6.6], segs: 9, jitter: false });
    b.cyl(0.05, 1.5, P.oakDark, { at: [0.0, 0, -6.6], segs: 4 });
    b.box(1.3, 0.06, 0.06, P.oakDark, { at: [0.55, 1.45, -6.6], rot: [0, 0, 0.25] });
    // rubbish pit and a stack of firewood
    b.cyl(0.8, 0.05, P.soil, { at: [4.6, 0.01, -1.8], segs: 9, jitter: false });
    for (let i = 0; i < 3; i++) b.log(0.11, 1.7, tint(P.bark, 0.04 * i), { at: [cx + W / 2 + 0.5, i * 0.19, 3.4 + (i % 2) * 0.1], axis: 'z', segs: 6 });

    // tenement boundaries: wattle fences down both sides and across the back
    hurdle(b, -6.6, zf - 0.4, -6.6, -8.6, 1.2);
    hurdle(b, 6.6, zf - 0.4, 6.6, -8.6, 1.2);
    hurdle(b, -6.6, -8.6, 6.6, -8.6, 1.2);
    // a strip of garden behind the house
    for (const x of spread(4, -5.9, -2.6)) b.box(0.5, 0.12, 4.2, P.soil, { at: [x, 0, -5.9] });
    for (const x of spread(4, -5.9, -2.6)) for (const z of spread(5, -7.8, -4.0)) b.blob(0.16, P.leaf, { at: [x, 0.22, z], detail: 0 });

    b.collider(W, L, { at: [cx, 0, zc] });
    b.collider(3.4, 2.8, { at: [wx, 0, wz] });
  },
};
