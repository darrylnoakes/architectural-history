import type { BuildingDef } from '@ah/kit';
import { CD, CY, G, PITCH, XO, ZF, buildBrasserie } from './08-brasserie';

export const bistroToday: BuildingDef = {
  id: 'bistro-today',
  name: 'Brasserie restored',
  style: 'Restoration and reuse',
  date: '2014',
  summary:
    'The brasserie of 1905 is still serving. It came through the shelling of the Great War with its front boarded up, lost its terrace to parked cars in the 1960s, and was nearly gutted for a fast-food counter before its woodwork, ceramics and glass were protected as a historic monument and carefully restored. ' +
    'The stone has been cleaned, rotten timber pieced in rather than replaced, missing tiles of the ceramic panels remade to match, and the canopy reglazed in safety glass. ' +
    'Outside, the street has been closed to traffic and paved from wall to wall, so the terrace now runs out among planters and young trees: the town centre remade for people on foot, as French towns have done since the 1970s.',
  materials: ['cleaned limestone', 'restored woodwork', 'glazed stoneware', 'laminated safety glass', 'granite paving'],
  lookFor: [
    { label: 'Restored front', note: 'The curving wooden frames and ironwork repaired piece by piece and revarnished: the same front as in 1905, not a copy.', at: [-6.1, 3.8, ZF + 0.3] },
    { label: 'Ceramic panels', note: 'The flowered stoneware on the piers, cleaned, with lost pieces remade by hand to match.', at: [-XO + PITCH, 3.4, ZF + 0.2] },
    { label: 'Reglazed canopy', note: 'The iron canopy kept, its glass replaced with laminated safety glass.', at: [5.0, CY + 0.4, ZF + CD] },
    { label: 'Car-free street', note: 'Paved from wall to wall, with no kerb, the street now belongs to the terrace, its planters and its trees.', at: [-0.2, 1.2, 10.2] },
    { label: 'Bow window', note: 'The rounded window over the door, its stone cleaned back to the original pale cream.', at: [0, G + 2.0, ZF + 1.9] },
  ],
  build(b) {
    buildBrasserie(b, true);
  },
};
