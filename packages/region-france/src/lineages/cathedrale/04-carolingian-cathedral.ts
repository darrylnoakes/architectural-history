import { P, mix, tint, type BuildingDef, type Vec3 } from '@ah/kit';
import { lin, opening, roofZ, roofX, flat, archPts } from './shared';

const WALL = mix(P.pierreBlonde, P.rubble, 0.4);
const DRESS = tint(P.pierreBlonde, 0.02);
const ROOF = P.tuilePlate;
const GLASS = mix(P.windowDark, P.plaster, 0.12);

const NW = 4;
const AW = 7.6;
const Z0 = -6; // crossing, west edge
const Z1 = -13; // crossing, east edge
const WZ0 = 13; // westwork, back
const WZ1 = 20.5; // westwork, front
const NH = 12.5;
const AH = 6.5;
const TWX = 11;

export const carolingianCathedral: BuildingDef = {
  id: 'carolingian-cathedral',
  name: 'Carolingian cathedral',
  style: 'Carolingian',
  date: 'c. 830',
  summary:
    'Under Charlemagne and his son Louis the Pious, bishops and abbots rebuilt in stone on a scale not seen since Rome, copying the basilicas of Rome: a tall nave lit by a clerestory over lower aisles, a transept and an apse. ' +
    'Under the apse a crypt held the relics, with a passage round them so that pilgrims could pass without entering the choir; it shows outside as small windows at ground level. Over the crossing rises a round tower of diminishing stages, as at Saint-Riquier. ' +
    'The great novelty is at the west: the westwork, a tower-like block with an entrance hall below and a chapel upstairs, flanked by stair turrets, where the emperor or the bishop could sit in state. ' +
    'Nothing of the first cathedral group survives above ground; the halls were cleared for the new church.',
  materials: ['coursed rubble with dressed stone', 'lime plaster', 'clay tiles', 'timber roofs'],
  lookFor: [
    { label: 'Westwork', note: 'The towered entrance block, ancestor of the twin-towered fronts of the Romanesque and Gothic cathedrals.', at: [0, 16.0, WZ1 + 0.3] },
    { label: 'Upper chapel windows', note: 'The row of windows lights the chapel on the first floor of the westwork, which opened as a gallery towards the nave.', at: [0, 9.8, WZ1 + 0.3] },
    { label: 'Stair turrets', note: 'Round towers holding spiral stairs up to the chapel and the galleries.', at: [6.4, 18.0, 19.3] },
    { label: 'Crypt windows', note: 'Small openings at the foot of the apse light the crypt where the relics lay.', at: [0, 0.8, Z1 - 4.4] },
    { label: 'Crossing tower', note: 'A round tower in stages over the crossing, as drawn at Saint-Riquier.', at: [0, 19.0, (Z0 + Z1) / 2 + 2.7] },
  ],
  modelledOn:
    'The abbey of Saint-Riquier (Centula, consecrated 799), known from a drawing copied in a printed book of 1612, for the westwork with its round stair turrets and the round crossing tower; the cathedral of Reims, rebuilt from 816 under Archbishop Ebbo and dedicated in 862. The best surviving westwork is at Corvey in Germany (873 to 885).',
  influences: ['carolingian-revival'],
  build(b) {
    b.box(33.6, 0.03, 66, mix(P.earth, P.grassDry, 0.45), { at: [0, 0, 0], jitter: false });
    b.box(20, 0.04, 10, mix(P.paving, P.earth, 0.3), { at: [0, 0, WZ1 + 5], jitter: false });
    const nl = WZ0 - Z0;
    const nz = (WZ0 + Z0) / 2;
    b.box(2 * AW + 0.3, 0.4, nl, tint(WALL, -0.05), { at: [0, 0, nz] });
    b.box(2 * NW, NH, nl, WALL, { at: [0, 0, nz] });
    b.sym((s) => b.box(AW - NW, AH, nl, WALL, { at: [(s * (AW + NW)) / 2, 0, nz] }));
    roofZ(b, 0, Z0, WZ0, NW, NH, 3.0, ROOF, {});
    b.sym((s) => b.shed(AW - NW + 0.3, nl, 2.0, ROOF, { at: [s * ((AW + NW) / 2 + 0.15), AH, nz], high: s > 0 ? '-x' : '+x' }));
    const bays = lin(6, Z0 + 1.6, WZ0 - 1.6);
    b.sym((s) => {
      const f = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      for (const z of bays) {
        opening(b, 'round', 1.0, 2.0, [s * NW, 9.0, z], f, GLASS, DRESS, 0.14);
        opening(b, 'round', 0.9, 1.8, [s * AW, 2.6, z], f, GLASS, DRESS, 0.14);
      }
    });
    // transept and apse over the crypt
    const td = Z0 - Z1;
    const tz = (Z0 + Z1) / 2;
    b.box(2 * TWX, NH, td, WALL, { at: [0, 0, tz] });
    roofX(b, tz, -TWX, TWX, td / 2, NH, 3.0, ROOF, { g0: WALL, g1: WALL });
    b.sym((s) => {
      const f = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      for (const dz of [-1.6, 1.6]) opening(b, 'round', 1.0, 2.2, [s * TWX, 7.4, tz + dz], f, GLASS, DRESS, 0.14);
      opening(b, 'round', 1.0, 2.2, [s * 9.0, 7.4, Z1], Math.PI, GLASS, DRESS, 0.14);
    });
    b.lathe([[4.3, 0], [4.3, 0.9], [4.0, 0.9], [4.0, 9.6]], WALL, { start: Math.PI / 2, sweep: Math.PI, segs: 9, at: [0, 0, Z1] });
    b.lathe([[4.3, 9.5], [0.01, 11.8]], ROOF, { start: Math.PI / 2, sweep: Math.PI, segs: 9, at: [0, 0, Z1] });
    for (const k of [1, 3, 5, 7]) {
      const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / 9;
      const ap = 4.3 * Math.cos(Math.PI / 18);
      opening(b, 'rect', 0.7, 0.45, [ap * Math.sin(phi), 0.3, Z1 + ap * Math.cos(phi)], phi, P.windowDark);
      const ap2 = 4.0 * Math.cos(Math.PI / 18);
      opening(b, 'round', 0.9, 2.2, [ap2 * Math.sin(phi), 4.8, Z1 + ap2 * Math.cos(phi)], phi, GLASS, DRESS, 0.14);
    }
    // the round crossing tower in stages
    const cy = NH + 2.2;
    for (const [r, h, y] of [[3.2, 4.0, cy - 2.2], [2.6, 3.4, cy + 2.0], [2.0, 2.8, cy + 5.6]] as const) {
      b.cyl(r, h, WALL, { at: [0, y, tz], segs: 12 });
      b.cyl(r + 0.25, 0.25, DRESS, { at: [0, y + h, tz], segs: 12, jitter: false });
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + Math.PI / 6;
        const ap = r * Math.cos(Math.PI / 12);
        opening(b, 'round', 0.6, 1.4, [ap * Math.sin(a), y + h - 2.0, tz + ap * Math.cos(a)], a, P.windowDark, DRESS, 0.1);
      }
    }
    b.cone(2.3, 4.0, ROOF, { at: [0, cy + 8.65, tz], segs: 12 });
    b.box(0.1, 1.2, 0.1, P.iron, { at: [0, cy + 12.6, tz] });
    // the westwork: a towered block with stair turrets
    const wl = WZ1 - WZ0;
    const wz = (WZ0 + WZ1) / 2;
    const WH = 15;
    b.box(2 * AW + 0.3, 0.5, wl + 0.3, tint(WALL, -0.05), { at: [0, 0, wz] });
    b.box(2 * AW, WH, wl, WALL, { at: [0, 0, wz] });
    roofX(b, wz, -AW, AW, wl / 2, WH, 2.6, ROOF, { g0: WALL, g1: WALL });
    b.box(7.2, 9.0, 7.2, WALL, { at: [0, WH - 0.5, wz] });
    b.pyramid(7.7, 7.7, 4.2, ROOF, { at: [0, WH + 8.5, wz], overhang: 0.2 });
    b.box(7.45, 0.3, 7.45, DRESS, { at: [0, WH + 3.0, wz], jitter: false });
    const faces: [number, (u: number) => Vec3][] = [
      [0, (u) => [u, 0, wz + 3.6]],
      [Math.PI, (u) => [-u, 0, wz - 3.6]],
      [Math.PI / 2, (u) => [3.6, 0, wz - u]],
      [-Math.PI / 2, (u) => [-3.6, 0, wz + u]],
    ];
    for (const [rot, p] of faces) for (const u of [-1.2, 1.2]) {
      const q = p(u);
      opening(b, 'round', 0.9, 2.4, [q[0], WH + 4.6, q[2]], rot, P.windowDark, DRESS, 0.14);
    }
    b.sym((s) => {
      b.cyl(1.7, 19.5, WALL, { at: [s * 6.4, 0, WZ1 - 1.2], segs: 10 });
      b.cone(2.0, 3.4, ROOF, { at: [s * 6.4, 19.5, WZ1 - 1.2], segs: 10 });
      for (const y of [4, 9, 14]) opening(b, 'rect', 0.3, 0.8, [s * 6.4 + s * 0.4, y, WZ1 - 1.2 + 1.62], s * 0.25, P.windowDark);
    });
    b.group({ at: [0, 0, WZ1], rotY: 0 }, () => {
      flat(b, archPts('round', 3.6, 4.8, 0, 0, 4), DRESS, 0.03);
      flat(b, archPts('round', 2.4, 4.0, 0, 0, 4), P.oakDark, 0.05);
      for (const u of [-2.2, 0, 2.2]) {
        flat(b, archPts('round', 1.4, 2.8, u, 8.3, 3), DRESS, 0.03);
        flat(b, archPts('round', 1.1, 2.5, u, 8.45, 3), GLASS, 0.05);
      }
      for (const u of [-1.0, 1.0]) flat(b, archPts('round', 0.7, 1.5, u, 12.2, 3), GLASS, 0.05);
      flat(b, [[-AW, 7.4], [AW, 7.4], [AW, 7.6], [-AW, 7.6]], DRESS, 0.04);
    });
    b.sym((s) => opening(b, 'round', 1.1, 2.4, [s * AW, 8.4, wz], s > 0 ? Math.PI / 2 : -Math.PI / 2, GLASS, DRESS, 0.14));
    b.collider(2 * AW, nl, { at: [0, 0, nz] });
    b.collider(2 * TWX, td + 4.3, { at: [0, 0, tz - 2.1] });
    b.collider(2 * AW + 1, wl, { at: [0, 0, wz] });
  },
};
