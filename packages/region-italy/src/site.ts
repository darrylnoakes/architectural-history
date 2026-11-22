import { P, car, lamp, smoothstep, tint, type Road, type Site, type SiteProp } from '@ah/kit';

/**
 * The ground the Italian city stands on. +x east, +z south. Two Roman streets cross at the origin:
 * the cardo north-south along x = 0 and the decumanus east-west along z = 0. The river flows west
 * to east along z = 96, twenty-four metres wide. North of the decumanus, Piazza Grande opens off the
 * east side of the cardo and the cathedral square off the west; the market square lies to the
 * south-west. The quarters of united Italy, the station and the railway are south of the river.
 * The plots that line these streets are in `plots.ts`.
 */

export const RIVER_Z = 96;
/** The two tracks run just behind the station building; these match the track the station plot lays. */
const TRACKS = [192.5, 194.75];
const RAIL_Z = 193.6;
const CENTRE: [number, number] = [0, 20];
/** A hill to the north-east with a keep on it. */
const ROCCA = { x: 255, z: -235, r: 120, h: 30 };

export const PIAZZA = { x0: 6, x1: 58, z0: -50, z1: -6 };
export const DUOMO_SQUARE = { x0: -78, x1: -30, z0: -30, z1: -5.5, since: 313 };
export const MARKET_SQUARE = { x0: -66, x1: -26, z0: 36, z1: 74 };
export const STATION_SQUARE = { x0: -26, x1: 26, z0: 156, z1: 172, since: 1864 };

/** Centre line of the river: straight through the city, swinging away in broad bends beyond it. */
function riverZ(x: number): number {
  if (x > 190) return RIVER_Z - 110 * smoothstep(0, 560, x - 190) - 0.03 * (x - 190);
  if (x < -180) return RIVER_Z + 80 * smoothstep(0, 480, -180 - x) + 0.02 * (-180 - x);
  return RIVER_Z;
}

function relief(x: number, z: number): number {
  const r = Math.hypot(x - CENTRE[0], z - CENTRE[1]);
  // steeper, more broken country than the English vale: rounded clay hills on every side
  const hills = smoothstep(235, 520, r);
  const n = 0.5 + 0.5 * Math.sin(x * 0.012 + 0.4) * Math.cos(z * 0.01 + 1.1);
  const n2 = 0.5 + 0.5 * Math.sin(x * 0.027 - z * 0.019 + 0.7);
  const valley = smoothstep(20, 190, Math.abs(z - riverZ(x)));
  // the railway keeps to a side valley
  const cutting = smoothstep(10, 70, Math.abs(z - RAIL_Z));
  let h = hills * (10 + 50 * n + 16 * n2) * valley * cutting;
  const k = Math.hypot(x - ROCCA.x, z - ROCCA.z);
  h += ROCCA.h * (1 - smoothstep(0, ROCCA.r, k));
  return h;
}

const roads: Road[] = [
  // the consular road: in from the north, through the city, over the bridge
  { id: 'cardo', kind: 'main', pts: [[60, -480], [40, -340], [10, -240], [0, -150], [0, 79]] },
  { id: 'via-roma', kind: 'main', pts: [[0, 113], [0, 156]] },
  { id: 'old-south-road', kind: 'main', pts: [[0, 156], [0, 190], [-14, 260], [-50, 360], [-80, 480]], until: 1864 },
  { id: 'decumanus-west', kind: 'main', pts: [[0, 0], [-170, 0], [-250, 16], [-340, 30], [-480, 70]] },
  { id: 'decumanus-east', kind: 'main', pts: [[0, 0], [230, 0], [290, 12], [350, -18], [480, -30]] },
  { id: 'via-dei-mulini', kind: 'lane', pts: [[-26, 55], [128, 55]], since: -200 },
  { id: 'via-del-mercato', kind: 'lane', pts: [[-64, 0], [-64, 36]], since: -250 },
  // united Italy: an avenue to the station, a boulevard where the east wall stood, a second bridge
  { id: 'viale', kind: 'main', pts: [[-150, 136], [146, 136]], since: 1864 },
  { id: 'viale-west', kind: 'main', pts: [[-200, 136], [-150, 136]], since: 2002 },
  { id: 'new-south-road', kind: 'main', pts: [[146, 136], [149, 200], [126, 300], [92, 380], [70, 480]], since: 1864 },
  // (it runs on the line of the east wall, pulled down after 1870, and steps aside round the old gate)
  { id: 'boulevard-north', kind: 'main', pts: [[146, -128], [146, -26], [134, -17], [134, 17], [146, 26], [146, 79]], since: 1880 },
  { id: 'via-dei-mulini-east', kind: 'lane', pts: [[128, 55], [146, 55]], since: 1880 },
  { id: 'boulevard-south', kind: 'main', pts: [[146, 113], [146, 136]], since: 1880 },
  { id: 'footbridge-path-north', kind: 'lane', pts: [[-36, 74], [-36, 79]], since: 2008 },
  { id: 'footbridge-path-south', kind: 'lane', pts: [[-36, 113], [-36, 136]], since: 2008 },
];

