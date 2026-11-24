import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, riverWall, waterwheel, water } from './shared';

/** The spinning mill's fixed plan: the long block on the bank. */
export const MILL = { x: -3, z: -4.6, L: 26, D: 9.6, S: 3.0, N: 5 };

/**
 * The Georgian spinning mill itself, with its counting house, boundary wall and river wall. The
 * steam-powered mill of 1870 keeps all of it and adds an engine house, boilers, a chimney and
 * weaving sheds, so both stages build it here with the same numbers.
 */
export function spinningMill(b: Builder, brick: number, stone: number, frame: number): void {
  const { x: mx, z: mz, L, D, S, N } = MILL;
  const H = S * N + 0.5;
  b.box(L, H, D, brick, { at: [mx, 0, mz] });
  b.box(L + 0.12, 0.5, D + 0.12, stone, { at: [mx, 0, mz] });
  b.box(L + 0.3, 0.3, D + 0.3, stone, { at: [mx, H - 0.3, mz] });
  b.gable(L, D, 2.8, P.slate, { at: [mx, H, mz], overhang: 0.3, wall: brick });
  // central stair bay, slightly projecting, with stacked Venetian windows and a lunette
  const fz = mz + D / 2;
  b.box(4.4, H, 0.5, brick, { at: [mx, 0, fz + 0.25] });
  b.extrude([[-2.4, 0], [2.4, 0], [0, 1.4]], 0.6, brick, { at: [mx, H - 0.3, fz + 0.25] });
  b.box(4.6, 0.2, 0.7, stone, { at: [mx, H - 0.3, fz + 0.25] });
  for (let f = 1; f < N - 1; f++) {
    const y = 0.5 + f * S + 0.5;
    b.window(1.1, 1.9, { at: [mx, y, fz + 0.5], facing: '+z', shape: 'round', frame, bars: [2, 3] });
    b.sym((s) => b.window(0.6, 1.5, { at: [mx + s * 0.95, y, fz + 0.5], facing: '+z', frame, bars: [1, 3] }));
  }
  b.window(2.0, 1.0, { at: [mx, 0.5 + (N - 1) * S + 0.6, fz + 0.5], facing: '+z', shape: 'segmental', frame, bars: [3, 1] });
  b.panel(1.5, 2.4, P.doorGreen, { at: [mx, 0.5, fz + 0.5], facing: '+z', shape: 'round' });
  b.panel(1.9, 2.7, stone, { at: [mx, 0.5, fz + 0.48], facing: '+z', shape: 'round', depth: 0.04 });
  // bell cupola on the ridge above the stair bay
  const ry = H + 2.8;
  b.box(1.6, 0.8, 1.6, P.white, { at: [mx, ry - 0.5, mz] });
  b.sym((s) => b.sym((t) => b.box(0.18, 1.3, 0.18, P.white, { at: [mx + s * 0.6, ry + 0.3, mz + t * 0.6] })));
  b.cyl(0.32, 0.45, P.bronze, { at: [mx, ry + 0.55, mz], rTop: 0.18, segs: 8 });
  b.box(1.8, 0.16, 1.8, P.white, { at: [mx, ry + 1.6, mz] });
  b.lathe([[0.95, 0], [0.8, 0.35], [0.45, 0.7], [0.1, 1.0], [0.04, 1.6]], P.lead, { at: [mx, ry + 1.76, mz], segs: 8 });
  // rows of windows: 12 bays a side, five floors, small and identical
  const half = spread(6, -L / 2 + 0.4, -2.6);
  const bays = [...half, ...half.map((x) => -x)];
  for (let f = 0; f < N; f++) {
    const y = 0.5 + f * S + 0.75;
    for (const x of bays) {
      b.window(1.0, 1.45, { at: [mx + x, y, fz], facing: '+z', frame, border: 0.08 });
      b.panel(0.9, 1.4, P.windowDark, { at: [mx + x, y, mz - D / 2], facing: '-z' });
    }
    b.sym((s) => {
      for (const z of [-2.5, 0, 2.5]) b.panel(0.9, 1.4, P.windowDark, { at: [mx + (s * L) / 2, y, mz + z], facing: s > 0 ? '+x' : '-x' });
    });
  }
  // privy and hoist tower on the back
  b.box(2.6, H + 0.6, 2.2, brick, { at: [mx - 7, 0, mz - D / 2 - 1.1] });
  b.shed(2.8, 2.4, 0.9, P.slate, { at: [mx - 7, H + 0.6, mz - D / 2 - 1.1], high: '+z' });
  for (let f = 0; f < N; f++) b.panel(1.2, 2.0, P.oak, { at: [mx - 7, 0.5 + f * S + 0.3, mz - D / 2 - 2.2], facing: '-z' });
  b.box(0.2, 0.2, 1.4, P.oakDark, { at: [mx - 7, H + 0.1, mz - D / 2 - 2.6] });

  // ---- the river wall along the whole frontage
  riverWall(b, -17.6, 17.6, stone, { coping: tint(stone, 0.08) });

  // ---- counting house by the gate and a boundary wall to the lane
  const cx = -12.5;
  const cz = 6.2;
  b.box(6.4, 6.0, 4.6, brick, { at: [cx, 0, cz] });
  b.hip(6.4, 4.6, 1.6, P.slate, { at: [cx, 6.0, cz], overhang: 0.3 });
  b.box(6.6, 0.25, 4.8, stone, { at: [cx, 5.8, cz] });
  b.panel(1.0, 2.2, P.doorBlack, { at: [cx, 0.2, cz + 2.3], facing: '+z' });
  b.panel(1.6, 0.6, frame, { at: [cx, 2.4, cz + 2.3], facing: '+z', shape: 'segmental' });
  b.sym((s) => {
    b.window(1.0, 1.6, { at: [cx + s * 2.0, 0.9, cz + 2.3], facing: '+z', frame, bars: [2, 3] });
    b.window(1.0, 1.6, { at: [cx + s * 2.0, 3.6, cz + 2.3], facing: '+z', frame, bars: [2, 3] });
  });
  b.window(1.0, 1.6, { at: [cx, 3.6, cz + 2.3], facing: '+z', frame, bars: [2, 3] });
  b.chimney(0.7, 1.4, 0.7, brick, { at: [cx - 2.6, 6.6, cz], pots: 2 });
  b.box(19.6, 1.8, 0.4, brick, { at: [-0.85, 0, 10.2] });
  b.box(3.2, 1.8, 0.4, brick, { at: [-16.0, 0, 10.2] });
  b.sym((s) => b.box(0.7, 2.6, 0.7, stone, { at: [-12.5 + s * 1.85, 0, 10.2] }));
  b.box(3.0, 0.1, 0.1, P.castIron, { at: [-12.5, 2.3, 10.2] });

  b.collider(L + 0.4, D + 0.6, { at: [mx, 0, mz] });
  b.collider(6.4, 4.6, { at: [cx, 0, cz] });
}

