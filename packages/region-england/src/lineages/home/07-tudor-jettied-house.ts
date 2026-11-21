import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { beam, paling } from './shared';

export const tudorJettiedHouse: BuildingDef = {
  id: 'tudor-jettied-house',
  name: 'Jettied town house',
  style: 'Tudor timber frame',
  date: 'c. 1560',
  summary:
    'A Tudor shopkeeper lived over his shop. The open hall has gone: a brick chimney stack gives the main rooms fireplaces, so the ' +
    'house can have two full storeys and an attic, each jettied out over the street to gain a little floor space. Showing off ' +
    'oak was the fashion, so the front is close studded, with the posts set as tight as they will go. Glass had become ' +
    'cheap enough for a tradesman, so the windows are glazed with small leaded panes instead of being shuttered.',
  materials: ['close-studded oak frame', 'lime plaster infill', 'red brick chimney', 'clay peg tiles', 'leaded glass'],
  lookFor: [
    {
      label: 'Close studding',
      note: 'Upright timbers set barely their own width apart: far more oak than the frame needs, used to display wealth.',
      at: [2.4, 4.3, 4.6],
    },
    {
      label: 'Jetties',
      note: 'Each storey oversails the one below, the floor joists running out over the street and carrying the wall above.',
      at: [-2.6, 2.85, 4.4],
    },
    {
      label: 'Brick chimney stack',
      note: 'A massive stack of the new red brick, crowned with shafts set diagonally; it replaced the open hearth in the hall.',
      at: [-4.1, 10.4, -0.8],
    },
    {
      label: 'Mullioned window with leaded lights',
      note: 'Rows of lights divided by oak mullions and filled with small panes held in lead strips; the oriel projects to catch light.',
      at: [0.9, 4.2, 5.2],
    },
    {
      label: 'Shop shutters',
      note: 'By day the lower shutter drops to make a counter on the street and the upper one lifts as a little canopy.',
      at: [-1.6, 1.3, 4.6],
    },
  ],
  build(b) {
    const W = 7.2;
    const zf = 4.0;
    const L = b.pick([10.5, 11]);
    const zb = zf - L;
    const j1 = 0.5;
    const j2 = 0.35;
    const g1 = 2.7;
    const fl = 0.26;
    const g2 = 2.5;
    const H = g1 + fl + g2;
    const rise = 4.3;
    const plaster = b.pick([P.limewash, P.plaster, tint(P.ochreWash, 0.1), tint(P.pinkWash, 0.05)]);
    const oak = b.pick([P.oakDark, P.timberBlack, P.oak]);
    const brick = b.pick([P.brickRed, P.brickDark, tint(P.brickRed, -0.03)]);
    const tile = b.pick([P.tileRed, P.tileBrown]);
    const leaded = 0x55677a;

    // ground storey
    b.box(W, g1, L, plaster, { at: [0, 0, (zf + zb) / 2] });
    b.box(W + 0.1, 0.25, L + 0.1, brick, { at: [0, 0, (zf + zb) / 2] }); // brick sill wall
    // floor zone and first jetty
    b.box(W, fl, L + j1, oak, { at: [0, g1, (zf + j1 + zb) / 2] });
    for (const x of spread(14, -W / 2 + 0.15, W / 2 - 0.15)) b.box(0.12, 0.14, j1, oak, { at: [x, g1 + 0.04, zf + j1 / 2] });
    b.box(W, 0.2, 0.18, oak, { at: [0, g1 + fl - 0.08, zf + j1 - 0.09] });
    // first-floor storey
    b.box(W, g2, L + j1, plaster, { at: [0, g1 + fl, (zf + j1 + zb) / 2] });
    // front frames: close studding upstairs, plainer post-and-rail at the shop
    b.frame(W, g2, oak, { at: [0, g1 + fl, zf + j1], facing: '+z', studs: 15, rails: 1, beam: 0.15 });
    b.frame(W, g1 - 0.25, oak, { at: [0, 0.25, zf], facing: '+z', studs: 3, rails: 0, beam: 0.2 });

    // roof, gable to the street, with a second jetty under the gable
    const zr = (zf + j1 + j2 + zb) / 2;
    const Lr = zf + j1 + j2 - zb;
    b.gable(W, Lr, rise, tile, { at: [0, H, zr], ridge: 'z', overhang: 0.3, thick: 0.16, wall: plaster });
    b.box(W + 0.1, 0.22, 0.2, oak, { at: [0, H - 0.05, zf + j1 + j2 - 0.1] });
    // gable: close studs clipped to the triangle, a collar, a small attic window, bargeboards
    const zg = zf + j1 + j2 + 0.02;
    for (const x of spread(13, -W / 2 + 0.35, W / 2 - 0.35)) {
      const h = rise * (1 - Math.abs(x) / (W / 2)) - 0.12;
      if (h > 0.2) b.box(0.13, h, 0.07, oak, { at: [x, H + 0.15, zg] });
    }
    b.box(W * 0.55, 0.16, 0.08, oak, { at: [0, H + rise * 0.45, zg + 0.02] });
    b.window(1.3, 0.9, { at: [0, H + 0.55, zg + 0.06], facing: '+z', frame: oak, glass: leaded, bars: [3, 3] });
    b.sym((s) => beam(b, [s * (W / 2 + 0.3), H - 0.15, zg + 0.32], [0, H + rise + 0.12, zg + 0.32], 0.12, 0.3, oak));
    b.cone(0.1, 0.9, oak, { at: [0, H + rise - 0.2, zg + 0.34], segs: 5 }); // finial
    b.box(0.12, 0.6, 0.12, oak, { at: [0, H - 0.6, zg + 0.34] }); // pendant

    // oriel window on the first floor
    b.group({ at: [0.9, g1 + fl + 0.45, zf + j1] }, () => {
      b.box(2.4, 1.5, 0.5, oak, { at: [0, 0, 0.25] });
      b.window(2.2, 1.3, { at: [0, 0.1, 0.5], facing: '+z', frame: oak, glass: leaded, bars: [4, 4] });
      b.sym((s) => b.window(0.38, 1.3, { at: [s * 1.2, 0.1, 0.25], facing: s > 0 ? '+x' : '-x', frame: oak, glass: leaded, bars: [1, 4] }));
      b.box(2.6, 0.2, 0.62, oak, { at: [0, -0.2, 0.28] });
      b.shed(2.6, 0.62, 0.3, tile, { at: [0, 1.5, 0.28], high: '-z' });
    });
    b.window(1.4, 1.2, { at: [-2.4, g1 + fl + 0.7, zf + j1 + 0.04], facing: '+z', frame: oak, glass: leaded, bars: [3, 4] });

    // shop front: opening with a counter shutter let down and a canopy shutter lifted
    const sx = -1.4;
    b.panel(2.8, 1.3, P.timberBlack, { at: [sx, 0.85, zf + 0.06], facing: '+z' });
    b.box(2.8, 0.08, 0.55, P.oak, { at: [sx, 0.8, zf + 0.33] });
    b.sym((s) => beam(b, [sx + s * 1.25, 0.4, zf + 0.08], [sx + s * 1.25, 0.8, zf + 0.5], 0.06, 0.06, P.oak));
    b.group({ at: [sx, 2.18, zf + 0.06], rot: [-1.05, 0, 0] }, () => b.box(2.8, 0.06, 0.6, P.oak, { at: [0, 0, 0.3] }));
    // a few wares on the counter
    for (const x of [-2.4, -1.8, -1.0, -0.6]) b.box(0.3, 0.2, 0.25, b.pick([P.cream, P.ochreWash, P.doorRed, P.bark]), { at: [x, 0.88, zf + 0.35] });
    // door, under a flattened arch
    b.panel(1.2, 2.25, oak, { at: [2.2, 0.15, zf + 0.05], facing: '+z', shape: 'segmental' });
    b.panel(1.0, 2.1, P.oak, { at: [2.2, 0.15, zf + 0.08], facing: '+z', shape: 'segmental' });
    b.box(1.2, 0.15, 0.4, P.limestone, { at: [2.2, 0, zf + 0.2] });

    // side and rear walls: plainer square panels, small windows
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      b.frame(L + j1, g2, oak, { at: [(s * W) / 2, g1 + fl, (zf + j1 + zb) / 2], facing: f, studs: 9, rails: 1, brace: 'corner' });
      b.frame(L, g1 - 0.25, oak, { at: [(s * W) / 2, 0.25, (zf + zb) / 2], facing: f, studs: 7, rails: 1 });
    });
    b.frame(W, g2, oak, { at: [0, g1 + fl, zb], facing: '-z', studs: 5, rails: 1, brace: 'corner' });
    b.frame(W, g1 - 0.25, oak, { at: [0, 0.25, zb], facing: '-z', studs: 4, rails: 1 });
    b.window(1.2, 1.0, { at: [1.6, g1 + fl + 0.8, zb - 0.04], facing: '-z', frame: oak, glass: leaded, bars: [3, 3] });
    b.window(1.0, 0.9, { at: [-1.5, 1.0, zb - 0.04], facing: '-z', frame: oak, glass: leaded, bars: [3, 3] });
    b.panel(0.95, 2.0, P.oak, { at: [1.6, 0.2, zb - 0.04], facing: '-z' });
    b.window(1.2, 1.0, { at: [W / 2 + 0.04, g1 + fl + 0.8, 1.3], facing: '+x', frame: oak, glass: leaded, bars: [3, 3] });
    // rear: back gable
    for (const x of spread(5, -W / 2 + 0.8, W / 2 - 0.8)) {
      const h = rise * (1 - Math.abs(x) / (W / 2)) - 0.12;
      b.box(0.13, h, 0.07, oak, { at: [x, H + 0.05, zb - 0.04] });
    }

    // lateral brick chimney stack on the left side, with diagonal shafts
    const cz = zb + L * 0.5;
    const cx = -W / 2 - 0.45;
    b.box(1.8, H + 0.6, 0.9, brick, { at: [cx, 0, cz], rotY: Math.PI / 2 });
    b.box(1.2, rise * 0.5, 0.8, brick, { at: [cx, H + 0.6, cz], rotY: Math.PI / 2 });
    b.box(1.0, 0.25, 0.9, brick, { at: [cx, H + 0.6 + rise * 0.5, cz], rotY: Math.PI / 2 }); // capping
    const stackTop = H + rise + 1.0;
    b.box(0.95, stackTop - (H + 0.85 + rise * 0.5), 0.6, brick, { at: [cx, H + 0.85 + rise * 0.5, cz], rotY: Math.PI / 2 });
    for (const dz of [-0.28, 0.28]) {
      b.box(0.42, 1.2, 0.42, tint(brick, 0.04), { at: [cx, stackTop, cz + dz], rotY: Math.PI / 4 });
      b.box(0.56, 0.14, 0.56, brick, { at: [cx, stackTop + 1.2, cz + dz], rotY: Math.PI / 4 });
    }
    b.box(0.95, 0.12, 1.2, brick, { at: [cx, stackTop - 0.05, cz] });

    // yard behind: a well and a paled boundary
    b.cyl(0.55, 0.75, P.brickRed, { at: [-3.4, 0, zb - 2.2], segs: 10 });
    b.cyl(0.4, 0.77, P.windowDark, { at: [-3.4, 0, zb - 2.2], segs: 10 });
    paling(b, -6.8, -8.8, 6.8, -8.8, 1.6, P.oakSilver, 0.16);
    b.box(1.4, 2.0, 1.2, P.oakSilver, { at: [5.6, 0, -8.0] });
    b.shed(1.6, 1.4, 0.3, tile, { at: [5.6, 2.0, -8.0], high: '-z' });
  },
};
