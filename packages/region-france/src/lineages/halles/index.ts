import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishMarket } from './01-gaulish-market';
import { macellum } from './02-macellum';
import { fair } from './03-fair';
import { timberHalle } from './04-timber-halle';
import { grainHall } from './05-grain-hall';
import { passage } from './06-passage';
import { ironHalles } from './07-iron-halles';
import { grandMagasin } from './08-grand-magasin';

const lineage: Lineage = {
  id: 'halles',
  name: 'Les Halles',
  kind: 'market',
  role: 'Where the town buys and sells, from pens by the gate to the great timber halle, the iron market and the thin concrete vault.',
  plotSize: [26, 22],
  stages: [
    { from: -300, end: renewedBy(100), def: gaulishMarket },
    { from: 50, builtUntil: 200, end: invasions, def: macellum },
    { from: 640, end: renewedBy(1330), def: fair },
    { from: 1290, def: timberHalle },
    { from: 1785, def: grainHall },
    { from: 1838, def: passage },
    { from: 1866, def: ironHalles },
    { from: 1887, def: grandMagasin },
  ],
};

export default lineage;
