import type { Lineage } from '@ah/kit';
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

const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  kind: 'power',
  role: 'Where the town is governed, from a chieftain’s stockade to the commune’s palace and the offices of the Italian state.',
  plotSize: [44, 44],
  stages: [{ from: -750, def: arx }, { from: -500, def: archaicCitadel }, { from: -150, def: republicanForum }, { from: 100, def: imperialForum }, { from: 600, def: lombardPalatium }, { from: 1000, def: bishopsPalace }, { from: 1210, def: broletto }, { from: 1300, def: palazzoPubblicoDef }, { from: 1480, def: signoriaPalace }, { from: 1885, def: prefectureDef }],
};

export default lineage;
