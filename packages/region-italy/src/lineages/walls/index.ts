import type { Lineage } from '@ah/kit';
import { rampart } from './01-rampart';
import { etruscanGate } from './02-etruscan-gate';
import { romanGate } from './03-roman-gate';
import { aurelianGate } from './04-aurelian-gate';
import { communalGate } from './05-communal-gate';
import { bastionGate } from './06-bastion-gate';
import { gateAsMonument } from './07-gate-as-monument';

const lineage: Lineage = {
  id: 'walls',
  name: 'Walls and Gates',
  kind: 'defence',
  role: 'The main gate and the wall either side of it: how the town defended itself, and showed itself off, from earth bank to bastion, until the walls came down.',
  plotSize: [30, 16],
  stages: [
    { from: -750, builtUntil: -500, def: rampart },
    { from: -400, builtUntil: -150, def: etruscanGate },
    // the show gate with twin carriage arches, gallery and many-sided towers is Augustan
    // (Aosta 25 BC, Turin, Spello); -80 in the brief was too early for the type
    { from: -30, builtUntil: 60, def: romanGate },
    { from: 275, builtUntil: 550, def: aurelianGate },
    { from: 1150, builtUntil: 1450, def: communalGate },
    { from: 1540, builtUntil: 1750, def: bastionGate },
    { from: 1870, def: gateAsMonument },
  ],
};

export default lineage;
