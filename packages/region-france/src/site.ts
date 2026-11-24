import { P, car, lamp, smoothstep, tint, type Road, type Site, type SiteProp } from '@ah/kit';
import { wallClearings, wallDetail, wallProps } from './town-walls';

/**
 * The ground the French city stands on. +x east, +z south. The Grande Rue, the old road from
 * Paris to Flanders, runs north-south along x = 0 and crosses the river by the bridge; the road
 * from the west to Reims crosses it at the origin along z = 0. The river flows west to east along
 * z = 96, twenty-four metres wide. The Grand'Place with the town hall lies north-west of the
 * crossing and the cathedral with its parvis north-east; the market place is to the south-west.
 * A wall runs round the town on three sides between three gates (`town-walls.ts`). Outside it are
 * the abbey to the east, the castle on its hill to the west, and across the river the faubourg,
 * the station and the quarters of the last two centuries.
 * The plots that line these streets are in `plots.ts`.
 */

export const RIVER_Z = 96;
/** The two tracks run just behind the station building; these match the track the station plot lays. */
const TRACKS = [192.5, 194.75];
const RAIL_Z = 193.6;
const CENTRE: [number, number] = [0, 20];
/** The castle hill: a flat top big enough for the castle plot, then a slope down to the plain. */
export const CASTLE_HILL = { x: -245, z: -62, top: 38, foot: 94, h: 11 };

export const GRAND_PLACE = { x0: -58, x1: -6, z0: -50, z1: -6 };
export const PARVIS = { x0: 6, x1: 27, z0: -57, z1: -23, since: 380 };
export const MARKET_PLACE = { x0: -68, x1: -28, z0: 36, z1: 74 };
export const STATION_SQUARE = { x0: -26, x1: 26, z0: 156, z1: 172, since: 1849 };

/** Centre line of the river: straight through the town, winding away across the plain beyond it. */
function riverZ(x: number): number {
  if (x > 250) return RIVER_Z + 70 * smoothstep(0, 520, x - 250) + 0.04 * (x - 250);
  if (x < -180) return RIVER_Z - 60 * smoothstep(0, 480, -180 - x) - 0.02 * (-180 - x);
  return RIVER_Z;
}

function relief(x: number, z: number): number {
  const r = Math.hypot(x - CENTRE[0], z - CENTRE[1]);
  // open chalk country: long low swells, nothing steep
  const hills = smoothstep(260, 560, r);
  const n = 0.5 + 0.5 * Math.sin(x * 0.007 + 1.1) * Math.cos(z * 0.008 + 0.3);
  const n2 = 0.5 + 0.5 * Math.sin(x * 0.019 + z * 0.013 + 1.9);
  const valley = smoothstep(20, 200, Math.abs(z - riverZ(x)));
  // the railway keeps to level ground
  const cutting = smoothstep(10, 70, Math.abs(z - RAIL_Z));
  let h = hills * (5 + 24 * n + 7 * n2) * valley * cutting;
  const k = Math.hypot(x - CASTLE_HILL.x, z - CASTLE_HILL.z);
  h += CASTLE_HILL.h * (1 - smoothstep(CASTLE_HILL.top, CASTLE_HILL.foot, k));
  return h;
}

