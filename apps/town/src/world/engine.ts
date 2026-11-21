import * as THREE from 'three';
import england from '@ah/england';
import { Navigator, TimeScale, createStage, formatYear, type Stage3D, type Walkable } from '@ah/engine';
import type { BuildingDef, Lineage } from '@ah/kit';
import { useApp } from '../state';
import { WORLD_CENTRE, WORLD_RADIUS, baseHeight } from './layout';
import { Scenery } from './scenery';
import { Street } from './street';
import { Terrain } from './terrain';
import { Town, deckHeightAt, type PlotState } from './town';

export const region = england;
export const timeScale = new TimeScale(region.eras);
/** Seconds for the whole story at speed 1. */
const FULL_RUN = 150;

const _p = new THREE.Vector3();

/** What is standing on a plot at a year, with the years it stands there. */
export function describePlot(plotId: string, year: number) {
  const eng = Engine.instance;
  const p = eng?.town.get(plotId);
  if (!eng || !p) return null;
  const st = eng.town.stageAt(p, year);
  return { plot: p, stage: st };
}

/**
 * Owns the 3D world and keeps it in step with the app state: the year, the camera mode, the
 * selection and whether we are in the town or on a lineage street.
 */
export class Engine {
  static instance: Engine | null = null;
  readonly stage: Stage3D;
  readonly nav: Navigator;
  readonly town: Town;
  readonly terrain: Terrain;
  readonly scenery: Scenery;
  readonly street = new Street();
  private townWorld: Walkable;
  private raycaster = new THREE.Raycaster();
  private last = performance.now();
  private raf = 0;
  private first = true;
  private ring: THREE.Mesh;
  private unsub: () => void;
  private callouts: { el: HTMLElement; world: THREE.Vector3 }[] = [];
  private calloutKey = '';
  private labels: { el: HTMLElement; world: THREE.Vector3; stageIndex: number }[] = [];
  private plotLabels: { el: HTMLElement; plot: PlotState; world: THREE.Vector3 }[] = [];
  private savedOrbit: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private elapsed = 0;
  private hoverPlot: string | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private overlay: HTMLElement,
  ) {
    Engine.instance = this;
    const touch = useApp.getState().touch;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    // ?q=low is for weak devices (and software renderers): no shadows, fewer trees
    const low = new URLSearchParams(location.search).get('q') === 'low';
    this.stage = createStage({
      canvas,
      shadowExtent: 250,
      shadowMapSize: touch ? 2048 : 4096,
      shadows: !low,
      maxPixelRatio: low ? 1 : touch ? 1.5 : 2,
    });
    const { scene, camera } = this.stage;

    this.terrain = new Terrain();
    this.town = new Town(region);
    this.scenery = new Scenery(region, { treeCount: low ? 500 : touch || small ? 1100 : 2200 });
    scene.add(this.terrain.group, this.town.group, this.scenery.group, this.street.group);

    const town = this.town;
    this.townWorld = {
      centre: new THREE.Vector3(WORLD_CENTRE.x, 0, WORLD_CENTRE.z),
      radius: WORLD_RADIUS,
      minDistance: 12,
      maxDistance: 620,
      groundHeight(x, z) {
        let h = baseHeight(x, z);
        for (const d of town.decks()) h = Math.max(h, deckHeightAt(d, x, z));
        return h;
      },
      colliders: () => town.colliders(),
    };

    this.nav = new Navigator(camera, canvas, () => (useApp.getState().street ? this.street : this.townWorld));
    this.nav.setOrbit(new THREE.Vector3(0, 4, 18), 215, 0.62, 0.98);
    this.nav.onPick = (ndc) => this.pick(ndc);
    this.nav.onHover = (ndc) => this.hover(ndc);
    this.nav.onLockChange = (locked) => useApp.setState({ locked });
    this.nav.onKey = (e) => this.key(e);

    // selection ring
    const ringGeo = new THREE.RingGeometry(0.94, 1, 72);
    ringGeo.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false }),
    );
    this.ring.visible = false;
    this.ring.renderOrder = 5;
    scene.add(this.ring);

    // a name tag over each of the principal plots, so it is clear what can be clicked
    for (const p of this.town.plots) {
      if (!p.plot.hero) continue;
      const el = document.createElement('button');
      el.className = 'plot-label';
      el.textContent = p.lineage.name.replace(/^The /, '');
      el.addEventListener('click', () => {
        useApp.setState({ intro: false });
        useApp.getState().select(p.plot.id, true);
      });
      this.overlay.appendChild(el);
      this.plotLabels.push({ el, plot: p, world: new THREE.Vector3() });
    }

    this.town.onSwap = (p) => {
      if (p.plot.id === useApp.getState().selected) this.calloutKey = '';
    };

    this.unsub = useApp.subscribe((s, prev) => {
      if (s.mode !== prev.mode) this.nav.setMode(s.mode);
      if (s.street !== prev.street) this.switchView(s.street, prev.street);
      if (s.focusTick !== prev.focusTick) this.focusSelection();
      if (s.selected !== prev.selected) this.calloutKey = '';
      if (s.intro !== prev.intro) this.nav.orbit.autoRotate = s.intro;
    });
    this.nav.orbit.autoRotate = useApp.getState().intro;
    this.nav.orbit.autoRotateSpeed = 0.35;

    window.addEventListener('resize', this.onResize);
    this.loop();
    useApp.setState({ ready: true });
  }

  private onResize = () => this.stage.resize();

  // ------------------------------------------------------------------ input

  private key(e: KeyboardEvent) {
    const s = useApp.getState();
    switch (e.code) {
      case 'Digit1':
        useApp.setState({ mode: 'orbit' });
        break;
      case 'Digit2':
        useApp.setState({ mode: 'walk', intro: false });
        break;
      case 'Digit3':
        useApp.setState({ mode: 'drone', intro: false });
        break;
      case 'KeyP':
        s.togglePlay();
        break;
      case 'Space':
        if (s.mode === 'orbit') {
          e.preventDefault();
          s.togglePlay();
        }
        break;
      case 'KeyL': {
        if (s.street) s.closeStreet();
        else if (s.selected) {
          const p = this.town.get(s.selected);
          if (p) s.openStreet(p.plot.id, p.lineage.id);
        }
        break;
      }
      case 'Escape':
        if (s.helpOpen) useApp.setState({ helpOpen: false });
        else if (!this.nav.isLocked && s.selected && !s.street) s.select(null);
        break;
      case 'KeyH':
      case 'Slash':
        useApp.setState({ helpOpen: !s.helpOpen });
        break;
      case 'BracketLeft':
      case 'BracketRight': {
        const t = timeScale.toT(s.year) + (e.code === 'BracketRight' ? 1 : -1) * (e.shiftKey ? 0.02 : 0.004);
        useApp.setState({ year: Math.round(timeScale.toYear(t)), playing: false, intro: false });
        break;
      }
      case 'PageDown':
      case 'PageUp': {
        e.preventDefault();
        const i = timeScale.eraIndex(s.year) + (e.code === 'PageDown' ? 1 : -1);
        const era = region.eras[Math.max(0, Math.min(region.eras.length - 1, i))];
        s.jumpTo(era.from);
        break;
      }
    }
  }

  private pick(ndc: THREE.Vector2 | null) {
    const s = useApp.getState();
    if (s.intro) useApp.setState({ intro: false });
    this.nav.pickRay(ndc, this.raycaster);
    if (s.street) {
      const i = this.street.pick(this.raycaster);
      if (i !== null && this.street.lineage) this.gotoStreetStage(i);
      return;
    }
    const hit = this.town.pick(this.raycaster);
    if (hit) s.select(hit.plot.id, s.mode === 'orbit');
    else if (s.mode === 'orbit') s.select(null);
  }

  private hover(ndc: THREE.Vector2 | null) {
    const s = useApp.getState();
    let id: string | null = null;
    if (ndc && s.mode === 'orbit') {
      this.nav.pickRay(ndc, this.raycaster);
      if (s.street) id = this.street.pick(this.raycaster) !== null ? 'street' : null;
      else id = this.town.pick(this.raycaster)?.plot.id ?? null;
    }
    if (id !== this.hoverPlot) {
      this.hoverPlot = id;
      this.canvas.style.cursor = id ? 'pointer' : '';
    }
  }

  /** On the lineage street: move time to a stage and look at it. */
  gotoStreetStage(stageIndex: number) {
    const lin = this.street.lineage;
    if (!lin) return;
    const from = lin.stages[stageIndex].from;
    useApp.getState().jumpTo(from);
    const it = this.street.items[stageIndex];
    if (it && this.nav.mode === 'orbit') this.flyToItem(it.x, it.built.bounds, false);
  }

  private flyToItem(x: number, bounds: THREE.Box3, instant: boolean) {
    const size = bounds.isEmpty() ? new THREE.Vector3(12, 6, 12) : bounds.getSize(new THREE.Vector3());
    const target = new THREE.Vector3(x, Math.min(size.y * 0.4, 9), 0);
    const dist = Math.max(26, Math.hypot(size.x, size.z) * 0.95 + size.y * 0.9);
    if (instant) this.nav.setOrbit(target, dist, 0.5, 1.12);
    else this.nav.flyTo(target, dist);
  }

  private focusSelection() {
    const s = useApp.getState();
    if (s.street || !s.selected || this.nav.mode !== 'orbit') return;
    const p = this.town.get(s.selected);
    if (!p) return;
    const f = this.town.focus(p);
    this.nav.flyTo(f.centre, Math.max(34, f.radius * 2.7));
  }

  // ------------------------------------------------------------------ town <-> street

  private switchView(street: { lineageId: string; plotId: string } | null, prev: { lineageId: string; plotId: string } | null) {
    const { scene } = this.stage;
    for (const l of this.labels) l.el.remove();
    this.labels = [];
    this.calloutKey = '';
    if (street) {
      const p = this.town.get(street.plotId);
      const lineage = region.lineages.find((l) => l.id === street.lineageId);
      if (!lineage) return;
      if (!prev) this.savedOrbit = { pos: this.stage.camera.position.clone(), target: this.nav.orbit.target.clone() };
      this.street.open(lineage, p?.plot.seed ?? 1, p?.variant ?? 0, region.eras);
      this.town.group.visible = this.terrain.group.visible = this.scenery.group.visible = false;
      (scene.fog as THREE.Fog).near = 180;
      (scene.fog as THREE.Fog).far = 900;
      useApp.setState({ mode: 'orbit' });
      this.nav.setMode('orbit', { instant: true });
      this.nav.applyWorldLimits();
      const it = this.street.itemAt(useApp.getState().year);
      if (it) this.flyToItem(it.x, it.built.bounds, true);
      for (const item of this.street.items) {
        const def = lineage.stages[item.stageIndex].def;
        const el = document.createElement('button');
        el.className = 'street-label';
        el.innerHTML = `<span class="sl-date"></span><span class="sl-name"></span>`;
        (el.children[0] as HTMLElement).textContent = formatYear(lineage.stages[item.stageIndex].from);
        (el.children[1] as HTMLElement).textContent = def.name;
        el.addEventListener('click', () => this.gotoStreetStage(item.stageIndex));
        this.overlay.appendChild(el);
        this.labels.push({ el, world: item.label, stageIndex: item.stageIndex });
      }
    } else {
      this.street.close();
      this.town.group.visible = this.terrain.group.visible = this.scenery.group.visible = true;
      (scene.fog as THREE.Fog).near = 260;
      (scene.fog as THREE.Fog).far = 1500;
      useApp.setState({ mode: 'orbit' });
      this.nav.setMode('orbit', { instant: true });
      this.nav.applyWorldLimits();
      if (this.savedOrbit) {
        this.stage.camera.position.copy(this.savedOrbit.pos);
        this.nav.orbit.target.copy(this.savedOrbit.target);
        this.nav.orbit.update();
      }
      this.town.setYear(useApp.getState().year, true);
    }
  }

  // ------------------------------------------------------------------ overlays

  private currentDef(): { def: BuildingDef; toWorld: (at: [number, number, number], out: THREE.Vector3) => THREE.Vector3; key: string } | null {
    const s = useApp.getState();
    if (s.street) {
      const it = this.street.itemAt(s.year);
      const lin = this.street.lineage;
      if (!it || !lin) return null;
      const ox = it.built.object.position.x;
      return {
        def: lin.stages[it.stageIndex].def,
        key: `street:${lin.id}:${it.stageIndex}`,
        toWorld: (at, out) => out.set(at[0] + ox, at[1], at[2]),
      };
    }
    if (!s.selected) return null;
    const p = this.town.get(s.selected);
    if (!p || p.shown < 0) return null;
    const def = p.lineage.stages[p.schedule[p.shown].index].def;
    return { def, key: `town:${p.plot.id}:${p.shown}`, toWorld: (at, out) => this.town.localToWorld(p, at, out) };
  }

  private syncCallouts() {
    const cur = this.currentDef();
    const key = cur?.key ?? '';
    if (key === this.calloutKey) return;
    this.calloutKey = key;
    for (const c of this.callouts) c.el.remove();
    this.callouts = [];
    if (!cur) return;
    cur.def.lookFor.forEach((f, i) => {
      if (!f.at) return;
      const el = document.createElement('button');
      el.className = 'callout';
      el.dataset.index = String(i);
      el.innerHTML = `<span class="callout-n">${i + 1}</span><span class="callout-t"></span>`;
      (el.children[1] as HTMLElement).textContent = f.label;
      el.addEventListener('pointerenter', () => useApp.setState({ hoverFeature: i }));
      el.addEventListener('pointerleave', () => useApp.setState({ hoverFeature: null }));
      el.addEventListener('click', () => useApp.setState({ hoverFeature: i }));
      this.overlay.appendChild(el);
      this.callouts.push({ el, world: cur.toWorld(f.at, new THREE.Vector3()) });
    });
  }

  private place(el: HTMLElement, world: THREE.Vector3, maxDist: number): boolean {
    const cam = this.stage.camera;
    _p.copy(world).project(cam);
    const dist = cam.position.distanceTo(world);
    const ok = _p.z > -1 && _p.z < 1 && Math.abs(_p.x) < 1.05 && Math.abs(_p.y) < 1.05 && dist < maxDist;
    if (!ok) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return false;
    }
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    el.style.display = '';
    el.style.transform = `translate(${((_p.x + 1) / 2) * w}px, ${((1 - _p.y) / 2) * h}px)`;
    return true;
  }

  private updateOverlays() {
    const s = useApp.getState();
    this.syncCallouts();
    for (const c of this.callouts) {
      this.place(c.el, c.world, 260);
      c.el.classList.toggle('hot', Number(c.el.dataset.index) === s.hoverFeature);
    }
    if (s.street) {
      const cur = this.street.itemAt(s.year);
      for (const l of this.labels) {
        this.place(l.el, l.world, 330);
        l.el.classList.toggle('current', cur?.stageIndex === l.stageIndex);
      }
    }
    // plot name tags: only from above, and only in the town
    const tags = !s.street && s.mode !== 'walk' && !this.nav.isLocked;
    for (const l of this.plotLabels) {
      const p = l.plot;
      if (!tags || !p.current) {
        if (l.el.style.display !== 'none') l.el.style.display = 'none';
        continue;
      }
      const top = p.current.bounds.isEmpty() ? 4 : Math.min(p.current.bounds.max.y, 26);
      const f = this.town.focus(p);
      l.world.set(f.centre.x, top + 3.5, f.centre.z);
      this.place(l.el, l.world, 520);
      l.el.classList.toggle('sel', s.selected === p.plot.id);
    }

    // selection ring
    let show = false;
    if (s.street) {
      const it = this.street.itemAt(s.year);
      if (it) {
        const b = it.built.bounds;
        const r = b.isEmpty() ? 8 : Math.hypot(b.max.x - b.min.x, b.max.z - b.min.z) / 2 + 1.5;
        this.ring.position.set(it.x, 0.14, b.isEmpty() ? 0 : (b.max.z + b.min.z) / 2);
        this.ring.scale.setScalar(r);
        show = true;
      }
    } else if (s.selected) {
      const p = this.town.get(s.selected);
      if (p) {
        const f = this.town.focus(p);
        this.ring.position.set(f.centre.x, 0.14, f.centre.z);
        this.ring.scale.setScalar(f.radius + 1.5);
        show = true;
      }
    }
    this.ring.visible = show;
    if (show) (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.3 * Math.sin(this.elapsed * 3);
  }

  // ------------------------------------------------------------------ frame

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.elapsed += dt;
    const s = useApp.getState();
    let year = s.year;

    if (s.playing) {
      const t = timeScale.toT(year) + (dt * s.speed) / FULL_RUN;
      year = timeScale.toYear(t);
      if (t >= 1) useApp.setState({ year: region.end, playing: false });
      else useApp.setState({ year });
    }

    const era = timeScale.era(year);
    if (!s.street) {
      this.terrain.setEra(era, year, this.first);
      this.scenery.setEra(era, year, this.first);
      this.town.setYear(year, this.first);
      this.terrain.update(dt);
      this.scenery.update(dt, this.elapsed);
      this.town.update(dt);
    }
    this.first = false;

    this.nav.update(dt);

    // keep the sun's shadow box centred on what the camera is looking at
    const cam = this.stage.camera;
    const focus = this.nav.mode === 'orbit' ? this.nav.orbit.target : cam.position;
    this.stage.setShadowCentre(Math.round(focus.x / 16) * 16, Math.round(focus.z / 16) * 16);

    this.updateOverlays();
    this.stage.renderer.render(this.stage.scene, cam);
  };

  /** Lineage info for the UI. */
  lineage(id: string): Lineage | undefined {
    return region.lineages.find((l) => l.id === id);
  }

  plotState(id: string): PlotState | undefined {
    return this.town.get(id);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.unsub();
    this.nav.dispose();
    this.stage.dispose();
    for (const c of this.callouts) c.el.remove();
    for (const l of this.labels) l.el.remove();
    for (const l of this.plotLabels) l.el.remove();
    if (Engine.instance === this) Engine.instance = null;
  }
}
