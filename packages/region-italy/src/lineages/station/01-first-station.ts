import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, arcadeWall, archPanel, clock, platform, steamTrain, track } from './shared';

const ZF = 4.6; // street front of the building
const ZB = -3.2; // track side
const CW = 5.6; // half-width of the central block
const CH = 10.2; // its cornice
const GF = 5.4; // first-floor level
const WX = 14.6; // wings run to here
const WH = 6.2; // wing cornice
const PX = 18.4; // end pavilions run to here
const PH = 8.6;

// the train shed
const SZ0 = -3.55; // inner row of columns, on the platform
const SZ1 = -11.75; // outer row
const EAVE = 6.6;
const RIDGE = 9.3;

/** A Polonceau-type iron roof truss spanning z0..z1 at plan x. */
function truss(b: Builder, x: number, iron: number): void {
  const zm = (SZ0 + SZ1) / 2;
  const q = (SZ1 - SZ0) / 4;
  b.beam([x, EAVE, SZ0], [x, RIDGE, zm], 0.14, 0.2, iron);
  b.beam([x, EAVE, SZ1], [x, RIDGE, zm], 0.14, 0.2, iron);
  // the tie: a rod from each foot to a point below the ridge, struts up to the rafters
  const tie: [number, number, number] = [x, EAVE + 0.9, zm];
  b.beam([x, EAVE, SZ0], tie, 0.05, 0.05, iron);
  b.beam([x, EAVE, SZ1], tie, 0.05, 0.05, iron);
  b.beam([x, RIDGE, zm], tie, 0.05, 0.05, iron);
  const r0: [number, number, number] = [x, EAVE + (RIDGE - EAVE) / 2, SZ0 + q * 1];
  const r1: [number, number, number] = [x, EAVE + (RIDGE - EAVE) / 2, SZ1 - q * 1];
  b.beam(r0, [x, EAVE + 0.45, SZ0 + q], 0.08, 0.08, iron);
  b.beam(r1, [x, EAVE + 0.45, SZ1 - q], 0.08, 0.08, iron);
}

/** A cast-iron column with a base and a bracketed capital. */
function column(b: Builder, x: number, z: number, iron: number): void {
  const y0 = z > -7 ? PLAT.y : 0;
  b.box(0.36, 0.45, 0.36, iron, { at: [x, y0, z] });
  b.cyl(0.12, EAVE - 0.3 - y0, iron, { at: [x, y0, z], segs: 6 });
  b.box(0.4, 0.3, 0.4, iron, { at: [x, EAVE - 0.3, z] });
}

