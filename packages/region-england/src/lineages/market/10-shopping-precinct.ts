import { P, linspace, spread, tint, type BuildingDef, type Builder } from '@ah/kit';

/** An abstract mosaic mural: a rising sun over waves and fields, built from square tesserae panels. */
function mosaic(b: Builder, cols: number, rows: number, cell: number, at: [number, number, number], facing: '+x' | '-x' | '+z' | '-z'): void {
  const pal = [P.cladBlue, P.cladYellow, P.cladRed, P.cladGreen, P.white, P.black, P.doorBlue, P.ochreWash];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = (i + 0.5) / cols - 0.5;
      const v = (j + 0.5) / rows;
      let c: number;
      const dSun = Math.hypot(u * 1.4, v - 0.62);
      if (dSun < 0.2) c = dSun < 0.12 ? pal[1] : pal[7];
      else if (v < 0.3) c = (i + Math.floor(j * 1.5)) % 4 < 2 ? pal[0] : pal[6];
      else if (v < 0.42) c = (i + j) % 3 === 0 ? pal[3] : pal[1];
      else if (Math.abs(Math.atan2(v - 0.62, u * 1.4) * 4) % 1 < 0.3 && dSun < 0.45) c = pal[2];
      else c = (i * 7 + j * 3) % 5 === 0 ? pal[4] : tint(pal[4], -0.06);
      const off = (i - (cols - 1) / 2) * cell;
      const y = at[1] + j * cell;
      const pos: [number, number, number] =
        facing === '-x' || facing === '+x' ? [at[0], y, at[2] + (facing === '-x' ? off : -off)] : [at[0] + (facing === '+z' ? off : -off), y, at[2]];
      b.panel(cell - 0.04, cell - 0.04, c, { at: pos, facing, depth: 0.04, jitter: false });
    }
  }
}

