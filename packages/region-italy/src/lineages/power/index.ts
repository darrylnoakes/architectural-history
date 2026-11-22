import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { arx } from './01-arx';
import { archaicCitadel } from './02-archaic-citadel';
import { republicanForum } from './03-republican-forum';
import { imperialForum } from './04-imperial-forum';
import { lombardPalatium } from './05-lombard-palatium';
import { bishopsPalace } from './06-bishops-palace';
import { broletto } from './07-broletto';
import { palazzoPubblicoDef } from './08-palazzo-pubblico';
import { signoriaPalace } from './09-signoria-palace';
import { prefectureDef } from './10-prefecture';
import { casaDelFascio } from './11-casa-del-fascio';
import { regionalOffices } from './12-regional-offices';
import { civicRestoration } from './13-civic-restoration';

const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  kind: 'power',
  role: 'Where the town is governed: a chief’s stockade, the Roman forum, the bishop’s and the commune’s palaces, and the offices of the Italian state beside them.',
  plotSize: [44, 44],
  stages: [
    { from: -750, builtUntil: -600, end: renewedBy(-450), def: arx },
    { from: -500, builtUntil: -300, end: renewedBy(-100), def: archaicCitadel },
    { from: -150, builtUntil: -30, end: gothicWar, def: republicanForum },
    { from: 100, builtUntil: 250, end: gothicWar, def: imperialForum },
    { from: 600, builtUntil: 900, end: renewedBy(1100), def: lombardPalatium },
    { from: 1000, builtUntil: 1150, def: bishopsPalace },
    { from: 1210, builtUntil: 1290, def: broletto },
    { from: 1300, builtUntil: 1400, def: palazzoPubblicoDef },
    { from: 1480, builtUntil: 1530, def: signoriaPalace },
    { from: 1885, builtUntil: 1910, def: prefectureDef },
    { from: 1934, builtUntil: 1942, def: casaDelFascio },
    { from: 1975, builtUntil: 1990, def: regionalOffices },
    { from: 2012, def: civicRestoration },
  ],
};

export default lineage;
