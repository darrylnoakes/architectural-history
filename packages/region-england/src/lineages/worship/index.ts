import type { Lineage } from '@ah/kit';
import { normanChurch } from './05-norman-church';

const lineage: Lineage = {
  id: 'worship',
  name: 'The Church',
  role: 'The sacred site: an Iron Age shrine, a Roman temple, then one parish church enlarged and altered for twelve centuries.',
  plotSize: [26, 46],
  stages: [{ from: 1090, def: normanChurch }],
};

export default lineage;