export const arkwrightMill: BuildingDef = {
  id: 'arkwright-mill',
  name: 'Cotton mill',
  style: 'Georgian industrial',
  date: 'c. 1785',
  summary:
    'Richard Arkwright’s water frame spun cotton thread by machine, and his mills at Cromford and Masson in Derbyshire set the pattern for the factory: ' +
    'one waterwheel driving hundreds of spindles on every floor, through upright and horizontal shafts running the height and length of the building. ' +
    'The result is a long, narrow, tall brick box, narrow so that daylight from the rows of identical windows reaches the machines in the middle. ' +
    'Hands worked set shifts, called in by the bell in the cupola on the roof.',
  materials: ['red brick', 'slate', 'timber floors', 'cast iron'],
  modelledOn: 'Masson Mill, Matlock Bath, Derbyshire (1783), simplified',
  lookFor: [
    { label: 'Rows of identical windows', note: 'Five storeys of small, evenly spaced windows: every floor the same, every bay the same, like the machines inside.', at: [-9.6, 9.0, 0.3] },
    { label: 'Bell cupola', note: 'The bell called the workers in at the start of each shift. Factory time replaced the farmer’s day.', at: [-3, 19.5, -4.6] },
    { label: 'Venetian windows', note: 'The one bit of polite architecture: a three-part window with a round-headed middle, lighting the staircase bay.', at: [-3, 8.6, 0.9] },
    { label: 'Wheel house', note: 'A large breastshot wheel inside its own house at the end of the mill; one shaft from it powered every floor.', at: [15.4, 4.6, -5.2] },
    { label: 'Mill leat and sluice', note: 'A channel brings water from upstream; the sluice controls how much reaches the wheel.', at: [16.4, 1.6, 4.3] },
  ],
  influences: ['industrial-export', 'palladianism'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), P.brickOrange]);
    const stone = P.gritstone;
    const frame = P.white;

    spinningMill(b, brick, stone, frame);
    const { x: mx, z: mz, L } = MILL;

    // ---- wheel house at the east end, with a big breastshot wheel inside its open arches
    const hx = mx + L / 2 + 2.6;
    const hw = 5.2;
    const hd = 9.6;
    const hz = mz - 0.6;
    const hh = 7.2;
    // two side walls and a roof: the +X wall is pierced by tall arches so the wheel shows
    b.archWall(hd, hh, 0.6, brick, { at: [hx + hw / 2 - 0.3, 0, hz], facing: '+x', openings: 2, openW: 3.4, openH: 5.8, shape: 'round', sill: 0.9 });
    b.box(hw, hh, 0.6, brick, { at: [hx, 0, hz + hd / 2 - 0.3] });
    b.gable(hw, hd, 1.8, P.slate, { at: [hx, hh, hz], ridge: 'z', overhang: 0.25, wall: brick });
    // the wheel: axle along X into the mill gable; water flows toward the river (-Z)
    const wr = 3.6;
    const ay = wr + 0.1;
    waterwheel(b, { at: [hx - 0.1, ay, hz - 0.5], r: wr, width: 2.6, axis: 'x', kind: 'breast', paddles: 32, spokes: 8, color: P.oak, axleDir: -1, spin: b.rand() });
    // the breast: a curved masonry apron hugging the upstream side of the wheel
    const br: [number, number][] = [[0, 0]];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * 1.45;
      br.push([Math.sin(t) * (wr + 0.15), Math.max(0, ay - Math.cos(t) * (wr + 0.15))]);
    }
    br.push([wr + 1.0, ay - 0.2], [wr + 1.0, 0]);
    b.extrude(br, 2.8, stone, { at: [hx - 0.1, 0, hz - 0.5], rotY: -Math.PI / 2 });
    // back wall toward the river, open in a great arch
    b.archWall(hw, hh, 0.6, brick, { at: [hx, 0, hz - hd / 2 + 0.3], facing: '-z', openings: 1, openW: 3.8, openH: 6.0, shape: 'round', sill: 0.6 });
    // head race (the leat) coming in from upstream to the +Z side of the wheel house
    const lz = hz + hd / 2 + 1.3;
    b.panel(2.6, 1.6, P.timberBlack, { at: [hx + 0.2, 0, hz + hd / 2 + 0.02], facing: '+z', shape: 'segmental' });
    b.box(4.0, 0.9, 6.2, P.earth, { at: [hx + 0.2, 0, lz + 1.0], jitter: false });
    water(b, 2.6, 6.2, [hx + 0.2, 0.9, lz + 1.0]);
    b.sym((s) => b.box(0.6, 1.25, 6.2, stone, { at: [hx + 0.2 + s * 1.6, 0, lz + 1.0] }));
    b.box(4.0, 0.9, 2.8, P.earth, { at: [hx + 3.4, 0, lz + 3.4], jitter: false });
    water(b, 4.2, 2.0, [hx + 3.3, 0.9, lz + 3.4]);
    b.sym((s) => b.box(4.0, 1.25, 0.5, stone, { at: [hx + 3.4, 0, lz + 3.4 + s * 1.25] }));
    // sluice gate with its rack-and-pinion headstock
    b.sym((s) => b.box(0.25, 2.6, 0.25, P.castIron, { at: [hx + 0.2 + s * 1.4, 0.9, lz + 0.4] }));
    b.box(3.1, 0.3, 0.3, P.castIron, { at: [hx + 0.2, 3.4, lz + 0.4] });
    b.box(2.6, 0.9, 0.12, P.oak, { at: [hx + 0.2, 1.3, lz + 0.4] });
    b.cyl(0.35, 0.1, P.castIron, { at: [hx + 1.7, 3.0, lz + 0.4], rot: [0, 0, Math.PI / 2], segs: 10 });
    // tail race: out under an arch in the river wall
    b.panel(3.0, 1.0, P.timberBlack, { at: [hx - 0.1, WATER - 0.1, BANK - 0.2], facing: '-z', shape: 'segmental' });
    b.box(2.4, 0.35, 0.6, tint(P.water, 0.25), { at: [hx - 0.1, WATER - 0.05, BANK - 0.5], mat: 'glass', jitter: false });

    b.collider(hw, hd + 2, { at: [hx, 0, hz] });
  },
};
