import { P, tint, type BuildingDef } from '@ah/kit';
import { PW, patch, railing } from './shared';

const L = PW; // the slab runs the full width of the plot (and, in reality, nearly a kilometre on)
const ZF = 5.4; // front face
const ZB = -5.0; // back face
const D = ZF - ZB;
const ZC = (ZF + ZB) / 2;
const BASE = 3.4; // ground level: entrances and services
const FH = 3.05;
const OPEN = 3; // index of the open "street" floor among the upper floors (the fourth floor)
const NF = 8; // upper floors including the open one
const TOP = BASE + NF * FH;
const BAY = L / 8;
const REC = 1.6; // how far the open floor is set back

export const megastructure: BuildingDef = {
  id: 'megastructure',
  name: 'Megastructure of social housing',
  style: 'Late Modernism (megastructure)',
  date: 'c. 1978',
  summary:
    'In the 1970s the public housing institutes tried to answer the sprawl of the boom years by building whole neighbourhoods as single buildings. The most famous, Corviale in Rome, is one concrete slab nearly a kilometre long and about thirty metres high, built in 1975 to 1984 for some 6,000 people. ' +
    'It was built from industrial parts, with lifts and stairs in towers at intervals, and one whole floor part-way up was left open as an internal street for shops and services. ' +
    'The shops never came; families without homes moved into the open floor in the 1980s, and Corviale became a byword for the failure of the big estate, though its tenants have fought for it and it is now being renovated. Here a short length of such a slab stands on the plot.',
  materials: ['reinforced concrete', 'precast concrete panels', 'aluminium windows', 'steel railings'],
  modelledOn: 'Corviale, Rome (1972 to 1984; Mario Fiorentino and team for the IACP of Rome), reduced',
  lookFor: [
    { label: 'Open internal street', note: 'A whole floor set back behind the columns, planned for shops, clinics and meeting rooms; it was later filled with homes built by squatters.', at: [-6.5, BASE + OPEN * FH + 1.4, ZF - REC + 0.3] },
    { label: 'Stair and lift tower', note: 'Lifts and stairs rise in towers standing out from the slab; each serves hundreds of flats along the corridors.', at: [3.25, 18.0, ZF + 2.5] },
    { label: 'Industrialised facade', note: 'A repeating grid of concrete panels and windows, the same on every floor and every bay: housing as a product of the factory.', at: [-9.5, 22.0, ZF + 0.2] },
    { label: 'Loggias', note: 'Each flat has a recessed loggia, a balcony cut into the face of the block.', at: [8.1, 8.0, ZF + 0.1] },
    { label: 'The slab goes on', note: 'The real building carries on for nearly a kilometre in a straight line across the countryside.', at: [-12.8, TOP - 2, 0] },
  ],
  influences: [],
  build(b) {
    const conc = b.pick([P.concrete, tint(P.concrete, 0.03), tint(P.concrete, -0.02)]);
    const dark = P.concreteDark;
    const frame = P.aluminium;

    patch(b, PW, 8 - ZF, P.paving, [0, (ZF + 8) / 2], 0.1);
    patch(b, PW, 8 + ZB, P.tarmac, [0, (ZB - 8) / 2], 0.04);
    for (let k = 0; k < 6; k++) b.box(0.12, 0.02, 2.4, P.white, { at: [-10 + k * 4, 0.04, -6.6], jitter: false }); // parking bays

    // base: recessed glazed entrance hall and blank service walls under a heavy slab
    b.box(L, BASE, D - 2.0, dark, { at: [0, 0, ZC] });
    for (let i = 0; i < 8; i++) b.box(0.6, BASE, 0.6, conc, { at: [-L / 2 + (i + 0.5) * BAY, 0, ZF - 0.5] });
    b.window(6.0, 2.6, { at: [3.25, 0.1, ZF - 1.0], facing: '+z', frame, glass: P.glassDark, bars: [4, 1], mat: 'glass', border: 0.08 });

    // the flats: two blocks of floors, below and above the open street
    const lower = OPEN * FH;
    const upper = (NF - OPEN - 1) * FH;
    const yOpen = BASE + lower;
    b.box(L, lower, D, conc, { at: [0, BASE, ZC] });
    b.box(L, upper, D, conc, { at: [0, yOpen + FH, ZC] });
    // the open floor: slab set back, columns on the face line, railings
    b.box(L, FH, D - REC * 2, dark, { at: [0, yOpen, ZC] });
    for (let i = 0; i <= 8; i++) {
      const x = Math.min(L / 2 - 0.25, Math.max(-L / 2 + 0.25, -L / 2 + i * BAY));
      for (const z of [ZF - 0.3, ZB + 0.3]) b.box(0.5, FH, 0.5, conc, { at: [x, yOpen, z] });
    }
    for (const [z, f] of [
      [ZF - REC, '+z'],
      [ZB + REC, '-z'],
    ] as const) {
      railing(b, [-L / 2, yOpen, z + (f === '+z' ? REC - 0.15 : -REC + 0.15)], [L / 2, yOpen, z + (f === '+z' ? REC - 0.15 : -REC + 0.15)], 1.05, P.steel, 0.35);
      // the improvised homes built into the open floor later: a few walls and doors
      for (const x of [-9.8, -3.2, 6.5]) {
        b.window(1.2, 1.2, { at: [x, yOpen + 0.9, z], facing: f, frame: P.white, glass: P.windowDark, border: 0.06 });
        b.panel(0.9, 2.1, b.pick([P.doorGreen, P.doorRed, P.doorBlue, P.oak]), { at: [x + 1.3, yOpen, z], facing: f, depth: 0.05 });
      }
    }
    // floor bands, panel joints and windows on both long faces
    for (const [z, f, s] of [
      [ZF, '+z', 1],
      [ZB, '-z', -1],
    ] as const) {
      for (let fl = 0; fl < NF; fl++) {
        if (fl === OPEN) continue;
        const y = BASE + fl * FH;
        b.box(L + 0.02, 0.3, 0.12, tint(conc, 0.05), { at: [0, y, z + s * 0.06] });
        for (let i = 0; i < 8; i++) {
          const x = -L / 2 + (i + 0.5) * BAY;
          const loggia = f === '+z' && (i + fl) % 3 === 0;
          if (loggia) {
            b.panel(BAY - 0.9, FH - 0.5, dark, { at: [x, y + 0.3, z], facing: f, depth: 0.02 });
            b.window(1.6, 2.1, { at: [x - 0.3, y + 0.35, z], facing: f, frame, glass: P.windowDark, border: 0.06 });
            b.box(BAY - 0.9, 1.0, 0.1, tint(conc, 0.04), { at: [x, y + 0.3, z + s * 0.05] });
          } else {
            b.window(f === '+z' ? 1.8 : 2.4, 1.25, { at: [x, y + 0.95, z], facing: f, frame, glass: P.windowDark, bars: [2, 1], border: 0.06 });
          }
          b.panel(0.06, FH - 0.3, tint(conc, -0.08), { at: [x - BAY / 2, y + 0.3, z], facing: f, depth: 0.02 });
        }
      }
    }
    // roof parapet and plant
    b.box(L, 1.2, D, tint(conc, 0.02), { at: [0, TOP, ZC] });
    b.box(L, 0.15, D + 0.3, tint(conc, 0.06), { at: [0, TOP + 1.2, ZC] });
    b.box(4.0, 1.6, 3.0, dark, { at: [-7.0, TOP + 1.35, ZC - 1.0] });

    // stair and lift towers standing out from both faces
    for (const [z, s] of [
      [ZF, 1],
      [ZB, -1],
    ] as const) {
      const tx = s > 0 ? 3.25 : -6.5;
      const tz = z + s * 1.2;
      b.box(3.6, TOP + 2.2, 2.4, tint(conc, 0.03), { at: [tx, 0, tz] });
      for (let fl = 0; fl < NF + 1; fl++) {
        b.window(0.5, 2.2, { at: [tx - 0.9, 0.6 + fl * FH, tz + s * 1.2], facing: s > 0 ? '+z' : '-z', frame: conc, glass: P.windowDark, border: 0.05 });
        b.window(0.5, 2.2, { at: [tx + 0.9, 0.6 + fl * FH, tz + s * 1.2], facing: s > 0 ? '+z' : '-z', frame: conc, glass: P.windowDark, border: 0.05 });
      }
      b.box(4.0, 0.2, 2.6, dark, { at: [tx, TOP + 2.2, tz] });
    }
    // the cut end: a blank end wall with a vertical joint
    for (const s of [-1, 1]) b.box(0.12, TOP, 0.3, dark, { at: [(s * L) / 2, 0, ZC], jitter: false });
    // street furniture: lamps and a bench, a few cars behind
    for (const x of [-8, 8]) {
      b.cyl(0.06, 4.5, P.steel, { at: [x, 0, 7.4], segs: 6 });
      b.box(0.8, 0.15, 0.3, P.steel, { at: [x + 0.3, 4.5, 7.4] });
    }
    for (const [x, c] of [
      [-10, P.cladRed],
      [-6, P.cladWhite],
      [2, P.cladBlue],
      [6, P.cladYellow],
    ] as const) {
      b.box(1.5, 0.6, 3.4, c, { at: [x, 0.2, -6.6] });
      b.box(1.3, 0.5, 1.8, tint(c, -0.05), { at: [x, 0.8, -6.8] });
      for (const [wx, wz] of [
        [-0.75, 1.1],
        [0.75, 1.1],
        [-0.75, -1.1],
        [0.75, -1.1],
      ]) b.log(0.28, 0.18, P.black, { at: [x + wx, 0, -6.6 + wz], segs: 8 });
    }
    b.collider(L, D, { at: [0, 0, ZC] });
    b.collider(3.6, 2.4, { at: [3.25, 0, ZF + 1.2] });
    b.collider(3.6, 2.4, { at: [-6.5, 0, ZB - 1.2] });
  },
};
