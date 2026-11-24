export * from './types';
export * from './palette';
export * from './rng';
export * from './builder';
export * from './noise';
export * from './props';
export * from './circuit';
export * from './cut';

import { Builder, type Built } from './builder';
import type { BuildingDef } from './types';

/** The year of the latest of a building's revisions made by `year`, or -Infinity if it is still as built. */
export function revisionYear(def: BuildingDef, year: number): number {
  let at = -Infinity;
  for (const r of def.revisions ?? []) if (r.year <= year && r.year > at) at = r.year;
  return at;
}

/**
 * Build a building definition into a ready-to-add THREE.Group. `cutaway` is for buildings that can
 * open themselves up to show the inside: on by default, off for the townscape. `year` picks which of
 * its `revisions` are in force (none by default: the building as first built).
 */
export function construct(def: BuildingDef, seed = 1, variant = 0, cutaway = true, year = -Infinity): Built {
  const b = new Builder(seed, variant, cutaway, revisionYear(def, year));
  def.build(b);
  return b.finish();
}
