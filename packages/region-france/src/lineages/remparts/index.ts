import type { Lineage } from '@ah/kit';
import { murusGallicus } from './01-murus-gallicus';
import { monumentalArch } from './02-monumental-arch';
import { castrumWall } from './03-castrum-wall';
import { philippianGate } from './04-philippian-gate';
import { fortifiedGate } from './05-fortified-gate';
import { vaubanGateStage } from './06-vauban-gate';
import { gateAndBoulevard } from './07-gate-and-boulevard';

const lineage: Lineage = {
  id: 'remparts',
  name: 'Les Remparts',
  kind: 'defence',
  role: 'The main gate and the wall either side of it: how the town shut itself in against each new kind of attack, from timber-laced rampart to Vauban’s bastions, and how it opened up again.',
  plotSize: [30, 16],
  stages: [
    // The murus gallicus belongs to the oppida of the late 2nd and 1st centuries BC; -300 in the brief
    // was too early for it (the region's earlier Gaulish settlements were open or simply banked).
    {
      from: -120,
      builtUntil: -52,
      end: {
        year: -20,
        fate: 'cleared',
        note: 'After the conquest the new Roman town spread out over the plain and needed no wall. The old rampart was abandoned, its stones and timbers carted off for building, and by about 20 BC it had been levelled.',
      },
      def: murusGallicus,
    },
    { from: 200, builtUntil: 250, def: monumentalArch },
    { from: 290, builtUntil: 380, def: castrumWall },
    { from: 1200, builtUntil: 1300, def: philippianGate },
    // The machicolated raising began in the 1360s, but gun boulevards appear only in the early
    // fifteenth century; the stage shows both, so it starts in 1420 rather than 1370.
    { from: 1420, builtUntil: 1500, def: fortifiedGate },
    { from: 1680, builtUntil: 1720, def: vaubanGateStage },
    { from: 1885, builtUntil: 1914, def: gateAndBoulevard },
  ],
};

export default lineage;
