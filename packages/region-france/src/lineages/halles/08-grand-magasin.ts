import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { ironColumn, paving, planSolid, railing, slab } from './shared';

const STONE = P.pierreBlonde;
const IRON = tint(P.castIron, 0.05);
const GLASS = P.glassDark;
const ZINC = P.zincParis;
// floor levels: ground, first, second, third, cornice, top of the mansard
const LV = [0.1, 5.2, 9.4, 13.4, 17.0];
const YM = 20.3;
// the light well
const WX = 4.5;
const WZ0 = -4.5;
const WZ1 = 2.5;
const G = 0.9; // depth of the galleries round it

/**
 * One street front: stone piers, a plate-glass shop window and a striped awning in every bay,
 * a frieze for the name, two floors of great iron-framed windows, a third with balconies, a cornice.
 * Local frame: face at z = 0 running along x for `len`, facing +z.
 */
function front(b: Builder, len: number, at: Vec3, rotY: number, bays: number, awning: [number, number], doors: number[] = []): void {
  b.group({ at, rotY }, () => {
    const p = len / bays;
    for (let i = 0; i < bays; i++) {
      const x = -len / 2 + (i + 0.5) * p;
      const w = p - 0.8;
      if (doors.includes(i)) {
        b.panel(w, 3.6, IRON, { at: [x, LV[0], 0], depth: 0.08 });
        b.panel(w - 0.3, 3.4, GLASS, { at: [x, LV[0], 0], depth: 0.1, mat: 'glass' });
        b.panel(0.06, 3.4, IRON, { at: [x, LV[0], 0], depth: 0.12 });
        b.box(w + 0.6, 0.12, 0.95, IRON, { at: [x, 3.9, 0.48] }); // iron and glass canopy
        b.box(w + 0.4, 0.04, 0.85, P.glass, { at: [x, 4.02, 0.48], mat: 'glass' });
      } else {
        b.panel(w, 3.9, IRON, { at: [x, LV[0] + 0.5, 0], depth: 0.07 });
        b.panel(w - 0.25, 3.65, GLASS, { at: [x, LV[0] + 0.62, 0], depth: 0.1, mat: 'glass' });
        b.panel(w, 0.5, tint(STONE, -0.05), { at: [x, LV[0], 0], depth: 0.1 });
        // the awning, let down in stripes
        const n = 3;
        for (let k = 0; k < n; k++) {
          b.box(w / n, 0.04, 0.95, k % 2 ? awning[1] : awning[0], { at: [x - w / 2 + (k + 0.5) * (w / n), 3.98, 0.45], rot: [0.5, 0, 0], jitter: false });
        }
        b.box(w, 0.25, 0.03, awning[0], { at: [x, 3.48, 0.86] });
      }
      // first and second floors: tall windows filling the bay, iron mullions and transoms
      for (const [y0, y1] of [[LV[1] + 0.4, LV[2] - 0.5], [LV[2] + 0.4, LV[3] - 0.5]]) {
        b.panel(w, y1 - y0, IRON, { at: [x, y0, 0], depth: 0.07 });
        b.panel(w - 0.2, y1 - y0 - 0.2, GLASS, { at: [x, y0 + 0.1, 0], depth: 0.1, mat: 'glass' });
        b.panel(0.07, y1 - y0 - 0.2, IRON, { at: [x, y0 + 0.1, 0], depth: 0.12 });
      }
      // third floor: a pair of windows over a balcony
      for (const dx of [-w / 4, w / 4]) b.window(w / 2 - 0.35, 2.3, { at: [x + dx, LV[3] + 0.5, 0], frame: STONE, glass: GLASS });
      b.box(w, 0.12, 0.55, STONE, { at: [x, LV[3] + 0.35, 0.27] });
      b.box(w, 0.05, 0.05, IRON, { at: [x, LV[3] + 1.25, 0.52] });
    }
    // piers, the name frieze, string courses and cornice
    for (let i = 0; i <= bays; i++) {
      const x = -len / 2 + i * p;
      b.box(0.8, LV[4] - LV[0], 0.3, STONE, { at: [x, LV[0], 0.05] });
    }
    b.box(len, 0.9, 0.2, P.timberBlack, { at: [0, LV[1] - 0.9, 0.08] });
    for (let i = 0; i < bays; i++) b.box(p - 1.6, 0.4, 0.06, P.gold, { at: [-len / 2 + (i + 0.5) * p, LV[1] - 0.7, 0.2] }); // gilt lettering
    b.box(len, 0.35, 0.35, STONE, { at: [0, LV[2] - 0.2, 0.1] });
    b.box(len, 0.25, 0.3, STONE, { at: [0, LV[3], 0.1] });
    b.box(len + 0.3, 0.6, 0.7, STONE, { at: [0, LV[4] - 0.2, 0.25] });
  });
}

