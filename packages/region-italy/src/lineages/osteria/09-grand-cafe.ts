import { P, linspace, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { cafeTable, ground, shutteredWindow } from './shared';

const XO = 9.4;
const ZF = 6.2; // main front
const ZB = -7.0; // back
const G = 5.6; // the café floor: tall rooms
const F1 = 5.2; // reception rooms above
const TOP = G + F1;
const PZ = 9.4; // front line of the Doric porches
const PCX = 5.4; // porch centres at ±PCX
const PW = 5.6; // porch width
const LW = 3.0; // half-width of the upper loggia

/** A couchant lion in the Egyptian manner, facing local +Z, on a plinth. */
function lion(b: Builder, at: [number, number, number], color: number): void {
  b.group({ at }, () => {
    b.box(0.95, 0.75, 1.9, tint(color, -0.04), { at: [0, 0, 0] });
    b.box(1.05, 0.1, 2.0, tint(color, -0.08), { at: [0, 0.75, 0] });
    const y = 0.85;
    b.box(0.62, 0.45, 1.3, color, { at: [0, y, -0.2] });
    b.box(0.68, 0.55, 0.5, color, { at: [0, y, -0.55] });
    b.sym((s) => b.box(0.16, 0.14, 0.62, color, { at: [s * 0.18, y, 0.65] }));
    b.box(0.58, 0.72, 0.48, tint(color, -0.03), { at: [0, y + 0.2, 0.35] });
    b.box(0.36, 0.34, 0.34, color, { at: [0, y + 0.52, 0.62] });
    b.box(0.2, 0.12, 0.1, tint(color, -0.15), { at: [0, y + 0.6, 0.8] });
    b.beam([0.2, y + 0.1, -0.85], [0.3, y + 0.05, 0.1], 0.06, 0.06, color);
  });
}

export const grandCafe: BuildingDef = {
  id: 'grand-cafe',
  name: 'Grand café',
  style: 'Neoclassical',
  date: '1831',
  modelledOn: 'Caffè Pedrocchi, Padua, by Giuseppe Jappelli (opened 1831; upper floor completed 1842)',
  summary:
    'Coffee reached Venice in the seventeenth century, and by the nineteenth the café had become where the educated town met, read the papers and argued about politics. ' +
    'This one is a temple to the habit: a pale neoclassical block on a smooth rusticated base, with two Greek Doric porches guarded by stone lions and a loggia of Corinthian columns in front of the reception rooms above. ' +
    'The Pedrocchi in Padua, on which it is modelled, was called the café without doors because until 1916 it stayed open day and night, and in 1848 it saw a student rising against Austrian rule. ' +
    'The old inn trade has moved to new hotels; the plot that once fed travellers now serves the town’s own talk.',
  materials: ['brick, stuccoed', 'Istrian stone', 'Euganean trachyte', 'lead and tile roof'],
  lookFor: [
    { label: 'Doric porch', note: 'Greek Doric columns without bases carry a frieze of triglyphs, the order neoclassical architects copied from temples such as those at Paestum.', at: [PCX, 3.8, PZ + 0.4] },
    { label: 'Stone lions', note: 'Couchant lions in the Egyptian manner guard the porch steps. Those at the Pedrocchi copy the ancient Egyptian lions at the foot of the Capitol steps in Rome.', at: [-PCX - PW / 2 - 0.1, 2.2, PZ + 1.0] },
    { label: 'No doors', note: 'The porches open straight into the café rooms, which at the Pedrocchi stayed open day and night until 1916, so there was no need of a door.', at: [-PCX, 1.8, ZF + 0.2] },
    { label: 'Corinthian loggia', note: 'The upper floor of reception and ballrooms sits behind a loggia of Corinthian columns: the richer order for the grander rooms.', at: [0, G + 2.8, ZF + 0.4] },
    { label: 'Rusticated base', note: 'The ground floor stucco is cut into broad smooth bands, making the base look heavier and stronger than the floor above.', at: [-8.5, 2.0, ZF + 0.2] },
  ],
  build(b) {
    const stucco = b.pick([P.stucco, P.whiteRender, tint(P.stucco, -0.02)]);
    const stone = P.portland;
    const groove = tint(stucco, -0.1);
    const roof = P.lead;
    const zm = (ZF + ZB) / 2;

    ground(b, 21.6, 4.8, P.paving, [0, 8.6], 0.1);

    // ---------------- the café floor: a rusticated base
    b.box(2 * XO, G, ZF - ZB, stucco, { at: [0, 0, zm] });
    b.box(2 * XO + 0.08, 0.6, ZF - ZB + 0.08, P.peperino, { at: [0, 0, zm] });
    for (let y = 1.1; y < G - 0.4; y += 0.55) {
      b.box(2 * XO + 0.04, 0.05, ZF - ZB + 0.04, groove, { at: [0, y, zm], jitter: false });
    }
    b.box(2 * XO + 0.2, 0.35, ZF - ZB + 0.2, stone, { at: [0, G - 0.3, zm] });
    // tall round-headed windows and open doorways of the café rooms
    const doors = [-PCX - 1.4, -PCX + 1.4, PCX - 1.4, PCX + 1.4];
    for (const x of doors) {
      b.panel(1.5, 3.9, P.windowDark, { at: [x, 0.6, ZF], facing: '+z', shape: 'round', depth: 0.05 });
      b.panel(1.8, 4.1, stone, { at: [x, 0.6, ZF], facing: '+z', shape: 'round', depth: 0.03 });
    }
    for (const x of [-8.3, 0, 8.3]) {
      b.window(1.4, 3.4, { at: [x, 1.0, ZF], facing: '+z', shape: 'round', frame: P.white, border: 0.1, bars: [2, 4] });
      b.panel(1.7, 3.6, stone, { at: [x, 0.95, ZF], facing: '+z', shape: 'round', depth: 0.03 });
    }
    for (const z of spread(4, ZB + 0.5, ZF - 0.5)) {
      b.sym((s) => {
        b.window(1.4, 3.4, { at: [s * XO, 1.0, z], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: P.white, border: 0.1, bars: [2, 4] });
        shutteredWindow(b, 1.2, 2.4, { at: [s * XO, G + 1.2, z], facing: s > 0 ? '+x' : '-x', frame: P.white, shutter: P.doorGreen, surround: stone });
      });
    }
    for (const x of spread(5, -XO + 0.5, XO - 0.5)) {
      b.window(1.3, 3.0, { at: [x, 1.0, ZB], facing: '-z', shape: 'round', frame: P.white, border: 0.1, bars: [2, 4] });
      shutteredWindow(b, 1.2, 2.4, { at: [x, G + 1.2, ZB], facing: '-z', frame: P.white, shutter: P.doorGreen, surround: stone });
    }

    // ---------------- the upper floor, with a Corinthian loggia in the middle
    const lz = ZF - 1.4; // back wall of the loggia
    b.sym((s) => b.box(XO - LW, F1, ZF - ZB, stucco, { at: [s * (XO + LW) / 2, G, zm] }));
    b.box(2 * LW, F1, lz - ZB, stucco, { at: [0, G, (lz + ZB) / 2] });
    for (const x of linspace(4, -LW + 0.4, LW - 0.4)) b.column(0.3, F1 - 1.0, stone, { at: [x, G + 0.05, ZF - 0.35], order: 'corinthian' });
    b.sym((s) => b.box(0.7, F1 - 1.0, 0.7, stucco, { at: [s * (LW - 0.05), G, ZF - 0.35] }));
    b.box(2 * LW, 1.0, ZF - lz, stucco, { at: [0, TOP - 1.0, (ZF + lz) / 2] });
    for (const x of [-1.5, 1.5]) b.panel(1.3, 3.0, P.windowDark, { at: [x, G + 0.1, lz], facing: '+z', depth: 0.05 });
    b.box(2 * LW - 0.4, 0.1, 0.25, stone, { at: [0, G + 1.0, ZF - 0.35] });
    for (const x of spread(14, -LW + 0.6, LW - 0.6)) b.cyl(0.07, 1.0, stone, { at: [x, G, ZF - 0.35], segs: 5, rTop: 0.05 });
    // pedimented windows either side
    for (const x of [-8.0, -5.4, 5.4, 8.0]) {
      shutteredWindow(b, 1.2, 2.6, { at: [x, G + 1.0, ZF], facing: '+z', frame: P.white, shutter: P.doorGreen, surround: stone });
      b.extrude([[-0.95, 0], [0.95, 0], [0, 0.45]], 0.2, stone, { at: [x, G + 3.8, ZF + 0.1] });
    }
    // cornice, balustraded attic and a low roof behind it
    b.box(2 * XO + 0.5, 0.3, ZF - ZB + 0.5, stone, { at: [0, TOP, zm] });
    b.box(2 * XO + 0.2, 0.18, ZF - ZB + 0.2, stone, { at: [0, TOP - 0.2, zm] });
    for (const [w, d, x, z] of [[2 * XO, 0.3, 0, ZF - 0.05], [2 * XO, 0.3, 0, ZB + 0.05], [0.3, ZF - ZB, XO - 0.05, zm], [0.3, ZF - ZB, -XO + 0.05, zm]] as const) {
      b.box(w, 0.2, d, stone, { at: [x, TOP + 0.3, z] });
      b.box(w, 0.15, d + 0.1, stone, { at: [x, TOP + 1.2, z] });
    }
    for (const x of spread(30, -XO + 0.3, XO - 0.3)) b.cyl(0.08, 0.7, stone, { at: [x, TOP + 0.5, ZF - 0.05], segs: 5, rTop: 0.06 });
    for (const z of spread(16, ZB + 0.3, ZF - 0.3)) b.sym((s) => b.cyl(0.08, 0.7, stone, { at: [s * (XO - 0.05), TOP + 0.5, z], segs: 5, rTop: 0.06 }));
    b.hip(2 * XO - 1, ZF - ZB - 1, 1.8, roof, { at: [0, TOP + 0.3, zm] });

    // ---------------- the two Doric porches, each with a terrace above and lions at the steps
    b.sym((s) => {
      const cx = s * PCX;
      const pd = PZ - ZF;
      b.box(PW + 0.6, 0.6, pd + 0.4, stone, { at: [cx, 0, ZF + pd / 2 + 0.2] });
      b.stairs(PW - 1.0, 0.6, 0.9, 3, stone, { at: [cx, 0, PZ + 0.85] });
      const colH = 4.4;
      for (const x of linspace(4, cx - PW / 2 + 0.4, cx + PW / 2 - 0.4)) {
        b.column(0.33, colH, stone, { at: [x, 0.6, PZ - 0.2], order: 'doric', segs: 12 });
      }
      b.sym((t) => b.box(0.6, colH, 0.6, stone, { at: [cx + t * (PW / 2 - 0.3), 0.6, ZF + 0.3] }));
      // entablature: architrave, triglyph frieze, cornice
      const ey = 0.6 + colH;
      b.box(PW + 0.2, 0.5, pd + 0.2, stone, { at: [cx, ey, ZF + pd / 2] });
      b.box(PW + 0.2, 0.55, pd + 0.2, stucco, { at: [cx, ey + 0.5, ZF + pd / 2] });
      for (const x of spread(9, cx - PW / 2, cx + PW / 2)) b.panel(0.26, 0.5, stone, { at: [x, ey + 0.52, PZ + 0.1], facing: '+z', depth: 0.06 });
      b.box(PW + 0.6, 0.25, pd + 0.5, stone, { at: [cx, ey + 1.05, ZF + pd / 2 + 0.05] });
      // terrace balustrade over the porch
      for (const x of spread(12, cx - PW / 2 + 0.2, cx + PW / 2 - 0.2)) b.cyl(0.07, 0.7, stone, { at: [x, ey + 1.3, PZ], segs: 5, rTop: 0.05 });
      b.box(PW + 0.4, 0.14, 0.3, stone, { at: [cx, ey + 2.0, PZ] });
      // lions on plinths either side of the steps
      b.sym((t) => {
        lion(b, [cx + t * (PW / 2 + 0.1), 0, PZ + 0.6], P.portland);
        b.collider(0.95, 1.9, { at: [cx + t * (PW / 2 + 0.1), 0, PZ + 0.6] });
      });
      // café tables in the porch
      cafeTable(b, [cx - 1.2, 0.6, ZF + 1.6], P.marble, P.castIron, 2, Math.PI / 2);
      cafeTable(b, [cx + 1.2, 0.6, ZF + 1.6], P.marble, P.castIron, 2, Math.PI / 2);
    });

    // a gas lamp on the corner
    b.cyl(0.08, 3.4, P.castIron, { at: [0, 0.1, 9.8], segs: 6 });
    b.lathe([[0.05, 0], [0.25, 0.3], [0.2, 0.6], [0.0, 0.75]], P.glassDark, { at: [0, 3.48, 9.8], segs: 6 });
    cafeTable(b, [-1.8, 0.1, 9.6], P.marble, P.castIron, 2);
    cafeTable(b, [1.8, 0.1, 9.6], P.marble, P.castIron, 2);

    b.collider(2 * XO, ZF - ZB, { at: [0, 0, zm] });
  },
};
