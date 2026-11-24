import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { latheCap, polar, statue, type Pt } from './shared';

// Plan: an oval arena centred on (0, CZ), squashed in Z by SZ, so its long axis runs along X.
// The cavea wraps round it from -HALF to +HALF (0 = +Z), broken by the two axial gates at +-X;
// the stage building closes the open side at -Z.
const CZ = 0.1;
const SZ = 0.9;
const R_ARENA = 7.6;
const PODIUM = 2.4;
const R_OUT = 19.2;
const WALL_TOP = 9.8;
const HALF = (112 * Math.PI) / 180;
const GATE = Math.PI / 2;
const GAP = (6.5 * Math.PI) / 180;

/** The stepped section of the seating, [r, y], from the podium walkway to the top. */
function seatProfile(): Pt[] {
  const pts: Pt[] = [[R_ARENA, PODIUM], [8.2, PODIUM]];
  let r = 8.2;
  let y = PODIUM;
  for (let i = 0; i < 7; i++) {
    y += 0.42;
    pts.push([r, y]);
    r += 0.7;
    pts.push([r, y]);
  }
  // the walkway (praecinctio) and the low wall behind it
  r += 0.5;
  pts.push([r, y]);
  y += 0.7;
  pts.push([r, y]);
  for (let i = 0; i < 6; i++) {
    y += 0.42;
    pts.push([r, y]);
    r += 0.7;
    pts.push([r, y]);
  }
  pts.push([18.6, y]);
  return pts;
}
const SEATS = seatProfile();
const TOP_Y = SEATS[SEATS.length - 1][1];
/** The pieces of the cavea between the gates, as [start, sweep]. */
const PIECES: [number, number][] = [
  [-HALF, HALF - GATE - GAP],
  [-GATE + GAP, 2 * (GATE - GAP)],
  [GATE + GAP, HALF - GATE - GAP],
];

/** Height of the seats at radius r. */
function seatY(r: number): number {
  let y = PODIUM;
  for (const [pr, py] of SEATS) if (pr <= r + 1e-6) y = py;
  return y;
}

const C: [number, number, number] = [0, 0, CZ];
const at = (r: number, a: number, y: number): [number, number, number] => {
  const [x, z] = polar(r, a, [0, CZ], SZ);
  return [x, y, z];
};

