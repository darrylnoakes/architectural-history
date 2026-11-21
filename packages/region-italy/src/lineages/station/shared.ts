import * as THREE from 'three';
import { P, facingAngle, mix, tint, type Builder, type Facing } from '@ah/kit';

/*
 * Local helpers for the station lineage. The street front is +Z; behind the building a platform
 * runs along X and two tracks lie beyond it. The plot is 40 × 24 (x ±20, z ±12).
 */

export type XY = [number, number];
export const HX = 20;
/** Centre lines of the two tracks; trains stand on the first, beside the platform. */
export const TRACKS = [-8.5, -10.75];
export const GAUGE = 1.435;
/** Height of the platform top, and its edge. */
export const PLAT = { y: 0.55, edge: -7.0 };

/** Ballast, sleepers and rails for one track along X. */
export function track(b: Builder, z: number, x0 = -HX, x1 = HX, o?: { sleeper?: number }): void {
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, 0.18, 2.3, mix(P.gravel, P.concreteDark, 0.3), { at: [xc, 0, z], jitter: false });
  // sleepers as a single cheap mesh: top and the two long faces of each
  const out: number[] = [];
  const hw = 1.1;
  for (let x = x0 + 0.4; x < x1; x += 0.8) {
    const a = x - 0.12;
    const c = x + 0.12;
    const y0 = 0.18;
    const y1 = 0.28;
    quad(out, [a, y1, z - hw], [c, y1, z - hw], [c, y1, z + hw], [a, y1, z + hw]);
    quad(out, [a, y0, z - hw], [a, y1, z - hw], [a, y1, z + hw], [a, y0, z + hw]);
    quad(out, [c, y0, z - hw], [c, y0, z + hw], [c, y1, z + hw], [c, y1, z - hw]);
  }
  soup(b, out, o?.sleeper ?? mix(P.oakDark, P.concreteDark, 0.3));
  for (const s of [-1, 1]) b.box(L, 0.15, 0.08, P.steel, { at: [xc, 0.28, z + (s * GAUGE) / 2], jitter: false });
}

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: { mat?: 'matte' | 'glass' }): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { mat: o?.mat, jitter: false });
}

/** Push a quad (a, b, c, d in order round its edge) as two triangles. */
export function quad(out: number[], a: number[], b: number[], c: number[], d: number[]): void {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/** The platform: a raised paved strip along X with a coping and a white safety line at the edge. */
export function platform(b: Builder, z0: number, z1: number, x0: number, x1: number, o?: { top?: number; edge?: number }): void {
  const top = o?.top ?? P.paving;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  const d = Math.abs(z1 - z0);
  const zc = (z0 + z1) / 2;
  b.box(L, PLAT.y - 0.1, d, tint(P.concrete, -0.05), { at: [xc, 0, zc] });
  b.box(L, 0.1, d, top, { at: [xc, PLAT.y - 0.1, zc], jitter: false });
  const ze = Math.min(z0, z1);
  b.box(L, 0.12, 0.5, o?.edge ?? P.travertine, { at: [xc, PLAT.y - 0.1, ze + 0.25], jitter: false });
  b.box(L, 0.01, 0.1, P.white, { at: [xc, PLAT.y + 0.02, ze + 0.75], jitter: false });
  b.deck(L, d, PLAT.y, { at: [xc, 0, zc] });
}

/** An arched panel (door, window, blind arch) standing `depth` proud of a wall. */
export function archPanel(
  b: Builder,
  w: number,
  h: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; depth?: number; mat?: 'matte' | 'glass'; n?: number },
): void {
  // a low-poly round-headed outline: straight jambs and an n-segment semicircle
  const a = w / 2;
  const hs = Math.max(0, h - a);
  const n = o.n ?? 5;
  const pts: XY[] = [[-a, 0], [a, 0]];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI;
    pts.push([a * Math.cos(t), hs + a * Math.sin(t)]);
  }
  const depth = o.depth ?? 0.06;
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(pts, depth + 0.03, color, { at: [0, 0, (depth - 0.03) / 2], mat: o.mat, jitter: false });
  });
}

