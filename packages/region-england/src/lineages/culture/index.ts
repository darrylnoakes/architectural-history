import type { Lineage } from '@ah/kit';
import { roundBarrow } from './01-round-barrow';
import { romanBaths } from './02-roman-baths';
import { ruinedBaths } from './03-ruined-baths';
import { priory } from './04-priory';
import { playhouse } from './05-playhouse';
import { assemblyRooms } from './06-assembly-rooms';
import { crystalPalace } from './07-crystal-palace';
import { artDecoCinema } from './08-art-deco-cinema';
import { brutalistArtsCentre } from './09-brutalist-arts-centre';
import { concertHall } from './10-concert-hall';

const lineage: Lineage = {
  id: 'culture',
  name: 'Leisure and Learning',
  role: 'Where the town gathers to bathe, pray, watch, dance and listen: from an ancestral mound to a concert hall.',
  plotSize: [34, 30],
  stages: [
    { from: -500, def: roundBarrow },
    { from: 110, def: romanBaths },
    { from: 430, def: ruinedBaths },
    { from: 1140, def: priory },
    { from: 1599, def: playhouse },
    { from: 1771, def: assemblyRooms },
    { from: 1851, def: crystalPalace },
    { from: 1936, def: artDecoCinema },
    { from: 1972, def: brutalistArtsCentre },
    { from: 2010, def: concertHall },
  ],
};

export default lineage;
