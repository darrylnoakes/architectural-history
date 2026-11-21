import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { coppiRoof, FRONT, pave, pot, well } from './shared';

/** A moulded window surround with 'ears' at the top corners, on the front wall (facing +z). */
function earFrame(b: Builder, x: number, y: number, z: number, w: number, h: number, c: number): void {
  const bd = 0.16;
  b.panel(w + bd * 2, h + bd * 2, c, { at: [x, y - bd, z], facing: '+z', depth: 0.05 });
  b.sym((s) => b.panel(0.16, 0.3, c, { at: [x + s * (w / 2 + bd + 0.07), y + h - 0.15, z], facing: '+z', depth: 0.05 }));
}

export const baroqueTownhouse: BuildingDef = {
  id: 'baroque-townhouse',
  name: 'Palazzetto',
  style: 'Baroque',
  date: 'c. 1680',
  summary:
    'A prosperous family, a notary or a merchant, has bought the two old houses behind and rebuilt them as one small palace, a palazzetto, ' +
    'copying the manners of the great Roman palaces on a modest scale. The plastered front is coloured ochre and ordered in five bays round a ' +
    'big arched street door, with moulded window frames, pediments over the main floor and a balcony over the door. Low mezzanine windows ' +
    'light the service rooms tucked between the main storeys, and on the roof an altana, a terrace under a tiled canopy, catches the evening breeze.',
  materials: ['brick walls with lime plaster', 'stucco mouldings', 'travertine door frame and sills', 'wrought iron', 'clay pan-and-cover tiles'],
  influences: ['baroque-export'],
  lookFor: [
    {
      label: 'Arched street door',
      note: 'The portone, tall enough for a carriage or a laden mule, framed in travertine with a keystone and a balcony over it.',
      at: [0, 4.2, 8.75],
    },
    {
      label: 'Moulded window surrounds',
      note: 'Stucco frames with little ‘ears’ at the top corners, crowned by pediments that alternate triangle and arc on the main floor.',
      at: [-2.6, 7.6, 8.55],
    },
    {
      label: 'Mezzanine windows',
      note: 'Small square windows over the ground-floor windows and under the cornice light low rooms for servants, stores and the counting room.',
      at: [-5.2, 3.6, 8.55],
    },
    {
      label: 'Altana',
      note: 'A roof terrace under a tiled canopy, the Roman family’s place for air and a view over the roofs, and for drying the washing.',
      at: [1.6, 17.3, 2.0],
    },
    {
      label: 'Cornice',
      note: 'A deep moulded cornice of stucco on brick caps the front, in place of the old timber eaves.',
      at: [5.0, 13.7, 8.9],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const zf = FRONT;
    const zb = -1.4;
    const D = zf - zb;
    const zc = (zf + zb) / 2;
    const g = 4.4; // ground floor with its mezzanine
    const n1 = 4.4; // piano nobile
    const s2 = 3.4; // second floor
    const at = 1.4; // attic mezzanine
    const H = g + n1 + s2 + at;
    const ochre = tint(b.pick([P.intonacoOchre, tint(P.intonacoOchre, -0.04), P.intonacoSienna, tint(P.intonacoOchre, 0.03)]), b.range(-0.02, 0.02));
    const stucco = tint(b.pick([P.intonacoCream, P.travertine, P.stucco]), -0.02);
    const trav = P.travertine;
    const tile = tint(P.coppi, b.range(-0.05, 0.02));
    const glass = 0x3e4f60;
    const frame = b.pick([P.oakDark, P.oak, 0x6b4a32]);
    const bays = spread(5, -X, X);

    // body
    b.box(W, H, D, ochre, { at: [0, 0, zc] });
    b.box(W + 0.02, 0.6, D + 0.02, tint(trav, -0.06), { at: [0, 0, zc] }); // plinth
    // quoins at the two ends of the front, string courses
    for (const s of [-1, 1]) {
      for (let y = 0.6, i = 0; y < H - 0.4; y += 0.55, i++) {
        const w = i % 2 ? 0.55 : 0.85;
        b.box(w, 0.47, 0.08, stucco, { at: [s * (X - w / 2), y, zf + 0.04] });
      }
    }
    for (const y of [g, g + n1 + 0.0]) b.box(W, 0.22, 0.18, stucco, { at: [0, y - 0.1, zf + 0.09] });
    b.box(W, 0.14, 0.12, stucco, { at: [0, g + 0.5, zf + 0.06] }); // sill band of the main floor
    // the cornice, stepped out in three mouldings, with a frieze for the attic windows
    b.box(W, 0.2, 0.2, stucco, { at: [0, H - 0.05, zf + 0.1] });
    b.box(W, 0.22, 0.45, stucco, { at: [0, H + 0.15, zf + 0.22] });
    b.box(W, 0.25, 0.75, tint(stucco, 0.03), { at: [0, H + 0.37, zf + 0.37] });
    b.box(W, 0.2, 0.3, stucco, { at: [0, H - 0.05, zb - 0.15] });
    coppiRoof(b, W, D + 1.2, 1.9, tile, { at: [0, H + 0.6, zc], overhang: 0.1, ends: 0, wall: ochre, thick: 0.13, step: 0.55 });
    b.box(W, 0.6, D + 1.2, ochre, { at: [0, H, zc] });

    // ---- ground floor: barred windows with mezzanine windows above, and the portone
    for (const [i, x] of bays.entries()) {
      if (i === 2) continue;
      b.panel(1.4, 1.95, trav, { at: [x, 0.85, zf], facing: '+z', depth: 0.05 });
      b.window(1.1, 1.7, { at: [x, 0.98, zf], facing: '+z', frame, glass, bars: [2, 3] });
      for (const u of spread(4, -0.5, 0.5)) b.box(0.035, 1.75, 0.035, P.iron, { at: [x + u, 0.95, zf + 0.15] });
      for (const v of [1.4, 2.2]) b.box(1.15, 0.035, 0.035, P.iron, { at: [x, v, zf + 0.15] });
      b.box(1.5, 0.12, 0.22, trav, { at: [x, 0.8, zf + 0.1] });
      // mezzanine
      b.panel(1.0, 0.85, stucco, { at: [x, 3.15, zf], facing: '+z', depth: 0.05 });
      b.window(0.75, 0.62, { at: [x, 3.26, zf], facing: '+z', frame, glass, bars: [2, 1] });
    }
    // portone: travertine rustication and keystone, studded doors, stone step
    const pw = 2.1;
    const ph = 3.9;
    b.panel(pw + 1.0, ph + 0.5, trav, { at: [0, 0, zf], facing: '+z', shape: 'round', depth: 0.06 });
    for (let y = 0.2; y < ph - 1.2; y += 0.6) b.sym((s) => b.box(0.55, 0.45, 0.12, tint(trav, 0.04), { at: [s * (pw / 2 + 0.28), y, zf + 0.06] }));
    b.panel(pw, ph, P.windowDark, { at: [0, 0, zf], facing: '+z', shape: 'round', depth: 0.08 });
    b.panel(pw - 0.15, ph - 1.15, b.pick([P.doorGreen, P.oakDark, 0x4b2e22]), { at: [0, 0.05, zf], facing: '+z', depth: 0.1 });
    b.window(pw - 0.2, 0.95, { at: [0, ph - 1.05, zf], facing: '+z', shape: 'round', frame: P.iron, glass, bars: [4, 1] }); // fanlight
    b.panel(0.04, ph - 1.2, P.timberBlack, { at: [0, 0.05, zf], facing: '+z', depth: 0.12 });
    b.extrude([[-0.22, 0], [0.22, 0], [0.3, 0.55], [-0.3, 0.55]], 0.2, trav, { at: [0, ph - 0.12, zf + 0.12] }); // keystone
    b.box(pw + 1.2, 0.18, 0.7, trav, { at: [0, 0, zf + 0.35] });
    // balcony on stone brackets above the door
    b.box(3.0, 0.2, 0.9, trav, { at: [0, g, zf + 0.45] });
    b.sym((s) => b.extrude([[0, 0], [0, -0.6], [0.2, -0.6], [0.8, -0.1], [0.8, 0]], 0.25, trav, { at: [s * 1.1, g, zf], rotY: -Math.PI / 2 }));
    b.box(3.0, 0.06, 0.06, P.iron, { at: [0, g + 1.0, zf + 0.87] });
    for (const x of spread(14, -1.45, 1.45)) b.box(0.03, 0.82, 0.03, P.iron, { at: [x, g + 0.2, zf + 0.87], jitter: false });
    b.sym((s) => b.box(0.06, 1.0, 0.85, P.iron, { at: [s * 1.48, g + 0.06, zf + 0.45] }));

    // ---- piano nobile: eared frames, alternating pediments; balcony door in the middle
    for (const [i, x] of bays.entries()) {
      const y0 = g + 0.6;
      const h = i === 2 ? 2.9 : 2.4;
      earFrame(b, x, y0, zf, 1.2, h, stucco);
      b.window(1.2, h, { at: [x, y0, zf], facing: '+z', frame, glass, bars: [2, i === 2 ? 4 : 3] });
      const py = y0 + h + 0.2;
      b.box(1.9, 0.14, 0.24, stucco, { at: [x, py, zf + 0.12] });
      if (i % 2 === 0) b.extrude([[-0.95, 0], [0.95, 0], [0, 0.42]], 0.22, stucco, { at: [x, py + 0.14, zf + 0.12] });
      else b.panel(1.9, 0.42, stucco, { at: [x, py + 0.14, zf], facing: '+z', shape: 'segmental', depth: 0.2 });
    }
    // ---- second floor: eared frames with a straight cornice
    for (const x of bays) {
      const y0 = g + n1 + 0.45;
      earFrame(b, x, y0, zf, 1.1, 1.9, stucco);
      b.window(1.1, 1.9, { at: [x, y0, zf], facing: '+z', frame, glass, bars: [2, 3] });
      b.box(1.6, 0.12, 0.2, stucco, { at: [x, y0 + 2.05, zf + 0.1] });
    }
    // ---- attic mezzanine in the frieze
    for (const x of bays) {
      b.panel(0.95, 0.75, stucco, { at: [x, H - 1.15, zf], facing: '+z', depth: 0.05 });
      b.window(0.7, 0.55, { at: [x, H - 1.05, zf], facing: '+z', frame, glass, bars: [2, 1] });
    }

    // ---- the altana on the roof
    const ay = H + 0.6 + 1.9 - 0.2; // ridge level
    const ax = 1.6;
    const az = zc - 0.6;
    b.box(4.4, ay - H, 3.6, ochre, { at: [ax, H, az] });
    b.box(4.6, 0.15, 3.8, P.cotto, { at: [ax, ay, az] });
    for (const [x, z] of [[-2.0, -1.6], [2.0, -1.6], [-2.0, 1.6], [2.0, 1.6]] as [number, number][]) {
      b.box(0.35, 2.4, 0.35, ochre, { at: [ax + x, ay + 0.15, az + z] });
    }
    b.box(4.4, 0.08, 0.06, P.iron, { at: [ax, ay + 1.05, az + 1.6] });
    for (const x of spread(16, -1.8, 1.8)) b.box(0.03, 0.9, 0.03, P.iron, { at: [ax + x, ay + 0.15, az + 1.6], jitter: false });
    b.box(4.6, 0.25, 3.9, stucco, { at: [ax, ay + 2.55, az] });
    coppiRoof(b, 4.6, 3.9, 0.9, tile, { at: [ax, ay + 2.8, az], overhang: 0.35, wall: ochre, thick: 0.1, step: 0.45 });
    pot(b, [ax - 1.4, ay + 0.15, az - 1.0], 0.8);
    b.box(0.03, 0.03, 3.0, P.white, { at: [ax + 0.5, ay + 1.9, az] }); // a washing line

    // ---- back: plain windows, a door, and a little court with a wall fountain
    const back = (x: number, y: number, w: number, h: number) => {
      b.panel(w + 0.2, h + 0.2, stucco, { at: [x, y - 0.1, zb], facing: '-z', depth: 0.04 });
      b.window(w, h, { at: [x, y, zb], facing: '-z', frame, glass, bars: [2, 3] });
    };
    for (const x of [-4.2, 0, 4.2]) {
      back(x, g + 0.7, 1.1, 2.2);
      back(x, g + n1 + 0.5, 1.0, 1.8);
      if (x !== 0) back(x, 1.0, 1.0, 1.6);
    }
    b.panel(1.6, 2.8, trav, { at: [0, 0, zb], facing: '-z', shape: 'round', depth: 0.05 });
    b.panel(1.3, 2.6, frame, { at: [0, 0, zb], facing: '-z', shape: 'round', depth: 0.07 });
    const cz1 = -8.8;
    pave(b, W - 0.6, zb - cz1 - 0.3, tint(P.cotto, 0.05), [0, 0, (zb + cz1) / 2 - 0.15]);
    b.box(W, 3.2, 0.35, ochre, { at: [0, 0, cz1 + 0.17] });
    b.sym((s) => b.box(0.35, 3.2, zb - cz1, ochre, { at: [s * (X - 0.17), 0, (zb + cz1) / 2] }));
    // wall fountain: a basin, a niche and a mask spout
    b.panel(2.2, 2.6, stucco, { at: [0, 0, cz1 + 0.35], facing: '+z', shape: 'round', depth: 0.06 });
    b.panel(1.5, 1.9, tint(ochre, -0.12), { at: [0, 0.9, cz1 + 0.35], facing: '+z', shape: 'round', depth: 0.08 });
    b.lathe([[0.01, 0], [0.9, 0.1], [1.0, 0.7], [0.92, 0.72], [0.8, 0.25], [0.01, 0.25]], trav, { at: [0, 0, cz1 + 0.6], segs: 14, start: Math.PI / 2, sweep: Math.PI });
    b.box(1.6, 0.05, 0.7, P.water, { at: [0, 0.55, cz1 + 0.75], jitter: false });
    b.sphere(0.16, trav, { at: [0, 1.6, cz1 + 0.5], segs: 6 });
    // lemons in pots, a well, a small pergola
    for (const x of [-5.2, -3.6, 3.6, 5.2]) {
      pot(b, [x, 0, -7.6], 1.2, P.leafDark);
      b.blob(0.12, P.marbleYellow, { at: [x + 0.2, 1.05, -7.4], detail: 0 });
    }
    well(b, [-4.4, 0, -3.6], tint(trav, -0.04), { frame: 'iron' });
    for (const [x, z] of [[2.4, -3.0], [5.8, -3.0], [2.4, -5.6], [5.8, -5.6]] as [number, number][]) b.box(0.12, 2.5, 0.12, P.oak, { at: [x, 0, z] });
    b.box(3.8, 0.3, 3.0, P.leaf, { at: [4.1, 2.5, -4.3] });
  },
};
