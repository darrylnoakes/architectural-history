import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { HALL, TRICOLOUR, ZC, civicCentre, flag, pave, rectCollider, square, warMemorial } from './shared';
import { MEMORIAL } from './09-rebuilt-town-hall';

/** The office slab on pilotis: its long sides face ±X, its blind end faces the street (+Z). */
export const SLAB = { x0: 9.5, x1: 21.5, z0: -20, z1: 4, pil: 4.5, f: 3.0, n: 7 };
const TOP = SLAB.pil + SLAB.f * SLAB.n;
/** The low entrance hall between the slab and the street. */
const LOBBY = { x0: 1.5, x1: 9.5, z0: -9, z1: 1, h: 4.2 };

const conc = P.concrete;
const panel = mix(P.concreteWhite, P.concrete, 0.4);

/**
 * The cité administrative: a slab of seven office floors in precast concrete raised on pilotis, its
 * long sides a grid of continuous windows between concrete fins, its ends blind; a low glazed
 * entrance hall beside it; plant on the roof.
 */
export function citeAdministrative(b: Builder): void {
  const { x0, x1, z0, z1, pil, f, n } = SLAB;
  const W = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  // pilotis: two rows of tapering concrete legs
  const legs = spread(6, z0 + 1.2, z1 - 1.2);
  for (const x of [x0 + 1.4, x1 - 1.4]) for (const z of legs) b.box(0.9, pil, 0.9, tint(conc, -0.05), { at: [x, 0, z] });
  // a glazed hall and the stair and lift core under the slab
  b.box(W - 5, pil - 0.3, 8, mix(P.glassDark, P.glass, 0.3), { at: [xc, 0, -1], mat: 'glass' });
  b.box(4.4, TOP + 2.6, 5.0, tint(conc, -0.08), { at: [xc, 0, -11] });
  // the office floors: concrete spandrels and window bands
  b.box(W, 0.6, D, tint(conc, -0.04), { at: [xc, pil, zc] });
  for (let i = 0; i < n; i++) {
    const y = pil + 0.6 + i * f;
    b.box(W, 1.0, D, panel, { at: [xc, y, zc] });
    b.box(W - 0.3, f - 1.0, D - 0.3, P.glassDark, { at: [xc, y + 1.0, zc], mat: 'glass' });
  }
  b.box(W + 0.3, 0.9, D + 0.3, tint(conc, -0.04), { at: [xc, TOP + 0.6, zc] });
  // vertical precast fins every 1.6 m up both long sides
  for (const z of spread(Math.round(D / 1.6), z0 + 0.3, z1 - 0.3)) {
    for (const ex of [x0 - 0.12, x1 + 0.12]) b.box(0.32, TOP - pil, 0.22, panel, { at: [ex, pil + 0.6, z], jitter: false });
  }
  // the blind ends: concrete panels, their joints showing
  for (const ez of [z0, z1]) {
    b.box(W + 0.2, TOP - pil, 0.3, panel, { at: [xc, pil + 0.6, ez + (ez === z1 ? 0.0 : 0.0)] });
    for (let i = 1; i < n; i++) b.box(W + 0.24, 0.06, 0.34, tint(panel, -0.12), { at: [xc, pil + 0.6 + i * f, ez], jitter: false });
    for (const x of spread(3, x0 + W / 4, x1 - W / 4)) b.box(0.06, TOP - pil, 0.34, tint(panel, -0.12), { at: [x, pil + 0.6, ez], jitter: false });
  }
  // plant on the roof
  b.box(6, 2.4, 6, tint(conc, -0.03), { at: [xc, TOP + 1.5, -5] });
  for (const z of [3, -14]) b.cyl(0.5, 1.6, P.steel, { at: [xc - 3, TOP + 1.5, z], segs: 6 });
  // the entrance hall: a glass box under a deep concrete fascia, the name on it
  const { h } = LOBBY;
  const lx = (LOBBY.x0 + LOBBY.x1) / 2;
  const lz = (LOBBY.z0 + LOBBY.z1) / 2;
  b.box(LOBBY.x1 - LOBBY.x0 - 0.6, h - 0.8, LOBBY.z1 - LOBBY.z0 - 0.6, mix(P.glassDark, P.glass, 0.4), { at: [lx, 0, lz], mat: 'glass' });
  b.box(LOBBY.x1 - LOBBY.x0 + 1.0, 0.8, LOBBY.z1 - LOBBY.z0 + 3.0, conc, { at: [lx, h - 0.8, lz + 1.0] });
  for (const x of spread(4, LOBBY.x0 + 0.2, LOBBY.x1 - 0.2)) b.box(0.25, h - 0.8, 0.25, P.aluminium, { at: [x, 0, LOBBY.z1 + 2.2], jitter: false });
  b.box(6.0, 0.5, 0.06, P.cladBlue, { at: [lx, h - 0.65, LOBBY.z1 + 2.55], jitter: false });
  b.box(5.2, 0.18, 0.04, P.white, { at: [lx, h - 0.5, LOBBY.z1 + 2.6], jitter: false });
  flag(b, [LOBBY.x0 + 0.5, 0, LOBBY.z1 + 4.5], 8, TRICOLOUR, { w: 1.8, h: 1.2 });
  // colliders: the legs, the core, the hall
  for (const x of [x0 + 1.4, x1 - 1.4]) for (const z of legs) b.collider(1.0, 1.0, { at: [x, 0, z] });
  b.collider(W - 5, 8, { at: [xc, 0, -1] });
  b.collider(4.4, 5.0, { at: [xc, 0, -11] });
  rectCollider(b, LOBBY.x0, LOBBY.x1, LOBBY.z0, LOBBY.z1);
}

