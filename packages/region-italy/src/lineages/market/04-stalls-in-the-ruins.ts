import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { beast, goods, sack, stall } from './shared';

/** A broken stretch of Roman brick-faced wall: a ragged top made of steps of different heights. */
function wallStub(b: Builder, x: number, z: number, len: number, hMax: number, alongX: boolean): void {
  // a ragged top: a random walk of heights, highest toward the middle of the stretch
  const n = Math.max(3, Math.round(len / 0.7));
  const pts: [number, number][] = [[len / 2, 0], [-len / 2, 0]];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const h = Math.max(0.5, hMax * (0.3 + 0.7 * Math.sin(Math.PI * (0.1 + 0.8 * t))) * b.range(0.72, 1.0));
    const x = -len / 2 + t * len;
    pts.push([x, h]);
    if (i < n && b.chance(0.4)) pts.push([x + len / n * 0.5, h * b.range(0.75, 0.95)]);
  }
  b.extrude(pts, 0.6, b.pick([P.cotto, tint(P.cotto, -0.04)]), { at: [x, 0, z], rotY: alongX ? 0 : Math.PI / 2 });
  // courses of brick bonding tiles
  for (const y of [0.9, 2.1]) if (y < hMax * 0.5) b.box(alongX ? len : 0.64, 0.1, alongX ? 0.64 : len, tint(P.cotto, -0.1), { at: [x, y, z] });
  // the old travertine plinth along its foot
  if (alongX) b.box(len + 0.1, 0.5, 0.7, tint(P.travertine, -0.08), { at: [x, 0, z] });
  else b.box(0.7, 0.5, len + 0.1, tint(P.travertine, -0.08), { at: [x, 0, z] });
  b.collider(alongX ? len : 0.7, alongX ? 0.7 : len, { at: [x, 0, z] });
}

/** A column broken off at height h; `cap` keeps its capital (only on the full-height ones). */
function brokenColumn(b: Builder, x: number, z: number, h: number, r: number, color: number): void {
  b.cyl(r * 1.3, 0.25, color, { at: [x, 0, z], segs: 6 });
  b.cyl(r, h, color, { at: [x, 0.25, z], rTop: r * 0.95, segs: 6 });
  b.collider(r * 2.6, r * 2.6, { at: [x, 0, z] });
}