const roads: Road[] = [
  // the road from Paris to Flanders: in over the bridge, through the town, out by the north gate
  { id: 'grande-rue', kind: 'main', pts: [[-50, -480], [-30, -340], [-8, -240], [0, -150], [0, 79]] },
  { id: 'rue-de-paris', kind: 'main', pts: [[0, 113], [0, 156]] },
  { id: 'old-paris-road', kind: 'main', pts: [[0, 156], [0, 190], [14, 260], [50, 360], [90, 480]], until: 1849 },
  // the road from the west, bending round the foot of the castle hill, and on to Reims
  { id: 'route-ouest', kind: 'main', pts: [[0, 0], [-170, 0], [-250, 40], [-350, 30], [-480, -10]] },
  { id: 'route-de-reims', kind: 'main', pts: [[0, 0], [124, 0]] },
  // (through the kept east gate and over its bridges it is a narrow street in the motor age)
  { id: 'route-de-reims-porte', kind: 'main', pts: [[124, 0], [184, 0]], until: 1885 },
  { id: 'rue-de-la-porte-est', kind: 'lane', pts: [[124, 0], [184, 0]], since: 1885 },
  { id: 'route-de-reims-est', kind: 'main', pts: [[184, 0], [250, 0], [310, -14], [370, 10], [480, 30]] },
  { id: 'rue-des-moulins', kind: 'lane', pts: [[0, 55], [128, 55]], since: 20 },
  { id: 'rue-du-marche', kind: 'lane', pts: [[-64, 0], [-64, 36]], since: 20 },
  { id: 'chemin-du-chateau', kind: 'lane', pts: [[-222, 26], [-245, -2], [-245, -34]], since: 960 },
  { id: 'rue-de-l-abbaye', kind: 'lane', pts: [[187, 0], [187, -34]], since: 560 },
  { id: 'allee-du-chateau', kind: 'lane', pts: [[-5, -200], [-12, -200]], since: 1520 },
  // the railway age: an avenue to the station along the south bank, and a second bridge
  { id: 'chemin-du-faubourg', kind: 'lane', pts: [[-60, 136], [128, 136]], until: 1849 },
  { id: 'boulevard-de-la-gare', kind: 'main', pts: [[-150, 136], [146, 136]], since: 1849 },
  { id: 'new-paris-road', kind: 'main', pts: [[-150, 136], [-153, 200], [-130, 300], [-96, 380], [-90, 480]], since: 1849 },
  { id: 'rue-du-pont-neuf', kind: 'main', pts: [[128, 55], [128, 79]], since: 1830 },
  { id: 'rue-du-pont-neuf-sud', kind: 'main', pts: [[128, 113], [128, 136]], since: 1830 },
  // after 1885: boulevards on the line of the western and north-western ramparts, meeting the old
  // roads at the roundabouts where the kept gates stand on their islands
  { id: 'boulevard-ouest', kind: 'main', pts: [[-150, 55], [-150, -128]], since: 1890 },
  { id: 'boulevard-nord', kind: 'main', pts: [[-150, -128], [0, -128]], since: 1890 },
  { id: 'rue-neuve', kind: 'lane', pts: [[-150, 55], [-66, 55]], since: 1890 },
  { id: 'footbridge-path-north', kind: 'lane', pts: [[-62, 74], [-62, 79]], since: 2006 },
  { id: 'footbridge-path-south', kind: 'lane', pts: [[-62, 113], [-62, 136]], since: 2006 },
  // the intendant's quarter of the 1760s, behind the cathedral
  { id: 'rue-royale', kind: 'lane', pts: [[128, 0], [128, -62], [96, -62]], since: 1760 },
  // the edges of the twentieth-century town
  { id: 'route-nationale', kind: 'main', pts: [[-250, 136], [-150, 136]], since: 1955 },
  { id: 'avenue-de-la-zup', kind: 'main', pts: [[146, 136], [290, 136]], since: 1962 },
  { id: 'rue-des-lilas', kind: 'lane', pts: [[-2, -210], [156, -210]], since: 1930 },
  { id: 'rue-du-centre-d-art', kind: 'lane', pts: [[128, 55], [150, 55]], since: 2010 },
];

// ---------------------------------------------------------------- street furniture

