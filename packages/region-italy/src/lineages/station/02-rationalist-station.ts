import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, catenary, clock, littorina, platform, track } from './shared';

const ZF = 4.2; // street face of the long low block
const ZB = -3.4; // track face
const H = 7.4; // height of the long block
const HW = 4.6; // half-width of the ticket hall under the glass cascade
const HH = 11.2; // ticket hall height
const HZ = 1.6; // face of the ticket hall, set back; the cascade steps forward from here
const STEPS = 5;
const STEP_D = 0.95;
const STEP_H = 1.35;

/** Stone cladding joints: horizontal lines across a face along X. */
function joints(b: Builder, x0: number, x1: number, z: number, ys: number[], color: number, f: 1 | -1): void {
  for (const y of ys) b.box(x1 - x0, 0.04, 0.03, color, { at: [(x0 + x1) / 2, y, z + f * 0.015], jitter: false });
}

export const rationalistStation: BuildingDef = {
  id: 'rationalist-station',
  name: 'Rationalist station',
  style: 'Rationalism',
  date: 'mid 1930s',
  summary:
    'In the 1930s the state railways rebuilt many stations, and a few were given to the young modernists. This one is long and low, a horizontal mass faced in the same brown sandstone as the old city so that it sits quietly beside it, with almost no ornament. ' +
    'The ticket hall is lit by a cascade of glass that steps down from the roof over the entrance; the long concourse behind has a glazed roof, and the platforms are sheltered by thin canopies of reinforced concrete. ' +
    'Where the 1860s station hid a modern iron shed behind a classical palace, here the modern materials are the architecture.',
  materials: ['reinforced concrete', 'pietraforte sandstone cladding', 'steel-framed glazing', 'marble floors'],
  modelledOn: 'Santa Maria Novella station, Florence (Gruppo Toscano led by Giovanni Michelucci, built 1932 to 1935)',
  influences: ['rationalism'],
  lookFor: [
    { label: 'Cascade of glass', note: 'Bands of glass step down from the roof over the entrance, flooding the ticket hall with light.', at: [-HW - 0.3, HH - 2.5, HZ + 2.4] },
    { label: 'Stone-faced horizontal mass', note: 'A long, low, flat-roofed block clad in sandstone, its plain walls barely broken by windows.', at: [12, 4, ZF + 0.3] },
    { label: 'Flat cantilevered canopy', note: 'A thin concrete slab on slender columns shelters cars and taxis setting down passengers.', at: [-13, 4.1, 9.8] },
    { label: 'Concrete platform canopy', note: 'A slab balanced on a single row of columns, with no ties or brackets: reinforced concrete at its simplest.', at: [8, 4.6, -5.3] },
    { label: 'Diesel railcar', note: 'A light streamlined railcar of the 1930s, nicknamed the Littorina, for fast services on branch lines.', at: [-9, 4.1, TRACKS[0] - 1.5] },
  ],
  build(b) {
    const stone = tint(mix(P.pietraForte, P.sandstone, 0.3), b.range(-0.02, 0.02));
    const joint = tint(stone, -0.12);
    const glass = mix(P.glass, P.glassGreen, 0.3);
    const frame = P.steel;
    const concrete = P.concreteWhite;
    const G = { mat: 'glass' as const };

    // ---------------------------------------------------------------- forecourt
    b.box(HX * 2, 0.05, 12 - ZF, mix(P.travertine, P.paving, 0.5), { at: [0, 0, (12 + ZF) / 2], jitter: false });

    // ---------------------------------------------------------------- the long low block, either side of the hall
    b.sym((s) => {
      const x0 = HW;
      const x1 = 18.6;
      const L = x1 - x0;
      const xc = s * (x0 + x1) / 2;
      b.box(L, H, ZF - ZB, stone, { at: [xc, 0, (ZF + ZB) / 2] });
      b.box(L + 0.1, 0.5, ZF - ZB + 0.1, tint(stone, -0.08), { at: [xc, 0, (ZF + ZB) / 2] }); // a dark plinth
      b.box(L + 0.2, 0.3, ZF - ZB + 0.2, tint(stone, 0.05), { at: [xc, H, (ZF + ZB) / 2] }); // a thin coping
      joints(b, s > 0 ? x0 : -x1, s > 0 ? x1 : -x0, ZF, [1.6, 2.7, 3.8, 4.9, 6.0], joint, 1);
      joints(b, s > 0 ? x0 : -x1, s > 0 ? x1 : -x0, ZB, [1.6, 2.7, 3.8, 4.9, 6.0], joint, -1);
      // a long band of small square windows high up, the only openings in the street front
      const n = 10;
      for (let i = 0; i < n; i++) {
        const x = s * (x0 + 1.0 + (i + 0.5) * ((L - 2) / n));
        b.panel(0.75, 0.75, P.windowDark, { at: [x, 5.0, ZF], depth: 0.05 });
      }
      // tall doors at the outer ends: departures and arrivals
      b.panel(3.2, 3.2, P.windowDark, { at: [s * 16.2, 0.5, ZF], depth: 0.05 });
      for (const dx of [-0.8, 0, 0.8]) b.panel(0.06, 3.2, frame, { at: [s * 16.2 + dx, 0.5, ZF], depth: 0.08 });
      // track side: a continuous run of steel windows into the concourse
      b.box(L - 1, 2.4, 0.05, glass, { at: [xc, 3.6, ZB - 0.02], ...G });
      for (let x = x0 + 0.5; x < x1; x += 1.2) b.box(0.06, 2.4, 0.08, frame, { at: [s * x, 3.6, ZB - 0.03], jitter: false });
      b.box(L - 1, 3.0, 0.05, P.windowDark, { at: [xc, 0.5, ZB - 0.02] });
      // the glazed roof strip over the concourse that runs along the back of the block
      b.box(L - 0.6, 0.5, 2.6, glass, { at: [xc, H, ZB + 1.8], ...G });
      for (let x = x0 + 0.6; x < x1 - 0.3; x += 1.5) b.box(0.07, 0.55, 2.7, frame, { at: [s * x, H, ZB + 1.8], jitter: false });
    });

    // ---------------------------------------------------------------- the ticket hall and the glass cascade
    b.box(HW * 2, HH, HZ - ZB, stone, { at: [0, 0, (HZ + ZB) / 2] });
    b.box(HW * 2 + 0.2, 0.3, HZ - ZB + 0.2, tint(stone, 0.05), { at: [0, HH, (HZ + ZB) / 2] });
    joints(b, -HW, HW, ZB, [1.6, 2.7, 3.8, 4.9, 6.0, 7.1, 8.2, 9.3, 10.4], joint, -1);
    for (let i = 0; i < STEPS; i++) {
      const z0 = HZ + i * STEP_D;
      const z1 = z0 + STEP_D;
      const yTop = HH - i * STEP_H;
      const yLow = yTop - STEP_H;
      // the tread: a glazed band, sloping slightly
      b.box(HW * 2 - 0.4, 0.14, STEP_D + 0.06, glass, { at: [0, yTop - 0.14, (z0 + z1) / 2], ...G });
      // the riser: vertical glass down to the next tread
      b.box(HW * 2 - 0.4, STEP_H, 0.06, glass, { at: [0, yLow, z1], ...G });
      // steel glazing bars on each
      for (let x = -HW + 0.2; x <= HW - 0.2 + 0.01; x += (HW * 2 - 0.4) / 8) {
        b.box(0.06, 0.18, STEP_D + 0.1, frame, { at: [x, yTop - 0.16, (z0 + z1) / 2], jitter: false });
        b.box(0.06, STEP_H, 0.1, frame, { at: [x, yLow, z1], jitter: false });
      }
      // the stone side walls, stepping down with the glass
      b.sym((s) => b.box(0.4, yTop, STEP_D, stone, { at: [s * (HW - 0.2), 0, (z0 + z1) / 2] }));
    }
    // the entrance: a row of glazed doors under the lowest step
    const zE = HZ + STEPS * STEP_D;
    const yE = HH - STEPS * STEP_H;
    b.box(HW * 2 - 0.4, yE, 0.05, P.windowDark, { at: [0, 0, zE] });
    for (let x = -HW + 0.2; x <= HW - 0.2 + 0.01; x += (HW * 2 - 0.4) / 6) b.box(0.08, yE, 0.1, frame, { at: [x, 0, zE], jitter: false });
    b.box(HW * 2 - 0.4, 0.12, 0.12, frame, { at: [0, 2.6, zE], jitter: false });

    // ---------------------------------------------------------------- the car canopy along the front
    b.group({ at: [-12.4, 0, 0] }, () => {
      b.box(10.8, 0.28, 5.6, concrete, { at: [0, 3.75, ZF + 2.8] });
      b.box(10.8, 0.06, 5.4, tint(concrete, -0.18), { at: [0, 3.72, ZF + 2.8], jitter: false });
      for (const x of [-4.6, -1.5, 1.5, 4.6]) b.cyl(0.13, 3.75, P.steel, { at: [x, 0, ZF + 4.6], segs: 6 });
    });

    // ---------------------------------------------------------------- platform, canopies, tracks and the railcar
    platform(b, ZB, PLAT.edge, -HX, HX);
    for (const z of TRACKS) track(b, z);
    const zc = (ZB + PLAT.edge) / 2;
    for (const x of [-16, -11, -6, -1, 4, 9, 14]) {
      b.box(0.36, 4.0, 0.36, concrete, { at: [x, PLAT.y, zc] });
      b.extrude([[-0.18, 0], [0.18, 0], [1.6, 0.35], [-1.6, 0.35]], 0.36, concrete, { at: [x, PLAT.y + 3.6, zc], rotY: Math.PI / 2 }); // flared head
    }
    b.box(33, 0.22, ZB - PLAT.edge + 0.5, concrete, { at: [-1, PLAT.y + 3.95, zc] });
    b.box(33, 0.35, 0.18, concrete, { at: [-1, PLAT.y + 3.85, PLAT.edge - 0.15] });
    clock(b, 0.9, [-6, PLAT.y + 2.7, zc + 0.19], { facing: '+z', rim: P.steel });
    clock(b, 0.9, [-6, PLAT.y + 2.7, zc - 0.19], { facing: '-z', rim: P.steel });
    littorina(b, [-4, 0, TRACKS[0]]);
    catenary(b, TRACKS[0], [-17, -5, 7, 18], -11.85);

    // ---------------------------------------------------------------- around it
    for (const x of [3.8, 9, 14.2]) {
      b.box(1.6, 0.5, 1.6, tint(stone, 0.04), { at: [x + 3, 0, 10.6] });
      b.tree(3.6, { kind: 'pine', at: [x + 3, 0.5, 10.6] });
    }

    // ---------------------------------------------------------------- walking: the ticket hall is open
    b.sym((s) => b.collider(18.6 - HW, ZF - ZB, { at: [s * (18.6 + HW) / 2, 0, (ZF + ZB) / 2] }));
    b.collider(17, 3.0, { at: [-4, 0, TRACKS[0]] });
  },
};
