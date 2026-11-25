import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { N, STOREY_Y, arcadeBay, arcadeOrder, bayFrame, blockedBay, ringBand, ringPt, strip, vert } from './shared';
import { PODIUM, arenaFloor, groundBelt, hasPodium, radialWalls, romanPlinth, romanPodium } from './02-amphitheatre';

/** Bays left open at ground level as passages into the old arena: front, the two ends and the back. */
const PASSAGES = [0, N / 4, N / 2, (3 * N) / 4];

/** House sectors round the ring, as [first bay, bay after last]. Passage bays are sectors of their own. */
const SECTORS: [number, number][] = [
  [0, 1], [1, 3], [3, 4], [4, 6],
  [6, 7], [7, 9], [9, 11], [11, 12],
  [12, 13], [13, 15], [15, 16], [16, 18],
  [18, 19], [19, 21], [21, 22], [22, 24],
];

/** The revision: the yard cleared of gardens and sheds and paved as a public square (Lucca, 1830). */
const PIAZZA = 1830;

/** Floor levels of the houses above the Roman ground storey. */
const FLOORS = [STOREY_Y[1], 7.9, 11.0];

/** One house of the ring: walls on the old seating, a pitched roof of coppi with its ridge along the oval. */
function house(b: Builder, k0: number, k1: number, eaves: number, wall: number, roof: number, passage: boolean): void {
  const ridge = eaves + 1.9;
  const y0 = passage ? STOREY_Y[1] : 0;
  // the face on the piazza and the face on the street
  // (over the Roman podium wall where it still stands)
  for (let k = k0; k < k1; k++) ringBand(b, [[0, !passage && hasPodium(k) ? PODIUM : y0], [0, eaves]], wall, { k0: k, k1: k + 1 });
  ringBand(b, [[1, STOREY_Y[1] - 0.4], [1, eaves]], wall, { k0, k1 });
  if (passage) ringBand(b, [[0, y0], [1, y0]], tint(wall, -0.2), { k0, k1 }); // the vault over the passage
  // end walls, with the gable to the ridge
  for (const k of [k0, k1]) {
    const a = vert(k, -0.01);
    const m = vert(k, 0.5);
    const c = vert(k, 1.01);
    strip(b, [[a[0], a[1], 0, eaves], [m[0], m[1], 0, ridge], [c[0], c[1], 0, eaves]], tint(wall, -0.06));
  }
  // the roof, oversailing both faces a little
  ringBand(b, [[-0.035, eaves - 0.12], [0.5, ridge], [1.045, eaves - 0.12]], roof, { k0, k1 });
  ringBand(b, [[-0.035, eaves - 0.12], [-0.035, eaves], [0.5, ridge + 0.12], [1.045, eaves], [1.045, eaves - 0.12]], tint(roof, -0.12), {
    k0,
    k1,
  });
}

