import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, platform, quad, soup, tgv, track, forecourt, overheadLine } from './shared';

// the station hall: a glass box
const BX0 = -8.0;
const BX1 = 9.0;
const BZ0 = -3.0;
const BZ1 = 3.6;
const BH = 6.2;
// the long canopy over platform and tracks
const CX0 = -19.6;
const CX1 = 19.6;
const CZ0 = BZ1 + 1.8; // it starts over the street side of the hall...
const CZ1 = -11.8; // ...and runs out over both tracks
const CY = 9.0; // height at the platform-side edge
const RISE = 1.4; // the gentle arch of its section
const NZ = 8;
/** The bus lane across the front of the square; the approach road arrives at its middle. */
const LANE = { hx: 11.6, z0: 6.6, z1: 13.4 };
/** The car parks, either side of the bus lane and on out beyond the plot. */
const PARK = { x0: 11.8, x1: 31.8, z0: 6.0, z1: 13.4, aisle: 11.0 };

/** Height of the underside of the canopy at z. */
function roofY(z: number): number {
  const t = (z - CZ1) / (CZ0 - CZ1); // 0 at the track side, 1 at the street side
  return CY - 0.6 + RISE * Math.sin(Math.PI * t) + 0.6 * t;
}


/** Flat painted lines on the ground, [x, z, length along x, length along z], in one mesh. */
function lines(b: Builder, ls: [number, number, number, number][], y: number, color: number): void {
  const out: number[] = [];
  for (const [x, z, lx, lz] of ls) quad(out, [x - lx / 2, y, z - lz / 2], [x - lx / 2, y, z + lz / 2], [x + lx / 2, y, z + lz / 2], [x + lx / 2, y, z - lz / 2]);
  soup(b, out, color);
}

/**
 * The bus station: a lane of asphalt across the front of the square, which the approach road
 * reaches in the middle, with marked bus stands, two glass shelters and a bus waiting.
 */
function busStation(b: Builder): void {
  const z0 = LANE.z0;
  const z1 = LANE.z1;
  b.box(2 * LANE.hx, 0.08, z1 - z0, P.asphalt, { at: [0, 0, (z0 + z1) / 2], jitter: false });
  b.box(2 * LANE.hx, 0.16, 0.3, P.concreteWhite, { at: [0, 0, z0 - 0.15], jitter: false }); // the kerb of the square
  // three bus stands marked in yellow along the kerb, and arrows of white down the middle of the lane
  const stands: [number, number, number, number][] = [];
  for (const x of [-8.0, 0, 8.0]) {
    stands.push([x, z0 + 1.6, 7.0, 0.12], [x - 3.5, z0 + 1.6 - 1.45, 0.12, 2.9], [x + 3.5, z0 + 1.6 - 1.45, 0.12, 2.9]);
  }
  lines(b, stands.map(([x, z, lx, lz]) => [x, lx > 1 ? z0 + 3.0 : z0 + 1.5, lx, lz]), 0.085, P.cladYellow);
  lines(b, [[-6, z0 + 4.6, 3.0, 0.15], [0, z0 + 4.6, 3.0, 0.15], [6, z0 + 4.6, 3.0, 0.15]], 0.085, P.white);
  // glass shelters on the square, open to the lane
  for (const x of [-8.0, 8.0]) {
    b.group({ at: [x, 0.05, z0 - 1.0] }, () => {
      b.box(3.6, 2.3, 0.06, mix(P.glass, P.white, 0.3), { at: [0, 0.1, -0.7], mat: 'glass' });
      b.sym((s) => b.box(0.08, 2.4, 1.5, P.cladGrey, { at: [s * 1.8, 0, 0] }));
      b.box(3.8, 0.12, 1.7, P.cladGrey, { at: [0, 2.4, 0] });
      b.box(2.4, 0.45, 0.4, P.steel, { at: [0, 0, -0.4] });
    });
  }
  // a town bus at the first stand
  b.group({ at: [-8.0, 0.08, z0 + 1.5] }, () => {
    const L = 11.8;
    const body = mix(P.white, P.aluminium, 0.2);
    b.box(L, 2.6, 2.5, body, { at: [0, 0.35, 0] });
    b.box(L, 0.35, 2.52, P.cladGreen, { at: [0, 0.35, 0], jitter: false });
    b.box(L - 1.0, 0.3, 2.0, tint(body, -0.08), { at: [0.3, 2.95, 0] });
    b.sym((s) => b.box(L - 1.6, 1.1, 0.04, P.glassDark, { at: [0.4, 1.55, s * 1.26], mat: 'glass', jitter: false }));
    b.box(0.04, 1.5, 2.2, P.glassDark, { at: [-L / 2 - 0.01, 1.25, 0], mat: 'glass', jitter: false });
    for (const x of [-L / 2 + 2.5, L / 2 - 3.0]) b.sym((s) => b.log(0.45, 0.3, P.black, { at: [x, 0.45, s * 1.12], axis: 'z', segs: 8 }));
    b.collider(L, 2.5);
  });
}

