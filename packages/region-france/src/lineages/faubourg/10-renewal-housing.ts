import { P, mix, tint, type Builder, type BuildingDef, type Facing, type Vec3 } from '@ah/kit';
import { paling, patch, wallRects } from './shared';

const FH = 2.85;
type Rect = [number, number, number, number];

/** Vertical timber battens over a wall rectangle (u along the wall, y up), as one cheap mesh. */
function battens(b: Builder, at: Vec3, facing: '+z' | '-z' | '+x' | '-x', u0: number, u1: number, y0: number, y1: number, color: number, gap = 0.22): void {
  const rects: Rect[] = [];
  for (let u = u0 + gap / 2; u < u1; u += gap) rects.push([u, y0, 0.09, y1 - y0]);
  wallRects(b, rects, color, at, facing, 0.06);
}

/**
 * A block of flats: rendered below, clad in larch on the top floor, recessed loggias on the garden
 * side, tall windows with sliding timber shutters on the street side, a green roof. Long axis along X;
 * `garden` is the side the loggias face.
 */
function block(
  b: Builder,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  floors: number,
  garden: '+z' | '-z',
  o: { render: number; larch: number; frame: number; entryGarden?: boolean },
): void {
  const L = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const top = floors * FH;
  b.box(L, top, D, o.render, { at: [xc, 0, zc] });
  b.box(L + 0.04, 0.45, D + 0.04, P.concreteDark, { at: [xc, 0, zc] });
  b.collider(L, D, { at: [xc, 0, zc] });
  // the top floor wrapped in larch boarding
  b.box(L + 0.1, FH, D + 0.1, o.larch, { at: [xc, top - FH, zc] });
  for (const [z, f] of [[z1 + 0.05, '+z'], [z0 - 0.05, '-z']] as const) battens(b, [xc, 0, z], f, -L / 2, L / 2, top - FH + 0.05, top - 0.05, tint(o.larch, -0.1));
  // the green roof with its parapet, and a run of solar panels
  b.box(L + 0.2, 0.35, D + 0.2, tint(o.larch, -0.12), { at: [xc, top, zc] });
  b.box(L - 0.4, 0.2, D - 0.4, mix(P.grassDry, P.leaf, 0.4), { at: [xc, top + 0.05, zc] });
  for (let k = 0; k < Math.floor((L - 2) / 2.2); k++) {
    b.box(2.0, 0.08, 1.4, P.solar, { at: [x0 + 1.6 + k * 2.2, top + 0.6, zc], rot: [-0.35, 0, 0], mat: 'glass' });
    b.box(0.08, 0.5, 0.08, P.steel, { at: [x0 + 1.6 + k * 2.2, top + 0.2, zc + 0.4] });
  }
  const bays = Math.round(L / 3.4);
  const bw = L / bays;
  const gz = garden === '+z' ? z1 : z0;
  const sz = garden === '+z' ? z0 : z1;
  const sf: Facing = garden === '+z' ? '-z' : '+z';
  const gs = garden === '+z' ? 1 : -1;
  const glass: Rect[] = [];
  const frames: Rect[] = [];
  const shutters: Rect[] = [];
  for (let f = 0; f < floors; f++) {
    const y = f * FH;
    for (let i = 0; i < bays; i++) {
      const u = -L / 2 + (i + 0.5) * bw;
      // street side: tall windows, each with a sliding shutter parked beside it, staggered from floor to floor
      const wu = u + ((f + i) % 2 ? 0.4 : -0.4);
      if (!(f === 0 && i === Math.floor(bays / 2))) {
        frames.push([wu, y + 0.5, 1.1, 2.1]);
        glass.push([wu, y + 0.56, 0.98, 1.98]);
        shutters.push([wu + ((f + i) % 2 ? -1.15 : 1.15), y + 0.48, 1.12, 2.14]);
      }
      // garden side: a loggia in alternate bays, windows in the others
      if (i % 2 === 0 && f > 0) {
        const lx = xc + u;
        const lw = bw - 0.5;
        b.box(lw, FH - 0.2, 1.3, tint(o.larch, -0.25), { at: [lx, y + 0.1, gz - gs * 0.6] }); // the recess, lined in timber
        b.box(lw + 0.3, 0.2, 1.4, o.render, { at: [lx, y - 0.05, gz - gs * 0.55] }); // the loggia floor slab edge
        b.window(lw * 0.6, 2.1, { at: [lx - lw * 0.15, y + 0.15, gz - gs * 1.25], facing: garden, frame: o.frame, glass: P.glassDark, bars: [2, 1], border: 0.06 });
        // balustrade of vertical slats
        const slats: Rect[] = [];
        for (let k = 0; k < 14; k++) slats.push([u - lw / 2 + (lw * (k + 0.5)) / 14, y + 0.15, 0.06, 1.0]);
        wallRects(b, slats, o.larch, [xc, 0, gz], garden, 0.05);
        b.box(lw, 0.06, 0.08, o.larch, { at: [lx, y + 1.15, gz + gs * 0.05] });
      } else {
        const g: Rect[] = [[u, y + 0.6, 1.3, 1.9]];
        wallRects(b, g, o.frame, [xc, 0, gz], garden, 0.03);
        wallRects(b, [[u, y + 0.66, 1.18, 1.78]], P.glassDark, [xc, 0, gz], garden, 0.045);
      }
    }
  }
  wallRects(b, frames, o.frame, [xc, 0, sz], sf, 0.03);
  wallRects(b, glass, P.glassDark, [xc, 0, sz], sf, 0.045);
  wallRects(b, shutters, tint(o.larch, 0.05), [xc, 0, sz], sf, 0.09);
  // the entrance on the street side: a glazed door under a canopy
  const eu = -L / 2 + (Math.floor(bays / 2) + 0.5) * bw;
  if (o.entryGarden) {
    // entered from the garden path: the door in the ground-floor bay without a loggia above
    const ex = xc + eu + (Math.floor(bays / 2) % 2 === 0 ? bw : 0);
    b.window(1.8, 2.4, { at: [ex, 0.05, gz], facing: garden, frame: P.steel, glass: P.glassDark, bars: [2, 1], border: 0.06, mat: 'glass' });
    b.box(2.6, 0.15, 1.2, P.steel, { at: [ex, 2.7, gz + gs * 0.6] });
  } else {
    b.window(1.8, 2.4, { at: [xc + eu, 0.05, sz], facing: sf, frame: P.steel, glass: P.glassDark, bars: [2, 1], border: 0.06, mat: 'glass' });
    b.box(2.6, 0.15, 1.2, P.steel, { at: [xc + eu, 2.7, sz - gs * 0.6] });
  }
  // end walls: a column of windows
  for (const sx of [-1, 1]) {
    const f: Facing = sx > 0 ? '+x' : '-x';
    const rects: Rect[] = [];
    for (let k = 0; k < floors; k++) rects.push([0, k * FH + 0.6, 1.0, 1.7]);
    wallRects(b, rects, P.glassDark, [xc + (sx * L) / 2, 0, zc], f, 0.06);
  }
}

