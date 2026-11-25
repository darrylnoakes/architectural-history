import { P, mix, tint, type BuildingDef, type Builder, type Facing, type Vec3 } from '@ah/kit';
import { DARK, SLATE, archPts, dormer, flat, rectPts, win, type Pt } from './shared';

const TUFFEAU = mix(P.craie, P.pierreBlonde, 0.35);
const TRIM = tint(TUFFEAU, 0.05);
const PILASTER = mix(TUFFEAU, P.pierreBlonde, 0.6);
/** The island the château stands on, inside its moat. */
export const ISLE = { x0: -16, x1: 16, z0: -16.5, z1: 14.5 };
const MOAT = 3.6;
const EAVES = 9.2;

/** Main block (along X, at the back) and wing (along Z, on the left): an L round the court. */
const MAIN = { x0: -5, x1: 10, z0: -14, z1: -5 };
const WING = { x0: -14, x1: -5, z0: -14, z1: 9 };
const STAIR = { x: 2.5, w: 4.6, d: 1.6 };

/** The moats of 1520 and 1660: dug 2 m deep between walled sides, the water 0.6 m below the ground. */
export const MOAT_CUT = { depth: 2.0, water: -0.6, behind: 2.0 };

/**
 * A wet moat round a rectangular island, dug out of the ground with walled sides. The hollow reaches
 * `behind` metres in under the island and out under the bank, so that the ground is at full depth
 * at the foot of each wall; the island's own surface and a paved walk round the outside cover that
 * strip. Four cuts make the ring, joined along open edges. The walls stand on the bottom and rise to
 * a stone coping, which stops where a bridge (`bridge`, and on the garden side `back`) crosses.
 */
