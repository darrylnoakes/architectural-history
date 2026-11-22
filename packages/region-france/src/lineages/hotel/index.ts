import type { Lineage } from '@ah/kit';
import { renewedBy } from '../../ends';
import { aristocratsFarm } from './01-aristocrats-farm';

const lineage: Lineage = {
  id: 'hotel',
  name: 'L’Hôtel',
  kind: 'elite',
  role: 'The home of the richest household in town, from a Gaulish noble’s enclosure to a glass house: where each new fashion in living arrives first.',
  plotSize: [24, 26],
  stages: [{ from: -300, builtUntil: -30, end: renewedBy(80), def: aristocratsFarm }],
};

export default lineage;
