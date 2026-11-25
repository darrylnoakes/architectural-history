import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { accolade, archPts, bar, croisee, dormer, onFace, plate, stairTurret, type Face, type Pt } from './shared';
import { TOWER, courtWell, keepTower } from './04-maison-forte';

/** A tall pointed window with Flamboyant tracery (two mullions, flame-shaped mouchettes in the head) in the local face frame. */
function flamboyantWindow(b: Builder, x: number, y: number, w: number, h: number, stone: number): void {
  plate(b, archPts(x, y - 0.15, w + 0.4, h + 0.35, 'pointed', 8), 0.1, stone);
  plate(b, archPts(x, y, w, h, 'pointed', 8), 0.12, P.windowDark);
  const t = 0.09;
  const spring = y + h - Math.min(h * 0.6, w * 0.85);
  for (const dx of [-w / 6, w / 6]) b.box(t, spring - y, 0.08, stone, { at: [x + dx, y, 0.16], jitter: false });
  b.box(w, t, 0.08, stone, { at: [x, y + (spring - y) * 0.55, 0.16], jitter: false });
  // the head: little pointed arches over each light, then the flowing bars of the mouchettes
  const lw = w / 3;
  for (const i of [-1, 0, 1]) plate(b, archPts(x + i * lw, spring - 0.05, lw, lw * 1.1, 'pointed', 4), 0.04, stone, 0.15, [archPts(x + i * lw, spring - 0.05 + 0.08, lw - 0.16, lw * 1.1 - 0.16, 'pointed', 4)]);
  const top = y + h;
  const yc = spring + lw * 1.0;
  for (const s of [-1, 1]) {
    bar(b, x, yc, x + s * w * 0.34, top - (top - spring) * 0.35, t, 0.08, stone, 0.15);
    bar(b, x + s * w * 0.34, top - (top - spring) * 0.35, x + s * w * 0.12, top - 0.25, t, 0.08, stone, 0.15);
    bar(b, x, yc, x + s * w * 0.12, top - 0.25, t, 0.08, stone, 0.15);
  }
}

