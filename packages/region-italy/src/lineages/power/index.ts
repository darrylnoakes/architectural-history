import type { Lineage } from '@ah/kit';
import { arx } from './01-arx';
import { archaicCitadel } from './02-archaic-citadel';
import { republicanForum } from './03-republican-forum';
import { palazzoPubblicoDef } from './08-palazzo-pubblico';
import { signoriaPalace } from './09-signoria-palace';

const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  kind: 'power',
  role: 'Where the town is governed, from a chieftain’s stockade to the commune’s palace and the offices of the Italian state.',
  plotSize: [44, 44],
  stages: [{ from: -750, def: arx }, { from: -500, def: archaicCitadel }, { from: -150, def: republicanForum }, { from: 1300, def: palazzoPubblicoDef }, { from: 1480, def: signoriaPalace }],
};

export default lineage;
