import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { lin, opening, flat, archPts, circlePts, roofZ, holyGround } from './shared';
import { CASTRUM, curtain } from '../remparts/curtain';

const WALL = mix(P.pierreBlonde, P.rubble, 0.45);
const RENDER = mix(P.plaster, P.pierreBlonde, 0.4);
const BRICK = P.brickRed;
const ROOF = P.romanTile;
const GLASS = mix(P.windowDark, P.plaster, 0.15);
/** How far the group stands east (-Z) of the plot's middle, close in to the wall behind its apses. */
const DZ = -7;

/** A plain hall church: walls, a tiled roof, an apse to the east, windows high up. */
function hall(b: Builder, x: number, w: number, z0: number, z1: number, h: number, ar: number, nWin: number) {
  const hs = w / 2;
  const zc = (z0 + z1) / 2;
  b.box(w + 0.3, 0.4, z1 - z0 + 0.3, tint(WALL, -0.05), { at: [x, 0, zc] });
  b.box(w, h, z1 - z0, RENDER, { at: [x, 0, zc] });
  roofZ(b, x, z0, z1, hs, h, hs * 0.62, ROOF, { g1: RENDER, ovEnd: 0.2 });
  b.lathe([[ar, 0], [ar, h - 1.4]], RENDER, { start: Math.PI / 2, sweep: Math.PI, segs: 8, at: [x, 0, z0] });
  b.lathe([[ar + 0.3, h - 1.5], [0.01, h - 1.4 + ar * 0.55]], ROOF, { start: Math.PI / 2, sweep: Math.PI, segs: 8, at: [x, 0, z0] });
  for (const s of [-1, 1]) {
    for (const z of lin(nWin, z0 + 1.8, z1 - 1.8)) opening(b, 'round', 0.9, 1.9, [x + s * hs, h - 2.9, z], s > 0 ? Math.PI / 2 : -Math.PI / 2, GLASS, BRICK, 0.14);
  }
  opening(b, 'round', 1.8, 3.0, [x, 0, z1], 0, P.oakDark, BRICK, 0.2);
  for (const dx of [-1.3, 0, 1.3]) opening(b, 'round', 0.8, 1.7, [x + dx, h - 2.6, z1], 0, GLASS, BRICK, 0.12);
  opening(b, 'round', 0.9, 1.8, [x, 2.2, z0 - ar + 0.05], Math.PI, GLASS, BRICK, 0.14);
  b.collider(w, z1 - z0 + ar, { at: [x, 0, zc - ar / 2] });
}

/*
 * The plot is centred at world (60, -40) facing west: plot +Z is world west, plot +X world north, so
 * world x = 60 - z and world z = -40 + x. Behind its east end (z = WALL_Z, world x = 91) runs the east
 * side of the late Roman circuit (town-walls.ts), which the town draws until 380 and the cathedral's
 * models draw from then until 1050.
 */
export const WALL_Z = -31;

/**
 * The stretch of the late Roman town wall behind the apses, across the plot's full width: the town's
 * own piece, in the town's own frame, so it runs on unbroken into the stretches either side. Small
 * stone laced with brick on a footing of reused blocks, merlons on the field (east) side, and one
 * half-round tower, behind the middle of the plot.
 */
export function lateRomanWall(b: Builder) {
  b.group({ at: [40, 0, 60], rotY: Math.PI / 2 }, () => {
    b.group({ at: [91, 0, 0], rotY: Math.PI / 2 }, () => curtain(b, 'castrum', 23, 57));
  });
  b.collider(34, CASTRUM.t, { at: [0, 0, WALL_Z] });
  b.collider(2 * CASTRUM.tower.r, 2 * CASTRUM.tower.r, { at: [0, 0, WALL_Z - CASTRUM.tower.z] });
}

