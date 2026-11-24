import * as THREE from 'three';
import { P, facingAngle, mix, spread, tint, type Builder, type Facing, type Opts } from '@ah/kit';

/*
 * Local helpers for the French pouvoir lineage, and THE COMMUNE'S BUILDINGS that every stage from
 * 1260 keeps: the belfry of 1260 and the town hall built on to it in 1510.
 *
 * Plan of the plot from 1260 (front, +Z, faces the main square):
 *   belfry        x -19.5..-12.5, z -16..-9 (behind the left half of the hall)
 *   market hall   x -20.5..-3.5,  z -9..1     (1260 only; replaced in 1510)
 *   town hall     x -21.5..-1.5,  z -9..5     (from 1510; arcade on the square, z 1.6..5)
 *   Deco wing     x -12.5..-2,    z -21..-9   (from 1928, behind the hall)
 *   zone C        x 0.5..21.5,    z -21..6    where each later age builds beside the old hall
 *   the square    z 5..22 in front
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
export function wallSeg(b: Builder, p: XZ, q: XZ, w: number, h: number, color: number, y = 0, o?: Opts): void {
  const dx = q[0] - p[0];
  const dz = q[1] - p[1];
  const L = Math.hypot(dx, dz);
  b.box(L, h, w, color, { ...o, at: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], rotY: Math.atan2(-dz, dx) });
}

/** One walk collider per segment of a polyline; `skip` lists segment indices left open. */
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

/** A collider from the corners of a rectangle. */
export function rectCollider(b: Builder, x0: number, x1: number, z0: number, z1: number): void {
  b.collider(x1 - x0, z1 - z0, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
}

/** A flat area of paving (or grass) at ground level. */
export function pave(b: Builder, x0: number, x1: number, z0: number, z1: number, color: number, y = 0, h = 0.06): void {
  b.box(x1 - x0, h, z1 - z0, color, { at: [(x0 + x1) / 2, y, (z0 + z1) / 2], jitter: false });
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
      const x = a - (2 * a * i) / (n * 2);
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

/** A flat arched face (no thickness, a handful of triangles) lying `off` in front of a wall. */
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

/** A cheap window: a stone frame, dark glazing, and optional mullion and transom bars. */
export function win(
  b: Builder,
  w: number,
  h: number,
  o: { at: V3; facing?: Facing; shape?: Shape; frame?: number; glass?: number; border?: number; mullion?: boolean; transom?: number; mat?: 'matte' | 'glass' },
): void {
  const frame = o.frame ?? P.pierreBlonde;
  const bd = o.border ?? Math.min(0.16, w * 0.12);
  const shape = o.shape ?? 'rect';
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    flatArch(b, w, h, frame, { shape, off: 0.04 });
    flatArch(b, w - bd * 2, h - bd * 2, o.glass ?? P.windowDark, { at: [0, bd, 0], shape, off: 0.07, mat: o.mat });
    if (o.mullion) b.box(0.12, h - bd * 2 - (shape === 'rect' ? 0 : w * 0.3), 0.06, frame, { at: [0, bd, 0.09], jitter: false });
    if (o.transom) b.box(w - bd * 2, 0.12, 0.06, frame, { at: [0, o.transom, 0.09], jitter: false });
  });
}

/**
 * A wall pierced by a row of arched openings down to the ground (one extrusion): arcades, open
 * market halls, bell chambers.
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
  b.group({ at: o.at ?? [0, 0, 0], rotY: facingAngle(o.facing) }, () => b.extrude(pts, t, color, { jitter: false }));
}

/**
 * A band of corbels (brackets) along a wall face from p to q at height y, standing out `out`, drawn as
 * their sloping undersides and fronts only.
 */
export function corbels(b: Builder, p: XZ, q: XZ, y: number, out: number, color: number, o?: { pitch?: number; h?: number; side?: 1 | -1; t?: number }): void {
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
    const V = (s: number, d: number, yy: number) => [cx + ux * s * t + nx * d, yy, cz + uz * s * t + nz * d];
    quad(out3, V(-1, 0, y), V(1, 0, y), V(1, out, y + h * 0.7), V(-1, out, y + h * 0.7));
    quad(out3, V(-1, out, y + h * 0.7), V(1, out, y + h * 0.7), V(1, out, y + h), V(-1, out, y + h));
  }
  soup(b, out3, color, { jitter: false });
}

