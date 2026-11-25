import * as THREE from 'three';
import { P, mix, tint, type Builder, type Vec3 } from '@ah/kit';

/*
 * Shared parts for the cathedral. The entrance (west) front is at +Z and the choir at -Z, so the
 * south side faces +X and the north side -X. From the Romanesque cathedral on it is one building
 * that grows, on a fixed plan, so what survives stays exactly where it was:
 *
 *   nave             x ±4 (NW), from the crossing (z -4.5) to the west front
 *   aisles           x ±4 .. ±7.8 (AW)
 *   crossing         z -4.5 .. -12.5, transept arms out to x ±14 (TW)
 *   choir            straight bays z -12.5 .. -20.5, then the hemicycle centred on z -20.5
 *   ambulatory       radius 7.8 round the hemicycle, radiating chapels beyond it
 *   Romanesque front twin towers x ±6.2, z 16.3 .. 21.5 (FZ)
 *   Gothic front     towers x ±4 .. ±11, z 14.5 .. 21.5; porches project to z 23.4
 *   houses           against the north (-X) side of the nave, from the thirteenth century to 1850
 *
 * Wall details are flat shapes laid a few centimetres proud of the wall (the material is double
 * sided), which keeps a cathedral with two hundred windows inside its triangle budget.
 */

export type Pt = [number, number];
export type Arch = 'rect' | 'round' | 'pointed' | 'lancet' | 'ogee';

// ------------------------------------------------------------------ phases of the one building

export const ROMANESQUE = 0;
export const EARLY = 1;
export const HIGH = 2;
export const FLAMBOYANT = 3;
export const REVOLUTION = 4;
export const RESTORED = 5;
export const SHELLED = 6;
export const REBUILT = 7;
export type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ------------------------------------------------------------------ plan

export const NW = 4;
export const AW = 7.8;
export const CZ0 = -4.5;
export const CZ1 = -12.5;
export const CZ = (CZ0 + CZ1) / 2;
export const TW = 14;
export const HZ = -20.5;
export const FZ = 21.5;
export const TZ0 = 14.5;
export const RT0 = 16.3;
export const H = 22;
export const RISE = 7;
export const RIDGE = H + RISE;
export const AH_E = 11;
export const AH_H = 9;
export const HR = 15.5;
export const AH_R = 10;
export const AMB_R = 8;
export const RISE_R = 5;
/** Bay divisions of the Gothic nave (buttress piers) and the centres of its bays. */
export const NAVE_DIV = [-4.5, -0.7, 3.1, 6.9, 10.7, 14.5];
export const NAVE_BAYS = [-2.6, 1.2, 5.0, 8.8, 12.6];
export const TX = 7.5;
export const TZC = (TZ0 + FZ) / 2;
export const BEL = 6.4;
export const BEL0 = 27;
export const BEL1 = 38;
/** Front of the Gothic porches. */
export const PZ = FZ + 1.9;

// ------------------------------------------------------------------ materials

export const STONE = P.pierreBlonde;
export const STONE_R = mix(P.pierreBlonde, P.rubble, 0.3);
export const NEW_STONE = P.craie;
export const BURNT = mix(P.pierreBlonde, 0x2a2622, 0.6);
export const LEAD = P.lead;
export const TILE = P.tuilePlate;
export const GLASS = mix(P.windowDark, 0x2a3f7c, 0.38);
export const VOID = 0x17181b;
export const GRISAILLE = mix(P.windowDark, P.enduitGris, 0.34);
export const LOUVRE = mix(P.ardoise, P.black, 0.35);
export const OAK = P.oakDark;
export const BOARDS = mix(P.oak, P.pine, 0.5);
export const HAY = P.thatch;
export const SANDBAG = mix(P.sand, P.earth, 0.35);

export interface Ctx {
  ph: Phase;
  wall: number;
  glass: number;
  statue: number;
  roof: number;
  door: number;
  /** Statues keep their heads. */
  heads: boolean;
}

export function ctx(ph: Phase): Ctx {
  const wall =
    ph === ROMANESQUE ? STONE_R : ph === REVOLUTION ? tint(STONE, -0.03) : ph === SHELLED ? mix(STONE, BURNT, 0.32) : ph === REBUILT ? mix(STONE, BURNT, 0.08) : STONE;
  const glass = ph === SHELLED ? VOID : ph === REBUILT ? GRISAILLE : GLASS;
  const statue =
    ph === RESTORED ? NEW_STONE : ph === SHELLED ? BURNT : ph === REBUILT ? mix(STONE, BURNT, 0.4) : tint(STONE, 0.03);
  return { ph, wall, glass, statue, roof: ph <= ROMANESQUE ? TILE : LEAD, door: OAK, heads: ph !== REVOLUTION };
}

export const SIDE = (s: number) => (s > 0 ? Math.PI / 2 : -Math.PI / 2);

export function lin(n: number, a: number, b: number): number[] {
  if (n === 1) return [(a + b) / 2];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

// ------------------------------------------------------------------ arch geometry

export function riseOf(kind: Arch, a: number): number {
  switch (kind) {
    case 'round':
      return a;
    case 'pointed':
      return a * Math.sqrt(3);
    case 'lancet':
      return a * Math.sqrt(5);
    case 'ogee':
      return a * 1.5;
    default:
      return 0;
  }
}

function headLeft(kind: Arch, a: number, segs: number): Pt[] {
  if (kind === 'round') {
    const out: Pt[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = Math.PI - (Math.PI / 2) * (i / segs);
      out.push([a * Math.cos(t), a * Math.sin(t)]);
    }
    out[segs] = [0, a];
    return out;
  }
  if (kind === 'pointed' || kind === 'lancet') {
    const R = (kind === 'pointed' ? 2 : 3) * a;
    const cx = -a + R;
    const tEnd = Math.acos(-cx / R);
    const out: Pt[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = Math.PI + (tEnd - Math.PI) * (i / segs);
      out.push([cx + R * Math.cos(t), R * Math.sin(t)]);
    }
    out[segs] = [0, out[segs][1]];
    return out;
  }
  if (kind === 'ogee') {
    return ([[-1, 0], [-0.93, 0.42], [-0.62, 0.76], [-0.24, 1.03], [0, 1.5]] as Pt[]).map(([x, y]) => [x * a, y * a] as Pt);
  }
  return [[-a, 0], [0, 0]];
}

/** Points along an arch head of half-width a springing at ys, from the left springing to the right. */
export function archHead(kind: Arch, a: number, ys: number, xc = 0, segs = 3): Pt[] {
  if (kind === 'rect') return [[xc - a, ys], [xc + a, ys]];
  const L = headLeft(kind, a, segs);
  const out: Pt[] = L.map(([x, y]) => [xc + x, ys + y] as Pt);
  for (let i = L.length - 2; i >= 0; i--) out.push([xc - L[i][0], ys + L[i][1]]);
  return out;
}

/** Outline of an opening w wide and h tall to the apex, bottom centre at (xc, y0): left foot, up, over, down. */
export function archPts(kind: Arch, w: number, h: number, xc = 0, y0 = 0, segs = 3): Pt[] {
  const a = w / 2;
  const ys = y0 + Math.max(0.02, h - riseOf(kind, a));
  return [[xc - a, y0], ...archHead(kind, a, ys, xc, segs), [xc + a, y0]];
}

/** A strip whose underside is scalloped by n arches: a corbel table or the head of an arcade. */
export function archStripPts(kind: Arch, x0: number, x1: number, n: number, ys: number, ytop: number, a: number, segs = 2): Pt[] {
  const pitch = (x1 - x0) / n;
  const pts: Pt[] = [[x0, ytop], [x0, ys]];
  for (let i = 0; i < n; i++) pts.push(...archHead(kind, a, ys, x0 + pitch * (i + 0.5), segs));
  pts.push([x1, ys], [x1, ytop]);
  return pts;
}

export function circlePts(cx: number, cy: number, r: number, n = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

export function rectPts(x0: number, y0: number, x1: number, y1: number): Pt[] {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

// ------------------------------------------------------------------ cheap flat details

/**
 * A flat shape in the local XY plane, `dz` in front of it (+Z is out of the wall). Single sided
 * geometry, so a window costs a handful of triangles. Use inside `b.group({ at, rotY })`.
 */
export function flat(b: Builder, pts: Pt[], color: number, dz = 0.04, o?: { at?: Vec3; rotY?: number; holes?: Pt[][] }) {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of o?.holes ?? []) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  const g = new THREE.ShapeGeometry(s, 3);
  g.translate(0, 0, dz);
  b.add(g, color, { at: o?.at, rotY: o?.rotY, jitter: false });
}

/** A flat bar from (x0, y0) to (x1, y1) in the local XY plane, w wide. */
export function strip(b: Builder, x0: number, y0: number, x1: number, y1: number, w: number, color: number, dz = 0.06) {
  const L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 1e-6) return;
  const nx = (-(y1 - y0) / L) * (w / 2);
  const ny = ((x1 - x0) / L) * (w / 2);
  flat(b, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], color, dz);
}

/** An arched window or door: an optional stone surround and the dark opening. `at` is the sill. */
export function opening(b: Builder, kind: Arch, w: number, h: number, at: Vec3, rotY: number, glass: number, frame?: number, fw = 0.16) {
  b.group({ at, rotY }, () => {
    if (frame !== undefined) flat(b, archPts(kind, w + fw * 2, h + fw, 0, -fw * 0.4, 2), frame, 0.03);
    flat(b, archPts(kind, w, h, 0, 0, 2), glass, 0.05);
  });
}

/** A round window (oculus) with a stone ring; `at` is its centre. */
export function roundel(b: Builder, r: number, at: Vec3, rotY: number, glass: number, frame: number) {
  b.group({ at, rotY }, () => {
    flat(b, circlePts(0, 0, r + 0.16, 10), frame, 0.03);
    flat(b, circlePts(0, 0, r, 10), glass, 0.05);
  });
}

function soufflet(cx: number, y0: number, hw: number, hh: number): Pt[] {
  return [
    [cx, y0], [cx + hw * 0.8, y0 + hh * 0.3], [cx + hw, y0 + hh * 0.55], [cx + hw * 0.5, y0 + hh * 0.85],
    [cx, y0 + hh], [cx - hw * 0.5, y0 + hh * 0.85], [cx - hw, y0 + hh * 0.55], [cx - hw * 0.8, y0 + hh * 0.3],
  ];
}

/** The flame-shaped light of Flamboyant tracery: a round head with a curling tail. */
export function mouchette(cx: number, y0: number, s: number, f: number): Pt[] {
  const u: Pt[] = [[0, 0], [0.42, 0.06], [0.6, 0.32], [0.52, 0.62], [0.3, 0.84], [0.12, 1.15], [0.02, 0.8], [-0.12, 0.52], [-0.12, 0.2]];
  return u.map(([x, y]) => [cx + f * x * s, y0 + y * s] as Pt);
}

export type Trac = 'bar' | 'flamboyant';

/**
 * A traceried Gothic window: a stone panel, `lights` dark lights side by side and a figure in the
 * head. 'bar' (from Reims, about 1215): pointed lights under a round light with a stone hub.
 * 'flamboyant': ogee-headed lights under a central soufflet and two curling mouchettes.
 */
