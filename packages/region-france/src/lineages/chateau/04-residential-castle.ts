import { P, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import {
  C,
  MOTTE,
  SLATE,
  STONE,
  STONE_NEW,
  TOWERS,
  castleColliders,
  castleDitch,
  chemise,
  curtain,
  curtainLines,
  dormer,
  flat,
  gatehouse,
  motte,
  pol,
  range,
  rectPts,
  roundKeep,
  roundTower,
  win,
  type TopStyle,
} from './shared';

/** The stair tower at the inner corner of the hall and the lodgings. */
export const STAIR = { x: 6.4, z: -4.4, r: 1.6 };

/** A small standing figure in a canopied niche, as on the towers of the restored castle. */
function statue(b: Builder, at: Vec3, rotY: number, stone: number) {
  b.group({ at, rotY }, () => {
    b.box(0.8, 0.2, 0.5, stone, { at: [0, 0, 0.1] });
    b.cyl(0.22, 1.5, tint(stone, -0.04), { at: [0, 0.2, 0.15], rTop: 0.16, segs: 5 });
    b.sphere(0.15, tint(stone, -0.04), { at: [0, 1.85, 0.15], segs: 5 });
    b.cone(0.45, 0.9, stone, { at: [0, 2.15, 0.1], segs: 4, rotY: Math.PI / 4 });
  });
}

/**
 * The castle made a palace about 1395, and the same castle as rebuilt from its ruin from 1857:
 * the circuit of 1220 heightened, its towers and walls crowned with machicolations, the towers and
 * keep roofed with tall slate cones, and new buildings round the court: the lodgings (logis) against
 * the back wall, the great hall along the right-hand wall, a chapel and a stair tower. `restored`
 * makes it whiter, covers every wall-walk, adds dormers, finials, statues and a stone bridge.
 */
export function residentialCastle(b: Builder, restored: boolean) {
  const stone = restored ? STONE_NEW : STONE;
  const top: TopStyle = restored ? 'restored' : 'mach';
  const fr = tint(stone, 0.06);
  motte(b, restored ? P.grass : mix(P.turf, P.grassDry, 0.3), false);
  castleDitch(b, false);
  chemise(b, tint(stone, -0.03), 'mach', 0.24);
  roundKeep(b, stone, top);
  for (const line of curtainLines()) curtain(b, line[0], line[1], 11, 2, stone, { top, inside: C.inside });
  for (const [x, z, r, out] of TOWERS) {
    roundTower(b, x, z, r, 0, 16.5, stone, { top, outward: out, roofH: r * (restored ? 3.1 : 2.5), windows: 2 });
    if (restored) {
      const [sx, sz] = pol(x, z, r + 0.02, out);
      statue(b, [sx, 10.5, sz], out, stone);
    }
  }
  gatehouse(b, stone, top, 11);
  castleColliders(b);

  // the lodgings against the back wall: three storeys of cross windows under a tall slate roof
  const L = { x0: -1.5, x1: 13, z0: -11, z1: -4.6, h: 13.5 };
  range(b, L.x0, L.x1, L.z0, L.z1, L.h, stone, SLATE, { ridge: 'x', rise: restored ? 8 : 7 });
  for (const x of [0.5, 3.5, 9.5, 12]) {
    for (const [y, hh] of [[1.6, 2.2], [5.4, 2.6], [9.6, 2.6]] as const) win(b, 'rect', 1.2, hh, [x, y, L.z1], '+z', { frame: fr, bd: 0.12, mullion: true, transom: 0.62 });
  }
  for (const x of [1.8, 10.8]) dormer(b, [x, L.h, L.z1 - 0.2], '+z', stone, SLATE, { w: 1.4, h: 2.2, pinnacles: restored });
  if (restored) dormer(b, [-0.2, L.h, L.z1 - 0.2], '+z', stone, SLATE, { w: 1.2, h: 2.0, pinnacles: true });
  for (const x of [1, 11]) b.chimney(1.0, 4, 1.6, stone, { at: [x, L.h + 4, -7.8] });

  // the great hall on the first floor, along the right-hand wall, with tall two-light windows
  const H = { x0: 7.6, x1: 13, z0: -4.6, z1: 11, h: 11.5 };
  range(b, H.x0, H.x1, H.z0, H.z1, H.h, stone, SLATE, { ridge: 'z', rise: restored ? 6.5 : 5.6 });
  for (const z of [-1.2, 2.5, 6.2, 9.4]) {
    win(b, 'pointed', 0.6, 1.4, [H.x0, 1.2, z], '-x', { frame: fr, bd: 0.1 });
    win(b, 'pointed', 1.6, 5.2, [H.x0, 4.4, z], '-x', { frame: fr, bd: 0.15, mullion: true, transom: 0.55 });
  }
  for (const z of [0.6, 7.8]) dormer(b, [H.x0 + 0.2, H.h, z], '-x', stone, SLATE, { w: 1.3, h: 2.0, pinnacles: restored });
  b.chimney(1.0, 3.6, 1.6, stone, { at: [12, H.h + 3.2, 4.4] });
  win(b, 'pointed', 1.4, 2.6, [H.x0, 0, 4.4], '-x', { frame: fr, glass: P.oakDark, bd: 0.14 });

  // the stair tower (a spiral stair, the vis) in the angle, its roof rising above the others
  b.cyl(STAIR.r, 18, stone, { at: [STAIR.x, 0, STAIR.z], segs: 8 });
  for (let k = 0; k < 4; k++) {
    const t = Math.PI * 1.15 + k * 0.1;
    const [px, pz] = pol(STAIR.x, STAIR.z, STAIR.r * 0.97, t);
    win(b, 'rect', 0.4, 0.9, [px, 3 + k * 3.6, pz], t, { frame: fr, bd: 0.08 });
  }
  const [dx, dz] = pol(STAIR.x, STAIR.z, STAIR.r * 0.97, Math.PI * 1.75);
  win(b, 'pointed', 0.9, 2.2, [dx, 0, dz], Math.PI * 1.75, { frame: fr, glass: P.oakDark, bd: 0.12 });
  b.cone(STAIR.r + 0.35, restored ? 6.5 : 4.8, SLATE, { at: [STAIR.x, 18, STAIR.z], segs: 8 });
  if (restored) b.sphere(0.2, P.gold, { at: [STAIR.x, 24.6, STAIR.z], segs: 6 });
  b.collider(STAIR.r * 2, STAIR.r * 2, { at: [STAIR.x, 0, STAIR.z] });

  // the chapel by the left-hand wall: pointed windows, an apse and a slender spirelet (flèche)
  const K = { x0: -8.6, x1: -4.2, z0: 3, z1: 12, h: 9 };
  const kx = (K.x0 + K.x1) / 2;
  range(b, K.x0, K.x1, K.z0, K.z1, K.h, stone, SLATE, { ridge: 'z', rise: 3.8 });
  const half = { start: Math.PI / 2, sweep: Math.PI, segs: 6 };
  b.lathe([[2.2, 0], [2.2, K.h]], stone, { ...half, at: [kx, 0, K.z0] });
  b.lathe([[2.5, K.h - 0.1], [0, K.h + 3.4]], SLATE, { ...half, at: [kx, 0, K.z0] });
  for (const z of [5, 8, 11]) win(b, 'pointed', 1.0, 4.2, [K.x1, 2.8, z], '+x', { frame: fr, bd: 0.12, mullion: true });
  for (const t of [Math.PI * 0.75, Math.PI, Math.PI * 1.25]) {
    const [px, pz] = pol(kx, K.z0, 2.15, t);
    win(b, 'pointed', 0.8, 3.6, [px, 3.2, pz], t, { frame: fr, bd: 0.1 });
  }
  win(b, 'pointed', 1.4, 2.8, [kx, 0, K.z1], '+z', { frame: fr, glass: P.oakDark, bd: 0.15 });
  flat(b, [[-1.0, 0], [1.0, 0], [0, 1.3]], fr, [kx, 3.4, K.z1], '+z', 0.04);
  const fz = 8.5;
  b.cyl(0.55, 1.6, P.lead, { at: [kx, K.h + 2.8, fz], segs: 6 });
  b.cone(0.6, restored ? 7.5 : 4.5, P.lead, { at: [kx, K.h + 4.4, fz], segs: 6 });
  if (restored) b.sphere(0.18, P.gold, { at: [kx, K.h + 12, fz], segs: 6 });
  b.collider(4.4, 2.2, { at: [kx, 0, K.z0 - 1.1] });

  // paving of the court and a well
  b.box(16, 0.03, 16, mix(P.cobble, P.gravel, 0.5), { at: [-0.2, 0, 4.5], jitter: false });
  b.cyl(0.85, 0.9, stone, { at: [1.5, 0, 6], segs: 8 });
  b.cyl(0.65, 0.04, P.water, { at: [1.5, 0.88, 6], segs: 8, mat: 'glass' });
  b.sym((s) => b.box(0.14, 2.2, 0.14, P.iron, { at: [1.5 + s * 0.7, 0.9, 6], jitter: false }));
  b.box(1.6, 0.12, 0.14, P.iron, { at: [1.5, 3.05, 6], jitter: false });

  if (restored) {
    // the drawbridge replaced by a stone bridge on two arches
    const bz = C.z1 + 5;
    b.box(3.6, 0.6, 5.5, stone, { at: [C.gateX, -0.3, bz] });
    b.sym((s) => b.box(0.35, 0.9, 5.5, stone, { at: [C.gateX + s * 1.65, 0.3, bz] }));
  }
  void SLATE;
}

function build(b: Builder) {
  residentialCastle(b, false);
}

export const residentialCastleDef: BuildingDef = {
  id: 'residential-castle',
  name: 'Residential castle',
  style: 'Late Gothic',
  date: 'c. 1395',
  summary:
    'In the Hundred Years’ War the great princes, the king’s brothers and uncles, rebuild their castles as palaces that are still fortresses. ' +
    'The old circuit is raised and crowned with machicolations, stone parapets standing out on corbels with openings in the floor to drop missiles on attackers, and every tower gets a tall cone of slate. ' +
    'Inside the walls rise a great hall lit by tall windows, lodgings of three storeys with fireplaces and cross windows, a chapel and a spiral stair in its own tower: comfort and display behind high walls.',
  materials: ['fine limestone ashlar', 'slate', 'lead', 'oak', 'glass in the upper lights'],
  lookFor: [
    { label: 'Machicolations', note: 'Parapets carried out on corbels, with holes in the floor between them to drop stones on anyone at the foot of the wall.', at: [C.x1 + 1.3, 11, 6] },
    { label: 'Conical slate roofs', note: 'Tall pointed roofs on every tower, a fourteenth-century fashion that turns the fortress into a skyline.', at: [C.x1, 22, C.z1] },
    { label: 'Great hall', note: 'The hall on the first floor along the right-hand wall, lit from the court by tall two-light windows.', at: [7.4, 7, 2.5] },
    { label: 'Chapel', note: 'A chapel with an apse and pointed windows, a slender lead spirelet (flèche) on its roof.', at: [-4, 5, 8] },
    { label: 'Stair tower', note: 'A spiral stair in its own round tower, serving every floor of the hall and the lodgings.', at: [STAIR.x - 1.2, 9, STAIR.z + 1.2] },
  ],
  modelledOn:
    'Pierrefonds, rebuilt for Louis of Orléans, the king’s brother, from 1393 to about 1407, in spirit; the plan is this site’s own, and its round keep and towers are smaller than Pierrefonds’ great rectangular towers.',
  build,
};

void MOTTE;
