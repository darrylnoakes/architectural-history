import * as THREE from 'three';
import { Builder, P, getMaterials, mulberry32, spread, tint, type Era, type Region } from '@ah/kit';
import { KNOLL, SQUARE, STREET_STYLES, baseHeight, distToRoad, inSquare, riverZ } from './layout';

interface TreeInst {
  x: number;
  y: number;
  z: number;
  rot: number;
  h: number;
  /** Survives while tree cover is above 1 - score. */
  score: number;
  cur: number;
  kind: number;
  slot: number;
}

interface Prop {
  since: number;
  until: number;
  object: THREE.Object3D;
  cur: number;
  spin?: THREE.Object3D[];
}

function unitTree(kind: 'round' | 'conifer' | 'poplar', seed: number): THREE.BufferGeometry {
  const b = new Builder(seed);
  b.tree(1, { kind });
  const built = b.finish();
  return (built.object.children[0] as THREE.Mesh).geometry;
}

function car(b: Builder, style: 'thirties' | 'sixties' | 'modern', color: number, at: [number, number, number], rotY: number) {
  b.group({ at, rotY }, () => {
    const tyre = 0x1d1d1f;
    if (style === 'thirties') {
      b.box(1.45, 0.55, 3.7, color, { at: [0, 0.42, 0] });
      b.box(1.35, 0.72, 1.9, color, { at: [0, 0.97, -0.35] });
      b.box(1.2, 0.5, 1.0, tint(color, 0.03), { at: [0, 0.97, 1.25] });
      b.panel(1.1, 0.42, P.windowDark, { at: [0, 1.15, 0.6], facing: '+z' });
      b.sym((s) => {
        b.panel(1.5, 0.4, P.windowDark, { at: [s * 0.675, 1.15, -0.35], facing: s > 0 ? '+x' : '-x' });
        b.box(0.3, 0.12, 4.1, 0x18181a, { at: [s * 0.82, 0.5, 0] });
        b.sphere(0.13, 0xe8e2c0, { at: [s * 0.45, 0.95, 1.8], segs: 6 });
      });
      for (const z of [-1.25, 1.3]) b.sym((s) => b.log(0.36, 0.2, tyre, { at: [s * 0.78, 0, z], segs: 8 }));
      return;
    }
    const L = style === 'sixties' ? 3.9 : 4.2;
    const W = style === 'sixties' ? 1.5 : 1.75;
    b.box(W, 0.55, L, color, { at: [0, 0.3, 0] });
    if (style === 'sixties') {
      b.box(W - 0.12, 0.5, L * 0.48, tint(color, 0.05), { at: [0, 0.85, -0.15] });
      b.sym((s) => b.panel(L * 0.42, 0.34, P.windowDark, { at: [s * (W / 2 - 0.06), 0.93, -0.15], facing: s > 0 ? '+x' : '-x' }));
      b.panel(W - 0.3, 0.34, P.windowDark, { at: [0, 0.93, L * 0.24 - 0.15], facing: '+z' });
      b.panel(W - 0.3, 0.34, P.windowDark, { at: [0, 0.93, -L * 0.24 - 0.15], facing: '-z' });
      b.box(W + 0.06, 0.1, 0.12, P.aluminium, { at: [0, 0.34, L / 2] });
      b.box(W + 0.06, 0.1, 0.12, P.aluminium, { at: [0, 0.34, -L / 2] });
    } else {
      // a wedge-fronted hatchback: the cabin is one extruded profile
      b.extrude(
        [[-L * 0.42, 0], [L * 0.3, 0], [L * 0.12, 0.58], [-L * 0.34, 0.6]],
        W - 0.14,
        tint(color, 0.02),
        { at: [0, 0.85, 0], rotY: -Math.PI / 2 },
      );
      b.sym((s) => b.panel(L * 0.5, 0.36, P.glassDark, { at: [s * (W / 2 - 0.07), 0.93, -0.25], facing: s > 0 ? '+x' : '-x' }));
    }
    for (const z of [-L * 0.3, L * 0.31]) b.sym((s) => b.log(0.32, 0.22, tyre, { at: [s * (W / 2 - 0.08), 0, z], segs: 8 }));
  });
}

