import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { DEG, paling, patch, tileRoof, vegBed } from './shared';

const ZF = 3.4; // front wall of the houses: a front garden before them
const EAVES = 4.3; // a storey and a half: the upper rooms partly in the roof

/** Half-timbering in a gable triangle: studs and a pair of braces, on a wall facing ±z at z. */
function timberGable(b: Builder, x: number, z: number, w: number, y0: number, h: number, oak: number, infill: number, f: '+z' | '-z'): void {
  const s = f === '+z' ? 1 : -1;
  // the infill plastered a little proud of the brick, then the timbers on it
  b.extrude([[-w / 2, 0], [w / 2, 0], [0, h]], 0.06, infill, { at: [x, y0, z + s * 0.03], rotY: f === '+z' ? 0 : Math.PI });
  const zz = z + s * 0.08;
  b.box(w, 0.16, 0.06, oak, { at: [x, y0, zz] });
  const n = 5;
  for (let k = 1; k < n; k++) {
    const u = -w / 2 + (w * k) / n;
    const top = h * (1 - Math.abs(u) / (w / 2));
    b.box(0.13, top - 0.1, 0.06, oak, { at: [x + u, y0, zz] });
  }
  for (const sx of [-1, 1]) b.beam([x + sx * w * 0.42, y0 + 0.1, zz], [x + sx * w * 0.12, y0 + h * 0.62, zz], 0.12, 0.06, oak, { jitter: false });
  b.box(w * 0.5, 0.13, 0.06, oak, { at: [x, y0 + h * 0.5, zz] });
}

/** A window with a brick or painted surround and a pair of shutters open against the wall. */
function shutteredWindow(b: Builder, x: number, y: number, z: number, w: number, h: number, f: '+z' | '-z', shutter: number, surround: number): void {
  const s = f === '+z' ? 1 : -1;
  b.panel(w + 0.24, h + 0.24, surround, { at: [x, y - 0.12, z], facing: f, depth: 0.03 });
  b.window(w, h, { at: [x, y, z], facing: f, frame: P.white, glass: P.windowDark, bars: [2, 3], border: 0.06 });
  for (const sx of [-1, 1]) b.panel(w / 2, h, shutter, { at: [x + sx * (w * 0.75 + 0.14), y, z], facing: f, depth: 0.05 });
  b.box(w + 0.3, 0.07, 0.16, P.pierreBlonde, { at: [x, y - 0.12, z + s * 0.08] });
}

type Style = 'cross-gables' | 'twin-gable';

/**
 * A pair of semi-detached cottages centred on x. 'cross-gables': ridge along the street with a
 * half-timbered gable over each house; 'twin-gable': one big gable to the street shared by the pair.
 */
