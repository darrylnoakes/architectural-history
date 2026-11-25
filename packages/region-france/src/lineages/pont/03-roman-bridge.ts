import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { END, ROMAN, hump, band, side, bar, steps, tilt, romanStumps, type ZY } from './shared';

export const romanBridge: BuildingDef = {
  id: 'roman-bridge',
  name: 'Roman bridge on stone piers',
  style: 'Gallo-Roman',
  date: 'c. AD 120',
  summary:
    'The road that the Romans laid across Gaul, straight and gravelled, now crosses the river on stone piers. Each pier is built of large squared blocks on a footing sunk into the river bed, with a pointed cutwater upstream to split the current. ' +
    'The road itself is still timber: heavy oak beams run from pier to pier, propped by raking struts that stand on a ledge in the masonry, and carry a deck of planks. ' +
    'This was the usual Roman bridge of the north. Stone arches throughout, as on the bridges of Provence and Italy, were costly, and few are known so far north; at Trier the piers of about 150 carried a timber road for a thousand years before arches were built on them. ' +
    'The timber had to be renewed every generation or two, but the piers were built to last, and some still stand in the rivers of the Rhineland.',
  materials: ['limestone in large blocks', 'rubble and mortar core', 'oak beams and planks', 'gravel road'],
  modelledOn: 'The Roman bridge over the Moselle at Trier (piers of about AD 150): stone piers with pointed cutwaters upstream and a timber road on strutted beams, as it is usually reconstructed. Reduced to four piers',
  lookFor: [
    { label: 'Stone pier', note: 'Large squared blocks, laid in level courses and held with iron cramps, on a footing built inside a timber cofferdam pumped dry.', at: [3.1, -0.9, 2.55] },
    { label: 'Cutwater', note: 'The pointed upstream end of each pier splits the current and stops branches and ice piling up against the masonry.', at: [-4.0, -0.9, -2.55] },
    { label: 'Strut frame', note: 'Raking oak struts stand on a ledge in the pier and prop the beams a third of the way across each opening, so that shorter timbers can span it.', at: [2.6, -0.1, 1.3] },
    { label: 'Timber road', note: 'Planks laid across the beams carry the road. The timber is the part that rots and burns, and it was renewed many times on the same piers.', at: [0, 1.25, 4.0] },
    { label: 'Milestone', note: 'A stone column at the bridgehead gives the distance along the road and the name of the emperor who repaired it.', at: [4.6, 1.2, 15.4] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    b.noCollide();
    const crown = 1.15;
    const f = hump(crown);
    const W = ROMAN.W;
    b.deck(W - 0.9, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.limestone, 0.4);
    const ring = tint(stone, 0.07);
    const core = tint(stone, -0.05);
    const oak = P.oak;
    const oakD = P.oakDark;
    const { pierT, AB, ledge, abTop } = ROMAN;
    const plankT = 0.14;
    const beamH = 0.42;
    const beamTop = (z: number) => f(z) - plankT;
    const seat = (z: number) => beamTop(z) - beamH - 0.3; // top of the masonry

    // the lower fabric (abutment courses, footings, pier shafts to the ledge, cutwaters), which outlasts the timber
    const piers = romanStumps(b, { stone, core, ring, upHood: true });

    // the abutments' upper courses carry the road onto the bridge, with a ledge for the first struts
    for (const s of [-1, 1]) {
      const zs = steps(6, AB, END);
      const pts: ZY[] = [[s * END, abTop], [s * AB, abTop], ...zs.map((z): ZY => [s * z, f(s * z) - 0.16])];
      side(b, s > 0 ? pts : pts.reverse(), W, core);
      b.box(W + 0.2, 0.3, 0.5, ring, { at: [0, ledge - 0.3, s * (AB - 0.2)] });
      band(b, 0, W - 0.9, s > 0 ? AB : -END, s > 0 ? END : -AB, (z) => f(z) - 0.17, (z) => f(z) + 0.01, mix(P.gravel, P.chalk, 0.2), 4);
      // low stone kerbs on the approach
      b.sym((k) => band(b, k * (W / 2 - 0.22), 0.44, s > 0 ? AB + 0.2 : -END + 0.4, s > 0 ? END - 0.4 : -AB - 0.2, (z) => f(z) - 0.17, (z) => f(z) + 0.55, stone, 4));
    }

    // the piers above the ledge: the shaft, a capping course, and a timber sleeper under the beams
    for (const z of piers) {
      b.box(W, seat(z) - ledge, pierT, stone, { at: [0, ledge, z] });
      b.box(W + 0.16, 0.2, pierT + 0.16, ring, { at: [0, seat(z) - 0.2, z] });
      for (const y of [-0.55, -0.1]) if (y < seat(z) - 0.3) b.box(W + 0.03, 0.03, pierT + 0.03, tint(stone, -0.12), { at: [0, y, z], jitter: false });
      b.box(W + 0.3, 0.3, 0.55, oakD, { at: [0, seat(z), z] });
    }

    // the timber road: beams from pier to pier, propped by struts, a straining beam between the strut heads
    const lines = [-2.5, -1.25, 0, 1.25, 2.5];
    const stops = [-AB, ...piers, AB];
    for (let i = 0; i < stops.length - 1; i++) {
      const edge = (j: number, dir: number) => stops[j] + dir * (j === 0 || j === stops.length - 1 ? 0 : pierT / 2);
      const za = edge(i, 1);
      const zb = edge(i + 1, -1);
      const span = zb - za;
      for (const x of lines) {
        bar(b, [x, beamTop(za) - beamH / 2, za - 0.5], [x, beamTop(zb) - beamH / 2, zb + 0.5], [0.3, beamH], tint(oak, b.range(-0.04, 0.04)));
        if (Math.abs(x) < 2 && Math.abs(x) > 0.1) continue;
        const z1 = za + span * 0.3;
        const z2 = zb - span * 0.3;
        const y1 = beamTop(z1) - beamH - 0.13;
        const y2 = beamTop(z2) - beamH - 0.13;
        bar(b, [x, ledge + 0.05, za + 0.05], [x, y1, z1], [0.24, 0.26], oakD);
        bar(b, [x, ledge + 0.05, zb - 0.05], [x, y2, z2], [0.24, 0.26], oakD);
        bar(b, [x, y1, z1 - 0.15], [x, y2, z2 + 0.15], [0.26, 0.24], oakD);
      }
    }
    // planks laid across
    const half = AB + 0.3;
    const n = Math.round((2 * half) / 0.34);
    for (let i = 0; i < n; i++) {
      const z = -half + (i + 0.5) * ((2 * half) / n);
      b.box(W - 0.1 + b.range(-0.08, 0.08), plankT, 0.31, tint(P.oakSilver, b.range(-0.16, -0.04)), { at: [0, f(z) - plankT, z], rot: [tilt(f, z), 0, 0] });
    }
    // a timber rail on posts along each edge
    b.sym((k) => {
      const x = k * (W / 2 - 0.2);
      const zs = steps(12, -half + 0.2, half - 0.2);
      for (const z of zs) b.box(0.16, 1.05, 0.16, oakD, { at: [x, f(z) - 0.02, z], jitter: false });
      band(b, x, 0.12, -half + 0.2, half - 0.2, (z) => f(z) + 0.9, (z) => f(z) + 1.04, oak, 14);
      band(b, x, 0.08, -half + 0.2, half - 0.2, (z) => f(z) + 0.45, (z) => f(z) + 0.55, oak, 14);
    });

    // a milestone at the north bridgehead
    b.group({ at: [4.6, 0, 15.4] }, () => {
      b.box(0.8, 0.3, 0.8, ring);
      b.cyl(0.3, 1.7, stone, { at: [0, 0.3, 0], segs: 10 });
      b.panel(0.4, 0.6, tint(stone, -0.12), { at: [-0.29, 1.05, 0], facing: '-x', depth: 0.02 });
    });
    b.tree(6.5, { kind: 'poplar', at: [-5.4, 0, -16.0] });
    b.tree(5.5, { kind: 'round', at: [5.8, 0, -16.6] });
  },
};
