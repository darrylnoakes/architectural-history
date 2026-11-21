import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { church, tower, win, churchyardCross, graveMounds, BAY_EDGES, type WinSpec, type ChurchSpec, type TowerSpec } from './shared';
import { NORMAN_DRESS, NORMAN_WALL, normanBelfry } from './05-norman-church';

export const EE_AISLE_WALL = tint(P.rubble, 0.04);
export const EE_CHANCEL_WALL = tint(P.rubble, 0.03);
export const EE_ROOF = P.tileRed;

/** The lancet: a single tall, narrow, sharply pointed light. */
export const lancet: WinSpec = { kind: 'lancet', w: 0.6, h: 2.5, sill: 1.6, hood: 'arch' };

/** Stepped triple lancet in the new square east end. */
export function eeEast(b: Builder, at: Vec3) {
  const [x, , z] = at;
  for (const [dx, h] of [[-1.2, 3.8], [0, 4.7], [1.2, 3.8]] as [number, number][]) {
    win(b, { kind: 'lancet', w: 0.8, h, at: [x + dx, 1.8, z], facing: '-z', frame: NORMAN_DRESS, hood: 'arch' });
  }
}

/** The new longer, square-ended chancel. Later stages keep it. */
export function eeChancel(over: Partial<ChurchSpec['chancel']> = {}): ChurchSpec['chancel'] {
  return {
    hw: 3,
    len: 12,
    h: 6,
    roof: { rise: 4.3, color: EE_ROOF },
    windows: { z: [-6.8, -10.45, -15.0], spec: lancet },
    buttress: { kind: 'stepped', z: [-8.6, -13.2], corners: true },
    priestDoor: 'pointed',
    priestDoorZ: -11.9,
    east: eeEast,
    wall: EE_CHANCEL_WALL,
    ...over,
  };
}

/** The Norman tower, kept, with a stone broach spire on top. */
export const eeTower: TowerSpec = {
  size: 6,
  z: 17,
  h: 13,
  wall: NORMAN_WALL,
  dress: NORMAN_DRESS,
  corners: 'clasping',
  courses: [4.6, 9.4],
  belfry: { spec: normanBelfry, n: 1 },
  lower: [{ kind: 'round', w: 0.5, h: 1.2, sill: 6.2, splay: 0.18 }],
  westWin: { kind: 'lancet', w: 0.7, h: 2.6, sill: 2.0, hood: 'arch' },
  top: 'broach',
  topColor: tint(P.limestone, -0.04),
  spireH: 13,
};

export const earlyEnglishChurch: BuildingDef = {
  id: 'early-english-church',
  name: 'Parish church enlarged',
  style: 'Early English Gothic',
  date: 'c. 1240',
  summary:
    'A growing parish needed more room, so the Norman nave walls were pierced with arcades and lean-to aisles built on either side; the old zigzag doorway was carefully taken down and re-set in the new south wall. ' +
    'The new work is Gothic, the style brought from France: tall, narrow pointed lancet windows, deep stepped buttresses and steep roofs. ' +
    'The apse was swept away for a longer, square-ended chancel lit by three stepped lancets, and the squat Norman tower was crowned with a broach spire.',
  materials: ['rubble stone', 'limestone dressings', 'clay tile', 'stone spire'],
  lookFor: [
    { label: 'Lancet windows', note: 'Tall, narrow and sharply pointed, with no tracery: the first Gothic windows.', at: [7.9, 3.0, 4.5] },
    { label: 'Stepped triple lancet', note: 'Three lancets grouped in the east wall, the middle one tallest.', at: [0, 5.2, -17.4] },
    { label: 'Broach spire', note: 'An octagonal spire on a square tower; sloping half-pyramids, the broaches, fill the corners.', at: [2.6, 13.9, 19.6] },
    { label: 'Stepped buttresses', note: 'Deep buttresses that step back in stages, each with a sloping weathering.', at: [8.6, 2.0, BAY_EDGES[1]] },
    { label: 'Aisles', note: 'Lean-to aisles added on both sides, opening into the nave through arcades cut in the Norman walls.', at: [7.6, 4.8, -1] },
    { label: 'Re-set Norman doorway', note: 'The zigzag doorway was moved stone by stone into the new aisle wall.', at: [8.1, 3.2, 8.1] },
  ],
  influences: ['french-gothic'],
  build(b) {
    church(b, {
      wall: NORMAN_WALL,
      dress: NORMAN_DRESS,
      plinth: true,
      nave: { hw: 4, z0: -5, z1: 14, h: 6.5, roof: { rise: 5.8, color: EE_ROOF } },
      chancel: eeChancel(),
      aisles: {
        w: 3.5,
        h: 4.0,
        roof: { rise: 1.75, color: EE_ROOF },
        spec: { ...lancet, sill: 1.2, h: 2.3 },
        buttress: 'stepped',
        wall: EE_AISLE_WALL,
      },
      southDoor: 'norman',
    });
    tower(b, eeTower);
    churchyardCross(b, [8.0, 0, -10.5], P.limestone);
    graveMounds(b, [[10.5, -6], [10.8, -13], [-9.5, -12], [-9.8, -6.5], [6.8, -19.5]], tint(P.grass, -0.06));
  },
};
