import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { paving, sack } from './shared';

const STONE = P.pierreBlonde;
const N = 20; // bays round the outside
const NI = 10; // bays round the court
const RO = 10.3; // outer face (apothem of the 20-sided ring)
const RI = 4.7; // court face
const RM = 7.5; // ring of columns down the middle of the vaulted walk
const H1 = 6.0; // ground floor
const H2 = 3.4; // granary floor
const T = 0.8; // wall thickness

/** A ring band (string course, cornice, plinth) following the polygon of n sides whose apothem is r. */
function band(b: Builder, r: number, n: number, y: number, h: number, proj: number, color: number): void {
  const k = 1 / Math.cos(Math.PI / n);
  b.lathe(
    [
      [(r - 0.05) * k, 0],
      [(r + proj) * k, 0],
      [(r + proj) * k, h],
      [(r - 0.05) * k, h],
    ],
    color,
    { at: [0, y, 0], segs: n },
  );
}

/** Run fn once per bay of an n-sided ring, in a frame whose origin is the middle of the bay's face at apothem r, local +Z facing out. */
function ring(b: Builder, n: number, r: number, fn: (i: number) => void, inward = false): void {
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    b.group({ at: [Math.sin(a) * r, 0, Math.cos(a) * r], rotY: inward ? a + Math.PI : a }, () => fn(i));
  }
}

