export * from './types';
export * from './palette';
export * from './rng';
export * from './builder';

import { Builder, type Built } from './builder';
import type { BuildingDef } from './types';

/** Build a building definition into a ready-to-add THREE.Group. */
export function construct(def: BuildingDef, seed = 1, variant = 0): Built {
  const b = new Builder(seed, variant);
  def.build(b);
  return b.finish();
}
