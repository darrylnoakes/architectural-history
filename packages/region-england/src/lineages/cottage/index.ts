import type { Lineage } from '@ah/kit';
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
    { from: -500, def: smallRoundhouses },
    { from: 100, def: romanWorkersRow },
    { from: 450, def: saxonHuts },
    { from: 1100, def: cobCottages },
    { from: 1350, def: medievalCottageRow },
    { from: 1600, def: tudorAlmshouses },
    { from: 1770, def: weaversCottages },
    { from: 1850, def: backToBacks },
    { from: 1921, def: councilCottages },
    { from: 1966, def: towerBlock },
    { from: 2014, def: apartmentBlock },
  ],
};

export default lineage;
