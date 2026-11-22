import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { type XZ, flatArch, lineColliders, pave, rectCollider, wallSeg } from './shared';

/** The late Roman town wall runs along the back (z = WZ) and the left side (x = WX) of the plot. */
const WX = -18.2;
const WZ = -18.2;
const WT = 3.2; // thickness
const WH = 7.5; // height to the wall-walk
/** The round-fronted bastion at the corner, made into the count's tower. */
const TW: XZ = [WX, WZ];
const TR = 3.6;
/** The count's hall. */
const HL = { x0: -8, x1: 14, z0: -14, z1: -5, wall: 3.4 };

const roman = mix(P.limestone, P.rubble, 0.35);
const romanDark = tint(roman, -0.1);

/** Courses of brick laced through the small squared stone of the Roman wall, on a face of length L. */
function bands(b: Builder, p: XZ, q: XZ, off: XZ, ys: number[]): void {
  for (const y of ys) wallSeg(b, [p[0] + off[0], p[1] + off[1]], [q[0] + off[0], q[1] + off[1]], 0.06, 0.35, P.romanTile, y, { jitter: false });
}

export const frankishPalace: BuildingDef = {
  id: 'frankish-palace',
  name: 'Count’s hall in the Roman walls',
  style: 'Merovingian',
  date: 'c. 600',
  summary:
    'The forum is long gone, its stone built into the wall that the shrunken town threw up after 275. Under the Frankish kings the town is governed by a count (comes) appointed by the king to judge, raise troops and collect dues, while the bishop, often still a man of the old Gallo-Roman families, is the other great power within the walls. ' +
    'The count lives in a corner of the Roman wall, using one of its round-fronted towers as his strongpoint, heightened in timber. His hall is a long timber building on a footing of reused stone, with a shingled roof and a smoke louvre, where he holds his court (mallus) and feasts his followers; beside it is a small stone chapel.',
  materials: ['oak', 'reused Roman stone and brick', 'oak shingles', 'rubble masonry'],
  lookFor: [
    { label: 'Roman wall with brick bands', note: 'The late Roman rampart of small squared stones laced with courses of red brick, still the town’s defence three centuries on.', at: [WX + WT / 2 + 0.2, 4.0, 2] },
    { label: 'Roman tower heightened in timber', note: 'The round-fronted Roman tower at the corner, given a timber upper storey and a shingled roof as the count’s strongpoint.', at: [TW[0] + 1.5, WH + 3.5, TW[1] + TR + 0.3] },
    { label: 'Timber hall on stone footings', note: 'The count’s hall: oak posts and planks on a low wall of reused stone, under a steep roof of oak shingles.', at: [3, 1.0, HL.z1 + 0.3] },
    { label: 'Smoke louvre', note: 'No chimneys yet: smoke from the open hearth escapes through a little roofed louvre on the ridge.', at: [3, HL.wall + 6.4, (HL.z0 + HL.z1) / 2] },
    { label: 'Chapel', note: 'A small stone chapel with a rounded apse, built of rubble and Roman brick, for the count’s household.', at: [-8.5, 3.4, 9.2] },
  ],
  modelledOn:
    'Generic: the reuse of late Roman walls and towers by Frankish counts and kings, as at Paris, where the palace stood at the end of the walled Île de la Cité, and Senlis, where the royal castle stands against the Gallo-Roman wall',
  build(b) {
    pave(b, -21.8, 21.8, -21.8, 21.8, mix(P.earth, P.grassDry, 0.3), -0.02);
    // ---- the Roman wall: back and left, with a wall-walk and a parapet
    const back: XZ[] = [[TW[0] + TR - 0.5, WZ], [21.8, WZ]];
    const side: XZ[] = [[WX, TW[1] + TR - 0.5], [WX, 21.8]];
    for (const [p, q] of [back, side]) {
      wallSeg(b, p, q, WT, WH, roman);
      const alongX = p[1] === q[1];
      const off: XZ = alongX ? [0, WT / 2 + 0.02] : [WT / 2 + 0.02, 0];
      bands(b, p, q, off, [1.6, 3.4, 5.2]);
      bands(b, p, q, [-off[0], -off[1]], [1.6, 3.4, 5.2]);
      // the parapet on the outer edge, patched and broken in places
      const pOff: XZ = alongX ? [0, -WT / 2 + 0.3] : [-WT / 2 + 0.3, 0];
      wallSeg(b, [p[0] + pOff[0], p[1] + pOff[1]], [q[0] + pOff[0], q[1] + pOff[1]], 0.6, 1.3, romanDark, WH);
    }
    // ---- the corner bastion made into the count's tower
    b.cyl(TR, WH + 1.5, roman, { at: [TW[0], 0, TW[1]], segs: 10 });
    for (const y of [1.6, 3.4, 5.2, 7.0]) b.cyl(TR + 0.05, 0.35, P.romanTile, { at: [TW[0], y, TW[1]], segs: 10, jitter: false });
    // the Frankish timber storey and roof
    const ty = WH + 1.5;
    b.cyl(TR - 0.3, 4.0, P.oak, { at: [TW[0], ty, TW[1]], segs: 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.box(0.3, 4.0, 0.3, P.oakDark, { at: [TW[0] + Math.cos(a) * (TR - 0.2), ty, TW[1] + Math.sin(a) * (TR - 0.2)], jitter: false });
    }
    for (const a of [Math.PI / 4, -Math.PI / 4 + Math.PI]) {
      b.panel(0.7, 1.0, P.windowDark, { at: [TW[0] + Math.sin(a) * (TR - 0.25), ty + 1.6, TW[1] + Math.cos(a) * (TR - 0.25)], facing: a });
    }
    b.cone(TR + 0.5, 4.2, P.shingle, { at: [TW[0], ty + 4.0, TW[1]], segs: 8 });
    rectCollider(b, TW[0] - TR, TW[0] + TR, TW[1] - TR, TW[1] + TR);
    lineColliders(b, back, WT);
    lineColliders(b, side, WT);
    // a stair up to the wall-walk
    b.stairs(1.6, WH, 9, 18, romanDark, { at: [8, 0, WZ + WT / 2 + 4.5] });
    b.deck(20, WT - 0.6, WH, { at: [10, 0, WZ] });

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
    for (const [x, z, w, d] of [[14, 6, 7, 5], [12, -1, 5, 4]] as [number, number, number, number][]) {
      b.box(w, 2.4, d, P.daub, { at: [x, 0, z] });
      b.gable(w, d, 3.0, P.thatch, { at: [x, 2.4, z], overhang: 0.5, thick: 0.4 });
      b.panel(1.2, 1.9, P.oakDark, { at: [x - 1, 0, z + d / 2], facing: '+z' });
      b.collider(w, d, { at: [x, 0, z] });
    }
    // ---- a fence closing the open sides, with a gate onto the street
    const fence: XZ[] = [[WX + WT / 2, 19.5], [-2, 19.5]];
    const fence2: XZ[] = [[2, 19.5], [19.5, 19.5], [19.5, WZ + WT / 2]];
    for (const line of [fence, fence2]) {
      for (let i = 0; i < line.length - 1; i++) wallSeg(b, line[i], line[i + 1], 0.25, 2.4, P.oakSilver);
      lineColliders(b, line, 0.5);
    }
    for (const s of [-1, 1]) b.box(0.4, 3.6, 0.4, P.oak, { at: [s * 2, 0, 19.5] });
    b.box(4.6, 0.3, 0.5, P.oak, { at: [0, 3.6, 19.5] });
    b.gable(4.8, 1.4, 0.8, P.shingle, { at: [0, 3.9, 19.5] });
    // a broken Roman column left lying in the yard, and a well
    b.log(0.4, 3.2, P.limestone, { at: [5, 0, 10], rotY: 0.6, segs: 8 });
    b.cyl(0.9, 0.8, romanDark, { at: [-2, 0, 4], segs: 8 });
    b.collider(1.8, 1.8, { at: [-2, 0, 4] });
    b.tree(8, { kind: 'round', at: [16, 0, 14] });
  },
};
