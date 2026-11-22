import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { archOutline, archivolt, goods } from './shared';

const W = 21; // across X
const D = 20; // along Z
const GH = 6.0; // masonry base
const EH = 8.6; // eaves
const RISE = 3.6;

/**
 * An end front: three arches below, and a gable above pierced by a great iron-and-glass lunette.
 * Local frame: front face at z = 0, facing +z.
 */
function endFront(b: Builder, stone: number, wall: number, main: boolean): void {
  b.archWall(W, GH, 0.7, wall, { openings: 3, openW: 3.6, openH: 5.2, shape: 'round' });
  for (const x of [-7, 0, 7]) archivolt(b, 1.8, 0.4, 3.4, 0.12, stone, [x, 0, 0.35], '+z', 8);
  for (const x of [-10.5, -3.5, 3.5, 10.5]) b.box(1.1, GH, 0.2, stone, { at: [x === -10.5 ? -10.0 : x === 10.5 ? 10.0 : x, 0, 0.4] });
  b.box(W + 0.4, 0.45, 0.95, stone, { at: [0, GH - 0.1, 0] });
  // side arches glazed behind an iron grille; the middle one is the way in
  for (const x of [-7, 7]) {
    b.extrude(archOutline(3.6, 5.2, 'round', 4), 0.06, P.glassDark, { at: [x, 0, -0.1], mat: 'glass' });
    for (const dx of [-1.2, -0.6, 0, 0.6, 1.2]) b.box(0.06, Math.min(5.1, 3.4 + Math.sqrt(Math.max(0, 1.8 * 1.8 - dx * dx))), 0.06, P.castIron, { at: [x + dx, 0, 0.05] });
    for (const y of [1.2, 3.4]) b.box(3.6, 0.08, 0.08, P.castIron, { at: [x, y, 0.05] });
  }
  if (!main) {
    b.extrude(archOutline(3.6, 5.2, 'round', 4), 0.08, P.castIron, { at: [0, 0, -0.1] });
  }
  // the gable with its lunette
  const R = 3.3;
  const hole = archOutline(2 * R, R, 'round', 6).map(([x, y]) => [x, y + 0.4] as [number, number]);
  b.extrude([[-W / 2, 0], [W / 2, 0], [W / 2, EH - GH], [0, EH - GH + RISE], [-W / 2, EH - GH]], 0.7, wall, { at: [0, GH + 0.35, 0], holes: [hole] });
  b.extrude(archOutline(2 * R, R, 'round', 6), 0.06, P.glass, { at: [0, GH + 0.75, -0.1], mat: 'glass' });
  archivolt(b, R, 0.35, GH + 0.75, 0.12, stone, [0, 0, 0.35], '+z', 10);
  for (let i = 1; i < 8; i++) {
    const a = (i / 8) * Math.PI;
    b.beam([0, GH + 0.75, 0.0], [Math.cos(a) * R, GH + 0.75 + Math.sin(a) * R, 0.0], 0.08, 0.08, P.castIron);
  }
  b.box(2 * R, 0.1, 0.1, P.castIron, { at: [0, GH + 0.75, 0.0] });
  // coping along the gable and the city arms at the apex
  const sl = Math.atan2(RISE, W / 2);
  for (const s of [-1, 1]) {
    b.group({ at: [s * W / 4, EH + RISE / 2 - 0.1, 0], rot: [0, 0, -s * sl] }, () => b.box(Math.hypot(W / 2, RISE) + 0.3, 0.3, 0.9, stone));
  }
  b.panel(1.0, 1.2, P.white, { at: [0, EH + 1.8, 0.35], shape: 'round', depth: 0.06 });
  b.panel(0.6, 0.75, P.intonacoRed, { at: [0, EH + 2.0, 0.35], shape: 'round', depth: 0.1 }); // the red lily of Florence, simplified
}

