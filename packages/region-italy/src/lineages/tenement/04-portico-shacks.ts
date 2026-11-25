import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { hurdles, patch, patchwork, PORTICO, rubbleHeap, streetKerb, streetPortico } from './shared';

const NC = PORTICO.n; // column positions along the old portico
const SP = PORTICO.sp;
const ZC = PORTICO.z; // column line
const ZW = 4.4; // back wall of the portico: the front wall of the fallen insula (front face)

export const porticoShacks: BuildingDef = {
  id: 'portico-shacks',
  name: 'Shacks in a ruined portico',
  style: 'Late Antique',
  date: 'c. 450 to 800',
  summary:
    'As the western empire failed, the town shrank to a fraction of its size. The insula, unrepaired, fell in on itself, and the poor moved into the shops of its ground floor and the shelter of its street portico, which nobody was keeping up any more. ' +
    'Between its columns they built one-room shacks of timber posts, boards and brick pulled from the ruins, roofed with salvaged tiles leaning on the old back wall. ' +
    'Archaeologists find such huts in the forums and porticoes of Rome and many other towns from the fifth and sixth centuries on, often beside a kiln burning the marble for lime.',
  materials: ['reused brick and tufa', 'timber posts and boards', 'salvaged roof tiles', 'marble and granite columns'],
  lookFor: [
    { label: 'Ruined portico', note: 'The street portico of the fallen insula, half fallen itself; its columns were too heavy to carry off.', at: [-9.0, 4.2, ZC + 0.4] },
    { label: 'Walls of reused brick', note: 'The shack walls are pieced together from brick, tufa and marble taken from the ruins round about.', at: [-5.4, 1.0, ZC - 0.4] },
    { label: 'Lean-to roofs', note: 'Salvaged tiles and boards slope from the broken front wall of the block down to the colonnade.', at: [1.8, 3.2, 5.6] },
    { label: 'Fallen insula', note: 'Behind, the block of flats has collapsed into a mound of brick and concrete; a garden is dug into it.', at: [3.6, 3.4, -4.4] },
    { label: 'Lime kiln', note: 'Marble from statues and inscriptions was burnt here to make lime for mortar: the ruins fed the new building.', at: [-10.0, 2.6, -4.6] },
  ],
  influences: [],
  build(b) {
    const brick = P.brickOrange;
    const col = b.pick([P.granite, P.marble, P.peperino]);
    const x0 = -((NC - 1) * SP) / 2;

    // the old street and the portico floor: worn paving, earth over it in places
    patch(b, 26, 8 - ZC - 0.55, tint(P.paving, -0.08), [0, (ZC + 0.55 + 8) / 2], 0.05);
    patch(b, 26, ZC - ZW, tint(P.travertine, -0.12), [0, (ZW + ZC) / 2], 0.06);
    patch(b, 26, 8 + ZW, tint(P.earth, 0.02), [0, (ZW - 8) / 2], 0.03);
    streetKerb(b, P.travertine);

    // the insula's street portico: one column missing, one fallen, the rest standing; the entablature
    // still bridges the left three
    const fallen = 4;
    const missing = 5;
    streetPortico(b, col, { keep: (i) => i !== fallen && i !== missing, bays: (i) => i <= 1 });
    const xf = x0 + fallen * SP;
    b.cyl(0.32, 1.3, col, { at: [xf, PORTICO.base, ZC], segs: 10, rTop: 0.3 });
    b.log(0.3, 2.4, col, { at: [xf + 1.0, 0, ZC + 0.75], segs: 10, rotY: 0.2 });
    const ey = PORTICO.base + PORTICO.ch;
    b.box(1.2, PORTICO.top - ey, 0.75, P.travertine, { at: [x0 + SP * 6 - 0.1, ey, ZC], rotY: 0.05 });
    // a broken block of the entablature lying in the portico
    b.box(1.6, 0.38, 0.75, P.travertine, { at: [x0 + SP * 4.6, 0.05, ZC - 0.9], rotY: 0.5, rot: [0, 0, 0.12] });

    // the front wall of the fallen block, brick-faced concrete standing to ragged heights, its shop
    // doors and the old main doorway open behind the shacks
    const segs = [4.4, 3.4, 3.9, 2.8, 4.2, 3.2, 2.6];
    const wl = 22.0;
    for (let k = 0; k < segs.length; k++) {
      const sw = wl / segs.length;
      const x = -wl / 2 + (k + 0.5) * sw;
      const h = segs[k] + b.range(-0.3, 0.3);
      b.box(sw + 0.02, h, 0.7, brick, { at: [x, 0, ZW - 0.35] });
      b.box(sw * 0.6, 0.4, 0.75, tint(brick, -0.06), { at: [x + b.range(-0.4, 0.4), h, ZW - 0.35] });
    }
    for (const x of [-9.43, -3.14, 3.14, 9.43]) b.panel(2.35, 2.65, tint(brick, -0.25), { at: [x, 0.15, ZW], facing: '+z', depth: 0.02 });
    b.panel(1.6, 2.8, tint(brick, -0.25), { at: [0, 0.15, ZW], facing: '+z', shape: 'round', depth: 0.02 });

    // the shacks: groups of bays between the back wall and the colonnade
    const shacks: [number, number][] = [
      [0, 2],
      [2, 3],
      [3, 4],
    ];
    if (b.chance(0.6)) shacks.push([5.15, 6]);
    for (const [a, c] of shacks) {
      const xl = x0 + a * SP + 0.35;
      const xr = x0 + c * SP - 0.35;
      const w = xr - xl;
      const xm = (xl + xr) / 2;
      const zf = ZC - 0.5;
      const hf = 2.4;
      const hb = 3.4;
      const tiles = b.chance(0.7);
      const roof = tiles ? b.pick([P.romanTile, tint(P.romanTile, -0.06), P.coppi]) : b.pick([P.oak, P.shingle]);
      // front wall: reused masonry below, boards above, a plank door and a shuttered hole
      patchwork(b, w, 1.05, 0.3, [xm, 0, zf]);
      b.box(w, hf - 1.05, 0.12, b.pick([P.oakSilver, P.oak, tint(P.oakSilver, -0.1)]), { at: [xm, 1.05, zf] });
      for (let k = 1; k < Math.round(w / 0.3); k++) b.panel(0.03, hf - 1.05, P.oakDark, { at: [xl + k * 0.3, 1.05, zf + 0.06], facing: '+z', depth: 0.02 });
      const dx = xl + b.range(0.7, w - 0.7);
      b.panel(0.85, 1.85, P.oakDark, { at: [dx, 0.06, zf + 0.16], facing: '+z', depth: 0.06 });
      const wx = dx > xm ? xl + 0.7 : xr - 0.7;
      b.panel(0.6, 0.5, P.timberBlack, { at: [wx, 1.35, zf + 0.06], facing: '+z', depth: 0.03 });
      b.panel(0.32, 0.5, P.oak, { at: [wx + 0.48, 1.35, zf + 0.08], facing: '+z', depth: 0.04 });
      // side walls of boards on posts
      for (const sx of [xl, xr]) {
        b.group({ at: [sx, 0, 0], rotY: -Math.PI / 2 }, () =>
          b.extrude(
            [
              [ZW, 0],
              [zf, 0],
              [zf, hf],
              [ZW, hb],
            ],
            0.12,
            tint(P.oakSilver, -0.08),
          ),
        );
        b.box(0.16, hf + 0.2, 0.16, P.oakDark, { at: [sx, 0, zf] });
      }
      // lean-to roof from the old wall down to the front
      b.beam([xm, hb + 0.05, ZW - 0.1], [xm, hf + 0.05, zf + 0.6], w + 0.4, 0.12, roof);
      {
        for (let k = 0; k <= Math.round(w / 0.45); k++) {
          const rx = xl - 0.15 + ((w + 0.3) * k) / Math.round(w / 0.45);
          b.beam([rx, hb + 0.16, ZW - 0.05], [rx, hf + 0.16, zf + 0.55], 0.1, 0.06, tint(roof, 0.05));
        }
      }
      // stones on the roof to hold it down
      for (let k = 0; k < 3; k++) b.box(0.25, 0.15, 0.2, P.rubble, { at: [xl + b.range(0.3, w - 0.3), (hf + hb) / 2 + 0.12, (zf + ZW) / 2 + b.range(-0.6, 0.6)] });
    }

    // the fallen insula behind: a mound of rubble with stubs of brick wall, a garden dug into it
    b.blob(5.0, mix(P.rubble, P.earth, 0.45), { at: [5.3, -0.6, -4.6], stretch: [1.4, 0.55, 0.6], detail: 1 });
    b.blob(2.6, P.grassDry, { at: [8.6, 0.2, -5.4], stretch: [1.2, 0.5, 0.8], detail: 0 });
    b.blob(3.0, mix(P.rubble, P.earth, 0.3), { at: [2.0, -0.4, 1.6], stretch: [1.6, 0.5, 0.6], detail: 0 });
    for (const [x, z, w, h] of [
      [1.2, -6.8, 4.0, 4.6],
      [8.8, -7.4, 3.0, 3.2],
      [11.5, -3.8, 0.6, 2.6],
    ]) {
      b.box(w, h, 0.6, brick, { at: [x, 0, z] });
      b.panel(0.9, 1.2, tint(brick, -0.25), { at: [x, Math.min(h - 1.5, 2.2), z + 0.3], facing: '+z', depth: 0.02 });
    }
    rubbleHeap(b, -1.8, -2.2, 1.1);
    rubbleHeap(b, 10.8, 2.2, 0.9);
    // vegetable beds and a hurdle fence on the near side of the mound
    for (let k = 0; k < 4; k++) patch(b, 3.6, 0.6, P.soil, [-5.2, -1.6 - k * 1.0], 0.1);
    for (let k = 0; k < 8; k++) b.blob(0.22, P.leaf, { at: [-6.6 + (k % 4) * 0.95, 0.2, -1.6 - Math.floor(k / 4) * 2.0], detail: 0 });
    hurdles(b, [-7.4, -0.8], [-7.4, -5.2], { h: 0.9 });
    hurdles(b, [-7.4, -5.2], [-2.8, -5.2], { h: 0.9 });

    // the lime kiln: a squat round tower with a stoking arch, marble waiting to be burnt
    b.cyl(1.5, 2.5, tint(P.tufa, -0.04), { at: [-10.0, 0, -4.6], rTop: 1.25, segs: 10 });
    b.cyl(1.0, 0.1, P.timberBlack, { at: [-10.0, 2.45, -4.6], segs: 10 });
    b.panel(0.8, 1.0, P.timberBlack, { at: [-10.0, 0, -3.15], facing: '+z', shape: 'round', depth: 0.05 });
    for (let k = 0; k < 5; k++) {
      b.box(b.range(0.4, 0.8), 0.35, b.range(0.3, 0.6), P.marble, { at: [-11.6 + b.range(0, 1.2), (k % 2) * 0.3, -2.4 + b.range(-0.5, 0.5)], rotY: b.range(0, 3) });
    }
    b.log(0.28, 1.1, P.marble, { at: [-8.0, 0, -2.6], rotY: 0.8, segs: 8 }); // a column drum for the kiln

    // a hearth outside the shacks, a goat, a cypress grown up at the end of the portico
    b.cyl(0.4, 0.08, P.timberBlack, { at: [-1.5, 0.06, 6.75], segs: 8 });
    b.lathe(
      [
        [0.01, 0],
        [0.2, 0.04],
        [0.25, 0.22],
        [0.17, 0.34],
      ],
      P.mud,
      { at: [-1.5, 0.13, 6.75], segs: 8 },
    );
    b.group({ at: [5.4, 0.06, 6.2], rotY: 0.6 }, () => {
      for (const [lx, lz] of [
        [0.2, 0.1],
        [0.2, -0.1],
        [-0.2, 0.1],
        [-0.2, -0.1],
      ]) b.box(0.05, 0.35, 0.05, P.timberBlack, { at: [lx, 0, lz] });
      b.blob(0.27, P.oakDark, { at: [0, 0.5, 0], stretch: [1.5, 0.85, 0.9], detail: 0 });
      b.box(0.15, 0.22, 0.13, P.timberBlack, { at: [0.46, 0.55, 0] });
    });
    b.tree(7, { at: [12.2, 0, 4.2], kind: 'cypress' });

    b.collider(wl, 0.8, { at: [0, 0, ZW - 0.35] });
    for (const [a, c] of shacks) b.collider((c - a) * SP - 0.6, ZC - 0.5 - ZW, { at: [x0 + ((a + c) / 2) * SP, 0, (ZC - 0.5 + ZW) / 2] });
    b.collider(12, 4.5, { at: [5.5, 0, -5.0] });
    b.collider(3.2, 3.2, { at: [-10.0, 0, -4.6] });
  },
};
