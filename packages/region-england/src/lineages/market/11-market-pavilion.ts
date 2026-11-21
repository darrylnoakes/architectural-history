import { P, linspace, tint, type BuildingDef, type Builder } from '@ah/kit';
import { beam, goods, trestle } from './shared';

const RW = 20; // roof length along X
const RD = 14; // roof depth along Z

/** Height of the underside of the sweeping roof at x. */
function roofY(x: number): number {
  const t = (x + RW / 2) / RW;
  return 3.9 + 3.2 * Math.pow(t, 1.7) + 0.7 * Math.sin(Math.PI * t);
}

/** A modern market stall with a coloured canvas awning. */
function stall(b: Builder, x: number, z: number, rotY: number, canvas: number, kinds: ('basket' | 'sack' | 'pot' | 'cloth' | 'fruit')[]): void {
  b.group({ at: [x, 0.1, z], rotY }, () => {
    trestle(b, 2.6, 1.0, [0, 0, 0], 0, P.pine);
    goods(b, 2.2, [0, 0.88, 0], 0, kinds);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.03, 2.3, P.aluminium, { at: [sx * 1.3, 0, sz * 0.6], segs: 5 });
    b.gable(2.7, 1.4, 0.4, canvas, { at: [0, 2.3, 0], ridge: 'x', overhang: 0.1, thick: 0.04 });
    for (let i = 0; i < 6; i++) b.box(0.45, 0.25, 0.02, i % 2 ? P.white : canvas, { at: [-1.125 + i * 0.45, 2.05, 0.75] });
  });
}

