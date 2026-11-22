import * as THREE from 'three';
import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { halfColumn, statue, strip, type Pt } from './shared';

// Plan (front at +Z): carriage porch, foyer range, auditorium shell, stage house.
const PORCH_Z = 18;
const FOYER_Z0 = 9.5;
const FOYER_Z1 = 14.6;
const FOYER_W = 30;
const FOYER_H = 16.2;
const AUD_Z0 = -6.6;
const AUD_W = 26;
const AUD_H = 17;
const STAGE_Z0 = -17.7;
const STAGE_H = 26;

// Horseshoe: an arc of radius HR round (0, HC), its straight sides running back to the proscenium.
const HR = 6.2;
const HC = 0.6;
const HZ_END = -5.8;
const BOX_D = 1.8;
const TIERS = [2.0, 4.4, 6.8, 9.2, 11.6, 14.0];

/** The horseshoe at offset `off` outward from the box fronts, as a polyline from the stage on +X round to the stage on -X. */
function horseshoe(off: number, segs = 12): Pt[] {
  const R = HR + off;
  const pts: Pt[] = [[R, HZ_END]];
  for (let i = 0; i <= segs; i++) {
    const t = Math.PI / 2 - (i / segs) * Math.PI;
    pts.push([R * Math.sin(t), HC + R * Math.cos(t)]);
  }
  pts.push([-R, HZ_END]);
  return pts;
}

/** A horizontal band between two matching polylines at height y (a floor of boxes). */
function band(b: Builder, a: Pt[], c: Pt[], y: number, color: number): void {
  const t: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    t.push(a[i][0], y, a[i][1], a[i + 1][0], y, a[i + 1][1], c[i + 1][0], y, c[i + 1][1]);
    t.push(a[i][0], y, a[i][1], c[i + 1][0], y, c[i + 1][1], c[i][0], y, c[i][1]);
  }
  addFlat(b, t, color);
}

function addFlat(b: Builder, tris: number[], color: number): void {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris), 3));
  g.computeVertexNormals();
  b.add(g, color);
}

/** A window with a small pediment over it: triangular or segmental. */
function pedimentWindow(b: Builder, x: number, y: number, z: number, w: number, h: number, kind: 'tri' | 'seg' | 'flat', frame: number): void {
  b.window(w, h, { at: [x, y, z], frame, bars: [2, 3] });
  b.panel(w + 0.5, 0.18, frame, { at: [x, y + h, z], depth: 0.16 });
  if (kind === 'tri') b.extrude([[-w / 2 - 0.3, 0], [w / 2 + 0.3, 0], [0, 0.55]], 0.2, frame, { at: [x, y + h + 0.18, z + 0.1] });
  else if (kind === 'seg') b.panel(w + 0.6, 0.5, frame, { at: [x, y + h + 0.16, z], shape: 'segmental', depth: 0.18 });
  b.panel(w + 0.3, 0.14, frame, { at: [x, y - 0.14, z], depth: 0.14 });
}