export function tracery(b: Builder, w: number, h: number, at: Vec3, rotY: number, o: { lights: number; glass: number; stone: number; style?: Trac }) {
  const style = o.style ?? 'bar';
  const a = w / 2;
  const ys = h - a * Math.sqrt(3);
  b.group({ at, rotY }, () => {
    flat(b, archPts('pointed', w + 0.34, h + 0.2, 0, -0.08, 2), tint(o.stone, -0.12), 0.025);
    flat(b, archPts('pointed', w, h, 0, 0, 2), o.stone, 0.04);
    const n = o.lights;
    const m = 0.1;
    const e = 0.12;
    const lw = (w - 2 * e - (n - 1) * m) / n;
    const lk: Arch = style === 'flamboyant' ? 'ogee' : 'pointed';
    const lTop = Math.max(e + 0.5, ys + riseOf(lk, lw / 2) * 0.85);
    for (let i = 0; i < n; i++) {
      const xc = -a + e + lw / 2 + i * (lw + m);
      flat(b, archPts(lk, lw, lTop - e, xc, e, 2), o.glass, 0.055);
    }
    const top = h - 0.14;
    if (style === 'flamboyant') {
      const hh = top - lTop - 0.1;
      if (hh > 0.3) {
        const s = Math.min(hh * 0.62, a * 0.55);
        flat(b, soufflet(0, lTop + 0.1 + hh * 0.06, Math.min(a * 0.22, s * 0.42), hh * 0.84), o.glass, 0.055);
        for (const f of [-1, 1]) flat(b, mouchette(f * a * 0.44, lTop + 0.12, s, f), o.glass, 0.055);
      }
    } else {
      let r = Math.min(a * 0.6, (top - lTop) * 0.48);
      let yc = lTop + 0.08 + r;
      for (let k = 0; k < 14; k++) {
        if (r <= 2 * a - Math.hypot(a, yc - ys) - 0.12) break;
        r *= 0.9;
        yc = lTop + 0.08 + r;
      }
      if (r > 0.12) {
        flat(b, circlePts(0, yc, r, 10), o.glass, 0.055);
        if (r > 0.3) {
          flat(b, circlePts(0, yc, r * 0.26, 6), o.stone, 0.065);
          for (let k = 0; k < 4; k++) {
            const t = Math.PI / 4 + (k * Math.PI) / 2;
            strip(b, 0, yc, r * Math.cos(t), yc + r * Math.sin(t), 0.08, o.stone, 0.065);
          }
        }
      }
    }
  });
}

/**
 * A rose window, `at` its centre on the wall. 'plate': round holes cut in a stone disc (twelfth
 * century). 'rayonnant': spokes of bar tracery and an inner ring (thirteenth). 'flamboyant':
 * spokes that curve both ways, crossing into flame shapes (around 1500).
 */
export function rose(b: Builder, r: number, at: Vec3, rotY: number, o: { stone: number; glass: number; style: 'plate' | 'rayonnant' | 'flamboyant' }) {
  b.group({ at, rotY }, () => {
    flat(b, circlePts(0, 0, r + 0.42, 20), tint(o.stone, -0.12), 0.025);
    flat(b, circlePts(0, 0, r + 0.12, 20), o.stone, 0.04);
    if (o.style === 'plate') {
      flat(b, circlePts(0, 0, r * 0.3, 10), o.glass, 0.055);
      for (let k = 0; k < 8; k++) {
        const t = (k * Math.PI) / 4;
        flat(b, circlePts(r * 0.68 * Math.cos(t), r * 0.68 * Math.sin(t), r * 0.22, 8), o.glass, 0.055);
      }
      return;
    }
    flat(b, circlePts(0, 0, r, 20), o.glass, 0.05);
    const hub = r * 0.2;
    if (o.style === 'rayonnant') {
      const n = 16;
      for (let k = 0; k < n; k++) {
        const t = (k * Math.PI * 2) / n;
        strip(b, hub * Math.cos(t), hub * Math.sin(t), r * Math.cos(t), r * Math.sin(t), 0.11, o.stone, 0.07);
      }
      flat(b, circlePts(0, 0, r * 0.58 + 0.07, 16), o.stone, 0.066, { holes: [circlePts(0, 0, r * 0.58 - 0.07, 16)] });
      for (let k = 0; k < n; k++) {
        const t = ((k + 0.5) * Math.PI * 2) / n;
        flat(b, circlePts(r * 0.85 * Math.cos(t), r * 0.85 * Math.sin(t), r * 0.07, 5), o.stone, 0.07);
      }
    } else {
      const n = 12;
      for (const tw of [0.45, -0.45]) {
        for (let k = 0; k < n; k++) {
          const t0 = (k * Math.PI * 2) / n;
          const pts: Pt[] = [];
          for (const f of [0, 0.33, 0.66, 1]) {
            const rr = hub + (r - hub) * f;
            const t = t0 + tw * Math.sin(f * Math.PI);
            pts.push([rr * Math.cos(t), rr * Math.sin(t)]);
          }
          for (let i = 0; i < 3; i++) strip(b, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.1, o.stone, 0.07);
        }
      }
    }
    flat(b, circlePts(0, 0, hub, 10), o.stone, 0.075);
  });
}

/** A standing figure: robe and head. `head: false` for the beheaded. */
export function statue(b: Builder, at: Vec3, h: number, color: number, rotY = 0, head = true) {
  b.group({ at, rotY }, () => {
    b.box(h * 0.27, h * 0.8, h * 0.2, color, { jitter: false });
    if (head) b.box(h * 0.13, h * 0.15, h * 0.14, color, { at: [0, h * 0.81, 0], jitter: false });
  });
}

/** A Gothic pinnacle: square shaft and spirelet. */
export function pinnacle(b: Builder, at: Vec3, w: number, h: number, color: number) {
  b.box(w, h * 0.4, w, color, { at, jitter: false });
  b.cone(w * 0.74, h * 0.6, color, { at: [at[0], at[1] + h * 0.4, at[2]], segs: 4, rotY: Math.PI / 4, jitter: false });
}

/** Run fn in a frame centred on (ox, oz) whose local +X points outward along the bearing phi. */
export function radial(b: Builder, ox: number, oz: number, phi: number, fn: () => void) {
  b.group({ at: [ox, 0, oz], rotY: phi - Math.PI / 2 }, fn);
}

/**
 * A flying buttress in a radial frame (local x = distance out from the axis of the church): a
 * straight sloping top from the wall (r0, y0) down to the pier (r1, y1), over a quarter arch.
 */
export function flyer(b: Builder, r0: number, y0: number, r1: number, y1: number, t: number, color: number) {
  const yb0 = y0 - 0.85;
  const yb1 = y1 - 2.3;
  const pts: Pt[] = [[r0, y0], [r1, y1], [r1, yb1]];
  for (const u of [0.18, 0.4, 0.62, 0.82]) {
    pts.push([r1 + (r0 - r1) * u, yb1 + (yb0 - yb1) * Math.sin((u * Math.PI) / 2)]);
  }
  pts.push([r0, yb0]);
  b.extrude(pts, t, color);
}

/** A buttress pier (culée) in a radial frame: from radius r0 to r1, h tall, t thick, with a cap. */
export function culee(b: Builder, r0: number, r1: number, h: number, t: number, color: number, top: 'cap' | 'pinnacle' | 'none') {
  b.box(r1 - r0, h, t, color, { at: [(r0 + r1) / 2, 0, 0] });
  b.box(r1 - r0 + 0.25, 0.5, t + 0.2, color, { at: [(r0 + r1) / 2 + 0.12, 0.5, 0], jitter: false });
  if (top === 'cap') b.pyramid(r1 - r0, t, 0.9, color, { at: [(r0 + r1) / 2, h, 0] });
  else if (top === 'pinnacle') pinnacle(b, [r1 - 0.75, h, 0], 0.85, 4.8, color);
}

// ------------------------------------------------------------------ roofs

/**
 * A pitched roof along Z from z0 (east) to z1 (west), half-span hs, eaves at y. `g0` / `g1` give
 * a gable wall at that end in the given colour.
 */
export function roofZ(b: Builder, x: number, z0: number, z1: number, hs: number, y: number, rise: number, color: number, o: { ov?: number; ovEnd?: number; g0?: number; g1?: number } = {}) {
  const ov = o.ov ?? 0.3;
  const ovE = o.ovEnd ?? 0.3;
  const t = 0.22;
  const drop = (ov * rise) / hs;
  const zc = (z0 + z1) / 2;
  b.extrude([[-hs - ov, -drop], [0, rise], [hs + ov, -drop], [hs + ov, -drop + t], [0, rise + t], [-hs - ov, -drop + t]], z1 - z0 + 2 * ovE, color, { at: [x, y, zc] });
  const tri: Pt[] = [[-hs, 0], [hs, 0], [0, rise]];
  if (o.g0 !== undefined) b.extrude(tri, 0.7, o.g0, { at: [x, y, z0 + 0.35] });
  if (o.g1 !== undefined) b.extrude(tri, 0.7, o.g1, { at: [x, y, z1 - 0.35] });
  // a solid core under the slopes, so nothing shows through the open ends
  b.extrude([[-hs + 0.1, 0], [hs - 0.1, 0], [0, rise - 0.15]], z1 - z0 - 1.4, tint(color, -0.2), { at: [x, y, zc] });
}

/** The same along X, at z, from x0 to x1. */
export function roofX(b: Builder, z: number, x0: number, x1: number, hs: number, y: number, rise: number, color: number, o: { ov?: number; ovEnd?: number; g0?: number; g1?: number } = {}) {
  b.group({ at: [0, 0, z], rotY: Math.PI / 2 }, () => roofZ(b, 0, x0, x1, hs, y, rise, color, o));
}

const HALF = { start: Math.PI / 2, sweep: Math.PI };

/** Half-cone roof over a hemicycle centred on z (facing -Z). */
export function apseRoof(b: Builder, z: number, r: number, y: number, rise: number, color: number, segs: number, ov = 0.3) {
  const drop = (ov * rise) / r;
  b.lathe([[r + ov, -drop], [0.01, rise]], color, { ...HALF, segs, at: [0, y, z] });
}

/** Lean-to over an aisle on side s: from y at the outer wall up `rise` against the inner wall. */
export function aisleRoof(b: Builder, s: number, z0: number, z1: number, y: number, rise: number, color: number, inner = NW, outer = AW) {
  const w = outer - inner + 0.35;
  b.shed(w, z1 - z0, rise, color, { at: [s * (inner + w / 2), y - 0.05, (z0 + z1) / 2], high: s > 0 ? '-x' : '+x' });
}

/** The sloping ring roof over an ambulatory or a tribune round the hemicycle. */
export function ringRoof(b: Builder, y: number, rise: number, color: number, segs: number, inner = NW, outer = AW) {
  b.lathe([[outer + 0.35, y - 0.1], [inner, y + rise]], color, { ...HALF, segs, at: [0, 0, HZ] });
}

/** Position and bearing of the centre of facet k of an n-sided half polygon of radius r round HZ. */
export function facet(k: number, n: number, r: number): { x: number; z: number; phi: number; ap: number } {
  const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / n;
  const ap = r * Math.cos(Math.PI / (2 * n));
  return { x: ap * Math.sin(phi), z: HZ + ap * Math.cos(phi), phi, ap };
}

// ------------------------------------------------------------------ the Romanesque cathedral

