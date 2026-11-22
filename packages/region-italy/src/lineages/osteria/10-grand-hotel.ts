import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { cafeTable, ground, palm, shutteredWindow, word } from './shared';

const XO = 10.0;
const ZF = 9.6; // street front
const ZFI = 2.4; // garden face of the front range
const SX = 3.2; // garden face of the side range (the side street is at +X)
const ZB = -9.8;
const G = 5.0; // ground floor: hall, dining room
const F = 3.6; // each upper floor
const NF = 4;
const TOP = G + F * NF;
const TX = 6.6; // the corner tower occupies x TX..XO, z TZ..ZF
const TZ = 6.2;

/** One upper-floor window: plain frame on most floors, shutters and a pediment on the first. */
function hotelWindow(b: Builder, x: number, z: number, y: number, facing: '+z' | '-z' | '+x' | '-x', floor: number, stone: number, shutter: number): void {
  const at: [number, number, number] = [x, y, z];
  if (floor === 0) {
    shutteredWindow(b, 1.1, 2.3, { at, facing, frame: P.white, shutter, surround: stone });
    b.group({ at, rotY: { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing] }, () => {
      b.extrude([[-0.95, 0], [0.95, 0], [0, 0.42]], 0.2, stone, { at: [0, 2.5, 0.1] });
    });
  } else {
    b.window(1.1, floor === NF - 1 ? 1.6 : 2.1, { at, facing, frame: stone, border: 0.12, bars: [2, 3] });
  }
}

