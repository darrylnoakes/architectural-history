import * as THREE from 'three';
import { P, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

export type Pt = [number, number];

/** A solid block that is also one walk collider (one range of a courtyard house). */
export function block(b: Builder, w: number, h: number, d: number, color: number, x: number, z: number, y = 0): void {
  b.box(w, h, d, color, { at: [x, y, z] });
  b.collider(w, d, { at: [x, 0, z] });
}

/** Rotation that turns a local frame (front plane at local z = 0, facing local +Z) to face `f`. */
export function faceRot(f: '+z' | '-z' | '+x' | '-x'): number {
  return f === '+z' ? 0 : f === '-z' ? Math.PI : f === '+x' ? Math.PI / 2 : -Math.PI / 2;
}

/**
 * Work on one wall face: inside `fn`, local x runs along the wall (to the right when you face it),
 * y is height and +z points out of the wall, whose surface is local z = 0.
 */
export function onFace(b: Builder, f: '+z' | '-z' | '+x' | '-x', at: Vec3, fn: () => void): void {
  b.group({ at, rotY: faceRot(f) }, fn);
}

/**
 * Outline of an arched opening, base centred at (xc, y0): left jamb up, over the head, right jamb
 * down. 'round' is a semicircle, 'pointed' a two-centred Gothic arch, 'segmental' a shallow arc,
 * 'rect' a flat head.
 */
export function archPts(
  xc: number,
  y0: number,
  w: number,
  h: number,
  shape: 'round' | 'pointed' | 'segmental' | 'rect',
  n = 6,
): Pt[] {
  const a = w / 2;
  const pts: Pt[] = [[xc - a, y0]];
  if (shape === 'rect') {
    pts.push([xc - a, y0 + h], [xc + a, y0 + h], [xc + a, y0]);
    return pts;
  }
  if (shape === 'round') {
    const hs = h - a;
    for (let i = 0; i <= n; i++) {
      const t = Math.PI - (i / n) * Math.PI;
      pts.push([xc + a * Math.cos(t), y0 + hs + a * Math.sin(t)]);
    }
  } else if (shape === 'segmental') {
    const rise = Math.min(h * 0.5, w * 0.2);
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

/** A window opening in the local face frame: stone surround, dark glazing, optional sill. */
export function win(
  b: Builder,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
  o: { shape?: 'round' | 'pointed' | 'segmental' | 'rect'; border?: number; glass?: number; z?: number; shutters?: number; n?: number } = {},
): void {
  const shape = o.shape ?? 'rect';
  const f = o.border ?? 0.14;
  const z = o.z ?? 0;
  const n = o.n ?? 4;
  plate(b, archPts(x, y - f, w + 2 * f, h + 2 * f, shape, n), 0.08, frame, z);
  plate(b, archPts(x, y, w, h, shape, n), 0.1, o.glass ?? P.windowDark, z);
  if (o.shutters !== undefined) {
    // folded-back louvred shutters (persiane) either side
    for (const s of [-1, 1]) b.box(w / 2, h * (shape === 'rect' ? 1 : 0.8), 0.05, o.shutters, { at: [x + s * (w * 0.75 + f), y, z + 0.06] });
  }
}

/**
 * A two-light window (bifora) in the local face frame: one arch divided into two smaller arches by
 * a slim colonnette. `oculus` adds a roundel in the tympanum (Florentine Renaissance).
 */
export function bifora(
  b: Builder,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
  o: { shape: 'round' | 'pointed'; oculus?: boolean; z?: number; border?: number; col?: number; lightShape?: 'round' | 'pointed'; recess?: boolean },
): void {
  const z = o.z ?? 0;
  const f = o.border ?? 0.16;
  const ls = o.lightShape ?? o.shape;
  // outer arch moulding, and the stone tympanum recessed a shade darker inside it
  plate(b, archPts(x, y - f, w + 2 * f, h + 2 * f, o.shape, 6), 0.08, frame, z);
  if (o.recess !== false) plate(b, archPts(x, y, w, h, o.shape, 6), 0.1, tint(frame, -0.07), z);
  // the two lights, divided by a colonnette
  const cw = 0.12;
  const lw = (w - cw) / 2;
  const lh = o.shape === 'round' ? h - w / 2 + lw * 0.45 : h * 0.74;
  for (const s of [-1, 1]) plate(b, archPts(x + (s * (lw + cw)) / 2, y, lw, lh, ls, 4), 0.12, P.windowDark, z);
  if (o.oculus) {
    const r = Math.min(lw * 0.36, (h - lh) * 0.3);
    if (r > 0.06) b.cyl(r, 0.05, P.windowDark, { at: [x, y + lh + (h - lh) * 0.4, z + 0.1], rot: [Math.PI / 2, 0, 0], segs: 6, jitter: false });
  }
  const springL = lh - (ls === 'round' ? lw / 2 : Math.min(lh * 0.6, lw * 0.85));
  b.box(cw, springL, cw, o.col ?? frame, { at: [x, y, z + 0.16] });
  b.box(cw * 1.9, 0.1, cw * 1.9, o.col ?? frame, { at: [x, y + springL - 0.08, z + 0.16] });
}

/**
 * Courses of rusticated stone blocks covering a rectangle of the local face frame (x0..x1,
 * y0..y1), staggered course by course, leaving out the rectangles in `skip`. `proud` is how far the
 * blocks stand out, `rough` adds random extra depth to each (rough-hewn bugnato).
 */
export function rustic(
  b: Builder,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  color: number,
  o: { course: number; len: number; proud: number; rough?: number; gap?: number; skip?: [number, number, number, number][]; vary?: number },
): void {
  const gap = o.gap ?? 0.06;
  const rows = Math.max(1, Math.round((y1 - y0) / o.course));
  const ch = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) {
    const ya = y0 + r * ch;
    const yb = ya + ch;
    // cut points: block joints, staggered every other course
    const off = r % 2 === 0 ? 0 : o.len / 2;
    let cuts: number[] = [];
    for (let x = x0 - off; x < x1 + o.len; x += o.len) cuts.push(Math.min(x1, Math.max(x0, x)));
    cuts = [...new Set(cuts)].sort((a, c) => a - c);
    // subtract openings that cross this course
    const holes = (o.skip ?? []).filter(([, , sy0, sy1]) => sy0 < yb - 0.01 && sy1 > ya + 0.01);
    for (let i = 0; i < cuts.length - 1; i++) {
      let segs: [number, number][] = [[cuts[i], cuts[i + 1]]];
      for (const [hx0, hx1] of holes) {
        const next: [number, number][] = [];
        for (const [a, c] of segs) {
          if (hx1 <= a || hx0 >= c) next.push([a, c]);
          else {
            if (hx0 > a) next.push([a, hx0]);
            if (hx1 < c) next.push([hx1, c]);
          }
        }
        segs = next;
      }
      for (const [a, c] of segs) {
        const w = c - a - gap;
        if (w < 0.12) continue;
        const d = o.proud + (o.rough ? b.rand() * o.rough : 0);
        const col = o.vary ? tint(color, (b.rand() - 0.5) * o.vary) : color;
        b.box(w, ch - gap, d, col, { at: [(a + c) / 2, ya + gap / 2, d / 2], jitter: false });
      }
    }
  }
}

/** Long radiating stones (voussoirs) round a round arch in the local face frame. */
export function voussoirs(
  b: Builder,
  xc: number,
  ySpring: number,
  r: number,
  len: number,
  n: number,
  proud: number,
  color: number,
  o: { rough?: number; vary?: number } = {},
): void {
  for (let i = 0; i < n; i++) {
    const t = Math.PI - ((i + 0.5) / n) * Math.PI;
    const half = (Math.PI / n) * 0.44;
    const ri = r;
    const ro = r + len * (i === Math.floor(n / 2) ? 1.15 : 1);
    const pts: Pt[] = [
      [xc + ri * Math.cos(t - half), ySpring + ri * Math.sin(t - half)],
      [xc + ro * Math.cos(t - half), ySpring + ro * Math.sin(t - half)],
      [xc + ro * Math.cos(t + half), ySpring + ro * Math.sin(t + half)],
      [xc + ri * Math.cos(t + half), ySpring + ri * Math.sin(t + half)],
    ];
    const d = proud + (o.rough ? b.rand() * o.rough : 0);
    plate(b, pts, d, o.vary ? tint(color, (b.rand() - 0.5) * o.vary) : color);
  }
}

/**
 * A moulding run along the top of a W x D block centred on (x, z), at height y, on the listed
 * sides. `profile` is [out, up] points (out = projection from the wall face), closed.
 */
export function moulding(
  b: Builder,
  W: number,
  D: number,
  y: number,
  profile: Pt[],
  color: number,
  o: { x?: number; z?: number; sides?: ('+z' | '-z' | '+x' | '-x')[] } = {},
): void {
  const x = o.x ?? 0;
  const z = o.z ?? 0;
  const p = Math.max(...profile.map((q) => q[0]));
  for (const s of o.sides ?? ['+z', '-z', '+x', '-x']) {
    const along = s === '+z' || s === '-z' ? W : D;
    const at: Vec3 =
      s === '+z' ? [x, y, z + D / 2] : s === '-z' ? [x, y, z - D / 2] : s === '+x' ? [x + W / 2, y, z] : [x - W / 2, y, z];
    const rotY = s === '+z' ? -Math.PI / 2 : s === '-z' ? Math.PI / 2 : s === '+x' ? 0 : Math.PI;
    b.extrude(profile, along + 2 * p, color, { at, rotY, jitter: false });
  }
}

/** Profile of a big classical cornice (cornicione) projecting `p`, `h` tall: [out, up] points. */
export function corniceProfile(p: number, h: number): Pt[] {
  return [
    [-0.05, 0],
    [p * 0.12, 0],
    [p * 0.12, h * 0.18],
    [p * 0.3, h * 0.24],
    [p * 0.3, h * 0.38],
    [p * 0.86, h * 0.46],
    [p * 0.86, h * 0.62],
    [p, h * 0.72],
    [p, h],
    [-0.05, h],
  ];
}

/** Brackets (modillions or corbels) under a cornice along a face of the local frame. */
export function brackets(b: Builder, x0: number, x1: number, y: number, step: number, out: number, h: number, w: number, color: number): void {
  const n = Math.max(2, Math.round((x1 - x0) / step) + 1);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    b.extrude(
      [
        [0, -h],
        [out * 0.35, -h],
        [out, -h * 0.35],
        [out, 0],
        [0, 0],
      ],
      w,
      color,
      { at: [x, y, 0], rotY: -Math.PI / 2, jitter: false },
    );
  }
}

/** A triangular or segmental pediment in the local face frame, base centred at (x, y). */
export function pediment(b: Builder, x: number, y: number, w: number, h: number, kind: 'tri' | 'seg', color: number, depth = 0.3, z = 0): void {
  let pts: Pt[];
  if (kind === 'tri') {
    pts = [
      [x - w / 2, y],
      [x + w / 2, y],
      [x + w / 2, y + 0.1],
      [x, y + h],
      [x - w / 2, y + 0.1],
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
}

/** Coppi ribs (the cover tiles of pan-and-cover roofing) down both slopes of a gable whose ridge runs along X. */
export function coppiRibs(
  b: Builder,
  x0: number,
  x1: number,
  zc: number,
  span: number,
  y0: number,
  h: number,
  ov: number,
  color: number,
  step = 0.7,
  slopes: (1 | -1)[] = [1, -1],
): void {
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = 0.16 * Math.hypot(half, h) / half;
  const n = Math.max(2, Math.round((x1 - x0) / step));
  for (const s of slopes) {
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      b.beam([x, y0 - drop + t + 0.03, zc + s * (half + ov)], [x, y0 + h + t + 0.01, zc], 0.11, 0.07, color, { jitter: false });
    }
  }
}

/** Same, for a gable whose ridge runs along Z. */
export function coppiRibsZ(
  b: Builder,
  z0: number,
  z1: number,
  xc: number,
  span: number,
  y0: number,
  h: number,
  ov: number,
  color: number,
  step = 0.7,
  slopes: (1 | -1)[] = [1, -1],
): void {
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = 0.16 * Math.hypot(half, h) / half;
  const n = Math.max(2, Math.round((z1 - z0) / step));
  for (const s of slopes) {
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      b.beam([xc + s * (half + ov), y0 - drop + t + 0.03, z], [xc, y0 + h + t + 0.01, z], 0.11, 0.07, color, { jitter: false });
    }
  }
}

/**
 * Points round a rounded rectangle (superellipse) of half-sizes a (X) and c (Z), anticlockwise from
 * the front centre.
 */
export function ovalPlan(a: number, c: number, n: number, power = 3): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    pts.push([Math.sign(ct) * Math.pow(Math.abs(ct), 2 / power) * a, Math.sign(st) * Math.pow(Math.abs(st), 2 / power) * c]);
  }
  return pts;
}

