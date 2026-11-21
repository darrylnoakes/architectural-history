import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { amphora, ground, letterBoard, tiledGable, tiledShed } from './shared';

const XO = 10; // outer faces of the block
const ZF = 9.0; // street face
const ZY = 3.4; // yard face of the street range
const G = 3.8;
const F1 = 3.0;
const TOP = G + F1;
// the bar: an open-fronted room at the left of the street range
const BX0 = -9.3;
const BX1 = -3.6;
const BZ = 5.2; // its back wall
// the carriage passage to the yard
const PX0 = -1.6;
const PX1 = 1.8;
// stables at the back, guest rooms on the left
const ZS0 = -10.4;
const ZS1 = -6.2;
const XR = -6.0; // yard face of the guest-room range

export const thermopolium: BuildingDef = {
  id: 'thermopolium',
  name: 'Thermopolium and inn',
  style: 'Roman Imperial',
  date: 'c. AD 60',
  modelledOn: 'The bar of Vetutius Placidus and the bar found in Regio V in 2019, Pompeii; the Thermopolium of the Via di Diana, Ostia',
  summary:
    'Under the empire the streets are lined with bars: Pompeii alone had well over a hundred. This one sells wine and ready food over an L-shaped masonry counter with jars sunk in its top. ' +
    'Archaeologists call such places thermopolia, from a Greek word for a hot-drinks shop, though Romans more often said popina or caupona. ' +
    'Beside it a wide entrance leads to an inn (hospitium) round a stable yard, the kind of place found near every town gate, with rooms off the yard and mangers for mules and horses. ' +
    'The walls are now concrete faced with brick, the standard way of building in the imperial town.',
  materials: ['brick-faced concrete', 'travertine', 'coloured marble offcuts', 'fired clay roof tiles'],
  lookFor: [
    { label: 'L-shaped counter', note: 'The masonry counter turns the corner of the open shop so customers could be served from the street. Its front is faced with offcuts of coloured marble.', at: [-7.8, 1.2, ZF - 0.2] },
    { label: 'Sunk jars (dolia)', note: 'Jars set into the counter top held the food. In the bar uncovered at Pompeii in 2019 they still held traces of duck, pork, goat, fish and snails.', at: [-5.6, 1.3, ZF - 0.7] },
    { label: 'Lararium', note: 'A painted shrine for the household gods on the back wall, where the owner made offerings for luck. Snakes painted below it guarded the place.', at: [-6.6, 2.4, BZ + 0.2] },
    { label: 'Carriage entrance', note: 'A wide arch through the street range lets carts and pack animals into the inn yard.', at: [0.1, 3.4, ZF + 0.3] },
    { label: 'Stabulum', note: 'Stables for the travellers’ animals fill the back of the yard, with mangers along the back wall.', at: [3.5, 1.8, ZS1 + 0.3] },
  ],
  influences: ['roman-concrete'],
  build(b) {
    const brick = b.pick([P.brickOrange, tint(P.brickOrange, -0.04), P.cotto]);
    const plaster = b.pick([P.plaster, tint(P.plaster, 0.03)]);
    const red = P.intonacoRed;
    const trav = P.travertine;
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04)]);
    const wood = P.oakDark;
    const midZ = (ZF + ZY) / 2;

    // raised pavement of basalt-like stone, yard floor
    ground(b, 21.6, 1.6, P.peperino, [0, ZF + 0.85], 0.22);
    ground(b, 2 * XO, ZY - ZS1, tint(P.sand, -0.12), [0, (ZY + ZS1) / 2], 0.03);

    // ---------------- street range: ground storey in pieces round the bar and the passage
    b.box(BX0 + XO, G, ZF - ZY, brick, { at: [(BX0 - XO) / 2, 0, midZ] });
    b.box(BX1 - BX0, G, BZ - ZY, brick, { at: [(BX0 + BX1) / 2, 0, (BZ + ZY) / 2] });
    b.box(PX0 - BX1, G, ZF - ZY, brick, { at: [(BX1 + PX0) / 2, 0, midZ] });
    b.box(XO - PX1, G, ZF - ZY, brick, { at: [(XO + PX1) / 2, 0, midZ] });
    b.box(2 * XO, F1, ZF - ZY, brick, { at: [0, G, midZ] });
    // arches at both ends of the carriage passage, and its paving
    for (const [z, f] of [[ZF, '+z'], [ZY, '-z']] as const) {
      b.archWall(PX1 - PX0 + 0.8, G, 0.3, brick, { at: [(PX0 + PX1) / 2, 0, z + (f === '+z' ? -0.1 : 0.1)], facing: f, openings: 1, openW: PX1 - PX0, openH: 3.5 });
      b.sym((s) => b.box(0.5, 0.2, 0.4, trav, { at: [s > 0 ? PX1 + 0.1 : PX0 - 0.1, 1.65, z + (f === '+z' ? 0.0 : 0.0)] }));
    }
    b.box(PX1 - PX0, 0.06, ZF - ZY, P.peperino, { at: [(PX0 + PX1) / 2, 0, midZ], jitter: false });
    // travertine string course and window sills; the upper floor windows
    b.box(2 * XO + 0.06, 0.22, ZF - ZY + 0.06, trav, { at: [0, G - 0.1, midZ] });
    b.box(2 * XO + 0.2, 0.25, ZF - ZY + 0.2, trav, { at: [0, TOP - 0.25, midZ] });
    for (const x of [-8.2, -5.4, -2.6, 0.1, 2.8, 5.5, 8.2]) {
      b.window(0.9, 1.1, { at: [x, G + 0.9, ZF], facing: '+z', frame: trav, border: 0.1 });
      b.window(0.9, 1.1, { at: [x, G + 0.9, ZY], facing: '-z', frame: trav, border: 0.1 });
    }
    // a balcony on travertine brackets over the right-hand shop, with a brick parapet
    for (const x of spread(5, 3.0, 9.2)) b.box(0.22, 0.32, 1.1, trav, { at: [x, G - 0.3, ZF + 0.5] });
    b.box(6.6, 0.14, 1.1, trav, { at: [6.1, G, ZF + 0.55] });
    b.box(6.6, 0.9, 0.22, brick, { at: [6.1, G + 0.14, ZF + 1.0] });
    b.sym((s) => b.box(0.22, 0.9, 1.0, brick, { at: [6.1 + s * 3.2, G + 0.14, ZF + 0.55] }));
    b.box(6.7, 0.08, 0.3, trav, { at: [6.1, G + 1.04, ZF + 1.0] });
    tiledGable(b, 2 * XO, ZF - ZY, ((ZF - ZY) / 2) * 0.42, tile, { at: [0, TOP, midZ], overhang: 0.45, wall: brick, step: 0.8 });

    // the right-hand shop door with masonry benches either side, and a painted electoral notice
    b.panel(1.3, 2.6, wood, { at: [5.5, 0, ZF], facing: '+z' });
    b.panel(1.6, 2.85, trav, { at: [5.5, 0, ZF - 0.02], facing: '+z', depth: 0.04 });
    b.sym((s) => b.box(1.5, 0.45, 0.45, plaster, { at: [5.5 + s * 1.9, 0.2, ZF + 0.22] }));
    b.panel(2.2, 2.6, wood, { at: [8.4, 0, ZF], facing: '+z' });
    for (const x of spread(6, 7.4, 9.4)) b.panel(0.03, 2.55, tint(wood, 0.1), { at: [x, 0.02, ZF], facing: '+z', depth: 0.08 });
    letterBoard(b, 2.2, 0.9, P.limewash, red, { at: [3.0, 1.4, ZF], facing: '+z', letters: 7 });

    // ---------------- the bar
    b.box(BX1 - BX0, 0.06, ZF - BZ, trav, { at: [(BX0 + BX1) / 2, 0.22, (ZF + BZ) / 2], jitter: false });
    // walls inside painted red below, white above
    b.panel(BX1 - BX0, 1.3, red, { at: [(BX0 + BX1) / 2, 0.28, BZ], facing: '+z', depth: 0.02 });
    b.sym((s) => b.panel(ZF - BZ - 0.1, 1.3, red, { at: [s > 0 ? BX0 : BX1, 0.28, (ZF + BZ) / 2], facing: s > 0 ? '+x' : '-x', depth: 0.02 }));
    // the L-shaped counter: a long arm along the street, a short arm turning back into the shop
    const cy = 0.28;
    const ch = 1.0;
    const ax0 = BX0 + 0.1;
    const ax1 = -4.9;
    const az = ZF - 0.75;
    b.box(ax1 - ax0, ch, 0.7, plaster, { at: [(ax0 + ax1) / 2, cy, az] });
    b.box(0.7, ch, 2.1, plaster, { at: [ax1 - 0.35, cy, az - 1.4] });
    b.box(ax1 - ax0 + 0.08, 0.08, 0.78, P.marble, { at: [(ax0 + ax1) / 2, cy + ch, az] });
    b.box(0.78, 0.08, 2.1, P.marble, { at: [ax1 - 0.35, cy + ch, az - 1.4] });
    // its front faced with offcuts of coloured marble
    const crustae = [P.marbleGreen, P.marbleRed, P.marbleYellow, P.marble, P.porphyry];
    let k = 0;
    for (const x of spread(9, ax0 + 0.2, ax1 - 0.2)) {
      for (const y of [0.15, 0.55]) {
        const w = b.range(0.25, 0.42);
        b.panel(w, b.range(0.22, 0.34), crustae[k++ % crustae.length], { at: [x, cy + y, az + 0.35], facing: '+z', depth: 0.03 });
      }
    }
    for (const z of spread(3, az - 2.3, az - 0.5)) {
      b.panel(0.4, 0.3, crustae[k++ % crustae.length], { at: [ax1, cy + 0.45, z], facing: '+x', depth: 0.03 });
    }
    // jars sunk in the counter top
    for (const x of [-8.3, -7.2, -6.1]) {
      b.cyl(0.3, 0.04, P.terracotta, { at: [x, cy + ch + 0.06, az], segs: 10 });
      b.cyl(0.24, 0.05, P.timberBlack, { at: [x, cy + ch + 0.06, az], segs: 10 });
    }
    b.cyl(0.28, 0.04, P.terracotta, { at: [ax1 - 0.35, cy + ch + 0.06, az - 1.5], segs: 10 });
    b.cyl(0.22, 0.05, P.timberBlack, { at: [ax1 - 0.35, cy + ch + 0.06, az - 1.5], segs: 10 });
    // stepped shelf for cups at the inner end of the counter, and a little stove for hot water
    b.stairs(0.7, 0.45, 0.6, 3, P.marble, { at: [ax1 - 0.35, cy + ch + 0.08, az - 2.1], rotY: Math.PI });
    for (const x of [-0.18, 0.12]) b.cyl(0.06, 0.12, P.terracotta, { at: [ax1 - 0.35 + x, cy + ch + 0.08 + 0.45, az - 2.32], segs: 6 });
    b.box(0.9, 0.8, 0.7, plaster, { at: [BX0 + 0.5, cy, BZ + 0.4] });
    b.lathe([[0, 0], [0.18, 0], [0.22, 0.22], [0.12, 0.36], [0, 0.36]], P.bronze, { at: [BX0 + 0.5, cy + 0.8, BZ + 0.4], segs: 7 });
    // the lararium: a niche with a little pediment, painted with the gods and a serpent
    const lx = -6.6;
    b.panel(1.6, 1.15, P.limewash, { at: [lx, 1.65, BZ], facing: '+z', depth: 0.03 });
    b.panel(0.8, 0.75, P.windowDark, { at: [lx, 1.95, BZ], facing: '+z', shape: 'round', depth: 0.05 });
    b.box(1.1, 0.08, 0.25, P.marble, { at: [lx, 1.9, BZ + 0.12] });
    b.extrude([[-0.7, 0], [0.7, 0], [0, 0.45]], 0.12, red, { at: [lx, 2.82, BZ + 0.08] });
    b.sym((s) => b.panel(0.18, 0.55, P.doorRed, { at: [lx + s * 0.6, 1.9, BZ], facing: '+z', depth: 0.05 }));
    b.panel(1.4, 0.08, P.doorGreen, { at: [lx, 1.72, BZ], facing: '+z', depth: 0.05, rotY: 0.06 });
    // wine amphorae in a rack, and a shelf of cups
    for (const x of spread(3, BX1 - 1.3, BX1 - 0.3)) amphora(b, [x, cy, BZ + 0.3], P.terracotta, -0.18);
    b.box(BX1 - BX0 - 0.4, 0.06, 0.3, P.oak, { at: [(BX0 + BX1) / 2, 2.9, BZ + 0.15] });
    // tufa threshold with a groove for the shutters
    b.box(BX1 - BX0, 0.08, 0.3, trav, { at: [(BX0 + BX1) / 2, 0.22, ZF - 0.15], jitter: false });
    b.box(BX1 - BX0, 0.02, 0.05, P.timberBlack, { at: [(BX0 + BX1) / 2, 0.3, ZF - 0.15], jitter: false });

    // ---------------- guest rooms on the left of the yard
    const gz0 = ZS1;
    const gz1 = ZY;
    b.box(XR + XO, 3.4, gz1 - gz0, brick, { at: [(XR - XO) / 2, 0, (gz0 + gz1) / 2] });
    tiledShed(b, XR + XO + 0.5, gz1 - gz0, 1.0, tile, { at: [(XR - XO) / 2 + 0.25, 3.4, (gz0 + gz1) / 2], high: '-x' });
    for (const z of spread(3, gz0 + 0.3, gz1 - 0.3)) {
      b.panel(0.9, 2.1, wood, { at: [XR, 0, z - 0.7], facing: '+x' });
      b.panel(1.1, 2.3, trav, { at: [XR, 0, z - 0.7], facing: '+x', depth: 0.03 });
      b.window(0.6, 0.6, { at: [XR, 2.3, z + 0.6], facing: '+x', frame: trav });
    }
    // outside stair up to the rooms over the street range
    b.stairs(1.0, G, 4.2, 14, brick, { at: [XR + 0.6, 0, ZY - 2.3 - 0.0], rotY: Math.PI });
    b.box(1.0, 0.1, 1.0, trav, { at: [XR + 0.6, G - 0.1, ZY - 0.3] });
    b.panel(0.9, 2.0, wood, { at: [XR + 0.6, G, ZY], facing: '-z' });

    // ---------------- stables across the back, arcaded to the yard, with mangers
    const sH = 3.6;
    const sz = (ZS0 + ZS1) / 2;
    b.box(2 * XO, 0.12, ZS1 - ZS0, P.earth, { at: [0, 0, sz], jitter: false });
    b.box(2 * XO, sH, 0.5, brick, { at: [0, 0, ZS0 + 0.25] });
    b.sym((s) => b.box(0.5, sH, ZS1 - ZS0, brick, { at: [s * (XO - 0.25), 0, sz] }));
    b.archWall(2 * XO - 1, sH, 0.45, brick, { at: [0, 0, ZS1 - 0.22], facing: '+z', openings: 5, openW: 2.6, openH: 2.9 });
    b.box(2 * XO - 1, 0.9, 0.6, plaster, { at: [0, 0, ZS0 + 0.8] });
    b.box(2 * XO - 1, 0.1, 0.4, P.timberBlack, { at: [0, 0.85, ZS0 + 0.85], jitter: false });
    for (const x of spread(5, -XO + 0.5, XO - 0.5)) b.blob(0.4, P.thatch, { at: [x, 1.0, ZS0 + 0.8], stretch: [1.6, 0.5, 0.8], detail: 0 });
    for (const x of spread(6, -XO + 1, XO - 1)) b.panel(0.25, 0.8, P.windowDark, { at: [x, 2.2, ZS0], facing: '-z' });
    tiledGable(b, 2 * XO, ZS1 - ZS0, ((ZS1 - ZS0) / 2) * 0.42, tile, { at: [0, sH, sz], overhang: 0.4, wall: brick, step: 0.8 });

    // ---------------- right side of the yard: wall, trough, well, a cart
    b.box(0.5, 3.0, ZY - ZS1, brick, { at: [XO - 0.25, 0, (ZY + ZS1) / 2] });
    b.box(0.8, 0.7, 3.0, trav, { at: [XO - 0.9, 0, -2.0] });
    b.box(0.6, 0.05, 2.8, P.water, { at: [XO - 0.9, 0.62, -2.0], jitter: false });
    b.cyl(0.55, 0.85, trav, { at: [4.0, 0, 0.4], segs: 10 });
    b.cyl(0.42, 0.05, P.windowDark, { at: [4.0, 0.82, 0.4], segs: 10 });
    // a two-wheeled cart, shafts down
    b.group({ at: [3.0, 0, -3.4], rotY: 0.5 }, () => {
      b.box(1.6, 0.6, 2.2, P.oak, { at: [0, 0.75, 0] });
      b.sym((s) => b.log(0.6, 0.12, P.oakDark, { at: [s * 0.9, 0, 0], segs: 10 }));
      b.sym((s) => b.beam([s * 0.4, 0.8, 1.1], [s * 0.35, 0.05, 3.0], 0.1, 0.1, P.oak));
    });
    for (let i = 0; i < 4; i++) amphora(b, [-4.4 + i * 0.5, 0, ZY - 0.5], tint(P.terracotta, i * 0.02), 0.2, Math.PI);

    // ---------------- colliders: street range (bar front and passage open), guest rooms, stables, yard wall
    b.collider(BX0 + XO, ZF - ZY, { at: [(BX0 - XO) / 2, 0, midZ] });
    b.collider(BX1 - BX0, BZ - ZY + 0.6, { at: [(BX0 + BX1) / 2, 0, (BZ + ZY + 0.6) / 2] });
    b.collider(ax1 - ax0, 0.7, { at: [(ax0 + ax1) / 2, 0, az] });
    b.collider(PX0 - BX1, ZF - ZY, { at: [(BX1 + PX0) / 2, 0, midZ] });
    b.collider(XO - PX1, ZF - ZY, { at: [(XO + PX1) / 2, 0, midZ] });
    b.collider(XR + XO, gz1 - gz0, { at: [(XR - XO) / 2, 0, (gz0 + gz1) / 2] });
    b.collider(2 * XO, ZS1 - ZS0, { at: [0, 0, sz] });
    b.collider(0.5, ZY - ZS1, { at: [XO - 0.25, 0, (ZY + ZS1) / 2] });
  },
};
