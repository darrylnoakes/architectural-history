import { P, mix, tint, linspace, type BuildingDef, type Builder } from '@ah/kit';

/** Temple plan: square cella inside a square ambulatory, centred at z = TZ, door to the east (-Z). */
export const TZ = 2;
export const CELLA = 7;
export const CELLA_H = 10.6;
export const AMB = 15;
export const PX = 12.2;
export const PZ = 21.5;

export const PLASTER = P.plaster;
export const RED = tint(P.romanTile, -0.08);
export const WALLSTONE = mix(P.flint, P.rubble, 0.55);

/** Column positions along one side of the ambulatory (the east side leaves the middle open). */
export const colPos = linspace(7, -AMB / 2 + 0.4, AMB / 2 - 0.4);

/**
 * How far each stretch of the temple's walls survives in the ruin that follows it. The temple builds
 * every stretch in two lifts split at that height (one wall to the eye), and the ruin keeps the
 * lower lift, so the robbed walls stand still on screen while the rest of the temple comes down.
 * Order: the precinct wall stretches as `precinctWall` walks them; the cella walls north (+z),
 * east (+x), west (-x) and south (-z, the door wall), four stretches each, in ±x or ±z order; the
 * ambulatory low wall in the same side order, five stretches a side and two either side of the steps.
 */
export const RUIN = {
  precinct: [1.6, 0.8, 0, 1.9, 1.2, 0.4, 2.1, 0, 0.9, 1.5, 0.6, 2.0, 0, 1.1, 1.7, 0.5, 0, 1.3, 2.1, 0.8, 1.0, 0],
  cella: [
    [7.5, 8.4, 6.2, 4.0],
    [3.1, 5.0, 6.8, 7.8],
    [1.4, 2.6, 4.6, 5.2],
    [2.3, 0.2, 0, 1.2],
  ],
  amb: [
    [0.9, 0.6, 0, 0.9, 0.9],
    [0.9, 0.9, 0.3, 0, 0.9],
    [0.9, 0.2, 0.8, 0.9, 0.9],
    [0.5, 0.9],
    [0.9, 0.3],
  ],
};

/**
 * One stretch of wall from (x0, z0) to (x1, z1), t thick, standing on y = base. Whole (`ruined`
 * false) it rises to `full`, built as two lifts split at the ruin height `cut`; ruined, only the
 * lower lift stands. Returns the height left standing.
 */
function stretch(b: Builder, x0: number, z0: number, x1: number, z1: number, t: number, full: number, cut: number, ruined: boolean, col: number, base: number, extra = 0.02): number {
  const len = Math.hypot(x1 - x0, z1 - z0) + extra;
  const rotY = Math.atan2(x1 - x0, z1 - z0);
  const x = (x0 + x1) / 2;
  const z = (z0 + z1) / 2;
  const lo = cut > 0.05 && cut < full - 0.05 ? cut : cut >= full - 0.05 ? full : 0;
  if (lo > 0) b.box(t, lo, len, col, { at: [x, base, z], rotY, jitter: false });
  if (!ruined && lo < full) b.box(t, full - lo, len, col, { at: [x, base + lo, z], rotY, jitter: false });
  return ruined ? lo : full;
}

/** A wall run cut into n equal stretches (see `stretch`). */
function run(b: Builder, x0: number, z0: number, x1: number, z1: number, t: number, full: number, cuts: number[], ruined: boolean, col: number, base: number) {
  const n = cuts.length;
  cuts.forEach((cut, i) => {
    const f0 = i / n;
    const f1 = (i + 1) / n;
    stretch(b, x0 + (x1 - x0) * f0, z0 + (z1 - z0) * f0, x0 + (x1 - x0) * f1, z0 + (z1 - z0) * f1, t, full, cut, ruined, col, base);
  });
}

/**
 * The fabric the temple and its ruin share: the podium and its steps, the cella and ambulatory walls
 * (whole, or robbed down to the `RUIN` heights) and the precinct wall with its tile courses.
 */
