import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { HALL, TRICOLOUR, ZC, civicCentre, flag, pave, rectCollider, square, warMemorial } from './shared';
import { MEMORIAL } from './09-rebuilt-town-hall';

/** The offices of the agglomeration: ground floor g, upper floors f each, recessed ground floor. */
export const CC = { x0: 2, x1: 21.2, z0: -18, z1: 0, g: 4.6, f: 3.8, n: 3, recess: 2.0 };
const TOP = CC.g + CC.f * CC.n;
/** The tram line runs along X in front, the stop on its near side. */
const TRAM_Z = 19.4;

const larch = P.larch;
const glassC = mix(P.glass, P.glassGreen, 0.35);

/**
 * The civic offices: a four-storey box of glass behind a screen of vertical larch fins, the ground
 * floor set back under the overhang to make a covered entrance, a green roof with solar panels.
 */
export function civicOffices(b: Builder): void {
  const { x0, x1, z0, z1, g, f, n, recess } = CC;
  const W = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  // ground floor: glass set back, with slim columns carrying the upper floors at the front
  b.box(W - 0.4, g, D - recess, glassC, { at: [xc, 0, zc - recess / 2], mat: 'glass' });
  for (const x of spread(6, x0 + 0.4, x1 - 0.4)) b.cyl(0.22, g, P.cladWhite, { at: [x, 0, z1 - 0.4], segs: 6 });
  // the upper floors: glass with thin white floor edges
  b.box(W, 0.5, D, P.cladWhite, { at: [xc, g, zc] });
  b.box(W - 0.2, TOP - g - 0.5, D - 0.2, glassC, { at: [xc, g + 0.5, zc], mat: 'glass' });
  for (let i = 1; i < n; i++) b.box(W + 0.05, 0.3, D + 0.05, P.cladWhite, { at: [xc, g + i * f, zc], jitter: false });
  b.box(W + 0.4, 0.6, D + 0.4, P.cladWhite, { at: [xc, TOP, zc] });
  // a timber soffit under the overhang of the entrance
  b.box(W - 0.4, 0.05, recess, larch, { at: [xc, g - 0.05, z1 - recess / 2], jitter: false });
  // the screen of vertical larch fins on the front and the two sides
  const finH = TOP - g;
  for (const x of spread(Math.round(W / 0.9), x0 + 0.2, x1 - 0.2)) b.box(0.12, finH, 0.5, larch, { at: [x, g + 0.25, z1 + 0.35], jitter: false });
  for (const ex of [x0 - 0.35, x1 + 0.35]) for (const z of spread(Math.round(D / 1.3), z0 + 0.3, z1 - 0.3)) b.box(0.5, finH, 0.12, larch, { at: [ex, g + 0.25, z], jitter: false });
  // the back: plain glass behind horizontal louvres
  for (let i = 0; i < n; i++) b.box(W - 0.4, 0.15, 0.6, P.aluminium, { at: [xc, g + i * f + 2.4, z0 - 0.3], jitter: false });
  // the green roof with a strip of solar panels
  b.box(W - 1.0, 0.25, D - 1.0, P.turf, { at: [xc, TOP + 0.6, zc], jitter: false });
  for (const z of spread(3, z0 + 3, z0 + 9)) b.box(W - 5, 0.1, 1.6, P.solar, { at: [xc + 1, TOP + 1.2, z], rot: [-0.3, 0, 0], jitter: false });
  for (const z of spread(3, z0 + 3, z0 + 9)) b.box(W - 5, 0.4, 0.1, P.steel, { at: [xc + 1, TOP + 0.85, z - 0.7], jitter: false });
  // the entrance: revolving door, the name in steel letters on the edge of the overhang
  b.box(3.2, 3.0, 0.3, P.steel, { at: [xc - 3, 0, z1 - recess + 0.1], jitter: false });
  b.box(7.5, 0.5, 0.06, P.steel, { at: [xc + 3, g + 0.0, z1 + 0.62], jitter: false });
  flag(b, [x1 - 1, 0, z1 + 1.6], 8.5, TRICOLOUR, { w: 1.8, h: 1.2 });
  flag(b, [x1 - 2.6, 0, z1 + 1.6], 8.5, [0x2d4f9e], { w: 1.8, h: 1.2 });
  rectCollider(b, x0, x1, z0, z1 - recess);
  for (const x of spread(6, x0 + 0.4, x1 - 0.4)) b.collider(0.5, 0.5, { at: [x, 0, z1 - 0.4] });
}

/** A planted forecourt: raised beds of grasses and trees, benches, a light pale paving. */
function forecourt(b: Builder): void {
  const edge = mix(P.concreteWhite, P.pierreBlonde, 0.4);
  for (const [x, z, w, d] of [
    [5.5, 6.5, 7, 4],
    [16.5, 5.0, 8, 3.4],
    [10.5, 11.5, 9, 3],
  ] as [number, number, number, number][]) {
    b.box(w, 0.45, d, edge, { at: [x, 0, z] });
    b.box(w - 0.3, 0.05, d - 0.3, P.grass, { at: [x, 0.45, z], jitter: false });
    for (const dx of spread(Math.round(w / 1.6), -w / 2 + 0.8, w / 2 - 0.8)) b.blob(0.45, P.grassDry, { at: [x + dx, 0.75, z + (dx > 0 ? 0.6 : -0.5)], stretch: [1, 0.8, 1] });
    b.tree(7, { kind: 'round', at: [x + w / 2 - 1.2, 0.45, z] });
    b.collider(w, d, { at: [x, 0, z] });
  }
  for (const x of [3.5, 13]) b.box(2.4, 0.45, 0.6, larch, { at: [x, 0, 14.5] });
}

