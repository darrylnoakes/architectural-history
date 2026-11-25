import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, clock, electricTrain, pacificTrain, terTrain, platform, track, wallRects, forecourt, overheadLine } from './shared';

const ZF = 4.6; // street front of the hall
const ZB = -3.0; // platform side
const HX0 = -10.6; // the hall
const HX1 = 10.6;
const HH = 10.0; // its height
const T = 0.4; // wall thickness
const TX = -13.6; // the clock tower
const TW = 4.4;
const TH = 27.0;
const OX1 = 19.4; // the office wing runs to here
const OH = 7.2;

type Rect = [number, number, number, number];

/** A mosaic panel: a field of small coloured tesserae in a stepped, sunburst-like pattern, as flat rectangles. */
function mosaic(b: Builder, x: number, y: number, z: number, w: number, h: number, cols: number[], ground: number): void {
  b.panel(w, h, ground, { at: [x, y, z], facing: '+z', depth: 0.04 });
  const byCol: Rect[][] = cols.map(() => []);
  const nx = Math.round(w / 0.35);
  const ny = Math.round(h / 0.35);
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const u = -w / 2 + (i + 0.5) * (w / nx);
      const v = (j + 0.5) * (h / ny);
      // rays fanning up from the bottom centre, in bands of colour
      const ang = Math.atan2(v, u);
      const band = Math.floor((ang / Math.PI) * 9);
      const r = Math.hypot(u, v * 1.6);
      if (r < h * 0.45) byCol[0].push([x + u, y + v - 0.13, 0.26, 0.26]);
      else if (band % 2 === 0) byCol[1 + (band % (cols.length - 1))].push([x + u, y + v - 0.13, 0.26, 0.26]);
    }
  }
  byCol.forEach((rects, k) => wallRects(b, rects, cols[k], [0, 0, z], '+z', 0.07));
}

