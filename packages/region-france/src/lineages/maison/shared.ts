import * as THREE from 'three';
import { P, tint, facingAngle, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** Street front line used by the row houses (the plot runs from z = -9 to +9). */
export const FRONT = 8.4;

/** Run fn in the frame of a wall surface: local x along the wall (to the viewer's right), y up, +z out of the wall. */
export function onWall(b: Builder, at: Vec3, facing: Facing, fn: () => void): void {
  b.group({ at, rotY: facingAngle(facing) }, fn);
}

/** Cob or plaster infill for timber frames: from raw clay to limewash and ochre. */
export function infillPick(b: Builder): number {
  return tint(b.pick([P.torchis, P.limewash, P.ochreWash, tint(P.torchis, 0.06), P.plaster, P.enduitGris]), b.range(-0.025, 0.02));
}

/** A shutter or door colour of the north: greys, blues, greens, and plain oak for the older houses. */
export function shutterPick(b: Builder, old = false): number {
  if (old) return b.pick([P.oak, P.oakDark, P.oakSilver, tint(P.oak, 0.06)]);
  return b.pick([P.voletGris, P.voletBleu, P.voletVert, P.voletGris, tint(P.voletBleu, -0.08), tint(P.voletVert, 0.06)]);
}

/**
 * A pitched roof with its own end overhang (0 for a house between party walls). Ridge along X unless
 * `ridge: 'z'`. `courses` draws the lines of the tile or slate courses on each slope; `sides` limits
 * which slopes get them (+1 is the +Z/+X slope).
 */
export function pitched(
  b: Builder,
  w: number,
  d: number,
  h: number,
  color: number,
  o: { at: Vec3; ridge?: 'x' | 'z'; overhang?: number; ends?: number; wall?: number; thick?: number; courses?: number; ribs?: number; sides?: (1 | -1)[]; ridgeCap?: number; noFill?: boolean },
): void {
  const ov = o.overhang ?? 0.3;
  const oe = o.ends ?? ov;
  const thick = o.thick ?? 0.15;
  const alongX = (o.ridge ?? 'x') === 'x';
  const span = alongX ? d : w;
  const run = alongX ? w : d;
  const half = span / 2;
  const drop = (ov * h) / half;
  const t = (thick * Math.hypot(half, h)) / half;
  const rot = alongX ? Math.PI / 2 : 0;
  const L = run + oe * 2;
  b.extrude(
    [[-half - ov, -drop], [0, h], [half + ov, -drop], [half + ov, -drop + t], [0, h + t], [-half - ov, -drop + t]],
    L,
    color,
    { at: o.at, rotY: rot },
  );
  if (!o.noFill) b.extrude([[-half, 0], [half, 0], [0, h]], run, o.wall ?? color, { at: o.at, rotY: rot });
  const [x0, y0, z0] = o.at;
  const line = tint(color, -0.07);
  const n = o.courses ?? 0;
  for (const s of o.sides ?? [1, -1]) {
    for (let i = 1; i <= n; i++) {
      const f = i / (n + 1);
      const e = (half + ov) * (1 - f);
      const y = y0 - drop + t + (h + drop) * f + 0.015;
      if (alongX) b.box(L - 0.04, 0.035, 0.06, line, { at: [x0, y, z0 + s * e], jitter: false });
      else b.box(0.06, 0.035, L - 0.04, line, { at: [x0 + s * e, y, z0], jitter: false });
    }
  }
  if (o.ribs) {
    // the cover tiles (imbrices) of a Roman roof, running from eaves to ridge
    const rib = tint(color, -0.06);
    const m = Math.max(2, Math.round(L / o.ribs));
    for (const s of o.sides ?? [1, -1]) {
      for (let i = 0; i < m; i++) {
        const u = -L / 2 + ((i + 0.5) / m) * L;
        const e = half + ov - 0.02;
        const pe: Vec3 = alongX ? [x0 + u, y0 - drop + t + 0.04, z0 + s * e] : [x0 + s * e, y0 - drop + t + 0.04, z0 + u];
        const pr: Vec3 = alongX ? [x0 + u, y0 + h + t + 0.02, z0 + s * 0.05] : [x0 + s * 0.05, y0 + h + t + 0.02, z0 + u];
        b.beam(pe, pr, 0.12, 0.08, rib, { jitter: false });
      }
    }
  }
  const cap = o.ridgeCap ?? tint(color, -0.1);
  if (alongX) b.box(L, 0.12, 0.24, cap, { at: [x0, y0 + h + t - 0.06, z0], jitter: false });
  else b.box(0.24, 0.12, L, cap, { at: [x0, y0 + h + t - 0.06, z0], jitter: false });
}

/**
 * A mansard (comble à la Mansart) over a w × d block between party walls, ridge along X: a steep lower
 * slope (brisis) rising `hLow` while stepping in `inset`, then a low upper slope (terrasson) rising
 * `hUp` to the ridge. The ends are closed by raised party walls of `wallColor`.
 */
export function mansard(
  b: Builder,
  w: number,
  d: number,
  hLow: number,
  hUp: number,
  inset: number,
  low: number,
  up: number,
  wallColor: number,
  o: { at: Vec3; ends?: boolean; ov?: number },
): void {
  const half = d / 2;
  const ov = o.ov ?? 0.12;
  const [x0, y0, z0] = o.at;
  b.extrude(
    [[-half - ov, 0], [half + ov, 0], [half - inset, hLow], [-half + inset, hLow]],
    w,
    low,
    { at: [x0, y0, z0], rotY: Math.PI / 2 },
  );
  b.extrude([[-half + inset + 0.05, 0], [half - inset - 0.05, 0], [0, hUp]], w, up, { at: [x0, y0 + hLow, z0], rotY: Math.PI / 2 });
  // the break between the slopes: a zinc or lead roll
  b.box(w, 0.08, 0.14, tint(up, 0.08), { at: [x0, y0 + hLow - 0.03, z0 + half - inset], jitter: false });
  b.box(w, 0.08, 0.14, tint(up, 0.08), { at: [x0, y0 + hLow - 0.03, z0 - half + inset], jitter: false });
  if (o.ends !== false) {
    for (const s of [1, -1]) {
      b.extrude(
        [[-half, 0], [half, 0], [half - inset + 0.04, hLow], [0, hLow + hUp + 0.06], [-half + inset - 0.04, hLow]],
        0.3,
        wallColor,
        { at: [x0 + s * (w / 2 - 0.15), y0, z0], rotY: Math.PI / 2 },
      );
    }
  }
}

/** A dormer (lucarne) on a roof slope facing `facing`: cheeks, a small gable roof and a window. `at` is the base of its front face. */
export function dormer(
  b: Builder,
  at: Vec3,
  facing: Facing,
  w: number,
  h: number,
  roof: number,
  cheek: number,
  o: { win?: number; frame?: number; depth?: number; pitch?: number; bars?: [number, number]; pediment?: number; shape?: 'rect' | 'segmental' | 'round' } = {},
): void {
  const dep = o.depth ?? 1.4;
  onWall(b, at, facing, () => {
    b.box(w, h, dep, cheek, { at: [0, 0, -dep / 2] });
    const rh = o.pitch ?? w * 0.45;
    if (o.pediment !== undefined) {
      // a stone pediment in front of a little roof
      b.extrude([[-w / 2 - 0.12, -0.05], [w / 2 + 0.12, -0.05], [0, rh + 0.1]], 0.2, o.pediment, { at: [0, h, 0.14] });
    }
    pitched(b, w, dep, rh, roof, { at: [0, h, -dep / 2], ridge: 'z', overhang: 0.12, ends: 0.05, wall: cheek, thick: 0.1, ridgeCap: tint(roof, 0.04) });
    const ww = w - 0.36;
    b.window(ww, h - 0.3, { at: [0, 0.12, 0.0], frame: o.frame ?? P.white, glass: o.win ?? P.windowDark, bars: o.bars ?? [2, 3], shape: o.shape });
  });
}

/** A pair of shutters folded back beside a window w × h whose bottom centre is `at`; `louvred` from the eighteenth century, otherwise boarded. */
export function shutters(b: Builder, w: number, h: number, at: Vec3, facing: Facing, color: number, o: { louvred?: boolean; closed?: boolean; single?: boolean } = {}): void {
  const slat = tint(color, -0.1);
  onWall(b, at, facing, () => {
    const leaf = (cx: number, lw: number) => {
      b.panel(lw, h, color, { at: [cx, 0, 0.02], depth: 0.05 });
      if (o.louvred) {
        const n = Math.max(3, Math.round(h / 0.35));
        for (let i = 1; i < n; i++) b.panel(lw - 0.08, 0.03, slat, { at: [cx, (h * i) / n, 0.02], depth: 0.08 });
      } else {
        // ledges (barres) of a boarded shutter
        for (const y of [0.18, h - 0.26]) b.panel(lw - 0.06, 0.08, slat, { at: [cx, y, 0.02], depth: 0.08 });
      }
    };
    const lw = o.single ? w : w / 2;
    if (o.closed) {
      if (o.single) leaf(0, w);
      else {
        leaf(-w / 4, w / 2 - 0.01);
        leaf(w / 4, w / 2 - 0.01);
      }
    } else if (o.single) leaf(-w - 0.05 + lw / 2 + w / 2 - w, lw);
    else {
      leaf(-w / 2 - lw / 2 - 0.03, lw);
      leaf(w / 2 + lw / 2 + 0.03, lw);
    }
  });
}

/** A round well with a stone kerb, a timber frame and a bucket. */
export function well(b: Builder, at: Vec3, stone: number, o: { r?: number; frame?: 'wood' | 'iron' | 'none' } = {}): void {
  const r = o.r ?? 0.6;
  b.cyl(r, 0.8, stone, { at, segs: 10 });
  b.cyl(r * 0.72, 0.82, P.windowDark, { at, segs: 10, jitter: false });
  b.cyl(r + 0.05, 0.08, tint(stone, 0.05), { at: [at[0], at[1] + 0.8, at[2]], segs: 10 });
  const f = o.frame ?? 'wood';
  if (f === 'none') return;
  const col = f === 'iron' ? P.iron : P.oak;
  const pw = f === 'iron' ? 0.05 : 0.12;
  b.sym((s) => b.box(pw, 1.5, pw, col, { at: [at[0] + s * (r - 0.05), at[1] + 0.8, at[2]] }));
  b.log(0.09, r * 2 + 0.1, col, { at: [at[0] - 0, at[1] + 2.0, at[2]], segs: 6 });
  b.cyl(0.13, 0.25, P.oak, { at: [at[0], at[1] + 1.3, at[2]], segs: 6 });
  b.box(0.02, 0.6, 0.02, P.timberBlack, { at: [at[0], at[1] + 1.55, at[2]] });
}

/** A vegetable bed: dark soil and rows of plants. */
export function vegBed(b: Builder, x: number, z: number, w: number, d: number, o: { rows?: number; alongX?: boolean; color?: number } = {}): void {
  b.box(w, 0.08, d, P.soil, { at: [x, 0, z], jitter: false });
  const rows = o.rows ?? Math.max(2, Math.round((o.alongX ? d : w) / 0.6));
  const col = o.color ?? P.leaf;
  for (let i = 0; i < rows; i++) {
    const t = -0.5 + (i + 0.5) / rows;
    const c = i % 2 ? tint(col, 0.06) : col;
    if (o.alongX) b.box(w - 0.3, 0.26, 0.24, c, { at: [x, 0.08, z + t * d] });
    else b.box(0.24, 0.26, d - 0.3, c, { at: [x + t * w, 0.08, z] });
  }
}

/** A thin flat surface just above the ground (paving, a path, a floor). */
export function pave(b: Builder, w: number, d: number, color: number, at: Vec3): void {
  b.box(w, 0.04, d, color, { at: [at[0], at[1] + 0.005, at[2]], jitter: false });
}

/** A wattle hurdle fence from (x0, z0) to (x1, z1), with stakes. */
export function hurdle(b: Builder, x0: number, z0: number, x1: number, z1: number, h = 1.1): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / 1.2));
  b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) }, () => {
    b.box(0.07, h - 0.1, len, P.wattle, { at: [0, 0.05, 0] });
    for (let i = 0; i <= n; i++) b.cyl(0.05, h + 0.15, P.oak, { at: [0, 0, -len / 2 + (i * len) / n], segs: 4 });
  });
}

