import type { Lineage } from '@ah/kit';
import { renewedBy } from '../../ends';
import { ironAgeHut } from './01-iron-age-hut';
import { archaicHouse } from './02-archaic-house';
import { atriumHouse } from './03-atrium-house';
import { gardenApartment } from './04-garden-apartment';
import { houseInRuins } from './05-house-in-ruins';
import { domusSolarata } from './06-domus-solarata';
import { casaASchiera } from './07-casa-a-schiera';

const lineage: Lineage = {
  id: 'home',
  kind: 'home',
  name: 'The Family Home',
  role: 'One ordinary family plot, from a thatched hut on the hill to a low-energy block of flats, where farmers, craftsmen, shopkeepers and clerks lived over two and a half thousand years.',
  plotSize: [14, 18],
  stages: [
    { from: -750, builtUntil: -600, end: renewedBy(-520), def: ironAgeHut },
    { from: -550, builtUntil: -300, end: renewedBy(-120), def: archaicHouse },
    { from: -200, builtUntil: 50, def: atriumHouse },
    { from: 100, builtUntil: 250, def: gardenApartment },
    { from: 480, builtUntil: 600, def: houseInRuins },
    { from: 800, builtUntil: 1100, end: renewedBy(1300), def: domusSolarata },
    { from: 1200, builtUntil: 1400, def: casaASchiera },
  ],
};

export default lineage;
