import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { PW, patch, railing } from './shared';

const FH = 3.0;
const G = 3.4; // shared ground floor, taller
const ZF = 6.0; // street block front
const ZR = 0.0; // its back
const XW = 5.8; // where the wing starts
const XE = 12.4;
const WZ = -6.8; // back of the wing

/**
 * A run of flats facing `f` along a wall: each bay a recessed loggia lined in a strong colour with a
 * sliding timber screen, or a tall window. Wall from a0 to a1 at `wall` (axis X when facing ±z).
 */
function flats(b: Builder, a0: number, a1: number, wall: number, f: '+z' | '-z' | '+x' | '-x', floors: number, colours: number[], seed: number): void {
  const alongX = f === '+z' || f === '-z';
  const s = f === '+z' || f === '+x' ? 1 : -1;
  const n = Math.round((a1 - a0) / 3.2);
  const bw = (a1 - a0) / n;
  for (let fl = 0; fl < floors; fl++) {
    const y = G + fl * FH;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k + 0.5) * bw;
      const loggia = (k + fl + seed) % 2 === 0;
      const at = (along: number, out: number, yy: number): [number, number, number] => (alongX ? [along, yy, wall + s * out] : [wall + s * out, yy, along]);
      if (loggia) {
        const c = colours[(k + fl * 2 + seed) % colours.length];
        b.panel(bw - 0.5, FH - 0.2, c, { at: at(a, 0, y + 0.1), facing: f, depth: 0.03 });
        b.window(1.4, 2.3, { at: at(a - 0.5, 0.02, y + 0.2), facing: f, frame: P.cladGrey, glass: P.glassDark, mat: 'glass', border: 0.05 });
        // slatted timber sliding screen, half open
        b.panel(0.9, 2.5, P.larch, { at: at(a + bw / 2 - 0.75, 0.1, y + 0.15), facing: f, depth: 0.05 });
        for (let j = 0; j < 4; j++) b.panel(0.04, 2.5, tint(P.larch, -0.15), { at: at(a + bw / 2 - 1.1 + j * 0.23, 0.14, y + 0.15), facing: f, depth: 0.03 });
        railing(b, at(a - bw / 2 + 0.3, 0.06, y + 0.05), at(a + bw / 2 - 0.3, 0.06, y + 0.05), 1.05, P.cladGrey, 0.5);
        b.panel(bw - 0.6, 1.0, P.glass, { at: at(a, 0.08, y + 0.08), facing: f, depth: 0.02, mat: 'glass' });
      } else {
        b.window(1.2, 2.2, { at: at(a, 0, y + 0.3), facing: f, frame: P.cladGrey, glass: P.glassDark, mat: 'glass', border: 0.06 });
        b.panel(1.2, 0.08, P.cladGrey, { at: at(a, 0.05, y + 0.25), facing: f, depth: 0.12 });
      }
    }
  }
}

