import { P, mix, tint, type BuildingDef } from '@ah/kit';
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

/** Height of the underside of the canopy at z. */
function roofY(z: number): number {
  const t = (z - CZ1) / (CZ0 - CZ1); // 0 at the track side, 1 at the street side
  return CY - 0.6 + RISE * Math.sin(Math.PI * t) + 0.6 * t;
}

export const gareTgv: BuildingDef = {
  id: 'gare-tgv',
  name: 'High-speed station',
  style: 'Contemporary',
  date: '2007',
  summary:
    'The high-speed line from Paris to the east (LGV Est) opened in June 2007 and put the cities of Champagne and Lorraine within an hour or two of the capital. Some towns were served at their old stations; others were given new ones, often outside the centre, where TGVs, buses, cars and the line into town could meet. ' +
    'The new station is hardly a building at all: a long canopy of steel and glass on branching columns shelters the platforms, and the hall beneath it is a glass box of ticket machines, a café and seats, open to the light. ' +
    'Glass printed with a pattern of white dots shades the platforms from the sun, and the wires overhead carry 25,000 volts to the train.',
  materials: ['steel', 'fritted glass', 'concrete', 'timber soffit', 'granite paving'],
  modelledOn: 'Champagne-Ardenne TGV at Bezannes, outside Reims (AREP for SNCF, opened 2007), and the other new stations of the LGV Est, in general terms; the canopy here is generic',
  lookFor: [
    { label: 'Long glass canopy', note: 'One continuous roof of steel and glass over the hall, the platform and both tracks.', at: [10.0, CY + 1.6, -5.0] },
    { label: 'Branching columns', note: 'Steel columns that divide into struts like the branches of a tree, so that few supports carry a wide roof.', at: [-12.0, 5.0, -4.6] },
    { label: 'Glass hall', note: 'The hall is a transparent box: you can see the trains from the forecourt.', at: [0.5, 3.0, BZ1 + 0.3] },
    { label: 'TGV', note: 'The high-speed train, with a power car at each end and coaches carried on shared bogies, built for 320 km/h on the new line.', at: [-15.0, 4.6, TRACKS[0] + 1.6] },
    { label: 'Overhead line', note: 'Masts and wires carry 25 kV alternating current to the pantograph on the train’s roof.', at: [6.0, 7.0, -11.9] },
  ],
  build(b) {
    const steel = mix(P.white, P.steel, 0.3);
    const glass = mix(P.glass, P.white, 0.3);
    const frit = mix(P.white, P.glass, 0.35);
    const soffit = mix(P.larch, P.pine, 0.5);

    // forecourt of granite paving, a strip of planting, bollards, young trees
    forecourt(b, mix(P.paving, P.granite, 0.4));
    b.box(30, 0.3, 1.6, P.grass, { at: [0, 0, 10.6], jitter: false });
    for (const x of [-13, -6, 6, 13]) b.tree(4.6, { kind: 'round', at: [x, 0, 10.3], color: mix(P.leaf, P.leafDark, 0.3) });
    for (let x = -17; x <= 17; x += 2.0) if (Math.abs(x) > 3) b.cyl(0.1, 0.8, P.cladGrey, { at: [x, 0, 9.4], segs: 6 });

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
