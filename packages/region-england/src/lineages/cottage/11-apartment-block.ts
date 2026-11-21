import { P, tint, type BuildingDef } from '@ah/kit';

const W = 24;
const D = 11.2;
const ZF = 5.9; // front building line
const GF = 4.2; // shop storey
const FH = 3.05;
const UP = 4; // brick floors
const BAYS = 6;
const INSET = 1.5; // depth of the inset balconies
const SETBACK = 2.2; // top floor set back behind the roof terrace

export const apartmentBlock: BuildingDef = {
  id: 'apartment-block',
  name: 'Apartment block',
  style: 'Contemporary (new London vernacular)',
  date: 'c. 2014',
  summary:
    'The tower came down and the plot was rebuilt at the scale of a street again: five storeys of flats over a shop, built by a housing association and a developer together, with some homes for social rent and the rest for sale. ' +
    'Behind the brick is a concrete or timber frame; the brick is a thin skin chosen to fit in with the older town, and the top floor is set back and clad in metal so the block looks lower from the pavement. ' +
    'On the street front the balconies are cut into the building rather than hung off it, and the roof becomes a shared terrace. ' +
    'Blocks like this can house as many people to the hectare as the towers did, in a form that meets the street.',
  materials: ['brick slips and facing brick', 'zinc and anodised aluminium cladding', 'glass', 'concrete frame'],
  lookFor: [
    { label: 'Inset balconies', note: 'Recessed into the facade rather than bolted on, they are more private and keep the brick front flat and calm.', at: [-2, GF + FH + 1.0, ZF - 0.6] },
    { label: 'Ground-floor shop', note: 'A shopfront at street level keeps the pavement lively, a lesson learned from the blank podiums of the 1960s.', at: [-4.4, 2.0, ZF + 0.1] },
    { label: 'Set-back metal top floor', note: 'The top storey is stepped back and clad in zinc, so from the street the block reads as brick and lighter at the top.', at: [3, GF + FH * UP + 1.8, 3.5] },
    { label: 'Roof terrace', note: 'The roof in front of the top floor is a shared garden with planting and a glass balustrade.', at: [-8, GF + FH * UP + 1.0, ZF - 1.0] },
    { label: 'Tall windows', note: 'Vertical windows in a steady grid give the plain brick front the rhythm of a Georgian terrace, a deliberate nod to the older town.', at: [6, GF + FH * 2 + 1.5, ZF + 0.05] },
  ],
  influences: [],
  build(b) {
    const brick = b.pick([P.brickBuff, P.brickYellow, tint(P.brickRed, -0.02), P.brickBuff]);
    const metal = b.pick([P.zinc, P.cladGrey, P.bronze]);
    const frame = P.cladGrey;
    const bw = W / BAYS;
    const zb = ZF - D;
    const zc = (ZF + zb) / 2;
    const top = GF + FH * UP;
    // which bays have inset balconies: a staggered pattern, varied by seed
    const shift = b.variant === 0 ? 0 : Math.floor(b.rand() * 3);
    const balcony = (k: number, f: number) => (k + shift + (f % 2 === 0 ? 0 : 1)) % 3 === 0;

    // ground floor: dark frame, shopfront, flats entrance
    b.box(W, GF, D, P.cladGrey, { at: [0, 0, zc] });
    b.window(bw * 3.6, 3.1, { at: [-bw * 1.1, 0.2, ZF], facing: '+z', frame, glass: P.glass, mat: 'glass', bars: [5, 1], border: 0.1 });
    b.box(bw * 3.6, 0.6, 0.15, tint(metal, -0.1), { at: [-bw * 1.1, 3.4, ZF + 0.05] });
    b.panel(bw * 1.6, 0.3, P.cladWhite, { at: [-bw * 1.1, 3.55, ZF + 0.12], facing: '+z' });
    b.window(1.6, 2.8, { at: [bw * 1.8, 0.1, ZF], facing: '+z', frame, glass: P.glassDark, mat: 'glass', border: 0.08 });
    b.box(2.4, 0.2, 0.9, frame, { at: [bw * 1.8, 3.0, ZF + 0.45] });
    b.panel(bw * 1.3, 2.6, P.cladGrey, { at: [bw * 2.65, 0.1, ZF], facing: '+z' });
    for (let k = 0; k < 4; k++) b.window(1.6, 2.4, { at: [-9 + k * 6, 0.6, zb], facing: '-z', frame, glass: P.glassDark, border: 0.08 });

    // brick floors: a body set back by the balcony depth, then the front plane built bay by bay
    b.box(W, FH * UP, D - INSET, brick, { at: [0, GF, zc - INSET / 2] });
    for (let f = 0; f < UP; f++) {
      const y = GF + f * FH;
      for (let k = 0; k < BAYS; k++) {
        const x = -W / 2 + bw * (k + 0.5);
        if (balcony(k, f)) {
          // inset balcony: floor, glass balustrade, door and window at the back of the recess
          b.box(bw - 0.4, 0.12, INSET, P.concreteWhite, { at: [x, y, ZF - INSET / 2] });
          b.box(bw - 0.4, 1.05, 0.04, P.glass, { at: [x, y + 0.12, ZF - 0.12], mat: 'glass' });
          b.box(bw - 0.4, 0.06, 0.08, frame, { at: [x, y + 1.15, ZF - 0.12] });
          b.window(1.0, 2.3, { at: [x - 0.75, y + 0.12, ZF - INSET], facing: '+z', frame, glass: P.glassDark, mat: 'glass', border: 0.06 });
          b.window(1.2, 2.3, { at: [x + 0.6, y + 0.12, ZF - INSET], facing: '+z', frame, glass: P.glassDark, mat: 'glass', border: 0.06 });
          b.box(bw - 0.4, 0.04, INSET, P.concreteWhite, { at: [x, y + FH - 0.04, ZF - INSET / 2] });
        } else {
          b.box(bw - 0.4, FH, INSET, brick, { at: [x, y, ZF - INSET / 2] });
          b.window(1.3, 2.15, { at: [x, y + 0.5, ZF], facing: '+z', frame, glass: P.glassDark, mat: 'glass', bars: [1, 2], border: 0.07 });
          b.box(1.5, 0.08, 0.12, P.concreteWhite, { at: [x, y + 0.42, ZF + 0.02] });
        }
        // back: plain windows, projecting steel balconies on alternate bays
        b.window(1.3, 2.15, { at: [x - 0.6, y + 0.5, zb], facing: '-z', frame, glass: P.glassDark, mat: 'glass', border: 0.07 });
        if ((k + f) % 2 === 0) {
          b.box(bw - 0.9, 0.14, 1.3, P.steel, { at: [x + 0.4, y, zb - 0.65] });
          b.box(bw - 0.9, 1.05, 0.05, P.steel, { at: [x + 0.4, y + 0.14, zb - 1.28] });
        }
      }
      // piers between bays, flush with the front
      for (let k = 0; k <= BAYS; k++) {
        const x = -W / 2 + bw * k;
        const pw = k === 0 || k === BAYS ? 0.2 : 0.4;
        b.box(pw, FH, INSET, brick, { at: [x + (k === 0 ? 0.1 : k === BAYS ? -0.1 : 0), y, ZF - INSET / 2] });
      }
      b.box(W, 0.18, 0.06, tint(brick, -0.08), { at: [0, y + FH - 0.2, ZF + 0.02] }); // soldier course
    }
    // side windows
    for (const s of [-1, 1]) {
      for (let f = 0; f < UP; f++) b.window(1.2, 2.1, { at: [(s * W) / 2, GF + f * FH + 0.5, zc - 1.5], facing: s > 0 ? '+x' : '-x', frame, glass: P.glassDark, mat: 'glass', border: 0.07 });
    }
    // parapet coping
    b.box(W + 0.1, 0.25, D + 0.1, P.concreteWhite, { at: [0, top, zc] });

    // top floor: set back, clad in standing-seam metal, with a roof terrace in front
    const tw = W - 1.0;
    const td = D - SETBACK - 0.5;
    const tz = zb + 0.25 + td / 2;
    b.box(tw, FH, td, metal, { at: [0, top + 0.25, tz] });
    for (let x = -tw / 2 + 0.4; x < tw / 2; x += 0.6) b.box(0.05, FH, 0.05, tint(metal, 0.06), { at: [x, top + 0.25, tz + td / 2 + 0.02] });
    for (let k = 0; k < 4; k++) b.window(3.2, 2.4, { at: [-8.5 + k * 5.7, top + 0.35, tz + td / 2 + 0.03], facing: '+z', frame, glass: P.glass, mat: 'glass', bars: [3, 1], border: 0.06 });
    b.box(tw + 0.6, 0.25, td + 0.6, tint(metal, -0.06), { at: [0, top + 0.25 + FH, tz] });
    // terrace: decking, glass balustrade, planters with shrubs
    b.box(W - 0.4, 0.08, SETBACK + 0.2, P.larch, { at: [0, top + 0.25, ZF - SETBACK / 2 - 0.1] });
    b.box(W, 1.1, 0.04, P.glass, { at: [0, top + 0.25, ZF - 0.05], mat: 'glass' });
    b.box(W, 0.06, 0.08, frame, { at: [0, top + 1.35, ZF - 0.05] });
    for (let k = 0; k < 4; k++) {
      const x = -10 + k * 6.5;
      b.box(1.6, 0.5, 0.7, P.cladGrey, { at: [x, top + 0.33, ZF - 0.8] });
      b.tree(1.1, { at: [x, top + 0.8, ZF - 0.8], kind: 'bush', color: P.leaf });
    }
    // photovoltaic panels on the main roof
    for (let k = 0; k < 6; k++) b.box(2.4, 0.08, 1.4, P.solar, { at: [-7.5 + k * 3, top + FH + 0.7, tz - 0.4], rot: [-0.25, 0, 0] });
    // cycle stands at the front
    for (let k = 0; k < 3; k++) b.box(0.06, 0.8, 0.7, P.steel, { at: [5 + k * 0.8, 0, 6.6] });
  },
};
