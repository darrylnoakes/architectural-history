import { P, tint, type BuildingDef } from '@ah/kit';
import { church, tower, porch, churchyardCross, graveMounds, BAYS, DOOR_Z, CROSS, GRAVES, type WinSpec, type TowerSpec, type ChurchSpec } from './shared';
import { NORMAN_WALL } from './05-norman-church';
import { eeChancel } from './06-early-english-church';
import { DEC_AISLE_WALL, DEC_DRESS, decEast } from './07-decorated-church';

/** Fine ashlar of the wool-church rebuilding. */
export const PERP_ASHLAR = P.limestoneWarm;
export const PERP_DRESS = tint(P.limestoneWarm, 0.04);

/** Big aisle window: straight mullions running up into the head (panel tracery). */
export const perpAisleWin: WinSpec = { kind: 'drop', w: 2.7, h: 3.4, sill: 0.95, tracery: 'panel', lights: 3, hood: 'arch' };
/** Clerestory window: flattened four-centred arch, three lights, square label. */
export const perpClerestory: WinSpec = { kind: 'tudor', w: 2.3, h: 1.75, sill: 7.25, tracery: 'panel', lights: 3, hood: 'square' };

export const perpTower: TowerSpec = {
  size: 7,
  z: 17.5,
  h: 25,
  wall: PERP_ASHLAR,
  dress: PERP_DRESS,
  corners: 'diagonal',
  courses: [5.2, 11.6, 17.8],
  belfry: { spec: { kind: 'drop', w: 2.6, h: 3.6, sill: 19.4, tracery: 'panel', lights: 3, hood: 'arch' }, n: 1 },
  lower: [{ kind: 'tudor', w: 1.3, h: 1.5, sill: 13.4, tracery: 'panel', lights: 2, hood: 'square' }],
  westDoor: 'tudor',
  westWin: { kind: 'drop', w: 3.1, h: 4.9, sill: 4.9, tracery: 'panel', lights: 4, hood: 'arch' },
  top: 'battle',
};

/** The church as the wool-church rebuilding left it (the Victorian stage builds on this). */
export function perpChurchSpec(over: { naveRoof?: ChurchSpec['nave']['roof']; chancelRoof?: ChurchSpec['chancel']['roof'] } = {}): ChurchSpec {
  return {
    wall: NORMAN_WALL,
    dress: PERP_DRESS,
    plinth: true,
    nave: {
      hw: 4,
      z0: -5,
      z1: 14,
      h: 9.7,
      roof: over.naveRoof ?? { rise: 1.0, color: P.lead, parapet: 'battle' },
      clerestory: { z: BAYS, spec: perpClerestory, from: 6.5, wall: PERP_ASHLAR },
    },
    chancel: eeChancel({ east: decEast, ...(over.chancelRoof ? { roof: over.chancelRoof } : {}) }),
    aisles: {
      w: 5,
      h: 4.6,
      roof: { rise: 1.35, color: P.lead, parapet: 'battle' },
      spec: perpAisleWin,
      buttress: 'stepped',
      pinnacles: true,
      wall: DEC_AISLE_WALL,
    },
    southDoor: 'norman',
  };
}

export const perpendicularChurch: BuildingDef = {
  id: 'perpendicular-church',
  name: 'Wool church',
  style: 'Perpendicular Gothic',
  date: 'c. 1470',
  summary:
    'Rich from the wool and cloth trade, the town\'s merchants rebuilt their church to show it off, in the uniquely English Perpendicular style. ' +
    'The nave walls were raised to take a clerestory, a row of windows above the aisle roofs, and the nave and aisle roofs were lowered to a shallow pitch of lead hidden behind battlements. ' +
    'The Decorated aisle walls were kept, but their windows grew huge, divided into upright panels by straight mullions, so the church became a lantern of glass. ' +
    'The old spire was taken down and replaced by a tall new west tower with pinnacles, built in fine ashlar. The steep Early English chancel roof and the Decorated east window were left alone.',
  materials: ['limestone ashlar', 'ragstone', 'rubble stone', 'lead', 'clay tile'],
  lookFor: [
    { label: 'Clerestory', note: 'A row of windows high in the raised nave walls, lighting the nave over the aisle roofs.', at: [4.3, 8.2, 4.5] },
    { label: 'Panel tracery', note: 'Straight vertical mullions run right up into the arch, dividing the glass into tall panels.', at: [9.4, 3.2, -2.7] },
    { label: 'Battlements', note: 'Low lead roofs are hidden behind battlemented parapets: the roofline turns flat and horizontal.', at: [9.0, 5.6, 0.9] },
    { label: 'West tower with pinnacles', note: 'A tall ashlar tower with diagonal buttresses, a great west window and a crown of battlements and pinnacles.', at: [3.2, 26.6, 20.8] },
    { label: 'Two-storey porch', note: 'The porch was rebuilt with an upper room, often called the parvise, used as a school, a store or a priest\'s lodging.', at: [12.8, 5.3, DOOR_Z] },
  ],
  influences: ['perpendicular'],
  build(b) {
    church(b, perpChurchSpec());
    tower(b, perpTower);
    porch(b, { wall: PERP_ASHLAR, dress: PERP_DRESS, x: 9, z: DOOR_Z, d: 3.4, w: 3.6, h: 6.0, roof: { rise: 0, color: P.lead, parapet: 'battle' }, arch: 'tudor', upper: true });
    churchyardCross(b, CROSS, P.limestone);
    graveMounds(b, [...GRAVES, [-7, -20]], tint(P.grass, -0.06));
  },
};
