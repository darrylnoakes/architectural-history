import type { Lineage } from '@ah/kit';
import { civicFountain } from './01-civic-fountain';
import { baroqueFountain } from './02-baroque-fountain';

const lineage: Lineage = {
  id: 'fountain',
  name: 'The Fountain',
  kind: 'culture',
  role: 'The public fountain in the middle of the square, where water from the aqueduct became the town’s pride and its ornament.',
  plotSize: [12, 12],
  stages: [
    { from: 1278, builtUntil: 1420, def: civicFountain },
    // modelled on Bernini's Triton (1642 to 1643), so the stage starts then rather than in 1630
    { from: 1643, def: baroqueFountain },
  ],
};

export default lineage;
