import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { type XZ, flatArch, lineColliders, pave, rectCollider, wallSeg } from './shared';
import { GATEWAY_Z, POD, PW, SQ, cryptoporticus, forumGateway, forumSquare, plinth } from './02-forum';
import { CASTRUM, curtain } from '../remparts/curtain';
import { NJ, WALL_COLOURS, archPanel, ring } from '../remparts/shared';

/*
 * The plot holds the north-west corner of the late Roman circuit (town-walls.ts), which the town draws
 * until 600 and this model draws from then on, exactly on its line: the west wall along x = WX, the
 * north wall along z = WZ (3.5 m beyond the plot's back edge), and the round tower at the corner. The
 * plot is centred at world (-32, -73) facing south, so plot = world - (-32, -73).
 */
const WX = -18.2;
const WZ = -25.5;
/** The circuit's west and north sides in world coordinates, and this plot's place in the world. */
const WORLD = { west: -50.2, north: -98.5, x: -32, z: -73 };
const WT = CASTRUM.t;
const WH = CASTRUM.h;
/** The round corner tower made into the count's tower (as the circuit's `corner` piece places it). */
const TW: XZ = [WX - 1.2, WZ - 1.2];
const TR = 3.5;
const TH = 12.6;
/** The count's hall. */
const HL = { x0: -8, x1: 14, z0: -14, z1: -5, wall: 3.4 };

const roman = mix(P.limestone, P.rubble, 0.35);
const romanDark = tint(roman, -0.1);

/**
 * The two stretches of the late Roman wall, built with the town's own pieces in the town's own frames
 * (so they run on unbroken into the stretches the town draws either side), and the corner tower: the
 * town's, but carried up in timber instead of its tiled roof.
 */
