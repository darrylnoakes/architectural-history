import { P, tint, mix, type Builder, type BuildingDef } from '@ah/kit';
import { BANK, BED, WATER, side, prism, reeds } from './shared';

/** A dugout canoe hollowed from one oak trunk, lying along its local Z. */
function dugout(b: Builder, at: [number, number, number], rotY: number, len = 6.2): void {
  const w = 0.42;
  const L = len / 2;
  const plan = (k: number): [number, number][] => [
    [0, -L * k],
    [w * 0.7 * k, -L * 0.8 * k],
    [w * k, -L * 0.4 * k],
    [w * k, L * 0.5 * k],
    [w * 0.75 * k, L * 0.88 * k],
    [0.12 * k, L * k],
    [-0.12 * k, L * k],
    [-w * 0.75 * k, L * 0.88 * k],
    [-w * k, L * 0.5 * k],
    [-w * k, -L * 0.4 * k],
    [-w * 0.7 * k, -L * 0.8 * k],
  ];
  b.group({ at, rotY }, () => {
    prism(b, plan(1), 0, 0.46, P.oakDark);
    // the hollowed inside, dark and wet, left with a thicker block at the stern as a seat
    prism(b, plan(0.82), 0.44, 0.03, tint(P.oakDark, -0.12));
    b.box(0.6, 0.06, 0.35, P.oak, { at: [0, 0.4, L * 0.7] });
    // a paddle laid inside
    b.beam([0.1, 0.5, -1.4], [-0.05, 0.52, 0.6], 0.07, 0.03, P.oak);
    b.box(0.16, 0.03, 0.5, P.oak, { at: [0.12, 0.49, -1.6] });
  });
}

