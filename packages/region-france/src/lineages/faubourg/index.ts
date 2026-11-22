import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHuts } from './01-gaulish-huts';
import { artisansRow } from './02-artisans-row';
import { sunkenHuts } from './03-sunken-huts';
import { oneRoomHouses } from './04-one-room-houses';
import { weaversHouses } from './05-weavers-houses';

const lineage: Lineage = {
  id: 'faubourg',
  name: 'Le Faubourg',
  kind: 'workers',
  role: 'Where the poor live, outside the walls along the road in: from huts by the rampart to the slab of the 1960s and what replaced it.',
  plotSize: [26, 16],
  stages: [
    { from: -300, builtUntil: -52, end: renewedBy(60), def: gaulishHuts },
    { from: 40, builtUntil: 250, end: invasions, def: artisansRow },
    { from: 500, builtUntil: 1000, end: renewedBy(1180), def: sunkenHuts },
    { from: 1150, builtUntil: 1450, end: renewedBy(1560), def: oneRoomHouses },
    { from: 1480, builtUntil: 1640, def: weaversHouses },
  ],
};

export default lineage;
