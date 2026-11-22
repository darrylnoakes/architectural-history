export * from './types';
export * from './palette';
export * from './rng';
export * from './builder';
export * from './noise';
export * from './props';

import { Builder, type Built } from './builder';
import type { BuildingDef } from './types';

/**
 * Build a building definition into a ready-to-add THREE.Group. `cutaway` is for buildings that can
 * open themselves up to show the inside: on by default, off for the townscape.
 */
export function construct(def: BuildingDef, seed = 1, variant = 0, cutaway = true): Built {
  const b = new Builder(seed, variant, cutaway);
  def.build(b);
  return b.finish();
}
