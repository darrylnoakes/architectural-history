import type { Lineage } from '@ah/kit';
import { renewedBy, romanEnd } from '../../ends';
import { greatRoundhouse } from './01-great-roundhouse';
import { romanTownhouse } from './02-roman-townhouse';
import { saxonThegnsHall } from './03-saxon-thegns-hall';
import { normanStoneHouse } from './04-norman-stone-house';
import { merchantsHall } from './05-merchants-hall';
import { tudorMerchantsHouse } from './06-tudor-merchants-house';
import { jacobeanBrickHouse } from './07-jacobean-brick-house';
import { queenAnneHouse } from './08-queen-anne-house';
import { regencyVilla } from './09-regency-villa';
import { victorianVilla } from './10-victorian-villa';
import { artsAndCraftsHouse } from './11-arts-and-crafts-house';
import { modernistVilla } from './12-modernist-villa';
import { glassHouse } from './13-glass-house';

const lineage: Lineage = {
  id: 'merchant',
  name: 'The Big House',
  role: 'The home of the richest household in town, where each new fashion in building arrives first.',
  plotSize: [20, 24],
  stages: [
    { from: -500, builtUntil: 80, end: renewedBy(160), def: greatRoundhouse },
    { from: 120, builtUntil: 330, end: romanEnd, def: romanTownhouse },
    { from: 650, builtUntil: 1050, end: renewedBy(1170), def: saxonThegnsHall },
    { from: 1150, builtUntil: 1250, def: normanStoneHouse },
    { from: 1330, builtUntil: 1480, def: merchantsHall },
    { from: 1500, builtUntil: 1600, def: tudorMerchantsHouse },
    { from: 1630, builtUntil: 1680, def: jacobeanBrickHouse },
    { from: 1700, builtUntil: 1740, def: queenAnneHouse },
    { from: 1790, builtUntil: 1840, def: regencyVilla },
    { from: 1865, builtUntil: 1895, def: victorianVilla },
    { from: 1905, builtUntil: 1914, def: artsAndCraftsHouse },
    { from: 1936, builtUntil: 1939, def: modernistVilla },
    { from: 1998, def: glassHouse },
  ],
};

export default lineage;
