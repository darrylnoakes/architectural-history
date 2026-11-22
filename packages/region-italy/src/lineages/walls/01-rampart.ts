import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, road, ruts, stakes } from './shared';
import { WALL_COLOURS, curtain, rampartEnd } from './curtain';

const GAP = 2.7; // half-width of the gate passage

export const rampart: BuildingDef = {
  id: 'rampart',
  name: 'Earth rampart and timber gate',
  style: 'Early Iron Age',
  date: 'c. 750 BC',
  summary:
    'The first villages stood on plateaus of tufa with cliffs on most sides, so only the easy approach needed closing. ' +
    'Across it the villagers dug a ditch and heaped the spoil behind it into a bank of earth, probably crowned by a fence of stakes. ' +
    'The road passed through a gap in the bank faced with timber, closed at night by a gate of oak planks under a walkway for the lookouts. ' +
    'It is a work of many hands and no specialists: earth, timber and labour were all it needed.',
  materials: ['rammed earth and rubble', 'oak posts and planks', 'split stakes', 'turf'],
  lookFor: [
    { label: 'Earth bank', note: 'Heaped from the spoil of the ditch, it gives defenders the height and makes attackers climb.', at: [-9, 3.4, -2.5] },
    { label: 'Ditch', note: 'Dug outside the bank so that an attacker has to go down before he can climb up; the spoil made the bank.', at: [-9, 0.5, 3.2] },
    { label: 'Palisade', note: 'A fence of pointed stakes along the crest of the bank, a screen for the defenders.', at: [8.5, 5, -1.5] },
    { label: 'Timber gate', note: 'Two leaves of oak planks between heavy posts, with a fighting platform across the top of the passage.', at: [0, 4.2, -1.2] },
    { label: 'Timber revetment', note: 'Planks held back by posts keep the cut ends of the bank from slumping into the gateway.', at: [GAP + 0.1, 1.8, -3] },
  ],
  build(b) {
    const { timber, stake } = WALL_COLOURS.rampart;

    // ---------------------------------------------------------------- the road, rutted earth
    road(b, 4.2, mix(P.earth, P.gravel, 0.35), { z0: -8, z1: 8 });
    ruts(b, 1.4, tint(P.mud, -0.05));

    // ---------------------------------------------------------------- bank, ditch and counterscarp
    b.sym((s) => {
      curtain(b, 'rampart', s > 0 ? GAP : -HALF, s > 0 ? HALF : -GAP);
      rampartEnd(b, s * GAP, s);
    });

    // ---------------------------------------------------------------- the gate
    const gz = -1.2; // the gate line, under the palisade
    // four heavy posts at the corners of the passage, two more at the gate line
    for (const z of [0.4, -2.8]) b.sym((s) => b.box(0.42, 5.4, 0.42, timber, { at: [s * (GAP - 0.25), 0, z] }));
    b.sym((s) => b.box(0.36, 4.1, 0.36, timber, { at: [s * (GAP - 0.25), 0, gz] }));
    // the fighting platform over the passage: joists, planks, breastwork of stakes
    b.box(GAP * 2 + 0.4, 0.3, 3.8, tint(timber, -0.06), { at: [0, 4.1, -1.2] });
    b.sym((s) => b.box(0.3, 0.3, 3.9, timber, { at: [s * 1.2, 3.82, -1.2] }));
    stakes(b, -GAP, GAP, 0.35, 4.4, 1.2, stake);
    stakes(b, -GAP, GAP, -2.75, 4.4, 0.8, stake);
    // a ladder up to it on the town side
    b.group({ at: [GAP - 0.8, 0, -3.6] }, () => {
      b.beam([-0.25, 0, -0.9], [-0.25, 4.2, 0], 0.08, 0.1, timber);
      b.beam([0.25, 0, -0.9], [0.25, 4.2, 0], 0.08, 0.1, timber);
      for (let i = 1; i < 8; i++) {
        const t = i / 8;
        b.box(0.55, 0.06, 0.06, timber, { at: [0, t * 4.2, -0.9 + t * 0.9], jitter: false });
      }
    });
    // the two gate leaves, swung open inwards
    b.sym((s) => {
      b.group({ at: [s * (GAP - 0.5), 0, gz - 0.2], rotY: s * 1.35 }, () => {
        b.box(2.1, 3.5, 0.12, tint(timber, 0.03), { at: [-s * 1.05, 0, 0] });
        for (const y of [0.4, 1.7, 3.0]) b.box(2.0, 0.14, 0.06, tint(timber, -0.1), { at: [-s * 1.05, y, -0.09], jitter: false });
        b.beam([-s * 0.1, 0.45, -0.1], [-s * 2.0, 3.0, -0.1], 0.1, 0.06, tint(timber, -0.1));
      });
    });
    // the sill beam across the road
    b.box(GAP * 2, 0.12, 0.3, timber, { at: [0, 0, gz] });

    // ---------------------------------------------------------------- around it
    b.tree(4.4, { kind: 'olive', at: [-12.8, 0, 5.8] });
    b.tree(1.4, { kind: 'bush', at: [10.8, 0, 7.3] });
    b.tree(1.1, { kind: 'bush', at: [12.4, 0, 7.1] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => b.collider(HALF - GAP, 9.4, { at: [s * (HALF + GAP) / 2, 0, -2.9] }));
  },
};
