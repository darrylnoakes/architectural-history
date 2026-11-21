import type { Lineage } from '@ah/kit';
import { romanEnd } from '../../ends';
import { tradingGround } from './01-trading-ground';
import { romanMacellum } from './02-roman-macellum';
import { saxonMarket } from './03-saxon-market';
import { normanMarketCross } from './04-norman-market-cross';
import { gothicButtercross } from './05-gothic-buttercross';
import { tudorMarketHall } from './06-tudor-market-hall';
import { georgianMarketHouse } from './07-georgian-market-house';
import { victorianMarketHall } from './08-victorian-market-hall';
import { artDecoStore } from './09-art-deco-store';
import { shoppingPrecinct } from './10-shopping-precinct';
import { marketPavilion } from './11-market-pavilion';

const lineage: Lineage = {
  id: 'market',
  kind: 'market',
  name: 'The Market',
  role: 'The island in the middle of the square where the town buys and sells, from a trodden trading ground to a covered market hall.',
  plotSize: [22, 18],
  stages: [
    { from: -500, def: tradingGround },
    { from: 90, end: romanEnd, def: romanMacellum },
    { from: 750, def: saxonMarket },
    { from: 1200, def: normanMarketCross },
    { from: 1480, def: gothicButtercross },
    { from: 1590, def: tudorMarketHall },
    { from: 1750, def: georgianMarketHouse },
    { from: 1865, def: victorianMarketHall },
    { from: 1932, def: artDecoStore },
    { from: 1964, def: shoppingPrecinct },
    { from: 2005, def: marketPavilion },
  ],
};

export default lineage;
