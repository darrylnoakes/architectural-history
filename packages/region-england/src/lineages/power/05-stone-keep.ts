import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BAILEY_LEFT, BAILEY_RIGHT, GATE, MOTTE, arcade, arch, archWindow, curtain, lineColliders, motte, motteY, strip } from './shared';
import { ditchLine, toSummit } from './04-motte-and-bailey';

export const KEEP = { w: 9.6, h: 19, plinth: 1.4 };

/**
 * The square stone keep on the motte summit: battered plinth, flat pilaster buttresses, corner
 * turrets rising above the battlements, round-headed windows growing larger towards the hall
 * storey, and a forebuilding guarding the first-floor entrance on the +X side.
 */
export function stoneKeep(b: Builder, stone: number, o?: { ruin?: boolean }) {
  const W = KEEP.w;
  const H = KEEP.h;
  const y0 = MOTTE.h;
  b.group({ at: [MOTTE.x, y0, MOTTE.z] }, () => {
    // battered plinth: a square frustum
    b.cyl(((W + 1.6) / 2) * Math.SQRT2, KEEP.plinth + 0.6, tint(stone, -0.04), {
      at: [0, -0.6, 0],
      rTop: (W / 2) * Math.SQRT2,
      segs: 4,
      rotY: Math.PI / 4,
    });
    const z0 = KEEP.plinth;
    b.box(W, H, W, stone, { at: [0, z0, 0] });
    const faces = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    for (const f of faces) {
      b.group({ rotY: f }, () => {
        // central pilaster buttress
        b.box(1.1, H, 0.3, stone, { at: [0, z0, W / 2 + 0.15] });
        // string course at the hall floor
        b.box(W, 0.25, 0.2, tint(stone, -0.05), { at: [0, z0 + 8.6, W / 2 + 0.1], jitter: false });
        // windows: slits below, single lights above, paired lights to the great hall
        for (const s of [-1, 1]) {
          arch(b, 0.22, 1.2, P.black, { at: [s * 2.4, z0 + 2.4, W / 2], shape: 'round', n: 1 });
          arch(b, 0.6, 1.5, P.windowDark, { at: [s * 2.4, z0 + 5.8, W / 2], shape: 'round', n: 2 });
          archWindow(b, 1.3, 2.6, { at: [s * 2.4, z0 + 10.2, W / 2], shape: 'round', frame: tint(stone, -0.06), mullion: true, border: 0.12 });
          arch(b, 0.7, 1.5, P.windowDark, { at: [s * 2.4, z0 + 15.2, W / 2], shape: 'round', n: 2 });
        }
      });
    }
    // corner turrets, carried up above the parapet
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const at: [number, number, number] = [sx * (W / 2 - 0.5), z0, sz * (W / 2 - 0.5)];
        b.box(2.0, H + 2.6, 2.0, stone, { at });
        for (const [mx, mz] of [[0.75, 0.75], [-0.75, 0.75], [0.75, -0.75], [-0.75, -0.75]]) {
          b.box(0.5, 0.7, 0.5, stone, { at: [at[0] + mx, z0 + H + 2.6, at[2] + mz], jitter: false });
        }
      }
    // parapet with battlements
    b.crenel(W, W, stone, { at: [0, z0 + H, 0], merlonW: 0.65, merlonH: 0.9, t: 0.45 });
    b.box(W - 0.9, 0.1, W - 0.9, P.lead, { at: [0, z0 + H - 0.2, 0] });
    b.box(W + 0.24, 0.3, W + 0.24, tint(stone, -0.05), { at: [0, z0 + H - 0.3, 0], jitter: false });

    // forebuilding on the +X face, climbing down the side of the motte
    const FX = W / 2 + 1.7;
    const fb = -3.4; // its base, buried in the slope
    b.box(3.4, 12.5 - fb, 6.4, stone, { at: [FX, fb, -0.8] });
    b.crenel(3.4, 6.4, stone, { at: [FX, 12.5, -0.8], merlonW: 0.55, merlonH: 0.8, t: 0.35 });
    archWindow(b, 0.9, 1.8, { at: [FX + 1.7, 7.2, -0.8], facing: '+x', shape: 'round', frame: tint(stone, -0.05), border: 0.1 });
    arch(b, 0.2, 1.1, P.black, { at: [FX + 1.7, 3.4, -2.6], facing: '+x', shape: 'round' });
    // entrance arch at the top of the stair (south side of the forebuilding)
    arch(b, 1.9, 3.0, tint(stone, -0.08), { at: [FX + 0.2, -0.7, 2.4], facing: '+z', shape: 'round' });
    arch(b, 1.4, 2.6, P.oakDark, { at: [FX + 0.2, -0.7, 2.45], facing: '+z', shape: 'round' });
    b.box(2.4, 0.3, 1.6, tint(stone, -0.04), { at: [FX + 0.2, -0.95, 3.1] });
  });
  if (!o?.ruin) {
    // stone stair up the motte side to the forebuilding door
    const sx = MOTTE.x + KEEP.w / 2 + 1.9;
    b.stairs(2.0, MOTTE.h - 0.7, 8.4, 14, tint(stone, -0.06), { at: [sx, 0, MOTTE.z + 2.4 + 4.2] });
  }
}

