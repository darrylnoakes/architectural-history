import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BAILEY_LEFT, BAILEY_RIGHT, DITCH, GATE, MOTTE, arcade, arch, archWindow, baileyBank, baileyWell, castleDitches, curtain, lineColliders, motte } from './shared';
import { CURTAIN_1130, KEEP, normanChapel, stoneKeep } from './05-stone-keep';

/** Height to which the round towers' lower stage rises; the Elizabethan ruin keeps this much of one. */
export const TOWER_STUMP = 6.5;

/** The angle of the bailey whose tower outlives the castle as a garden ruin (see the Elizabethan manor). */
export const RUIN_CORNER = BAILEY_RIGHT[2];

/** Radius and height of the round flanking towers, and where they stand: just inside each angle of the bailey. */
export const FLANK = { r: 2.5, h: 10.6 };
export const flankAt = (p: [number, number]): [number, number] => [3 + (p[0] - 3) * 0.94, 1 + (p[1] - 1) * 0.94];

/** Depth of the footing under every round tower, down to the bottom of the moat its base stands in. */
const TOWER_FOOT = DITCH.depth + 0.1;

/** Arrow loops in the lower stage of a round tower. */
function towerLoops(b: Builder, r: number) {
  for (const a of [0.5, 2.6, 4.7]) {
    b.panel(0.18, 1.5, P.black, { at: [Math.sin(a) * r, 4.5, Math.cos(a) * r], facing: a });
    b.panel(0.55, 0.16, P.black, { at: [Math.sin(a) * r, 5.4, Math.cos(a) * r], facing: a });
  }
}

/** The lower stage of a round tower: spurred base, the shaft up to TOWER_STUMP, arrow loops. */
export function roundTowerStump(b: Builder, x: number, z: number, r: number, stone: number) {
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r + 0.5, TOWER_FOOT, tint(stone, -0.06), { at: [0, -TOWER_FOOT, 0], segs: 10 }); // footing
    b.cyl(r + 0.5, 1.4, tint(stone, -0.04), { segs: 10, rTop: r }); // spurred base
    b.cyl(r, TOWER_STUMP, stone, { segs: 10 });
    towerLoops(b, r);
  });
}

/**
 * A round flanking tower with a battlemented top and arrow loops. `stump` builds the shaft in two
 * stages, so that a later ruin can keep the lower one (see `roundTowerStump`).
 */
export function roundTower(b: Builder, x: number, z: number, r: number, h: number, stone: number, o?: { loops?: boolean; stump?: boolean }) {
  if (o?.stump) roundTowerStump(b, x, z, r, stone);
  b.group({ at: [x, 0, z] }, () => {
    if (o?.stump) b.cyl(r, h - TOWER_STUMP, stone, { at: [0, TOWER_STUMP, 0], segs: 10 });
    else {
      b.cyl(r + 0.5, TOWER_FOOT, tint(stone, -0.06), { at: [0, -TOWER_FOOT, 0], segs: 10 }); // footing
      b.cyl(r + 0.5, 1.4, tint(stone, -0.04), { segs: 10, rTop: r }); // spurred base
      b.cyl(r, h, stone, { segs: 10 });
      if (o?.loops !== false) towerLoops(b, r);
    }
    b.cyl(r + 0.25, 0.35, tint(stone, -0.05), { at: [0, h - 0.35, 0], segs: 10 });
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      b.box(0.85, 0.95, 0.45, stone, { at: [Math.sin(a) * (r - 0.05), h, Math.cos(a) * (r - 0.05)], rotY: a, jitter: false });
    }
    b.cyl(r - 0.4, 0.1, P.lead, { at: [0, h - 0.25, 0], segs: 6 });
  });
}

