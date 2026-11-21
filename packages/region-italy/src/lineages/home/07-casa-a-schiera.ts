import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { coppiRoof, coppiShed, pave, vegBed, well, washing } from './shared';

export const casaASchiera: BuildingDef = {
  id: 'casa-a-schiera',
  name: 'Row house with shop',
  style: 'Medieval (Age of the Communes)',
  date: 'c. 1200',
  summary:
    'As trade revived and the self-governing commune grew, the streets filled with narrow houses built in rows on long, thin plots, ' +
    'each with only a few metres of street front and sharing its side walls with the neighbours. The ground floor is the shop or ' +
    'workshop, open to the street through a wide arch, with a narrow door beside it to the stair; the family lives above. To gain room ' +
    'the upper floors jut out over the street on timber brackets, the sporti that town statutes later restricted. Behind lies a yard ' +
    'with a well, a privy and a vegetable bed.',
  materials: ['squared stone ground floor', 'brick or stone upper walls', 'oak joists and brackets', 'clay pan-and-cover tiles'],
  lookFor: [
    {
      label: 'Shop arch',
      note: 'A wide arch opens the shop to the street; by day a counter is set in it, at night it is closed with boards.',
      at: [-4.2, 3.3, 7.7],
    },
    {
      label: 'Street door',
      note: 'A narrow door beside the shop leads straight to the stair, so the family can come and go when the shop is shut.',
      at: [-0.65, 2.4, 7.7],
    },
    {
      label: 'Sporto on timber brackets',
      note: 'The upper floor projects over the street on oak joists propped by raking struts: more floor space at no cost in ground.',
      at: [-5.0, 3.9, 8.3],
    },
    {
      label: 'Round-arched windows',
      note: 'Small windows under round arches of cut stone, closed with wooden shutters; glass was still too dear for most houses.',
      at: [-2.0, 6.2, 8.55],
    },
    {
      label: 'Well in the yard',
      note: 'Each yard has its well, or shares one with the neighbour across the dividing wall; water from the public fountain had to be carried.',
      at: [-4.6, 1.3, -3.6],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const uw = X; // each house is 6.8 m wide
    const zf = 7.6; // ground-floor front
    const jet = 0.85; // projection of the upper floors
    const zb = -1.0;
    const g = 4.0;
    const f1 = 3.1;
    const f2 = 2.9;
    const H = g + f1 + f2;
    const tile = tint(P.coppi, b.range(-0.05, 0.02));

    const house = (cx: number, ours: boolean) => {
      const stone = tint(b.pick([P.pietraForte, P.travertine, P.tufa]), b.range(-0.03, 0.03));
      const upper = b.chance(0.5) ? tint(b.pick([P.brickOrange, P.cotto]), b.range(-0.04, 0.02)) : tint(stone, 0.03);
      const shut = b.pick([P.oak, P.oakDark, P.oakSilver]);
      const zc = (zf + zb) / 2;
      // ground storey of squared stone
      b.box(uw, g, zf - zb, stone, { at: [cx, 0, zc] });
      for (const y of [0.7, 1.4, 2.1, 2.8, 3.5]) b.box(uw, 0.035, 0.02, tint(stone, -0.14), { at: [cx, y, zf + 0.005] });
      // upper storeys carried forward over the street
      const zu = (zf + jet + zb) / 2;
      b.box(uw, f1 + f2, zf + jet - zb, upper, { at: [cx, g + 0.25, zu] });
      b.box(uw, 0.25, zf + jet - zb, P.oakDark, { at: [cx, g, zu] }); // the floor and the joist ends
      for (const x of spread(11, -uw / 2 + 0.2, uw / 2 - 0.2)) b.box(0.16, 0.18, jet + 0.12, P.oakDark, { at: [cx + x, g - 0.1, zf + (jet + 0.12) / 2] });
      for (const x of [-uw / 2 + 0.5, -uw / 6, uw / 6, uw / 2 - 0.5]) {
        b.beam([cx + x, g - 1.3, zf + 0.04], [cx + x, g - 0.05, zf + jet - 0.08], 0.16, 0.16, P.oakDark);
        b.box(0.24, 0.3, 0.12, P.travertine, { at: [cx + x, g - 1.55, zf + 0.06] }); // corbel stone at the foot
      }
      b.box(uw, 0.16, 0.08, tint(upper, -0.08), { at: [cx, g + f1 + 0.2, zf + jet + 0.02] }); // floor band
      // roof, deep eaves on rafter feet
      coppiRoof(b, uw, zf + jet - zb, 1.75, tile, { at: [cx, H + 0.25, zu], overhang: 0.75, ends: 0, wall: upper, thick: 0.13 });
      for (const x of spread(13, -uw / 2 + 0.2, uw / 2 - 0.2)) {
        b.box(0.11, 0.12, 0.75, P.oakDark, { at: [cx + x, H + 0.05, zf + jet + 0.37] });
        b.box(0.11, 0.12, 0.75, P.oakDark, { at: [cx + x, H + 0.05, zb - 0.37] });
      }

      // the shop arch with its counter and a door to the stair
      const sx = cx - 0.8;
      const dx = cx + 2.75;
      b.panel(3.4, 3.4, tint(stone, 0.06), { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.03 });
      b.panel(3.0, 3.2, P.windowDark, { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.05 });
      b.box(3.0, 0.95, 0.5, P.oak, { at: [sx, 0, zf + 0.25] }); // counter board on trestles
      b.box(3.0, 0.12, 0.4, P.travertine, { at: [sx, 0, zf + 0.2] });
      const wares = ours ? [P.cream, P.doorRed, 0x5a6f8a, P.cream, P.ochreWash] : [P.terracotta, P.bronze, P.terracotta, P.iron];
      wares.forEach((c, i) => b.box(0.4, 0.22, 0.32, c, { at: [sx - 1.15 + i * (2.3 / (wares.length - 1)), 0.95, zf + 0.25] }));
      // the night shutters, lifted up and hooked under the arch as an awning
      b.group({ at: [sx, 3.0, zf + 0.06], rot: [-1.1, 0, 0] }, () => b.box(2.6, 0.06, 0.9, P.oak, { at: [0, 0, 0.45] }));
      b.panel(1.25, 2.5, tint(stone, 0.06), { at: [dx, 0, zf], facing: '+z', shape: 'round', depth: 0.03 });
      b.panel(0.95, 2.3, ours ? P.doorGreen : P.oakDark, { at: [dx, 0, zf], facing: '+z', shape: 'round', depth: 0.05 });
      b.box(1.3, 0.15, 0.35, P.travertine, { at: [dx, 0, zf + 0.17] });

      // upper windows: round-arched, with cut-stone voussoirs and board shutters
      const zw = zf + jet;
      for (const [y, h] of [[g + 0.25 + 0.9, 1.55], [g + 0.25 + f1 + 0.75, 1.4]] as [number, number][]) {
        for (const x of [-1.4, 1.4]) {
          b.panel(1.25, h + 0.2, tint(stone, 0.08), { at: [cx + x, y - 0.1, zw], facing: '+z', shape: 'round', depth: 0.03 });
          b.panel(0.85, h, P.timberBlack, { at: [cx + x, y, zw], facing: '+z', shape: 'round', depth: 0.05 });
          b.panel(0.42, h - 0.45, shut, { at: [cx + x - 0.68, y, zw], facing: '+z', depth: 0.07 });
          b.box(1.05, 0.1, 0.2, P.travertine, { at: [cx + x, y - 0.12, zw + 0.08] });
        }
        // iron rings and a pole for hanging out cloth
        b.sym((s) => b.cyl(0.07, 0.03, P.iron, { at: [cx + s * 2.6, y + 0.6, zw + 0.08], rot: [Math.PI / 2, 0, 0], segs: 6 }));
      }
      if (ours) {
        b.beam([cx - 2.6, g + f1 + 1.6, zw + 0.05], [cx - 2.6, g + f1 + 1.5, zw + 1.1], 0.06, 0.06, P.oak);
        b.box(0.03, 0.8, 0.5, P.doorRed, { at: [cx - 2.6, g + f1 + 0.75, zw + 0.75] });
      }

      // back: a timber gallery on the first floor, windows, a door to the yard
      b.panel(1.0, 2.2, P.oakDark, { at: [cx - 1.6, 0, zb], facing: '-z' });
      b.panel(0.6, 0.7, P.timberBlack, { at: [cx + 1.6, 1.5, zb], facing: '-z' });
      for (const x of [-1.5, 1.5]) b.panel(0.75, 1.2, P.timberBlack, { at: [cx + x, g + f1 + 0.95, zb], facing: '-z', shape: 'round' });
      b.panel(0.9, 2.1, P.oak, { at: [cx - 1.2, g + 0.3, zb], facing: '-z' });
      b.window(0.8, 1.2, { at: [cx + 1.5, g + 1.1, zb], facing: '-z', frame: shut, glass: P.timberBlack });
      b.box(uw - 0.6, 0.15, 1.1, P.oak, { at: [cx, g + 0.2, zb - 0.55] });
      for (const x of spread(14, -uw / 2 + 0.4, uw / 2 - 0.4)) b.box(0.05, 0.9, 0.05, P.oak, { at: [cx + x, g + 0.35, zb - 1.05] });
      b.box(uw - 0.6, 0.08, 0.08, P.oak, { at: [cx, g + 1.25, zb - 1.05] });
      b.sym((s) => b.beam([cx + s * (uw / 2 - 0.4), g - 1.1, zb - 0.02], [cx + s * (uw / 2 - 0.4), g + 0.18, zb - 1.0], 0.13, 0.13, P.oakDark));
      coppiShed(b, uw - 0.6, 1.2, 0.45, tile, { at: [cx, g + f1 - 0.2, zb - 0.6], high: '+z' });
      for (const x of [-uw / 2 + 0.4, uw / 2 - 0.4]) b.box(0.12, f1 - 0.6, 0.12, P.oak, { at: [cx + x, g + 0.35, zb - 1.05] });

      // the yard
      const yz = (zb - 8.8) / 2;
      pave(b, uw - 0.4, 1.6, P.cobble, [cx, 0, zb - 0.8]);
      b.box(1.3, 2.1, 1.2, P.rubble, { at: [cx + 2.4, 0, -8.0] }); // privy
      coppiShed(b, 1.5, 1.4, 0.35, tile, { at: [cx + 2.4, 2.1, -8.0], high: '+z' });
      b.panel(0.65, 1.7, P.oak, { at: [cx + 2.4, 0, -7.4], facing: '+z' });
      vegBed(b, cx + (ours ? 1.2 : -1.0), yz - 0.6, 3.0, 3.0, { rows: 4 });
      if (ours) {
        washing(b, [cx - 2.8, 2.0, -6.2], [cx + 0.6, 2.0, -6.2], [P.white, P.cream, 0x8fa3b8, P.white]);
        b.box(0.08, 2.0, 0.08, P.oak, { at: [cx - 2.8, 0, -6.2] });
        b.box(0.08, 2.0, 0.08, P.oak, { at: [cx + 0.6, 0, -6.2] });
      } else {
        b.tree(b.range(3.2, 4.0), { at: [cx - 1.6, 0, -6.6], kind: 'round', color: P.leafDark });
      }
    };
    house(-X / 2, true);
    house(X / 2, false);
    // party wall line between the two houses, and the yard walls
    b.box(0.14, g, zf - zb + 0.04, tint(P.rubble, -0.05), { at: [0, 0, (zf + zb) / 2] });
    b.box(0.14, f1 + f2 + 0.25, zf + jet - zb + 0.04, tint(P.rubble, -0.05), { at: [0, g, (zf + jet + zb) / 2] });
    well(b, [-4.6, 0, -3.6], tint(P.travertine, -0.05), { frame: 'iron' });
    b.box(0.3, 2.2, -1.0 + 8.8, P.rubble, { at: [0, 0, (-1.0 - 8.8) / 2] });
    b.sym((s) => b.box(0.3, 2.2, 7.8, P.rubble, { at: [s * (X - 0.15), 0, (-1.0 - 8.8) / 2] }));
    b.box(W, 2.2, 0.3, P.rubble, { at: [0, 0, -8.65] });
  },
};
