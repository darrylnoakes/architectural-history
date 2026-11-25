import * as THREE from 'three';
import { P, facingAngle, mix, spread, tint, type Builder, type Facing, type Opts } from '@ah/kit';

/*
 * Local helpers for the Italian power lineage.
 *
 *  - cheap triangle soups, arch outlines, arched windows and arcades (fewer facets than the kit's);
 *  - ashlar facing for walls of great squared blocks (two tints in a checkerboard, one quad a block);
 *  - THE PALAZZO PUBBLICO of 1300 and its tower, which every later stage keeps (palazzoPubblico);
 *  - the lord's Renaissance additions of 1480: arcaded courtyard and the wing with twin turrets,
 *    kept by every stage after it (lordsCourt);
 *  - the bronze monument to the king of 1885, which stays in the square (kingMonument).
 *
 * Plan of the plot from 1300 (front, +Z, faces the main square):
 *   palace      x -20..5,  z -3..7      (tower at its front left corner)
 *   courtyard   behind the palace, x -13..4, z -16..-3 (from 1480)
 *   lord's wing x -20..-13, z -21..-3, twin turrets facing -X (from 1480); back range z -21..-16
 *   zone C      x 7..21.5 down the right side: what each age builds "beside the old palace"
 *   the square  z 7..22 in front
 */

export type XZ = [number, number];
export type V3 = [number, number, number];

// ------------------------------------------------------------------ raw triangles

/** Add a triangle soup: `pos` is a flat [x, y, z, ...] list, three vertices per triangle. */
export function soup(b: Builder, pos: number[], color: number, o?: Opts): void {
  if (!pos.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  b.add(g, color, o);
}

/** Push a quad (a, b, c, d in order around its edge) as two triangles. */
export function quad(out: number[], a: number[], b: number[], c: number[], d: number[]): void {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/** A box from p to q in plan (w thick, h tall, base at y). */
export function wallSeg(b: Builder, p: XZ, q: XZ, w: number, h: number, color: number, y = 0, extend = 0, o?: Opts): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  b.box(L + extend * 2, h, w, color, { ...o, at: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** One walk collider per segment of a polyline. */
export function lineColliders(b: Builder, pts: XZ[], thick: number, skip: number[] = []): void {
  for (let i = 0; i < pts.length - 1; i++) {
    if (skip.includes(i)) continue;
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const dx = x1 - x0;
    const dz = z1 - z0;
    b.collider(Math.hypot(dx, dz) + thick * 0.5, thick, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(-dz, dx) });
  }
}

/**
 * Ashlar facing: rows of great squared blocks on the face of a wall running from p to q, as one
 * quad a block, alternate blocks in two tints and standing a hair proud so the joints read.
 * `side` +1 puts the facing on the right of the direction p to q, -1 on the left.
 */
export function ashlar(
  b: Builder,
  p: XZ,
  q: XZ,
  y0: number,
  h: number,
  off: number,
  colors: [number, number],
  o?: { course?: number; block?: number; side?: 1 | -1 },
): void {
  const course = o?.course ?? 0.7;
  const block = o?.block ?? 1.6;
  const side = o?.side ?? 1;
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const ux = (q[0] - p[0]) / L;
  const uz = (q[1] - p[1]) / L;
  const nx = -uz * side;
  const nz = ux * side;
  const A: number[] = [];
  const B: number[] = [];
  const rows = Math.max(1, Math.round(h / course));
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    const n = Math.max(1, Math.round(L / block));
    const bl = L / n;
    const shift = r % 2 ? bl * 0.5 : 0;
    for (let k = -1; k < n; k++) {
      let s0 = k * bl + shift + 0.03;
      let s1 = (k + 1) * bl + shift - 0.03;
      s0 = Math.max(0, s0);
      s1 = Math.min(L, s1);
      if (s1 - s0 < 0.1) continue;
      const ya = y0 + r * ch + 0.03;
      const yb = y0 + (r + 1) * ch - 0.03;
      const d = off + ((r * 3 + k) % 3 === 0 ? 0.05 : 0.025);
      const a = [p[0] + ux * s0 + nx * d, ya, p[1] + uz * s0 + nz * d];
      const c = [p[0] + ux * s1 + nx * d, ya, p[1] + uz * s1 + nz * d];
      const e = [p[0] + ux * s1 + nx * d, yb, p[1] + uz * s1 + nz * d];
      const f = [p[0] + ux * s0 + nx * d, yb, p[1] + uz * s0 + nz * d];
      quad((r + k) % 2 ? A : B, a, c, e, f);
    }
  }
  soup(b, A, colors[0], { jitter: false });
  soup(b, B, colors[1], { jitter: false });
}

// ------------------------------------------------------------------ low-poly arched openings

export type Shape = 'pointed' | 'round' | 'rect' | 'segmental';

/** Outline of an arched opening w wide and h tall (to the apex), sampled with few points. */
export function archOutline(w: number, h: number, shape: Shape, n = 3): [number, number][] {
  const a = w / 2;
  if (shape === 'rect') return [[-a, 0], [a, 0], [a, h], [-a, h]];
  const pts: [number, number][] = [[-a, 0], [a, 0]];
  if (shape === 'segmental') {
    const rise = Math.min(h * 0.5, w * 0.18);
    const hs = h - rise;
    for (let i = 0; i <= n * 2; i++) {
      const t = i / (n * 2);
      const x = a - 2 * a * t;
      pts.push([x, hs + rise * (1 - (x / a) * (x / a))]);
    }
    return pts;
  }
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

/** A cheap arched panel standing `depth` proud of a wall (same placement rules as Builder.panel). */
export function arch(
  b: Builder,
  w: number,
  h: number,
  color: number,
  o: { at?: V3; facing?: Facing; shape?: Shape; depth?: number; mat?: 'matte' | 'glass'; n?: number },
): void {
  const depth = o.depth ?? 0.06;
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(archOutline(w, h, o.shape ?? 'pointed', o.n ?? 2), depth + 0.03, color, {
      at: [0, 0, (depth - 0.03) / 2],
      mat: o.mat,
      jitter: false,
    });
  });
}

/**
 * A flat arched face (no thickness, a handful of triangles) lying `off` in front of a wall: for
 * glazing and stone frames that only need to be seen, not walked round.
 */
export function flatArch(
  b: Builder,
  w: number,
  h: number,
  color: number,
  o: { at?: V3; facing?: Facing; shape?: Shape; off?: number; n?: number; mat?: 'matte' | 'glass' },
): void {
  const g = new THREE.ShapeGeometry(new THREE.Shape(archOutline(w, h, o.shape ?? 'pointed', o.n ?? 2).map(([x, y]) => new THREE.Vector2(x, y))), 1);
  g.translate(0, 0, o.off ?? 0.05);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => b.add(g, color, { jitter: false, mat: o.mat }));
}

/**
 * A flat U-shaped band round an opening that runs down to the ground (voussoirs and jambs picked out
 * in another stone), leaving the opening itself clear.
 */
export function archRing(
  b: Builder,
  wo: number,
  ho: number,
  wi: number,
  hi: number,
  color: number,
  o: { at?: V3; facing?: Facing; shape?: Shape; off?: number; n?: number },
): void {
  const shape = o.shape ?? 'round';
  const outer = archOutline(wo, ho, shape, o.n ?? 3).slice(2);
  const inner = archOutline(wi, hi, shape, o.n ?? 3).slice(2).reverse();
  const pts = [[wo / 2, 0], ...outer, [-wo / 2, 0], [-wi / 2, 0], ...inner, [wi / 2, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts), 1);
  g.translate(0, 0, o.off ?? 0.04);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => b.add(g, color, { jitter: false }));
}

/** A cheap arched window: stone frame and dark glazing. */
export function archWindow(
  b: Builder,
  w: number,
  h: number,
  o: { at?: V3; facing?: Facing; shape?: Shape; frame?: number; glass?: number; border?: number; n?: number },
): void {
  const frame = o.frame ?? P.travertine;
  const border = o.border ?? Math.min(0.14, w * 0.12);
  const shape = o.shape ?? 'round';
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    flatArch(b, w, h, frame, { shape, off: 0.04, n: o.n });
    flatArch(b, w - border * 2, h - border * 2, o.glass ?? P.windowDark, { at: [0, border, 0], shape, off: 0.07, n: o.n });
  });
}

