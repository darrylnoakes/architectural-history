import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archPts, lowWall, onFace, plate } from './shared';

/** A Romanesque twin window in the local face frame: two round-headed lights on a colonnette under a relieving arch. */
function twin(b: Builder, x: number, y: number, w: number, h: number, stone: number): void {
  plate(b, archPts(x, y - 0.12, w + 0.36, h + 0.3, 'round', 8), 0.08, tint(stone, 0.05));
  plate(b, archPts(x, y, w, h, 'round', 8), 0.1, tint(stone, -0.08));
  const lw = (w - 0.2) / 2;
  const lh = h - w / 2 + lw * 0.2;
  for (const s of [-1, 1]) plate(b, archPts(x + (s * (lw + 0.2)) / 2, y, lw, lh, 'round', 4), 0.12, P.windowDark);
  const sp = lh - lw / 2;
  b.cyl(0.08, sp - 0.15, tint(stone, 0.05), { at: [x, y + 0.05, 0.18], segs: 6, jitter: false });
  b.box(0.26, 0.16, 0.24, tint(stone, 0.05), { at: [x, y + sp - 0.12, 0.18], jitter: false });
  b.box(w + 0.3, 0.12, 0.2, tint(stone, 0.05), { at: [x, y - 0.18, 0.1], jitter: false });
}

/** A row of little corbels carrying the eaves (a Romanesque corbel table) along local x. */
function corbels(b: Builder, x0: number, x1: number, y: number, stone: number): void {
  const n = Math.round((x1 - x0) / 0.8);
  for (let i = 0; i <= n; i++) b.box(0.2, 0.26, 0.3, stone, { at: [x0 + ((x1 - x0) * i) / n, y - 0.26, 0.15], jitter: false });
  b.box(x1 - x0 + 0.3, 0.16, 0.38, stone, { at: [(x0 + x1) / 2, y, 0.19], jitter: false });
}

/** Where the square tower stands: beside the hall in the Romanesque house, kept at the corner of the court by the Gothic hôtel. */
export const TOWER = { x: 8.25, z: -6.5, size: 5.5, h: 15 };

/**
 * The square tower of the Romanesque house: rubble with flat ashlar buttresses, round-headed windows
 * and battlements. The Gothic hôtel keeps it, so both build it here with the same numbers.
 */
export function keepTower(b: Builder, rub: number, ash: number, door: number): void {
  const tx = TOWER.x;
  const tz = TOWER.z;
  const ts = TOWER.size;
  const th = TOWER.h;
  b.box(ts, th, ts, rub, { at: [tx, 0, tz] });
  b.collider(ts + 0.6, ts + 0.6, { at: [tx, 0, tz] });
  // flat Romanesque buttresses at the corners, set back in steps
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.box(0.9, th - 1.6, 0.3, ash, { at: [tx + sx * (ts / 2 - 0.45), 0, tz + sz * (ts / 2 + 0.15)] });
    b.box(0.3, th - 1.6, 0.9, ash, { at: [tx + sx * (ts / 2 + 0.15), 0, tz + sz * (ts / 2 - 0.45)] });
  }
  // battlements on a string course
  b.box(ts + 0.5, 0.3, ts + 0.5, ash, { at: [tx, th - 0.3, tz] });
  b.crenel(ts + 0.5, ts + 0.5, ash, { at: [tx, th, tz], merlonW: 0.7, merlonH: 1.0, t: 0.45 });
  b.box(ts - 0.4, 0.15, ts - 0.4, P.lead, { at: [tx, th - 0.1, tz] });
  for (const f of ['+z', '-z', '+x'] as const) {
    const at: [number, number, number] = f === '+z' ? [tx, 0, tz + ts / 2] : f === '-z' ? [tx, 0, tz - ts / 2] : [tx + ts / 2, 0, tz];
    onFace(b, f, at, () => {
      for (const y of [5.0, 9.0]) {
        plate(b, archPts(0, y, 0.75, 1.5, 'round', 6), 0.08, ash);
        plate(b, archPts(0, y + 0.1, 0.4, 1.2, 'round', 4), 0.1, P.windowDark);
      }
      twin(b, 0, 12.0, 1.2, 1.8, ash);
    });
  }
  onFace(b, '+z', [tx, 0, tz + ts / 2], () => {
    plate(b, archPts(0, 0, 1.5, 2.6, 'round', 6), 0.08, ash);
    plate(b, archPts(0, 0, 1.0, 2.3, 'round', 6), 0.12, door);
  });
}

