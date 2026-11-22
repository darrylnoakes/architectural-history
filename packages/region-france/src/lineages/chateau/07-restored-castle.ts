import type { BuildingDef, Builder } from '@ah/kit';
import { C, MOTTE, TOWERS } from './shared';
import { residentialCastle } from './04-residential-castle';

function build(b: Builder) {
  residentialCastle(b, true);
}

const [tx, tz] = TOWERS[1];

export const restoredCastle: BuildingDef = {
  id: 'restored-castle',
  name: 'Restored castle',
  style: 'Gothic Revival',
  date: '1865',
  summary:
    'Left a ruin since it was slighted on royal orders in 1617, the castle is bought back and rebuilt as the Middle Ages ought to have looked. ' +
    'The architect follows the surviving walls but completes everything the ruin left in doubt: every wall-walk is roofed over, every tower gets a taller cone with a gilded finial, dormers and statues multiply, and the stone is new and white. ' +
    'The result is more complete, more regular and more medieval than the castle ever was: a lesson in the Gothic and a showpiece for an emperor, as much a work of the nineteenth century as a railway station.',
  materials: ['new limestone', 'slate', 'lead and gilding', 'cast iron hidden in the roofs'],
  lookFor: [
    { label: 'Covered wall-walks', note: 'Every wall-walk roofed in slate, a defence the restorer believed in and built everywhere at once.', at: [C.x1 + 1.3, 13.5, 6] },
    { label: 'Gilded finials', note: 'Lead spikes and golden balls and vanes on the tower roofs, the restorer’s finishing touch.', at: [tx, 27, tz] },
    { label: 'Statues on the towers', note: 'Figures in niches on the outer faces of the towers, as Viollet-le-Duc set the Nine Worthies on Pierrefonds.', at: [tx + 2.4, 12, tz + 2.4] },
    { label: 'White new stone', note: 'Fresh-cut limestone, so the whole castle looks newly built, which it largely is.', at: [C.gateX + 4.5, 6, C.z1 + 2.6] },
    { label: 'Stone bridge', note: 'The drawbridge replaced by a fixed bridge for visitors arriving by carriage.', at: [C.gateX, 1.2, C.z1 + 5] },
  ],
  modelledOn:
    'Viollet-le-Duc’s rebuilding of Pierrefonds for Napoleon III (1857 to 1885): roofs, covered walks, dormers and statues are his kind of completion. Applied here to this site’s own castle.',
  build,
};

void MOTTE;
