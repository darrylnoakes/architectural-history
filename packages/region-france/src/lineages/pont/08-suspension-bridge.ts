import { P, tint, mix, type BuildingDef, type Vec3 } from '@ah/kit';
import { BANK, END, FOOT, hump, band, bar, tube, steps } from './shared';

export const suspensionBridge: BuildingDef = {
  id: 'suspension-bridge',
  name: 'Wire suspension bridge',
  style: 'Restoration and July Monarchy',
  date: 'c. 1830',
  summary:
    'The town wants a second crossing where no bridge has stood, but cannot pay for one of stone. Instead a private company is granted the right to build a suspension bridge and to take a toll from everyone who crosses until its money is repaid. ' +
    'Its timber road hangs on iron rods from cables, each made of hundreds of thin iron wires bound together, slung over two masonry pylons and anchored in the ground behind them. Marc Seguin of Annonay and his brothers showed that wire was lighter, cheaper and stronger than the iron chains the British used, and opened their bridge over the Rhône at Tournon in 1825. ' +
    'Cheap and quick to put up, bridges like this were built in their hundreds across France between about 1825 and 1850, many of them at places that had only ever had a ferry, until in 1850 the bridge at Angers collapsed under a battalion marching across it in a storm, killing more than two hundred soldiers, and for a generation hardly any more were built.',
  materials: ['iron wire cables', 'wrought-iron rods', 'oak deck', 'limestone pylons'],
  modelledOn: 'The bridges of Marc Seguin and his brothers, first at Tournon-Tain over the Rhône (1825): wire cables, masonry pylons, a light timber deck. Generic in its details',
  lookFor: [
    { label: 'Wire cable', note: 'Each cable is a bundle of hundreds of iron wires a few millimetres thick, bound together: the Seguin brothers’ idea.', at: [3.2, 2.6, -6.0] },
    { label: 'Masonry pylon', note: 'A stone portal on each bank lifts the cables over a saddle; the road passes through its arch.', at: [3.7, 3.4, -12.6] },
    { label: 'Suspension rods', note: 'Iron rods hang from the cables and carry the cross-beams of the timber road.', at: [3.1, 1.0, 3.0] },
    { label: 'Anchorage', note: 'Behind each pylon the cables run down into a block of masonry buried in the bank, which holds the whole pull of the bridge.', at: [3.1, 0.6, -19.0] },
    { label: 'Toll house', note: 'The company that built the bridge collected a toll (péage) from people, horses and carts until its costs were paid.', at: [6.2, 2.4, 16.6] },
  ],
  build(b) {
    b.noCollide();
    const crown = 0.4;
    const f = hump(crown);
    const W = 5.2;
    b.deck(W - 0.6, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.enduitGris, 0.3);
    const dress = tint(stone, 0.05);
    const iron = P.iron;
    const oak = P.oak;
    const zP = 12.6;
    const cx = 3.1;
    const saddle = 4.95;
    const low = f(0) + 1.4;
    const cable = (z: number) => low + (saddle - low) * (z / zP) * (z / zP);

    // abutments at the water's edge and the stone portals standing on them
    b.sym((s) => {
      b.box(W + 2.8, 0.25 - FOOT, 1.8, tint(stone, -0.05), { at: [0, FOOT, s * (BANK + 0.6)] });
      const base = f(zP) - 0.05;
      b.archWall(2 * cx + 1.1, saddle - 0.15 - base, 1.2, stone, { at: [0, base, s * zP], facing: '+z', openings: 1, openW: 2 * cx - 1.1, openH: 3.9, shape: 'segmental' });
      b.box(2 * cx + 1.4, 0.2, 1.5, dress, { at: [0, saddle - 0.15, s * zP] });
      b.box(2 * cx + 1.25, 0.18, 1.35, dress, { at: [0, base, s * zP] });
      // cast-iron saddles on which the cables pass over
      b.sym((k) => b.box(0.6, 0.25, 0.9, P.castIron, { at: [k * cx, saddle + 0.05, s * zP] }));
      // anchorages: masonry blocks in the bank behind
      b.sym((k) => {
        b.box(1.3, 0.6, 1.6, stone, { at: [k * cx, -0.25, s * 19.0] });
        b.box(0.5, 0.12, 0.5, P.castIron, { at: [k * cx, 0.35, s * 18.8] });
      });
    });

    // the cables: two on each side, slung between the portals and stayed back to the anchorages
    const zs = steps(14, -zP, zP);
    b.sym((k) => {
      for (const dx of [-0.14, 0.14]) {
        const x = k * cx + dx;
        for (let i = 0; i < zs.length - 1; i++) tube(b, [x, cable(zs[i]), zs[i]], [x, cable(zs[i + 1]), zs[i + 1]], 0.07, iron, 5);
        b.sym((s) => tube(b, [x, saddle + 0.25, s * zP], [x, 0.45, s * 18.8], 0.07, iron, 5));
      }
      // suspension rods every metre down to the cross-beams
      for (const z of steps(24, -zP + 1.0, zP - 1.0)) {
        b.box(0.04, cable(z) - f(z) + 0.15, 0.04, iron, { at: [k * cx, f(z) - 0.2, z], jitter: false });
      }
    });

    // the deck: cross-beams hung from the rods, longitudinal joists, planks, and a timber lattice parapet
    for (const z of steps(24, -zP + 1.0, zP - 1.0)) b.box(2 * cx + 0.3, 0.16, 0.18, P.oakDark, { at: [0, f(z) - 0.38, z] });
    band(b, 0, W - 0.2, -END, END, (z) => f(z) - 0.22, (z) => f(z) + 0.0, tint(P.oakSilver, -0.08), 24);
    b.sym((k) => band(b, k * 1.2, 0.2, -zP, zP, (z) => f(z) - 0.38, (z) => f(z) - 0.22, P.oakDark, 16));
    b.sym((k) => {
      const x = k * (W / 2 - 0.05);
      const zz = steps(20, -zP + 0.7, zP - 0.7);
      band(b, x, 0.12, -END + 0.6, END - 0.6, (z) => f(z) + 0.95, (z) => f(z) + 1.08, oak, 24);
      band(b, x, 0.1, -END + 0.6, END - 0.6, (z) => f(z) + 0.0, (z) => f(z) + 0.14, oak, 24);
      for (let i = 0; i < zz.length - 1; i++) {
        const a: Vec3 = [x, f(zz[i]) + 0.12, zz[i]];
        const c: Vec3 = [x, f(zz[i + 1]) + 0.97, zz[i + 1]];
        bar(b, a, c, 0.07, oak);
        bar(b, [x, f(zz[i]) + 0.97, zz[i]], [x, f(zz[i + 1]) + 0.12, zz[i + 1]], 0.07, oak);
      }
      // plain posts on the approaches
      b.sym((s) => {
        for (const z of steps(3, zP + 0.9, END - 0.6)) b.box(0.12, 1.08, 0.12, oak, { at: [x, f(z), s * z] });
      });
    });

    // the toll house at the north end, with its barrier raised
    b.group({ at: [6.0, 0, 16.6] }, () => {
      b.box(3.0, 2.9, 2.8, P.enduitGris);
      b.hip(3.4, 3.2, 1.2, P.ardoise, { at: [0, 2.9, 0] });
      b.panel(0.9, 2.0, P.voletVert, { at: [-1.5, 0, 0.3], facing: '-x' });
      b.window(0.8, 1.2, { at: [-1.5, 1.0, -0.8], facing: '-x', frame: P.white, bars: [2, 3] });
      b.window(0.8, 1.2, { at: [0, 1.0, -1.4], facing: '-z', frame: P.white, bars: [2, 3] });
      b.panel(1.6, 0.35, P.white, { at: [-1.5, 2.3, 0.3], facing: '-x' });
    });
    b.cyl(0.12, 1.0, P.white, { at: [3.0, 0, 15.6], segs: 6 });
    bar(b, [3.0, 1.0, 15.6], [2.4, 4.2, 15.6], 0.08, P.white);
  },
};