export function moat(b: Builder, isle: { x0: number; x1: number; z0: number; z1: number }, w: number, bridge: [number, number], kerb: number, back?: [number, number], walk?: number) {
  const { x0, x1, z0, z1 } = isle;
  const { depth: D, water: wy, behind: e } = MOAT_CUT;
  const water = mix(P.water, P.glassGreen, 0.25);
  const bottom = mix(P.soil, P.water, 0.3);
  // the ring as four cuts: back and front strips across the full width, sides between them
  const X0 = x0 - w - e;
  const X1 = x1 + w + e;
  b.dig([[X0, z0 - w - e], [X1, z0 - w - e], [X1, z0 + e], [x1 - e, z0 + e], [x0 + e, z0 + e], [X0, z0 + e]], D, { slope: e, color: bottom, open: [2, 4] });
  b.dig([[X0, z1 + w + e], [X0, z1 - e], [x0 + e, z1 - e], [x1 - e, z1 - e], [X1, z1 - e], [X1, z1 + w + e]], D, { slope: e, color: bottom, open: [1, 3] });
  b.dig([[X0, z0 + e], [x0 + e, z0 + e], [x0 + e, z1 - e], [X0, z1 - e]], D, { slope: e, color: bottom, open: [0, 2] });
  b.dig([[x1 - e, z0 + e], [X1, z0 + e], [X1, z1 - e], [x1 - e, z1 - e]], D, { slope: e, color: bottom, open: [0, 2] });
  // the water: a flat sheet in the hollow
  const pieces: [number, number, number, number][] = [
    [x0 - w, x1 + w, z0 - w, z0],
    [x0 - w, x0, z0, z1],
    [x1, x1 + w, z0, z1],
    [x0 - w, x1 + w, z1, z1 + w],
  ];
  for (const [a, c, d, f] of pieces) b.box(c - a, 0.05, f - d, water, { at: [(a + c) / 2, wy - 0.05, (d + f) / 2], mat: 'glass', jitter: false });
  // walkers keep out of the water, except over the bridges
  const cols: [number, number, number, number][] = [
    [x0 - w, x0, z0, z1],
    [x1, x1 + w, z0, z1],
    [x0 - w, bridge[0], z1, z1 + w],
    [bridge[1], x1 + w, z1, z1 + w],
    ...(back ? [[x0 - w, back[0], z0 - w, z0], [back[1], x1 + w, z0 - w, z0]] as [number, number, number, number][] : [[x0 - w, x1 + w, z0 - w, z0]] as [number, number, number, number][]),
  ];
  for (const [a, c, d, f] of cols) b.collider(c - a, f - d, { at: [(a + c) / 2, 0, (d + f) / 2] });
  // the walled sides, from the bottom to the ground, all the way round both edges of the water
  const k = 0.35;
  const wall = tint(kerb, -0.12);
  const side = (a: number, c: number, d: number, f: number) => b.box(c - a, D, f - d, wall, { at: [(a + c) / 2, -D, (d + f) / 2] });
  side(x0 - k, x1 + k, z0 - k, z0);
  side(x0 - k, x0, z0, z1);
  side(x1, x1 + k, z0, z1);
  side(x0 - k, x1 + k, z1, z1 + k);
  side(x0 - w - k, x1 + w + k, z0 - w - k, z0 - w);
  side(x0 - w - k, x0 - w, z0 - w, z1 + w);
  side(x1 + w, x1 + w + k, z0 - w, z1 + w);
  side(x0 - w - k, x1 + w + k, z1 + w, z1 + w + k);
  // stone copings, stopping at the bridges
  const edge = (a: number, c: number, d: number, f: number) => b.box(c - a, 0.35, f - d, kerb, { at: [(a + c) / 2, 0, (d + f) / 2], jitter: false });
  const runX = (a: number, c: number, d: number, f: number, gap?: [number, number]) => {
    if (!gap) edge(a, c, d, f);
    else {
      edge(a, gap[0], d, f);
      edge(gap[1], c, d, f);
    }
  };
  runX(x0 - k, x1 + k, z0 - k, z0, back);
  edge(x0 - k, x0, z0, z1);
  edge(x1, x1 + k, z0, z1);
  runX(x0 - k, x1 + k, z1, z1 + k, bridge);
  runX(x0 - w - k, x1 + w + k, z0 - w - k, z0 - w, back);
  edge(x0 - w - k, x0 - w, z0 - w, z1 + w);
  edge(x1 + w, x1 + w + k, z0 - w, z1 + w);
  runX(x0 - w - k, x1 + w + k, z1 + w, z1 + w + k, bridge);
  // a gravel walk round the outside, over the strip dug in under the bank, and decks over both strips
  const wc = walk ?? mix(P.gravel, P.sand, 0.4);
  const o0 = x0 - w - k;
  const o1 = x1 + w + k;
  for (const [a, c, d, f] of [
    [o0 - e, o1 + e, z0 - w - k - e, z0 - w - k],
    [o0 - e, o1 + e, z1 + w + k, z1 + w + k + e],
    [o0 - e, o0, z0 - w - k, z1 + w + k],
    [o1, o1 + e, z0 - w - k, z1 + w + k],
  ] as const) {
    b.box(c - a, 0.02, f - d, wc, { at: [(a + c) / 2, 0, (d + f) / 2], jitter: false });
    b.deck(c - a, f - d, 0.03, { at: [(a + c) / 2, 0, (d + f) / 2] });
  }
  for (const [a, c, d, f] of [
    [x0, x1, z0, z0 + e],
    [x0, x1, z1 - e, z1],
    [x0, x0 + e, z0 + e, z1 - e],
    [x1 - e, x1, z0 + e, z1 - e],
  ] as const) b.deck(c - a, f - d, 0.03, { at: [(a + c) / 2, 0, (d + f) / 2] });
}

/**
 * A stone bridge of one arch over a moat, from z0 to z1 along Z at x, `width` wide, its deck at `top`.
 * The arch springs from the bottom of the moat; walkers cross on its deck.
 */
export function moatBridge(b: Builder, x: number, z0: number, z1: number, width: number, top: number, color: number, o?: { span?: number; parapet?: boolean }) {
  const D = MOAT_CUT.depth;
  const L = Math.abs(z1 - z0);
  const a = (o?.span ?? L - 1.6) / 2;
  const spring = top - 0.45 - a;
  const pts: Pt[] = [[-L / 2, -D - 0.05], [-a, -D - 0.05]];
  for (let i = 0; i <= 8; i++) {
    const t = Math.PI - (i * Math.PI) / 8;
    pts.push([a * Math.cos(t), spring + a * Math.sin(t)]);
  }
  pts.push([a, -D - 0.05], [L / 2, -D - 0.05], [L / 2, top], [-L / 2, top]);
  b.extrude(pts, width, color, { at: [x, 0, (z0 + z1) / 2], rotY: -Math.PI / 2 });
  if (o?.parapet !== false) b.sym((s) => b.box(0.3, 0.75, L, tint(color, 0.03), { at: [x + s * (width / 2 - 0.15), top, (z0 + z1) / 2] }));
  b.deck(width, L, top, { at: [x, 0, (z0 + z1) / 2] });
}

