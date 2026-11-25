import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { arcade, archRing, earthSquare, corbels, flatArch, pave, squareWell } from './shared';

/** A round-arched three-light window: a white stone arch round three lights on two colonnettes. */
function roundTrifora(b: Builder, at: [number, number, number], rotY: number, w = 2.4, h = 2.9): void {
  b.group({ at, rotY }, () => {
    flatArch(b, w + 0.4, h + 0.3, P.marble, { shape: 'round', off: 0.05, n: 3 });
    const lw = (w - 0.4) / 3;
    for (const i of [-1, 0, 1]) flatArch(b, lw, h * 0.68, P.windowDark, { at: [i * (lw + 0.1), 0.15, 0], shape: 'round', off: 0.09, n: 2 });
    b.box(w + 0.6, 0.14, 0.3, P.marble, { at: [0, -0.15, 0.12], jitter: false });
  });
}

const X0 = -11;
const X1 = 11;
const Z0 = -3;
const Z1 = 7;
const G = 6; // the open arcade
const H = 7.4; // the council hall above

export const broletto: BuildingDef = {
  id: 'broletto',
  name: 'Broletto (first town hall)',
  style: 'Romanesque communal',
  date: 'c. 1210 to 1215',
  summary:
    'In the twelfth century the leading citizens swore themselves into a commune, elected consuls and took the government of the town from the bishop; by 1200 they hire a podestà, a magistrate from another city, to keep the peace between their factions. ' +
    'Their first town hall, called a broletto in Lombardy and a palazzo del podestà or della ragione elsewhere, is a council hall raised on an open arcade where citizens met, traded and heard cases below. ' +
    'An outside stair leads up to the hall, a bell on the roof calls the assembly, and from the balcony on the front (the arengario) the podestà and the heralds addressed the crowd. Bands of white, grey and red stone make it the smartest building in town.',
  materials: ['white, grey and red stone', 'brick', 'clay roof tiles (coppi)', 'timber'],
  lookFor: [
    { label: 'Open arcade', note: 'The ground floor is open on every side: a covered public space for meetings, markets and the courts.', at: [-4.4, 3.2, Z1 + 0.8] },
    { label: 'Council hall', note: 'The whole upper floor is a single hall where the council of the commune met, lit by three-light windows.', at: [6.6, 9.6, Z1 + 0.4] },
    { label: 'Arengario', note: 'The speaking balcony in the middle of the front, from which laws and decisions were proclaimed to the square.', at: [0, 7.2, Z1 + 2.0] },
    { label: 'Outside stair', note: 'A stone stair up the end of the building to the door of the hall, so the arcade below stays open.', at: [13.0, 3.4, 2.5] },
    { label: 'Polychrome bands', note: 'Courses of white, grey and red stone laid in stripes, a sign of civic wealth and pride.', at: [-8.8, 10.8, Z1 + 0.4] },
  ],
  modelledOn: 'The Broletto of Como (1215), much reduced',
  build(b) {
    const grey = P.peperino;
    const white = P.marble;
    const red = mix(P.marbleRed, P.cotto, 0.3);
    const W = X1 - X0;
    const D = Z1 - Z0;
    const XC = (X0 + X1) / 2;
    const ZC = (Z0 + Z1) / 2;

    // the square, still beaten earth with stone flags along the front, and the yard behind
    earthSquare(b);
    pave(b, 43, Z1 + 21.5, 0, (Z1 - 21.5) / 2, mix(P.earth, P.gravel, 0.45));
    // the arcade floor, a step up
    b.box(W + 0.4, 0.2, D + 0.4, tint(grey, 0.1), { at: [XC, 0, ZC], jitter: false });

    // ---------------------------------------------------------- the open arcade
    arcade(b, W, G, 1.0, grey, { at: [XC, 0, Z1 - 0.5], openings: 5, openW: 3.4, openH: 4.8, shape: 'round', n: 3 });
    arcade(b, W, G, 1.0, grey, { at: [XC, 0, Z0 + 0.5], openings: 5, openW: 3.4, openH: 4.8, shape: 'round', n: 3 });
    arcade(b, D - 2, G, 1.0, grey, { at: [X0 + 0.5, 0, ZC], facing: '+x', openings: 2, openW: 3.2, openH: 4.8, shape: 'round', n: 3 });
    arcade(b, D - 2, G, 1.0, grey, { at: [X1 - 0.5, 0, ZC], facing: '+x', openings: 2, openW: 3.2, openH: 4.8, shape: 'round', n: 3 });
    // white and red voussoirs picked out over the front arches
    for (const x of spread(5, X0 + 2.2, X1 - 2.2)) {
      archRing(b, 4.0, 5.3, 3.4, 4.8, white, { at: [x, 0, Z1], off: 0.03 });
      archRing(b, 3.75, 5.05, 3.4, 4.8, red, { at: [x, 0, Z1], off: 0.05 });
    }
    // the middle row of piers carrying the hall floor
    for (const x of spread(4, X0 + 4.4, X1 - 4.4)) b.box(1.0, G, 1.0, grey, { at: [x, 0, ZC] });
    b.box(W, 0.5, D, tint(grey, -0.08), { at: [XC, G - 0.5, ZC] }); // timber-beamed ceiling, seen as a slab

    // ---------------------------------------------------------- the council hall in striped stone
    const bands = [white, grey, red, white, grey, red, white, grey, white];
    const bh = H / bands.length;
    bands.forEach((c, i) => b.box(W, bh + 0.01, D, c, { at: [XC, G + i * bh, ZC], jitter: false }));
    b.box(W + 0.3, 0.3, D + 0.3, white, { at: [XC, G, ZC], jitter: false }); // string course
    // small arched corbel table under the eaves
    corbels(b, [X0, Z1], [X1, Z1], G + H - 0.6, 0.25, white, { pitch: 0.9, h: 0.6 });
    corbels(b, [X1, Z0], [X0, Z0], G + H - 0.6, 0.25, white, { pitch: 0.9, h: 0.6 });
    b.gable(W + 0.6, D + 0.6, 1.9, P.coppi, { at: [XC, G + H, ZC], overhang: 0.5, wall: white });
    // windows: three-light on the long sides, one on each end
    for (const x of spread(4, X0 + 3, X1 - 3)) {
      if (Math.abs(x) < 2) continue;
      roundTrifora(b, [x, G + 2.0, Z1], 0);
      roundTrifora(b, [x, G + 2.0, Z0], Math.PI);
    }
    roundTrifora(b, [X0, G + 2.0, ZC], -Math.PI / 2);
    roundTrifora(b, [X1, G + 2.0, ZC - 1.6], Math.PI / 2, 1.9, 2.6);

    // ---------------------------------------------------------- the arengario: a balcony on corbels in the middle
    const AZ = Z1;
    for (const dx of [-1.2, 0, 1.2]) b.beam([dx, G - 1.0, AZ], [dx, G + 0.05, AZ + 1.4], 0.35, 0.4, white);
    b.box(3.8, 0.3, 1.7, white, { at: [0, G, AZ + 0.85] });
    b.box(3.8, 1.0, 0.18, red, { at: [0, G + 0.3, AZ + 1.6], jitter: false });
    b.sym((s) => b.box(0.18, 1.0, 1.5, red, { at: [s * 1.8, G + 0.3, AZ + 0.85], jitter: false }));
    flatArch(b, 1.5, 2.8, P.oakDark, { at: [0, G + 0.3, AZ], shape: 'round', off: 0.06, n: 3 });
    flatArch(b, 2.1, 3.2, white, { at: [0, G + 0.15, AZ], shape: 'round', off: 0.04, n: 3 });
    // the commune's shield above it
    b.box(1.0, 1.2, 0.1, red, { at: [0, G + 4.0, AZ + 0.05], jitter: false });
    b.box(0.36, 1.2, 0.12, white, { at: [0, G + 4.0, AZ + 0.06], jitter: false });

    // ---------------------------------------------------------- the outside stair up the right end
    const SX = X1 + 1.3;
    const steps = 12;
    const runZ0 = Z1 + 0.5;
    const runZ1 = Z0 + 3.2;
    for (let i = 0; i < steps; i++) {
      const z = runZ0 + ((runZ1 - runZ0) * (i + 0.5)) / steps;
      b.box(1.9, (G * (i + 1)) / (steps + 1), Math.abs(runZ1 - runZ0) / steps + 0.02, tint(grey, 0.05), { at: [SX, 0, z], jitter: false });
    }
    b.box(1.9, G, 3.2, tint(grey, 0.05), { at: [SX, 0, Z0 + 1.6] }); // the landing
    b.beam([SX + 0.85, 1.0, runZ0], [SX + 0.85, G + 1.0, runZ1], 0.25, 1.0, white); // parapet
    b.box(0.25, 1.0, 3.2, white, { at: [SX + 0.85, G, Z0 + 1.6], jitter: false });
    flatArch(b, 1.4, 2.6, P.oakDark, { at: [X1, G, Z0 + 1.6], facing: '+x', shape: 'round', off: 0.06, n: 3 });
    b.deck(1.9, 3.2, G, { at: [SX, 0, Z0 + 1.6] });

    // ---------------------------------------------------------- the bell-cote on the ridge
    b.group({ at: [XC - 6, G + H + 1.2, ZC] }, () => {
      arcade(b, 2.2, 2.8, 0.6, white, { openings: 1, openW: 1.2, openH: 1.9, shape: 'round', n: 3 });
      b.extrude([[-1.3, 0], [1.3, 0], [0, 0.9]], 0.7, P.coppi, { at: [0, 2.8, 0] });
      b.cyl(0.4, 0.6, P.bronze, { at: [0, 0.8, 0], rTop: 0.18, segs: 7 });
    });

    // ---------------------------------------------------------- behind: a noble family's tower and its houses
    const stone = mix(P.rubble, P.pietraForte, 0.4);
    b.box(5, 27, 5, stone, { at: [-15.5, 0, -15.5] });
    for (const y of [7, 12, 17, 22]) for (const x of [-1.5, 0, 1.5]) b.box(0.22, 0.22, 0.05, P.windowDark, { at: [-15.5 + x, y, -13], jitter: false });
    for (const y of [9.5, 19.5]) b.box(0.4, 1.4, 0.05, P.windowDark, { at: [-15.5, y, -13], jitter: false });
    b.panel(1.0, 2.0, P.oakDark, { at: [-15.5, 5.5, -13], facing: '+z', shape: 'round' });
    for (const [x, w, h] of [[-8, 6, 9], [-1.5, 7, 8], [6, 7, 9.5]] as const) {
      b.box(w, h, 7, stone, { at: [x, 0, -17.5] });
      b.gable(w + 0.4, 7.4, 1.4, P.coppi, { at: [x, h, -17.5], overhang: 0.2, wall: stone });
      b.panel(2.6, 3.0, P.oakDark, { at: [x, 0, -14], facing: '+z', shape: 'round' });
      for (const dx of [-1.4, 1.4]) b.window(0.8, 1.3, { at: [x + dx, h - 3, -14], facing: '+z', frame: P.travertine });
    }

    // ---------------------------------------------------------- the square: a well and a stone bench
    squareWell(b);
    b.box(W - 4, 0.5, 0.6, P.travertine, { at: [XC, 0, Z0 - 0.8] });

    // ---------------------------------------------------------- colliders: the piers only, the arcade walkable
    for (const z of [Z1 - 0.5, Z0 + 0.5]) for (const x of spread(6, X0, X1)) b.collider(1.0, 1.0, { at: [x, 0, z] });
    for (const x of spread(4, X0 + 4.4, X1 - 4.4)) b.collider(1.0, 1.0, { at: [x, 0, ZC] });
    b.sym((s) => b.collider(1.0, 1.2, { at: [s * (X1 - 0.5), 0, ZC] }));
    b.collider(1.9, Math.abs(runZ1 - runZ0) + 3.2, { at: [SX, 0, (runZ1 + runZ0) / 2 - 1.6] });
    b.collider(W - 4, 0.6, { at: [XC, 0, Z0 - 0.8] });
    b.collider(5, 5, { at: [-15.5, 0, -15.5] });
    b.collider(21, 7, { at: [-1, 0, -17.5] });
  },
};
