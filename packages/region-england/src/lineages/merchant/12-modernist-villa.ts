import { P, linspace, tint, type Builder, type BuildingDef } from '@ah/kit';

/** Tubular steel railing along a straight run at height y: posts and three thin rails. */
function railing(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, color: number) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ang = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2;
  const n = Math.max(2, Math.round(len / 1.5) + 1);
  for (const t of linspace(n, 0, 1)) b.cyl(0.035, 1.05, color, { at: [x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t], segs: 5 });
  for (const h of [0.35, 0.7, 1.05]) b.box(len, 0.05, 0.05, color, { at: [(x0 + x1) / 2, y + h - 0.025, (z0 + z1) / 2], rotY: ang });
}

export const modernistVilla: BuildingDef = {
  id: 'modernist-villa',
  name: 'Modernist villa',
  style: 'International Modern',
  date: 'c. 1936',
  summary:
    'A few adventurous clients now commission houses in the International style, brought to England by émigré architects and young followers of Le Corbusier. ' +
    'Walls are smooth white render over concrete or brick, the roof is flat and used as a sun terrace, and windows run in long horizontal ribbons in slim steel frames, even turning the corners. ' +
    'The curved glazed stair tower and tubular steel railings borrow from the ocean liner. There is no ornament at all: the look comes from white planes, glass and shadow.',
  materials: ['white render', 'reinforced concrete', 'steel windows', 'tubular steel'],
  modelledOn: 'The type of High and Over, Amersham (Amyas Connell, 1929–31) and Joldwynds, Surrey (Oliver Hill, 1930–33)',
  lookFor: [
    { label: 'Flat roof terrace', note: 'With no pitched roof the top of the house becomes a sun deck, sheltered by a thin concrete canopy.', at: [1.5, 7.6, 3.5] },
    { label: 'Ribbon windows', note: 'Long horizontal bands of glass in thin steel frames, possible because the walls no longer carry the floors at every point.', at: [2.0, 4.6, 9.2] },
    { label: 'Curved stair tower', note: 'A drum of glass and white render wrapping the staircase, rising to the roof terrace.', at: [-4.2, 6.6, 11.2] },
    { label: 'Corner window', note: 'The first-floor window band carries on round the corner on to the side wall, a favourite trick of the new style.', at: [-8.0, 4.6, 9.2] },
    { label: 'Tubular steel railings', note: 'Thin rails like a ship’s deck, round the terraces and balconies.', at: [7.2, 4.2, 7.6] },
  ],
  influences: ['continental-modernism'],
  build(b) {
    const white = b.pick([P.whiteRender, P.cladWhite, tint(P.whiteRender, -0.02)]);
    const frame = b.pick([P.iron, P.doorGreen, P.castIron]);
    const rail = b.pick([P.white, P.aluminium]);
    const x0 = -8;
    const x1 = 5;
    const zb = 1;
    const zf = 9;
    const W = x1 - x0;
    const D = zf - zb;
    const xc = (x0 + x1) / 2;
    const zc = (zb + zf) / 2;
    const g = 3.0;
    const H = 6.0;

    // ---- main block: two white storeys, a thin coping, flat roof
    b.box(W, H, D, white, { at: [xc, 0, zc] });
    b.box(W + 0.1, 0.45, D + 0.1, white, { at: [xc, H, zc] });
    b.box(W + 0.14, 0.06, D + 0.14, tint(white, -0.08), { at: [xc, H + 0.45, zc] });
    b.box(W - 0.4, 0.04, D - 0.4, P.paving, { at: [xc, H + 0.05, zc] });
    // thin dark plinth line, as if the walls float
    b.box(W - 0.1, 0.18, D - 0.1, tint(white, -0.4), { at: [xc, 0, zc] });

    // ribbon windows: first floor runs to the left corner and wraps round it
    const ribbon = (x: number, y: number, z: number, w: number, h: number, facing: '+z' | '-z' | '+x' | '-x') =>
      b.window(w, h, { at: [x, y, z], facing, frame, bars: [Math.round(w / 0.9), 2], border: 0.06 });
    ribbon(-1.8, g + 0.85, zf, 12.4, 1.35, '+z'); // reaches the corner, where the side band meets it
    ribbon(x0, g + 0.85, zf - 1.6, 3.2, 1.35, '-x');
    ribbon(1.6, 0.8, zf, 6.0, 1.5, '+z');
    ribbon(-6.4, 0.9, zf, 2.8, 1.3, '+z');
    ribbon(xc, g + 0.85, zb, 10, 1.35, '-z');
    ribbon(xc - 1.0, 0.3, zb, 6.5, 2.3, '-z'); // garden doors to the terrace
    ribbon(x0, 0.9, zc - 1.2, 2.4, 1.3, '-x');

    // ---- curved stair tower: a drum half out of the front, glazed from bottom to top
    const sx = -4.2;
    const sr = 1.9;
    const sz = zf;
    b.cyl(sr, H + 2.8, white, { at: [sx, 0, sz], segs: 20 });
    b.cyl(sr + 0.06, 0.12, tint(white, -0.08), { at: [sx, H + 2.8, sz], segs: 20 });
    for (const a of linspace(7, -1.15, 1.15)) {
      b.window(0.62, H + 0.4, { at: [sx + Math.sin(a) * sr, 0.6, sz + Math.cos(a) * sr], facing: a, frame, bars: [1, 9], border: 0.04 });
    }
    // the stair tower opens on to the roof
    b.panel(0.9, 2.0, frame, { at: [sx + 1.85, H + 0.45, sz - 0.4], facing: 1.78 });

    // ---- entrance: door beside the tower under a thin cantilevered slab
    b.panel(1.1, 2.3, tint(frame, 0.05), { at: [-1.4, 0, zf], facing: '+z', depth: 0.06 });
    b.panel(0.3, 2.3, P.glassDark, { at: [-0.6, 0, zf], facing: '+z', depth: 0.06 });
    b.box(3.2, 0.14, 1.6, white, { at: [-1.2, 2.6, zf + 0.8] });

    // ---- roof terrace: railings and a sun canopy on two thin columns
    railing(b, x0 + 0.1, zf - 0.05, x1 - 0.1, zf - 0.05, H + 0.45, rail);
    railing(b, x1 - 0.05, zb + 0.1, x1 - 0.05, zf - 0.1, H + 0.45, rail);
    railing(b, x0 + 0.1, zb + 0.05, x1 - 0.1, zb + 0.05, H + 0.45, rail);
    b.box(5.5, 0.18, 3.8, white, { at: [1.6, H + 2.85, zb + 2.2] });
    for (const x of [-0.8, 4.0]) b.cyl(0.08, 2.4, rail, { at: [x, H + 0.45, zb + 3.6], segs: 6 });
    b.box(5.4, 2.4, 0.2, white, { at: [1.6, H + 0.45, zb + 0.4] });

    // ---- lower wing to the right; its flat roof is a first-floor sun deck
    const wx0 = x1;
    const wx1 = 9.6;
    const wz0 = 2.5;
    const wz1 = 9.6;
    b.box(wx1 - wx0, g, wz1 - wz0, white, { at: [(wx0 + wx1) / 2, 0, (wz0 + wz1) / 2] });
    b.box(wx1 - wx0 + 0.1, 0.35, wz1 - wz0 + 0.1, white, { at: [(wx0 + wx1) / 2, g, (wz0 + wz1) / 2] });
    railing(b, wx0 + 0.1, wz1 - 0.05, wx1 - 0.1, wz1 - 0.05, g + 0.35, rail);
    railing(b, wx1 - 0.05, wz0 + 0.1, wx1 - 0.05, wz1 - 0.1, g + 0.35, rail);
    ribbon((wx0 + wx1) / 2, 0.9, wz1, 3.4, 1.3, '+z');
    ribbon(wx1, 0.9, (wz0 + wz1) / 2, 4.6, 1.3, '+x');
    // glazed door from the bedroom on to the deck
    b.window(1.0, 2.2, { at: [x1, g + 0.4, 6.8], facing: '+x', frame, bars: [1, 3], border: 0.05 });
    // cantilevered balcony off the back bedroom
    b.box(3.6, 0.16, 1.4, white, { at: [-5.2, g + 0.2, zb - 0.7] });
    railing(b, -7.0, zb - 1.35, -3.4, zb - 1.35, g + 0.36, rail);
    b.window(1.0, 2.2, { at: [-5.2, g + 0.4, zb], facing: '-z', frame, bars: [1, 3], border: 0.05 });

    // ---- garden: lawn, paved terrace and a swimming pool
    b.box(18, 0.04, 11, P.grass, { at: [0, 0, -5.5] });
    b.box(13, 0.08, 2.4, P.paving, { at: [xc, 0, zb - 1.2] });
    b.box(4.8, 0.12, 8.8, P.paving, { at: [4.6, 0, -6.4] });
    b.box(3.6, 0.13, 7.6, P.water, { at: [4.6, 0, -6.4], mat: 'glass' });
    b.box(1.6, 0.04, 2.4, P.paving, { at: [-1.2, 0, 10.6] });
    b.tree(7, { at: [-6.5, 0, -7.5], kind: 'round' });
    b.sym((s) => b.box(6.0, 0.6, 0.3, white, { at: [s * 6.6, 0, 11.8] }));
  },
};
