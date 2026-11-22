import { P, tint, type BuildingDef, type Builder, type Facing } from '@ah/kit';
import { archPanel, archivolt, faceAngle, goods, hipRibs, paving, sack } from './shared';

/**
 * A two-light Gothic window (bifora): two pointed lights divided by a colonnette, under one
 * pointed arch with a small round opening in the head. `at` is its sill on the wall face.
 */
function bifora(b: Builder, at: [number, number, number], facing: Facing, stone: number, w = 2.0, h = 3.4): void {
  b.group({ at, rotY: faceAngle(facing) }, () => {
    archPanel(b, w + 0.3, h + 0.2, tint(stone, 0.12), [0, 0, 0], '+z', 'pointed', 0.08);
    archPanel(b, w, h, P.windowDark, [0, 0.1, 0], '+z', 'pointed', 0.1);
    const lw = (w - 0.3) / 2;
    for (const s of [-1, 1]) archPanel(b, lw, h * 0.62, P.glassDark, [s * (lw / 2 + 0.08), 0.15, 0], '+z', 'pointed', 0.12, undefined, 2);
    b.box(0.12, h * 0.6, 0.12, P.marble, { at: [0, 0.15, 0.12] }); // the colonnette
    b.box(w + 0.5, 0.12, 0.2, tint(stone, 0.12), { at: [0, -0.05, 0.08] });
  });
}

/** A guild tabernacle on a pier: a niche with a gabled canopy and pinnacles; `statue` puts a saint in it. */
function tabernacle(b: Builder, at: [number, number, number], facing: Facing, statue: boolean, stone: number): void {
  b.group({ at, rotY: faceAngle(facing) }, () => {
    b.box(1.5, 0.3, 0.45, P.marble, { at: [0, 0, 0.15] });
    b.panel(1.3, 2.9, P.marble, { at: [0, 0.3, 0], depth: 0.12 });
    archPanel(b, 0.95, 2.6, statue ? P.doorBlue : P.windowDark, [0, 0.35, 0], '+z', 'pointed', 0.14);
    b.extrude([[-0.8, 0], [0.8, 0], [0, 1.1]], 0.3, P.marble, { at: [0, 3.2, 0.12] });
    b.panel(0.4, 0.4, stone, { at: [0, 3.45, 0.27], shape: 'circle', depth: 0.03 });
    for (const s of [-1, 1]) {
      b.box(0.16, 3.0, 0.16, P.marble, { at: [s * 0.72, 0.3, 0.2] });
      b.cone(0.11, 0.7, P.marble, { at: [s * 0.72, 3.3, 0.2], segs: 4 });
    }
    if (statue) {
      b.cyl(0.24, 1.55, P.bronze, { at: [0, 0.4, 0.3], rTop: 0.16, segs: 6 });
      b.sphere(0.14, P.bronze, { at: [0, 2.1, 0.3], segs: 6 });
    }
  });
}

