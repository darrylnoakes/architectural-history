import { P, linspace, tint, type BuildingDef } from '@ah/kit';
import { amphora, goods, paving, tileRibs } from './shared';

export const forumShops: BuildingDef = {
  id: 'forum-shops',
  name: 'Forum shops (tabernae) under a portico',
  style: 'Roman Republican',
  date: 'c. 200 to 50 BC',
  summary:
    'As a self-governing Roman town the place gets a forum, and along it the council builds rows of one-room shops, tabernae, let to traders. ' +
    'Each shop opens its whole front by day and is shut at night with boards slid into a grooved threshold; a small window above lights a timber loft where the shopkeeper slept or stored stock. ' +
    'A portico of stuccoed tufa columns keeps sun and rain off the buyers, and in front stands the mensa ponderaria, a stone table with cavities of official size against which any trader’s measures could be checked.',
  materials: ['tufa blocks', 'white stucco', 'timber lintels and shutters', 'clay tegulae and imbrices', 'travertine'],
  lookFor: [
    { label: 'Mensa ponderaria', note: 'The table of standard measures: each hollow held an official quantity of grain, oil or wine, with a hole beneath to let it out.', at: [0, 1.4, 9.0] },
    { label: 'Taberna', note: 'A one-room shop with a wide opening, a timber lintel and a stone threshold grooved for the shutter boards.', at: [-2.0, 2.2, 4.4] },
    { label: 'Loft window', note: 'The small window over each shop lit the pergula, a timber mezzanine where the family often lived.', at: [6.0, 3.6, 4.4] },
    { label: 'Tuscan portico', note: 'Plain columns of local tufa coated in white stucco, with a timber beam over them: the Italian order the Romans had from the Etruscans.', at: [-8.6, 3.6, 7.4] },
    { label: 'Painted notices', note: 'Whitewashed panels on the end walls carried painted election slogans and announcements of games, as survive at Pompeii.', at: [-10.3, 2.4, 0] },
  ],
  influences: ['etruscan-legacy', 'hellenistic-luxury'],
  build(b) {
    const BW = 20.4; // shop block
    const BD = 8.4;
    const WH = 5.8; // wall height of the block
    const F = 0.36; // portico floor (two steps up from the paving)
    const colH = 3.6;
    const CZ = 7.3; // column line
    const plaster = b.pick([P.stucco, P.limewash, tint(P.intonacoCream, 0.04)]);
    const dado = b.pick([P.intonacoRed, P.marbleRed, P.intonacoOchre]);
    const tufa = P.tufa;
    const tile = P.romanTile;
    const stucco = P.whiteRender;

    // the forum paving and the raised walk under the porticoes
    paving(b, 25.6, 21.6, P.travertine, 0.1, [0, 0, 0], 14);
    b.box(BW + 1.6, F / 2, 2 * CZ + 1.4, tint(tufa, 0.04), { at: [0, 0.1, 0] });
    b.box(BW + 1.2, F / 2 - 0.1, 2 * CZ + 1.0, tint(tufa, 0.08), { at: [0, 0.1 + F / 2, 0] });
    const fy = F + 0.1;

    // the shop block, back to back, with a red painted dado
    b.box(BW, WH, BD, plaster, { at: [0, fy, 0] });
    b.box(BW + 0.04, 0.9, BD + 0.04, dado, { at: [0, fy, 0] });
    b.box(BW + 0.24, 0.2, BD + 0.24, tint(plaster, -0.06), { at: [0, fy + WH - 0.2, 0] });
    b.collider(BW, BD);

    // main roof, ridge along X, low Roman pitch, with rows of imbrices
    const rY = fy + WH;
    const rH = 1.6;
    b.gable(BW, BD, rH, tile, { at: [0, rY, 0], ridge: 'x', overhang: 0.35, wall: plaster });
    const xs = linspace(20, -BW / 2 + 0.1, BW / 2 - 0.1);
    for (const s of [-1, 1]) tileRibs(b, xs, rY - 0.05, s * (BD / 2 + 0.35), rY + rH + 0.08, 0, tint(tile, -0.07));
    b.log(0.12, BW + 0.7, tint(tile, -0.1), { at: [0, rY + rH + 0.02, 0], segs: 6 });

    // the two porticoes, front and back
    const leanLow = fy + colH + 0.4; // top of the beam over the columns
    const leanHigh = fy + WH - 0.5;
    const pd = CZ + 0.35 - BD / 2; // depth of each portico roof
    for (const s of [1, -1] as const) {
      const zc = s * (BD / 2 + pd / 2);
      // timber beam, plastered, with a terracotta facing strip
      b.box(BW + 1.0, 0.4, 0.45, plaster, { at: [0, fy + colH, s * CZ] });
      b.box(BW + 1.04, 0.14, 0.49, P.terracottaPainted, { at: [0, fy + colH + 0.22, s * CZ] });
      b.shed(BW + 1.0, pd, leanHigh - leanLow, tile, { at: [0, leanLow, zc], high: s > 0 ? '-z' : '+z' });
      tileRibs(b, linspace(19, -BW / 2, BW / 2), leanLow + 0.02, s * (CZ + 0.35), leanHigh + 0.03, s * (BD / 2), tint(tile, -0.07));
      // columns, with square piers at the ends
      for (const x of linspace(8, -BW / 2 + 1.6, BW / 2 - 1.6)) {
        b.column(0.24, colH, stucco, { at: [x, fy, s * CZ], order: 'tuscan', segs: 6 });
        b.collider(0.55, 0.55, { at: [x, 0, s * CZ] });
      }
      for (const sx of [-1, 1]) {
        b.box(0.6, colH, 0.6, plaster, { at: [sx * (BW / 2 + 0.1), fy, s * CZ] });
        b.box(0.7, 0.2, 0.7, tint(plaster, -0.05), { at: [sx * (BW / 2 + 0.1), fy + colH - 0.2, s * CZ] });
        b.collider(0.6, 0.6, { at: [sx * (BW / 2 + 0.1), 0, s * CZ] });
        // the open end of the lean-to is closed by a plastered cheek
      }
    }

    // shop fronts on both long sides
    const shopX = [-8, -4, 0, 4, 8];
    const board = tint(P.oak, 0.06);
    for (const s of [1, -1] as const) {
      const zf = s * (BD / 2);
      const facing = s > 0 ? '+z' : '-z';
      shopX.forEach((x, i) => {
        b.panel(2.6, 2.7, P.windowDark, { at: [x, fy, zf], facing, depth: 0.03 });
        b.panel(3.0, 0.26, P.oak, { at: [x, fy + 2.7, zf], facing, depth: 0.12 }); // timber lintel
        b.panel(2.8, 0.06, P.travertine, { at: [x, fy, zf], facing, depth: 0.25 }); // grooved threshold
        b.window(0.9, 0.6, { at: [x, fy + 3.25, zf], facing, frame: P.oak, bars: [3, 1], border: 0.07 });
        const open = (i + (s > 0 ? 0 : 1) + b.variant) % 3 !== 2;
        if (open) {
          // a masonry counter across part of the opening, goods on it, boards stacked inside
          b.box(1.7, 0.95, 0.55, plaster, { at: [x - 0.4, fy, zf + s * 0.28] });
          b.box(1.8, 0.07, 0.62, P.travertine, { at: [x - 0.4, fy + 0.95, zf + s * 0.28] });
          goods(b, 1.6, [x - 0.4, fy + 1.02, zf + s * 0.28], 0, b.pick([['basket', 'pot', 'fruit'], ['cloth'], ['pot', 'sack'], ['cheese', 'basket']] as const).slice());
          for (let k = 0; k < 3; k++) b.box(0.22, 2.3, 0.05, board, { at: [x + 1.05 + k * 0.05, fy, zf + s * (0.1 + k * 0.06)], rot: [0, 0, -0.08] });
        } else {
          // shut with vertical boards
          for (let k = 0; k < 9; k++) b.panel(0.27, 2.62, k % 2 ? board : tint(board, -0.08), { at: [x - 1.2 + k * 0.3, fy + 0.04, zf], facing, depth: 0.08 });
        }
      });
      // pilaster strips between the shops
      for (const x of [-10.1, -6, -2, 2, 6, 10.1]) b.panel(0.4, WH - 0.2, tint(plaster, -0.03), { at: [x, fy, zf], facing, depth: 0.08 });
      // amphorae resting against the block wall
      for (const dx of [0, 0.38, 0.76]) amphora(b, [s * (-6.0 + dx), fy, zf + s * 0.45], P.terracotta, s * -0.25);
    }

    // the end walls: a door to a stair, painted notices
    for (const s of [1, -1] as const) {
      const xf = s * (BW / 2);
      const facing = s > 0 ? '+x' : '-x';
      b.panel(1.1, 2.3, P.oakDark, { at: [xf, fy, -2.2 * s], facing });
      b.panel(1.4, 0.22, P.travertine, { at: [xf, fy + 2.3, -2.2 * s], facing, depth: 0.1 });
      b.panel(2.6, 1.6, P.whiteRender, { at: [xf, fy + 1.6, 1.4 * s], facing, depth: 0.03 });
      // lines of painted lettering: words as short dashes, the first line large and red
      for (let k = 0; k < 4; k++) {
        let x0 = -1.1;
        while (x0 < 0.9) {
          const ww = b.range(0.25, 0.6);
          b.panel(Math.min(ww, 1.1 - x0), k === 0 ? 0.2 : 0.09, k === 0 ? P.intonacoRed : P.timberBlack, { at: [xf, fy + 2.8 - k * 0.3, 1.4 * s - s * (x0 + ww / 2)], facing, depth: 0.05 });
          x0 += ww + 0.14;
        }
      }
      b.window(0.7, 0.5, { at: [xf, fy + 4.1, 0], facing, frame: P.oak, bars: [2, 1] });
    }

    // the mensa ponderaria in the forum in front of the portico
    b.group({ at: [0, 0.1, 9.0] }, () => {
      b.box(2.4, 0.15, 1.1, P.travertine);
      for (const sx of [-1, 1]) b.box(0.35, 0.8, 0.8, tint(P.travertine, -0.05), { at: [sx * 0.85, 0.15, 0] });
      b.box(2.2, 0.32, 0.95, P.travertine, { at: [0, 0.95, 0] });
      const holes: [number, number][] = [
        [-0.75, 0.2],
        [-0.3, 0.16],
        [0.12, 0.13],
        [0.48, 0.11],
        [0.8, 0.09],
      ];
      for (const [x, r] of holes) b.cyl(r, 0.02, P.windowDark, { at: [x, 1.27, 0], segs: 10 });
      // a little bronze measure set on it
      b.cyl(0.08, 0.14, P.bronze, { at: [0.8, 1.29, 0.28], rTop: 0.07, segs: 8 });
    });
    b.collider(2.4, 1.1, { at: [0, 0, 9.0] });
  },
};
