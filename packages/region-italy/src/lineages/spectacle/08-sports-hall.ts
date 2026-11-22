import * as THREE from 'three';
import { P, tint, type Builder, type BuildingDef } from '@ah/kit';

const R = 13; // radius of the dome edge
const NT = 36; // Y-shaped trestles
const Y_EDGE = 3.7;
const CROWN = 10.2;
const LANTERN_R = 2.4;
const BELT_R = 12.2;

/** Height of the dome's upper surface at radius r and angle a (the edge waves up between the trestles). */
function domeY(r: number, a: number): number {
  const u = Math.min(1, r / R);
  const wave = 0.55 * (1 - Math.cos(NT * a)) * 0.5 * Math.pow(u, 6);
  return Y_EDGE + (CROWN - Y_EDGE) * Math.pow(1 - u * u, 0.75) + wave;
}

function addTris(b: Builder, t: number[], color: number): void {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(t), 3));
  g.computeVertexNormals();
  b.add(g, color);
}

export const sportsHall: BuildingDef = {
  id: 'sports-hall',
  name: 'Sports hall',
  style: 'Post-war structural engineering (ferro-cement)',
  date: '1957',
  summary:
    'Rome was given the 1960 Olympic Games, and the city and the Olympic committee built new halls for them; towns across Italy followed with their own for basketball, boxing and volleyball. ' +
    'Here the whole building is its structure: a shallow concrete dome, its underside a web of interlacing ribs, rests on a ring of Y-shaped struts leaning outward along the line of the thrust. ' +
    'The dome was assembled from hundreds of small prefabricated pieces of ferro-cement, thin concrete reinforced with fine steel mesh, cast on the ground and joined with poured concrete, which made it quick and cheap. ' +
    'A band of glass between the struts lets the dome seem to float.',
  materials: ['ferro-cement precast units', 'reinforced concrete', 'glass curtain wall'],
  modelledOn:
    'Palazzetto dello Sport, Rome, by Annibale Vitellozzi with Pier Luigi Nervi (1956-57), about 60 m across, here at about half the size',
  influences: ['nervi-export'],
  lookFor: [
    {
      label: 'Y-shaped struts',
      note: 'Thirty-six inclined forks carry the edge of the dome. They lean out at the angle of the dome’s thrust, so they work almost purely in compression.',
      at: [0, 2.0, 15.4],
    },
    {
      label: 'Scalloped edge',
      note: 'Between the struts the rim of the dome lifts in a wave, stiffening the thin edge and showing where the loads gather.',
      at: [-9.2, 4.8, 9.2],
    },
    {
      label: 'Ribbed underside',
      note: 'Inside, the ceiling is a lattice of curving ribs that cross and recross, formed by the precast pieces. Step inside to see it.',
      at: [0, 7.2, 3.0],
    },
    {
      label: 'Glazed belt',
      note: 'A continuous wall of glass under the rim, set back behind the struts.',
      at: [8.6, 1.8, 8.6],
    },
    {
      label: 'Lantern',
      note: 'A raised ring of glass at the crown lets daylight down into the middle of the hall.',
      at: [0, CROWN + 1.6, 0],
    },
  ],
  build(b) {
    const conc = tint(P.concreteWhite, b.range(-0.03, 0.01));
    const concShade = tint(conc, -0.1);
    const step = (Math.PI * 2) / NT;

    // ------------------------------------------------ the dome: upper surface, rim fascia, ribbed underside
    const NA = NT * 2;
    const rings = [R + 0.35, R, 12.0, 10.6, 8.8, 6.8, 4.8, LANTERN_R];
    const top: number[] = [];
    for (let i = 0; i < NA; i++) {
      const a0 = (i / NA) * Math.PI * 2;
      const a1 = ((i + 1) / NA) * Math.PI * 2;
      for (let j = 0; j < rings.length - 1; j++) {
        const ra = rings[j];
        const rb = rings[j + 1];
        const p = (r: number, a: number) => [r * Math.sin(a), domeY(r, a), r * Math.cos(a)];
        const A = p(ra, a0);
        const B = p(ra, a1);
        const C = p(rb, a1);
        const D = p(rb, a0);
        top.push(...A, ...B, ...C, ...A, ...C, ...D);
      }
    }
    addTris(b, top, conc);
    const rim: number[] = [];
    const under: number[] = [];
    for (let i = 0; i < NA; i++) {
      const a0 = (i / NA) * Math.PI * 2;
      const a1 = ((i + 1) / NA) * Math.PI * 2;
      const re = R + 0.35;
      const y0 = domeY(re, a0);
      const y1 = domeY(re, a1);
      const p = (r: number, a: number, y: number) => [r * Math.sin(a), y, r * Math.cos(a)];
      rim.push(...p(re, a0, y0), ...p(re, a1, y1), ...p(re, a1, y1 - 0.45), ...p(re, a0, y0), ...p(re, a1, y1 - 0.45), ...p(re, a0, y0 - 0.45));
      // underside of the overhanging rim, back to the glass
      under.push(...p(re, a0, y0 - 0.45), ...p(re, a1, y1 - 0.45), ...p(BELT_R, a1, Y_EDGE - 0.3), ...p(re, a0, y0 - 0.45), ...p(BELT_R, a1, Y_EDGE - 0.3), ...p(BELT_R, a0, Y_EDGE - 0.3));
    }
    addTris(b, rim, concShade);
    addTris(b, under, concShade);
    // the interlacing ribs inside, two families of curves crossing between the rim and the lantern
    const ribR = [BELT_R, 10.0, 7.6, 5.2, LANTERN_R + 0.2];
    for (let k = 0; k < NT; k++) {
      for (const dir of [1, -1]) {
        for (let j = 0; j < ribR.length - 1; j++) {
          const pt = (r: number): [number, number, number] => {
            const a = k * step + dir * (1 - r / BELT_R) * 0.9;
            return [r * Math.sin(a), domeY(r, 0) - 0.55 - (r > 11 ? 0.2 : 0), r * Math.cos(a)];
          };
          b.beam(pt(ribR[j]), pt(ribR[j + 1]), 0.22, 0.4, concShade, { jitter: false });
        }
      }
    }
    // the lantern at the crown
    const yl = domeY(LANTERN_R, 0);
    b.cyl(LANTERN_R, 1.1, P.glassDark, { at: [0, yl, 0], segs: 18, mat: 'glass' });
    b.cyl(LANTERN_R + 0.25, 0.3, conc, { at: [0, yl + 1.1, 0], segs: 18 });
    b.dome(LANTERN_R, conc, { at: [0, yl + 1.4, 0], squash: 0.25, segs: 18 });

    // ------------------------------------------------ the Y-shaped trestles
    for (let k = 0; k < NT; k++) {
      const a = k * step;
      const s = Math.sin(a);
      const c = Math.cos(a);
      const P3 = (r: number, y: number, da = 0): [number, number, number] => [r * Math.sin(a + da), y, r * Math.cos(a + da)];
      const foot = P3(16.4, 0);
      const fork = P3(14.6, 2.3);
      b.beam(foot, fork, 0.75, 0.6, conc);
      for (const d of [-1, 1]) b.beam(fork, P3(R + 0.1, domeY(R + 0.1, a + d * step * 0.32) - 0.35, d * step * 0.32), 0.45, 0.45, conc);
      b.box(1.4, 0.4, 1.4, concShade, { at: [foot[0] + s * 0.2, 0, foot[2] + c * 0.2], rotY: a });
    }

    // ------------------------------------------------ the glazed belt, with entrance doors on the axes
    b.cyl(BELT_R, Y_EDGE - 0.3, P.glassDark, { segs: NT, mat: 'glass' });
    for (let k = 0; k < NT; k++) {
      const a = (k + 0.5) * step;
      b.box(0.14, Y_EDGE - 0.3, 0.2, P.aluminium, { at: [BELT_R * Math.sin(a), 0, BELT_R * Math.cos(a)], rotY: a });
    }
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const r = BELT_R + 0.02;
      b.panel(2.6, 2.3, P.aluminium, { at: [r * Math.sin(a), 0, r * Math.cos(a)], facing: a, depth: 0.08 });
      b.panel(2.3, 2.1, tint(P.glassDark, -0.1), { at: [r * Math.sin(a), 0, r * Math.cos(a)], facing: a, depth: 0.12 });
    }
    b.cyl(17.2, 0.12, tint(P.paving, 0.02), { segs: NT });

    // ------------------------------------------------ inside: the court and the ring of seats
    b.box(14, 0.06, 8, tint(P.pine, -0.02), { at: [0, 0.12, 0] });
    b.box(13.2, 0.02, 0.08, P.white, { at: [0, 0.18, 3.6] });
    b.box(13.2, 0.02, 0.08, P.white, { at: [0, 0.18, -3.6] });
    const seats: [number, number][] = [[8.6, 0.1]];
    for (let i = 0; i < 6; i++) seats.push([8.6 + i * 0.55, 0.1 + (i + 1) * 0.42], [8.6 + (i + 1) * 0.55, 0.1 + (i + 1) * 0.42]);
    seats.push([BELT_R - 0.3, 0.1 + 6 * 0.42], [BELT_R - 0.3, 0.1]);
    b.lathe(seats, tint(P.cladBlue, 0.1), { segs: NT });

    // umbrella pines round the hall
    b.tree(10, { at: [-17.5, 0, 15.5], kind: 'pine' });
    b.tree(9, { at: [17.0, 0, -15.0], kind: 'pine' });

    // ------------------------------------------------ walk collisions: the glass ring (doors open), the trestle feet
    for (let k = 0; k < NT; k++) {
      const a = (k + 0.5) * step;
      const nearDoor = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].some((d) => Math.abs(((a - d + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < step * 0.6);
      if (!nearDoor) b.collider(2 * BELT_R * Math.sin(step / 2) + 0.1, 0.4, { at: [BELT_R * Math.sin(a), 0, BELT_R * Math.cos(a)], rotY: a });
      const fa = k * step;
      b.collider(1.0, 1.0, { at: [16.2 * Math.sin(fa), 0, 16.2 * Math.cos(fa)], rotY: fa });
    }
    b.collider(1.0, 1.0, { at: [-17.5, 0, 15.5] });
    b.collider(1.0, 1.0, { at: [17.0, 0, -15.0] });
  },
};
