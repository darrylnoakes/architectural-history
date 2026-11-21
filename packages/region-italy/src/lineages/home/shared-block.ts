import { P, tint, mix, spread, type Builder, type Vec3 } from '@ah/kit';
import { coppiRoof, coppiShed, hole, onWall, pave, raggedOutline, vegBed } from './shared';

/**
 * The Imperial apartment block of stages 4 and 5 (Ostia type), shared so that the ruin of stage 5
 * is visibly the same building: same storeys, same window axes, same shop openings.
 */
export const BLK = {
  W: 13.6,
  zf: 7.6, // street front
  zb: -1.4, // garden front
  zx: 3.0, // spine wall between front and back flats
  floors: [0, 4.4, 7.8, 11.0], // floor levels
  H: 14.0, // eaves
  axes: [-5.0, -2.5, 0, 2.5, 5.0], // window axes of the upper floors
  winH: [1.9, 1.7, 1.4], // window heights on floors 1..3
  shopX: 4.3,
};

/** Window opening on floor f (1..3): [y0, h]. */
function win(f: number): [number, number] {
  return [BLK.floors[f] + 0.75, BLK.winH[f - 1]];
}

/** A flat brick arch with a relieving arch above an opening of width w whose head is at y (in a wall frame). */
function brickArches(b: Builder, x: number, y: number, w: number, brick: number, wall: number, relieving = true): void {
  b.panel(w + 0.24, 0.3, tint(brick, -0.08), { at: [x, y, 0], depth: 0.03 });
  if (!relieving) return;
  b.panel(w + 0.5, 0.75, tint(brick, -0.1), { at: [x, y + 0.34, 0], shape: 'segmental', depth: 0.02 });
  b.panel(w + 0.1, 0.55, wall, { at: [x, y + 0.34, 0], shape: 'segmental', depth: 0.025 });
}

/** Walling-up of an opening with reused blocks of every kind (in a wall frame, bottom centre at x, y0). */
export function rubbleFill(b: Builder, x: number, y0: number, w: number, h: number, o: { door?: number; window?: boolean } = {}): void {
  const cols = [P.tufa, P.travertine, P.peperino, P.brickOrange, P.marble, tint(P.tufa, -0.08), P.cotto];
  b.panel(w, h, tint(P.rubble, -0.05), { at: [x, y0, 0], depth: 0.02 });
  const rows = Math.max(2, Math.round(h / 0.4));
  for (let j = 0; j < rows; j++) {
    const n = Math.max(2, Math.round(w / 0.55)) + (j % 2);
    let u = -w / 2;
    for (let i = 0; i < n; i++) {
      const bw = (w / n) * b.range(0.8, 1.2);
      const ww = Math.min(bw, w / 2 - u);
      if (ww < 0.12) break;
      const c = b.pick(cols);
      b.panel(ww - 0.04, h / rows - 0.05, c, { at: [x + u + ww / 2, y0 + (j * h) / rows + 0.02, 0], depth: 0.04 });
      u += ww;
    }
  }
  if (o.door) {
    b.panel(o.door, 2.0, P.oakDark, { at: [x, y0, 0], depth: 0.07 });
    b.panel(o.door + 0.3, 0.3, P.travertine, { at: [x, y0 + 2.0, 0], depth: 0.075 }); // a reused lintel
  }
  if (o.window) b.panel(0.4, 0.45, P.timberBlack, { at: [x, y0 + h * 0.6, 0], depth: 0.07 });
}

