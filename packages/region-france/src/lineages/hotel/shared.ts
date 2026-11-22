import * as THREE from 'three';
import { P, tint, type Builder, type Vec3 } from '@ah/kit';

export type Pt = [number, number];
export type Face = '+z' | '-z' | '+x' | '-x';

/** Rotation that turns a local frame (front plane at local z = 0, facing local +Z) to face `f`. */
export function faceRot(f: Face): number {
  return f === '+z' ? 0 : f === '-z' ? Math.PI : f === '+x' ? Math.PI / 2 : -Math.PI / 2;
}

/**
 * Work on one wall face: inside `fn`, local x runs along the wall (to the right when you face it),
 * y is height and +z points out of the wall, whose surface is local z = 0.
 */
export function onFace(b: Builder, f: Face, at: Vec3, fn: () => void): void {
  b.group({ at, rotY: faceRot(f) }, fn);
}

/** A solid block that is also one walk collider (one range of a courtyard house). */
export function block(b: Builder, w: number, h: number, d: number, color: number, x: number, z: number, y = 0): void {
  b.box(w, h, d, color, { at: [x, y, z] });
  b.collider(w, d, { at: [x, 0, z] });
}

/** Build a mesh from a flat list of triangle corners. */
export function tris(b: Builder, pos: number[], color: number, o?: { jitter?: boolean }): void {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { jitter: o?.jitter });
}

/**
 * Outline of an arched opening, base centred at (xc, y0): left jamb up, over the head, right jamb
 * down. 'round' is a semicircle, 'pointed' a two-centred Gothic arch, 'segmental' a shallow arc,
 * 'basket' a flattened three-centred arch (anse de panier), 'rect' a flat head.
 */
export function archPts(xc: number, y0: number, w: number, h: number, shape: 'round' | 'pointed' | 'segmental' | 'basket' | 'rect', n = 6): Pt[] {
  const a = w / 2;
  const pts: Pt[] = [[xc - a, y0]];
  if (shape === 'rect') {
    pts.push([xc - a, y0 + h], [xc + a, y0 + h], [xc + a, y0]);
    return pts;
  }
  if (shape === 'round' || shape === 'basket') {
    const rise = shape === 'round' ? a : Math.min(a * 0.55, h * 0.5);
    const hs = h - rise;
    for (let i = 0; i <= n; i++) {
      const t = Math.PI - (i / n) * Math.PI;
      pts.push([xc + a * Math.cos(t), y0 + hs + rise * Math.sin(t)]);
    }
  } else if (shape === 'segmental') {
    const rise = Math.min(h * 0.5, w * 0.16);
    const hs = h - rise;
    const R = (a * a + rise * rise) / (2 * rise);
    const cy = y0 + hs - (R - rise);
    const phi = Math.asin(a / R);
    for (let i = 0; i <= n; i++) {
      const t = Math.PI / 2 + phi - (i / n) * 2 * phi;
      pts.push([xc + R * Math.cos(t), cy + R * Math.sin(t)]);
    }
  } else {
    const rise = Math.min(h * 0.6, w * 0.85);
    const hs = h - rise;
    const R = (a * a + rise * rise) / (2 * a);
    const half = Math.ceil(n / 2);
    const phi = Math.atan2(rise, R - a);
    for (let i = 0; i <= half; i++) {
      const t = Math.PI - (i / half) * phi;
      pts.push([xc + (R - a) + R * Math.cos(t), y0 + hs + R * Math.sin(t)]);
    }
    for (let i = 1; i <= half; i++) {
      const t = phi - (i / half) * phi;
      pts.push([xc - (R - a) + R * Math.cos(t), y0 + hs + R * Math.sin(t)]);
    }
  }
  pts.push([xc + a, y0]);
  return pts;
}

/** A flat plate in the local face frame (surface at z = 0) standing `depth` proud, from an outline. */
export function plate(b: Builder, pts: Pt[], depth: number, color: number, z = 0, holes?: Pt[][]): void {
  b.extrude(pts, depth, color, { at: [0, 0, z + depth / 2], holes, jitter: false });
}

/** A thin bar between two points of the local face frame, standing `d` proud. */
export function bar(b: Builder, x0: number, y0: number, x1: number, y1: number, t: number, d: number, color: number, z = 0): void {
  b.beam([x0, y0, z + d / 2], [x1, y1, z + d / 2], t, d, color, { jitter: false });
}

/**
 * The ogee or "accolade" curve of a Flamboyant door or window head: convex from the springing,
 * then reversing to rise concave to a point. Returns the half-curve from (-a, 0) to the apex (0, h).
 */
