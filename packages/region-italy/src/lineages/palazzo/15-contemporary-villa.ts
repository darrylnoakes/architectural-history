import { P, tint, type BuildingDef } from '@ah/kit';
import { onFace } from './shared';

const corten = 0x8b4a2b;

export const contemporaryVilla: BuildingDef = {
  id: 'contemporary-villa',
  name: 'Contemporary hillside villa',
  style: 'Contemporary',
  date: 'c. 2008',
  summary:
    'The newest great house hides rather than shows off. It is dug into the slope above the town, so that from uphill only a planted roof and a long box of rusting steel can be seen. ' +
    'The lower floor is walled in local stone, as farm terraces have always been, and opens to the view through a wall of glass; the upper box of weathering steel cantilevers out over a terrace and a narrow pool. ' +
    'Thick earth cover, deep overhangs and shade cut the energy needed for cooling, now a requirement rather than a choice.',
  materials: ['local stone', 'weathering (Corten) steel', 'structural glass', 'reinforced concrete', 'planted roof'],
  lookFor: [
    { label: 'Built into the hillside', note: 'The back of the house is buried in the slope, and its planted roof continues the hillside.', at: [-3.0, 3.8, -4.0] },
    { label: 'Weathering steel box', note: 'Steel that rusts to a stable brown skin clads the upper floor, which cantilevers out over the terrace.', at: [3.0, 5.2, 1.2] },
    { label: 'Glass wall', note: 'A full-height wall of glass with slim frames opens the living floor to the view.', at: [-4.0, 1.8, 2.2] },
    { label: 'Dry-stone walls', note: 'Walls of local stone, like the old farm terraces, retain the slope and face the lower floor.', at: [-9.5, 1.0, 3.0] },
    { label: 'Infinity pool', note: 'A narrow pool along the terrace edge, its far rim level with the water.', at: [5.5, 0.6, 6.5] },
  ],
  build(b) {
    const stone = b.pick([P.tufa, P.travertine, P.pietraForte]);
    const frame = P.castIron;
    // ---- the hillside: a slope rising to the back of the plot
    b.shed(23, 12, 4.4, P.grassDry, { at: [0, 0, -6.8], high: '-z' });
    b.box(23, 0.03, 25, P.grassDry, { at: [0, 0, 0] });
    b.collider(23, 8, { at: [0, 0, -8.8] });
    // ---- lower floor: stone walls and a glass front, its planted roof meeting the slope
    b.box(13, 3.4, 7.5, stone, { at: [-3.5, 0, -1.75] });
    b.collider(13, 7.5, { at: [-3.5, 0, -1.75] });
    for (let y = 0.4; y < 3.3; y += 0.45) b.box(13.05, 0.04, 7.55, tint(stone, -0.1), { at: [-3.5, y, -1.75], jitter: false });
    b.box(13.4, 0.35, 7.9, P.concreteWhite, { at: [-3.5, 3.4, -1.75] });
    b.box(9, 0.3, 7.6, P.grass, { at: [-6.0, 3.75, -1.75] });
    onFace(b, '+z', [-3.5, 0, 2.0], () => {
      b.box(10.6, 3.2, 0.08, P.glass, { at: [-0.4, 0.1, 0.04], mat: 'glass' });
      for (let i = 0; i <= 7; i++) b.box(0.06, 3.2, 0.14, frame, { at: [-5.7 + i * (10.6 / 7), 0.1, 0.07] });
    });
    // ---- upper floor: the weathering steel box, cantilevered toward the view
    b.box(10, 3.0, 7.5, corten, { at: [3.0, 3.75, -2.6] });
    b.collider(10, 6, { at: [3.0, 0, -3.4] });
    for (let i = 0; i < 12; i++) b.box(0.05, 3.0, 7.56, tint(corten, -0.08), { at: [-1.8 + i * 0.85, 3.75, -2.6], jitter: false });
    onFace(b, '+z', [3.0, 0, 1.15], () => {
      b.box(8.4, 1.6, 0.08, P.glassDark, { at: [-0.3, 4.5, 0.04], mat: 'glass' });
      b.box(10, 0.4, 0.6, corten, { at: [0, 6.35, 0.3] });
    });
    onFace(b, '+x', [8.0, 0, -2.6], () => b.box(4.0, 1.6, 0.08, P.glassDark, { at: [0, 4.5, 0.04], mat: 'glass' }));
    b.box(10.2, 0.2, 7.7, P.concreteDark, { at: [3.0, 6.75, -2.6] });
    // a slim steel column under the cantilever tip
    b.box(0.15, 3.75, 0.15, frame, { at: [7.6, 0, 0.8] });
    // ---- terrace and pool
    b.box(20, 0.3, 6.5, stone, { at: [0, 0, 5.3] });
    b.box(9.5, 0.32, 2.6, P.water, { at: [4.5, 0, 6.6], mat: 'glass' });
    b.box(9.7, 0.6, 0.2, stone, { at: [4.5, 0, 8.0] });
    b.box(2.2, 0.8, 0.9, P.concreteWhite, { at: [-6.0, 0.3, 4.6] });
    // dry-stone terrace walls retaining the slope at the sides
    b.sym((s) => b.box(1.8, 2.6, 0.5, stone, { at: [s * 10.6, 0, 1.8] }));
    b.box(0.5, 2.2, 6, stone, { at: [-10.6, 0, -1.2] });
    for (let i = 0; i < 6; i++) b.box(2.6, 0.06, 0.06, frame, { at: [7.5 + (i % 2) * 0.1, 0.45 + i * 0.16, 8.05] });
    // olives on the slope, a cypress by the drive
    for (const [x, z] of [[-8.0, -9.0], [-3.0, -10.5], [2.5, -10.0], [8.5, -9.5]]) {
      b.tree(4.5, { kind: 'olive', at: [x, Math.max(0, Math.min(4.4, (4.4 * (-z - 0.8)) / 12)), z] });
    }
    b.tree(8, { kind: 'cypress', at: [-10.5, 0, 9.5] });
    b.tree(7, { kind: 'cypress', at: [-9.0, 0, 10.5] });
    b.box(3.5, 0.05, 4, P.gravel, { at: [-7.5, 0, 10.5] });
  },
};
