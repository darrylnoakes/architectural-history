import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { pitched } from './shared';

/** A small car of the 1960s, nose to +z. */
function car(b: Builder, at: [number, number, number], rotY: number, col: number): void {
  b.group({ at, rotY }, () => {
    b.box(1.55, 0.6, 3.7, col, { at: [0, 0.3, 0] });
    b.box(1.4, 0.55, 1.9, col, { at: [0, 0.9, -0.3] });
    b.box(1.42, 0.42, 1.7, P.glassDark, { at: [0, 0.95, -0.3], mat: 'glass' });
    b.box(1.5, 0.12, 0.08, P.aluminium, { at: [0, 0.45, 1.86] });
    for (const [x, z] of [[-0.72, 1.15], [0.72, 1.15], [-0.72, -1.2], [0.72, -1.2]]) b.log(0.3, 0.2, P.black, { at: [x, 0, z], segs: 8 });
    for (const s of [1, -1]) b.box(0.25, 0.15, 0.05, P.cream, { at: [s * 0.5, 0.55, 1.86] });
  });
}

export const pavillon: BuildingDef = {
  id: 'pavillon',
  name: 'Suburban pavillon',
  style: 'Trente Glorieuses',
  date: 'c. 1968',
  summary:
    'In the boom years after the war millions of French families wanted a house of their own on its own plot, and the town spread outwards in estates of pavillons. ' +
    'Firms such as Maisons Phénix sold them from a catalogue and put them up in weeks from factory-made parts: a light steel frame clad in panels of concrete, on a concrete slab, under a low roof of machine-made interlocking tiles. ' +
    'The house stands alone in its garden behind a clipped hedge, with a garage for the car, roller shutters on every window and a television aerial on the ridge. For the first time in two thousand years the plot is not on the street.',
  materials: ['steel frame', 'prefabricated concrete panels', 'interlocking clay tiles', 'roller shutters', 'privet hedge'],
  modelledOn: 'The Maison Phénix type, steel-framed and clad in concrete panels, built in large numbers from the 1950s to the 1980s. The model is generic, not one catalogue design.',
  influences: ['american-way'],
  lookFor: [
    {
      label: 'Concrete panels on a steel frame',
      note: 'The walls are storey-high panels of concrete hung on thin steel posts; the joints between them show as vertical lines.',
      at: [-4.6, 1.6, 4.55],
    },
    {
      label: 'Low tiled roof',
      note: 'A shallow roof of interlocking machine-made tiles, quick to lay and far lighter than the old flat tiles.',
      at: [-1.0, 4.4, 2.5],
    },
    {
      label: 'Garage',
      note: 'Room for the car is part of the design: the family now drives to work, to school and to the new hypermarket.',
      at: [4.9, 1.8, 4.8],
    },
    {
      label: 'Roller shutters',
      note: 'Each window has a roller shutter in a box above it, wound down at night: the old hinged shutters are gone.',
      at: [1.4, 2.4, 4.6],
    },
    {
      label: 'Clipped hedge',
      note: 'A hedge of privet or thuja round the plot keeps the garden private: the pavillon turns away from the street.',
      at: [-5.5, 1.5, 8.6],
    },
  ],
  build(b) {
    const panel = tint(b.pick([P.concreteWhite, P.cream, P.pebbledash, P.whiteRender]), b.range(-0.03, 0.01));
    const roof = tint(b.pick([P.tileRed, P.terracotta, P.tileBrown, P.tuilePlate]), b.range(-0.04, 0.02));
    const shut = b.pick([P.white, P.cream, P.voletGris, P.oak, tint(P.voletBleu, 0.1)]);
    const door = b.pick([P.oak, P.doorGreen, P.doorRed, P.doorBlue]);
    const carCol = b.pick([0xc8b048, 0x8a2f2a, 0xe8e2d0, 0x4f6f9a, 0x6a8a5a]);
    const base = 0.5;
    const xc = -1.6;
    const W = 9.6;
    const zF = 4.5;
    const zB = -3.0;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const H = 2.6;

    // garden: lawn, a gravel drive, paths
    b.box(13.6, 0.03, 17.6, P.grass, { at: [0, 0, 0], jitter: false });
    b.box(3.0, 0.05, 4.4, P.gravel, { at: [4.9, 0, 6.8], jitter: false });
    b.box(1.0, 0.05, 3.6, P.paving, { at: [-0.4, 0, 6.6], jitter: false });

    // the house on its low base (vide sanitaire)
    b.box(W + 0.1, base, D + 0.1, tint(P.concrete, -0.05), { at: [xc, 0, zc] });
    b.box(W, H, D, panel, { at: [xc, base, zc] });
    // panel joints
    for (let x = -W / 2 + 1.2; x < W / 2 - 0.1; x += 1.2) {
      b.box(0.04, H, 0.03, tint(panel, -0.12), { at: [xc + x, base, zF + 0.01], jitter: false });
      b.box(0.04, H, 0.03, tint(panel, -0.12), { at: [xc + x, base, zB - 0.01], jitter: false });
    }
    for (let z = zB + 1.25; z < zF - 0.1; z += 1.25) b.box(0.03, H, 0.04, tint(panel, -0.12), { at: [xc - W / 2 - 0.01, base, z], jitter: false });
    // low gable roof of interlocking tiles, a TV aerial and a flue
    pitched(b, W, D, 1.9, roof, { at: [xc, base + H, zc], ridge: 'x', overhang: 0.45, ends: 0.35, wall: panel, thick: 0.12, courses: 7 });
    b.cyl(0.03, 2.2, P.aluminium, { at: [xc + 2.0, base + H + 1.9, zc], segs: 4 });
    for (const y of [1.4, 1.8, 2.1]) b.box(1.0 - (y - 1.4) * 0.6, 0.03, 0.03, P.aluminium, { at: [xc + 2.0, base + H + 1.9 + y, zc] });
    b.box(0.08, 0.6, 0.04, P.aluminium, { at: [xc + 2.0, base + H + 3.6, zc] });
    b.cyl(0.14, 1.0, P.concreteDark, { at: [xc - 2.5, base + H + 1.5, zc - 0.6], segs: 8 });

    // front: door up three steps under a little canopy, windows with roller-shutter boxes
    const dx = xc + 0.9;
    b.stairs(1.6, base, 1.0, 3, P.concrete, { at: [dx, 0, zF + 0.5] });
    b.panel(1.0, 2.1, door, { at: [dx, base, zF], facing: '+z', depth: 0.06 });
    b.panel(0.3, 1.2, P.glassDark, { at: [dx + 0.2, base + 0.7, zF], facing: '+z', depth: 0.08 });
    b.box(1.8, 0.1, 1.1, P.concreteWhite, { at: [dx, base + 2.3, zF + 0.55] });
    const wins: [number, number, number][] = [[xc - 3.3, 1.6, 1.35], [xc - 1.3, 1.6, 1.35], [xc + 3.0, 2.2, 1.35]];
    for (const [x, w, h] of wins) {
      const y = base + 0.85;
      const down = b.pick([0, 0.3, 0.6]);
      b.window(w, h, { at: [x, y, zF + 0.01], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 1], mat: 'glass', border: 0.07 });
      b.box(w + 0.2, 0.25, 0.22, shut, { at: [x, y + h, zF + 0.1] }); // shutter box
      if (down) b.box(w, h * down, 0.05, shut, { at: [x, y + h - h * down, zF + 0.1] });
      b.box(w + 0.2, 0.06, 0.2, P.concrete, { at: [x, y - 0.06, zF + 0.1] });
    }
    // back: a kitchen door to the garden, windows
    b.panel(0.9, 2.1, P.oak, { at: [xc + 2.6, base, zB], facing: '-z' });
    b.stairs(1.2, base, 0.8, 2, P.concrete, { at: [xc + 2.6, 0, zB - 0.4], rotY: Math.PI });
    for (const x of [xc - 3.0, xc - 0.6]) {
      b.window(1.4, 1.25, { at: [x, base + 0.95, zB - 0.01], facing: '-z', frame: P.white, glass: P.glassDark, bars: [2, 1], border: 0.07 });
      b.box(1.6, 0.25, 0.22, shut, { at: [x, base + 2.2, zB - 0.1] });
    }
    b.window(1.0, 0.9, { at: [xc - W / 2, base + 1.2, zc], facing: '-x', frame: P.white, glass: P.glassDark, border: 0.07 });

    // the garage beside it, flat-roofed, with an up-and-over door
    const gx = 4.9;
    b.box(2.8, 2.5, 6.2, panel, { at: [gx, 0, 1.6] });
    b.box(3.0, 0.2, 6.4, P.concreteDark, { at: [gx, 2.5, 1.6] });
    b.panel(2.4, 2.05, b.pick([P.white, P.aluminium, P.oak, P.voletGris]), { at: [gx, 0, 4.7], facing: '+z', depth: 0.05 });
    for (let i = 1; i < 6; i++) b.panel(2.4, 0.03, P.concreteDark, { at: [gx, i * 0.34, 4.7], facing: '+z', depth: 0.07 });
    car(b, [gx, 0, 6.9], 0, carCol);

    // clipped hedge round the plot, a gate between two pillars, a letterbox
    const hedge = tint(P.hedge, b.range(-0.03, 0.03));
    b.box(0.6, 1.5, 17.0, hedge, { at: [-6.5, 0, 0] });
    b.box(0.6, 1.5, 17.0, hedge, { at: [6.5, 0, 0] });
    b.box(13.6, 1.5, 0.6, hedge, { at: [0, 0, -8.5] });
    b.box(5.4, 1.2, 0.6, hedge, { at: [-3.6, 0, 8.5] });
    b.box(0.6, 1.2, 0.6, hedge, { at: [2.0, 0, 8.5] });
    for (const x of [-0.9, 0.1, 3.4, 6.9 - 0.7]) b.box(0.4, 1.3, 0.4, P.concreteWhite, { at: [x, 0, 8.5] });
    b.box(0.8, 0.9, 0.04, P.castIron, { at: [-0.4, 0.15, 8.5] });
    b.box(0.35, 0.3, 0.25, P.doorYellow, { at: [-0.9, 1.3, 8.55] });
    // a flower bed under the windows, a cherry tree, a rotary clothes line
    b.box(4.0, 0.25, 0.7, P.soil, { at: [xc - 2.3, 0, zF + 0.5] });
    for (let i = 0; i < 6; i++) b.blob(0.22, b.pick([0xc84a5a, 0xe0b83c, 0xd87a9a, P.leaf]), { at: [xc - 4.0 + i * 0.68, 0.35, zF + 0.5], detail: 0 });
    b.tree(b.range(4.2, 5.0), { at: [-4.0, 0, -5.8], kind: 'round', color: P.leaf });
    b.cyl(0.04, 1.8, P.aluminium, { at: [2.0, 0, -6.0], segs: 4 });
    for (let i = 0; i < 4; i++) b.box(1.8, 0.03, 0.03, P.aluminium, { at: [2.0, 1.75, -6.0], rotY: (i * Math.PI) / 4 });
    b.box(2.0, 0.04, 2.2, P.paving, { at: [xc + 2.6, 0, zB - 1.5], jitter: false });
  },
};
