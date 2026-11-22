import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { patch, pump, tileRoof, wallRects, washing } from './shared';

const SF = 7.6; // street face of the front range
const SB = 3.8; // its back
const SG = 3.0; // ground storey of the street houses
const SU = 2.7;
const CW = 3.4; // width of the court
const RD = 4.0; // depth of a court house
const RG = 2.55; // court houses: ground storey
const RU = 2.3; // and the room above
const RZ0 = SB - 0.2; // the rows run from here...
const HW = 3.3; // ...in houses this wide
const NR = 3; // per row
const RZ1 = RZ0 - NR * HW;
const PZ0 = -7.8; // privy block at the end of the court
const PZ1 = RZ1 + 0.2;

/** A segmental-headed window in brick with a white frame, on a wall facing `f` at (x|z) along it. */
function brickWindow(b: Builder, at: [number, number, number], w: number, h: number, f: '+z' | '-z' | '+x' | '-x', head: number): void {
  b.panel(w + 0.3, h + 0.22, head, { at: [at[0], at[1] - 0.06, at[2]], facing: f, shape: 'segmental', depth: 0.03 });
  b.window(w, h, { at, facing: f, frame: P.white, glass: P.windowDark, bars: [2, 2], border: 0.07 });
  // a stone or blue-brick sill
  const along = f === '+z' || f === '-z';
  const o = f === '+z' ? [0, 0.08] : f === '-z' ? [0, -0.08] : f === '+x' ? [0.08, 0] : [-0.08, 0];
  b.box(along ? w + 0.2 : 0.16, 0.08, along ? 0.16 : w + 0.2, P.pierreBlonde, { at: [at[0] + o[0], at[1] - 0.1, at[2] + o[1]] });
}

/**
 * One row of court houses along Z. `side` is +1 for the row on the +x side of the court (its fronts face -x)
 * and -1 for the other. `cx` is the court's centre line.
 */
function courtRow(b: Builder, cx: number, side: 1 | -1, brick: number, roof: number): void {
  const xf = cx + side * (CW / 2); // the front wall, on the court
  const xc = xf + side * (RD / 2);
  const f = side > 0 ? '-x' : '+x';
  const L = RZ0 - RZ1;
  const zc = (RZ0 + RZ1) / 2;
  const top = RG + RU;
  b.box(RD, top, L, brick, { at: [xc, 0, zc] });
  b.box(RD + 0.04, 0.35, L + 0.04, tint(brick, -0.15), { at: [xc, 0, zc] }); // tarred plinth
  b.box(RD + 0.06, 0.12, L + 0.06, tint(brick, 0.06), { at: [xc, RG - 0.05, zc] }); // floor band
  tileRoof(b, RD, L, 38, roof, { at: [xc, top, zc], ridge: 'z', ov: 0.25, ribs: 0.7, wall: brick });
  const head = tint(brick, -0.1);
  for (let i = 0; i < NR; i++) {
    const z = RZ0 - (i + 0.5) * HW;
    const s = side > 0 ? 1 : -1; // door to the left as you face the house, consistently
    const dz = z + s * 0.75;
    const wz = z - s * 0.6;
    b.panel(1.0, 2.15, head, { at: [xf, 0.12, dz], facing: f, shape: 'segmental', depth: 0.03 });
    b.panel(0.82, 2.0, b.pick([P.doorGreen, P.oak, P.doorBlue, P.oakDark]), { at: [xf, 0.12, dz], facing: f, depth: 0.06 });
    b.box(0.35, 0.12, 1.0, P.pierreBlonde, { at: [xf - side * 0.17, 0, dz] }); // the doorstep
    brickWindow(b, [xf, 0.95, wz], 0.9, 1.25, f, head);
    brickWindow(b, [xf, RG + 0.6, z], 0.8, 1.1, f, head);
    // the party walls show as a slight step in the roof line
    if (i > 0) b.box(RD + 0.1, 0.2, 0.25, tint(brick, -0.05), { at: [xc, top - 0.05, RZ0 - i * HW] });
    // a single small chimney per house on the back slope
    b.chimney(0.5, 1.2, 0.45, brick, { at: [xc + side * 0.9, top + 0.6, z + 0.6], pots: 1 });
  }
}

