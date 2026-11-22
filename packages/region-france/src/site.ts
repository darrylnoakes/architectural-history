import type { Site } from '@ah/kit';

/** The ground the French town stands on. A placeholder until the town plan is laid out. */
export const site: Site = {
  centre: [0, 20],
  radius: 440,
  river: { z: () => 96, half: 12 },
  relief: () => 0,
  roads: [],
  squares: [],
  trees: [{ kind: 'round', share: 1 }],
  props: [],
};