/** Car parks either side of the bus station, running out beyond the plot onto the open ground. */
function carParks(b: Builder): void {
  const { x0, x1, z0, z1, aisle } = PARK;
  const bay = 2.5;
  const n = Math.round((x1 - x0) / bay);
  const cars = [P.white, P.cladGrey, P.black, P.cladBlue, P.cladRed, mix(P.aluminium, P.steel, 0.4)];
  b.sym((s) => {
    const xc = s * (x0 + x1) / 2;
    b.box(x1 - x0, 0.08, z1 - z0, P.asphalt, { at: [xc, 0, (z0 + z1) / 2], jitter: false });
    // a row of bays facing the station, with an aisle behind them that opens on to the bus lane
    const ls: [number, number, number, number][] = [];
    for (let i = 0; i <= n; i++) ls.push([s * (x0 + i * bay), (z0 + aisle) / 2, 0.12, aisle - z0 - 0.4]);
    lines(b, ls, 0.085, P.white);
    b.box(0.6, 0.25, z1 - z0, P.grass, { at: [s * (x1 + 0.3), 0, (z0 + z1) / 2], jitter: false });
    b.tree(4.4, { kind: 'round', at: [s * (x1 + 2.5), 0, (z0 + z1) / 2], color: mix(P.leaf, P.leafDark, 0.3) });
    // the cars, most bays taken on a weekday
    for (let i = 0; i < n; i++) {
      if (!b.chance(0.75)) continue;
      const x = s * (x0 + (i + 0.5) * bay);
      const z = (z0 + aisle) / 2 - 0.2;
      const col = b.pick(cars);
      b.box(1.75, 0.75, 4.1, col, { at: [x, 0.2, z] });
      b.box(1.55, 0.55, 2.1, mix(col, P.glassDark, 0.55), { at: [x, 0.95, z + 0.2] });
    }
  });
}

