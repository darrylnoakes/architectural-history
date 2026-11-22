import type { BuildingDef } from '@ah/kit';
import { cathedral, EARLY, AW, NW, HZ, TW, CZ, CZ1, facet } from './shared';

const chapel = facet(2, 5, AW + 2.6);

export const earlyGothicCathedral: BuildingDef = {
  id: 'early-gothic-cathedral',
  name: 'Early Gothic choir and Romanesque nave',
  style: 'Early Gothic',
  date: 'c. 1165 to 1200',
  summary:
    'Twenty years after the abbot of Saint-Denis showed what pointed arches and rib vaults could do (1144), the bishop pulled down the Romanesque choir and began a new one in the new manner. It rises far above the old church, with five polygonal chapels round its ambulatory and walls opened into windows. ' +
    'Inside it has four storeys, as at Noyon, Laon and Notre-Dame de Paris: arcade, tribune, a low passage called the triforium, and the clerestory. Outside they show as two rows of windows in the aisle, a band of round windows and the tall lancets of the clerestory. ' +
    'To hold the high vault the builders tried a new device, the flying buttress: a half arch leaping over the aisle roof from a free-standing pier. Notre-Dame de Paris had them by about 1180 and they are among the earliest known. ' +
    'Survives: the Romanesque nave, tribunes and twin-towered front, kept in use while the money lasted. The old crossing tower and transept are gone, and at the join the new transept is rising in scaffolding.',
  materials: ['fine limestone', 'lead on oak roof frames', 'stained glass', 'timber scaffolding'],
  lookFor: [
    { label: 'Flying buttresses', note: 'Half arches springing from piers outside the aisle to prop the clerestory wall where the vault pushes outward. This is one of their first appearances anywhere.', at: [AW + 1.0, 17.2, -16.5] },
    { label: 'Four storeys', note: 'Aisle windows, tribune windows, a ring of round openings and the clerestory: the four-storey elevation of the first Gothic cathedrals, seen from outside.', at: [AW + 0.3, 8.6, -18.5] },
    { label: 'Radiating chapels', note: 'The chapels round the ambulatory are now many-sided and lit by pointed windows, and the walls between them are thinner than before.', at: [chapel.x, 7.6, chapel.z] },
    { label: 'Building site', note: 'The transept walls are going up in scaffolding, with a treadwheel crane on the north arm lifting blocks cut in the masons’ lodge below.', at: [-TW - 1.4, 16.0, CZ - 0.6] },
    { label: 'Old Romanesque nave', note: 'The round-arched nave still stands, much lower than the new choir; it was kept for services until the money for its replacement came in.', at: [-(NW + 0.3), 13.6, 6.0] },
  ],
  modelledOn:
    'Notre-Dame de Paris (begun 1163) for the four storeys with their round openings and the early flying buttresses; Noyon (choir from about 1150) for the radiating chapels round a tribune choir. The building site, the crane and the lodge are generic. How far a transept had risen by 1200 varied from cathedral to cathedral.',
  influences: ['gothic-birth', 'gothic-export'],
  build(b) {
    cathedral(b, EARLY);
    void HZ;
    void CZ1;
  },
};
