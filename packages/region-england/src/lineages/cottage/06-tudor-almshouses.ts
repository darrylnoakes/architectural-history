import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bar } from './shared';

const WALL = 3.1;
const D = 5.6;
const ZF = 1.6; // front wall
const UNIT = 3.0;
const MID = 4.2; // central gabled bay

/** Tall brick stack: square base through the roof, then clustered octagonal shafts with spreading caps. */
function stack(b: Builder, x: number, z: number, y0: number, h: number, shafts: number, brick: number): void {
  const bw = 0.62 * shafts + 0.25;
  b.box(bw, h * 0.45, 0.85, brick, { at: [x, y0, z] });
  b.box(bw + 0.14, 0.12, 0.99, tint(brick, 0.05), { at: [x, y0 + h * 0.45, z] });
  for (let i = 0; i < shafts; i++) {
    const sx = x - (0.62 * (shafts - 1)) / 2 + i * 0.62;
    b.cyl(0.3, 0.15, brick, { at: [sx, y0 + h * 0.45 + 0.12, z], segs: 8 });
    b.cyl(0.26, h * 0.5, brick, { at: [sx, y0 + h * 0.45 + 0.27, z], segs: 8 });
    b.cyl(0.26, 0.22, brick, { at: [sx, y0 + h * 0.95 + 0.27, z], rTop: 0.34, segs: 8 });
    b.cyl(0.34, 0.1, tint(brick, 0.05), { at: [sx, y0 + h * 0.95 + 0.49, z], segs: 8 });
  }
}

/** Two- or three-light stone mullioned window with a hood mould over it. */
function mullioned(b: Builder, x: number, y: number, z: number, lights: number, facing: '+z' | '-z', stone: number): void {
  const w = lights * 0.5 + 0.2;
  b.window(w, 1.05, { at: [x, y, z], facing, frame: stone, glass: P.windowDark, bars: [lights, 2], border: 0.1 });
  const s = facing === '+z' ? 1 : -1;
  b.box(w + 0.3, 0.1, 0.16, stone, { at: [x, y + 1.08, z + s * 0.06] });
  b.sym((k) => b.box(0.1, 0.25, 0.16, stone, { at: [x + k * (w / 2 + 0.1), y + 0.88, z + s * 0.06] }));
}

