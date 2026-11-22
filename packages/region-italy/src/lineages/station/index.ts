import type { Lineage } from '@ah/kit';
import { firstStation } from './01-first-station';
import { rationalistStation } from './02-rationalist-station';
import { highSpeedStation } from './03-high-speed-station';

const lineage: Lineage = {
  id: 'station',
  name: 'The Station',
  kind: 'transport',
  role: 'Where the railway reaches the town.',
  plotSize: [40, 24],
  stages: [{ from: 1864, def: firstStation }, { from: 1934, def: rationalistStation }, { from: 2013, def: highSpeedStation }],
};

export default lineage;
