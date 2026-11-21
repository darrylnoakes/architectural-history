import type { Lineage } from '@ah/kit';
import { georgianChapel } from './georgian-chapel';

/** One-off buildings that appear at a point in the story and stay. */
export const chapel: Lineage = {
  id: 'chapel',
  name: 'The Chapel',
  role: 'The meeting house of those who would not worship in the parish church.',
  plotSize: [12, 18],
  stages: [{ from: 1790, def: georgianChapel }],
};
