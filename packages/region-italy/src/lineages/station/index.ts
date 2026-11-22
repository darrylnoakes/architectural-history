import type { Lineage } from '@ah/kit';
import { firstStation } from './01-first-station';
import { rationalistStation } from './02-rationalist-station';

const lineage: Lineage = {
  id: 'station',
  name: 'The Station',
  kind: 'transport',
  role: 'Where the railway reaches the town.',
  plotSize: [40, 24],
  stages: [{ from: 1864, def: firstStation }, { from: 1934, def: rationalistStation }],
};

export default lineage;
