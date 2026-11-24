import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { CAROL, CX, ROOF, abbey, arcadeWall, flat, win } from './shared';

/** Where the gate hall stands: free in the forecourt on the axis of the church, as at Lorsch. */
export const GATEHALL = { x: CX, z: 19.3, w: 9.4, d: 4.4, h1: 5.4, h2: 3.3 };

/**
 * The gate hall: three round arches on each long face between engaged half-columns, an upper hall
 * (a chapel) faced in red and white stone in a lozenge pattern, with pilasters carrying a frieze of
 * little triangular gables, under a steep roof.
 */
export function gateHall(b: Builder) {
  const { x, z, w, d, h1, h2 } = GATEHALL;
  const white = mix(P.craie, P.pierreBlonde, 0.3);
  const red = mix(P.sandstoneRed, P.brickRed, 0.4);
  b.group({ at: [x, 0, z] }, () => {
    b.box(w + 0.4, 0.3, d + 0.4, tint(white, -0.08));
    for (const s of [-1, 1]) arcadeWall(b, w, h1, 0.6, white, { at: [0, 0.3, s * (d / 2 - 0.3)], n: 3, openW: 2.1, openH: 3.9, kind: 'round' });
    b.sym((s) => b.box(0.6, h1, d - 1.2, white, { at: [s * (w / 2 - 0.3), 0.3, 0] }));
    b.box(w - 1.2, 0.5, d - 1.2, white, { at: [0, h1 - 0.2, 0] });
    b.box(w + 0.3, 0.3, d + 0.3, tint(white, 0.04), { at: [0, h1 + 0.3, 0], jitter: false });
    b.box(w, h2, d, white, { at: [0, h1 + 0.6, 0] });
    const yTop = h1 + 0.6 + h2;
    b.gable(w, d, 3.8, ROOF, { ridge: 'x', at: [0, yTop, 0], overhang: 0.3, wall: white });
    b.box(w + 0.3, 0.25, d + 0.3, tint(white, 0.04), { at: [0, yTop - 0.25, 0], jitter: false });
    for (const s of [-1, 1]) {
      const f = s > 0 ? '+z' : '-z';
      const fz = s * (d / 2);
      // engaged half-columns with leafy capitals between the arches
      for (const px of [-4.4, -1.57, 1.57, 4.4]) {
        b.cyl(0.24, h1 - 0.7, white, { at: [px, 0.3, fz], segs: 8 });
        b.box(0.62, 0.4, 0.62, tint(white, 0.05), { at: [px, h1 - 0.4, fz], jitter: false });
      }
      // red and white facing in the spandrels
      for (const px of [-3.0, 0, 3.0]) {
        for (let k = -1; k <= 1; k += 2) flat(b, [[-0.25, 0], [0, -0.25], [0.25, 0], [0, 0.25]], red, [px + k * 1.57 * 0.95, h1 - 0.45, fz], f, 0.04);
      }
      // upper storey: pilasters, a frieze of triangular gables, lozenges between
      const y0 = h1 + 0.6;
      const pil = [-4.4, -2.2, 0, 2.2, 4.4];
      for (const px of pil) b.box(0.34, h2 - 0.2, 0.14, tint(white, 0.05), { at: [px, y0, fz + s * 0.07], jitter: false });
      for (let i = 0; i < pil.length - 1; i++) {
        const xa = pil[i];
        const xb = pil[i + 1];
        const xm = (xa + xb) / 2;
        b.group({ at: [0, 0, fz + s * 0.08], rotY: s > 0 ? 0 : Math.PI }, () => {
          const xs = s > 0 ? 1 : -1;
          b.extrude([[xs * xa, y0 + h2 - 1.4], [xs * xb, y0 + h2 - 1.4], [xs * xm, y0 + h2 - 0.25]], 0.12, tint(white, 0.05), { jitter: false });
          b.extrude([[xs * (xa + 0.3), y0 + h2 - 1.25], [xs * (xb - 0.3), y0 + h2 - 1.25], [xs * xm, y0 + h2 - 0.45]], 0.16, red, { jitter: false });
        });
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const px = xa + 0.55 + c * 0.55 + (r % 2 ? 0.27 : 0);
            if (px > xb - 0.3) continue;
            flat(b, [[-0.2, 0], [0, -0.26], [0.2, 0], [0, 0.26]], (r + c) % 2 ? red : mix(red, white, 0.55), [px, y0 + 0.55 + r * 0.55, fz], f, 0.05);
          }
        }
      }
    }
    // small windows to the chapel in the ends
    b.sym((s) => win(b, 'round', 0.6, 1.4, [s * (w / 2), h1 + 1.4, 0], s > 0 ? '+x' : '-x', { frame: tint(white, 0.05), bd: 0.1 }));
  });
  // piers and ends are solid; the three arches are walkable
  for (const s of [-1, 1]) {
    for (const px of [-1.57, 1.57]) b.collider(1.1, 0.6, { at: [x + px, 0, z + s * (d / 2 - 0.3)] });
    b.collider(1.2, d, { at: [x + s * (w / 2 - 0.6), 0, z] });
  }
}

