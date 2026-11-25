import * as THREE from 'three';
import { P, hash2, smoothstep, valueNoise, type CutSample, type Era } from '@ah/kit';
import { STREET_STYLES, WATER_Y, type Land } from './land';

// Heights of the street layers above the ground. They must stack in this order: the depth offsets on
// their materials only settle ties at a distance and cannot be relied on to reorder them close up.
const PAVE_Y = 0.04;
const SQUARE_Y = 0.05;
const ROAD_Y = 0.07;
const LINE_Y = 0.09;

const SPAN = 1700;

/**
 * Grid lines along one axis: evenly spaced at `fine` between a and b (where the town and its
 * earthworks are), then wider and wider out to the horizon.
 */
function gridLines(centre: number, a: number, b: number, fine: number, grow: number): Float32Array {
  const out: number[] = [];
  const n = Math.max(1, Math.round((b - a) / fine));
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  for (const dir of [-1, 1]) {
    let x = dir < 0 ? a : b;
    let step = fine;
    while (Math.abs(x - centre) < SPAN) {
      step = Math.min(80, step * grow);
      x += dir * step;
      out.push(x);
    }
  }
  return Float32Array.from(out.sort((p, q) => p - q));
}

const c1 = new THREE.Color();
const c2 = new THREE.Color();
const c3 = new THREE.Color();
const hex = (h: number, into: THREE.Color) => into.setHex(h, THREE.SRGBColorSpace);

function groundColour(land: Land, x: number, z: number, h: number, era: Era, out: THREE.Color) {
  const d = land.riverDist(x, z);
  const r = Math.hypot(x - land.site.centre[0], z - land.site.centre[1]);
  const env = era.env;
  const nz = valueNoise(x * 0.02, z * 0.02);

  // farmland
  const a = 0.35;
  const u = x * Math.cos(a) + z * Math.sin(a);
  const v = -x * Math.sin(a) + z * Math.cos(a);
  const [cw, cl] = env.fieldSize ?? [78, 62];
  // alternate the strip direction block by block so the open fields look like furlongs
  const block = hash2(Math.floor(u / 130) + 7, Math.floor(v / 130) - 3) > 0.5;
  const fu = Math.floor((block ? u : v) / cw);
  const fv = Math.floor((block ? v : u) / cl);
  const pick = hash2(fu * 1.31 + 3.1, fv * 2.17 - 1.7);
  const fieldTones = [env.fields, P.meadow, P.grassDry, P.crop, 0x93885f, P.grass, env.fields, P.meadow];
  const tone = fieldTones[Math.floor(pick * pick * fieldTones.length) % fieldTones.length];
  hex(tone, c1);
  hex(P.grass, c2).offsetHSL(0, -0.05, -0.05 + nz * 0.05);
  const farmR = env.extent + 60 + 330 * (1 - env.treeCover * 0.85);
  const farmed = 1 - smoothstep(farmR * 0.8, farmR * 1.15, r + nz * 60);
  c2.lerp(c1, farmed * 0.85);

  // the built-up area
  hex(env.ground, c1);
  hex(P.grass, c3);
  const core = 0.3 + 0.45 * (1 - smoothstep(25, env.extent, r));
  c3.lerp(c1, core);
  const inTown = 1 - smoothstep(env.extent * 0.72, env.extent * 1.08, r + (nz - 0.5) * 34);
  c2.lerp(c3, inTown);

  // high ground is rougher and darker
  hex(0x7f9858, c1);
  c2.lerp(c1, smoothstep(5, 34, h) * 0.6);

  // river bed and banks
  const half = land.riverHalf;
  if (d < half + 3) {
    hex(0x7a7458, c1);
    c2.lerp(c1, 1 - smoothstep(half - 1.5, half + 3, d));
  }
  out.copy(c2);
}