function ogeeHalf(a: number, h: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const f = u < 0.5 ? 0.5 * Math.sqrt(2 * u) : 1 - 0.5 * Math.sqrt(2 * (1 - u));
    pts.push([-a + a * u, h * f]);
  }
  return pts;
}

/** An accolade hood moulding over an opening, springing at (xc, y) across width w, with a finial. */
export function accolade(b: Builder, xc: number, y: number, w: number, h: number, color: number, z = 0, t = 0.12): void {
  const half = ogeeHalf(w / 2, h, 5);
  const top: Pt[] = [...half, ...half.slice(0, -1).reverse().map(([x, yy]) => [-x, yy] as Pt)];
  const outer = top.map(([x, yy]) => [xc + x, y + yy + t] as Pt);
  const inner = top.map(([x, yy]) => [xc + x, y + yy] as Pt).reverse();
  plate(b, [...outer, ...inner], 0.1, color, z);
  // the finial (fleuron) at the point
  b.box(0.12, 0.5, 0.12, color, { at: [xc, y + h + t - 0.05, z + 0.08], jitter: false });
  b.box(0.26, 0.1, 0.2, color, { at: [xc, y + h + t + 0.2, z + 0.08], jitter: false });
}

/**
 * A stone cross-window (croisée): a moulded surround, dark glazing, a stone mullion and transom.
 * `mullion: false` gives a single light with only a transom (demi-croisée).
 */
export function croisee(
  b: Builder,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
  o: { z?: number; border?: number; mullion?: boolean; transom?: number; glass?: number; hood?: boolean; bars?: number } = {},
): void {
  const z = o.z ?? 0;
  const f = o.border ?? 0.14;
  plate(b, archPts(x, y - f, w + 2 * f, h + 2 * f, 'rect'), 0.08, frame, z);
  plate(b, archPts(x, y, w, h, 'rect'), 0.1, o.glass ?? P.windowDark, z);
  const tr = y + h * (o.transom ?? 0.62);
  b.box(w, 0.12, 0.1, frame, { at: [x, tr - 0.06, z + 0.12], jitter: false });
  if (o.mullion !== false) b.box(0.12, h, 0.1, frame, { at: [x, y, z + 0.12], jitter: false });
  if (o.bars) {
    // leaded or wooden glazing bars, one level row in each light
    for (let i = 1; i <= o.bars; i++) b.box(w, 0.035, 0.05, tint(frame, -0.25), { at: [x, y + ((tr - y) * i) / (o.bars + 1), z + 0.12], jitter: false });
  }
  if (o.hood) {
    // a drip moulding (larmier) with short returns
    b.box(w + 2 * f + 0.3, 0.14, 0.18, frame, { at: [x, y + h + f, z + 0.09], jitter: false });
    for (const s of [-1, 1]) b.box(0.14, 0.4, 0.18, frame, { at: [x + s * (w / 2 + f + 0.08), y + h + f - 0.3, z + 0.09], jitter: false });
  }
}

/**
 * A classical French window (croisée à petits bois): a stone surround, tall casements with glazing
 * bars. `shape` gives a flat, segmental or round head; `key` adds a keystone; `cols` x `rows` panes.
 */
export function fenetre(
  b: Builder,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
  o: {
    z?: number;
    border?: number;
    shape?: 'rect' | 'segmental' | 'round' | 'basket';
    key?: boolean;
    cols?: number;
    rows?: number;
    bar?: number;
    glass?: number;
    sill?: boolean;
    shutters?: number;
  } = {},
): void {
  const z = o.z ?? 0;
  const f = o.border ?? 0.16;
  const shape = o.shape ?? 'rect';
  plate(b, archPts(x, y - (o.sill === false ? 0 : f * 0.5), w + 2 * f, h + f * (o.sill === false ? 1 : 1.5), shape, 5), 0.07, frame, z);
  plate(b, archPts(x, y, w, h, shape, 5), 0.09, o.glass ?? P.windowDark, z);
  const barC = o.bar ?? P.white;
  const cols = o.cols ?? 2;
  const rows = o.rows ?? 4;
  const straight = shape === 'rect' ? h : shape === 'round' ? h - w / 2 : h - w * 0.16;
  for (let i = 1; i < cols; i++) b.box(0.05, straight, 0.05, barC, { at: [x - w / 2 + (w * i) / cols, y, z + 0.11], jitter: false });
  for (let j = 1; j < rows; j++) {
    const yy = y + (h * j) / rows;
    if (yy > y + straight - 0.05) continue;
    b.box(w, 0.04, 0.05, barC, { at: [x, yy, z + 0.11], jitter: false });
  }
  if (o.key) b.box(0.28, 0.42, 0.16, frame, { at: [x, y + h - 0.12, z + 0.06], jitter: false });
  if (o.sill !== false) b.box(w + 2 * f + 0.1, 0.1, 0.2, frame, { at: [x, y - f * 0.6, z + 0.1], jitter: false });
  if (o.shutters !== undefined) for (const s of [-1, 1]) b.box(w / 2, straight, 0.05, o.shutters, { at: [x + s * (w * 0.75 + f + 0.02), y, z + 0.05] });
}

