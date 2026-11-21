import type { Lineage } from '@ah/kit';
import { sacredEnclosure } from './01-sacred-enclosure';
import { etruscanTemple } from './02-etruscan-temple';
import { republicanTemple } from './03-republican-temple';
import { imperialTemple } from './04-imperial-temple';
import { earlyChristianBasilica } from './05-early-christian-basilica';
import { romanesqueDuomo } from './06-romanesque-duomo';
import { gothicDuomo } from './07-gothic-duomo';
import { dome } from './08-dome';
import { baroqueDuomo } from './09-baroque-duomo';
import { completedFacade } from './10-completed-facade';

const lineage: Lineage = {
  id: 'duomo',
  name: 'The Temple and the Cathedral',
  kind: 'worship',
  role: 'The town’s holiest ground: an open-air altar, three temples in turn, then one cathedral enlarged and remade for fifteen centuries.',
  plotSize: [32, 60],
  stages: [
    { from: -750, def: sacredEnclosure },
    // the Tuscan temple was still being built in the second century BC (the Capitolium at Cosa)
    { from: -500, builtUntil: -150, def: etruscanTemple },
    { from: -120, def: republicanTemple },
    {
      from: 20,
      builtUntil: 300,
      end: {
        year: 392,
        fate: 'ruin',
        note:
          'In 391 and 392 the emperor Theodosius banned pagan sacrifice and the temples were shut. Left empty, they decayed and were stripped for their columns and stone, ' +
          'often to build churches.',
      },
      def: imperialTemple,
    },
    { from: 400, def: earlyChristianBasilica },
    { from: 1120, builtUntil: 1260, def: romanesqueDuomo },
    { from: 1310, def: gothicDuomo },
    { from: 1440, def: dome },
    { from: 1630, builtUntil: 1760, def: baroqueDuomo },
    { from: 1887, builtUntil: 1910, def: completedFacade },
  ],
};

export default lineage;