/** A plain rectangular window with a stone frame, optional cornice (Renaissance and later). */
export function rectWindow(
  b: Builder,
  w: number,
  h: number,
  o: { at: V3; facing?: Facing; frame?: number; glass?: number; cornice?: boolean; sill?: boolean; border?: number },
): void {
  const frame = o.frame ?? P.pietraSerena;
  const bd = o.border ?? 0.14;
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    flatArch(b, w, h, frame, { shape: 'rect', off: 0.04 });
    flatArch(b, w - bd * 2, h - bd * 2, o.glass ?? P.windowDark, { at: [0, bd, 0], shape: 'rect', off: 0.07 });
    if (o.cornice) b.box(w + 0.3, 0.18, 0.26, frame, { at: [0, h, 0.1], jitter: false });
    if (o.sill) b.box(w + 0.2, 0.12, 0.24, frame, { at: [0, -0.1, 0.1], jitter: false });
  });
}

/**
 * A wall pierced by a row of arched openings down to the ground (same placement as Builder.archWall).
 */
export function arcade(
  b: Builder,
  w: number,
  h: number,
  t: number,
  color: number,
  o: { at?: V3; facing?: Facing; openings: number; openW: number; openH: number; shape?: Shape; n?: number },
): void {
  const pitch = w / o.openings;
  const pts: [number, number][] = [[-w / 2, 0]];
  for (let i = 0; i < o.openings; i++) {
    const xc = -w / 2 + (i + 0.5) * pitch;
    const ol = archOutline(o.openW, o.openH, o.shape ?? 'round', o.n ?? 2);
    pts.push([xc - o.openW / 2, 0]);
    for (const [x, y] of ol.slice(2).reverse()) pts.push([xc + x, y]);
    pts.push([xc + o.openW / 2, 0]);
  }
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => {
    b.extrude(pts, t, color);
  });
}

/**
 * A row of square (Guelph) merlons along a line from p to q at height y, drawn as one soup with no
 * bottom faces; `swallow` gives the notched Ghibelline swallowtail.
 */
export function merlons(b: Builder, p: XZ, q: XZ, y: number, color: number, o?: { w?: number; h?: number; t?: number; swallow?: boolean }): void {
  const mw = o?.w ?? 0.8;
  const mh = o?.h ?? 1.0;
  const t = (o?.t ?? 0.45) / 2;
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n = Math.max(1, Math.round(L / (mw * 2)));
  const ux = (q[0] - p[0]) / L;
  const uz = (q[1] - p[1]) / L;
  const nx = -uz;
  const nz = ux;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = ((i + 0.5) / n) * L;
    const cx = p[0] + ux * u;
    const cz = p[1] + uz * u;
    const V = (s: number, d: number, yy: number) => [cx + ux * s * (mw / 2) + nx * d, yy, cz + uz * s * (mw / 2) + nz * d];
    const top = y + mh;
    if (o?.swallow) {
      const notch = y + mh * 0.7;
      for (const d of [t, -t]) {
        quad(out, V(-1, d, y), V(1, d, y), V(1, d, top + 0.25), V(-1, d, top + 0.25));
        out.push(...V(-0.1, d, top + 0.25), ...V(0.1, d, top + 0.25), ...V(0, d, notch));
      }
      quad(out, V(-1, t, top + 0.25), V(-1, -t, top + 0.25), V(0, -t, notch), V(0, t, notch));
      quad(out, V(1, -t, top + 0.25), V(1, t, top + 0.25), V(0, t, notch), V(0, -t, notch));
    } else {
      quad(out, V(-1, t, y), V(1, t, y), V(1, t, top), V(-1, t, top));
      quad(out, V(1, -t, y), V(-1, -t, y), V(-1, -t, top), V(1, -t, top));
      quad(out, V(-1, t, top), V(1, t, top), V(1, -t, top), V(-1, -t, top));
    }
    quad(out, V(-1, -t, y), V(-1, t, y), V(-1, t, top), V(-1, -t, top));
    quad(out, V(1, t, y), V(1, -t, y), V(1, -t, top), V(1, t, top));
  }
  soup(b, out, color, { jitter: false });
}

/**
 * A band of corbels (brackets) along a wall face from p to q at height y, standing out `out`: each a
 * wedge drawn as its sloping underside and front face only (`sides` adds the two side faces).
 */
export function corbels(b: Builder, p: XZ, q: XZ, y: number, out: number, color: number, o?: { pitch?: number; h?: number; side?: 1 | -1; t?: number; sides?: boolean }): void {
  const pitch = o?.pitch ?? 1.2;
  const h = o?.h ?? 0.9;
  const side = o?.side ?? 1;
  const t = (o?.t ?? 0.28) / 2;
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const ux = (q[0] - p[0]) / L;
  const uz = (q[1] - p[1]) / L;
  const nx = -uz * side;
  const nz = ux * side;
  const n = Math.max(1, Math.round(L / pitch));
  const out3: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = ((i + 0.5) / n) * L;
    const cx = p[0] + ux * u;
    const cz = p[1] + uz * u;
    const P0 = (s: number, d: number, yy: number) => [cx + ux * s * t + nx * d, yy, cz + uz * s * t + nz * d];
    // underside slope from the wall foot up to the outer top, then the outer face
    quad(out3, P0(-1, 0, y), P0(1, 0, y), P0(1, out, y + h * 0.7), P0(-1, out, y + h * 0.7));
    quad(out3, P0(-1, out, y + h * 0.7), P0(1, out, y + h * 0.7), P0(1, out, y + h), P0(-1, out, y + h));
    if (o?.sides) {
      for (const s of [-1, 1]) {
        out3.push(...P0(s, 0, y), ...P0(s, out, y + h * 0.7), ...P0(s, out, y + h));
        out3.push(...P0(s, 0, y), ...P0(s, out, y + h), ...P0(s, 0, y + h));
      }
    }
  }
  soup(b, out3, color, { jitter: false });
}

/**
 * A cheap classical column of `h` total height: an open-ended tapering shaft, a square base, and a
 * flared capital under a square abacus (a bell of leaves for 'corinthian', a cushion for 'doric').
 */
export function column(b: Builder, at: V3, r: number, h: number, color: number, o?: { order?: 'doric' | 'corinthian' | 'ionic'; segs?: number }): void {
  const segs = o?.segs ?? 6;
  const order = o?.order ?? 'doric';
  const baseH = order === 'doric' ? 0.12 * h * 0.3 : h * 0.05;
  const capH = order === 'corinthian' ? h * 0.12 : h * 0.07;
  const shaft = new THREE.CylinderGeometry(r * 0.86, r, h - baseH - capH, segs, 1, true);
  shaft.translate(0, (h - baseH - capH) / 2 + baseH, 0);
  b.add(shaft, color, { at, jitter: false });
  b.box(r * 2.5, baseH, r * 2.5, color, { at, jitter: false });
  const cap = new THREE.CylinderGeometry(order === 'corinthian' ? r * 1.4 : r * 1.2, r * 0.86, capH * 0.75, segs, 1, true);
  cap.translate(0, h - capH + (capH * 0.75) / 2, 0);
  b.add(cap, color, { at, jitter: false });
  b.box(r * (order === 'ionic' ? 3.2 : 2.9), capH * 0.25, r * 2.9, color, { at: [at[0], at[1] + h - capH * 0.25, at[2]], jitter: false });
}

/** A flat area of paving (or grass) at ground level. */
export function pave(b: Builder, w: number, d: number, x: number, z: number, color: number, y = 0): void {
  b.box(w, 0.06, d, color, { at: [x, y, z], jitter: false });
}

/** A brick square laid in panels between travertine strips, like the Campo of Siena. */
export function brickSquare(b: Builder, x0: number, x1: number, z0: number, z1: number, o?: { strips?: number }): void {
  // laid 0.1 m thick so that it shows over the town's own ground
  b.box(x1 - x0, 0.1, z1 - z0, mix(P.cotto, P.paving, 0.35), { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], jitter: false });
  const n = o?.strips ?? 6;
  for (const x of spread(n, x0 + 1, x1 - 1)) b.box(0.3, 0.115, z1 - z0, P.travertine, { at: [x, 0, (z0 + z1) / 2], jitter: false });
  b.box(x1 - x0, 0.115, 0.3, P.travertine, { at: [(x0 + x1) / 2, 0, z0 + 0.3], jitter: false });
}

/**
 * The main square as the commune first had it, about 1210: beaten earth, with a band of stone flags
 * along the front of the town hall. It is paved in brick in the 1340s (brickSquare).
 */
export function earthSquare(b: Builder): void {
  b.box(43, 0.1, 14.5, mix(P.earth, P.gravel, 0.5), { at: [0, 0, 14.25], jitter: false });
  b.box(28, 0.13, 2.6, tint(P.pietraForte, 0.04), { at: [-4.5, 0, 8.3], jitter: false });
}

