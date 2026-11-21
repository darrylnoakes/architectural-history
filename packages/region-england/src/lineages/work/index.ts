import type { Lineage } from '@ah/kit';
import { ironAgeSmithy } from './01-iron-age-smithy';
import { romanGranaryAndKiln } from './02-roman-granary-and-kiln';
import { saxonWatermill } from './03-saxon-watermill';
import { normanWatermill } from './04-norman-watermill';
import { titheBarn } from './05-tithe-barn';

const lineage: Lineage = {
  id: 'work',
  name: 'The Works',
  role: 'The riverside plot where the town makes things, from a smith’s hearth to a water-powered mill, a steam mill and a factory.',
  plotSize: [36, 22],
  stages: [
    { from: -500, def: ironAgeSmithy },
    { from: 100, def: romanGranaryAndKiln },
    { from: 800, def: saxonWatermill },
    { from: 1090, def: normanWatermill },
    { from: 1320, def: titheBarn },
  ],
};

export default lineage;
