import { P, mix, tint, type Builder, type BuildingDef, type Facing, type Vec3 } from '@ah/kit';
import { patch, quad, railing, soup, wallRects } from './shared';

const X0 = -12.5;
const X1 = 12.5;
const Z0 = -7.4; // back face
const Z1 = 7.0; // front face
const R = 3.9; // depth of each range
const CX0 = X0 + R;
const CX1 = X1 - R;
const CZ0 = Z0 + R;
const CZ1 = Z1 - R;
const G = 3.4; // ground storey
const F = 3.0; // upper storeys
const NF = 3; // upper storeys
const TOP = G + NF * F;
const GAL = 1.05; // gallery depth
const GLASS_Y = TOP + 0.9; // eaves of the glass roof over the court
const GLASS_H = 2.6;

type Rect = [number, number, number, number];

/**
 * The windows of one face: `n` bays along `len`, one window per bay on each floor, as cheap flat
 * rectangles (dark glass, white frame, a darker brick head). Bays listed in `skip` stay blank on the
 * ground floor.
 */
function windows(b: Builder, at: Vec3, facing: Facing, len: number, n: number, brick: number, o: { skipGround?: number[]; ground?: boolean } = {}): void {
  const frame: Rect[] = [];
  const glass: Rect[] = [];
  const head: Rect[] = [];
  const sill: Rect[] = [];
  for (let i = 0; i < n; i++) {
    const u = -len / 2 + (i + 0.5) * (len / n);
    for (let f = 0; f <= NF; f++) {
      if (f === 0 && (o.ground === false || o.skipGround?.includes(i))) continue;
      const y = f === 0 ? 0.9 : G + (f - 1) * F + 0.75;
      const h = f === 0 ? 1.9 : 1.75;
      const w = 1.0;
      head.push([u, y + h - 0.02, w + 0.3, 0.32]);
      frame.push([u, y, w, h]);
      glass.push([u, y + 0.07, w - 0.14, h - 0.14]);
      glass.push([u, y + 0.07, 0.05, h - 0.14]); // the mullion between the two casements, in frame colour below
      sill.push([u, y - 0.1, w + 0.2, 0.1]);
    }
  }
  wallRects(b, head, tint(brick, -0.14), at, facing, 0.02);
  wallRects(b, frame, P.white, at, facing, 0.03);
  wallRects(b, glass.filter((_, k) => k % 2 === 0), P.windowDark, at, facing, 0.045);
  wallRects(b, glass.filter((_, k) => k % 2 === 1), P.white, at, facing, 0.05);
  wallRects(b, sill, P.pierreBlonde, at, facing, 0.06);
}

/** A gallery (coursive) round the court at floor height y: a slab on brackets with a railing. */
function gallery(b: Builder, y: number, rail: number, slab: number): void {
  const xs0 = CX0;
  const xs1 = CX1;
  const zs0 = CZ0;
  const zs1 = CZ1;
  // four slabs, overlapping at the corners
  b.box(xs1 - xs0, 0.18, GAL, slab, { at: [(xs0 + xs1) / 2, y - 0.18, zs1 - GAL / 2] });
  b.box(xs1 - xs0, 0.18, GAL, slab, { at: [(xs0 + xs1) / 2, y - 0.18, zs0 + GAL / 2] });
  b.box(GAL, 0.18, zs1 - zs0 - GAL * 2, slab, { at: [xs0 + GAL / 2, y - 0.18, (zs0 + zs1) / 2] });
  b.box(GAL, 0.18, zs1 - zs0 - GAL * 2, slab, { at: [xs1 - GAL / 2, y - 0.18, (zs0 + zs1) / 2] });
  // the balustrade
  const a: Vec3 = [xs0 + GAL, y, zs0 + GAL];
  const c: Vec3 = [xs1 - GAL, y, zs0 + GAL];
  const d: Vec3 = [xs1 - GAL, y, zs1 - GAL];
  const e: Vec3 = [xs0 + GAL, y, zs1 - GAL];
  for (const [p, q] of [[a, c], [c, d], [d, e], [e, a]] as const) railing(b, p, q, 1.0, rail, 0.18);
  // a moulded fascia on the slab edge
  b.box(xs1 - xs0 - GAL * 2, 0.3, 0.06, tint(slab, -0.08), { at: [0, y - 0.45, zs0 + GAL + 0.03] });
  b.box(xs1 - xs0 - GAL * 2, 0.3, 0.06, tint(slab, -0.08), { at: [0, y - 0.45, zs1 - GAL - 0.03] });
  b.box(0.06, 0.3, zs1 - zs0 - GAL * 2, tint(slab, -0.08), { at: [xs0 + GAL + 0.03, y - 0.45, (zs0 + zs1) / 2] });
  b.box(0.06, 0.3, zs1 - zs0 - GAL * 2, tint(slab, -0.08), { at: [xs1 - GAL - 0.03, y - 0.45, (zs0 + zs1) / 2] });
}

