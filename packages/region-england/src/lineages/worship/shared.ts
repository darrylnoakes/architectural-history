import { P, tint, spread, facingAngle, type Builder, type Facing, type Vec3 } from '@ah/kit';

/*
 * Shared parts for the parish church. Orientation: the west end (tower, main door) is at +Z and
 * the altar end at -Z, so the south side faces +X and the north side -X.
 *
 * The plan is fixed across stages so surviving fabric lines up:
 *   Norman nave      x ±4,  z -5 .. 14     (kept to the end; becomes the arcades and clerestory)
 *   south door       x +4 (later re-set in the aisle wall), z = DOOR_Z
 *   chancel          x ±3,  z -5 .. -12 (+ apse) Norman, -5 .. -17 from Early English on
 *   aisles           x ±4 .. ±7.5 Early English, ±4 .. ±9 Decorated and later
 *   west tower       x ±3,  z 14 .. 20 Norman, x ±3.5, z 14 .. 21 Perpendicular
 */

export const DOOR_Z = 8.1;
/** Centres of the five aisle bays (west bay holds the south door). */
export const BAYS = spread(5, -4.5, 13.5);
export const BAY_EDGES = [-0.9, 2.7, 6.3, 9.9];
export const AISLE_Z: [number, number] = [-4.5, 13.5];

export type Arch = 'rect' | 'round' | 'triangle' | 'pointed' | 'lancet' | 'drop' | 'tudor' | 'ogee';
type Pt = [number, number];

// ------------------------------------------------------------------ arch geometry

/** How far the head of an arch of half-width a rises above its springing. */
export function rise(kind: Arch, a: number): number {
  switch (kind) {
    case 'rect':
      return 0;
    case 'round':
      return a;
    case 'triangle':
      return a;
    case 'pointed':
      return a * Math.sqrt(3);
    case 'lancet':
      return a * Math.sqrt(5);
    case 'drop':
      return a * 1.2247;
    case 'tudor':
      return a * 0.6;
    case 'ogee':
      return a * 1.5;
  }
}

/** Points along the head from the left springing (-a, ys) to the right springing (a, ys). */
function head(kind: Arch, a: number, ys: number, xc = 0): Pt[] {
  const out: Pt[] = [];
  const arc2 = (k: number) => {
    // two-centred arch with radius k·a
    const R = k * a;
    const cx = -a + R;
    const end = Math.acos((a - R) / R);
    const n = 3;
    const left: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const t = Math.PI + ((end - Math.PI) * i) / n;
      left.push([cx + R * Math.cos(t), R * Math.sin(t)]);
    }
    left[left.length - 1] = [0, left[left.length - 1][1]];
    return left;
  };
  let left: Pt[];
  switch (kind) {
    case 'rect':
      left = [[-a, 0], [0, 0]];
      break;
    case 'round': {
      left = [];
      for (let i = 0; i <= 3; i++) {
        const t = Math.PI - (Math.PI / 2) * (i / 3);
        left.push([a * Math.cos(t), a * Math.sin(t)]);
      }
      left[3] = [0, a];
      break;
    }
    case 'triangle':
      left = [[-a, 0], [0, a]];
      break;
    case 'pointed':
      left = arc2(2);
      break;
    case 'lancet':
      left = arc2(3);
      break;
    case 'drop':
      left = arc2(1.25);
      break;
    case 'tudor': {
      const r = a * 0.42;
      left = [];
      for (let i = 0; i <= 2; i++) {
        const t = Math.PI - (Math.PI / 3) * (i / 2);
        left.push([-a + r + r * Math.cos(t), r * Math.sin(t)]);
      }
      left.push([0, a * 0.6]);
      break;
    }
    case 'ogee':
      left = [[-1, 0], [-0.86, 0.5], [-0.5, 0.84], [-0.16, 1.12], [0, 1.5]].map(
        ([x, y]) => [x * a, y * a] as Pt,
      );
      break;
  }
  for (const [x, y] of left) out.push([xc + x, ys + y]);
  for (let i = left.length - 2; i >= 0; i--) out.push([xc - left[i][0], ys + left[i][1]]);
  return out;
}

/** Closed outline of an opening w wide and h tall (to the apex), bottom centre at (xc, y0). */
export function archPts(kind: Arch, w: number, h: number, xc = 0, y0 = 0): Pt[] {
  const a = w / 2;
  const ys = y0 + Math.max(0.05, h - rise(kind, a));
  const hd = head(kind, a, ys, xc);
  const pts: Pt[] = [[xc - a, y0], [xc + a, y0]];
  for (let i = hd.length - 1; i >= 0; i--) pts.push(hd[i]);
  return pts;
}

/** The y of the top edge of an outline at x (linear along its head). */
function topAt(poly: Pt[], x: number): number {
  let best = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    if ((x >= Math.min(x0, x1) && x <= Math.max(x0, x1)) && Math.abs(x1 - x0) > 1e-6) {
      const y = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      best = Math.max(best, y);
    }
  }
  return best;
}

function fits(poly: Pt[], outer: Pt[], m: number): boolean {
  const xs = outer.map((p) => p[0]);
  const lo = Math.min(...xs) + m;
  const hi = Math.max(...xs) - m;
  for (const [x, y] of poly) {
    if (x < lo || x > hi) return false;
    if (y > topAt(outer, x) - m) return false;
  }
  return true;
}

function circlePts(cx: number, cy: number, r: number, n = 10, foil = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rr = foil ? r * (1 - foil + foil * Math.abs(Math.cos(2 * t))) : r;
    out.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
  }
  return out;
}

// ------------------------------------------------------------------ windows and doors

export type Tracery = 'none' | 'twin' | 'plate' | 'geometric' | 'reticulated' | 'panel';

export interface WinOpts {
  kind: Arch;
  w: number;
  h: number;
  at: Vec3;
  facing: Facing;
  frame?: number;
  glass?: number;
  border?: number;
  tracery?: Tracery;
  lights?: number;
  /** Arch-shaped hood mould, or the square label of Perpendicular work. */
  hood?: 'none' | 'arch' | 'square';
  /** Show the deep splayed reveal of a small early window as a darker surround. */
  splay?: number;
  splayColor?: number;
}

/**
 * A window drawn as a stone panel pierced by its lights (the tracery), over a dark glazed panel.
 * Tracery: 'twin' two round lights (Saxon / Norman belfry), 'plate' two lancets and a pierced
 * circle, 'geometric' two pointed lights and a foiled circle, 'reticulated' ogee lights with a net
 * of ogee units above (Decorated), 'panel' straight mullions running up into the head (Perpendicular).
 */
