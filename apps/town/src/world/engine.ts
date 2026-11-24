import * as THREE from 'three';
import { Navigator, createStage, formatYear, type Stage3D, type TimeScale, type Walkable } from '@ah/engine';
import type { BuildingDef, Lineage, Region } from '@ah/kit';
import { REGIONS, scaleOf } from '../regions';
import { useApp } from '../state';
import { activeTimeline } from '../timeline';
import { Land } from './land';
import { Scenery } from './scenery';
import { Street } from './street';
import { Terrain } from './terrain';
import { Town, deckHeightAt, type PlotState } from './town';

/** Seconds for the whole story at speed 1. */
const FULL_RUN = 150;
/** A drag faster than this (in whole timelines a second) is a jump, not a search: the town waits for it. */
const SCRUB_HOLD = 0.06;

const _p = new THREE.Vector3();
/** Marks the feature pins as needing a rebuild (distinct from '', which means there are none to show). */
const STALE = '\u0000stale';

/**
 * Owns the 3D world and keeps it in step with the app state: the year, the camera mode, the
 * selection and whether we are in the town or on a lineage street.
 */
export class Engine {
  static instance: Engine | null = null;
  readonly stage: Stage3D;
  readonly nav: Navigator;
  region!: Region;
  timeScale!: TimeScale;
  land!: Land;
  town!: Town;
  terrain!: Terrain;
  scenery!: Scenery;
  readonly street = new Street();
  private townWorld!: Walkable;
  private treeCount: number;
  private low = false;
  /** Frames and seconds counted towards the next reading of the frame rate. */
  private fps = { frames: 0, time: 0, warm: 0, bad: 0 };
  /** Where the camera was when the last engine was shut down, so a change of quality does not move it. */
  private static lastView: { region: string; pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private raycaster = new THREE.Raycaster();
  private last = performance.now();
  private raf = 0;
  private first = true;
  private cutsKey = '';
  /** The year the town is showing. It lags the timeline while the year is being dragged quickly. */
  private worldYear = NaN;
  private lastT = NaN;
  private scrubSpeed = 0;
  private ring: THREE.Mesh;
  private unsub: () => void;
  private callouts: { el: HTMLElement; world: THREE.Vector3 }[] = [];
  private calloutKey = STALE;
  private labels: { el: HTMLElement; world: THREE.Vector3; stageIndex: number }[] = [];
  private plotLabels: { el: HTMLElement; plot: PlotState; world: THREE.Vector3 }[] = [];
  private savedOrbit: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private elapsed = 0;
  private hoverPlot: string | null = null;
  private streetIndex = -1;
  /** The part of the screen not covered by panels, in CSS pixels. */
  private free = { x: 0, y: 0, w: 1, h: 1 };
  /** How far the picture is currently shifted so its centre sits in the middle of that free area. */
  private shift = new THREE.Vector2();
  private frame = 0;
  /** Frames to wait before flying to the selection, so its card is on screen and measured first. */
  private focusPending = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private overlay: HTMLElement,
  ) {
    Engine.instance = this;
    const touch = useApp.getState().touch;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    // low quality is for weak devices (and software renderers): no shadows, fewer trees
    const low = useApp.getState().quality === 'low';
    this.low = low;
    this.stage = createStage({
      canvas,
      shadowExtent: 250,
      shadowMapSize: touch ? 2048 : 4096,
      shadows: !low,
      maxPixelRatio: low ? 1 : touch ? 1.5 : 2,
    });
    const { scene, camera } = this.stage;
    this.treeCount = low ? 500 : touch || small ? 1100 : 2200;
    scene.add(this.street.group);

    this.buildWorld(REGIONS[useApp.getState().regionId] ?? Object.values(REGIONS)[0]);
    this.nav = new Navigator(camera, canvas, () => (useApp.getState().street ? this.street : this.townWorld));
    this.frameRegion();
    const v = Engine.lastView;
    if (v && v.region === this.region.id) {
      camera.position.copy(v.pos);
      this.nav.orbit.target.copy(v.target);
      this.nav.orbit.update();
    }
    Engine.lastView = null;
    this.nav.onPick = (ndc) => this.pick(ndc);
    this.nav.onHover = (ndc) => this.hover(ndc);
    this.nav.onLockChange = (locked) => useApp.setState({ locked });
    this.nav.onKey = (e) => this.key(e);

    // selection ring
    const ringGeo = new THREE.RingGeometry(0.972, 1, 96);
    ringGeo.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false }),
    );
    this.ring.visible = false;
    this.ring.renderOrder = 5;
    scene.add(this.ring);

    this.unsub = useApp.subscribe((s, prev) => {
      if (s.regionId !== prev.regionId && REGIONS[s.regionId]) this.loadRegion(REGIONS[s.regionId]);
      if (s.mode !== prev.mode) this.nav.setMode(s.mode);
      if (s.street !== prev.street) this.switchView(s.street, prev.street);
      if (s.focusTick !== prev.focusTick) this.focusPending = 3;
      if (s.selected !== prev.selected) {
        this.town.setOpen(s.selected);
        this.calloutKey = STALE;
      }
      if (s.intro !== prev.intro) this.nav.orbit.autoRotate = s.intro;
    });
    this.nav.orbit.autoRotate = useApp.getState().intro;
    this.nav.orbit.autoRotateSpeed = 0.35;

    window.addEventListener('resize', this.onResize);
    this.loop();
    useApp.setState({ ready: true });
  }

  private onResize = () => this.stage.resize();

  /** Swap to another region's town. */
  private loadRegion(region: Region) {
    if (this.street.lineage) this.switchView(null, null);
    this.buildWorld(region);
    this.nav.setMode('orbit', { instant: true });
    this.nav.applyWorldLimits();
    this.frameRegion();
  }

  /** Put the camera where the region asks to be seen from first. */
  private frameRegion() {
    const v = this.region.site.view ?? { target: [0, 4, 0] as [number, number, number], distance: 215, azimuth: 0.62, polar: 0.98 };
    this.nav.setOrbit(new THREE.Vector3(...v.target), v.distance, v.azimuth, v.polar);
    this.savedOrbit = null;
  }

  /** Build a region's town, taking down whichever one was standing. */
  private buildWorld(region: Region) {
    const { scene } = this.stage;
    if (this.town) {
      scene.remove(this.terrain.group, this.town.group, this.scenery.group);
      this.terrain.dispose();
      this.town.dispose();
      this.scenery.dispose();
      for (const l of this.plotLabels) l.el.remove();
      this.plotLabels = [];
    }
    this.region = region;
    this.timeScale = scaleOf(region);
    this.land = new Land(region.site);
    this.worldYear = NaN;
    this.lastT = NaN;
    this.cutsKey = '';
    this.terrain = new Terrain(this.land);
    this.town = new Town(region, this.land.height);
    this.scenery = new Scenery(region, this.land, { treeCount: this.treeCount });
    scene.add(this.terrain.group, this.town.group, this.scenery.group);

    const town = this.town;
    const land = this.land;
    const scenery = this.scenery;
    this.townWorld = {
      centre: new THREE.Vector3(region.site.centre[0], 0, region.site.centre[1]),
      radius: region.site.radius,
      minDistance: 12,
      maxDistance: 620,
      groundHeight(x, z) {
        let h = land.height(x, z);
        for (const d of town.decks()) h = Math.max(h, deckHeightAt(d, x, z));
        return h;
      },
      colliders: () => {
        const extra = scenery.colliders();
        return extra.length ? [...town.colliders(), ...extra] : town.colliders();
      },
    };
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
      if (p.plot.id === useApp.getState().selected) this.calloutKey = STALE;
    };
    this.calloutKey = STALE;
    this.first = true;
  }

  // ------------------------------------------------------------------ input

  private key(e: KeyboardEvent) {
    const s = useApp.getState();
    if (s.screen.kind !== 'town' || s.regionsOpen || s.ideasOpen) {
      if (e.code === 'Escape') {
        if (s.regionsOpen || s.ideasOpen) useApp.setState({ regionsOpen: false, ideasOpen: false });
        else if (s.screen.kind === 'library') s.closeScreen();
        else s.openLibrary();
      }
      return;
    }
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
        const t = this.timeScale.toT(s.year) + (e.code === 'BracketRight' ? 1 : -1) * (e.shiftKey ? 0.02 : 0.004);
        useApp.setState({ year: Math.round(this.timeScale.toYear(t)), playing: false, intro: false });
        break;
      }
      case 'PageDown':
      case 'PageUp': {
        e.preventDefault();
        const i = this.timeScale.eraIndex(s.year) + (e.code === 'PageDown' ? 1 : -1);
        const era = this.region.eras[Math.max(0, Math.min(this.region.eras.length - 1, i))];
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
    // the frame loop notices the change of stage and moves the camera
    useApp.getState().jumpTo(lin.stages[stageIndex].from);
  }

  private flyToItem(x: number, bounds: THREE.Box3, instant: boolean) {
    const size = bounds.isEmpty() ? new THREE.Vector3(12, 6, 12) : bounds.getSize(new THREE.Vector3());
    const target = new THREE.Vector3(x, Math.min(size.y * 0.4, 9), 0);
    // far enough back to keep the neighbours either side in view: comparison is the point
    const dist = Math.max(46, Math.hypot(size.x, size.z) * 1.35 + size.y * 1.1) * this.fitScale();
    if (instant) this.nav.setOrbit(target, dist, 0.32, 1.16);
    else this.nav.flyTo(target, dist);
  }

  /**
   * Work out which part of the screen the panels leave clear. Wide panels (the phone's bottom
   * sheets, the timeline) take a band off the top or bottom; narrow ones take a strip off a side.
   */
  private measureFree() {
    const vw = this.canvas.clientWidth;
    const vh = this.canvas.clientHeight;
    let l = 0;
    let t = 0;
    let r = vw;
    let b = vh;
    for (const sel of ['.timeline', '.card', '.era', '.street-banner', '.intro', '.brand', '.touch']) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 2 || q.height < 2) continue;
      if (q.width > vw * 0.6) {
        if (q.top + q.height / 2 < vh / 2) t = Math.max(t, q.bottom);
        else b = Math.min(b, q.top);
      } else if (sel === '.card' || sel === '.era') {
        if (q.left + q.width / 2 < vw / 2) l = Math.max(l, q.right);
        else r = Math.min(r, q.left);
      } else if (vw < 820 && q.top < vh * 0.25) {
        // on a phone the title block and mode switch between them span the top
        t = Math.max(t, q.bottom);
      }
    }
    if (r - l < 140 || b - t < 140) {
      l = 0;
      t = 0;
      r = vw;
      b = vh;
    }
    this.free = { x: l, y: t, w: r - l, h: b - t };
  }

  /** How much further back the camera must stand for something to fit the free area rather than the whole screen. */
  private fitScale(): number {
    const vw = this.canvas.clientWidth || 1;
    const vh = this.canvas.clientHeight || 1;
    const aspect = vw / vh;
    // the full view is limited by its shorter side; so is the free area
    const full = Math.min(1, aspect);
    const clear = Math.min(this.free.h / vh, (this.free.w / vw) * aspect);
    return Math.min(3.2, Math.max(1, full / Math.max(0.05, clear)));
  }

  /** Slide the picture so the point the camera looks at lands in the middle of the free area. */
  private applyShift(dt: number) {
    const vw = this.canvas.clientWidth;
    const vh = this.canvas.clientHeight;
    const s = useApp.getState();
    // a first-person view on a desktop keeps its true centre: the aiming dot lives there
    const on = s.mode === 'orbit' || s.touch;
    const tx = on ? this.free.x + this.free.w / 2 - vw / 2 : 0;
    const ty = on ? this.free.y + this.free.h / 2 - vh / 2 : 0;
    const k = 1 - Math.exp(-7 * dt);
    this.shift.x += (tx - this.shift.x) * k;
    this.shift.y += (ty - this.shift.y) * k;
    const cam = this.stage.camera;
    if (Math.abs(this.shift.x) < 0.5 && Math.abs(this.shift.y) < 0.5) {
      if (cam.view?.enabled) cam.clearViewOffset();
    } else {
      cam.setViewOffset(vw, vh, -this.shift.x, -this.shift.y, vw, vh);
    }
  }

  private focusSelection() {
    const s = useApp.getState();
    if (s.street || !s.selected || this.nav.mode !== 'orbit') return;
    const p = this.town.get(s.selected);
    if (!p) return;
    const f = this.town.focus(p);
    this.nav.flyTo(f.centre, Math.max(34, f.radius * 2.7) * this.fitScale());
  }

  // ------------------------------------------------------------------ town <-> street

  private switchView(street: { lineageId: string; plotId: string } | null, prev: { lineageId: string; plotId: string } | null) {
    const { scene } = this.stage;
    const region = this.region;
    for (const l of this.labels) l.el.remove();
    this.labels = [];
    this.calloutKey = STALE;
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
      this.streetIndex = it?.stageIndex ?? -1;
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
    // a ruin keeps its card but not its feature pins: most of what they point at has fallen
    if (!p || p.shown < 0 || p.schedule[p.shown].state === 'ruin') return null;
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
      l.world.set(f.centre.x, p.base + top + 3.5, f.centre.z);
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
        this.ring.position.set(f.centre.x, p.base + 0.14, f.centre.z);
        this.ring.scale.setScalar(f.radius + 1.5);
        show = true;
      }
    }
    this.ring.visible = show;
    if (show) (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.55 + 0.25 * Math.sin(this.elapsed * 3);
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
      // the bar on screen sets the pace: it may span two regions when comparing
      const scale = activeTimeline(s).scale;
      const t = scale.toT(year) + (dt * s.speed) / FULL_RUN;
      year = scale.toYear(t);
      if (t >= 1) useApp.setState({ year: scale.end, playing: false });
      else useApp.setState({ year });
    }

    // a full-screen view (library, viewer, compare) covers the town: keep time running, draw nothing
    if (s.screen.kind !== 'town') return;

    // Dragging the year quickly across the bar would otherwise build and rebuild every plot once for
    // each period passed on the way. While the drag is fast the town holds still; it follows again
    // when the drag slows to a search, pauses, or ends, and goes straight to what stands then.
    const tt = this.timeScale.toT(year);
    const v = Number.isNaN(this.lastT) ? 0 : Math.abs(tt - this.lastT) / Math.max(dt, 0.004);
    this.lastT = tt;
    this.scrubSpeed = Math.min(0.3, Math.max(v, this.scrubSpeed * Math.exp(-dt / 0.12)));
    if (!(s.scrubbing && this.scrubSpeed > SCRUB_HOLD) || Number.isNaN(this.worldYear) || this.first) this.worldYear = year;
    if (!s.street) year = this.worldYear;

    const era = this.timeScale.era(year);
    if (!s.street) {
      this.scenery.setEra(era, year, this.first);
      this.town.setYear(year, this.first);
      // the ground is dug to suit whatever stands now: ditches come and go with their walls
      const cutsKey = this.scenery.cutsKey() + '|' + this.town.cutsVersion;
      if (cutsKey !== this.cutsKey) {
        this.cutsKey = cutsKey;
        this.land.setCuts([...this.scenery.cuts(), ...this.town.cuts()]);
      }
      this.terrain.setEra(era, year, this.first);
      this.terrain.update(dt);
      this.scenery.update(dt, this.elapsed);
      this.town.update(dt);
    }
    else {
      // on the street, time picks which building is in focus
      const it = this.street.itemAt(year);
      if (it && it.stageIndex !== this.streetIndex) {
        this.streetIndex = it.stageIndex;
        if (this.nav.mode === 'orbit') this.flyToItem(it.x, it.built.bounds, false);
      }
    }
    this.first = false;

    // panels come and go: keep track of the clear part of the screen and frame the view in it
    if (this.frame++ % 6 === 0 || this.focusPending > 0) this.measureFree();
    if (this.focusPending > 0 && --this.focusPending === 0) this.focusSelection();
    this.applyShift(dt);

    this.nav.update(dt);

    // keep the sun's shadow box centred on what the camera is looking at
    const cam = this.stage.camera;
    const focus = this.nav.mode === 'orbit' ? this.nav.orbit.target : cam.position;
    this.stage.setShadowCentre(Math.round(focus.x / 16) * 16, Math.round(focus.z / 16) * 16);

    this.updateOverlays();
    this.stage.renderer.render(this.stage.scene, cam);
    this.watchFrameRate(dt);
  };

  /** Lineage info for the UI. */
  lineage(id: string): Lineage | undefined {
    return this.region.lineages.find((l) => l.id === id);
  }

  plotState(id: string): PlotState | undefined {
    return this.town.get(id);
  }

  /** Notice when full quality is too much for the device, and offer the simpler graphics once. */
  private watchFrameRate(dt: number) {
    const f = this.fps;
    if (this.low || document.hidden) return;
    // the first seconds are spent building the town and are no guide
    if (f.warm < 6) {
      f.warm += dt;
      return;
    }
    f.frames++;
    f.time += dt;
    if (f.time < 2) return;
    const rate = f.frames / f.time;
    f.frames = 0;
    f.time = 0;
    f.bad = rate < 17 ? f.bad + 1 : 0;
    const s = useApp.getState();
    if (f.bad >= 2 && !s.slow && !s.slowDismissed) useApp.setState({ slow: true });
  }

  dispose() {
    Engine.lastView = { region: this.region.id, pos: this.stage.camera.position.clone(), target: this.nav.orbit.target.clone() };
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

// handy in the console, and used by the scripted checks
if (typeof window !== 'undefined') (window as unknown as { __engine: () => Engine | null }).__engine = () => Engine.instance;
