import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, gateMass, inwardOf, prismX, road, run, slab, voussoirs, type XY } from './shared';

// ------------------------------------------------------------------ the gate block (kept in 1870)

/** The rusticated gate: front face at z = GATE.front, back face at GATE.back, centred on x = 0. */
export const GATE = { w: 12, front: 0.6, back: -6.4, h: 8.8, ow: 4.0, spring: 4.2 };

/**
 * The gate building in the manner of Sanmicheli: banded rustication, paired rusticated Doric pilasters,
 * a triglyph frieze and an attic with the prince’s arms on the field side; a plainer front to the town.
 */
export function gateBlock(b: Builder, stone: number): void {
  const { w, front, back, h, ow, spring } = GATE;
  const d = front - back;
  const zc = (front + back) / 2;
  const groove = tint(stone, -0.16);
  const rust = tint(stone, 0.03);

  gateMass(b, w, h, d, stone, { at: [0, 0, zc], xs: [0], openW: ow, openH: spring + ow / 2 });
  b.box(w + 0.4, 0.6, d + 0.4, tint(stone, -0.06), { at: [0, 0, zc] });
  b.vault(ow, d - 0.05, tint(stone, -0.22), { at: [0, spring, zc], segs: 8 });

  // banded rustication: courses of stone standing proud, with deep grooves between them
  const band = (x0: number, x1: number, y0: number, y1: number, z: number, f: 1 | -1) => {
    for (let y = y0; y < y1 - 0.1; y += 0.62) {
      const hh = Math.min(0.54, y1 - y - 0.04);
      b.box(x1 - x0, hh, 0.16, rust, { at: [(x0 + x1) / 2, y, z + f * 0.08], jitter: false });
    }
  };
  const top = 7.0; // where the rustication stops and the entablature begins
  b.sym((s) => {
    const lo = s > 0 ? ow / 2 : -w / 2;
    const hi = s > 0 ? w / 2 : -ow / 2;
    band(lo, hi, 0.6, spring, front, 1);
    band(s > 0 ? 3.1 : -w / 2, s > 0 ? w / 2 : -3.1, spring, top, front, 1);
  });
  // rusticated voussoirs radiating round the arch, the keystone running up into the frieze
  voussoirs(b, ow, spring, 1.15, rust, { at: [0, 0, front], n: 9, proud: 0.26, vary: 0.05, keyExtra: 0.7 });
  // paired Doric pilasters, banded: alternate blocks project further
  for (const x of [-5.4, -3.75, 3.75, 5.4]) {
    for (let i = 0, y = 0.6; y < top - 0.1; i++, y += 0.62) {
      const wide = i % 2 === 0;
      b.box(wide ? 1.15 : 0.85, 0.54, wide ? 0.62 : 0.48, wide ? rust : stone, { at: [x, y, front + 0.24], jitter: false });
    }
    b.box(1.1, 0.3, 0.6, rust, { at: [x, top - 0.05, front + 0.26] }); // capital
  }
  // entablature: architrave, triglyph frieze, cornice
  b.box(w + 0.2, 0.45, 0.55, stone, { at: [0, top + 0.2, front + 0.22] });
  b.box(w + 0.2, 0.75, 0.45, tint(stone, 0.02), { at: [0, top + 0.65, front + 0.18] });
  for (let x = -w / 2 + 0.55; x < w / 2; x += 1.1) b.box(0.38, 0.7, 0.1, groove, { at: [x, top + 0.68, front + 0.42], jitter: false });
  b.box(w + 0.9, 0.42, 1.1, rust, { at: [0, top + 1.4, front - 0.05] });
  // attic with an inscription and the arms of the prince who paid for it
  b.box(6.6, 2.0, 1.2, stone, { at: [0, h, front - 0.6] });
  b.box(7.0, 0.3, 1.4, rust, { at: [0, h + 2.0, front - 0.6] });
  b.panel(4.2, 0.9, tint(stone, 0.06), { at: [-0.2, h + 0.35, front], depth: 0.05 });
  for (const y of [h + 0.55, h + 0.85]) b.panel(3.4, 0.06, groove, { at: [-0.2, y, front + 0.05], depth: 0.02 });
  b.panel(1.1, 1.4, tint(stone, 0.08), { at: [0, h + 2.25, front - 0.4], depth: 0.25, shape: 'round' });
  b.blob(0.35, tint(stone, 0.06), { at: [0, h + 3.8, front - 0.3], stretch: [1, 0.8, 0.7] });
  // a parapet round the flat roof
  b.box(w, 0.9, 0.4, stone, { at: [0, h, back + 0.2] });
  b.sym((s) => b.box(0.4, 0.9, d, stone, { at: [s * (w / 2 - 0.2), h, zc] }));
  b.box(w - 0.8, 0.05, d - 0.6, tint(stone, -0.12), { at: [0, h, zc], jitter: false });

  // the town front: smooth ashlar, a plain arch, Doric pilasters and a cornice
  voussoirs(b, ow, spring, 0.8, rust, { at: [0, 0, back], facing: '-z', n: 9, proud: 0.12, vary: 0.03 });
  for (const x of [-4.8, 4.8]) {
    b.box(0.9, top - 0.6, 0.25, rust, { at: [x, 0.6, back - 0.12] });
    b.box(1.1, 0.3, 0.35, rust, { at: [x, top - 0.1, back - 0.15] });
  }
  for (const y of [1.8, 3.0]) b.sym((s) => b.panel(1.6, 0.05, groove, { at: [s * 3.1, y, back], facing: '-z', depth: 0.02 }));
  b.box(w + 0.6, 0.4, 0.7, rust, { at: [0, top + 0.6, back - 0.1] });
  // the sides: the same rustication, so the gate is finished all round
  b.sym((s) => {
    for (let y = 0.6; y < top - 0.1; y += 0.62) b.box(0.16, 0.54, d - 0.6, rust, { at: [s * (w / 2 + 0.08), y, zc], jitter: false });
    b.box(0.5, 0.42, d, rust, { at: [s * (w / 2 + 0.05), top + 1.4, zc] });
  });
  // the gate leaves, folded back
  b.sym((s) => b.box(0.16, spring + 1.4, ow / 2, P.oakDark, { at: [s * (ow / 2 - 0.1), 0, back + ow / 4 + 0.6] }));
}

