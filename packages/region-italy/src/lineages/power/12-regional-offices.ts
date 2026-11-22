import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { MON, PAL, PORTAL_X, brickSquare, kingMonument, lordsColliders, lordsCourt, palaceColliders, palazzoPubblico, pave } from './shared';

/** The regional office block in zone C. */
const RO = { x0: 7.5, x1: 20.5, z0: -18, z1: 5, piloti: 4, f: 3.3, floors: 4 };

/** A small low-poly car of the 1970s. */
function car(b: Builder, x: number, z: number, rotY: number, color: number): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    b.box(1.55, 0.65, 3.6, color, { at: [0, 0.3, 0] });
    b.box(1.4, 0.5, 1.9, tint(color, 0.05), { at: [0, 0.95, -0.15] });
    b.box(1.42, 0.38, 1.7, P.glassDark, { at: [0, 1.0, -0.15], mat: 'glass', jitter: false });
    for (const sx of [-1, 1]) for (const sz of [-1.1, 1.1]) b.box(0.2, 0.55, 0.55, P.black, { at: [sx * 0.72, 0.03, sz], jitter: false });
  });
}

export const regionalOffices: BuildingDef = {
  id: 'regional-offices',
  name: 'Regional government offices',
  style: 'Late Modernist, exposed concrete',
  date: 'c. 1975',
  summary:
    'The Constitution of 1948 promised Italy elected regional governments, but the ordinary regions were only set up in 1970, and they needed offices fast. ' +
    'They are built in exposed concrete: a block of four office floors raised on columns over an open, glazed ground floor, with continuous bands of window shaded by concrete fins (new). ' +
    'The medieval palace stays the town hall of the commune, again run by an elected council and mayor (old), while the square in front has become a car park round the king’s statue.',
  materials: ['reinforced concrete', 'bush-hammered concrete panels', 'aluminium windows', 'glass'],
  lookFor: [
    { label: 'Pilotis', note: 'The office floors stand on a row of concrete columns, leaving a covered space and a glass entrance hall beneath.', at: [RO.x1 - 0.6, 2.4, RO.z1 - 3] },
    { label: 'Ribbon windows and sun fins', note: 'Each floor is a continuous band of glass between concrete spandrels, shaded by upright concrete fins.', at: [RO.x1 + 0.6, 8.8, -6] },
    { label: 'Stair and lift tower', note: 'A windowless concrete shaft holding the stairs, lift and services, set against the block like a tower.', at: [RO.x0 + 2, 15, RO.z0 - 0.5] },
    { label: 'Car park in the square', note: 'In the boom years the old square filled with parked cars; they would be cleared only decades later.', at: [-12, 1.8, 14] },
    { label: 'The old palace, kept', note: 'The Palazzo Pubblico still houses the comune, the town council, under its medieval tower.', at: [PORTAL_X, 21.5, PAL.zf + 0.6] },
  ],
  build(b) {
    palazzoPubblico(b, { stage: 1975 });
    lordsCourt(b);
    brickSquare(b, -21.5, 21.5, PAL.zf, 21.5);
    // tarmac laid over the brick for the car park
    pave(b, 34, 11, -4.5, 15.6, mix(P.tarmac, P.cobble, 0.35), 0.03);
    for (const x of spread(10, -20, 10)) b.box(0.1, 0.1, 4, P.white, { at: [x, 0.03, 18.5], jitter: false });
    kingMonument(b);
    const colours = [0xe0e0d8, 0xc23b2e, 0x3f6f9c, 0xd8a93a, 0x5c8f6a, 0x8a8f94, 0xe0e0d8, 0x9c6b3e];
    spread(8, -18.6, 8.6).forEach((x, i) => {
      if (Math.abs(x - MON[0]) < 3.4) return;
      car(b, x, 18.6, i % 2 ? 0.05 : -0.04, colours[i]);
    });
    car(b, -14, 11.6, Math.PI / 2, colours[3]);

    const { x0, x1, z0, z1, piloti, f, floors } = RO;
    const W = x1 - x0;
    const D = z1 - z0;
    const xc = (x0 + x1) / 2;
    const zc = (z0 + z1) / 2;
    const conc = P.concrete;
    const H = piloti + f * floors;
    // pilotis and the recessed glass ground floor
    for (const x of [x0 + 0.6, x1 - 0.6]) for (const z of spread(5, z0 + 0.6, z1 - 0.6)) b.box(0.7, piloti, 0.7, tint(conc, -0.04), { at: [x, 0, z] });
    b.box(W - 4, piloti - 0.2, D - 4, mix(P.glassDark, P.glass, 0.3), { at: [xc, 0, zc], mat: 'glass' });
    // the office floors: spandrel bands and ribbon windows
    for (let i = 0; i < floors; i++) {
      const y = piloti + i * f;
      b.box(W, 1.2, D, conc, { at: [xc, y, zc] });
      b.box(W - 0.3, f - 1.2, D - 0.3, P.glassDark, { at: [xc, y + 1.2, zc], mat: 'glass' });
    }
    b.box(W + 0.3, 1.0, D + 0.3, tint(conc, -0.05), { at: [xc, H, zc] });
    // upright sun fins on the long street side and the front
    for (const z of spread(12, z0 + 0.6, z1 - 0.6)) b.box(0.6, H - piloti, 0.18, tint(conc, 0.04), { at: [x1 + 0.3, piloti, z], jitter: false });
    for (const x of spread(6, x0 + 0.6, x1 - 0.6)) b.box(0.18, H - piloti, 0.6, tint(conc, 0.04), { at: [x, piloti, z1 + 0.3], jitter: false });
    // the stair and lift tower at the back, and plant on the roof
    b.box(4, H + 3, 4, tint(conc, -0.06), { at: [x0 + 2, 0, z0 - 1] });
    b.box(5, 2, 3.5, tint(conc, -0.03), { at: [xc + 2, H + 1, zc] });
    for (const z of spread(3, zc - 6, zc + 6)) b.cyl(0.25, 3, P.steel, { at: [x1 - 2, H + 1, z], segs: 6 });
    // a sign over the entrance
    b.box(5, 0.6, 0.1, P.cladBlue, { at: [xc, piloti - 0.8, z1 + 0.05], jitter: false });

    palaceColliders(b, true);
    lordsColliders(b);
    for (const x of [x0 + 0.6, x1 - 0.6]) for (const z of spread(5, z0 + 0.6, z1 - 0.6)) b.collider(0.8, 0.8, { at: [x, 0, z] });
    b.collider(W - 4, D - 4, { at: [xc, 0, zc] });
    b.collider(4, 4, { at: [x0 + 2, 0, z0 - 1] });
  },
};
