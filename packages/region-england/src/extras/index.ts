import type { Lineage } from '@ah/kit';
import { georgianChapel } from './georgian-chapel';
import { longhouse } from './longhouse';

/** One-off buildings that appear at a point in the story and stay. */
export const chapel: Lineage = {
  id: 'chapel',
  name: 'The Chapel',
  role: 'The meeting house of those who would not worship in the parish church.',
  plotSize: [12, 18],
  stages: [{ from: 1790, def: georgianChapel }],
};

/** A peasant holding beyond the last houses: the rural building the town plots never had. */
export const farm: Lineage = {
  id: 'farm',
  name: 'The Farm',
  role: 'A peasant holding at the edge of the town fields, where a family and its cattle shared one roof.',
  plotSize: [14, 18],
  stages: [
    {
      from: 1150,
      builtUntil: 1300,
      end: {
        year: 1400,
        fate: 'cleared',
        note:
          'After the Black Death of 1348 to 1349 there were far fewer people to work the land. Small holdings like this were given up ' +
          'or merged into larger farms, and a house of mud and thatch, once the roof was off, slumped back into the ground within a few years.',
      },
      def: longhouse,
    },
  ],
};
