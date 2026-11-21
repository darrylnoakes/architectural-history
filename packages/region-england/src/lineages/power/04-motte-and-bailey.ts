import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BAILEY_LEFT, BAILEY_RIGHT, GATE, MOTTE, arcPts, arch, bank, lineColliders, motte, motteY, palisade, strip } from './shared';

type XZ = [number, number];

/** Extend a bailey line from where it meets the motte slope up to the summit palisade. */
export function toSummit(p: XZ, r = MOTTE.rTop - 0.4): XZ {
  const a = Math.atan2(p[1] - MOTTE.z, p[0] - MOTTE.x);
  return [MOTTE.x + r * Math.cos(a), MOTTE.z + r * Math.sin(a)];
}

/** Offset a bailey line outwards (scaled about a point near the bailey centre) for the outer ditch. */
export function ditchLine(pts: XZ[], k = 1.06): XZ[] {
  return pts.map(([x, z]) => [x * k, 2 + (z - 2) * k]);
}

/** The direction the flying bridge climbs the motte: from the bailey towards the summit. */
export const BRIDGE_ANG = Math.PI / 4;

/** A timber flying bridge up the motte side, on trestles. */
function flyingBridge(b: Builder) {
  const top: XZ = [MOTTE.x + (MOTTE.rTop - 0.2) * Math.cos(BRIDGE_ANG), MOTTE.z + (MOTTE.rTop - 0.2) * Math.sin(BRIDGE_ANG)];
  const run = 9.6;
  const foot: XZ = [top[0] + run * Math.cos(BRIDGE_ANG), top[1] + run * Math.sin(BRIDGE_ANG)];
  const len = Math.hypot(run, MOTTE.h);
  const pitch = Math.atan2(MOTTE.h, run);
  const rotY = Math.atan2(-(top[0] - foot[0]), -(top[1] - foot[1])) + Math.PI;
  const mid: [number, number, number] = [(top[0] + foot[0]) / 2, MOTTE.h / 2, (top[1] + foot[1]) / 2];
  b.group({ at: mid, rotY }, () => {
    b.box(2.2, 0.2, len, P.oak, { rot: [-pitch, 0, 0] });
    for (const s of [-1, 1]) {
      b.box(0.12, 0.12, len, P.oakDark, { at: [s * 1.05, 1.0 * Math.cos(pitch), 0], rot: [-pitch, 0, 0] });
      // trestle legs down to the slope or ground
      for (const u of [-0.32, 0.05, 0.38]) {
        const z = u * run;
        const y = u * MOTTE.h;
        const legH = MOTTE.h / 2 + y;
        b.box(0.22, legH, 0.22, P.oakDark, { at: [s * 0.95, -MOTTE.h / 2, z] });
        b.box(0.08, Math.cos(pitch) * 1.05, 0.08, P.oakDark, { at: [s * 1.05, y + 0.05, z] });
      }
    }
  });
}

/** Timber tower on the motte top: a planked box with a jettied fighting gallery and shingled roof. */
function timberTower(b: Builder) {
  const plank = mix(P.oak, P.oakSilver, 0.3);
  b.group({ at: [MOTTE.x, MOTTE.h, MOTTE.z], rotY: 0.08 }, () => {
    const S = 5.2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.4, 6.4, 0.4, P.oakDark, { at: [sx * (S / 2), 0, sz * (S / 2)] });
    b.box(S, 6, S, plank);
    b.frame(S, 6, P.oakDark, { at: [0, 0, S / 2], facing: '+z', studs: 3, rails: 1 });
    b.frame(S, 6, P.oakDark, { at: [0, 0, -S / 2], facing: '-z', studs: 3, rails: 1 });
    b.frame(S, 6, P.oakDark, { at: [S / 2, 0, 0], facing: '+x', studs: 3, rails: 1 });
    b.frame(S, 6, P.oakDark, { at: [-S / 2, 0, 0], facing: '-x', studs: 3, rails: 1 });
    b.panel(1.1, 2.0, P.oakDark, { at: [0, 0, S / 2 + 0.05], facing: '+z' });
    // jettied fighting gallery with arrow slits
    const G = S + 1.4;
    b.box(G, 0.3, G, P.oakDark, { at: [0, 6, 0] });
    b.box(G, 2.1, G, tint(plank, -0.04), { at: [0, 6.3, 0] });
    for (const f of ['+z', '-z', '+x', '-x'] as const) {
      const off = G / 2;
      for (const u of [-1.8, 0, 1.8]) {
        const at: [number, number, number] =
          f === '+z' ? [u, 7, off] : f === '-z' ? [u, 7, -off] : f === '+x' ? [off, 7, u] : [-off, 7, u];
        b.panel(0.25, 0.9, P.black, { at, facing: f });
      }
    }
    b.pyramid(G + 0.6, G + 0.6, 3.4, P.shingle, { at: [0, 8.4, 0] });
    b.cyl(0.06, 1.4, P.oakDark, { at: [0, 11.6, 0], segs: 4 });
    b.box(0.9, 0.55, 0.04, P.doorRed, { at: [0.45, 12.35, 0] }); // pennant
  });
}

