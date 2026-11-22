import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { MOTTE, STONE, TILE, chemise, motte, pol, range, squareKeep, win } from './shared';
import { baileyDefences, baileyYard } from './01-motte';

function build(b: Builder) {
  motte(b, mix(P.turf, P.grassDry, 0.35), true);
  chemise(b, tint(STONE, -0.03), 'crenel', 0.24);
  squareKeep(b, STONE);
  // a stone stair up the side of the mound to the gate in the ring wall
  const t = 0.68;
  const [sx, sz] = pol(MOTTE.x, MOTTE.z, 9.6, t);
  b.stairs(2.2, MOTTE.h, 5.2, 12, tint(STONE, -0.08), { at: [sx, 0, sz], rotY: t });
  baileyDefences(b);
  // the hall rebuilt in stone: a first-floor hall over a storeroom, reached by an outside stair
  const hx = 6;
  const hz = -6;
  range(b, hx - 6, hx + 6, hz - 3.2, hz + 3.2, 7, STONE, TILE, { ridge: 'x', rise: 3.8 });
  for (const x of [-4, -1.3, 1.3, 4]) {
    win(b, 'round', 0.3, 1.0, [hx + x, 1.2, hz + 3.2], '+z', { glass: P.black });
    win(b, 'round', 0.9, 2.0, [hx + x, 4.0, hz + 3.2], '+z', { frame: tint(STONE, 0.06), bd: 0.12, mullion: true });
    win(b, 'round', 0.9, 2.0, [hx + x, 4.0, hz - 3.2], '-z', { frame: tint(STONE, 0.06), bd: 0.12 });
  }
  b.stairs(1.6, 3.4, 4.4, 9, tint(STONE, -0.06), { at: [hx - 4.8, 0, hz + 5.4] });
  win(b, 'round', 1.2, 2.3, [hx - 4.8, 3.4, hz + 3.2], '+z', { frame: tint(STONE, 0.06), glass: P.oakDark, bd: 0.14 });
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
    'A stone ring wall, the chemise, closes the summit of the old mound round it. The bailey below keeps its palisade for now, but the hall is rebuilt in stone.',
  materials: ['limestone ashlar and rubble', 'lime mortar', 'flat clay tiles', 'oak floors and stair'],
  lookFor: [
    { label: 'Keep (donjon)', note: 'A rectangular stone tower about eighteen metres high, built on the old motte where the timber tower stood.', at: [MOTTE.x - 4.7, MOTTE.h + 11, MOTTE.z + 3.9] },
    { label: 'Flat buttresses', note: 'Shallow strips of masonry up each face, stiffening the walls rather than holding up any vault.', at: [MOTTE.x + 1.5, MOTTE.h + 15, MOTTE.z + 4] },
    { label: 'First-floor door', note: 'The only entrance, well above the ground and reached by a timber stair.', at: [MOTTE.x + 5, MOTTE.h + 6, MOTTE.z + 1.8] },
    { label: 'Ring wall (chemise)', note: 'A battlemented wall round the summit, closing it off as a last refuge.', at: [MOTTE.x - 6.9, MOTTE.h + 4.2, MOTTE.z - 1.5] },
    { label: 'Stone hall', note: 'The lord’s hall in the bailey, now of stone, its main room on the first floor over a storeroom.', at: [6, 5, -2.6] },
  ],
  modelledOn:
    'Generic. The rectangular keep with flat buttresses and a first-floor entrance is after the keeps of the Loire and the north, Loches (early eleventh century) and Beaugency (late eleventh century) among them, simplified and set on the old mound.',
  build,
};