function lamp(b: Builder, style: 'gas' | 'modern', at: [number, number, number], rotY: number) {
  b.group({ at, rotY }, () => {
    if (style === 'gas') {
      b.cyl(0.11, 0.5, P.castIron, { segs: 6 });
      b.cyl(0.06, 3.1, P.castIron, { segs: 6 });
      b.box(0.5, 0.04, 0.04, P.castIron, { at: [0, 2.7, 0] });
      b.cyl(0.14, 0.42, P.windowLit, { at: [0, 3.1, 0], rTop: 0.22, segs: 4 });
      b.cone(0.26, 0.2, P.castIron, { at: [0, 3.52, 0], segs: 4 });
    } else {
      b.cyl(0.09, 7.5, P.steel, { segs: 6, rTop: 0.06 });
      b.box(0.1, 0.08, 1.6, P.steel, { at: [0, 7.5, 0.7] });
      b.box(0.24, 0.1, 0.6, P.aluminium, { at: [0, 7.42, 1.35] });
    }
  });
}

function finishStatic(b: Builder): THREE.Object3D {
  return b.finish().object;
}

/** Everything that is not a plot building: woodland that retreats, and the incidental props of each age. */
export class Scenery {
  readonly group = new THREE.Group();
  private trees: TreeInst[] = [];
  private meshes: THREE.InstancedMesh[] = [];
  private props: Prop[] = [];
  private cover = -1;
  private year = 0;
  private settling = true;
  private dummy = new THREE.Object3D();

  constructor(region: Region, opts: { treeCount: number }) {
    this.makeTrees(region, opts.treeCount);
    this.makeProps();
  }

  private makeTrees(region: Region, count: number) {
    const rng = mulberry32(4242);
    const blocked = (x: number, z: number) => {
      if (inSquare(x, z, 6)) return true;
      if (distToRoad(x, z) < 8) return true;
      if (Math.abs(z - riverZ(x)) < 13) return true;
      if (Math.hypot(x - KNOLL.x, z - KNOLL.z) < 26) return true;
      for (const p of region.plots) {
        const lin = region.lineages.find((l) => l.id === p.lineage);
        if (!lin) continue;
        const r = Math.hypot(lin.plotSize[0], lin.plotSize[1]) / 2 + 3;
        if (Math.hypot(x - p.x, z - p.z) < r) return true;
      }
      return false;
    };
    const kinds = [unitTree('round', 1), unitTree('round', 2), unitTree('conifer', 3)];
    const perKind = [0, 0, 0];
    let guard = 0;
    while (this.trees.length < count && guard++ < count * 30) {
      // more candidates near the middle, where their loss is most visible
      const r = 30 + 620 * Math.pow(rng(), 0.72);
      const a = rng() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = 25 + Math.sin(a) * r;
      if (blocked(x, z)) continue;
      const kind = rng() < 0.12 ? 2 : rng() < 0.5 ? 0 : 1;
      const far = Math.min(1, Math.max(0, (r - 45) / 420));
      this.trees.push({
        x,
        z,
        y: baseHeight(x, z) - 0.15,
        rot: rng() * 6.28,
        h: 7 + rng() * 9 + (kind === 2 ? 3 : 0),
        score: 0.5 * far + 0.5 * rng(),
        cur: 0,
        kind,
        slot: perKind[kind]++,
      });
    }
    const mat = getMaterials().matte;
    const tintC = new THREE.Color();
    kinds.forEach((g, k) => {
      const m = new THREE.InstancedMesh(g, mat, Math.max(1, perKind[k]));
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      this.meshes.push(m);
      this.group.add(m);
    });
    for (const t of this.trees) {
      const v = 0.82 + rng() * 0.36;
      tintC.setRGB(v * (0.94 + rng() * 0.12), v, v * (0.9 + rng() * 0.1));
      this.meshes[t.kind].setColorAt(t.slot, tintC);
      this.writeTree(t);
    }
    for (const m of this.meshes) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }

