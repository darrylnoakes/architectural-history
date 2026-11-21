import { P, linspace, tint, type Builder, type BuildingDef } from '@ah/kit';

/** Vertical board cladding on a box face: alternate boards a shade darker. */
function boards(b: Builder, w: number, h: number, x: number, y: number, z: number, facing: '+z' | '-z' | '+x' | '-x', color: number) {
  const n = Math.floor(w / 0.24);
  const dark = tint(color, -0.06);
  for (let i = 0; i < n; i += 2) {
    const u = -w / 2 + (i + 0.5) * (w / n);
    const at: [number, number, number] =
      facing === '+z' ? [x + u, y, z] : facing === '-z' ? [x - u, y, z] : facing === '+x' ? [x, y, z - u] : [x, y, z + u];
    b.panel(w / n, h, dark, { at, facing, depth: 0.02 });
  }
}

/** A flat roof slab with a planted sedum top and a thin metal edge. */
function sedumRoof(b: Builder, w: number, d: number, x: number, y: number, z: number) {
  b.box(w, 0.3, d, P.concreteWhite, { at: [x, y, z] });
  b.box(w + 0.04, 0.08, d + 0.04, P.aluminium, { at: [x, y + 0.26, z] });
  b.box(w - 0.3, 0.12, d - 0.3, 0x7f9a52, { at: [x, y + 0.24, z] });
  // a few darker clumps so it reads as planting, not grass
  for (let i = 0; i < 8; i++) {
    const px = x + (b.rand() - 0.5) * (w - 1);
    const pz = z + (b.rand() - 0.5) * (d - 1);
    b.box(b.range(0.6, 1.4), 0.04, b.range(0.6, 1.4), b.pick([0x8a7a4a, 0x6d8a46, 0xa08a5a]), { at: [px, y + 0.36, pz] });
  }
}

/** A frameless glass wall: one glossy pane with near-invisible joints every 1.5 m. */
function glassWall(b: Builder, w: number, h: number, x: number, y: number, z: number, facing: '+z' | '-z' | '+x' | '-x') {
  const along = facing === '+z' || facing === '-z';
  b.box(along ? w : 0.06, h, along ? 0.06 : w, P.glass, { at: [x, y, z], mat: 'glass', jitter: false });
  const n = Math.max(1, Math.round(w / 1.5));
  for (const u of linspace(n + 1, -w / 2, w / 2).slice(1, -1)) {
    b.box(along ? 0.02 : 0.08, h, along ? 0.08 : 0.02, P.glassDark, { at: along ? [x + u, y, z] : [x, y, z + u] });
  }
}

