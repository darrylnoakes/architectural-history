import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { TOWER, clockTower } from './shared';

export const civicHub: BuildingDef = {
  id: 'civic-hub',
  name: 'Civic hub and library',
  style: 'Contemporary sustainable',
  date: '2008',
  summary:
    'The 1960s civic centre proved costly to heat and was disliked, and it is replaced by a "civic hub" that puts the library, council services and the council chamber under one roof. ' +
    'Instead of a podium the building meets the street at ground level behind a public square, and a full-height glazed atrium serves as an indoor street joining the new building to the Victorian clock tower, kept once again. ' +
    'Timber fins shade the glass from the sun, the roofs are planted with sedum, and solar panels and natural ventilation answer new targets for energy use.',
  materials: ['glass curtain walling', 'larch fins and cladding', 'sedum green roof', 'steel and concrete frame'],
  lookFor: [
    { label: 'Glazed atrium', note: 'A tall glass hall, an indoor public street, linking the new building to the old clock tower.', at: [-4.8, 12, 13] },
    { label: 'Timber fins', note: 'Vertical larch blades in front of the glass cut glare and solar heat while keeping views out.', at: [8, 7.4, 9.9] },
    { label: 'Green roof', note: 'A living roof of sedum plants that soaks up rainwater, insulates and gives habitat to insects.', at: [9, 16.4, -1] },
    { label: 'Retained clock tower', note: 'The 1874 tower survives a second rebuilding and is now the landmark of the new hub.', at: [TOWER.x - TOWER.w / 2 - 0.3, 22, TOWER.z] },
    { label: 'Cantilevered upper floors', note: 'The upper floors oversail the glazed ground floor, sheltering the entrance with no columns in the way.', at: [8, 4.4, 11.5] },
  ],
  influences: ['passivhaus', 'high-tech-export'],
  build(b) {
    const larch = tint(P.larch, b.range(-0.03, 0.03));
    const glass = mix(P.glass, P.glassDark, 0.35);
    const frame = P.cladGrey;
    const sedum = mix(P.turf, P.leafAutumn, 0.18);

    clockTower(b, { brick: tint(P.brickRed, -0.02), stone: P.sandstone });

    // ---------------------------------------------------------- public square
    b.box(43, 0.06, 12, mix(P.paving, P.concreteWhite, 0.3), { at: [0, 0, 15.6], jitter: false });
    for (const x of [-2, 6, 14]) {
      b.box(2.4, 0.5, 2.4, P.concrete, { at: [x, 0, 18.4] });
      b.tree(6.5, { at: [x, 0.5, 18.4], kind: 'round', color: P.leaf });
    }
    for (const x of [2, 10, 18]) b.box(3.2, 0.45, 0.7, larch, { at: [x, 0, 18.4] }); // benches

    // ---------------------------------------------------------- main block: library and services
    const X0 = -2;
    const X1 = 20;
    const W = X1 - X0;
    const XC = (X0 + X1) / 2;
    const Z0 = -8;
    const Z1 = 9.6;
    const D = Z1 - Z0;
    const ZC = (Z0 + Z1) / 2;
    const G = 4.2; // ground floor
    const FL = 3.7;
    const TOP = G + FL * 3; // 15.3
    // glazed ground floor, set back under the cantilever
    b.box(W - 2, G, D - 2.4, glass, { at: [XC - 0.4, 0, ZC - 1.0], mat: 'glass' });
    for (const x of spread(12, X0 + 0.6, X1 - 1.8)) b.box(0.12, G, 0.12, frame, { at: [x, 0, Z1 - 2.2] });
    b.box(4, 3.2, 0.3, mix(glass, P.white, 0.2), { at: [XC - 3, 0, Z1 - 2.0], mat: 'glass' }); // entrance doors
    b.box(5, 0.3, 2.4, frame, { at: [XC - 3, 3.4, Z1 - 1.0] });
    // the upper floors: one block with slab edges, glazing and timber fins
    b.box(W, 0.6, D, P.cladWhite, { at: [XC, G - 0.3, ZC] });
    b.box(W - 0.3, FL * 3, D - 0.3, glass, { at: [XC, G + 0.3, ZC], mat: 'glass' });
    for (let f = 1; f <= 3; f++) b.box(W + 0.05, 0.35, D + 0.05, P.cladWhite, { at: [XC, G + FL * f - 0.05, ZC] });
    // parapet upstand round the roof edge
    b.sym((s) => {
      b.box(W + 0.3, 0.7, 0.3, P.cladWhite, { at: [XC, TOP, ZC + s * (D / 2)] });
      b.box(0.3, 0.7, D + 0.3, P.cladWhite, { at: [XC + s * (W / 2), TOP, ZC] });
    });
    b.box(W, 0.1, D, P.cladWhite, { at: [XC, TOP - 0.05, ZC] });
    // fins on the front (south-facing) and the east side
    for (const x of spread(34, X0 + 0.3, X1 - 0.3)) b.box(0.12, FL * 3 - 0.2, 0.55, larch, { at: [x, G + 0.35, Z1 + 0.3] });
    for (const z of spread(26, Z0 + 0.3, Z1 - 0.3)) b.box(0.55, FL * 3 - 0.2, 0.12, larch, { at: [X1 + 0.3, G + 0.35, z] });
    // back and the west: larch rainscreen with punched windows
    b.box(W - 0.2, FL * 3, 0.2, larch, { at: [XC, G + 0.3, Z0 - 0.05] });
    for (const x of spread(8, X0 + 1.5, X1 - 1.5))
      for (let f = 0; f < 3; f++) b.window(1.6, 2.2, { at: [x, G + 0.9 + f * FL, Z0 - 0.15], facing: '-z', frame: frame, glass: P.glassDark });
    b.box(W - 0.2, G, 0.2, larch, { at: [XC, 0, Z0 - 0.05] });
    // green roof with rooflights, a bank of solar panels and a plant enclosure
    b.box(W - 0.4, 0.3, D - 0.4, sedum, { at: [XC, TOP + 0.05, ZC] });
    for (const x of [2, 8, 14]) b.box(2.4, 0.9, 6, mix(P.glass, P.white, 0.4), { at: [x, TOP + 0.3, ZC + 2.6], mat: 'glass' });
    for (const x of spread(5, 3, 15)) b.box(2.0, 0.08, 1.6, P.solar, { at: [x, TOP + 0.9, Z0 + 2.4], rot: [0.5, 0, 0], mat: 'glass' });
    b.box(4, 2.2, 3.4, frame, { at: [X1 - 3, TOP + 0.3, Z0 + 2.4] });

    // ---------------------------------------------------------- the atrium joining new and old
    const AX0 = TOWER.x + TOWER.w / 2;
    const AX1 = X0;
    const AW = AX1 - AX0;
    const AXC = (AX0 + AX1) / 2;
    const AZ0 = -3;
    const AZ1 = 13.6;
    const AD = AZ1 - AZ0;
    const AZC = (AZ0 + AZ1) / 2;
    const AH = TOP + 1.2;
    b.box(AW, AH, AD, glass, { at: [AXC, 0, AZC], mat: 'glass' });
    for (const z of spread(7, AZ0, AZ1)) b.box(AW + 0.06, 0.14, 0.14, frame, { at: [AXC, AH - 0.14, z] });
    for (const z of spread(7, AZ0 + 0.1, AZ1 - 0.1)) b.box(0.14, AH, 0.14, frame, { at: [AX1 - 0.05, 0, z] });
    for (const x of spread(3, AX0 + 0.2, AX1 - 0.2)) b.box(0.14, AH, 0.14, frame, { at: [x, 0, AZ1] });
    for (const y of [G, G + FL * 1.5, AH - 0.2]) b.box(AW + 0.06, 0.14, 0.14, frame, { at: [AXC, y, AZ1] });
    b.sym((s) => b.box(AW + 0.4, 0.3, 0.3, frame, { at: [AXC, AH, AZC + s * (AD / 2)] }));
    b.box(AW + 0.3, 0.3, AD, mix(P.glass, P.white, 0.25), { at: [AXC, AH, AZC], mat: 'glass' });
    b.box(3.4, 3.0, 0.3, mix(glass, P.white, 0.2), { at: [AXC, 0, AZ1 + 0.05], mat: 'glass' });

    // ---------------------------------------------------------- council chamber at the back left
    const CX = -10;
    const CZ = -13;
    b.box(14, 7.6, 12, larch, { at: [CX, 0, CZ] });
    for (const x of spread(22, CX - 6.8, CX + 6.8)) {
      b.box(0.1, 7.6, 0.14, tint(larch, -0.08), { at: [x, 0, CZ + 6.04] });
      b.box(0.1, 7.6, 0.14, tint(larch, -0.08), { at: [x, 0, CZ - 6.04] });
    }
    b.shed(14.4, 12.4, 2.4, sedum, { at: [CX, 7.6, CZ], high: '-z' });
    b.box(10, 2.4, 0.2, glass, { at: [CX, 2, CZ + 6.1], mat: 'glass' });
    b.box(0.2, 3.6, 8, glass, { at: [CX - 7.05, 2, CZ], mat: 'glass' });
    // a glazed link to the main block
    b.box(4.4, 4, 4, glass, { at: [-0.5, 0, -10.4], mat: 'glass' });
    b.box(4.6, 0.3, 4.2, frame, { at: [-0.5, 4, -10.4] });
    // cycle stands by the entrance
    for (const x of spread(5, -8.5, -4.5)) b.box(0.06, 0.8, 0.7, P.steel, { at: [x, 0, 16.4] });

    // colliders: the main block's glazed line, the atrium, the chamber, the tower
    b.collider(W - 2, D - 2.4, { at: [XC - 0.4, 0, ZC - 1.0] });
    b.collider(AW, AD, { at: [AXC, 0, AZC] });
    b.collider(14, 12, { at: [CX, 0, CZ] });
    b.collider(4.4, 4, { at: [-0.5, 0, -10.4] });
    b.collider(TOWER.w + 0.6, TOWER.w + 0.6, { at: [TOWER.x, 0, TOWER.z] });
    for (const x of [-2, 6, 14]) b.collider(2.4, 2.4, { at: [x, 0, 18.4] });
  },
};
