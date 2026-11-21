import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { BANK, WATER, riverWall } from './shared';

export const timberWorkspace: BuildingDef = {
  id: 'timber-workspace',
  name: 'Maker space and studios',
  style: 'Contemporary (mass timber)',
  date: 'c. 2016',
  summary:
    'When the factory closed, the site was rebuilt for small firms, makers and designers who need a workshop rather than a production line. ' +
    'The frame is engineered timber: glued-laminated (glulam) posts and beams and cross-laminated timber panels, which lock up carbon and go up quickly from factory-made parts. ' +
    'Its saw-tooth roof deliberately echoes the old north-light sheds, but now the sunny slopes carry solar panels, and after two hundred years of turning its back on the river ' +
    'the building opens onto it with glass and a public terrace.',
  materials: ['glulam and cross-laminated timber', 'larch cladding', 'glass', 'solar panels', 'zinc'],
  lookFor: [
    { label: 'Saw-tooth roof', note: 'A nod to the weaving sheds: north-facing glazing for even daylight in the studios.', at: [0, 11.2, 5.6] },
    { label: 'Solar panels', note: 'Laid on the south-facing slopes of the roof to make electricity for the workshops.', at: [-7, 11, -2.8] },
    { label: 'Glulam frame', note: 'Big timber posts and beams, made by gluing thin boards together, left on show behind the glass.', at: [-4.5, 2.5, 6.5] },
    { label: 'Larch cladding', note: 'Untreated vertical boards that weather to a silver grey.', at: [-15.2, 6.2, 0] },
    { label: 'Riverside terrace', note: 'A deck and steps down to the water: the river is now a place to sit, not a source of power or a drain.', at: [9, 0.8, -12.8] },
  ],
  influences: ['passivhaus'],
  build(b) {
    const larch = b.pick([P.larch, P.cedar, tint(P.larch, 0.04)]);
    const glulam = P.pine;
    const glass = P.glass;

    const W = 30;
    const D = 11.4;
    const bz = -0.2;
    const g = 4.4; // workshop floor height
    const u = 3.6; // studio floor
    const H = g + u;
    const front = bz + D / 2;
    const back = bz - D / 2;

    // ---- body: glazed workshop floor, larch-clad studio floor
    b.box(W, 0.3, D, P.concrete, { at: [0, 0, bz] });
    b.box(W - 0.6, g, D - 0.6, P.windowDark, { at: [0, 0.3, bz] });
    b.box(W, 0.5, D, glulam, { at: [0, g, bz] });
    b.box(W, u - 0.2, D, larch, { at: [0, g + 0.5, bz] });
    // ground-floor glass on front and back, behind a rhythm of glulam posts
    const posts = spread(10, -W / 2, W / 2).map((x) => x - W / 20).concat([W / 2]);
    for (const z of [front, back]) {
      const f = z > 0 ? 1 : -1;
      b.box(W - 0.4, g - 0.2, 0.08, glass, { at: [0, 0.3, z - f * 0.3], mat: 'glass', jitter: false });
      for (const x of posts) b.box(0.4, g, 0.5, glulam, { at: [Math.max(-W / 2 + 0.2, Math.min(W / 2 - 0.2, x)), 0.3, z - f * 0.1] });
    }
    // sliding workshop doors at the ends
    for (const s of [-1, 1]) b.panel(4.0, 3.6, larch, { at: [s * (W / 2 - 0.3), 0.3, bz], facing: s > 0 ? '+x' : '-x' });
    b.sym((s) => b.box(0.3, g, D - 0.6, larch, { at: [s * (W / 2 - 0.45), 0.3, bz] }));
    // vertical board lines on the larch
    for (const x of spread(46, -W / 2, W / 2)) {
      b.box(0.05, u - 0.2, 0.04, tint(larch, -0.08), { at: [x, g + 0.5, front + 0.02], jitter: false });
      b.box(0.05, u - 0.2, 0.04, tint(larch, -0.08), { at: [x, g + 0.5, back - 0.02], jitter: false });
    }
    // studio windows: tall and narrow to the lane, wide toward the river with timber fins
    for (const x of spread(8, -W / 2, W / 2)) b.window(1.2, 2.4, { at: [x, g + 0.9, front], facing: '+z', frame: P.cladGrey, glass: P.glassDark, border: 0.08 });
    for (const x of spread(5, -W / 2, W / 2)) {
      b.window(4.4, 2.6, { at: [x, g + 0.8, back], facing: '-z', frame: P.cladGrey, glass: P.glassDark, border: 0.08, mat: 'glass' });
      for (const dx of [-1.5, -0.5, 0.5, 1.5]) b.box(0.08, 2.8, 0.5, glulam, { at: [x + dx, g + 0.7, back - 0.25] });
    }
    // ---- saw-tooth roof: four teeth, glazing to the north (+Z), solar panels on the south slopes
    const teeth = 4;
    const p = D / teeth;
    const rh = 2.3;
    const ang = Math.atan2(rh, p - 0.2);
    for (let i = 0; i < teeth; i++) {
      const z0 = back + i * p;
      b.extrude([[0, 0], [p - 0.2, rh], [p, rh], [p, 0]], W, P.zinc, { at: [0, H + 0.3, z0], rotY: -Math.PI / 2 });
      b.box(W - 0.4, rh - 0.2, 0.06, glass, { at: [0, H + 0.4, z0 + p - 0.03], mat: 'glass', jitter: false });
      for (const x of spread(10, -W / 2, W / 2)) b.box(0.12, rh - 0.1, 0.14, glulam, { at: [x - W / 20, H + 0.3, z0 + p - 0.05] });
      const sl = Math.hypot(rh, p - 0.2);
      b.group({ at: [0, H + 0.3 + rh / 2 + 0.06, z0 + (p - 0.2) / 2], rot: [-ang, 0, 0] }, () => {
        for (const x of spread(6, -W / 2 + 0.4, W / 2 - 0.4)) b.box(4.4, 0.06, sl * 0.8, P.solar, { at: [x, 0, 0], mat: 'glass', jitter: false });
      });
    }
    b.sym((s) => {
      for (let i = 0; i < teeth; i++) b.extrude([[0, 0], [p - 0.2, rh], [p, rh], [p, 0]], 0.25, larch, { at: [s * (W / 2 - 0.12), H + 0.3, back + i * p], rotY: -Math.PI / 2 });
    });
    b.box(W + 0.2, 0.3, D + 0.2, P.cladGrey, { at: [0, H, bz] });

    // ---- the riverside terrace: deck to the bank, cantilevered over the water, steps down
    const tz = (back + BANK - 1.0) / 2;
    const td = back - (BANK - 1.0);
    riverWall(b, -17.6, 17.6, P.gritstone, { coping: P.paving });
    b.box(W + 2, 0.35, td, larch, { at: [0, 0, tz] });
    for (const x of spread(12, -W / 2 - 1, W / 2 + 1)) b.box(0.25, 0.35 - WATER + 0.4, 0.25, glulam, { at: [x, WATER - 0.4, BANK - 0.8] });
    b.deck(W + 2, td, 0.35, { at: [0, 0, tz] });
    // glass balustrade with a timber handrail
    // (in two runs, leaving a gap at the head of the steps)
    const gap0 = 6.6;
    const gap1 = 8.2;
    const x0 = -W / 2 - 1;
    const x1 = W / 2 + 1;
    for (const [a, c] of [[x0, gap0], [gap1, x1]]) {
      b.box(c - a, 1.0, 0.04, glass, { at: [(a + c) / 2, 0.35, BANK - 0.95], mat: 'glass', jitter: false });
      b.box(c - a, 0.08, 0.14, glulam, { at: [(a + c) / 2, 1.35, BANK - 0.95] });
    }
    // steps down to the water, running along the outside of the deck
    b.stairs(1.5, 0.35 - WATER + 0.3, 3.4, 8, P.gritstone, { at: [(gap0 + gap1) / 2 + 1.7, WATER - 0.3, BANK - 1.75], rotY: Math.PI / 2 });
    // benches and planters on the terrace
    for (const x of [-11, -4, 10]) b.box(2.2, 0.45, 0.6, glulam, { at: [x, 0.35, BANK + 0.6] });
    for (const x of [-14, 13]) {
      b.box(1.4, 0.6, 1.4, larch, { at: [x, 0.35, BANK + 1.4] });
      b.tree(4.5, { at: [x, 0.9, BANK + 1.4], kind: 'round', color: P.leafDark });
    }
    // front: bike stands, planting, and a sign
    for (const x of spread(6, 6, 13)) b.box(0.06, 0.8, 0.7, P.steel, { at: [x, 0, 8.5] });
    b.box(9, 0.4, 1.2, larch, { at: [-9, 0, 8.6] });
    b.box(8.8, 0.3, 1.0, P.leaf, { at: [-9, 0.4, 8.6] });
    for (const x of [-15, 15.5]) b.tree(7, { at: [x, 0, 9.2] });
    b.box(5.0, 0.7, 0.1, P.cladGrey, { at: [-7, g + 0.1, front + 0.35] });

    b.collider(W, D, { at: [0, 0, bz] });
    b.collider(W + 2, 0.4, { at: [0, 0, BANK - 0.95] });
  },
};
