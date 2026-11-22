import type { BuildingDef } from '@ah/kit';
import { cathedral, ROMANESQUE, AW, NW, HZ, CZ, FZ, HR, facet } from './shared';

const chapel = facet(3, 7, AW + 2.4);

export const romanesqueCathedral: BuildingDef = {
  id: 'romanesque-cathedral',
  name: 'Romanesque cathedral',
  style: 'Romanesque',
  date: 'c. 1050 to 1100',
  summary:
    'In the eleventh century the bishops of northern France rebuilt their cathedrals in cut stone, longer, taller and more solid than anything since Rome. Every opening is a round arch; the walls are thick, stiffened by flat pilaster buttresses and finished under the eaves with a corbel table of little arches. ' +
    'Over each aisle runs an upper gallery, the tribune, which shows outside as a second row of windows; the nave itself has a timber roof, as most large churches of the north still did. The Carolingian westwork has become a front between two towers, and a third tower stands over the crossing. ' +
    'At the east end is the French invention of the age: an ambulatory, a passage running round behind the high altar, opening into chapels that radiate from it like the petals of a flower. Pilgrims could walk past the relics without disturbing the choir, and each chapel had its own altar. ' +
    'Nothing of the Carolingian church survives above ground; its crypt may lie under the new choir.',
  materials: ['coursed limestone', 'rubble core', 'oak roof frames', 'flat clay tiles'],
  lookFor: [
    { label: 'Ambulatory and radiating chapels', note: 'A low passage curves round the apse, with three round chapels opening off it: a plan worked out in the Loire valley and Burgundy around 1000 and soon used all over France.', at: [chapel.x, 6.5, chapel.z] },
    { label: 'Tribune windows', note: 'The pairs of small windows above the aisle windows light the tribune, a gallery over the aisle that also helped to brace the high walls.', at: [AW + 0.3, 7.4, 4.0] },
    { label: 'Twin west towers', note: 'Two towers frame the entrance: the westwork of the Carolingians turned into a façade, the pattern of every great French church front to come.', at: [6.2, 26.0, FZ + 0.5] },
    { label: 'Crossing tower', note: 'A square tower over the meeting of nave and transept, opened by round-arched windows near the top.', at: [0, 22.0, CZ + 4.5] },
    { label: 'Corbel table', note: 'A row of small round arches carved under the eaves, a favourite Romanesque finish to a wall.', at: [-(NW + 0.3), HR - 0.4, 10.0] },
  ],
  modelledOn:
    'Saint-Étienne at Nevers (about 1063 to 1097) for the ambulatory with three radiating chapels, the tribunes and the crossing tower; the abbey church of Jumièges (1040 to 1067) for the twin-towered front. Proportions and details are generic; the stone pyramids on the towers are a guess at roofs that are lost everywhere.',
  influences: ['carolingian-revival', 'norman-export'],
  build(b) {
    cathedral(b, ROMANESQUE);
    void HZ;
  },
};
