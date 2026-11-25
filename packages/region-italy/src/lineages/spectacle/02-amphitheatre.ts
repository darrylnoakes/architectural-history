import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import {
  N,
  STOREY_Y,
  arcadeBay,
  arcadeBelt,
  arcadeOrder,
  bayFrame,
  pierFrame,
  ringBand,
  ringPt,
  ringDisc,
  thickWall,
  vert,
  type Pt,
} from './shared';

/** Height of the podium wall round the arena. */
export const PODIUM = 3.2;

/** The stepped section of the seating, as [s, y] points from the podium to the top gallery. */
function caveaProfile(): Pt[] {
  const pts: Pt[] = [[0, PODIUM], [0.06, PODIUM]];
  let s = 0.06;
  let y = PODIUM;
  const tiers = [
    { steps: 5, ds: 0.06, dy: 0.6 },
    { steps: 4, ds: 0.06, dy: 0.6 },
    { steps: 3, ds: 0.06, dy: 0.55 },
  ];
  tiers.forEach((t, i) => {
    for (let k = 0; k < t.steps; k++) {
      y += t.dy;
      pts.push([s, y]);
      s += t.ds;
      pts.push([s, y]);
    }
    if (i < tiers.length - 1) {
      // a walkway (praecinctio) and the low wall (balteus) behind it
      s += 0.03;
      pts.push([s, y]);
      y += 0.8;
      pts.push([s, y]);
    }
  });
  pts.push([1, y]);
  return pts;
}

const PROFILE = caveaProfile();

/** Height of the seating at ring s (the top of the step there). */
function caveaY(s: number): number {
  let y = PODIUM;
  for (const [ps, py] of PROFILE) if (ps <= s + 1e-6) y = py;
  return y;
}

/** The two straight passage walls of an axial entrance (bay 6 at +X, bay 18 at -X). */
const PASSAGE_HALF = 1.55;

/** The axial entrances at +X and -X (bays 6 and 18). */
const GATE_BAYS = [N / 4, (3 * N) / 4];
const isGatePier = (k: number) => GATE_BAYS.some((g) => k === g || k === g + 1);

/**
 * The Roman fabric that the houses of the Middle Ages were built into, laid out the same way in
 * both stages so that it stays where it is when the houses arrive: the step the outer wall stands
 * on, the cornice over the ground-storey arcade, the arena floor, the podium wall round the arena
 * in runs between the bays where it is later cut through, and the radial walls under the seats.
 */
export const PODIUM_RUNS: [number, number][] = [[1, 5], [8, 12], [13, 17], [20, 24], [0, 1], [12, 13]];

export function romanPlinth(b: Builder, color: number): void {
  ringBand(b, [[0.99, 0], [1.03, 0], [1.03, 0.22], [1, 0.22]], color); // the step it stands on
}

export function groundBelt(b: Builder, color: number): void {
  arcadeBelt(b, STOREY_Y[1] - 0.55, 0.55, color);
}

export function arenaFloor(b: Builder, color: number): void {
  ringDisc(b, 0, 0.03, color);
}

/** The podium wall: every run, or the first `n` of PODIUM_RUNS. */
export function romanPodium(b: Builder, color: number, n = PODIUM_RUNS.length): void {
  for (const [k0, k1] of PODIUM_RUNS.slice(0, n)) ringBand(b, [[0, 0], [0, PODIUM]], color, { k0, k1 });
}

/** The bays the podium wall runs along. */
export function hasPodium(k: number): boolean {
  const i = ((k % N) + N) % N;
  return PODIUM_RUNS.some(([a, c]) => i >= a && i < c);
}

export function radialWalls(b: Builder, color: number): void {
  for (let k = 0; k < N; k++) {
    if (isGatePier(k)) continue;
    thickWall(b, vert(k, 0.02), vert(k, 0.75), 0.7, (u) => caveaY(0.02 + u * 0.73) - 1.3, color, 5);
  }
}

