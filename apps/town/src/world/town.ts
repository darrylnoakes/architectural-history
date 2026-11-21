import * as THREE from 'three';
import { construct, getRuinMaterials, type Built, type BuildingDef, type Deck, type Lineage, type Plot, type Region, type Stage } from '@ah/kit';
import { plotSchedule, scheduleAt, type PlotStage, type WorldCollider } from '@ah/engine';

export interface WorldDeck extends Deck {}

export type PlotStatus =
  | { kind: 'standing' | 'ruin'; entry: PlotStage; scheduleIndex: number; stage: Stage; def: BuildingDef }
  /** Open ground. `before` and `after` are schedule indices of what stood here last and what comes next (-1 if none). */
  | { kind: 'open'; before: number; after: number };

export interface PlotState {
  plot: Plot;
  lineage: Lineage;
  schedule: PlotStage[];
  holder: THREE.Group;
  /** Index into `schedule` of the building standing now, or -1. */
  shown: number;
  current: Built | null;
  phase: 'idle' | 'out' | 'in';
  t: number;
  cache: Map<number, Built>;
  colliders: WorldCollider[];
  decks: WorldDeck[];
  variant: number;
}

function easeOutBack(t: number) {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Turn a building-local collider or deck into world space for a plot. */
export function toWorld<T extends { x: number; z: number; rotY: number }>(item: T, plot: { x: number; z: number; rotY: number }): T {
  const cos = Math.cos(plot.rotY);
  const sin = Math.sin(plot.rotY);
  return {
    ...item,
    x: plot.x + item.x * cos + item.z * sin,
    z: plot.z - item.x * sin + item.z * cos,
    rotY: plot.rotY + item.rotY,
  };
}

/** Height of a deck at a world position, or -Infinity if (x, z) is not over it. */
export function deckHeightAt(d: WorldDeck, x: number, z: number): number {
  const dx = x - d.x;
  const dz = z - d.z;
  const cos = Math.cos(d.rotY);
  const sin = Math.sin(d.rotY);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  if (Math.abs(lx) > d.w / 2 || Math.abs(lz) > d.d / 2) return -Infinity;
  if (d.yEnds === undefined) return d.y;
  const u = lz / (d.d / 2);
  return d.yEnds + (d.y - d.yEnds) * (1 - u * u);
}

/**
 * The buildings of the town. Each plot owns a schedule of stages; as the year moves, the building
 * that should be standing is swapped in with a short sink-and-rise so the change is visible.
 */
export class Town {
  readonly group = new THREE.Group();
  readonly plots: PlotState[] = [];
  private byId = new Map<string, PlotState>();
  private year = NaN;
  private allColliders: WorldCollider[] = [];
  private allDecks: WorldDeck[] = [];
  private dirty = true;
  /** Fired when the building on a plot changes (after the swap). */
  onSwap: ((p: PlotState) => void) | null = null;

  constructor(readonly region: Region) {
    const variantCount = new Map<string, number>();
    for (const plot of region.plots) {
      const lineage = region.lineages.find((l) => l.id === plot.lineage);
      if (!lineage) continue;
      const n = variantCount.get(lineage.id) ?? 0;
      variantCount.set(lineage.id, n + 1);
      const holder = new THREE.Group();
      holder.position.set(plot.x, 0, plot.z);
      holder.rotation.y = plot.rotY;
      this.group.add(holder);
      const state: PlotState = {
        plot,
        lineage,
        schedule: plotSchedule(plot, lineage, region.end),
        holder,
        shown: -1,
        current: null,
        phase: 'idle',
        t: 0,
        cache: new Map(),
        colliders: [],
        decks: [],
        variant: plot.hero ? 0 : n,
      };
      this.plots.push(state);
      this.byId.set(plot.id, state);
    }
  }

  get(id: string): PlotState | undefined {
    return this.byId.get(id);
  }

  /** What a plot holds at a year: a building in use, a ruin, or open ground (with what came before and after). */
  status(p: PlotState, year: number): PlotStatus {
    const i = scheduleAt(p.schedule, year);
    if (i >= 0) {
      const entry = p.schedule[i];
      const stage = p.lineage.stages[entry.index];
      return { kind: entry.state, entry, scheduleIndex: i, stage, def: stage.def };
    }
    let before = -1;
    for (let k = 0; k < p.schedule.length; k++) if (p.schedule[k].to <= year) before = k;
    const after = p.schedule.findIndex((e) => e.from > year);
    return { kind: 'open', before, after };
  }

  /** Display name of a schedule entry. */
  entryName(p: PlotState, k: number): string {
    const e = p.schedule[k];
    const name = p.lineage.stages[e.index].def.name;
    return e.state === 'ruin' ? `${name} (in ruins)` : name;
  }

  private build(p: PlotState, i: number): Built {
    let b = p.cache.get(i);
    if (!b) {
      const def = p.lineage.stages[p.schedule[i].index].def;
      try {
        b = construct(def, p.plot.seed, p.variant);
      } catch (err) {
        console.error(`Failed to build ${def.id}`, err);
        b = { object: new THREE.Group(), bounds: new THREE.Box3(), colliders: [], decks: [], triangles: 0 };
      }
      const ruin = p.schedule[i].state === 'ruin' ? getRuinMaterials() : null;
      b.object.traverse((o) => {
        o.userData.plotId = p.plot.id;
        const mesh = o as THREE.Mesh;
        if (ruin && mesh.isMesh) {
          mesh.material = ruin.surface;
          mesh.customDepthMaterial = ruin.depth;
        }
      });
      // nobody walks along the top of a ruin
      if (ruin) b.decks = [];
      p.cache.set(i, b);
    }
    return b;
  }

  private trim(p: PlotState) {
    for (const [i, b] of p.cache) {
      if (Math.abs(i - p.shown) <= 1) continue;
      b.object.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      p.cache.delete(i);
    }
  }

  private place(p: PlotState, i: number) {
    if (p.current) p.holder.remove(p.current.object);
    p.shown = i;
    p.current = i >= 0 ? this.build(p, i) : null;
    if (p.current) {
      p.current.object.scale.set(1, 1, 1);
      p.current.object.position.y = 0;
      p.holder.add(p.current.object);
      p.colliders = p.current.colliders.map((c) => toWorld(c, p.plot));
      p.decks = p.current.decks.map((d) => toWorld(d, p.plot));
    } else {
      p.colliders = [];
      p.decks = [];
    }
    this.dirty = true;
    this.trim(p);
    this.onSwap?.(p);
  }

  /** Move the town to a year. `instant` skips the rebuild animation (first frame, big jumps). */
  setYear(year: number, instant = false) {
    this.year = year;
    for (const p of this.plots) {
      const want = scheduleAt(p.schedule, year);
      if (instant) {
        p.phase = 'idle';
        if (want !== p.shown) this.place(p, want);
        else if (p.current) p.current.object.scale.set(1, 1, 1);
        continue;
      }
      if (want !== p.shown && p.phase === 'idle') {
        if (p.current) {
          p.phase = 'out';
          p.t = 0;
        } else {
          this.place(p, want);
          p.phase = 'in';
          p.t = 0;
          const placed = p.current as Built | null;
          if (placed) placed.object.scale.y = 0.001;
        }
      }
    }
  }

  update(dt: number) {
    let built = false;
    for (const p of this.plots) {
      if (p.phase === 'out' && p.current) {
        p.t += dt / 0.3;
        const k = Math.min(1, p.t);
        p.current.object.scale.y = Math.max(0.001, 1 - k * k);
        if (k >= 1) {
          this.place(p, scheduleAt(p.schedule, this.year));
          built = true;
          if (p.current) {
            p.current.object.scale.y = 0.001;
            p.phase = 'in';
            p.t = 0;
          } else p.phase = 'idle';
        }
      } else if (p.phase === 'in' && p.current) {
        p.t += dt / 0.55;
        const k = Math.min(1, p.t);
        p.current.object.scale.y = Math.max(0.001, easeOutBack(k));
        if (k >= 1) {
          p.current.object.scale.y = 1;
          p.phase = 'idle';
          // time may have moved on while we were animating
          if (scheduleAt(p.schedule, this.year) !== p.shown) {
            p.phase = 'out';
            p.t = 0;
          }
        }
      }
    }
    // spread construction cost: quietly prepare one upcoming building per frame
    if (!built) {
      for (const p of this.plots) {
        const next = p.shown + 1;
        if (next < p.schedule.length && !p.cache.has(next) && p.schedule[next].from - this.year < 60) {
          this.build(p, next);
          break;
        }
      }
    }
  }

  colliders(): readonly WorldCollider[] {
    this.refresh();
    return this.allColliders;
  }

  decks(): readonly WorldDeck[] {
    this.refresh();
    return this.allDecks;
  }

  private refresh() {
    if (!this.dirty) return;
    this.dirty = false;
    this.allColliders = this.plots.flatMap((p) => p.colliders);
    this.allDecks = this.plots.flatMap((p) => p.decks);
  }

  pick(raycaster: THREE.Raycaster): PlotState | null {
    const hits = raycaster.intersectObjects(
      this.plots.filter((p) => p.current).map((p) => p.current!.object),
      true,
    );
    if (!hits.length) return null;
    return this.byId.get(hits[0].object.userData.plotId) ?? null;
  }

  /** World-space centre and size of what stands on a plot, for framing the camera. */
  focus(p: PlotState): { centre: THREE.Vector3; radius: number } {
    const centre = new THREE.Vector3(p.plot.x, 0, p.plot.z);
    let radius = Math.max(p.lineage.plotSize[0], p.lineage.plotSize[1]) * 0.6;
    if (p.current && !p.current.bounds.isEmpty()) {
      const c = p.current.bounds.getCenter(new THREE.Vector3());
      const s = p.current.bounds.getSize(new THREE.Vector3());
      c.applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.plot.rotY);
      centre.set(p.plot.x + c.x, Math.min(s.y * 0.4, 9), p.plot.z + c.z);
      radius = Math.max(8, Math.hypot(s.x, s.z) * 0.5, s.y * 0.6);
    }
    return { centre, radius };
  }

  /** A building-local point in world space. */
  localToWorld(p: PlotState, at: [number, number, number], out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(at[0], at[1], at[2]).applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.plot.rotY).add(p.holder.position);
  }
}
