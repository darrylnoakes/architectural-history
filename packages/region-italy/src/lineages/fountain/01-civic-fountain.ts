import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

const NL = 25; // sides of the lower basin
const NU = 12; // sides of the upper basin
const STEP = 0.24;
const NSTEP = 3;
const B0 = STEP * NSTEP; // floor of the lower basin
const RL = 4.5; // lower basin radius (to the corners)
const HL = 1.55; // lower basin wall height
const RU = 2.4;
const U0 = B0 + 2.5; // base of the upper basin
const HU = 1.1;

/** Polygonal tub: a lathe of `segs` sides, outer radius r, wall height h, wall thickness t. */
function tub(b: Builder, r: number, h: number, t: number, color: number, y: number, segs: number): void {
  b.lathe(
    [
      [r * 0.92, 0],
      [r, 0.12],
      [r, h],
      [r + 0.08, h],
      [r + 0.08, h + 0.12],
      [r - t, h + 0.12],
      [r - t, 0.3],
      [0.001, 0.3],
    ],
    color,
    { at: [0, y, 0], segs },
  );
}

export const civicFountain: BuildingDef = {
  id: 'civic-fountain',
  name: 'Civic fountain',
  style: 'Gothic',
  date: '1275 to 1278',
  summary:
    'When the commune at last brought fresh water into the town by a new aqueduct, it celebrated with a fountain in the main square, between the cathedral and the town hall. ' +
    'Two many-sided marble basins stand one above the other on a flight of steps, topped by a bronze bowl. The lower basin is carved with fifty relief panels, a stone encyclopaedia of the labours of the months, the liberal arts, scenes from the Bible, fables and the legends of the town’s founding; statuettes of saints and heroes stand round the upper basin. ' +
    'It was the work of the best sculptors of the day, and it said that this commune was rich, learned and well governed.',
  materials: ['white and pink marble', 'bronze', 'lead pipes'],
  modelledOn: 'The Fontana Maggiore, Perugia (designed by Fra Bevignate, sculpture by Nicola and Giovanni Pisano, the bronze bowl and nymphs cast by Rosso Padellaio, 1275 to 1278)',
  lookFor: [
    { label: 'Twenty-five-sided lower basin', note: 'Each of its sides carries two carved panels, divided by little twisted columns.', at: [0, B0 + HL + 0.5, RL + 0.3] },
    { label: 'Relief panels', note: 'Fifty carved scenes: the work of each month, the liberal arts, Adam and Eve, Romulus and Remus, Aesop’s fables.', at: [2.0, B0 + 0.8, RL * 0.95] },
    { label: 'Upper basin with statuettes', note: 'A twelve-sided basin with carved figures round it (at Perugia twenty-four, at the angles and in the middle of each side): saints, prophets and the patrons of the town.', at: [RU + 0.3, U0 + HU + 0.6, 0] },
    { label: 'Bronze bowl and nymphs', note: 'At the top three bronze women stand back to back in a bronze basin, the water rising from the jar they hold up.', at: [0, U0 + HU + 3.2, 0.6] },
    { label: 'Steps', note: 'The fountain stands on a ring of steps, raising it above the slope of the square and inviting people to sit.', at: [0, STEP * 2, 5.4] },
  ],
  build(b) {
    const white = P.marble;
    const pink = mix(P.marble, P.marbleRed, 0.35);
    const relief = tint(P.marble, -0.12);
    const bronze = P.bronze;
    const water = P.water;
    const spray = mix(P.water, P.white, 0.55);
    const W = { mat: 'glass' as const };

    // ---------------------------------------------------------------- the steps
    for (let i = 0; i < NSTEP; i++) {
      const r = 5.75 - i * 0.42;
      b.cyl(r, STEP, i % 2 ? pink : white, { at: [0, i * STEP, 0], segs: NL, rotY: Math.PI / NL });
    }

    // ---------------------------------------------------------------- the lower basin
    tub(b, RL, HL, 0.32, white, B0, NL);
    b.cyl(RL - 0.33, 0.04, water, { at: [0, B0 + HL - 0.15, 0], segs: NL, ...W });
    const apo = RL * Math.cos(Math.PI / NL);
    const side = 2 * RL * Math.sin(Math.PI / NL);
    for (let i = 0; i < NL; i++) {
      const a = ((i + 0.5) / NL) * Math.PI * 2;
      const at = (r: number, y: number, along = 0): [number, number, number] => [
        Math.sin(a) * r + Math.cos(a) * along,
        y,
        Math.cos(a) * r - Math.sin(a) * along,
      ];
      // two carved panels on each side, with a pink band above and below
      for (const k of [-1, 1]) {
        b.panel(side * 0.38, HL - 0.55, relief, { at: at(apo, B0 + 0.32, k * side * 0.24), facing: a, depth: 0.03 });
        // a figure in each relief, suggested by a raised block
        b.panel(side * 0.12, (HL - 0.55) * 0.62, tint(relief, 0.08), { at: at(apo + 0.03, B0 + 0.4, k * side * 0.24 + (i % 2 ? 0.06 : -0.06)), facing: a, depth: 0.05 });
      }
      b.panel(side, 0.12, pink, { at: at(apo, B0 + 0.16, 0), facing: a, depth: 0.04 });
      b.panel(side, 0.14, pink, { at: at(apo, B0 + HL - 0.22, 0), facing: a, depth: 0.04 });
      // the colonnettes: one between the pair, a cluster at each angle
      b.cyl(0.045, HL - 0.5, white, { at: at(apo + 0.05, B0 + 0.3, 0), segs: 4 });
      const c = (i / NL) * Math.PI * 2;
      b.cyl(0.07, HL - 0.5, pink, { at: [Math.sin(c) * (RL + 0.02), B0 + 0.3, Math.cos(c) * (RL + 0.02)], segs: 5 });
    }

    // ---------------------------------------------------------------- the cluster of columns carrying the upper basin
    b.cyl(0.55, U0 - B0, white, { at: [0, B0, 0], segs: 8 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.column(0.13, U0 - B0 - 0.3, pink, { at: [Math.sin(a) * 0.85, B0 + 0.3, Math.cos(a) * 0.85], order: 'plain', segs: 5 });
    }
    b.cyl(1.1, 0.25, white, { at: [0, U0 - 0.25, 0], segs: NU, rTop: 1.4 });

    // ---------------------------------------------------------------- the upper basin
    tub(b, RU, HU, 0.22, pink, U0, NU);
    b.cyl(RU - 0.23, 0.04, water, { at: [0, U0 + HU - 0.12, 0], segs: NU, ...W });
    const apoU = RU * Math.cos(Math.PI / NU);
    const sideU = 2 * RU * Math.sin(Math.PI / NU);
    for (let i = 0; i < NU; i++) {
      const a = ((i + 0.5) / NU) * Math.PI * 2;
      b.panel(sideU * 0.7, HU - 0.35, tint(pink, 0.06), { at: [Math.sin(a) * apoU, U0 + 0.22, Math.cos(a) * apoU], facing: a, depth: 0.03 });
      // a statuette at each angle
      const c = (i / NU) * Math.PI * 2;
      const fx = Math.sin(c) * (RU + 0.05);
      const fz = Math.cos(c) * (RU + 0.05);
      b.cyl(0.1, 0.7, white, { at: [fx, U0 + 0.15, fz], segs: 5, rTop: 0.08 });
      b.sphere(0.08, white, { at: [fx, U0 + 0.93, fz], segs: 5 });
      // spouts: water falls from the upper basin into the lower one
      if (i % 3 === 0) {
        const sx = Math.sin(a) * (apoU + 0.1);
        const sz = Math.cos(a) * (apoU + 0.1);
        b.blob(0.1, bronze, { at: [sx, U0 + HU - 0.3, sz] });
        b.beam([sx, U0 + HU - 0.35, sz], [Math.sin(a) * (apoU + 0.9), B0 + HL - 0.12, Math.cos(a) * (apoU + 0.9)], 0.07, 0.07, spray, W);
      }
    }

    // ---------------------------------------------------------------- the bronze bowl and the three nymphs
    const T0 = U0 + HU;
    b.cyl(0.18, 0.9, bronze, { at: [0, U0 + 0.3, 0], segs: 6 });
    b.cyl(0.14, 0.4, bronze, { at: [0, T0, 0], segs: 6 });
    b.lathe([[0.15, 0], [0.7, 0.25], [1.05, 0.55], [1.0, 0.6], [0.001, 0.4]], bronze, { at: [0, T0 + 0.4, 0], segs: 10 });
    b.cyl(0.95, 0.03, water, { at: [0, T0 + 0.88, 0], segs: 10, ...W });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const x = Math.sin(a) * 0.28;
      const z = Math.cos(a) * 0.28;
      b.cyl(0.14, 1.0, bronze, { at: [x, T0 + 0.85, z], segs: 5, rTop: 0.09 });
      b.sphere(0.1, bronze, { at: [x, T0 + 1.95, z], segs: 5 });
      b.beam([x, T0 + 1.7, z], [x * 0.3, T0 + 2.15, z * 0.3], 0.05, 0.05, bronze); // arms raised
    }
    // the jar they hold up, and the jet with its falling water
    b.lathe([[0.1, 0], [0.22, 0.15], [0.18, 0.35], [0.08, 0.45]], bronze, { at: [0, T0 + 2.15, 0], segs: 6 });
    b.cyl(0.06, 0.6, spray, { at: [0, T0 + 2.55, 0], segs: 5, ...W });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const mid: [number, number, number] = [Math.sin(a) * 0.45, T0 + 3.2, Math.cos(a) * 0.45];
      b.beam([0, T0 + 3.1, 0], mid, 0.05, 0.05, spray, W);
      b.beam(mid, [Math.sin(a) * 0.85, T0 + 0.95, Math.cos(a) * 0.85], 0.05, 0.05, spray, W);
    }

    // ---------------------------------------------------------------- solid
    b.collider(11.4, 11.4);
  },
};
