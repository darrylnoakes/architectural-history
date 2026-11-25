import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { YARD_WELL, infillPick, onWall, pitched, privy, vegBed, well, yardBounds } from './shared';

const HW = 6.8;
const ZF = 8.2; // the whole front is flush now
const ZB = -1.4;
const G = 3.4;
const F1 = 3.0;
const F2 = 2.8;
const EAVES = G + F1 + F2;

/** St Andrew's cross: two braces crossing in a panel w × h on a wall facing +z, `at` its bottom centre. */
function saltire(b: Builder, at: [number, number, number], w: number, h: number, timber: number): void {
  const [x, y, z] = at;
  b.beam([x - w / 2, y, z + 0.04], [x + w / 2, y + h, z + 0.04], 0.13, 0.07, timber, { jitter: false });
  b.beam([x + w / 2, y, z + 0.04], [x - w / 2, y + h, z + 0.04], 0.13, 0.07, timber, { jitter: false });
}

/** A corner post carved as a little pilaster, with a base, a capital and a candelabrum on its shaft. */
function cornerPost(b: Builder, x: number, y0: number, h: number, timber: number): void {
  const z = ZF + 0.02;
  b.box(0.36, h, 0.14, timber, { at: [x, y0, z] });
  b.box(0.46, 0.18, 0.2, tint(timber, 0.06), { at: [x, y0, z] });
  b.box(0.5, 0.22, 0.22, tint(timber, 0.06), { at: [x, y0 + h - 0.22, z] });
  b.box(0.42, 0.1, 0.2, tint(timber, 0.06), { at: [x, y0 + h - 0.32, z] });
  // the candelabrum: stacked vase and bead shapes in low relief
  const cy = y0 + h / 2;
  b.cyl(0.1, 0.5, tint(timber, 0.1), { at: [x, cy - 0.5, z + 0.12], rTop: 0.05, segs: 6 });
  b.sphere(0.1, tint(timber, 0.1), { at: [x, cy + 0.07, z + 0.12], segs: 6 });
  b.cyl(0.05, 0.45, tint(timber, 0.1), { at: [x, cy + 0.15, z + 0.12], rTop: 0.11, segs: 6 });
}

