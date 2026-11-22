import * as THREE from 'three';
import { P, facingAngle, mix, tint, type Builder, type Facing, type Opts } from '@ah/kit';

/*
 * Local helpers for the walls lineage. Every stage shares one layout: the road runs along Z through
 * the origin, the wall runs along X and is cut off at the plot edges (x = ±15), the outside of the
 * town (the field side, where an enemy would come from) is +Z and the town is -Z.
 */

export type XY = [number, number];
export const HALF = 15; // half the plot width

// ------------------------------------------------------------------ raw triangles

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: Opts): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { jitter: false, ...o });
}

/** Push a quad (a, b, c, d in order around its edge) as two triangles. */
export function quad(out: number[], a: number[], b: number[], c: number[], d: number[]): void {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/**
 * A long prism along X from x0 to x1 whose cross-section (in the ZY plane) is `section`, a list of
 * [z, y] points. Used for earth banks, ditches, scarped ramparts and the like. Ends are capped.
 */
export function prismX(b: Builder, x0: number, x1: number, section: XY[], color: number, o?: Opts): void {
  const out: number[] = [];
  const n = section.length;
  for (let i = 0; i < n - 1; i++) {
    const [z0, y0] = section[i];
    const [z1, y1] = section[i + 1];
    quad(out, [x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1]);
  }
  // caps: fan from the first point (the section must be convex-ish or listed so that a fan works)
  for (let i = 1; i < n - 1; i++) {
    out.push(x0, section[0][1], section[0][0], x0, section[i][1], section[i][0], x0, section[i + 1][1], section[i + 1][0]);
    out.push(x1, section[0][1], section[0][0], x1, section[i + 1][1], section[i + 1][0], x1, section[i][1], section[i][0]);
  }
  soup(b, out, color, o);
}

// ------------------------------------------------------------------ arches

/** Outline of an arched opening w wide and h tall (to the apex), as a closed list of points. */
export function archOutline(w: number, h: number, shape: 'round' | 'pointed' | 'rect' = 'round', n = 4): XY[] {
  const a = w / 2;
  if (shape === 'rect') return [[-a, 0], [a, 0], [a, h], [-a, h]];
  const pts: XY[] = [[-a, 0], [a, 0]];
  if (shape === 'round') {
    const hs = Math.max(0, h - a);
    const m = n * 2;
    for (let i = 0; i <= m; i++) {
      const t = (i / m) * Math.PI;
      pts.push([a * Math.cos(t), hs + a * Math.sin(t)]);
    }
    return pts;
  }
  const rise = Math.min(h * 0.6, w * 0.866);
  const hs = h - rise;
  const R = (a * a + rise * rise) / (2 * a);
  const phi = Math.atan2(rise, R - a);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * phi;
    pts.push([a - R + R * Math.cos(t), hs + R * Math.sin(t)]);
  }
  pts.push([0, h]);
  for (let i = n - 1; i >= 0; i--) {
    const t = (i / n) * phi;
    pts.push([-(a - R + R * Math.cos(t)), hs + R * Math.sin(t)]);
  }
  return pts;
}

/**
 * A solid wall w wide, h tall, t thick, standing on `at` and facing `facing`, pierced right through by
 * arched openings (centred at `xs`, each openW wide and openH to the apex) that reach the ground.
 */
export function gateMass(
  b: Builder,
  w: number,
  h: number,
  t: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; xs: number[]; openW: number | number[]; openH: number | number[]; shape?: 'round' | 'pointed' | 'rect' },
): void {
  const pts: XY[] = [[-w / 2, 0]];
  o.xs.forEach((xc, i) => {
    const ow = Array.isArray(o.openW) ? o.openW[i] : o.openW;
    const oh = Array.isArray(o.openH) ? o.openH[i] : o.openH;
    const ol = archOutline(ow, oh, o.shape ?? 'round', 5);
    pts.push([xc - ow / 2, 0]);
    for (const [x, y] of ol.slice(2).reverse()) pts.push([xc + x, y]);
    pts.push([xc + ow / 2, 0]);
  });
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => b.extrude(pts, t, color));
}

