import { P, spread, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { facet, thermalWindow, type Pt } from './shared';

/** Plan of the bath house, shared with the ruin that follows it. */
export const BATHS = {
  back: -11.8,
  front: -3.5,
  /** frigidarium, tepidarium, caldarium: [x0, x1, wall height] */
  F: [-15, -6, 6] as const,
  T: [-6, 1.5, 6] as const,
  C: [1.5, 11, 7] as const,
  apseR: 3,
  yard: { x: 15, front: 14, wallH: 4.2, depth: 3.2 },
};

/** Thickness of the bath-house walls. */
export const WALL_T = 0.8;

/**
 * Stone with red tile bonding courses, as a solid box (a wall, or a whole small block). Given a
 * `cut`, the box is built in two lifts split at that height, one block to the eye; `ruined` leaves
 * only the lower lift and the tile courses in it. This is how the baths share their walls with the
 * ruin that follows: the lower lifts are the same pieces in both. `laced` false leaves out the tile
 * courses (inner walls, plastered). Returns the height left standing.
 */
export function lacedBox(b: Builder, w: number, h: number, d: number, stone: number, at: Vec3, cut?: number, ruined = false, laced = true): number {
  const split = cut !== undefined && cut > 0.05 && cut < h - 0.05;
  const gone = cut !== undefined && cut <= 0.05;
  const standing = !ruined || cut === undefined || cut >= h - 0.05 ? h : gone ? 0 : cut;
  if (split) {
    b.box(w, cut, d, stone, { at, jitter: false });
    if (!ruined) b.box(w, h - cut, d, stone, { at: [at[0], at[1] + cut, at[2]], jitter: false });
  } else if (standing > 0) b.box(w, h, d, stone, { at });
  for (let y = 1.1; laced && y < h - 0.4; y += 1.25) {
    if (y + 0.22 > standing + 1e-6) break;
    b.box(w + 0.06, 0.22, d + 0.06, P.romanTile, { at: [at[0], at[1] + y, at[2]], jitter: false });
  }
  return standing;
}

/**
 * How far each wall survives in the ruined baths (height above its foot; 0 gone, a value at or above
 * the wall's height whole). Most cuts fall just above a tile course, where robbers stopped.
 */
export const BATH_RUIN = {
  fFront: 1.32,
  fBack: 2.57,
  fEnd: 2.57,
  /** the cross wall between frigidarium and tepidarium, back and front halves */
  ftBack: 6,
  ftFront: 2.57,
  tFront: 0.5,
  tBack: 6,
  /** the cross wall between tepidarium and caldarium, back and front halves */
  tcBack: 7,
  tcFront: 3.82,
  cFront: 3.82,
  cBack: 5.07,
  cEnd: 0,
  /** the seven faces of the apse, south to north */
  apse: [2.2, 3.4, 1.6, 4.8, 3.0, 1.2, 2.6],
  furnace: 1.32,
  yardSide: [2.57, 2.57],
  yardFront: [1.32, 1.32],
};

/** One half (back or front) of a tile-and-concrete barrel vault over a room, as a shell. */
export function vaultHalf(b: Builder, x: number, w: number, top: number, half: 'back' | 'front', color: number) {
  const { back, front } = BATHS;
  const zc = (front + back) / 2;
  const ro = (w + 0.3) / 2;
  const ri = ro - WALL_T;
  const pts: Pt[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) pts.push([ro * Math.cos((Math.PI * i) / n), ro * Math.sin((Math.PI * i) / n) * 0.75]);
  for (let i = n; i >= 0; i--) pts.push([ri * Math.cos((Math.PI * i) / n), ri * Math.sin((Math.PI * i) / n) * 0.75]);
  const len = (front - back) / 2 + 0.15;
  b.extrude(pts, len, color, { at: [x, top, half === 'back' ? zc - len / 2 : zc + len / 2] });
}

/**
 * The masonry the baths and their ruin share: the platform of the bath block, the walls of the three
 * rooms (whole, or robbed down to `BATH_RUIN`), the windows in what stands, the back half of the
 * tepidarium vault, the apse, the furnace house, the yard walls and gate piers, the plunge pool.
 */
export function bathFabric(b: Builder, stone: number, ruined: boolean) {
  const R = BATH_RUIN;
  const { back, front } = BATHS;
  const D = front - back;
  const zc = (front + back) / 2;
  const t = WALL_T;
  const [f0, f1, fh] = BATHS.F;
  const [t0, t1, th] = BATHS.T;
  const [c0, c1, ch] = BATHS.C;
  const fx = (f0 + f1) / 2;
  const tx = (t0 + t1) / 2;
  const cx = (c0 + c1) / 2;
  const tile = P.romanTile;
  const B = 0.4; // the walls stand on the platform

  b.box(c1 - f0 + 0.6, B, D + 0.6, tint(stone, -0.05), { at: [(c1 + f0) / 2, 0, zc] });
  const alongX = (x0: number, x1: number, z: number, h: number, cut: number) => lacedBox(b, x1 - x0, h, t, stone, [(x0 + x1) / 2, B, z], cut, ruined);
  // the cross walls inside are plastered, without tile courses on show
  const alongZ = (x: number, z0: number, z1: number, h: number, cut: number, laced = false) =>
    lacedBox(b, t, h, z1 - z0, stone, [x, B, (z0 + z1) / 2], cut, ruined, laced);
  const zf = front - t / 2;
  const zb = back + t / 2;
  const mid = zc;

  // frigidarium
  const fFront = alongX(f0, f1, zf, fh, R.fFront);
  const fBack = alongX(f0, f1, zb, fh, R.fBack);
  alongZ(f0 + t / 2, back, front, fh, R.fEnd, true);
  alongZ(t0, back, mid, fh, R.ftBack);
  alongZ(t0, mid, front, fh, R.ftFront);
  // tepidarium
  const tFront = alongX(t0, t1, zf, th, R.tFront);
  const tBack = alongX(t0, t1, zb, th, R.tBack);
  alongZ(t1, back, mid, ch, R.tcBack);
  alongZ(t1, mid, front, ch, R.tcFront);
  // caldarium, open at its east end to the apse
  const cFront = alongX(c0, c1, zf, ch, R.cFront);
  const cBack = alongX(c0, c1, zb, ch, R.cBack);
  alongZ(c1 - t / 2, back, front, ch, R.cEnd);

  // windows, where the wall round them still stands
  const fits = (standing: number, y: number, h: number) => standing + B >= y + h - 0.01;
  if (fits(fFront, 2.6, 1.6)) b.sym((s) => b.window(0.9, 1.6, { at: [fx + s * 2.9, 2.6, front], facing: '+z', shape: 'round', frame: stone }));
  if (fits(fBack, 2.6, 1.6)) b.window(0.9, 1.6, { at: [fx, 2.6, back], facing: '-z', shape: 'round', frame: stone });
  for (const [x, w, fr, bk] of [[tx, t1 - t0, tFront, tBack], [cx, c1 - c0, cFront, cBack]]) {
    for (const wx of spread(2, x - w / 2, x + w / 2)) {
      if (fits(fr, 3.4, 1.5)) b.window(0.9, 1.5, { at: [wx, 3.4, front], facing: '+z', shape: 'round', frame: stone });
      if (fits(bk, 3.4, 1.5)) b.window(0.9, 1.5, { at: [wx, 3.4, back], facing: '-z', shape: 'round', frame: stone });
    }
  }
  // flue vents along the hot-room eaves, on the back wall
  for (const x of spread(6, t0, c1)) {
    if (!ruined || (x <= t1 && tBack >= th)) b.box(0.35, 0.5, 0.35, tile, { at: [x, th + B, back + 0.3] });
  }

  // the back half of the tepidarium vault, its cornice and its end with the thermal window
  const top = th + B;
  if (!ruined || tBack >= th) {
    b.box(t1 - t0 + 0.3, 0.3, D / 2 + 0.15, tint(stone, 0.04), { at: [tx, top - 0.3, zc - D / 4 - 0.075] });
    vaultHalf(b, tx, t1 - t0, top, 'back', tile);
    b.vault(t1 - t0 - 0.2, 0.16, P.plaster, { at: [tx, top, back - 0.08], squash: 0.73, segs: 10 });
    thermalWindow(b, (t1 - t0) * 0.27, stone, { at: [tx, top + 0.1, back - 0.16], facing: '-z' });
  }

  // the apse at the end of the caldarium: seven faces of a fourteen-sided drum
  R.apse.forEach((cut, i) => {
    const [ax, az, aa] = facet(i, 14, BATHS.apseR);
    b.group({ at: [c1 + ax, 0, zc + az], rotY: aa }, () => lacedBox(b, 1.45, 5.4, 0.7, stone, [0, 0, 0], cut, ruined));
    if (i >= 2 && i <= 4 && (!ruined || cut >= 4.2)) {
      const [wx, wz, wa] = facet(i, 14, BATHS.apseR + 0.36);
      b.window(0.8, 1.6, { at: [c1 + wx, 2.6, zc + wz], facing: wa, shape: 'round', frame: stone });
    }
  });

  // praefurnium: the furnace house behind the caldarium
  lacedBox(b, 6, 3.2, 2.2, stone, [cx, 0, back - 1.1], R.furnace, ruined);

  // palaestra: enclosure walls, the front split by the gateway with its two piers
  const Y = BATHS.yard;
  const wallT = 0.6;
  const yardD = Y.front - front;
  const yzc = (Y.front + front) / 2;
  b.box(Y.x * 2 - wallT * 2, 0.06, yardD - wallT, ruined ? tint(P.grass, 0.03) : tint(P.sand, -0.04), { at: [0, 0, yzc - wallT / 2] });
  b.sym((s) => {
    const k = s > 0 ? 0 : 1;
    lacedBox(b, wallT, Y.wallH, yardD, stone, [s * (Y.x - wallT / 2), 0, yzc], R.yardSide[k], ruined);
    lacedBox(b, Y.x - 2.2, Y.wallH, wallT, stone, [s * (Y.x + 2.2) / 2, 0, Y.front - wallT / 2], R.yardFront[k], ruined);
    if (!ruined || s < 0) b.box(1.0, Y.wallH + 1.0, wallT + 0.3, tint(stone, 0.05), { at: [s * 2.4, 0, Y.front - wallT / 2] });
  });

  // open-air plunge pool (natatio) in the yard
  b.box(6.4, 0.5, 3.4, tint(stone, ruined ? 0.02 : 0.06), { at: [-5, 0, 3.8] });
  b.stairs(1.6, 0.5, 0.8, 2, tint(stone, 0.06), { at: [-5, 0, 5.9] });
}

export const romanBaths: BuildingDef = {
  id: 'roman-baths',
  name: 'Public baths',
  style: 'Romano-British',
  date: 'c. AD 110',
  summary:
    'Going to the baths was the daily habit that made a Briton Roman. Bathers undressed, exercised in the colonnaded yard, then moved ' +
    'along a row of rooms that grew hotter, from the warm tepidarium to the steaming caldarium, before a plunge in the cold frigidarium. ' +
    'The hot rooms are vaulted in mortared stone and tile because a timber roof would rot in the steam or catch fire from the furnace, ' +
    'whose heat ran under raised floors and up flues in the walls. Nothing on this plot had been built with mortar, fired tile or window glass before.',
  materials: ['limestone rubble', 'red tile courses', 'Roman roof tile', 'mortar and concrete', 'window glass'],
  lookFor: [
    { label: 'Barrel vaults', note: 'Half-round masonry roofs over the hot rooms, fireproof and able to shrug off the steam.', at: [6.25, 10.8, -8] },
    { label: 'Apse', note: 'The semicircular end of the caldarium, which often held a basin of cool water for splashing the face.', at: [14.3, 4.2, -8] },
    { label: 'Thermal window', note: 'A semicircular window split by two mullions, filling the end of a vault. Palladio revived it in the 16th century.', at: [6.25, 8.4, -3.3] },
    { label: 'Tile bonding courses', note: 'Bands of flat red tile run through the stone walls to level and tie them, a hallmark of Roman work.', at: [-15.1, 2.3, -4.6] },
    { label: 'Palaestra', note: 'The exercise yard, ringed by a covered colonnade of Tuscan columns, for ball games, wrestling and gossip.', at: [0, 1.2, 4] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.03, 0.02));
    const plaster = P.plaster;
    const tile = P.romanTile;
    const { back, front } = BATHS;
    const D = front - back;
    const zc = (front + back) / 2;

    // ---------------------------------------------------------------- bath block
    bathFabric(b, stone, false);
    const room = (r: readonly [number, number, number]) => ({ x: (r[0] + r[1]) / 2, w: r[1] - r[0], h: r[2] });
    const F = room(BATHS.F);
    const T = room(BATHS.T);
    const C = room(BATHS.C);

    // frigidarium: timber roof, tiled, gable to the yard
    b.gable(F.w + 0.1, D, 3.2, tile, { at: [F.x, F.h + 0.4, zc], ridge: 'z', overhang: 0.35, wall: plaster });
    b.window(1.6, 0.9, { at: [F.x, F.h + 1.0, front + 0.02], facing: '+z', shape: 'round', frame: stone, bars: [2, 1] });
    // cold plunge pool projecting from the end wall
    lacedBox(b, 1.8, 3.6, 4.5, stone, [BATHS.F[0] - 0.9, 0, zc]);
    b.shed(1.8, 4.5, 0.8, tile, { at: [BATHS.F[0] - 0.9, 3.6, zc], high: '+x' });

    // tepidarium and caldarium: barrel vaults running front to back, thermal windows in the ends
    // (the back half of the tepidarium's is part of the shared fabric)
    for (const r of [T, C]) {
      const top = r.h + 0.4;
      const hot = r === C;
      b.box(r.w + 0.3, 0.3, D / 2 + 0.15, tint(stone, 0.04), { at: [r.x, top - 0.3, zc + D / 4 + 0.075] });
      vaultHalf(b, r.x, r.w, top, 'front', tile);
      if (hot) {
        b.box(r.w + 0.3, 0.3, D / 2 + 0.15, tint(stone, 0.04), { at: [r.x, top - 0.3, zc - D / 4 - 0.075] });
        vaultHalf(b, r.x, r.w, top, 'back', tile);
      }
      for (const s of hot ? [1, -1] : [1]) {
        b.vault(r.w - 0.2, 0.16, plaster, { at: [r.x, top, zc + s * (D / 2 + 0.08)], squash: 0.73, segs: 10 });
        thermalWindow(b, r.w * 0.27, stone, { at: [r.x, top + 0.1, zc + s * (D / 2 + 0.16)], facing: s > 0 ? '+z' : '-z' });
      }
    }
    // the apse's half dome
    const ax = BATHS.C[1];
    b.dome(BATHS.apseR + 0.15, tile, { at: [ax, 5.4, zc], squash: 0.75, segs: 14 });

    // arched entrance to the frigidarium from the yard
    b.panel(2.2, 3.3, P.oakDark, { at: [F.x, 0.4, front], facing: '+z', shape: 'round' });
    b.panel(2.7, 3.6, tint(stone, 0.06), { at: [F.x, 0.4, front - 0.02], facing: '+z', shape: 'round' });

    // praefurnium roof, stoke-hole, flue and fuel
    const pz = back - 1.1;
    b.shed(6.3, 2.5, 0.9, tile, { at: [C.x, 3.2, pz], high: '+z' });
    b.panel(1.3, 1.5, P.black, { at: [C.x, 0, back - 2.2], facing: '-z', shape: 'round' });
    b.panel(1.8, 1.8, P.brickDark, { at: [C.x, 0, back - 2.22], facing: '-z', shape: 'round' });
    b.cyl(0.35, 2.6, tile, { at: [C.x + 2.2, 3.2, pz], segs: 6 });
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3 - (i % 2); j++) {
        b.log(0.15, 1.6, P.bark, { at: [C.x - 4.0 + j * 0.34 + (i % 2) * 0.17, i * 0.27, back - 1.2], axis: 'z', segs: 5 });
      }
    }

    // ---------------------------------------------------------------- palaestra
    const Y = BATHS.yard;
    const wallT = 0.6;
    b.gable(5.8, 2.4, 1.3, tile, { at: [0, Y.wallH + 1.0, Y.front - wallT / 2], overhang: 0.2, wall: plaster });
    b.box(5.8, 0.4, 2.0, stone, { at: [0, Y.wallH + 0.6, Y.front - wallT / 2] });

    // porticoes on three sides: Tuscan columns, architrave, tiled lean-to roofs
    const colH = 3.2;
    const inner = Y.x - wallT;
    const cx = inner - Y.depth; // colonnade line on the sides
    const cz = Y.front - wallT - Y.depth; // colonnade line at the front
    const col = tint(stone, 0.05);
    b.sym((s) => {
      for (const z of spread(5, front, cz)) b.column(0.24, colH, col, { at: [s * cx, 0, z], order: 'tuscan', segs: 7 });
      b.box(0.45, 0.4, cz - front + 0.4, col, { at: [s * cx, colH, (cz + front) / 2] });
      b.shed(Y.depth + 0.6, cz - front, 0.9, tile, { at: [s * (cx + Y.depth / 2), colH + 0.4, (cz + front) / 2], high: s > 0 ? '+x' : '-x' });
    });
    for (const x of spread(9, -cx, cx)) b.column(0.24, colH, col, { at: [x, 0, cz], order: 'tuscan', segs: 7 });
    b.sym((s) => b.column(0.24, colH, col, { at: [s * cx, 0, cz], order: 'tuscan', segs: 7 }));
    b.box(cx * 2 + 0.45, 0.4, 0.45, col, { at: [0, colH, cz] });
    b.shed(cx * 2 + Y.depth * 2, Y.depth + 0.6, 0.9, tile, { at: [0, colH + 0.4, cz + Y.depth / 2 - 0.3], high: '+z' });

    // water in the plunge pool
    b.box(5.8, 0.05, 2.8, P.water, { at: [-5, 0.46, 3.8], mat: 'glass' });

    // ---------------------------------------------------------------- walk collisions
    b.collider(BATHS.C[1] - BATHS.F[0] + 1.8 + BATHS.apseR, D + 0.6, { at: [(BATHS.C[1] + BATHS.apseR + BATHS.F[0] - 1.8) / 2, 0, zc] });
    b.collider(6, 2.2, { at: [C.x, 0, pz] });
    const yardD = Y.front - front;
    const yzc = (Y.front + front) / 2;
    b.sym((s) => {
      b.collider(wallT, yardD, { at: [s * (Y.x - wallT / 2), 0, yzc] });
      b.collider(Y.x - 2.2, wallT, { at: [(s * (Y.x + 2.2)) / 2, 0, Y.front - wallT / 2] });
    });
    b.collider(6.4, 3.4, { at: [-5, 0, 3.8] });
  },
};
