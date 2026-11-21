import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { PW, patch, railing, shuttered, washing } from './shared';

const G = 3.3; // ground storey
const FH = 3.0;
const ZF = 6.8; // street front
const ZR = 2.0; // back of the street range
const WZ = -5.6; // back end of the wings
const LX = -8.4; // inner face of the left wing
const RX = 8.4; // inner face of the right wing
const XE = 12.4; // outer faces

/** The curving "barocchetto" gable over the entrance bay: concave then convex sides, a flat top with a cap. */
function curvedGable(b: Builder, w: number, h: number, color: number, at: [number, number, number], depth: number): void {
  const pts: [number, number][] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s = t * t * (3 - 2 * t); // S-curve
    pts.push([-w / 2 + (w / 2 - 0.7) * s, h * t]);
  }
  for (let i = n; i >= 0; i--) {
    const [x, y] = pts[i];
    pts.push([-x, y]);
  }
  b.extrude(pts.slice(0, n + 1).concat(pts.slice(n + 1)), depth, color, { at });
}

export const casePopolari: BuildingDef = {
  id: 'case-popolari',
  name: 'Case popolari',
  style: 'Barocchetto (garden-suburb public housing)',
  date: 'c. 1926',
  summary:
    'From 1903 a national law let towns set up institutes for "case popolari", public housing let at low rents, and after the First World War they built whole new quarters. ' +
    'Rome’s Garbatella, begun in 1920, set the pattern: blocks of three storeys round shared gardens with wash-houses, in a homely style later nicknamed "barocchetto" (little Baroque), with curved gables, arched loggias, deep eaves and warm plaster. ' +
    'It was meant to feel like a village rather than a barracks; from the later 1920s the Fascist regime used such estates, and the larger blocks that followed, to show what it was doing for workers.',
  materials: ['brick, plastered in ochre and red', 'travertine and plaster trim', 'coppi roofs', 'wooden persiane'],
  modelledOn: 'The Garbatella, Rome (from 1920; Innocenzo Sabbatini, Plinio Marconi and others for the Istituto Case Popolari)',
  lookFor: [
    { label: 'Curved gable', note: 'The entrance bay rises into a curving gable with a round window: the "barocchetto" touch that gives each block its own face.', at: [0, 12.2, ZF + 0.6] },
    { label: 'Arched loggia', note: 'An open loggia of round arches on the top floor, a place to sit and dry washing out of the sun.', at: [9.6, G + FH + 1.4, ZF + 0.3] },
    { label: 'Shared garden', note: 'The blocks stand round a garden for the tenants, with paths, trees and plots for vegetables.', at: [-3.4, 0.8, -3.0] },
    { label: 'Wash-house (lavatoio)', note: 'A roofed shed with stone tubs in the garden, where the women of the block did the laundry together.', at: [3.2, 2.6, -4.2] },
    { label: 'Deep eaves', note: 'Wide overhanging tiled eaves on carved rafter ends, a cottage-like detail borrowed from the countryside.', at: [-6.0, G + FH * 2 + 0.1, ZF + 0.7] },
  ],
  influences: [],
  build(b) {
    const plaster = b.pick([P.intonacoOchre, P.intonacoRose, P.intonacoSienna, tint(P.intonacoOchre, -0.04)]);
    const trim = b.pick([P.intonacoCream, P.travertine]);
    const base = tint(plaster, -0.12);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const shut = b.pick([P.doorGreen, P.oak, tint(P.doorGreen, 0.08)]);
    const top = G + FH * 2;
    const fd = ZF - ZR;
    const fzc = (ZF + ZR) / 2;

    patch(b, PW, 8 - ZF, P.paving, [0, (ZF + 8) / 2], 0.12);
    patch(b, RX - LX, ZR + 8, P.grass, [0, (ZR - 8) / 2], 0.03);

    // the street range
    b.box(XE * 2, top, fd, plaster, { at: [0, 0, fzc] });
    b.box(XE * 2 + 0.06, 0.9, fd + 0.06, base, { at: [0, 0, fzc] });
    b.box(XE * 2 + 0.06, 0.14, fd + 0.06, trim, { at: [0, G - 0.1, fzc] });
    b.hip(XE * 2 + 1.4, fd + 1.4, 1.9, roof, { at: [0, top - 0.25, fzc] });
    for (let x = -XE + 0.2; x <= XE; x += 0.7) b.box(0.1, 0.12, 0.6, P.oakDark, { at: [x, top - 0.3, ZF + 0.3] });

    // the entrance bay: slightly forward and taller, a curved gable with an oculus, a rusticated arched door
    const ew = 4.2;
    b.box(ew, top + 1.6, 0.5, plaster, { at: [0, 0, ZF + 0.25] });
    curvedGable(b, ew, 2.2, plaster, [0, top + 1.6, ZF + 0.25], 0.5);
    b.box(1.0, 0.15, 0.6, trim, { at: [0, top + 3.8, ZF + 0.25] });
    b.panel(0.9, 0.9, trim, { at: [0, top + 1.9, ZF + 0.5], facing: '+z', shape: 'circle', depth: 0.05 });
    b.panel(0.65, 0.65, P.windowDark, { at: [0, top + 2.02, ZF + 0.5], facing: '+z', shape: 'circle', depth: 0.07 });
    for (let k = 0; k < 6; k++) {
      const y = k * 0.5;
      for (const s of [-1, 1]) b.box(0.55 + (k % 2) * 0.2, 0.42, 0.12, trim, { at: [s * 1.25, y, ZF + 0.52] });
    }
    b.panel(2.0, 3.0, trim, { at: [0, 0, ZF + 0.5], facing: '+z', shape: 'round', depth: 0.06 });
    b.panel(1.6, 2.75, P.oakDark, { at: [0, 0, ZF + 0.5], facing: '+z', shape: 'round', depth: 0.09 });
    for (let f = 1; f < 3; f++) {
      shuttered(b, 0, G + (f - 1) * FH + 0.8, ZF + 0.5, 0.9, 1.5, '+z', { shutter: shut, surround: trim, open: true, louvred: true });
    }
    // windows of the street front, a balcony each side on the first floor
    const xs = [-11.0, -8.3, -5.6, -2.9, 2.9, 5.6, 8.3, 11.0];
    for (const x of xs) {
      b.window(1.0, 1.4, { at: [x, 1.0, ZF], facing: '+z', frame: trim, glass: P.windowDark, bars: [2, 2], border: 0.09 });
      for (let f = 0; f < 2; f++) {
        const y = G + f * FH + 0.8;
        if (f === 1 && x > 7) continue; // the loggia
        if (f === 0 && Math.abs(x) === 5.6) {
          shuttered(b, x, y - 0.75, ZF, 1.0, 2.25, '+z', { shutter: shut, surround: trim, open: true, louvred: true, sill: false });
          b.box(2.0, 0.14, 0.9, trim, { at: [x, y - 0.85, ZF + 0.45] });
          railing(b, [x - 0.95, y - 0.71, ZF + 0.85], [x + 0.95, y - 0.71, ZF + 0.85], 0.95, P.iron, 0.18);
          continue;
        }
        shuttered(b, x, y, ZF, 0.95, 1.45, '+z', { shutter: shut, surround: trim, open: b.chance(0.6), louvred: true });
      }
    }
    // the loggia on the top floor at the right end
    b.panel(4.6, 2.5, P.timberBlack, { at: [9.6, G + FH + 0.1, ZF], facing: '+z', depth: 0.02 });
    b.archWall(4.8, FH - 0.2, 0.3, trim, { at: [9.6, G + FH, ZF + 0.15], facing: '+z', openings: 3, openW: 1.15, openH: 2.3, shape: 'round' });
    railing(b, [7.3, G + FH, ZF + 0.32], [11.9, G + FH, ZF + 0.32], 0.9, P.iron, 0.25);
    // the back of the street range, to the garden
    for (const x of xs) {
      if (Math.abs(x) > 8) continue;
      for (let f = 0; f < 3; f++) shuttered(b, x, f === 0 ? 1.0 : G + (f - 1) * FH + 0.8, ZR, 0.9, 1.35, '-z', { shutter: shut, surround: trim, open: b.chance(0.5), louvred: true });
    }
    b.panel(1.3, 2.4, P.oakDark, { at: [0, 0, ZR], facing: '-z', shape: 'round', depth: 0.06 });

    // two lower wings back into the garden, with a gable end to it and an outside stair on one
    const wd = ZR - WZ;
    const wzc = (ZR + WZ) / 2;
    const wtop = G + FH;
    for (const [x0, x1] of [
      [-XE, LX],
      [RX, XE],
    ]) {
      const wx = (x0 + x1) / 2;
      const ww = x1 - x0;
      b.box(ww, wtop, wd, plaster, { at: [wx, 0, wzc] });
      b.box(ww + 0.06, 0.9, wd + 0.06, base, { at: [wx, 0, wzc] });
      b.gable(ww, wd + 0.2, 1.4, roof, { at: [wx, wtop, wzc - 0.1], ridge: 'z', overhang: 0.55, thick: 0.15, wall: plaster });
      const inner = x0 < 0 ? x1 : x0;
      const f = x0 < 0 ? '+x' : '-x';
      for (const z of [-3.6, -0.8]) {
        shuttered(b, inner, 1.0, z, 0.9, 1.35, f, { shutter: shut, surround: trim, open: b.chance(0.5), louvred: true });
        shuttered(b, inner, G + 0.8, z, 0.9, 1.35, f, { shutter: shut, surround: trim, open: b.chance(0.5), louvred: true });
      }
      b.panel(1.0, 2.2, P.oakDark, { at: [wx, 0, WZ], facing: '-z', shape: 'round', depth: 0.06 });
      b.panel(0.8, 0.8, P.windowDark, { at: [wx, wtop + 0.2, WZ], facing: '-z', shape: 'circle', depth: 0.04 });
      for (const z of [-3.6, -0.8]) b.window(0.9, 1.3, { at: [x0 < 0 ? x0 : x1, G + 0.8, z], facing: x0 < 0 ? '-x' : '+x', frame: trim, glass: P.windowDark, border: 0.08 });
    }
    // chimneys with little tiled caps
    for (const x of [-7.0, 4.2, -10.4]) {
      b.box(0.6, 2.6, 0.6, plaster, { at: [x, top, fzc - 0.6] });
      b.gable(0.9, 0.9, 0.3, roof, { at: [x, top + 2.6, fzc - 0.6], thick: 0.08 });
    }

    // the garden: paths, trees, vegetable beds, the wash-house
    patch(b, 1.4, ZR - WZ + 2, P.gravel, [0, (ZR + WZ - 2) / 2], 0.05);
    patch(b, RX - LX, 1.2, P.gravel, [0, -1.0], 0.05);
    for (let k = 0; k < 3; k++) patch(b, 4.6, 0.7, P.soil, [-4.6, -2.6 - k * 1.3], 0.09);
    for (let k = 0; k < 9; k++) b.blob(0.22, P.leaf, { at: [-6.4 + (k % 3) * 1.8, 0.2, -2.6 - Math.floor(k / 3) * 1.3], detail: 0 });
    b.tree(7, { at: [-5.0, 0, 0.0], kind: "pine" });
    b.tree(3.6, { at: [6.4, 0, 0.4], kind: 'olive' });
    b.tree(6.5, { at: [-7.4, 0, -6.8], kind: 'cypress' });
    // lavatoio: tiled roof on brick piers over long stone tubs
    b.group({ at: [3.4, 0, -4.4] }, () => {
      for (const [px, pz] of [
        [-2.0, -1.0],
        [0, -1.0],
        [2.0, -1.0],
        [-2.0, 1.0],
        [0, 1.0],
        [2.0, 1.0],
      ]) b.box(0.35, 2.4, 0.35, P.brickRed, { at: [px, 0, pz] });
      b.hip(5.2, 3.0, 0.9, roof, { at: [0, 2.4, 0] });
      b.box(3.6, 0.8, 0.9, trim, { at: [0, 0, 0] });
      b.box(3.4, 0.04, 0.7, P.water, { at: [0, 0.78, 0], mat: 'glass' });
    });
    washing(b, [5.9, 2.1, -6.4], [8.2, 2.1, -6.4], 3);
    b.box(0.08, 2.2, 0.08, P.oakSilver, { at: [5.9, 0, -6.4] });

    b.collider(XE * 2, fd + 0.5, { at: [0, 0, fzc + 0.25] });
    b.collider(XE + LX, wd, { at: [(LX - XE) / 2, 0, wzc] });
    b.collider(XE - RX, wd, { at: [(RX + XE) / 2, 0, wzc] });
    b.collider(4.4, 2.4, { at: [3.4, 0, -4.4] });
  },
};

