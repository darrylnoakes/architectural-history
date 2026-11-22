import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHuts } from './01-gaulish-huts';
import { artisansRow } from './02-artisans-row';
import { sunkenHuts } from './03-sunken-huts';
import { oneRoomHouses } from './04-one-room-houses';
import { weaversHouses } from './05-weavers-houses';
import { couree } from './06-couree';
import { familistere } from './07-familistere';
import { citeJardin } from './08-cite-jardin';
import { grandEnsemble } from './09-grand-ensemble';
import { renewalHousing } from './10-renewal-housing';

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
    { from: 1850, builtUntil: 1900, def: couree },
    { from: 1872, builtUntil: 1900, def: familistere },
    { from: 1922, builtUntil: 1935, def: citeJardin },
    { from: 1962, builtUntil: 1975, def: grandEnsemble },
    { from: 2012, def: renewalHousing },
  ],
};

export default lineage;