/** Doors and windows of the flats on the court walls, behind the galleries, on every level. */
function courtFronts(b: Builder): void {
  const doors: Rect[] = [];
  const wins: Rect[] = [];
  const faces: [Vec3, Facing, number][] = [
    [[0, 0, CZ1], '-z', CX1 - CX0],
    [[0, 0, CZ0], '+z', CX1 - CX0],
    [[CX0, 0, (CZ0 + CZ1) / 2], '+x', CZ1 - CZ0],
    [[CX1, 0, (CZ0 + CZ1) / 2], '-x', CZ1 - CZ0],
  ];
  for (const [at, f, len] of faces) {
    doors.length = 0;
    wins.length = 0;
    const n = Math.max(1, Math.round(len / 2.6));
    for (let i = 0; i < n; i++) {
      const u = -len / 2 + (i + 0.5) * (len / n);
      for (let k = 0; k <= NF; k++) {
        const y = k === 0 ? 0 : G + (k - 1) * F;
        if (k === 0 && f === '-z' && Math.abs(u) < 2.3) continue; // the passage
        if (i % 2 === 0) doors.push([u, y, 0.9, 2.1]);
        else wins.push([u, y + 0.85, 1.0, 1.5]);
      }
    }
    wallRects(b, doors, P.doorGreen, at, f, 0.04);
    wallRects(b, wins, P.windowDark, at, f, 0.04);
  }
}

