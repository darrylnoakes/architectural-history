import { P, car, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, lin, riverWall } from './shared';

/** A concrete-framed facade of `bays` bays on a wall plane: piers, floor bands, big steel-framed windows. */
function gridFacade(
  b: Builder,
  w: number,
  floors: number,
  fl: number,
  bays: number,
  at: [number, number, number],
  facing: number,
  concrete: number,
) {
  b.group({ at, rotY: facing }, () => {
    for (let k = 0; k < floors; k++) {
      const y = k * fl;
      b.box(w, fl - 1.1, 0.05, P.glassDark, { at: [0, y + 0.6, 0.03], mat: 'glass', jitter: false });
      for (const f of [0.35, 0.68]) b.box(w, 0.08, 0.1, P.castIron, { at: [0, y + 0.6 + (fl - 1.1) * f, 0.08], jitter: false });
      b.box(w + 0.1, 0.55, 0.25, concrete, { at: [0, y + fl - 0.5, 0.12] }); // floor band
      for (let i = 0; i < bays; i++) {
        const x = -w / 2 + (i + 0.5) * (w / bays);
        b.box(0.07, fl - 1.1, 0.1, P.castIron, { at: [x, y + 0.6, 0.08], jitter: false });
      }
    }
    for (let i = 0; i <= bays; i++) b.box(0.6, floors * fl, 0.3, concrete, { at: [-w / 2 + (i * w) / bays, 0, 0.15] });
    b.box(w + 0.1, 0.6, 0.3, concrete, { at: [0, 0, 0.15] });
  });
}

