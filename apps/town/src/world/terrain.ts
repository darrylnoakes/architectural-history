import * as THREE from 'three';
import { P, type Era } from '@ah/kit';
import {
  BRIDGE,
  RIVER_HALF,
  SQUARE,
  STREET_STYLES,
  WATER_Y,
  WORLD_CENTRE,
  baseHeight,
  hash2,
  riverZ,
  roads,
  smoothstep,
  valueNoise,
} from './layout';

const N = 300;
const SPAN = 1700;

function warp(u: number): number {
  const a = Math.abs(u);
  return Math.sign(u) * SPAN * (0.17 * a + 0.83 * a * a * a * a);
}

const c1 = new THREE.Color();
const c2 = new THREE.Color();
const c3 = new THREE.Color();
const hex = (h: number, into: THREE.Color) => into.setHex(h, THREE.SRGBColorSpace);

/** Field pattern: [cell width, cell length] in metres, by era. Strips in the open-field centuries. */
function fieldCell(era: Era): [number, number] {
  switch (era.id) {
    case 'iron-age':
      return [34, 30];
    case 'roman':
      return [48, 44];
    case 'anglo-saxon':
    case 'norman':
    case 'gothic':
      return [13, 120];
    case 'tudor':
      return [22, 120];
    default:
      return [78, 62];
  }
}

function groundColour(x: number, z: number, h: number, era: Era, out: THREE.Color) {
  const d = Math.abs(z - riverZ(x));
  const r = Math.hypot(x - WORLD_CENTRE.x, z - WORLD_CENTRE.z);
  const env = era.env;
  const nz = valueNoise(x * 0.02, z * 0.02);

  // farmland
  const a = 0.35;
  const u = x * Math.cos(a) + z * Math.sin(a);
  const v = -x * Math.sin(a) + z * Math.cos(a);
  const [cw, cl] = fieldCell(era);
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
  if (d < 11) {
    hex(0x7a7458, c1);
    c2.lerp(c1, 1 - smoothstep(6.5, 11, d));
  }
  out.copy(c2);
}

function ribbon(
  pts: [number, number][],
  width: number,
  lift: number,
  out: { pos: number[]; idx: number[] },
  flatUntil = 0,
) {
  // resample the polyline every few metres so it follows the ground
  const samples: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.ceil(len / 7));
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
    for (const s of [-1, 1]) {
      const px = x + (nx * s * width) / 2;
      const pz = z + (nzz * s * width) / 2;
      const y = Math.max(flatUntil, baseHeight(px, pz)) + lift;
      out.pos.push(px, y, pz);
    }
  }
  for (let i = 0; i < samples.length - 1; i++) {
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

/** The land: relief, field patterns that change with the era, the river, and the streets. */
export class Terrain {
  readonly group = new THREE.Group();
  private ground: THREE.Mesh;
  private colFrom: Float32Array;
  private colTo: Float32Array;
  private blend = 1;
  private roadGroup = new THREE.Group();
  private roadMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xffffff, side: THREE.DoubleSide });
  private paveMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xffffff, side: THREE.DoubleSide });
  private lineMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0xe9e6da, side: THREE.DoubleSide });
  private water: THREE.Mesh;
  private eraId = '';
  private roadKey = '';

  constructor() {
    const pos = new Float32Array((N + 1) * (N + 1) * 3);
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const x = warp((i / N) * 2 - 1) + WORLD_CENTRE.x;
        const z = warp((j / N) * 2 - 1) + WORLD_CENTRE.z;
        const k = (j * (N + 1) + i) * 3;
        pos[k] = x;
        pos[k + 1] = baseHeight(x, z);
        pos[k + 2] = z;
      }
    }
    const idx: number[] = [];
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i;
        const b = a + 1;
        const c = a + N + 1;
        const d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    this.colFrom = new Float32Array(pos.length);
    this.colTo = new Float32Array(pos.length);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.length), 3));
    this.ground = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }),
    );
    this.ground.receiveShadow = true;
    this.group.add(this.ground);

    // river surface: a ribbon a little wider than the channel
    const w = { pos: [] as number[], idx: [] as number[] };
    const pts: [number, number][] = [];
    for (let x = -1500; x <= 1500; x += 20) pts.push([x, riverZ(x)]);
    const base = 0;
    for (const [x, z] of pts) {
      w.pos.push(x, WATER_Y, z - RIVER_HALF - 3.5, x, WATER_Y, z + RIVER_HALF + 3.5);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = base + i * 2;
      w.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
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
    const lanes = roads.filter((r) => (r.since ?? -Infinity) <= year).map((r) => r.id).join(',');
    const key = era.id + '|' + lanes;
    if (key !== this.roadKey) {
      this.roadKey = key;
      this.buildRoads(era, year);
    }
    if (era.id === this.eraId) return;
    this.eraId = era.id;
    const pos = this.ground.geometry.attributes.position;
    const col = this.ground.geometry.attributes.color as THREE.BufferAttribute;
    // start the fade from whatever is on screen now
    this.colFrom.set(col.array as Float32Array);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      groundColour(pos.getX(i), pos.getZ(i), pos.getY(i), era, c);
      this.colTo[i * 3] = c.r;
      this.colTo[i * 3 + 1] = c.g;
      this.colTo[i * 3 + 2] = c.b;
    }
    this.blend = instant ? 1 : 0;
    if (instant) {
      (col.array as Float32Array).set(this.colTo);
      col.needsUpdate = true;
    }
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
    for (const r of roads) {
      if ((r.since ?? -Infinity) > year) continue;
      const w = r.kind === 'main' ? st.main : st.lane;
      if (st.pavement) ribbon(r.pts, w + st.pavement * 2, 0.05, pave);
      ribbon(r.pts, w, st.pavement ? 0.035 : 0.06, road);
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
              [
                [ax + (bx - ax) * t0, az + (bz - az) * t0],
                [ax + (bx - ax) * t1, az + (bz - az) * t1],
              ],
              0.16,
              0.075,
              lines,
            );
          }
        }
      }
    }
    // the market square, and the bridge approaches
    const sq = SQUARE;
    if (st.pavement) quad(sq.x0 - 1, sq.z0 - 1, sq.x1 + 1, sq.z1 + 1, 0.05, pave);
    quad(sq.x0, sq.z0, sq.x1, sq.z1, st.pavement ? 0.036 : 0.062, road);
    void BRIDGE;
    if (road.idx.length) this.roadGroup.add(meshFrom(road, this.roadMat));
    if (pave.idx.length) this.roadGroup.add(meshFrom(pave, this.paveMat));
    if (lines.idx.length) this.roadGroup.add(meshFrom(lines, this.lineMat));
    // pavements must draw under the carriageway without z-fighting
    this.roadMat.polygonOffset = true;
    this.roadMat.polygonOffsetFactor = -2;
    this.roadMat.polygonOffsetUnits = -2;
    this.paveMat.polygonOffset = true;
    this.paveMat.polygonOffsetFactor = -1;
    this.paveMat.polygonOffsetUnits = -1;
    this.lineMat.polygonOffset = true;
    this.lineMat.polygonOffsetFactor = -3;
    this.lineMat.polygonOffsetUnits = -3;
  }

  update(dt: number) {
    if (this.blend >= 1) return;
    this.blend = Math.min(1, this.blend + dt / 1.1);
    const col = this.ground.geometry.attributes.color as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    const k = this.blend * this.blend * (3 - 2 * this.blend);
    for (let i = 0; i < arr.length; i++) arr[i] = this.colFrom[i] + (this.colTo[i] - this.colFrom[i]) * k;
    col.needsUpdate = true;
  }
}
