import type { Lineage } from '@ah/kit';
import { chiefsHut } from './01-chiefs-hut';
import { etruscanResidence } from './02-etruscan-residence';
import { peristyleDomus } from './03-peristyle-domus';
import { imperialDomus } from './04-imperial-domus';
import { gothicPalazzo } from './08-gothic-palazzo';
import { renaissancePalazzo } from './09-renaissance-palazzo';
import { romanPalazzo } from './10-roman-palazzo';
import { baroquePalazzo } from './11-baroque-palazzo';

const lineage: Lineage = {
  id: 'palazzo',
  name: 'The Palazzo',
  kind: 'elite',
  role: 'wip',
  plotSize: [24, 26],
  stages: [{ from: -750, def: chiefsHut }, { from: -580, def: etruscanResidence }, { from: -150, def: peristyleDomus }, { from: 120, def: imperialDomus }, { from: 1320, def: gothicPalazzo }, { from: 1460, def: renaissancePalazzo }, { from: 1545, def: romanPalazzo }, { from: 1665, def: baroquePalazzo }],
};

export default lineage;
