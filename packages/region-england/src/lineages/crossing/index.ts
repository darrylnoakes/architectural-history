import type { Lineage } from '@ah/kit';
import { ford } from './01-ford';
import { romanTimberBridge } from './02-roman-timber-bridge';
import { ruinedPiers } from './03-ruined-piers';
import { saxonPlankBridge } from './04-saxon-plank-bridge';
import { medievalStoneBridge } from './05-medieval-stone-bridge';
import { ironBridge } from './06-iron-bridge';
import { victorianTrussBridge } from './07-victorian-truss-bridge';
import { concreteArchBridge } from './08-concrete-arch-bridge';
import { millenniumFootbridge } from './09-millennium-footbridge';

const lineage: Lineage = {
  id: 'crossing',
  name: 'The River Crossing',
  role: 'Where the High Street meets the river: the ford that founded the town and every bridge that has carried the road since.',
  plotSize: [14, 30],
  river: [-8, 8],
  stages: [
    { from: -500, def: ford },
    { from: 120, def: romanTimberBridge },
    { from: 420, def: ruinedPiers },
    { from: 950, def: saxonPlankBridge },
    { from: 1210, def: medievalStoneBridge },
    { from: 1800, def: ironBridge },
    { from: 1885, def: victorianTrussBridge },
    { from: 1936, def: concreteArchBridge },
    { from: 2001, def: millenniumFootbridge },
  ],
};

export default lineage;