/** A row of Renaissance bays on a wall face: cross windows framed by pilasters, two storeys. */
function bays(b: Builder, us: number[], fixed: number, f: Facing, along: 'x' | 'z', skipGround = false) {
  for (const u of us) {
    for (const [i, y] of [1.1, 5.4].entries()) {
      if (i === 0 && skipGround) continue;
      const at: Vec3 = along === 'x' ? [u, y, fixed] : [fixed, y, u];
      win(b, 'rect', 1.35, 2.7, at, f, { frame: TRIM, bd: 0.14, mullion: true, transom: 0.62 });
    }
    // pilasters either side of the window bay, both storeys
    for (const du of [-1.15, 1.15]) {
      const at: Vec3 = along === 'x' ? [u + du, 0, fixed] : [fixed, 0, u + du];
      flat(b, rectPts(-0.15, 0.5, 0.15, EAVES - 0.95), PILASTER, at, f, 0.05);
    }
  }
}

/** A corbelled corner turret (échauguette) with a conical slate roof. */
function turret(b: Builder, x: number, z: number) {
  b.cone(1.35, 1.7, TUFFEAU, { at: [x, 1.6 + 1.7, z], segs: 10, rot: [Math.PI, 0, 0] });
  b.cyl(1.35, EAVES + 1.4 - 3.3, TUFFEAU, { at: [x, 3.3, z], segs: 10 });
  b.cyl(1.5, 0.4, TRIM, { at: [x, EAVES + 0.6, z], segs: 10, jitter: false });
  b.cone(1.6, 4.6, SLATE, { at: [x, EAVES + 1.0, z], segs: 10 });
  b.cyl(0.07, 1.4, P.lead, { at: [x, EAVES + 5.3, z], segs: 4 });
  for (const t of [0.4, 2.4, 4.3]) {
    const px = x + 1.33 * Math.sin(t);
    const pz = z + 1.33 * Math.cos(t);
    win(b, 'rect', 0.4, 0.9, [px, 6.4, pz], t, { frame: TRIM, bd: 0.06 });
  }
}