/** Nave with tribune aisles, timber roof and twin-towered front: built about 1050, kept until about 1230. */
export function romanesqueNave(b: Builder, c: Ctx) {
  const wall = STONE_R;
  const dress = tint(wall, 0.06);
  const glass = GLASS;
  const len = FZ - CZ0;
  const zc = (FZ + CZ0) / 2;
  const aLen = RT0 - CZ0;
  const aZc = (RT0 + CZ0) / 2;
  b.box(2 * AW + 0.4, 0.5, aLen + 0.3, tint(wall, -0.05), { at: [0, 0, aZc] });
  b.box(2 * NW, HR, len, wall, { at: [0, 0, zc] });
  b.sym((s) => b.box(AW - NW, AH_R, aLen, wall, { at: [(s * (AW + NW)) / 2, 0, aZc] }));
  roofZ(b, 0, CZ0, FZ, NW, HR, RISE_R, TILE, { g0: wall, g1: wall });
  b.sym((s) => aisleRoof(b, s, CZ0, RT0, AH_R, 2.4, TILE));
  const div = lin(6, CZ0, RT0);
  const bays = div.slice(0, 5).map((z, i) => (z + div[i + 1]) / 2);
  b.sym((s) => {
    const f = SIDE(s);
    for (const z of div.slice(1, 5)) {
      b.box(0.35, AH_R - 0.6, 0.9, dress, { at: [s * (AW + 0.15), 0, z] });
      b.box(0.24, HR - AH_R - 3.0, 0.7, dress, { at: [s * (NW + 0.1), AH_R + 2.4, z] });
    }
    for (const z of bays) {
      opening(b, 'round', 1.1, 2.4, [s * AW, 2.4, z], f, glass, dress);
      for (const dzz of [-0.5, 0.5]) opening(b, 'round', 0.7, 1.6, [s * AW, 6.6, z + dzz], f, glass, dress, 0.12);
      opening(b, 'round', 1.0, 2.0, [s * NW, 12.6, z], f, glass, dress);
    }
    // corbel tables under the eaves
    b.group({ at: [s * AW, 0, aZc], rotY: f }, () => flat(b, archStripPts('round', -aLen / 2, aLen / 2, 26, AH_R - 0.6, AH_R - 0.1, 0.28), dress, 0.06));
    b.group({ at: [s * NW, 0, zc], rotY: f }, () => flat(b, archStripPts('round', -len / 2, len / 2, 32, HR - 0.6, HR - 0.1, 0.28), dress, 0.06));
  });
  b.collider(2 * AW, len, { at: [0, 0, zc] });
  void c;
}

/** The Romanesque west front: a gabled centre between two square towers with stone pyramids. */
export function romanesqueFront(b: Builder) {
  const wall = STONE_R;
  const dress = tint(wall, 0.06);
  const glass = GLASS;
  const tz = (RT0 + FZ) / 2;
  const ts = FZ - RT0;
  b.sym((s) => {
    const x = s * 6.2;
    b.box(ts + 0.4, 0.5, ts + 0.4, tint(wall, -0.05), { at: [x, 0, tz] });
    b.box(ts, 24, ts, wall, { at: [x, 0, tz] });
    for (const y of [10, 15.5, 20]) b.box(ts + 0.2, 0.25, ts + 0.2, dress, { at: [x, y, tz], jitter: false });
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) b.box(0.6, 20, 0.6, dress, { at: [x + dx * (ts / 2 - 0.15), 0, tz + dz * (ts / 2 - 0.15)] });
    b.pyramid(ts + 0.5, ts + 0.5, 6.5, TILE, { at: [x, 24, tz], overhang: 0.2 });
    const faces: [number, (u: number) => Vec3][] = [
      [0, (u) => [x + u, 0, FZ]],
      [Math.PI, (u) => [x - u, 0, RT0]],
      [Math.PI / 2, (u) => [x + ts / 2, 0, tz - u]],
      [-Math.PI / 2, (u) => [x - ts / 2, 0, tz + u]],
    ];
    for (const [rot, p] of faces) {
      const put = (u: number, y: number, w: number, h: number) => {
        const q = p(u);
        opening(b, 'round', w, h, [q[0], y, q[2]], rot, rot === 0 || y > 19 ? glass : LOUVRE, dress, 0.12);
      };
      put(0, 16.2, 0.9, 2.4);
      put(-0.75, 20.6, 0.9, 2.6);
      put(0.75, 20.6, 0.9, 2.6);
      if (rot === 0) put(0, 11, 1.0, 2.4);
    }
  });
  // the central bay: portal of three round orders, a great window, an oculus in the gable
  b.group({ at: [0, 0, FZ], rotY: 0 }, () => {
    flat(b, archPts('round', 3.6, 5.2, 0, 0, 4), tint(dress, 0.04), 0.03);
    flat(b, archPts('round', 3.0, 4.6, 0, 0, 4), tint(wall, -0.06), 0.05);
    flat(b, archPts('round', 2.3, 3.9, 0, 0, 4), dress, 0.07);
    flat(b, rectPts(-1.0, 0, 1.0, 2.8), OAK, 0.09);
    flat(b, archPts('round', 2.0, 1.0, 0, 2.85, 4), tint(dress, -0.08), 0.09);
    flat(b, archPts('round', 2.2, 3.4, 0, 7.6, 3), dress, 0.03);
    flat(b, archPts('round', 1.7, 3.0, 0, 7.8, 3), glass, 0.05);
    flat(b, circlePts(0, 16.7, 0.75, 10), dress, 0.03);
    flat(b, circlePts(0, 16.7, 0.55, 10), glass, 0.05);
  });
  b.sym((s) => b.box(0.6, HR - 0.5, 0.4, dress, { at: [s * 3.35, 0, FZ + 0.15] }));
  b.collider(2 * 8.8, ts, { at: [0, 0, tz] });
}

/** Transept, crossing tower and the choir with its ambulatory and three radiating chapels. */
export function romanesqueEast(b: Builder) {
  const wall = STONE_R;
  const dress = tint(wall, 0.06);
  const glass = GLASS;
  const td = CZ0 - CZ1;
  // transept
  b.box(2 * TW + 0.4, 0.5, td + 0.3, tint(wall, -0.05), { at: [0, 0, CZ] });
  b.box(2 * TW, HR, td, wall, { at: [0, 0, CZ] });
  b.sym((s) => {
    roofX(b, CZ, s > 0 ? 4.2 : -TW, s > 0 ? TW : -4.2, td / 2, HR, RISE_R, TILE, s > 0 ? { g1: wall } : { g0: wall });
    const f = SIDE(s);
    const ex = s * TW;
    for (const dz of [-1.8, 1.8]) {
      opening(b, 'round', 1.2, 3.0, [ex, 3.0, CZ + dz], f, glass, dress);
      opening(b, 'round', 1.2, 2.8, [ex, 9.4, CZ + dz], f, glass, dress);
    }
    roundel(b, 0.6, [ex, HR + 1.9, CZ], f, glass, dress);
    for (const dz of [-1, 1]) b.box(0.35, HR - 0.5, 0.9, dress, { at: [ex + s * 0.1, 0, CZ + dz * (td / 2 - 0.45)] });
    const ax = s * 10.8;
    opening(b, 'round', 1.2, 2.8, [ax, 9.4, CZ1], Math.PI, glass, dress);
    opening(b, 'round', 1.2, 3.0, [ax, 3.0, CZ0], 0, glass, dress);
    opening(b, 'round', 1.2, 2.8, [ax, 9.4, CZ0], 0, glass, dress);
    // an apsidal chapel on the east side of each arm
    b.lathe([[1.9, 0], [1.9, 7]], wall, { ...HALF, segs: 6, at: [ax, 0, CZ1] });
    b.lathe([[2.15, 6.9], [0.01, 8.8]], TILE, { ...HALF, segs: 6, at: [ax, 0, CZ1] });
    opening(b, 'round', 0.7, 1.8, [ax, 2.6, CZ1 - 1.84], Math.PI, glass, dress, 0.12);
    for (const [zf, rot] of [[CZ0, 0], [CZ1, Math.PI]] as const) {
      b.group({ at: [(s * (TW + AW)) / 2, 0, zf], rotY: rot }, () => flat(b, archStripPts('round', -(TW - AW) / 2, (TW - AW) / 2, 9, HR - 0.6, HR - 0.1, 0.26), dress, 0.05));
    }
  });
  // crossing tower
  const ct = 8.6;
  b.box(ct, 24 - (HR - 0.4), ct, wall, { at: [0, HR - 0.4, CZ] });
  b.box(ct + 0.25, 0.3, ct + 0.25, dress, { at: [0, HR + 3.6, CZ], jitter: false });
  b.pyramid(ct + 0.5, ct + 0.5, 6, TILE, { at: [0, 24, CZ], overhang: 0.2 });
  const faces: [number, (u: number) => Vec3][] = [
    [0, (u) => [u, 0, CZ + ct / 2]],
    [Math.PI, (u) => [-u, 0, CZ - ct / 2]],
    [Math.PI / 2, (u) => [ct / 2, 0, CZ - u]],
    [-Math.PI / 2, (u) => [-ct / 2, 0, CZ + u]],
  ];
  for (const [rot, p] of faces) {
    for (const u of [-2.4, -1.4, 1.4, 2.4]) {
      const q = p(u);
      opening(b, 'round', 0.8, 2.4, [q[0], 20.4, q[2]], rot, LOUVRE, dress, 0.12);
    }
  }
  // choir: straight bays, then ambulatory, hemicycle and three chapels
  const cl = CZ1 - HZ;
  const cz = (CZ1 + HZ) / 2;
  b.box(2 * NW, HR, cl, wall, { at: [0, 0, cz] });
  b.sym((s) => b.box(AW - NW, AMB_R, cl, wall, { at: [(s * (AW + NW)) / 2, 0, cz] }));
  b.lathe([[NW, 0], [NW, HR]], wall, { ...HALF, segs: 7, at: [0, 0, HZ] });
  b.lathe([[AW + 0.2, 0], [AW + 0.2, 0.5], [AW, 0.5], [AW, AMB_R]], wall, { ...HALF, segs: 7, at: [0, 0, HZ] });
  roofZ(b, 0, HZ, CZ1, NW, HR, RISE_R, TILE, { ovEnd: 0 });
  apseRoof(b, HZ, NW, HR, RISE_R, TILE, 7);
  b.sym((s) => aisleRoof(b, s, HZ, CZ1, AMB_R, 2.0, TILE));
  ringRoof(b, AMB_R, 2.0, TILE, 7);
  b.sym((s) => {
    for (const z of [-14.5, -18.5]) {
      opening(b, 'round', 1.1, 2.4, [s * AW, 2.5, z], SIDE(s), glass, dress);
      opening(b, 'round', 0.9, 2.2, [s * NW, 11.2, z], SIDE(s), glass, dress);
    }
  });
  for (let k = 0; k < 7; k++) {
    const fc = facet(k, 7, NW);
    opening(b, 'round', 0.8, 2.1, [fc.x, 11.0, fc.z], fc.phi, glass, dress, 0.12);
    if (k % 2 === 0) {
      const fa = facet(k, 7, AW);
      opening(b, 'round', 0.9, 2.2, [fa.x, 2.5, fa.z], fa.phi, glass, dress, 0.12);
    }
  }
  for (const k of [1, 3, 5]) {
    const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / 7;
    const rc = AW + 0.4;
    const x = rc * Math.sin(phi);
    const z = HZ + rc * Math.cos(phi);
    b.cyl(2.0, 5.6, wall, { at: [x, 0, z], segs: 8, rotY: phi - Math.PI / 8 });
    b.cone(2.25, 2.0, TILE, { at: [x, 5.5, z], segs: 8, rotY: phi - Math.PI / 8 });
    for (const j of [-1, 0, 1]) {
      const t = phi + (j * Math.PI) / 4;
      const ap = 2.0 * Math.cos(Math.PI / 8);
      opening(b, 'round', 0.65, 1.8, [x + ap * Math.sin(t), 2.2, z + ap * Math.cos(t)], t, glass, dress, 0.1);
    }
  }
  b.collider(2 * TW, td, { at: [0, 0, CZ] });
  b.collider(2 * AW, cl + 8, { at: [0, 0, cz - 4] });
}

