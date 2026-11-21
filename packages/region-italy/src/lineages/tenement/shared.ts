import { P, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** Plot of the tenement lineage: 26 m along the street (X), 16 m deep (Z); street front at z = +8. */
export const PW = 26;
export const PD = 16;

const DEG = Math.PI / 180;

/** A low flat patch of ground (yard, garden bed, paving). Slightly raised to avoid z-fighting. */
export function patch(b: Builder, w: number, d: number, color: number, at: [number, number], y = 0.03): void {
  b.box(w, y, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** Outward unit vector and sign helpers for an axis-aligned facing. */
function out(f: '+z' | '-z' | '+x' | '-x'): [number, number] {
  return f === '+z' ? [0, 1] : f === '-z' ? [0, -1] : f === '+x' ? [1, 0] : [-1, 0];
}

/**
 * Pyramid with a thick lip at the eaves, scaled to w x d (a four-sided lathe). `at` is the eaves level.
 */
export function thickPyramid(b: Builder, w: number, d: number, h: number, lip: number, color: number, at: Vec3): void {
  const R = Math.SQRT1_2;
  b.group({ at, scale: [w, 1, d] }, () =>
    b.lathe(
      [
        [0, 0],
        [R, 0],
        [R, lip],
        [0, h + lip],
      ],
      color,
      { segs: 4, rotY: Math.PI / 4 },
    ),
  );
}

/**
 * Low-pitched roof of clay pan-and-cover tiles (coppi): a gable `deg` degrees steep over w x d with the
 * ridge along X (or Z), a rounded ridge course, and (if `rib` > 0) the raised rows of cover tiles running
 * down each slope every `rib` metres, which is what makes an Italian roof read as one from a distance.
 * `at` is the wall-top centre.
 */
export function coppiRoof(
  b: Builder,
  w: number,
  d: number,
  deg: number,
  color: number,
  o: { at?: Vec3; ov?: number; ridge?: 'x' | 'z'; wall?: number; rib?: number; thick?: number } = {},
): number {
  const at = o.at ?? [0, 0, 0];
  const ov = o.ov ?? 0.45;
  const alongX = (o.ridge ?? 'x') === 'x';
  const span = alongX ? d : w;
  const run = alongX ? w : d;
  const half = span / 2;
  const h = half * Math.tan(deg * DEG);
  const thick = o.thick ?? 0.14;
  b.gable(w, d, h, color, { at, ridge: o.ridge, overhang: ov, thick, wall: o.wall });
  const tv = (thick * Math.hypot(half, h)) / half; // vertical thickness of the covering
  const top = at[1] + h + tv;
  const ridgeCol = tint(color, -0.06);
  b.group({ at: [at[0], 0, at[2]], rotY: alongX ? 0 : Math.PI / 2 }, () => {
    b.log(0.1, run + ov * 2 + 0.05, ridgeCol, { at: [0, top - 0.11, 0], segs: 6 });
    const rib = o.rib ?? 0;
    if (rib > 0) {
      const drop = (ov * h) / half;
      const n = Math.floor((run + ov * 2 - 0.2) / rib);
      const L = run + ov * 2;
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + 0.1 + ((L - 0.2) * i) / n;
        for (const s of [-1, 1]) {
          const p0: Vec3 = [x, at[1] - drop + tv + 0.02, s * (half + ov)];
          const p1: Vec3 = [x, top - 0.02, s * 0.12];
          b.beam(p0, p1, 0.09, 0.06, tint(color, 0.05), { jitter: false });
        }
      }
    }
  });
  return h;
}

/** Mono-pitch roof of coppi with a thickness, over w x d, low side towards `low`. `at` is its low-edge base centre. */
export function leanTo(b: Builder, w: number, d: number, h: number, color: number, at: Vec3, high: '+z' | '-z' | '+x' | '-x'): void {
  b.shed(w, d, h, color, { at, high });
  // a thin slab on top to give the covering an edge
  const alongZ = high === '+z' || high === '-z';
  const span = alongZ ? d : w;
  const ang = Math.atan2(h, span);
  const s = high === '+z' || high === '+x' ? 1 : -1;
  const len = Math.hypot(span, h) + 0.3;
  b.group({ at: [at[0], at[1] + h / 2, at[2]] }, () => {
    if (alongZ) b.box(w + 0.3, 0.1, len, color, { at: [0, 0, 0], rot: [-s * ang, 0, 0] });
    else b.box(len, 0.1, d + 0.3, color, { at: [0, 0, 0], rot: [0, 0, s * ang] });
  });
}

/**
 * A window with a plain stone or plaster surround, a sill, and a pair of shutters. `open` shows the two
 * leaves folded back against the wall either side; otherwise they are shut over the opening.
 * `louvred` paints horizontal slats (persiane, from the eighteenth century on).
 */
export function shuttered(
  b: Builder,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  facing: '+z' | '-z' | '+x' | '-x',
  o: { shutter?: number; surround?: number; open?: boolean; louvred?: boolean; frame?: number; glass?: number; sill?: boolean } = {},
): void {
  const [ox, oz] = out(facing);
  const ax = Math.abs(oz); // the wall runs along X when it faces ±z
  const az = Math.abs(ox);
  const at = (dx: number, dy: number, push = 0): Vec3 => [x + ax * dx + ox * push, y + dy, z + az * dx + oz * push];
  if (o.surround !== undefined) b.panel(w + 0.3, h + 0.28, o.surround, { at: at(0, -0.14), facing, depth: 0.04 });
  b.window(w, h, { at: at(0, 0), facing, frame: o.frame ?? P.white, glass: o.glass ?? P.windowDark, bars: o.louvred ? undefined : [2, 1], border: 0.06 });
  if (o.sill !== false) b.box(ax * (w + 0.3) + az * 0.22, 0.08, az * (w + 0.3) + ax * 0.22, o.surround ?? P.travertine, { at: at(0, -0.12, 0.1) });
  const sh = o.shutter;
  if (sh === undefined) return;
  const leaf = w / 2;
  const slats = (cx: number, push: number) => {
    if (!o.louvred) return;
    for (let k = 1; k < 5; k++) b.panel(leaf - 0.1, 0.03, tint(sh, -0.1), { at: at(cx, (h * k) / 5, push), facing, depth: 0.02 });
  };
  if (o.open) {
    for (const s of [-1, 1]) {
      const cx = s * (w / 2 + leaf / 2 + 0.04);
      b.panel(leaf, h, sh, { at: at(cx, 0, 0.02), facing, depth: 0.05 });
      slats(cx, 0.06);
    }
  } else {
    for (const s of [-1, 1]) {
      const cx = (s * leaf) / 2;
      b.panel(leaf - 0.02, h - 0.04, sh, { at: at(cx, 0.02, 0.06), facing, depth: 0.04 });
      slats(cx, 0.1);
    }
  }
}

/** An iron railing from p0 to p1 (top rail plus uprights every `gap` metres), `h` tall, standing on p0/p1. */
export function railing(b: Builder, p0: Vec3, p1: Vec3, h = 1.0, color: number = P.iron, gap = 0.14): void {
  const len = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
  const n = Math.max(1, Math.round(len / gap));
  const top = (p: Vec3): Vec3 => [p[0], p[1] + h, p[2]];
  b.beam(top(p0), top(p1), 0.05, 0.05, color, { jitter: false });
  b.beam([p0[0], p0[1] + 0.12, p0[2]], [p1[0], p1[1] + 0.12, p1[2]], 0.03, 0.03, color, { jitter: false });
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    b.box(0.025, h, 0.025, color, { at: [x, y, z], jitter: false });
  }
}

/** A washing line from p0 to p1 with `n` garments pegged on it. */
export function washing(b: Builder, p0: Vec3, p1: Vec3, n: number): void {
  b.beam(p0, p1, 0.02, 0.02, P.oakSilver, { jitter: false });
  const cols = [P.white, P.cream, P.doorBlue, P.pinkWash, P.limewash, P.intonacoRose, P.white, P.cladRed];
  const yaw = Math.atan2(-(p1[2] - p0[2]), p1[0] - p0[0]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.6) / (n + 0.2);
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    const w = b.range(0.4, 0.75);
    const h = b.range(0.45, 0.85);
    b.box(w, h, 0.03, b.pick(cols), { at: [x, y - h, z], rotY: yaw });
  }
}