export const stallsInTheRuins: BuildingDef = {
  id: 'stalls-in-the-ruins',
  name: 'Market among the ruins',
  style: 'Early medieval',
  date: 'c. 950',
  summary:
    'Four centuries after the Gothic War the old food market is a field of broken walls and standing columns, but the town still trades here on market day, under licence from the bishop. ' +
    'Stallholders put up trestles and awnings among the ruins and build lean-to booths against the surviving walls, roofed with Roman tiles picked out of the rubble. ' +
    'Marble is worth more as lime than as ruin, so a kiln burns broken columns and statues into mortar for the bishop’s new churches, and a corner of the old court has become a vegetable garden.',
  materials: ['ruined brick-faced concrete', 'reused marble and tile', 'timber poles', 'canvas', 'wattle'],
  lookFor: [
    { label: 'Standing columns', note: 'Three marble columns of the old shrine porch still carry a piece of their beam, as three still stand at the market of Pozzuoli.', at: [0, 7.2, -6.2] },
    { label: 'Lime kiln (calcara)', note: 'Broken marble was burnt here to make lime for mortar; much of ancient Rome went the same way.', at: [8.2, 2.6, -5.6] },
    { label: 'Spolia', note: 'A Roman capital turned upside down serves as a chopping block, and column drums become seats: reused pieces are called spolia.', at: [-1.8, 1.0, 5.6] },
    { label: 'Lean-to booth', note: 'A shop of posts and wattle propped against the old wall, roofed with Roman tiles taken from the rubble.', at: [-9.6, 3.0, -2.0] },
    { label: 'Market awnings', note: 'Cloth stretched over poles shades the trestles on market day and comes down when the traders leave.', at: [3.6, 2.6, 5.2] },
  ],
  influences: [],
  build(b) {
    // rough ground with patches of the old paving
    b.box(25.4, 0.04, 20.8, tint(P.earth, 0.06), { jitter: false });
    for (let i = 0; i < 16; i++) {
      const w = b.range(1.0, 3.2);
      const d = b.range(0.8, 2.4);
      b.box(w, 0.08, d, tint(P.travertine, b.range(-0.12, -0.02)), { at: [b.range(-10, 10), 0.02, b.range(-8, 8)], rotY: b.range(-0.1, 0.1) });
    }
    for (let i = 0; i < 10; i++) b.blob(b.range(0.4, 0.8), P.grassDry, { at: [b.range(-11.5, 11.5), 0.05, b.range(-9.5, 9.5)], stretch: [1.4, 0.25, 1], detail: 0 });

    // the walls that still stand: parts of the outer ring of the macellum
    wallStub(b, -12.2, -1.0, 15.0, 4.2, false);
    wallStub(b, 12.2, -4.5, 9.0, 3.0, false);
    wallStub(b, -5.5, -9.4, 11.0, 5.0, true);
    wallStub(b, 7.5, -9.4, 7.0, 2.4, true);
    wallStub(b, -9.0, 9.4, 6.0, 2.0, true);
    // one doorway arch survives in the west wall
    b.group({ at: [12.2, 0, 3.2] }, () => {
      for (const s of [-1, 1]) b.box(0.6, 3.0, 0.8, P.cotto, { at: [0, 0, s * 1.2] });
      b.archWall(0.01 + 3.2, 1.2, 0.6, P.cotto, { at: [0, 2.6, 0], facing: '+x', openings: 1, openW: 1.6, openH: 0.8, shape: 'round' });
      b.collider(0.8, 3.2);
    });

    // the shrine porch: three columns standing to full height, one with its beam
    const colC = mix(P.marble, P.marbleGreen, 0.28);
    for (const x of [-1.6, 0, 1.6]) {
      b.column(0.26, 5.6, colC, { at: [x, 0, -6.2], order: 'corinthian', segs: 8 });
      b.collider(0.6, 0.6, { at: [x, 0, -6.2] });
    }
    b.box(2.2, 0.55, 0.62, P.marble, { at: [-0.8, 5.6, -6.2] });
    b.box(1.2, 0.5, 0.55, P.marble, { at: [1.0, 5.6, -6.2], rot: [0, 0, -0.08] });
    b.box(3.8, 1.0, 1.4, tint(P.marble, -0.08), { at: [0, 0, -7.4] }); // the old podium

    // the tholos: its podium and stumps of the column ring
    b.cyl(3.0, 0.4, tint(P.travertine, -0.06), { segs: 12, at: [0, 0, 0.4] });
    for (let i = 0; i < 12; i++) {
      if (i % 3 === 1) continue;
      const a = (i / 12) * Math.PI * 2;
      brokenColumn(b, Math.cos(a) * 2.25, 0.4 + Math.sin(a) * 2.25, b.range(0.3, 2.2), 0.17, P.marble);
    }
    // the fountain basin is now a horse trough
    b.cyl(1.0, 0.6, P.marble, { at: [0, 0.4, 0.4], segs: 10 });
    b.cyl(0.88, 0.02, P.water, { at: [0, 0.97, 0.4], segs: 10, jitter: false });

    // fallen drums and a capital reused as a block, beside a butcher's trestle
    for (const [x, z, r] of [
      [-1.8, 5.6, 0],
      [-3.2, 3.6, 1.2],
      [5.6, -2.4, 0.4],
      [-6.8, -6.8, 2.0],
    ] as [number, number, number][]) {
      if (r === 0) {
        b.cyl(0.32, 0.5, P.marble, { at: [x, 0, z], segs: 8, rTop: 0.42 });
        b.box(0.95, 0.22, 0.95, P.marble, { at: [x, 0.5, z] });
      } else b.log(0.27, 1.1, P.marble, { at: [x, 0, z], rotY: r, segs: 8 });
    }

    // market day: trestles and awnings in two loose rows
    const cloths = [P.cream, P.daub, tint(P.intonacoSienna, 0.1), P.limewash, tint(P.doorBlue, 0.25)];
    const rows: [number, number, number, number][] = [
      [-6.0, 4.6, 0.05, 2.6],
      [-1.0, 7.0, 0, 2.4],
      [3.6, 5.6, -0.08, 2.6],
      [7.6, 6.4, 0.1, 2.2],
      [6.2, 0.8, Math.PI / 2 + 0.1, 2.4],
      [-6.2, 0.4, -Math.PI / 2, 2.4],
    ];
    rows.forEach(([x, z, r, w], i) => {
      if (b.variant === 2 && i === 3) return;
      stall(b, w, [x, 0, z], r, b.pick(cloths), i % 3 === 0 ? P.intonacoRed : undefined, b.pick([['basket', 'fruit'], ['cheese', 'pot'], ['sack', 'basket'], ['cloth'], ['fish', 'basket']] as const).slice());
    });

    // the lean-to booth against the west wall: posts, wattle sides and a roof of salvaged tiles
    b.group({ at: [-10.4, 0, -2.0] }, () => {
      for (const z of [-1.6, 1.6]) b.box(0.14, 2.3, 0.14, P.oakDark, { at: [1.6, 0, z] });
      b.shed(2.4, 3.8, 0.8, P.romanTile, { at: [0.6, 2.3, 0], high: '-x' });
      for (const z of [-1.65, 1.65]) b.box(1.6, 1.9, 0.08, P.wattle, { at: [0.8, 0, z] });
      b.box(1.6, 0.85, 0.6, P.oak, { at: [1.0, 0, 0] });
      goods(b, 2.6, [1.0, 0.85, 0], Math.PI / 2, ['pot', 'basket', 'cheese']);
      for (let i = 0; i < 3; i++) b.blob(0.14, P.oakDark, { at: [0.3, 1.6 + i * 0.05, -1.0 + i * 0.7], stretch: [0.7, 2.0, 0.7], detail: 0 }); // hanging hams
    });
    b.collider(2.2, 3.8, { at: [-10.4 + 0.9, 0, -2.0] });

    // the lime kiln: a squat stone drum with a stoke-hole, a heap of broken marble beside it
    b.group({ at: [8.2, 0, -5.6] }, () => {
      b.cyl(1.5, 2.2, P.rubble, { segs: 10, rTop: 1.25 });
      b.cyl(0.9, 0.06, P.timberBlack, { at: [0, 2.2, 0], segs: 10 });
      b.panel(0.8, 1.0, P.timberBlack, { at: [0, 0, 1.45], facing: '+z', shape: 'round', depth: 0.1 });
      for (let i = 0; i < 7; i++) b.box(b.range(0.25, 0.6), b.range(0.15, 0.4), b.range(0.2, 0.5), P.marble, { at: [-2.1 + b.range(-0.6, 0.6), 0, 0.9 + b.range(-0.7, 0.7)], rotY: b.range(0, 3) });
      b.log(0.06, 1.4, P.oak, { at: [1.5, 0, 1.4], rotY: 0.6 });
    });
    b.collider(3.0, 3.0, { at: [8.2, 0, -5.6] });

    // the vegetable garden in the north-east corner of the old court, fenced with stakes
    b.group({ at: [6.6, 0, -1.6] }, () => {
      b.box(4.0, 0.06, 2.6, P.soil);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) b.blob(0.16, P.leaf, { at: [-1.6 + c * 0.64, 0.12, -0.9 + r * 0.6], detail: 0 });
      for (let i = 0; i <= 8; i++) b.box(0.05, 0.7, 0.05, P.oak, { at: [-2.0 + i * 0.5, 0, -1.35] });
    });

    // sacks, a pig rooting, a figure or two for scale
    for (let i = 0; i < 4; i++) sack(b, [-3.6 + i * 0.5, 0, 7.8], 0.9);
    beast(b, [2.6, 0, -3.0], 2.2, 'pig');
    beast(b, [-4.6, 0, -4.2], 0.3, 'cow', P.limestone);
    b.tree(6.5, { at: [-9.6, 0, 7.4], kind: 'olive' });
    b.tree(7.5, { at: [11.4, 0, -9.8], kind: 'cypress' });
    b.tree(7.0, { at: [-11.6, 0, -9.6], kind: 'cypress' });
  },
};
