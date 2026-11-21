import { P, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** A square-section timber or bar running straight from p0 to p1. */
export function beam(b: Builder, p0: Vec3, p1: Vec3, t: number, color: number, tz = t): void {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const L = Math.hypot(dx, dy, dz);
  if (L < 1e-4) return;
  const theta = Math.acos(Math.max(-1, Math.min(1, dy / L)));
  const phi = Math.atan2(dx, dz);
  b.box(t, L, tz, color, { at: p0, rot: [theta, phi, 0] });
}

/** A run of posts and woven hurdle panels along a closed or open polyline, leaving out segments listed in `gaps`. */
export function hurdleFence(
  b: Builder,
  pts: [number, number][],
  h: number,
  o: { closed?: boolean; gaps?: number[]; color?: number; post?: number } = {},
): void {
  const color = o.color ?? P.wattle;
  const post = o.post ?? P.oak;
  const n = o.closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[(i + 1) % pts.length];
    b.cyl(0.07, h + 0.2, post, { at: [x0, 0, z0], segs: 5 });
    if (o.gaps?.includes(i)) continue;
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ang = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2;
    b.box(len, h, 0.08, color, { at: [(x0 + x1) / 2, 0.05, (z0 + z1) / 2], rotY: ang });
  }
  if (!o.closed) b.cyl(0.07, h + 0.2, post, { at: [pts[pts.length - 1][0], 0, pts[pts.length - 1][1]], segs: 5 });
}

/** Points on a rounded rectangle (superellipse) of half-sizes a (X) and c (Z), starting at the front centre. */
export function roundedRing(a: number, c: number, n: number, power = 4): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / power) * a;
    const z = Math.sign(st) * Math.pow(Math.abs(st), 2 / power) * c;
    pts.push([x, z]);
  }
  return pts;
}

/** Turn a local wall-space (u along the wall, v height) into world-ish coordinates for a facing. */
export function onWall(facing: Facing, offset: number, u: number, y: number): Vec3 {
  switch (facing) {
    case '+z':
      return [u, y, offset];
    case '-z':
      return [-u, y, -offset];
    case '+x':
      return [offset, y, -u];
    case '-x':
      return [-offset, y, u];
    default:
      return [u, y, offset];
  }
}

/** Outline of a shaped (Dutch) gable: curved shoulders stepping in to a pedimented top. */
export function dutchGable(w: number, h: number): [number, number][] {
  const a = w / 2;
  const pts: [number, number][] = [];
  const top = w * 0.3; // width of the upright top section
  const shoulderY = h * 0.48;
  // left side going up: vertical stub, an ogee shoulder, upright top, pediment
  pts.push([-a, 0], [-a, shoulderY * 0.55]);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // quarter-round convex shoulder sweeping in toward the top section
    const x = -a + (a - top / 2) * (1 - Math.cos((t * Math.PI) / 2));
    const y = shoulderY * 0.55 + (shoulderY - shoulderY * 0.55) * Math.sin((t * Math.PI) / 2) + t * h * 0.12;
    pts.push([x, y]);
  }
  const yTop = h * 0.84;
  pts.push([-top / 2, yTop], [-top / 2 - 0.12, yTop], [0, h], [top / 2 + 0.12, yTop], [top / 2, yTop]);
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const x = a - (a - top / 2) * (1 - Math.cos((t * Math.PI) / 2));
    const y = shoulderY * 0.55 + (shoulderY - shoulderY * 0.55) * Math.sin((t * Math.PI) / 2) + t * h * 0.12;
    pts.push([x, y]);
  }
  pts.push([a, shoulderY * 0.55], [a, 0]);
  return pts;
}

/** A Georgian-style sash window: white frame, glazing bars, stone sill. */
export function sash(
  b: Builder,
  at: Vec3,
  facing: Facing,
  w: number,
  h: number,
  o: { bars?: [number, number]; frame?: number; sill?: number; shape?: 'rect' | 'segmental' | 'round' } = {},
): void {
  b.window(w, h, { at, facing, frame: o.frame ?? P.white, bars: o.bars ?? [3, 4], shape: o.shape ?? 'rect', border: 0.08 });
  if (o.sill !== undefined) b.panel(w + 0.16, 0.1, o.sill, { at: [at[0], at[1] - 0.1, at[2]], facing, depth: 0.12 });
}

