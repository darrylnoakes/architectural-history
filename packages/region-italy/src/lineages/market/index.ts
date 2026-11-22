import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { cattleMarket } from './01-cattle-market';
import { forumShops } from './02-forum-shops';
import { macellum } from './03-macellum';
import { stallsInTheRuins } from './04-stalls-in-the-ruins';
import { grainLoggia } from './05-grain-loggia';
import { renaissanceLoggia } from './06-renaissance-loggia';
import { galleria } from './07-galleria';

const lineage: Lineage = {
  id: 'market',
  kind: 'market',
  name: 'The Market',
  role: 'Where the town buys and sells, from cattle pens by the ford to a restored iron market hall.',
  plotSize: [26, 22],
  stages: [
    { from: -750, end: renewedBy(-150), def: cattleMarket },
    { from: -200, end: gothicWar, def: forumShops },
    { from: 60, end: gothicWar, def: macellum },
    { from: 950, end: renewedBy(1350), def: stallsInTheRuins },
    { from: 1290, def: grainLoggia },
    { from: 1550, def: renaissanceLoggia },
    { from: 1877, builtUntil: 1922, def: galleria },
  ],
};

export default lineage;
