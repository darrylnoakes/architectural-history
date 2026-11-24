import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, hump, band, side, railing, steps, archY, type ZY, type Opening } from './shared';

export const prestressedBridge: BuildingDef = {
  id: 'prestressed-bridge',
  name: 'Prestressed concrete bridge',
  style: 'Reconstruction engineering',
  date: '1947',
  summary:
    'In June 1940 the bridge that stood here was blown up, with the town’s other crossings, to slow the German advance. After the war, in place of the makeshift crossing, it is replaced by one very flat span of prestressed concrete with nothing standing in the river. ' +
    'Prestressing was Eugène Freyssinet’s invention, patented in 1928: steel wires threaded through the concrete are stretched hard and anchored at the ends, squeezing it so that it never goes into tension and cracks, which lets a beam be far thinner and longer than ordinary reinforced concrete allows. ' +
    'Freyssinet’s first bridge of this kind, over the Marne at Luzancy (1941 to 1946), was assembled from segments cast on the bank and tied together by the wires, and stands on hinges at each end; five more followed down the Marne between 1947 and 1951.',
  materials: ['prestressed concrete', 'high-tensile steel wire', 'asphalt', 'steel railings'],
  modelledOn: 'Freyssinet’s bridge at Luzancy over the Marne (1941 to 1946): one flat hinged span of precast prestressed segments. Here well under half its 55 m span',
  lookFor: [
    { label: 'Single flat span', note: 'One span of about 23 m with no pier in the river, its curved underside rising only about a twentieth of its length.', at: [3.9, -0.1, 4.0] },
    { label: 'Hinge', note: 'Each end of the span rests on a hinge on its abutment, so it can turn slightly as it bends and as the concrete shrinks and creeps.', at: [3.9, -0.95, -11.7] },
    { label: 'Precast segments', note: 'The span was cast in short blocks on the bank and put together over the river, then the wires were stretched to squeeze the joints shut.', at: [3.95, 0.3, -6.6] },
    { label: 'Hollow ribs', note: 'Underneath, the span is made of separate hollow ribs side by side, which saves concrete and weight.', at: [0.9, -0.2, 9.0] },
  ],
  influences: ['reinforced-concrete'],
  build(b) {
    b.noCollide();
    const crown = 0.9;
    const f = hump(crown);
    const W = 7.6;
    b.deck(W - 0.4, 34, crown, { yEnds: 0 });
    const conc = tint(P.concrete, 0.03);
    const concD = P.concreteDark;
    const zh = 11.7;
    const yh = -0.85;
    // the curved underside: a flat arc from hinge to hinge
    const op: Opening = { z0: -zh, z1: zh, spring: yh, rise: f(0) - 0.6 - yh, kind: 'segmental' };
    const under = (z: number) => archY(op, z);
    const slab = (z: number) => f(z) - 0.28;

    // three hollow box ribs, each drawn as its elevation
    const ribW = 1.9;
    const ribs = [-2.4, 0, 2.4];
    const ribPts: ZY[] = [];
    for (const z of steps(24, -zh, zh)) ribPts.push([z, slab(z) + 0.02]);
    for (const z of steps(24, zh, -zh)) ribPts.push([z, under(z)]);
    for (const x of ribs) side(b, ribPts, ribW, conc, x);
    // the deck slab across the ribs, with a thin edge and the approach slabs on the banks
    band(b, 0, W, -END, END, slab, (z) => f(z) - 0.06, tint(conc, 0.04), 24);
    band(b, 0, W - 1.8, -END, END, (z) => f(z) - 0.06, (z) => f(z) + 0.0, P.asphalt, 24);
    b.sym((k) => band(b, k * (W / 2 - 0.45), 0.9, -END, END, (z) => f(z) - 0.06, (z) => f(z) + 0.12, P.concreteWhite, 24));
    // joints between the precast segments, scored on the outer faces
    b.sym((k) => {
      for (const z of steps(10, -zh, zh).slice(1, -1)) {
        b.box(0.03, slab(z) - under(z) + 0.02, 0.06, tint(conc, -0.12), { at: [k * (ribs[2] + ribW / 2 + 0.01), under(z), z], jitter: false });
      }
    });

    // abutments with the hinges: a concrete seat and a steel knuckle under each rib
    b.sym((s) => {
      b.box(W + 0.6, yh - 0.25 - FOOT, 1.8, concD, { at: [0, FOOT, s * (zh + 0.5)] });
      b.box(W + 0.6, -yh + 0.25 - 0.3, 1.0, concD, { at: [0, yh - 0.25, s * (zh + 1.0)] });
      for (const x of ribs) {
        b.box(ribW - 0.3, 0.12, 0.6, P.steel, { at: [x, yh - 0.25, s * zh] });
        b.log(0.12, ribW - 0.4, P.castIron, { at: [x, yh - 0.13, s * zh], segs: 8 });
      }
      // wing walls holding the bank either side
      b.sym((k) => b.box(0.4, 0.3 - FOOT, 4.0, concD, { at: [k * (W / 2 + 0.1), FOOT, s * (BANK + 2.0)] }));
    });

    // plain steel railings and two lamp standards
    b.sym((k) => {
      railing(b, { x: k * (W / 2 - 0.06), za: -END + 0.4, zb: END - 0.4, f: (z) => f(z) + 0.12, color: tint(P.steel, -0.15), posts: 26 });
      const z = k * 7.0;
      const x = k * (W / 2 - 0.25);
      b.cyl(0.08, 5.5, tint(P.steel, -0.1), { at: [x, f(z) + 0.12, z], rTop: 0.05, segs: 6 });
      b.beam([x, f(z) + 5.6, z], [x - k * 1.0, f(z) + 5.75, z], 0.08, 0.06, tint(P.steel, -0.1));
      b.box(0.45, 0.14, 0.25, P.white, { at: [x - k * 1.1, f(z) + 5.6, z] });
    });
  },
};
