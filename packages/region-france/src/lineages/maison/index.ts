import type { Lineage } from '@ah/kit';
import { renewedBy } from '../../ends';
import { gaulishHouse } from './01-gaulish-house';

const lineage: Lineage = {
  id: 'maison',
  name: 'La Maison',
  kind: 'home',
  role: 'One ordinary household plot, from a Gaulish farmhouse in a fenced yard to a timber-clad eco-house, where farmers, craftsmen, shopkeepers and clerks lived for over two thousand years.',
  plotSize: [14, 18],
  stages: [{ from: -300, builtUntil: -30, end: renewedBy(60), def: gaulishHouse }],
};

export default lineage;
