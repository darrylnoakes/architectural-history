import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHall } from './01-gaulish-hall';
import { mansio } from './02-mansio';
import { hostelry } from './03-hostelry';
import { hostellerie } from './04-hostellerie';
import { hotelDieu } from './05-hotel-dieu';
import { relaisDePoste } from './06-relais-de-poste';
import { cafeRestaurant } from './07-cafe-restaurant';
import { brasserie } from './08-brasserie';
import { bistroToday } from './10-bistro-today';

const lineage: Lineage = {
  id: 'auberge',
  name: 'L’Auberge',
  kind: 'hospitality',
  role: 'Where travellers have been fed, watered and put up for the night, from a Gaulish chief’s feasting hall to a restored Art Nouveau brasserie.',
  plotSize: [22, 22],
  stages: [
    { from: -300, builtUntil: -30, end: renewedBy(50), def: gaulishHall },
    { from: 50, builtUntil: 250, end: invasions, def: mansio },
    { from: 800, builtUntil: 1150, end: renewedBy(1420), def: hostelry },
    { from: 1380, def: hostellerie },
    { from: 1445, builtUntil: 1500, def: hotelDieu },
    { from: 1690, def: relaisDePoste },
    { from: 1800, builtUntil: 1860, def: cafeRestaurant },
    { from: 1905, builtUntil: 1914, def: brasserie },
    { from: 2014, def: bistroToday },
  ],
};

export default lineage;