export function ostiaBlock(b: Builder, ruin: boolean): void {
  const { W, zf, zb, zx, floors, H, axes, shopX } = BLK;
  const X = W / 2;
  const D = zf - zb;
  const zc = (zf + zb) / 2;
  const brick = mix(P.brickOrange, P.cotto, b.range(0.1, 0.5));
  const course = tint(brick, -0.1);
  const trav = P.travertine;
  const tile = tint(P.romanTile, b.range(-0.04, 0.02));
  const shut = b.pick([P.oak, P.oakDark, tint(P.oak, 0.06)]);
  const glass = 0x46566a;
  const wallT = 0.6;

  // ---------------------------------------------------------------- the street front
  const frontHoles: [number, number][][] = [];
  const front = (fn: () => void) => onWall(b, [0, 0, zf], '+z', fn);
  // ragged tops of the ruin (11 points along the front, left to right)
  const fTops = [13.8, 14.0, 13.7, 11.2, 10.9, 9.6, 8.4, 7.7, 7.4, 8.3, 9.1];
  const topAt = (tops: number[], w: number, x: number) => {
    const f = ((x + w / 2) / w) * (tops.length - 1);
    const i = Math.max(0, Math.min(tops.length - 2, Math.floor(f)));
    const t = f - i;
    return tops[i] * (1 - t) + tops[i + 1] * t;
  };
  const fits = (tops: number[], w: number, x: number, hw: number, top: number) =>
    Math.min(topAt(tops, w, x - hw), topAt(tops, w, x), topAt(tops, w, x + hw)) > top + 0.35;

  if (!ruin) {
    b.box(W, H, D, brick, { at: [0, 0, zc] });
    for (const y of [floors[1] - 0.15, floors[2] - 0.12, floors[3] - 0.12]) b.box(W + 0.02, 0.14, D + 0.08, course, { at: [0, y, zc] });
    b.box(W + 0.02, 0.35, D + 0.25, tint(brick, -0.06), { at: [0, H - 0.35, zc] }); // brick eaves cornice
    coppiRoof(b, W, D, 1.7, tile, { at: [0, H, zc], overhang: 0.45, ends: 0, wall: brick, thick: 0.13, step: 0.55 });
  } else {
    const outline = raggedOutline(W, fTops);
    for (let f = 1; f <= 3; f++) {
      const [y0, h] = win(f);
      for (const x of axes) if (fits(fTops, W, x, 0.6, y0 + h)) frontHoles.push(hole(x, y0, 1.2, h));
    }
    // the mezzanine windows above the shops and the street door stay open
    for (const x of [-shopX, shopX]) frontHoles.push(hole(x, 3.2, 0.9, 0.7));
    b.extrude(outline, wallT, brick, { at: [0, 0, zf - wallT / 2], holes: frontHoles });
  }

  front(() => {
    // ground floor: two shops, the stair door between them
    for (const s of [-1, 1] as const) {
      const x = s * shopX;
      if (!ruin) {
        b.panel(3.0, 3.0, P.windowDark, { at: [x, 0, 0], depth: 0.02 });
        // folding shutter leaves, half open
        for (const u of spread(5, -1.45, -0.45)) b.panel(0.19, 2.9, tint(shut, b.range(-0.03, 0.03)), { at: [x + u, 0.05, 0], depth: 0.05 });
        b.box(3.2, 0.12, 0.3, trav, { at: [x, 0, 0.08], jitter: false }); // threshold
        // wares and a counter
        b.box(1.4, 0.9, 0.45, trav, { at: [x + 0.6, 0, 0.25] });
        for (const [u, c] of [[0.2, P.terracotta], [0.6, P.cream], [1.0, P.terracotta]] as [number, number][]) {
          b.cyl(0.14, 0.4, c, { at: [x + u, 0.9, 0.25], rTop: 0.06, segs: 7 });
        }
        b.window(0.9, 0.7, { at: [x, 3.2, 0], frame: shut, glass, bars: [2, 1] });
      } else if (s < 0) {
        // walled up, with a small window
        rubbleFill(b, x, 0, 3.0, 3.0, { window: true });
      } else {
        // narrowed to a doorway with reused blocks
        rubbleFill(b, x, 0, 3.0, 3.0, { door: 1.0 });
      }
      brickArches(b, x, 3.0, 3.0, brick, brick);
    }
    // the stair door with brick pilasters and a pediment
    b.panel(1.4, 2.8, ruin ? P.timberBlack : P.oakDark, { at: [0, 0, 0], depth: ruin ? 0.02 : 0.05 });
    if (!ruin) b.panel(0.04, 2.7, P.timberBlack, { at: [0, 0.05, 0], depth: 0.07 });
    b.sym((s) => b.box(0.32, 3.0, 0.2, tint(brick, 0.04), { at: [s * 0.9, 0, 0.1] }));
    b.box(2.3, 0.22, 0.32, tint(brick, -0.06), { at: [0, 3.0, 0.14] });
    b.extrude([[-1.25, 0], [1.25, 0], [0, 0.6]], 0.28, tint(brick, -0.04), { at: [0, 3.22, 0.14] });
    b.box(1.6, 0.14, 0.5, trav, { at: [0, 0, 0.2] });

    // upper floors
    for (let f = 1; f <= 3; f++) {
      const [y0, h] = win(f);
      for (const x of axes) {
        const open = !ruin || fits(fTops, W, x, 0.6, y0 + h);
        if (!ruin) {
          b.window(1.2, h, { at: [x, y0, 0], frame: shut, glass, bars: [2, 2] });
          brickArches(b, x, y0 + h, 1.2, brick, brick, f === 1);
        } else if (open) {
          brickArches(b, x, y0 + h, 1.2, brick, brick);
          // putlog holes of the lost floor beams beside each opening
          b.panel(0.18, 0.18, P.timberBlack, { at: [x + 1.0, floors[f] - 0.3, 0], depth: 0.01 });
        } else if (topAt(fTops, W, x) > y0 + 0.5) {
          // the broken sill of a window whose head has fallen
          b.box(1.3, 0.12, 0.2, trav, { at: [x, y0 - 0.1, 0.05] });
        }
      }
    }

    // the balcony on travertine brackets (in the ruin only stumps of the brackets are left)
    const by = floors[1];
    const bx = spread(10, -6.1, 6.1);
    for (const x of bx) {
      if (!ruin) {
        b.extrude([[0, 0], [0, -0.55], [0.12, -0.55], [0.85, -0.12], [0.85, 0]], 0.26, trav, { at: [x, by, 0], rotY: -Math.PI / 2 });
      } else if (Math.abs(x - 3.4) > 2.2) {
        b.extrude([[0, 0], [0, -0.55], [0.12, -0.55], [0.3, -0.42], [0.3, 0]], 0.26, trav, { at: [x, by, 0], rotY: -Math.PI / 2 });
      }
    }
    if (!ruin) {
      b.box(12.6, 0.18, 0.95, tint(brick, -0.04), { at: [0, by, 0.47] });
      b.box(12.6, 0.08, 0.1, P.oakDark, { at: [0, by + 1.0, 0.88] });
      b.box(12.6, 0.08, 0.08, P.oakDark, { at: [0, by + 0.45, 0.88] });
      for (const x of spread(28, -6.25, 6.25)) b.box(0.05, 1.0, 0.05, P.oak, { at: [x, by + 0.18, 0.88], jitter: false });
      b.sym((s) => b.box(0.08, 1.0, 0.9, P.oakDark, { at: [s * 6.26, by + 0.18, 0.45] }));
      // flowers on the balcony
      for (const x of [-4.0, 1.3, 5.6]) {
        b.cyl(0.18, 0.3, P.terracotta, { at: [x, by + 0.18, 0.6], segs: 7 });
        b.blob(0.28, b.pick([P.leafDark, P.hedge]), { at: [x, by + 0.65, 0.6], detail: 0 });
      }
    }
  });

  // ---------------------------------------------------------------- party walls, back and spine
  const sideL = [13.8, 12.9, 11.6, 10.2, 9.0];
  const sideR = [9.1, 8.2, 6.9, 6.0, 5.6];
  const bTops = [5.6, 6.4, 6.8, 5.9, 5.4, 6.2, 7.6, 8.4, 9.0]; // seen from inside: world right to left
  const backHoles: [number, number][][] = [];
  if (ruin) {
    // party walls (their outer faces are blank)
    b.sym((s) => {
      const tops = s < 0 ? [...sideL].reverse() : sideR.slice().reverse();
      // outline runs from back (-D/2) to front (+D/2) along local x; rotate so local x runs along +Z
      b.extrude(raggedOutline(D, tops), wallT, brick, { at: [s * (X - wallT / 2), 0, zc], rotY: -Math.PI / 2 });
    });
    for (const x of axes) if (fits(bTops, W, -x, 0.6, win(1)[0] + win(1)[1])) backHoles.push(hole(-x, win(1)[0], 1.2, win(1)[1]));
    backHoles.push(hole(0, 0, 1.4, 2.6));
    backHoles.push(hole(-3.6, 1.0, 1.1, 1.5));
    b.extrude(raggedOutline(W, bTops), wallT, brick, { at: [0, 0, zb + wallT / 2], rotY: Math.PI, holes: backHoles });
    b.extrude(raggedOutline(W - 2 * wallT, [7.2, 8.4, 6.0, 5.2, 7.6, 6.4, 5.0]), 0.5, tint(brick, -0.04), { at: [0, 0, zx], holes: [hole(-2.5, 4.9, 1.0, 2.2), hole(2.5, 4.9, 1.0, 2.2)] });
    // the first floor survives as a concrete slab over the ground-floor rooms, overgrown with weeds and rubble
    b.box(W - 2 * wallT, 0.45, D - 2 * wallT, tint(P.concreteDark, 0.04), { at: [0, floors[1] - 0.3, zc] });
    b.box(W - 2 * wallT - 0.1, 0.06, D - 2 * wallT - 0.1, tint(P.cotto, -0.05), { at: [0, floors[1] + 0.15, zc] }); // its tiled floor
    for (const [x, z, r, c] of [[-4.6, 5.8, 0.9, P.rubble], [3.8, 0.0, 1.1, P.rubble], [-1.0, -0.2, 0.7, P.grassDry], [4.9, 6.0, 0.8, P.grass], [-5.4, 0.4, 0.7, P.grass]] as [number, number, number, number][]) {
      b.blob(r, c, { at: [x, floors[1] + 0.1, z], stretch: [1.3, 0.4, 1.0], detail: 0 });
    }
    // weeds and a fig on the wall tops
    for (const [x, y, z] of [[-6.2, 13.9, 7.4], [-3.2, 11.0, 7.4], [6.6, 5.6, -1.2], [-6.6, 11.8, 1.6]] as Vec3[]) {
      b.blob(0.5, P.leafDark, { at: [x, y, z], stretch: [1.2, 0.7, 1.0], detail: 0 });
    }
    // a little shelter of reused tiles over the stair head
    for (const [x, z] of [[-1.6, 1.8], [1.6, 1.8], [-1.6, -0.6], [1.6, -0.6]] as [number, number][]) b.box(0.16, 1.9, 0.16, P.oakSilver, { at: [x, floors[1] + 0.15, z] });
    coppiShed(b, 3.8, 3.0, 0.5, tint(tile, -0.04), { at: [0, floors[1] + 2.05, 0.6], high: '+z' });
  } else {
    // back windows and the garden door
    const back = (fn: () => void) => onWall(b, [0, 0, zb], '-z', fn);
    back(() => {
      for (let f = 1; f <= 3; f++) {
        const [y0, h] = win(f);
        for (const x of axes) {
          b.window(1.2, h, { at: [x, y0, 0], frame: shut, glass, bars: [2, 2] });
          brickArches(b, x, y0 + h, 1.2, brick, brick, false);
        }
      }
      b.panel(1.4, 2.6, P.oakDark, { at: [0, 0, 0], depth: 0.05 });
      brickArches(b, 0, 2.6, 1.4, brick, brick);
      for (const x of [-3.6, 3.6]) {
        b.window(1.1, 1.5, { at: [x, 1.0, 0], frame: shut, glass, bars: [2, 2] });
        brickArches(b, x, 2.5, 1.1, brick, brick);
      }
    });
  }
  if (ruin) {
    onWall(b, [0, 0, zb], '-z', () => {
      b.panel(1.4, 2.6, P.oakDark, { at: [0, 0, 0.0], depth: 0.04 });
      rubbleFill(b, 3.6, 1.0, 1.1, 1.5);
      brickArches(b, 0, 2.6, 1.4, brick, brick);
      brickArches(b, 3.6, 2.5, 1.1, brick, brick);
      brickArches(b, -3.6, 2.5, 1.1, brick, brick);
      b.panel(0.55, 1.5, P.oakSilver, { at: [-3.6 - 0.85, 1.0, 0], depth: 0.05 }); // a shutter
    });
  }

  // ---------------------------------------------------------------- the garden (or the vegetable patch)
  const gz1 = -8.8;
  const gw = tint(brick, 0.03);
  b.box(W, 2.6, 0.45, gw, { at: [0, 0, gz1 + 0.22] });
  b.sym((s) => b.box(0.45, 2.6, zb - gz1, gw, { at: [s * (X - 0.22), 0, (zb + gz1) / 2] }));
  const gc = (zb + gz1) / 2;
  if (!ruin) {
    // a formal garden with a long fountain basin, box hedges and a pair of trees
    pave(b, W - 0.9, zb - gz1 - 0.45, P.gravel, [0, 0, gc - 0.2]);
    b.box(2.0, 0.45, 4.0, P.marble, { at: [0, 0, gc - 0.2] });
    b.box(1.7, 0.47, 3.7, P.water, { at: [0, 0, gc - 0.2], jitter: false });
    b.cyl(0.12, 1.0, P.marble, { at: [0, 0, gc - 0.2], segs: 6 });
    b.sym((s) => {
      b.box(3.6, 0.5, 4.6, P.hedge, { at: [s * 3.6, 0, gc - 0.2] });
      b.box(3.2, 0.52, 4.2, P.grass, { at: [s * 3.6, 0, gc - 0.2] });
      b.tree(4.6, { at: [s * 3.6, 0, gc - 0.2], kind: 'cypress' });
    });
  } else {
    // the garden dug for vegetables, the basin filled with earth, a lean-to against the house
    vegBed(b, -3.4, gc, 4.6, 5.2, { rows: 7 });
    vegBed(b, 3.8, gc - 1.2, 3.8, 3.4, { rows: 5, color: P.leafDark });
    b.box(2.0, 0.45, 4.0, tint(P.marble, -0.15), { at: [0, 0, gc - 0.2] });
    b.box(1.7, 0.47, 3.7, P.soil, { at: [0, 0, gc - 0.2], jitter: false });
    // lean-to of salvaged timber and tiles, with a clay oven and firewood under it
    const lz = zb - 1.0;
    for (const x of [1.6, 4.0, 6.3]) b.box(0.16, 2.2, 0.16, P.oakSilver, { at: [x, 0, lz - 0.9] });
    coppiShed(b, 5.4, 2.0, 0.7, tint(P.romanTile, -0.08), { at: [3.95, 2.2, lz], high: '+z' });
    b.dome(0.7, tint(P.cob, -0.05), { at: [5.2, 0, lz + 0.2], squash: 0.9, segs: 9 });
    for (let i = 0; i < 4; i++) b.log(0.08, 1.4, P.bark, { at: [2.6, i * 0.15, lz + 0.1 + (i % 2) * 0.08], segs: 5 });
    // rubble heap with a column drum and a broken marble slab
    b.blob(1.1, P.rubble, { at: [-4.6, 0, gz1 + 1.6], stretch: [1.4, 0.5, 1.0], detail: 0 });
    b.log(0.32, 0.8, P.marble, { at: [-2.4, 0, gz1 + 1.2], segs: 9, rotY: 0.4 });
    b.box(1.1, 0.12, 0.6, P.marble, { at: [-5.6, 0.4, gz1 + 1.4], rot: [0, 0.3, 0.3] });
    b.tree(b.range(3.0, 3.6), { at: [5.2, 0, gz1 + 1.1], kind: 'olive' });
    // a goat
    b.group({ at: [1.4, 0, gz1 + 2.0], rotY: 1.0 }, () => {
      b.box(0.35, 0.35, 0.75, P.cream, { at: [0, 0.38, 0] });
      b.box(0.2, 0.25, 0.3, P.cream, { at: [0, 0.62, 0.45] });
      for (const [x, z] of [[-0.12, -0.28], [0.12, -0.28], [-0.12, 0.28], [0.12, 0.28]]) b.box(0.07, 0.4, 0.07, P.oakDark, { at: [x, 0, z] });
    });
    // rubble fallen in the street
    b.blob(0.9, P.rubble, { at: [3.2, 0, zf + 0.6], stretch: [1.6, 0.35, 0.7], detail: 0 });
  }
}
