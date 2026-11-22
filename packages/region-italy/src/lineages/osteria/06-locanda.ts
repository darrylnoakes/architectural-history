import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { barrel, frasca, ground, tiledGable, tiledShed } from './shared';

const XO = 10.2; // outer side faces
const ZF = 9.1; // street face of the ground storey
const ZFI = 4.6; // yard face of the street range
const SP = 0.6; // the sporto: how far the upper floors project over the street
const G = 3.8;
const F1 = 3.3;
const F2 = 3.0;
const TOP = G + F1 + F2;
const AW = 3.2; // carriage arch width
// right-hand range of guest chambers with a gallery on the yard
const RX = 5.8; // its yard face
const GAL = 1.2;
const RG = 3.6; // its storey height
const RTOP = RG * 2;
// stables across the back
const ZBI = -5.4;
const ZB = -10.3;
const BH = 3.4;
const BTOP = BH + 2.3;

/** A shop or tavern opening: a pointed arch with a fold-down counter and a shutter propped up as an awning. */
function bancoOpening(b: Builder, x: number, w: number, wood: number, stone: number): void {
  b.panel(w + 0.5, 3.0, stone, { at: [x, 0, ZF], facing: '+z', shape: 'pointed', depth: 0.05 });
  b.panel(w, 2.75, P.timberBlack, { at: [x, 0, ZF], facing: '+z', shape: 'pointed', depth: 0.07 });
  b.box(w, 0.9, 0.12, wood, { at: [x, 0, ZF + 0.1] });
  b.box(w + 0.1, 0.08, 0.6, wood, { at: [x, 0.9, ZF + 0.3] });
  b.box(w, 0.06, 1.0, tint(wood, 0.06), { at: [x, 2.05, ZF + 0.42], rot: [-0.65, 0, 0] });
  b.sym((s) => b.beam([x + s * (w / 2 - 0.1), 0.95, ZF + 0.55], [x + s * (w / 2 - 0.1), 2.35, ZF + 0.8], 0.05, 0.05, P.oakDark));
}

