import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { DEG, patch, tileRoof, well } from './shared';

const ZF = 5.6; // street face of the ground storey
const D = 8.4; // depth of each house
const ZB = ZF - D;
const G = 2.9; // ground storey (the loom room)
const U = 2.5; // upper storey
const JET = 0.45; // the first floor oversails the street by this much
const PITCH = 56; // tiled roof

/** Oiled linen stretched in the window openings: no glass in a weaver's house of the 1480s. */
const LINEN = mix(P.cream, P.oakSilver, 0.35);

/** Studs on a gable triangle: vertical timbers from y0 up to the roof line, on a wall facing +z or -z at z. */
function gableStuds(b: Builder, x: number, z: number, w: number, y0: number, h: number, n: number, oak: number, f: '+z' | '-z'): void {
  const s = f === '+z' ? 1 : -1;
  for (let k = 1; k < n; k++) {
    const u = -w / 2 + (w * k) / n;
    const top = h * (1 - Math.abs(u) / (w / 2));
    if (top < 0.3) continue;
    b.box(0.15, top - 0.05, 0.05, oak, { at: [x + u, y0, z + s * 0.025] });
  }
  b.box(w, 0.15, 0.05, oak, { at: [x, y0 + h * 0.45, z + s * 0.025] });
}

/** One gabled, jettied weaver's house. `door` is the side of the front the door is on (-1 left, 1 right). */
function weaverHouse(b: Builder, x: number, w: number, o: { infill: number; oak: number; roof: number; door: 1 | -1; chimney: 1 | -1 }): void {
  const { infill, oak, roof, door } = o;
  const zc = (ZF + ZB) / 2;
  // ground storey: a plinth of stone, close-studded frame, the long loom window
  b.box(w, 0.45, D, P.pierreBlonde, { at: [x, 0, zc] });
  b.box(w, G - 0.45, D, infill, { at: [x, 0.45, zc] });
  b.frame(w, G - 0.45, oak, { at: [x, 0.45, ZF], facing: '+z', studs: Math.round(w / 0.75), rails: 1, beam: 0.14, depth: 0.05 });
  // jetty: joist ends and two carved brackets carry the first floor out over the street
  const nJ = Math.round(w / 0.45);
  for (let k = 0; k <= nJ; k++) b.box(0.14, 0.16, JET + 0.1, oak, { at: [x - w / 2 + 0.07 + ((w - 0.14) * k) / nJ, G - 0.12, ZF + JET / 2 - 0.05] });
  for (const s of [-1, 1]) b.beam([x + s * (w / 2 - 0.15), G - 1.0, ZF + 0.03], [x + s * (w / 2 - 0.15), G - 0.1, ZF + JET], 0.18, 0.2, oak);
  // upper storey
  const uz = zc + JET / 2;
  const ud = D + JET;
  b.box(w, U, ud, infill, { at: [x, G, uz] });
  b.box(w + 0.04, 0.16, ud + 0.04, oak, { at: [x, G, uz] }); // the bressummer
  b.frame(w, U, oak, { at: [x, G, ZF + JET], facing: '+z', studs: Math.round(w / 0.75), rails: 1, beam: 0.14, depth: 0.05 });
  b.frame(w, U, oak, { at: [x, G, ZB], facing: '-z', studs: Math.round(w / 1.1), rails: 1, beam: 0.15, depth: 0.05 });
  b.frame(w, G - 0.45, oak, { at: [x, 0.45, ZB], facing: '-z', studs: Math.round(w / 1.1), rails: 1, beam: 0.15, depth: 0.05 });
  // roof, gable to the street
  const top = G + U;
  const h = tileRoof(b, w, ud, PITCH, roof, { at: [x, top, uz], ridge: 'z', ov: 0.3, wall: infill, thick: 0.13 });
  b.box(w + 0.1, 0.16, 0.2, oak, { at: [x, top, ZF + JET + 0.05] }); // tie beam of the gable
  gableStuds(b, x, ZF + JET, w, top, h, 6, oak, '+z');
  gableStuds(b, x, ZB, w, top, h, 4, oak, '-z');
  // the loom window: a strip of lights between the studs across most of the front
  const dx = x + door * (w / 2 - 0.65);
  b.panel(0.95, 2.05, P.oakDark, { at: [dx, 0.45, ZF + 0.04], facing: '+z', depth: 0.06 });
  const ww = w - 1.8;
  const wx = x - door * 0.55;
  b.window(ww, 1.05, { at: [wx, 1.2, ZF + 0.04], facing: '+z', frame: oak, glass: LINEN, bars: [Math.round(ww / 0.6), 2], border: 0.08 });
  b.box(ww + 0.2, 0.08, 0.18, oak, { at: [wx, 1.14, ZF + 0.1] }); // sill
  // upstairs: two small windows with shutters folded back, an attic hatch in the gable
  for (const s of [-1, 1]) {
    const ux = x + s * w * 0.22;
    b.window(0.75, 1.0, { at: [ux, G + 0.9, ZF + JET + 0.04], facing: '+z', frame: oak, glass: LINEN, bars: [2, 2], border: 0.07 });
    b.panel(0.38, 0.95, tint(oak, -0.05), { at: [ux + s * 0.6, G + 0.92, ZF + JET + 0.04], facing: '+z', depth: 0.05 });
  }
  b.panel(0.6, 0.7, P.oakDark, { at: [x, top + h * 0.3, ZF + JET + 0.05], facing: '+z', depth: 0.05 });
  // back: a door to the yard and a window
  b.panel(0.85, 1.9, P.oakDark, { at: [x - door * (w / 2 - 0.7), 0.45, ZB - 0.04], facing: '-z', depth: 0.06 });
  b.window(1.4, 0.9, { at: [x + door * 0.6, 1.3, ZB - 0.04], facing: '-z', frame: oak, glass: LINEN, bars: [2, 1], border: 0.07 });
  // a brick chimney stack on the party wall, through the roof near the back
  const cz = ZB + 2.0;
  const cx = x + o.chimney * (w / 2 - 0.35);
  const roofAt = top + Math.tan(PITCH * DEG) * 0.35;
  b.chimney(0.7, top + h + 0.9 - roofAt, 0.55, P.briqueNord, { at: [cx, roofAt, cz] });
}