/** A low-poly flag on a pole: `stripes` are colours hung vertically (tricolour) or one banner colour. */
export function flag(b: Builder, at: V3, pole: number, stripes: number[], o?: { w?: number; h?: number; rotY?: number }): void {
  const w = o?.w ?? 1.8;
  const h = o?.h ?? 1.2;
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.cyl(0.05, pole, P.iron, { segs: 4 });
    const sw = w / stripes.length;
    stripes.forEach((c, i) => b.box(sw, h, 0.04, c, { at: [0.06 + sw * (i + 0.5), pole - h - 0.1, 0], jitter: false }));
  });
}

export const TRICOLORE = [0x2f7a4a, P.white, 0xc23b2e];

// ------------------------------------------------------------------ THE PALAZZO PUBBLICO (1300 onward)

/** Fixed plan of the civic palace of 1300, kept by every later stage. */
export const PAL = {
  x0: -20,
  x1: 5,
  zf: 7,
  zb: -3,
  /** the three blocks: left wing, raised centre, right wing */
  cx0: -11.5,
  cx1: -3.5,
  /** ground storey and upper storey heights */
  g: 6,
  s: 4.6,
};
/** Top of the wing walls and of the raised centre. */
export const WING_TOP = PAL.g + PAL.s * 2;
export const CENTRE_TOP = PAL.g + PAL.s * 3;
/** The tower: square brick shaft at the front left corner. */
export const TWR = { x: -17.6, z: 5.0, w: 4.4, shaft: 37 };
/** Height of the top of the tower's finial. */
export const TWR_TOP = TWR.shaft + 1.4 + 1.4 + 4.8 + 3.6;
/** The main portal, at the middle of the centre block. */
export const PORTAL_X = (PAL.cx0 + PAL.cx1) / 2;

/**
 * A Gothic three-light window (trifora) of the civic palace: a pointed arch of white stone round three
 * dark lights divided by slender colonnettes, the arch head filled with stone.
 */
export function trifora(b: Builder, at: V3, facing: Facing, w = 2.4, h = 3.4, stone: number = P.travertine): void {
  b.group({ at, rotY: facingAngle(facing) }, () => {
    arch(b, w + 0.4, h + 0.35, stone, { at: [0, -0.15, 0], depth: 0.08, n: 2 });
    const lh = h * 0.6;
    const lw = (w - 0.5) / 3;
    for (const i of [-1, 0, 1]) flatArch(b, lw, lh, P.windowDark, { at: [i * (lw + 0.12), 0.1, 0], off: 0.115, n: 1 });
    // small round light in the stone tympanum, and a sill
    flatArch(b, 0.36, 0.36, P.windowDark, { at: [0, h * 0.72, 0], shape: 'round', off: 0.115, n: 2 });
    b.box(w + 0.5, 0.14, 0.3, stone, { at: [0, -0.2, 0.12], jitter: false });
  });
}

/** A two-light window (bifora), used on the back and sides. */
export function bifora(b: Builder, at: V3, facing: Facing, w = 1.7, h = 3, stone: number = P.travertine): void {
  b.group({ at, rotY: facingAngle(facing) }, () => {
    flatArch(b, w + 0.3, h + 0.25, stone, { at: [0, -0.1, 0], off: 0.04, n: 2 });
    const lw = (w - 0.3) / 2;
    for (const i of [-1, 1]) flatArch(b, lw, h * 0.62, P.windowDark, { at: [i * (lw / 2 + 0.08), 0.1, 0], shape: 'round', off: 0.07, n: 1 });
  });
}

/** A Sienese arch: a pointed arch round a flat lintel, the classic doorway of the Gothic civic palace. */
export function sieneseArch(b: Builder, at: V3, facing: Facing, w: number, h: number, stone: number, fill: number): void {
  b.group({ at, rotY: facingAngle(facing) }, () => {
    arch(b, w + 0.6, h + 0.4, stone, { depth: 0.06, n: 2 });
    const ls = h - Math.min(h * 0.6, w * 0.866); // springing height
    flatArch(b, w, h, mix(stone, P.cotto, 0.5), { off: 0.1, n: 2 }); // brick tympanum
    flatArch(b, w, ls, fill, { shape: 'rect', off: 0.12 });
    b.box(w + 0.1, 0.35, 0.14, stone, { at: [0, ls, 0.08], jitter: false }); // the lintel
  });
}

export interface PalaceOpts {
  /** 1300: as built. Later stages alter it. */
  stage: 1300 | 1480 | 1885 | 1934 | 1975 | 2012;
  /** The clock's minute hand; by default from the stage after 1480 (the lord's palace gains it as a revision). */
  minuteHand?: boolean;
}

/**
 * The civic palace of about 1300 and its tower, kept from then on. Brick upper storeys over a stone
 * ground floor, three-light windows, a machicolated and battlemented crown, a raised centre block,
 * and the tall slender tower with its stone crown and bell chamber. Later stages add a clock, a
 * bell, a flag and (2012) a cleaner restored skin; the building itself never changes shape.
 */
