import type { Lineage } from '@ah/kit';
import { feastingHouse } from './01-feasting-house';
import { romanMansio } from './02-roman-mansio';

const lineage: Lineage = {
  id: 'inn',
  name: 'The Inn',
  role: 'Hospitality on the square: from the chief’s feasting hall to the craft-beer gastropub, where travellers and townsfolk have eaten, drunk and slept for 2,500 years.',
  plotSize: [22, 22],
  stages: [
    { from: -500, def: feastingHouse },
    { from: 70, def: romanMansio },
  ],
};

export default lineage;
