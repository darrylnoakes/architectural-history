import type { Lineage } from '@ah/kit';
import { gothicWar, renewedBy } from '../../ends';
import { chiefsHut } from './01-chiefs-hut';
import { etruscanResidence } from './02-etruscan-residence';
import { peristyleDomus } from './03-peristyle-domus';
import { imperialDomus } from './04-imperial-domus';
import { lateAntiqueDomus } from './05-late-antique-domus';
import { lombardCourt } from './06-lombard-court';
import { towerHouse } from './07-tower-house';
import { gothicPalazzo } from './08-gothic-palazzo';
import { renaissancePalazzo } from './09-renaissance-palazzo';
import { romanPalazzo } from './10-roman-palazzo';
import { baroquePalazzo } from './11-baroque-palazzo';
import { neoclassicalVilla } from './12-neoclassical-villa';
import { libertyVilla } from './13-liberty-villa';
import { rationalistVilla } from './14-rationalist-villa';
import { contemporaryVilla } from './15-contemporary-villa';

const lineage: Lineage = {
  id: 'palazzo',
  name: 'The Palazzo',
  kind: 'elite',
  role: 'The house of the richest family in town, from chief’s hut to palace to villa: where each new fashion in building arrives first.',
  plotSize: [24, 26],
  stages: [
    // huts were rebuilt every generation or so, until the first tiled houses
    { from: -750, builtUntil: -620, end: renewedBy(-560), def: chiefsHut },
    // mudbrick on stone footings: kept up and rebuilt on the same lines until the Roman atrium house
    { from: -580, builtUntil: -300, end: renewedBy(-150), def: etruscanResidence },
    { from: -150, builtUntil: 50, def: peristyleDomus },
    { from: 120, builtUntil: 300, def: imperialDomus },
    { from: 380, builtUntil: 500, end: gothicWar, def: lateAntiqueDomus },
    { from: 750, builtUntil: 1000, def: lombardCourt },
    // the communes ordered towers cut down from the mid-thirteenth century
    { from: 1130, builtUntil: 1260, def: towerHouse },
    { from: 1320, builtUntil: 1430, def: gothicPalazzo },
    { from: 1460, builtUntil: 1530, def: renaissancePalazzo },
    { from: 1545, builtUntil: 1620, def: romanPalazzo },
    { from: 1665, builtUntil: 1750, def: baroquePalazzo },
    { from: 1790, builtUntil: 1850, def: neoclassicalVilla },
    { from: 1905, builtUntil: 1920, def: libertyVilla },
    { from: 1936, builtUntil: 1942, def: rationalistVilla },
    { from: 2008, def: contemporaryVilla },
  ],
};

export default lineage;
