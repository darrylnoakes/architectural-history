import { P, linspace, tint, type BuildingDef, type Builder } from '@ah/kit';
import { MAC_WALLS, MF, MSZB, FISH_X, FISH_Z, WL, colonnadeColumn, fishSlab, macellumFloor, macellumWall, shrinePorch, tholosBase } from './03-macellum';
import { beast, forumPaving, goods, sack, stall } from './shared';

/** A ragged top of broken brickwork on a stretch of the old wall: steps of different heights. */
function raggedTop(b: Builder, id: string, hMax: number): void {
  const [, x, z, w, d] = MAC_WALLS.find((m) => m[0] === id)!;
  const alongX = w > d;
  const len = alongX ? w : d;
  const n = Math.max(3, Math.round(len / 0.7));
  const pts: [number, number][] = [[len / 2, 0], [-len / 2, 0]];
  // broken masonry comes away in steps, course by course
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const h = Math.max(0.15, hMax * Math.sin(Math.PI * (0.05 + 0.9 * t)) * b.range(0.45, 1.0));
    pts.push([-len / 2 + (i / n) * len, h], [-len / 2 + ((i + 1) / n) * len, h]);
  }
  b.extrude(pts, 0.6, b.pick([P.cotto, tint(P.cotto, -0.04)]), { at: [x, WL, z], rotY: alongX ? 0 : Math.PI / 2 });
}

