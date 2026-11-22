import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishHouse } from './01-gaulish-house';
import { galloRomanHouse } from './02-gallo-roman-house';
import { lateRomanHouse } from './03-late-roman-house';
import { frankishHouse } from './04-frankish-house';

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
  ],
};

export default lineage;
