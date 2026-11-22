import { P, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { CX, DARK, DOOR, archPts, flat, pol, rectPts, soup, wallSeg, win, type Pt } from './shared';

const WALL = mix(P.limewash, P.rubble, 0.35);
const BAND = mix(P.brickRed, P.romanTile, 0.5);
const NAVE = { z0: -7, z1: 9, w: 8, h: 8.5 };
const CRYPT = { z0: -18, z1: -11.2, w: 8, h: 2.6 };

/** A trapezoidal stone coffin, wider at the head, with a ridged lid. */
function sarcophagus(b: Builder, x: number, z: number, rotY: number, color: number, lid = true) {
  const wh = 0.36;
  const wf = 0.26;
  const L = 1.0;
  const h = 0.55;
  const v = (sx: number, y: number, sz: number) => [sx, y, sz];
  const c = [v(-wh, 0, -L), v(wh, 0, -L), v(wf, 0, L), v(-wf, 0, L)];
  const t = [v(-wh, h, -L), v(wh, h, -L), v(wf, h, L), v(-wf, h, L)];
  const pos: number[] = [];
  const q = (a: number[], bb: number[], cc: number[], d: number[]) => pos.push(...a, ...bb, ...cc, ...a, ...cc, ...d);
  for (let i = 0; i < 4; i++) q(c[i], c[(i + 1) % 4], t[(i + 1) % 4], t[i]);
  q(t[0], t[1], t[2], t[3]);
  b.group({ at: [x, 0, z], rotY }, () => {
    soup(b, pos, color);
    if (lid) {
      const r = [v(0, h + 0.18, -L), v(0, h + 0.14, L)];
      const lp: number[] = [];
      lp.push(...t[0], ...r[0], ...r[1], ...t[0], ...r[1], ...t[3]);
      lp.push(...t[1], ...t[2], ...r[1], ...t[1], ...r[1], ...r[0]);
      lp.push(...t[0], ...t[1], ...r[0], ...t[3], ...r[1], ...t[2]);
      soup(b, lp, tint(color, 0.05));
    }
  });
}

/** A monk's cell: a small house of posts, wattle and daub, under thatch. */
function cell(b: Builder, x: number, z: number, rotY: number) {
  b.group({ at: [x, 0, z], rotY }, () => {
    b.box(3.4, 2.1, 2.8, P.daub);
    b.frame(3.4, 2.1, P.oak, { at: [0, 0, 1.4], studs: 2, rails: 0, beam: 0.18 });
    b.gable(3.4, 2.8, 2.0, P.thatch, { at: [0, 2.1, 0], overhang: 0.35, thick: 0.35, wall: P.daub });
    flat(b, rectPts(-0.4, 0, 0.4, 1.7), DOOR, [0.6, 0, 1.4], '+z', 0.08);
  });
  b.collider(3.4, 2.8, { at: [x, 0, z], rotY });
}

function build(b: Builder) {
  // ---------------------------------------------------------------- the burial church
  const zc = (NAVE.z0 + NAVE.z1) / 2;
  const len = NAVE.z1 - NAVE.z0;
  b.box(NAVE.w + 0.4, 0.35, len + 0.4, P.rubble, { at: [CX, 0, zc] });
  b.box(NAVE.w, NAVE.h, len, WALL, { at: [CX, 0, zc] });
  for (const y of [2.6, 5.4]) b.box(NAVE.w + 0.06, 0.24, len + 0.06, BAND, { at: [CX, y, zc], jitter: false });
  b.gable(NAVE.w, len, 2.6, P.romanTile, { ridge: 'z', at: [CX, NAVE.h, zc], overhang: 0.45, wall: WALL });
  b.sym((s) => {
    for (const z of [-4.5, -0.5, 3.5, 7]) win(b, 'round', 0.7, 1.4, [CX + s * NAVE.w / 2, 5.9, z], s > 0 ? '+x' : '-x', { frame: BAND, bd: 0.12 });
  });
  // apse over the saint's grave
  const half = { start: Math.PI / 2, sweep: Math.PI, segs: 8 };
  b.lathe([[3.2, 0], [3.2, 6.6]], WALL, { ...half, at: [CX, 0, NAVE.z0] });
  b.lathe([[3.2, 2.6], [3.24, 2.6], [3.24, 2.84], [3.2, 2.84]], BAND, { ...half, at: [CX, 0, NAVE.z0], jitter: false });
  b.lathe([[3.55, 6.5], [0, 8.4]], P.romanTile, { ...half, at: [CX, 0, NAVE.z0] });
  for (const t of [(3 * Math.PI) / 4, (5 * Math.PI) / 4]) {
    const [x, z] = pol(CX, NAVE.z0, 3.15, t);
    win(b, 'round', 0.6, 1.2, [x, 4.2, z], t, { frame: BAND, bd: 0.1 });
  }
  // west door under a timber porch
  win(b, 'round', 1.8, 3.0, [CX, 0.35, NAVE.z1], '+z', { frame: BAND, glass: DOOR, bd: 0.22 });
  win(b, 'round', 1.2, 1.6, [CX, 5.4, NAVE.z1], '+z', { frame: BAND, bd: 0.14 });
  b.box(5.2, 0.12, 2.6, P.rubble, { at: [CX, 0, NAVE.z1 + 1.3] });
  b.sym((s) => {
    for (const z of [NAVE.z1 + 0.4, NAVE.z1 + 2.4]) b.box(0.22, 3.2, 0.22, P.oak, { at: [CX + s * 2.4, 0, z] });
  });
  b.gable(5.6, 2.9, 1.3, P.shingle, { ridge: 'z', at: [CX, 3.2, NAVE.z1 + 1.35], overhang: 0.15, wall: P.oak });

  // ---------------------------------------------------------------- the crypt (half sunk, east of the apse)
  const cz = (CRYPT.z0 + CRYPT.z1) / 2;
  const cl = CRYPT.z1 - CRYPT.z0;
  const cw = CRYPT.w;
  const cut = b.cutaway;
  for (const s of [-1, 1]) b.box(0.6, CRYPT.h, cl, WALL, { at: [CX + s * (cw / 2 - 0.3), 0, cz] });
  b.box(cw, CRYPT.h, 0.6, WALL, { at: [CX, 0, CRYPT.z0 + 0.3] });
  b.box(cw, CRYPT.h, 0.6, WALL, { at: [CX, 0, CRYPT.z1 - 0.3] });
  b.sym((s) => {
    b.box(0.66, 0.22, cl + 0.06, BAND, { at: [CX + s * (cw / 2 - 0.3), CRYPT.h - 0.5, cz], jitter: false });
    b.box(cw + 0.06, 0.22, 0.66, BAND, { at: [CX, CRYPT.h - 0.5, s > 0 ? CRYPT.z1 - 0.3 : CRYPT.z0 + 0.3], jitter: false });
  });
  b.box(cw - 1.2, 0.04, cl - 1.2, mix(P.chalk, P.paving, 0.5), { at: [CX, 0.02, cz], jitter: false });
  // low round-headed lights just above the ground
  for (const z of [-16.2, -13.2]) {
    win(b, 'round', 0.6, 0.9, [CX + cw / 2, 0.6, z], '+x', { frame: BAND, bd: 0.1 });
    win(b, 'round', 0.6, 0.9, [CX - cw / 2, 0.6, z], '-x', { frame: BAND, bd: 0.1 });
  }
  win(b, 'round', 0.6, 0.9, [CX, 0.6, CRYPT.z0], '-z', { frame: BAND, bd: 0.1 });
  // the stair down to the crypt door, along its +X side
  const sx = CX + cw / 2 + 1.3;
  b.box(1.6, 0.03, 4.2, P.timberBlack, { at: [sx, 0.01, cz + 0.6], jitter: false });
  for (let i = 0; i < 5; i++) b.box(1.5, 0.05, 0.36, P.rubble, { at: [sx, 0.03, cz + 2.5 - i * 0.75], jitter: false });
  b.sym((s) => b.box(0.35, 0.7, 4.4, WALL, { at: [sx + s * 0.95, 0, cz + 0.6] }));
  flat(b, archPts('round', 1.0, 1.3, 2), DOOR, [CX + cw / 2, 0, cz - 1.6], '+x', 0.06);
  // inside: marble columns, the saint's tomb and the founders' sarcophagi
  for (const sx2 of [-1.5, 1.5]) for (const z of [-16.2, -14.6, -13]) {
    b.cyl(0.17, 2.1, P.marble, { at: [CX + sx2, 0, z], segs: 6 });
    b.box(0.45, 0.22, 0.45, P.craie, { at: [CX + sx2, 2.1, z], jitter: false });
  }
  b.box(1.3, 0.9, 2.2, P.marble, { at: [CX, 0, -14.6] });
  b.box(1.5, 0.15, 2.4, P.marbleGreen, { at: [CX, 0.9, -14.6] });
  sarcophagus(b, CX + 2.8, -15.6, 0, P.craie);
  sarcophagus(b, CX - 2.8, -15.6, 0, P.craie);
  sarcophagus(b, CX - 2.8, -12.9, Math.PI, P.craie);
  if (!cut) {
    b.box(cw + 0.2, 0.25, cl + 0.2, WALL, { at: [CX, CRYPT.h, cz] });
    b.gable(cw, cl, 1.7, P.romanTile, { ridge: 'z', at: [CX, CRYPT.h + 0.25, cz], overhang: 0.35, wall: WALL });
  }

  // ---------------------------------------------------------------- the cemetery: burial near the saint
  const sarc: [number, number, number][] = [
    [-17.2, 6, 0.1], [-17.4, 2.5, -0.05], [-17.1, -1, 0.08], [-17.5, -4.5, 0],
    [-4.6, 6.5, -0.1], [-4.8, 3, 0.05], [-16.6, -11.5, 0.3], [-16.8, -15, 0.2], [-5.6, -19.8, 1.4],
    [-9, -20.3, 1.5], [-13, -20.3, 1.6], [-5.2, -9.8, -0.2],
  ];
  for (const [x, z, r] of sarc) sarcophagus(b, x, z, r, mix(P.craie, P.limestone, b.rand() * 0.6), b.chance(0.75));

  // ---------------------------------------------------------------- the monks' timber cells and hall
  const cells: [number, number, number][] = [[4.5, 14.2, 0], [9.5, 14.2, 0], [14.5, 14.2, 0], [15.2, 7.5, -Math.PI / 2], [15.2, 2.0, -Math.PI / 2]];
  for (const [x, z, r] of cells) cell(b, x, z, r);
  // the common hall: refectory and dormitory under one long thatched roof
  b.group({ at: [6.5, 0, -8.5] }, () => {
    b.box(13, 3, 6, P.daub);
    for (const f of ['+z', '-z'] as const) b.frame(13, 3, P.oak, { at: [0, 0, f === '+z' ? 3 : -3], facing: f, studs: 6, rails: 1, beam: 0.2 });
    b.gable(13, 6, 3.6, P.thatch, { at: [0, 3, 0], overhang: 0.5, thick: 0.4, wall: P.daub });
    flat(b, rectPts(-0.6, 0, 0.6, 2.1), DOOR, [-2, 0, 3], '+z', 0.1);
    flat(b, rectPts(-0.6, 0, 0.6, 2.1), DOOR, [6.5, 0, 0], '+x', 0.06);
    // smoke hole in the gable, no chimney
    b.extrude([[-0.5, 0], [0.5, 0], [0, 0.6]], 0.1, P.timberBlack, { at: [6.52, 4.6, 0], rotY: Math.PI / 2 });
  });
  b.collider(13, 6, { at: [6.5, 0, -8.5] });
  // a well, a garden of beds and a fenced pen
  b.cyl(0.8, 0.8, P.rubble, { at: [5.5, 0, 4], segs: 8 });
  b.cyl(0.6, 0.04, P.water, { at: [5.5, 0.78, 4], segs: 8, mat: 'glass' });
  b.sym((s) => b.box(0.15, 2, 0.15, P.oak, { at: [5.5 + s * 0.7, 0.8, 4] }));
  b.box(1.6, 0.15, 0.15, P.oak, { at: [5.5, 2.7, 4] });
  for (let i = 0; i < 5; i++) b.box(1.2, 0.18, 7, i % 2 ? P.soil : mix(P.soil, P.leaf, 0.35), { at: [-1.5 + i * 1.6, 0, -15.5] });
  for (let i = 0; i < 3; i++) b.tree(5 + b.rand() * 1.5, { at: [10 + i * 3.6, 0, -17.5], kind: 'round' });

  // ---------------------------------------------------------------- the enclosure wall
  const X = 19.4;
  const Z = 21.1;
  const loop: Pt[][] = [
    [[-X, Z], [-13.3, Z]],
    [[-8.7, Z], [X, Z], [X, -Z], [-X, -Z], [-X, Z]],
  ];
  for (const line of loop) {
    for (let i = 0; i < line.length - 1; i++) {
      wallSeg(b, line[i], line[i + 1], 0, 2.3, 0.7, mix(P.rubble, P.earth, 0.15));
      wallSeg(b, line[i], line[i + 1], 2.3, 0.14, 0.86, P.romanTile, 0.15);
      const [x0, z0] = line[i];
      const [x1, z1] = line[i + 1];
      b.collider(Math.hypot(x1 - x0, z1 - z0) + 0.7, 0.8, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: Math.atan2(-(z1 - z0), x1 - x0) });
    }
  }
  // the gate in front of the church, under a little tiled roof
  b.sym((s) => b.box(0.9, 3.2, 1.0, P.rubble, { at: [CX + s * 2.3, 0, Z] }));
  b.gable(5.6, 1.6, 0.8, P.romanTile, { at: [CX, 3.2, Z], overhang: 0.1, wall: P.oak });
  b.box(4.4, 0.3, 0.3, P.oak, { at: [CX, 2.9, Z] });

  b.collider(NAVE.w, len, { at: [CX, 0, zc] });
  b.collider(6.4, 3.2, { at: [CX, 0, NAVE.z0 - 1.6] });
  b.collider(cw, cl, { at: [CX, 0, cz] });
}

