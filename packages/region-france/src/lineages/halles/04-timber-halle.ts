import { P, mix, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { goods, sack, slab, stall, trestle } from './shared';

// The halle: a hipped roof over a 24 × 18 m frame, wall plates at YP, pitch K (rise per metre run).
const HX = 12; // half length (X) at the wall plate
const HZ = 9; // half span (Z) at the wall plate
const YP = 3.0; // wall plate height
const K = 1.25; // about 51 degrees
const OV = 0.6; // eaves overhang
const R = HX - HZ; // half length of the ridge
const YR = YP + HZ * K; // ridge
const TILE = P.tuilePlate;
const OAK = mix(P.oak, P.oakSilver, 0.3); // weathered oak

/** Height of the underside of the roof at (x, z). */
const roofY = (x: number, z: number) => Math.min(YP + (HZ - Math.abs(z)) * K, YP + (HX - Math.abs(x)) * K);

/**
 * The roof covering, as four planes, with lines of flat-tile courses. When `cut`, the right half of the
 * front slope is left off, with its rafters and battens showing.
 */
function roof(b: Builder, cut: boolean): void {
  const L = HX + OV;
  const S = HZ + OV;
  const ye = YP - OV * K;
  const t = 0.22;
  const y = (v: number) => v + t; // planes sit on the rafters
  const front: Vec3[] = [[-L, y(ye), S], [L, y(ye), S], [R, y(YR), 0], [-R, y(YR), 0]];
  // back slope
  slab(b, [[L, y(ye), -S], [-L, y(ye), -S], [-R, y(YR), 0], [R, y(YR), 0]], t, TILE);
  // hipped ends
  slab(b, [[L, y(ye), S], [L, y(ye), -S], [R, y(YR), 0], [R, y(YR), 0]], t, TILE);
  slab(b, [[-L, y(ye), -S], [-L, y(ye), S], [-R, y(YR), 0], [-R, y(YR), 0]], t, TILE);
  // front slope, in two halves so one can be left off
  slab(b, [front[0], [0, y(ye), S], [0, y(YR), 0], front[3]], t, TILE);
  if (!cut) slab(b, [[0, y(ye), S], front[1], front[2], [0, y(YR), 0]], t, TILE);

  // courses of flat tiles: thin darker lines across each plane, and the hips and ridge capped
  const line = tint(TILE, -0.1);
  const n = 14;
  for (let i = 1; i < n; i++) {
    const f = i / n;
    const yy = y(ye + (YR - ye) * f) + 0.02;
    const hx = L - f * (L - R); // half length of the course on the long slopes
    const hz = S * (1 - f); // half length on the hipped ends
    b.box(2 * hx, 0.04, 0.08, line, { at: [0, yy, -hz], jitter: false });
    if (cut) b.box(hx, 0.04, 0.08, line, { at: [-hx / 2, yy, hz], jitter: false });
    else b.box(2 * hx, 0.04, 0.08, line, { at: [0, yy, hz], jitter: false });
    for (const s of [-1, 1]) b.box(0.08, 0.04, 2 * hz, line, { at: [s * hx, yy, 0], jitter: false });
  }
  const cap = tint(TILE, -0.14);
  b.beam([-R, y(YR) + 0.05, 0], [R, y(YR) + 0.05, 0], 0.3, 0.22, cap);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam([sx * R, y(YR) + 0.04, 0], [sx * L, y(ye) + 0.04, sz * S], 0.26, 0.18, cap);
  // glazed pottery finials (épis) on the two ends of the ridge
  for (const sx of [-1, 1]) {
    b.lathe([[0.18, 0], [0.22, 0.25], [0.1, 0.5], [0.16, 0.75], [0.04, 1.2], [0.01, 1.3]], P.marbleGreen, { at: [sx * R, y(YR) + 0.1, 0], segs: 7 });
  }

  if (cut) {
    // exposed common rafters and battens where the covering is off
    for (let x = 0.3; x < L; x += 0.6) {
      const z0 = S;
      const ze = x <= R ? 0 : ((x - R) / (L - R)) * S; // where the rafter meets the hip
      const y1 = ye + (S - ze) * K;
      b.beam([x, ye + 0.11, z0], [x, y1 + 0.11, ze], 0.1, 0.14, OAK);
    }
    for (let i = 1; i < 9; i++) {
      const f = i / 9;
      const hx = L - f * (L - R);
      b.box(hx, 0.05, 0.07, tint(P.oak, 0.1), { at: [hx / 2, ye + (YR - ye) * f + 0.2, S * (1 - f)], jitter: false });
    }
  }
}

export const timberHalle: BuildingDef = {
  id: 'timber-halle',
  name: 'Timber market hall (halle)',
  style: 'Gothic carpentry',
  date: 'c. 1290 to 1600',
  summary:
    'The town, now a chartered commune with a weekly market as well as the fair, puts up a permanent hall: a great roof of flat clay tiles on a forest of oak posts, open on every side so carts can drive in. ' +
    'Inside it is laid out like a church, a tall nave between two rows of high posts and a low aisle on each side, and the roof sweeps down so low on all four sides that the hall seems to be nothing else. ' +
    'Each post stands on a stone block to keep its foot dry, and the oak frame is pegged together without a nail. Built by the lord or the town and let out stall by stall, halles like this survive by the dozen in France, some still holding their weekly market.',
  materials: ['oak (or chestnut) frame, pegged', 'flat clay tiles', 'stone pads', 'cobbles'],
  lookFor: [
    { label: 'The roof', note: 'Steep, hipped and covered in flat clay tiles, it comes down to about two metres from the ground all round: from outside the halle is almost all roof.', at: [-6.0, 9.6, 4.4] },
    { label: 'Nave and aisles', note: 'Two rows of tall posts make a high central nave, with lower aisles either side, the same plan as a church.', at: [-4.9, 6.0, 3.4] },
    { label: 'Stone pads', note: 'Every post stands on a block of stone so the oak does not rot where it meets the ground.', at: [-8.2, 0.6, 8.5] },
    { label: 'Braces and tie beams', note: 'Curved braces stiffen the frame; tie beams across the nave carry king posts up to the ridge. The front of the roof is cut away to show them.', at: [4.9, 9.2, 0] },
    { label: 'Grain measures', note: 'Stone blocks hollowed to the official measures of the market, so a buyer of grain could check what he was sold.', at: [9.3, 1.2, -1.2] },
  ],
  modelledOn: 'The halles of Milly-la-Forêt (1479) and Saint-Pierre-sur-Dives (medieval, burnt in 1944 and rebuilt as it was with the old methods), reduced in length; the form is common to the surviving halles of northern and central France',
  build(b) {
    const cut = b.cutaway;
    // cobbled floor running a little beyond the eaves
    b.box(2 * HX + 1.6, 0.1, 2 * HZ + 1.6, P.cobble, { jitter: false });
    for (let i = 0; i < 14; i++) b.box(b.range(0.6, 1.4), 0.012, b.range(0.6, 1.4), tint(P.cobble, b.range(-0.06, 0.05)), { at: [b.range(-12, 12), 0.1, b.range(-9.5, 9.5)], jitter: false });

    const xs = [-11.5, -8.21, -4.93, -1.64, 1.64, 4.93, 8.21, 11.5];
    const zo = 8.5; // outer rows
    const zi = 3.4; // inner rows (nave arcades)
    const pad = (x: number, z: number) => {
      b.box(0.62, 0.45, 0.62, P.pierreBlonde, { at: [x, 0.08, z] });
      b.collider(0.62, 0.62, { at: [x, 0, z] });
    };
    const post = (x: number, z: number, top: number, s = 0.3) => {
      pad(x, z);
      b.box(s, top - 0.53, s, OAK, { at: [x, 0.53, z] });
    };
    const yo = YP - 0.25; // top of the outer posts, under the wall plate
    const innerTop = (x: number) => Math.min(roofY(x, zi) - 0.45, 9.55);

    // ---- outer posts all round and the wall plate on them
    for (const x of xs) for (const s of [-1, 1]) post(x, s * zo, yo, 0.26);
    for (const z of [-5.6, 0, 5.6]) for (const s of [-1, 1]) post(s * 11.5, z, yo, 0.26);
    for (const s of [-1, 1]) {
      b.box(23.3, 0.25, 0.3, OAK, { at: [0, yo, s * zo] });
      b.box(0.3, 0.25, 2 * zo, OAK, { at: [s * 11.5, yo, 0] });
    }

    // ---- the two arcades of tall posts, their plates following the hips down at each end
    const tallX = xs.slice(1, -1);
    for (const s of [-1, 1]) {
      const z = s * zi;
      for (const x of tallX) post(x, z, innerTop(x), 0.34);
      const yTop = 9.55;
      const xFlat = HX - (yTop + 0.45 - YP) / K; // where the hip comes down past the plate
      b.box(2 * xFlat, 0.3, 0.32, OAK, { at: [0, yTop, z] });
      for (const sx of [-1, 1]) b.beam([sx * xFlat, yTop + 0.15, z], [sx * 11.5, yo + 0.15, z], 0.3, 0.3, OAK);
      // knee braces from the tall posts up to the plates
      for (const x of tallX) {
        const top = innerTop(x);
        for (const dx of [-1, 1]) {
          if (Math.abs(x + dx * 1.3) > xFlat) continue;
          b.beam([x, top - 1.6, z], [x + dx * 1.2, top - 0.05, z], 0.16, 0.16, OAK);
        }
      }
      // aisle ties from the outer plate to the tall posts, with braces under them
      for (const x of tallX) {
        b.box(0.24, 0.24, zo - zi, OAK, { at: [x, yo - 0.05, s * (zo + zi) / 2] });
        b.beam([x, yo - 1.3, z], [x, yo - 0.05, s * (zi + 1.4)], 0.14, 0.14, OAK);
        b.beam([x, yo - 1.0, s * zo], [x, yo - 0.05, s * (zo - 1.1)], 0.14, 0.14, OAK);
        // aisle rafter (principal) from the wall plate up to the arcade plate
        b.beam([x, yo + 0.25, s * (zo + 0.4)], [x, innerTop(x) + 0.2, s * (zi - 0.1)], 0.22, 0.22, OAK);
      }
    }

    // ---- the nave frames: tie beam, king post and principal rafters up to the ridge
    for (const x of tallX) {
      const top = innerTop(x);
      const yt = top - 0.9;
      b.box(0.3, 0.32, 2 * zi + 0.3, OAK, { at: [x, yt, 0] });
      const ridge = roofY(x, 0) - 0.28;
      b.box(0.26, ridge - yt - 0.3, 0.26, OAK, { at: [x, yt + 0.32, 0] });
      for (const s of [-1, 1]) {
        b.beam([x, top + 0.15, s * zi], [x, ridge, 0], 0.22, 0.24, OAK);
        b.beam([x, yt - 1.4, s * zi], [x, yt, s * (zi - 1.3)], 0.15, 0.15, OAK); // curved brace, in two straights
        b.beam([x, yt + 0.32, 0], [x, Math.min(yt + 1.9, ridge - 0.5), s * 1.5], 0.14, 0.14, OAK); // struts from the king post
      }
    }
    // ridge beam and a purlin each side
    b.box(2 * R + 0.6, 0.26, 0.26, OAK, { at: [0, YR - 0.55, 0] });

    roof(b, cut);

    // ---- the market under the roof: stalls in the aisles, sacks of grain, the stone measures
    const cloths = [P.cream, P.ochreWash, tint(P.cream, -0.08), P.voletBleu];
    for (const x of [-7.0, -3.3, 0.4, 4.1]) stall(b, 2.4, [x, 0.1, -6.3], 0, b.pick(cloths), undefined, b.pick([['basket', 'fruit'], ['cheese', 'basket'], ['pot', 'cloth'], ['sack', 'basket']]));
    for (const x of [-5.2, -1.5, 2.2, 6.0]) stall(b, 2.4, [x, 0.1, 6.3], Math.PI, b.pick(cloths), undefined, b.pick([['cloth'], ['basket', 'fruit'], ['pot', 'basket'], ['cheese']]));
    trestle(b, 3.0, 1.0, [-1.6, 0.1, 0.8]);
    goods(b, 2.6, [-1.6, 0.98, 0.8], 0, ['fish']);
    trestle(b, 3.0, 1.0, [3.0, 0.1, -0.8]);
    goods(b, 2.6, [3.0, 0.98, -0.8], 0, ['basket', 'fruit']);
    for (let i = 0; i < 9; i++) sack(b, [-8.8 + (i % 3) * 0.55, 0.1, -1.6 + Math.floor(i / 3) * 0.6]);
    for (let i = 0; i < 4; i++) sack(b, [-7.6 + (i % 2) * 0.55, 0.1, 1.4 + Math.floor(i / 2) * 0.6]);
    // the grain measures: a stone table with three round hollows
    b.group({ at: [9.3, 0.1, -1.2] }, () => {
      b.box(0.9, 0.7, 2.2, P.pierreBlonde);
      for (const [z, r] of [[-0.6, 0.34], [0.15, 0.27], [0.7, 0.18]] as [number, number][]) b.cyl(r, 0.02, P.windowDark, { at: [0, 0.7, z], segs: 10, jitter: false });
    });
    b.collider(0.9, 2.2, { at: [9.3, 0, -1.2] });
  },
};
