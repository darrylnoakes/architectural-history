import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { cafeTable, ground, railing, word } from './shared';

const XO = 10.2;
const ZF = 9.6; // face of the arcade on the square
const ZS = 6.6; // the shopfronts, behind the arcade walk
const ZB = -1.6; // back of the main block
const G = 5.4; // arcade storey, with a mezzanine over the shops
const F1 = 3.7;
const F2 = 3.2;
const TOP = G + F1 + F2;
const N = 5; // bays
const PITCH = (2 * XO) / N;
const AOW = 3.0; // arch opening
const CX = 0; // the café room, open to show its mirrors, in the middle bay
const RW = 3.0; // its width
const RD = 3.4; // its depth behind the shopfront

/** A shopfront in one bay: glazed doors under a fascia, set in the back of the arcade. */
function shopfront(b: Builder, x: number, paint: number, gilt: number, open: boolean): void {
  const w = 3.0;
  const h = 3.0;
  if (open) {
    b.panel(w + 0.3, 0.8, paint, { at: [x, h, ZS], facing: '+z', depth: 0.1 });
    b.sym((s) => b.panel(0.15, h, paint, { at: [x + s * (w / 2 + 0.08), 0, ZS], facing: '+z', depth: 0.1 }));
  } else b.panel(w + 0.3, h + 0.8, paint, { at: [x, 0, ZS], facing: '+z', depth: 0.1 });
  b.panel(w + 0.4, 0.12, gilt, { at: [x, h + 0.05, ZS], facing: '+z', depth: 0.14 });
  if (!open) {
    b.window(w - 0.4, h - 0.6, { at: [x, 0.5, ZS + 0.1], facing: '+z', frame: paint, glass: P.glassDark, mat: 'glass', bars: [3, 2], border: 0.1 });
    b.panel(w - 0.4, 0.45, tint(paint, -0.08), { at: [x, 0.05, ZS + 0.1], facing: '+z', depth: 0.05 });
  }
  // the mezzanine window over the shop, as in the Palais-Royal
  b.window(AOW - 0.8, 1.0, { at: [x, 4.0, ZS], facing: '+z', frame: P.white, bars: [3, 1], border: 0.08 });
}

