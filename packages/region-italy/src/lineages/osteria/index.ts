import type { Lineage } from '@ah/kit';
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
import { boutiqueHotel } from './12-boutique-hotel';

const lineage: Lineage = {
  id: 'osteria',
  name: 'The Osteria',
  kind: 'hospitality',
  role: 'Food, drink and a bed.',
  plotSize: [22, 22],
  stages: [{ from: -750, def: hearthHut }, { from: -200, def: caupona }, { from: 60, def: thermopolium }, { from: 500, def: xenodochium }, { from: 1050, def: pilgrimHospital }, { from: 1380, def: locanda }, { from: 1470, def: renaissanceInn }, { from: 1740, def: postingInn }, { from: 1831, def: grandCafe }, { from: 1898, def: grandHotel }, { from: 2016, def: boutiqueHotel }],
};

export default lineage;
