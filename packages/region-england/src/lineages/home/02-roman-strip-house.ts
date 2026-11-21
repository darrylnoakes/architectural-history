import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { beam, hurdle } from './shared';

export const romanStripHouse: BuildingDef = {
  id: 'roman-strip-house',
  name: 'Strip house',
  style: 'Romano-British',
  date: 'c. AD 80',
  summary:
    'Within a generation of the conquest the new towns were lined with strip houses: long, narrow buildings set end-on to the street ' +
    'so that as many traders as possible had a frontage. The front room was an open shop or workshop, closed at night with ' +
    'shutters, and the family lived in the rooms behind. The walls are still timber and clay, but they stand on stone footings, ' +
    'the corners are square and the roof is of fired clay tiles: Roman ways of building that were new to most of Britain.',
  materials: ['timber frame', 'wattle and daub, plastered and limewashed', 'flint and mortar footings', 'fired clay tegulae and imbrices'],
  lookFor: [
    {
      label: 'Gable end to the street',
      note: 'The house turns its narrow end to the street, so dozens of shops could share a short length of frontage.',
      at: [0, 4.6, 5.6],
    },
    {
      label: 'Open shop front',
      note: 'The whole front wall opens up by day; at night boards slotted into a groove in the sill close it.',
      at: [-1.6, 1.4, 5.7],
    },
    {
      label: 'Tegulae and imbrices',
      note: 'Flat tiles with raised edges (tegulae) laid side by side, their joints capped with half-round tiles (imbrices) that make the ribbed look.',
      at: [2.4, 4.3, 0],
    },
    {
      label: 'Portico',
      note: 'A covered walk along the street front, supported on timber posts, kept shoppers dry and joined the frontages into one long colonnade.',
      at: [2.9, 2.6, 7.5],
    },
    {
      label: 'Stone footings',
      note: 'A low dwarf wall of flint in lime mortar kept the timber sill out of the damp, a Roman improvement that made walls last far longer.',
      at: [3.25, 0.3, -3],
    },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const W = 6.2;
    const L = b.pick([11, 11.6, 12]);
    const zf = 5.8; // front wall
    const zb = zf - L; // back wall
    const H = 3.0; // eaves
    const sill = 0.5;
    const plaster = b.pick([P.limewash, P.plaster, tint(P.ochreWash, 0.08)]);
    const footing = P.flint;
    const tile = tint(P.romanTile, b.range(-0.04, 0.03));
    const shopD = 3.6;

    // footings: a dwarf wall of flint all round
    b.box(W + 0.12, sill, L + 0.12, footing, { at: [0, 0, (zf + zb) / 2] });

    // rear living block: solid
    const rearLen = L - shopD;
    b.box(W, H - sill, rearLen, plaster, { at: [0, sill, zb + rearLen / 2] });
    // shop room: side walls and partition, open to the street
    b.sym((s) => b.box(0.22, H - sill, shopD, plaster, { at: [s * (W / 2 - 0.11), sill, zf - shopD / 2] }));
    b.box(W, 0.6, 0.22, plaster, { at: [0, H - 0.6, zf - 0.11] }); // lintel beam zone over the opening
    b.box(W - 0.4, 0.04, shopD, tint(P.earth, 0.1), { at: [0, 0.02, zf - shopD / 2] }); // beaten floor
    // corner posts and lintel of the shop front
    b.sym((s) => b.box(0.24, H - sill, 0.24, P.oak, { at: [s * (W / 2 - 0.12), sill, zf - 0.12] }));
    b.box(W, 0.24, 0.26, P.oak, { at: [0, H - 0.6, zf - 0.12] });
    // sill beam with its shutter groove, and the shutters stacked at one side
    b.box(W - 0.48, 0.14, 0.26, P.oakDark, { at: [0, sill, zf - 0.12] });
    for (let i = 0; i < 5; i++) b.box(0.06, 2.0, 0.5, tint(P.oak, 0.04 * (i % 2)), { at: [W / 2 - 0.4 - i * 0.07, sill, zf - 0.9], rotY: 0.04 });
    // counter of masonry across most of the opening, with a gap to walk in
    b.box(3.0, 0.95, 0.6, tint(plaster, -0.05), { at: [-0.9, 0, zf - 0.6] });
    b.box(3.1, 0.06, 0.7, P.limestone, { at: [-0.9, 0.95, zf - 0.6] });
    // wares: amphorae and bowls
    const pot = (x: number, z: number, y = 0) =>
      b.lathe([[0.01, 0], [0.08, 0.05], [0.2, 0.35], [0.18, 0.65], [0.06, 0.8], [0.07, 0.95]], P.terracotta, { at: [x, y, z], segs: 8 });
    pot(-2.4, zf - 2.9);
    pot(-2.0, zf - 3.0);
    pot(-1.6, zf - 2.95);
    for (const x of [-2.0, -1.4, -0.8, -0.2]) b.cyl(0.14, 0.1, tint(P.terracotta, -0.1), { at: [x, 1.01, zf - 0.6], rTop: 0.2, segs: 8 });
    // partition with a doorway into the house behind
    b.panel(0.9, 2.0, P.timberBlack, { at: [1.6, sill, zf - shopD], facing: '+z' });

    // timber framing shown on the plastered walls of the living block
    b.sym((s) => {
      for (const z of spread(4, zb + 0.4, zf - shopD - 0.4)) {
        b.box(0.04, H - sill, 0.16, P.oak, { at: [s * (W / 2 + 0.01), sill, z] });
      }
      // small high windows, shuttered
      for (const z of spread(2, zb + 1.4, zf - shopD - 1.4)) {
        b.window(0.6, 0.6, { at: [(s * W) / 2, 1.9, z], facing: s > 0 ? '+x' : '-x', frame: P.oak, bars: [2, 1] });
      }
    });

    // tiled roof, low Mediterranean pitch, gable to the street
    const rise = 1.45;
    const ov = 0.35;
    b.gable(W, L, rise, tile, { at: [0, H, (zf + zb) / 2], ridge: 'z', overhang: ov, thick: 0.14, wall: plaster });
    // the triangle over the shop front is framed in timber
    b.extrude([[-W / 2, 0], [W / 2, 0], [0, rise]], 0.05, plaster, { at: [0, H, zf + 0.03] });
    beam(b, [-W / 2, H + 0.1, zf + 0.06], [0, H + rise - 0.05, zf + 0.06], 0.14, 0.14, P.oak);
    beam(b, [W / 2, H + 0.1, zf + 0.06], [0, H + rise - 0.05, zf + 0.06], 0.14, 0.14, P.oak);
    b.box(0.14, rise - 0.15, 0.1, P.oak, { at: [0, H, zf + 0.06] });
    // imbrices: half-round cover tiles running down the slope
    const half = W / 2 + ov;
    const drop = (ov * rise) / (W / 2);
    const ry = H + rise + 0.14;
    for (const z of spread(Math.round((L + ov) / 0.42), zb - ov + 0.2, zf + ov - 0.2)) {
      b.sym((s) => beam(b, [s * half, H - drop + 0.14, z], [s * 0.1, ry - 0.02, z], 0.1, 0.07, tint(tile, -0.06)));
    }
    b.log(0.1, L + ov * 2, tint(tile, -0.08), { at: [0, ry - 0.08, (zf + zb) / 2], axis: 'z', segs: 6 }); // ridge tiles

    // portico along the street front
    const pz = zf + 1.9;
    for (const x of spread(3, -W / 2 + 0.1, W / 2 - 0.1)) {
      b.box(0.24, 0.3, 0.24, P.limestone, { at: [x, 0, pz] });
      b.box(0.18, 2.3, 0.18, P.oak, { at: [x, 0.3, pz] });
    }
    b.box(W + 0.3, 0.2, 0.22, P.oak, { at: [0, 2.6, pz] });
    b.shed(W + 0.5, 2.3, 0.4, tile, { at: [0, 2.8, zf + 1.05], high: '-z' });
    b.box(W + 0.4, 0.04, 2.0, P.paving, { at: [0, 0, zf + 1.0] });

    // back door and yard: well, oven and fence
    b.panel(0.9, 1.9, P.oak, { at: [-1.4, sill, zb], facing: '-z' });
    b.box(1.1, sill, 0.6, footing, { at: [-1.4, 0, zb - 0.3] });
    b.cyl(0.6, 0.7, P.flint, { at: [1.8, 0, zb - 1.7], segs: 10 });
    b.cyl(0.42, 0.72, P.windowDark, { at: [1.8, 0, zb - 1.7], segs: 10 });
    b.sym((s) => b.box(0.1, 1.5, 0.1, P.oak, { at: [1.8 + s * 0.6, 0.7, zb - 1.7] }));
    b.box(1.4, 0.1, 0.1, P.oak, { at: [1.8, 2.1, zb - 1.7] });
    b.dome(0.7, tint(P.cob, -0.05), { at: [-1.8, 0, zb - 2.0], squash: 0.9, segs: 8 });
    hurdle(b, -W / 2, zb - 0.1, -W / 2, -8.9, 1.4);
    hurdle(b, W / 2, zb - 0.1, W / 2, -8.9, 1.4);
    hurdle(b, -W / 2, -8.9, W / 2, -8.9, 1.4);
  },
};
