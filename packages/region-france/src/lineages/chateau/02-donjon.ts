import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { MOTTE, MOTTE_DITCH, STONE, TILE, chemise, ground960, motte, pol, range, squareKeep, win } from './shared';
import { HALL, baileyDefences, baileyYard } from './01-motte';

/** The bearing of the way up the mound from the bailey (0 is +Z), and where its stair stands. */
const UP = 0.68;
const STAIR_R = MOTTE.rBase - 2.6;

/** The stone stair up the side of the mound to the gate in the ring wall (1100, kept in 1220). */
export function moundStair(b: Builder) {
  const [sx, sz] = pol(MOTTE.x, MOTTE.z, STAIR_R, UP);
  b.stairs(2.2, MOTTE.h, 5.2, 12, tint(STONE, -0.08), { at: [sx, 0, sz], rotY: UP });
}

/**
 * The hall rebuilt in stone in 1100 on the site of the timber one, and kept by the castle of 1220: a
 * first-floor hall over a storeroom, lit by round-headed windows, its door reached by an outside stair
 * from the court.
 */
export function stoneHall(b: Builder) {
  const { x, z, w, d } = HALL;
  const x0 = x - w / 2;
  range(b, x0, x + w / 2, z - d / 2, z + d / 2, 7, STONE, TILE, { ridge: 'z', rise: 3.8 });
  for (const u of [-4.6, -2.0, 2.4, 4.6]) {
    win(b, 'round', 0.3, 1.0, [x0, 1.2, z + u], '-x', { glass: P.black });
    win(b, 'round', 0.9, 2.0, [x0, 4.0, z + u], '-x', { frame: tint(STONE, 0.06), bd: 0.12, mullion: true });
    win(b, 'round', 0.9, 2.0, [x + w / 2, 4.0, z + u], '+x', { frame: tint(STONE, 0.06), bd: 0.12 });
  }
  // the outside stair rises from the court to the door, at right angles to the wall
  b.stairs(1.6, 3.4, 4.4, 9, tint(STONE, -0.06), { at: [x0 - 2.2, 0, z + 0.2], rotY: -Math.PI / 2 });
  win(b, 'round', 1.2, 2.3, [x0, 3.4, z + 0.2], '-x', { frame: tint(STONE, 0.06), glass: P.oakDark, bd: 0.14 });
}

function build(b: Builder) {
  motte(b, mix(P.turf, P.grassDry, 0.35), true);
  chemise(b, tint(STONE, -0.03), 'crenel', 0.24);
  squareKeep(b, STONE);
  moundStair(b);
  // a plank bridge from the foot of the stair over the motte ditch, on a trestle in its bottom
  const rm = (MOTTE_DITCH.r0 + MOTTE_DITCH.r1) / 2;
  const L = MOTTE_DITCH.r1 - MOTTE_DITCH.r0 + 0.8;
  const [bx, bz] = pol(MOTTE.x, MOTTE.z, rm, UP);
  b.group({ at: [bx, 0, bz], rotY: UP }, () => {
    b.box(2.2, 0.22, L, P.oak, { at: [0, 0.1, 0] });
    const g = ground960(bx, bz);
    for (const sx of [-0.9, 0.9]) b.box(0.22, 0.2 - g, 0.22, P.oakDark, { at: [sx, g - 0.1, 0] });
    b.box(2.1, 0.16, 0.26, P.oakDark, { at: [0, -0.06, 0] });
  });
  b.deck(2.2, L, 0.32, { at: [bx, 0, bz], rotY: UP });
  baileyDefences(b);
  stoneHall(b);
  baileyYard(b);
}

export const donjon: BuildingDef = {
  id: 'donjon',
  name: 'Stone keep',
  style: 'Romanesque',
  date: 'c. 1100',
  summary:
    'The timber tower gives way to a donjon of stone: a tall rectangular tower that is at once the lord’s strongroom, his hall and a statement of rank that can be seen for miles. ' +
    'Its walls are thick and stiffened by flat buttresses; the ground floor is a blind storeroom, and the only way in is a door on the first floor, reached by a stair that can be pulled away or defended. ' +
    'A stone ring wall, the chemise, closes the summit of the old mound round it. The bailey below keeps its ditches and palisade for now, but the hall is rebuilt in stone on the site of the timber one.',
  materials: ['limestone ashlar and rubble', 'lime mortar', 'flat clay tiles', 'oak floors and stair'],
  lookFor: [
    { label: 'Keep (donjon)', note: 'A rectangular stone tower about eighteen metres high, built on the old motte where the timber tower stood.', at: [MOTTE.x - 4.7, MOTTE.h + 11, MOTTE.z + 3.9] },
    { label: 'Flat buttresses', note: 'Shallow strips of masonry up each face, stiffening the walls rather than holding up any vault.', at: [MOTTE.x + 1.5, MOTTE.h + 15, MOTTE.z + 4] },
    { label: 'First-floor door', note: 'The only entrance, well above the ground and reached by a timber stair.', at: [MOTTE.x + 5, MOTTE.h + 6, MOTTE.z + 1.8] },
    { label: 'Ring wall (chemise)', note: 'A battlemented wall round the summit, closing it off as a last refuge.', at: [MOTTE.x - 6.9, MOTTE.h + 4.2, MOTTE.z - 1.5] },
    { label: 'Stone hall', note: 'The lord’s hall in the bailey, now of stone, its main room on the first floor over a storeroom.', at: [HALL.x - HALL.w / 2 - 0.3, 5, HALL.z + 2.4] },
  ],
  modelledOn:
    'Generic. The rectangular keep with flat buttresses and a first-floor entrance is after the keeps of the Loire and the north, Loches (early eleventh century) and Beaugency (late eleventh century) among them, simplified and set on the old mound.',
  build,
};
