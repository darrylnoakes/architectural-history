import * as THREE from 'three';
import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

const C: [number, number] = [0, 7]; // centre of the open-air cavea
const CAVEA_R = 7.4;

interface Hall {
  /** Direction from the cavea, radians from +Z. */
  dir: number;
  dist: number;
  /** Length (radial) and width of the hall, height of its shell above the walls. */
  L: number;
  W: number;
  H: number;
}

const HALLS: Hall[] = [
  { dir: Math.PI, dist: 16.9, L: 16, W: 12.5, H: 8.5 },
  { dir: Math.PI * 1.37, dist: 15.0, L: 13.5, W: 10, H: 7.0 },
  { dir: Math.PI * 0.63, dist: 14.0, L: 11.5, W: 8.5, H: 6.0 },
];

const WALL_H = 4.0;

function addTris(b: Builder, t: number[], color: number, mat?: 'glass'): void {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(t), 3));
  g.computeVertexNormals();
  b.add(g, color, { mat });
}

/**
 * One concert hall: an oval drum of brick under a beetle-backed shell of lead, built in local
 * coordinates with the hall's long axis on +Z (u = -1 is the end facing the cavea).
 */
function hall(b: Builder, h: Hall, lead: number, brick: number): void {
  const at: [number, number, number] = [C[0] + h.dist * Math.sin(h.dir), 0, C[1] + h.dist * Math.cos(h.dir)];
  b.group({ at, rotY: h.dir }, () => {
    // the brick drum
    b.group({ scale: [h.W / 2, 1, h.L / 2] }, () => b.lathe([[1, 0], [1, WALL_H]], brick, { segs: 24 }));
    // a glazed entrance on the end toward the cavea
    b.panel(3.6, 2.8, P.glassDark, { at: [0, 0, -h.L / 2 + 0.02], facing: '-z', mat: 'glass' });
    b.panel(4.0, 0.3, P.aluminium, { at: [0, 2.8, -h.L / 2 + 0.02], facing: '-z', depth: 0.1 });

    // the shell: four overlapping plates of lead, each rising to its back edge, with glazed strips at the seams
    const ov = 1.08;
    const halfL = (h.L / 2) * ov;
    const halfW = (h.W / 2) * ov;
    const Y0 = WALL_H - 0.2;
    const plates = 4;
    const nu = 4;
    const nv = 10;
    const height = (u: number, v: number, lift: number) => {
      const along = Math.sqrt(Math.max(0, 1 - u * u));
      const rise = 0.55 + 0.45 * ((u + 1) / 2);
      return Y0 + (h.H * Math.pow(along, 0.45) * rise + lift) * Math.pow(Math.max(0, 1 - v * v), 0.6);
    };
    const pt = (u: number, v: number, lift: number) => {
      const hw = halfW * Math.sqrt(Math.max(0, 1 - u * u));
      return [v * hw, height(u, v, lift), u * halfL];
    };
    const shell: number[] = [];
    const seams: number[] = [];
    for (let k = 0; k < plates; k++) {
      const u0 = -1 + (2 * k) / plates;
      const u1 = -1 + (2 * (k + 1)) / plates;
      const liftAt = (u: number) => (k < plates - 1 ? 0.9 * ((u - u0) / (u1 - u0)) : 0);
      for (let i = 0; i < nu; i++) {
        const ua = u0 + ((u1 - u0) * i) / nu;
        const ub = u0 + ((u1 - u0) * (i + 1)) / nu;
        for (let j = 0; j < nv; j++) {
          const va = -1 + (2 * j) / nv;
          const vb = -1 + (2 * (j + 1)) / nv;
          const A = pt(ua, va, liftAt(ua));
          const B = pt(ub, va, liftAt(ub));
          const Cc = pt(ub, vb, liftAt(ub));
          const D = pt(ua, vb, liftAt(ua));
          shell.push(...A, ...B, ...Cc, ...A, ...Cc, ...D);
        }
      }
      if (k < plates - 1) {
        // the riser between this plate's raised back edge and the next plate, glazed
        for (let j = 0; j < nv; j++) {
          const va = -1 + (2 * j) / nv;
          const vb = -1 + (2 * (j + 1)) / nv;
          const A = pt(u1, va, 0.9);
          const B = pt(u1, vb, 0.9);
          const Cc = pt(u1, vb, 0);
          const D = pt(u1, va, 0);
          seams.push(...A, ...B, ...Cc, ...A, ...Cc, ...D);
        }
      }
    }
    addTris(b, shell, lead);
    addTris(b, seams, P.glassDark, 'glass');
    // the shell's edge, a thin band of lead over the brick
    b.group({ scale: [halfW, 1, halfL] }, () => b.lathe([[1, Y0 - 0.25], [1, Y0 + 0.02]], tint(lead, -0.1), { segs: 24 }));
  });
}