export function win(b: Builder, o: WinOpts) {
  const frame = o.frame ?? P.limestone;
  const glass = o.glass ?? P.windowDark;
  const bd = o.border ?? Math.min(0.14, o.w * 0.1);
  const outer = archPts(o.kind, o.w, o.h);
  const iw = o.w - bd * 2;
  const inner = archPts(o.kind, iw, o.h - bd * 1.6, 0, bd);
  const tr = o.tracery ?? 'none';
  const holes: Pt[][] = [];
  const m = Math.max(0.045, Math.min(0.08, o.w * 0.035)); // half mullion
  const ysI = Math.max(...inner.filter((p) => p[1] > bd + 0.01).map((p) => p[1])) - rise(o.kind, iw / 2);

  const aw = iw - 2 * m; // width the lights may use, leaving a margin inside the opening
  const lightRow = (n: number, kind: Arch, topY: number, y0: number) => {
    const lw = (aw - 2 * m * (n - 1)) / n;
    const res: Pt[][] = [];
    for (let i = 0; i < n; i++) {
      const xc = -aw / 2 + lw / 2 + i * (lw + 2 * m);
      let h = topY - y0;
      let p = archPts(kind, lw, h, xc, y0);
      for (let k = 0; k < 40 && !fits(p, inner, m * 0.5); k++) {
        h -= 0.06;
        p = archPts(kind, lw, h, xc, y0);
      }
      res.push(p);
    }
    return { lights: res, lw };
  };

  if (tr === 'none') {
    holes.push(inner);
  } else if (tr === 'twin' || tr === 'plate' || tr === 'geometric' || tr === 'reticulated') {
    const n = o.lights ?? 2;
    const lk: Arch = tr === 'twin' ? 'round' : tr === 'reticulated' ? 'ogee' : tr === 'plate' ? 'lancet' : 'pointed';
    const lw0 = (aw - 2 * m * (n - 1)) / n;
    const lightTop = tr === 'twin' ? 99 : ysI + rise(lk, lw0 / 2) * 0.98;
    const { lights, lw } = lightRow(n, lk, Math.min(lightTop, o.h), bd);
    holes.push(...lights);
    const top = Math.max(...lights.map((l) => Math.max(...l.map((q) => q[1]))));
    const apex = o.h - bd * 0.8;
    if (tr === 'geometric' || tr === 'plate') {
      let r = (apex - top) / 2 - m;
      let c = circlePts(0, top + m + r, r, 12, tr === 'geometric' ? 0.3 : 0);
      for (let k = 0; k < 30 && r > 0.05 && !fits(c, inner, m); k++) {
        r *= 0.92;
        c = circlePts(0, top + m * 1.5 + r, r, 12, tr === 'geometric' ? 0.3 : 0);
      }
      if (r > 0.08) holes.push(c);
      if (tr === 'geometric' && n >= 3) {
        // two smaller trefoils either side
        for (const s of [-1, 1]) {
          let r2 = r * 0.55;
          let c2 = circlePts(s * (r + m * 2 + r2), top + m + r2, r2, 9, 0.25);
          for (let k = 0; k < 20 && r2 > 0.05 && !fits(c2, inner, m); k++) {
            r2 *= 0.9;
            c2 = circlePts(s * (r + m * 2 + r2), top + m + r2, r2, 9, 0.25);
          }
          if (r2 > 0.07 && fits(c2, inner, m)) holes.push(c2);
        }
      }
    } else if (tr === 'reticulated') {
      // net of ogee "reticulation units" sitting on the points of the lights
      const uw = lw + 2 * m;
      const uh = uw * 1.25;
      const unit = (cx: number, cy: number): Pt[] => {
        const a = uw / 2 - m;
        const hh = uh / 2 - m;
        return [
          [cx, cy - hh], [cx + a * 0.55, cy - hh * 0.55], [cx + a, cy - hh * 0.05], [cx + a * 0.8, cy + hh * 0.4],
          [cx + a * 0.35, cy + hh * 0.72], [cx, cy + hh], [cx - a * 0.35, cy + hh * 0.72], [cx - a * 0.8, cy + hh * 0.4],
          [cx - a, cy - hh * 0.05], [cx - a * 0.55, cy - hh * 0.55],
        ];
      };
      for (let row = 0; row < 4; row++) {
        const cy = top + m + uh / 2 + row * uh * 0.5;
        const off = row % 2 ? 0 : 0.5;
        for (let i = -n; i <= n; i++) {
          const cx = (i + off - 0.5 + (n % 2 ? 0.5 : 0)) * uw;
          const u = unit(cx, cy);
          if (fits(u, inner, m)) holes.push(u);
        }
      }
    }
  } else if (tr === 'panel') {
    const n = o.lights ?? 3;
    const lw = (aw - 2 * m * (n - 1)) / n;
    const transom = o.h > o.w * 1.6 ? bd + (ysI - bd) * 0.5 : 0;
    for (let i = 0; i < n; i++) {
      const xc = -aw / 2 + lw / 2 + i * (lw + 2 * m);
      const x0 = xc - lw / 2;
      const x1 = xc + lw / 2;
      // lower lights, with small arched heads at the transom and at the springing
      const segs: [number, number][] = transom ? [[bd, transom - m], [transom + m, ysI - m]] : [[bd, ysI - m]];
      for (const [y0, y1] of segs) {
        if (y1 - y0 > 0.2) holes.push(archPts('drop', lw, y1 - y0, xc, y0));
      }
      // tracery lights in the head: straight sides, top following the arch
      const yb = ysI + m;
      const top: Pt[] = [];
      for (let k = 0; k <= 3; k++) {
        const x = x1 - ((x1 - x0) * k) / 3;
        top.push([x, topAt(inner, x) - m * 1.2]);
      }
      if (Math.min(...top.map((p) => p[1])) - yb > 0.12) holes.push([[x0, yb], [x1, yb], ...top]);
    }
  }

  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    if (o.splay) {
      b.extrude(archPts(o.kind, o.w + o.splay * 2, o.h + o.splay, 0, -o.splay * 0.3), 0.04, o.splayColor ?? tint(frame, -0.12), {
        at: [0, 0, 0.0],
        jitter: false,
      });
    }
    b.extrude(outer, 0.05, glass, { at: [0, 0, 0.02], jitter: false });
    b.extrude(outer, 0.08, frame, { at: [0, 0, 0.06], holes, jitter: false });
    if (o.hood === 'arch' && o.kind !== 'rect') {
      const a = o.w / 2;
      const ys = o.h - rise(o.kind, a);
      const hw = 0.13;
      const outerH = head(o.kind, a + hw, ys);
      const innerH = head(o.kind, a, ys);
      // band between the two heads: outer left→right, then inner right→left
      const band: Pt[] = [[-a - hw, ys - 0.18], ...outerH, [a + hw, ys - 0.18], [a, ys - 0.18], ...innerH.slice().reverse()];
      b.extrude(band, 0.1, frame, { at: [0, 0, 0.07], jitter: false });
    } else if (o.hood === 'square') {
      const A = o.w / 2 + 0.2;
      const t = 0.13;
      const yt = o.h + 0.16;
      const yb = o.h - rise(o.kind, o.w / 2) - 0.25;
      b.extrude(
        [[-A, yb], [-A + t, yb], [-A + t, yt], [A - t, yt], [A - t, yb], [A, yb], [A, yt + t], [-A, yt + t]],
        0.1,
        frame,
        { at: [0, 0, 0.07], jitter: false },
      );
    }
  });
}

