import * as THREE from 'three';
import { Builder, P, getMaterials, mulberry32, type Collider, type Era, type Region, type TreeKind } from '@ah/kit';
import type { Land } from './land';

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
  /** What a walker bumps into while this prop stands. */
  colliders: Collider[];
  object: THREE.Object3D;
  cur: number;
  spin?: THREE.Object3D[];
}

function unitTree(kind: TreeKind, seed: number): THREE.BufferGeometry {
  const b = new Builder(seed);
  b.tree(1, { kind });
  const built = b.finish();
  return (built.object.children[0] as THREE.Mesh).geometry;
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
  private solid: Collider[] = [];
  private collidersYear = NaN;
  private dummy = new THREE.Object3D();

  constructor(
    region: Region,
    private land: Land,
    opts: { treeCount: number },
  ) {
    this.makeTrees(region, opts.treeCount);
    this.makeProps();
  }

  private makeTrees(region: Region, count: number) {
    const rng = mulberry32(4242);
    const land = this.land;
    const site = land.site;
    const blocked = (x: number, z: number) => {
      if (land.inSquare(x, z, 6)) return true;
      if (land.distToRoad(x, z) < 8) return true;
      if (land.riverDist(x, z) < land.riverHalf + 5) return true;
      for (const c of site.clearings ?? []) if (Math.hypot(x - c.x, z - c.z) < c.r) return true;
      for (const p of region.plots) {
        const lin = region.lineages.find((l) => l.id === p.lineage);
        if (!lin) continue;
        const r = Math.hypot(lin.plotSize[0], lin.plotSize[1]) / 2 + 3;
        if (Math.hypot(x - p.x, z - p.z) < r) return true;
      }
      return false;
    };
    // two shapes of each kind, so a wood is not a row of clones
    const mix = site.trees.flatMap((t) => [t, t]);
    const kinds = mix.map((t, i) => unitTree(t.kind, i + 1));
    const tall = mix.map((t) => (t.kind === 'conifer' || t.kind === 'cypress' || t.kind === 'pine' ? 3 : t.kind === 'olive' ? -5 : 0));
    const total = mix.reduce((a, t) => a + t.share, 0);
    const perKind = mix.map(() => 0);
    const pickKind = (u: number) => {
      let acc = 0;
      for (let i = 0; i < mix.length; i++) {
        acc += mix[i].share / total;
        if (u < acc) return i;
      }
      return mix.length - 1;
    };
    let guard = 0;
    while (this.trees.length < count && guard++ < count * 30) {
      // more candidates near the middle, where their loss is most visible
      const r = 30 + 620 * Math.pow(rng(), 0.72);
      const a = rng() * Math.PI * 2;
      const x = site.centre[0] + Math.cos(a) * r;
      const z = site.centre[1] + Math.sin(a) * r;
      if (blocked(x, z)) continue;
      const kind = pickKind(rng());
      const far = Math.min(1, Math.max(0, (r - 45) / 420));
      this.trees.push({
        x,
        z,
        y: land.height(x, z) - 0.15,
        rot: rng() * 6.28,
        h: 7 + rng() * 9 + tall[kind],
        score: 0.38 * far + 0.62 * rng(),
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

  private addProp(object: THREE.Object3D, since: number, until = Infinity, spin?: THREE.Object3D[], colliders: Collider[] = []) {
    object.scale.setScalar(0.0001);
    object.visible = false;
    this.group.add(object);
    this.props.push({ since, until, object, cur: 0, spin, colliders });
  }

  /** The solid parts of whatever scenery stands in the current year. */
  colliders(): readonly Collider[] {
    if (this.collidersYear !== this.year) {
      this.collidersYear = this.year;
      this.solid = this.props.filter((p) => p.colliders.length && this.year >= p.since && this.year < p.until).flatMap((p) => p.colliders);
    }
    return this.solid;
  }

  private makeProps() {
    const site = this.land.site;
    site.props.forEach((prop, i) => {
      const b = new Builder(77 + i);
      try {
        prop.build(b, this.land.height);
      } catch (err) {
        console.error(`Failed to build ${prop.id}`, err);
        return;
      }
      const built = b.finish();
      this.addProp(built.object, prop.since ?? -Infinity, prop.until ?? Infinity, undefined, prop.solid ? built.colliders : []);
    });

    if (site.turbines) {
      const root = new THREE.Group();
      const spin: THREE.Object3D[] = [];
      for (const [x, z] of site.turbines.at) {
        const b = new Builder(79);
        b.cyl(1.3, 46, P.white, { rTop: 0.7, segs: 8 });
        b.box(1.6, 1.6, 4, P.white, { at: [0, 45.4, 0.4] });
        const tower = finishStatic(b);
        tower.position.set(x, this.land.height(x, z), z);
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
      this.addProp(root, site.turbines.since, Infinity, spin);
    }
  }

  dispose() {
    this.group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    for (const m of this.meshes) m.dispose();
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