export const ford: BuildingDef = {
  id: 'ford',
  name: 'Ford',
  style: 'Iron Age (La Tène)',
  date: 'c. 300 BC',
  summary:
    'The road down from the oppidum meets the river where it spreads wide and shallow over a bar of gravel and chalk flints, and in summer people, carts and cattle simply wade across. ' +
    'The crossing is why the settlement is here: it is where the route along the chalk ridge meets the river, and whoever holds the ford can take a toll on everything that crosses. ' +
    'A line of oak stakes driven into the bed marks the safe line and holds the gravel against the current. When the water is up, people cross in dugout canoes, each hollowed from a single oak trunk; many have been dredged from the rivers of northern France.',
  materials: ['river gravel and flints', 'oak stakes', 'oak dugouts'],
  lookFor: [
    { label: 'Ford', note: 'A bar of gravel where the water is shallow enough to wade; the banks are worn into ramps by feet, hooves and wheels.', at: [-1.6, -0.9, -5.0] },
    { label: 'Line of stakes', note: 'Oak stakes driven into the bed mark the safe line across and stop the current scouring the gravel away.', at: [1.3, -0.5, 4.2] },
    { label: 'Dugout canoe', note: 'A boat hollowed from one oak trunk with adze and fire: the boat of the Gaulish rivers, used for fishing, ferrying and trade.', at: [5.0, -0.8, -3.0] },
    { label: 'Hollow way', note: 'The track is worn down into the bank by centuries of traffic and floods, so it reaches the water by a gentle ramp.', at: [-1.6, 0.2, 14.5] },
  ],
  build(b) {
    b.noCollide();
    const gravel = mix(P.gravel, P.chalk, 0.2);
    const fx = -1.6; // the ford runs a little upstream of the line of the later road

    // gravel ramps worn down into both banks, and a gravel bar across the bed
    b.sym((s) => {
      const ramp: [number, number][] = [
        [s * (BANK + 3.4), 0.02],
        [s * BANK, -0.3],
        [s * (BANK - 3.0), BED + 0.95],
        [s * (BANK - 3.0), BED - 0.05],
        [s * BANK, BED - 0.05],
        [s * BANK, -0.6],
        [s * (BANK + 3.4), -0.6],
      ];
      side(b, s > 0 ? ramp : ramp.reverse(), 4.6, mix(gravel, P.mud, 0.35), fx);
      // trodden chalky track up from the ford, with wheel ruts
      b.box(3.4, 0.04, 5.0, mix(P.earth, P.chalk, 0.25), { at: [fx, 0, s * (BANK + 5.6)], jitter: false });
      for (const dx of [-0.75, 0.75]) b.box(0.18, 0.05, 5.0, mix(P.mud, P.earth, 0.4), { at: [fx + dx, 0.0, s * (BANK + 5.6)], jitter: false });
      // reeds along the bank either side of the crossing
      for (const x of [-7.0, -5.2, 2.6, 6.8]) reeds(b, x, s * (BANK + 0.5), P.reed);
    });
    // the bar itself, just under the water, cresting in a pale shoal at low water
    side(b, [[-BANK + 3.0, BED - 0.05], [BANK - 3.0, BED - 0.05], [BANK - 3.0, BED + 0.95], [3.5, WATER + 0.05], [-3.5, WATER + 0.05], [-BANK + 3.0, BED + 0.95]], 4.6, gravel, fx);
    side(b, [[-3.4, WATER - 0.1], [3.4, WATER - 0.1], [2.5, WATER + 0.08], [-2.5, WATER + 0.08]], 3.2, tint(gravel, 0.06), fx + 0.3);
    // flints and boulders on the bar
    for (let i = 0; i < 9; i++) {
      b.blob(b.range(0.18, 0.32), b.pick([P.flint, P.chalk, P.rubble]), { at: [fx + b.range(-1.8, 1.8), WATER + 0.02, b.range(-3.0, 3.0)], stretch: [1.2, 0.5, 1], detail: 0 });
    }

    // the line of stakes along the downstream edge of the ford
    const sx = fx + 2.6;
    for (let z = -11.2; z <= 11.3; z += 0.8) {
      const top = WATER + b.range(0.35, 0.8);
      b.cyl(0.08, top - BED, tint(P.oakDark, b.range(-0.05, 0.05)), { at: [sx + b.range(-0.08, 0.08), BED, z], segs: 5, rTop: 0.06 });
    }
    // a woven wattle fence lashed to the stakes near each bank, where the current bites hardest
    b.sym((s) => b.box(0.08, 0.6, 3.0, P.wattle, { at: [sx - 0.1, WATER - 0.3, s * 9.6] }));

    // a herdsman wading across with a cow
    b.figure({ at: [fx - 0.6, WATER - 0.55, -5.2], color: mix(P.wattle, P.voletVert, 0.3) });
    b.group({ at: [fx + 0.5, WATER - 0.5, -4.0], rotY: 0.1 }, () => {
      b.box(0.65, 0.75, 1.8, P.oakDark, { at: [0, 0.4, 0] });
      b.box(0.42, 0.45, 0.55, P.oakDark, { at: [0, 0.88, 1.1], rot: [0.3, 0, 0] });
      b.sym((k) => b.cone(0.05, 0.28, P.cream, { at: [k * 0.22, 1.3, 1.15], segs: 4 }));
    });

    // dugouts: one crossing downstream with a fisherman, one drawn up on the bank
    dugout(b, [5.0, WATER - 0.24, -3.0], 0.25);
    b.figure({ at: [5.05, WATER + 0.16, -1.2], color: mix(P.daub, P.oak, 0.4) });
    dugout(b, [4.4, -0.32, BANK + 1.4], Math.PI / 2 - 0.2, 5.6);
    b.cyl(0.1, 1.2, P.oakDark, { at: [6.6, 0, BANK + 0.6], segs: 5 });
    bar(b, [6.6, 1.0, BANK + 0.6], [4.4, 0.0, BANK + 1.4], 0.03);

    // willows and an alder or two on the banks, open chalk grassland behind
    b.tree(6.0, { kind: 'round', at: [-6.4, 0, 15.2], color: mix(P.leaf, P.olive, 0.4) });
    b.tree(5.0, { kind: 'round', at: [5.8, 0, -15.6], color: mix(P.leaf, P.olive, 0.4) });
    b.tree(7.0, { kind: 'poplar', at: [-5.2, 0, -16.4] });
  },
};

function bar(b: Builder, p0: [number, number, number], p1: [number, number, number], r: number): void {
  b.beam(p0, p1, r, r, P.reed);
}
