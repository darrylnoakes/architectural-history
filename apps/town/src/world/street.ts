import * as THREE from 'three';
import { Builder, P, construct, type Built, type Era, type Lineage } from '@ah/kit';
import type { Walkable, WorldCollider } from '@ah/engine';
import { deckHeightAt, toWorld, type WorldDeck } from './town';

export interface StreetItem {
  stageIndex: number;
  built: Built;
  x: number;
  width: number;
  label: THREE.Vector3;
}

/**
 * The lineage street: every building that ever stood on one plot, lined up in date order so they can
 * be compared side by side. Oldest on the left; fronts face the viewer.
 */
export class Street implements Walkable {
  readonly group = new THREE.Group();
  items: StreetItem[] = [];
  lineage: Lineage | null = null;
  centre = new THREE.Vector3();
  radius = 100;
  minDistance = 10;
  maxDistance = 420;
  private cols: WorldCollider[] = [];
  private dks: WorldDeck[] = [];
  private river: [number, number] | null = null;

  constructor() {
    this.group.visible = false;
  }

  open(lineage: Lineage, seed: number, variant: number, eras: Era[]) {
    this.close();
    this.lineage = lineage;
    this.river = lineage.river ?? null;
    const [pw, pd] = lineage.plotSize;
    const gap = 9;
    const widths: number[] = [];
    const builts: Built[] = [];
    for (const st of lineage.stages) {
      let b: Built;
      try {
        b = construct(st.def, seed, variant);
      } catch (err) {
        console.error(`Failed to build ${st.def.id}`, err);
        b = { object: new THREE.Group(), bounds: new THREE.Box3(), colliders: [], decks: [], triangles: 0 };
      }
      builts.push(b);
      const s = b.bounds.isEmpty() ? pw * 0.6 : b.bounds.max.x - b.bounds.min.x;
      widths.push(Math.max(10, Math.min(pw + 4, s)));
    }
    const total = widths.reduce((a, w) => a + w + gap, -gap);
    let x = -total / 2;
    const eraColour = (year: number) => {
      let c = eras[0].color;
      for (const e of eras) if (year >= e.from) c = e.color;
      return c;
    };
    const ground = new Builder(5);
    const W = total + 260;
    const front = pd / 2;
    const bridgeLike = !!this.river && this.river[0] < 0 && this.river[1] > 0;
    if (this.river) {
      const [z0, z1] = this.river;
      ground.box(W, 3, 200 + z0, P.grass, { at: [0, -3, (z0 - 200) / 2], jitter: false });
      ground.box(W, 3, 200 - z1, P.grass, { at: [0, -3, (z1 + 200) / 2], jitter: false });
      ground.box(W, 0.7, z1 - z0, 0x7a7458, { at: [0, -3, (z0 + z1) / 2], jitter: false });
      ground.box(W, 0.02, z1 - z0, 0x5f9bb0, { at: [0, -1.2, (z0 + z1) / 2], jitter: false, mat: 'glass' });
    } else {
      ground.box(W, 0.5, 400, P.grass, { at: [0, -0.5, 0], jitter: false });
    }
    // the path you walk along, in front of the row
    ground.box(total + 40, 0.05, 3.6, P.gravel, { at: [0, 0, front + 5], jitter: false });

    builts.forEach((b, i) => {
      const w = widths[i];
      const cx = x + w / 2;
      b.object.position.set(cx - (b.bounds.isEmpty() ? 0 : (b.bounds.max.x + b.bounds.min.x) / 2), 0, 0);
      const ox = b.object.position.x;
      b.object.traverse((o) => (o.userData.stageIndex = i));
      this.group.add(b.object);
      const from = lineage.stages[i].from;
      // a band of the era's colour under each building: the street doubles as a timeline
      ground.box(w + gap, 0.07, 1.3, eraColour(from), { at: [cx, 0, front + 8.2], jitter: false });
      if (bridgeLike) {
        ground.box(5, 0.05, front + 5 - 13, P.gravel, { at: [ox, 0, (front + 5 + 13) / 2], jitter: false });
        ground.box(5, 0.05, 30, P.gravel, { at: [ox, 0, -28], jitter: false });
      }
      const origin = { x: ox, z: 0, rotY: 0 };
      this.cols.push(...b.colliders.map((c) => toWorld(c, origin)));
      this.dks.push(...b.decks.map((d) => toWorld(d, origin)));
      // the date tag floats over the building, where the timeline panel cannot hide it
      const top = b.bounds.isEmpty() ? 5 : Math.min(b.bounds.max.y, 24);
      this.items.push({ stageIndex: i, built: b, x: cx, width: w, label: new THREE.Vector3(cx, top + 2.5, 0) });
      x += w + gap;
    });

    // a line of trees behind, so the row does not float in an empty field
    const back = this.river && this.river[0] < -pd / 2 ? this.river[0] - 14 : -pd / 2 - 16;
    for (let tx = -total / 2 - 30; tx < total / 2 + 30; tx += 11) {
      ground.tree(ground.range(9, 15), { at: [tx + ground.range(-3, 3), 0, back - ground.range(0, 22)], kind: ground.chance(0.2) ? 'conifer' : 'round' });
    }
    const g = ground.finish().object;
    g.traverse((o) => {
      (o as THREE.Mesh).castShadow = true;
      o.userData.ground = true;
    });
    this.group.add(g);
    this.radius = total / 2 + 30;
    this.maxDistance = Math.max(160, total * 0.9);
    this.group.visible = true;
  }

  close() {
    for (const child of [...this.group.children]) {
      child.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      this.group.remove(child);
    }
    this.items = [];
    this.cols = [];
    this.dks = [];
    this.lineage = null;
    this.group.visible = false;
  }

  /** The item standing at `year` (the last stage that had started). */
  itemAt(year: number): StreetItem | null {
    if (!this.lineage) return null;
    let found: StreetItem | null = null;
    for (const it of this.items) if (year >= this.lineage.stages[it.stageIndex].from) found = it;
    return found ?? this.items[0] ?? null;
  }

  groundHeight(x: number, z: number): number {
    let h = 0;
    if (this.river && z > this.river[0] + 0.5 && z < this.river[1] - 0.5) h = -2.2;
    for (const d of this.dks) h = Math.max(h, deckHeightAt(d, x, z));
    return h;
  }

  colliders(): readonly WorldCollider[] {
    return this.cols;
  }

  pick(raycaster: THREE.Raycaster): number | null {
    const hits = raycaster.intersectObjects(this.group.children, true);
    for (const h of hits) {
      if (h.object.userData.ground) return null;
      if (typeof h.object.userData.stageIndex === 'number') return h.object.userData.stageIndex;
    }
    return null;
  }
}
