import { P, linspace, tint, type BuildingDef } from '@ah/kit';
import { barrel, beam, goods, trestle } from './shared';

export const tudorMarketHall: BuildingDef = {
  id: 'tudor-market-hall',
  name: 'Market hall',
  style: 'Late Tudor and Jacobean timber framing',
  date: 'c. 1617',
  summary:
    'The town now governs itself, and it puts its council chamber on stilts over the market. Sixteen oak posts carry a timber-framed upper room where the borough court met and corn was stored, while traders keep the dry, open floor below. ' +
    'Oak was still plentiful in the west Midlands, and the frame is a show of it: close-set studs and zigzag herringbone braces that a plainer building would not need. ' +
    'Unlike the stone cross before it, this is a working building with a room for the people who run the town.',
  materials: ['oak frame', 'lime plaster infill', 'clay tiles', 'sandstone post pads'],
  lookFor: [
    { label: 'Open undercroft', note: 'The ground floor is left open between the posts so that traders can set out stalls under cover.', at: [0, 1.6, 3.9] },
    { label: 'Close studding', note: 'Vertical timbers set as close as their own width apart. It used far more oak than needed, so it signalled wealth.', at: [-4.2, 4.0, 4.0] },
    { label: 'Herringbone bracing', note: 'Short diagonal timbers set in alternating directions to make a decorative zigzag.', at: [2.1, 5.2, 4.1] },
    { label: 'Jetty', note: 'The upper floor projects beyond the posts on its joist ends, giving more room upstairs and shelter below.', at: [7.6, 3.4, 4.0] },
    { label: 'Mullioned windows', note: 'Wide windows divided by upright mullions and a transom into small leaded panes.', at: [-2.1, 5.4, 4.1] },
  ],
  modelledOn: 'The Market House, Ledbury, Herefordshire (begun c. 1617)',
  build(b) {
    const L = 15; // length of the post grid (X)
    const W = 6.8; // width of the post grid (Z)
    const PH = 3.2; // post height to the floor beams
    const J = 0.45; // jetty projection
    const UH = 2.9; // upper storey height
    const oak = b.pick([P.timberBlack, P.oakDark, tint(P.oakDark, -0.05)]);
    const fill = b.pick([P.limewash, P.plaster, P.ochreWash]);
    const stone = P.sandstone;
    const xs = linspace(8, -L / 2, L / 2);

    // stone paving under the hall
    b.box(L + 1.6, 0.08, W + 1.6, P.paving);

    // sixteen posts on stone pads, with braces to the beams
    for (const x of xs) {
      for (const s of [-1, 1]) {
        const z = s * (W / 2);
        b.box(0.62, 0.38, 0.62, stone, { at: [x, 0.08, z] });
        b.box(0.32, PH - 0.46, 0.32, oak, { at: [x, 0.46, z] });
        b.box(0.42, 0.16, 0.42, oak, { at: [x, PH - 0.36, z] });
        b.collider(0.62, 0.62, { at: [x, 0, z] });
        // braces along the length and across the width
        if (x > -L / 2 + 0.1) beam(b, [x, PH - 1.0, z], [x - 0.75, PH - 0.05, z], 0.14, oak);
        if (x < L / 2 - 0.1) beam(b, [x, PH - 1.0, z], [x + 0.75, PH - 0.05, z], 0.14, oak);
        beam(b, [x, PH - 1.0, z], [x, PH - 0.05, z - s * 0.75], 0.14, oak);
      }
    }
    // floor beams, joist ends of the jetty, bressumer
    b.box(L + 0.4, 0.3, W + 0.4, oak, { at: [0, PH - 0.2, 0] });
    b.box(L + 2 * J, 0.12, W + 2 * J, tint(P.oak, 0.05), { at: [0, PH - 0.02, 0] }); // underside boards
    for (const x of linspace(19, -L / 2 - J + 0.15, L / 2 + J - 0.15)) {
      for (const s of [-1, 1]) b.box(0.13, 0.16, J + 0.2, oak, { at: [x, PH - 0.12, s * (W / 2 + J / 2)] });
    }
    for (const z of linspace(8, -W / 2 - J + 0.15, W / 2 + J - 0.15)) {
      for (const s of [-1, 1]) b.box(J + 0.2, 0.16, 0.13, oak, { at: [s * (L / 2 + J / 2), PH - 0.12, z] });
    }
    const y1 = PH + 0.1;
    b.box(L + 2 * J + 0.1, 0.24, W + 2 * J + 0.1, oak, { at: [0, y1 - 0.14, 0] }); // bressumer all round

    // the upper storey: plastered infill with the frame laid over it
    const UL = L + 2 * J;
    const UW = W + 2 * J;
    b.box(UL, UH, UW, fill, { at: [0, y1, 0] });
    const bays = 7;
    const bw = UL / bays;
    for (const s of [1, -1] as const) {
      const zf = s * (UW / 2);
      const facing = s > 0 ? '+z' : '-z';
      for (let i = 0; i < bays; i++) {
        const x = -UL / 2 + (i + 0.5) * bw;
        // close-studded lower register
        b.frame(bw, 1.0, oak, { at: [x, y1, zf], facing, studs: 4, rails: 0, beam: 0.15 });
        if (i % 2 === 1) {
          // a mullioned and transomed window with leaded lights
          b.frame(bw, UH - 1.0, oak, { at: [x, y1 + 1.0, zf], facing, studs: 0, rails: 0, beam: 0.15 });
          b.window(1.5, 1.2, { at: [x, y1 + 1.2, zf], facing, frame: oak, glass: P.glassDark, bars: [4, 2], border: 0.08 });
        } else {
          b.frame(bw, UH - 1.0, oak, { at: [x, y1 + 1.0, zf], facing, studs: 3, rails: 1, brace: 'herringbone', beam: 0.13 });
        }
      }
    }
    // gable ends
    for (const s of [1, -1] as const) {
      const xf = s * (UL / 2);
      const facing = s > 0 ? '+x' : '-x';
      for (const z of [-UW / 3, UW / 3]) b.frame(UW / 3, UH, oak, { at: [xf, y1, z], facing, studs: 2, rails: 1, brace: 'herringbone', beam: 0.13 });
      b.frame(UW / 3, 1.0, oak, { at: [xf, y1, 0], facing, studs: 3, rails: 0, beam: 0.15 });
      b.frame(UW / 3, UH - 1.0, oak, { at: [xf, y1 + 1.0, 0], facing, studs: 0, rails: 0, beam: 0.15 });
      b.window(1.4, 1.2, { at: [xf, y1 + 1.2, 0], facing, frame: oak, glass: P.glassDark, bars: [3, 2], border: 0.08 });
    }
    // roof: steep clay-tiled gable with the ridge along the hall
    const yR = y1 + UH;
    const rH = 3.4;
    b.box(UL + 0.1, 0.22, UW + 0.1, oak, { at: [0, yR - 0.22, 0] }); // wall plate
    const tile = b.pick([P.tileBrown, P.tileRed]);
    b.gable(UL, UW, rH, tile, { at: [0, yR, 0], ridge: 'x', overhang: 0.35, wall: fill });
    b.log(0.14, UL + 0.7, tint(tile, -0.1), { at: [0, yR + rH, 0], segs: 6 });
    // framed gable triangles: studs, collar and bargeboards
    for (const s of [1, -1] as const) {
      const xf = s * (UL / 2 + 0.04);
      for (const z of linspace(7, -UW / 2 + 0.5, UW / 2 - 0.5)) {
        const h = rH * (1 - Math.abs(z) / (UW / 2)) - 0.05;
        b.box(0.1, h, 0.15, oak, { at: [xf, yR, z] });
      }
      b.box(0.1, 0.18, UW * 0.55, oak, { at: [xf, yR + rH * 0.45, 0] });
      b.window(0.6, 0.6, { at: [xf + s * 0.02, yR + rH * 0.55, 0], facing: s > 0 ? '+x' : '-x', frame: oak, glass: P.glassDark, bars: [2, 2] });
      for (const t of [-1, 1]) {
        beam(b, [xf + s * 0.35, yR - 0.3, t * (UW / 2 + 0.35)], [xf + s * 0.35, yR + rH + 0.05, 0], 0.08, oak, 0.3);
      }
    }
    // a small timber bell-cote on the ridge (the market bell)
    b.box(0.7, 0.9, 0.7, oak, { at: [L / 4, yR + rH - 0.3, 0] });
    b.pyramid(0.95, 0.95, 0.7, P.lead, { at: [L / 4, yR + rH + 0.6, 0] });

    // stair up to the chamber inside the undercroft, at the west end
    b.group({ at: [-L / 2 + 1.0, 0.08, 0.4], rotY: Math.PI }, () => {
      for (let i = 0; i < 12; i++) b.box(1.0, 0.08, 0.32, P.oak, { at: [0, 0.26 * (i + 1) - 0.08, 1.8 - i * 0.26] });
      for (const s of [-1, 1]) beam(b, [s * 0.5, 0, 2.0], [s * 0.5, PH - 0.1, -1.3], 0.08, oak, 0.25);
    });
    b.collider(1.2, 3.4, { at: [-L / 2 + 1.0, 0, 0.4] });

    // stalls in the undercroft and spilling out
    trestle(b, 2.4, 0.8, [-2.2, 0.08, 1.4], 0);
    goods(b, 2, [-2.2, 0.96, 1.4], 0, ['cloth', 'cloth', 'basket']);
    trestle(b, 2.4, 0.8, [2.4, 0.08, -1.2], Math.PI);
    goods(b, 2, [2.4, 0.96, -1.2], Math.PI, ['basket', 'sack', 'basket']);
    barrel(b, [5.6, 0.08, 1.6]);
    barrel(b, [6.1, 0.08, 1.1], 0.9);
    goods(b, 1.8, [-5.4, 0.08, -2.0], 0.4, ['sack', 'sack', 'sack']);
  },
};