/** A masonry garden or yard wall from (x0, z0) to (x1, z1) with a coping. */
export function yardWall(b: Builder, x0: number, z0: number, x1: number, z1: number, h: number, color: number, cope?: number): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) }, () => {
    b.box(0.3, h, len, color, { at: [0, 0, 0] });
    b.box(0.38, 0.1, len, cope ?? tint(color, 0.06), { at: [0, h, 0], jitter: false });
  });
}

/** A small timber privy with a lean-to roof; door faces `facing`. */
export function privy(b: Builder, at: Vec3, rotY: number, wall: number, roof: number): void {
  b.group({ at, rotY }, () => {
    b.box(1.1, 2.0, 1.1, wall);
    b.shed(1.3, 1.3, 0.35, roof, { at: [0, 2.0, 0], high: '-z' });
    b.panel(0.6, 1.7, P.oak, { at: [0, 0, 0.55], facing: '+z' });
    b.panel(0.12, 0.2, P.timberBlack, { at: [0, 1.4, 0.56], facing: '+z', shape: 'circle', depth: 0.08 });
  });
}

/** Washing on a line between two posts. */
export function washing(b: Builder, p0: Vec3, p1: Vec3, cols: number[]): void {
  b.box(0.07, p0[1], 0.07, P.oak, { at: [p0[0], 0, p0[2]] });
  b.box(0.07, p1[1], 0.07, P.oak, { at: [p1[0], 0, p1[2]] });
  b.beam(p0, p1, 0.02, 0.02, P.white, { jitter: false });
  const n = cols.length;
  const yaw = Math.atan2(p1[0] - p0[0], p1[2] - p0[2]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    b.box(0.03, 0.5, 0.42, cols[i], {
      at: [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t - 0.52, p0[2] + (p1[2] - p0[2]) * t],
      rotY: yaw,
    });
  }
}

