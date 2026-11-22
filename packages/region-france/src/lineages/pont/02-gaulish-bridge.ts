import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, WATER, hump, steps, bar, band, tilt } from './shared';

export const gaulishBridge: BuildingDef = {
  id: 'gaulish-bridge',
  name: 'Timber trestle bridge',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 90 BC',
  summary:
    'The ford is replaced by a timber bridge: rows of oak piles driven into the river bed, each row capped by a cross-beam to make a trestle, with long beams laid from trestle to trestle and a road of split logs across them. ' +
    'When Caesar came to Gaul in 58 BC he found its tribes bridging their rivers like this, on the Aisne, the Loire, the Allier and the Seine, and he and the Gauls both broke bridges to stop the other crossing; at the Allier in 52 BC he rebuilt one on the stumps of its old piles. ' +
    'Remains of such bridges survive in the mud: those at La Tène on Lake Neuchâtel, felled in the third and second centuries BC, were found among weapons and ornaments thrown into the water. ' +
    'Oak in water lasts for generations, but floods and ice tear at it, and the bridge is patched and rebuilt again and again.',
  materials: ['oak piles', 'oak beams', 'split oak logs', 'wattle'],
  lookFor: [
    { label: 'Pile trestle', note: 'Each pier is a row of oak piles driven into the bed and joined by a cap beam laid across their heads.', at: [2.2, -0.4, -5.1] },
    { label: 'Ice and drift fenders', note: 'Clusters of raked piles upstream of each trestle take the blows of floating trees and ice before they reach the bridge.', at: [-4.4, -0.7, 1.7] },
    { label: 'Log road', note: 'Split logs laid side by side across the beams, wide enough for a cart, with wattle hurdles along the edges.', at: [0, 1.1, 8.0] },
    { label: 'Log crib abutment', note: 'At each bank a box of stacked logs holds back the earth and carries the end of the bridge.', at: [2.6, -0.3, 12.0] },
  ],
  build(b) {
    b.noCollide();
    const crown = 0.9;
    const f = hump(crown);
    const W = 4.2;
    b.deck(W - 0.4, 34, crown, { yEnds: 0 });
    const oak = P.oak;
    const oakD = P.oakDark;
    const wet = tint(P.oakDark, -0.08);
    const bents = steps(6, -10.2, 10.2);
    const pileXs = [-1.75, -0.6, 0.6, 1.75];
    const capT = 0.34;
    const strT = 0.32;
    const logR = 0.13;
    const capTop = (z: number) => f(z) - logR * 2 - strT;

    for (const z of bents) {
      const yTop = capTop(z) - capT;
      for (const x of pileXs) {
        b.cyl(0.18, yTop - FOOT, tint(oak, b.range(-0.05, 0.04)), { at: [x + b.range(-0.04, 0.04), FOOT, z], segs: 6 });
      }
      // the dark wet line where the piles stand in the river
      b.box(W, 0.2, 0.42, wet, { at: [0, WATER - 0.1, z], jitter: false });
      // cap beam across the pile heads, and a pair of braces in the trestle
      b.box(W + 0.5, capT, 0.4, oakD, { at: [0, yTop, z] });
      bar(b, [pileXs[0], -1.0, z + 0.22], [pileXs[3], yTop - 0.1, z + 0.22], [0.12, 0.16], oakD);
      bar(b, [pileXs[3], -1.0, z - 0.22], [pileXs[0], yTop - 0.1, z - 0.22], [0.12, 0.16], oakD);
      // the fender upstream: three raked piles lashed together, leaning into the current
      const fx = -W / 2 - 2.2;
      for (const dz of [-0.25, 0, 0.25]) {
        bar(b, [fx, FOOT, z + dz], [fx + 1.4, WATER + 0.9, z + dz * 0.4], [0.2, 0.2], tint(oak, -0.03));
      }
      b.box(0.5, 0.18, 0.7, P.wattle, { at: [fx + 1.15, WATER + 0.55, z] });
    }
    // log cribs at the water's edge: stacked logs on a row of piles, holding back the bank
    for (const s of [-1, 1]) {
      const z = s * (BANK - 0.2);
      const yTop = capTop(z) - capT;
      for (const x of pileXs) b.cyl(0.18, yTop - FOOT, oak, { at: [x, FOOT, z], segs: 6 });
      b.box(W + 0.5, capT, 0.4, oakD, { at: [0, yTop, z] });
      for (let i = 0; i < 4; i++) b.log(logR + 0.04, W + 1.0, tint(oak, -0.04), { at: [0, -1.5 + i * 0.34, z + s * 0.25], segs: 6 });
      b.sym((k) => {
        for (let i = 0; i < 3; i++) b.log(0.15, 2.2, tint(oak, -0.06), { at: [k * (W / 2 + 0.3), -1.35 + i * 0.34, z + s * 1.2], segs: 6, axis: 'z' });
      });
    }
    // longitudinal beams, in lengths from trestle to trestle
    const stringers = [-1.7, -0.85, 0, 0.85, 1.7];
    const ends = [-END + 1.8, -BANK + 0.2, ...bents, BANK - 0.2, END - 1.8];
    for (let i = 0; i < ends.length - 1; i++) {
      const za = ends[i];
      const zb = ends[i + 1];
      for (const x of stringers) {
        bar(b, [x, capTop(za) + strT / 2, za - 0.15], [x, capTop(zb) + strT / 2, zb + 0.15], [0.26, strT], tint(oak, 0.03));
      }
    }
    for (const s of [-1, 1]) b.box(W + 0.2, 0.3, 0.5, oakD, { at: [0, capTop(s * (END - 1.8)) - 0.1, s * (END - 1.8)] });

    // the road: split logs laid across, flat face up
    const pitch = 0.3;
    const n = Math.round((2 * (END - 0.8)) / pitch);
    for (let i = 0; i < n; i++) {
      const z = -(END - 0.8) + (i + 0.5) * ((2 * (END - 0.8)) / n);
      b.box(W + b.range(-0.15, 0.15), logR * 1.6, 0.27, tint(P.oakSilver, b.range(-0.18, -0.06)), {
        at: [b.range(-0.06, 0.06), f(z) - logR * 1.6, z],
        rot: [tilt(f, z), 0, 0],
      });
    }
    // earth ramps up onto the ends
    b.sym((s) => band(b, 0, W, s > 0 ? END - 1.4 : -END, s > 0 ? END : -END + 1.4, () => -0.1, (z) => f(z) - 0.03, mix(P.earth, P.chalk, 0.2), 2));

    // wattle hurdles along both edges, woven between stakes
    b.sym((s) => {
      const x = s * (W / 2 - 0.05);
      const zs = steps(10, -END + 1.2, END - 1.2);
      for (const z of zs) b.cyl(0.06, 1.15, oakD, { at: [x, f(z) - 0.1, z], segs: 5 });
      for (let i = 0; i < zs.length - 1; i++) {
        const za = zs[i] + 0.1;
        const zb = zs[i + 1] - 0.1;
        band(b, x, 0.07, za, zb, (z) => f(z) + 0.15, (z) => f(z) + 0.85, mix(P.wattle, P.oakSilver, 0.3), 3);
      }
    });

    b.tree(6.0, { kind: 'round', at: [-6.4, 0, 15.2], color: mix(P.leaf, P.olive, 0.4) });
    b.tree(7.0, { kind: 'poplar', at: [-5.2, 0, -16.4] });
  },
};
