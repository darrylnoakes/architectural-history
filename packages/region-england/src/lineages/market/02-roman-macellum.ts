import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { amphora, goods } from './shared';

/** Rows of imbrices (the half-round cover tiles) running down a roof slope. */
function imbrices(b: Builder, len: number, xs: number[], y0: number, z0: number, rise: number, run: number, color: number): void {
  // slope from (z0, y0) at the eaves up `rise` over horizontal `run` (run sign gives direction)
  const ang = Math.atan2(rise, Math.abs(run));
  const sl = Math.hypot(rise, run);
  const dir = Math.sign(run);
  for (const x of xs) {
    b.box(0.13, 0.09, sl, color, {
      at: [x, y0 + rise / 2, z0 + run / 2],
      rot: [-dir * ang, 0, 0],
      jitter: true,
    });
  }
  void len;
}

export const romanMacellum: BuildingDef = {
  id: 'roman-macellum',
  name: 'Market building (macellum)',
  style: 'Romano-British',
  date: 'c. AD 100',
  summary:
    'Rome gave the town a planned market: a block of small lock-up shops (tabernae) facing outward, wrapped in a covered walk of columns so buyers stayed dry. ' +
    'It is built of mortared stone, plastered and painted, and roofed with fired clay tiles, all techniques that arrived with the Roman army. ' +
    'For the first time trade happens inside a permanent public building rather than on open ground.',
  materials: ['mortared stone', 'painted plaster', 'fired clay roof tiles', 'oak shutters'],
  lookFor: [
    { label: 'Portico', note: 'A covered walk carried on a row of columns, giving shade and shelter in front of the shops.', at: [-6.9, 2.4, 6.6] },
    { label: 'Tuscan columns', note: 'The plainest Roman order: a smooth shaft with a simple round base and a cushion-and-slab capital.', at: [3.0, 3.3, 6.4] },
    { label: 'Tabernae', note: 'One-room shops open to the walk by day and closed at night with wooden shutters.', at: [0, 1.5, 3.9] },
    { label: 'Tegulae and imbrices', note: 'Flat clay tiles with raised edges, the joints covered by half-round tiles: the ribbed Roman roof.', at: [4, 6.0, 1.4] },
  ],
  modelledOn: 'The macellum at Verulamium (St Albans), simplified',
  influences: ['roman-conquest'],
  build(b) {
    const BW = 16; // shop block
    const BD = 7;
    const BH = 4.8;
    const OW = 21.6; // portico outer line
    const OD = 12.8;
    const colH = 3.3;
    const stone = P.limestone;
    const plaster = b.pick([P.limewash, P.plaster, tint(P.limewash, -0.03)]);
    const red = mixRed();
    function mixRed() {
      return b.pick([P.sandstoneRed, P.doorRed, P.terracotta]);
    }
    const tile = P.romanTile;

    // podium and portico floor
    b.box(OW + 0.6, 0.3, OD + 0.6, stone);
    b.box(OW, 0.05, OD, P.paving, { at: [0, 0.3, 0] });

    // the shop block
    b.box(BW, BH, BD, plaster, { at: [0, 0.3, 0] });
    b.box(BW + 0.06, 0.9, BD + 0.06, red, { at: [0, 0.3, 0] }); // painted dado
    b.box(BW + 0.2, 0.25, BD + 0.2, stone, { at: [0, 0.3 + BH - 0.25, 0] }); // cornice

    // main roof: ridge along X, low Roman pitch
    const rH = 1.7;
    const rY = 0.3 + BH;
    b.gable(BW, BD, rH, tile, { at: [0, rY, 0], ridge: 'x', overhang: 0.35, wall: plaster });
    const xs = spread(24, -BW / 2 - 0.1, BW / 2 + 0.1);
    imbrices(b, BW, xs, rY - 0.1, BD / 2 + 0.35, rH + 0.2, -(BD / 2 + 0.35), tint(tile, -0.05));
    imbrices(b, BW, xs, rY - 0.1, -BD / 2 - 0.35, rH + 0.2, BD / 2 + 0.35, tint(tile, -0.05));
    b.log(0.12, BW + 0.7, tint(tile, -0.08), { at: [0, rY + rH + 0.06, 0], segs: 6 });

    // portico roof: a hipped lean-to all round, hidden where it runs into the block
    const pY = 0.35 + colH + 0.35;
    const slope = 0.24;
    b.hip(OW, OD, slope * (OD / 2), tile, { at: [0, pY, 0], overhang: 0.3, ridge: OW - OD });
    // imbrices on the long portico slopes
    const pRun = (OD - BD) / 2 + 0.3;
    const pxs = spread(22, -OW / 2 + pRun + 0.2, OW / 2 - pRun - 0.2);
    for (const s of [-1, 1]) {
      imbrices(b, OW, pxs, pY - 0.07 - 0.05, s * (OD / 2 + 0.3), pRun * slope + 0.02, -s * pRun, tint(tile, -0.05));
    }

    // entablature (timber architrave, plastered) on the columns
    b.group({}, () => {
      const t = 0.4;
      b.box(OW, 0.35, t, plaster, { at: [0, 0.35 + colH, OD / 2 - 0.25] });
      b.box(OW, 0.35, t, plaster, { at: [0, 0.35 + colH, -OD / 2 + 0.25] });
      b.box(t, 0.35, OD, plaster, { at: [OW / 2 - 0.25, 0.35 + colH, 0] });
      b.box(t, 0.35, OD, plaster, { at: [-OW / 2 + 0.25, 0.35 + colH, 0] });
    });

    // Tuscan colonnade all round
    const cx = spread(8, -OW / 2 + 0.25, OW / 2 - 0.25);
    const cz = spread(4, -OD / 2 + 0.25, OD / 2 - 0.25);
    const col = (x: number, z: number) => {
      b.column(0.22, colH, stone, { at: [x, 0.35, z], order: 'tuscan', segs: 8 });
      b.collider(0.5, 0.5, { at: [x, 0, z] });
    };
    for (const x of cx) {
      col(x, OD / 2 - 0.25);
      col(x, -OD / 2 + 0.25);
    }
    for (const z of cz.slice(1, -1)) {
      col(OW / 2 - 0.25, z);
      col(-OW / 2 + 0.25, z);
    }
    b.collider(BW, BD, { at: [0, 0, 0] });

    // shop fronts on both long sides
    const shopX = spread(5, -BW / 2, BW / 2);
    const shutter = tint(P.oak, 0.05);
    for (const s of [1, -1] as const) {
      const zf = s * (BD / 2);
      const facing = s > 0 ? '+z' : '-z';
      shopX.forEach((x, i) => {
        // wide opening with a stone threshold
        b.panel(2.4, 2.8, P.windowDark, { at: [x, 0.35, zf], facing, depth: 0.04 });
        b.panel(2.7, 0.22, stone, { at: [x, 3.15, zf], facing, depth: 0.12 }); // timber lintel, plastered
        const open = (i + s + b.variant) % 3 !== 0;
        if (open) {
          // folded-back shutters and a masonry counter with goods
          b.panel(0.35, 2.7, shutter, { at: [x - 1.4, 0.4, zf], facing, depth: 0.1 });
          b.panel(0.35, 2.7, shutter, { at: [x + 1.4, 0.4, zf], facing, depth: 0.1 });
          b.box(2.3, 0.85, 0.5, plaster, { at: [x, 0.35, zf + s * 0.25] });
          goods(b, 2.0, [x, 1.2, zf + s * 0.25], 0, ['basket', 'pot', 'fruit']);
        } else {
          // closed with vertical boards
          b.panel(2.4, 2.75, shutter, { at: [x, 0.35, zf], facing, depth: 0.08 });
          for (const dx of [-0.8, -0.4, 0, 0.4, 0.8]) b.panel(0.04, 2.7, tint(shutter, -0.12), { at: [x + dx, 0.38, zf], facing, depth: 0.11 });
        }
      });
      // amphorae stacked against a column
      amphora(b, [s * 4.4, 0.35, zf + s * 1.2]);
      amphora(b, [s * 4.75, 0.35, zf + s * 1.0]);
    }

    // end walls: a central door through to the store, a small window and a painted plaque
    for (const s of [1, -1] as const) {
      const xf = s * (BW / 2);
      const facing = s > 0 ? '+x' : '-x';
      b.panel(1.4, 2.5, P.oakDark, { at: [xf, 0.35, 0], facing, shape: 'round' });
      b.window(0.7, 0.7, { at: [xf, 3.4, -1.8], facing, frame: stone, bars: [2, 2] });
      b.window(0.7, 0.7, { at: [xf, 3.4, 1.8], facing, frame: stone, bars: [2, 2] });
      b.panel(1.8, 0.6, P.cream, { at: [xf, 3.6, 0], facing });
    }
  },
};
