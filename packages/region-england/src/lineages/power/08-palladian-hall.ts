import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { columns } from './shared';

type F = '+z' | '-z' | '+x' | '-x';

/** A Venetian (Serlian) window: a tall arched light between two lower square-headed ones. */
function venetian(b: Builder, at: [number, number, number], facing: F, stone: number) {
  const ang = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  b.group({ at, rotY: ang }, () => {
    b.panel(4.4, 0.25, stone, { at: [0, -0.25, 0], depth: 0.15 }); // sill
    b.window(1.5, 3.6, { shape: 'round', frame: P.white, bars: [3, 4], border: 0.1 });
    b.sym((s) => {
      b.window(0.9, 2.5, { at: [s * 1.55, 0, 0], frame: P.white, bars: [2, 3], border: 0.08 });
      b.panel(0.22, 2.5, stone, { at: [s * 0.95, 0, 0], depth: 0.12 }); // pilasters
      b.panel(0.22, 2.5, stone, { at: [s * 2.1, 0, 0], depth: 0.12 });
      b.panel(1.4, 0.22, stone, { at: [s * 1.55, 2.5, 0], depth: 0.14 }); // entablature over side lights
    });
    b.panel(1.9, 2.0, stone, { at: [0, 2.85, -0.01], shape: 'round', depth: 0.1 }); // archivolt
  });
}

/** A window with a small pediment over it; triangular or segmental alternate. */
function pedWindow(b: Builder, at: [number, number, number], facing: F, stone: number, seg: boolean) {
  const ang = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  b.group({ at, rotY: ang }, () => {
    b.panel(1.6, 3.0, stone, { at: [0, -0.1, 0], depth: 0.06 });
    b.window(1.3, 2.8, { frame: P.white, bars: [3, 4], border: 0.08 });
    b.panel(1.9, 0.18, stone, { at: [0, 3.0, 0], depth: 0.2 });
    if (seg) b.panel(1.9, 0.5, stone, { at: [0, 3.15, 0], shape: 'segmental', depth: 0.18 });
    else b.extrude([[-0.95, 0], [0.95, 0], [0, 0.55]], 0.25, stone, { at: [0, 3.17, 0.12] });
  });
}