export const firstStation: BuildingDef = {
  id: 'first-station',
  name: 'The first railway station',
  style: 'Neoclassical, with an iron train shed',
  date: 'c. 1865',
  summary:
    'The railway reached the town in the years around unification, when the new kingdom was racing to link its regions. The station was built outside the walls, where there was room for the tracks, and a new avenue was cut to reach it. ' +
    'Its front is a sober neoclassical palace in stucco, with a central block, low wings and end pavilions, so that the newest of building types looks as dignified as any public building. ' +
    'Behind it the true novelty is out of sight from the street: a train shed of cast and wrought iron and glass, a technique learned from England and France, spanning the platform and tracks.',
  materials: ['brick walls finished in stucco', 'stone dressings', 'cast-iron columns', 'wrought-iron trusses', 'zinc and glass roof'],
  modelledOn: 'Italian stations of the 1860s, such as the first stations of Pistoia and Arezzo; the iron shed after English and French models',
  influences: ['iron-and-glass'],
  lookFor: [
    { label: 'Neoclassical front', note: 'A central block, wings and end pavilions in stucco, with arched windows and a cornice: the station dressed as a palace.', at: [-10, 4.2, ZF + 0.3] },
    { label: 'Station clock', note: 'Railway time had to be the same everywhere on the line, so the clock was the most important thing on the front.', at: [0, CH + 1.6, ZF + 0.5] },
    { label: 'Entrance arcade', note: 'Three open arches lead from the forecourt straight through to the platform.', at: [0, 3.6, ZF + 0.5] },
    { label: 'Iron train shed', note: 'Slender cast-iron columns and light wrought-iron trusses carry a roof half of zinc and half of glass, to let in light and let out the smoke.', at: [12.5, RIDGE + 0.2, (SZ0 + SZ1) / 2] },
    { label: 'Steam locomotive', note: 'A small engine with its tender and a four-wheeled carriage with a door to every compartment.', at: [-12.8, 4.6, TRACKS[0]] },
  ],
  build(b) {
    const stucco = tint(P.intonacoCream, b.range(-0.03, 0.01));
    const dress = mix(P.travertine, P.limestone, 0.4);
    const iron = mix(P.doorGreen, P.castIron, 0.5);
    const roof = P.coppi;

    // ---------------------------------------------------------------- forecourt
    b.box(HX * 2, 0.05, 12 - ZF, mix(P.gravel, P.paving, 0.4), { at: [0, 0, (12 + ZF) / 2], jitter: false });
    b.box(HX * 2, 0.12, 0.3, P.travertine, { at: [0, 0, 11.6], jitter: false });

    // ---------------------------------------------------------------- the central block
    b.sym((s) => b.box(0.7, GF, ZF - ZB, stucco, { at: [s * (CW - 0.35), 0, (ZF + ZB) / 2] }));
    for (const [z, f] of [[ZF - 0.35, '+z'], [ZB + 0.35, '-z']] as const) {
      arcadeWall(b, CW * 2, GF, 0.7, stucco, { at: [0, 0, z], n: 3, openW: 2.4, openH: 4.4 });
      // rustication bands and archivolts on the ground floor
      for (const y of [0.9, 1.8, 2.7]) for (const x of [-1.87, 1.87, -5.25, 5.25]) b.panel(x * x > 10 ? 0.6 : 1.2, 0.05, tint(stucco, -0.12), { at: [x, y, z + (f === '+z' ? 0.35 : -0.35)], facing: f, depth: 0.02 });
    }
    b.box(CW * 2, CH - GF, ZF - ZB, stucco, { at: [0, GF, (ZF + ZB) / 2] });
    b.box(CW * 2 - 1.4, 0.06, ZF - ZB - 1.4, tint(stucco, -0.25), { at: [0, GF - 0.06, (ZF + ZB) / 2], jitter: false }); // vestibule ceiling
    b.box(CW * 2 + 0.3, 0.35, ZF - ZB + 0.3, dress, { at: [0, GF, (ZF + ZB) / 2] }); // string course
    b.box(CW * 2 + 0.6, 0.45, ZF - ZB + 0.6, dress, { at: [0, CH - 0.45, (ZF + ZB) / 2] }); // cornice
    b.hip(CW * 2 + 0.4, ZF - ZB + 0.4, 2.0, roof, { at: [0, CH, (ZF + ZB) / 2], overhang: 0.3 });
    // quoins
    for (const sx of [-1, 1]) for (const sz of [ZF, ZB]) for (let y = 0.4; y < CH - 0.6; y += 1.3) b.box(0.6, 0.6, 0.6, dress, { at: [sx * (CW - 0.25), y, sz - Math.sign(sz) * 0.25], jitter: false });
    // first-floor windows with little pediments, front and back
    for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
      for (const x of [-3.6, 0, 3.6]) {
        b.window(1.3, 2.4, { at: [x, GF + 1.0, z], facing: f, frame: dress });
        b.panel(1.5, 0.12, dress, { at: [x, GF + 0.85, z], facing: f, depth: 0.12 });
        b.group({ at: [x, GF + 3.55, z], rotY: f === '+z' ? 0 : Math.PI }, () => b.extrude([[-0.95, 0], [0.95, 0], [0, 0.5]], 0.2, dress, { at: [0, 0, 0.08] }));
      }
    }
    // the attic over the centre with the clock
    b.box(5.2, 2.6, 0.6, stucco, { at: [0, CH, ZF - 0.1] });
    b.box(5.6, 0.3, 0.8, dress, { at: [0, CH + 2.6, ZF - 0.1] });
    b.extrude([[-2.9, 0], [2.9, 0], [0, 0.9]], 0.7, dress, { at: [0, CH + 2.9, ZF - 0.1] });
    clock(b, 1.5, [0, CH + 0.65, ZF + 0.2], { rim: dress });
    b.panel(4.0, 0.5, P.white, { at: [0, GF - 0.6, ZF], depth: 0.04 }); // the name board over the arches
    b.panel(3.2, 0.12, P.black, { at: [0, GF - 0.42, ZF + 0.04], depth: 0.02 });

    // ---------------------------------------------------------------- wings and end pavilions
    b.sym((s) => {
      const x0 = CW;
      const L = WX - x0;
      const xc = s * (x0 + L / 2);
      const d = ZF - ZB - 1.0;
      const zc = (ZF + ZB) / 2 - 0.1;
      b.box(L, WH, d, stucco, { at: [xc, 0, zc] });
      b.box(L, 0.6, d + 0.1, tint(stucco, -0.06), { at: [xc, 0, zc] }); // plinth
      b.box(L + 0.1, 0.4, d + 0.4, dress, { at: [xc, WH - 0.4, zc] });
      b.box(L, 0.8, 0.3, stucco, { at: [xc, WH, zc + d / 2 - 0.15] }); // parapet hiding a low roof
      b.gable(L, d - 0.4, 1.2, roof, { at: [xc, WH, zc - 0.1] });
      for (const [z, f] of [[zc + d / 2, '+z'], [zc - d / 2, '-z']] as const) {
        for (let i = 0; i < 4; i++) {
          const x = s * (x0 + (i + 0.5) * (L / 4));
          if (f === '+z') archPanel(b, 1.6, 3.6, dress, { at: [x, 1.0, z], facing: f, depth: 0.05 });
          archPanel(b, 1.3, 3.4, P.windowDark, { at: [x, 1.1, z], facing: f, depth: 0.08 });
          b.panel(0.06, 2.6, P.white, { at: [x, 1.1, z], facing: f, depth: 0.1 });
        }
      }
      // the pavilion: two storeys, a hipped roof
      const pw = PX - WX;
      const px = s * (WX + pw / 2);
      const pd = ZF - ZB;
      b.box(pw, PH, pd, stucco, { at: [px, 0, (ZF + ZB) / 2] });
      b.box(pw + 0.3, 0.35, pd + 0.3, dress, { at: [px, 4.4, (ZF + ZB) / 2] });
      b.box(pw + 0.5, 0.4, pd + 0.5, dress, { at: [px, PH - 0.4, (ZF + ZB) / 2] });
      b.hip(pw + 0.3, pd + 0.3, 1.5, roof, { at: [px, PH, (ZF + ZB) / 2], overhang: 0.25 });
      for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
        archPanel(b, 1.5, 3.0, dress, { at: [px, 1.0, z], facing: f, depth: 0.05 });
        archPanel(b, 1.2, 2.85, f === '+z' ? P.doorGreen : P.windowDark, { at: [px, 1.05, z], facing: f, depth: 0.08 });
        b.window(1.1, 2.0, { at: [px, 5.4, z], facing: f, frame: dress });
      }
      b.window(1.1, 2.0, { at: [s * PX, 5.4, (ZF + ZB) / 2], facing: s > 0 ? '+x' : '-x', frame: dress });
      archPanel(b, 1.2, 2.85, P.windowDark, { at: [s * PX, 1.05, (ZF + ZB) / 2], facing: s > 0 ? '+x' : '-x', depth: 0.08 });
      b.chimney(0.6, 1.6, 0.6, stucco, { at: [px, PH + 0.6, 0.2] });
    });

    // ---------------------------------------------------------------- platform, tracks, train
    platform(b, ZB, PLAT.edge, -HX, HX);
    for (const z of [...TRACKS]) track(b, z);
    steamTrain(b, [-15.0, 0, TRACKS[0]]);

    // ---------------------------------------------------------------- the train shed
    const xs = [-17.5, -12.5, -7.5, -2.5, 2.5, 7.5, 12.5, 17.5];
    for (const x of xs) {
      column(b, x, SZ0, iron);
      column(b, x, SZ1, iron);
      truss(b, x, iron);
    }
    const L = xs[xs.length - 1] - xs[0] + 1.2;
    // eaves girders and the two slopes: zinc low down, a broad band of glass above
    for (const z of [SZ0, SZ1]) b.box(L, 0.35, 0.2, iron, { at: [0, EAVE - 0.3, z] });
    const zm = (SZ0 + SZ1) / 2;
    for (const z of [SZ0, SZ1]) {
      const p = (t: number): [number, number, number] => [0, EAVE + (RIDGE - EAVE) * t + 0.12, z + (zm - z) * t];
      b.beam(p(-0.06), p(0.42), L, 0.08, P.zinc);
      b.beam(p(0.42), p(1.0), L, 0.06, mix(P.glass, P.white, 0.2), { mat: 'glass' });
    }
    b.box(L, 0.5, 0.5, P.zinc, { at: [0, RIDGE, zm] }); // a ventilating ridge for the smoke
    b.gable(L, 1.2, 0.35, P.zinc, { at: [0, RIDGE + 0.5, zm] });
    // a fretted valance along the outer eaves
    b.box(L, 0.5, 0.06, mix(P.white, P.cream, 0.5), { at: [0, EAVE - 0.75, SZ1 - 0.12] });
    // platform furniture: a bench, a water crane for the engines
    b.box(2.0, 0.45, 0.5, P.oak, { at: [9, PLAT.y, -4.2] });
    b.group({ at: [6.0, PLAT.y, -6.4] }, () => {
      b.cyl(0.18, 3.0, iron, { segs: 8 });
      b.beam([0, 3.0, 0], [-1.6, 3.0, -1.3], 0.18, 0.18, iron);
    });

    // ---------------------------------------------------------------- around it
    for (const x of [-11, 9.5]) b.tree(6.5, { kind: 'round', at: [x, 0, 9.6], color: mix(P.leaf, P.leafDark, 0.3) });
    // ---------------------------------------------------------------- walking: the arcade is open, the rest solid
    b.sym((s) => {
      b.collider(0.8, ZF - ZB, { at: [s * (CW - 0.35), 0, (ZF + ZB) / 2] });
      b.collider(PX - CW, ZF - ZB, { at: [s * (CW + PX) / 2, 0, (ZF + ZB) / 2] });
    });
    b.collider(21.4, 2.8, { at: [-4.4, 0, TRACKS[0]] });
  },
};
