import { P, type BuildingDef } from '@ah/kit';
import { COUNTERS, concreteMarket, forecourtLamp, goods, marketCounter } from './shared';

export const rationalistMarket: BuildingDef = {
  id: 'rationalist-market',
  name: 'Covered market (mercato coperto)',
  style: 'Rationalist',
  date: 'c. 1936',
  summary:
    'In the 1930s the municipality moves the food trade off the street and into a hygienic covered market, part of a programme of public works the regime advertised as modern efficiency. ' +
    'The hall is a single span of reinforced concrete: parabolic arches, a shape that carries an evenly spread load in pure compression, with a thin shell between them. ' +
    'Light comes through walls of glass block and a strip of glazing along the crown, so the stalls inside need no windows. ' +
    'Nothing is borrowed from history except the travertine on the clock tower, the material the regime favoured for its public face.',
  materials: ['reinforced concrete', 'glass block', 'travertine cladding', 'steel'],
  lookFor: [
    { label: 'Parabolic arches', note: 'Concrete ribs shaped as parabolas carry the roof in one span, with no columns inside.', at: [6.4, 7.6, 7.6] },
    { label: 'Glass-block walls', note: 'Hollow pressed-glass bricks let in light but not heat or prying eyes; a favourite material of the Rationalists.', at: [-4.0, 5.0, 9.4] },
    { label: 'Cantilevered canopy', note: 'A thin concrete slab projects over the entrance with no visible support.', at: [0, 4.4, 10.2] },
    { label: 'Clock tower', note: 'A plain travertine-clad shaft with a clock: modern in form, but civic and monumental in intent.', at: [11.6, 12.6, 9.0] },
    { label: 'Crown skylight', note: 'A strip of glazing along the top of the vault lights the middle of the hall.', at: [0, 11.4, -2.0] },
  ],
  influences: ['rationalism'],
  build(b) {
    concreteMarket(b, false);

    // stalls in rows inside: concrete counters with white marble tops
    for (const [x, z] of COUNTERS) {
      marketCounter(b, x, z);
      goods(b, 3.2, [x, 1.18, z], Math.PI / 2, b.pick([['fruit', 'basket'], ['fish'], ['cheese', 'pot']] as const).slice());
    }
    // a lamp standard in the forecourt
    forecourtLamp(b);
  },
};