/** A wall along X pierced right through by round-arched openings reaching the ground. */
export function arcadeWall(
  b: Builder,
  w: number,
  h: number,
  t: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; n: number; openW: number; openH: number },
): void {
  const pitch = w / o.n;
  const pts: XY[] = [[-w / 2, 0]];
  for (let i = 0; i < o.n; i++) {
    const xc = -w / 2 + (i + 0.5) * pitch;
    const a = o.openW / 2;
    const hs = o.openH - a;
    pts.push([xc - a, 0], [xc - a, hs]);
    for (let k = 1; k < 8; k++) {
      const t = Math.PI - (k / 8) * Math.PI;
      pts.push([xc + a * Math.cos(t), hs + a * Math.sin(t)]);
    }
    pts.push([xc + a, hs], [xc + a, 0]);
  }
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => b.extrude(pts, t, color));
}

/** A clock face with hands, on a wall. */
export function clock(b: Builder, d: number, at: [number, number, number], o?: { facing?: Facing; rim?: number }): void {
  b.panel(d + 0.2, d + 0.2, o?.rim ?? P.castIron, { at: [at[0], at[1] - 0.1, at[2]], facing: o?.facing, shape: 'circle', depth: 0.06 });
  b.panel(d, d, P.white, { at, facing: o?.facing, shape: 'circle', depth: 0.09 });
  b.group({ at: [at[0], at[1] + d / 2, at[2]], rotY: facingAngle(o?.facing) }, () => {
    b.box(0.06, d * 0.36, 0.03, P.black, { at: [0, 0, 0.11], jitter: false });
    b.box(d * 0.28, 0.05, 0.03, P.black, { at: [d * 0.14, 0, 0.11], jitter: false });
  });
}

// ------------------------------------------------------------------ rolling stock

/** A pair of rail wheels on an axle at local x, for a vehicle centred on its track. */
function wheels(b: Builder, x: number, r: number, color: number): void {
  for (const s of [-1, 1]) b.log(r, 0.12, color, { at: [x, 0.28, (s * GAUGE) / 2 + s * 0.06], axis: 'z', segs: 8 });
}

/** A small steam locomotive with its tender and one four-wheeled carriage, facing -X. */
export function steamTrain(b: Builder, at: [number, number, number]): void {
  const green = mix(P.doorGreen, P.black, 0.35);
  const brass = P.gold;
  const red = P.doorRed;
  b.group({ at }, () => {
    // locomotive, its front at x = 0
    b.group({ at: [4.2, 0, 0] }, () => {
      b.box(7.2, 0.35, 2.4, P.black, { at: [0, 1.0, 0] }); // frame
      b.box(0.3, 0.6, 2.7, red, { at: [-3.65, 0.85, 0] }); // buffer beam
      b.sym((s) => b.log(0.15, 0.4, P.black, { at: [-3.95, 0.95, s * 0.85], segs: 6 }));
      b.log(0.75, 4.4, green, { at: [-0.6, 1.35, 0], segs: 12 }); // boiler
      b.box(1.0, 1.65, 1.6, P.black, { at: [-3.1, 1.35, 0] }); // smokebox
      b.log(0.82, 0.12, brass, { at: [-2.55, 1.28, 0], segs: 12 });
      b.cyl(0.24, 1.3, P.black, { at: [-3.1, 2.95, 0], segs: 8, rTop: 0.42 }); // chimney
      b.cyl(0.45, 0.12, P.black, { at: [-3.1, 4.25, 0], segs: 8 });
      b.cyl(0.32, 0.55, brass, { at: [-0.6, 2.8, 0], segs: 8, rTop: 0.22 }); // dome
      b.dome(0.24, brass, { at: [-0.6, 3.35, 0], segs: 8 });
      b.cyl(0.18, 0.5, brass, { at: [0.9, 2.8, 0], segs: 6 }); // safety valves
      // cab with spectacle plates and a roof
      b.box(1.9, 2.2, 2.4, green, { at: [2.45, 1.35, 0] });
      b.box(2.4, 0.12, 2.6, P.black, { at: [2.55, 3.55, 0] });
      b.sym((s) => b.panel(0.6, 0.8, P.windowDark, { at: [2.6, 2.3, s * 1.2], facing: s > 0 ? '+z' : '-z' }));
      b.sym((s) => b.box(4.0, 0.9, 0.12, P.black, { at: [-0.9, 1.35, s * 1.2] })); // running boards and splashers
      // three coupled driving wheels and a leading pair
      for (const x of [-2.3, -0.6, 1.1]) wheels(b, x, 0.75, P.doorRed);
      b.sym((s) => b.box(3.6, 0.1, 0.08, P.steel, { at: [-0.6, 0.98, s * 1.36], jitter: false })); // coupling rods
    });
    // tender
    b.group({ at: [10.5, 0, 0] }, () => {
      b.box(4.4, 0.3, 2.4, P.black, { at: [0, 1.0, 0] });
      b.box(4.2, 1.5, 2.4, green, { at: [0, 1.3, 0] });
      b.box(3.6, 0.5, 2.0, P.black, { at: [0, 2.8, 0] }); // coal
      for (const x of [-1.4, 0, 1.4]) wheels(b, x, 0.5, P.black);
    });
    // a four-wheeled first-class carriage in varnished teak
    b.group({ at: [17.4, 0, 0] }, () => {
      const teak = mix(P.oak, P.cedar, 0.5);
      b.box(7.6, 0.3, 2.5, P.black, { at: [0, 0.95, 0] });
      b.box(7.4, 2.0, 2.6, teak, { at: [0, 1.25, 0] });
      b.vault(2.7, 7.6, P.black, { at: [0, 3.25, 0], axis: 'x', squash: 0.22 });
      for (const s of [-1, 1]) {
        const f = s > 0 ? '+z' : '-z';
        for (const x of [-2.6, 0, 2.6]) {
          b.panel(0.75, 1.6, tint(teak, -0.1), { at: [x - 0.75, 1.35, s * 1.3], facing: f, depth: 0.04 }); // doors
          b.panel(0.55, 0.6, P.windowDark, { at: [x - 0.75, 2.15, s * 1.3], facing: f, depth: 0.06 });
          b.panel(0.9, 0.7, P.windowDark, { at: [x + 0.35, 2.05, s * 1.3], facing: f, depth: 0.06 });
        }
      }
      for (const x of [-2.4, 2.4]) wheels(b, x, 0.5, P.black);
      b.sym((s) => b.cyl(0.12, 0.3, P.black, { at: [s * 1.5, 3.55, 0], segs: 5 })); // oil-lamp tops
    });
  });
}

