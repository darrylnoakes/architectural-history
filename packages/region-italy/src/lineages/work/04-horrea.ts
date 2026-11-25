import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, amphora, boat, flatRing, lin, quayWall, roofRise } from './shared';

// the warehouse's plan, shared with the boat mills that use its ruin
export const POD = 0.9; // raised floor
export const HW = 28; // width along the river
export const HZ0 = -7; // river face
export const HZ1 = 8; // street face
export const DW = 4.2; // depth of the ranges of rooms
const ARC_H = 3.8; // courtyard arcade
const GAL = 1.6; // gallery depth
const STOREY = 4.0; // ground storey of the ranges
const CW = HW - 2 * DW; // courtyard width

/** One bay of the ground storey of a range of storerooms (the ranges are built of such bays). */
export function storeBay(b: Builder, color: number, x: number, z: number, w: number, d: number): void {
  b.box(w, STOREY, d, color, { at: [x, POD, z] });
}

/** A third of the arcade along the street side of the courtyard: k = -1, 0 or 1 from left to right. */
export function courtArcade(b: Builder, color: number, k: number): void {
  const len = CW / 3;
  b.archWall(len, ARC_H, 0.5, color, { at: [k * len, POD, HZ1 - DW - GAL], facing: '-z', openings: 2, openW: len / 2 - 0.8, openH: ARC_H - 0.5, shape: 'round' });
}

/** The x of the buttresses along the river face. */
export const BUTTRESS_X = lin(8, -HW / 2 + 1.5, HW / 2 - 1.5);
/** One brick buttress on the river face, at full height. */
export function buttress(b: Builder, color: number, x: number): void {
  b.box(0.8, 7.2, 0.6, color, { at: [x, POD, HZ0 - 0.3] });
}

/** The street door's two engaged brick columns on travertine bases, with their capitals and the beam over them. */
export function gateColumns(b: Builder, brick: number, trav: number): void {
  const front = HZ1;
  b.sym((s) => {
    b.cyl(0.3, 0.35, trav, { at: [s * 1.9, POD, front + 0.25], segs: 10 });
    b.cyl(0.25, 3.5, brick, { at: [s * 1.9, POD + 0.35, front + 0.25], segs: 10 });
    b.box(0.7, 0.3, 0.7, trav, { at: [s * 1.9, POD + 3.85, front + 0.25] });
  });
  b.box(4.6, 0.45, 0.6, brick, { at: [0, POD + 4.15, front + 0.25] });
}

/** A travertine mooring stone set in the quay face: a projecting block pierced by a hole for the rope. */
export function mooringStone(b: Builder, x: number, y: number, color: number) {
  b.box(0.7, 0.55, 0.5, color, { at: [x, y, BANK - 0.2] });
  flatRing(b, 0.2, 0.09, 0.56, tint(color, -0.25), [x, y - 0.005, BANK - 0.33], 10);
}

