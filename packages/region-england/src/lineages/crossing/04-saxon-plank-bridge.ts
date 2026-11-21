import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, BED, END, hump, bar, plankDeck, handrail } from './shared';

const WATER_BRACE = -1.0; // sway braces start just above the low-water line

export const saxonPlankBridge: BuildingDef = {
  id: 'saxon-plank-bridge',
  name: 'Timber pile bridge',
  style: 'Late Anglo-Saxon',
  date: 'c. 950',
  summary:
    'From Alfred’s time, late Saxon kings built a network of fortified towns, or burhs, and kept up the roads and bridges that linked them. Bridge-work was one of the three common burdens every landholder owed the king, along with army service and repairing fortifications. ' +
    'This bridge is all oak: rows of piles driven into the riverbed, each row capped by a beam, with lengthwise beams and a plank deck on top. ' +
    'No stone is used, so it is quick to build but rots and needs constant renewal; remains of timber bridges have been dug up on the Trent, at Cromwell (8th century) and at Hemington (about 1100).',
  materials: ['oak piles', 'split oak planks', 'iron spikes'],
  lookFor: [
    { label: 'Pile trestle', note: 'A row of oak piles driven into the riverbed with a mallet or drop weight, braced across with diagonals.', at: [1.8, -0.4, 3] },
    { label: 'Headstock', note: 'The cross beam capping each row of piles, on which the lengthwise beams rest.', at: [1.9, 0.5, -3] },
    { label: 'Stringers', note: 'Lengthwise beams spanning from one trestle to the next, carrying the deck.', at: [1.3, 0.5, -4.5] },
    { label: 'Plank deck', note: 'Split oak planks laid across the stringers; just wide enough for a cart, about 3 m.', at: [0, 1.4, 1.5] },
    { label: 'Handrail', note: 'A simple post-and-rail fence on each side, the only thing between a traveller and the river.', at: [-1.6, 2.1, -6] },
  ],
  build(b) {
    b.noCollide();
    const W = 3.2;
    const crown = 1.1;
    const f = hump(crown);
    b.deck(W, 26, crown, { yEnds: 0 });
    const oak = P.oak;
    const old = tint(P.oak, -0.06);
    const beamD = 0.3;
    const under = (z: number) => f(z) - 0.08 - beamD;
    const bents = [-6, -3, 0, 3, 6];
    const pileX = [-1.35, -0.45, 0.45, 1.35];

    // pile trestles (bents)
    for (const z of bents) {
      const yHead = under(z) - 0.26;
      for (const x of pileX) {
        const r = b.range(0.13, 0.17);
        b.cyl(r, yHead - BED + 0.3, tint(oak, b.range(-0.06, 0.03)), { at: [x + b.range(-0.04, 0.04), BED - 0.3, z + b.range(-0.05, 0.05)], segs: 7, rTop: r * 0.9 });
      }
      // raking outer piles to stiffen the bent against the current
      b.sym((s) => bar(b, [s * 2.0, BED - 0.2, z], [s * 1.45, yHead, z], 0.24, old));
      b.box(W + 0.6, 0.26, 0.34, tint(oak, -0.1), { at: [0, yHead, z] }); // headstock
      // sway braces
      bar(b, [-1.35, WATER_BRACE, z + 0.17], [1.35, yHead - 0.02, z + 0.17], [0.1, 0.18], old);
      bar(b, [1.35, WATER_BRACE, z - 0.17], [-1.35, yHead - 0.02, z - 0.17], [0.1, 0.18], old);
    }

    // timber-revetted banks with a sill beam for the bridge ends
    b.sym((s) => {
      for (const x of [-2.4, -1.2, 0, 1.2, 2.4]) b.cyl(0.11, -BED + 0.2, old, { at: [x, BED - 0.3, s * (BANK - 0.12)], segs: 6 });
      for (const y of [-1.8, -1.3, -0.8, -0.3]) b.box(5.2, 0.42, 0.08, tint(oak, -0.03), { at: [0, y, s * (BANK - 0.02)], jitter: true });
      b.box(W + 0.6, 0.3, 0.4, tint(oak, -0.1), { at: [0, under(s * (BANK + 0.6)) - 0.3, s * (BANK + 0.6)] });
      b.box(W + 0.6, 0.3, 0.4, tint(oak, -0.1), { at: [0, under(s * (END - 0.4)) - 0.3, s * (END - 0.4)] });
    });

    // stringers in lengths between supports
    const supports = [-END + 0.2, -BANK - 0.6, ...bents, BANK + 0.6, END - 0.2];
    for (const x of pileX) {
      for (let i = 0; i < supports.length - 1; i++) {
        const za = supports[i];
        const zb = supports[i + 1];
        bar(b, [x, under(za), za], [x, under(zb), zb], [0.26, beamD], tint(oak, b.range(-0.04, 0.02)));
      }
    }

    plankDeck(b, { width: W, f, z0: -END, z1: END, pitch: 0.36, thick: 0.08, color: tint(P.oak, 0.08) });
    b.sym((s) => handrail(b, { x: s * (W / 2 - 0.07), f, z0: -10, z1: 10, posts: 9, h: 1.0, color: old, post: 0.12 }));
  },
};
