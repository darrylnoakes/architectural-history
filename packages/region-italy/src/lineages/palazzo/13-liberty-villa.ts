import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { block, onFace, win } from './shared';

/** A run of wrought-iron railing with whiplash curves between top and bottom rails, local face frame. */
function ironRail(b: Builder, x0: number, x1: number, y: number, z: number, h = 1.0): void {
  b.box(x1 - x0, 0.06, 0.06, P.castIron, { at: [(x0 + x1) / 2, y + h, z] });
  b.box(x1 - x0, 0.05, 0.05, P.castIron, { at: [(x0 + x1) / 2, y + 0.08, z] });
  const n = Math.max(2, Math.round((x1 - x0) / 0.5));
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * step;
    // an S-curve made of three short bars
    const pts: [number, number][] = [[0, 0.1], [0.35, 0.35], [0.15, 0.65], [0.5, 0.95]];
    for (let k = 0; k < 3; k++) {
      b.beam([xa + pts[k][0] * step * 1.6, y + pts[k][1] * h, z], [xa + pts[k + 1][0] * step * 1.6, y + pts[k + 1][1] * h, z], 0.04, 0.04, P.castIron, { jitter: false });
    }
  }
}

export const libertyVilla: BuildingDef = {
  id: 'liberty-villa',
  name: 'Liberty villa (villino)',
  style: 'Stile Liberty (Italian Art Nouveau)',
  date: 'c. 1905',
  summary:
    'In the new suburbs of the united kingdom of Italy, a prosperous family builds a villino in the Stile Liberty, Italy’s version of Art Nouveau. ' +
    'Symmetry is abandoned: the house is a picturesque cluster of volumes with a corner turret, deep eaves on carved brackets and windows of different shapes. ' +
    'Ornament is taken from nature, not from the classical orders: a frieze of glazed tiles painted with flowers runs under the eaves, and wrought iron, freed from straight lines, curls into whiplash curves on balconies, railings and a glass canopy over the door.',
  materials: ['stuccoed brick', 'glazed ceramic tiles', 'wrought iron', 'glass', 'clay tiles'],
  modelledOn: 'Villino Ruggeri, Pesaro (Giuseppe Brega, 1902 to 1907), and the villini of Ernesto Basile in Palermo, much simplified',
  influences: ['liberty-style'],
  lookFor: [
    { label: 'Corner turret', note: 'A round tower with a tall pointed roof breaks the skyline and makes the house deliberately asymmetrical.', at: [5.6, 13.5, 4.0] },
    { label: 'Ceramic flower frieze', note: 'A band of glazed tiles painted with flowers and leaves runs under the eaves.', at: [-3.5, 6.9, 5.2] },
    { label: 'Whiplash ironwork', note: 'Wrought iron bent into flowing, plant-like curves on the balcony and the garden railings.', at: [-3.5, 4.6, 6.6] },
    { label: 'Glass canopy (pensilina)', note: 'An iron and glass canopy on curved brackets shelters the front door.', at: [1.8, 3.4, 6.4] },
    { label: 'Deep eaves on brackets', note: 'The roof overhangs far on carved timber brackets, giving deep shadow under the eaves.', at: [-6.5, 7.6, 5.8] },
  ],
  build(b) {
    const stucco = b.pick([P.intonacoCream, tint(P.intonacoCream, 0.04), P.stucco]);
    const accent = b.pick([0x9fb58a, P.intonacoOchre, P.intonacoRose]);
    const roof = b.pick([P.tileRed, P.coppi]);
    const tileA = b.pick([0x4f8a6f, 0x3f6f9c]);
    const tileB = b.pick([P.doorYellow, 0xd98a4a]);
    const H = 7.4;
    const zf = 5.0;

    // ---- the main block and a lower wing to the left, set back
    block(b, 11, H, 9, stucco, -1.5, 0.5);
    block(b, 4.5, 4.4, 6.5, stucco, -8.6, -1.0);
    b.box(11.1, 0.9, 9.1, tint(stucco, -0.1), { at: [-1.5, 0, 0.5] });
    b.box(4.6, 0.9, 6.6, tint(stucco, -0.1), { at: [-8.6, 0, -1.0] });
    // ceramic frieze under the eaves: tiles of two glazes with flower roundels
    const frieze = (f: '+z' | '-z' | '+x' | '-x', at: [number, number, number], len: number, y: number) =>
      onFace(b, f, at, () => {
        b.box(len, 0.7, 0.04, P.faience, { at: [0, y, 0.02] });
        const n = Math.round(len / 0.7);
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * (len / n);
          b.box(0.18, 0.5, 0.04, tileA, { at: [x - 0.18, y + 0.1, 0.05], rot: [0, 0, 0.5], jitter: false });
          b.box(0.22, 0.22, 0.04, tileB, { at: [x + 0.1, y + 0.24, 0.06], rot: [0, 0, Math.PI / 4], jitter: false });
        }
      });
    frieze('+z', [-1.5, 0, zf], 11, H - 0.8);
    frieze('-z', [-1.5, 0, -4.0], 11, H - 0.8);
    frieze('-x', [-7.0, 0, 3.9], 2.2, H - 0.8);
    frieze('+x', [4.0, 0, -1.5], 6, H - 0.8);
    // deep eaves on brackets, hipped roofs
    b.hip(13.4, 11.4, 2.6, roof, { at: [-1.5, H, 0.5] });
    b.box(12.4, 0.18, 10.4, tint(P.oak, 0.1), { at: [-1.5, H - 0.18, 0.5] });
    for (let i = 0; i < 9; i++) {
      const x = -6.5 + i * 1.25;
      b.box(0.16, 0.45, 1.0, P.oak, { at: [x, H - 0.6, zf + 0.5] });
      b.box(0.16, 0.45, 1.0, P.oak, { at: [x, H - 0.6, -4.0 - 0.5] });
    }
    b.hip(5.8, 7.8, 1.6, roof, { at: [-8.6, 4.4, -1.0] });

    // ---- the round corner turret with its tall pointed roof
    const tx = 4.4;
    const tz = 4.0;
    b.cyl(2.0, 11.0, stucco, { at: [tx, 0, tz], segs: 12 });
    b.cyl(2.05, 0.9, tint(stucco, -0.1), { at: [tx, 0, tz], segs: 12 });
    b.cyl(2.08, 0.7, P.faience, { at: [tx, 10.0, tz], segs: 12 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.box(0.3, 0.3, 0.05, i % 2 ? tileA : tileB, { at: [tx + 2.1 * Math.sin(a), 10.2, tz + 2.1 * Math.cos(a)], rotY: a, jitter: false });
    }
    b.cyl(2.6, 0.2, P.oak, { at: [tx, 11.0, tz], segs: 12 });
    b.cone(2.6, 4.2, roof, { at: [tx, 11.2, tz], segs: 12 });
    b.cyl(0.05, 1.2, P.castIron, { at: [tx, 15.3, tz], segs: 4 });
    b.collider(4, 4, { at: [tx, 0, tz] });
    for (const [a, y, h] of [[0.5, 1.6, 1.8], [0.9, 4.8, 1.7], [0.2, 8.0, 1.4], [1.6, 8.0, 1.4]] as const) {
      b.group({ at: [tx + 2.0 * Math.sin(a), 0, tz + 2.0 * Math.cos(a)], rotY: a }, () => win(b, 0, y, 0.75, h, accent, { shape: 'round', border: 0.14, n: 5 }));
    }

    // ---- the front: windows of different shapes, a balcony, the canopy over the door
    onFace(b, '+z', [-1.5, 0, zf], () => {
      win(b, -4.5, 1.4, 1.5, 2.2, accent, { shape: 'segmental', border: 0.2, n: 5 });
      win(b, -1.8, 1.4, 1.0, 2.2, accent, { shape: 'segmental', border: 0.2, n: 5 });
      b.panel(1.3, 2.6, P.doorGreen, { at: [2.0, 0.9, 0], shape: 'segmental', depth: 0.08 });
      b.panel(1.8, 2.9, accent, { at: [2.0, 0.9, 0], shape: 'segmental', depth: 0.05 });
      // first floor: a wide three-light window onto the balcony, a round window, a narrow one
      win(b, -3.0, 4.4, 2.6, 2.0, accent, { shape: 'round', border: 0.2, n: 6 });
      for (const dx of [-0.45, 0.45]) b.box(0.08, 2.0, 0.12, accent, { at: [-3.0 + dx, 4.4, 0.06] });
      b.panel(1.0, 1.0, P.windowDark, { at: [0.2, 4.9, 0.04], shape: 'circle', depth: 0.06 });
      b.cyl(0.62, 0.05, accent, { at: [0.2, 5.4, 0.02], rot: [Math.PI / 2, 0, 0], segs: 10 });
      win(b, 2.2, 4.4, 0.8, 1.9, accent, { shape: 'segmental', border: 0.16, n: 5 });
      // the balcony on curved brackets
      b.box(4.0, 0.2, 1.3, tint(stucco, -0.05), { at: [-3.0, 4.2, 0.65] });
      for (const dx of [-1.6, 1.6]) b.beam([-3.0 + dx, 3.4, 0.05], [-3.0 + dx, 4.2, 1.1], 0.18, 0.18, tint(stucco, -0.05));
      ironRail(b, -4.9, -1.1, 4.4, 1.25);
      // the iron and glass canopy over the door
      b.group({ at: [2.0, 3.6, 0.9], rot: [-0.25, 0, 0] }, () => b.box(2.6, 0.06, 1.8, P.glass, { mat: 'glass' }));
      for (const dx of [-1.1, 1.1]) {
        b.beam([2.0 + dx, 3.0, 0.05], [2.0 + dx, 3.55, 1.0], 0.06, 0.06, P.castIron);
        b.beam([2.0 + dx, 3.55, 1.0], [2.0 + dx, 3.5, 1.7], 0.06, 0.06, P.castIron);
      }
      b.stairs(2.0, 0.9, 1.0, 3, P.travertine, { at: [2.0, 0, 0.5] });
    });
    // sides and back
    onFace(b, '-z', [-1.5, 0, -4.0], () => {
      for (const x of [-3.5, 0, 3.5]) {
        win(b, x, 1.4, 1.0, 2.0, accent, { shape: 'segmental', border: 0.16, n: 4 });
        win(b, x, 4.4, 1.0, 1.9, accent, { shape: 'segmental', border: 0.16, n: 4 });
      }
    });
    onFace(b, '+x', [4.0, 0, -1.5], () => {
      win(b, -1.6, 1.4, 1.0, 2.0, accent, { shape: 'segmental', border: 0.16, n: 4 });
      win(b, -1.6, 4.4, 1.0, 1.9, accent, { shape: 'segmental', border: 0.16, n: 4 });
    });
    onFace(b, '+z', [-8.6, 0, 2.25], () => {
      win(b, 0, 1.3, 2.2, 2.0, accent, { shape: 'round', border: 0.18, n: 6 });
    });
    onFace(b, '-x', [-10.85, 0, -1.0], () => win(b, 0, 1.3, 1.0, 2.0, accent, { shape: 'segmental', border: 0.16, n: 4 }));
    b.chimney(0.7, 2.6, 0.7, stucco, { at: [-4.0, H + 1.0, -1.5] });

    // ---- garden with an iron railing on a low wall
    b.box(23, 0.03, 25, P.grass, { at: [0, 0, 0] });
    b.box(1.8, 0.05, 6.5, P.gravel, { at: [0.5, 0, 9.0] });
    onFace(b, '+z', [0, 0, 12.0], () => {
      for (const [x0, x1] of [[-11.2, -0.6], [1.6, 11.2]]) {
        b.box(x1 - x0, 0.6, 0.35, tint(stucco, -0.1), { at: [(x0 + x1) / 2, 0, 0] });
        ironRail(b, x0, x1, 0.6, 0, 1.1);
      }
      for (const x of [-0.6, 1.6]) b.box(0.6, 2.0, 0.6, stucco, { at: [x, 0, 0] });
    });
    b.tree(9, { kind: 'pine', at: [-8.0, 0, 8.0] });
    b.tree(6, { kind: 'cypress', at: [9.5, 0, -8.0] });
    b.tree(5, { kind: 'round', at: [8.5, 0, 9.0] });
    for (const [x, z] of [[-5, 7.8], [-2.5, 8.5], [6.5, 6.5]]) b.blob(0.7, P.hedge, { at: [x, 0.45, z], stretch: [1.2, 0.8, 1] });
  },
};
