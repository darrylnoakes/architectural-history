import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER } from './shared';
import { MILL, spinningMill } from './07-arkwright-mill';

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
    'Steam freed the mill from the river: now a horizontal engine, fed by coal-fired boilers, turned the shafts, and the river brought barges of coal and cotton instead of power. ' +
    'Here, as at many older mills, the Georgian spinning block was kept and steam was added to it. An engine house stands where the wheel house was and drives the same line of shafts, ' +
    'beside a low boiler house and a chimney that drew the furnaces and showed off the owner’s success. ' +
    'In front, new single-storey weaving sheds have saw-tooth roofs that light the looms from the north.',
  materials: ['red brick', 'sandstone dressings', 'cast iron', 'Welsh slate', 'glass'],
  lookFor: [
    { label: 'Mill chimney', note: 'Tall enough to create a strong draught for the boilers and carry the smoke clear of the town.', at: [15.4, 30, 4.4] },
    { label: 'Engine house', note: 'Tall and narrow to hold the steam engine and its great flywheel; its round-arched windows mark it out. It replaced the waterwheel at the end of the old mill.', at: [12.6, 10.0, -0.3] },
    { label: 'The old spinning mill', note: 'The 1780s mill is kept, rows of small windows, cupola and all: steam was cheaper to add than a new mill was to build.', at: [-9.6, 9.0, 0.3] },
    { label: 'North-light sheds', note: 'Saw-tooth roofs with steep glazed faces turned north, giving even light without sun glare on the looms.', at: [-2.2, 6.0, 9.7] },
    { label: 'Wharf crane', note: 'Coal and raw cotton now arrive by barge and are lifted ashore by an iron crane.', at: [-4.5, 4.5, -12.4] },
  ],
  influences: ['industrial-export'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), P.brickOrange]);
    const dress = b.pick([P.sandstone, P.gritstone, P.bathStone]);
    const glass = P.glassDark;

    // ---- the Georgian spinning mill, kept, with its counting house, wall and quay
    spinningMill(b, brick, P.gritstone, P.white);
    const { x: mx, z: mz, L } = MILL;

    // ---- engine house on the site of the wheel house, driving the old line of shafts
    const ex = mx + L / 2 + 2.6;
    const ez = mz - 0.6;
    const ew = 5.2;
    const ed = 9.6;
    const eh = 11.5;
    b.box(ew, eh, ed, brick, { at: [ex, 0, ez] });
    b.box(ew + 0.14, 0.6, ed + 0.14, dress, { at: [ex, 0, ez] });
    b.gable(ew, ed, 2.0, P.slate, { at: [ex, eh, ez], ridge: 'z', overhang: 0.3, wall: brick });
    b.extrude([[-ew / 2 - 0.3, 0], [0, 2.3], [ew / 2 + 0.3, 0], [ew / 2, 0], [0, 2.0], [-ew / 2, 0]], 0.3, dress, { at: [ex, eh, ez + ed / 2] });
    b.window(1.8, 7.2, { at: [ex, 2.6, ez + ed / 2], facing: '+z', shape: 'round', frame: dress, glass, bars: [3, 4] });
    b.window(1.0, 1.0, { at: [ex, eh + 0.4, ez + ed / 2], facing: '+z', shape: 'circle', frame: dress, glass });
    for (const z of [-2.8, 0, 2.8]) b.window(1.4, 6.0, { at: [ex + ew / 2, 3.2, ez + z], facing: '+x', shape: 'round', frame: dress, glass, bars: [2, 3] });
    b.window(1.8, 6.0, { at: [ex, 3.2, ez - ed / 2], facing: '-z', shape: 'round', frame: dress, glass, bars: [3, 3] });
    // the old tail race, now just an outfall for the engine's condenser water
    b.panel(3.0, 1.0, P.timberBlack, { at: [ex - 0.1, WATER - 0.1, BANK - 0.2], facing: '-z', shape: 'segmental' });

    // ---- boiler house, low and long, with a louvred roof vent, in front of the mill's east end
    const bx = 7.6;
    const bz = 3.6;
    const bw = 6.0;
    const bd = 5.0;
    b.box(bw, 4.6, bd, brick, { at: [bx, 0, bz] });
    b.gable(bw, bd, 1.4, P.slate, { at: [bx, 4.6, bz], overhang: 0.3, wall: brick });
    b.box(3.4, 0.7, 0.9, P.timberBlack, { at: [bx, 5.6, bz] });
    b.gable(3.8, 1.4, 0.45, P.slate, { at: [bx, 6.3, bz] });
    b.sym((s) => b.panel(1.8, 2.8, P.doorBlack, { at: [bx + s * 1.5, 0, bz + bd / 2], facing: '+z', shape: 'segmental' }));

    // ---- the chimney: square base, octagonal tapering shaft, corbelled cap
    const cx = 15.4;
    const cz = 4.4;
    b.box(3.4, 5.0, 3.4, brick, { at: [cx, 0, cz] });
    b.box(3.7, 0.5, 3.7, dress, { at: [cx, 5.0, cz] });
    b.lathe([[1.6, 0], [1.25, 29], [1.25, 29.3]], brick, { at: [cx, 5.5, cz], segs: 8 });
    b.lathe([[1.25, 0], [1.6, 1.0], [1.6, 1.6], [1.4, 1.6], [1.4, 2.0], [0.9, 2.0], [0.9, 1.6]], dress, { at: [cx, 34.6, cz], segs: 8 });
    b.box(1.0, 1.0, 0.2, P.timberBlack, { at: [cx, 0.6, cz + 1.65] });
    // flue from the boilers to the chimney, across the front of the engine house
    const f0 = bx + bw / 2;
    const f1 = cx - 1.7;
    b.box(f1 - f0, 1.4, 1.2, brick, { at: [(f0 + f1) / 2, 0, cz] });

    // ---- north-light weaving sheds along the lane
    const sx = -2.2;
    const sw = 12.8;
    const sz = 6.0;
    const sd = 7.2;
    const sh = 4.2;
    b.box(sw, sh, sd, brick, { at: [sx, 0, sz] });
    b.box(sw + 0.1, 0.5, sd + 0.1, dress, { at: [sx, 0, sz] });
    sawtooth(b, sw, sd, 3, 2.4, [sx, sh, sz], P.slate, glass);
    // gable-end saw-tooth profiles in brick
    b.sym((s) => {
      for (let i = 0; i < 3; i++) {
        const p = sd / 3;
        b.extrude([[0, 0], [p - 0.15, 2.4], [p, 2.4], [p, 0]], 0.3, brick, { at: [sx + s * (sw / 2 - 0.15), sh, sz - sd / 2 + i * p], rotY: -Math.PI / 2 });
      }
    });
    for (const x of spread(5, -sw / 2 + 1, sw / 2 - 1)) b.window(1.3, 2.2, { at: [sx + x, 1.0, sz + sd / 2], facing: '+z', shape: 'segmental', frame: P.white, glass });
    b.panel(2.8, 3.2, P.doorGreen, { at: [sx + sw / 2, 0, sz], facing: '+x', shape: 'segmental' });

    // ---- the wharf: iron crane, a coal barge and a coal heap
    const kx = -4.5;
    b.cyl(0.35, 4.0, P.castIron, { at: [kx, 0, BANK + 0.8], segs: 8 });
    b.group({ at: [kx, 3.6, BANK + 0.8], rot: [0.45, 0, 0] }, () => b.box(0.25, 0.25, 4.6, P.castIron, { at: [0, 0, -2.0] }));
    b.box(0.04, 3.4, 0.04, P.black, { at: [kx, 2.0, BANK - 3.05] });
    b.group({ at: [-4, WATER - 0.2, BANK - 2.8] }, () => {
      b.box(12, 0.9, 3.0, P.timberBlack);
      b.box(11, 0.1, 2.6, P.oakDark, { at: [0, 0.82, 0] });
      for (const x of [-3.5, 0, 3.5]) b.blob(1.0, P.castIron, { at: [x, 0.8, 0], stretch: [1.5, 0.7, 1.1], detail: 0 });
      b.box(0.15, 5, 0.15, P.oak, { at: [-4.5, 0.9, 0] });
    });
    b.blob(1.2, P.black, { at: [16.6, 0, -6.6], stretch: [0.9, 0.6, 1.8] });

    b.collider(ew, ed, { at: [ex, 0, ez] });
    b.collider(bw, bd, { at: [bx, 0, bz] });
    b.collider(3.4, 3.4, { at: [cx, 0, cz] });
    b.collider(sw, sd, { at: [sx, 0, sz] });
  },
};