/** A stone well-head (vera da pozzo) with an iron hoop and a pulley. */
export function wellHead(b: Builder, x: number, z: number, stone: number = P.travertine): void {
  b.cyl(0.62, 0.85, stone, { at: [x, 0, z], segs: 10 });
  b.cyl(0.66, 0.1, tint(stone, -0.05), { at: [x, 0.85, z], segs: 10 });
  b.cyl(0.48, 0.02, P.windowDark, { at: [x, 0.95, z], segs: 10 });
  for (const s of [-1, 1]) b.box(0.07, 1.4, 0.07, P.iron, { at: [x + s * 0.55, 0.9, z] });
  b.beam([x - 0.55, 2.3, z], [x + 0.55, 2.3, z], 0.07, 0.07, P.iron);
  b.cyl(0.14, 0.06, P.oakDark, { at: [x, 2.08, z - 0.03], rot: [Math.PI / 2, 0, 0], segs: 8 });
  b.cyl(0.13, 0.28, P.oakDark, { at: [x + 0.25, 0.95, z + 0.1], segs: 6 }); // bucket
}

/** A run of wattle hurdles (woven fence panels) with stakes, from p0 to p1 on the ground. */
export function hurdles(b: Builder, p0: [number, number], p1: [number, number], o: { h?: number; color?: number } = {}): void {
  const h = o.h ?? 1.0;
  const color = o.color ?? P.wattle;
  const dx = p1[0] - p0[0];
  const dz = p1[1] - p0[1];
  const len = Math.hypot(dx, dz);
  const n = Math.max(1, Math.round(len / 1.8));
  b.group({ at: [(p0[0] + p1[0]) / 2, 0, (p0[1] + p1[1]) / 2], rotY: Math.atan2(-dz, dx) }, () => {
    b.box(len, h * 0.85, 0.07, color, { at: [0, 0.08, 0] });
    for (let i = 0; i <= n; i++) b.box(0.09, h, 0.09, P.oak, { at: [-len / 2 + (len * i) / n, 0, 0] });
  });
}