// ------------------------------------------------------------------ the Gothic choir (1160s)

/**
 * The Early Gothic choir: aisles and ambulatory carrying a tribune (two rows of windows outside),
 * then a band of roundels and the clerestory lancets: the four storeys of Laon, Noyon and Paris.
 * Five polygonal radiating chapels; single flying buttresses with plain capped piers.
 */
export function gothicChoir(b: Builder, c: Ctx) {
  const { wall, glass, ph } = c;
  const dress = tint(wall, 0.05);
  const shelled = ph === SHELLED;
  const cl = CZ1 - HZ;
  const cz = (CZ1 + HZ) / 2;
  b.box(2 * NW, H, cl, wall, { at: [0, 0, cz] });
  b.sym((s) => b.box(AW - NW, AH_E, cl, wall, { at: [(s * (AW + NW)) / 2, 0, cz] }));
  b.lathe([[NW, 0], [NW, H]], wall, { ...HALF, segs: 5, at: [0, 0, HZ] });
  b.lathe([[AW + 0.2, 0], [AW + 0.2, 0.5], [AW, 0.5], [AW, AH_E]], wall, { ...HALF, segs: 5, at: [0, 0, HZ] });
  b.box(2 * NW + 0.3, 0.4, cl, dress, { at: [0, H - 0.4, cz], jitter: false });
  b.lathe([[NW + 0.15, H - 0.4], [NW + 0.15, H]], dress, { ...HALF, segs: 5, at: [0, 0, HZ], jitter: false });
  if (!shelled) {
    roofZ(b, 0, HZ, CZ1, NW, H, RISE, c.roof, { ovEnd: 0, g1: ph === EARLY ? BOARDS : undefined });
    apseRoof(b, HZ, NW, H, RISE, c.roof, 5);
    b.sym((s) => aisleRoof(b, s, HZ, CZ1, AH_E, 1.7, c.roof));
    ringRoof(b, AH_E, 1.7, c.roof, 5);
  } else {
    const grey = mix(P.enduitGris, BURNT, 0.3);
    b.sym((s) => b.box(AW - NW, 0.3, cl, grey, { at: [(s * (AW + NW)) / 2, AH_E, cz] }));
    b.lathe([[AW, AH_E + 0.3], [NW, AH_E + 0.3]], grey, { ...HALF, segs: 5, at: [0, 0, HZ] });
  }
  if (ph === EARLY) {
    // the choir is finished first: its open west end is boarded up until the crossing is built
    b.box(2 * NW, H, 0.3, BOARDS, { at: [0, 0, CZ1 + 0.15] });
    b.sym((s) => b.box(AW - NW, AH_E, 0.3, BOARDS, { at: [(s * (AW + NW)) / 2, 0, CZ1 + 0.15] }));
    for (const x of lin(7, -NW + 0.3, NW - 0.3)) b.box(0.14, H + RISE * (1 - Math.abs(x) / NW) - 0.4, 0.1, P.oak, { at: [x, 0, CZ1 + 0.33], jitter: false });
  }
  // straight bays: aisle and tribune windows, roundels, clerestory lancets
  b.sym((s) => {
    const f = SIDE(s);
    for (const z of [-14.5, -18.5]) {
      opening(b, 'pointed', 1.2, 3.4, [s * AW, 2.4, z], f, glass, dress);
      for (const d of [-0.55, 0.55]) opening(b, 'pointed', 0.8, 2.2, [s * AW, 7.6, z + d], f, glass, dress, 0.12);
      roundel(b, 0.5, [s * NW, 13.4, z], f, glass, dress);
      opening(b, 'pointed', 1.4, 5.0, [s * NW, 14.7, z], f, glass, dress);
    }
  });
  for (let k = 0; k < 5; k++) {
    const fc = facet(k, 5, NW);
    roundel(b, 0.45, [fc.x, 13.4, fc.z], fc.phi, glass, dress);
    opening(b, 'pointed', 1.2, 5.0, [fc.x, 14.7, fc.z], fc.phi, glass, dress);
    const fa = facet(k, 5, AW);
    opening(b, 'pointed', 0.9, 2.2, [fa.x, 8.4, fa.z], fa.phi, glass, dress, 0.12);
  }
  // five radiating chapels
  for (let k = 0; k < 5; k++) {
    const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / 5;
    const rc = AW + 0.5;
    const x = rc * Math.sin(phi);
    const z = HZ + rc * Math.cos(phi);
    b.cyl(1.9, 6.5, wall, { at: [x, 0, z], segs: 6, rotY: phi - Math.PI / 6 });
    b.cyl(2.0, 0.35, dress, { at: [x, 6.2, z], segs: 6, rotY: phi - Math.PI / 6, jitter: false });
    if (!shelled) b.cone(2.15, 2.6, c.roof, { at: [x, 6.5, z], segs: 6, rotY: phi - Math.PI / 6 });
    for (const j of [-1, 0, 1]) {
      const t = phi + (j * Math.PI) / 3;
      const ap = 1.9 * Math.cos(Math.PI / 6);
      opening(b, 'pointed', 0.6, 3.4, [x + ap * Math.sin(t), 1.8, z + ap * Math.cos(t)], t, glass, dress, 0.1);
    }
  }
  // flying buttresses: two each side on the straight bays, four round the hemicycle
  const piers: [number, number, number][] = [
    [0, -16.5, Math.PI / 2], [0, -16.5, -Math.PI / 2], [0, HZ, Math.PI / 2], [0, HZ, -Math.PI / 2],
  ];
  for (let k = 1; k < 5; k++) piers.push([0, HZ, Math.PI / 2 + (k * Math.PI) / 5]);
  for (const [ox, oz, phi] of piers) {
    radial(b, ox, oz, phi, () => {
      culee(b, AW - 0.3, AW + 2.4, 14.6, 0.9, tint(wall, 0.03), 'cap');
      flyer(b, NW, 19.0, AW - 0.2, 14.7, 0.6, tint(wall, 0.06));
    });
  }
  b.collider(2 * AW + 4, cl + 11, { at: [0, 0, cz - 5] });
}

// ------------------------------------------------------------------ the Gothic transept

/** The transept walls rising in scaffolding, a treadwheel crane, the masons' lodge (1160s to 1200s). */
export function transeptSite(b: Builder, c: Ctx) {
  const { wall } = c;
  const td = CZ0 - CZ1;
  const top = 12.6;
  const pole = P.oak;
  b.sym((s) => {
    b.box(1.2, top, td, wall, { at: [s * (TW - 0.6), 0, CZ] });
    b.box(1.2, 1.6, td * 0.55, wall, { at: [s * (TW - 0.6), top, CZ - td * 0.2] });
    b.box(TW - AW, top - 1.8, 1.2, wall, { at: [(s * (AW + TW)) / 2, 0, CZ0 - 0.6] });
    b.box(TW - AW, top - 0.6, 1.2, wall, { at: [(s * (AW + TW)) / 2, 0, CZ1 + 0.6] });
    for (const zz of [CZ0, CZ1]) b.box(1.8, top + 0.8, 1.8, wall, { at: [s * NW, 0, zz] });
    // unglazed lancets in the new walls
    for (const dz of [-1.9, 1.9]) opening(b, 'pointed', 1.3, 4.4, [s * TW, 2.8, CZ + dz], SIDE(s), VOID, tint(wall, 0.05));
    opening(b, 'pointed', 1.4, 4.4, [(s * (AW + TW)) / 2, 2.8, CZ0], 0, VOID, tint(wall, 0.05));
    // scaffolding against the end wall: standards, ledgers, putlogs and boards
    const sx = s * (TW + 1.0);
    for (const z of lin(4, CZ1 - 0.4, CZ0 + 0.4)) b.box(0.14, 15.2, 0.14, pole, { at: [sx, 0, z], jitter: false });
    for (const y of [4.6, 9.0, 13.4]) {
      b.box(0.12, 0.12, td + 1.2, pole, { at: [sx, y, CZ], jitter: false });
      b.box(1.0, 0.08, td + 0.8, P.oak, { at: [s * (TW + 0.55), y + 0.12, CZ], jitter: false });
      for (const z of lin(4, CZ1 - 0.4, CZ0 + 0.4)) b.box(1.3, 0.1, 0.1, pole, { at: [s * (TW + 0.45), y, z], jitter: false });
    }
  });
  // the treadwheel crane on the north wall, hoisting a block
  const wx = -TW + 0.6;
  b.box(1.6, 0.3, 3.2, P.oak, { at: [wx, top + 1.6, CZ - 0.6] });
  b.cyl(1.8, 1.1, P.oak, { at: [wx - 0.55, top + 1.9 + 1.8, CZ - 0.6], rot: [0, 0, Math.PI / 2], segs: 12 });
  b.beam([wx, top + 1.9, CZ - 0.6], [wx - 2.4, top + 6.5, CZ - 0.6], 0.28, 0.28, P.oak);
  b.beam([wx, top + 5.6, CZ - 0.6], [wx - 1.6, top + 4.9, CZ - 0.6], 0.16, 0.16, P.oak);
  b.beam([wx - 2.3, top + 6.4, CZ - 0.6], [wx - 2.3, 7.0, CZ - 0.6], 0.05, 0.05, P.iron);
  b.box(0.9, 0.6, 0.6, wall, { at: [wx - 2.3, 6.4, CZ - 0.6] });
  // the masons' lodge and stone waiting to be laid
  b.box(6, 3.0, 3.4, P.torchis, { at: [12.2, 0, 1.6] });
  b.shed(6.4, 3.8, 1.3, TILE, { at: [12.2, 3.0, 1.6], high: '-z' });
  b.group({ at: [12.2, 0, 3.3], rotY: 0 }, () => flat(b, rectPts(-0.5, 0, 0.5, 2.0), P.oak, 0.03));
  const blocks: Vec3[] = [[10.0, 0, -1.8], [11.2, 0, -1.6], [10.6, 0.6, -1.7], [12.4, 0, -2.2], [9.6, 0, -2.9], [13.2, 0, 6.4], [12.0, 0, 6.6]];
  for (const p of blocks) b.box(1.0, 0.6, 0.65, tint(wall, 0.04), { at: p });
  b.collider(6, 3.4, { at: [12.2, 0, 1.6] });
  b.collider(2 * TW + 2, td, { at: [0, 0, CZ] });
}

