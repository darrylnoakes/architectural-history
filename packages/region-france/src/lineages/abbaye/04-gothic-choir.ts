import type { BuildingDef, Builder } from '@ah/kit';
import { AW, CX, G, GH, GOTH, abbey, pol } from './shared';

function build(b: Builder) {
  abbey(b, GOTH);
}

const col = pol(CX, GH, G.r2, (3 * Math.PI) / 4);
const rib = pol(CX, GH, (G.r1 + G.r2) / 2, (7 * Math.PI) / 8);
const amb = pol(CX, GH, (G.r2 + G.r3) / 2, (9 * Math.PI) / 8);

export const gothicChoir: BuildingDef = {
  id: 'gothic-choir',
  name: 'Gothic choir',
  style: 'Early Gothic',
  date: '1140 to 1144',
  summary:
    'The abbot pulls down the Romanesque east end and builds a new choir that is lighter than anything before it. Pointed arches of different widths can be made to rise to the same height, so even the wedge-shaped bays of a curved walkway can be vaulted; stone ribs gather the weight of each vault on to a few points, slender single columns carry it, and buttresses outside take the thrust. ' +
    'The outer wall is freed to become glass: seven shallow chapels, so close together that they read as one rippling ring of windows, open off a double ambulatory. ' +
    'The old nave, narthex and towers are left standing behind it, as the Carolingian nave was at Saint-Denis for almost ninety years: Gothic begins as a choir added to an older church.',
  materials: ['fine limestone', 'monolithic columns', 'stained glass', 'flat clay tiles'],
  lookFor: [
    { label: 'Double ambulatory', note: 'Two concentric walkways round the sanctuary, divided only by a ring of columns, so the whole east end is one open space.', at: [amb[0], 6.8, amb[1]] },
    { label: 'Ring of chapels', note: 'Seven shallow chapels, each lit by large windows, set so close that the outer wall is almost all glass between buttresses.', at: [CX, 3.4, GH - G.r3 - G.bulge - 0.4] },
    { label: 'Slender columns', note: 'Thin single shafts of stone in place of thick piers: the ribs bring the load down to them at a few points.', at: [col[0], 3.2, col[1]] },
    { label: 'Rib vaults and pointed arches', note: 'Stone ribs cross each bay and pointed arches span between the columns, wide and narrow alike rising to one height. Shown here with the ambulatory roof off.', at: [rib[0], 7.6, rib[1]] },
    { label: 'Romanesque nave', note: 'The old nave with its round-headed windows still stands to the west of the new work.', at: [CX + AW, 6, 3] },
  ],
  modelledOn:
    'The choir of the abbey church of Saint-Denis, built for Abbot Suger from 1140 and consecrated in 1144: the double ambulatory with seven radiating chapels survives, but Suger’s upper storey was rebuilt from 1231, so its height and windows here are conjectural. Suger’s own new west front (about 1135 to 1140) is not shown; this abbey keeps its Romanesque narthex.',
  influences: ['gothic-birth'],
  build,
};
