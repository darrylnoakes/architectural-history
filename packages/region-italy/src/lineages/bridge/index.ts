import type { Lineage } from '@ah/kit';
import { fordAndFerry } from './01-ford-and-ferry';
import { pileBridge } from './02-pile-bridge';
import { stoneArchBridge } from './03-stone-arch-bridge';
import { brokenBridge } from './04-broken-bridge';
import { fortifiedBridge } from './05-fortified-bridge';
import { shopBridge } from './06-shop-bridge';
import { renaissanceBridge } from './07-renaissance-bridge';
import { ironBridge } from './08-iron-bridge';
import { rebuiltBridge } from './10-rebuilt-bridge';

const lineage: Lineage = {
  id: 'bridge',
  name: 'The Bridge',
  kind: 'crossing',
  role: 'Where the main road crosses the river: the ford the town grew up beside and every bridge that has carried the road since.',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [
    { from: -750, def: fordAndFerry },
    { from: -520, def: pileBridge },
    { from: -140, def: stoneArchBridge },
    { from: 550, def: brokenBridge },
    { from: 1100, def: fortifiedBridge },
    { from: 1345, def: shopBridge },
    { from: 1569, def: renaissanceBridge },
    { from: 1880, def: ironBridge },
    { from: 1958, def: rebuiltBridge },
  ],
};

export default lineage;
