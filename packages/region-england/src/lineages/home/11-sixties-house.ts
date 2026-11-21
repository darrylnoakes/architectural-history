import { P, tint, spread, type BuildingDef } from '@ah/kit';

export const sixtiesHouse: BuildingDef = {
  id: 'sixties-house',
  name: 'Modern private house',
  style: 'Post-war modern (Span)',
  date: 'c. 1962',
  summary:
    'Developers such as Span, with the architect Eric Lyons, set out to sell modern design to the middle classes: simple boxes with ' +
    'big windows, open-plan living rooms and shared, unfenced landscaping instead of walls and privet. The house is framed between ' +
    'brick cross walls, the walls between them are filled with glass, timber boarding and a band of clay tile-hanging, and the roof ' +
    'is a shallow single slope. The garage has shrunk to an open carport, and the mock-Tudor of the semi has gone entirely.',
  materials: ['buff brick cross walls', 'clay tile-hanging', 'western red cedar boarding', 'large timber-framed windows', 'felted roof'],
  lookFor: [
    {
      label: 'Picture window',
      note: 'A single great sheet of glass, floor to ceiling, to the open-plan living room; plate glass had become cheap.',
      at: [-1.4, 1.3, 3.6],
    },
    {
      label: 'Tile-hanging',
      note: 'Clay tiles hung on battens over the upper floor, a traditional south-eastern finish used in a crisp modern way.',
      at: [-1.0, 4.2, 3.55],
    },
    {
      label: 'Brick cross walls',
      note: 'The side walls carry the floors and roof and stand a little proud of the front; everything between them is light infill.',
      at: [-4.45, 3.2, 3.7],
    },
    {
      label: 'Mono-pitch roof',
      note: 'A single shallow slope behind a thin timber fascia, in place of the steep tiled roofs of the 1930s.',
      at: [0, 5.75, 3.7],
    },
    {
      label: 'Carport',
      note: 'A flat roof on slender steel posts: shelter for the car without the cost of a garage.',
      at: [5.3, 2.4, 3.2],
    },
  ],
  influences: ['continental-modernism'],
  build(b) {
    const W = 8.4;
    const D = 7.6;
    const x0 = -1.2;
    const zf = 3.4;
    const zb = zf - D;
    const zc = zf - D / 2;
    const g1 = 2.65;
    const Hf = 5.55; // front wall top
    const Hb = 4.9; // back wall top
    const brick = b.pick([P.brickBuff, tint(P.brickBuff, -0.05), P.brickYellow]);
    const hang = b.pick([P.tileBrown, tint(P.tileRed, -0.08), 0x7a4a36]);
    const cedar = P.cedar;
    const glass = P.glassDark;
    const accent = b.pick([P.cladYellow, P.cladBlue, P.doorRed, P.white]);

    // the infill box between the cross walls
    b.box(W - 0.6, Hb, D - 0.2, P.white, { at: [x0, 0, zc] });
    // cross walls of brick, standing proud front and back, following the roof slope
    b.sym((s) => {
      const x = x0 + s * (W / 2 - 0.15);
      b.extrude(
        [
          [zb - 0.25, 0],
          [zf + 0.3, 0],
          [zf + 0.3, Hf],
          [zb - 0.25, Hb],
        ].map(([z, y]) => [-z, y] as [number, number]),
        0.3,
        brick,
        { at: [x, 0, 0], rotY: Math.PI / 2 },
      );
    });
    // roof slab, sloping gently down to the back, with a deep timber fascia
    const pitch = Math.atan2(Hf - Hb, D + 0.55);
    b.group({ at: [x0, (Hf + Hb) / 2, zc + 0.03], rot: [-pitch, 0, 0] }, () => {
      b.box(W + 0.3, 0.22, D + 1.0, P.asphalt, { at: [0, 0, 0] });
      b.box(W + 0.34, 0.3, 0.06, P.white, { at: [0, -0.04, (D + 1.0) / 2] });
      b.box(W + 0.34, 0.3, 0.06, P.white, { at: [0, -0.04, -(D + 1.0) / 2] });
    });

    // front: ground floor picture window + cedar panel + door; upper floor tile-hung band with a ribbon window
    const fz = zf;
    const inner = W - 0.6;
    b.window(3.6, 2.35, { at: [x0 - 1.4, 0.15, fz], facing: '+z', frame: P.white, glass, bars: [2, 1], mat: 'glass', border: 0.07 });
    b.panel(1.6, 2.4, cedar, { at: [x0 + 1.4, 0.1, fz], facing: '+z' });
    for (const x of spread(7, x0 + 0.7, x0 + 2.1)) b.panel(0.03, 2.4, tint(cedar, -0.12), { at: [x, 0.1, fz + 0.03], facing: '+z' });
    b.panel(0.95, 2.1, accent, { at: [x0 + 2.85, 0.1, fz], facing: '+z' });
    b.panel(0.3, 2.1, glass, { at: [x0 + 3.5, 0.1, fz], facing: '+z' });
    b.box(1.8, 0.08, 1.1, P.white, { at: [x0 + 3.0, 2.45, fz + 0.55] }); // flat door canopy
    // tile-hung upper storey
    b.panel(inner, Hf - g1 - 0.1, hang, { at: [x0, g1, fz], facing: '+z', depth: 0.08 });
    for (let y = g1 + 0.15; y < Hf - 0.2; y += 0.16) b.panel(inner, 0.025, tint(hang, -0.12), { at: [x0, y, fz + 0.08], facing: '+z', depth: 0.02 });
    b.window(5.6, 1.15, { at: [x0 - 0.2, g1 + 0.95, fz + 0.06], facing: '+z', frame: P.white, glass, bars: [4, 1], mat: 'glass', border: 0.07 });
    b.box(inner, 0.08, 0.35, P.white, { at: [x0, g1 - 0.08, fz + 0.15] });

    // back: full-height glazed living room opening to the garden, more tile-hanging
    b.window(4.8, 2.4, { at: [x0 - 0.8, 0.1, zb + 0.1], facing: '-z', frame: P.white, glass, bars: [3, 1], mat: 'glass', border: 0.07 });
    b.panel(inner, Hb - g1 - 0.1, hang, { at: [x0, g1, zb + 0.1], facing: '-z', depth: 0.08 });
    b.window(3.0, 1.1, { at: [x0 + 1.2, g1 + 0.8, zb + 0.02], facing: '-z', frame: P.white, glass, bars: [2, 1], border: 0.07 });
    b.box(W + 0.6, 0.12, 2.4, P.paving, { at: [x0, 0, zb - 1.3] }); // patio
    // side windows are few: the cross walls are blank by design
    b.window(0.6, 1.0, { at: [x0 + W / 2 + 0.01, 3.4, zc + 1.0], facing: '+x', frame: P.white, glass });

    // carport on the right
    const cx = x0 + W / 2 + 1.65;
    const cD = 5.6;
    const cz = zf + 0.5 - cD / 2;
    for (const z of [cz - cD / 2 + 0.2, cz + cD / 2 - 0.2]) b.box(0.1, 2.35, 0.1, P.steel, { at: [cx + 1.1, 0, z] });
    b.box(2.9, 0.2, cD, P.white, { at: [cx - 0.05, 2.35, cz] });
    b.box(2.9, 0.06, cD, P.asphalt, { at: [cx - 0.05, 2.55, cz] });
    b.box(2.6, 0.04, 8.9 - (cz + cD / 2), P.concrete, { at: [cx, 0, (cz + cD / 2 + 8.9) / 2], jitter: false });
    b.box(2.6, 0.03, cD, P.concrete, { at: [cx, 0, cz], jitter: false });
    // a small saloon in the carport
    b.group({ at: [cx, 0, cz + 0.3] }, () => {
      const body = b.pick([0x9fb8c8, 0xd9cfa8, 0x8c3a32, 0x6e8a6a]);
      b.box(1.55, 0.55, 3.9, body, { at: [0, 0.3, 0] });
      b.box(1.35, 0.45, 1.9, body, { at: [0, 0.85, -0.2] });
      b.panel(1.2, 0.35, glass, { at: [0, 0.9, 0.76], facing: '+z' });
      b.panel(1.2, 0.35, glass, { at: [0, 0.9, -1.16], facing: '-z' });
      b.sym((s) => {
        b.panel(1.6, 0.35, glass, { at: [s * 0.68, 0.9, -0.2], facing: s > 0 ? '+x' : '-x' });
        for (const z of [-1.25, 1.25]) b.log(0.3, 0.2, P.black, { at: [s * 0.72, 0, z], segs: 8 });
      });
    });

    // open-plan front: lawn running to the pavement, no wall, a birch and a few shrubs
    b.box(W + 1.6, 0.04, 8.9 - zf - 0.3, P.grass, { at: [x0 - 0.8, 0, (8.9 + zf + 0.3) / 2], jitter: false });
    b.box(1.2, 0.05, 8.9 - zf - 0.3, P.paving, { at: [x0 + 2.85, 0, (8.9 + zf + 0.3) / 2], jitter: false });
    b.tree(b.range(5.5, 7), { at: [x0 - 3.6, 0, 6.8], kind: 'poplar', color: P.leaf });
    b.tree(1.2, { at: [x0 - 0.8, 0, 4.4], kind: 'bush', color: P.leafDark });
    b.tree(1.0, { at: [x0 + 0.9, 0, 4.3], kind: 'bush', color: P.hedge });
    // back garden
    b.tree(b.range(4, 5), { at: [-4.6, 0, -7.4] });
    b.box(13.6, 1.5, 0.08, P.cedar, { at: [0, 0, -8.9] });
  },
};
