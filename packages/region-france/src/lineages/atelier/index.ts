import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { gaulishForge } from './01-gaulish-forge';
import { pottersQuarter } from './02-potters-quarter';
import { abbeyMill } from './03-abbey-mill';
import { cistercianForge } from './04-cistercian-forge';
import { drapersWorks } from './05-drapers-works';
import { royalManufactory } from './06-royal-manufactory';
import { spinningMill } from './07-spinning-mill';
import { ironFrameMill } from './08-iron-frame-mill';
import { concreteWorkshop } from './09-concrete-workshop';
import { reusedWorks } from './10-reused-works';

const lineage: Lineage = {
  id: 'atelier',
  name: 'L’Atelier',
  kind: 'work',
  role: 'The riverside plot where the town makes things: a Gaulish smithy, Roman kilns, monks’ mills and forges, the cloth trade, the royal manufactory, steam, iron, concrete and reuse.',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    { from: -300, end: renewedBy(120), def: gaulishForge },
    { from: 60, builtUntil: 250, end: invasions, def: pottersQuarter },
    { from: 620, end: renewedBy(1250), def: abbeyMill },
    { from: 1180, def: cistercianForge },
    { from: 1300, def: drapersWorks },
    { from: 1680, def: royalManufactory },
    { from: 1835, def: spinningMill },
    { from: 1872, builtUntil: 1900, def: ironFrameMill },
    { from: 1921, builtUntil: 1960, def: concreteWorkshop },
    { from: 2010, def: reusedWorks },
  ],
};

export default lineage;