export const stallsInTheRuins: BuildingDef = {
  id: 'stalls-in-the-ruins',
  name: 'Market among the ruins',
  style: 'Early medieval',
  date: 'c. 950',
  summary:
    'Four centuries after the Gothic War the old food market is a field of broken walls and standing columns, but the town still trades here on market day, under licence from the bishop. ' +
    'What stands is the macellum’s own fabric, cut down: the paving, the stumps of the outer walls, a few columns, the tholos steps and the marble fish counters, which the fishmongers still use. Stallholders put up trestles and awnings among the ruins and build lean-to booths against the surviving walls, roofed with Roman tiles picked out of the rubble. ' +
    'Marble is worth more as lime than as ruin, so a kiln burns broken columns and statues into mortar for the bishop’s new churches, and a corner of the old court has become a vegetable garden.',
  materials: ['ruined brick-faced concrete', 'reused marble and tile', 'timber poles', 'canvas', 'wattle'],
  lookFor: [
    { label: 'Standing columns', note: 'The two marble columns of the old shrine porch still stand on their podium, a piece of the beam across one of them, as three columns still stand at the market of Pozzuoli.', at: [-1.4, 7.2, -5.55] },
    { label: 'Lime kiln (calcara)', note: 'Broken marble was burnt here to make lime for mortar; much of ancient Rome went the same way.', at: [8.2, 2.9, -5.6] },
    { label: 'Spolia', note: 'A Roman capital turned upside down serves as a chopping block, and column drums become seats: reused pieces are called spolia.', at: [-1.8, 1.3, 5.6] },
    { label: 'Lean-to booth', note: 'A shop of posts and wattle propped against the old wall, roofed with Roman tiles taken from the rubble.', at: [-10.2, 3.2, -2.0] },
    { label: 'Market awnings', note: 'Cloth stretched over poles shades the trestles on market day and comes down when the traders leave.', at: [3.6, 2.9, 5.2] },
  ],
  influences: [],
  build(b) {
    // the forum paving, the floor of the old court and the plinth of its walls, all still there
    forumPaving(b);
    macellumFloor(b);

    // the walls that still stand: the first lift of the old outer wall, broken higher in places
    const brick = P.cotto;
    const standing = ['W0', 'W1', 'W2', 'W3', 'W4', 'E0', 'E1', 'E4', 'B0', 'B1', 'B2', 'B4', 'B5', 'F0'];
    for (const id of standing) {
      macellumWall(b, brick, id, 'lower');
      const [, x, z, w, d] = MAC_WALLS.find((m) => m[0] === id)!;
      b.collider(w, d, { at: [x, 0, z] });
    }
    // the shrine porch at the back: podium, steps and its two columns
    b.group({ at: [0, MF, MSZB] }, () => shrinePorch(b));
    // four columns of the colonnade round the court
    const xs = linspace(5, -6.2, 6.2);
    const zs = linspace(4, -4.6, 4.6);
    for (const [x, z] of [[xs[0], -4.6], [xs[0], zs[1]], [xs[4], -4.6], [xs[1], 4.6]] as [number, number][]) {
      colonnadeColumn(b, x, z);
      b.collider(0.5, 0.5, { at: [x, 0, z] });
    }
    // the marble fish counters on the west side of the court, still in use
    for (const z of FISH_Z) fishSlab(b, FISH_X, z, 3.6, '+x', tint(P.intonacoCream, -0.12));
    // the steps of the tholos and its basin, now a horse trough
    b.group({ at: [0, MF, 0] }, () => tholosBase(b, 2.5));

    // ---- what has gone: broken tops of the walls, the columns of the tholos snapped off
    raggedTop(b, 'W1', 1.6);
    raggedTop(b, 'W2', 2.4);
    raggedTop(b, 'W3', 1.2);
    raggedTop(b, 'B1', 2.4);
    raggedTop(b, 'B2', 1.0);
    raggedTop(b, 'E0', 0.8);
    // a piece of the shrine’s beam still lies across one column
    b.box(1.5, 0.5, 0.55, P.marble, { at: [-1.25, MF + 6.2, MSZB + 1.15] });
    b.group({ at: [0, MF, 0] }, () => {
      for (let i = 0; i < 12; i++) {
        if (i % 3 === 1) continue;
        const a = (i / 12) * Math.PI * 2;
        b.cyl(0.17, b.range(0.3, 2.2), P.marble, { at: [Math.cos(a) * 2.25, 0.45, Math.sin(a) * 2.25], rTop: 0.16, segs: 6 });
      }
    });
    b.collider(5.4, 5.4);
    // one doorway arch survives in the east wall
    b.group({ at: [12.2, 0, 3.6] }, () => {
      for (const s of [-1, 1]) b.box(0.6, 3.0, 0.8, P.cotto, { at: [0, 0, s * 1.2] });
      b.archWall(3.2, 1.2, 0.6, P.cotto, { at: [0, 2.6, 0], facing: '+x', openings: 1, openW: 1.6, openH: 0.8, shape: 'round' });
      b.collider(0.8, 3.2);
    });

    // weeds and trodden earth over the old paving
    for (let i = 0; i < 10; i++) {
      const w = b.range(1.6, 4.0);
      const d = b.range(1.2, 3.0);
      const inside = i < 6;
      b.box(w, 0.03, d, tint(P.earth, 0.06), { at: [inside ? b.range(-9, 9) : b.range(-11.5, 11.5), inside ? MF : 0.12, inside ? b.range(-7.5, 7.5) : 10.3], rotY: b.range(-0.1, 0.1) });
    }
    for (let i = 0; i < 10; i++) b.blob(b.range(0.4, 0.8), P.grassDry, { at: [b.range(-11, 11), MF, b.range(-8.8, 8.8)], stretch: [1.4, 0.25, 1], detail: 0 });

    b.group({ at: [0, MF, 0] }, () => {
      // fallen drums and a capital reused as a block, beside a butcher's trestle
      for (const [x, z, r] of [
        [-1.8, 5.6, 0],
        [-4.2, 2.6, 1.2],
        [5.6, -2.4, 0.4],
        [-6.8, -6.8, 2.0],
      ] as [number, number, number][]) {
        if (r === 0) {
          b.cyl(0.32, 0.5, P.marble, { at: [x, 0, z], segs: 8, rTop: 0.42 });
          b.box(0.95, 0.22, 0.95, P.marble, { at: [x, 0.5, z] });
        } else b.log(0.27, 1.1, P.marble, { at: [x, 0, z], rotY: r, segs: 8 });
      }
      // fish on the old counters
      for (const z of FISH_Z.slice(0, 2)) goods(b, 2.8, [FISH_X + 0.4, 0.95, z], Math.PI / 2, ['fish']);

      // market day: trestles and awnings in loose rows
      const cloths = [P.cream, P.daub, tint(P.intonacoSienna, 0.1), P.limewash, tint(P.doorBlue, 0.25)];
      const rows: [number, number, number, number][] = [
        [-6.0, 4.6, 0.05, 2.6],
        [-1.0, 7.0, 0, 2.4],
        [3.6, 5.6, -0.08, 2.6],
        [7.6, 6.4, 0.1, 2.2],
        [6.2, 0.8, Math.PI / 2 + 0.1, 2.4],
      ];
      rows.forEach(([x, z, r, w], i) => {
        if (b.variant === 2 && i === 3) return;
        stall(b, w, [x, 0, z], r, b.pick(cloths), i % 3 === 0 ? P.intonacoRed : undefined, b.pick([['basket', 'fruit'], ['cheese', 'pot'], ['sack', 'basket'], ['cloth'], ['fish', 'basket']] as const).slice());
      });

      // the lean-to booth against the west wall: posts, wattle sides and a roof of salvaged tiles
      b.group({ at: [-11.0, 0, -2.0] }, () => {
        for (const z of [-1.6, 1.6]) b.box(0.14, 2.3, 0.14, P.oakDark, { at: [1.6, 0, z] });
        b.shed(2.4, 3.8, 0.8, P.romanTile, { at: [0.6, 2.3, 0], high: '-x' });
        for (const z of [-1.65, 1.65]) b.box(1.6, 1.9, 0.08, P.wattle, { at: [0.8, 0, z] });
        b.box(1.6, 0.85, 0.6, P.oak, { at: [1.0, 0, 0] });
        goods(b, 2.6, [1.0, 0.85, 0], Math.PI / 2, ['pot', 'basket', 'cheese']);
        for (let i = 0; i < 3; i++) b.blob(0.14, P.oakDark, { at: [0.3, 1.6 + i * 0.05, -1.0 + i * 0.7], stretch: [0.7, 2.0, 0.7], detail: 0 }); // hanging hams
      });
      b.collider(2.2, 3.8, { at: [-11.0 + 0.9, 0, -2.0] });

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
      b.tree(7.5, { at: [10.6, 0, -8.4], kind: 'cypress' });
      b.tree(7.0, { at: [-10.6, 0, -8.4], kind: 'cypress' });
    });
  },
};
