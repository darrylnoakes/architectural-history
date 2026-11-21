import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, hump, band, bar, steps } from './shared';
import { concreteBridge } from './08-concrete-arch-bridge';

export const millenniumFootbridge: BuildingDef = {
  id: 'millennium-footbridge',
  name: 'Old road bridge and new footbridge',
  style: 'Contemporary',
  date: '2001',
  summary:
    'The 1936 bridge was good enough to keep: repaired and strengthened, it still carries the High Street. But its narrow pavements sat beside heavy traffic, so a separate bridge for people on foot and on bicycles was built alongside, with help from the Millennium Commission’s lottery money that paid for new bridges across the country around 2000. ' +
    'It is cable-stayed: straight steel cables run from a raked mast on one bank down to the edges of a slim steel deck, so the whole river is crossed without a pier. ' +
    'Where earlier bridges hid their structure inside masonry, this one makes the structure the ornament.',
  materials: ['welded steel', 'steel cables', 'glass', 'reinforced concrete (1936 bridge)'],
  lookFor: [
    { label: 'Raked mast', note: 'An A-shaped steel mast leaning back from the river, balancing the pull of the cables that hold up the span.', at: [6.0, 11.0, 12.0] },
    { label: 'Cable stays', note: 'Each straight cable carries a slice of the deck straight back to the mast, so no piers are needed in the river.', at: [6.0, 5.5, 3.5] },
    { label: 'Backstay', note: 'Cables from the mast head down to a concrete anchor block in the bank, tying the mast back.', at: [6.0, 4.0, 14.0] },
    { label: 'Steel box deck', note: 'A shallow welded steel box girder, light and stiff, hung from the cables along both edges.', at: [7.0, 0.4, -4.0] },
    { label: 'The 1936 bridge', note: 'Kept and repaired rather than replaced, as more and more old bridges now are.', at: [-4.6, 2.8, 0] },
  ],
  influences: ['high-tech-export'],
  build(b) {
    b.noCollide();
    concreteBridge(b, { aged: true });

    // ---- the footbridge, downstream of the road bridge
    const xc = 6.0;
    const w = 1.8;
    const crown = 1.0;
    const f = hump(crown);
    const z0 = -12.6;
    const z1 = 12.0;
    b.deck(w - 0.2, 26, crown, { at: [xc, 0, 0], yEnds: 0 });
    const white = P.cladWhite;
    const steel = P.steel;

    // slim steel box deck, a non-slip surface and glass balustrades with a steel handrail
    band(b, xc, w, z0, z1, (z) => f(z) - 0.5, (z) => f(z) - 0.04, white, 26);
    band(b, xc, w - 0.1, z0, z1, (z) => f(z) - 0.05, (z) => f(z) + 0.01, tint(P.asphalt, 0.1), 26);
    b.sym((s) => {
      const x = xc + s * (w / 2 - 0.05);
      band(b, x, 0.04, z0 + 0.3, z1 - 0.3, (z) => f(z), (z) => f(z) + 1.05, P.glass, 26, 'glass');
      band(b, x, 0.08, z0 + 0.3, z1 - 0.3, (z) => f(z) + 1.05, (z) => f(z) + 1.12, steel, 26);
    });
    // landings: concrete bearing seats on each bank
    for (const z of [-BANK - 1.0, BANK + 1.0]) b.box(w + 0.3, f(z) - 0.5 + 0.4, 1.0, P.concrete, { at: [xc, -0.4, z] });

    // A-frame mast on the north bank, raked back away from the river
    const apex: [number, number, number] = [xc, 13.0, 12.8];
    const feet: [number, number, number][] = [
      [xc - 0.95, 0, 10.6],
      [xc + 0.85, 0, 10.6],
    ];
    b.box(w + 0.6, 0.5, 1.2, P.concrete, { at: [xc, -0.3, 10.6] });
    for (const p of feet) bar(b, p, apex, 0.26, white);
    bar(b, [xc - 0.6, 3.0, 11.1], [xc + 0.55, 3.0, 11.1], 0.16, white); // portal tie above head height
    b.box(0.5, 0.9, 0.5, white, { at: [apex[0], apex[1] - 0.4, apex[2]] }); // mast head

    // forward stays to both deck edges, and backstays to an anchor block
    for (const z of steps(5, -8.0, 6.0)) {
      for (const s of [-1, 1]) bar(b, [apex[0], apex[1] - 0.2, apex[2]], [xc + s * (w / 2), f(z) - 0.1, z], 0.04, steel);
    }
    const anchor: [number, number, number] = [xc, 0.4, 14.6];
    b.box(1.6, 0.8, 0.8, P.concrete, { at: [xc, -0.4, 14.6] });
    for (const dx of [-0.4, 0.4]) bar(b, [apex[0], apex[1] - 0.3, apex[2]], [anchor[0] + dx, anchor[1], anchor[2]], 0.06, steel);
  },
};
