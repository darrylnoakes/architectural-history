import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import {
  ARCH,
  BAS,
  BAS_H,
  BAS_ZC,
  apseWall,
  archWindow,
  arcade,
  basilicaColumn,
  basilicaPodium,
  equestrianPedestal,
  forumStatues,
  forumWell,
  pave,
  porticoColumn,
  triumphalArch,
  type XZ,
} from './shared';

/** A ruined wall: a run of masonry stumps of uneven height between two plan points. */
function ruinWall(b: Builder, p: XZ, q: XZ, t: number, hMin: number, hMax: number, color: number, y0 = 0): void {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n = Math.max(1, Math.round(L / 2.2));
  const ang = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const h = b.range(hMin, hMax);
    if (h < hMin + 0.15 * (hMax - hMin) && b.chance(0.5)) continue; // a breach
    b.box(L / n + 0.05, h, t, tint(color, b.range(-0.04, 0.03)), { at: [p[0] + (q[0] - p[0]) * u, y0, p[1] + (q[1] - p[1]) * u], rotY: ang });
  }
}

/** Depth of the tower the Lombards raise on the Roman arch. */
export const ARCH_TOWER_D = 6.2;

/**
 * The tower raised on the stump of the Roman arch about 600, from reused blocks, with a timber
 * fighting gallery and a tiled roof. The bishop keeps it as the gate tower of his palace.
 */
export function archTower(b: Builder): void {
  const spolia = mix(P.rubble, P.marble, 0.3);
  triumphalArch(b, tint(P.marble, -0.08), { stump: true });
  const T0 = ARCH.h + 0.5;
  const TD = ARCH_TOWER_D;
  const TZ = ARCH.z - (TD - ARCH.d) / 2;
  // new masonry behind the arch to carry a deeper tower, with the passage carried through
  arcade(b, ARCH.w, T0, TD - ARCH.d, spolia, { at: [ARCH.x, 0, ARCH.z - ARCH.d / 2 - (TD - ARCH.d) / 2], openings: 1, openW: ARCH.passW, openH: ARCH.passH, shape: 'round' });
  b.box(ARCH.w, 9, TD, spolia, { at: [ARCH.x, T0, TZ] });
  for (const y of [T0 + 2.2, T0 + 5.4]) {
    b.box(ARCH.w + 0.05, 0.25, TD + 0.05, tint(P.marble, -0.04), { at: [ARCH.x, y, TZ], jitter: false }); // courses of reused marble
    archWindow(b, 0.6, 1.4, { at: [ARCH.x, y + 0.6, ARCH.z + ARCH.d / 2], facing: '+z', frame: P.marble });
    archWindow(b, 0.6, 1.4, { at: [ARCH.x + ARCH.w / 2, y + 0.6, TZ], facing: '+x', frame: P.marble });
    archWindow(b, 0.6, 1.4, { at: [ARCH.x - ARCH.w / 2, y + 0.6, TZ], facing: '-x', frame: P.marble });
  }
  b.box(2.2, 0.9, 0.1, P.marble, { at: [ARCH.x - 2.4, T0 + 3.4, ARCH.z + ARCH.d / 2 + 0.02], jitter: false }); // a reused inscription, set sideways
  // a timber fighting gallery (hoarding) jettied out round the top, and a tiled pyramid roof
  const HT = T0 + 9;
  b.box(ARCH.w + 1.4, 0.25, TD + 1.4, P.oakDark, { at: [ARCH.x, HT, TZ] });
  b.box(ARCH.w + 1.2, 1.8, TD + 1.2, P.oak, { at: [ARCH.x, HT + 0.25, TZ] });
  for (const x of spread(6, ARCH.x - ARCH.w / 2, ARCH.x + ARCH.w / 2)) b.beam([x, HT - 1.2, TZ + TD / 2], [x, HT, TZ + TD / 2 + 0.7], 0.2, 0.2, P.oakDark);
  b.pyramid(ARCH.w + 1.8, TD + 1.8, 2.6, tint(P.romanTile, -0.08), { at: [ARCH.x, HT + 2.05, TZ] });
}

