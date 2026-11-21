import type { Lineage } from '@ah/kit';
import { greatRoundhouse } from './01-great-roundhouse';
import { romanTownhouse } from './02-roman-townhouse';
import { saxonThegnsHall } from './03-saxon-thegns-hall';
import { normanStoneHouse } from './04-norman-stone-house';
import { merchantsHall } from './05-merchants-hall';
import { tudorMerchantsHouse } from './06-tudor-merchants-house';
import { jacobeanBrickHouse } from './07-jacobean-brick-house';

const lineage: Lineage = {
  id: 'merchant',
  name: 'The Big House',
  role: 'The home of the richest household in town, where each new fashion in building arrives first.',
  plotSize: [20, 24],
  stages: [
    { from: -500, def: greatRoundhouse },
    { from: 120, def: romanTownhouse },
    { from: 450, def: saxonThegnsHall },
    { from: 1150, def: normanStoneHouse },
    { from: 1330, def: merchantsHall },
    { from: 1500, def: tudorMerchantsHouse },
    { from: 1630, def: jacobeanBrickHouse },
  ],
};

export default lineage;
