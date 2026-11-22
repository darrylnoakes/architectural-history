import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

// Plan (front at +Z): a porch, a front block with a top-lit hall in the middle, and a
// semicircular bookstack behind.
const HX = 13.5; // half width of the front block
const ZF = 7.0; // its front face
const ZB = -3.0; // its back face
const H = 9.6; // parapet top of the wings
const PORCH_Z = 11.2; // front of the porch pillars
const HALL_W = 9.0;
const HALL_H = 12.0;
const STACK_R = 11.0;
const STACK_H = 12.6;

/** A fluted pilaster: a flat strip with three grooves. */
function fluted(b: Builder, x: number, y: number, z: number, h: number, w: number, stone: number, facing: '+z' | '-z' | '+x' | '-x' | number = '+z'): void {
  b.panel(w, h, stone, { at: [x, y, z], facing, depth: 0.14 });
  const fa = typeof facing === 'number' ? facing : { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  for (const d of [-w / 4, 0, w / 4]) {
    const ox = Math.cos(fa) * d;
    const oz = -Math.sin(fa) * d;
    b.panel(0.06, h - 0.4, tint(stone, -0.12), { at: [x + ox, y + 0.2, z + oz], facing, depth: 0.16 });
  }
}

/** A tall window with an Art Deco iron grille: a frame, the glass, and a grid with a stepped head. */
function decoWindow(b: Builder, x: number, y: number, z: number, w: number, h: number, stone: number, facing: '+z' | '-z' | '+x' | '-x' | number = '+z'): void {
  b.window(w, h, { at: [x, y, z], facing, frame: stone, bars: [3, 5], glass: tint(P.windowDark, 0.04) });
  const fa = typeof facing === 'number' ? facing : { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  b.group({ at: [x, y, z], rotY: fa }, () => {
    // the stepped head over the window and the spandrel panel under it
    b.panel(w + 0.4, 0.3, stone, { at: [0, h + 0.05, 0], depth: 0.12 });
    b.panel(w * 0.6, 0.3, stone, { at: [0, h + 0.35, 0], depth: 0.12 });
    b.panel(w * 0.85, 0.55, tint(stone, -0.1), { at: [0, -0.75, 0], depth: 0.06 });
  });
}

export const carnegieLibrary: BuildingDef = {
  id: 'carnegie-library',
  name: 'Carnegie library',
  style: 'Art Deco',
  date: '1927',
  summary:
    'The town was shelled for four years, and the circus and much of the centre were left in ruins. Among the gifts from abroad for the rebuilding is a public library, paid for by the Carnegie Endowment for International Peace. ' +
    'It is a temple of learning in the new Art Deco manner: a symmetrical stone front with fluted pilasters and a stepped attic, a porch glittering with mosaic, iron grilles in geometric patterns, and a top-lit entrance hall under a ceiling of stained glass. ' +
    'Behind, the books live in a separate semicircular stack of many floors, fireproof and lit by narrow slits; the public rooms in front are for reading, where the museum had been for looking.',
  materials: ['reinforced concrete faced with limestone', 'mosaic', 'stained glass', 'wrought iron', 'oak panelling'],
  modelledOn:
    'The Bibliothèque Carnegie, Reims, by Max Sainsaulieu (built 1921 to 1927, opened 1928), simplified: the mosaic porch, the top-lit hall and the bookstack behind follow it; the wings here are generic.',
  influences: ['art-deco', 'reinforced-concrete'],
  lookFor: [
    {
      label: 'Mosaic porch',
      note: 'The porch between four fluted pillars is lined with mosaic in blue and gold, the first thing a reader sees.',
      at: [0, 5.6, ZF + 0.4],
    },
    {
      label: 'Stepped attic',
      note: 'The skyline rises in steps over the entrance, an Art Deco habit taken from ziggurats and skyscrapers rather than from Greek temples.',
      at: [0, H + 2.6, PORCH_Z - 1.4],
    },
    {
      label: 'Wrought-iron grilles',
      note: 'The tall windows and the doors are screened by iron grilles in geometric patterns, the work of the decorative ironsmiths the 1920s loved.',
      at: [-7.2, 3.4, ZF + 0.2],
    },
    {
      label: 'Top-lit hall',
      note: 'The entrance hall in the middle rises above the wings and is lit from a glass roof, through a ceiling of stained glass.',
      at: [0, HALL_H + 1.0, 2.0],
    },
    {
      label: 'Semicircular bookstack',
      note: 'The books are kept apart from the readers, in a tall stack of iron shelves on many low floors, lit by slits between the piers.',
      at: [STACK_R * 0.7 + 0.3, 8.0, ZB - STACK_R * 0.7],
    },
  ],
  build(b) {
    const stone = tint(P.pierreBlonde, b.range(-0.01, 0.03));
    const stoneDk = tint(stone, -0.08);
    const mosaicBlue = mix(P.doorBlue, P.cladBlue, 0.5);
    const gold = tint(P.gold, -0.04);
    const iron = P.castIron;
    const roof = tint(P.concrete, -0.05);

    // ------------------------------------------------ the front block
    const d = ZF - ZB;
    const zm = (ZF + ZB) / 2;
    b.box(HX * 2, H, d, stone, { at: [0, 0, zm] });
    b.box(HX * 2 + 0.3, 0.8, d + 0.3, stoneDk, { at: [0, 0, zm] }); // plinth
    b.box(HX * 2 + 0.3, 0.4, d + 0.3, stoneDk, { at: [0, H - 1.3, zm] }); // cornice
    b.box(HX * 2 - 0.8, 0.1, d - 0.8, roof, { at: [0, H, zm] });
    // a chevron frieze under the cornice
    for (let i = 0; i < 22; i++) {
      const x = -HX + 0.7 + i * ((HX * 2 - 1.4) / 21);
      if (Math.abs(x) < HALL_W / 2) continue;
      b.extrude([[-0.35, 0], [0, 0.35], [0.35, 0]], 0.1, stoneDk, { at: [x, H - 2.0, ZF + 0.05] });
    }
    // the wings: fluted pilasters and three tall windows a side
    b.sym((s) => {
      for (const x of [5.0, 9.2, 13.0]) fluted(b, s * x, 0.8, ZF, H - 2.2, 0.8, stone);
      for (const x of [7.1, 11.1]) decoWindow(b, s * x, 1.9, ZF, 2.0, 5.3, stone);
      // the ends
      for (const z of [ZB + 2.6, ZF - 2.6]) decoWindow(b, s * HX, 1.9, z, 1.8, 5.3, stone, s > 0 ? '+x' : '-x');
      fluted(b, s * HX, 0.8, zm, H - 2.2, 0.8, stone, s > 0 ? '+x' : '-x');
      // the back of the wings
      decoWindow(b, s * 10.8, 1.9, ZB, 1.8, 5.3, stone, '-z');
    });

    // ------------------------------------------------ the top-lit hall rising in the middle
    const hz0 = ZB + 0.5;
    const hz1 = ZF;
    b.box(HALL_W, HALL_H, hz1 - hz0, stone, { at: [0, 0, (hz0 + hz1) / 2] });
    b.box(HALL_W + 0.3, 0.4, hz1 - hz0 + 0.3, stoneDk, { at: [0, HALL_H - 0.6, (hz0 + hz1) / 2] });
    b.sym((s) => {
      for (const z of [hz0 + 2.2, hz1 - 2.2]) b.window(1.2, 1.6, { at: [s * HALL_W / 2, H + 0.4, z], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 2] });
    });
    // its glass roof, a low pyramid on an iron curb
    b.box(HALL_W - 1.2, 0.4, hz1 - hz0 - 1.2, iron, { at: [0, HALL_H, (hz0 + hz1) / 2] });
    b.hip(HALL_W - 1.2, hz1 - hz0 - 1.2, 1.6, mix(P.glass, P.glassGreen, 0.3), { at: [0, HALL_H + 0.4, (hz0 + hz1) / 2], mat: 'glass' });

    // ------------------------------------------------ the porch: four fluted pillars, mosaic, stepped attic
    const pz = PORCH_Z;
    const ph = 7.6;
    b.stairs(10.6, 0.8, 1.8, 4, stoneDk, { at: [0, 0, pz + 0.9] });
    b.box(10.4, 0.8, pz - ZF, stoneDk, { at: [0, 0, (ZF + pz) / 2] });
    // floor mosaic: a border and a sunburst of gold
    b.box(7.6, 0.03, pz - ZF - 1.0, mosaicBlue, { at: [0, 0.8, (ZF + pz) / 2], jitter: false });
    b.box(3.0, 0.04, 1.6, gold, { at: [0, 0.8, (ZF + pz) / 2], jitter: false });
    for (const x of [-4.2, -1.4, 1.4, 4.2]) {
      b.box(0.9, ph - 0.8, 0.9, stone, { at: [x, 0.8, pz - 0.6] });
      for (const dx of [-0.22, 0, 0.22]) b.box(0.07, ph - 1.4, 0.05, stoneDk, { at: [x + dx, 1.1, pz - 0.13] });
      b.box(1.1, 0.4, 1.1, stoneDk, { at: [x, ph - 0.4, pz - 0.6] }); // capital
    }
    b.sym((s) => b.box(0.6, ph, pz - ZF - 0.2, stone, { at: [s * 5.0, 0, (ZF + pz) / 2 - 0.1] })); // side walls
    b.box(10.6, 1.6, pz - ZF + 0.2, stone, { at: [0, ph, (ZF + pz) / 2] }); // entablature
    b.box(10.2, 0.08, pz - ZF - 0.4, mix(mosaicBlue, gold, 0.25), { at: [0, ph - 0.06, (ZF + pz) / 2], jitter: false }); // mosaic ceiling
    b.panel(7.2, 0.6, gold, { at: [0, ph + 0.5, pz + 0.1], depth: 0.04 }); // the name: BIBLIOTHÈQUE
    // stepped attic over the porch
    b.box(9.0, 1.1, 2.0, stone, { at: [0, ph + 1.6, pz - 1.4] });
    b.box(6.0, 1.1, 1.6, stone, { at: [0, ph + 2.7, pz - 1.6] });
    b.box(3.0, 1.0, 1.2, stone, { at: [0, ph + 3.8, pz - 1.8] });
    b.panel(2.2, 0.9, gold, { at: [0, ph + 3.85, pz - 1.2], shape: 'segmental', depth: 0.04 }); // sunburst
    // the mosaic on the wall inside the porch, round the doors
    b.panel(9.2, ph - 1.0, mosaicBlue, { at: [0, 0.8, ZF], depth: 0.04 });
    for (const x of [-3.4, 3.4]) b.panel(1.6, 3.4, gold, { at: [x, 3.2, ZF + 0.02], shape: 'round', depth: 0.05 });
    for (const x of [-3.4, 3.4]) b.panel(1.2, 3.0, mix(mosaicBlue, P.white, 0.25), { at: [x, 3.4, ZF + 0.04], shape: 'round', depth: 0.05 });
    b.panel(5.2, 0.4, gold, { at: [0, 5.6, ZF + 0.02], depth: 0.05 });
    // bronze doors behind iron grilles
    b.panel(3.4, 4.0, tint(P.bronze, -0.1), { at: [0, 0.8, ZF + 0.03], depth: 0.06 });
    for (let i = 0; i <= 6; i++) b.panel(0.06, 4.0, iron, { at: [-1.7 + i * (3.4 / 6), 0.8, ZF + 0.06], depth: 0.06 });
    for (const y of [1.6, 2.6, 3.6]) b.panel(3.4, 0.06, iron, { at: [0, 0.8 + y, ZF + 0.06], depth: 0.06 });
    b.panel(3.2, 0.9, gold, { at: [0, 4.9, ZF + 0.03], shape: 'segmental', depth: 0.06 }); // fanlight

    // ------------------------------------------------ the semicircular bookstack
    b.group({ at: [0, 0, ZB] }, () => {
      b.lathe([[STACK_R, 0], [STACK_R, STACK_H]], tint(stone, -0.03), { start: Math.PI / 2, sweep: Math.PI, segs: 14, jitter: false });
      b.lathe([[STACK_R + 0.2, 0], [STACK_R + 0.2, 0.8]], stoneDk, { start: Math.PI / 2, sweep: Math.PI, segs: 14, jitter: false });
      b.lathe([[STACK_R - 0.1, STACK_H - 0.6], [STACK_R + 0.35, STACK_H - 0.6], [STACK_R + 0.35, STACK_H], [0.01, STACK_H]], stoneDk, { start: Math.PI / 2, sweep: Math.PI, segs: 14, jitter: false });
    });
    for (let i = 0; i < 14; i++) {
      // piers at the joints, a narrow slit window between each pair
      const a = Math.PI / 2 + (i * Math.PI) / 14;
      const am = a + Math.PI / 28;
      if (i > 0) b.box(0.5, STACK_H - 1.4, 0.35, stone, { at: [STACK_R * Math.sin(a), 0.8, ZB + STACK_R * Math.cos(a)], rotY: a });
      const r = STACK_R * Math.cos(Math.PI / 28);
      b.panel(0.7, STACK_H - 3.0, tint(P.windowDark, 0.06), { at: [r * Math.sin(am), 1.5, ZB + r * Math.cos(am)], facing: am, depth: 0.04 });
      for (const y of [4.6, 8.4]) b.panel(0.8, 0.25, stone, { at: [r * Math.sin(am), y, ZB + r * Math.cos(am)], facing: am, depth: 0.08 });
    }
    b.sym((s) => b.box(0.8, STACK_H, 0.6, stone, { at: [s * (STACK_R - 0.1), 0, ZB - 0.3] }));
    // the flat face of the stack, standing above the front block
    b.box(STACK_R * 2, STACK_H, 0.4, tint(stone, -0.03), { at: [0, 0, ZB - 0.2] });
    b.box(STACK_R * 2 + 0.7, 0.6, 0.8, stoneDk, { at: [0, STACK_H - 0.6, ZB - 0.2] });
    b.sym((s) => {
      for (const x of [6.2, 8.6]) b.panel(0.7, 1.8, tint(P.windowDark, 0.06), { at: [s * x, H + 0.4, ZB], depth: 0.04 });
    });

    // ------------------------------------------------ the garden in front
    b.sym((s) => {
      b.box(7.0, 0.08, 4.6, P.grass, { at: [s * 9.2, 0, ZF + 3.0] });
      for (const x of [6.6, 11.8]) b.tree(1.6, { at: [s * x, 0, ZF + 4.6], kind: 'bush', color: P.hedge });
      b.cone(0.5, 2.6, P.hedge, { at: [s * 9.2, 0, ZF + 3.0], segs: 6 });
    });

    // ------------------------------------------------ walk collisions: the blocks and the porch piers
    b.collider(HX * 2, d, { at: [0, 0, zm] });
    b.collider(STACK_R * 2, STACK_R, { at: [0, 0, ZB - STACK_R / 2] });
    for (const x of [-4.2, -1.4, 1.4, 4.2]) b.collider(0.9, 0.9, { at: [x, 0, pz - 0.6] });
    b.sym((s) => b.collider(0.6, pz - ZF, { at: [s * 5.0, 0, (ZF + pz) / 2] }));
  },
};