export const gareTgv: BuildingDef = {
  id: 'gare-tgv',
  name: 'High-speed station',
  style: 'Contemporary',
  date: '2007',
  summary:
    'The high-speed line from Paris to the east (LGV Est) opened in June 2007 and put the cities of Champagne and Lorraine within an hour or two of the capital. Many towns were served at their old stations; this one, like Reims at Bezannes, was given a new station of its own on open ground at the edge of town, where TGVs, buses, cars and the trains into the centre meet. The old station in the town stays in use for the regional trains. ' +
    'The new station is hardly a building at all: a long canopy of steel and glass on branching columns shelters the platforms, and the hall beneath it is a glass box of ticket machines, a café and seats, open to the light. In front of it, where the old station had a square and a cab rank, are a bus station and car parks, for most travellers now come by car. ' +
    'Glass printed with a pattern of white dots shades the platforms from the sun, and the wires overhead carry 25,000 volts to the train.',
  materials: ['steel', 'fritted glass', 'concrete', 'timber soffit', 'granite paving'],
  modelledOn: 'Champagne-Ardenne TGV at Bezannes, outside Reims (AREP for SNCF, opened 2007), and the other new stations of the LGV Est, in general terms; the canopy here is generic',
  lookFor: [
    { label: 'Long glass canopy', note: 'One continuous roof of steel and glass over the hall, the platform and both tracks.', at: [10.0, CY + 1.6, -5.0] },
    { label: 'Branching columns', note: 'Steel columns that divide into struts like the branches of a tree, so that few supports carry a wide roof.', at: [-12.0, 5.0, -4.6] },
    { label: 'Glass hall', note: 'The hall is a transparent box: you can see the trains from the forecourt.', at: [0.5, 3.0, BZ1 + 0.3] },
    { label: 'TGV', note: 'The high-speed train, with a power car at each end and coaches carried on shared bogies, built for 320 km/h on the new line.', at: [-15.0, 4.6, TRACKS[0] + 1.6] },
    { label: 'Bus station and car parks', note: 'A station on the edge of town is reached by bus and by car: stands for the town buses and coaches, and car parks that take more ground than the station itself (only a corner of them is shown).', at: [-8.0, 3.4, LANE.z0 + 1.5] },
  ],
  build(b) {
    const steel = mix(P.white, P.steel, 0.3);
    const glass = mix(P.glass, P.white, 0.3);
    const frit = mix(P.white, P.glass, 0.35);
    const soffit = mix(P.larch, P.pine, 0.5);

    // a square of granite paving in front of the hall, then the bus station and the car parks
    forecourt(b, mix(P.paving, P.granite, 0.4));
    busStation(b);
    carParks(b);

    // ------------------------------------------------ the glass hall, walkable, with doors front and back
    const L = BX1 - BX0;
    const xc = (BX0 + BX1) / 2;
    const zc = (BZ0 + BZ1) / 2;
    const D = BZ1 - BZ0;
    b.box(L, 0.12, D, P.granite, { at: [xc, 0, zc], jitter: false });
    b.box(L + 0.3, 0.5, D + 0.3, P.cladGrey, { at: [xc, BH, zc] }); // flat roof of the hall
    const gap = 4.0;
    for (const z of [BZ1, BZ0]) {
      for (const s of [-1, 1]) {
        const w = (L - gap) / 2;
        const x = xc + s * (gap / 2 + w / 2);
        b.box(w, BH, 0.08, glass, { at: [x, 0, z], mat: 'glass' });
        b.collider(w, 0.3, { at: [x, 0, z] });
        for (let k = 0; k <= 4; k++) b.box(0.1, BH, 0.16, steel, { at: [x - w / 2 + (w * k) / 4, 0, z] });
      }
      b.box(gap, BH - 2.8, 0.08, glass, { at: [xc, 2.8, z], mat: 'glass' });
      b.box(gap, 0.15, 0.18, steel, { at: [xc, 2.8, z] });
    }
    for (const x of [BX0, BX1]) {
      b.box(0.08, BH, D, glass, { at: [x, 0, zc], mat: 'glass' });
      b.collider(0.3, D, { at: [x, 0, zc] });
    }
    // inside: a ticket office and café pavilion in timber, ticket machines, seats, a departures board
    b.box(4.4, 3.0, 2.4, soffit, { at: [-4.2, 0, 0.6] });
    b.box(3.6, 1.2, 0.05, P.windowLit, { at: [-4.2, 1.2, 1.82] });
    b.collider(4.4, 2.4, { at: [-4.2, 0, 0.6] });
    for (const x of [1.4, 2.4, 3.4]) b.box(0.7, 1.7, 0.5, P.cladRed, { at: [x, 0, 2.6] });
    b.box(3.0, 0.45, 0.6, P.steel, { at: [5.8, 0, -1.2] });
    b.box(3.0, 1.2, 0.15, P.black, { at: [6.0, 3.0, 1.0] });
    b.box(2.7, 0.9, 0.03, P.windowLit, { at: [6.0, 3.15, 1.08] });

    // ------------------------------------------------ platform, tracks, train, overhead line
    platform(b, PLAT.back, PLAT.edge, -HX, HX, { top: mix(P.paving, P.granite, 0.5), edge: P.white });
    // the tactile strip of a modern platform
    b.box(HX * 2, 0.02, 0.4, P.cladYellow, { at: [0, PLAT.y, PLAT.edge + 1.0], jitter: false });
    for (const z of TRACKS) track(b, z, -HX, HX, { sleeper: P.concrete });
    tgv(b, [-19.6, 0, TRACKS[0]], 39);
    b.collider(39, 3.0, { at: [0, 0, TRACKS[0]] });
    overheadLine(b);

    // ------------------------------------------------ the canopy: fritted glass on a steel grid, a timber band
    const zs: number[] = [];
    for (let i = 0; i <= NZ; i++) zs.push(CZ1 + ((CZ0 - CZ1) * i) / NZ);
    const clear: number[] = [];
    const fritted: number[] = [];
    for (let i = 0; i < NZ; i++) {
      const z0 = zs[i];
      const z1 = zs[i + 1];
      const target = i % 3 === 1 ? clear : fritted;
      quad(target, [CX0, roofY(z0) + 0.4, z0], [CX1, roofY(z0) + 0.4, z0], [CX1, roofY(z1) + 0.4, z1], [CX0, roofY(z1) + 0.4, z1]);
    }
    soup(b, fritted, frit, { mat: 'glass' });
    soup(b, clear, glass, { mat: 'glass' });
    // the steel: transverse beams every 3.9 m following the arch, longitudinal purlins, an edge beam
    for (let x = CX0; x <= CX1 + 0.01; x += 3.92) {
      for (let i = 0; i < NZ; i++) b.beam([x, roofY(zs[i]) + 0.15, zs[i]], [x, roofY(zs[i + 1]) + 0.15, zs[i + 1]], 0.16, 0.45, steel);
    }
    for (let i = 0; i <= NZ; i += 2) b.box(CX1 - CX0, 0.18, 0.18, steel, { at: [0, roofY(zs[i]) + 0.22, zs[i]], jitter: false });
    for (const z of [CZ0, CZ1]) b.box(CX1 - CX0 + 0.3, 0.6, 0.3, tint(steel, -0.05), { at: [0, roofY(z), z] });
    // the branching columns: a trunk on the platform and one beyond the tracks, each opening into four struts
    const trees: [number, number][] = [];
    for (let x = -15.7; x <= 15.8; x += 7.84) {
      trees.push([x, -4.6]);
      if (Math.abs(x) > 1) trees.push([x, 5.1]);
    }
    for (const [x, z] of trees) {
      const y0 = z < -3 ? PLAT.y : 0;
      const trunk = 4.4;
      b.cyl(0.2, trunk - y0, steel, { at: [x, y0, z], segs: 8 });
      for (const [dx, dz] of [[-1.9, -1.6], [1.9, -1.6], [-1.9, 1.6], [1.9, 1.6]] as const) {
        const zz = z + dz;
        b.beam([x, trunk, z], [x + dx, roofY(zz) + 0.05, zz], 0.12, 0.12, steel);
      }
      b.collider(0.5, 0.5, { at: [x, 0, z] });
    }
    // slender props on the far side beyond the tracks
    for (let x = CX0 + 1; x <= CX1; x += 7.84) {
      b.cyl(0.13, roofY(CZ1 + 0.2), steel, { at: [x, 0, CZ1 + 0.25], segs: 6 });
    }
  },
};
