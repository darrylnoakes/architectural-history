import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { facet, thermalWindow } from './shared';

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

/** Stone wall face with red tile bonding courses, as a solid box. */
export function lacedBox(b: Builder, w: number, h: number, d: number, stone: number, at: [number, number, number]): void {
  b.box(w, h, d, stone, { at });
  for (let y = 1.1; y < h - 0.4; y += 1.25) {
    b.box(w + 0.06, 0.22, d + 0.06, P.romanTile, { at: [at[0], at[1] + y, at[2]], jitter: false });
  }
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
    const room = (r: readonly [number, number, number]) => ({ x: (r[0] + r[1]) / 2, w: r[1] - r[0], h: r[2] });
    const F = room(BATHS.F);
    const T = room(BATHS.T);
    const C = room(BATHS.C);
    b.box(BATHS.C[1] - BATHS.F[0] + 0.6, 0.4, D + 0.6, tint(stone, -0.05), { at: [(BATHS.C[1] + BATHS.F[0]) / 2, 0, zc] });
    for (const r of [F, T, C]) lacedBox(b, r.w, r.h, D, stone, [r.x, 0.4, zc]);

    // frigidarium: timber roof, tiled, gable to the yard
    b.gable(F.w + 0.1, D, 3.2, tile, { at: [F.x, F.h + 0.4, zc], ridge: 'z', overhang: 0.35, wall: plaster });
    b.window(1.6, 0.9, { at: [F.x, F.h + 1.0, front + 0.02], facing: '+z', shape: 'round', frame: stone, bars: [2, 1] });
    // cold plunge pool projecting from the end wall
    lacedBox(b, 1.8, 3.2, 4.5, stone, [BATHS.F[0] - 0.9, 0.4, zc]);
    b.shed(1.8, 4.5, 0.8, tile, { at: [BATHS.F[0] - 0.9, 3.6, zc], high: '+x' });

    // tepidarium and caldarium: barrel vaults running front to back, thermal windows in the ends
    for (const r of [T, C]) {
      const top = r.h + 0.4;
      b.box(r.w + 0.3, 0.3, D + 0.3, tint(stone, 0.04), { at: [r.x, top - 0.3, zc] });
      b.vault(r.w + 0.3, D + 0.3, tile, { at: [r.x, top, zc], squash: 0.75, segs: 10 });
      for (const s of [1, -1]) {
        b.vault(r.w - 0.2, 0.16, plaster, { at: [r.x, top, zc + s * (D / 2 + 0.08)], squash: 0.73, segs: 10 });
        thermalWindow(b, r.w * 0.27, stone, { at: [r.x, top + 0.1, zc + s * (D / 2 + 0.16)], facing: s > 0 ? '+z' : '-z' });
      }
    }
    // the apse at the end of the caldarium, with its half dome
    const ax = BATHS.C[1];
    b.cyl(BATHS.apseR, 5, stone, { at: [ax, 0.4, zc], segs: 14 });
    for (const y of [1.5, 2.75, 4.0]) b.cyl(BATHS.apseR + 0.04, 0.22, tile, { at: [ax, 0.4 + y, zc], segs: 14, jitter: false });
    b.dome(BATHS.apseR + 0.15, tile, { at: [ax, 5.4, zc], squash: 0.75, segs: 14 });
    for (const i of [2, 3, 4]) {
      const [fx, fz, fa] = facet(i, 14, BATHS.apseR);
      b.window(0.8, 1.6, { at: [ax + fx, 2.6, zc + fz], facing: fa, shape: 'round', frame: stone });
    }

    // front to the yard: arched entrance to the frigidarium, small high windows to the hot rooms
    b.panel(2.2, 3.3, P.oakDark, { at: [F.x, 0.4, front], facing: '+z', shape: 'round' });
    b.panel(2.7, 3.6, tint(stone, 0.06), { at: [F.x, 0.4, front - 0.02], facing: '+z', shape: 'round' });
    b.sym((s) => b.window(0.9, 1.6, { at: [F.x + s * 2.9, 2.6, front], facing: '+z', shape: 'round', frame: stone }));
    for (const r of [T, C]) {
      for (const x of spread(2, r.x - r.w / 2, r.x + r.w / 2)) {
        b.window(0.9, 1.5, { at: [x, 3.4, front], facing: '+z', shape: 'round', frame: stone });
        b.window(0.9, 1.5, { at: [x, 3.4, back], facing: '-z', shape: 'round', frame: stone });
      }
    }
    b.window(0.9, 1.6, { at: [F.x, 2.6, back], facing: '-z', shape: 'round', frame: stone });
    // flue vents along the hot-room eaves
    for (const x of spread(6, BATHS.T[0], BATHS.C[1])) {
      b.box(0.35, 0.5, 0.35, tile, { at: [x, T.h + 0.4, back + 0.3] });
    }

    // praefurnium: the furnace house behind the caldarium, with its stoke-hole and fuel
    const pz = back - 1.1;
    lacedBox(b, 6, 3.2, 2.2, stone, [C.x, 0, pz]);
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
    const yardD = Y.front - front;
    const yzc = (Y.front + front) / 2;
    b.box(Y.x * 2 - wallT * 2, 0.06, yardD - wallT, tint(P.sand, -0.04), { at: [0, 0, yzc - wallT / 2] });
    // enclosure walls (front wall split by the gateway)
    b.sym((s) => {
      lacedBox(b, wallT, Y.wallH, yardD, stone, [s * (Y.x - wallT / 2), 0, yzc]);
      lacedBox(b, Y.x - 2.2, Y.wallH, wallT, stone, [s * (Y.x + 2.2) / 2, 0, Y.front - wallT / 2]);
      b.box(1.0, Y.wallH + 1.0, wallT + 0.3, tint(stone, 0.05), { at: [s * 2.4, 0, Y.front - wallT / 2] });
    });
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

    // open-air plunge pool (natatio) in the yard
    b.box(6.4, 0.5, 3.4, tint(stone, 0.06), { at: [-5, 0, 3.8] });
    b.box(5.8, 0.05, 2.8, P.water, { at: [-5, 0.42, 3.8], mat: 'glass' });
    b.stairs(1.6, 0.5, 0.8, 2, tint(stone, 0.06), { at: [-5, 0, 5.9] });

    // ---------------------------------------------------------------- walk collisions
    b.collider(BATHS.C[1] - BATHS.F[0] + 1.8 + BATHS.apseR, D + 0.6, { at: [(BATHS.C[1] + BATHS.apseR + BATHS.F[0] - 1.8) / 2, 0, zc] });
    b.collider(6, 2.2, { at: [C.x, 0, pz] });
    b.sym((s) => {
      b.collider(wallT, yardD, { at: [s * (Y.x - wallT / 2), 0, yzc] });
      b.collider(Y.x - 2.2, wallT, { at: [(s * (Y.x + 2.2)) / 2, 0, Y.front - wallT / 2] });
    });
    b.collider(6.4, 3.4, { at: [-5, 0, 3.8] });
  },
};
