import { P, tint, type BuildingDef } from '@ah/kit';
import { archPts, block, col, imbrexRibs, imbrexRibsZ, onFace, plate } from './shared';

export const domus: BuildingDef = {
  id: 'domus',
  name: 'Gallo-Roman town house (domus)',
  style: 'Gallo-Roman',
  date: 'c. 60',
  summary:
    'A century after the conquest the leading family lives like Romans, in a single-storey house of mortared stone, plaster and tile built round a garden framed by columns (the peristyle). ' +
    'The street front is let out as shops; behind them the rooms face inward onto covered walks painted with red dados and coloured panels. ' +
    'In the cold north the luxury that mattered most was heat: one room has a floor raised on stacks of tiles (a hypocaust), warmed by hot air from a furnace stoked from outside.',
  materials: ['limestone rubble and lime mortar', 'painted plaster', 'stuccoed columns', 'tegulae and imbrices (roof tiles)', 'brick (hypocaust)'],
  modelledOn: 'Generic; the plan follows excavated houses of northern Gaul such as those of Amiens (Samarobriva) and Bavay',
  influences: ['roman-conquest'],
  lookFor: [
    { label: 'Peristyle garden', note: 'A garden with a pool surrounded by a colonnade: the covered walks lead to every room.', at: [0, 3.4, 4.6] },
    { label: 'Painted plaster', note: 'The walls under the walks are painted with a dark red dado and panels of colour, as fragments from Gallo-Roman houses show.', at: [-7.0, 1.6, -1.0] },
    { label: 'Furnace arch (praefurnium)', note: 'A low arch where a slave fed the fire whose hot air ran under the floor of the heated room.', at: [11.2, 1.0, -9.2] },
    { label: 'Hypocaust', note: 'The heated room’s floor stands on little piles of square tiles (pilae) so that hot air can circulate beneath it.', at: [9.0, 0.6, -10.6] },
    { label: 'Shops (tabernae)', note: 'The rooms on the street open fully onto the pavement and are let to traders, under a covered portico.', at: [-6.5, 2.0, 11.6] },
  ],
  build(b) {
    const plaster = b.pick([P.plaster, P.limewash, tint(P.plaster, 0.03)]);
    const socle = b.pick([P.intonacoRed, tint(P.intonacoRed, -0.05), P.ochreWash]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05), P.tileRed]);
    const rib = tint(tile, -0.07);
    const stone = P.limestone;
    const dado = b.pick([P.intonacoRed, P.porphyry]);
    const panelC = b.pick([P.intonacoOchre, P.ochreWash, P.intonacoCream]);
    const H = 3.8; // wall height of the ranges
    const zF = 11; // street wall
    const zB = -12; // back wall
    const fD = 4.5; // front range depth
    const bD = 5.5; // back range depth
    const sW = 4; // side range width
    const zci = zF - fD; // 6.5: court front edge
    const zcb = zB + bD; // -6.5: court back edge
    const xi = 11 - sW; // 7: court side edge
    const walkX = 5;
    const walkZf = zci - 2;
    const walkZb = zcb + 2;

    // ---- a low stone footing under everything
    b.box(22.2, 0.3, zF - zB + 0.2, stone, { at: [0, 0, (zF + zB) / 2] });

    // ---- the front range: shops either side of the entrance passage
    const passW = 2.2;
    const fW = 11 - passW / 2;
    b.sym((s) => block(b, fW, H + 0.6, fD, plaster, s * (passW / 2 + fW / 2), zF - fD / 2));
    b.box(passW, 0.8, fD, plaster, { at: [0, H - 0.2, zF - fD / 2] });
    b.box(passW, 0.05, fD, P.paving, { at: [0, 0.3, zF - fD / 2] });
    // ---- side ranges and back range
    b.sym((s) => block(b, sW, H, zci - zcb, plaster, s * (11 - sW / 2), 0));
    // the back range, solid except the heated room at its +X end
    const bathW = 4;
    block(b, 22 - bathW, H, bD, plaster, -bathW / 2, zB + bD / 2);
    // the heated room's own walls (hollow so its floor can be seen)
    const bx = 11 - bathW / 2;
    const bz = zB + bD / 2;
    b.box(bathW, H, 0.45, plaster, { at: [bx, 0, zB + 0.225] });
    b.box(bathW, H, 0.45, plaster, { at: [bx, 0, zcb - 0.225] });
    b.box(0.45, H, bD, plaster, { at: [11 - 0.225, 0, bz] });
    b.collider(bathW, bD, { at: [bx, 0, bz] });
    // inside: half the floor laid on its tile stacks, half left open to show them
    b.box(bathW - 0.9, 0.12, bD - 0.9, P.brickRed, { at: [bx, 0.3, bz] });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) b.box(0.28, 0.5, 0.28, P.brickOrange, { at: [bx - 1.2 + i * 0.8, 0.42, zB + 0.75 + j * 0.65], jitter: false });
    b.box(bathW - 0.9, 0.16, bD / 2 - 0.2, P.marble, { at: [bx, 0.92, bz + bD / 4 - 0.25] });
    b.box(1.4, 0.7, 1.0, P.marble, { at: [bx + 0.6, 1.08, zcb - 0.95] });
    // painted walls inside the heated room
    onFace(b, '+x', [7.45, 0, bz], () => {
      b.box(bD - 0.9, 1.1, 0.04, dado, { at: [0, 1.0, 0.02] });
      b.box(bD - 0.9, 1.5, 0.04, panelC, { at: [0, 2.1, 0.02] });
    });
    b.box(0.45, H, bD, plaster, { at: [7.0 - 0.225 + 0.45, 0, bz] });

    // ---- the painted red socle outside, all round
    b.box(22.1, 0.9, 0.06, socle, { at: [0, 0.3, zB - 0.03] });
    b.sym((s) => b.box(0.06, 0.9, zF - zB, socle, { at: [s * 11.03, 0.3, (zF + zB) / 2] }));

    // ---- roofs: low tiled gables over each range
    const pitch = 0.42;
    const ov = 0.35;
    const fy = H + 0.6;
    b.gable(22, fD, (fD / 2) * pitch * 1.6, tile, { at: [0, fy, zF - fD / 2], overhang: ov, wall: plaster });
    imbrexRibs(b, -10.8, 10.8, zF - fD / 2, fD, fy, (fD / 2) * pitch * 1.6, ov, rib, 0.9, [1]);
    b.gable(22 - bathW, bD, (bD / 2) * pitch * 1.6, tile, { at: [-bathW / 2, H, zB + bD / 2], overhang: ov, wall: plaster });
    imbrexRibs(b, -10.8, 6.6, zB + bD / 2, bD, H, (bD / 2) * pitch * 1.6, ov, rib, 1.1, [-1]);
    for (const s of [-1, 1]) {
      b.gable(sW, zci - zcb, (sW / 2) * pitch * 1.6, tile, { at: [s * (11 - sW / 2), H, 0], ridge: 'z', overhang: ov });
      imbrexRibsZ(b, zcb + 0.2, zci - 0.2, s * (11 - sW / 2), sW, H, (sW / 2) * pitch * 1.6, ov, rib, 1.1, [s as 1 | -1]);
    }
    if (!b.cutaway) {
      b.hip(bathW, bD, 1.6, tile, { at: [bx, H, bz], overhang: ov });
    }

    // ---- the furnace (praefurnium) on the outside of the heated room, under a lean-to
    onFace(b, '+x', [11, 0, -9.2], () => {
      plate(b, archPts(0, 0, 1.5, 1.4, 'round', 6), 0.12, P.brickRed);
      plate(b, archPts(0, 0, 0.9, 1.0, 'round', 6), 0.14, 0x3a2418);
      b.box(0.6, 0.25, 0.5, 0xd8642a, { at: [0, 0, 0.3] });
      b.box(1.8, 0.7, 0.6, P.oakDark, { at: [0, 0, 0.9] }); // the woodpile (deliberately crude)
    });
    b.shed(1.0, 3.2, 0.7, tile, { at: [11.5, 2.2, -9.2], high: '-x' });
    for (const z of [-10.6, -7.8]) b.cyl(0.08, 2.2, P.oak, { at: [11.9, 0, z], segs: 5 });

    // ---- street front: shop openings with counters, the entrance, a portico on the pavement
    onFace(b, '+z', [0, 0, zF], () => {
      for (const x of [-8.4, -4.0, 4.0, 8.4]) {
        b.box(3.2, 3.0, 0.1, 0x3b3128, { at: [x, 0.3, 0.02] });
        b.box(3.0, 0.9, 0.6, stone, { at: [x - 0.1, 0.3, 0.32] });
        b.box(0.8, 0.12, 0.6, P.oak, { at: [x + 1.0, 1.2, 0.32] });
      }
      // amphorae and a stack of pots at one shop
      for (const dx of [-0.9, -0.5]) {
        b.cyl(0.18, 0.7, P.terracotta, { at: [-8.4 + dx, 1.2, 0.3], segs: 6, rTop: 0.08 });
      }
      // the doorway with a stone threshold
      b.box(passW + 0.6, 3.3, 0.12, stone, { at: [0, 0.3, 0.02] });
      b.box(passW - 0.2, 2.9, 0.16, 0x3b3128, { at: [0, 0.3, 0.04] });
      b.box(passW + 0.2, 0.08, 0.5, stone, { at: [0, 0.3, 0.3] });
    });
    // the portico on the pavement
    const pz = 12.6;
    b.box(22.2, 0.16, 1.9, P.paving, { at: [0, 0, zF + 0.9] });
    for (let i = 0; i < 8; i++) {
      const x = -10.5 + (21 * i) / 7;
      if (Math.abs(x) < 1) continue;
      b.box(0.5, 0.4, 0.5, stone, { at: [x, 0.16, pz] });
      b.cyl(0.17, 2.7, P.stucco, { at: [x, 0.56, pz], segs: 6, rTop: 0.15 });
      b.box(0.45, 0.2, 0.45, P.stucco, { at: [x, 3.26, pz] });
    }
    for (const x of [-1.5, 1.5]) {
      b.box(0.5, 0.4, 0.5, stone, { at: [x, 0.16, pz] });
      b.cyl(0.17, 2.7, P.stucco, { at: [x, 0.56, pz], segs: 6, rTop: 0.15 });
      b.box(0.45, 0.2, 0.45, P.stucco, { at: [x, 3.26, pz] });
    }
    b.box(22, 0.3, 0.4, P.oak, { at: [0, 3.46, pz] });
    b.shed(22.2, 2.2, 0.8, tile, { at: [0, 3.76, zF + 1.0], high: '-z' });

    // ---- the peristyle: columns, an entablature, lean-to roofs over the walks
    b.box(2 * xi, 0.32, zci - zcb, P.paving, { at: [0, 0, 0] });
    b.box(2 * walkX - 0.8, 0.36, walkZf - walkZb - 0.8, P.grass, { at: [0, 0, (walkZf + walkZb) / 2] });
    const colH = 3.0;
    const colC = P.stucco;
    const xs = [-5, -3, -1, 1, 3, 5];
    const zs = [walkZb, walkZb + (walkZf - walkZb) / 4, (walkZf + walkZb) / 2, walkZb + (3 * (walkZf - walkZb)) / 4, walkZf];
    for (const x of xs) for (const z of [walkZf, walkZb]) col(b, x, z, 0.17, colH, colC, { y: 0.32, cap: 'tuscan', segs: 6 });
    for (const z of zs.slice(1, -1)) for (const x of [-walkX, walkX]) col(b, x, z, 0.17, colH, colC, { y: 0.32, cap: 'tuscan', segs: 6 });
    // the lower third of each shaft painted red, as was usual
    for (const x of xs) for (const z of [walkZf, walkZb]) b.cyl(0.18, 1.0, dado, { at: [x, 0.52, z], segs: 6, jitter: false });
    for (const z of zs.slice(1, -1)) for (const x of [-walkX, walkX]) b.cyl(0.18, 1.0, dado, { at: [x, 0.52, z], segs: 6, jitter: false });
    const ey = 0.32 + colH;
    b.box(2 * walkX + 0.5, 0.3, 0.4, P.stucco, { at: [0, ey, walkZf] });
    b.box(2 * walkX + 0.5, 0.3, 0.4, P.stucco, { at: [0, ey, walkZb] });
    b.sym((s) => b.box(0.4, 0.3, walkZf - walkZb, P.stucco, { at: [s * walkX, ey, (walkZf + walkZb) / 2] }));
    const ry = ey + 0.3;
    const rise = H - ry + 0.1;
    b.shed(2 * xi, zci - walkZf + 0.4, rise, tile, { at: [0, ry, (zci + walkZf) / 2 - 0.2], high: '+z' });
    b.shed(2 * xi, walkZb - zcb + 0.4, rise, tile, { at: [0, ry, (zcb + walkZb) / 2 + 0.2], high: '-z' });
    b.sym((s) => b.shed(xi - walkX + 0.4, walkZf - walkZb, rise, tile, { at: [s * ((xi + walkX) / 2 + 0.2 * 0), ry, (walkZf + walkZb) / 2], high: s > 0 ? '+x' : '-x' }));
    // the pool and a fountain in the garden, a few shrubs
    b.box(3.6, 0.5, 2.0, stone, { at: [0, 0.3, 0] });
    b.box(3.2, 0.5, 1.6, P.water, { at: [0, 0.32, 0], mat: 'glass' });
    b.cyl(0.18, 1.0, P.marble, { at: [0, 0.6, 0], segs: 6 });
    for (const [x, z] of [[-3.0, 2.6], [3.0, 2.6], [-3.0, -2.6], [3.0, -2.6]] as [number, number][]) b.tree(1.4, { at: [x, 0.36, z], kind: 'bush', color: P.leafDark });

    // ---- painted plaster on the walls under the walks: a dark red dado, coloured panels, a black frieze
    const paint = (f: '+z' | '-z' | '+x' | '-x', at: [number, number, number], len: number) =>
      onFace(b, f, at, () => {
        b.box(len, 1.0, 0.04, dado, { at: [0, 0.32, 0.02] });
        const n = Math.round(len / 2.6);
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * (len / n);
          if (Math.abs(x) < 1.2 && (f === '-z' || f === '+z')) {
            b.box(1.6, 2.6, 0.05, 0x3b3128, { at: [x, 0.32, 0.03] }); // the door of the main room
            continue;
          }
          b.box(len / n - 0.5, 1.6, 0.04, i % 2 ? panelC : tint(panelC, -0.08), { at: [x, 1.42, 0.03] });
        }
        b.box(len, 0.45, 0.04, P.black, { at: [0, 3.0, 0.02] });
      });
    paint('-z', [0, 0, zci], 2 * xi);
    paint('+z', [0, 0, zcb], 2 * xi - 0.2);
    paint('+x', [-xi, 0, 0], zci - zcb);
    paint('-x', [xi, 0, 0], zci - zcb);
  },
};
