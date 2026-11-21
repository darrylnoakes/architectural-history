import type { Builder } from './builder';
import { P, tint } from './palette';

/** A parked car of one of three generations, about 4 m long, nose toward local +Z. */
export function car(b: Builder, style: 'thirties' | 'sixties' | 'modern', color: number, at: [number, number, number], rotY: number) {
  b.group({ at, rotY }, () => {
    const tyre = 0x1d1d1f;
    if (style === 'thirties') {
      b.box(1.45, 0.55, 3.7, color, { at: [0, 0.42, 0] });
      b.box(1.35, 0.72, 1.9, color, { at: [0, 0.97, -0.35] });
      b.box(1.2, 0.5, 1.0, tint(color, 0.03), { at: [0, 0.97, 1.25] });
      b.panel(1.1, 0.42, P.windowDark, { at: [0, 1.15, 0.6], facing: '+z' });
      b.sym((s) => {
        b.panel(1.5, 0.4, P.windowDark, { at: [s * 0.675, 1.15, -0.35], facing: s > 0 ? '+x' : '-x' });
        b.box(0.3, 0.12, 4.1, 0x18181a, { at: [s * 0.82, 0.5, 0] });
        b.sphere(0.13, 0xe8e2c0, { at: [s * 0.45, 0.95, 1.8], segs: 6 });
      });
      for (const z of [-1.25, 1.3]) b.sym((s) => b.log(0.36, 0.2, tyre, { at: [s * 0.78, 0, z], segs: 8 }));
      return;
    }
    const L = style === 'sixties' ? 3.9 : 4.2;
    const W = style === 'sixties' ? 1.5 : 1.75;
    b.box(W, 0.55, L, color, { at: [0, 0.3, 0] });
    if (style === 'sixties') {
      b.box(W - 0.12, 0.5, L * 0.48, tint(color, 0.05), { at: [0, 0.85, -0.15] });
      b.sym((s) => b.panel(L * 0.42, 0.34, P.windowDark, { at: [s * (W / 2 - 0.06), 0.93, -0.15], facing: s > 0 ? '+x' : '-x' }));
      b.panel(W - 0.3, 0.34, P.windowDark, { at: [0, 0.93, L * 0.24 - 0.15], facing: '+z' });
      b.panel(W - 0.3, 0.34, P.windowDark, { at: [0, 0.93, -L * 0.24 - 0.15], facing: '-z' });
      b.box(W + 0.06, 0.1, 0.12, P.aluminium, { at: [0, 0.34, L / 2] });
      b.box(W + 0.06, 0.1, 0.12, P.aluminium, { at: [0, 0.34, -L / 2] });
    } else {
      // a wedge-fronted hatchback: the cabin is one extruded profile
      b.extrude(
        [[-L * 0.42, 0], [L * 0.3, 0], [L * 0.12, 0.58], [-L * 0.34, 0.6]],
        W - 0.14,
        tint(color, 0.02),
        { at: [0, 0.85, 0], rotY: -Math.PI / 2 },
      );
      b.sym((s) => b.panel(L * 0.5, 0.36, P.glassDark, { at: [s * (W / 2 - 0.07), 0.93, -0.25], facing: s > 0 ? '+x' : '-x' }));
    }
    for (const z of [-L * 0.3, L * 0.31]) b.sym((s) => b.log(0.32, 0.22, tyre, { at: [s * (W / 2 - 0.08), 0, z], segs: 8 }));
  });
}

/** A street lamp: a cast-iron gas standard or a tall steel column with its arm toward local +Z. */
export function lamp(b: Builder, style: 'gas' | 'modern', at: [number, number, number], rotY: number) {
  b.group({ at, rotY }, () => {
    if (style === 'gas') {
      b.cyl(0.11, 0.5, P.castIron, { segs: 6 });
      b.cyl(0.06, 3.1, P.castIron, { segs: 6 });
      b.box(0.5, 0.04, 0.04, P.castIron, { at: [0, 2.7, 0] });
      b.cyl(0.14, 0.42, P.windowLit, { at: [0, 3.1, 0], rTop: 0.22, segs: 4 });
      b.cone(0.26, 0.2, P.castIron, { at: [0, 3.52, 0], segs: 4 });
    } else {
      b.cyl(0.09, 7.5, P.steel, { segs: 6, rTop: 0.06 });
      b.box(0.1, 0.08, 1.6, P.steel, { at: [0, 7.5, 0.7] });
      b.box(0.24, 0.1, 0.6, P.aluminium, { at: [0, 7.42, 1.35] });
    }
  });
}
