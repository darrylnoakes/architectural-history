import { P, tint, type Builder, type BuildingDef } from '@ah/kit';

/**
 * A standard horticultural greenhouse: a galvanised steel frame every two metres, polycarbonate on
 * walls and roof, the ridge along Z. `openSide` slides back some wall panels; `vents` props open
 * the roof flaps; `roof: false` leaves the roof sheets off (the frame stays).
 */
function greenhouse(
  b: Builder,
  x: number,
  w: number,
  len: number,
  eave: number,
  rise: number,
  sheet: number,
  steel: number,
  o: { roof?: boolean; openSide?: 1 | -1; vents?: boolean; openFront?: boolean },
): void {
  const z0 = -len / 2;
  const n = Math.round(len / 2);
  // the frames
  for (let i = 0; i <= n; i++) {
    const z = z0 + (i * len) / n;
    for (const s of [-1, 1]) {
      b.box(0.1, eave, 0.1, steel, { at: [x + (s * w) / 2, 0, z] });
      b.beam([x + (s * w) / 2, eave, z], [x, eave + rise, z], 0.08, 0.1, steel, { jitter: false });
    }
    b.box(w, 0.06, 0.06, steel, { at: [x, eave - 0.06, z] });
  }
  b.box(0.1, 0.1, len, steel, { at: [x, eave + rise - 0.05, 0] });
  for (const s of [-1, 1]) b.box(0.08, 0.08, len, steel, { at: [x + (s * w) / 2, eave - 0.08, 0] });
  // the polycarbonate skin
  if (o.roof !== false) b.gable(w, len, rise, sheet, { at: [x, eave, 0], ridge: 'z', overhang: 0.03, thick: 0.03, mat: 'glass', wall: sheet });
  else b.gable(w, 0.06, rise, sheet, { at: [x, eave, len / 2], ridge: 'z', overhang: 0.0, thick: 0.03, mat: 'glass', wall: sheet });
  for (const s of [-1, 1]) {
    const open = o.openSide === s;
    if (!open) b.box(0.03, eave, len, sheet, { at: [x + (s * w) / 2, 0, 0], mat: 'glass' });
    else {
      // panels slid back over one another, leaving the middle open
      b.box(0.03, eave, len * 0.25, sheet, { at: [x + (s * w) / 2, 0, -len * 0.375], mat: 'glass' });
      b.box(0.03, eave, len * 0.25, sheet, { at: [x + (s * w) / 2 + s * 0.08, 0, -len * 0.3], mat: 'glass' });
      b.box(0.03, eave, len * 0.25, sheet, { at: [x + (s * w) / 2, 0, len * 0.375], mat: 'glass' });
    }
  }
  b.box(w, eave, 0.03, sheet, { at: [x, 0, z0], mat: 'glass' });
  if (o.openFront) {
    b.box(w * 0.3, eave, 0.03, sheet, { at: [x - w * 0.35, 0, -z0], mat: 'glass' });
    b.box(w * 0.3, eave, 0.03, sheet, { at: [x + w * 0.35, 0, -z0], mat: 'glass' });
    b.box(w * 0.32, eave, 0.03, sheet, { at: [x + w * 0.3, 0, -z0 + 0.1], mat: 'glass' });
  } else b.box(w, eave, 0.03, sheet, { at: [x, 0, -z0], mat: 'glass' });
  if (o.vents) {
    // roof flaps propped open along the ridge for summer ventilation
    for (let i = 0; i < n; i += 2) {
      const z = z0 + ((i + 0.5) * len) / n;
      b.group({ at: [x + 0.05, eave + rise - 0.02, z + 1.0], rot: [0, 0, -0.75] }, () => b.box(0.03, 0.03 + 0, 0.03, steel));
      b.beam([x + 0.05, eave + rise + 0.02, z], [x + 1.1, eave + rise + 0.25, z], 1.2 * 0 + 1.9, 0.03, sheet, { mat: 'glass' });
    }
  }
}

