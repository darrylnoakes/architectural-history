import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, archPanel, clock, nineties, platform, quad, soup, track, forecourt } from './shared';

const ZF = 5.2; // street front
const ZB = -3.0; // platform side
const D = ZF - ZB;
const ZC = (ZF + ZB) / 2;
// the hall and its great arch
const HW = 8.4; // half-width of the hall front, piers included
const AW = 11.0; // span of the arch
const AH = 13.0; // its height to the crown
const FH = 15.0; // height of the front wall
const PH = 17.2; // the piers either side of the arch rise to here
// the wings
const WX = 16.4;
const WH = 9.0;
const PX = 19.6; // end pavilions to here
// the train shed
const SZ0 = -3.4;
const SZ1 = -11.75;
const SE = 6.2; // eaves of the shed
const SC = 12.6; // crown
const N = 10;

/** A point on the shed's arched profile, i = 0 (platform side) .. N. */
function shed(i: number): [number, number] {
  const t = i / N;
  const z = SZ0 + (SZ1 - SZ0) * t;
  const y = SE + (SC - SE) * Math.sin(Math.PI * t);
  return [z, y];
}

/** A sculpted figure, much simplified: a draped body on a block, an arm raised or a head bowed. */
function figure(b: Builder, x: number, y: number, z: number, stone: number, reclining: boolean, turn = 0): void {
  b.group({ at: [x, y, z], rotY: turn }, () => {
    if (reclining) {
      b.blob(0.55, stone, { at: [0, 0.5, 0], stretch: [2.2, 0.8, 0.9], detail: 0 });
      b.sphere(0.28, stone, { at: [0.95, 1.05, 0], segs: 6 });
      b.beam([0.6, 0.6, 0.1], [1.0, 1.3, 0.2], 0.18, 0.18, stone);
    } else {
      b.box(1.0, 0.4, 1.0, stone);
      b.cyl(0.45, 1.8, stone, { at: [0, 0.4, 0], rTop: 0.3, segs: 7 });
      b.sphere(0.27, stone, { at: [0, 2.45, 0], segs: 6 });
      b.beam([0.25, 1.9, 0], [0.55, 2.9, 0.1], 0.16, 0.16, stone);
    }
  });
}

