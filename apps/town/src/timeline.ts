import type { Region } from '@ah/kit';
import { REGIONS, scaleOf } from './regions';
import type { LineageRef, Screen } from './state';

/** Years laid out on a 0..1 bar. */
export interface Scale {
  start: number;
  end: number;
  toT(year: number): number;
  toYear(t: number): number;
}

/**
 * One bar for two regions whose stories start and end in different years and divide into different
 * eras. A year sits at the average of where each region would put it, so each region's eras keep
 * roughly the room they have on their own bar, and the bar runs from the earlier start to the later end.
 */
class MergedScale implements Scale {
  readonly start: number;
  readonly end: number;
  private years: number[];
  private ts: number[];

  constructor(regions: Region[]) {
    const scales = regions.map(scaleOf);
    this.start = Math.min(...regions.map((r) => r.start));
    this.end = Math.max(...regions.map((r) => r.end));
    const set = new Set<number>([this.start, this.end]);
    for (const r of regions) for (const e of r.eras) set.add(e.from).add(e.to);
    this.years = [...set].sort((a, b) => a - b);
    this.ts = this.years.map((y) => scales.reduce((sum, s) => sum + s.toT(y), 0) / scales.length);
  }

  toT(year: number): number {
    const y = Math.min(this.end, Math.max(this.start, year));
    let i = this.years.findIndex((b) => b > y) - 1;
    if (i < 0) i = this.years.length - 2;
    const span = this.years[i + 1] - this.years[i];
    return this.ts[i] + ((y - this.years[i]) / span) * (this.ts[i + 1] - this.ts[i]);
  }

  toYear(t: number): number {
    const c = Math.min(1, Math.max(0, t));
    let i = this.ts.findIndex((b) => b >= c) - 1;
    if (i < 0) i = 0;
    const span = this.ts[i + 1] - this.ts[i];
    return span <= 0 ? this.years[i] : this.years[i] + ((c - this.ts[i]) / span) * (this.years[i + 1] - this.years[i]);
  }
}

export interface ActiveTimeline {
  scale: Scale;
  /** The regions the bar covers: one in the town and the viewer, one or two when comparing. */
  regions: Region[];
}

const merged = new Map<string, MergedScale>();
const cache = new Map<string, ActiveTimeline>();

/** The timeline that goes with what is on screen. */
export function activeTimeline(s: { regionId: string; screen: Screen }): ActiveTimeline {
  const refs: LineageRef[] = s.screen.kind === 'compare' ? [s.screen.a, s.screen.b] : s.screen.kind === 'building' ? [s.screen.ref] : [];
  let ids = [...new Set(refs.map((r) => r.region))].filter((id) => REGIONS[id]);
  if (!ids.length) ids = [s.regionId];
  const key = ids.join('+');
  let out = cache.get(key);
  if (!out) {
    const regions = ids.map((id) => REGIONS[id]);
    let scale: Scale;
    if (regions.length === 1) scale = scaleOf(regions[0]);
    else {
      const sorted = [...ids].sort().join('+');
      let m = merged.get(sorted);
      if (!m) merged.set(sorted, (m = new MergedScale(regions)));
      scale = m;
    }
    cache.set(key, (out = { scale, regions }));
  }
  return out;
}