// ---------------------------------------------------------------- street furniture

const lampSpots: [number, number, number][] = [];
for (const z of [-118, -96, -70, -42, -16, 14, 40, 68, 122, 146]) lampSpots.push([4.7, z, -Math.PI / 2]);
for (const z of [-106, -84, -56, -28, 26, 50, 72, 132, 150]) lampSpots.push([-4.7, z, Math.PI / 2]);
for (const x of [-138, -112, -86, -60, -34, 24, 52, 80, 106]) lampSpots.push([x, 4.7, Math.PI]);
for (const x of [-124, -98, -72, -46, -20, 38, 66, 94, 118]) lampSpots.push([x, -4.7, 0]);
for (const x of [-120, -80, -40, 40, 80, 116]) lampSpots.push([x, 140.7, Math.PI]);
for (const q of [PIAZZA, MARKET_SQUARE]) {
  const cx = (q.x0 + q.x1) / 2;
  const cz = (q.z0 + q.z1) / 2;
  for (const [x, z] of [[q.x0 + 2, q.z0 + 2], [q.x1 - 2, q.z0 + 2], [q.x0 + 2, q.z1 - 2], [q.x1 - 2, q.z1 - 2]]) {
    lampSpots.push([x, z, Math.atan2(cx - x, cz - z)]);
  }
}

const carSpots: [number, number, number][] = [
  [2.5, -64, 0], [-2.5, -90, Math.PI], [2.5, 46, 0], [-2.5, 20, Math.PI], [2.5, 128, 0], [-2.5, 146, Math.PI],
  [44, 2.5, Math.PI / 2], [-48, -2.5, -Math.PI / 2], [92, -2.5, -Math.PI / 2], [-104, 2.5, Math.PI / 2],
  [PIAZZA.x1 - 4, -14, Math.PI], [PIAZZA.x1 - 4, -19, Math.PI], [PIAZZA.x1 - 4, -24, Math.PI], [PIAZZA.x0 + 16, -9, Math.PI / 2],
  [MARKET_SQUARE.x0 + 4, 42, 0], [MARKET_SQUARE.x0 + 4, 47, 0], [MARKET_SQUARE.x1 - 4, 66, Math.PI],
  [30, 57.4, Math.PI / 2], [78, 52.6, -Math.PI / 2], [-70, 133.6, -Math.PI / 2], [60, 138.4, Math.PI / 2], [100, 133.6, -Math.PI / 2],
  [-18, 160, 0], [18, 164, Math.PI], [143.6, 44, Math.PI], [148.4, 64, 0],
];

/** One stretch of aqueduct: a row of tall round arches carrying a covered channel. */
function arcade(b: Parameters<SiteProp['build']>[0], ground: (x: number, z: number) => number, from: [number, number], to: [number, number], top: number) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const rotY = Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[1] + to[1]) / 2;
  // stand it on the lowest ground along its length, so no pier stops in mid-air
  let low = Infinity;
  for (let i = 0; i <= 10; i++) low = Math.min(low, ground(from[0] + ((to[0] - from[0]) * i) / 10, from[1] + ((to[1] - from[1]) * i) / 10));
  const base = low - 0.5;
  const h = top - base;
  const n = Math.max(1, Math.round(len / 7.2));
  b.group({ at: [mx, base, mz], rotY }, () => {
    b.archWall(len, h - 1.6, 2.4, tint(P.travertine, -0.06), { openings: n, openW: 5, openH: h - 5, shape: 'round' });
    // the water channel (specus) and its cover slabs
    b.box(len, 1.3, 2, tint(P.travertine, -0.03), { at: [0, h - 1.6, 0] });
    b.box(len + 0.4, 0.3, 2.5, P.travertine, { at: [0, h - 0.3, 0] });
    b.box(len + 0.3, 0.35, 2.7, P.travertine, { at: [0, h - 1.9, 0] });
  });
}

const AQ_FROM: [number, number] = [392, -436];
const AQ_TO: [number, number] = [92, -176];
const aqAt = (t: number): [number, number] => [AQ_FROM[0] + (AQ_TO[0] - AQ_FROM[0]) * t, AQ_FROM[1] + (AQ_TO[1] - AQ_FROM[1]) * t];
const AQ_TOP = 16.5;

