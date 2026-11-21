/**
 * Building gallery: a bare preview of one building (or a whole lineage in a row), used while authoring.
 *
 *   /gallery.html?lineage=home&id=roundhouse&view=iso        (add &region=italy for another region)
 *   /gallery.html?lineage=home            (every stage side by side)
 *   /gallery.html?extra=georgian-chapel
 *
 * view = iso | front | back | side | top | eye     seed = any integer
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Builder, P, construct, type BuildingDef, type Lineage } from '@ah/kit';
import { createStage } from '@ah/engine';

const lineageModules = import.meta.glob<{ default: Lineage }>('../../../packages/region-*/src/lineages/*/index.ts');
const extraModules = import.meta.glob<Record<string, BuildingDef>>('../../../packages/region-*/src/extras/*.ts');

const q = new URLSearchParams(location.search);
const info = document.getElementById('info')!;
const errBox = document.getElementById('err')!;
const fail = (msg: string) => {
  errBox.style.display = 'block';
  errBox.textContent = msg;
  (window as any).__error = msg;
  (window as any).__ready = true;
};
window.addEventListener('error', (e) => fail(String(e.error?.stack ?? e.message)));
window.addEventListener('unhandledrejection', (e) => fail(String((e.reason as any)?.stack ?? e.reason)));

async function main() {
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  const stage = createStage({ canvas, shadowExtent: 70, shadowMapSize: 2048, maxPixelRatio: 1 });
  const { scene, camera, renderer } = stage;
  scene.fog = null;

  const regionId = q.get('region') ?? 'england';
  const lineageId = q.get('lineage');
  const id = q.get('id');
  const view = q.get('view') ?? 'iso';
  const seed = Number(q.get('seed') ?? 1);
  const variant = Number(q.get('variant') ?? 0);

  let defs: { def: BuildingDef; from?: number }[] = [];
  let plot: [number, number] | null = null;
  let band: [number, number] | null = null;

  if (q.get('extra')) {
    for (const load of Object.values(extraModules)) {
      const mod = await load();
      for (const v of Object.values(mod)) if (v && (v as BuildingDef).id === q.get('extra')) defs.push({ def: v });
    }
    if (!defs.length) return fail(`No extra building with id "${q.get('extra')}"`);
  } else if (lineageId) {
    const key = Object.keys(lineageModules).find((k) => k.includes(`/region-${regionId}/`) && k.includes(`/lineages/${lineageId}/`));
    if (!key) return fail(`No lineage folder "${lineageId}". Found: ${Object.keys(lineageModules).join(', ')}`);
    const lineage = (await lineageModules[key]()).default;
    plot = lineage.plotSize;
    band = lineage.river ?? null;
    defs = lineage.stages.map((s) => ({ def: s.def, from: s.from }));
    if (id) {
      defs = defs.filter((d) => d.def.id === id);
      if (!defs.length) return fail(`No building "${id}" in lineage "${lineageId}". Ids: ${lineage.stages.map((s) => s.def.id).join(', ')}`);
    }
  } else {
    return fail('Give ?lineage=<id>[&id=<building>] or ?extra=<building>');
  }

  const single = defs.length === 1;
  const spacing = plot ? plot[0] + 8 : 30;
  const total = new THREE.Box3();
  const lines: string[] = [];

  defs.forEach((entry, i) => {
    const built = construct(entry.def, seed, variant);
    const x = (i - (defs.length - 1) / 2) * spacing;
    built.object.position.x = x;
    scene.add(built.object);
    const bb = built.bounds.clone().translate(new THREE.Vector3(x, 0, 0));
    total.union(bb);
    const s = built.bounds.getSize(new THREE.Vector3());
    lines.push(
      `${entry.def.id}${entry.from !== undefined ? ` (from ${entry.from})` : ''}  ${s.x.toFixed(1)} × ${s.z.toFixed(1)} m, ${s.y.toFixed(1)} m tall, ${built.triangles} tris`,
    );
    if (plot && (s.x > plot[0] + 0.5 || s.z > plot[1] + 0.5)) lines.push(`  ! exceeds plot ${plot[0]} × ${plot[1]}`);

    // scale figure and feature markers
    const extra = new Builder(1);
    extra.figure({ at: [built.bounds.max.x + 1.2, 0, built.bounds.max.z + 1.5] });
    if (q.get('marks') !== '0') {
      for (const f of entry.def.lookFor) if (f.at) extra.sphere(0.22, 0xff2d6f, { at: f.at, jitter: false });
    }
    const eo = extra.finish().object;
    eo.position.x = x;
    scene.add(eo);

    if (plot) {
      const outline = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) => new THREE.Vector3(x + (a * plot![0]) / 2, 0.03, (c * plot![1]) / 2)),
        ),
        new THREE.LineBasicMaterial({ color: 0xffffff }),
      );
      scene.add(outline);
    }
  });

  // ground (with a river channel where the lineage expects one)
  const ground = new Builder(1);
  const W = Math.max(160, defs.length * spacing + 80);
  if (band) {
    const [z0, z1] = band;
    ground.box(W, 3, 80 + z0, P.grass, { at: [0, -3, (z0 - 80) / 2], jitter: false });
    ground.box(W, 3, 80 - z1, P.grass, { at: [0, -3, (z1 + 80) / 2], jitter: false });
    ground.box(W, 0.8, z1 - z0, P.mud, { at: [0, -3, (z0 + z1) / 2], jitter: false });
    ground.box(W, 0.02, z1 - z0, P.water, { at: [0, -1.2, (z0 + z1) / 2], jitter: false, mat: 'glass' });
  } else {
    ground.box(W, 0.5, 160, P.grass, { at: [0, -0.5, 0], jitter: false });
  }
  const g = ground.finish().object;
  g.traverse((o) => ((o as THREE.Mesh).castShadow = false));
  scene.add(g);

  // camera
  const c = total.getCenter(new THREE.Vector3());
  const size = total.getSize(new THREE.Vector3());
  const r = Math.max(6, size.length() / 2);
  const fov = (camera.fov * Math.PI) / 180;
  const dist = (r / Math.sin(fov / 2)) * (single ? 0.82 : 0.6);
  const dirs: Record<string, THREE.Vector3> = {
    iso: new THREE.Vector3(0.62, 0.5, 0.78),
    front: new THREE.Vector3(0.08, 0.16, 1),
    back: new THREE.Vector3(-0.6, 0.5, -0.8),
    side: new THREE.Vector3(1, 0.2, 0.05),
    top: new THREE.Vector3(0.001, 1, 0.12),
    eye: new THREE.Vector3(0.3, 0, 1),
  };
  const dir = (dirs[view] ?? dirs.iso).clone().normalize();
  const target = new THREE.Vector3(c.x, Math.max(1, size.y * 0.4), c.z);
  camera.position.copy(target).addScaledVector(dir, dist);
  if (view === 'eye') {
    camera.position.set(c.x + size.x * 0.25, 1.7, total.max.z + Math.max(8, size.x * 0.7));
    target.set(c.x, Math.min(size.y * 0.45, 5), c.z);
  }
  camera.lookAt(target);
  stage.setShadowCentre(c.x, c.z);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.update();

  info.textContent = lines.join('\n');
  (window as any).__info = lines;

  if (q.get('static')) {
    // one frame is enough for a screenshot; do not keep a software renderer spinning
    controls.dispose();
    stage.resize();
    renderer.render(scene, camera);
    renderer.render(scene, camera);
    (window as any).__ready = true;
    return;
  }
  const frame = () => {
    stage.resize();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  frame();
  requestAnimationFrame(() => requestAnimationFrame(() => ((window as any).__ready = true)));
}

main().catch((e) => fail(String(e?.stack ?? e)));
