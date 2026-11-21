import type { Lineage } from '@ah/kit';
import { roundBarrow } from './01-round-barrow';
import { romanBaths } from './02-roman-baths';
import { ruinedBaths } from './03-ruined-baths';

const lineage: Lineage = {
  id: 'culture',
  name: 'Leisure and Learning',
  role: 'Where the town gathers to bathe, pray, watch, dance and listen: from an ancestral mound to a concert hall.',
  plotSize: [34, 30],
  stages: [
    { from: -500, def: roundBarrow },
    { from: 110, def: romanBaths },
    { from: 430, def: ruinedBaths },
  ],
};

export default lineage;