export const operaHouse: BuildingDef = {
  id: 'opera-house',
  name: 'Opera house',
  style: 'Neoclassical (teatro all’italiana)',
  date: '1778',
  summary:
    'Opera was born in Italy around 1600 and by the eighteenth century every town of any size wanted a public opera house. ' +
    'This one, built with money from the noble families who bought its boxes, follows the Italian pattern: a horseshoe of stacked boxes round the stalls, so the audience can watch itself as much as the stage, ' +
    'and a tall stage house behind the proscenium for the scenery. Outside, a sober neoclassical front with a carriage porch, so that ladies could step down from their coaches under cover. ' +
    'On the model the auditorium roof is cut away.',
  materials: ['stucco over brick', 'stone dressings', 'timber boxes and stage', 'gilded and painted plaster', 'coppi roof tiles'],
  modelledOn:
    'Teatro alla Scala, Milan, by Giuseppe Piermarini (1776-78; opened 3 August 1778), much reduced',
  influences: ['pompeii-neoclassicism'],
  lookFor: [
    {
      label: 'Carriage porch',
      note: 'A projecting portico of three rusticated arches, open at the sides too, where carriages drew up. Its roof is a terrace for the rooms above.',
      at: [0, 3.5, PORCH_Z + 0.4],
    },
    {
      label: 'Paired half-columns and pediment',
      note: 'The centre of the front steps forward with paired Corinthian half-columns and is crowned by a pediment with a relief in it.',
      at: [3.6, 13.0, FOYER_Z1 + 0.6],
    },
    {
      label: 'Horseshoe of boxes',
      note: 'Tiers of boxes stacked round a horseshoe-shaped hall, with cheap seats in a gallery at the top; La Scala opened with five tiers of boxes and today has four and two galleries. Each box was owned by a family, who furnished it and received visitors in it.',
      at: [-6.6, 9.0, 1.0],
    },
    {
      label: 'Royal box',
      note: 'The grandest box, two tiers high, faces the stage at the back of the horseshoe.',
      at: [0, 7.5, HC + HR + 0.2],
    },
    {
      label: 'Stage house',
      note: 'The tall block behind the proscenium arch holds the stage, the machinery and the painted scenery hoisted up out of sight.',
      at: [12.3, 18.0, -12.0],
    },
  ],
  build(b) {
    const stucco = tint(b.pick([P.stucco, mix(P.stucco, P.intonacoCream, 0.5)]), b.range(-0.03, 0.01));
    const stone = tint(P.travertine, -0.06);
    const roof = tint(P.coppi, b.range(-0.03, 0.02));
    const red = tint(P.doorRed, 0.08);
    const gold = tint(P.gold, -0.05);
    const ivory = tint(P.cream, 0.02);
    const oak = P.oak;
    const boxDark = mix(P.doorRed, P.black, 0.55);

    // ------------------------------------------------ stage house and auditorium shell
    const sd = AUD_Z0 - STAGE_Z0;
    b.box(24, STAGE_H, sd, stucco, { at: [0, 0, (STAGE_Z0 + AUD_Z0) / 2] });
    b.gable(24, sd, 3.6, roof, { at: [0, STAGE_H, (STAGE_Z0 + AUD_Z0) / 2], ridge: 'z', overhang: 0.25, wall: stucco });
    b.sym((s) => {
      for (const z of [-15, -11.5, -8]) {
        b.window(1.2, 2.2, { at: [s * 12, 18.5, z], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
        b.window(1.2, 1.8, { at: [s * 12, 3.0, z], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
      }
    });
    b.window(2.4, 1.2, { at: [0, 20, STAGE_Z0], facing: '-z', frame: stone, shape: 'segmental' });
    b.panel(3.0, 4.0, oak, { at: [0, 0, STAGE_Z0], facing: '-z' }); // scenery door

    const t = 0.7;
    const ad = FOYER_Z0 - AUD_Z0;
    b.sym((s) => {
      b.box(t, AUD_H, ad, stucco, { at: [s * (AUD_W / 2 - t / 2), 0, (AUD_Z0 + FOYER_Z0) / 2] });
      b.box(0.5, 0.4, ad, tint(stucco, -0.08), { at: [s * (AUD_W / 2 + 0.05), AUD_H - 0.4, (AUD_Z0 + FOYER_Z0) / 2] });
      for (const z of [-3, 2, 7]) b.window(1.2, 2.0, { at: [s * AUD_W / 2, 3.0, z], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
    });
    // roof cut away: a few trusses and the tiled edges
    for (const z of [AUD_Z0 + 1.0, 1.5, FOYER_Z0 - 0.6]) {
      b.beam([-AUD_W / 2, AUD_H, z], [AUD_W / 2, AUD_H, z], 0.3, 0.32, oak);
      b.sym((s) => b.beam([s * AUD_W / 2, AUD_H + 0.1, z], [0, AUD_H + 4.0, z], 0.26, 0.3, oak));
    }
    b.sym((s) => b.beam([s * (AUD_W / 2 + 0.4), AUD_H, AUD_Z0], [s * (AUD_W / 2 + 0.4), AUD_H, FOYER_Z0], 1.3, 0.22, roof));

    // ------------------------------------------------ inside: proscenium, stalls, the horseshoe of boxes
    b.box(AUD_W - 1.4, 0.4, ad - 0.6, tint(oak, -0.05), { at: [0, 0, (AUD_Z0 + FOYER_Z0) / 2] }); // stalls floor
    for (let r = 0; r < 7; r++) b.box(9.6 - (r < 2 ? 1 : 0), 0.5, 0.55, red, { at: [0, 0.4, -2.6 + r * 1.2] });
    b.box(11, 0.1, 1.6, P.windowDark, { at: [0, 0.4, HZ_END + 1.0] }); // orchestra pit
    // proscenium wall with its gilded arch and the curtain
    b.extrude(
      [[-AUD_W / 2 + t, 0], [AUD_W / 2 - t, 0], [AUD_W / 2 - t, AUD_H], [-AUD_W / 2 + t, AUD_H]],
      0.6,
      ivory,
      { at: [0, 0, AUD_Z0 + 0.3], holes: [[[-5.4, 1.4], [5.4, 1.4], [5.4, 10.8], [-5.4, 10.8]]] },
    );
    b.panel(11.6, 10.0, gold, { at: [0, 1.1, AUD_Z0 + 0.6], depth: 0.05 });
    b.panel(10.8, 9.4, red, { at: [0, 1.4, AUD_Z0 + 0.62], depth: 0.07 });
    b.panel(3.0, 1.6, gold, { at: [0, 12.0, AUD_Z0 + 0.6], shape: 'segmental', depth: 0.08 }); // the arms over the stage
    b.box(11.2, 1.2, 1.2, oak, { at: [0, 0, AUD_Z0 + 1.2] }); // stage front

    const front = horseshoe(0);
    const back = horseshoe(BOX_D);
    TIERS.forEach((y, i) => {
      band(b, front, back, y, tint(oak, -0.08)); // floor of the tier
      strip(b, front.map(([x, z]) => [x, z, y, y + 1.0] as [number, number, number, number]), i < 4 ? ivory : tint(ivory, -0.06)); // parapet
      strip(b, front.map(([x, z]) => [x, z, y + 0.85, y + 1.0] as [number, number, number, number]), gold);
      strip(b, back.map(([x, z]) => [x, z, y, y + 2.4] as [number, number, number, number]), boxDark); // the back of the boxes
      if (i < 4) {
        // partitions between the boxes
        for (let k = 1; k < front.length - 1; k++) {
          const [x0, z0] = front[k];
          const [x1, z1] = back[k];
          b.beam([x0, y + 1.2, z0], [x1, y + 1.2, z1], 0.12, 2.4, tint(ivory, -0.1));
        }
      }
    });
    // royal box: two tiers high in the middle of the horseshoe, with a crown over it
    b.box(2.6, 4.6, 0.3, gold, { at: [0, TIERS[1], HC + HR - 0.05] });
    b.box(2.0, 3.6, 0.35, red, { at: [0, TIERS[1] + 0.3, HC + HR - 0.1] });
    b.sphere(0.45, gold, { at: [0, TIERS[3] - 0.2, HC + HR], segs: 6 });

    // ------------------------------------------------ the foyer range and its front
    const fd = FOYER_Z1 - FOYER_Z0;
    b.box(FOYER_W, FOYER_H, fd, stucco, { at: [0, 0, (FOYER_Z0 + FOYER_Z1) / 2] });
    b.hip(FOYER_W, fd, 1.6, roof, { at: [0, FOYER_H + 0.5, (FOYER_Z0 + FOYER_Z1) / 2], overhang: 0.5 });
    const fz = FOYER_Z1;
    // rusticated ground storey
    for (let i = 0; i < 9; i++) b.panel(FOYER_W, 0.12, tint(stucco, -0.1), { at: [0, 0.6 + i * 0.62, fz], depth: 0.03 });
    b.panel(FOYER_W + 0.2, 0.5, stone, { at: [0, 6.0, fz], depth: 0.2 });
    b.panel(FOYER_W + 0.4, 0.5, stone, { at: [0, 12.3, fz], depth: 0.25 });
    b.box(FOYER_W + 0.8, 0.6, fd + 0.8, stone, { at: [0, FOYER_H - 0.1, (FOYER_Z0 + FOYER_Z1) / 2] }); // main cornice
    // the wings: pilasters and windows
    const wingX = [-13.2, -10.2, -7.4, 7.4, 10.2, 13.2];
    wingX.forEach((x, i) => {
      b.window(1.3, 2.2, { at: [x, 2.2, fz], frame: stone, bars: [2, 3] });
      pedimentWindow(b, x, 7.6, fz, 1.4, 2.6, i % 2 ? 'tri' : 'seg', stone);
      b.window(1.1, 1.2, { at: [x, 13.6, fz], frame: stone, bars: [2, 2] });
    });
    for (const x of [-14.7, -11.7, -8.8, 8.8, 11.7, 14.7]) {
      b.panel(0.55, 9.6, tint(stucco, 0.03), { at: [x, 6.5, fz], depth: 0.14 });
    }
    // the centre: paired half-columns, pedimented windows, the great pediment
    b.box(13.2, FOYER_H, 0.6, stucco, { at: [0, 0, fz + 0.3] });
    for (const cx of [-6.0, -2.0, 2.0, 6.0]) {
      for (const d of [-0.42, 0.42]) {
        halfColumn(b, [cx + d, 6.5, fz + 0.6], 0, 0.3, 5.5, stucco);
        b.box(0.8, 0.45, 0.4, stucco, { at: [cx + d, 12.0, fz + 0.7] }); // capital
        b.box(0.7, 0.2, 0.4, stone, { at: [cx + d, 6.5, fz + 0.7] });
      }
      b.panel(1.4, 3.6, tint(stucco, 0.03), { at: [cx, 12.6, fz + 0.6], depth: 0.12 }); // attic pilasters
    }
    for (const [x, k] of [[-4, 'tri'], [0, 'seg'], [4, 'tri']] as [number, 'tri' | 'seg'][]) {
      pedimentWindow(b, x, 7.8, fz + 0.6, 1.6, 2.6, k, stone);
      b.window(1.2, 1.3, { at: [x, 13.4, fz + 0.6], frame: stone, bars: [2, 2] });
    }
    b.box(13.6, 0.7, 1.2, stone, { at: [0, 12.4, fz + 0.4] }); // entablature over the columns
    b.extrude([[-7.0, 0], [7.0, 0], [0, 2.5]], 0.9, stone, { at: [0, FOYER_H + 0.5, fz + 0.4] });
    b.extrude([[-5.8, 0.25], [5.8, 0.25], [0, 2.0]], 0.9, tint(stucco, 0.04), { at: [0, FOYER_H + 0.5, fz + 0.48] });
    statue(b, [0, FOYER_H + 0.7, fz + 0.75], 1.0, tint(stucco, -0.05)); // the relief of Apollo's chariot, suggested by a figure
    // the carriage porch: three arches in front and one each side, a terrace on top
    const pd = PORCH_Z - fz - 0.6;
    const pz = fz + 0.6 + pd / 2;
    b.archWall(12.4, 6.0, 0.9, stone, { at: [0, 0, PORCH_Z - 0.45], openings: 3, openW: 2.7, openH: 4.7 });
    b.sym((s) => b.archWall(pd, 6.0, 0.9, stone, { at: [s * 5.75, 0, pz], facing: s > 0 ? '+x' : '-x', openings: 1, openW: 2.0, openH: 4.4 }));
    b.box(12.8, 0.4, pd + 0.4, stone, { at: [0, 6.0, pz] });
    for (let i = 0; i < 13; i++) b.box(0.18, 0.75, 0.18, stone, { at: [-6.0 + i, 6.4, PORCH_Z - 0.15] });
    b.box(12.6, 0.15, 0.3, stone, { at: [0, 7.15, PORCH_Z - 0.15] });
    b.panel(2.2, 3.4, P.doorBlack, { at: [0, 0, fz + 0.6], shape: 'round' });
    b.sym((s) => b.panel(1.8, 3.0, P.doorBlack, { at: [s * 4.0, 0, fz + 0.6], shape: 'round' }));

    // ------------------------------------------------ walk collisions
    b.collider(24, sd, { at: [0, 0, (STAGE_Z0 + AUD_Z0) / 2] });
    b.collider(AUD_W, ad, { at: [0, 0, (AUD_Z0 + FOYER_Z0) / 2] });
    b.collider(FOYER_W, fd + 0.6, { at: [0, 0, (FOYER_Z0 + FOYER_Z1 + 0.6) / 2] });
    b.sym((s) => b.collider(1.2, pd, { at: [s * 5.75, 0, pz] }));
    for (const x of [-3.0, 3.0]) b.collider(1.3, 0.9, { at: [x, 0, PORCH_Z - 0.45] });
  },
};
