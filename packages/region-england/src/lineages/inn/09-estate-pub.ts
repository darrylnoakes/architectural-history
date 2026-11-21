import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bayLines, car, ground } from './shared';

// the 1968 shell, reused by the 2012 rebuild
export const BAR = { x0: -10, x1: 5.6, z0: -9.2, z1: -1.2, h: 3.6 };
export const FLAT = { x0: 5.6, x1: 10.4, z0: -10.4, z1: -2.4, h: 6.4 };

/** The brick volumes of the estate pub: a single-storey bar block and a two-storey manager's flat. */
export function estateShell(b: Builder, brick: number, roofFelt: number): void {
  const { x0, x1, z0, z1, h } = BAR;
  b.box(x1 - x0, h, z1 - z0, brick, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
  b.box(x1 - x0 - 0.4, 0.06, z1 - z0 - 0.4, roofFelt, { at: [(x0 + x1) / 2, h, (z0 + z1) / 2] });
  const f = FLAT;
  b.box(f.x1 - f.x0, f.h, f.z1 - f.z0, brick, { at: [(f.x0 + f.x1) / 2, 0, (f.z0 + f.z1) / 2] });
  b.box(f.x1 - f.x0 - 0.4, 0.06, f.z1 - f.z0 - 0.4, roofFelt, { at: [(f.x0 + f.x1) / 2, f.h, (f.z0 + f.z1) / 2] });
}

/** A flat-roof edge band of depth `h` round a rectangle, standing `out` proud of the walls. */
export function fasciaBand(b: Builder, r: typeof BAR, y: number, h: number, out: number, color: number): void {
  const w = r.x1 - r.x0 + 2 * out;
  const d = r.z1 - r.z0 + 2 * out;
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  b.box(w, h, 0.12, color, { at: [cx, y, r.z1 + out] });
  b.box(w, h, 0.12, color, { at: [cx, y, r.z0 - out] });
  b.box(0.12, h, d, color, { at: [r.x1 + out, y, cz] });
  b.box(0.12, h, d, color, { at: [r.x0 - out, y, cz] });
  b.box(w, 0.08, d, tint(color, -0.15), { at: [cx, y, cz] });
}

export const estatePub: BuildingDef = {
  id: 'estate-pub',
  name: 'Estate pub',
  style: 'Post-war modern',
  date: 'c. 1968',
  summary:
    'Post-war planners rebuilt much of the town centre, and the brewery replaced the old pub with a modern one to serve the new housing estate. ' +
    'It is a plain box of machine-made brick with a flat roof, a deep fascia carrying the brewery’s name and wide picture windows in aluminium frames. ' +
    'Ornament has gone entirely: the advertising does the work the gables and lamps did before, and one big lounge bar replaces the warren of small rooms.',
  materials: ['wire-cut brick', 'felted flat roof', 'aluminium window frames', 'concrete'],
  lookFor: [
    { label: 'Flat roof', note: 'Cheap to build with felt over timber or concrete, and modern-looking. Many leaked within twenty years.', at: [-4, BAR.h + 0.7, -5] },
    { label: 'Fascia sign', note: 'A deep band round the roof edge, carrying the brewery’s name in big plastic letters lit at night.', at: [-7.5, BAR.h + 0.4, BAR.z1 + 0.6] },
    { label: 'Picture windows', note: 'Wide, undivided sheets of glass in thin aluminium frames, the opposite of the leaded casements of the 1930s.', at: [-6.3, 1.9, BAR.z1 + 0.2] },
    { label: 'Pole sign', note: 'A tall illuminated sign on a steel post, to be seen from passing cars.', at: [8.8, 5.6, 9.4] },
    { label: 'Flat over the pub', note: 'The manager lived on the premises, in a two-storey block at the end.', at: [8, 5.0, FLAT.z1 + 0.2] },
  ],
  influences: ['continental-modernism'],
  build(b) {
    const brick = b.pick([P.brickBuff, tint(P.brickBuff, -0.06), tint(P.brickRed, 0.04)]);
    const fascia = b.pick([P.cladWhite, P.white]);
    const brand = b.pick([P.cladRed, P.cladBlue, P.doorGreen]);
    const alu = P.aluminium;
    const { x0, x1, z0, z1, h } = BAR;

    ground(b, 22, 22, P.tarmac, [0, 0]);
    ground(b, 21, 1.4, P.concrete, [-2, z1 + 0.7], 0.08);
    bayLines(b, -9.6, 9.6, 7, 6.3, 4.4);

    estateShell(b, brick, P.asphalt);

    // ---------------- fascias
    fasciaBand(b, BAR, h, 0.8, 0.35, fascia);
    fasciaBand(b, FLAT, FLAT.h, 0.45, 0.2, fascia);
    // brewery name in big letters and a roundel logo
    for (const x of spread(10, -9.2, -3.2)) b.panel(0.42, 0.5, brand, { at: [x, h + 0.15, z1 + 0.48], facing: '+z', depth: 0.05 });
    b.panel(0.8, 0.8, brand, { at: [-1.8, h, z1 + 0.48], facing: '+z', shape: 'circle', depth: 0.06 });
    for (const z of spread(5, -7.6, -4.2)) b.panel(0.42, 0.5, brand, { at: [x0 - 0.48, h + 0.15, z], facing: '-x', depth: 0.05 });

    // ---------------- picture windows along the front, brick piers between
    for (const x of [-8.1, -4.6, 2.4]) {
      b.window(3.0, 1.9, { at: [x, 0.9, z1], facing: '+z', frame: alu, border: 0.06, bars: [2, 1] });
      b.box(3.2, 0.06, 0.25, P.concrete, { at: [x, 0.84, z1 + 0.1] });
    }
    b.window(2.6, 1.9, { at: [x0, 0.9, -5.2], facing: '-x', frame: alu, border: 0.06, bars: [2, 1] });
    // recessed entrance with a flat concrete canopy on thin steel posts
    b.panel(2.4, 2.4, P.glassDark, { at: [-1.2, 0, z1], facing: '+z', depth: 0.06 });
    b.sym((s) => b.panel(0.06, 2.4, alu, { at: [-1.2 + s * 0.6, 0, z1], facing: '+z', depth: 0.09 }));
    b.panel(2.4, 0.06, alu, { at: [-1.2, 2.1, z1], facing: '+z', depth: 0.09 });
    b.box(3.6, 0.18, 1.8, P.concreteWhite, { at: [-1.2, 2.6, z1 + 0.9] });
    b.sym((s) => b.box(0.08, 2.6, 0.08, P.castIron, { at: [-1.2 + s * 1.6, 0, z1 + 1.65] }));
    // back and side: high windows to toilets and a cellar flap
    for (const x of [-8, -5, -2, 1]) b.window(1.8, 0.6, { at: [x, 2.2, z0], facing: '-z', frame: alu, border: 0.05 });
    b.panel(1.0, 2.1, P.doorBlue, { at: [3.6, 0, z0], facing: '-z' });
    b.box(1.6, 0.12, 1.0, P.steel, { at: [-3, 0, z0 - 0.5] });

    // ---------------- the flat: horizontal windows, a tile-hung panel, its own door
    const f = FLAT;
    const fx = (f.x0 + f.x1) / 2;
    b.panel(f.x1 - f.x0, 1.2, P.tileBrown, { at: [fx, 4.0, f.z1], facing: '+z', depth: 0.04 });
    b.window(3.2, 1.0, { at: [fx, 4.1, f.z1], facing: '+z', frame: alu, border: 0.05, bars: [3, 1] });
    b.window(3.2, 1.3, { at: [fx, 1.0, f.z1], facing: '+z', frame: alu, border: 0.05, bars: [3, 1] });
    b.window(2.4, 1.0, { at: [f.x1, 4.1, -6.4], facing: '+x', frame: alu, border: 0.05, bars: [2, 1] });
    b.window(2.4, 1.2, { at: [f.x1, 1.0, -6.4], facing: '+x', frame: alu, border: 0.05, bars: [2, 1] });
    b.window(2.4, 1.0, { at: [fx, 4.1, f.z0], facing: '-z', frame: alu, border: 0.05, bars: [2, 1] });
    b.panel(0.95, 2.1, P.doorYellow, { at: [f.x1, 0, -9.0], facing: '+x' });
    b.chimney(0.6, 1.2, 0.6, brick, { at: [f.x0 + 0.8, f.h, f.z0 + 1.0] });

    // ---------------- pole sign, bins, cars, a scrap of planting
    b.group({ at: [8.8, 0, 9.4] }, () => {
      b.cyl(0.12, 4.6, P.steel, { segs: 8 });
      b.box(1.9, 1.9, 0.3, P.cladWhite, { at: [0, 4.6, 0] });
      b.box(1.6, 1.6, 0.34, brand, { at: [0, 4.75, 0] });
      b.cyl(0.4, 0.36, P.white, { at: [0, 5.55, 0], segs: 12, rot: [Math.PI / 2, 0, 0] });
    });
    for (const x of [-9.2, -8.4]) b.cyl(0.35, 1.1, P.steel, { at: [x, 0, z0 - 0.6], segs: 10 });
    car(b, [-6.0, 0, 6.3], Math.PI / 2, b.pick([P.cladYellow, P.cladBlue, P.white]), 1965);
    car(b, [3.6, 0, 6.3], -Math.PI / 2, b.pick([P.cladRed, P.cladGreen, P.zinc]), 1965);
    b.box(4.0, 0.5, 1.0, P.concrete, { at: [-6.0, 0, 0.4] });
    for (const x of [-7.4, -6.0, -4.6]) b.tree(0.9, { at: [x, 0.5, 0.4], kind: 'bush' });

    b.collider(x1 - x0, z1 - z0, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
    b.collider(f.x1 - f.x0, f.z1 - f.z0, { at: [fx, 0, (f.z0 + f.z1) / 2] });
  },
};