export const auditorium: BuildingDef = {
  id: 'auditorium',
  name: 'Concert halls',
  style: 'Contemporary',
  date: '2002',
  summary:
    'At the end of the century the town finally built proper halls for music, on open ground outside the old centre. ' +
    'Instead of one big building there are three separate halls of different sizes, each shaped round its own acoustics and lined inside with cherry wood, set round an open-air theatre like the cavea of a Roman one. ' +
    'Their roofs are curved shells clad in sheets of lead, stepped like the wing-cases of beetles, over walls of Roman-style brick, with gardens and umbrella pines between. ' +
    'After the cinema and the sports hall, the plot is once more a place for a crowd to sit in a ring.',
  materials: ['lead sheet over timber and steel shells', 'thin Roman-style brick', 'travertine', 'glass', 'cherry wood inside'],
  modelledOn:
    'Auditorium Parco della Musica, Rome, by Renzo Piano Building Workshop (1994-2002), much reduced',
  influences: ['star-architects'],
  lookFor: [
    {
      label: 'Lead-clad shells',
      note: 'Each hall is roofed by a curving shell of lead sheet. Seen together they look like three great beetles, or lutes, round the cavea.',
      at: [0, 13.6, -9.5],
    },
    {
      label: 'Glazed seams',
      note: 'The shell is built as overlapping plates; the strips of glass between them let a little daylight into the roof space.',
      at: [0, 12.2, -11.0],
    },
    {
      label: 'Open-air cavea',
      note: 'An outdoor theatre in the middle, its tiers facing a stage: the Roman amphitheatre of the second stage come round again.',
      at: [0, 1.8, 2.2],
    },
    {
      label: 'Brick drums',
      note: 'The halls stand on walls of thin red brick, a nod to the brick of ancient Rome.',
      at: [-11.8, 2.0, 5.0],
    },
    {
      label: 'Foyer with roof garden',
      note: 'A low, glazed foyer links the halls behind the cavea, its roof planted as a garden.',
      at: [-7.0, 3.6, 7.0],
    },
  ],
  build(b) {
    const lead = tint(P.lead, b.range(-0.04, 0.01));
    const brick = tint(mix(P.brickOrange, P.brickBuff, 0.25), b.range(-0.03, 0.02));
    const trav = tint(P.travertine, -0.02);

    // a travertine square under it all
    b.box(40, 0.08, 36, tint(P.paving, 0.03), { at: [0, 0, 0] });

    // ------------------------------------------------ the cavea: brick-edged tiers facing a stage
    const tiers: [number, number][] = [[3.2, 0.1]];
    for (let i = 0; i < 8; i++) tiers.push([3.2 + i * 0.52, 0.1 + (i + 1) * 0.38], [3.2 + (i + 1) * 0.52, 0.1 + (i + 1) * 0.38]);
    tiers.push([CAVEA_R + 0.3, 0.1 + 8 * 0.38], [CAVEA_R + 0.3, 0]);
    b.lathe(tiers, trav, { at: [C[0], 0, C[1]], start: Math.PI / 2, sweep: Math.PI, segs: 16 });
    b.lathe([[0, 0.12], [3.2, 0.12]], tint(P.cedar, 0.05), { at: [C[0], 0, C[1]], start: Math.PI / 2, sweep: Math.PI, segs: 12 });
    b.box(9, 0.9, 4.2, tint(P.cedar, -0.05), { at: [C[0], 0, C[1] + 2.4] }); // the stage
    b.box(9.2, 0.1, 4.4, P.steel, { at: [C[0], 0.9, C[1] + 2.4] });

    // ------------------------------------------------ the foyer ring behind the cavea, with its roof garden
    const fr0 = CAVEA_R + 0.3;
    const fr1 = CAVEA_R + 2.2;
    b.lathe([[fr0, 0], [fr0, 3.2]], P.glassDark, { at: [C[0], 0, C[1]], start: Math.PI / 2, sweep: Math.PI, segs: 16, mat: 'glass' });
    b.lathe([[fr1, 0], [fr1, 3.2]], brick, { at: [C[0], 0, C[1]], start: Math.PI / 2, sweep: Math.PI, segs: 16 });
    b.lathe([[fr0 - 0.3, 3.2], [fr1 + 0.2, 3.2], [fr1 + 0.2, 3.5], [fr0 - 0.3, 3.5], [fr0 - 0.3, 3.2]], P.concreteWhite, {
      at: [C[0], 0, C[1]],
      start: Math.PI / 2,
      sweep: Math.PI,
      segs: 16,
    });
    b.lathe([[fr0, 3.5], [fr1, 3.5]], P.grass, { at: [C[0], 0.03, C[1]], start: Math.PI / 2, sweep: Math.PI, segs: 16 });
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + ((i + 0.5) / 7) * Math.PI;
      const r = (fr0 + fr1) / 2;
      b.tree(b.range(1.0, 1.6), { at: [C[0] + r * Math.sin(a), 3.5, C[1] + r * Math.cos(a)], kind: 'bush', color: P.hedge });
    }

    // ------------------------------------------------ the three halls
    for (const h of HALLS) hall(b, h, lead, brick);

    // umbrella pines of the park
    for (const [x, z, s] of [[-15.5, 14.5, 8], [15.5, 14.0, 7.5], [-17, -14.5, 7], [16.2, -14.0, 8]]) b.tree(s, { at: [x, 0, z], kind: 'pine' });

    // ------------------------------------------------ walk collisions: the halls and the foyer ring
    for (const h of HALLS) {
      b.collider(h.W * 0.9, h.L * 0.92, { at: [C[0] + h.dist * Math.sin(h.dir), 0, C[1] + h.dist * Math.cos(h.dir)], rotY: h.dir });
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + ((i + 0.5) / 8) * Math.PI;
      const r = (fr0 + fr1) / 2;
      b.collider(2 * r * Math.sin(Math.PI / 16) + 0.4, fr1 - fr0, { at: [C[0] + r * Math.sin(a), 0, C[1] + r * Math.cos(a)], rotY: a });
    }
    b.collider(9, 4.2, { at: [C[0], 0, C[1] + 2.4] });
  },
};
