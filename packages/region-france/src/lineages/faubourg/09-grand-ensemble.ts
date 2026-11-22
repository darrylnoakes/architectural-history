import { P, mix, tint, type Builder, type BuildingDef, type Facing, type Vec3 } from '@ah/kit';
import { patch, railing, wallRects } from './shared';

const FH = 2.7; // storey height of the industrialised flat
const RDC = 3.0; // ground floor: entrance halls, cellars, bicycle stores
// the slab (barre)
const SL = 25.6;
const SZ0 = -7.8;
const SZ1 = 1.0;
const SN = 10; // floors above the ground floor
const STOP = RDC + SN * FH;
// the tower (tour)
const TX = -9.2;
const TW = 6.6;
const TZ0 = 2.2;
const TZ1 = 7.9;
const TN = 15;
const TTOP = RDC + TN * FH;
// the shopping parade
const CX0 = TX + TW / 2;
const CX1 = 12.7;
const CZ0 = 2.3;
const CZ1 = 6.0;
const CH = 3.6;

type Rect = [number, number, number, number];

/**
 * One face of prefabricated panels: a storey-high panel per bay, its joints showing as a grid, a window
 * or a loggia in each. `pattern(i, f)` picks what goes in bay i on floor f: 'w' window, 'l' loggia, 's'
 * stair window, '-' blank.
 */
function panelFace(
  b: Builder,
  at: Vec3,
  facing: Facing,
  len: number,
  bays: number,
  floors: number,
  pattern: (i: number, f: number) => 'w' | 'l' | 's' | '-',
  o: { loggia: number; joint: number; rail: number },
): void {
  const bw = len / bays;
  const joints: Rect[] = [];
  const glass: Rect[] = [];
  const frames: Rect[] = [];
  const logg: Rect[] = [];
  const fronts: Rect[] = [];
  for (let f = 0; f < floors; f++) {
    const y = RDC + f * FH;
    joints.push([0, y - 0.03, len, 0.06]);
    for (let i = 0; i < bays; i++) {
      const u = -len / 2 + (i + 0.5) * bw;
      if (f === 0) joints.push([-len / 2 + i * bw, RDC, 0.06, floors * FH]);
      const kind = pattern(i, f);
      if (kind === 'w') {
        frames.push([u, y + 0.85, bw * 0.62, 1.4]);
        glass.push([u, y + 0.92, bw * 0.62 - 0.14, 1.26]);
      } else if (kind === 's') {
        glass.push([u, y + 0.3, 0.7, FH - 0.6]);
      } else if (kind === 'l') {
        logg.push([u, y + 0.08, bw - 0.25, FH - 0.2]);
        glass.push([u - bw * 0.15, y + 0.15, bw * 0.4, 2.1]);
        fronts.push([u, y + 0.05, bw - 0.1, 1.0]);
      }
    }
  }
  wallRects(b, joints, o.joint, at, facing, 0.02);
  wallRects(b, logg, o.loggia, at, facing, 0.025);
  wallRects(b, frames, P.aluminium, at, facing, 0.03);
  wallRects(b, glass, P.windowDark, at, facing, 0.04);
  wallRects(b, fronts, o.rail, at, facing, 0.25);
}

/** A rooftop lift-motor room, with a couple of television aerials. */
function rooftop(b: Builder, x: number, y: number, z: number, conc: number): void {
  b.box(3.0, 2.2, 2.6, conc, { at: [x, y, z] });
  b.box(3.2, 0.15, 2.8, tint(conc, -0.1), { at: [x, y + 2.2, z] });
  for (const dx of [-0.8, 0.9]) {
    b.box(0.05, 1.8, 0.05, P.steel, { at: [x + dx, y + 2.35, z] });
    b.box(1.0, 0.04, 0.04, P.steel, { at: [x + dx, y + 3.7, z] });
    b.box(0.7, 0.04, 0.04, P.steel, { at: [x + dx, y + 3.95, z] });
  }
}

