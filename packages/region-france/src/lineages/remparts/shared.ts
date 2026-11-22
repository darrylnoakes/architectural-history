import * as THREE from 'three';
import { P, facingAngle, mix, tint, type Builder, type Facing, type Opts } from '@ah/kit';

/*
 * Local helpers for the remparts lineage. Every stage shares one layout: the road runs along Z through
 * the origin, the wall runs along X and is cut off at the plot edges (x = ±15), the outside of the town
 * (the field side, where an enemy would come from) is +Z and the town is -Z.
 *
 * Nothing in the geometry helpers uses the builder's random numbers, so they can be called from
 * curtain.ts inside any group, any number of times.
 */

export type XY = [number, number];
export const HALF = 15; // half the plot width
export const NJ = { jitter: false } as const;

/** Fixed colours per wall stage, shared by the gate plots and the circuit. */
export const WALL_COLOURS = {
  gaulish: {
    stone: mix(P.limestone, P.rubble, 0.45),
    earth: mix(P.earth, P.chalk, 0.18),
    grass: mix(P.turf, P.grassDry, 0.45),
    timber: mix(P.oak, P.oakSilver, 0.25),
    beam: tint(P.oakDark, 0.02),
    wattle: mix(P.wattle, P.oakSilver, 0.3),
    ditch: mix(P.mud, P.turf, 0.3),
  },
  castrum: {
    stone: mix(P.pierreBlonde, P.rubble, 0.3),
    brick: mix(P.briqueNord, P.romanTile, 0.5),
    spolia: mix(P.pierreBlonde, P.craie, 0.4),
    roof: P.romanTile,
  },
  philippian: {
    stone: mix(P.pierreBlonde, P.rubble, 0.38),
    dress: tint(P.pierreBlonde, -0.02),
    ditch: mix(P.turf, P.mud, 0.45),
    roof: P.ardoise,
  },
  vauban: {
    brick: mix(P.briqueNord, P.brickRed, 0.3),
    stone: P.pierreBlonde,
    grass: mix(P.turf, P.grassDry, 0.4),
    ditch: mix(P.turf, P.hedge, 0.45),
  },
};

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

/** A small upright rectangle on the plane z = const (a beam end, a putlog hole, a joint). */
export function rectZ(out: number[], x: number, y: number, z: number, w: number, h: number): void {
  quad(out, [x - w / 2, y, z], [x + w / 2, y, z], [x + w / 2, y + h, z], [x - w / 2, y + h, z]);
}

/**
 * A long prism along X from x0 to x1 whose cross-section (in the ZY plane) is `section`, a list of
 * [z, y] points. Earth banks, ditches, ramparts. Ends are capped (the section must fan from its first point).
 */
export function prismX(b: Builder, x0: number, x1: number, section: XY[], color: number, o?: Opts): void {
  const out: number[] = [];
  const n = section.length;
  for (let i = 0; i < n - 1; i++) {
    const [z0, y0] = section[i];
    const [z1, y1] = section[i + 1];
    quad(out, [x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1]);
  }
  for (let i = 1; i < n - 1; i++) {
    out.push(x0, section[0][1], section[0][0], x0, section[i][1], section[i][0], x0, section[i + 1][1], section[i + 1][0]);
    out.push(x1, section[0][1], section[0][0], x1, section[i + 1][1], section[i + 1][0], x1, section[i][1], section[i][0]);
  }
  soup(b, out, color, o);
}

/**
 * A straight run of rampart from plan point p to q with a cross-section `section` of [d, y] points,
 * where d is measured inward (along the unit plan vector `inward`) from the line p-q. The section must
 * fan from its first point; ends are capped. clipP / clipQ cut that end square to X instead of square
 * to the run (for runs clipped at a plot edge).
 */