export const palladianHall: BuildingDef = {
  id: 'palladian-hall',
  name: 'Shire hall',
  style: 'Palladian',
  date: 'c. 1735',
  summary:
    'The manor has been sold and pulled down, and the county gentry build a shire hall on its site for the assizes, the quarter sessions and the assembly balls. ' +
    'It follows the rules of Andrea Palladio as taught by Lord Burlington: a rusticated ground storey as a base, a giant portico with a pediment rising through the two main floors, windows set out by strict proportion and a low hipped roof hidden behind the cornice. ' +
    'Where the Elizabethans piled up gables and chimneys, everything here is symmetrical, measured and calm, and power is expressed as law and order rather than lineage.',
  materials: ['Bath stone ashlar', 'Welsh slate', 'painted sash windows', 'lead cupola'],
  lookFor: [
    { label: 'Giant portico and pediment', note: 'Ionic columns two storeys high carry a triangular pediment, the temple front that signals a public building.', at: [0, 17.6, 10.4] },
    { label: 'Rusticated base', note: 'The ground storey is cut into deep horizontal bands so it looks heavy and strong, a plinth for the floors above.', at: [-9, 2.4, 7.2] },
    { label: 'Venetian window', note: 'A tall arched window flanked by two lower square ones, a Palladian device used on the end walls.', at: [13.2, 8, -1] },
    { label: 'Hipped roof and cupola', note: 'A low roof sloping on all four sides, crowned by a lantern with a clock: the town looks to it for the time.', at: [0, 21.6, -1] },
    { label: 'Pedimented windows', note: 'The tall first-floor windows of the courtroom and assembly room wear small pediments, alternately triangular and curved.', at: [-9, 9.6, 7.2] },
  ],
  influences: ['palladianism'],
  build(b) {
    const stone = tint(P.bathStone, b.range(-0.03, 0.01));
    const dark = tint(stone, -0.08);
    const W = 26;
    const D = 16;
    const ZC = -1;
    const FZ = ZC + D / 2; // 7
    const G = 4.6; // rusticated ground storey
    const H = 13.4; // to the top of the cornice

    // ---------------------------------------------------------- main block
    b.box(W, G, D, tint(stone, -0.03), { at: [0, 0, ZC] });
    for (let y = 0.55; y < G - 0.3; y += 0.55) b.box(W + 0.06, 0.08, D + 0.06, dark, { at: [0, y, ZC], jitter: false });
    b.box(W + 0.3, 0.35, D + 0.3, stone, { at: [0, G - 0.1, ZC] }); // band course
    b.box(W - 0.2, H - G, D - 0.2, stone, { at: [0, G, ZC] });
    b.box(W + 0.6, 0.7, D + 0.6, stone, { at: [0, H - 0.7, ZC] }); // cornice
    b.box(W + 0.2, 0.2, D + 0.2, dark, { at: [0, H - 0.9, ZC] });
    b.hip(W - 0.4, D - 0.4, 4.2, P.slate, { at: [0, H, ZC], overhang: 0.2 });
    // chimneys at the ends of the roof
    b.sym((s) => b.chimney(1.0, 2.6, 2.4, stone, { at: [s * 9, H + 1.6, ZC] }));

    // cupola: octagonal drum with clock faces, lead dome, gilt ball
    b.group({ at: [0, H + 4.0, ZC] }, () => {
      b.box(3.4, 1.0, 3.4, stone);
      b.cyl(1.6, 2.6, P.white, { at: [0, 1, 0], segs: 8 });
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        b.panel(1.1, 1.1, P.white, { at: [Math.sin(a) * 1.48, 1.6, Math.cos(a) * 1.48], facing: a, shape: 'circle', depth: 0.1 });
        b.panel(0.7, 0.7, P.black, { at: [Math.sin(a) * 1.55, 1.8, Math.cos(a) * 1.55], facing: a, shape: 'circle', depth: 0.06 });
      }
      b.cyl(1.8, 0.3, stone, { at: [0, 3.6, 0], segs: 8 });
      b.dome(1.5, P.lead, { at: [0, 3.9, 0], segs: 8, squash: 1.1 });
      b.cyl(0.08, 1.0, P.iron, { at: [0, 5.4, 0], segs: 4 });
      b.sphere(0.25, P.gold, { at: [0, 6.4, 0], segs: 6 });
    });

    // ---------------------------------------------------------- front: portico on an arcaded podium
    const PW = 14.4;
    const PD = 3.4;
    const pz = FZ + PD / 2;
    b.archWall(PW, G, PD, tint(stone, -0.03), { at: [0, 0, pz], openings: 3, openW: 2.4, openH: 3.6, shape: 'round' });
    for (let y = 0.55; y < G - 0.3; y += 0.55) b.box(PW + 0.06, 0.08, PD + 0.06, dark, { at: [0, y, pz], jitter: false });
    b.box(PW + 0.3, 0.35, PD + 0.3, stone, { at: [0, G - 0.1, pz] });
    b.box(PW - 1, 0.04, PD - 0.4, P.paving, { at: [0, G + 0.25, pz], jitter: false });
    // doors seen through the arches
    for (const x of [-4.8, 0, 4.8]) b.panel(1.8, 3.2, P.doorGreen, { at: [x, 0, FZ], facing: '+z', shape: 'round' });
    // six Ionic columns rising through two storeys
    const colH = H - G - 1.5;
    columns(b, 6, 2.6, 0.45, colH, P.white, { at: [0, G + 0.25, FZ + PD - 0.6], order: 'ionic', segs: 10 });
    b.box(PW, 1.2, PD + 0.2, stone, { at: [0, G + 0.25 + colH, pz] }); // entablature
    b.box(PW + 0.3, 0.3, PD + 0.5, stone, { at: [0, H - 0.3, pz + 0.05] });
    // pediment with a raking cornice and a carved tympanum panel
    b.extrude([[-PW / 2, 0], [PW / 2, 0], [0, 2.8]], PD, stone, { at: [0, H, pz] });
    b.extrude([[-PW / 2 - 0.4, -0.05], [0, 3.05], [PW / 2 + 0.4, -0.05], [PW / 2, -0.05], [0, 2.7], [-PW / 2, -0.05]], PD + 0.3, P.slate, { at: [0, H + 0.05, pz] });
    b.panel(2.2, 1.0, P.white, { at: [0, H + 0.45, FZ + PD], facing: '+z', shape: 'circle', depth: 0.1 }); // royal arms
    b.hip(PW, PD + 0.2, 0.01, P.slate, { at: [0, H + 0.05, pz] });

    // windows on the front either side of the portico
    for (const s of [-1, 1]) {
      for (const [i, x] of [9, 11.6].entries()) {
        const fx = s * (x - (i ? 0 : 0.8));
        b.window(1.2, 2.4, { at: [fx, 1.1, FZ], facing: '+z', shape: 'round', frame: P.white, bars: [2, 3] });
        pedWindow(b, [fx, G + 1.1, FZ - 0.1], '+z', stone, i === 1);
        b.window(1.2, 1.4, { at: [fx, 10.6, FZ - 0.1], facing: '+z', frame: P.white, bars: [3, 2] });
      }
    }
    // the ends: a Venetian window to the courtroom, sashes either side
    b.sym((s) => {
      const f: F = s > 0 ? '+x' : '-x';
      const ex = (s * (W - 0.2)) / 2;
      venetian(b, [ex, G + 1.2, ZC], f, stone);
      for (const z of [ZC - 5, ZC + 5]) {
        b.window(1.2, 2.4, { at: [s * W / 2, 1.1, z], facing: f, shape: 'round', frame: P.white, bars: [2, 3] });
        pedWindow(b, [ex, G + 1.1, z], f, stone, false);
        b.window(1.2, 1.4, { at: [ex, 10.6, z], facing: f, frame: P.white, bars: [3, 2] });
      }
      b.window(1.2, 1.4, { at: [ex, 10.6, ZC], facing: f, frame: P.white, bars: [3, 2] });
    });
    // the back: plainer, seven bays
    for (const x of spread(7, -W / 2 + 1.5, W / 2 - 1.5)) {
      const bz = ZC - D / 2;
      b.window(1.2, 2.4, { at: [x, 1.1, bz], facing: '-z', shape: 'round', frame: P.white, bars: [2, 3] });
      b.window(1.3, 2.8, { at: [x, G + 1.1, bz + 0.1], facing: '-z', frame: P.white, bars: [3, 4] });
      b.window(1.2, 1.4, { at: [x, 10.6, bz + 0.1], facing: '-z', frame: P.white, bars: [3, 2] });
    }
    venetian(b, [0, G + 1.2, ZC - D / 2 + 0.1], '-z', stone);
    b.panel(1.6, 2.8, P.doorGreen, { at: [0, 0, ZC - D / 2], facing: '-z', shape: 'round' });

    // ---------------------------------------------------------- pavilions linked by screen walls
    b.sym((s) => {
      const px = s * 18.4;
      b.box(6, 7.4, 9, stone, { at: [px, 0, ZC + 1] });
      for (let y = 0.55; y < 3.6; y += 0.55) b.box(6.06, 0.08, 9.06, dark, { at: [px, y, ZC + 1], jitter: false });
      b.box(6.4, 0.5, 9.4, stone, { at: [px, 7.0, ZC + 1] });
      b.hip(6, 9, 2.4, P.slate, { at: [px, 7.5, ZC + 1] });
      b.window(1.2, 2.2, { at: [px, 0.9, ZC + 5.5], facing: '+z', shape: 'round', frame: P.white, bars: [2, 3] });
      b.window(1.2, 2.2, { at: [px, 4.2, ZC + 5.5], facing: '+z', frame: P.white, bars: [2, 3] });
      b.window(1.2, 2.2, { at: [px, 4.2, ZC - 3.5], facing: '-z', frame: P.white, bars: [2, 3] });
      b.window(1.2, 2.2, { at: [px + s * 3, 4.2, ZC + 1], facing: s > 0 ? '+x' : '-x', frame: P.white, bars: [2, 3] });
      // screen wall with a niche, linking pavilion to main block
      b.box(2.4, 4.6, 0.8, stone, { at: [s * 14.2, 0, ZC + 4] });
      b.box(2.6, 0.3, 1, stone, { at: [s * 14.2, 4.6, ZC + 4] });
      b.panel(0.9, 2.4, dark, { at: [s * 14.2, 1, ZC + 4.4], facing: '+z', shape: 'round' });
    });

    // ---------------------------------------------------------- forecourt and railings
    const fz = 19.4;
    b.box(W + 10, 0.05, fz - FZ - PD, mix(P.gravel, P.paving, 0.5), { at: [0, 0, (fz + FZ + PD) / 2], jitter: false });
    b.sym((s) => {
      b.box(15, 0.55, 0.4, stone, { at: [s * 10.6, 0, fz] });
      for (const x of spread(24, 3.6, 17.6)) b.box(0.05, 1.3, 0.05, P.castIron, { at: [s * x, 0.55, fz] });
      b.box(14.4, 0.06, 0.06, P.castIron, { at: [s * 10.6, 1.65, fz] });
      b.box(1, 2.6, 1, stone, { at: [s * 2.8, 0, fz] });
      b.sphere(0.4, stone, { at: [s * 2.8, 3.0, fz], segs: 6 });
      b.box(1.2, 0.2, 1.2, stone, { at: [s * 2.8, 2.6, fz] });
    });
    b.sym((s) => b.box(2.4, 1.8, 0.06, P.castIron, { at: [s * 1.2, 0.1, fz] }));

    // colliders: the solid blocks; the portico podium is walkable through its arches
    b.collider(W, D, { at: [0, 0, ZC] });
    b.sym((s) => {
      b.collider(6, 9, { at: [s * 18.4, 0, ZC + 1] });
      b.collider(2.4, 0.8, { at: [s * 14.2, 0, ZC + 4] });
      b.collider(2.2, PD, { at: [s * 6.1, 0, pz] });
      b.collider(15, 0.5, { at: [s * 10.6, 0, fz] });
    });
  },
};
