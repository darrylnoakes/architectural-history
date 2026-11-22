import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, archPanel, gateMass, road, slab, voussoirs } from './shared';
import { VAUBAN, curtain, ravelin } from './curtain';

// ------------------------------------------------------------------ the gate (kept when the walls come down)

/** The gate pavilion: front (field side) at z = front, back at z = back, centred on x = 0. */
export const VGATE = { w: 12, front: 0.1, back: -4.6, h: 10.2, ow: 4.4, oh: 7.4 };

/** A trophy of arms: a cuirass and helmet on a post, with shields, spears and flags behind. */
function trophy(b: Builder, x: number, y: number, z: number, stone: number): void {
  b.group({ at: [x, y, z] }, () => {
    b.box(1.3, 0.5, 1.0, stone, NJ);
    b.cyl(0.08, 2.6, stone, { at: [0, 0.5, 0], segs: 5, ...NJ });
    // spears and banners fanned out behind
    for (const s of [1, -1]) {
      b.beam([s * 0.2, 0.6, -0.1], [s * 1.3, 3.1, -0.15], 0.07, 0.07, stone, NJ);
      b.group({ at: [s * 1.05, 2.25, -0.15], rot: [0, 0, s * -0.45] }, () => b.box(0.7, 0.6, 0.05, s > 0 ? P.doorBlue : P.white, NJ));
    }
    b.cyl(0.42, 0.95, tint(stone, 0.03), { at: [0, 1.1, 0], segs: 8, rTop: 0.5, ...NJ }); // the cuirass
    b.cyl(0.55, 0.12, tint(stone, -0.04), { at: [0, 2.05, 0], segs: 8, ...NJ });
    b.dome(0.32, tint(stone, 0.04), { at: [0, 2.2, 0], segs: 8, ...NJ }); // the helmet
    b.cone(0.1, 0.35, tint(stone, 0.04), { at: [0, 2.5, 0], segs: 5, ...NJ });
    for (const s of [1, -1]) b.log(0.36, 0.1, tint(stone, 0.02), { at: [s * 0.62, 0.55, 0.3], axis: 'z', segs: 10 }); // shields
  });
}

/**
 * The gate dressed as a triumphal arch: one great arch between paired columns, statues of Mars and
 * Hercules in niches, a frieze, an attic with the king's emblem of the sun under a crown, and trophies of
 * arms at its corners. The town front is plainer.
 */
