import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, hump, steps, bar, band, tilt } from './shared';

export const pileBridge: BuildingDef = {
  id: 'pile-bridge',
  name: 'Timber pile bridge',
  style: 'Archaic',
  date: 'c. 520 BC',
  summary:
    'The first bridge stands on rows of oak piles driven into the river bed, each row capped by a beam and braced against the current, with heavy timbers and a plank road laid across them. ' +
    'Rome’s first bridge, the Pons Sublicius (from sublicae, piles), was of this kind and by sacred law was built and repaired without any iron, held together only by joints and wooden pegs, so that it could be taken apart quickly if an enemy came. ' +
    'Its upkeep was a religious duty, and the priests who kept it, the pontifices, may take their name from the bridge (pons). ' +
    'Timber in water rots and floods tear it away, so the bridge is renewed again and again.',
  materials: ['oak piles', 'oak beams', 'oak planks', 'wooden pegs'],
  modelledOn: 'The Pons Sublicius, Rome (traditionally built under Ancus Marcius, 7th century BC)',
  lookFor: [
    { label: 'Pile bents', note: 'Each pier is a row of piles driven into the bed and joined by a cap beam: a bent.', at: [3.0, -0.5, -6.0] },
    { label: 'Raking struts', note: 'Sloping piles on the upstream side brace each bent against the force of the current and floating debris.', at: [-4.6, -0.6, 3.0] },
    { label: 'Pegged joints', note: 'No iron at all: the timbers are joined with mortises, notches and oak pegs.', at: [2.4, 0.75, 0] },
    { label: 'Plank road', note: 'Planks laid across the stringers make a level road wide enough for a cart.', at: [0, 1.4, 4.0] },
    { label: 'Shrine at the bridgehead', note: 'A small altar for the gods of the river: crossing water was a sacred matter, and the bridge was in the keeping of priests.', at: [5.0, 1.3, 15.2] },
  ],
  influences: ['etruscan-legacy'],
  build(b) {
    b.noCollide();
    const crown = 0.95;
    const f = hump(crown);
    const W = 4.6;
    b.deck(W - 0.6, 34, crown, { yEnds: 0 });
    const oak = P.oak;
    const oakD = P.oakDark;
    const weathered = tint(P.oakSilver, -0.1);
    const bents = steps(6, -10.2, 10.2);
    const pileXs = [-1.9, -0.65, 0.65, 1.9];
    const capT = 0.32;
    const strT = 0.3;
    const plankT = 0.09;
    const capTop = (z: number) => f(z) - plankT - strT;

    for (const z of bents) {
      const yTop = capTop(z) - capT;
      for (const x of pileXs) b.cyl(0.17, yTop - FOOT, tint(oak, b.range(-0.05, 0.04)), { at: [x + b.range(-0.04, 0.04), FOOT, z], segs: 7 });
      // cap beam across the pile heads
      b.box(W + 0.4, capT, 0.38, oakD, { at: [0, yTop, z] });
      // pegs through the cap into each pile
      for (const x of pileXs) b.cyl(0.04, 0.12, weathered, { at: [x, yTop + capT, z + 0.12], segs: 5 });
      // raking strut on the upstream side (-X), and cross bracing in the bent
      bar(b, [-W / 2 - 1.8, FOOT, z], [-W / 2 + 0.05, yTop - 0.15, z], [0.24, 0.24], oak);
      bar(b, [pileXs[0], -1.0, z + 0.2], [pileXs[3], yTop - 0.1, z + 0.2], [0.12, 0.16], oakD);
      bar(b, [pileXs[3], -1.0, z - 0.2], [pileXs[0], yTop - 0.1, z - 0.2], [0.12, 0.16], oakD);
      // a horizontal wale at low water tying the piles together
      b.box(W + 0.2, 0.18, 0.2, oakD, { at: [0, -1.05, z + 0.19] });
    }
    // timber abutments at the water's edge: a bent of piles with a crib of logs holding back the bank
    for (const s of [-1, 1]) {
      const z = s * (BANK - 0.3);
      const yTop = capTop(z) - capT;
      for (const x of pileXs) b.cyl(0.17, yTop - FOOT, oak, { at: [x, FOOT, z], segs: 7 });
      b.box(W + 0.4, capT, 0.38, oakD, { at: [0, yTop, z] });
      for (let i = 0; i < 4; i++) b.log(0.17, W + 0.8, tint(oak, -0.04), { at: [0, -1.45 + i * 0.33, z + s * 0.22], segs: 7 });
    }
    // stringers along the road, in short lengths from bent to bent
    const stringers = [-1.85, -0.95, 0, 0.95, 1.85];
    const ends = [-END + 1.6, -BANK + 0.3, ...bents, BANK - 0.3, END - 1.6];
    for (let i = 0; i < ends.length - 1; i++) {
      const za = ends[i];
      const zb = ends[i + 1];
      for (const x of stringers) {
        bar(b, [x, capTop(za) + strT / 2, za - 0.15], [x, capTop(zb) + strT / 2, zb + 0.15], [0.26, strT], tint(oak, 0.03));
      }
    }
    // the stringers come to rest on sleeper beams bedded in the bank
    for (const s of [-1, 1]) b.box(W + 0.2, 0.3, 0.5, oakD, { at: [0, capTop(s * (END - 1.6)) - 0.1, s * (END - 1.6)] });

    // plank road, laid across
    const pitch = 0.42;
    const n = Math.round((2 * (END - 0.6)) / pitch);
    for (let i = 0; i < n; i++) {
      const z = -(END - 0.6) + (i + 0.5) * ((2 * (END - 0.6)) / n);
      b.box(W + b.range(-0.1, 0.1), plankT, 0.38, tint(P.oakSilver, b.range(-0.14, -0.04)), {
        at: [b.range(-0.05, 0.05), f(z) - plankT, z],
        rot: [tilt(f, z), 0, 0],
      });
    }
    // ramps of trodden earth up onto the ends
    b.sym((s) => band(b, 0, W, s > 0 ? END - 1.2 : -END, s > 0 ? END : -END + 1.2, () => -0.1, (z) => f(z) - 0.02, P.earth, 2));

    // post-and-rail sides, pegged
    b.sym((s) => {
      const x = s * (W / 2 - 0.08);
      const zs = steps(16, -END + 1.0, END - 1.0);
      for (const z of zs) b.box(0.15, 1.05, 0.15, oakD, { at: [x, f(z) - 0.05, z] });
      for (let i = 0; i < zs.length - 1; i++) {
        bar(b, [x, f(zs[i]) + 0.92, zs[i]], [x, f(zs[i + 1]) + 0.92, zs[i + 1]], [0.13, 0.11], oak);
        bar(b, [x, f(zs[i]) + 0.45, zs[i]], [x, f(zs[i + 1]) + 0.45, zs[i + 1]], [0.08, 0.08], oak);
      }
    });

    // a small altar at the north bridgehead
    b.group({ at: [5.0, 0, 15.2] }, () => {
      b.box(1.1, 0.25, 0.8, P.tufa);
      b.box(0.85, 0.75, 0.6, tint(P.tufa, 0.05), { at: [0, 0.25, 0] });
      b.box(1.0, 0.12, 0.72, tint(P.tufa, 0.08), { at: [0, 1.0, 0] });
      b.blob(0.14, P.terracotta, { at: [0.15, 1.18, 0], detail: 0 });
    });
    b.tree(7.5, { kind: 'pine', at: [-4.6, 0, -16.0] });
    b.tree(8.0, { kind: 'poplar', at: [-6.0, 0, 15.6] });
  },
};
