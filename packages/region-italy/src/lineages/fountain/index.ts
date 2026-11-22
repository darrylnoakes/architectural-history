import type { Lineage } from '@ah/kit';
import { civicFountain } from './01-civic-fountain';

const lineage: Lineage = {
  id: 'fountain',
  name: 'The Fountain',
  kind: 'culture',
  role: 'x',
  plotSize: [12, 12],
  stages: [{ from: 1278, def: civicFountain }],
};

export default lineage;