export const horrea: BuildingDef = {
  id: 'horrea',
  name: 'River warehouse (horrea)',
  style: 'Roman Imperial',
  date: 'c. AD 150',
  summary:
    'At the height of the empire the riverside is given over to a warehouse, where grain, oil and wine brought upriver by barge were stored for the town’s merchants. ' +
    'Like the warehouses of Ostia it is built round a courtyard: rows of deep, narrow rooms on two floors open onto an arcade, behind thick brick-faced concrete walls with few, small windows, to keep the goods cool, dry and safe from thieves. ' +
    'The floor stands on a raised base against damp and floods, with a ramp up from the quay, and the only show is the brick doorway with its columns and pediment. ' +
    'Concrete faced with fine red brick (opus testaceum) is now the normal way to build.',
  materials: ['concrete faced with brick', 'travertine', 'roof tiles', 'timber'],
  modelledOn: 'The Horrea Epagathiana et Epaphroditiana, Ostia (c. AD 145 to 150), simplified',
  lookFor: [
    { label: 'Brick doorway', note: 'The one piece of display: two brick columns and a pediment framing the gate, with an inscription naming the owners.', at: [0, 4.6, 8.6] },
    { label: 'Arcaded courtyard', note: 'Storerooms on two floors open off a courtyard with an arcade, so carts and porters could reach every door.', at: [-5, 3.4, 2.0] },
    { label: 'Buttressed walls', note: 'Brick piers stiffen the outer walls against the weight of grain pressing on them from inside.', at: [-14.3, 5.0, -4.0] },
    { label: 'Loading ramp', note: 'Sacks and amphorae were carried up from the barges into the raised warehouse floor.', at: [6, 1.0, -8.6] },
    { label: 'Mooring stones', note: 'Blocks of travertine pierced with a hole, set in the quay wall for tying up the barges.', at: [-6, 0.4, -11.5] },
  ],
  influences: ['roman-concrete'],
  build(b) {
    const brick = b.pick([P.brickOrange, P.cotto, tint(P.brickOrange, 0.04)]);
    const trav = P.travertine;
    const tile = P.romanTile;
    const pod = POD;
    const H = 8.2; // two storeys above the podium
    const W = HW;
    const z0 = HZ0;
    const z1 = HZ1;
    const dw = DW;
    const cx0 = -W / 2 + dw;
    const cx1 = W / 2 - dw;
    const cz0 = z0 + dw;
    const cz1 = z1 - dw;

    // ---- the quay: travertine-faced river wall, paving, mooring stones
    quayWall(b, tint(trav, -0.04));
    b.box(36.1, 0.2, 1.1, trav, { at: [0, 0.1, BANK + 0.3] });
    b.box(36, 0.06, z0 - BANK, P.paving, { at: [0, 0, (z0 + BANK) / 2], jitter: false });
    for (const x of [-14, -6, 2, 10]) mooringStone(b, x, -0.4, trav);
    // steps down to the water at one end
    b.stairs(2.2, -WATER + 0.3, 1.8, 6, trav, { at: [-16.4, WATER - 0.3, BANK - 0.7], rotY: Math.PI });

    // ---- raised base and the four ranges of rooms round the courtyard
    b.box(W + 0.6, pod, z1 - z0 + 0.6, tint(trav, -0.05), { at: [0, 0, (z0 + z1) / 2] });
    const range = (x: number, z: number, w: number, d: number, ridge: 'x' | 'z') => {
      // the ground storey in bays of about seven metres, the upper storey over it
      const along = ridge === 'x' ? w : d;
      const n = Math.max(1, Math.round(along / 7));
      for (let i = 0; i < n; i++) {
        const c = -along / 2 + (i + 0.5) * (along / n);
        if (ridge === 'x') storeBay(b, brick, x + c, z, w / n, d);
        else storeBay(b, brick, x, z + c, w, d / n);
      }
      b.box(w, H - STOREY, d, brick, { at: [x, pod + STOREY, z] });
      const span = ridge === 'x' ? d : w;
      b.gable(w, d, roofRise(span, 20), tile, { at: [x, pod + H, z], ridge, overhang: 0.4, wall: brick });
      // a travertine string course at the first floor
      b.box(w + 0.06, 0.18, d + 0.06, trav, { at: [x, pod + 4.0, z] });
    };
    range(0, z1 - dw / 2, W, dw, 'x');
    range(0, z0 + dw / 2, W, dw, 'x');
    range(-W / 2 + dw / 2, (cz0 + cz1) / 2, dw, cz1 - cz0, 'z');
    range(W / 2 - dw / 2, (cz0 + cz1) / 2, dw, cz1 - cz0, 'z');

    // ---- buttresses (brick piers) along the back and the sides, string course over them
    for (const x of BUTTRESS_X) buttress(b, tint(brick, -0.04), x);
    b.sym((s) => {
      for (const z of lin(5, z0 + 1.5, z1 - 1.5)) b.box(0.6, H - 1.0, 0.8, tint(brick, -0.04), { at: [s * (W / 2 + 0.3), pod, z] });
    });
    // small high slit windows for air, never for light or thieves
    for (const x of lin(7, -W / 2 + 3.4, W / 2 - 3.4)) {
      b.panel(0.35, 0.9, P.timberBlack, { at: [x, pod + 2.6, z0], facing: '-z' });
      b.panel(0.35, 0.9, P.timberBlack, { at: [x, pod + 6.2, z0], facing: '-z' });
    }
    b.sym((s) => {
      for (const z of lin(4, z0 + 3.4, z1 - 3.4)) {
        b.panel(0.35, 0.9, P.timberBlack, { at: [s * W / 2, pod + 6.2, z], facing: s > 0 ? '+x' : '-x' });
      }
    });

    // ---- the river door and the loading ramp up from the quay
    b.panel(2.6, 3.4, P.timberBlack, { at: [6, pod, z0], facing: '-z', shape: 'round' });
    b.box(3.4, 0.35, 0.25, trav, { at: [6, pod + 3.4, z0 - 0.1] });
    b.group({ at: [6, 0, z0 - 2.0] }, () => {
      // a sloping wedge of masonry with a travertine top
      b.shed(2.8, 3.4, pod, tint(trav, -0.05), { high: '+z' });
      b.beam([-1.4, 0.1, -1.7], [-1.4, pod + 0.1, 1.7], 0.2, 0.25, trav);
      b.beam([1.4, 0.1, -1.7], [1.4, pod + 0.1, 1.7], 0.2, 0.25, trav);
    });
    b.deck(2.8, 3.4, pod / 2, { at: [6, 0, z0 - 2.0] });
    b.panel(1.6, 2.6, P.oakDark, { at: [-6, pod, z0], facing: '-z', shape: 'round' });
    b.stairs(2.0, pod, 1.3, 4, trav, { at: [-6, 0, z0 - 0.65], rotY: Math.PI });

    // ---- the street front: shops either side of the decorated gate
    const front = z1;
    b.stairs(5.0, pod, 1.6, 4, trav, { at: [0, 0, front + 0.8] });
    b.panel(2.4, 3.6, P.timberBlack, { at: [0, pod, front], facing: '+z', shape: 'round' });
    gateColumns(b, tint(brick, 0.05), trav); // engaged brick columns on travertine bases
    b.extrude(
      [
        [-2.5, 0],
        [2.5, 0],
        [0, 1.1],
      ],
      0.5,
      tint(brick, 0.05),
      { at: [0, pod + 4.6, front + 0.25] },
    );
    b.panel(2.6, 0.5, P.marble, { at: [0, pod + 3.75, front + 0.02], facing: '+z' }); // inscription
    for (const x of [-10.5, -6, 6, 10.5]) {
      b.panel(2.6, 3.0, P.timberBlack, { at: [x, pod, front], facing: '+z' });
      b.box(3.0, 0.3, 0.12, trav, { at: [x, pod + 3.0, front + 0.06] });
      b.window(0.9, 1.0, { at: [x, pod + 5.0, front], facing: '+z', frame: trav, glass: P.timberBlack, bars: [2, 1] });
    }
    for (const x of [-10.5, -6, 6, 10.5]) b.box(2.4, 0.9, 0.5, trav, { at: [x, pod, front - 0.4] }); // shop counters
    // an amphora rack in one shop doorway
    for (let i = 0; i < 3; i++) amphora(b, [-11.3 + i * 0.6, pod, front + 0.4]);

    // ---- the courtyard: arcades on piers, an upper gallery, a stair, goods waiting
    const cw = cx1 - cx0;
    const cd = cz1 - cz0;
    b.box(cw, 0.06, cd, P.paving, { at: [0, pod, (cz0 + cz1) / 2], jitter: false });
    const gal = 1.6;
    const ah = 3.8;
    const arcade = (len: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x', n: number) =>
      b.archWall(len, ah, 0.5, brick, { at, facing, openings: n, openW: len / n - 0.8, openH: ah - 0.5, shape: 'round' });
    for (const k of [-1, 0, 1]) courtArcade(b, brick, k);
    arcade(cw, [0, pod, cz0 + gal], '+z', 6);
    arcade(cd - gal * 2, [cx0 + gal, pod, (cz0 + cz1) / 2], '+x', 1);
    arcade(cd - gal * 2, [cx1 - gal, pod, (cz0 + cz1) / 2], '-x', 1);
    // gallery floor on top of the arcades (the balcony of the upper rooms)
    b.box(cw, 0.25, gal + 0.25, tint(brick, -0.08), { at: [0, pod + ah, cz1 - gal / 2] });
    b.box(cw, 0.25, gal + 0.25, tint(brick, -0.08), { at: [0, pod + ah, cz0 + gal / 2] });
    b.box(gal + 0.25, 0.25, cd, tint(brick, -0.08), { at: [cx0 + gal / 2, pod + ah, (cz0 + cz1) / 2] });
    b.box(gal + 0.25, 0.25, cd, tint(brick, -0.08), { at: [cx1 - gal / 2, pod + ah, (cz0 + cz1) / 2] });
    // timber railing on the gallery
    b.box(cw - gal * 2, 0.9, 0.08, P.oak, { at: [0, pod + ah + 0.25, cz1 - gal] });
    b.box(cw - gal * 2, 0.9, 0.08, P.oak, { at: [0, pod + ah + 0.25, cz0 + gal] });
    // doors of the storerooms behind the arcades
    for (const x of lin(6, cx0 + 1.6, cx1 - 1.6)) {
      b.panel(1.1, 2.2, P.oakDark, { at: [x, pod, cz1], facing: '-z' });
      b.panel(1.1, 2.2, P.oakDark, { at: [x, pod, cz0], facing: '+z' });
      b.panel(1.0, 2.0, P.oakDark, { at: [x, pod + ah + 0.25, cz1], facing: '-z' });
      b.panel(1.0, 2.0, P.oakDark, { at: [x, pod + ah + 0.25, cz0], facing: '+z' });
    }
    // a brick stair up to the gallery
    b.stairs(1.2, ah, 4.6, 12, brick, { at: [cx1 - gal - 1.0, pod, (cz0 + cz1) / 2 + 0.4], rotY: Math.PI / 2 });
    for (let i = 0; i < 6; i++) amphora(b, [-3 + (i % 3) * 0.6, pod + 0.05, (cz0 + cz1) / 2 - 0.4 + Math.floor(i / 3) * 0.6]);
    for (let i = 0; i < 4; i++) b.blob(0.35, P.wattle, { at: [2.5 + (i % 2) * 0.7, pod + 0.3, (cz0 + cz1) / 2 + Math.floor(i / 2) * 0.6 - 0.3], stretch: [1, 0.9, 1.2] });

    // ---- a river barge (navis caudicaria) at the quay, loaded with amphorae
    boat(b, [-3, 0, BANK - 2.4], 9, 2.8, P.oak);
    for (let i = 0; i < 8; i++) amphora(b, [-5.5 + (i % 4) * 1.1, WATER + 0.55, BANK - 2.0 - Math.floor(i / 4) * 0.8], P.terracotta);
    b.box(0.16, 3.6, 0.16, P.oak, { at: [0.2, WATER + 0.5, BANK - 2.4] }); // towing mast
    b.beam([-14, -0.1, BANK - 0.5], [-7.2, WATER + 0.7, BANK - 2.4], 0.04, 0.04, P.wattle);

    b.collider(W + 1.4, z1 - z0 + 1.4, { at: [0, 0, (z0 + z1) / 2] });
  },
};