/** The great hall of c. 1290: buttressed stone hall with tall two-light traceried windows. */
export function greatHall(b: Builder, stone: number, roof: number) {
  b.group({ at: [8.5, 0, -12] }, () => {
    const L = 16;
    const D = 8.4;
    const H = 7.4;
    b.box(L, H, D, stone);
    b.gable(L, D, 5, roof, { at: [0, H, 0], overhang: 0.25, wall: stone });
    // gable copings and a louvre on the ridge for the open hearth
    b.box(0.9, 1.0, 0.9, P.oak, { at: [1, H + 4.6, 0] });
    b.pyramid(1.3, 1.3, 0.8, roof, { at: [1, H + 5.6, 0] });
    for (const s of [1, -1]) {
      for (const x of [-5.6, -1.9, 1.9, 5.6]) {
        archWindow(b, 1.5, 4.6, { at: [x, 2.2, s * (D / 2)], facing: s > 0 ? '+z' : '-z', frame: tint(stone, -0.06), mullion: true });
      }
      for (const x of [-7.6, -3.75, 0, 3.75, 7.6]) {
        b.box(0.7, H - 0.6, 0.6, stone, { at: [x, 0, s * (D / 2 + 0.3)] });
        b.shed(0.7, 0.6, 0.6, stone, { at: [x, H - 0.6, s * (D / 2 + 0.3)], high: s > 0 ? '-z' : '+z' });
      }
    }
    // porch at the screens end, and the solar (private chamber) cross-wing at the dais end
    b.box(3.2, 4.4, 3, stone, { at: [-5.6, 0, D / 2 + 1.4] });
    b.gable(3.2, 3, 1.6, roof, { at: [-5.6, 4.4, D / 2 + 1.4], ridge: 'z', wall: stone });
    arch(b, 1.4, 2.8, P.oakDark, { at: [-5.6, 0, D / 2 + 2.9], facing: '+z' });
    b.box(4.5, 9.6, 10, stone, { at: [L / 2 + 2.25, 0, 0] });
    b.gable(4.5, 10, 3.6, roof, { at: [L / 2 + 2.25, 9.6, 0], ridge: 'z', overhang: 0.2, wall: stone });
    archWindow(b, 1.2, 2.8, { at: [L / 2 + 2.25, 5.4, 5], facing: '+z', frame: tint(stone, -0.06), mullion: true });
    b.chimney(1.1, 3.8, 1.1, stone, { at: [L / 2 + 4.2, 9.6, -2] });
  });
}

/** The twin-towered gatehouse with portcullis and drawbridge over the moat. */
export function gatehouse(b: Builder, stone: number, o?: { ruin?: boolean }) {
  b.group({ at: [GATE[0], 0, GATE[1] - 3.4] }, () => {
    const W = 11;
    arcade(b, W, 11, 5, stone, { openings: 1, openW: 3.2, openH: 4.6, shape: 'pointed' });
    b.crenel(W, 5, stone, { at: [0, 11, 0], merlonW: 0.7, merlonH: 0.9, t: 0.45 });
    b.box(W - 0.9, 0.1, 4.1, P.lead, { at: [0, 10.8, 0] });
    b.sym((s) => roundTower(b, s * 3.6, 2.6, 2.7, 12.5, stone));
    // the passage between the towers: portcullis grille, murder hole slot, the drawbridge down
    arch(b, 3.0, 4.4, P.iron, { at: [0, 1.6, 2.55], facing: '+z', depth: 0.03 });
    arch(b, 3.3, 5.0, tint(stone, -0.08), { at: [0, 0, 2.5], facing: '+z', depth: 0.02 });
    b.box(3.2, 1.6, 0.4, stone, { at: [0, 4.6, 4.6] });
    archWindow(b, 1.1, 2.4, { at: [0, 7, 4.9], facing: '+z', frame: tint(stone, -0.06), mullion: true });
    if (!o?.ruin) {
      // the drawbridge, let down from the gate on to a stone pier standing in the middle of the moat,
      // and a fixed timber span from the pier to the far bank
      const zp = DITCH.off + 3.4; // middle of the moat, in this group's frame
      b.box(3.2, 0.3, zp - 2.5, P.oak, { at: [0, 0.3, (zp + 2.5) / 2] });
      b.sym((s) => b.box(0.1, 0.1, 4.4, P.iron, { at: [s * 1.5, 0.6, 4.2], rot: [-0.28, 0, 0] }));
      b.box(3.8, DITCH.depth + 0.4, 0.8, tint(stone, -0.06), { at: [0, -DITCH.depth - 0.1, zp + 0.4] });
      const z1 = zp + DITCH.half + 1.2;
      b.box(3.2, 0.3, z1 - zp, P.oak, { at: [0, 0.3, (zp + z1) / 2] });
      b.sym((s) => b.box(0.12, 0.9, z1 - zp - 0.8, P.oakDark, { at: [s * 1.5, 0.6, (zp + z1) / 2 + 0.4] }));
    }
  });
  if (!o?.ruin) b.deck(3.0, DITCH.off + DITCH.half + 3.2, 0.6, { at: [GATE[0], 0, GATE[1] - 0.9 + (DITCH.off + DITCH.half + 1.2) / 2] });
}