export const contemporaryHouse: BuildingDef = {
  id: 'contemporary-house',
  name: 'Greenhouse house',
  style: 'Contemporary',
  date: 'c. 2005',
  summary:
    'For the price of an ordinary house, two architects give a family twice the space by building with the cheapest structure there is: a pair of standard horticultural greenhouses. ' +
    'One holds the heated, insulated rooms; the other, and the space left round the rooms, is a "winter garden" of polycarbonate that warms in the sun, opens wide in summer and is shaded by curtains. ' +
    'Luxury is no longer marble and carving but generous space, light and the freedom to use it: the same idea the architects later applied to transform tower blocks of social housing instead of demolishing them.',
  materials: ['galvanised steel greenhouse frame', 'clear polycarbonate', 'insulated timber panels', 'concrete slab', 'thermal curtains'],
  modelledOn: 'The house at Coutras, Gironde (Anne Lacaton and Jean-Philippe Vassal, 2000), built from two horticultural greenhouses, one of them holding the insulated rooms; and their Maison Latapie, Floirac (1993). Simplified',
  lookFor: [
    { label: 'Greenhouse frame', note: 'An off-the-peg galvanised steel frame of the kind market gardeners use, cheap and quick to put up.', at: [4.5, 4.6, 9.0] },
    { label: 'Winter garden (jardin d’hiver)', note: 'A whole second house of unheated space under polycarbonate: a garden room in winter, open to the air in summer.', at: [4.5, 1.5, 3.0] },
    { label: 'Insulated core', note: 'The heated rooms are a simple insulated box set inside one greenhouse.', at: [-4.5, 2.4, -1.0] },
    { label: 'Sliding panels and roof vents', note: 'Whole walls slide open and roof flaps lift, so the house can be opened up like a greenhouse in summer.', at: [9.1, 1.8, 0] },
  ],
  build(b) {
    const sheet = b.pick([0xdfe9ec, 0xd6e3e6]);
    const steel = P.aluminium;
    const core = b.pick([P.larch, P.weatherboard, P.cladWhite, P.pine]);
    const curtain = b.pick([0xc8c8c4, 0xe1d6b8, 0xb8c6cc, 0xd9b7a0]);
    const W = 9.0;
    const L = 20.0;
    const eave = 3.4;
    const rise = 1.5;

    // ---- ground: a lawn, the slab under both greenhouses, a path to the street
    b.box(23.6, 0.04, 25.4, P.grass, { at: [0, 0, 0] });
    b.box(2 * W + 0.4, 0.15, L + 0.4, P.concrete, { at: [0, 0, 0] });
    b.box(2.0, 0.06, 2.6, P.gravel, { at: [-4.5, 0, L / 2 + 1.5] });

    // ---- the left greenhouse holds the insulated rooms; its roof is left off in cutaway so they show
    const lx = -W / 2;
    greenhouse(b, lx, W, L, eave, rise, sheet, steel, { roof: !b.cutaway, openFront: true });
    // the insulated core: a plain box with big windows and a flat roof
    const cz0 = -L / 2 + 0.6;
    const cz1 = 2.0;
    const cl = cz1 - cz0;
    b.box(W - 1.6, 2.9, cl, core, { at: [lx, 0.15, (cz0 + cz1) / 2] });
    b.box(W - 1.4, 0.2, cl + 0.2, tint(core, -0.1), { at: [lx, 3.05, (cz0 + cz1) / 2] });
    for (const z of [-6.0, -2.0]) b.box(0.06, 2.0, 2.4, P.glassDark, { at: [lx + (W - 1.6) / 2, 0.5, z], mat: 'glass' });
    b.box(4.0, 2.2, 0.06, P.glassDark, { at: [lx, 0.15, cz1 + 0.03], mat: 'glass' });
    for (const x of [-2.0, 0, 2.0]) b.box(0.06, 2.2, 0.1, steel, { at: [lx + x, 0.15, cz1 + 0.05] });
    // thermal curtains hung inside the polycarbonate, half drawn
    b.box(0.05, eave - 0.3, 6.0, curtain, { at: [-W + 0.15, 0.2, -5.0] });
    b.box(4.0, eave - 0.3, 0.05, curtain, { at: [lx - 2.0, 0.2, L / 2 - 0.15] });
    // a table and chairs in the winter-garden end of the left greenhouse
    b.box(1.6, 0.75, 0.9, P.pine, { at: [lx, 0.15, 5.8] });
    for (const s of [-1, 1]) b.box(0.45, 0.45, 0.45, P.cladRed, { at: [lx + s * 1.1, 0.15, 5.8] });

    // ---- the right greenhouse: all winter garden, plants and a sliding side opened up
    const rx = W / 2;
    greenhouse(b, rx, W, L, eave, rise, sheet, steel, { openSide: 1, vents: true });
    for (const [x, z, h] of [[rx - 2.5, -6.0, 2.6], [rx + 2.6, -2.0, 2.2], [rx - 1.8, 4.5, 3.0], [rx + 2.0, 7.0, 2.0]] as [number, number, number][]) {
      b.cyl(0.4, 0.5, P.terracotta, { at: [x, 0.15, z], segs: 8, rTop: 0.45 });
      b.tree(h, { at: [x, 0.6, z], kind: h > 2.5 ? 'round' : 'bush', color: P.leafDark });
    }
    b.box(2.2, 0.4, 0.8, P.pine, { at: [rx + 1.5, 0.15, 1.0] });
    b.box(2.0, 0.08, 2.0, 0xb9644a, { at: [rx - 1.0, 0.16, -1.0] });

    // ---- colliders: the core and each greenhouse's outer walls, the winter gardens walkable
    b.collider(W - 1.6, cl, { at: [lx, 0, (cz0 + cz1) / 2] });
    b.collider(0.3, L, { at: [-W, 0, 0] });
    b.collider(2 * W, 0.3, { at: [0, 0, -L / 2] });
    b.collider(0.3, L * 0.25, { at: [W, 0, -L * 0.375] });
    b.collider(0.3, L * 0.25, { at: [W, 0, L * 0.375] });
    b.collider(W, 0.3, { at: [rx, 0, L / 2] });

    // ---- the garden: a few trees, a hedge to the street, a bicycle shed
    for (const [x, z, h] of [[-10.5, -11.5, 6.0], [10.6, -11.0, 5.0], [10.4, 11.2, 4.5]] as [number, number, number][]) b.tree(h, { at: [x, 0, z], kind: 'round' });
    b.box(9.0, 1.2, 0.6, P.hedge, { at: [6.4, 0, 12.4] });
    b.box(7.0, 1.2, 0.6, P.hedge, { at: [-8.3, 0, 12.4] });
  },
};