/** A door leaf set in an arched opening, with an optional moulded surround. */
export function door(
  b: Builder,
  o: { kind: Arch; w: number; h: number; at: Vec3; facing: Facing; leaf?: number; frame?: number; surround?: number; hood?: 'none' | 'arch' | 'square' },
) {
  const frame = o.frame ?? P.limestone;
  const s = o.surround ?? 0.18;
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    b.extrude(archPts(o.kind, o.w + s * 2, o.h + s), 0.06, frame, { at: [0, 0, 0.02], jitter: false });
    b.extrude(archPts(o.kind, o.w, o.h), 0.06, tint(frame, -0.35), { at: [0, 0, 0.04], jitter: false });
    b.extrude(archPts(o.kind, o.w - 0.1, o.h - 0.06, 0, 0), 0.05, o.leaf ?? P.oak, { at: [0, 0, 0.06] });
    if (o.hood === 'square') {
      const A = o.w / 2 + s + 0.12;
      const yt = o.h + s + 0.12;
      const yb = o.h - rise(o.kind, o.w / 2);
      b.extrude([[-A, yb], [-A + 0.12, yb], [-A + 0.12, yt], [A - 0.12, yt], [A - 0.12, yb], [A, yb], [A, yt + 0.12], [-A, yt + 0.12]], 0.12, frame, {
        at: [0, 0, 0.08],
        jitter: false,
      });
    }
  });
}

/**
 * Norman doorway: a plain tympanum over the door, then two receding orders of round arches on
 * jamb shafts with cushion capitals, the outer order carved with chevron (zigzag).
 */
export function normanDoor(b: Builder, at: Vec3, facing: Facing, stone: number, projection = true) {
  const dark = tint(stone, -0.3);
  const lite = tint(stone, 0.1);
  if (projection) {
    b.group({ at, rotY: facingAngle(facing) }, () => {
      // the doorway stands in a shallow projection of ashlar, capped by a little gable
      b.box(3.3, 4.1, 0.34, stone, { at: [0, 0, 0.07] });
      b.extrude([[-1.75, 0], [1.75, 0], [0, 0.9]], 0.34, stone, { at: [0, 4.1, 0.07] });
    });
  }
  b.group({ at, rotY: facingAngle(facing) }, () => b.group({ at: [0, 0, projection ? 0.24 : 0] }, () => {
    const a0 = 0.62; // half-width of the door
    const spring = 2.35;
    // shadowed recess of the orders, then the door leaf and tympanum
    b.extrude(archPts('round', 2 * 1.32, spring + 1.32), 0.05, dark, { at: [0, 0, 0.0], jitter: false });
    b.box(a0 * 2, spring, 0.08, P.oakDark, { at: [0, 0, 0.06] });
    b.extrude(archPts('round', a0 * 2, a0, 0, spring), 0.1, lite, { at: [0, 0, 0.08], jitter: false });
    b.box(a0 * 2 + 0.2, 0.18, 0.14, stone, { at: [0, spring - 0.1, 0.1] });
    // orders: plain roll, then chevron
    const ring = (r0: number, r1: number, z: number, col: number) => {
      const pts: Pt[] = [];
      for (let i = 0; i <= 10; i++) {
        const t = Math.PI - (Math.PI * i) / 10;
        pts.push([r1 * Math.cos(t), spring + r1 * Math.sin(t)]);
      }
      for (let i = 10; i >= 0; i--) {
        const t = Math.PI - (Math.PI * i) / 10;
        pts.push([r0 * Math.cos(t), spring + r0 * Math.sin(t)]);
      }
      b.extrude(pts, 0.16, col, { at: [0, 0, z], jitter: false });
    };
    ring(a0 + 0.02, 0.86, 0.12, stone);
    ring(0.92, 1.32, 0.1, stone);
    // chevron: a zigzag band standing proud of the outer order
    const n = 13;
    const ra = 0.98;
    const rb = 1.24;
    const zig: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const t = Math.PI - (Math.PI * i) / n;
      const r = i % 2 ? rb : ra;
      zig.push([r * Math.cos(t), spring + r * Math.sin(t)]);
    }
    const band: Pt[] = [...zig];
    for (let i = n; i >= 0; i--) {
      const t = Math.PI - (Math.PI * i) / n;
      const r = (i % 2 ? rb : ra) - 0.11;
      band.push([r * Math.cos(t), spring + r * Math.sin(t) + 0.06 * (i % 2 ? -1 : 1) * 0]);
    }
    b.extrude(band, 0.1, lite, { at: [0, 0, 0.2], jitter: false });
    // jamb shafts with cushion capitals
    for (const s of [-1, 1]) {
      for (const x of [0.89, 1.17]) {
        b.cyl(0.085, spring - 0.25, lite, { at: [s * x, 0, 0.16], segs: 6 });
        b.box(0.24, 0.24, 0.24, stone, { at: [s * x, spring - 0.25, 0.16] });
      }
      b.box(0.5, 0.25, 0.3, stone, { at: [s * 1.03, 0, 0.12] });
    }
  }));
}

// ------------------------------------------------------------------ masonry details

export type ButtressKind = 'pilaster' | 'stepped';