export const edwardianCastle: BuildingDef = {
  id: 'edwardian-castle',
  name: 'Enlarged castle',
  style: 'Gothic (Edwardian)',
  date: 'c. 1290',
  summary:
    'By the reign of Edward I castle design had changed a great deal, drawing on ideas often said to come from the Crusades and tested in the king\'s Welsh wars. The Norman keep, chapel and curtain wall are kept, but the wall is raised higher and given round towers that let archers shoot along the wall face, and that have no square corners to undermine. ' +
    'The weak point, the gate, becomes a fortress of its own: two great towers either side of a passage closed by a portcullis and a drawbridge over a water-filled moat. ' +
    'Inside, comfort grows too: a large new hall with tall pointed windows for feasting and courts, and a pointed east window in the old chapel.',
  materials: ['limestone ashlar and rubble', 'lead and stone slate roofs', 'oak', 'iron portcullis'],
  lookFor: [
    { label: 'Twin-towered gatehouse', note: 'Two round-fronted towers flank the entrance passage, so attackers at the gate are shot at from both sides.', at: [GATE[0] - 3.6, 13.6, GATE[1] + 2.8] },
    { label: 'Portcullis', note: 'An iron-shod grille that drops in grooves to close the gate passage in moments.', at: [GATE[0], 3.6, GATE[1] + 0.4] },
    { label: 'Round flanking towers', note: 'Towers bulging out from the curtain wall so defenders can shoot along its face; round towers had no corners to undermine.', at: [19.5, 11.5, -6] },
    { label: 'Wall-walk', note: 'A path along the top of the curtain wall behind the battlements, linking tower to tower.', at: [-19.5, 7.3, 6.5] },
    { label: 'Moat', note: 'The ditch of the first castle, kept and held full of water, so that attackers cannot reach the foot of the wall or tunnel under it.', at: [BAILEY_RIGHT[3][0] + DITCH.off, DITCH.water + 0.2, 2] },
    { label: 'Great hall', note: 'The setting for feasts and courts: tall pointed two-light windows, buttresses and a steep roof with a louvre over the hearth.', at: [8.5, 7.4, -7.6] },
  ],
  modelledOn: 'Later 13th-century gatehouses such as Tonbridge and Harlech, applied to an older castle',
  influences: ['crusader-castles'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.03, 0.01));
    const wall = tint(stone, -0.03);
    motte(b, { color: mix(P.turf, P.grassDry, 0.3) });
    // the ditches of 1068, kept and held full of water as a moat
    castleDitches(b, { wet: true });
    stoneKeep(b, tint(stone, -0.05));

    // the Norman curtain is kept on its bank and raised higher, with round towers at the angles;
    // only the stretches either side of the new gatehouse are rebuilt
    baileyBank(b);
    const C = CURTAIN_1130;
    const right: [number, number][] = [...C.right.slice(0, -1), [GATE[0] + 5, 19]];
    const left: [number, number][] = [[GATE[0] - 5, 19], ...C.left.slice(1)];
    curtain(b, right, C.h, C.t, wall, { base: C.base, foot: C.foot, piece: C.piece, outer: -1, merlon: 1, raise: 1.6 });
    curtain(b, left, C.h, C.t, wall, { base: C.base, foot: C.foot, piece: C.piece, outer: -1, merlon: 1, raise: 1.6 });
    for (const p of [...BAILEY_RIGHT.slice(1, -1), ...BAILEY_LEFT.slice(1, -1)]) {
      // pulled a little inwards so the towers stay on the plot
      const [tx, tz] = flankAt(p);
      roundTower(b, tx, tz, FLANK.r, FLANK.h, stone, { stump: p === RUIN_CORNER });
    }
    gatehouse(b, stone);

    // the great hall, a kitchen, stables
    greatHall(b, stone, P.stoneSlate);
    b.group({ at: [-3, 0, -15.4] }, () => {
      b.box(5, 5, 5, stone);
      b.pyramid(5.4, 5.4, 3.4, P.stoneSlate, { at: [0, 5, 0] });
      b.box(1, 1, 1, stone, { at: [0, 8.4, 0] });
    });
    b.group({ at: [15, 0, 4] }, () => {
      b.box(4.4, 3.2, 12, mix(P.oak, P.oakSilver, 0.3));
      b.shed(5.2, 12.6, 1.5, P.tileRed, { at: [0, 3.2, 0], high: '+x' });
    });
    // chapel (the Norman one, with a new pointed east window)
    normanChapel(b, stone, { eastWindow: true });
    baileyWell(b);

    // colliders
    lineColliders(b, right.slice(1), 1.8);
    lineColliders(b, left.slice(0, -1), 1.8);
    b.sym((s) => b.collider(3.4, 6.5, { at: [GATE[0] + s * 3.8, 0, GATE[1] - 2.2] }));
    b.collider(KEEP.w + 1.6, KEEP.w + 1.6, { at: [MOTTE.x, 0, MOTTE.z] });
    b.collider(3.4, 6.4, { at: [MOTTE.x + KEEP.w / 2 + 1.7, 0, MOTTE.z - 0.8] });
    b.collider(25, 10, { at: [10.7, 0, -12] });
    b.collider(5, 5, { at: [-3, 0, -15.4] });
    b.collider(4.4, 12, { at: [15, 0, 4] });
    b.collider(5, 10.2, { at: [-11, 0, 10.4] });
  },
};