export const grainHall: BuildingDef = {
  id: 'grain-hall',
  name: 'Round grain hall (halle au blé)',
  style: 'Neoclassical',
  date: 'c. 1785',
  summary:
    'Grain is the one thing the town cannot run short of, and the authorities now want it traded where they can watch it, kept dry and safe from fire. ' +
    'The answer, first built in Paris by Nicolas Le Camus de Mézières in 1763 to 1767, is a ring: a round building of cut stone with a vaulted walk behind open arcades on the ground floor, granaries above, and an open court in the middle for carts. ' +
    'It is a new kind of public building, plain, geometrical and practical, and the Paris hall was admired all over Europe. This one is much smaller; in Paris the court was later roofed with a timber dome (1782 to 1783), then one of iron and glass (1811 to 1813), and the building survives today as the Bourse de Commerce.',
  materials: ['cut limestone', 'slate', 'oak floors in the granary'],
  lookFor: [
    { label: 'Ring of arcades', note: 'Twenty round-headed arches all round the outside, open so that carts and buyers can come and go from every street.', at: [0, 5.4, 10.6] },
    { label: 'Open court', note: 'The middle is left open for carts to unload; arches all round it lead into the covered walk.', at: [0, 1.0, 0] },
    { label: 'Tuscan columns', note: 'A ring of plain Tuscan columns down the middle of the walk carries the floor of the granary.', at: [5.2, 3.0, 5.2] },
    { label: 'Granary floor', note: 'Grain was stored dry on the upper floor, lit and aired by a window in every bay.', at: [-7.4, 7.6, 7.4] },
  ],
  modelledOn: 'The Halle au Blé, Paris (Nicolas Le Camus de Mézières, 1763 to 1767), reduced to a third of its size and without the Médicis column that stood against it; the round type was copied in the provinces, as at Alençon (1806 to 1812)',
  influences: ['neoclassicism'],
  build(b) {
    paving(b, 25.6, 21.6, P.cobble, 0.06, [0, 0, 0], 10);
    b.cyl(RO + 0.5, 0.12, tint(STONE, -0.06), { segs: N, at: [0, 0.06, 0] });
    b.cyl(RI - 0.3, 0.02, P.cobble, { segs: NI, at: [0, 0.18, 0], jitter: false });
    const y0 = 0.18;

    // ---- the ground floor: arcades outside and round the court, columns down the middle of the walk
    const sideO = 2 * RO * Math.tan(Math.PI / N);
    const sideI = 2 * RI * Math.tan(Math.PI / NI);
    ring(b, N, RO - T / 2, () => {
      b.archWall(sideO + 0.02, H1 - y0, T, STONE, { at: [0, y0, 0], openings: 1, openW: 2.0, openH: 4.6, shape: 'round' });
      for (const sx of [-1, 1]) b.box(0.6, 0.3, T + 0.1, tint(STONE, -0.04), { at: [sx * (1.0 + sideO / 4 - 0.5 + 0.02), y0 + 3.45, 0] }); // imposts
      b.panel(0.5, 0.75, tint(STONE, 0.04), { at: [0, y0 + 3.85, T / 2], depth: 0.08 }); // keystone
    });
    ring(b, NI, RI + T / 2, () => {
      b.archWall(sideI + 0.02, H1 - y0, T, STONE, { at: [0, y0, 0], openings: 1, openW: 1.8, openH: 4.3, shape: 'round' });
      b.panel(0.45, 0.7, tint(STONE, 0.04), { at: [0, y0 + 3.6, T / 2], depth: 0.08 });
    }, true);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      b.collider(1.0, 1.0, { at: [Math.sin(a) * (RO - 0.45), 0, Math.cos(a) * (RO - 0.45)], rotY: a });
      b.column(0.27, H1 - y0 - 0.1, STONE, { at: [Math.sin(a) * RM, y0, Math.cos(a) * RM], order: 'tuscan', segs: 6 });
      b.collider(0.6, 0.6, { at: [Math.sin(a) * RM, 0, Math.cos(a) * RM] });
    }
    for (let i = 0; i < NI; i++) {
      const a = (i / NI) * Math.PI * 2;
      b.collider(1.0, 1.0, { at: [Math.sin(a) * (RI + 0.45), 0, Math.cos(a) * (RI + 0.45)], rotY: a });
    }
    // the floor of the granary, its underside the ceiling of the walk
    b.lathe([[RI, 0], [RO, 0], [RO, 0.45], [RI, 0.45]], tint(P.plaster, -0.16), { at: [0, H1 - 0.35, 0], segs: N });
    band(b, RO, N, y0, 0.5, 0.12, tint(STONE, -0.08)); // plinth
    band(b, RO, N, H1, 0.4, 0.15, tint(STONE, -0.05)); // string course

    // ---- the granary storey
    const yU = H1 + 0.4;
    ring(b, N, RO - T / 2, () => {
      b.box(sideO + 0.02, H2, T, STONE, { at: [0, yU, 0] });
      b.window(1.1, 1.7, { at: [0, yU + 0.7, T / 2], frame: tint(STONE, 0.05), glass: P.windowDark, bars: [2, 3] });
    });
    ring(b, NI, RI + T / 2, () => {
      b.box(sideI + 0.02, H2, T, STONE, { at: [0, yU, 0] });
      b.window(0.9, 1.5, { at: [0, yU + 0.8, T / 2], frame: tint(STONE, 0.05), glass: P.windowDark, bars: [2, 2] });
    }, true);
    band(b, RO, N, yU + H2, 0.45, 0.35, tint(STONE, -0.03)); // cornice
    b.lathe([[RI - 0.35, 0], [RI, 0], [RI, 0.45], [RI - 0.35, 0.45]], tint(STONE, -0.03), { at: [0, yU + H2, 0], segs: NI });

    // ---- the slate roof over the ring, with a ridge running round it
    const yR = yU + H2 + 0.45;
    const k = 1 / Math.cos(Math.PI / N);
    b.lathe(
      [
        [(RI - 0.5) * k, -0.15],
        [RM * k, 2.7],
        [(RO + 0.5) * k, -0.15],
        [(RO + 0.5) * k, 0.0],
        [RM * k, 2.9],
        [(RI - 0.5) * k, 0.0],
        [(RI - 0.5) * k, -0.15],
      ],
      P.ardoise,
      { at: [0, yR, 0], segs: N },
    );
    b.lathe([[RM * k - 0.15, 2.85], [RM * k + 0.15, 2.85], [RM * k, 3.05]], P.lead, { at: [0, yR, 0], segs: N });
    // small dormers to air the granary, every other bay
    ring(b, N, RO - 1.2, (i) => {
      if (i % 2) return;
      b.box(0.9, 1.4, 1.0, STONE, { at: [0, yR + 0.2, 0] });
      b.window(0.55, 0.6, { at: [0, yR + 0.8, 0.5], frame: STONE, bars: [1, 2] });
      b.gable(1.1, 1.1, 0.5, P.ardoise, { at: [0, yR + 1.6, 0], ridge: 'z', overhang: 0.08, wall: STONE });
    });

    // ---- grain being traded: sacks under the arcades and in the court, a merchant's scales, a cart
    for (let i = 0; i < 16; i++) {
      const a = b.range(0, Math.PI * 2);
      const r = b.pick([RM - 1.0, RM + 1.2]);
      sack(b, [Math.sin(a) * r, y0, Math.cos(a) * r]);
    }
    for (let i = 0; i < 6; i++) sack(b, [-1.8 + (i % 3) * 0.55, y0, 1.2 + Math.floor(i / 3) * 0.55]);
    // a beam balance on a tripod
    b.group({ at: [1.4, y0, -1.2] }, () => {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        b.beam([Math.sin(a) * 0.8, 0, Math.cos(a) * 0.8], [0, 2.4, 0], 0.07, 0.07, P.oak);
      }
      b.box(1.6, 0.06, 0.06, P.iron, { at: [0, 2.3, 0] });
      for (const s of [-1, 1]) {
        b.box(0.02, 1.2, 0.02, P.iron, { at: [s * 0.75, 1.1, 0] });
        b.cyl(0.3, 0.06, P.bronze, { at: [s * 0.75, 1.05, 0], segs: 8 });
      }
    });
    b.group({ at: [-1.2, y0, -2.0], rotY: 0.6 }, () => {
      b.box(1.6, 0.12, 2.8, P.oak, { at: [0, 0.8, 0] });
      for (const s of [-1, 1]) {
        b.box(0.08, 0.5, 2.8, P.oak, { at: [s * 0.76, 0.92, 0] });
        b.cyl(0.7, 0.12, P.oakDark, { at: [s * 0.9, 0.7, 0], rot: [0, 0, Math.PI / 2], segs: 12 });
      }
      b.beam([0, 0.85, 1.4], [0, 0.5, 3.2], 0.1, 0.1, P.oak);
      for (let i = 0; i < 4; i++) sack(b, [-0.35 + (i % 2) * 0.7, 0.92, -0.6 + Math.floor(i / 2) * 0.7], 0.9);
    });
    b.collider(1.8, 3.0, { at: [-1.2, 0, -2.0], rotY: 0.6 });
  },
};