/**
 * A ring of voussoirs (wedge-shaped arch stones) round a semicircular arch of span w whose springing
 * line is at height `spring`, standing `proud` in front of a wall face at `at` (the face point under
 * the arch's centre). `n` stones (odd, so there is a keystone); alternate stones are tinted.
 */
export function voussoirs(
  b: Builder,
  w: number,
  spring: number,
  ring: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; n?: number; proud?: number; vary?: number; keyExtra?: number },
): void {
  const n = o.n ?? 9;
  const a = w / 2;
  const proud = o.proud ?? 0.12;
  const vary = o.vary ?? 0.04;
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    for (let i = 0; i < n; i++) {
      const t0 = Math.PI - (i / n) * Math.PI;
      const t1 = Math.PI - ((i + 1) / n) * Math.PI;
      const gap = 0.012;
      const ro = a + ring + (i === (n - 1) / 2 ? o.keyExtra ?? 0 : 0);
      const pts: XY[] = [
        [a * Math.cos(t0 - gap), spring + a * Math.sin(t0 - gap)],
        [ro * Math.cos(t0 - gap), spring + ro * Math.sin(t0 - gap)],
        [ro * Math.cos(t1 + gap), spring + ro * Math.sin(t1 + gap)],
        [a * Math.cos(t1 + gap), spring + a * Math.sin(t1 + gap)],
      ];
      const c = tint(color, i % 2 ? -vary : vary * 0.4);
      b.extrude(pts, proud + 0.04, c, { at: [0, 0, proud / 2 - 0.02], jitter: false });
    }
  });
}

/** A cheap arched panel standing `depth` proud of a wall (same placement rules as Builder.panel). */
export function archPanel(
  b: Builder,
  w: number,
  h: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; shape?: 'pointed' | 'round' | 'rect'; depth?: number; mat?: 'matte' | 'glass' },
): void {
  const depth = o.depth ?? 0.06;
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(archOutline(w, h, o.shape ?? 'round', 3), depth + 0.03, color, { at: [0, 0, (depth - 0.03) / 2], mat: o.mat, jitter: false });
  });
}

// ------------------------------------------------------------------ masonry

/**
 * A stretch of wall from x0 to x1, centred on z, `t` thick and `h` tall, laid in courses of big squared
 * blocks (opus quadratum). Every block is its own box running through the wall so both faces show the
 * coursing; blocks are nudged in and out a little and vary in tone, as dry-laid ashlar does.
 */
export function blockWall(
  b: Builder,
  x0: number,
  x1: number,
  z: number,
  t: number,
  h: number,
  color: number,
  o?: { course?: [number, number]; len?: [number, number]; y0?: number; jitterZ?: number; tone?: number; rnd?: () => number },
): void {
  // a private random source keeps the layout deterministic without touching the builder's own
  const rnd = o?.rnd;
  const range = (a: number, c: number) => (rnd ? a + rnd() * (c - a) : b.range(a, c));
  const [cMin, cMax] = o?.course ?? [0.55, 0.75];
  const [lMin, lMax] = o?.len ?? [1.2, 2.0];
  const jz = o?.jitterZ ?? 0.05;
  const tone = o?.tone ?? 0.05;
  let y = o?.y0 ?? 0;
  let row = 0;
  while (y < h - 0.05) {
    const ch = Math.min(h - y, range(cMin, cMax));
    let x = x0;
    // stagger the joints: every other course starts with a part block
    let first = row % 2 ? range(lMin * 0.4, lMin * 0.8) : range(lMin, lMax);
    while (x < x1 - 0.02) {
      const L = Math.min(x1 - x, first);
      first = range(lMin, lMax);
      if (x1 - (x + L) < lMin * 0.35) {
        // do not leave a sliver at the end: stretch this block to the end instead
        const L2 = x1 - x;
        b.box(L2 - 0.03, ch - 0.03, t + range(-jz, jz), tint(color, range(-tone, tone)), { at: [x + L2 / 2, y, z + range(-jz, jz) * 0.5], jitter: false });
        break;
      }
      b.box(L - 0.03, ch - 0.03, t + range(-jz, jz), tint(color, range(-tone, tone)), { at: [x + L / 2, y, z + range(-jz, jz) * 0.5], jitter: false });
      x += L;
    }
    y += ch;
    row++;
  }
}