/** A flat pilaster on a wall in the local face frame: base, shaft and capital. */
export function pilaster(b: Builder, x: number, y: number, w: number, h: number, color: number, z = 0, proud = 0.12): void {
  b.box(w + 0.1, 0.22, proud + 0.05, color, { at: [x, y, z + (proud + 0.05) / 2], jitter: false });
  b.box(w, h - 0.44, proud, color, { at: [x, y + 0.22, z + proud / 2], jitter: false });
  b.box(w + 0.16, 0.22, proud + 0.08, color, { at: [x, y + h - 0.22, z + (proud + 0.08) / 2], jitter: false });
}

/** A horizontal band (string course, entablature) along the local face frame. */
export function band(b: Builder, x0: number, x1: number, y: number, h: number, out: number, color: number, z = 0): void {
  b.box(x1 - x0, h, out, color, { at: [(x0 + x1) / 2, y, z + out / 2], jitter: false });
}

/** A round medallion with a head in relief, in the local face frame. */
export function medallion(b: Builder, x: number, y: number, r: number, color: number, z = 0, face?: number): void {
  b.cyl(r, 0.1, color, { at: [x, y, z + 0.06], rot: [Math.PI / 2, 0, 0], segs: 10, jitter: false });
  b.cyl(r * 0.8, 0.06, tint(color, -0.1), { at: [x, y, z + 0.12], rot: [Math.PI / 2, 0, 0], segs: 10, jitter: false });
  b.sphere(r * 0.42, face ?? tint(color, 0.04), { at: [x, y + 0.04, z + 0.16], segs: 6, jitter: false });
}

/**
 * Stone quoins (a chaîne harpée): blocks alternately long and short climbing a corner or edge at x
 * in the local face frame, from y0 to y1. `dir` is the side the long blocks reach toward.
 */
export function quoins(b: Builder, x: number, y0: number, y1: number, color: number, o: { z?: number; course?: number; long?: number; short?: number; dir?: 1 | -1; both?: boolean } = {}): void {
  const z = o.z ?? 0;
  const c = o.course ?? 0.42;
  const L = o.long ?? 0.9;
  const S = o.short ?? 0.5;
  const n = Math.max(1, Math.round((y1 - y0) / c));
  const ch = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const len = i % 2 === 0 ? L : S;
    const cx = o.both ? x : x + ((o.dir ?? 1) * len) / 2;
    b.box(len, ch - 0.04, 0.05, color, { at: [cx, y0 + i * ch + 0.02, z + 0.025], jitter: false });
  }
}

/** A cheap baluster rail along the local face frame's x from x0 to x1, standing on y. */
export function balustrade(b: Builder, x0: number, x1: number, y: number, color: number, o: { z?: number; h?: number; step?: number; t?: number } = {}): void {
  const z = o.z ?? 0;
  const h = o.h ?? 0.9;
  const t = o.t ?? 0.3;
  const step = o.step ?? 0.32;
  b.box(x1 - x0, 0.14, t, color, { at: [(x0 + x1) / 2, y, z], jitter: false });
  b.box(x1 - x0, 0.14, t + 0.06, color, { at: [(x0 + x1) / 2, y + h - 0.14, z], jitter: false });
  const n = Math.max(1, Math.floor((x1 - x0) / step));
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
    b.cyl(0.07, h - 0.28, color, { at: [x, y + 0.14, z], rTop: 0.045, segs: 4, jitter: false });
  }
}

/** A balustrade round all four sides of a w x d rectangle centred on (x, z), standing on y. */
export function balustradeRing(b: Builder, w: number, d: number, y: number, color: number, o: { x?: number; z?: number; h?: number; step?: number; skip?: Face[] } = {}): void {
  const x = o.x ?? 0;
  const z = o.z ?? 0;
  const sides: [Face, Vec3, number][] = [
    ['+z', [x, 0, z + d / 2], w],
    ['-z', [x, 0, z - d / 2], w],
    ['+x', [x + w / 2, 0, z], d],
    ['-x', [x - w / 2, 0, z], d],
  ];
  for (const [f, at, len] of sides) {
    if (o.skip?.includes(f)) continue;
    onFace(b, f, at, () => balustrade(b, -len / 2, len / 2, y, color, { z: -0.15, h: o.h, step: o.step }));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.4, (o.h ?? 0.9) + 0.1, 0.4, color, { at: [x + (sx * w) / 2 - sx * 0.15, y, z + (sz * d) / 2 - sz * 0.15], jitter: false });
}

