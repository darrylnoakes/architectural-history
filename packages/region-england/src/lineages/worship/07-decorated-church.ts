import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { church, tower, porch, win, churchyardCross, graveMounds, DOOR_Z, type WinSpec, type TowerSpec } from './shared';
import { NORMAN_DRESS, NORMAN_WALL, normanBelfry } from './05-norman-church';
import { EE_ROOF, eeChancel } from './06-early-english-church';

export const DEC_AISLE_WALL = P.ragstone;
export const DEC_DRESS = tint(P.limestone, 0.03);

/** Two pointed lights with a foiled circle in the head: Geometric tracery. */
export const decAisleWin: WinSpec = { kind: 'pointed', w: 1.6, h: 2.9, sill: 1.0, tracery: 'geometric', lights: 2, hood: 'arch' };

/** The great east window: five ogee-headed lights and a net of reticulated tracery. */
export function decEast(b: Builder, at: Vec3) {
  const [x, , z] = at;
  win(b, { kind: 'pointed', w: 3.8, h: 5.9, at: [x, 1.4, z], facing: '-z', frame: DEC_DRESS, tracery: 'reticulated', lights: 5, hood: 'arch' });
}

/** The Norman tower heightened with a new belfry stage, and a tall spire behind a pinnacled parapet. */
export const decTower: TowerSpec = {
  size: 6,
  z: 17,
  h: 16.6,
  wall: NORMAN_WALL,
  dress: NORMAN_DRESS,
  corners: 'clasping',
  courses: [4.6, 9.4, 13.2],
  belfry: { spec: { kind: 'pointed', w: 1.5, h: 2.5, sill: 13.6, tracery: 'geometric', lights: 2, hood: 'arch' }, n: 1 },
  lower: [{ ...normanBelfry, sill: 10.2 }],
  westWin: { kind: 'lancet', w: 0.7, h: 2.6, sill: 2.0, hood: 'arch' },
  top: 'spire',
  topColor: tint(P.limestone, -0.04),
  spireH: 19,
};

export const decoratedChurch: BuildingDef = {
  id: 'decorated-church',
  name: 'Parish church rebuilt and enriched',
  style: 'Decorated Gothic',
  date: 'c. 1340',
  summary:
    'Prosperity in the early fourteenth century paid for wider aisles with much bigger windows, whose stone tracery now fills the head of each window with circles, curves and ogees. ' +
    'A great five-light east window was cut into the Early English chancel, a porch was built over the south door, and the tower was raised a stage to carry a taller spire behind a pinnacled parapet. ' +
    'The Norman nave walls, the zigzag doorway and the chancel lancets all survive inside the new work. Within a decade the Black Death of 1348 to 1349 would halt work like this across England.',
  materials: ['ragstone', 'limestone tracery and dressings', 'clay tile', 'lead'],
  lookFor: [
    { label: 'Geometric tracery', note: 'Two pointed lights with a foiled circle above: the window is now a stone pattern, not just a hole.', at: [9.4, 3.4, -2.7] },
    { label: 'Reticulated east window', note: 'Five lights with S-curved ogee heads and a net of ogee shapes above, the peak of Decorated design.', at: [0, 5.8, -17.4] },
    { label: 'South porch', note: 'Shelter for the main entrance, where weddings and parts of baptisms took place.', at: [12.8, 3.0, DOOR_Z] },
    { label: 'Ballflower', note: 'A small three-petalled ball, repeated along cornices and window arches; the hallmark ornament of c. 1310 to 1340.', at: [9.3, 4.2, 11.5] },
    { label: 'Spire with pinnacles', note: 'A taller spire set back behind a parapet, with a pinnacle at each corner and gabled spire lights.', at: [2.6, 19.6, 19.6] },
  ],
  influences: ['french-gothic'],
  build(b) {
    church(b, {
      wall: NORMAN_WALL,
      dress: DEC_DRESS,
      plinth: true,
      nave: { hw: 4, z0: -5, z1: 14, h: 6.5, roof: { rise: 5.8, color: EE_ROOF } },
      chancel: eeChancel({ east: decEast }),
      aisles: {
        w: 5,
        h: 4.6,
        roof: { rise: 1.75, color: P.lead },
        spec: decAisleWin,
        buttress: 'stepped',
        ballflower: true,
        wall: DEC_AISLE_WALL,
      },
      southDoor: 'norman',
    });
    tower(b, decTower);
    porch(b, { wall: DEC_AISLE_WALL, dress: DEC_DRESS, x: 9, z: DOOR_Z, d: 3.4, w: 3.6, h: 3.0, roof: { rise: 1.6, color: EE_ROOF }, arch: 'pointed' });
    churchyardCross(b, [8.0, 0, -12.0], P.limestone);
    graveMounds(b, [[11.5, -6], [11.2, -14], [-11.5, -12], [-11.4, -5.5], [6.8, -20.5]], tint(P.grass, -0.06));
  },
};