export function vaubanGate(b: Builder): void {
  const { w, front, back, h, ow, oh } = VGATE;
  const stone = WALL_COLOURS.vauban.stone;
  const shade = tint(stone, -0.07);
  const deep = tint(stone, -0.25);
  const d = front - back;
  const zc = (front + back) / 2;
  const spring = oh - ow / 2;

  gateMass(b, w, h, d, stone, { at: [0, 0, zc], xs: [0], openW: ow, openH: oh });
  b.sym((s) => b.box((w - ow) / 2 + 0.3, 0.8, d + 0.4, shade, { at: [s * ((w + ow) / 4 + 0.15), 0, zc] }));
  // banded rustication on the lower part of the piers, both faces
  for (const [z, f] of [[front, 1], [back, -1]] as const) {
    for (let y = 0.8; y < 3.4; y += 0.55) b.sym((s) => b.box((w - ow) / 2 - 0.1, 0.42, 0.12, tint(stone, 0.03), { at: [s * (w + ow) / 4, y, z + f * 0.06], ...NJ }));
  }
  // the field front: paired Doric columns on pedestals, a niche with a statue between each pair
  for (const x of [-5.25, -3.55, 3.55, 5.25]) {
    b.box(1.1, 3.0, 0.7, shade, { at: [x, 0, front + 0.35], ...NJ });
    b.column(0.36, h - 1.9 - 3.0, stone, { order: 'doric', at: [x, 3.0, front + 0.4], segs: 10 });
  }
  b.sym((s) => {
    archPanel(b, 0.95, 2.7, deep, { at: [s * 4.4, 3.6, front], depth: 0.03 });
    // Mars (with a shield) and Hercules (with his club), much simplified
    b.group({ at: [s * 4.4, 3.65, front + 0.2] }, () => {
      b.cyl(0.24, 1.5, tint(stone, 0.05), { segs: 7, rTop: 0.2, ...NJ });
      b.sphere(0.17, tint(stone, 0.05), { at: [0, 1.7, 0], segs: 7, ...NJ });
      if (s < 0) b.log(0.3, 0.08, tint(stone, 0.05), { at: [0.25, 0.6, 0.2], axis: 'z', segs: 8 });
      else b.beam([0.3, 0.2, 0.15], [0.35, 1.3, 0.2], 0.12, 0.12, tint(stone, 0.05), NJ);
    });
    b.panel(1.0, 0.75, tint(stone, 0.04), { at: [s * 4.4, 6.6, front], depth: 0.1 }); // a relief panel
    // a trophy carved in each spandrel
    b.panel(0.75, 0.9, tint(stone, 0.06), { at: [s * 2.85, oh + 0.05, front], depth: 0.12, shape: 'circle' });
  });
  voussoirs(b, ow, spring, 0.75, tint(stone, 0.03), { at: [0, 0, front], n: 11, proud: 0.14, vary: 0.04, keyExtra: 0.4 });
  b.panel(0.55, 0.55, tint(stone, 0.06), { at: [0, oh + 0.35, front + 0.12], depth: 0.12, shape: 'circle' }); // a mask on the keystone
  // entablature: architrave, frieze of triglyphs, cornice
  b.box(w + 0.2, 0.5, d + 0.4, tint(stone, 0.02), { at: [0, h - 1.9, zc] });
  b.box(w, 0.8, d + 0.2, stone, { at: [0, h - 1.4, zc] });
  for (let x = -w / 2 + 0.55; x < w / 2; x += 1.1) b.box(0.36, 0.7, 0.08, deep, { at: [x, h - 1.35, front + 0.12], ...NJ });
  b.box(w + 0.9, 0.6, d + 1.0, tint(stone, 0.04), { at: [0, h - 0.6, zc] });
  // the attic: an inscription, the king's sun under a crown, lilies on a blue shield, trophies at the ends
  const ay = h;
  b.box(w - 1.6, 2.3, d - 0.6, stone, { at: [0, ay, zc] });
  b.box(w - 1.3, 0.3, d - 0.3, tint(stone, 0.04), { at: [0, ay + 2.3, zc] });
  b.panel(4.6, 0.8, tint(stone, 0.06), { at: [0, ay + 0.3, front - 0.3], depth: 0.06 });
  for (const y of [ay + 0.5, ay + 0.8]) b.panel(3.8, 0.06, deep, { at: [0, y, front - 0.24], depth: 0.04 });
  b.group({ at: [0, ay + 2.6, front - 0.6] }, () => {
    b.panel(1.4, 1.4, P.gold, { at: [0, 0.1, 0], shape: 'circle', depth: 0.14 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.group({ at: [Math.cos(a) * 0.95, 0.8 + Math.sin(a) * 0.95, 0.02], rot: [0, 0, a - Math.PI / 2] }, () => b.box(0.12, 0.45, 0.08, P.gold, { at: [0, -0.2, 0], ...NJ }));
    }
    b.box(0.9, 0.35, 0.3, P.gold, { at: [0, 1.85, 0] }); // the crown
    for (const x of [-0.35, 0, 0.35]) b.cone(0.1, 0.3, P.gold, { at: [x, 2.2, 0], segs: 5 });
  });
  b.sym((s) => {
    b.panel(0.9, 1.05, P.doorBlue, { at: [s * 2.6, ay + 0.95, front - 0.3], depth: 0.1, shape: 'round' });
    for (const [x, y] of [[-0.2, 1.3], [0.2, 1.3], [0, 1.62]]) b.panel(0.15, 0.2, P.gold, { at: [s * 2.6 + x, ay + y, front - 0.26], depth: 0.1 });
    trophy(b, s * 4.6, ay + 2.6, zc + 0.6, stone);
  });
  // the town front: a plain arch between pilasters
  voussoirs(b, ow, spring, 0.6, tint(stone, 0.02), { at: [0, 0, back], facing: '-z', n: 9, proud: 0.1, vary: 0.03 });
  for (const x of [-4.4, 4.4]) b.box(1.0, h - 2.6, 0.3, tint(stone, 0.02), { at: [x, 0.8, back - 0.15] });
  b.panel(2.8, 0.6, tint(stone, 0.05), { at: [0, oh + 0.9, back], facing: '-z', depth: 0.06 });
  // the passage vault and the gates, folded back
  b.vault(ow - 0.04, d - 0.06, tint(stone, -0.2), { at: [0, spring, zc], segs: 10 });
  b.sym((s) => b.box(0.16, spring + 1.4, ow / 2, P.doorGreen, { at: [s * (ow / 2 - 0.1), 0, back + ow / 4 + 0.4] }));
}

/** Colliders for the gate's two piers. */
export function vaubanGateColliders(b: Builder): void {
  const { w, front, back, ow } = VGATE;
  b.sym((s) => b.collider((w - ow) / 2 + 0.4, front - back + 0.8, { at: [s * ((w + ow) / 4 + 0.2), 0, (front + back) / 2] }));
}

// ------------------------------------------------------------------ the stage

const SX = VGATE.w / 2; // where the ramparts meet the gate
const FX = VAUBAN.PLOT_C - VAUBAN.G; // the inner flanks of the two bastions (±11.5)
const RCUT = 2.5; // half-width of the way cut through the ravelin
const { gorge: RG } = VAUBAN.ravelin;

export const vaubanGateStage: BuildingDef = {
  id: 'vauban-gate',
  name: 'Bastioned front and royal gate',
  style: 'Classical military (Vauban)',
  date: 'c. 1670 to 1700',
  summary:
    'After Louis XIV’s conquests in Flanders (1667 to 1678) the northern frontier was refortified by his engineer Sébastien Le Prestre de Vauban (1633 to 1707), who rebuilt or improved some 150 fortified places. ' +
    'Against cannon the wall sinks: low ramparts of earth, faced in the north with brick and capped by a stone cordon and a thick parapet of turf; angled bastions whose flanks sweep the ditch; and in the ditch, in front of the curtain, a triangular outwork, the demi-lune (ravelin), that the enemy must take before he can even fire at the gate. ' +
    'Vauban did not invent the bastion, which came from Italy, but he made its geometry and the art of siege a system that all Europe studied. The gate is the one place where the fortress speaks: it is dressed as a triumphal arch to the king’s glory.',
  materials: ['brick facing on an earth rampart', 'white stone (cordon, gate)', 'turf', 'timber bridge', 'iron cannon'],
  modelledOn:
    'Lille, refortified by Vauban after its capture in 1667, with the Porte de Paris (Simon Vollant, 1685 to 1692), a triumphal arch with trophies and the king’s emblems; the citadel of Lille (1667 to 1670) for the bastions. The fronts are compressed: Vauban’s bastions stood about 350 m apart, not 100, and the ditches were many times wider.',
  influences: ['bastions', 'vauban'],
  lookFor: [
    { label: 'Angled bastion', note: 'An arrowhead of rampart thrust out from the line: its two faces glance off shot, and every foot of ground in front can be swept by fire.', at: [13.9, 7.9, 5.0] },
    { label: 'Flank', note: 'The short side of the bastion facing along the wall, where guns fire across the ditch and the face of the gate.', at: [FX - 0.4, 4.0, 1.2] },
    { label: 'Demi-lune (ravelin)', note: 'A low triangular outwork in the ditch covering the gate and the curtain: the attacker has to take it first.', at: [-4.2, VAUBAN.ravelin.h + 1.2, RG + 1.8] },
    { label: 'Triumphal-arch gate', note: 'Paired columns, statues of Mars and Hercules and a great arch: the gate tells every traveller whose town this is.', at: [0, VGATE.oh + 0.8, VGATE.front + 0.5] },
    { label: 'Trophies and the sun', note: 'Carved arms and banners, and Louis XIV’s emblem of the sun under a crown, crown the attic.', at: [-4.6, VGATE.h + 5.6, VGATE.front - 1.4] },
  ],
  build(b) {
    const { brick, grass, stone } = WALL_COLOURS.vauban;
    const sett = mix(P.cobble, P.gravel, 0.3);

    road(b, 4.4, sett, { z0: -8, z1: VGATE.front });
    road(b, 4.2, mix(P.gravel, P.earth, 0.3), { z0: RG, z1: 8, y: 0.06 });

    // ---------------------------------------------------------------- the ramparts and bastions either side
    b.sym((s) => curtain(b, 'vauban', s > 0 ? SX : -HALF, s > 0 ? HALF : -SX));

    // the passage through the rampart behind the gate, vaulted, with a brick arch to the town
    gateMass(b, 2 * SX, VAUBAN.top, VGATE.back + 8 + 0.05, brick, { at: [0, 0, (VGATE.back - 8) / 2], xs: [0], openW: VGATE.ow, openH: 5.4 });
    slab(b, [[-SX, -8], [SX, -8], [SX, VGATE.back], [-SX, VGATE.back]], VAUBAN.top, VAUBAN.top + 0.08, grass);
    b.box(2 * SX, 0.3, 0.3, stone, { at: [0, VAUBAN.top - 0.3, -8.0] });
    b.vault(VGATE.ow - 0.04, VGATE.back + 8, tint(brick, -0.2), { at: [0, 5.4 - VGATE.ow / 2, (VGATE.back - 8) / 2], segs: 8 });

    // ---------------------------------------------------------------- the gate
    vaubanGate(b);

    // ---------------------------------------------------------------- the ditch, the bridge and the ravelin
    // the ditch floor in front of the gate (either side the ramparts bring their own)
    b.box(2 * SX, 0.03, VAUBAN.cs - VAUBAN.CF - 0.2, WALL_COLOURS.vauban.ditch, { at: [0, 0, (VAUBAN.cs + VAUBAN.CF) / 2], ...NJ });
    b.box(2 * SX, 0.9, 0.6, brick, { at: [0, 0, VAUBAN.cs], ...NJ });
    b.box(2 * SX, 0.14, 0.7, stone, { at: [0, 0.9, VAUBAN.cs], ...NJ });
    // a bridge on brick piers, its last span next to the gate a timber drawbridge
    const oak = mix(P.oak, P.oakDark, 0.25);
    b.box(4.0, 0.35, RG - VGATE.front, oak, { at: [0, 0, (RG + VGATE.front) / 2] });
    b.sym((s) => {
      b.box(0.4, 1.3, RG - VGATE.front, oak, { at: [s * 2.0, 0.35, (RG + VGATE.front) / 2] });
      b.beam([s * 1.8, 0.6, RG - 0.1], [s * 1.8, 6.0, VGATE.front + 0.2], 0.08, 0.08, P.iron);
    });
    // the ravelin, with the road cut through it and a barrier at the cut
    ravelin(b, 0, -HALF, -RCUT);
    ravelin(b, 0, RCUT, HALF);
    b.sym((s) => {
      b.box(0.3, 2.6, 0.3, oak, { at: [s * (RCUT - 0.2), 0, 6.4] });
      b.group({ at: [s * (RCUT - 0.2), 0, 6.3], rotY: -s * 1.3 }, () => b.box(RCUT - 0.3, 1.4, 0.1, oak, { at: [-s * (RCUT - 0.3) / 2, 0.3, 0] }));
    });

    // ---------------------------------------------------------------- cannon on the bastions, trained along the ditch
    b.sym((s) => {
      b.group({ at: [s * 13.6, VAUBAN.top, 1.4], rotY: s * (Math.PI / 2 + 0.25) }, () => {
        b.box(0.9, 0.5, 1.8, P.oak, { at: [0, 0.32, 0] });
        b.sym((t) => b.log(0.4, 0.14, P.oakDark, { at: [t * 0.55, 0, 0.35], segs: 10 }));
        b.log(0.2, 2.6, P.castIron, { at: [0, 0.82, 0.6], axis: 'z', segs: 8 });
      });
    });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(FX - SX + 2.0, 7.4, { at: [s * (SX + FX) / 2, 0, -4.3] });
      b.collider(HALF - FX, 11.0, { at: [s * (FX + HALF) / 2, 0, -2.5] });
      b.collider(SX - VGATE.ow / 2, VGATE.back + 8 + 0.05, { at: [s * (SX + VGATE.ow / 2) / 2, 0, (VGATE.back - 8) / 2] });
      b.collider(VAUBAN.ravelin.half - RCUT + 0.4, 3.6, { at: [s * (VAUBAN.ravelin.half + RCUT) / 2, 0, RG + 1.6], rotY: 0 });
      b.collider(0.4, RG - VGATE.front, { at: [s * 2.0, 0, (RG + VGATE.front) / 2] });
    });
    vaubanGateColliders(b);
  },
};