/**
 * An Iron Age hut of the Latial type: an oval wall of wattle and daub round a post frame, a steep
 * hipped thatch rising to a ridge along Z, a porch at the front (+Z) and pairs of crossed timbers
 * on the ridge, as the hut-shaped cinerary urns show. Centred on `at`; `rotY` turns it.
 */
export function latialHut(
  b: Builder,
  o: { at: Vec3; rotY?: number; a: number; c: number; wall: number; roof: number; porch?: boolean; daub?: number; thatch?: number; crossed?: number },
): void {
  const daub = o.daub ?? P.daub;
  const thatch = o.thatch ?? P.thatch;
  b.group({ at: o.at, rotY: o.rotY ?? 0 }, () => {
    const n = 20;
    const ring = ovalPlan(o.a, o.c, n);
    // wall: the oval plan extruded upward (door gap left as a dark panel at the front)
    b.extrude(ring, o.wall, daub, { at: [0, o.wall / 2, 0], rot: [-Math.PI / 2, 0, 0] });
    // a low stone footing
    b.extrude(ovalPlan(o.a + 0.08, o.c + 0.08, n), 0.25, P.rubble, { at: [0, 0.125, 0], rot: [-Math.PI / 2, 0, 0] });
    // the roof: from an oval eave ring to a ridge along Z
    const ov = 0.5;
    const eave = ovalPlan(o.a + ov, o.c + ov, n);
    const ridgeHalf = Math.max(0.3, o.c - o.a * 0.55);
    const yE = o.wall - 0.1;
    const yR = o.wall + o.roof;
    const pos: number[] = [];
    const ridgePt = (p: Pt): Vec3 => [0, yR, Math.max(-ridgeHalf, Math.min(ridgeHalf, p[1] * (ridgeHalf / (o.c + ov)) * 1.3))];
    for (let i = 0; i < n; i++) {
      const p = eave[i];
      const q = eave[(i + 1) % n];
      const rp = ridgePt(p);
      const rq = ridgePt(q);
      pos.push(p[0], yE, -p[1], q[0], yE, -q[1], rq[0], rq[1], -rq[2]);
      pos.push(p[0], yE, -p[1], rq[0], rq[1], -rq[2], rp[0], rp[1], -rp[2]);
      // the thick thatch edge
      pos.push(p[0], yE, -p[1], p[0], yE - 0.3, -p[1], q[0], yE - 0.3, -q[1]);
      pos.push(p[0], yE, -p[1], q[0], yE - 0.3, -q[1], q[0], yE, -q[1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.add(g, thatch);
    // ridge pole and the crossed timbers that pin the thatch along it
    b.beam([0, yR + 0.1, -ridgeHalf - 0.3], [0, yR + 0.1, ridgeHalf + 0.3], 0.16, 0.16, P.oakDark);
    const pairs = o.crossed ?? 3;
    for (let i = 0; i < pairs; i++) {
      const z = pairs === 1 ? 0 : -ridgeHalf + (2 * ridgeHalf * i) / (pairs - 1);
      for (const s of [-1, 1]) b.beam([s * 0.75, yR - 0.45, z], [-s * 0.45, yR + 0.55, z], 0.09, 0.09, P.oakDark);
    }
    // smoke hole in the front gable end
    const zs = ridgeHalf + (0.9 / (yR - yE)) * (o.c + ov - ridgeHalf);
    b.box(0.7, 0.45, 0.5, 0x2a2420, { at: [0, yR - 1.05, zs - 0.1] });
    // door and porch
    b.panel(0.9, 1.7, P.oakDark, { at: [0, 0.2, o.c - 0.02], facing: '+z', depth: 0.08 });
    if (o.porch) {
      const zp = o.c + 1.3;
      for (const s of [-1, 1]) b.cyl(0.08, 2.0, P.oak, { at: [s * 0.9, 0, zp], segs: 5 });
      b.beam([-1.1, 2.0, zp], [1.1, 2.0, zp], 0.12, 0.12, P.oak);
      b.gable(2.2, 1.7, 0.55, thatch, { at: [0, 2.0, o.c + 0.75], ridge: 'z', overhang: 0.15, thick: 0.25 });
    }
  });
}

/**
 * The roof of a courtyard building: four ranges each `R` deep round a W x D block, hipped at the
 * outer corners and valleyed at the inner ones, rising h to a ridge over the middle of each range.
 * `at` is the eaves level at the block's centre; `ov` is the overhang outside and into the court.
 */
export function courtRoof(b: Builder, W: number, D: number, R: number, h: number, color: number, o: { at: Vec3; ov?: number; ovIn?: number }): void {
  const ov = o.ov ?? 0.5;
  const oi = o.ovIn ?? ov;
  const [cx, cy, cz] = o.at;
  const ring = (hx: number, hz: number, y: number): Vec3[] => [
    [cx - hx, cy + y, cz + hz],
    [cx + hx, cy + y, cz + hz],
    [cx + hx, cy + y, cz - hz],
    [cx - hx, cy + y, cz - hz],
  ];
  const sOut = (ov * h) / (R / 2);
  const sIn = (oi * h) / (R / 2);
  const outer = ring(W / 2 + ov, D / 2 + ov, -sOut);
  const ridge = ring(W / 2 - R / 2, D / 2 - R / 2, h);
  const inner = ring(W / 2 - R - oi, D / 2 - R - oi, -sIn);
  const pos: number[] = [];
  const quad = (a: Vec3, c: Vec3, d: Vec3, e: Vec3) => pos.push(...a, ...c, ...d, ...a, ...d, ...e);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    quad(outer[i], outer[j], ridge[j], ridge[i]);
    quad(ridge[i], ridge[j], inner[j], inner[i]);
    // a thin fascia at the eaves so the roof edge has some thickness
    const dn = (p: Vec3): Vec3 => [p[0], p[1] - 0.18, p[2]];
    quad(outer[i], outer[j], dn(outer[j]), dn(outer[i]));
    quad(inner[i], inner[j], dn(inner[j]), dn(inner[i]));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color);
  // ridge and hip tiles
  const dark = tint(color, -0.08);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    b.beam([ridge[i][0], ridge[i][1] + 0.08, ridge[i][2]], [ridge[j][0], ridge[j][1] + 0.08, ridge[j][2]], 0.22, 0.14, dark, { jitter: false });
    b.beam([outer[i][0], outer[i][1] + 0.1, outer[i][2]], [ridge[i][0], ridge[i][1] + 0.1, ridge[i][2]], 0.2, 0.12, dark, { jitter: false });
  }
}

/** Cover-tile ribs down the street slope (+Z) of a courtRoof, between the hips. */
export function courtRoofRibs(b: Builder, W: number, D: number, R: number, h: number, color: number, at: Vec3, ov: number, step = 1.0): void {
  const [cx, cy, cz] = at;
  const sOut = (ov * h) / (R / 2);
  const x1 = W / 2 - R / 2 - 0.2;
  const n = Math.max(2, Math.round((2 * x1) / step));
  for (let i = 0; i <= n; i++) {
    const x = cx - x1 + (2 * x1 * i) / n;
    b.beam([x, cy - sOut + 0.12, cz + D / 2 + ov], [x, cy + h + 0.06, cz + D / 2 - R / 2], 0.11, 0.07, color, { jitter: false });
  }
}

/** A cheap classical column: square base, tapering shaft, flared capital and abacus. */
export function col(b: Builder, x: number, z: number, r: number, h: number, color: number, o: { y?: number; cap?: 'tuscan' | 'corinthian' | 'ionic'; segs?: number } = {}): void {
  const y = o.y ?? 0;
  const segs = o.segs ?? 6;
  const ch = o.cap === 'corinthian' ? r * 2.2 : r * 1.0;
  b.box(r * 2.6, r * 0.7, r * 2.6, color, { at: [x, y, z], jitter: false });
  b.cyl(r, h - r * 0.7 - ch, color, { at: [x, y + r * 0.7, z], rTop: r * 0.86, segs, jitter: false });
  if (o.cap === 'ionic') {
    b.box(r * 3.0, ch * 0.6, r * 1.6, color, { at: [x, y + h - ch, z], jitter: false });
  } else {
    b.cyl(r * 0.86, ch * 0.75, color, { at: [x, y + h - ch, z], rTop: r * (o.cap === 'corinthian' ? 1.45 : 1.2), segs: 5, jitter: false });
  }
  b.box(r * 2.9, ch * 0.28, r * 2.9, color, { at: [x, y + h - ch * 0.28, z], jitter: false });
}

// ---------------------------------------------------------------- what the medieval stages keep

/**
 * The rubble walls that closed the Lombard compound on its sides and back. The plot keeps them as the
 * yard walls of the tower house that follows, so both build them here with the same numbers.
 */
export function compoundWalls(b: Builder, color: number): void {
  const Hw = 3.0;
  block(b, 23, Hw, 0.6, color, 0, -12.2);
  b.sym((s) => block(b, 0.6, Hw, 23.3, color, s * 11.2, -0.25));
}

/** Where the well of the compound was sunk; the tower house and the Gothic palace keep it in their yard and court. */
export const WELL_AT: Pt = [-3.5, -3.4];

/** The stone well-head, with a timber frame for the rope, an iron one, or none. */
export function wellHead(b: Builder, stone: number, frame: 'wood' | 'iron' | 'none', wood: number = P.oak): void {
  const [x, z] = WELL_AT;
  b.cyl(0.75, 0.9, stone, { at: [x, 0, z], segs: 10 });
  b.cyl(0.6, 0.92, P.windowDark, { at: [x, 0, z], segs: 10 });
  if (frame === 'iron') {
    b.sym((s) => b.box(0.12, 1.6, 0.12, P.iron, { at: [x + s * 0.6, 0.9, z] }));
    b.box(1.3, 0.1, 0.1, P.iron, { at: [x, 2.5, z] });
  } else if (frame === 'wood') {
    b.beam([x - 0.8, 2.0, z], [x + 0.8, 2.0, z], 0.1, 0.1, wood);
    b.sym((s) => b.box(0.12, 2.0, 0.12, wood, { at: [x + s * 0.8, 0, z] }));
  }
}

/**
 * The family tower of stage 7, from the ground to `top`: plinth, shaft, coursing, putlog holes, slit
 * windows and the raised door on the back. The Gothic palace keeps it cut down to `TOWER.cut` inside
 * its back corner, so the pieces below the cut are built here, the same for both.
 */
export const TOWER = { T: 6.4, x: -7.2, z: 5.8, H: 27, cut: 22 };

export function towerShaft(b: Builder, stone: number, wood: number, part: 'lower' | 'upper'): void {
  const { T, x: tx, z: tz, H: TH, cut } = TOWER;
  const lower = part === 'lower';
  const inPart = (y: number) => (lower ? y < cut : y >= cut);
  if (lower) {
    block(b, T + 0.4, 2.0, T + 0.4, stone, tx, tz);
    b.box(T, cut, T, stone, { at: [tx, 0, tz] });
  } else {
    b.box(T, TH - cut, T, stone, { at: [tx, cut, tz] });
  }
  for (let y = 1.6; y < TH; y += 1.6) if (inPart(y)) b.box(T + 0.03, 0.04, T + 0.03, tint(stone, -0.08), { at: [tx, y, tz], jitter: false });
  // putlog holes on every face and a few narrow slits
  for (const f of ['+z', '-z', '+x', '-x'] as const) {
    const at: Vec3 = f === '+z' ? [tx, 0, tz + T / 2] : f === '-z' ? [tx, 0, tz - T / 2] : f === '+x' ? [tx + T / 2, 0, tz] : [tx - T / 2, 0, tz];
    onFace(b, f, at, () => {
      for (let y = 6; y < TH - 2; y += 3.2) if (inPart(y)) for (const x of [-2.2, 0, 2.2]) b.panel(0.25, 0.25, 0x2a2420, { at: [x, y, 0], depth: 0.03 });
      if (lower) for (const y of [13, 19.5]) win(b, 0.9, y, 0.35, 1.3, tint(stone, 0.05), { shape: 'round', border: 0.1, n: 3 });
    });
  }
  // the raised door, on the back, high above the yard
  if (lower) onFace(b, '-z', [tx, 0, tz - T / 2], () => win(b, 1.6, 4.6, 0.9, 2.0, tint(stone, 0.06), { shape: 'round', border: 0.15, glass: wood, n: 4 }));
}
