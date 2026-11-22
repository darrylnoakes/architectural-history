import { wallCircuit, type WallPhase } from '@ah/kit';
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
 * the stretch round the north-east corner, behind the cathedral, is kept.
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
  { id: 'walls-surviving', stage: 'vauban', since: from('gate-and-boulevard'), sides: ['north-east', 'east-north'] },
];

const circuit = wallCircuit(WALL, { curtain, corner, terminal, info: CURTAIN }, phases);
export const wallProps = circuit.props;
export const wallClearings = circuit.clearings;