export function palazzoPubblico(b: Builder, o: PalaceOpts): void {
  const st = o.stage;
  const restored = st >= 2012;
  const brick = restored ? tint(P.cotto, 0.03) : st >= 1885 ? tint(P.cotto, -0.03) : P.cotto;
  const stone = restored ? tint(P.travertine, 0.02) : P.travertine;
  const stoneDark = tint(stone, -0.06);
  const { x0, x1, zf, zb, cx0, cx1, g, s } = PAL;
  const D = zf - zb;
  const zc = (zf + zb) / 2;
  const parts: { a: number; b: number; top: number }[] = [
    { a: x0, b: cx0, top: WING_TOP },
    { a: cx0, b: cx1, top: CENTRE_TOP },
    { a: cx1, b: x1, top: WING_TOP },
  ];
  for (const p of parts) {
    const w = p.b - p.a;
    const xc = (p.a + p.b) / 2;
    const ff = zf + (p.top === CENTRE_TOP ? 0.25 : 0); // the centre stands slightly forward
    const d = ff - zb;
    const zcc = (ff + zb) / 2;
    // stone ground storey, brick above
    b.box(w, g, d, stone, { at: [xc, 0, zcc] });
    b.box(w, p.top - g, d, brick, { at: [xc, g, zcc] });
    // string courses at each sill
    for (let y = g; y < p.top - 1; y += s) b.box(w + 0.08, 0.22, d + 0.08, stone, { at: [xc, y, zcc], jitter: false });
    // machicolated crown: corbels carrying a projecting battlemented parapet
    const T = p.top;
    corbels(b, [p.a + 0.2, ff], [p.b - 0.2, ff], T - 0.2, 0.45, stone, { pitch: 1.3, h: 0.8 });
    corbels(b, [p.b - 0.2, zb], [p.a + 0.2, zb], T - 0.2, 0.45, stone, { pitch: 1.3, h: 0.8 });
    b.box(w + 0.9, 0.9, 0.45, brick, { at: [xc, T + 0.6, ff + 0.25] });
    b.box(w + 0.9, 0.9, 0.45, brick, { at: [xc, T + 0.6, zb - 0.25] });
    b.box(w, 0.5, d, stoneDark, { at: [xc, T, zcc], jitter: false });
    merlons(b, [p.a - 0.2, ff + 0.25], [p.b + 0.2, ff + 0.25], T + 1.5, brick, { w: 0.85, h: 0.95 });
    merlons(b, [p.a - 0.2, zb - 0.25], [p.b + 0.2, zb - 0.25], T + 1.5, brick, { w: 0.85, h: 0.95 });
    // low hipped roof of coppi behind the parapet
    b.hip(w - 0.4, d - 0.6, 1.6, P.coppi, { at: [xc, T + 0.5, zcc] });

    // front windows: a row of trifore on each upper floor
    const n = 3;
    for (let fl = 0; fl < Math.round((p.top - g) / s); fl++) {
      const y = g + fl * s + 0.55;
      for (const x of spread(n, p.a + 1.6, p.b - 1.6)) {
        bifora(b, [x, y, zb], '-z', 1.6, 2.9, stone);
        if (p.a === x0 && x < TWR.x + TWR.w / 2 + 0.8) continue; // behind the tower
        trifora(b, [x, y, ff], '+z', 2.0, 3.2, stone);
      }
    }
    // ground floor: Sienese arches (doors and shuttered openings), back: small windows
    for (const x of spread(n, p.a + 1.6, p.b - 1.6)) {
      if (p.top === CENTRE_TOP && Math.abs(x - PORTAL_X) < 0.5) continue;
      archWindow(b, 0.8, 1.6, { at: [x, 2.4, zb], facing: '-z', frame: stoneDark, shape: 'round' });
      if (p.a === x0 && x < TWR.x + TWR.w / 2 + 0.8) continue;
      sieneseArch(b, [x, 0, ff], '+z', 1.9, 4.0, stoneDark, P.oakDark);
    }
  }

  // the end walls: windows on the sides
  b.sym((sd) => {
    const ex = sd > 0 ? x1 : x0;
    corbels(b, [ex, zf], [ex, zb], WING_TOP - 0.2, 0.45, stone, { pitch: 1.3, h: 0.8, side: sd > 0 ? 1 : -1 });
    b.box(0.45, 0.9, D + 0.9, brick, { at: [ex + sd * 0.25, WING_TOP + 0.6, zc] });
    merlons(b, [ex + sd * 0.25, zf], [ex + sd * 0.25, zb], WING_TOP + 1.5, brick, { w: 0.85, h: 0.95 });
    for (let fl = 0; fl < 2; fl++) {
      for (const z of spread(2, zb + 2.6, zf - 2.6)) {
        if (sd < 0 && z > zc) continue; // the tower stands against this end
        bifora(b, [ex, g + fl * s + 0.55, z], sd > 0 ? '+x' : '-x', 1.6, 2.9, stone);
      }
    }
    if (sd > 0) sieneseArch(b, [ex, 0, zc], '+x', 1.8, 3.8, stoneDark, P.oakDark);
  });
  // centre block side faces above the wings
  b.sym((sd) => {
    const ex = sd > 0 ? cx1 : cx0;
    corbels(b, [ex, zf + 0.25], [ex, zb], CENTRE_TOP - 0.2, 0.45, stone, { pitch: 1.3, h: 0.8, side: sd > 0 ? 1 : -1 });
    b.box(0.45, 0.9, D + 1.15, brick, { at: [ex + sd * 0.25, CENTRE_TOP + 0.6, zc + 0.12] });
    merlons(b, [ex + sd * 0.25, zf + 0.25], [ex + sd * 0.25, zb], CENTRE_TOP + 1.5, brick, { w: 0.85, h: 0.95 });
  });

  // the main portal: a great Sienese arch, wider than the rest; from 1480 it leads through to the courtyard
  const pz = zf + 0.25;
  sieneseArch(b, [PORTAL_X, 0, pz], '+z', 2.8, 5.0, stoneDark, st >= 1480 ? P.doorBlack : P.oakDark);
  // the commune's shields over the portal, and the black-and-white balzana in stone
  for (const dx of [-1.6, 1.6]) {
    b.box(0.9, 1.1, 0.1, P.white, { at: [PORTAL_X + dx, 5.4 - 0.1, pz + 0.05], jitter: false });
    b.box(0.9, 0.55, 0.12, P.black, { at: [PORTAL_X + dx, 5.4 - 0.1, pz + 0.06], jitter: false });
  }
  // the ringhiera: a raised stone platform along the centre front, from which decrees were read
  b.box(cx1 - cx0 + 3, 1.0, 2.2, stoneDark, { at: [PORTAL_X, 0, pz + 1.1] });
  b.box(cx1 - cx0 + 3, 0.5, 0.25, stone, { at: [PORTAL_X, 1.0, pz + 2.1], jitter: false });
  b.stairs(3.0, 1.0, 1.4, 4, stoneDark, { at: [PORTAL_X, 0, pz + 2.9] });
  b.deck(cx1 - cx0 + 3, 2.2, 1.0, { at: [PORTAL_X, 0, pz + 1.1] });

  // ------------------------------------------------------------ the tower
  const { x: tx, z: tz, w: tw, shaft } = TWR;
  b.group({ at: [tx, 0, tz] }, () => {
    b.box(tw + 0.3, 6, tw + 0.3, stone); // stone base like the palace ground floor
    b.box(tw, shaft - 6, tw, brick, { at: [0, 6, 0] });
    // narrow slit windows up the shaft
    for (const f of ['+z', '-x', '+x', '-z'] as const) {
      const r = facingAngle(f);
      b.group({ rotY: r }, () => {
        for (const y of [10, 17, 24, 30]) b.box(0.35, 1.5, 0.08, P.windowDark, { at: [0, y, tw / 2], jitter: false });
      });
    }
    // stone crown: corbels, projecting battlemented gallery
    const C = shaft;
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.group({ rotY: f }, () => {
        corbels(b, [-tw / 2 + 0.2, tw / 2], [tw / 2 - 0.2, tw / 2], C, 0.55, stone, { pitch: 0.75, h: 1.2 });
      });
    }
    b.box(tw + 1.2, 1.4, tw + 1.2, stone, { at: [0, C + 1.2, 0] });
    merlons(b, [-tw / 2 - 0.4, tw / 2 + 0.4], [tw / 2 + 0.4, tw / 2 + 0.4], C + 2.6, stone, { w: 0.6, h: 0.8, t: 0.3 });
    merlons(b, [-tw / 2 - 0.4, -tw / 2 - 0.4], [tw / 2 + 0.4, -tw / 2 - 0.4], C + 2.6, stone, { w: 0.6, h: 0.8, t: 0.3 });
    merlons(b, [tw / 2 + 0.4, -tw / 2 - 0.4], [tw / 2 + 0.4, tw / 2 + 0.4], C + 2.6, stone, { w: 0.6, h: 0.8, t: 0.3 });
    merlons(b, [-tw / 2 - 0.4, -tw / 2 - 0.4], [-tw / 2 - 0.4, tw / 2 + 0.4], C + 2.6, stone, { w: 0.6, h: 0.8, t: 0.3 });
    // the bell chamber: four piers and arched openings, a bell inside, a stone cusp on top
    const B0 = C + 2.6;
    const bw = tw - 1.2;
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.group({ rotY: f }, () => arcade(b, bw, 4.8, 0.35, stone, { at: [0, B0, bw / 2 - 0.17], openings: 1, openW: bw - 1.1, openH: 3.9, shape: 'round' }));
    }
    b.cyl(0.75, 1.0, P.bronze, { at: [0, B0 + 2.2, 0], rTop: 0.35, segs: 8 });
    b.box(bw + 0.5, 0.4, bw + 0.5, stone, { at: [0, B0 + 4.8, 0], jitter: false });
    b.pyramid(bw + 0.3, bw + 0.3, 3.0, stone, { at: [0, B0 + 5.2, 0] });
    b.cyl(0.06, 1.2, P.iron, { at: [0, B0 + 8.0, 0], segs: 4 });
    // from the later Middle Ages: a clock on the face to the square
    if (st >= 1480) {
      b.panel(2.4, 2.4, P.white, { at: [0, shaft - 5.5, tw / 2], facing: '+z', shape: 'circle', depth: 0.08 });
      b.box(0.12, 0.95, 0.04, P.black, { at: [0, shaft - 4.3, tw / 2 + 0.14], jitter: false });
      // an early public clock has a single hour hand; the minute hand comes with later mechanisms
      if (o.minuteHand ?? st > 1480) b.box(0.7, 0.12, 0.04, P.black, { at: [0.3, shaft - 4.3, tw / 2 + 0.14], jitter: false });
    }
  });

  // ------------------------------------------------------------ the flag of the day on the centre block
  const fy = CENTRE_TOP + 0.5;
  // the town's own colours until united Italy: lords and popes came and went under them, and this
  // stage stands on the main plot until the restoration of 2012, so no one ruler's banner would do
  if (st <= 1480) flag(b, [PORTAL_X, fy, zc], 5, [P.white, P.black], { w: 1.6, h: 1.4 });
  else flag(b, [PORTAL_X, fy, zc], 5, TRICOLORE, { w: 2.1, h: 1.4 });
}

/** Walk colliders for the palace and tower. With `passage` the portal leads through (from 1480). */
export function palaceColliders(b: Builder, passage: boolean): void {
  const { x0, x1, zf, zb } = PAL;
  const zc = (zf + zb) / 2;
  const D = zf - zb + 0.3;
  if (passage) {
    const gl = PORTAL_X - 1.5;
    const gr = PORTAL_X + 1.5;
    b.collider(gl - x0, D, { at: [(x0 + gl) / 2, 0, zc] });
    b.collider(x1 - gr, D, { at: [(gr + x1) / 2, 0, zc] });
  } else b.collider(x1 - x0, D, { at: [(x0 + x1) / 2, 0, zc] });
  b.collider(TWR.w + 0.4, TWR.w + 0.4, { at: [TWR.x, 0, TWR.z] });
}