export function templeFabric(b: Builder, ruined: boolean) {
  const stone = P.limestone;
  b.box(AMB + 0.8, 0.6, AMB + 0.8, ruined ? tint(stone, -0.08) : stone, { at: [0, 0, TZ] });
  b.stairs(4.0, 0.6, 1.2, 3, ruined ? tint(stone, -0.08) : stone, { at: [0, 0, TZ - AMB / 2 - 1.0], rotY: Math.PI });

  // cella walls, 0.7 m thick, outer faces flush with the 7 m square
  const c = CELLA / 2;
  const t = 0.7;
  const H = CELLA_H;
  run(b, -c, TZ + c - t / 2, c, TZ + c - t / 2, t, H, RUIN.cella[0], ruined, PLASTER, 0.6);
  run(b, c - t / 2, TZ - c, c - t / 2, TZ + c, t, H, RUIN.cella[1], ruined, PLASTER, 0.6);
  run(b, -c + t / 2, TZ - c, -c + t / 2, TZ + c, t, H, RUIN.cella[2], ruined, PLASTER, 0.6);
  run(b, -c, TZ - c + t / 2, c, TZ - c + t / 2, t, H, RUIN.cella[3], ruined, PLASTER, 0.6);

  // ambulatory low wall under the columns, open in the middle of the east side for the steps
  const h = AMB / 2;
  const a = h - 0.25;
  run(b, -h, TZ + a, h, TZ + a, 0.5, 0.9, RUIN.amb[0], ruined, PLASTER, 0.6);
  run(b, a, TZ - h, a, TZ + h, 0.5, 0.9, RUIN.amb[1], ruined, PLASTER, 0.6);
  run(b, -a, TZ - h, -a, TZ + h, 0.5, 0.9, RUIN.amb[2], ruined, PLASTER, 0.6);
  run(b, -h, TZ - a, -2.0, TZ - a, 0.5, 0.9, RUIN.amb[3], ruined, PLASTER, 0.6);
  run(b, 2.0, TZ - a, h, TZ - a, 0.5, 0.9, RUIN.amb[4], ruined, PLASTER, 0.6);

  precinctWall(b, ruined);

  // the foot of the altar, and the piers of the precinct gate (the ruin keeps one)
  b.box(1.6, 0.25, 1.2, stone, { at: [0, 0, -9.5] });
  b.box(1.2, 0.9, 0.9, stone, { at: [0, 0.25, -9.5] });
  for (const s of ruined ? [-1] : [-1, 1]) b.box(0.9, 3.4, 1.2, WALLSTONE, { at: [s * 2.4, 0, -PZ] });
}

/** Precinct (temenos) wall: flint with bands of red tile, in stretches the ruin breaks down. */
export function precinctWall(b: Builder, ruined: boolean) {
  const t = 0.6;
  const full = 2.1;
  const sides: [number, number, number, number][] = [
    [-PX, PZ, PX, PZ],
    [PX, -PZ, PX, PZ],
    [-PX, -PZ, -PX, PZ],
    [-PX, -PZ, -2.2, -PZ],
    [2.2, -PZ, PX, -PZ],
  ];
  let k = 0;
  for (const [x0, z0, x1, z1] of sides) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(len / 5));
    const ang = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) {
      const cut = RUIN.precinct[k++ % RUIN.precinct.length];
      const f0 = i / n;
      const f1 = (i + 1) / n;
      // the end stretches reach half a wall's thickness further, to close the corners
      const e0 = i === 0 ? t / 2 / len : 0;
      const e1 = i === n - 1 ? t / 2 / len : 0;
      const ax = x0 + (x1 - x0) * (f0 - e0);
      const az = z0 + (z1 - z0) * (f0 - e0);
      const bx = x0 + (x1 - x0) * (f1 + e1);
      const bz = z0 + (z1 - z0) * (f1 + e1);
      const h = stretch(b, ax, az, bx, bz, t, full, cut, ruined, WALLSTONE, 0, 0);
      if (h <= 0.05) continue;
      const seg = Math.hypot(bx - ax, bz - az);
      const at: [number, number, number] = [(ax + bx) / 2, 0, (az + bz) / 2];
      for (const y of [0.5, 1.4]) if (y + 0.2 < h) b.box(t + 0.04, 0.16, seg, RED, { at: [at[0], y, at[2]], rotY: ang, jitter: false });
      if (h >= full - 0.05) b.box(t + 0.12, 0.12, seg, RED, { at: [at[0], h, at[2]], rotY: ang, jitter: false });
    }
  }
}

