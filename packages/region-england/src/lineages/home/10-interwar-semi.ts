import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { beam, paling, gardenWalls } from './shared';
import { prism } from './shared-prism';

/** Plan of a shallow bow: an arc of radius r over +-half degrees, back edge at z 0. */
function bowPlan(r: number, half: number, n: number): [number, number][] {
  const pts: [number, number][] = [];
  const c = Math.cos(half);
  for (let i = 0; i <= n; i++) {
    const a = -half + (2 * half * i) / n;
    pts.push([r * Math.sin(a), r * (Math.cos(a) - c)]);
  }
  return pts.reverse();
}

export const interwarSemi: BuildingDef = {
  id: 'interwar-semi',
  name: 'Semi-detached house',
  style: 'Interwar suburban (Tudorbethan)',
  date: 'c. 1934',
  summary:
    'Cheap mortgages, low interest rates and fast-growing building societies let clerks and shopworkers buy a house for the first time, and ' +
    'speculative builders put up semi-detached pairs by the hundred thousand. Each half has a two-storey bow window, a front garden ' +
    'and a back garden, and the look borrows from Tudor cottages, with black-and-white timbering in the gable, because buyers wanted ' +
    'a home that looked old and English, not modern. The terrace was cleared away; the family now owns a car, and the car has a garage.',
  materials: ['red brick', 'pebbledash render', 'plain clay tiles', 'painted timber', 'steel casement windows'],
  lookFor: [
    {
      label: 'Two-storey bow window',
      note: 'A curved bay rising through both floors, glazed in narrow casements, to the front room and main bedroom.',
      at: [2.2, 1.8, 4.35],
    },
    {
      label: 'Mock-Tudor gable',
      note: 'Black boards on white render imitate a Tudor timber frame, though they carry nothing; pure nostalgia.',
      at: [2.2, 6.2, 4.55],
    },
    {
      label: 'Pebbledash',
      note: 'Render with small pebbles thrown into it while wet: cheap, hard-wearing and it hid ordinary brickwork.',
      at: [0.3, 4.4, 3.45],
    },
    {
      label: 'Hipped roof',
      note: 'The roof slopes down on all four sides, so the pair reads as one big comfortable house.',
      at: [-4.6, 7.0, 0.0],
    },
    {
      label: 'Garage',
      note: 'Built on to the side of the house: in the 1930s a private car was new enough to deserve its own little building.',
      at: [5.4, 2.0, 2.9],
    },
  ],
  influences: ['arts-and-crafts-export'],
  build(b) {
    const hw = 5.2;
    const pw = hw * 2;
    const px = -1.4; // party wall
    const zf = 3.4;
    const D = 7.4;
    const zb = zf - D;
    const zc = zf - D / 2;
    const g1 = 2.7;
    const H = g1 + 2.6;
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.04), P.brickOrange]);
    const dash = b.pick([P.pebbledash, tint(P.pebbledash, 0.04), P.cream]);
    const tile = b.pick([P.tileBrown, tint(P.tileRed, -0.06)]);
    const frame = b.pick([P.white, P.cream]);
    const ours = b.pick([P.doorGreen, P.doorBlue, P.doorRed]);

    // main block: brick below, pebbledash above
    b.box(pw, g1, D, brick, { at: [px, 0, zc] });
    b.box(pw, H - g1, D, dash, { at: [px, g1, zc] });
    b.box(pw + 0.06, 0.12, D + 0.06, tint(brick, -0.05), { at: [px, g1 - 0.06, zc] });
    b.hip(pw, D, 3.4, tile, { at: [px, H, zc], overhang: 0.35 });
    b.chimney(0.9, 2.2, 0.7, brick, { at: [px, H + 1.6, zc - 0.4], pots: 2 });
    b.sym((s) => b.chimney(0.6, 2.4, 0.5, brick, { at: [px + s * 3.0, H + 0.8, zb + 0.3], pots: 1 }));

    for (const side of [-1, 1] as const) {
      const cx = px + side * (hw / 2);
      const isOurs = side > 0;
      const bx = cx + side * 0.9; // bow toward the outer side
      const dx = px + side * 0.85; // doors meet at the party wall

      // two-storey bow
      const r = 1.65;
      const half = 1.05;
      const plan = bowPlan(r, half, 6);
      const proj = r * (1 - Math.cos(half));
      prism(b, plan, 0.7, brick, [bx, 0, zf]);
      prism(b, plan, g1 + 0.4 - 0.7, frame, [bx, 0.7, zf]);
      prism(b, plan, 0.55, tint(P.tileBrown, -0.05), [bx, g1 - 0.35, zf]); // tile-hung band between the floors
      prism(b, plan, H - g1 - 0.2, frame, [bx, g1 + 0.2, zf]);
      // glazing on each facet
      for (let i = 0; i < 6; i++) {
        const a = -half + (2 * half * (i + 0.5)) / 6;
        const x = bx + Math.sin(a) * r * Math.cos(half / 6);
        const z = zf + Math.cos(a) * r * Math.cos(half / 6) - r * Math.cos(half) + 0.005;
        b.window(0.5, 1.45, { at: [x, 0.85, z], facing: a, frame, glass: P.glassDark, bars: [1, 3], border: 0.05 });
        b.window(0.5, 1.4, { at: [x, g1 + 0.45, z], facing: a, frame, glass: P.glassDark, bars: [1, 3], border: 0.05 });
      }
      b.box(2 * r * Math.sin(half) + 0.1, 0.12, proj + 0.12, frame, { at: [bx, H - 0.1, zf + proj / 2] });

      // gable over the bow, with mock-Tudor boarding
      const gw = 3.6;
      const gd = 2.4;
      const gz = zf + proj + 0.15 - gd / 2;
      const rise = 2.3;
      b.gable(gw, gd, rise, tile, { at: [bx, H, gz], ridge: 'z', overhang: 0.25, thick: 0.12, wall: P.whiteRender });
      const fz = gz + gd / 2 + 0.02;
      for (const x of spread(5, -gw / 2 + 0.4, gw / 2 - 0.4)) {
        const h = rise * (1 - Math.abs(x) / (gw / 2)) - 0.1;
        b.box(0.14, h, 0.05, P.timberBlack, { at: [bx + x, H + 0.05, fz] });
      }
      b.box(gw - 0.2, 0.14, 0.05, P.timberBlack, { at: [bx, H + 0.05, fz] });
      b.sym((s) => beam(b, [bx + s * 0.25, H + 0.3, fz + 0.02], [bx + s * 0.95, H + 1.15, fz + 0.02], 0.1, 0.05, P.timberBlack));
      b.sym((s) => beam(b, [bx + s * (gw / 2 + 0.25), H - 0.2, fz + 0.3], [bx, H + rise + 0.05, fz + 0.3], 0.07, 0.25, P.white));

      // recessed porch under a round arch, the doors paired at the party wall
      b.panel(1.4, 2.5, tint(brick, -0.35), { at: [dx, 0, zf], facing: '+z', shape: 'round', depth: 0.02 });
      b.panel(1.65, 2.75, tint(brick, 0.06), { at: [dx, 0, zf - 0.03], facing: '+z', shape: 'round', depth: 0.03 });
      const door = isOurs ? ours : b.pick([P.doorGreen, P.cream, P.doorBlack]);
      b.panel(0.85, 2.0, door, { at: [dx, 0.05, zf + 0.04], facing: '+z' });
      b.window(0.5, 0.4, { at: [dx, 1.4, zf + 0.06], facing: '+z', frame: P.white, glass: P.doorYellow, shape: 'round' });
      b.stairs(1.3, 0.15, 0.4, 1, P.concrete, { at: [dx, 0, zf + 0.2] });
      // small landing window over the porch
      b.window(0.6, 0.9, { at: [dx, g1 + 0.6, zf + 0.01], facing: '+z', frame, bars: [1, 2], glass: P.glassDark });

      // front garden: low wall, path, hedge, a sunrise gate
      const gzf = 8.6;
      b.box(1.0, 0.03, gzf - zf, P.paving, { at: [dx, 0, (gzf + zf) / 2], jitter: false });
      b.box(hw - 1.6, 0.05, gzf - zf - 1.0, P.grass, { at: [cx + side * 0.6, 0, (gzf + zf) / 2 - 0.3], jitter: false });
      if (!isOurs) {
        b.box(hw - 1.0, 0.6, 0.25, brick, { at: [cx - 0.5 + side * 0, 0, gzf] });
        b.box(hw - 1.4, 0.7, 0.6, P.hedge, { at: [cx - 0.4, 0.6, gzf - 0.4] });
      } else {
        b.box(2.2, 0.6, 0.25, brick, { at: [px + 2.3, 0, gzf] });
      }
      // back: casements, back door
      for (const x of [cx - side * 0.6, cx + side * 1.5]) {
        b.window(1.4, 1.2, { at: [x, 0.9, zb], facing: '-z', frame, glass: P.glassDark, bars: [3, 2] });
        b.window(1.2, 1.1, { at: [x, g1 + 0.6, zb], facing: '-z', frame, glass: P.glassDark, bars: [3, 2] });
      }
      b.panel(0.85, 2.0, P.doorGreen, { at: [px + side * 0.6, 0, zb], facing: '-z' });
      // garden fence between the two halves
    }
    paling(b, px, zb, px, -8.8, 1.4, P.cedar, 0.13);
    gardenWalls(b); // the old garden walls of the plot, kept
    b.box(1.8, 2.0, 1.4, P.cedar, { at: [-5.4, 0, -7.6] }); // shed
    b.gable(1.9, 1.5, 0.5, P.asphalt, { at: [-5.4, 2.0, -7.6], ridge: 'z' });
    b.tree(b.range(4.5, 5.5), { at: [3.2, 0, -7.0] });
    // the neighbour's side gate and side passage
    b.box(1.2, 1.7, 0.08, P.cedar, { at: [-6.2, 0, zf - 1.5] });

    // garage on our side: brick, flat roof, timber doors
    const gx = px + pw / 2 + 1.4;
    const gD = 5.6;
    const gzz = zf - 0.6 - gD / 2;
    b.box(2.7, 2.5, gD, brick, { at: [gx, 0, gzz] });
    b.box(2.9, 0.2, gD + 0.2, P.concreteWhite, { at: [gx, 2.5, gzz] });
    b.panel(2.3, 2.1, P.cream, { at: [gx, 0, gzz + gD / 2], facing: '+z' });
    b.panel(0.04, 2.1, P.doorGreen, { at: [gx, 0, gzz + gD / 2 + 0.04], facing: '+z' });
    b.sym((s) => b.window(0.9, 0.45, { at: [gx + s * 0.57, 1.45, gzz + gD / 2 + 0.03], facing: '+z', frame: P.doorGreen, glass: P.glassDark, bars: [3, 1] }));
    b.box(2.6, 0.04, 8.8 - (gzz + gD / 2), P.concrete, { at: [gx, 0, (8.8 + gzz + gD / 2) / 2], jitter: false });
  },
};
