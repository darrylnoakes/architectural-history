import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { coppiRoof, patch, railing, shuttered } from './shared';

const FH = 3.0;

/**
 * One INA-Casa block in its own frame (front +z): a concrete frame left showing as floor bands and
 * posts, brick infill, wooden shutters, iron-railed balconies, a pitched tile roof, an outside stair at
 * one end if `stair`.
 */
function block(b: Builder, w: number, d: number, floors: number, o: { brick: number; roof: number; shutter: number; stair: boolean; bays: number }): void {
  const conc = P.concreteWhite;
  const H = floors * FH;
  const bw = w / o.bays;
  b.box(w, H, d, o.brick, { at: [0, 0, 0] });
  // the frame: floor bands and posts, slightly proud of the brick
  for (let f = 0; f <= floors; f++) b.box(w + 0.1, 0.28, d + 0.1, conc, { at: [0, Math.min(f * FH, H - 0.28) - (f === 0 ? 0 : 0.14), 0] });
  for (let k = 0; k <= o.bays; k++) {
    const x = -w / 2 + k * bw;
    for (const s of [-1, 1]) b.box(0.3, H, 0.1, conc, { at: [x, 0, s * (d / 2 + 0.02)] });
  }
  for (const s of [-1, 1]) for (const z of [-d / 2, 0, d / 2]) b.box(0.1, H, 0.3, conc, { at: [s * (w / 2 + 0.02), 0, z] });
  coppiRoof(b, w, d, 24, o.roof, { at: [0, H, 0], ov: 0.55, wall: o.brick, rib: 0.6 });
  // front: each bay a window or a balcony door; balconies on alternate bays from the first floor up
  for (let f = 0; f < floors; f++) {
    const y = f * FH;
    for (let k = 0; k < o.bays; k++) {
      const x = -w / 2 + (k + 0.5) * bw;
      const balcony = f > 0 && k % 2 === (f % 2);
      if (f === 0 && k === Math.floor(o.bays / 2)) {
        // the entrance: a door under a concrete canopy, and the ceramic INA-Casa plaque
        b.window(1.4, 2.3, { at: [x, 0.05, d / 2], facing: '+z', frame: P.oak, glass: P.glassDark, bars: [2, 3], border: 0.08 });
        b.box(2.0, 0.14, 1.0, conc, { at: [x, 2.5, d / 2 + 0.5] });
        b.panel(0.45, 0.45, P.cladBlue, { at: [x + 1.1, 1.6, d / 2], facing: '+z', depth: 0.04 });
        b.panel(0.35, 0.35, P.faience, { at: [x + 1.1, 1.65, d / 2], facing: '+z', depth: 0.06 });
        continue;
      }
      if (balcony) {
        shuttered(b, x, y + 0.25, d / 2, 0.95, 2.1, '+z', { shutter: o.shutter, open: true, louvred: true, sill: false, frame: P.oak });
        b.box(bw - 0.5, 0.14, 1.1, conc, { at: [x, y + 0.14, d / 2 + 0.55] });
        railing(b, [x - (bw - 0.6) / 2, y + 0.28, d / 2 + 1.05], [x + (bw - 0.6) / 2, y + 0.28, d / 2 + 1.05], 0.95, P.iron, 0.2);
      } else {
        shuttered(b, x, y + 1.0, d / 2, 1.05, 1.3, '+z', { shutter: o.shutter, open: b.chance(0.6), surround: P.travertine, frame: P.oak });
      }
      // back: kitchen and bathroom windows, smaller
      b.window(0.8, 1.1, { at: [x, y + 1.1, -d / 2], facing: '-z', frame: P.oak, glass: P.windowDark, border: 0.07 });
    }
  }
  // a chimney stack and a TV-less roofline
  b.box(0.7, 1.8, 0.7, o.brick, { at: [w / 4, H + 0.6, -0.8] });
  b.box(0.9, 0.12, 0.9, conc, { at: [w / 4, H + 2.4, -0.8] });
  // outside stair up the end wall to the first floor
  if (o.stair) {
    const sx = w / 2 + 0.7;
    const steps = 14;
    const z0 = d / 2 - 0.2;
    const z1 = -d / 2 + 1.6;
    const run = (z0 - z1) / steps;
    for (let k = 0; k < steps; k++) b.box(1.1, 0.16, run + 0.02, conc, { at: [sx, ((k + 1) * FH) / steps - 0.16, z0 - (k + 0.5) * run] });
    b.beam([sx, 0, z0], [sx, FH - 0.2, z1], 0.25, 0.3, conc);
    b.box(1.2, 0.18, 1.6, conc, { at: [sx, FH - 0.18, z1 - 0.8] });
    b.box(0.25, FH - 0.18, 0.25, conc, { at: [sx + 0.4, 0, z1 - 1.4] });
    railing(b, [sx + 0.55, 0.16, z0], [sx + 0.55, FH, z1], 0.95, P.iron, 0.25);
    b.panel(0.95, 2.1, P.oak, { at: [w / 2, FH, z1 - 0.8], facing: '+x', depth: 0.06 });
  }
}