/** A transept end: a porch, a rose over a row of small lancets, a gable, turrets at the corners. */
function transeptFront(b: Builder, c: Ctx, s: number, flamb: boolean) {
  const { wall, glass } = c;
  const dress = tint(wall, 0.05);
  const x = s * TW;
  const rot = SIDE(s);
  const td = CZ0 - CZ1;
  for (const zz of [CZ0, CZ1]) {
    b.box(1.5, H + 3.0, 1.5, wall, { at: [s * (TW + 0.1), 0, zz] });
    pinnacle(b, [s * (TW + 0.1), H + 3.0, zz], 1.1, flamb ? 6.5 : 4.5, wall);
  }
  b.group({ at: [x, 0, CZ], rotY: rot }, () => {
    // the porch: two receding orders
    const W = 4.8;
    const ph = 7.2;
    b.extrude([[-W / 2, 0], ...archPts('pointed', 3.2, 6.2, 0, 0, 3), [W / 2, 0], [W / 2, ph], [-W / 2, ph]], 0.6, wall, { at: [0, 0, 0.9] });
    b.extrude([[-W / 2, 0], ...archPts('pointed', 2.6, 5.8, 0, 0, 3), [W / 2, 0], [W / 2, ph], [-W / 2, ph]], 0.6, tint(wall, -0.03), { at: [0, 0, 0.3] });
    flat(b, rectPts(-1.2, 0, 1.2, 3.4), c.door, 0.03);
    flat(b, archPts('pointed', 2.5, 2.25, 0, 3.55, 3), c.statue, 0.03);
    b.box(2.7, 0.3, 0.3, c.statue, { at: [0, 3.35, 0.15] });
    for (const sx of [-1, 1]) statue(b, [sx * 1.45, 0.9, 0.8], 2.2, c.statue, -0.4 * sx, c.heads);
    if (flamb) {
      // an ogee gable (accolade) with crockets, and a finial
      const pts: Pt[] = [];
      for (const [u, v] of [[-1, 0], [-0.72, 0.26], [-0.42, 0.62], [-0.18, 1.1], [0, 1.6]] as Pt[]) pts.push([u * 2.3, ph + v * 2.4]);
      for (const [u, v] of [[0.18, 1.1], [0.42, 0.62], [0.72, 0.26], [1, 0]] as Pt[]) pts.push([u * 2.3, ph + v * 2.4]);
      b.extrude(pts, 0.35, wall, { at: [0, 0, 1.05] });
      for (let i = 1; i < pts.length - 1; i++) if (i !== 4) b.box(0.25, 0.25, 0.25, wall, { at: [pts[i][0], pts[i][1], 1.05], jitter: false });
      b.cone(0.25, 1.4, wall, { at: [0, ph + 3.84, 1.05], segs: 4 });
      flat(b, soufflet(0, ph + 0.5, 0.5, 2.0), tint(wall, -0.4), 1.25);
    } else {
      b.extrude([[-2.2, 0], [2.2, 0], [0, 2.6]], 0.35, wall, { at: [0, ph, 1.05] });
      flat(b, circlePts(0, ph + 1.0, 0.45, 8), tint(wall, -0.4), 1.25);
    }
    // a row of small lancets under the rose, the rose, and a light in the gable
    for (const u of lin(7, -2.7, 2.7)) flat(b, archPts('pointed', 0.48, 1.4, u, 10.2, 2), glass, 0.05);
    flat(b, rectPts(-3.0, 10.0, 3.0, 10.15), dress, 0.04);
    rose(b, flamb ? 3.0 : 2.8, [0, 14.9, 0], 0, { stone: dress, glass, style: flamb ? 'flamboyant' : 'rayonnant' });
    if (flamb) {
      for (const f of [-1, 1]) flat(b, mouchette(f * 0.9, H + 0.8, 1.6, f), tint(wall, -0.4), 0.05);
      flat(b, soufflet(0, H + 1.2, 0.45, 2.8), tint(wall, -0.4), 0.05);
    } else {
      flat(b, circlePts(0, H + 2.4, 0.95, 10), dress, 0.03);
      flat(b, circlePts(0, H + 2.4, 0.75, 10), glass, 0.05);
    }
    b.box(td + 0.6, 0.4, 0.6, dress, { at: [0, H - 0.4, 0.1], jitter: false });
  });
}

/** The finished transept: tall walls, roofs crossing the nave's, the two end fronts. */
export function gothicTransept(b: Builder, c: Ctx) {
  const { wall, glass, ph } = c;
  const dress = tint(wall, 0.05);
  const td = CZ0 - CZ1;
  b.box(2 * TW, H, td, wall, { at: [0, 0, CZ] });
  b.box(2 * TW + 0.3, 0.4, td + 0.3, dress, { at: [0, H - 0.4, CZ], jitter: false });
  if (ph !== SHELLED) {
    roofX(b, CZ, -TW, TW, td / 2, H, RISE, c.roof, { g0: wall, g1: wall });
  } else {
    b.sym((s) => b.group({ at: [s * (TW - 0.35), H, CZ], rotY: Math.PI / 2 }, () => b.extrude([[-td / 2, 0], [td / 2, 0], [0, RISE]], 0.7, wall)));
  }
  b.sym((s) => {
    for (const [zf, rot] of [[CZ0, 0], [CZ1, Math.PI]] as const) {
      const xm = (s * (AW + TW)) / 2;
      for (const d of [-0.7, 0.7]) opening(b, 'pointed', 1.0, 4.2, [xm + d, 3.0, zf], rot, glass, dress, 0.12);
      tracery(b, 2.4, 7.4, [xm, 12.6, zf], rot, { lights: 2, glass, stone: dress });
    }
    transeptFront(b, c, s, s > 0 && ph >= FLAMBOYANT);
  });
  b.collider(2 * TW + 2, td, { at: [0, 0, CZ] });
}

// ------------------------------------------------------------------ the Gothic nave (1220s to 1240s)

/**
 * The High Gothic nave: low aisles with two-light windows, then a clerestory of four-light bar
 * tracery as tall as the arcade below, held by flying buttresses in two tiers on deep piers that
 * end in pinnacles. From the fourteenth century, chapels fill the spaces between the piers.
 */
export function gothicNave(b: Builder, c: Ctx) {
  const { wall, glass, ph } = c;
  const dress = tint(wall, 0.05);
  const len = TZ0 - CZ0;
  const zc = (TZ0 + CZ0) / 2;
  const chapels = ph >= FLAMBOYANT;
  const shelled = ph === SHELLED;
  b.box(2 * AW + 0.4, 0.5, len, tint(wall, -0.04), { at: [0, 0, zc] });
  b.box(2 * NW, H, len, wall, { at: [0, 0, zc] });
  b.box(2 * NW + 0.3, 0.4, len, dress, { at: [0, H - 0.4, zc], jitter: false });
  b.sym((s) => b.box(AW - NW, AH_H, len, wall, { at: [(s * (AW + NW)) / 2, 0, zc] }));
  if (!shelled) {
    const cut = ph === REBUILT && b.cutaway;
    roofZ(b, 0, CZ0, cut ? 3.1 : TZ0, NW, H, RISE, c.roof, { ovEnd: 0 });
    if (cut) concreteFrame(b, 3.1, TZ0);
    b.sym((s) => aisleRoof(b, s, CZ0, TZ0, AH_H, 2.2, c.roof));
  } else {
    const grey = mix(P.enduitGris, BURNT, 0.3);
    b.sym((s) => b.box(AW - NW, 0.3, len, grey, { at: [(s * (AW + NW)) / 2, AH_H, zc] }));
  }
  b.sym((s) => {
    const f = SIDE(s);
    for (const z of NAVE_BAYS) {
      tracery(b, 2.6, 8.8, [s * NW, 11.9, z], f, { lights: 4, glass, stone: dress });
      if (!chapels) tracery(b, 1.9, 5.2, [s * AW, 2.3, z], f, { lights: 2, glass, stone: dress });
    }
    // chapels between the buttresses, each with a flamboyant window under a gable
    if (chapels) {
      const ox = s * (AW + 2.2);
      for (let i = 0; i < 5; i++) {
        const z0 = NAVE_DIV[i] + (i === 0 ? 0 : 0.45);
        const z1 = NAVE_DIV[i + 1] - (i === 4 ? 0 : 0.45);
        const zm = (z0 + z1) / 2;
        b.box(2.2, 8.4, z1 - z0, wall, { at: [s * (AW + 1.1), 0, zm] });
        b.box(2.3, 0.6, z1 - z0, dress, { at: [s * (AW + 1.15), 8.4, zm], jitter: false });
        if (!shelled) b.box(2.2, 0.2, z1 - z0, c.roof, { at: [s * (AW + 1.1), 8.6, zm], jitter: false });
        tracery(b, 2.2, 5.8, [ox, 1.9, zm], f, { lights: 3, glass, stone: dress, style: 'flamboyant' });
        b.group({ at: [ox, 0, zm], rotY: f }, () => {
          b.extrude([[-1.5, 0], [1.5, 0], [0, 2.4]], 0.3, wall, { at: [0, 8.2, 0.15] });
          flat(b, soufflet(0, 8.7, 0.32, 1.2), tint(wall, -0.4), 0.31);
        });
      }
    }
  });
  // buttress piers and two tiers of flyers
  NAVE_DIV.slice(1, 5).forEach((z, i) => {
    for (const s of [1, -1]) {
      const broken = shelled && (i + (s > 0 ? 0 : 1)) % 3 === 0;
      radial(b, 0, z, SIDE(s), () => {
        culee(b, AW - 0.2, AW + 2.4, 17.5, 0.95, tint(wall, 0.03), broken ? 'none' : 'pinnacle');
        if (broken) b.box(0.85, 1.1, 0.85, tint(wall, 0.03), { at: [AW + 1.65, 17.5, 0] });
        flyer(b, NW, 16.3, AW, 13.7, 0.65, tint(wall, 0.06));
        flyer(b, NW, 20.6, AW, 17.4, 0.65, tint(wall, 0.06));
      });
    }
  });
  b.collider(2 * AW + 4.8, len, { at: [0, 0, zc] });
}

/** Henri Deneux's fireproof roof frame at Reims: trusses of small precast concrete members. */
export function concreteFrame(b: Builder, z0: number, z1: number) {
  const col = P.concrete;
  const n = Math.round((z1 - z0) / 1.25);
  for (const z of lin(n, z0 + 0.4, z1 - 0.4)) {
    b.beam([-NW - 0.1, H, z], [0, RIDGE, z], 0.18, 0.18, col);
    b.beam([NW + 0.1, H, z], [0, RIDGE, z], 0.18, 0.18, col);
    b.box(2 * NW, 0.18, 0.18, col, { at: [0, H + 0.1, z], jitter: false });
    b.box(2 * NW * 0.42, 0.16, 0.16, col, { at: [0, H + 4.1, z], jitter: false });
    b.box(0.16, RISE, 0.16, col, { at: [0, H, z], jitter: false });
    b.beam([0, H + 1.6, z], [-NW * 0.56, H + 3.0, z], 0.14, 0.14, col);
    b.beam([0, H + 1.6, z], [NW * 0.56, H + 3.0, z], 0.14, 0.14, col);
  }
  for (const [x, y] of [[0, RIDGE - 0.1], [-NW * 0.5, H + RISE * 0.5], [NW * 0.5, H + RISE * 0.5], [-NW * 0.85, H + RISE * 0.15], [NW * 0.85, H + RISE * 0.15]] as Pt[]) {
    b.box(0.16, 0.16, z1 - z0, col, { at: [x, y, (z0 + z1) / 2], jitter: false });
  }
  // the vaults' upper surface, seen through the frame
  b.vault(2 * NW - 0.2, z1 - z0, mix(P.enduitGris, STONE, 0.4), { at: [0, H - 0.6, (z0 + z1) / 2], squash: 0.45, segs: 8 });
}

