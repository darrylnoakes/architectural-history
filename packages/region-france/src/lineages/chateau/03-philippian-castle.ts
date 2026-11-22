import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { C, MOTTE, STONE, TILE, TOWERS, castleColliders, castleDitch, chemise, curtain, curtainLines, gatehouse, motte, range, roundKeep, roundTower, win } from './shared';

function build(b: Builder) {
  motte(b, mix(P.turf, P.grassDry, 0.3), false);
  castleDitch(b, false);
  chemise(b, tint(STONE, -0.03), 'crenel', 0.24);
  roundKeep(b, STONE, 'crenel');
  for (const line of curtainLines()) curtain(b, line[0], line[1], 9, 2, STONE, { top: 'crenel', inside: C.inside });
  for (const [x, z, r, out] of TOWERS) roundTower(b, x, z, r, 0, 12.5, STONE, { top: 'crenel', outward: out });
  gatehouse(b, STONE, 'crenel', 9);
  castleColliders(b);
  // the hall and lodgings against the back wall
  range(b, 0.5, 13, -11, -5.2, 8, STONE, TILE, { ridge: 'x', rise: 3.9 });
  for (const x of [2.5, 6, 9.5]) {
    win(b, 'pointed', 0.4, 1.2, [x, 1.4, -5.2], '+z', { glass: P.black });
    win(b, 'pointed', 1.0, 2.4, [x, 4.2, -5.2], '+z', { frame: tint(STONE, 0.06), bd: 0.12, mullion: true });
  }
  win(b, 'pointed', 1.3, 2.5, [12, 0, -5.2], '+z', { frame: tint(STONE, 0.06), glass: P.oakDark, bd: 0.14 });
  b.cyl(0.8, 0.8, STONE, { at: [3, 0, 5], segs: 8 });
  b.cyl(0.6, 0.04, P.water, { at: [3, 0.78, 5], segs: 8, mat: 'glass' });
  b.box(C.x1 - C.x0 - 4, 0.03, C.z1 - C.z0 - 8, mix(P.gravel, P.earth, 0.4), { at: [(C.x0 + C.x1) / 2 + 1, 0, 4], jitter: false });
}

export const philippianCastle: BuildingDef = {
  id: 'philippian-castle',
  name: 'Castle of Philip Augustus',
  style: 'Gothic military',
  date: 'c. 1220',
  summary:
    'Philip Augustus, who takes Normandy from the English king in 1204, gives his castles one efficient pattern. A regular four-sided enclosure of high curtain walls is flanked by round towers at the corners and along the sides, so archers can sweep every face of the wall; a round tower has no corners to undermine and turns aside stones from siege engines. ' +
    'The gate sits between two towers. The great round keep, here raised on the old mound in one corner, can still hold out alone, and the old ring wall now makes its first line of defence.',
  materials: ['limestone ashlar', 'rubble core', 'flat clay tiles', 'oak'],
  lookFor: [
    { label: 'Great round keep', note: 'A cylindrical donjon about ten metres across and twenty-five high, the king’s signature, here on the old motte.', at: [MOTTE.x + 3.6, 20, MOTTE.z + 3.6] },
    { label: 'Round flanking towers', note: 'Towers at the corners and along the walls, projecting so that defenders can shoot along the face of the curtain.', at: [C.x1 + 2.2, 9, C.z1 + 2.2] },
    { label: 'Twin-towered gate', note: 'The entrance between two round towers, closed by a portcullis behind a bridge over the ditch.', at: [C.gateX, 5.2, C.z1 + 2.3] },
    { label: 'Arrow loops', note: 'Tall narrow slits, splayed wide on the inside, through which crossbowmen could shoot without being hit.', at: [C.x1 + 3.1, 4.5, C.z0 - 0.4] },
    { label: 'Regular plan', note: 'A near-rectangle of straight curtain walls, laid out at once rather than grown piece by piece.', at: [8, 11, C.z1 + 1.1] },
  ],
  modelledOn:
    'Generic, after the castles of Philip Augustus: Dourdan (about 1220), where the round keep stands at one corner of a regular square, and the Louvre (begun about 1190); the keep on its earlier mound is a local twist.',
  influences: ['crusader-castles'],
  build,
};
