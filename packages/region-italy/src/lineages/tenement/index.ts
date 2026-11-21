import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { hutCluster } from './01-hut-cluster';
import { tabernaeRow } from './02-tabernae-row';
import { insula } from './03-insula';
import { porticoShacks } from './04-portico-shacks';
import { caseTerrinee } from './05-case-terrinee';
import { workersRow } from './06-workers-row';
import { raisedRow } from './07-raised-row';
import { casaDiRinghiera } from './08-casa-di-ringhiera';
import { casePopolari } from './09-case-popolari';
import { inaCasa } from './10-ina-casa';
import { megastructure } from './11-megastructure';

const lineage: Lineage = {
  id: 'tenement',
  name: 'The Tenement',
  kind: 'workers',
  role: 'Where the poor live, always more of them to the plot than anyone else: from huts on the hill to a slab of social housing.',
  plotSize: [26, 16],
  stages: [
    { from: -750, builtUntil: -400, end: renewedBy(-250), def: hutCluster },
    { from: -300, builtUntil: 50, end: gothicWar, def: tabernaeRow },
    { from: 60, builtUntil: 250, end: gothicWar, def: insula },
    { from: 450, builtUntil: 800, end: renewedBy(900), def: porticoShacks },
    { from: 850, builtUntil: 1150, end: renewedBy(1300), def: caseTerrinee },
    { from: 1250, builtUntil: 1345, def: workersRow },
    { from: 1580, builtUntil: 1750, def: raisedRow },
    { from: 1880, builtUntil: 1914, def: casaDiRinghiera },
    { from: 1926, builtUntil: 1940, def: casePopolari },
    { from: 1954, builtUntil: 1963, def: inaCasa },
    { from: 1978, builtUntil: 1985, def: megastructure },
  ],
};

export default lineage;
