import { P, spread, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { barrel, cafeTable, ground, horse, railing, word } from './shared';

export const XO = 10.2;
export const ZF = 7.0; // street front
export const ZB = -4.2; // back of the main block
export const G = 5.0; // the brasserie storey
export const FL = 3.1; // each floor of flats above
export const NF = 3;
export const TOP = G + FL * NF;
export const N = 5; // bays
export const PITCH = (2 * XO) / N;
export const CY = 4.75; // underside of the glass canopy
export const CD = 2.4; // its projection

/** The Art Nouveau outline of a shop window: straight jambs and a head that swells up in a soft curve. */
function bayOutline(w: number, h: number, swell: number): [number, number][] {
  const pts: [number, number][] = [[-w / 2, 0], [w / 2, 0], [w / 2, h - swell]];
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const x = w / 2 - t * w;
    const y = h - swell + swell * Math.pow(Math.sin(Math.PI * t), 0.7);
    pts.push([x, y]);
  }
  pts.push([-w / 2, h - swell]);
  return pts;
}

/** One glazed bay of the brasserie front: a timber frame with a curving head, glass, and an iron tracery of whiplash bars. */
function glazedBay(b: Builder, x: number, wood: number, iron: number, door: boolean): void {
  const w = PITCH - 1.0;
  const h = 4.3;
  b.group({ at: [x, 0, ZF] }, () => {
    const outer: [number, number][] = [[-w / 2 - 0.15, 0], [w / 2 + 0.15, 0], [w / 2 + 0.15, h + 0.15], [-w / 2 - 0.15, h + 0.15]];
    const hole = bayOutline(w - 0.2, h - 0.15, 0.7).map(([px, py]) => [px, py + 0.1] as [number, number]);
    b.extrude(outer, 0.16, wood, { at: [0, 0, 0.08], holes: [hole] });
    b.extrude(bayOutline(w - 0.2, h - 0.1, 0.7), 0.04, P.glassDark, { at: [0, 0.05, -0.02], mat: 'glass' });
    // a curved transom bar, the mullions and a low panelled stall-riser
    const arc: [number, number][] = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      arc.push([-w / 2 + 0.1 + t * (w - 0.2), 2.95 + 0.35 * Math.sin(Math.PI * t)]);
    }
    for (let i = 0; i < arc.length - 1; i++) b.beam([arc[i][0], arc[i][1], 0.1], [arc[i + 1][0], arc[i + 1][1], 0.1], 0.08, 0.08, wood);
    for (const mx of [-w / 4, w / 4]) b.box(0.08, door ? 0.1 : 2.95, 0.1, wood, { at: [mx, 0, 0.1] });
    if (door) {
      b.box(1.6, 2.7, 0.08, wood, { at: [0, 0, 0.05] });
      b.box(1.3, 2.0, 0.04, P.glassDark, { at: [0, 0.5, 0.1], mat: 'glass' });
      b.box(0.04, 2.6, 0.1, P.gold, { at: [0, 0.05, 0.1] });
    } else {
      b.box(w - 0.2, 0.75, 0.14, wood, { at: [0, 0, 0.07] });
    }
    // whiplash ironwork in the head: two S-curves meeting at the top
    b.sym((s) => {
      const pts: Vec3[] = [];
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        pts.push([s * (w / 2 - 0.25 - t * (w / 2 - 0.35)), 3.45 + 0.6 * t + 0.25 * Math.sin(2 * Math.PI * t), 0.12]);
      }
      for (let i = 0; i < pts.length - 1; i++) b.beam(pts[i], pts[i + 1], 0.05, 0.05, iron);
    });
  });
}

/** A ceramic panel on a pier: glazed stoneware in a frame, with a stylised flower on a long stem. */
function ceramicPanel(b: Builder, x: number, y: number, h: number, ground_: number, flower: number, leaf: number): void {
  b.panel(0.7, h, ground_, { at: [x, y, ZF], facing: '+z', depth: 0.05 });
  b.panel(0.05, h * 0.6, leaf, { at: [x, y + 0.15, ZF], facing: '+z', depth: 0.08 });
  b.panel(0.3, 0.12, leaf, { at: [x - 0.12, y + h * 0.35, ZF], facing: '+z', depth: 0.08, rot: [0, 0, 0.6] });
  b.panel(0.3, 0.12, leaf, { at: [x + 0.12, y + h * 0.5, ZF], facing: '+z', depth: 0.08, rot: [0, 0, -0.6] });
  b.panel(0.42, 0.42, flower, { at: [x, y + h * 0.7, ZF], facing: '+z', shape: 'circle', depth: 0.09 });
  b.panel(0.14, 0.14, tint(flower, -0.25), { at: [x, y + h * 0.7 + 0.14, ZF], facing: '+z', depth: 0.11, rot: [0, 0, Math.PI / 4] });
}

