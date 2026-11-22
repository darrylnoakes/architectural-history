import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, gateLeaves, road } from './shared';
import { CASTRUM, castrumTower, curtain } from './curtain';
import { ARCH, porteDeMars } from './02-monumental-arch';

const WF = CASTRUM.t / 2; // outer face of the wall
const AX = ARCH.w / 2; // where the wall meets the arch
const TX = 9.75; // the two towers stand in front of the outer piers and the blocked side arches
const TZ = ARCH.d / 2;
const TR = 2.3;
const TH = 13.2;

export const castrumWall: BuildingDef = {
  id: 'castrum-wall',
  name: 'Late Roman wall with the arch as its gate',
  style: 'Late Roman',
  date: 'late 3rd to early 4th century',
  summary:
    'After the invasions of 275 and 276 the towns of Gaul walled themselves in, in a hurry and in a much smaller circuit than the open town had covered. The wall was built of the town itself: its footing is a mass of big blocks taken from tombs, temples and public buildings, some still carved, and above that a rubble core is faced with small squared stones laced with bands of brick. ' +
    'Half-round towers stand out from the wall about every thirty metres so that archers could shoot along its face. ' +
    'The old triumphal arch happened to stand on the new line and was built into the wall as its gate, with the side passages walled up and battlements set on top. That is how it survived when so much else did not.',
  materials: ['reused blocks from older buildings', 'small squared limestone (petit appareil)', 'brick lacing courses', 'mortared rubble core', 'roof tiles'],
  modelledOn:
    'The late Roman walls of Le Mans (the best preserved in France, with their towers and patterned facing) and of Senlis, and Reims, where the Porte de Mars became a gate of the late Roman enclosure. The gate here is the arch of the previous stage, kept in place.',
  lookFor: [
    { label: 'Reused blocks', note: 'The footing is made of stones from demolished monuments: a column drum, a cornice, an inscription, laid in with plain blocks.', at: [13.0, 0.9, WF + 0.5] },
    { label: 'Brick bands', note: 'Courses of flat Roman bricks run through the wall every metre and a half, levelling the work and binding the small facing stones to the core.', at: [13.6, 4.6, WF + 0.2] },
    { label: 'Half-round tower', note: 'Towers stand out from the wall with a rounded front, so that defenders could shoot along its face and no corner offered itself to a battering ram.', at: [TX, 9.6, TZ + TR + 0.3] },
    { label: 'The arch as gate', note: 'The side arches are walled up and gates are hung in the middle one: the monument of the open town becomes the way through its wall.', at: [-ARCH.side.x, 3.3, ARCH.d / 2 + 0.3] },
  ],
  build(b) {
    const { stone, spolia, brick } = WALL_COLOURS.castrum;

    road(b, 5.2, mix(P.cobble, P.limestone, 0.3));
    for (let z = -7.6; z < 8; z += 1.2) b.box(5.2, 0.01, 0.05, tint(P.cobble, -0.15), { at: [0, 0.04, z], ...NJ });

    // ---------------------------------------------------------------- the wall either side, and its towers
    b.sym((s) => {
      curtain(b, 'castrum', s > 0 ? AX : -HALF, s > 0 ? HALF : -AX, { towers: false, detail: true });
      castrumTower(b, s * TX, TZ, TR, TH, { windows: [0, s * 1.2, s * 0.6] });
    });

    // ---------------------------------------------------------------- the arch, made the gate
    porteDeMars(b, { blocked: true, parapet: true });
    gateLeaves(b, ARCH.central.w - 0.1, ARCH.central.h - ARCH.central.w / 2, -ARCH.d / 2 + 0.6, mix(P.oak, P.oakDark, 0.4), { open: 1.35, iron: true });

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
      b.collider(HALF - AX, CASTRUM.t + 0.3, { at: [s * (HALF + AX) / 2, 0, 0] });
      b.collider(TR * 2, TR * 2, { at: [s * TX, 0, TZ] });
      // the outer pier and the walled-up side arch are one solid block now
      b.collider(AX - (ARCH.central.w / 2 + 3.0) + 0.4, ARCH.d + 0.6, { at: [s * (AX + ARCH.central.w / 2 + 3.0) / 2, 0, 0] });
      b.collider(3.0, ARCH.d + 0.6, { at: [s * (ARCH.central.w / 2 + 1.5), 0, 0] });
    });
    b.collider(6.0, 1.3, { at: [-12.0, 0, -WF - 0.7] });
  },
};
