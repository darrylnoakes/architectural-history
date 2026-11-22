import type { Lineage } from '@ah/kit';
import { renewedBy } from '../../ends';
import { gaulishMarket } from './01-gaulish-market';

const lineage: Lineage = {
  id: 'halles',
  name: 'Les Halles',
  kind: 'market',
  role: 'Where the town buys and sells, from pens by the gate to the great timber halle, the iron market and the thin concrete vault.',
  plotSize: [26, 22],
  stages: [{ from: -300, end: renewedBy(100), def: gaulishMarket }],
};

export default lineage;
