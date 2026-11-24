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
import { concreteMarket1929 } from './09-concrete-market';
import { hypermarket } from './10-hypermarket';
import { marketToday } from './11-market-today';

const lineage: Lineage = {
  id: 'halles',
  name: 'Les Halles',
  kind: 'market',
  role: 'Where the town buys and sells: from pens by the gate and a yearly fair to the great timber halle, iron, glass, a thin concrete vault and the hypermarket.',
  plotSize: [26, 22],
  stages: [
    // open ground and pens: rebuilt as the Roman town took shape
    { from: -300, end: renewedBy(100), def: gaulishMarket },
    // macella were built in the first and second centuries; none outlived the invasions of 275
    { from: 50, builtUntil: 200, end: invasions, def: macellum },
    // the fair's booths and tents went up every year until a permanent hall replaced them
    { from: 640, end: renewedBy(1330), def: fair },
    { from: 1290, def: timberHalle },
    // the Paris hall was finished in 1767; the provinces followed later (Alençon, 1806 to 1812)
    { from: 1785, builtUntil: 1830, def: grainHall },
    // the Paris passages date from the 1790s to the 1840s; provincial cities built theirs in the 1830s and 1840s
    { from: 1838, builtUntil: 1860, def: passage },
    { from: 1866, def: ironHalles },
    // Paris had its great stores by the 1870s; a provincial town of the north got one in the 1890s
    { from: 1895, def: grandMagasin },
    { from: 1929, def: concreteMarket1929 },
    { from: 1969, def: hypermarket },
    { from: 2012, def: marketToday },
  ],
};

export default lineage;
