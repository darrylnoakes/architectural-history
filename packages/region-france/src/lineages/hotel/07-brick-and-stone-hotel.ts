import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archPts, archRing, band, croisee, dormer, lowWall, onFace, pediment, plate, quoins, type Face } from './shared';

export const brickAndStoneHotel: BuildingDef = {
  id: 'brick-and-stone-hotel',
  name: 'Brick-and-stone hôtel',
  style: 'Henri IV and Louis XIII',
  date: 'c. 1625',
  summary:
    'After the Wars of Religion the rich build fast and cheaply in red brick framed in pale stone: stone at the corners in long-and-short quoins, stone bands at each floor, and stone strips that tie the windows of each bay together from ground to roof. ' +
    'The house is now set back across the end of a court, with lower wings for the stables and kitchens and a gate on the street; its plan is symmetrical, the main block flanked by two pavilions. ' +
    'The roofs show the plan from afar: each pavilion carries its own tall slate roof, higher than the one over the middle, with stone dormers under alternating triangular and curved pediments.',
  materials: ['red brick', 'limestone dressings', 'slate', 'oak'],
  modelledOn: 'The pavilions of the Place des Vosges (Place Royale), Paris (1605 to 1612): the brick and stone, the stone chains and the separate tall roofs. The plan is the usual hôtel of the period; the brick is the northern red, as at Reims, Amiens and Saint-Quentin',
  influences: ['italian-renaissance'],
  lookFor: [
    { label: 'Brick and stone', note: 'Red brick walls with pale stone for the corners, the window surrounds and the floor bands.', at: [-3.9, 5.0, -4.7] },
    { label: 'Quoins (chaînes d’angle)', note: 'Stones laid long and short alternately up each corner, toothing into the brick.', at: [-10.6, 4.0, -3.2] },
    { label: 'Separate pavilion roofs', note: 'Each pavilion has its own tall roof, higher than the main roof, so the plan reads in the skyline.', at: [8.8, 14.2, -7.8] },
    { label: 'Stone-dressed dormers', note: 'Dormers framed in stone with pediments, triangular and curved in turn.', at: [-2.6, 10.0, -4.4] },
    { label: 'Carriage gate (portail)', note: 'A round-arched gate in banded brick and stone, wide enough for a coach.', at: [0, 5.6, 12.0] },
  ],
  build(b) {
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, 0.04), P.brickRed, tint(P.briqueNord, -0.04)]);
    const stone = b.pick([P.pierreBlonde, P.craie, P.limestone]);
    const slate = b.pick([P.ardoise, P.slateBlue, tint(P.ardoise, -0.03)]);
    const door = b.pick([P.oakDark, P.doorGreen, P.doorBlue]);
    const X = 11;
    const zB = -12;
    const zM = -4.8; // court face of the main block
    const pzF = -3.4; // court face of the pavilions
    const px0 = 6.5; // inner edge of each pavilion
    const G = 4.2;
    const F = 4.0;
    const H = G + F; // 8.2
    const PH = 9.0; // pavilion eaves
    const zS = 11.6;
    const ww = 3.4; // wings
    const wzB = pzF;
    const wzF = 9.0;
    const dOpts = { stone, roof: slate };

    /** A bay: a stone chain from plinth to cornice, a cross-window on each floor, a stone table under each. */
    const bay = (x: number, top: number, o: { g?: boolean; w?: number } = {}) => {
      const w = o.w ?? 1.4;
      b.box(w + 0.4, top - 0.5, 0.05, stone, { at: [x, 0.5, 0.025], jitter: false });
      if (o.g !== false) croisee(b, x, 1.2, w, 2.6, P.white, { border: 0.1, z: 0.05 });
      croisee(b, x, G + 0.6, w, 2.7, P.white, { border: 0.1, z: 0.05 });
      // brick panels inset in the chain under the upper window
      b.box(w - 0.2, 0.5, 0.06, brick, { at: [x, G - 0.05, 0.04], jitter: false });
    };
    const bands = (len: number, top: number) => {
      band(b, -len / 2, len / 2, 0, 0.5, 0.1, stone);
      band(b, -len / 2, len / 2, G - 0.6, 0.35, 0.12, stone);
      band(b, -len / 2, len / 2, top - 0.35, 0.35, 0.3, stone);
    };

    // ---- the main block between the pavilions
    const mW = 2 * px0;
    const mD = zM - zB;
    const mzc = (zM + zB) / 2;
    b.box(mW, H, mD, brick, { at: [0, 0, mzc] });
    b.hip(mW, mD, 4.6, slate, { at: [0, H, mzc], overhang: 0.3 });
    // ---- the pavilions, a little taller and projecting into the court
    const pD = pzF - zB;
    const pzc = (pzF + zB) / 2;
    const pW = X - px0;
    for (const s of [-1, 1] as const) {
      const cx = s * (px0 + pW / 2);
      b.box(pW, PH, pD, brick, { at: [cx, 0, pzc] });
      b.hip(pW, pD, 6.0, slate, { at: [cx, PH, pzc], overhang: 0.3, ridge: 2.2 });
      b.box(0.1, 0.9, 0.1, P.lead, { at: [cx, PH + 5.9, pzc - 1.1] });
      b.box(0.1, 0.9, 0.1, P.lead, { at: [cx, PH + 5.9, pzc + 1.1] });
      b.chimney(1.4, 7.2, 0.8, brick, { at: [cx, PH + 0.5, pzc - 2.2] });
      b.box(1.56, 0.25, 0.96, stone, { at: [cx, PH + 5.6, pzc - 2.2] });
      // quoins on all four corners of each pavilion
      // (the back inner corner is flush with the main block, so it has none)
      const q = { course: 0.55 };
      for (const sx of [-1, 1] as const) onFace(b, '+z', [cx, 0, pzF], () => quoins(b, sx * (pW / 2), 0, PH, stone, { ...q, dir: (-sx) as 1 | -1 }));
      onFace(b, '-z', [cx, 0, zB], () => quoins(b, -s * (pW / 2), 0, PH, stone, { ...q, dir: s }));
      onFace(b, s > 0 ? '+x' : '-x', [s * X, 0, pzc], () => {
        for (const sx of [-1, 1] as const) quoins(b, sx * (pD / 2), 0, PH, stone, { course: 0.55, dir: (-sx) as 1 | -1 });
        for (const x of [-2.2, 2.2]) bay(x, PH);
        bands(pD, PH);
      });
      onFace(b, '+z', [cx, 0, pzF], () => {
        bay(0, PH);
        bands(pW, PH);
        b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'louis13', 0, PH + 0.2, 1.0, 1.6, { ...dOpts, ped: 'tri' }));
      });
      onFace(b, '-z', [cx, 0, zB], () => {
        bay(0, PH);
        bands(pW, PH);
        b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'louis13', 0, PH + 0.2, 1.0, 1.6, { ...dOpts, ped: 'seg' }));
      });
      // the inner side of the pavilion, facing the court, one window
      onFace(b, s > 0 ? '-x' : '+x', [s * px0, 0, (pzF + zM) / 2], () => {
        band(b, -0.7, 0.7, G - 0.6, 0.35, 0.12, stone);
        band(b, -0.7, 0.7, PH - 0.35, 0.35, 0.3, stone);
      });
    }
    b.collider(2 * X, pD, { at: [0, 0, pzc] });
    // ---- the main block's two faces
    for (const [f, z] of [['+z', zM], ['-z', zB]] as [Face, number][]) {
      onFace(b, f, [0, 0, z], () => {
        const xs = [-5.2, -2.6, 0, 2.6, 5.2];
        for (const x of xs) if (!(f === '+z' && x === 0)) bay(x, H);
        bands(mW, H);
        xs.filter((x, i) => i % 2 === 1 || (f === '-z' && x === 0)).forEach((x, i) => b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'louis13', x, H + 0.2, 1.0, 1.6, { ...dOpts, ped: i % 2 ? 'seg' : 'tri' })));
        if (f === '+z') {
          // the main door: stone surround, a segmental pediment, steps
          b.box(2.4, G - 0.3, 0.08, stone, { at: [0, 0, 0.04] });
          plate(b, archPts(0, 0.45, 1.5, 3.0, 'rect'), 0.12, door, 0.04);
          pediment(b, 0, G - 0.25, 2.8, 0.7, 'seg', stone, 0.35);
          croisee(b, 0, G + 0.6, 1.4, 2.7, P.white, { border: 0.1, z: 0.05, bars: 1 });
          b.box(1.9, 0.5, 0.06, stone, { at: [0, G + 0.6 - 0.6, 0.05] });
          b.box(2.4, 0.15, 1.0, stone, { at: [0, 0, 0.5] });
          b.box(2.0, 0.3, 0.6, stone, { at: [0, 0.15, 0.3] });
        } else {
          b.box(1.5, 2.8, 0.12, door, { at: [0, 0.4, 0.06] });
          b.box(2.0, 3.2, 0.06, stone, { at: [0, 0.4, 0.03] });
        }
      });
    }
    // chimneys over the main block
    for (const x of [-3.3, 3.3]) {
      b.chimney(1.2, 5.8, 0.8, brick, { at: [x, H + 1.6, mzc] });
      b.box(1.36, 0.25, 0.96, stone, { at: [x, H + 6.6, mzc] });
    }

    // ---- the wings: stables and kitchens, one storey with an attic
    const wL = wzF - wzB;
    const wzc = (wzF + wzB) / 2;
    for (const s of [-1, 1] as const) {
      const cx = s * (X - ww / 2);
      b.box(ww, 4.2, wL, brick, { at: [cx, 0, wzc] });
      b.collider(ww, wL, { at: [cx, 0, wzc] });
      b.gable(ww, wL, 3.2, slate, { at: [cx, 4.2, wzc], ridge: 'z', overhang: 0.25, wall: brick });
      onFace(b, s > 0 ? '-x' : '+x', [s * (X - ww), 0, wzc], () => {
        band(b, -wL / 2, wL / 2, 0, 0.45, 0.1, stone);
        band(b, -wL / 2, wL / 2, 3.9, 0.3, 0.25, stone);
        for (const x of [-4.2, 0, 4.2]) {
          if (s < 0) {
            // coach-house and stable doors
            archRing(b, x, 0, 2.6, 3.3, 0.3, 0.08, stone, 0, 'segmental');
            plate(b, archPts(x, 0, 2.6, 3.3, 'segmental', 6), 0.06, door, 0);
          } else {
            b.box(1.9, 3.1, 0.05, stone, { at: [x, 0.5, 0.025] });
            croisee(b, x, 1.0, 1.2, 2.2, P.white, { border: 0.1, z: 0.05, mullion: false });
          }
        }
        for (const x of [-2.1, 2.1]) b.group({ at: [0, 0, 0.25] }, () => dormer(b, 'louis13', x, 4.3, 0.8, 1.2, { ...dOpts, ped: x < 0 ? 'tri' : 'seg' }));
      });
      onFace(b, '+z', [cx, 0, wzF], () => {
        quoins(b, -ww / 2, 0, 4.2, stone, { course: 0.55, dir: 1 });
        quoins(b, ww / 2, 0, 4.2, stone, { course: 0.55, dir: -1 });
        croisee(b, 0, 4.6, 0.7, 1.2, P.white, { border: 0.1, mullion: false });
      });
      onFace(b, s > 0 ? '+x' : '-x', [s * X, 0, wzc], () => band(b, -wL / 2, wL / 2, 3.9, 0.3, 0.25, stone));
    }

    // ---- the street wall and gate
    const gw = 4.6;
    b.sym((s) => {
      lowWall(b, s * (gw / 2 + 0.6), zS, s * X, zS, 3.6, brick, stone);
      b.collider(X - gw / 2 - 0.6, 0.6, { at: [s * ((X + gw / 2 + 0.6) / 2), 0, zS] });
      // the wall returns to meet the wings
      lowWall(b, s * (X - 0.25), wzF, s * (X - 0.25), zS, 3.6, brick, stone);
    });
    b.archWall(gw + 1.4, 6.0, 0.9, brick, { at: [0, 0, zS], openings: 1, openW: 3.4, openH: 4.6, shape: 'round' });
    b.sym((s) => b.collider(0.8, 1.0, { at: [s * (gw / 2 + 0.3), 0, zS] }));
    for (const f of ['+z', '-z'] as const) {
      onFace(b, f, [0, 0, zS + (f === '+z' ? 0.45 : -0.45)], () => {
        // banded piers: courses of stone between courses of brick
        for (const s of [-1, 1]) for (let i = 0; i < 6; i++) b.box(1.1, 0.42, 0.08, stone, { at: [s * 2.25, 0.2 + i * 0.9, 0.04], jitter: false });
        archRing(b, 0, 0, 3.4, 4.6, 0.35, 0.1, stone);
        b.box(0.5, 0.8, 0.2, stone, { at: [0, 4.4, 0.08], jitter: false });
        band(b, -(gw + 1.6) / 2, (gw + 1.6) / 2, 5.6, 0.4, 0.35, stone);
        pediment(b, 0, 6.0, gw + 1.4, 1.1, 'seg', stone, 0.5);
      });
    }

    // ---- the court
    b.box(2 * X - 2 * ww, 0.05, zS - pzF, P.cobble, { at: [0, 0, (zS + pzF) / 2] });
    b.box(2.2, 0.06, zS - zM, P.paving, { at: [0, 0.01, (zS + zM) / 2] });
    // a small garden strip behind
    b.box(2 * X, 0.04, 0.8, P.grass, { at: [0, 0, zB - 0.5] });
  },
};