export const amphitheatre: BuildingDef = {
  id: 'amphitheatre',
  name: 'Amphitheatre',
  style: 'Roman Imperial',
  date: 'c. AD 70',
  summary:
    'The tomb mound has long been levelled, and on the edge of the Roman town a rich citizen, or the town council, has paid for an amphitheatre for gladiator fights and wild-beast hunts. ' +
    'It is a theatre turned into a full oval, so that everyone looks down on the arena. The seats rest on radial walls and vaults of concrete, which leave passages beneath ' +
    'for the crowd to reach every part of the stands, and the outer wall is a stack of arcades framed by half-columns: Tuscan below, Ionic above, Corinthian at the top, the scheme of the Colosseum. ' +
    'This one is about 38 m by 32 m; the Colosseum is five times as long.',
  materials: ['travertine', 'concrete faced with brick', 'tufa', 'marble for the front seats', 'sand'],
  modelledOn: 'The Arena, Verona (c. AD 30), and the Colosseum, Rome (AD 70-80), much reduced',
  influences: ['roman-concrete', 'roman-empire-export'],
  lookFor: [
    {
      label: 'Arena',
      note: 'The oval floor of the fights, strewn with sand (Latin harena) to soak up blood. Its long axis carries the two main gates.',
      at: [0, 0.6, 0],
    },
    {
      label: 'Arcades framed by half-columns',
      note: 'Each arch sits between engaged columns carrying a cornice: Tuscan on the ground storey, Ionic on the second, Corinthian on the third.',
      at: [0, 6.6, 16.5],
    },
    {
      label: 'Cavea in three tiers',
      note: 'The seating, split by walkways and low walls into tiers (maeniana) by rank: magistrates at the front, men of the town above, the poor and women at the top.',
      at: [-6.0, 8.6, -7.0],
    },
    {
      label: 'Vomitoria',
      note: 'The doorways where stairs come up through the seats, built to fill and empty the stands quickly.',
      at: [ringPt(4.5, 0.4)[0], 6.6, ringPt(4.5, 0.4)[1]],
    },
    {
      label: 'Radial walls and vaults',
      note: 'The seats stand on walls radiating from the arena, roofed with sloping vaults; between them run the passages and stairs. Seen best through the arches.',
      at: [bayFrame(9, 1).x * 0.85, 2.0, bayFrame(9, 1).z * 0.85],
    },
  ],
  build(b) {
    const trav = tint(P.travertine, b.range(-0.03, 0.01));
    const travDark = tint(trav, -0.07);
    const seats = tint(P.travertine, -0.04);
    const marble = tint(P.marble, -0.02);
    const sand = tint(P.sand, 0.02);
    const gateBays = GATE_BAYS; // 6 and 18: the axial entrances at +X and -X

    // ------------------------------------------------ outer wall: three arcaded storeys and their orders
    for (let k = 0; k < N; k++) {
      for (let j = 0; j < 3; j++) {
        arcadeBay(b, k, j, trav);
        arcadeOrder(b, k, j, trav);
      }
    }
    romanPlinth(b, travDark);
    groundBelt(b, travDark);
    arcadeBelt(b, STOREY_Y[2] - 0.55, 0.55, travDark);
    arcadeBelt(b, STOREY_Y[3] - 0.55, 0.65, travDark, 0.045);
    // upper floors of the ambulatory behind the arcades
    for (const y of [STOREY_Y[1] - 0.25, STOREY_Y[2] - 0.25]) {
      ringBand(b, [[0.76, y], [0.92, y], [0.92, y + 0.25], [0.76, y + 0.25]], tint(trav, -0.12));
    }

    // ------------------------------------------------ the cavea
    ringBand(b, PROFILE, seats);
    // front row of marble seats for the magistrates, and the parapet on the podium
    ringBand(b, [[0.012, PODIUM], [0.012, PODIUM + 0.85], [-0.012, PODIUM + 0.85], [-0.012, PODIUM]], marble);
    // the walkways in a darker stone
    for (let i = 0; i < PROFILE.length - 1; i++) {
      const [s0, y0] = PROFILE[i];
      const [s1, y1] = PROFILE[i + 1];
      if (y0 === y1 && s1 - s0 > 0.025 && s1 - s0 < 0.2) ringBand(b, [[s0, y0 + 0.02], [s1, y1 + 0.02]], travDark);
    }

    // vomitoria: doorways where stairs come up through the seats
    for (const [s, kOff] of [[0.36, 1.5], [0.64, 0.5]] as Pt[]) {
      for (let k = kOff; k < N; k += 4) {
        if (gateBays.some((g) => Math.abs(k - (g + 0.5)) < 1)) continue;
        const [x, z] = ringPt(k, s + 0.03);
        const outward = bayFrame(Math.floor(k), s).ang;
        const y = caveaY(s + 0.02);
        b.box(1.7, 1.3, 1.2, travDark, { at: [x, y - 0.5, z], rotY: outward });
        b.panel(1.1, 0.75, P.windowDark, {
          at: [x - Math.sin(outward) * 0.6, y - 0.45, z - Math.cos(outward) * 0.6],
          facing: outward + Math.PI,
        });
      }
    }

    // ------------------------------------------------ podium wall round the arena, broken by the two gates
    romanPodium(b, marble);
    arenaFloor(b, sand);
    for (const g of gateBays) {
      const p0 = vert(g - 1, 0);
      const p1 = vert(g + 2, 0);
      const mx = (p0[0] + p1[0]) / 2;
      const mz = (p0[1] + p1[1]) / 2;
      const w = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const out = Math.sign(mx);
      // the gate front, facing the arena
      b.archWall(w + 0.3, PODIUM, 0.8, marble, {
        at: [mx + out * 0.4, 0, mz],
        facing: out > 0 ? -Math.PI / 2 : Math.PI / 2,
        openings: 1,
        openW: 2.9,
        openH: 3.0,
      });
      // straight passage walls from the gate to the outer arch, under the seats
      const x0 = mx + out * 0.8;
      const x1 = out * 18.6;
      for (const sz of [-1, 1]) {
        thickWall(
          b,
          [x0, sz * PASSAGE_HALF],
          [x1, sz * PASSAGE_HALF],
          0.6,
          (u) => caveaY(Math.min(0.9, u * 0.9)) - 0.75,
          travDark,
          6,
        );
      }
    }

    // ------------------------------------------------ radial walls carrying the seats
    radialWalls(b, tint(P.brickOrange, -0.05));

    // ------------------------------------------------ boxes of honour on the short axis
    for (const side of [1, -1]) {
      const [x, z] = vert(side > 0 ? 0.5 : N / 2 + 0.5, 0.05);
      const ang = side > 0 ? 0 : Math.PI;
      b.group({ at: [x, PODIUM, z], rotY: ang }, () => {
        b.box(3.6, 0.3, 1.4, marble);
        b.sym((s) => b.cyl(0.12, 1.7, marble, { at: [s * 1.5, 0.3, -0.5], segs: 5 }));
        b.sym((s) => b.cyl(0.12, 1.7, marble, { at: [s * 1.5, 0.3, 0.45], segs: 5 }));
        b.box(3.8, 0.25, 1.6, marble, { at: [0, 2.0, 0] });
        b.gable(3.8, 1.6, 0.6, P.coppi, { at: [0, 2.25, 0], ridge: 'z', wall: marble });
      });
    }

    // pines outside
    b.tree(8.5, { at: [-18.4, 0, 15.2], kind: 'cypress' });
    b.tree(7.5, { at: [-17.2, 0, 16.4], kind: 'cypress' });
    b.tree(8, { at: [18.4, 0, -15.2], kind: 'cypress' });

    // ------------------------------------------------ walk collisions: piers, radial walls, podium, passages
    for (let k = 0; k < N; k++) {
      const p = pierFrame(k, 1);
      const bw = bayFrame(k, 1).w;
      b.collider(bw - 2.7, 1.1, { at: [p.x - Math.sin(p.ang) * 0.5, 0, p.z - Math.cos(p.ang) * 0.5], rotY: p.ang });
      if (isGatePier(k)) continue;
      const a = vert(k, 0.02);
      const c = vert(k, 0.75);
      b.collider(0.7, Math.hypot(c[0] - a[0], c[1] - a[1]), {
        at: [(a[0] + c[0]) / 2, 0, (a[1] + c[1]) / 2],
        rotY: Math.atan2(c[0] - a[0], c[1] - a[1]),
      });
    }
    for (let k = 0; k < N; k++) {
      if (gateBays.some((g) => k >= g - 1 && k <= g + 1)) continue;
      const f = bayFrame(k, 0);
      b.collider(f.w + 0.2, 0.6, { at: [f.x, 0, f.z], rotY: f.ang });
    }
    for (const g of gateBays) {
      const out = g === N / 4 ? 1 : -1;
      const [gx] = vert(g + 0.5, 0);
      for (const sz of [-1, 1]) {
        b.collider(1.6, 0.8, { at: [gx + out * 0.4, 0, sz * 2.3], rotY: Math.PI / 2 });
        b.collider(19 - Math.abs(gx), 0.6, { at: [out * (Math.abs(gx) + 19) / 2, 0, sz * PASSAGE_HALF] });
      }
    }
  },
};
