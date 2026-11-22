import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { ashlar, lineColliders, wallSeg, type XZ } from './shared';

/** The citadel wall, clockwise from the right of the gate round to its left (outside on the right). */
const WALL: XZ[] = [
  [2.6, 18.6],
  [15.5, 18.6],
  [20, 13.5],
  [20, -14.5],
  [15.5, -20],
  [-15.5, -20],
  [-20, -14.5],
  [-20, 13.5],
  [-15.5, 18.6],
  [-2.6, 18.6],
];
const WH = 5.4;
const WT = 2.0;

/** A range of rooms: tufa footings, mud-brick walls, a low roof of fired tiles with painted antefixes. */
function range(b: Builder, x: number, z: number, w: number, d: number, h: number, o: { ridge?: 'x' | 'z'; doors?: ('+z' | '-z' | '+x' | '-x')[] }): void {
  const tufa = P.tufa;
  const wall = mix(P.mudbrick, P.daub, 0.3);
  b.box(w, 0.8, d, tufa, { at: [x, 0, z] });
  b.box(w - 0.1, h - 0.8, d - 0.1, wall, { at: [x, 0.8, z] });
  const ridge = o.ridge ?? 'x';
  const span = ridge === 'x' ? d : w;
  const rh = span * 0.2; // about 22 degrees
  b.gable(w, d, rh, P.terracotta, { at: [x, h, z], ridge, overhang: 0.6, wall, thick: 0.14 });
  // the ridge capped with half-round tiles, a painted disc acroterion at each end
  const len = ridge === 'x' ? w : d;
  b.log(0.13, len + 1.0, tint(P.terracotta, -0.05), { at: [x, h + rh - 0.02, z], axis: ridge, segs: 5 });
  for (const s of [-1, 1]) {
    const ax = ridge === 'x' ? x + s * (w / 2 + 0.5) : x;
    const az = ridge === 'z' ? z + s * (d / 2 + 0.5) : z;
    b.cyl(0.45, 0.08, P.terracottaPainted, { at: [ax, h + rh + 0.2, az], segs: 8, rot: ridge === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0] });
  }
  // a row of painted antefixes closing the tiles along both eaves
  const eaveOut = span / 2 + 0.6;
  for (const s of [-1, 1]) {
    for (const t of spread(Math.max(2, Math.round(len / 1.1)), -len / 2 - 0.3, len / 2 + 0.3)) {
      const ex = ridge === 'x' ? x + t : x + s * eaveOut;
      const ez = ridge === 'x' ? z + s * eaveOut : z + t;
      b.box(ridge === 'x' ? 0.35 : 0.08, 0.42, ridge === 'x' ? 0.08 : 0.35, P.terracottaPainted, { at: [ex, h - 0.2, ez], jitter: false });
    }
  }
  // doors
  for (const f of o.doors ?? []) {
    const at: [number, number, number] =
      f === '+z' ? [x, 0, z + d / 2] : f === '-z' ? [x, 0, z - d / 2] : f === '+x' ? [x + w / 2, 0, z] : [x - w / 2, 0, z];
    b.panel(1.2, 2.2, P.oakDark, { at, facing: f });
  }
}

