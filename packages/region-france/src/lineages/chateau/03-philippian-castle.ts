import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { C, GATE_LIFT, MOTTE, STONE, TOWERS, castleColliders, castleDitch, chemise, curtain, curtainLines, gatehouse, motte, roundKeep, roundTower } from './shared';
import { moundStair, stoneHall } from './02-donjon';

/** The court's well (the bailey's of 960, kept) and its gravel, shared with the castle of 1395. */
export function courtYard(b: Builder, stone: number, ground: number) {
  b.cyl(0.8, 0.8, stone, { at: [3, 0, 8], segs: 8 });
  b.cyl(0.6, 0.04, P.water, { at: [3, 0.78, 8], segs: 8, mat: 'glass' });
  b.box(C.x1 - C.x0 - 4, 0.03, C.z1 - C.z0 - 8, ground, { at: [(C.x0 + C.x1) / 2 + 1, 0, 4], jitter: false });
}

function build(b: Builder) {
  motte(b, mix(P.turf, P.grassDry, 0.3), false);
  castleDitch(b);
  chemise(b, tint(STONE, -0.03), 'crenel', 0.24);
  roundKeep(b, STONE, 'crenel');
  for (const line of curtainLines()) curtain(b, line[0], line[1], GATE_LIFT, 2, STONE, { top: 'crenel', inside: C.inside, lift: GATE_LIFT });
  for (const [x, z, r, out] of TOWERS) roundTower(b, x, z, r, 0, 12.5, STONE, { top: 'crenel', outward: out, lift: 12.5 });
  gatehouse(b, STONE, 'crenel', GATE_LIFT);
  castleColliders(b);
  // the stair up the mound and the stone hall of 1100 are kept; the old ditches are filled
  moundStair(b);
  stoneHall(b);
  courtYard(b, STONE, mix(P.gravel, P.earth, 0.4));
}

export const philippianCastle: BuildingDef = {
  id: 'philippian-castle',
  name: 'Castle of Philip Augustus',
  style: 'Gothic military',
  date: 'c. 1220',
  summary:
    'Philip Augustus, who takes Normandy from the English king in 1204, gives his castles one efficient pattern. A regular four-sided enclosure of high curtain walls is flanked by round towers at the corners and along the sides, so archers can sweep every face of the wall; a round tower has no corners to undermine and turns aside stones from siege engines. ' +
    'The gate sits between two towers. The great round keep, here raised on the old mound in one corner, can still hold out alone, and the old ring wall now makes its first line of defence. ' +
    'A new ditch is dug round the circuit and the old ones filled; the stair up the mound and the stone hall of the old bailey are kept.',
  materials: ['limestone ashlar', 'rubble core', 'flat clay tiles', 'oak'],
  lookFor: [
    { label: 'Great round keep', note: 'A cylindrical donjon, the king’s signature, here about ten metres across and twenty-five high on the old motte; the king’s own, such as the Louvre’s, were some fifteen across and thirty high.', at: [MOTTE.x + 3.6, 20, MOTTE.z + 3.6] },
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
