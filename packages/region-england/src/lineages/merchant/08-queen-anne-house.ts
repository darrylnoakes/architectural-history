import { P, linspace, tint, type BuildingDef } from '@ah/kit';
import { sash } from './shared';

export const queenAnneHouse: BuildingDef = {
  id: 'queen-anne-house',
  name: 'Queen Anne house',
  style: 'Queen Anne',
  date: 'c. 1705',
  summary:
    'The fashionable house is now a calm, symmetrical box of red brick on the Dutch model: seven equal bays, a hipped roof with dormers lighting the servants’ attics, and a deep wooden cornice at the eaves. ' +
    'The sliding sash window, developed in the 1670s and 1680s, has replaced the mullioned casement, and the windows line up in strict rows. ' +
    'Ornament is kept for the cornice, the corners and above all the front door, under a carved shell hood. Gables, jetties and visible timber have gone out of fashion.',
  materials: ['red brick', 'rubbed brick dressings', 'stone quoins', 'clay tile', 'painted timber'],
  lookFor: [
    { label: 'Hipped roof with dormers', note: 'The roof slopes down on all four sides; little gabled dormers light the attic rooms.', at: [0, 11.2, 7.6] },
    { label: 'Modillion cornice', note: 'A deep timber cornice carried on a row of small carved brackets called modillions.', at: [-5.5, 7.6, 11.7] },
    { label: 'Shell hood', note: 'A hood shaped like a half-dome scallop shell, on carved brackets, shelters the front door.', at: [0, 4.4, 11.9] },
    { label: 'Sash windows', note: 'Tall windows of two sliding halves, divided by wooden glazing bars into small panes, set in seven even bays.', at: [5.0, 5.4, 11.1] },
    { label: 'Tall chimney stacks', note: 'Massive panelled stacks rise from the roof, each serving several fireplaces.', at: [5.6, 14.8, 6.4] },
  ],
  influences: ['dutch-classicism'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.03), P.brickOrange]);
    const rubbed = tint(brick, 0.12);
    const stone = b.pick([P.portland, P.limestone]);
    const roof = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.05)]);
    const door = b.pick([P.doorGreen, P.doorBlack, P.oakDark]);
    const W = 17.5;
    const D = 10;
    const zc = 6.4;
    const zf = zc + D / 2; // 11.4
    const zb = zc - D / 2;
    const base = 0.6;
    const g = 3.6;
    const f = 3.4;
    const H = base + g + f; // 7.6

    // plinth, walls, band course
    b.box(W + 0.12, base, D + 0.12, tint(brick, -0.08), { at: [0, 0, zc] });
    b.box(W, H, D, brick, { at: [0, 0, zc] });
    b.box(W + 0.1, 0.2, D + 0.1, rubbed, { at: [0, base + g - 0.05, zc] });
    // stone quoins at the corners
    for (const sx of [-1, 1]) {
      for (const sz of [1]) {
        for (let i = 0; i < 14; i++) {
          const long = i % 2 === 0;
          const y = base + i * 0.5 + 0.03;
          b.box(long ? 0.7 : 0.4, 0.44, 0.06, stone, { at: [sx * (W / 2 - (long ? 0.35 : 0.2)), y, zc + sz * (D / 2 + 0.03)] });
          b.box(0.06, 0.44, long ? 0.4 : 0.7, stone, { at: [sx * (W / 2 + 0.03), y, zc + sz * (D / 2 - (long ? 0.2 : 0.35))] });
        }
      }
    }

    // modillion cornice on all four sides
    const cY = H - 0.1;
    b.box(W + 0.9, 0.32, D + 0.9, P.white, { at: [0, cY, zc] });
    b.box(W + 0.4, 0.16, D + 0.4, P.white, { at: [0, cY - 0.16, zc] });
    for (const x of linspace(Math.round(W / 0.75), -W / 2 + 0.1, W / 2 - 0.1)) {
      for (const sz of [1, -1]) b.box(0.12, 0.12, 0.3, P.white, { at: [x, cY - 0.12, zc + sz * (D / 2 + 0.28)] });
    }
    for (const z of linspace(Math.round(D / 0.75), zb + 0.1, zf - 0.1)) {
      for (const sx of [1, -1]) b.box(0.3, 0.12, 0.12, P.white, { at: [sx * (W / 2 + 0.28), cY - 0.12, z] });
    }

    // hipped roof with dormers
    const rY = cY + 0.32;
    const rh = 4.2;
    b.hip(W + 0.6, D + 0.6, rh, roof, { at: [0, rY, zc] });
    const ridgeHalf = (W - D) / 2;
    b.box(ridgeHalf * 2 + 0.2, 0.12, 0.25, tint(roof, -0.08), { at: [0, rY + rh - 0.02, zc] });
    const dormerXs = [-5, 0, 5];
    for (const sz of [1, -1]) {
      for (const x of dormerXs) {
        const dz = zc + sz * (D / 2 + 0.3 - 1.3); // dormer face
        const dd = 2.0;
        const dcz = dz - sz * dd / 2;
        b.box(1.2, 1.5, dd, P.white, { at: [x, rY + 0.95, dcz] });
        b.gable(1.2, dd, 0.55, roof, { at: [x, rY + 2.45, dcz], ridge: 'z', overhang: 0.12, wall: P.white });
        sash(b, [x, rY + 1.1, dz], sz > 0 ? '+z' : '-z', 0.8, 1.15, { bars: [2, 3] });
      }
    }
    // tall panelled chimney stacks rising through the roof near each end
    b.sym((s) => {
      const cx = s * 5.6;
      b.box(1.0, 5.6, 1.9, brick, { at: [cx, rY + 1.0, zc] });
      b.box(0.8, 2.8, 0.08, rubbed, { at: [cx, rY + 3.6, zc + 0.97] });
      b.box(1.25, 0.22, 2.15, rubbed, { at: [cx, rY + 6.4, zc] });
      b.box(1.1, 0.15, 2.0, brick, { at: [cx, rY + 6.62, zc] });
    });

    // ---- seven bays of sash windows, with gauged brick flat arches
    const xs = linspace(7, -W / 2 + 1.25, W / 2 - 1.25);
    for (const [z, facing] of [[zf, '+z'], [zb, '-z']] as const) {
      for (let i = 0; i < 7; i++) {
        const x = xs[i];
        const centre = i === 3;
        if (!(centre && facing === '+z')) {
          sash(b, [x, base + 0.75, z], facing, 1.15, 2.3, { sill: stone });
          b.panel(1.45, 0.32, rubbed, { at: [x, base + 3.05, z], facing, depth: 0.05 });
        }
        sash(b, [x, base + g + 0.55, z], facing, 1.15, 2.1, { sill: stone });
        b.panel(1.45, 0.3, rubbed, { at: [x, base + g + 2.65, z], facing, depth: 0.05 });
      }
    }
    // keystone surround to the central first-floor window
    b.panel(1.5, 2.5, stone, { at: [0, base + g + 0.4, zf], facing: '+z', depth: 0.03 });
    sash(b, [0, base + g + 0.55, zf], '+z', 1.15, 2.1);
    b.panel(0.35, 0.45, stone, { at: [0, base + g + 2.6, zf], facing: '+z', depth: 0.1 });
    // side elevations: two windows per floor
    for (const sx of [-1, 1]) {
      for (const z of [zc - 2, zc + 2]) {
        sash(b, [sx * W / 2, base + 0.75, z], sx > 0 ? '+x' : '-x', 1.15, 2.3, { sill: stone });
        sash(b, [sx * W / 2, base + g + 0.55, z], sx > 0 ? '+x' : '-x', 1.15, 2.1, { sill: stone });
      }
    }

    // ---- the front door: panelled door, pilasters, shell hood on carved brackets
    b.stairs(2.6, base, 1.2, 4, stone, { at: [0, 0, zf + 0.6] });
    b.panel(1.25, 2.6, door, { at: [0, base, zf], facing: '+z', depth: 0.08 });
    b.panel(0.7, 0.5, P.windowDark, { at: [0, base + 2.62, zf], facing: '+z', depth: 0.08 });
    b.sym((s) => {
      b.panel(0.22, 3.2, P.white, { at: [s * 0.8, base, zf], facing: '+z', depth: 0.12 });
      // carved scroll brackets under the hood
      b.box(0.2, 0.55, 0.6, P.white, { at: [s * 0.8, base + 3.0, zf + 0.3] });
      b.log(0.14, 0.2, P.white, { at: [s * 0.8, base + 2.95, zf + 0.42], segs: 8 });
    });
    // the shell: a half dome sticking out from the wall, fluted
    b.box(2.0, 0.14, 0.95, P.white, { at: [0, base + 3.55, zf + 0.47] });
    b.dome(0.95, P.white, { at: [0, base + 3.69, zf], segs: 14, squash: 0.8 });
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + ((k + 0.5) / 7) * Math.PI;
      b.box(0.04, 0.7, 0.04, tint(P.white, -0.12), { at: [Math.sin(a) * 0.45, base + 3.72, zf + Math.cos(a) * 0.45], rot: [0.95 * Math.cos(a), 0, -0.95 * Math.sin(a)] });
    }

    // ---- forecourt railings and gate piers; formal garden behind
    b.sym((s) => {
      b.box(7.6, 0.55, 0.4, stone, { at: [s * 5.6, 0, 11.75] });
      for (const x of linspace(18, 2.1, 9.3)) b.box(0.05, 1.1, 0.05, P.castIron, { at: [s * x, 0.55, 11.75] });
      b.box(7.4, 0.06, 0.06, P.castIron, { at: [s * 5.6, 1.55, 11.75] });
      b.box(0.6, 1.9, 0.6, stone, { at: [s * 1.6, 0, 11.75] });
      b.lathe([[0.2, 0], [0.28, 0.15], [0.15, 0.3], [0.3, 0.55], [0.25, 0.75], [0.05, 0.85]], stone, { at: [s * 1.6, 1.9, 11.75], segs: 8 });
    });
    b.box(2.6, 0.04, 1.0, P.paving, { at: [0, 0, 11.7] });
    b.box(14, 0.04, 9, P.gravel, { at: [0, 0, -6.4] });
    for (const x of [-3.8, 3.8]) {
      for (const z of [-3.9, -8.6]) {
        b.box(5.6, 0.12, 3.4, P.grass, { at: [x, 0, z] });
        b.cone(0.55, 2.2, P.leafDark, { at: [x, 0.1, z], segs: 8 });
      }
    }
    b.sym((s) => b.box(0.35, 2.2, 12.6, brick, { at: [s * 9.7, 0, -5.3] }));
    b.box(19.7, 2.2, 0.35, brick, { at: [0, 0, -11.6] });
  },
};