/**
 * A buttress against a wall. `at` is the foot of the buttress on the wall face, `facing` the
 * direction it projects. 'pilaster' is the broad, shallow Norman strip; 'stepped' the deep Gothic
 * buttress whose face steps back in stages, each with a sloping weathering.
 */
export function buttress(
  b: Builder,
  o: { at: Vec3; facing: Facing; h: number; proj?: number; w?: number; kind?: ButtressKind; color: number; steps?: number },
) {
  const kind = o.kind ?? 'stepped';
  const ang = facingAngle(o.facing);
  if (kind === 'pilaster') {
    const w = o.w ?? 1.1;
    const p = o.proj ?? 0.22;
    b.group({ at: o.at, rotY: ang }, () => b.box(w, o.h, p + 0.1, o.color, { at: [0, 0, p / 2 - 0.05] }));
    return;
  }
  const w = o.w ?? 0.7;
  const p = o.proj ?? 1.1;
  const k = o.steps ?? 2;
  const pts: Pt[] = [[-0.1, 0], [p, 0]];
  let cur = p;
  for (let i = 1; i <= k; i++) {
    const next = i === k ? 0 : p * (1 - (0.4 * i) / k);
    const y = (o.h * i) / (k + 0.15) - (cur - next) * 0.9;
    pts.push([cur, y]);
    pts.push([next, y + (cur - next) * 0.9]);
    cur = next;
  }
  pts.push([-0.1, Math.min(o.h, pts[pts.length - 1][1])]);
  b.group({ at: o.at, rotY: ang - Math.PI / 2 }, () => b.extrude(pts, w, o.color));
}

/** Long-and-short quoins at a corner (x, z); sx, sz give the outward directions of the two faces. */
export function quoins(b: Builder, x: number, z: number, sx: number, sz: number, h: number, color: number) {
  let y = 0.2;
  while (y < h - 0.5) {
    b.box(0.32, 0.85, 0.32, color, { at: [x - sx * 0.14, y, z - sz * 0.14] });
    y += 0.85;
    b.box(0.66, 0.2, 0.66, color, { at: [x - sx * 0.31, y, z - sz * 0.31] });
    y += 0.2;
  }
}

/** A straight row of merlons (battlements) from (x0, z0) to (x1, z1) on top of a parapet at height y. */
export function merlons(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, color: number, t = 0.36) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(2, Math.round(len / 1.5));
  const ang = Math.atan2(x1 - x0, z1 - z0);
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const mw = i === 0 || i === n ? 0.5 : 0.62;
    const ff = i === 0 ? mw / 2 / len : i === n ? 1 - mw / 2 / len : f;
    b.box(t, 0.55, mw, color, { at: [x0 + (x1 - x0) * ff, y, z0 + (z1 - z0) * ff], rotY: ang, jitter: false });
  }
}

/** A parapet wall (and optional battlements) along one edge, standing on the wall top at y. */
export function parapet(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, color: number, battle = true, t = 0.38) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ang = Math.atan2(x1 - x0, z1 - z0);
  b.box(t, 0.55, len, color, { at: [(x0 + x1) / 2, y, (z0 + z1) / 2], rotY: ang });
  b.box(t + 0.12, 0.12, len + 0.12, tint(color, 0.04), { at: [(x0 + x1) / 2, y - 0.12, (z0 + z1) / 2], rotY: ang });
  if (battle) merlons(b, x0, z0, x1, z1, y + 0.55, color, t);
}

/** A slender pinnacle: square shaft and a pyramidal top. */
export function pinnacle(b: Builder, at: Vec3, h: number, w: number, color: number) {
  b.group({ at }, () => {
    b.box(w, h * 0.42, w, color);
    b.box(w * 1.2, h * 0.05, w * 1.2, color, { at: [0, h * 0.42, 0] });
    b.cone(w * 0.62, h * 0.53, color, { at: [0, h * 0.47, 0], segs: 4, rotY: Math.PI / 4 });
  });
}

/** Ballflower: the little three-petalled ball ornament of the early fourteenth century, in a row. */
export function ballflower(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, color: number, step = 0.7) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.floor(len / step));
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    b.blob(0.11, color, { at: [x0 + (x1 - x0) * f, y, z0 + (z1 - z0) * f], detail: 0 });
  }
}

/** A stone churchyard cross on a stepped base. */
export function churchyardCross(b: Builder, at: Vec3, stone: number, broken = false) {
  b.group({ at }, () => {
    b.box(1.9, 0.3, 1.9, stone);
    b.box(1.4, 0.3, 1.4, stone, { at: [0, 0.3, 0] });
    b.box(0.95, 0.3, 0.95, stone, { at: [0, 0.6, 0] });
    b.box(0.55, 0.45, 0.55, stone, { at: [0, 0.9, 0] });
    const sh = broken ? 1.1 : 3.2;
    b.cyl(0.16, sh, stone, { at: [0, 1.35, 0], rTop: 0.12, segs: 8 });
    if (!broken) {
      b.box(0.8, 0.18, 0.18, stone, { at: [0, 4.0, 0] });
      b.box(0.18, 0.7, 0.18, stone, { at: [0, 3.8, 0] });
    }
  });
}

/** A Saxon-style tall preaching cross with a wheel head (a flat slab cross). */
export function saxonCross(b: Builder, at: Vec3, stone: number) {
  b.group({ at, rotY: Math.PI / 2 }, () => {
    b.box(0.9, 0.5, 0.7, stone);
    b.box(0.42, 3.2, 0.26, stone, { at: [0, 0.5, 0] });
    b.box(1.2, 0.36, 0.26, stone, { at: [0, 3.3, 0] });
    b.box(0.42, 0.55, 0.26, stone, { at: [0, 3.66, 0] });
    b.extrude(circlePts(0, 3.48, 0.52, 10), 0.18, tint(stone, -0.05), { at: [0, 0, 0], holes: [circlePts(0, 3.48, 0.36, 10)] });
  });
}

/** Unmarked grave mounds, aligned east-west. */
export function graveMounds(b: Builder, spots: [number, number][], color: number) {
  for (const [x, z] of spots) b.blob(0.5, color, { at: [x, 0, z], stretch: [0.75, 0.35, 2.0], detail: 0 });
}

// ------------------------------------------------------------------ the church

export interface RoofSpec {
  /** Rise of the roof above the wall top. */
  rise: number;
  color: number;
  /** Parapet along the eaves: none, plain, or battlemented. */
  parapet?: 'none' | 'plain' | 'battle';
  overhang?: number;
}

