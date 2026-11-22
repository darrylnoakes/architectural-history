import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, lamp, slab, type XY } from './shared';
import { VGATE, vaubanGate, vaubanGateColliders } from './06-vauban-gate';

/*
 * The gate kept as a monument on an island in the middle of a roundabout, where the new boulevard
 * (laid out on the line of the levelled ramparts, along X) crosses the old road. The island is an
 * ellipse round the gate; the carriageway runs round it; the octroi pavilions stand at the corners on
 * the field side, where goods came in.
 */
const ZC = (VGATE.front + VGATE.back) / 2; // the gate's centre, which stays where it was
const RX = 8.4;
const RZ = 5.6;

function ellipse(rx: number, rz: number, zc: number, n = 24): XY[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [rx * Math.cos(a), zc + rz * Math.sin(a)] as XY;
  });
}

/** One of the pair of octroi pavilions: a little classical lodge for the town's toll officers. */
function octroi(b: Builder, x: number, z: number, s: 1 | -1): void {
  const stone = P.pierreBlonde;
  const brick = P.briqueNord;
  const w = 3.6;
  const d = 3.0;
  const h = 3.6;
  b.group({ at: [x, 0, z] }, () => {
    b.box(w + 0.3, 0.5, d + 0.3, tint(stone, -0.05));
    b.box(w, h, d, brick, { at: [0, 0.5, 0] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.4, h, 0.4, stone, { at: [sx * (w / 2 - 0.15), 0.5, sz * (d / 2 - 0.15)], ...NJ });
    b.box(w + 0.4, 0.45, d + 0.4, stone, { at: [0, h + 0.5, 0] });
    b.hip(w + 0.7, d + 0.7, 1.2, P.zincParis, { at: [0, h + 0.95, 0], overhang: 0.1 });
    b.chimney(0.45, 1.0, 0.45, brick, { at: [-s * 1.0, h + 1.2, -0.5], pots: 1 });
    // the door toward the road, under a pediment, and the word OCTROI over it
    const fx = -s * (w / 2);
    const facing = s > 0 ? '-x' : '+x';
    b.group({ at: [fx, 0, 0], rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 }, () => {
      b.panel(1.1, 2.3, P.doorGreen, { at: [0, 0.5, 0] });
      b.panel(1.5, 0.2, stone, { at: [0, 2.85, 0], depth: 0.12 });
      b.extrude([[-0.9, 0], [0.9, 0], [0, 0.45]], 0.24, stone, { at: [0, 3.05, 0.1] });
      b.panel(1.9, 0.38, stone, { at: [0, h - 0.2, 0], depth: 0.05 });
      b.panel(1.4, 0.12, P.black, { at: [0, h - 0.07, 0.03], depth: 0.03 });
    });
    for (const zz of [-0.9, 0.9]) b.window(0.7, 1.5, { at: [fx, 1.5, zz], facing, frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [0, 1.4, d / 2], frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [0, 1.4, -d / 2], facing: '-z', frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [s * (w / 2), 1.4, 0], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
  });
}

export const gateAndBoulevard: BuildingDef = {
  id: 'gate-and-boulevard',
  name: 'The gate on a roundabout',
  style: 'Nineteenth-century town planning',
  date: '1860s to 1900s',
  summary:
    'With railways, a conscript army and long-range rifled guns, the old fortifications were useless, and they stopped the town from growing. One after another the fortified towns of the north were declassified and their ramparts levelled, from the 1850s to the 1920s. ' +
    'On their line the town laid out a ring of tree-lined boulevards, as Haussmann was doing in Paris. The gate, the one piece of the walls that was architecture, was kept as a monument and left standing alone on an island where the boulevard crosses the old road. ' +
    'The town still taxed food, drink and fuel coming in, the octroi, so the vanished wall lived on as a tax line, with a pair of little toll pavilions at the gate. The octroi was abolished only in 1943.',
  materials: ['the stone gate of the 1680s', 'brick and stone for the pavilions', 'zinc roofs', 'macadam and granite setts', 'cast iron'],
  modelledOn: 'The Porte de Paris at Lille, left standing when the ramparts round it went, and the octroi pavilions that stood at the gates of most French towns. The roundabout is generic.',
  influences: ['haussmann-export'],
  lookFor: [
    { label: 'The gate as a monument', note: 'With the ramparts gone the gate stands alone, kept for its beauty and its history. Its sides, once buried in the rampart, are bare.', at: [VGATE.w / 2 + 0.4, 5.0, ZC] },
    { label: 'Roundabout', note: 'The traffic of the boulevard and the old road now goes round the gate rather than through it.', at: [-6.5, 0.8, 3.4] },
    { label: 'Octroi pavilion', note: 'Officers of the octroi stopped carts here and charged the town’s duty on wine, meat, flour and firewood coming in.', at: [12.6, 4.8, 6.0] },
    { label: 'Boulevard', note: 'A wide avenue planted with plane trees, laid out where the ramparts and the ditch had been.', at: [-12.6, 1.2, -6.0] },
  ],
  build(b) {
    const macadam = mix(P.gravel, P.tarmac, 0.3);
    const sett = mix(P.cobble, P.granite, 0.4);
    const kerb = P.granite;

    // ---------------------------------------------------------------- the roads: the whole plot is carriageway and pavement
    b.box(HALF * 2, 0.05, 16, macadam, NJ);
    // pavements at the back corners, where the boulevard's walks begin, with plane trees
    b.sym((s) => {
      b.box(HALF - 9.6, 0.14, 2.6, mix(P.paving, P.gravel, 0.3), { at: [s * (HALF + 9.6) / 2, 0, -6.7], ...NJ });
      b.box(HALF - 9.6, 0.16, 0.25, kerb, { at: [s * (HALF + 9.6) / 2, 0, -5.4], ...NJ });
      b.box(0.25, 0.16, 2.6, kerb, { at: [s * 9.6, 0, -6.7], ...NJ });
    });
    // the island round the gate: a granite kerb, a lawn, and paths of setts to the arch
    slab(b, ellipse(RX, RZ, ZC), 0, 0.17, kerb);
    slab(b, ellipse(RX - 0.3, RZ - 0.3, ZC), 0.17, 0.2, mix(P.grass, P.leaf, 0.2));
    b.box(VGATE.ow + 1.0, 0.22, 2 * RZ - 0.6, sett, { at: [0, 0, ZC], ...NJ });
    // the old road's setts continue either side of the island
    b.box(4.4, 0.06, 2.4, sett, { at: [0, 0, 6.8], ...NJ });

    // ---------------------------------------------------------------- the gate, kept
    vaubanGate(b);
    // the sides, once buried in the rampart, faced in new stone
    b.sym((s) => b.box(0.2, 6.2, VGATE.front - VGATE.back - 0.2, tint(P.pierreBlonde, 0.04), { at: [s * (VGATE.w / 2 + 0.1), 0.8, ZC] }));

    // ---------------------------------------------------------------- the octroi pavilions, lamps, trees
    b.sym((s) => {
      octroi(b, s * 12.6, 6.0, s);
      lamp(b, s * 7.0, 5.0);
      lamp(b, s * 7.0, -6.5);
      for (const x of [10.4, 13.2]) b.tree(5.0, { kind: 'round', at: [s * x, 0, -6.3], color: mix(P.leaf, P.leafDark, 0.35) });
    });
    // a few benches on the island
    b.sym((s) => {
      b.box(1.6, 0.45, 0.45, P.doorGreen, { at: [s * 6.6, 0.2, ZC], rotY: Math.PI / 2 });
    });

    // ---------------------------------------------------------------- walking
    vaubanGateColliders(b);
    b.sym((s) => b.collider(4.0, 3.4, { at: [s * 12.6, 0, 6.0] }));
  },
};
