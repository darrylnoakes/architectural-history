import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, boat, circlePts, heap, lin, manufactoryGate, rise, riverWall, ring, squareChimney, washingSteps } from './shared';

/** A self-acting mule along X: the fixed headstock and creel, the carriage of spindles drawn out in front. */
function mule(b: Builder, x: number, y: number, z: number, len: number) {
  b.box(len, 0.9, 0.6, P.castIron, { at: [x, y, z - 0.9] }); // the roller beam and creel
  b.box(len, 0.12, 0.5, P.cream, { at: [x, y + 0.9, z - 0.9] }); // bobbins of roving
  b.box(1.2, 1.5, 1.6, P.castIron, { at: [x - len / 2 - 0.4, y, z - 0.4] }); // the headstock
  b.box(len, 0.5, 0.4, tint(P.oak, 0.1), { at: [x, y + 0.2, z + 0.4] }); // the carriage
  for (const xx of lin(Math.round(len / 0.45), x - len / 2 + 0.2, x + len / 2 - 0.2)) b.box(0.04, 0.35, 0.04, P.steel, { at: [xx, y + 0.7, z + 0.4], jitter: false });
  b.box(len, 0.02, 1.0, 0xf2eee0, { at: [x, y + 0.98, z - 0.15], rot: [-0.05, 0, 0], jitter: false }); // the threads
}

/** A beam engine: cylinder, rocking beam on its column, connecting rod to the crank and flywheel. */
function beamEngine(b: Builder, x: number, z: number) {
  // along local X: cylinder at x - 2.6, beam centre at x, crank and flywheel at x + 2.6
  b.box(7.0, 0.6, 2.0, P.limestone, { at: [x, 0, z] }); // bed stone
  b.cyl(0.6, 2.2, P.castIron, { at: [x - 2.6, 0.6, z], segs: 10 });
  b.cyl(0.72, 0.15, P.castIron, { at: [x - 2.6, 2.8, z], segs: 10 });
  b.box(0.08, 1.8, 0.08, P.steel, { at: [x - 2.6, 2.95, z] }); // piston rod
  // the column and the beam
  b.cyl(0.25, 4.6, P.castIron, { at: [x, 0.6, z], segs: 8 });
  b.box(0.8, 0.3, 0.8, P.castIron, { at: [x, 5.2, z] });
  b.beam([x - 2.8, 5.0, z], [x + 2.8, 5.8, z], 0.25, 0.55, P.castIron);
  b.beam([x + 2.7, 5.6, z], [x + 2.6, 2.0, z], 0.14, 0.14, P.steel); // connecting rod
  // the flywheel, in a pit, turning on its shaft along Z
  const fx = x + 2.6;
  b.group({ at: [fx, 2.0, z + 0.6] }, () => {
    ring(b, 2.6, 2.3, 0.3, P.castIron, [0, 0, 0], 24);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      b.group({ rot: [0, 0, a] }, () => b.box(0.14, 4.7, 0.14, P.castIron, { at: [0, -2.35, 0] }));
    }
    b.extrude(circlePts(0.35, 8), 0.4, P.castIron);
  });
  b.log(0.14, 3.6, P.steel, { at: [fx, 1.86, z + 1.2], axis: 'z', segs: 6 });
}

