import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { balustrade, statue } from './shared';

// Plan (front at +Z): a front range with a domed centre and two corner pavilions, side ranges,
// a back range and a cross range under the dome, round two courtyards.
const HX = 16.5; // half width of the main block
const ZF = 9.0; // front face of the front range
const ZB = -14.0; // back face
const RD = 6.0; // depth of the ranges
const G = 6.0; // ground floor height (from the plinth)
const PL = 0.9; // plinth
const EAVES = PL + G + 5.6;
const PAV = 6.4; // corner pavilion size
const PAV_Z = ZF + 0.8; // pavilion front
const DOME_Z = 1.0;

/** A range of top-lit galleries: walls, cornice, a low roof with a glazed lantern along its ridge. */
function range(b: Builder, cx: number, cz: number, w: number, d: number, alongX: boolean, stone: number, roof: number): void {
  b.box(w, EAVES, d, stone, { at: [cx, 0, cz] });
  b.box(w + 0.5, 0.5, d + 0.5, tint(stone, -0.07), { at: [cx, EAVES - 0.5, cz] });
  const span = alongX ? d : w;
  b.gable(w, d, span * 0.28, roof, { at: [cx, EAVES, cz], ridge: alongX ? 'x' : 'z', overhang: 0.2, wall: stone });
  // the skylight: a glazed ridge lantern
  const lw = alongX ? w - 1.2 : span * 0.42;
  const ld = alongX ? span * 0.42 : d - 1.2;
  b.box(lw, 0.5, ld, P.iron, { at: [cx, EAVES + span * 0.15, cz] });
  b.gable(lw, ld, span * 0.14, P.glass, { at: [cx, EAVES + span * 0.15 + 0.5, cz], ridge: alongX ? 'x' : 'z', mat: 'glass', jitter: false });
}

