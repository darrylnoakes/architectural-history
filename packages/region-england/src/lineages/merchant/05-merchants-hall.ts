import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { beam, gardenWalls, well } from './shared';

export const merchantsHall: BuildingDef = {
  id: 'merchants-hall',
  name: 'Medieval merchant’s house',
  style: 'Decorated Gothic',
  date: 'c. 1330',
  summary:
    'Trade in wool and wine made a new class of townsmen rich, and their houses put business at the street. ' +
    'At the front is a shop over a stone-vaulted undercroft, half sunk below the street and safe from fire, with a timber-framed chamber jettied out above. ' +
    'Behind, the household’s hall rises open to the roof, heated by a hearth in the middle of the floor whose smoke leaves by a louvre. ' +
    'Pointed arches show that Gothic has replaced the Norman round arch.',
  materials: ['ragstone', 'oak frame', 'wattle and daub', 'clay tile'],
  lookFor: [
    { label: 'Undercroft door', note: 'Steps lead down to a stone-vaulted cellar, half below the street, where wine and wool were stored and sold.', at: [-3.6, 1.0, 11.6] },
    { label: 'Shop front with shutters', note: 'The lower shutter drops to make a counter, the upper one props up as an awning.', at: [3.6, 1.9, 11.5] },
    { label: 'Jetty', note: 'The timber-framed upper floor oversails the stone wall below, gaining space over the street.', at: [0, 3.25, 11.6] },
    { label: 'Open hall and louvre', note: 'The hall is one tall room open to the rafters; smoke from its central hearth escapes through the louvre on the ridge.', at: [-2.2, 9.4, -1.5] },
    { label: 'Pointed arch', note: 'The two-centred Gothic arch of the doorways, here in stone.', at: [1.0, 3.3, 11.2] },
  ],
  influences: ['french-gothic'],
  build(b) {
    const stone = b.pick([P.ragstone, P.limestone, tint(P.ragstone, -0.04)]);
    const dressed = tint(stone, 0.07);
    const infill = b.pick([P.limewash, P.daub, P.ochreWash]);
    const oak = b.pick([P.oak, tint(P.oak, 0.05)]);
    const tile = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.04)]);

    // ---------------- street range: stone ground storey, jettied timber chamber above
    const W = 12;
    const zb = 5; // back wall of the street range
    const zf = 11; // stone street wall
    const gH = 3.0;
    const jet = 0.6;
    const uH = 2.7;
    const zc = (zb + zf) / 2;
    b.box(W, gH, zf - zb, stone, { at: [0, 0, zc] });
    b.box(W + 0.08, 0.2, zf - zb + 0.08, dressed, { at: [0, gH - 0.2, zc] });
    // upper chamber, jettied to the street
    const ud = zf - zb + jet;
    const uz = zb + ud / 2;
    b.box(W, uH, ud, infill, { at: [0, gH, uz] });
    b.box(W + 0.1, 0.28, 0.22, oak, { at: [0, gH, zf + jet - 0.05] }); // bressumer
    for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) {
      beam(b, [x, gH - 0.85, zf + 0.02], [x, gH + 0.02, zf + jet - 0.1], 0.16, oak); // jetty brackets
    }
    b.frame(W, uH, oak, { at: [0, gH, zf + jet], facing: '+z', studs: 5, rails: 1, brace: 'corner' });
    b.frame(W, uH, oak, { at: [0, gH, zb], facing: '-z', studs: 5, rails: 1, brace: 'corner' });
    b.sym((s) => b.frame(ud, uH, oak, { at: [s * W / 2, gH, uz], facing: s > 0 ? '+x' : '-x', studs: 2, rails: 1, brace: 'corner' }));
    const rh = 3.7;
    b.gable(W, ud, rh, tile, { at: [0, gH + uH, uz], overhang: 0.3, wall: infill });
    b.sym((s) => beam(b, [s * (W / 2 + 0.04), gH + uH, uz], [s * (W / 2 + 0.04), gH + uH + rh - 0.1, uz], 0.16, oak));
    b.box(W + 0.6, 0.14, 0.24, tint(tile, -0.08), { at: [0, gH + uH + rh + 0.08, uz] });
    // chamber windows: unglazed, mullioned, with shutters
    for (const x of [-3.6, 3.6]) {
      b.window(1.6, 1.0, { at: [x, gH + 1.0, zf + jet], facing: '+z', frame: oak, bars: [4, 1] });
      b.panel(0.8, 1.0, tint(oak, -0.05), { at: [x - 1.25, gH + 1.0, zf + jet], facing: '+z', depth: 0.05 });
    }
    b.window(1.4, 0.9, { at: [3, gH + 1.0, zb], facing: '-z', frame: oak, bars: [3, 1] });

    // street front of the stone storey
    // undercroft door: low pointed arch, its threshold below the street, with steps down in a walled well
    b.panel(1.6, 2.0, dressed, { at: [-3.6, -0.4, zf], facing: '+z', shape: 'pointed', depth: 0.08 });
    b.panel(1.2, 1.8, 0x241d18, { at: [-3.6, -0.4, zf], facing: '+z', shape: 'pointed', depth: 0.1 });
    b.box(1.6, 0.03, 1.4, 0x2a2420, { at: [-3.6, 0, zf + 0.7] });
    b.sym((s) => b.box(0.22, 0.55, 1.4, dressed, { at: [-3.6 + s * 0.91, 0, zf + 0.7] }));
    // shop: raised floor reached by steps, pointed doorway, shuttered window
    b.panel(1.5, 2.45, dressed, { at: [1.0, 0.8, zf], facing: '+z', shape: 'pointed', depth: 0.08 });
    b.panel(1.1, 2.25, P.oakDark, { at: [1.0, 0.8, zf], facing: '+z', shape: 'pointed', depth: 0.1 });
    b.stairs(1.4, 0.8, 0.8, 3, dressed, { at: [1.0, 0, zf + 0.4] });
    b.panel(2.4, 1.3, 0x2b2420, { at: [3.6, 1.15, zf], facing: '+z' });
    b.box(2.4, 0.07, 0.7, oak, { at: [3.6, 1.1, zf + 0.35] }); // stall-board counter
    b.sym((s) => b.box(0.06, 0.06, 0.6, P.iron, { at: [3.6 + s * 1.1, 1.17, zf + 0.35], rot: [0, 0, 0] }));
    b.box(2.4, 0.06, 0.8, oak, { at: [3.6, 2.55, zf + 0.34], rot: [-0.45, 0, 0] }); // propped upper shutter
    b.panel(2.7, 0.14, dressed, { at: [3.6, 2.45, zf], facing: '+z', depth: 0.1 });
    // small grilles lighting the undercroft at pavement level
    for (const x of [-5.2, -1.9, 5.4]) b.panel(0.7, 0.45, P.windowDark, { at: [x, 0.15, zf], facing: '+z' });

    // ---------------- the open hall behind: timber frame on a stone sill wall, ridge front to back
    openHall(b, stone, dressed, infill, oak, tile);
    const { hx, hw, hH, hrh } = HALL;
    // louvre on the ridge over the central hearth
    const lz = -1.5;
    b.box(1.0, 0.8, 1.0, oak, { at: [hx, hH + hrh - 0.35, lz] });
    for (const s of [-1, 1]) b.panel(0.8, 0.5, 0x2b2420, { at: [hx + s * 0.5, hH + hrh - 0.2, lz], facing: s > 0 ? '+x' : '-x' });
    b.pyramid(1.3, 1.3, 0.7, tile, { at: [hx, hH + hrh + 0.45, lz] });
    // tall hall windows on the yard side, a smaller one opposite
    for (const z of [-0.5, -4.0]) {
      b.window(1.3, 2.4, { at: [hx + hw / 2, 1.5, z], facing: '+x', frame: oak, bars: [2, 2], shape: 'pointed' });
    }
    b.window(1.1, 1.9, { at: [hx - hw / 2, 1.7, -2.2], facing: '-x', frame: oak, bars: [2, 2], shape: 'pointed' });

    // ---------------- yard: gateway from the street, boundary walls, a well
    b.box(0.45, 2.6, 0.5, stone, { at: [9.6, 0, zf] });
    b.archWall(3.6, 3.2, 0.5, stone, { at: [7.8, 0, zf], facing: '+z', openings: 1, openW: 2.6, openH: 2.9, shape: 'pointed' });
    b.box(4.0, 0.2, 0.62, dressed, { at: [7.8, 3.2, zf] });
    gardenWalls(b, { toStreet: true });
    b.box(3.2, 0.06, 14, P.cobble, { at: [6.6, 0, 3.6] });
    well(b, 5.8, -6, stone, oak);
  },
};

