import { P, car, lamp, tint, type BuildingDef, type Builder } from '@ah/kit';

const CLAD = tint(P.cladWhite, -0.05);
const BAND = P.cladBlue;
const STRIPE = P.cladRed;

/** A wire shopping trolley, nose toward local +Z. */
function trolley(b: Builder, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    b.box(0.5, 0.45, 0.8, P.aluminium, { at: [0, 0.45, 0] });
    b.box(0.46, 0.4, 0.76, P.windowDark, { at: [0, 0.5, 0] });
    b.box(0.52, 0.04, 0.04, P.cladRed, { at: [0, 1.0, -0.48] });
    for (const sx of [-1, 1]) {
      b.beam([sx * 0.24, 0.1, -0.35], [sx * 0.24, 1.0, -0.48], 0.03, 0.03, P.aluminium);
      b.beam([sx * 0.24, 0.1, 0.35], [sx * 0.24, 0.45, 0.4], 0.03, 0.03, P.aluminium);
      for (const z of [-0.35, 0.35]) b.cyl(0.06, 0.06, P.black, { at: [sx * 0.22, 0, z], segs: 5 });
    }
  });
}

export const hypermarket: BuildingDef = {
  id: 'hypermarket',
  name: 'Hypermarket',
  style: 'Commercial shed',
  date: 'c. 1969',
  summary:
    'The car changes where the town shops. On cheap land by a main road, one vast windowless shed of steel and sheet metal sells food, clothes, tools and petrol under one roof, at low prices, with a free car park in front. ' +
    'The idea came from American self-service seminars, but the scale was French: the first, opened by Carrefour at Sainte-Geneviève-des-Bois south of Paris in June 1963, had 2,500 square metres of shop floor and 400 parking spaces, and the word hypermarché was coined a few years later. ' +
    'In the north, Auchan of Roubaix opened its first at Roncq in 1967. Within a generation they emptied the market halls of the town centres.',
  materials: ['steel frame', 'profiled steel cladding', 'plate glass', 'asphalt'],
  lookFor: [
    { label: 'The shed', note: 'A single storey of steel portal frames clad in ribbed metal sheet: no windows, because the goods, not the view, are the point.', at: [-6.0, 4.0, 0.6] },
    { label: 'Canopy', note: 'A long flat canopy shelters the entrance and the trolleys.', at: [3.0, 3.8, 2.6] },
    { label: 'Sign on a mast', note: 'The name on a tall mast is meant to be read from a car on the main road.', at: [10.6, 13.0, 9.4] },
    { label: 'Car park', note: 'Parking for hundreds of cars, free, was the heart of the formula.', at: [-4.0, 0.6, 7.6] },
    { label: 'Loading dock', note: 'At the back, lorries deliver straight from the warehouse to the sales floor.', at: [-6.0, 2.0, -9.8] },
  ],
  modelledOn: 'The first Carrefour hypermarket, Sainte-Geneviève-des-Bois (1963), and the first Auchan hypermarket at Roncq (1967), as a type; no real sign or brand is shown, and the shed is far smaller than any real one',
  influences: ['american-way'],
  build(b) {
    const X = 11.6;
    const Z0 = -9.2;
    const Z1 = 0.6;
    const H = 6.4;
    // the car park in asphalt with white lines, a kerb round the shed
    b.box(25.8, 0.06, 21.8, P.tarmac, { jitter: false });
    b.box(2 * X + 1.0, 0.12, Z1 - Z0 + 3.6, P.concrete, { at: [0, 0, (Z0 + Z1) / 2 + 1.2] });
    for (let i = 0; i < 9; i++) {
      const x = -11.0 + i * 2.6;
      b.box(0.1, 0.01, 4.6, P.white, { at: [x, 0.06, 8.6], jitter: false });
    }
    b.box(23.0, 0.01, 0.1, P.white, { at: [0, 0.06, 6.3], jitter: false });
    for (const x of [-6, 0, 6]) b.box(1.2, 0.01, 0.2, P.white, { at: [x, 0.06, 4.6], rotY: 0, jitter: false });

    // ---- the shed: cladding with vertical ribs, a coloured band round the top, a flat roof
    b.box(2 * X, H, Z1 - Z0, CLAD, { at: [0, 0.12, (Z0 + Z1) / 2] });
    b.collider(2 * X, Z1 - Z0, { at: [0, 0, (Z0 + Z1) / 2] });
    b.box(2 * X + 0.1, 1.2, Z1 - Z0 + 0.1, BAND, { at: [0, H - 1.0, (Z0 + Z1) / 2] });
    b.box(2 * X + 0.12, 0.25, Z1 - Z0 + 0.12, STRIPE, { at: [0, H - 1.25, (Z0 + Z1) / 2] });
    for (let x = -X + 0.6; x < X; x += 1.0) {
      b.box(0.08, H - 1.3, 0.06, tint(CLAD, -0.06), { at: [x, 0.12, Z0 - 0.03], jitter: false });
      if (Math.abs(x) > 4.2) b.box(0.08, H - 1.3, 0.06, tint(CLAD, -0.06), { at: [x, 0.12, Z1 + 0.03], jitter: false });
    }
    for (let z = Z0 + 0.6; z < Z1; z += 1.0) for (const s of [-1, 1]) b.box(0.06, H - 1.3, 0.08, tint(CLAD, -0.06), { at: [s * (X + 0.03), 0.12, z], jitter: false });
    // roof: a parapet, rooflights and plant
    b.box(2 * X - 0.4, 0.1, Z1 - Z0 - 0.4, P.asphalt, { at: [0, H + 0.12, (Z0 + Z1) / 2] });
    for (const x of [-8, -4, 0, 4, 8]) for (const z of [-6.6, -2.2]) b.dome(0.7, P.glass, { at: [x, H + 0.22, z], squash: 0.5, segs: 8, mat: 'glass' });
    b.box(2.6, 1.2, 1.6, P.aluminium, { at: [6.0, H + 0.22, -4.4] });
    b.box(1.4, 0.8, 1.4, P.aluminium, { at: [-9.0, H + 0.22, -1.2] });

    // ---- the entrance: a glazed front in aluminium frames, and the long canopy
    b.box(8.4, 3.0, 0.1, P.glassDark, { at: [0, 0.12, Z1 + 0.02], mat: 'glass' });
    for (let x = -4.2; x <= 4.21; x += 1.4) b.box(0.08, 3.0, 0.14, P.aluminium, { at: [x, 0.12, Z1 + 0.04] });
    b.box(8.4, 0.1, 0.14, P.aluminium, { at: [0, 2.3, Z1 + 0.04] });
    b.box(8.4, 0.3, 0.14, P.aluminium, { at: [0, 3.0, Z1 + 0.04] });
    // the shop's name over the doors: blocks of colour, not a real brand
    b.box(7.0, 1.4, 0.12, P.white, { at: [0, 3.9, Z1 + 0.08] });
    for (let k = 0; k < 7; k++) b.box(0.7, 0.9, 0.06, k % 2 ? BAND : STRIPE, { at: [-3.0 + k * 1.0, 4.15, Z1 + 0.16] });
    b.box(2 * X, 0.3, 2.6, P.cladWhite, { at: [0, 3.2, Z1 + 1.3] });
    b.box(2 * X, 0.28, 0.06, STRIPE, { at: [0, 3.22, Z1 + 2.62] });
    for (let x = -X + 0.5; x < X; x += 3.8) {
      b.cyl(0.08, 3.1, P.steel, { at: [x, 0.12, Z1 + 2.4], segs: 6 });
      b.collider(0.2, 0.2, { at: [x, 0, Z1 + 2.4] });
    }
    // trolleys under the canopy and two in the car park
    for (let i = 0; i < 6; i++) trolley(b, [-9.4 + i * 0.25, 0.12, Z1 + 1.2 + i * 0.0], -Math.PI / 2);
    trolley(b, [3.2, 0.06, 8.2], 0.4);
    trolley(b, [-6.2, 0.06, 5.2], 2.4);

    // ---- the loading dock at the back
    b.box(9.0, 1.2, 1.2, P.concrete, { at: [-5.0, 0, Z0 - 0.6] });
    for (const x of [-7.6, -2.4]) {
      b.box(3.0, 3.4, 0.08, P.aluminium, { at: [x, 1.2, Z0 - 0.02] });
      for (let y = 1.4; y < 4.5; y += 0.3) b.box(3.0, 0.03, 0.04, tint(P.aluminium, -0.1), { at: [x, y, Z0 - 0.07], jitter: false });
    }
    b.box(9.4, 0.15, 1.6, P.cladGrey, { at: [-5.0, 4.8, Z0 - 0.8] });
    b.collider(9.0, 1.2, { at: [-5.0, 0, Z0 - 0.6] });

    // ---- the sign on its mast by the road
    b.group({ at: [10.6, 0.06, 9.4] }, () => {
      b.box(0.5, 0.4, 0.5, P.concrete);
      b.box(0.35, 13.0, 0.35, P.steel, { at: [0, 0.4, 0] });
      b.box(3.4, 2.8, 0.4, P.white, { at: [0, 11.0, 0] });
      for (const s of [-1, 1]) {
        b.box(2.8, 0.9, 0.06, BAND, { at: [0, 12.4, s * 0.22] });
        b.box(2.8, 0.9, 0.06, STRIPE, { at: [0, 11.3, s * 0.22] });
      }
    });
    b.collider(0.6, 0.6, { at: [10.6, 0, 9.4] });

    // ---- cars of the late 1960s, a lamp column
    const colours = [P.cladRed, P.cream, P.doorBlue, P.cladYellow, P.white, P.doorGreen, P.cladGrey];
    for (const [x, z] of [[-9.7, 8.6], [-7.1, 8.8], [-1.9, 8.7], [0.7, 8.5], [5.9, 8.8], [8.0, 8.4]] as [number, number][]) {
      car(b, 'sixties', b.pick(colours), [x, 0.06, z], b.chance(0.5) ? 0 : Math.PI);
    }
    lamp(b, 'modern', [-12.4, 0.06, 4.0], Math.PI / 2);
  },
};