/** A cheap classical column: square base, tapering open shaft, flared capital and abacus. */
export function column(b: Builder, at: V3, r: number, h: number, color: number, o?: { order?: 'doric' | 'ionic' | 'corinthian'; segs?: number; base?: boolean }): void {
  const segs = o?.segs ?? 8;
  const order = o?.order ?? 'doric';
  const baseH = o?.base === false ? 0 : h * 0.04;
  const capH = order === 'corinthian' ? h * 0.12 : h * 0.07;
  const sh = h - baseH - capH;
  const shaft = new THREE.CylinderGeometry(r * 0.84, r, sh, segs, 1, true);
  shaft.translate(0, sh / 2 + baseH, 0);
  b.add(shaft, color, { at, jitter: false });
  if (baseH) b.box(r * 2.5, baseH, r * 2.5, color, { at, jitter: false });
  const cap = new THREE.CylinderGeometry(order === 'corinthian' ? r * 1.4 : r * 1.25, r * 0.84, capH * 0.7, segs, 1, true);
  cap.translate(0, h - capH + (capH * 0.7) / 2, 0);
  b.add(cap, color, { at, jitter: false });
  b.box(r * (order === 'ionic' ? 3.2 : 2.8), capH * 0.3, r * 2.8, color, { at: [at[0], at[1] + h - capH * 0.3, at[2]], jitter: false });
}

/** A flat pilaster strip with a little capital, standing on a wall face (local +Z is out). */
export function pilaster(b: Builder, at: V3, facing: Facing, w: number, h: number, color: number, d = 0.18): void {
  b.group({ at, rotY: facingAngle(facing) }, () => {
    b.box(w, h - 0.35, d, color, { at: [0, 0, d / 2], jitter: false });
    b.box(w + 0.2, 0.35, d + 0.1, color, { at: [0, h - 0.35, (d + 0.1) / 2], jitter: false });
  });
}

/** A low-poly flag on a pole: `stripes` are colours hung vertically (the tricolour) or one colour. */
export function flag(b: Builder, at: V3, pole: number, stripes: number[], o?: { w?: number; h?: number; rotY?: number }): void {
  const w = o?.w ?? 1.8;
  const h = o?.h ?? 1.2;
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.cyl(0.05, pole, P.iron, { segs: 4 });
    const sw = w / stripes.length;
    stripes.forEach((c, i) => b.box(sw, h, 0.04, c, { at: [0.06 + sw * (i + 0.5), pole - h - 0.1, 0], jitter: false }));
  });
}

/** Blue, white and red, hoist first. */
export const TRICOLOUR = [0x2a4f8f, P.white, 0xc23b2e];

/** A small standing figure in stone or bronze, `h` tall, on `at` (a saint in a niche, a statue). */
export function statue(b: Builder, at: V3, h: number, color: number, o?: { rotY?: number; arm?: boolean }): void {
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.cyl(h * 0.13, h * 0.8, color, { rTop: h * 0.09, segs: 6, jitter: false });
    b.box(h * 0.13, h * 0.14, h * 0.13, color, { at: [0, h * 0.8, 0], jitter: false });
    if (o?.arm) b.beam([h * 0.1, h * 0.7, 0], [h * 0.3, h * 0.95, h * 0.12], h * 0.06, h * 0.06, color);
  });
}

/** A simple low-poly tree in a hard-standing square. */
export function squareTree(b: Builder, x: number, z: number, h: number, kind: 'round' | 'poplar' = 'round'): void {
  b.tree(h, { kind, at: [x, 0, z] });
}

// ------------------------------------------------------------------ THE COMMUNE'S BUILDINGS (1260 onward)

/** The belfry: a 7 m square tower behind the left half of the hall. */
export const BEL = { x: -16, z: -12.5, w: 7, shaft: 30 };
/** Top of the gallery parapet, base of the bell chamber. */
export const BEL_GALLERY = BEL.shaft + 1.4;
/** Top of the bell chamber walls. */
export const BEL_CHAMBER = BEL_GALLERY + 5.4;
/** Tip of the spire. */
export const BEL_TOP = BEL_CHAMBER + 10.5;

/** The market hall with the aldermen's room over it (1260 only). */
export const HALLE = { x0: -20.5, x1: -3.5, z0: -9, z1: 1, g: 4.6, u: 4.6 };

/** The town hall of 1510: arcade storey g, great hall storey u, arcade walk from zin to z1. */
export const HALL = { x0: -21.5, x1: -1.5, z0: -9, z1: 5, zin: 1.6, g: 5.6, u: 6.6 };
export const EAVES = HALL.g + HALL.u;
export const HALL_RISE = 10;
export const BAYS = spread(5, HALL.x0 + 2, HALL.x1 - 2);
/** x of the buttresses between and at the ends of the bays. */
export const BUTTS = spread(6, HALL.x0 + 0.3, HALL.x1 - 0.3);

/** The council chamber wing of 1928, behind the hall. */
export const WING = { x0: -12.5, x1: -2, z0: -21, z1: -9, h: 11 };

/** The part of the plot each later age builds on beside the old hall. */
export const ZC = { x0: 0.5, x1: 21.5 };

/** The stages at which the commune's buildings are shown. */
export type Stage = 1260 | 1510 | 1760 | 1835 | 1928 | 1970 | 2012;

/** Stone colour of the belfry and hall at a given stage: fresh, weathered, or rebuilt clean. */
export function civicStone(st: Stage): number {
  if (st >= 1928) return mix(P.pierreBlonde, P.craie, 0.45);
  if (st >= 1760) return mix(P.pierreBlonde, P.concreteDark, 0.22);
  return P.pierreBlonde;
}

