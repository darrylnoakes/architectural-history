import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, gateMass, road, voussoirs } from './shared';
import { BASTION, WALL_COLOURS, counterscarpZ, curtain, gateCounterscarp, gateDitch } from './curtain';

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
  // the plinth stops at the jambs: the floor of the passage is level with the road
  b.sym((s) => b.box(w / 2 - ow / 2 + 0.2, 0.6, d + 0.4, tint(stone, -0.06), { at: [(s * (w / 2 + 0.2 + ow / 2)) / 2, 0, zc] }));
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

// ------------------------------------------------------------------ the ramparts (drawn by curtain.ts)

const { D } = BASTION;
const FX = BASTION.PLOT_C - BASTION.G; // the inner flanks of the two bastions
const SX = GATE.w / 2 - 0.2; // where the curtain meets the gate
const TOP = BASTION.top;
// the bridge over the ditch: half its width, the pier the drawbridge rests on, and the far end of the
// abutment, which carries the road on past the counterscarp and the dug strip behind it
const BR = 2.6;
const PIER = [2.8, 3.8];
const ZE = counterscarpZ(BR, BASTION.W + 2) + 0.25;
const DECK = 0.06; // top of the bridge deck, level with the road

export const bastionGate: BuildingDef = {
  id: 'bastion-gate',
  name: 'Bastioned rampart and gate',
  style: 'Renaissance military',
  date: 'c. 1540',
  summary:
    'The cannon that the French brought into Italy in 1494 could breach a tall medieval wall in hours. Italian engineers answered with ramparts that are low and immensely thick, earth faced with brick and sloped to deflect shot, ' +
    'and with angled bastions whose flanks let guns sweep the ditch and the face of the next bastion, so that no ground at the foot of the wall was hidden from fire. ' +
    'In front runs a broad dry ditch walled in brick on both sides, and the road crosses it on a brick bridge that ends in a drawbridge at the gate. ' +
    'This bastioned system, the trace italienne, was taken up by every power in Europe. The gate itself is architecture: a rusticated Doric front, strong and severe, the order thought right for a fortress.',
  materials: ['brick facing on an earth core', 'travertine cordon', 'stone (tufa and marble) for the gate', 'oak gates and drawbridge', 'bronze cannon'],
  modelledOn: 'Michele Sanmicheli’s Porta Nuova, Verona (1530s, finished 1540), with bastions like Antonio da Sangallo the Younger’s Bastione Ardeatino in Rome (1537 to 1542)',
  influences: ['bastion-export'],
  lookFor: [
    { label: 'Angled bastion', note: 'An arrowhead of rampart pushed out from the wall; its angled faces leave no blind spot and glance off shot.', at: [12.4, 8.4, 5.6] },
    { label: 'Flank with gunports', note: 'The short side of the bastion, set at right angles to the wall, where hidden guns swept the ditch in front of the gate.', at: [FX - 0.4, 3.0, 1.6] },
    { label: 'Scarp and cordon', note: 'The sloping brick face of the rampart, topped by a rounded stone moulding (the cordon) under a thick parapet of earth.', at: [-6.8, 6.3, -1.1] },
    { label: 'Rusticated gate', note: 'Courses of stone left boldly projecting, with paired Doric pilasters: Sanmicheli’s fortress style.', at: [-4.6, 4.5, GATE.front + 0.7] },
    { label: 'Ditch and drawbridge', note: 'A dry ditch walled on both sides; the bridge is brick up to the last span, a timber drawbridge that could be raised against the gate.', at: [0, -1.2, 1.7] },
  ],
  build(b) {
    const { brick } = WALL_COLOURS.bastion;
    const trav = P.travertine;
    const gateStone = mix(P.travertine, P.tufa, 0.35);

    // ---------------------------------------------------------------- the ditch and the bridge over it
    const roadStone = mix(P.gravel, P.cobble, 0.4);
    // the road, from the town through the gate passage
    road(b, 5.4, roadStone, { z0: -8, z1: GATE.front });
    // the ditch in front of the gate (either side it comes with the ramparts), its counterscarp walled
    // in brick up to the level of the covered way, broken only where the bridge lands
    gateDitch(b, -SX, SX);
    b.sym((s) => gateCounterscarp(b, s > 0 ? BR : -SX, s > 0 ? SX : -BR));
    // the gate stands in the ditch: its front goes down to the bottom
    // (the ditch is dug 2 m in under it, as under the ramparts; this masonry fills that strip)
    b.box(GATE.w, D, 3.5, tint(gateStone, -0.08), { at: [0, -D, 0.8 - 1.75] });
    // the fixed bridge: a brick pier for the drawbridge to rest on, an arch over the ditch and a solid
    // abutment on the far side, all one mass in section, carrying the road level from the gate
    const zc = (PIER[0] + ZE) / 2;
    const span = [PIER[1], counterscarpZ(0) - 0.2];
    b.group({ at: [0, -D, zc], rotY: Math.PI / 2 }, () => {
      gateMass(b, ZE - PIER[0], D + DECK - 0.03, BR * 2, brick, { xs: [zc - (span[0] + span[1]) / 2], openW: span[1] - span[0], openH: 2.6 });
    });
    b.box(BR * 2, 0.03, ZE - PIER[0], roadStone, { at: [0, DECK - 0.03, zc] });
    // a stone cap on the pier, and low parapets along the sides of the fixed bridge
    b.box(BR * 2 + 0.1, 0.25, PIER[1] - PIER[0] + 0.1, trav, { at: [0, DECK - 0.55, (PIER[0] + PIER[1]) / 2] });
    b.sym((s) => {
      b.box(0.45, 0.85, ZE - PIER[0] - 1.2, brick, { at: [s * (BR - 0.22), DECK, zc - 0.6] });
      b.box(0.55, 0.12, ZE - PIER[0] - 1.2, trav, { at: [s * (BR - 0.22), DECK + 0.85, zc - 0.6] });
    });
    // the drawbridge: a timber deck from the gate to the pier, with the lifting beams above
    const dz = (GATE.front + PIER[0] + 0.3) / 2;
    b.box(4.0, 0.28, PIER[0] + 0.3 - GATE.front, P.oak, { at: [0, DECK - 0.28, dz] });
    for (let z = GATE.front + 0.3; z < PIER[0] + 0.2; z += 0.5) b.box(4.0, 0.02, 0.05, P.oakDark, { at: [0, DECK, z], jitter: false });
    b.sym((s) => b.beam([s * 1.9, DECK + 0.4, PIER[0]], [s * 1.9, 5.4, GATE.front + 0.25], 0.07, 0.07, P.iron));
    // the road runs on over the abutment and out to the field
    road(b, 5.4, roadStone, { z0: ZE, z1: ZE + 1.6 });
    b.deck(4.2, ZE - GATE.front + 3.4, DECK, { at: [0, 0, (ZE + GATE.front - 3.4) / 2] });

    // ---------------------------------------------------------------- the ramparts either side
    b.sym((s) => {
      curtain(b, 'bastion', s > 0 ? SX : -HALF, s > 0 ? HALF : -SX);
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
