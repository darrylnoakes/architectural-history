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
  kind: 'culture',
  name: 'Leisure and Learning',
  role: 'Where the town gathers to bathe, pray, watch, dance and listen: from an ancestral mound to a concert hall.',
  plotSize: [34, 30],
  stages: [
    { from: -500, def: roundBarrow },
    { from: 110, def: romanBaths },
    { from: 430, def: ruinedBaths },
    {
      from: 1140,
      end: {
        year: 1539,
        fate: 'ruin',
        note:
          'Henry VIII dissolved the monasteries of England between 1536 and 1540. The priory was surrendered in 1539, the lead was ' +
          'stripped from its roofs and melted down, and its stone was sold off by the cartload for other buildings.',
      },
      def: priory,
    },
    {
      from: 1599,
      end: {
        year: 1644,
        fate: 'cleared',
        note:
          'Parliament banned public stage plays in 1642, at the start of the Civil War, and the playhouses closed. This one was pulled ' +
          'down two years later, about the time the Globe itself was demolished, and the ground lay open for more than a century.',
      },
      def: playhouse,
    },
    { from: 1771, def: assemblyRooms },
    { from: 1870, def: crystalPalace },
    { from: 1936, def: artDecoCinema },
    { from: 1972, def: brutalistArtsCentre },
    { from: 2010, def: concertHall },
  ],
};

export default lineage;
