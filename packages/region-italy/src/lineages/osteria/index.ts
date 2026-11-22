import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { hearthHut } from './01-hearth-hut';
import { caupona } from './02-caupona';
import { thermopolium } from './03-thermopolium';
import { xenodochium } from './04-xenodochium';
import { pilgrimHospital } from './05-pilgrim-hospital';
import { locanda } from './06-locanda';
import { renaissanceInn } from './07-renaissance-inn';
import { postingInn } from './08-posting-inn';
import { grandCafe } from './09-grand-cafe';
import { grandHotel } from './10-grand-hotel';
import { barAndPensione } from './11-bar-and-pensione';
import { boutiqueHotel } from './12-boutique-hotel';

const lineage: Lineage = {
  id: 'osteria',
  name: 'The Osteria',
  kind: 'hospitality',
  role: 'Where strangers have been fed, watered and put up for the night, from a hut with a hearth to a Renaissance inn restored as a hotel.',
  plotSize: [22, 22],
  stages: [
    // huts were rebuilt as huts until the town went over to tile and masonry
    { from: -750, builtUntil: -500, end: renewedBy(-200), def: hearthHut },
    { from: -200, end: gothicWar, def: caupona },
    { from: 60, builtUntil: 300, end: gothicWar, def: thermopolium },
    { from: 500, builtUntil: 1000, end: renewedBy(1150), def: xenodochium },
    { from: 1050, builtUntil: 1300, def: pilgrimHospital },
    { from: 1380, def: locanda },
    { from: 1470, builtUntil: 1600, def: renaissanceInn },
    { from: 1740, builtUntil: 1840, def: postingInn },
    { from: 1831, builtUntil: 1880, def: grandCafe },
    { from: 1898, builtUntil: 1930, def: grandHotel },
    { from: 1958, builtUntil: 1975, def: barAndPensione },
    { from: 2016, def: boutiqueHotel },
  ],
};

export default lineage;
