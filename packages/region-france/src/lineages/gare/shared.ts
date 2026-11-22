import * as THREE from 'three';
import { P, facingAngle, mix, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/*
 * Local helpers for the gare lineage. The street front is +Z; behind the building a platform runs
 * along X and two tracks lie beyond it, at exactly the same places as Italy's station (the open line
 * joins them). The plot is 40 × 24 (x ±20, z ±12).
 */

export type XY = [number, number];
export const HX = 20;
/** Centre lines of the two tracks; trains stand on the first, beside the platform. */
export const TRACKS = [-8.5, -10.75];
export const GAUGE = 1.435;
/** Height of the platform top, and its edge. */
export const PLAT = { y: 0.55, edge: -7.0 };

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

/** Ballast, sleepers and rails for one track along X (the same as Italy's, so the lines meet). */
export function track(b: Builder, z: number, x0 = -HX, x1 = HX, o?: { sleeper?: number }): void {
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(L, 0.18, 2.3, mix(P.gravel, P.concreteDark, 0.3), { at: [xc, 0, z], jitter: false });
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

/** The platform: a raised paved strip along X with a coping and a white line, walkable (a deck). */
export function platform(b: Builder, z0: number, z1: number, x0: number, x1: number, o?: { top?: number; edge?: number }): void {
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  const d = Math.abs(z1 - z0);
  const zc = (z0 + z1) / 2;
  b.box(L, PLAT.y - 0.1, d, tint(P.concrete, -0.05), { at: [xc, 0, zc] });
  b.box(L, 0.1, d, o?.top ?? P.paving, { at: [xc, PLAT.y - 0.1, zc], jitter: false });
  const ze = Math.min(z0, z1);
  b.box(L, 0.12, 0.5, o?.edge ?? P.pierreBlonde, { at: [xc, PLAT.y - 0.1, ze + 0.25], jitter: false });
  b.box(L, 0.01, 0.1, P.white, { at: [xc, PLAT.y + 0.02, ze + 0.75], jitter: false });
  b.deck(L, d, PLAT.y, { at: [xc, 0, zc] });
}

/** Flat rectangles [u, y, w, h] on a wall plane through `at` facing `facing`, in one mesh. */
export function wallRects(b: Builder, rects: [number, number, number, number][], color: number, at: Vec3, facing: Facing, push = 0.04, mat?: 'matte' | 'glass'): void {
  const a = facingAngle(facing);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const P3 = (u: number, y: number): number[] => [at[0] + u * c + push * s, y, at[2] - u * s + push * c];
  const out: number[] = [];
  for (const [u, y, w, h] of rects) quad(out, P3(u - w / 2, y), P3(u + w / 2, y), P3(u + w / 2, y + h), P3(u - w / 2, y + h));
  soup(b, out, color, { mat });
}

/** A round-headed panel (door, window, blind arch) standing `depth` proud of a wall. */
export function archPanel(b: Builder, w: number, h: number, color: number, o: { at?: Vec3; facing?: Facing; depth?: number; mat?: 'matte' | 'glass'; n?: number }): void {
  const a = w / 2;
  const hs = Math.max(0, h - a);
  const n = o.n ?? 6;
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

/** A clock face with hands, on a wall. `at` is the bottom of the face. */
export function clock(b: Builder, d: number, at: Vec3, o?: { facing?: Facing; rim?: number }): void {
  b.panel(d + 0.24, d + 0.24, o?.rim ?? P.castIron, { at: [at[0], at[1] - 0.12, at[2]], facing: o?.facing, shape: 'circle', depth: 0.06 });
  b.panel(d, d, P.white, { at, facing: o?.facing, shape: 'circle', depth: 0.09 });
  b.group({ at: [at[0], at[1] + d / 2, at[2]], rotY: facingAngle(o?.facing) }, () => {
    b.box(0.07, d * 0.38, 0.03, P.black, { at: [0, 0, 0.11], jitter: false });
    b.box(d * 0.3, 0.06, 0.03, P.black, { at: [d * 0.14, 0, 0.11], jitter: false });
  });
}

// ------------------------------------------------------------------ rolling stock

/** A pair of rail wheels on an axle at local x, for a vehicle centred on its track. */
function wheels(b: Builder, x: number, r: number, color: number): void {
  for (const s of [-1, 1]) b.log(r, 0.12, color, { at: [x, 0.28, (s * GAUGE) / 2 + s * 0.06], axis: 'z', segs: 10 });
}

/** A short four-wheeled carriage body, three compartments with a door each, facing either way. */
function carriage(b: Builder, x: number, L: number, body: number, roof: number, o: { lamps?: boolean } = {}): void {
  b.group({ at: [x, 0, 0] }, () => {
    b.box(L + 0.3, 0.3, 2.3, P.black, { at: [0, 0.95, 0] });
    b.box(L, 1.9, 2.5, body, { at: [0, 1.25, 0] });
    b.vault(2.6, L + 0.1, roof, { at: [0, 3.15, 0], axis: 'x', squash: 0.2 });
    const n = Math.max(2, Math.round(L / 2.2));
    for (const s of [-1, 1]) {
      const f = s > 0 ? '+z' : '-z';
      for (let i = 0; i < n; i++) {
        const cx = -L / 2 + (i + 0.5) * (L / n);
        b.panel(0.7, 1.6, tint(body, -0.1), { at: [cx, 1.35, s * 1.25], facing: f, depth: 0.04 });
        b.panel(0.5, 0.55, P.windowDark, { at: [cx, 2.15, s * 1.25], facing: f, depth: 0.06 });
        b.panel(0.45, 0.5, P.windowDark, { at: [cx + 0.6, 2.15, s * 1.25], facing: f, depth: 0.06 });
        b.panel(0.45, 0.5, P.windowDark, { at: [cx - 0.6, 2.15, s * 1.25], facing: f, depth: 0.06 });
      }
    }
    for (const wx of [-L * 0.3, L * 0.3]) wheels(b, wx, 0.5, P.black);
    if (o.lamps) for (const lx of [-L * 0.25, L * 0.25]) b.cyl(0.12, 0.3, P.black, { at: [lx, 3.55, 0], segs: 5 });
  });
}

/**
 * A Crampton locomotive of about 1850, facing -X, with its tender and two carriages: a long low boiler
 * and one pair of very large driving wheels behind the firebox, the type that made the Paris to Lille
 * run fast. `at` is the front buffer beam's position on the track centre line.
 */
export function cramptonTrain(b: Builder, at: Vec3): void {
  const green = mix(P.doorGreen, P.black, 0.3);
  const brass = P.gold;
  b.group({ at }, () => {
    b.group({ at: [3.6, 0, 0] }, () => {
      b.box(6.6, 0.3, 2.2, P.black, { at: [0, 0.75, 0] });
      b.box(0.25, 0.55, 2.6, P.doorRed, { at: [-3.35, 0.65, 0] });
      b.log(0.6, 4.2, green, { at: [-0.9, 1.05, 0], segs: 12 }); // the low boiler
      for (const x of [-2.4, -1.0, 0.4]) b.log(0.62, 0.08, brass, { at: [x, 1.03, 0], segs: 12 });
      b.box(0.7, 1.5, 1.4, P.black, { at: [-3.0, 0.9, 0] }); // smokebox
      b.cyl(0.18, 1.7, P.black, { at: [-3.0, 2.4, 0], segs: 8, rTop: 0.24 }); // tall chimney
      b.cyl(0.28, 0.12, P.black, { at: [-3.0, 4.1, 0], segs: 8 });
      b.cyl(0.28, 0.5, brass, { at: [-0.9, 2.25, 0], segs: 8 }); // dome
      b.dome(0.28, brass, { at: [-0.9, 2.75, 0], segs: 8 });
      b.box(1.3, 1.7, 2.0, green, { at: [1.75, 0.95, 0] }); // firebox
      // the cab: just a spectacle plate, open behind, as on early French engines
      b.box(0.12, 2.0, 2.3, green, { at: [2.55, 1.05, 0] });
      b.box(1.2, 0.08, 2.3, P.black, { at: [3.05, 3.05, 0] });
      b.sym((s) => b.panel(0.35, 0.35, P.windowDark, { at: [2.48, 2.2, s * 0.55], facing: '-x', shape: 'circle', depth: 0.03 }));
      // small carrying wheels in front and under the middle, the great driving pair at the back
      wheels(b, -2.4, 0.55, P.black);
      wheels(b, -0.6, 0.55, P.black);
      b.sym((s) => b.log(1.05, 0.14, P.doorRed, { at: [2.6, -0.22, s * 1.08], axis: 'z', segs: 16 }));
      b.sym((s) => b.log(0.22, 0.2, P.black, { at: [2.6, 0.62, s * 1.08], axis: 'z', segs: 8 }));
      // the splasher over the big wheel, outside cylinders and their rods
      b.sym((s) => b.box(2.0, 0.15, 0.2, P.steel, { at: [1.2, 0.9, s * 1.25], jitter: false }));
      b.sym((s) => b.log(0.22, 1.0, P.black, { at: [0.0, 0.7, s * 1.25], segs: 8 }));
    });
    // tender
    b.group({ at: [9.0, 0, 0] }, () => {
      b.box(3.8, 0.3, 2.2, P.black, { at: [0, 0.75, 0] });
      b.box(3.6, 1.2, 2.2, green, { at: [0, 1.05, 0] });
      b.box(3.0, 0.4, 1.8, P.black, { at: [0, 2.25, 0] });
      for (const x of [-1.2, 1.2]) wheels(b, x, 0.5, P.black);
    });
    const yellow = mix(P.ochreWash, P.oak, 0.25);
    carriage(b, 15.0, 6.6, yellow, P.black, { lamps: true });
    carriage(b, 22.3, 6.6, mix(P.doorGreen, P.oak, 0.4), P.black, { lamps: true });
  });
}

/** A four-coupled express engine of the 1890s (two pairs of big wheels behind a bogie), its tender and two bogie coaches. */
export function nineties(b: Builder, at: Vec3): void {
  const brown = mix(P.oakDark, P.doorRed, 0.3);
  b.group({ at }, () => {
    b.group({ at: [4.4, 0, 0] }, () => {
      b.box(8.0, 0.35, 2.4, P.black, { at: [0, 0.95, 0] });
      b.box(0.3, 0.6, 2.7, P.doorRed, { at: [-4.1, 0.8, 0] });
      b.log(0.78, 5.0, brown, { at: [-0.6, 1.4, 0], segs: 12 });
      b.box(1.1, 1.75, 1.7, P.black, { at: [-3.4, 1.3, 0] });
      b.cyl(0.26, 1.05, P.black, { at: [-3.4, 3.05, 0], segs: 8 });
      b.cyl(0.36, 0.55, P.gold, { at: [-0.3, 2.95, 0], segs: 8 });
      b.dome(0.3, P.gold, { at: [-0.3, 3.5, 0], segs: 8 });
      b.box(2.0, 2.5, 2.5, brown, { at: [2.9, 1.3, 0] }); // cab
      b.box(2.4, 0.12, 2.7, P.black, { at: [3.0, 3.8, 0] });
      b.sym((s) => b.panel(0.6, 0.75, P.windowDark, { at: [3.0, 2.5, s * 1.25], facing: s > 0 ? '+z' : '-z' }));
      for (const x of [-3.2, -2.2]) wheels(b, x, 0.48, P.black); // the bogie
      for (const x of [0.2, 2.2]) wheels(b, x, 1.0, brown); // two big coupled wheels
      b.sym((s) => b.box(2.2, 0.1, 0.08, P.steel, { at: [1.2, 1.25, s * 1.32], jitter: false }));
    });
    b.group({ at: [11.4, 0, 0] }, () => {
      b.box(5.2, 0.3, 2.4, P.black, { at: [0, 0.95, 0] });
      b.box(5.0, 1.7, 2.4, brown, { at: [0, 1.25, 0] });
      b.box(4.4, 0.4, 2.0, P.black, { at: [0, 2.95, 0] });
      for (const x of [-1.8, 0, 1.8]) wheels(b, x, 0.5, P.black);
    });
    for (const cx of [20.3, 32.3]) {
      b.group({ at: [cx, 0, 0] }, () => {
        const L = 11.6;
        b.box(L, 2.3, 2.7, mix(P.doorGreen, P.black, 0.2), { at: [0, 1.15, 0] });
        b.vault(2.8, L + 0.1, P.castIron, { at: [0, 3.45, 0], axis: 'x', squash: 0.25 });
        for (const s of [-1, 1]) {
          const rects: [number, number, number, number][] = [];
          for (let i = 0; i < 8; i++) rects.push([-L / 2 + 0.8 + i * 1.43, 2.25, 0.8, 0.75]);
          wallRects(b, rects, P.windowDark, [0, 0, s * 1.35], s > 0 ? '+z' : '-z', 0.02);
        }
        for (const x of [-L / 2 + 1.8, L / 2 - 1.8]) {
          b.box(2.4, 0.4, 2.2, P.black, { at: [x, 0.5, 0] });
          for (const dx of [-0.7, 0.7]) wheels(b, x + dx, 0.45, P.black);
        }
      });
    }
  });
}

/** A Pacific express engine of the 1920s (bogie, three coupled wheels, trailing pair) with smoke deflectors, tender and two steel coaches. */
export function pacificTrain(b: Builder, at: Vec3): void {
  const brown = mix(P.oakDark, P.doorRed, 0.35);
  b.group({ at }, () => {
    b.group({ at: [6.0, 0, 0] }, () => {
      b.box(11.6, 0.4, 2.5, P.black, { at: [0, 1.0, 0] });
      b.box(0.3, 0.6, 2.8, P.doorRed, { at: [-5.9, 0.8, 0] });
      b.log(0.88, 7.4, brown, { at: [-1.2, 1.55, 0], segs: 12 });
      b.box(1.0, 1.95, 1.9, P.black, { at: [-5.0, 1.4, 0] });
      b.cyl(0.3, 0.5, P.black, { at: [-4.9, 3.3, 0], segs: 8 });
      b.cyl(0.35, 0.4, brown, { at: [-1.2, 3.25, 0], segs: 8 });
      b.sym((s) => b.box(2.0, 1.6, 0.06, P.black, { at: [-4.6, 1.95, s * 1.15] })); // smoke deflectors
      b.box(2.4, 2.6, 2.8, brown, { at: [4.2, 1.3, 0] }); // cab
      b.box(2.8, 0.12, 3.0, P.black, { at: [4.3, 3.9, 0] });
      b.sym((s) => b.panel(0.7, 0.8, P.windowDark, { at: [4.2, 2.6, s * 1.4], facing: s > 0 ? '+z' : '-z' }));
      for (const x of [-4.6, -3.6]) wheels(b, x, 0.48, P.black);
      for (const x of [-2.0, -0.1, 1.8]) wheels(b, x, 0.95, P.black);
      wheels(b, 3.6, 0.55, P.black);
      b.sym((s) => b.box(3.8, 0.1, 0.08, P.steel, { at: [-0.1, 1.1, s * 1.35], jitter: false }));
      b.sym((s) => b.log(0.32, 1.2, P.black, { at: [-3.6, 0.95, s * 1.25], segs: 8 }));
    });
    b.group({ at: [16.0, 0, 0] }, () => {
      b.box(7.2, 0.35, 2.6, P.black, { at: [0, 0.95, 0] });
      b.box(7.0, 2.1, 2.7, brown, { at: [0, 1.3, 0] });
      for (const x of [-2.6, -1.6, 1.6, 2.6]) wheels(b, x, 0.48, P.black);
    });
    for (const cx of [27.0]) {
      b.group({ at: [cx, 0, 0] }, () => {
        const L = 13.4;
        b.box(L, 2.5, 2.8, mix(P.doorGreen, P.black, 0.35), { at: [0, 1.1, 0] });
        b.vault(2.9, L + 0.1, P.castIron, { at: [0, 3.55, 0], axis: 'x', squash: 0.25 });
        for (const s of [-1, 1]) {
          const rects: [number, number, number, number][] = [];
          for (let i = 0; i < 9; i++) rects.push([-L / 2 + 0.9 + i * 1.46, 2.3, 1.0, 0.85]);
          wallRects(b, rects, P.windowDark, [0, 0, s * 1.4], s > 0 ? '+z' : '-z', 0.02);
        }
        for (const x of [-L / 2 + 2, L / 2 - 2]) {
          b.box(2.6, 0.4, 2.2, P.black, { at: [x, 0.5, 0] });
          for (const dx of [-0.8, 0.8]) wheels(b, x + dx, 0.45, P.black);
        }
      });
    }
  });
}

/** A TGV of the 2000s: a power car with a long nose and two articulated coaches, facing -X. */
export function tgv(b: Builder, at: Vec3, len = 39): void {
  const silver = mix(P.aluminium, P.steel, 0.35);
  const dark = mix(P.cladGrey, P.cladBlue, 0.3);
  const W = 2.9;
  const H = 4.0;
  b.group({ at }, () => {
    const nose: XY[] = [[0, 0.9], [0.4, 0.6], [7.0, 0.6], [7.0, H], [5.2, H], [2.0, 2.4], [0.3, 1.5]];
    b.extrude(nose, W, silver);
    b.extrude([[2.1, 2.42], [5.15, 3.92], [4.7, 4.02], [1.7, 2.6]], W - 0.4, P.glassDark, { mat: 'glass' });
    b.sym((s) => b.box(6.2, 0.55, 0.04, dark, { at: [3.9, 1.25, s * (W / 2 + 0.01)], jitter: false }));
    const L = len - 7;
    b.box(L, H - 0.6, W, silver, { at: [7 + L / 2, 0.6, 0] });
    b.sym((s) => b.box(L - 1.2, 0.8, 0.04, P.glassDark, { at: [7.6 + (L - 1.2) / 2, 2.2, s * (W / 2 + 0.01)], mat: 'glass', jitter: false }));
    b.sym((s) => b.box(L, 0.55, 0.05, dark, { at: [7 + L / 2, 1.25, s * (W / 2 + 0.02)], jitter: false }));
    b.box(L - 0.4, 0.15, W - 0.5, tint(silver, -0.1), { at: [7 + L / 2, H, 0] });
    for (const gx of [17.5, 36]) b.box(0.4, H - 0.8, W + 0.06, P.black, { at: [gx, 0.75, 0], jitter: false });
    // pantograph on the power car
    b.group({ at: [12, H + 0.15, 0] }, () => {
      b.beam([-0.8, 0, 0], [0.2, 1.0, 0], 0.08, 0.08, P.steel);
      b.beam([0.2, 1.0, 0], [-0.6, 1.6, 0], 0.06, 0.06, P.steel);
      b.box(0.15, 0.06, 1.6, P.steel, { at: [-0.6, 1.6, 0] });
    });
    // bogies: under the power car, and shared between coaches (the articulated train)
    for (const x of [3.8, 14.5, 17.5, 36]) {
      b.box(2.6, 0.45, 2.4, P.black, { at: [x, 0.3, 0] });
      for (const dx of [-0.8, 0.8]) wheels(b, x + dx, 0.45, P.black);
    }
  });
}

/** Overhead line: masts on the far side with a contact wire over the given track. */
export function catenary(b: Builder, z: number, xs: number[], mastZ: number, top = 6.2): void {
  for (const x of xs) {
    b.box(0.25, top + 0.6, 0.25, P.steel, { at: [x, 0, mastZ] });
    b.beam([x, top + 0.2, mastZ], [x, top + 0.2, z - 0.4], 0.1, 0.12, P.steel);
  }
  const xc = (xs[0] + xs[xs.length - 1]) / 2;
  const L = xs[xs.length - 1] - xs[0];
  b.box(L, 0.03, 0.03, P.iron, { at: [xc, top - 0.4, z], jitter: false });
  b.box(L, 0.03, 0.03, P.iron, { at: [xc, top + 0.1, z], jitter: false });
}