/** The small apsed palace chapel of about 600, kept by the bishop for his household. */
export function palaceChapel(b: Builder): void {
  const CX = 10;
  const CZ = 1.5;
  b.box(7, 5.4, 5, mix(P.romanTile, P.rubble, 0.5), { at: [CX, 0, CZ] });
  b.gable(7.4, 5.4, 1.6, P.romanTile, { at: [CX, 5.4, CZ], overhang: 0.2, wall: mix(P.romanTile, P.rubble, 0.5) });
  b.lathe([[2.1, 0], [2.1, 4.2]], mix(P.romanTile, P.rubble, 0.5), { at: [CX + 3.5, 0, CZ], segs: 6, start: 0, sweep: Math.PI });
  b.lathe([[2.3, 4.1], [0.01, 5.3]], P.romanTile, { at: [CX + 3.5, 0, CZ], segs: 6, start: 0, sweep: Math.PI });
  b.panel(1.4, 2.6, P.oakDark, { at: [CX - 3.5, 0, CZ], facing: '-x', shape: 'round' });
  for (const x of [CX - 1.5, CX + 1.5]) {
    archWindow(b, 0.5, 1.1, { at: [x, 3.2, CZ + 2.5], facing: '+z', frame: P.marble });
    archWindow(b, 0.5, 1.1, { at: [x, 3.2, CZ - 2.5], facing: '-z', frame: P.marble });
  }
  // a bell-cote on the west gable
  b.box(0.9, 1.4, 0.4, mix(P.romanTile, P.rubble, 0.5), { at: [CX - 3.5, 6.6, CZ] });
  b.cyl(0.2, 0.35, P.bronze, { at: [CX - 3.5, 7.1, CZ], rTop: 0.1, segs: 6 });
}

