import * as THREE from 'three';

/**
 * A hollow dug into the ground by a building or a piece of scenery: a ditch, a moat, a sunken
 * road. The ground inside the outline is lowered by `depth`, sloping down from the edges over
 * `slope` metres. Wherever a model is shown, the ground under it is reshaped to match.
 */
export interface Cut {
  /** The outline (x, z) in metres, in either winding. */
  pts: [number, number][];
  depth: number;
  /** Horizontal run of the sloping sides. The ground cannot make a vertical face. */
  slope: number;
  /** Colour of the bottom; the sides blend into the ground around. */
  color?: number;
  /**
   * Edges with no slope, by index (edge i runs from point i to point i + 1): where the hollow
   * carries on into a neighbouring cut, so that no ridge is left between the two.
   */
  open?: number[];
}

interface Prepared extends Cut {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export interface CutSample {
  depth: number;
  /** Colour of the deepest cut here, if it has one. */
  color: number | undefined;
  /** 0 at the lip, 1 on the bottom. */
  weight: number;
}

/** Cuts ready to be asked how deep the ground is dug at a point. */
export class CutField {
  private list: Prepared[];
  /** Bounding box of everything dug (x0, z0, x1, z1), or null if nothing is. */
  readonly bounds: [number, number, number, number] | null;

