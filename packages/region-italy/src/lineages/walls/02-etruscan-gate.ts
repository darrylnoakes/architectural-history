import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, blockWall, gateMass, road, voussoirs } from './shared';
import { ETRUSCAN, WALL_COLOURS, curtain } from './curtain';

// Gate block: the passage is OW wide, springs at SPRING and is ZF..ZB deep.
const OW = 4.0;
const SPRING = 4.3;
const GW = 9.8; // width of the gate block
const ZF = 2.6; // outer face of the gate block
const ZB = -3.6; // inner face
const GH = 8.8;
const WALL_T = ETRUSCAN.t;
const WALL_H = ETRUSCAN.h;

export const etruscanGate: BuildingDef = {
  id: 'etruscan-gate',
  name: 'Etruscan city gate',
  style: 'Etruscan',
  date: '4th to 3rd century BC',
  summary:
    'As the towns of Etruria grew rich they ringed their hilltops with walls of huge squared blocks, cut from the local stone and laid in level courses without any mortar: their own weight holds them. ' +
    'The gate is a deep passage through the wall, spanned by a true arch of wedge-shaped stones, a technique that spread through central Italy in the fourth and third centuries BC, in Etruscan and Roman gates and drains alike. ' +
    'Three carved heads look out from the keystone and the springing of the arch, perhaps gods guarding the town, though they are too worn to name with certainty and some think they are trophy heads of enemies. ' +
    'Where the rampart was earth and timber, this is a permanent work of skilled masons.',
  materials: ['panchino stone (a yellow calcareous sandstone) in squared blocks', 'dark stone for the heads', 'oak gate leaves'],
  modelledOn: 'The Porta all’Arco, Volterra (walls of the 4th century BC; the arch is later, probably 3rd or 2nd century BC)',
  influences: ['etruscan-legacy'],
  lookFor: [
    { label: 'Dry-laid ashlar', note: 'Big squared blocks in level courses with no mortar at all: their weight and close fit hold the wall together.', at: [-10, 4, 1.8] },
    { label: 'True arch', note: 'Wedge-shaped stones (voussoirs) lean on one another and turn the weight above sideways into the jambs.', at: [-1.6, 6.3, ZF + 0.4] },
    { label: 'Keystone head', note: 'A carved head on the central stone of the arch; two more sit at its springing. Worn smooth, they may be guardian gods.', at: [0, 7.3, ZF + 0.7] },
    { label: 'Deep gate passage', note: 'The gate is a tunnel through the thickened wall, with a second arch on the town side where the doors were hung.', at: [0, 2.2, -0.5] },
  ],
  build(b) {
    const stone = WALL_COLOURS.etruscan.stone;
    const dark = mix(P.peperino, P.tufa, 0.25);

    road(b, 4.0, mix(P.gravel, P.earth, 0.3));

    // ---------------------------------------------------------------- the wall either side
    b.sym((s) => curtain(b, 'etruscan', s > 0 ? GW / 2 : -HALF, s > 0 ? HALF : -GW / 2, { detail: true }));

    // ---------------------------------------------------------------- the gate block
    const depth = ZF - ZB;
    const zc = (ZF + ZB) / 2;
    // the two jambs, built of big blocks up to the springing
    b.sym((s) => {
      const x0 = s > 0 ? OW / 2 : -GW / 2;
      const x1 = s > 0 ? GW / 2 : -OW / 2;
      blockWall(b, x0, x1, zc, depth, SPRING, stone, { course: [0.7, 0.95], len: [1.2, 1.7], tone: 0.06 });
      // the impost: a projecting block at the springing on the outer face
      b.box(1.0, 0.5, 0.3, tint(stone, -0.04), { at: [s * (OW / 2 + 0.5), SPRING - 0.5, ZF + 0.1] });
    });
    // the mass above the springing, cut by the semicircle of the arch
    gateMass(b, GW, GH - SPRING, depth, stone, { at: [0, SPRING, zc], xs: [0], openW: OW, openH: OW / 2 });
    // its coursing, drawn on both faces
    for (const z of [ZF + 0.02, ZB - 0.02]) {
      for (const y of [SPRING + 0.9, SPRING + 1.8]) {
        b.sym((s) => b.box(1.25, 0.05, 0.04, tint(stone, -0.18), { at: [s * (GW / 2 - 0.62), y, z], jitter: false }));
      }
      for (const y of [SPRING + 2.75, SPRING + 3.6]) b.box(GW, 0.05, 0.04, tint(stone, -0.18), { at: [0, y, z], jitter: false });
      for (const x of [-3.4, -1.1, 1.3, 3.6]) b.box(0.05, 0.82, 0.04, tint(stone, -0.18), { at: [x, SPRING + 2.8, z], jitter: false });
      b.sym((s) => b.box(0.05, 1.8, 0.04, tint(stone, -0.18), { at: [s * (GW / 2 - 1.25), SPRING, z], jitter: false }));
    }
    // outer arch: a ring of voussoirs standing proud, then the inner arch, plainer
    voussoirs(b, OW, SPRING, 0.95, tint(stone, 0.03), { at: [0, 0, ZF], n: 13, proud: 0.2, vary: 0.05, keyExtra: 0.25 });
    voussoirs(b, OW, SPRING, 0.8, tint(stone, -0.02), { at: [0, 0, ZB], facing: '-z', n: 11, proud: 0.1 });
    // the passage soffit, darker
    b.vault(OW, depth - 0.1, tint(stone, -0.2), { at: [0, SPRING, zc], segs: 10 });
    // a parapet of blocks across the top of the gate
    b.box(GW, 1.1, 0.7, tint(stone, -0.02), { at: [0, GH, ZF - 0.35] });
    b.box(GW, 0.05, depth - 0.8, tint(stone, -0.12), { at: [0, GH, zc - 0.35], jitter: false });

    // the three heads: keystone and the two springers
    const head = (x: number, y: number, z: number) => {
      b.blob(0.34, dark, { at: [x, y, z], stretch: [0.85, 1.05, 0.9] });
      b.blob(0.2, tint(dark, -0.05), { at: [x, y + 0.35, z - 0.05], stretch: [1.3, 0.6, 1] }); // worn headdress
      b.box(0.5, 0.45, 0.25, tint(dark, 0.04), { at: [x, y - 0.55, z - 0.15] }); // neck block
    };
    head(0, SPRING + OW / 2 + 0.8, ZF + 0.42);
    b.sym((s) => head(s * (OW / 2 + 0.5), SPRING + 0.35, ZF + 0.46));

    // ---------------------------------------------------------------- the doors, on the town-side arch
    b.sym((s) => {
      b.group({ at: [s * (OW / 2 - 0.1), 0, ZB + 0.5], rotY: s * 1.45 }, () => {
        b.box(OW / 2 - 0.1, SPRING + 0.8, 0.16, P.oakDark, { at: [-s * (OW / 4 - 0.05), 0, 0] });
        for (const y of [0.5, 2.4, 4.3]) b.box(OW / 2 - 0.2, 0.14, 0.04, P.iron, { at: [-s * (OW / 4 - 0.05), y, 0.1], jitter: false });
      });
    });
    // a step at the threshold and a worn sill
    b.box(OW, 0.12, depth, tint(P.gravel, -0.08), { at: [0, 0, zc], jitter: false });

    // a stair of blocks up to the wall-walk on the town side
    b.stairs(1.3, WALL_H, 8.4, 14, tint(stone, -0.04), { at: [-10.3, 0, -WALL_T / 2 - 0.65], rotY: -Math.PI / 2 });

    // ---------------------------------------------------------------- around it
    b.tree(7, { kind: 'cypress', at: [-12.8, 0, 5.8] });
    b.tree(6.2, { kind: 'cypress', at: [-11.2, 0, 6.4] });
    b.tree(4.2, { kind: 'olive', at: [11.5, 0, 5.6] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - GW / 2, WALL_T + 0.5 + (s < 0 ? 1.3 : 0), { at: [s * (HALF + GW / 2) / 2, 0, s < 0 ? -0.65 : 0] });
      b.collider((GW - OW) / 2, depth, { at: [s * (GW + OW) / 4, 0, zc] });
    });
  },
};