export const grandeGare: BuildingDef = {
  id: 'grande-gare',
  name: 'Grande gare',
  style: 'Beaux-Arts, with an iron and glass shed',
  date: 'c. 1893',
  summary:
    'By the 1890s the railway was the town’s front door, and the companies rebuilt their stations to say so. The new front is a screen of fine limestone in the manner taught at the École des Beaux-Arts: a great glazed arch lighting the booking hall, held between two massive piers crowned with statues, and over it the clock between reclining figures. ' +
    'Behind the stone lies the engineering: a train shed of iron arches and glass spanning the platform and both tracks, wide and high enough for the smoke of many engines to clear. ' +
    'The two halves, an architect’s front and an engineer’s shed, were often designed by different men and rarely spoke the same language.',
  materials: ['limestone', 'slate', 'zinc', 'wrought-iron arched ribs', 'glass'],
  modelledOn: 'The station of Tours (Victor Laloux, 1895 to 1898), much reduced and simplified: Tours has two great arches, one for each of its sheds, and statues of the cities its trains served on its piers',
  influences: ['iron-and-rail'],
  lookFor: [
    { label: 'Great glazed arch', note: 'One huge arch filled with glass lights the booking hall and announces the station from the end of the avenue.', at: [0, 7.0, ZF + 0.4] },
    { label: 'Clock between figures', note: 'The clock sits at the top of the front, flanked by reclining sculpted figures.', at: [0, FH + 1.2, ZF + 0.5] },
    { label: 'Statues on the piers', note: 'Allegorical figures crown the two great piers; at Tours they stand for the cities the line served.', at: [-(HW - 1.1), PH + 1.6, ZF - 0.6] },
    { label: 'Iron and glass shed', note: 'Arched iron ribs on columns carry a roof glazed along its crown, wide enough to cover the platform and both tracks.', at: [8.0, SC + 0.3, (SZ0 + SZ1) / 2] },
    { label: 'Express engine', note: 'A four-coupled express locomotive of the 1890s with bogie coaches.', at: [-12.0, 3.6, TRACKS[0] + 1.6] },
  ],
  build(b) {
    const stone = tint(P.pierreBlonde, b.range(-0.02, 0.02));
    const dress = mix(P.pierreBlonde, P.craie, 0.55);
    const slate = P.ardoise;
    const iron = mix(P.castIron, P.voletVert, 0.3);
    const glass = mix(P.glass, P.white, 0.2);

    // forecourt
    forecourt(b, mix(P.paving, P.gravel, 0.3));

    // ------------------------------------------------ the hall: the arched front, side walls, a glazed roof
    b.archWall(HW * 2, FH, 1.0, stone, { at: [0, 0, ZF - 0.5], facing: '+z', openings: 1, openW: AW, openH: AH, shape: 'round' });
    // the glazing of the arch: one pane in the arch outline, mullions and transoms over it
    archPanel(b, AW, AH, glass, { at: [0, 0, ZF - 0.7], facing: '+z', depth: 0.04, mat: 'glass', n: 10 });
    for (let k = -4; k <= 4; k++) {
      const x = (k * AW) / 10;
      const a = AW / 2;
      const h = AH - a + Math.sqrt(Math.max(0, a * a - x * x));
      b.box(0.14, h, 0.14, iron, { at: [x, 0, ZF - 0.62] });
    }
    for (const y of [3.2, 6.4, 8.5]) b.box(AW, 0.14, 0.14, iron, { at: [0, y, ZF - 0.62] });
    // doors at the foot of the arch
    for (const x of [-3.3, 0, 3.3]) b.panel(2.2, 2.9, P.doorGreen, { at: [x, 0, ZF - 0.6], facing: '+z', depth: 0.08 });
    // archivolt and keystone
    b.archWall(AW + 1.2, AH + 0.6, 0.12, dress, { at: [0, 0, ZF + 0.06], facing: '+z', openings: 1, openW: AW, openH: AH, shape: 'round' });
    b.box(1.0, 1.3, 0.4, dress, { at: [0, AH - 0.6, ZF] });
    // the piers, rising above the front, with the statues
    b.sym((s) => {
      const x = s * (HW - 1.1);
      b.box(2.2, PH, 2.0, stone, { at: [x, 0, ZF - 0.6] });
      b.box(2.5, 0.6, 2.3, dress, { at: [x, 0, ZF - 0.6] });
      b.box(2.6, 0.5, 2.4, dress, { at: [x, PH - 0.5, ZF - 0.6] });
      for (const y of [1.5, 3.0, 4.5]) b.panel(2.2, 0.06, tint(stone, -0.12), { at: [x, y, ZF + 0.4], facing: '+z', depth: 0.02 });
      archPanel(b, 0.9, 2.6, tint(stone, -0.18), { at: [x, 9.0, ZF + 0.4], facing: '+z', depth: 0.03 }); // a niche
      figure(b, x, PH, ZF - 0.6, dress, false, s * 0.3);
    });
    // the attic over the arch with the clock between reclining figures
    b.box(HW * 2 - 4.4, 0.4, 1.4, dress, { at: [0, FH, ZF - 0.5] });
    b.box(4.2, 2.6, 1.0, stone, { at: [0, FH, ZF - 0.5] });
    b.extrude([[-2.5, 0], [2.5, 0], [0, 1.0]], 1.2, dress, { at: [0, FH + 2.6, ZF - 0.5] });
    clock(b, 1.8, [0, FH + 0.4, ZF + 0.02], { rim: P.gold });
    figure(b, -3.2, FH + 0.4, ZF - 0.3, dress, true, Math.PI);
    figure(b, 3.2, FH + 0.4, ZF - 0.3, dress, true, 0);
    // hall side walls and its roof: a glazed barrel vault running back to the shed
    b.sym((s) => b.box(1.0, FH - 1.5, D - 1.0, stone, { at: [s * (HW - 2.6), 0, ZC - 0.5] }));
    b.vault(HW * 2 - 4.2, D - 0.8, mix(P.zincParis, P.glass, 0.4), { at: [0, FH - 1.5, ZC - 0.6], axis: 'z', squash: 0.45, mat: 'glass' });
    b.box(HW * 2 - 4.2, 0.12, D - 1.0, tint(P.pierreBlonde, -0.25), { at: [0, FH - 1.6, ZC - 0.6] });

    // ------------------------------------------------ the wings and end pavilions
    b.sym((s) => {
      const x0 = HW - 0.2;
      const L = WX - x0;
      const xc = s * (x0 + L / 2);
      const d = D - 1.0;
      b.box(L, WH, d, stone, { at: [xc, 0, ZC] });
      b.box(L + 0.1, 0.4, d + 0.2, dress, { at: [xc, 4.6, ZC] });
      b.box(L + 0.2, 0.45, d + 0.4, dress, { at: [xc, WH - 0.45, ZC] });
      // a balustrade on the cornice, a low zinc roof behind it
      b.box(L, 0.9, 0.3, dress, { at: [xc, WH, ZC + d / 2 + 0.05] });
      b.gable(L, d - 0.6, 1.3, P.zincParis, { at: [xc, WH, ZC] });
      for (const [z, f] of [[ZC + d / 2, '+z'], [ZC - d / 2, '-z']] as const) {
        for (let i = 0; i < 3; i++) {
          const x = s * (x0 + (i + 0.5) * (L / 3));
          archPanel(b, 1.7, 3.4, dress, { at: [x, 0.7, z], facing: f, depth: 0.04 });
          archPanel(b, 1.4, 3.2, f === '-z' && i === 0 ? P.doorGreen : P.windowDark, { at: [x, f === '-z' && i === 0 ? 0.05 : 0.8, z], facing: f, depth: 0.07 });
          b.window(1.2, 2.2, { at: [x, 5.6, z], facing: f, frame: dress, glass: P.windowDark, bars: [2, 3], border: 0.1 });
        }
      }
      b.collider(L, d, { at: [xc, 0, ZC] });
      // end pavilion with a tall slate roof
      const pw = PX - WX;
      const px = s * (WX + pw / 2);
      b.box(pw, WH + 1.2, D, stone, { at: [px, 0, ZC] });
      b.box(pw + 0.3, 0.5, D + 0.3, dress, { at: [px, WH + 0.7, ZC] });
      b.hip(pw + 0.3, D + 0.3, 3.6, slate, { at: [px, WH + 1.2, ZC], ridge: 2.0 });
      b.collider(pw, D, { at: [px, 0, ZC] });
      for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
        archPanel(b, 1.5, 3.4, P.windowDark, { at: [px, 0.8, z], facing: f, depth: 0.07 });
        b.window(1.3, 2.4, { at: [px, 5.6, z], facing: f, frame: dress, glass: P.windowDark, bars: [2, 3], border: 0.1 });
        b.panel(1.7, 0.3, dress, { at: [px, 8.2, z], facing: f, depth: 0.1 });
      }
      b.window(1.3, 2.4, { at: [s * PX, 5.6, ZC], facing: s > 0 ? '+x' : '-x', frame: dress, glass: P.windowDark, bars: [2, 3], border: 0.1 });
      b.collider(2.2, 2.0, { at: [s * (HW - 1.1), 0, ZF - 0.6] });
    });

    // ------------------------------------------------ platform, tracks, train
    platform(b, PLAT.back, PLAT.edge, -HX, HX);
    for (const z of TRACKS) track(b, z);
    nineties(b, [-19.0, 0, TRACKS[0]]);
    b.collider(38, 2.8, { at: [0, 0, TRACKS[0]] });

    // ------------------------------------------------ the train shed: arched ribs on columns, zinc and glass
    const X0 = -18.8;
    const X1 = 18.8;
    const ribs: number[] = [];
    for (let x = X0; x <= X1 + 0.01; x += 4.7) ribs.push(x);
    for (const x of ribs) {
      for (const z of [SZ0, SZ1]) {
        const y0 = z > PLAT.edge ? PLAT.y : 0;
        b.box(0.4, 0.5, 0.4, iron, { at: [x, y0, z] });
        b.cyl(0.13, SE - y0, iron, { at: [x, y0, z], segs: 6 });
      }
      for (let i = 0; i < N; i++) {
        const [z0, y0] = shed(i);
        const [z1, y1] = shed(i + 1);
        b.beam([x, y0, z0], [x, y1, z1], 0.14, 0.42, iron);
      }
      // a light tie across at the springing
      b.beam([x, SE, SZ0], [x, SE, SZ1], 0.05, 0.05, iron);
    }
    const zinc: number[] = [];
    const pane: number[] = [];
    for (let i = 0; i < N; i++) {
      const [z0, y0] = shed(i);
      const [z1, y1] = shed(i + 1);
      const target = i >= 2 && i <= 7 ? pane : zinc;
      quad(target, [X0 - 0.4, y0 + 0.22, z0], [X1 + 0.4, y0 + 0.22, z0], [X1 + 0.4, y1 + 0.22, z1], [X0 - 0.4, y1 + 0.22, z1]);
    }
    soup(b, zinc, P.zincParis);
    soup(b, pane, glass, { mat: 'glass' });
    for (let i = 1; i < N; i += 2) {
      const [z, y] = shed(i);
      b.box(X1 - X0 + 0.8, 0.1, 0.1, iron, { at: [0, y + 0.12, z], jitter: false });
    }
    // glazed end screens in the arch above the trains, with radiating bars
    for (const x of [X0 - 0.4, X1 + 0.4]) {
      const end: number[] = [];
      const ym = SE + 2.4;
      for (let i = 0; i < N; i++) {
        const [z0, y0] = shed(i);
        const [z1, y1] = shed(i + 1);
        end.push(x, ym, (SZ0 + SZ1) / 2, x, y0, z0, x, y1, z1);
      }
      soup(b, end, glass, { mat: 'glass' });
      b.box(0.14, 0.3, SZ0 - SZ1, iron, { at: [x, ym - 0.15, (SZ0 + SZ1) / 2] });
      for (let i = 0; i <= N; i += 2) {
        const [z, y] = shed(i);
        b.beam([x, ym, (SZ0 + SZ1) / 2], [x, y, z], 0.08, 0.08, iron);
      }
    }
    // platform furniture: a kiosk, benches, a water crane
    b.box(1.6, 2.4, 1.2, P.voletVert, { at: [9.0, PLAT.y, -4.6] });
    b.box(1.9, 0.12, 1.5, P.zincParis, { at: [9.0, PLAT.y + 2.4, -4.6] });
    b.box(2.0, 0.45, 0.5, P.oak, { at: [-4.0, PLAT.y, -4.2] });
    b.box(2.0, 0.45, 0.5, P.oak, { at: [13.6, PLAT.y, -4.2] });

    for (const x of [-12.5, 12.5]) {
      b.cyl(0.1, 4.2, P.castIron, { at: [x, 0, 10.6], segs: 6 });
      b.box(0.5, 0.6, 0.5, mix(P.glass, P.windowLit, 0.5), { at: [x, 4.2, 10.6] });
    }
  },
};