export const carFactory: BuildingDef = {
  id: 'car-factory',
  name: 'Car factory with a rooftop test track',
  style: 'Modern industrial (reinforced concrete)',
  date: 'c. 1926',
  summary:
    'Mass production arrives: a car factory planned on the American model, in which the work flowed upwards floor by floor, from raw materials at the bottom to finished cars on the roof. ' +
    'The whole building is a frame of reinforced concrete, columns and floor slabs filled in with steel-framed windows, so every floor is light and open and can carry heavy machines. ' +
    'Cars drove down from the roof by a spiral ramp, and the roof itself was a test track with banked curves at the ends, an image of speed that the Futurists and Le Corbusier both celebrated. ' +
    'Electricity from the river’s power stations now drives the machines; the river itself is only a view.',
  materials: ['reinforced concrete', 'steel windows', 'glass', 'asphalt'],
  modelledOn: 'The Fiat Lingotto factory, Turin (Giacomo Mattè-Trucco, 1916 to 1923; spiral ramp 1926), much reduced',
  lookFor: [
    { label: 'Rooftop test track', note: 'Finished cars were driven round a track on the roof to test them before sale.', at: [-3, 18.6, 8.9] },
    { label: 'Banked curves', note: 'The track tilts up at each end, like a velodrome, so cars could take the bends at speed.', at: [-15.5, 19.6, 3.6] },
    { label: 'Spiral ramp', note: 'A helical concrete ramp carried cars from floor to floor and down from the roof.', at: [15.5, 10.0, -6.4] },
    { label: 'Concrete frame and big windows', note: 'The walls carry no weight: the concrete columns do, leaving room for windows from pier to pier.', at: [-8, 9.0, 10.2] },
    { label: 'Railway siding', note: 'Steel, coal and parts came in by rail at the back of the works.', at: [-8, 1.4, -10.4] },
  ],
  influences: ['futurism', 'rationalism'],
  build(b) {
    const concrete = b.pick([P.concreteWhite, tint(P.concrete, 0.05), P.cream]);
    const fl = 4.4;
    const floors = 4;
    const H = fl * floors;
    const W = 33;
    const D = 12.6;
    const x0 = 0;
    const z0 = 3.6;

    riverWall(b, -17.6, 17.6, P.concrete, { coping: P.concreteWhite });
    b.box(35, 0.04, 21, P.tarmac, { at: [0, 0, 0], jitter: false });

    // ---- the main block: concrete frame, glazed bays
    b.box(W - 0.4, H, D - 0.4, tint(concrete, -0.15), { at: [x0, 0, z0] });
    gridFacade(b, W, floors, fl, 13, [x0, 0, z0 + D / 2 - 0.2], 0, concrete);
    gridFacade(b, W, floors, fl, 13, [x0, 0, z0 - D / 2 + 0.2], Math.PI, concrete);
    gridFacade(b, D, floors, fl, 5, [x0 - W / 2 + 0.2, 0, z0], -Math.PI / 2, concrete);
    gridFacade(b, D, floors, fl, 5, [x0 + W / 2 - 0.2, 0, z0], Math.PI / 2, concrete);
    // stair and lift towers rising above the roof
    b.sym((s) => {
      const tx = x0 + s * 3;
      b.box(3.0, H + 3.0, 2.4, concrete, { at: [tx, 0, z0] });
      b.box(3.2, 0.3, 2.6, tint(concrete, -0.08), { at: [tx, H + 3.0, z0] });
      b.panel(1.2, 2.2, P.glassDark, { at: [tx, H + 0.6, z0 + 1.2], facing: '+z' });
    });
    // entrance on the street: a canopy and doors in the middle bays
    b.box(6, 0.3, 2.4, concrete, { at: [x0, 3.6, z0 + D / 2 + 1.2] });
    b.panel(4.4, 3.2, P.doorBlack, { at: [x0, 0.6, z0 + D / 2 + 0.33], facing: '+z' });
    b.panel(10, 1.2, P.cladWhite, { at: [x0, H - 0.2, z0 + D / 2 + 0.33], facing: '+z' }); // name band
    for (const x of lin(8, x0 - 4.2, x0 + 4.2)) b.panel(0.7, 0.7, P.cladBlue, { at: [x, H + 0.05, z0 + D / 2 + 0.4], facing: '+z', depth: 0.08 });

    // ---- the roof: test track with banked curves at each end, a parapet, cars on test
    const ry = H;
    b.box(W, 0.4, D, P.concreteDark, { at: [x0, ry, z0] });
    const R = D / 2; // outer radius of the curves
    const tw = 3.4; // track width
    const cx1 = x0 - W / 2 + R;
    const cx2 = x0 + W / 2 - R;
    // straights along front and back
    for (const s of [1, -1]) {
      b.box(cx2 - cx1, 0.12, tw, P.asphalt, { at: [(cx1 + cx2) / 2, ry + 0.4, z0 + s * (R - tw / 2)], jitter: false });
      b.box(cx2 - cx1, 0.06, 0.15, P.white, { at: [(cx1 + cx2) / 2, ry + 0.53, z0 + s * (R - tw / 2)], jitter: false });
      b.box(cx2 - cx1, 1.1, 0.25, concrete, { at: [(cx1 + cx2) / 2, ry + 0.4, z0 + s * (R - 0.12)] }); // parapet
    }
    // banked curves: the track rises toward the outside edge
    const bank = 2.0;
    for (const [cx, start] of [
      [cx2, 0],
      [cx1, Math.PI],
    ] as const) {
      b.lathe(
        [
          [R - tw, ry + 0.52],
          [R - 0.2, ry + 0.4 + bank],
          [R + 0.05, ry + 0.4 + bank + 0.5],
          [R + 0.05, ry + 0.4],
        ],
        P.asphalt,
        { at: [cx, 0, z0], start, sweep: Math.PI, segs: 14 },
      );
      b.lathe(
        [
          [R + 0.06, ry - 0.2],
          [R + 0.06, ry + 0.4 + bank + 0.5],
        ],
        concrete,
        { at: [cx, 0, z0], start, sweep: Math.PI, segs: 14 },
      );
    }
    // the infield: service buildings and a water tank on stilts
    b.box(cx2 - cx1 - 1, 0.6, D - 2 * tw - 1.0, tint(P.grass, -0.1), { at: [(cx1 + cx2) / 2, ry + 0.4, z0] });
    car(b, 'thirties', P.doorRed, [x0 - 2, ry + 0.52, z0 + R - tw / 2], Math.PI / 2);
    car(b, 'thirties', P.black, [x0 + 4, ry + 0.52, z0 - R + tw / 2], -Math.PI / 2);
    car(b, 'thirties', P.doorBlue, [cx2 + R - 1.6, ry + 1.6, z0], 0);

    // ---- the spiral ramp tower at the east end, linking every floor to the roof
    const sx = 12.4;
    const sz = -6.4;
    const rOut = 3.8;
    const rIn = 1.4;
    const turns = floors;
    const seg = 14;
    for (let i = 0; i < turns * seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const y0 = (i / seg) * fl + 0.3;
      const y1 = ((i + 1) / seg) * fl + 0.3;
      const rm = (rOut + rIn) / 2;
      b.beam([sx + Math.cos(a0) * rm, y0, sz + Math.sin(a0) * rm], [sx + Math.cos(a1) * rm, y1, sz + Math.sin(a1) * rm], rOut - rIn, 0.3, concrete);
      b.beam([sx + Math.cos(a0) * rOut, y0 + 0.75, sz + Math.sin(a0) * rOut], [sx + Math.cos(a1) * rOut, y1 + 0.75, sz + Math.sin(a1) * rOut], 0.2, 1.0, tint(concrete, -0.05));
    }
    b.cyl(rIn, H + 0.6, tint(concrete, -0.08), { at: [sx, 0, sz], segs: 12 }); // the core
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.box(0.4, H, 0.4, concrete, { at: [sx + Math.cos(a) * (rOut - 0.2), 0, sz + Math.sin(a) * (rOut - 0.2)] });
    }
    // bridges from the ramp into the block at each floor and onto the roof track
    for (let k = 1; k <= floors; k++) b.box(2.6, 0.3, 1.6, concrete, { at: [sx, k * fl - 0.1, z0 - D / 2 - 0.7] });

    // ---- the back: loading bays, a railway siding with a wagon, the river wall
    const bz = z0 - D / 2;
    b.box(20, 1.2, 2.0, P.concreteDark, { at: [-6, 0, bz - 1.0] });
    b.box(25, 0.3, 2.6, P.gravel, { at: [-5, 0, -9.4] });
    for (const dz of [-0.72, 0.72]) b.box(25, 0.14, 0.1, P.steel, { at: [-5, 0.3, -9.4 + dz] });
    for (const x of lin(14, -17, 7)) b.box(0.25, 0.1, 2.2, P.oakDark, { at: [x, 0.22, -9.4] });
    b.group({ at: [-8, 0.45, -9.4] }, () => {
      b.box(8, 2.6, 2.6, P.cladRed, { at: [0, 0.5, 0] });
      b.vault(2.6, 8, tint(P.cladRed, -0.1), { at: [0, 3.1, 0], axis: 'x', squash: 0.25 });
      b.sym((s) => b.sym((t) => b.log(0.45, 0.15, P.iron, { at: [s * 2.8, 0, t * 1.25], segs: 8 })));
    });
    b.box(4.0, 2.8, 0.3, P.cladGrey, { at: [-11, 1.2, bz - 0.05] });
    b.box(4.0, 2.8, 0.3, P.cladGrey, { at: [-2, 1.2, bz - 0.05] });

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(rOut * 2, rOut * 2, { at: [sx, 0, sz] });
  },
};
