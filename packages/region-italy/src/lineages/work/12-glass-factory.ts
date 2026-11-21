import { P, car, tint, type BuildingDef, type Builder } from '@ah/kit';
import { lin, riverWall } from './shared';

/** A glass curtain wall of w × h on a wall plane: one glazed sheet with slender mullions and transoms. */
export function curtainWall(b: Builder, w: number, h: number, at: [number, number, number], rotY: number, o?: { cols?: number; rows?: number; frame?: number; glass?: number }) {
  const cols = o?.cols ?? Math.round(w / 1.25);
  const rows = o?.rows ?? 1;
  const frame = o?.frame ?? P.aluminium;
  b.group({ at, rotY }, () => {
    b.box(w, h, 0.06, o?.glass ?? P.glass, { at: [0, 0, 0], mat: 'glass', jitter: false });
    for (const x of lin(cols + 1, -w / 2, w / 2)) b.box(0.06, h, 0.12, frame, { at: [x, 0, 0.04], jitter: false });
    for (let j = 0; j <= rows; j++) b.box(w, 0.07, 0.12, frame, { at: [0, (h * j) / rows - (j === rows ? 0.07 : 0), 0.04], jitter: false });
  });
}

export const glassFactory: BuildingDef = {
  id: 'glass-factory',
  name: 'Glass-walled factory with canteen and nursery',
  style: 'Post-war Modernism',
  date: 'c. 1957',
  summary:
    'After the war an enlightened industrialist could build a factory as a piece of the good city. ' +
    'Here the workshops for making typewriters and calculating machines sit behind a long wall of glass on a slender concrete frame, so the workers see the hills and the town sees the work, with sun louvres to keep out the glare. ' +
    'Around it, set in gardens, stand the services the firm gave its people: a canteen looking over the river, a nursery for workers’ children, a library and a health centre. ' +
    'Electric machines and light industry need no water and no chimney: the river bank becomes a garden.',
  materials: ['reinforced concrete frame', 'glass curtain wall', 'aluminium', 'stone paving'],
  modelledOn: 'The Olivetti works at Ivrea (Luigi Figini and Gino Pollini, 1934 to 1959), with a canteen recalling Ignazio Gardella’s (1953 to 1959), simplified',
  lookFor: [
    { label: 'Glass curtain wall', note: 'A continuous skin of glass hung in front of the concrete frame, floor after floor.', at: [-10, 6.0, 9.6] },
    { label: 'Sun louvres (brise-soleil)', note: 'Rows of upright concrete fins shade the glass from the low sun without blocking the view.', at: [8, 7.5, 10.4] },
    { label: 'Canteen', note: 'A low pavilion on the river bank where everyone ate together, looking out over the water.', at: [-10, 4.4, -6.5] },
    { label: 'Nursery', note: 'The workers’ children were looked after in a sunny nursery with its own garden and play yard.', at: [10.5, 3.8, -5.0] },
    { label: 'Pilotis', note: 'The building stands back on slim columns at ground level, making a covered entrance.', at: [-2.5, 1.5, 9.0] },
  ],
  influences: ['rationalism'],
  build(b) {
    const concrete = P.concreteWhite;
    const stone = P.travertine;

    riverWall(b, -17.6, 17.6, P.concrete, { coping: stone });
    b.box(35, 0.04, 21, P.grass, { at: [0, 0, 0], jitter: false });

    // ---- the factory block: three storeys, concrete frame, a glass skin, a recessed ground floor
    const W = 30;
    const D = 9;
    const x0 = 0;
    const z0 = 4.6;
    const fl = 4.0;
    const floors = 3;
    const H = fl * floors;
    const front = z0 + D / 2;
    b.box(W - 0.6, H, D - 0.6, tint(concrete, -0.18), { at: [x0, 0, z0] });
    // ground floor set back behind pilotis
    b.box(W, 0.3, D, concrete, { at: [x0, fl - 0.3, z0] });
    for (const x of lin(9, x0 - W / 2 + 0.4, x0 + W / 2 - 0.4)) b.cyl(0.22, fl - 0.3, concrete, { at: [x, 0, front - 0.4], segs: 10 });
    curtainWall(b, W - 1.2, fl - 0.6, [x0, 0.3, front - 2.0], 0, { cols: 24 });
    b.box(W, 0.3, 2.0, tint(P.paving, 0.04), { at: [x0, 0, front - 1.0] });
    // upper floors: the glass skin, floor edges and a thin roof slab
    for (let k = 1; k < floors; k++) b.box(W + 0.2, 0.35, D + 0.2, concrete, { at: [x0, k * fl - 0.35, z0] });
    curtainWall(b, W, H - fl, [x0, fl, front + 0.08], 0, { cols: 24, rows: 2 });
    curtainWall(b, W, H - fl, [x0, fl, z0 - D / 2 - 0.08], Math.PI, { cols: 24, rows: 2 });
    b.sym((s) => curtainWall(b, D, H - 0.3, [x0 + s * (W / 2 + 0.08), 0.3, z0], (s * Math.PI) / 2, { cols: 7, rows: 3 }));
    b.box(W + 1.2, 0.45, D + 1.2, concrete, { at: [x0, H, z0] });
    // sun louvres over the western bays: upright concrete fins in front of the glass
    for (const x of lin(16, x0 + 3, x0 + W / 2 - 0.3)) b.box(0.12, H - fl + 0.3, 0.9, concrete, { at: [x, fl - 0.3, front + 0.6] });
    b.box(W / 2 - 2.7, 0.2, 1.1, concrete, { at: [x0 + 3 + (W / 2 - 3.3) / 2, fl - 0.3, front + 0.55] });
    b.box(W / 2 - 2.7, 0.2, 1.1, concrete, { at: [x0 + 3 + (W / 2 - 3.3) / 2, H, front + 0.55] });
    // stair tower clad in stone at the eastern end, and a roof plant room
    b.box(3.6, H + 2.4, 3.4, stone, { at: [x0 - W / 2 + 2.4, 0, z0 - D / 2 - 1.7] });
    curtainWall(b, 1.4, H, [x0 - W / 2 + 0.58, 0.6, z0 - D / 2 - 1.7], -Math.PI / 2, { cols: 1, rows: 6 });
    b.box(8, 2.4, 4, concrete, { at: [x0 + 4, H + 0.45, z0 - 1] });
    b.panel(5.0, 0.7, P.cladRed, { at: [x0 - W / 2 + 3.5, H - 0.75, front + 0.15], facing: '+z' }); // a sign band

    // ---- a covered walk on thin columns from the factory to the services by the river
    const wz0 = z0 - D / 2;
    b.box(2.6, 0.18, wz0 + 4.0, concrete, { at: [-2, 2.8, (wz0 - 4.0) / 2] });
    for (const z of lin(3, -3.6, wz0 - 0.6)) b.sym((s) => b.cyl(0.08, 2.8, P.steel, { at: [-2 + s * 1.1, 0, z], segs: 6 }));
    b.box(2.0, 0.05, wz0 + 4.0, P.paving, { at: [-2, 0, (wz0 - 4.0) / 2], jitter: false });

    // ---- the canteen on the bank: a low glazed pavilion on an angled plan with a terrace over the river
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
      b.extrude(hex, 0.5, P.paving, { at: [0, 0, 0.25] }); // floor plinth
      b.extrude(hex, 0.4, concrete, { at: [0, 0, 3.8] }); // roof slab
    });
    // glazing between plinth and roof, edge by edge
    for (let i = 0; i < hex.length; i++) {
      const [ax, az] = hex[i];
      const [bx2, bz2] = hex[(i + 1) % hex.length];
      const len = Math.hypot(bx2 - ax, bz2 - az);
      const ang = Math.atan2(bz2 - az, bx2 - ax);
      const mx = cx + (ax + bx2) / 2;
      const mz = cz - (az + bz2) / 2;
      curtainWall(b, len - 0.2, 3.1, [mx, 0.5, mz], ang + Math.PI, { cols: Math.round(len / 1.4), rows: 1, glass: P.glassGreen });
      b.cyl(0.12, 3.1, concrete, { at: [cx + ax, 0.5, cz - az], segs: 8 });
    }
    b.box(3.0, 1.6, 2.4, stone, { at: [cx - 3.5, 4.2, cz] }); // kitchen flue housing
    // terrace with a railing over the river
    b.box(14, 0.3, 2.0, stone, { at: [cx, 0, -10.0] });
    b.box(14, 0.05, 0.05, P.steel, { at: [cx, 1.1, -10.9] });
    for (const x of lin(15, cx - 7, cx + 7)) b.box(0.05, 1.1, 0.05, P.steel, { at: [x, 0, -10.9] });

    // ---- the nursery: a low white pavilion with a pergola and its own fenced garden
    const nx = 10.5;
    const nz = -5.2;
    b.box(10, 3.2, 5.0, concrete, { at: [nx, 0, nz] });
    b.box(10.8, 0.3, 5.8, concrete, { at: [nx, 3.2, nz] });
    curtainWall(b, 8.6, 2.6, [nx, 0.3, nz + 2.54], 0, { cols: 7, rows: 1, glass: P.glassGreen });
    for (const x of lin(4, nx - 3.8, nx + 3.8)) b.panel(1.2, 1.2, P.glassDark, { at: [x, 1.4, nz - 2.5], facing: '-z' });
    // pergola over the play terrace
    for (const x of lin(5, nx - 4.5, nx + 4.5)) {
      b.cyl(0.08, 2.8, P.steel, { at: [x, 0, nz + 5.4], segs: 6 });
      b.box(0.12, 0.16, 3.0, P.oak, { at: [x, 2.8, nz + 4.0] });
    }
    b.box(9.4, 0.14, 0.14, P.oak, { at: [nx, 2.8, nz + 5.4] });
    b.box(9.4, 0.04, 2.8, P.paving, { at: [nx, 0, nz + 4.0], jitter: false });
    // sandpit, a slide, little low wall round the garden
    b.box(2.4, 0.3, 2.4, stone, { at: [nx + 4.5, 0, -9.0] });
    b.box(2.0, 0.04, 2.0, P.sand, { at: [nx + 4.5, 0.27, -9.0], jitter: false });
    b.beam([nx + 1.0, 1.3, -9.4], [nx + 2.6, 0.2, -9.4], 0.5, 0.06, P.cladYellow);
    b.box(0.6, 1.3, 0.6, P.cladBlue, { at: [nx + 0.7, 0, -9.4] });
    b.box(13, 0.7, 0.2, concrete, { at: [nx, 0, -2.0] });

    // ---- forecourt with paving, a few cars of the boom years, pines along the street
    b.box(30, 0.05, 2.4, P.paving, { at: [x0, 0, front + 1.6], jitter: false });
    car(b, 'sixties', P.cream, [-12, 0, 10.0], Math.PI / 2);
    car(b, 'sixties', P.doorBlue, [8, 0, 10.0], Math.PI / 2);
    b.tree(11, { at: [-17, 0, -1], kind: 'pine' });
    b.tree(10, { at: [3.5, 0, -8], kind: 'pine' });
    b.tree(5, { at: [16.5, 0, 1], kind: 'round' });

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(13, 6.2, { at: [cx, 0, cz] });
    b.collider(10, 5, { at: [nx, 0, nz] });
  },
};