function roofSlate(st: Stage): number {
  return st >= 1928 ? tint(P.ardoise, 0.05) : st >= 1760 ? tint(P.ardoise, -0.03) : P.ardoise;
}

/** A clock dial on a wall facing +Z at (x, y, z): one hour hand, and a minute hand too once clocks had them. */
function clock(b: Builder, x: number, y: number, z: number, d: number, frame: number, minutes = true): void {
  b.panel(d + 0.4, d + 0.4, frame, { at: [x, y - 0.2, z], facing: '+z', shape: 'circle', depth: 0.08 });
  b.panel(d, d, P.ardoise, { at: [x, y, z], facing: '+z', shape: 'circle', depth: 0.12 });
  b.panel(d - 0.35, d - 0.35, P.gold, { at: [x, y + 0.175, z], facing: '+z', shape: 'circle', depth: 0.13 });
  b.panel(d - 0.6, d - 0.6, P.ardoise, { at: [x, y + 0.3, z], facing: '+z', shape: 'circle', depth: 0.14 });
  b.box(0.12, d * 0.42, 0.04, P.gold, { at: [x, y + d / 2, z + 0.18], jitter: false });
  if (minutes) b.box(d * 0.32, 0.12, 0.04, P.gold, { at: [x + d * 0.16, y + d / 2, z + 0.18], jitter: false });
}

/**
 * The belfry of 1260: a square stone tower with clasping buttresses, a crenellated watch gallery, a
 * bell chamber with louvred openings and a steep slate spire. From 1510 it has four corner turrets
 * and a clock on its face to the square; in 1928 it is rebuilt as it was.
 */
export function belfry(b: Builder, st: Stage): void {
  const stone = civicStone(st);
  const dark = tint(stone, -0.08);
  const slate = roofSlate(st);
  const { x, z, w, shaft } = BEL;
  const h = w / 2;
  b.group({ at: [x, 0, z] }, () => {
    b.box(w + 0.6, 1.2, w + 0.6, dark);
    b.box(w, shaft, w, stone);
    // clasping buttresses at the corners, stepping back twice
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.box(1.5, 12, 1.5, stone, { at: [sx * (h - 0.35), 0, sz * (h - 0.35)] });
        b.box(1.2, 9, 1.2, stone, { at: [sx * (h - 0.25), 12, sz * (h - 0.25)] });
        b.box(0.9, 6, 0.9, stone, { at: [sx * (h - 0.15), 21, sz * (h - 0.15)] });
      }
    // string courses
    for (const y of [12, 21]) b.box(w + 0.16, 0.25, w + 0.16, dark, { at: [0, y, 0], jitter: false });
    // narrow lancets lighting the stair and the strongroom where the charter was kept
    for (const f of ['+z', '-z', '+x', '-x'] as const) {
      b.group({ rotY: facingAngle(f) }, () => {
        for (const y of [8, 15, 23]) flatArch(b, 0.5, 1.9, P.windowDark, { at: [0, y, h], shape: 'pointed', off: 0.04 });
        if (f === '-z') flatArch(b, 1.4, 2.9, P.oakDark, { at: [0, 1.2, h], shape: 'pointed', off: 0.05 });
      });
    }
    // the watch gallery: a corbel table under a crenellated parapet
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2])
      b.group({ rotY: f }, () => corbels(b, [-h + 0.3, h], [h - 0.3, h], shaft - 0.9, 0.5, dark, { pitch: 0.7, h: 0.9 }));
    b.box(w + 1.0, 0.5, w + 1.0, dark, { at: [0, shaft, 0] });
    b.crenel(w + 1.0, w + 1.0, stone, { at: [0, shaft + 0.5, 0], merlonW: 0.6, merlonH: 0.9, t: 0.35 });
    // the bell chamber, set back inside the gallery, with tall louvred openings
    const cw = w - 1.6;
    const ch = cw / 2;
    for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      b.group({ rotY: f }, () => {
        arcade(b, cw, 5.4, 0.45, stone, { at: [0, BEL_GALLERY - 0.9, ch - 0.22], openings: 2, openW: 1.5, openH: 4.0, shape: 'pointed' });
        for (const sx of [-cw / 4, cw / 4]) {
          // abat-sons: sloping louvre boards that throw the sound of the bells down into the town
          for (const y of [1.3, 2.6]) b.box(1.45, 0.1, 0.5, P.oakDark, { at: [sx, BEL_GALLERY - 0.9 + y, ch - 0.3], rot: [0.5, 0, 0], jitter: false });
        }
      });
    }
    b.box(cw - 0.8, 5.2, cw - 0.8, P.windowDark, { at: [0, BEL_GALLERY - 0.9, 0], jitter: false });
    b.cyl(0.9, 1.3, P.bronze, { at: [0, BEL_GALLERY + 0.9, 0], rTop: 0.45, segs: 8 });
    b.box(cw + 0.3, 0.35, cw + 0.3, dark, { at: [0, BEL_CHAMBER - 0.9, 0], jitter: false });
    // the steep slate spire, eight-sided over the square chamber, with a gilt vane
    b.pyramid(cw + 0.6, cw + 0.6, 2.2, slate, { at: [0, BEL_CHAMBER - 0.55, 0] });
    b.cone((cw - 0.6) / 2, BEL_TOP - BEL_CHAMBER - 1.2, slate, { at: [0, BEL_CHAMBER + 0.9, 0], segs: 8 });
    b.cyl(0.05, 1.8, P.iron, { at: [0, BEL_TOP - 0.6, 0], segs: 4 });
    b.extrude([[0, 0], [1.0, 0.1], [0.8, 0.45], [0, 0.4]], 0.06, P.gold, { at: [0, BEL_TOP + 0.6, 0], jitter: false });
    if (st >= 1510) {
      // late Gothic additions: corner turrets (échauguettes) on corbelled bases, lucarnes in the spire
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const at: V3 = [sx * (h + 0.1), shaft - 1.8, sz * (h + 0.1)];
          b.cone(0.85, 1.8, stone, { at: [at[0], at[1] + 1.8, at[2]], rot: [Math.PI, 0, 0], segs: 8 });
          b.cyl(0.85, 3.4, stone, { at: [at[0], at[1] + 1.8, at[2]], segs: 8 });
          b.cone(1.0, 3.0, slate, { at: [at[0], at[1] + 5.2, at[2]], segs: 8 });
          b.cyl(0.04, 0.8, P.iron, { at: [at[0], at[1] + 8.1, at[2]], segs: 3 });
        }
      for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2])
        b.group({ rotY: f }, () => {
          b.box(0.9, 1.3, 1.6, slate, { at: [0, BEL_CHAMBER + 2.3, 1.5] });
          b.panel(0.6, 0.9, P.windowDark, { at: [0, BEL_CHAMBER + 2.45, 2.3] });
          b.gable(0.9, 1.6, 0.6, slate, { at: [0, BEL_CHAMBER + 3.6, 1.5], ridge: 'z' });
        });
      // the town clock on the face to the square: a single hour hand until the eighteenth century
      clock(b, 0, 25.2, h, 2.6, dark, st >= 1760);
    }
  });
  if (st >= 1835) flag(b, [x + 0.9, BEL_GALLERY - 0.9, z + 0.9], 4.5, TRICOLOUR, { w: 1.8, h: 1.2 });
}

