import type { Lineage } from '@ah/kit';
import { renewedBy, romanEnd } from '../../ends';
import { roundhouse } from './01-roundhouse';
import { romanStripHouse } from './02-roman-strip-house';
import { saxonGrubenhaus } from './03-saxon-grubenhaus';
import { lateSaxonHouse } from './04-late-saxon-house';
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
    { from: -500, builtUntil: 60, end: renewedBy(150), def: roundhouse },
    { from: 80, builtUntil: 300, end: romanEnd, def: romanStripHouse },
    { from: 450, builtUntil: 750, end: renewedBy(960), def: saxonGrubenhaus },
    { from: 880, builtUntil: 1150, end: renewedBy(1300), def: lateSaxonHouse },
    { from: 1250, builtUntil: 1420, end: renewedBy(1500), def: cruckHouse },
    { from: 1420, builtUntil: 1530, def: wealdenHallHouse },
    { from: 1560, builtUntil: 1640, def: tudorJettiedHouse },
    { from: 1720, builtUntil: 1830, def: georgianTownhouse },
    { from: 1860, builtUntil: 1905, def: victorianTerrace },
    { from: 1934, builtUntil: 1939, def: interwarSemi },
    { from: 1962, builtUntil: 1975, def: sixtiesHouse },
    { from: 2012, def: ecoHouse },
  ],
};

export default lineage;
