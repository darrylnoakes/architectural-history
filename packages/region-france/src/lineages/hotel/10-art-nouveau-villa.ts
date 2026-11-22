import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archPts, archRing, bar, onFace, plate } from './shared';

/** A flowing iron rail in the local face frame from x0 to x1 at height y: a top rail and stems that curl, like plant stalks. */
function ironRail(b: Builder, x0: number, x1: number, y: number, h: number, z = 0): void {
  const n = Math.max(3, Math.round((x1 - x0) / 0.5));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, y + h - 0.12 + Math.sin((i / n) * Math.PI) * 0.12]);
  }
  for (let i = 0; i < n; i++) bar(b, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.05, 0.05, P.castIron, z);
  // whiplash stems: each an S of two strokes, alternately leaning
  for (let i = 0; i < n; i++) {
    const xm = (pts[i][0] + pts[i + 1][0]) / 2;
    const s = i % 2 ? 1 : -1;
    bar(b, xm, y, xm + s * 0.12, y + h * 0.5, 0.035, 0.035, P.castIron, z);
    bar(b, xm + s * 0.12, y + h * 0.5, xm - s * 0.05, y + h - 0.12, 0.035, 0.035, P.castIron, z);
  }
  bar(b, x0, y + 0.08, x1, y + 0.08, 0.04, 0.04, P.castIron, z);
}

