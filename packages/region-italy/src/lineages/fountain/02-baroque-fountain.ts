import * as THREE from 'three';
import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

type V3 = [number, number, number];

/** Radius of the four-lobed basin at angle a. */
const rim = (a: number) => 4.3 + 0.75 * Math.cos(4 * a);
const RIM_H = 0.75;
const SEGS = 48;

/** The low basin: a wall following the four-lobed outline, `t` thick. */
function basin(b: Builder, color: number, water: number): void {
  const out: number[] = [];
  const wat: number[] = [];
  const t = 0.4;
  const p = (a: number, r: number, y: number): V3 => [Math.sin(a) * r, y, Math.cos(a) * r];
  for (let i = 0; i < SEGS; i++) {
    const a0 = (i / SEGS) * Math.PI * 2;
    const a1 = ((i + 1) / SEGS) * Math.PI * 2;
    const r0 = rim(a0);
    const r1 = rim(a1);
    const q = (A: V3, B: V3, C: V3, D: V3) => out.push(...A, ...B, ...C, ...A, ...C, ...D);
    // outer face with a moulded lip, top, inner face
    q(p(a0, r0, 0), p(a1, r1, 0), p(a1, r1, RIM_H - 0.15), p(a0, r0, RIM_H - 0.15));
    q(p(a0, r0, RIM_H - 0.15), p(a1, r1, RIM_H - 0.15), p(a1, r1 + 0.12, RIM_H), p(a0, r0 + 0.12, RIM_H));
    q(p(a0, r0 + 0.12, RIM_H), p(a1, r1 + 0.12, RIM_H), p(a1, r1 - t, RIM_H), p(a0, r0 - t, RIM_H));
    q(p(a0, r0 - t, RIM_H), p(a1, r1 - t, RIM_H), p(a1, r1 - t, 0.1), p(a0, r0 - t, 0.1));
    wat.push(...p(a0, 0, RIM_H - 0.18), ...p(a0, r0 - t, RIM_H - 0.18), ...p(a1, r1 - t, RIM_H - 0.18));
  }
  const add = (pos: number[], c: number, mat?: 'glass') => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.add(g, c, { mat, jitter: false });
  };
  add(out, color);
  add(wat, water, 'glass');
}

/** A smooth tapering body through the given points (a dolphin, a fish tail), built from overlapping spheres. */
function chain(b: Builder, pts: V3[], r0: number, r1: number, color: number): void {
  const segL: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]);
    segL.push(L);
    total += L;
  }
  let done = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const rl = r0 + (r1 - r0) * ((done + segL[i] / 2) / total);
    const n = Math.max(1, Math.round(segL[i] / (rl * 1.25)));
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const t = (done + segL[i] * u) / total;
      const r = r0 + (r1 - r0) * t;
      const p: V3 = [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u,
        pts[i][2] + (pts[i + 1][2] - pts[i][2]) * u,
      ];
      b.sphere(r, color, { at: p, segs: 7 });
    }
    done += segL[i];
  }
  b.sphere(r1, color, { at: pts[pts.length - 1], segs: 6 });
}

/** A scallop valve: a ribbed fan of radius r, opening upward, hinged at the origin of its group. */
function scallop(b: Builder, r: number, color: number): void {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a0 = -1.2 + (2.4 * i) / n;
    const a1 = -1.2 + (2.4 * (i + 1)) / n;
    const am = (a0 + a1) / 2;
    const tip: V3 = [Math.sin(am) * r, 0.25, Math.cos(am) * r];
    b.extrude(
      [
        [0, 0],
        [Math.sin(a0) * r, Math.cos(a0) * r],
        [Math.sin(am) * r * 1.04, Math.cos(am) * r * 1.04],
        [Math.sin(a1) * r, Math.cos(a1) * r],
      ],
      0.1,
      i % 2 ? tint(color, -0.06) : color,
      { rot: [-Math.PI / 2, 0, 0], jitter: false },
    );
    b.beam([0, 0.05, 0], tip, 0.07, 0.07, tint(color, 0.04)); // a rib
  }
}

