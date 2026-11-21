import { P, car, lamp, smoothstep, tint, type Road, type Site, type SiteProp } from '@ah/kit';

/**
 * The ground the English town stands on. +x east, +z south. The market square is at the origin, the
 * High Street runs north-south along x = 0, Cross Street east-west along z = 0, and the river flows
 * west to east along z = 78. The plots that line these streets are in `plots.ts`.
 */

const RIVER_Z = 78;
const CENTRE: [number, number] = [0, 25];
const KNOLL = { x: -205, z: -150, r: 62, h: 11 };
const SQUARE = { x0: -27, x1: 27, z0: -23, z1: 23 };
const BRIDGE = { z0: 65, z1: 91 };

/** Centre line of the river: straight through the town, bending away beyond it. */
function riverZ(x: number): number {
  if (x > 115) return RIVER_Z + 90 * smoothstep(0, 520, x - 115) + 0.02 * (x - 115);
  if (x < -100) return RIVER_Z - 70 * smoothstep(0, 460, -100 - x) - 0.03 * (-100 - x);
  return RIVER_Z;
}

function relief(x: number, z: number): number {
  const r = Math.hypot(x - CENTRE[0], z - CENTRE[1]);
  const hills = smoothstep(215, 560, r);
  const n = 0.5 + 0.5 * Math.sin(x * 0.009 + 1.7) * Math.cos(z * 0.011 - 0.6);
  const n2 = 0.5 + 0.5 * Math.sin(x * 0.021 + z * 0.017 + 2.1);
  const d = Math.abs(z - riverZ(x));
  let h = hills * (8 + 42 * n + 11 * n2) * smoothstep(16, 170, d);
  const k = Math.hypot(x - KNOLL.x, z - KNOLL.z);
  h += KNOLL.h * (1 - smoothstep(0, KNOLL.r, k));
  return h;
}

const roads: Road[] = [
  { id: 'high-street-north', kind: 'main', pts: [[0, -23], [0, -150], [-12, -230], [-40, -330], [-60, -470]] },
  { id: 'high-street-south', kind: 'main', pts: [[0, 23], [0, BRIDGE.z0]] },
  { id: 'london-road', kind: 'main', pts: [[0, BRIDGE.z1], [0, 170], [14, 250], [50, 350], [80, 480]] },
  { id: 'cross-street-west', kind: 'main', pts: [[-27, 0], [-150, 0], [-240, -18], [-340, -30], [-470, -80]] },
  { id: 'cross-street-east', kind: 'main', pts: [[27, 0], [150, 0], [240, -14], [340, 20], [470, 10]] },
  { id: 'mill-lane', kind: 'lane', pts: [[0, 43], [96, 43]] },
  { id: 'church-lane', kind: 'lane', pts: [[0, -53], [31, -53]], since: 600 },
  { id: 'castle-lane', kind: 'lane', pts: [[-62, 0], [-62, -36]] },
  { id: 'row-lane', kind: 'lane', pts: [[-5, -92], [-34, -92], [-62, -84]], since: 1500 },
  { id: 'station-road', kind: 'lane', pts: [[-110, 98], [110, 98]], since: 1780 },
];

const lampSpots: [number, number, number][] = [];
for (const z of [-130, -100, -70, -42, 36, 56, 104, 130, 156]) lampSpots.push([4.6, z, -Math.PI / 2]);
for (const z of [-115, -85, -56, 30, 50, 116, 142]) lampSpots.push([-4.6, z, Math.PI / 2]);
for (const x of [-120, -92, -64, -40, 42, 68, 96, 124]) lampSpots.push([x, 4.6, Math.PI]);
for (const x of [-106, -78, -52, 34, 56, 82, 110]) lampSpots.push([x, -4.6, 0]);
for (const [x, z] of [[SQUARE.x0 + 2, SQUARE.z0 + 2], [SQUARE.x1 - 2, SQUARE.z0 + 2], [SQUARE.x0 + 2, SQUARE.z1 - 2], [SQUARE.x1 - 2, SQUARE.z1 - 2]]) {
  lampSpots.push([x, z, Math.atan2(-x, -z)]);
}