// ------------------------------------------------------------------ the Gothic west front

function portal(b: Builder, c: Ctx, xc: number, W: number, widths: number[], apexes: number[], porchH: number, gableH: number, central: boolean) {
  const { wall } = c;
  const L = widths.length;
  const d = 0.45;
  for (let k = 0; k < L; k++) {
    const pts: Pt[] = [[-W / 2, 0], ...archPts('pointed', widths[k], apexes[k], 0, 0, 3), [W / 2, 0], [W / 2, porchH], [-W / 2, porchH]];
    b.extrude(pts, d, k % 2 ? tint(wall, -0.035) : wall, { at: [xc, 0, PZ - d * k - d / 2] });
  }
  const zb = PZ - d * L;
  const wl = widths[L - 1];
  const al = apexes[L - 1];
  if (zb > FZ + 0.01) b.box(wl + 0.2, al, zb - FZ, wall, { at: [xc, 0, (zb + FZ) / 2] });
  const lint = central ? 4.6 : 3.9;
  const fig = tint(c.statue, -0.12);
  b.group({ at: [xc, 0, zb], rotY: 0 }, () => {
    flat(b, rectPts(-wl / 2 + 0.05, 0, wl / 2 - 0.05, lint), c.door, 0.03);
    flat(b, archPts('pointed', wl - 0.1, al - lint - 0.45, 0, lint + 0.45, 3), c.statue, 0.03);
    // the tympanum: two registers of small figures under a larger one
    const rows = central ? [[lint + 0.6, 7], [lint + 1.7, 5]] : [[lint + 0.6, 5]];
    for (const [y, n] of rows) for (const u of lin(n, -wl / 2 + 0.45, wl / 2 - 0.45)) flat(b, rectPts(u - 0.12, y, u + 0.12, y + 0.8), fig, 0.05);
    flat(b, rectPts(-0.3, al - 1.9, 0.3, al - 0.75), fig, 0.05);
  });
  b.box(wl + 0.1, 0.45, 0.3, c.statue, { at: [xc, lint, zb + 0.15] });
  b.box(0.45, lint, 0.45, wall, { at: [xc, 0, zb + 0.22] });
  b.box(0.6, 0.15, 0.5, wall, { at: [xc, 0.9, zb + 0.5] });
  statue(b, [xc, 1.05, zb + 0.55], 2.4, c.statue, 0, c.heads);
  // jamb figures on the steps of the splayed sides
  for (let k = 0; k < L - 1; k++) {
    const x = (widths[k] + widths[k + 1]) / 4;
    const z = PZ - d * (k + 1) + 0.22;
    for (const s of [-1, 1]) {
      b.box(0.5, 1.0, 0.4, wall, { at: [xc + s * x, 0, z] });
      statue(b, [xc + s * x, 1.0, z], 2.5, c.statue, -0.45 * s, c.heads);
    }
  }
  // the gable (gâble) over the porch
  const gw = W / 2 - 0.25;
  b.extrude([[-gw, 0], [gw, 0], [0, gableH]], 0.35, wall, { at: [xc, porchH, PZ - 0.2] });
  b.group({ at: [xc, porchH, PZ - 0.02], rotY: 0 }, () => flat(b, circlePts(0, gableH * 0.4, gableH * 0.17, 8), tint(wall, -0.38), 0.03));
}

/**
 * The High Gothic west front (Amiens and Reims): three deep porches crowded with statues, a gallery
 * of kings, the rose, an open gallery, two towers. The north tower is finished with a stone
 * spire; the south stops at the foot of its belfry until about 1500.
 */
export function gothicFront(b: Builder, c: Ctx) {
  const { wall, glass, ph } = c;
  const dress = tint(wall, 0.05);
  const d = FZ - TZ0;
  b.box(22.4, 0.6, d + 0.3, tint(wall, -0.05), { at: [0, 0, TZC] });
  b.box(22, BEL0, d, wall, { at: [0, 0, TZC] });
  // buttresses between and beside the portals
  for (const x of [-10.3, -4, 4, 10.3]) {
    b.box(1.4, 12.5, 1.9, wall, { at: [x, 0, FZ + 0.95] });
    b.box(1.2, BEL0 - 12.5, 1.0, wall, { at: [x, 12.5, FZ + 0.5] });
    pinnacle(b, [x, 12.5, FZ + 1.45], 0.9, 3.4, wall);
  }
  // side buttresses on the towers' outer faces
  b.sym((s) => {
    for (const z of [TZ0 + 1.2, FZ - 0.7]) b.box(1.4, BEL0 - 2, 1.2, wall, { at: [s * 11.6, 0, z] });
    opening(b, 'pointed', 1.3, 6.4, [s * 11, 17.4, TZC], SIDE(s), glass, dress);
  });
  portal(b, c, 0, 6.6, [5.6, 4.8, 4.0, 3.2], [9.7, 9.3, 8.9, 8.5], 10.2, 3.8, true);
  b.sym((s) => portal(b, c, s * 7.15, 4.9, [4.2, 3.5, 2.8], [8.0, 7.6, 7.2], 8.6, 3.2, false));
  // the gallery of kings
  const y0 = 14.6;
  b.box(22.2, 0.35, 0.8, dress, { at: [0, y0 - 0.35, FZ + 0.4], jitter: false });
  const sections: [number, number, number][] = [[-3.4, 3.4, 6], [4.6, 9.7, 4], [-9.7, -4.6, 4]];
  let ki = 0;
  for (const [x0, x1, n] of sections) {
    const w = x1 - x0;
    const pitch = w / n;
    b.group({ at: [(x0 + x1) / 2, 0, FZ], rotY: 0 }, () => {
      flat(b, rectPts(-w / 2, y0, w / 2, 18.0), tint(wall, -0.4), 0.02);
      flat(b, archStripPts('pointed', -w / 2, w / 2, n, 17.0, 18.15, pitch / 2 - 0.09, 2), dress, 0.12);
      for (let i = 1; i < n; i++) strip(b, -w / 2 + i * pitch, y0, -w / 2 + i * pitch, 17.0, 0.14, dress, 0.12);
    });
    for (let i = 0; i < n; i++) {
      const x = x0 + pitch * (i + 0.5);
      const head = c.heads && !(ph === SHELLED && ki % 3 === 1);
      statue(b, [x, y0, FZ + 0.32], 2.1, c.statue, 0, head);
      if (head) b.box(0.3, 0.14, 0.3, c.statue, { at: [x, y0 + 2.0, FZ + 0.32], jitter: false });
      ki++;
    }
  }
  // the rose, tall lancets on the tower faces, the cornice
  rose(b, 3.0, [0, 21.8, FZ], 0, { stone: dress, glass, style: 'rayonnant' });
  b.sym((s) => {
    for (const dx of [-0.75, 0.75]) opening(b, 'pointed', 1.0, 6.2, [s * 7.15 + dx, 18.8, FZ], 0, glass, dress, 0.14);
  });
  b.box(22.6, 0.45, d + 0.4, dress, { at: [0, BEL0 - 0.45, TZC], jitter: false });
  // the open gallery joining the towers
  b.box(8.6, 4.4, FZ - 0.7 - TZ0, wall, { at: [0, BEL0, (TZ0 + FZ - 0.7) / 2] });
  b.box(8.6, 4.0, 0.08, tint(wall, -0.4), { at: [0, BEL0, FZ - 0.66], jitter: false });
  b.archWall(8.6, 4.0, 0.35, wall, { at: [0, BEL0, FZ - 0.25], openings: 7, openW: 0.8, openH: 3.3, shape: 'pointed' });
  b.box(9.0, 0.5, d, dress, { at: [0, BEL0 + 4.0, TZC] });
  b.box(9.0, 0.8, 0.3, wall, { at: [0, BEL0 + 4.5, FZ - 0.15] });
  // the towers
  belfry(b, c, -1, true);
  stoneSpire(b, c);
  if (ph >= FLAMBOYANT) {
    belfry(b, c, 1, true);
    crown(b, c);
  } else belfry(b, c, 1, false);
  b.collider(22.4, PZ - TZ0, { at: [0, 0, (PZ + TZ0) / 2] });
}

function belfry(b: Builder, c: Ctx, s: number, full: boolean) {
  const { wall } = c;
  const dress = tint(wall, 0.05);
  const cx = s * TX;
  const cz = TZC;
  const top = full ? BEL1 : 30;
  b.box(BEL, top - BEL0, BEL, wall, { at: [cx, BEL0, cz] });
  for (const dx of [-1, 1]) {
    for (const dz of [-1, 1]) {
      const bh = full ? BEL1 - BEL0 - 0.6 : top - BEL0 + (dx + dz > 0 ? 1.8 : dx === dz ? 0.6 : 1.1);
      b.box(1.1, bh, 1.1, wall, { at: [cx + dx * (BEL / 2), BEL0, cz + dz * (BEL / 2)] });
      if (full) pinnacle(b, [cx + dx * (BEL / 2), BEL0 + bh, cz + dz * (BEL / 2)], 0.8, 3.6, wall);
    }
  }
  const faces: [number, (u: number) => Vec3][] = [
    [0, (u) => [cx + u, 0, cz + BEL / 2]],
    [Math.PI, (u) => [cx - u, 0, cz - BEL / 2]],
    [Math.PI / 2, (u) => [cx + BEL / 2, 0, cz - u]],
    [-Math.PI / 2, (u) => [cx - BEL / 2, 0, cz + u]],
  ];
  for (const [rot, p] of faces) {
    for (const u of [-1.3, 1.3]) {
      const q = p(u);
      if (full) opening(b, 'pointed', 1.15, 7.6, [q[0], BEL0 + 1.4, q[2]], rot, LOUVRE, dress, 0.16);
      else opening(b, 'rect', 1.15, 1.6, [q[0], BEL0 + 1.4, q[2]], rot, LOUVRE, dress, 0.16);
    }
  }
  if (full) {
    for (const [w, dd, ox, oz] of [[BEL + 0.6, 0.3, 0, BEL / 2], [BEL + 0.6, 0.3, 0, -BEL / 2], [0.3, BEL + 0.6, BEL / 2, 0], [0.3, BEL + 0.6, -BEL / 2, 0]]) {
      b.box(w, 0.9, dd, dress, { at: [cx + ox, BEL1, cz + oz] });
    }
  } else {
    // building stopped: a temporary roof on the half-built belfry
    b.pyramid(BEL + 0.4, BEL + 0.4, 2.4, TILE, { at: [cx, top, cz], overhang: 0.25 });
  }
  b.collider(BEL, BEL, { at: [cx, 0, cz] });
}

