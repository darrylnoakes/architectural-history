import { P, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { lin, type Pt } from './shared';

/** Half side of the square enclosure, and its centre. */
const E = 13;
const ZC = -1;
const STAKE = mix(P.oak, P.oakSilver, 0.25);
const BONE = 0xe8e2cf;
const IRON = mix(P.iron, P.earth, 0.3);

/** A palisade of pointed stakes, drawn as one extruded outline: len long, centred on `at`. */
function palisade(b: Builder, len: number, at: Vec3, rotY: number) {
  const n = Math.max(2, Math.round(len / 0.5));
  const p = len / n;
  const pts: Pt[] = [[-len / 2, 0]];
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + i * p;
    pts.push([x, 2.6], [x + p / 2, 3.0]);
  }
  pts.push([len / 2, 2.6], [len / 2, 0]);
  b.extrude(pts, 0.24, STAKE, { at, rotY });
}

/** A shield (an oval board with a boss) hanging flat against something facing `rotY`. */
function shield(b: Builder, at: Vec3, rotY: number, color: number) {
  b.group({ at, rotY }, () => {
    b.cyl(0.32, 0.05, color, { rot: [Math.PI / 2, 0, 0], segs: 8, jitter: false });
    b.box(0.12, 0.3, 0.1, IRON, { at: [0, -0.15, 0.05], jitter: false });
  });
}