/** One house of the pair. `render` is the plaster that hides the front frame from the 1760 revision. */
function house(b: Builder, cx: number, o: { infill: number; timber: number; stone: number; roof: number; slate: boolean; stair: boolean; render?: number }): void {
  const { timber, stone, roof } = o;
  const infill = o.render ?? o.infill;
  const skin = o.render ?? timber; // the front timbers that plaster hides
  const D = ZF - ZB;
  const zc = (ZF + ZB) / 2;
  // stone ground storey
  b.box(HW, G, D, stone, { at: [cx, 0, zc] });
  for (let y = 0.4; y < G; y += 0.4) b.box(HW, 0.025, 0.04, tint(stone, -0.12), { at: [cx, y, ZF + 0.005], jitter: false });
  b.box(HW, 0.22, 0.12, tint(stone, 0.05), { at: [cx, G - 0.22, ZF + 0.04] });
  // shop window under a basket arch, and the house door
  const sx = cx - 1.0;
  b.panel(3.3, 2.75, tint(stone, 0.05), { at: [sx, 0, ZF], facing: '+z', shape: 'segmental', depth: 0.03 });
  b.panel(3.0, 2.6, P.windowDark, { at: [sx, 0, ZF], facing: '+z', shape: 'segmental', depth: 0.05 });
  b.box(3.0, 0.95, 0.12, o.timber, { at: [sx, 0, ZF + 0.04] }); // the counter board
  b.window(2.8, 1.35, { at: [sx, 1.0, ZF + 0.04], facing: '+z', frame: timber, glass: P.glassDark, bars: [4, 2], mat: 'glass' });
  b.panel(1.4, 2.6, tint(stone, 0.05), { at: [cx + 2.0, 0, ZF], facing: '+z', shape: 'segmental', depth: 0.03 });
  b.panel(1.1, 2.4, P.oakDark, { at: [cx + 2.0, 0, ZF], facing: '+z', shape: 'segmental', depth: 0.06 });
  b.box(1.5, 0.15, 0.4, tint(stone, 0.05), { at: [cx + 2.0, 0, ZF + 0.2] });

  // the timber storeys, flush with the stone below
  b.box(HW, F1 + F2, D, infill, { at: [cx, G, zc] });
  for (const [y0, h] of [[G, F1], [G + F1, F2]] as [number, number][]) {
    onWall(b, [cx, y0, ZF], '+z', () => {
      b.box(HW, 0.2, 0.08, skin, { at: [0, 0, 0.02] }); // sill beam
      b.box(HW, 0.18, 0.08, skin, { at: [0, h - 0.18, 0.02] }); // wall plate
      b.box(HW, 0.12, 0.07, skin, { at: [0, 0.95, 0.02] }); // window-sill rail
      b.box(HW, 0.12, 0.07, skin, { at: [0, h - 0.6, 0.02] }); // lintel rail
      // studs between the windows
      for (const x of [-2.75, -1.0, -0.05, 1.6, 2.6]) b.box(0.14, h, 0.07, skin, { at: [x, 0, 0.02] });
    });
    // two croisées per floor, St Andrew's crosses beneath
    for (const x of [-1.9, 0.8]) {
      const ww = x < 0 ? 1.55 : 1.35;
      b.window(ww, h - 1.65, { at: [cx + x, y0 + 1.07, ZF + 0.03], facing: '+z', frame: tint(timber, 0.08), glass: P.glassDark, bars: [2, 2], mat: 'glass', border: 0.09 });
      saltire(b, [cx + x, y0 + 0.2, ZF], ww, 0.75, skin);
    }
    saltire(b, [cx + 2.1, y0 + 0.2, ZF], 0.85, 0.75, skin);
    saltire(b, [cx - 3.1, y0 + 0.2, ZF], 0.5, h - 0.4, skin);
  }
  cornerPost(b, cx - HW / 2 + 0.2, G, F1 + F2, skin);
  cornerPost(b, cx + HW / 2 - 0.2, G, F1 + F2, skin);
  // carved brackets carrying the eaves
  for (const x of [-2.75, -1.0, 1.6, 2.6]) {
    b.box(0.16, 0.5, 0.4, timber, { at: [cx + x, EAVES - 0.5, ZF + 0.2] });
    b.box(0.16, 0.14, 0.55, tint(timber, 0.06), { at: [cx + x, EAVES - 0.14, ZF + 0.27] });
  }
  b.box(HW, 0.2, 0.7, timber, { at: [cx, EAVES - 0.02, ZF + 0.3] });

  // steep roof to street and yard, with a lucarne in front
  const rise = 5.4;
  pitched(b, HW, D, rise, roof, { at: [cx, EAVES, zc], ridge: 'x', overhang: 0.55, ends: 0, wall: infill, thick: 0.12, courses: o.slate ? 11 : 9 });
  const lx = cx - 0.8;
  const lz = ZF - 0.05;
  onWall(b, [lx, EAVES, lz], '+z', () => {
    b.box(2.0, 2.2, 1.6, infill, { at: [0, 0, -0.8] });
    b.box(2.0, 0.14, 0.12, timber, { at: [0, 0, 0.04] });
    b.sym((s) => {
      b.box(0.2, 2.2, 0.12, timber, { at: [s * 0.9, 0, 0.04] });
      b.box(0.28, 0.14, 0.18, tint(timber, 0.06), { at: [s * 0.9, 2.06, 0.06] });
      b.cone(0.1, 0.5, tint(timber, 0.06), { at: [s * 0.9, 2.2, 0.06], segs: 6 });
    });
    b.window(1.2, 1.5, { at: [0, 0.35, 0.05], frame: tint(timber, 0.08), glass: P.glassDark, bars: [2, 2], mat: 'glass' });
    pitched(b, 2.3, 1.7, 1.15, roof, { at: [0, 2.2, -0.75], ridge: 'z', overhang: 0.06, ends: 0.12, wall: infill, thick: 0.1 });
    b.cone(0.07, 0.6, P.lead, { at: [0, 3.32, 0.05], segs: 6 });
  });

  // brick chimney on the party wall
  b.chimney(0.9, 3.2, 1.2, tint(P.briqueNord, 0.04), { at: [cx + HW / 2 - 0.5, EAVES + rise - 1.6, zc] });

  // back: plain framing, glazed windows; a timber stair turret in the yard
  b.frame(HW, F1 + F2, timber, { at: [cx, G, ZB], facing: '-z', studs: 5, rails: 2, brace: 'corner', beam: 0.15, depth: 0.04 });
  b.panel(1.0, 2.2, P.oakDark, { at: [cx + 2.2, 0, ZB], facing: '-z', shape: 'segmental' });
  b.window(1.2, 1.3, { at: [cx - 0.4, 1.0, ZB - 0.02], facing: '-z', frame: timber, glass: P.glassDark, bars: [2, 2], mat: 'glass' });
  for (const y of [G + 1.0, G + F1 + 0.9]) b.window(1.1, 1.2, { at: [cx + 1.2, y, ZB - 0.02], facing: '-z', frame: timber, glass: P.glassDark, bars: [2, 2], mat: 'glass' });
  if (o.stair) {
    const tx = cx - 1.6;
    const tz = ZB - 1.15;
    const th = EAVES + 1.2;
    b.cyl(1.25, th, infill, { at: [tx, 0, tz], segs: 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.box(0.14, th, 0.14, timber, { at: [tx + Math.sin(a) * 1.18, 0, tz + Math.cos(a) * 1.18], rotY: a });
    }
    for (const y of [G, G + F1, th - 0.15]) b.cyl(1.3, 0.15, timber, { at: [tx, y, tz], segs: 8 });
    for (let i = 0; i < 4; i++) b.window(0.45, 0.75, { at: [tx + Math.sin(-2.2 + i * 0.35) * 1.24, 1.3 + i * 2.1, tz + Math.cos(-2.2 + i * 0.35) * 1.24], facing: -2.2 + i * 0.35, frame: timber, glass: P.glassDark });
    b.cone(1.55, 3.0, roof, { at: [tx, th, tz], segs: 8 });
    b.cone(0.07, 0.7, P.lead, { at: [tx, th + 2.9, tz], segs: 6 });
    b.panel(0.9, 2.0, P.oakDark, { at: [tx, 0, tz - 1.25], facing: '-z' });
  }
}

export const renaissanceHouse: BuildingDef = {
  id: 'renaissance-house',
  name: 'Renaissance timber-framed house',
  style: 'Renaissance',
  date: 'c. 1530',
  revisions: [
    {
      year: 1760,
      note: 'The timber storeys are plastered over, carved posts and crosses and all, to meet the fire rules and the new taste for fronts that look like stone.',
    },
  ],
  summary:
    'Houses were still framed in oak, but the fronts now rise flat from the street: from the sixteenth century town authorities discouraged and then forbade new jetties (Paris banned them in 1607), because they spread fire and darkened the streets. ' +
    'The ground floor is built of stone, and the new taste brought back from Italy shows in the carving: corner posts dressed as little pilasters with capitals, brackets under the eaves, a dormer (lucarne) with pinnacles. ' +
    'The windows are glazed casements divided by a mullion and transom (the croisée), and under them the braces cross as St Andrew’s crosses. Behind, a timber stair turret serves every floor.',
  materials: ['cut limestone ground floor', 'oak frame with carved posts', 'plastered torchis infill', 'glazed casements', 'tile or slate roof'],
  influences: ['italian-renaissance'],
  lookFor: [
    {
      label: 'Carved corner post',
      note: 'The post at the corner is carved as a pilaster with a base, a capital and a candelabrum on its shaft: Italian ornament on a French frame.',
      at: [-6.6, 6.4, 8.45],
    },
    {
      label: 'St Andrew’s crosses',
      note: 'Diagonal braces crossing under the windows, the croix de Saint-André, stiffen the frame and became a favourite pattern.',
      at: [-5.3, 4.1, 8.35],
    },
    {
      label: 'Glazed croisée window',
      note: 'A mullion and a transom divide the window into four lights filled with small panes: glass has reached the ordinary house.',
      at: [-5.3, 5.5, 8.35],
    },
    {
      label: 'Flush front on a stone ground floor',
      note: 'No more jetties: the timber storeys rise straight from a ground floor of cut stone, safer from fire and damp.',
      at: [-2.6, 2.4, 8.35],
    },
    {
      label: 'Lucarne',
      note: 'A tall dormer rising from the wall face lights the attic, framed by little pinnacles: a feature French builders loved.',
      at: [-4.2, 11.4, 8.4],
    },
  ],
  build(b) {
    const stone = tint(b.pick([P.pierreBlonde, P.craie]), b.range(-0.04, 0.0));
    const timber = b.pick([P.oak, P.oakDark, tint(P.oak, -0.04)]);
    const slateA = b.chance(0.5);
    const plastered = b.since(1760);
    house(b, -HW / 2, {
      render: plastered ? P.plaster : undefined,
      infill: infillPick(b),
      timber,
      stone,
      roof: slateA ? tint(P.ardoise, b.range(-0.02, 0.03)) : tint(P.tuilePlate, b.range(-0.04, 0.02)),
      slate: slateA,
      stair: true,
    });
    const slateB = b.chance(0.4);
    house(b, HW / 2, {
      render: plastered ? tint(P.limewash, -0.05) : undefined,
      infill: infillPick(b),
      timber: b.pick([P.oak, P.oakDark]),
      stone: tint(stone, b.range(-0.03, 0.03)),
      roof: slateB ? tint(P.ardoise, b.range(-0.02, 0.03)) : tint(P.tuilePlate, b.range(-0.06, 0.0)),
      slate: slateB,
      stair: false,
    });
    // the yards
    // the walls of the old yards and the shared well, given a new iron winding gear
    const cope = tint(P.tuilePlate, -0.03);
    yardBounds(b, ZB, tint(P.rubble, 0.03), cope, 'well');
    b.box(6.5, 0.03, 2.6, P.cobble, { at: [-3.4, 0, -2.8], jitter: false });
    well(b, YARD_WELL, P.pierreBlonde, { frame: 'iron' });
    privy(b, [-1.0, 0, -7.9], 0, tint(P.oak, 0.1), cope);
    vegBed(b, 3.4, -5.4, 5.2, 5.4, { rows: 7 });
    b.tree(b.range(3.4, 4.2), { at: [-3.4, 0, -7.6], kind: 'round', color: P.leaf });
  },
};
