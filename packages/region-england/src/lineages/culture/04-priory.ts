import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { facet } from './shared';

/** Plan of the priory church, shared with the playhouse that reuses its ruined west door. */
export const PRIORY = {
  nave: { x0: -16, x1: 1, z0: 8, z1: 14, h: 7.5 },
};

/** A Norman doorway of three recessed orders (concentric round arches), facing +Z at `at`. */
export function normanDoor(b: Builder, stone: number, at: [number, number, number], rotY = 0, door = P.oakDark): void {
  b.group({ at, rotY }, () => {
    const orders = [
      [3.4, 4.4, tint(stone, 0.06)],
      [2.8, 3.95, tint(stone, -0.04)],
      [2.2, 3.5, tint(stone, 0.06)],
    ] as const;
    orders.forEach(([w, h, c], i) => b.panel(w, h, c, { shape: 'round', depth: 0.32 - i * 0.08 }));
    b.panel(1.6, 3.0, door, { shape: 'round', depth: 0.1 });
    b.sym((s) => b.cyl(0.12, 2.5, tint(stone, 0.08), { at: [s * 1.25, 0, 0.3], segs: 6 }));
  });
}

export const priory: BuildingDef = {
  id: 'priory',
  name: 'Priory',
  style: 'Norman (Romanesque)',
  date: 'c. 1140',
  summary:
    'A small house of a dozen or so monks, a daughter of a great abbey, given land here by a Norman lord. It is laid out like every monastery in ' +
    'western Europe: the church on one side of a square cloister, the chapter house and dormitory along the east range, the refectory opposite the church. ' +
    'Norman masons built in thick walls of coursed stone with round arches, small high windows and flat pilaster buttresses. ' +
    'It is the first great stone building on the plot since the Roman baths, some of whose stone it probably reuses.',
  materials: ['coursed limestone', 'reused Roman stone and tile', 'stone slate', 'oak'],
  lookFor: [
    { label: 'Round arches', note: 'Every door, window and arcade is a semicircle: the surest sign of Norman (Romanesque) work.', at: [-16.4, 4.6, 11] },
    { label: 'Cloister arcade', note: 'Covered walks round an open square, the garth, linking church, chapter house and refectory.', at: [-7, 2.6, 5.4] },
    { label: 'Chapter house', note: 'Where the monks met each morning to hear a chapter of their Rule and confess faults. Its apse projects east.', at: [15.6, 4.2, 0] },
    { label: 'Pilaster buttresses', note: 'Shallow flat strips up the walls: Norman walls were so thick they needed little more.', at: [-6.6, 5, 14.3] },
    { label: 'Crossing tower', note: 'A squat central tower over the crossing, with paired round-headed belfry openings.', at: [4.2, 15, 14.3] },
  ],
  influences: ['norman-romanesque'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.03, 0.03));
    const dark = tint(stone, -0.07);
    const roof = b.pick([P.stoneSlate, tint(P.stoneSlate, -0.05)]);
    const N = PRIORY.nave;
    const nz = (N.z0 + N.z1) / 2;
    const nw = N.z1 - N.z0;

    // ---------------------------------------------------------------- church
    // nave
    b.box(N.x1 - N.x0 + 0.4, 0.5, nw + 0.4, dark, { at: [(N.x0 + N.x1) / 2, 0, nz] });
    b.box(N.x1 - N.x0, N.h, nw, stone, { at: [(N.x0 + N.x1) / 2, 0, nz] });
    b.gable(N.x1 - N.x0, nw, 3.8, roof, { at: [(N.x0 + N.x1) / 2, N.h, nz], overhang: 0.3, wall: stone });
    const bays = spread(5, N.x0, N.x1);
    for (let i = 0; i <= 5; i++) {
      const x = N.x0 + 0.4 + ((N.x1 - N.x0 - 0.8) * i) / 5;
      for (const s of [1, -1]) b.box(0.8, N.h, 0.25, stone, { at: [x, 0, nz + s * (nw / 2 + 0.12)] });
    }
    for (const x of bays) {
      b.window(0.8, 1.9, { at: [x, 4.4, N.z1], facing: '+z', shape: 'round', frame: dark });
      b.window(0.8, 1.7, { at: [x, 5.0, N.z0], facing: '-z', shape: 'round', frame: dark });
    }
    // west front: recessed doorway, blind arcading, windows, corner turrets
    normanDoor(b, stone, [N.x0, 0, nz], -Math.PI / 2);
    b.archWall(nw - 0.6, 1.8, 0.12, tint(stone, 0.05), { at: [N.x0 - 0.06, 4.7, nz], facing: '-x', openings: 5, openW: 0.75, openH: 1.4, sill: 0.15 });
    b.sym((s) => b.window(0.8, 1.9, { at: [N.x0, 6.9 - 0.2, nz + s * 1.2], facing: '-x', shape: 'round', frame: dark }));
    b.window(0.9, 0.9, { at: [N.x0, 8.9, nz], facing: '-x', shape: 'circle', frame: dark });
    b.sym((s) => {
      b.box(1.1, N.h + 1.6, 1.1, stone, { at: [N.x0 + 0.3, 0, nz + s * (nw / 2 - 0.1)] });
      b.pyramid(1.2, 1.2, 1.4, roof, { at: [N.x0 + 0.3, N.h + 1.6, nz + s * (nw / 2 - 0.1)] });
    });

    // crossing tower
    const tx = 4.2;
    const ts = 6.4;
    const tH = 15.5;
    b.box(ts, tH, ts, stone, { at: [tx, 0, nz] });
    b.box(ts + 0.2, 0.3, ts + 0.2, dark, { at: [tx, N.h + 2.2, nz] });
    b.box(ts + 0.3, 0.35, ts + 0.3, dark, { at: [tx, tH - 0.35, nz] });
    b.pyramid(ts + 0.4, ts + 0.4, 2.4, roof, { at: [tx, tH, nz] });
    for (const [f, dx, dz] of [['+z', 0, 1], ['-z', 0, -1], ['+x', 1, 0], ['-x', -1, 0]] as const) {
      for (const o of [-0.65, 0.65]) {
        b.window(0.95, 2.2, {
          at: [tx + dx * (ts / 2) + (dz !== 0 ? o : 0), 11.8, nz + dz * (ts / 2) + (dx !== 0 ? o : 0)],
          facing: f,
          shape: 'round',
          frame: dark,
          glass: P.black,
        });
      }
    }

    // chancel with apse
    const cx0 = tx + ts / 2;
    const cx1 = 12.8;
    const cw = 4.8;
    b.box(cx1 - cx0, 6.5, cw, stone, { at: [(cx0 + cx1) / 2, 0, nz] });
    b.gable(cx1 - cx0, cw, 3.0, roof, { at: [(cx0 + cx1) / 2, 6.5, nz], overhang: 0.25, wall: stone });
    b.cyl(cw / 2, 6.5, stone, { at: [cx1, 0, nz], segs: 14 });
    b.cone(cw / 2 + 0.25, 3.0, roof, { at: [cx1, 6.5, nz], segs: 14 });
    for (const i of [2, 3, 4]) {
      const [fx, fz, fa] = facet(i, 14, cw / 2);
      b.window(0.6, 1.6, { at: [cx1 + fx, 3.6, nz + fz], facing: fa, shape: 'round', frame: dark });
    }
    b.window(0.7, 1.7, { at: [(cx0 + cx1) / 2, 3.4, nz + cw / 2], facing: '+z', shape: 'round', frame: dark });

    // ---------------------------------------------------------------- cloister
    const g0 = -12.5;
    const g1 = -1.5; // garth x range
    const gz = 5.5; // garth runs z -5.5..5.5
    const gc = (g0 + g1) / 2;
    const arcH = 3.2;
    b.box(16, 0.08, 16, tint(P.paving, -0.04), { at: [-7, 0, 0] });
    b.box(g1 - g0 - 0.4, 0.12, gz * 2 - 0.4, P.grass, { at: [gc, 0, 0] });
    b.box(1.0, 0.13, gz * 2 - 0.4, P.gravel, { at: [gc, 0, 0] });
    b.box(g1 - g0 - 0.4, 0.13, 1.0, P.gravel, { at: [gc, 0, 0] });
    b.cyl(0.7, 0.8, stone, { at: [gc, 0, 0], segs: 8 });
    b.cyl(0.55, 0.05, P.water, { at: [gc, 0.78, 0], segs: 8 });
    const arcade = { openings: 6, openW: 1.2, openH: 2.3, sill: 0.6, shape: 'round' as const };
    b.archWall(g1 - g0 + 0.5, arcH, 0.5, stone, { at: [gc, 0, gz], facing: '+z', ...arcade });
    b.archWall(g1 - g0 + 0.5, arcH, 0.5, stone, { at: [gc, 0, -gz], facing: '-z', ...arcade });
    b.archWall(gz * 2 - 0.5, arcH, 0.5, stone, { at: [g0, 0, 0], facing: '-x', ...arcade });
    b.archWall(gz * 2 - 0.5, arcH, 0.5, stone, { at: [g1, 0, 0], facing: '+x', ...arcade });
    // paired shafts on the garth side of each pier
    const piers = (len: number) => Array.from({ length: 5 }, (_, i) => -len / 2 + ((i + 1) * len) / 6);
    for (const p of piers(g1 - g0 + 0.5)) {
      for (const s of [1, -1]) b.cyl(0.11, 2.3, tint(stone, 0.07), { at: [gc + p, 0.6, s * (gz - 0.3)], segs: 5 });
    }
    for (const p of piers(gz * 2 - 0.5)) {
      for (const x of [g0 + 0.3, g1 - 0.3]) b.cyl(0.11, 2.3, tint(stone, 0.07), { at: [x, 0.6, p], segs: 5 });
    }
    // lean-to roofs over the four walks
    const walk = 2.5;
    b.shed(16, walk + 0.4, 1.3, roof, { at: [-7, arcH, gz + walk / 2 - 0.2], high: '+z' });
    b.shed(16, walk + 0.4, 1.3, roof, { at: [-7, arcH, -gz - walk / 2 + 0.2], high: '-z' });
    b.shed(walk + 0.4, gz * 2, 1.3, roof, { at: [g1 + walk / 2 - 0.2, arcH, 0], high: '+x' });
    b.shed(walk + 0.4, gz * 2, 1.3, roof, { at: [g0 - walk / 2 + 0.2, arcH, 0], high: '-x' });

    // west wall of the cloister with its gate
    b.archWall(16, 4.6, 0.6, stone, { at: [-15.3, 0, 0], facing: '-x', openings: 1, openW: 2.4, openH: 3.4 });
    b.box(0.8, 0.3, 16.2, dark, { at: [-15.3, 4.6, 0] });

    // ---------------------------------------------------------------- east range: chapter house below, dormitory above
    const ex0 = 1;
    const ex1 = 7.4;
    const ez0 = -14;
    const ez1 = N.z0;
    const ex = (ex0 + ex1) / 2;
    const ezc = (ez0 + ez1) / 2;
    b.box(ex1 - ex0, 7.6, ez1 - ez0, stone, { at: [ex, 0, ezc] });
    b.gable(ex1 - ex0, ez1 - ez0, 3.4, roof, { at: [ex, 7.6, ezc], ridge: 'z', overhang: 0.3, wall: stone });
    // the chapter house entrance from the cloister: a door between two open arches
    b.panel(1.5, 2.8, P.oakDark, { at: [ex0, 0, 0], facing: '-x', shape: 'round' });
    b.sym((s) => b.panel(1.3, 2.4, P.windowDark, { at: [ex0, 0.6, s * 1.7], facing: '-x', shape: 'round' }));
    b.panel(5.2, 3.3, tint(stone, 0.05), { at: [ex0 - 0.01, 0, 0], facing: '-x', depth: 0.03 });
    // dormitory windows, both sides
    for (const z of spread(8, ez0, ez1)) {
      b.window(0.6, 1.3, { at: [ex0, 5.3, z], facing: '-x', shape: 'round', frame: dark });
      if (Math.abs(z) > 3.6) b.window(0.6, 1.3, { at: [ex1, 5.3, z], facing: '+x', shape: 'round', frame: dark });
    }
    b.window(0.8, 1.6, { at: [ex, 4.6, ez0], facing: '-z', shape: 'round', frame: dark });
    b.chimney(0.8, 1.6, 0.8, stone, { at: [ex1 - 0.6, 8.6, -10] });

    // chapter house itself, projecting east with an apse
    const chx1 = 13;
    b.box(chx1 - ex1, 6, 6, stone, { at: [(ex1 + chx1) / 2, 0, 0] });
    b.gable(chx1 - ex1, 6, 2.8, roof, { at: [(ex1 + chx1) / 2, 6, 0], overhang: 0.25, wall: stone });
    b.cyl(3, 6, stone, { at: [chx1, 0, 0], segs: 14 });
    b.cone(3.25, 2.8, roof, { at: [chx1, 6, 0], segs: 14 });
    for (const i of [2, 3, 4]) {
      const [fx, fz, fa] = facet(i, 14, 3);
      b.window(0.7, 1.8, { at: [chx1 + fx, 2.4, fz], facing: fa, shape: 'round', frame: dark });
    }
    b.sym((s) => b.window(0.7, 1.8, { at: [10, 2.4, s * 3], facing: s > 0 ? '+z' : '-z', shape: 'round', frame: dark }));

    // ---------------------------------------------------------------- refectory range
    const rz0 = -14;
    const rz1 = -8;
    const rzc = (rz0 + rz1) / 2;
    b.box(16, 6.6, rz1 - rz0, stone, { at: [-7, 0, rzc] });
    b.gable(16, rz1 - rz0, 3.3, roof, { at: [-7, 6.6, rzc], overhang: 0.3, wall: stone });
    for (const x of spread(5, -15, 1)) {
      b.window(1.0, 2.6, { at: [x, 2.2, rz0], facing: '-z', shape: 'round', frame: dark });
      b.window(0.9, 1.4, { at: [x, 4.8, rz1], facing: '+z', shape: 'round', frame: dark });
    }
    b.window(1.0, 2.6, { at: [-15, 2.6, rzc], facing: '-x', shape: 'round', frame: dark });
    b.panel(1.4, 2.6, P.oakDark, { at: [-10, 0, rz1], facing: '+z', shape: 'round' });
    b.chimney(1.0, 2.0, 1.0, stone, { at: [-13.5, 7.6, rzc + 1.5] });

    b.tree(6, { at: [15, 0, -10] });
    b.tree(4.5, { at: [-16, 0, -14.5], kind: 'round', color: P.leafDark });

    // ---------------------------------------------------------------- walk collisions
    b.collider(cx1 + cw / 2 - N.x0 + 0.4, nw + 0.6, { at: [(cx1 + cw / 2 + N.x0) / 2, 0, nz] });
    b.collider(ex1 - ex0, ez1 - ez0, { at: [ex, 0, ezc] });
    b.collider(chx1 + 3 - ex1, 6, { at: [(chx1 + 3 + ex1) / 2, 0, 0] });
    b.collider(16, rz1 - rz0, { at: [-7, 0, rzc] });
    b.sym((s) => b.collider(0.6, 6.8, { at: [-15.3, 0, s * 4.6] }));
  },
};