export interface WinSpec {
  kind: Arch;
  w: number;
  h: number;
  sill: number;
  tracery?: Tracery;
  lights?: number;
  hood?: 'none' | 'arch' | 'square';
  splay?: number;
  /** Several identical openings side by side (a pair of lancets). */
  count?: number;
  gap?: number;
}

export interface ChurchSpec {
  wall: number;
  dress: number;
  /** Plinth and string-course style. */
  plinth?: boolean;
  nave: {
    hw: number;
    z0: number;
    z1: number;
    h: number;
    roof: RoofSpec;
    /** z positions of nave side windows (only where no aisle hides the wall). */
    windows?: { z: number[]; spec: WinSpec };
    buttress?: { kind: ButtressKind; z: number[] };
    corbels?: boolean;
    quoins?: boolean;
    pilasters?: number[];
    clerestory?: { z: number[]; spec: WinSpec; from: number; wall?: number };
    westWin?: WinSpec;
    wall?: number;
  };
  chancel: {
    hw: number;
    len: number;
    h: number;
    roof: RoofSpec;
    apse?: boolean;
    windows: { z: number[]; spec: WinSpec };
    east?: (b: Builder, at: Vec3) => void;
    buttress?: { kind: ButtressKind; z: number[]; corners?: boolean };
    priestDoor?: Arch;
    priestDoorZ?: number;
    corbels?: boolean;
    wall?: number;
    quoins?: boolean;
    pilasters?: number[];
  };
  aisles?: {
    w: number;
    h: number;
    roof: RoofSpec;
    spec: WinSpec;
    buttress: ButtressKind;
    pinnacles?: boolean;
    ballflower?: boolean;
    wall?: number;
  };
  southDoor: 'saxon' | 'norman';
}

const sideFacing = (s: number): Facing => (s > 0 ? '+x' : '-x');

function corbelRow(b: Builder, x: number, z0: number, z1: number, y: number, color: number) {
  const n = Math.round(Math.abs(z1 - z0) / 1.0);
  for (const z of spread(n, z0, z1)) b.box(0.24, 0.26, 0.3, color, { at: [x, y - 0.26, z] });
  b.box(0.12, 0.14, Math.abs(z1 - z0), color, { at: [x - Math.sign(x) * 0.02, y - 0.04, (z0 + z1) / 2] });
}

/** Covers a rectangle with a ridged roof along Z, with optional parapets on the long sides. */
function roofZ(b: Builder, cx: number, cz: number, w: number, d: number, y: number, r: RoofSpec, wall: number, dress: number) {
  const par = r.parapet ?? 'none';
  if (par === 'none') {
    b.gable(w, d, r.rise, r.color, { at: [cx, y, cz], ridge: 'z', overhang: r.overhang ?? 0.3, wall });
  } else {
    b.gable(w - 0.6, d - 0.2, r.rise, r.color, { at: [cx, y + 0.15, cz], ridge: 'z', overhang: 0, wall });
    for (const s of [-1, 1]) parapet(b, cx + (s * (w - 0.38)) / 2, cz - d / 2, cx + (s * (w - 0.38)) / 2, cz + d / 2, y, dress, par === 'battle');
  }
}

/**
 * Lean-to roof over an aisle on side s (+1 south, -1 north): a sloping slab of roofing over a
 * wedge of wall, so the end triangles read as masonry. High edge against the nave.
 */
export function leanTo(b: Builder, s: number, cx: number, cz: number, w: number, len: number, y: number, rise: number, roof: number, wall: number, ov: number) {
  b.group({ at: [cx, y, cz], rotY: s > 0 ? 0 : Math.PI }, () => {
    b.shed(w, len, rise, wall, { high: '-x', jitter: false });
    const k = rise / w;
    const t = 0.16;
    b.extrude(
      [[-w / 2 - 0.05, rise + 0.05 * k], [w / 2 + ov, -ov * k], [w / 2 + ov, -ov * k + t], [-w / 2 - 0.05, rise + 0.05 * k + t]],
      len + ov * 1.4,
      roof,
    );
  });
}