function pair(b: Builder, x: number, style: Style, o: { wall: number; brick: number; roof: number; oak: number; infill: number; shutters: [number, number] }): void {
  const { wall, brick, roof, oak, infill } = o;
  const w = style === 'twin-gable' ? 9.6 : 10.8;
  const d = style === 'twin-gable' ? 8.0 : 6.6;
  const zc = ZF - d / 2;
  // walls: a brick plinth and quoins, the rest rendered (or all brick)
  b.box(w, EAVES, d, wall, { at: [x, 0, zc] });
  b.box(w + 0.06, 0.7, d + 0.06, brick, { at: [x, 0, zc] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.45, EAVES - 0.7, 0.45, brick, { at: [x + sx * (w / 2 - 0.2), 0.7, zc + sz * (d / 2 - 0.2)] });
  b.box(0.3, EAVES, 0.1, brick, { at: [x, 0, ZF + 0.03] }); // the party wall shows as a brick pier
  b.collider(w, d, { at: [x, 0, zc] });
  for (const sx of [-1, 1] as const) {
    const hx = x + sx * (w / 4); // centre of this house
    const shutter = o.shutters[sx > 0 ? 1 : 0];
    // door at the outer end, under a little tiled hood on brackets
    const dx = x + sx * (w / 2 - 1.1);
    b.panel(1.0, 2.2, brick, { at: [dx, 0.1, ZF], facing: '+z', depth: 0.03 });
    b.panel(0.85, 2.05, shutter, { at: [dx, 0.15, ZF], facing: '+z', depth: 0.06 });
    b.box(0.9, 0.12, 0.6, P.pierreBlonde, { at: [dx, 0, ZF + 0.3] });
    b.gable(1.5, 0.75, 0.45, roof, { at: [dx, 2.55, ZF + 0.38], overhang: 0.05, thick: 0.08 });
    for (const s of [-1, 1]) b.beam([dx + s * 0.62, 2.0, ZF + 0.02], [dx + s * 0.62, 2.5, ZF + 0.7], 0.08, 0.1, oak);
    // windows: ground floor and upstairs, front and back
    if (style === 'twin-gable') shutteredWindow(b, hx - sx * 0.6, 0.95, ZF, 1.2, 1.4, '+z', shutter, brick);
    shutteredWindow(b, x + sx * (w / 2 - 1.3), 0.95, ZF - d, 1.0, 1.3, '-z', shutter, brick);
    b.panel(0.85, 2.0, shutter, { at: [hx - sx * 0.2, 0.1, ZF - d], facing: '-z', depth: 0.06 });
    if (style === 'cross-gables') {
      // a gable over each house, stepped forward, half-timbered in the triangle
      const gw = 3.8;
      const gx = hx - sx * 0.6;
      const gd = 0.7;
      const gh = (gw / 2) * Math.tan(55 * DEG);
      b.box(gw, EAVES, gd, wall, { at: [gx, 0, ZF + gd / 2] });
      b.box(gw + 0.06, 0.7, gd + 0.06, brick, { at: [gx, 0, ZF + gd / 2] });
      tileRoof(b, gw, gd + 3.4, 55, roof, { at: [gx, EAVES, ZF + gd - (gd + 3.4) / 2], ridge: 'z', ov: 0.3, wall: infill });
      timberGable(b, gx, ZF + gd, gw, EAVES, gh, oak, infill, '+z');
      b.box(gw + 0.1, 0.18, 0.12, oak, { at: [gx, EAVES - 0.1, ZF + gd + 0.05] });
      // the windows move on to the projecting bay
      shutteredWindow(b, gx, 2.65, ZF + gd, 1.1, 1.2, '+z', shutter, brick);
      shutteredWindow(b, gx, 0.95, ZF + gd, 1.4, 1.4, '+z', shutter, brick);
      b.panel(0.5, 0.6, P.windowDark, { at: [gx, EAVES + gh * 0.32, ZF + gd + 0.1], facing: '+z', depth: 0.03 });
    } else {
      // upstairs windows in the big gable
      shutteredWindow(b, hx - sx * 0.4, 2.7, ZF, 1.0, 1.15, '+z', shutter, brick);
      // a dormer on the side slope
      b.group({ at: [x + sx * (w / 2 - 1.6), 0, zc - 0.5] }, () => {
        b.box(1.3, 1.3, 1.6, wall, { at: [sx * 0.6, EAVES + 0.4, 0] });
        b.gable(1.6, 1.8, 0.8, roof, { at: [sx * 0.6, EAVES + 1.7, 0], ridge: 'x', overhang: 0.08, thick: 0.08 });
        b.window(0.8, 0.9, { at: [sx * 1.26, EAVES + 0.6, 0], facing: sx > 0 ? '+x' : '-x', frame: P.white, bars: [2, 2], border: 0.06 });
      });
    }
  }
  // the main roof
  if (style === 'cross-gables') {
    tileRoof(b, w, d, 52, roof, { at: [x, EAVES, zc], ov: 0.4, wall: wall });
    const h = (d / 2) * Math.tan(52 * DEG);
    b.chimney(0.8, 1.3, 0.55, brick, { at: [x, EAVES + h - 0.4, zc - 0.4], pots: 2 });
    for (const sx of [-1, 1]) b.window(0.7, 0.8, { at: [x + sx * (w / 2), EAVES + 0.4, zc], facing: sx > 0 ? '+x' : '-x', frame: P.white, bars: [2, 2], border: 0.06 });
  } else {
    const h = (w / 2) * Math.tan(50 * DEG);
    tileRoof(b, w, d, 50, roof, { at: [x, EAVES, zc], ridge: 'z', ov: 0.45, wall: infill });
    timberGable(b, x, ZF, w, EAVES, h, oak, infill, '+z');
    timberGable(b, x, ZF - d, w, EAVES, h, oak, infill, '-z');
    b.box(w + 0.2, 0.2, 0.14, oak, { at: [x, EAVES - 0.12, ZF + 0.07] });
    b.chimney(0.6, 1.4, 0.9, brick, { at: [x, EAVES + h - 0.5, zc], pots: 2 });
  }
}

export const citeJardin: BuildingDef = {
  id: 'cite-jardin',
  name: 'Garden-city cottages',
  style: 'Regionalist, of the Reconstruction',
  date: 'c. 1922',
  summary:
    'The war left the towns of the north in ruins and their workers homeless. Housing societies and employers answered with garden cities on the English model: pairs of cottages in their own gardens, set along curving tree-lined streets with a school, baths and a church at the centre. ' +
    'In place of the courée’s single room the family now had a kitchen, a parlour and bedrooms upstairs, with water laid on and a garden for vegetables. ' +
    'The houses were built in a deliberately reassuring regional manner, with steep tiled roofs, brick dressings and half-timbered gables, so that the new estate looked like a village that had always been there.',
  materials: ['brick', 'lime render', 'flat clay tiles', 'oak half-timbering (often only applied)', 'painted shutters'],
  modelledOn: 'The garden city of the Chemin-Vert, Reims (laid out from 1919 and built by 1925 for the Foyer Rémois of Georges Charbonneaux, architect Jean-Marcel Auburtin: 617 houses), in general terms',
  lookFor: [
    { label: 'Semi-detached pair', note: 'Two houses share one roof and a party wall, so each family has a house and garden of its own at less than the cost of a detached house.', at: [-6.2, 2.0, ZF + 1.0] },
    { label: 'Half-timbered gable', note: 'Timbering in the gable recalls the old houses of Picardy and Normandy: a picture of the village, not of the factory.', at: [6.3, 6.6, ZF + 0.2] },
    { label: 'Steep tiled roof', note: 'Flat clay tiles at about fifty degrees, the traditional roof of the region.', at: [-8.0, 6.6, 0.4] },
    { label: 'Front garden and hedge', note: 'Every house stands back from the street behind a garden and a low fence or hedge.', at: [-3.5, 0.8, 7.2] },
    { label: 'Vegetable garden', note: 'The long garden behind fed the family; growing food was part of the plan.', at: [3.2, 0.6, -5.8] },
  ],
  build(b) {
    const hero = b.variant === 0;
    const renders = [P.enduitGris, mix(P.limewash, P.ochreWash, 0.25), mix(P.limewash, P.pinkWash, 0.3), P.limewash];
    const shutterSets: [number, number][] = [[P.voletVert, P.voletVert], [P.voletBleu, P.voletGris], [P.voletGris, P.voletVert], [P.doorRed, P.voletGris]];
    const roof = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.04), mix(P.tuilePlate, P.brickOrange, 0.3)]);
    const oak = b.pick([P.oakDark, mix(P.oakDark, P.timberBlack, 0.5)]);
    // which pair stands where, and in what dress, varies; the left pair is always the wider one
    const leftStyle: Style = hero ? 'cross-gables' : b.pick(['cross-gables', 'twin-gable'] as Style[]);
    const rightStyle: Style = leftStyle === 'cross-gables' ? 'twin-gable' : 'cross-gables';
    const leftX = leftStyle === 'cross-gables' ? -6.3 : -6.7;
    const rightX = rightStyle === 'cross-gables' ? 6.9 : 6.5;
    const brickHouse = b.chance(0.4);
    pair(b, leftX, leftStyle, { wall: b.pick(renders), brick: P.briqueNord, roof, oak, infill: P.limewash, shutters: b.pick(shutterSets) });
    pair(b, rightX, rightStyle, { wall: brickHouse ? P.briqueNord : b.pick(renders), brick: brickHouse ? tint(P.briqueNord, -0.06) : P.briqueNord, roof: tint(roof, 0.03), oak, infill: mix(P.limewash, P.cream, 0.5), shutters: b.pick(shutterSets) });

    // the pavement and grass verge with a young lime tree
    patch(b, 25.6, 1.4, P.paving, [0, 7.3], 0.1);
    // front gardens: lawn, a path to each door, a low paling with gates
    patch(b, 25.6, 3.2, P.grass, [0, 5.0], 0.05);
    for (const [px, w] of [[leftX, leftStyle === 'cross-gables' ? 10.8 : 9.6], [rightX, rightStyle === 'cross-gables' ? 10.8 : 9.6]] as const) {
      for (const s of [-1, 1]) patch(b, 1.0, 3.2, P.gravel, [px + s * (w / 2 - 1.1), 5.0], 0.07);
    }
    paling(b, [-12.8, 6.55], [12.8, 6.55], { h: 0.85, color: b.pick([P.white, P.voletVert, P.oakSilver]) });
    // the hedges between the gardens, front and back
    for (const x of [0.3, -12.7, 12.7]) b.box(0.6, 1.1, 3.0, P.hedge, { at: [x, 0, 5.0] });
    for (const x of [-12.7, leftX, 0.3, rightX, 12.7]) b.box(0.5, 1.2, 3.0, P.hedge, { at: [x, 0, -6.2] });
    b.box(25.6, 1.2, 0.5, P.hedge, { at: [0, 0, -7.6] });

    // back gardens: vegetable beds, a shed, fruit trees, a rabbit hutch
    const beds: [number, number][] = [[-9.6, -5.4], [-3.2, -5.6], [3.6, -5.2], [9.8, -5.6]];
    beds.forEach(([bx, bz], i) => {
      vegBed(b, 3.6, 2.6, [bx + (i % 2 ? 0.6 : -0.6), bz], { rows: 4 });
      if (i % 2 === 0) b.tree(b.range(3.6, 4.6), { kind: 'round', at: [bx + 2.2, 0, -6.8], color: mix(P.leaf, P.leafDark, b.rand()) });
      else {
        b.box(1.6, 1.9, 1.4, P.oakSilver, { at: [bx - 1.9, 0, -6.6] });
        b.shed(1.8, 1.6, 0.3, P.tarmac, { at: [bx - 1.9, 1.9, -6.6], high: '-z' });
        b.panel(0.7, 1.6, tint(P.oakSilver, -0.1), { at: [bx - 1.9, 0, -5.9], facing: '+z', depth: 0.04 });
      }
    });
  },
};
