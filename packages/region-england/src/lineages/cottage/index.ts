import type { Lineage } from '@ah/kit';
import { renewedBy, romanEnd } from '../../ends';
import { smallRoundhouses } from './01-small-roundhouses';
import { romanWorkersRow } from './02-roman-workers-row';
import { saxonHuts } from './03-saxon-huts';
import { cobCottages } from './04-cob-cottages';
import { medievalCottageRow } from './05-medieval-cottage-row';
import { tudorAlmshouses } from './06-tudor-almshouses';
import { weaversCottages } from './07-weavers-cottages';
import { backToBacks } from './08-back-to-backs';
import { councilCottages } from './09-council-cottages';
import { towerBlock } from './10-tower-block';
import { apartmentBlock } from './11-apartment-block';

const lineage: Lineage = {
  id: 'cottage',
  name: 'The Row',
  role: 'Homes of labourers and the poor, from a huddle of roundhouses to a tower of flats.',
  plotSize: [26, 14],
  stages: [
    { from: -500, builtUntil: 80, end: renewedBy(180), def: smallRoundhouses },
    { from: 100, builtUntil: 300, end: romanEnd, def: romanWorkersRow },
    { from: 450, builtUntil: 1000, end: renewedBy(1150), def: saxonHuts },
    { from: 1100, builtUntil: 1350, end: renewedBy(1450), def: cobCottages },
    { from: 1350, builtUntil: 1500, def: medievalCottageRow },
    { from: 1600, builtUntil: 1700, def: tudorAlmshouses },
    { from: 1770, builtUntil: 1830, def: weaversCottages },
    { from: 1850, builtUntil: 1890, end: renewedBy(1970), def: backToBacks },
    { from: 1921, builtUntil: 1939, def: councilCottages },
    { from: 1966, builtUntil: 1972, def: towerBlock },
    { from: 2014, def: apartmentBlock },
  ],
};

export default lineage;