export const foodHall: BuildingDef = {
  id: 'food-hall',
  name: 'Market hall restored as a food hall',
  style: 'Nineteenth-century iron market, contemporary reuse',
  date: '1874; reopened 2014',
  summary:
    'The covered market of the 1870s, a masonry base of round arches carrying an iron roof with glazed lanterns, has outlived the shops that emptied it. ' +
    'Restored, it keeps butchers, greengrocers and cheesemongers on the ground floor, while a new mezzanine of steel and glass under the old roof is filled with counters selling food to eat on the spot. ' +
    'The model is Florence’s Mercato Centrale, by Giuseppe Mengoni (architect of Milan’s Galleria), whose upper floor reopened as a food hall in 2014. ' +
    'It is a typical recent Italian project: not a new building, but a new use inserted into an old one.',
  materials: ['stone and stucco base', 'cast iron', 'glass', 'clay tiles', 'steel and glass (new mezzanine)'],
  lookFor: [
    { label: 'Iron and glass lunette', note: 'A great half-round window of iron glazing bars fills the gable and lights the hall.', at: [0, 9.8, 10.4] },
    { label: 'Arcaded masonry base', note: 'Round arches outlined in grey pietra serena carry the iron hall above, a Renaissance dress for an industrial building.', at: [-7, 5.4, 10.4] },
    { label: 'Glazed roof lantern', note: 'A raised strip of glass along the ridge lets in light and lets out heat and smells.', at: [2.4, 12.6, -4.0] },
    { label: 'New mezzanine', note: 'A steel deck with glass balustrades inserted under the old roof, full of tables: the restoration of 2014.', at: [3.0, 5.6, 2.8] },
    { label: 'Clerestory', note: 'A continuous band of iron-framed glass between the masonry and the roof.', at: [-10.6, 7.2, -3.0] },
  ],
  modelledOn: 'The Mercato Centrale, Florence (Giuseppe Mengoni, 1870 to 1874; first floor reopened as a food hall in 2014), reduced',
  influences: ['iron-and-glass', 'rossi-city'],
  build(b) {
    const stone = P.pietraSerena;
    const wall = b.pick([P.intonacoCream, tint(P.intonacoOchre, 0.1)]);
    const y0 = 0.15;

    b.box(25.6, 0.08, 21.6, P.paving, { jitter: false });
    b.box(W + 0.8, y0, D + 0.8, tint(stone, 0.15), { at: [0, 0.0, 0] });

    // ---- the two end fronts, and the long sides: windows in arches, a band of iron and glass above
    b.group({ at: [0, y0, D / 2 - 0.35] }, () => endFront(b, stone, wall, true));
    b.group({ at: [0, y0, -D / 2 + 0.35], rotY: Math.PI }, () => endFront(b, stone, wall, false));
    for (const s of [1, -1] as const) {
      const facing = s > 0 ? '+x' : '-x';
      b.archWall(D - 1.4, GH, 0.7, wall, { at: [s * (W / 2 - 0.35), y0, 0], facing, openings: 6, openW: 2.2, openH: 4.4, sill: 0.9, shape: 'round' });
      for (const z of [-7.55, -4.53, -1.51, 1.51, 4.53, 7.55]) {
        archivolt(b, 1.1, 0.3, y0 + 4.2, 0.1, stone, [s * W / 2, 0, z], facing, 6);
        // iron grilles and glass in the window arches
        b.group({ at: [s * (W / 2 - 0.4), y0 + 0.9, z], rotY: s > 0 ? Math.PI / 2 : -Math.PI / 2 }, () => {
          b.extrude(archOutline(2.2, 4.4, 'round', 3), 0.05, P.glassDark, { mat: 'glass' });
          for (const dx of [-0.55, 0, 0.55]) b.box(0.05, 4.2, 0.08, P.castIron, { at: [dx, 0, 0.05] });
          b.box(2.2, 0.06, 0.08, P.castIron, { at: [0, 2.6, 0.05] });
        });
      }
      for (const z of [-9.4, 9.4]) b.box(0.25, GH, 1.2, stone, { at: [s * (W / 2 + 0.05), y0, z] });
      b.box(0.95, 0.45, D - 0.6, stone, { at: [s * (W / 2 - 0.35), y0 + GH - 0.1, 0] });
      // clerestory: a band of glass with iron mullions
      b.box(0.1, EH - GH - 0.35, D - 1.4, P.glass, { at: [s * (W / 2 - 0.35), y0 + GH + 0.35, 0], mat: 'glass' });
      for (let z = -D / 2 + 1.2; z <= D / 2 - 1.1; z += 1.0) b.box(0.16, EH - GH - 0.35, 0.1, P.castIron, { at: [s * (W / 2 - 0.3), y0 + GH + 0.35, z] });
      b.box(0.5, 0.25, D - 1.2, P.castIron, { at: [s * (W / 2 - 0.35), y0 + EH - 0.25, 0] });
      b.collider(0.8, D, { at: [s * (W / 2 - 0.35), 0, 0] });
    }
    for (const s of [1, -1]) {
      for (const sx of [-1, 1]) b.collider(8.7, 0.8, { at: [sx * 6.15, 0, s * (D / 2 - 0.35)] });
    }

    // ---- the roof: clay tiles, a glazed lantern along the ridge
    const yE = y0 + EH;
    b.gable(W - 0.6, D - 0.7, RISE, P.tileRed, { at: [0, yE, 0], ridge: 'z', overhang: 0.5, thick: 0.18 });
    const lw = 4.4;
    const yL = yE + RISE * (1 - lw / 2 / ((W - 0.6) / 2)) - 0.05;
    b.box(lw, 1.3, D - 2.4, P.glass, { at: [0, yL, 0], mat: 'glass' });
    for (let z = -D / 2 + 1.4; z <= D / 2 - 1.3; z += 1.2) b.box(lw + 0.1, 1.3, 0.1, P.castIron, { at: [0, yL, z] });
    b.gable(lw, D - 2.4, 0.7, P.zinc, { at: [0, yL + 1.3, 0], ridge: 'z', overhang: 0.25 });

    // ---- inside: market stalls below, the new mezzanine above at the back
    const yM = y0 + 4.2;
    const mz0 = -D / 2 + 0.8;
    const mz1 = 3.4;
    const mw = W - 3.6;
    b.box(mw, 0.3, mz1 - mz0, tint(P.steel, -0.1), { at: [0, yM, (mz0 + mz1) / 2] });
    b.box(mw, 0.06, mz1 - mz0, P.oak, { at: [0, yM + 0.3, (mz0 + mz1) / 2] }); // oak floor
    b.deck(mw, mz1 - mz0, yM + 0.36, { at: [0, 0, (mz0 + mz1) / 2] });
    for (const x of [-6, -2, 2, 6]) {
      b.cyl(0.12, yM - y0, P.steel, { at: [x, y0, mz1 - 0.3], segs: 6 });
      b.collider(0.3, 0.3, { at: [x, 0, mz1 - 0.3] });
    }
    b.box(mw, 1.05, 0.05, P.glass, { at: [0, yM + 0.36, mz1 - 0.05], mat: 'glass' }); // glass balustrade
    b.box(mw, 0.06, 0.1, P.steel, { at: [0, yM + 1.4, mz1 - 0.05] });
    // the new stair, steel, rising along the west side
    for (let i = 0; i < 14; i++) b.box(1.4, 0.06, 0.32, P.steel, { at: [-W / 2 + 1.8, y0 + 0.3 * (i + 1), mz1 + 4.2 - i * 0.3] });
    b.beam([-W / 2 + 1.05, y0, mz1 + 4.4], [-W / 2 + 1.05, yM + 0.3, mz1 + 0.2], 0.12, 0.3, P.steel);
    b.beam([-W / 2 + 2.55, y0, mz1 + 4.4], [-W / 2 + 2.55, yM + 0.3, mz1 + 0.2], 0.12, 0.3, P.steel);
    b.collider(1.8, 4.2, { at: [-W / 2 + 1.8, 0, mz1 + 2.3] });
    // tables and stools on the mezzanine, and food counters along the back
    for (const x of [-5.4, -2.2, 1.0, 4.2]) {
      for (const z of [0.8, -2.4]) {
        b.cyl(0.45, 0.05, P.white, { at: [x, yM + 1.08, z], segs: 8 });
        b.cyl(0.05, 0.72, P.timberBlack, { at: [x, yM + 0.36, z], segs: 4 });
        for (const dx of [-0.75, 0.75]) b.cyl(0.2, 0.6, b.pick([P.cladYellow, P.cladRed, P.timberBlack]), { at: [x + dx, yM + 0.36, z], segs: 6 });
      }
    }
    for (const x of [-6, -1.5, 3, 7.5 - 1.5]) {
      b.box(3.6, 1.1, 1.0, P.timberBlack, { at: [x, yM + 0.36, mz0 + 0.9] });
      b.box(3.6, 0.6, 0.1, b.pick([P.cladYellow, P.cladRed, P.cladGreen, P.white]), { at: [x, yM + 2.2, mz0 + 0.5] }); // signs
    }
    // ground-floor stalls: the traditional market goes on underneath
    for (const x of [-5.5, 0, 5.5]) {
      for (const z of [6.0, -1.5, -6.5]) {
        if (x === 0 && z === 6.0) continue; // the way in
        b.box(3.4, 0.9, 1.4, P.cladWhite, { at: [x, y0, z] });
        b.box(3.6, 0.06, 1.6, P.marble, { at: [x, y0 + 0.9, z] });
        goods(b, 3.0, [x, y0 + 0.96, z], 0, b.pick([['fruit', 'basket'], ['cheese', 'pot'], ['fish'], ['basket', 'fruit', 'sack']] as const).slice());
        b.box(0.06, 2.4, 0.06, P.steel, { at: [x - 1.6, y0, z - 0.7] });
        b.box(0.06, 2.4, 0.06, P.steel, { at: [x + 1.6, y0, z - 0.7] });
        b.box(3.3, 0.45, 0.06, b.pick([P.doorGreen, P.doorRed, P.doorBlue]), { at: [x, y0 + 2.0, z - 0.7] });
        b.collider(3.6, 1.6, { at: [x, 0, z] });
      }
    }

    // ---- outside: a new steel and glass canopy over the main door, tables in the street
    b.box(6.0, 0.12, 0.9, P.steel, { at: [0, y0 + 4.4, D / 2 + 0.35] });
    b.box(6.0, 0.04, 0.8, P.glass, { at: [0, y0 + 4.52, D / 2 + 0.35], mat: 'glass' });
    b.box(4.4, 0.5, 0.08, P.timberBlack, { at: [0, y0 + 4.55, D / 2 + 0.78] });
    b.box(3.6, 0.22, 0.04, P.white, { at: [0, y0 + 4.69, D / 2 + 0.83], jitter: false });
    for (const [x, z] of [
      [-11.6, 6.4],
      [-11.6, 2.6],
      [11.6, 6.4],
      [11.6, -1.4],
    ] as [number, number][]) {
      b.cyl(0.4, 0.04, P.white, { at: [x, 0.78, z], segs: 8 });
      b.cyl(0.04, 0.7, P.timberBlack, { at: [x, 0.08, z], segs: 4 });
      b.cyl(0.04, 2.4, P.timberBlack, { at: [x, 0.08, z], segs: 4 });
      b.cone(1.3, 0.5, P.cream, { at: [x, 2.1, z], segs: 8 }); // umbrella
    }
  },
};