export const cafeRestaurant: BuildingDef = {
  id: 'cafe-restaurant',
  name: 'Café and restaurant',
  style: 'Louis XVI neoclassical',
  date: 'c. 1800',
  modelledOn:
    'The arcades of the Palais-Royal, Paris (Victor Louis, 1781 to 1784), where the first grand restaurants opened: the arcade with a mezzanine in each arch and the giant pilasters above are taken from it, at a provincial scale; the rest is generic',
  summary:
    'Two Paris novelties reach the town on its new arcaded square. The café, serving coffee, chocolate, ices and liqueurs at small marble tables before walls of mirrors, had been the fashion in Paris since the Procope opened in the 1680s. The restaurant is newer: from the later 1760s a few Paris traders sold restorative broths, “restaurants”, at private tables, at any hour, from a bill of fare with prices, instead of the innkeeper’s one common table at a fixed time. ' +
    'By the 1780s the grandest, such as Beauvilliers’ (1782), stood in and around the arcades of the Palais-Royal, and in the years after the Revolution the idea spread to the provinces. ' +
    'The building is in the sober classical manner of Louis XVI: an arcade on the square with the painted shopfronts behind it, giant pilasters binding two upper floors, and a balustrade hiding the roof. Here, for the first time on this plot, the guest chooses his own dinner.',
  materials: ['limestone', 'painted and gilded wood', 'plate glass and mirror', 'marble', 'wrought iron', 'slate'],
  lookFor: [
    { label: 'Arcade', note: 'A covered walk of round arches along the square, with a low mezzanine window over each shop behind, after the Palais-Royal.', at: [-6.1, 4.2, ZF + 0.3] },
    { label: 'Painted shopfront', note: 'The devanture: a wooden front painted and picked out in gilt, with glazed doors and the house’s trades lettered on the fascia.', at: [-4.1, 3.3, ZS + 0.3] },
    { label: 'Mirrors', note: 'Tall mirrors in gilded frames doubled the candlelight and the company, the great luxury of the Paris café.', at: [CX, 2.4, ZS - RD + 0.4] },
    { label: 'Small tables', note: 'Round tables with marble tops (guéridons), each for a party of its own: the restaurant’s break with the common table of the inn.', at: [3.4, 1.0, 8.2] },
    { label: 'Giant pilasters', note: 'Flat columns rising through two storeys bind the front together, the hallmark of Victor Louis’s Palais-Royal.', at: [PITCH * 1.5, G + F1, ZF + 0.3] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, P.craie, tint(P.pierreBlonde, 0.03)]);
    const slate = P.ardoise;
    const paint = b.pick([P.doorGreen, 0x5a2a2a, P.doorBlue]);
    const gilt = P.gold;
    const marble = P.marble;
    const shutter = b.pick([P.voletGris, P.voletBleu]);

    ground(b, 21.0, 1.4, P.paving, [0, ZF + 0.7], 0.05);
    ground(b, 2 * XO, ZF - ZS, tint(P.paving, 0.05), [0, (ZF + ZS) / 2], 0.06);

    // ---------------- the arcade storey
    b.archWall(2 * XO, G, 0.7, stone, { at: [0, 0, ZF - 0.35], openings: N, openW: AOW, openH: G - 0.3, shape: 'round' });
    for (let i = 0; i <= N; i++) {
      const x = -XO + i * PITCH;
      b.box(0.9, G - 0.2, 0.15, tint(stone, -0.03), { at: [x, 0, ZF + 0.06] });
    }
    for (let i = 0; i < N; i++) {
      const x = -XO + (i + 0.5) * PITCH;
      b.panel(0.35, 0.6, tint(stone, -0.05), { at: [x, G - 0.65, ZF], facing: '+z', depth: 0.1 });
    }
    // the shops behind the walk; the middle bay is the café room, its doors folded open
    const rl = CX - RW / 2 + XO;
    b.box(rl, G, ZS - ZB, stone, { at: [-XO + rl / 2, 0, (ZS + ZB) / 2] });
    b.box(rl, G, ZS - ZB, stone, { at: [XO - rl / 2, 0, (ZS + ZB) / 2] });
    b.box(RW, G, ZS - RD - ZB, stone, { at: [CX, 0, (ZS - RD + ZB) / 2] });
    b.box(RW, G - 3.6, RD, stone, { at: [CX, 3.6, ZS - RD / 2] });
    b.box(RW, 0.05, RD, P.paving, { at: [CX, 0.06, ZS - RD / 2], jitter: false });
    b.box(2 * XO, 0.2, ZF - ZS, tint(stone, 0.05), { at: [0, G - 0.2, (ZF + ZS) / 2] });
    for (let i = 0; i < N; i++) shopfront(b, -XO + (i + 0.5) * PITCH, paint, gilt, i === 2);
    b.sym((s) => b.box(0.15, 3.0, 1.0, paint, { at: [CX + s * (RW / 2 - 0.1), 0.05, ZS + 0.4], rotY: s * 0.5 }));
    // inside the café: the mirror wall, the counter, a chandelier
    b.panel(2.3, 2.7, gilt, { at: [CX, 0.9, ZS - RD], facing: '+z', depth: 0.05 });
    b.panel(2.0, 2.4, P.glass, { at: [CX, 1.05, ZS - RD], facing: '+z', depth: 0.07, mat: 'glass' });
    b.box(2.2, 1.0, 0.6, paint, { at: [CX, 0.05, ZS - RD + 0.9] });
    b.box(2.3, 0.06, 0.7, marble, { at: [CX, 1.05, ZS - RD + 0.9] });
    b.cyl(0.02, 0.5, gilt, { at: [CX, 3.1, ZS - 1.6], segs: 4 });
    b.cyl(0.35, 0.1, gilt, { at: [CX, 3.0, ZS - 1.6], segs: 6 });
    cafeTable(b, [CX, 0.08, ZS - 1.0], marble, P.castIron, 2);
    // the trades on the fascias
    word(b, 'CAFE', 0.08, gilt, { at: [-XO + 1.5 * PITCH, 3.25, ZS + 0.1], facing: '+z', depth: 0.03 });
    word(b, 'RESTAURATEUR', 0.052, gilt, { at: [-XO + 3.5 * PITCH, 3.27, ZS + 0.1], facing: '+z', depth: 0.03 });
    word(b, 'CAFE', 0.08, gilt, { at: [CX, 3.25, ZS + 0.1], facing: '+z', depth: 0.03 });

    // ---------------- the upper floors: giant pilasters, tall windows, balconies
    const ud = ZF - ZB;
    const uz = (ZF + ZB) / 2;
    b.box(2 * XO, F1 + F2, ud, stone, { at: [0, G, uz] });
    b.box(2 * XO + 0.1, 0.35, ud + 0.1, tint(stone, 0.04), { at: [0, G - 0.1, uz] });
    for (let i = 0; i <= N; i++) {
      const x = -XO + i * PITCH + (i === 0 ? 0.4 : i === N ? -0.4 : 0);
      b.box(0.8, F1 + F2 - 0.6, 0.18, stone, { at: [x, G + 0.25, ZF + 0.09] });
      for (const dx of [-0.15, 0.15]) b.box(0.06, F1 + F2 - 1.2, 0.04, tint(stone, -0.08), { at: [x + dx, G + 0.6, ZF + 0.19], jitter: false });
      b.box(1.0, 0.45, 0.3, stone, { at: [x, G + F1 + F2 - 0.4, ZF + 0.13] });
    }
    for (let i = 0; i < N; i++) {
      const x = -XO + (i + 0.5) * PITCH;
      b.window(1.4, 2.7, { at: [x, G + 0.45, ZF], facing: '+z', frame: P.white, bars: [2, 3], border: 0.1 });
      b.panel(1.9, 0.18, stone, { at: [x, G + 3.3, ZF], facing: '+z', depth: 0.2 });
      railing(b, [x - 0.85, G + 0.35, ZF + 0.35], [x + 0.85, G + 0.35, ZF + 0.35], 0.9, P.castIron, 0.28);
      b.box(1.9, 0.12, 0.45, stone, { at: [x, G + 0.3, ZF + 0.18] });
      b.window(1.3, 2.1, { at: [x, G + F1 + 0.4, ZF], facing: '+z', frame: P.white, bars: [2, 3], border: 0.1 });
      // the back: plainer windows with shutters
      b.window(1.2, 2.2, { at: [x, G + 0.6, ZB], facing: '-z', frame: P.white, border: 0.1 });
      b.sym((s) => b.panel(0.6, 2.2, shutter, { at: [x + s * 0.95, G + 0.6, ZB], facing: '-z', depth: 0.05 }));
      b.window(1.2, 1.9, { at: [x, G + F1 + 0.4, ZB], facing: '-z', frame: P.white, border: 0.1 });
      b.window(1.2, 2.2, { at: [x, 1.0, ZB], facing: '-z', frame: P.white, border: 0.1 });
    }
    b.sym((s) => {
      for (const z of [4.0, 0.6]) {
        b.window(1.2, 2.4, { at: [s * XO, G + 0.5, z], facing: s > 0 ? '+x' : '-x', frame: P.white, border: 0.1 });
        b.window(1.2, 2.0, { at: [s * XO, G + F1 + 0.4, z], facing: s > 0 ? '+x' : '-x', frame: P.white, border: 0.1 });
      }
    });
    // entablature, balustrade with vases, and the low slate roof behind
    b.box(2 * XO + 0.3, 0.7, ud + 0.3, tint(stone, 0.03), { at: [0, TOP, uz] });
    b.box(2 * XO + 0.6, 0.22, ud + 0.6, stone, { at: [0, TOP + 0.7, uz] });
    const by = TOP + 0.92;
    b.box(2 * XO, 0.18, 0.4, stone, { at: [0, by, ZF + 0.05] });
    b.box(2 * XO, 0.15, 0.45, stone, { at: [0, by + 0.8, ZF + 0.05] });
    for (const x of spread(26, -XO + 0.3, XO - 0.3)) b.box(0.2, 0.62, 0.14, stone, { at: [x, by + 0.18, ZF + 0.05], jitter: false });
    b.box(2 * XO, 0.95, 0.3, stone, { at: [0, by, ZB + 0.15] });
    b.sym((s) => b.box(0.3, 0.95, ud, stone, { at: [s * (XO - 0.15), by, uz] }));
    for (let i = 0; i <= N; i++) {
      const x = -XO + i * PITCH + (i === 0 ? 0.4 : i === N ? -0.4 : 0);
      b.box(0.5, 0.95, 0.5, stone, { at: [x, by, ZF + 0.05] });
      b.lathe([[0, 0], [0.18, 0], [0.12, 0.12], [0.26, 0.35], [0.2, 0.55], [0.08, 0.62], [0.12, 0.75], [0, 0.78]], stone, { at: [x, by + 0.95, ZF + 0.05], segs: 6 });
    }
    b.hip(2 * XO - 0.8, ud - 0.8, 2.4, slate, { at: [0, by, uz] });
    b.sym((s) => b.chimney(0.9, 2.4, 0.6, stone, { at: [s * 6.0, by + 0.6, uz - 1.6] }));

    // ---------------- the yard behind: a kitchen wing and a garden wall
    b.box(5.0, 3.6, 7.6, stone, { at: [-7.7, 0, -5.4] });
    b.hip(5.0, 7.6, 1.6, slate, { at: [-7.7, 3.6, -5.4], overhang: 0.3 });
    b.chimney(0.8, 2.2, 0.8, stone, { at: [-8.6, 3.2, -6.4] });
    for (const z of [-3.4, -6.6]) b.window(1.0, 1.6, { at: [-5.2, 1.0, z], facing: '+x', frame: P.white, bars: [2, 3], border: 0.08 });
    b.panel(1.0, 2.2, paint, { at: [-5.2, 0, -8.4], facing: '+x' });
    b.box(15.2, 2.6, 0.4, stone, { at: [2.6, 0, -9.0] });
    b.box(0.4, 2.6, 7.4, stone, { at: [XO - 0.2, 0, -5.3] });
    b.box(15.4, 0.12, 0.6, slate, { at: [2.6, 2.6, -9.0] });
    b.box(0.6, 0.12, 7.4, slate, { at: [XO - 0.2, 2.6, -5.3] });
    ground(b, 15.0, 7.0, P.gravel, [2.6, -5.3], 0.04);
    for (const [x, z] of [[-1.0, -4.0], [4.6, -4.0], [1.8, -6.8], [7.4, -6.6]] as const) b.tree(3.6, { at: [x, 0, z], kind: 'round', color: P.leafDark });

    // ---------------- tables under the arcade and on the square
    for (const x of [-8.2, -4.0, 3.4, 8.2]) cafeTable(b, [x, 0.06, 8.2], marble, P.castIron, 2);
    for (const x of [-6.0, 6.2]) cafeTable(b, [x, 0.05, ZF + 0.8], marble, P.castIron, 2, Math.PI / 2);

    // ---------------- colliders: the shops and the block behind; the arcade walk stays open
    b.sym((s) => b.collider(rl, ZS - ZB, { at: [s * (XO - rl / 2), 0, (ZS + ZB) / 2] }));
    b.collider(RW, ZS - RD - ZB, { at: [CX, 0, (ZS - RD + ZB) / 2] });
    for (let i = 0; i <= N; i++) b.collider(0.9, 0.8, { at: [-XO + i * PITCH, 0, ZF - 0.35] });
    b.collider(5.0, 7.6, { at: [-7.7, 0, -5.4] });
    b.collider(15.2, 0.4, { at: [2.6, 0, -9.0] });
    b.collider(0.4, 7.4, { at: [XO - 0.2, 0, -5.3] });
  },
};

