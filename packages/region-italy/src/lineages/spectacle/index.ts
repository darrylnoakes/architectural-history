import type { Lineage } from '@ah/kit';
import { tumulus } from './01-tumulus';
import { amphitheatre } from './02-amphitheatre';
import { arenaHouses } from './03-arena-houses';

const lineage: Lineage = {
  id: 'spectacle',
  name: 'Spectacle',
  kind: 'culture',
  role: 'Where the town goes to be entertained.',
  plotSize: [40, 36],
  stages: [{ from: -700, def: tumulus }, { from: 70, def: amphitheatre }, { from: 1000, def: arenaHouses }],
};

export default lineage;
