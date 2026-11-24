import { P, tint, type BuildingDef } from '@ah/kit';
import { church, tower, graveMounds, saxonCross, SAXON_CROSS, SAXON_GRAVES, type WinSpec, type TowerSpec } from './shared';

export const NORMAN_WALL = P.rubble;
export const NORMAN_DRESS = P.limestone;

/** The small round-headed Norman light, deeply splayed inside so only a slit shows outside. */
export const normanWin: WinSpec = { kind: 'round', w: 0.62, h: 1.5, sill: 3.4, splay: 0.22 };
/** Paired belfry openings divided by a shaft, under one round arch. */
export const normanBelfry: WinSpec = { kind: 'round', w: 1.7, h: 2.0, sill: 10.2, tracery: 'twin', border: undefined } as WinSpec;
/** The little slit lighting the ringing chamber below the belfry. */
export const normanTowerSlit: WinSpec = { kind: 'round', w: 0.5, h: 1.2, sill: 6.2, splay: 0.18 };

/** The squat west tower. Later stages keep it: the Early English adds a spire, the Decorated a stage. */
export const normanTower: TowerSpec = {
  size: 6,
  z: 17,
  h: 13,
  wall: NORMAN_WALL,
  dress: NORMAN_DRESS,
  corners: 'clasping',
  courses: [4.6, 9.4],
  belfry: { spec: normanBelfry, n: 1 },
  lower: [normanTowerSlit],
  westWin: { kind: 'round', w: 0.7, h: 1.7, sill: 2.4, splay: 0.24 },
  top: 'pyramid',
  topColor: P.stoneSlate,
};

export const normanChurch: BuildingDef = {
  id: 'norman-church',
  name: 'Norman parish church',
  style: 'Norman (English Romanesque)',
  date: 'c. 1120',
  summary:
    'Two generations after the Conquest the Norman lord pulled down the cramped Saxon church and rebuilt it wider, longer and stronger on the same spot. ' +
    'Everything is round-arched: small windows set high in thick rubble walls, a chancel ending in a semicircular apse, and a squat west tower to hang the bells. ' +
    'The walls are so thick they barely need buttresses; the shallow strips on them are more pattern than prop. ' +
    'Zigzag carving had just become the fashion, and the carving money went on the south doorway, which is ringed with it.',
  materials: ['rubble stone', 'Caen-type limestone dressings', 'stone slate'],
  lookFor: [
    { label: 'Chevron doorway', note: 'Rings of round arches carved with zigzag, on little shafts with cushion capitals: the Norman signature.', at: [4.6, 3.2, 8.1] },
    { label: 'Round-headed windows', note: 'Small and set high, with a deep splay inside to spread the light through a thick wall.', at: [4.1, 4.6, 1.7] },
    { label: 'Apse', note: 'The chancel ends in a semicircle, a form that goes back to the Roman basilica.', at: [0, 4.0, -15.4] },
    { label: 'Pilaster buttresses', note: 'Broad, flat strips of masonry: the thick wall does the work, so they hardly project.', at: [4.3, 2.5, -1.0] },
    { label: 'Corbel table', note: 'A row of projecting stone blocks under the eaves, often carved with heads or beasts.', at: [4.3, 6.2, 12.6] },
    { label: 'Squat west tower', note: 'Low and massive, with paired belfry openings divided by a shaft and a low pyramid cap.', at: [3.2, 11.2, 17] },
  ],
  influences: ['norman-romanesque'],
  build(b) {
    const wall = NORMAN_WALL;
    const dress = NORMAN_DRESS;
    church(b, {
      wall,
      dress,
      plinth: true,
      nave: {
        hw: 4,
        z0: -5,
        z1: 14,
        h: 6.5,
        roof: { rise: 4.2, color: P.stoneSlate },
        windows: { z: [-3.0, 1.7, 6.0, 12.3], spec: normanWin },
        buttress: { kind: 'pilaster', z: [-4.4, -0.65, 3.85, 10.4] },
        corbels: true,
      },
      chancel: {
        hw: 3,
        len: 7,
        h: 5.5,
        roof: { rise: 3.3, color: P.stoneSlate },
        apse: true,
        windows: { z: [-8.5], spec: { ...normanWin, sill: 2.8 } },
        buttress: { kind: 'pilaster', z: [-10.5] },
        corbels: true,
      },
      southDoor: 'norman',
    });
    tower(b, normanTower);
    // the old Saxon cross still stands in the churchyard, among the Saxon graves
    saxonCross(b, SAXON_CROSS, tint(P.sandstone, 0.02));
    graveMounds(b, SAXON_GRAVES, tint(P.grass, -0.06));
  },
};
