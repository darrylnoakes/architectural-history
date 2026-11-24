// How much of each building survives into the next stage of its lineage, piece by piece.
//   cp tools/morph-report.ts apps/town/ && (cd apps/town && npx tsx morph-report.ts [region]); rm apps/town/morph-report.ts
import { construct, type Built, type Region } from '@ah/kit';
import england from '@ah/england';
import italy from '@ah/italy';
import france from '@ah/france';

const regions: Record<string, Region> = { england, italy, france };
const only = process.argv[2];

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

for (const [id, region] of Object.entries(regions)) {
  if (only && only !== id) continue;
  console.log(`\n== ${id}`);
  for (const lin of region.lineages) {
    const built = lin.stages.map((s) => {
      try {
        return construct(s.def, 1, 0, false);
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
      if (k >= 0.05) row.push(`${lin.stages[i - 1].def.id} -> ${lin.stages[i].def.id} ${Math.round(k * 100)}%`);
    }
    console.log(`${lin.id}: ${built.length - 1} changes, ${row.length} keep something${row.length ? '\n    ' + row.join('\n    ') : ''}`);
  }
}
