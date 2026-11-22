import type { BuildingDef, Stage } from '@ah/kit';
import { corner, curtain, terminal, type WallStage } from './curtain';

const STAGES: WallStage[] = ['gaulish', 'castrum', 'philippian', 'fortified', 'vauban'];
const mk = (id: string, build: BuildingDef['build']): BuildingDef => ({ id, name: id, style: '', date: '', summary: '', materials: [], lookFor: [], build });

export const testStages: Stage[] = STAGES.flatMap((st, i) => [
  { from: 3000 + i * 2, def: mk(`t-${st}-count`, (b) => { b.noCollide(); curtain(b, st, 15, 215); }) },
  {
    from: 3001 + i * 2,
    def: mk(`t-${st}-pieces`, (b) => {
      b.noCollide();
      curtain(b, st, -15, 60);
      b.group({ at: [60, 0, 0] }, () => corner(b, st));
      b.group({ at: [60, 0, 0], rotY: Math.PI / 2 }, () => curtain(b, st, 0, 50));
      b.group({ at: [0, 0, -45] }, () => {
        curtain(b, st, -40, 0);
        terminal(b, st);
      });
    }),
  },
]);
