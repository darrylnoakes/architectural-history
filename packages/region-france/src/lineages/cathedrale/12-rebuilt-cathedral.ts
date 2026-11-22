import type { BuildingDef } from '@ah/kit';
import { cathedral, REBUILT, NW, H, CZ, RIDGE, AW, FZ } from './shared';

export const rebuiltCathedral: BuildingDef = {
  id: 'rebuilt-cathedral',
  name: 'Rebuilt cathedral',
  style: 'Interwar restoration',
  date: '1919 to 1938',
  summary:
    'The ruined cathedral became a symbol, and restoring it a national cause, paid for by the state and by gifts from abroad (at Reims, notably from John D. Rockefeller Jr.). Henri Deneux, the architect in charge at Reims, would not trust timber again: under the new lead roof he built a fireproof frame of small precast pieces of reinforced concrete, light enough to carry by hand and joined like carpentry. Cut away here, it shows above the vaults. ' +
    'The vaults were patched, the broken pinnacles and parapets rebuilt in new stone, the windows filled with clear and pale painted glass until new stained glass could be made, and the worst-damaged statues replaced by copies. Reims reopened for worship in 1938. ' +
    'The crossing spire was not rebuilt. Survives: the medieval walls, vaults, towers and buttresses with their scars, and the sculpture, much of it now copies.',
  materials: ['limestone, old and new', 'precast reinforced concrete roof frame', 'lead', 'pale glass'],
  lookFor: [
    { label: 'Concrete roof frame', note: 'Trusses of slender concrete members over the nave, built to resist the fire that destroyed the oak frame (shown with part of the roof left off).', at: [NW * 0.5, H + 3.6, 8.8] },
    { label: 'New lead roof', note: 'The roofs are back at their old steep pitch, covered in lead as before.', at: [-NW * 0.5, H + 4.2, -1.0] },
    { label: 'Pale replacement glass', note: 'Clear and lightly painted glass filled the windows in the 1920s and 1930s; new coloured windows came later.', at: [AW + 0.3, 4.0, 5.0] },
    { label: 'No spire', note: 'The spire of the 1850s burned in 1914 and was never replaced.', at: [0, RIDGE + 0.6, CZ] },
    { label: 'Repaired statues', note: 'The kings and portal figures repaired or replaced by copies; some originals went to the museum.', at: [-2.3, 16.6, FZ + 1.0] },
  ],
  modelledOn:
    'Reims Cathedral, restored by Henri Deneux between the wars and reopened in 1938: the concrete roof frame is his system. The glass and the treatment of the statues are simplified.',
  influences: ['reinforced-concrete'],
  build(b) {
    cathedral(b, REBUILT);
  },
};