function ribbon(
  land: Land,
  pts: [number, number][],
  width: number,
  lift: number,
  out: { pos: number[]; idx: number[] },
  flatUntil = 0,
  /** Width of the widest layer laid along the same line: every layer lies in its plane, so they stack cleanly on a slope. */
  span = width,
) {
  // resample the polyline every few metres so it follows the ground and stops at a ditch
  const samples: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    // in short steps near anything dug, so the road stops close to the lip
    const cb = land.cuts.bounds;
    const near = cb && Math.max(ax, bx) > cb[0] - 4 && Math.min(ax, bx) < cb[2] + 4 && Math.max(az, bz) > cb[1] - 4 && Math.min(az, bz) < cb[3] + 4;
    const steps = Math.max(1, Math.ceil(len / (near ? 0.8 : 4)));
    for (let s = 0; s < steps; s++) samples.push([ax + ((bx - ax) * s) / steps, az + ((bz - az) * s) / steps]);
  }
  samples.push(pts[pts.length - 1]);
  const base = out.pos.length / 3;
  for (let i = 0; i < samples.length; i++) {
    const [x, z] = samples[i];
    const p = samples[Math.max(0, i - 1)];
    const q = samples[Math.min(samples.length - 1, i + 1)];
    let tx = q[0] - p[0];
    let tz = q[1] - p[1];
    const tl = Math.hypot(tx, tz) || 1;
    tx /= tl;
    tz /= tl;
    const nx = -tz;
    const nzz = tx;
    // the ground at the two edges of the widest layer, lifted if it bulges between them
    const half = Math.max(span, width) / 2;
    const yl = Math.max(flatUntil, land.natural(x - nx * half, z - nzz * half));
    const yr = Math.max(flatUntil, land.natural(x + nx * half, z + nzz * half));
    const bulge = Math.max(0, Math.max(flatUntil, land.natural(x, z)) - (yl + yr) / 2);
    for (const s of [-1, 1]) {
      const px = x + (nx * s * width) / 2;
      const pz = z + (nzz * s * width) / 2;
      const t = 0.5 + (s * width) / (4 * half);
      out.pos.push(px, yl + (yr - yl) * t + bulge + lift, pz);
    }
  }
  for (let i = 0; i < samples.length - 1; i++) {
    // where the ground has been dug away the road stops: a gate's own bridge carries it over
    if (!land.cuts.empty && land.cuts.depth((samples[i][0] + samples[i + 1][0]) / 2, (samples[i][1] + samples[i + 1][1]) / 2) > 0.05) continue;
    const a = base + i * 2;
    out.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

function quad(x0: number, z0: number, x1: number, z1: number, y: number, out: { pos: number[]; idx: number[] }) {
  const b = out.pos.length / 3;
  out.pos.push(x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1);
  out.idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
}

function meshFrom(data: { pos: number[]; idx: number[] }, mat: THREE.Material): THREE.Mesh {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(data.pos, 3));
  g.setIndex(data.idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/**
 * One gridded sheet of ground: its vertices, the colours it is fading between and, where the ground
 * is being dug or filled, the heights it is moving between. The land is one big sheet, with small
 * finer ones let into it wherever earthworks lie outside its own fine part.
 */
class Sheet {
  readonly mesh: THREE.Mesh;
  private natY: Float32Array;
  private yFrom: Float32Array;
  private yTo: Float32Array;
  private colFrom: Float32Array;
  private colTo: Float32Array;
  private moving = false;
  private nx: number;
  private nz: number;
  /** Cells left out of this sheet (as index ranges), where a finer sheet is let in. */
  private holes: [number, number, number, number][] = [];
  /** True for a vertex on the rim of a let-in sheet: it must stay on the edge of the land round it. */
  private rim: Uint8Array;

  constructor(
    private land: Land,
    readonly xs: Float32Array,
    readonly zs: Float32Array,
    material: THREE.Material,
    /** For a let-in sheet: the height of the land round it along its rim. */
    rimY?: (x: number, z: number) => number,
  ) {
    const NX = (this.nx = xs.length);
    const NZ = (this.nz = zs.length);
    const pos = new Float32Array(NX * NZ * 3);
    this.natY = new Float32Array(NX * NZ);
    this.rim = new Uint8Array(NX * NZ);
    for (let j = 0; j < NZ; j++) {
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i;
        const edge = !!rimY && (i === 0 || j === 0 || i === NX - 1 || j === NZ - 1);
        this.rim[k] = edge ? 1 : 0;
        pos[k * 3] = xs[i];
        pos[k * 3 + 1] = this.natY[k] = edge ? rimY!(xs[i], zs[j]) : land.natural(xs[i], zs[j]);
        pos[k * 3 + 2] = zs[j];
      }
    }
    this.yFrom = Float32Array.from(this.natY);
    this.yTo = Float32Array.from(this.natY);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array((NX - 1) * (NZ - 1) * 6), 1));
    this.colFrom = new Float32Array(pos.length);
    this.colTo = new Float32Array(pos.length);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.length), 3));
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.receiveShadow = true;
    this.triangulate();
  }

  /** The rectangle of whole cells that covers `r`, and leave those cells out of this sheet from now on. */
  open(r: Rect): Rect {
    const lo = (a: Float32Array, v: number) => {
      let i = 0;
      while (i < a.length - 2 && a[i + 1] <= v) i++;
      return i;
    };
    const hi = (a: Float32Array, v: number) => {
      let i = a.length - 1;
      while (i > 1 && a[i - 1] >= v) i--;
      return i;
    };
    const i0 = lo(this.xs, r.x0);
    const i1 = hi(this.xs, r.x1);
    const j0 = lo(this.zs, r.z0);
    const j1 = hi(this.zs, r.z1);
    this.holes.push([i0, i1, j0, j1]);
    this.triangulate();
    return { x0: this.xs[i0], x1: this.xs[i1], z0: this.zs[j0], z1: this.zs[j1] };
  }

  /** Height of this sheet's own surface along one of its grid lines (between two of its vertices). */
  edgeHeight(x: number, z: number): number {
    const at = (a: Float32Array, v: number) => {
      let i = 0;
      while (i < a.length - 2 && a[i + 1] < v) i++;
      return i;
    };
    const i = at(this.xs, x);
    const j = at(this.zs, z);
    const u = Math.min(1, Math.max(0, (x - this.xs[i]) / (this.xs[i + 1] - this.xs[i])));
    const v = Math.min(1, Math.max(0, (z - this.zs[j]) / (this.zs[j + 1] - this.zs[j])));
    const y = (ii: number, jj: number) => this.natY[jj * this.nx + ii];
    // on a grid line one of u, v is 0 or 1, so this is the straight edge between two vertices
    return (y(i, j) * (1 - u) + y(i + 1, j) * u) * (1 - v) + (y(i, j + 1) * (1 - u) + y(i + 1, j + 1) * u) * v;
  }

  /** Work out the colours for an era and, if the ground has been dug or filled, its new heights. */
  repaint(era: Era, dug: boolean) {
    const pos = this.mesh.geometry.attributes.position as THREE.BufferAttribute;
    const col = this.mesh.geometry.attributes.color as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    // start the change from whatever is on screen now
    this.colFrom.set(col.array as Float32Array);
    const c = new THREE.Color();
    const cc = new THREE.Color();
    const cuts = this.land.cuts;
    const s: CutSample = { depth: 0, color: undefined, weight: 0 };
    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      groundColour(this.land, x, z, this.natY[i], era, c);
      if (dug) {
        this.yFrom[i] = arr[i * 3 + 1];
        this.yTo[i] = this.natY[i];
      }
      if (!cuts.empty && !this.rim[i] && cuts.sample(x, z, s).depth > 0) {
        // the bottom of a ditch takes its own colour, or lies in shade
        if (s.color !== undefined) c.lerp(cc.setHex(s.color, THREE.SRGBColorSpace), s.weight);
        else c.multiplyScalar(1 - 0.22 * s.weight);
        this.yTo[i] = this.natY[i] - s.depth;
      }
      this.colTo[i * 3] = c.r;
      this.colTo[i * 3 + 1] = c.g;
      this.colTo[i * 3 + 2] = c.b;
    }
    if (dug) {
      this.moving = true;
      this.triangulate();
    }
  }

  /**
   * Split each cell along whichever diagonal is the more level in the ground as it is going to be, so
   * the lip of a ditch running across the grid comes out as a clean crease and not a row of steps.
   */
  private triangulate() {
    const index = this.mesh.geometry.index!;
    const idx = index.array as Uint32Array;
    const y = this.yTo;
    const NX = this.nx;
    let k = 0;
    for (let j = 0; j < this.nz - 1; j++) {
      for (let i = 0; i < NX - 1; i++) {
        if (this.holes.some(([i0, i1, j0, j1]) => i >= i0 && i < i1 && j >= j0 && j < j1)) continue;
        const a = j * NX + i;
        const b = a + 1;
        const c = a + NX;
        const d = c + 1;
        if (Math.abs(y[a] - y[d]) < Math.abs(y[b] - y[c])) {
          idx[k++] = a;
          idx[k++] = c;
          idx[k++] = d;
          idx[k++] = a;
          idx[k++] = d;
          idx[k++] = b;
        } else {
          idx[k++] = a;
          idx[k++] = c;
          idx[k++] = b;
          idx[k++] = b;
          idx[k++] = c;
          idx[k++] = d;
        }
      }
    }
    this.mesh.geometry.setDrawRange(0, k);
    index.needsUpdate = true;
  }

  /** Put the colours, and the heights if the ground is being dug or filled, where they are going. */
  settle() {
    const g = this.mesh.geometry;
    const col = g.attributes.color as THREE.BufferAttribute;
    (col.array as Float32Array).set(this.colTo);
    col.needsUpdate = true;
    if (this.moving) {
      const pos = g.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < this.yTo.length; i++) arr[i * 3 + 1] = this.yTo[i];
      pos.needsUpdate = true;
      this.moving = false;
    }
  }

  /** Part-way (k from 0 to 1) between the old colours and heights and the new. */
  blend(k: number) {
    const col = this.mesh.geometry.attributes.color as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    for (let i = 0; i < arr.length; i++) arr[i] = this.colFrom[i] + (this.colTo[i] - this.colFrom[i]) * k;
    col.needsUpdate = true;
    if (this.moving) {
      const pos = this.mesh.geometry.attributes.position as THREE.BufferAttribute;
      const p = pos.array as Float32Array;
      for (let i = 0; i < this.yTo.length; i++) if (this.yFrom[i] !== this.yTo[i]) p[i * 3 + 1] = this.yFrom[i] + (this.yTo[i] - this.yFrom[i]) * k;
      pos.needsUpdate = true;
    }
  }

  get isMoving(): boolean {
    return this.moving;
  }
}