export const marketPavilion: BuildingDef = {
  id: 'market-pavilion',
  name: 'Market pavilion',
  style: 'Contemporary',
  date: 'c. 2005',
  summary:
    'The precinct is gone, and the island returns to what it was for most of its history: an open market. ' +
    'A single sweeping roof of laminated timber shelters a glazed hall for the permanent traders and an open end where weekly stalls set up and spill out into the square. ' +
    'Engineered timber and large sheets of glass are chosen for warmth and low carbon, and the roof is shaped to be noticed, a signature for the regenerated town centre.',
  materials: ['glued laminated timber (glulam)', 'structural glass', 'standing-seam zinc', 'granite setts'],
  lookFor: [
    { label: 'Sweeping roof', note: 'One continuous curved roof that rises toward the glazed hall: shelter and landmark in one gesture.', at: [5.0, 7.9, 7.2] },
    { label: 'Glulam ribs', note: 'Thin layers of timber glued together into long curved beams, stronger and straighter than any single tree.', at: [-6.0, 4.0, 2.0] },
    { label: 'Tree columns', note: 'Each post branches into two raking struts, shortening the span of the roof.', at: [-2.0, 2.6, 5.4] },
    { label: 'Glazed hall', note: 'A box of full-height glass with slim timber mullions, so the stalls inside stay on show to the square.', at: [5.0, 2.6, 5.6] },
    { label: 'Open stalls', note: 'Under the low end and out on the setts, weekly traders set up as they have on this spot for two thousand years.', at: [-7.6, 2.6, 7.6] },
  ],
  influences: ['passivhaus'],
  build(b) {
    const larch = P.larch;
    const glulam = tint(P.pine, 0.02);
    const zinc = P.zinc;
    const T = 0.4; // roof thickness

    // granite sett paving
    b.box(21.6, 0.1, 17.6, P.granite);
    b.box(RW - 0.6, 0.02, RD - 0.6, tint(P.granite, 0.05), { at: [0, 0.1, 0] });

    // the roof: a curved timber deck with a zinc top
    const xs = linspace(24, -RW / 2, RW / 2);
    const under: [number, number][] = xs.map((x) => [x, roofY(x)]);
    const over: [number, number][] = xs.slice().reverse().map((x) => [x, roofY(x) + T]);
    b.extrude([...under, ...over], RD, larch);
    const top: [number, number][] = xs.map((x) => [x, roofY(x) + T]);
    const top2: [number, number][] = xs.slice().reverse().map((x) => [x, roofY(x) + T + 0.08]);
    b.extrude([...top, ...top2], RD + 0.1, zinc);
    // standing seams
    for (const z of linspace(15, -RD / 2 + 0.4, RD / 2 - 0.4)) {
      for (let i = 0; i < xs.length - 1; i++) {
        beam(b, [xs[i], roofY(xs[i]) + T + 0.06, z], [xs[i + 1], roofY(xs[i + 1]) + T + 0.06, z], 0.05, tint(zinc, -0.06));
      }
    }
    // glulam ribs under the roof
    const ribZ = linspace(6, -RD / 2 + 0.8, RD / 2 - 0.8);
    for (const z of ribZ) {
      for (let i = 0; i < xs.length - 1; i++) {
        beam(b, [xs[i], roofY(xs[i]) - 0.45, z], [xs[i + 1], roofY(xs[i + 1]) - 0.45, z], 0.5, glulam, 0.22);
      }
    }

    // tree columns along the two long sides
    const colX = [-7.5, -2.5, 2.5, 7.5];
    for (const zc of [-RD / 2 + 1.2, RD / 2 - 1.2]) {
      for (const x of colX) {
        const fork = 2.4;
        b.cyl(0.2, fork, glulam, { at: [x, 0.1, zc], segs: 8 });
        for (const d of [-1, 1]) beam(b, [x, fork, zc], [x + d * 1.6, roofY(x + d * 1.6) - 0.45, zc], 0.24, glulam);
        b.collider(0.5, 0.5, { at: [x, 0, zc] });
      }
    }

    // the glazed hall under the high end
    const x0 = 0.6;
    const x1 = RW / 2 - 0.8;
    const zg = RD / 2 - 2.4;
    const hx = linspace(10, x0, x1);
    for (const s of [1, -1] as const) {
      const poly: [number, number][] = [[x0, 0.1], [x1, 0.1], ...hx.slice().reverse().map((x) => [x, roofY(x) - 0.4] as [number, number])];
      b.extrude(poly, 0.06, P.glass, { at: [0, 0, s * zg], mat: 'glass' });
      for (const x of linspace(9, x0, x1)) b.box(0.1, roofY(x) - 0.5, 0.16, larch, { at: [x, 0.1, s * zg] });
      b.box(x1 - x0, 0.12, 0.18, larch, { at: [(x0 + x1) / 2, 2.6, s * zg] });
    }
    for (const x of [x0, x1]) {
      const h = roofY(x) - 0.5;
      b.box(0.06, h, 2 * zg, P.glass, { at: [x, 0.1, 0], mat: 'glass' });
      for (const z of linspace(7, -zg, zg)) b.box(0.16, h, 0.1, larch, { at: [x, 0.1, z] });
      b.box(0.18, 0.12, 2 * zg, larch, { at: [x, 2.6, 0] });
    }
    // doors in the glazed front and back
    for (const s of [1, -1]) {
      b.box(2.0, 2.3, 0.1, P.glassDark, { at: [(x0 + x1) / 2, 0.1, s * (zg + 0.05)], mat: 'glass' });
      b.box(2.2, 0.12, 0.2, larch, { at: [(x0 + x1) / 2, 2.4, s * (zg + 0.05)] });
    }
    b.collider(x1 - x0, 2 * zg, { at: [(x0 + x1) / 2, 0, 0] });
    // permanent counters inside the hall
    for (const z of [-2.2, 2.2]) {
      b.box(6.5, 1.0, 1.0, P.white, { at: [(x0 + x1) / 2, 0.1, z] });
      goods(b, 6, [(x0 + x1) / 2, 1.1, z], 0, ['fruit', 'basket', 'fruit', 'pot']);
    }

    // open stalls under the low end and spilling out onto the square
    const canv = [P.cladRed, P.cladBlue, P.cladYellow, P.cladGreen, P.doorRed];
    stall(b, -7.0, -2.4, 0, canv[0], ['fruit', 'fruit', 'basket']);
    stall(b, -3.6, -2.4, 0, canv[1], ['cloth', 'cloth', 'cloth']);
    stall(b, -7.0, 2.2, Math.PI, canv[2], ['basket', 'sack', 'basket']);
    stall(b, -3.6, 2.2, Math.PI, canv[3], ['pot', 'basket', 'pot']);
    stall(b, -7.6, 7.6, 0.08, canv[(4 + b.variant) % 5], ['fruit', 'basket', 'fruit']);
    stall(b, -2.6, 7.8, -0.05, canv[(1 + b.variant) % 5], ['cloth', 'pot', 'cloth']);
    stall(b, 4.6, -7.9, Math.PI, canv[(2 + b.variant) % 5], ['basket', 'fruit', 'basket']);
    stall(b, -9.6, -7.6, Math.PI + 0.1, canv[3], ['sack', 'basket', 'sack']);

    // benches and trees on the square edge
    for (const [x, z] of [[8.4, 7.6], [-10.2, 3.2]] as [number, number][]) {
      b.tree(5.5, { at: [x, 0.1, z] });
      b.collider(0.6, 0.6, { at: [x, 0, z] });
    }
    b.box(2.2, 0.45, 0.5, larch, { at: [5.0, 0.1, 7.9] });
  },
};
