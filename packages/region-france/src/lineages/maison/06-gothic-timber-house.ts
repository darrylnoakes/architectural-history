import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { YARD_WELL, infillPick, pitched, privy, shutters, vegBed, well, yardBounds } from './shared';

/** Storey levels and front lines of the jettied house (shared by both houses of the pair). */
const G = 3.2; // ground storey
const F1 = 2.8;
const F2 = 2.6;
const Z0 = 7.0; // ground-floor front
const JET = 0.5; // each jetty
const ZB = -1.2; // back wall
const HW = 6.8; // width of one house

/**
 * One house of the pair. `render` is the lime plaster that covers the front once the town's fire
 * rules require it (the 1700 revision): the frame and its panels then take one colour.
 */
function jettiedHouse(b: Builder, cx: number, o: { infill: number; timber: number; tile: number; shut: number; render?: number }): void {
  const { timber, tile, shut } = o;
  const infill = o.render ?? o.infill;
  const skin = o.render ?? timber; // the front timbers that plaster hides
  const sill = tint(P.rubble, b.range(-0.03, 0.03));
  const y1 = G;
  const y2 = G + F1;
  const y3 = G + F1 + F2;
  const z1 = Z0 + JET;
  const z2 = Z0 + JET * 2;
  const z3 = z2 + 0.35; // the gable oversails once more

  // ground storey: a stone sill wall and a timber frame
  b.box(HW, 0.6, Z0 - ZB, sill, { at: [cx, 0, (Z0 + ZB) / 2] });
  b.box(HW, G - 0.6, Z0 - ZB, infill, { at: [cx, 0.6, (Z0 + ZB) / 2] });
  // upper storeys, each pushed forward over the street
  b.box(HW, F1, z1 - ZB, infill, { at: [cx, y1, (z1 + ZB) / 2] });
  b.box(HW, F2, z2 - ZB, infill, { at: [cx, y2, (z2 + ZB) / 2] });
  // the floor beams and the ends of the joists under each jetty
  for (const [y, zf, zp] of [[y1, z1, Z0], [y2, z2, z1]] as [number, number, number][]) {
    b.box(HW, 0.22, 0.24, timber, { at: [cx, y - 0.02, zf - 0.08] });
    for (let i = 0; i < 10; i++) b.box(0.14, 0.16, JET + 0.05, timber, { at: [cx - HW / 2 + 0.3 + (i * (HW - 0.6)) / 9, y - 0.17, (zf + zp) / 2] });
    // carved brackets on the posts
    for (const x of [-HW / 2 + 0.2, -HW / 2 + 2.4, HW / 2 - 2.4, HW / 2 - 0.2]) {
      b.beam([cx + x, y - 0.95, zp + 0.06], [cx + x, y - 0.17, zf - 0.06], 0.16, 0.16, timber);
    }
  }
  // the frame on each front
  b.frame(HW, G - 0.6, skin, { at: [cx, 0.6, Z0], facing: '+z', studs: 0, rails: 0, beam: 0.18, depth: 0.05 });
  for (const x of [-2.65, 0.85, 1.6, 2.8]) b.box(0.18, G - 0.6, 0.08, skin, { at: [cx + x, 0.6, Z0 + 0.02] });
  b.frame(HW, F1 - 0.2, skin, { at: [cx, y1 + 0.2, z1], facing: '+z', studs: 7, rails: 1, brace: 'corner', beam: 0.15, depth: 0.05 });
  b.frame(HW, F2 - 0.2, skin, { at: [cx, y2 + 0.2, z2], facing: '+z', studs: 7, rails: 1, brace: 'corner', beam: 0.15, depth: 0.05 });
  // door to the passage and stair
  b.panel(1.05, 2.3, tint(timber, 0.08), { at: [cx + 2.2, 0, Z0], facing: '+z', shape: 'pointed', depth: 0.06 });
  b.panel(0.85, 2.15, shut, { at: [cx + 2.2, 0, Z0], facing: '+z', shape: 'pointed', depth: 0.09 });

  // upper windows: unglazed openings closed by board shutters
  for (const x of [-2.1, 0, 2.1]) {
    b.window(1.0, 1.15, { at: [cx + x, y1 + 0.85, z1 + 0.04], facing: '+z', frame: timber, glass: P.timberBlack, border: 0.1 });
    shutters(b, 1.0, 1.15, [cx + x, y1 + 0.85, z1 + 0.06], '+z', shut);
  }
  for (const x of [-1.3, 1.3]) {
    b.window(0.95, 1.05, { at: [cx + x, y2 + 0.8, z2 + 0.04], facing: '+z', frame: timber, glass: P.timberBlack, border: 0.1 });
    shutters(b, 0.95, 1.05, [cx + x, y2 + 0.8, z2 + 0.06], '+z', shut);
  }

  // the gable, oversailing again, with its own frame, and a steep tiled roof
  const rise = 5.0;
  const half = HW / 2;
  b.extrude([[-half, 0], [half, 0], [0, rise]], 0.35, infill, { at: [cx, y3, z2 + 0.175] });
  b.box(HW, 0.2, 0.5, timber, { at: [cx, y3 - 0.05, z2 + 0.1] });
  b.group({ at: [cx, y3, z3] }, () => {
    b.box(0.16, rise - 0.3, 0.06, skin, { at: [0, 0, 0] });
    for (const s of [1, -1]) {
      b.box(0.15, rise * 0.42, 0.06, skin, { at: [s * 1.25, 0, 0] });
      b.beam([s * (half - 0.2), 0.1, 0], [s * 0.2, rise * 0.62, 0], 0.15, 0.06, skin);
    }
    b.box(HW - 1.2, 0.15, 0.06, skin, { at: [0, 1.6, 0] });
  });
  b.window(0.75, 0.9, { at: [cx, y3 + 0.55, z3 + 0.03], facing: '+z', frame: timber, glass: P.timberBlack, border: 0.08 });
  shutters(b, 0.75, 0.9, [cx, y3 + 0.55, z3 + 0.05], '+z', shut);
  pitched(b, HW, z3 - ZB, rise, tile, { at: [cx, y3, (z3 + ZB) / 2], ridge: 'z', overhang: 0.1, ends: 0.25, wall: infill, thick: 0.13, courses: 8 });
  // the barge boards of the gable
  for (const s of [1, -1]) b.beam([cx + s * (half + 0.05), y3 - 0.05, z3 + 0.27], [cx, y3 + rise + 0.1, z3 + 0.27], 0.12, 0.3, timber);
  // a hoist beam in the apex
  b.box(0.18, 0.18, 0.6, timber, { at: [cx, y3 + rise - 1.25, z3 + 0.3] });

  // stone chimney stack at the back of the ridge
  b.chimney(0.9, 2.4, 0.7, tint(P.rubble, 0.04), { at: [cx + 1.0, y3 + rise - 1.6, 0.6] });

  // back: plain frame, small windows, a door to the yard
  b.frame(HW, G - 0.6, timber, { at: [cx, 0.6, ZB], facing: '-z', studs: 4, rails: 1, beam: 0.16, depth: 0.04 });
  b.frame(HW, F1 + F2, timber, { at: [cx, y1, ZB], facing: '-z', studs: 5, rails: 2, brace: 'corner', beam: 0.16, depth: 0.04 });
  b.panel(0.95, 2.1, shut, { at: [cx - 1.8, 0, ZB], facing: '-z', depth: 0.08 });
  for (const [x, y] of [[1.6, 1.3], [-1.2, y1 + 0.9], [1.6, y1 + 0.9], [0.2, y2 + 0.8]]) {
    b.window(0.8, 0.9, { at: [cx + x, y, ZB - 0.04], facing: '-z', frame: timber, glass: P.timberBlack, border: 0.08 });
  }
}

