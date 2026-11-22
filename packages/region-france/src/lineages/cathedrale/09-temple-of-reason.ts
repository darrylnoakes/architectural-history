import type { BuildingDef } from '@ah/kit';
import { cathedral, REVOLUTION, FZ, PZ, CZ, RIDGE, BEL0 } from './shared';

export const templeOfReason: BuildingDef = {
  id: 'temple-of-reason',
  name: 'Temple of Reason',
  style: 'Revolutionary France',
  date: '1793',
  summary:
    'In 1789 the Revolution took the Church’s property into the nation’s hands, and in 1793 and 1794 a campaign against Christianity closed the churches. Cathedrals were rededicated to Reason or to the Supreme Being (Notre-Dame de Paris on 10 November 1793), and many were used as stores. Here the nave is full of hay for the army’s horses. ' +
    'The kings of the gallery were taken for kings of France and beheaded, as were statues in the portals. The timber and lead spire over the crossing was pulled down and its lead taken; across France bells were melted for cannon and metal. ' +
    'Worship returned from 1795 and the Concordat of 1801 gave the cathedral back to the Church, but the scars stayed for half a century. Survives: the whole medieval building, damaged but standing.',
  materials: ['limestone', 'lead', 'stained glass', 'a painted board', 'hay'],
  lookFor: [
    { label: 'Beheaded kings', note: 'The kings in the gallery stand headless. At Notre-Dame de Paris all twenty-eight were pulled down; many of their heads were found buried in 1977.', at: [2.3, 16.4, FZ + 1.0] },
    { label: '“Temple de la Raison”', note: 'The new name painted on a board over the main door.', at: [0, 10.8, PZ + 0.5] },
    { label: 'Tricolour', note: 'The flag of the Republic flies from the gallery between the towers.', at: [1.4, BEL0 + 9.4, FZ] },
    { label: 'No crossing spire', note: 'The roofs meet with nothing above them: the spire has gone for its lead.', at: [0, RIDGE + 0.8, CZ] },
    { label: 'Hay in the nave', note: 'Carted in through the central portal: requisitioned cathedrals served as barns, stores and stables.', at: [4.2, 2.0, PZ + 4.2] },
  ],
  modelledOn:
    'Notre-Dame de Paris, rededicated to Reason on 10 November 1793, whose kings were pulled down that year and whose spire, already decaying, was taken down by 1792. The inscription, the flag and the hay are generic.',
  build(b) {
    cathedral(b, REVOLUTION);
  },
};
