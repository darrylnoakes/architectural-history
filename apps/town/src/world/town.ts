import * as THREE from 'three';
import { construct, getRuinMaterials, placeCut, revisionYear, type Built, type Cut, type BuildingDef, type Deck, type Lineage, type Plot, type Region, type Stage } from '@ah/kit';
import { plotSchedule, scheduleAt, type PlotStage, type WorldCollider } from '@ah/engine';
import { Morph, diffBuilt } from './morph';

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
  /** The year of the building's latest revision in force (-Infinity as built). */
  rev: number;
  /** While one model is turning into the next: the pieces in motion, shown in place of `current`. */
  morph: Morph | null;
  phase: 'idle' | 'morph';
  t: number;
  /** Models already built, by schedule index, form (open or closed) and revision. */
  cache: Map<string, Built>;
  colliders: WorldCollider[];
  decks: WorldDeck[];
  variant: number;
  /** Height of the ground the plot stands on: 0 in the flat town, more for a castle on its hill. */
  base: number;
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
 * that should be standing takes the place of the last one piece by piece: what the two share stays
 * put, what is gone shrinks away and what is new grows in its place.
 */
export class Town {
  readonly group = new THREE.Group();
  readonly plots: PlotState[] = [];
  private byId = new Map<string, PlotState>();
  private year = NaN;
  private allColliders: WorldCollider[] = [];
  private allDecks: WorldDeck[] = [];
  private dirty = true;
  private openId: string | null = null;
  /** Goes up whenever a plot's building changes, so the ground can be dug again to suit. */
  cutsVersion = 0;
  /** Fired when the building on a plot changes (after the swap). */
  onSwap: ((p: PlotState) => void) | null = null;

