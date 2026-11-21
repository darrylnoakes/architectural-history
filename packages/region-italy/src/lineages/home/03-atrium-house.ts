import * as THREE from 'three';
import { P, tint, spread, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { coppiRoof, FRONT, pave, vegBed } from './shared';

/**
 * The roof of a Tuscan atrium: four slopes falling inward from the outer walls to a rectangular
 * opening (the compluvium). Outer rectangle O = [X0, X1, Z0, Z1] at height yo, inner I at yi.
 */
function compluviateRoof(b: Builder, O: [number, number, number, number], I: [number, number, number, number], yo: number, yi: number, color: number): void {
  const [X0, X1, Z0, Z1] = O;
  const [x0, x1, z0, z1] = I;
  const quads: Vec3[][] = [
    [[X0, yo, Z1], [X1, yo, Z1], [x1, yi, z1], [x0, yi, z1]],
    [[X1, yo, Z0], [X0, yo, Z0], [x0, yi, z0], [x1, yi, z0]],
    [[X0, yo, Z0], [X0, yo, Z1], [x0, yi, z1], [x0, yi, z0]],
    [[X1, yo, Z1], [X1, yo, Z0], [x1, yi, z0], [x1, yi, z1]],
  ];
  const pos: number[] = [];
  for (const thick of [0, 0.14]) {
    for (const q of quads) {
      for (const i of [0, 1, 2, 0, 2, 3]) pos.push(q[i][0], q[i][1] + thick, q[i][2]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  b.add(g, color);
  // cover-tile ribs, each running down the slope to the opening or to the hip
  const rib = tint(color, -0.06);
  const y = 0.2;
  const along = (a0: number, a1: number, i0: number, i1: number, outer: number, inner: number, isX: boolean) => {
    for (const u of spread(Math.round((a1 - a0) / 0.5), a0, a1)) {
      let f = 1;
      if (u < i0) f = (u - a0) / (i0 - a0);
      else if (u > i1) f = (a1 - u) / (a1 - i1);
      const yEnd = yo + f * (yi - yo);
      const cEnd = outer + f * (inner - outer);
      const p0: Vec3 = isX ? [u, yo + y, outer] : [outer, yo + y, u];
      const p1: Vec3 = isX ? [u, yEnd + y, cEnd] : [cEnd, yEnd + y, u];
      if (f > 0.08) b.beam(p0, p1, 0.12, 0.07, rib, { jitter: false });
    }
  };
  along(X0, X1, x0, x1, Z1, z1, true);
  along(X0, X1, x0, x1, Z0, z0, true);
  along(Z0, Z1, z0, z1, X0, x0, false);
  along(Z0, Z1, z0, z1, X1, x1, false);
  // timber frame and terracotta gutter round the opening
  const fw = 0.22;
  b.box(x1 - x0 + fw * 2, 0.3, fw, P.oakDark, { at: [(x0 + x1) / 2, yi - 0.2, z1 + fw / 2] });
  b.box(x1 - x0 + fw * 2, 0.3, fw, P.oakDark, { at: [(x0 + x1) / 2, yi - 0.2, z0 - fw / 2] });
  b.box(fw, 0.3, z1 - z0, P.oakDark, { at: [x0 - fw / 2, yi - 0.2, (z0 + z1) / 2] });
  b.box(fw, 0.3, z1 - z0, P.oakDark, { at: [x1 + fw / 2, yi - 0.2, (z0 + z1) / 2] });
  // spouts at the corners
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as [number, number][]) {
    b.box(0.16, 0.14, 0.16, P.terracotta, { at: [x, yi - 0.05, z] });
  }
}

export const atriumHouse: BuildingDef = {
  id: 'atrium-house',
  name: 'Atrium house',
  style: 'Roman Republican',
  date: 'c. 200 BC',
  summary:
    'A well-off craftsman’s family now lives in an atrium house. Its rooms are ranged round a tall hall, the atrium, whose roof slopes ' +
    'inward to an opening that lets in light and rain; the rain falls into a shallow pool and drains to a cistern below, the household’s water. ' +
    'Across the atrium from the door is the tablinum, where the head of the family received callers and kept its records, and behind it a ' +
    'walled kitchen garden. The front rooms either side of the entrance are let as shops. The Romans themselves called this kind of atrium Tuscan.',
  materials: ['tufa ashlar front', 'rubble and lime mortar', 'timber roof frame', 'terracotta roof tiles', 'opus signinum floors'],
  influences: ['etruscan-legacy'],
  lookFor: [
    {
      label: 'Compluvium',
      note: 'The opening in the middle of the atrium roof, with the four slopes of tiles all falling inward toward it.',
      at: [1.5, 4.1, 2.8],
    },
    {
      label: 'Impluvium',
      note: 'A shallow stone-lined pool under the opening catches the rain and feeds the cistern beneath the floor; a well-head beside it draws the water up.',
      at: [-0.6, 0.35, 1.8],
    },
    {
      label: 'Fauces',
      note: 'The narrow entrance passage, its doorway framed by tufa pilasters with simple capitals; from the street you look straight through the atrium to the tablinum.',
      at: [0.95, 3.2, 8.55],
    },
    {
      label: 'Tabernae',
      note: 'The rooms on the street either side of the door are shops, closed at night with boards slid into a groove, with a mezzanine above for storage or a bed.',
      at: [-4.0, 1.6, 8.6],
    },
    {
      label: 'Hortus',
      note: 'Behind the house a walled kitchen garden with vegetables and fruit trees; the tablinum opens onto it through a wide window.',
      at: [3.6, 0.6, -6.4],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const zf = FRONT;
    const zr = 5.0; // back of the front range
    const zt = -1.4; // front of the tablinum range
    const zb = -4.4; // back wall of the house
    const H = 4.6;
    const tufa = tint(P.tufa, b.range(-0.03, 0.03));
    const plaster = b.pick([P.stucco, P.plaster, tint(P.intonacoCream, 0.04)]);
    const red = tint(P.intonacoRed, -0.04);
    const tile = tint(P.romanTile, b.range(-0.04, 0.02));

    // ---- front range: shops either side of the entrance, faced in tufa ashlar
    b.box(W, H, zf - zr, tufa, { at: [0, 0, (zf + zr) / 2] });
    for (let y = 0.55; y < H - 0.1; y += 0.55) b.box(W + 0.02, 0.04, 0.02, tint(tufa, -0.14), { at: [0, y, zf] }); // bed joints
    b.box(W + 0.04, 0.22, 0.1, tint(tufa, 0.06), { at: [0, H - 0.22, zf + 0.02] }); // cornice
    coppiRoof(b, W, zf - zr, 1.05, tile, { at: [0, H, (zf + zr) / 2], overhang: 0.35, ends: 0, wall: tufa, thick: 0.12 });

    // fauces: tall doorway between tufa pilasters with block capitals
    const dw = 1.6;
    b.panel(dw, 3.3, P.timberBlack, { at: [0, 0.15, zf], facing: '+z', depth: 0.02 });
    b.panel(dw - 0.1, 2.8, P.oakDark, { at: [0, 0.15, zf + 0.02], facing: '+z', depth: 0.04 });
    b.panel(0.04, 2.8, P.timberBlack, { at: [0, 0.15, zf + 0.06], facing: '+z', depth: 0.02 });
    for (const [x, y] of [[-0.35, 1.0], [0.35, 1.0], [-0.35, 2.0], [0.35, 2.0]] as [number, number][]) {
      b.box(0.08, 0.08, 0.06, P.bronze, { at: [x, y, zf + 0.07] });
    }
    b.sym((s) => {
      b.box(0.42, 3.35, 0.28, tint(tufa, 0.05), { at: [s * (dw / 2 + 0.21), 0, zf + 0.1] });
      b.box(0.6, 0.3, 0.42, tint(tufa, 0.08), { at: [s * (dw / 2 + 0.21), 3.35, zf + 0.12] });
    });
    b.box(dw + 1.4, 0.3, 0.4, tint(tufa, 0.08), { at: [0, 3.65, zf + 0.12] });
    b.box(dw + 0.4, 0.15, 0.5, P.travertine, { at: [0, 0, zf + 0.25] });

    // two tabernae with board shutters, one open, one closed, mezzanine windows above
    for (const s of [-1, 1] as const) {
      const cx = s * 4.0;
      const open = s < 0;
      b.box(3.3, 0.25, 0.5, P.oakDark, { at: [cx, 2.95, zf + 0.05] }); // lintel
      if (open) {
        b.panel(3.1, 2.95, P.windowDark, { at: [cx, 0, zf], facing: '+z', depth: 0.02 });
        // a masonry counter and wares
        b.box(2.2, 0.95, 0.55, tint(plaster, -0.04), { at: [cx - 0.3, 0, zf + 0.3] });
        b.box(2.3, 0.08, 0.62, P.travertine, { at: [cx - 0.3, 0.95, zf + 0.3] });
        for (const [x, c] of [[-1.1, P.terracotta], [-0.6, P.cream], [0.0, P.terracotta], [0.5, P.bronze]] as [number, number][]) {
          b.cyl(0.14, 0.32, c, { at: [cx + x, 1.03, zf + 0.3], rTop: 0.08, segs: 7 });
        }
        // the shutter boards stacked against the jamb
        for (let i = 0; i < 4; i++) b.box(0.32, 2.7, 0.05, tint(P.oak, i * 0.02), { at: [cx + 1.25 - i * 0.06, 0, zf + 0.1 + i * 0.06], rot: [-0.06, 0, 0] });
      } else {
        b.panel(3.1, 2.95, P.oakDark, { at: [cx, 0, zf], facing: '+z', depth: 0.02 });
        for (const x of spread(9, -1.55, 1.55)) b.panel(0.3, 2.85, tint(P.oak, b.range(-0.04, 0.04)), { at: [cx + x, 0.05, zf + 0.02], facing: '+z', depth: 0.03 });
      }
      b.box(3.3, 0.14, 0.12, P.travertine, { at: [cx, 0, zf + 0.06] }); // grooved sill
      b.window(0.7, 0.5, { at: [cx, 3.55, zf], facing: '+z', frame: P.oak, bars: [2, 1] });
    }
    // party-wall ends
    b.sym((s) => b.box(0.06, H, zf - zb, tint(tufa, -0.06), { at: [s * (X - 0.03), 0, (zf + zb) / 2] }));

    // ---- atrium: side rooms (cubicula and alae) under the inward-sloping roof
    const ax = 3.3;
    const sideH = 4.1;
    b.sym((s) => b.box(X - ax, sideH, zr - zt, plaster, { at: [s * (X + ax) / 2, 0, (zr + zt) / 2] }));
    // floor, impluvium and cistern head
    const cz = 1.8;
    pave(b, ax * 2, zr - zt, tint(P.intonacoRed, 0.15), [0, 0, (zr + zt) / 2]);
    b.box(3.0, 0.22, 2.0, P.travertine, { at: [0, 0, cz] });
    b.box(2.7, 0.24, 1.7, P.water, { at: [0, 0, cz], jitter: false });
    b.cyl(0.32, 0.7, P.travertine, { at: [-2.1, 0, cz + 1.4], segs: 8 });
    b.box(1.3, 0.8, 0.6, P.marble, { at: [0, 0, cz - 1.75] }); // the stone table (cartibulum)
    // inner faces of the atrium painted in panels
    b.sym((s) => {
      b.box(0.04, 1.0, zr - zt, red, { at: [s * (ax - 0.02), 0, (zr + zt) / 2] });
      b.panel(1.0, 2.2, P.timberBlack, { at: [s * ax, 0, 3.6], facing: s > 0 ? '-x' : '+x' });
      b.panel(1.0, 2.2, P.timberBlack, { at: [s * ax, 0, 0.2], facing: s > 0 ? '-x' : '+x' });
    });
    compluviateRoof(b, [-X, X, zt, zr], [-1.5, 1.5, cz - 1.0, cz + 1.0], H, 3.8, tile);

    // ---- tablinum range
    b.box(W, H, zt - zb, plaster, { at: [0, 0, (zt + zb) / 2] });
    b.box(W + 0.02, 0.9, zt - zb + 0.02, red, { at: [0, 0, (zt + zb) / 2] }); // red-painted socle
    coppiRoof(b, W, zt - zb, 1.05, tile, { at: [0, H, (zt + zb) / 2], overhang: 0.35, ends: 0, wall: plaster, thick: 0.12 });
    // the tablinum opens wide to the garden; small windows to the kitchen and a store
    b.panel(3.0, 3.2, P.windowDark, { at: [0, 0, zb], facing: '-z', depth: 0.02 });
    b.box(3.3, 0.25, 0.3, P.oakDark, { at: [0, 3.2, zb - 0.1] });
    b.box(3.0, 0.9, 0.12, P.oak, { at: [0, 0, zb - 0.08] }); // a low timber screen
    b.window(0.8, 0.6, { at: [-4.2, 2.2, zb], facing: '-z', frame: P.oak, bars: [2, 2] });
    b.window(0.8, 0.6, { at: [4.2, 2.2, zb], facing: '-z', frame: P.oak, bars: [2, 2] });
    b.panel(0.9, 2.0, P.oak, { at: [-2.4, 0, zb], facing: '-z' });

    // ---- hortus: a walled kitchen garden
    const gz0 = zb;
    const gz1 = -8.8;
    const gw = tint(plaster, -0.05);
    b.box(W, 2.4, 0.4, gw, { at: [0, 0, gz1 + 0.2] });
    b.sym((s) => b.box(0.4, 2.4, gz0 - gz1, gw, { at: [s * (X - 0.2), 0, (gz0 + gz1) / 2] }));
    b.box(W, 0.12, 0.55, tile, { at: [0, 2.4, gz1 + 0.2] });
    b.sym((s) => b.box(0.55, 0.12, gz0 - gz1, tile, { at: [s * (X - 0.2), 2.4, (gz0 + gz1) / 2] }));
    pave(b, 1.2, gz0 - gz1 - 0.4, P.gravel, [0, 0, (gz0 + gz1) / 2 - 0.2]);
    vegBed(b, -3.6, -6.6, 4.4, 3.2, { rows: 6 });
    vegBed(b, 3.6, -6.4, 4.4, 2.4, { rows: 5, color: P.leafDark });
    b.tree(b.range(3.4, 4.0), { at: [-4.8, 0, -7.4], kind: 'round', color: P.leafDark }); // a fig
    b.tree(b.range(3.0, 3.4), { at: [5.1, 0, -7.6], kind: 'olive' });
    for (let i = 0; i < 3; i++) b.cyl(0.25, 0.65, P.terracotta, { at: [1.2 + i * 0.6, 0, -8.2], rTop: 0.15, segs: 7 });
  },
};
