import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archOutline, beam, flatOnFront } from './shared';

/** A carved bargeboard for a gable facing +Z: hangs under the verge, with a cusped lower edge. */
function bargeboard(b: Builder, half: number, h: number, ov: number, x: number, y: number, z: number, color: number) {
  const drop = (ov * h) / half;
  const L: [number, number] = [-half - ov, -drop - 0.02];
  const R: [number, number] = [half + ov, -drop - 0.02];
  const apex: [number, number] = [0, h - 0.02];
  const n = 9;
  const inner = (side: 1 | -1) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; // 0 at apex, 1 at eaves
      const px = side * (half + ov) * t;
      const py = h - 0.02 - (h + drop) * t;
      const d = i % 2 === 0 ? 0.42 : 0.26;
      out.push([px, py - d]);
    }
    return out;
  };
  const right = inner(1).reverse(); // from eaves end back to apex
  const left = inner(-1); // from apex out to the left eaves
  const pts: [number, number][] = [L, apex, R, ...right, ...left.slice(1)];
  b.extrude(pts, 0.08, color, { at: [x, y, z] });
  // turned pendant and finial at the apex
  b.cyl(0.08, 1.2, color, { at: [x, y + h - 0.7, z], segs: 6 });
  b.cone(0.11, 0.3, color, { at: [x, y + h + 0.5, z], segs: 6 });
}