export function church(b: Builder, c: ChurchSpec) {
  const { dress } = c;
  const N = c.nave;
  let wall = N.wall ?? c.wall;
  const nLen = N.z1 - N.z0;
  const nCz = (N.z0 + N.z1) / 2;

  // ---------------- nave
  if (c.plinth) b.box(N.hw * 2 + 0.3, 0.45, nLen + 0.3, tint(wall, -0.05), { at: [0, 0, nCz] });
  if (N.clerestory) {
    const cf = N.clerestory.from;
    b.box(N.hw * 2, cf, nLen, wall, { at: [0, 0, nCz] });
    b.box(N.hw * 2, N.h - cf, nLen, N.clerestory.wall ?? wall, { at: [0, cf, nCz] });
  } else b.box(N.hw * 2, N.h, nLen, wall, { at: [0, 0, nCz] });
  roofZ(b, 0, nCz, N.hw * 2, nLen, N.h, N.roof, N.clerestory?.wall ?? wall, dress);
  if (N.quoins) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) quoins(b, sx * N.hw, sz > 0 ? N.z1 : N.z0, sx, sz, N.h, dress);
  }
  for (const s of [-1, 1]) {
    if (N.corbels && !c.aisles) corbelRow(b, s * (N.hw + 0.1), N.z0 + 0.4, N.z1 - 0.4, N.h, dress);
    for (const z of N.pilasters ?? []) b.box(0.32, N.h - 0.4, 0.2, dress, { at: [s * (N.hw + 0.06), 0.2, z], rotY: Math.PI / 2 });
    if (N.windows && !c.aisles) {
      for (const z of N.windows.z) placeWin(b, N.windows.spec, [s * N.hw, 0, z], sideFacing(s), dress, wall);
    }
    if (N.buttress && !c.aisles) {
      for (const z of N.buttress.z) buttress(b, { at: [s * N.hw, 0, z], facing: sideFacing(s), h: N.h - 0.3, kind: N.buttress.kind, color: wall });
    }
    if (N.clerestory) {
      for (const z of N.clerestory.z) placeWin(b, N.clerestory.spec, [s * N.hw, 0, z], sideFacing(s), dress, wall);
    }
  }
  if (N.westWin) placeWin(b, N.westWin, [0, 0, N.z1], '+z', dress, wall);

  // ---------------- chancel
  const C = c.chancel;
  wall = C.wall ?? c.wall;
  const cz0 = N.z0 - C.len;
  const cCz = (N.z0 + cz0) / 2;
  if (c.plinth) b.box(C.hw * 2 + 0.3, 0.45, C.len + 0.3, tint(wall, -0.05), { at: [0, 0, cCz] });
  b.box(C.hw * 2, C.h, C.len, wall, { at: [0, 0, cCz] });
  roofZ(b, 0, cCz, C.hw * 2, C.len, C.h, C.roof, wall, dress);
  if (C.apse) {
    b.cyl(C.hw, C.h, wall, { at: [0, 0, cz0], segs: 14 });
    b.cone(C.hw + 0.3, C.roof.rise * ((C.hw + 0.3) / C.hw), C.roof.color, { at: [0, C.h - 0.3 * (C.roof.rise / C.hw), cz0], segs: 14 });
    for (const t of [-0.55, 0, 0.55]) {
      const a = Math.PI + t; // pointing -z
      buttress(b, { at: [Math.sin(a) * C.hw, 0, cz0 + Math.cos(a) * C.hw], facing: a, h: C.h - 0.2, kind: 'pilaster', w: 0.8, color: wall });
    }
    for (const t of [-0.28, 0.28]) {
      const a = Math.PI + t;
      placeWin(b, C.windows.spec, [Math.sin(a) * (C.hw - 0.02), 0, cz0 + Math.cos(a) * (C.hw - 0.02)], a, dress, wall);
    }
  }
  if (C.quoins) {
    for (const sx of [-1, 1]) quoins(b, sx * C.hw, cz0, sx, -1, C.h, dress);
  }
  for (const s of [-1, 1]) {
    if (C.corbels) corbelRow(b, s * (C.hw + 0.1), cz0 + 0.3, N.z0 - 0.3, C.h, dress);
    for (const z of C.pilasters ?? []) b.box(0.32, C.h - 0.4, 0.2, dress, { at: [s * (C.hw + 0.06), 0.2, z], rotY: Math.PI / 2 });
    for (const z of C.windows.z) placeWin(b, C.windows.spec, [s * C.hw, 0, z], sideFacing(s), dress, wall);
    if (C.buttress) {
      for (const z of C.buttress.z) buttress(b, { at: [s * C.hw, 0, z], facing: sideFacing(s), h: C.h - 0.3, kind: C.buttress.kind, color: wall });
      if (C.buttress.corners) {
        buttress(b, { at: [s * (C.hw - 0.4), 0, cz0], facing: '-z', h: C.h - 0.3, kind: C.buttress.kind, color: wall });
        buttress(b, { at: [s * C.hw, 0, cz0 + 0.4], facing: sideFacing(s), h: C.h - 0.3, kind: C.buttress.kind, color: wall });
      }
    }
  }
  if (C.priestDoor) door(b, { kind: C.priestDoor, w: 0.85, h: 2.1, at: [C.hw, 0, C.priestDoorZ ?? cz0 + C.len * 0.38], facing: '+x', frame: dress });
  if (C.east && !C.apse) C.east(b, [0, 0, cz0]);

  // ---------------- aisles
  const A = c.aisles;
  if (A) {
    wall = A.wall ?? c.wall;
    const [az0, az1] = AISLE_Z;
    const aLen = az1 - az0;
    const aCz = (az0 + az1) / 2;
    for (const s of [-1, 1]) {
      const cx = s * (N.hw + A.w / 2);
      const ox = s * (N.hw + A.w);
      if (c.plinth) b.box(A.w + 0.3, 0.45, aLen + 0.3, tint(wall, -0.05), { at: [cx + s * 0.15, 0, aCz] });
      b.box(A.w, A.h, aLen, wall, { at: [cx, 0, aCz] });
      const par = A.roof.parapet ?? 'none';
      if (par === 'none') {
        leanTo(b, s, cx, aCz, A.w, aLen, A.h, A.roof.rise, A.roof.color, wall, 0.35);
      } else {
        leanTo(b, s, cx - s * 0.2, aCz, A.w - 0.4, aLen - 0.4, A.h + 0.1, A.roof.rise, A.roof.color, wall, 0);
        parapet(b, ox - s * 0.19, az0, ox - s * 0.19, az1, A.h, dress, par === 'battle');
        // gabled end walls stepping up to the nave
        for (const z of [az0 + 0.19, az1 - 0.19]) {
          b.box(A.w, 0.55, 0.38, dress, { at: [cx, A.h, z] });
        }
      }
      // windows in the bays, the south door in the west bay of the south aisle
      BAYS.forEach((z, i) => {
        if (s > 0 && i === 3) return;
        placeWin(b, A.spec, [ox, 0, z], sideFacing(s), dress, wall);
      });
      // end windows facing east and west
      const endSpec: WinSpec = { ...A.spec, w: Math.min(A.spec.w, A.w - 1.6) };
      placeWin(b, endSpec, [cx + s * 0.2, 0, az0], '-z', dress, wall);
      if (A.w > 4) placeWin(b, endSpec, [cx + s * 0.2, 0, az1], '+z', dress, wall);
      for (const z of BAY_EDGES) {
        buttress(b, { at: [ox, 0, z], facing: sideFacing(s), h: A.h - 0.2, kind: A.buttress, color: wall, proj: A.buttress === 'stepped' ? 1.0 : 0.22 });
        if (A.pinnacles) pinnacle(b, [ox - s * 0.15, A.h + 0.4, z], 2.0, 0.42, dress);
      }
      // corner buttresses at the angles of the aisle
      for (const [z, f] of [[az0, '-z'], [az1, '+z']] as [number, Facing][]) {
        buttress(b, { at: [ox - s * 0.4, 0, z], facing: f, h: A.h - 0.2, kind: A.buttress, color: wall, proj: A.buttress === 'stepped' ? 0.9 : 0.22 });
        buttress(b, { at: [ox, 0, z - Math.sign(z) * 0.4], facing: sideFacing(s), h: A.h - 0.2, kind: A.buttress, color: wall, proj: A.buttress === 'stepped' ? 0.9 : 0.22 });
        if (A.pinnacles) pinnacle(b, [ox - s * 0.2, A.h + 0.4, z - Math.sign(z) * 0.2], 2.0, 0.42, dress);
      }
      if (A.ballflower) ballflower(b, ox + s * 0.05, az0 + 0.6, ox + s * 0.05, az1 - 0.6, A.h - 0.35, dress, 0.6);
    }
  }

  wall = c.wall;
  // ---------------- south doorway
  const dx = A ? N.hw + A.w : N.hw;
  if (c.southDoor === 'norman') normanDoor(b, [dx, 0, DOOR_Z], '+x', dress, !A);
  else {
    // Saxon: tall, narrow, round-headed, with massive plain jambs
    door(b, { kind: 'round', w: 0.95, h: 2.9, at: [dx, 0, DOOR_Z], facing: '+x', frame: dress, surround: 0.3, leaf: P.oakDark });
  }
}

