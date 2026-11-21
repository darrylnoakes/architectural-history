import { create } from 'zustand';
import type { NavMode } from '@ah/engine';
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

export interface AppState {
  year: number;
  playing: boolean;
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
const startYear = Number(params.get('y') ?? -500);

export const useApp = create<AppState>((set, get) => ({
  year: Number.isFinite(startYear) ? startYear : -500,
  playing: false,
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
  closeScreen: () => set({ screen: { kind: 'town' }, playing: false }),
  showInTown: (ref, year) => {
    const plots = REGIONS[ref.region]?.plots.filter((p) => p.lineage === ref.lineage) ?? [];
    const plot = plots.find((p) => p.hero) ?? plots[0];
    set((s) => ({
      screen: { kind: 'town' },
      street: null,
      playing: false,
      year,
      mode: 'orbit',
      selected: plot?.id ?? null,
      hoverFeature: null,
      focusTick: s.focusTick + 1,
    }));
  },
}));

// handy in the console, and used by the scripted checks
if (typeof window !== 'undefined') (window as unknown as { __app: typeof useApp }).__app = useApp;
