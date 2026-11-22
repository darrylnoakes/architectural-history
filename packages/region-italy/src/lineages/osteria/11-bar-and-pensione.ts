import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { cafeTable, ground, umbrella, word } from './shared';

const X0 = -8.6;
const X1 = 6.4;
const ZF = 7.0; // street face of the block
const ZB = -3.6;
const G = 3.8; // the bar
const F = 3.0; // pensione floors
const NF = 3;
const TOP = G + F * NF;

/** A Fiat 500 (1957), front toward local +X. */
function fiat500(b: Builder, at: [number, number, number], rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    b.box(2.95, 0.6, 1.3, color, { at: [0, 0.25, 0] });
    b.box(1.6, 0.5, 1.2, color, { at: [-0.25, 0.85, 0] });
    b.box(1.4, 0.36, 1.24, P.windowDark, { at: [-0.25, 0.92, 0] });
    b.box(1.0, 0.04, 1.0, P.black, { at: [-0.3, 1.36, 0] });
    b.sym((s) => {
      b.sphere(0.09, P.windowLit, { at: [1.45, 0.65, s * 0.45], segs: 6 });
      for (const x of [0.95, -0.95]) b.log(0.26, 0.16, P.timberBlack, { at: [x, 0, s * 0.6], axis: 'z', segs: 10 });
    });
    b.box(0.05, 0.08, 1.3, P.aluminium, { at: [1.48, 0.35, 0] });
  });
}

/** A Vespa scooter, front toward local +X. */
function vespa(b: Builder, at: [number, number, number], rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    b.box(0.9, 0.45, 0.5, color, { at: [-0.35, 0.25, 0] });
    b.box(0.4, 0.12, 0.3, P.black, { at: [-0.35, 0.7, 0] });
    b.box(0.5, 0.06, 0.3, color, { at: [0.25, 0.22, 0] });
    b.box(0.12, 0.8, 0.4, color, { at: [0.55, 0.2, 0] });
    b.box(0.08, 0.05, 0.65, P.aluminium, { at: [0.58, 1.0, 0] });
    for (const x of [-0.5, 0.6]) b.log(0.18, 0.1, P.timberBlack, { at: [x, 0, 0], axis: 'z', segs: 8 });
  });
}