export const familistere: BuildingDef = {
  id: 'familistere',
  name: 'Familistère',
  style: 'Utopian workers’ housing',
  date: 'c. 1872',
  summary:
    'Jean-Baptiste André Godin, who made cast-iron stoves at Guise, believed that workers should have the comforts of the rich, and between 1859 and 1884 he built them a “social palace”, the Familistère, after the ideas of Charles Fourier. ' +
    'Its flats are arranged round a courtyard under a glass roof, opening on to galleries on every floor, so that the court is a covered public square, light and well aired. Water was laid on to every floor, a rare comfort in working-class housing of the time. ' +
    'Round it Godin added shops, schools, a theatre, a laundry and a swimming pool, and from 1880 the works and the housing belonged to a cooperative of the workers, which lasted until 1968. Here one pavilion stands, much reduced.',
  materials: ['red brick', 'timber and iron galleries', 'iron and glass roof', 'slate'],
  modelledOn: 'The Familistère of Guise, Aisne (Godin; left wing 1859 to 1860, central pavilion 1862 to 1865, right wing 1877 to 1879, the whole 1859 to 1884): one pavilion, much smaller than the original',
  influences: ['iron-and-rail'],
  lookFor: [
    { label: 'Glass-roofed court', note: 'The courtyard is roofed in iron and glass, so the court becomes a hall for the whole community, lit from above and aired through the lantern.', at: [0, GLASS_Y + 0.4, (CZ0 + CZ1) / 2] },
    { label: 'Galleries', note: 'Every flat opens on to a gallery round the court: neighbours meet there, and everyone can see everyone else.', at: [CX0 + 0.6, G + F + 1.0, 0.0] },
    { label: 'Corner stair and water point', note: 'In each corner a stair, and on every landing a tap of clean water: services on every floor were Godin’s pride.', at: [CX1 - 0.5, G + 1.2, CZ0 + 0.5] },
    { label: 'Brick facades', note: 'Plain red brick with even rows of windows: dignified, but no ornament the residents had to pay for.', at: [-9.0, 6.0, Z1 + 0.2] },
    { label: 'Passage to the court', note: 'An arched passage leads from the square in front straight into the court.', at: [0, 2.0, Z1 + 0.3] },
  ],
  build(b) {
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, 0.03), mix(P.briqueNord, P.brickRed, 0.4)]);
    const band = mix(P.brickYellow, P.pierreBlonde, 0.5);
    const slate = P.ardoise;
    const timber = b.pick([mix(P.oak, P.cream, 0.6), P.cream, mix(P.voletVert, P.cream, 0.4)]);
    const iron = P.castIron;
    const cz = (CZ0 + CZ1) / 2;

    // the square in front, the court floor
    patch(b, 25.8, 8 - Z1, mix(P.gravel, P.paving, 0.5), [0, (Z1 + 8) / 2], 0.05);
    patch(b, CX1 - CX0, CZ1 - CZ0, P.paving, [0, cz], 0.06);

    // ------------------------------------------------ the four ranges
    const ranges: [number, number, number, number][] = [
      // x, z, w, d
      [0, Z1 - R / 2, X1 - X0, R], // front
      [0, Z0 + R / 2, X1 - X0, R], // back
      [X0 + R / 2, cz, R, CZ1 - CZ0], // left
      [X1 - R / 2, cz, R, CZ1 - CZ0], // right
    ];
    const pw = 3.0; // the passage through the front range
    for (const [i, [x, z, w, d]] of ranges.entries()) {
      if (i === 0) {
        // the front range stands over the passage
        for (const s of [-1, 1]) {
          const ww = (w - pw) / 2;
          const xx = s * (pw / 2 + ww / 2);
          b.box(ww, TOP, d, brick, { at: [xx, 0, z] });
          b.collider(ww, d, { at: [xx, 0, z] });
        }
        b.box(pw, TOP - 3.4, d, brick, { at: [0, 3.4, z] });
      } else {
        b.box(w, TOP, d, brick, { at: [x, 0, z] });
        b.collider(w, d, { at: [x, 0, z] });
      }
    }
    // bands at each floor and a cornice all round, outside
    for (let k = 0; k <= NF; k++) {
      const y = k === 0 ? 0 : G + (k - 1) * F - 0.1;
      const h = k === 0 ? 0.6 : 0.16;
      b.box(X1 - X0 + 0.06, h, Z1 - Z0 + 0.06, k === 0 ? tint(brick, -0.12) : band, { at: [0, y, (Z0 + Z1) / 2] });
    }
    b.box(X1 - X0 + 0.5, 0.4, Z1 - Z0 + 0.5, band, { at: [0, TOP - 0.4, (Z0 + Z1) / 2] });
    // low hipped roofs of slate on the ranges, as a ring round the glass
    const rh = 1.7;
    for (const [x, z, w, d, ry] of [
      [0, Z1 - R / 2, X1 - X0 + 0.4, R + 0.4, 0],
      [0, Z0 + R / 2, X1 - X0 + 0.4, R + 0.4, 0],
    ] as const) b.gable(w, d, rh, slate, { at: [x, TOP, z], overhang: 0.2, rotY: ry, wall: brick });
    for (const s of [-1, 1]) b.gable(R + 0.4, CZ1 - CZ0, rh, slate, { at: [s * (X1 - R / 2), TOP, cz], ridge: 'z', overhang: 0, wall: brick });
    // chimney stacks along the ridges
    for (const x of [-9, -3, 3, 9]) for (const z of [Z1 - R / 2, Z0 + R / 2]) b.chimney(0.5, 1.4, 1.1, brick, { at: [x, TOP + rh - 0.3, z] });

    // outer windows: front, back, ends
    windows(b, [0, 0, Z1], '+z', X1 - X0, 10, brick, { skipGround: [4, 5] });
    windows(b, [0, 0, Z0], '-z', X1 - X0, 10, brick);
    windows(b, [X0, 0, (Z0 + Z1) / 2], '-x', Z1 - Z0, 6, brick);
    windows(b, [X1, 0, (Z0 + Z1) / 2], '+x', Z1 - Z0, 6, brick);
    // the passage arch, open right through, with a stone ring on each face
    for (const [z, f] of [[Z1 + 0.05, '+z'], [CZ1 - 0.05, '-z']] as const) {
      b.archWall(pw + 0.8, 3.75, 0.12, band, { at: [0, 0, z], facing: f, openings: 1, openW: pw, openH: 3.4, shape: 'segmental' });
    }
    b.box(pw, 0.05, R, tint(brick, -0.3), { at: [0, 3.35, Z1 - R / 2] }); // soffit
    patch(b, pw, R, P.paving, [0, Z1 - R / 2], 0.06);

    // ------------------------------------------------ the court: fronts, galleries, corner stairs
    courtFronts(b);
    for (let k = 1; k <= NF; k++) gallery(b, G + (k - 1) * F, timber, mix(P.concreteWhite, P.pierreBlonde, 0.4));
    // a top balustrade round the court at roof level
    gallery(b, TOP, timber, mix(P.concreteWhite, P.pierreBlonde, 0.4));
    // cast-iron posts under the galleries at the corners
    for (const sx of [CX0 + GAL, CX1 - GAL]) for (const sz of [CZ0 + GAL, CZ1 - GAL]) b.cyl(0.08, TOP, iron, { at: [sx, 0, sz], segs: 6 });
    // corner stair doors and the water point on each landing
    for (let k = 0; k <= NF; k++) {
      const y = k === 0 ? 0 : G + (k - 1) * F;
      b.panel(1.2, 2.3, P.windowDark, { at: [CX1 - 0.9, y, CZ0], facing: '+z', depth: 0.05 });
      b.box(0.5, 0.8, 0.35, P.pierreBlonde, { at: [CX1 - 0.3, y, CZ0 + 0.5] });
      b.box(0.05, 0.25, 0.05, P.castIron, { at: [CX1 - 0.15, y + 0.95, CZ0 + 0.5] });
      b.panel(1.2, 2.3, P.windowDark, { at: [CX0 + 0.9, y, CZ1], facing: '-z', depth: 0.05 });
    }

    // ------------------------------------------------ the glass roof
    // only when the court is closed: when it is cut away, the whole glass roof comes off to show the galleries
    const nT = 6;
    const run = CX1 - CX0;
    // the iron kerb on which the roof stands, both forms
    for (const z of [CZ0 + 0.1, CZ1 - 0.1]) b.box(run, 0.18, 0.14, iron, { at: [0, GLASS_Y - 0.18, z] });
    for (let i = 0; i <= nT; i++) {
      const x = CX0 + (run * i) / nT;
      b.box(0.12, GLASS_Y - TOP, 0.12, iron, { at: [x, TOP, CZ0 + 0.1] });
      b.box(0.12, GLASS_Y - TOP, 0.12, iron, { at: [x, TOP, CZ1 - 0.1] });
    }
    if (!b.cutaway) for (let i = 0; i <= nT; i++) {
      const x = CX0 + (run * i) / nT;
      b.beam([x, GLASS_Y, CZ0 + 0.1], [x, GLASS_Y + GLASS_H, cz], 0.1, 0.16, iron);
      b.beam([x, GLASS_Y, CZ1 - 0.1], [x, GLASS_Y + GLASS_H, cz], 0.1, 0.16, iron);
      b.beam([x, GLASS_Y, CZ0 + 0.1], [x, GLASS_Y, CZ1 - 0.1], 0.05, 0.05, iron);
      b.beam([x, GLASS_Y, cz], [x, GLASS_Y + GLASS_H, cz], 0.05, 0.05, iron);
    }
    if (!b.cutaway) {
      b.box(run, 0.14, 0.14, iron, { at: [0, GLASS_Y + GLASS_H - 0.1, cz] });
      // the ventilating lantern on the ridge
      const LH = 0.8;
      b.box(run, LH, 0.06, iron, { at: [0, GLASS_Y + GLASS_H, cz - 0.6] });
      b.box(run, LH, 0.06, iron, { at: [0, GLASS_Y + GLASS_H, cz + 0.6] });
      b.gable(run + 0.2, 1.5, 0.45, P.zincParis, { at: [0, GLASS_Y + GLASS_H + LH, cz], overhang: 0.1, thick: 0.06 });
      const glass = mix(P.glass, P.white, 0.25);
      const pane: number[] = [];
      for (const s of [-1, 1]) {
        const z0 = CZ0 + 0.1;
        const z1 = CZ1 - 0.1;
        const zc = cz + s * 0.0;
        // slope from the eaves on side s up to the ridge
        const ze = s < 0 ? z0 : z1;
        quad(pane, [CX0, GLASS_Y + 0.08, ze], [CX1, GLASS_Y + 0.08, ze], [CX1, GLASS_Y + GLASS_H + 0.08, zc], [CX0, GLASS_Y + GLASS_H + 0.08, zc]);
      }
      for (const x of [CX0, CX1]) {
        pane.push(x, GLASS_Y, CZ0 + 0.1, x, GLASS_Y, CZ1 - 0.1, x, GLASS_Y + GLASS_H, cz);
        // the short glazed wall between the range roofs and the glass eaves
      }
      for (const z of [CZ0 + 0.1, CZ1 - 0.1]) quad(pane, [CX0, TOP, z], [CX1, TOP, z], [CX1, GLASS_Y, z], [CX0, GLASS_Y, z]);
      for (const x of [CX0, CX1]) quad(pane, [x, TOP, CZ0 + 0.1], [x, TOP, CZ1 - 0.1], [x, GLASS_Y, CZ1 - 0.1], [x, GLASS_Y, CZ0 + 0.1]);
      soup(b, pane, glass, { mat: 'glass' });
      // glazing bars across the slopes
      for (let i = 0; i < nT * 3; i++) {
        const x = CX0 + (run * (i + 0.5)) / (nT * 3);
        for (const ze of [CZ0 + 0.1, CZ1 - 0.1]) b.beam([x, GLASS_Y + 0.1, ze], [x, GLASS_Y + GLASS_H + 0.1, cz], 0.04, 0.04, iron);
      }
    }

    // ------------------------------------------------ the square: benches and bollards
    for (const x of [-7.5, 7.5]) b.box(1.8, 0.45, 0.45, P.oak, { at: [x + b.range(-0.4, 0.4), 0, 7.5] });
    for (const x of [-2.2, 2.2]) b.cyl(0.12, 0.8, P.castIron, { at: [x, 0, 7.6], segs: 6 });
  },
};
