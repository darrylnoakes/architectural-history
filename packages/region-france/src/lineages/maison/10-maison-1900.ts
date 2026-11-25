import * as THREE from 'three';
import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bowWindow, cellarFooting, dormer, pitched, vegBed, yardBounds } from './shared';

const HW = 6.8;
const ZF = 7.9;
const ZB = -2.0;
const G = 3.4;
const F1 = 3.2;
const EAVES = G + F1 + 0.5;

/** A quarter or half circle of iron bar in the plane of a wall facing +z: the whiplash curves of Art Nouveau. */
function ironArc(b: Builder, at: [number, number, number], r: number, start: number, sweep: number, col: number): void {
  const g = new THREE.TorusGeometry(r, 0.022, 3, 8, sweep);
  g.rotateZ(start);
  b.add(g, col, { at, jitter: false });
}

/** A balcony railing of Art Nouveau ironwork: rails, bars and a pair of curling loops in each panel. */
function nouveauRail(b: Builder, len: number, at: [number, number, number], col: number): void {
  const [x, y, z] = at;
  b.box(len, 0.05, 0.05, col, { at: [x, y + 0.9, z], jitter: false });
  b.box(len, 0.04, 0.04, col, { at: [x, y + 0.05, z], jitter: false });
  const n = Math.max(1, Math.round(len / 0.7));
  for (let i = 0; i <= n; i++) b.box(0.04, 0.88, 0.04, col, { at: [x - len / 2 + (i * len) / n, y + 0.04, z], jitter: false });
  for (let i = 0; i < n; i++) {
    const cx = x - len / 2 + ((i + 0.5) * len) / n;
    ironArc(b, [cx - 0.08, y + 0.55, z], 0.16, 0, Math.PI * 1.3, col);
    ironArc(b, [cx + 0.08, y + 0.3, z], 0.14, Math.PI, Math.PI * 1.3, col);
  }
}

