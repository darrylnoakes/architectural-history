import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, road } from './shared';
import { PHILIP, curtain } from './curtain';
import { GATE, gateDitch, philipGate } from './04-philippian-gate';

/*
 * The boulevard: a half-round outwork of earth revetted with timber, built out into the ditch in front
 * of the gate, open at the back toward the drawbridge. It is drawn as two arcs about (0, BZ), leaving a
 * gap on the axis for the road.
 */
const BZ = GATE.tz + GATE.tr + 0.1; // its gorge, level with the fronts of the towers
const RO = 7.6 - BZ; // outer radius: the front stands just inside the plot
const RI = RO - 2.6;
const BH = 2.6; // the walk behind the parapet
const GAP = 0.36; // half-angle of the opening for the road
const PIT = { z0: GATE.front, z1: BZ }; // the pit under the drawbridge

/** The boulevard's earthwork, posts, gunports and guns. */
function boulevard(b: Builder): void {
  const earth = mix(P.earth, P.turf, 0.25);
  const timber = mix(P.oak, P.oakSilver, 0.25);
  const prof: [number, number][] = [[RI, 0], [RI, BH], [RO - 0.9, BH], [RO - 0.5, BH + 1.1], [RO - 0.05, BH + 0.75], [RO - 0.05, 0]];
  for (const s of [1, -1] as const) {
    const start = s > 0 ? GAP : -Math.PI / 2;
    const sweep = Math.PI / 2 - GAP;
    b.group({ at: [0, 0, BZ] }, () => {
      b.lathe(prof, earth, { segs: 7, start, sweep, ...NJ });
      // the timber revetment on the outside: planks and a post every metre or so
      b.lathe([[RO, 0], [RO, BH + 0.75]], tint(timber, -0.05), { segs: 7, start, sweep, ...NJ });
      for (let i = 0; i <= 9; i++) {
        const a = start + (i / 9) * sweep;
        b.box(0.26, BH + 1.0, 0.26, timber, { at: [Math.sin(a) * (RO + 0.1), 0, Math.cos(a) * (RO + 0.1)], rotY: a, ...NJ });
      }
      // gunports low in the revetment, for small guns firing along the bottom of the ditch
      for (const a of [s * 0.75, s * 1.3]) {
        b.panel(0.55, 0.45, P.black, { at: [Math.sin(a) * (RO + 0.01), 0.7, Math.cos(a) * (RO + 0.01)], facing: a, depth: 0.05 });
      }
      // the planked ends of the bank at the opening and at the gorge
      for (const a of [s > 0 ? GAP : -GAP, s * (Math.PI / 2)]) {
        b.group({ rotY: a - Math.PI / 2 }, () => b.extrude(prof, 0.12, timber, NJ));
      }
      // a light gun (veuglaire) on its wooden bed, behind the parapet
      const a = s * 0.95;
      b.group({ at: [Math.sin(a) * (RO - 1.6), BH, Math.cos(a) * (RO - 1.6)], rotY: a }, () => {
        b.box(0.7, 0.35, 1.7, mix(P.oak, P.oakDark, 0.4), { at: [0, 0, -0.1] });
        b.log(0.17, 1.6, P.iron, { at: [0, 0.3, 0.1], axis: 'z', segs: 8 });
        b.log(0.22, 0.5, P.iron, { at: [0, 0.25, -0.6], axis: 'z', segs: 8 }); // the powder chamber
      });
    });
  }
  // the barrier across the way through: two posts and a timber gate, swung open
  b.sym((s) => {
    const x = s * (Math.sin(GAP) * RO);
    const z = BZ + Math.cos(GAP) * RO;
    b.box(0.34, 3.4, 0.34, timber, { at: [x, 0, z] });
    b.group({ at: [x, 0, z - 0.2], rotY: -s * 1.4 }, () => b.box(Math.abs(x) - 0.1, 2.4, 0.12, tint(timber, 0.04), { at: [-s * (Math.abs(x) - 0.1) / 2, 0, 0] }));
  });
  b.box(2 * Math.sin(GAP) * RO + 0.4, 0.3, 0.34, timber, { at: [0, 3.1, BZ + Math.cos(GAP) * RO] });
  // the floor of the boulevard: beaten earth and gravel over the ditch
  b.group({ at: [0, 0, BZ] }, () => b.lathe([[0.01, 0.05], [RI + 0.02, 0.05]], mix(P.gravel, P.earth, 0.4), { segs: 12, start: -Math.PI / 2, sweep: Math.PI, ...NJ }));
}

/** The drawbridge, lowered, with its lifting arms (flèches) and chains. */
function drawbridge(b: Builder): void {
  const oak = mix(P.oak, P.oakDark, 0.3);
  const { z0, z1 } = PIT;
  // the pit it spans, its masonry sides, and the deck
  b.box(GATE.ow + 0.8, 0.03, z1 - z0, tint(P.mud, -0.15), { at: [0, 0, (z0 + z1) / 2], ...NJ });
  b.sym((s) => b.box(0.5, 0.35, z1 - z0, tint(WALL_COLOURS.philippian.stone, -0.08), { at: [s * (GATE.ow / 2 + 0.65), 0, (z0 + z1) / 2], ...NJ }));
  b.box(GATE.ow + 0.2, 0.22, z1 - z0, oak, { at: [0, 0.06, (z0 + z1) / 2] });
  for (let z = z0 + 0.3; z < z1; z += 0.45) b.box(GATE.ow + 0.2, 0.02, 0.05, tint(oak, -0.15), { at: [0, 0.28, z], ...NJ });
  // the arms run out of their slots over the bridge, counterweighted inside the gate; chains drop to the deck's outer end
  const ay = GATE.oh + 2.6;
  b.sym((s) => {
    const x = s * (GATE.ow / 2 + 0.75);
    b.beam([x, ay, GATE.front - 1.6], [x, ay, z1 + 0.1], 0.24, 0.28, oak);
    b.beam([x, ay - 0.1, z1], [s * (GATE.ow / 2 - 0.05), 0.3, z1 - 0.1], 0.06, 0.06, P.iron);
  });
}