export const grandMagasin: BuildingDef = {
  id: 'grand-magasin',
  name: 'Department store (grand magasin)',
  style: 'Belle Époque, iron frame behind a stone front',
  date: 'c. 1895',
  summary:
    'The department store is a Paris invention, and the town gets its own. Shopping is turned into a show: anyone may walk in without being expected to buy, prices are fixed and marked, and goods can be returned. ' +
    'To sell everything under one roof the store needs huge, light floors, so it is built on an iron frame with walls of plate glass between stone piers, round a central light well with galleries on every floor and a grand staircase rising through it. ' +
    'A dome on the corner advertises it down two streets. The model is Aristide Boucicaut’s Au Bon Marché in Paris, rebuilt from 1869 and finished in 1887, its iron extension of the 1870s by Louis-Auguste Boileau with Gustave Eiffel’s firm; from the 1890s chains such as the Nouvelles Galeries brought the type to provincial towns.',
  materials: ['cut stone fronts', 'iron and steel frame', 'plate glass', 'zinc and slate', 'oak and marble inside'],
  lookFor: [
    { label: 'Corner dome', note: 'The store’s landmark, set on the corner so it can be seen down both streets.', at: [8.4, 24.0, 6.4] },
    { label: 'Great glazed front', note: 'Between narrow stone piers the walls are nearly all glass, possible only because iron columns carry the floors inside.', at: [-4.5, 8.0, 10.2] },
    { label: 'Light well', note: 'The middle of the store is open from the ground to a glass roof, with galleries round it on every floor. The glass is left off here to show it.', at: [0, 17.6, -1.0] },
    { label: 'Grand staircase', note: 'A double staircase rises in the light well, so that customers see the whole store, and each other, as they climb.', at: [0, 3.2, -1.6] },
    { label: 'Display windows and awnings', note: 'Plate-glass windows on the street, shaded by striped awnings, show the goods to passers-by.', at: [-8.0, 3.0, 10.9] },
  ],
  modelledOn: 'Au Bon Marché, Paris (begun 1869; Louis-Auguste Boileau with the engineering firm of Gustave Eiffel in the 1870s, then his son Louis-Charles Boileau, completed in stages to 1887), much reduced; the corner dome is more like the Printemps or the provincial Nouvelles Galeries',
  influences: ['iron-and-rail'],
  build(b) {
    const open = b.cutaway;
    const awning = b.pick([
      [P.cladRed, P.white],
      [P.doorGreen, P.cream],
      [P.doorBlue, P.white],
    ] as [number, number][]);
    paving(b, 25.8, 21.8, P.paving, 0.1, [0, 0, 0], 8);
    // curbs on the two street sides
    b.box(25.8, 0.16, 0.25, P.granite, { at: [0, 0, 10.75] });
    b.box(0.25, 0.16, 21.8, P.granite, { at: [12.78, 0, 0] });

    // ---- the block: one solid with the corner cut off and the light well through it
    const outer: [number, number][] = [[-12, -10], [12, -10], [12, 7], [9, 10], [-12, 10]];
    const well: [number, number][] = [[-WX, WZ0], [WX, WZ0], [WX, WZ1], [-WX, WZ1]];
    planSolid(b, outer.map(([x, z]) => [x * 0.99, z * 0.99] as [number, number]), LV[4] - LV[0], tint(STONE, -0.08), LV[0], undefined, [well]);
    b.collider(24, 20);
    // the mansard: a steep zinc slope on every side, flat on top, dormers, the light well continuing through
    const inset: [number, number][] = [[-10.8, -8.8], [10.8, -8.8], [10.8, 6.5], [8.5, 8.8], [-10.8, 8.8]];
    planSolid(b, inset, YM - LV[4] - 0.05, ZINC, LV[4], undefined, [well]);
    const runs: [number, number, number, number][] = [
      [-12, 10, 9, 10],
      [9, 10, 12, 7],
      [12, 7, 12, -10],
      [12, -10, -12, -10],
      [-12, -10, -12, 10],
    ];
    const insets: [number, number, number, number][] = [
      [-10.8, 8.8, 8.5, 8.8],
      [8.5, 8.8, 10.8, 6.5],
      [10.8, 6.5, 10.8, -8.8],
      [10.8, -8.8, -10.8, -8.8],
      [-10.8, -8.8, -10.8, 8.8],
    ];
    const yb = LV[4] + 0.4;
    for (let i = 0; i < runs.length; i++) {
      const [ax, az, cx, cz] = runs[i];
      const [ix, iz, jx, jz] = insets[i];
      slab(b, [[ax * 1.005, yb, az * 1.005], [cx * 1.005, yb, cz * 1.005], [jx, YM, jz], [ix, YM, iz]], 0.15, P.ardoise);
      // dormers (oeils-de-boeuf) along the slope, one per bay
      const len = Math.hypot(cx - ax, cz - az);
      const n = Math.max(1, Math.round(len / 5.5));
      const ang = Math.atan2(cx - ax, cz - az) - Math.PI / 2;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const px = ax + (cx - ax) * t + (ix - ax) * 0.45;
        const pz = az + (cz - az) * t + (iz - az) * 0.45;
        b.group({ at: [px, yb + 1.2, pz], rotY: ang }, () => {
          b.box(1.2, 1.4, 0.8, STONE, { at: [0, 0, -0.2] });
          b.panel(0.7, 0.7, GLASS, { at: [0, 0.35, 0.2], shape: 'circle', depth: 0.05 });
          b.cyl(0.65, 0.2, ZINC, { at: [0, 1.35, -0.2], segs: 6 });
        });
      }
    }

    // ---- the street fronts on all four sides
    front(b, 21, [-1.5, 0, 10], 0, 5, awning, [2]);
    front(b, 17, [12, 0, -1.5], Math.PI / 2, 4, awning, [1]);
    front(b, 24, [0, 0, -10], Math.PI, 5, awning, [2]);
    front(b, 20, [-12, 0, 0], -Math.PI / 2, 4, awning);
    // the corner: the main entrance under a canopy, the name in a cartouche
    front(b, 4.2, [10.5, 0, 8.5], Math.PI / 4, 1, awning, [0]);

    // ---- the corner dome: an eight-sided drum with round windows, a slate dome, a gilded lantern
    b.group({ at: [8.4, YM - 0.2, 6.4] }, () => {
      b.cyl(2.6, 3.4, STONE, { segs: 8, rotY: Math.PI / 8 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.window(1.1, 1.1, { at: [Math.sin(a) * 2.42, 1.0, Math.cos(a) * 2.42], facing: a, frame: P.white, glass: GLASS, shape: 'circle' });
        b.box(0.35, 3.4, 0.35, tint(STONE, 0.04), { at: [Math.sin(a + Math.PI / 8) * 2.45, 0, Math.cos(a + Math.PI / 8) * 2.45] });
      }
      b.cyl(2.9, 0.4, STONE, { at: [0, 3.4, 0], segs: 8, rotY: Math.PI / 8 });
      b.lathe([[2.7, 0], [2.55, 1.2], [2.0, 2.4], [1.1, 3.3], [0.5, 3.6]], P.ardoise, { at: [0, 3.8, 0], segs: 12 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.beam([Math.sin(a) * 2.72, 3.85, Math.cos(a) * 2.72], [Math.sin(a) * 1.15, 7.1, Math.cos(a) * 1.15], 0.14, 0.12, P.gold);
      }
      b.cyl(0.55, 1.3, STONE, { at: [0, 7.3, 0], segs: 8 });
      b.cone(0.7, 1.2, P.ardoise, { at: [0, 8.6, 0], segs: 8 });
      b.sphere(0.25, P.gold, { at: [0, 9.9, 0], segs: 8 });
      b.cyl(0.03, 1.8, IRON, { at: [0, 10.0, 0], segs: 4 });
      b.box(0.9, 0.55, 0.03, P.cladBlue, { at: [0.45, 11.1, 0] });
    });

    // ---- the light well: galleries on each floor, iron columns, the staircase, the glass roof
    for (const y of [LV[1], LV[2], LV[3]]) {
      // the gallery floor projecting into the well
      for (const s of [-1, 1]) {
        b.box(2 * WX, 0.3, G, P.plaster, { at: [0, y - 0.3, s > 0 ? WZ1 - G / 2 : WZ0 + G / 2] });
        b.box(G, 0.3, WZ1 - WZ0 - 2 * G, P.plaster, { at: [s * (WX - G / 2), y - 0.3, (WZ0 + WZ1) / 2] });
        b.box(2 * WX, 0.12, 0.1, P.gold, { at: [0, y - 0.3, s > 0 ? WZ1 - G : WZ0 + G] });
      }
      // the gallery railings
      const ax = WX - G;
      const z0 = WZ0 + G;
      const z1 = WZ1 - G;
      railing(b, [-ax, y, z0], [ax, y, z0], 1.0, IRON, 1.2);
      railing(b, [-ax, y, z1], [ax, y, z1], 1.0, IRON, 1.2);
      railing(b, [ax, y, z0], [ax, y, z1], 1.0, IRON, 1.2);
      railing(b, [-ax, y, z0], [-ax, y, z1], 1.0, IRON, 1.2);
    }
    // the walls of the well: shop floors seen through, warm light
    for (let f = 0; f < 4; f++) {
      const y0 = LV[f] + 0.2;
      const h = LV[f + 1] - LV[f] - 0.6;
      b.panel(2 * WX - 0.4, h, P.windowLit, { at: [0, y0, WZ0 + 0.01], depth: 0.02 });
      b.panel(2 * WX - 0.4, h, P.windowLit, { at: [0, y0, WZ1 - 0.01], facing: '-z', depth: 0.02 });
      b.panel(WZ1 - WZ0 - 0.4, h, P.windowLit, { at: [WX - 0.01, y0, (WZ0 + WZ1) / 2], facing: '-x', depth: 0.02 });
      b.panel(WZ1 - WZ0 - 0.4, h, P.windowLit, { at: [-WX + 0.01, y0, (WZ0 + WZ1) / 2], facing: '+x', depth: 0.02 });
    }
    for (const [x, z] of [[-WX + G, WZ0 + G], [WX - G, WZ0 + G], [-WX + G, WZ1 - G], [WX - G, WZ1 - G], [0, WZ0 + G]] as [number, number][]) {
      ironColumn(b, LV[4] - LV[0], [x, LV[0], z], 0.13, IRON);
    }
    // the grand staircase: one wide flight to a landing, two flights back up to the first gallery
    const sm = tint(P.marble, -0.04);
    b.stairs(2.4, 2.6, 3.2, 12, sm, { at: [0, LV[0], 0.6] });
    b.box(7.2, 2.6, 1.3, sm, { at: [0, LV[0], -1.65] });
    for (const s of [-1, 1]) {
      b.box(1.4, 2.6, 2.6, tint(sm, -0.05), { at: [s * 2.9, LV[0], 0.3] });
      b.stairs(1.4, 2.5, 2.6, 10, sm, { at: [s * 2.9, LV[0] + 2.6, 0.3], rotY: Math.PI });
      railing(b, [s * 2.2, LV[0] + 2.6, -1.0], [s * 2.2, LV[1], 1.6], 0.95, P.gold, 0.5);
    }
    for (const s of [-1, 1]) railing(b, [s * 1.2, LV[0], 2.2], [s * 1.2, LV[0] + 2.6, -1.0], 0.95, P.gold, 0.5);
    b.box(9, 0.02, 7, P.marble, { at: [0, LV[0], (WZ0 + WZ1) / 2], jitter: false });
    // the glass roof over the well
    const yR = YM;
    if (!open) b.hip(2 * WX + 0.4, WZ1 - WZ0 + 0.4, 1.8, P.glass, { at: [0, yR, (WZ0 + WZ1) / 2], mat: 'glass' });
    for (let x = -WX; x <= WX + 0.01; x += 1.5) {
      const zc = (WZ0 + WZ1) / 2;
      const hz = (WZ1 - WZ0) / 2 + 0.2;
      const top = Math.min(yR + 1.8, yR + 1.8 * (1 - Math.max(0, Math.abs(x) - (WX - hz + 0.2)) / hz));
      for (const s of [-1, 1]) b.beam([x, yR + 0.02, zc + s * hz], [x, top + 0.02, zc], 0.08, 0.1, IRON);
    }
    b.box(2 * WX + 0.6, 0.25, 0.25, IRON, { at: [0, yR - 0.2, WZ0 - 0.2] });
    b.box(2 * WX + 0.6, 0.25, 0.25, IRON, { at: [0, yR - 0.2, WZ1 + 0.2] });
  },
};