// ------------------------------------------------------------------ THE LORD'S ADDITIONS (1480 onward)

/** Plan of the Renaissance courtyard behind the old palace. */
export const COURT = { x0: -13, x1: 4, z0: -16, z1: -3 };
/** The lord's new wing, along the left of the courtyard, its twin turrets facing -X. */
export const WING = { x0: -20, x1: -13, z0: -21, z1: -3, h: 14 };
/** Position of the stacked loggias between the twin turrets. */
export const TORRICINI_Z = -12;

/**
 * The lord's additions of about 1480: a square arcaded courtyard on Corinthian columns behind the old
 * palace, with a pilastered upper storey; a back range; and a new wing whose outer front is a stack of
 * three open loggias between two slender round turrets (torricini), modelled on Urbino.
 */
export function lordsCourt(b: Builder, o?: { restored?: boolean }): void {
  const plaster = o?.restored ? tint(P.intonacoCream, 0.02) : P.intonacoCream;
  const brick = P.cotto;
  const grey = P.pietraSerena;
  const stone = P.travertine;
  const { x0, x1, z0, z1 } = COURT;

  // ---- the back range across the courtyard, two storeys
  const BR = { z0: -21, z1: z0 };
  const bw = x1 - x0;
  const bd = BR.z1 - BR.z0;
  b.box(bw + 1, 13.5, bd, brick, { at: [(x0 + x1) / 2 + 0.5, 0, (BR.z0 + BR.z1) / 2] });
  b.box(bw + 1.2, 0.5, bd + 0.2, stone, { at: [(x0 + x1) / 2 + 0.5, 13.5, (BR.z0 + BR.z1) / 2], jitter: false });
  b.hip(bw + 1.6, bd + 0.8, 1.8, P.coppi, { at: [(x0 + x1) / 2 + 0.5, 14, (BR.z0 + BR.z1) / 2] });
  for (const x of spread(5, x0 + 1.8, x1 - 1.4)) {
    rectWindow(b, 1.3, 2.3, { at: [x, 8.2, BR.z0], facing: '-z', frame: stone, cornice: true });
    rectWindow(b, 1.0, 1.4, { at: [x, 3.0, BR.z0], facing: '-z', frame: stone });
  }

  // ---- the courtyard: paving, arcades on four sides
  pave(b, x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, mix(P.cotto, P.paving, 0.55));
  const inset = 2.6;
  const ix0 = x0 + inset;
  const ix1 = x1 - inset;
  const iz0 = z0 + inset;
  const iz1 = z1 - inset;
  const colH = 4.6;
  const nx = 4;
  const nz = 2;
  const cols: XZ[] = [];
  for (const x of spread(nx + 1, ix0, ix1)) {
    cols.push([x, iz0], [x, iz1]);
  }
  for (const z of spread(nz + 1, iz0, iz1).slice(1, -1)) {
    cols.push([ix0, z], [ix1, z]);
  }
  for (const [x, z] of cols) column(b, [x, 0, z], 0.24, colH, grey, { order: 'corinthian' });
  // the arcades: round arches springing from the columns (an arched screen on each side)
  const archH = 1.9;
  const ring = (len: number, n: number, at: V3, facing: Facing) =>
    arcade(b, len, archH + 0.8, 0.45, plaster, { at, facing, openings: n, openW: len / n - 0.45, openH: archH, shape: 'round' });
  ring(ix1 - ix0, nx, [(ix0 + ix1) / 2, colH, iz0], '+z');
  ring(ix1 - ix0, nx, [(ix0 + ix1) / 2, colH, iz1], '+z');
  ring(iz1 - iz0, nz, [ix0, colH, (iz0 + iz1) / 2], '+x');
  ring(iz1 - iz0, nz, [ix1, colH, (iz0 + iz1) / 2], '+x');
  // the frieze with the lord's inscription, and the upper storey with pilasters and windows
  const UH = 4.4;
  const UY = colH + archH + 0.8;
  const upper = (len: number, at: V3, rot: number, n: number) =>
    b.group({ at, rotY: rot }, () => {
      b.box(len + 0.5, 0.55, 0.5, grey, { jitter: false });
      b.box(len + 0.4, 0.3, 0.52, P.white, { at: [0, 0.12, 0], jitter: false }); // inscription band
      b.box(len + 0.5, UH, 0.4, plaster, { at: [0, 0.55, -0.02] });
      for (const x of spread(n + 1, -len / 2, len / 2)) b.box(0.32, UH, 0.12, grey, { at: [x, 0.55, 0.22], jitter: false });
      for (const x of spread(n, -len / 2 + len / n / 2, len / 2 - len / n / 2)) {
        rectWindow(b, 1.1, 1.9, { at: [x, 1.6, 0.2], frame: grey, cornice: true });
      }
      b.box(len + 0.9, 0.35, 0.9, grey, { at: [0, UH + 0.55, 0], jitter: false });
    });
  upper(ix1 - ix0, [(ix0 + ix1) / 2, UY, iz0], 0, nx);
  upper(ix1 - ix0, [(ix0 + ix1) / 2, UY, iz1], Math.PI, nx);
  upper(iz1 - iz0, [ix0, UY, (iz0 + iz1) / 2], Math.PI / 2, nz);
  upper(iz1 - iz0, [ix1, UY, (iz0 + iz1) / 2], -Math.PI / 2, nz);
  // roofs over the four walks, leaning on the outer walls
  const RY = UY + UH + 0.9;
  b.shed(ix1 - ix0 + inset * 2, inset, 1.2, P.coppi, { at: [(ix0 + ix1) / 2, RY, z0 + inset / 2], high: '-z' });
  b.shed(ix1 - ix0 + inset * 2, inset, 1.2, P.coppi, { at: [(ix0 + ix1) / 2, RY, z1 - inset / 2], high: '+z' });
  b.shed(inset, iz1 - iz0, 1.2, P.coppi, { at: [x0 + inset / 2, RY, (iz0 + iz1) / 2], high: '-x' });
  b.shed(inset, iz1 - iz0, 1.2, P.coppi, { at: [x1 - inset / 2, RY, (iz0 + iz1) / 2], high: '+x' });
  // vault ceilings over the walks seen from below: a flat plaster soffit at column-top height
  // (the walks' outer walls: the palace back, the back range, the wing; on the right an arcaded screen)
  // the right-hand side is a screen wall with an open gateway, so the courtyard can be reached from the side
  const gz = (iz0 + iz1) / 2;
  const GW = 2.2;
  b.box(0.5, RY, gz - GW / 2 - z0, plaster, { at: [x1 - 0.25, 0, (z0 + gz - GW / 2) / 2] });
  b.box(0.5, RY, z1 - (gz + GW / 2), plaster, { at: [x1 - 0.25, 0, (gz + GW / 2 + z1) / 2] });
  b.box(0.5, RY - 4.2, GW, plaster, { at: [x1 - 0.25, 4.2, gz] });
  // rusticated grey stone jambs and lintel round the gateway
  for (const s of [-1, 1]) b.box(0.7, 4.2, 0.35, grey, { at: [x1 - 0.2, 0, gz + s * (GW / 2 + 0.17)], jitter: false });
  b.box(0.7, 0.5, GW + 1.0, grey, { at: [x1 - 0.2, 4.2, gz], jitter: false });
  for (const z of spread(4, z0 + 1.5, z1 - 1.5)) if (Math.abs(z - gz) > 2) rectWindow(b, 1.1, 1.8, { at: [x1, 8.2, z], facing: '+x', frame: grey, cornice: true });
  b.box(0.8, 0.4, z1 - z0, grey, { at: [x1 - 0.1, RY, (z0 + z1) / 2], jitter: false });
  // a wellhead in the middle of the court
  b.cyl(0.8, 0.9, P.travertine, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], segs: 8 });
  b.beam([(x0 + x1) / 2 - 0.7, 0.9, (z0 + z1) / 2], [(x0 + x1) / 2 - 0.7, 2.4, (z0 + z1) / 2], 0.12, 0.12, P.iron);
  b.beam([(x0 + x1) / 2 + 0.7, 0.9, (z0 + z1) / 2], [(x0 + x1) / 2 + 0.7, 2.4, (z0 + z1) / 2], 0.12, 0.12, P.iron);
  b.beam([(x0 + x1) / 2 - 0.7, 2.4, (z0 + z1) / 2], [(x0 + x1) / 2 + 0.7, 2.4, (z0 + z1) / 2], 0.12, 0.12, P.iron);

  // ---- the new wing with the twin turrets, along the left of the courtyard
  const W = WING;
  const wx = (W.x0 + W.x1) / 2;
  const wz = (W.z0 + W.z1) / 2;
  b.box(W.x1 - W.x0, W.h, W.z1 - W.z0, brick, { at: [wx, 0, wz] });
  b.box(W.x1 - W.x0 + 0.2, 1.4, W.z1 - W.z0 + 0.2, mix(brick, P.travertine, 0.5), { at: [wx, 0, wz], jitter: false }); // scarp
  b.box(W.x1 - W.x0 + 0.5, 0.5, W.z1 - W.z0 + 0.5, stone, { at: [wx, W.h, wz], jitter: false });
  b.hip(W.x1 - W.x0 + 0.8, W.z1 - W.z0 + 0.8, 2.0, P.coppi, { at: [wx, W.h + 0.5, wz] });
  // windows on the courtyard side and the outer side
  for (const z of spread(5, W.z0 + 2, W.z1 - 2)) {
    for (const y of [2.6, 7.6]) rectWindow(b, 1.3, 2.4, { at: [W.x1, y, z], facing: '+x', frame: stone, cornice: y > 5 });
    if (Math.abs(z - TORRICINI_Z) > 4.4) for (const y of [3.2, 8.2]) rectWindow(b, 1.3, 2.3, { at: [W.x0, y, z], facing: '-x', frame: stone, cornice: true });
  }
  // the stacked loggias: three open arches one above another, set into the outer front
  for (let i = 0; i < 3; i++) {
    const y = 2.5 + i * 4.2;
    b.box(0.3, 3.6, 3.2, P.windowDark, { at: [W.x0 + 0.1, y, TORRICINI_Z], jitter: false });
    arch(b, 3.6, 3.7, stone, { at: [W.x0 - 0.02, y, TORRICINI_Z], facing: '-x', shape: 'round', depth: 0.08 });
    arch(b, 2.9, 3.4, mix(P.windowDark, P.oakDark, 0.4), { at: [W.x0 - 0.06, y, TORRICINI_Z], facing: '-x', shape: 'round', depth: 0.1 });
    b.box(0.6, 0.18, 3.8, stone, { at: [W.x0 - 0.2, y - 0.18, TORRICINI_Z], jitter: false }); // balcony slab
    b.box(0.12, 0.9, 3.4, stone, { at: [W.x0 - 0.45, y, TORRICINI_Z], jitter: false }); // balustrade
  }
  // the two slender round turrets with conical roofs
  const TH = W.h + 7;
  for (const dz of [-3.3, 3.3]) {
    const tz = TORRICINI_Z + dz;
    b.cyl(1.35, TH, brick, { at: [W.x0 - 0.2, 0, tz], segs: 10 });
    b.cyl(1.5, 1.6, mix(brick, P.travertine, 0.5), { at: [W.x0 - 0.2, 0, tz], segs: 10 });
    b.cyl(1.5, 0.35, stone, { at: [W.x0 - 0.2, TH - 0.4, tz], segs: 10 });
    b.cone(1.6, 5.2, P.lead, { at: [W.x0 - 0.2, TH, tz], segs: 10 });
    b.cyl(0.04, 1.2, P.iron, { at: [W.x0 - 0.2, TH + 5.1, tz], segs: 4 });
    for (const y of [5, 10, 15]) b.box(0.08, 1.1, 0.4, P.windowDark, { at: [W.x0 - 1.55, y, tz], jitter: false });
  }
}