export const gaulishSanctuary: BuildingDef = {
  id: 'gaulish-sanctuary',
  name: 'Gaulish sanctuary',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 300 BC',
  summary:
    'The holy place of the tribe, two and a half centuries before Rome: a square of ground closed by a palisade and a ditch, entered by a single gate hung with captured weapons and skulls. ' +
    'In the middle a small timber shrine covers a great pit. As the excavators read the finds, old oxen were sacrificed and left in it to rot, an offering to the gods below, and their bones were later laid in the ditch. ' +
    'Weapons taken in battle were shown on a trophy and on the gate, then bent, broken and thrown into the ditch too. Nothing here is stone: the sacred is a place marked out, not yet a building.',
  materials: ['oak posts and stakes', 'wattle and daub', 'thatch', 'earth'],
  lookFor: [
    { label: 'Palisade and ditch', note: 'A square enclosure that set the gods’ ground apart from the world outside; the ditch inside the fence received the offerings.', at: [-E + 1.3, 0.6, ZC + 4] },
    { label: 'Gate with trophies', note: 'The one entrance, a timber porch hung with shields, swords and the skulls of beasts and perhaps of enemies.', at: [0, 4.2, ZC + E + 0.4] },
    { label: 'Timber shrine', note: 'A small thatched building raised over the central pit, open on the side facing the gate.', at: [0, 4.0, ZC + 2.9] },
    { label: 'Sacrificial pits', note: 'A large oval pit with smaller ones round it, where the offerings were left.', at: [0, 0.4, ZC + 1.2] },
    { label: 'Trophy of arms', note: 'A post dressed in the helmet, shield and weapons of a defeated warrior, as the Romans also later did.', at: [5.0, 3.3, ZC + 4.5] },
  ],
  modelledOn:
    'The sanctuary of Gournay-sur-Aronde (Oise), excavated by Jean-Louis Brunaux from the late 1970s: the square ditched enclosure with its gate, the central pits under a timber building, the oxen and the thousands of broken weapons from the ditch. The size is reduced, and how the trophy and the gate were dressed is a reconstruction.',
  build(b) {
    const g = mix(P.earth, P.grassDry, 0.4);
    b.box(32, 0.03, 50, P.grass, { at: [0, 0, 0], jitter: false });
    b.box(2 * E, 0.05, 2 * E, g, { at: [0, 0, ZC], jitter: false });
    // the ditch just inside the palisade, with bones and broken iron in it
    const ditch = mix(P.soil, P.earth, 0.35);
    const dw = 1.6;
    for (const [w, d, x, z] of [
      [2 * E - 1, dw, 0, ZC + E - 1.3], [2 * E - 1, dw, 0, ZC - E + 1.3], [dw, 2 * E - 4.2, E - 1.3, ZC], [dw, 2 * E - 4.2, -E + 1.3, ZC],
    ] as const) {
      if (z > ZC + E - 2) {
        for (const s of [-1, 1]) b.box((w - 3.2) / 2, 0.07, d, ditch, { at: [(s * (w + 3.2)) / 4, 0, z], jitter: false });
      } else b.box(w, 0.07, d, ditch, { at: [x, 0, z], jitter: false });
    }
    for (let i = 0; i < 26; i++) {
      const side = i % 4;
      const u = b.range(-E + 2, E - 2);
      const x = side === 0 ? u : side === 1 ? u : side === 2 ? E - 1.3 + b.range(-0.4, 0.4) : -E + 1.3 + b.range(-0.4, 0.4);
      const z = side === 0 ? ZC - E + 1.3 + b.range(-0.4, 0.4) : side === 1 ? ZC + E - 1.3 + b.range(-0.4, 0.4) : ZC + u * 0.8;
      if (side === 1 && Math.abs(x) < 2) continue;
      if (i % 3 === 0) b.box(0.08, 0.04, 0.7, IRON, { at: [x, 0.07, z], rotY: b.range(0, 3), jitter: false });
      else b.box(0.12, 0.08, 0.4, BONE, { at: [x, 0.07, z], rotY: b.range(0, 3), jitter: false });
    }
    // the palisade, with a gap for the gate
    palisade(b, 2 * E, [0, 0, ZC - E], 0);
    palisade(b, 2 * E, [E, 0, ZC], Math.PI / 2);
    palisade(b, 2 * E, [-E, 0, ZC], Math.PI / 2);
    for (const s of [-1, 1]) palisade(b, E - 1.6, [(s * (E + 1.6)) / 2, 0, ZC + E], 0);
    // the gate: a porch of four posts under a thatched roof, hung with trophies
    const gz = ZC + E;
    for (const x of [-1.6, 1.6]) for (const z of [gz, gz - 2.4]) b.box(0.3, 3.8, 0.3, P.oak, { at: [x, 0, z] });
    for (const z of [gz, gz - 2.4]) b.box(3.8, 0.35, 0.35, P.oak, { at: [0, 3.8, z] });
    b.gable(3.8, 3.2, 1.8, P.thatch, { at: [0, 4.15, gz - 1.2], overhang: 0.4, thick: 0.35, wall: P.wattle });
    for (const x of [-1.0, 0, 1.0]) {
      b.blob(0.2, BONE, { at: [x, 3.8 - 0.1, gz + 0.3], stretch: [1, 0.8, 1.3], detail: 0 });
      b.cone(0.05, 0.4, BONE, { at: [x - 0.16, 3.85, gz + 0.3], rot: [0, 0, 0.9], segs: 4 });
      b.cone(0.05, 0.4, BONE, { at: [x + 0.16, 3.85, gz + 0.3], rot: [0, 0, -0.9], segs: 4 });
    }
    for (const s of [-1, 1]) {
      shield(b, [s * 1.6, 2.4, gz + 0.2], 0, s > 0 ? tint(P.oak, 0.15) : P.wattle);
      b.box(0.08, 1.1, 0.04, IRON, { at: [s * 1.6, 0.9, gz + 0.2], rot: [0, 0, s * 0.3], jitter: false });
    }
    // the shrine over the pits
    const sz = ZC + 0.6;
    b.cyl(1.7, 0.08, ditch, { at: [0, 0, sz + 0.6], segs: 10, jitter: false });
    for (let k = 0; k < 9; k++) {
      const t = (k / 9) * Math.PI * 2;
      b.cyl(0.4, 0.08, ditch, { at: [2.3 * Math.cos(t), 0, sz + 0.6 + 2.0 * Math.sin(t)], segs: 6, jitter: false });
    }
    b.blob(0.5, BONE, { at: [0.4, 0.05, sz + 0.5], stretch: [1.4, 0.4, 0.8], detail: 0 });
    const S = 6.2;
    for (const x of [-S / 2, 0, S / 2]) for (const z of [-S / 2, 0, S / 2]) {
      if (x === 0 && z === 0) continue;
      b.box(0.3, 2.7, 0.3, P.oak, { at: [x, 0, sz + z] });
    }
    b.box(S, 2.0, 0.18, P.daub, { at: [0, 0.7, sz - S / 2] });
    for (const s of [-1, 1]) b.box(0.18, 2.0, S, P.daub, { at: [(s * S) / 2, 0.7, sz] });
    b.hip(S + 0.3, S + 0.3, 3.6, P.thatch, { at: [0, 2.7, sz], ridge: 1.0, overhang: 0.6 });
    // the trophy of arms
    const tp: Vec3 = [5.0, 0, ZC + 4.5];
    b.box(0.22, 3.3, 0.22, P.oak, { at: tp });
    b.box(1.9, 0.18, 0.18, P.oak, { at: [tp[0], 2.5, tp[2]] });
    b.dome(0.3, P.bronze, { at: [tp[0], 3.3, tp[2]], segs: 8 });
    b.box(0.7, 0.8, 0.3, P.bronze, { at: [tp[0], 1.75, tp[2]] });
    shield(b, [tp[0], 1.9, tp[2] + 0.3], 0, tint(P.oak, 0.2));
    for (const s of [-1, 1]) b.box(0.06, 1.0, 0.06, IRON, { at: [tp[0] + s * 0.85, 1.6, tp[2]], jitter: false });
    b.beam([tp[0] - 1.2, 0, tp[2] - 0.3], [tp[0] + 0.4, 3.9, tp[2] - 0.2], 0.06, 0.06, P.oak);
    // trees beyond the fence
    for (const [x, z, h] of [[-11, -22, 9], [10, -24, 10], [-3, -27, 8], [14.5, -18.5, 6], [-14.5, -18, 7]] as const) b.tree(h, { at: [x, 0, z], kind: 'round' });
    for (const x of lin(3, -6, 6)) b.tree(4, { at: [x, 0, -21], kind: 'bush' });
    b.collider(2 * E, 0.4, { at: [0, 0, ZC - E] });
    b.collider(0.4, 2 * E, { at: [E, 0, ZC] });
    b.collider(0.4, 2 * E, { at: [-E, 0, ZC] });
    for (const s of [-1, 1]) b.collider(E - 1.6, 0.4, { at: [(s * (E + 1.6)) / 2, 0, ZC + E] });
    b.collider(S, S, { at: [0, 0, sz] });
  },
};
