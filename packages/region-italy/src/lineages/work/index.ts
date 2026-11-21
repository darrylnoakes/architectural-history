import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { pottersYard } from './01-potters-yard';
import { fulleryAndKilns } from './02-fullery-and-kilns';
import { bakery } from './03-bakery';
import { horrea } from './04-horrea';
import { floatingMills } from './05-floating-mills';
import { fullingMill } from './06-fulling-mill';
import { woolWorks } from './07-wool-works';
import { silkMill } from './08-silk-mill';
import { filanda } from './09-filanda';

const lineage: Lineage = {
  id: 'work',
  name: 'The Workshop and the Factory',
  kind: 'work',
  role: 'The riverside plot where the town makes things.',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    { from: -750, builtUntil: -300, end: renewedBy(-200), def: pottersYard },
    { from: -250, def: fulleryAndKilns },
    { from: 60, def: bakery },
    { from: 150, builtUntil: 300, end: gothicWar, def: horrea },
    { from: 540, def: floatingMills },
    { from: 1150, def: fullingMill },
    { from: 1350, builtUntil: 1500, def: woolWorks },
    { from: 1550, builtUntil: 1750, def: silkMill },
    { from: 1840, builtUntil: 1900, def: filanda },
  ],
};

export default lineage;