/** A cheap classical column: square base, tapering shaft, flared capital and abacus. */
export function col(
  b: Builder,
  x: number,
  z: number,
  r: number,
  h: number,
  color: number,
  o: { y?: number; cap?: 'tuscan' | 'corinthian' | 'ionic' | 'doric'; segs?: number } = {},
): void {
  const y = o.y ?? 0;
  const segs = o.segs ?? 6;
  const ch = o.cap === 'corinthian' ? r * 2.2 : r * 1.0;
  if (o.cap !== 'doric') b.box(r * 2.6, r * 0.6, r * 2.6, color, { at: [x, y, z], jitter: false });
  const by = o.cap === 'doric' ? 0 : r * 0.6;
  b.cyl(r, h - by - ch, color, { at: [x, y + by, z], rTop: r * 0.86, segs, jitter: false });
  if (o.cap === 'ionic') {
    b.box(r * 3.0, ch * 0.6, r * 1.6, color, { at: [x, y + h - ch, z], jitter: false });
  } else {
    b.cyl(r * 0.86, ch * 0.75, color, { at: [x, y + h - ch, z], rTop: r * (o.cap === 'corinthian' ? 1.45 : 1.2), segs: 5, jitter: false });
  }
  b.box(r * 2.9, ch * 0.28, r * 2.9, color, { at: [x, y + h - ch * 0.28, z], jitter: false });
}

/** A triangular or segmental pediment in the local face frame, base centred at (x, y). */
export function pediment(b: Builder, x: number, y: number, w: number, h: number, kind: 'tri' | 'seg', color: number, depth = 0.3, z = 0): void {
  let pts: Pt[];
  if (kind === 'tri') {
    pts = [
      [x - w / 2, y],
      [x + w / 2, y],
      [x + w / 2, y + 0.12],
      [x, y + h],
      [x - w / 2, y + 0.12],
    ];
  } else {
    const a = w / 2;
    const R = (a * a + h * h) / (2 * h);
    const phi = Math.asin(a / R);
    pts = [[x + a, y]];
    for (let i = 0; i <= 8; i++) {
      const t = Math.PI / 2 - phi + (i / 8) * 2 * phi;
      pts.push([x + R * Math.cos(t), y + h - R + R * Math.sin(t)]);
    }
  }
  plate(b, pts, depth, color, z);
  // a darker recessed tympanum
  if (kind === 'tri') {
    const m = 0.18;
    plate(b, [[x - w / 2 + m * 2.4, y + m], [x + w / 2 - m * 2.4, y + m], [x, y + h - m * 1.6]], depth + 0.04, tint(color, -0.06), z - 0.04);
  }
}

/**
 * A mansard roof (comble brisé) over a w x d block whose wall top is at `at`: a steep lower slope
 * (the brisis) rising hB while stepping in by `inset`, then a low hipped upper slope (the terrasson)
 * rising hT. Returns nothing; the break line is marked with a lead roll.
 */
export function mansard(
  b: Builder,
  w: number,
  d: number,
  hB: number,
  hT: number,
  inset: number,
  color: number,
  o: { at: Vec3; top?: number; ov?: number; trim?: number },
): void {
  const [cx, cy, cz] = o.at;
  const ov = o.ov ?? 0.3;
  const drop = 0.12;
  const ring = (hx: number, hz: number, y: number): Vec3[] => [
    [cx - hx, y, cz + hz],
    [cx + hx, y, cz + hz],
    [cx + hx, y, cz - hz],
    [cx - hx, y, cz - hz],
  ];
  const lo = ring(w / 2 + ov, d / 2 + ov, cy - drop);
  const hi = ring(w / 2 - inset, d / 2 - inset, cy + hB);
  const pos: number[] = [];
  const quad = (a: Vec3, c: Vec3, e: Vec3, f: Vec3) => pos.push(...a, ...c, ...e, ...a, ...e, ...f);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    quad(lo[i], lo[j], hi[j], hi[i]);
    const dn = (p: Vec3): Vec3 => [p[0], p[1] - 0.16, p[2]];
    quad(lo[i], lo[j], dn(lo[j]), dn(lo[i]));
  }
  tris(b, pos, color);
  b.hip(w - 2 * inset, d - 2 * inset, hT, o.top ?? tint(color, 0.04), { at: [cx, cy + hB, cz] });
  const trim = o.trim ?? P.lead;
  const iw = w - 2 * inset;
  const id = d - 2 * inset;
  b.box(iw + 0.16, 0.12, 0.16, trim, { at: [cx, cy + hB - 0.06, cz + id / 2], jitter: false });
  b.box(iw + 0.16, 0.12, 0.16, trim, { at: [cx, cy + hB - 0.06, cz - id / 2], jitter: false });
  b.box(0.16, 0.12, id + 0.16, trim, { at: [cx + iw / 2, cy + hB - 0.06, cz], jitter: false });
  b.box(0.16, 0.12, id + 0.16, trim, { at: [cx - iw / 2, cy + hB - 0.06, cz], jitter: false });
}