export const theatreAmphitheatre: BuildingDef = {
  id: 'theatre-amphitheatre',
  name: 'Theatre-amphitheatre',
  style: 'Gallo-Roman',
  date: 'c. AD 80',
  summary:
    'The Roman town gives itself a place for shows in a form found almost only in Gaul: half theatre, half amphitheatre. ' +
    'Tiers of stone seats wrap round most of an oval arena, where gladiators and wild beasts could fight, while on the open side a stage building with a raised platform served for plays, mimes and the festivals of the gods. ' +
    'It was cheaper than a full amphitheatre: instead of vaults, the seats are laid on a bank of earth held in by walls of small squared stone laced with courses of brick. ' +
    'Nothing like it stood here before: the Gauls had held their gatherings in the open.',
  materials: ['limestone in small squared blocks (petit appareil)', 'courses of flat brick', 'earth fill', 'stone seats', 'sand', 'clay roof tiles'],
  modelledOn:
    'The Arènes de Lutèce, Paris (probably late 1st century AD; its stones were later reused in the wall of the Île de la Cité), whose stage cut into one long side of the arena, and the amphitheatre of Grand, Vosges (about AD 80); ' +
    'reduced to roughly a third of their size. The plan is taken from them; the outer wall and the stage front are generic.',
  influences: ['roman-conquest'],
  lookFor: [
    {
      label: 'Arena',
      note: 'The oval floor of sand (Latin harena) for fights, hunts and processions. Its long axis carries two gates.',
      at: [3, 0.5, CZ],
    },
    {
      label: 'Stage building (scaena)',
      note: 'A raised stage (pulpitum) in front of a tall wall with three doors and a row of niches, perhaps for statues. It cuts into the arena on one side, which is what makes the building a hybrid.',
      at: [0, 4.6, -8.2],
    },
    {
      label: 'Cavea on an earth bank',
      note: 'The seating: stone benches laid on an earth fill held in by walls, split by a walkway (praecinctio) halfway up. The best places faced the stage.',
      at: at(14.4, 0.35, 6.6),
    },
    {
      label: 'Petit appareil with brick courses',
      note: 'The usual Gallo-Roman wall: a face of small squared limestone blocks with bands of flat brick every metre or two, round a core of rubble and mortar.',
      at: at(R_OUT + 0.2, -0.25, 4.6),
    },
    {
      label: 'Vomitoria',
      note: 'Doorways in the outer wall leading to passages and stairs that come out among the seats, so a crowd of thousands could get in and out quickly.',
      at: at(R_OUT + 0.2, (40 * Math.PI) / 180, 1.6),
    },
  ],
  build(b) {
    const stone = tint(P.pierreBlonde, b.range(-0.04, 0.0));
    const seats = mix(P.craie, P.pierreBlonde, 0.6);
    const wall = mix(P.limestoneWarm, P.pierreBlonde, 0.5);
    const brick = tint(P.romanTile, -0.06);
    const dark = P.windowDark;
    const sand = tint(P.sand, 0.02);
    const tile = tint(P.romanTile, b.range(-0.03, 0.02));

    // ------------------------------------------------ the cavea: seats, outer wall, podium, in three pieces between the gates
    b.group({ at: C, scale: [1, 1, SZ] }, () => {
      for (const [start, sweep] of PIECES) {
        const segs = Math.max(4, Math.round(sweep / ((6 * Math.PI) / 180)));
        b.lathe(SEATS, seats, { start, sweep, segs, jitter: false });
        b.lathe([[18.6, TOP_Y], [18.6, WALL_TOP], [R_OUT, WALL_TOP], [R_OUT, 0]], wall, { start, sweep, segs, jitter: false });
        b.lathe([[R_ARENA, 0], [R_ARENA, PODIUM]], stone, { start, sweep, segs, jitter: false });
        // courses of brick on the outer face
        for (const y of [1.9, 4.5, 7.1]) {
          b.lathe([[R_OUT + 0.04, y], [R_OUT + 0.04, y + 0.32]], brick, { start, sweep, segs, jitter: false });
        }
        // the coping on the podium
        b.lathe([[R_ARENA - 0.12, PODIUM], [R_ARENA - 0.12, PODIUM + 0.18], [R_ARENA + 0.3, PODIUM + 0.18]], tint(stone, 0.04), {
          start,
          sweep,
          segs,
          jitter: false,
        });
      }
      // arena floor
      b.lathe([[0, 0.03], [R_ARENA, 0.03]], sand, { segs: 36, jitter: false });
    });
    // the cut ends of the cavea: at the stage and either side of the two gate passages
    const cap: Pt[] = [[R_ARENA, 0], ...SEATS, [18.6, WALL_TOP], [R_OUT, WALL_TOP], [R_OUT, 0]];
    for (const a of [HALF, -HALF, GATE - GAP, GATE + GAP, -GATE - GAP, -GATE + GAP]) latheCap(b, cap, a, wall, C, SZ);

    // buttress pilasters round the outer wall
    for (let deg = -104; deg <= 104; deg += 13) {
      const a = (deg * Math.PI) / 180;
      if (Math.abs(Math.abs(a) - GATE) < GAP + 0.05) continue;
      b.box(0.8, WALL_TOP - 0.2, 0.36, tint(wall, 0.03), { at: at(R_OUT + 0.14, a, 0), rotY: a });
    }
    // vomitoria: doors in the outer wall and their mouths among the seats
    for (const deg of [-78, -52, -26, 0, 26, 52, 78]) {
      const a = ((deg + 6.5) * Math.PI) / 180;
      b.panel(1.5, 2.5, dark, { at: at(R_OUT + 0.02, a, 0), facing: a, shape: 'round' });
      b.panel(1.9, 0.3, tint(stone, -0.05), { at: at(R_OUT + 0.02, a, 2.5), facing: a, depth: 0.12 });
      const yv = seatY(13.6);
      b.box(1.6, 1.0, 1.0, tint(seats, -0.08), { at: at(13.85, a, yv - 0.1), rotY: a });
      b.panel(1.1, 0.75, dark, { at: at(13.33, a, yv - 0.05), facing: a + Math.PI });
    }
    // small doors in the podium wall, onto the arena
    for (const deg of [-62, -32, 32, 62]) {
      const a = (deg * Math.PI) / 180;
      b.panel(1.1, 1.9, dark, { at: at(R_ARENA - 0.03, a, 0), facing: a + Math.PI, shape: 'round' });
    }

    // ------------------------------------------------ the two gates on the long axis
    b.sym((s) => {
      const a = s * GATE;
      const [gx, , gz] = at(R_OUT - 0.35, a, 0);
      b.archWall(4.9, WALL_TOP, 0.7, wall, { at: [gx, 0, gz], facing: s > 0 ? '+x' : '-x', openings: 1, openW: 2.9, openH: 4.6 });
      b.box(5.1, 0.32, 0.8, brick, { at: [gx + s * 0.05, 5.4, gz], rotY: Math.PI / 2 });
      b.box(5.2, 0.4, 0.9, tint(stone, 0.03), { at: [gx, WALL_TOP - 0.2, gz], rotY: Math.PI / 2 });
      // the passage floor
      b.box(R_OUT - R_ARENA, 0.05, 3.0, sand, { at: [s * (R_OUT + R_ARENA) / 2, 0, CZ] });
    });

    // ------------------------------------------------ the stage building
    const PF = -5.4; // front of the stage
    const FR = -8.4; // stage front wall
    const BK = -14.2;
    const SH = 7.6;
    // stage platform (pulpitum) with its front of alternating niches
    b.box(14, 1.3, FR - PF + 0.0, stone, { at: [0, 0, (PF + FR) / 2] });
    b.box(14.2, 0.12, -(FR - PF) + 0.2, tint(P.oak, 0.05), { at: [0, 1.3, (PF + FR) / 2] }); // boards
    for (let i = 0; i < 7; i++) {
      const x = -6 + i * 2;
      b.panel(0.9, 0.85, tint(stone, -0.12), { at: [x, 0.2, PF], shape: i % 2 ? 'round' : 'rect', depth: 0.04 });
    }
    b.sym((s) => b.stairs(1.4, 1.3, 1.6, 5, stone, { at: [s * 7.8, 0, PF - 1.0], rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 }));
    // the stage front wall (scaenae frons): three doors and nine niches
    b.box(19, SH, 0.9, wall, { at: [0, 0, FR - 0.45] });
    for (const y of [2.2, 5.0]) b.panel(19, 0.3, brick, { at: [0, y, FR], depth: 0.04 });
    b.panel(19.4, 0.4, tint(stone, 0.04), { at: [0, SH - 0.4, FR], depth: 0.18 });
    b.panel(2.0, 3.4, P.doorBlack, { at: [0, 1.3, FR], shape: 'round' }); // the royal door
    b.panel(2.6, 0.35, tint(stone, 0.04), { at: [0, 4.7, FR], depth: 0.14 });
    b.sym((s) => b.panel(1.4, 2.7, P.doorBlack, { at: [s * 4.6, 1.3, FR], shape: 'round' }));
    const niches = [-8.2, -6.4, -2.3, 2.3, 6.4, 8.2];
    for (const x of niches) b.panel(1.1, 2.2, tint(stone, -0.14), { at: [x, 2.0, FR], shape: 'round', depth: 0.03 });
    for (const x of [-4.6, 0, 4.6]) b.panel(1.1, 1.6, tint(stone, -0.14), { at: [x, 5.5, FR], shape: 'round', depth: 0.03 });
    for (const x of [-6.4, 6.4, 0]) statue(b, [x, x === 0 ? 5.55 : 2.05, FR + 0.25], x === 0 ? 1.4 : 1.8, tint(P.marble, -0.05));
    // backstage hall and the two side wings (parascaenia)
    b.box(19, SH, -(BK - FR) - 0.9, wall, { at: [0, 0, (FR - 0.9 + BK) / 2] });
    b.gable(19, -(BK - FR), 2.3, tile, { at: [0, SH, (FR + BK) / 2], overhang: 0.35, wall });
    b.sym((s) => {
      b.box(3.4, 6.0, -(BK - FR), wall, { at: [s * 11.2, 0, (FR + BK) / 2] });
      b.gable(3.4, -(BK - FR), 1.5, tile, { at: [s * 11.2, 6.0, (FR + BK) / 2], ridge: 'z', overhang: 0.3, wall });
      b.panel(1.3, 2.3, P.doorBlack, { at: [s * 11.2, 0, FR], shape: 'round' });
      b.panel(3.4, 0.3, brick, { at: [s * 11.2, 2.8, FR], depth: 0.04 });
      for (const z of [-10.2, -12.6]) b.window(0.7, 1.1, { at: [s * 9.5, 4.9, z], facing: s > 0 ? '+x' : '-x', frame: stone });
    });
    for (const x of [-6, -2, 2, 6]) b.window(0.8, 1.2, { at: [x, 5.0, BK], facing: '-z', frame: stone });
    b.panel(1.8, 2.6, P.doorBlack, { at: [0, 0, BK], facing: '-z', shape: 'round' });
    for (const y of [2.2, 5.0]) b.panel(19, 0.3, brick, { at: [0, y, BK], facing: '-z', depth: 0.04 });

    // a couple of trees outside
    b.tree(7, { at: [-17.5, 0, -15.0], kind: 'round' });
    b.tree(6, { at: [17.0, 0, -15.6], kind: 'round' });

    // ------------------------------------------------ walk collisions: the cavea in sectors, the stage building
    for (const [start, sweep] of PIECES) {
      const n = Math.ceil(sweep / ((10 * Math.PI) / 180));
      const da = sweep / n;
      for (let i = 0; i < n; i++) {
        const ac = start + (i + 0.5) * da;
        const [x, , z] = at(13.4, ac, 0);
        b.collider(13.4 * da + 0.2, 11.6, { at: [x, 0, z], rotY: ac });
      }
    }
    b.collider(19, -(BK - PF), { at: [0, 0, (PF + BK) / 2] });
    b.sym((s) => b.collider(3.4, -(BK - FR), { at: [s * 11.2, 0, (FR + BK) / 2] }));
  },
};
