// How much of each building survives into the next, piece by piece.
//   cd apps/town && npx tsx tools/morph-report.ts <region> [lineage] [seed] [variant]
//     consecutive stages of each lineage, built with one seed and variant
//   cd apps/town && npx tsx tools/morph-report.ts <region> plots [lineage]
//     what really follows what on each plot, with the plot's own seed, variant and revisions
import { construct, type Built, type Region } from '@ah/kit';
import { plotSchedule } from '@ah/engine';
import england from '@ah/england';
import italy from '@ah/italy';
import france from '@ah/france';

const regions: Record<string, Region> = { england, italy, france };
const only = process.argv[2];
const byPlot = process.argv[3] === 'plots';
const onlyLineage = byPlot ? process.argv[4] : process.argv[3];
const seed = Number(process.argv[4] ?? 1);
const variant = Number(process.argv[5] ?? 0);

function share(prev: Built, next: Built): number {
  const pool = new Map<string, number>();
  for (const p of prev.parts) pool.set(p.key, (pool.get(p.key) ?? 0) + 1);
  let kept = 0;
  let total = 0;
  for (const p of prev.parts) total += p.count;
  for (const p of next.parts) {
    const n = pool.get(p.key) ?? 0;
    if (n > 0) {
      pool.set(p.key, n - 1);
      kept += p.count;
    }
  }
  return total ? kept / total : 0;
}

const pct = (k: number) => `${Math.round(k * 100)}%`;

for (const [id, region] of Object.entries(regions)) {
  if (only && only !== id) continue;
  console.log(`\n== ${id}`);
  if (byPlot) {
    const seen = new Map<string, number>();
    for (const lin of region.lineages) {
      if (onlyLineage && lin.id !== onlyLineage) continue;
      // the same pair on several plots is shown once, with the range of shares it gets
      const pairs = new Map<string, { lo: number; hi: number; plots: string[] }>();
      for (const plot of region.plots.filter((p) => p.lineage === lin.id)) {
        const n = seen.get(lin.id) ?? 0;
        seen.set(lin.id, n + 1);
        const v = plot.hero ? 0 : n;
        const sched = plotSchedule(plot, lin, region.end);
        for (let i = 1; i < sched.length; i++) {
          const a = sched[i - 1];
          const b = sched[i];
          // a building falling into ruin is the same model in other colours
          if (a.index === b.index || a.to !== b.from) continue;
          const A = lin.stages[a.index].def;
          const B = lin.stages[b.index].def;
          let k = 0;
          try {
            k = share(construct(A, plot.seed, v, false, b.from - 1), construct(B, plot.seed, v, false, b.from));
          } catch {
            continue;
          }
          const key = `${A.id} -> ${B.id}`;
          const e = pairs.get(key) ?? { lo: 1, hi: 0, plots: [] };
          e.lo = Math.min(e.lo, k);
          e.hi = Math.max(e.hi, k);
          e.plots.push(plot.id);
          pairs.set(key, e);
        }
      }
      console.log(`${lin.id}: ${pairs.size} changes on real plots`);
      for (const [key, e] of pairs) console.log(`    ${key} ${pct(e.lo)}${e.hi - e.lo > 0.005 ? ' to ' + pct(e.hi) : ''}  (${e.plots.length > 3 ? e.plots.length + ' plots' : e.plots.join(', ')})`);
    }
    continue;
  }
  for (const lin of region.lineages) {
    if (onlyLineage && lin.id !== onlyLineage) continue;
    const built = lin.stages.map((s) => {
      try {
        return construct(s.def, seed, variant, false);
      } catch {
        return null;
      }
    });
    const row: string[] = [];
    for (let i = 1; i < built.length; i++) {
      const a = built[i - 1];
      const b = built[i];
      if (!a || !b) continue;
      const k = share(a, b);
      if (k >= 0.05 || onlyLineage) row.push(`${lin.stages[i - 1].def.id} -> ${lin.stages[i].def.id} ${pct(k)}`);
    }
    console.log(`${lin.id}: ${built.length - 1} changes, ${row.length} keep something${row.length ? '\n    ' + row.join('\n    ') : ''}`);
  }
}
