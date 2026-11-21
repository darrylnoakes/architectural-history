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
  /** Year this plot actually adopts the stage (after the plot's lag). */
  from: number;
  /** Year it is replaced on this plot (Infinity if it survives to the end). */
  to: number;
}

/**
 * The schedule of one plot: when each stage of its lineage actually stands there. A plot can lag
 * behind the fashion (`lag` 0..1 of each stage's span), appear late (`since`), or stop rebuilding
 * altogether at one stage (`keep`), which is how old buildings come to survive in a modern town.
 */
export function plotSchedule(plot: Plot, lineage: Lineage, regionEnd: number): PlotStage[] {
  const out: PlotStage[] = [];
  const stages = lineage.stages;
  const lag = plot.lag ?? 0;
  const keepIndex = plot.keep ? stages.findIndex((s) => s.def.id === plot.keep) : -1;
  for (let i = 0; i < stages.length; i++) {
    const next = i + 1 < stages.length ? stages[i + 1].from : regionEnd;
    let from = stages[i].from + (i === 0 ? 0 : lag * (next - stages[i].from));
    from = Math.round(from);
    out.push({ index: i, from, to: Infinity });
    if (i === keepIndex) break;
  }
  for (let i = 0; i < out.length - 1; i++) out[i].to = out[i + 1].from;
  const since = plot.since;
  if (since === undefined) return out;
  // the plot is open ground until the first building type that comes into use after `since`
  return out.filter((s) => s.from >= since);
}

/** Which entry of a schedule stands at `year`, or -1 if the plot is still empty. */
export function scheduleAt(schedule: PlotStage[], year: number): number {
  for (let i = schedule.length - 1; i >= 0; i--) if (year >= schedule[i].from) return i;
  return -1;
}
