import { P, linspace, tint, type BuildingDef, type Builder, type Facing } from '@ah/kit';
import { amphora, forumPaving, goods, ringRoof, tileRibs } from './shared';

// ---------------------------------------------------------------- the fabric the ruin keeps
/* The market among the ruins of about 950 stands in what is left of this building, so the pieces of
   it that survive are drawn here, by the same code with the same numbers in both stages. */
const OW = 25;
const OD = 19.4;
const T = 0.6; // outer wall
const YOUT = 6.4;
const YIN = 4.6;
/** Floor level of the market court. */
export const MF = 0.3;
const CX = 6.2;
const CZ = 4.6;
/** Height to which the outer walls are built in a first lift (the ruin keeps some of these). */
export const WL = 2.6;
/** Back shop fronts and the shrine. */
export const MSZB = -6.7;

/** The stretches of the outer wall: id, centre x, centre z, length along x, along z. */
export const MAC_WALLS: [string, number, number, number, number][] = (() => {
  const w: [string, number, number, number, number][] = [];
  const sl = OD / 5;
  for (let i = 0; i < 5; i++) {
    const z = -OD / 2 + (i + 0.5) * sl;
    w.push([`W${i}`, -(OW / 2 - T / 2), z, T, sl], [`E${i}`, OW / 2 - T / 2, z, T, sl]);
  }
  const inner = OW - 2 * T;
  for (let i = 0; i < 6; i++) w.push([`B${i}`, -inner / 2 + (i + 0.5) * (inner / 6), -(OD / 2 - T / 2), inner / 6, T]);
  for (const [k, x] of [-9.4, -4.4, 4.4, 9.4].entries()) w.push([`F${k}`, x, OD / 2 - T / 2, 5.0, T]);
  return w;
})();

/** The lower lift (to WL) of one stretch of the outer wall, or the rest of it above. */
export function macellumWall(b: Builder, brick: number, id: string, part: 'lower' | 'upper'): void {
  const [, x, z, w, d] = MAC_WALLS.find((m) => m[0] === id)!;
  if (part === 'lower') b.box(w, WL, d, brick, { at: [x, 0, z] });
  else b.box(w, YOUT - 0.05 - WL, d, brick, { at: [x, WL, z] });
}

/** The floor of the court and the raised marble paving under the colonnade, the travertine plinth of the outer walls, and the paved way in. */
export function macellumFloor(b: Builder): void {
  b.box(2 * CX + 1.2, MF - 0.12, 2 * CZ + 1.2, P.marble, { at: [0, 0.12, 0] });
  b.box(OW - 2 * T, MF - 0.12 + 0.01, OD - 2 * T, tint(P.travertine, -0.04), { at: [0, 0.12, 0] });
  for (const s of [1, -1] as const) {
    b.box(T + 0.12, 0.6, OD + 0.12, P.travertine, { at: [s * (OW / 2 - T / 2), 0, 0] });
    if (s < 0) b.box(OW + 0.12, 0.6, T + 0.12, P.travertine, { at: [0, 0, s * (OD / 2 - T / 2)] });
    else for (const sx of [-1, 1]) b.box(OW / 2 - 1.9 + 0.06, 0.6, T + 0.12, P.travertine, { at: [sx * (OW / 4 + 0.95 + 0.03), 0, OD / 2 - T / 2] });
  }
  const fz = OD / 2;
  b.box(3.8, 0.1, fz + 1.2 - 6.7, P.marble, { at: [0, MF - 0.1, (6.7 + fz) / 2 + 0.6] });
  b.box(4.6, 0.3, 1.5, P.travertine, { at: [0, 0, fz + 0.55] });
}

/** One marble column of the colonnade round the court. */
export function colonnadeColumn(b: Builder, x: number, z: number): void {
  b.column(0.22, YIN - MF, P.marble, { at: [x, MF, z], order: 'corinthian', segs: 6 });
}