/** A raised timber planting bed of the shared garden. */
function raisedBed(b: Builder, x: number, z: number, w: number, d: number, larch: number): void {
  b.box(w, 0.45, d, larch, { at: [x, 0, z] });
  b.box(w - 0.2, 0.06, d - 0.2, P.soil, { at: [x, 0.42, z], jitter: false });
  for (let k = 0; k < 3; k++) b.box(w - 0.5, 0.25, 0.25, k === 1 ? P.leafAutumn : P.leaf, { at: [x, 0.48, z - d / 2 + 0.35 + k * ((d - 0.7) / 2)] });
}

export const renewalHousing: BuildingDef = {
  id: 'renewal-housing',
  name: 'Renewal social housing',
  style: 'Contemporary social housing',
  date: 'c. 2012',
  summary:
    'From 2004 the national urban renewal programme, run by the ANRU (the agency set up by the Borloo law of 2003), paid for the demolition of thousands of slabs and towers of the 1960s, often to the regret of tenants who had made their lives in them, and for their replacement by smaller buildings. ' +
    'In place of the barre stand low blocks of three or four floors, each with its own entrance from the street, a fence round its own ground (the planners called it residentialisation) and a garden shared by the tenants. ' +
    'Timber cladding, deep loggias, insulation and planted roofs answer the new energy rules: what was once a monument to industry is now meant to look domestic, green and calm.',
  materials: ['insulated render', 'larch boarding', 'timber sliding shutters', 'sedum roof', 'solar panels'],
  lookFor: [
    { label: 'Loggias', note: 'Deep recessed balconies lined in timber, each flat’s private outdoor room, facing the garden.', at: [4.2, 4.8, -1.0] },
    { label: 'Timber cladding', note: 'The top floor is wrapped in untreated larch boards, which weather to silver grey.', at: [-6.6, 10.0, 7.4] },
    { label: 'Sliding shutters', note: 'Timber shutters slide across the tall windows in place of the old roller blinds.', at: [-9.5, 3.5, 7.3] },
    { label: 'Shared garden', note: 'Raised beds tended by the tenants, a lawn and young trees in place of the slab’s car park.', at: [-5.0, 0.8, -4.6] },
    { label: 'Green roof', note: 'A layer of sedum on the flat roofs holds back rain water and helps keep the flats cool, beside rows of solar panels.', at: [6.4, 9.4, -4.8] },
  ],
  build(b) {
    const render = b.pick([P.whiteRender, mix(P.whiteRender, P.enduitGris, 0.5), mix(P.whiteRender, P.ochreWash, 0.15)]);
    const larch = b.pick([P.larch, mix(P.larch, P.oakSilver, 0.5), P.cedar]);
    const frame = b.pick([P.cladGrey, P.steel, P.cladWhite]);

    // the street front: pavement, a low fence with a gate (residentialisation)
    patch(b, 25.8, 1.0, P.paving, [0, 7.5], 0.1);
    patch(b, 25.8, 15.0, mix(P.grass, P.meadow, 0.4), [0, -0.5], 0.04);

    // two blocks: one on the street, one at the back across the garden
    block(b, -12.4, -0.8, 1.2, 6.8, 4, '-z', { render, larch, frame });
    block(b, 1.2, 12.4, -7.7, -2.2, 3, '+z', { render, larch: tint(larch, 0.03), frame, entryGarden: true });

    // paths, the shared garden: raised beds, young trees, a bench, a bicycle shelter
    patch(b, 1.6, 9.0, P.gravel, [0.2, 2.5], 0.06);
    patch(b, 11.0, 1.4, P.gravel, [6.6, -1.3], 0.06);
    raisedBed(b, -9.0, -3.2, 3.0, 1.4, larch);
    raisedBed(b, -9.0, -5.6, 3.0, 1.4, larch);
    raisedBed(b, -4.8, -3.2, 3.0, 1.4, larch);
    raisedBed(b, -4.8, -5.6, 3.0, 1.4, larch);
    for (const [tx, tz] of [[-11.4, -1.0], [-1.2, -5.0], [5.4, 3.8], [11.0, 4.2]] as const) b.tree(b.range(4.4, 5.2), { kind: 'round', at: [tx, 0, tz], color: mix(P.leaf, P.leafDark, b.rand()) });
    b.box(1.8, 0.45, 0.5, larch, { at: [-6.8, 0, -0.4] });
    // the bicycle shelter: a timber roof on steel posts
    b.group({ at: [8.6, 0, 3.6] }, () => {
      for (const [px, pz] of [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]] as const) b.box(0.1, 2.2, 0.1, P.steel, { at: [px, 0, pz] });
      b.shed(4.2, 2.2, 0.3, larch, { at: [0, 2.2, 0], high: '+z' });
      for (let k = 0; k < 4; k++) b.box(0.05, 0.9, 1.6, P.steel, { at: [-1.2 + k * 0.8, 0, 0] });
    });
    // the fence along the street, with a gate on the path; a hedge along the garden fence
    paling(b, [-12.8, 6.95 + 0.25], [-0.4, 6.95 + 0.25], { h: 1.2, color: P.steel, gap: 0.12 });
    paling(b, [1.0, 7.2], [12.8, 7.2], { h: 1.2, color: P.steel, gap: 0.12 });
    b.box(11.6, 0.9, 0.6, P.hedge, { at: [6.9, 0, 6.6] });
    // the communal waste and recycling bins in their timber enclosure
    b.box(2.6, 1.5, 1.4, larch, { at: [-0.4, 0, -6.8] });
    b.collider(2.6, 1.4, { at: [-0.4, 0, -6.8] });
    b.collider(4.0, 2.0, { at: [8.6, 0, 3.6] });
  },
};