export const lombardPalatium: BuildingDef = {
  id: 'lombard-palatium',
  name: 'Lombard palace (palatium)',
  style: 'Lombard, early medieval',
  date: 'c. AD 600',
  summary:
    'The Gothic War has left the forum in ruins, and since 568 the Lombards have ruled much of Italy. The duke, or the king’s steward (gastald), makes his residence in the shell of the old basilica: ' +
    'a timber hall built inside the roofless walls, a tower raised on the triumphal arch from reused Roman blocks, and a small palace chapel. ' +
    'Marble is burnt for lime, a few columns still stand among those that fell, the horseman’s bronze is long gone from his pedestal, and the square has become gardens and pens. Power is again in the hands of an armed lord and his followers, and the town has shrunk to a fraction of its Roman size.',
  materials: ['timber', 'reused Roman brick and stone', 'shingles and salvaged tiles'],
  lookFor: [
    { label: 'Ruined basilica', note: 'The Roman walls stand roofless and broken, stripped of their marble facing down to the brick and concrete core.', at: [BAS.x1 + 0.6, 5, BAS.z0 + 1] },
    { label: 'Timber hall', note: 'The lord’s hall of posts and planks, built inside the old nave and roofed with salvaged tiles.', at: [-3, 6.2, BAS_ZC + 3.4] },
    { label: 'Tower on the arch', note: 'The Roman arch has become the base of a tower, its passage now the gate to the lord’s compound.', at: [ARCH.x + 4.4, 15, ARCH.z + 1.6] },
    { label: 'Palace chapel', note: 'A small apsed church for the lord’s household; the Lombards, once Arian Christians, were gradually won over to the Catholic church in the seventh century.', at: [13.4, 4.6, 1.4] },
    { label: 'Spolia', note: 'Blocks, column drums and inscriptions taken from Roman buildings and built into new walls.', at: [ARCH.x - 3.2, 11, ARCH.z - 4.2] },
  ],
  build(b) {
    const core = mix(P.romanTile, P.rubble, 0.45); // brick and concrete core, marble gone
    const spolia = mix(P.rubble, P.marble, 0.3);

    // grass over the forum, an earth track to the hall, vegetable beds
    pave(b, 40, 40, 0, 0, mix(P.grassDry, P.earth, 0.25), 0);
    pave(b, 3, 26, 0, 4.5, mix(P.earth, P.gravel, 0.3), 0.01);
    for (const [x, z] of [[-8, 8], [-8, 12.5], [7.5, 9], [7.5, 13.2]] as const) {
      b.box(5, 0.18, 3.2, P.soil, { at: [x, 0, z], jitter: false });
      for (const dz of [-0.9, 0, 0.9]) b.box(4.4, 0.25, 0.4, P.leafDark, { at: [x, 0.18, z + dz], jitter: false });
    }

    // ---------------------------------------------------------- the basilica in ruins
    const { x0, x1, z0, z1, nave, apseR } = BAS;
    const Y0 = BAS_H.podium;
    const aisle = (z1 - z0 - nave) / 2;
    basilicaPodium(b);
    ruinWall(b, [x0, z0 + 0.3], [x1, z0 + 0.3], 0.7, 2, 7.5, core, Y0); // back aisle wall
    ruinWall(b, [x0, BAS_ZC - nave / 2], [x0 + 9, BAS_ZC - nave / 2], 0.6, 3, 10, core, Y0); // a high stretch of nave wall
    ruinWall(b, [x1 - 0.3, z0], [x1 - 0.3, z1], 0.7, 2.5, 9, core, Y0); // the right end wall
    // the apse stands to its full height, open to the sky now its half-dome has fallen
    apseWall(b);
    // what is left of the front colonnade: a few standing columns, others fallen
    for (const i of [0, 3, 6, 9]) basilicaColumn(b, i);
    for (const [x, z, r] of [[-4, z1 + 2.2, 0.3], [3.5, z1 + 3.0, -0.4], [9.5, z1 + 1.6, 0.1]] as const) {
      b.log(0.34, 5.4, tint(P.marble, -0.06), { at: [x, 0, z], rotY: r, segs: 7 });
    }
    // the side shop ranges: low ruined walls
    b.sym((s) => {
      ruinWall(b, [s * 21, -8], [s * 21, 17.6], 0.6, 1, 4.2, mix(P.romanTile, P.rubble, 0.3));
      ruinWall(b, [s * 14, -8], [s * 14, 17.6], 0.6, 0.6, 3.2, mix(P.romanTile, P.rubble, 0.3));
      for (const i of [2, 4, 7]) porticoColumn(b, s, i);
    });
    // the bare pedestal of the bronze horseman, melted down long ago, the bases of the older statues,
    // and the well-head, still in use
    equestrianPedestal(b);
    forumStatues(b, false);
    forumWell(b);

    // ---------------------------------------------------------- the timber hall inside the nave
    const HX = -3;
    const HZ = BAS_ZC;
    const HW = 15;
    const HD = nave - 1.2;
    const F = Y0 + 0.7; // the hall floor
    b.box(HW + 0.4, 0.7, HD + 0.4, spolia, { at: [HX, Y0, HZ] }); // footing of reused blocks
    b.box(HW, 3.6, HD, P.oak, { at: [HX, F, HZ] });
    for (const x of spread(7, HX - HW / 2 + 0.15, HX + HW / 2 - 0.15)) {
      b.box(0.3, 3.6, 0.2, P.oakDark, { at: [x, F, HZ + HD / 2 + 0.05], jitter: false });
      b.box(0.3, 3.6, 0.2, P.oakDark, { at: [x, F, HZ - HD / 2 - 0.05], jitter: false });
    }
    b.gable(HW, HD, 2.8, tint(P.romanTile, -0.08), { at: [HX, F + 3.6, HZ], overhang: 0.7, wall: P.oak, thick: 0.2 });
    b.box(2.2, 2.4, 0.25, P.oakDark, { at: [HX, F, HZ + HD / 2 + 0.1], jitter: false });
    b.box(1.2, 0.5, 1.2, P.oakDark, { at: [HX - 3, F + 6.2, HZ] }); // louvre for the hearth smoke
    b.stairs(3, 0.7, 1.2, 3, spolia, { at: [HX, Y0, HZ + HD / 2 + 0.85] });
    b.box(4, Y0, 2.8, spolia, { at: [HX, 0, z1 + 0.6] });
    // a lean-to store against the high wall at the back
    b.box(8, 2.6, 2.2, P.oak, { at: [6, Y0, z0 + 1.6] });
    b.shed(8.6, 2.6, 0.9, P.shingle, { at: [6, Y0 + 2.6, z0 + 1.6], high: '-z' });

    // ---------------------------------------------------------- the tower raised on the Roman arch
    archTower(b);
    const TD = ARCH_TOWER_D;
    const TZ = ARCH.z - (TD - ARCH.d) / 2;
    // palisade of stakes either side of the tower, closing the compound at the front
    b.sym((s) => {
      for (const x of spread(12, s * (ARCH.w / 2 + 0.3), s * 13.6)) b.cyl(0.16, 3.2, P.oakSilver, { at: [x, 0, ARCH.z - 0.5], segs: 4 });
      b.box(13.6 - ARCH.w / 2, 0.2, 0.15, P.oakDark, { at: [s * (13.6 + ARCH.w / 2) / 2, 2.2, ARCH.z - 0.65], jitter: false });
    });

    // ---------------------------------------------------------- the palace chapel
    palaceChapel(b);
    const CX = 10;
    const CZ = 1.5;

    // ---------------------------------------------------------- colliders
    b.collider(HW + 0.4, HD + 0.4, { at: [HX, 0, HZ] });
    b.collider(x1 - x0, 1, { at: [(x0 + x1) / 2, 0, z0 + 0.3] });
    b.collider(1, z1 - z0, { at: [x1 - 0.3, 0, BAS_ZC] });
    b.collider(apseR, apseR * 2, { at: [x0 - apseR / 2, 0, BAS_ZC] });
    b.collider(8, 2.2, { at: [6, 0, z0 + 1.6] });
    b.collider(2, 3.4, { at: [0, 0, 3] });
    b.sym((s) => {
      b.collider((ARCH.w - ARCH.passW) / 2, TD, { at: [s * (ARCH.passW / 2 + (ARCH.w - ARCH.passW) / 4), 0, TZ] });
      b.collider(13.6 - ARCH.w / 2, 0.5, { at: [s * (13.6 + ARCH.w / 2) / 2, 0, ARCH.z - 0.5] });
    });
    b.collider(9, 5, { at: [CX + 0.6, 0, CZ] });
    void aisle;
  },
};
