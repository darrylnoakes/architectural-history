import { P, tint, spread, type BuildingDef } from '@ah/kit';

export const ecoHouse: BuildingDef = {
  id: 'eco-house',
  name: 'Low-energy house',
  style: 'Contemporary sustainable',
  date: 'c. 2012',
  summary:
    'Climate change and rising fuel bills made energy the new driver of house design. Thick insulated timber-framed walls, airtight ' +
    'construction and triple glazing cut heat loss so far, in the manner of the German Passivhaus standard, that the house needs no ' +
    'chimney and no gas boiler: a small heat pump outside does the heating. The roof is lopsided so that its long slope faces the sun ' +
    'and carries solar panels, and the outside is clad in untreated larch boards that weather to silver-grey.',
  materials: ['vertical larch cladding', 'standing-seam zinc', 'insulated timber frame', 'triple-glazed windows', 'photovoltaic panels'],
  lookFor: [
    {
      label: 'Solar panels',
      note: 'Photovoltaic panels on the long, sun-facing slope of the roof make electricity for the house and its heat pump.',
      at: [-0.6, 7.2, 0.9],
    },
    {
      label: 'Asymmetric roof',
      note: 'The ridge is pushed towards the back, giving one long shallow slope for the panels and one short steep one.',
      at: [4.75, 8.15, -1.6],
    },
    {
      label: 'Timber cladding',
      note: 'Vertical boards of untreated larch, a renewable material that needs no paint and turns silver as it weathers.',
      at: [2.5, 1.6, 3.45],
    },
    {
      label: 'Triple-glazed windows',
      note: 'Tall windows set deep in thick insulated walls, with three panes of glass and dark, slim frames.',
      at: [-2.9, 2.6, 3.5],
    },
    {
      label: 'Air-source heat pump',
      note: 'The box with the fan takes warmth out of the outside air, even in winter, to heat the house and its water.',
      at: [5.2, 1.2, 0.8],
    },
  ],
  influences: ['passivhaus'],
  build(b) {
    const W = b.pick([9.0, 9.4]);
    const D = 7.0;
    const zf = 3.4;
    const zb = zf - D;
    const zc = zf - D / 2;
    const Hw = 5.6;
    const ridgeZ = zb + 2.0; // ridge pushed to the back
    const R = 2.4;
    const larch = b.pick([P.larch, tint(P.larch, 0.05), tint(P.oakSilver, 0.02)]);
    const frame = P.cladGrey;
    const glass = P.glassDark;
    const zinc = P.zinc;

    // the box
    b.box(W, Hw, D, larch, { at: [0, 0, zc] });
    b.box(W + 0.04, 0.3, D + 0.04, P.concreteDark, { at: [0, 0, zc] });
    // a rendered block on one side, for contrast
    b.box(3.2, Hw - 0.3, D + 0.06, P.whiteRender, { at: [-W / 2 + 1.6, 0.3, zc] });

    // asymmetric roof: gable walls of larch, zinc skin, ridge set toward the back
    const ov = 0.3;
    const prof = (y0: number, t: number): [number, number][] => [
      [-(zf + ov), y0 - (ov * R) / (zf - ridgeZ)],
      [-ridgeZ, y0 + R],
      [-(zb - ov), y0 - (ov * R) / (ridgeZ - zb)],
      [-(zb - ov), y0 - (ov * R) / (ridgeZ - zb) + t],
      [-ridgeZ, y0 + R + t],
      [-(zf + ov), y0 - (ov * R) / (zf - ridgeZ) + t],
    ];
    b.extrude(
      [
        [-zf, 0],
        [-ridgeZ, R],
        [-zb, 0],
      ],
      W,
      larch,
      { at: [0, Hw, 0], rotY: Math.PI / 2 },
    );
    b.extrude(prof(0, 0.16), W + 0.3, zinc, { at: [0, Hw, 0], rotY: Math.PI / 2 });
    // standing seams
    const kf = R / (zf - ridgeZ);
    for (const x of spread(14, -W / 2, W / 2)) {
      b.group({ at: [x, Hw + 0.16 + R / 2 - (ov * kf) / 2, (zf + ov + ridgeZ) / 2], rot: [Math.atan(kf), 0, 0] }, () =>
        b.box(0.04, 0.05, Math.hypot(zf + ov - ridgeZ, R + ov * kf), tint(zinc, -0.05), { at: [0, -0.02, 0] }),
      );
    }
    // photovoltaic array on the long south slope
    const slopeLen = Math.hypot(zf - ridgeZ, R);
    b.group({ at: [-0.6, Hw + 0.2 + R * 0.5, (zf + ridgeZ) / 2], rot: [Math.atan(kf), 0, 0] }, () => {
      const cols = 6;
      const rows = 3;
      const pw = 1.0;
      const ph = (slopeLen - 1.2) / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          b.box(pw - 0.05, 0.05, ph - 0.05, P.solar, { at: [(i - (cols - 1) / 2) * pw, 0.0, (j - (rows - 1) / 2) * ph], mat: 'glass' });
        }
      }
    });

    // vertical board lines on the larch faces
    for (const x of spread(Math.round(W / 0.3), -W / 2 + 3.3, W / 2 - 0.1)) {
      b.box(0.025, Hw - 0.35, 0.02, tint(larch, -0.12), { at: [x, 0.32, zf + 0.01] });
      b.box(0.025, Hw - 0.35, 0.02, tint(larch, -0.12), { at: [x, 0.32, zb - 0.01] });
    }

    // deep-set triple-glazed windows: tall and narrow, with grey frames and a deep reveal
    const win = (x: number, y: number, w: number, h: number, z: number, f: '+z' | '-z' | '+x' | '-x') => {
      b.panel(w + 0.24, h + 0.24, tint(P.cladGrey, -0.1), { at: [x, y - 0.12, z], facing: f, depth: 0.03 });
      b.window(w, h, { at: [x, y, z], facing: f, frame, glass, mat: 'glass', border: 0.06 });
    };
    // front: a full-height glazed slot to the stair in the render block, tall windows in the larch
    win(-W / 2 + 1.6, 0.4, 1.2, 4.7, zf + 0.03, '+z');
    win(-0.6, 0.4, 1.4, 2.3, zf, '+z');
    win(1.6, 0.4, 1.0, 2.3, zf, '+z');
    for (const x of [-0.6, 1.6, 3.4]) win(x, 3.3, 0.9, 1.9, zf, '+z');
    // door with a deep timber canopy
    b.panel(1.1, 2.3, P.cladGrey, { at: [3.4, 0.3, zf], facing: '+z' });
    b.box(1.8, 0.12, 1.2, larch, { at: [3.4, 2.75, zf + 0.6] });
    b.box(1.6, 0.15, 1.0, P.concrete, { at: [3.4, 0, zf + 0.5] });
    // back: big glazing to the garden, set under a deep overhang
    win(0.6, 0.35, 3.8, 2.4, zb, '-z');
    win(-2.9, 3.3, 1.0, 1.6, zb - 0.03, '-z');
    win(2.4, 3.3, 1.0, 1.6, zb, '-z');
    // sides
    win(W / 2, 3.4, 0.9, 1.6, zc + 1.4, '+x');
    win(-W / 2, 1.0, 0.8, 1.6, zc, '-x');

    // heat pump on the side, rainwater butt, bike store with a sedum roof
    b.group({ at: [W / 2 + 0.45, 0, zc + 0.9] }, () => {
      b.box(0.8, 0.12, 1.1, P.concrete);
      b.box(0.4, 0.85, 1.0, P.white, { at: [0, 0.12, 0] });
      b.panel(0.62, 0.62, tint(P.cladGrey, -0.05), { at: [0, 0.22, 0], facing: '+x', shape: 'circle', rotY: 0 });
    });
    b.panel(0.62, 0.62, P.castIron, { at: [W / 2 + 0.66, 0.26, zc + 0.9], facing: '+x', shape: 'circle' });
    b.cyl(0.35, 1.0, P.cladGreen, { at: [-W / 2 - 0.45, 0, zb + 0.8], segs: 10 });
    b.box(0.08, Hw, 0.08, P.zinc, { at: [-W / 2 - 0.08, 0.95, zb + 0.4] }); // downpipe
    b.group({ at: [-5.0, 0, 6.4] }, () => {
      b.box(2.4, 1.6, 1.2, larch);
      b.box(2.5, 0.15, 1.3, P.cladGreen, { at: [0, 1.6, 0] });
      b.box(2.4, 0.05, 1.2, 0x8aa05a, { at: [0, 1.75, 0] });
    });
    // garden: permeable gravel drive, native hedge, raised beds behind
    b.box(3.2, 0.03, 8.9 - zf, P.gravel, { at: [3.4, 0, (8.9 + zf) / 2], jitter: false });
    b.box(4.2, 0.8, 0.7, P.hedge, { at: [-1.2, 0, 8.4] });
    for (const x of [-4.4, -2.2, 0]) {
      b.box(1.6, 0.4, 3.0, P.larch, { at: [x, 0, -7.0] });
      b.box(1.5, 0.05, 2.9, P.soil, { at: [x, 0.38, -7.0] });
    }
    b.tree(b.range(4, 5.5), { at: [4.6, 0, -7.4] });
    b.box(13.6, 1.6, 0.08, P.larch, { at: [0, 0, -8.9] });
  },
};
