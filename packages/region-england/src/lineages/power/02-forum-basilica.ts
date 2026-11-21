import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { arcLathe, columns } from './shared';

/** Red tile bonding courses wrapped round a block: the stripes that mark Roman masonry in Britain. */
function bonding(b: Builder, w: number, d: number, h: number, at: [number, number, number]) {
  for (let y = 1.1; y < h - 0.6; y += 1.5) {
    b.box(w + 0.06, 0.18, d + 0.06, P.romanTile, { at: [at[0], at[1] + y, at[2]], jitter: false });
  }
}

export const forumBasilica: BuildingDef = {
  id: 'forum-basilica',
  name: 'Forum and basilica',
  style: 'Romano-British',
  date: 'c. AD 100',
  summary:
    'Rome governed Britain through self-run tribal towns, and every one needed a forum: an open square for the market, ringed by colonnaded ranges of shops and offices, ' +
    'with a basilica across the back where the town council met and the magistrates heard cases. ' +
    'It is built of mortared stone with tile courses and roofed in fired clay tiles, all techniques new to Britain. Where the chief once ruled from a roundhouse behind a palisade, ' +
    'power now sits in a public building designed to a standard plan from the Mediterranean.',
  materials: ['limestone and mortar', 'tile bonding courses', 'fired clay roof tiles', 'painted plaster'],
  lookFor: [
    { label: 'Pedimented entrance', note: 'A temple-like porch of four columns under a triangular pediment marks the way in from the street.', at: [0, 8.2, 21.2] },
    { label: 'Colonnade', note: 'Covered walks of columns line the courtyard, sheltering shoppers and officials from rain and sun.', at: [13, 3.5, 2] },
    { label: 'Basilica clerestory', note: 'The tall central nave rises above the lean-to aisle roofs, with a row of windows lighting the hall inside.', at: [6, 10.2, -11.2] },
    { label: 'Apse', note: 'A half-round end to the hall where the magistrate sat on a raised platform, the tribunal.', at: [20.4, 5, -14.5] },
    { label: 'Tile bonding courses', note: 'Bands of flat red tiles laid through the stone walls to level and strengthen them.', at: [-20.6, 2.7, 4] },
  ],
  modelledOn: 'Forums of Roman Britain such as Silchester (Calleva) and Wroxeter (Viroconium), much reduced',
  influences: ['roman-conquest'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.03, 0.02));
    const plaster = P.cream;
    const tile = P.romanTile;
    const col = P.limewash;

    // courtyard paving
    b.box(25, 0.06, 16, mix(P.paving, P.limestone, 0.4), { at: [0, 0, 2.5], jitter: false });

    // ---------------------------------------------------------- basilica across the back
    const BZ = -14.5; // centre line
    const NAVE = 6.4;
    const AISLE = 3.3;
    const L = 35; // between the apses
    const NH = 11; // nave wall height
    const AH = 6.4; // aisle wall height
    b.box(L, NH, NAVE, plaster, { at: [0, 0, BZ] });
    b.sym((s) => {
      const z = BZ + s * (NAVE / 2 + AISLE / 2);
      b.box(L, AH, AISLE, stone, { at: [0, 0, z] });
      bonding(b, L, AISLE, AH, [0, 0, z]);
      b.shed(L + 0.4, AISLE + 0.5, 1.4, tile, { at: [0, AH, z + s * 0.2], high: s > 0 ? '-z' : '+z' });
      // clerestory windows in the nave walls
      for (const x of spread(10, -L / 2, L / 2)) {
        b.window(1.1, 1.8, { at: [x, AH + 1.9, BZ + s * (NAVE / 2)], facing: s > 0 ? '+z' : '-z', shape: 'round', frame: plaster, glass: P.windowDark });
      }
    });
    b.gable(L + 0.2, NAVE, 1.6, tile, { at: [0, NH, BZ], overhang: 0.4 });
    // the apses at each end: half-round walls under half-cone roofs
    b.sym((s) => {
      const a0 = s > 0 ? -Math.PI / 2 : Math.PI / 2;
      arcLathe(b, [[NAVE / 2, 0], [NAVE / 2, NH - 2]], a0, a0 + Math.PI, 10, stone, { at: [(s * L) / 2, 0, BZ] });
      arcLathe(b, [[NAVE / 2 + 0.4, NH - 2.15], [0.01, NH - 0.5]], a0, a0 + Math.PI, 10, tile, { at: [(s * L) / 2, 0, BZ] });
      b.box(0.3, NH - 2, NAVE, stone, { at: [(s * (L + 0.3)) / 2, 0, BZ] });
      // aisle end walls
      b.box(0.4, AH, NAVE + AISLE * 2, stone, { at: [s * (L / 2 - 0.2), 0, BZ] });
      b.window(1.0, 1.6, { at: [s * (L / 2 + NAVE / 2) + 0.0, 4.5, BZ], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: plaster });
    });
    // basilica doors and windows on the courtyard side; small high windows on the back
    const bf = BZ + NAVE / 2 + AISLE;
    for (const x of spread(7, -L / 2, L / 2)) {
      if (Math.abs(x) < 3) b.panel(2.4, 4.2, P.oakDark, { at: [x, 0, bf], facing: '+z', shape: 'round' });
      else b.panel(1.6, 3, P.oakDark, { at: [x, 0, bf], facing: '+z', shape: 'round' });
      b.window(1, 1.4, { at: [x, 1.6, BZ - NAVE / 2 - AISLE], facing: '-z', shape: 'round', frame: plaster });
    }

    // ---------------------------------------------------------- portico in front of the basilica
    const PZ = bf + 1.6;
    columns(b, 9, 3, 0.26, 4.2, col, { at: [0, 0, PZ + 1.2], order: 'tuscan' });
    b.box(25.4, 0.45, 0.6, col, { at: [0, 4.2, PZ + 1.2] });
    b.shed(25.4, 3.3, 0.8, tile, { at: [0, 4.65, PZ - 0.2], high: '-z' });

    // ---------------------------------------------------------- side ranges of shops and offices
    const WZ0 = bf; // ranges run from the basilica to the front
    const WZ1 = 19.5;
    const WL = WZ1 - WZ0;
    const WZ = (WZ0 + WZ1) / 2;
    const WH = 5;
    b.sym((s) => {
      const x = s * 18;
      b.box(5, WH, WL, stone, { at: [x, 0, WZ] });
      bonding(b, 5, WL, WH, [x, 0, WZ]);
      b.gable(5, WL, 1.1, tile, { at: [x, WH, WZ], ridge: 'z', overhang: 0.35, wall: stone });
      // shop doors to the colonnade, small windows to the outside street
      for (const z of spread(5, WZ0 + 1, 12)) {
        b.panel(1.6, 2.6, P.oak, { at: [s * 15.5, 0, z], facing: s > 0 ? '-x' : '+x' });
        b.window(0.7, 0.9, { at: [s * 20.5, 3, z], facing: s > 0 ? '+x' : '-x', frame: plaster });
      }
      // colonnade along the courtyard side
      columns(b, 6, 3, 0.26, 4.2, col, { at: [s * 13.4, 0, 2], axis: 'z', order: 'tuscan' });
      b.box(0.6, 0.45, 17, col, { at: [s * 13.4, 4.2, 2] });
      b.shed(2.6, 17, 0.8, tile, { at: [s * 14.3, 4.65, 2], high: s > 0 ? '+x' : '-x' });
    });

    // ---------------------------------------------------------- front range with the entrance
    const FZ = 15.5; // front range centre
    const FD = 8;
    const FH = 5;
    b.sym((s) => {
      const cx = s * 9;
      b.box(11.5, FH, FD, stone, { at: [cx, 0, FZ] });
      bonding(b, 11.5, FD, FH, [cx, 0, FZ]);
      b.gable(11.5, FD, 1.5, tile, { at: [cx, FH, FZ], overhang: 0.35 });
      for (const x of spread(3, 4.6, 13.4)) {
        b.panel(1.6, 2.6, P.oak, { at: [s * x, 0, FZ + FD / 2], facing: '+z' });
        b.window(0.7, 0.9, { at: [s * x, 3.2, FZ + FD / 2], facing: '+z', frame: plaster });
      }
    });
    // inner colonnade of the front range
    columns(b, 8, 3, 0.26, 4.2, col, { at: [0, 0, 10.4], order: 'tuscan' });
    b.box(22.4, 0.45, 0.6, col, { at: [0, 4.2, 10.4] });
    b.shed(22.4, 1.5, 0.6, tile, { at: [0, 4.65, 10.9], high: '+z' });
    // entrance hall: taller block over the passage, open front and back
    b.sym((s) => b.box(0.7, 7, FD, stone, { at: [s * 3.15, 0, FZ] }));
    b.box(7, 1.6, FD, stone, { at: [0, 5.4, FZ] });
    b.gable(7, FD, 1.4, tile, { at: [0, 7, FZ], ridge: 'z', overhang: 0.2, wall: stone });
    b.archWall(5.6, 5.4, 0.4, plaster, { at: [0, 0, FZ - FD / 2 + 0.2], openings: 1, openW: 3.6, openH: 5, shape: 'round' });
    // pedimented porch onto the street
    const PZ2 = 20.6;
    b.box(8.6, 0.3, 2.6, stone, { at: [0, 0, PZ2] });
    b.colonnade(4, 2.3, 0.32, 6, P.marble, { at: [0, 0.3, PZ2 + 0.6], order: 'corinthian' });
    b.box(8.4, 0.9, 2.6, P.marble, { at: [0, 6.3, PZ2] });
    b.extrude([[-4.4, 0], [4.4, 0], [0, 1.7]], 2.6, P.marble, { at: [0, 7.2, PZ2] });
    b.extrude([[-4.6, 0], [0, 1.85], [4.6, 0], [4.2, 0], [0, 1.68], [-4.2, 0]], 2.8, tile, { at: [0, 7.25, PZ2] });
    b.panel(3.4, 0.5, P.white, { at: [0, 6.5, PZ2 + 1.3], facing: '+z' }); // inscription panel

    // ---------------------------------------------------------- in the courtyard
    b.box(1.4, 1.8, 1.4, P.marble, { at: [0, 0, 2.5] });
    b.box(1.6, 0.2, 1.6, P.marble, { at: [0, 1.8, 2.5] });
    b.cyl(0.32, 1.5, P.bronze, { at: [0, 2, 2.5], rTop: 0.22, segs: 7 });
    b.sphere(0.2, P.bronze, { at: [0, 3.7, 2.5], segs: 6 });
    b.box(1.0, 1.0, 0.7, P.marble, { at: [-6, 0, 6] }); // altar

    // ---------------------------------------------------------- colliders: solid ranges, open courtyard
    b.collider(L + NAVE, NAVE + AISLE * 2, { at: [0, 0, BZ] });
    b.sym((s) => {
      b.collider(5, WL, { at: [s * 18, 0, WZ] });
      b.collider(11.5, FD, { at: [s * 9, 0, FZ] });
      b.collider(0.7, 2.6, { at: [s * 3.15, 0, PZ2] });
    });
  },
};
