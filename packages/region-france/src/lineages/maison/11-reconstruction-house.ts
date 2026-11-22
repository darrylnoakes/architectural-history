import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bowWindow, digits, pitched, vegBed, washing, yardWall } from './shared';

const HW = 6.8;
const ZF = 7.9;
const ZB = -2.4;
const G = 3.2;
const F1 = 3.0;
const EAVES = G + F1 + 0.3;
const GABLE = 3.6; // height of the shaped gable above the eaves

/** The outline of a shaped gable, half-width hw and height h, from y = 0. */
function gableOutline(kind: 'stepped' | 'curved', hw: number, h: number): [number, number][] {
  if (kind === 'stepped') {
    const pts: [number, number][] = [[-hw, 0], [hw, 0]];
    const steps = [[hw, 0.7], [hw - 0.9, 0.7], [hw - 0.9, 1.6], [hw - 1.8, 1.6], [hw - 1.8, 2.5], [0.7, 2.5], [0.7, h], [-0.7, h], [-0.7, 2.5], [-(hw - 1.8), 2.5], [-(hw - 1.8), 1.6], [-(hw - 0.9), 1.6], [-(hw - 0.9), 0.7], [-hw, 0.7]];
    return pts.concat(steps as [number, number][]);
  }
  const pts: [number, number][] = [[-hw, 0], [hw, 0], [hw, 0.8], [hw - 0.5, 0.8]];
  const n = 10;
  const rx = hw - 0.5;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    pts.push([Math.cos(a) * rx, 0.8 + Math.sin(a) * (h - 0.8)]);
  }
  pts.push([-(hw - 0.5), 0.8], [-hw, 0.8]);
  return pts;
}

/** A railing of Art Deco geometry: rails, plain bars, a lozenge in each panel. */
function decoRail(b: Builder, len: number, at: [number, number, number], col: number): void {
  const [x, y, z] = at;
  b.box(len, 0.06, 0.06, col, { at: [x, y + 0.9, z], jitter: false });
  b.box(len, 0.05, 0.05, col, { at: [x, y + 0.06, z], jitter: false });
  const n = Math.max(1, Math.round(len / 0.6));
  for (let i = 0; i <= n; i++) b.box(0.05, 0.88, 0.05, col, { at: [x - len / 2 + (i * len) / n, y + 0.04, z], jitter: false });
  for (let i = 0; i < n; i++) {
    const cx = x - len / 2 + ((i + 0.5) * len) / n;
    b.box(0.32, 0.32, 0.04, col, { at: [cx, y + 0.3, z], rot: [0, 0, Math.PI / 4], jitter: false });
    b.box(0.18, 0.18, 0.05, P.white, { at: [cx, y + 0.39, z], rot: [0, 0, Math.PI / 4], jitter: false });
    b.box(0.03, 0.9, 0.03, col, { at: [cx, y + 0.04, z], jitter: false });
  }
}

