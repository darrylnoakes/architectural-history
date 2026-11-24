import { create } from 'zustand';
import { plotSchedule, type NavMode } from '@ah/engine';
import { REGIONS } from './regions';

/** A lineage in a region: what the library, the viewer and the compare view point at. */
export interface LineageRef {
  region: string;
  lineage: string;
}

export type Screen =
  | { kind: 'town' }
  | { kind: 'library' }
  | { kind: 'building'; ref: LineageRef }
  | { kind: 'compare'; a: LineageRef; b: LineageRef };

/** How much the renderer does: 'low' drops shadows, thins the trees and draws at the screen's plain resolution. */
export type Quality = 'high' | 'low';

const QUALITY_KEY = 'ah.quality';
function storedQuality(): Quality | null {
  try {
    const v = localStorage.getItem(QUALITY_KEY);
    return v === 'low' || v === 'high' ? v : null;
  } catch {
    return null;
  }
}

export interface AppState {
  quality: Quality;
  /** Set when the town is drawing slowly at full quality, to offer the simpler graphics. */
  slow: boolean;
  /** The offer has been turned down: do not make it again. */
  slowDismissed: boolean;
  /** The region whose town is showing. */
  regionId: string;
  year: number;
  playing: boolean;
  /** True while the year is being dragged along the timeline. */
  scrubbing: boolean;
  /** 1 = the whole story in about two minutes. */
  speed: number;
  mode: NavMode;
  /** The lineage street, when open. */
  street: { lineageId: string; plotId: string } | null;
  /** Selected plot id. */
  selected: string | null;
  /** Bumped whenever the camera should go and look at the selection. */
  focusTick: number;
  hoverFeature: number | null;
  eraOpen: boolean;
  helpOpen: boolean;
  /** The region picker (world map and list). */
  regionsOpen: boolean;
  /** The list of every cross-pollination entry. */
  ideasOpen: boolean;
  /** Which full-screen view is showing over the town, if any. */
  screen: Screen;
  intro: boolean;
  locked: boolean;
  touch: boolean;
  ready: boolean;

  /** Change the graphics quality and remember it on this device. */
  setQuality(q: Quality): void;
  /** Go to another region's town, keeping the year where the two stories overlap. */
  setRegion(id: string): void;
  setYear(year: number): void;
  jumpTo(year: number): void;
  togglePlay(): void;
  select(plotId: string | null, focus?: boolean): void;
  openStreet(plotId: string, lineageId: string): void;
  closeStreet(): void;
  openLibrary(): void;
  /** Show one lineage on its own; `year` picks which of its buildings to start on. */
  openBuilding(ref: LineageRef, year?: number): void;
  openCompare(a: LineageRef, b: LineageRef): void;
  closeScreen(): void;
  /** Leave the library and look at this lineage's plot in the town, in the given year. */
  showInTown(ref: LineageRef, year: number): void;
}

const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const urlQuality = params.get('q');
const startQuality: Quality = urlQuality === 'low' || urlQuality === 'high' ? urlQuality : (storedQuality() ?? 'high');
const startRegion = REGIONS[params.get('r') ?? ''] ? params.get('r')! : 'england';
const startYear = Number(params.get('y') ?? REGIONS[startRegion].start);

export const useApp = create<AppState>((set, get) => ({
  quality: startQuality,
  slow: false,
  slowDismissed: false,
  regionId: startRegion,
  year: Number.isFinite(startYear) ? startYear : REGIONS[startRegion].start,
  playing: false,
  scrubbing: false,
  speed: 1,
  mode: 'orbit',
  street: null,
  selected: null,
  focusTick: 0,
  hoverFeature: null,
  eraOpen: typeof window !== 'undefined' ? window.innerWidth > 900 : true,
  helpOpen: false,
  regionsOpen: false,
  ideasOpen: false,
  screen: { kind: 'town' },
  intro: !params.has('y'),
  locked: false,
  touch: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  ready: false,

  setQuality: (q) => {
    try {
      localStorage.setItem(QUALITY_KEY, q);
    } catch {
      // private windows and the like: the choice lasts for this visit only
    }
    set({ quality: q, slow: false });
  },
  setRegion: (id) => {
    const region = REGIONS[id];
    if (!region || id === get().regionId) return;
    set((s) => ({
      regionId: id,
      year: Math.min(region.end, Math.max(region.start, s.year)),
      screen: { kind: 'town' },
      street: null,
      selected: null,
      hoverFeature: null,
      playing: false,
      mode: 'orbit',
      regionsOpen: false,
    }));
  },
  setYear: (year) => set({ year }),
  jumpTo: (year) => set({ year, playing: false }),
  togglePlay: () => set({ playing: !get().playing, intro: false }),
  select: (plotId, focus = true) =>
    set((s) => ({ selected: plotId, hoverFeature: null, focusTick: focus && plotId ? s.focusTick + 1 : s.focusTick })),
  openStreet: (plotId, lineageId) => set({ street: { plotId, lineageId }, selected: plotId, playing: false }),
  closeStreet: () => set((s) => ({ street: null, focusTick: s.focusTick + 1 })),
  openLibrary: () => set({ screen: { kind: 'library' }, playing: false, intro: false }),
  openBuilding: (ref, year) =>
    set((s) => ({ screen: { kind: 'building', ref }, playing: false, intro: false, year: year ?? s.year })),
  openCompare: (a, b) => set({ screen: { kind: 'compare', a, b }, playing: false, intro: false }),
  closeScreen: () =>
    set((s) => {
      // the viewer may have wandered to years this town's story does not reach
      const region = REGIONS[s.regionId];
      return { screen: { kind: 'town' }, playing: false, year: Math.min(region.end, Math.max(region.start, s.year)) };
    }),
  showInTown: (ref, year) => {
    const region = REGIONS[ref.region];
    const lineage = region?.lineages.find((l) => l.id === ref.lineage);
    if (!region || !lineage) return;
    // the building the viewer was showing: find a plot where it stands, in that year if possible
    let want = 0;
    lineage.stages.forEach((st, k) => {
      if (year >= st.from) want = k;
    });
    const plots = region.plots.filter((p) => p.lineage === ref.lineage).sort((a, b) => Number(!!b.hero) - Number(!!a.hero));
    let pick: { id: string; year: number } | null = null;
    for (const p of plots) {
      const entry = plotSchedule(p, lineage, region.end).find((e) => e.index === want && e.state === 'standing');
      if (!entry) continue;
      if (year >= entry.from && year < entry.to) {
        pick = { id: p.id, year };
        break;
      }
      pick ??= { id: p.id, year: entry.from };
    }
    pick ??= plots[0] ? { id: plots[0].id, year } : null;
    set((s) => ({
      regionId: region.id,
      screen: { kind: 'town' },
      street: null,
      playing: false,
      year: Math.min(region.end, Math.max(region.start, pick?.year ?? year)),
      mode: 'orbit',
      selected: pick?.id ?? null,
      hoverFeature: null,
      focusTick: s.focusTick + 1,
    }));
  },
}));

// handy in the console, and used by the scripted checks
if (typeof window !== 'undefined') (window as unknown as { __app: typeof useApp }).__app = useApp;