// ------------------------------------------------------------------ the ramparts

const CF = -0.6; // the foot of the curtain’s scarp
const FX = 8.6; // the flanks of the two bastions
const SH = 3.4; // the shoulder, where flank meets face
const FACE_END: XY = [HALF, 7.2]; // the face runs off the plot towards the salient
// scarp, magistral cordon, then a thick rounded parapet of earth faced with brick
const SECTION: XY[] = [
  [0, 0],
  [1.0, 6.0],
  [1.05, 7.3],
  [1.9, 7.9],
  [3.9, 7.55],
  [4.5, 6.3],
  [4.5, 0],
];
const TOP = 6.2; // the terreplein behind the parapet

export const bastionGate: BuildingDef = {
  id: 'bastion-gate',
  name: 'Bastioned rampart and gate',
  style: 'Renaissance military',
  date: 'c. 1540',
  summary:
    'The cannon that the French brought into Italy in 1494 could breach a tall medieval wall in hours. Italian engineers answered with ramparts that are low and immensely thick, earth faced with brick and sloped to deflect shot, ' +
    'and with angled bastions whose flanks let guns sweep the ditch and the face of the next bastion, so that no ground at the foot of the wall was hidden from fire. ' +
    'This bastioned system, the trace italienne, was taken up by every power in Europe. The gate itself is architecture: a rusticated Doric front, strong and severe, the order thought right for a fortress.',
  materials: ['brick facing on an earth core', 'travertine cordon', 'stone (tufa and marble) for the gate', 'oak gates', 'bronze cannon'],
  modelledOn: 'Michele Sanmicheli’s Porta Nuova, Verona (1530s, finished 1540), with bastions like Antonio da Sangallo the Younger’s Bastione Ardeatino in Rome (1537 to 1542)',
  influences: ['bastion-export'],
  lookFor: [
    { label: 'Angled bastion', note: 'An arrowhead of rampart pushed out from the wall; its angled faces leave no blind spot and glance off shot.', at: [12.4, 8.4, 5.6] },
    { label: 'Flank with gunports', note: 'The short side of the bastion, set at right angles to the wall, where hidden guns swept the ditch in front of the gate.', at: [FX - 0.4, 3.0, 1.6] },
    { label: 'Scarp and cordon', note: 'The sloping brick face of the rampart, topped by a rounded stone moulding (the cordon) under a thick parapet of earth.', at: [-6.8, 6.3, -1.1] },
    { label: 'Rusticated gate', note: 'Courses of stone left boldly projecting, with paired Doric pilasters: Sanmicheli’s fortress style.', at: [-4.6, 4.5, GATE.front + 0.7] },
    { label: 'Sentry box', note: 'A little stone turret (garitta) at the angle of the bastion, for a sentry to watch the ditch.', at: [FX + 0.9, 10.2, SH + 0.6] },
  ],
  build(b) {
    const brick = tint(mix(P.brickRed, P.brickBuff, 0.25), b.range(-0.03, 0.02));
    const trav = P.travertine;
    const grass = mix(P.turf, P.grassDry, 0.45);
    const gateStone = mix(P.travertine, P.tufa, 0.35);

    // ---------------------------------------------------------------- the ditch and the bridge over it
    road(b, 5.4, mix(P.gravel, P.cobble, 0.4), { z0: -8, z1: GATE.back });
    slab(b, [[-HALF, CF + 0.2], [HALF, CF + 0.2], [HALF, 8], [-HALF, 8]], 0, 0.03, mix(P.turf, P.hedge, 0.5));
    // counterscarp: a low brick wall on the far side of the ditch
    b.box(HALF * 2, 0.9, 0.6, brick, { at: [0, 0, 7.6] });
    b.box(HALF * 2, 0.15, 0.7, trav, { at: [0, 0.9, 7.6] });
    // the bridge: masonry piers and a timber drawbridge span next to the gate
    b.box(4.6, 0.45, 8 - 3.2, mix(P.cobble, P.gravel, 0.3), { at: [0, 0, (8 + 3.2) / 2] });
    b.sym((s) => {
      b.box(0.45, 1.1, 8 - 3.2, brick, { at: [s * 2.5, 0, (8 + 3.2) / 2] });
      b.box(0.55, 0.12, 8 - 3.2, trav, { at: [s * 2.5, 1.1, (8 + 3.2) / 2] });
      // the lifting beams of the drawbridge
      b.beam([s * 1.9, 0.5, 3.0], [s * 1.9, 5.4, GATE.front + 0.25], 0.07, 0.07, P.iron);
    });
    b.box(4.2, 0.3, 3.2 - GATE.front, P.oak, { at: [0, 0.15, (3.2 + GATE.front) / 2] });
    for (let z = GATE.front + 0.3; z < 3.2; z += 0.5) b.box(4.2, 0.02, 0.05, P.oakDark, { at: [0, 0.45, z], jitter: false });

    // ---------------------------------------------------------------- the ramparts either side
    b.sym((s) => {
      const X = (p: XY): XY => [s * p[0], p[1]];
      const inside: XY = X([12, -4]);
      // curtain from the gate to the flank, the flank, and the face running off to the salient
      const runs: [XY, XY][] = [
        [X([GATE.w / 2 - 0.2, CF]), X([FX, CF])],
        [X([FX, CF]), X([FX, SH])],
        [X([FX, SH]), X(FACE_END)],
      ];
      for (const [p, q] of runs) {
        const n = inwardOf(p, q, inside);
        const clipQ = Math.abs(q[0]) === HALF;
        run(b, p, q, n, SECTION, brick, { clipQ });
        // the travertine cordon at the top of the scarp
        const c0: [number, number, number] = [p[0] + n[0] * 1.0, 5.9, p[1] + n[1] * 1.0];
        const c1: [number, number, number] = [q[0] + n[0] * 1.0, 5.9, q[1] + n[1] * 1.0];
        const c1x = clipQ ? q[0] - s * 0.25 : c1[0] - n[0] * 0.15;
        const c1z = clipQ ? c1[2] - n[1] * 0.15 + (c1x - (c1[0] - n[0] * 0.15)) * ((q[1] - p[1]) / (q[0] - p[0])) : c1[2] - n[1] * 0.15;
        b.beam([c0[0] - n[0] * 0.15, c0[1] + 0.2, c0[2] - n[1] * 0.15], [c1x, c1[1] + 0.2, c1z], 0.45, 0.45, trav);
        // the earth parapet top in turf
        run(b, p, q, n, [[1.6, 7.92], [1.9, 7.93], [3.9, 7.58], [4.3, 6.9]], grass, { clipQ });
      }
      // the terreplein: one solid fill behind the parapets
      slab(b, [X([GATE.w / 2, -1.5]), X([FX + 1, -1.5]), X([FX + 1, SH - 0.4]), X([HALF, 6.0]), X([HALF, -6.0]), X([GATE.w / 2, -6.0])], 0, TOP, grass);
      // inner slope down to the town
      prismX(b, s > 0 ? GATE.w / 2 : -HALF, s > 0 ? HALF : -GATE.w / 2, [[-6.0, TOP], [-8, 0], [-6.0, 0]], tint(grass, -0.04));
      // casemate gunports low in the flank, aimed across the front of the gate
      for (const z of [0.6, 2.2]) {
        b.group({ at: [s * (FX + 0.42), 2.2, z], rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 }, () => {
          b.panel(1.3, 1.1, trav, { shape: 'round', depth: 0.1 });
          b.panel(0.9, 0.85, P.black, { at: [0, 0.05, 0], shape: 'round', depth: 0.14 });
        });
      }
      // a sentry box (garitta) at the shoulder
      b.group({ at: [s * (FX + 1.0), 7.0, SH + 0.4] }, () => {
        b.cyl(0.8, 0.6, trav, { segs: 10, rTop: 0.95 });
        b.cyl(0.95, 0.2, trav, { at: [0, 0.6, 0], segs: 10 });
        b.cyl(0.8, 1.9, brick, { at: [0, 0.8, 0], segs: 10 });
        b.panel(0.18, 0.7, P.black, { at: [0, 1.5, 0.8], depth: 0.04 });
        b.panel(0.18, 0.7, P.black, { at: [s * 0.8, 1.5, 0], facing: s > 0 ? '+x' : '-x', depth: 0.04 });
        b.cyl(0.95, 0.15, trav, { at: [0, 2.7, 0], segs: 10 });
        b.dome(0.9, trav, { at: [0, 2.85, 0], segs: 10, squash: 0.8 });
        b.cone(0.12, 0.5, trav, { at: [0, 3.55, 0], segs: 6 });
      });
      // a bronze cannon on its carriage, run up to the parapet of the face
      b.group({ at: [s * 12.2, TOP, 2.6], rotY: s * -0.5 }, () => {
        b.box(0.9, 0.55, 1.8, P.oak, { at: [0, 0.35, 0] });
        b.sym((t) => b.log(0.42, 0.14, P.oakDark, { at: [t * 0.55, 0, 0.3], segs: 10 }));
        b.group({ at: [0, 1.05, 0.2], rot: [-0.08, 0, 0] }, () => {
          b.log(0.22, 2.6, P.bronze, { at: [0, -0.2, 0.6], axis: 'z', segs: 8 });
        });
      });
    });

    // ---------------------------------------------------------------- the gate
    gateBlock(b, gateStone);

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(FX - GATE.w / 2 + 4.5, 7.5, { at: [s * (GATE.w / 2 + FX) / 2, 0, -4.1] });
      b.collider(HALF - FX, 10.6, { at: [s * (FX + HALF) / 2, 0, -1.6] });
      b.collider(5.6, 3.2, { at: [s * (FX + 4.4), 0, 5.0], rotY: s * -0.5 });
      b.collider((GATE.w - GATE.ow) / 2, GATE.front - GATE.back, { at: [s * (GATE.w + GATE.ow) / 4, 0, (GATE.front + GATE.back) / 2] });
    });
  },
};