export const archaicCitadel: BuildingDef = {
  id: 'archaic-citadel',
  name: 'Walled citadel',
  style: 'Etruscan archaic',
  date: 'c. 500 BC',
  summary:
    'The village has grown into a town under Etruscan influence, and its hilltop citadel is now walled in great squared blocks of tufa, the soft volcanic stone of the region, cut and laid in courses without mortar. ' +
    'Inside stands the house of the ruling family: tufa footings, walls of mud brick, rooms round a courtyard, and roofs of fired clay tiles, learned from the Greeks about a century before, their eaves lined with painted terracotta. ' +
    'A cistern cut into the rock stores rainwater against siege and drought. Whether the ruler is a king or the leading man of a few noble families, power now sits behind stone walls in a house built to last.',
  materials: ['tufa blocks', 'mud brick', 'fired clay tiles', 'painted terracotta', 'timber'],
  lookFor: [
    { label: 'Squared-block wall', note: 'Courses of big rectangular tufa blocks fitted without mortar, a technique the Romans later called opus quadratum. Etruscan cities built walls like this from the sixth century BC, and most of the surviving ones date from the fifth and fourth.', at: [12, 3.4, 19.8] },
    { label: 'Gate between towers', note: 'The way in passes under a stone lintel between two square towers that project from the wall.', at: [0, 5, 20.8] },
    { label: 'Ruler’s house', note: 'Rooms on three sides of a courtyard, the main hall facing the entrance across it.', at: [-2, 5.2, -11.5] },
    { label: 'Painted antefixes', note: 'Terracotta plaques closing the ends of the roof tiles, painted with faces and palmettes in red, black and white.', at: [-8.6, 3.2, -1.8] },
    { label: 'Cistern', note: 'A tank cut into the rock and lined with stone, drawn from through a stone well-head.', at: [-12, 1.2, 9] },
  ],
  modelledOn: 'The archaic houses of Acquarossa (Viterbo) and the squared-block walls of Etruscan hill towns',
  influences: ['etruscan-legacy', 'greek-colonies'],
  build(b) {
    const tufa = P.tufa;
    const tufaB = tint(P.tufa, -0.05);
    const tufaC = tint(P.tufa, 0.03);

    // trodden ground inside the walls
    b.box(39, 0.05, 37, mix(P.earth, P.grassDry, 0.4), { at: [0, 0, -0.7], jitter: false });

    // ---------------------------------------------------------- the wall of squared blocks
    for (let i = 0; i < WALL.length - 1; i++) {
      wallSeg(b, WALL[i], WALL[i + 1], WT, WH, tint(tufa, -0.03), 0, WT / 2);
      ashlar(b, WALL[i], WALL[i + 1], 0, WH, WT / 2, [tufaB, tufaC], { course: 0.68, block: 1.7 });
      // a flat coping and a low breastwork on the outer edge
      const [x0, z0] = WALL[i];
      const [x1, z1] = WALL[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      const nx = (-(z1 - z0) / L) * (WT / 2 - 0.25);
      const nz = ((x1 - x0) / L) * (WT / 2 - 0.25);
      wallSeg(b, [x0 + nx, z0 + nz], [x1 + nx, z1 + nz], 0.5, 1.0, tufa, WH, 0.25);
    }
    // the gate: two square towers, a passage, a great lintel and timber doors standing open
    for (const s of [-1, 1]) {
      const x = s * 4.6;
      b.box(4, 7.4, 4.4, tint(tufa, -0.03), { at: [x, 0, 18.6] });
      ashlar(b, [x - 2, 20.8], [x + 2, 20.8], 0, 7.4, 0, [tufaB, tufaC], { course: 0.68, block: 1.4 });
      ashlar(b, s > 0 ? [x + 2, 20.8] : [x - 2, 16.4], s > 0 ? [x + 2, 16.4] : [x - 2, 20.8], 0, 7.4, 0, [tufaB, tufaC], { course: 0.68, block: 1.4 });
      b.box(4.3, 0.4, 4.7, tufaC, { at: [x, 7.4, 18.6], jitter: false });
      b.box(0.2, 3.6, 2.0, P.oakDark, { at: [s * 2.0, 0, 16.6], rotY: s * 0.5 });
    }
    b.box(5.4, 1.2, WT + 0.4, tufaB, { at: [0, 4.2, 18.6] }); // the lintel
    b.box(5.2, 1.6, WT, tint(tufa, -0.03), { at: [0, 5.4, 18.6] });
    b.box(5.2, 0.12, 4.6, mix(P.earth, P.gravel, 0.5), { at: [0, 0, 18.6], jitter: false }); // threshold

    // ---------------------------------------------------------- the ruler's house round its courtyard
    range(b, -2, -14, 18, 5.2, 4.2, { doors: ['+z'] }); // the hall across the back
    range(b, -8.5, -7.5, 5, 7.8, 3.6, { ridge: 'z', doors: ['+x'] });
    range(b, 4.5, -7.5, 5, 7.8, 3.6, { ridge: 'z', doors: ['-x'] });
    // a timber porch in front of the hall, on posts with stone bases
    b.box(10, 0.25, 2.6, tufa, { at: [-2, 0, -10.2] });
    for (const x of spread(4, -6.2, 2.2)) {
      b.box(0.5, 0.3, 0.5, tufa, { at: [x, 0.25, -9.2] });
      b.cyl(0.18, 3.0, P.oak, { at: [x, 0.55, -9.2], segs: 6 });
    }
    b.shed(10.6, 2.8, 0.7, P.terracotta, { at: [-2, 3.55, -10.1], high: '-z' });
    // the courtyard paved in tufa slabs, with a low wall and gateway closing it at the front
    b.box(8, 0.08, 7.8, tint(tufa, 0.06), { at: [-2, 0, -7.5], jitter: false });
    for (const s of [-1, 1]) b.box(2.6, 2.4, 0.6, tufa, { at: [-2 + s * 2.7, 0, -3.6] });
    b.box(2.8, 0.5, 0.8, tufaB, { at: [-2, 2.4, -3.6] });

    // ---------------------------------------------------------- cistern with a stone well-head
    b.group({ at: [-12, 0, 9] }, () => {
      b.box(6, 0.5, 3.6, tufaB);
      b.box(5.2, 0.08, 2.8, P.water, { at: [0, 0.45, 0], mat: 'glass', jitter: false });
      b.cyl(0.65, 1.0, tufaC, { at: [3.6, 0, 0], segs: 8 });
      b.cyl(0.42, 0.04, P.windowDark, { at: [3.6, 1.0, 0], segs: 8 });
      // a channel bringing rainwater from the courtyard roofs
      b.box(0.5, 0.2, 7, tufaB, { at: [4.2, 0, -5.2], rotY: 0.55 });
    });

    // ---------------------------------------------------------- a storehouse and an altar
    range(b, 13, -9, 6, 9, 3.4, { ridge: 'z', doors: ['-x'] });
    for (const [x, z] of [[12, 1.2], [14, 1.6], [13, 3.2]] as const) b.cyl(0.4, 1.1, P.terracotta, { at: [x, 0, z], rTop: 0.25, segs: 7 }); // storage jars
    b.box(2.0, 1.1, 1.2, tufaC, { at: [6, 0, 8] });
    b.box(2.3, 0.2, 1.5, tufaB, { at: [6, 1.1, 8] });

    // ---------------------------------------------------------- colliders
    lineColliders(b, WALL, WT);
    for (const s of [-1, 1]) b.collider(4, 4.4, { at: [s * 4.6, 0, 18.6] });
    b.collider(18, 5.2, { at: [-2, 0, -14] });
    b.collider(5, 7.8, { at: [-8.5, 0, -7.5] });
    b.collider(5, 7.8, { at: [4.5, 0, -7.5] });
    for (const s of [-1, 1]) b.collider(2.6, 0.6, { at: [-2 + s * 2.7, 0, -3.6] });
    b.collider(6, 3.6, { at: [-12, 0, 9] });
    b.collider(6, 9, { at: [13, 0, -9] });
    b.collider(2.2, 1.4, { at: [6, 0, 8] });
  },
};
