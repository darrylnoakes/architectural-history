import * as THREE from 'three';
import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { block, col, coppiRibs } from './shared';

/** An atrium roof sloping inward from the walls to an opening (compluvium), w x d, opening ow x od. */
function compluviate(b: Builder, w: number, d: number, ow: number, od: number, yWall: number, yOpen: number, x: number, z: number, color: number): void {
  const o: [number, number, number][] = [[-w / 2, yWall, d / 2], [w / 2, yWall, d / 2], [w / 2, yWall, -d / 2], [-w / 2, yWall, -d / 2]];
  const i: [number, number, number][] = [[-ow / 2, yOpen, od / 2], [ow / 2, yOpen, od / 2], [ow / 2, yOpen, -od / 2], [-ow / 2, yOpen, -od / 2]];
  const pos: number[] = [];
  for (let k = 0; k < 4; k++) {
    const j = (k + 1) % 4;
    pos.push(...o[k], ...o[j], ...i[j], ...o[k], ...i[j], ...i[k]);
    const dn = (p: [number, number, number]) => [p[0], p[1] - 0.15, p[2]];
    pos.push(...i[k], ...i[j], ...dn(i[j]), ...i[k], ...dn(i[j]), ...dn(i[k]));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  b.add(g, color, { at: [x, 0, z] });
}

export const peristyleDomus: BuildingDef = {
  id: 'peristyle-domus',
  name: 'Atrium and peristyle house (domus)',
  style: 'Roman Republican',
  date: 'c. 150 BC',
  summary:
    'The leading family now lives in a Roman town house that looks inward. From the street a narrow passage leads into the atrium, a tall hall whose roof slopes in to an opening over a pool that catches rainwater; beyond it the tablinum, where the master received his clients, opens onto a garden surrounded by columns. ' +
    'The atrium is an old Italic and Etruscan idea; the colonnaded garden (peristyle) is Greek luxury, arriving with the conquest of the Hellenistic east. ' +
    'Rooms on the street are let out as shops, and inside the walls are painted to imitate costly marble blocks.',
  materials: ['tufa ashlar', 'rubble and lime mortar', 'painted plaster', 'stuccoed columns', 'fired clay roof tiles'],
  modelledOn: 'House of the Faun, Pompeii (second century BC), much reduced',
  influences: ['hellenistic-luxury', 'etruscan-legacy'],
  lookFor: [
    { label: 'Tuscan atrium', note: 'The roof slopes inward on beams with no columns to an opening, the compluvium, that lets in light and rain.', at: [0, 6.4, 5.0] },
    { label: 'Impluvium', note: 'A shallow pool under the opening catches rainwater, which drains to a cistern below.', at: [0, 0.4, 5.0] },
    { label: 'Tablinum', note: 'The master’s reception room stands open between atrium and garden, giving a view right through the house.', at: [0, 3.6, 0.2] },
    { label: 'Peristyle garden', note: 'Columns of stuccoed tufa surround a planted garden, the Greek part of the house.', at: [-6.5, 2.4, -5.2] },
    { label: 'Shops (tabernae)', note: 'The rooms either side of the entrance open to the street and are let to traders.', at: [7.5, 2.0, 12.4] },
  ],
  build(b) {
    const tufa = b.pick([P.tufa, tint(P.tufa, 0.04), tint(P.tufa, -0.03)]);
    const plaster = b.pick([P.plaster, P.intonacoCream]);
    const dado = b.pick([P.intonacoRed, P.marbleYellow]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05)]);
    const stucco = P.stucco;

    // ---- street range: shops either side of the entrance passage (fauces)
    const Hf = 4.4;
    b.sym((s) => block(b, 10.1, Hf, 3, tufa, s * 5.95, 10.5));
    b.box(1.8, 0.06, 3, P.paving, { at: [0, 0, 10.5] });
    b.box(1.8, Hf - 3.4, 3, tufa, { at: [0, 3.4, 10.5] });
    b.gable(22, 3, 1.0, tile, { at: [0, Hf, 10.5], overhang: 0.4, wall: tufa });
    coppiRibs(b, -11, 11, 10.5, 3, Hf, 1.0, 0.4, tint(tile, -0.06), 0.8, [1]);
    b.sym((s) => {
      for (const x of [3.6, 8.2]) {
        // the shop opening with its masonry counter and a mezzanine window above
        b.panel(3.0, 2.8, P.windowDark, { at: [s * x, 0, 12], facing: '+z', depth: 0.03 });
        b.box(3.0, 0.9, 0.5, P.travertine, { at: [s * x, 0, 12.2] });
        b.box(3.2, 0.2, 0.15, P.oak, { at: [s * x, 2.8, 12.05] });
        b.panel(0.9, 0.6, P.windowDark, { at: [s * x, 3.25, 12], facing: '+z', depth: 0.04 });
        for (let k = 0; k < 3; k++) b.lathe([[0.01, 0], [0.18, 0.1], [0.2, 0.45], [0.08, 0.6]], P.terracotta, { at: [s * x - 0.8 + k * 0.5, 0.9, 12.2], segs: 6 });
      }
      // ashlar joints on the tufa front
      for (const y of [0.9, 1.8, 3.3]) b.box(10, 0.05, 0.04, tint(tufa, -0.1), { at: [s * 6, y, 12.01] });
      // pilasters with carved capitals at the doorway
      b.box(0.5, 3.4, 0.2, tufa, { at: [s * 1.15, 0, 12.1] });
      b.box(0.7, 0.4, 0.3, tint(tufa, 0.06), { at: [s * 1.15, 3.2, 12.15] });
    });
    b.panel(1.6, 3.2, P.oakDark, { at: [0, 0, 9.05], facing: '+z', depth: 0.08 });

    // ---- the atrium: tall hall with rooms either side, roof sloping in to the compluvium
    const za0 = 1.5;
    const za1 = 9;
    const zac = (za0 + za1) / 2;
    const Ha = 5.6;
    b.sym((s) => {
      block(b, 6, 4.6, za1 - za0, plaster, s * 8, zac);
      b.gable(6, za1 - za0, 1.1, tile, { at: [s * 8, 4.6, zac], ridge: 'z', overhang: 0.35, wall: plaster });
      b.box(0.4, Ha, za1 - za0, plaster, { at: [s * 4.8, 0, zac] });
      // doorways into the side rooms (cubicula and alae), with the painted dado below
      b.box(0.06, 1.0, za1 - za0, dado, { at: [s * 4.58, 0, zac] });
      for (const z of [2.6, 5.2, 7.8]) b.panel(1.1, 2.5, P.oakDark, { at: [s * 4.58, 0, z], facing: s > 0 ? '-x' : '+x', depth: 0.06 });
    });
    compluviate(b, 10.4, za1 - za0 + 0.4, 3.0, 2.4, Ha + 0.6, Ha - 0.2, 0, zac, tile);
    b.box(10, 0.4, 0.2, plaster, { at: [0, Ha, za0] });
    b.box(3.2, 0.06, 2.6, P.travertine, { at: [0, 0, zac] });
    b.box(2.8, 0.25, 2.2, P.travertine, { at: [0, 0, zac] });
    b.box(2.5, 0.26, 1.9, P.water, { at: [0, 0, zac], mat: 'glass' });
    b.box(9.6, 0.04, za1 - za0, tint(P.paving, 0.05), { at: [0, 0, zac] });
    // the cistern head and a marble table at the edge of the pool
    b.cyl(0.35, 0.8, P.marble, { at: [1.9, 0, zac - 1.6], segs: 8 });
    b.box(1.2, 0.8, 0.5, P.marble, { at: [0, 0, za0 + 0.6] });

    // ---- the tablinum range: open in the middle, dining rooms either side
    const zt = 0.25;
    b.sym((s) => {
      block(b, 9, 5.0, 2.5, plaster, s * 6.5, zt);
      b.box(0.5, 5.0, 0.5, tufa, { at: [s * 2.25, 0, zt + 1.0] });
    });
    b.box(4, 1.0, 2.5, plaster, { at: [0, 4.0, zt] });
    b.box(4, 0.04, 2.5, P.marbleYellow, { at: [0, 0, zt] });
    b.gable(22, 2.5, 0.8, tile, { at: [0, 5.0, zt], overhang: 0.4, wall: plaster });

    // ---- the peristyle: colonnade round a garden, rooms behind
    const zp0 = -9.6;
    const zp1 = -1.0;
    b.sym((s) => {
      block(b, 2.4, 3.6, zp1 - zp0, plaster, s * 9.8, (zp0 + zp1) / 2);
      b.shed(2.8, zp1 - zp0, 0.6, tile, { at: [s * 9.8, 3.6, (zp0 + zp1) / 2], high: s > 0 ? '+x' : '-x' });
      b.box(0.06, 1.0, zp1 - zp0, dado, { at: [s * 8.58, 0, (zp0 + zp1) / 2] });
    });
    block(b, 22, 4.4, 2.4, plaster, 0, -10.8);
    b.gable(22, 2.4, 0.8, tile, { at: [0, 4.4, -10.8], overhang: 0.4, wall: plaster });
    // the exedra opening in the back range, with two columns in it
    b.panel(4.0, 3.6, tint(P.windowDark, 0.15), { at: [0, 0, -9.58], facing: '+z', depth: 0.03 });
    b.sym((s) => col(b, s * 0.9, -9.4, 0.18, 3.4, stucco, { cap: 'corinthian', segs: 6 }));
    for (const x of [-6, -3.5, 3.5, 6]) b.panel(1.1, 2.4, P.oakDark, { at: [x, 0, -9.58], facing: '+z', depth: 0.06 });
    b.box(17, 0.06, 8.6, P.paving, { at: [0, 0, -5.3] });
    b.box(12.0, 0.14, 4.0, P.grass, { at: [0, 0, -5.2] });
    // columns all round the garden
    const cx = 6.4;
    const z0 = -7.6;
    const z1 = -2.8;
    const ch = 3.0;
    const xs = [-6.4, -3.2, 0, 3.2, 6.4];
    for (const x of xs) {
      col(b, x, z0, 0.2, ch, stucco, { cap: 'ionic', segs: 6 });
      col(b, x, z1, 0.2, ch, stucco, { cap: 'ionic', segs: 6 });
    }
    b.sym((s) => col(b, s * cx, (z0 + z1) / 2, 0.2, ch, stucco, { cap: 'ionic', segs: 6 }));
    b.box(2 * cx + 0.4, 0.3, 0.4, stucco, { at: [0, ch, z0] });
    b.box(2 * cx + 0.4, 0.3, 0.4, stucco, { at: [0, ch, z1] });
    b.sym((s) => b.box(0.4, 0.3, z1 - z0, stucco, { at: [s * cx, ch, (z0 + z1) / 2] }));
    // lean-to roofs of the walks, falling toward the garden
    b.shed(2 * cx + 4.4, 2.0, 0.6, tile, { at: [0, ch + 0.3, z0 - 1.0], high: '-z' });
    b.shed(2 * cx + 4.4, 1.8, 0.6, tile, { at: [0, ch + 0.3, z1 + 0.9], high: '+z' });
    b.sym((s) => b.shed(2.2, z1 - z0, 0.6, tile, { at: [s * (cx + 1.1), ch + 0.3, (z0 + z1) / 2], high: s > 0 ? '+x' : '-x' }));
    // planting: a fountain basin, shrubs and a small tree
    b.cyl(0.6, 0.4, P.marble, { at: [0, 0, -5.2], segs: 8 });
    b.cyl(0.5, 0.42, P.water, { at: [0, 0, -5.2], segs: 8, mat: 'glass' });
    for (const [x, z] of [[-3.8, -4.2], [3.8, -6.2], [-1.8, -6.4], [2, -4.0]]) b.blob(0.5, P.hedge, { at: [x, 0.45, z], stretch: [1, 0.8, 1] });
    b.tree(4.5, { kind: 'olive', at: [-4.5, 0, -6.3] });
    // small high windows on the outer walls
    b.sym((s) => {
      for (const z of [-7, -3, 3, 6.5]) b.panel(0.6, 0.6, P.windowDark, { at: [s * 11, 2.6, z], facing: s > 0 ? '+x' : '-x', depth: 0.04 });
    });
  },
};