export const glassHouse: BuildingDef = {
  id: 'glass-house',
  name: 'Contemporary glass house',
  style: 'Contemporary',
  date: 'c. 1998',
  summary:
    'After decades of mock-Tudor and neo-Georgian, the richest household again commissions an architect, this time to show what new materials can do. ' +
    'Toughened double glazing held by structural silicone makes walls of frameless glass, so the living space opens straight on to a private courtyard. ' +
    'Solid parts are clad in untreated larch that weathers to silver, and the flat roofs are planted with sedum to insulate the house and slow the rainwater. ' +
    'It revives the open plan and flat roof of the 1930s villa, with a new eye on landscape and energy.',
  materials: ['toughened glass', 'steel frame', 'larch cladding', 'sedum roof', 'concrete'],
  lookFor: [
    { label: 'Frameless glazing', note: 'Huge panes joined edge to edge with silicone, with no visible frames, so the wall almost disappears.', at: [-2.5, 1.6, 7.4] },
    { label: 'Sedum roof', note: 'A living roof of low succulent plants that insulates, soaks up rain and gives wildlife a foothold.', at: [-2.5, 3.8, 3.0] },
    { label: 'Timber cladding', note: 'Untreated larch boards, left to weather to silver-grey rather than painted.', at: [1.5, 5.0, 6.0] },
    { label: 'Floating upper storey', note: 'The timber box sits on the glass room as if floating, carried on a hidden steel frame and slim steel posts rather than walls.', at: [-2.0, 3.6, 6.1] },
    { label: 'Courtyard', note: 'A private outdoor room enclosed by the house and a garden wall, with a reflecting pool.', at: [-3.0, 1.0, -4.5] },
  ],
  influences: ['high-tech-export'],
  build(b) {
    const larch = b.pick([P.larch, tint(P.larch, -0.04), mixSilver()]);
    const conc = P.concreteWhite;

    // ---- glass living pavilion, one storey, facing the street and the courtyard
    const gx0 = -8.2;
    const gx1 = 3.2;
    const gz0 = -1.0;
    const gz1 = 7.4;
    const gH = 3.2;
    const gxc = (gx0 + gx1) / 2;
    const gzc = (gz0 + gz1) / 2;
    b.box(gx1 - gx0, 0.25, gz1 - gz0, conc, { at: [gxc, 0, gzc] });
    glassWall(b, gx1 - gx0, gH - 0.25, gxc, 0.25, gz1, '+z');
    glassWall(b, gx1 - gx0, gH - 0.25, gxc, 0.25, gz0, '-z');
    glassWall(b, gz1 - gz0, gH - 0.25, gx0, 0.25, gzc, '-x');
    for (const [x, z] of [[gx0, gz0], [gx0, gz1], [gx1, gz1], [-3, gz1], [-3, gz0]]) b.box(0.14, gH - 0.25, 0.14, P.steel, { at: [x, 0.25, z] });
    // a solid core of fireplace and kitchen inside
    b.box(2.2, gH - 0.25, 1.0, P.concrete, { at: [-5.5, 0.25, 2.5] });
    sedumRoof(b, gx1 - gx0 + 1.6, gz1 - gz0 + 1.6, gxc - 0.2, gH, gzc);

    // ---- larch-clad service wing, its roof a step lower
    const sx0 = 3.2;
    const sx1 = 9.2;
    const sz0 = -6.0;
    const sz1 = 7.4;
    const sH = 3.0;
    const sxc = (sx0 + sx1) / 2;
    const szc = (sz0 + sz1) / 2;
    b.box(sx1 - sx0, sH, sz1 - sz0, larch, { at: [sxc, 0, szc] });
    boards(b, sx1 - sx0, sH, sxc, 0, sz1, '+z', larch);
    boards(b, sz1 - sz0, sH, sx1, 0, szc, '+x', larch);
    boards(b, sz1 - sz0, sH, sx0, 0, szc, '-x', larch);
    sedumRoof(b, sx1 - sx0 + 0.6, sz1 - sz0 + 0.6, sxc, sH, szc);
    // pivoting front door and a slot window to the street
    b.panel(1.4, 2.6, tint(larch, -0.2), { at: [sx0 + 1.3, 0, sz1], facing: '+z', depth: 0.08 });
    b.panel(0.25, 2.6, P.aluminium, { at: [sx0 + 2.2, 0, sz1], facing: '+z', depth: 0.06 });
    b.panel(3.2, 0.45, P.glassDark, { at: [sxc + 0.8, 1.9, sz1], facing: '+z', mat: 'glass', depth: 0.06 });
    b.panel(0.5, 2.0, P.glassDark, { at: [sx1, 0.6, 2.5], facing: '+x', mat: 'glass' });
    b.panel(0.5, 2.0, P.glassDark, { at: [sx1, 0.6, -3.0], facing: '+x', mat: 'glass' });
    // glazed wall to the courtyard
    glassWall(b, 6.0, sH - 0.25, sx0, 0.25, -3.0, '-x');

    // ---- upper timber box, cantilevered out over the glass room
    const ux0 = -5.2;
    const ux1 = 4.6;
    const uz0 = -0.4;
    const uz1 = 6.1;
    const uy = gH + 0.45;
    const uH = 3.0;
    const uxc = (ux0 + ux1) / 2;
    const uzc = (uz0 + uz1) / 2;
    b.box(ux1 - ux0, uH, uz1 - uz0, larch, { at: [uxc, uy, uzc] });
    boards(b, ux1 - ux0, uH, uxc, uy, uz1, '+z', larch);
    boards(b, ux1 - ux0, uH, uxc, uy, uz0, '-z', larch);
    boards(b, uz1 - uz0, uH, ux0, uy, uzc, '-x', larch);
    boards(b, uz1 - uz0, uH, ux1, uy, uzc, '+x', larch);
    b.box(ux1 - ux0 + 0.1, 0.12, uz1 - uz0 + 0.1, P.aluminium, { at: [uxc, uy - 0.1, uzc] });
    sedumRoof(b, ux1 - ux0 + 0.4, uz1 - uz0 + 0.4, uxc, uy + uH, uzc);
    // one big picture window to the street and a long one to the courtyard, in thin aluminium frames
    b.window(4.2, 1.9, { at: [uxc - 1.4, uy + 0.55, uz1], facing: '+z', frame: P.aluminium, glass: P.glassDark, border: 0.06, mat: 'glass' });
    b.window(6.0, 1.4, { at: [uxc, uy + 0.8, uz0], facing: '-z', frame: P.aluminium, glass: P.glassDark, border: 0.06, mat: 'glass' });
    b.window(1.8, 1.4, { at: [ux0, uy + 0.8, uzc], facing: '-x', frame: P.aluminium, glass: P.glassDark, border: 0.06, mat: 'glass' });
    // a slim steel stair rising beside the service wing
    b.box(0.08, uy, 0.08, P.steel, { at: [ux1 - 0.2, 0, uz1 - 0.2] });

    // ---- the courtyard: timber deck, reflecting pool, a birch, a garden wall
    b.box(11.2, 0.12, 9.6, tint(larch, -0.1), { at: [-2.6, 0, -6.0] });
    for (const z of linspace(18, -10.6, -1.4)) b.box(11.2, 0.13, 0.03, tint(larch, -0.2), { at: [-2.6, 0, z] });
    b.box(5.0, 0.15, 2.4, P.concreteDark, { at: [-4.0, 0, -5.2] });
    b.box(4.6, 0.16, 2.0, P.water, { at: [-4.0, 0, -5.2], mat: 'glass' });
    b.tree(7, { at: [0.8, 0, -7.6], kind: 'poplar', color: P.leaf });
    b.cyl(0.06, 0.3, P.white, { at: [0.8, 0, -7.6], segs: 5 });
    b.box(0.3, 2.4, 10.8, conc, { at: [-9.4, 0, -6.4] });
    b.box(19, 2.4, 0.3, conc, { at: [-0.1, 0, -11.7] });
    b.box(0.3, 2.4, 5.6, conc, { at: [9.2, 0, -9.0] });

    // ---- street side: gravel, a low concrete wall and a single tree
    b.box(18.4, 0.04, 4.2, P.grass, { at: [0, 0, 9.8] });
    b.box(5.5, 0.05, 4.4, P.gravel, { at: [6.0, 0, 9.7] });
    b.box(1.6, 0.06, 4.4, P.paving, { at: [4.5, 0, 9.7] });
    b.box(9.5, 0.7, 0.3, conc, { at: [-4.8, 0, 11.8] });
    b.tree(5.5, { at: [-7.6, 0, 9.6], kind: 'round', color: P.leafDark });
  },
};

function mixSilver(): number {
  return tint(P.oakSilver, 0.02);
}