export type DormerStyle = 'flamboyant' | 'renaissance' | 'louis13' | 'mansard' | 'oeil' | 'plain';

/**
 * A dormer (lucarne) in the local face frame: its front stands at z = 0 with its sill at y, and its
 * cheeks and little roof run back `depth` into the main roof (local -z). `w` x `h` is the window.
 *  - flamboyant: a croisée under a tall crocketed gable with a finial, between two pinnacles
 *  - renaissance: pilasters, an entablature and a round pediment with a shell, candelabra finials
 *  - louis13: a stone surround under a triangular or segmental pediment
 *  - mansard: a small round- or segment-headed dormer on a mansard's steep slope
 *  - oeil: a round window (oeil-de-boeuf) under a lead hood
 */
export function dormer(
  b: Builder,
  style: DormerStyle,
  x: number,
  y: number,
  w: number,
  h: number,
  o: { stone: number; roof: number; depth?: number; ped?: 'tri' | 'seg'; glass?: number; bar?: number },
): void {
  const st = o.stone;
  const depth = o.depth ?? 2.2;
  const fw = w + 0.5;
  // the dormer's own roof, ridge running back into the main roof
  const roofOn = (yy: number, span: number, rise: number) => {
    b.gable(span, depth, rise, o.roof, { at: [x, yy, -depth / 2], ridge: 'z', overhang: 0.08, wall: st });
  };
  if (style === 'oeil') {
    const r = w / 2;
    b.box(fw, w + 0.25, depth, st, { at: [x, y - 0.1, -depth / 2 + 0.05] });
    b.cyl(r + 0.12, 0.1, st, { at: [x, y + r, 0.1], rot: [Math.PI / 2, 0, 0], segs: 10, jitter: false });
    b.cyl(r, 0.08, o.glass ?? P.windowDark, { at: [x, y + r, 0.16], rot: [Math.PI / 2, 0, 0], segs: 10, jitter: false });
    b.vault(fw + 0.1, depth + 0.1, o.roof, { at: [x, y + w + 0.12, -depth / 2 + 0.05], squash: 0.7, segs: 8 });
    return;
  }
  // the front panel and cheeks
  b.box(fw, h + 0.3, depth, st, { at: [x, y - 0.15, -depth / 2 + 0.02] });
  if (style === 'flamboyant') {
    croisee(b, x, y, w, h, tint(st, 0.03), { z: 0.03, border: 0.12, mullion: w > 1.0, transom: 0.55, bars: 1 });
    const gy = y + h + 0.15;
    const gh = fw * 1.25;
    // the gable (gâble) in front of the dormer roof, its rakes crocketed, a finial at the top
    plate(b, [[x - fw / 2 - 0.08, gy], [x + fw / 2 + 0.08, gy], [x, gy + gh]], 0.24, st, 0.0);
    plate(b, [[x - fw / 2 + 0.3, gy + 0.18], [x + fw / 2 - 0.3, gy + 0.18], [x, gy + gh - 0.5]], 0.28, tint(st, -0.07), 0.0);
    accolade(b, x, gy - 0.05, w * 0.85, gh * 0.55, st, 0.2, 0.1);
    for (const s of [-1, 1]) {
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        b.box(0.2, 0.16, 0.2, st, { at: [x + s * (fw / 2 + 0.08) * (1 - t) + s * 0.05, gy + gh * t + 0.02, 0.12], jitter: false });
      }
      // flanking pinnacles
      const px = x + s * (fw / 2 + 0.12);
      b.box(0.26, h + 0.6, 0.26, st, { at: [px, y - 0.15, 0.1], jitter: false });
      b.cone(0.2, 1.0, st, { at: [px, y + h + 0.45, 0.1], segs: 4, jitter: false });
    }
    b.box(0.14, 0.6, 0.14, st, { at: [x, gy + gh - 0.08, 0.12], jitter: false });
    b.box(0.34, 0.1, 0.2, st, { at: [x, gy + gh + 0.22, 0.12], jitter: false });
    roofOn(gy - 0.1, fw, gh * 0.85);
    return;
  }
  if (style === 'renaissance') {
    croisee(b, x, y, w, h, tint(st, 0.03), { z: 0.03, border: 0.1, mullion: w > 1.0, transom: 0.62 });
    for (const s of [-1, 1]) pilaster(b, x + s * (fw / 2 - 0.05), y - 0.15, 0.24, h + 0.3, tint(st, 0.04), 0.03, 0.1);
    const ey = y + h + 0.15;
    band(b, x - fw / 2 - 0.15, x + fw / 2 + 0.15, ey, 0.28, 0.24, tint(st, 0.04));
    // a round pediment with a scallop shell, and candelabrum finials
    const r = fw / 2;
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = Math.PI - (i / 8) * Math.PI;
      pts.push([x + r * Math.cos(t), ey + 0.28 + r * Math.sin(t)]);
    }
    plate(b, pts, 0.2, st, 0.0);
    const sh: Pt[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = Math.PI - (i / 6) * Math.PI;
      sh.push([x + r * 0.62 * Math.cos(t), ey + 0.36 + r * 0.62 * Math.sin(t)]);
    }
    plate(b, sh, 0.24, tint(st, 0.06), 0.02);
    for (let i = 0; i < 5; i++) {
      const t = Math.PI - ((i + 0.5) / 5) * Math.PI;
      bar(b, x, ey + 0.38, x + r * 0.6 * Math.cos(t), ey + 0.36 + r * 0.6 * Math.sin(t), 0.05, 0.06, tint(st, -0.12), 0.25);
    }
    for (const s of [-1, 0, 1]) {
      const cxp = x + s * (fw / 2 + 0.05);
      const cyp = s === 0 ? ey + 0.28 + r : ey + 0.28;
      b.cyl(0.1, 0.4, st, { at: [cxp, cyp, 0.1], rTop: 0.05, segs: 5, jitter: false });
      b.sphere(0.13, st, { at: [cxp, cyp + 0.52, 0.1], segs: 5, jitter: false });
    }
    roofOn(ey + 0.2, fw, r + 0.6);
    return;
  }
  if (style === 'louis13') {
    fenetre(b, x, y, w, h, tint(st, 0.03), { z: 0.03, border: 0.12, cols: 2, rows: 3, sill: false });
    const ey = y + h + 0.15;
    band(b, x - fw / 2 - 0.1, x + fw / 2 + 0.1, ey, 0.2, 0.2, st);
    pediment(b, x, ey + 0.2, fw + 0.3, o.ped === 'seg' ? 0.6 : 0.8, o.ped ?? 'tri', st, 0.24);
    // scroll ends (ailerons) against the roof
    for (const s of [-1, 1]) b.box(0.18, 0.6, 0.3, st, { at: [x + s * (fw / 2 + 0.05), y - 0.15, 0.1], jitter: false });
    roofOn(ey + 0.1, fw + 0.1, 0.9);
    return;
  }
  if (style === 'mansard') {
    fenetre(b, x, y, w, h, tint(st, 0.03), { z: 0.03, border: 0.1, cols: 2, rows: 3, shape: o.ped === 'seg' ? 'segmental' : 'round', sill: false, bar: o.bar });
    const ey = y + h + 0.15;
    band(b, x - fw / 2 - 0.08, x + fw / 2 + 0.08, ey, 0.14, 0.16, st);
    if (o.ped) pediment(b, x, ey + 0.14, fw + 0.2, 0.45, o.ped, st, 0.2);
    roofOn(ey + 0.05, fw, 0.6);
    return;
  }
  // plain
  croisee(b, x, y, w, h, tint(st, 0.03), { z: 0.03, border: 0.08, mullion: false });
  roofOn(y + h + 0.15, fw, fw * 0.8);
}