  private writeTree(t: TreeInst) {
    const s = Math.max(0.0001, t.cur) * t.h;
    this.dummy.position.set(t.x, t.y, t.z);
    this.dummy.rotation.set(0, t.rot, 0);
    this.dummy.scale.set(s, s, s);
    this.dummy.updateMatrix();
    this.meshes[t.kind].setMatrixAt(t.slot, this.dummy.matrix);
  }

  private addProp(object: THREE.Object3D, since: number, until = Infinity, spin?: THREE.Object3D[]) {
    object.scale.setScalar(0.0001);
    object.visible = false;
    this.group.add(object);
    this.props.push({ since, until, object, cur: 0, spin });
  }

  private makeProps() {
    // --- the stone circle on the knoll: older than everything else in the story
    {
      const b = new Builder(77);
      const y = baseHeight(KNOLL.x, KNOLL.z);
      const n = 13;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 13 + b.range(-0.6, 0.6);
        const x = KNOLL.x + Math.cos(a) * r;
        const z = KNOLL.z + Math.sin(a) * r;
        const fallen = i === 4 || i === 9;
        const h = b.range(2.4, 3.8);
        b.box(b.range(1.1, 1.7), fallen ? 0.8 : h, b.range(0.6, 0.9), tint(P.gritstone, b.range(-0.04, 0.04)), {
          at: [x, baseHeight(x, z) - 0.2, z],
          rotY: -a + (fallen ? 0.6 : 0),
          rot: fallen ? [0, 0, 0] : [b.range(-0.06, 0.06), 0, b.range(-0.06, 0.06)],
        });
      }
      b.box(2.4, 0.5, 1.1, P.gritstone, { at: [KNOLL.x, y - 0.1, KNOLL.z], rotY: 0.4 });
      this.addProp(finishStatic(b), -Infinity);
    }

    // --- railway viaduct across the valley south of the town
    {
      const b = new Builder(78);
      const z = 205;
      const len = 560;
      const h = 15;
      const brick = P.brickDark;
      b.archWall(len, h, 5.2, brick, { at: [0, 0, z], openings: 40, openW: 10.4, openH: 12.6, shape: 'round' });
      b.box(len + 2, 0.5, 6, P.sandstone, { at: [0, h, z] });
      b.box(len, 0.9, 0.3, brick, { at: [0, h + 0.5, z - 2.8] });
      b.box(len, 0.9, 0.3, brick, { at: [0, h + 0.5, z + 2.8] });
      b.box(len, 0.12, 0.14, P.iron, { at: [0, h + 0.5, z - 0.75] });
      b.box(len, 0.12, 0.14, P.iron, { at: [0, h + 0.5, z + 0.75] });
      for (const s of [-1, 1]) {
        b.extrude([[0, 0], [90, 0], [0, h + 0.5]], 7, P.grass, { at: [(s * len) / 2, 0, z], rotY: s > 0 ? 0 : Math.PI });
      }
      this.addProp(finishStatic(b), 1848);
    }

    // --- wind turbines on the hills
    {
      const root = new THREE.Group();
      const spin: THREE.Object3D[] = [];
      for (const [x, z] of [[330, -300], [395, -240], [300, -370]] as [number, number][]) {
        const y = baseHeight(x, z);
        const b = new Builder(79);
        b.cyl(1.3, 46, P.white, { rTop: 0.7, segs: 8 });
        b.box(1.6, 1.6, 4, P.white, { at: [0, 45.4, 0.4] });
        const tower = finishStatic(b);
        tower.position.set(x, y, z);
        tower.rotation.y = 0.9;
        const rb = new Builder(80);
        for (let i = 0; i < 3; i++) {
          rb.group({ rot: [0, 0, (i * Math.PI * 2) / 3] }, () => rb.box(0.9, 21, 0.25, P.white, { at: [0, 0.8, 0] }));
        }
        rb.sphere(1, P.white, { segs: 8 });
        const rotor = finishStatic(rb);
        rotor.position.set(0, 46.2, 2.7);
        tower.add(rotor);
        spin.push(rotor);
        root.add(tower);
      }
      this.addProp(root, 2001, Infinity, spin);
    }

