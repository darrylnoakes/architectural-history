import type { Plot } from '@ah/kit';

const E = Math.PI / 2; // front faces east (+x)
const W = -Math.PI / 2; // front faces west (-x)
const S = 0; // front faces south (+z)
const N = Math.PI; // front faces north (-z)

/**
 * The city plan. World axes: +x east, +z south. The cardo runs north-south along x = 0 and the
 * decumanus east-west along z = 0; the river flows west to east along z = 96. The streets, the
 * squares and the ground itself are in `site.ts`.
 *
 * An Italian city keeps what it builds. So where England's plots mostly rebuild in turn, most plots
 * here stop at some point (`keep`) and stand from then on as survivors, and the later stages of each
 * lineage appear on new plots (`since`): the villas outside the gate, the quarter of united Italy
 * beyond the river, the housing estates at the edge. `lag` makes a plot adopt each type late, but
 * always within the years it was really being built. The rules that keep every year of every plot
 * plausible are in `plotSchedule` (packages/engine/src/time.ts).
 */
export const plots: Plot[] = [
  // --- the seat of power: on the north side of Piazza Grande, with the fountain in front of it
  // (the old palace goes from the lord's works of 1480 straight to its restoration; the offices of
  // united Italy, the party and the region are separate buildings on their own ground, built without
  // the palace because they are not on the main plot)
  { id: 'power', lineage: 'power', x: 32, z: -73, rotY: S, seed: 11, hero: true, skip: ['prefecture', 'casa-del-fascio', 'regional-offices'] },
  { id: 'prefettura', lineage: 'power', x: 101, z: -60, rotY: E, seed: 12, since: 1885, keep: 'prefecture' },
  { id: 'casa-del-fascio', lineage: 'power', x: 110, z: 155.5, rotY: N, seed: 34, since: 1934, keep: 'casa-del-fascio' },
  { id: 'regione', lineage: 'power', x: 86, z: 163.5, rotY: N, seed: 35, since: 1975, keep: 'regional-offices' },
  { id: 'fountain', lineage: 'fountain', x: 32, z: -28, rotY: S, seed: 13, hero: true, keep: 'civic-fountain' },
  { id: 'fountain-2', lineage: 'fountain', x: -38, z: -17, rotY: S, seed: 36, since: 1643 },

  // --- the temple, then the cathedral, on its own square west of the cardo
  { id: 'duomo', lineage: 'duomo', x: -54, z: -60, rotY: S, seed: 14, hero: true },

  // --- markets: the loggia in the old market square, the arcade by the cathedral, the market hall beyond the river
  { id: 'market', lineage: 'market', x: -46, z: 55, rotY: S, seed: 15, hero: true, keep: 'renaissance-loggia' },
  { id: 'galleria', lineage: 'market', x: -92, z: -16.5, rotY: S, seed: 16, since: 1877, keep: 'galleria' },
  { id: 'market-hall', lineage: 'market', x: -76, z: 152.5, rotY: N, seed: 17, since: 1936 },

  // --- work: the mills on the north bank, the factories on the south
  { id: 'works', lineage: 'work', x: 60, z: 73, rotY: N, seed: 18, hero: true, keep: 'hydro-plant' },
  { id: 'factory', lineage: 'work', x: -90, z: 119, rotY: S, seed: 19, since: 1926 },

  // --- three bridges: the old one, rebuilt as it was; the boulevard bridge downstream; the footbridge upstream
  { id: 'bridge', lineage: 'bridge', x: 0, z: 96, rotY: S, seed: 20, hero: true, skip: ['iron-bridge'], keep: 'rebuilt-bridge' },
  { id: 'new-bridge', lineage: 'bridge', x: 128, z: 96, rotY: S, seed: 21, since: 1880, skip: ['bailey-bridge', 'rebuilt-bridge'], keep: 'concrete-bridge' },
  { id: 'footbridge', lineage: 'bridge', x: -36, z: 96, rotY: S, seed: 22, since: 2008 },

  // --- spectacle: the amphitheatre that becomes houses, the theatre, and the halls of the twentieth century
  { id: 'arena', lineage: 'spectacle', x: -112, z: 24, rotY: N, seed: 23, hero: true, keep: 'arena-houses' },
  { id: 'theatre', lineage: 'spectacle', x: 101, z: -23.5, rotY: S, seed: 24, since: 1585, keep: 'opera-house' },
  { id: 'cinema', lineage: 'spectacle', x: 151.5, z: -50, rotY: W, seed: 25, since: 1911, keep: 'liberty-cinema' },
  { id: 'stadium', lineage: 'spectacle', x: -128, z: 159.5, rotY: N, seed: 37, since: 1932, keep: 'stadium' },
  { id: 'sports-hall', lineage: 'spectacle', x: 152, z: 36, rotY: W, seed: 38, since: 1957, keep: 'sports-hall' },
  { id: 'auditorium', lineage: 'spectacle', x: -172, z: 159.5, rotY: N, seed: 39, since: 2002 },

  // --- food, drink and a bed
  { id: 'osteria', lineage: 'osteria', x: 16.5, z: 37, rotY: W, seed: 26, hero: true, skip: ['posting-inn', 'grand-cafe', 'grand-hotel', 'bar-and-pensione'] },
  { id: 'caffe', lineage: 'osteria', x: 69.5, z: -28, rotY: W, seed: 27, since: 1740, keep: 'grand-cafe' },
  { id: 'grand-hotel', lineage: 'osteria', x: 37, z: 164, rotY: W, seed: 28, since: 1898, keep: 'grand-hotel' },
  { id: 'bar', lineage: 'osteria', x: -60, z: 119.5, rotY: S, seed: 29, since: 1958, keep: 'bar-and-pensione' },

  // --- gates: north on the cardo, east and west on the decumanus (the bridge guards the south)
  { id: 'gate-north', lineage: 'walls', x: 0, z: -128, rotY: N, seed: 30, hero: true, keep: 'bastion-gate' },
  { id: 'gate-east', lineage: 'walls', x: 146, z: 0, rotY: E, seed: 31, since: -400, lag: 0.3 },
  { id: 'gate-west', lineage: 'walls', x: -150, z: 0, rotY: W, seed: 32, since: -30, lag: 0.5, keep: 'communal-gate' },

  // --- the railway
  { id: 'station', lineage: 'station', x: 0, z: 184, rotY: N, seed: 33, hero: true },

  // --- the palazzo: three in the centre that stop at different centuries, and the villas outside
  { id: 'palazzo', lineage: 'palazzo', x: 40, z: 19, rotY: N, seed: 41, hero: true, keep: 'baroque-palazzo' },
  { id: 'palazzo-2', lineage: 'palazzo', x: -44, z: 19, rotY: N, seed: 42, since: 1130, lag: 0.3, keep: 'gothic-palazzo' },
  { id: 'palazzo-3', lineage: 'palazzo', x: 66, z: 18.5, rotY: N, seed: 43, since: 1320, lag: 0.45, keep: 'renaissance-palazzo' },
  { id: 'villa', lineage: 'palazzo', x: -18.5, z: -160, rotY: E, seed: 44, since: 1790, keep: 'neoclassical-villa' },
  { id: 'villino', lineage: 'palazzo', x: -40, z: 154.5, rotY: N, seed: 45, since: 1905, keep: 'liberty-villa' },
  { id: 'villa-moderna', lineage: 'palazzo', x: 18.5, z: -160, rotY: W, seed: 46, since: 1936, keep: 'rationalist-villa' },
  { id: 'villa-oggi', lineage: 'palazzo', x: 18.5, z: -196, rotY: W, seed: 47, since: 2008 },

  // --- the family home: rows along the cardo and the decumanus, each stopping where its luck ran out
  { id: 'home-1', lineage: 'home', x: -14.5, z: 27, rotY: E, seed: 51, hero: true, keep: 'renaissance-house' },
  { id: 'home-2', lineage: 'home', x: -14.5, z: 13, rotY: E, seed: 52, lag: 0.3, skip: ['garden-apartment', 'house-in-ruins'], keep: 'casa-a-schiera' },
  { id: 'home-3', lineage: 'home', x: -14.5, z: 41, rotY: E, seed: 53, lag: 0.2, keep: 'baroque-townhouse' },
  { id: 'home-4', lineage: 'home', x: -14.5, z: 67, rotY: E, seed: 54, since: -200, lag: 0.4, keep: 'renaissance-house' },
  { id: 'home-5', lineage: 'home', x: 14.5, z: 13, rotY: W, seed: 55, lag: 0.15, skip: ['garden-apartment', 'house-in-ruins'], keep: 'baroque-townhouse' },
  { id: 'home-6', lineage: 'home', x: 14.5, z: 67, rotY: W, seed: 56, since: -200, lag: 0.5, keep: 'casa-a-schiera' },
  { id: 'home-7', lineage: 'home', x: -14.5, z: -16, rotY: E, seed: 57, lag: 0.25, keep: 'umbertine-apartments' },
  { id: 'home-8', lineage: 'home', x: -14.5, z: -30, rotY: E, seed: 58, lag: 0.1, skip: ['garden-apartment', 'house-in-ruins'], keep: 'renaissance-house' },
  { id: 'home-9', lineage: 'home', x: -14.5, z: -44, rotY: E, seed: 59, since: -550, lag: 0.35, keep: 'baroque-townhouse' },
  { id: 'home-10', lineage: 'home', x: -14.5, z: -58, rotY: E, seed: 60, since: -200, lag: 0.45, skip: ['garden-apartment', 'house-in-ruins'], keep: 'casa-a-schiera' },
  { id: 'home-11', lineage: 'home', x: -14.5, z: -72, rotY: E, seed: 61, since: 100, lag: 0.2, keep: 'renaissance-house' },
  { id: 'home-12', lineage: 'home', x: 14.5, z: -106, rotY: W, seed: 62, since: 1200, lag: 0.5, keep: 'baroque-townhouse' },
  { id: 'home-13', lineage: 'home', x: 88, z: 14.5, rotY: N, seed: 63, since: 100, lag: 0.3, keep: 'umbertine-apartments' },
  { id: 'home-14', lineage: 'home', x: 102, z: 14.5, rotY: N, seed: 64, since: 1200, lag: 0.6, keep: 'baroque-townhouse' },
  { id: 'home-15', lineage: 'home', x: -78, z: 14.5, rotY: N, seed: 65, since: -200, lag: 0.3, skip: ['garden-apartment', 'house-in-ruins'], keep: 'renaissance-house' },
  { id: 'home-16', lineage: 'home', x: -112, z: -14.5, rotY: S, seed: 66, since: 1200, lag: 0.4, keep: 'casa-a-schiera' },
  { id: 'home-17', lineage: 'home', x: -126, z: -14.5, rotY: S, seed: 67, since: 1480, lag: 0.5, keep: 'baroque-townhouse' },
  { id: 'home-18', lineage: 'home', x: 95, z: 69.5, rotY: N, seed: 68, since: 1200, lag: 0.7, keep: 'umbertine-apartments' },
  // beyond the river: the quarter of united Italy, then the boom
  { id: 'home-19', lineage: 'home', x: -14.5, z: 124, rotY: E, seed: 69, since: 1885, lag: 0.1, keep: 'umbertine-apartments' },
  { id: 'home-20', lineage: 'home', x: 14.5, z: 124, rotY: W, seed: 70, since: 1885, lag: 0.4, keep: 'umbertine-apartments' },
  { id: 'home-21', lineage: 'home', x: -14.5, z: 148.5, rotY: E, seed: 71, since: 1962, lag: 0.2, keep: 'palazzina' },
  { id: 'home-22', lineage: 'home', x: 14.5, z: 148.5, rotY: W, seed: 72, since: 1962, lag: 0.5, keep: 'palazzina' },
  { id: 'home-23', lineage: 'home', x: 55.5, z: 150.5, rotY: N, seed: 73, since: 2016 },

  // --- the tenement: by the mills, then the estates of each generation of public housing
  { id: 'tenement', lineage: 'tenement', x: 44, z: 43.5, rotY: S, seed: 81, hero: true, keep: 'raised-row' },
  { id: 'tenement-2', lineage: 'tenement', x: 88, z: 43.5, rotY: S, seed: 82, since: -300, lag: 0.3, keep: 'workers-row' },
  { id: 'ringhiera', lineage: 'tenement', x: 40, z: 122.5, rotY: S, seed: 83, since: 1880, keep: 'casa-di-ringhiera' },
  { id: 'case-popolari', lineage: 'tenement', x: 70, z: 122.5, rotY: S, seed: 84, since: 1926, keep: 'case-popolari' },
  { id: 'ina-casa', lineage: 'tenement', x: 100, z: 122.5, rotY: S, seed: 85, since: 1954, keep: 'ina-casa' },
  { id: 'megastructure', lineage: 'tenement', x: 190, z: -13.5, rotY: S, seed: 86, since: 1978, keep: 'megastructure' },
  { id: 'social-housing', lineage: 'tenement', x: 190, z: 13.5, rotY: N, seed: 87, since: 2018 },
];
