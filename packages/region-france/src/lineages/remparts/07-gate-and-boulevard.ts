import { P, lamp as streetLamp, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, lamp } from './shared';
import { VGATE, vaubanGate, vaubanGateColliders } from './06-vauban-gate';

/*
 * The gate kept as a monument after the ramparts were levelled. It stays where it stood, on what is
 * now the town side of the new boulevard, which the town lays out on the filled ditch in front of it
 * (its centre line 7 m outside the old wall line, local z = +7, running along X). The old road, now a
 * narrow street, runs through the arch along Z (x = 0) and crosses the boulevard. The town draws both
 * roads; this model draws nothing on them (the street within LANE of x = 0, the boulevard beyond
 * z = FRONT). Either side of the street, between the arch and the boulevard's pavement, the ground is
 * a little paved square: a pair of octroi pavilions flanking the street just inside the gate, a small
 * railed garden with trees and a bench, and lamps.
 */
const ZC = (VGATE.front + VGATE.back) / 2; // the gate's centre, which stays where it was
/** Half-width of the town's street through the arch, pavements included (it narrows to this in the motor age). */
const LANE = 3.9;
/** Where the boulevard's pavement begins. */
const FRONT = 2.0;
/** The octroi pavilions, either side of the street just inside the arch. */
const OCT = { x: 7.0, z: -6.3 };
/** The railed garden either side. */
const GARDEN = { x0: 9.8, x1: 14.6, z0: -7.5, z1: -0.9 };

/** One of the pair of octroi pavilions: a little classical lodge for the town's toll officers. */
function octroi(b: Builder, x: number, z: number, s: 1 | -1, abolished: boolean): void {
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
      // the word OCTROI over the door, chiselled off once the tax was abolished
      if (!abolished) b.panel(1.4, 0.12, P.black, { at: [0, h - 0.07, 0.03], depth: 0.03, jitter: false });
    });
    for (const zz of [-0.9, 0.9]) b.window(0.7, 1.5, { at: [fx, 1.5, zz], facing, frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [0, 1.4, d / 2], frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [0, 1.4, -d / 2], facing: '-z', frame: stone, bars: [2, 3] });
    b.window(0.8, 1.6, { at: [s * (w / 2), 1.4, 0], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
  });
}

