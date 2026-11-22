import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHall } from './01-gaulish-hall';
import { mansio } from './02-mansio';

const lineage: Lineage = {
  id: 'auberge',
  name: 'L’Auberge',
  kind: 'hospitality',
  role: 'Where travellers have been fed, watered and put up for the night, from a Gaulish chief’s feasting hall to a restored Art Nouveau brasserie.',
  plotSize: [22, 22],
  stages: [
    { from: -300, builtUntil: -30, end: renewedBy(50), def: gaulishHall },
    { from: 50, builtUntil: 250, end: invasions, def: mansio },
  ],
};

export default lineage;