/** A fish counter: a sloping marble slab on a masonry base with a gutter in front, at a shop front facing `facing`. */
export function fishSlab(b: Builder, x: number, z: number, w: number, facing: Facing, base: number): void {
  const ax = facing === '+x' ? 1 : facing === '-x' ? -1 : 0;
  const az = facing === '+z' ? 1 : facing === '-z' ? -1 : 0;
  const cx = x + ax * 0.35;
  const cz = z + az * 0.35;
  const along = ax !== 0 ? 'z' : 'x';
  const cw = w - 0.3;
  b.box(along === 'x' ? cw : 0.7, 0.8, along === 'x' ? 0.7 : cw, base, { at: [cx, MF, cz] });
  b.box(along === 'x' ? cw + 0.1 : 0.85, 0.07, along === 'x' ? 0.85 : cw + 0.1, P.marble, {
    at: [cx + ax * 0.05, MF + 0.86, cz + az * 0.05],
    rot: along === 'x' ? [az * 0.28, 0, 0] : [0, 0, -ax * 0.28],
  });
  b.box(along === 'x' ? cw : 0.16, 0.04, along === 'x' ? 0.16 : cw, P.windowDark, { at: [x + ax * 0.85, MF, z + az * 0.85] });
}
/** Where the fish counters stand, on the west side of the court. */
export const FISH_Z = [-4.2, 0, 4.2];
export const FISH_X = -8.4;

/** The podium, steps and two columns of the shrine porch at the back of the court (inside a group at the shrine). */
export function shrinePorch(b: Builder): void {
  b.box(3.8, 1.0, 1.5, P.marble, { at: [0, 0, 0.75] });
  b.stairs(2.4, 1.0, 0.8, 3, P.marble, { at: [0, 0, 1.9] });
  for (const sx of [-1, 1]) b.column(0.24, 5.2, P.marble, { at: [sx * 1.4, 1.0, 1.15], order: 'corinthian', segs: 6 });
}

/** The two travertine steps of the tholos and the fountain basin in the middle (inside a group at the court floor). */
export function tholosBase(b: Builder, R: number): void {
  const n = 12;
  b.cyl(R + 0.5, 0.2, P.travertine, { segs: n, rotY: Math.PI / n });
  b.cyl(R + 0.2, 0.25, tint(P.travertine, 0.04), { at: [0, 0.2, 0], segs: n, rotY: Math.PI / n });
  const y0 = 0.45;
  b.cyl(1.05, 0.65, P.marble, { at: [0, y0, 0], segs: 12 });
  b.cyl(0.92, 0.02, P.water, { at: [0, y0 + 0.62, 0], segs: 12, jitter: false });
  b.cyl(0.14, 0.95, P.marble, { at: [0, y0, 0], segs: 6 });
}

/** The round kiosk (tholos) in the middle of the court: twelve columns round a fountain, under a conical tiled roof. */
function tholos(b: Builder, R: number): void {
  const n = 12;
  tholosBase(b, R);
  const y0 = 0.45;
  const colH = 3.3;
  const rc = R - 0.25;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    b.column(0.17, colH, P.marble, { at: [Math.cos(a) * rc, y0, Math.sin(a) * rc], order: 'corinthian', segs: 6 });
    b.collider(0.4, 0.4, { at: [Math.cos(a) * rc, 0, Math.sin(a) * rc] });
  }
  // the ring beam: a hollow drum
  b.lathe(
    [
      [rc - 0.3, 0],
      [rc + 0.35, 0],
      [rc + 0.35, 0.45],
      [rc + 0.5, 0.55],
      [rc - 0.3, 0.55],
      [rc - 0.3, 0],
    ],
    P.marble,
    { at: [0, y0 + colH, 0], segs: n, rotY: Math.PI / n },
  );
  b.cone(R + 0.45, 1.15, P.romanTile, { at: [0, y0 + colH + 0.5, 0], segs: n, rotY: Math.PI / n });
  b.cone(0.2, 0.45, P.bronze, { at: [0, y0 + colH + 1.55, 0], segs: 6 });
  // the fountain in the basin, where fish were kept and cleaned
  b.cyl(0.35, 0.12, P.marble, { at: [0, y0 + 0.95, 0], segs: 8 });
  b.collider(2.1, 2.1);
}