export function placeWin(b: Builder, s: WinSpec, at: Vec3, facing: Facing, frame: number, wall: number) {
  const n = s.count ?? 1;
  const gap = s.gap ?? s.w * 0.6;
  b.group({ at, rotY: facingAngle(facing) }, () => {
    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * (s.w + gap);
      win(b, {
        kind: s.kind,
        w: s.w,
        h: s.h,
        at: [dx, s.sill, 0],
        facing: '+z',
        frame,
        tracery: s.tracery,
        lights: s.lights,
        hood: s.hood,
        splay: s.splay,
        splayColor: tint(wall, -0.1),
      });
    }
  });
}

// ------------------------------------------------------------------ towers

export interface TowerSpec {
  size: number;
  z: number;
  h: number;
  wall: number;
  dress: number;
  corners: 'clasping' | 'diagonal' | 'none';
  courses: number[];
  belfry: { spec: WinSpec; n: number };
  lower?: WinSpec[];
  westDoor?: Arch;
  westWin?: WinSpec;
  top: 'pyramid' | 'broach' | 'spire' | 'battle';
  topColor?: number;
  spireH?: number;
  clock?: number;
}

export function tower(b: Builder, t: TowerSpec) {
  const s = t.size;
  const hs = s / 2;
  const { wall, dress } = t;
  b.box(s + 0.3, 0.5, s + 0.3, tint(wall, -0.05), { at: [0, 0, t.z] });
  b.box(s, t.h, s, wall, { at: [0, 0, t.z] });
  for (const y of t.courses) b.box(s + 0.14, 0.16, s + 0.14, dress, { at: [0, y, t.z] });

  // corner buttresses
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cx = sx * hs;
      const cz = t.z + sz * hs;
      if (t.corners === 'clasping') {
        b.box(1.2, t.h - 0.6, 1.2, wall, { at: [cx - sx * 0.48, 0, cz - sz * 0.48] });
      } else if (t.corners === 'diagonal' && sz > 0) {
        const a = Math.atan2(sx, sz);
        buttress(b, { at: [cx - sx * 0.25, 0, cz - sz * 0.25], facing: a, h: t.h * 0.78, proj: 1.7, w: 0.85, color: wall, steps: 4 });
      } else if (t.corners === 'diagonal') {
        buttress(b, { at: [cx, 0, cz + 0.5], facing: sx > 0 ? '+x' : '-x', h: t.h * 0.6, proj: 1.0, w: 0.8, color: wall, steps: 3 });
      }
    }
  }

  // belfry openings on all four faces
  const faces: [Facing, (o: number) => Vec3][] = [
    ['+z', (o) => [o, 0, t.z + hs]],
    ['-z', (o) => [o, 0, t.z - hs]],
    ['+x', (o) => [hs, 0, t.z + o]],
    ['-x', (o) => [-hs, 0, t.z + o]],
  ];
  for (const [f, p] of faces) {
    const offs = t.belfry.n === 1 ? [0] : spread(t.belfry.n, -hs * 0.75, hs * 0.75);
    for (const o of offs) placeWin(b, t.belfry.spec, p(o), f, dress, wall);
  }
  for (const w of t.lower ?? []) {
    placeWin(b, w, [0, 0, t.z + hs], '+z', dress, wall);
    placeWin(b, w, [hs, 0, t.z], '+x', dress, wall);
    placeWin(b, w, [-hs, 0, t.z], '-x', dress, wall);
  }
  if (t.westDoor) door(b, { kind: t.westDoor, w: 1.5, h: 3.0, at: [0, 0.3, t.z + hs], facing: '+z', frame: dress, hood: t.westDoor === 'tudor' ? 'square' : 'none' });
  if (t.westWin) placeWin(b, t.westWin, [0, 0, t.z + hs], '+z', dress, wall);
  if (t.clock) {
    for (const [f, p] of [['+z', [0, t.clock, t.z + hs]], ['+x', [hs, t.clock, t.z]]] as [Facing, Vec3][]) {
      b.group({ at: p, rotY: facingAngle(f) }, () => {
        b.panel(2.0, 2.0, P.gold, { shape: 'circle', depth: 0.06 });
        b.panel(1.8, 1.8, P.black, { at: [0, 0.1, 0], shape: 'circle', depth: 0.09 });
        b.panel(0.1, 0.7, P.gold, { at: [0, 1.0, 0], depth: 0.12 });
        b.panel(0.1, 0.5, P.gold, { at: [0.22, 0.95, 0], depth: 0.13, rotY: 0, rot: [0, 0, -1.6] });
      });
    }
  }

  // top
  const top = t.topColor ?? P.lead;
  if (t.top === 'pyramid') {
    b.pyramid(s + 0.3, s + 0.3, s * 0.38, top, { at: [0, t.h, t.z] });
  } else if (t.top === 'broach') {
    const H = t.spireH ?? 12;
    // octagonal spire with its flats facing the cardinal points; a squat square pyramid fills the
    // corners of the tower, its sloping faces forming the triangular broaches.
    b.cone(hs / Math.cos(Math.PI / 8), H, top, { at: [0, t.h, t.z], segs: 8, rotY: Math.PI / 8 });
    b.cone(hs * Math.SQRT2, H * 0.32, top, { at: [0, t.h, t.z], segs: 4, rotY: Math.PI / 4 });
    // spire lights (lucarnes) on the cardinal faces
    const ly = t.h + H * 0.28;
    const lr = hs * (1 - 0.28) + 0.05;
    for (const [f, x, z] of [['+z', 0, lr], ['-z', 0, -lr], ['+x', lr, 0], ['-x', -lr, 0]] as [Facing, number, number][]) {
      b.group({ at: [x, ly, t.z + z], rotY: facingAngle(f) }, () => {
        b.box(0.9, 1.2, 0.9, dress, { at: [0, 0, -0.2] });
        b.gable(0.9, 1.0, 0.6, top, { at: [0, 1.2, -0.2], ridge: 'z', overhang: 0.06, wall: dress });
        b.panel(0.4, 0.9, P.windowDark, { at: [0, 0.15, 0.25], shape: 'pointed' });
      });
    }
    b.cyl(0.04, 1.2, P.iron, { at: [0, t.h + H, t.z], segs: 4 });
  } else if (t.top === 'spire') {
    const H = t.spireH ?? 16;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) pinnacle(b, [sx * (hs - 0.3), t.h + 0.6, t.z + sz * (hs - 0.3)], 2.8, 0.5, dress);
    for (const [x0, z0, x1, z1] of [[-hs, hs, hs, hs], [-hs, -hs, hs, -hs], [hs, -hs, hs, hs], [-hs, -hs, -hs, hs]]) {
      parapet(b, x0 * 0.94, t.z + z0 * 0.94, x1 * 0.94, t.z + z1 * 0.94, t.h, dress, false);
    }
    const r = (hs - 0.6) / Math.cos(Math.PI / 8);
    b.cone(r, H, t.topColor ?? dress, { at: [0, t.h, t.z], segs: 8, rotY: Math.PI / 8 });
    // a tier of spire lights
    const ly = t.h + H * 0.12;
    const lr = (hs - 0.6) * (1 - 0.12);
    for (const [f, x, z] of [['+z', 0, lr], ['-z', 0, -lr], ['+x', lr, 0], ['-x', -lr, 0]] as [Facing, number, number][]) {
      b.group({ at: [x, ly, t.z + z], rotY: facingAngle(f) }, () => {
        b.box(0.8, 1.3, 0.8, dress, { at: [0, 0, -0.2] });
        b.gable(0.8, 1.0, 0.7, dress, { at: [0, 1.3, -0.2], ridge: 'z', overhang: 0.04 });
        b.panel(0.36, 1.0, P.windowDark, { at: [0, 0.15, 0.25], shape: 'pointed' });
      });
    }
    b.cyl(0.04, 1.2, P.iron, { at: [0, t.h + H, t.z], segs: 4 });
  } else {
    const y = t.h;
    for (const [x0, z0, x1, z1] of [[-hs, hs, hs, hs], [-hs, -hs, hs, -hs], [hs, -hs, hs, hs], [-hs, -hs, -hs, hs]]) {
      parapet(b, x0 * 0.95, t.z + z0 * 0.95, x1 * 0.95, t.z + z1 * 0.95, y, dress, true, 0.42);
    }
    b.pyramid(s - 0.8, s - 0.8, 0.6, P.lead, { at: [0, y, t.z] });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) pinnacle(b, [sx * (hs - 0.15), y, t.z + sz * (hs - 0.15)], 4.2, 0.62, dress);
      pinnacle(b, [sx * (hs - 0.15), y + 0.55, t.z], 2.4, 0.4, dress);
      pinnacle(b, [0, y + 0.55, t.z + sx * (hs - 0.15)], 2.4, 0.4, dress);
    }
    b.cyl(0.05, 2.4, P.iron, { at: [hs - 0.15, y + 4.2, t.z + hs - 0.15], segs: 4 });
  }
}