const props: SiteProp[] = [
  {
    // the aqueduct strides in from the hills on arches to a distribution tank outside the north gate
    id: 'aqueduct',
    since: 40,
    until: 537,
    build(b, ground) {
      arcade(b, ground, AQ_FROM, AQ_TO, AQ_TOP);
      b.box(7, 8, 7, tint(P.travertine, -0.06), { at: [AQ_TO[0] - 3, 0, AQ_TO[1] + 3], rotY: 0.72 });
    },
  },
  {
    // cut in the siege of 537 and never mended: the arches stand on in broken lengths
    id: 'aqueduct-broken',
    since: 537,
    build(b, ground) {
      for (const [t0, t1] of [[0, 0.24], [0.31, 0.52], [0.6, 0.66], [0.78, 0.93]] as [number, number][]) arcade(b, ground, aqAt(t0), aqAt(t1), AQ_TOP);
    },
  },
  {
    // a lord's keep on the hill, from the age when every height in central Italy got one
    id: 'rocca',
    since: 1080,
    build(b, ground) {
      const y = ground(ROCCA.x, ROCCA.z) - 0.4;
      b.group({ at: [ROCCA.x, y, ROCCA.z], rotY: 0.5 }, () => {
        const stone = tint(P.pietraForte, -0.03);
        b.box(26, 6.5, 0.9, stone, { at: [0, 0, -11] });
        b.box(26, 6.5, 0.9, stone, { at: [0, 0, 11] });
        b.box(0.9, 6.5, 22, stone, { at: [-13, 0, 0] });
        b.box(0.9, 6.5, 22, stone, { at: [13, 0, 0] });
        b.crenel(26.9, 22.9, stone, { at: [0, 6.5, 0], merlonH: 0.9, t: 0.9 });
        b.box(7.5, 21, 7.5, stone, { at: [-6, 0, -3] });
        b.crenel(8.7, 8.7, stone, { at: [-6, 21, -3], merlonH: 1.1, t: 0.6 });
        b.box(10, 5, 6, tint(P.pietraForte, 0.03), { at: [5.5, 0, 6] });
        b.shed(10, 6, 1.6, P.coppi, { at: [5.5, 5, 6], high: '+z' });
      });
    },
  },
  {
    // cypresses planted two by two along the road to the villas
    id: 'cypress-avenue',
    since: 1560,
    build(b, ground) {
      const pts: [number, number][] = [[0, -150], [10, -240], [40, -340]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, az] = pts[i];
        const [bx, bz] = pts[i + 1];
        const len = Math.hypot(bx - ax, bz - az);
        const nx = -(bz - az) / len;
        const nz = (bx - ax) / len;
        for (let d = i === 0 ? 34 : 0; d < len; d += 9.5) {
          for (const s of [-1, 1]) {
            const x = ax + ((bx - ax) * d) / len + nx * s * 6.5;
            const z = az + ((bz - az) * d) / len + nz * s * 6.5;
            b.tree(b.range(10, 13.5), { at: [x, ground(x, z) - 0.1, z], kind: 'cypress' });
          }
        }
      }
    },
  },
  {
    // straw stacked round a pole, the haystack of the sharecropping farms
    id: 'pagliai',
    since: 850,
    until: 1960,
    build(b, ground) {
      for (const [x, z] of [[170, -120], [-190, -110], [200, 150], [-170, 230], [240, 30], [-250, 90]] as [number, number][]) {
        b.group({ at: [x, ground(x, z), z] }, () => {
          b.cyl(2, 1.6, P.thatch, { segs: 9, rTop: 2.3 });
          b.cone(2.4, 3.4, P.thatchOld, { at: [0, 1.6, 0], segs: 9 });
          b.cyl(0.07, 6, P.oak, { segs: 5 });
        });
      }
    },
  },
  {
    // the railway reaches the town in 1864: a double track on a low bank south of the new quarter
    id: 'railway',
    since: 1864,
    build(b) {
      // the station plot lays its own track: the line runs up to it from either side and matches it
      for (const side of [-1, 1]) {
        const x0 = side * 20;
        const x1 = side * 760;
        const mid = (x0 + x1) / 2;
        const len = Math.abs(x1 - x0);
        b.box(len, 0.12, 6.4, 0x8d8778, { at: [mid, -0.02, RAIL_Z], jitter: false });
        for (const z of TRACKS) {
          b.box(len, 0.18, 2.3, 0x8a8377, { at: [mid, 0, z], jitter: false });
          for (const s of [-1, 1]) b.box(len, 0.15, 0.08, P.steel, { at: [mid, 0.28, z + s * 0.7175], jitter: false });
          for (let x = 21.2; x <= 330; x += 2.4) b.box(0.24, 0.1, 2.2, 0x5a4c40, { at: [side * x, 0.18, z], jitter: false });
        }
      }
    },
  },
  {
    // electrified between the wars: masts and wires over the tracks
    id: 'catenary',
    since: 1935,
    build(b) {
      for (let x = -330; x <= 330; x += 44) {
        if (Math.abs(x) < 30) continue;
        b.cyl(0.13, 7.2, P.steel, { at: [x, 0, RAIL_Z - 3.6], segs: 6 });
        b.box(0.12, 0.12, 6.4, P.steel, { at: [x, 6.6, RAIL_Z - 0.6] });
      }
      for (const z of TRACKS) b.box(700, 0.04, 0.04, P.iron, { at: [0, 6.1, z], jitter: false });
    },
  },
  {
    id: 'gas-lamps',
    since: 1846,
    until: 1958,
    build(b) {
      for (const [x, z, r] of lampSpots) {
        if (z > 105) continue; // the quarter beyond the river is not built yet
        lamp(b, 'gas', [x, 0, z], r);
      }
    },
  },
  {
    id: 'gas-lamps-south',
    since: 1885,
    until: 1958,
    build(b) {
      for (const [x, z, r] of lampSpots) if (z > 105) lamp(b, 'gas', [x, 0, z], r);
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
    // the war memorial in the station square: a bronze soldier on a travertine pier
    id: 'war-memorial',
    since: 1924,
    build(b) {
      b.group({ at: [STATION_SQUARE.x0 + 9, 0, STATION_SQUARE.z0 + 8] }, () => {
        b.box(4.2, 0.3, 4.2, P.travertine);
        b.box(3.2, 0.3, 3.2, P.travertine, { at: [0, 0.3, 0] });
        b.box(1.5, 3.4, 1.5, P.travertine, { at: [0, 0.6, 0] });
        b.box(1.8, 0.25, 1.8, P.travertine, { at: [0, 4, 0] });
        b.figure({ at: [0, 4.25, 0], color: P.bronze });
      });
    },
  },
  {
    // a newspaper kiosk: the edicola
    id: 'edicola',
    since: 1905,
    build(b) {
      b.group({ at: [PIAZZA.x0 + 5, 0, PIAZZA.z1 - 5], rotY: 0.3 }, () => {
        b.cyl(1.25, 2.5, 0x2f5d50, { segs: 8 });
        b.cone(1.75, 0.9, 0x2a4f45, { at: [0, 2.5, 0], segs: 8 });
        b.panel(1.1, 1.0, P.cream, { at: [0, 1.1, 1.16], facing: '+z' });
      });
    },
  },
  {
    id: 'cars-thirties',
    since: 1932,
    until: 1957,
    build(a) {
      carSpots.filter((_, i) => i % 5 === 0).forEach(([x, z, r]) => car(a, 'thirties', a.pick([0x1c1c1e, 0x2a2420, 0x40302a, 0x26303a]), [x, 0.05, z], r));
    },
  },
  {
    // the years of the Fiat 600 and 500: suddenly every street is a car park
    id: 'cars-sixties',
    since: 1957,
    until: 1988,
    build(c) {
      carSpots
        .filter((_, i) => i % 3 !== 2)
        .forEach(([x, z, r]) => car(c, 'sixties', c.pick([0xd9d4c6, 0x9fc0cf, P.cream, 0xb7453a, 0x5d7a52, 0xe0c060, 0x34495e]), [x, 0.05, z], r));
    },
  },
  {
    // the squares in the centre are closed to traffic at the end of the century
    id: 'cars-modern',
    since: 1988,
    build(m) {
      carSpots
        .filter(([x, z]) => !(x > PIAZZA.x0 && x < PIAZZA.x1 && z > PIAZZA.z0 && z < PIAZZA.z1))
        .forEach(([x, z, r]) => car(m, 'modern', m.pick([0xc9ced2, 0xf0efea, 0x30343a, 0x3f6f9c, 0xa33a34, 0x7b8086]), [x, 0.05, z], r));
    },
  },
];

export const site: Site = {
  centre: CENTRE,
  radius: 440,
  river: { z: riverZ, half: 12 },
  relief,
  roads,
  squares: [PIAZZA, DUOMO_SQUARE, MARKET_SQUARE, STATION_SQUARE],
  trees: [
    { kind: 'round', share: 0.4 },
    { kind: 'olive', share: 0.24 },
    { kind: 'cypress', share: 0.2 },
    { kind: 'pine', share: 0.16 },
  ],
  clearings: [
    { x: ROCCA.x, z: ROCCA.z, r: 30 },
    { x: 0, z: RAIL_Z, r: 60 },
  ],
  props,
  view: { target: [4, 4, 14], distance: 250, azimuth: 0.55, polar: 0.98 },
};