function build(b: Builder) {
  // the island: gravel court, and an enclosed garden of square beds to the right
  b.box(ISLE.x1 - ISLE.x0, 0.03, ISLE.z1 - ISLE.z0, mix(P.gravel, P.sand, 0.3), { at: [(ISLE.x0 + ISLE.x1) / 2, 0, (ISLE.z0 + ISLE.z1) / 2], jitter: false });
  moat(b, ISLE, MOAT, [1.2, 3.8], TRIM);

  // ---------------------------------------------------------------- the two ranges
  for (const k of [MAIN, WING]) {
    const w = k.x1 - k.x0;
    const d = k.z1 - k.z0;
    const cx = (k.x0 + k.x1) / 2;
    const cz = (k.z0 + k.z1) / 2;
    b.box(w, EAVES, d, TUFFEAU, { at: [cx, 0, cz] });
    b.box(w + 0.2, 0.5, d + 0.2, tint(TUFFEAU, -0.04), { at: [cx, 0, cz] });
    b.box(w + 0.1, 0.25, d + 0.1, TRIM, { at: [cx, 4.4, cz], jitter: false });
    // the false machicolations under the eaves: a corbelled cornice, purely for show
    b.box(w + 0.45, 0.3, d + 0.45, tint(TUFFEAU, -0.3), { at: [cx, EAVES - 0.95, cz], jitter: false });
    b.box(w + 0.6, 0.7, d + 0.6, TRIM, { at: [cx, EAVES - 0.65, cz], jitter: false });
    b.collider(w, d, { at: [cx, 0, cz] });
  }
  b.hip(MAIN.x1 - MAIN.x0 + 0.6, MAIN.z1 - MAIN.z0 + 0.6, 7.6, SLATE, { at: [(MAIN.x0 + MAIN.x1) / 2, EAVES + 0.05, (MAIN.z0 + MAIN.z1) / 2] });
  b.hip(WING.x1 - WING.x0 + 0.6, WING.z1 - WING.z0 + 0.6, 7.6, SLATE, { at: [(WING.x0 + WING.x1) / 2, EAVES + 0.05, (WING.z0 + WING.z1) / 2] });

  // windows and pilasters: the court fronts, the outer fronts and the ends
  bays(b, [-3, -0.6, 6.6, 8.8], MAIN.z1, '+z', 'x');
  bays(b, [-2.4, 1.2, 4.6, 7.6], WING.x1, '+x', 'z');
  bays(b, [-11.5, -8, -4.5, -1, 2.5, 6, 8.6], MAIN.z0, '-z', 'x');
  bays(b, [-11, -7.5, -4, -0.5, 3, 6.5], WING.x0, '-x', 'z');
  bays(b, [-8.7, -11.6], WING.z1, '+z', 'x');
  bays(b, [-11.6, -7.4], MAIN.x1, '+x', 'z');
  win(b, 'round', 1.5, 2.9, [WING.x1, 0, 3], '+x', { frame: TRIM, glass: P.oakDark, bd: 0.16 });

  // ---------------------------------------------------------------- the grand staircase
  const sz = MAIN.z1 + STAIR.d / 2;
  b.box(STAIR.w, EAVES + 0.4, STAIR.d, TUFFEAU, { at: [STAIR.x, 0, sz] });
  const fz = MAIN.z1 + STAIR.d;
  for (const y of [0, 4.6]) {
    // two open bays on each floor: the loggias of the straight stair, dark behind
    for (const dx of [-1.05, 1.05]) flat(b, archPts('round', 1.5, 3.6, 2), DARK, [STAIR.x + dx, y + 0.3, fz], '+z', 0.04);
    for (const dx of [-2.1, 0, 2.1]) b.box(0.4, 4.2, 0.2, TRIM, { at: [STAIR.x + dx, y, fz + 0.1], jitter: false });
    b.box(STAIR.w + 0.3, 0.35, 0.3, TRIM, { at: [STAIR.x, y + 4.2, fz + 0.1], jitter: false });
  }
  // carried up through the roof as a great gabled dormer with pinnacles and a shell-headed niche
  b.box(STAIR.w, 4.2, 1.0, TUFFEAU, { at: [STAIR.x, EAVES, fz - 0.5] });
  b.extrude([[-STAIR.w / 2, 0], [STAIR.w / 2, 0], [0, 2.6]], 1.0, TUFFEAU, { at: [STAIR.x, EAVES + 4.2, fz - 0.5] });
  b.gable(STAIR.w, 3, 2.6, SLATE, { ridge: 'z', at: [STAIR.x, EAVES + 4.2, fz - 2.2], overhang: 0.1, wall: TUFFEAU });
  win(b, 'round', 1.4, 2.8, [STAIR.x, EAVES + 0.6, fz], '+z', { frame: TRIM, bd: 0.14, mullion: true });
  flat(b, archPts('round', 1.0, 1.5, 3), TRIM, [STAIR.x, EAVES + 4.4, fz], '+z', 0.05);
  b.sym((s) => {
    b.box(0.35, 4.6, 0.35, TRIM, { at: [STAIR.x + s * (STAIR.w / 2), EAVES, fz - 0.1] });
    b.cone(0.28, 1.6, TRIM, { at: [STAIR.x + s * (STAIR.w / 2), EAVES + 4.6, fz - 0.1], segs: 4 });
  });
  b.cone(0.3, 1.6, TRIM, { at: [STAIR.x, EAVES + 6.75, fz - 0.4], segs: 4 });
  b.collider(STAIR.w, STAIR.d, { at: [STAIR.x, 0, sz] });

  // ---------------------------------------------------------------- dormers, turrets, chimneys
  for (const x of [-1.8, 7.7]) dormer(b, [x, EAVES, MAIN.z1 + 0.1], '+z', TUFFEAU, SLATE, { w: 1.5, h: 2.6, pinnacles: true });
  for (const z of [-0.6, 6.1]) dormer(b, [WING.x1 + 0.1, EAVES, z], '+x', TUFFEAU, SLATE, { w: 1.5, h: 2.6, pinnacles: true });
  for (const x of [-9.75, -2.75, 4.25]) dormer(b, [x, EAVES, MAIN.z0 - 0.1], '-z', TUFFEAU, SLATE, { w: 1.4, h: 2.4, pinnacles: true });
  for (const z of [-5.75, 1.25]) dormer(b, [WING.x0 - 0.1, EAVES, z], '-x', TUFFEAU, SLATE, { w: 1.4, h: 2.4, pinnacles: true });
  for (const [x, z] of [[MAIN.x1, MAIN.z0], [MAIN.x1, MAIN.z1], [WING.x0, WING.z0], [WING.x0, WING.z1], [WING.x1, WING.z1]] as const) {
    turret(b, x, z);
    b.collider(2.7, 2.7, { at: [x, 0, z] });
  }
  for (const [x, z] of [[-9.5, -12.2], [-9.5, 4], [0, -9.5], [6.5, -9.5]] as const) {
    b.chimney(1.1, 5.6, 2.0, TUFFEAU, { at: [x, EAVES + 4.4, z] });
    b.box(1.5, 0.25, 2.4, TRIM, { at: [x, EAVES + 8.6, z], jitter: false });
  }

  // ---------------------------------------------------------------- bridge and garden
  moatBridge(b, 2.5, ISLE.z1 - 0.6, ISLE.z1 + MOAT + 0.6, 2.6, 0.3, TRIM, { span: MOAT - 1.2 });
  const gx = 9;
  const gz = 4.5;
  for (const sx of [-1, 1]) {
    for (const sz2 of [-1, 1]) {
      const cx = gx + sx * 2.6;
      const cz = gz + sz2 * 3.0;
      b.box(4.4, 0.06, 5.2, mix(P.grass, P.meadow, 0.4), { at: [cx, 0, cz], jitter: false });
      for (const [w, d, dx, dz] of [[4.6, 0.35, 0, 2.6], [4.6, 0.35, 0, -2.6], [0.35, 5.2, 2.2, 0], [0.35, 5.2, -2.2, 0]] as const) {
        b.box(w, 0.45, d, P.hedge, { at: [cx + dx, 0, cz + dz], jitter: false });
      }
      b.box(2.8, 0.4, 0.3, P.hedge, { at: [cx, 0, cz], rotY: Math.PI / 4, jitter: false });
      b.box(2.8, 0.4, 0.3, P.hedge, { at: [cx, 0, cz], rotY: -Math.PI / 4, jitter: false });
    }
  }
  b.cyl(1.0, 0.6, TRIM, { at: [gx, 0, gz], segs: 10 });
  b.cyl(0.8, 0.05, P.water, { at: [gx, 0.58, gz], segs: 10, mat: 'glass' });
  b.cyl(0.18, 1.4, TRIM, { at: [gx, 0.6, gz], segs: 6 });
  b.collider(2, 2, { at: [gx, 0, gz] });
  // a gallery of trellis along the garden's far edge
  for (const z of [-2.5, 0.5, 3.5, 6.5, 9.5, 12.5]) b.box(0.15, 2.4, 0.15, P.oak, { at: [ISLE.x1 - 1, 0, z] });
  b.box(0.15, 0.15, 15.2, P.oak, { at: [ISLE.x1 - 1, 2.4, 5] });
  b.box(1.2, 0.5, 15, P.leaf, { at: [ISLE.x1 - 1, 2.4, 5] });
}

