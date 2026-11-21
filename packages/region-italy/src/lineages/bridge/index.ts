import type { Lineage, StageEnd } from '@ah/kit';
import { renewedBy } from '../../ends';
import { fordAndFerry } from './01-ford-and-ferry';
import { pileBridge } from './02-pile-bridge';
import { stoneArchBridge } from './03-stone-arch-bridge';
import { brokenBridge } from './04-broken-bridge';
import { fortifiedBridge } from './05-fortified-bridge';
import { shopBridge } from './06-shop-bridge';
import { renaissanceBridge } from './07-renaissance-bridge';
import { ironBridge } from './08-iron-bridge';
import { baileyBridge } from './09-bailey-bridge';
import { rebuiltBridge } from './10-rebuilt-bridge';
import { concreteBridge } from './11-concrete-bridge';
import { footbridge } from './12-footbridge';

/** The war: whatever bridge stood in the summer of 1944 was blown up. */
const blownUp1944: StageEnd = {
  year: 1944,
  fate: 'ruin',
  note:
    'In the summer of 1944 the retreating German army mined and blew up the bridges to slow the Allied advance; at Florence, on the night of 3 to 4 August, every bridge over the Arno went except the Ponte Vecchio.',
};

const lineage: Lineage = {
  id: 'bridge',
  name: 'The Bridge',
  kind: 'crossing',
  role: 'Where the main road crosses the river: the ford the town grew up beside and every bridge that has carried the road since, from timber piles to steel and glass.',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [
    { from: -750, def: fordAndFerry },
    // timber bridges were renewed again and again; by the early Empire a town of any size crossed in stone
    { from: -520, builtUntil: -200, end: renewedBy(50), def: pileBridge },
    // Roman stone bridges were built into the 3rd century and, left alone, could stand for ever
    { from: -140, builtUntil: 250, def: stoneArchBridge },
    // cut in the Gothic War; the timber patch was kept up until the arch was rebuilt in stone
    { from: 550, builtUntil: 560, end: renewedBy(1200), def: brokenBridge },
    {
      from: 1100,
      builtUntil: 1250,
      end: {
        year: 1333,
        fate: 'ruin',
        note:
          'On 4 November 1333 the river rose in the worst flood anyone remembered; at Florence it swept away the Ponte Vecchio and two more of the bridges over the Arno, and the town was left with broken piers until the commune could rebuild.',
      },
      def: fortifiedBridge,
    },
    { from: 1345, builtUntil: 1400, def: shopBridge },
    { from: 1569, builtUntil: 1750, end: blownUp1944, def: renaissanceBridge },
    { from: 1880, builtUntil: 1914, end: blownUp1944, def: ironBridge },
    { from: 1944, builtUntil: 1946, end: renewedBy(1958), def: baileyBridge },
    { from: 1958, builtUntil: 1965, def: rebuiltBridge },
    { from: 1972, builtUntil: 1990, def: concreteBridge },
    { from: 2008, def: footbridge },
  ],
};

export default lineage;