export const tudorAlmshouses: BuildingDef = {
  id: 'tudor-almshouses',
  name: 'Almshouses',
  style: 'Late Tudor and Jacobean',
  date: 'c. 1600',
  summary:
    'A local merchant left money in his will to house six poor elderly people of the parish, each with a room, a fireplace and a small allowance, in return for good conduct and regular attendance at church. ' +
    'The row is built in brick, now the fashionable material, with stone dressings: mullioned windows, hood moulds and a central gable bearing the founder’s arms. ' +
    'The great change from the medieval row is the chimney: every room has its own fireplace, and the stacks are made tall and decorative to show it.',
  materials: ['red brick', 'limestone dressings', 'clay plain tile'],
  lookFor: [
    { label: 'Clustered chimney stacks', note: 'Groups of tall octagonal brick shafts with moulded caps: a fireplace for every lodging, and a display of the bricklayer’s skill.', at: [5.1, 8.4, -1.6] },
    { label: 'Founder’s plaque', note: 'A carved stone panel in the central gable with the benefactor’s arms and the date, so no one forgot whose charity this was.', at: [0, 4.4, 2.65] },
    { label: 'Mullioned windows with hood moulds', note: 'Stone uprights divide each window into lights; the projecting hood mould above throws rainwater clear.', at: [-7.15, 1.6, 1.75] },
    { label: 'A door for each almsperson', note: 'Each resident had their own front door and room, opening off the shared garden.', at: [-8.85, 1.1, 1.75] },
    { label: 'Coped gable', note: 'The end walls rise above the roof and are capped with stone coping, which protects the top of the wall and the edge of the tiles.', at: [11.1, 5.0, -1.2] },
  ],
  influences: ['flemish-brick'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), P.brickOrange, tint(P.brickDark, 0.06)]);
    const stone = b.pick([P.limestone, P.bathStone, P.limestoneWarm]);
    const tile = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.06)]);
    const per = 3; // lodgings each side of the centre
    const L = MID + per * 2 * UNIT;
    const zc = ZF - D / 2;
    const rh = (D / 2) * Math.tan((50 * Math.PI) / 180);

    // plinth, walls, roof
    b.box(L + 0.2, 0.4, D + 0.2, stone, { at: [0, 0, zc] });
    b.box(L, WALL, D, brick, { at: [0, 0, zc] });
    b.box(L + 0.12, 0.12, D + 0.12, stone, { at: [0, WALL - 0.12, zc] }); // eaves band
    b.gable(L - 0.3, D, rh, tile, { at: [0, WALL, zc], overhang: 0.25, wall: brick });
    // coped parapet gables at the ends
    b.sym((s) => {
      const x = s * (L / 2 - 0.15);
      b.extrude([[-D / 2 - 0.1, 0], [D / 2 + 0.1, 0], [0, rh + 0.35]], 0.3, brick, { at: [x, WALL, zc], rotY: Math.PI / 2 });
      const vt = 0.2;
      bar(b, [x, WALL + vt, zc - D / 2 - 0.15], [x, WALL + rh + 0.4, zc], 0.36, stone);
      bar(b, [x, WALL + vt, zc + D / 2 + 0.15], [x, WALL + rh + 0.4, zc], 0.36, stone);
      b.box(0.42, 0.5, 0.42, stone, { at: [x, WALL - 0.1, zc + D / 2 + 0.05] });
      b.box(0.42, 0.5, 0.42, stone, { at: [x, WALL - 0.1, zc - D / 2 - 0.05] });
      b.cone(0.18, 0.5, stone, { at: [x, WALL + rh + 0.45, zc], segs: 4 });
    });

    // central gabled bay projecting forward, with arched entry to the garden behind and plaque
    const pz = ZF + 0.9;
    const bayD = D + 0.9;
    const bzc = pz - bayD / 2;
    b.box(MID + 0.2, 0.4, 1.1, stone, { at: [0, 0, pz - 0.45] });
    b.box(MID, WALL, bayD, brick, { at: [0, 0, bzc] });
    b.box(MID + 0.12, 0.12, bayD + 0.12, stone, { at: [0, WALL - 0.12, bzc] });
    b.extrude([[-MID / 2, 0], [MID / 2, 0], [0, rh + 0.35]], 0.3, brick, { at: [0, WALL, pz - 0.15] });
    b.gable(MID - 0.3, pz - zc, rh, tile, { at: [0, WALL, (pz + zc) / 2 - 0.15], ridge: 'z', overhang: 0.1, wall: brick });
    bar(b, [-MID / 2 - 0.1, WALL + 0.2, pz - 0.15], [0, WALL + rh + 0.4, pz - 0.15], 0.36, stone);
    bar(b, [MID / 2 + 0.1, WALL + 0.2, pz - 0.15], [0, WALL + rh + 0.4, pz - 0.15], 0.36, stone);
    b.cone(0.2, 0.6, stone, { at: [0, WALL + rh + 0.45, pz - 0.15], segs: 4 });
    // arched doorway with stone surround
    b.panel(1.9, 2.75, stone, { at: [0, 0.4, pz], facing: '+z', shape: 'segmental', depth: 0.08 });
    b.panel(1.4, 2.45, P.oakDark, { at: [0, 0.4, pz], facing: '+z', shape: 'segmental', depth: 0.11 });
    // plaque: stone panel, shield of arms, date line
    b.panel(1.7, 1.15, stone, { at: [0, WALL + 0.7, pz], facing: '+z', depth: 0.1 });
    b.panel(0.55, 0.62, P.doorBlue, { at: [0, WALL + 0.95, pz + 0.04], facing: '+z', shape: 'round', depth: 0.1 });
    b.panel(0.32, 0.18, P.gold, { at: [0, WALL + 1.17, pz + 0.07], facing: '+z', depth: 0.1 });
    b.panel(1.3, 0.08, P.timberBlack, { at: [0, WALL + 0.8, pz + 0.04], facing: '+z', depth: 0.1 });

    // lodgings: a door with a stone surround and a mullioned window each, front and back
    for (const s of [-1, 1] as const) {
      for (let i = 0; i < per; i++) {
        const x = s * (MID / 2 + UNIT * (i + 0.5));
        const doorX = x - s * 0.75;
        b.panel(1.1, 2.15, stone, { at: [doorX, 0.4, ZF], facing: '+z', shape: 'segmental', depth: 0.06 });
        b.panel(0.85, 1.95, b.pick([P.oakDark, P.oak, P.doorGreen]), { at: [doorX, 0.4, ZF], facing: '+z', shape: 'segmental', depth: 0.09 });
        mullioned(b, x + s * 0.55, 1.1, ZF, 2, '+z', stone);
        mullioned(b, x, 1.1, ZF - D, 2, '-z', stone);
      }
      // chimneys: one stack per pair of lodgings, one in the end gable for the last
      stack(b, s * (MID / 2 + UNIT), zc - 0.4, WALL + rh * 0.55, 3.8, 2, brick);
      stack(b, s * (L / 2 - 0.6), zc, WALL + rh * 0.5, 3.4, 1, brick);
      // back doors to the gardens
      b.panel(0.85, 1.95, P.oakDark, { at: [s * (MID / 2 + UNIT * 1.5 + 0.9), 0.4, ZF - D], facing: '-z', shape: 'segmental', depth: 0.08 });
    }

    // forecourt: low brick wall with gate piers and a path, small lawns
    const fz = 6.6;
    b.sym((s) => {
      b.box(L / 2 - 1.1, 0.8, 0.35, brick, { at: [s * ((L / 2 - 1.1) / 2 + 1.1), 0, fz] });
      b.box(L / 2 - 1.1 + 0.1, 0.1, 0.45, stone, { at: [s * ((L / 2 - 1.1) / 2 + 1.1), 0.8, fz] });
      b.box(0.55, 1.4, 0.55, brick, { at: [s * 1.1, 0, fz] });
      b.sphere(0.24, stone, { at: [s * 1.1, 1.62, fz], segs: 6 });
      b.box(0.6, 0.08, 0.6, stone, { at: [s * 1.1, 1.4, fz] });
      b.box(L / 2 - 1.3, 0.05, fz - ZF - 1.4, P.grass, { at: [s * ((L / 2 - 1.3) / 2 + 1.3), 0, (fz + ZF) / 2 + 0.4] });
    });
    b.box(1.8, 0.05, fz - pz, P.gravel, { at: [0, 0, (fz + pz) / 2] });
    b.box(L, 0.05, 1.1, P.gravel, { at: [0, 0, ZF + 0.55] });
    // rear garden wall
    b.box(L, 1.6, 0.3, brick, { at: [0, 0, -6.6] });
    b.box(0.3, 1.6, 6.6 + ZF - D, brick, { at: [-L / 2 + 0.15, 0, (-6.6 + ZF - D) / 2] });
    b.box(0.3, 1.6, 6.6 + ZF - D, brick, { at: [L / 2 - 0.15, 0, (-6.6 + ZF - D) / 2] });
  },
};
