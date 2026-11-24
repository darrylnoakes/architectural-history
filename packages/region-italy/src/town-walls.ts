import { wallCircuit, type Builder, type SiteProp, type WallPhase } from '@ah/kit';
import walls from './lineages/walls';
import { CURTAIN, bastionDitchEnd, corner, curtain, terminal, type WallStage } from './lineages/walls/curtain';
import { HALF } from './lineages/walls/shared';

/**
 * The wall round the city, drawn between the three gate plots and changing with them. It runs up
 * the west side from the river, along the north and down the east side to the river again; the
 * river closes the fourth side. Each age's wall stands from the year its gates were built until
 * the next replaced it, so the circuit and the gates always belong together.
 *
 * After 1870 the walls come down for the boulevard, as in most Italian cities, but not everywhere:
 * the north-western stretch is left standing beside the north gate.
 */

export const WALL = { west: -150, east: 146, north: -128, river: 81 };

const STAGES: WallStage[] = ['rampart', 'etruscan', 'roman', 'aurelian', 'communal', 'bastion'];
/** The year each age's wall goes up: the same years as the stages of the gate lineage. */
const years = walls.stages.map((s) => s.from);

const phases: WallPhase<WallStage>[] = [
  ...STAGES.map((stage, i): WallPhase<WallStage> => ({ id: `walls-${stage}`, stage, since: years[i], until: years[i + 1] })),
  // what the demolitions of united Italy spared
  { id: 'walls-surviving', stage: 'bastion', since: years[STAGES.length], sides: ['north-west', 'west-north'] },
];

/**
 * The west gate keeps its medieval gate-tower when the bastions go up (see `plots.ts`), and the tower
 * has no ditch. So the bastioned stretches either side of it close their ditch at its plot instead of
 * running it on. They are told apart by their ends, which come straight from WALL (see `wallCircuit`:
 * 'west-north' runs from x = WALL.north to -HALF in the west gate's frame, 'west-south' from HALF to
 * WALL.river; no other stretch has either pair of ends).
 */
function westGateEnd(stage: WallStage, x0: number, x1: number): 'x0' | 'x1' | undefined {
  if (stage !== 'bastion') return undefined;
  if (x0 === WALL.north && x1 === -HALF) return 'x1';
  if (x0 === HALF && x1 === WALL.river) return 'x0';
  return undefined;
}

const circuit = wallCircuit(
  WALL,
  {
    curtain: (b: Builder, stage: WallStage, x0: number, x1: number) => curtain(b, stage, x0, x1, { close: westGateEnd(stage, x0, x1) }),
    corner,
    // the river ends are drawn below (the circuit still gives them their colliders)
    terminal: () => {},
    info: CURTAIN,
  },
  phases,
);

/**
 * The ends of the wall on the river bank. A river-end piece is built for a stretch arriving along -X
 * with the field to +Z. `wallCircuit` turns both ends the same way (rotY -90°), which is right for the
 * west wall, but on the east wall that puts the field side, and the half-bastion's ditch, inside the
 * town: there the piece has to be the mirror image, which no turn can give. So they are placed here.
 */
const riverEnds: SiteProp[] = phases
  .filter((phase) => !phase.sides || phase.sides.includes('west-south') || phase.sides.includes('east-south'))
  .map((phase) => ({
    id: `${phase.id}-river-ends`,
    since: phase.since,
    until: phase.until,
    build(b) {
      const has = (side: 'west-south' | 'east-south') => !phase.sides || phase.sides.includes(side);
      if (has('west-south')) b.group({ at: [WALL.west, 0, WALL.river], rotY: -Math.PI / 2 }, () => terminal(b, phase.stage));
      // turned to face east and mirrored, so that the wall still arrives from the north
      if (has('east-south')) b.group({ at: [WALL.east, 0, WALL.river], rotY: Math.PI / 2, scale: [-1, 1, 1] }, () => terminal(b, phase.stage));
    },
  }));

/**
 * When the north-eastern stretch comes down its ditch is filled in, and the ditch of the kept north
 * gate (whose plot keeps its stub of rampart) slopes up to the ground just past the plot's eastern
 * edge, which is its own -X edge (the north gate faces north).
 */
const northGateDitchEnd: SiteProp = {
  id: 'walls-north-gate-ditch-end',
  since: years[STAGES.length],
  build(b) {
    b.group({ at: [0, 0, WALL.north], rotY: Math.PI }, () => bastionDitchEnd(b, -1));
  },
};

export const wallProps = [...circuit.props, ...riverEnds, northGateDitchEnd];
export const wallClearings = circuit.clearings;
export const wallDetail = circuit.detail;
