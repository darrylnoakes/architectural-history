import { wallCircuit, type Builder, type SiteProp, type WallPhase } from '@ah/kit';
import remparts from './lineages/remparts';
import { CASTRUM_GATE, CURTAIN, castrumGate, corner, curtain, terminal, type WallStage } from './lineages/remparts/curtain';

/**
 * The wall round the town, drawn between the three gate plots and changing with them. It runs up
 * the west side from the river, along the north and down the east side to the river again; the
 * river closes the fourth side. Each age's wall stands for the years its gates stood, so the
 * circuit and the gates always belong together.
 *
 * There are two gaps. Before the late second century BC the settlement is open, and so is the
 * Gallo-Roman town, from the levelling of the Gaulish rampart. The wall of about 290 does not follow
 * this line at all: the town shrank into a much smaller circuit round the forum and the cathedral
 * (`castrumProps`, below), and the old line stayed open until the new and longer wall of 1200. After
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

const outerProps = circuit.props.map((p, i) => ({
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
const inner: { x: number; z: number; r: number }[] = [];
for (let z = -98.5; z <= 33; z += 12) inner.push({ x: -58.5, z, r: 9 }, { x: 91, z, r: 9 });
for (let x = -58.5; x <= 91; x += 12) inner.push({ x, z: -98.5, r: 9 }, { x, z: 33, r: 9 });
export const wallClearings = [...circuit.clearings, ...outer, ...inner];
export const wallDetail = circuit.detail;

// ================================================================== the late Roman circuit

/**
 * The late Roman wall (about 290 to 1200): a much smaller circuit than the open town had covered,
 * round the forum, the cathedral and a few streets of houses, with a gate on each of the two main
 * streets. Its west gate is the old triumphal arch, on a plot of its own (`porte-du-castrum`); the
 * other three are plain gates drawn here.
 *
 * Two stretches are taken over by the buildings that stand against them, which draw the wall
 * themselves from then on: the north-west corner, where the count has his hall from 600, and the
 * stretch behind the cathedral from 380.
 */
// (the west wall passes just outside the forum and the square in front of it, which it takes in whole)
export const CASTRUM_BOX = { west: -58.5, east: 91, north: -98.5, south: 33 };

type Side = 'n' | 'e' | 's' | 'w';
const C = CASTRUM_BOX;
/** Each side as a gate plot would see it: the wall along local X, the field to +Z. */
const SIDES: Record<Side, { at: [number, number]; rotY: number; local: (a: number, c: number) => [number, number] }> = {
  n: { at: [0, C.north], rotY: Math.PI, local: (a, c) => [-c, -a] },
  e: { at: [C.east, 0], rotY: Math.PI / 2, local: (a, c) => [-c, -a] },
  s: { at: [0, C.south], rotY: 0, local: (a, c) => [a, c] },
  w: { at: [C.west, 0], rotY: -Math.PI / 2, local: (a, c) => [a, c] },
};

/** A stretch of the wall on one side, between two world coordinates along it (x for n and s, z for e and w). */
function stretch(b: Builder, side: Side, a: number, c: number): void {
  const f = SIDES[side];
  const [l0, l1] = f.local(a, c);
  b.group({ at: [f.at[0], 0, f.at[1]], rotY: f.rotY }, () => curtain(b, 'castrum', l0, l1));
  const mid = (a + c) / 2;
  const alongX = side === 'n' || side === 's';
  b.collider(alongX ? c - a : CURTAIN.castrum.thick, alongX ? CURTAIN.castrum.thick : c - a, { at: alongX ? [mid, 0, f.at[1]] : [f.at[0], 0, mid] });
}

function cornerAt(b: Builder, x: number, z: number, rotY: number): void {
  b.group({ at: [x, 0, z], rotY }, () => corner(b, 'castrum'));
  b.collider(7, 7, { at: [x, 0, z] });
}

/** A plain gate where a main street crosses a side (at world coordinate 0 along it). */
function gateOn(b: Builder, side: Side): void {
  const f = SIDES[side];
  b.group({ at: [f.at[0], 0, f.at[1]], rotY: f.rotY }, () => castrumGate(b));
  const { half, way } = CASTRUM_GATE;
  const alongX = side === 'n' || side === 's';
  // solid either side of the passage; the way through stays open
  for (const s of [-1, 1]) {
    const mid = (s * (half + way)) / 2;
    b.collider(alongX ? half - way : 6.5, alongX ? 6.5 : half - way, { at: alongX ? [mid, 0, f.at[1]] : [f.at[0], 0, mid] });
  }
}

const G = CASTRUM_GATE.half;
const castrumFrom = from('castrum-wall');
const castrumUntil = from('philippian-gate');

export const castrumProps: SiteProp[] = [
  {
    id: 'castrum',
    since: castrumFrom,
    until: castrumUntil,
    solid: true,
    build(b) {
      // north side, east of the count's corner: the north gate on the Grande Rue
      stretch(b, 'n', -10.2, -G);
      gateOn(b, 'n');
      stretch(b, 'n', G, C.east);
      cornerAt(b, C.east, C.north, Math.PI / 2);
      // east side: the stretch behind the cathedral is drawn apart; the east gate on the road to Reims
      stretch(b, 'e', C.north, -57);
      stretch(b, 'e', -23, -G);
      gateOn(b, 'e');
      stretch(b, 'e', G, C.south);
      cornerAt(b, C.east, C.south, 0);
      // south side: the south gate on the Grande Rue
      stretch(b, 's', G, C.east);
      gateOn(b, 's');
      stretch(b, 's', C.west, -G);
      cornerAt(b, C.west, C.south, -Math.PI / 2);
      // west side, either side of the gate plot where the old arch stands
      stretch(b, 'w', 15, C.south);
      stretch(b, 'w', -51.2, -15);
    },
  },
  {
    // the north-west corner, until the count makes it his stronghold and the hall's own model draws it
    id: 'castrum-north-west',
    since: castrumFrom,
    until: 600,
    solid: true,
    build(b) {
      stretch(b, 'w', C.north, -51.2);
      stretch(b, 'n', C.west, -10.2);
      cornerAt(b, C.west, C.north, Math.PI);
    },
  },
  {
    // behind the plot where the first cathedral is built against the wall in 380
    id: 'castrum-cathedral',
    since: castrumFrom,
    until: 380,
    solid: true,
    build(b) {
      stretch(b, 'e', -57, -23);
    },
  },
];

export const wallProps: SiteProp[] = [...outerProps, ...castrumProps];
