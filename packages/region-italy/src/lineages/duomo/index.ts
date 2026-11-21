import type { Lineage } from '@ah/kit';
import { romanesqueDuomo } from './06-romanesque-duomo';
import { gothicDuomo } from './07-gothic-duomo';
import { dome } from './08-dome';
import { baroqueDuomo } from './09-baroque-duomo';

const lineage: Lineage = {
  id: 'duomo',
  name: 'The Temple and the Cathedral',
  kind: 'worship',
  role: 'Placeholder',
  plotSize: [32, 60],
  stages: [{ from: 1120, def: romanesqueDuomo }, { from: 1310, def: gothicDuomo }, { from: 1440, def: dome }, { from: 1630, def: baroqueDuomo }],
};

export default lineage;