/**
 * The shop in the ground storey of a house centred on cx. As built, a wide opening whose lower shutter
 * is let down as a counter on legs and the upper one lifted as a hood; from the 1860 revision a
 * glazed shopfront with a painted fascia.
 */
function shop(b: Builder, cx: number, shut: number, wares: number[], glazed: boolean): void {
  const sx = cx - 0.9;
  b.box(3.4, 1.65, 0.1, P.windowDark, { at: [sx, 0.85, Z0 + 0.0], jitter: false });
  if (glazed) {
    b.box(3.7, 2.3, 0.14, shut, { at: [sx, 0.6, Z0 + 0.06], jitter: false });
    b.window(3.1, 1.6, { at: [sx, 0.85, Z0 + 0.13], facing: '+z', frame: tint(shut, 0.08), glass: P.glassDark, bars: [3, 1], mat: 'glass', border: 0.08 });
    b.box(3.9, 0.4, 0.22, tint(shut, -0.08), { at: [sx, 2.6, Z0 + 0.1], jitter: false }); // fascia
    return;
  }
  b.box(3.4, 0.08, 0.75, shut, { at: [sx, 0.8, Z0 + 0.42], jitter: false });
  b.sym((s) => b.box(0.08, 0.8, 0.08, shut, { at: [sx + s * 1.55, 0, Z0 + 0.72], jitter: false }));
  b.group({ at: [sx, 2.52, Z0 + 0.06], rot: [-1.15, 0, 0] }, () => b.box(3.4, 0.06, 0.85, shut, { at: [0, 0, 0.42], jitter: false }));
  wares.forEach((c, i) => b.box(0.45, 0.2, 0.4, c, { at: [sx - 1.3 + i * 0.65, 0.88, Z0 + 0.45], jitter: false }));
}