// ------------------------------------------------------------------ porch

export function porch(b: Builder, o: { wall: number; dress: number; x: number; z: number; d: number; w: number; h: number; roof: RoofSpec; arch: Arch; upper?: boolean }) {
  const { wall, dress } = o;
  const cx = o.x + o.d / 2;
  const t = 0.5;
  // side walls
  for (const s of [-1, 1]) b.box(o.d, o.h, t, wall, { at: [cx, 0, o.z + s * (o.w / 2 - t / 2)] });
  // front wall with the entrance arch cut through it
  const front: Pt[] = o.roof.parapet && o.roof.parapet !== 'none'
    ? [[-o.w / 2, 0], [o.w / 2, 0], [o.w / 2, o.h], [-o.w / 2, o.h]]
    : [[-o.w / 2, 0], [o.w / 2, 0], [o.w / 2, o.h], [0, o.h + o.roof.rise], [-o.w / 2, o.h]];
  const aw = o.w - 1.4;
  const ah = o.arch === 'tudor' ? 2.6 : 3.0;
  b.group({ at: [o.x + o.d, 0, o.z], rotY: Math.PI / 2 }, () => {
    // build as two pieces: the wall around the arch (with a hole lifted 1 cm) and a sill strip
    b.extrude(front, t, wall, { at: [0, 0, -t / 2], holes: [archPts(o.arch, aw, Math.min(ah, o.h - 0.3), 0, 0.02)] });
    b.extrude(archPts(o.arch, aw + 0.36, Math.min(ah, o.h - 0.3) + 0.18, 0, 0), 0.06, dress, {
      at: [0, 0, 0.02],
      holes: [archPts(o.arch, aw, Math.min(ah, o.h - 0.3), 0, 0.02)],
      jitter: false,
    });
    if (o.upper) {
      win(b, { kind: 'tudor', w: 1.0, h: 1.1, at: [0, o.h - 1.9, 0.0], facing: '+z', frame: dress, tracery: 'panel', lights: 2, hood: 'square' });
      b.box(1.2, 0.7, 0.3, dress, { at: [0, o.h - 0.75, 0.05] });
      b.box(0.5, 0.6, 0.12, tint(dress, -0.25), { at: [0, o.h - 0.7, 0.2] });
    }
  });
  b.box(0.2, 0.06, o.w, wall, { at: [o.x + o.d - 0.1, 0, o.z] });
  // roof
  if (!o.roof.parapet || o.roof.parapet === 'none') {
    b.gable(o.d, o.w, o.roof.rise, o.roof.color, { at: [cx + 0.1, o.h, o.z], ridge: 'x', overhang: 0.2, wall });
  } else {
    b.box(o.d, 0.3, o.w, o.roof.color, { at: [cx, o.h, o.z] });
    parapet(b, o.x + o.d - 0.19, o.z - o.w / 2, o.x + o.d - 0.19, o.z + o.w / 2, o.h, dress, o.roof.parapet === 'battle');
    for (const s of [-1, 1]) parapet(b, o.x, o.z + s * (o.w / 2 - 0.19), o.x + o.d - 0.38, o.z + s * (o.w / 2 - 0.19), o.h, dress, o.roof.parapet === 'battle');
  }
  // corner buttresses
  for (const s of [-1, 1]) {
    buttress(b, { at: [o.x + o.d - 0.3, 0, o.z + s * o.w / 2], facing: s > 0 ? '+z' : '-z', h: o.h * 0.8, proj: 0.7, w: 0.55, color: wall });
  }
}