/** Thin horizontal course lines (mortar joints or brick bonding courses) across a wall face. */
export function courses(
  b: Builder,
  w: number,
  ys: number[],
  color: number,
  o: { at: [number, number, number]; facing?: Facing; h?: number; depth?: number },
): void {
  for (const y of ys) b.panel(w, o.h ?? 0.06, color, { at: [o.at[0], o.at[1] + y, o.at[2]], facing: o.facing, depth: o.depth ?? 0.02 });
}

/** A row of square merlons along X on a wall top (Guelph, square-topped). */
export function merlonsX(b: Builder, x0: number, x1: number, y: number, z: number, color: number, o?: { w?: number; h?: number; t?: number; gap?: number }): void {
  const w = o?.w ?? 0.9;
  const gap = o?.gap ?? 0.7;
  const pitch = w + gap;
  const n = Math.max(1, Math.floor((x1 - x0 + gap) / pitch));
  const used = n * pitch - gap;
  const start = x0 + (x1 - x0 - used) / 2 + w / 2;
  for (let i = 0; i < n; i++) b.box(w, o?.h ?? 1.0, o?.t ?? 0.5, color, { at: [start + i * pitch, y, z], jitter: false });
}

/** The road surface through the plot, along Z. */
export function road(b: Builder, w: number, color: number, o?: { z0?: number; z1?: number; y?: number }): void {
  const z0 = o?.z0 ?? -8;
  const z1 = o?.z1 ?? 8;
  b.box(w, o?.y ?? 0.04, z1 - z0, color, { at: [0, 0, (z0 + z1) / 2], jitter: false });
}

/** Wheel ruts or kerbs: two thin lines along the road. */
export function ruts(b: Builder, gauge: number, color: number, z0 = -8, z1 = 8, y = 0.045): void {
  b.sym((s) => b.box(0.28, 0.01, z1 - z0, color, { at: [s * gauge / 2, y, (z0 + z1) / 2], jitter: false }));
}

/** A pair of plank gate leaves standing open against the jambs of a passage. */
export function gateLeaves(b: Builder, w: number, h: number, z: number, color: number, o?: { open?: number; studs?: boolean }): void {
  const open = o?.open ?? 1.25; // radians swung open
  b.sym((s) => {
    const leaf = w / 2;
    b.group({ at: [s * w / 2, 0, z], rotY: s * open }, () => {
      b.box(leaf, h, 0.14, color, { at: [-s * leaf / 2, 0, 0] });
      // ledges and braces
      for (const y of [0.4, h / 2, h - 0.5]) b.box(leaf - 0.1, 0.16, 0.06, tint(color, -0.08), { at: [-s * leaf / 2, y, -0.09], jitter: false });
      if (o?.studs) for (const y of [0.9, h * 0.75]) b.box(leaf - 0.1, 0.05, 0.04, P.iron, { at: [-s * leaf / 2, y, 0.08], jitter: false });
    });
  });
}

/**
 * A solid of height y0..y1 over a plan polygon of [x, z] points (any order round the edge): earth
 * fills, terrepleins, paved squares.
 */
export function slab(b: Builder, plan: XY[], y0: number, y1: number, color: number, o?: Opts): void {
  b.group({ at: [0, (y0 + y1) / 2, 0], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(plan.map(([x, z]) => [x, -z] as XY), y1 - y0, color, { jitter: o?.jitter ?? false, mat: o?.mat });
  });
}

/**
 * A straight run of rampart from plan point p to q with a cross-section `section` of [d, y] points,
 * where d is measured inward from the outer foot line (the side given by `inward`, a unit plan vector).
 * The section must be convex; ends are capped.
 */