export const gothicHotel: BuildingDef = {
  id: 'gothic-hotel',
  name: 'Late Gothic town palace (hôtel)',
  style: 'Flamboyant Gothic',
  date: 'c. 1445',
  summary:
    'A merchant-banker grown rich on royal finance builds a town palace round a courtyard, one of the first true hôtels: a house for a household rather than a fortress. ' +
    'The square tower of the family’s old Romanesque house is kept at the inner corner of the court as a sign of ancient rank (Jacques Cœur likewise built against towers of the Roman wall), while new polygonal turrets on the court hold spiral stairs, so that every room can be reached without passing through another. ' +
    'Everything that shows is carved in the late Gothic manner called Flamboyant after its flame-like tracery: steep slate roofs with tall dormers (lucarnes) under crocketed gables, ogee hoods, stone cross-windows, and over the gateway a chapel with a traceried window. ' +
    'On the street front, carved servants lean out of two false windows, a joke in stone that only a very rich man could afford.',
  materials: ['fine limestone', 'slate', 'oak', 'lead (roof finials)', 'leaded glass'],
  modelledOn: 'The Palais Jacques-Cœur, Bourges (1443 to 1451): the gate pavilion with its chapel, canopied niche and false windows with figures, the stair turrets, the dormers and the older towers kept in the new building; and the Hôtel de Cluny, Paris (about 1485 to 1510) for the plan round a court. Much reduced',
  lookFor: [
    { label: 'Chapel over the gateway', note: 'The household chapel sits above the entrance arch, lit by a tall window of Flamboyant tracery facing the street.', at: [0, 9.8, 12.4] },
    { label: 'False windows with figures', note: 'Two sham windows from which carved servants lean out to watch the street, as on Jacques Cœur’s palace.', at: [2.05, 6.0, 12.4] },
    { label: 'Stair turret (vis)', note: 'A polygonal tower on the court holding a spiral stair: its windows climb round it with the steps.', at: [0, 11.0, -2.6] },
    { label: 'Flamboyant dormers', note: 'Tall dormer windows rise from the wall face through the roof, under gables edged with carved crockets and flanked by pinnacles.', at: [-4.8, 10.6, 11.9] },
    { label: 'Ogee door hood (accolade)', note: 'The curve that swings up and reverses to a point over the turret door is the signature of Flamboyant carving.', at: [0, 3.6, -2.0] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, tint(P.pierreBlonde, 0.02), P.limestone]);
    const dress = tint(stone, 0.05);
    const slate = b.pick([P.ardoise, P.slateBlue, tint(P.ardoise, 0.04)]);
    const door = b.pick([P.oakDark, P.oak, tint(P.doorRed, -0.1)]);
    const rub = tint(P.rubble, 0.02);
    const G = 3.9; // ground storey
    const F = 3.7; // first storey
    const H = G + F; // 7.6: eaves of the wings and street range
    const HM = 8.4; // eaves of the main range
    const zB = -12; // back wall
    const zM = -5; // court face of the main range
    const zFi = 6.5; // court face of the street range
    const zF = 11.5; // street face
    const xW = 6; // court half-width
    const X = 11;

    const dormerOpts = { stone: dress, roof: slate };

    // ---- the main range (corps de logis) across the back
    const mD = zM - zB;
    // the old tower of the Romanesque house stands at the inner corner, the new ranges built against it
    const tx0 = TOWER.x - TOWER.size / 2;
    const tz0 = TOWER.z - TOWER.size / 2;
    const tz1 = TOWER.z + TOWER.size / 2;
    b.box(X + tx0, HM, mD, stone, { at: [(tx0 - X) / 2, 0, (zM + zB) / 2] });
    b.box(X - tx0, HM, tz0 - zB, stone, { at: [(X + tx0) / 2, 0, (tz0 + zB) / 2] });
    b.collider(2 * X, mD, { at: [0, 0, (zM + zB) / 2] });
    const mR = (mD / 2) * 1.6;
    b.gable(2 * X, mD, mR, slate, { at: [0, HM, (zM + zB) / 2], overhang: 0.3, wall: stone });
    b.box(2 * X + 0.4, 0.14, 0.14, P.lead, { at: [0, HM + mR + 0.12, (zM + zB) / 2] });
    // ---- the two wings
    const wD = X - xW;
    const wingH = H;
    // left wing: an open gallery on the court below, rooms above
    b.box(wD - 2.2, G, zFi - zM, stone, { at: [-X + (wD - 2.2) / 2, 0, (zFi + zM) / 2] });
    b.box(wD, F, zFi - zM, stone, { at: [-X + wD / 2, G, (zFi + zM) / 2] });
    b.collider(wD - 2.2, zFi - zM, { at: [-X + (wD - 2.2) / 2, 0, (zFi + zM) / 2] });
    b.archWall(zFi - zM, G, 0.5, dress, { at: [-xW - 0.25, 0, (zFi + zM) / 2], facing: '+x', openings: 4, openW: 2.2, openH: 3.2, shape: 'pointed' });
    b.box(2.2, 0.05, zFi - zM, P.paving, { at: [-xW - 1.1, 0, (zFi + zM) / 2] });
    // right wing: kitchens and offices
    b.box(wD, wingH, zFi - tz1, stone, { at: [X - wD / 2, 0, (zFi + tz1) / 2] });
    b.collider(wD, zFi - zM, { at: [X - wD / 2, 0, (zFi + zM) / 2] });
    const wR = (wD / 2) * 1.6;
    for (const s of [-1, 1]) b.gable(wD, zFi - zM, wR, slate, { at: [s * (X - wD / 2), wingH, (zFi + zM) / 2], ridge: 'z', overhang: 0.3 });
    // ---- the street range, split by the gate passage
    const sD = zF - zFi;
    const pw = 5.6; // gate pavilion width
    b.sym((s) => {
      b.box(X - pw / 2, H, sD, stone, { at: [s * (pw / 2 + (X - pw / 2) / 2), 0, (zF + zFi) / 2] });
      b.collider(X - pw / 2, sD, { at: [s * (pw / 2 + (X - pw / 2) / 2), 0, (zF + zFi) / 2] });
    });
    const sR = (sD / 2) * 1.6;
    b.gable(2 * X, sD, sR, slate, { at: [0, H, (zF + zFi) / 2], overhang: 0.3, wall: stone });

    // ---- the gate pavilion: taller, projecting a little, its own steep hipped roof
    const pz0 = zFi;
    const pz1 = zF + 0.6;
    const PH = 12.0;
    const pzc = (pz0 + pz1) / 2;
    // the passage walls and the vault over it; the carriage way runs off-centre, the little door beside it
    const ax = -0.5;
    const aw = 2.8;
    const pxL = ax - aw / 2;
    const pxR = ax + aw / 2;
    b.box(pxL + pw / 2, G + 0.6, pz1 - pz0, stone, { at: [(-pw / 2 + pxL) / 2, 0, pzc] });
    b.box(pw / 2 - pxR, G + 0.6, pz1 - pz0, stone, { at: [(pw / 2 + pxR) / 2, 0, pzc] });
    b.collider(pxL + pw / 2, pz1 - pz0, { at: [(-pw / 2 + pxL) / 2, 0, pzc] });
    b.collider(pw / 2 - pxR, pz1 - pz0, { at: [(pw / 2 + pxR) / 2, 0, pzc] });
    b.box(pw, PH - G - 0.6, pz1 - pz0, stone, { at: [0, G + 0.6, pzc] });
    b.box(aw, 0.06, pz1 - pz0 + 1, P.cobble, { at: [ax, 0, pzc] });
    // the door leaves, folded back against the passage walls
    for (const xx of [pxL + 0.06, pxR - 0.06]) b.box(0.1, 3.4, 1.4, door, { at: [xx, 0, pz1 - 1.0] });
    // the spandrel round the pointed arch, open below, on each face of the pavilion
    const spandrel = (m: 1 | -1): void => {
      // m = -1 mirrors it for the court face, whose local x runs the other way
      const inner = archPts(ax, 0, aw, 3.9, 'pointed', 8).slice(1, -1);
      const outer = archPts(ax, 0, aw + 0.5, 4.15, 'pointed', 8).slice(1, -1);
      const fill: Pt[] = [[pxL, 0], [pxL, G + 0.6], [pxR, G + 0.6], [pxR, 0], ...inner.slice().reverse()];
      const ring: Pt[] = [[pxL - 0.25, 0], ...outer, [pxR + 0.25, 0], [pxR, 0], ...inner.slice().reverse(), [pxL, 0]];
      plate(b, fill.map(([x, y]) => [m * x, y] as Pt), 0.04, stone, -0.02);
      plate(b, ring.map(([x, y]) => [m * x, y] as Pt), 0.12, dress, 0.0);
    };
    b.hip(pw, pz1 - pz0, 6.2, slate, { at: [0, PH, pzc], overhang: 0.3, ridge: 0.8 });
    b.cyl(0.06, 1.6, P.lead, { at: [0, PH + 6.0, pzc], segs: 4 });
    b.sphere(0.16, P.lead, { at: [0, PH + 7.0, pzc], segs: 5 });
    // a little openwork bell-cote for the chapel
    b.box(0.7, 1.4, 0.7, dress, { at: [0, PH + 3.6, pzc + 0.6] });
    b.cone(0.55, 1.4, slate, { at: [0, PH + 5.0, pzc + 0.6], segs: 6 });

    onFace(b, '+z', [0, 0, pz1], () => {
      // the carriage arch and the little door beside it, both under ogee hoods
      spandrel(1);
      accolade(b, ax, 3.0, aw + 0.6, 1.0, dress, 0.1);
      plate(b, archPts(1.95, 0, 1.2, 2.7, 'rect'), 0.1, dress);
      plate(b, archPts(1.95, 0, 0.9, 2.5, 'rect'), 0.16, door);
      accolade(b, 1.95, 2.7, 1.3, 0.6, dress, 0.06, 0.1);
      // the canopied niche for a statue, between the false windows
      plate(b, archPts(0, G + 0.9, 1.5, 2.6, 'rect'), 0.2, tint(stone, -0.12));
      b.box(1.7, 0.3, 0.6, dress, { at: [0, G + 0.75, 0.3] });
      b.box(1.8, 0.7, 0.7, dress, { at: [0, G + 3.5, 0.3] });
      for (const s of [-1, 0, 1]) b.cone(0.18, 0.9, dress, { at: [s * 0.65, G + 4.2, 0.4], segs: 4 });
      b.cyl(0.2, 1.4, P.limestone, { at: [0, G + 1.05, 0.3], segs: 6, rTop: 0.16 });
      b.sphere(0.17, P.limestone, { at: [0, G + 2.6, 0.3], segs: 6 });
      for (const s of [-1, 1]) {
        const fx = s * 2.05;
        plate(b, archPts(fx, G + 1.0, 1.1, 1.6, 'rect'), 0.08, dress);
        plate(b, archPts(fx, G + 1.1, 0.9, 1.4, 'rect'), 0.12, 0x2c2a2a);
        b.box(1.2, 0.18, 0.4, dress, { at: [fx, G + 0.92, 0.2] });
        // the servant leaning out
        b.box(0.42, 0.55, 0.3, s > 0 ? P.doorRed : P.doorBlue, { at: [fx, G + 1.1, 0.3] });
        b.sphere(0.15, 0xe0b89a, { at: [fx, G + 1.82, 0.38], segs: 6 });
        b.box(0.34, 0.12, 0.34, s > 0 ? P.oakDark : P.limewash, { at: [fx, G + 1.92, 0.38] });
      }
      // the chapel window
      flamboyantWindow(b, 0, G + 5.0, 2.2, 2.7, dress);
      b.box(pw + 0.1, 0.2, 0.25, dress, { at: [0, PH - 0.25, 0.12] });
      b.box(pw + 0.1, 0.16, 0.2, dress, { at: [0, G + 0.6, 0.1] });
    });
    // the court face of the pavilion: the chapel's second window and the passage arch
    onFace(b, '-z', [0, 0, pz0], () => {
      spandrel(-1);
      flamboyantWindow(b, 0, G + 5.0, 1.8, 2.6, dress);
    });

    // ---- windows and dormers
    const row = (f: Face, at: [number, number, number], xs: number[], o: { g?: boolean; f1?: boolean; dorm?: boolean; eave: number; gy?: number }) =>
      onFace(b, f, at, () => {
        for (const x of xs) {
          if (o.g !== false) croisee(b, x, o.gy ?? 1.0, 1.25, 2.2, dress, { hood: true });
          if (o.f1 !== false) croisee(b, x, G + 0.7, 1.35, 2.4, dress, { hood: true, bars: 1 });
          if (o.dorm) b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'flamboyant', x, o.eave + 0.25, 1.1, 1.7, dormerOpts));
        }
      });
    // street front
    row('+z', [0, 0, zF], [-8.6, -4.8, 4.8, 8.6], { eave: H, dorm: true, gy: 1.8 });
    onFace(b, '+z', [0, 0, zF], () => {
      for (const x of [-X + 0.2, X - 0.2]) b.box(0.6, H, 0.25, dress, { at: [x, 0, 0.12] });
      b.box(2 * X, 0.18, 0.2, dress, { at: [0, G + 0.35, 0.1] });
    });
    // court fronts
    row('+z', [0, 0, zM], [-4.4, 3.0], { eave: HM, dorm: true });
    row('-z', [0, 0, zFi], [-4.0, 4.0], { eave: H, dorm: false });
    row('-x', [xW, 0, 0], [-1.4, 3.6], { eave: H, dorm: true });
    onFace(b, '-x', [xW, 0, 0], () => {
      plate(b, archPts(1.1, 0, 1.2, 2.5, 'rect'), 0.1, dress);
      plate(b, archPts(1.1, 0, 0.9, 2.3, 'rect'), 0.14, door);
      accolade(b, 1.1, 2.5, 1.3, 0.6, dress, 0.06, 0.1);
    });
    row('+x', [-xW, 0, 0], [-3.4, -0.6, 2.2, 5.0], { g: false, eave: H, dorm: false });
    // the back, onto the garden
    row('-z', [0, 0, zB], [-8.0, -4.0, 0, 4.0, 8.0], { eave: HM, dorm: false });
    onFace(b, '-z', [0, 0, zB], () => {
      for (const x of [-6.0, 6.0]) b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'flamboyant', x, HM + 0.25, 1.1, 1.7, dormerOpts));
      plate(b, archPts(0, 0, 1.4, 2.6, 'rect'), 0.1, dress);
      plate(b, archPts(0, 0, 1.0, 2.4, 'rect'), 0.12, door);
      accolade(b, 0, 2.6, 1.5, 0.7, dress, 0.06, 0.1);
    });
    // outer ends
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * X, 0, 0], () => {
        for (const x of [-7.0, 3.0]) croisee(b, x, G + 0.7, 1.2, 2.3, dress, { hood: true, bars: 1 });
        croisee(b, 3.0, 1.8, 0.8, 1.4, dress, { mullion: false });
        // the gable of the main range: a window in the attic (the old tower covers the other end)
        if (s < 0) croisee(b, -8.5, HM + 1.0, 0.9, 1.6, dress, { mullion: false, hood: true });
      });
    }
    // the turrets: the great stair in the middle of the main range, a smaller one in the corner
    stairTurret(b, 0, zM + 1.3, 1.9, 13.6, stone, slate, { sides: 8, roofH: 5.2, face: '+z', door, frame: dress, windows: 3 });
    onFace(b, '+z', [0, 0, zM + 1.3 + 1.75], () => accolade(b, 0, 2.5, 1.3, 0.7, dress, 0.02, 0.1));
    b.collider(3.8, 3.4, { at: [0, 0, zM + 1.3] });
    // lead finials on the gable ends and tall chimney stacks with moulded caps
    for (const x of [-X]) {
      b.cyl(0.05, 1.3, P.lead, { at: [x, HM + mR, (zM + zB) / 2], segs: 4 });
      b.sphere(0.13, P.lead, { at: [x, HM + mR + 1.35, (zM + zB) / 2], segs: 5 });
    }
    for (const [x, z, y, hh] of [
      [-7.5, -10.6, HM, 7.6],
      [7.5, -10.6, HM, 7.6],
      [X - 1.0, 1.0, H, 6.4],
      [-X + 1.0, 0.0, H, 6.4],
    ] as [number, number, number, number][]) {
      b.chimney(1.3, hh, 0.8, dress, { at: [x, y, z] });
      b.box(1.5, 0.3, 1.0, dress, { at: [x, y + hh - 0.6, z] });
    }
    // the old tower, and the court paved round the old well, which gets an iron frame
    keepTower(b, rub, tint(stone, -0.04), door);
    b.box(2 * xW, 0.05, zFi - zM, P.paving, { at: [0, 0, (zFi + zM) / 2] });
    courtWell(b, dress);
    for (const s of [-1, 1]) b.box(0.14, 2.1, 0.14, P.iron, { at: [3.2 + s * 0.7, 0.9, 5.0] });
    b.beam([2.5, 2.9, 5.0], [3.9, 2.9, 5.0], 0.08, 0.08, P.iron);
  },
};
