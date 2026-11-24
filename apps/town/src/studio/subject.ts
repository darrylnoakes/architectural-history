import * as THREE from 'three';
import { Builder, P, construct, cutGround, getMaterials, type BuildingDef, type Built, type Lineage } from '@ah/kit';

/** One building to show on its own: a stage of a lineage, built for a given seed. */
export interface Subject {
  def: BuildingDef;
  lineage: Lineage;
  seed: number;
}

export interface Staged {
  group: THREE.Group;
  /** Centre and size of the building itself (not its setting), for framing the camera. */
  centre: THREE.Vector3;
  radius: number;
  height: number;
  dispose(): void;
}

function safeConstruct(def: BuildingDef, seed: number): Built {
  try {
    return construct(def, seed, 0);
  } catch (err) {
    console.error(`Failed to build ${def.id}`, err);
    return { object: new THREE.Group(), bounds: new THREE.Box3(), colliders: [], decks: [], cuts: [], triangles: 0, hasCutaway: false };
  }
}

/**
 * A building on a small piece of its own landscape: a turf pad a little larger than its plot, the
 * river if the plot has one, and a few trees round the edge so it does not float in a void.
 */
export function stageSubject(s: Subject, opts: { trees?: boolean } = {}): Staged {
  const built = safeConstruct(s.def, s.seed);
  const group = new THREE.Group();
  group.add(built.object);

  const [pw, pd] = s.lineage.plotSize;
  const b = built.bounds;
  const empty = b.isEmpty();
  const size = empty ? new THREE.Vector3(pw * 0.6, 4, pd * 0.6) : b.getSize(new THREE.Vector3());
  const centre = empty ? new THREE.Vector3(0, 2, 0) : b.getCenter(new THREE.Vector3());
  const R = Math.max(pw, pd, size.x, size.z) * 0.5 + 9;

  const g = new Builder(7);
  const river = s.lineage.river;
  if (river) {
    const [z0, z1] = river;
    const span = R * 2.6;
    g.box(span, 3, R * 1.3 + z0, P.grass, { at: [0, -3, (z0 - R * 1.3) / 2], jitter: false });
    g.box(span, 3, R * 1.3 - z1, P.grass, { at: [0, -3, (z1 + R * 1.3) / 2], jitter: false });
    g.box(span, 0.7, z1 - z0, 0x7a7458, { at: [0, -3, (z0 + z1) / 2], jitter: false });
    g.box(span, 0.02, z1 - z0, 0x5f9bb0, { at: [0, -1.2, (z0 + z1) / 2], jitter: false, mat: 'glass' });
  } else if (built.cuts.length) {
    // the pad is dug where the building asks: a round sheet with its ditches in it, on a deeper drum of earth
    const deep = Math.max(...built.cuts.map((c) => c.depth));
    const sheet = new THREE.Mesh(cutGround({ x0: -R, z0: -R, x1: R, z1: R, color: P.grass, step: 0.6, round: true }, built.cuts), getMaterials().matte);
    sheet.receiveShadow = true;
    group.add(sheet);
    g.add(new THREE.CylinderGeometry(R, R, 1.2, 40, 1, true), P.grass, { at: [0, -0.6, 0], jitter: false });
    g.cyl(R * 1.012, 0.9 + deep, 0x6f6348, { at: [0, -1.25 - deep, 0], segs: 40, jitter: false });
  } else {
    g.cyl(R, 1.2, P.grass, { at: [0, -1.2, 0], segs: 40, jitter: false });
    g.cyl(R * 1.012, 0.9, 0x6f6348, { at: [0, -1.25, 0], segs: 40, jitter: false });
  }
  if (opts.trees !== false && !river) {
    const n = 7;
    for (let i = 0; i < n; i++) {
      // keep the front (toward +Z) clear so the building is never hidden
      const a = Math.PI * (0.62 + (i / (n - 1)) * 0.76) + g.range(-0.08, 0.08);
      const r = R - g.range(1.6, 3.2);
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (Math.abs(x) < size.x / 2 + 2 && Math.abs(z - centre.z) < size.z / 2 + 2) continue;
      g.tree(g.range(6, 10), { at: [x, 0, z], kind: g.chance(0.2) ? 'conifer' : 'round' });
    }
  }
  const ground = g.finish().object;
  group.add(ground);

  return {
    group,
    centre: new THREE.Vector3(centre.x, Math.min(size.y * 0.42, 12), centre.z),
    radius: Math.max(5, Math.hypot(size.x, size.z) / 2, size.y * 0.55),
    height: size.y,
    dispose() {
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    },
  };
}