/** Walk colliders for the belfry. */
export function belfryColliders(b: Builder): void {
  b.collider(BEL.w + 0.7, BEL.w + 0.7, { at: [BEL.x, 0, BEL.z] });
}

/**
 * The market hall of 1260 against the belfry: an open ground floor of pointed arches for the cloth
 * and grain markets, and over it the aldermen's room (chambre échevinale), lit by paired lancets,
 * reached by an outside stair, under a steep tiled roof.
 */
export function marketHall(b: Builder): void {
  const { x0, x1, z0, z1, g, u } = HALLE;
  const W = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const stone = P.pierreBlonde;
  const dark = tint(stone, -0.08);
  // open arcades on the three free sides; the back is the belfry and a wall
  arcade(b, W, g, 0.8, stone, { at: [xc, 0, z1 - 0.4], openings: 5, openW: 2.4, openH: 3.7, shape: 'pointed' });
  arcade(b, D, g, 0.8, stone, { at: [x0 + 0.4, 0, zc], facing: '-x', openings: 3, openW: 2.2, openH: 3.7, shape: 'pointed' });
  arcade(b, D, g, 0.8, stone, { at: [x1 - 0.4, 0, zc], facing: '+x', openings: 3, openW: 2.2, openH: 3.7, shape: 'pointed' });
  b.box(W, g, 0.8, stone, { at: [xc, 0, z0 + 0.4] });
  pave(b, x0 + 0.8, x1 - 0.8, z0 + 0.8, z1 - 0.8, mix(P.paving, P.earth, 0.3), 0, 0.08);
  // a row of posts down the middle carries the floor of the room above
  for (const x of spread(4, x0 + 3, x1 - 3)) b.box(0.45, g - 0.4, 0.45, P.oak, { at: [x, 0, zc] });
  b.box(W - 1.4, 0.3, 0.4, P.oak, { at: [xc, g - 0.7, zc], jitter: false });
  b.box(W, 0.4, D, dark, { at: [xc, g - 0.4, zc] });
  // the aldermen's room
  b.box(W, u, D, stone, { at: [xc, g, zc] });
  b.box(W + 0.16, 0.22, D + 0.16, dark, { at: [xc, g, zc], jitter: false });
  for (const x of spread(4, x0 + 2.2, x1 - 2.2)) {
    for (const s of [-0.5, 0.5]) win(b, 0.75, 2.4, { at: [x + s, g + 1.0, z1], shape: 'pointed', frame: dark });
    flatArch(b, 0.6, 0.6, P.windowDark, { at: [x, g + 3.0, z1], shape: 'round', off: 0.06, n: 3 });
  }
  for (const x of spread(3, x0 + 6, x1 - 2.2)) for (const s of [-0.5, 0.5]) win(b, 0.75, 2.4, { at: [x + s, g + 1.0, z0], facing: '-z', shape: 'pointed', frame: dark });
  for (const s of [-1, 1]) win(b, 1.0, 2.4, { at: [s > 0 ? x1 : x0, g + 1.0, zc - 1.5], facing: s > 0 ? '+x' : '-x', shape: 'pointed', frame: dark });
  // the outside stair up the right end to the aldermen's door
  b.group({ at: [x1 + 0.9, 0, zc + 1.2], rotY: Math.PI }, () => {
    b.stairs(1.4, g, 6.2, 14, dark, { at: [0, 0, 0] });
  });
  b.box(1.8, g, 1.6, dark, { at: [x1 + 0.9, 0, zc - 2.6] });
  flatArch(b, 1.1, 2.3, P.oakDark, { at: [x1, g, zc + 2.4 - 4.5], facing: '+x', shape: 'pointed', off: 0.06 });
  // steep roof of flat tiles, about 50 degrees, with plain stone gables
  b.gable(W, D, 6.0, P.tuilePlate, { at: [xc, g + u, zc], overhang: 0.35, wall: stone, thick: 0.18 });
  b.box(W + 0.8, 0.12, 0.25, tint(P.tuilePlate, -0.12), { at: [xc, g + u + 6.1, zc], jitter: false });
}