/** A cheap car of about 1970 (the kit's car is finer than a car park needs), nose toward local +Z. */
function car(b: Builder, color: number, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    b.box(1.55, 0.6, 3.9, color, { at: [0, 0.3, 0] });
    b.box(1.4, 0.5, 1.9, P.glassDark, { at: [0, 0.9, -0.2], jitter: false });
    b.box(1.42, 0.08, 1.7, tint(color, 0.04), { at: [0, 1.4, -0.2], jitter: false });
    for (const z of [-1.2, 1.25]) b.box(1.65, 0.55, 0.6, 0x1d1d1f, { at: [0, 0.02, z], jitter: false });
  });
}

const COLOURS = [0xe0e0d8, 0xc23b2e, 0x3f6f9c, 0xd8a93a, 0x5c8f6a, 0x8a8f94, 0xe6e2c0, 0x9c6b3e];

/** A row of marked bays with cars in some of them, along z, from x a to c. */
function parkingRow(b: Builder, a: number, c: number, z: number, rot: number, skip: (x: number) => boolean, seed: number): void {
  const xs = spread(Math.round((c - a) / 2.6), a + 1.3, c - 1.3);
  for (const x of xs) b.box(0.1, 0.02, 4.4, P.white, { at: [x - 1.3, 0.07, z], jitter: false });
  xs.forEach((x, i) => {
    if (skip(x) || (i * 7 + seed) % 5 === 1) return;
    car(b, COLOURS[(i + seed) % COLOURS.length], [x, 0.05, z], rot);
    b.collider(1.6, 4.0, { at: [x, 0, z] });
  });
}

export const citeAdministrativeDef: BuildingDef = {
  id: 'cite-administrative',
  name: 'Cité administrative',
  style: 'Late Modernist, precast concrete',
  date: 'c. 1970',
  summary:
    'In the boom years the state’s services in the department multiply (roads and housing, agriculture, taxes, social security) and from the 1950s they are gathered into one big office building in each chief town, the cité administrative. ' +
    'It is built fast and to a standard: a slab of seven floors of precast concrete raised on pilotis, its long sides one grid of windows between concrete fins and its ends left blind, with a low glass entrance hall, plant on the roof and a car park where the square used to be. ' +
    'The commune keeps its old town hall (old) for the mayor, the council and weddings; the new slab shows where the decisions are now made.',
  materials: ['reinforced concrete', 'precast concrete panels', 'aluminium windows', 'glass', 'tarmac'],
  lookFor: [
    { label: 'Pilotis', note: 'The office floors stand on two rows of concrete legs, leaving the ground open beneath for a glazed hall and parking.', at: [SLAB.x1 - 1.4, 2.4, SLAB.z1 - 1.0] },
    { label: 'Grid of windows and fins', note: 'Each floor is a continuous band of windows divided by precast concrete fins, the same on every floor: a building made of identical parts.', at: [SLAB.x1 + 0.4, 13, -8] },
    { label: 'Blind end wall', note: 'The ends of the slab have no windows at all, just concrete panels whose joints show the way it was assembled.', at: [(SLAB.x0 + SLAB.x1) / 2 + 2, 16, SLAB.z1 + 0.3] },
    { label: 'Entrance hall', note: 'A low glass hall under a deep concrete fascia carrying the building’s name, where the public queue for forms and permits.', at: [(LOBBY.x0 + LOBBY.x1) / 2, LOBBY.h - 0.4, LOBBY.z1 + 2.7] },
    { label: 'Car park', note: 'The car took over: the forecourt is tarmac marked out in bays, the cars of officials and visitors parked nose to the building.', at: [ZC.x0 + 3.9, 1.6, 13.5] },
  ],
  modelledOn: 'Generic: the cités administratives built in French chief towns from the late 1950s to the 1970s',
  influences: ['le-corbusier'],
  build(b) {
    const alone = b.variant > 0;
    if (!alone) {
      square(b, -21.8, 21.8, HALL.z1, 'tarmac');
      civicCentre(b, 1970);
      warMemorial(b, MEMORIAL.x, MEMORIAL.z);
      parkingRow(b, -21.5, -1.5, 19, Math.PI, (x) => Math.abs(x - MEMORIAL.x) < 3.4, 1);
    } else {
      square(b, ZC.x0, ZC.x1, SLAB.z1, 'tarmac');
      pave(b, ZC.x0, ZC.x1, SLAB.z0 - 1.5, SLAB.z1, mix(P.paving, P.concrete, 0.4), -0.01);
    }
    parkingRow(b, ZC.x0, ZC.x1, 13.5, 0, () => false, 2);
    parkingRow(b, ZC.x0, ZC.x1, 19.2, Math.PI, () => false, 5);
    citeAdministrative(b);
    // concrete lamp standards
    for (const x of [ZC.x0 + 0.6, ZC.x1 - 0.6]) {
      b.cyl(0.12, 8, P.concrete, { at: [x, 0, 9.5], segs: 6, rTop: 0.08 });
      b.box(0.3, 0.2, 1.4, P.aluminium, { at: [x, 8, 9.5 - 0.4] });
    }
  },
};
