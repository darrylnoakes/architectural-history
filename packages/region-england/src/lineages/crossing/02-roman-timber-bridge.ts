import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, BED, END, hump, side, steps, bar, cutwaterPier, plankDeck, handrail, type ZY } from './shared';

/** Shared with the ruin stage, which shows the same piers broken. */
export const ROMAN_PIERS = [-2.9, 2.9];
export const ROMAN_PIER = { len: 4.4, thick: 1.7, nose: 1.1, top: -0.25 };

export const romanTimberBridge: BuildingDef = {
  id: 'roman-timber-bridge',
  name: 'Roman bridge',
  style: 'Roman military engineering',
  date: 'c. AD 120',
  summary:
    'The army drove a metalled road through the ford and bridged it. Squared stone piers with pointed cutwaters stand in the stream, and on them timber trestles carry beams and a plank deck, a common Roman way of bridging a large British river. ' +
    'Stone below the flood line and timber above was quick to build and easy to repair; bridges of this kind stood at Chesters on Hadrian’s Wall and at Piercebridge on the Tees. ' +
    'For the first time the crossing no longer depends on the state of the river.',
  materials: ['sandstone ashlar', 'oak', 'iron cramps'],
  lookFor: [
    { label: 'Cutwater', note: 'The pointed upstream end of each pier splits the current and sheds floating debris instead of catching it.', at: [-3.6, -0.6, 2.9] },
    { label: 'Ashlar pier', note: 'Squared, closely fitted blocks; at Chesters they were tied together with iron cramps set in lead.', at: [2.6, -0.2, -2.9] },
    { label: 'Timber trestle', note: 'A braced frame of posts on top of each pier, with raking struts reaching out to shorten the span of the beams.', at: [2.3, 0.2, 2.9] },
    { label: 'Stone abutment', note: 'A solid block of masonry holds each bank and takes the end of the deck.', at: [2.7, -0.4, -9.6] },
    { label: 'Plank deck', note: 'Oak planks laid across lengthwise beams, the stringers; worn planks could be replaced one at a time.', at: [0, 1.0, -6] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    b.noCollide();
    const W = 4.6; // deck width
    const crown = 0.9; // Roman decks ran nearly level
    const f = hump(crown);
    b.deck(W, 26, crown, { yEnds: 0 });
    const stone = b.pick([P.sandstone, tint(P.sandstone, 0.04), P.limestoneWarm]);
    const oak = P.oak;
    const beamD = 0.36; // stringer depth
    const under = (z: number) => f(z) - 0.08 - beamD; // underside of stringers

    // abutments: masonry from the bed up to the stringers, buried into each bank
    b.sym((s) => {
      const pts: ZY[] = [];
      for (const z of steps(6, BANK, END)) pts.push([s * z, under(z)]);
      pts.push([s * END, -0.4], [s * (BANK + 0.01), -0.4], [s * (BANK + 0.01), BED - 0.1], [s * (BANK - 0.6), BED - 0.1], [s * (BANK - 0.6), under(BANK)]);
      side(b, pts, W + 0.8, stone);
      // wing walls returning along the bank
      b.box(W + 3.2, -0.05 - BED, 0.5, tint(stone, -0.03), { at: [0, BED - 0.1, s * (BANK - 0.2)] });
      // course lines on the river face
      for (const y of [-1.5, -0.8, -0.1]) b.box(W + 0.84, 0.05, 0.05, tint(stone, -0.1), { at: [0, y, s * (BANK - 0.62)], jitter: false });
    });

    // piers with cutwaters both ends, an offset footing course and a projecting cap course
    for (const z of ROMAN_PIERS) {
      const { len, thick, nose, top } = ROMAN_PIER;
      cutwaterPier(b, { z, len: len + 0.3, thick: thick + 0.3, nose: nose + 0.15, y0: BED - 0.1, h: 0.5, color: tint(stone, -0.05) });
      cutwaterPier(b, { z, len, thick, nose, y0: BED + 0.4, h: top - BED - 0.4, color: stone, cap: 0.08, capColor: tint(stone, 0.04) });
      // ashlar course lines
      for (const y of [-1.0, -0.5, 0.0 - 0.35]) b.box(len + 0.02, 0.04, thick + 0.02, tint(stone, -0.1), { at: [0, y, z], jitter: false });
    }

    // timber trestle on each pier: four posts, a cap beam (corbel) and raking struts
    const postX = [-1.65, -0.55, 0.55, 1.65];
    for (const z of ROMAN_PIERS) {
      const y0 = ROMAN_PIER.top + 0.25;
      const yCap = under(z) - 0.26;
      b.box(W - 0.2, 0.22, 0.4, tint(oak, -0.08), { at: [0, y0 - 0.02, z] }); // sole plate
      for (const x of postX) {
        b.box(0.28, yCap - y0, 0.28, oak, { at: [x, y0, z] });
        // raking struts fanning out along the road to carry the stringers
        b.sym((s) => bar(b, [x, y0 + 0.15, z + s * 0.12], [x, under(z + s * 1.5) - 0.02, z + s * 1.5], 0.18, tint(oak, -0.04)));
      }
      b.box(W, 0.26, 0.42, tint(oak, -0.05), { at: [0, yCap, z] }); // cap beam
      // cross bracing between the outer posts
      bar(b, [-1.65, y0 + 0.1, z + 0.18], [1.65, yCap - 0.02, z + 0.18], 0.12, tint(oak, -0.1));
      bar(b, [1.65, y0 + 0.1, z - 0.18], [-1.65, yCap - 0.02, z - 0.18], 0.12, tint(oak, -0.1));
    }

    // stringers: lengthwise beams, laid in straight lengths between supports
    const supports = [-END, -BANK + 0.3, ROMAN_PIERS[0], ROMAN_PIERS[1], BANK - 0.3, END];
    for (const x of postX) {
      for (let i = 0; i < supports.length - 1; i++) {
        const za = supports[i];
        const zb = supports[i + 1];
        bar(b, [x, under(za), za], [x, under(zb), zb], [0.3, beamD], tint(oak, -0.02));
      }
    }

    // plank deck, kerb beams and a simple timber rail
    plankDeck(b, { width: W, f, z0: -END, z1: END, pitch: 0.42, thick: 0.09, color: tint(P.oak, 0.06) });
    b.sym((s) => {
      handrail(b, { x: s * (W / 2 - 0.1), f, z0: -11.5, z1: 11.5, posts: 9, h: 1.05, color: tint(oak, -0.06), mid: true });
    });
  },
};
