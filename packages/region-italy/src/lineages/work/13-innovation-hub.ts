import { P, car, tint, type BuildingDef } from '@ah/kit';
import { BANK, WATER, lin, riverWall } from './shared';
import { curtainWall } from './12-glass-factory';

export const innovationHub: BuildingDef = {
  id: 'innovation-hub',
  name: 'Factory reused as an innovation hub',
  style: 'Contemporary reuse',
  date: 'c. 2014',
  summary:
    'When manufacturing moved away in the late twentieth century, the factory was not knocked down: it was protected as a monument of modern architecture and given new uses. ' +
    'The glass block now holds design studios, start-up offices and laboratories, the ground floor has become a museum of the firm and its products with a café, and the canteen is a restaurant on the river. ' +
    'On the roof, where the plant rooms stood, there is a garden with trees, a glass meeting room and solar panels. ' +
    'The riverbank that once carried quays, wheels and sidings is a public promenade: the plot still makes things, but mostly ideas.',
  materials: ['1950s concrete frame', 'restored glass curtain wall', 'steel and glass additions', 'timber decking', 'photovoltaic panels'],
  lookFor: [
    { label: 'Roof garden', note: 'Planted beds and trees in deep planters on the old flat roof, open to the people who work here.', at: [-8, 14.0, 4.0] },
    { label: 'Glass meeting room', note: 'A new transparent pavilion set on the roof, like Renzo Piano’s glass bubble on the Lingotto in Turin.', at: [9, 15.8, 7.0] },
    { label: 'Museum entrance', note: 'The old ground floor, opened up behind its columns, now shows the machines once made here.', at: [-6, 2.2, 9.4] },
    { label: 'Solar canopy', note: 'Photovoltaic panels on a light steel frame shade the roof terrace and power the building.', at: [-10, 15.8, 1.6] },
    { label: 'Riverside promenade', note: 'A timber boardwalk along the old quay, open to everyone, where the barges and mills once worked.', at: [4, 0.6, -11.6] },
  ],
  build(b) {
    const concrete = P.concreteWhite;
    const stone = P.travertine;

    riverWall(b, -17.6, 17.6, P.concrete, { coping: stone });
    b.box(35, 0.04, 21, P.grass, { at: [0, 0, 0], jitter: false });

    // ---- the restored 1950s block, unchanged outside
    const W = 30;
    const D = 9;
    const x0 = 0;
    const z0 = 4.6;
    const fl = 4.0;
    const floors = 3;
    const H = fl * floors;
    const front = z0 + D / 2;
    b.box(W - 0.6, H, D - 0.6, tint(concrete, -0.14), { at: [x0, 0, z0] });
    b.box(W, 0.3, D, concrete, { at: [x0, fl - 0.3, z0] });
    for (const x of lin(9, x0 - W / 2 + 0.4, x0 + W / 2 - 0.4)) b.cyl(0.22, fl - 0.3, concrete, { at: [x, 0, front - 0.4], segs: 10 });
    // the museum and café behind the columns: clear glass, lit inside
    curtainWall(b, W - 1.2, fl - 0.6, [x0, 0.3, front - 2.0], 0, { cols: 12, glass: P.glass });
    b.box(W - 2, 2.6, 0.1, P.windowLit, { at: [x0, 0.5, front - 2.6], jitter: false });
    b.box(W, 0.3, 2.0, tint(P.paving, 0.04), { at: [x0, 0, front - 1.0] });
    for (let k = 1; k < floors; k++) b.box(W + 0.2, 0.35, D + 0.2, concrete, { at: [x0, k * fl - 0.35, z0] });
    curtainWall(b, W, H - fl, [x0, fl, front + 0.08], 0, { cols: 24, rows: 2 });
    curtainWall(b, W, H - fl, [x0, fl, z0 - D / 2 - 0.08], Math.PI, { cols: 24, rows: 2 });
    b.sym((s) => curtainWall(b, D, H - 0.3, [x0 + s * (W / 2 + 0.08), 0.3, z0], (s * Math.PI) / 2, { cols: 7, rows: 3 }));
    b.box(W + 1.2, 0.45, D + 1.2, concrete, { at: [x0, H, z0] });
    for (const x of lin(16, x0 + 3, x0 + W / 2 - 0.3)) b.box(0.12, H - fl + 0.3, 0.9, concrete, { at: [x, fl - 0.3, front + 0.6] });
    b.box(W / 2 - 2.7, 0.2, 1.1, concrete, { at: [x0 + 3 + (W / 2 - 3.3) / 2, fl - 0.3, front + 0.55] });
    b.box(W / 2 - 2.7, 0.2, 1.1, concrete, { at: [x0 + 3 + (W / 2 - 3.3) / 2, H, front + 0.55] });
    b.box(3.6, H + 2.4, 3.4, stone, { at: [x0 - W / 2 + 2.4, 0, z0 - D / 2 - 1.7] });
    curtainWall(b, 1.4, H, [x0 - W / 2 + 0.58, 0.6, z0 - D / 2 - 1.7], -Math.PI / 2, { cols: 1, rows: 6 });
    // a museum banner on the columns and a new lettering band
    b.panel(6.0, 0.7, P.cladYellow, { at: [x0 - W / 2 + 4.5, H - 0.75, front + 0.15], facing: '+z' });
    b.box(1.2, 7.0, 0.05, P.cladRed, { at: [x0 - 8, fl, front + 0.3], jitter: false });

    // ---- the roof: garden, glass meeting room, a solar canopy, a glass rail all round
    const ry = H + 0.45;
    b.box(W - 1, 0.4, D - 1, tint(P.grass, -0.06), { at: [x0, ry, z0] });
    for (const [x, z] of [
      [-12, 2.6],
      [-8, 6.4],
      [-4, 2.6],
      [0, 6.4],
    ] as const) {
      b.box(2.2, 0.7, 2.2, P.brickDark, { at: [x0 + x + 2, ry, z] });
      b.tree(4.5, { at: [x0 + x + 2, ry + 0.7, z], kind: 'round', color: P.leaf });
    }
    for (const x of lin(4, x0 - 10, x0 + 2)) b.box(2.6, 0.5, 1.0, P.larch, { at: [x, ry + 0.4, z0 + 0.2] }); // benches
    // the glass meeting room: a transparent box on slim legs
    const mx = x0 + 9;
    b.box(6.5, 0.25, 5.0, P.steel, { at: [mx, ry + 0.4, z0] });
    curtainWall(b, 6.5, 2.8, [mx, ry + 0.65, z0 + 2.5], 0, { cols: 5, glass: P.glass });
    curtainWall(b, 6.5, 2.8, [mx, ry + 0.65, z0 - 2.5], Math.PI, { cols: 5, glass: P.glass });
    b.sym((s) => curtainWall(b, 5.0, 2.8, [mx + s * 3.25, ry + 0.65, z0], (s * Math.PI) / 2, { cols: 4, glass: P.glass }));
    b.box(6.9, 0.25, 5.4, P.steel, { at: [mx, ry + 3.45, z0] });
    b.box(5.0, 0.8, 1.2, P.larch, { at: [mx, ry + 0.65, z0] });
    // solar canopy over the west end
    const sx = x0 - 10;
    for (const x of [sx - 3, sx + 3]) for (const z of [z0 - 3, z0 + 3]) b.cyl(0.1, 3.0, P.steel, { at: [x, ry, z], segs: 6 });
    b.group({ at: [sx, ry + 3.0, z0], rot: [0.15, 0, 0] }, () => {
      b.box(7.0, 0.12, 7.0, P.steel);
      for (const x of lin(4, -2.6, 2.6)) for (const z of lin(4, -2.6, 2.6)) b.box(1.6, 0.06, 1.6, P.solar, { at: [x, 0.12, z], mat: 'glass', jitter: false });
    });
    // glass balustrade round the roof
    for (const [w, d, x, z] of [
      [W, 0.06, x0, z0 + D / 2 + 0.5],
      [W, 0.06, x0, z0 - D / 2 - 0.5],
      [0.06, D + 1, x0 - W / 2 - 0.5, z0],
      [0.06, D + 1, x0 + W / 2 + 0.5, z0],
    ] as const) b.box(w, 1.1, d, P.glass, { at: [x, ry, z], mat: 'glass', jitter: false });

    // ---- the old canteen, now a restaurant, with a deck to the river
    const cx = -10;
    const cz = -6.4;
    const hex: [number, number][] = [
      [-6, -2.6],
      [4.5, -3.2],
      [6.5, 0],
      [4.5, 3.0],
      [-4.5, 3.0],
      [-6.5, 0.4],
    ];
    b.group({ at: [cx, 0, cz], rot: [-Math.PI / 2, 0, 0] }, () => {
      b.extrude(hex, 0.5, P.paving, { at: [0, 0, 0.25] });
      b.extrude(hex, 0.4, concrete, { at: [0, 0, 3.8] });
    });
    for (let i = 0; i < hex.length; i++) {
      const [ax, az] = hex[i];
      const [bx2, bz2] = hex[(i + 1) % hex.length];
      const len = Math.hypot(bx2 - ax, bz2 - az);
      const ang = Math.atan2(bz2 - az, bx2 - ax);
      curtainWall(b, len - 0.2, 3.1, [cx + (ax + bx2) / 2, 0.5, cz - (az + bz2) / 2], ang + Math.PI, { cols: Math.round(len / 1.4), glass: P.glass });
      b.cyl(0.12, 3.1, concrete, { at: [cx + ax, 0.5, cz - az], segs: 8 });
    }
    b.box(10, 2.4, 3, P.windowLit, { at: [cx, 0.6, cz], jitter: false });
    // umbrellas and tables on the river deck
    for (const x of lin(4, cx - 5, cx + 5)) {
      b.cyl(0.04, 2.2, P.steel, { at: [x, 0.3, -10.4], segs: 4 });
      b.cone(1.1, 0.4, P.cream, { at: [x, 2.3, -10.4], segs: 8 });
      b.cyl(0.4, 0.75, P.white, { at: [x, 0.3, -10.4], segs: 8, rTop: 0.45 });
    }

    // ---- the riverside promenade: a timber boardwalk on the old quay, cantilevered over the water
    b.box(35, 0.3, 2.4, P.larch, { at: [0, 0.15, BANK - 0.6] });
    for (const x of lin(12, -16, 16)) b.cyl(0.12, 0.45 - WATER + 0.3, P.steel, { at: [x, WATER - 0.3, BANK - 1.6], segs: 6 });
    b.box(35, 0.05, 0.05, P.steel, { at: [0, 1.5, BANK - 1.75] });
    for (const x of lin(36, -17, 17)) b.box(0.04, 1.05, 0.04, P.steel, { at: [x, 0.45, BANK - 1.75] });
    b.deck(35, 2.4, 0.45, { at: [0, 0, BANK - 0.6] });

    // ---- the old nursery: studios and a fab lab, with a solar roof and a new timber wing
    const nx = 10.5;
    const nz = -5.2;
    b.box(10, 3.2, 5.0, concrete, { at: [nx, 0, nz] });
    b.box(10.8, 0.3, 5.8, concrete, { at: [nx, 3.2, nz] });
    curtainWall(b, 8.6, 2.6, [nx, 0.3, nz + 2.54], 0, { cols: 7, glass: P.glass });
    b.group({ at: [nx, 3.5, nz], rot: [0.2, 0, 0] }, () => {
      for (const x of lin(5, -4, 4)) b.box(1.7, 0.06, 4.6, P.solar, { at: [x, 0, 0], mat: 'glass', jitter: false });
    });
    b.box(5.0, 3.6, 4.0, P.larch, { at: [nx + 3.6, 0, nz + 4.4] });
    for (const x of lin(9, nx + 1.3, nx + 5.9)) b.box(0.08, 3.6, 0.1, tint(P.larch, -0.12), { at: [x, 0, nz + 6.42] });
    b.box(5.4, 0.25, 4.4, P.zinc, { at: [nx + 3.6, 3.6, nz + 4.4] });
    curtainWall(b, 2.4, 2.6, [nx + 2.6, 0.2, nz + 6.45], 0, { cols: 2, glass: P.glass });

    // ---- forecourt: bicycles, two modern cars, the pines kept from the 1950s garden
    b.box(30, 0.05, 2.4, P.paving, { at: [x0, 0, front + 1.6], jitter: false });
    for (const x of lin(8, 6, 12)) {
      b.log(0.33, 0.04, P.black, { at: [x, 0, front + 1.2], axis: 'x', segs: 8 });
      b.log(0.33, 0.04, P.black, { at: [x, 0, front + 2.2], axis: 'x', segs: 8 });
      b.beam([x, 0.7, front + 1.2], [x, 0.9, front + 2.2], 0.04, 0.05, b.pick([P.cladRed, P.cladBlue, P.cladYellow, P.black]));
    }
    car(b, 'modern', P.cladWhite, [-12, 0, 10.0], Math.PI / 2);
    car(b, 'modern', P.cladGrey, [-7, 0, 10.0], Math.PI / 2);
    b.tree(8, { at: [-14.8, 0, -1.6], kind: 'pine' });
    b.tree(10, { at: [3.5, 0, -8], kind: 'pine' });
    b.tree(5, { at: [16.5, 0, 1], kind: 'round' });

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(13, 6.2, { at: [cx, 0, cz] });
    b.collider(10, 5, { at: [nx, 0, nz] });
  },
};