/** Walk colliders for the lord's additions; the courtyard and its walks stay walkable. */
export function lordsColliders(b: Builder): void {
  const { x0, x1, z0 } = COURT;
  b.collider(x1 - x0 + 1, 5, { at: [(x0 + x1) / 2 + 0.5, 0, (-21 + z0) / 2] });
  b.collider(WING.x1 - WING.x0 + 0.6, WING.z1 - WING.z0, { at: [(WING.x0 + WING.x1) / 2 - 0.3, 0, (WING.z0 + WING.z1) / 2] });
  for (const dz of [-3.3, 3.3]) b.collider(2.8, 2.8, { at: [WING.x0 - 0.2, 0, TORRICINI_Z + dz] });
  // the right-hand screen wall of the courtyard, with its gateway left open
  const gz = (COURT.z0 + 2.6 + COURT.z1 - 2.6) / 2;
  b.collider(0.6, gz - 1.2 - z0, { at: [x1 - 0.25, 0, (z0 + gz - 1.2) / 2] });
  b.collider(0.6, COURT.z1 - (gz + 1.2), { at: [x1 - 0.25, 0, (gz + 1.2 + COURT.z1) / 2] });
}

// ------------------------------------------------------------------ the monument to the king (1885 onward)

/** The stone well-head in the main square, sunk by the commune about 1210 and never taken away. */
export function squareWell(b: Builder): void {
  b.cyl(1.0, 1.0, P.travertine, { at: [12, 0, 15], segs: 8 });
  b.collider(2, 2, { at: [12, 0, 15] });
}

/** Where the monument stands in the square. */
export const MON: XZ = [-6, 15.5];

/**
 * A bronze equestrian statue of King Victor Emmanuel II on a tall pedestal of polished granite with
 * bronze reliefs, inside a low railing: the standard monument of the 1880s in the towns of united Italy.
 */
export function kingMonument(b: Builder, o?: { railing?: boolean }): void {
  const [x, z] = MON;
  const granite = mix(P.granite, P.marbleRed, 0.25);
  b.group({ at: [x, 0, z] }, () => {
    b.box(5.2, 0.5, 6.2, P.travertine);
    b.box(4.2, 0.5, 5.2, P.travertine, { at: [0, 0.5, 0] });
    b.box(2.8, 3.4, 3.8, granite, { at: [0, 1.0, 0] });
    b.box(3.2, 0.4, 4.2, granite, { at: [0, 4.4, 0] });
    b.box(2.2, 1.2, 0.08, P.bronze, { at: [0, 2.0, 1.92], jitter: false }); // relief panel
    b.box(2.2, 1.2, 0.08, P.bronze, { at: [0, 2.0, -1.92], jitter: false });
    b.box(1.4, 0.4, 0.06, P.gold, { at: [0, 3.5, 1.92], jitter: false }); // dedication
    // the horse, walking, and its rider
    const H = 4.8;
    const bronze = mix(P.bronze, P.copperGreen, 0.25);
    b.box(0.95, 1.0, 2.5, bronze, { at: [0, H + 1.35, 0] });
    for (const [lx, lz, lift] of [[-0.3, 0.95, 0.5], [0.3, 0.95, 0], [-0.3, -0.95, 0], [0.3, -0.95, 0]] as const)
      b.box(0.24, 1.4 - lift, 0.26, bronze, { at: [lx, H + lift, lz] });
    b.beam([0, H + 2.0, 1.1], [0, H + 3.0, 1.75], 0.45, 0.55, bronze); // neck
    b.box(0.42, 0.45, 0.9, bronze, { at: [0, H + 2.85, 1.95] }); // head
    b.beam([0, H + 1.9, -1.25], [0, H + 0.9, -1.55], 0.18, 0.2, bronze); // tail
    b.box(0.6, 0.9, 0.5, bronze, { at: [0, H + 2.35, -0.1] }); // rider
    b.sphere(0.2, bronze, { at: [0, H + 3.45, -0.1], segs: 6 });
    b.box(0.45, 0.12, 0.45, bronze, { at: [0, H + 3.6, -0.1] }); // plumed hat
    b.beam([0.3, H + 3.0, -0.05], [0.65, H + 3.75, 0.45], 0.1, 0.1, bronze); // raised sword arm
    if (o?.railing !== false) {
      for (const [sx, sz, w, d] of [[0, 3.6, 6, 0.06], [0, -3.6, 6, 0.06], [3, 0, 0.06, 7.2], [-3, 0, 0.06, 7.2]] as const) {
        b.box(w, 0.06, d, P.castIron, { at: [sx, 0.9, sz], jitter: false });
      }
      for (const [px, pz] of [[-3, -3.6], [3, -3.6], [-3, 3.6], [3, 3.6], [0, 3.6], [0, -3.6]] as const)
        b.box(0.12, 1.0, 0.12, P.castIron, { at: [px, 0, pz], jitter: false });
    }
  });
  b.collider(o?.railing !== false ? 6.2 : 5.2, o?.railing !== false ? 7.4 : 6.2, { at: [x, 0, z] });
}

/** Height of the rider's head, for feature anchors. */
export const MON_TOP = 8.6;

// ------------------------------------------------------------------ small things