export const baroqueFountain: BuildingDef = {
  id: 'baroque-fountain',
  name: 'Baroque fountain',
  style: 'Baroque',
  date: '1642 to 1643',
  summary:
    'The popes restored the ancient aqueducts of Rome and marked where each one ended with a fountain, and other cities followed. In Bernini’s hands the fountain stopped being architecture and became sculpture in motion. ' +
    'Four dolphins dive head first into a low basin, their tails twisted together to hold up a great scallop shell; on it kneels a sea god, a Triton, blowing a jet of water high into the air through a conch. ' +
    'Everything is carved from travertine as if caught in a single moment, and the water itself is part of the design. Where the medieval fountain was an ordered pile of basins and panels to be read, this one is a scene to be felt.',
  materials: ['travertine', 'lead pipes'],
  modelledOn: 'Gian Lorenzo Bernini’s Fontana del Tritone, Piazza Barberini, Rome (1642 to 1643), for Pope Urban VIII',
  influences: ['baroque-export'],
  lookFor: [
    { label: 'Triton', note: 'A sea god of Greek myth, half man and half fish, kneeling on the shell and blowing through a conch.', at: [0, 4.4, 0.6] },
    { label: 'Water jet', note: 'Water is forced up through the conch and falls back over the figure: the water is part of the sculpture.', at: [0, 7.3, 0.3] },
    { label: 'Dolphins', note: 'Four dolphins dive head down into the basin, their tails knotted together under the shell.', at: [1.5, 1.6, 1.5] },
    { label: 'Open scallop shell', note: 'The two valves of a giant shell open like a stage for the Triton.', at: [1.6, 3.3, 0] },
    { label: 'Papal arms with bees', note: 'Between the tails, the arms of Urban VIII: the bees of the Barberini family under the papal crossed keys and tiara.', at: [0, 2.4, 1.0] },
  ],
  build(b) {
    const trav = mix(P.travertine, P.limestone, 0.3);
    const worn = tint(trav, -0.07);
    const water = P.water;
    const spray = mix(P.water, P.white, 0.55);
    const W = { mat: 'glass' as const };

    // a pavement ring round the basin
    b.cyl(5.75, 0.12, mix(P.cobble, P.paving, 0.5), { segs: 24 });
    basin(b, trav, water);

    // ---------------------------------------------------------------- rockwork in the middle of the pool
    b.blob(1.5, worn, { at: [0, 0.4, 0], stretch: [1.2, 0.5, 1.2] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      b.blob(0.6, tint(worn, b.range(-0.05, 0.03)), { at: [Math.sin(a) * 1.3, 0.5, Math.cos(a) * 1.3], detail: 0 });
    }

    // ---------------------------------------------------------------- four dolphins, heads down, tails up and knotted
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const P2 = (r: number, y: number, twist = 0): V3 => [Math.sin(a + twist) * r, y, Math.cos(a + twist) * r];
      const head = P2(1.75, 0.65);
      chain(b, [head, P2(1.55, 1.3, 0.05), P2(1.1, 1.9, 0.1), P2(0.6, 2.35, 0.2), P2(0.3, 2.75, 0.45)], 0.42, 0.14, trav);
      b.sphere(0.45, trav, { at: head, segs: 7 });
      // the open mouth spouting into the pool, and the fluke of the tail
      b.beam(P2(2.05, 0.6), P2(2.4, RIM_H - 0.2), 0.12, 0.12, spray, W);
      b.blob(0.3, trav, { at: P2(0.25, 2.95, 0.6), stretch: [1.6, 0.4, 0.8] });
      b.sphere(0.08, P.black, { at: P2(1.95, 0.85, 0.12), segs: 4 });
    }

    // ---------------------------------------------------------------- the papal arms between the tails, front and back
    for (const s of [1, -1]) {
      b.group({ at: [0, 1.75, s * 0.85], rotY: s > 0 ? 0 : Math.PI }, () => {
        b.panel(0.7, 0.85, trav, { shape: 'round', depth: 0.1 });
        for (const [x, y] of [[-0.16, 0.5], [0.16, 0.5], [0, 0.22]] as const) b.blob(0.08, tint(trav, -0.12), { at: [x, y, 0.14], stretch: [1, 0.7, 0.6], detail: 0 }); // the three bees
        b.cone(0.22, 0.4, trav, { at: [0, 0.85, 0.05], segs: 6 }); // the tiara
        b.beam([-0.25, 0.75, 0.12], [0.25, 1.0, 0.12], 0.05, 0.05, trav); // crossed keys
        b.beam([0.25, 0.75, 0.12], [-0.25, 1.0, 0.12], 0.05, 0.05, trav);
      });
    }

    // ---------------------------------------------------------------- the shell and the Triton
    const S0 = 2.95;
    b.cyl(0.55, 0.3, trav, { at: [0, S0 - 0.15, 0], segs: 8 });
    for (const s of [1, -1]) {
      b.group({ at: [s * 0.15, S0, 0], rotY: s * Math.PI / 2, rot: [-0.55, 0, 0] }, () => scallop(b, 1.55, trav));
    }
    b.group({ at: [0, S0 + 0.1, 0] }, () => {
      // twin fish tails curling either side
      for (const s of [1, -1]) chain(b, [[0, 0.3, 0], [s * 0.45, 0.1, 0.25], [s * 0.85, 0.2, 0.05], [s * 1.0, 0.55, -0.3]], 0.22, 0.09, trav);
      // torso leaning back, head thrown up
      b.blob(0.42, trav, { at: [0, 0.75, 0], stretch: [1, 1.25, 0.8] });
      b.blob(0.36, trav, { at: [0, 1.3, -0.05], stretch: [1.15, 0.9, 0.85] });
      b.sphere(0.22, trav, { at: [0, 1.85, -0.12], segs: 7 });
      b.blob(0.18, worn, { at: [0, 1.98, -0.22], stretch: [1.2, 0.8, 1] }); // hair
      // both arms raised to the conch at his mouth
      for (const s of [1, -1]) chain(b, [[s * 0.35, 1.45, 0], [s * 0.45, 1.75, 0.25], [s * 0.12, 2.0, 0.22]], 0.09, 0.07, trav);
      b.cone(0.17, 0.75, trav, { at: [0, 1.95, 0.12], segs: 6, rot: [-0.25, 0, 0] });
    });
    // the jet: up from the conch, then falling back as spray onto the shell and into the pool
    const J0: V3 = [0, S0 + 2.8, 0.3];
    const JH = 1.9;
    b.cyl(0.07, JH, spray, { at: J0, segs: 6, ...W });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const top: V3 = [J0[0], J0[1] + JH, J0[2]];
      const mid: V3 = [Math.sin(a) * 0.55, J0[1] + JH + 0.15, J0[2] + Math.cos(a) * 0.55];
      b.beam(top, mid, 0.04, 0.04, spray, W);
      b.beam(mid, [Math.sin(a) * 1.3, S0 + 1.6, Math.cos(a) * 1.3], 0.04, 0.04, spray, W);
    }

    // ---------------------------------------------------------------- solid
    b.collider(10.6, 10.6);
  },
};
