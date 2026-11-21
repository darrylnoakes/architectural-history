import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { amphora, ground, letterBoard, tiledGable, tiledShed } from './shared';

const XL = -9; // block ends
const XR = 9;
const ZF = 8.6; // street face
const ZB = 2.0; // garden face
const G = 3.6; // ground storey (shop and dining room)
const F1 = 2.8; // rooms to let
const TOP = G + F1;
const RISE = ((ZF - ZB) / 2) * 0.42;
// the shop: an open-fronted room at the left end of the block
const SX0 = -8.4;
const SX1 = -4.4;
const SZ = 4.8; // back wall of the shop
const ZG = -10.4; // garden wall

export const caupona: BuildingDef = {
  id: 'caupona',
  name: 'Caupona',
  style: 'Roman Republican',
  date: 'c. 200 BC',
  summary:
    'The town is now Roman, and food and a bed can be bought. A caupona sold wine and hot food over a counter open to the street, served meals in a room behind and let small rooms upstairs, often by the night. ' +
    'It is built like the town houses round it, of tufa and lime-plastered rubble under a roof of fired tiles, with a timber balcony over the street; what was the house garden is now where customers eat under a vine, as at several inns in Pompeii. ' +
    'Innkeepers had a poor name: the praetor’s edict made them answer for their guests’ belongings, because they were so often suspected of stealing them.',
  materials: ['tufa', 'lime-plastered rubble', 'fired clay roof tiles', 'timber'],
  lookFor: [
    { label: 'Counter on the street', note: 'The whole front of the shop opens to the street, with a plain masonry counter where wine was poured. At night boards slid into a groove in the threshold to close it.', at: [(SX0 + SX1) / 2, 1.3, ZF - 0.2] },
    { label: 'Maenianum', note: 'A timber balcony on joists over the street. The name comes from the censor Maenius, said to have built the first balconies over the shops of the Forum in Rome.', at: [2.5, G + 1.1, ZF + 1.3] },
    { label: 'Rooms to let', note: 'Small rooms over the shop and dining room, reached by their own door and stair from the street.', at: [6.5, G + 1.6, ZF + 0.2] },
    { label: 'Garden triclinium', note: 'Three masonry couches round a table under a vine pergola: dinner was eaten lying down, in the Greek manner.', at: [2.8, 1.0, -5.0] },
    { label: 'Tegulae and imbrices', note: 'Flat tiles with raised edges, their joints capped by half-round tiles, give the roof its ribs.', at: [-6.5, TOP + 1.0, ZF - 0.6] },
  ],
  build(b) {
    const plaster = b.pick([P.plaster, tint(P.plaster, 0.03), P.limewash]);
    const dado = b.pick([P.intonacoRed, tint(P.intonacoRed, -0.05)]);
    const tufa = P.tufa;
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04)]);
    const wood = P.oak;
    const midZ = (ZF + ZB) / 2;

    // street pavement and the garden ground
    ground(b, 20, 1.8, P.peperino, [0, ZF + 1.0], 0.12);
    ground(b, 2 * XR, ZB - ZG, P.earth, [0, (ZB + ZG) / 2], 0.03);

    // ---------------- the block: ground storey in pieces round the open shop, upper storey whole
    b.box(SX0 - XL, G, ZF - ZB, plaster, { at: [(XL + SX0) / 2, 0, midZ] });
    b.box(XR - SX1, G, ZF - ZB, plaster, { at: [(XR + SX1) / 2, 0, midZ] });
    b.box(SX1 - SX0, G, SZ - ZB, plaster, { at: [(SX0 + SX1) / 2, 0, (SZ + ZB) / 2] });
    b.box(XR - XL, F1, ZF - ZB, plaster, { at: [0, G, midZ] });
    // painted red dado along the street, tufa piers at the corners and openings
    b.box(SX0 - XL, 1.0, 0.04, dado, { at: [(XL + SX0) / 2, 0, ZF + 0.01], jitter: false });
    b.box(XR - SX1, 1.0, 0.04, dado, { at: [(XR + SX1) / 2, 0, ZF + 0.01], jitter: false });
    for (const x of [XL + 0.3, SX0 - 0.05, SX1 + 0.25, XR - 0.3]) {
      b.box(0.6, G, 0.12, tufa, { at: [x, 0, ZF + 0.04] });
    }
    b.box(XR - XL, 0.3, 0.14, tufa, { at: [0, G - 0.3, ZF + 0.05] });
    // the shop: paved floor, counter, wine jars, shelf
    b.box(SX1 - SX0, 0.08, ZF - SZ, P.paving, { at: [(SX0 + SX1) / 2, 0, (ZF + SZ) / 2], jitter: false });
    b.box(SX1 - SX0 - 0.3, 0.08, 0.2, P.travertine, { at: [(SX0 + SX1) / 2, 0, ZF - 0.1], jitter: false });
    b.box(3.0, 1.0, 0.6, plaster, { at: [(SX0 + SX1) / 2 - 0.3, 0, ZF - 0.9] });
    b.box(3.0, 0.45, 0.04, dado, { at: [(SX0 + SX1) / 2 - 0.3, 0.1, ZF - 0.58], jitter: false });
    b.box(3.1, 0.08, 0.7, P.travertine, { at: [(SX0 + SX1) / 2 - 0.3, 1.0, ZF - 0.9] });
    for (const x of [-7.6, -7.0, -6.1]) b.cyl(0.07, 0.14, P.terracotta, { at: [x, 1.08, ZF - 0.85], segs: 6 });
    b.lathe([[0, 0], [0.12, 0.02], [0.16, 0.18], [0.07, 0.34], [0.0, 0.34]], P.bronze, { at: [-5.3, 1.08, ZF - 0.9], segs: 7 });
    for (const x of spread(5, SX0 + 0.4, SX1 - 0.4)) amphora(b, [x, 0.08, SZ + 0.35], b.pick([P.terracotta, tint(P.terracotta, 0.06), P.brickOrange]), -0.15);
    b.box(SX1 - SX0, 0.06, 0.4, wood, { at: [(SX0 + SX1) / 2, 2.2, SZ + 0.2] });
    for (const x of spread(6, SX0 + 0.3, SX1 - 0.3)) b.cyl(0.08, 0.2, P.terracotta, { at: [x, 2.26, SZ + 0.2], segs: 6 });
    // a painted notice on the wall beside the shop
    letterBoard(b, 2.0, 0.8, P.limewash, dado, { at: [-2.6, 1.6, ZF], facing: '+z', letters: 6 });

    // the street door to the dining room, the dining room's shuttered opening, and the stair door
    b.panel(1.5, 2.6, P.oakDark, { at: [-1.6, 0, ZF], facing: '+z' });
    b.panel(1.7, 2.75, tufa, { at: [-1.6, 0, ZF - 0.02], facing: '+z', depth: 0.04 });
    b.panel(3.2, 2.8, wood, { at: [2.6, 0, ZF], facing: '+z' });
    for (const x of spread(8, 1.0, 4.2)) b.panel(0.03, 2.75, tint(wood, -0.15), { at: [x, 0.02, ZF], facing: '+z', depth: 0.08 });
    b.panel(1.0, 2.3, P.oakDark, { at: [7.0, 0, ZF], facing: '+z' });
    b.panel(0.5, 0.35, P.windowDark, { at: [5.3, 2.5, ZF], facing: '+z' });

    // ---------------- maenianum: a timber balcony on joists over the street
    const balL = 12;
    const balX = 1.2;
    for (const x of spread(9, balX - balL / 2, balX + balL / 2)) {
      b.box(0.16, 0.18, 1.6, wood, { at: [x, G - 0.05, ZF + 0.6] });
    }
    b.box(balL, 0.1, 1.3, tint(wood, 0.05), { at: [balX, G + 0.13, ZF + 0.65] });
    for (const x of spread(13, balX - balL / 2, balX + balL / 2)) {
      b.box(0.08, 1.0, 0.08, wood, { at: [x, G + 0.23, ZF + 1.25] });
    }
    b.box(balL, 0.08, 0.12, wood, { at: [balX, G + 1.2, ZF + 1.25] });
    b.box(balL, 0.06, 0.08, wood, { at: [balX, G + 0.6, ZF + 1.25] });
    b.sym((s) => b.box(0.08, 1.0, 1.25, wood, { at: [balX + s * balL / 2, G + 0.23, ZF + 0.65] }));
    // doors onto the balcony and small windows elsewhere
    for (const x of [-3.4, 0, 3.4, 6.6]) b.panel(0.9, 2.0, P.oakDark, { at: [x, G + 0.23, ZF], facing: '+z' });
    for (const x of [-7.6, -5.8]) {
      b.panel(0.7, 0.8, P.windowDark, { at: [x, G + 1.1, ZF], facing: '+z' });
      b.panel(0.8, 0.08, tufa, { at: [x, G + 1.05, ZF], facing: '+z', depth: 0.09 });
    }
    // eaves and roof
    b.box(XR - XL + 0.2, 0.18, ZF - ZB + 0.2, tufa, { at: [0, TOP - 0.18, midZ] });
    tiledGable(b, XR - XL, ZF - ZB, RISE, tile, { at: [0, TOP, midZ], overhang: 0.5, wall: plaster, step: 0.8 });

    // ---------------- the garden face of the block
    b.box(XR - XL + 0.04, 0.9, 0.04, dado, { at: [0, 0, ZB - 0.01], jitter: false });
    b.panel(1.4, 2.6, P.oakDark, { at: [-1.6, 0, ZB], facing: '-z' });
    b.panel(2.6, 2.6, P.oakDark, { at: [3.6, 0, ZB], facing: '-z', shape: 'rect' });
    b.panel(1.0, 2.2, P.oakDark, { at: [-6.5, 0, ZB], facing: '-z' });
    for (const x of [-6.5, -3.2, 0.6, 4.0, 7.2]) {
      b.panel(0.7, 0.8, P.windowDark, { at: [x, G + 1.1, ZB], facing: '-z' });
      b.panel(0.8, 0.08, tufa, { at: [x, G + 1.05, ZB], facing: '-z', depth: 0.09 });
    }
    b.sym((s) => b.panel(0.7, 0.7, P.windowDark, { at: [s * XR, G + 1.2, midZ], facing: s > 0 ? '+x' : '-x' }));

    // ---------------- the garden: walls, kitchen, pergola over a triclinium, a well
    const gw = 2.6;
    b.box(XR - XL, gw, 0.45, plaster, { at: [0, 0, ZG + 0.22] });
    b.sym((s) => b.box(0.45, gw, ZB - ZG, plaster, { at: [s * (XR - 0.22), 0, (ZB + ZG) / 2] }));
    b.box(XR - XL + 0.1, 0.12, 0.55, tile, { at: [0, gw, ZG + 0.22] });
    b.sym((s) => b.box(0.55, 0.12, ZB - ZG, tile, { at: [s * (XR - 0.22), gw, (ZB + ZG) / 2] }));
    // kitchen and store in the back corner, under a lean-to
    const kx0 = XL + 0.45;
    const kx1 = -4.2;
    const kz0 = ZG + 0.45;
    const kz1 = -6.8;
    b.box(kx1 - kx0, 3.0, kz1 - kz0, plaster, { at: [(kx0 + kx1) / 2, 0, (kz0 + kz1) / 2] });
    tiledShed(b, kx1 - kx0 + 0.4, kz1 - kz0 + 0.6, 0.9, tile, { at: [(kx0 + kx1) / 2, 3.0, (kz0 + kz1) / 2 + 0.2], high: '-z' });
    b.panel(1.0, 2.1, P.oakDark, { at: [-5.6, 0, kz1], facing: '+z' });
    b.panel(0.6, 0.5, P.windowDark, { at: [-7.6, 1.6, kz1], facing: '+z' });
    // pergola on plastered masonry columns, with the vine over it
    const px = 2.8;
    const pz = -5.0;
    for (const x of [-2.6, 0, 2.6]) {
      for (const z of [-2.4, 2.4]) {
        b.column(0.17, 2.6, plaster, { at: [px + x, 0, pz + z], order: 'tuscan' });
      }
    }
    b.sym((s) => b.box(5.6, 0.16, 0.16, wood, { at: [px, 2.6, pz + s * 2.4] }));
    for (const x of spread(7, px - 2.8, px + 2.8)) b.box(0.1, 0.1, 5.4, wood, { at: [x, 2.76, pz] });
    for (const [x, z, r] of [[-1.6, -1.4, 1.0], [0.8, 1.0, 1.2], [1.8, -1.2, 0.9], [-1.0, 1.6, 0.8], [0.0, 0.0, 0.9]] as const) {
      b.blob(r, b.pick([P.leaf, P.leafDark]), { at: [px + x, 2.95, pz + z], stretch: [1.3, 0.35, 1.3], detail: 0 });
    }
    b.sym((s) => b.cyl(0.08, 2.7, P.bark, { at: [px + s * 2.85, 0, pz + 2.1], segs: 5 }));
    // triclinium: three couches in a U, open toward the house, round a low table
    const couch = tint(plaster, -0.04);
    b.box(4.2, 0.65, 1.2, couch, { at: [px, 0, pz - 1.5] });
    b.sym((s) => b.box(1.2, 0.65, 2.6, couch, { at: [px + s * 1.5, 0, pz + 0.4] }));
    b.box(4.2, 0.08, 1.2, dado, { at: [px, 0.65, pz - 1.5], jitter: false });
    b.sym((s) => b.box(1.2, 0.08, 2.6, dado, { at: [px + s * 1.5, 0.65, pz + 0.4], jitter: false }));
    b.cyl(0.45, 0.6, P.travertine, { at: [px, 0, pz + 0.2], segs: 10 });
    // well-head, and amphorae stacked against the wall
    b.cyl(0.55, 0.8, P.travertine, { at: [-3.0, 0, -2.6], segs: 10 });
    b.cyl(0.42, 0.05, P.windowDark, { at: [-3.0, 0.78, -2.6], segs: 10 });
    for (let i = 0; i < 5; i++) amphora(b, [6.3 + i * 0.45, 0, ZG + 0.8], P.terracotta, 0.25);
    for (let i = 0; i < 4; i++) amphora(b, [6.5 + i * 0.45, 0.35, ZG + 0.95], tint(P.terracotta, 0.06), 0.5);
    b.tree(4.5, { at: [-6.8, 0, -3.6], kind: 'olive' });

    // ---------------- colliders: the block (the shop front stays open), the garden walls, the kitchen
    b.collider(XR - XL, ZF - ZB - 0.9, { at: [0, 0, midZ - 0.45] });
    b.collider(XR - SX1, 0.9, { at: [(XR + SX1) / 2, 0, ZF - 0.45] });
    b.collider(SX0 - XL, 0.9, { at: [(XL + SX0) / 2, 0, ZF - 0.45] });
    b.collider(XR - XL, 0.45, { at: [0, 0, ZG + 0.22] });
    b.sym((s) => b.collider(0.45, ZB - ZG, { at: [s * (XR - 0.22), 0, (ZB + ZG) / 2] }));
    b.collider(kx1 - kx0, kz1 - kz0, { at: [(kx0 + kx1) / 2, 0, (kz0 + kz1) / 2] });
  },
};