export const weaversHouses: BuildingDef = {
  id: 'weavers-houses',
  name: 'Weavers’ houses',
  style: 'Late Gothic timber frame',
  date: 'c. 1480',
  summary:
    'At the end of the Hundred Years’ War the cloth towns of Picardy recovered on a new, lighter cloth of wool, the sayette, woven not in workshops but at home by families of weavers (at Amiens, the sayetteurs). ' +
    'Their houses were narrow, gable-ended and timber-framed, with the upper floor jettied out over the street; the loom stood in the ground-floor room, lit by a long strip of windows across the front, while the family lived and slept above. ' +
    'The windows were filled with oiled linen or paper rather than glass, and a brick chimney stack, now usual even in modest houses, served the hearth. Several households shared one well in the yard behind.',
  materials: ['oak frame', 'cob infill', 'flat clay tiles', 'brick chimney', 'oiled linen in the windows'],
  modelledOn: 'The weavers’ quarter of Saint-Leu, Amiens, in general terms: no single house is copied, and the surviving houses there are mostly later',
  lookFor: [
    { label: 'Loom window', note: 'A long strip of lights across the ground floor gives the weaver the even daylight he needs at the loom.', at: [-7.0, 1.7, ZF + 0.2] },
    { label: 'Jetty', note: 'The upper floor projects over the street on joists and brackets, gaining space and sheltering the front.', at: [0.2, G - 0.2, ZF + JET + 0.1] },
    { label: 'Close studding', note: 'Upright oak studs set close together, the spaces filled with cob and limewashed.', at: [7.0, G + 1.6, ZF + JET + 0.1] },
    { label: 'Chimney stack', note: 'By the fifteenth century even a weaver had a brick chimney instead of an open hearth in the middle of the floor.', at: [-3.0, 9.6, -0.8] },
    { label: 'Shared well', note: 'One well in the yard behind served all the households on the plot.', at: [3.0, 2.6, -5.6] },
  ],
  build(b) {
    const oak = b.pick([P.oakDark, P.oak, mix(P.oakDark, P.timberBlack, 0.4)]);
    const roof = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.04), mix(P.tuilePlate, P.tileBrown, 0.4)]);
    const washes = [P.limewash, P.torchis, mix(P.torchis, P.ochreWash, 0.3), mix(P.limewash, P.pinkWash, 0.35)];

    patch(b, 25.6, 2.0, P.cobble, [0, 7.0], 0.06); // the street
    patch(b, 25.6, 15.6 - 2.0 - D, mix(P.earth, P.gravel, 0.3), [0, (ZB - 7.8) / 2], 0.03);

    // three houses and an alley to the yard; where the alley falls changes from plot to plot
    const hero = b.variant === 0;
    const alleyAt = hero ? 3 : b.pick([0, 1, 2]);
    const widths = hero ? [6.6, 6.0, 6.8] : [b.pick([6.4, 6.8]), b.pick([6.0, 6.6]), b.pick([6.6, 7.2])];
    const alley = 1.3;
    const total = widths.reduce((a, c) => a + c, 0) + alley;
    let x = -total / 2;
    let alleyX = 0;
    widths.forEach((w, i) => {
      if (i === alleyAt) {
        alleyX = x + alley / 2;
        x += alley;
      }
      const cx = x + w / 2;
      weaverHouse(b, cx, w, {
        infill: washes[(i + alleyAt) % washes.length],
        oak,
        roof: tint(roof, b.range(-0.03, 0.03)),
        door: (i + alleyAt) % 2 === 0 ? -1 : 1,
        chimney: i === 1 ? -1 : 1,
      });
      b.collider(w, D + JET, { at: [cx, 0, (ZF + ZB) / 2 + JET / 2] });
      x += w;
    });
    if (alleyAt === 3) alleyX = x + alley / 2;
    // the alley: a gate in a wall between the houses
    patch(b, alley, D, tint(P.cobble, 0.05), [alleyX, (ZF + ZB) / 2], 0.05);
    b.box(alley, 0.3, 0.3, oak, { at: [alleyX, 2.2, ZF - 0.1] });

    // the yard: the shared well, a pile of fleeces, a tenter frame of cloth drying, low walls
    well(b, 3.0, -5.6, P.pierreBlonde, roof);
    for (let k = 0; k <= 4; k++) b.box(0.1, 1.6, 0.1, oak, { at: [-10.0 + k * 1.6, 0, -6.8] });
    b.box(6.6, 0.07, 0.07, oak, { at: [-6.8, 1.55, -6.8] });
    b.box(6.6, 0.07, 0.07, oak, { at: [-6.8, 0.45, -6.8] });
    b.box(6.2, 1.0, 0.03, b.pick([P.limewash, P.voletBleu, P.terracottaPainted]), { at: [-6.8, 0.52, -6.75] });
    b.blob(0.6, P.limewash, { at: [9.4, 0.3, -5.4], stretch: [1.6, 0.6, 1.0], detail: 0 });
    b.box(25.6, 1.4, 0.3, P.pierreBlonde, { at: [0, 0, -7.75] });
    b.collider(25.6, 0.4, { at: [0, 0, -7.75] });
    b.collider(1.6, 1.6, { at: [3.0, 0, -5.6] });
  },
};
