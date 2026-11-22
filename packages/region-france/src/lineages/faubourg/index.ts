import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHuts } from './01-gaulish-huts';
import { artisansRow } from './02-artisans-row';

const lineage: Lineage = {
  id: 'faubourg',
  name: 'Le Faubourg',
  kind: 'workers',
  role: 'Where the poor live, outside the walls along the road in: from huts by the rampart to the slab of the 1960s and what replaced it.',
  plotSize: [26, 16],
  stages: [
    { from: -300, builtUntil: -52, end: renewedBy(60), def: gaulishHuts },
    { from: 40, builtUntil: 250, end: invasions, def: artisansRow },
  ],
};

export default lineage;
