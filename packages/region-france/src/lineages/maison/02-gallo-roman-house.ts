import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { pitched, vegBed, well, yardWall } from './shared';

export const galloRomanHouse: BuildingDef = {
  id: 'gallo-roman-house',
  name: 'Strip house with shop',
  style: 'Gallo-Roman',
  date: 'c. AD 30 to 250',
  summary:
    'In the new Roman town the plots along the streets were cut long and narrow, and on them rose strip houses: a shop or workshop open to the street, rooms for the family behind and above, and a yard at the back. ' +
    'The walls are still Gaulish timber and cob, but now they stand on a sill of mortared stone, are finished with lime plaster, and carry a Roman roof of flat tegulae and half-round imbrices. ' +
    'Under the back room is a cellar lined with stone, reached by a stair and fitted with niches for lamps and jars: cellars of this kind are a speciality of the towns of northern Gaul.',
  materials: ['mortared rubble sill', 'oak frame and cob', 'lime plaster', 'tegulae and imbrices', 'stone cellar'],
  influences: ['roman-conquest'],
  lookFor: [
    {
      label: 'Open shop front',
      note: 'By day the whole street end stands open behind a masonry counter; at night it is closed with boards slid into a groove in the sill.',
      at: [-2.9, 1.4, 8.3],
    },
    {
      label: 'Stone sill',
      note: 'A low wall of mortared rubble keeps the timber frame and cob out of the wet ground, a Roman improvement on posts sunk in the earth.',
      at: [-6.75, 0.35, 0.0],
    },
    {
      label: 'Tegulae and imbrices',
      note: 'Flat tiles with raised edges laid side by side, the joints capped by half-round tiles: the Roman roof, heavy and fireproof, at a low pitch.',
      at: [-1.3, 4.6, 0.5],
    },
    {
      label: 'Cellar stair',
      note: 'Steps under a little tiled hood lead down to a stone cellar, cool for storing wine, oil and grain, with niches in its walls.',
      at: [1.65, 0.5, -1.6],
    },
    {
      label: 'Well',
      note: 'A shaft lined with stone in the back yard: every house of any standing had its own water.',
      at: [4.3, 1.1, 0.6],
    },
  ],
  build(b) {
    const plaster = tint(b.pick([P.limewash, P.plaster, P.cream, P.ochreWash]), b.range(-0.02, 0.02));
    const timber = mix(P.oak, plaster, 0.25);
    const sill = tint(P.rubble, b.range(-0.04, 0.03));
    const tile = tint(P.romanTile, b.range(-0.05, 0.03));
    const xc = -2.9;
    const W = 7.6;
    const zF = 7.8;
    const zB = -3.6;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const sh = 0.6; // stone sill height
    const eaves = 3.7;

    // the stone sill, broken at the shop front
    b.box(0.5, sh, D, sill, { at: [xc - W / 2 + 0.2, 0, zc] });
    b.box(0.5, sh, D, sill, { at: [xc + W / 2 - 0.2, 0, zc] });
    b.box(W, sh, 0.5, sill, { at: [xc, 0, zB + 0.2] });
    b.sym((s) => b.box(1.0, sh, 0.5, sill, { at: [xc + s * (W / 2 - 0.5), 0, zF - 0.2] }));
    // timber-framed walls of cob, plastered
    b.box(W - 0.1, eaves - sh, D - 0.1, plaster, { at: [xc, sh, zc] });
    for (const s of [1, -1] as const) {
      b.frame(D - 0.1, eaves - sh, timber, { at: [xc + s * (W / 2 - 0.05), sh, zc], facing: s > 0 ? '+x' : '-x', studs: 9, rails: 1, brace: 'corner', beam: 0.16, depth: 0.04 });
    }
    b.frame(W - 0.1, eaves - sh, timber, { at: [xc, sh, zB + 0.05], facing: '-z', studs: 4, rails: 1, brace: 'corner', beam: 0.16, depth: 0.04 });

    // the shop front: an opening across most of the street end, a counter, the night boards
    const ow = W - 2.2;
    b.box(ow, 2.7, 0.6, P.windowDark, { at: [xc, 0, zF - 0.26], jitter: false });
    b.box(ow + 0.4, 0.3, 0.3, P.oak, { at: [xc, 2.7, zF + 0.02] });
    b.sym((s) => b.box(0.25, 2.7, 0.3, P.oak, { at: [xc + s * (ow / 2 + 0.05), 0, zF + 0.02] }));
    b.box(ow - 1.2, 0.95, 0.6, sill, { at: [xc + 0.6, 0, zF + 0.1] }); // masonry counter
    b.box(ow - 1.1, 0.08, 0.7, P.limestone, { at: [xc + 0.6, 0.95, zF + 0.1], jitter: false });
    // jars sunk in the counter and wares on it
    for (let i = 0; i < 3; i++) b.cyl(0.18, 0.06, P.timberBlack, { at: [xc - 0.6 + i * 1.0, 1.0, zF + 0.1], segs: 8, jitter: false });
    b.cyl(0.14, 0.3, P.terracotta, { at: [xc + 2.2, 1.03, zF + 0.1], rTop: 0.08, segs: 8 });
    b.cyl(0.12, 0.2, tint(P.terracotta, -0.1), { at: [xc + 2.5, 1.03, zF + 0.05], segs: 8 });
    // amphorae leaning by the door
    for (let i = 0; i < 3; i++) {
      b.group({ at: [xc - W / 2 + 0.5 + i * 0.45, 0, zF + 0.5], rot: [0.12, 0, 0] }, () => {
        b.cyl(0.07, 0.25, P.terracotta, { rTop: 0.2, segs: 7 });
        b.cyl(0.2, 0.55, P.terracotta, { at: [0, 0.25, 0], rTop: 0.09, segs: 7 });
        b.cyl(0.06, 0.25, P.terracotta, { at: [0, 0.8, 0], segs: 6 });
      });
    }
    // shutter boards stacked against the wall
    for (let i = 0; i < 3; i++) b.box(0.6, 2.4, 0.05, P.oak, { at: [xc + W / 2 - 0.75 + i * 0.06, 0, zF + 0.25 + i * 0.06], rot: [-0.08, 0, 0] });
    // loft window in the gable, a red band at the foot of the plaster
    b.window(0.9, 0.7, { at: [xc, 3.1, zF + 0.0], facing: '+z', frame: P.oak, glass: P.timberBlack });
    b.box(W - 0.05, 0.22, 0.04, P.intonacoRed, { at: [xc, 2.98, zF - 0.03], jitter: false });

    // roof of tegulae and imbrices at a low Roman pitch
    pitched(b, W, D, 2.1, tile, { at: [xc, eaves, zc], ridge: 'z', overhang: 0.55, ends: 0.45, wall: plaster, thick: 0.14, ribs: 0.46 });
    b.extrude([[-W / 2, 0], [W / 2, 0], [0, 2.1]], 0.06, timber, { at: [xc, eaves, zF + 0.0] });
    b.extrude([[-W / 2 + 0.2, 0.1], [W / 2 - 0.2, 0.1], [0, 1.95]], 0.07, plaster, { at: [xc, eaves, zF + 0.02] });

    // side door to the yard, back door, small windows with shutters
    b.panel(1.0, 2.1, P.oakDark, { at: [xc + W / 2, sh, 3.0], facing: '+x' });
    b.box(1.2, sh, 0.6, P.limestone, { at: [xc + W / 2 + 0.3, 0, 3.0] });
    b.panel(0.95, 2.1, P.oakDark, { at: [xc - 1.6, sh, zB], facing: '-z' });
    b.box(1.2, sh, 0.7, P.limestone, { at: [xc - 1.6, 0, zB - 0.35] });
    for (const z of [5.4, -0.6]) b.window(0.7, 0.6, { at: [xc + W / 2, 2.0, z], facing: '+x', frame: P.oak, glass: P.timberBlack });
    b.window(0.7, 0.6, { at: [xc + 1.6, 2.0, zB], facing: '-z', frame: P.oak, glass: P.timberBlack });

    // the cellar stair, under a tiled hood, beside the house; a vent slot in the sill
    const cx = xc + W / 2 + 0.75;
    b.box(1.5, 0.22, 3.2, P.limestone, { at: [cx, 0, -1.6] });
    for (let i = 0; i < 6; i++) b.box(1.0, 0.03, 0.42, tint(P.limestone, -0.12 - i * 0.09), { at: [cx, 0.22, -0.2 - i * 0.44], jitter: false });
    b.box(1.0, 0.04, 0.3, P.timberBlack, { at: [cx, 0.22, -3.0], jitter: false });
    b.sym((s) => b.box(0.12, 1.75, 0.12, P.oak, { at: [cx + s * 0.62, 0.22, 0.05] }));
    b.box(1.4, 0.12, 0.12, P.oak, { at: [cx, 1.97, 0.05] });
    b.beam([cx - 0.62, 2.0, 0.05], [cx - 0.62, 2.6, -3.1], 0.1, 0.1, P.oak);
    b.beam([cx + 0.62, 2.0, 0.05], [cx + 0.62, 2.6, -3.1], 0.1, 0.1, P.oak);
    b.group({ at: [cx, 2.08, -1.55], rot: [Math.atan2(0.6, 3.15), 0, 0] }, () => b.box(1.7, 0.1, 3.5, tile));
    for (const x of [-0.5, 0, 0.5]) b.group({ at: [cx + x, 2.17, -1.55], rot: [Math.atan2(0.6, 3.15), 0, 0] }, () => b.box(0.12, 0.08, 3.5, tint(tile, -0.06), { jitter: false }));
    b.panel(0.5, 0.25, P.timberBlack, { at: [xc - W / 2 - 0.05, 0.15, -1.5], facing: '-x', depth: 0.05 });
    b.panel(0.5, 0.25, P.timberBlack, { at: [xc + 1.4, 0.15, zB - 0.05], facing: '-z', depth: 0.05 });

    // the yard: walls, a gate to the street, the well, a bread oven, a garden
    const wall = tint(P.rubble, 0.04);
    yardWall(b, 1.0, 8.6, 2.6, 8.6, 1.6, wall, tile);
    yardWall(b, 5.4, 8.6, 6.75, 8.6, 1.6, wall, tile);
    b.box(2.8, 0.25, 0.4, P.oak, { at: [4.0, 2.25, 8.6] });
    b.sym((s) => b.box(0.3, 2.5, 0.4, wall, { at: [4.0 + s * 1.4, 0, 8.6] }));
    yardWall(b, 6.75, 8.6, 6.75, -8.75, 1.6, wall, tile);
    yardWall(b, -6.75, -8.75, 6.75, -8.75, 1.6, wall, tile);
    yardWall(b, -6.75, zB, -6.75, -8.75, 1.6, wall, tile);
    b.box(5.8, 0.03, 17.2, tint(P.earth, 0.12), { at: [3.85, 0, -0.1], jitter: false });
    b.box(7.3, 0.03, 5.0, tint(P.earth, 0.12), { at: [-3.1, 0, -6.2], jitter: false });
    well(b, [4.3, 0, 0.6], P.limestone, { frame: 'wood' });
    b.dome(0.95, tint(P.mud, 0.2), { at: [-4.5, 0, -6.7], squash: 0.85, segs: 10 });
    b.box(0.5, 0.45, 0.25, P.timberBlack, { at: [-4.5, 0, -5.8] });
    vegBed(b, 3.6, -6.3, 4.4, 3.6, { rows: 6 });
    vegBed(b, -1.2, -6.8, 2.8, 2.4, { rows: 4, color: P.leafDark });
    b.tree(b.range(4.2, 5.0), { at: [0.9, 0, -5.0], kind: 'round', color: P.leafDark });
  },
};
