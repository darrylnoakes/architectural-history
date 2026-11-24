import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HX, PLAT, TRACKS, archPanel, clock, cramptonTrain, platform, track } from './shared';

const ZF = 4.0; // street front
const ZB = -3.0; // platform side
const D = ZF - ZB;
const ZC = (ZF + ZB) / 2;
const CW = 6.6; // half-width of the central pavilion
const G = 4.6; // its ground storey
const CH = 8.4; // its cornice
const WX = 13.0; // the wings run to here
const WH = 4.8;

// the shed
const SZ0 = -3.5;
const SZ1 = -11.75;
const SX = 16.0;
const EAVE = 6.0;
const RIDGE = 8.6;

/**
 * A Polonceau truss (Camille Polonceau, 1837): two rafters, each propped at mid-length by a short
 * strut, tied by iron rods from the feet to a point under the ridge. Timber rafters, iron rods.
 */
function polonceau(b: Builder, x: number, timber: number, iron: number): void {
  const zm = (SZ0 + SZ1) / 2;
  const foot0: [number, number, number] = [x, EAVE, SZ0];
  const foot1: [number, number, number] = [x, EAVE, SZ1];
  const top: [number, number, number] = [x, RIDGE, zm];
  b.beam(foot0, top, 0.16, 0.24, timber);
  b.beam(foot1, top, 0.16, 0.24, timber);
  const k: [number, number, number] = [x, EAVE + 0.9, zm]; // where the ties meet
  for (const f of [foot0, foot1]) {
    const dir = Math.sign(zm - f[2]);
    const mid: [number, number, number] = [x, (EAVE + RIDGE) / 2, (f[2] + zm) / 2];
    const strutFoot: [number, number, number] = [x, mid[1] - 0.9, mid[2] + dir * 0.55];
    b.beam(mid, strutFoot, 0.08, 0.08, iron);
    b.beam(f, strutFoot, 0.04, 0.04, iron);
    b.beam(strutFoot, k, 0.04, 0.04, iron);
  }
  b.beam(k, top, 0.04, 0.04, iron);
}

