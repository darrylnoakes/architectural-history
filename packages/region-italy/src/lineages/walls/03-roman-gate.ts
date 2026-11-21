import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, archPanel, gateMass, merlonsX, road, voussoirs } from './shared';

const FW = 12.4; // width of the gate front between the towers
const FT = 3.2; // its thickness
const FZ = 0.4; // its centre line
const H1 = 7.0; // top of the arched storey
const H2 = 10.6; // top of the gallery
const TX = 8.5; // tower centres
const TR = 3.0; // tower radius
const TH = 14.0; // tower height to the eaves
const TZ = 1.6; // towers stand forward of the wall
const WALL_H = 7.2;
const WALL_T = 2.6;

const CARRIAGE = { x: 2.15, w: 3.2, h: 5.7 };
const FOOT = { x: 4.85, w: 1.3, h: 3.1 };

export const romanGate: BuildingDef = {
  id: 'roman-gate',
  name: 'Roman city gate',
  style: 'Roman, Augustan',
  date: 'late 1st century BC',
  summary:
    'Under Augustus, colonies of veteran soldiers were founded or refounded all over Italy, and each was given new walls and gates. With Italy at peace, the gate was as much a show front as a defence: a stately entrance in dressed white stone. ' +
    'Two carriage arches let traffic in and out at once, with a narrower arch for people on foot either side. Above runs a gallery lit by a row of arched windows, and two many-sided towers stand forward of the wall to flank the approach. ' +
    'Where the Etruscan gate was a single opening in a mass of blocks, this is a designed façade with pilasters, a cornice and a regular rhythm of openings.',
  materials: ['white limestone ashlar', 'concrete core faced with small stones (opus incertum)', 'clay roof tiles', 'oak gate leaves'],
  modelledOn: 'The Porta Venere, Spello, and the Porta Palatina, Turin (both late 1st century BC)',
  lookFor: [
    { label: 'Twin carriage arches', note: 'One arch for traffic coming in, one for traffic going out, divided by a central pier.', at: [-CARRIAGE.x, 6.3, FZ + FT / 2 + 0.3] },
    { label: 'Footway arch', note: 'A smaller arch either side kept people on foot out of the way of carts.', at: [FOOT.x, 3.5, FZ + FT / 2 + 0.3] },
    { label: 'Windowed gallery', note: 'A covered walkway for the guard over the arches, its row of arched windows also the gate’s chief ornament.', at: [0, 9.6, FZ + FT / 2 + 0.3] },
    { label: 'Polygonal towers', note: 'Many-sided towers stand forward of the wall so that archers could shoot at anyone attacking the gate.', at: [-TX, TH - 2, TZ + TR + 0.3] },
    { label: 'Pilasters and cornice', note: 'Flat classical pilasters framing the arches and a moulded cornice: architecture borrowed from temples to dignify a gate.', at: [3.5, H1 + 0.2, FZ + FT / 2 + 0.4] },
  ],
  build(b) {
    const stone = mix(P.travertine, P.limestone, 0.5);
    const shade = tint(stone, -0.07);
    const wallFace = mix(P.rubble, P.tufa, 0.35);
    const roof = P.coppi;
    const front = FZ + FT / 2;
    const back = FZ - FT / 2;

    road(b, 7.0, mix(P.peperino, P.cobble, 0.4));
    // basalt paving: a few joint lines
    for (let z = -7.5; z < 8; z += 1.1) b.box(7.0, 0.01, 0.05, tint(P.peperino, -0.12), { at: [0, 0.04, z], jitter: false });

    // ---------------------------------------------------------------- the wall either side
    b.sym((s) => {
      const x0 = TX + TR - 0.6;
      const L = HALF - x0;
      const xc = s * (x0 + L / 2);
      b.box(L, WALL_H, WALL_T, wallFace, { at: [xc, 0, 0] });
      b.box(L, 0.4, WALL_T + 0.3, shade, { at: [xc, 0, 0] });
      // regular courses of small stones in the facing; the core is concrete
      for (const y of [1.6, 3.2, 4.8]) b.box(L, 0.06, WALL_T + 0.04, tint(wallFace, -0.1), { at: [xc, y, 0], jitter: false });
      b.box(L, 0.3, WALL_T + 0.2, stone, { at: [xc, WALL_H - 0.3, 0] });
      merlonsX(b, s > 0 ? x0 : -HALF, s > 0 ? HALF : -x0, WALL_H, WALL_T / 2 - 0.25, stone, { w: 0.9, h: 1.1, t: 0.5, gap: 0.8 });
    });

    // ---------------------------------------------------------------- the front: arched storey
    gateMass(b, FW, H1, FT, stone, {
      at: [0, 0, FZ],
      xs: [-FOOT.x, -CARRIAGE.x, CARRIAGE.x, FOOT.x],
      openW: [FOOT.w, CARRIAGE.w, CARRIAGE.w, FOOT.w],
      openH: [FOOT.h, CARRIAGE.h, CARRIAGE.h, FOOT.h],
    });
    // course lines on both faces
    for (const [z, f] of [[front + 0.01, '+z'], [back - 0.01, '-z']] as const) {
      for (const y of [0.9, 1.8, 2.7]) {
        for (const x of [0, 3.5, -3.5, 5.85, -5.85]) {
          const w = x === 0 ? 1.0 : Math.abs(x) > 5 ? 0.6 : 0.5;
          b.panel(w, 0.04, shade, { at: [x, y, z], facing: f, depth: 0.01 });
        }
      }
      // voussoirs round each arch
      for (const o of [CARRIAGE, FOOT]) {
        b.sym((s) => voussoirs(b, o.w, o.h - o.w / 2, o === CARRIAGE ? 0.6 : 0.4, stone, { at: [s * o.x, 0, z], facing: f, n: o === CARRIAGE ? 11 : 7, proud: 0.08, vary: 0.035 }));
      }
      // pilasters with plain capitals between the openings, carrying an entablature
      for (const x of [0, -3.5, 3.5, -FW / 2 + 0.3, FW / 2 - 0.3]) {
        const w = x === 0 ? 0.7 : 0.5;
        b.panel(w, H1 - 1.4, tint(stone, 0.03), { at: [x, 0.4, z], facing: f, depth: 0.18 });
        b.panel(w + 0.2, 0.25, tint(stone, 0.05), { at: [x, H1 - 1.25, z], facing: f, depth: 0.24 });
      }
      b.panel(FW, 0.5, tint(stone, 0.02), { at: [0, H1 - 1.0, z], facing: f, depth: 0.2 }); // architrave and frieze
    }
    // cornice and plinth all round the front block
    b.box(FW + 0.6, 0.35, FT + 0.6, tint(stone, 0.04), { at: [0, H1 - 0.35, FZ] });
    b.box(FW + 0.3, 0.4, FT + 0.3, shade, { at: [0, 0, FZ] });
    // the passages: soffits, and the doors folded back
    for (const o of [CARRIAGE, FOOT]) b.sym((s) => b.vault(o.w, FT - 0.05, tint(stone, -0.22), { at: [s * o.x, o.h - o.w / 2, FZ], segs: 8 }));
    b.sym((s) => {
      for (const side of [1, -1]) {
        const x = s * CARRIAGE.x + side * (CARRIAGE.w / 2 - 0.12);
        b.box(0.12, CARRIAGE.h - CARRIAGE.w / 2, 1.5, P.oakDark, { at: [x, 0, back + 0.9] });
      }
    });

    // ---------------------------------------------------------------- the gallery storey
    const GW2 = FW - 0.6;
    const GT = FT - 0.4;
    b.box(GW2, H2 - H1, GT, stone, { at: [0, H1, FZ] });
    const nWin = 8;
    for (const [z, f] of [[FZ + GT / 2, '+z'], [FZ - GT / 2, '-z']] as const) {
      for (let i = 0; i < nWin; i++) {
        const x = -GW2 / 2 + (i + 0.5) * (GW2 / nWin);
        archPanel(b, 0.95, 2.1, tint(stone, 0.04), { at: [x, H1 + 0.7, z], facing: f, depth: 0.06 });
        archPanel(b, 0.75, 1.95, P.windowDark, { at: [x, H1 + 0.75, z], facing: f, depth: 0.09 });
        // little pilasters between the windows
        if (i > 0) b.panel(0.22, 2.4, tint(stone, 0.02), { at: [x - GW2 / nWin / 2, H1 + 0.4, z], facing: f, depth: 0.12 });
      }
      b.panel(GW2, 0.2, tint(stone, 0.03), { at: [0, H1 + 0.4, z], facing: f, depth: 0.1 }); // sill course
    }
    b.box(GW2 + 0.4, 0.3, GT + 0.4, tint(stone, 0.04), { at: [0, H2, FZ] });
    b.hip(GW2 + 0.2, GT + 0.2, 1.1, roof, { at: [0, H2 + 0.3, FZ], overhang: 0.35 });

    // ---------------------------------------------------------------- the two towers
    const segs = 16;
    b.sym((s) => {
      b.group({ at: [s * TX, 0, TZ] }, () => {
        b.cyl(TR + 0.25, 0.6, shade, { segs });
        b.cyl(TR, TH, stone, { segs });
        for (const y of [2.6, 5.4, H1 - 0.35, 10.4]) b.cyl(TR + 0.03, 0.06, shade, { at: [0, y, 0], segs, jitter: false });
        b.cyl(TR + 0.22, 0.35, tint(stone, 0.04), { at: [0, TH - 0.35, 0], segs });
        // a tiled conical roof
        b.cone(TR + 0.55, 2.0, roof, { at: [0, TH, 0], segs });
        b.cyl(0.18, 0.4, tint(roof, -0.1), { at: [0, TH + 1.85, 0], segs: 6 });
        // arched windows on the outward faces, at two levels; slits low down
        for (const a of [0, 0.85, -0.85, s * 1.7, s * 2.5]) {
          const at = (r: number, y: number): [number, number, number] => [Math.sin(a) * r, y, Math.cos(a) * r];
          archPanel(b, 0.8, 1.7, P.windowDark, { at: at(TR - 0.02, 11.1), facing: a, depth: 0.08 });
          archPanel(b, 1.0, 1.85, tint(stone, 0.04), { at: at(TR - 0.04, 11.0), facing: a, depth: 0.05 });
          if (Math.abs(a) < 1.6) archPanel(b, 0.6, 1.3, P.windowDark, { at: at(TR - 0.02, 7.9), facing: a, depth: 0.08 });
          b.panel(0.16, 1.1, P.black, { at: at(TR - 0.02, 3.4), facing: a, depth: 0.06 });
        }
      });
    });

    // ---------------------------------------------------------------- the town side: stairs up to the wall-walk
    b.stairs(1.2, WALL_H, 8, 14, shade, { at: [11.0, 0, -WALL_T / 2 - 0.75], rotY: -Math.PI / 2 });

    // ---------------------------------------------------------------- around it
    b.tree(8, { kind: 'cypress', at: [-13.6, 0, 6.2] });
    b.tree(7.2, { kind: 'cypress', at: [13.4, 0, 6.6] });
    // a tomb by the road outside: the Romans buried their dead along the roads beyond the gates
    b.group({ at: [-6.4, 0, 6.6] }, () => {
      b.box(2.4, 0.5, 2.4, shade);
      b.box(2.0, 1.8, 2.0, stone, { at: [0, 0.5, 0] });
      b.box(2.3, 0.3, 2.3, tint(stone, 0.04), { at: [0, 2.3, 0] });
      b.panel(1.2, 0.8, tint(stone, 0.06), { at: [0, 1.0, 1.0], depth: 0.04 });
      b.cyl(0.5, 0.9, stone, { at: [0, 2.6, 0], segs: 10 });
    });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - (TX + TR - 0.6), WALL_T + 0.4, { at: [s * (HALF + TX + TR - 0.6) / 2, 0, 0] });
      b.collider(TR * 2, TR * 2 + 0.4, { at: [s * TX, 0, TZ] });
      b.collider(FW / 2 - (FOOT.x + FOOT.w / 2) + 0.2, FT, { at: [s * (FW / 2 + FOOT.x + FOOT.w / 2) / 2, 0, FZ] });
      b.collider(FOOT.x - FOOT.w / 2 - (CARRIAGE.x + CARRIAGE.w / 2), FT, { at: [s * (FOOT.x - FOOT.w / 2 + CARRIAGE.x + CARRIAGE.w / 2) / 2, 0, FZ] });
    });
    b.collider(CARRIAGE.x * 2 - CARRIAGE.w, FT, { at: [0, 0, FZ] }); // the central pier
    b.collider(8, 1.3, { at: [11.0, 0, -WALL_T / 2 - 0.75] });
    b.collider(2.4, 2.4, { at: [-6.4, 0, 6.6] });
  },
};