export const artNouveauVilla: BuildingDef = {
  id: 'art-nouveau-villa',
  name: 'Art Nouveau villa',
  style: 'Art Nouveau (School of Nancy)',
  date: 'c. 1902',
  summary:
    'An industrialist commissions a house in the new style that owes nothing to past ones: Art Nouveau, which looked to plants for its lines. ' +
    'The house is deliberately asymmetrical, each room shaped by its use and showing on the outside: a rough stone ground floor, brick above, steep tiled roofs at different heights, and in the main gable one great arched window lighting the studio. ' +
    'Iron balconies curl like stems, door and windows are framed in glazed stoneware, and the old hôtel round a court has given way to a free-standing villa in its own garden.',
  materials: ['limestone (rough and dressed)', 'brick', 'flat clay tiles', 'glazed stoneware', 'wrought iron', 'oak'],
  modelledOn: 'The Villa Majorelle (Villa Jika), Nancy (Henri Sauvage with Lucien Weissenburger, 1901 to 1902), built for the furniture maker Louis Majorelle, with ironwork from his workshops and stoneware by Alexandre Bigot: the stone and brick, the great studio window in the gable, the balconies and the ceramic. Simplified',
  influences: ['art-nouveau'],
  lookFor: [
    { label: 'Great studio window', note: 'One huge round-headed window fills the main gable, lighting the studio on the top floor.', at: [-2.2, 9.4, 1.9] },
    { label: 'Asymmetry', note: 'No two sides alike: blocks, roofs and windows are placed where the rooms inside need them, not to a pattern.', at: [4.4, 9.0, -1.0] },
    { label: 'Flowing ironwork', note: 'Balcony rails of iron bent into stems and whiplash curves, from the owner’s own workshops.', at: [4.2, 4.8, 1.4] },
    { label: 'Glazed stoneware', note: 'Ceramic in deep greens and browns frames the door and the bow window, made in the kilns of Alexandre Bigot.', at: [1.0, 2.0, 2.2] },
    { label: 'Rough stone below, brick above', note: 'The ground floor is in rock-faced stone, the upper floors in brick: materials shown honestly.', at: [-5.0, 1.6, 1.8] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, P.meuliere, tint(P.pierreBlonde, -0.04)]);
    const brick = b.pick([P.brickBuff, P.brickOrange, tint(P.brickBuff, -0.05)]);
    const tile = b.pick([P.tuilePlate, P.tileBrown, tint(P.tuilePlate, -0.06)]);
    const ceramic = b.pick([0x4f7f6a, 0x5d7c4a, 0x3f6a78]);
    const wood = b.pick([P.oak, P.doorGreen, tint(P.oakDark, 0.06)]);
    const G = 3.6;
    const F = 3.2;
    const H = G + F; // 6.8

    // ---- block A: the main house, gable to the street with the studio window
    const ax = -2.2;
    const az = -2.8;
    const aw = 8.0;
    const ad = 9.0;
    const azf = az + ad / 2; // 1.7
    b.box(aw, G, ad, stone, { at: [ax, 0, az] });
    b.box(aw, F, ad, brick, { at: [ax, G, az] });
    b.box(aw + 0.15, 0.3, ad + 0.15, tint(stone, 0.05), { at: [ax, G - 0.1, az] });
    b.collider(aw, ad, { at: [ax, 0, az] });
    const aR = 5.8;
    b.gable(aw, ad, aR, tile, { at: [ax, H, az], ridge: 'z', overhang: 0.7, wall: brick, thick: 0.2 });
    // the front gable flares forward on curved wooden brackets
    for (const s of [-1, 1]) {
      b.beam([ax + s * (aw / 2 - 0.2), H - 1.2, azf], [ax + s * (aw / 2 - 0.2), H - 0.1, azf + 0.75], 0.18, 0.18, wood);
      b.beam([ax + s * 1.2, H + aR * 0.62, azf], [ax + s * 1.2, H + aR * 0.62 + 0.3, azf + 0.75], 0.16, 0.16, wood);
    }
    onFace(b, '+z', [ax, 0, azf], () => {
      // the studio window
      archRing(b, 0, H + 0.1, 5.0, 4.4, 0.3, 0.1, tint(stone, 0.04));
      plate(b, archPts(0, H + 0.1, 5.0, 4.4, 'round', 12), 0.08, P.windowDark);
      for (const x of [-1.25, 0, 1.25]) b.box(0.08, x === 0 ? 4.2 : 3.4, 0.08, wood, { at: [x, H + 0.1, 0.12], jitter: false });
      b.box(5.0, 0.08, 0.08, wood, { at: [0, H + 1.6, 0.12], jitter: false });
      bar(b, -2.5, H + 1.9, 0, H + 2.7, 0.07, 0.08, wood, 0.12);
      bar(b, 2.5, H + 1.9, 0, H + 2.7, 0.07, 0.08, wood, 0.12);
      b.box(5.6, 0.25, 0.35, tint(stone, 0.04), { at: [0, H, 0.15] });
      // first floor: a wide segmental window and a narrow one
      plate(b, archPts(-1.4, G + 0.6, 2.6, 2.0, 'segmental', 6), 0.07, tint(stone, 0.05));
      plate(b, archPts(-1.4, G + 0.7, 2.3, 1.8, 'segmental', 6), 0.1, P.windowDark);
      b.box(0.08, 1.8, 0.06, wood, { at: [-1.4, G + 0.7, 0.13] });
      plate(b, archPts(2.4, G + 0.5, 0.9, 2.2, 'basket', 6), 0.07, tint(stone, 0.05));
      plate(b, archPts(2.4, G + 0.6, 0.7, 2.0, 'basket', 6), 0.1, P.windowDark);
      // ground floor: a big horseshoe-like window with its ceramic frame, rock-faced blocks
      archRing(b, -1.2, 0.6, 3.0, 2.6, 0.25, 0.09, ceramic, 0, 'basket');
      plate(b, archPts(-1.2, 0.6, 3.0, 2.6, 'basket', 8), 0.07, P.windowDark);
      for (const x of [-2.2, -0.2]) b.box(0.08, 2.2, 0.06, wood, { at: [x, 0.6, 0.1] });
      for (let i = 0; i < 6; i++) b.box(0.9, 0.5, 0.12, tint(stone, (i % 3) * 0.02 - 0.03), { at: [-3.4 + (i % 2) * 0.3, 0.1 + i * 0.55, 0.06], jitter: false });
    });
    // the long sides: windows of different sizes where the rooms want them
    onFace(b, '-x', [ax - aw / 2, 0, az], () => {
      for (const [x, y, w, h] of [[-2.5, 0.9, 1.4, 2.0], [2.0, 0.9, 1.0, 2.0], [0, G + 0.6, 1.6, 1.8], [3.2, G + 0.6, 0.8, 1.8]] as [number, number, number, number][]) {
        plate(b, archPts(x, y - 0.12, w + 0.24, h + 0.18, 'segmental', 5), 0.07, tint(stone, 0.05));
        plate(b, archPts(x, y, w, h, 'segmental', 5), 0.1, P.windowDark);
      }
    });
    onFace(b, '-z', [ax, 0, az - ad / 2], () => {
      for (const [x, y, w, h] of [[-2.0, 0.9, 1.4, 2.0], [1.6, 0.9, 1.4, 2.0], [-1.0, G + 0.6, 1.2, 1.8], [2.2, G + 0.6, 1.2, 1.8], [0, H + 1.2, 1.4, 1.6]] as [number, number, number, number][]) {
        plate(b, archPts(x, y - 0.12, w + 0.24, h + 0.18, 'segmental', 5), 0.07, tint(stone, 0.05));
        plate(b, archPts(x, y, w, h, 'segmental', 5), 0.1, P.windowDark);
      }
      b.box(1.0, 2.3, 0.08, wood, { at: [-3.2, 0, 0.04] });
    });
    // a dormer on the long east slope
    b.group({ at: [ax + 2.2, H + 1.6, az - 1.5], rotY: Math.PI / 2 }, () => {
      b.box(1.6, 1.6, 2.0, brick, { at: [0, 0, -0.6] });
      plate(b, archPts(0, 0.2, 1.1, 1.2, 'segmental', 5), 0.1, P.windowDark, 0.4);
      b.gable(1.9, 2.2, 1.0, tile, { at: [0, 1.6, -0.5], ridge: 'z', overhang: 0.25, wall: brick });
    });

    // ---- block B: lower, to the right, with the bow window and the balcony
    const bx = 4.1;
    const bz = -3.6;
    const bw = 4.6;
    const bd = 6.4;
    const bzf = bz + bd / 2; // -0.4
    b.box(bw, G, bd, stone, { at: [bx, 0, bz] });
    b.box(bw, F, bd, brick, { at: [bx, G, bz] });
    b.box(bw + 0.15, 0.3, bd + 0.15, tint(stone, 0.05), { at: [bx, G - 0.1, bz] });
    b.collider(bw, bd, { at: [bx, 0, bz] });
    b.hip(bw, bd, 3.4, tile, { at: [bx, H, bz], overhang: 0.6 });
    // the bow window: a half-round projection in stone with ceramic bands, the balcony on top
    const bowR = 1.7;
    b.lathe([[bowR, 0], [bowR, G - 0.2]], stone, { at: [bx, 0, bzf], start: -Math.PI / 2, sweep: Math.PI, segs: 8 });
    b.lathe([[bowR + 0.08, 0], [bowR + 0.08, 0.35]], ceramic, { at: [bx, G - 0.75, bzf], start: -Math.PI / 2, sweep: Math.PI, segs: 8 });
    b.lathe([[bowR + 0.25, 0], [bowR + 0.25, 0.2]], tint(stone, 0.05), { at: [bx, G - 0.2, bzf], start: -Math.PI / 2, sweep: Math.PI, segs: 8 });
    b.collider(2 * bowR, bowR, { at: [bx, 0, bzf + bowR / 2] });
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + ((i + 1) / 4) * Math.PI;
      b.group({ at: [bx + Math.sin(a) * bowR, 0, bzf + Math.cos(a) * bowR], rotY: a }, () => {
        plate(b, archPts(0, 0.8, 0.95, 1.9, 'segmental', 4), 0.1, P.windowDark);
      });
    }
    onFace(b, '+z', [bx, 0, bzf], () => {
      // french window onto the balcony over the bow
      plate(b, archPts(0, G + 0.1, 1.5, 2.5, 'basket', 6), 0.07, tint(stone, 0.05));
      plate(b, archPts(0, G + 0.2, 1.2, 2.3, 'basket', 6), 0.1, P.windowDark);
      b.box(0.07, 2.0, 0.06, wood, { at: [0, G + 0.2, 0.12] });
    });
    // the balcony rail follows the bow
    for (let i = 0; i < 6; i++) {
      const a0 = -Math.PI / 2 + (i / 6) * Math.PI;
      const a1 = -Math.PI / 2 + ((i + 1) / 6) * Math.PI;
      const r = bowR + 0.15;
      b.group({ at: [bx + (Math.sin(a0) + Math.sin(a1)) * 0.5 * r, 0, bzf + (Math.cos(a0) + Math.cos(a1)) * 0.5 * r], rotY: (a0 + a1) / 2 }, () => ironRail(b, -0.45, 0.45, G, 1.0));
    }
    onFace(b, '+x', [bx + bw / 2, 0, bz], () => {
      for (const [x, y, w, h] of [[-1.6, 0.9, 1.2, 2.0], [1.4, 0.9, 1.2, 2.0], [0, G + 0.6, 2.2, 1.8]] as [number, number, number, number][]) {
        plate(b, archPts(x, y - 0.12, w + 0.24, h + 0.18, 'segmental', 5), 0.07, tint(stone, 0.05));
        plate(b, archPts(x, y, w, h, 'segmental', 5), 0.1, P.windowDark);
      }
      ironRail(b, -1.2, 1.2, G + 0.5, 0.6, 0.15);
    });
    onFace(b, '-z', [bx, 0, bz - bd / 2], () => {
      plate(b, archPts(0, G + 0.6, 1.4, 1.8, 'segmental', 5), 0.1, P.windowDark);
      plate(b, archPts(0.5, 0.9, 1.4, 2.0, 'segmental', 5), 0.1, P.windowDark);
    });

    // ---- the entrance in the angle: ceramic frame, a glass canopy on iron brackets, steps
    const ex = 0.7;
    const ez = azf;
    onFace(b, '+z', [ex, 0, ez + 0.01], () => {
      archRing(b, 0, 0.45, 1.3, 2.6, 0.28, 0.1, ceramic, 0, 'basket');
      plate(b, archPts(0, 0.45, 1.3, 2.6, 'basket', 6), 0.08, wood);
      plate(b, archPts(0, 2.15, 0.9, 0.7, 'basket', 5), 0.12, P.glassDark);
    });
    b.stairs(2.0, 0.45, 1.2, 3, stone, { at: [ex, 0, ez + 0.6] });
    b.box(2.4, 0.08, 1.6, P.glass, { at: [ex, 3.4, ez + 0.75], mat: 'glass' });
    for (const s of [-1, 1]) {
      bar(b, ex + s * 1.1, 2.6, ex + s * 1.1, 3.4, 0.06, 0.06, P.castIron, ez + 0.0);
      b.beam([ex + s * 1.1, 2.6, ez + 0.05], [ex + s * 1.1, 3.38, ez + 1.5], 0.06, 0.06, P.castIron);
    }

    // ---- chimneys: one tall stack rising beside the gable
    b.chimney(0.9, 7.6, 0.9, brick, { at: [ax + aw / 2 - 0.6, H - 0.4, az - 2.5] });
    b.box(1.1, 0.35, 1.1, ceramic, { at: [ax + aw / 2 - 0.6, H + 6.6, az - 2.5] });
    b.chimney(0.8, 3.6, 0.8, brick, { at: [bx + 1.0, H + 1.0, bz - 1.2] });

    // ---- the garden: a lawn, a path, trees, a low wall with iron railings on the street
    b.box(23.6, 0.04, 25.4, P.grass, { at: [0, 0, 0] });
    b.box(1.6, 0.06, 10.5, P.gravel, { at: [0.3, 0, 7.3] });
    for (const [x, z, h, k] of [[-8.5, 7.0, 6.5, 'round'], [8.6, 6.0, 5.5, 'round'], [-9.0, -9.5, 7.0, 'round'], [9.0, -10.0, 5.0, 'conifer'], [-6.0, 10.0, 2.0, 'bush'], [5.6, 10.2, 1.8, 'bush']] as [number, number, number, 'round' | 'conifer' | 'bush'][]) b.tree(h, { at: [x, 0, z], kind: k });
    const zS = 12.4;
    b.sym((s) => {
      b.box(10.1, 0.8, 0.45, stone, { at: [s * 6.55, 0, zS] });
      onFace(b, '+z', [s * 6.55, 0, zS], () => ironRail(b, -5.0, 5.0, 0.8, 1.0, 0));
      b.collider(10.1, 0.5, { at: [s * 6.55, 0, zS] });
    });
    for (const x of [-1.5, 1.5]) {
      b.box(0.6, 2.2, 0.6, stone, { at: [x, 0, zS] });
      b.sphere(0.32, ceramic, { at: [x, 2.45, zS], segs: 6 });
    }
  },
};