/** A street house of the front range, with its own door and windows. Returns nothing. */
function streetFront(b: Builder, x0: number, x1: number, brick: number, o: { cafe: boolean; doorSide: 1 | -1 }): void {
  const w = x1 - x0;
  const xc = (x0 + x1) / 2;
  const head = tint(brick, -0.1);
  if (o.cafe) {
    // the estaminet: a wide shop window and a painted fascia
    b.panel(w - 0.4, 0.45, P.doorGreen, { at: [xc, 2.45, SF], facing: '+z', depth: 0.06 });
    b.panel(w - 0.6, 0.18, P.cream, { at: [xc, 2.58, SF + 0.04], facing: '+z', depth: 0.03 });
    b.window(w * 0.5, 1.8, { at: [xc - o.doorSide * w * 0.18, 0.55, SF], facing: '+z', frame: P.doorGreen, glass: P.glassDark, bars: [3, 2], border: 0.08, mat: 'glass' });
    b.panel(0.95, 2.25, P.doorGreen, { at: [xc + o.doorSide * (w / 2 - 0.85), 0.1, SF], facing: '+z', depth: 0.06 });
  } else {
    b.panel(1.05, 2.4, head, { at: [xc + o.doorSide * (w / 2 - 0.85), 0.1, SF], facing: '+z', shape: 'segmental', depth: 0.03 });
    b.panel(0.85, 2.2, b.pick([P.doorGreen, P.doorRed, P.doorBlue]), { at: [xc + o.doorSide * (w / 2 - 0.85), 0.15, SF], facing: '+z', depth: 0.06 });
    brickWindow(b, [xc - o.doorSide * 0.6, 0.95, SF], 1.0, 1.55, '+z', head);
  }
  for (const s of [-1, 1]) if (w > 4.4 || s > 0) brickWindow(b, [xc + (w > 4.4 ? s * w * 0.22 : 0), SG + 0.6, SF], 0.95, 1.45, '+z', head);
  // back windows on the yards
  brickWindow(b, [xc, SG + 0.6, SB], 0.9, 1.3, '-z', head);
  brickWindow(b, [xc + 0.6, 0.95, SB], 0.9, 1.2, '-z', head);
}