const anchorTomb: Vec3 = [CX, 1.4, -14.6];

export const merovingianMonastery: BuildingDef = {
  id: 'merovingian-monastery',
  name: 'Merovingian monastery',
  style: 'Merovingian',
  date: 'c. 560',
  summary:
    'A Frankish king or bishop founds a community of monks outside the walls, beside the grave of a holy man, and builds a stone church over it. ' +
    'The church is a plain hall in the Roman manner, rubble and mortar with bands of brick under a low-pitched tiled roof, and the faithful want to be buried as near the saint as they can, so the ground around it fills with stone coffins. ' +
    'The saint and the founders lie in a half-sunk vaulted crypt at the east end; the monks themselves live in small timber houses inside a wall.',
  materials: ['rubble and lime mortar', 'brick bands', 'Roman-type tiles', 'chalk and marble', 'oak, wattle and daub', 'thatch'],
  lookFor: [
    { label: 'Crypt', note: 'A half-buried chapel at the east end, entered down a stair, where the saint’s tomb stands among reused marble columns.', at: anchorTomb },
    { label: 'Sarcophagi', note: 'Stone coffins, wider at the head than the foot, the usual Merovingian burial; the closer to the saint, the better.', at: [-17.2, 1.1, 6] },
    { label: 'Brick bands', note: 'Courses of flat red brick in the rubble walls, a habit kept from Roman building.', at: [CX - 4, 5.5, 3] },
    { label: 'Monks’ cells', note: 'Small houses of posts, wattle and daub, each for one or two monks; the community is still small and poor.', at: [9.5, 2.6, 15.6] },
    { label: 'Enclosure wall', note: 'The monastic precinct is walled off from the world, with one gate towards the road.', at: [CX + 2.3, 3.4, 21.4] },
  ],
  modelledOn:
    'Generic. The burial church over a saint’s grave follows Saint-Médard at Soissons, founded by Clothar I about 557 for Bishop Médard (nothing of the first church stands); the half-sunk crypt with marble columns and sarcophagi follows the seventh-century crypts of Jouarre.',
  influences: ['christian-basilica'],
  build,
};