const lampSpots: [number, number, number][] = [];
for (const z of [-118, -96, -70, -42, -16, 14, 40, 68, 122, 146]) lampSpots.push([4.7, z, -Math.PI / 2]);
for (const z of [-106, -84, -56, -28, 26, 50, 72, 132, 150]) lampSpots.push([-4.7, z, Math.PI / 2]);
for (const x of [-138, -112, -86, -60, -34, 24, 52, 80, 106, 132]) lampSpots.push([x, 4.7, Math.PI]);
for (const x of [-124, -98, -72, -46, -20, 38, 66, 94, 118]) lampSpots.push([x, -4.7, 0]);
for (const x of [-120, -80, -40, 40, 80, 116]) lampSpots.push([x, 140.7, Math.PI]);
for (const q of [GRAND_PLACE, MARKET_PLACE]) {
  const cx = (q.x0 + q.x1) / 2;
  const cz = (q.z0 + q.z1) / 2;
  for (const [x, z] of [[q.x0 + 2, q.z0 + 2], [q.x1 - 2, q.z0 + 2], [q.x0 + 2, q.z1 - 2], [q.x1 - 2, q.z1 - 2]]) {
    lampSpots.push([x, z, Math.atan2(cx - x, cz - z)]);
  }
}

const carSpots: [number, number, number][] = [
  [2.5, -64, 0], [-2.5, -90, Math.PI], [2.5, 46, 0], [-2.5, 20, Math.PI], [2.5, 128, 0], [-2.5, 146, Math.PI],
  [44, 2.5, Math.PI / 2], [-78, -2.5, -Math.PI / 2], [92, -2.5, -Math.PI / 2], [-104, 2.5, Math.PI / 2],
  [GRAND_PLACE.x0 + 4, -14, 0], [GRAND_PLACE.x0 + 4, -19, 0], [GRAND_PLACE.x0 + 4, -24, 0], [GRAND_PLACE.x1 - 16, -9, Math.PI / 2],
  [MARKET_PLACE.x0 + 4, 42, 0], [MARKET_PLACE.x0 + 4, 47, 0], [MARKET_PLACE.x1 - 4, 66, Math.PI],
  [30, 57.4, Math.PI / 2], [78, 52.6, -Math.PI / 2], [-70, 133.6, -Math.PI / 2], [60, 138.4, Math.PI / 2], [100, 133.6, -Math.PI / 2],
  [-18, 160, 0], [18, 164, Math.PI], [125.6, 66, Math.PI], [130.4, 124, 0],
];

/** A post mill: a timber body that turns on a trestle to face the wind, with four cloth sails. */
function postMill(b: Parameters<SiteProp['build']>[0], x: number, y: number, z: number, rotY: number) {
  b.group({ at: [x, y, z], rotY }, () => {
    // the trestle: crossed sills, a central post and four raking struts
    b.box(6.4, 0.4, 0.5, P.oakDark, { at: [0, 0, 0] });
    b.box(0.5, 0.4, 6.4, P.oakDark, { at: [0, 0, 0] });
    b.box(0.7, 3.4, 0.7, P.oak, { at: [0, 0.3, 0] });
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) b.beam([dx * 2.9, 0.4, dz * 2.9], [dx * 0.3, 3, dz * 0.3], 0.3, 0.3, P.oak);
    // the body, boarded, with a steep roof and a ladder and tail pole behind
    b.box(4, 5.4, 4.6, P.oakSilver, { at: [0, 3.2, 0] });
    b.gable(4, 4.6, 2, P.shingle, { at: [0, 8.6, 0], ridge: 'z', overhang: 0.25, wall: P.oakSilver });
    b.beam([0, 3.4, -2.3], [0, 0.3, -7.5], 0.3, 0.3, P.oak);
    b.beam([0.9, 3.4, -2.3], [0.9, 0.2, -5], 0.5, 0.12, P.oak);
    // the sails on the windshaft at the front
    b.box(0.4, 0.4, 1.2, P.oakDark, { at: [0, 7, 2.6] });
    for (let i = 0; i < 4; i++) {
      b.group({ at: [0, 7.2, 3.1], rot: [0, 0, (i * Math.PI) / 2 + 0.5] }, () => {
        b.box(0.18, 6.6, 0.14, P.oakDark, { at: [0, 0.3, 0] });
        b.box(1.5, 5.4, 0.05, tint(P.limewash, -0.05), { at: [0.8, 1.3, 0] });
      });
    }
  });
}

