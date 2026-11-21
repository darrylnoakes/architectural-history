import type { Lineage } from '@ah/kit';
import { romanEnd } from '../../ends';
import { chieftainsEnclosure } from './01-chieftains-enclosure';
import { forumBasilica } from './02-forum-basilica';
import { saxonGreatHall } from './03-saxon-great-hall';
import { motteAndBailey } from './04-motte-and-bailey';
import { stoneKeepDef } from './05-stone-keep';
import { edwardianCastle } from './06-edwardian-castle';
import { elizabethanManor } from './07-elizabethan-manor';
import { palladianHall } from './08-palladian-hall';
import { gothicRevivalTownHall } from './09-gothic-revival-town-hall';
import { brutalistCivicCentre } from './10-brutalist-civic-centre';
import { civicHub } from './11-civic-hub';

const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  role: 'The plot where whoever rules the town lives or governs, from chieftain and lord to council and citizens.',
  plotSize: [44, 44],
  stages: [
    { from: -500, def: chieftainsEnclosure },
    { from: 75, end: romanEnd, def: forumBasilica },
    { from: 600, def: saxonGreatHall },
    { from: 1068, def: motteAndBailey },
    { from: 1130, def: stoneKeepDef },
    { from: 1290, def: edwardianCastle },
    { from: 1575, def: elizabethanManor },
    { from: 1735, def: palladianHall },
    { from: 1874, def: gothicRevivalTownHall },
    { from: 1967, def: brutalistCivicCentre },
    { from: 2008, def: civicHub },
  ],
};

export default lineage;