export function marketHallColliders(b: Builder): void {
  const { x0, x1, z0, z1 } = HALLE;
  // piers of the arcades only: the market floor is walkable
  for (const x of spread(6, x0 + 0.3, x1 - 0.3)) b.collider(0.9, 0.9, { at: [x, 0, z1 - 0.4] });
  for (const z of spread(4, z0 + 0.4, z1 - 0.3)) {
    b.collider(0.9, 0.9, { at: [x0 + 0.4, 0, z] });
    b.collider(0.9, 0.9, { at: [x1 - 0.4, 0, z] });
  }
  b.collider(x1 - x0, 0.9, { at: [(x0 + x1) / 2, 0, z0 + 0.4] });
  b.collider(2.0, 8, { at: [x1 + 0.9, 0, (z0 + z1) / 2 - 0.5] });
}

/** A flamboyant stone dormer (lucarne) rising from the parapet: window, gable, pinnacles. */
function lucarne(b: Builder, x: number, y: number, z: number, w: number, h: number, stone: number, slate: number, big: boolean): void {
  b.group({ at: [x, y, z] }, () => {
    const gh = big ? 2.2 : 1.2;
    b.box(w, h, 2.6, stone, { at: [0, 0, -1.3] });
    b.gable(w + 0.2, 2.8, gh * 0.8, slate, { at: [0, h, -1.3], ridge: 'z', overhang: 0.05 });
    b.extrude([[-w / 2 - 0.1, 0], [w / 2 + 0.1, 0], [0, gh]], 0.3, stone, { at: [0, h, 0.0], jitter: false });
    win(b, w - 0.6, h - 0.4, { at: [0, 0.2, 0.0], frame: tint(stone, -0.06), mullion: big, transom: big ? (h - 0.4) * 0.55 : undefined });
    if (big) {
      // a finial on the gable and a pinnacle each side
      b.cone(0.18, 0.9, stone, { at: [0, h + gh - 0.1, 0], segs: 4 });
      for (const s of [-1, 1]) {
        b.box(0.32, h + 0.6, 0.32, stone, { at: [s * (w / 2 + 0.2), 0, 0.05], jitter: false });
        b.cone(0.22, 1.0, stone, { at: [s * (w / 2 + 0.2), h + 0.6, 0.05], segs: 4 });
      }
    }
  });
}

/**
 * The town hall of 1510, built on to the belfry: an arcade on the square, a great hall above lit
 * by tall mullioned windows between buttresses with statues in niches, an openwork parapet, and a
 * steep slate roof with flamboyant dormers. Later stages weather it (1760, 1835) and rebuild it as it
 * was in clean stone with a new roof (1928 on); `wing` hides the back windows the 1928 wing covers.
 */