export const inaCasa: BuildingDef = {
  id: 'ina-casa',
  name: 'INA-Casa housing',
  style: 'Neorealism',
  date: 'c. 1954',
  summary:
    'The INA-Casa plan (1949 to 1963), paid for by deductions from wages, built some 350,000 homes across Italy, partly to give work to the unemployed, so it chose simple methods that used a lot of labour: a concrete frame filled with brick, pitched tile roofs, wooden shutters. ' +
    'Its architects, reacting against the monumental blocks of the Fascist years, wanted estates that felt like a village: blocks of three and four storeys set at angles to one another, with balconies, outside stairs and green space between. ' +
    'The Tiburtino quarter in Rome (1950 to 1954, by Ludovico Quaroni, Mario Ridolfi and their team) is the best-known example of this "neorealist" architecture.',
  materials: ['reinforced concrete frame', 'brick infill', 'coppi roofs', 'wooden persiane', 'iron railings'],
  modelledOn: 'The INA-Casa Tiburtino quarter, Rome (1950 to 1954; Ludovico Quaroni, Mario Ridolfi and others)',
  lookFor: [
    { label: 'Exposed concrete frame', note: 'The floor slabs and posts are left showing as white bands round panels of brick.', at: [-10.5, 6.2, 5.2] },
    { label: 'Blocks set at angles', note: 'The blocks turn away from the street and from each other, as the houses of a hill village do.', at: [6.8, 10.4, -2.2] },
    { label: 'Balconies', note: 'Every flat has a balcony with an iron railing, staggered across the front.', at: [-3.0, 4.6, 5.8] },
    { label: 'Outside stair', note: 'An open concrete stair climbs the end wall to the first-floor flats, a nod to the rural profferlo.', at: [11.2, 1.8, 1.4] },
    { label: 'Pitched tile roof', note: 'A traditional tiled roof instead of the flat roof of modern architecture: part of the wish to build homely, local houses.', at: [-5.0, 14.0, 1.2] },
  ],
  influences: [],
  build(b) {
    const brick = b.pick([P.brickOrange, P.brickRed, tint(P.brickOrange, 0.04), P.cotto]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const shutter = b.pick([P.oak, P.pine, P.cedar]);

    patch(b, 26, 16, P.grass, [0, 0], 0.02);
    patch(b, 26, 1.6, P.paving, [0, 7.2], 0.1);
    // paths that wander between the blocks
    patch(b, 1.6, 4.0, P.gravel, [-5.2, 6.4], 0.05);
    b.group({ at: [3.4, 0, 2.6], rotY: 0.5 }, () => patch(b, 1.6, 9.0, P.gravel, [0, 0], 0.05));

    const ra = -0.12 + b.range(-0.04, 0.04);
    const rb = 0.32 + b.range(-0.03, 0.03);
    b.group({ at: [-5.0, 0, 1.2], rotY: ra }, () => block(b, 14.0, 7.6, 4, { brick, roof, shutter, stair: false, bays: 6 }));
    b.group({ at: [6.8, 0, -2.2], rotY: rb }, () => block(b, 7.8, 7.2, 3, { brick: tint(brick, 0.03), roof, shutter, stair: true, bays: 4 }));

    // umbrella pines and young trees, a bench, a low wall to the street
    b.tree(6.5, { at: [-9.8, 0, -5.2], kind: 'pine' });
    b.tree(6.0, { at: [0.2, 0, -5.4], kind: 'pine' });
    b.tree(3.5, { at: [10.6, 0, 5.6], kind: 'round' });
    b.tree(3.0, { at: [4.6, 0, 6.0], kind: 'round' });
    b.box(1.8, 0.45, 0.45, P.travertine, { at: [2.4, 0, 6.6] });
    b.box(9.0, 0.6, 0.3, P.travertine, { at: [-8.0, 0, 7.75] });

    b.collider(14.0, 7.6, { at: [-5.0, 0, 1.2], rotY: ra });
    b.collider(9.1, 7.2, { at: [6.8 + 0.65 * Math.cos(rb), 0, -2.2 - 0.65 * Math.sin(rb)], rotY: rb });
  },
};
