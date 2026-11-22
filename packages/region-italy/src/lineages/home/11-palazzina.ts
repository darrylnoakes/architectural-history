import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { pave, pot } from './shared';

/** A French window with a roller shutter (tapparella) let down to `down` (0..1) of its height, on a front-facing wall. */
function tapparella(b: Builder, x: number, y: number, z: number, w: number, h: number, down: number, shutter: number, facing: '+z' | '-z' = '+z'): void {
  const s = facing === '+z' ? 1 : -1;
  b.window(w, h, { at: [x, y, z], facing, frame: P.aluminium, glass: P.glassDark, bars: [2, 1] });
  const hh = Math.max(0.15, h * down);
  b.panel(w - 0.06, hh, shutter, { at: [x, y + h - hh, z + s * 0.02], facing, depth: 0.1 });
  for (let v = y + h - 0.2; v > y + h - hh + 0.1; v -= 0.25) b.panel(w - 0.08, 0.025, tint(shutter, -0.12), { at: [x, v, z + s * 0.02], facing, depth: 0.12 });
  b.box(w + 0.1, 0.22, 0.2, tint(shutter, 0.08), { at: [x, y + h, z + s * 0.1] }); // the shutter box
}

export const palazzina: BuildingDef = {
  id: 'palazzina',
  name: 'Palazzina',
  style: 'Post-war, the economic miracle',
  date: 'c. 1962',
  summary:
    'In the boom years of the economic miracle the town spread over its hills in palazzine: blocks of five or six storeys with two or ' +
    'three flats to a landing, put up by small builders on single plots and sold flat by flat to families who, for the first time, could ' +
    'buy a home of their own. A reinforced-concrete frame infilled with hollow brick allows long strip balconies on every floor, faced in ' +
    'travertine or brown klinker tile; plastic roller shutters replace the old louvres, cars go in garages at street level, and the most ' +
    'expensive flat is the penthouse, set back behind a roof terrace.',
  materials: ['reinforced concrete frame', 'hollow clay block', 'travertine or klinker tile cladding', 'steel railings', 'aluminium windows', 'PVC roller shutters'],
  lookFor: [
    {
      label: 'Strip balconies',
      note: 'Concrete slabs run out from the frame along the whole front, one long balcony for each flat; the frame makes the cantilever easy.',
      at: [-5.2, 7.0, 8.7],
    },
    {
      label: 'Roller shutters',
      note: 'Tapparelle of plastic slats roll down from a box over each window, pulled by a strap inside the room.',
      at: [3.4, 11.4, 7.5],
    },
    {
      label: 'Cladding',
      note: 'The wall between the slabs is faced in thin slabs of travertine or in klinker, a hard brown ceramic tile that needs no painting.',
      at: [-6.2, 4.8, 7.45],
    },
    {
      label: 'Garages',
      note: 'Up-and-over metal doors at street level beside the glazed entrance hall: the Fiat 500 and 600 put a car within reach of the families who bought these flats.',
      at: [-4.35, 1.5, 7.5],
    },
    {
      label: 'Penthouse and roof terrace',
      note: 'The attico is set back from the front behind a terrace with planters and an awning: the flat everyone wanted.',
      at: [2.0, 16.2, 5.6],
    },
  ],
  build(b) {
    const W = 13.4;
    const X = W / 2;
    const zf = 7.4;
    const zb = -2.6;
    const D = zf - zb;
    const zc = (zf + zb) / 2;
    const fh = 3.0;
    const nF = 5; // ground (garages, hall) + 4 floors of flats
    const H = fh * nF;
    const klinker = b.chance(0.5);
    const clad = klinker ? tint(0x8a5a40, b.range(-0.04, 0.03)) : tint(P.travertine, b.range(-0.04, 0.0));
    const frame = P.concreteWhite;
    const render = tint(b.pick([P.cream, P.intonacoCream, 0xe8e0cc]), -0.02);
    const shutter = b.pick([0x6f7a6c, 0x8a8a80, 0x5d6b78, 0x9a8466]);
    const rail = b.pick([P.iron, 0x3a4a3a, P.steel]);

    // body and frame
    b.box(W, H, D, render, { at: [0, 0, zc] });
    b.box(W - 0.04, H - fh - 0.3, 0.06, clad, { at: [0, fh, zf + 0.01] });
    b.box(W - 0.04, H - fh - 0.3, 0.06, clad, { at: [0, fh, zb - 0.01] });
    b.box(W + 0.02, fh, D + 0.02, tint(P.concreteDark, 0.06), { at: [0, 0, zc] }); // ground floor in fair-faced concrete
    for (const x of [-X + 0.2, -2.25, 2.25, X - 0.2]) b.box(0.4, H, 0.12, frame, { at: [x, 0, zf + 0.06] }); // columns of the frame
    for (let f = 1; f < nF; f++) b.box(W, 0.3, 0.12, frame, { at: [0, f * fh - 0.15, zf + 0.06] });
    b.box(W + 0.02, 0.5, D + 0.02, frame, { at: [0, H - 0.1, zc] }); // roof slab edge
    // joints of the cladding slabs (or courses of the tiles)
    for (let y = fh + 0.6; y < H - 0.3; y += 0.6) b.box(W - 0.1, 0.025, 0.02, tint(clad, -0.12), { at: [0, y, zf + 0.04] });
    for (let y = fh + 0.6; y < H - 0.3; y += 0.6) b.box(W - 0.1, 0.025, 0.02, tint(clad, -0.12), { at: [0, y, zb - 0.04] });

    // ground floor: three garages and the glazed entrance hall
    for (const x of [-4.35, 0]) {
      b.panel(2.6, 2.3, tint(P.aluminium, -0.1), { at: [x, 0, zf], facing: '+z', depth: 0.06 });
      for (let v = 0.3; v < 2.3; v += 0.3) b.panel(2.5, 0.03, tint(P.aluminium, -0.25), { at: [x, v, zf], facing: '+z', depth: 0.08 });
    }
    b.window(2.6, 2.6, { at: [4.35, 0, zf], facing: '+z', frame: P.aluminium, glass: P.glassDark, bars: [3, 1] });
    b.box(3.2, 0.12, 1.6, frame, { at: [4.35, 2.7, zf + 0.8] }); // canopy over the door
    b.panel(0.6, 0.25, P.white, { at: [4.35, 2.95, zf + 1.6], facing: '+z', depth: 0.02 }); // house number
    pave(b, W, 1.6, P.concrete, [0, 0, zf + 0.8]);

    // upper floors: strip balconies across the front, French windows with roller shutters
    for (let f = 1; f < nF; f++) {
      const y = f * fh;
      b.box(W - 0.2, 0.2, 1.4, frame, { at: [0, y - 0.05, zf + 0.7] });
      // parapet: a solid band below, a light steel rail above
      b.box(W - 0.2, 0.45, 0.08, klinker ? frame : tint(clad, -0.03), { at: [0, y + 0.15, zf + 1.36] });
      b.box(W - 0.2, 0.05, 0.05, rail, { at: [0, y + 1.0, zf + 1.36] });
      b.box(W - 0.2, 0.04, 0.04, rail, { at: [0, y + 0.8, zf + 1.36] });
      for (const x of spread(14, -X + 0.2, X - 0.2)) b.box(0.04, 0.4, 0.04, rail, { at: [x, y + 0.6, zf + 1.36], jitter: false });
      const downs = [0.2 + ((f * 3) % 5) * 0.15, 0.15, 0.7, 0.35];
      [-4.6, -0.9, 3.4, 5.4].forEach((x, i) => {
        const w = i === 3 ? 1.2 : 1.8;
        tapparella(b, x, y + 0.25, zf, w, 2.3, downs[i], shutter);
      });
      // a planter and a deckchair here and there
      if (f % 2 === 1) pot(b, [-2.7, y + 0.15, zf + 0.9], 0.8, P.leaf);
      else b.box(0.6, 0.45, 1.0, P.cladYellow, { at: [1.2, y + 0.15, zf + 0.75], rot: [-0.3, 0, 0] });
    }

    // the set-back penthouse and its terrace
    const pz0 = zb + 0.5;
    const pz1 = zf - 2.4;
    b.box(W - 1.0, 2.9, pz1 - pz0, render, { at: [0, H + 0.4, (pz0 + pz1) / 2] });
    b.box(W - 0.6, 0.3, pz1 - pz0 + 0.6, frame, { at: [0, H + 3.3, (pz0 + pz1) / 2 + 0.1] });
    for (const x of [-4.0, 0.4, 4.0]) b.window(2.2, 2.3, { at: [x, H + 0.4, pz1], facing: '+z', frame: P.aluminium, glass: P.glassDark, bars: [2, 1] });
    // terrace: parapet, planters, a striped awning on a steel pergola
    b.box(W, 0.9, 0.12, frame, { at: [0, H + 0.4, zf - 0.06] });
    b.box(W - 1.0, 0.55, 0.5, tint(P.concrete, -0.05), { at: [0, H + 0.4, zf - 0.4] });
    for (const x of spread(7, -X + 1.0, X - 1.0)) b.blob(0.4, P.leafDark, { at: [x, H + 1.15, zf - 0.4], detail: 0 });
    for (const x of [0.2, 3.8]) b.box(0.08, 2.4, 0.08, P.steel, { at: [x, H + 0.4, zf - 1.0] });
    b.group({ at: [2.0, H + 2.8, (zf - 1.0 + pz1) / 2], rot: [0.12, 0, 0] }, () => {
      for (let i = 0; i < 6; i++) b.box(0.6, 0.04, 1.6, i % 2 ? P.white : 0x3f6f5a, { at: [-1.5 + i * 0.6, 0, 0] });
    });
    b.box(1.6, 0.4, 0.7, P.white, { at: [2.0, H + 0.4, pz1 + 1.0] }); // a garden table
    // TV aerials on the roof
    for (const [x, z] of [[-3.0, 0.5], [3.6, -0.6]] as [number, number][]) {
      b.cyl(0.03, 2.2, P.steel, { at: [x, H + 3.6, z], segs: 4 });
      for (const v of [1.4, 1.8, 2.1]) b.box(1.0 - v * 0.2, 0.03, 0.03, P.steel, { at: [x, H + 3.6 + v, z] });
    }
    b.box(1.4, 1.1, 1.0, render, { at: [-4.5, H + 3.6, -1.0] }); // stair and lift head

    // back: kitchen balconies, windows with shutters, a yard with parking and an umbrella pine
    for (let f = 1; f < nF; f++) {
      const y = f * fh;
      for (const x of [-4.0, 4.0]) {
        b.box(3.0, 0.18, 1.1, frame, { at: [x, y - 0.05, zb - 0.55] });
        b.box(3.0, 1.0, 0.08, frame, { at: [x, y + 0.13, zb - 1.06] });
        b.sym((s) => b.box(0.08, 1.0, 1.1, frame, { at: [x + s * 1.46, y + 0.13, zb - 0.55] }));
        tapparella(b, x - 0.5, y + 0.25, zb, 0.9, 2.2, 0.3, shutter, '-z');
      }
      tapparella(b, 0, y + 0.8, zb, 1.0, 1.4, 0.5, shutter, '-z');
      if (f === 2) b.box(2.2, 0.03, 0.03, P.white, { at: [4.0, y + 1.6, zb - 0.9] });
    }
    for (const x of [-4.5, 0]) b.panel(2.4, 2.2, tint(P.aluminium, -0.15), { at: [x, 0, zb], facing: '-z' });
    pave(b, W, 6.0, tint(P.concrete, -0.05), [0, 0, -5.8]);
    for (const x of [-4.0, -1.0, 2.0]) b.box(0.08, 0.02, 4.5, P.white, { at: [x, 0.05, -6.0] });
    b.tree(b.range(6.8, 7.4), { at: [3.4, 0, -5.8], kind: 'pine' });
    // a small car (Fiat 600-ish) parked behind
    b.group({ at: [-3.6, 0, -6.4] }, () => {
      b.box(1.4, 0.7, 3.2, b.pick([0x9fb8c8, P.cream, 0xb5523e]), { at: [0, 0.25, 0] });
      b.box(1.3, 0.55, 1.6, P.glassDark, { at: [0, 0.95, -0.2] });
      for (const [x, z] of [[-0.65, -1.0], [0.65, -1.0], [-0.65, 1.0], [0.65, 1.0]]) b.log(0.24, 0.2, P.black, { at: [x, 0, z], segs: 8 });
    });
    // boundary
    b.box(W, 1.0, 0.25, P.concrete, { at: [0, 0, -8.75] });
    b.sym((s) => b.box(0.25, 1.0, 6.0, P.concrete, { at: [s * (X - 0.12), 0, -5.8] }));
  },
};
