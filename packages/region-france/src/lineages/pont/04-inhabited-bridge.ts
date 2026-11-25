import * as THREE from 'three';
import { P, tint, mix, type Builder, type BuildingDef } from '@ah/kit';
import { END, FOOT, WATER, ROMAN, hump, band, side, bar, bodyOutline, voussoirs, layout, cutwater, cutwaterHood, parapet, romanStumps } from './shared';

/** An undershot mill wheel turning in the plane XY (axle along Z), hub at `at`. */
function millWheel(b: Builder, at: [number, number, number], r: number, w: number): void {
  const wood = P.oakDark;
  b.group({ at }, () => {
    b.sym((k) => {
      const g = new THREE.TorusGeometry(r, 0.07, 4, 12);
      b.add(g, wood, { at: [0, 0, k * (w / 2)] });
      // spokes
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * i) / 3 + 0.3;
        bar(b, [r * Math.cos(a), r * Math.sin(a), k * (w / 2)], [-r * Math.cos(a), -r * Math.sin(a), k * (w / 2)], 0.09, wood);
      }
    });
    // paddles (floats) across the rims
    for (let i = 0; i < 10; i++) {
      const a = (2 * Math.PI * i) / 10;
      b.group({ rot: [0, 0, a - Math.PI / 2] }, () => b.box(0.06, 0.5, w + 0.1, tint(P.oak, 0.03), { at: [0, r - 0.42, 0] }));
    }
    b.log(0.12, w + 1.6, wood, { at: [0, -0.12, 0], axis: 'z', segs: 6 });
  });
}

/**
 * The medieval bridge as first built in 1185 and kept when it was fortified in 1320: pointed arches
 * raised on the Roman piers, its masonry body, the road of setts, the lower lift of the upstream
 * cutwaters, and the chapel on the second pier. No random numbers are drawn here.
 */
export function medievalBridge(b: Builder): { f: (z: number) => number; W: number; roadHalf: number; piers: number[]; stone: number; ring: number; chapelZ: number } {
  const crown = 2.2;
  const f = hump(crown);
  const { W, pierT, ledge, capY } = ROMAN;
  const roadHalf = 2.05;
  const stone = mix(P.pierreBlonde, P.rubble, 0.25);
  const ring = tint(stone, 0.06);
  // the Roman footings, pier shafts and cutwaters are older, paler stone
  const old = mix(P.pierreBlonde, P.limestone, 0.4);
  romanStumps(b, { stone: tint(old, -0.02), core: tint(old, -0.06), ring: tint(old, 0.05), upHood: false });
  const rises = [1.7, 2.3, 2.5, 2.3, 1.7];
  const { ops, piers } = layout(ROMAN.spans, pierT, ledge, (_s, i) => rises[i], 'pointed');
  const top = (z: number) => f(z) - 0.15;

  // the masonry body stands on the Roman piers; only the roadway part runs on beyond the banks
  side(b, bodyOutline({ za: -13.0, zb: 13.0, top, openings: ops, foot: ledge, n: 26 }), W, stone);
  side(b, bodyOutline({ za: -END, zb: END, top, openings: ops, foot: ledge, n: 26 }), roadHalf * 2 + 0.8, stone);
  b.sym((k) => {
    for (const op of ops) voussoirs(b, op, { d: 0.42, width: 0.08, x: k * (W / 2 + 0.02), color: ring, blocks: 5 });
  });
  // the upstream cutwaters raised on the Roman ones; at the chapel a long nose from the bed to carry it
  const chapelZ = piers[1];
  for (const z of piers) {
    if (z === chapelZ) cutwater(b, { x: -W / 2, z, thick: pierT + 0.3, len: 3.0, y0: FOOT, h: f(z) - 0.2 - FOOT, color: stone });
    else cutwater(b, { x: -W / 2, z, thick: pierT + 0.3, len: 1.3, y0: capY, h: 0.2 - capY, color: stone });
  }
  // road of rough setts
  band(b, 0, roadHalf * 2, -END, END, (z) => f(z) - 0.16, (z) => f(z) + 0.01, mix(P.cobble, P.gravel, 0.4), 26);

  // ---- the chapel, built out over the upstream cutwater of the second pier
  const cz = chapelZ;
  const cy = f(cz) - 0.2;
  const cl = 4.0;
  const cw = 3.2;
  const cx = -roadHalf - cl / 2;
  const chapel = tint(P.pierreBlonde, 0.02);
  b.box(cl, 3.6, cw, chapel, { at: [cx, cy, cz] });
  b.gable(cl, cw, 1.8, P.tuilePlate, { at: [cx, cy + 3.6, cz], ridge: 'x', overhang: 0.2, wall: chapel });
  b.lathe([[1.2, 0], [1.2, 3.0], [0.01, 3.9]], chapel, { at: [cx - cl / 2, cy, cz], start: Math.PI, sweep: Math.PI, segs: 6 });
  b.panel(1.0, 2.2, P.oakDark, { at: [-roadHalf, cy + 0.05, cz], facing: '+x', shape: 'round' });
  b.panel(1.3, 2.45, ring, { at: [-roadHalf, cy + 0.05, cz], facing: '+x', shape: 'round', depth: 0.03 });
  b.sym((s) => b.window(0.45, 1.2, { at: [cx - 0.3, cy + 1.6, cz + s * (cw / 2)], facing: s > 0 ? '+z' : '-z', shape: 'round', frame: ring }));
  // bell-cote on the street gable
  b.group({ at: [-roadHalf - 0.2, cy + 3.6, cz] }, () => {
    b.box(0.35, 2.4, 1.0, chapel, { at: [0, 0, 0] });
    b.panel(0.45, 0.8, P.windowDark, { at: [0.18, 1.3, 0], facing: '+x', shape: 'round' });
    b.gable(0.35, 1.0, 0.4, P.tuilePlate, { at: [0, 2.4, 0], ridge: 'x' });
  });
  return { f, W, roadHalf, piers, stone, ring, chapelZ };
}

