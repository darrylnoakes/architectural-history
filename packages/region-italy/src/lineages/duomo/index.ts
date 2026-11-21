import type { Lineage } from '@ah/kit';
import { romanesqueDuomo } from './06-romanesque-duomo';
import { gothicDuomo } from './07-gothic-duomo';

const lineage: Lineage = {
  id: 'duomo',
  name: 'The Temple and the Cathedral',
  kind: 'worship',
  role: 'Placeholder',
  plotSize: [32, 60],
  stages: [{ from: 1120, def: romanesqueDuomo }, { from: 1310, def: gothicDuomo }],
};

export default lineage;
