import type { Lineage } from '@ah/kit';
import { gothicPalazzo } from './08-gothic-palazzo';
import { renaissancePalazzo } from './09-renaissance-palazzo';
import { romanPalazzo } from './10-roman-palazzo';
import { baroquePalazzo } from './11-baroque-palazzo';

const lineage: Lineage = {
  id: 'palazzo',
  name: 'The Palazzo',
  kind: 'elite',
  role: 'wip',
  plotSize: [24, 26],
  stages: [{ from: 1320, def: gothicPalazzo }, { from: 1460, def: renaissancePalazzo }, { from: 1545, def: romanPalazzo }, { from: 1665, def: baroquePalazzo }],
};

export default lineage;