  constructor(cuts: readonly Cut[]) {
    this.list = cuts
      .filter((c) => c.pts.length >= 3 && c.depth > 0)
      .map((c) => {
        const xs = c.pts.map((p) => p[0]);
        const zs = c.pts.map((p) => p[1]);
        return { ...c, x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
      });
    this.bounds = this.list.length
      ? [
          Math.min(...this.list.map((c) => c.x0)),
          Math.min(...this.list.map((c) => c.z0)),
          Math.max(...this.list.map((c) => c.x1)),
          Math.max(...this.list.map((c) => c.z1)),
        ]
      : null;
  }

  get empty(): boolean {
    return this.list.length === 0;
  }

  /** How far below the natural ground the surface is at (x, z). */
  depth(x: number, z: number): number {
    const b = this.bounds;
    if (!b || x < b[0] || x > b[2] || z < b[1] || z > b[3]) return 0;
    let best = 0;
    for (const c of this.list) {
      const d = depthIn(c, x, z);
      if (d > best) best = d;
    }
    return best;
  }

  /** Depth with the colour of the deepest cut, for painting the ground. */
  sample(x: number, z: number, out: CutSample): CutSample {
    out.depth = 0;
    out.color = undefined;
    out.weight = 0;
    const b = this.bounds;
    if (!b || x < b[0] || x > b[2] || z < b[1] || z > b[3]) return out;
    for (const c of this.list) {
      const d = depthIn(c, x, z);
      if (d > out.depth) {
        out.depth = d;
        out.color = c.color;
        out.weight = d / c.depth;
      }
    }
    return out;
  }
}

function depthIn(c: Prepared, x: number, z: number): number {
  if (x < c.x0 || x > c.x1 || z < c.z0 || z > c.z1) return 0;
  const pts = c.pts;
  const n = pts.length;
  let inside = false;
  let near = Infinity;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [ax, az] = pts[j];
    const [bx, bz] = pts[i];
    if (az > z !== bz > z && x < ((bx - ax) * (z - az)) / (bz - az) + ax) inside = !inside;
    // edge j runs from point j to point i
    if (c.open?.includes(j)) continue;
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const d = Math.hypot(x - (ax + t * dx), z - (az + t * dz));
    if (d < near) near = d;
  }
  if (!inside) return 0;
  return c.depth * Math.min(1, near / Math.max(0.01, c.slope));
}

/** A cut moved from a model's own frame to where the model stands. */
export function placeCut(c: Cut, at: { x: number; z: number; rotY: number }): Cut {
  const cos = Math.cos(at.rotY);
  const sin = Math.sin(at.rotY);
  return { ...c, pts: c.pts.map(([x, z]) => [at.x + x * cos + z * sin, at.z - x * sin + z * cos] as [number, number]) };
}

/**
 * Flat ground with the cuts dug into it, for the places a model is shown away from the town (the
 * viewer, the lineage street, the gallery): a sheet at y = 0 with a finely gridded patch round the
 * cuts, and an earth floor underneath. Returns geometry with vertex colours, ready for a matte mesh.
 */
export function cutGround(
  o: { x0: number; z0: number; x1: number; z1: number; color: number; step?: number; round?: boolean },
  cuts: readonly Cut[],
): THREE.BufferGeometry {
  const field = new CutField(cuts);
  const pos: number[] = [];
  const col: number[] = [];
  const base = new THREE.Color().setHex(o.color, THREE.SRGBColorSpace);
  const tmp = new THREE.Color();
  const s: CutSample = { depth: 0, color: undefined, weight: 0 };
  const vertex = (x: number, z: number) => {
    field.sample(x, z, s);
    pos.push(x, -s.depth, z);
    tmp.copy(base);
    if (s.depth > 0) {
      if (s.color !== undefined) tmp.lerp(new THREE.Color().setHex(s.color, THREE.SRGBColorSpace), s.weight);
      else tmp.multiplyScalar(1 - 0.22 * s.weight);
    }
    col.push(tmp.r, tmp.g, tmp.b);
  };
  const quad = (xa: number, za: number, xb: number, zb: number) => {
    // split each cell along whichever diagonal is the more level, so a slope running across the
    // grid comes out as a clean crease and not a row of steps
    const flip = !field.empty && Math.abs(field.depth(xa, za) - field.depth(xb, zb)) < Math.abs(field.depth(xa, zb) - field.depth(xb, za));
    if (flip) {
      vertex(xa, za);
      vertex(xa, zb);
      vertex(xb, zb);
      vertex(xa, za);
      vertex(xb, zb);
      vertex(xb, za);
    } else {
      vertex(xa, za);
      vertex(xa, zb);
      vertex(xb, za);
      vertex(xb, za);
      vertex(xa, zb);
      vertex(xb, zb);
    }
  };
  const step = o.step ?? 0.5;
  const b = field.bounds;
  if (!b && !o.round) quad(o.x0, o.z0, o.x1, o.z1);
  else {
    // the patch, snapped to the grid and kept inside the sheet (a round pad is gridded all over,
    // so that its rim can be drawn in to a circle)
    const all = o.round || !b;
    const px0 = all ? o.x0 : Math.max(o.x0, Math.floor((b[0] - step) / step) * step);
    const pz0 = all ? o.z0 : Math.max(o.z0, Math.floor((b[1] - step) / step) * step);
    const px1 = all ? o.x1 : Math.min(o.x1, Math.ceil((b[2] + step) / step) * step);
    const pz1 = all ? o.z1 : Math.min(o.z1, Math.ceil((b[3] + step) / step) * step);
    const nx = Math.max(1, Math.round((px1 - px0) / step));
    const nz = Math.max(1, Math.round((pz1 - pz0) / step));
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        quad(px0 + ((px1 - px0) * i) / nx, pz0 + ((pz1 - pz0) * j) / nz, px0 + ((px1 - px0) * (i + 1)) / nx, pz0 + ((pz1 - pz0) * (j + 1)) / nz);
      }
    }
    // the four flat pieces round it
    if (pz0 > o.z0) quad(o.x0, o.z0, o.x1, pz0);
    if (pz1 < o.z1) quad(o.x0, pz1, o.x1, o.z1);
    if (px0 > o.x0) quad(o.x0, pz0, px0, pz1);
    if (px1 < o.x1) quad(px1, pz0, o.x1, pz1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  if (o.round) {
    // a round pad: pull everything outside the circle in to its edge
    const r = Math.min(o.x1 - o.x0, o.z1 - o.z0) / 2;
    const cx = (o.x0 + o.x1) / 2;
    const cz = (o.z0 + o.z1) / 2;
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const dx = p.getX(i) - cx;
      const dz = p.getZ(i) - cz;
      const d = Math.hypot(dx, dz);
      if (d > r) p.setXYZ(i, cx + (dx / d) * r, p.getY(i), cz + (dz / d) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}