export function run(b: Builder, p: XY, q: XY, inward: XY, section: XY[], color: number, o?: Opts & { clipP?: boolean; clipQ?: boolean }): void {
  const out: number[] = [];
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  const u: XY = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
  // with clipP / clipQ an end is cut square to X (x stays at that end's x) instead of square to the run
  const P0 = (d: number, y: number) => {
    const t = o?.clipP && Math.abs(u[0]) > 1e-6 ? -(inward[0] * d) / u[0] : 0;
    return [p[0] + inward[0] * d + u[0] * t, y, p[1] + inward[1] * d + u[1] * t];
  };
  const P1 = (d: number, y: number) => {
    const t = o?.clipQ && Math.abs(u[0]) > 1e-6 ? -(inward[0] * d) / u[0] : 0;
    return [q[0] + inward[0] * d + u[0] * t, y, q[1] + inward[1] * d + u[1] * t];
  };
  for (let i = 0; i < section.length - 1; i++) {
    const [d0, y0] = section[i];
    const [d1, y1] = section[i + 1];
    quad(out, P0(d0, y0), P1(d0, y0), P1(d1, y1), P0(d1, y1));
  }
  for (let i = 1; i < section.length - 1; i++) {
    out.push(...P0(...section[0]), ...P0(...section[i]), ...P0(...section[i + 1]));
    out.push(...P1(...section[0]), ...P1(...section[i + 1]), ...P1(...section[i]));
  }
  soup(b, out, color, { at: o?.at, rotY: o?.rotY, mat: o?.mat, jitter: o?.jitter });
}

/** Unit vector at right angles to p→q, chosen to point toward `toward`. */
export function inwardOf(p: XY, q: XY, toward: XY): XY {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz) || 1;
  let n: XY = [-dz / L, dx / L];
  const mx = (p[0] + q[0]) / 2;
  const mz = (p[1] + q[1]) / 2;
  if ((toward[0] - mx) * n[0] + (toward[1] - mz) * n[1] < 0) n = [-n[0], -n[1]];
  return n;
}

/** Pointed stakes (a palisade) along X at plan depth z, standing on height y. */
export function stakes(b: Builder, x0: number, x1: number, z: number, y: number, h: number, color: number): void {
  const out: number[] = [];
  const s = 0.34;
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / s));
  const t = 0.16;
  for (let k = 0; k < n; k++) {
    const ax = x0 + ((x1 - x0) * k) / n;
    const bx = x0 + ((x1 - x0) * (k + 1)) / n;
    const mx = (ax + bx) / 2;
    const top = y + h * (0.92 + 0.08 * (((k * 7) % 5) / 4));
    quad(out, [ax, y - 0.4, z + t], [bx, y - 0.4, z + t], [bx, top, z + t], [ax, top, z + t]);
    quad(out, [bx, y - 0.4, z - t], [ax, y - 0.4, z - t], [ax, top, z - t], [bx, top, z - t]);
    out.push(ax, top, z + t, bx, top, z + t, mx, top + 0.42, z);
    out.push(bx, top, z - t, ax, top, z - t, mx, top + 0.42, z);
  }
  soup(b, out, color);
}

/** A box between two plan points (a wall segment at any angle), `w` thick and `h` tall, base at y. */
export function segBox(b: Builder, p: XY, q: XY, w: number, h: number, color: number, y = 0): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  if (L < 1e-4) return;
  b.box(L, h, w, color, { at: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx), jitter: false });
}

/** Clip an x-monotonic polyline of [x, z] points to x0 <= x <= x1. */
export function clipX(pts: XY[], x0: number, x1: number): XY[] {
  const out: XY[] = [];
  const at = (p: XY, q: XY, x: number): XY => [x, p[1] + ((q[1] - p[1]) * (x - p[0])) / (q[0] - p[0] || 1)];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    if (q[0] < x0 || p[0] > x1) continue;
    const a: XY = p[0] < x0 ? at(p, q, x0) : p;
    const c: XY = q[0] > x1 ? at(p, q, x1) : q;
    if (!out.length || out[out.length - 1][0] !== a[0] || out[out.length - 1][1] !== a[1]) out.push(a);
    out.push(c);
  }
  return out;
}

/** Clip a polygon to the slab x0 <= x <= x1 (Sutherland-Hodgman against the two lines). */
export function clipPolyX(poly: XY[], x0: number, x1: number): XY[] {
  const cut = (pts: XY[], inside: (p: XY) => boolean, x: number): XY[] => {
    const res: XY[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const ia = inside(a);
      const ic = inside(c);
      if (ia) res.push(a);
      if (ia !== ic) res.push([x, a[1] + ((c[1] - a[1]) * (x - a[0])) / (c[0] - a[0] || 1)]);
    }
    return res;
  };
  return cut(cut(poly, (p) => p[0] >= x0, x0), (p) => p[0] <= x1, x1);
}

export { mix, tint };