export const spinningMill: BuildingDef = {
  id: 'spinning-mill',
  name: 'Steam spinning mill (filature)',
  style: 'Early industrial',
  date: 'c. 1835',
  summary:
    'After 1815 the textile towns of the north, Lille, Roubaix, Saint-Quentin and Amiens, rebuilt their trade on the English model: cotton and wool spun by machines in many-storeyed mills, driven by steam. ' +
    'The steam engine, often bought from Britain or copied from British designs, stands in its own tall engine house beside the mill, with a boiler house and a square brick chimney; coal comes up the river by barge. ' +
    'Inside, cast-iron columns carry the floors so that long rooms can hold rows of spinning mules, driven by belts from shafts that run the length of every floor. ' +
    'Windows are as many and as large as the brick wall can bear, because the spinners, many of them children, worked by daylight. ' +
    'The low ranges of the old royal manufactory could not take the weight of the machines and were pulled down, but the mill keeps its street gate and its washing steps on the river. Select the mill to see inside.',
  materials: ['red brick', 'cast iron', 'slate', 'stone sills'],
  lookFor: [
    { label: 'Square chimney', note: 'The tall brick stack drew the boiler fires; early chimneys in the north were square, later ones round.', at: [15.0, 30.0, 2.0] },
    { label: 'Engine house', note: 'The beam engine stood in its own tall house with a big round-headed window, its flywheel turning the mill’s main shaft.', at: [10.2, 6.5, -1.6] },
    { label: 'Cast-iron columns', note: 'Slender iron columns in rows carry the floors, leaving long open rooms for the machines.', at: [-13.0, 9.0, -3.0] },
    { label: 'Spinning mules', note: 'Each mule draws out and twists hundreds of threads at once on a carriage that runs in and out across the floor.', at: [-13.0, 7.8, 0.4] },
    { label: 'Coal barge and quay', note: 'Coal for the boilers came by water and was unloaded at the mill’s own quay.', at: [9.0, 0.6, -13.0] },
  ],
  influences: ['iron-and-rail'],
  build(b) {
    const brick = b.pick([P.briqueNord, P.brickRed, tint(P.briqueNord, -0.03)]);
    const stone = P.pierreBlonde;
    const glass = P.windowDark;
    const x0 = -4;
    const W = 24;
    const D = 12;
    const z0 = -4;
    const g = 3.8;
    const f = 3.4;
    const n = 5;
    const H = g + (n - 1) * f;
    const front = z0 + D / 2;
    const back = z0 - D / 2;
    const bays = 12;
    const pitch = W / bays;
    const cutX = x0 - W / 2 + 3 * pitch; // the three west bays open in the cut-away
    const floorY = (k: number) => (k === 0 ? 0 : g + (k - 1) * f);

    b.box(35, 0.04, 21.6, tint(P.cobble, 0.06), { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tint(stone, -0.1), { coping: stone, top: 0.3 });

    // ---- the mill block: the closed part
    const cw = x0 + W / 2 - cutX;
    const cx = (cutX + x0 + W / 2) / 2;
    b.box(cw, H, D, brick, { at: [cx, 0, z0] });
    b.box(cw + 0.06, 0.6, D + 0.06, tint(brick, -0.08), { at: [cx, 0, z0] });
    for (let k = 1; k < n; k++) b.box(cw + 0.06, 0.15, D + 0.06, tint(brick, -0.06), { at: [cx, floorY(k) - 0.15, z0] });
    b.box(cw + 0.3, 0.4, D + 0.3, stone, { at: [cx, H - 0.2, z0] });
    // the back wall of the cut part, always whole
    const ow = cutX - (x0 - W / 2);
    const ox = (cutX + x0 - W / 2) / 2;
    b.box(ow, H, 0.6, brick, { at: [ox, 0, back + 0.3] });
    b.box(ow + 0.3, 0.4, 0.9, stone, { at: [ox, H - 0.2, back + 0.3] });
    // windows on every floor, front and back; segmental heads, stone sills
    const win = (x: number, k: number, z: number, facing: '+z' | '-z' | '+x' | '-x') => {
      const y = floorY(k) + (k === 0 ? 1.0 : 0.8);
      const h = k === 0 ? 2.3 : 2.1;
      // cheap windows: a frame and glass, with glazing bars on the street front only
      b.window(1.3, h, { at: [x, y, z], facing, shape: 'rect', frame: P.white, glass, bars: facing === '+z' ? [2, 2] : undefined, border: 0.1 });
    };
    for (let i = 0; i < bays; i++) {
      const x = x0 - W / 2 + (i + 0.5) * pitch;
      for (let k = 0; k < n; k++) {
        if (x > cutX) win(x, k, front, '+z');
        win(x, k, back, '-z');
      }
    }
    for (const k of [3, 4]) for (const z of [z0 - 3, z0 + 3]) win(x0 + W / 2, k, z, '+x');
    // the stair tower on the front, with the door and the mill bell
    const sx = x0 + 2;
    b.box(4.0, H + 2.4, 3.0, brick, { at: [sx, 0, front + 1.5] });
    b.box(4.3, 0.4, 3.3, stone, { at: [sx, H + 2.2, front + 1.5] });
    b.panel(1.8, 3.0, P.doorGreen, { at: [sx, 0, front + 3.0], facing: '+z', shape: 'segmental' });
    for (let k = 1; k < n; k++) b.window(1.0, 1.6, { at: [sx, floorY(k) + 1.4, front + 3.0], facing: '+z', shape: 'segmental', frame: P.white, glass, bars: [2, 3] });
    b.box(1.4, 1.6, 1.4, stone, { at: [sx, H + 2.6, front + 1.5] });
    b.pyramid(1.8, 1.8, 1.0, P.zincParis, { at: [sx, H + 4.2, front + 1.5] });
    b.panel(1.2, 1.2, P.white, { at: [sx, H + 0.6, front + 3.0], facing: '+z', shape: 'circle' }); // clock
    // the roof: low, slate, hipped; over the closed part only in the cut-away
    const rr = rise(D, 24);
    if (b.cutaway) {
      b.gable(cw + 0.3, D + 0.3, rr, P.ardoise, { at: [cx, H + 0.2, z0], overhang: 0.2, wall: brick });
    } else {
      b.hip(W + 0.6, D + 0.6, rr, P.ardoise, { at: [x0, H + 0.2, z0] });
    }

    // ---- the cut part: floors on cast-iron columns, mules, line shafts; or closed like the rest
    if (b.cutaway) {
      for (let k = 1; k < n; k++) {
        b.box(ow - 0.3, 0.3, D - 0.8, P.pine, { at: [ox - 0.15, floorY(k) - 0.3, z0 + 0.1] });
        b.box(ow - 0.3, 0.05, D - 0.8, tint(P.pine, -0.1), { at: [ox - 0.15, floorY(k), z0 + 0.1], jitter: false });
      }
      b.box(ow, 1.0, 0.6, tint(brick, -0.06), { at: [ox, 0, front - 0.3] });
      b.box(0.6, 1.0, D, tint(brick, -0.06), { at: [x0 - W / 2 + 0.3, 0, z0] });
      b.box(0.6, H, 0.6, brick, { at: [x0 - W / 2 + 0.3, 0, back + 0.3] });
      for (let k = 0; k < n; k++) {
        const y = floorY(k);
        const hh = (k === 0 ? g : f) - 0.3;
        for (const xx of lin(2, x0 - W / 2 + 1.6, cutX - 1.0)) for (const zz of [z0 - 2.0, z0 + 2.0]) {
          b.cyl(0.12, hh, P.castIron, { at: [xx, y, zz], segs: 6 });
          b.cyl(0.2, 0.2, P.castIron, { at: [xx, y + hh - 0.2, zz], rTop: 0.3, segs: 6 });
        }
        // the line shaft along the ceiling and belts down to the mules
        b.log(0.06, ow - 1, P.steel, { at: [ox, y + hh - 0.5, z0 - 2.0], segs: 5 });
        for (const xx of [x0 - W / 2 + 2.0, cutX - 1.6]) {
          b.log(0.3, 0.12, P.castIron, { at: [xx, y + hh - 0.74, z0 - 2.0], segs: 8 });
          b.box(0.1, hh - 1.6, 0.03, 0x3b2e24, { at: [xx, y + 1.0, z0 - 1.75], jitter: false });
        }
        mule(b, ox + 0.3, y, z0 + 0.6, ow - 2.4);
      }
    } else {
      b.box(ow, H, D, brick, { at: [ox, 0, z0] });
      b.box(ow + 0.06, 0.6, D + 0.06, tint(brick, -0.08), { at: [ox, 0, z0] });
      for (let k = 1; k < n; k++) b.box(ow + 0.06, 0.15, D + 0.06, tint(brick, -0.06), { at: [ox, floorY(k) - 0.15, z0] });
      b.box(ow + 0.3, 0.4, D + 0.3, stone, { at: [ox, H - 0.2, z0] });
      for (let i = 0; i < 3; i++) for (let k = 0; k < n; k++) win(x0 - W / 2 + (i + 0.5) * pitch, k, front, '+z');
      for (let k = 0; k < n; k++) for (const z of [z0 - 3, z0, z0 + 3]) win(x0 - W / 2, k, z, '-x');
    }

    // ---- the engine house: tall, with a great round-headed window; open in the cut-away
    const ex = x0 + W / 2 + 2.6;
    const ez = -4.4;
    const EW = 5.2;
    const ED = 9.0;
    const EH = 9.0;
    b.box(EW, EH, 0.5, brick, { at: [ex, 0, ez - ED / 2 + 0.25] });
    b.box(0.5, EH, ED, brick, { at: [ex + EW / 2 - 0.25, 0, ez] });
    b.box(EW, EH, 0.5, brick, { at: [ex, 0, ez + ED / 2 - 0.25] });
    b.box(EW + 0.3, 0.4, 0.8, stone, { at: [ex, EH - 0.2, ez - ED / 2 + 0.25] });
    b.box(EW + 0.3, 0.4, 0.8, stone, { at: [ex, EH - 0.2, ez + ED / 2 - 0.25] });
    b.box(0.8, 0.4, ED + 0.3, stone, { at: [ex + EW / 2 - 0.25, EH - 0.2, ez] });
    b.window(2.2, 5.4, { at: [ex, 1.8, ez + ED / 2], facing: '+z', shape: 'round', frame: stone, glass, bars: [3, 6] });
    if (!b.cutaway) b.gable(EW + 0.3, ED + 0.3, rise(EW, 28), P.ardoise, { at: [ex, EH + 0.2, ez], ridge: 'z', overhang: 0.2, wall: brick });
    // the engine lies along Z, its flywheel shaft running west into the mill
    b.group({ at: [ex + 0.6, 0, -5.4], rotY: -Math.PI / 2 }, () => beamEngine(b, 0, 0));

    // ---- the boiler house and the chimney
    const bx = 15.6;
    b.box(3.6, 4.0, 10.0, brick, { at: [bx, 0, -5.0] });
    b.shed(3.9, 10.3, 1.0, P.zincParis, { at: [bx, 4.0, -5.0], high: '-x' });
    for (const z of [-8.0, -5.0, -2.0]) b.panel(1.4, 1.8, P.castIron, { at: [bx + 1.8, 0, z], facing: '+x', shape: 'segmental' });
    squareChimney(b, [15.0, 0, 2.0], 34, 2.6, brick, stone);
    // the coal: a heap in the yard and a barge at the quay
    heap(b, [10.5, 0, -9.3], 1.7, 1.2, 0x2b2b2d);
    boat(b, [8.0, 0, -14.0], 14, 3.6, 0x4a3a2c, 0, 0x2b2b2d);
    for (const x of [4.0, 12.0]) b.cyl(0.25, 0.8, P.castIron, { at: [x, 0.3, BANK + 0.3], segs: 8 });

    // ---- the yard and street front: the gatekeeper's lodge by the old gate
    b.box(5.0, 3.2, 4.0, brick, { at: [-13.5, 0, 8.2] });
    b.hip(5.4, 4.4, 1.4, P.ardoise, { at: [-13.5, 3.2, 8.2] });
    b.window(1.1, 1.7, { at: [-13.5, 0.9, 10.2], facing: '+z', shape: 'segmental', frame: P.white, glass, bars: [2, 3] });
    b.panel(1.0, 2.2, P.doorGreen, { at: [-11.0, 0, 8.2], facing: '+x' });
    // the street wall and gate of the royal manufactory, and its washing steps on the river, kept
    manufactoryGate(b, brick, stone);
    washingSteps(b, -7.38, stone);

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(4.0, 3.0, { at: [sx, 0, front + 1.5] });
    b.collider(EW, ED, { at: [ex, 0, ez] });
    b.collider(3.6, 10, { at: [bx, 0, -5.0] });
    b.collider(3.2, 3.2, { at: [15.0, 0, 2.0] });
    b.collider(5.0, 4.0, { at: [-13.5, 0, 8.2] });
  },
};
