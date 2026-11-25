import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { ARCH, BAS_H, ashlar, curia, basilicaPodium, column, forumWell, lineColliders, merlons, pave, wallSeg, type XZ } from './shared';
import { ARCH_TOWER_D, archTower } from './05-lombard-palatium';

/** The enclosure wall, clockwise from the right of the gate (outside on the right). */
const WALL: XZ[] = [
  [ARCH.w / 2, 19],
  [19.5, 19],
  [19.5, -20.5],
  [-19.5, -20.5],
  [-19.5, 19],
  [-ARCH.w / 2, 19],
];

export const bishopsPalace: BuildingDef = {
  id: 'bishops-palace',
  name: 'Bishop’s palace',
  style: 'Romanesque',
  date: 'c. 1000',
  summary:
    'Charlemagne ended the Lombard kingdom in 774, and in the tenth century the emperors, short of loyal men, granted the powers of a count over many Italian towns to their bishops, above all in the north, though in Tuscany too bishops such as those of Volterra and Arezzo held wide lordly rights. ' +
    'The bishop-count governs from the old palace of the Lombard lords, rebuilt: a new hall on the upper floor over a vaulted undercroft for stores, standing on the platform of the Roman basilica and reached by an outside stair, a tall square tower, and a battlemented wall round the whole, entered through the Lombards’ tower on the Roman arch; the Roman council house, their chapel, still serves the household. ' +
    'It is built of rough-coursed stone, with big squared blocks robbed from Roman ruins at the corners and base, small round-arched windows, and a low roof of coppi. Church and government are now in the same hands.',
  materials: ['rubble stone', 'reused Roman blocks', 'clay roof tiles (coppi)', 'timber'],
  lookFor: [
    { label: 'Hall over an undercroft', note: 'The bishop’s hall is on the first floor, safe and dry; the vaulted ground floor below holds stores and tithes.', at: [-6, 6.5, -10.6] },
    { label: 'Outside stair', note: 'A stone stair up the front of the hall to the first-floor door, so the ground floor needs no inner opening.', at: [5, 3.2, -9.4] },
    { label: 'Tower', note: 'A tall square tower of stone with its door high above the ground, the last refuge and a sign of lordship.', at: [-10.6, 15, 9.6] },
    { label: 'Two-light windows', note: 'Round-arched windows split by a slender column, the typical opening of Romanesque Italy.', at: [-1.5, 7, -10.6] },
    { label: 'Reused Roman blocks', note: 'Big squared blocks of travertine taken from the ruined forum strengthen the foot and corners of the tower.', at: [-10.2, 1.6, 9.6] },
  ],
  build(b) {
    const stone = mix(P.rubble, P.pietraForte, 0.4);
    const dark = tint(stone, -0.06);
    const tr = P.travertine;

    pave(b, 38.5, 39, 0, -0.75, mix(P.earth, P.gravel, 0.45));

    // ---------------------------------------------------------- the battlemented enclosure wall
    const WH = 6.2;
    for (let i = 0; i < WALL.length - 1; i++) {
      wallSeg(b, WALL[i], WALL[i + 1], 1.2, WH, stone, 0, 0.6);
      const [x0, z0] = WALL[i];
      const [x1, z1] = WALL[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      const nx = (-(z1 - z0) / L) * 0.4;
      const nz = ((x1 - x0) / L) * 0.4;
      merlons(b, [x0 + nx, z0 + nz], [x1 + nx, z1 + nz], WH, stone, { w: 0.9, h: 1.1, t: 0.4 });
    }
    // the gateway: the old tower on the Roman arch, now hung with gates
    archTower(b);
    b.box(1.4, 3.6, 0.15, P.oakDark, { at: [-1.6, 0, 16.8], rotY: -0.6 });
    b.box(1.4, 3.6, 0.15, P.oakDark, { at: [1.6, 0, 16.8], rotY: 0.6 });

    // ---------------------------------------------------------- the hall over its undercroft, on the Roman basilica's podium
    basilicaPodium(b);
    const Y0 = BAS_H.podium;
    const HX = -3;
    const HZ = -15;
    const HW = 22;
    const HD = 9;
    const G = 4.4;
    const U = 5.4;
    const SZ = HZ + HD / 2 + 0.9;
    b.group({ at: [0, Y0, 0] }, () => {
      b.box(HW, G + U, HD, stone, { at: [HX, 0, HZ] });
      b.box(HW + 0.1, 0.3, HD + 0.1, tr, { at: [HX, G, HZ], jitter: false });
      b.gable(HW + 0.2, HD + 0.2, 2.0, P.coppi, { at: [HX, G + U, HZ], overhang: 0.5, wall: stone });
      // corbel table of small round arches under the eaves (Lombard bands)
      for (const s of [1, -1]) {
        for (const x of spread(16, HX - HW / 2 + 0.7, HX + HW / 2 - 0.7)) b.box(0.18, 0.6, 0.18, dark, { at: [x, G + U - 0.7, HZ + s * (HD / 2 + 0.05)], jitter: false });
        b.box(HW, 0.18, 0.2, dark, { at: [HX, G + U - 0.15, HZ + s * (HD / 2 + 0.05)], jitter: false });
      }
      // undercroft: small slit windows and a low door; hall: two-light windows
      for (const x of spread(5, HX - HW / 2 + 2.5, HX + HW / 2 - 2.5)) {
        for (const s of [1, -1]) {
          const f = s > 0 ? '+z' : '-z';
          b.panel(0.3, 1.2, P.windowDark, { at: [x, 2.0, HZ + s * (HD / 2)], facing: f });
          b.group({ at: [x, G + 1.4, HZ + s * (HD / 2)], rotY: s > 0 ? 0 : Math.PI }, () => {
            b.panel(1.7, 2.3, tr, { shape: 'round' });
            for (const dx of [-0.42, 0.42]) b.panel(0.62, 1.75, P.windowDark, { at: [dx, 0.2, 0.03], shape: 'round', depth: 0.06 });
            b.box(0.12, 1.3, 0.12, tr, { at: [0, 0.2, 0.1], jitter: false });
          });
        }
      }
      b.panel(1.6, 2.4, P.oakDark, { at: [HX - 6, 0, HZ + HD / 2], facing: '+z', shape: 'round' });
      // the outside stair rising along the front to the first-floor door, on a solid base
      b.box(1.8, G, 1.8, stone, { at: [HX + 4.6, 0, SZ] }); // landing
      for (let i = 0; i < 8; i++) {
        const x = HX + 6.4 + i * 0.55;
        b.box(0.56, G - (i + 1) * (G / 9), 1.8, stone, { at: [x, 0, SZ], jitter: false });
      }
      b.box(1.0, 0.8, 0.25, stone, { at: [HX + 4.6, G, SZ + 0.8] }); // parapet
      b.panel(1.4, 2.6, P.oakDark, { at: [HX + 4.6, G, HZ + HD / 2], facing: '+z', shape: 'round' });
    });
    b.deck(1.8, 1.8, Y0 + G, { at: [HX + 4.6, 0, SZ] });

    // ---------------------------------------------------------- the tower
    const TX = -12;
    const TZ = 8;
    const TW = 6;
    const TH = 25;
    b.box(TW, TH, TW, stone, { at: [TX, 0, TZ] });
    // the foot and corners in big reused Roman blocks
    for (const [p, q] of [
      [[TX - TW / 2, TZ + TW / 2], [TX + TW / 2, TZ + TW / 2]],
      [[TX + TW / 2, TZ + TW / 2], [TX + TW / 2, TZ - TW / 2]],
      [[TX + TW / 2, TZ - TW / 2], [TX - TW / 2, TZ - TW / 2]],
      [[TX - TW / 2, TZ - TW / 2], [TX - TW / 2, TZ + TW / 2]],
    ] as [XZ, XZ][]) ashlar(b, p, q, 0, 3.2, 0, [tr, tint(tr, -0.08)], { course: 0.8, block: 1.5 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        for (let y = 3.2; y < TH - 1; y += 1.6) b.box(0.9, 0.7, 0.9, tint(tr, -0.05), { at: [TX + sx * (TW / 2 - 0.4), y, TZ + sz * (TW / 2 - 0.4)], jitter: false });
    // putlog holes, slits and the high door with its wooden stair
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.group({ at: [TX, 0, TZ], rotY: f }, () => {
        for (const y of [9, 14.5, 19.5]) b.box(0.3, 1.4, 0.06, P.windowDark, { at: [0, y, TW / 2], jitter: false });
        for (const y of [6.5, 12, 17]) for (const x of [-1.8, 0, 1.8]) b.box(0.22, 0.22, 0.05, P.windowDark, { at: [x, y, TW / 2], jitter: false });
      });
    }
    b.panel(1.1, 2.2, P.oakDark, { at: [TX + TW / 2, 6.2, TZ], facing: '+x', shape: 'round' });
    b.beam([TX + TW / 2 + 4.4, 0, TZ + 0.7], [TX + TW / 2 + 0.3, 6.2, TZ + 0.7], 0.9, 0.15, P.oak);
    b.beam([TX + TW / 2 + 0.2, 6.1, TZ], [TX + TW / 2 + 1.2, 6.1, TZ], 1.4, 0.15, P.oak);
    // projecting battlements on corbels
    b.box(TW + 0.8, 0.4, TW + 0.8, dark, { at: [TX, TH, TZ] });
    for (const [p, q] of [
      [[TX - TW / 2 - 0.2, TZ + TW / 2 + 0.2], [TX + TW / 2 + 0.2, TZ + TW / 2 + 0.2]],
      [[TX + TW / 2 + 0.2, TZ + TW / 2 + 0.2], [TX + TW / 2 + 0.2, TZ - TW / 2 - 0.2]],
      [[TX + TW / 2 + 0.2, TZ - TW / 2 - 0.2], [TX - TW / 2 - 0.2, TZ - TW / 2 - 0.2]],
      [[TX - TW / 2 - 0.2, TZ - TW / 2 - 0.2], [TX - TW / 2 - 0.2, TZ + TW / 2 + 0.2]],
    ] as [XZ, XZ][]) merlons(b, p, q, TH + 0.4, stone, { w: 0.8, h: 1.2, t: 0.45 });

    // ---------------------------------------------------------- in the court: the chapel in the Roman council house, the old well, a stable, a Roman column as a mounting block
    curia(b, 'chapel');
    forumWell(b);
    b.box(9, 3.4, 4, stone, { at: [14.5, 0, -6] });
    b.shed(9.4, 4.4, 1.2, P.coppi, { at: [14.5, 3.4, -6], high: '+x' });
    for (const z of [-7, -5]) b.panel(1.6, 2.2, P.oakDark, { at: [10, 0, z], facing: '-x' });
    column(b, [4, 0, 12], 0.3, 1.2, tint(P.marble, -0.06), { order: 'doric' });

    // ---------------------------------------------------------- colliders
    lineColliders(b, WALL, 1.2);
    b.sym((s) => b.collider((ARCH.w - ARCH.passW) / 2, ARCH_TOWER_D, { at: [s * (ARCH.passW / 2 + (ARCH.w - ARCH.passW) / 4), 0, ARCH.z - (ARCH_TOWER_D - ARCH.d) / 2] }));
    b.collider(HW, HD, { at: [HX, 0, HZ] });
    b.collider(7.0, 1.8, { at: [HX + 6.5, 0, SZ] });
    b.collider(TW, TW, { at: [TX, 0, TZ] });
    b.collider(9, 4, { at: [14.5, 0, -6] });
    b.collider(1.6, 1.6, { at: [3, 0, 1] });
  },
};
