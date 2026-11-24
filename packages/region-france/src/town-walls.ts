import { wallCircuit, type Builder, type WallPhase } from '@ah/kit';
import remparts from './lineages/remparts';
import { CURTAIN, corner, curtain, terminal, type WallStage } from './lineages/remparts/curtain';

/**
 * The wall round the town, drawn between the three gate plots and changing with them. It runs up
 * the west side from the river, along the north and down the east side to the river again; the
 * river closes the fourth side. Each age's wall stands for the years its gates stood, so the
 * circuit and the gates always belong together.
 *
 * There are two gaps. Before the late second century BC the settlement is open, and so is the
 * Gallo-Roman town, from the levelling of the Gaulish rampart until the wall of about 290. After
 * the fortress is declassified in 1885 the western and north-western ramparts go for boulevards;
 * the stretch round the north-east corner, behind the cathedral, is kept, with the east gate. The
 * north gate goes too, so that stretch is drawn as `vauban-surviving`, which closes its ditch at the
 * north gate's plot instead of running on into it.
 */

export const WALL = { west: -150, east: 146, north: -128, river: 81 };

const stage = (id: string) => {
  const s = remparts.stages.find((x) => x.def.id === id);
  if (!s) throw new Error(`remparts has no stage ${id}`);
  return s;
};
const from = (id: string) => stage(id).from;

const phases: WallPhase<WallStage>[] = [
  { id: 'walls-gaulish', stage: 'gaulish', since: from('murus-gallicus'), until: stage('murus-gallicus').end?.year ?? from('monumental-arch') },
  { id: 'walls-castrum', stage: 'castrum', since: from('castrum-wall'), until: from('philippian-gate') },
  { id: 'walls-philippian', stage: 'philippian', since: from('philippian-gate'), until: from('fortified-gate') },
  { id: 'walls-fortified', stage: 'fortified', since: from('fortified-gate'), until: from('vauban-gate') },
  { id: 'walls-vauban', stage: 'vauban', since: from('vauban-gate'), until: from('gate-and-boulevard') },
  // what the declassification of 1885 spared
  { id: 'walls-surviving', stage: 'vauban-surviving', since: from('gate-and-boulevard'), sides: ['north-east', 'east-north'] },
];

/*
 * The circuit places both river ends turned the same way, which suits the western one (its stretch
 * arrives along the piece's -X) but leaves the eastern one inside out. So the circuit is given no
 * terminal of its own, and the ends are drawn here: the eastern one turned to face east, as the mirror
 * image (its stretch arrives along +X).
 */
const circuit = wallCircuit(WALL, { curtain, corner, terminal: () => {}, info: CURTAIN }, phases);

function riverEnds(b: Builder, phase: WallPhase<WallStage>): void {
  const has = (side: 'west-south' | 'east-south') => !phase.sides || phase.sides.includes(side);
  if (has('west-south')) b.group({ at: [WALL.west, 0, WALL.river], rotY: -Math.PI / 2 }, () => terminal(b, phase.stage, 1));
  if (has('east-south')) b.group({ at: [WALL.east, 0, WALL.river], rotY: Math.PI / 2 }, () => terminal(b, phase.stage, -1));
}

export const wallProps = circuit.props.map((p, i) => ({
  ...p,
  build: (b: Builder, ground: (x: number, z: number) => number) => {
    p.build(b, ground);
    riverEnds(b, phases[i]);
  },
}));

/**
 * Keep the woods off the line of the wall and off the ditch and glacis in front of it (the bastioned
 * front reaches some twenty metres out).
 */
const outer: { x: number; z: number; r: number }[] = [];
for (let z = WALL.north; z <= WALL.river; z += 14) outer.push({ x: WALL.west - 16, z, r: 10 }, { x: WALL.east + 16, z, r: 10 });
for (let x = WALL.west; x <= WALL.east; x += 14) outer.push({ x, z: WALL.north - 16, r: 10 });
export const wallClearings = [...circuit.clearings, ...outer];
export const wallDetail = circuit.detail;
