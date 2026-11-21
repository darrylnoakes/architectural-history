import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { TOWER, clockTower } from './shared';

/** A two-light pointed window with a plate-tracery roundel and a stone hood. */
function gothicWindow(b: Builder, at: [number, number, number], rotY: number, stone: number, w = 2, h = 4) {
  b.group({ at, rotY }, () => {
    b.panel(w + 0.5, h + 0.4, stone, { at: [0, -0.2, 0], shape: 'pointed', depth: 0.05 });
    b.panel(w + 0.2, h + 0.1, P.brickYellow, { at: [0, -0.05, 0], shape: 'pointed', depth: 0.07 }); // banded voussoirs
    b.panel(w, h, stone, { shape: 'pointed', depth: 0.09 });
    b.sym((s) => b.window(w * 0.38, h * 0.62, { at: [s * w * 0.23, 0.1, 0.05], shape: 'pointed', frame: stone, glass: P.windowDark, border: 0.06 }));
    b.panel(w * 0.36, w * 0.36, P.windowDark, { at: [0, h * 0.64, 0.07], shape: 'circle', depth: 0.06 });
  });
}

export const gothicRevivalTownHall: BuildingDef = {
  id: 'gothic-revival-town-hall',
  name: 'Town hall',
  style: 'Victorian Gothic Revival',
  date: '1874',
  summary:
    'The town is now a borough with an elected council, rich on railways and trade, and it replaces the old shire hall with a town hall in the style of Pugin and Ruskin. ' +
    'Gothic, the style of the medieval free towns, is chosen as an expression of civic pride and Christian virtue against the pagan classical. ' +
    'Machine-made brick in red, blue and yellow is striped with stone, the ground floor opens in a pointed arcade, the roofs are steep and crested, and a clock tower taller than the church spire marks the seat of local government.',
  materials: ['red, blue and yellow brick', 'sandstone dressings', 'Welsh slate', 'cast iron cresting'],
  lookFor: [
    { label: 'Clock tower', note: 'A tall tower with four clock faces, an open belfry and a slate spire: the town\'s new landmark and timekeeper.', at: [TOWER.x - TOWER.w / 2 - 0.4, 30, TOWER.z + 2] },
    { label: 'Polychrome brickwork', note: 'Bands of differently coloured brick and stone, the "structural polychromy" championed by John Ruskin.', at: [6, 9.8, 12.2] },
    { label: 'Pointed arcade', note: 'A row of pointed Gothic arches forming a covered loggia along the ground floor.', at: [6, 3.2, 14.6] },
    { label: 'Steep roofs and dormers', note: 'Steeply pitched slate roofs with gabled dormers and iron cresting along the ridge, giving a jagged skyline.', at: [12, 17.6, 8] },
    { label: 'Plate tracery', note: 'Two pointed lights under a round opening cut through solid stone, copied from 13th-century churches.', at: [-1.5, 8.2, 12.2] },
  ],
  modelledOn: 'Manchester Town Hall by Alfred Waterhouse (1868 to 1877), much reduced',
  influences: ['gothic-revival-export'],
  build(b) {
    const brick = tint(P.brickRed, b.range(-0.03, 0.02));
    const stone = P.sandstone;
    const blue = P.brickBlue;
    const yellow = P.brickYellow;

    // ---------------------------------------------------------- front range
    const XL = -20;
    const XR = 19;
    const XC = (XL + XR) / 2;
    const L = XR - XL;
    const Z0 = 3;
    const D = 9;
    const ZC = Z0 + D / 2;
    const FZ = Z0 + D; // 12
    const H = 13.4;
    b.box(L + 0.3, 1.0, D + 0.3, stone, { at: [XC, 0, ZC] });
    b.box(L, H, D, brick, { at: [XC, 0, ZC] });
    // polychrome bands: stone string courses, blue and yellow brick stripes
    for (const y of [4.6, 10]) b.box(L + 0.12, 0.4, D + 0.12, stone, { at: [XC, y, ZC], jitter: false });
    for (const y of [2.2, 7.0, 12.0]) {
      b.box(L + 0.06, 0.22, D + 0.06, blue, { at: [XC, y, ZC], jitter: false });
      b.box(L + 0.06, 0.22, D + 0.06, yellow, { at: [XC, y + 0.32, ZC], jitter: false });
    }
    b.box(L + 0.4, 0.45, D + 0.4, stone, { at: [XC, H - 0.2, ZC] });
    // steep slate roof with fish-scale bands and iron cresting
    const RH = 7.2;
    b.gable(L, D, RH, P.slate, { at: [XC, H + 0.25, ZC], overhang: 0.3, wall: brick, thick: 0.18 });
    for (const y of [2.4, 4.4]) {
      const t = 1 - y / RH;
      b.box(L + 0.6, 0.18, 0.1, P.slateBlue, { at: [XC, H + 0.25 + y, ZC + (D / 2) * t + 0.12], rot: [Math.atan2(D / 2, RH), 0, 0] });
      b.box(L + 0.6, 0.18, 0.1, P.slateBlue, { at: [XC, H + 0.25 + y, ZC - (D / 2) * t - 0.12], rot: [-Math.atan2(D / 2, RH), 0, 0] });
    }
    for (const x of spread(26, XL + 0.5, XR - 0.5)) b.box(0.06, 0.6, 0.06, P.castIron, { at: [x, H + 0.25 + RH + 0.1, ZC] });
    b.box(L, 0.06, 0.06, P.castIron, { at: [XC, H + 0.25 + RH + 0.65, ZC] });
    // stone-coped end gables with finials
    b.sym((s) => {
      const ex = s > 0 ? XR : XL;
      b.extrude([[-D / 2 - 0.3, 0], [D / 2 + 0.3, 0], [0, RH + 0.4]], 0.5, stone, { at: [ex, H + 0.1, ZC], rotY: Math.PI / 2 });
      b.extrude([[-D / 2 + 0.1, 0], [D / 2 - 0.1, 0], [0, RH - 0.2]], 0.7, brick, { at: [ex, H + 0.1, ZC], rotY: Math.PI / 2 });
      b.cone(0.35, 1.6, stone, { at: [ex, H + RH + 0.5, ZC], segs: 4 });
      gothicWindow(b, [ex + s * 0.36, H + 1.8, ZC], s > 0 ? Math.PI / 2 : -Math.PI / 2, stone, 2.2, 3.6);
    });
    // gabled dormers on the front and back slopes
    for (const x of [-4.2, 1.5, 7.2, 13]) {
      for (const side of [1, -1]) {
        b.group({ at: [x, H + 0.25, ZC + side * (D / 2 - 1.0)], rotY: side > 0 ? 0 : Math.PI }, () => {
          b.box(2.2, 2.8, 2, brick, {});
          b.gable(2.2, 2.4, 1.8, P.slate, { at: [0, 2.8, 0.1], ridge: 'z', overhang: 0.15, wall: brick });
          b.window(1.0, 2.0, { at: [0, 0.4, 1.0], shape: 'pointed', frame: stone, glass: P.windowDark });
          b.cone(0.16, 0.9, P.castIron, { at: [0, 4.6, 1.1], segs: 4 });
        });
      }
    }

    // ---------------------------------------------------------- front: pointed arcade, traceried windows
    const AX0 = -6.2;
    const AL = XR - AX0 - 0.6;
    const AXC = AX0 + AL / 2;
    b.archWall(AL, 4.6, 0.8, stone, { at: [AXC, 0, FZ + 2.6], openings: 8, openW: 2.2, openH: 3.7, shape: 'pointed' });
    b.box(AL, 0.15, 2.4, P.paving, { at: [AXC, 0, FZ + 1.3], jitter: false });
    b.box(AL, 0.3, 3.0, stone, { at: [AXC, 4.6, FZ + 1.5] }); // balcony over the arcade
    for (const x of spread(30, AX0 + 0.3, XR - 0.9)) b.box(0.12, 0.8, 0.12, stone, { at: [x, 4.9, FZ + 2.85] });
    b.box(AL, 0.16, 0.3, stone, { at: [AXC, 5.7, FZ + 2.85] });
    // alternating red and yellow voussoirs over the arcade arches
    const pitch = AL / 8;
    for (let i = 0; i < 8; i++) {
      const x = AX0 + (i + 0.5) * pitch;
      b.panel(2.7, 4.05, yellow, { at: [x, 0, FZ + 3.0], facing: '+z', shape: 'pointed', depth: 0.03 });
      b.panel(2.3, 3.8, brick, { at: [x, 0, FZ + 3.02], facing: '+z', shape: 'pointed', depth: 0.03 });
      b.panel(2.2, 3.7, mix(P.windowDark, P.paving, 0.25), { at: [x, 0, FZ + 3.04], facing: '+z', shape: 'pointed', depth: 0.03 });
      // doors and windows behind the arcade
      if (i % 3 === 1) b.panel(1.5, 3.0, P.oakDark, { at: [x, 0.3, FZ], facing: '+z', shape: 'pointed' });
      else b.window(1.4, 2.6, { at: [x, 0.9, FZ], facing: '+z', shape: 'pointed', frame: stone });
    }
    // first floor: tall two-light traceried windows of the council chamber
    for (const x of spread(10, XL + 1.6, XR - 1.6)) {
      if (Math.abs(x - TOWER.x) < 4.2) continue;
      gothicWindow(b, [x, 5.4, FZ], 0, stone, 2.2, 4.0);
    }
    // ground windows left of the tower (no arcade there)
    for (const x of [XL + 2, XL + 4.6]) b.window(1.4, 2.6, { at: [x, 1.2, FZ], facing: '+z', shape: 'pointed', frame: stone });
    // corner turret at the right end, with a candle-snuffer roof
    b.group({ at: [XR - 0.4, 0, FZ - 0.4] }, () => {
      b.cyl(1.7, H + 2.6, brick, { segs: 8, rotY: Math.PI / 8 });
      for (const y of [4.6, 10]) b.cyl(1.78, 0.4, stone, { at: [0, y, 0], segs: 8, rotY: Math.PI / 8 });
      b.cyl(1.9, 0.4, stone, { at: [0, H + 2.6, 0], segs: 8, rotY: Math.PI / 8 });
      b.cone(1.9, 6.4, P.slate, { at: [0, H + 3.0, 0], segs: 8, rotY: Math.PI / 8 });
      b.cyl(0.05, 1.4, P.castIron, { at: [0, H + 9.2, 0], segs: 4 });
      for (const y of [6, 11]) b.window(0.6, 1.8, { at: [0.6, y, 1.55], facing: 0.4, shape: 'pointed', frame: stone });
    });

    // ---------------------------------------------------------- the clock tower (kept in later stages)
    clockTower(b, { brick, stone });

    // ---------------------------------------------------------- the back: the great hall wing
    const HX = 2;
    const HW = 11;
    const HZ0 = -17;
    const HL = Z0 - HZ0 + 0.5;
    const HZC = HZ0 + HL / 2;
    const HH = 11;
    b.box(HW + 0.3, 1.0, HL + 0.3, stone, { at: [HX, 0, HZC] });
    b.box(HW, HH, HL, brick, { at: [HX, 0, HZC] });
    for (const y of [4.6]) b.box(HW + 0.12, 0.4, HL + 0.12, stone, { at: [HX, y, HZC], jitter: false });
    for (const y of [2.2, 8.4]) {
      b.box(HW + 0.06, 0.22, HL + 0.06, blue, { at: [HX, y, HZC], jitter: false });
      b.box(HW + 0.06, 0.22, HL + 0.06, yellow, { at: [HX, y + 0.32, HZC], jitter: false });
    }
    b.gable(HW, HL, 8.6, P.slate, { at: [HX, HH, HZC], ridge: 'z', overhang: 0.3, wall: brick });
    for (const x of spread(14, HZ0 + 0.6, Z0 - 0.4)) b.box(0.06, 0.6, 0.06, P.castIron, { at: [HX, HH + 8.7, x] });
    b.box(0.06, 0.06, HL - 1, P.castIron, { at: [HX, HH + 9.25, HZC] });
    b.sym((s) => {
      for (const z of spread(5, HZ0 + 2, Z0 - 2)) {
        b.box(0.7, HH - 1, 0.8, stone, { at: [HX + s * (HW / 2 + 0.35), 0, z - 1.9] });
        gothicWindow(b, [HX + s * (HW / 2), 4.4, z], s > 0 ? Math.PI / 2 : -Math.PI / 2, stone, 1.8, 5.2);
      }
    });
    // back gable: a great rose window over three lancets
    b.extrude([[-HW / 2 - 0.3, 0], [HW / 2 + 0.3, 0], [0, 9.0]], 0.5, stone, { at: [HX, HH - 0.1, HZ0] });
    b.extrude([[-HW / 2 + 0.2, 0], [HW / 2 - 0.2, 0], [0, 8.4]], 0.7, brick, { at: [HX, HH - 0.1, HZ0] });
    b.panel(4.4, 4.4, stone, { at: [HX, HH - 2.6, HZ0 - 0.35], facing: '-z', shape: 'circle', depth: 0.1 });
    b.panel(3.6, 3.6, P.windowDark, { at: [HX, HH - 2.2, HZ0 - 0.45], facing: '-z', shape: 'circle', depth: 0.06 });
    for (const x of [-2.4, 0, 2.4]) b.window(1.4, 4.4, { at: [HX + x, 2.2, HZ0], facing: '-z', shape: 'pointed', frame: stone });
    b.cone(0.4, 1.8, stone, { at: [HX, HH + 8.9, HZ0], segs: 4 });
    // windows on the back of the front range either side of the hall
    for (const x of [-17, -13, -9, -5, 9, 13, 17]) {
      b.window(1.4, 2.6, { at: [x, 1.2, Z0], facing: '-z', shape: 'pointed', frame: stone });
      gothicWindow(b, [x, 5.6, Z0], Math.PI, stone, 2, 3.6);
    }

    // ---------------------------------------------------------- the square in front
    b.box(42, 0.05, 6.6, mix(P.paving, P.cobble, 0.3), { at: [0, 0, 18.4], jitter: false });
    b.sym((s) => {
      b.cyl(0.18, 3.8, P.castIron, { at: [s * 5, 0, 19.6], segs: 6 });
      b.box(0.5, 0.6, 0.5, P.glass, { at: [s * 5, 3.8, 19.6], mat: 'glass' });
      b.pyramid(0.6, 0.6, 0.3, P.castIron, { at: [s * 5, 4.4, 19.6] });
    });

    // colliders: front range, hall, tower; the arcade loggia stays walkable
    b.collider(L, D, { at: [XC, 0, ZC] });
    b.collider(HW + 1.6, HL, { at: [HX, 0, HZC] });
    b.collider(TOWER.w + 0.6, TOWER.w + 0.6, { at: [TOWER.x, 0, TOWER.z] });
    b.collider(3.4, 3.4, { at: [XR - 0.4, 0, FZ - 0.4] });
  },
};
