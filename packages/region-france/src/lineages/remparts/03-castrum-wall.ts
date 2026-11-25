import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, gateLeaves, road } from './shared';
import { CASTRUM, CASTRUM_GATE, castrumGate, curtain } from './curtain';

const WF = CASTRUM.t / 2; // outer face of the wall
const G = CASTRUM_GATE.half; // where the gate's own masonry ends and the plain wall begins
const WAY = CASTRUM_GATE.way;

export const castrumWall: BuildingDef = {
  id: 'castrum-wall',
  name: 'Late Roman wall and gate',
  style: 'Late Roman',
  date: 'late 3rd to early 4th century',
  summary:
    'After the invasions of 275 and 276 the towns of Gaul walled themselves in, in a hurry and in a much smaller circuit than the open town had covered: here about a third of it, round the forum and a few streets. The wall was built of the town itself: its footing is a mass of big blocks taken from tombs, temples and public buildings, column drums and inscriptions among them, and above that it is rubble and mortar faced with small squared stones and laced with bands of brick. ' +
    'Half-round towers stand out from the wall about every thirty metres so that archers could shoot along its face. ' +
    'There are few gates, one on each main street: a single arched passage through the thickness of the wall, closed by oak doors, between two towers. The suburbs outside, and the triumphal arches on the roads, are left to fall down.',
  materials: ['reused blocks from older buildings', 'small squared limestone (petit appareil)', 'brick lacing courses', 'mortared rubble core', 'roof tiles'],
  modelledOn:
    'The late Roman walls of Le Mans (the best preserved in France, with their towers and patterned facing) and of Senlis, and their plain gates of a single passage. At Reims, by contrast, the wall was drawn through the town’s four monumental arches, which became its gates; that is how the Porte de Mars survived.',
  lookFor: [
    { label: 'Reused blocks', note: 'The footing is made of stones from demolished monuments: a column drum, a cornice, an inscription, laid in with plain blocks.', at: [13.0, 0.9, WF + 0.5] },
    { label: 'Brick bands', note: 'Courses of flat Roman bricks run through the wall every metre and a half, levelling the work and binding the small facing stones to the core.', at: [13.6, 4.6, WF + 0.2] },
    { label: 'Half-round tower', note: 'Towers stand out from the wall with a rounded front, so that defenders could shoot along its face and no corner offered itself to a battering ram.', at: [WAY + 3.2, 9.6, CASTRUM.tower.z + 2.9] },
    { label: 'Gate', note: 'One arched passage, its arch turned in brick, between two towers: narrow enough to be held by a few men and closed by a pair of oak doors.', at: [0, 3.6, WF + 0.3] },
  ],
  build(b) {
    const { stone, spolia, brick } = WALL_COLOURS.castrum;

    road(b, 2 * WAY - 0.2, mix(P.cobble, P.limestone, 0.3));
    for (let z = -7.6; z < 8; z += 1.2) b.box(2 * WAY - 0.2, 0.01, 0.05, tint(P.cobble, -0.15), { at: [0, 0.04, z], ...NJ });

    // ---------------------------------------------------------------- the wall either side, and the gate between its towers
    b.sym((s) => curtain(b, 'castrum', s > 0 ? G : -HALF, s > 0 ? HALF : -G, { towers: false, detail: true }));
    castrumGate(b);
    gateLeaves(b, 2 * WAY - 0.1, CASTRUM_GATE.spring + WAY * 0.6, -WF + 0.5, mix(P.oak, P.oakDark, 0.4), { open: 1.35, iron: true });

    // ---------------------------------------------------------------- carved pieces in the footing, field side
    const zf = WF + 0.15;
    b.group({ at: [12.2, 0, zf] }, () => {
      // a fluted column drum laid on its side, end on
      b.panel(0.82, 0.82, tint(spolia, 0.05), { at: [0, 0.03, 0], shape: 'circle', depth: 0.08 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.panel(0.06, 0.06, tint(spolia, -0.2), { at: [Math.cos(a) * 0.3, 0.41 + Math.sin(a) * 0.3, 0.02], depth: 0.1 });
      }
    });
    b.group({ at: [13.9, 0, zf] }, () => {
      // part of a moulded cornice, upside down
      b.panel(1.5, 0.18, tint(spolia, 0.05), { at: [0, 0.05, 0], depth: 0.12 });
      b.panel(1.4, 0.14, tint(spolia, -0.1), { at: [0, 0.23, 0], depth: 0.06 });
      b.panel(1.3, 0.2, tint(spolia, 0.04), { at: [0, 0.37, 0], depth: 0.1 });
    });
    b.group({ at: [-13.1, 0, zf] }, () => {
      // a funerary inscription
      b.panel(1.3, 0.62, tint(spolia, 0.07), { at: [0, 0.95, 0], depth: 0.06 });
      for (const y of [1.08, 1.24, 1.4]) b.panel(1.0, 0.05, tint(spolia, -0.3), { at: [0, y, 0.01], depth: 0.07 });
    });

    // ---------------------------------------------------------------- the town side: a stair up to the wall-walk
    b.stairs(1.3, CASTRUM.h, 6.0, 14, tint(stone, -0.05), { at: [-12.0, 0, -WF - 0.7], rotY: Math.PI / 2 });
    b.box(1.3, 0.2, 1.3, tint(brick, -0.05), { at: [-14.4, CASTRUM.h - 0.2, -WF - 0.7] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - WAY, CASTRUM.t + 0.3, { at: [(s * (HALF + WAY)) / 2, 0, 0] });
      b.collider(5.6, 5.6, { at: [s * (WAY + 3.2), 0, CASTRUM.tower.z] });
    });
    b.collider(6.0, 1.3, { at: [-12.0, 0, -WF - 0.7] });
  },
};
