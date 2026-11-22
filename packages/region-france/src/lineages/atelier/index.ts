import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishForge } from './01-gaulish-forge';
import { pottersQuarter } from './02-potters-quarter';

const lineage: Lineage = {
  id: 'atelier',
  name: 'L’Atelier',
  kind: 'work',
  role: 'The riverside plot where the town makes things: a Gaulish smithy, Roman kilns, monks’ mills and forges, the cloth trade, the royal manufactory, steam, iron, concrete and reuse.',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    { from: -300, end: renewedBy(120), def: gaulishForge },
    { from: 60, builtUntil: 250, end: invasions, def: pottersQuarter },
  ],
};

export default lineage;
