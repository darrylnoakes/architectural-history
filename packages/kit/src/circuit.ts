import type { Builder } from './builder';
import type { SiteProp } from './types';

/**
 * A town wall drawn between three gate plots (north, east and west) and down to a river that
 * closes the fourth side. The region supplies the pieces (a straight stretch, a corner, an end)
 * for each kind of wall it has had, built by the same code as its gate plots so the two always
 * match; this lays them out and gives each age's wall the years it stood.
 */

export interface WallPieces<S extends string> {
  /** A stretch along X from x0 to x1 in a gate plot's own frame, outside to +Z. */
  curtain(b: Builder, stage: S, x0: number, x1: number): void;
  /** A corner at the origin whose outside is the +X, +Z quadrant. */
  corner(b: Builder, stage: S): void;
  /** The end of a stretch arriving along -X, at the river bank. */
  terminal(b: Builder, stage: S): void;
  /** z of the wall's centre line and its thickness at ground level, for walk collisions. */
  info: Record<S, { z: number; thick: number; height: number }>;
}

export interface WallBounds {
  /** x of the west and east walls, z of the north wall, z where the walls end on the river bank. */
  west: number;
  east: number;
  north: number;
  river: number;
  /** Half the width of a gate plot (default 15): the wall stops there and the plot's own stub takes over. */
  gate?: number;
}

/** The six stretches, named by wall and then by which side of its gate they lie. */
export type WallSide = 'north-west' | 'north-east' | 'east-north' | 'east-south' | 'west-north' | 'west-south';

export interface WallPhase<S extends string> {
  id: string;
  stage: S;
  since?: number;
  until?: number;
  /** Which stretches stand in this phase (default: all of them). */
  sides?: WallSide[];
}

const N = Math.PI;
const E = Math.PI / 2;
const W = -Math.PI / 2;

export function wallCircuit<S extends string>(
  bounds: WallBounds,
  pieces: WallPieces<S>,
  phases: WallPhase<S>[],
): { props: SiteProp[]; clearings: { x: number; z: number; r: number }[]; detail: { x0: number; z0: number; x1: number; z1: number } } {
  const g = bounds.gate ?? 15;
  // each stretch is measured in the frame of the gate plot it leaves: that plot's position and rotation
  const runs: Record<WallSide, { at: [number, number]; rotY: number; x0: number; x1: number }> = {
    // the north gate faces north, so its +X is west
    'north-west': { at: [0, bounds.north], rotY: N, x0: g, x1: -bounds.west },
    'north-east': { at: [0, bounds.north], rotY: N, x0: -bounds.east, x1: -g },
    // the east gate faces east: +X is north
    'east-north': { at: [bounds.east, 0], rotY: E, x0: g, x1: -bounds.north },
    'east-south': { at: [bounds.east, 0], rotY: E, x0: -bounds.river, x1: -g },
    // the west gate faces west: +X is south
    'west-north': { at: [bounds.west, 0], rotY: W, x0: bounds.north, x1: -g },
    'west-south': { at: [bounds.west, 0], rotY: W, x0: g, x1: bounds.river },
  };
  const world = (run: { at: [number, number]; rotY: number }, lx: number, lz: number): [number, number] => {
    const c = Math.cos(run.rotY);
    const s = Math.sin(run.rotY);
    return [run.at[0] + lx * c + lz * s, run.at[1] - lx * s + lz * c];
  };

  const build = (b: Builder, phase: WallPhase<S>) => {
    const stage = phase.stage;
    const info = pieces.info[stage];
    const has = (side: WallSide) => !phase.sides || phase.sides.includes(side);
    for (const side of Object.keys(runs) as WallSide[]) {
      if (!has(side)) continue;
      const run = runs[side];
      b.group({ at: [run.at[0], 0, run.at[1]], rotY: run.rotY }, () => pieces.curtain(b, stage, run.x0, run.x1));
      const [cx, cz] = world(run, (run.x0 + run.x1) / 2, info.z);
      b.collider(run.x1 - run.x0, info.thick, { at: [cx, 0, cz], rotY: run.rotY });
    }
    // corners where both their stretches stand (the outside of the piece is its own +X, +Z quadrant)
    if (has('north-west') && has('west-north')) {
      b.group({ at: [bounds.west, 0, bounds.north], rotY: N }, () => pieces.corner(b, stage));
      b.collider(info.thick + 5, info.thick + 5, { at: [bounds.west, 0, bounds.north] });
    }
    if (has('north-east') && has('east-north')) {
      b.group({ at: [bounds.east, 0, bounds.north], rotY: E }, () => pieces.corner(b, stage));
      b.collider(info.thick + 5, info.thick + 5, { at: [bounds.east, 0, bounds.north] });
    }
    // the ends on the river bank
    for (const [side, x] of [['west-south', bounds.west], ['east-south', bounds.east]] as [WallSide, number][]) {
      if (!has(side)) continue;
      b.group({ at: [x, 0, bounds.river], rotY: W }, () => pieces.terminal(b, stage));
      b.collider(info.thick + 3, info.thick + 3, { at: [x, 0, bounds.river] });
    }
  };

  const props = phases.map(
    (phase): SiteProp => ({ id: phase.id, since: phase.since, until: phase.until, solid: true, build: (b) => build(b, phase) }),
  );

  // keep the woods off the line of the wall
  const clearings: { x: number; z: number; r: number }[] = [];
  for (let z = bounds.north; z <= bounds.river; z += 14) clearings.push({ x: bounds.west, z, r: 11 }, { x: bounds.east, z, r: 11 });
  for (let x = bounds.west; x <= bounds.east; x += 14) clearings.push({ x, z: bounds.north, r: 11 });
  // the walls, their ditches and outworks: where the ground must be fine enough to dig
  const m = 36;
  const detail = { x0: bounds.west - m, z0: bounds.north - m, x1: bounds.east + m, z1: bounds.river + 14 };
  return { props, clearings, detail };
}
