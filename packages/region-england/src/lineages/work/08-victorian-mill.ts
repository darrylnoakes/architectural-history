import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, riverWall } from './shared';

/**
 * A north-light saw-tooth roof over a w (X) × d (Z) rectangle at height y. The steep glazed faces look
 * toward +Z (north on this plot); the slated slopes face the sun.
 */
export function sawtooth(b: Builder, w: number, d: number, teeth: number, h: number, at: [number, number, number], roof: number, glass: number) {
  const p = d / teeth;
  for (let i = 0; i < teeth; i++) {
    const z0 = at[2] - d / 2 + i * p;
    b.extrude([[0, 0], [p - 0.15, h], [p, h], [p, 0]], w, roof, { at: [at[0], at[1], z0], rotY: -Math.PI / 2 });
    b.box(w - 0.3, h * 0.82, 0.06, glass, { at: [at[0], at[1] + 0.05, z0 + p + 0.03], mat: 'glass', jitter: false });
    for (const x of spread(Math.round(w / 2.4), -w / 2, w / 2)) b.box(0.06, h * 0.82, 0.1, P.castIron, { at: [at[0] + x, at[1] + 0.05, z0 + p + 0.04] });
  }
}

export const victorianMill: BuildingDef = {
  id: 'victorian-mill',
  name: 'Steam-powered mill',
  style: 'Victorian industrial',
  date: 'c. 1870',
  summary:
    'Steam freed the mill from the river: now a beam or horizontal engine, fed by coal-fired boilers, turned the shafts, and the river was used for barges of coal and cotton instead of power. ' +
    'The mill is bigger in every way, with fireproof floors of brick arches on cast-iron columns and much larger windows. ' +
    'Each part has its own shape: the tall engine house with its round-arched windows, the low boiler house, the chimney that drew the furnaces and showed off the owner’s success, ' +
    'and single-storey weaving sheds whose saw-tooth roofs light the looms from the north.',
  materials: ['red brick', 'sandstone dressings', 'cast iron', 'Welsh slate', 'glass'],
  lookFor: [
    { label: 'Mill chimney', note: 'Often 40 m tall or more, to create a strong draught for the boilers and carry the smoke clear of the town.', at: [13.4, 28, -0.2] },
    { label: 'Engine house', note: 'Tall and narrow to hold the steam engine and its great flywheel; its round-arched windows mark it out.', at: [5.6, 8.0, -0.6] },
    { label: 'North-light sheds', note: 'Saw-tooth roofs with steep glazed faces turned north, giving even light without sun glare on the looms.', at: [11, 6.2, 9.5] },
    { label: 'Stair and water tower', note: 'The stairs and lavatories went in a tower outside the working floors; the tank on top held water against fire.', at: [-15.4, 22.5, 2.6] },
    { label: 'Wharf crane', note: 'Coal and raw cotton now arrive by barge and are lifted ashore by an iron crane.', at: [-4.5, 4.5, -12.4] },
  ],
  influences: ['industrial-export'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, -0.03), P.brickOrange]);
    const dress = b.pick([P.sandstone, P.gritstone, P.bathStone]);
    const glass = P.glassDark;

    // ---- the mill: five storeys, seven bays, big windows on an iron frame
    const mx = -7;
    const mz = -4.2;
    const L = 20;
    const D = 11.6;
    const S = 3.6;
    const N = 5;
    const H = S * N + 0.6;
    b.box(L, H, D, brick, { at: [mx, 0, mz] });
    b.box(L + 0.14, 0.6, D + 0.14, dress, { at: [mx, 0, mz] });
    for (let f = 1; f < N; f++) b.box(L + 0.1, 0.18, D + 0.1, dress, { at: [mx, 0.6 + f * S - 0.1, mz] });
    b.box(L + 0.4, 0.4, D + 0.4, dress, { at: [mx, H - 0.1, mz] });
    b.box(L, 0.7, D, brick, { at: [mx, H + 0.3, mz] }); // parapet
    b.gable(L - 0.4, D - 0.4, 2.2, P.slate, { at: [mx, H + 0.3, mz], wall: brick });
    const fz = mz + D / 2;
    const bayX = spread(7, -L / 2, L / 2);
    for (let f = 0; f < N; f++) {
      const y = 0.6 + f * S + 0.7;
      for (const x of bayX) {
        b.window(1.9, 2.2, { at: [mx + x, y, fz], facing: '+z', shape: 'segmental', frame: P.white, glass, border: 0.1 });
        b.panel(1.9, 2.1, glass, { at: [mx + x, y, mz - D / 2], facing: '-z' });
      }
      b.sym((s) => {
        for (const z of [-3.2, 0, 3.2]) b.panel(1.4, 2.1, glass, { at: [mx + (s * L) / 2, y, mz + z], facing: s > 0 ? '+x' : '-x' });
      });
    }
    // loading doors stacked in the end bay, with a hoist beam
    for (let f = 1; f < N; f++) b.panel(1.4, 2.4, P.doorGreen, { at: [mx + L / 2 - 1.4, 0.6 + f * S + 0.3, mz - D / 2], facing: '-z' });
    b.box(0.25, 0.25, 1.5, P.castIron, { at: [mx + L / 2 - 1.4, H - 0.6, mz - D / 2 - 0.7] });

    // stair and water tower on the front corner, Italianate
    const tx = mx - L / 2 + 2.4;
    const tz = fz + 1.4;
    const tH = H + 4.4;
    b.box(4.4, tH, 4.4, brick, { at: [tx, 0, tz - 1.4] });
    b.box(4.6, 0.6, 4.6, dress, { at: [tx, 0, tz - 1.4] });
    for (let f = 0; f < 5; f++) b.window(0.8, 1.8, { at: [tx, 1.4 + f * S, tz + 0.8], facing: '+z', shape: 'round', frame: P.white, glass });
    b.panel(1.4, 2.6, P.doorGreen, { at: [tx - 2.2, 0.6, tz - 1.4], facing: '-x', shape: 'round' });
    b.box(5.0, 0.4, 5.0, dress, { at: [tx, tH - 4.0, tz - 1.4] });
    b.sym((s) => b.sym((t) => b.panel(0.8, 1.9, P.windowDark, { at: [tx + t * 1.0, tH - 3.0, tz - 1.4 + s * 2.2], facing: s > 0 ? '+z' : '-z', shape: 'round' })));
    b.sym((s) => b.sym((t) => b.panel(0.8, 1.9, P.windowDark, { at: [tx + s * 2.2, tH - 3.0, tz - 1.4 + t * 1.0], facing: s > 0 ? '+x' : '-x', shape: 'round' })));
    b.box(5.2, 0.45, 5.2, dress, { at: [tx, tH, tz - 1.4] });
    b.pyramid(5.0, 5.0, 2.4, P.slate, { at: [tx, tH + 0.45, tz - 1.4], overhang: 0.2 });
    b.cyl(0.08, 1.6, P.castIron, { at: [tx, tH + 2.85, tz - 1.4], segs: 4 });

    // ---- engine house: tall, gabled to the yard, with round-arched windows
    const ex = mx + L / 2 + 2.6;
    const ez = -4.6;
    const ew = 5.2;
    const ed = 9.0;
    const eh = 11.5;
    b.box(ew, eh, ed, brick, { at: [ex, 0, ez] });
    b.box(ew + 0.14, 0.6, ed + 0.14, dress, { at: [ex, 0, ez] });
    b.gable(ew, ed, 2.0, P.slate, { at: [ex, eh, ez], ridge: 'z', overhang: 0.3, wall: brick });
    b.extrude([[-ew / 2 - 0.3, 0], [0, 2.3], [ew / 2 + 0.3, 0], [ew / 2, 0], [0, 2.0], [-ew / 2, 0]], 0.3, dress, { at: [ex, eh, ez + ed / 2] });
    b.window(1.8, 7.2, { at: [ex, 2.6, ez + ed / 2], facing: '+z', shape: 'round', frame: dress, glass, bars: [3, 4] });
    b.window(1.0, 1.0, { at: [ex, eh + 0.4, ez + ed / 2], facing: '+z', shape: 'circle', frame: dress, glass });
    for (const z of [-2.6, 0, 2.6]) b.window(1.4, 6.0, { at: [ex + ew / 2, 3.2, ez + z], facing: '+x', shape: 'round', frame: dress, glass, bars: [2, 3] });

    // ---- boiler house, low and long, with a louvred roof vent
    const bx = ex + ew / 2 + 3.6;
    const bz = -6.6;
    b.box(7.2, 5.0, 6.6, brick, { at: [bx, 0, bz] });
    b.gable(7.2, 6.6, 1.6, P.slate, { at: [bx, 5.0, bz], overhang: 0.3, wall: brick });
    b.box(4.0, 0.8, 1.0, P.timberBlack, { at: [bx, 6.3, bz] });
    b.gable(4.4, 1.6, 0.5, P.slate, { at: [bx, 7.1, bz] });
    b.sym((s) => b.panel(2.0, 3.0, P.doorBlack, { at: [bx + s * 1.8, 0, bz + 3.3], facing: '+z', shape: 'segmental' }));
    b.panel(2.4, 2.8, P.doorBlack, { at: [bx + 3.6, 0, bz], facing: '+x', shape: 'segmental' });

    // ---- the chimney: square base, octagonal tapering shaft, corbelled cap
    const cx = bx + 1.6;
    const cz = -1.6;
    b.box(3.4, 5.0, 3.4, brick, { at: [cx, 0, cz] });
    b.box(3.7, 0.5, 3.7, dress, { at: [cx, 5.0, cz] });
    b.lathe([[1.6, 0], [1.25, 29], [1.25, 29.3]], brick, { at: [cx, 5.5, cz], segs: 8 });
    b.lathe([[1.25, 0], [1.6, 1.0], [1.6, 1.6], [1.4, 1.6], [1.4, 2.0], [0.9, 2.0], [0.9, 1.6]], dress, { at: [cx, 34.6, cz], segs: 8 });
    b.box(1.0, 1.0, 0.2, P.timberBlack, { at: [cx, 0.6, cz + 1.65] });
    // flue from the boilers to the chimney
    b.box(1.2, 1.4, 3.4, brick, { at: [cx, 0, (cz + bz + 3.3) / 2 - 0.4] });

    // ---- north-light weaving sheds along the lane
    const sx = (ex - ew / 2 + 17.6) / 2 + 0.2;
    const sw = 17.6 - (ex - ew / 2) - 0.6;
    const sz = 5.4;
    const sd = 8.6;
    const sh = 4.4;
    b.box(sw, sh, sd, brick, { at: [sx, 0, sz] });
    b.box(sw + 0.1, 0.5, sd + 0.1, dress, { at: [sx, 0, sz] });
    sawtooth(b, sw, sd, 4, 2.4, [sx, sh, sz], P.slate, glass);
    // gable-end saw-tooth profiles in brick
    b.sym((s) => {
      for (let i = 0; i < 4; i++) {
        const p = sd / 4;
        b.extrude([[0, 0], [p - 0.15, 2.4], [p, 2.4], [p, 0]], 0.3, brick, { at: [sx + s * (sw / 2 - 0.15), sh, sz - sd / 2 + i * p], rotY: -Math.PI / 2 });
      }
    });
    for (const x of spread(6, -sw / 2, sw / 2)) b.window(1.3, 2.2, { at: [sx + x, 1.0, sz + sd / 2], facing: '+z', shape: 'segmental', frame: P.white, glass });
    b.panel(2.8, 3.2, P.doorGreen, { at: [sx + sw / 2, 0, sz + 1], facing: '+x', shape: 'segmental' });

    // ---- the wharf: stone quay, iron crane, a coal barge and a coal heap
    riverWall(b, -17.6, 17.6, dress, { coping: tint(dress, 0.08) });
    const kx = -4.5;
    b.cyl(0.35, 4.0, P.castIron, { at: [kx, 0, BANK + 0.8], segs: 8 });
    b.group({ at: [kx, 3.6, BANK + 0.8], rot: [0.45, 0, 0] }, () => b.box(0.25, 0.25, 4.6, P.castIron, { at: [0, 0, -2.0] }));
    b.box(0.04, 3.4, 0.04, P.black, { at: [kx, 2.0, BANK - 3.05] });
    b.group({ at: [-6, WATER - 0.2, BANK - 2.8] }, () => {
      b.box(12, 0.9, 3.0, P.timberBlack);
      b.box(11, 0.1, 2.6, P.oakDark, { at: [0, 0.82, 0] });
      for (const x of [-3.5, 0, 3.5]) b.blob(1.0, P.castIron, { at: [x, 0.8, 0], stretch: [1.5, 0.7, 1.1], detail: 0 });
      b.box(0.15, 5, 0.15, P.oak, { at: [-4.5, 0.9, 0] });
    });
    b.blob(1.2, P.black, { at: [16.6, 0, -6.6], stretch: [0.9, 0.6, 1.8] });
    // gate piers to the lane
    b.sym((s) => b.box(0.9, 3.0, 0.9, dress, { at: [-5 + s * 2.4, 0, 10.4] }));
    b.box(9.75, 2.0, 0.45, brick, { at: [-12.7, 0, 10.4] });

    b.collider(L, D, { at: [mx, 0, mz] });
    b.collider(4.4, 4.4, { at: [tx, 0, tz - 1.4] });
    b.collider(ew, ed, { at: [ex, 0, ez] });
    b.collider(7.2, 6.6, { at: [bx, 0, bz] });
    b.collider(3.4, 3.4, { at: [cx, 0, cz] });
    b.collider(sw, sd, { at: [sx, 0, sz] });
  },
};