/** The 1930s diesel railcar nicknamed the Littorina, facing -X: one streamlined car. */
export function littorina(b: Builder, at: [number, number, number]): void {
  const chestnut = mix(P.brickDark, P.oakDark, 0.35);
  const isabella = mix(P.cream, P.ochreWash, 0.3);
  const L = 17;
  b.group({ at }, () => {
    // body: cream above, chestnut below, with rounded ends
    const prof = (y0: number, h: number, color: number, inset: number) => {
      b.box(L - 3, h, 2.75 - inset, color, { at: [0, y0, 0] });
      b.sym((s) => b.group({ at: [s * (L / 2 - 1.5), y0, 0], rotY: s > 0 ? 0 : Math.PI }, () => {
        b.lathe([[1.38 - inset / 2, 0], [1.38 - inset / 2, h]], color, { start: 0, sweep: Math.PI, segs: 8, at: [0, 0, 0], rotY: 0 });
      }));
    };
    b.box(L - 1, 0.35, 2.5, P.black, { at: [0, 0.85, 0] });
    prof(1.2, 1.1, chestnut, 0);
    prof(2.3, 1.05, isabella, 0);
    prof(3.35, 0.35, isabella, 0.25);
    // a low rounded roof
    b.box(L - 3, 0.12, 2.2, P.aluminium, { at: [0, 3.7, 0] });
    b.sym((s) => b.dome(1.1, P.aluminium, { at: [s * (L / 2 - 1.5), 3.7, 0], squash: 0.18, segs: 10 }));
    // windows: a continuous band, and the driver’s windscreens wrapping the ends
    for (const s of [-1, 1]) {
      const f = s > 0 ? '+z' : '-z';
      for (let i = 0; i < 9; i++) b.panel(1.05, 0.72, P.windowDark, { at: [-5.9 + i * 1.48, 2.45, s * 1.38], facing: f, depth: 0.05 });
      b.panel(0.8, 2.0, tint(chestnut, -0.05), { at: [s * 6.4, 1.25, s * 1.38], facing: f, depth: 0.05 });
    }
    b.sym((s) => {
      for (const a of [-0.5, 0, 0.5]) {
        const r = 1.4;
        b.panel(0.7, 0.62, P.windowDark, { at: [s * (L / 2 - 1.5) + s * Math.cos(a) * r, 2.5, Math.sin(a) * r], facing: (s > 0 ? Math.PI / 2 : -Math.PI / 2) - s * a, depth: 0.05 });
      }
      b.panel(0.6, 0.15, P.aluminium, { at: [s * (L / 2 - 0.1), 1.55, 0], facing: s > 0 ? '+x' : '-x', depth: 0.05 });
    });
    // two bogies
    for (const x of [-5.5, 5.5]) {
      b.box(2.4, 0.4, 2.2, P.black, { at: [x, 0.45, 0] });
      for (const dx of [-0.75, 0.75]) wheels(b, x + dx, 0.42, P.black);
    }
  });
}