export const grandEnsemble: BuildingDef = {
  id: 'grand-ensemble',
  name: 'Grand ensemble',
  style: 'Industrialised Modernism',
  date: 'c. 1962',
  summary:
    'In 1954 France was short of some four million homes, and families were still living in courées, huts and shanty towns. From 1958 the state answered with the ZUP (zone à urbaniser en priorité): whole districts of flats built at speed on open land at the edge of town, with their schools and shops planned at the same time. ' +
    'The flats were assembled from storey-high concrete panels cast in factories and lifted into place by tower cranes, the cranes running on rails along the long slabs (barres), with towers (tours) among them. ' +
    'For the first tenants, the bathroom, central heating and light were a revolution; within twenty years many estates had become places of unemployment and isolation. A government circular of 1973 (the Guichard circular) put an end to building them.',
  materials: ['precast reinforced-concrete panels', 'aluminium windows', 'coloured glass and enamelled panels', 'asphalt'],
  modelledOn: 'The grands ensembles and ZUPs of the 1960s (Sarcelles, begun 1955; the Croix-Rouge ZUP at Reims, decided in 1962 and built from the late 1960s), in general terms',
  influences: ['reinforced-concrete', 'le-corbusier'],
  lookFor: [
    { label: 'Barre (slab)', note: 'A long block eleven storeys high, built in a straight line so the crane could run along it on rails.', at: [8.0, STOP - 3, SZ1 + 0.3] },
    { label: 'Tour (tower)', note: 'A point block of sixteen storeys, its flats round a central lift and stair.', at: [TX, TTOP - 4, TZ1 + 0.3] },
    { label: 'Precast panels', note: 'The facade is made of storey-high concrete panels, cast in a factory; the joints between them make the grid.', at: [-3.0, 15.0, SZ1 + 0.2] },
    { label: 'Loggias', note: 'Each flat has a loggia, a balcony recessed into the face of the block, with a coloured panel at the back.', at: [2.6, 10.0, SZ1 + 0.4] },
    { label: 'Centre commercial', note: 'A strip of shops under a concrete canopy: baker, chemist, café-tabac, planned with the flats.', at: [6.0, 3.0, CZ1 + 0.8] },
  ],
  build(b) {
    const conc = b.pick([P.concreteWhite, mix(P.concreteWhite, P.concrete, 0.4), P.concrete]);
    const joint = tint(conc, -0.18);
    const accent = b.pick([P.cladBlue, P.cladYellow, P.cladRed, P.cladGreen]);
    const accent2 = b.pick([P.cladYellow, P.cladBlue, P.cladWhite]);

    // the ground: asphalt forecourt, a strip of lawn behind the slab
    patch(b, 25.8, 8 - SZ1, mix(P.tarmac, P.paving, 0.35), [0, (SZ1 + 8) / 2], 0.05);
    patch(b, 25.8, 0.4, P.grass, [0, -7.95], 0.04);

    // ------------------------------------------------ the slab
    const szc = (SZ0 + SZ1) / 2;
    const SD = SZ1 - SZ0;
    b.box(SL, STOP, SD, conc, { at: [0, 0, szc] });
    b.box(SL, RDC, SD + 0.05, tint(conc, -0.1), { at: [0, 0, szc] });
    b.box(SL + 0.2, 0.5, SD + 0.2, tint(conc, -0.05), { at: [0, STOP, szc] }); // the roof upstand
    b.collider(SL, SD, { at: [0, 0, szc] });
    const bays = 7;
    // front: loggias in two vertical strips, windows elsewhere; back: windows and stair windows
    const front = (i: number) => (i === 1 || i === 4 ? 'l' : 'w');
    panelFace(b, [0, 0, SZ1], '+z', SL, bays, SN, front, { loggia: accent, joint, rail: conc });
    panelFace(b, [0, 0, SZ0], '-z', SL, bays, SN, (i) => (i === 2 || i === 5 ? 's' : 'w'), { loggia: accent2, joint, rail: conc });
    // the end walls (pignons): blind panels
    for (const s of [-1, 1]) {
      panelFace(b, [s * (SL / 2), 0, szc], s > 0 ? '+x' : '-x', SD, 3, SN, () => '-', { loggia: accent, joint, rail: conc });
    }
    // entrance halls on the ground floor: glazed, with a little canopy
    for (const x of [-4.0, 6.8]) {
      b.window(2.6, 2.5, { at: [x, 0.05, SZ1], facing: '+z', frame: P.aluminium, glass: P.glassDark, bars: [3, 1], border: 0.08, mat: 'glass' });
      b.box(3.4, 0.15, 1.4, conc, { at: [x, 2.65, SZ1 + 0.7] });
    }
    // cellar windows on the ground floor
    wallRects(b, [-11, -8, -1, 2, 10].map((u) => [u, 1.8, 1.2, 0.5] as Rect), P.windowDark, [0, 0, SZ1], '+z', 0.04);
    wallRects(b, [-10, -6, -2, 2, 6, 10].map((u) => [u, 1.8, 1.2, 0.5] as Rect), P.windowDark, [0, 0, SZ0], '-z', 0.04);
    rooftop(b, -6.5, STOP + 0.5, szc, conc);
    rooftop(b, 7.0, STOP + 0.5, szc, conc);

    // ------------------------------------------------ the tower
    const tzc = (TZ0 + TZ1) / 2;
    const TD = TZ1 - TZ0;
    b.box(TW, TTOP, TD, conc, { at: [TX, 0, tzc] });
    b.box(TW, RDC, TD + 0.05, tint(conc, -0.1), { at: [TX, 0, tzc] });
    b.box(TW + 0.2, 0.5, TD + 0.2, tint(conc, -0.05), { at: [TX, TTOP, tzc] });
    b.collider(TW, TD, { at: [TX, 0, tzc] });
    panelFace(b, [TX, 0, TZ1], '+z', TW, 3, TN, (i) => (i === 1 ? 'l' : 'w'), { loggia: accent2, joint, rail: conc });
    panelFace(b, [TX, 0, TZ0], '-z', TW, 3, TN, (i) => (i === 1 ? 's' : 'w'), { loggia: accent2, joint, rail: conc });
    panelFace(b, [TX - TW / 2, 0, tzc], '-x', TD, 3, TN, (i) => (i === 1 ? 'l' : 'w'), { loggia: accent, joint, rail: conc });
    panelFace(b, [TX + TW / 2, 0, tzc], '+x', TD, 3, TN, (i) => (i === 1 ? 'w' : '-'), { loggia: accent, joint, rail: conc });
    b.window(2.4, 2.5, { at: [TX, 0.05, TZ1], facing: '+z', frame: P.aluminium, glass: P.glassDark, bars: [3, 1], border: 0.08, mat: 'glass' });
    rooftop(b, TX, TTOP + 0.5, tzc, conc);

    // ------------------------------------------------ the shopping parade
    const cw = CX1 - CX0;
    const cxc = (CX0 + CX1) / 2;
    const czc = (CZ0 + CZ1) / 2;
    b.box(cw, CH, CZ1 - CZ0, tint(conc, -0.05), { at: [cxc, 0, czc] });
    b.box(cw + 0.3, 0.35, CZ1 - CZ0 + 1.6, conc, { at: [cxc, CH - 0.35, czc + 0.8] }); // flat roof and canopy in one slab
    b.collider(cw, CZ1 - CZ0, { at: [cxc, 0, czc] });
    for (let k = 0; k <= 5; k++) b.cyl(0.09, CH - 0.35, P.steel, { at: [CX0 + 0.4 + ((cw - 0.8) * k) / 5, 0, CZ1 + 1.4], segs: 6 });
    // four shopfronts, each with its fascia colour
    const shops = [
      { fascia: P.cladGreen, sign: 'cross' },
      { fascia: P.cream, sign: 'none' },
      { fascia: P.cladRed, sign: 'tabac' },
      { fascia: accent, sign: 'none' },
    ];
    const sw = cw / shops.length;
    shops.forEach((s, i) => {
      const x = CX0 + (i + 0.5) * sw;
      b.window(sw - 0.6, 2.4, { at: [x - 0.3, 0.3, CZ1], facing: '+z', frame: P.aluminium, glass: P.glassDark, bars: [2, 1], border: 0.07, mat: 'glass' });
      b.panel(0.9, 2.3, P.aluminium, { at: [x + sw / 2 - 0.7, 0.05, CZ1], facing: '+z', depth: 0.05 });
      b.panel(sw - 0.2, 0.5, s.fascia, { at: [x, CH - 0.35, CZ1 + 1.62], facing: '+z', depth: 0.05 });
      if (s.sign === 'cross') {
        // the chemist’s green cross, standing out from the canopy edge
        b.box(0.12, 0.7, 0.24, P.cladGreen, { at: [x - sw / 2 + 0.4, CH, CZ1 + 1.55] });
        b.box(0.12, 0.24, 0.7, P.cladGreen, { at: [x - sw / 2 + 0.4, CH + 0.23, CZ1 + 1.55] });
      } else if (s.sign === 'tabac') {
        // the red lozenge of the tabac (the "carotte")
        b.box(0.12, 0.55, 0.55, P.cladRed, { at: [x - sw / 2 + 0.4, CH + 0.05, CZ1 + 1.55], rot: [Math.PI / 4, 0, 0] });
      }
    });
    // back of the parade: service doors
    for (let i = 0; i < 4; i++) b.panel(1.0, 2.1, P.steel, { at: [CX0 + (i + 0.5) * sw, 0, CZ0], facing: '-z', depth: 0.04 });

    // ------------------------------------------------ around: a bench, a street lamp, a railing
    b.box(1.8, 0.45, 0.45, P.concrete, { at: [-2.2, 0, 1.9] });
    b.cyl(0.08, 5.0, P.steel, { at: [-4.6, 0, 7.6], segs: 6 });
    b.box(1.0, 0.15, 0.3, P.steel, { at: [-4.2, 5.0, 7.6] });
    railing(b, [-12.6, 0, 1.6], [-12.6, 0, 7.8], 0.9, P.steel, 0.5);
  },
};