export const tudorMerchantsHouse: BuildingDef = {
  id: 'tudor-merchants-house',
  name: 'Tudor merchant’s house',
  style: 'Late medieval timber frame',
  date: 'c. 1500',
  summary:
    'The cloth trade made the town’s leading clothier rich enough to build three storeys high, each one jettied out over the one below. ' +
    'Oak was still plentiful and he spent it as display: close studding sets the posts far nearer together than the frame needs. ' +
    'Cheaper glass let windows grow into projecting oriels, and a brick chimney stack replaced the open hearth, so the hall could be floored over. ' +
    'The oak was left to weather to silver-brown; black-and-white paintwork is mostly a Victorian taste.',
  materials: ['oak frame', 'lime plaster infill', 'clay tile', 'brick chimney', 'leaded glass'],
  lookFor: [
    { label: 'Jetties', note: 'Each upper storey oversails the one below on the projecting ends of the floor joists.', at: [-7.2, 5.9, 11.7] },
    { label: 'Close studding', note: 'Upright timbers set barely a stud’s width apart: oak used as a show of wealth.', at: [-5.6, 1.6, 10.6] },
    { label: 'Oriel window', note: 'A window that projects from the wall on brackets, glazed with small leaded panes.', at: [0, 4.6, 11.6] },
    { label: 'Carved bargeboards', note: 'Boards with a cusped edge and a pendant finial hang under the verge of each gable.', at: [5, 10.4, 12.1] },
    { label: 'Clustered chimney shafts', note: 'Tall brick shafts on one stack: a new luxury, as each hearth now had its own flue.', at: [8.2, 14.2, 4.5] },
  ],
  build(b) {
    const oak = b.pick([tint(P.oak, 0.06), P.oak, mixSilver()]);
    const infill = b.pick([P.limewash, P.ochreWash, P.daub, P.pinkWash]);
    const tile = b.pick([P.tileRed, P.tileBrown]);
    const brick = b.pick([P.brickRed, P.brickDark]);
    const W = 15;
    const zb = 1.5;
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
      b.frame(W, hs[i], oak, { at: [0, ys[i], zb], facing: '-z', studs: 9, rails: 1, brace: 'corner' });
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
      b.box(2.6, 0.18, 0.55, oak, { at: [x, oy - 0.18, zf + 0.27] });
      b.box(2.6, oh, 0.55, oak, { at: [x, oy, zf + 0.27] });
      b.window(2.4, oh - 0.16, { at: [x, oy + 0.08, zf + 0.55], facing: '+z', frame: oak, bars: [6, 2], border: 0.06 });
      b.sym((s) => b.window(0.4, oh - 0.16, { at: [x + s * 1.3, oy + 0.08, zf + 0.27], facing: s > 0 ? '+x' : '-x', frame: oak, bars: [1, 2], border: 0.05 }));
      b.sym((s) => beam(b, [x + s * 1.1, oy - 0.75, zf + 0.02], [x + s * 1.1, oy - 0.18, zf + 0.5], 0.14, oak));
    }
    // ---- second floor: long bands of leaded lights
    for (const x of [-5, 0, 5]) b.window(3.4, 1.1, { at: [x, ys[2] + 0.7, zfs[2]], facing: '+z', frame: oak, bars: [8, 1], border: 0.08 });

    // ---- back and side windows
    for (const x of [-5, 0, 5]) {
      for (let i = 0; i < 3; i++) if (!(i === 0 && x === -5)) b.window(1.8, 1.1, { at: [x, ys[i] + 0.9, zb], facing: '-z', frame: oak, bars: [4, 1] });
    }
    b.panel(1.2, 2.2, P.oakDark, { at: [-5, 0.35, zb], facing: '-z' });
    b.window(1.6, 1.1, { at: [-W / 2, ys[1] + 0.9, 6.5], facing: '-x', frame: oak, bars: [4, 1] });

    // ---- brick chimney stack on the side wall, with clustered shafts
    const cz = 4.5;
    const cx = W / 2 + 0.45;
    b.box(2.0, 2.0, 1.0, brick, { at: [cx, 0, cz] });
    b.box(1.6, 12.0, 0.8, brick, { at: [cx, 2.0, cz] });
    b.box(1.85, 0.25, 1.05, tint(brick, 0.05), { at: [cx, 13.9, cz] });
    for (const dz of [-0.33, 0.33]) {
      b.cyl(0.24, 1.9, brick, { at: [cx - 0.35, 14.1, cz + dz], segs: 8 });
      b.cyl(0.24, 1.9, brick, { at: [cx + 0.35, 14.1, cz + dz], segs: 8 });
    }
    b.box(1.6, 0.2, 1.3, tint(brick, 0.05), { at: [cx, 16.0, cz] });
    b.panel(1.2, 1.0, 0x2b2420, { at: [cx, 0.3, cz + 0.5], facing: '+z', shape: 'segmental' });

    // ---- garden behind: a knot garden in low clipped hedges, and a brick wall
    b.box(8, 0.05, 8, P.gravel, { at: [3.2, 0, -6.6] });
    for (const [w, d, x, z] of [
      [7, 0.35, 3.2, -3.2], [7, 0.35, 3.2, -10], [0.35, 7, -0.3, -6.6], [0.35, 7, 6.7, -6.6],
      [4.6, 0.3, 3.2, -6.6], [0.3, 4.6, 3.2, -6.6],
    ] as const) b.box(w, 0.4, d, P.hedge, { at: [x, 0, z] });
    for (const r of [0, Math.PI / 2]) b.box(4.2, 0.38, 0.3, P.hedge, { at: [3.2, 0, -6.6], rotY: Math.PI / 4 + r });
    b.sym((s) => b.box(0.35, 2.0, 13.2, brick, { at: [s * 9.7, 0, -5.2] }));
    b.box(19.7, 2.0, 0.35, brick, { at: [0, 0, -11.6] });
    // a lean-to kitchen against the back wall
    b.box(5, 2.6, 3.4, infill, { at: [-5, 0, -0.2] });
    b.frame(5, 2.6, oak, { at: [-5, 0, -1.9], facing: '-z', studs: 5, rails: 1 });
    b.shed(5.4, 3.8, 1.8, tile, { at: [-5, 2.6, -0.2], high: '+z' });
    b.panel(1.0, 2.0, P.oakDark, { at: [-4, 0, -1.9], facing: '-z' });
  },
};

function mixSilver(): number {
  return tint(P.oakSilver, -0.18);
}