export const romanoCelticTemple: BuildingDef = {
  id: 'romano-celtic-temple',
  name: 'Romano-Celtic temple',
  style: 'Romano-British',
  date: 'c. AD 120',
  summary:
    'Under Roman rule the old shrine was rebuilt in stone, mortar and tile, but to a plan found only in Britain, Gaul and the Rhineland: a tall square tower-like cella, home of the god\'s statue, ringed by a lower covered walkway. ' +
    'Worshippers did not gather inside. They walked round the ambulatory, left offerings and made vows at the altar outside. ' +
    'The god was probably a local one given a Roman name, and the walled precinct follows the line of the Iron Age enclosure.',
  materials: ['flint and mortar', 'painted plaster', 'clay roof tile', 'limestone columns'],
  lookFor: [
    { label: 'Cella', note: 'The tall central room that housed the cult statue. Probably only priests went in.', at: [3.8, 9.0, TZ] },
    { label: 'Ambulatory', note: 'A lower covered walkway round all four sides, open between short columns on a low wall.', at: [7.9, 3.0, TZ + 3] },
    { label: 'Tiled roofs', note: 'Flat tegulae and curved imbrices of fired clay, one of the new materials Rome brought.', at: [0, 12.9, TZ] },
    { label: 'Altar', note: 'Sacrifices and offerings were made in the open air, in front of the temple door.', at: [0, 1.3, -9.5] },
    { label: 'Temenos wall', note: 'The wall of the sacred precinct, laid with courses of red tile in the Roman way.', at: [PX + 0.4, 1.6, 8] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const stone = P.limestone;
    templeFabric(b, false);

    // cella: a red dado and high windows above the ambulatory roof, a cornice and a tiled pyramid roof
    b.box(CELLA + 0.06, 1.0, CELLA + 0.06, RED, { at: [0, 0.6, TZ], jitter: false });
    b.box(CELLA + 0.2, 0.3, CELLA + 0.2, stone, { at: [0, CELLA_H + 0.6 - 0.3, TZ] });
    b.pyramid(CELLA + 0.9, CELLA + 0.9, 2.5, P.romanTile, { at: [0, CELLA_H + 0.6, TZ] });
    for (const [f, x, z] of [['+z', 0, CELLA / 2], ['-z', 0, -CELLA / 2], ['+x', CELLA / 2, 0], ['-x', -CELLA / 2, 0]] as const) {
      for (const o of [-1.5, 1.5]) {
        const at: [number, number, number] = f === '+z' || f === '-z' ? [o, 8.4, TZ + z] : [x, 8.4, TZ + o];
        b.window(0.8, 1.2, { at, facing: f, shape: 'round', frame: stone });
      }
    }
    // the great door faces east
    b.panel(2.4, 4.2, stone, { at: [0, 0.6, TZ - CELLA / 2], facing: '-z' });
    b.panel(1.9, 3.8, P.bronze, { at: [0, 0.6, TZ - CELLA / 2], facing: '-z', depth: 0.09 });

    // ambulatory: columns on the low wall, entablature and a lean-to tiled roof all round
    const half = AMB / 2;
    for (const p of colPos) {
      b.column(0.2, 2.6, stone, { at: [p, 1.5, TZ + half - 0.25], order: 'tuscan', segs: 7 });
      b.column(0.2, 2.6, stone, { at: [half - 0.25, 1.5, TZ + p], order: 'tuscan', segs: 7 });
      b.column(0.2, 2.6, stone, { at: [-half + 0.25, 1.5, TZ + p], order: 'tuscan', segs: 7 });
      if (Math.abs(p) > 1) b.column(0.2, 2.6, stone, { at: [p, 1.5, TZ - half + 0.25], order: 'tuscan', segs: 7 });
    }
    b.box(AMB, 0.4, AMB, PLASTER, { at: [0, 4.1, TZ] });
    b.pyramid(AMB + 0.8, AMB + 0.8, 3.8, P.romanTile, { at: [0, 4.5, TZ] });

    // altar in front of the temple
    b.box(1.4, 0.15, 1.05, stone, { at: [0, 1.15, -9.5] });
    for (const s of [-1, 1]) b.log(0.11, 0.9, stone, { at: [s * 0.5, 1.3, -9.5], axis: 'z' });

    // gatehouse on the east side of the precinct
    b.box(5.8, 0.5, 1.6, PLASTER, { at: [0, 3.4, -PZ] });
    b.gable(6.0, 2.0, 1.1, P.romanTile, { at: [0, 3.9, -PZ], overhang: 0.2 });
    b.box(3.9, 0.04, 6, P.gravel, { at: [0, 0, -PZ + 3.0], jitter: false });
    b.tree(8, { at: [-9, 0, 15], kind: 'round' });
    b.tree(7, { at: [9, 0, -15], kind: 'round' });

    b.collider(AMB + 1, AMB + 1, { at: [0, 0, TZ] });
  },
};