/** Where the open hall stands: kept by the Tudor house, which floors it over. */
export const HALL = { hx: -2.2, hw: 7.4, hz0: -7.2, hz1: 5, hH: 4.4, hrh: 3.9 };

/**
 * The open hall behind the street range: timber frame on a stone sill wall, ridge front to back, with
 * its gable window and the cross-passage door from the yard. Shared with the Tudor merchant's house,
 * which kept the hall and floored it over.
 */
export function openHall(b: Builder, stone: number, dressed: number, infill: number, oak: number, tile: number): void {
  const { hx, hw, hz0, hz1, hH, hrh } = HALL;
  const hd = hz1 - hz0;
  const hzc = (hz1 + hz0) / 2;
  b.box(hw, 0.6, hd, stone, { at: [hx, 0, hzc] });
  b.box(hw - 0.1, hH - 0.6, hd - 0.1, infill, { at: [hx, 0.6, hzc] });
  b.sym((s) =>
    b.frame(hd, hH - 0.6, oak, { at: [hx + s * hw / 2, 0.6, hzc], facing: s > 0 ? '+x' : '-x', studs: 3, rails: 1, brace: 'corner', beam: 0.22 }),
  );
  b.frame(hw, hH - 0.6, oak, { at: [hx, 0.6, hz0], facing: '-z', studs: 2, rails: 1, brace: 'corner', beam: 0.22 });
  b.gable(hw, hd, hrh, tile, { at: [hx, hH, hzc], ridge: 'z', overhang: 0.35, wall: infill });
  b.box(0.24, 0.14, hd + 0.4, tint(tile, -0.08), { at: [hx, hH + hrh + 0.08, hzc] });
  beam(b, [hx, hH, hz0 - 0.04], [hx, hH + hrh - 0.1, hz0 - 0.04], 0.2, oak);
  // a window in the back gable
  b.window(1.0, 1.4, { at: [hx, hH + 0.4, hz0], facing: '-z', frame: oak, bars: [2, 1] });
  // cross-passage door into the hall from the yard, with a little pentice over it
  b.panel(1.2, 2.2, P.oakDark, { at: [hx + hw / 2, 0.6, 3.2], facing: '+x', shape: 'pointed' });
  b.stairs(1.4, 0.6, 0.7, 2, dressed, { at: [hx + hw / 2 + 0.35, 0, 3.2], rotY: Math.PI / 2 });
  b.shed(1.0, 2.0, 0.5, tile, { at: [hx + hw / 2 + 0.5, 3.1, 3.2], high: '-x' });
}