export const grainLoggia: BuildingDef = {
  id: 'grain-loggia',
  name: 'Grain loggia with granary',
  style: 'Florentine Gothic',
  date: 'c. 1290 to 1350',
  summary:
    'The self-governing commune takes charge of the town’s bread. On the old market ground it builds an open loggia where grain is sold under the eyes of officials, and stacks two storeys of granary on top as a store against famine. ' +
    'Great stone piers carry wide arches so carts can come in from every side; the grain upstairs is poured down to the sellers through chutes built inside the piers. ' +
    'The guilds who paid for it put their patron saints in niches on the piers, and a painted Madonna on one pier drew so many worshippers that the loggia at Florence was later walled in as a church.',
  materials: ['pietraforte sandstone', 'marble', 'timber floors', 'coppi tiles'],
  lookFor: [
    { label: 'Open loggia', note: 'Wide arches on massive piers, open on all four sides: a covered public market rather than a building with doors.', at: [0, 5.2, 7.3] },
    { label: 'Granary floors', note: 'Two storeys of store-rooms over the loggia, lit and aired by two-light Gothic windows.', at: [-6.6, 13.0, 7.4] },
    { label: 'Grain chute', note: 'Grain was poured from the granary through shafts inside the piers and came out at hatches like this one, straight into the buyers’ sacks.', at: [-3.4, 1.6, 4.8] },
    { label: 'Guild tabernacles', note: 'Each guild paid for a niche on a pier with a statue of its patron saint; at Orsanmichele the series began in 1339 and took a century to fill.', at: [3.4, 3.4, 7.8] },
    { label: 'Painted Madonna', note: 'An image of the Virgin on a pier, believed to work miracles, made the grain market a place of pilgrimage too.', at: [8.0, 3.6, -0.0] },
  ],
  modelledOn: 'Orsanmichele, Florence (loggia rebuilt from 1337, granary above, arches later walled in); reduced and shown with its loggia still open',
  influences: ['cistercian-gothic'],
  build(b) {
    const W = 20;
    const D = 15;
    const T = 1.4; // depth of the arcade walls (the piers)
    const GH = 10; // height of the loggia storey
    const FH = 4.6; // each granary storey
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, 0.04)]);
    const dark = tint(stone, -0.08);

    paving(b, 25.6, 21.6, tint(P.pietraForte, -0.04), 0.08, [0, 0, 0], 12);
    b.box(W + 0.8, 0.2, D + 0.8, tint(stone, -0.05), { at: [0, 0.08, 0] });
    const y0 = 0.28;

    // ---- the loggia: arcade walls on four sides, three arches long, two arches short
    for (const s of [1, -1] as const) {
      b.archWall(W, GH, T, stone, { at: [0, y0, s * (D / 2 - T / 2)], facing: s > 0 ? '+z' : '-z', openings: 3, openW: 4.4, openH: 8.6, shape: 'round' });
      b.archWall(D - 2 * T, GH, T, stone, { at: [s * (W / 2 - T / 2), y0, 0], facing: s > 0 ? '+x' : '-x', openings: 2, openW: 4.4, openH: 8.6, shape: 'round' });
      // a moulded label round each arch, and impost blocks
      for (const x of [-W / 3, 0, W / 3]) {
        const ext = s > 0 ? D / 2 + 0.02 : -D / 2 - 0.02;
        archivolt(b, 2.2, 0.35, y0 + 6.4, 0.14, dark, [x, 0, ext], s > 0 ? '+z' : '-z');
        for (const sx of [-1, 1]) b.box(0.6, 0.3, 0.2, dark, { at: [x + sx * 2.35, y0 + 6.1, ext] });
      }
      for (const z of [-(D - 2 * T) / 4 - 0.2, (D - 2 * T) / 4 + 0.2]) {
        archivolt(b, 2.2, 0.35, y0 + 6.4, 0.14, dark, [s * (W / 2 + 0.02), 0, z], s > 0 ? '+x' : '-x');
      }
    }
    // piers only block walkers
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.collider(2.2, 2.2, { at: [sx * (W / 2 - 1.1), 0, sz * (D / 2 - 1.1)] });
      for (const sz of [-1, 1]) b.collider(2.3, T, { at: [sx * W / 6, 0, sz * (D / 2 - T / 2)] });
      b.collider(T, 1.8, { at: [sx * (W / 2 - T / 2), 0, 0] });
    }
    // the ceiling of the loggia (the granary floor) and a plinth course
    b.box(W - 2 * T, 0.5, D - 2 * T, tint(P.oak, 0.1), { at: [0, y0 + GH - 0.5, 0] });
    for (const x of [-6.6, -3.3, 0, 3.3, 6.6]) b.box(0.35, 0.4, D - 2 * T, P.oakDark, { at: [x, y0 + GH - 0.9, 0] });

    // ---- the granary storeys
    const g0 = y0 + GH;
    b.box(W, 2 * FH, D, stone, { at: [0, g0, 0] });
    for (const y of [g0, g0 + FH]) b.box(W + 0.3, 0.3, D + 0.3, dark, { at: [0, y - 0.1, 0] });
    for (let f = 0; f < 2; f++) {
      const sy = g0 + f * FH + 0.6;
      for (const s of [1, -1] as const) {
        for (const x of [-W / 3, 0, W / 3]) bifora(b, [x, sy, s * D / 2], s > 0 ? '+z' : '-z', stone);
        for (const z of [-3.3, 3.3]) bifora(b, [s * W / 2, sy, z], s > 0 ? '+x' : '-x', stone);
      }
    }
    // the cornice on corbels, and a low hipped roof of coppi
    const top = g0 + 2 * FH;
    for (const s of [1, -1] as const) {
      for (let i = 0; i < 16; i++) b.box(0.3, 0.45, 0.5, dark, { at: [-W / 2 + 0.4 + i * ((W - 0.8) / 15), top - 0.45, s * (D / 2 + 0.2)] });
      for (let i = 0; i < 12; i++) b.box(0.5, 0.45, 0.3, dark, { at: [s * (W / 2 + 0.2), top - 0.45, -D / 2 + 0.4 + i * ((D - 0.8) / 11)] });
    }
    b.box(W + 1.2, 0.4, D + 1.2, tint(stone, 0.05), { at: [0, top, 0] });
    b.hip(W + 0.8, D + 0.8, 2.6, P.coppi, { at: [0, top + 0.4, 0], overhang: 0.25 });
    hipRibs(b, W + 0.8, D + 0.8, 2.6, [0, top + 0.4, 0], 0.25, tint(P.coppi, -0.08), 0.9);
    // a hoist beam and door in the roof for lifting sacks to the top floor
    b.box(1.6, 1.4, 1.2, stone, { at: [0, top + 0.4, D / 2 - 0.4] });
    b.gable(1.8, 1.4, 0.7, P.coppi, { at: [0, top + 1.8, D / 2 - 0.4], ridge: 'z', overhang: 0.15, wall: stone });
    b.panel(0.9, 1.1, P.oakDark, { at: [0, top + 0.5, D / 2 + 0.3], facing: '+z' });
    b.box(0.2, 0.2, 1.4, P.oakDark, { at: [0, top + 1.6, D / 2 + 0.6] });
    b.box(0.03, 2.0, 0.03, P.bark, { at: [0, top - 0.4, D / 2 + 1.2] });

    // ---- details on the piers
    tabernacle(b, [-W / 6, y0 + 0.6, D / 2], '+z', true, stone);
    tabernacle(b, [W / 6, y0 + 0.6, D / 2], '+z', b.variant !== 1, stone);
    tabernacle(b, [-W / 6, y0 + 0.6, -D / 2], '-z', false, stone);
    tabernacle(b, [W / 6, y0 + 0.6, -D / 2], '-z', true, stone);
    tabernacle(b, [-W / 2, y0 + 0.6, 0], '-x', true, stone);
    // the painted Madonna on the inner face of the east middle pier, with a candle ledge
    const mx = W / 2 - T;
    b.panel(1.3, 1.9, P.gold, { at: [mx, y0 + 2.2, 0], facing: '-x', shape: 'round', depth: 0.05 });
    b.panel(1.05, 1.6, P.doorBlue, { at: [mx - 0.02, y0 + 2.35, 0], facing: '-x', shape: 'round', depth: 0.07 });
    b.panel(0.35, 0.35, P.cream, { at: [mx - 0.03, y0 + 3.3, 0], facing: '-x', shape: 'circle', depth: 0.09 });
    b.box(0.3, 0.08, 1.4, P.oakDark, { at: [mx - 0.15, y0 + 1.9, 0] });
    for (const z of [-0.4, 0, 0.4]) b.cyl(0.03, 0.22, P.cream, { at: [mx - 0.15, y0 + 1.98, z], segs: 4 });
    // grain chutes: hatches with wooden spouts on the inner faces of the front piers
    for (const sx of [-1, 1]) {
      const zf = D / 2 - T;
      b.panel(0.5, 0.5, P.oakDark, { at: [sx * W / 6, y0 + 1.3, zf], facing: '-z', depth: 0.06 });
      b.beam([sx * W / 6, y0 + 1.45, zf - 0.05], [sx * W / 6, y0 + 0.95, zf - 0.7], 0.4, 0.08, P.oak);
      sack(b, [sx * W / 6, y0, zf - 1.0], 1);
      b.blob(0.45, P.crop, { at: [sx * W / 6 + 0.6, y0, zf - 0.9], stretch: [1, 0.45, 1], detail: 0 });
    }

    // ---- the grain market inside: officials' table, measures, sacks and bins
    b.box(3.0, 0.85, 1.0, P.oak, { at: [0, y0, -2.6] });
    b.box(3.2, 0.06, 1.2, P.doorGreen, { at: [0, y0 + 0.85, -2.6] }); // the green cloth of the officials’ bench
    b.box(3.2, 0.5, 0.4, P.oakDark, { at: [0, y0, -3.6] });
    b.cyl(0.32, 0.4, P.oak, { at: [0.8, y0 + 0.91, -2.6], segs: 8 }); // the staio, the standard grain measure
    b.box(0.04, 0.5, 0.04, P.iron, { at: [-0.9, y0 + 0.91, -2.4] });
    b.box(0.8, 0.04, 0.04, P.iron, { at: [-0.9, y0 + 1.4, -2.4] });
    for (const sx of [-1, 1]) {
      for (const z of [-1.4, 1.4]) {
        b.box(2.2, 0.7, 1.0, P.oak, { at: [sx * 5.2, y0, z] });
        b.box(2.0, 0.12, 0.8, b.pick([P.crop, P.limestoneWarm, tint(P.crop, -0.1)]), { at: [sx * 5.2, y0 + 0.62, z] });
      }
    }
    for (let i = 0; i < 6; i++) sack(b, [-2.5 + (i % 3) * 0.55, y0, 2.6 + Math.floor(i / 3) * 0.5], 0.95);
    goods(b, 2.0, [3.4, y0, 2.8], 0, ['sack', 'basket']);
  },
};