/**
 * The brasserie building of about 1905. `restored` gives its state in 2014: the stone cleaned, the
 * woodwork and ceramics repaired, the canopy reglazed, and the street in front made over to pedestrians.
 */
export function buildBrasserie(b: Builder, restored: boolean): void {
  const stone = restored ? tint(P.pierreBlonde, 0.03) : b.pick([P.pierreBlonde, tint(P.pierreBlonde, -0.05)]);
  const wood = restored ? 0x5a3524 : b.pick([0x5a3524, P.doorGreen]);
  const iron = P.castIron;
  const zinc = P.zincParis;
  const brick = P.briqueNord;
  const glaze = b.pick([0x4f8a6e, 0x3f7a8a]);
  const flower = b.pick([P.cladYellow, 0xd98a3a]);
  const leaf = 0x3f6a44;

  // ---------------- the street: pavement before the front
  if (restored) {
    ground(b, 21.6, 11.0 - ZF + 0.6, P.paving, [0, (ZF + 11.0) / 2 - 0.3], 0.06);
    for (const x of spread(10, -10.0, 10.0)) ground(b, 0.25, 11.0 - ZF, tint(P.paving, -0.12), [x, (ZF + 11.0) / 2], 0.07);
  } else {
    ground(b, 21.6, 2.6, P.paving, [0, ZF + 1.3], 0.12);
    ground(b, 21.6, 11.0 - ZF - 2.6, P.cobble, [0, (ZF + 2.6 + 11.0) / 2], 0.04);
  }

  // ---------------- the brasserie storey: stone piers faced with ceramics, glazed bays between
  const bd = ZF - ZB;
  const bz = (ZF + ZB) / 2;
  b.box(2 * XO, G, bd - 0.3, stone, { at: [0, 0, bz - 0.15] });
  for (let i = 0; i <= N; i++) {
    const x = -XO + i * PITCH + (i === 0 ? 0.45 : i === N ? -0.45 : 0);
    b.box(0.9, G, 0.3, stone, { at: [x, 0, ZF - 0.15] });
    ceramicPanel(b, x, 0.9, 3.0, restored ? tint(glaze, 0.05) : glaze, flower, leaf);
  }
  for (let i = 0; i < N; i++) glazedBay(b, -XO + (i + 0.5) * PITCH, wood, iron, i === 2);
  // the fascia: a ceramic frieze and the name in gilt
  b.box(2 * XO, 0.55, 0.1, glaze, { at: [0, G - 0.62, ZF + 0.04] });
  for (const x of spread(10, -XO + 0.8, XO - 0.8)) b.panel(0.26, 0.26, flower, { at: [x, G - 0.48, ZF + 0.08], facing: '+z', depth: 0.05, rot: [0, 0, Math.PI / 4] });
  b.box(2 * XO + 0.2, 0.2, 0.4, stone, { at: [0, G - 0.08, ZF + 0.05] });

  // ---------------- the glass canopy (marquise) on curved iron brackets
  const cz = ZF + CD / 2;
  for (const x of spread(6, -XO + 0.5, XO - 0.5)) {
    const pts: Vec3[] = [];
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      pts.push([x, CY - 1.3 + 1.3 * Math.sin((t * Math.PI) / 2), ZF + 0.05 + t * (CD - 0.1)]);
    }
    for (let i = 0; i < pts.length - 1; i++) b.beam(pts[i], pts[i + 1], 0.07, 0.07, iron);
    b.beam([x, CY + 0.55, ZF + 0.05], [x, CY + 0.05, ZF + CD - 0.05], 0.06, 0.06, iron);
  }
  b.box(2 * XO - 0.4, 0.1, 0.1, iron, { at: [0, CY, ZF + CD - 0.05] });
  b.box(2 * XO - 0.4, 0.04, Math.hypot(CD, 0.5), restored ? P.glass : tint(P.glass, -0.12), { at: [0, CY + 0.26, cz], rot: [0.2, 0, 0], mat: 'glass', jitter: false });
  // a scalloped iron valance along the front edge
  const scal: [number, number][] = [[-XO + 0.2, 0], [XO - 0.2, 0]];
  const ns = 24;
  for (let i = ns; i >= 0; i--) {
    const x = -XO + 0.2 + (i / ns) * (2 * XO - 0.4);
    scal.push([x, i % 2 ? -0.35 : -0.15]);
  }
  b.extrude(scal, 0.04, iron, { at: [0, CY, ZF + CD] });
  word(b, 'BRASSERIE', 0.085, P.gold, { at: [0, CY + 0.28, ZF + CD + 0.05], facing: '+z', depth: 0.03 });

  // ---------------- the flats above: stone, a bow window, balconies of iron
  const ud = bd;
  b.box(2 * XO, FL * NF, ud, stone, { at: [0, G, bz] });
  for (let f = 0; f < NF; f++) {
    const y = G + f * FL;
    b.box(2 * XO + 0.08, 0.16, ud + 0.08, tint(stone, -0.04), { at: [0, y + 0.02, bz] });
    for (let i = 0; i < N; i++) {
      const x = -XO + (i + 0.5) * PITCH;
      if (i === 2 && f < 2) continue; // the bow window
      b.window(1.4, 2.3, { at: [x, y + 0.45, ZF], facing: '+z', frame: P.white, bars: [2, 1], border: 0.08, shape: f === 2 ? 'segmental' : 'rect' });
      b.window(1.3, 2.1, { at: [x, y + 0.55, ZB], facing: '-z', frame: P.white, border: 0.08 });
      // a carved keystone that swells into a curl
      b.panel(0.4, 0.35, tint(stone, -0.05), { at: [x, y + 2.75, ZF], facing: '+z', depth: 0.12 });
      if (f === 1) {
        b.box(1.9, 0.12, 0.6, stone, { at: [x, y + 0.3, ZF + 0.3] });
        railing(b, [x - 0.9, y + 0.42, ZF + 0.55], [x + 0.9, y + 0.42, ZF + 0.55], 0.9, iron, 0.45);
      }
    }
  }
  // the long balcony of the first floor, with a railing whose top rail swells over each bay
  const y1 = G;
  b.box(2 * XO - 0.6, 0.18, 0.85, stone, { at: [0, y1 + 0.2, ZF + 0.42] });
  for (let i = 0; i < N; i++) {
    if (i === 2) continue;
    const x0 = -XO + i * PITCH + 0.4;
    const x1 = x0 + PITCH - 0.8;
    const pts: Vec3[] = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      pts.push([x0 + t * (x1 - x0), y1 + 1.3 + 0.18 * Math.sin(Math.PI * t), ZF + 0.8]);
    }
    for (let k = 0; k < pts.length - 1; k++) b.beam(pts[k], pts[k + 1], 0.05, 0.05, iron);
    for (const x of spread(5, x0, x1)) b.box(0.04, 0.95, 0.04, iron, { at: [x, y1 + 0.38, ZF + 0.8], jitter: false });
    b.sym((s) => b.beam([(x0 + x1) / 2 + s * 0.05, y1 + 0.45, ZF + 0.8], [(x0 + x1) / 2 + s * 0.6, y1 + 1.15, ZF + 0.8], 0.04, 0.04, iron));
  }
  // the bow window rising through two floors on a corbel
  const bowR = 1.7;
  b.lathe([[0.2, 0], [bowR, 0.9], [bowR, 1.05]], stone, { at: [0, G - 0.6, ZF], start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
  b.lathe([[bowR, 0], [bowR, FL * 2]], stone, { at: [0, G + 0.45, ZF], start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
  b.lathe([[bowR + 0.15, 0], [bowR + 0.15, 0.25], [0.1, 0.4]], stone, { at: [0, G + 0.45 + FL * 2, ZF], start: -Math.PI / 2, sweep: Math.PI, segs: 6 });
  for (let f = 0; f < 2; f++) {
    for (const a of [-0.9, 0, 0.9]) {
      const wx = Math.sin(a) * bowR;
      const wz = ZF + Math.cos(a) * bowR;
      b.window(0.9, 2.0, { at: [wx, G + 0.75 + f * FL, wz], facing: a, frame: P.white, bars: [1, 2], border: 0.07 });
    }
  }
  // the cornice and the zinc mansard, with Art Nouveau dormers and the party-wall chimneys
  b.box(2 * XO + 0.3, 0.45, ud + 0.3, stone, { at: [0, TOP, bz] });
  const my = TOP + 0.45;
  const mh = 2.7;
  const mi = 0.9; // the set-back of the steep lower slope
  b.extrude([[ZB - 0.0, 0], [ZF, 0], [ZF - mi, mh], [ZB + mi, mh]].map(([z, y]) => [-z, y] as [number, number]), 2 * XO, zinc, { at: [0, my, 0], rotY: Math.PI / 2 });
  b.hip(2 * XO, ud - 2 * mi, 1.0, tint(zinc, -0.05), { at: [0, my + mh, bz], ridge: 2 * XO - (ud - 2 * mi) });
  for (let i = 0; i < N; i++) {
    const x = -XO + (i + 0.5) * PITCH;
    b.group({ at: [x, my + 0.1, ZF + 0.02] }, () => {
      const prof = bayOutline(1.4, 2.1, 0.5);
      b.extrude(prof, 1.2, stone, { at: [0, 0, -0.6] });
      b.window(0.9, 1.5, { at: [0, 0.25, 0.01], facing: '+z', frame: P.white, border: 0.06 });
    });
  }
  b.sym((s) => {
    b.box(0.6, mh + 1.4, ud - 1.0, brick, { at: [s * (XO - 0.3), my, bz] });
    for (const z of [bz - 1.5, bz + 1.5]) b.cyl(0.12, 0.5, P.terracotta, { at: [s * (XO - 0.3), my + mh + 1.4, z], segs: 6 });
  });

  // ---------------- behind: a brick back wing for the kitchen, and the yard
  b.box(6.0, 4.2, 5.6, brick, { at: [-7.2, 0, -7.0] });
  b.gable(6.0, 5.6, 1.6, zinc, { at: [-7.2, 4.2, -7.0], overhang: 0.3, wall: brick });
  for (const x of [-8.6, -5.8]) b.window(1.1, 1.8, { at: [x, 1.2, -9.8], facing: '-z', frame: P.white, border: 0.08 });
  b.window(1.1, 1.8, { at: [-4.2, 1.2, -7.0], facing: '+x', frame: P.white, bars: [2, 2], border: 0.08 });
  b.panel(1.1, 2.3, wood, { at: [-4.2, 0, -5.4], facing: '+x' });
  b.box(0.4, 2.8, 6.0, brick, { at: [XO - 0.2, 0, -7.2] });
  b.box(14.4, 2.8, 0.4, brick, { at: [3.0, 0, -10.0] });
  ground(b, 14.0, 5.6, P.cobble, [3.0, -7.1], 0.04);
  if (restored) {
    b.box(0.6, 6.0, 0.6, P.steel, { at: [-4.6, 0, -9.2] }); // the kitchen’s extract duct, up the back
    b.box(2.0, 1.2, 1.0, P.cladGrey, { at: [6.0, 0, -9.2] });
    b.tree(4.0, { at: [2.0, 0, -6.6], kind: 'round', color: P.leaf });
  } else {
    for (const [x, z] of [[2.0, -8.6], [2.7, -8.9], [3.4, -8.6], [6.0, -8.8]] as const) barrel(b, [x, 0, z], P.oak);
  }

  // ---------------- the terrace
  if (restored) {
    for (const [x, z] of [[-8.0, 8.4], [-4.6, 8.4], [4.4, 8.4], [7.8, 8.4], [-6.3, 10.0], [6.0, 10.0], [2.6, 10.0]] as const) {
      cafeTable(b, [x, 0.06, z], P.marble, wood, 2, Math.PI / 2);
    }
    // planters marking the terrace, young trees in the paving, a bicycle stand
    for (const x of [-4.4, -0.2, 4.2]) {
      b.box(1.4, 0.7, 0.6, P.cladGrey, { at: [x, 0.06, 10.2] });
      b.blob(0.55, P.leafDark, { at: [x, 0.95, 10.2], stretch: [1.4, 0.7, 0.8], detail: 0 });
    }
    b.tree(5.0, { at: [-8.6, 0.06, 10.0], kind: 'round', color: P.leaf });
    b.tree(5.0, { at: [9.0, 0.06, 10.0], kind: 'round', color: P.leaf });
    for (const x of spread(4, 1.6, 3.6)) b.beam([x, 0.06, 10.5], [x, 0.9, 10.5], 0.05, 0.05, P.steel);
  } else {
    for (const x of [-8.0, -4.4, 4.4, 8.0]) cafeTable(b, [x, 0.12, 8.3], P.marble, P.oakDark, 2, Math.PI / 2);
    // a gas lamp, and the brewer’s dray delivering at the kerb
    b.cyl(0.08, 3.6, iron, { at: [-1.8, 0.12, 9.4], segs: 6 });
    b.cyl(0.16, 0.45, P.windowLit, { at: [-1.8, 3.7, 9.4], rTop: 0.24, segs: 4 });
    b.cone(0.28, 0.25, iron, { at: [-1.8, 4.15, 9.4], segs: 4 });
    b.group({ at: [3.4, 0, 10.2], rotY: -Math.PI / 2 }, () => {
      b.box(1.6, 0.15, 3.0, P.doorGreen, { at: [0, 0.8, 0] });
      b.sym((s) => b.log(0.55, 0.1, P.oakDark, { at: [s * 0.85, 0, 0.8], segs: 8 }));
      b.sym((s) => b.log(0.45, 0.1, P.oakDark, { at: [s * 0.85, 0, -0.9], segs: 8 }));
      for (const z of [-0.9, 0, 0.9]) b.log(0.3, 1.2, P.oak, { at: [0, 0.95, z], segs: 7 });
    });
    horse(b, [6.6, 0, 10.2], Math.PI / 2, 0x6b4a32);
  }

  // ---------------- colliders: the main block and the kitchen wing
  b.collider(2 * XO, bd, { at: [0, 0, bz] });
  b.collider(6.0, 5.6, { at: [-7.2, 0, -7.0] });
  b.collider(14.4, 0.4, { at: [3.0, 0, -10.0] });
  b.collider(0.4, 6.0, { at: [XO - 0.2, 0, -7.2] });
}

export const brasserie: BuildingDef = {
  id: 'brasserie',
  name: 'Brasserie',
  style: 'Art Nouveau (School of Nancy)',
  date: 'c. 1905',
  modelledOn:
    'In the spirit of the Brasserie Excelsior, Nancy (Lucien Weissenburger and Alexandre Mienville, opened 1911) and the shopfronts of the School of Nancy; the glazed front, ceramics and canopy are generic Art Nouveau rather than copied from any one building',
  summary:
    'A brasserie was first a brewery. Alsatians had opened beer halls in Paris since the 1860s, and more came west when Germany annexed Alsace in 1871: a big, bright room open from morning to midnight, beer on draught, sauerkraut and oysters, waiters in long aprons. ' +
    'This one fills the ground floor of a new block of flats in the style that Nancy, swollen by those same refugees, made its own: a front of glass in curving frames of wood and iron, piers faced with glazed stoneware painted with flowers, a glass canopy on iron brackets over a terrace, and above, a bow window and balconies whose lines swell and twist like plant stems. ' +
    'Like the café before it, the brasserie offers no bed: it sells food, drink and company, and the rooms upstairs are somebody’s flat.',
  materials: ['limestone', 'carved and varnished wood', 'plate glass', 'cast and wrought iron', 'glazed stoneware', 'zinc'],
  lookFor: [
    { label: 'Glazed front', note: 'Great sheets of plate glass in wooden frames whose heads swell upward in a soft curve, with whiplash ironwork inside: no straight line where a curve will do.', at: [-6.1, 3.8, ZF + 0.3] },
    { label: 'Ceramic panels', note: 'Glazed stoneware on the piers, each with a flower on a long stem: the School of Nancy took its ornament from plants.', at: [-XO + PITCH, 3.4, ZF + 0.2] },
    { label: 'Glass canopy', note: 'A marquise of glass on curved iron brackets, with a scalloped valance, shelters the terrace and the door.', at: [5.0, CY + 0.4, ZF + CD] },
    { label: 'Terrace', note: 'Tables set out on the pavement, so the brasserie’s life spills into the street and passers-by can see who is there.', at: [-8.0, 1.0, 8.6] },
    { label: 'Bow window', note: 'A rounded window rising through two floors on a carved corbel, to catch the light and the view along the street.', at: [0, G + 2.0, ZF + 1.9] },
  ],
  influences: ['art-nouveau'],
  build(b) {
    buildBrasserie(b, false);
  },
};