/** A rough heap of rubble and broken brick. */
export function rubbleHeap(b: Builder, x: number, z: number, r: number, color: number = P.rubble): void {
  b.blob(r, color, { at: [x, 0, z], stretch: [1.4, 0.45, 1], detail: 0 });
  for (let i = 0; i < 4; i++) {
    b.box(b.range(0.25, 0.5), 0.18, b.range(0.2, 0.4), b.pick([P.brickRed, P.travertine, P.tufa]), {
      at: [x + b.range(-r, r), b.range(0, r * 0.25), z + b.range(-r * 0.6, r * 0.6)],
      rotY: b.range(0, 3),
    });
  }
}

/** A plain ledger shown as a small plaque on a wall. */
export function plaque(b: Builder, x: number, y: number, z: number, w: number, h: number, color: number, facing: Facing): void {
  b.panel(w, h, color, { at: [x, y, z], facing, depth: 0.05 });
}

/** A wall of reused material: courses of brick, tufa and the odd block of marble, all at slightly odd sizes. */
export function patchwork(b: Builder, w: number, h: number, t: number, at: [number, number, number], alongZ = false): void {
  const rows = Math.max(1, Math.round(h / 0.35));
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    let x = -w / 2;
    while (x < w / 2 - 0.05) {
      const len = Math.min(w / 2 - x, b.range(0.5, 1.4));
      const c = b.pick([P.brickRed, P.brickOrange, P.tufa, P.brickRed, P.travertine, P.rubble, P.peperino]);
      const cx = x + len / 2;
      const y = at[1] + r * rh;
      if (alongZ) b.box(t + b.range(-0.02, 0.04), rh, len, c, { at: [at[0], y, at[2] + cx], jitter: true });
      else b.box(len, rh, t + b.range(-0.02, 0.04), c, { at: [at[0] + cx, y, at[2]], jitter: true });
      x += len;
    }
  }
}

