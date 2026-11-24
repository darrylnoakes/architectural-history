import { wallCircuit, type WallPhase } from '@ah/kit';
import walls from './lineages/walls';
import { CURTAIN, corner, curtain, terminal, type WallStage } from './lineages/walls/curtain';

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

const circuit = wallCircuit(WALL, { curtain, corner, terminal, info: CURTAIN }, phases);
export const wallProps = circuit.props;
export const wallClearings = circuit.clearings;
export const wallDetail = circuit.detail;
