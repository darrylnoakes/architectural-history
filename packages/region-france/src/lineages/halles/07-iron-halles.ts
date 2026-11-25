import { P, linspace, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { archOutline, goods, ironColumn, paving, slab, stall } from './shared';

const IRON = tint(P.castIron, 0.06);
const BRICK = P.briqueNord;
const ZINC = P.zincParis;
const LOUVRE = mix(P.glass, P.white, 0.3);

/**
 * A bay of glass louvres (persiennes) w wide from y0 to y1 on a wall face: a glazed panel crossed by
 * slats that let air through but keep the rain out. Local frame: face at z = 0, facing +z.
 */
function louvres(b: Builder, w: number, y0: number, y1: number, at: Vec3, rotY: number, slats = 6): void {
  b.group({ at, rotY }, () => {
    b.box(w, y1 - y0, 0.06, LOUVRE, { at: [0, y0, 0], mat: 'glass', jitter: false });
    for (let i = 1; i <= slats; i++) {
      const y = y0 + ((y1 - y0) * i) / (slats + 1);
      b.box(w, 0.07, 0.16, IRON, { at: [0, y, 0.04], rot: [0.5, 0, 0], jitter: false });
    }
    b.box(w, 0.12, 0.14, IRON, { at: [0, y0, 0.02] });
    b.box(w, 0.12, 0.14, IRON, { at: [0, y1 - 0.12, 0.02] });
  });
}

/** A roof sloping outward all round from an inner rectangle (high) to an outer one (low). */
function apronRoof(b: Builder, o: [number, number], i: [number, number], yOut: number, yIn: number, color: number): void {
  const [ox, oz] = o;
  const [ix, iz] = i;
  const O: Vec3[] = [[-ox, yOut, -oz], [ox, yOut, -oz], [ox, yOut, oz], [-ox, yOut, oz]];
  const I: Vec3[] = [[-ix, yIn, -iz], [ix, yIn, -iz], [ix, yIn, iz], [-ix, yIn, iz]];
  for (let k = 0; k < 4; k++) {
    const j = (k + 1) % 4;
    slab(b, [I[k], I[j], O[j], O[k]], 0.12, color);
  }
  // standing seams of the zinc running down the slope
  const seam = tint(color, -0.08);
  for (const x of linspace(Math.round((2 * ix) / 2.0), -ix + 0.3, ix - 0.3)) for (const s of [-1, 1]) b.beam([x, yIn + 0.02, s * iz], [x, yOut + 0.02, s * oz], 0.05, 0.05, seam);
  for (const z of linspace(Math.round((2 * iz) / 2.0), -iz + 0.3, iz - 0.3)) for (const s of [-1, 1]) b.beam([s * ix, yIn + 0.02, z], [s * ox, yOut + 0.02, z], 0.05, 0.05, seam);
}

export const ironHalles: BuildingDef = {
  id: 'iron-halles',
  name: 'Iron market hall (pavillon)',
  style: 'Second Empire engineering',
  date: 'c. 1866',
  summary:
    'The town copies the new central markets of Paris: a pavilion with no walls to speak of, a frame of slender cast-iron columns and wrought-iron trusses carrying a roof of zinc and glass. ' +
    'A low brick base keeps out dogs and draughts; above it, and in the raised clerestories of the roof, glass louvres let light in and the smells out, which was the whole point of the design. ' +
    'Victor Baltard’s first pavilion for Les Halles in 1853 was of stone and was pulled down half-built; Napoleon III is said to have asked for umbrellas of iron instead, and the ten iron pavilions built from 1854 to 1874 were copied in market towns across France. ' +
    'The Paris pavilions were demolished in 1971 to 1973; one was rebuilt at Nogent-sur-Marne.',
  materials: ['cast and wrought iron', 'brick', 'glass louvres', 'zinc'],
  lookFor: [
    { label: 'Cast-iron columns', note: 'Slender hollow columns, cast in one piece, carry the whole roof: they also drain the rain from the gutters down inside them.', at: [-11.5, 3.6, 9.5] },
    { label: 'Brick base', note: 'A low wall of brick runs between the columns, with doorways in many bays.', at: [7.6, 1.2, 9.7] },
    { label: 'Louvred clerestory', note: 'The middle of the roof is raised over a band of glass louvres (persiennes) that air the hall and let out the smell of fish and meat.', at: [7.6, 8.4, 5.6] },
    { label: 'Ridge lantern', note: 'A second, smaller louvred lantern runs along the top, so warm air could always escape.', at: [0, 12.6, 0] },
    { label: 'Glazed lunette', note: 'Over each entrance a big half-round window of iron and glass, with the town’s arms and a clock.', at: [0, 7.6, 10.0] },
  ],
  modelledOn: 'The pavilions of Les Halles centrales, Paris (Victor Baltard and Félix Callet, from 1854), one pavilion reduced; provincial halls on the same pattern were built in iron in many French towns',
  influences: ['iron-and-rail'],
  build(b) {
    const X = 11.4; // half length of the outer wall line
    const Z = 9.4; // half depth
    const IX = 7.6; // clerestory line
    const IZ = 5.6;
    const YE = 6.2; // eaves of the aisles
    const YC = 7.0; // foot of the clerestory
    const YC1 = 9.4; // top of the clerestory
    const DADO = 2.2;

    paving(b, 25.8, 21.8, P.cobble, 0.1, [0, 0, 0], 10); // the cobbled square, relaid round the hall of 1929 too
    b.box(2 * X + 1.4, 0.12, 2 * Z + 1.4, tint(P.paving, -0.04), { at: [0, 0.06, 0] });
    const y0 = 0.18;

    // ---- the outer wall line: columns, brick base, louvres above
    const xs = linspace(7, -X, X);
    const zs = linspace(6, -Z, Z);
    const pitchX = xs[1] - xs[0];
    const pitchZ = zs[1] - zs[0];
    for (const x of xs) for (const s of [-1, 1]) ironColumn(b, YE - y0, [x, y0, s * Z], 0.14, IRON);
    for (const z of zs.slice(1, -1)) for (const s of [-1, 1]) ironColumn(b, YE - y0, [s * X, y0, z], 0.14, IRON);
    for (const x of xs) for (const s of [-1, 1]) b.collider(0.4, 0.4, { at: [x, 0, s * Z] });
    for (const z of zs.slice(1, -1)) for (const s of [-1, 1]) b.collider(0.4, 0.4, { at: [s * X, 0, z] });
    // eaves beam and gutter all round
    for (const s of [-1, 1]) {
      b.box(2 * X + 0.4, 0.45, 0.3, IRON, { at: [0, YE - 0.45, s * Z] });
      b.box(0.3, 0.45, 2 * Z + 0.4, IRON, { at: [s * X, YE - 0.45, 0] });
    }
    const bay = (cx: number, cz: number, w: number, rotY: number, door: boolean) => {
      // brick base with a stone coping, or a doorway with iron gates
      if (door) {
        b.group({ at: [cx, y0, cz], rotY }, () => {
          b.box(w - 0.3, 0.6, 0.3, BRICK, { at: [0, DADO + 0.4, 0] });
          for (const sx of [-1, 1]) b.box(0.06, DADO + 0.3, 0.06, IRON, { at: [sx * (w / 2 - 0.5), 0, 0.2] });
        });
      } else {
        b.group({ at: [cx, y0, cz], rotY }, () => {
          b.box(w - 0.3, DADO, 0.3, BRICK);
          b.box(w - 0.3, 0.1, 0.42, P.pierreBlonde, { at: [0, DADO, 0] });
          b.box(w - 0.9, DADO - 0.8, 0.04, tint(BRICK, -0.1), { at: [0, 0.4, 0.15] }); // recessed panel
        });
        b.collider(rotY === 0 || Math.abs(rotY) === Math.PI ? w - 0.3 : 0.3, rotY === 0 || Math.abs(rotY) === Math.PI ? 0.3 : w - 0.3, { at: [cx, 0, cz] });
      }
      louvres(b, w - 0.3, y0 + DADO + 0.1 + (door ? 0.9 : 0), YE - 0.45, [cx, 0, cz], rotY, door ? 2 : 3);
    };
    for (let i = 0; i < xs.length - 1; i++) {
      const cx = (xs[i] + xs[i + 1]) / 2;
      bay(cx, Z, pitchX, 0, i === 0 || i === 5);
      bay(cx, -Z, pitchX, Math.PI, i === 0 || i === 5);
    }
    for (let i = 0; i < zs.length - 1; i++) {
      const cz = (zs[i] + zs[i + 1]) / 2;
      bay(X, cz, pitchZ, Math.PI / 2, i === 2);
      bay(-X, cz, pitchZ, -Math.PI / 2, i === 2);
    }

    // ---- inside: the taller columns of the nave, carrying the clerestory
    const ixs = linspace(5, -IX, IX);
    const izs = linspace(4, -IZ, IZ);
    for (const x of ixs) for (const s of [-1, 1]) {
      ironColumn(b, YC1 - y0, [x, y0, s * IZ], 0.15, IRON);
      b.collider(0.4, 0.4, { at: [x, 0, s * IZ] });
    }
    for (const z of izs.slice(1, -1)) for (const s of [-1, 1]) {
      ironColumn(b, YC1 - y0, [s * IX, y0, z], 0.15, IRON);
      b.collider(0.4, 0.4, { at: [s * IX, 0, z] });
    }
    // the lattice girders of the aisles, seen below the roof between the two rows of columns
    for (const x of xs.slice(1, -1)) for (const s of [-1, 1]) b.beam([x, YE - 0.2, s * Z], [x, YC - 0.2, s * IZ], 0.12, 0.3, IRON);

    // ---- roofs: the aisle apron, the louvred clerestory, the upper roof and its ridge lantern
    apronRoof(b, [X + 0.6, Z + 0.6], [IX, IZ], YE - 0.1, YC, ZINC);
    for (const s of [-1, 1]) {
      for (let i = 0; i < ixs.length - 1; i++) louvres(b, ixs[i + 1] - ixs[i] - 0.25, YC, YC1 - 0.2, [(ixs[i] + ixs[i + 1]) / 2, 0, s * IZ], s > 0 ? 0 : Math.PI, 4);
      for (let i = 0; i < izs.length - 1; i++) louvres(b, izs[i + 1] - izs[i] - 0.25, YC, YC1 - 0.2, [s * IX, 0, (izs[i] + izs[i + 1]) / 2], s > 0 ? Math.PI / 2 : -Math.PI / 2, 4);
      b.box(2 * IX + 0.5, 0.3, 0.35, IRON, { at: [0, YC1 - 0.2, s * IZ] });
      b.box(0.35, 0.3, 2 * IZ + 0.5, IRON, { at: [s * IX, YC1 - 0.2, 0] });
    }
    b.hip(2 * IX + 1.0, 2 * IZ + 1.0, 2.4, ZINC, { at: [0, YC1 + 0.05, 0] });
    // glazed strips in the upper roof
    for (const s of [-1, 1]) slab(b, [[-4.5, YC1 + 0.7, s * (IZ - 0.75)], [4.5, YC1 + 0.7, s * (IZ - 0.75)], [4.5, YC1 + 1.6, s * (IZ - 2.6)], [-4.5, YC1 + 1.6, s * (IZ - 2.6)]], 0.06, P.glass, 'glass');
    // ridge lantern
    const yL = YC1 + 2.45;
    b.box(7.0, 0.15, 2.2, IRON, { at: [0, yL - 0.3, 0] });
    for (const s of [-1, 1]) louvres(b, 7.0, yL - 0.15, yL + 0.9, [0, 0, s * 1.1], s > 0 ? 0 : Math.PI, 3);
    for (const s of [-1, 1]) louvres(b, 2.2, yL - 0.15, yL + 0.9, [s * 3.5, 0, 0], s > 0 ? Math.PI / 2 : -Math.PI / 2, 3);
    b.hip(7.4, 2.6, 0.9, ZINC, { at: [0, yL + 0.9, 0] });
    for (const s of [-1, 1]) b.cone(0.12, 0.6, IRON, { at: [s * 3.0, yL + 1.6, 0], segs: 6 });

    // ---- the entrance bays on the two ends: a gable over the doors filled with a glazed lunette
    for (const s of [-1, 1]) {
      b.group({ at: [0, y0, s * (Z + 0.15)], rotY: s > 0 ? 0 : Math.PI }, () => {
        const w = 5.2;
        const r = w / 2 - 0.3;
        const ys = YE - 0.3;
        // brick piers either side, an iron frame in the gable, the lunette
        for (const sx of [-1, 1]) {
          b.box(0.7, YE + 1.6, 0.6, BRICK, { at: [sx * (w / 2), 0, 0] });
          b.box(0.85, 0.2, 0.75, P.pierreBlonde, { at: [sx * (w / 2), YE + 1.6, 0] });
          b.cone(0.28, 0.6, ZINC, { at: [sx * (w / 2), YE + 1.8, 0], segs: 4 });
        }
        const outer: [number, number][] = [[-w / 2, ys], [w / 2, ys], [w / 2, ys + 0.3], ...archOutline(2 * (r + 0.35), r + 0.35, 'round', 6).slice(2).map(([x, y]) => [x, ys + y] as [number, number]), [-w / 2, ys + 0.3]];
        b.extrude(outer, 0.25, IRON, { at: [0, 0, 0.05] });
        b.extrude(archOutline(2 * r, r, 'round', 6).map(([x, y]) => [x, ys + 0.15 + y] as [number, number]), 0.08, LOUVRE, { at: [0, 0, 0.2], mat: 'glass' });
        for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) b.beam([0, ys + 0.15, 0.26], [Math.sin(a) * r, ys + 0.15 + Math.cos(a) * r, 0.26], 0.06, 0.06, IRON);
        // clock and name plate
        b.panel(1.0, 1.0, P.white, { at: [0, ys + 0.6, 0.27], shape: 'circle', depth: 0.06 });
        b.panel(0.06, 0.42, P.black, { at: [0, ys + 1.1, 0.3], depth: 0.08 });
        b.panel(3.6, 0.5, P.doorBlue, { at: [0, ys - 0.05, 0.2], depth: 0.1 });
        for (let k = 0; k < 7; k++) b.panel(0.3, 0.26, P.gold, { at: [-1.35 + k * 0.45, ys + 0.07, 0.2], depth: 0.13 });
        // a short gable roof over the bay, running back into the aisle roof
        b.gable(w + 0.6, 3.0, 1.9, ZINC, { at: [0, ys + 0.3, -1.3], ridge: 'z', overhang: 0.1 });
        // doors
        b.box(w - 0.9, 0.12, 0.2, IRON, { at: [0, 3.2, 0.15] });
      });
      for (const sx of [-1, 1]) b.collider(0.7, 0.6, { at: [sx * 2.6, 0, s * (Z + 0.15)] });
    }

    // ---- the market inside: rows of stalls under the nave, a few outside under the eaves
    const cloths = [P.cream, P.white, tint(P.cream, -0.06)];
    for (const x of [-5.0, -1.6, 1.8, 5.2]) for (const z of [-3.0, 2.0]) stall(b, 2.6, [x, y0, z], z > 0 ? Math.PI : 0, b.pick(cloths), undefined, b.pick([['fish'], ['cheese', 'basket'], ['fruit', 'basket'], ['pot', 'sack']]));
    for (const x of [-9.0, 9.0]) for (const z of [-6.0, 6.0]) {
      b.box(2.6, 0.9, 0.9, P.white, { at: [x, y0, z] });
      b.box(2.7, 0.05, 1.0, P.marble, { at: [x, y0 + 0.9, z] });
      goods(b, 2.3, [x, y0 + 0.95, z], 0, ['fish', 'cheese']);
    }
    // a hand-cart outside
    b.group({ at: [9.6, y0, 10.2], rotY: Math.PI / 2 }, () => {
      b.box(1.0, 0.1, 1.6, P.pine, { at: [0, 0.65, 0] });
      for (const s of [-1, 1]) b.cyl(0.45, 0.06, P.oakDark, { at: [s * 0.55, 0.45, 0], rot: [0, 0, Math.PI / 2], segs: 10 });
      b.beam([0.3, 0.7, -0.8], [0.3, 0.5, -1.8], 0.05, 0.05, P.oak);
      b.beam([-0.3, 0.7, -0.8], [-0.3, 0.5, -1.8], 0.05, 0.05, P.oak);
      goods(b, 0.8, [0, 0.75, 0], Math.PI / 2, ['basket', 'fruit']);
    });
  },
};