export const reconstructionStation: BuildingDef = {
  id: 'reconstruction-station',
  name: 'Station of the Reconstruction',
  style: 'Art Deco, reinforced concrete and brick',
  date: 'c. 1928',
  summary:
    'Many stations of the north were wrecked in the Great War, and the Compagnie du Nord rebuilt them in the 1920s in the new manner: a frame of reinforced concrete filled with red brick, the structure frankly shown as ribs and bands. ' +
    'The new station is long, low and wide, its hall lit by tall windows of geometric glazing, with a concrete canopy along the front, mosaics in bright colours over the doors, and a clock tower to mark it from across the town. ' +
    'On the platform the iron shed has gone: in its place a row of slender concrete columns carries a thin cantilevered canopy, cheaper to build and needing no painting.',
  materials: ['reinforced concrete', 'red brick', 'glass mosaic', 'steel-framed windows'],
  modelledOn: 'The stations of Lens (Urbain Cassan, 1926 to 1927, its outline said to recall a locomotive, with mosaics of mining life) and Rouen Rive-Droite (Adolphe Dervaux, begun 1913, opened 1928, with its clock tower), in general terms',
  influences: ['art-deco', 'reinforced-concrete'],
  revisions: [
    {
      year: 1959,
      note: 'The main line was electrified at 25,000 volts, as the Nord’s lines from Paris were at the end of the 1950s: masts and wires now stand over both tracks, and electric locomotives such as the BB 16000 of 1958, plain box cabs with a pantograph at each end, take over the expresses from the steam Pacifics.',
    },
    {
      year: 2007,
      note: 'When the high-speed station opened outside the town in 2007, the expresses to Paris moved there. The old station stays in use for the regional trains (TER), which the regions have run since 2002, now low electric units such as the AGC of 2004, and for the trains out to the new station.',
    },
  ],
  lookFor: [
    { label: 'Clock tower', note: 'A square tower of brick and concrete, stepped back at the top in the Art Deco way, with a clock on each face.', at: [TX, TH - 3.0, -1.0 + TW / 2 + 0.3] },
    { label: 'Concrete frame', note: 'The columns and beams of the reinforced-concrete frame show on the front as ribs, with brick panels between.', at: [-7.6, 6.0, ZF + 0.3] },
    { label: 'Mosaics', note: 'Panels of coloured glass mosaic over the entrance; at Lens they show miners and trains.', at: [0, 6.8, ZF + 0.4] },
    { label: 'Front canopy (marquise)', note: 'A thin concrete canopy cantilevered along the front shelters the doors.', at: [5.0, 3.9, ZF + 1.6] },
    { label: 'Platform umbrellas', note: 'A single row of concrete columns carries the platform canopy, cantilevered both ways like an open umbrella.', at: [-12.0, 4.6, -5.0] },
  ],
  build(b) {
    const conc = b.pick([P.concreteWhite, mix(P.concreteWhite, P.pierreBlonde, 0.4)]);
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, 0.03)]);
    const steel = mix(P.castIron, P.voletVert, 0.2);
    const glass = mix(P.glassDark, P.glass, 0.3);
    const zc = (ZF + ZB) / 2;
    const D = ZF - ZB;

    forecourt(b, mix(P.paving, P.tarmac, 0.25));

    // ------------------------------------------------ the hall: a walkable shell
    const L = HX1 - HX0;
    const gap = 6.4; // the doors in the front and to the platform
    for (const [z, f] of [[ZF - T / 2, '+z'], [ZB + T / 2, '-z']] as const) {
      for (const s of [-1, 1]) {
        const w = (L - gap) / 2;
        const x = s * (gap / 2 + w / 2);
        b.box(w, HH, T, brick, { at: [x, 0, z] });
        b.collider(w, T + 0.2, { at: [x, 0, z] });
      }
      b.box(gap, HH - 3.4, T, brick, { at: [0, 3.4, z] });
      const sgn = f === '+z' ? 1 : -1;
      // glass doors in the gap
      b.window(gap, 3.4, { at: [0, 0, z + sgn * T / 2], facing: f, frame: steel, glass, bars: [6, 2], border: 0.1, mat: 'glass' });
    }
    for (const s of [-1, 1]) {
      b.box(T, HH, D, brick, { at: [s * (L / 2 - T / 2), 0, zc] });
      b.collider(T + 0.2, D, { at: [s * (L / 2 - T / 2), 0, zc] });
    }
    // the roof: a flat slab with a stepped cornice
    b.box(L + 0.5, 0.5, D + 0.5, conc, { at: [0, HH, zc] });
    b.box(L - 3.0, 1.1, D - 2.0, conc, { at: [0, HH + 0.5, zc] });
    b.box(L - 3.4, 0.25, D - 2.4, mix(P.glass, P.white, 0.3), { at: [0, HH + 1.6, zc], mat: 'glass' }); // roof light
    // the frame on the front and back: columns as ribs, a beam at the canopy, tall windows between
    for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
      const sgn = f === '+z' ? 1 : -1;
      const cols = [-10.4, -7.0, -3.6, 3.6, 7.0, 10.4];
      for (const x of cols) b.box(0.6, HH, 0.3, conc, { at: [x, 0, z + sgn * 0.15] });
      b.box(L + 0.3, 0.5, 0.35, conc, { at: [0, 3.4, z + sgn * 0.15] });
      b.box(L + 0.3, 0.6, 0.35, conc, { at: [0, HH - 0.6, z + sgn * 0.15] });
      // tall windows of geometric steel glazing between the outer columns
      for (const x of [-8.7, -5.3, 5.3, 8.7]) {
        b.window(2.2, 5.2, { at: [x, 4.1, z], facing: f, frame: steel, glass, bars: [3, 6], border: 0.1, mat: 'glass' });
        b.window(2.2, 2.4, { at: [x, 0.6, z], facing: f, frame: steel, glass, bars: [3, 2], border: 0.1, mat: 'glass' });
      }
    }
    // the mosaic over the doors, and the station's name panel
    mosaic(b, 0, 4.0, ZF, 6.6, 3.4, [P.gold, P.cladBlue, P.cladRed, P.cladGreen], P.cream);
    b.panel(6.8, 0.8, conc, { at: [0, 8.0, ZF], facing: '+z', depth: 0.12 });
    b.panel(5.6, 0.25, P.black, { at: [0, 8.28, ZF + 0.08], facing: '+z', depth: 0.05 });
    // the marquise along the front
    b.box(L + 1.0, 0.25, 2.6, conc, { at: [0, 3.5, ZF + 1.3] });
    b.box(L + 1.0, 0.35, 0.12, steel, { at: [0, 3.4, ZF + 2.55] });
    // inside: the booking office counter, benches
    b.box(6.0, 1.2, 0.8, P.oak, { at: [-5.6, 0, -1.6] });
    b.box(6.0, 1.4, 0.1, mix(P.glass, P.white, 0.3), { at: [-5.6, 1.2, -1.6], mat: 'glass' });
    b.box(4.0, 0.45, 0.5, P.oak, { at: [6.0, 0, 1.0] });
    b.collider(6.0, 0.8, { at: [-5.6, 0, -1.6] });

    // ------------------------------------------------ the clock tower, at the west end
    const tz = -1.0;
    b.box(TW, TH - 4.0, TW, brick, { at: [TX, 0, tz] });
    b.collider(TW, TW, { at: [TX, 0, tz] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.55, TH - 4.0, 0.55, conc, { at: [TX + sx * (TW / 2 - 0.2), 0, tz + sz * (TW / 2 - 0.2)] });
    for (const y of [HH - 0.6, 16.0]) b.box(TW + 0.2, 0.4, TW + 0.2, conc, { at: [TX, y, tz] });
    // a slit of glazing up the face, lighting the stair
    for (const f of ['+z', '-z', '-x'] as const) {
      const at: [number, number, number] = f === '+z' ? [TX, 10.6, tz + TW / 2] : f === '-z' ? [TX, 10.6, tz - TW / 2] : [TX - TW / 2, 10.6, tz];
      b.window(0.8, 5.0, { at, facing: f, frame: conc, glass, bars: [1, 5], border: 0.08 });
    }
    // the clock stage, stepped back twice, with a clock on three faces
    b.box(TW - 0.6, 3.0, TW - 0.6, conc, { at: [TX, TH - 4.0, tz] });
    b.box(TW - 1.4, 1.0, TW - 1.4, conc, { at: [TX, TH - 1.0, tz] });
    b.box(0.5, 1.8, 0.5, conc, { at: [TX, TH, tz] });
    clock(b, 1.9, [TX, TH - 3.5, tz + (TW - 0.6) / 2], { facing: '+z', rim: P.gold });
    clock(b, 1.9, [TX, TH - 3.5, tz - (TW - 0.6) / 2], { facing: '-z', rim: P.gold });
    clock(b, 1.9, [TX - (TW - 0.6) / 2, TH - 3.5, tz], { facing: '-x', rim: P.gold });
    b.window(1.6, 2.6, { at: [TX, 0.05, tz + TW / 2], facing: '+z', frame: conc, glass, bars: [2, 2], border: 0.1 });

    // ------------------------------------------------ the office wing, east
    const ox0 = HX1;
    const ow = OX1 - ox0;
    const oxc = (ox0 + OX1) / 2;
    const od = D - 1.4;
    b.box(ow, OH, od, brick, { at: [oxc, 0, zc] });
    b.box(ow + 0.2, 0.35, od + 0.2, conc, { at: [oxc, 3.4, zc] });
    b.box(ow + 0.4, 0.5, od + 0.4, conc, { at: [oxc, OH, zc] });
    b.collider(ow, od, { at: [oxc, 0, zc] });
    for (const [z, f] of [[zc + od / 2, '+z'], [zc - od / 2, '-z']] as const) {
      const rects: Rect[] = [];
      const bands: Rect[] = [];
      for (let i = 0; i < 4; i++) {
        const u = -ow / 2 + (i + 0.5) * (ow / 4);
        for (const y of [0.9, 4.3]) {
          rects.push([u, y, 1.5, 2.0]);
          bands.push([u, y - 0.15, 1.9, 0.15]);
        }
      }
      wallRects(b, bands, conc, [oxc, 0, z], f, 0.04);
      wallRects(b, rects, glass, [oxc, 0, z], f, 0.05);
    }
    wallRects(b, [[0, 0.9, 1.5, 2.0], [0, 4.3, 1.5, 2.0]], glass, [OX1, 0, zc], '+x', 0.05);

    // ------------------------------------------------ platform, umbrella canopy, tracks, train
    platform(b, PLAT.back, PLAT.edge, -HX, HX);
    for (const z of TRACKS) track(b, z);
    const cz = -5.0;
    const top = PLAT.y + 4.0;
    for (let x = -17.5; x <= 17.6; x += 5) {
      b.box(0.4, top - PLAT.y, 0.4, conc, { at: [x, PLAT.y, cz] });
      // the bracket: a tapering beam either side under the slab
      b.beam([x, top - 0.9, cz], [x, top - 0.12, cz - 2.1], 0.3, 0.3, conc);
      b.beam([x, top - 0.9, cz], [x, top - 0.12, cz + 1.8], 0.3, 0.3, conc);
    }
    b.box(37.0, 0.18, 4.2, conc, { at: [0, top - 0.1, cz - 0.15] });
    b.box(37.0, 0.3, 0.12, conc, { at: [0, top - 0.2, cz - 2.25] }); // upstand at the edge
    b.collider(36, 2.8, { at: [-1.0, 0, TRACKS[0]] });
    for (let x = -17.5; x <= 17.6; x += 5) b.collider(0.5, 0.5, { at: [x, 0, cz] });

    for (const x of [-4.8, 4.8, 15.0]) {
      b.cyl(0.1, 4.6, P.castIron, { at: [x, 0, 10.4], segs: 6 });
      b.cyl(0.25, 0.5, mix(P.glass, P.windowLit, 0.5), { at: [x, 4.6, 10.4], segs: 6 });
    }

    // ------------------------------------------------ the line and the train at the platform
    // (built last: the revisions alter only these, so everything above stays the same)
    if (b.since(1959)) overheadLine(b);
    if (b.since(2007)) terTrain(b, [-18.6, 0, TRACKS[0]]);
    else if (b.since(1959)) electricTrain(b, [-19.2, 0, TRACKS[0]]);
    else pacificTrain(b, [-19.2, 0, TRACKS[0]]);
  },
};
