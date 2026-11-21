import type { Lineage } from '@ah/kit';
import { tumulus } from './01-tumulus';
import { amphitheatre } from './02-amphitheatre';
import { arenaHouses } from './03-arena-houses';
import { academyTheatre } from './04-academy-theatre';
import { operaHouse } from './05-opera-house';

const lineage: Lineage = {
  id: 'spectacle',
  name: 'Spectacle',
  kind: 'culture',
  role: 'Where the town goes to be entertained.',
  plotSize: [40, 36],
  stages: [{ from: -700, def: tumulus }, { from: 70, def: amphitheatre }, { from: 1000, def: arenaHouses }, { from: 1585, def: academyTheatre }, { from: 1778, def: operaHouse }],
};

export default lineage;