    // --- street lamps
    const lampSpots: [number, number, number][] = [];
    for (const z of [-130, -100, -70, -42, 36, 56, 104, 130, 156]) lampSpots.push([4.6, z, -Math.PI / 2]);
    for (const z of [-115, -85, -56, 30, 50, 116, 142]) lampSpots.push([-4.6, z, Math.PI / 2]);
    for (const x of [-120, -92, -64, -40, 42, 68, 96, 124]) lampSpots.push([x, 4.6, Math.PI]);
    for (const x of [-106, -78, -52, 34, 56, 82, 110]) lampSpots.push([x, -4.6, 0]);
    for (const [x, z] of [[SQUARE.x0 + 2, SQUARE.z0 + 2], [SQUARE.x1 - 2, SQUARE.z0 + 2], [SQUARE.x0 + 2, SQUARE.z1 - 2], [SQUARE.x1 - 2, SQUARE.z1 - 2]]) {
      lampSpots.push([x, z, Math.atan2(-x, -z)]);
    }
    {
      const b = new Builder(81);
      for (const [x, z, r] of lampSpots) lamp(b, 'gas', [x, 0, z], r);
      this.addProp(finishStatic(b), 1825, 1958);
      const m = new Builder(82);
      for (const [x, z, r] of lampSpots.filter((_, i) => i % 2 === 0)) lamp(m, 'modern', [x, 0, z], r);
      this.addProp(finishStatic(m), 1958);
    }

    // --- things in the square
    {
      const b = new Builder(83);
      // war memorial: a stone cross on an octagonal stepped base
      b.group({ at: [SQUARE.x0 + 7, 0, SQUARE.z1 - 6] }, () => {
        b.cyl(1.9, 0.3, P.portland, { segs: 8 });
        b.cyl(1.4, 0.3, P.portland, { at: [0, 0.3, 0], segs: 8 });
        b.box(0.9, 1.3, 0.9, P.portland, { at: [0, 0.6, 0] });
        b.box(0.34, 3.2, 0.34, P.portland, { at: [0, 1.9, 0] });
        b.box(1.3, 0.3, 0.3, P.portland, { at: [0, 4.2, 0] });
      });
      this.addProp(finishStatic(b), 1920);
      const k = new Builder(84);
      // K6 telephone kiosk
      k.group({ at: [SQUARE.x1 - 4, 0, SQUARE.z1 - 3], rotY: -0.5 }, () => {
        k.box(0.92, 2.3, 0.92, P.postRed);
        k.dome(0.52, P.postRed, { at: [0, 2.3, 0], squash: 0.45, segs: 8 });
        for (const f of ['+z', '-z', '+x', '-x'] as const) {
          const v: [number, number, number] = f === '+z' ? [0, 0.35, 0.46] : f === '-z' ? [0, 0.35, -0.46] : f === '+x' ? [0.46, 0.35, 0] : [-0.46, 0.35, 0];
          k.window(0.7, 1.6, { at: v, facing: f, frame: P.postRed, bars: [3, 6], border: 0.07 });
        }
      });
      this.addProp(finishStatic(k), 1936);
      const p = new Builder(85);
      // pillar box
      p.group({ at: [SQUARE.x1 - 6.5, 0, SQUARE.z1 - 2.6] }, () => {
        p.cyl(0.25, 1.35, P.postRed, { segs: 10 });
        p.cyl(0.29, 0.14, P.postRed, { at: [0, 1.35, 0], rTop: 0.12, segs: 10 });
        p.cyl(0.27, 0.16, 0x1b1b1d, { segs: 10 });
      });
      this.addProp(finishStatic(p), 1859);
    }