export const grandHotel: BuildingDef = {
  id: 'grand-hotel',
  name: 'Grand hotel',
  style: 'Belle Époque eclectic',
  date: 'c. 1898',
  summary:
    'The railway has brought a new kind of guest: tourists with guidebooks, commercial travellers and families on holiday, who expect what no inn could give them. ' +
    'The grand hotel, often built by a company of investors, offers a lift, electric light, bathrooms on every landing, a dining room, a reading room and a palm garden, with staff who speak English and German. ' +
    'Its dress borrows from every past style: a rusticated base, pedimented windows over continuous balconies, and a domed corner tower to catch the eye from the station road, with a canopy of iron and glass over the door.',
  materials: ['brick, stuccoed', 'artificial stone', 'cast and wrought iron', 'glass', 'zinc'],
  lookFor: [
    { label: 'Corner cupola', note: 'A domed tower on the corner marks the hotel from far off, borrowed from the palaces and exhibition buildings of Paris and Vienna.', at: [(TX + XO) / 2, TOP + 4.6, ZF + 0.2] },
    { label: 'Iron-and-glass canopy', note: 'A pensilina of glass on iron brackets shelters guests stepping down from their carriage at the door.', at: [-3.0, 4.4, ZF + 1.6] },
    { label: 'Balconies', note: 'A continuous balcony runs along the first floor, where the best rooms were; every guest wanted a view.', at: [-7.0, G + 0.5, ZF + 0.7] },
    { label: 'Rusticated base', note: 'Deep horizontal grooves in the stucco of the ground floor give the hotel a solid, palatial footing.', at: [-8.6, 2.2, ZF + 0.1] },
    { label: 'Palm garden', note: 'Canary palms were the fashionable tree of the age, planted round hotels from the Riviera to the lakes.', at: [-5.5, 2.5, -4.0] },
  ],
  influences: ['iron-and-glass'],
  build(b) {
    const render = b.pick([P.intonacoCream, P.intonacoRose, tint(P.intonacoCream, -0.03)]);
    const stone = P.travertine;
    const groove = tint(render, -0.12);
    const shutter = b.pick([P.doorGreen, tint(P.doorGreen, 0.05)]);
    const roof = P.zinc;
    const fz = (ZF + ZFI) / 2;
    const sz = (ZFI + ZB) / 2;
    const sxm = (SX + XO) / 2;

    ground(b, 21.6, 1.4, P.paving, [0, ZF + 0.75], 0.1);
    ground(b, XO + SX, ZFI - ZB, P.gravel, [(SX - XO) / 2, (ZFI + ZB) / 2], 0.03);

    // ---------------- the two ranges
    b.box(2 * XO, TOP, ZF - ZFI, render, { at: [0, 0, fz] });
    b.box(XO - SX, TOP, ZFI - ZB, render, { at: [sxm, 0, sz] });
    // rusticated ground floor on the two street fronts
    for (let y = 0.9; y < G - 0.4; y += 0.5) {
      b.box(2 * XO + 0.04, 0.05, 0.04, groove, { at: [0, y, ZF + 0.01], jitter: false });
      b.box(0.04, 0.05, ZF - ZB, groove, { at: [XO + 0.01, y, (ZF + ZB) / 2], jitter: false });
    }
    b.box(2 * XO + 0.06, 0.7, ZF - ZFI + 0.06, stone, { at: [0, 0, fz] });
    b.box(XO - SX + 0.06, 0.7, ZFI - ZB + 0.06, stone, { at: [sxm, 0, sz] });
    // string course, top cornice and attic
    for (const [y, h, o] of [[G - 0.2, 0.3, 0.12], [TOP - 0.45, 0.25, 0.25], [TOP - 0.2, 0.25, 0.45]] as const) {
      b.box(2 * XO + o * 2, h, ZF - ZFI + o * 2, stone, { at: [0, y, fz] });
      b.box(XO - SX + o * 2, h, ZFI - ZB + o * 2, stone, { at: [sxm, y, sz] });
    }
    for (const x of spread(22, -XO + 0.3, XO - 0.3)) b.box(0.2, 0.3, 0.4, stone, { at: [x, TOP - 0.75, ZF + 0.15] });
    b.hip(2 * XO, ZF - ZFI, 1.6, roof, { at: [0, TOP + 0.05, fz] });
    b.hip(XO - SX, ZFI - ZB + 1, 1.6, roof, { at: [sxm, TOP + 0.05, sz - 0.5] });

    // ---------------- ground floor: arched windows, the entrance and its canopy
    for (const x of [-8.4, -6.0, 0.0, 2.4, 4.8]) {
      b.window(1.5, 3.2, { at: [x, 0.9, ZF], facing: '+z', shape: 'round', frame: P.white, border: 0.1, bars: [2, 4] });
    }
    for (const z of spread(6, ZB + 0.5, ZF - 0.5)) {
      b.window(1.5, 3.2, { at: [XO, 0.9, z], facing: '+x', shape: 'round', frame: P.white, border: 0.1, bars: [2, 4] });
    }
    b.panel(2.4, 4.0, stone, { at: [-3.0, 0.1, ZF], facing: '+z', shape: 'round', depth: 0.1 });
    b.panel(1.9, 3.6, P.glassDark, { at: [-3.0, 0.1, ZF], facing: '+z', shape: 'round', depth: 0.13, mat: 'glass' });
    b.stairs(2.6, 0.1, 0.5, 1, stone, { at: [-3.0, 0.1, ZF + 0.3] });
    // the pensilina: a glass roof on iron brackets, hung from the wall by rods
    const cy = 4.1;
    b.box(4.8, 0.06, 2.6, P.glass, { at: [-3.0, cy, ZF + 1.3], rot: [-0.12, 0, 0], mat: 'glass' });
    for (const x of spread(4, -5.3, -0.7)) {
      b.beam([x, cy - 0.15, ZF], [x, cy + 0.1, ZF + 2.6], 0.06, 0.1, P.castIron);
      b.beam([x, cy + 1.6, ZF], [x, cy + 0.15, ZF + 2.5], 0.03, 0.03, P.castIron);
      b.beam([x, cy - 0.9, ZF], [x, cy - 0.1, ZF + 0.8], 0.05, 0.05, P.castIron);
    }
    b.box(4.9, 0.18, 0.08, P.castIron, { at: [-3.0, cy - 0.25, ZF + 2.65] });
    // the name in gilt letters under the cornice
    word(b, 'GRAND HOTEL', 0.16, P.gold, { at: [-1.5, TOP - 1.25, ZF + 0.05], facing: '+z' });

    // ---------------- upper floors: windows, balconies on the first floor
    const fxs = [-8.4, -6.0, -3.6, -1.2, 1.2, 3.6];
    for (let f = 0; f < NF; f++) {
      const y = G + f * F + 0.5;
      for (const x of fxs) hotelWindow(b, x, ZF, y, '+z', f, stone, shutter);
      for (const z of spread(5, ZB + 0.5, TZ - 0.4)) hotelWindow(b, XO, z, y, '+x', f, stone, shutter);
      for (const z of spread(4, ZB + 0.5, ZFI - 0.5)) b.window(1.0, 1.8, { at: [SX, y, z], facing: '-x', frame: stone, border: 0.1, bars: [2, 3] });
      for (const x of spread(5, -XO + 0.5, SX - 0.5)) b.window(1.0, 1.8, { at: [x, y, ZFI], facing: '-z', frame: stone, border: 0.1, bars: [2, 3] });
    }
    // continuous first-floor balcony on consoles, iron railing
    const by = G + 0.05;
    const rail = (len: number, at: [number, number, number], rotY: number) => {
      b.group({ at, rotY }, () => {
        b.box(len, 0.18, 1.0, stone, { at: [0, 0, 0.5] });
        for (const x of spread(Math.round(len / 1.2), -len / 2, len / 2)) b.box(0.18, 0.35, 0.8, stone, { at: [x, -0.35, 0.4] });
        b.box(len, 0.06, 0.06, P.castIron, { at: [0, 1.15, 0.95] });
        for (const x of spread(Math.round(len / 0.25), -len / 2, len / 2)) b.box(0.03, 0.97, 0.03, P.castIron, { at: [x, 0.18, 0.95], jitter: false });
      });
    };
    rail(TX + XO - 0.2, [(TX - XO) / 2, by, ZF], 0);
    rail(TZ - ZB - 0.2, [XO, by, (TZ + ZB) / 2], Math.PI / 2);

    // ---------------- the corner tower and its cupola
    const tx = (TX + XO) / 2;
    const tz = (TZ + ZF) / 2;
    const tw = XO - TX;
    b.box(tw + 0.3, TOP + 3.2, tw + 0.3, render, { at: [tx + 0.15, 0, tz + 0.15] });
    b.box(tw + 0.6, 0.7, tw + 0.6, stone, { at: [tx + 0.15, 0, tz + 0.15] });
    for (let f = 0; f < NF; f++) {
      const y = G + f * F + 0.5;
      b.window(1.4, 2.2, { at: [tx + 0.15, y, ZF + 0.3], facing: '+z', frame: stone, border: 0.12, bars: [2, 3] });
      b.window(1.4, 2.2, { at: [XO + 0.3, y, tz + 0.15], facing: '+x', frame: stone, border: 0.12, bars: [2, 3] });
      b.box(2.4, 0.15, 0.9, stone, { at: [tx + 0.15, y - 0.2, ZF + 0.7] });
      b.box(2.4, 0.9, 0.04, P.castIron, { at: [tx + 0.15, y - 0.05, ZF + 1.12] });
    }
    b.window(1.2, 1.2, { at: [tx + 0.15, TOP + 0.9, ZF + 0.3], facing: '+z', frame: stone, shape: 'circle', border: 0.15 });
    b.window(1.2, 1.2, { at: [XO + 0.3, TOP + 0.9, tz + 0.15], facing: '+x', frame: stone, shape: 'circle', border: 0.15 });
    b.box(tw + 0.8, 0.3, tw + 0.8, stone, { at: [tx + 0.15, TOP + 3.0, tz + 0.15] });
    b.cyl(1.55, 0.8, render, { at: [tx + 0.15, TOP + 3.3, tz + 0.15], segs: 12 });
    b.dome(1.7, roof, { at: [tx + 0.15, TOP + 4.1, tz + 0.15], squash: 1.35, segs: 12 });
    b.cyl(0.35, 0.8, P.white, { at: [tx + 0.15, TOP + 6.3, tz + 0.15], segs: 8 });
    b.cone(0.45, 0.6, roof, { at: [tx + 0.15, TOP + 7.1, tz + 0.15], segs: 8 });
    b.cyl(0.03, 0.8, P.castIron, { at: [tx + 0.15, TOP + 7.7, tz + 0.15], segs: 4 });

    // ---------------- the palm garden with its terrace
    b.box(SX + XO - 0.6, 0.5, 3.2, stone, { at: [(SX - XO) / 2, 0, ZFI - 1.6] });
    for (const x of spread(16, -XO + 0.5, SX - 0.5)) b.cyl(0.06, 0.6, stone, { at: [x, 0.5, ZFI - 3.15], segs: 5 });
    b.box(SX + XO - 0.6, 0.1, 0.22, stone, { at: [(SX - XO) / 2, 1.1, ZFI - 3.15] });
    for (const x of [-7.4, -4.0, -0.6]) cafeTable(b, [x, 0.5, ZFI - 1.4], P.white, P.white, 2, Math.PI / 2);
    palm(b, [-7.6, 0, -6.6], 6.5);
    palm(b, [-1.4, 0, -7.6], 7.5);
    b.cyl(1.0, 0.5, stone, { at: [-4.4, 0, -5.2], segs: 10 });
    b.cyl(0.85, 0.05, P.water, { at: [-4.4, 0.45, -5.2], segs: 10, mat: 'glass' });
    b.cyl(0.12, 1.0, stone, { at: [-4.4, 0.45, -5.2], segs: 6 });
    for (const [x, z] of [[-9.0, -9.0], [1.8, -9.0], [-9.0, -3.0]] as const) b.tree(2.2, { at: [x, 0, z], kind: 'bush' });
    b.box(XO + SX, 2.2, 0.4, render, { at: [(SX - XO) / 2, 0, ZB + 0.2] });
    b.box(0.4, 2.2, ZFI - ZB - 3.2, render, { at: [-XO + 0.2, 0, (ZFI - 3.2 + ZB) / 2] });

    b.collider(2 * XO, ZF - ZFI, { at: [0, 0, fz] });
    b.collider(XO - SX, ZFI - ZB, { at: [sxm, 0, sz] });
    b.collider(XO + SX, 0.4, { at: [(SX - XO) / 2, 0, ZB + 0.2] });
    b.collider(0.4, ZFI - ZB - 3.2, { at: [-XO + 0.2, 0, (ZFI - 3.2 + ZB) / 2] });
  },
};

