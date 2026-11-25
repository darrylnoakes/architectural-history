import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, catenary, highSpeedTrain, platform, quad, soup, track } from './shared';

const X0 = -19.2;
const X1 = 19.2;
const ZC = 0.5; // centre of the vault’s span
const A = 6.0; // half-span (z): the track-side arches land on the platform 1.5 m back from its edge
const VH = 10.5; // height of the crown
const N = 12; // facets round the profile
const RIB = 2.4; // spacing of the steel arches

/** Point on the vault profile at parameter i (0 = street side foot, N = track side foot). */
function prof(i: number): [number, number] {
  const t = (i / N) * Math.PI;
  // a slightly pointed, asymmetric curve: fuller on the track side, as at Porta Susa
  const z = ZC + A * Math.cos(t);
  const y = VH * Math.pow(Math.sin(t), 0.85) * (1 + 0.08 * Math.cos(t + 0.6));
  return [z, PLAT.y + y]; // the arches stand on the concourse floor, which is level with the platform
}

export const highSpeedStation: BuildingDef = {
  id: 'high-speed-station',
  name: 'High-speed station',
  style: 'Contemporary',
  date: '2013',
  summary:
    'The high-speed lines opened between 2005 and 2009 cut the journey from Turin or Milan to Rome to a few hours, and the cities answered with new stations. ' +
    'Here the whole station is one long gallery of glass on a row of steel arches, a covered street that people cross freely between the town and the trains, with ticket offices and cafés standing inside it like pavilions. Its floor is raised to the 55 cm of the platform, the standard height on the Italian network, so from the steps at the street there is no other change of level before the train. ' +
    'Part of the glazing carries photovoltaic cells, so the roof makes some of its own electricity. Where the 1930s station was a solid mass with a window of glass, now the glass is the building.',
  materials: ['steel arches', 'laminated glass', 'photovoltaic glass', 'stone and concrete paving'],
  modelledOn: 'Torino Porta Susa (AREP with Silvio d’Ascia and Agostino Magnaghi, opened 2013), much reduced',
  lookFor: [
    { label: 'Glass gallery', note: 'A single long vault of glass over the concourse, open along its length like a covered street.', at: [-12, VH + 0.6, ZC] },
    { label: 'Steel arches', note: 'A row of identical curved steel ribs, repeated every few metres, carries the glazing.', at: [X1 + 0.3, 6.6, 5.6] },
    { label: 'Photovoltaic glazing', note: 'Darker panels in the upper part of the vault hold solar cells that generate electricity.', at: [6, VH - 0.8, ZC - 2.2] },
    { label: 'Pavilions inside', note: 'Ticket office and shops are freestanding boxes inside the gallery, so the space flows round them.', at: [-6, 3.9, 1.2] },
    { label: 'High-speed train', note: 'A streamlined electric train for speeds of up to 300 km/h, its pointed nose shaped to cut air resistance.', at: [-17.5, 4.2, TRACKS[0] + 1.6] },
  ],
  build(b) {
    const steel = mix(P.white, P.steel, 0.25);
    const glass = mix(P.glass, P.white, 0.15);
    const G = { mat: 'glass' as const };

    // ---------------------------------------------------------------- the forecourt, and the concourse at platform level
    b.box(HX * 2, 0.06, 24, mix(P.paving, P.travertine, 0.3), { at: [0, 0, 0], jitter: false });
    // the platform the earlier stations stood beside, re-laid, and the concourse floor raised level
    // with it, so people walk from the street steps to the train doors without another step
    const PY = PLAT.y;
    const zFront = ZC + A + 0.4; // the street edge of the concourse floor
    platform(b, PLAT.back, PLAT.edge, -HX, HX, { top: mix(P.pietraSerena, P.paving, 0.4), edge: P.cladYellow });
    const cd = zFront - PLAT.back;
    const cz = (zFront + PLAT.back) / 2;
    b.box(X1 - X0, PY - 0.1, cd, tint(P.concrete, -0.05), { at: [0, 0, cz] });
    b.box(X1 - X0, 0.1, cd, mix(P.pietraSerena, P.paving, 0.5), { at: [0, PY - 0.1, cz], jitter: false });
    b.deck(X1 - X0, cd, PY, { at: [0, 0, cz] });
    // three broad steps up from the forecourt, and a ramp at the east end for wheelchairs and luggage
    const RAMP = 7.0; // 0.55 m over 7 m: a gradient of about 1 in 13
    b.stairs(X1 - X0 - RAMP - 0.4, PY, 1.2, 3, P.pietraSerena, { at: [X0 + (X1 - X0 - RAMP - 0.4) / 2, 0, zFront + 0.6] });
    b.group({ at: [X1 - RAMP / 2, 0, zFront + 0.6] }, () => {
      b.extrude([[-RAMP / 2, 0], [RAMP / 2, 0], [RAMP / 2, 0.06], [-RAMP / 2, PY]], 1.2, mix(P.pietraSerena, P.paving, 0.5), { at: [0, 0, -0.6], jitter: false });
      b.box(RAMP, 0.9, 0.05, glass, { at: [0, PY, 0.58], mat: 'glass', jitter: false });
    });

    // ---------------------------------------------------------------- the vault: glazing, PV bands, arches
    const clear: number[] = [];
    const pv: number[] = [];
    for (let i = 0; i < N; i++) {
      const [z0, y0] = prof(i);
      const [z1, y1] = prof(i + 1);
      // the upper facets on the sunny (street, south) side carry the photovoltaic glass
      const target = i >= 3 && i <= 7 ? pv : clear;
      quad(target, [X0, y0, z0], [X1, y0, z0], [X1, y1, z1], [X0, y1, z1]);
    }
    soup(b, clear, glass, G);
    soup(b, pv, mix(P.solar, P.glassDark, 0.4), G);
    // glazed ends: fans closing the vault
    for (const x of [X0, X1]) {
      const end: number[] = [];
      for (let i = 0; i < N; i++) {
        const [z0, y0] = prof(i);
        const [z1, y1] = prof(i + 1);
        end.push(x, PLAT.y, ZC, x, y0, z0, x, y1, z1);
      }
      soup(b, end, glass, G);
    }
    // the steel arches, and purlins along the length
    for (let x = X0; x <= X1 + 0.01; x += RIB) {
      for (let i = 0; i < N; i++) {
        const [z0, y0] = prof(i);
        const [z1, y1] = prof(i + 1);
        b.beam([x, y0, z0], [x, y1, z1], 0.18, 0.4, steel);
      }
    }
    for (let i = 1; i < N; i += 2) {
      const [z, y] = prof(i);
      b.box(X1 - X0, 0.12, 0.12, steel, { at: [0, y - 0.06, z], jitter: false });
    }
    // feet of the arches in concrete
    for (let x = X0; x <= X1 + 0.01; x += RIB) for (const i of [0, N]) {
      const [z] = prof(i);
      b.box(0.5, 0.5, 0.6, P.concrete, { at: [x, PLAT.y, z] });
    }

    // ---------------------------------------------------------------- inside: pavilions and a mezzanine
    b.group({ at: [-6, PY, 1.2] }, () => {
      b.box(6, 3.2, 3.2, P.cladWhite);
      b.box(5.4, 2.0, 0.05, P.glassDark, { at: [0, 0.4, 1.61], mat: 'glass' });
      b.box(4.0, 0.4, 0.06, P.cladRed, { at: [0, 2.6, 1.62] });
    });
    b.group({ at: [7, PY, 1.6] }, () => {
      b.box(5, 3.0, 3.0, mix(P.cladGrey, P.white, 0.5));
      b.box(4.4, 2.0, 0.05, P.windowLit, { at: [0, 0.4, 1.51] });
    });
    // a mezzanine bridge with glass balustrades along the track side
    b.box(X1 - X0 - 3, 0.35, 2.2, P.concreteWhite, { at: [0, 4.6, -3.6] });
    b.box(X1 - X0 - 3, 1.1, 0.04, glass, { at: [0, 4.95, -2.5], ...G });
    for (const x of [-14, -7, 0, 7, 14]) b.cyl(0.15, 4.6 - PY, steel, { at: [x, PY, -3.6], segs: 6 });
    b.beam([12, PY, -1.6], [16.4, 4.6, -1.6], 1.1, 0.4, P.steel); // escalator up to it
    // seats and the departures board
    b.box(3, 0.45, 0.6, P.steel, { at: [-14, PY, 2.2] });
    b.box(3.4, 1.4, 0.2, P.black, { at: [0, PY + 2.4, 3.8] });
    b.box(3.0, 1.0, 0.03, P.windowLit, { at: [0, PY + 2.6, 3.92] });
    b.cyl(0.08, 2.4, P.steel, { at: [0, PY, 3.8], segs: 5 });

    // ---------------------------------------------------------------- platform, tracks, train
    for (const z of TRACKS) track(b, z, -HX, HX, { sleeper: P.concrete });
    // a light steel canopy over the platform edge, cantilevered from the arches
    {
      const [zr, yr] = prof(N - 1);
      b.box(X1 - X0, 0.12, zr - (PLAT.edge - 0.4), steel, { at: [0, yr, (zr + PLAT.edge - 0.4) / 2] });
    }
    highSpeedTrain(b, [-19.5, 0, TRACKS[0]], 39);
    catenary(b, TRACKS[0], [-18, -6, 6, 18], -11.7, 6.4);

    // ---------------------------------------------------------------- around it
    for (const x of [-14, -4, 6, 16]) b.box(0.15, 0.9, 0.15, P.steel, { at: [x, 0, 9.5] });
    b.box(30, 0.08, 0.3, P.cladYellow, { at: [0, 0.06, 10.6], jitter: false }); // a cycle lane edge
    b.tree(6, { kind: 'round', at: [-16.5, 0, 9.8] });
    b.tree(6, { kind: 'round', at: [16.5, 0, 9.8] });

    // ---------------------------------------------------------------- walking: the gallery is open
    b.collider(6, 3.2, { at: [-6, PY, 1.2] });
    b.collider(5, 3.0, { at: [7, PY, 1.6] });
    b.collider(39, 3.0, { at: [0, 0, TRACKS[0]] });
  },
};
