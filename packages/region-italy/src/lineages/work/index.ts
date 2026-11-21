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
import { hydroPlant } from './10-hydro-plant';
import { carFactory } from './11-car-factory';
import { glassFactory } from './12-glass-factory';
import { innovationHub } from './13-innovation-hub';

const lineage: Lineage = {
  id: 'work',
  name: 'The Workshop and the Factory',
  kind: 'work',
  role: 'The riverside plot where the town makes things, from a potter’s kiln and donkey mills to waterwheels, silk machines, turbines and the glass-walled factory.',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    { from: -750, builtUntil: -300, end: renewedBy(-200), def: pottersYard },
    { from: -250, def: fulleryAndKilns },
    { from: 60, def: bakery },
    { from: 150, builtUntil: 300, end: gothicWar, def: horrea },
    { from: 540, builtUntil: 800, def: floatingMills },
    { from: 1150, def: fullingMill },
    { from: 1350, builtUntil: 1500, def: woolWorks },
    { from: 1550, builtUntil: 1750, def: silkMill },
    { from: 1840, builtUntil: 1900, def: filanda },
    { from: 1905, def: hydroPlant },
    { from: 1926, builtUntil: 1940, def: carFactory },
    { from: 1957, builtUntil: 1975, def: glassFactory },
    { from: 2014, def: innovationHub },
  ],
};

export default lineage;