export const barAndPensione: BuildingDef = {
  id: 'bar-and-pensione',
  name: 'Bar and pensione',
  style: 'Post-war modern',
  date: 'c. 1958',
  summary:
    'In the years of the economic miracle the town spreads into new quarters, and the bar becomes the place everyone meets: coffee from a lever espresso machine drunk standing at the counter, an aperitivo, the football on the television, ice cream in summer. ' +
    'Above it a family runs a pensione of a few rooms for commercial travellers and the first tourists to arrive by train, Vespa or Fiat 500. ' +
    'The building is a reinforced-concrete frame filled with brick and rendered, with strip balconies, roller shutters and a flat roof; at street level an aluminium-framed shopfront under a thin concrete canopy and a red neon sign.',
  materials: ['reinforced concrete frame', 'hollow clay brick', 'render', 'anodised aluminium', 'terrazzo', 'neon'],
  lookFor: [
    { label: 'Neon sign', note: 'Red glass tubes spelling BAR along the canopy edge, lit at dusk: the new signal of a place to drink, where once a branch was hung out.', at: [-3.4, G + 0.3, ZF + 1.6] },
    { label: 'Aluminium shopfront', note: 'Big panes of glass in thin anodised aluminium frames, with doors that fold back on summer evenings.', at: [-1.0, 1.6, ZF + 0.1] },
    { label: 'Tapparelle', note: 'Roller shutters of wooden or plastic slats, pulled up and down by a strap inside: they replaced the old louvred persiane in new buildings.', at: [X1 - 1.6, G + 1.5, ZF + 1.1] },
    { label: 'Strip balconies', note: 'Long thin concrete balconies with metal railings run across the front of each floor of the pensione.', at: [X0 + 2.0, G + F + 0.6, ZF + 1.2] },
    { label: 'Fiat 500', note: 'The Nuova 500 of 1957 and the Vespa of 1946 put Italy on wheels, and brought custom to roadside bars and pensioni.', at: [8.3, 1.4, 4.2] },
  ],
  build(b) {
    const render = b.pick([P.intonacoCream, P.intonacoRose, tint(P.pinkWash, 0.05)]);
    const clad = b.pick([P.travertine, P.paving]);
    const frame = P.concreteWhite;
    const shutter = b.pick([P.cladWhite, P.cladGrey, tint(P.cladGreen, 0.1)]);
    const neon = P.cladRed;
    const xm = (X0 + X1) / 2;
    const zm = (ZF + ZB) / 2;
    const w = X1 - X0;

    ground(b, 21.6, 4.0, P.paving, [0, 9.0], 0.12);
    ground(b, 3.6, 18, P.tarmac, [8.6, 0], 0.03);
    ground(b, w, ZB + 10.6, P.concrete, [xm, (ZB - 10.6) / 2], 0.04);

    // ---------------- the block: ground floor bar, three floors of pensione
    b.box(w, G, ZF - ZB - 0.4, render, { at: [xm, 0, zm - 0.2] });
    b.box(w, F * NF, ZF - ZB, render, { at: [xm, G, zm] });
    // exposed frame: floor slab edges and corner columns
    for (let f = 0; f <= NF; f++) b.box(w + 0.1, 0.22, ZF - ZB + 0.1, frame, { at: [xm, G + f * F - 0.11, zm] });
    b.sym((s) => b.box(0.35, TOP, 0.35, frame, { at: [s > 0 ? X1 - 0.12 : X0 + 0.12, 0, ZF - 0.12] }));
    // the shopfront: travertine piers, aluminium frames, glass
    b.box(w, G, 0.1, clad, { at: [xm, 0, ZF - 0.35] });
    const sx0 = X0 + 0.8;
    const sx1 = X1 - 2.6;
    b.box(sx1 - sx0, 2.9, 0.08, P.glassDark, { at: [(sx0 + sx1) / 2, 0.3, ZF - 0.25], mat: 'glass' });
    for (const x of spread(6, sx0, sx1).map((x) => x - (sx1 - sx0) / 12).concat([sx1])) b.box(0.08, 2.9, 0.12, P.aluminium, { at: [x, 0.3, ZF - 0.22] });
    b.box(sx1 - sx0, 0.08, 0.14, P.aluminium, { at: [(sx0 + sx1) / 2, 3.15, ZF - 0.22] });
    b.box(sx1 - sx0, 0.3, 0.14, P.aluminium, { at: [(sx0 + sx1) / 2, 0.0, ZF - 0.22] });
    // inside: the counter and the espresso machine, seen through the glass
    b.box(4.0, 1.05, 0.7, P.marble, { at: [-4.6, 0, ZF - 1.6] });
    b.box(4.0, 0.06, 0.8, P.aluminium, { at: [-4.6, 1.05, ZF - 1.6] });
    b.box(0.9, 0.55, 0.45, P.steel, { at: [-5.6, 1.11, ZF - 1.75] });
    b.sphere(0.2, P.aluminium, { at: [-5.6, 1.86, ZF - 1.75], segs: 6 });
    // the pensione door, with a small plaque
    b.box(1.2, 2.5, 0.1, P.aluminium, { at: [X1 - 1.4, 0, ZF - 0.28] });
    b.box(1.0, 2.3, 0.1, P.glassDark, { at: [X1 - 1.4, 0.1, ZF - 0.25], mat: 'glass' });
    // the cantilevered concrete canopy with the neon sign on its edge
    b.box(w + 0.4, 0.16, 1.9, frame, { at: [xm, G - 0.3, ZF + 0.9] });
    word(b, 'BAR', 0.16, neon, { at: [-3.4, G - 0.36, ZF + 1.86], facing: '+z', depth: 0.08, mat: 'glass' });
    word(b, 'CAFFE', 0.07, P.doorBlue, { at: [1.4, G - 0.26, ZF + 1.86], facing: '+z' });
    // a projecting blade sign for the pensione
    b.group({ at: [X1 - 0.3, G + 0.4, ZF + 0.05] }, () => {
      b.box(0.12, 2.8, 1.3, P.white, { at: [0, 0, 0.75] });
      b.box(0.04, 0.08, 0.5, P.aluminium, { at: [0, 0.5, 0.0] });
      for (const s of [1, -1]) word(b, 'PENSIONE', 0.07, P.doorBlue, { at: [s * 0.07, 1.2, 0.75], facing: s > 0 ? '+x' : '-x' });
      for (const s of [1, -1]) b.box(0.02, 0.5, 0.9, neon, { at: [s * 0.07, 0.4, 0.75], mat: 'glass' });
    });

    // ---------------- pensione floors: strip balconies, windows with roller shutters
    const winXs = spread(5, X0 + 0.4, X1 - 0.4);
    for (let f = 0; f < NF; f++) {
      const y = G + f * F;
      b.box(w - 1.0, 0.14, 1.1, frame, { at: [xm - 0.2, y + 0.02, ZF + 0.55] });
      b.box(w - 1.0, 0.05, 0.05, P.castIron, { at: [xm - 0.2, y + 1.05, ZF + 1.08] });
      for (const x of spread(Math.round((w - 1) / 0.35), X0 + 0.4, X1 - 1.4)) b.box(0.025, 0.9, 0.025, P.castIron, { at: [x, y + 0.16, ZF + 1.08], jitter: false });
      winXs.forEach((x, i) => {
        const door = i % 2 === 0;
        const wh = door ? 2.2 : 1.4;
        const wy = door ? y + 0.15 : y + 0.95;
        const down = b.range(0.1, 0.8);
        b.window(1.2, wh, { at: [x, wy, ZF], facing: '+z', frame: P.white, border: 0.07, bars: [2, 1] });
        b.panel(1.2, wh * down, shutter, { at: [x, wy + wh * (1 - down), ZF], facing: '+z', depth: 0.1 });
        b.panel(1.3, 0.3, render, { at: [x, wy + wh, ZF], facing: '+z', depth: 0.14 });
        b.window(1.0, 1.4, { at: [x, y + 0.95, ZB], facing: '-z', frame: P.white, border: 0.07, bars: [2, 1] });
        b.panel(1.0, 1.4 * down, shutter, { at: [x, y + 0.95 + 1.4 * (1 - down), ZB], facing: '-z', depth: 0.1 });
      });
      b.sym((s) => b.window(0.8, 1.2, { at: [s > 0 ? X1 : X0, y + 1.0, zm], facing: s > 0 ? '+x' : '-x', frame: P.white, border: 0.07 }));
    }
    // flat roof: parapet, stair housing, water tank and television aerials
    b.box(w + 0.1, 0.5, ZF - ZB + 0.1, frame, { at: [xm, TOP, zm] });
    b.box(w - 0.4, 0.06, ZF - ZB - 0.4, P.concreteDark, { at: [xm, TOP + 0.4, zm], jitter: false });
    b.box(3.0, 2.4, 2.6, render, { at: [X0 + 2.0, TOP, ZB + 1.6] });
    b.box(3.2, 0.15, 2.8, frame, { at: [X0 + 2.0, TOP + 2.4, ZB + 1.6] });
    b.cyl(0.6, 1.2, P.concrete, { at: [X1 - 1.6, TOP + 0.4, ZB + 1.4], segs: 8 });
    for (const [x, z] of [[-2.0, 1.0], [2.0, 3.0]] as const) {
      b.cyl(0.03, 2.4, P.steel, { at: [x, TOP + 0.4, z], segs: 4 });
      for (const y of [1.6, 2.0, 2.3]) b.box(1.2, 0.03, 0.03, P.steel, { at: [x, TOP + 0.4 + y, z] });
    }
    // washing on lines between the back balconies
    b.box(w - 1, 0.12, 0.9, frame, { at: [xm, G + F, ZB - 0.45] });
    b.box(w - 2, 0.02, 0.02, P.white, { at: [xm, G + F + 1.4, ZB - 0.7] });
    for (const x of spread(6, X0 + 1.5, X1 - 1.5)) b.box(0.5, 0.6, 0.02, b.pick([P.white, P.cladBlue, P.cladYellow, P.pinkWash]), { at: [x, G + F + 0.8, ZB - 0.7] });

    // ---------------- outside: tables under red umbrellas, a Vespa, a Fiat 500
    for (const x of [-6.6, -3.4, -0.2]) {
      cafeTable(b, [x, 0.12, 9.6], P.white, P.cladRed, 3);
      umbrella(b, [x, 0.12, 9.6], 2.4, P.cladRed);
    }
    vespa(b, [3.6, 0.12, 9.9], 0.2, P.copperGreen);
    fiat500(b, [8.5, 0.03, 4.2], Math.PI / 2, b.pick([P.cream, P.cladBlue, P.doorYellow]));
    // the back yard: a garage and a pergola
    b.box(4.0, 2.6, 4.0, render, { at: [X0 + 2.2, 0, -8.4] });
    b.box(4.2, 0.15, 4.2, frame, { at: [X0 + 2.2, 2.6, -8.4] });
    b.panel(2.6, 2.2, P.aluminium, { at: [X0 + 2.2, 0, -6.4], facing: '+z' });
    for (const [x, z] of [[0, -5.0], [4.0, -5.0], [0, -8.6], [4.0, -8.6]] as const) b.box(0.12, 2.5, 0.12, P.castIron, { at: [x, 0, z] });
    for (const z of spread(6, -8.6, -5.0)) b.box(4.2, 0.06, 0.08, P.castIron, { at: [2.0, 2.5, z] });
    b.blob(1.4, P.leaf, { at: [2.0, 2.7, -6.8], stretch: [1.5, 0.3, 1.3], detail: 0 });
    for (const [x, z] of [[1.0, -6.2], [3.0, -7.4]] as const) cafeTable(b, [x, 0.04, z], P.white, P.aluminium, 2);

    b.collider(w, ZF - ZB, { at: [xm, 0, zm] });
    b.collider(4.0, 4.0, { at: [X0 + 2.2, 0, -8.4] });
  },
};

void ({} as Builder);