export function townHall(b: Builder, st: Stage): void {
  const { x0, x1, z0, z1, zin, g, u } = HALL;
  const W = x1 - x0;
  const xc = (x0 + x1) / 2;
  const stone = civicStone(st);
  const dark = tint(stone, -0.07);
  const slate = roofSlate(st);
  const wing = st >= 1928;
  // the ground floor behind the arcade, the floor over the arcade walk, the great hall block
  b.box(W, g, zin - z0, stone, { at: [xc, 0, (z0 + zin) / 2] });
  b.box(W - 0.4, 0.5, z1 - zin, dark, { at: [xc, g - 0.5, (zin + z1) / 2], jitter: false });
  b.box(W, u, z1 - z0, stone, { at: [xc, g, (z0 + z1) / 2] });
  pave(b, x0 + 0.4, x1 - 0.4, zin, z1 - 0.4, mix(P.paving, P.pierreBlonde, 0.3), 0, 0.08);
  // the arcade on the square, and an arch through each end
  arcade(b, W, g, 0.8, stone, { at: [xc, 0, z1 - 0.4], openings: 5, openW: 2.9, openH: 4.7, shape: 'pointed', n: 3 });
  for (const s of [-1, 1]) arcade(b, z1 - zin, g, 0.6, stone, { at: [s > 0 ? x1 - 0.3 : x0 + 0.3, 0, (zin + z1) / 2], facing: s > 0 ? '+x' : '-x', openings: 1, openW: 2.2, openH: 4.0, shape: 'pointed' });
  // under the arcade: the great door in the middle bay, windows in the others
  BAYS.forEach((x, i) => {
    if (i === 2) {
      flatArch(b, 2.6, 4.2, dark, { at: [x, 0, zin], shape: 'pointed', off: 0.04 });
      flatArch(b, 2.0, 3.8, P.oakDark, { at: [x, 0, zin], shape: 'pointed', off: 0.07 });
    } else win(b, 1.6, 2.6, { at: [x, 1.2, zin], shape: 'pointed', frame: dark, mullion: true });
  });
  b.box(W + 0.2, 0.3, 0.3, dark, { at: [xc, g - 0.1, z1 + 0.1], jitter: false }); // string course over the arcade
  // buttresses between the bays rising to pinnacles, with statues in canopied niches
  BUTTS.forEach((x, i) => {
    b.box(0.7, EAVES + 0.2 - g, 0.6, stone, { at: [x, g, z1 + 0.3] });
    b.box(0.5, 1.5, 0.5, stone, { at: [x, EAVES + 0.2, z1 + 0.3], jitter: false });
    b.cone(0.36, 1.6, stone, { at: [x, EAVES + 1.7, z1 + 0.3], segs: 4 });
    if (i > 0 && i < BUTTS.length - 1) {
      flatArch(b, 0.6, 1.9, tint(stone, -0.25), { at: [x, g + 1.4, z1 + 0.6], shape: 'pointed', off: 0.02 });
      b.box(0.7, 0.18, 0.35, dark, { at: [x, g + 1.25, z1 + 0.75], jitter: false });
      statue(b, [x, g + 1.43, z1 + 0.78], 1.5, mix(stone, P.concreteDark, 0.12));
      b.box(0.75, 0.25, 0.4, dark, { at: [x, g + 3.4, z1 + 0.75], jitter: false });
      b.cone(0.32, 1.0, dark, { at: [x, g + 3.65, z1 + 0.75], segs: 4 });
    }
  });
  // tall mullion-and-transom windows of the great hall
  BAYS.forEach((x) => win(b, 2.2, 4.6, { at: [x, g + 0.9, z1], shape: 'pointed', frame: dark, mullion: true, transom: 2.6 }));
  // the openwork parapet: a band pierced with small trefoil-headed lights
  b.group({ at: [xc, EAVES, z1 - 0.1] }, () => {
    b.extrude([[-W / 2, 0], [W / 2, 0], [W / 2, 1.0], [-W / 2, 1.0]], 0.24, stone, {
      jitter: false,
      holes: spread(16, -W / 2 + 0.9, W / 2 - 0.9).map((hx) => archOutline(0.6, 0.62, 'pointed', 1).map(([px, py]) => [hx + px, 0.18 + py] as [number, number])),
    });
  });
  b.box(W + 0.4, 0.25, 0.5, dark, { at: [xc, EAVES - 0.25, z1 + 0.05], jitter: false });
  // back and ends: plainer windows (the belfry stands against the back, the 1928 wing too)
  BAYS.forEach((x) => {
    if (x < BEL.x + BEL.w / 2 + 1.2) return;
    if (wing && x > WING.x0 - 1) return;
    win(b, 2.0, 4.2, { at: [x, g + 1.0, z0], facing: '-z', shape: 'pointed', frame: dark, mullion: true });
    win(b, 1.4, 2.2, { at: [x, 1.4, z0], facing: '-z', shape: 'rect', frame: dark });
  });
  for (const s of [-1, 1]) {
    const ex = s > 0 ? x1 : x0;
    const f = s > 0 ? '+x' : '-x';
    for (const z of [z0 + 3.2, z0 + 7.6]) win(b, 2.0, 4.2, { at: [ex, g + 1.0, z], facing: f, shape: 'pointed', frame: dark, mullion: true });
    win(b, 1.4, 2.2, { at: [ex, 1.4, z0 + 4], facing: f, frame: dark });
  }
  // steep slate roof (about 55 degrees) with stone gable ends, cresting and finials
  const zc = (z0 + z1) / 2;
  b.gable(W, z1 - z0, HALL_RISE, slate, { at: [xc, EAVES + 0.1, zc], wall: stone, thick: 0.2 });
  b.box(W + 0.2, 0.25, 0.3, tint(P.lead, -0.05), { at: [xc, EAVES + HALL_RISE + 0.2, zc], jitter: false });
  for (const ex of [x0, x1]) {
    b.box(0.5, 1.4, 0.5, stone, { at: [ex, EAVES + HALL_RISE - 0.2, zc], jitter: false });
    b.cone(0.35, 1.6, stone, { at: [ex, EAVES + HALL_RISE + 1.2, zc], segs: 4 });
    // coping along the gable edges
    for (const s of [-1, 1]) b.beam([ex, EAVES + 0.2, zc + s * 7.1], [ex, EAVES + HALL_RISE + 0.1, zc], 0.6, 0.3, dark);
  }
  b.chimney(1.0, 2.6, 0.8, stone, { at: [x1 - 3, EAVES + HALL_RISE * 0.55, zc - 3] });
  // flamboyant dormers in two rows on the front, smaller ones behind
  BAYS.forEach((x) => lucarne(b, x, EAVES, z1 - 0.3, 2.2, 3.0, stone, slate, true));
  for (const x of spread(3, x0 + 5, x1 - 5)) lucarne(b, x, EAVES + 5.3, z1 - 3.9, 1.3, 1.6, slate, slate, false);
  for (const x of spread(2, x0 + 10, x1 - 4)) {
    b.group({ at: [x, 0, z0], rotY: Math.PI }, () => lucarne(b, 0, EAVES + 1.0, 0.7, 1.4, 1.8, slate, slate, false));
  }
  // from the Revolution on, the tricolour on the hall; in 1510 the town's banner
  if (st < 1835) flag(b, [BAYS[2], EAVES + 1.0, z1 + 0.35], 3.4, [0x2f4f9a, P.gold], { w: 1.4, h: 1.0 });
  else flag(b, [BAYS[2], EAVES + 1.0, z1 + 0.35], 3.4, TRICOLOUR, { w: 1.6, h: 1.0 });
}