/**
 * A polygonal stair turret (tourelle d'escalier) standing on the ground at (x, z): `sides`-sided,
 * radius r, h tall, under a steep spire roof, with small windows climbing round it as the spiral
 * stair inside does, and a door at the foot facing `face`.
 */
export function stairTurret(
  b: Builder,
  x: number,
  z: number,
  r: number,
  h: number,
  stone: number,
  roof: number,
  o: { sides?: number; roofH?: number; face?: Face; door?: number; frame?: number; windows?: number } = {},
): void {
  const n = o.sides ?? 6;
  const off = Math.PI / n;
  b.cyl(r, h, stone, { at: [x, 0, z], segs: n, rotY: off });
  b.cyl(r + 0.12, 0.22, tint(stone, 0.04), { at: [x, h - 0.22, z], segs: n, rotY: off, jitter: false });
  b.cone(r + 0.25, o.roofH ?? r * 3.2, roof, { at: [x, h, z], segs: n, rotY: off });
  b.cyl(0.05, 0.8, P.lead, { at: [x, h + (o.roofH ?? r * 3.2) - 0.1, z], segs: 4, jitter: false });
  const faceA = faceRot(o.face ?? '+z');
  const apothem = r * Math.cos(Math.PI / n);
  const nw = o.windows ?? Math.max(2, Math.floor((h - 3) / 2.2));
  for (let i = 0; i < nw; i++) {
    // the windows step round the turret as the stair climbs
    const a = faceA + ((i % 2 === 0 ? 1 : -1) * 2 * Math.PI) / n;
    const yy = 2.8 + i * ((h - 4) / Math.max(1, nw));
    b.group({ at: [x + Math.sin(a) * apothem, 0, z + Math.cos(a) * apothem], rotY: a }, () => {
      plate(b, archPts(0, yy - 0.1, 0.62, 1.3, 'rect'), 0.06, o.frame ?? tint(stone, 0.05));
      plate(b, archPts(0, yy, 0.42, 1.1, 'rect'), 0.08, P.windowDark);
    });
  }
  b.group({ at: [x + Math.sin(faceA) * apothem, 0, z + Math.cos(faceA) * apothem], rotY: faceA }, () => {
    plate(b, archPts(0, 0, 1.2, 2.5, 'rect'), 0.06, o.frame ?? tint(stone, 0.05));
    plate(b, archPts(0, 0, 0.95, 2.2, 'rect'), 0.1, o.door ?? P.oakDark);
  });
}

