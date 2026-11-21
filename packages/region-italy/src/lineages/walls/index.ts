import type { Lineage } from '@ah/kit';
import { rampart } from './01-rampart';
import { etruscanGate } from './02-etruscan-gate';
import { romanGate } from './03-roman-gate';
import { aurelianGate } from './04-aurelian-gate';
import { communalGate } from './05-communal-gate';
import { bastionGate } from './06-bastion-gate';

const lineage: Lineage = {
  id: 'walls',
  name: 'Walls and Gates',
  kind: 'defence',
  role: 'The town gate and the wall either side of it.',
  plotSize: [30, 16],
  stages: [{ from: -750, def: rampart }, { from: -400, def: etruscanGate }, { from: -30, def: romanGate }, { from: 275, def: aurelianGate }, { from: 1150, def: communalGate }, { from: 1540, def: bastionGate }],
};

export default lineage;