function stoneSpire(b: Builder, c: Ctx) {
  const { wall } = c;
  const cx = -TX;
  const cz = TZC;
  const y = BEL1 + 0.2;
  b.box(BEL - 0.2, 0.3, BEL - 0.2, wall, { at: [cx, BEL1, cz] });
  b.cone(2.9, 17, wall, { at: [cx, y, cz], segs: 8, rotY: Math.PI / 8 });
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    b.group({ at: [cx + 2.2 * Math.sin(a), y + 0.5, cz + 2.2 * Math.cos(a)], rotY: a }, () => {
      b.box(1.0, 1.9, 1.2, wall, { at: [0, 0, -0.1] });
      b.gable(1.0, 1.2, 0.9, wall, { ridge: 'z', at: [0, 1.9, -0.1], overhang: 0.05 });
      flat(b, archPts('pointed', 0.5, 1.4, 0, 0.25, 2), LOUVRE, 0.52);
    });
  }
  // bands up the spire
  for (const f of [0.35, 0.65]) b.cyl(2.9 * (1 - f) + 0.08, 0.2, tint(wall, 0.05), { at: [cx, y + 17 * f, cz], segs: 8, rotY: Math.PI / 8, rTop: 2.9 * (1 - f) + 0.02, jitter: false });
  b.box(0.12, 1.4, 0.12, P.iron, { at: [cx, y + 16.9, cz] });
  b.box(0.7, 0.12, 0.12, P.iron, { at: [cx, y + 17.9, cz] });
}

/** The openwork octagonal crown of the south tower, finished about 1500. */
function crown(b: Builder, c: Ctx) {
  const { wall } = c;
  const cx = TX;
  const cz = TZC;
  const y = BEL1 + 0.2;
  const R = 2.75;
  const o8 = { segs: 8, rotY: Math.PI / 8 };
  b.box(BEL - 0.2, 0.3, BEL - 0.2, wall, { at: [cx, BEL1, cz] });
  b.cyl(R + 0.25, 0.5, wall, { ...o8, at: [cx, y, cz] });
  const y0 = y + 0.5;
  const ph = 6.8;
  for (let i = 0; i < 8; i++) {
    const t = Math.PI / 8 + (i * Math.PI) / 4;
    const px = cx + R * Math.sin(t);
    const pz = cz + R * Math.cos(t);
    b.box(0.42, ph, 0.42, wall, { at: [px, y0, pz], rotY: t });
    pinnacle(b, [px, y0 + ph + 0.45, pz], 0.45, 3.2, wall);
  }
  const ap = R * Math.cos(Math.PI / 8);
  const fw = 2 * R * Math.sin(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    const phi = (i * Math.PI) / 4;
    b.group({ at: [cx + ap * Math.sin(phi), y0, cz + ap * Math.cos(phi)], rotY: phi }, () => {
      const a = fw / 2 - 0.21;
      const ys = 4.4;
      flat(b, [...archHead('ogee', a, ys, 0, 3), ...archHead('ogee', a - 0.16, ys, 0, 3).reverse()], wall, 0);
      b.cone(0.13, 0.9, wall, { at: [0, ys + a * 1.5 - 0.05, 0], segs: 4 });
      strip(b, 0, 0.55, 0, ys + a * 0.9, 0.09, wall, 0);
      flat(b, archPts('pointed', a, 1.0, -a / 2, ys - 1.0, 2), wall, 0, {});
      flat(b, rectPts(-a, 0.3, a, 0.55), wall, 0);
    });
  }
  b.cyl(R + 0.28, 0.45, wall, { ...o8, at: [cx, y0 + ph, cz] });
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
    b.beam([cx + dx * (BEL / 2), BEL1 + 0.9, cz + dz * (BEL / 2)], [cx + dx * R * 0.72, y0 + 3.2, cz + dz * R * 0.72], 0.22, 0.3, wall);
  }
}

// ------------------------------------------------------------------ crossing spire, houses, ground

/** The timber and lead spire (flèche) over the crossing: the medieval one, or the restorers' taller design. */
export function fleche(b: Builder, kind: 'medieval' | 'restored') {
  const y = RIDGE - 3.0;
  const z = CZ;
  const o8 = { segs: 8, rotY: Math.PI / 8 };
  const dark = LOUVRE;
  if (kind === 'medieval') {
    b.cyl(1.55, 5.6, LEAD, { ...o8, at: [0, y, z] });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const ap = 1.55 * Math.cos(Math.PI / 8);
      opening(b, 'pointed', 0.55, 2.2, [ap * Math.sin(a), y + 2.9, z + ap * Math.cos(a)], a, dark);
    }
    b.cone(1.5, 13, LEAD, { ...o8, at: [0, y + 5.6, z] });
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      b.cone(0.26, 2.4, LEAD, { at: [1.5 * Math.sin(a), y + 5.6, z + 1.5 * Math.cos(a)], segs: 4 });
    }
    b.box(0.1, 1.0, 0.1, P.gold, { at: [0, y + 18.5, z] });
    b.box(0.5, 0.1, 0.1, P.gold, { at: [0, y + 19.1, z] });
    return;
  }
  b.cyl(1.95, 5.2, LEAD, { ...o8, at: [0, y, z] });
  b.cyl(2.1, 0.3, LEAD, { ...o8, at: [0, y + 5.2, z], jitter: false });
  b.cyl(1.55, 3.4, LEAD, { ...o8, at: [0, y + 5.5, z] });
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const ap1 = 1.95 * Math.cos(Math.PI / 8);
    const ap2 = 1.55 * Math.cos(Math.PI / 8);
    opening(b, 'pointed', 0.7, 2.6, [ap1 * Math.sin(a), y + 2.3, z + ap1 * Math.cos(a)], a, dark);
    if (k % 2 === 0) opening(b, 'pointed', 0.5, 2.0, [ap2 * Math.sin(a), y + 6.1, z + ap2 * Math.cos(a)], a, dark);
    const t = Math.PI / 8 + a;
    b.cone(0.2, 2.6, LEAD, { at: [2.0 * Math.sin(t), y + 5.4, z + 2.0 * Math.cos(t)], segs: 4 });
  }
  b.cone(1.45, 16.5, LEAD, { ...o8, at: [0, y + 8.9, z] });
  b.box(0.1, 1.2, 0.1, P.gold, { at: [0, y + 25.2, z] });
  b.box(0.3, 0.3, 0.5, P.gold, { at: [0, y + 26.4, z] });
  // the twelve apostles stepping down the four roofs
  const green = P.copperGreen;
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    for (let i = 0; i < 3; i++) {
      const dd = 2.7 + i * 1.0;
      statue(b, [dd * Math.sin(a), RIDGE + 0.15 - i * 0.05, z + dd * Math.cos(a)], 1.5, green, a + Math.PI);
    }
  }
}

/** Houses and shops built against the north side, between the buttresses (cleared in the 1850s). */
export function houses(b: Builder) {
  const spots: [number, number, number, number][] = [
    [-0.3, 3.9, 7.4, 0],
    [4.1, 8.2, 8.2, 1],
    [8.4, 12.4, 6.8, 2],
  ];
  const x0 = -(AW + 2.25);
  const dep = 4.2;
  const xm = x0 - dep / 2;
  for (const [z0, z1, h, i] of spots) {
    const zm = (z0 + z1) / 2;
    const w = z1 - z0;
    b.box(dep, h, w, i === 1 ? mix(P.torchis, P.plaster, 0.4) : P.torchis, { at: [xm, 0, zm] });
    b.frame(w, h, P.oakDark, { at: [x0 - dep, 0, zm], facing: '-x', studs: 3, rails: 1, beam: 0.18 });
    b.shed(dep + 0.5, w + 0.2, 2.6, TILE, { at: [xm - 0.25, h, zm], high: '+x' });
    b.group({ at: [x0 - dep, 0, zm], rotY: -Math.PI / 2 }, () => {
      flat(b, rectPts(-w / 2 + 0.5, 0, -w / 2 + 1.4, 2.1), P.oak, 0.1);
      flat(b, rectPts(0.1, 1.0, w / 2 - 0.5, 2.0), P.oak, 0.1);
      flat(b, rectPts(-0.6, h - 2.4, 0.6, h - 1.3), P.windowDark, 0.1);
    });
    for (const zf of [z0, z1]) {
      b.group({ at: [xm, 0, zf], rotY: zf === z1 ? 0 : Math.PI }, () => flat(b, rectPts(-0.4, h - 2.6, 0.4, h - 1.6), P.windowDark, 0.03));
    }
  }
  b.collider(dep, 12.7, { at: [xm, 0, 6.05] });
}

/** The ground of the whole plot, the same from the Gaulish sanctuary on: only its colour changes. */
export function holyGround(b: Builder, color: number) {
  b.box(33.6, 0.03, 66, color, { at: [0, 0, 0], jitter: false });
}

/** The square in front of the cathedral (the parvis). */
export function parvis(b: Builder) {
  b.box(33.6, 0.04, 33 - PZ, P.paving, { at: [0, 0, (33 + PZ) / 2], jitter: false });
  holyGround(b, mix(P.paving, P.grass, 0.45));
}

// ------------------------------------------------------------------ what history did to it

const FONT: Record<string, number[][]> = {
  T: [[0, 3, 2, 3], [1, 3, 1, 0]],
  E: [[0, 0, 0, 3], [0, 3, 2, 3], [0, 1.5, 1.5, 1.5], [0, 0, 2, 0]],
  M: [[0, 0, 0, 3], [0, 3, 1, 1.4], [1, 1.4, 2, 3], [2, 3, 2, 0]],
  P: [[0, 0, 0, 3], [0, 3, 2, 3], [2, 3, 2, 1.5], [2, 1.5, 0, 1.5]],
  L: [[0, 3, 0, 0], [0, 0, 2, 0]],
  D: [[0, 0, 0, 3], [0, 3, 1.3, 3], [1.3, 3, 2, 2.2], [2, 2.2, 2, 0.8], [2, 0.8, 1.3, 0], [1.3, 0, 0, 0]],
  A: [[0, 0, 1, 3], [1, 3, 2, 0], [0.5, 1.3, 1.5, 1.3]],
  R: [[0, 0, 0, 3], [0, 3, 2, 3], [2, 3, 2, 1.5], [2, 1.5, 0, 1.5], [0.8, 1.5, 2, 0]],
  I: [[1, 0, 1, 3], [0.4, 3, 1.6, 3], [0.4, 0, 1.6, 0]],
  S: [[2, 3, 0, 3], [0, 3, 0, 1.5], [0, 1.5, 2, 1.5], [2, 1.5, 2, 0], [2, 0, 0, 0]],
  O: [[0, 0, 0, 3], [0, 3, 2, 3], [2, 3, 2, 0], [2, 0, 0, 0]],
  N: [[0, 0, 0, 3], [0, 3, 2, 0], [2, 0, 2, 3]],
};

/** Painted capitals on a board: stroke letters made of flat bars. `at` is the centre of the baseline. */
export function lettering(b: Builder, text: string, at: Vec3, size: number, color: number) {
  const u = size / 3;
  const adv = u * 2.9;
  const x0 = (-adv * text.length) / 2 + u * 0.45;
  b.group({ at, rotY: 0 }, () => {
    [...text].forEach((ch, i) => {
      for (const [a, b1, c1, d1] of FONT[ch] ?? []) {
        strip(b, x0 + i * adv + a * u, b1 * u, x0 + i * adv + c1 * u, d1 * u, u * 0.45, color, 0.06);
      }
    });
  });
}