export const locanda: BuildingDef = {
  id: 'locanda',
  name: 'Locanda',
  style: 'Gothic, central Italian',
  date: 'c. 1380',
  summary:
    'In the age of the communes the town is crowded with merchants, students, pilgrims and envoys, and innkeeping is a business with its own guild, licensed and taxed by the commune. ' +
    'This inn turns a plain stone and plastered front to the street, its upper floors carried out over the pavement on timber brackets, with a tavern selling wine by the jug on the ground floor and a pointed carriage arch beside it. ' +
    'Behind lies a yard with stables for horses and mules, and an outside stone stair up to a timber gallery that gives each chamber its own door. Guests often shared a bed, and the innkeeper had to report strangers to the authorities.',
  materials: ['rubble stone', 'brick', 'lime plaster', 'chestnut timber', 'clay pan-and-cover tiles'],
  lookFor: [
    { label: 'Frasca', note: 'A leafy branch hung out on a pole: the old sign that wine was for sale. Hence the proverb "al buon vino non serve frasca", good wine needs no branch.', at: [-6.4, 4.0, ZF + 2.0] },
    { label: 'Tavern counter', note: 'The lower half of each shutter folds down as a counter and the upper half is propped up as an awning, so wine is sold straight onto the street.', at: [-8.0, 1.2, ZF + 0.6] },
    { label: 'Sporto', note: 'The upper floors jut out over the street on timber brackets, gaining space; Florence and other towns later taxed or banned them.', at: [4.5, G + 0.1, ZF + 0.5] },
    { label: 'Outside stair and gallery', note: 'A stone stair rises from the yard to a timber gallery (ballatoio) giving every chamber its own door.', at: [RX - GAL - 0.6, RG + 0.6, 0.4] },
    { label: 'Stables', note: 'The back range houses travellers’ horses and mules, with the hay stored in the loft above.', at: [-4, 2.0, ZBI + 0.3] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, -0.04), P.tufa]);
    const plaster = b.pick([P.intonacoOchre, P.intonacoCream, tint(P.intonacoOchre, 0.05)]);
    const tile = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const wood = b.pick([P.oak, tint(P.oak, 0.05)]);
    const dark = P.oakDark;

    ground(b, 21.6, 1.2, P.cobble, [0, ZF + 0.85], 0.06);
    ground(b, 2 * XO, ZFI - ZBI, tint(P.cobble, 0.1), [0, (ZFI + ZBI) / 2], 0.04);

    // ---------------- street range: stone ground storey, plastered upper floors jettied out on brackets
    const fw = XO - AW / 2;
    const fz = (ZF + ZFI) / 2;
    b.sym((s) => b.box(fw, G, ZF - ZFI, stone, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.box(AW, G - 3.4, ZF - ZFI, stone, { at: [0, 3.4, fz] });
    // the carriage arch, pointed, with dressed voussoirs
    b.sym((s) => b.extrude([[0, 0], [0.35, 0], [0.35, 3.4], [0, 3.4]], ZF - ZFI, stone, { at: [s * (AW / 2) + (s > 0 ? -0.35 : 0), 0, fz] }));
    b.archWall(AW + 0.7, 3.4, 0.25, stone, { at: [0, 0, ZF + 0.05], facing: '+z', openings: 1, openW: AW - 0.7, openH: 3.25, shape: 'pointed' });
    b.archWall(AW + 0.7, 3.4, 0.25, stone, { at: [0, 0, ZFI - 0.05], facing: '-z', openings: 1, openW: AW - 0.7, openH: 3.25, shape: 'pointed' });
    b.box(AW, 0.06, ZF - ZFI, P.cobble, { at: [0, 0, fz], jitter: false });
    // upper floors
    const z1 = ZF + SP;
    b.box(2 * XO, F1 + F2, z1 - ZFI, plaster, { at: [0, G, (z1 + ZFI) / 2] });
    b.box(2 * XO + 0.06, 0.25, SP + 0.1, wood, { at: [0, G - 0.05, ZF + SP / 2] });
    for (const x of spread(14, -XO + 0.3, XO - 0.3)) {
      b.beam([x, G - 0.9, ZF], [x, G - 0.05, ZF + SP - 0.05], 0.14, 0.14, dark);
      b.box(0.16, 0.16, SP + 0.25, dark, { at: [x, G - 0.2, ZF + SP / 2 - 0.05] });
    }
    // string course and windows: pointed lights on the first floor, small square ones above
    b.box(2 * XO + 0.06, 0.14, 0.08, stone, { at: [0, G + F1 - 0.05, z1 + 0.02] });
    for (const x of [-8.2, -5.0, -1.6, 1.6, 5.0, 8.2]) {
      b.window(0.9, 1.7, { at: [x, G + 0.9, z1], facing: '+z', shape: 'pointed', frame: stone, border: 0.12 });
      b.sym((t) => b.panel(0.45, 1.25, dark, { at: [x + t * 0.72, G + 0.9, z1], facing: '+z', depth: 0.05 }));
      b.window(0.75, 0.75, { at: [x, G + F1 + 0.95, z1], facing: '+z', frame: stone, border: 0.1 });
    }
    // deep eaves on rafter ends
    const fspan = z1 - (ZFI - 0.2);
    // rafter ends show under the eaves
    const fRise = (fspan / 2) * 0.42;
    for (const x of spread(22, -XO, XO)) b.box(0.12, 0.12, 0.7, dark, { at: [x, TOP - 0.48, z1 + 0.3] });
    tiledGable(b, 2 * XO, fspan, fRise, tile, { at: [0, TOP, (z1 + ZFI - 0.2) / 2], overhang: 0.6, wall: plaster, step: 0.9 });
    b.chimney(0.8, 2.0, 0.8, stone, { at: [-6.5, TOP + fRise - 0.8, (z1 + ZFI) / 2 - 0.6] });
    b.box(1.1, 0.12, 1.1, tile, { at: [-6.5, TOP + fRise + 1.3, (z1 + ZFI) / 2 - 0.6] });
    // ground floor: the tavern's two banco openings and door on the left, the inn door on the right
    bancoOpening(b, -8.0, 2.2, wood, P.travertine);
    bancoOpening(b, -4.6, 2.2, wood, P.travertine);
    b.panel(1.2, 2.5, dark, { at: [-2.4 - 0.2, 0, ZF], facing: '+z', shape: 'pointed' });
    frasca(b, [-6.4, G - 0.2, ZF], '+z', 1.9);
    b.panel(1.3, 2.6, dark, { at: [3.4, 0, ZF], facing: '+z', shape: 'pointed' });
    b.panel(1.6, 2.85, P.travertine, { at: [3.4, 0, ZF], facing: '+z', shape: 'pointed', depth: 0.04 });
    for (const x of [6.4, 8.8]) {
      b.window(0.8, 0.8, { at: [x, 1.8, ZF], facing: '+z', frame: P.travertine, glass: P.timberBlack, bars: [3, 3] });
    }
    // a stone bench along the front, and the commune's arms
    b.box(5.5, 0.45, 0.4, P.travertine, { at: [7.2, 0, ZF + 0.2] });
    b.panel(0.7, 0.9, P.white, { at: [5.0, 2.6, ZF], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(0.5, 0.35, P.doorRed, { at: [5.0, 2.9, ZF], facing: '+z', depth: 0.08 });
    // yard face of the street range
    for (const x of [-7.5, -3.6, 3.6]) {
      b.window(0.8, 1.2, { at: [x, G + 1.0, ZFI], facing: '-z', shape: 'segmental', frame: stone });
      b.window(0.7, 0.8, { at: [x, G + F1 + 0.9, ZFI], facing: '-z', frame: stone });
    }
    b.panel(1.2, 2.3, dark, { at: [-5.5, 0, ZFI], facing: '-z', shape: 'segmental' });
    b.sym((s) => b.window(0.8, 0.8, { at: [s * XO, G + 1.2, fz], facing: s > 0 ? '+x' : '-x', frame: stone }));

    // ---------------- right range: guest chambers on two floors, a gallery and an outside stair
    const rLen = ZFI - ZBI;
    const rz = (ZFI + ZBI) / 2;
    const rxm = (RX + XO) / 2;
    b.box(XO - RX, RTOP, rLen, plaster, { at: [rxm, 0, rz] });
    b.box(XO - RX + 0.04, 1.0, rLen + 0.04, stone, { at: [rxm, 0, rz] });
    for (const z of spread(3, ZBI + 0.4, ZFI - 0.4)) {
      b.window(0.8, 1.1, { at: [XO, 1.4, z], facing: '+x', frame: stone, glass: P.timberBlack, bars: [2, 2] });
      b.window(0.8, 1.2, { at: [XO, RG + 1.0, z], facing: '+x', shape: 'segmental', frame: stone });
      b.panel(1.0, 2.2, dark, { at: [RX, 0, z - 0.6], facing: '-x', shape: 'segmental' });
      b.panel(0.9, 2.1, dark, { at: [RX, RG, z - 0.6], facing: '-x' });
      b.window(0.6, 0.8, { at: [RX, RG + 1.2, z + 0.7], facing: '-x', frame: stone });
    }
    // the gallery on posts and brackets
    const gx = RX - GAL / 2;
    b.box(GAL, 0.16, rLen, wood, { at: [gx, RG - 0.16, rz] });
    for (const z of spread(6, ZBI + 0.2, ZFI - 0.2)) {
      b.box(0.16, RG - 0.16, 0.16, dark, { at: [RX - GAL + 0.1, 0, z] });
      b.box(0.14, RTOP - RG, 0.14, dark, { at: [RX - GAL + 0.1, RG, z] });
      b.beam([RX - GAL + 0.1, RG - 0.9, z], [RX - 0.4, RG - 0.2, z], 0.1, 0.1, dark);
    }
    b.box(0.1, 0.1, rLen, dark, { at: [RX - GAL + 0.1, RG + 0.95, rz] });
    for (const z of spread(Math.round(rLen / 0.35), ZBI + 0.1, ZFI - 0.1)) {
      b.box(0.05, 0.9, 0.05, wood, { at: [RX - GAL + 0.1, RG, z], jitter: false });
    }
    // outside stone stair climbing to the gallery, over a little arch
    const stX = RX - GAL - 0.55;
    b.stairs(1.0, RG, 3.6, 12, stone, { at: [stX, 0, 2.6] });
    b.box(1.0, RG, 1.0, stone, { at: [stX, 0, 0.3] });
    b.panel(0.6, 1.4, P.timberBlack, { at: [stX - 0.5, 0, 0.3], facing: '-x', shape: 'round', depth: 0.03 });
    b.beam([stX - 0.45, 0.75, 4.4], [stX - 0.45, RG + 0.45, 0.8], 0.14, 0.6, stone);
    b.box(0.14, 0.6, 1.0, stone, { at: [stX - 0.45, RG + 0.15, 0.3] });
    // roof over range and gallery, sloping to the yard and the outside
    const rspan = XO - (RX - GAL);
    tiledGable(b, rspan, rLen + 0.0, (rspan / 2) * 0.42, tile, { at: [XO - rspan / 2, RTOP, rz], ridge: 'z', overhang: 0.5, wall: plaster, step: 0.9 });

    // ---------------- left side: a high wall with a lean-to cart shed
    b.box(0.5, 4.2, rLen, stone, { at: [-XO + 0.25, 0, rz] });
    for (const z of spread(4, ZBI + 0.3, ZFI - 0.3)) b.box(0.2, 3.0, 0.2, dark, { at: [-XO + 3.0, 0, z] });
    b.box(0.2, 0.22, rLen, dark, { at: [-XO + 3.0, 3.0, rz] });
    tiledShed(b, 3.4, rLen, 1.2, tile, { at: [-XO + 1.7, 3.1, rz], high: '-x' });
    // a cart and barrels under it
    b.group({ at: [-XO + 1.7, 0, 0.5] }, () => {
      b.box(1.5, 0.5, 2.6, wood, { at: [0, 0.75, 0] });
      b.sym((s) => b.log(0.6, 0.1, dark, { at: [s * 0.82, 0, 0], segs: 10 }));
      b.sym((s) => b.beam([s * 0.35, 0.8, 1.3], [s * 0.3, 0.05, 3.0], 0.09, 0.09, wood));
    });
    for (const [x, z] of [[-XO + 1.0, -3.2], [-XO + 1.7, -3.6], [-XO + 1.2, -4.3]] as const) barrel(b, [x, 0, z]);

    // ---------------- stables with a hayloft across the back
    const bz = (ZB + ZBI) / 2;
    b.box(2 * XO, BTOP, ZBI - ZB, stone, { at: [0, 0, bz] });
    b.box(2 * XO + 0.04, BTOP - BH, ZBI - ZB + 0.04, tint(plaster, -0.03), { at: [0, BH, bz] });
    for (const x of [-7.6, -3.8, 0, 3.8]) {
      b.panel(1.8, 2.7, P.timberBlack, { at: [x, 0, ZBI], facing: '+z', shape: 'segmental' });
      b.panel(1.5, 2.45, wood, { at: [x - 0.12, 0, ZBI + 0.06], facing: '+z', rotY: -0.25 });
      b.panel(1.0, 0.9, dark, { at: [x, BH + 0.4, ZBI], facing: '+z' });
    }
    b.box(1.6, 0.1, 0.8, wood, { at: [-3.8, BH + 0.3, ZBI + 0.4] });
    for (const x of spread(6, -XO + 1, XO - 1)) b.panel(0.3, 0.6, P.timberBlack, { at: [x, 2.0, ZB], facing: '-z' });
    tiledGable(b, 2 * XO, ZBI - ZB, ((ZBI - ZB) / 2) * 0.42, tile, { at: [0, BTOP, bz], overhang: 0.3, wall: stone, step: 0.9 });

    // ---------------- the yard: a well with its pulley arch, a trough, a mounting block
    b.cyl(0.7, 0.9, P.travertine, { at: [-1.6, 0, -1.6], segs: 8 });
    b.cyl(0.55, 0.05, P.windowDark, { at: [-1.6, 0.88, -1.6], segs: 8 });
    b.sym((s) => b.box(0.16, 1.6, 0.16, P.iron, { at: [-1.6 + s * 0.65, 0.9, -1.6] }));
    b.extrude([[-0.75, 0], [0.75, 0], [0.75, 0.1], [0, 0.6], [-0.75, 0.1]], 0.1, P.iron, { at: [-1.6, 2.45, -1.6] });
    b.cyl(0.14, 0.12, P.oakDark, { at: [-1.6, 2.3, -1.6], segs: 8, rot: [Math.PI / 2, 0, 0] });
    b.box(2.6, 0.7, 0.8, P.travertine, { at: [-3.6, 0, ZBI + 1.0] });
    b.box(2.4, 0.05, 0.6, P.water, { at: [-3.6, 0.64, ZBI + 1.0], jitter: false });
    b.stairs(1.2, 0.8, 1.0, 3, P.travertine, { at: [2.0, 0, 2.8], rotY: -Math.PI / 2 });
    barrel(b, [1.0, 0, -4.2]);

    // ---------------- colliders: the ranges and the yard wall; the arch, the yard and the gallery stair stay open
    b.sym((s) => b.collider(fw, ZF - ZFI, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.collider(XO - RX, rLen, { at: [rxm, 0, rz] });
    b.collider(0.5, rLen, { at: [-XO + 0.25, 0, rz] });
    b.collider(2 * XO, ZBI - ZB, { at: [0, 0, bz] });
  },
};
