import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BAILEY_LEFT, BAILEY_RIGHT, GATE, MOTTE, arcade, arch, archWindow, curtain, lineColliders, motte, motteY, strip } from './shared';
import { ditchLine, toSummit } from './04-motte-and-bailey';
import { KEEP, stoneKeep } from './05-stone-keep';

/** A round flanking tower with a battlemented top and arrow loops. */
export function roundTower(b: Builder, x: number, z: number, r: number, h: number, stone: number, o?: { loops?: boolean }) {
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(r + 0.5, 1.4, tint(stone, -0.04), { segs: 10, rTop: r }); // spurred base
    b.cyl(r, h, stone, { segs: 10 });
    b.cyl(r + 0.25, 0.35, tint(stone, -0.05), { at: [0, h - 0.35, 0], segs: 10 });
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      b.box(0.85, 0.95, 0.45, stone, { at: [Math.sin(a) * (r - 0.05), h, Math.cos(a) * (r - 0.05)], rotY: a, jitter: false });
    }
    b.cyl(r - 0.4, 0.1, P.lead, { at: [0, h - 0.25, 0], segs: 6 });
    if (o?.loops !== false) {
      for (const a of [0.5, 2.6, 4.7]) {
        for (const y of [4.5]) {
          b.panel(0.18, 1.5, P.black, { at: [Math.sin(a) * r, y, Math.cos(a) * r], facing: a });
          b.panel(0.55, 0.16, P.black, { at: [Math.sin(a) * r, y + 0.9, Math.cos(a) * r], facing: a });
        }
      }
    }
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
      b.box(3.2, 0.3, 3.8, P.oak, { at: [0, 0.3, 4.4] });
      b.sym((s) => b.box(0.1, 0.1, 4.4, P.iron, { at: [s * 1.5, 0.6, 4.2], rot: [-0.28, 0, 0] }));
    }
  });
}

export const edwardianCastle: BuildingDef = {
  id: 'edwardian-castle',
  name: 'Enlarged castle',
  style: 'Gothic (Edwardian)',
  date: 'c. 1290',
  summary:
    'By the reign of Edward I castle design had changed a great deal, drawing on ideas often said to come from the Crusades and tested in the king\'s Welsh wars. The old keep is kept, but the curtain wall is rebuilt higher with round towers that let archers shoot along the wall face, and with no square corners to undermine. ' +
    'The weak point, the gate, becomes a fortress of its own: two great towers either side of a passage closed by a portcullis and a drawbridge over a water-filled moat. ' +
    'Inside, comfort grows too: a large hall with tall pointed windows for feasting and courts.',
  materials: ['limestone ashlar and rubble', 'lead and stone slate roofs', 'oak', 'iron portcullis'],
  lookFor: [
    { label: 'Twin-towered gatehouse', note: 'Two round-fronted towers flank the entrance passage, so attackers at the gate are shot at from both sides.', at: [GATE[0] - 3.6, 13.6, GATE[1] + 2.8] },
    { label: 'Portcullis', note: 'An iron-shod grille that drops in grooves to close the gate passage in moments.', at: [GATE[0], 3.6, GATE[1] + 0.4] },
    { label: 'Round flanking towers', note: 'Towers bulging out from the curtain wall so defenders can shoot along its face; round towers had no corners to undermine.', at: [19.5, 11.5, -6] },
    { label: 'Wall-walk', note: 'A path along the top of the curtain wall behind the battlements, linking tower to tower.', at: [-19.5, 7.3, 6.5] },
    { label: 'Great hall', note: 'The setting for feasts and courts: tall pointed two-light windows, buttresses and a steep roof with a louvre over the hearth.', at: [8.5, 7.4, -7.6] },
  ],
  modelledOn: 'Later 13th-century gatehouses such as Tonbridge and Harlech, applied to an older castle',
  influences: ['crusader-castles'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.03, 0.01));
    const wall = tint(stone, -0.03);
    motte(b, { color: mix(P.turf, P.grassDry, 0.3), ditch: 'water' });
    stoneKeep(b, tint(stone, -0.05));

    // curtain rebuilt higher on the same line, with round towers at the angles
    const base = (x: number, z: number) => motteY(x, z);
    const right: [number, number][] = [toSummit(BAILEY_RIGHT[0], MOTTE.rTop - 0.8), ...BAILEY_RIGHT.slice(0, -1), [GATE[0] + 5, 19]];
    const left: [number, number][] = [[GATE[0] - 5, 19], ...BAILEY_LEFT.slice(1), toSummit(BAILEY_LEFT[BAILEY_LEFT.length - 1], MOTTE.rTop - 0.8)];
    curtain(b, right, 7.6, 2, wall, { base, outer: -1, piece: 7, merlon: 1 });
    curtain(b, left, 7.6, 2, wall, { base, outer: -1, piece: 7, merlon: 1 });
    for (const p of [...BAILEY_RIGHT.slice(1, -1), ...BAILEY_LEFT.slice(1, -1)]) {
      // pulled a little inwards so the towers stay on the plot
      const k = 0.94;
      roundTower(b, 3 + (p[0] - 3) * k, 1 + (p[1] - 1) * k, 2.5, 10.6, stone);
    }
    gatehouse(b, stone);

    // wet moat
    const moatPts = (pts: [number, number][]) => ditchLine(pts, 1.06);
    strip(b, moatPts(BAILEY_RIGHT.slice(1, -1)), 1.6, 0.04, P.water, { mat: 'glass' });
    strip(b, moatPts(BAILEY_LEFT.slice(1, -1)), 1.6, 0.04, P.water, { mat: 'glass' });
    strip(b, [[-13, 20.8], [14, 20.8]], 2, 0.04, P.water, { mat: 'glass' });

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
    b.group({ at: [-11, 0, 11.5] }, () => {
      b.box(5, 4.6, 8, stone);
      b.gable(5, 8, 3, P.stoneSlate, { at: [0, 4.6, 0], ridge: 'z', overhang: 0.2, wall: stone });
      arch(b, 1.4, 2.6, P.oakDark, { at: [0, 0, 4], facing: '+z', shape: 'round' });
      archWindow(b, 1.4, 3, { at: [0, 1.6, -4], facing: '-z', frame: tint(stone, -0.05), mullion: true });
      for (const z of [-2, 1]) b.sym((s) => archWindow(b, 0.6, 1.6, { at: [s * 2.5, 2.2, z], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: tint(stone, -0.05) }));
    });
    b.cyl(0.8, 0.8, P.rubble, { at: [5, 0, 6], segs: 8 });

    // colliders
    lineColliders(b, right.slice(1), 2.2);
    lineColliders(b, left.slice(0, -1), 2.2);
    b.sym((s) => b.collider(3.4, 6.5, { at: [GATE[0] + s * 3.8, 0, GATE[1] - 2.2] }));
    b.collider(KEEP.w + 1.6, KEEP.w + 1.6, { at: [MOTTE.x, 0, MOTTE.z] });
    b.collider(3.4, 6.4, { at: [MOTTE.x + KEEP.w / 2 + 1.7, 0, MOTTE.z - 0.8] });
    b.collider(25, 10, { at: [10.7, 0, -12] });
    b.collider(5, 5, { at: [-3, 0, -15.4] });
    b.collider(4.4, 12, { at: [15, 0, 4] });
    b.collider(5, 8, { at: [-11, 0, 11.5] });
  },
};