function romanCorner(b: Builder) {
  b.group({ at: [-WORLD.x, 0, -WORLD.z] }, () => {
    // the north side, a stretch along its own X with the field to its +Z, as the town lays it out
    b.group({ at: [0, 0, WORLD.north], rotY: Math.PI }, () => curtain(b, 'castrum', 10.2, -WORLD.west));
    b.group({ at: [WORLD.west, 0, 0], rotY: -Math.PI / 2 }, () => curtain(b, 'castrum', WORLD.north, -51.2));
  });
  const { stone, brick, spolia } = WALL_COLOURS.castrum;
  const segs = 14;
  b.group({ at: [TW[0], 0, TW[1]] }, () => {
    b.cyl(TR + 0.18, CASTRUM.base, spolia, { segs, ...NJ });
    b.cyl(TR, TH - CASTRUM.base, stone, { at: [0, CASTRUM.base, 0], segs, ...NJ });
    for (const y of CASTRUM.bands) if (y < TH - 3.5) ring(b, TR + 0.03, y, CASTRUM.band, brick, segs);
    ring(b, TR + 0.03, TH - 0.95, CASTRUM.band, brick, segs);
    b.cyl(TR + 0.22, 0.3, tint(stone, 0.04), { at: [0, TH, 0], segs, ...NJ });
    // the Roman chamber's windows, now under the count's timber storey
    for (const a of [Math.PI - 0.3, (5 * Math.PI) / 4, (3 * Math.PI) / 2 + 0.3]) {
      const at = (y: number): [number, number, number] => [Math.sin(a) * (TR - 0.02), y, Math.cos(a) * (TR - 0.02)];
      archPanel(b, 1.15, 1.95, brick, { at: at(TH - 3.05), facing: a, depth: 0.05 });
      archPanel(b, 0.8, 1.75, P.windowDark, { at: at(TH - 3.0), facing: a, depth: 0.08 });
    }
    // the Frankish timber storey and its shingled roof
    const ty = TH + 0.3;
    b.cyl(TR - 0.3, 4.0, P.oak, { at: [0, ty, 0], segs: 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.box(0.3, 4.0, 0.3, P.oakDark, { at: [Math.cos(a) * (TR - 0.2), ty, Math.sin(a) * (TR - 0.2)], jitter: false });
    }
    for (const a of [Math.PI / 4, -Math.PI / 4 + Math.PI, -Math.PI / 4]) {
      b.panel(0.7, 1.0, P.windowDark, { at: [Math.sin(a) * (TR - 0.25), ty + 1.6, Math.cos(a) * (TR - 0.25)], facing: a });
    }
    b.cone(TR + 0.5, 4.2, P.shingle, { at: [0, ty + 4.0, 0], segs: 8 });
  });
  rectCollider(b, TW[0] - TR, TW[0] + TR, TW[1] - TR, TW[1] + TR);
  rectCollider(b, WX, 21.8, WZ - WT / 2, WZ + WT / 2);
  rectCollider(b, WX - WT / 2, WX + WT / 2, WZ, 21.8);
}

export const frankishPalace: BuildingDef = {
  id: 'frankish-palace',
  name: 'Count’s hall in the Roman walls',
  style: 'Merovingian',
  date: 'c. 600',
  summary:
    'The forum was sacked in 275 and most of its stone built into the wall that the shrunken town threw up round its core. What could not be carted off is still there: the paved square, two plinths stripped of their bronzes, the vaulted cryptoporticus, now the count’s cellars, and the gateway arch, which serves as the gate of his yard. Under the Frankish kings the town is governed by a count (comes) appointed by the king to judge, raise troops and collect dues, while the bishop, often still a man of the old Gallo-Roman families, is the other great power within the walls. ' +
    'The count lives in the north-west corner of the Roman wall, using the round tower at the corner as his strongpoint, heightened in timber. His hall is a long timber building on a footing of reused stone, with a shingled roof and a smoke louvre, where he holds his court (mallus) and feasts his followers; beside it is a small stone chapel, and behind it, against the wall, a stable and the stair up to the wall-walk.',
  materials: ['oak', 'reused Roman stone and brick', 'oak shingles', 'rubble masonry'],
  lookFor: [
    { label: 'Roman wall with brick bands', note: 'The late Roman rampart of small squared stones laced with courses of red brick, still the town’s defence three centuries on.', at: [WX + WT / 2 + 0.2, 4.0, 2] },
    { label: 'Roman tower heightened in timber', note: 'The round Roman tower at the corner of the town wall, given a timber upper storey and a shingled roof as the count’s strongpoint.', at: [TW[0] + 2.6, TH + 2.4, TW[1] + 2.6] },
    { label: 'Timber hall on stone footings', note: 'The count’s hall: oak posts and planks on a low wall of reused stone, under a steep roof of oak shingles.', at: [3, 1.0, HL.z1 + 0.3] },
    { label: 'Forum gateway', note: 'The Roman arch from the main street into the forum, left standing when the rest was quarried, now hung with timber gates as the entrance to the count’s yard.', at: [0, 7.2, GATEWAY_Z + PW / 2 + 0.5] },
    { label: 'Chapel', note: 'A small stone chapel with a rounded apse, built of rubble and Roman brick, for the count’s household.', at: [-8.5, 3.4, 9.2] },
  ],
  modelledOn:
    'Generic: the reuse of late Roman walls and towers by Frankish counts and kings, as at Paris, where the palace stood at the end of the walled Île de la Cité, and Senlis, where the royal castle stands against the Gallo-Roman wall',
  build(b) {
    pave(b, -21.8, 21.8, -21.8, 21.8, mix(P.earth, P.grassDry, 0.3), -0.02);
    // ---- what is left of the forum: the paved square, two plinths robbed of their bronzes, the
    // cryptoporticus (its portico gone, its vault turfed over) and the gateway arch
    forumSquare(b);
    for (const x of [-4.5, 4.5]) plinth(b, x, 3);
    cryptoporticus(b);
    b.box(PW + 1.0, 0.12, SQ.z1 - SQ.z0, P.turf, { at: [SQ.x1 + PW / 2 + 0.2, POD, (SQ.z0 + SQ.z1) / 2], jitter: false });
    b.deck(PW + 1.0, SQ.z1 - SQ.z0, POD + 0.12, { at: [SQ.x1 + PW / 2 + 0.2, 0, (SQ.z0 + SQ.z1) / 2] });
    rectCollider(b, SQ.x1 + PW - 0.2, SQ.x1 + PW + 1.2, SQ.z0, SQ.z1);
    forumGateway(b);
    for (const s of [-1, 1]) rectCollider(b, s * 2.8 - 1.0, s * 2.8 + 1.0, GATEWAY_Z - PW / 2 - 0.4, GATEWAY_Z + PW / 2 + 0.4);
    // ---- the Roman wall: the north-west corner of the late circuit, the corner tower the count's
    romanCorner(b);
    // a stair up to the wall-walk from the yard behind the hall
    b.stairs(1.6, WH, 9, 18, romanDark, { at: [8, 0, WZ + WT / 2 + 4.5] });
    b.deck(38, WT - 1.1, WH, { at: [2.8, 0, WZ - 0.1] });

    // ---- the hall: a low footing of reused stone, oak posts and planks, shingle roof, smoke louvre
    const { x0, x1, z0, z1, wall } = HL;
    const W = x1 - x0;
    const D = z1 - z0;
    const xc = (x0 + x1) / 2;
    const zc = (z0 + z1) / 2;
    b.box(W + 0.3, 0.8, D + 0.3, romanDark, { at: [xc, 0, zc] });
    b.box(W, wall - 0.8, D, mix(P.oak, P.oakSilver, 0.3), { at: [xc, 0.8, zc] });
    for (const x of spread(10, x0 + 0.15, x1 - 0.15)) for (const s of [-1, 1]) b.box(0.32, wall - 0.8, 0.14, P.oakDark, { at: [x, 0.8, zc + s * (D / 2 + 0.03)], jitter: false });
    for (const z of spread(4, z0 + 0.15, z1 - 0.15)) for (const s of [-1, 1]) b.box(0.14, wall - 0.8, 0.32, P.oakDark, { at: [xc + s * (W / 2 + 0.03), 0.8, z], jitter: false });
    b.gable(W, D, 5.8, P.shingle, { at: [xc, wall, zc], overhang: 0.7, wall: mix(P.oak, P.oakSilver, 0.3), thick: 0.2 });
    // carved crossed bargeboards at the gable peaks
    for (const ex of [x0 - 0.75, x1 + 0.75]) for (const s of [-1, 1]) b.beam([ex, wall + 5.0, zc + s * 0.9], [ex, wall + 6.9, zc - s * 0.7], 0.2, 0.25, P.oakDark);
    b.box(1.6, 0.9, 1.4, P.oakDark, { at: [3, wall + 5.6, zc] });
    b.gable(2.0, 1.8, 0.8, P.shingle, { at: [3, wall + 6.5, zc] });
    // doors in the long side, small shuttered openings
    b.panel(1.8, 2.4, P.oakDark, { at: [3, 0.8, z1 + 0.04], facing: '+z' });
    b.stairs(2.4, 0.8, 1.0, 3, romanDark, { at: [3, 0, z1 + 0.65] });
    for (const x of [x0 + 3, x0 + 7, x1 - 7, x1 - 3]) b.panel(0.8, 0.7, P.windowDark, { at: [x, 2.1, z1 + 0.04], facing: '+z' });
    b.panel(1.4, 2.2, P.oakDark, { at: [x1 - 4, 0.8, z0 - 0.04], facing: '-z' });
    rectCollider(b, x0, x1, z0, z1);

    // ---- the chapel: rubble and Roman brick, an apse to the east (+X), a little bellcote
    const C = { x0: -16, x1: -9, z0: 6, z1: 12 };
    const cxc = (C.x0 + C.x1) / 2;
    const czc = (C.z0 + C.z1) / 2;
    const cs = mix(P.rubble, P.limestone, 0.3);
    b.box(C.x1 - C.x0, 5.0, C.z1 - C.z0, cs, { at: [cxc, 0, czc] });
    b.lathe([[2.4, 0], [2.4, 3.6], [1.2, 4.4], [0.1, 4.7]], cs, { at: [C.x1, 0, czc], start: 0, sweep: Math.PI, segs: 6 });
    b.gable(C.x1 - C.x0, C.z1 - C.z0, 2.8, P.romanTile, { at: [cxc, 5.0, czc], overhang: 0.3, wall: cs });
    for (const y of [1.4, 3.2]) b.box(C.x1 - C.x0 + 0.05, 0.25, C.z1 - C.z0 + 0.05, P.romanTile, { at: [cxc, y, czc], jitter: false });
    flatArch(b, 1.4, 2.6, P.oakDark, { at: [C.x0, 0, czc], facing: '-x', shape: 'round', n: 3 });
    for (const x of [C.x0 + 2, C.x1 - 2]) flatArch(b, 0.5, 1.2, P.windowDark, { at: [x, 2.6, C.z1], shape: 'round', n: 3 });
    b.box(0.5, 1.6, 1.2, cs, { at: [C.x0 + 0.25, 7.6, czc] });
    flatArch(b, 0.5, 0.9, P.windowDark, { at: [C.x0, 7.9, czc], facing: '-x', shape: 'round', n: 2, off: 0.3 });
    b.extrude([[0, 0], [0.6, 0], [0, 0.6]], 1.2, cs, { at: [C.x0 + 0.25, 9.2, czc], rotY: Math.PI / 2 });
    rectCollider(b, C.x0, C.x1 + 2.4, C.z0, C.z1);

    // ---- outbuildings: a kitchen and a stable, thatched
    for (const [x, z, w, d] of [[9, 8, 7, 5], [-3, -19.5, 7, 4]] as [number, number, number, number][]) {
      b.box(w, 2.4, d, P.daub, { at: [x, 0, z] });
      b.gable(w, d, 3.0, P.thatch, { at: [x, 2.4, z], overhang: 0.5, thick: 0.4 });
      b.panel(1.2, 1.9, P.oakDark, { at: [x - 1, 0, z + d / 2], facing: '+z' });
      b.collider(w, d, { at: [x, 0, z] });
    }
    // ---- a fence closing the open sides, from the Roman wall to the old gateway and on round the cellars
    const fence: XZ[] = [[WX + WT / 2, 19.5], [-2.8, 19.5]];
    const fence2: XZ[] = [[2.8, 19.5], [21.5, 19.5], [21.5, WZ + WT / 2]];
    for (const line of [fence, fence2]) {
      for (let i = 0; i < line.length - 1; i++) wallSeg(b, line[i], line[i + 1], 0.25, 2.4, P.oakSilver);
      lineColliders(b, line, 0.5);
    }
    // timber gates hung in the Roman arch
    for (const s of [-1, 1]) b.box(1.6, 3.6, 0.15, P.oakDark, { at: [s * 0.85, 0, GATEWAY_Z + 1.0] });
    // a broken Roman column left lying in the yard, and a well
    b.log(0.4, 3.2, P.limestone, { at: [3, 0, 12.5], rotY: 0.6, segs: 8 });
    b.cyl(0.9, 0.8, romanDark, { at: [-2, 0, 4], segs: 8 });
    b.collider(1.8, 1.8, { at: [-2, 0, 4] });
    b.tree(8, { kind: 'round', at: [11, 0, 14.5] });
  },
};