/** Walk colliders for the town hall: the closed block, the arcade piers, the end piers. */
export function townHallColliders(b: Builder): void {
  const { x0, x1, z0, z1, zin } = HALL;
  rectCollider(b, x0, x1, z0, zin);
  for (const x of spread(6, x0 + 0.35, x1 - 0.35)) b.collider(0.95, 1.0, { at: [x, 0, z1 - 0.2] });
}

/**
 * The council chamber wing of the Reconstruction, behind the hall: pale artificial stone over a
 * concrete frame, tall narrow windows between fluted piers, a stepped attic, a bronze door.
 */
export function decoWing(b: Builder): void {
  const { x0, x1, z0, z1, h } = WING;
  const W = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const stone = mix(P.concreteWhite, P.pierreBlonde, 0.5);
  const dark = tint(stone, -0.12);
  b.box(W, h, D, stone, { at: [xc, 0, zc] });
  b.box(W + 0.3, 1.0, D + 0.3, dark, { at: [xc, 0, zc], jitter: false });
  // the council chamber's side to the street: five tall windows between fluted piers
  const zs = spread(5, z0 + 2, z1 - 2);
  zs.forEach((z) => {
    win(b, 1.3, 6.4, { at: [x1, 2.6, z], facing: '+x', frame: dark, glass: P.windowDark, transom: 4.2 });
    // geometric glazing: a chevron of bars in the top light
    b.group({ at: [x1 + 0.1, 0, z], rotY: Math.PI / 2 }, () => {
      b.beam([-0.5, 7.4, 0], [0, 8.4, 0], 0.08, 0.06, dark);
      b.beam([0.5, 7.4, 0], [0, 8.4, 0], 0.08, 0.06, dark);
    });
  });
  for (let i = 0; i < zs.length - 1; i++) {
    const z = (zs[i] + zs[i + 1]) / 2;
    for (const dz of [-0.18, 0, 0.18]) b.box(0.14, h - 1.4, 0.12, tint(stone, 0.04), { at: [x1 + 0.05, 1.0, z + dz], jitter: false });
  }
  // a frieze of zigzags under the cornice
  const zig: number[] = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const za = z0 + (D * i) / n;
    const zb = z0 + (D * (i + 1)) / n;
    const zm = (za + zb) / 2;
    zig.push(x1 + 0.03, h - 1.4, za, x1 + 0.03, h - 1.4, zb, x1 + 0.03, h - 0.7, zm);
  }
  soup(b, zig, P.gold, { jitter: false });
  b.box(W + 0.5, 0.4, D + 0.5, dark, { at: [xc, h, zc], jitter: false });
  // stepped attic over the entrance bay
  const ez = zc - 2.5;
  b.box(3.0, 2.6, 6.0, stone, { at: [x1 - 1.5, h + 0.4, ez] });
  b.box(3.0, 1.6, 3.6, stone, { at: [x1 - 1.5, h + 3.0, ez] });
  b.box(3.0, 1.0, 1.6, dark, { at: [x1 - 1.5, h + 4.6, ez] });
  b.box(0.08, 1.8, 3.2, P.gold, { at: [x1 + 0.0, h + 0.8, ez], jitter: false }); // the town's arms in gilt
  // the entrance: a stepped portal, bronze doors, a canopy, the name cut over it
  b.box(0.5, 5.0, 4.4, dark, { at: [x1 + 0.25, 0, zs[2] + 0.0], jitter: false });
  b.box(0.3, 4.2, 3.4, stone, { at: [x1 + 0.55, 0, zs[2]], jitter: false });
  b.panel(2.2, 3.2, P.bronze, { at: [x1 + 0.7, 0, zs[2]], facing: '+x', depth: 0.05 });
  b.box(1.4, 0.2, 3.8, dark, { at: [x1 + 1.2, 3.6, zs[2]], jitter: false });
  b.box(0.06, 0.45, 3.0, P.bronze, { at: [x1 + 0.72, 4.3, zs[2]], jitter: false });
  b.stairs(4, 0.6, 1.6, 3, dark, { at: [x1 + 1.5, 0, zs[2]], rotY: Math.PI / 2 });
  // plain windows to the back and the other side
  for (const x of spread(3, x0 + 2, x1 - 2)) win(b, 1.3, 5.0, { at: [x, 3.0, z0], facing: '-z', frame: dark, transom: 3.4 });
  // flat roof behind the parapet
  b.box(W - 0.6, 0.3, D - 0.6, P.concreteDark, { at: [xc, h + 0.1, zc], jitter: false });
}