export const motteAndBailey: BuildingDef = {
  id: 'motte-and-bailey',
  name: 'Motte-and-bailey castle',
  style: 'Norman',
  date: 'c. 1070',
  summary:
    'Within two years of the Conquest a Norman lord has forced the townspeople to heap up an earth mound, the motte, and fence a yard beside it, the bailey. ' +
    'It could be built in weeks from earth and timber, and hundreds went up across England to hold down a hostile country. ' +
    'The lord lives in a hall in the bailey; in an attack everyone retreats up the bridge to the tower on the motte. The Saxon hall has gone, and power now looks down on the town rather than out across it.',
  materials: ['rammed earth and turf', 'oak palisades and towers', 'oak shingles', 'thatch'],
  lookFor: [
    { label: 'Motte', note: 'A steep man-made mound of earth with a flat top, the last refuge of the castle.', at: [MOTTE.x + 8, 3.4, MOTTE.z + 3] },
    { label: 'Timber tower', note: 'The first keep: a timber tower with an overhanging fighting gallery, standing inside its own palisade on the motte top.', at: [MOTTE.x, 16, MOTTE.z + 3.3] },
    { label: 'Flying bridge', note: 'A steep timber bridge on trestles, the only way up the motte; it could be broken down in an attack.', at: [-1.5, 3.6, -1.5] },
    { label: 'Bailey palisade', note: 'An oak fence on an earth bank, with a ditch outside, enclosing the yard where the household lived.', at: [19.5, 4.4, 0] },
    { label: 'Gatehouse and bridge', note: 'The bailey is entered over a timber bridge across the ditch and through a gate tower.', at: [GATE[0], 8.6, GATE[1] + 2.2] },
  ],
  influences: ['norman-romanesque'],
  build(b) {
    motte(b, { color: tint(P.turf, -0.02), ditch: 'dry' });
    const ditch = mix(P.soil, P.earth, 0.4);

    // ----------------------------------------------------------- the bailey: bank, palisade, ditch
    const rightLine: XZ[] = [toSummit(BAILEY_RIGHT[0]), ...BAILEY_RIGHT];
    const leftLine: XZ[] = [...BAILEY_LEFT, toSummit(BAILEY_LEFT[BAILEY_LEFT.length - 1])];
    const bankH = 1.0;
    bank(b, BAILEY_RIGHT.slice(1), 3.2, bankH, tint(P.turf, 0.03));
    bank(b, BAILEY_LEFT.slice(0, -1), 3.2, bankH, tint(P.turf, 0.03));
    const base = (x: number, z: number) => Math.max(motteY(x, z), bankH - 0.1);
    palisade(b, rightLine, 3, tint(P.oak, 0.05), { base, rail: 2 });
    palisade(b, leftLine, 3, tint(P.oak, 0.05), { base, rail: 2 });
    strip(b, ditchLine(BAILEY_RIGHT.slice(1)), 1.5, 0.03, ditch);
    strip(b, ditchLine(BAILEY_LEFT.slice(0, -1)), 1.5, 0.03, ditch);

    // ----------------------------------------------------------- the motte top
    const ringR = MOTTE.rTop - 0.4;
    palisade(b, arcPts(MOTTE.x, MOTTE.z, ringR, BRIDGE_ANG + 0.2, BRIDGE_ANG + Math.PI * 2 - 0.2, 26), 2.4, tint(P.oak, 0.05), {
      base: () => MOTTE.h,
      rail: 1.6,
    });
    timberTower(b);
    flyingBridge(b);

    // ----------------------------------------------------------- gatehouse and bridge
    b.group({ at: [GATE[0], 0, GATE[1]] }, () => {
      const W = 5.6;
      b.sym((s) => {
        b.box(1.2, 5.2, 4, mix(P.oak, P.oakSilver, 0.3), { at: [s * (W / 2 - 0.6), 0, -0.6] });
        for (const z of [1.3, -2.5]) b.box(0.4, 5.4, 0.4, P.oakDark, { at: [s * (W / 2 - 0.2), 0, z] });
      });
      b.box(W, 3, 4.2, mix(P.oak, P.oakSilver, 0.3), { at: [0, 5.2, -0.6] });
      b.frame(W, 3, P.oakDark, { at: [0, 5.2, 1.5], facing: '+z', studs: 3, rails: 0 });
      b.panel(0.25, 0.9, P.black, { at: [-1.2, 6.2, 1.58], facing: '+z' });
      b.panel(0.25, 0.9, P.black, { at: [1.2, 6.2, 1.58], facing: '+z' });
      b.gable(W + 0.6, 4.8, 2.4, P.shingle, { at: [0, 8.2, -0.6], ridge: 'x', overhang: 0.2 });
      b.box(W, 0.3, 4.2, P.oakDark, { at: [0, 3.4, -0.6] });
      // gates folded back inside
      b.sym((s) => b.box(0.15, 3.2, 1.6, P.oakDark, { at: [s * 1.5, 0, -2.6], rotY: s * 0.2 }));
      // bridge across the ditch
      b.box(3.2, 0.25, 2.6, P.oak, { at: [0, 0.35, 1.7] });
      b.sym((s) => {
        b.box(0.12, 1.0, 2.6, P.oakDark, { at: [s * 1.5, 0.6, 1.7] });
        b.box(0.24, 0.6, 0.24, P.oakDark, { at: [s * 1.4, 0, 1.0] });
        b.box(0.24, 0.6, 0.24, P.oakDark, { at: [s * 1.4, 0, 2.6] });
      });
    });
    // the front ditch, with the bridge over it
    strip(b, [[-12.6, 20.6], [-0.8, 20.6]], 1.7, 0.03, ditch);
    strip(b, [[3.8, 20.6], [14, 20.6]], 1.7, 0.03, ditch);

    // ----------------------------------------------------------- buildings in the bailey
    const plank = mix(P.oak, P.oakSilver, 0.3);
    // the lord's hall: aisled, timber-framed, thatched
    b.group({ at: [9.5, 0, -11.5] }, () => {
      b.box(15, 3.4, 7.6, plank);
      b.frame(15, 3.4, P.oakDark, { at: [0, 0, 3.8], facing: '+z', studs: 7, rails: 1 });
      b.frame(15, 3.4, P.oakDark, { at: [0, 0, -3.8], facing: '-z', studs: 7, rails: 1 });
      b.gable(15, 7.6, 4.6, P.thatch, { at: [0, 3.4, 0], overhang: 0.5, thick: 0.4, wall: plank });
      b.panel(1.4, 2.3, P.oakDark, { at: [-3.5, 0, 3.85], facing: '+z' });
      b.cone(0.5, 0.9, P.thatchOld, { at: [1.5, 7.6, 0], segs: 4 }); // smoke louvre
    });
    // stables along the right palisade
    b.group({ at: [15.3, 0, 4.5] }, () => {
      b.box(4.2, 2.6, 12, plank);
      b.shed(5, 12.6, 1.3, P.thatchOld, { at: [0, 2.6, 0], high: '+x' });
      for (const z of [-4, 0, 4]) b.panel(1.6, 2.0, P.oakDark, { at: [-2.1, 0, z], facing: '-x' });
    });
    // timber chapel with a bellcote
    b.group({ at: [-11, 0, 12] }, () => {
      b.box(4.4, 3.2, 7, plank, { rotY: 0 });
      b.gable(4.4, 7, 2.6, P.shingle, { at: [0, 3.2, 0], ridge: 'z', overhang: 0.3, wall: plank });
      b.box(0.9, 1.2, 0.9, P.oak, { at: [0, 5.6, 3] });
      b.pyramid(1.2, 1.2, 0.9, P.shingle, { at: [0, 6.8, 3] });
      arch(b, 1.1, 2.1, P.oakDark, { at: [0, 0, 3.5], facing: '+z', shape: 'round' });
    });
    // well, cart, woodpile
    b.cyl(0.8, 0.8, P.rubble, { at: [5, 0, 6], segs: 8 });
    b.box(1.9, 0.12, 0.12, P.oakDark, { at: [5, 1.7, 6] });
    b.sym((s) => b.box(0.12, 1.8, 0.12, P.oakDark, { at: [5 + s * 0.9, 0, 6] }));
    for (let i = 0; i < 3; i++) b.log(0.16, 2.4, P.bark, { at: [12, i * 0.28, 12 + i * 0.1], axis: 'z', segs: 6 });

    // ----------------------------------------------------------- colliders
    lineColliders(b, BAILEY_RIGHT.slice(1), 1.6);
    lineColliders(b, BAILEY_LEFT.slice(0, -1), 1.6);
    b.sym((s) => b.collider(1.4, 4.2, { at: [GATE[0] + s * 2.2, 0, GATE[1] - 0.6] }));
    b.collider(6.6, 6.6, { at: [MOTTE.x, 0, MOTTE.z] });
    b.collider(15, 7.6, { at: [9.5, 0, -11.5] });
    b.collider(4.2, 12, { at: [15.3, 0, 4.5] });
    b.collider(4.4, 7, { at: [-11, 0, 12] });
    b.collider(1.7, 1.7, { at: [5, 0, 6] });
  },
};