const carSpots: [number, number, number][] = [
  [2.4, -38, 0], [2.4, 48, 0], [-2.4, -66, Math.PI], [-2.4, 112, Math.PI], [2.4, 134, 0],
  [48, 2.4, Math.PI / 2], [-48, -2.4, -Math.PI / 2], [96, -2.4, -Math.PI / 2], [-96, 2.4, Math.PI / 2],
  [SQUARE.x0 + 4, -14, 0], [SQUARE.x0 + 4, -9, 0], [SQUARE.x1 - 4, 12, Math.PI], [SQUARE.x1 - 4, 6, Math.PI],
  [30, 45.5, Math.PI / 2], [70, 40.6, -Math.PI / 2], [-2.4, 150, Math.PI], [-70, 95.6, -Math.PI / 2], [60, 100.4, Math.PI / 2],
];

const props: SiteProp[] = [
  {
    // the stone circle on the knoll: older than everything else in the story
    id: 'stone-circle',
    build(b, ground) {
      const y = ground(KNOLL.x, KNOLL.z);
      const n = 13;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 13 + b.range(-0.6, 0.6);
        const x = KNOLL.x + Math.cos(a) * r;
        const z = KNOLL.z + Math.sin(a) * r;
        const fallen = i === 4 || i === 9;
        const h = b.range(2.4, 3.8);
        b.box(b.range(1.1, 1.7), fallen ? 0.8 : h, b.range(0.6, 0.9), tint(P.gritstone, b.range(-0.04, 0.04)), {
          at: [x, ground(x, z) - 0.2, z],
          rotY: -a + (fallen ? 0.6 : 0),
          rot: fallen ? [0, 0, 0] : [b.range(-0.06, 0.06), 0, b.range(-0.06, 0.06)],
        });
      }
      b.box(2.4, 0.5, 1.1, P.gritstone, { at: [KNOLL.x, y - 0.1, KNOLL.z], rotY: 0.4 });
    },
  },
  {
    // the railway crosses the valley south of the town
    id: 'viaduct',
    since: 1848,
    build(b) {
      const z = 205;
      const len = 560;
      const h = 15;
      const brick = P.brickDark;
      b.archWall(len, h, 5.2, brick, { at: [0, 0, z], openings: 40, openW: 10.4, openH: 12.6, shape: 'round' });
      b.box(len + 2, 0.5, 6, P.sandstone, { at: [0, h, z] });
      b.box(len, 0.9, 0.3, brick, { at: [0, h + 0.5, z - 2.8] });
      b.box(len, 0.9, 0.3, brick, { at: [0, h + 0.5, z + 2.8] });
      b.box(len, 0.12, 0.14, P.iron, { at: [0, h + 0.5, z - 0.75] });
      b.box(len, 0.12, 0.14, P.iron, { at: [0, h + 0.5, z + 0.75] });
      for (const s of [-1, 1]) {
        b.extrude([[0, 0], [90, 0], [0, h + 0.5]], 7, P.grass, { at: [(s * len) / 2, 0, z], rotY: s > 0 ? 0 : Math.PI });
      }
    },
  },
  {
    id: 'gas-lamps',
    since: 1825,
    until: 1958,
    build(b) {
      for (const [x, z, r] of lampSpots) lamp(b, 'gas', [x, 0, z], r);
    },
  },
  {
    id: 'street-lights',
    since: 1958,
    build(b) {
      for (const [x, z, r] of lampSpots.filter((_, i) => i % 2 === 0)) lamp(b, 'modern', [x, 0, z], r);
    },
  },
  {
    // a stone cross on an octagonal stepped base
    id: 'war-memorial',
    since: 1920,
    build(b) {
      b.group({ at: [SQUARE.x0 + 7, 0, SQUARE.z1 - 6] }, () => {
        b.cyl(1.9, 0.3, P.portland, { segs: 8 });
        b.cyl(1.4, 0.3, P.portland, { at: [0, 0.3, 0], segs: 8 });
        b.box(0.9, 1.3, 0.9, P.portland, { at: [0, 0.6, 0] });
        b.box(0.34, 3.2, 0.34, P.portland, { at: [0, 1.9, 0] });
        b.box(1.3, 0.3, 0.3, P.portland, { at: [0, 4.2, 0] });
      });
    },
  },
  {
    // K6 telephone kiosk
    id: 'telephone-kiosk',
    since: 1936,
    build(k) {
      k.group({ at: [SQUARE.x1 - 4, 0, SQUARE.z1 - 3], rotY: -0.5 }, () => {
        k.box(0.92, 2.3, 0.92, P.postRed);
        k.dome(0.52, P.postRed, { at: [0, 2.3, 0], squash: 0.45, segs: 8 });
        for (const f of ['+z', '-z', '+x', '-x'] as const) {
          const v: [number, number, number] = f === '+z' ? [0, 0.35, 0.46] : f === '-z' ? [0, 0.35, -0.46] : f === '+x' ? [0.46, 0.35, 0] : [-0.46, 0.35, 0];
          k.window(0.7, 1.6, { at: v, facing: f, frame: P.postRed, bars: [3, 6], border: 0.07 });
        }
      });
    },
  },
  {
    id: 'pillar-box',
    since: 1859,
    build(p) {
      p.group({ at: [SQUARE.x1 - 6.5, 0, SQUARE.z1 - 2.6] }, () => {
        p.cyl(0.25, 1.35, P.postRed, { segs: 10 });
        p.cyl(0.29, 0.14, P.postRed, { at: [0, 1.35, 0], rTop: 0.12, segs: 10 });
        p.cyl(0.27, 0.16, 0x1b1b1d, { segs: 10 });
      });
    },
  },
  {
    id: 'cars-thirties',
    since: 1928,
    until: 1957,
    build(a) {
      carSpots.filter((_, i) => i % 4 === 0).forEach(([x, z, r]) => car(a, 'thirties', a.pick([0x1c1c1e, 0x2a2420, 0x3a2a26, 0x26303a]), [x, 0.05, z], r));
    },
  },
  {
    id: 'cars-sixties',
    since: 1957,
    until: 1988,
    build(c) {
      carSpots
        .filter((_, i) => i % 2 === 0)
        .forEach(([x, z, r]) => car(c, 'sixties', c.pick([P.cladRed, 0x7fa3b8, P.cream, 0x5d7a52, 0xd9d4c6, 0x34495e]), [x, 0.05, z], r));
    },
  },
  {
    id: 'cars-modern',
    since: 1988,
    build(m) {
      carSpots.forEach(([x, z, r]) => car(m, 'modern', m.pick([0xc9ced2, 0xf0efea, 0x30343a, 0x3f6f9c, 0xa33a34, 0x7b8086]), [x, 0.05, z], r));
    },
  },
  {
    // haystacks give the farmland some scale
    id: 'haystacks',
    since: 900,
    until: 1935,
    build(b, ground) {
      for (const [x, z] of [[150, 150], [-170, 120], [185, -110], [-130, -190], [230, 60]] as [number, number][]) {
        b.group({ at: [x, ground(x, z), z], rotY: b.range(0, 3) }, () => {
          b.cyl(2.2, 2.2, P.thatch, { segs: 9 });
          b.cone(2.5, 2.2, P.thatchOld, { at: [0, 2.2, 0], segs: 9 });
        });
      }
    },
  },
];

export const site: Site = {
  centre: CENTRE,
  radius: 430,
  river: { z: riverZ, half: 8 },
  relief,
  roads,
  squares: [SQUARE],
  trees: [
    { kind: 'round', share: 0.88 },
    { kind: 'conifer', share: 0.12 },
  ],
  clearings: [{ x: KNOLL.x, z: KNOLL.z, r: 26 }],
  props,
  turbines: { since: 2001, at: [[330, -300], [395, -240], [300, -370]] },
  view: { target: [0, 4, 18], distance: 215, azimuth: 0.62, polar: 0.98 },
};