/** An oval hut on a post frame: wattle-and-daub wall, thatched roof, crossed ridge logs, a porch. */
export function hut(b: Builder, at: V3, rx: number, rz: number, wallH: number, roofH: number, o?: { rotY?: number; porch?: boolean }): void {
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.group({ scale: [rx, 1, rz] }, () => {
      b.cyl(1, wallH, P.daub, { segs: 10 });
      b.lathe([[1.25, wallH - 0.25], [0.95, wallH + roofH * 0.45], [0.35, wallH + roofH * 0.9], [0.01, wallH + roofH]], P.thatch, { segs: 10 });
    });
    // ridge pole and the crossed timbers that the hut urns show on the roof
    const ry = wallH + roofH;
    b.beam([0, ry - 0.1, -rz * 0.5], [0, ry - 0.1, rz * 0.5], 0.18, 0.18, P.oakDark);
    for (const s of [-1, 1]) {
      for (const k of [-0.42, 0, 0.42]) {
        b.beam([-0.55, ry + 0.45, s * rz * k], [0.55, ry - 0.35, s * rz * k], 0.1, 0.1, P.oakDark);
        b.beam([0.55, ry + 0.45, s * rz * k], [-0.55, ry - 0.35, s * rz * k], 0.1, 0.1, P.oakDark);
      }
    }
    // doorway and porch on the +Z end
    b.box(0.95, 1.7, 0.2, P.oakDark, { at: [0, 0, rz - 0.02], jitter: false });
    if (o?.porch !== false) {
      b.box(2.2, 0.12, 1.4, P.thatch, { at: [0, 2.0, rz + 0.55], rot: [0.25, 0, 0] });
      for (const sx of [-1, 1]) b.cyl(0.08, 2.0, P.oak, { at: [sx * 0.95, 0, rz + 1.1], segs: 5 });
    }
  });
}

// ------------------------------------------------------------------ the Roman forum (150 BC to AD 550, ruins to 1000)

/**
 * The basilica site across the back of the forum. The Republican hall (150 BC) and the Imperial one
 * (AD 100) stand on the same line; the Lombard hall of 600 is built inside the Imperial ruin.
 */
export const BAS = { x0: -16, x1: 13, z0: -21, z1: -9, nave: 7, apseR: 3.5 };
export const BAS_ZC = (BAS.z0 + BAS.z1) / 2;
/** The triumphal arch at the forum entrance (AD 100), which the Lombards turn into a tower. */
export const ARCH = { x: 0, z: 19.4, w: 8.4, d: 3.2, h: 9.4, passW: 4.0, passH: 7.0 };

/**
 * A single-bay triumphal arch: piers framed by engaged Corinthian columns on each face, relief
 * panels, an entablature and a tall attic carrying the dedication. `stump` leaves only the arch
 * itself, stripped of its columns and attic, for the tower of 600 to stand on.
 */
export function triumphalArch(b: Builder, color: number, o?: { stump?: boolean }): void {
  const { x, z, w, d, h, passW, passH } = ARCH;
  b.group({ at: [x, 0, z] }, () => {
    b.box(w + 0.4, 0.5, d + 0.4, tint(color, -0.05)); // plinth
    arcade(b, w, h, d, color, { at: [0, 0.5, 0], openings: 1, openW: passW, openH: passH, shape: 'round', n: 3 });
    if (o?.stump) return;
    for (const s of [-1, 1]) {
      // engaged columns on pedestals, two each side of the passage, both faces
      for (const px of [passW / 2 + 0.6, w / 2 - 0.45]) {
        b.box(0.9, 1.6, 0.5, color, { at: [s * px, 0.5, d / 2 + 0.2], jitter: false });
        b.box(0.9, 1.6, 0.5, color, { at: [s * px, 0.5, -d / 2 - 0.2], jitter: false });
        column(b, [s * px, 2.1, d / 2 + 0.2], 0.34, h - 1.6, color, { order: 'corinthian' });
        column(b, [s * px, 2.1, -d / 2 - 0.2], 0.34, h - 1.6, color, { order: 'corinthian' });
      }
      // relief panels between the columns, on both faces
      for (const f of [1, -1]) b.box(1.3, 2.0, 0.08, tint(color, -0.1), { at: [s * (w / 2 - 1.45), 4.6, f * (d / 2 + 0.02)], jitter: false });
      for (const f of [1, -1]) b.box(1.3, 1.4, 0.08, tint(color, -0.1), { at: [s * (w / 2 - 1.45), 2.4, f * (d / 2 + 0.02)], jitter: false });
    }
    // entablature breaking forward over the columns, then the attic with its inscription
    b.box(w + 0.9, 1.1, d + 1.0, color, { at: [0, h + 0.5, 0] });
    b.box(w + 1.2, 0.3, d + 1.3, tint(color, 0.03), { at: [0, h + 1.6, 0], jitter: false });
    b.box(w - 0.2, 3.0, d - 0.2, color, { at: [0, h + 1.9, 0] });
    b.box(w - 0.1, 0.3, d - 0.1, tint(color, 0.03), { at: [0, h + 4.9, 0], jitter: false });
    for (const f of [1, -1]) {
      b.box(w - 2.6, 1.9, 0.08, tint(color, -0.06), { at: [0, h + 2.4, f * (d / 2 - 0.08)], jitter: false });
      for (const ly of [h + 3.6, h + 3.1, h + 2.6]) b.box(w - 3.4, 0.14, 0.04, P.bronze, { at: [0, ly, f * (d / 2 - 0.02)], jitter: false });
    }
    // a gilded bronze four-horse chariot group is too fine for this scale: a statue base stands for it
    b.box(3.2, 0.7, 1.6, tint(color, -0.04), { at: [0, h + 5.2, 0] });
  });
}
/** Height of the arch's attic top. */
export const ARCH_TOP = ARCH.h + 5.2;

/** Heights of the forum basilica: built about 150 BC, refaced in marble about AD 100, a ruin by 600. */
export const BAS_H = { podium: 0.5, nave: 10.2, aisle: 6.2 };

/** The basilica's podium of travertine, which outlasts the hall: the Lombard hall and the bishop's palace stand on it. */
export function basilicaPodium(b: Builder): void {
  const { x0, x1, z0, z1 } = BAS;
  b.box(x1 - x0 + 0.6, BAS_H.podium, z1 - z0 + 0.6, P.travertine, { at: [(x0 + x1) / 2, 0, BAS_ZC] });
}

/** The basilica's apse wall (AD 100): a half-round of brick-faced concrete, left standing when the roof has gone. */
export function apseWall(b: Builder): void {
  const { x0, apseR } = BAS;
  b.lathe([[apseR, 0], [apseR, BAS_H.nave - 2.5]], tint(P.romanTile, 0.04), { at: [x0, BAS_H.podium, BAS_ZC], segs: 9, start: Math.PI, sweep: Math.PI });
}

/** One of the Corinthian marble columns of the imperial basilica's front colonnade (i = 0..9 from the left). */
export function basilicaColumn(b: Builder, i: number): void {
  const { x0, x1, z1 } = BAS;
  const x = spread(10, x0 + 0.5, x1 - 0.5)[i];
  column(b, [x, BAS_H.podium, z1 - 0.4], 0.34, BAS_H.aisle - BAS_H.podium, P.marble, { order: 'corinthian' });
}

/** Where the imperial porticoes' Corinthian columns stand along each side of the square (x = ±12.6). */
export const PORTICO_Z = spread(9, -8 + 0.6, 17.6 - 0.6);
export function porticoColumn(b: Builder, s: number, i: number): void {
  column(b, [s * 12.6, 0, PORTICO_Z[i]], 0.3, 4.8, P.marble, { order: 'corinthian' });
}

/**
 * The forum basilica: a tall nave lit by a clerestory, a walled back aisle and a front aisle open to
 * the square as a colonnade. About AD 100 the same hall is faced in marble (`imperial`): its stucco
 * walls take a marble skin, its Ionic columns give way to Corinthian ones, its doors are cast in
 * bronze and an apse for the tribunal is built against its left end.
 */