/** A woodpile of logs along X. */
export function woodpile(b: Builder, at: Vec3, len: number, rows = 3): void {
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < 4 - j; i++) b.log(0.1, len, P.bark, { at: [at[0], at[1] + j * 0.18, at[2] - 0.3 + i * 0.2 + j * 0.1], segs: 5 });
  }
}

/**
 * Seven-segment digits made of small slabs on a wall, for date stones and house numbers. `at` is the
 * bottom centre of the text on the wall surface; `size` the digit height.
 */
export function digits(b: Builder, text: string, at: Vec3, facing: Facing, size: number, color: number): void {
  const SEG: Record<string, string> = {
    '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
  };
  const w = size * 0.55;
  const t = size * 0.13;
  const gap = size * 0.28;
  const total = text.length * w + (text.length - 1) * gap;
  onWall(b, at, facing, () => {
    [...text].forEach((ch, i) => {
      const x = -total / 2 + i * (w + gap) + w / 2;
      const segs = SEG[ch] ?? '';
      const hz = (y: number) => b.panel(w, t, color, { at: [x, y, 0], depth: 0.04 });
      const vt = (dx: number, y0: number) => b.panel(t, size / 2, color, { at: [x + dx, y0, 0], depth: 0.04 });
      if (segs.includes('a')) hz(size - t);
      if (segs.includes('g')) hz(size / 2 - t / 2);
      if (segs.includes('d')) hz(0);
      if (segs.includes('f')) vt(-w / 2 + t / 2, size / 2);
      if (segs.includes('b')) vt(w / 2 - t / 2, size / 2);
      if (segs.includes('e')) vt(-w / 2 + t / 2, 0);
      if (segs.includes('c')) vt(w / 2 - t / 2, 0);
    });
  });
}

