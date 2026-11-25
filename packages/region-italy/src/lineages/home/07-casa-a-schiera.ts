import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { coppiRoof, coppiShed, vegBed, washing } from './shared';
import { OURS, ROW, THEIRS, rowGround, rowOpenings, rowYards } from './shared-row';

export const casaASchiera: BuildingDef = {
  id: 'casa-a-schiera',
  name: 'Row house with shop',
  style: 'Medieval (Age of the Communes)',
  date: 'c. 1200',
  summary:
    'As trade revived and the self-governing commune grew, the streets filled with narrow houses built in rows on long, thin plots, ' +
    'each with only a few metres of street front and sharing its side walls with the neighbours. The ground floor is the shop or ' +
    'workshop, open to the street through a wide arch, with a narrow door beside it to the stair; the family lives above. To gain room ' +
    'the upper floors jut out over the street on timber brackets, the sporti that town governments later tried to clear from the main streets. Behind lies a yard ' +
    'with a well, a privy and a vegetable bed.',
  materials: ['squared stone ground floor', 'brick or stone upper walls', 'oak joists and brackets', 'clay pan-and-cover tiles'],
  revisions: [{ year: 1880, note: 'The counters and night shutters have given way to glazed shop fronts in timber frames, set into the old arches.' }],
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
    const { uw, zf, zb, g } = ROW; // each house is 6.8 m wide
    const jet = 0.85; // projection of the upper floors
    const f1 = 3.1;
    const f2 = 2.9;
    const H = g + f1 + f2;
    const tile = tint(P.coppi, b.range(-0.05, 0.02));

    const house = (cx: number, ours: boolean) => {
      const stone = tint(b.pick([P.pietraForte, tint(P.travertine, -0.07), P.tufa]), b.range(-0.03, 0.03));
      const brickUp = b.chance(0.5);
      const upper = brickUp ? tint(b.pick([P.brickOrange, P.cotto]), b.range(-0.04, 0.02)) : tint(stone, 0.03);
      const shut = b.pick([P.oak, P.oakDark, P.oakSilver]);
      const zc = (zf + zb) / 2;
      // ground storey of squared stone
      rowGround(b, cx, ours, stone);
      for (const y of [0.7, 1.4, 2.1, 2.8, 3.5]) b.box(uw, 0.035, 0.02, tint(stone, -0.14), { at: [cx, y, zf + 0.005] });
      // upper storeys carried forward over the street
      const zu = (zf + jet + zb) / 2;
      b.box(uw, f1 + f2, zf + jet - zb, upper, { at: [cx, g + 0.25, zu] });
      b.box(uw, 0.25, zf + jet - zb, P.oakDark, { at: [cx, g, zu] }); // the floor and the joist ends
      if (!brickUp) for (let y = g + 0.75; y < H; y += 0.5) b.box(uw, 0.03, 0.02, tint(upper, -0.12), { at: [cx, y, zf + jet + 0.005] });
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
      rowOpenings(b, cx, tint(stone, 0.06), ours ? P.doorGreen : P.oakDark);
      // (its counter and night shutters are built last, after the yards: they were replaced in the nineteenth century)

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

      // the yard (its walls, cobbles, privy and the well are built with the next stages' in rowYards)
      const yz = (zb - 8.8) / 2;
      vegBed(b, cx + (ours ? 1.2 : -1.0), yz - 0.6, 3.0, 3.0, { rows: 4 });
      if (ours) {
        washing(b, [cx - 2.8, 2.0, -6.2], [cx + 0.6, 2.0, -6.2], [P.white, P.cream, 0x8fa3b8, P.white]);
        b.box(0.08, 2.0, 0.08, P.oak, { at: [cx - 2.8, 0, -6.2] });
        b.box(0.08, 2.0, 0.08, P.oak, { at: [cx + 0.6, 0, -6.2] });
      } else {
        b.tree(b.range(3.2, 4.0), { at: [cx - 1.6, 0, -6.6], kind: 'round', color: P.leafDark });
      }
    };
    house(OURS, true);
    house(THEIRS, false);
    // party wall line between the two houses, and the yards: the old garden walls of the plot, a
    // dividing wall, a privy in each, and the well
    b.box(0.14, g, zf - zb + 0.04, tint(P.rubble, -0.05), { at: [0, 0, (zf + zb) / 2] });
    b.box(0.14, f1 + f2 + 0.25, zf + jet - zb + 0.04, tint(P.rubble, -0.05), { at: [0, g, (zf + jet + zb) / 2] });
    rowYards(b, P.rubble, tint(P.travertine, -0.05), tile);

    // the shop fittings: a counter on trestles and the night shutters hooked up as an awning; from the
    // later nineteenth century, a glazed shop front in a timber frame set into the old arch
    const glazed = b.since(1880);
    for (const [cx, ours] of [[OURS, true], [THEIRS, false]] as [number, boolean][]) {
      const sx = cx - 0.8;
      if (!glazed) {
        b.box(3.0, 0.95, 0.5, P.oak, { at: [sx, 0, zf + 0.25], jitter: false }); // counter board on trestles
        b.box(3.0, 0.12, 0.4, P.travertine, { at: [sx, 0, zf + 0.2], jitter: false });
        const wares = ours ? [P.cream, P.doorRed, 0x5a6f8a, P.cream, P.ochreWash] : [P.terracotta, P.bronze, P.terracotta, P.iron];
        wares.forEach((c, i) => b.box(0.4, 0.22, 0.32, c, { at: [sx - 1.15 + i * (2.3 / (wares.length - 1)), 0.95, zf + 0.25], jitter: false }));
        b.group({ at: [sx, 3.15, zf + 0.06], rot: [-1.3, 0, 0] }, () => b.box(2.6, 0.06, 0.9, P.oak, { at: [0, 0, 0.45], jitter: false }));
      } else {
        b.window(2.9, 1.35, { at: [sx, 0.35, zf + 0.04], facing: '+z', frame: P.oakDark, glass: 0x3e4f60, bars: [3, 1] });
        b.box(3.0, 0.35, 0.1, P.oakDark, { at: [sx, 0, zf + 0.05], jitter: false });
        b.box(2.4, 0.45, 0.08, ours ? P.doorGreen : 0x6b2a22, { at: [sx, 1.75, zf + 0.06], jitter: false }); // the sign board
      }
    }
  },
};
