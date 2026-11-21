import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

/** A flat arched rib (half ring) of outer radius r and width t, in the XY plane, `depth` thick along Z. */
function archRib(b: Builder, r: number, t: number, depth: number, color: number, at: [number, number, number], segs = 10): void {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  for (let i = segs; i >= 0; i--) {
    const a = (i / segs) * Math.PI;
    pts.push([(r - t) * Math.cos(a), (r - t) * Math.sin(a)]);
  }
  b.extrude(pts, depth, color, { at });
}

export const crystalPalace: BuildingDef = {
  id: 'crystal-palace',
  name: 'Exhibition hall and winter garden',
  style: 'Victorian iron and glass',
  date: 'c. 1851',
  summary:
    "Joseph Paxton's Crystal Palace for the Great Exhibition of 1851 showed that a vast building could be bolted together from a kit of identical, " +
    'factory-made parts: cast-iron columns and girders on a fixed grid, timber glazing bars and hundreds of thousands of panes of sheet glass. ' +
    'This town hall of exhibitions and palms is a small relative, built on the same system. Where the assembly rooms were carved stone for a few subscribers, ' +
    'this is light, cheap and quick to build, made for crowds who came by railway to see machines, plants and wonders.',
  materials: ['cast iron', 'wrought iron', 'sheet glass', 'timber glazing bars', 'painted boarding'],
  modelledOn: 'The Crystal Palace, Hyde Park, London (Joseph Paxton, 1851)',
  lookFor: [
    { label: 'Barrel-vaulted transept', note: 'A glazed half-cylinder crossing the long nave. In Hyde Park it was added so that full-grown elm trees could stay inside.', at: [0, 17.2, 0] },
    { label: 'Fan-shaped end window', note: 'The semicircular end of the transept, its glazing bars radiating like the spokes of a wheel.', at: [0, 14, 11.3] },
    { label: 'Ridge-and-furrow roof', note: 'Glazing set in zigzags, a system Paxton worked out on greenhouses at Chatsworth to shed rain and catch low sun.', at: [-10, 7.3, 9] },
    { label: 'Modular bays', note: 'Every column, girder and pane repeats on one grid, so the parts could be mass-produced and assembled in months.', at: [-13.2, 3.6, 11.2] },
    { label: 'Cast-iron columns', note: 'Thin and hollow: the columns also served as drainpipes, carrying rain from the roof gutters.', at: [16.9, 2.4, -6] },
  ],
  influences: ['industrial-export'],
  build(b) {
    const glass = mix(P.glass, P.white, 0.15);
    const iron = mix(P.cladBlue, P.white, 0.45);
    const red = tint(P.postRed, 0.05);
    const board = mix(P.cladBlue, P.white, 0.7);
    const L = 33.6; // length of the nave (X)
    const mod = 2.4; // the grid
    const d1 = 22; // ground tier depth
    const h1 = 6.4;
    const d2 = 13; // upper tier depth
    const h2 = 11.8;
    const tw = 9.6; // transept width
    const G = { mat: 'glass' as const };

    // ---------------------------------------------------------------- the glass boxes
    b.box(L + 0.3, 0.35, d1 + 0.6, tint(P.paving, -0.05), { at: [0, 0, 0] });
    b.box(L, 1.0, d1, board, { at: [0, 0.35, 0] });
    b.box(L, h1 - 1.35, d1, glass, { at: [0, 1.35, 0], ...G });
    b.box(L, h2 - h1, d2, glass, { at: [0, h1, 0], ...G });
    // transept: rises through both tiers to the vault
    b.box(tw, h2 - h1, d1, glass, { at: [0, h1, 0], ...G });
    b.box(tw + 0.02, 1.0, d1 + 0.02, board, { at: [0, 0.35, 0] });

    // girders (horizontal bands) at each level, with the red under-stripe of Owen Jones's colours
    const band = (w: number, d: number, y: number, c = iron, h = 0.35) => b.box(w + 0.16, h, d + 0.16, c, { at: [0, y, 0], jitter: false });
    band(L, d1, 1.3, iron, 0.12);
    band(L, d1, h1 - 0.45);
    band(L, d1, h1 - 0.55, red, 0.1);
    band(L, d2, h2 - 0.45);
    band(L, d2, h2 - 0.55, red, 0.1);
    band(L, d2, h1 + 2.6, iron, 0.1);
    band(tw, d1, h2 - 0.45);
    band(tw, d1, h1 + 2.6, iron, 0.1);

    // columns and mullions on the module, on every face
    const ncol = Math.round(L / mod);
    for (let i = 0; i <= ncol; i++) {
      const x = -L / 2 + i * mod;
      for (const s of [1, -1]) {
        b.box(0.18, h1 - 0.35, 0.18, iron, { at: [x, 0.35, s * (d1 / 2 + 0.05)] });
        if (Math.abs(x) > tw / 2 + 0.1) b.box(0.15, h2 - h1, 0.15, iron, { at: [x, h1, s * (d2 / 2 + 0.05)] });
        if (i < ncol) b.box(0.05, h1 - 1.4, 0.06, P.white, { at: [x + mod / 2, 1.4, s * (d1 / 2 + 0.03)] });
      }
    }
    for (let j = 0; j <= Math.round(d1 / mod); j++) {
      const z = -d1 / 2 + (j * d1) / Math.round(d1 / mod);
      for (const s of [1, -1]) {
        b.box(0.18, h1 - 0.35, 0.18, iron, { at: [s * (L / 2 + 0.05), 0.35, z] });
        if (Math.abs(z) < d2 / 2 + 0.1) b.box(0.15, h2 - h1, 0.15, iron, { at: [s * (L / 2 + 0.05), h1, z] });
      }
    }
    // transept ends: columns rising through the upper tier
    for (const x of [-tw / 2, -tw / 4, 0, tw / 4, tw / 2]) {
      for (const s of [1, -1]) b.box(0.15, h2 - h1, 0.15, iron, { at: [x, h1, s * (d1 / 2 + 0.05)] });
    }

    // ---------------------------------------------------------------- ridge-and-furrow roofs
    const ridges = (x0: number, x1: number, z: number, d: number, y: number) => {
      const n = Math.max(1, Math.round((x1 - x0) / mod));
      const w = (x1 - x0) / n;
      for (let i = 0; i < n; i++) b.gable(w, d, 0.55, glass, { at: [x0 + (i + 0.5) * w, y, z], ridge: 'z', ...G });
    };
    const strip = (d1 - d2) / 2;
    for (const s of [1, -1]) {
      ridges(-L / 2, -tw / 2, s * (d2 / 2 + strip / 2), strip, h1);
      ridges(tw / 2, L / 2, s * (d2 / 2 + strip / 2), strip, h1);
    }
    ridges(-L / 2, -tw / 2, 0, d2, h2);
    ridges(tw / 2, L / 2, 0, d2, h2);

    // ---------------------------------------------------------------- the barrel-vaulted transept
    b.vault(tw + 0.1, d1 + 0.1, glass, { at: [0, h2, 0], segs: 16, ...G });
    for (let k = 0; k <= 8; k++) {
      const z = -d1 / 2 + (k * d1) / 8;
      archRib(b, tw / 2 + 0.12, 0.22, 0.16, iron, [0, h2, z], 12);
    }
    b.box(0.2, 0.2, d1 + 0.2, iron, { at: [0, h2 + tw / 2 - 0.02, 0] });
    // the fanlight ends: radiating bars and a hub
    for (const s of [1, -1]) {
      const z = s * (d1 / 2 + 0.1);
      for (let i = 1; i < 8; i++) {
        const a = (i / 8) * Math.PI;
        b.box(0.1, tw / 2 - 0.2, 0.08, P.white, { at: [0, h2, z], rot: [0, 0, a - Math.PI / 2], jitter: false });
      }
      archRib(b, 1.3, 0.16, 0.12, P.white, [0, h2, z], 6);
      archRib(b, 3.1, 0.12, 0.12, P.white, [0, h2, z], 10);
      b.box(tw, 0.25, 0.14, iron, { at: [0, h2 - 0.2, z] });
    }
    // flags along the ridge
    for (const [x, z, c] of [[0, 0, P.postRed], [-L / 2 + 0.4, d2 / 2, P.cladBlue], [L / 2 - 0.4, d2 / 2, P.cladBlue], [-L / 2 + 0.4, -d2 / 2, P.postRed], [L / 2 - 0.4, -d2 / 2, P.postRed]] as const) {
      const y = x === 0 ? h2 + tw / 2 : h2;
      b.cyl(0.05, 3.2, P.white, { at: [x, y, z], segs: 5 });
      b.box(1.4, 0.8, 0.03, c, { at: [x > 1 ? x - 0.72 : x + 0.72, y + 2.3, z] });
    }

    // ---------------------------------------------------------------- entrance and grounds
    const ez = d1 / 2;
    b.panel(3.6, 3.2, P.doorBlue, { at: [0, 0.35, ez], facing: '+z', depth: 0.1 });
    b.box(6.4, 0.25, 2.6, iron, { at: [0, 3.9, ez + 1.3] });
    b.sym((s) => b.cyl(0.1, 3.55, iron, { at: [s * 3.0, 0.35, ez + 2.4], segs: 6 }));
    b.box(6.2, 0.12, 2.4, glass, { at: [0, 4.15, ez + 1.2], ...G });
    b.box(8, 0.06, 3.4, P.gravel, { at: [0, 0, ez + 2.0] });
    // basin and fountain on the lawn
    b.sym((s) => {
      b.cyl(1.8, 0.45, P.portland, { at: [s * 9.5, 0, 13.0], segs: 12 });
      b.cyl(1.55, 0.05, P.water, { at: [s * 9.5, 0.42, 13.0], segs: 12, mat: 'glass' });
      b.lathe([[0.25, 0.4], [0.18, 1.2], [0.7, 1.4], [0.6, 1.55], [0.1, 1.7], [0.08, 2.3]], P.portland, { at: [s * 9.5, 0, 13.0], segs: 8 });
    });
    b.tree(6, { at: [-13.6, 0, 12.6], kind: 'round' });
    b.tree(6, { at: [13.6, 0, -12.6], kind: 'round' });

    b.collider(L + 0.6, d1 + 0.6);
  },
};