export function forumBasilica(b: Builder, imperial: boolean): void {
  const { x0, x1, z0, z1, nave, apseR } = BAS;
  const { podium: PH, nave: NH, aisle: AH } = BAS_H;
  const L = x1 - x0;
  const xc = (x0 + x1) / 2;
  const aisle = (z1 - z0 - nave) / 2;
  const wall = imperial ? P.marble : P.stucco;
  const tr = P.travertine;
  const tile = P.romanTile;
  basilicaPodium(b);
  b.box(L, NH, nave, wall, { at: [xc, PH, BAS_ZC] });
  b.gable(L + 0.4, nave + 0.4, 1.7, tile, { at: [xc, NH + PH, BAS_ZC], overhang: 0.3, wall });
  // back aisle: walled; front aisle: an open colonnade onto the forum
  b.box(L, AH, aisle, tint(wall, -0.03), { at: [xc, PH, z0 + aisle / 2] });
  b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + PH, z0 + aisle / 2 - 0.2], high: '+z' });
  b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + PH, z1 - aisle / 2 + 0.2], high: '-z' });
  b.box(L, 0.5, 0.8, wall, { at: [xc, AH, z1 - 0.4] });
  b.sym((s) => b.box(0.5, AH, aisle, wall, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, PH, z1 - aisle / 2] }));
  // clerestory windows on both sides of the nave, small windows in the back aisle
  for (const x of spread(9, x0 + 1.5, x1 - 1.5)) {
    for (const s of [1, -1]) archWindow(b, 1.0, 1.7, { at: [x, AH + 1.8, BAS_ZC + (s * nave) / 2], facing: s > 0 ? '+z' : '-z', frame: tr });
    archWindow(b, 0.8, 1.2, { at: [x, 2.6, z0], facing: '-z', frame: tr });
  }
  // the right end wall: a door and a gable window
  b.panel(2, 3.6, P.oakDark, { at: [x1, PH, BAS_ZC], facing: '+x' });
  archWindow(b, 1.1, 1.8, { at: [x1, NH - 1.6, BAS_ZC], facing: '+x', frame: tr });
  if (!imperial) {
    for (const x of spread(10, x0 + 0.5, x1 - 0.5)) column(b, [x, PH, z1 - 0.4], 0.32, AH - PH, wall, { order: 'ionic' });
    // doors into the hall behind the colonnade; a door and a gable window in the left end as well
    for (const x of spread(3, x0 + 6, x1 - 6)) b.panel(1.8, 3.4, P.oakDark, { at: [x, PH, BAS_ZC + nave / 2], facing: '+z' });
    b.panel(2, 3.6, P.oakDark, { at: [x0, PH, BAS_ZC], facing: '-x' });
    archWindow(b, 1.1, 1.8, { at: [x0, NH - 1.6, BAS_ZC], facing: '-x', frame: tr });
    return;
  }
  for (let i = 0; i < 10; i++) basilicaColumn(b, i);
  b.box(L - 2, 0.3, 0.05, P.bronze, { at: [xc, AH + 0.1, z1 + 0.03], jitter: false }); // bronze-lettered dedication
  for (const x of spread(3, x0 + 6, x1 - 6)) b.panel(2, 3.8, P.bronze, { at: [x, PH, BAS_ZC + nave / 2], facing: '+z' });
  // the apse at the left end: a half-round of brick-faced concrete under a half-dome of tiles
  apseWall(b);
  b.lathe([[apseR + 0.3, NH - 2.6], [apseR * 0.75, NH - 1.2], [0.01, NH - 0.4]], tile, { at: [x0, PH, BAS_ZC], segs: 9, start: Math.PI, sweep: Math.PI });
  for (const a of [Math.PI * 0.65, Math.PI, Math.PI * 1.35]) {
    archWindow(b, 1.0, 1.9, { at: [x0 + Math.sin(a) * apseR, 4.4, BAS_ZC + Math.cos(a) * apseR], facing: a, frame: tr });
  }
}

/** The council house (curia) on the left side of the forum, beside the basilica; its front faces +X. */
export const CUR = { x: -15.5, z: -1 };

/**
 * The curia, where the town council (the decurions) met: a tall plain hall on a podium, its gable end
 * to the square, a bronze door at the head of a flight of steps. Built in tufa and stucco about 150 BC;
 * about AD 100 the same hall is faced in marble, with a pediment, half-columns and an inscription
 * ('empire'); about 600 it is stripped, re-roofed and given a bell-cote as the lord's chapel ('chapel'),
 * as the Senate house in Rome became the church of Sant'Adriano in the 630s.
 */
export function curia(b: Builder, phase: 'republic' | 'empire' | 'chapel'): void {
  const { x: CX, z: CZ } = CUR;
  const empire = phase === 'empire';
  const wall = empire ? P.marble : phase === 'chapel' ? mix(P.romanTile, P.rubble, 0.5) : P.stucco;
  const base = empire ? tint(P.marble, -0.04) : phase === 'chapel' ? tint(P.tufa, -0.08) : P.tufa;
  const tr = P.travertine;
  const fx = CX + 3; // the front wall
  b.box(6.6, 1.4, 9, base, { at: [CX, 0, CZ] });
  b.box(6, 7, 8.4, wall, { at: [CX, 1.4, CZ] });
  b.gable(6.4, 8.8, 1.5, P.romanTile, { at: [CX, 8.4, CZ], overhang: 0.3, wall });
  b.panel(2.2, 3.6, phase === 'chapel' ? P.oakDark : P.bronze, { at: [fx, 1.4, CZ], facing: '+x' });
  for (const z of [CZ - 2.8, CZ + 2.8]) archWindow(b, 1.0, 1.6, { at: [fx, 5.6, z], facing: '+x', frame: tr });
  for (const z of [CZ - 2, CZ + 2]) archWindow(b, 1.0, 1.6, { at: [CX - 3, 5, z], facing: '-x', frame: tr });
  for (const x of [CX - 1.5, CX + 1.5]) for (const s of [1, -1]) archWindow(b, 1.0, 1.8, { at: [x, 5.4, CZ + s * 4.2], facing: s > 0 ? '+z' : '-z', frame: tr });
  b.stairs(3, 1.4, 1.6, 4, base, { at: [CX + 4.1, 0, CZ], rotY: -Math.PI / 2 });
  if (empire) {
    // marble half-columns either side of the door, a cornice round the eaves, a pediment on the front
    for (const z of [CZ - 1.9, CZ + 1.9, CZ - 4.0, CZ + 4.0]) column(b, [fx + 0.1, 1.4, z], 0.26, 7, P.marble, { order: 'corinthian' });
    for (const s of [1, -1]) b.box(6.6, 0.4, 0.5, P.marble, { at: [CX, 8.1, CZ + s * 4.35], jitter: false });
    for (const s of [1, -1]) b.beam([fx + 0.35, 8.4, CZ + s * 4.6], [fx + 0.35, 10.0, CZ], 0.35, 0.4, P.marble, { jitter: false });
    b.box(0.5, 0.4, 9.2, P.marble, { at: [fx + 0.3, 8.1, CZ], jitter: false });
    b.box(0.05, 0.35, 3.0, P.bronze, { at: [fx + 0.03, 5.4, CZ], jitter: false }); // bronze-lettered dedication
  } else if (phase === 'chapel') {
    // a bell-cote on the front gable and a cross
    b.box(0.4, 1.4, 1.0, wall, { at: [fx + 0.1, 9.6, CZ] });
    b.cyl(0.2, 0.35, P.bronze, { at: [fx + 0.35, 10.1, CZ], rTop: 0.1, segs: 6 });
    b.box(0.08, 0.7, 0.08, P.iron, { at: [fx + 0.1, 11.0, CZ], jitter: false });
    b.box(0.08, 0.08, 0.45, P.iron, { at: [fx + 0.1, 11.45, CZ], jitter: false });
  }
  b.collider(6.6, 9, { at: [CX, 0, CZ] });
}

/** Two honorific statues on travertine bases in the forum (150 BC); the bronze goes, the bases stay. */
export function forumStatues(b: Builder, bronze = true): void {
  for (const [x, z] of [[-2, 9], [4, 9]] as const) {
    b.box(1.2, 1.9, 1.6, P.travertine, { at: [x, 0, z] });
    if (!bronze) continue;
    b.box(0.5, 1.5, 0.4, P.bronze, { at: [x, 1.9, z] });
    b.sphere(0.2, P.bronze, { at: [x, 3.6, z], segs: 6 });
  }
}

/** The forum's well-head, still drawn from by the Lombards and the bishop's household. */
export function forumWell(b: Builder): void {
  b.cyl(0.7, 0.9, P.travertine, { at: [3, 0, 1], segs: 8 });
}

/** The marble pedestal of the emperor's bronze horseman (AD 100), standing bare after the bronze is melted down. */
export function equestrianPedestal(b: Builder): void {
  b.group({ at: [0, 0, 3] }, () => {
    b.box(2.6, 0.4, 4.0, P.marble);
    b.box(2.0, 2.6, 3.4, P.marble, { at: [0, 0.4, 0] });
    b.box(2.3, 0.3, 3.7, P.marble, { at: [0, 3.0, 0], jitter: false });
  });
}
