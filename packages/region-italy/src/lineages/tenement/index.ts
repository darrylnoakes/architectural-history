import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { hutCluster } from './01-hut-cluster';
import { tabernaeRow } from './02-tabernae-row';
import { insula } from './03-insula';
import { porticoShacks } from './04-portico-shacks';
import { caseTerrinee } from './05-case-terrinee';
import { workersRow } from './06-workers-row';
import { raisedRow } from './07-raised-row';

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
  ],
};

export default lineage;