export const museum: BuildingDef = {
  id: 'museum',
  name: 'Museum',
  style: 'Second Empire',
  date: '1862',
  summary:
    'The Revolution had seized the collections of the church and the nobility and made them public; now the town builds them a palace. ' +
    'The museum is dressed like the Louvre that Napoleon III was finishing in Paris: a domed centre, corner pavilions under tall slate roofs, columns and sculpture over cut stone. ' +
    'But it is also a new kind of building: the upper floor has hardly a window, because the pictures hang in long galleries lit from glass roofs above, and the dome crowns a grand staircase. ' +
    'Where the theatre was for an evening’s pleasure, the museum is meant to improve: it holds the town’s archaeology, its paintings and its pride.',
  materials: ['cut limestone', 'slate roofs', 'glass and iron rooflights', 'sculpted stone', 'gilded lead finials'],
  modelledOn:
    'The Musée de Picardie, Amiens (built 1855 to 1867 by Henri Parent and Arthur Diet as the Musée Napoléon; often said to be the first building in France designed from the start as a museum), much simplified. ' +
    'The domed centre, pavilions, sculpture and top-lit galleries follow it; the exact elevations here are generic.',
  influences: ['beaux-arts-export'],
  lookFor: [
    {
      label: 'Square dome',
      note: 'A curved slate dome on a square base with a lantern, in the manner of the new Louvre. Under it the grand staircase, where Puvis de Chavannes painted the walls at Amiens.',
      at: [0, 20.5, DOME_Z + 4.6],
    },
    {
      label: 'Corner pavilions',
      note: 'Each end of the front is a pavilion standing slightly forward under its own tall slate roof, an old French habit made grand under Napoleon III.',
      at: [HX - PAV / 2, EAVES + 3.0, PAV_Z + 0.3],
    },
    {
      label: 'Top-lit galleries',
      note: 'Glazed lanterns along the roofs light the picture galleries from above, leaving the walls free for hanging and the light even.',
      at: [-(HX - RD / 2), EAVES + 2.4, -4],
    },
    {
      label: 'Blind upper storey',
      note: 'Above the ground-floor arches the walls have panels and a carved frieze instead of windows: the rooms behind are lit from the roof.',
      at: [-8.5, PL + G + 2.4, ZF + 0.2],
    },
    {
      label: 'Sculpture',
      note: 'Statues stand on the entrance front and on the skyline, presenting the arts the museum holds.',
      at: [0, EAVES + 3.0, ZF + 3.4],
    },
  ],
  build(b) {
    const stone = tint(P.pierreBlonde, b.range(-0.02, 0.02));
    const stoneDk = tint(stone, -0.08);
    const roof = tint(P.ardoise, b.range(-0.02, 0.02));
    const sculpt = tint(P.craie, -0.02);
    const gold = tint(P.gold, -0.08);

    // ------------------------------------------------ the ranges round two courtyards
    const depth = ZF - ZB;
    range(b, 0, ZF - RD / 2, HX * 2 - 2 * PAV + 0.2, RD, true, stone, roof); // front range between the pavilions
    range(b, 0, ZB + RD / 2, HX * 2, RD, true, stone, roof); // back range
    b.sym((s) => range(b, s * (HX - RD / 2), (ZB + RD + PAV_Z - PAV + 0.2) / 2, RD, PAV_Z - PAV + 0.2 - ZB - RD, false, stone, roof)); // side ranges
    range(b, 0, (ZB + RD + ZF - RD) / 2, 8, ZF - ZB - 2 * RD, false, stone, roof); // cross range under the dome
    b.box(HX * 2 + 0.3, PL, depth + 0.3, stoneDk, { at: [0, 0, (ZF + ZB) / 2] }); // plinth
    // courtyard floors
    b.sym((s) => b.box(HX - RD - 4 - 0.1, 0.05, ZF - ZB - 2 * RD, P.gravel, { at: [s * (4 + (HX - RD - 4) / 2), PL, (ZF + ZB) / 2] }));

    // ------------------------------------------------ the corner pavilions under tall roofs
    b.sym((s) => {
      const px = s * (HX - PAV / 2 + 0.3);
      const pz = PAV_Z - PAV / 2;
      const ph = EAVES + 1.0;
      b.box(PAV + 0.6, ph, PAV, stone, { at: [px, 0, pz] });
      b.box(PAV + 1.1, 0.55, PAV + 0.5, stoneDk, { at: [px, ph - 0.55, pz] });
      // quoins, a tall arched window below, a niche with a statue above
      for (const dx of [-1, 1]) b.panel(0.7, ph - PL - 0.6, tint(stone, 0.04), { at: [px + dx * (PAV / 2 - 0.1), PL, PAV_Z], depth: 0.14 });
      b.panel(1.9, 4.4, P.windowDark, { at: [px, PL + 0.6, PAV_Z], shape: 'round', depth: 0.04 });
      b.panel(2.4, 0.3, stoneDk, { at: [px, PL + 5.3, PAV_Z], depth: 0.16 });
      b.panel(1.4, 3.0, tint(stone, -0.12), { at: [px, PL + G + 1.0, PAV_Z], shape: 'round', depth: 0.02 });
      statue(b, [px, PL + G + 1.1, PAV_Z + 0.25], 2.4, sculpt);
      b.panel(1.5, 4.4, P.windowDark, { at: [px + s * (PAV / 2 + 0.3), PL + 0.6, pz], facing: s > 0 ? '+x' : '-x', shape: 'round', depth: 0.04 });
      // the roof: a tall truncated pyramid with a crest of lead
      b.group({ at: [px, ph, pz] }, () => {
        b.lathe([[(PAV + 0.9) * 0.71, 0], [(PAV - 1.6) * 0.71, 4.6], [0.01, 4.6]], roof, { segs: 4, start: Math.PI / 4, jitter: false });
        b.box(2.2, 0.35, 2.2, P.lead, { at: [0, 4.6, 0] });
        b.cone(0.18, 1.6, gold, { at: [0, 4.9, 0], segs: 5 });
        // a dormer on the front of the roof
        b.box(1.2, 1.4, 1.0, stone, { at: [0, 0.8, PAV / 2 - 0.5] });
        b.panel(0.7, 1.0, P.windowDark, { at: [0, 0.95, PAV / 2], shape: 'round' });
        b.gable(1.4, 1.2, 0.6, roof, { at: [0, 2.2, PAV / 2 - 0.5], ridge: 'z' });
      });
    });

    // ------------------------------------------------ the front: arched ground floor, blind upper storey
    const ground = (x: number, z: number, facing: '+z' | '-z' | '+x' | '-x') => {
      b.panel(1.7, 3.8, P.windowDark, { at: [x, PL + 0.8, z], facing, shape: 'round', depth: 0.04 });
      b.panel(0.4, 0.55, stone, { at: [x, PL + 4.1, z], facing, depth: 0.14 });
    };
    const blind = (x: number, z: number, facing: '+z' | '-z' | '+x' | '-x') => {
      b.panel(1.9, 2.6, tint(stone, -0.05), { at: [x, PL + G + 1.2, z], facing, depth: 0.08 });
      b.panel(1.4, 2.1, tint(stone, 0.03), { at: [x, PL + G + 1.45, z], facing, depth: 0.12 });
    };
    const frontXs = [-9.2, -6.8, 6.8, 9.2];
    for (const x of frontXs) {
      ground(x, ZF, '+z');
      blind(x, ZF, '+z');
    }
    for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) {
      b.panel(HX * 2 - (z === ZF ? 2 * PAV : 0), 0.35, stoneDk, { at: [0, PL + G - 0.1, z], facing: f, depth: 0.16 }); // string course
      b.panel(HX * 2 - (z === ZF ? 2 * PAV : 0), 0.7, tint(stone, -0.12), { at: [0, EAVES - 1.3, z], facing: f, depth: 0.06 }); // frieze
    }
    // sides and back
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      for (let z = ZB + 2.2; z < PAV_Z - PAV - 1; z += 3.2) {
        ground(s * HX, z, f);
        blind(s * HX, z, f);
      }
      b.panel(ZF - PAV - ZB, 0.35, stoneDk, { at: [s * HX, PL + G - 0.1, (ZF - PAV + ZB) / 2], facing: f, depth: 0.16 });
      b.panel(ZF - PAV - ZB, 0.7, tint(stone, -0.12), { at: [s * HX, EAVES - 1.3, (ZF - PAV + ZB) / 2], facing: f, depth: 0.06 });
    });
    for (let x = -HX + 2.2; x < HX - 1; x += 3.2) {
      if (Math.abs(x) < 1.2) {
        b.panel(1.8, 3.2, P.doorBlack, { at: [x, PL, ZB], facing: '-z', shape: 'round' });
        continue;
      }
      ground(x, ZB, '-z');
      b.window(1.3, 1.8, { at: [x, PL + G + 1.6, ZB], facing: '-z', frame: stone });
    }
    // courtyard faces of the ranges: plain windows on both floors
    b.sym((s) => {
      for (const x of [s * 6.2, s * 8.6, s * 11.0]) {
        for (const [z, f] of [[ZF - RD, '-z'], [ZB + RD, '+z']] as const) {
          b.window(1.3, 2.8, { at: [x, PL + 1.2, z], facing: f, frame: stone });
          b.window(1.3, 2.2, { at: [x, PL + G + 1.6, z], facing: f, frame: stone });
        }
      }
    });

    // ------------------------------------------------ the centre: entrance pavilion, sculpture, dome
    const cz = ZF + 1.6;
    const cw = 10.4;
    const ch = EAVES + 1.6;
    b.box(cw, ch, 3.2, stone, { at: [0, 0, cz] });
    b.box(cw + 0.6, 0.6, 3.7, stoneDk, { at: [0, ch - 0.6, cz + 0.1] });
    b.stairs(8, PL, 1.8, 4, stoneDk, { at: [0, 0, cz + 1.6 + 0.9] });
    // three arched doorways between paired columns, a tall window over each
    for (const x of [-3, 0, 3]) {
      b.panel(1.9, 4.2, P.doorBlack, { at: [x, PL, cz + 1.6], shape: 'round' });
      b.window(1.5, 3.0, { at: [x, PL + G + 0.8, cz + 1.6], frame: stone, shape: 'round', bars: [2, 1] });
    }
    for (const x of [-4.6, -1.5, 1.5, 4.6]) {
      for (const d of [-0.32, 0.32]) {
        b.column(0.24, G - 0.2, stone, { at: [x + d, PL, cz + 1.9], order: 'ionic', segs: 6 });
        b.column(0.22, EAVES - PL - G - 0.8, stone, { at: [x + d, PL + G, cz + 1.9], order: 'corinthian', segs: 6 });
      }
      b.box(1.2, 0.3, 0.7, stoneDk, { at: [x, PL + G - 0.2, cz + 1.9] });
    }
    // the attic with a sculpted group and a segmental pediment
    b.box(cw - 1.2, 1.8, 0.8, stone, { at: [0, ch, cz + 1.0] });
    b.extrude([[-cw / 2 + 0.6, 0], [cw / 2 - 0.6, 0], [cw / 2 - 1.2, 0.8], [2.6, 1.7], [0, 2.0], [-2.6, 1.7], [-cw / 2 + 1.2, 0.8]], 0.9, stoneDk, { at: [0, ch + 1.8, cz + 1.0] });
    for (const [x, h] of [[0, 2.6], [-1.3, 2.0], [1.3, 2.0]] as const) statue(b, [x, ch + 1.85, cz + 1.55], h, sculpt);
    b.sym((s) => {
      b.box(1.0, 1.0, 1.0, stone, { at: [s * (cw / 2 - 0.4), ch, cz + 1.0] });
      statue(b, [s * (cw / 2 - 0.4), ch + 1.0, cz + 1.0], 2.3, sculpt);
    });
    balustrade(b, [-cw / 2 + 0.2, cz - 0.9], [-1.9, cz - 0.9], ch, stone, 0.9, 0.8);
    balustrade(b, [1.9, cz - 0.9], [cw / 2 - 0.2, cz - 0.9], ch, stone, 0.9, 0.8);
    // the square dome on its drum, with a lantern
    const dy = EAVES + 0.8;
    b.box(9.2, 3.6, 9.2, stone, { at: [0, dy, DOME_Z] });
    b.box(9.8, 0.5, 9.8, stoneDk, { at: [0, dy + 3.6, DOME_Z] });
    for (const [f, x, z] of [['+z', 0, DOME_Z + 4.6], ['-z', 0, DOME_Z - 4.6], ['+x', 4.6, DOME_Z], ['-x', -4.6, DOME_Z]] as const) {
      b.panel(2.0, 2.0, P.windowDark, { at: [x, dy + 0.9, z], facing: f, shape: 'circle', depth: 0.04 });
      b.panel(2.5, 2.5, stoneDk, { at: [x, dy + 0.65, z], facing: f, shape: 'circle', depth: 0.02 });
    }
    b.group({ at: [0, dy + 4.1, DOME_Z] }, () => {
      const prof: [number, number][] = [];
      for (let i = 0; i <= 7; i++) {
        const u = i / 7;
        // a bell profile: steep at the foot, rounding over toward the lantern
        const r = 4.9 * Math.cos((u * Math.PI) / 2) ** 0.8 + 0.9 * u;
        prof.push([r * Math.SQRT2, 5.2 * Math.sin((u * Math.PI) / 2)]);
      }
      b.lathe(prof, roof, { segs: 4, start: Math.PI / 4, jitter: false });
      // gilded ribs on the hips
      for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
        for (let i = 0; i < 7; i++) {
          const [r0, y0] = prof[i];
          const [r1, y1] = prof[i + 1];
          b.beam([r0 * Math.sin(a), y0 + 0.05, r0 * Math.cos(a)], [r1 * Math.sin(a), y1 + 0.05, r1 * Math.cos(a)], 0.16, 0.16, gold);
        }
      }
      // the lantern
      b.box(1.8, 1.6, 1.8, stone, { at: [0, 5.0, 0] });
      for (const r of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) b.panel(0.6, 1.0, P.windowDark, { at: [Math.sin(r) * 0.9, 5.25, Math.cos(r) * 0.9], facing: r, shape: 'round' });
      b.lathe([[1.27, 0], [0.9, 0.6], [0.2, 1.1], [0.01, 1.2]], roof, { at: [0, 6.6, 0], segs: 4, start: Math.PI / 4 });
      b.cone(0.12, 1.4, gold, { at: [0, 7.7, 0], segs: 5 });
    });

    // a lawn and two clipped trees on the forecourt
    b.sym((s) => b.tree(2.4, { at: [s * 12, 0, ZF + 5.5], kind: 'bush' }));

    // ------------------------------------------------ walk collisions
    b.collider(HX * 2, depth, { at: [0, 0, (ZF + ZB) / 2] });
    b.sym((s) => b.collider(PAV + 0.6, PAV, { at: [s * (HX - PAV / 2 + 0.3), 0, PAV_Z - PAV / 2] }));
    b.collider(cw, 3.2, { at: [0, 0, cz] });
  },
};
