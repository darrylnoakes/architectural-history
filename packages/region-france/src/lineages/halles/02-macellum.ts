import { P, linspace, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { amphora, goods, paving, slab } from './shared';

const STONE = P.pierreBlonde;
const WALL = mix(P.pierreBlonde, P.rubble, 0.35); // small squared stones (petit appareil)
const BRICK = P.briqueNord;
const TILE = P.romanTile;

/**
 * A roof sloping in toward a courtyard all round: the outer edge of the rectangle [ox0, ox1] × [oz0, oz1]
 * at yOut, the inner edge [ix0, ix1] × [iz0, iz1] at yIn, with rows of cover tiles (imbrices) on every face.
 */
function courtRoof(b: Builder, o: [number, number, number, number], i: [number, number, number, number], yOut: number, yIn: number): void {
  const [ox0, ox1, oz0, oz1] = o;
  const [ix0, ix1, iz0, iz1] = i;
  const O: Vec3[] = [[ox0, yOut, oz0], [ox1, yOut, oz0], [ox1, yOut, oz1], [ox0, yOut, oz1]];
  const I: Vec3[] = [[ix0, yIn, iz0], [ix1, yIn, iz0], [ix1, yIn, iz1], [ix0, yIn, iz1]];
  for (let k = 0; k < 4; k++) {
    const j = (k + 1) % 4;
    slab(b, [O[k], O[j], I[j], I[k]], 0.18, TILE);
  }
  // imbrex rows: on each face, from the outer edge down to the inner edge or to the hip line
  const rib = tint(TILE, -0.08);
  const lerp = (a: Vec3, c: Vec3, t: number): Vec3 => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  for (let k = 0; k < 4; k++) {
    const j = (k + 1) % 4;
    const a = O[k];
    const c = O[j];
    const len = Math.hypot(c[0] - a[0], c[2] - a[2]);
    const n = Math.round(len / 0.9);
    for (let s = 1; s < n; s++) {
      const t = s / n;
      const p0 = lerp(a, c, t);
      // where this rib meets the inner edge or a hip: walk toward the court perpendicular to the edge
      const ix = Math.max(ix0, Math.min(ix1, p0[0]));
      const iz = Math.max(iz0, Math.min(iz1, p0[2]));
      let p1: Vec3;
      const alongX = Math.abs(c[2] - a[2]) < 0.01;
      if (alongX) {
        // the hip runs from the outer corner to the inner corner; find z on it at this x
        const inside = p0[0] >= ix0 && p0[0] <= ix1;
        if (inside) p1 = [p0[0], yIn, iz];
        else {
          const corner = p0[0] < ix0 ? 0 : 1;
          const oc = O[(k === 0 ? [0, 1] : [3, 2])[corner]];
          const icn = I[(k === 0 ? [0, 1] : [3, 2])[corner]];
          const tt = (p0[0] - oc[0]) / (icn[0] - oc[0]);
          p1 = lerp(oc, icn, tt);
        }
      } else {
        const inside = p0[2] >= iz0 && p0[2] <= iz1;
        if (inside) p1 = [ix, yIn, p0[2]];
        else {
          const corner = p0[2] < iz0 ? 0 : 1;
          const oc = O[(k === 1 ? [1, 2] : [0, 3])[corner]];
          const icn = I[(k === 1 ? [1, 2] : [0, 3])[corner]];
          const tt = (p0[2] - oc[2]) / (icn[2] - oc[2]);
          p1 = lerp(oc, icn, tt);
        }
      }
      if (Math.hypot(p1[0] - p0[0], p1[2] - p0[2]) < 0.5) continue;
      b.beam([p0[0], p0[1] + 0.05, p0[2]], [p1[0], p1[1] + 0.05, p1[2]], 0.13, 0.09, rib);
    }
  }
}

/** Bands of brick through a wall face: the Gallo-Roman way of levelling courses of small stone. */
function brickBands(b: Builder, len: number, at: Vec3, rotY: number, h: number): void {
  b.group({ at, rotY }, () => {
    for (let y = 1.1; y < h - 0.4; y += 1.25) b.box(len, 0.16, 0.06, BRICK, { at: [0, y, 0.0], jitter: false });
  });
}

/** A shop (taberna): a wide opening with a stone threshold, a counter, a lintel and a small window over it. */
function taberna(b: Builder, x: number, z: number, w: number, facing: '+x' | '-x' | '+z' | '-z', y0: number, goodsKinds: Parameters<typeof goods>[4]): void {
  const rot = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 }[facing];
  b.group({ at: [x, y0, z], rotY: rot }, () => {
    b.panel(w, 2.7, P.windowDark, { depth: 0.03 });
    // wooden shutter boards stacked to one side, as they were by day
    b.panel(0.5, 2.6, P.oak, { at: [-w / 2 + 0.3, 0, 0.03], depth: 0.05 });
    b.box(w + 0.5, 0.28, 0.3, STONE, { at: [0, 2.7, 0.1] });
    b.box(w + 0.2, 0.1, 0.5, STONE, { at: [0, -0.02, 0.2] }); // grooved threshold
    // masonry counter faced with a stone slab
    b.box(w * 0.6, 0.85, 0.55, P.plaster, { at: [w * 0.15, 0, 0.35] });
    b.box(w * 0.6 + 0.1, 0.07, 0.62, STONE, { at: [w * 0.15, 0.85, 0.35] });
    goods(b, w * 0.55, [w * 0.15, 0.92, 0.35], 0, goodsKinds);
    b.window(0.7, 0.45, { at: [0, 3.25, 0], frame: STONE, bars: [2, 1], border: 0.06 });
  });
}