export const shoppingPrecinct: BuildingDef = {
  id: 'shopping-precinct',
  name: 'Shopping precinct',
  style: 'Post-war Modernist',
  date: 'c. 1964',
  summary:
    'After the war the council cleared the old store and built a precinct, a modern range of standard shop units in reinforced concrete with offices and more shops above. ' +
    'Planners wanted to separate people from traffic, so the upper shops open onto a walkway reached by an open stair, and its slab doubles as a canopy over the shop windows below. ' +
    'Ornament has gone, apart from one concession to civic pride: a mosaic mural on the end wall and a clock on a concrete pylon.',
  materials: ['reinforced concrete', 'precast panels', 'aluminium shopfronts', 'glass mosaic'],
  lookFor: [
    { label: 'Upper walkway', note: 'A deck-access gallery for the first-floor shops, keeping shoppers above and away from the delivery vans.', at: [-3.0, 4.6, 6.6] },
    { label: 'Canopy', note: 'The walkway slab and a cantilevered canopy at the back shelter the shop windows; the shopfronts are standard units with fascia signs.', at: [3.0, 3.2, -5.6] },
    { label: 'Mosaic panel', note: 'A mural of small glass and ceramic tiles, the favourite decoration of the 1960s new towns and precincts.', at: [-8.7, 4.0, 0] },
    { label: 'Clock pylon', note: 'A slender concrete tower with clock faces, the precinct’s replacement for the old market cross.', at: [-9.6, 8.4, 6.9] },
    { label: 'Exposed concrete frame', note: 'Columns and floor slabs left plain and repeated bay after bay.', at: [8.4, 1.8, 6.9] },
  ],
  influences: ['continental-modernism', 'corbusian-brutalism'],
  build(b) {
    const W = 17;
    const D = 8.4;
    const G = 3.6; // ground storey
    const U = 3.2; // upper storey
    const WK = 2.6; // walkway depth
    const conc = b.pick([P.concrete, tint(P.concrete, 0.03)]);
    const concD = P.concreteDark;
    const alu = P.aluminium;
    const bays = 5;
    const bw = W / bays;
    const signColours = [P.cladRed, P.cladBlue, P.cladYellow, P.cladGreen, P.white, P.black];

    // paving apron
    b.box(W + 4.4, 0.06, D + 2 * WK + 1.2, P.paving, { at: [0.6, 0, 0.6] });

    // the core range: frame, slabs and infill
    b.box(W, G + U, D, conc, { at: [0, 0, 0] });
    b.collider(W, D, { at: [0, 0, 0] });
    // first floor slab, carried out as the walkway at the front and a canopy at the back
    b.box(W + 0.4, 0.3, D + WK + 0.2, conc, { at: [0, G, WK / 2] });
    b.box(W + 0.4, 0.22, 1.8, conc, { at: [0, 3.0, -D / 2 - 0.9] });
    b.box(W + 0.44, 0.08, 1.84, P.black, { at: [0, 3.1, -D / 2 - 0.9] });
    // roof slab with a deep fascia
    b.box(W + 0.6, 0.9, D + 0.6, conc, { at: [0, G + U, 0] });
    b.box(W + 0.64, 0.12, D + 0.64, concD, { at: [0, G + U + 0.25, 0] });
    b.box(3, 2.2, 2.4, conc, { at: [3.5, G + U + 0.9, -1] }); // lift and tank room

    // shop units front and back: aluminium shopfronts, fascia signs, recessed doors
    for (const s of [1, -1] as const) {
      const zf = s * (D / 2);
      const facing = s > 0 ? '+z' : '-z';
      spread(bays, -W / 2, W / 2).forEach((x, i) => {
        b.panel(bw - 0.5, 2.6, alu, { at: [x, 0.05, zf], facing, depth: 0.05 });
        b.panel(bw - 0.7, 2.4, P.glassDark, { at: [x, 0.15, zf], facing, depth: 0.08, mat: 'glass' });
        b.panel(0.9, 2.3, P.doorBlack, { at: [x + bw / 2 - 1.0, 0.1, zf], facing, depth: 0.1 });
        b.panel(bw - 0.4, 0.55, signColours[(i * 2 + (s > 0 ? 0 : 1) + b.variant) % signColours.length], { at: [x, 2.8, zf], facing, depth: 0.1 });
        // upper storey: precast panels with a strip of windows
        b.panel(bw - 0.3, 1.5, P.glassDark, { at: [x, G + 1.0, zf], facing, depth: 0.05, mat: 'glass' });
        for (const mx of linspace(4, x - bw / 2 + 0.15, x + bw / 2 - 0.15)) b.panel(0.08, 1.5, alu, { at: [mx, G + 1.0, zf], facing, depth: 0.08 });
        if (s > 0) {
          b.panel(0.9, 2.2, P.doorBlue, { at: [x - bw / 2 + 0.8, G + 0.3, zf], facing, depth: 0.07 });
        }
      });
      // expressed columns between the units
      for (const x of linspace(bays + 1, -W / 2 + 0.15, W / 2 - 0.15)) b.box(0.35, G + U, 0.25, concD, { at: [x, 0, zf + s * 0.05] });
    }
    // walkway: slender columns, railing and the deck surface
    const zw = D / 2 + WK;
    for (const x of linspace(bays + 1, -W / 2 + 0.2, W / 2 - 0.2)) {
      b.box(0.3, G, 0.3, concD, { at: [x, 0, zw - 0.2] });
      b.collider(0.4, 0.4, { at: [x, 0, zw - 0.2] });
    }
    b.box(W + 0.4, 0.4, 0.15, conc, { at: [0, G + 0.3, zw + 0.05] }); // upstand
    for (const x of linspace(40, -W / 2, W / 2)) b.box(0.04, 0.7, 0.04, P.black, { at: [x, G + 0.7, zw + 0.05] });
    b.box(W + 0.4, 0.06, 0.1, P.black, { at: [0, G + 1.4, zw + 0.05] });
    b.deck(W + 0.4, WK, G + 0.3, { at: [0, 0, D / 2 + WK / 2] });

    // open stair at the east end, climbing to the walkway
    const sx = W / 2 + 1.0;
    b.group({ at: [sx, 0, 0.6], rotY: Math.PI }, () => {
      b.stairs(1.6, G + 0.3, 7.2, 20, conc);
    });
    b.box(1.6, 0.3, WK + 0.2, conc, { at: [sx, G, zw - WK / 2 - 0.1] });
    b.box(0.3, G, 0.3, concD, { at: [sx, 0, zw - 0.2] });
    for (const t of [-1, 1]) {
      b.group({ at: [sx + t * 0.8, 0, 0.6] }, () => {
        const ang = Math.atan2(G + 0.3, 7.2);
        b.box(0.05, 0.05, Math.hypot(7.2, G + 0.3), P.black, { at: [0, (G + 0.3) / 2 + 0.95, 0], rot: [-ang, 0, 0] });
      });
    }
    b.collider(1.8, 7.4, { at: [sx, 0, 0.6] });

    // mosaic mural on the blank west end wall
    mosaic(b, 14, 10, 0.5, [-W / 2, 1.2, 0], '-x');
    b.panel(7.4, 0.15, concD, { at: [-W / 2, 1.0, 0], facing: '-x', depth: 0.08 });
    // the east end gets a single tall window strip for the stair hall
    b.panel(1.2, 5.6, P.glassDark, { at: [W / 2, 0.6, -2.4], facing: '+x', depth: 0.05, mat: 'glass' });

    // clock pylon at the front west corner
    const cx = -W / 2 - 0.8;
    const cz = zw + 0.3;
    b.box(0.7, 7.6, 0.7, conc, { at: [cx, 0, cz] });
    b.box(1.3, 1.3, 1.3, concD, { at: [cx, 7.6, cz] });
    b.box(1.5, 0.12, 1.5, conc, { at: [cx, 8.9, cz] });
    for (const f of ['+z', '-z', '+x', '-x'] as const) {
      const d = 0.65;
      const p: [number, number, number] = f === '+z' ? [cx, 7.85, cz + d] : f === '-z' ? [cx, 7.85, cz - d] : f === '+x' ? [cx + d, 7.85, cz] : [cx - d, 7.85, cz];
      b.panel(0.95, 0.95, P.white, { at: p, facing: f, shape: 'circle', depth: 0.04 });
      for (const [w, h, ox] of [[0.05, 0.38, 0], [0.3, 0.05, 0.15]] as [number, number, number][]) {
        const off: [number, number, number] = f === '+z' ? [ox, 0, 0.03] : f === '-z' ? [-ox, 0, -0.03] : f === '+x' ? [0.03, 0, -ox] : [-0.03, 0, ox];
        b.panel(w, h, P.black, { at: [p[0] + off[0], 8.32 + (h < 0.1 ? 0 : 0), p[2] + off[2]], facing: f, depth: 0.06 });
      }
    }
    b.collider(0.8, 0.8, { at: [cx, 0, cz] });

    // planters and benches on the front paving
    for (const x of [-5, 1.5]) {
      b.box(2.4, 0.6, 1.0, concD, { at: [x, 0, zw + 1.3] });
      b.blob(0.5, P.hedge, { at: [x - 0.6, 0.75, zw + 1.3], stretch: [1.2, 0.7, 0.8], detail: 0 });
      b.blob(0.5, P.leaf, { at: [x + 0.5, 0.75, zw + 1.3], stretch: [1.2, 0.7, 0.8], detail: 0 });
      b.collider(2.4, 1.0, { at: [x, 0, zw + 1.3] });
    }
  },
};