const props: SiteProp[] = [
  {
    // post mills on the swell of the plain, from the thirteenth century until steam and rollers
    id: 'windmills',
    since: 1230,
    until: 1895,
    build(b, ground) {
      for (const [x, z, r] of [[250, -150, 0.6], [310, -200, 0.9], [-120, -290, 0.4]] as [number, number, number][]) postMill(b, x, ground(x, z), z, r);
    },
  },
  {
    // the king's highways were planted with trees from the eighteenth century
    id: 'road-trees',
    since: 1750,
    build(b, ground) {
      const lines: [number, number][][] = [
        [[0, -160], [-8, -240], [-30, -340], [-42, -420]],
        [[262, 0], [310, -14], [370, 10], [430, 22]],
      ];
      for (const pts of lines) {
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, az] = pts[i];
          const [bx, bz] = pts[i + 1];
          const len = Math.hypot(bx - ax, bz - az);
          const nx = -(bz - az) / len;
          const nz = (bx - ax) / len;
          for (let d = 0; d < len; d += 11) {
            for (const s of [-1, 1]) {
              const x = ax + ((bx - ax) * d) / len + nx * s * 6.5;
              const z = az + ((bz - az) * d) / len + nz * s * 6.5;
              b.tree(b.range(12, 16), { at: [x, ground(x, z) - 0.1, z], kind: 'poplar' });
            }
          }
        }
      }
    },
  },
  {
    // the railway from Paris reaches the town in 1849: a double track on the south bank
    id: 'railway',
    since: 1849,
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
    // electrified around 1960: masts and wires over the tracks
    id: 'catenary',
    since: 1961,
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
    since: 1845,
    until: 1958,
    build(b) {
      for (const [x, z, r] of lampSpots) {
        if (z > 105) continue; // the quarter beyond the river comes with the station
        lamp(b, 'gas', [x, 0, z], r);
      }
    },
  },
  {
    id: 'gas-lamps-south',
    since: 1872,
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
    // the war cemetery beyond the town: rows of white crosses, one for each of the dead of 1914 to 1918
    id: 'war-cemetery',
    since: 1920,
    build(b, ground) {
      const cx = 96;
      const cz = -236;
      const y = ground(cx, cz);
      b.box(46, 0.12, 34, tint(P.grass, 0.04), { at: [cx, y - 0.02, cz], jitter: false });
      for (const [w, d, ox, oz] of [[46, 0.5, 0, -17], [46, 0.5, 0, 17], [0.5, 34, -23, 0], [0.5, 34, 23, 0]]) b.box(w, 0.9, d, P.craie, { at: [cx + ox, y, cz + oz], jitter: false });
      for (let i = -9; i <= 9; i++) {
        for (let j = -5; j <= 5; j++) {
          if (i === 0) continue; // the central path
          const x = cx + i * 2.2;
          const z = cz + j * 2.7;
          b.box(0.12, 0.85, 0.08, P.white, { at: [x, y, z], jitter: false });
          b.box(0.5, 0.12, 0.08, P.white, { at: [x, y + 0.5, z], jitter: false });
        }
      }
      b.box(0.5, 5, 0.5, P.craie, { at: [cx, y, cz - 13] });
      b.box(2.4, 0.5, 0.5, P.craie, { at: [cx, y + 3.4, cz - 13] });
      b.cyl(0.05, 9, P.steel, { at: [cx, y, cz + 12], segs: 5 });
    },
  },
  {
    // the monument aux morts: a bronze infantryman on a stone pier, in the square before the station
    id: 'war-memorial',
    since: 1922,
    build(b) {
      b.group({ at: [STATION_SQUARE.x0 + 9, 0, STATION_SQUARE.z0 + 8] }, () => {
        b.box(4.2, 0.3, 4.2, P.pierreBlonde);
        b.box(3.2, 0.3, 3.2, P.pierreBlonde, { at: [0, 0.3, 0] });
        b.box(1.5, 3.4, 1.5, P.pierreBlonde, { at: [0, 0.6, 0] });
        b.box(1.8, 0.25, 1.8, P.pierreBlonde, { at: [0, 4, 0] });
        b.figure({ at: [0, 4.25, 0], color: P.bronze });
      });
    },
  },
  {
    // a cast-iron drinking fountain with a dome on four figures, given to the town in the 1870s
    id: 'wallace-fountain',
    since: 1878,
    build(b) {
      b.group({ at: [MARKET_PLACE.x1 - 5, 0, MARKET_PLACE.z0 + 5] }, () => {
        b.cyl(0.5, 0.9, 0x2f5d50, { segs: 8 });
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          b.cyl(0.07, 0.9, 0x2f5d50, { at: [Math.cos(a) * 0.3, 0.9, Math.sin(a) * 0.3], segs: 5 });
        }
        b.dome(0.5, 0x2a4f45, { at: [0, 1.8, 0], squash: 0.9, segs: 8 });
      });
    },
  },
  {
    // a water tower for the new estates: a concrete bowl on a stalk
    id: 'water-tower',
    since: 1964,
    build(b, ground) {
      const x = 250;
      const z = 176;
      b.group({ at: [x, ground(x, z), z] }, () => {
        b.cyl(2.2, 24, P.concrete, { segs: 12, rTop: 1.8 });
        b.cyl(2, 5, P.concrete, { at: [0, 24, 0], rTop: 7.5, segs: 16 });
        b.cyl(7.5, 3.2, P.concreteWhite, { at: [0, 29, 0], segs: 16 });
        b.cone(7.6, 1.2, P.concrete, { at: [0, 32.2, 0], segs: 16 });
      });
    },
  },
  {
    id: 'cars-thirties',
    since: 1926,
    until: 1955,
    build(a) {
      carSpots.filter((_, i) => i % 5 === 0).forEach(([x, z, r]) => car(a, 'thirties', a.pick([0x1c1c1e, 0x2a2420, 0x40302a, 0x26303a]), [x, 0.05, z], r));
    },
  },
  {
    id: 'cars-sixties',
    since: 1955,
    until: 1988,
    build(c) {
      carSpots
        .filter((_, i) => i % 3 !== 2)
        .forEach(([x, z, r]) => car(c, 'sixties', c.pick([0xd9d4c6, 0x8fa9b8, P.cream, 0xa33a34, 0x5d7a52, 0x9aa3a8, 0x34495e]), [x, 0.05, z], r));
    },
  },
  {
    // the Grand'Place is closed to cars at the end of the century
    id: 'cars-modern',
    since: 1988,
    build(m) {
      carSpots
        .filter(([x, z]) => !(x > GRAND_PLACE.x0 && x < GRAND_PLACE.x1 && z > GRAND_PLACE.z0 && z < GRAND_PLACE.z1))
        .forEach(([x, z, r]) => car(m, 'modern', m.pick([0xc9ced2, 0xf0efea, 0x30343a, 0x3f6f9c, 0xa33a34, 0x7b8086]), [x, 0.05, z], r));
    },
  },
];

export const site: Site = {
  centre: CENTRE,
  radius: 450,
  river: { z: riverZ, half: 12 },
  relief,
  roads,
  squares: [GRAND_PLACE, PARVIS, MARKET_PLACE, STATION_SQUARE],
  trees: [
    { kind: 'round', share: 0.62 },
    { kind: 'poplar', share: 0.3 },
    { kind: 'conifer', share: 0.08 },
  ],
  clearings: [
    { x: CASTLE_HILL.x, z: CASTLE_HILL.z, r: 46 },
    { x: 0, z: RAIL_Z, r: 60 },
    { x: 96, z: -236, r: 34 },
    ...wallClearings,
  ],
  props: [...wallProps, ...props],
  detail: wallDetail,
  turbines: { since: 2008, at: [[360, -330], [420, -270], [330, -400], [450, -340]] },
  view: { target: [4, 4, 4], distance: 255, azimuth: 0.6, polar: 0.98 },
};
