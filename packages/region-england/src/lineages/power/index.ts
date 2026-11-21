import type { Lineage } from '@ah/kit';
import { chieftainsEnclosure } from './01-chieftains-enclosure';
import { forumBasilica } from './02-forum-basilica';
import { saxonGreatHall } from './03-saxon-great-hall';
import { motteAndBailey } from './04-motte-and-bailey';
import { stoneKeepDef } from './05-stone-keep';

const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  role: 'The plot where whoever rules the town lives or governs, from chieftain and lord to council and citizens.',
  plotSize: [44, 44],
  stages: [
    { from: -500, def: chieftainsEnclosure },
    { from: 75, def: forumBasilica },
    { from: 470, def: saxonGreatHall },
    { from: 1068, def: motteAndBailey },
    { from: 1130, def: stoneKeepDef },
  ],
};

export default lineage;
