import { P, tint, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bodyOutline, voussoirs, cutwaterPier, type Opening } from './shared';

/** The revision: shopkeepers short of space hang back rooms out over the river. */
const BACK_ROOMS = 1550;

export const shopBridge: BuildingDef = {
  id: 'shop-bridge',
  name: 'Bridge of shops on segmental arches',
  style: 'Gothic',
  date: '1345',
  summary:
    'After a great flood carries away the old bridge (in Florence the flood of November 1333 destroyed the Ponte Vecchio), the commune rebuilds it on three wide, low segmental arches: each is only a slice of a circle, so it spans far more than a Roman half-circle of the same height and leaves fewer, thinner piers to block the river. ' +
    'To pay for it the commune builds rows of shops along both sides of the roadway and lets them out, leaving an open gap in the middle where people can look at the river. ' +
    'The design of the Ponte Vecchio is usually credited to Neri di Fioravante, though Vasari named the painter Taddeo Gaddi. From the 16th and 17th centuries the shopkeepers hung back rooms out over the water on timber brackets.',
  materials: ['pietra forte', 'rubble and brick', 'plaster', 'clay roof tiles (coppi)', 'chestnut timber'],
  modelledOn: 'The Ponte Vecchio, Florence (1345)',
  revisions: [
    {
      year: BACK_ROOMS,
      note: 'By the middle of the 16th century shopkeepers short of space had begun to hang back rooms out over the river on raking timber struts; at the Ponte Vecchio many more followed after 1593, when Ferdinando I de’ Medici moved the goldsmiths on to the bridge.',
    },
  ],
  lookFor: [
    { label: 'Segmental arch', note: 'A shallow arc of a circle that meets the pier at an angle instead of rising straight up: wider spans, lower piers, more room for floods.', at: [4.6, 0.3, 0] },
    { label: 'Shops on the bridge', note: 'The commune built and let the shops to pay for the bridge; their wide openings were closed at night with heavy wooden shutters.', at: [-2.3, 1.8, -8.0] },
    { label: 'Back rooms on brackets', note: 'Extra rooms hung out over the river on raking timber struts, added from the 16th century by shopkeepers short of space; until then the shops looked out over the water through shuttered windows.', at: [5.6, 1.4, 7.5] },
    { label: 'Open centre', note: 'The middle of the bridge is left free of shops: a small square over the river with arches looking up and down stream.', at: [3.6, 2.4, 0] },
    { label: 'Cutwater', note: 'The piers end in sharp points facing the current, carried up as buttresses under the shops.', at: [-5.6, 0.0, -4.35] },
  ],
  build(b) {
    b.noCollide();
    const crown = 1.15;
    const f = hump(crown);
    const W = 9.2;
    const roadW = 4.6;
    b.deck(roadW - 0.2, 34, crown, { yEnds: 0 });
    const stone = P.pietraForte;
    const dress = tint(stone, 0.06);
    const pierT = 1.7;
    const spans = [6.6, 7.0, 6.6];
    const spring = -1.05;
    const ops: Opening[] = [];
    const piers: number[] = [];
    let z = -(spans.reduce((a, s) => a + s, 0) + pierT * 2) / 2;
    spans.forEach((s, i) => {
      ops.push({ z0: z, z1: z + s, spring, rise: i === 1 ? 1.5 : 1.35, kind: 'segmental' });
      z += s;
      if (i < 2) {
        piers.push(z + pierT / 2);
        z += pierT;
      }
    });

    // the masonry: arches, spandrels, piers
    // full width over the river and under the shops; only the roadway runs on to meet the street
    side(b, bodyOutline({ za: -14.4, zb: 14.4, top: (q) => f(q) - 0.12, openings: ops }), W, stone);
    side(b, bodyOutline({ za: -END, zb: END, top: (q) => f(q) - 0.12, openings: ops }), roadW + 0.6, stone);
    b.sym((k) => {
      for (const op of ops) voussoirs(b, op, { d: 0.5, width: 0.08, x: k * (W / 2 + 0.02), color: dress, blocks: 13 });
      band(b, k * (W / 2 + 0.05), 0.14, -14.4, 14.4, (q) => f(q) - 0.4, (q) => f(q) - 0.12, dress, 30);
    });
    for (const zp of piers) {
      cutwaterPier(b, { z: zp, len: W, thick: pierT, nose: 1.4, y0: FOOT, h: f(zp) - 0.45 - FOOT, color: stone, cap: 0.06, capColor: dress });
    }
    band(b, 0, roadW, -END, END, (q) => f(q) - 0.14, (q) => f(q) + 0.01, tint(P.pietraForte, -0.08), 30);

    // ---- the shops: uniform cells along both sides, leaving the centre open
    const colours = [P.intonacoOchre, P.intonacoSienna, P.intonacoRose, P.intonacoCream, tint(P.intonacoOchre, -0.05)];
    const cell = 2.3;
    const depth = (W - roadW) / 2;
    const shopH = 3.3;
    const zStarts = [-14.1, 2.6];
    const backRooms: { k: number; zc: number; y0: number; ow: number; ol: number; oh: number; color: number }[] = [];
    b.sym((k) => {
      const xIn = k * (roadW / 2);
      const xc = k * (roadW / 2 + depth / 2);
      for (const z0 of zStarts) {
        for (let i = 0; i < 5; i++) {
          const zc = z0 + (i + 0.5) * cell;
          const y0 = f(zc) - 0.1;
          const col = b.pick(colours);
          b.box(depth, shopH, cell - 0.04, col, { at: [xc, y0, zc] });
          // stone piers between the shops
          b.box(0.3, shopH, 0.3, dress, { at: [xIn - k * 0.05, y0, zc - cell / 2 + 0.15] });
          // wide shop arch with a stone counter and the heavy shutters folded back
          const facing = k > 0 ? '-x' : '+x';
          b.panel(1.7, 2.5, dress, { at: [xIn, y0, zc], facing, shape: 'segmental', depth: 0.04 });
          b.panel(1.45, 2.3, P.windowDark, { at: [xIn, y0, zc], facing, shape: 'segmental', depth: 0.06 });
          b.box(0.4, 0.85, 1.4, dress, { at: [xIn - k * 0.2, y0, zc] });
          if (b.chance(0.4)) b.panel(1.45, 1.3, P.doorGreen, { at: [xIn, y0 + 0.9, zc], facing, depth: 0.08 });
          // small window in the loft
          b.window(0.5, 0.45, { at: [xIn, y0 + 2.65, zc], facing, frame: dress });
          // a shuttered window looking out over the river
          const out = k > 0 ? '+x' : '-x';
          b.window(0.6, 0.9, { at: [k * (W / 2), y0 + 1.4, zc], facing: out, frame: dress });
          b.sym((t) => b.panel(0.3, 0.9, P.doorGreen, { at: [k * (W / 2), y0 + 1.4, zc + t * 0.48], facing: out }));
          // where a back room will later be hung out over the water (drawn here, built at the end)
          if (Math.abs(zc) < 11.4 && b.chance(0.6)) {
            const ow = b.range(0.9, 1.4);
            const ol = cell - b.range(0.1, 0.5);
            const oh = b.range(2.2, 2.7);
            backRooms.push({ k, zc, y0, ow, ol, oh, color: tint(col, b.range(-0.06, 0.03)) });
          }
        }
        // one long low roof over the row, falling toward the river
        const za = z0;
        const zb = z0 + 5 * cell;
        const zm = (za + zb) / 2;
        b.shed(depth + 0.5, zb - za + 0.3, 0.6, P.coppi, { at: [xc + k * 0.15, f(zm) - 0.1 + shopH, zm], high: k > 0 ? '-x' : '+x' });
        // a gable wall closing each end of the row
        for (const ze of [za, zb]) b.box(depth, shopH + 0.4, 0.3, dress, { at: [xc, f(ze) - 0.1, ze] });
      }
    });

    // ---- the open centre: a parapet and three arches looking along the river on each side
    b.sym((k) => {
      const x = k * (W / 2 - 0.4);
      band(b, x, 0.5, -2.6, 2.6, (q) => f(q) - 0.12, (q) => f(q) + 0.95, stone, 6);
      b.archWall(5.2, 3.2, 0.5, dress, { at: [x, f(0) - 0.12, 0], facing: '+x', openings: 3, openW: 1.25, openH: 2.1, shape: 'round', sill: 0.95 });
      b.shed(1.3, 5.6, 0.4, P.coppi, { at: [x - k * 0.25, f(0) + 3.08, 0], high: k > 0 ? '-x' : '+x' });
    });

    // ---- the back rooms hung out over the water on raking struts (the revision; built last so
    // that nothing drawn before them changes)
    if (b.since(BACK_ROOMS)) {
      const NJ = { jitter: false } as const;
      for (const { k, zc, y0, ow, ol, oh, color } of backRooms) {
        const out = k > 0 ? '+x' : '-x';
        const oy = y0 + 0.4;
        const xo = k * (W / 2 + ow / 2);
        b.box(ow, oh, ol, color, { at: [xo, oy, zc], ...NJ });
        b.shed(ow + 0.2, ol + 0.1, 0.35, P.coppi, { at: [xo, oy + 2.75, zc], high: k > 0 ? '-x' : '+x', ...NJ });
        b.window(0.6, 0.8, { at: [k * (W / 2 + ow), oy + 1.1, zc], facing: out, frame: P.oak, ...NJ });
        for (const dz of [-ol / 2 + 0.2, ol / 2 - 0.2]) {
          b.beam([k * (W / 2), oy - 1.6, zc + dz], [k * (W / 2 + ow - 0.1), oy, zc + dz], 0.14, 0.14, P.oakDark, NJ);
        }
        b.box(ow + 0.04, 0.16, ol, P.oakDark, { at: [xo, oy - 0.16, zc], ...NJ });
      }
    }
  },
};