export const inhabitedBridge: BuildingDef = {
  id: 'inhabited-bridge',
  name: 'Inhabited bridge with chapel and mills',
  style: 'Romanesque to Gothic',
  date: 'c. 1185',
  summary:
    'The timber road of the Roman bridge has long gone, but its piers still stand in the river, and a brotherhood that collects alms for the work raises a new bridge of stone on them: bridge building is a work of charity, and a chapel on one of the piers receives the offerings of travellers. ' +
    'Its arches are the new pointed kind, springing from the ledges of the Roman piers and tallest in the middle where the boats pass, so the road climbs over a steep hump; the old cutwaters are carried up higher to split the current. ' +
    'Over the following century the bridge fills with timber houses and shops let out to pay for its upkeep, hanging out over the water on struts, and millers fix wheels in the arches where the current runs fastest. ' +
    'Many towns of medieval France had bridges like this; their houses and mills held back floods and ice, and several, as in Paris in 1408 and 1499, fell with people living on them.',
  materials: ['limestone', 'oak frame with cob infill (torchis)', 'flat clay tiles', 'oak mill wheels'],
  modelledOn:
    'The chapel on a pier is taken from the Pont Saint-Bénézet, Avignon (traditionally 1177 to 1185), with its chapel of Saint Nicholas, whose arches are in fact low round-topped curves, not pointed; the houses and mills from the bridges of medieval Paris such as the Grand Pont; the arches raised on Roman piers as they were at Trier in the fourteenth century. The rest is generic',
  lookFor: [
    { label: 'Pointed arch', note: 'Two arcs meeting at a point: they push less sideways than a half-circle and can be made as tall as the boats need.', at: [3.0, 1.0, 5.0] },
    { label: 'Bridge chapel', note: 'Built out over the upstream cutwater of a pier: travellers prayed for a safe crossing and gave alms for the bridge.', at: [-6.1, 4.0, -2.55] },
    { label: 'Houses on the bridge', note: 'Timber houses and shops line the road and hang out over the river on struts; their rents paid for repairs.', at: [2.1, 4.0, -7.8] },
    { label: 'Mill wheel', note: 'An undershot wheel turned by the current as it rushes through the arch, grinding corn in the mill above.', at: [4.4, 0.3, -5.0] },
    { label: 'Cutwater', note: 'The pointed upstream end of each pier, the avant-bec, parts the current and fends off ice and drifting trees. The lower courses are the Roman ones, raised and capped anew.', at: [-4.1, -0.4, 7.45] },
  ],
  influences: ['gothic-birth'],
  build(b) {
    b.noCollide();
    const { f, W, roadHalf, piers, stone, ring, chapelZ } = medievalBridge(b);
    b.deck(roadHalf * 2 - 0.2, 34, 2.2, { yEnds: 0 });
    for (const z of piers) if (z !== chapelZ) cutwaterHood(b, { x: -W / 2, z, thick: ROMAN.pierT + 0.3, nose: 1.3, y: 0.2, h: 1.0, color: ring });
    // houses stand on part of each side; parapets close the open stretches
    const rows: Record<number, [number, number]> = { 1: [-11.6, 2.4], [-1]: [0.6, 11.6] };
    const chapelRun: [number, number] = [-4.25, -0.85];
    b.sym((k) => {
      const busy: [number, number][] = [rows[k], ...(k < 0 ? [chapelRun] : [])].sort((p, q) => p[0] - q[0]);
      let za = -END + 0.3;
      for (const [a, c] of [...busy, [END - 0.3, END] as [number, number]]) {
        if (a - za > 0.5) parapet(b, { x: k * (roadHalf + 0.2), za, zb: a, f, lo: -0.15, h: 0.9, t: 0.4, color: stone, cap: ring, n: Math.max(2, Math.round((a - za) / 1.5)) });
        za = Math.max(za, c);
      }
    });

    // ---- the houses
    const walls = [P.torchis, tint(P.torchis, 0.04), P.limewash, mix(P.torchis, P.ochreWash, 0.3)];
    const depth = 3.3;
    const millZ = [-9.8, -5.0];
    b.sym((k) => {
      if (!rows[k]) return;
      const facingRoad = k > 0 ? '-x' : '+x';
      const facingRiver = k > 0 ? '+x' : '-x';
      const xIn = k * roadHalf;
      const xc = k * (roadHalf + depth / 2);
      const xOut = k * (roadHalf + depth);
      const [r0, r1] = rows[k];
      let z = r0;
      while (z < r1 - 0.2) {
        const w = Math.min(b.range(2.9, 3.5), r1 - z);
        if (w < 2.2) break;
        const zc = z + w / 2;
        z += w;
        const y0 = f(zc) - 0.05;
        const g = 2.4;
        const u = 2.1;
        const col = b.pick(walls);
        b.box(depth, g + u, w - 0.06, col, { at: [xc, y0, zc] });
        b.gable(depth, w - 0.06, 2.2, P.tuilePlate, { at: [xc, y0 + g + u, zc], ridge: 'x', overhang: 0.25, wall: col });
        // timber frame on the upper storey's street front, and the shop below
        b.frame(w - 0.3, u, P.oakDark, { at: [xIn, y0 + g, zc], facing: facingRoad, studs: 2, rails: 1, brace: 'corner', beam: 0.14 });
        b.box(0.2, 0.2, w - 0.06, P.oakDark, { at: [xIn + k * 0.05, y0 + g - 0.1, zc] });
        b.panel(w * 0.5, 1.6, P.windowDark, { at: [xIn, y0 + 0.4, zc - w * 0.12], facing: facingRoad });
        b.panel(w * 0.52, 0.12, P.oak, { at: [xIn, y0 + 0.4, zc - w * 0.12], facing: facingRoad, depth: 0.35 });
        b.panel(0.9, 2.0, P.oakDark, { at: [xIn, y0, zc + w * 0.3], facing: facingRoad });
        // the river side: a small shuttered window on each floor
        b.panel(0.6, 0.7, P.oak, { at: [xOut, y0 + 1.2, zc], facing: facingRiver });
        b.panel(0.6, 0.7, P.windowDark, { at: [xOut, y0 + g + 0.9, zc], facing: facingRiver });
        // the overhang beyond the masonry face, carried on raking struts (or on piles at a mill)
        const mill = k > 0 && millZ.some((m) => Math.abs(m - zc) < w / 2);
        b.box(depth - (W / 2 - roadHalf), 0.18, w - 0.1, P.oakDark, { at: [k * (W / 2 + (roadHalf + depth - W / 2) / 2), y0 - 0.18, zc] });
        for (const dz of [-w / 2 + 0.35, w / 2 - 0.35]) {
          if (mill) b.cyl(0.13, y0 - FOOT, P.oakDark, { at: [xOut - k * 0.2, FOOT, zc + dz], segs: 5 });
          else bar(b, [k * (W / 2), y0 - 1.6, zc + dz], [xOut - k * 0.15, y0 - 0.1, zc + dz], 0.14, P.oakDark);
        }
      }
    });
    // the mill wheels, in the current at the mouth of two arches
    for (const z of millZ) millWheel(b, [W / 2 + 0.85, WATER + 0.7, z], 1.25, 1.0);

  },
};
