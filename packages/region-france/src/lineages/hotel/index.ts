import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { aristocratsFarm } from './01-aristocrats-farm';
import { domus } from './02-domus';
import { frankishHall } from './03-frankish-hall';

const lineage: Lineage = {
  id: 'hotel',
  name: 'L’Hôtel',
  kind: 'elite',
  role: 'The home of the richest household in town, from a Gaulish noble’s enclosure to a glass house: where each new fashion in living arrives first.',
  plotSize: [24, 26],
  stages: [
    { from: -300, builtUntil: -30, end: renewedBy(80), def: aristocratsFarm },
    { from: 60, builtUntil: 250, end: invasions, def: domus },
    // a timber hall, rebuilt every generation or two, until the first stone houses
    { from: 600, builtUntil: 1050, end: renewedBy(1180), def: frankishHall },
  ],
};

export default lineage;
