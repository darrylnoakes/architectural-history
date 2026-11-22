import { P, tint, type BuildingDef } from '@ah/kit';
import { vegBed } from './shared';

export const ecoHouse: BuildingDef = {
  id: 'eco-house',
  name: 'Low-energy house in an écoquartier',
  style: 'Contemporary',
  date: 'c. 2014',
  summary:
    'In the 2000s French towns began to build écoquartiers, new neighbourhoods planned to save energy, often on old railway or factory land close to the centre, and from 2013 the building regulations (the RT 2012, followed by the RE 2020 in 2022) required every new house to use very little energy for heating. ' +
    'This one is a timber frame packed with insulation and clad in untreated larch, under a single-pitch roof turned to the sun and covered in solar panels. ' +
    'Its big south windows sit in deep reveals with sliding shutters of timber slats to keep out the summer sun. Cars stay at the edge of the quarter; the gardens behind run together into a shared garden of vegetable beds and compost bins.',
  materials: ['timber frame with thick insulation', 'larch cladding', 'high-performance glazing', 'photovoltaic panels', 'steel standing-seam roof'],
  lookFor: [
    {
      label: 'Solar panels',
      note: 'The single roof slope faces south and carries photovoltaic panels; over a year the house can make about as much electricity as it uses.',
      at: [-1.6, 7.3, 3.0],
    },
    {
      label: 'Timber cladding',
      note: 'Vertical boards of larch, left to weather to silver-grey, over a timber frame filled with insulation.',
      at: [-5.9, 4.2, 6.05],
    },
    {
      label: 'Sliding shutters',
      note: 'Panels of timber slats slide along rails in front of the windows: shade in summer without blocking the low winter sun.',
      at: [0.4, 4.6, 6.4],
    },
    {
      label: 'Deep south windows',
      note: 'Large windows set in deep frames let in the low winter sun, which warms the house for free.',
      at: [-2.6, 1.5, 6.3],
    },
    {
      label: 'Shared garden',
      note: 'Behind the houses the gardens are not fenced off: raised vegetable beds, compost bins and a bench are shared by the neighbours.',
      at: [-3.6, 0.8, -6.0],
    },
  ],
  build(b) {
    const larch = tint(b.pick([P.larch, P.oakSilver, tint(P.larch, -0.06), P.cedar]), b.range(-0.03, 0.03));
    const frame = b.pick([P.cladGrey, P.iron, P.aluminium]);
    const accent = b.pick([P.cladWhite, P.cladGrey, P.concreteWhite]);
    const xc = -1.4;
    const W = 9.8;
    const zF = 6.0;
    const zB = -2.6;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const H = 5.8; // front eaves
    const rise = 2.6;

    b.box(13.6, 0.03, 17.6, P.grass, { at: [0, 0, 0], jitter: false });
    // the house: a plinth, the clad box, board lines
    b.box(W + 0.1, 0.35, D + 0.1, P.concrete, { at: [xc, 0, zc] });
    b.box(W, H, D, larch, { at: [xc, 0.35, zc] });
    b.shed(W, D, rise, larch, { at: [xc, H + 0.35, zc], high: '-z' });
    for (let x = -W / 2 + 0.3; x < W / 2; x += 0.3) b.box(0.03, H, 0.03, tint(larch, -0.08), { at: [xc + x, 0.35, zF + 0.01], jitter: false });
    for (let z = zB + 0.35; z < zF; z += 0.35) b.box(0.03, H, 0.03, tint(larch, -0.08), { at: [xc - W / 2 - 0.01, 0.35, z], jitter: false });
    for (let x = -W / 2 + 0.3; x < W / 2; x += 0.35) b.box(0.03, H, 0.03, tint(larch, -0.08), { at: [xc + x, 0.35, zB - 0.01], jitter: false });
    // a rendered panel on one part of the front
    b.box(2.4, H, 0.08, accent, { at: [xc + W / 2 - 1.2, 0.35, zF + 0.03] });
    // roof: a thin steel sheet over the slope, with a fascia
    const slope = Math.atan2(rise, D);
    b.group({ at: [xc, H + 0.35 + rise / 2 + 0.06, zc], rot: [slope, 0, 0] }, () => {
      b.box(W + 0.6, 0.08, Math.hypot(D, rise) + 0.9, frame, { at: [0, 0, 0.1] });
      // solar panels in rows
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
          b.box(1.65, 0.06, 1.05, P.solar, { at: [-3.5 + j * 1.75, 0.08, -1.73 + i * 1.15], mat: 'glass' });
        }
      }
    });

    // front: deep framed openings and sliding shutters on a rail
    const box = (x: number, y: number, w: number, h: number) => {
      b.box(w + 0.24, 0.12, 0.45, frame, { at: [x, y + h, zF + 0.2] });
      b.box(w + 0.24, 0.12, 0.45, frame, { at: [x, y - 0.12, zF + 0.2] });
      for (const s of [1, -1]) b.box(0.12, h, 0.45, frame, { at: [x + s * (w / 2 + 0.06), y, zF + 0.2] });
      b.window(w, h, { at: [x, y, zF + 0.01], facing: '+z', frame, glass: P.glassDark, bars: [Math.max(1, Math.round(w / 1.2)), 1], mat: 'glass', border: 0.06 });
    };
    box(xc - 1.2, 0.35, 3.6, 2.4); // sliding glass doors to the front garden
    box(xc - 3.9, 1.0, 1.0, 1.75);
    box(xc - 2.6, 3.5, 1.4, 2.0);
    box(xc + 0.2, 3.5, 1.4, 2.0);
    box(xc + W / 2 - 1.2, 0.35, 1.1, 2.3); // the front door
    b.panel(0.9, 2.15, b.pick([P.cladYellow, P.cladGreen, P.cladBlue, P.cladRed]), { at: [xc + W / 2 - 1.2, 0.38, zF + 0.06], facing: '+z', depth: 0.08 });
    // sliding shutters of slats: one drawn across a first-floor window, the others parked
    b.box(W - 2.6, 0.08, 0.08, frame, { at: [xc - 1.2, 5.65, zF + 0.5] });
    const slats = (x: number, y: number, w: number, h: number) => {
      b.box(w, h, 0.04, tint(larch, -0.04), { at: [x, y, zF + 0.46] });
      for (let k = 0; k < Math.round(w / 0.12); k++) b.box(0.06, h, 0.04, tint(larch, 0.06), { at: [x - w / 2 + 0.06 + k * 0.12, y, zF + 0.5], jitter: false });
    };
    slats(xc + 1.8, 3.5, 1.5, 2.15);
    slats(xc - 2.6 + (b.pick([0, 0.6, 1.2])), 3.5, 1.5, 2.15);
    // ground floor shutters parked beside the big window
    b.box(W - 2.6, 0.08, 0.08, frame, { at: [xc - 1.2, 2.95, zF + 0.5] });
    slats(xc + 1.5, 0.4, 1.6, 2.5);

    // back: windows, a door to the shared garden
    for (const [x, y, w, h] of [[-3.0, 0.9, 1.4, 1.6], [0.6, 0.35, 1.0, 2.2], [2.8, 0.9, 1.2, 1.4], [-2.4, 3.6, 1.2, 1.4], [1.6, 3.6, 1.2, 1.4]] as [number, number, number, number][]) {
      b.window(w, h, { at: [xc + x, y, zB - 0.01], facing: '-z', frame, glass: P.glassDark, bars: [1, 1], mat: 'glass', border: 0.06 });
    }
    // a heat pump unit and a rainwater tank
    b.box(0.9, 0.7, 0.4, P.cladWhite, { at: [xc + 3.4, 0.0, zB - 0.4] });
    b.cyl(0.32, 0.05, P.cladGrey, { at: [xc + 3.2, 0.35, zB - 0.62], rot: [Math.PI / 2, 0, 0], segs: 10 });
    b.cyl(0.5, 1.2, P.cladGreen, { at: [xc - W / 2 + 0.6, 0, zB - 0.6], segs: 10 });

    // front garden: a path, low planting, no fence; a bicycle shelter with a green roof
    b.box(1.2, 0.04, 2.6, P.paving, { at: [xc + W / 2 - 1.2, 0, 7.4], jitter: false });
    b.box(3.2, 0.04, 2.0, P.gravel, { at: [xc - 1.2, 0, 7.2], jitter: false });
    for (let i = 0; i < 7; i++) b.blob(0.32, b.pick([P.leaf, P.grassDry, P.hedge, 0x8a7aa8]), { at: [-6.2 + i * 0.4, 0.25, 7.4 + (i % 2) * 0.5], detail: 0 });
    const bx = 5.4;
    b.box(2.2, 0.04, 4.0, P.paving, { at: [bx, 0, 5.0], jitter: false });
    for (const [x, z] of [[-0.95, -1.6], [0.95, -1.6], [-0.95, 1.6], [0.95, 1.6]]) b.box(0.1, 2.1, 0.1, larch, { at: [bx + x, 0, 5.0 + z] });
    b.box(2.2, 0.25, 3.6, larch, { at: [bx, 2.1, 5.0] });
    b.box(2.1, 0.1, 3.5, P.grassDry, { at: [bx, 2.35, 5.0] });
    for (let i = 0; i < 3; i++) {
      b.group({ at: [bx - 0.5 + i * 0.5, 0, 5.0], rotY: Math.PI / 2 }, () => {
        b.log(0.33, 0.04, P.black, { at: [-0.55, 0, 0], axis: 'z', segs: 10 });
        b.log(0.33, 0.04, P.black, { at: [0.55, 0, 0], axis: 'z', segs: 10 });
        b.beam([-0.55, 0.33, 0], [0.55, 0.33, 0], 0.04, 0.04, b.pick([P.cladRed, P.cladBlue, P.cladYellow]));
      });
    }

    // the shared garden behind: raised beds, compost bins, a bench, a tree, paths
    b.box(1.0, 0.04, 6.0, P.gravel, { at: [xc + 2.0, 0, -5.8], jitter: false });
    b.box(13.6, 0.04, 1.0, P.gravel, { at: [0, 0, -5.4], jitter: false });
    for (const [x, z] of [[-4.9, -7.3], [-2.4, -7.3], [-4.9, -3.9], [-2.4, -3.9]]) {
      b.box(2.0, 0.45, 1.6, larch, { at: [x, 0, z] });
      b.group({ at: [0, 0.4, 0] }, () => vegBed(b, x, z, 1.8, 1.4, { rows: 3, color: P.leaf }));
    }
    for (let i = 0; i < 3; i++) b.box(0.9, 0.9, 0.9, tint(larch, -0.08), { at: [4.2 + i * 0.95, 0, -8.2] });
    b.box(1.6, 0.45, 0.45, larch, { at: [3.6, 0, -6.2] });
    b.box(1.6, 0.5, 0.06, larch, { at: [3.6, 0.45, -6.42] });
    b.tree(b.range(4.2, 4.8), { at: [4.9, 0, -3.8], kind: 'round', color: P.leaf });
    b.tree(b.range(2.5, 3.0), { at: [-5.6, 0, -5.6], kind: 'round', color: P.leafAutumn });
  },
};
