import { P, tint, type BuildingDef } from '@ah/kit';

const POD = 3.4; // podium height
const FH = 2.65; // floor-to-floor height
const SW = 17.6; // slab width (X)
const SD = 9.6; // slab depth (Z)
const SX = -3.6; // slab centre X
const TW = 4.4; // service tower width
const TX = 9.9; // service tower centre X
const TZ = -1.6;

export const towerBlock: BuildingDef = {
  id: 'tower-block',
  name: 'Council tower block',
  style: 'Post-war Modernism (Brutalist)',
  date: 'c. 1966',
  summary:
    'Slum clearance swept away the old terraces, and councils, pushed by government subsidies that paid more for every extra storey, rehoused people in towers of flats. ' +
    'This one is a slab of reinforced concrete flats on a podium of shops and garages, with its lifts and stairs pulled out into a separate service tower joined by bridges every third floor, an idea taken from Ernő Goldfinger’s Balfron and Trellick towers. ' +
    'Every flat had hot water, a bathroom and a balcony with a view; the cottage row has become a street stood on end. ' +
    'After the gas explosion at Ronan Point in 1968, and years of poor maintenance, the tower block lost public trust, though many, like Trellick, are now listed and loved.',
  materials: ['reinforced concrete', 'board-marked and bush-hammered concrete', 'steel windows'],
  modelledOn: 'Balfron Tower, Poplar (1967) and Trellick Tower, Kensington (1972), by Ernő Goldfinger, simplified',
  lookFor: [
    { label: 'Service tower', note: 'Lifts, stairs and rubbish chutes are in a separate tower, so the noise and traffic stay out of the flats.', at: [TX, 30, TZ + 2.3] },
    { label: 'Access bridges', note: 'Bridges every third floor link the service tower to internal corridors; flats are reached up or down a short stair from them.', at: [7.2, POD + FH * 9 + 1.4, TZ] },
    { label: 'Boiler house', note: 'The jutting box at the top of the service tower held the boilers for the whole block, a signature of Goldfinger’s towers.', at: [TX - 1.8, 41.5, TZ + 2.6] },
    { label: 'Balconies', note: 'Every flat has its own concrete balcony: a substitute for the back yard and garden it replaced.', at: [SX - 4.4, POD + FH * 5 + 0.9, SD / 2 + 1.3] },
    { label: 'Podium', note: 'A deck of shops and garages under the flats, separating cars from people as the planners of the 1960s wanted.', at: [0, 1.8, 6.6] },
  ],
  influences: ['corbusian-brutalism', 'continental-modernism'],
  build(b) {
    const floors = b.variant === 0 ? 13 : b.pick([11, 12, 13]);
    const conc = b.pick([P.concrete, tint(P.concrete, 0.03), tint(P.concrete, -0.03)]);
    const dark = P.concreteDark;
    const top = POD + floors * FH;
    const zf = SD / 2;
    const zb = -SD / 2;

    // podium: concrete deck over shops and garages, nearly the whole plot
    b.box(25.4, POD, 13.4, dark, { at: [0, 0, 0] });
    b.box(25.8, 0.45, 13.8, conc, { at: [0, POD - 0.45, 0] });
    const shopW = 3.6;
    for (let i = 0; i < 6; i++) {
      const x = -10.5 + i * (shopW + 0.6);
      b.window(shopW, 2.4, { at: [x, 0.1, 6.7], facing: '+z', frame: P.aluminium, glass: P.glassDark, mat: 'glass', bars: [2, 1], border: 0.08 });
      b.panel(shopW, 0.4, b.pick([P.cladRed, P.cladBlue, P.cladYellow, P.cladWhite, P.cladGreen]), { at: [x, 2.55, 6.7], facing: '+z' });
    }
    for (let i = 0; i < 6; i++) b.panel(2.6, 2.2, P.cladGrey, { at: [-9.5 + i * 3.4, 0, -6.7], facing: '-z' });
    // deck railing on the podium roof
    b.box(25.4, 1.0, 0.08, P.castIron, { at: [0, POD, 6.85] });
    b.box(0.08, 1.0, 13.4, P.castIron, { at: [-12.85, POD, 0] });
    b.box(0.08, 1.0, 13.4, P.castIron, { at: [12.85, POD, 0] });

    // slab of flats
    b.box(SW, floors * FH, SD, conc, { at: [SX, POD, 0] });
    b.box(SW + 0.3, 0.9, SD + 0.3, conc, { at: [SX, top, 0] }); // roof parapet
    const bays = 6;
    const bw = SW / bays;
    for (let f = 0; f < floors; f++) {
      const y = POD + f * FH;
      // front: floor-edge band, window strip, then balconies on alternate bays
      b.box(SW + 0.1, 0.32, 0.25, tint(conc, 0.04), { at: [SX, y, zf + 0.12] });
      b.window(SW - 0.4, 1.6, { at: [SX, y + 0.75, zf], facing: '+z', frame: tint(conc, 0.02), glass: P.windowDark, bars: [bays, 1], border: 0.06 });
      for (let k = 0; k < bays; k++) {
        if ((k + f) % 2 === 1 && (k === 0 || k === bays - 1 || f % 3 !== 2)) continue;
        const x = SX - SW / 2 + bw * (k + 0.5);
        b.box(bw - 0.3, 0.2, 1.2, conc, { at: [x, y + 0.12, zf + 0.6] });
        b.box(bw - 0.3, 1.05, 0.14, tint(conc, 0.06), { at: [x, y + 0.32, zf + 1.13] });
      }
      // back: every third floor is an access-corridor floor with a long ribbon window; others have smaller windows
      if (f % 3 === 1) {
        b.box(SW + 0.1, 0.3, 0.2, tint(conc, 0.04), { at: [SX, y, zb - 0.1] });
        b.window(SW - 0.5, 1.2, { at: [SX, y + 0.9, zb], facing: '-z', frame: dark, glass: P.windowDark, border: 0.05 });
      } else {
        for (let k = 0; k < bays; k++) {
          const x = SX - SW / 2 + bw * (k + 0.5);
          b.window(1.6, 1.25, { at: [x, y + 0.9, zb], facing: '-z', frame: dark, glass: P.windowDark, bars: [2, 1], border: 0.07 });
        }
      }
    }
    // the end walls: blank, with vertical ribs of board-marked concrete
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) b.box(0.18, floors * FH, 0.35, tint(conc, 0.05), { at: [SX + (s * SW) / 2 + s * 0.08, POD, -3.6 + k * 2.4] });
    }

    // service tower: lifts and stairs, slit windows, boiler house cantilevered at the top
    const tTop = top + 1.2;
    b.box(TW, tTop - POD, TW, conc, { at: [TX, POD, TZ] });
    for (let f = 0; f < floors; f += 1) {
      b.window(0.35, 2.0, { at: [TX, POD + f * FH + 0.4, TZ + TW / 2], facing: '+z', frame: conc, glass: P.windowDark, border: 0.04 });
      b.window(0.35, 2.0, { at: [TX + TW / 2, POD + f * FH + 0.4, TZ], facing: '+x', frame: conc, glass: P.windowDark, border: 0.04 });
    }
    b.box(6.4, 2.8, TW + 0.6, conc, { at: [TX - 1.0, tTop, TZ] });
    for (let k = 0; k < 5; k++) b.box(0.22, 2.2, 0.2, dark, { at: [TX - 3.6 + k * 1.2, tTop + 0.4, TZ + TW / 2 + 0.32] });
    b.box(1.0, 0.8, 1.0, dark, { at: [TX + 0.4, tTop + 2.8, TZ] }); // flue
    // bridges every third floor
    for (let f = 1; f < floors; f += 3) {
      const y = POD + f * FH;
      const x0 = SX + SW / 2;
      const x1 = TX - TW / 2;
      b.box(x1 - x0 + 0.1, 2.75, 2.0, conc, { at: [(x0 + x1) / 2, y - 0.1, TZ] });
      b.window(x1 - x0 - 0.3, 1.0, { at: [(x0 + x1) / 2, y + 0.9, TZ + 1.0], facing: '+z', frame: conc, glass: P.windowDark, border: 0.04 });
      b.window(x1 - x0 - 0.3, 1.0, { at: [(x0 + x1) / 2, y + 0.9, TZ - 1.0], facing: '-z', frame: conc, glass: P.windowDark, border: 0.04 });
    }
    // entrance canopy at the foot of the tower
    b.box(4.0, 0.3, 3.0, conc, { at: [TX, 2.6, TZ + TW / 2 + 1.3] });
    b.collider(25.8, 13.8);
  },
};
