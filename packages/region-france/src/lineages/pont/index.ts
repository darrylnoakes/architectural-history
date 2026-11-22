import type { Lineage } from '@ah/kit';
import { renewedBy } from '../../ends';
import { ford } from './01-ford';
import { gaulishBridge } from './02-gaulish-bridge';
import { romanBridge } from './03-roman-bridge';
import { inhabitedBridge } from './04-inhabited-bridge';
import { fortifiedBridge } from './05-fortified-bridge';
import { pontNeuf } from './06-pont-neuf';
import { perronetBridge } from './07-perronet-bridge';
import { suspensionBridge } from './08-suspension-bridge';
import { prestressedBridge } from './09-prestressed-bridge';
import { footbridge } from './10-footbridge';

// The bridges blown up in 1914, 1918 and 1940 are handled by the town plan, so no stage here
// carries an end for the wars.
const lineage: Lineage = {
  id: 'pont',
  name: 'Le Pont',
  kind: 'crossing',
  role: 'Where the main road crosses the river: the ford the town grew up beside and every bridge since, from oak piles to prestressed concrete.',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [
    { from: -300, def: ford },
    // timber in water was patched and renewed for generations; by about 200 any town of size crossed in stone
    { from: -90, builtUntil: 60, end: renewedBy(200), def: gaulishBridge },
    // stone-arched bridges in the north date from the second century rather than the first;
    // they were built until the crisis of the third century and could then stand for a thousand years
    { from: 120, builtUntil: 250, def: romanBridge },
    { from: 1185, builtUntil: 1300, def: inhabitedBridge },
    { from: 1320, builtUntil: 1400, def: fortifiedBridge },
    // the Pont Neuf opened in 1607; provincial bridges on its model followed from about 1620 to 1720
    { from: 1630, builtUntil: 1720, def: pontNeuf },
    { from: 1775, def: perronetBridge },
    // wire suspension bridges were built until the Angers disaster of 1850
    { from: 1830, builtUntil: 1850, def: suspensionBridge },
    { from: 1947, builtUntil: 1975, def: prestressedBridge },
    { from: 2006, def: footbridge },
  ],
};

export default lineage;