  constructor(
    readonly region: Region,
    /** Height of the land, so that a plot on a hill stands on it rather than inside it. */
    ground: (x: number, z: number) => number = () => 0,
  ) {
    const variantCount = new Map<string, number>();
    for (const plot of region.plots) {
      const lineage = region.lineages.find((l) => l.id === plot.lineage);
      if (!lineage) continue;
      const n = variantCount.get(lineage.id) ?? 0;
      variantCount.set(lineage.id, n + 1);
      const holder = new THREE.Group();
      // (plots in the river bed, the bridges, stay at bank level)
      const h = ground(plot.x, plot.z);
      const base = h > 0.3 ? h : 0;
      holder.position.set(plot.x, base, plot.z);
      holder.rotation.y = plot.rotY;
      this.group.add(holder);
      const state: PlotState = {
        plot,
        lineage,
        schedule: plotSchedule(plot, lineage, region.end),
        holder,
        shown: -1,
        current: null,
        rev: -Infinity,
        morph: null,
        phase: 'idle',
        t: 0,
        cache: new Map(),
        colliders: [],
        decks: [],
        variant: plot.hero ? 0 : n,
        base,
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

  /**
   * `open` builds the cut-away form of a building that has one (cached beside the closed form, half
   * an index along).
   */
  private build(p: PlotState, i: number, open = false, rev = -Infinity): Built {
    const key = `${i}|${open ? 1 : 0}|${rev}`;
    let b = p.cache.get(key);
    if (!b) {
      const def = p.lineage.stages[p.schedule[i].index].def;
      try {
        b = construct(def, p.plot.seed, p.variant, open, rev);
      } catch (err) {
        console.error(`Failed to build ${def.id}`, err);
        b = { object: new THREE.Group(), parts: [], bounds: new THREE.Box3(), colliders: [], decks: [], cuts: [], triangles: 0, hasCutaway: false };
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
      p.cache.set(key, b);
    }
    return b;
  }

  /**
   * In the townscape every building is whole. The selected one is opened up if it has an inside to
   * show (a theatre's roof comes off), and closed again when the selection moves on.
   */
  setOpen(plotId: string | null) {
    if (plotId === this.openId) return;
    const was = this.openId ? this.byId.get(this.openId) : undefined;
    this.openId = plotId;
    const now = plotId ? this.byId.get(plotId) : undefined;
    for (const p of [was, now]) if (p && p.current?.hasCutaway && p.phase === 'idle') this.change(p, p.shown, p.rev);
  }

  private trim(p: PlotState) {
    for (const [key, b] of p.cache) {
      if (b === p.current || Math.abs(parseInt(key, 10) - p.shown) <= 1) continue;
      b.object.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      p.cache.delete(key);
    }
  }

  /** What a plot should hold at a year: the schedule entry, and which of that building's revisions are in force. */
  private target(p: PlotState, year: number): { i: number; rev: number } {
    const i = scheduleAt(p.schedule, year);
    if (i < 0) return { i, rev: -Infinity };
    const e = p.schedule[i];
    // a ruin stays as the building was when it was wrecked
    return { i, rev: revisionYear(p.lineage.stages[e.index].def, e.state === 'ruin' ? e.from : year) };
  }

  /** The model for a schedule entry in the form to show: closed, or opened up if the plot is selected. */
  private form(p: PlotState, i: number, rev: number): Built | null {
    if (i < 0) return null;
    const b = this.build(p, i, false, rev);
    // the closed form says whether there is an open one; a ruin is open to the sky already
    return b.hasCutaway && p.plot.id === this.openId && p.schedule[i].state !== 'ruin' ? this.build(p, i, true, rev) : b;
  }

  private endMorph(p: PlotState) {
    if (p.morph) {
      p.holder.remove(p.morph.group);
      p.morph.dispose();
      p.morph = null;
    }
    if (p.current) p.current.object.visible = true;
    p.phase = 'idle';
  }

  /**
   * Put a different model on a plot, turning the one that stands there into it piece by piece: a new
   * stage, a revision of the same building, or the same building opened up.
   */
  private change(p: PlotState, i: number, rev: number) {
    const prev = p.current;
    const next = this.form(p, i, rev);
    const morph = prev !== next ? new Morph(prev, next, diffBuilt(prev, next)) : null;
    this.place(p, i, rev);
    if (!morph || morph.idle) return morph?.dispose();
    // the pieces in motion stand in for the new model until they have settled
    p.morph = morph;
    p.holder.add(morph.group);
    morph.group.traverse((o) => (o.userData.plotId = p.plot.id));
    if (p.current) p.current.object.visible = false;
    p.phase = 'morph';
    p.t = 0;
  }

  private place(p: PlotState, i: number, rev = -Infinity) {
    this.endMorph(p);
    if (p.current) p.holder.remove(p.current.object);
    p.shown = i;
    p.rev = rev;
    p.current = this.form(p, i, rev);
    if (p.current) {
      p.current.object.scale.set(1, 1, 1);
      p.current.object.position.y = 0;
      p.holder.add(p.current.object);
      p.colliders = p.current.colliders.map((c) => toWorld(c, p.plot));
      p.decks = p.current.decks.map((d) => {
        const w = toWorld(d, p.plot);
        return p.base ? { ...w, y: w.y + p.base, yEnds: w.yEnds === undefined ? undefined : w.yEnds + p.base } : w;
      });
    } else {
      p.colliders = [];
      p.decks = [];
    }
    this.dirty = true;
    this.cutsVersion++;
    this.trim(p);
    this.onSwap?.(p);
  }

  /** Move the town to a year. `instant` skips the rebuild animation (first frame, big jumps). */
  setYear(year: number, instant = false) {
    this.year = year;
    for (const p of this.plots) {
      const { i, rev } = this.target(p, year);
      const same = i === p.shown && rev === p.rev;
      if (instant) {
        if (!same) this.place(p, i, rev);
        else this.endMorph(p);
      } else if (!same && p.phase === 'idle') this.change(p, i, rev);
    }
  }

  update(dt: number) {
    let built = false;
    for (const p of this.plots) {
      if (p.phase !== 'morph' || !p.morph) continue;
      p.t += dt;
      if (!p.morph.update(p.t)) continue;
      this.endMorph(p);
      // time may have moved on while the pieces were moving
      const { i, rev } = this.target(p, this.year);
      if (i !== p.shown || rev !== p.rev) {
        this.change(p, i, rev);
        built = true;
      }
    }
    // spread construction cost: quietly prepare one upcoming building per frame
    if (!built) {
      for (const p of this.plots) {
        const next = p.shown + 1;
        if (next >= p.schedule.length || p.schedule[next].from - this.year >= 60) continue;
        const e = p.schedule[next];
        const rev = revisionYear(p.lineage.stages[e.index].def, e.from);
        if (!p.cache.has(`${next}|0|${rev}`)) {
          this.build(p, next, false, rev);
          break;
        }
      }
    }
  }

  dispose() {
    for (const p of this.plots) {
      for (const b of p.cache.values()) b.object.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      p.cache.clear();
    }
  }

  /** Everything the standing buildings dig out of the ground, in world space. */
  cuts(): Cut[] {
    return this.plots.flatMap((p) => (p.current ? p.current.cuts.map((c) => placeCut(c, p.plot)) : []));
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
    // (a model whose pieces are still moving is picked through the pieces)
    const hits = raycaster.intersectObjects(
      this.plots.filter((p) => p.current || p.morph).map((p) => (p.morph ? p.morph.group : p.current!.object)),
      true,
    );
    if (!hits.length) return null;
    return this.byId.get(hits[0].object.userData.plotId) ?? null;
  }

  /** World-space centre and size of what stands on a plot, for framing the camera. */
  focus(p: PlotState): { centre: THREE.Vector3; radius: number } {
    const centre = new THREE.Vector3(p.plot.x, p.base, p.plot.z);
    let radius = Math.max(p.lineage.plotSize[0], p.lineage.plotSize[1]) * 0.6;
    if (p.current && !p.current.bounds.isEmpty()) {
      const c = p.current.bounds.getCenter(new THREE.Vector3());
      const s = p.current.bounds.getSize(new THREE.Vector3());
      c.applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.plot.rotY);
      centre.set(p.plot.x + c.x, p.base + Math.min(s.y * 0.4, 9), p.plot.z + c.z);
      radius = Math.max(8, Math.hypot(s.x, s.z) * 0.5, s.y * 0.6);
    }
    return { centre, radius };
  }

  /** A building-local point in world space. */
  localToWorld(p: PlotState, at: [number, number, number], out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(at[0], at[1], at[2]).applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.plot.rotY).add(p.holder.position);
  }
}
