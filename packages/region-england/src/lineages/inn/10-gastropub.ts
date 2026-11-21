import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { BAR, FLAT, estateShell, fasciaBand } from './09-estate-pub';
import { car, ground, pole } from './shared';

const EZ1 = 3.4; // front of the new extensions
const BREW = { x0: 0.4, x1: 5.6 }; // the brewhouse
const DINE = { x0: -10, x1: -0.2 }; // the glazed dining room

/** A conical-bottomed stainless fermenter on legs, `h` tall overall. */
function fermenter(b: Builder, at: [number, number, number], r: number, h: number) {
  b.group({ at }, () => {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      b.cyl(0.04, 0.9, P.steel, { at: [Math.sin(a) * r * 0.8, 0, Math.cos(a) * r * 0.8], segs: 4 });
    }
    b.lathe(
      [[0.05, 0.5], [r, 1.1], [r, h - 0.4], [r * 0.85, h - 0.15], [0.1, h]],
      P.aluminium,
      { segs: 12, mat: 'glass' },
    );
    b.cyl(0.08, 0.3, P.steel, { at: [0, h - 0.05, 0], segs: 6 });
  });
}

/** A run of glazing: dark-framed glass with mullions every ~1.2 m. Local X along, facing local +Z. */
function glazing(b: Builder, len: number, h: number, frame: number, open = false) {
  const n = Math.max(2, Math.round(len / 1.2));
  if (!open) b.box(len, h, 0.04, P.glassDark, { at: [0, 0, 0], mat: 'glass' });
  for (const x of spread(n + 1, -len / 2, len / 2)) b.box(0.08, h, 0.14, frame, { at: [x, 0, 0] });
  b.box(len, 0.1, 0.14, frame, { at: [0, 0, 0] });
  b.box(len, 0.14, 0.16, frame, { at: [0, h - 0.14, 0] });
  if (open) b.box(len, 0.06, 0.12, frame, { at: [0, 2.3, 0] });
}

