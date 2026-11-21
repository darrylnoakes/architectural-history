import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { BAS, BAS_ZC, archWindow, column, pave } from './shared';

export const republicanForum: BuildingDef = {
  id: 'republican-forum',
  name: 'Forum',
  style: 'Roman Republican',
  date: 'c. 150 BC',
  summary:
    'The town is now a Roman ally and later a municipium, run like Rome itself by magistrates elected every year and a council of local landowners. ' +
    'Its heart is the forum, an open square for markets, elections, trials and festivals, lined with porticoes of shops. ' +
    'Across the back stands the basilica, a great aisled hall where the magistrates heard lawsuits and business went on out of the sun and rain; to one side the council meets in the curia, ' +
    'above a round stepped meeting place (the comitium) where citizens gathered to vote, with the speakers’ platform in front. All of it is tufa and white stucco under tiled roofs: marble has not yet come.',
  materials: ['tufa', 'lime stucco', 'travertine', 'fired clay tiles', 'timber'],
  lookFor: [
    { label: 'Basilica', note: 'A tall central hall lit by a row of high clerestory windows, with lower aisles either side and a colonnade open to the forum.', at: [3, 11.2, BAS.z1 + 0.6] },
    { label: 'Curia', note: 'The council house, a plain hall at the top of the steps where the town’s councillors (decurions) met.', at: [-15.2, 5.5, -1] },
    { label: 'Comitium', note: 'A round, stepped open-air meeting place in front of the curia, where citizens assembled by voting groups.', at: [-9, 1.6, 3.4] },
    { label: 'Speakers’ platform (rostra)', note: 'A raised platform for speeches, named after the bronze rams of captured warships fixed to the one in Rome.', at: [-4.6, 2.0, -1] },
    { label: 'Portico and shops (tabernae)', note: 'A covered colonnade along the square with single-room shops opening off it.', at: [12.2, 4.2, 8] },
  ],
  modelledOn: 'The forums of Cosa (comitium and curia, basilica of about 150 BC) and Pompeii (basilica, about 120 BC), much reduced',
  build(b) {
    const tufa = P.tufa;
    const stucco = P.stucco;
    const tile = P.romanTile;
    const tr = P.travertine;

    // the square: beaten earth edged and crossed with travertine slabs
    pave(b, 34, 30, -1.5, 6, mix(P.earth, P.gravel, 0.55));
    b.box(34, 0.08, 0.6, tr, { at: [-1.5, 0, -8.7], jitter: false });
    b.box(0.6, 0.08, 29, tr, { at: [11.6, 0, 6], jitter: false });

    // ---------------------------------------------------------- the basilica across the back
    const { x0, x1, z0, z1, nave } = BAS;
    const L = x1 - x0;
    const xc = (x0 + x1) / 2;
    const aisle = (z1 - z0 - nave) / 2;
    const NH = 10.2;
    const AH = 6.2;
    b.box(L + 0.6, 0.5, z1 - z0 + 0.6, tr, { at: [xc, 0, BAS_ZC] }); // podium
    b.box(L, NH, nave, stucco, { at: [xc, 0.5, BAS_ZC] });
    b.gable(L + 0.4, nave + 0.4, 1.7, tile, { at: [xc, NH + 0.5, BAS_ZC], overhang: 0.3, wall: stucco });
    // back aisle: walled; front aisle: an open colonnade onto the forum
    b.box(L, AH, aisle, tint(stucco, -0.03), { at: [xc, 0.5, z0 + aisle / 2] });
    b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + 0.5, z0 + aisle / 2 - 0.2], high: '+z' });
    b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + 0.5, z1 - aisle / 2 + 0.2], high: '-z' });
    for (const x of spread(10, x0 + 0.5, x1 - 0.5)) column(b, [x, 0.5, z1 - 0.4], 0.32, AH - 0.5, stucco, { order: 'ionic' });
    b.box(L, 0.5, 0.8, stucco, { at: [xc, AH, z1 - 0.4] });
    b.sym((s) => b.box(0.5, AH, aisle, stucco, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, 0.5, z1 - aisle / 2] }));
    // clerestory windows on both sides of the nave, small windows in the back aisle
    for (const x of spread(9, x0 + 1.5, x1 - 1.5)) {
      for (const s of [1, -1]) archWindow(b, 1.0, 1.7, { at: [x, AH + 1.8, BAS_ZC + (s * nave) / 2], facing: s > 0 ? '+z' : '-z', frame: tr });
      archWindow(b, 0.8, 1.2, { at: [x, 2.6, z0], facing: '-z', frame: tr });
    }
    // doors into the hall behind the colonnade, the end walls with doors and a gable window
    for (const x of spread(3, x0 + 6, x1 - 6)) b.panel(1.8, 3.4, P.oakDark, { at: [x, 0.5, BAS_ZC + nave / 2], facing: '+z' });
    b.sym((s) => {
      const ex = s > 0 ? x1 : x0;
      b.panel(2, 3.6, P.oakDark, { at: [ex, 0.5, BAS_ZC], facing: s > 0 ? '+x' : '-x' });
      archWindow(b, 1.1, 1.8, { at: [ex, NH - 1.6, BAS_ZC], facing: s > 0 ? '+x' : '-x', frame: tr });
    });

    // ---------------------------------------------------------- the curia above the comitium, on the left
    const CX = -17.5;
    const CZ = -1;
    b.box(6.6, 1.4, 9, tufa, { at: [CX, 0, CZ] });
    b.box(6, 7, 8.4, stucco, { at: [CX, 1.4, CZ] });
    b.gable(6.4, 8.8, 1.5, tile, { at: [CX, 8.4, CZ], ridge: 'z', overhang: 0.3, wall: stucco });
    b.panel(2.2, 3.6, P.bronze, { at: [CX + 3, 1.4, CZ], facing: '+x' });
    for (const z of [CZ - 2.8, CZ + 2.8]) archWindow(b, 1.0, 1.6, { at: [CX + 3, 5.6, z], facing: '+x', frame: tr });
    for (const z of [CZ - 2, CZ + 2]) archWindow(b, 1.0, 1.6, { at: [CX - 3, 5, z], facing: '-x', frame: tr });
    b.stairs(3, 1.4, 1.6, 4, tufa, { at: [CX + 4.1, 0, CZ], rotY: -Math.PI / 2 });
    // the comitium: tiers of steps round a circular floor, open toward the forum
    const KX = -9;
    b.lathe([[5.2, 0], [5.2, 1.2], [4.4, 1.2], [4.4, 0.8], [3.6, 0.8], [3.6, 0.4], [2.8, 0.4], [2.8, 0.02]], tufa, { at: [KX, 0, CZ], segs: 16, start: Math.PI * 0.25, sweep: Math.PI * 1.5 });
    b.cyl(2.8, 0.05, tint(tufa, 0.06), { at: [KX, 0, CZ], segs: 16 });
    // the speakers' platform at the open side, with bronze rams on its front
    b.box(3.2, 1.6, 5, tufa, { at: [KX + 4.2, 0, CZ] });
    b.box(3.4, 0.2, 5.2, tr, { at: [KX + 4.2, 1.6, CZ], jitter: false });
    for (const z of [CZ - 1.6, CZ, CZ + 1.6]) b.beam([KX + 5.8, 0.9, z], [KX + 6.5, 0.7, z], 0.25, 0.3, P.bronze);
    b.stairs(1.6, 1.6, 1.8, 5, tufa, { at: [KX + 4.2, 0, CZ - 3.4], rotY: Math.PI });
    b.deck(3.2, 5, 1.6, { at: [KX + 4.2, 0, CZ] });

    // ---------------------------------------------------------- portico and shops down the right side
    const SX = 17.5; // shop range centre
    const SZ0 = -8;
    const SZ1 = 20;
    const SL = SZ1 - SZ0;
    const SZC = (SZ0 + SZ1) / 2;
    b.box(7, 5.2, SL, tint(tufa, 0.02), { at: [SX, 0, SZC] });
    b.gable(7.4, SL + 0.4, 1.4, tile, { at: [SX, 5.2, SZC], ridge: 'z', overhang: 0.2, wall: tufa });
    for (const z of spread(7, SZ0 + 2, SZ1 - 2)) {
      b.panel(2.4, 2.8, P.oak, { at: [SX - 3.5, 0, z], facing: '-x' }); // wide shop opening, shuttered
      b.panel(2.2, 0.1, P.oakDark, { at: [SX - 3.5, 1.0, z], facing: '-x', depth: 0.3 }); // counter
      b.window(0.8, 0.7, { at: [SX - 3.5, 3.6, z], facing: '-x', frame: tr });
      b.window(0.7, 0.8, { at: [SX + 3.5, 3.0, z], facing: '+x', frame: tr });
    }
    for (const z of spread(10, SZ0 + 0.6, SZ1 - 0.6)) column(b, [12.3, 0, z], 0.28, 4.4, stucco, { order: 'doric' });
    b.box(0.7, 0.5, SL, stucco, { at: [12.3, 4.4, SZC] });
    b.shed(2.9, SL, 0.7, tile, { at: [12.9, 4.9, SZC], high: '+x' });

    // ---------------------------------------------------------- in the square: honorific statues, a well
    for (const [x, z] of [[-2, 9], [4, 9]] as const) {
      b.box(1.2, 1.9, 1.6, tr, { at: [x, 0, z] });
      b.box(0.5, 1.5, 0.4, P.bronze, { at: [x, 1.9, z] });
      b.sphere(0.2, P.bronze, { at: [x, 3.6, z], segs: 6 });
    }
    b.cyl(0.7, 0.9, tr, { at: [3, 0, 1], segs: 8 });

    // ---------------------------------------------------------- colliders: halls solid, square and porticoes walkable
    b.collider(L, nave + aisle + 0.6, { at: [xc, 0, BAS_ZC - aisle / 2] });
    b.sym((s) => b.collider(0.6, aisle, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, 0, z1 - aisle / 2] }));
    b.collider(6.6, 9, { at: [CX, 0, CZ] });
    b.collider(3.2, 5, { at: [KX + 4.2, 0, CZ] });
    b.collider(7, SL, { at: [SX, 0, SZC] });
    for (const [x, z] of [[-2, 9], [4, 9], [3, 1]] as const) b.collider(1.6, 1.6, { at: [x, 0, z] });
    void P.marble;
  },
};
