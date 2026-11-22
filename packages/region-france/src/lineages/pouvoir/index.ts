import type { Lineage } from '@ah/kit';
import { belfryDef } from './05-belfry';
import { flamboyantTownHall } from './06-flamboyant-town-hall';

const lineage: Lineage = {
  id: 'pouvoir',
  name: 'L’Hôtel de Ville',
  kind: 'power',
  role: 'Who rules the town, and from where.',
  plotSize: [44, 44],
  stages: [
    { from: 1260, def: belfryDef },
    { from: 1510, def: flamboyantTownHall },
  ],
};

export default lineage;