export const renaissanceChateau: BuildingDef = {
  id: 'renaissance-chateau',
  name: 'Renaissance château',
  style: 'French Renaissance',
  date: 'c. 1520',
  summary:
    'Back from the Italian wars, the king’s financiers and courtiers build country houses that keep the look of a castle but none of its purpose. ' +
    'The plan is regular and the fronts symmetrical, ruled into a grid of pilasters and string courses round big cross windows, and the staircase is the centrepiece: straight flights behind open loggias, rising through the roof as a great dormer. ' +
    'Turrets, a corbelled cornice like machicolations and a moat remain, but only for show and for reflection: the walls are pierced on every side and the steep slate roofs bristle with carved dormers and tall chimneys.',
  materials: ['fine white limestone (on the Loire, tuffeau)', 'slate', 'lead', 'glass in leaded lights'],
  lookFor: [
    { label: 'Grand staircase', note: 'Straight flights stacked behind open loggias in the middle of the front, an Italian idea; the castle had hidden its stair in a turret.', at: [STAIR.x, 6.5, MAIN.z1 + STAIR.d + 0.2] },
    { label: 'Pilasters and cross windows', note: 'Flat classical pilasters frame windows divided by a stone cross into four lights, in a regular grid.', at: [-0.6 + 1.15, 4, MAIN.z1 + 0.2] },
    { label: 'Dormers', note: 'Tall carved dormer windows with pinnacles, lighting the attic and making the roof part of the display.', at: [7.7, EAVES + 2.6, MAIN.z1 + 0.4] },
    { label: 'Corner turrets', note: 'Little towers corbelled out at the corners, a memory of the castle kept as ornament.', at: [MAIN.x1 + 1.4, 7, MAIN.z1 + 0.4] },
    { label: 'Moat', note: 'Water all round, crossed by a bridge: no longer a defence but a mirror and a sign of noble rank.', at: [-14, 0.5, ISLE.z1 + MOAT / 2] },
  ],
  modelledOn:
    'Azay-le-Rideau (about 1518 to 1527), built for the financier Gilles Berthelot: its L plan, straight staircase with loggias, corner turrets, corbelled cornice and moat; the garden of square beds is generic.',
  influences: ['italian-renaissance'],
  build,
};
