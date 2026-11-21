import type { Lineage } from '@ah/kit';
import { ironAgeSmithy } from './01-iron-age-smithy';
import { romanGranaryAndKiln } from './02-roman-granary-and-kiln';
import { saxonWatermill } from './03-saxon-watermill';
import { normanWatermill } from './04-norman-watermill';
import { titheBarn } from './05-tithe-barn';
import { fullingMill } from './06-fulling-mill';
import { arkwrightMill } from './07-arkwright-mill';
import { victorianMill } from './08-victorian-mill';
import { artDecoFactory } from './09-art-deco-factory';
import { sixtiesFactory } from './10-sixties-factory';
import { timberWorkspace } from './11-timber-workspace';

const lineage: Lineage = {
  id: 'work',
  name: 'The Works',
  role: 'The riverside plot where the town makes things: from a smith’s hearth and a waterwheel to the steam mill, the factory and the maker space.',
  plotSize: [36, 22],
  stages: [
    { from: -500, def: ironAgeSmithy },
    { from: 100, def: romanGranaryAndKiln },
    { from: 800, def: saxonWatermill },
    { from: 1090, def: normanWatermill },
    { from: 1320, def: titheBarn },
    { from: 1590, def: fullingMill },
    { from: 1785, def: arkwrightMill },
    { from: 1870, def: victorianMill },
    { from: 1933, def: artDecoFactory },
    { from: 1965, def: sixtiesFactory },
    { from: 2016, def: timberWorkspace },
  ],
};

export default lineage;