/** A run of pointed stakes (a palisade) from p0 to p1 on the ground, h tall: one cheap extruded silhouette. */
export function palisade(b: Builder, x0: number, z0: number, x1: number, z1: number, h: number, color: number, step = 0.32): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / step));
  const s = len / n;
  const pts: Pt[] = [[-len / 2, 0]];
  for (let i = 0; i < n; i++) {
    const xa = -len / 2 + i * s;
    const hh = h + (((i * 7919) % 5) - 2) * 0.06;
    pts.push([xa, hh - 0.25], [xa + s / 2, hh], [xa + s, hh - 0.25]);
  }
  pts.push([len / 2, 0]);
  const ang = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2;
  b.extrude(pts, 0.2, color, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: ang, jitter: false });
}

/** A flat parterre bed of clipped box hedging: an outline and a cross, on the ground, centred on (x, z). */
export function parterre(b: Builder, x: number, z: number, w: number, d: number, o: { hedge?: number; fill?: number; scroll?: boolean } = {}): void {
  const hedge = o.hedge ?? P.hedge;
  const fill = o.fill ?? P.grass;
  b.box(w, 0.06, d, fill, { at: [x, 0, z], jitter: false });
  const t = 0.3;
  const hh = 0.4;
  b.box(w, hh, t, hedge, { at: [x, 0, z + d / 2 - t / 2] });
  b.box(w, hh, t, hedge, { at: [x, 0, z - d / 2 + t / 2] });
  b.box(t, hh, d, hedge, { at: [x + w / 2 - t / 2, 0, z] });
  b.box(t, hh, d, hedge, { at: [x - w / 2 + t / 2, 0, z] });
  if (o.scroll) {
    // the curling embroidery of a parterre de broderie, reduced to a ring and four arcs
    b.cyl(Math.min(w, d) * 0.22, 0.32, hedge, { at: [x, 0, z], segs: 10 });
    b.cyl(Math.min(w, d) * 0.15, 0.34, fill, { at: [x, 0, z], segs: 10 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam([x + sx * w * 0.12, 0.15, z + sz * d * 0.38], [x + sx * w * 0.38, 0.15, z + sz * d * 0.12], 0.28, 0.32, hedge);
  } else {
    b.box(w, hh * 0.8, t * 0.8, hedge, { at: [x, 0, z] });
    b.box(t * 0.8, hh * 0.8, d, hedge, { at: [x, 0, z] });
  }
}

/** A clipped yew cone (if) for a formal garden. */
export function topiary(b: Builder, x: number, z: number, h: number): void {
  b.box(0.5, 0.4, 0.5, P.terracotta, { at: [x, 0, z] });
  b.cone(h * 0.25, h, P.leafDark, { at: [x, 0.3, z], segs: 6 });
}

/** Tegula-and-imbrex ribs (the cover tiles of Roman roofing) down both slopes of a gable whose ridge runs along X. */
export function imbrexRibs(b: Builder, x0: number, x1: number, zc: number, span: number, y0: number, h: number, ov: number, color: number, step = 0.7, slopes: (1 | -1)[] = [1, -1]): void {
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = (0.16 * Math.hypot(half, h)) / half;
  const n = Math.max(2, Math.round((x1 - x0) / step));
  for (const s of slopes) {
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      b.beam([x, y0 - drop + t + 0.03, zc + s * (half + ov)], [x, y0 + h + t + 0.01, zc], 0.11, 0.07, color, { jitter: false });
    }
  }
}

/** Same, for a gable whose ridge runs along Z. */
export function imbrexRibsZ(b: Builder, z0: number, z1: number, xc: number, span: number, y0: number, h: number, ov: number, color: number, step = 0.7, slopes: (1 | -1)[] = [1, -1]): void {
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = (0.16 * Math.hypot(half, h)) / half;
  const n = Math.max(2, Math.round((z1 - z0) / step));
  for (const s of slopes) {
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      b.beam([xc + s * (half + ov), y0 - drop + t + 0.03, z], [xc, y0 + h + t + 0.01, z], 0.11, 0.07, color, { jitter: false });
    }
  }
}