/** The well of the court, a kerb of ashlar; the Gothic hôtel keeps it and gives it an iron frame. */
export function courtWell(b: Builder, stone: number): void {
  b.cyl(0.75, 0.9, stone, { at: [3.2, 0, 5.0], segs: 10 });
  b.cyl(0.6, 0.92, 0x2a3036, { at: [3.2, 0, 5.0], segs: 10 });
}

export const maisonForte: BuildingDef = {
  id: 'maison-forte',
  name: 'Romanesque stone house with tower',
  style: 'Romanesque',
  date: 'c. 1150',
  summary:
    'For the first time since the Romans the richest family builds in stone: a house that is half home and half stronghold, with a square tower beside it. ' +
    'The living rooms are all upstairs: a hall on the first floor over a vaulted undercroft for stores and goods, reached by an outside stair, so the ground floor can be shut fast. ' +
    'The hall is lit by pairs of round-headed lights divided by a little column; there are still no chimney stacks, and the hearth smoke escapes through the roof.',
  materials: ['limestone ashlar dressings', 'rubble walls', 'flat clay roof tiles', 'oak'],
  modelledOn: 'Generic; the twin windows and first-floor hall follow surviving twelfth-century stone houses such as those of Cluny and Saint-Antonin-Noble-Val, the tower the fortified town houses of the period',
  lookFor: [
    { label: 'Twin round-arched windows', note: 'Two round-headed lights divided by a colonnette under one relieving arch: the typical window of a Romanesque hall.', at: [-4.0, 6.0, -1.7] },
    { label: 'First-floor hall over an undercroft', note: 'The family lived upstairs; the vaulted ground floor, with only slits and a strong door, held stores and merchandise.', at: [2.0, 2.0, -1.7] },
    { label: 'Outside stair', note: 'A stone stair up the front to the hall door: the only way in to the living floor.', at: [-2.4, 2.4, -0.6] },
    { label: 'Tower', note: 'A square tower with flat buttresses and battlements: a refuge and a badge of rank.', at: [8.25, 13.0, -4.0] },
    { label: 'Corbel table', note: 'A row of small carved stone brackets carrying the eaves, a Romanesque habit.', at: [-6.0, 7.8, -1.6] },
  ],
  build(b) {
    const rub = b.pick([P.rubble, tint(P.rubble, 0.04), P.ragstone]);
    const ash = b.pick([P.pierreBlonde, P.limestone]);
    const tile = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.05), P.tileBrown]);
    const door = b.pick([P.oakDark, P.oak]);
    const W = 13.5;
    const D = 8;
    const mx = -1.25; // centre of the main block
    const mz = -6;
    const G = 3.6; // undercroft
    const F = 4.4; // hall
    const H = G + F;
    const zf = mz + D / 2; // front face, -2

    // ---- the main block: rubble walls, ashlar quoins
    b.box(W, H, D, rub, { at: [mx, 0, mz] });
    b.collider(W, D, { at: [mx, 0, mz] });
    b.box(W + 0.12, 0.5, D + 0.12, tint(rub, -0.05), { at: [mx, 0, mz] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      for (let i = 0; i < 12; i++) {
        const long = i % 2 === 0;
        b.box(long ? 0.8 : 0.45, H / 12 - 0.03, long ? 0.45 : 0.8, ash, { at: [mx + sx * (W / 2 - (long ? 0.38 : 0.2)), (i * H) / 12, mz + sz * (D / 2 - (long ? 0.2 : 0.38))].map((v, k) => (k === 0 ? v + sx * 0.03 : k === 2 ? v + sz * 0.03 : v)) as [number, number, number], jitter: false });
      }
    }
    // steep tiled roof with coped gables
    const rh = (D / 2) * 1.2;
    b.gable(W, D, rh, tile, { at: [mx, H, mz], overhang: 0.35, wall: rub });
    for (const s of [-1, 1]) b.beam([mx + s * (W / 2 + 0.05), H, mz - D / 2 - 0.1], [mx + s * (W / 2 + 0.05), H + rh + 0.15, mz], 0.45, 0.25, ash);
    for (const s of [-1, 1]) b.beam([mx + s * (W / 2 + 0.05), H, mz + D / 2 + 0.1], [mx + s * (W / 2 + 0.05), H + rh + 0.15, mz], 0.45, 0.25, ash);
    b.box(W + 0.4, 0.22, 0.26, tint(tile, -0.1), { at: [mx, H + rh + 0.05, mz] });
    // a smoke louvre on the ridge instead of a chimney
    b.box(0.9, 0.5, 0.7, tint(tile, -0.08), { at: [mx - 2.0, H + rh, mz] });
    b.gable(1.2, 1.0, 0.5, tile, { at: [mx - 2.0, H + rh + 0.5, mz], overhang: 0.05 });

    // ---- front (onto the court)
    onFace(b, '+z', [mx, 0, zf], () => {
      // undercroft: a wide round-arched door and slit windows
      plate(b, archPts(3.6, 0, 2.6, 2.9, 'round', 8), 0.1, ash);
      plate(b, archPts(3.6, 0, 2.0, 2.6, 'round', 8), 0.14, door);
      for (let i = 0; i < 9; i++) {
        const t = Math.PI - ((i + 0.5) / 9) * Math.PI;
        b.box(0.12, 0.45, 0.16, tint(ash, -0.1), { at: [3.6 + Math.cos(t) * 1.15, 1.6 + Math.sin(t) * 1.15 - 0.2, 0.14], rot: [0, 0, t - Math.PI / 2], jitter: false });
      }
      for (const x of [-4.5, -0.8]) {
        plate(b, archPts(x, 1.2, 0.5, 1.3, 'rect'), 0.08, ash);
        plate(b, archPts(x, 1.35, 0.16, 1.0, 'rect'), 0.1, P.windowDark);
      }
      // hall: twin windows, the upper door
      for (const x of [-4.0, -0.4]) twin(b, x, G + 1.1, 1.5, 2.3, ash);
      plate(b, archPts(3.6, G, 1.6, 2.7, 'round', 8), 0.1, ash);
      plate(b, archPts(3.6, G, 1.1, 2.4, 'round', 8), 0.14, door);
      b.box(W, 0.18, 0.18, ash, { at: [0, G - 0.1, 0.09], jitter: false });
      corbels(b, -W / 2 + 0.3, W / 2 - 0.3, H, ash);
    });
    // ---- the outside stair and its landing
    const sx0 = mx - 4.6;
    b.box(1.9, G - 0.1, 2.0, rub, { at: [mx + 3.6, 0, zf + 1.0] });
    b.box(2.1, 0.2, 2.2, ash, { at: [mx + 3.6, G - 0.1, zf + 1.0] });
    b.stairs(1.6, G - 0.1, 7.6, 16, ash, { at: [(sx0 + mx + 2.65) / 2, 0, zf + 0.8 + 0.0], rotY: -Math.PI / 2 });
    b.beam([sx0 + 0.1, 0.9, zf + 1.68], [mx + 2.65, G + 0.75, zf + 1.68], 0.3, 0.5, rub);
    b.collider(9.6, 2.2, { at: [(sx0 + mx + 4.55) / 2, 0, zf + 1.0] });

    // ---- back and ends: plainer, smaller windows
    onFace(b, '-z', [mx, 0, mz - D / 2], () => {
      for (const x of [-3.0, 2.5]) twin(b, x, G + 1.1, 1.3, 2.1, ash);
      for (const x of [-4.5, 0, 4.5]) {
        plate(b, archPts(x, 1.2, 0.5, 1.3, 'rect'), 0.08, ash);
        plate(b, archPts(x, 1.35, 0.16, 1.0, 'rect'), 0.1, P.windowDark);
      }
      corbels(b, -W / 2 + 0.3, W / 2 - 0.3, H, ash);
    });
    onFace(b, '-x', [mx - W / 2, 0, mz], () => {
      twin(b, 0, G + 1.1, 1.4, 2.2, ash);
      plate(b, archPts(0, H + 1.4, 0.4, 0.9, 'round', 4), 0.1, P.windowDark);
    });

    // ---- the tower, on the +X end (kept in the Gothic hôtel that follows)
    keepTower(b, rub, ash, door);
    const tz = TOWER.z;
    const ts = TOWER.size;

    // ---- the court: walls, a gate arch, a kitchen apart, a well
    const cz = 11.6;
    const X = 11.4;
    const wallC = tint(rub, 0.03);
    lowWall(b, -X, cz, -2.0, cz, 3.0, wallC, ash);
    lowWall(b, 2.0, cz, X, cz, 3.0, wallC, ash);
    lowWall(b, -X, cz, -X, zf - 0.2, 3.0, wallC, ash);
    lowWall(b, X, cz, X, tz + ts / 2 + 0.4, 3.0, wallC, ash);
    lowWall(b, -X, mz - D / 2, -X, zf - 0.4, 3.0, wallC, ash);
    lowWall(b, -X - 0.2, mz - D / 2, mx - W / 2, mz - D / 2, 3.0, wallC, ash);
    b.collider(X - 2.0, 0.6, { at: [-(X + 2.0) / 2, 0, cz] });
    b.collider(X - 2.0, 0.6, { at: [(X + 2.0) / 2, 0, cz] });
    b.collider(0.6, cz - zf, { at: [-X, 0, (cz + zf) / 2] });
    b.collider(0.6, cz - (tz + ts / 2), { at: [X, 0, (cz + tz + ts / 2) / 2] });
    b.archWall(4.4, 4.6, 0.9, ash, { at: [0, 0, cz], openings: 1, openW: 3.0, openH: 3.9, shape: 'round' });
    b.gable(4.8, 1.4, 0.9, tile, { at: [0, 4.6, cz], overhang: 0.1, wall: ash });
    b.box(3.2, 0.05, 3.0, P.cobble, { at: [0, 0, cz - 0.5] });
    // the kitchen, apart from the house for fear of fire: timber and cob under tile
    const kx = -7.6;
    const kz = 5.0;
    b.box(5.0, 2.8, 4.0, P.torchis, { at: [kx, 0, kz] });
    b.frame(5.0, 2.8, P.oakDark, { at: [kx, 0, kz + 2.0], facing: '+z', studs: 3, rails: 1, beam: 0.16 });
    b.frame(4.0, 2.8, P.oakDark, { at: [kx + 2.5, 0, kz], facing: '+x', studs: 2, rails: 1, beam: 0.16 });
    b.gable(5.0, 4.0, 2.4, tile, { at: [kx, 2.8, kz], overhang: 0.3, wall: P.torchis });
    b.box(1.0, 2.0, 0.1, door, { at: [kx + 0.8, 0, kz + 2.05] });
    b.collider(5.0, 4.0, { at: [kx, 0, kz] });
    courtWell(b, ash);
    b.box(3.0, 0.05, 2.0, P.cobble, { at: [3.0, 0, 5.0] });
  },
};