export const embarcadere: BuildingDef = {
  id: 'embarcadere',
  name: 'First station (embarcadère)',
  style: 'Neoclassical, with a timber and iron shed',
  date: 'c. 1849',
  summary:
    'The Compagnie du Nord opened its line from Paris to Lille, by way of Creil and Amiens, in 1846; within about ten years the lines of the Nord and the Est had reached most of the cathedral towns of Picardy and Champagne. The first stations, still often called embarcadères (landing stages), were placed outside the old walls where land was cheap. ' +
    'The passenger building is a neat classical pavilion of dressed stone with low wings for the waiting rooms and offices, its arches leading straight through to the platform, and a clock to keep railway time. ' +
    'Behind it a long shed covers the platform and both tracks: timber rafters trussed with iron rods in the way devised by the French engineer Camille Polonceau, under a roof of slate with a glazed strip to let out the smoke.',
  materials: ['dressed limestone', 'slate', 'oak rafters', 'cast-iron columns', 'wrought-iron tie rods', 'glass'],
  modelledOn: 'The early stations of the Chemin de fer du Nord (late 1840s), in general terms; no single station is copied',
  influences: ['iron-and-rail'],
  lookFor: [
    { label: 'Classical pavilion', note: 'A two-storey centre of dressed stone with round arches and a cornice, so that the railway looks respectable.', at: [-4.4, 6.2, ZF + 0.3] },
    { label: 'Station clock', note: 'Railway time, kept to Paris time along the whole line, shown over the entrance.', at: [0, CH + 1.0, ZF + 0.4] },
    { label: 'Polonceau truss', note: 'Rafters propped by struts and tied by thin iron rods: a light roof truss devised by Camille Polonceau in the late 1830s and used in sheds all over Europe.', at: [-11.0, EAVE + 1.0, (SZ0 + SZ1) / 2] },
    { label: 'Train shed', note: 'A long roof on cast-iron columns over the platform and both tracks, open at the ends, with a glazed strip along the ridge for the smoke.', at: [6.0, RIDGE + 0.4, (SZ0 + SZ1) / 2] },
    { label: 'Crampton locomotive', note: 'One pair of huge driving wheels behind the firebox: an English design, the fast engine of the Nord and the Est from 1849, so common that “prendre le Crampton” came to mean taking the train.', at: [-11.2, 2.4, TRACKS[0] + 1.5] },
  ],
  build(b) {
    const stone = tint(P.pierreBlonde, b.range(-0.03, 0.02));
    const dress = mix(P.pierreBlonde, P.craie, 0.5);
    const slate = P.ardoise;
    const iron = mix(P.castIron, P.doorGreen, 0.25);
    const timber = P.oak;

    // forecourt of gravel with a kerb
    b.box(HX * 2, 0.05, 12 - ZF, mix(P.gravel, P.paving, 0.3), { at: [0, 0, (12 + ZF) / 2], jitter: false });

    // ------------------------------------------------ the central pavilion: an arcade through to the platform
    for (const [z, f] of [[ZF - 0.35, '+z'], [ZB + 0.35, '-z']] as const) {
      b.archWall(CW * 2, G, 0.7, stone, { at: [0, 0, z], facing: f, openings: 3, openW: 2.3, openH: 3.9, shape: 'round' });
      // rusticated joints across the ground storey
      for (const y of [1.0, 2.0, 3.0]) for (const x of [-5.55, 5.55]) b.panel(1.9, 0.05, tint(stone, -0.12), { at: [x, y, z + (f === '+z' ? 0.35 : -0.35)], facing: f, depth: 0.02 });
    }
    b.sym((s) => b.box(0.7, G, D - 1.4, stone, { at: [s * (CW - 0.35), 0, ZC] }));
    b.box(CW * 2 - 1.4, 0.06, D - 1.4, tint(stone, -0.3), { at: [0, G - 0.06, ZC], jitter: false });
    b.box(CW * 2, CH - G, D, stone, { at: [0, G, ZC] });
    b.box(CW * 2 + 0.2, 0.3, D + 0.2, dress, { at: [0, G, ZC] });
    b.box(CW * 2 + 0.5, 0.45, D + 0.5, dress, { at: [0, CH - 0.45, ZC] });
    b.hip(CW * 2 + 0.5, D + 0.5, 1.8, slate, { at: [0, CH, ZC], overhang: 0.25 });
    for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
      for (const x of [-4.4, -2.2, 0, 2.2, 4.4]) {
        b.window(1.1, 2.1, { at: [x, G + 0.85, z], facing: f, frame: dress, glass: P.windowDark, bars: [2, 3], border: 0.08 });
        b.panel(1.4, 0.18, dress, { at: [x, G + 3.05, z], facing: f, depth: 0.1 });
      }
    }
    // the clock in an attic over the cornice
    b.box(3.6, 1.9, 0.6, stone, { at: [0, CH, ZF - 0.2] });
    b.box(4.0, 0.25, 0.8, dress, { at: [0, CH + 1.9, ZF - 0.2] });
    clock(b, 1.2, [0, CH + 0.35, ZF + 0.12], { rim: dress });
    b.chimney(0.5, 1.2, 0.5, stone, { at: [-4.0, CH + 0.9, ZC] });
    b.chimney(0.5, 1.2, 0.5, stone, { at: [4.0, CH + 0.9, ZC] });

    // ------------------------------------------------ the wings: waiting rooms and offices
    b.sym((s) => {
      const L = WX - CW;
      const xc = s * (CW + L / 2);
      const d = D - 0.8;
      b.box(L, WH, d, stone, { at: [xc, 0, ZC] });
      b.box(L + 0.1, 0.35, d + 0.3, dress, { at: [xc, WH - 0.35, ZC] });
      b.hip(L + 0.4, d + 0.6, 1.4, slate, { at: [xc, WH, ZC], overhang: 0.2 });
      for (const [z, f] of [[ZC + d / 2, '+z'], [ZC - d / 2, '-z']] as const) {
        for (let i = 0; i < 3; i++) {
          const x = s * (CW + (i + 0.5) * (L / 3));
          archPanel(b, 1.5, 3.1, dress, { at: [x, 0.8, z], facing: f, depth: 0.04 });
          if (f === '-z' && i === 1) archPanel(b, 1.2, 2.9, P.doorGreen, { at: [x, 0.05, z], facing: f, depth: 0.07 });
          else archPanel(b, 1.2, 2.9, P.windowDark, { at: [x, 0.9, z], facing: f, depth: 0.07 });
        }
      }
      archPanel(b, 1.2, 2.9, P.windowDark, { at: [s * WX, 0.9, ZC], facing: s > 0 ? '+x' : '-x', depth: 0.07 });
      b.chimney(0.45, 1.0, 0.45, stone, { at: [s * (WX - 1.5), WH + 0.7, ZC] });
      b.collider(L, d, { at: [xc, 0, ZC] });
      b.collider(0.8, D, { at: [s * (CW - 0.35), 0, ZC] });
    });

    // ------------------------------------------------ platform, tracks, train
    platform(b, ZB, PLAT.edge, -HX, HX);
    for (const z of TRACKS) track(b, z);
    cramptonTrain(b, [-17.5, 0, TRACKS[0]]);
    b.collider(26, 2.8, { at: [-4.5, 0, TRACKS[0]] });

    // ------------------------------------------------ the shed
    const xs: number[] = [];
    for (let x = -SX; x <= SX + 0.01; x += 4) xs.push(x);
    for (const x of xs) {
      for (const z of [SZ0, SZ1]) {
        const y0 = z > PLAT.edge ? PLAT.y : 0;
        b.box(0.34, 0.4, 0.34, iron, { at: [x, y0, z] });
        b.cyl(0.11, EAVE - y0 - 0.25, iron, { at: [x, y0, z], segs: 6 });
        b.box(0.36, 0.25, 0.36, iron, { at: [x, EAVE - 0.25, z] });
      }
      polonceau(b, x, timber, iron);
    }
    const L = SX * 2 + 1.0;
    const zm = (SZ0 + SZ1) / 2;
    for (const z of [SZ0, SZ1]) b.box(L, 0.4, 0.22, timber, { at: [0, EAVE - 0.2, z] }); // eaves plates
    for (const z of [SZ0, SZ1]) {
      const p = (t: number): [number, number, number] => [0, EAVE + (RIDGE - EAVE) * t + 0.16, z + (zm - z) * t];
      b.beam(p(-0.03), p(0.72), L, 0.07, slate);
      b.beam(p(0.72), p(1.0), L, 0.05, mix(P.glass, P.white, 0.2), { mat: 'glass' });
    }
    b.box(L, 0.5, 0.7, timber, { at: [0, RIDGE + 0.05, zm] }); // the smoke louvre on the ridge
    b.gable(L, 1.3, 0.35, slate, { at: [0, RIDGE + 0.55, zm], thick: 0.06 });
    // timber boarding in the gable ends above the tie, as a valance against the weather
    b.sym((s) => {
      const x = s * (SX + 0.5);
      b.extrude([[SZ0 - 0.0, 0], [SZ1, 0], [zm, RIDGE - EAVE]].map(([z, y]) => [-z, y] as [number, number]), 0.08, tint(timber, 0.08), { at: [x, EAVE + 0.15, 0], rotY: Math.PI / 2 });
    });
    // a bench and a lamp on the platform
    b.box(2.0, 0.45, 0.5, P.oak, { at: [8.0, PLAT.y, -4.2] });
    b.cyl(0.06, 3.0, iron, { at: [11.6, PLAT.y, -5.8], segs: 6 });
    b.box(0.35, 0.45, 0.35, mix(P.glass, P.windowLit, 0.5), { at: [11.6, PLAT.y + 3.0, -5.8] });

    for (const x of [-16.5, 16.5]) b.tree(5.5, { kind: 'round', at: [x, 0, 8.6], color: mix(P.leaf, P.leafDark, 0.3) });
  },
};