/**
 * A post-built house with wattle-and-daub walls under a thick hipped thatch, centred on `at`,
 * w x d, walls `wall` high, roof rising `roof`. The ridge runs along the longer side.
 * `aisled` shows the two rows of inner posts through the door. Door on the +Z long side unless `doorEnd`.
 */
export function thatchedHall(
  b: Builder,
  o: { at: Vec3; rotY?: number; w: number; d: number; wall: number; roof: number; daub?: number; thatch?: number; doorEnd?: boolean; posts?: boolean },
): void {
  const daub = o.daub ?? P.daub;
  const thatch = o.thatch ?? P.thatch;
  b.group({ at: o.at, rotY: o.rotY ?? 0 }, () => {
    b.box(o.w, o.wall, o.d, daub);
    // the wall posts showing through the daub
    if (o.posts !== false) {
      const nx = Math.max(2, Math.round(o.w / 2.2));
      for (let i = 0; i <= nx; i++) {
        const x = -o.w / 2 + (o.w * i) / nx;
        for (const s of [-1, 1]) b.box(0.22, o.wall, 0.08, P.oak, { at: [x, 0, s * (o.d / 2 + 0.02)], jitter: false });
      }
    }
    const ov = 0.7;
    const L = Math.max(o.w, o.d);
    const S = Math.min(o.w, o.d);
    const ridge = L - S + S * 0.45;
    b.hip(o.w, o.d, o.roof, thatch, { at: [0, o.wall, 0], overhang: ov, ridge });
    b.hip(o.w + 0.2, o.d + 0.2, o.roof, tint(thatch, -0.08), { at: [0, o.wall - 0.28, 0], overhang: ov, ridge });
    // smoke holes in the little hip ends under the ridge (no chimneys)
    if (o.w >= o.d) {
      for (const s of [-1, 1]) {
        const yy = o.wall + o.roof - 0.75;
        const xx = ridge / 2 + (0.75 / o.roof) * (L / 2 + ov - ridge / 2) - 0.1;
        b.box(0.12, 0.32, 0.55, 0x2a2420, { at: [s * xx, yy, 0], jitter: false });
      }
    }
    if (o.doorEnd) {
      b.panel(1.3, 2.0, P.oakDark, { at: [o.w / 2, 0, 0], facing: '+x', depth: 0.08 });
    } else {
      b.panel(1.4, 2.0, P.oakDark, { at: [0, 0, o.d / 2], facing: '+z', depth: 0.08 });
    }
  });
}

/** A granary raised on four posts with a little hipped thatch, centred on (x, z). */
export function granary(b: Builder, x: number, z: number, s: number, thatch: number, rotY = 0): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.12, 1.1, P.oak, { at: [(sx * s) / 2 - sx * 0.15, 0, (sz * s) / 2 - sz * 0.15], segs: 5 });
    b.box(s + 0.2, 0.18, s + 0.2, P.oakDark, { at: [0, 1.1, 0] });
    b.box(s, 1.4, s, P.wattle, { at: [0, 1.28, 0] });
    b.pyramid(s, s, 1.4, thatch, { at: [0, 2.68, 0], overhang: 0.35 });
    b.beam([0.0, 0, s / 2 + 1.1], [0, 1.2, s / 2 + 0.1], 0.3, 0.08, P.oak);
  });
}

/** A walled garden border: a low wall along the local x of a face, with coping. */
export function lowWall(b: Builder, x0: number, z0: number, x1: number, z1: number, h: number, color: number, coping?: number): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ang = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2;
  b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: ang }, () => {
    b.box(len, h, 0.45, color);
    b.box(len + 0.05, 0.14, 0.6, coping ?? tint(color, 0.06), { at: [0, h, 0], jitter: false });
  });
}
