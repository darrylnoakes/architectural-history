import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { coppiRoof, FRONT, pave, persiane, plasterPick, shutterPick, washing } from './shared';

/** A cast-iron balcony railing w wide, depth d, standing on y at the wall z (front, facing +z). */
function railing(b: Builder, x: number, y: number, z: number, w: number, d: number): void {
  b.box(w, 0.06, 0.06, P.castIron, { at: [x, y + 0.95, z + d - 0.05] });
  b.box(w, 0.05, 0.05, P.castIron, { at: [x, y + 0.12, z + d - 0.05] });
  for (const u of spread(Math.round(w / 0.14), -w / 2, w / 2)) b.box(0.025, 0.85, 0.025, P.castIron, { at: [x + u, y + 0.1, z + d - 0.05], jitter: false });
  b.sym((s) => b.box(0.05, 0.05, d, P.castIron, { at: [x + s * (w / 2), y + 0.95, z + d / 2] }));
}

export const umbertineApartments: BuildingDef = {
  id: 'umbertine-apartments',
  name: 'Umbertine apartment house',
  style: 'Umbertine (late nineteenth century)',
  date: 'c. 1885',
  summary:
    'After unification the town became a provincial capital, the railway arrived and new quarters were laid out on a planned grid beyond ' +
    'the old walls. The clerk’s family now rents a flat in a palazzo of five storeys, built by a developer in the Neo-Renaissance manner ' +
    'named after King Umberto I (1878 to 1900). The shops below have a front of stucco cut to look like rusticated stone, the first floor ' +
    'has the best flats and the longest balcony, rents fall the higher you climb, and the windows have louvred shutters and iron balconies. ' +
    'A bracketed cornice crowns the front, and behind is a courtyard for light, air and the washing.',
  materials: ['brick', 'lime stucco and plaster', 'cast iron', 'timber louvred shutters', 'clay pan-and-cover tiles'],
  lookFor: [
    {
      label: 'Stucco rustication',
      note: 'The ground floor is plastered and cut with deep horizontal channels so that it looks like heavy blocks of stone.',
      at: [-6.0, 2.6, 8.5],
    },
    {
      label: 'Iron balconies',
      note: 'Stone slabs on brackets carry railings of cast iron, made cheaply by the new foundries; the longest balcony marks the best flat.',
      at: [0, 5.9, 9.3],
    },
    {
      label: 'Louvred shutters',
      note: 'Persiane: slatted wooden shutters that keep out the sun but let the air through, now on every window in the street.',
      at: [-3.85, 10.6, 8.5],
    },
    {
      label: 'Bracketed cornice',
      note: 'A deep cornice on a row of carved brackets, borrowed from the Renaissance palaces of Florence and Rome.',
      at: [3.0, 17.8, 9.1],
    },
    {
      label: 'Courtyard',
      note: 'Behind the block the flats look onto a paved court with a fountain, crossed by washing lines.',
      at: [0, 1.0, -4.6],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const zf = FRONT;
    const zb = -0.6;
    const D = zf - zb;
    const zc = (zf + zb) / 2;
    const g = 4.6;
    const fl = [3.6, 3.4, 3.3, 3.1];
    const ys = [g];
    for (const h of fl) ys.push(ys[ys.length - 1] + h);
    const H = ys[4];
    const plaster = plasterPick(b);
    const stucco = tint(b.pick([P.stucco, P.intonacoCream, tint(P.travertine, 0.02)]), -0.02);
    const shut = shutterPick(b);
    const glass = 0x3e4f60;
    const tile = tint(P.coppi, b.range(-0.05, 0.02));
    const bays = spread(5, -X, X);

    // ---- the block
    b.box(W, H, D, plaster, { at: [0, 0, zc] });
    // rusticated ground floor
    b.box(W, g, 0.1, stucco, { at: [0, 0, zf + 0.05] });
    for (let y = 0.5; y < g - 0.2; y += 0.5) b.box(W + 0.02, 0.07, 0.04, tint(stucco, -0.18), { at: [0, y, zf + 0.09] });
    b.box(W, 0.3, 0.3, stucco, { at: [0, g - 0.15, zf + 0.15] });
    // string courses and quoins
    for (const y of ys.slice(1, 4)) b.box(W, 0.16, 0.12, stucco, { at: [0, y - 0.06, zf + 0.06] });
    b.sym((s) => b.box(0.5, H - g, 0.06, stucco, { at: [s * (X - 0.25), g, zf + 0.03] }));
    // bracketed cornice
    b.box(W, 0.5, 0.12, stucco, { at: [0, H - 0.55, zf + 0.06] });
    for (const x of spread(20, -X + 0.15, X - 0.15)) {
      b.extrude([[0, 0], [0.7, 0], [0.7, -0.12], [0.25, -0.2], [0.12, -0.45], [0, -0.45]], 0.16, stucco, { at: [x, H, zf], rotY: -Math.PI / 2 });
    }
    b.box(W, 0.22, 0.85, stucco, { at: [0, H, zf + 0.42] });
    b.box(W, 0.12, 0.95, tint(stucco, 0.04), { at: [0, H + 0.22, zf + 0.47] });
    b.box(W, 0.3, 0.25, stucco, { at: [0, H - 0.3, zb - 0.12] });
    coppiRoof(b, W, D + 1.0, 1.7, tile, { at: [0, H + 0.34, zc + 0.15], overhang: 0.05, ends: 0, wall: plaster, thick: 0.12, step: 0.6 });
    b.box(W, 0.34, D + 0.6, plaster, { at: [0, H, zc - 0.1] });
    b.sym((s) => b.chimney(0.6, 1.6, 0.8, plaster, { at: [s * 4.0, H + 1.0, zc - 1.6], pots: 2, potColor: P.terracotta }));

    // ---- ground floor: shops under round arches with iron roller shutters, the portone in the middle
    for (const [i, x] of bays.entries()) {
      if (i === 2) {
        b.panel(2.3, 4.0, tint(stucco, -0.05), { at: [x, 0, zf + 0.1], facing: '+z', shape: 'round', depth: 0.05 });
        b.panel(1.9, 3.8, P.windowDark, { at: [x, 0, zf + 0.1], facing: '+z', shape: 'round', depth: 0.07 });
        b.panel(1.8, 2.8, b.pick([P.doorGreen, P.oakDark, 0x4b2e22]), { at: [x, 0, zf + 0.1], facing: '+z', depth: 0.09 });
        b.window(1.8, 0.95, { at: [x, 2.85, zf + 0.1], facing: '+z', shape: 'round', frame: P.castIron, glass, bars: [5, 1] });
        b.extrude([[-0.2, 0], [0.2, 0], [0.26, 0.5], [-0.26, 0.5]], 0.25, stucco, { at: [x, 3.6, zf + 0.25] });
        continue;
      }
      b.panel(2.0, 3.6, tint(stucco, -0.05), { at: [x, 0, zf + 0.1], facing: '+z', shape: 'round', depth: 0.05 });
      b.window(1.7, 3.4, { at: [x, 0, zf + 0.1], facing: '+z', shape: 'round', frame: P.castIron, glass, bars: [2, 2] });
      const up = [1.0, 2.6, 1.6, 2.2][i > 2 ? i - 1 : i];
      b.panel(1.7, 2.55 - up + 0.4, P.steel, { at: [x, up, zf + 0.1], facing: '+z', depth: 0.11 }); // roller shutter, part raised
      b.box(1.8, 0.25, 0.3, P.steel, { at: [x, 2.95, zf + 0.25] }); // its box
    }
    b.box(W, 0.12, 0.6, P.peperino, { at: [0, 0, zf + 0.3] }); // kerb of the pavement

    // ---- upper floors
    for (let f = 1; f <= 4; f++) {
      const y0 = ys[f - 1] + (f === 1 ? 0.55 : 0.45);
      const h = [2.5, 2.3, 2.1, 1.8][f - 1];
      for (const [i, x] of bays.entries()) {
        b.panel(1.45, h + 0.25, stucco, { at: [x, y0 - 0.1, zf], facing: '+z', depth: 0.05 });
        b.window(1.15, h, { at: [x, y0, zf], facing: '+z', frame: P.white, glass, bars: [2, 3] });
        persiane(b, 1.15, h, [x, y0, zf + 0.05], '+z', shut, { slats: f === 1 ? 4 : 3, closed: f === 4 && i % 2 === 1 });
        if (f === 1) {
          // aedicule: pediment over every window
          b.box(1.8, 0.14, 0.24, stucco, { at: [x, y0 + h + 0.2, zf + 0.12] });
          if (i === 2) b.panel(1.8, 0.45, stucco, { at: [x, y0 + h + 0.34, zf], facing: '+z', shape: 'segmental', depth: 0.2 });
          else b.extrude([[-0.9, 0], [0.9, 0], [0, 0.4]], 0.22, stucco, { at: [x, y0 + h + 0.34, zf + 0.12] });
        } else if (f === 2) {
          b.box(1.65, 0.12, 0.2, stucco, { at: [x, y0 + h + 0.15, zf + 0.1] });
        }
        if (f === 2 && i !== 2) {
          // a little balcony to each window
          b.box(1.6, 0.14, 0.55, P.travertine, { at: [x, ys[1] + 0.3, zf + 0.27] });
          railing(b, x, ys[1] + 0.44, zf, 1.5, 0.5);
        }
      }
    }
    // the long balcony of the first floor over the three middle bays, and the centre one on the second
    const by = ys[0] + 0.4;
    b.box(8.0, 0.18, 0.95, P.travertine, { at: [0, by, zf + 0.47] });
    for (const x of spread(7, -3.8, 3.8)) b.extrude([[0, 0], [0, -0.55], [0.2, -0.55], [0.85, -0.1], [0.85, 0]], 0.22, stucco, { at: [x, by, zf], rotY: -Math.PI / 2 });
    railing(b, 0, by + 0.18, zf, 7.9, 0.92);
    b.box(2.0, 0.15, 0.7, P.travertine, { at: [0, ys[1] + 0.3, zf + 0.35] });
    railing(b, 0, ys[1] + 0.45, zf, 1.9, 0.66);

    // ---- back: two short wings along the party walls round a courtyard
    const wz = -5.0;
    const ww = 3.0;
    b.sym((s) => {
      const cx = s * (X - ww / 2);
      b.box(ww, ys[3], zb - wz, plaster, { at: [cx, 0, (zb + wz) / 2] });
      b.box(ww, 0.25, zb - wz, stucco, { at: [cx, ys[3] - 0.25, (zb + wz) / 2] });
      b.shed(ww, zb - wz, 0.6, tile, { at: [cx, ys[3], (zb + wz) / 2], high: s > 0 ? '+x' : '-x' });
      const fx = s > 0 ? '-x' : '+x';
      for (let f = 0; f < 4; f++) {
        const y0 = f === 0 ? 0 : ys[f - 1] + 0.6;
        if (f === 0) b.panel(1.0, 2.3, P.oakDark, { at: [cx - s * (ww / 2), 0, (zb + wz) / 2], facing: fx });
        else {
          b.window(1.0, 1.7, { at: [cx - s * (ww / 2), y0, (zb + wz) / 2], facing: fx, frame: P.white, glass, bars: [2, 2] });
          persiane(b, 1.0, 1.7, [cx - s * (ww / 2), y0, (zb + wz) / 2], fx, shut, { slats: 1 });
        }
      }
      b.window(1.0, 1.6, { at: [cx, ys[1] + 0.6, wz], facing: '-z', frame: P.white, glass, bars: [2, 2] });
    });
    for (const x of [-2.0, 0, 2.0]) {
      for (let f = 1; f <= 4; f++) {
        const y0 = ys[f - 1] + 0.5;
        b.window(1.05, 1.8, { at: [x, y0, zb], facing: '-z', frame: P.white, glass, bars: [2, 2] });
        persiane(b, 1.05, 1.8, [x, y0, zb - 0.05], '-z', shut, { slats: 1 });
      }
    }
    b.panel(1.6, 2.8, P.windowDark, { at: [0, 0, zb], facing: '-z', shape: 'round' });
    b.window(1.0, 1.5, { at: [-2.0, 1.0, zb], facing: '-z', frame: P.white, glass, bars: [2, 2] });
    b.window(1.0, 1.5, { at: [2.0, 1.0, zb], facing: '-z', frame: P.white, glass, bars: [2, 2] });

    // courtyard
    const cz1 = -8.8;
    pave(b, W - 0.4, zb - cz1, P.paving, [0, 0, (zb + cz1) / 2]);
    b.box(W, 3.0, 0.35, plaster, { at: [0, 0, cz1 + 0.17] });
    b.sym((s) => b.box(0.35, 3.0, wz - cz1, plaster, { at: [s * (X - 0.17), 0, (wz + cz1) / 2] }));
    b.cyl(0.9, 0.5, P.travertine, { at: [0, 0, -4.6], segs: 12 });
    b.cyl(0.75, 0.52, P.water, { at: [0, 0, -4.6], segs: 12, jitter: false });
    b.cyl(0.1, 1.2, P.travertine, { at: [0, 0, -4.6], segs: 6 });
    b.tree(5.5, { at: [-4.6, 0, -7.4], kind: 'round', color: P.leafDark });
    b.box(2.0, 0.6, 0.6, P.hedge, { at: [3.6, 0, -8.2] });
    washing(b, [-X + 3.0, 8.0, -3.0], [X - 3.0, 8.0, -3.0], [P.white, 0xc9d6e3, P.white, P.cream, 0xd8a0a0, P.white]);
  },
};