/** A ring of quoins: alternating long and short stones up a corner seen on a front facing +z. */
export function quoins(b: Builder, x: number, z: number, y0: number, y1: number, side: 1 | -1, color: number, course = 0.5): void {
  const n = Math.floor((y1 - y0) / course);
  for (let i = 0; i < n; i++) {
    const long = i % 2 === 0;
    const qw = long ? 0.75 : 0.45;
    b.box(qw, course - 0.04, 0.06, color, { at: [x - side * (qw / 2), y0 + i * course + 0.02, z + 0.02], jitter: false });
  }
}

/** A bow (half-octagon) window projecting from a wall facing +z: `at` is the base centre on the wall. */
export function bowWindow(
  b: Builder,
  at: Vec3,
  w: number,
  h: number,
  proj: number,
  wall: number,
  glassFrame: number,
  o: { roof?: number; sillH?: number; base?: number; curved?: boolean } = {},
): void {
  const sill = o.sillH ?? 0.8;
  const [x0, y0, z0] = at;
  const side = proj * 1.0;
  const front = w - 2 * side * 0.6;
  // plan: a trapezoid, front face `front` wide, splayed cheeks
  const pts: [number, number][] = [[-w / 2, 0], [w / 2, 0], [front / 2, proj], [-front / 2, proj]];
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  b.add(g, wall, { at: [x0, y0, z0] });
  // a slab on top and below
  const cap = (y: number, col: number, th: number) => {
    const sh = new THREE.Shape([[-w / 2 - 0.08, 0], [w / 2 + 0.08, 0], [front / 2 + 0.06, proj + 0.1], [-front / 2 - 0.06, proj + 0.1]].map(([x, z]) => new THREE.Vector2(x, -z)));
    const gg = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false });
    gg.rotateX(-Math.PI / 2);
    b.add(gg, col, { at: [x0, y, z0] });
  };
  cap(y0 + h, o.roof ?? tint(wall, -0.1), 0.18);
  cap(y0 - 0.12, o.base ?? tint(wall, -0.1), 0.14);
  // glazing: front and the two cheeks
  const gh = h - sill - 0.25;
  b.window(front - 0.25, gh, { at: [x0, y0 + sill, z0 + proj], facing: '+z', frame: glassFrame, bars: [2, 3] });
  const cheekLen = Math.hypot(side * 0.6 * (w - front) / (2 * side * 0.6), proj);
  const ang = Math.atan2((w - front) / 2, proj);
  for (const s of [1, -1] as const) {
    const cx = s * (w + front) / 4;
    b.window(cheekLen - 0.3, gh, { at: [x0 + cx, y0 + sill, z0 + proj / 2], facing: s * (Math.PI / 2 - ang), frame: glassFrame, bars: [1, 3] });
  }
}
