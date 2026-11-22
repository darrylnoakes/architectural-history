import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { aristocratsFarm } from './01-aristocrats-farm';
import { domus } from './02-domus';
import { frankishHall } from './03-frankish-hall';
import { maisonForte } from './04-maison-forte';
import { gothicHotel } from './05-gothic-hotel';
import { renaissanceHotel } from './06-renaissance-hotel';
import { brickAndStoneHotel } from './07-brick-and-stone-hotel';
import { hotelParticulier } from './08-hotel-particulier';
import { neoclassicalHotel } from './09-neoclassical-hotel';
import { artNouveauVilla } from './10-art-nouveau-villa';
import { modernVilla } from './11-modern-villa';

const lineage: Lineage = {
  id: 'hotel',
  name: 'L’Hôtel',
  kind: 'elite',
  role: 'The home of the richest household in town, from a Gaulish noble’s enclosure to a glass house: where each new fashion in living arrives first.',
  plotSize: [24, 26],
  stages: [
    { from: -300, builtUntil: -30, end: renewedBy(80), def: aristocratsFarm },
    { from: 60, builtUntil: 250, end: invasions, def: domus },
    // a timber hall, rebuilt every generation or two, until the first stone houses
    { from: 600, builtUntil: 1050, end: renewedBy(1180), def: frankishHall },
    { from: 1150, builtUntil: 1300, def: maisonForte },
    { from: 1445, builtUntil: 1520, def: gothicHotel },
    { from: 1540, builtUntil: 1600, def: renaissanceHotel },
    { from: 1625, builtUntil: 1665, def: brickAndStoneHotel },
    { from: 1705, builtUntil: 1770, def: hotelParticulier },
    { from: 1780, builtUntil: 1820, def: neoclassicalHotel },
    { from: 1902, builtUntil: 1914, def: artNouveauVilla },
    { from: 1930, builtUntil: 1960, def: modernVilla },
  ],
};

export default lineage;