function build(b: Builder) {
  abbey(b, CAROL);
  gateHall(b);
  // the monks' vegetable garden and orchard behind the east range, and the wash place
  for (let i = 0; i < 6; i++) b.box(1.1, 0.16, 5.6, i % 2 ? P.soil : mix(P.soil, P.leaf, 0.4), { at: [-1 + i * 1.5, 0, -17.6] });
  for (let i = 0; i < 3; i++) b.tree(5.5 + b.rand(), { at: [11 + i * 3.2, 0, -19], kind: 'round' });
}

export const carolingianAbbey: BuildingDef = {
  id: 'carolingian-abbey',
  name: 'Carolingian abbey',
  style: 'Carolingian',
  date: 'c. 830',
  summary:
    'Under Charlemagne and his son Louis the Pious every monastery is required to follow the Rule of St Benedict (councils of Aachen, 816 and 817), and the monastery is now planned as a whole: church, cloister and the three ranges round it, as on the Plan of St Gall drawn about 820. ' +
    'The church is a timber-roofed basilica with a round tower over the crossing and a westwork, a tall towered block at the entrance with a chapel upstairs. ' +
    'Round the cloister walk stand the dormitory, the refectory and the cellar range, and in the forecourt a gate hall of red and white stone imitates a Roman triumphal arch.',
  materials: ['rubble, limewashed', 'red and white stone facing', 'flat clay tiles', 'oak shingles', 'lead'],
  lookFor: [
    { label: 'Westwork', note: 'A towered entrance block with a chapel on the upper floor, a Carolingian invention and the ancestor of the twin-towered front.', at: [CX, 9, 14.6] },
    { label: 'Cloister', note: 'An open garth with a covered walk on four sides, linking the church to the rooms the monks use every day.', at: [3.75, 2.2, 3] },
    { label: 'Dormitory and chapter house', note: 'The east range: the common dormitory above, and below it a room for the monks’ daily meeting (on the Plan of St Gall, a warming room; the chapter met in the cloister walk).', at: [3.75, 4.2, -5] },
    { label: 'Refectory', note: 'The dining hall, on the side of the cloister opposite the church, as the Plan of St Gall lays it out.', at: [19, 4.2, 3] },
    { label: 'Gate hall', note: 'A free-standing hall of three arches with a chapel above, faced in a lozenge pattern of red and white stone.', at: [CX, 7.8, GATEHALL.z + 2.4] },
  ],
  modelledOn:
    'The layout follows the Plan of St Gall (about 820); the westwork and round towers follow drawings of Saint-Riquier (Centula, consecrated 799); the gate hall is modelled on the Torhalle of Lorsch (late eighth or ninth century), much simplified.',
  influences: ['carolingian-revival'],
  build,
};
