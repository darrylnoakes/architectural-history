import { P, tint, type BuildingDef } from '@ah/kit';
import { archOutline, bargeboard, beam, flatOnFront, gardenWalls, well } from './shared';
import { HALL, openHall } from './05-merchants-hall';

export const tudorMerchantsHouse: BuildingDef = {
  id: 'tudor-merchants-house',
  name: 'Tudor merchant’s house',
  style: 'Late medieval timber frame',
  date: 'c. 1500',
  summary:
    'The cloth trade made the town’s leading clothier rich enough to pull down the old street range and build a new one three storeys high, each storey jettied out over the one below. ' +
    'Oak was still plentiful and he spent it as display: close studding sets the posts far nearer together than the frame needs, and glass, now within a rich merchant’s reach, let the windows grow into projecting oriels. ' +
    'The medieval hall behind was kept, with its garden walls and well. A brick chimney stack took the place of its open hearth and louvre, so the hall could be floored over into two storeys, and it was given glazed windows. ' +
    'The oak was left to weather to silver-brown; black-and-white paintwork is mostly a Victorian taste.',
  materials: ['oak frame', 'lime plaster infill', 'clay tile', 'brick chimney', 'leaded glass'],
  lookFor: [
    { label: 'Jetties', note: 'Each upper storey oversails the one below on the projecting ends of the floor joists.', at: [-7.2, 5.9, 11.7] },
    { label: 'Close studding', note: 'Upright timbers set barely a stud’s width apart: oak used as a show of wealth.', at: [-5.6, 1.6, 10.6] },
    { label: 'Oriel window', note: 'A window that projects from the wall on brackets, glazed with small leaded panes.', at: [0, 4.6, 11.6] },
    { label: 'Carved bargeboards', note: 'Boards with a cusped edge and a pendant finial hang under the verge of each gable.', at: [5, 10.4, 12.1] },
    { label: 'Clustered chimney shafts', note: 'Tall brick shafts on one stack: a new luxury, as each hearth now had its own flue.', at: [-8.2, 14.4, 7.7] },
    { label: 'The old hall, floored over', note: 'The open hall of the medieval house still stands behind, with a stack in place of its louvre and two rows of glazed windows where tall unglazed openings lit it before.', at: [1.6, 3.4, -2.2] },
  ],
  build(b) {
    // the medieval hall's colours, drawn exactly as the merchant's hall drew them, so it is the same hall
    const hallStone = b.pick([P.ragstone, P.limestone, tint(P.ragstone, -0.04)]);
    const hallInfill = b.pick([P.limewash, P.daub, P.ochreWash]);
    const hallOak = b.pick([P.oak, tint(P.oak, 0.05)]);
    const hallTile = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.04)]);
    const oak = b.pick([tint(P.oak, 0.06), P.oak, mixSilver()]);
    const infill = b.pick([P.limewash, P.ochreWash, P.daub, P.pinkWash]);
    const tile = b.pick([P.tileRed, P.tileBrown]);
    const brick = b.pick([P.brickRed, P.brickDark]);
    const W = 15;
    const zb = 5; // the new street range stands where the old one did, in front of the hall
    const z0 = 10.4; // ground-floor street face
    const jet = 0.55;
    const hs = [3.0, 2.8, 2.5];
    const ys = [0, 3.0, 5.8, 8.3];
    const zfs = [z0, z0 + jet, z0 + 2 * jet];
    const studs = (w: number) => Math.round(w / 0.55);

    // ---- three storeys, each jettied forward
    for (let i = 0; i < 3; i++) {
      const zf = zfs[i];
      const d = zf - zb;
      const zc = (zf + zb) / 2;
      b.box(W, hs[i], d, infill, { at: [0, ys[i], zc] });
      b.frame(W, hs[i], oak, { at: [0, ys[i], zf], facing: '+z', studs: studs(W), rails: i === 0 ? 0 : 1 });
      // at the back the two lower storeys are hidden by the old hall, except over the yard
      if (i === 2) b.frame(W, hs[i], oak, { at: [0, ys[i], zb], facing: '-z', studs: 6, rails: 1, brace: 'corner' });
      else b.frame(6, hs[i], oak, { at: [4.5, ys[i], zb], facing: '-z', studs: 2, rails: 1, brace: 'corner' });
      b.sym((s) => b.frame(d, hs[i], oak, { at: [s * W / 2, ys[i], zc], facing: s > 0 ? '+x' : '-x', studs: Math.round(d / 0.9), rails: 1 }));
      if (i > 0) {
        // carved bressumer and jetty brackets
        b.box(W + 0.12, 0.3, 0.24, tint(oak, -0.06), { at: [0, ys[i] - 0.05, zf - 0.08] });
        for (const x of [-7.4, -2.5, 2.5, 7.4]) beam(b, [x, ys[i] - 0.9, zfs[i - 1] + 0.02], [x, ys[i] - 0.02, zf - 0.1], 0.18, oak);
      }
    }
    // a plain plinth
    b.box(W + 0.12, 0.35, z0 - zb + 0.12, brick, { at: [0, 0, (z0 + zb) / 2] });

    // ---- roof: three gables to the street, ridges front to back
    const rh = 3.7;
    const eav = ys[3];
    const rd = zfs[2] - zb;
    const rz = (zfs[2] + zb) / 2;
    for (const x of [-5, 0, 5]) {
      b.gable(5, rd, rh, tile, { at: [x, eav, rz], ridge: 'z', overhang: 0.3, wall: infill });
      b.box(0.22, 0.14, rd + 0.6, tint(tile, -0.08), { at: [x, eav + rh + 0.1, rz] });
      // gable framing: king post, collar and a lozenge of decorative timbers
      const zg = zfs[2] + 0.04;
      beam(b, [x, eav, zg], [x, eav + rh - 0.1, zg], 0.16, oak);
      beam(b, [x - 1.3, eav + 1.85, zg], [x + 1.3, eav + 1.85, zg], 0.16, oak);
      beam(b, [x - 2.4, eav + 0.08, zg], [x + 2.4, eav + 0.08, zg], 0.2, oak);
      for (const s of [1, -1]) {
        beam(b, [x + s * 0.9, eav + 0.9, zg], [x, eav + 0.2, zg], 0.12, oak);
        beam(b, [x + s * 0.9, eav + 0.9, zg], [x, eav + 1.6, zg], 0.12, oak);
        beam(b, [x + s * 0.9, eav + 0.9, zg], [x + s * 1.7, eav + 0.2, zg], 0.12, oak);
      }
      b.window(0.7, 0.6, { at: [x, eav + 2.15, zg], facing: '+z', frame: oak, bars: [2, 1] });
      bargeboard(b, 2.5, rh, 0.3, x, eav, zfs[2] + 0.3, oak);
      // back gables plain, with a small window
      b.window(0.8, 0.7, { at: [x, eav + 1.0, zb], facing: '-z', frame: oak, bars: [2, 1] });
    }

    // ---- ground floor: doorway with a four-centred head, shop window, hall window
    const door = archOutline(1.35, 2.45, 0.45, 'tudor');
    const surround = archOutline(1.75, 2.7, 0.55, 'tudor');
    flatOnFront(b, surround, 0, 0.35, z0, 0.1, tint(oak, -0.08));
    flatOnFront(b, door, 0, 0.35, z0, 0.14, P.oakDark);
    b.stairs(1.9, 0.35, 0.4, 1, P.limestone, { at: [0, 0, z0 + 0.2] });
    // shop window (left bay): opening with drop-down counter shutter
    b.panel(3.0, 1.4, 0x2b2420, { at: [-5, 1.0, z0], facing: '+z' });
    b.box(3.0, 0.08, 0.6, oak, { at: [-5, 0.95, z0 + 0.3] });
    b.panel(3.3, 0.16, oak, { at: [-5, 2.4, z0], facing: '+z', depth: 0.1 });
    // hall window (right bay): mullion-and-transom with leaded lights
    b.window(3.2, 1.7, { at: [5, 0.9, z0], facing: '+z', frame: oak, bars: [6, 2], border: 0.1 });

    // ---- first floor: three oriels on brackets, tucked under the second jetty
    for (const x of [-5, 0, 5]) {
      const oy = ys[1] + 0.55;
      const oh = ys[2] - oy - 0.12;
      const zf = zfs[1];
      const od = 0.9;
      b.box(2.6, 0.18, od, oak, { at: [x, oy - 0.18, zf + od / 2] });
      b.box(2.6, oh, od, oak, { at: [x, oy, zf + od / 2] });
      b.window(2.4, oh - 0.16, { at: [x, oy + 0.08, zf + od], facing: '+z', frame: oak, bars: [6, 2], border: 0.06 });
      b.sym((s) => b.window(0.7, oh - 0.16, { at: [x + s * 1.3, oy + 0.08, zf + od / 2], facing: s > 0 ? '+x' : '-x', frame: oak, bars: [1, 2], border: 0.05 }));
      b.sym((s) => beam(b, [x + s * 1.1, oy - 0.85, zf + 0.02], [x + s * 1.1, oy - 0.18, zf + od - 0.1], 0.14, oak));
      b.shed(2.8, od - jet + 0.15, 0.35, tile, { at: [x, oy + oh, zf + jet + (od - jet) / 2 + 0.05], high: '-z' });
    }
    // ---- second floor: long bands of leaded lights
    for (const x of [-5, 0, 5]) b.window(3.4, 1.1, { at: [x, ys[2] + 0.7, zfs[2]], facing: '+z', frame: oak, bars: [8, 1], border: 0.08 });

    // ---- back and side windows
    // (the old hall abuts the back of the left and middle bays, so only the top storey of the left bay has a window there)
    b.window(1.8, 1.1, { at: [-5, ys[2] + 0.9, zb], facing: '-z', frame: oak, bars: [4, 1] });
    for (const i of [1, 2]) b.window(1.8, 1.1, { at: [5, ys[i] + 0.9, zb], facing: '-z', frame: oak, bars: [4, 1] });
    b.window(1.6, 1.1, { at: [W / 2, ys[1] + 0.9, 8.6], facing: '+x', frame: oak, bars: [4, 1] });

    // ---- brick chimney stack on the side wall, with clustered shafts
    const cz = 7.7;
    const cx = -(W / 2 + 0.45);
    b.box(2.0, 2.0, 1.0, brick, { at: [cx, 0, cz] });
    b.box(1.6, 11.0, 0.8, brick, { at: [cx, 2.0, cz] });
    b.box(1.85, 0.25, 1.05, tint(brick, 0.05), { at: [cx, 12.9, cz] });
    for (const dz of [-0.33, 0.33]) {
      b.cyl(0.22, 1.7, brick, { at: [cx - 0.38, 13.1, cz + dz], segs: 8 });
      b.cyl(0.22, 1.7, brick, { at: [cx + 0.38, 13.1, cz + dz], segs: 8 });
    }
    b.box(1.7, 0.18, 1.4, tint(brick, 0.05), { at: [cx, 14.8, cz] });
    b.panel(1.2, 1.0, 0x2b2420, { at: [cx, 0.3, cz + 0.5], facing: '+z', shape: 'segmental' });

    // ---- the medieval hall behind, kept: floored over, with a chimney in place of the louvre and new glazed windows
    openHall(b, hallStone, tint(hallStone, 0.07), hallInfill, hallOak, hallTile);
    const { hx, hw, hH, hrh } = HALL;
    for (const z of [-0.5, -4.0]) {
      b.window(1.8, 1.0, { at: [hx + hw / 2, 1.0, z], facing: '+x', frame: hallOak, bars: [4, 1], border: 0.08 });
      b.window(1.8, 1.0, { at: [hx + hw / 2, 2.9, z], facing: '+x', frame: hallOak, bars: [4, 1], border: 0.08 });
    }
    b.window(1.4, 1.0, { at: [hx - hw / 2, 2.9, -2.2], facing: '-x', frame: hallOak, bars: [3, 1], border: 0.08 });
    // the inserted stack rises through the ridge where the louvre was
    const lz = -1.5;
    b.box(1.3, 2.6, 1.0, brick, { at: [hx, hH + hrh - 1.2, lz] });
    b.box(1.5, 0.18, 1.2, tint(brick, 0.05), { at: [hx, hH + hrh + 1.4, lz] });
    for (const dx of [-0.3, 0.3]) b.box(0.36, 1.3, 0.36, brick, { at: [hx + dx, hH + hrh + 1.58, lz], rotY: Math.PI / 4 });
    b.box(1.4, 0.15, 0.7, tint(brick, 0.05), { at: [hx, hH + hrh + 2.88, lz] });

    // ---- the old well, now the centre of a knot garden of low clipped hedges, and the old garden walls
    const kx = 5.8;
    const kz = -6;
    well(b, kx, kz, hallStone, hallOak);
    b.box(7, 0.05, 7, P.gravel, { at: [kx, 0, kz] });
    for (const [w, d, x, z] of [
      [6.4, 0.35, 0, -3.1], [6.4, 0.35, 0, 3.1], [0.35, 6.4, -3.1, 0], [0.35, 6.4, 3.1, 0],
    ] as const) b.box(w, 0.4, d, P.hedge, { at: [kx + x, 0, kz + z] });
    // diagonal beds running in from the corners towards the well
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      b.box(2.6, 0.38, 0.3, P.hedge, { at: [kx + sx * 2.0, 0, kz + sz * 2.0], rotY: sx * sz * -Math.PI / 4 });
    }
    gardenWalls(b, { toStreet: true });
    // a lean-to kitchen against the back of the street range
    b.box(4, 2.6, 3.4, infill, { at: [5.5, 0, 3.3] });
    b.frame(4, 2.6, oak, { at: [5.5, 0, 1.6], facing: '-z', studs: 4, rails: 1 });
    b.shed(4.4, 3.8, 1.8, tile, { at: [5.5, 2.6, 3.3], high: '+z' });
    b.panel(1.0, 2.0, P.oakDark, { at: [6.4, 0, 1.6], facing: '-z' });
  },
};

function mixSilver(): number {
  return tint(P.oakSilver, -0.18);
}