    // --- parked cars, three generations
    const spots: [number, number, number][] = [
      [2.4, -38, 0], [2.4, 48, 0], [-2.4, -66, Math.PI], [-2.4, 112, Math.PI], [2.4, 134, 0],
      [48, 2.4, Math.PI / 2], [-48, -2.4, -Math.PI / 2], [96, -2.4, -Math.PI / 2], [-96, 2.4, Math.PI / 2],
      [SQUARE.x0 + 4, -14, 0], [SQUARE.x0 + 4, -9, 0], [SQUARE.x1 - 4, 12, Math.PI], [SQUARE.x1 - 4, 6, Math.PI],
      [30, 45.5, Math.PI / 2], [70, 40.6, -Math.PI / 2], [-2.4, 150, Math.PI], [-70, 95.6, -Math.PI / 2], [60, 100.4, Math.PI / 2],
    ];
    {
      const a = new Builder(86);
      spots.filter((_, i) => i % 4 === 0).forEach(([x, z, r]) => car(a, 'thirties', a.pick([0x1c1c1e, 0x2a2420, 0x3a2a26, 0x26303a]), [x, 0.05, z], r));
      this.addProp(finishStatic(a), 1928, 1957);
      const c = new Builder(87);
      spots.filter((_, i) => i % 2 === 0).forEach(([x, z, r]) =>
        car(c, 'sixties', c.pick([P.cladRed, 0x7fa3b8, P.cream, 0x5d7a52, 0xd9d4c6, 0x34495e]), [x, 0.05, z], r),
      );
      this.addProp(finishStatic(c), 1957, 1988);
      const m = new Builder(88);
      spots.forEach(([x, z, r]) => car(m, 'modern', m.pick([0xc9ced2, 0xf0efea, 0x30343a, 0x3f6f9c, 0xa33a34, 0x7b8086]), [x, 0.05, z], r));
      this.addProp(finishStatic(m), 1988);
    }

    // --- field barns and haystacks that give the farmland some scale
    {
      const b = new Builder(89);
      for (const [x, z] of [[150, 150], [-170, 120], [185, -110], [-130, -190], [230, 60]] as [number, number][]) {
        const y = baseHeight(x, z);
        b.group({ at: [x, y, z], rotY: b.range(0, 3) }, () => {
          b.cyl(2.2, 2.2, P.thatch, { segs: 9 });
          b.cone(2.5, 2.2, P.thatchOld, { at: [0, 2.2, 0], segs: 9 });
        });
      }
      this.addProp(finishStatic(b), 900, 1935);
    }
    void spread;
    void STREET_STYLES;
  }

  setEra(era: Era, year: number, instant: boolean) {
    this.year = year;
    if (era.env.treeCover !== this.cover) {
      this.cover = era.env.treeCover;
      this.settling = true;
    }
    for (const p of this.props) {
      const want = year >= p.since && year < p.until ? 1 : 0;
      if (instant) {
        p.cur = want;
        p.object.visible = want > 0;
        p.object.scale.setScalar(Math.max(0.0001, want));
      } else if (want && !p.object.visible) p.object.visible = true;
    }
    if (instant) {
      for (const t of this.trees) {
        t.cur = t.score > 1 - this.cover ? 1 : 0;
        this.writeTree(t);
      }
      for (const m of this.meshes) m.instanceMatrix.needsUpdate = true;
      this.settling = false;
    }
  }

  update(dt: number, elapsed: number) {
    for (const p of this.props) {
      const want = this.year >= p.since && this.year < p.until ? 1 : 0;
      if (p.cur !== want) {
        p.cur += Math.sign(want - p.cur) * Math.min(Math.abs(want - p.cur), dt / 0.6);
        const k = p.cur * p.cur * (3 - 2 * p.cur);
        p.object.scale.set(1, Math.max(0.0001, k), 1);
        if (p.cur <= 0) p.object.visible = false;
      }
      if (p.spin && p.object.visible) for (const s of p.spin) s.rotation.z = elapsed * 0.9;
    }
    if (!this.settling) return;
    let moving = false;
    const step = dt / 0.9;
    for (const t of this.trees) {
      const want = t.score > 1 - this.cover ? 1 : 0;
      if (t.cur === want) continue;
      t.cur += Math.sign(want - t.cur) * Math.min(Math.abs(want - t.cur), step);
      this.writeTree(t);
      moving = true;
    }
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true;
    this.settling = moving;
  }
}
