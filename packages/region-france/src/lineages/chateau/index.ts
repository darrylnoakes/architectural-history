import type { Lineage } from '@ah/kit';
import { motteDef } from './01-motte';
import { donjon } from './02-donjon';
import { philippianCastle } from './03-philippian-castle';
import { residentialCastleDef } from './04-residential-castle';
import { renaissanceChateau } from './05-renaissance-chateau';
import { classicalChateau } from './06-classical-chateau';
import { restoredCastle } from './07-restored-castle';

const lineage: Lineage = {
  id: 'chateau',
  name: 'Le Château',
  kind: 'castle',
  role: 'The lord’s stronghold on the rising ground, from earth mound to royal fortress and palace, and the country house that took its place.',
  plotSize: [44, 48],
  stages: [
    { from: 960, def: motteDef },
    { from: 1100, builtUntil: 1180, def: donjon },
    { from: 1220, builtUntil: 1280, def: philippianCastle },
    {
      from: 1395,
      builtUntil: 1470,
      end: {
        year: 1617,
        fate: 'ruin',
        note:
          'Held against the king in the troubles of Louis XIII’s early reign, the castle was besieged in 1617 and then slighted on royal orders: its towers were breached and its roofs and floors burned, and it was left a ruin for almost two hundred and fifty years.',
      },
      def: residentialCastleDef,
    },
    { from: 1520, builtUntil: 1600, def: renaissanceChateau },
    { from: 1660, builtUntil: 1780, def: classicalChateau },
    { from: 1865, builtUntil: 1885, def: restoredCastle },
  ],
};

export default lineage;
