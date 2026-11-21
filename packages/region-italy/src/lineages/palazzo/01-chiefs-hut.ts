import { P, tint, type BuildingDef } from '@ah/kit';
import { latialHut, ovalPlan } from './shared';

export const chiefsHut: BuildingDef = {
  id: 'chiefs-hut',
  name: 'Chief’s hut and compound',
  style: 'Iron Age (Villanovan and Latial)',
  date: 'c. 750 BC',
  summary:
    'The leading family of the hilltop village lives as everyone else does, only on a larger scale. ' +
    'Its hut is an oval of wattle and daub round a frame of posts, under a steep thatched roof pinned along the ridge by crossed timbers, with a porch over the door; we know the type from post-holes cut into the rock and from clay urns made in the shape of huts. ' +
    'Smaller huts for kin and stores, a raised granary and a pen share a fenced yard: wealth is counted in grain, livestock and bronze.',
  materials: ['wattle and daub', 'oak posts', 'thatch', 'stone footings', 'fired clay storage jars'],
  lookFor: [
    { label: 'Crossed ridge timbers', note: 'Pairs of crossed poles hold the thatch down along the ridge; the hut-shaped urns show them, sometimes carved like birds.', at: [0, 6.0, -1.5] },
    { label: 'Porch', note: 'A small porch on two posts shelters the door, which faces the yard.', at: [0, 2.4, 7.2] },
    { label: 'Smoke hole', note: 'There is no chimney: smoke from the central hearth leaks out through the thatch and a hole high in the end of the roof.', at: [0, 4.2, 5.6] },
    { label: 'Raised granary', note: 'Grain is kept off the damp ground and away from rats in a small store on posts.', at: [7.0, 2.4, 5.0] },
    { label: 'Palisade', note: 'A fence of posts and woven hurdles closes the compound, with a single gate.', at: [-4.0, 1.4, 11.2] },
  ],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, P.reed]);
    const daub = b.pick([P.daub, tint(P.daub, -0.05), P.cob]);
    b.box(21, 0.05, 22, P.earth, { at: [0, 0, 0] });
    // the chief's hut
    latialHut(b, { at: [0, 0, 1.0], a: 3.2, c: 4.8, wall: 2.0, roof: 3.3, porch: true, daub, thatch, crossed: 4 });
    b.collider(6.6, 9.8, { at: [0, 0, 1.0] });
    // the smaller huts of the household
    latialHut(b, { at: [-6.8, 0, -5.8], rotY: 0.5, a: 1.9, c: 2.6, wall: 1.6, roof: 2.6, daub, thatch, crossed: 2 });
    b.collider(4.2, 5.6, { at: [-6.8, 0, -5.8], rotY: 0.5 });
    latialHut(b, { at: [6.8, 0, -6.0], rotY: -0.4, a: 1.7, c: 2.3, wall: 1.5, roof: 2.4, daub, thatch, crossed: 2 });
    b.collider(3.8, 5.0, { at: [6.8, 0, -6.0], rotY: -0.4 });
    // the granary on posts
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(0.12, 1.4, P.oak, { at: [7.0 + x * 0.9, 0, 5.0 + z * 0.9], segs: 5 });
    b.box(2.4, 0.15, 2.4, P.oak, { at: [7.0, 1.4, 5.0] });
    b.box(2.0, 1.2, 2.0, P.wattle, { at: [7.0, 1.55, 5.0] });
    b.pyramid(2.6, 2.6, 1.4, thatch, { at: [7.0, 2.75, 5.0], overhang: 0.2 });
    b.collider(2.4, 2.4, { at: [7.0, 0, 5.0] });
    // hearth, storage jars and a covered storage pit
    b.cyl(0.9, 0.12, P.rubble, { at: [-3.6, 0, 6.4], segs: 8 });
    b.cyl(0.6, 0.14, P.soil, { at: [-3.6, 0, 6.4], segs: 8 });
    for (const [x, z] of [[4.4, 2.4], [4.9, 3.1], [3.9, 3.2]]) {
      b.lathe([[0.01, 0], [0.32, 0.1], [0.42, 0.45], [0.3, 0.8], [0.18, 0.9], [0.2, 0.98]], P.terracotta, { at: [x, 0, z], segs: 7 });
    }
    b.cyl(0.8, 0.1, P.oakDark, { at: [-5.0, 0, 2.5], segs: 7 });
    // a pen of hurdles with a couple of sheep
    const pen: [number, number][] = [[-9.2, 4.0], [-5.6, 4.0], [-5.6, 0.4], [-9.2, 0.4]];
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = pen[i];
      const [x1, z1] = pen[(i + 1) % 4];
      b.beam([x0, 0.45, z0], [x1, 0.45, z1], 0.06, 0.9, P.wattle);
    }
    for (const [x, z] of [[-7.8, 2.6], [-6.8, 1.6]]) {
      b.blob(0.35, P.limewash, { at: [x, 0.55, z], stretch: [1.4, 0.9, 0.9] });
      b.sphere(0.16, P.oakDark, { at: [x + 0.5, 0.7, z], segs: 5 });
    }
    // the palisade: posts and woven hurdles, with a gate at the front
    const ring = ovalPlan(10.6, 11.6, 27, 2.6);
    for (let i = 0; i < ring.length; i++) {
      const [x0, zl0] = ring[i];
      const [x1, zl1] = ring[(i + 1) % ring.length];
      const z0 = -zl0;
      const z1 = -zl1;
      b.cyl(0.11, 2.1, P.oakDark, { at: [x0, 0, z0], segs: 5 });
      // gate gap: the two panels either side of the front centre
      if (i === 13) continue;
      const len = Math.hypot(x1 - x0, z1 - z0);
      b.box(len, 1.5, 0.12, P.wattle, { at: [(x0 + x1) / 2, 0.1, (z0 + z1) / 2], rotY: -Math.atan2(z1 - z0, x1 - x0) });
    }
    // gateposts and lintel
    const [g0, g1] = [ring[13], ring[14]];
    b.beam([g0[0], 2.6, -g0[1]], [g1[0], 2.6, -g1[1]], 0.18, 0.18, P.oakDark);
    for (const g of [g0, g1]) b.cyl(0.15, 2.8, P.oakDark, { at: [g[0], 0, -g[1]], segs: 5 });
    b.tree(6, { kind: 'olive', at: [-8.8, 0, -1.2] });
    b.tree(7, { kind: 'round', at: [8.0, 0, -9.0] });
  },
};