/** A high-speed train of the 2000s: a power car with a long pointed nose and one coach, facing -X. */
export function highSpeedTrain(b: Builder, at: [number, number, number], len = 36): void {
  const red = P.cladRed;
  const silver = mix(P.aluminium, P.steel, 0.4);
  const dark = P.glassDark;
  b.group({ at }, () => {
    const W = 2.9;
    const H = 3.9;
    // the nose: a wedge tapering to a rounded point, built from an extruded side profile
    const nose: XY[] = [
      [0, 1.0],
      [0.6, 0.7],
      [6.5, 0.7],
      [6.5, H],
      [4.4, H],
      [1.6, 2.1],
      [0.2, 1.45],
    ];
    b.group({ at: [0, 0, 0] }, () => {
      b.extrude(nose, W, silver, { at: [0, 0, 0] });
      // the windscreen band and a red stripe along the side
      b.beam([1.65, 2.25, 0], [4.35, 3.75, 0], W + 0.02, 0.28, dark, { mat: 'glass' });
      b.sym((s) => b.box(6.0, 0.4, 0.04, red, { at: [3.6, 1.3, s * (W / 2 + 0.01)], jitter: false }));
      b.extrude([[0.25, 1.05], [1.6, 1.15], [1.6, 1.6], [0.35, 1.4]], W - 0.6, red, { at: [0, 0, 0] });
    });
    // the long body: silver above, red skirt, a dark band of windows
    const L = len - 6.5;
    b.box(L, H - 0.7, W, silver, { at: [6.5 + L / 2, 0.7, 0] });
    b.box(L, 0.6, W + 0.04, red, { at: [6.5 + L / 2, 0.7, 0], jitter: false });
    b.sym((s) => b.box(L - 1, 0.75, 0.04, dark, { at: [6.5 + L / 2 + 0.5, 2.25, s * (W / 2 + 0.01)], mat: 'glass', jitter: false }));
    b.sym((s) => b.box(L, 0.25, 0.05, red, { at: [6.5 + L / 2, 1.55, s * (W / 2 + 0.02)], jitter: false }));
    b.box(L - 0.4, 0.15, W - 0.5, tint(silver, -0.1), { at: [6.5 + L / 2, H, 0] });
    // the gap between power car and coach
    b.box(0.5, H - 0.9, W + 0.06, P.black, { at: [16, 0.8, 0], jitter: false });
    // pantograph on the power car
    b.group({ at: [11, H + 0.15, 0] }, () => {
      b.beam([-0.8, 0, 0], [0.2, 1.0, 0], 0.08, 0.08, P.steel);
      b.beam([0.2, 1.0, 0], [-0.6, 1.6, 0], 0.06, 0.06, P.steel);
      b.box(0.15, 0.06, 1.6, P.steel, { at: [-0.6, 1.6, 0] });
    });
    // bogies
    for (const x of [3.5, 13.5, 18.5, len - 2.5]) {
      b.box(2.6, 0.45, 2.4, P.black, { at: [x, 0.3, 0] });
      for (const dx of [-0.8, 0.8]) wheels(b, x + dx, 0.45, P.black);
    }
  });
}

/** Overhead line equipment: masts on the far side with a contact wire over the given track. */
export function catenary(b: Builder, z: number, xs: number[], mastZ: number, top = 6.2): void {
  for (const x of xs) {
    b.box(0.25, top + 0.6, 0.25, P.steel, { at: [x, 0, mastZ] });
    b.beam([x, top + 0.2, mastZ], [x, top + 0.2, z - 0.4], 0.1, 0.12, P.steel);
  }
  b.box(xs[xs.length - 1] - xs[0], 0.03, 0.03, P.iron, { at: [(xs[0] + xs[xs.length - 1]) / 2, top - 0.4, z], jitter: false });
  b.box(xs[xs.length - 1] - xs[0], 0.03, 0.03, P.iron, { at: [(xs[0] + xs[xs.length - 1]) / 2, top + 0.1, z], jitter: false });
}
