import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { pave, vegBed } from './shared';

/** A sliding screen of vertical timber slats in a steel frame, standing on y at z (front). */
function slatScreen(b: Builder, x: number, y: number, z: number, w: number, h: number, wood: number): void {
  b.box(w, 0.05, 0.06, P.steel, { at: [x, y, z] });
  b.box(w, 0.05, 0.06, P.steel, { at: [x, y + h - 0.05, z] });
  for (const u of spread(Math.round(w / 0.16), -w / 2, w / 2)) b.box(0.07, h - 0.1, 0.05, wood, { at: [x + u, y + 0.05, z], jitter: false });
}

export const lowEnergyFlats: BuildingDef = {
  id: 'low-energy-flats',
  name: 'Low-energy apartment house',
  style: 'Contemporary',
  date: 'c. 2016',
  summary:
    'A small block of flats built to the near-zero-energy standard that European rules were making compulsory for all new buildings by 2021: ' +
    'it uses almost no energy for heating and cooling. The structure is of cross-laminated timber panels, light, quick to put up, good in earthquakes and storing carbon instead ' +
    'of emitting it, as in the nine-storey social housing in Via Cenni, Milan (2013), the tallest timber housing in Italy when it was built. A thick coat of insulation under the render wraps the walls; deep ' +
    'loggias with sliding timber screens shade the glass in summer while letting the low winter sun in; and the roof is covered with ' +
    'photovoltaic panels that run the heat pumps.',
  materials: ['cross-laminated timber', 'external insulation and render', 'larch boarding', 'triple glazing', 'photovoltaic panels'],
  lookFor: [
    {
      label: 'Deep loggias',
      note: 'Balconies set back into the block, not hung on it: the floor above shades the windows from the high summer sun.',
      at: [-3.4, 5.2, 6.4],
    },
    {
      label: 'Sliding shading screens',
      note: 'Panels of timber slats run on rails across each loggia, closed against the afternoon sun and opened for the view.',
      at: [3.4, 8.6, 7.7],
    },
    {
      label: 'External insulation',
      note: 'A thick coat of insulation boards fixed outside the structure and rendered over (the cappotto), so the walls have no cold spots.',
      at: [-6.4, 10.0, 7.65],
    },
    {
      label: 'Photovoltaic roof',
      note: 'Rows of solar panels on the flat roof make electricity for the heat pumps, the lift and the flats.',
      at: [2.0, 16.0, 1.0],
    },
    {
      label: 'Timber structure',
      note: 'Walls and floors of cross-laminated timber; inside the loggias and on the ground floor the larch boarding shows what it is made of.',
      at: [-1.4, 1.6, 7.65],
    },
  ],
  build(b) {
    const W = 13.4;
    const X = W / 2;
    const zf = 7.6;
    const zb = -3.0;
    const ld = 1.7; // loggia depth
    const fh = 3.0;
    const nF = 5;
    const H = fh * nF;
    const render = tint(b.pick([P.whiteRender, 0xe9e4da, 0xdcd8cf, tint(P.intonacoRose, 0.12)]), -0.01);
    const larch = tint(b.pick([P.larch, P.cedar, P.oakSilver]), b.range(-0.03, 0.03));
    const screen = tint(larch, -0.04);
    const frame = b.pick([P.cladGrey, P.iron, P.steel]);
    const lx = [-3.4, 3.4];
    const lw = 4.8;

    // the main volume behind the loggias
    b.box(W, H, zf - ld - zb, render, { at: [0, 0, (zf - ld + zb) / 2] });
    // the front ranges either side of and between the loggias
    for (const [x, w] of [[-X + 0.4, 0.8], [0, 2.0], [X - 0.4, 0.8]] as [number, number][]) {
      b.box(w, H - fh, ld, x === 0 ? larch : render, { at: [x, fh, zf - ld / 2] });
    }
    // ground floor: larch-boarded, with the entrance, a bike store and a small shop
    b.box(W, fh, ld, larch, { at: [0, 0, zf - ld / 2] });
    for (const x of spread(40, -X, X)) b.box(0.04, fh - 0.1, 0.03, tint(larch, -0.1), { at: [x, 0, zf + 0.01], jitter: false });
    b.window(3.6, 2.6, { at: [-4.0, 0, zf + 0.02], facing: '+z', frame, glass: P.glassDark, bars: [3, 1] });
    b.window(1.8, 2.5, { at: [0.4, 0, zf + 0.02], facing: '+z', frame, glass: P.glassDark, bars: [1, 1] });
    b.panel(2.2, 2.4, frame, { at: [4.2, 0, zf + 0.02], facing: '+z', depth: 0.05 });
    for (const x of spread(10, 3.2, 5.2)) b.box(0.04, 2.2, 0.04, P.steel, { at: [x, 0.1, zf + 0.08], jitter: false });
    b.box(2.4, 0.12, 1.2, frame, { at: [0.4, 2.7, zf + 0.6] }); // canopy
    pave(b, W, 1.4, P.paving, [0, 0, zf + 0.7]);
    for (const x of [3.2, 3.9, 4.6, 5.3]) b.box(0.05, 0.8, 0.6, P.steel, { at: [x, 0, zf + 0.6] }); // bike stands

    // loggias on the four upper floors
    for (let f = 1; f < nF; f++) {
      const y = f * fh;
      b.box(W, 0.3, ld + 0.1, render, { at: [0, y - 0.15, zf - ld / 2 + 0.05] }); // floor slab edge
      for (const [k, x] of lx.entries()) {
        const zr = zf - ld;
        // the recessed wall: timber-boarded, with full-height glazing
        b.box(lw, fh - 0.3, 0.05, larch, { at: [x, y + 0.15, zr + 0.03] });
        b.window(2.4, 2.4, { at: [x - 0.9, y + 0.15, zr + 0.05], facing: '+z', frame, glass: P.glassDark, bars: [2, 1] });
        b.window(1.0, 2.4, { at: [x + 1.5, y + 0.15, zr + 0.05], facing: '+z', frame, glass: P.glassDark });
        b.box(lw, 0.04, ld, larch, { at: [x, y + fh - 0.2, zf - ld / 2] }); // soffit
        // glass balustrade and rails for the screens
        b.box(lw, 1.0, 0.04, P.glass, { at: [x, y + 0.15, zf - 0.1], mat: 'glass' });
        b.box(lw, 0.05, 0.08, P.steel, { at: [x, y + 1.15, zf - 0.1] });
        b.box(lw, 0.06, 0.08, P.steel, { at: [x, y + fh - 0.36, zf + 0.02] });
        // two sliding screens, parked at different places on each floor
        const slide = [[-1.6, -0.0], [1.6, 0.0], [-1.6, 1.6], [0.0, 1.6]][(f + k * 2) % 4];
        for (const s of slide) slatScreen(b, x + s, y + 0.15, zf + 0.03, 1.6, fh - 0.5, screen);
        if ((f + k) % 3 === 0) b.blob(0.4, P.leaf, { at: [x - 1.8, y + 0.6, zf - 0.6], detail: 0 });
      }
    }
    // roof: parapet, photovoltaic arrays tilted to the sun, a plant room
    b.box(W, 0.6, zf - zb, render, { at: [0, H, (zf + zb) / 2] });
    b.box(W - 0.6, 0.62, zf - zb - 0.6, tint(P.gravel, -0.05), { at: [0, H, (zf + zb) / 2] });
    for (const z of [5.4, 3.0, 0.6, -1.8]) {
      b.group({ at: [0.6, H + 0.75, z], rot: [0.3, 0, 0] }, () => {
        b.box(10.4, 0.06, 1.7, P.solar, { at: [0, 0, 0], mat: 'glass' });
        for (const x of spread(6, -5.2, 5.2)) b.box(0.03, 0.07, 1.7, P.aluminium, { at: [x + 0.87, 0, 0] });
      });
      b.box(10.4, 0.15, 0.1, P.aluminium, { at: [0.6, H + 0.6, z + 0.8] });
    }
    b.box(2.0, 2.0, 2.4, larch, { at: [-5.4, H + 0.6, -1.4] }); // lift head and plant room

    // back: windows punched in the insulated wall, a few small balconies
    for (let f = 0; f < nF; f++) {
      const y = f * fh;
      for (const x of [-4.6, -1.4, 1.8, 4.8]) {
        b.window(1.3, f === 0 ? 2.4 : 1.8, { at: [x, y + (f === 0 ? 0.1 : 0.7), zb], facing: '-z', frame, glass: P.glassDark, bars: [1, 1] });
      }
      if (f > 0) {
        b.box(3.2, 0.2, 1.2, render, { at: [-3.0, y, zb - 0.6] });
        b.box(3.2, 1.0, 0.04, P.glass, { at: [-3.0, y + 0.2, zb - 1.18], mat: 'glass' });
      }
    }
    // shared garden: vegetable plots, a rain garden, fruit trees, bike shelter
    pave(b, 2.0, 5.8, P.gravel, [0, 0, -5.9]);
    vegBed(b, -4.0, -5.0, 3.6, 2.0, { rows: 5, alongX: false });
    vegBed(b, -4.0, -7.6, 3.6, 2.0, { rows: 5, color: P.leafDark });
    b.box(3.6, 0.05, 4.4, P.meadow, { at: [4.0, 0, -6.2] });
    b.box(1.8, 0.07, 1.4, P.water, { at: [3.4, 0, -5.4], jitter: false });
    b.tree(b.range(3.2, 3.8), { at: [5.2, 0, -7.6], kind: 'olive' });
    b.tree(b.range(3.0, 3.6), { at: [2.6, 0, -7.9], kind: 'round' });
    b.box(W, 1.2, 0.2, larch, { at: [0, 0, -8.8] });
  },
};