export const gothicTimberHouse: BuildingDef = {
  id: 'gothic-timber-house',
  name: 'Jettied timber-framed house',
  style: 'Gothic',
  date: 'c. 1330',
  revisions: [
    {
      year: 1700,
      note: 'The fronts are plastered over, timbers and all, as the towns now required against fire (Paris had ordered it in 1667); only the jetties still show what lies beneath.',
    },
    {
      year: 1860,
      note: 'The let-down shutters give way to glazed shopfronts with a painted fascia over each.',
    },
    {
      year: 1975,
      note: 'The plaster is stripped and the frame repaired and shown again, as restorers did across the old quarters of Rouen and Troyes from the 1960s.',
    },
  ],
  summary:
    'The ordinary house of the Gothic town was a maison à pans de bois: a frame of oak filled with torchis, clay mixed with straw, on a low stone sill. ' +
    'Plots were narrow, so the house stands gable to the street, and each floor is carried out over the one below on the ends of its joists, propped by brackets: the jetty (encorbellement) gained room over the street. ' +
    'The ground floor is the shop, opened by day with a lower shutter let down as a counter and an upper one hooked up as a hood. Upstairs the windows have shutters but no glass, and smoke now leaves by a stone chimney instead of through the roof.',
  materials: ['oak frame', 'torchis (clay and straw) infill', 'rubble sill wall', 'flat clay tiles'],
  modelledOn:
    'Generic, drawn from the timber-framed streets of Rouen and Troyes. Most of the houses surviving there are of the fifteenth and sixteenth centuries; this earlier house follows their pattern with simpler framing.',
  lookFor: [
    {
      label: 'Jetties on brackets',
      note: 'Each upper floor projects about half a metre over the one below, resting on the joist ends and propped by brackets on the posts.',
      at: [-6.4, 2.6, 7.3],
    },
    {
      label: 'Let-down shop counter',
      note: 'The lower shutter drops onto legs to make a counter (the étal) and the upper one lifts to shade it; at night both close the shop.',
      at: [-4.3, 1.05, 7.75],
    },
    {
      label: 'Gable to the street',
      note: 'On a narrow plot the house turns its gable end to the street, the pignon sur rue, and the rain runs off into the gutters between the houses.',
      at: [-3.4, 11.5, 8.6],
    },
    {
      label: 'Torchis between the timbers',
      note: 'The panels between the studs are filled with staves wrapped in clay and straw, then limewashed or coloured.',
      at: [-2.45, 4.0, 7.56],
    },
    {
      label: 'Shutters, not glass',
      note: 'Window glass was still a luxury: the openings are closed with board shutters, or with oiled cloth or paper in a frame.',
      at: [-1.3, 7.0, 8.1],
    },
  ],
  build(b) {
    const timber = b.pick([P.oak, P.oakDark, tint(P.oak, -0.05)]);
    const tileA = tint(P.tuilePlate, b.range(-0.05, 0.02));
    const tileB = b.chance(0.3) ? tint(P.ardoise, b.range(-0.02, 0.03)) : tint(P.tuilePlate, b.range(-0.08, 0.0));
    // plastered over from 1700 until the restorers stripped the fronts again in 1975
    const plastered = b.since(1700) && !b.since(1975);
    const shutA = shutterPick(b);
    jettiedHouse(b, -HW / 2, { infill: infillPick(b), timber, tile: tileA, shut: shutA, render: plastered ? P.plaster : undefined });
    const shutB = shutterPick(b);
    jettiedHouse(b, HW / 2, {
      infill: infillPick(b),
      timber: b.pick([P.oak, P.oakDark]),
      tile: tileB,
      shut: shutB,
      render: plastered ? tint(P.ochreWash, 0.06) : undefined,
    });
    // the yards behind: a dividing wall, a shared well on the line, privies, gardens
    yardBounds(b, ZB, tint(P.rubble, 0.03), tileA, 'well');
    well(b, YARD_WELL, P.pierreBlonde, { frame: 'wood' });
    privy(b, [-5.6, 0, -7.9], 0, tint(P.oak, 0.08), tileA);
    privy(b, [5.6, 0, -7.9], 0, tint(P.oak, 0.08), tileA);
    vegBed(b, -3.2, -6.4, 3.6, 3.0, { rows: 5 });
    vegBed(b, 3.0, -3.2, 4.0, 2.4, { rows: 4, alongX: true, color: P.leafDark });
    b.box(1.2, 0.9, 0.8, P.oak, { at: [2.0, 0, -7.6] }); // a hen house
    b.shed(1.4, 1.0, 0.3, tileB, { at: [2.0, 0.9, -7.6], high: '-z' });
    b.tree(b.range(3.5, 4.2), { at: [4.3, 0, -6.6], kind: 'round', color: P.leafDark });
    // the shops last, so that refitting them in 1860 moves nothing else
    shop(b, -HW / 2, shutA, [P.cream, P.doorRed, 0x5a6f8a, P.cream, P.ochreWash], b.since(1860));
    shop(b, HW / 2, shutB, [P.terracotta, P.bronze, P.terracotta, P.iron, P.oak], b.since(1860));
  },
};

function shutterPick(b: Builder): number {
  return b.pick([P.oak, P.oakDark, P.voletVert, P.oakSilver, tint(P.doorRed, 0.05)]);
}
