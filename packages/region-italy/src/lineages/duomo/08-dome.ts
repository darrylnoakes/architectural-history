import type { BuildingDef } from '@ah/kit';
import { cathedral, CZ, DOME } from './shared';
import { gothicFacade } from './07-gothic-duomo';

export const dome: BuildingDef = {
  id: 'dome',
  name: 'The dome',
  style: 'Early Renaissance',
  date: 'c. 1440',
  summary:
    'The crossing had waited generations for a dome no one knew how to build. Following Brunelleschi’s success at Florence (1420 to 1436), the city raised an eight-sided drum over it, pierced with round windows, and closed it with a pointed dome of eight tiled faces divided by white marble ribs. ' +
    'The pointed profile pushes outwards less than a hemisphere would, and Brunelleschi’s method (two shells, bricks laid in a herringbone pattern so each course holds itself) let such domes go up without a forest of timber centring. ' +
    'A marble lantern on top lights the space below and weighs the ribs down to lock them. Everything else, the Gothic front and nave, the Romanesque aisles and apse, the bell tower and the baptistery, stays as it was.',
  materials: ['brick dome under clay tiles', 'white marble ribs and lantern', 'marble-faced drum', 'gilt copper ball and cross'],
  lookFor: [
    { label: 'Ribbed dome', note: 'Eight white marble ribs run up the corners of the dome, with red tiles between: the look of Florence Cathedral.', at: [4.4, 30.5, CZ + 4.4] },
    { label: 'Pointed profile', note: 'The dome rises to a point rather than a half-circle, the "pointed fifth" that Brunelleschi chose because it thrusts outwards less.', at: [-5.6, 30.0, CZ] },
    { label: 'Drum and oculi', note: 'The eight-sided drum lifts the dome clear of the roofs; a round window in each face lights the crossing.', at: [0, 23.4, CZ + 5.7] },
    { label: 'Lantern', note: 'The small marble temple on top, with buttresses on its corners and a gilded ball and cross; it holds the ribs together at the top.', at: [1.4, 36.5, CZ] },
  ],
  modelledOn: 'The dome of Florence Cathedral, by Filippo Brunelleschi (1420 to 1436; lantern begun 1446)',
  influences: ['renaissance-birth'],
  build(b) {
    cathedral(b, DOME);
    gothicFacade(b);
  },
};
