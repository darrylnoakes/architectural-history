import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHouse } from './01-gaulish-house';
import { galloRomanHouse } from './02-gallo-roman-house';
import { lateRomanHouse } from './03-late-roman-house';
import { frankishHouse } from './04-frankish-house';
import { romanesqueHouse } from './05-romanesque-house';
import { gothicTimberHouse } from './06-gothic-timber-house';
import { renaissanceHouse } from './07-renaissance-house';
import { classicalHouse } from './08-classical-house';
import { immeubleBourgeois } from './09-immeuble-bourgeois';
import { maison1900 } from './10-maison-1900';
import { reconstructionHouse } from './11-reconstruction-house';
import { pavillon } from './12-pavillon';
import { ecoHouse } from './13-eco-house';

const lineage: Lineage = {
  id: 'maison',
  name: 'La Maison',
  kind: 'home',
  role: 'One ordinary household plot, from a Gaulish farmhouse in a fenced yard to a timber-clad eco-house, where farmers, craftsmen, shopkeepers and clerks lived for over two thousand years.',
  plotSize: [14, 18],
  stages: [
    { from: -300, builtUntil: -30, end: renewedBy(60), def: gaulishHouse },
    { from: 30, builtUntil: 250, end: invasions, def: galloRomanHouse },
    { from: 300, builtUntil: 480, end: renewedBy(700), def: lateRomanHouse },
    { from: 600, builtUntil: 1050, end: renewedBy(1200), def: frankishHouse },
    { from: 1140, builtUntil: 1250, def: romanesqueHouse },
    { from: 1330, builtUntil: 1510, def: gothicTimberHouse },
    { from: 1530, builtUntil: 1640, def: renaissanceHouse },
    { from: 1680, builtUntil: 1780, def: classicalHouse },
    { from: 1868, def: immeubleBourgeois },
    { from: 1903, builtUntil: 1914, def: maison1900 },
    { from: 1924, builtUntil: 1935, def: reconstructionHouse },
    { from: 1968, builtUntil: 1990, def: pavillon },
    { from: 2014, def: ecoHouse },
  ],
};

export default lineage;