export const macellum: BuildingDef = {
  id: 'macellum',
  name: 'Food market (macellum)',
  style: 'Roman Imperial',
  date: 'c. AD 60 to 120',
  summary:
    'The town now gets a purpose-built food market for meat, fish and delicacies, paid for by a rich citizen or the council. ' +
    'Shops face inward round a colonnaded court, so trade can be supervised by the aediles and the smell kept off the forum; more shops face out to the street. ' +
    'In the middle stands a round kiosk, the tholos, over a fountain where fish were kept fresh, and at the back a shrine to the emperor. ' +
    'Instead of the tufa and timber of the old forum shops, the walls are brick-faced concrete with marble columns and counters.',
  materials: ['brick-faced concrete', 'marble', 'travertine', 'tegulae and imbrices'],
  lookFor: [
    { label: 'Tholos', note: 'The round kiosk of twelve columns under a conical roof; at Pompeii fish scales were found in the drain under its basin.', at: [0, 4.2, 3.2] },
    { label: 'Marble fish counters', note: 'Sloping marble slabs at the shop fronts let water and fish slime run off into a channel.', at: [-8.0, 1.2, 0] },
    { label: 'Shrine of the imperial cult', note: 'A raised room at the back with steps and a statue of the emperor, a reminder of who kept the peace and the grain supply.', at: [0, 4.6, -6.0] },
    { label: 'Entrance portico', note: 'A gabled porch on two columns marks the way in from the street, between shops that open outward.', at: [1.6, 4.6, 11.0] },
    { label: 'Brick-faced concrete', note: 'Concrete walls faced with thin fired bricks and finished with travertine: the standard imperial way of building.', at: [12.5, 2.6, -4.0] },
  ],
  modelledOn: 'The macellum at Pompeii (rebuilt after the earthquake of AD 62) and the macellum at Pozzuoli, both simplified',
  influences: ['roman-concrete', 'hellenistic-luxury'],
  build(b) {
    // the forum paving, laid with the old shops and kept
    forumPaving(b);
    const yOut = YOUT;
    const yIn = YIN;
    const F = MF; // floor level
    const brick = b.pick([P.cotto, P.brickOrange, tint(P.cotto, 0.04)]);
    const plaster = b.pick([P.intonacoCream, P.stucco]);
    const red = P.intonacoRed;
    const tile = P.romanTile;
    // shop-front lines
    const SX = -FISH_X; // side shop fronts
    const SZb = MSZB; // back shop fronts
    const SZf = 6.7; // courtyard face of the front range

    macellumFloor(b); // court paving, raised; the plinth of the outer walls; the way in

    // ---- outer walls: brick-faced, built in stretches, a travertine plinth and cornice, pilaster strips
    for (const [id] of MAC_WALLS) {
      macellumWall(b, brick, id, 'lower');
      macellumWall(b, brick, id, 'upper');
    }
    // the front wall is pierced by the entrance passage
    b.box(3.8, yOut - 4.75, T, brick, { at: [0, 4.7, OD / 2 - T / 2] });
    for (const s of [1, -1] as const) {
      // travertine cornice
      b.box(T + 0.3, 0.25, OD + 0.3, P.travertine, { at: [s * (OW / 2 - T / 2), yOut - 0.55, 0] });
      b.box(OW + 0.3, 0.25, T + 0.3, P.travertine, { at: [0, yOut - 0.55, s * (OD / 2 - T / 2)] });
    }
    for (const s of [1, -1] as const) {
      const facing = s > 0 ? '+x' : '-x';
      for (const z of linspace(6, -OD / 2 + 0.4, OD / 2 - 0.4)) b.panel(0.5, yOut - 0.9, tint(brick, 0.03), { at: [s * OW / 2, 0.6, z], facing, depth: 0.12 });
      for (const z of [-6.0, -2.0, 2.0, 6.0]) b.window(0.9, 0.6, { at: [s * OW / 2, 4.6, z], facing, frame: P.travertine, bars: [2, 1] });
      // a side door into the court
      b.panel(1.6, 2.7, P.oakDark, { at: [s * OW / 2, 0.3, 0], facing, shape: 'round' });
      b.panel(2.2, 0.3, P.travertine, { at: [s * OW / 2, 3.1, 0], facing, depth: 0.12 });
    }
    // back wall: pilasters and small windows, the shrine gable rising above
    for (const x of linspace(7, -OW / 2 + 0.4, OW / 2 - 0.4)) b.panel(0.5, yOut - 0.9, tint(brick, 0.03), { at: [x, 0.6, -OD / 2], facing: '-z', depth: 0.12 });
    for (const x of [-8.2, -4.1, 4.1, 8.2]) b.window(0.9, 0.6, { at: [x, 4.6, -OD / 2], facing: '-z', frame: P.travertine, bars: [2, 1] });

    // ---- the roof, sloping in toward the court on every side
    ringRoof(b, OW + 0.5, OD + 0.5, 2 * CX + 0.7, 2 * CZ + 0.7, yOut + 0.12, yIn + 0.4, tile, 0.18);
    const ribC = tint(tile, -0.08);
    tileRibs(b, linspace(11, -CX + 0.3, CX - 0.3), yIn + 0.35, CZ + 0.35, yOut + 0.1, OD / 2 + 0.25, ribC);
    tileRibs(b, linspace(11, -CX + 0.3, CX - 0.3), yIn + 0.35, -CZ - 0.35, yOut + 0.1, -OD / 2 - 0.25, ribC);
    for (const s of [1, -1]) {
      b.group({ rotY: s * Math.PI / 2 }, () => tileRibs(b, linspace(9, -CZ + 0.3, CZ - 0.3), yIn + 0.35, CX + 0.35, yOut + 0.1, OW / 2 + 0.25, ribC));
    }

    // ---- inner colonnade round the court, with a marble beam
    const cols: [number, number][] = [];
    for (const x of linspace(5, -CX, CX)) {
      cols.push([x, CZ]);
      if (Math.abs(x) > 0.1) cols.push([x, -CZ]); // the shrine steps come down where the middle column would be
    }
    for (const z of linspace(4, -CZ, CZ).slice(1, -1)) cols.push([CX, z], [-CX, z]);
    for (const [x, z] of cols) {
      colonnadeColumn(b, x, z);
      b.collider(0.5, 0.5, { at: [x, 0, z] });
    }
    for (const s of [1, -1]) {
      b.box(2 * CX + 0.6, 0.42, 0.5, P.marble, { at: [0, yIn, s * CZ] });
      b.box(0.5, 0.42, 2 * CZ + 0.6, P.marble, { at: [s * CX, yIn, 0] });
    }

    // ---- the shop ranges
    const shopFront = (x: number, z: number, w: number, facing: '+x' | '-x' | '+z' | '-z', kind: 'fish' | 'meat' | 'veg') => {
      const ax = facing === '+x' ? 1 : facing === '-x' ? -1 : 0;
      const az = facing === '+z' ? 1 : facing === '-z' ? -1 : 0;
      b.panel(w, 2.7, P.windowDark, { at: [x, F, z], facing, depth: 0.03 });
      b.panel(w + 0.4, 0.3, P.travertine, { at: [x, F + 2.7, z], facing, depth: 0.12 });
      b.window(0.8, 0.5, { at: [x, F + 3.25, z], facing, frame: P.travertine, bars: [2, 1], border: 0.06 });
      const cx = x + ax * 0.35;
      const cz = z + az * 0.35;
      const along = ax !== 0 ? 'z' : 'x';
      const cw = w - 0.3;
      if (kind === 'fish') {
        // a sloping marble slab on a masonry base, a gutter in front
        fishSlab(b, x, z, w, facing, plaster);
        goods(b, cw - 0.4, [cx, F + 0.95, cz], along === 'x' ? 0 : Math.PI / 2, ['fish']);
      } else {
        b.box(along === 'x' ? cw : 0.6, 0.95, along === 'x' ? 0.6 : cw, plaster, { at: [cx, F, cz] });
        b.box(along === 'x' ? cw + 0.1 : 0.7, 0.06, along === 'x' ? 0.7 : cw + 0.1, P.marble, { at: [cx, F + 0.95, cz] });
        if (b.chance(0.65)) goods(b, cw - 0.3, [cx, F + 1.01, cz], along === 'x' ? 0 : Math.PI / 2, kind === 'meat' ? ['cheese', 'pot', 'sack'] : ['basket', 'fruit', 'pot']);
      }
    };

    // side ranges facing the court, the fish market on the west
    for (const s of [1, -1] as const) {
      const xr = s * (OW / 2 - T);
      b.box(OW / 2 - T - SX, 5.2 - F, OD - 2 * T, plaster, { at: [s * (SX + (OW / 2 - T - SX) / 2), F, 0] });
      b.box(0.04, 1.0, 2 * 6.6, red, { at: [s * SX, F, 0] });
      b.collider(OW / 2 - SX, OD, { at: [s * (SX + (OW / 2 - SX) / 2), 0, 0] });
      void xr;
      for (const z of FISH_Z) shopFront(s * SX, z, 3.6, s > 0 ? '-x' : '+x', s < 0 ? 'fish' : 'meat');
    }
    // back range with the shrine in the middle
    b.box(2 * SX, 5.2 - F, OD / 2 - T + SZb, plaster, { at: [0, F, (SZb - (OD / 2 - T)) / 2] });
    b.collider(2 * SX, OD / 2 + SZb, { at: [0, 0, (SZb - OD / 2) / 2] });
    for (const x of [-6.2, -3.2, 3.2, 6.2]) shopFront(x, SZb, 2.4, '+z', x < 0 ? 'veg' : 'meat');
    // the shrine: a raised room with steps, two columns and a gable above the roof
    b.group({ at: [0, F, SZb] }, () => {
      shrinePorch(b);
      // the cella, rising above the market roof
      b.box(3.6, 7.0, 2.4, plaster, { at: [0, 0, -1.2] });
      b.panel(2.0, 3.4, P.windowDark, { at: [0, 1.0, 0.0], facing: '+z', depth: 0.03 });
      b.panel(1.2, 2.6, P.intonacoRed, { at: [0, 1.4, 0.0], facing: '+z', shape: 'round', depth: 0.05 });
      b.column(0.13, 1.7, P.marble, { at: [0, 1.4, 0.25], order: 'plain', segs: 6 }); // the statue, simplified
      b.sphere(0.17, P.marble, { at: [0, 3.25, 0.25], segs: 6 });
      b.box(3.8, 0.5, 4.0, P.marble, { at: [0, 6.2, -0.45] });
      b.gable(3.9, 4.0, 1.1, tile, { at: [0, 6.7, -0.45], ridge: 'z', overhang: 0.2, wall: P.marble });
    });
    b.collider(3.8, 2.4, { at: [0, 0, SZb + 1.2] });
    for (const sx of [-1, 1]) b.panel(0.5, 0.8, tint(brick, 0.03), { at: [sx * 1.6, 6.2, -OD / 2], facing: '-z', depth: 0.12 });

    // front range: shops facing the street either side of the entrance
    const fz = OD / 2;
    for (const s of [1, -1] as const) {
      const x0 = 1.9;
      const x1 = OW / 2 - T;
      b.box(x1 - x0, 5.2 - F, fz - T - SZf, plaster, { at: [s * (x0 + x1) / 2, F, (SZf + fz - T) / 2] });
      b.collider(OW / 2 - x0, fz - SZf, { at: [s * (x0 + OW / 2) / 2, 0, (SZf + fz) / 2] });
      for (const x of [3.6, 6.8, 10.0]) shopFront(s * x, fz, 2.6, '+z', 'veg');
      // the court side of the front range: painted panels
      b.panel(x1 - x0 - 0.4, 1.0, red, { at: [s * (x0 + x1) / 2, F, SZf], facing: '-z', depth: 0.03 });
      for (const x of [3.6, 6.8, 9.6]) b.panel(1.6, 2.0, P.intonacoOchre, { at: [s * x, F + 1.3, SZf], facing: '-z', depth: 0.04 });
    }
    // the tholos in the middle of the court
    b.group({ at: [0, F, 0] }, () => tholos(b, 2.5));

    // amphorae of garum and wine in a corner of the court
    for (let i = 0; i < 4; i++) amphora(b, [5.0 + (i % 2) * 0.4, F, -3.6 + Math.floor(i / 2) * 0.4], P.terracotta, 0.12);

    // ---- the entrance: a vestibule through the front range and a gabled porch on the street
    b.group({ at: [0, 0, fz + 0.55] }, () => {
      for (const sx of [-1, 1]) {
        b.column(0.26, 4.4, P.marble, { at: [sx * 1.6, 0.3, 0.3], order: 'corinthian', segs: 6 });
        b.collider(0.6, 0.6, { at: [sx * 1.6, 0, 0.3] });
        b.box(0.6, 6.4, 0.7, P.travertine, { at: [sx * 2.2, 0, -0.9] });
      }
      b.box(4.8, 0.6, 1.5, P.marble, { at: [0, 4.7, -0.1] });
      b.extrude([[-2.5, 0], [2.5, 0], [0, 1.35]], 0.3, P.marble, { at: [0, 5.3, 0.5] });
      b.gable(5.0, 1.5, 1.35, tile, { at: [0, 5.3, -0.1], ridge: 'z', overhang: 0.1, wall: P.marble });
      b.panel(2.6, 0.45, P.travertine, { at: [0, 4.75, 0.65], depth: 0.04 });
      for (let k = 0; k < 5; k++) b.panel(0.38, 0.12, P.timberBlack, { at: [-1.0 + k * 0.5, 4.9, 0.65], depth: 0.07 });
    });
  },
};
