import type { Lineage } from '@ah/kit';
import { ford } from './01-ford';

const lineage: Lineage = {
  id: 'pont',
  name: 'Le Pont',
  kind: 'crossing',
  role: 'Where the main road crosses the river: the ford the town grew up beside, and every bridge since.',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [{ from: -300, def: ford }],
};

export default lineage;
