import { create } from 'zustand';
import type { NavMode } from '@ah/engine';

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
}));