export const gateAndBoulevard: BuildingDef = {
  id: 'gate-and-boulevard',
  name: 'The gate kept beside the boulevard',
  style: 'Nineteenth-century town planning',
  date: '1860s to 1900s',
  summary:
    'With railways, a conscript army and long-range rifled guns, the old fortifications were useless, and they stopped the town from growing. One after another the fortified towns of the north were declassified and their ramparts levelled, from the 1850s to the 1920s. ' +
    'On their line and over the filled ditch the town laid out a ring of tree-lined boulevards, as Haussmann had done in Paris. The gate, the one piece of the walls that was architecture, was kept as a monument: the boulevard passes in front of it, and the old road, now a narrow street, still runs through the arch and crosses the boulevard. The ground either side became a small square with a railed garden and lamps. ' +
    'The town still taxed food, drink and fuel coming in, the octroi, so the vanished wall lived on as a tax line, with a pair of little toll pavilions just inside the gate. The octroi was abolished only in 1943, and for good in 1948.',
  materials: ['the stone gate of the 1680s', 'brick and stone for the pavilions', 'zinc roofs', 'stone flags and granite kerbs', 'cast iron'],
  modelledOn:
    'The Porte de Paris at Lille, left standing in a square beside the boulevard when the ramparts round it went, and the octroi pavilions that stood at the gates of most French towns. The square and the gardens are generic.',
  influences: ['haussmann-export'],
  revisions: [
    { year: 1949, note: 'The octroi was abolished in 1948; its pavilions were kept as offices and the word OCTROI was taken off their doors.' },
    { year: 1958, note: 'The gas lamps round the gate were replaced by electric street lights.' },
  ],
  lookFor: [
    { label: 'The gate as a monument', note: 'With the ramparts gone the gate stands on its own, kept for its beauty and its history. Its sides, once buried in the rampart, are bare.', at: [VGATE.w / 2 + 0.4, 5.0, ZC] },
    { label: 'Boulevard', note: 'A wide avenue planted with plane trees, laid out over the filled ditch where the ramparts had been. It passes just in front of the gate.', at: [-9.0, 1.2, 5.0] },
    { label: 'The old road through the arch', note: 'The road that came in through the gate still does, as a narrow street that crosses the boulevard.', at: [0, 1.0, -7.0] },
    { label: 'Octroi pavilion', note: 'Officers of the octroi stopped carts here, just inside the gate, and charged the town’s duty on wine, meat, flour and firewood coming in.', at: [OCT.x, 4.8, OCT.z + 1.8] },
    { label: 'Railed garden', note: 'The ground left over beside the gate became a small public garden behind cast-iron railings, with trees and a bench.', at: [-(GARDEN.x0 + GARDEN.x1) / 2, 1.4, GARDEN.z1 + 0.2] },
  ],
  build(b) {
    const flags = mix(P.paving, P.gravel, 0.25);
    const kerb = P.granite;

    // ---------------------------------------------------------------- the square either side of the street, clear of both roads
    b.sym((s) => {
      const x0 = s * LANE;
      const x1 = s * HALF;
      b.box(HALF - LANE, 0.1, FRONT + 8, flags, { at: [(x0 + x1) / 2, 0, (FRONT - 8) / 2], ...NJ });
      // a granite edge along the street and along the boulevard, flush with the flags
      b.box(0.3, 0.11, FRONT + 8, kerb, { at: [s * (LANE + 0.15), 0, (FRONT - 8) / 2], ...NJ });
      b.box(HALF - LANE, 0.11, 0.3, kerb, { at: [(x0 + x1) / 2, 0, FRONT - 0.15], ...NJ });
    });

    // ---------------------------------------------------------------- the gate, kept
    vaubanGate(b);
    // the sides, once buried in the rampart, faced in new stone
    b.sym((s) => b.box(0.2, 6.2, VGATE.front - VGATE.back - 0.2, tint(P.pierreBlonde, 0.04), { at: [s * (VGATE.w / 2 + 0.1), 0.8, ZC] }));

    // ---------------------------------------------------------------- the octroi pavilions and the gardens
    const abolished = b.since(1949);
    b.sym((s) => octroi(b, s * OCT.x, OCT.z, s, abolished));
    b.sym((s) => {
      const { x0, x1, z0, z1 } = GARDEN;
      const xc = (s * (x0 + x1)) / 2;
      const zc = (z0 + z1) / 2;
      const w = x1 - x0;
      const d = z1 - z0;
      // a stone curb with a lawn inside, cast-iron railings on it
      b.box(w, 0.3, d, tint(kerb, 0.05), { at: [xc, 0, zc], ...NJ });
      b.box(w - 0.4, 0.04, d - 0.4, mix(P.grass, P.leaf, 0.2), { at: [xc, 0.3, zc], ...NJ });
      for (const [px, pz, len, along] of [[xc, z0 + 0.1, w, 'x'], [xc, z1 - 0.1, w, 'x'], [s * x0 + s * 0.1, zc, d, 'z'], [s * x1 - s * 0.1, zc, d, 'z']] as [number, number, number, 'x' | 'z'][]) {
        b.box(along === 'x' ? len : 0.05, 0.05, along === 'x' ? 0.05 : len, P.castIron, { at: [px, 1.2, pz], ...NJ });
        const n = Math.round(len / 0.8);
        for (let i = 0; i <= n; i++) {
          const t = -len / 2 + (i * len) / n;
          b.box(0.03, 0.95, 0.03, P.castIron, { at: along === 'x' ? [px + t, 0.3, pz] : [px, 0.3, pz + t], ...NJ });
        }
      }
      b.tree(5.0, { kind: 'round', at: [xc, 0.3, z0 + 1.8], color: mix(P.leaf, P.leafDark, 0.35) });
      b.tree(4.6, { kind: 'round', at: [xc + s * 0.6, 0.3, z1 - 1.8], color: mix(P.leaf, P.leafDark, 0.35) });
      // a bench outside the railings, facing the gate
      b.box(1.6, 0.45, 0.45, P.doorGreen, { at: [s * (x0 - 0.8), 0.1, z1 - 1.6], rotY: Math.PI / 2 });
    });

    // ---------------------------------------------------------------- walking
    vaubanGateColliders(b);
    b.sym((s) => {
      b.collider(4.0, 3.4, { at: [s * OCT.x, 0, OCT.z] });
      b.collider(GARDEN.x1 - GARDEN.x0, GARDEN.z1 - GARDEN.z0, { at: [(s * (GARDEN.x0 + GARDEN.x1)) / 2, 0, (GARDEN.z0 + GARDEN.z1) / 2] });
    });

    // ---------------------------------------------------------------- lamps (last, so that the change in 1958 alters nothing else)
    const spots: [number, number][] = [[4.6, 1.4], [9.0, 1.4], [4.6, -4.2]];
    b.sym((s) => {
      for (const [x, z] of spots) {
        if (b.since(1958)) streetLamp(b, 'modern', [s * x, 0.1, z], z > 0 ? 0 : s > 0 ? -Math.PI / 2 : Math.PI / 2); // arms over the boulevard, or over the street
        else lamp(b, s * x, z);
      }
    });
  },
};
