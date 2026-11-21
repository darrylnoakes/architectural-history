import type { Lineage } from '@ah/kit';
import { romanEnd } from '../../ends';
import { feastingHouse } from './01-feasting-house';
import { romanMansio } from './02-roman-mansio';
import { saxonAlehouse } from './03-saxon-alehouse';
import { normanAlehouse } from './04-norman-alehouse';
import { galleriedInn } from './05-galleried-inn';
import { georgianCoachingInn } from './06-georgian-coaching-inn';
import { victorianPub } from './07-victorian-pub';
import { roadhousePub } from './08-roadhouse-pub';
import { estatePub } from './09-estate-pub';
import { gastropub } from './10-gastropub';

const lineage: Lineage = {
  id: 'inn',
  kind: 'hospitality',
  name: 'The Inn',
  role: 'Hospitality on the square: the plot where travellers and townsfolk have eaten, drunk and slept, from a chief’s feasting house to a craft-brewing gastropub.',
  plotSize: [22, 22],
  stages: [
    { from: -500, def: feastingHouse },
    { from: 70, end: romanEnd, def: romanMansio },
    { from: 700, def: saxonAlehouse },
    { from: 1100, def: normanAlehouse },
    { from: 1400, def: galleriedInn },
    { from: 1735, def: georgianCoachingInn },
    { from: 1890, def: victorianPub },
    { from: 1934, def: roadhousePub },
    { from: 1968, def: estatePub },
    { from: 2012, def: gastropub },
  ],
};

export default lineage;
