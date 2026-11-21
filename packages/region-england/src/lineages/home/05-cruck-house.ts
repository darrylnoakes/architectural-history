import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { curvedTimber, hurdle, paling } from './shared';

export const cruckHouse: BuildingDef = {
  id: 'cruck-house',
  name: 'Cruck-framed house',
  style: 'Medieval vernacular',
  date: 'c. 1250',
  summary:
    'By the thirteenth century a better-off peasant or craftsman could afford a house carried on crucks: pairs of great curved oak ' +
    'blades, each pair often cut from one split tree, rising from the ground to meet at the ridge. The crucks carry the whole roof, so ' +
    'the low walls between them are only a light frame of wattle and daub. The animals have moved out to their own sheds, but there is ' +
    'still an open hearth, with the smoke let out through a louvre on the ridge.',
  materials: ['oak crucks and framing', 'wattle and daub, limewashed', 'straw thatch', 'rubble sill wall'],
  lookFor: [
    {
      label: 'Cruck blades',
      note: 'A pair of curved timbers rising from the ground to the ridge, joined by a tie beam and a collar; you can see one pair in each gable end.',
      at: [1.9, 2.8, 6.2],
    },
    {
      label: 'Wattle-and-daub panels',
      note: 'Woven hazel rods plastered with clay fill the squares of the timber frame; they carry no weight.',
      at: [3.0, 1.0, 2.4],
    },
    {
      label: 'Steep thatch',
      note: 'Pitched at about 50 degrees, steep enough to shed rain before it soaks into the straw.',
      at: [-2.2, 4.0, 1.0],
    },
    {
      label: 'Louvre',
      note: 'A little roofed opening on the ridge above the open hearth, the only way out for the smoke.',
      at: [0, 6.2, 0.0],
    },
  ],
  build(b) {
    const W = 5.6;
    const bays = b.pick([3, 3, 4]);
    const bay = 3.3;
    const L = bays * bay;
    const zf = 5.8;
    const zc = zf - L / 2;
    const wallH = 2.0;
    const rise = 3.4;
    const daub = tint(P.limewash, b.range(-0.06, -0.02));
    const oak = P.oak;
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.05)]);

    b.box(W + 0.1, 0.3, L + 0.1, P.rubble, { at: [0, 0, zc] });
    b.box(W, wallH - 0.3, L, daub, { at: [0, 0.3, zc] });

    // side walls: square-panelled frame with posts at each cruck
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      for (let i = 0; i < bays; i++) {
        const z = zf - bay * (i + 0.5);
        b.frame(bay, wallH - 0.3, oak, { at: [(s * W) / 2, 0.3, z], facing: f, studs: 2, rails: 1, beam: 0.15 });
      }
    });

    // roof
    b.gable(W, L, rise, thatch, { at: [0, wallH, zc], ridge: 'z', overhang: 0.45, thick: 0.45, wall: daub });
    b.log(0.13, L + 0.9, tint(thatch, -0.14), { at: [0, wallH + rise + 0.25, zc], axis: 'z', segs: 6 });

    // crucks in each gable end (and their feet showing at each bay post along the sides)
    const apex = wallH + rise - 0.15;
    const cruck = (z: number) => {
      b.sym((s) =>
        curvedTimber(b, [s * (W / 2 - 0.1), 0], [s * (W / 2 - 0.4), apex * 0.5], [0, apex], s * -0.26, 0.24, oak, { at: [0, 0, z] }),
      );
      b.box(W - 0.4, 0.2, 0.24, oak, { at: [0, wallH - 0.1, z] }); // tie beam
      b.box(1.9, 0.18, 0.24, oak, { at: [0, apex - 1.3, z] }); // collar
      b.box(0.16, apex - wallH - 0.3, 0.2, oak, { at: [0, wallH + 0.1, z] }); // king strut
    };
    cruck(zf + 0.08);
    cruck(zf - L - 0.08);

    // front gable: a small shuttered window, unglazed
    b.window(0.8, 0.7, { at: [-1.3, 0.95, zf + 0.1], facing: '+z', frame: oak, glass: P.timberBlack, bars: [3, 1] });
    b.panel(0.5, 0.7, oak, { at: [-1.97, 0.95, zf + 0.12], facing: '+z' });
    // doors on the long sides, opposite each other
    b.sym((s) => {
      b.panel(1.0, 1.85, P.oakDark, { at: [(s * W) / 2 + s * 0.06, 0.3, zf - bay * 1.12], facing: s > 0 ? '+x' : '-x' });
    });
    b.box(1.2, 0.3, 0.6, P.rubble, { at: [W / 2 + 0.3, 0, zf - bay * 1.12], rotY: Math.PI / 2 });
    b.window(0.8, 0.6, { at: [W / 2 + 0.05, 1.0, zf - bay * 2.3], facing: '+x', frame: oak, glass: P.timberBlack, bars: [3, 1] });

    // louvre over the hearth
    const lz = zf - bay * 1.6;
    b.box(0.7, 0.55, 0.9, P.oakSilver, { at: [0, wallH + rise - 0.1, lz] });
    b.sym((s) => b.panel(0.6, 0.35, P.timberBlack, { at: [s * 0.36, wallH + rise, lz], facing: s > 0 ? '+x' : '-x', rotY: 0 }));
    b.gable(0.9, 1.1, 0.4, tint(thatch, -0.1), { at: [0, wallH + rise + 0.45, lz], ridge: 'z', overhang: 0.08, thick: 0.1 });

    // garden behind: wattle fence, beehive skeps, a pig sty
    const zg = zf - L - 0.4;
    hurdle(b, -6.6, zg, -6.6, -8.8, 1.1);
    hurdle(b, -6.6, -8.8, 6.6, -8.8, 1.1);
    hurdle(b, 6.6, -8.8, 6.6, zg, 1.1);
    for (const x of [-5.4, -4.7]) {
      b.box(0.6, 0.5, 0.5, P.oak, { at: [x, 0, -8.2] });
      b.lathe([[0.3, 0], [0.3, 0.25], [0.2, 0.5], [0.01, 0.6]], P.thatch, { at: [x, 0.5, -8.2], segs: 8 });
    }
    if (zg > -7.6) {
      for (const x of spread(5, -3.2, 2.4)) b.box(0.5, 0.12, 8.8 + zg - 1.6, P.soil, { at: [x, 0, (zg - 8.8) / 2 + 0.3] });
    }
    b.group({ at: [4.8, 0, -7.4] }, () => {
      b.box(2.0, 0.9, 1.6, P.rubble);
      b.shed(2.2, 1.8, 0.4, P.thatchOld, { at: [0, 0.9, 0], high: '-z' });
    });
    // a paling along the street front
    paling(b, -6.6, 7.6, -1.0, 7.6, 1.0, P.oakSilver, 0.22);
    paling(b, 1.0, 7.6, 6.6, 7.6, 1.0, P.oakSilver, 0.22);
  },
};
