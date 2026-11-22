import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, band, bar, railing, steps } from './shared';

export const footbridge: BuildingDef = {
  id: 'footbridge',
  name: 'Lens-shaped footbridge',
  style: 'Contemporary',
  date: '2006',
  summary:
    'The car has its ring road, and the old crossing is given back to people on foot and bicycles. The new footbridge leaps the whole river without a pier, made of two curves that cross each other: an arch rising from the water’s edge and a band hanging between the upper banks like a rope. ' +
    'Each pulls against the other, the arch pushing outwards and the band pulling inwards, so between them they need only modest abutments, and where they part in the middle they enclose a lens-shaped space joined by slender struts. ' +
    'Both curves are walkways, so the bridge offers two ways across and a sheltered place in the middle. It follows the Passerelle Simone-de-Beauvoir in Paris (Dietmar Feichtinger, 2006), whose lens spans more than a hundred metres of the Seine.',
  materials: ['painted steel', 'timber decking', 'concrete abutments', 'stainless steel railings'],
  modelledOn: 'The Passerelle Simone-de-Beauvoir, Paris (Dietmar Feichtinger, opened 2006): an arch and a hanging band crossing to form a lens. Here a fraction of its size',
  lookFor: [
    { label: 'Arch', note: 'The upper walkway is an arch: it springs from landings at the water’s edge and pushes outwards on them as it carries its load.', at: [2.0, 2.4, 0] },
    { label: 'Hanging band', note: 'The lower walkway hangs between the banks like a rope (a catenary) and pulls inwards on its anchorages, balancing the arch.', at: [2.1, -0.4, -4.0] },
    { label: 'Lens', note: 'Where the two curves part they enclose a lens-shaped space, stiffened by struts between them.', at: [2.1, 0.8, 5.0] },
    { label: 'No pier in the river', note: 'The whole river is crossed in one span, leaving the water clear for boats and floods.', at: [0, -1.1, 0] },
    { label: 'Timber decking', note: 'Both walkways are surfaced in hardwood boards, warm and quiet underfoot.', at: [0, -0.2, -8.5] },
  ],
  influences: ['high-tech'],
  build(b) {
    b.noCollide();
    const crown = -0.35;
    const bandY = (z: number) => crown * (1 - (z / END) * (z / END));
    b.deck(3.4, 34, crown, { yEnds: 0 });
    const za = 11.6;
    const yA = -0.9;
    const archY = (z: number) => yA + 2.9 * (1 - (z / za) * (z / za));
    const steel = mix(P.steel, P.white, 0.35);
    const steelD = tint(steel, -0.12);
    const wood = mix(P.larch, P.oakSilver, 0.3);
    const ww = 3.6;
    // the hanging band: a thin deck from bank to bank, with a ramp onto it at each bank edge
    const bandTop = (z: number) => {
      const a = Math.abs(z);
      if (a >= BANK + 0.3) return 0.02;
      if (a <= 10.5) return bandY(z);
      const t = (a - 10.5) / (BANK + 0.3 - 10.5);
      return bandY(z) * (1 - t) + 0.02 * t;
    };
    band(b, 0, ww, -END, END, (z) => bandTop(z) - 0.08, (z) => bandTop(z), wood, 24);
    b.sym((k) => band(b, k * (ww / 2 + 0.08), 0.16, -END, END, (z) => bandTop(z) - 0.32, (z) => bandTop(z) + 0.05, steel, 24));
    band(b, 0, ww - 0.4, -BANK, BANK, (z) => bandY(z) - 0.24, (z) => bandY(z) - 0.08, steelD, 16);

    // the arch: a steel box under a timber walkway, springing from landings at the water's edge
    band(b, 0, ww, -za, za, (z) => archY(z) - 0.08, archY, wood, 20);
    band(b, 0, ww - 0.6, -za, za, (z) => archY(z) - 0.45, (z) => archY(z) - 0.08, steelD, 20);
    b.sym((k) => band(b, k * (ww / 2 + 0.08), 0.16, -za, za, (z) => archY(z) - 0.55, (z) => archY(z) + 0.05, steel, 20));

    // struts in the lens, where the arch rides above the band
    b.sym((k) => {
      for (const z of steps(12, -9.0, 9.0)) {
        bar(b, [k * (ww / 2 + 0.08), bandY(z) + 0.05, z], [k * (ww / 2 + 0.08), archY(z) - 0.55, z], 0.12, steel);
      }
    });

    // railings on both walkways
    b.sym((k) => {
      railing(b, { x: k * (ww / 2 + 0.1), za: -za + 0.3, zb: za - 0.3, f: archY, color: steel, posts: 14 });
      b.sym((s) => railing(b, { x: k * (ww / 2 + 0.1), za: s > 0 ? 10.4 : -END + 0.4, zb: s > 0 ? END - 0.4 : -10.4, f: bandTop, color: steel, posts: 5 }));
      // the band's railing runs on beneath the lens, where it is sheltered by the arch
      railing(b, { x: k * (ww / 2 + 0.1), za: -10.0, zb: 10.0, f: bandY, color: steel, posts: 10, h: 0.9 });
    });

    // landings and abutments at the water's edge, with steps up to the bank beside each
    b.sym((s) => {
      b.box(ww + 2.4, yA - FOOT, 1.4, P.concrete, { at: [0, FOOT, s * (za + 0.4)] });
      b.box(ww + 2.6, 0.1, 1.5, P.concreteWhite, { at: [0, yA - 0.1, s * (za + 0.4)] });
      b.stairs(1.6, -yA, 0.9, 5, P.concreteWhite, { at: [ww / 2 + 1.6, yA, s * (za + 0.3)], rotY: -Math.PI / 2 });
      // the band's anchorage blocks in the upper bank
      b.sym((k) => b.box(0.8, 0.25, 1.2, P.concrete, { at: [k * (ww / 2 + 0.5), 0, s * (END - 1.2)] }));
    });
    b.tree(7.0, { kind: 'round', at: [-5.6, 0, 16.2] });
    b.tree(6.0, { kind: 'round', at: [5.8, 0, -16.4] });
  },
};