export const macellum: BuildingDef = {
  id: 'macellum',
  name: 'Food market (macellum)',
  style: 'Gallo-Roman',
  date: 'c. AD 50 to 200',
  summary:
    'The Roman town gives itself a proper food market, usually paid for by a rich citizen whose name is carved over the door. ' +
    'Shops (tabernae) for meat, fish, oil and wine open onto a small courtyard behind a colonnade, where the magistrates can check weights and prices, and a portico shelters the shops facing the street. ' +
    'For the first time trade has a building of its own, of mortared stone in small squared blocks levelled with bands of brick, under roofs of Roman tile. ' +
    'Like most of the open town it did not survive the invasions of 275, and its stones went into the new wall.',
  materials: ['limestone in small squared blocks (petit appareil)', 'brick bands', 'tegulae and imbrices', 'timber shutters'],
  lookFor: [
    { label: 'Street portico', note: 'A colonnade along the street front shelters shoppers and the shops that open outward.', at: [-7.2, 3.6, 10.4] },
    { label: 'Courtyard colonnade', note: 'Inside, a ring of columns round a small court; the shops open onto the covered walk behind it.', at: [4.6, 3.4, 2.6] },
    { label: 'Tabernae', note: 'Each shop is one deep room with a wide opening, closed at night with boards slid into a grooved stone threshold.', at: [-7.6, 1.6, -3.4] },
    { label: 'Table of measures', note: 'A stone table hollowed into cups of standard sizes (mensa ponderaria), so buyers could check the measures sold to them.', at: [1.9, 1.3, -1.4] },
    { label: 'Brick bands', note: 'Walls of small squared stones with courses of brick every metre or so: the typical facing of Gallo-Roman masonry.', at: [12.2, 2.4, -3.0] },
  ],
  modelledOn: 'The plan of the macellum excavated at Saint-Bertrand-de-Comminges (Lugdunum Convenarum), much simplified; the brick-banded masonry is the usual Gallo-Roman facing',
  influences: ['roman-conquest'],
  build(b) {
    const X = 12; // half width
    const ZB = -9.6; // back wall
    const ZF = 7.8; // street wall
    const T = 0.6;
    const H = 5.0; // outer wall top
    const F = 0.25; // floor
    // court colonnade and shop-front lines
    const CX = 4.8;
    const CZ0 = -4.6;
    const CZ1 = 2.2;
    const SX = 7.6;
    const SZ0 = -6.8;
    const SZ1 = 4.6;

    paving(b, 2 * X + 1.2, 21.6, tint(P.gravel, -0.04), 0.06, [0, 0, 0.3], 6);
    b.box(2 * X, F, ZF - ZB, tint(STONE, -0.05), { at: [0, 0, (ZF + ZB) / 2] });
    b.box(2 * CX - 0.6, 0.03, CZ1 - CZ0 - 0.6, P.gravel, { at: [0, F, (CZ0 + CZ1) / 2], jitter: false });

    // ---- outer walls, with brick bands and a plinth
    const wallRun = (len: number, at: Vec3, rotY: number) => {
      b.group({ at, rotY }, () => b.box(len, H, T, WALL));
      brickBands(b, len, [at[0] + Math.sin(rotY) * (T / 2 + 0.01), at[1], at[2] + Math.cos(rotY) * (T / 2 + 0.01)], rotY, H);
    };
    wallRun(ZF - ZB, [X - T / 2, 0, (ZF + ZB) / 2], Math.PI / 2);
    wallRun(ZF - ZB, [-X + T / 2, 0, (ZF + ZB) / 2], -Math.PI / 2);
    wallRun(2 * X, [0, 0, ZB + T / 2], Math.PI);
    // the street wall, its lower part all shop openings
    for (const sx of [-1, 1]) b.box(X - 1.5, H, T, WALL, { at: [sx * (X + 1.5) / 2, 0, ZF - T / 2] });
    b.box(3.0, H - 3.9, T, WALL, { at: [0, 3.9, ZF - T / 2] });
    for (let y = 3.6; y < H - 0.3; y += 1.25) b.box(2 * X, 0.16, 0.06, BRICK, { at: [0, y, ZF + 0.01], jitter: false });
    b.box(2 * X + 0.3, 0.3, ZF - ZB + 0.3, STONE, { at: [0, 0, (ZF + ZB) / 2] }); // plinth

    // small high windows and a side door in the blind side and back walls
    for (const s of [-1, 1] as const) {
      const facing = s > 0 ? '+x' : '-x';
      for (const z of [-6.6, -2.2, 2.2]) b.window(0.6, 0.6, { at: [s * X, 3.6, z], facing, frame: BRICK, bars: [2, 1], border: 0.07 });
      b.panel(1.5, 2.6, P.oakDark, { at: [s * X, F, 5.6], facing, shape: 'round' });
      b.panel(1.9, 0.95, BRICK, { at: [s * X, F + 1.9, 5.6], facing, shape: 'round', depth: 0.03 });
    }
    for (const x of [-8, -4, 4, 8]) b.window(0.6, 0.6, { at: [x, 3.6, ZB], facing: '-z', frame: BRICK, bars: [2, 1], border: 0.07 });
    b.collider(T, ZF - ZB, { at: [X - T / 2, 0, (ZF + ZB) / 2] });
    b.collider(T, ZF - ZB, { at: [-X + T / 2, 0, (ZF + ZB) / 2] });

    // ---- the shop ranges: solid blocks between the outer wall and the court walk
    const block = (x0: number, x1: number, z0: number, z1: number) => {
      b.box(x1 - x0, H - 0.4 - F, z1 - z0, P.plaster, { at: [(x0 + x1) / 2, F, (z0 + z1) / 2] });
      b.collider(x1 - x0, z1 - z0, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
    };
    block(SX, X - T, ZB + T, SZ1 + 0.01);
    block(-X + T, -SX, ZB + T, SZ1 + 0.01);
    block(-SX, SX, ZB + T, SZ0);
    // front range: two blocks either side of the entrance passage
    block(1.6, X - T, SZ1, ZF - T);
    block(-X + T, -1.6, SZ1, ZF - T);
    b.collider(2 * X, T, { at: [0, 0, ZB + T / 2] });

    // shops onto the court walk: fish and meat on the west, oil, wine and grain on the east, more at the back
    for (const z of linspace(3, SZ0 + 1.9, SZ1 - 1.9)) {
      taberna(b, -SX, z, 2.4, '+x', F, ['fish']);
      taberna(b, SX, z, 2.4, '-x', F, ['pot', 'sack']);
    }
    for (const x of [-4.8, -1.6, 1.6, 4.8]) taberna(b, x, SZ0, 2.2, '+z', F, ['basket', 'fruit', 'cheese']);
    // shops facing the street under the portico
    for (const x of [-9.6, -6.0, -2.9, 2.9, 6.0, 9.6]) taberna(b, x, ZF, 2.4, '+z', F, ['basket', 'pot', 'cloth']);
    // the entrance: an opening through the street wall, framed in stone
    for (const sx of [-1, 1]) b.box(0.3, 3.9 - F, 0.12, STONE, { at: [sx * 1.6, F, ZF + 0.05] });
    // the court face of the front range, painted
    for (const s of [-1, 1]) b.panel(SX - 1.6 - 0.4, 1.1, P.intonacoRed, { at: [s * (SX + 1.6) / 2, F, SZ1], facing: '-z', depth: 0.03 });

    // ---- the colonnade round the court, carrying a beam
    const colH = 3.65;
    const cols: [number, number][] = [];
    for (const x of linspace(5, -CX, CX)) cols.push([x, CZ0], [x, CZ1]);
    for (const z of linspace(4, CZ0, CZ1).slice(1, -1)) cols.push([CX, z], [-CX, z]);
    for (const [x, z] of cols) {
      b.column(0.21, colH, STONE, { at: [x, F, z], order: 'tuscan', segs: 6 });
      b.collider(0.45, 0.45, { at: [x, 0, z] });
    }
    for (const z of [CZ0, CZ1]) b.box(2 * CX + 0.5, 0.36, 0.45, STONE, { at: [0, F + colH, z] });
    for (const x of [-CX, CX]) b.box(0.45, 0.36, CZ1 - CZ0 + 0.5, STONE, { at: [x, F + colH, (CZ0 + CZ1) / 2] });

    // ---- the roof, falling in toward the court on every side
    courtRoof(b, [-X - 0.3, X + 0.3, ZB - 0.3, ZF + 0.05], [-CX - 0.25, CX + 0.25, CZ0 - 0.25, CZ1 + 0.25], H + 0.55, F + colH + 0.5);

    // ---- in the court: the table of measures, a basin, amphorae
    b.group({ at: [1.9, F, -1.4] }, () => {
      for (const sx of [-1, 1]) b.box(0.25, 0.75, 0.5, STONE, { at: [sx * 0.6, 0, 0] });
      b.box(1.6, 0.22, 0.6, tint(STONE, 0.03), { at: [0, 0.75, 0] });
      for (const [x, r] of [[-0.5, 0.17], [-0.05, 0.13], [0.33, 0.1], [0.58, 0.07]] as [number, number][]) b.cyl(r, 0.02, P.windowDark, { at: [x, 0.97, 0], segs: 8, jitter: false });
    });
    b.collider(1.6, 0.6, { at: [1.9, 0, -1.4] });
    b.box(1.8, 0.55, 1.3, STONE, { at: [-2.0, F, -1.0] });
    b.box(1.5, 0.02, 1.0, P.water, { at: [-2.0, F + 0.5, -1.0], jitter: false });
    b.collider(1.8, 1.3, { at: [-2.0, 0, -1.0] });
    for (let i = 0; i < 4; i++) amphora(b, [3.6 + (i % 2) * 0.38, F, 0.9 + Math.floor(i / 2) * 0.38], P.terracotta, 0.1);

    // ---- the entrance passage through the front range, the dedication over its door
    b.box(3.2, 0.02, ZF - SZ1, P.marble, { at: [0, F, (ZF + SZ1) / 2], jitter: false });
    b.box(3.2, H - 3.9, ZF - SZ1, P.plaster, { at: [0, 3.9, (ZF + SZ1) / 2] });
    b.panel(3.4, 0.45, P.marble, { at: [0, 3.95, ZF], depth: 0.05 });
    for (let k = 0; k < 6; k++) b.panel(0.36, 0.1, P.timberBlack, { at: [-1.25 + k * 0.5, 4.12, ZF], depth: 0.07 });

    // ---- the street portico: a row of columns and a lean-to tiled roof
    const PZ = 10.4;
    b.box(2 * X + 0.6, F, PZ - ZF + 0.6, STONE, { at: [0, 0, (PZ + ZF) / 2 + 0.2] });
    for (const x of linspace(8, -X + 0.6, X - 0.6)) {
      b.column(0.22, 3.55, STONE, { at: [x, F, PZ], order: 'tuscan', segs: 6 });
      b.collider(0.45, 0.45, { at: [x, 0, PZ] });
    }
    b.box(2 * X, 0.35, 0.45, STONE, { at: [0, F + 3.55, PZ] });
    slab(b, [[-X - 0.3, H - 0.25, ZF], [X + 0.3, H - 0.25, ZF], [X + 0.3, F + 4.1, PZ + 0.55], [-X - 0.3, F + 4.1, PZ + 0.55]], 0.16, TILE);
    for (let x = -X; x <= X; x += 0.9) b.beam([x, H - 0.22, ZF], [x, F + 4.13, PZ + 0.55], 0.13, 0.09, tint(TILE, -0.08));
  },
};
