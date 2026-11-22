import type { Lineage } from '@ah/kit';
import { embarcadere } from './01-embarcadere';
import { grandeGare } from './02-grande-gare';
import { reconstructionStation } from './03-reconstruction-station';
import { gareTgv } from './04-gare-tgv';

const lineage: Lineage = {
  id: 'gare',
  name: 'La Gare',
  kind: 'transport',
  role: 'Where the railway reaches the town: from a stone pavilion and a timber shed to a glass canopy for the TGV.',
  plotSize: [40, 24],
  stages: [
    { from: 1849, builtUntil: 1870, def: embarcadere },
    { from: 1893, builtUntil: 1914, def: grandeGare },
    { from: 1928, builtUntil: 1939, def: reconstructionStation },
    { from: 2007, def: gareTgv },
  ],
};

export default lineage;
