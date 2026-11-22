import type { Era, Lineage, Plot } from '@ah/kit';

/**
 * Maps years to a 0..1 timeline position and back. Eras are not given width in proportion to their
 * length (the Iron Age would swallow the bar and the twentieth century would vanish); each gets
 * duration^power, which keeps long eras longer but leaves every era room to be explored.
 */
export class TimeScale {
  readonly start: number;
  readonly end: number;
  /** For each era: [t0, t1] on the 0..1 bar. */
  readonly spans: [number, number][];

  constructor(
    readonly eras: Era[],
    power = 0.3,
  ) {
    this.start = eras[0].from;
    this.end = eras[eras.length - 1].to;
    const w = eras.map((e) => Math.pow(e.to - e.from, power));
    const total = w.reduce((a, b) => a + b, 0);
    let acc = 0;
    this.spans = w.map((x) => {
      const s: [number, number] = [acc / total, (acc + x) / total];
      acc += x;
      return s;
    });
  }

  eraIndex(year: number): number {
    for (let i = this.eras.length - 1; i >= 0; i--) if (year >= this.eras[i].from) return i;
    return 0;
  }

  era(year: number): Era {
    return this.eras[this.eraIndex(year)];
  }

  toT(year: number): number {
    const y = Math.min(this.end, Math.max(this.start, year));
    const i = this.eraIndex(y);
    const e = this.eras[i];
    const [t0, t1] = this.spans[i];
    return t0 + ((y - e.from) / (e.to - e.from)) * (t1 - t0);
  }

  toYear(t: number): number {
    const c = Math.min(1, Math.max(0, t));
    let i = this.spans.findIndex(([, t1]) => c <= t1);
    if (i < 0) i = this.spans.length - 1;
    const e = this.eras[i];
    const [t0, t1] = this.spans[i];
    return e.from + ((c - t0) / (t1 - t0)) * (e.to - e.from);
  }
}

/** "500 BC", "AD 43", "1350". */
export function formatYear(year: number): string {
  const y = Math.round(year);
  if (y < 0) return `${-y} BC`;
  if (y === 0) return '1 BC';
  if (y < 1000) return `AD ${y}`;
  return String(y);
}

export interface PlotStage {
  /** Index into lineage.stages. */
  index: number;
  /** Year this state begins on this plot. */
  from: number;
  /** Year it ends (Infinity if it lasts to the end of the story). */
  to: number;
  /** standing = in use; ruin = abandoned and roofless, waiting for whatever comes next. */
  state: 'standing' | 'ruin';
}

/**
 * The schedule of one plot: what stands on it, and when. Every entry is something that could really
 * have been there in those years:
 *  - a plot that lags behind the fashion (`lag` 0..1) adopts each type part-way through the years
 *    that type was actually being built (`from` to `builtUntil`), never after;
 *  - a type with an `end` does not outlive it: it is renewed as the next stage, falls into ruin, or
 *    is cleared, leaving a gap in the schedule;
 *  - a plot can pass over a type altogether (`skip`), appear late (`since`), or stop rebuilding at one durable type (`keep`), which is how
 *    old buildings come to survive in a modern town.
 */
export function plotSchedule(plot: Plot, lineage: Lineage, regionEnd: number): PlotStage[] {
  const stages = lineage.stages;
  const lag = plot.lag ?? 0;
  const keepIndex = plot.keep ? stages.findIndex((s) => s.def.id === plot.keep) : -1;
  if (plot.keep && keepIndex < 0) console.warn(`Plot ${plot.id}: no stage "${plot.keep}" to keep`);
  if (keepIndex >= 0 && stages[keepIndex].end) console.warn(`Plot ${plot.id}: "${plot.keep}" is not durable and cannot be kept`);

  // when this plot takes up each type
  const adopted: { index: number; from: number }[] = [];
  for (let i = 0; i < stages.length; i++) {
    const st = stages[i];
    if (plot.skip?.includes(st.def.id)) continue;
    const window = (st.builtUntil ?? stages[i + 1]?.from ?? regionEnd) - st.from;
    let from = Math.round(st.from + (i === 0 && plot.since === undefined ? 0 : lag * Math.max(0, window)));
    if (plot.since !== undefined && from < plot.since) continue; // not built on yet
    const prev = adopted[adopted.length - 1];
    if (prev) {
      // a type that is renewed when its time is up pulls its successor forward
      const end = stages[prev.index].end;
      // (but never to before the successor itself existed: until then the old type is simply kept up)
      if (end?.fate === 'renew') from = Math.max(st.from, Math.min(from, end.year));
      if (from <= prev.from) continue;
    }
    // too late: this type had already had its day before the plot would have adopted it
    if (st.end && st.end.fate !== 'renew' && st.end.year <= from) continue;
    adopted.push({ index: i, from });
    if (i === keepIndex) break;
  }

  const out: PlotStage[] = [];
  adopted.forEach((a, k) => {
    const next = adopted[k + 1]?.from ?? Infinity;
    const end = stages[a.index].end;
    if (end && end.fate !== 'renew' && end.year < next) {
      out.push({ index: a.index, from: a.from, to: end.year, state: 'standing' });
      if (end.fate === 'ruin') out.push({ index: a.index, from: end.year, to: next, state: 'ruin' });
    } else {
      out.push({ index: a.index, from: a.from, to: next, state: 'standing' });
    }
  });
  return out;
}

/** Which entry of a schedule covers `year`, or -1 if the plot is open ground then. */
export function scheduleAt(schedule: PlotStage[], year: number): number {
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (year >= schedule[i].from) return year < schedule[i].to ? i : -1;
  }
  return -1;
}