export const cathedralGroup: BuildingDef = {
  id: 'cathedral-group',
  name: 'First cathedral group',
  style: 'Late Antique (Early Christian)',
  date: 'c. 380',
  summary:
    'After the raids of 275 the town shrank behind a wall built from its own ruined monuments, and the bishop, head of a Christian community whose faith was now the emperor’s, built just inside its east side, the apses of his churches towards the wall, as many of the first cathedrals of Gaul were. ' +
    'As at Geneva, Trier and Aquileia the cathedral is a pair of plain halls side by side: one perhaps for the full Eucharist, the other for teaching those preparing for baptism, though how the two were used is still debated. Between them stands the baptistery, a small room round a sunken pool where adults were baptised, at Easter, by the bishop himself. ' +
    'The walls are small stone and brick, plastered, under Roman tiles. Nothing of the temple survives: its stones may well be in the town wall.',
  materials: ['rubble and reused stone', 'brick bands', 'lime plaster', 'Roman roof tiles'],
  lookFor: [
    { label: 'Town wall', note: 'The east side of the late Roman wall, behind the apses: small stone with bands of brick on a footing of reused blocks, with a half-round tower.', at: [-12.0, 5.0, WALL_Z + CASTRUM.t / 2 + 0.2] },
    { label: 'Twin halls', note: 'Two churches side by side, the larger to the south: the “double cathedral” of the first Christian centuries.', at: [8.5, 10.5, 13.3 + DZ] },
    { label: 'Baptistery', note: 'The small building between the halls, with its own apse, where converts were baptised in a pool.', at: [-0.75, 7.2, 6.2 + DZ] },
    { label: 'Apses', note: 'Each hall ends in a half-round apse to the east, where the bishop’s chair and the altar stood.', at: [8.5, 6.0, -19.2 + DZ] },
  ],
  modelledOn:
    'The Baptistery of Saint-Jean at Poitiers (founded in the late fourth or the fifth century and much remodelled in the seventh, when its pediments were made) for the baptistery with its gables, pediments and polygonal apse; the double cathedrals of Geneva and Trier for the plan of two halls. Their size and details here are generic.',
  influences: ['christian-basilica'],
  build(b) {
    holyGround(b, mix(P.earth, P.grassDry, 0.45));
    b.box(24, 0.04, 34, mix(P.paving, P.earth, 0.3), { at: [2, 0, -1 + DZ], jitter: false });
    lateRomanWall(b);
    // the two halls, their apses towards the wall
    hall(b, -8.5, 7, -11 + DZ, 11 + DZ, 7.2, 2.8, 5);
    hall(b, 8.5, 10, -15 + DZ, 13 + DZ, 9.4, 3.8, 7);
    // the baptistery: a tall square room, a polygonal apse, a lower porch
    const bx = -0.75;
    const bz = 3.0 + DZ;
    const bw = 6;
    const bh = 7.6;
    b.box(bw + 0.3, 0.4, bw + 0.3, tint(WALL, -0.05), { at: [bx, 0, bz] });
    b.box(bw, bh, bw, RENDER, { at: [bx, 0, bz] });
    roofZ(b, bx, bz - bw / 2, bz + bw / 2, bw / 2, bh, 2.2, ROOF, { g0: RENDER, g1: RENDER, ovEnd: 0.25 });
    b.lathe([[2.3, 0], [2.3, 5.2]], RENDER, { start: Math.PI / 2, sweep: Math.PI, segs: 3, at: [bx, 0, bz - bw / 2] });
    b.lathe([[2.55, 5.1], [0.01, 6.6]], ROOF, { start: Math.PI / 2, sweep: Math.PI, segs: 3, at: [bx, 0, bz - bw / 2] });
    b.box(5.0, 4.6, 3.4, RENDER, { at: [bx, 0, bz + bw / 2 + 1.7] });
    b.gable(5.0, 3.4, 1.4, ROOF, { at: [bx, 4.6, bz + bw / 2 + 1.7], ridge: 'x', overhang: 0.25, wall: RENDER });
    opening(b, 'round', 1.4, 2.6, [bx, 0, bz + bw / 2 + 3.4], 0, P.oakDark, BRICK, 0.18);
    for (const s of [-1, 1]) {
      b.box(0.35, bh, 0.35, tint(WALL, 0.08), { at: [bx + s * (bw / 2), 0, bz + bw / 2] });
      b.box(0.35, bh, 0.35, tint(WALL, 0.08), { at: [bx + s * (bw / 2), 0, bz - bw / 2] });
      // the side walls: arched windows under little triangular pediments, as at Poitiers
      b.group({ at: [bx + s * (bw / 2), 0, bz], rotY: s > 0 ? Math.PI / 2 : -Math.PI / 2 }, () => {
        for (const u of [-1.5, 0, 1.5]) {
          flat(b, archPts('round', 0.8, 1.6, u, 4.4, 2), GLASS, 0.05);
          flat(b, [[u - 0.6, 6.25], [u + 0.6, 6.25], [u, 6.95]], tint(WALL, 0.1), 0.05);
          b.box(0.16, 1.9, 0.12, tint(WALL, 0.1), { at: [u + 0.75, 4.3, 0.06], jitter: false });
        }
        flat(b, [[-2.6, 4.05], [2.6, 4.05], [2.6, 4.2], [-2.6, 4.2]], tint(WALL, 0.1), 0.05);
      });
    }
    // the gable fronts: an oculus and a pediment
    for (const [z, r] of [[bz + bw / 2, 0], [bz - bw / 2, Math.PI]] as const) {
      b.group({ at: [bx, bh, z], rotY: r }, () => {
        flat(b, circlePts(0, 1.0, 0.5, 10), BRICK, 0.06);
        flat(b, circlePts(0, 1.0, 0.36, 10), GLASS, 0.08);
      });
    }
    b.collider(bw, bw + 5.6, { at: [bx, 0, bz + 1.4] });
    b.tree(7, { at: [3.0, 0, 20.0], kind: 'round' });
    b.tree(6, { at: [-13.0, 0, 21.0], kind: 'round' });
  },
};
