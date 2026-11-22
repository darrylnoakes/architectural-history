import { P, tint, type BuildingDef } from '@ah/kit';
import { block, col, onFace, pediment, win } from './shared';

export const neoclassicalVilla: BuildingDef = {
  id: 'neoclassical-villa',
  name: 'Neoclassical villa',
  style: 'Neoclassical',
  date: 'c. 1790',
  summary:
    'The rich now build outside the walls, in a villa set in its own grounds. ' +
    'After the excavations at Herculaneum and Pompeii, taste turns from Baroque movement to the calm, exact forms of ancient temples: a plain stuccoed block raised on a base, a portico of Ionic columns under a pediment, windows with simple frames and shutters. ' +
    'The garden is new too: instead of clipped parterres there is an informal landscape in the English manner, with a winding path, a pond with irregular banks, clumps of pines and cypresses and a little round temple as an eye-catcher.',
  materials: ['stuccoed brick', 'travertine', 'painted timber shutters', 'coppi roof tiles'],
  influences: ['pompeii-neoclassicism', 'english-garden'],
  lookFor: [
    { label: 'Temple-front portico', note: 'Four Ionic columns rise through both storeys to a triangular pediment, like the front of an ancient temple.', at: [0, 8.8, 9.2] },
    { label: 'Raised base (podium)', note: 'The house stands on a rusticated base, reached by a broad flight of steps.', at: [-5.5, 0.6, 6.4] },
    { label: 'Shuttered windows', note: 'Plain window frames with louvred shutters (persiane), with small cornices on the main floor.', at: [6.0, 2.6, 6.2] },
    { label: 'Landscape garden', note: 'A winding path, an irregular pond and clumps of trees, after the English landscape park.', at: [-4.0, 0.4, -8.0] },
    { label: 'Garden temple (tempietto)', note: 'A small round temple of columns under a dome, placed as an eye-catcher at the end of the path.', at: [7.5, 3.2, -9.0] },
  ],
  build(b) {
    const stucco = b.pick([P.intonacoCream, P.stucco, tint(P.intonacoOchre, 0.12)]);
    const trav = P.travertine;
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const shutter = b.pick([P.doorGreen, tint(P.doorGreen, 0.08), 0x6e7b5a]);
    const W = 16;
    const D = 10;
    const zc = 1;
    const zf = zc + D / 2;
    const base = 1.1;
    const G = 4.3;
    const F = 3.9;
    const H = base + G + F;

    // ---- the block on its podium
    b.box(W + 0.3, base, D + 0.3, trav, { at: [0, 0, zc] });
    for (let y = 0.35; y < base; y += 0.36) b.box(W + 0.34, 0.05, D + 0.34, tint(trav, -0.12), { at: [0, y, zc], jitter: false });
    block(b, W, H, D, stucco, 0, zc);
    b.box(W + 0.1, 0.2, D + 0.1, trav, { at: [0, base + G - 0.1, zc] });
    b.box(W + 0.7, 0.4, D + 0.7, trav, { at: [0, H, zc] });
    b.hip(W + 0.8, D + 0.8, 2.0, roof, { at: [0, H + 0.4, zc] });
    b.sym((s) => b.chimney(0.6, 1.6, 0.6, stucco, { at: [s * 4.5, H + 1.2, zc] }));
    const winRow = (f: '+z' | '-z' | '+x' | '-x', at: [number, number, number], xs: number[]) =>
      onFace(b, f, at, () => {
        for (const x of xs) {
          win(b, x, base + 0.7, 1.0, 2.3, trav, { border: 0.14, shutters: shutter });
          win(b, x, base + G + 0.6, 1.0, 2.1, trav, { border: 0.14, shutters: shutter });
          b.box(1.6, 0.16, 0.24, trav, { at: [x, base + 3.25, 0.12] });
        }
      });
    winRow('+z', [0, 0, zf], [-6, -3.6, 3.6, 6]);
    winRow('-z', [0, 0, zc - D / 2], [-6, -2, 2, 6]);
    winRow('+x', [W / 2, 0, zc], [-2.5, 2.5]);
    winRow('-x', [-W / 2, 0, zc], [-2.5, 2.5]);
    onFace(b, '+z', [0, 0, zf], () => {
      b.panel(1.5, 3.0, P.doorGreen, { at: [0, base, 0], depth: 0.08 });
      b.panel(2.0, 3.3, trav, { at: [0, base, 0], depth: 0.05 });
      win(b, 0, base + G + 0.6, 1.1, 2.3, trav, { border: 0.14 });
      for (const x of [-1.6, 1.6]) win(b, x, base + G + 0.6, 0.6, 2.1, trav, { border: 0.1 });
    });

    // ---- the portico: four Ionic columns, entablature, pediment
    const pz = zf + 2.4;
    b.box(7.6, base, 2.6, trav, { at: [0, 0, zf + 1.3] });
    b.stairs(5.6, base, 1.6, 5, trav, { at: [0, 0, zf + 3.4] });
    const ch = G + F - 0.4;
    for (const x of [-3.0, -1.0, 1.0, 3.0]) col(b, x, pz, 0.32, ch, P.white, { y: base, cap: 'ionic', segs: 8 });
    const ey = base + ch;
    b.box(7.4, 0.9, 2.9, P.white, { at: [0, ey, zf + 1.35] });
    b.box(7.8, 0.25, 3.1, P.white, { at: [0, ey + 0.9, zf + 1.4] });
    onFace(b, '+z', [0, 0, zf + 2.95], () => pediment(b, 0, ey + 1.15, 7.8, 1.6, 'tri', P.white, 0.3));
    b.gable(7.8, 3.1, 1.6, roof, { at: [0, ey + 1.15, zf + 1.4], ridge: 'z', overhang: 0.05 });
    b.collider(7.6, 4.2, { at: [0, 0, zf + 2.0] });

    // ---- the landscape garden
    b.box(23, 0.03, 25, P.grass, { at: [0, 0, 0] });
    const path: [number, number][] = [[2.8, 11.5], [2.8, 8.6], [8.6, 7.5], [10, 3], [9, -3], [5.5, -6], [7.5, -9]];
    for (let i = 0; i < path.length - 1; i++) {
      const [x0, z0] = path[i];
      const [x1, z1] = path[i + 1];
      b.beam([x0, 0.04, z0], [x1, 0.04, z1], 1.2, 0.05, P.gravel);
    }
    const loop: [number, number][] = [[-2.8, 8.6], [-8.8, 7], [-10, 1], [-8, -5], [-3, -10.5], [2, -9], [5.5, -6]];
    for (let i = 0; i < loop.length - 1; i++) b.beam([loop[i][0], 0.04, loop[i][1]], [loop[i + 1][0], 0.04, loop[i + 1][1]], 1.0, 0.05, P.gravel);
    b.beam([-2.8, 0.04, 11.5], [-2.8, 0.04, 8.6], 1.2, 0.05, P.gravel);
    // the pond with irregular banks
    b.group({ at: [-4.5, 0, -7.5], scale: [1.6, 1, 1] }, () => b.cyl(2.2, 0.08, P.water, { segs: 9, mat: 'glass' }));
    b.group({ at: [-3.2, 0, -6.8], scale: [1.2, 1, 1] }, () => b.cyl(1.5, 0.081, P.water, { segs: 7, mat: 'glass' }));
    // the round garden temple
    b.cyl(1.9, 0.5, trav, { at: [7.5, 0, -9.3], segs: 10 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      col(b, 7.5 + 1.5 * Math.sin(a), -9.3 + 1.5 * Math.cos(a), 0.14, 2.6, P.white, { y: 0.5, cap: 'ionic', segs: 6 });
    }
    b.cyl(1.8, 0.4, P.white, { at: [7.5, 3.1, -9.3], segs: 10 });
    b.dome(1.8, P.lead, { at: [7.5, 3.5, -9.3], segs: 10, squash: 0.55 });
    b.collider(3.8, 3.8, { at: [7.5, 0, -9.3] });
    // clumps of trees
    b.tree(7.5, { kind: 'pine', at: [-7.5, 0, -8.8] });
    b.tree(7.5, { kind: 'pine', at: [-8.4, 0, 3.5] });
    for (const [x, z] of [[10.5, -5.5], [10.5, -3.5], [-10.8, 10.5], [10.6, 10.6]]) b.tree(7, { kind: 'cypress', at: [x, 0, z] });
    b.tree(6, { kind: 'round', at: [-1.0, 0, -10.8], color: P.leafDark });
    b.tree(5, { kind: 'olive', at: [4.0, 0, -10.0] });
    for (const [x, z] of [[-6.5, 9.5], [6.6, 9.6], [-0.5, -5.6]]) b.blob(0.8, P.hedge, { at: [x, 0.5, z], stretch: [1.2, 0.8, 1] });
    // gate piers on the road
    b.sym((s) => {
      b.box(0.8, 2.4, 0.8, trav, { at: [s * 4.2, 0, 12.2] });
      b.lathe([[0.01, 0], [0.32, 0.1], [0.38, 0.4], [0.16, 0.8], [0.01, 0.9]], trav, { at: [s * 4.2, 2.4, 12.2], segs: 6 });
      b.box(6.6, 0.8, 0.35, trav, { at: [s * 8.0, 0, 12.2] });
      for (let i = 0; i < 12; i++) b.box(0.05, 1.0, 0.05, P.iron, { at: [s * (5.0 + i * 0.55), 0.8, 12.2] });
    });
  },
};