export const couree: BuildingDef = {
  id: 'couree',
  name: 'Courée',
  style: 'Industrial workers’ housing',
  date: 'c. 1850',
  summary:
    'When the textile mills of the north filled with workers from the countryside and from Belgium, builders and mill-owners filled the back land behind the street houses with courées: two rows of tiny brick houses facing each other across a court a few metres wide, reached from the street by a narrow passage. ' +
    'Each house had one room downstairs and one above, with no water and no drain; the whole court shared one pump and one block of privies at the far end, and its waste ran away in a gutter down the middle. ' +
    'Lille, Roubaix and Tourcoing had well over a thousand of them between them by the end of the century; they were cheap to build, profitable to let and, as the doctors of the time reported, deadly in epidemics.',
  materials: ['red brick', 'clay pantiles', 'slate', 'cast-iron pump', 'stone sills'],
  modelledOn: 'The courées of Lille and Roubaix (mid to late nineteenth century), in general terms',
  lookFor: [
    { label: 'The court', note: 'Two rows of one-up, one-down houses face each other across a strip of setts barely three and a half metres wide.', at: [-1.5, 0.4, -1.0] },
    { label: 'Entrance passage', note: 'The court is reached through a narrow passage under the street houses, so that from the street it can hardly be seen.', at: [-1.5, 1.4, SF + 0.3] },
    { label: 'Shared pump', note: 'One cast-iron pump supplied all the families of the court with water.', at: [-1.5, 1.6, -2.4] },
    { label: 'Privy block', note: 'A row of privies at the end of the court, shared by every household, emptied by hand.', at: [-1.5, 2.2, PZ1] },
    { label: 'Central gutter', note: 'Waste water from every house ran down an open channel in the middle of the court.', at: [-1.5, 0.15, 1.6] },
  ],
  build(b) {
    const hero = b.variant === 0;
    const cx = hero ? -1.5 : b.pick([-2.4, -0.8, 1.2]);
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, -0.03), mix(P.briqueNord, P.brickRed, 0.5)]);
    const pantile = b.pick([P.terracotta, mix(P.terracotta, P.tuilePlate, 0.5), P.brickOrange]);
    const slate = P.ardoise;

    // pavement and the setts of the court
    patch(b, 25.6, 8 - SF, P.paving, [0, (SF + 8) / 2], 0.12);
    patch(b, CW, RZ0 - PZ0, P.cobble, [cx, (RZ0 + PZ0) / 2], 0.06);
    patch(b, 0.3, RZ0 - PZ1, tint(P.cobble, -0.2), [cx, (RZ0 + PZ1) / 2], 0.075); // the gutter

    // ------------------------------------------------ the street range, cut by the passage to the court
    const pw = 1.3; // the passage
    const SD = SF - SB;
    const top = SG + SU;
    const xs = [-12.8, cx - pw / 2, cx + pw / 2, 12.8];
    for (const [a, c] of [[xs[0], xs[1]], [xs[2], xs[3]]]) {
      b.box(c - a, top, SD, brick, { at: [(a + c) / 2, 0, (SF + SB) / 2] });
      b.collider(c - a, SD, { at: [(a + c) / 2, 0, (SF + SB) / 2] });
    }
    // the room over the passage
    b.box(pw, top - 2.7, SD, brick, { at: [cx, 2.7, (SF + SB) / 2] });
    b.panel(pw + 0.4, 2.9, tint(brick, -0.1), { at: [cx, 0, SF], facing: '+z', shape: 'segmental', depth: 0.03 });
    b.panel(pw, 2.7, mix(P.windowDark, P.cobble, 0.3), { at: [cx, 0, SF], facing: '+z', shape: 'segmental', depth: 0.01 });
    b.panel(0.8, 0.35, P.white, { at: [cx, 3.2, SF], facing: '+z', depth: 0.05 }); // the court's name plate
    patch(b, pw, SD, P.cobble, [cx, (SF + SB) / 2], 0.06);
    // cornice, plinth, slate roof with dormers
    b.box(25.6, 0.25, SD + 0.15, tint(brick, 0.06), { at: [0, top - 0.25, (SF + SB) / 2] });
    b.box(25.6, 0.5, 0.06, tint(brick, -0.15), { at: [0, 0, SF + 0.02] });
    const rh = tileRoof(b, 25.6, SD, 40, slate, { at: [0, top, (SF + SB) / 2], ov: 0.3 });
    // house widths along the street on either side of the passage
    const left = xs[1] - xs[0];
    const right = xs[3] - xs[2];
    const nl = left > 8 ? 2 : 1;
    const nr = right > 8 ? 2 : 1;
    const cafeSide = b.chance(0.5) ? 0 : 1;
    let k = 0;
    for (let i = 0; i < nl; i++) {
      const a = xs[0] + (left * i) / nl;
      streetFront(b, a, a + left / nl, brick, { cafe: cafeSide === 0 && i === nl - 1, doorSide: i % 2 === 0 ? 1 : -1 });
      if (i > 0) b.box(0.3, top - 0.25, 0.1, tint(brick, 0.04), { at: [a, 0, SF + 0.03] });
      k++;
    }
    for (let i = 0; i < nr; i++) {
      const a = xs[2] + (right * i) / nr;
      streetFront(b, a, a + right / nr, brick, { cafe: cafeSide === 1 && i === 0, doorSide: i % 2 === 0 ? -1 : 1 });
      k++;
    }
    for (let i = 0; i < k; i++) {
      const x = -11.5 + (23 * i) / Math.max(1, k - 1);
      b.chimney(0.6, 1.0, 0.5, brick, { at: [x, top + rh - 0.4, (SF + SB) / 2], pots: 2 });
    }

    // ------------------------------------------------ the two rows of the court
    courtRow(b, cx, 1, brick, pantile);
    courtRow(b, cx, -1, tint(brick, -0.03), pantile);
    for (const s of [-1, 1]) b.collider(RD, RZ0 - RZ1, { at: [cx + s * (CW / 2 + RD / 2), 0, (RZ0 + RZ1) / 2] });

    // the privy block at the end, three doors under a lean-to
    const pd = PZ1 - PZ0;
    b.box(CW + 0.4, 2.1, pd, brick, { at: [cx, 0, (PZ0 + PZ1) / 2] });
    b.shed(CW + 0.6, pd + 0.3, 0.45, pantile, { at: [cx, 2.1, (PZ0 + PZ1) / 2], high: '-z' });
    for (let i = 0; i < 3; i++) {
      const x = cx - CW / 2 + 0.6 + i * ((CW - 1.2) / 2);
      b.panel(0.7, 1.75, P.oak, { at: [x, 0.1, PZ1], facing: '+z', depth: 0.05 });
      b.panel(0.2, 0.15, P.windowDark, { at: [x, 1.55, PZ1 + 0.06], facing: '+z', depth: 0.02 });
    }
    b.collider(CW + 0.4, pd, { at: [cx, 0, (PZ0 + PZ1) / 2] });

    // the pump, washing across the court, a tub and a handcart
    pump(b, cx + 0.9, -2.4, -Math.PI / 2);
    washing(b, [cx - CW / 2, RG + 0.5, RZ0 - HW * 0.7], [cx + CW / 2, RG + 0.5, RZ0 - HW * 0.85], 4);
    washing(b, [cx - CW / 2, RG + 0.4, RZ0 - HW * 2.3], [cx + CW / 2, RG + 0.6, RZ0 - HW * 2.2], 3);
    b.cyl(0.35, 0.4, P.oak, { at: [cx - 1.1, 0.06, -4.6], segs: 8 });

    // ------------------------------------------------ the yards either side: walls, wash-houses, a mill wall behind
    const yz = (SB + PZ0) / 2;
    const yd = SB - PZ0 - 0.2;
    const xL0 = -12.8;
    const xL1 = cx - CW / 2 - RD;
    const xR0 = cx + CW / 2 + RD;
    const xR1 = 12.8;
    for (const [a, c] of [[xL0, xL1], [xR0, xR1]]) {
      if (c - a < 1) continue;
      patch(b, c - a, yd, mix(P.earth, P.cobble, 0.4), [(a + c) / 2, yz], 0.04);
      // a wash-house against the back wall
      const ww = Math.min(3.2, c - a - 0.4);
      const wx = c - ww / 2 - 0.2;
      b.box(ww, 2.3, 2.2, tint(brick, 0.03), { at: [wx, 0, PZ0 + 1.3] });
      b.shed(ww + 0.2, 2.4, 0.5, pantile, { at: [wx, 2.3, PZ0 + 1.3], high: '-z' });
      b.panel(0.8, 1.8, P.oak, { at: [wx, 0, PZ0 + 2.4], facing: '+z', depth: 0.05 });
      b.collider(ww, 2.2, { at: [wx, 0, PZ0 + 1.3] });
      // a dividing wall in the wider yard
      if (c - a > 7) b.box(0.25, 1.9, yd - 2.4, brick, { at: [(a + c) / 2, 0, yz + 1.2] });
    }
    // the back boundary wall
    b.box(25.6, 2.4, 0.35, tint(brick, -0.06), { at: [0, 0, PZ0] });
    b.box(25.6, 0.12, 0.45, P.pierreBlonde, { at: [0, 2.4, PZ0] });
    b.collider(25.6, 0.5, { at: [0, 0, PZ0] });
    // and the side walls of the plot
    for (const x of [xL0, xR1]) b.box(0.25, 2.2, yd, brick, { at: [x, 0, yz] });
    wallRects(b, [[0, 0.6, 25.4, 0.05], [0, 1.5, 25.4, 0.05]], tint(brick, -0.12), [0, 0, PZ0 - 0.18], '-z', 0.01);
  },
};