export const socialHousingToday: BuildingDef = {
  id: 'social-housing-today',
  name: 'Social housing today',
  style: 'Contemporary',
  date: 'c. 2018',
  summary:
    'After the big estates, public housing in Italy shrank to small projects, often on gaps in the existing city and paid for in part by private investors and foundations (housing sociale). ' +
    'This block keeps to the height of the street, four storeys or fewer, and wraps the flats in a thick coat of insulation so that tenants can afford to heat them; each flat has a deep loggia lined in colour and shaded by sliding timber screens. ' +
    'The ground floor is given to the residents in common, a glazed room for meetings, children and a shared laundry opening onto the garden, and the roof carries solar panels.',
  materials: ['concrete or timber structure', 'external insulation with render', 'larch screens', 'glass', 'photovoltaic panels'],
  lookFor: [
    { label: 'Coloured loggias', note: 'Deep recessed balconies lined in colour, so every flat has an outdoor room and the block reads as homes, not a grid.', at: [-8.0, G + FH + 1.6, ZF + 0.3] },
    { label: 'Sliding timber screens', note: 'Slatted larch panels slide across the loggias to shade them in summer.', at: [-4.6, G + 1.5, ZF + 0.4] },
    { label: 'Shared ground floor', note: 'A glazed common room, laundry and bicycle store for all the tenants instead of private flats at street level.', at: [-2.0, 1.6, ZF + 0.3] },
    { label: 'Solar roof', note: 'Photovoltaic panels on the flat roof supply the common parts and the heat pumps.', at: [-3.0, G + FH * 3 + 1.4, 3.0] },
    { label: 'Thick insulated walls', note: 'The render covers a thick layer of insulation: the walls are about twice as thick as those of the 1950s blocks.', at: [XE + 0.1, 6.0, -3.0] },
  ],
  influences: [],
  build(b) {
    const render = b.pick([P.whiteRender, P.intonacoCream, tint(P.whiteRender, -0.04)]);
    const palette = b.pick([
      [P.cladYellow, P.intonacoSienna, P.cladGreen],
      [P.cladRed, P.cladYellow, P.intonacoOchre],
      [P.cladBlue, P.cladYellow, P.intonacoRose],
    ]);
    const seed = Math.floor(b.rand() * 2);

    patch(b, PW, 8 - ZF, P.paving, [0, (ZF + 8) / 2], 0.1);
    patch(b, XW + 12.6, 8 + ZR, P.grass, [(XW - 12.6) / 2, (ZR - 8) / 2], 0.03);

    // street block: four storeys over the common ground floor
    const sw = XE + 12.4;
    const sx = (XE - 12.4) / 2;
    const top = G + FH * 3;
    b.box(sw, top - G, ZF - ZR, render, { at: [sx, G, (ZF + ZR) / 2] });
    b.box(sw, G, ZF - ZR - 0.8, tint(render, -0.04), { at: [sx, 0, (ZF + ZR) / 2] });
    b.box(sw + 0.1, 0.4, ZF - ZR + 0.1, P.cladGrey, { at: [sx, top, (ZF + ZR) / 2] });
    flats(b, -12.4, XE, ZF, '+z', 3, palette, seed);
    flats(b, -12.4, XW, ZR, '-z', 3, palette, seed + 1);
    // the glazed common ground floor, a timber canopy over the door
    b.window(sw - 6.0, 2.8, { at: [sx - 2.5, 0.1, ZF - 0.4], facing: '+z', frame: P.larch, glass: P.glassDark, bars: [8, 1], mat: 'glass', border: 0.08 });
    b.panel(1.6, 2.5, P.larch, { at: [XE - 2.4, 0.05, ZF - 0.4], facing: '+z', depth: 0.06 });
    b.box(3.4, 0.2, 1.6, P.larch, { at: [XE - 2.4, 2.8, ZF + 0.4] });
    b.panel(3.0, 0.4, palette[0], { at: [-9.6, 2.95, ZF - 0.4], facing: '+z', depth: 0.05 });
    // garden side of the ground floor
    b.window(XW + 11.0, 2.8, { at: [(XW - 12.4) / 2 + 0.6, 0.1, ZR + 0.4], facing: '-z', frame: P.larch, glass: P.glassDark, bars: [6, 1], mat: 'glass', border: 0.08 });

    // the wing back into the garden: three storeys
    const wtop = G + FH * 2;
    const ww = XE - XW;
    const wzc = (ZR + WZ) / 2;
    b.box(ww, wtop, ZR - WZ, render, { at: [(XW + XE) / 2, 0, wzc] });
    b.box(ww + 0.1, 0.4, ZR - WZ + 0.1, P.cladGrey, { at: [(XW + XE) / 2, wtop, wzc] });
    flats(b, WZ, ZR, XW, '-x', 2, palette, seed);
    for (let fl = 0; fl < 3; fl++) for (const z of [-5.4, -3.2, -1.0]) b.window(1.0, 1.8, { at: [XE, (fl === 0 ? 0.4 : G + (fl - 1) * FH) + 0.4, z], facing: '+x', frame: P.cladGrey, glass: P.glassDark, border: 0.06 });
    b.window(3.2, 2.6, { at: [(XW + XE) / 2, 0.1, WZ], facing: '-z', frame: P.larch, glass: P.glassDark, bars: [3, 1], mat: 'glass', border: 0.08 });

    // solar panels on both roofs, tilted to the south (here the front)
    const pv = (x0: number, x1: number, z0: number, z1: number, y: number) => {
      for (let z = z0; z < z1 - 1.0; z += 1.6) {
        for (let x = x0; x < x1 - 1.0; x += 2.1) b.box(2.0, 0.06, 1.1, P.solar, { at: [x + 1.0, y + 0.45, z + 0.7], rot: [-0.3, 0, 0], mat: 'glass' });
      }
    };
    pv(-11.8, XE - 0.6, ZR + 0.6, ZF - 0.4, top + 0.4);
    pv(XW + 0.6, XE - 0.6, WZ + 0.6, ZR - 0.4, wtop + 0.4);
    b.box(2.0, 1.4, 1.6, P.cladGrey, { at: [9.4, top + 0.4, 1.4] }); // lift overrun

    // the garden: trees, raised beds, benches, bicycles shelter
    b.tree(4.2, { at: [-8.0, 0, -4.6], kind: 'olive' });
    b.tree(3.6, { at: [-2.0, 0, -6.0], kind: 'olive' });
    b.tree(6.5, { at: [2.6, 0, -4.0], kind: 'round' });
    for (let k = 0; k < 3; k++) {
      b.box(2.4, 0.5, 1.0, P.larch, { at: [-11.0 + k * 3.0, 0, -2.0] });
      b.box(2.2, 0.06, 0.8, P.soil, { at: [-11.0 + k * 3.0, 0.5, -2.0] });
    }
    b.box(2.0, 0.45, 0.5, P.larch, { at: [-4.6, 0, -2.4] });
    b.box(3.6, 0.1, 2.0, P.cladGrey, { at: [-0.2, 2.2, -6.6] });
    for (const x of [-1.8, 1.4]) b.box(0.08, 2.2, 0.08, P.cladGrey, { at: [x, 0, -7.4] });
    b.collider(sw, ZF - ZR, { at: [sx, 0, (ZF + ZR) / 2] });
    b.collider(ww, ZR - WZ, { at: [(XW + XE) / 2, 0, wzc] });
  },
};
