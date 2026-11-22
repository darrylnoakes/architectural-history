import type { Lineage } from '@ah/kit';
import { tumulus } from './01-tumulus';
import { amphitheatre } from './02-amphitheatre';
import { arenaHouses } from './03-arena-houses';
import { academyTheatre } from './04-academy-theatre';
import { operaHouse } from './05-opera-house';
import { libertyCinema } from './06-liberty-cinema';
import { stadium } from './07-stadium';
import { sportsHall } from './08-sports-hall';
import { auditorium } from './09-auditorium';

const lineage: Lineage = {
  id: 'spectacle',
  name: 'Spectacle',
  kind: 'culture',
  role: 'Where the town goes to be entertained: from an Etruscan tomb mound and a Roman arena to opera, cinema, football and concert halls.',
  plotSize: [40, 36],
  stages: [
    // great tumuli were raised at Cerveteri in the 7th and 6th centuries BC; later tombs were cut into the rock
    { from: -700, builtUntil: -500, def: tumulus },
    {
      from: 70,
      // most Italian amphitheatres were built between the late Republic and the 2nd century AD
      builtUntil: 200,
      end: {
        year: 450,
        fate: 'ruin',
        note:
          'Gladiator fights died out in the early fifth century and wild-beast hunts soon after, as Christian emperors frowned on them and towns ran out of money. ' +
          'The amphitheatre was shut, its seats and facing stripped for building stone and lime, and its vaults used as shelters, stores and stables.',
      },
      def: amphitheatre,
    },
    { from: 1000, def: arenaHouses },
    // learned academy theatres (Vicenza 1585, Sabbioneta 1590, Parma 1618) gave way to public opera houses after 1637
    { from: 1585, builtUntil: 1640, def: academyTheatre },
    { from: 1778, def: operaHouse },
    // Stile Liberty was over by the early 1920s
    { from: 1911, builtUntil: 1922, def: libertyCinema },
    { from: 1932, def: stadium },
    { from: 1957, def: sportsHall },
    { from: 2002, def: auditorium },
  ],
};

export default lineage;
