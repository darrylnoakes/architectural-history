import * as THREE from 'three';
import type { Builder, Vec3 } from '@ah/kit';

export type Pt = [number, number];

/** Add a list of raw triangles (flat [x, y, z] runs) as one piece. */
export function addTris(b: Builder, tris: number[], color: number, o?: { mat?: 'matte' | 'glass'; jitter?: boolean }): void {
  if (!tris.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris), 3));
  g.computeVertexNormals();
  b.add(g, color, { mat: o?.mat, jitter: o?.jitter });
}

/** Push the two triangles of the quad a-b-c-d into `t`. */
export function quad(t: number[], a: Vec3, c: Vec3, d: Vec3, e: Vec3): void {
  t.push(...a, ...c, ...d, ...a, ...d, ...e);
}

/** A thin vertical wall standing on a polyline of [x, z, yBottom, yTop] points. */
export function strip(b: Builder, pts: [number, number, number, number][], color: number, o?: { mat?: 'matte' | 'glass' }): void {
  const t: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0, b0, t0] = pts[i];
    const [x1, z1, b1, t1] = pts[i + 1];
    quad(t, [x0, b0, z0], [x1, b1, z1], [x1, t1, z1], [x0, t0, z0]);
  }
  addTris(b, t, color, o);
}

/** A horizontal band between two matching polylines at height y (a floor of boxes, a gallery). */
export function band(b: Builder, a: Pt[], c: Pt[], y: number, color: number): void {
  const t: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    quad(t, [a[i][0], y, a[i][1]], [a[i + 1][0], y, a[i + 1][1]], [c[i + 1][0], y, c[i + 1][1]], [c[i][0], y, c[i][1]]);
  }
  addTris(b, t, color);
}

/** A standing statue of h metres on `at`: a draped body and a head. */
export function statue(b: Builder, at: Vec3, h: number, color: number): void {
  b.cyl(h * 0.14, h * 0.78, color, { at, rTop: h * 0.09, segs: 5, jitter: false });
  b.sphere(h * 0.08, color, { at: [at[0], at[1] + h * 0.87, at[2]], segs: 5, jitter: false });
}

/**
 * The flat end of a lathe: the closed outline `profile` ([r, y] points) stood up on the radial
 * plane at angle `ang` (0 = +Z, turning toward +X), optionally squashed in Z by `sz` about `c`.
 */
export function latheCap(b: Builder, profile: Pt[], ang: number, color: number, c: Vec3 = [0, 0, 0], sz = 1): void {
  const faces = THREE.ShapeUtils.triangulateShape(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    [],
  );
  const s = Math.sin(ang);
  const k = Math.cos(ang);
  const t: number[] = [];
  for (const f of faces) {
    for (const i of f) {
      const [r, y] = profile[i];
      t.push(c[0] + r * s, c[1] + y, c[2] + r * k * sz);
    }
  }
  addTris(b, t, color);
}

/** A point on a circle of radius r at angle a (0 = +Z, turning toward +X), squashed in Z by sz. */
export function polar(r: number, a: number, c: Pt = [0, 0], sz = 1): Pt {
  return [c[0] + r * Math.sin(a), c[1] + r * Math.cos(a) * sz];
}

/** A balustrade: a rail, a plinth and a row of squat balusters, from p0 to p1 at height y. */
export function balustrade(b: Builder, p0: Pt, p1: Pt, y: number, color: number, h = 1.0, pitch = 0.5): void {
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const ang = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  const mid: Vec3 = [(p0[0] + p1[0]) / 2, y, (p0[1] + p1[1]) / 2];
  b.group({ at: mid, rotY: ang }, () => {
    b.box(0.34, 0.16, len, color, { jitter: false });
    b.box(0.4, 0.14, len + 0.04, color, { at: [0, h - 0.14, 0], jitter: false });
    const n = Math.max(2, Math.round(len / pitch));
    for (let i = 0; i < n; i++) {
      const z = -len / 2 + (i + 0.5) * (len / n);
      b.box(0.16, h - 0.3, 0.16, color, { at: [0, 0.16, z], jitter: false });
    }
  });
}

/** A run of flat strips laid on a height field: the slats of a lattice. Each segment is a box-like ribbon (top and two sides). */
export function ribbon(t: number[], pts: Vec3[], w: number, h: number): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const c = pts[i + 1];
    const dx = c[0] - a[0];
    const dz = c[2] - a[2];
    const L = Math.hypot(dx, dz) || 1;
    const nx = (-dz / L) * (w / 2);
    const nz = (dx / L) * (w / 2);
    const aL: Vec3 = [a[0] + nx, a[1], a[2] + nz];
    const aR: Vec3 = [a[0] - nx, a[1], a[2] - nz];
    const cL: Vec3 = [c[0] + nx, c[1], c[2] + nz];
    const cR: Vec3 = [c[0] - nx, c[1], c[2] - nz];
    const up = (p: Vec3): Vec3 => [p[0], p[1] + h, p[2]];
    quad(t, up(aL), up(cL), up(cR), up(aR));
    quad(t, aL, cL, up(cL), up(aL));
    quad(t, aR, cR, up(cR), up(aR));
  }
}