export function decoWingColliders(b: Builder): void {
  rectCollider(b, WING.x0, WING.x1 + 0.4, WING.z0, WING.z1);
}

/**
 * The commune's buildings as they stand at a given stage: in 1260 the belfry and market hall, from
 * 1510 the belfry and town hall, from 1928 with the council chamber wing. Colliders included.
 */
export function civicCentre(b: Builder, st: Stage): void {
  belfry(b, st);
  belfryColliders(b);
  if (st === 1260) {
    marketHall(b);
    marketHallColliders(b);
    return;
  }
  townHall(b, st);
  townHallColliders(b);
  if (st >= 1928) {
    decoWing(b);
    decoWingColliders(b);
  }
}

/** The main square's surface for an age, over x0..x1, z0..22. */
export function square(b: Builder, x0: number, x1: number, z0: number, surface: 'earth' | 'cobble' | 'setts' | 'paving' | 'tarmac'): void {
  const c =
    surface === 'earth'
      ? mix(P.earth, P.gravel, 0.4)
      : surface === 'cobble'
        ? mix(P.cobble, P.paving, 0.35)
        : surface === 'setts'
          ? mix(P.cobble, P.granite, 0.4)
          : surface === 'paving'
            ? mix(P.paving, P.pierreBlonde, 0.35)
            : mix(P.tarmac, P.cobble, 0.3);
  pave(b, x0, x1, z0, 21.8, c);
}

/** A monument aux morts of the 1920s: a stone stele on steps with a soldier (poilu) before it. */
export function warMemorial(b: Builder, x: number, z: number): void {
  const stone = mix(P.pierreBlonde, P.granite, 0.3);
  b.group({ at: [x, 0, z] }, () => {
    b.box(5.0, 0.3, 4.0, stone);
    b.box(4.2, 0.3, 3.2, stone, { at: [0, 0.3, 0] });
    b.box(2.0, 4.6, 0.9, stone, { at: [0, 0.6, -0.4] });
    b.extrude([[-1.1, 0], [1.1, 0], [0.6, 0.9], [-0.6, 0.9]], 1.0, stone, { at: [0, 5.2, -0.4], jitter: false });
    b.box(1.5, 2.2, 0.05, tint(stone, -0.18), { at: [0, 1.6, 0.06], jitter: false }); // the names of the dead
    b.box(1.2, 0.9, 1.0, stone, { at: [0, 0.6, 0.6] });
    statue(b, [0, 1.5, 0.6], 1.9, P.bronze, { arm: true });
    b.panel(0.9, 0.9, P.bronze, { at: [0, 5.2, 0.06], shape: 'circle' }); // a wreath of laurel
  });
  b.collider(5.0, 4.0, { at: [x, 0, z] });
}

/** A cast-iron gas lamp. */
export function gasLamp(b: Builder, x: number, z: number): void {
  b.cyl(0.11, 0.5, P.castIron, { at: [x, 0, z], segs: 6 });
  b.cyl(0.06, 3.3, P.castIron, { at: [x, 0, z], segs: 6 });
  b.cyl(0.14, 0.42, P.windowLit, { at: [x, 3.3, z], rTop: 0.22, segs: 4 });
  b.cone(0.26, 0.2, P.castIron, { at: [x, 3.72, z], segs: 4 });
}
