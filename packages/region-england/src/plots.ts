import type { Plot } from '@ah/kit';

const E = Math.PI / 2; // front faces east (+x)
const W = -Math.PI / 2; // front faces west (-x)
const S = 0; // front faces south (+z)
const N = Math.PI; // front faces north (-z)

/**
 * The town plan. World axes: +x east, +z south. The market square is at the origin, the High Street
 * runs north-south along x = 0, Cross Street east-west along z = 0, and the river flows west to east
 * along z = 78. The roads that serve these plots are in apps/town/src/world/layout.ts.
 *
 * `lag` makes a plot adopt each new building type late (but always within the years that type was
 * really being built); `keep` freezes it at one durable building, which is how a Tudor house or a
 * Georgian terrace comes to survive among newer neighbours in the modern town. The rules that keep
 * every year of every plot plausible are in `plotSchedule` (packages/engine/src/time.ts).
 */
export const plots: Plot[] = [
  // --- one of each civic plot
  { id: 'market', lineage: 'market', x: 0, z: 0, rotY: S, seed: 11, hero: true },
  { id: 'church', lineage: 'worship', x: 56, z: -53, rotY: W, seed: 12, hero: true },
  { id: 'power', lineage: 'power', x: -62, z: -60, rotY: S, seed: 13, hero: true },
  { id: 'works', lineage: 'work', x: 58, z: 58, rotY: N, seed: 14, hero: true },
  { id: 'bridge', lineage: 'crossing', x: 0, z: 78, rotY: S, seed: 15, hero: true },
  { id: 'culture', lineage: 'culture', x: -66, z: 27, rotY: N, seed: 16, hero: true },
  { id: 'inn', lineage: 'inn', x: -18, z: -36, rotY: S, seed: 17, hero: true },
  { id: 'chapel', lineage: 'chapel', x: 29, z: 58, rotY: N, seed: 18, hero: true },
  { id: 'farm', lineage: 'farm', x: -128, z: 44, rotY: N, seed: 19, hero: true },

  // --- the big house, and later villas
  { id: 'merchant-1', lineage: 'merchant', x: -42, z: -18.5, rotY: S, seed: 21, hero: true },
  { id: 'merchant-2', lineage: 'merchant', x: 42, z: 18.5, rotY: N, seed: 22, since: 1150, lag: 0.35, keep: 'queen-anne-house' },
  { id: 'merchant-3', lineage: 'merchant', x: 48, z: 118, rotY: N, seed: 23, since: 1865, lag: 0.2, keep: 'victorian-villa' },

  // --- the family home, repeated along the streets
  { id: 'home-1', lineage: 'home', x: -14.5, z: 36, rotY: E, seed: 31, hero: true, skip: ['sixties-house'] },
  { id: 'home-2', lineage: 'home', x: -14.5, z: 53, rotY: E, seed: 32, lag: 0.3, keep: 'georgian-townhouse' },
  { id: 'home-3', lineage: 'home', x: 14.5, z: 33, rotY: W, seed: 33, lag: 0.2, keep: 'victorian-terrace' },
  { id: 'home-4', lineage: 'home', x: 14.5, z: 58, rotY: W, seed: 34, since: 80, lag: 0.45, keep: 'tudor-jettied-house' },
  { id: 'home-5', lineage: 'home', x: 16, z: -33, rotY: S, seed: 35, lag: 0.15, keep: 'georgian-townhouse' },
  { id: 'home-6', lineage: 'home', x: 38, z: -14.5, rotY: S, seed: 36, lag: 0.35, keep: 'wealden-hall-house' },
  { id: 'home-7', lineage: 'home', x: -36, z: 14.5, rotY: N, seed: 37, since: 80, lag: 0.25, keep: 'victorian-terrace' },
  { id: 'home-8', lineage: 'home', x: 64, z: 14.5, rotY: N, seed: 38, since: 1080, lag: 0.5, keep: 'interwar-semi' },
  { id: 'home-9', lineage: 'home', x: -14.5, z: -62, rotY: E, seed: 39, since: 80, lag: 0.1, keep: 'tudor-jettied-house' },
  { id: 'home-10', lineage: 'home', x: 14.5, z: -55, rotY: W, seed: 40, since: 1250, lag: 0.4, keep: 'georgian-townhouse' },
  { id: 'home-11', lineage: 'home', x: 14.5, z: -74, rotY: W, seed: 41, since: 1560, lag: 0.2, keep: 'victorian-terrace' },
  // south of the river: a suburb that grows from the eighteenth century
  { id: 'home-12', lineage: 'home', x: -14.5, z: 110, rotY: E, seed: 42, since: 1720, lag: 0.3, keep: 'victorian-terrace' },
  { id: 'home-13', lineage: 'home', x: 14.5, z: 110, rotY: W, seed: 43, since: 1860, lag: 0.1, keep: 'interwar-semi' },
  { id: 'home-14', lineage: 'home', x: -14.5, z: 127, rotY: E, seed: 44, since: 1860, lag: 0.3, keep: 'interwar-semi' },
  { id: 'home-15', lineage: 'home', x: 14.5, z: 127, rotY: W, seed: 45, since: 1962, lag: 0.4, keep: 'sixties-house' },
  { id: 'home-16', lineage: 'home', x: -14.5, z: 144, rotY: E, seed: 46, since: 2012, lag: 0.3 },
  { id: 'home-17', lineage: 'home', x: 14.5, z: 144, rotY: W, seed: 47, since: 1962, lag: 0.1, keep: 'sixties-house' },

  // --- the row: labourers' housing on the edges of town
  { id: 'row-1', lineage: 'cottage', x: 74, z: -12.5, rotY: S, seed: 51, hero: true, skip: ['council-cottages'] },
  { id: 'row-2', lineage: 'cottage', x: -12.5, z: -92, rotY: E, seed: 52, since: 450, lag: 0.25, keep: 'tudor-almshouses' },
  { id: 'row-3', lineage: 'cottage', x: -44, z: 112, rotY: N, seed: 53, since: 1850, lag: 0.05, keep: 'council-cottages' },
  { id: 'row-4', lineage: 'cottage', x: 88, z: 12.5, rotY: N, seed: 54, since: 1350, lag: 0.2, keep: 'weavers-cottages' },
];