export const stoneKeepDef: BuildingDef = {
  id: 'stone-keep',
  name: 'Stone keep castle',
  style: 'Norman Romanesque',
  date: 'c. 1130',
  summary:
    'Once the conquest was secure, many lords rebuilt their timber castles in stone. A square great tower, the keep, now crowns the old motte, as at Norwich and Guildford, and a stone curtain wall replaces the palisade around the bailey. ' +
    'Its walls are three or four metres thick, with flat buttresses and turrets at the corners. The door is on the first floor, reached by a stair through a forebuilding, and the windows grow larger as they rise, up to the great hall in the upper storeys.',
  materials: ['limestone ashlar', 'flint and rubble core', 'lead roof', 'oak floors'],
  lookFor: [
    { label: 'Keep', note: 'A square tower of stone, the lord\'s residence and last line of defence, here raised on the old earth motte.', at: [MOTTE.x - 4.8, 18, MOTTE.z + 5.2] },
    { label: 'Corner turrets', note: 'The corners rise above the battlements as small towers, strengthening the weakest point of a square building.', at: [MOTTE.x + 4.3, 29.8, MOTTE.z + 4.3] },
    { label: 'Pilaster buttresses', note: 'Broad, shallow strips of stone running up each face: a Norman way of stiffening a wall.', at: [MOTTE.x, 14, MOTTE.z + 5.3] },
    { label: 'Forebuilding', note: 'A lower tower against one side, guarding the stair to the first-floor entrance; there was usually no door at ground level.', at: [MOTTE.x + 8.6, 15.8, MOTTE.z - 0.8] },
    { label: 'Round-headed windows', note: 'Romanesque semicircular arches, narrow slits low down and large two-light windows to the hall above.', at: [MOTTE.x + 2.4, 20, MOTTE.z + 5.4] },
  ],
  modelledOn: 'Hedingham Castle, Essex (c. 1140) and Rochester Castle keep (1127); set on a motte like Norwich and Guildford',
  influences: ['norman-romanesque'],
  build(b) {
    const stone = tint(P.limestone, b.range(-0.02, 0.02));
    motte(b, { color: mix(P.turf, P.grassDry, 0.3), ditch: 'dry' });
    stoneKeep(b, stone);

    // stone curtain wall on the line of the old palisade, stepping up the motte
    const base = (x: number, z: number) => motteY(x, z);
    const right: [number, number][] = [toSummit(BAILEY_RIGHT[0], MOTTE.rTop - 0.8), ...BAILEY_RIGHT];
    const left: [number, number][] = [...BAILEY_LEFT, toSummit(BAILEY_LEFT[BAILEY_LEFT.length - 1], MOTTE.rTop - 0.8)];
    const wall = tint(stone, -0.05);
    curtain(b, right, 6, 1.6, wall, { base, outer: -1 });
    curtain(b, left, 6, 1.6, wall, { base, outer: -1 });
    const ditch = mix(P.soil, P.earth, 0.4);
    strip(b, ditchLine(BAILEY_RIGHT.slice(1)), 1.5, 0.03, ditch);
    strip(b, ditchLine(BAILEY_LEFT.slice(0, -1)), 1.5, 0.03, ditch);
    strip(b, [[-12.6, 20.6], [-1, 20.6]], 1.7, 0.03, ditch);
    strip(b, [[4, 20.6], [14, 20.6]], 1.7, 0.03, ditch);

    // square gate tower
    b.group({ at: [GATE[0], 0, GATE[1] - 1.8] }, () => {
      arcade(b, 6.2, 9, 5, wall, { openings: 1, openW: 3, openH: 4.2, shape: 'round' });
      b.crenel(6.2, 5, wall, { at: [0, 9, 0], merlonW: 0.6, merlonH: 0.9, t: 0.4 });
      b.box(5.4, 0.1, 4.2, P.lead, { at: [0, 8.8, 0] });
      archWindow(b, 0.7, 1.5, { at: [0, 5.8, 2.5], facing: '+z', shape: 'round', frame: tint(wall, -0.05) });
      b.box(3.0, 0.2, 0.2, P.oakDark, { at: [0, 4.2, 2.5] });
      // timber bridge over the ditch
      b.box(3.2, 0.25, 2.4, P.oak, { at: [0, 0.35, 3.6] });
      b.sym((s) => b.box(0.12, 1.0, 2.4, P.oakDark, { at: [s * 1.5, 0.6, 3.6] }));
    });

    // stone hall in the bailey: a first-floor hall over a storage undercroft
    b.group({ at: [9.5, 0, -11.5] }, () => {
      b.box(15, 7.2, 7.6, stone);
      b.gable(15, 7.6, 3.6, P.stoneSlate, { at: [0, 7.2, 0], overhang: 0.3, wall: stone });
      for (const x of [-5.4, -1.8, 1.8, 5.4]) {
        arch(b, 0.25, 1.0, P.black, { at: [x, 1.2, 3.8], facing: '+z', shape: 'round' });
        archWindow(b, 1.1, 2.2, { at: [x, 4.0, 3.8], facing: '+z', shape: 'round', frame: tint(stone, -0.05), mullion: true });
        archWindow(b, 1.1, 2.2, { at: [x, 4.0, -3.8], facing: '-z', shape: 'round', frame: tint(stone, -0.05) });
      }
      b.stairs(1.6, 3.2, 4.4, 9, tint(stone, -0.06), { at: [-6.4, 0, 6], rotY: 0 });
      arch(b, 1.3, 2.4, P.oakDark, { at: [-6.4, 3.2, 3.8], facing: '+z', shape: 'round' });
      b.chimney(0.9, 2.4, 0.9, stone, { at: [3, 9.4, 0] });
    });
    // stables (still timber) and a stone chapel
    b.group({ at: [15.3, 0, 4.5] }, () => {
      b.box(4.2, 2.8, 12, mix(P.oak, P.oakSilver, 0.3));
      b.shed(5, 12.6, 1.3, P.thatchOld, { at: [0, 2.8, 0], high: '+x' });
      for (const z of [-4, 0, 4]) b.panel(1.6, 2.0, P.oakDark, { at: [-2.1, 0, z], facing: '-x' });
    });
    b.group({ at: [-11, 0, 11.5] }, () => {
      b.box(5, 4.6, 8, stone);
      b.gable(5, 8, 3, P.stoneSlate, { at: [0, 4.6, 0], ridge: 'z', overhang: 0.2, wall: stone });
      arch(b, 1.4, 2.6, P.oakDark, { at: [0, 0, 4], facing: '+z', shape: 'round' });
      archWindow(b, 0.8, 1.8, { at: [0, 4.9, 4], facing: '+z', shape: 'round', frame: tint(stone, -0.05) });
      for (const z of [-2, 1]) b.sym((s) => archWindow(b, 0.6, 1.6, { at: [s * 2.5, 2.2, z], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: tint(stone, -0.05) }));
      b.box(3, 3, 2.2, stone, { at: [0, 0, -5] }); // small apse-like chancel
      b.gable(3, 2.2, 1.6, P.stoneSlate, { at: [0, 3, -5], ridge: 'z', wall: stone });
    });
    b.cyl(0.8, 0.8, P.rubble, { at: [5, 0, 6], segs: 8 });

    // colliders
    lineColliders(b, BAILEY_RIGHT.slice(1), 1.8);
    lineColliders(b, BAILEY_LEFT.slice(0, -1), 1.8);
    b.sym((s) => b.collider(1.6, 5, { at: [GATE[0] + s * 2.3, 0, GATE[1] - 1.8] }));
    b.collider(KEEP.w + 1.6, KEEP.w + 1.6, { at: [MOTTE.x, 0, MOTTE.z] });
    b.collider(3.4, 6.4, { at: [MOTTE.x + KEEP.w / 2 + 1.7, 0, MOTTE.z - 0.8] });
    b.collider(15, 7.6, { at: [9.5, 0, -11.5] });
    b.collider(4.2, 12, { at: [15.3, 0, 4.5] });
    b.collider(5, 10.2, { at: [-11, 0, 10.4] });
    b.collider(1.7, 1.7, { at: [5, 0, 6] });
  },
};