export function run(b: Builder, p: XY, q: XY, inward: XY, section: XY[], color: number, o?: Opts & { clipP?: boolean; clipQ?: boolean }): void {
  const out: number[] = [];
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  const u: XY = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
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

/**
 * A solid of height y0..y1 over a plan polygon of [x, z] points (any order round the edge): earth
 * fills, terrepleins, paved islands.
 */
export function slab(b: Builder, plan: XY[], y0: number, y1: number, color: number, o?: Opts): void {
  b.group({ at: [0, (y0 + y1) / 2, 0], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(plan.map(([x, z]) => [x, -z] as XY), y1 - y0, color, { jitter: o?.jitter ?? false, mat: o?.mat });
  });
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

/** Evenly spaced interior positions for features `spacing` apart on x0..x1 (none if the stretch is short). */
export function evenly(x0: number, x1: number, spacing: number, min = spacing * 0.6): number[] {
  const L = x1 - x0;
  if (L < min) return [];
  const n = Math.max(1, Math.round(L / spacing));
  const xs: number[] = [];
  for (let i = 1; i < n; i++) xs.push(x0 + (i * L) / n);
  if (n === 1 && L >= spacing * 0.75) xs.push((x0 + x1) / 2);
  return xs;
}

/** Ranges of x0..x1 left between features of half-width hw centred at xs. */
export function gaps(x0: number, x1: number, xs: number[], hw: number): [number, number][] {
  const res: [number, number][] = [];
  let a = x0;
  for (const x of [...xs].sort((p, q) => p - q)) {
    if (x - hw > a) res.push([a, x - hw]);
    a = Math.max(a, x + hw);
  }
  if (x1 > a) res.push([a, x1]);
  return res;
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
 * A ring of voussoirs round a semicircular arch of span w whose springing line is at height `spring`,
 * standing `proud` in front of a wall face at `at`. `n` stones (odd, so there is a keystone).
 */
export function voussoirs(
  b: Builder,
  w: number,
  spring: number,
  ring: number,
  color: number,
  o: { at?: [number, number, number]; facing?: Facing; n?: number; proud?: number; vary?: number; keyExtra?: number; alt?: number },
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
      const c = o.alt !== undefined && i % 2 ? o.alt : tint(color, i % 2 ? -vary : vary * 0.4);
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

// ------------------------------------------------------------------ masonry and details

/**
 * A stretch of wall from x0 to x1, centred on z, `t` thick and `h` tall, laid in courses of big blocks,
 * each its own box running through the wall. `rnd` is a private random source so that the layout is
 * deterministic without touching the builder's own.
 */
export function blockWall(
  b: Builder,
  x0: number,
  x1: number,
  z: number,
  t: number,
  h: number,
  color: number,
  rnd: () => number,
  o?: { course?: [number, number]; len?: [number, number]; y0?: number; jitterZ?: number; tone?: number },
): void {
  const range = (a: number, c: number) => a + rnd() * (c - a);
  const [cMin, cMax] = o?.course ?? [0.55, 0.75];
  const [lMin, lMax] = o?.len ?? [1.2, 2.0];
  const jz = o?.jitterZ ?? 0.05;
  const tone = o?.tone ?? 0.05;
  const top = (o?.y0 ?? 0) + h;
  let y = o?.y0 ?? 0;
  let row = 0;
  while (y < top - 0.05) {
    const ch = Math.min(top - y, range(cMin, cMax));
    let x = x0;
    let first = row % 2 ? range(lMin * 0.4, lMin * 0.8) : range(lMin, lMax);
    while (x < x1 - 0.02) {
      let L = Math.min(x1 - x, first);
      first = range(lMin, lMax);
      if (x1 - (x + L) < lMin * 0.35) L = x1 - x;
      b.box(L - 0.03, ch - 0.03, t + range(-jz, jz), tint(color, range(-tone, tone)), { at: [x + L / 2, y, z + range(-jz, jz) * 0.5], jitter: false });
      x += L;
    }
    y += ch;
    row++;
  }
}

/** A row of square merlons along X on a wall top. */
export function merlonsX(b: Builder, x0: number, x1: number, y: number, z: number, color: number, o?: { w?: number; h?: number; t?: number; gap?: number }): void {
  const w = o?.w ?? 0.9;
  const gap = o?.gap ?? 0.7;
  const pitch = w + gap;
  const n = Math.max(1, Math.floor((x1 - x0 + gap) / pitch));
  const used = n * pitch - gap;
  if (x1 - x0 < w * 0.6) return;
  const start = x0 + (x1 - x0 - used) / 2 + w / 2;
  for (let i = 0; i < n; i++) b.box(w, o?.h ?? 1.0, o?.t ?? 0.5, color, { at: [start + i * pitch, y, z], jitter: false });
}

/** Merlons in a ring round the top of a round tower (centre at the group origin). */
export function merlonRing(b: Builder, r: number, y: number, n: number, color: number, o?: { w?: number; h?: number; t?: number; from?: number; to?: number }): void {
  const from = o?.from ?? 0;
  const to = o?.to ?? Math.PI * 2;
  const full = Math.abs(to - from - Math.PI * 2) < 1e-6;
  for (let i = 0; i < n; i++) {
    const a = from + ((i + (full ? 0 : 0.5)) / n) * (to - from);
    b.box(o?.w ?? 0.9, o?.h ?? 1.2, o?.t ?? 0.5, color, { at: [Math.sin(a) * (r - (o?.t ?? 0.5) / 2), y, Math.cos(a) * (r - (o?.t ?? 0.5) / 2)], rotY: a, jitter: false });
  }
}

/** The road surface through the plot, along Z. */
export function road(b: Builder, w: number, color: number, o?: { z0?: number; z1?: number; y?: number; x?: number }): void {
  const z0 = o?.z0 ?? -8;
  const z1 = o?.z1 ?? 8;
  b.box(w, o?.y ?? 0.04, z1 - z0, color, { at: [o?.x ?? 0, 0, (z0 + z1) / 2], jitter: false });
}

/** Two thin wheel ruts along the road. */
export function ruts(b: Builder, gauge: number, color: number, z0 = -8, z1 = 8, y = 0.045): void {
  b.sym((s) => b.box(0.28, 0.01, z1 - z0, color, { at: [s * gauge / 2, y, (z0 + z1) / 2], jitter: false }));
}

/** A pair of plank gate leaves standing open against the jambs of a passage w wide, hinged at plan depth z. */
export function gateLeaves(b: Builder, w: number, h: number, z: number, color: number, o?: { open?: number; iron?: boolean; inward?: boolean }): void {
  const open = o?.open ?? 1.3;
  const dir = o?.inward === false ? -1 : 1; // inward: the leaves swing toward -Z (the town)
  b.sym((s) => {
    const leaf = w / 2;
    b.group({ at: [s * w / 2, 0, z], rotY: s * dir * open }, () => {
      b.box(leaf, h, 0.14, color, { at: [-s * leaf / 2, 0, 0] });
      for (const y of [0.4, h / 2, h - 0.5]) b.box(leaf - 0.1, 0.16, 0.05, o?.iron ? P.iron : tint(color, -0.08), { at: [-s * leaf / 2, y, 0.09], jitter: false });
    });
  });
}

/** A thin flat ring on a round tower (a string course or brick band), drawn as an open lathe. */
export function ring(b: Builder, r: number, y: number, h: number, color: number, segs = 14, o?: { start?: number; sweep?: number }): void {
  b.lathe([[r, y], [r, y + h]], color, { segs, start: o?.start, sweep: o?.sweep, jitter: false });
}

/** A cast-iron gas lamp. */
export function lamp(b: Builder, x: number, z: number): void {
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(0.2, 0.45, P.castIron, { segs: 8 });
    b.cyl(0.07, 3.3, P.castIron, { at: [0, 0.45, 0], segs: 6, rTop: 0.05 });
    b.cyl(0.17, 0.12, P.castIron, { at: [0, 3.75, 0], segs: 6 });
    b.cyl(0.18, 0.5, P.windowLit, { at: [0, 3.87, 0], segs: 6, rTop: 0.26, mat: 'glass' });
    b.cone(0.3, 0.3, P.castIron, { at: [0, 4.37, 0], segs: 6 });
  });
}
