import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, archOutline, gateLeaves, gateMass, road } from './shared';
import { PHILIP, curtain, philipTower } from './curtain';

/*
 * The gatehouse of about 1200, and the same gatehouse raised in the Hundred Years' War (`late`): one
 * model that grows, so it stays exactly where it was.
 */
export const GATE = {
  w: 7.4, // the block between the towers
  front: -1.0,
  back: -5.3,
  ow: 3.4, // the passage
  oh: 5.9,
  h: 11.5,
  hLate: 14.6,
  tx: 5.5, // tower centres
  tz: -1.7,
  tr: 3.4,
  th: 14.0,
  thLate: 16.5,
};

/** The gatehouse: a block pierced by a pointed passage between two round towers. */
export function philipGate(b: Builder, late: boolean): void {
  const { stone, dress, roof } = WALL_COLOURS.philippian;
  const { w, front, back, ow, oh, tx, tz, tr } = GATE;
  const h = late ? GATE.hLate : GATE.h;
  const d = front - back;
  const zc = (front + back) / 2;
  const groove = tint(stone, -0.3);

  // the block and its passage, a battered plinth that stops at the jambs (the passage floor is the road)
  gateMass(b, w, h, d, stone, { at: [0, 0, zc], xs: [0], openW: ow, openH: oh, shape: 'pointed' });
  b.sym((s) => b.box((w - ow) / 2, 1.1, d + 0.5, tint(stone, -0.06), { at: [s * (w + ow) / 4, 0, zc] }));
  // under the threshold the front of the gate goes down to the bottom of the ditch, which starts at its foot
  b.box(w + 0.5, PHILIP.depth, 1.6, tint(stone, -0.08), { at: [0, -PHILIP.depth, front - 0.55], ...NJ });
  // a dressed arch, a chamfered order round it, and the portcullis in its groove just inside
  b.group({ at: [0, 0, front + 0.03] }, () => {
    const outer = archOutline(ow + 1.1, oh + 0.6, 'pointed', 5);
    const inner = archOutline(ow, oh, 'pointed', 5);
    b.extrude(outer, 0.1, dress, { holes: [inner], ...NJ });
  });
  for (const s of [1, -1]) b.box(0.18, oh - 1.0, 0.25, groove, { at: [s * (ow / 2 + 0.02), 0, front - 0.45], ...NJ });
  const pz = front - 0.45;
  const py = oh - 2.2; // the portcullis hangs raised, its spikes showing under the arch
  for (let i = 0; i < 6; i++) {
    const x = -ow / 2 + 0.3 + (i * (ow - 0.6)) / 5;
    b.box(0.12, oh - py, 0.12, mix(P.oakDark, P.iron, 0.4), { at: [x, py, pz], ...NJ });
    b.cone(0.07, 0.3, P.iron, { at: [x, py, pz], segs: 4, rot: [Math.PI, 0, 0], ...NJ });
  }
  for (const y of [py + 0.25, py + 1.0]) b.box(ow - 0.3, 0.12, 0.1, mix(P.oakDark, P.iron, 0.4), { at: [0, y, pz], ...NJ });
  // the gates proper, further in, folded back
  gateLeaves(b, ow - 0.1, oh - 1.4, back + 1.2, mix(P.oak, P.oakDark, 0.45), { open: 1.4, iron: true });
  // arrow loops over the arch, front and back
  for (const x of [-1.6, 1.6]) {
    b.panel(0.4, 2.0, dress, { at: [x, oh + 1.6, front], depth: 0.04 });
    b.panel(0.13, 1.8, P.black, { at: [x, oh + 1.7, front], depth: 0.06 });
  }
  b.panel(0.13, 1.6, P.black, { at: [0, oh + 1.8, back], facing: '-z', depth: 0.06 });
  b.box(w + 0.1, 0.2, d + 0.1, dress, { at: [0, PHILIP.h - 0.2, zc] });

  if (!late) {
    // a flat fighting top behind battlements
    for (const [zz, ww, dd] of [[front - 0.25, w, 0.5], [back + 0.25, w, 0.5]] as const) {
      const n = 4;
      for (let i = 0; i < n; i++) b.box(1.1, 1.6, dd, stone, { at: [-ww / 2 + (i + 0.5) * (ww / n), h, zz], ...NJ });
    }
    b.box(w - 1.0, 0.05, d - 1.0, tint(stone, -0.12), { at: [0, h, zc], ...NJ });
  } else {
    // raised, with a parapet carried out on corbels (machicolations) and a steep roof of slate
    const mz = front + 0.45;
    for (let x = -w / 2 + 0.35; x <= w / 2 - 0.3; x += 0.7) b.box(0.3, 1.0, 0.85, dress, { at: [x, h - 1.0, front + 0.05], ...NJ });
    for (const s of [1, -1]) for (let z = back + 0.5; z < front - 0.3; z += 0.75) b.box(0.85, 1.0, 0.3, dress, { at: [s * (w / 2 + 0.05), h - 1.0, z], ...NJ });
    b.box(w + 1.0, 0.22, d + 0.9, dress, { at: [0, h - 0.02, zc + 0.45] });
    b.box(w + 1.0, 1.5, 0.4, stone, { at: [0, h + 0.2, mz + 0.3] });
    b.sym((s) => b.box(0.4, 1.5, d + 0.5, stone, { at: [s * (w / 2 + 0.3), h + 0.2, zc + 0.25] }));
    for (const x of [-2.4, 0, 2.4]) b.panel(0.5, 0.7, P.windowDark, { at: [x, h + 0.55, mz + 0.5], depth: 0.04 });
    b.gable(w + 0.2, d + 0.2, 4.6, roof, { at: [0, h + 1.7, zc], overhang: 0.35, wall: stone });
    // a dormer lookout in the roof toward the field
    b.box(1.1, 1.2, 1.2, stone, { at: [0, h + 2.4, front - 0.2] });
    b.gable(1.3, 1.4, 0.8, roof, { at: [0, h + 3.6, front - 0.2], ridge: 'z', overhang: 0.1 });
    b.panel(0.5, 0.8, P.windowDark, { at: [0, h + 2.6, front + 0.4], depth: 0.04 });
    // the king's arms over the gate: gold lilies on blue
    b.panel(1.1, 1.3, P.doorBlue, { at: [0, oh + 0.9, front], depth: 0.1, shape: 'round' });
    for (const [x, y] of [[-0.25, 1.35], [0.25, 1.35], [0, 1.75]]) b.panel(0.18, 0.24, P.gold, { at: [x, oh + y, front + 0.04], depth: 0.1 });
    // the drawbridge's lifting arms (flèches) rest in vertical slots when it is raised; a recess takes the deck
    // (a frame round the arch, so the passage itself stays open)
    b.group({ at: [0, 0, front + 0.01] }, () => {
      b.extrude(archOutline(ow + 1.7, oh + 1.1, 'rect'), 0.03, groove, { holes: [archOutline(ow + 1.1, oh + 0.6, 'pointed', 5)], ...NJ });
    });
    b.sym((s) => b.panel(0.3, 4.6, P.black, { at: [s * (ow / 2 + 0.75), oh + 0.5, front], depth: 0.02 }));
  }

  // the two round towers
  const th = late ? GATE.thLate : GATE.th;
  b.sym((s) => philipTower(b, s * tx, tz, tr, th, { machi: late, guns: late, loops: [0, s * 0.9, s * 1.8] }));
}

