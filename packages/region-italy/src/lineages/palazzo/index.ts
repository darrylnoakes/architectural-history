import type { Lineage } from '@ah/kit';
import { gothicPalazzo } from './08-gothic-palazzo';
import { renaissancePalazzo } from './09-renaissance-palazzo';

const lineage: Lineage = {
  id: 'palazzo',
  name: 'The Palazzo',
  kind: 'elite',
  role: 'wip',
  plotSize: [24, 26],
  stages: [{ from: 1320, def: gothicPalazzo }, { from: 1460, def: renaissancePalazzo }],
};

export default lineage;