/** The tram line: grassed track, two rails, overhead wire, and the stop with its shelter. */
function tramStop(b: Builder, a: number, c: number): void {
  const xc = (a + c) / 2;
  const L = c - a;
  pave(b, a, c, TRAM_Z - 1.6, TRAM_Z + 1.6, P.grass, 0.0, 0.08);
  for (const dz of [-0.72, 0.72]) b.box(L, 0.08, 0.1, P.steel, { at: [xc, 0.06, TRAM_Z + dz], jitter: false });
  // catenary poles and the contact wire
  for (const x of [a + 1.2, c - 1.2]) {
    b.cyl(0.12, 6.6, P.cladGrey, { at: [x, 0, TRAM_Z + 2.4], segs: 6 });
    b.box(0.1, 0.1, 2.6, P.cladGrey, { at: [x, 6.3, TRAM_Z + 1.2], jitter: false });
  }
  b.box(L, 0.03, 0.03, P.iron, { at: [xc, 6.0, TRAM_Z], jitter: false });
  // the platform and shelter, on the near side
  const pz = TRAM_Z - 2.6;
  b.box(14, 0.3, 2.0, mix(P.concreteWhite, P.paving, 0.4), { at: [xc, 0, pz] });
  b.box(14, 0.31, 0.3, P.white, { at: [xc, 0, pz + 0.85], jitter: false });
  const sx = xc - 3;
  for (const dx of [-2.2, 2.2]) b.box(0.12, 2.6, 0.12, P.cladGrey, { at: [sx + dx, 0.3, pz - 0.7] });
  b.box(5.0, 0.12, 1.8, P.glass, { at: [sx, 2.9, pz], mat: 'glass', rot: [0.06, 0, 0] });
  b.box(4.6, 1.9, 0.05, P.glass, { at: [sx, 0.6, pz - 0.75], mat: 'glass' });
  b.box(1.0, 1.7, 0.4, P.cladGreen, { at: [xc + 4, 0.3, pz - 0.5] }); // ticket machine and the line map
  b.collider(14, 2.0, { at: [xc, 0, pz] });
}

export const civicCentreDef: BuildingDef = {
  id: 'civic-centre',
  name: 'Offices of the agglomeration',
  style: 'Contemporary, low-energy',
  date: 'c. 2012',
  summary:
    'Since the decentralisation laws of 1982 the prefect no longer runs the department, and since 1999 the town and the communes around it have pooled their transport, planning and waste in an intercommunal council, the communauté d’agglomération, which needs offices of its own. ' +
    'They are built to be seen as open and thrifty with energy: a box of glass behind a screen of vertical larch fins that shade the offices, a ground floor set back under the overhang to make a covered entrance, a green roof with solar panels, a planted forecourt and a stop on the town’s new tram line. ' +
    'The old town hall (old) is still where the mayor sits, weddings are held and the belfry rings, now cleaned and listed as a historic monument.',
  materials: ['glass', 'larch fins', 'steel frame', 'concrete floors', 'sedum roof', 'photovoltaic panels'],
  lookFor: [
    { label: 'Larch fins', note: 'Vertical boards of untreated larch stand off the glass to shade the offices from the low sun, and silver as they weather.', at: [CC.x0 + 4.2, CC.g + 6, CC.z1 + 0.7] },
    { label: 'Covered entrance', note: 'The ground floor is set back under the upper floors, giving a sheltered entrance on slim columns with a timber soffit.', at: [(CC.x0 + CC.x1) / 2 - 3, 2.4, CC.z1 - 0.4] },
    { label: 'Green roof and solar panels', note: 'A planted roof holds rainwater and insulates; rows of photovoltaic panels make some of the building’s electricity.', at: [(CC.x0 + CC.x1) / 2 + 1, TOP + 1.6, CC.z0 + 6] },
    { label: 'Planted forecourt', note: 'Raised beds of grasses and trees make the forecourt a small public garden instead of a car park.', at: [10.5, 1.2, 11.5 + 1.6] },
    { label: 'Tram stop', note: 'French towns brought back the tram from 1985 (Nantes) on, the newer lines often running on grassed track; the stop puts the offices on the line.', at: [ZC.x0 + 7.5, 3.1, TRAM_Z - 2.6] },
  ],
  modelledOn: 'Generic: the intercommunal and departmental offices of the 2000s and 2010s, with the grassed tram tracks of Reims, Angers or Le Mans',
  influences: [],
  build(b) {
    const alone = b.variant > 0;
    if (!alone) {
      square(b, -21.8, 21.8, HALL.z1, 'paving');
      civicCentre(b, 2012);
      warMemorial(b, MEMORIAL.x, MEMORIAL.z);
      tramStop(b, -21.8, 21.8);
    } else {
      square(b, ZC.x0, ZC.x1, CC.z1, 'paving');
      pave(b, ZC.x0, ZC.x1, CC.z0 - 1.5, CC.z1, mix(P.paving, P.concreteWhite, 0.4), -0.01);
      tramStop(b, ZC.x0, ZC.x1);
    }
    civicOffices(b);
    forecourt(b);
    // bicycle stands
    for (const x of spread(4, 17, 20.5)) b.box(0.06, 0.8, 0.7, tint(P.steel, -0.1), { at: [x, 0, 12.5], jitter: false });
  },
};