export const arenaHouses: BuildingDef = {
  id: 'arena-houses',
  name: 'Houses in the amphitheatre',
  style: 'Medieval vernacular in Roman ruins',
  date: 'c. 1000 onward',
  summary:
    'After the shows ended the amphitheatre was quarried for stone and lime, but its vaults and arches were too useful to pull down. ' +
    'From the early Middle Ages people built houses on the stumps of the seating and into the outer arcade, walling up the arches with brick and rubble and raising their fronts on the low wall round the arena, until the ruin became a ring of houses round an oval yard of gardens. ' +
    'A family of the commune turned part of it into a fortified tower. Streets inside and outside still follow the curve of the Roman walls, and the old gates are passages under the houses.',
  materials: ['reused travertine and Roman brick', 'rubble stone', 'lime plaster', 'timber floors', 'coppi roof tiles'],
  revisions: [{ year: PIAZZA, note: 'In 1830 the gardens, sheds and shacks in the oval were cleared away and it was paved as a public square, as Lorenzo Nottolini did at Lucca.' }],
  modelledOn:
    "Piazza dell'Anfiteatro, Lucca (houses on the Roman amphitheatre, the arena cleared as a piazza by Lorenzo Nottolini in 1830); the tower recalls the Frangipani fortress in the Colosseum",
  lookFor: [
    {
      label: 'Walled-up Roman arches',
      note: 'The ground storey of the old arcade, its arches filled with brick and rubble and pierced with doors and windows for the houses behind.',
      at: [bayFrame(2, 1).x, 2.4, bayFrame(2, 1).z + 0.3],
    },
    {
      label: 'Ring of houses',
      note: 'Each house stands on a slice of the old seating, so together they keep the exact oval of the amphitheatre.',
      at: [bayFrame(20, 0.5).x, 13.5, bayFrame(20, 0.5).z],
    },
    {
      label: 'Garden in the arena',
      note: 'The arena is a shared yard of vegetable plots, fruit trees and a well. In Lucca it filled up with small buildings and was cleared as a public piazza only in 1830.',
      at: [-3.5, 1.2, 0.5],
    },
    {
      label: 'Tower house',
      note: 'A family tower (casa-torre) raised on the ruin, a stronghold in the feuds between the leading families of the commune.',
      at: [ringPt(10, 0.5)[0], 22.5, ringPt(10, 0.5)[1]],
    },
    {
      label: 'Passage through the ring',
      note: 'Where the Roman entrances were, vaulted passages under the houses lead into the oval.',
      at: [vert(0.5, 1)[0], 2.0, vert(0.5, 1)[1] + 0.6],
    },
  ],
  build(b) {
    const trav = tint(P.travertine, -0.1);
    const walls = [P.intonacoOchre, P.intonacoCream, P.intonacoRose, P.pietraForte, P.intonacoSienna, tint(P.tufa, 0.05)];
    const fills = [mix(P.brickOrange, P.rubble, 0.35), mix(P.rubble, P.tufa, 0.4), mix(P.cotto, P.rubble, 0.3), P.rubble];
    const roof = tint(P.coppi, b.range(-0.03, 0.02));
    const shutter = b.pick([P.doorGreen, tint(P.doorGreen, 0.06), P.oak]);

    // ------------------------------------------------ the Roman ground storey, its arches walled up
    for (let k = 0; k < N; k++) {
      if (PASSAGES.includes(k)) arcadeBay(b, k, 0, trav);
      else blockedBay(b, k, 0, trav, b.pick(fills));
      if (k % 2 === 0 || b.chance(0.4)) arcadeOrder(b, k, 0, trav);
      if (!PASSAGES.includes(k)) {
        const f = bayFrame(k, 1);
        // a door or a little window in the infill
        if (k % 3 === 1) b.panel(1.0, 2.1, P.oakDark, { at: [f.x - Math.sin(f.ang) * 0.12, 0.05, f.z - Math.cos(f.ang) * 0.12], facing: f.ang, depth: 0.12 });
        else b.window(0.6, 0.8, { at: [f.x - Math.sin(f.ang) * 0.12, 2.1, f.z - Math.cos(f.ang) * 0.12], facing: f.ang, frame: P.travertine });
      }
    }
    romanPlinth(b, tint(trav, -0.05));
    groundBelt(b, tint(trav, -0.05));
    // the podium wall round the arena, cut through where the passages come in, and the radial
    // walls of the seating, now the party walls and cellars of the houses
    romanPodium(b, tint(P.marble, -0.12), 4);
    radialWalls(b, tint(P.brickOrange, -0.05));

    // ------------------------------------------------ the houses
    SECTORS.forEach(([k0, k1], i) => {
      const passage = PASSAGES.includes(k0) && k1 - k0 === 1;
      const eaves = passage ? 10.8 : b.pick([10.6, 12.0, 13.4, 12.0]);
      const wall = tint(walls[(i * 5 + b.variant) % walls.length], b.range(-0.03, 0.03));
      house(b, k0, k1, eaves, wall, roof, passage);
      const storeys = FLOORS.filter((y) => y + 2.4 < eaves);
      for (let k = k0; k < k1; k++) {
        // piazza side: a door or shop arch below, a window on each floor
        const fi = bayFrame(k, 0);
        const inA = fi.ang + Math.PI;
        const ix = fi.x - Math.sin(fi.ang) * 0.02;
        const iz = fi.z - Math.cos(fi.ang) * 0.02;
        if (!passage) {
          if (k % 2) b.panel(1.2, 2.6, P.oakDark, { at: [ix, 0, iz], facing: inA, shape: 'round' });
          else b.window(0.7, 1.0, { at: [ix, 1.6, iz], facing: inA, frame: P.travertine });
        }
        for (const y of storeys) {
          b.window(0.72, 1.35, { at: [ix, y + 0.9, iz], facing: inA, frame: tint(P.travertine, 0.03) });
          if ((k + i) % 3 === 0) b.panel(1.5, 1.35, shutter, { at: [ix, y + 0.9, iz], facing: inA, depth: 0.03 });
        }
        // street side: two windows a floor
        for (const f of [0.3, 0.7]) {
          const [x, z] = ringPt(k + f, 1);
          const ang = bayFrame(k, 1).ang;
          for (const y of storeys) {
            b.panel(0.75, 1.35, P.windowDark, { at: [x, y + 0.9, z], facing: ang, depth: 0.04 });
          }
        }
      }
    });

    // ------------------------------------------------ the tower house on the back of the ring
    {
      const [tx, tz] = ringPt(10, 0.5);
      const ang = bayFrame(9.5, 0.5).ang;
      const stone = tint(P.pietraForte, -0.04);
      const H = 22;
      b.group({ at: [tx, 0, tz], rotY: ang }, () => {
        b.box(5.4, H, 5.4, stone);
        b.box(5.8, 0.3, 5.8, tint(stone, -0.08), { at: [0, H, 0] });
        b.crenel(5.8, 5.8, stone, { at: [0, H + 0.3, 0], merlonW: 0.7, merlonH: 1.0, t: 0.45 });
        for (const face of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
          b.group({ rotY: face }, () => {
            // putlog holes for scaffolding beams, and small windows
            for (let y = 14.5; y < H - 1; y += 2.4) for (const x of [-1.8, 0, 1.8]) b.panel(0.22, 0.22, P.windowDark, { at: [x, y, 2.7] });
            b.window(0.7, 1.5, { at: [0, 15.6, 2.7], shape: 'round', frame: tint(stone, 0.06) });
            b.window(0.7, 1.5, { at: [0, 19.2, 2.7], shape: 'round', frame: tint(stone, 0.06) });
          });
        }
        // a timber gallery hung on beams from the piazza face
        b.box(5.0, 0.18, 1.1, P.oak, { at: [0, 16.8, -3.25] });
        b.box(5.0, 0.9, 0.08, P.oakDark, { at: [0, 16.98, -3.76] });
        for (const x of [-2.2, 0, 2.2]) b.beam([x, 15.6, -2.75], [x, 16.8, -3.7], 0.14, 0.14, P.oakDark);
        b.shed(5.2, 1.3, 0.6, roof, { at: [0, 18.0, -3.3], high: '+z' });
      });
    }

    // ------------------------------------------------ the garden in the arena (built last: in 1830 it is cleared and paved)
    const piazza = b.since(PIAZZA);
    arenaFloor(b, piazza ? mix(P.paving, P.pietraSerena, 0.4) : tint(P.earth, 0.04));
    ringBand(b, [[0.0, 0.04], [0.09, 0.04]], P.gravel, { k0: 0, k1: N });
    if (!piazza) {
      const beds: [number, number, number, number][] = [
        [-4.6, -1.6, 4.2, 2.0],
        [-4.6, 1.6, 4.2, 2.0],
        [1.0, -2.0, 3.2, 1.8],
        [4.4, 1.2, 2.6, 1.8],
      ];
      for (const [x, z, w, d] of beds) {
        b.box(w, 0.18, d, P.soil, { at: [x, 0.02, z] });
        for (let r = 0; r < 3; r++) b.box(w - 0.4, 0.2, 0.2, b.pick([P.leaf, P.hedge, P.crop]), { at: [x, 0.2, z - d / 2 + 0.45 + r * ((d - 0.9) / 2)] });
      }
      // a well
      b.cyl(0.75, 0.9, P.rubble, { at: [1.6, 0, 1.8], segs: 10 });
      b.sym((s) => b.box(0.12, 1.9, 0.12, P.oakDark, { at: [1.6 + s * 0.6, 0.9, 1.8] }));
      b.box(1.5, 0.12, 0.12, P.oakDark, { at: [1.6, 2.7, 1.8] });
      // fruit trees and a lean-to shed against the ring
      b.tree(4.0, { at: [-1.2, 0, -3.6], kind: 'olive' });
      b.tree(3.6, { at: [6.4, 0, -1.4], kind: 'round', color: P.leafDark });
      b.tree(3.2, { at: [-6.8, 0, 2.8], kind: 'olive' });
      const f = bayFrame(15, 0);
      b.group({ at: [f.x - Math.sin(f.ang) * 1.0, 0, f.z - Math.cos(f.ang) * 1.0], rotY: f.ang + Math.PI }, () => {
        b.box(2.2, 2.0, 1.8, P.oak);
        b.shed(2.6, 2.2, 0.8, roof, { at: [0, 2.0, 0], high: '-z' });
      });
    }

    // ------------------------------------------------ walk collisions: the ring, leaving the passages open
    for (let k = 0; k < N; k++) {
      if (PASSAGES.includes(k)) continue;
      for (const [s0, s1] of [[0, 0.34], [0.34, 0.67], [0.67, 1]]) {
        const a = ringPt(k + 0.5, s0);
        const c = ringPt(k + 0.5, s1);
        const w = bayFrame(k, s0).w;
        b.collider(w, Math.hypot(c[0] - a[0], c[1] - a[1]), { at: [(a[0] + c[0]) / 2, 0, (a[1] + c[1]) / 2], rotY: bayFrame(k, (s0 + s1) / 2).ang });
      }
    }
    if (!piazza) b.collider(0.5, 0.5, { at: [1.6, 0, 1.8] });
  },
};
