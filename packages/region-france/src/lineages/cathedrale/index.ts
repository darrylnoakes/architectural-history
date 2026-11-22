import type { Lineage } from '@ah/kit';
import { invasions } from '../../ends';
import { gaulishSanctuary } from './01-gaulish-sanctuary';
import { fanum } from './02-fanum';
import { cathedralGroup } from './03-cathedral-group';
import { carolingianCathedral } from './04-carolingian-cathedral';
import { romanesqueCathedral } from './05-romanesque-cathedral';
import { earlyGothicCathedral } from './06-early-gothic-cathedral';
import { highGothicCathedral } from './07-high-gothic-cathedral';
import { flamboyantCathedral } from './08-flamboyant-cathedral';
import { templeOfReason } from './09-temple-of-reason';
import { restoredCathedral } from './10-restored-cathedral';
import { shelledCathedral } from './11-shelled-cathedral';
import { rebuiltCathedral } from './12-rebuilt-cathedral';

const lineage: Lineage = {
  id: 'cathedrale',
  name: 'La Cathédrale',
  kind: 'worship',
  role: 'The holy ground of the city: a tribal sanctuary, a Gallo-Roman temple, then one cathedral rebuilt, enlarged, stripped, restored, burned and rebuilt for sixteen centuries.',
  plotSize: [34, 66],
  stages: [
    { from: -300, def: gaulishSanctuary },
    // the fanum went with the open town in the raids of 275
    { from: 40, builtUntil: 200, end: invasions, def: fanum },
    { from: 380, builtUntil: 600, def: cathedralGroup },
    { from: 830, builtUntil: 1000, def: carolingianCathedral },
    { from: 1050, builtUntil: 1140, def: romanesqueCathedral },
    { from: 1165, builtUntil: 1200, def: earlyGothicCathedral },
    { from: 1245, builtUntil: 1300, def: highGothicCathedral },
    { from: 1500, builtUntil: 1550, def: flamboyantCathedral },
    // events rather than fashions: no plot takes them up late
    { from: 1793, builtUntil: 1799, def: templeOfReason },
    { from: 1850, builtUntil: 1880, def: restoredCathedral },
    { from: 1914, builtUntil: 1918, def: shelledCathedral },
    { from: 1938, def: rebuiltCathedral },
  ],
};

export default lineage;