/**
 * Outline of an arched opening as [x, y] points with its base centred on 0. 'tudor' is a flattened
 * four-centred arch; `rise` is the height of the arched head above the springing.
 */
export function archOutline(w: number, h: number, rise: number, kind: 'tudor' | 'ogee' = 'tudor'): [number, number][] {
  const a = w / 2;
  const hs = h - rise;
  const pts: [number, number][] = [[-a, 0], [-a, hs]];
  const n = 6;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    let y: number;
    if (kind === 'tudor') {
      // tight curve at the haunch, then a nearly straight run to the apex
      y = hs + rise * (t < 0.3 ? Math.sin((t / 0.3) * (Math.PI / 2)) * 0.6 : 0.6 + ((t - 0.3) / 0.7) * 0.4);
    } else {
      y = hs + rise * (0.5 - 0.5 * Math.cos(t * Math.PI));
    }
    pts.push([-a + a * t, y]);
  }
  pts.push([0, h]);
  const left = pts.slice(2, pts.length - 1);
  for (let i = left.length - 1; i >= 0; i--) pts.push([-left[i][0], left[i][1]]);
  pts.push([a, hs], [a, 0]);
  return pts;
}

/** Place an extruded outline flat on a wall facing +Z at z, standing `depth` proud. */
export function flatOnFront(b: Builder, pts: [number, number][], x: number, y: number, z: number, depth: number, color: number): void {
  b.extrude(pts, depth, color, { at: [x, y, z + depth / 2 - 0.02] });
}

/** A carved bargeboard for a gable facing +Z: hangs under the verge, with a cusped lower edge. */
export function bargeboard(b: Builder, half: number, h: number, ov: number, x: number, y: number, z: number, color: number) {
  const drop = (ov * h) / half;
  const L: [number, number] = [-half - ov, -drop - 0.02];
  const R: [number, number] = [half + ov, -drop - 0.02];
  const apex: [number, number] = [0, h - 0.02];
  const n = 9;
  const inner = (side: 1 | -1) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; // 0 at apex, 1 at eaves
      const px = side * (half + ov) * t;
      const py = h - 0.02 - (h + drop) * t;
      const d = i % 2 === 0 ? 0.42 : 0.26;
      out.push([px, py - d]);
    }
    return out;
  };
  const right = inner(1).reverse(); // from eaves end back to apex
  const left = inner(-1); // from apex out to the left eaves
  const pts: [number, number][] = [L, apex, R, ...right, ...left.slice(1)];
  b.extrude(pts, 0.08, color, { at: [x, y, z] });
  // turned pendant and finial at the apex
  b.cyl(0.08, 1.2, color, { at: [x, y + h - 0.7, z], segs: 6 });
  b.cone(0.11, 0.3, color, { at: [x, y + h + 0.5, z], segs: 6 });
}

/**
 * A canted bay window against a wall facing +Z: trapezoid plan wBack wide at the wall, wFront wide
 * at the front, projecting proj. Returns the three faces (centre point and facing angle) so windows
 * can be placed on them.
 */
export function cantedBay(
  b: Builder,
  x: number,
  zWall: number,
  y0: number,
  h: number,
  wBack: number,
  wFront: number,
  proj: number,
  color: number,
): { at: [number, number]; facing: number; w: number }[] {
  const plan: [number, number][] = [
    [-wBack / 2, 0.02],
    [wBack / 2, 0.02],
    [wFront / 2, -proj],
    [-wFront / 2, -proj],
  ];
  b.extrude(plan, h, color, { at: [x, y0 + h / 2, zWall], rot: [-Math.PI / 2, 0, 0] });
  const side = (wBack - wFront) / 2;
  const ang = Math.atan2(proj, side);
  const sw = Math.hypot(side, proj);
  return [
    { at: [x - (wBack + wFront) / 4, zWall + proj / 2], facing: -ang, w: sw },
    { at: [x, zWall + proj], facing: 0, w: wFront },
    { at: [x + (wBack + wFront) / 4, zWall + proj / 2], facing: ang, w: sw },
  ];
}
