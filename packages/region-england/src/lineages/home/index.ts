import type { Lineage } from '@ah/kit';
import { roundhouse } from './01-roundhouse';
import { romanStripHouse } from './02-roman-strip-house';
import { saxonGrubenhaus } from './03-saxon-grubenhaus';
import { longhouse } from './04-longhouse';
import { cruckHouse } from './05-cruck-house';
import { wealdenHallHouse } from './06-wealden-hall-house';
import { tudorJettiedHouse } from './07-tudor-jettied-house';
import { georgianTownhouse } from './08-georgian-townhouse';
import { victorianTerrace } from './09-victorian-terrace';
import { interwarSemi } from './10-interwar-semi';
import { sixtiesHouse } from './11-sixties-house';
import { ecoHouse } from './12-eco-house';

const lineage: Lineage = {
  id: 'home',
  name: 'The Family Home',
  role: 'One ordinary family plot, rebuilt as farmers, craftsmen, shopkeepers and clerks lived on it for two and a half thousand years.',
  plotSize: [14, 18],
  stages: [
    { from: -500, def: roundhouse },
    { from: 80, def: romanStripHouse },
    { from: 430, def: saxonGrubenhaus },
    { from: 1080, def: longhouse },
    { from: 1250, def: cruckHouse },
    { from: 1420, def: wealdenHallHouse },
    { from: 1560, def: tudorJettiedHouse },
    { from: 1720, def: georgianTownhouse },
    { from: 1860, def: victorianTerrace },
    { from: 1934, def: interwarSemi },
    { from: 1962, def: sixtiesHouse },
    { from: 2012, def: ecoHouse },
  ],
};

export default lineage;