export const fortifiedGate: BuildingDef = {
  id: 'fortified-gate',
  name: 'Gate raised for the Hundred Years’ War',
  style: 'Late Gothic military',
  date: '1360s to 1440s',
  summary:
    'In the Hundred Years’ War (1337 to 1453) English armies and companies of unpaid soldiers roamed northern France, and after the disaster of Poitiers in 1356 the towns repaired, heightened and re-armed their walls. ' +
    'The old gate is raised and given machicolations: a parapet carried out on stone brackets, with openings in the floor between them through which stones could be dropped on attackers at the foot of the wall. Its towers get steep slate roofs, and the bridge becomes a drawbridge whose lifting arms fold up into slots in the wall. ' +
    'Guns arrive too. Keyhole gunports are cut low in the towers, and from about the 1420s a boulevard of earth and timber is thrown up in front of the gate: a low outwork that carries guns of its own and keeps the enemy’s cannon away from the gate.',
  materials: ['limestone', 'slate', 'oak for the drawbridge and the boulevard’s revetment', 'earth', 'iron chains and guns'],
  modelledOn: 'The gates of towns fortified under Charles V and during the war, such as the Porte Saint-Jean at Provins and the gates of Laon; the boulevard after the earthworks of the early fifteenth century, which survive only in records and excavations. The details are generic.',
  lookFor: [
    { label: 'Machicolations', note: 'The parapet stands out on stone brackets; through the gaps between them the defenders could drop stones on anyone at the foot of the wall.', at: [-GATE.tx - GATE.tr - 0.4, GATE.thLate - 0.5, GATE.tz] },
    { label: 'Steep slate roofs', note: 'Tall conical roofs of slate kept the rain off the timber floors and gave the gate its new silhouette.', at: [GATE.tx, GATE.thLate + 5.5, GATE.tz + 1.2] },
    { label: 'Drawbridge', note: 'Two timber arms (flèches) lift the bridge by chains and fold up into the slots in the wall; the raised deck closes the gateway.', at: [GATE.ow / 2 + 0.75, GATE.oh + 2.9, 0.4] },
    { label: 'Boulevard', note: 'A half-round outwork of earth held up by timber, built out into the ditch in front of the gate to carry guns and keep enemy cannon at a distance.', at: [4.2, BH + 1.4, BZ + 4.6] },
    { label: 'Gunports', note: 'Low openings for small guns: a round hole for the barrel under a slit for aiming, or simple ports in the boulevard’s timber face.', at: [-Math.sin(0.75) * RO, 0.9, BZ + Math.cos(0.75) * RO + 0.25] },
  ],
  build(b) {
    const { stone } = WALL_COLOURS.philippian;
    road(b, 4.6, mix(P.cobble, P.gravel, 0.3), { z0: -8, z1: GATE.front });
    road(b, 4.0, mix(P.earth, P.gravel, 0.45), { z0: PIT.z1, z1: 8, y: 0.06 });

    b.sym((s) => curtain(b, 'fortified', s > 0 ? GATE.tx : -HALF, s > 0 ? HALF : -GATE.tx, { towers: false }));
    philipGate(b, true);
    gateDitch(b);
    drawbridge(b);
    boulevard(b);

    // the town side: a stair up to the wall-walk
    b.stairs(1.3, PHILIP.h, 6.0, 14, tint(stone, -0.05), { at: [12.0, 0, PHILIP.z - PHILIP.t / 2 - 0.7], rotY: -Math.PI / 2 });

    // walking: the wall, the towers and the boulevard's two banks; the way through left open
    b.sym((s) => {
      b.collider(HALF - GATE.tx, PHILIP.t + 0.6, { at: [s * (HALF + GATE.tx) / 2, 0, PHILIP.z] });
      b.collider(GATE.tr * 2, GATE.tr * 2, { at: [s * GATE.tx, 0, GATE.tz] });
      b.collider((GATE.w - GATE.ow) / 2, GATE.front - GATE.back, { at: [s * (GATE.w + GATE.ow) / 4, 0, (GATE.front + GATE.back) / 2] });
      for (let i = 0; i < 3; i++) {
        const a = s * (GAP + ((i + 0.5) / 3) * (Math.PI / 2 - GAP));
        const r = (RO + RI) / 2;
        b.collider(RO - RI + 0.3, ((Math.PI / 2 - GAP) / 3) * RO + 0.3, { at: [Math.sin(a) * r, 0, BZ + Math.cos(a) * r], rotY: a });
      }
    });
    b.collider(6.0, 1.3, { at: [12.0, 0, PHILIP.z - PHILIP.t / 2 - 0.7] });
  },
};
