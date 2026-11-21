import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { PW, ROW, coppiRoof, medievalRow, patch, rowX, shuttered, washing, wellHead } from './shared';

const FH = 2.75; // height of each added storey

export const raisedRow: BuildingDef = {
  id: 'raised-row',
  name: 'The row raised',
  style: 'Late Renaissance vernacular',
  date: 'c. 1580',
  summary:
    'By the late sixteenth century the town had filled up inside its walls, and landlords made more rent the only way left: by building upwards. Each house of the old row was raised by one or two storeys, in brick plastered over, by a different owner at a different time, so the roofline steps up and down. ' +
    'The medieval stone and the round-headed windows survive below; above them are plain square windows with stone frames and wooden shutters. ' +
    'A family might now have a single room on one floor, sharing the well in the yard, the stair and the washing lines with a dozen others.',
  materials: ['medieval stone below', 'brick, plastered and limewashed in ochre and rose', 'pietra serena or travertine window frames', 'coppi roof tiles'],
  lookFor: [
    { label: 'Added storeys', note: 'Plastered brick storeys built on top of the medieval stone ones: you can see the line where the old wall stops.', at: [rowX(0), ROW.top + 0.15, ROW.zf + 0.2] },
    { label: 'Uneven roofline', note: 'Each house was raised separately, so the roofs step up and down and the side walls of the taller houses stand bare above their neighbours.', at: [rowX(1) - ROW.hw / 2 + 0.1, ROW.top + FH * 1.6, ROW.zf - 1.2] },
    { label: 'Washing lines', note: 'Lines strung across the front from window to window: in a crowded house there was nowhere else to dry clothes.', at: [rowX(3), ROW.top + FH + 1.2, ROW.zf + 0.5] },
    { label: 'Shared well', note: 'The strips of yard behind have become one shared courtyard, with a well for all the families.', at: [rowX(2), 1.4, -5.2] },
    { label: 'Old profferlo', note: 'The medieval outside stair still serves the first floor; the floors above are reached from inside.', at: [rowX(1) + 0.4, 2.2, ROW.zf + 1.1] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.peperino, tint(P.peperino, 0.05), P.tufa, P.pietraForte]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const hw = ROW.hw;
    const L = ROW.n * hw;
    const zc = (ROW.zf + ROW.zb) / 2;
    const D = ROW.zf - ROW.zb;
    const plasters = [P.intonacoOchre, P.intonacoRose, P.intonacoCream, P.intonacoSienna, tint(P.intonacoOchre, 0.06), P.plaster];
    const frameStone = b.pick([P.pietraSerena, P.travertine]);
    const shutter = b.pick([P.oak, P.oakDark, tint(P.oak, 0.06)]);

    patch(b, PW, 8 - ROW.zf, mix(P.cobble, P.paving, 0.4), [0, (ROW.zf + 8) / 2], 0.05);
    patch(b, PW, 8 + ROW.zb, mix(P.brickRed, P.paving, 0.55), [0, (ROW.zb - 8) / 2], 0.04);

    const stairs = [true, true, b.chance(0.7), true, b.chance(0.5)];
    medievalRow(b, stone, { stairs, shield: b.pick([P.terracottaPainted, P.doorBlue]) });

    // storeys added on top, one or two to each house
    const extra = [2, 1, 2, 1, 2].map((e, i) => (i === 0 || i === 2 ? e : b.pick([1, 2])));
    const colours: number[] = [];
    for (let i = 0; i < ROW.n; i++) {
      const x = rowX(i);
      const col = b.pick(plasters.filter((c) => c !== colours[i - 1]));
      colours.push(col);
      const h = extra[i] * FH;
      const y0 = ROW.top;
      b.box(hw, h, D, col, { at: [x, y0, zc] });
      // the medieval wall-top reads as a line: a thin band where the new storey starts
      b.box(hw + 0.02, 0.1, D + 0.02, tint(stone, -0.05), { at: [x, y0 - 0.02, zc] });
      for (let f = 0; f < extra[i]; f++) {
        const y = y0 + f * FH + 0.85;
        for (const wx of [-1.05, 1.05]) {
          shuttered(b, x + wx, y, ROW.zf, 0.75, 1.25, '+z', { shutter, surround: frameStone, open: b.chance(0.6) });
          b.window(0.7, 1.15, { at: [x + wx, y, ROW.zb], facing: '-z', frame: frameStone, glass: P.windowDark, border: 0.07 });
        }
      }
      // its own roof, at its own height, and a chimney with a tiled cap
      const top = y0 + h;
      coppiRoof(b, hw - 0.02, D, 20, roof, { at: [x, top, zc], ov: 0.4, wall: col, rib: 0.55 });
      const cx = x + b.pick([-1.4, 1.4]);
      b.box(0.55, 2.0, 0.55, col, { at: [cx, top, zc - 1.6] });
      b.pyramid(0.85, 0.85, 0.35, roof, { at: [cx, top + 2.0, zc - 1.6] });
    }

    // washing lines across the front, from one window to the next
    const lines = [
      [2, 3],
      [3, 4],
    ];
    if (b.chance(0.6)) lines.push([0, 1]);
    for (const [a, c] of lines) {
      const y = ROW.top + FH + 1.15;
      washing(b, [rowX(a) + 1.05, y + 0.95, ROW.zf + 0.45], [rowX(c) - 1.05, y + 0.95, ROW.zf + 0.45], 4);
      for (const px of [rowX(a) + 1.05, rowX(c) - 1.05]) b.box(0.04, 0.04, 0.5, P.iron, { at: [px, y + 0.9, ROW.zf + 0.22] });
    }

    // the shared courtyard: a well, a long line of washing, a stone sink, pots of herbs
    wellHead(b, rowX(2), -5.2, P.travertine);
    b.box(0.12, 2.4, 0.12, P.oakSilver, { at: [rowX(0), 0, -6.6] });
    b.box(0.12, 2.4, 0.12, P.oakSilver, { at: [rowX(4), 0, -6.4] });
    washing(b, [rowX(0), 2.35, -6.6], [rowX(4), 2.35, -6.4], 9);
    b.box(1.4, 0.8, 0.6, P.travertine, { at: [rowX(4) + 0.6, 0, ROW.zb - 0.4] });
    for (let k = 0; k < 4; k++) {
      const px = rowX(0) - 1.6 + k * 0.5;
      b.cyl(0.18, 0.3, P.terracotta, { at: [px, 0, ROW.zb - 0.4], rTop: 0.22, segs: 6 });
      b.blob(0.24, P.leaf, { at: [px, 0.45, ROW.zb - 0.4], detail: 0 });
    }
    // a wall closing the courtyard at the back, with a gate
    b.box(L * 0.42, 2.2, 0.35, stone, { at: [-L * 0.29, 0, -7.75] });
    b.box(L * 0.42, 2.2, 0.35, stone, { at: [L * 0.29, 0, -7.75] });
    b.panel(2.0, 2.0, P.oakDark, { at: [0, 0.02, -7.6], facing: '-z', depth: 0.05 });
    b.box(2.6, 0.3, 0.4, stone, { at: [0, 2.2, -7.75] });

    b.collider(L, D, { at: [0, 0, zc] });
    b.collider(L, 1.3, { at: [0, 0, ROW.zf + 0.62] });
    b.collider(L, 0.4, { at: [0, 0, -7.75] });
  },
};
