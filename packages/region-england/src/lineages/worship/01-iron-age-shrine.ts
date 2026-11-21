import { P, tint, spread, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';

/** Enclosure: x ±EX, z ±EZ (inside the bank). The entrance is in the east side (-Z). */
const EX = 9.5;
const EZ = 14;
const GATE = 3.2;

/** A tall oak post carved into stacked heads and rings. */
function carvedPost(b: Builder, at: Vec3, h: number) {
  b.group({ at }, () => {
    b.cyl(0.24, h, P.oakDark, { segs: 7, rTop: 0.2 });
    for (const y of [h * 0.35, h * 0.55]) b.cyl(0.3, 0.16, P.oak, { at: [0, y, 0], segs: 7 });
    // a carved head on top, with a darker band for the face and two eye notches
    b.cyl(0.27, 0.6, P.oak, { at: [0, h - 0.1, 0], segs: 7, rTop: 0.22 });
    b.box(0.28, 0.08, 0.06, P.timberBlack, { at: [0, h + 0.25, 0.24] });
    b.box(0.08, 0.2, 0.06, P.timberBlack, { at: [0, h + 0.02, 0.25] });
    b.cone(0.26, 0.3, P.oakDark, { at: [0, h + 0.5, 0], segs: 7 });
  });
}

/** Bank (with the ditch outside it) and a wattle fence along one side, from (x0, z0) to (x1, z1). */
function boundary(b: Builder, x0: number, z0: number, x1: number, z1: number, ox: number, oz: number) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ang = Math.atan2(x1 - x0, z1 - z0);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  // ditch: a dark band of mud just outside the bank, with a wet bottom
  b.box(1.8, 0.04, len + 1.8, tint(P.mud, 0.04), { at: [cx + ox * 1.9, 0, cz + oz * 1.9], rotY: ang, jitter: false });
  b.box(0.45, 0.06, len + 1.2, tint(P.mud, -0.07), { at: [cx + ox * 1.9, 0, cz + oz * 1.9], rotY: ang, jitter: false });
  // bank: a low earth ridge
  b.group({ at: [cx + ox * 0.4, 0, cz + oz * 0.4], rotY: ang }, () =>
    b.extrude([[-0.9, 0], [0.9, 0], [0.3, 0.55], [-0.3, 0.55]], len + 0.6, tint(P.turf, -0.04)),
  );
  // fence on the bank: posts and wattle hurdles
  b.box(0.1, 1.45, len, P.wattle, { at: [cx + ox * 0.4, 0.5, cz + oz * 0.4], rotY: ang });
  for (const f of spread(Math.round(len / 1.6), 0, 1)) {
    b.box(0.18, 1.8, 0.18, P.oak, { at: [x0 + (x1 - x0) * f + ox * 0.4, 0.4, z0 + (z1 - z0) * f + oz * 0.4] });
  }
}

export const ironAgeShrine: BuildingDef = {
  id: 'iron-age-shrine',
  name: 'Iron Age shrine',
  style: 'Iron Age',
  date: 'c. 500 BC',
  summary:
    'Long before any church, this patch of ground was already set apart as sacred. ' +
    'A ditch, a bank and a wattle fence mark off an enclosure from the everyday world, with a single entrance facing the sunrise. ' +
    'Inside stands a small square-cornered timber shrine, quite unlike the round houses people lived in, with carved posts and a pit for offerings of weapons, pots and animal bones.',
  materials: ['oak', 'wattle and daub', 'thatch', 'earth'],
  lookFor: [
    { label: 'Ditch and bank', note: 'The earthwork boundary that marked the sacred enclosure off from ordinary land.', at: [10.4, 0.6, 4] },
    { label: 'Rectangular shrine', note: 'A small timber building with straight walls and corners, when every house was round.', at: [2.4, 2.2, -1] },
    { label: 'Carved posts', note: 'Oak posts carved with heads, like the rare wooden figures that have survived in waterlogged ground.', at: [-2.4, 4.4, -12.6] },
    { label: 'Entrance to the east', note: 'The only way in faces the rising sun, as the doors of most Iron Age round houses faced east or south-east.', at: [0, 1.5, -14.6] },
    { label: 'Offering pit', note: 'Objects were broken or buried here as gifts to the gods, not thrown away.', at: [1.6, 0.4, -6.0] },
  ],
  build(b) {
    // enclosure sides: north, south, west, and the east side in two halves either side of the gate
    boundary(b, EX, -EZ, EX, EZ, 1, 0);
    boundary(b, -EX, -EZ, -EX, EZ, -1, 0);
    boundary(b, -EX, EZ, EX, EZ, 0, 1);
    boundary(b, -EX, -EZ, -GATE / 2 - 0.4, -EZ, 0, -1);
    boundary(b, GATE / 2 + 0.4, -EZ, EX, -EZ, 0, -1);
    // gate posts: two great carved posts flank the entrance, a causeway crosses the ditch
    carvedPost(b, [-2.4, 0, -EZ + 1.0], 3.9);
    carvedPost(b, [2.4, 0, -EZ + 1.0], 3.9);
    b.box(GATE, 0.05, 4.2, tint(P.earth, 0.05), { at: [0, 0, -EZ - 1.2], jitter: false });

    // the shrine: square-cornered, wattle and daub walls, steep thatched roof, door to the east
    const W = 4.4;
    const D = 5.6;
    const sz = 1.0;
    b.box(W, 2.2, D, P.daub, { at: [0, 0, sz] });
    for (const sx of [-1, 1]) for (const zz of [-1, 1]) b.box(0.24, 2.2, 0.24, P.oak, { at: [sx * (W / 2), 0, sz + zz * (D / 2)] });
    b.box(W + 0.1, 0.2, D + 0.1, P.oak, { at: [0, 2.05, sz] });
    b.gable(W, D, 2.8, P.thatch, { at: [0, 2.2, sz], ridge: 'z', overhang: 0.6, thick: 0.45, wall: P.daub });
    b.panel(1.2, 1.9, P.timberBlack, { at: [0, 0, sz - D / 2], facing: '-z' });
    // a porch of two posts carrying the overhanging gable
    for (const sx of [-1, 1]) b.box(0.2, 2.6, 0.2, P.oak, { at: [sx * 1.4, 0, sz - D / 2 - 0.5] });
    // animal skull hung over the door
    b.blob(0.22, P.chalk, { at: [0, 2.55, sz - D / 2 - 0.12], stretch: [1, 0.8, 0.6], detail: 0 });
    carvedPost(b, [0, 0, sz - D / 2 - 3.2], 4.4);

    // offering pit with a few deposits, and a hearth for feasts
    b.cyl(1.0, 0.03, tint(P.soil, -0.15), { at: [1.6, 0, -6], segs: 10, jitter: false });
    b.box(0.6, 0.06, 0.08, P.iron, { at: [1.5, 0.04, -6.1], rotY: 0.6 });
    b.blob(0.18, P.chalk, { at: [1.9, 0.08, -5.7], detail: 0 });
    b.cyl(0.8, 0.12, P.granite, { at: [-3.5, 0, -7.5], segs: 8 });
    b.cyl(0.6, 0.1, tint(P.soil, -0.2), { at: [-3.5, 0.06, -7.5], segs: 8 });
    // a sacred tree inside the enclosure
    b.tree(9, { at: [-5.5, 0, 9], kind: 'round', color: P.leafDark });
    b.collider(W + 1.2, D + 1.2, { at: [0, 0, sz] });
  },
};