// ---------------------------------------------------------------- the medieval row (workers-row, raised-row)

/** The row of rented houses: five identical houses with an outside stair each. */
export const ROW = {
  n: 5,
  hw: 4.9, // house width
  zf: 4.6, // street front wall
  zb: -2.6, // back wall
  g: 3.0, // first-floor level
  top: 5.9, // wall top of the two-storey row
};

/** x centre of house i. */
export const rowX = (i: number): number => -(ROW.n * ROW.hw) / 2 + (i + 0.5) * ROW.hw;

/**
 * The two storeys of the medieval row, without its roof: stone walls, a profferlo (an outside stair on an
 * arch, rising along the front to a landing at the first-floor door) for each house, small round-headed
 * windows, an owner's shield on each front, back doors to the yard. `stairs[i] === false` leaves a house
 * without its stair (taken down or never built). Returns the front wall colour.
 */
export function medievalRow(b: Builder, stone: number, o: { stairs?: boolean[]; shield?: number; door?: number } = {}): void {
  const { n, hw, zf, zb, g, top } = ROW;
  const L = n * hw;
  const zc = (zf + zb) / 2;
  const D = zf - zb;
  const dark = tint(stone, -0.12);
  const door = o.door ?? P.oakDark;
  b.box(L, top, D, stone, { at: [0, 0, zc] });
  // string course at the first floor and coursing lines on the front
  b.box(L + 0.08, 0.14, D + 0.08, tint(stone, 0.05), { at: [0, g - 0.1, zc] });
  for (let y = 0.45; y < top - 0.2; y += 0.45) {
    if (Math.abs(y - g) < 0.2) continue;
    b.panel(L, 0.025, dark, { at: [0, y, zf], facing: '+z', depth: 0.015 });
  }
  for (let i = 0; i < n; i++) {
    const x = rowX(i);
    // party-wall pilaster strip between houses
    if (i > 0) b.box(0.3, top, 0.12, tint(stone, 0.04), { at: [x - hw / 2, 0, zf + 0.06] });
    const stair = o.stairs?.[i] ?? true;
    // landing at the right, stair rising from the left
    const lw = 1.35; // landing width along X
    const lx = x + hw / 2 - 0.2 - lw / 2;
    const ld = 1.25; // landing depth
    if (stair) {
      b.archWall(lw, g, ld, stone, { at: [lx, 0, zf + ld / 2], facing: '+z', openings: 1, openW: 0.95, openH: 2.2, shape: 'round' });
      b.box(lw + 0.1, 0.12, ld + 0.1, tint(stone, 0.05), { at: [lx, g, zf + ld / 2] });
      // parapet on the landing
      b.box(lw, 0.85, 0.2, stone, { at: [lx, g + 0.12, zf + ld - 0.1] });
      b.box(0.2, 0.85, ld - 0.2, stone, { at: [lx + lw / 2 - 0.1, g + 0.12, zf + (ld - 0.2) / 2] });
      // the flight: solid steps rising to the right along the front wall
      const x0 = x - hw / 2 + 0.35;
      const x1 = lx - lw / 2;
      const steps = 13;
      const run = (x1 - x0) / steps;
      const sd = 0.95;
      for (let k = 0; k < steps; k++) {
        b.box(run + 0.01, (g * (k + 1)) / steps, sd, k % 2 ? stone : tint(stone, 0.03), { at: [x0 + (k + 0.5) * run, 0, zf + sd / 2] });
      }
      // parapet up the flight
      b.beam([x0 + 0.1, 0.55, zf + sd - 0.09], [x1, g + 0.55, zf + sd - 0.09], 0.18, 0.75, stone);
      // ground-floor door under the landing arch, first-floor door on the landing
      b.panel(0.85, 1.95, door, { at: [lx, 0.02, zf], facing: '+z', shape: 'round', depth: 0.05 });
      b.panel(1.05, 2.15, dark, { at: [lx, g + 0.12, zf], facing: '+z', shape: 'round', depth: 0.03 });
      b.panel(0.85, 2.0, door, { at: [lx, g + 0.12, zf], facing: '+z', shape: 'round', depth: 0.06 });
    } else {
      b.panel(1.05, 2.25, dark, { at: [lx, 0, zf], facing: '+z', shape: 'round', depth: 0.03 });
      b.panel(0.9, 2.1, door, { at: [lx, 0, zf], facing: '+z', shape: 'round', depth: 0.06 });
      b.window(0.75, 1.2, { at: [lx, g + 0.9, zf], facing: '+z', shape: 'round', frame: dark, glass: P.windowDark, border: 0.08 });
    }
    // workshop window low on the left, a round-headed window upstairs over the stair foot
    if (!stair) b.window(0.7, 0.75, { at: [x - 1.35, 1.0, zf], facing: '+z', frame: dark, glass: P.windowDark, bars: [2, 1], border: 0.08 });
    b.window(0.7, 1.15, { at: [x - 1.0, g + 1.0, zf], facing: '+z', shape: 'round', frame: dark, glass: P.windowDark, border: 0.08 });
    b.box(0.85, 0.08, 0.14, tint(stone, 0.06), { at: [x - 1.0, g + 0.92, zf + 0.06] });
    // the owner's arms: a small stone shield
    const sx = x - 0.05;
    b.panel(0.55, 0.62, tint(stone, 0.08), { at: [sx, g + 1.35, zf], facing: '+z', depth: 0.06 });
    b.extrude(
      [
        [-0.17, 0.42],
        [0.17, 0.42],
        [0.17, 0.16],
        [0, 0],
        [-0.17, 0.16],
      ],
      0.06,
      o.shield ?? P.terracottaPainted,
      { at: [sx, g + 1.44, zf + 0.09] },
    );
    // back: a door and a window to the yard
    b.panel(0.85, 1.95, door, { at: [x + 1.0, 0.02, zb], facing: '-z', shape: 'round', depth: 0.06 });
    b.window(0.65, 1.0, { at: [x - 1.0, g + 1.0, zb], facing: '-z', shape: 'round', frame: dark, glass: P.windowDark, border: 0.08 });
    b.window(0.5, 0.5, { at: [x - 1.2, 1.4, zb], facing: '-z', frame: dark, glass: P.windowDark, border: 0.06 });
  }
  // the end walls: a small window each
  for (const s of [-1, 1]) b.window(0.5, 0.7, { at: [(s * L) / 2, g + 1.2, zc], facing: s > 0 ? '+x' : '-x', frame: dark, glass: P.windowDark, border: 0.06 });
}

/** A tenter frame: posts and rails with a length of cloth stretched on hooks to dry to size. */
export function tenter(b: Builder, x: number, z: number, len: number, cloth: number): void {
  for (let k = 0; k <= 3; k++) b.box(0.1, 1.6, 0.1, P.oak, { at: [x - len / 2 + (len * k) / 3, 0, z] });
  b.box(len + 0.2, 0.08, 0.08, P.oak, { at: [x, 1.55, z] });
  b.box(len + 0.2, 0.08, 0.08, P.oak, { at: [x, 0.45, z] });
  b.box(len - 0.1, 1.0, 0.03, cloth, { at: [x, 0.52, z + 0.06] });
}