function house(b: Builder, cx: number, o: { brick: number; concrete: number; roof: number; door: number; ours: boolean; kind: 'stepped' | 'curved'; year: string }): void {
  const { brick, concrete, roof } = o;
  const D = ZF - ZB;
  const zc = (ZF + ZB) / 2;
  b.box(HW, EAVES, D, brick, { at: [cx, 0, zc] });
  // the concrete frame showing on the front: plinth, floor band, corner piers
  b.box(HW + 0.04, 0.6, 0.1, tint(concrete, -0.08), { at: [cx, 0, ZF + 0.02] });
  b.box(HW, 0.3, 0.14, concrete, { at: [cx, G - 0.05, ZF + 0.05] });
  b.box(HW, 0.25, 0.14, concrete, { at: [cx, EAVES - 0.25, ZF + 0.05] });
  for (const s of [1, -1]) b.box(0.35, EAVES, 0.1, concrete, { at: [cx + s * (HW / 2 - 0.175), 0, ZF + 0.04] });

  // the shaped gable with its concrete coping and the date stone
  const outline = gableOutline(o.kind, HW / 2, GABLE);
  b.extrude(outline.map(([x, y]) => [x * 1.03, y * 1.0 + (y > 0 ? 0.14 : 0)] as [number, number]), 0.3, concrete, { at: [cx, EAVES, ZF - 0.14] });
  b.extrude(outline, 0.34, brick, { at: [cx, EAVES, ZF - 0.12] });
  pitched(b, HW - 0.3, D - 0.4, GABLE - 0.5, roof, { at: [cx, EAVES, zc - 0.2], ridge: 'z', overhang: 0.12, ends: 0.3, wall: brick, thick: 0.12, courses: 9 });
  b.panel(1.7, 0.75, concrete, { at: [cx, EAVES + 1.1, ZF + 0.05], facing: '+z', depth: 0.05 });
  digits(b, o.year, [cx, EAVES + 1.25, ZF + 0.1], '+z', 0.44, tint(o.brick, -0.1));
  b.window(1.0, 0.7, { at: [cx, EAVES + 2.05, ZF + 0.05], facing: '+z', frame: P.white, glass: P.glassDark, bars: [3, 1], mat: 'glass', border: 0.07 });

  // ground floor: door under a concrete canopy, a mosaic panel, a window
  const dx = cx - 2.1;
  b.panel(1.4, 2.75, concrete, { at: [dx, 0.3, ZF + 0.02], facing: '+z', depth: 0.04 });
  b.panel(1.05, 2.5, o.door, { at: [dx, 0.3, ZF + 0.02], facing: '+z', depth: 0.08 });
  for (let i = 0; i < 3; i++) b.panel(0.18, 0.9, P.glassDark, { at: [dx - 0.25 + i * 0.25, 1.6, ZF + 0.02], facing: '+z', depth: 0.1 });
  b.box(1.7, 0.14, 0.85, concrete, { at: [dx, 2.95, ZF + 0.42] });
  b.stairs(1.5, 0.3, 0.55, 2, tint(concrete, -0.05), { at: [dx, 0, ZF + 0.32] });
  const mosaic = [0x2f6f8f, 0xd9a441, 0xe8e0cc, 0x2f6f8f];
  for (let i = 0; i < 6; i++) b.panel(0.22, 0.22, mosaic[i % 4], { at: [dx - 0.55 + i * 0.22, 3.25, ZF + 0.03], facing: '+z', depth: 0.05 });
  const wx = cx + 1.0;
  b.box(2.6, 0.25, 0.14, concrete, { at: [wx, 2.55, ZF + 0.05] });
  b.window(2.2, 1.75, { at: [wx, 0.8, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [4, 2], mat: 'glass', border: 0.08 });
  b.box(2.4, 0.12, 0.22, concrete, { at: [wx, 0.72, ZF + 0.08] });

  // first floor: a bow window (ours) or a balcony, both with geometric ironwork
  if (o.ours) {
    bowWindow(b, [wx, G + 0.25, ZF], 2.6, 2.5, 0.7, concrete, P.white, { roof: concrete, sillH: 0.85, base: concrete });
    decoRail(b, 1.05, [dx, G + 0.4, ZF + 0.42], P.castIron);
    b.box(1.3, 0.12, 0.5, concrete, { at: [dx, G + 0.28, ZF + 0.22] });
  } else {
    b.box(2.6, 0.14, 0.8, concrete, { at: [wx, G + 0.25, ZF + 0.4] });
    decoRail(b, 2.5, [wx, G + 0.39, ZF + 0.75], P.castIron);
  }
  b.window(o.ours ? 1.0 : 1.6, 2.0, { at: [o.ours ? dx : wx, G + 0.4, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 4], mat: 'glass', border: 0.07 });
  if (!o.ours) b.window(1.0, 2.0, { at: [dx, G + 0.4, ZF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 4], mat: 'glass', border: 0.07 });
  b.box(2.6, 0.22, 0.14, concrete, { at: [o.ours ? dx : wx, G + 2.45, ZF + 0.05] });

  // the back: plain brick, a kitchen wing, steel windows
  b.box(3.0, 2.9, 2.6, brick, { at: [cx + 1.8, 0, ZB - 1.3] });
  b.box(3.1, 0.2, 2.7, concrete, { at: [cx + 1.8, 2.9, ZB - 1.3] });
  b.window(1.2, 1.1, { at: [cx + 1.8, 1.1, ZB - 2.62], facing: '-z', frame: P.white, glass: P.glassDark, bars: [3, 1] });
  b.panel(0.9, 2.2, o.door, { at: [cx - 1.3, 0, ZB], facing: '-z' });
  for (const x of [-1.5, 1.5]) b.window(1.2, 1.6, { at: [cx + x, G + 0.6, ZB - 0.02], facing: '-z', frame: P.white, glass: P.glassDark, bars: [2, 3] });
  b.box(HW, 0.25, 0.1, concrete, { at: [cx, G - 0.05, ZB - 0.04] });
  b.chimney(0.6, 1.4, 0.8, brick, { at: [cx + HW / 2 - 0.5, EAVES + 1.8, zc - 2.6], pots: 1 });
}

export const reconstructionHouse: BuildingDef = {
  id: 'reconstruction-house',
  name: 'House of the Reconstruction',
  style: 'Art Deco (the Reconstruction)',
  date: 'c. 1924',
  summary:
    'The front ran a few kilometres away from 1914 to 1918, and towns such as Reims and Saint-Quentin came out of the war largely in ruins. ' +
    'The war damages law of April 1919 paid owners to rebuild, and through the 1920s whole streets went up at once, designed by architects in the fashion of the day. ' +
    'Brick is laid round a frame of reinforced concrete, whose lintels, bands and piers are left showing; the gable to the street is cut into a stepped or curved Art Deco outline with the year of rebuilding set in it; a bow window, geometric ironwork and a strip of mosaic finish the front.',
  materials: ['brick on a reinforced-concrete frame', 'exposed concrete lintels and bands', 'wrought iron', 'mechanical clay tiles', 'mosaic'],
  modelledOn:
    'Generic, after the rebuilt streets of Saint-Quentin and Reims, where hundreds of fronts of this kind put up in the 1920s still stand.',
  influences: ['art-deco', 'reinforced-concrete'],
  lookFor: [
    {
      label: 'Art Deco gable',
      note: 'The gable is cut into steps or a curve with a concrete coping, the most striking signature of the rebuilt streets.',
      at: [-3.4, 10.2, 7.9],
    },
    {
      label: 'Date stone',
      note: 'The year of rebuilding is set proudly in the gable: across the old front line the 1920s dates are everywhere.',
      at: [-3.4, 7.95, 8.1],
    },
    {
      label: 'Bow window',
      note: 'A canted bay of concrete pushes the sitting room out over the pavement for light and a view of the street.',
      at: [-2.4, 4.9, 8.65],
    },
    {
      label: 'Geometric ironwork',
      note: 'Straight bars and lozenges instead of the curls of 1900: the ironwork has turned Art Deco.',
      at: [-5.5, 4.0, 8.35],
    },
    {
      label: 'Exposed concrete frame',
      note: 'Piers, bands and lintels of reinforced concrete are left showing between the panels of brick.',
      at: [-0.2, 2.0, 8.0],
    },
  ],
  build(b) {
    const roof = tint(b.pick([P.tileRed, P.terracotta, P.tuilePlate, P.tileBrown]), b.range(-0.04, 0.02));
    const conc = tint(b.pick([P.concreteWhite, P.cream, P.concrete]), b.range(-0.02, 0.02));
    const kindA = b.chance(0.5) ? 'stepped' : 'curved';
    house(b, -HW / 2, {
      brick: tint(b.pick([P.briqueNord, P.brickRed, P.brickOrange]), b.range(-0.03, 0.03)),
      concrete: conc,
      roof,
      door: b.pick([P.doorGreen, P.doorBlue, P.oakDark, P.doorRed]),
      ours: true,
      kind: kindA,
      year: b.pick(['1922', '1923', '1924', '1925', '1926']),
    });
    house(b, HW / 2, {
      brick: tint(b.pick([P.brickYellow, P.briqueNord, P.brickBuff, P.brickRed]), b.range(-0.03, 0.02)),
      concrete: tint(conc, b.range(-0.04, 0.02)),
      roof: b.chance(0.5) ? roof : tint(P.ardoise, 0.02),
      door: b.pick([P.doorBlack, P.oakDark, P.doorGreen, tint(P.voletBleu, -0.1)]),
      ours: false,
      kind: kindA === 'stepped' ? 'curved' : 'stepped',
      year: b.pick(['1921', '1923', '1924', '1925', '1927']),
    });
    // gardens behind
    const wall = tint(P.briqueNord, 0.05);
    yardWall(b, 0, ZB, 0, -8.75, 1.8, wall, P.concreteWhite);
    yardWall(b, -6.75, ZB, -6.75, -8.75, 1.8, wall, P.concreteWhite);
    yardWall(b, 6.75, ZB, 6.75, -8.75, 1.8, wall, P.concreteWhite);
    yardWall(b, -6.75, -8.75, 6.75, -8.75, 1.8, wall, P.concreteWhite);
    for (const cx of [-HW / 2, HW / 2]) b.box(0.9, 0.04, 5.6, P.concrete, { at: [cx - 1.4, 0, -5.9], jitter: false });
    vegBed(b, -1.6, -6.8, 2.6, 3.4, { rows: 4 });
    vegBed(b, 5.2, -7.0, 2.4, 3.0, { rows: 3, color: P.leafDark });
    washing(b, [-6.3, 1.9, -5.0], [-3.2, 1.9, -5.0], [P.white, 0x8fa3b8, P.white, P.cream]);
    b.box(1.4, 2.0, 1.1, tint(P.oak, 0.12), { at: [2.0, 0, -7.9] }); // garden shed
    b.shed(1.6, 1.3, 0.3, P.tarmac, { at: [2.0, 2.0, -7.9], high: '-z' });
    b.tree(b.range(3.5, 4.2), { at: [5.0, 0, -4.3], kind: 'round', color: P.leaf });
  },
};
