import { P, tint, type BuildingDef } from '@ah/kit';
import { onFace } from './shared';

export const rationalistVilla: BuildingDef = {
  id: 'rationalist-villa',
  name: 'Rationalist villa',
  style: 'Rationalism (Italian Modern Movement)',
  date: 'c. 1936',
  summary:
    'A young professional couple commission a house from a Rationalist architect, the Italian wing of the Modern Movement inspired by Le Corbusier and the Bauhaus. ' +
    'Everything decorative has gone: the house is a white box of reinforced concrete lifted on thin columns, with long strip windows, a flat roof and a roof garden framed by an open concrete grid. ' +
    'The garden runs on underneath it. Rationalists argued that this clarity continued the Mediterranean and classical tradition rather than breaking with it.',
  materials: ['reinforced concrete frame', 'white render', 'steel windows', 'glass', 'terrazzo'],
  modelledOn: 'Luigi Figini’s own house, Villaggio dei Giornalisti, Milan (1934 to 1935)',
  influences: ['rationalism'],
  lookFor: [
    { label: 'Thin columns (pilotis)', note: 'The house stands on slender concrete columns, leaving the ground free for the garden.', at: [-4.5, 1.6, 4.6] },
    { label: 'Strip windows', note: 'Long horizontal bands of window, possible because the walls no longer carry the floors.', at: [0, 4.6, 4.6] },
    { label: 'Roof garden in a concrete frame', note: 'The flat roof is a terrace with planting, framed by an open grid of concrete beams.', at: [2.0, 8.4, 2.0] },
    { label: 'Flat roof and white render', note: 'No pitched roof, no cornice, no ornament: smooth white surfaces and sharp edges.', at: [-6.4, 6.4, -2.0] },
  ],
  build(b) {
    const white = b.pick([P.whiteRender, P.cladWhite, tint(P.whiteRender, -0.03)]);
    const frame = P.steel;
    const accent = b.pick([P.cladRed, P.cladBlue, P.doorYellow]);
    const y0 = 3.0;
    const h = 3.4;
    const W = 13;
    const D = 6.5;
    const zc = 1.25;
    const zf = zc + D / 2;

    b.box(23, 0.03, 25, P.grass, { at: [0, 0, 0] });
    // the raised box on its columns
    for (const x of [-6.0, -2.0, 2.0, 6.0]) {
      for (const z of [zc - 2.9, zc, zc + 2.9]) b.cyl(0.13, y0, P.concreteWhite, { at: [x, 0, z], segs: 8 });
    }
    b.box(W, 0.35, D, white, { at: [0, y0, zc] });
    b.box(W, h, D, white, { at: [0, y0 + 0.35, zc] });
    b.box(W + 0.1, 0.15, D + 0.1, white, { at: [0, y0 + 0.35 + h, zc] });
    b.collider(1.2, 1.2, { at: [5.2, 0, -1.0] });
    // strip windows
    const strip = (f: '+z' | '-z', z: number) =>
      onFace(b, f, [0, 0, z], () => {
        b.box(W - 1.4, 1.5, 0.06, P.glassDark, { at: [0, y0 + 1.3, 0.03], mat: 'glass' });
        for (let i = 0; i <= 10; i++) b.box(0.06, 1.5, 0.1, frame, { at: [-(W - 1.4) / 2 + i * ((W - 1.4) / 10), y0 + 1.3, 0.05] });
        b.box(W - 1.4, 0.06, 0.1, frame, { at: [0, y0 + 2.8, 0.05] });
      });
    strip('+z', zf);
    strip('-z', zc - D / 2);
    onFace(b, '+x', [W / 2, 0, zc], () => {
      b.box(1.0, 2.2, 0.06, accent, { at: [0.6, y0 + 0.35, 0.03] });
      b.box(2.0, 1.0, 0.06, P.glassDark, { at: [-1.8, y0 + 1.8, 0.03], mat: 'glass' });
    });
    onFace(b, '-x', [-W / 2, 0, zc], () => b.box(4.0, 1.0, 0.06, P.glassDark, { at: [0, y0 + 1.8, 0.03], mat: 'glass' }));
    // the outside stair up to the door, with a thin tube rail
    b.stairs(1.2, y0 + 0.35, 4.4, 14, P.concreteWhite, { at: [7.2, 0, zc + 2.8] });
    b.box(1.3, 0.2, 1.4, P.concreteWhite, { at: [7.2, y0 + 0.15, zc + 0.0] });
    b.beam([7.85, 1.0, zc + 5.0], [7.85, y0 + 1.35, zc + 0.6], 0.05, 0.05, frame);
    b.collider(1.3, 5.8, { at: [7.2, 0, zc + 2.3] });
    // a cantilevered terrace off the living room
    b.box(4.0, 0.2, 2.2, white, { at: [-3.5, y0, zf + 1.1] });
    b.box(4.0, 1.0, 0.08, white, { at: [-3.5, y0 + 0.2, zf + 2.16] });
    b.beam([-5.5, y0 + 1.2, zf + 2.16], [-1.5, y0 + 1.2, zf + 2.16], 0.04, 0.04, frame);

    // the roof garden: parapet, planting, and the open concrete frame round it
    const ry = y0 + 0.5 + h;
    b.box(W, 1.0, 0.15, white, { at: [0, ry, zf - 0.08] });
    b.box(W, 1.0, 0.15, white, { at: [0, ry, zc - D / 2 + 0.08] });
    b.box(4.0, 2.6, D - 0.3, white, { at: [-4.3, ry, zc] }); // stair head and roof room
    b.box(1.6, 2.0, 0.06, P.glassDark, { at: [-2.3, ry + 0.2, zc + 1.0], rotY: Math.PI / 2, mat: 'glass' });
    for (const x of [-6.35, 6.35]) for (const z of [zf - 0.15, zc - D / 2 + 0.15]) b.box(0.25, 3.0, 0.25, white, { at: [x, ry, z] });
    for (const x of [-2.2, 2.2]) for (const z of [zf - 0.15, zc - D / 2 + 0.15]) b.box(0.2, 3.0, 0.2, white, { at: [x, ry, z] });
    b.box(W, 0.3, 0.3, white, { at: [0, ry + 3.0, zf - 0.15] });
    b.box(W, 0.3, 0.3, white, { at: [0, ry + 3.0, zc - D / 2 + 0.15] });
    for (const x of [-6.35, -2.2, 2.2, 6.35]) b.box(0.3, 0.3, D, white, { at: [x, ry + 3.0, zc] });
    b.box(7.6, 0.4, 1.2, tint(P.concrete, 0.05), { at: [2.3, ry, zc + 1.6] });
    for (const x of [0.3, 2.2, 4.1]) b.blob(0.55, P.hedge, { at: [x, ry + 0.7, zc + 1.6], stretch: [1.2, 0.8, 1] });
    b.tree(2.6, { kind: 'bush', at: [5.4, ry, zc - 1.6] });

    // ---- the garden: lawn under and around the house, a path, a low wall
    b.box(1.6, 0.05, 6.5, P.paving, { at: [7.2, 0, 9.0] });
    b.box(23, 0.9, 0.3, white, { at: [0, 0, 12.2] });
    b.box(9, 0.04, 4, P.paving, { at: [-2.5, 0, zc] });
    b.tree(8, { kind: 'pine', at: [-8.5, 0, 8.5] });
    b.tree(6, { kind: 'round', at: [8.5, 0, -8.5] });
    b.tree(6, { kind: 'cypress', at: [-9.5, 0, -9.0] });
    b.tree(5, { kind: 'olive', at: [-2.0, 0, -8.0] });
  },
};