function house(b: Builder, cx: number, o: { brick: number; band: number; stone: number; roof: number; door: number; ours: boolean; tiles: number[] }): void {
  const { brick, band, stone, roof } = o;
  const D = ZF - ZB;
  const zc = (ZF + ZB) / 2;
  b.box(HW, EAVES, D, brick, { at: [cx, 0, zc] });
  // plinth of blue-grey stone, and bands of light brick
  cellarFooting(b, cx, HW, ZF);
  for (const y of [1.6, 2.6, G + 1.0, G + 2.2]) b.box(HW, 0.16, 0.05, band, { at: [cx, y, ZF + 0.02], jitter: false });
  b.box(HW, 0.2, 0.14, stone, { at: [cx, G, ZF + 0.05] });
  // the ceramic frieze under the eaves
  const n = 16;
  for (let i = 0; i < n; i++) {
    const x = cx - HW / 2 + (i + 0.5) * (HW / n);
    b.panel(HW / n - 0.03, 0.36, o.tiles[i % o.tiles.length], { at: [x, EAVES - 0.62, ZF], facing: '+z', depth: 0.04 });
    b.panel(0.12, 0.12, o.tiles[(i + 1) % o.tiles.length], { at: [x, EAVES - 0.5, ZF], facing: '+z', depth: 0.06, shape: 'circle' });
  }
  // eaves on carved brackets
  for (let i = 0; i < 7; i++) b.box(0.12, 0.25, 0.5, P.oakDark, { at: [cx - HW / 2 + 0.4 + i * ((HW - 0.8) / 6), EAVES - 0.25, ZF + 0.25] });

  // ground floor: the door up two steps with its glass canopy, a wide window
  const dx = cx - 2.2;
  b.panel(1.4, 2.85, stone, { at: [dx, 0.3, ZF], facing: '+z', depth: 0.04 });
  b.panel(1.1, 2.7, o.door, { at: [dx, 0.3, ZF], facing: '+z', depth: 0.08 });
  b.panel(0.75, 0.9, P.glassDark, { at: [dx, 1.6, ZF], facing: '+z', depth: 0.1, mat: 'glass' });
  ironArc(b, [dx, 2.05, ZF + 0.12], 0.25, 0, Math.PI * 2, P.castIron);
  b.panel(1.1, 0.45, P.glassDark, { at: [dx, 2.55, ZF], facing: '+z', depth: 0.1, shape: 'segmental', mat: 'glass' });
  b.stairs(1.5, 0.3, 0.6, 2, stone, { at: [dx, 0, ZF + 0.3] });
  // marquise: a glass canopy on curving iron brackets
  b.group({ at: [dx, 3.25, ZF + 0.02], rot: [0.25, 0, 0] }, () => {
    b.box(1.8, 0.04, 1.0, P.glass, { at: [0, 0, 0.5], mat: 'glass' });
    b.box(1.8, 0.07, 0.05, P.castIron, { at: [0, 0, 1.0] });
  });
  for (const s of [1, -1]) {
    b.beam([dx + s * 0.85, 2.65, ZF + 0.02], [dx + s * 0.85, 3.0, ZF + 0.92], 0.04, 0.04, P.castIron, { jitter: false });
    b.add(new THREE.TorusGeometry(0.28, 0.025, 3, 8, Math.PI / 2).rotateY(Math.PI / 2), P.castIron, { at: [dx + s * 0.85, 2.72, ZF + 0.3], jitter: false });
  }
  // the wide window with a stone lintel and a relieving arch of light brick
  const wx = cx + 1.0;
  b.panel(3.0, 0.35, band, { at: [wx, 3.0, ZF], facing: '+z', depth: 0.03, shape: 'segmental' });
  b.box(2.8, 0.3, 0.14, stone, { at: [wx, 2.75, ZF + 0.05] });
  b.window(2.4, 1.95, { at: [wx, 0.8, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [3, 2], mat: 'glass', border: 0.09 });
  b.box(2.7, 0.12, 0.25, stone, { at: [wx, 0.72, ZF + 0.08] });

  // first floor: a bow window over the wide window (ours), or a balcony with Art Nouveau railing
  if (o.ours) {
    bowWindow(b, [wx, G + 0.25, ZF], 2.6, 2.6, 0.75, tint(brick, 0.02), P.white, { roof, sillH: 0.75, base: stone });
    for (const s of [1, -1]) b.box(0.2, 0.5, 0.6, stone, { at: [wx + s * 1.05, G - 0.25, ZF + 0.3] });
  } else {
    b.box(2.8, 0.3, 0.14, stone, { at: [wx, G + 2.55, ZF + 0.05] });
    b.window(1.5, 2.25, { at: [wx, G + 0.3, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 3], mat: 'glass', border: 0.08 });
    b.box(2.4, 0.15, 0.6, stone, { at: [wx, G + 0.25, ZF + 0.3] });
    nouveauRail(b, 2.2, [wx, G + 0.4, ZF + 0.55], P.castIron);
  }
  // the window over the door, with a little balcony of ironwork
  b.box(1.5, 0.28, 0.14, stone, { at: [dx, G + 2.45, ZF + 0.05] });
  b.window(1.1, 2.1, { at: [dx, G + 0.3, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 3], mat: 'glass', border: 0.08 });
  b.box(1.4, 0.12, 0.4, stone, { at: [dx, G + 0.25, ZF + 0.2] });
  nouveauRail(b, 1.3, [dx, G + 0.37, ZF + 0.36], P.castIron);

  // roof of slate with a brick dormer
  pitched(b, HW, D, 3.6, roof, { at: [cx, EAVES, zc], ridge: 'x', overhang: 0.45, ends: 0, wall: brick, thick: 0.1, courses: 7 });
  dormer(b, [cx - 0.6, EAVES, ZF - 0.05], '+z', 1.5, 1.8, roof, brick, { frame: P.white, bars: [2, 2], depth: 1.4, pediment: band, shape: 'segmental' });
  b.chimney(0.6, 1.4, 1.0, brick, { at: [cx + HW / 2 - 0.45, EAVES + 2.5, zc - 1.2], pots: 2 });

  // back: a single-storey kitchen wing, windows, a small garden
  b.box(3.4, 3.0, 3.0, tint(brick, 0.03), { at: [cx + 1.6, 0, ZB - 1.5] });
  b.shed(3.6, 3.2, 0.7, roof, { at: [cx + 1.6, 3.0, ZB - 1.5], high: '+z' });
  b.window(1.0, 1.2, { at: [cx + 1.6, 1.0, ZB - 3.02], facing: '-z', frame: P.white, glass: P.glassDark, bars: [2, 2] });
  b.panel(0.9, 2.2, o.door, { at: [cx - 1.4, 0, ZB], facing: '-z' });
  for (const x of [-1.6, 1.4]) b.window(1.1, 1.7, { at: [cx + x, G + 0.6, ZB - 0.02], facing: '-z', frame: P.white, glass: P.glassDark, bars: [2, 3] });
  for (const s of [1, -1]) b.box(HW, 0.14, 0.05, band, { at: [cx, s > 0 ? 2.6 : G + 2.2, ZB - 0.02], jitter: false });
}

export const maison1900: BuildingDef = {
  id: 'maison-1900',
  name: 'Brick town house of the north',
  style: 'Belle Époque, with Art Nouveau ironwork',
  date: 'c. 1903',
  summary:
    'In the towns of the industrial north the middle classes lived in narrow brick houses in long terraces, each a few metres wide with a garden behind. ' +
    'Machine-made brick in two colours, stone lintels, cast iron and glazed tiles all came by rail, and builders combined them freely: a bow window (the English word is used in French) juts from the first-floor sitting room, ' +
    'the balcony rails and the glass canopy over the door curl in the whiplash lines of Art Nouveau, and a frieze of ceramic tiles runs under the eaves. The kitchen has moved to a low wing at the back.',
  materials: ['red and light machine brick', 'stone lintels and plinth', 'cast-iron railings', 'glazed ceramic tiles', 'slate'],
  influences: ['art-nouveau'],
  lookFor: [
    {
      label: 'Bow window',
      note: 'A glazed bay projecting from the first-floor sitting room catches light from three sides and a view along the street.',
      at: [-2.4, 4.9, 8.75],
    },
    {
      label: 'Art Nouveau ironwork',
      note: 'The balcony rails curl in loops and whiplash curves, and a glass canopy (marquise) on curving brackets shelters the door.',
      at: [-5.6, 4.1, 8.35],
    },
    {
      label: 'Ceramic frieze',
      note: 'A band of glazed tiles under the eaves, bought from a catalogue, brings colour to the brick.',
      at: [-1.3, 6.9, 7.95],
    },
    {
      label: 'Polychrome brick',
      note: 'Bands and arches of light brick are laid into the red: decoration that costs no more than plain walling.',
      at: [-0.6, 1.75, 7.95],
    },
    {
      label: 'Stone lintels',
      note: 'Straight stone beams span the windows; machine-cut and brought by rail, they replace the brick arches of earlier houses.',
      at: [-2.4, 3.0, 8.0],
    },
  ],
  build(b) {
    const tilesA = b.pick([
      [0x3d8a8a, P.cream, 0x6a9a5a, P.cream],
      [0x4a6fa0, P.cream, 0xd9a441, P.cream],
      [0x7a9a4a, 0xe8d9b0, 0xa8483a, 0xe8d9b0],
    ]);
    const roof = tint(P.ardoise, b.range(-0.02, 0.03));
    house(b, -HW / 2, {
      brick: tint(P.briqueNord, b.range(-0.03, 0.03)),
      band: tint(b.pick([P.brickYellow, P.cream, P.brickBuff]), b.range(-0.02, 0.02)),
      stone: tint(P.pierreBlonde, -0.02),
      roof,
      door: b.pick([P.doorGreen, P.oakDark, P.doorRed, P.doorBlue]),
      ours: true,
      tiles: tilesA,
    });
    house(b, HW / 2, {
      brick: tint(b.pick([P.briqueNord, P.brickRed, P.brickOrange]), b.range(-0.04, 0.02)),
      band: tint(b.pick([P.brickYellow, P.brickBuff, P.cream]), b.range(-0.02, 0.02)),
      stone: tint(P.pierreBlonde, -0.04),
      roof: b.chance(0.6) ? roof : tint(P.tileRed, -0.04),
      door: b.pick([P.doorGreen, P.oakDark, P.doorBlack, tint(P.voletBleu, -0.15)]),
      ours: false,
      tiles: b.pick([
        [0x3d8a8a, P.cream],
        [0x8a5a9a, P.cream, 0x6a9a5a],
        [0xd9a441, 0x4a6fa0],
      ]),
    });
    // gardens behind, divided by a wall
    yardBounds(b, ZB, tint(P.rubble, 0.03), P.pierreBlonde, 'full');
    for (const cx of [-HW / 2, HW / 2]) {
      b.box(1.0, 0.04, 5.6, P.gravel, { at: [cx - 1.6, 0, -5.8], jitter: false });
      vegBed(b, cx + 1.3, -7.2, 3.2, 2.4, { rows: 4 });
    }
    b.tree(b.range(3.6, 4.4), { at: [-1.4, 0, -7.4], kind: 'round', color: P.leaf });
    b.box(1.2, 1.9, 0.9, tint(P.oak, 0.1), { at: [5.9, 0, -7.8] });
  },
};