/** Evenly spaced lines from a to b, about `step` apart. */
function evenLines(a: number, b: number, step: number): Float32Array {
  const n = Math.max(1, Math.round((b - a) / step));
  return Float32Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}

/** The land: relief, field patterns that change with the era, the river, and the streets. */
export class Terrain {
  readonly group = new THREE.Group();
  /** The ground: the land as a whole, and any finer sheets let into it. */
  private sheets: Sheet[] = [];
  private groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true });
  private cutsVersion = 0;
  private blend = 1;
  private roadGroup = new THREE.Group();
  private roadMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xffffff, side: THREE.DoubleSide });
  private paveMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xffffff, side: THREE.DoubleSide });
  private lineMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xe9e6da, side: THREE.DoubleSide });
  private water: THREE.Mesh;
  private eraId = '';
  private roadKey = '';

  constructor(private land: Land) {
    const [cx, cz] = land.site.centre;
    // fine enough to shape a ditch where the site says there are earthworks, coarser elsewhere
    const d = land.site.detail;
    const xs = d ? gridLines(cx, d.x0, d.x1, 1.5, 1.05) : gridLines(cx, cx - 110, cx + 110, 2, 1.035);
    const zs = d ? gridLines(cz, d.z0, d.z1, 1.5, 1.05) : gridLines(cz, cz - 110, cz + 110, 2, 1.035);
    const main = new Sheet(land, xs, zs, this.groundMat);
    this.sheets.push(main);
    // earthworks beyond the fine part of the land get a fine sheet of their own, let into it
    for (const want of land.site.detailPatches ?? []) {
      const r = main.open(want);
      this.sheets.push(new Sheet(land, evenLines(r.x0, r.x1, 1.5), evenLines(r.z0, r.z1, 1.5), this.groundMat, (x, z) => main.edgeHeight(x, z)));
    }
    for (const sh of this.sheets) this.group.add(sh.mesh);

    // river surface: a ribbon a little wider than the channel
    const w = { pos: [] as number[], idx: [] as number[] };
    if (land.site.river) {
      const pts: [number, number][] = [];
      for (let x = -1500; x <= 1500; x += 20) pts.push([x, land.riverZ(x)]);
      for (const [x, z] of pts) {
        w.pos.push(x, WATER_Y, z - land.riverHalf - 3.5, x, WATER_Y, z + land.riverHalf + 3.5);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = i * 2;
        w.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    this.water = meshFrom(
      w,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHex(0x5f9bb0, THREE.SRGBColorSpace),
        roughness: 0.18,
        metalness: 0.25,
        transparent: true,
        opacity: 0.9,
      }),
    );
    this.group.add(this.water);
    this.group.add(this.roadGroup);
  }

  /** Repaint the land and relay the streets for an era. `year` decides which lanes exist yet. */
  setEra(era: Era, year: number, instant: boolean) {
    const squares = this.land.site.squares.filter((q) => (q.since ?? -Infinity) <= year).length;
    const lanes = this.land.roadsAt(year).map((r) => r.id).join(',');
    const key = era.id + '|' + lanes + '|' + squares + '|' + this.land.cutsVersion;
    if (key !== this.roadKey) {
      this.roadKey = key;
      this.buildRoads(era, year);
    }
    const dug = this.land.cutsVersion !== this.cutsVersion;
    if (era.id === this.eraId && !dug) return;
    this.eraId = era.id;
    this.cutsVersion = this.land.cutsVersion;
    for (const sh of this.sheets) sh.repaint(era, dug);
    this.blend = instant ? 1 : 0;
    if (instant) for (const sh of this.sheets) sh.settle();
  }

  private buildRoads(era: Era, year: number) {
    for (const child of [...this.roadGroup.children]) {
      (child as THREE.Mesh).geometry.dispose();
      this.roadGroup.remove(child);
    }
    const st = STREET_STYLES[era.env.streets];
    this.roadMat.color.setHex(st.color, THREE.SRGBColorSpace);
    this.paveMat.color.setHex(st.pavementColor || st.color, THREE.SRGBColorSpace);
    const road = { pos: [] as number[], idx: [] as number[] };
    const pave = { pos: [] as number[], idx: [] as number[] };
    const lines = { pos: [] as number[], idx: [] as number[] };
    const land = this.land;
    for (const r of land.roadsAt(year)) {
      const w = r.kind === 'main' ? st.main : st.lane;
      // the carriageway lies above the pavement strip it runs along, so near or far it is what you see
      if (st.pavement) ribbon(land, r.pts, w + st.pavement * 2, PAVE_Y, pave);
      ribbon(land, r.pts, w, ROAD_Y, road, 0, w + st.pavement * 2);
      if (st.lines && r.kind === 'main') {
        // dashed centre line
        for (let i = 0; i < r.pts.length - 1; i++) {
          const [ax, az] = r.pts[i];
          const [bx, bz] = r.pts[i + 1];
          const len = Math.hypot(bx - ax, bz - az);
          const n = Math.floor(len / 9);
          for (let k = 0; k < n; k++) {
            const t0 = (k * 9 + 2) / len;
            const t1 = (k * 9 + 5) / len;
            ribbon(
              land,
              [
                [ax + (bx - ax) * t0, az + (bz - az) * t0],
                [ax + (bx - ax) * t1, az + (bz - az) * t1],
              ],
              0.16,
              LINE_Y,
              lines,
              0,
              w + st.pavement * 2,
            );
          }
        }
      }
    }
    // the squares: once streets have pavements they are flagged over rather than left as carriageway
    for (const sq of land.site.squares) {
      if ((sq.since ?? -Infinity) > year) continue;
      const y = land.height((sq.x0 + sq.x1) / 2, (sq.z0 + sq.z1) / 2);
      if (st.pavement) quad(sq.x0 - 1, sq.z0 - 1, sq.x1 + 1, sq.z1 + 1, y + SQUARE_Y, pave);
      else quad(sq.x0, sq.z0, sq.x1, sq.z1, y + ROAD_Y, road);
    }
    if (road.idx.length) this.roadGroup.add(meshFrom(road, this.roadMat));
    if (pave.idx.length) this.roadGroup.add(meshFrom(pave, this.paveMat));
    if (lines.idx.length) this.roadGroup.add(meshFrom(lines, this.lineMat));
    // The layers lie at their own heights, so near the camera they order themselves. A constant
    // nudge in depth settles ties far away, where the depth buffer cannot tell centimetres apart.
    // (No slope-scaled offset: it pulls the streets in front of anything a model lays on the ground
    // within a hand's breadth of them, such as the cobbles of a market place.)
    for (const [mat, units] of [[this.paveMat, -2], [this.roadMat, -4], [this.lineMat, -6]] as const) {
      mat.polygonOffset = true;
      mat.polygonOffsetFactor = 0;
      mat.polygonOffsetUnits = units;
    }
  }

  dispose() {
    this.group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    for (const m of [this.roadMat, this.paveMat, this.lineMat, this.groundMat, this.water.material]) (m as THREE.Material).dispose();
  }

  update(dt: number) {
    if (this.blend >= 1) return;
    this.blend = Math.min(1, this.blend + dt / (this.sheets.some((sh) => sh.isMoving) ? 0.7 : 1.1));
    if (this.blend >= 1) {
      for (const sh of this.sheets) sh.settle();
      return;
    }
    const k = this.blend * this.blend * (3 - 2 * this.blend);
    for (const sh of this.sheets) sh.blend(k);
  }
}
