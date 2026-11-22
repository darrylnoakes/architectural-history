import type { Builder, SiteProp } from '@ah/kit';
import walls from './lineages/walls';
import { CURTAIN, corner, curtain, terminal, type WallStage } from './lineages/walls/curtain';

/**
 * The wall round the city, drawn between the three gate plots and changing with them. It runs up
 * the west side from the river, along the north and down the east side to the river again; the
 * river closes the fourth side. Each age's wall is one prop that stands from the year its gates
 * were built until the next replaced it, so the circuit and the gates always belong together.
 *
 * After 1870 the walls come down for the boulevard, as in most Italian cities, but not everywhere:
 * the north-western stretch is left standing beside the north gate.
 */

export const WALL = { west: -150, east: 146, north: -128, river: 81 };
/** Half the width of a gate plot: the wall stops here and the plot's own stub takes over. */
const GATE = 15;

const STAGES: WallStage[] = ['rampart', 'etruscan', 'roman', 'aurelian', 'communal', 'bastion'];
const N = Math.PI;
const E = Math.PI / 2;
const W = -Math.PI / 2;

interface Run {
  /** The gate plot the stretch is measured from, and that plot's rotation. */
  at: [number, number];
  rotY: number;
  /** Along the wall in the plot's own X, from x0 to x1. */
  x0: number;
  x1: number;
  /** Still standing after the demolitions of 1870. */
  kept?: boolean;
}

const RUNS: Run[] = [
  // north wall: west of the gate, then east of it (the north gate plot faces north, so its +X is west)
  { at: [0, WALL.north], rotY: N, x0: GATE, x1: -WALL.west, kept: true },
  { at: [0, WALL.north], rotY: N, x0: -WALL.east, x1: -GATE },
  // east wall: north of the gate, then south to the river (+X is north)
  { at: [WALL.east, 0], rotY: E, x0: GATE, x1: -WALL.north },
  { at: [WALL.east, 0], rotY: E, x0: -WALL.river, x1: -GATE },
  // west wall: north of the gate, then south to the river (+X is south)
  { at: [WALL.west, 0], rotY: W, x0: WALL.north, x1: -GATE, kept: true },
  { at: [WALL.west, 0], rotY: W, x0: GATE, x1: WALL.river },
];

/** A point in a plot's own frame, in world metres. */
function world(run: { at: [number, number]; rotY: number }, lx: number, lz: number): [number, number] {
  const c = Math.cos(run.rotY);
  const s = Math.sin(run.rotY);
  return [run.at[0] + lx * c + lz * s, run.at[1] - lx * s + lz * c];
}

function buildWall(b: Builder, stage: WallStage, survivorsOnly: boolean) {
  const info = CURTAIN[stage];
  for (const run of RUNS) {
    if (survivorsOnly && !run.kept) continue;
    b.group({ at: [run.at[0], 0, run.at[1]], rotY: run.rotY }, () => curtain(b, stage, run.x0, run.x1));
    const [cx, cz] = world(run, (run.x0 + run.x1) / 2, info.z);
    b.collider(run.x1 - run.x0, info.thick, { at: [cx, 0, cz], rotY: run.rotY });
  }
  // corners: the outside of the piece is its own +X, +Z quadrant
  b.group({ at: [WALL.west, 0, WALL.north], rotY: N }, () => corner(b, stage));
  b.collider(info.thick + 5, info.thick + 5, { at: [WALL.west, 0, WALL.north] });
  if (survivorsOnly) {
    // the kept stretch ends where the demolition stopped: by the north gate and by the west gate
    return;
  }
  b.group({ at: [WALL.east, 0, WALL.north], rotY: E }, () => corner(b, stage));
  b.collider(info.thick + 5, info.thick + 5, { at: [WALL.east, 0, WALL.north] });
  // the ends on the river bank
  b.group({ at: [WALL.west, 0, WALL.river], rotY: W }, () => terminal(b, stage));
  b.group({ at: [WALL.east, 0, WALL.river], rotY: W }, () => terminal(b, stage));
  for (const x of [WALL.west, WALL.east]) b.collider(info.thick + 3, info.thick + 3, { at: [x, 0, WALL.river] });
}

/** The year each age's wall goes up: the same years as the stages of the gate lineage. */
const years = walls.stages.map((s) => s.from);

export const wallProps: SiteProp[] = [
  ...STAGES.map(
    (stage, i): SiteProp => ({
      id: `walls-${stage}`,
      since: i === 0 ? undefined : years[i],
      until: years[i + 1],
      solid: true,
      build: (b) => buildWall(b, stage, false),
    }),
  ),
  {
    // what the demolitions of united Italy spared
    id: 'walls-surviving',
    since: years[STAGES.length],
    solid: true,
    build: (b) => buildWall(b, 'bastion', true),
  },
];

/** Keep the woods off the line of the wall. */
export const wallClearings: { x: number; z: number; r: number }[] = [];
for (let z = WALL.north; z <= WALL.river; z += 14) {
  wallClearings.push({ x: WALL.west, z, r: 11 }, { x: WALL.east, z, r: 11 });
}
for (let x = WALL.west; x <= WALL.east; x += 14) wallClearings.push({ x, z: WALL.north, r: 11 });