/** 1793: the inscription over the door, a tricolour on the gallery, the nave full of hay. */
export function revolution(b: Builder) {
  b.box(6.2, 1.0, 0.1, P.cream, { at: [0, 10.3, PZ + 0.08], jitter: false });
  lettering(b, 'TEMPLE DE LA RAISON', [0, 10.5, PZ + 0.1], 0.55, P.black);
  b.box(0.12, 5.2, 0.12, P.oakDark, { at: [0, BEL0 + 5.3, FZ - 0.15] });
  [P.doorBlue, P.white, P.postRed].forEach((col, i) => b.box(0.95, 1.7, 0.05, col, { at: [0.55 + i * 0.95, BEL0 + 8.6, FZ - 0.15], jitter: false }));
  // hay carted in through the central doors
  for (const [x, z, r] of [[-1.2, PZ + 1.2, 1.3], [1.0, PZ + 0.7, 1.0], [0.2, PZ - 0.6, 1.1]] as const) {
    b.blob(r, HAY, { at: [x, 0.2, z], stretch: [1.3, 0.55, 1.0], detail: 0 });
  }
  b.group({ at: [4.2, 0, PZ + 4.2], rotY: 0.3 }, () => {
    b.box(1.8, 0.25, 3.2, P.oak, { at: [0, 0.8, 0] });
    for (const s of [-1, 1]) b.cyl(0.75, 0.12, P.oakDark, { at: [s * 0.98, 0.75, 0.3], rot: [0, 0, Math.PI / 2], segs: 8 });
    b.blob(1.2, HAY, { at: [0, 1.6, 0], stretch: [0.9, 0.6, 1.5], detail: 0 });
    b.beam([0, 0.9, 1.6], [0, 0.5, 3.4], 0.12, 0.12, P.oak);
  });
}

/** The restorers' chimeras crouching on the gallery between the towers. */
export function chimeras(b: Builder, color: number) {
  const spots: [number, number, number][] = [];
  for (const x of lin(5, -3.8, 3.8)) spots.push([x, BEL0 + 5.3, FZ - 0.15]);
  for (const s of [-1, 1]) for (const dz of [-1, 1]) spots.push([s * (TX + (BEL / 2 + 0.05) * (s > 0 ? 1 : -1)), BEL1 + 0.9, TZC + dz * 1.6]);
  spots.forEach(([x, y, z], i) => {
    b.blob(0.32, color, { at: [x, y + 0.32, z], stretch: [0.8, 1.1, 1.1], detail: 0 });
    b.box(0.26, 0.26, 0.36, color, { at: [x, y + 0.62, z + 0.18], rotY: (i % 3) * 0.4 - 0.4, jitter: false });
    b.box(0.08, 0.3, 0.08, color, { at: [x - 0.12, y + 0.78, z + 0.1], jitter: false });
  });
}

/** September 1914: vaults open to the sky and holed, charred timbers, sandbags, burnt scaffolding. */
export function shelled(b: Builder, c: Ctx) {
  const grey = mix(P.enduitGris, BURNT, 0.3);
  const y = H - 0.6;
  const crown = y + NW * 0.45;
  b.vault(2 * NW - 0.1, TZ0 - CZ0, grey, { at: [0, y, (TZ0 + CZ0) / 2], squash: 0.45, segs: 8 });
  b.vault(2 * NW - 0.1, CZ1 - HZ, grey, { at: [0, y, (CZ1 + HZ) / 2], squash: 0.45, segs: 8 });
  b.vault(CZ0 - CZ1 - 0.1, 2 * TW - 1, grey, { at: [0, y, CZ], squash: 0.45 * (2 * NW) / (CZ0 - CZ1), segs: 8, axis: 'x' });
  b.dome(NW - 0.05, grey, { at: [0, y, HZ], squash: 0.45, segs: 10 });
  // shell holes through the vaults
  for (const [x, z] of [[0.2, 2.2], [-0.3, 9.6], [0.1, -16.0], [9.4, CZ + 0.1], [-6.0, CZ - 0.2]] as Pt[]) {
    b.cyl(0.95, 0.3, VOID, { at: [x, crown - 0.22, z], segs: 7 });
  }
  for (const [x, z] of [[5.9, 6.0], [-5.9, -2.0], [5.9, -18.0]] as Pt[]) b.cyl(0.7, 0.12, VOID, { at: [x, (Math.abs(z) > 12 ? AH_E : AH_H) + 0.25, z], segs: 6 });
  // what is left of the roof timbers
  const char = P.timberBlack;
  for (const [z, s, l] of [[-1.5, 1, 3.2], [4.2, -1, 2.6], [11.0, 1, 3.8], [-15.0, -1, 3.0], [-18.6, 1, 2.2]] as const) {
    b.beam([s * NW, H + 0.1, z], [s * (NW - l * 0.7), H + 0.4 + l * 0.6, z + 0.4], 0.2, 0.2, char);
  }
  b.beam([-3.5, H + 1.2, 6.0], [3.0, H + 1.0, 8.2], 0.24, 0.24, char);
  b.beam([2.0, H + 1.4, -1.0], [-1.5, H + 0.9, 3.0], 0.22, 0.22, char);
  // sandbags walling up the three portals
  const bag = SANDBAG;
  for (const [xc, w, h] of [[0, 5.4, 4.6], [-7.15, 4.0, 3.6], [7.15, 4.0, 3.6]] as const) {
    for (let i = 0; i < Math.round(h / 0.4); i++) {
      b.box(w - (i % 2) * 0.15, 0.38, 1.3 - i * 0.04, i % 2 ? bag : tint(bag, -0.05), { at: [xc, i * 0.4, PZ - 0.35], jitter: false });
    }
  }
  // the burnt scaffolding on the north tower, where the fire started
  const sx = -TX;
  const r = BEL / 2 + 1.0;
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
    b.beam([sx + dx * r, BEL0, TZC + dz * r], [sx + dx * r * 0.96, BEL1 + 1.5, TZC + dz * r * 0.98], 0.16, 0.16, char);
  }
  for (const yy of [30.5, 34.5]) {
    for (const dz of [-1, 1]) b.beam([sx - r, yy, TZC + dz * r], [sx + r, yy + (dz > 0 ? 0 : -0.6), TZC + dz * r], 0.13, 0.13, char);
    b.beam([sx - r, yy, TZC - r], [sx - r, yy - 0.4, TZC + r], 0.13, 0.13, char);
  }
  // soot from the fire, and scars where shells struck the walls
  const soot = mix(BURNT, 0x101010, 0.45);
  const blot = (cx: number, cy: number, r: number, k: number): Pt[] =>
    Array.from({ length: 9 }, (_, i) => {
      const t = (i / 9) * Math.PI * 2;
      const rr = r * (0.7 + 0.3 * Math.abs(Math.sin(i * 2.3 + k)));
      return [cx + rr * Math.cos(t), cy + rr * Math.sin(t) * 1.4] as Pt;
    });
  b.group({ at: [-TX, 0, TZC + BEL / 2], rotY: 0 }, () => {
    flat(b, blot(-1.4, 31.0, 1.6, 1), soot, 0.08);
    flat(b, blot(1.2, 34.5, 1.4, 2), soot, 0.08);
  });
  b.group({ at: [0, 0, FZ], rotY: 0 }, () => {
    flat(b, blot(-7.2, 23.5, 1.5, 3), soot, 0.03);
    flat(b, blot(5.2, 25.6, 0.9, 4), soot, 0.03);
    flat(b, blot(-2.6, 19.0, 0.8, 5), soot, 0.03);
  });
  b.group({ at: [0, 0, PZ], rotY: 0 }, () => {
    flat(b, blot(-1.4, 9.2, 1.2, 6), soot, 0.03);
    flat(b, blot(2.0, 9.6, 0.8, 7), soot, 0.03);
  });
  for (const [x, y, z, rot, r] of [[NW, 18.5, 7.0, Math.PI / 2, 0.7], [-NW, 13.0, -0.7, -Math.PI / 2, 0.6], [AW, 6.5, 10.0, Math.PI / 2, 0.5], [TW, 19.0, CZ - 2.2, Math.PI / 2, 0.6]] as const) {
    b.group({ at: [x, 0, z], rotY: rot }, () => flat(b, blot(0, y, r, x), VOID, 0.1));
  }
  // fallen stone
  for (const [x, z, rr] of [[9.2, 4.5, 0.9], [-9.4, -2.5, 0.8], [12.0, 9.0, 0.6], [-6.5, PZ + 3.0, 0.7]] as const) {
    b.blob(rr, c.wall, { at: [x, 0.1, z], stretch: [1.4, 0.5, 1.1], detail: 0 });
  }
}

// ------------------------------------------------------------------ assembly

/** The whole cathedral at one moment in its history, from the Romanesque church on. */
export function cathedral(b: Builder, ph: Phase) {
  const c = ctx(ph);
  parvis(b);
  if (ph === ROMANESQUE) {
    romanesqueNave(b, c);
    romanesqueFront(b);
    romanesqueEast(b);
    return;
  }
  gothicChoir(b, c);
  if (ph === EARLY) {
    romanesqueNave(b, c);
    romanesqueFront(b);
    transeptSite(b, c);
    return;
  }
  gothicTransept(b, c);
  gothicNave(b, c);
  gothicFront(b, c);
  if (ph === HIGH || ph === FLAMBOYANT) fleche(b, 'medieval');
  if (ph === RESTORED) fleche(b, 'restored');
  if (ph >= HIGH && ph <= REVOLUTION) houses(b);
  if (ph === REVOLUTION) revolution(b);
  if (ph >= RESTORED) chimeras(b, ph === RESTORED ? NEW_STONE : c.statue);
  if (ph === SHELLED) shelled(b, c);
  if (ph === REBUILT) repairs(b);
}

/** New stone let into the old after the war: pale patches where the fire and the shells struck. */
export function repairs(b: Builder) {
  const fresh = tint(NEW_STONE, -0.02);
  const r = (x0: number, y0: number, x1: number, y1: number) => rectPts(x0, y0, x1, y1);
  b.group({ at: [0, 0, FZ], rotY: 0 }, () => {
    flat(b, r(-8.6, 22.4, -6.2, 25.2), fresh, 0.03);
    flat(b, r(4.8, 24.6, 6.0, 26.3), fresh, 0.03);
    flat(b, r(-3.3, 18.2, -1.6, 19.6), fresh, 0.03);
  });
  b.group({ at: [-TX, 0, TZC + BEL / 2], rotY: 0 }, () => {
    flat(b, r(-2.6, 29.6, -0.4, 32.4), fresh, 0.08);
    flat(b, r(0.4, 33.4, 2.4, 35.6), fresh, 0.08);
  });
  for (const [x, z, rot, y0, y1] of [[NW, 7.0, Math.PI / 2, 17.6, 19.6], [-NW, -0.7, -Math.PI / 2, 12.2, 13.9], [TW, CZ - 2.2, Math.PI / 2, 18.2, 19.9]] as const) {
    b.group({ at: [x, 0, z], rotY: rot }, () => flat(b, r(-0.9, y0, 0.9, y1), fresh, 0.1));
  }
}
