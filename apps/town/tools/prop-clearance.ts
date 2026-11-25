// Where the solid scenery of a region (town walls and the like) stands on top of what is built on a plot.
//   cd apps/town && npx tsx tools/prop-clearance.ts <region> [propIdPrefix] [minArea]
// Every solid site prop and every building on every plot is drawn into a half-metre grid of the
// ground it covers (anything standing more than 0.3 m high); for each prop and plot whose years
// overlap, the area they share is listed, with where it is. Gate plots that are meant to join a wall
// show a small overlap at their edges.
import * as THREE from 'three';
import { Builder, construct, revisionYear, type Region } from '@ah/kit';
import { plotSchedule } from '@ah/engine';
import england from '@ah/england';
import italy from '@ah/italy';
import france from '@ah/france';

const regions: Record<string, Region> = { england, italy, france };
const region = regions[process.argv[2] ?? 'france'];
const prefix = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : '';
const minArea = Number(process.argv[4] ?? 1);
const CELL = 0.5;

type Grid = Set<number>;
const key = (i: number, j: number) => (i + 4000) * 8192 + (j + 4000);

/** The ground a model covers, as grid cells: every triangle with a point above 0.3 m, seen from above. */
function footprint(object: THREE.Object3D, place: (x: number, z: number) => [number, number]): Grid {
  const g: Grid = new Set();
  object.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const p = mesh.geometry.attributes.position.array as Float32Array;
    for (let t = 0; t < p.length; t += 9) {
      if (Math.max(p[t + 1], p[t + 4], p[t + 7]) < 0.3) continue;
      const [ax, az] = place(p[t], p[t + 2]);
      const [bx, bz] = place(p[t + 3], p[t + 5]);
      const [cx, cz] = place(p[t + 6], p[t + 8]);
      const i0 = Math.floor(Math.min(ax, bx, cx) / CELL);
      const i1 = Math.floor(Math.max(ax, bx, cx) / CELL);
      const j0 = Math.floor(Math.min(az, bz, cz) / CELL);
      const j1 = Math.floor(Math.max(az, bz, cz) / CELL);
      const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          if (Math.abs(d) < 1e-9) {
            g.add(key(i, j)); // an upright face: its line on the ground
            continue;
          }
          const x = (i + 0.5) * CELL;
          const z = (j + 0.5) * CELL;
          const u = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
          const v = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
          if (u >= -0.02 && v >= -0.02 && u + v <= 1.02) g.add(key(i, j));
        }
      }
    }
  });
  return g;
}

const props = region.site.props
  .map((prop, i) => ({ prop, i }))
  .filter(({ prop }) => prop.solid && prop.id.startsWith(prefix))
  .map(({ prop, i }) => {
    const b = new Builder(77 + i);
    prop.build(b, () => 0);
    return { id: prop.id, since: prop.since ?? -Infinity, until: prop.until ?? Infinity, grid: footprint(b.finish().object, (x, z) => [x, z]) };
  });

const seen = new Map<string, number>();
let found = 0;
for (const plot of region.plots) {
  const lin = region.lineages.find((l) => l.id === plot.lineage)!;
  const n = seen.get(lin.id) ?? 0;
  seen.set(lin.id, n + 1);
  const variant = plot.hero ? 0 : n;
  const cos = Math.cos(plot.rotY);
  const sin = Math.sin(plot.rotY);
  const place = (x: number, z: number): [number, number] => [plot.x + x * cos + z * sin, plot.z - x * sin + z * cos];
  for (const e of plotSchedule(plot, lin, region.end)) {
    const live = props.filter((p) => p.since < e.to && p.until > e.from);
    if (!live.length) continue;
    const def = lin.stages[e.index].def;
    let grid: Grid;
    try {
      grid = footprint(construct(def, plot.seed, variant, false, revisionYear(def, e.from)).object, place);
    } catch {
      continue;
    }
    for (const p of live) {
      let count = 0;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const k of grid) {
        if (!p.grid.has(k)) continue;
        count++;
        const i = Math.floor(k / 8192) - 4000;
        const j = (k % 8192) - 4000;
        x0 = Math.min(x0, i * CELL); x1 = Math.max(x1, (i + 1) * CELL);
        z0 = Math.min(z0, j * CELL); z1 = Math.max(z1, (j + 1) * CELL);
      }
      const area = count * CELL * CELL;
      if (area < minArea) continue;
      found++;
      const a = Math.max(e.from, p.since);
      const c = Math.min(e.to, p.until);
      console.log(`${plot.id.padEnd(16)} ${(def.id + (e.state === 'ruin' ? ' (ruin)' : '')).padEnd(30)} x ${p.id.padEnd(20)} ${String(Math.round(a)).padStart(5)}..${c === Infinity ? 'now' : Math.round(c)}  ${area.toFixed(0).padStart(4)} m²  x ${x0}..${x1} z ${z0}..${z1}`);
    }
  }
}
console.log(found ? `${found} overlaps` : 'no overlaps');
