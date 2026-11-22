import type { Lineage } from '@ah/kit';
import { merovingianMonastery } from './01-merovingian-monastery';
import { carolingianAbbey } from './02-carolingian-abbey';
import { romanesqueAbbey } from './03-romanesque-abbey';
import { gothicChoir } from './04-gothic-choir';
import { mauristAbbey } from './05-maurist-abbey';
import { abbeyQuarried } from './06-abbey-quarried';
import { abbeyMuseum } from './07-abbey-museum';

const lineage: Lineage = {
  id: 'abbaye',
  name: 'L’Abbaye',
  kind: 'monastery',
  role: 'The great abbey outside the walls: a saint’s grave becomes a planned monastery, gives birth to Gothic, and is sold for stone in the Revolution.',
  plotSize: [40, 44],
  stages: [
    { from: 560, def: merovingianMonastery },
    { from: 830, def: carolingianAbbey },
    { from: 1090, def: romanesqueAbbey },
    { from: 1144, builtUntil: 1230, def: gothicChoir },
    { from: 1700, builtUntil: 1780, def: mauristAbbey },
    { from: 1800, builtUntil: 1830, def: abbeyQuarried },
    { from: 1995, def: abbeyMuseum },
  ],
};

export default lineage;