/**
 * The approach road: on the ground up to the lip of the ditch and on again from its far side, a few
 * metres past the plot (the town's own road begins a little way out).
 */
export function fieldRoad(b: Builder, w: number, color: number): void {
  road(b, w, color, { z0: PHILIP.ditch[1] - 0.1, z1: PHILIP.ditch[1] + 4.5 });
}

const [d0, d1] = PHILIP.ditch;
/** The trestles of the bridge, standing on the bottom of the ditch. */
const BENTS = [1.6, 3.8, 6.0];

export const philippianGate: BuildingDef = {
  id: 'philippian-gate',
  name: 'Gate between two round towers',
  style: 'Gothic military, the royal pattern of Philip Augustus',
  date: 'c. 1190 to 1230',
  summary:
    'The town had long outgrown its late Roman wall: suburbs had spread round the abbey and the market. Around 1200, as King Philip Augustus was doing at Paris (from 1190), the town built a new and much longer wall round them, paid for by the commune. It runs well outside the old wall, on the line the Gaulish rampart had taken thirteen centuries before, and where it crosses each main road a gate of the new pattern is built. The late Roman wall inside it, useless now, is pulled down for its stone, and the arch that had been its west gate goes with it. ' +
    'It follows the royal pattern: a crenellated curtain wall, round towers about every sixty metres, and gates set between two round towers that stand out from the wall. Round towers have no corners to be knocked off or undermined, and their arrow loops cover every approach. ' +
    'The gate passage is closed first by a portcullis of oak shod with iron, dropped in grooves, and then by heavy doors; in front is a dry ditch crossed by a timber bridge on trestles.',
  materials: ['limestone rubble faced with dressed stone', 'oak and iron for the portcullis and doors', 'timber bridge'],
  modelledOn:
    'The walls of Philip Augustus at Paris (1190 to about 1215), with their round towers and twin-towered gates, and the gatehouses of his castles such as Dourdan; the details are generic.',
  influences: ['crusader-castles'],
  lookFor: [
    { label: 'Twin round towers', note: 'Two round towers stand out either side of the passage so that archers in them could shoot at anyone attacking the gate.', at: [GATE.tx, 10.5, GATE.tz + GATE.tr + 0.3] },
    { label: 'Arrow loops', note: 'Tall narrow slits (archères), splayed inside so that an archer could aim widely while showing almost nothing to the enemy.', at: [-GATE.tx, 4.2, GATE.tz + GATE.tr + 0.25] },
    { label: 'Portcullis', note: 'A grid of iron-shod oak that drops in grooves in the passage walls: it could be let fall in an instant.', at: [0, GATE.oh - 1.0, GATE.front + 0.3] },
    { label: 'Crenellated wall-walk', note: 'The wall-walk runs behind battlements: solid merlons to shelter behind, gaps (crenels) to shoot through.', at: [11.5, PHILIP.h + 2.1, PHILIP.z + PHILIP.t / 2 + 0.3] },
    { label: 'Dry ditch', note: 'A broad ditch dug in front of the wall keeps siege towers and battering rams away from its foot; the towers rise straight out of it.', at: [11.5, -PHILIP.depth + 0.5, 3.3] },
  ],
  build(b) {
    const { stone } = WALL_COLOURS.philippian;
    road(b, 4.6, mix(P.cobble, P.gravel, 0.3), { z0: -8, z1: GATE.front });
    fieldRoad(b, 4.6, mix(P.earth, P.gravel, 0.4));

    b.sym((s) => curtain(b, 'philippian', s > 0 ? GATE.tx : -HALF, s > 0 ? HALF : -GATE.tx, { towers: false }));
    philipGate(b, false);
    // the ditch in front of the gate, between the stubs either side
    b.trench(-GATE.tx, GATE.tx, d0, d1, PHILIP.depth, { slope: PHILIP.slope, color: WALL_COLOURS.philippian.ditch });

    // the bridge over the ditch from the threshold: a plank deck on timber trestles standing on the bottom
    const oak = mix(P.oak, P.oakSilver, 0.2);
    const z0 = GATE.front;
    const z1 = d1 + 0.3;
    const len = z1 - z0;
    const zm = (z0 + z1) / 2;
    b.box(4.2, 0.1, len, tint(oak, 0.04), { at: [0, 0, zm] }); // the planks, flush with the road
    for (let z = z0 + 0.3; z < z1; z += 0.45) b.box(4.2, 0.01, 0.05, tint(oak, -0.15), { at: [0, 0.1, z], ...NJ });
    b.sym((s) => b.box(0.3, 0.35, len, oak, { at: [s * 1.6, -0.35, zm], ...NJ })); // the stringers
    for (const z of BENTS) {
      b.box(4.4, 0.3, 0.3, oak, { at: [0, -0.65, z], ...NJ }); // the cap of each trestle
      b.sym((s) => {
        b.box(0.26, PHILIP.depth - 0.6, 0.26, oak, { at: [s * 1.8, -PHILIP.depth, z], ...NJ });
        b.beam([s * 1.75, -PHILIP.depth + 0.2, z], [-s * 1.5, -0.7, z], 0.14, 0.14, tint(oak, -0.08), NJ);
      });
    }
    b.sym((s) => {
      // the rails, posts along the edge (none across the way)
      for (const z of [z0 + 0.4, ...BENTS, z1 - 0.3]) b.box(0.16, 1.05, 0.16, oak, { at: [s * 2.0, 0.1, z], ...NJ });
      b.box(0.1, 0.1, len - 0.4, oak, { at: [s * 2.0, 1.1, zm], ...NJ });
    });
    b.deck(4.0, len + 1.6, 0.1, { at: [0, 0, zm - 0.6] });

    // the town side: a stair up to the wall-walk
    b.stairs(1.3, PHILIP.h, 6.0, 14, tint(stone, -0.05), { at: [12.0, 0, PHILIP.z - PHILIP.t / 2 - 0.7], rotY: -Math.PI / 2 });

    // walking: the wall and towers either side, the passage left open
    b.sym((s) => {
      b.collider(HALF - GATE.tx, PHILIP.t + 0.6, { at: [s * (HALF + GATE.tx) / 2, 0, PHILIP.z] });
      b.collider(GATE.tr * 2, GATE.tr * 2, { at: [s * GATE.tx, 0, GATE.tz] });
      b.collider((GATE.w - GATE.ow) / 2, GATE.front - GATE.back, { at: [s * (GATE.w + GATE.ow) / 4, 0, (GATE.front + GATE.back) / 2] });
      b.collider(0.4, d1 - GATE.front, { at: [s * 2.1, 0, (d1 + GATE.front) / 2] });
    });
    b.collider(6.0, 1.3, { at: [12.0, 0, PHILIP.z - PHILIP.t / 2 - 0.7] });
  },
};