export const gastropub: BuildingDef = {
  id: 'gastropub',
  name: 'Gastropub and microbrewery',
  style: 'Contemporary',
  date: 'c. 2012',
  summary:
    'Thousands of pubs closed in the 2000s, undercut by supermarket beer and hit by the smoking ban. This one survived by changing trade: food first, and beer brewed on the premises, helped by the lower duty for small brewers introduced in 2002. ' +
    'The 1960s brick shell is kept, painted and reclad, and the car park has become a terrace. ' +
    'A glazed dining room and a glass-fronted brewhouse put the cooking and the brewing on show, as brewing was in the medieval alehouse.',
  materials: ['painted brick', 'larch cladding', 'powder-coated aluminium glazing', 'zinc', 'stainless steel'],
  lookFor: [
    { label: 'Brewing tanks', note: 'Stainless-steel fermenters behind glass. Brewing on the premises has returned after a century of beer from big breweries.', at: [3.0, 2.6, EZ1 + 0.3] },
    { label: 'Glazed extension', note: 'A dining room walled in glass, added to the old brick box and kept clearly distinct from it.', at: [-5, 2.0, EZ1 + 0.2] },
    { label: 'Retained 1960s shell', note: 'The flat-roofed brick pub of 1968 is still here, painted and reclad rather than demolished.', at: [-6.5, 3.6, BAR.z1 + 0.15] },
    { label: 'Terrace', note: 'Decking, parasols and festoon lights where cars used to park. After the 2007 smoking ban outdoor space became essential.', at: [-3, 1.2, 6.2] },
    { label: 'Timber cladding', note: 'Untreated larch boards over the old flat, left to weather to silver-grey.', at: [FLAT.x1 + 0.1, 5.0, -6] },
  ],
  build(b) {
    const paint = b.pick([P.cladGrey, tint(P.cladGrey, -0.08), P.doorGreen]);
    const frame = b.pick([P.timberBlack, P.cladGrey]);
    const larch = b.pick([P.larch, P.oakSilver]);
    const zinc = P.zinc;
    const deck = P.cedar;

    // ground: paving round the building, decking terrace, a short row of parking at the street
    ground(b, 22, 22, P.paving, [0, 0]);
    ground(b, 20.4, 4.6, deck, [-0.6, 5.8], 0.15);
    ground(b, 22, 2.8, P.tarmac, [0, 9.6], 0.05);

    // ---------------- the retained 1968 shell, painted, with a slim zinc coping
    estateShell(b, paint, P.asphalt);
    fasciaBand(b, BAR, BAR.h, 0.35, 0.08, zinc);
    // the flat is wrapped in vertical larch boards
    const f = FLAT;
    const fx = (f.x0 + f.x1) / 2;
    const fz = (f.z0 + f.z1) / 2;
    b.box(f.x1 - f.x0 + 0.16, f.h - 3.6, f.z1 - f.z0 + 0.16, larch, { at: [fx, 3.6, fz] });
    for (const z of spread(18, f.z0, f.z1)) b.box(0.04, f.h - 3.6, 0.05, tint(larch, -0.12), { at: [f.x1 + 0.1, 3.6, z], jitter: false });
    for (const x of spread(12, f.x0, f.x1)) b.box(0.05, f.h - 3.6, 0.04, tint(larch, -0.12), { at: [x, 3.6, f.z1 + 0.1], jitter: false });
    fasciaBand(b, FLAT, f.h, 0.3, 0.1, zinc);
    b.window(1.4, 1.6, { at: [fx, 4.1, f.z1 + 0.08], facing: '+z', frame, border: 0.06 });
    b.window(1.4, 1.6, { at: [f.x1 + 0.08, 4.1, -6.4], facing: '+x', frame, border: 0.06 });
    b.window(2.0, 1.0, { at: [fx, 4.3, f.z0 - 0.08], facing: '-z', frame, border: 0.06 });
    // solar panels on the flat roof
    for (const x of [-7.5, -4.5, -1.5]) {
      b.box(2.6, 0.06, 1.6, P.solar, { at: [x, BAR.h + 0.5, -6.0], rot: [-0.3, 0, 0], mat: 'glass' });
      b.box(0.08, 0.5, 0.08, P.steel, { at: [x, BAR.h, -5.6] });
    }
    // back of the shell: kitchen door, extract duct, bins
    b.panel(1.0, 2.1, frame, { at: [-3, 0, BAR.z0], facing: '-z' });
    b.box(0.5, 0.5, 2.2, P.steel, { at: [-6, BAR.h - 0.6, BAR.z0 - 0.3] });
    b.box(0.5, 1.6, 0.5, P.steel, { at: [-6, BAR.h - 0.6, BAR.z0 - 1.2] });
    for (const x of [-9, -8.1]) b.box(0.7, 1.2, 0.8, P.cladGreen, { at: [x, 0, BAR.z0 - 0.7] });
    for (const x of [-8, -5, -2, 1]) b.window(1.8, 0.6, { at: [x, 2.2, BAR.z0], facing: '-z', frame, border: 0.05 });

    // ---------------- glazed dining room in front of the bar
    const dz0 = BAR.z1;
    const dd = EZ1 - dz0;
    const dx = (DINE.x0 + DINE.x1) / 2;
    const dw = DINE.x1 - DINE.x0;
    const dh = 3.2;
    b.box(dw, 0.15, dd, P.concrete, { at: [dx, 0, dz0 + dd / 2] });
    b.group({ at: [dx, 0.15, EZ1] }, () => glazing(b, dw, dh - 0.15, frame));
    b.group({ at: [DINE.x0, 0.15, dz0 + dd / 2], rotY: -Math.PI / 2 }, () => glazing(b, dd, dh - 0.15, frame));
    b.group({ at: [DINE.x1, 0.15, dz0 + dd / 2], rotY: Math.PI / 2 }, () => glazing(b, dd, dh - 0.15, frame));
    b.box(dw + 0.3, 0.3, dd + 0.3, frame, { at: [dx, dh, dz0 + dd / 2] });
    b.box(dw, 0.05, dd, P.turf, { at: [dx, dh + 0.3, dz0 + dd / 2] }); // sedum roof
    // pendant lamps and tables seen through the glass
    for (const x of spread(4, DINE.x0 + 1.4, DINE.x1 - 1.4)) b.sphere(0.18, P.windowLit, { at: [x, dh - 0.7, dz0 + dd / 2 + 0.6], segs: 6 });

    // ---------------- the brewhouse: a glass-fronted box with fermenters on show
    const bx = (BREW.x0 + BREW.x1) / 2;
    const bw = BREW.x1 - BREW.x0;
    const bh = 4.4;
    b.box(bw, 0.15, dd, P.concrete, { at: [bx, 0, dz0 + dd / 2] });
    // the glass is drawn as frame only on the front so the tanks read from outside
    b.group({ at: [bx, 0.15, EZ1] }, () => glazing(b, bw, bh - 0.15, frame, true));
    b.group({ at: [BREW.x0, 0.15, dz0 + dd / 2], rotY: -Math.PI / 2 }, () => glazing(b, dd, bh - 0.15, frame));
    b.box(0.25, bh, dd, frame, { at: [BREW.x1 - 0.12, 0, dz0 + dd / 2] });
    b.box(bw + 0.3, 0.35, dd + 0.3, zinc, { at: [bx, bh, dz0 + dd / 2] });
    b.box(bw - 0.3, 0.05, dd - 0.6, P.concreteWhite, { at: [bx, 0.15, dz0 + dd / 2] });
    fermenter(b, [BREW.x0 + 1.0, 0.15, dz0 + 2.4], 0.6, 3.4);
    fermenter(b, [bx, 0.15, dz0 + 2.4], 0.6, 3.4);
    fermenter(b, [BREW.x1 - 1.1, 0.15, dz0 + 2.4], 0.6, 3.4);
    b.cyl(0.75, 2.0, P.copperGreen, { at: [bx, 0.15, dz0 + 0.9], segs: 12 }); // the brew kettle at the back
    b.cyl(0.18, 2.6, P.steel, { at: [bx, 2.15, dz0 + 0.9], segs: 8 });
    b.cyl(0.2, 1.2, P.steel, { at: [bx, bh + 0.35, dz0 + 0.9], segs: 8 });
    b.cyl(0.3, 0.12, P.steel, { at: [bx, bh + 1.55, dz0 + 0.9], segs: 8 });
    b.box(bw - 0.4, 0.06, 0.06, P.steel, { at: [bx, 3.7, dz0 + 1.8] });
    // brewery name on the zinc
    for (const x of spread(6, BREW.x0 + 0.8, BREW.x1 - 0.8)) b.panel(0.3, 0.22, P.white, { at: [x, bh + 0.06, EZ1 + 0.16], facing: '+z', depth: 0.03 });

    // ---------------- terrace furniture: picnic benches, parasols, planters, festoon lights
    const bench = (x: number, z: number, r: number) =>
      b.group({ at: [x, 0.15, z], rotY: r }, () => {
        b.box(1.8, 0.06, 0.75, P.pine, { at: [0, 0.72, 0] });
        b.sym((s) => b.box(1.8, 0.05, 0.28, P.pine, { at: [0, 0.42, s * 0.62] }));
        b.sym((s) => {
          b.box(0.06, 0.78, 0.06, tint(P.pine, -0.1), { at: [s * 0.7, 0, 0.45], rot: [-0.55, 0, 0] });
          b.box(0.06, 0.78, 0.06, tint(P.pine, -0.1), { at: [s * 0.7, 0, -0.45], rot: [0.55, 0, 0] });
        });
      });
    const parasol = (x: number, z: number, c: number) => {
      b.cyl(0.04, 2.4, P.white, { at: [x, 0.15, z], segs: 5 });
      b.cone(1.4, 0.5, c, { at: [x, 2.2, z], segs: 8 });
    };
    const pc = b.pick([P.cream, P.cladGreen, tint(P.cream, -0.08)]);
    for (const [x, z, r] of [[-8, 5.2, 0], [-4.6, 6.6, 0.1], [-1.2, 5.0, -0.05], [2.4, 6.6, 0], [5.8, 5.4, 0.08]] as const) {
      bench(x, z, r);
      parasol(x, z, pc);
    }
    // planters with grasses edging the terrace
    for (const x of spread(6, -9.6, 8.6)) {
      b.box(1.6, 0.6, 0.6, P.cedar, { at: [x, 0.15, 8.0] });
      b.tree(0.8, { at: [x, 0.75, 8.0], kind: 'bush', color: P.grassDry });
    }
    // festoon lights strung between poles
    const poles: [number, number][] = [[-10, 3.8], [-3.4, 8.1], [3.4, 3.8], [9.6, 8.1]];
    for (const [x, z] of poles) b.cyl(0.05, 3.0, P.timberBlack, { at: [x, 0.15, z], segs: 5 });
    for (let i = 0; i < poles.length - 1; i++) {
      const [ax, az] = poles[i];
      const [cx, cz] = poles[i + 1];
      pole(b, [ax, 3.1, az], [cx, 3.1, cz], 0.012, P.black, 3);
      for (let k = 1; k < 7; k++) {
        const t = k / 7;
        const sag = Math.sin(t * Math.PI) * 0.35;
        b.sphere(0.07, P.windowLit, { at: [ax + (cx - ax) * t, 3.0 - sag, az + (cz - az) * t], segs: 4 });
      }
    }
    // A-board, bike stands, a car at the kerb
    b.group({ at: [-1.0, 0, 10.6] }, () => {
      b.box(0.7, 1.0, 0.05, P.timberBlack, { at: [0, 0, 0.2], rot: [-0.2, 0, 0] });
      b.box(0.7, 1.0, 0.05, P.timberBlack, { at: [0, 0, -0.2], rot: [0.2, 0, 0] });
    });
    for (const x of [6.8, 7.6, 8.4]) {
      b.box(0.06, 0.8, 0.7, P.steel, { at: [x, 0, 9.8] });
    }
    car(b, [-6.2, 0, 9.9], 0, b.pick([P.white, P.cladBlue, P.zinc]), 2012);
    b.tree(5.5, { at: [8.3, 0, 4.6], kind: 'round' });

    // ---------------- colliders: building and extensions solid, terrace open
    b.collider(BAR.x1 - BAR.x0, BAR.z1 - BAR.z0, { at: [(BAR.x0 + BAR.x1) / 2, 0, (BAR.z0 + BAR.z1) / 2] });
    b.collider(f.x1 - f.x0, f.z1 - f.z0, { at: [fx, 0, fz] });
    b.collider(dw, dd, { at: [dx, 0, dz0 + dd / 2] });
    b.collider(bw, dd, { at: [bx, 0, dz0 + dd / 2] });
  },
};
