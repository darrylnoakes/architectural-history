import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, coppiRoof, flatRing, lin, roofRise, waterwheel } from './shared';

/**
 * The circular throwing machine (filatoio alla bolognese), seen in its essentials: a central upright
 * shaft turning an inner cage of staves, inside a fixed outer frame carrying tiers of spindles, each
 * tier with its reels above, where the twisted silk was wound.
 */
function throwingMachine(b: Builder, x: number, z: number, r: number, h: number, tiers: number) {
  const frame = P.oak;
  const cage = tint(P.oak, 0.12);
  // the outer fixed frame: posts round the circle, rings at each tier
  const posts = 12;
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2;
    b.box(0.14, h, 0.14, frame, { at: [x + Math.cos(a) * r, 0, z + Math.sin(a) * r] });
  }
  const th = (h - 0.6) / tiers;
  for (let k = 0; k < tiers; k++) {
    const y = 0.4 + k * th;
    flatRing(b, r + 0.12, r - 0.25, 0.12, frame, [x, y, z], 16); // spindle rail
    // spindles standing on the rail, each with its bobbin of silk
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = ((i + (k % 2) * 0.5) / n) * Math.PI * 2;
      b.cyl(0.05, 0.35, P.cream, { at: [x + Math.cos(a) * (r - 0.06), y + 0.12, z + Math.sin(a) * (r - 0.06)], segs: 3, jitter: false });
    }
    // the reels (aspi) on the tier above the spindles, drawn as a polygonal drum
    b.group({ at: [x, y + th * 0.55, z] }, () => {
      b.lathe(
        [
          [r + 0.25, 0],
          [r + 0.35, 0.18],
          [r + 0.35, 0.42],
          [r + 0.25, 0.6],
        ],
        tint(P.cream, -0.04),
        { segs: 16 },
      );
    });
    flatRing(b, r + 0.42, r + 0.28, 0.08, frame, [x, y + th * 0.55 + 0.27, z], 12);
  }
  // the inner turning cage and its central shaft
  b.cyl(0.18, h + 0.6, P.oakDark, { at: [x, 0, z], segs: 8 });
  const staves = 8;
  for (let i = 0; i < staves; i++) {
    const a = (i / staves) * Math.PI * 2 + 0.2;
    b.box(0.1, h - 0.4, 0.1, cage, { at: [x + Math.cos(a) * (r - 0.7), 0.2, z + Math.sin(a) * (r - 0.7)] });
  }
  for (const k of [0, tiers / 2, tiers]) flatRing(b, r - 0.6, r - 0.8, 0.08, cage, [x, 0.3 + (k * (h - 0.6)) / tiers, z], 12);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    b.beam([x - Math.cos(a) * (r - 0.7), h - 0.3, z - Math.sin(a) * (r - 0.7)], [x + Math.cos(a) * (r - 0.7), h - 0.3, z + Math.sin(a) * (r - 0.7)], 0.1, 0.1, cage);
  }
}

export const silkMill: BuildingDef = {
  id: 'silk-mill',
  name: 'Water-powered silk mill (filatoio)',
  style: 'Renaissance',
  date: 'c. 1550',
  summary:
    'In the sixteenth century silk was overtaking wool as the luxury trade, and the most advanced machine in Europe was the Bolognese silk-throwing mill. ' +
    'A waterwheel in the basement turned a great round wooden machine, several storeys high, whose turning inner cage drove hundreds of spindles at once, twisting raw silk filaments into strong thread and winding it onto reels. ' +
    'One mill did the work of hundreds of hand spinners, and Bologna guarded the design as a state secret; when Thomas Lombe built England’s first successful silk-throwing mill at Derby, finished about 1721, it was copied from machines his half-brother John had studied in Piedmont. ' +
    'The building itself is a plain, tall, plastered block with rows of windows, a portico on the street and a big coppi roof, here shown with one corner cut away to reveal the machine.',
  materials: ['brick', 'lime plaster', 'pietra serena', 'coppi roof tiles', 'oak and elm machinery'],
  modelledOn: 'The water-powered circular silk-throwing mill (filatoio) perfected at Bologna; the best-known early picture of such a machine is in Vittorio Zonca’s Novo teatro di machine et edificii (Padua, 1607). Simplified',
  lookFor: [
    { label: 'Circular throwing machine', note: 'A turning wooden cage inside a fixed frame drives tier upon tier of spindles; seen here through the cut-away corner of the building.', at: [11.5, 7.6, -3.8] },
    { label: 'Spindles and reels', note: 'Each spindle twisted a thread of silk, which was drawn up and wound onto the reels (aspi) on the tier above.', at: [12.5, 3.6, -1.6] },
    { label: 'Waterwheel in the wheel-pit', note: 'Below the building a wheel in a stone channel turned the upright shaft of the machine through wooden gears.', at: [8.5, 2.4, -14.0] },
    { label: 'Street portico', note: 'An arcade along the front, as on the streets of Bologna, gave shelter to the door and the carts unloading raw silk.', at: [-4, 3.6, 3.6] },
    { label: 'Rows of windows', note: 'Many windows on every floor gave light for the workers mending broken threads, most of them women and children.', at: [-6, 9.4, 0.1] },
  ],
  influences: [],
  build(b) {
    const plaster = b.pick([P.intonacoCream, P.intonacoRose, tint(P.intonacoOchre, 0.08)]);
    const stone = P.pietraSerena;
    const brick = P.cotto;
    const timber = P.oak;
    const W = 26;
    const D = 9.4;
    const x0 = -1; // centre of the block
    const z0 = -4.9;
    const fl = 3.4;
    const n = 4;
    const H = fl * n;
    const cutX = x0 + W / 2 - 6.6; // the end bay that is cut away

    b.box(36, 0.15 - WATER + 0.6, 0.8, tint(brick, -0.05), { at: [0, WATER - 0.6, BANK + 0.2] });

    // ---- the closed part of the block
    const cw = cutX - (x0 - W / 2);
    const cx = (cutX + x0 - W / 2) / 2;
    b.box(cw, H, D, plaster, { at: [cx, 0, z0] });
    b.box(cw + 0.04, 0.6, D + 0.04, stone, { at: [cx, 0, z0] }); // plinth
    for (let k = 1; k < n; k++) b.box(cw + 0.06, 0.14, D + 0.06, tint(plaster, 0.06), { at: [cx, k * fl, z0] });
    // the cut-away bay: back wall, front wall, floors stopping short, and the machine
    const bw = x0 + W / 2 - cutX;
    const bx = (cutX + x0 + W / 2) / 2;
    b.box(bw, H, 0.5, plaster, { at: [bx, 0, z0 - D / 2 + 0.25] });
    b.box(bw, 1.0, 0.5, tint(plaster, -0.08), { at: [bx, 0, z0 + D / 2 - 0.25] }); // the cut line of the front wall
    b.box(0.5, 1.0, D, tint(plaster, -0.08), { at: [x0 + W / 2 - 0.25, 0, z0] }); // the cut line of the end wall
    for (const zz of [z0 - D / 2 + 0.25, z0 + D / 2 - 0.25]) b.box(0.52, H, 0.52, tint(plaster, -0.12), { at: [x0 + W / 2 - 0.25, 0, zz] });
    b.box(bw, 0.3, D, P.pine, { at: [bx, 3 * fl, z0] }); // top floor
    for (const k of [1, 2]) {
      // floors with a round well cut for the machine: drawn as two strips either side
      b.box(bw, 0.25, 1.3, P.pine, { at: [bx, k * fl, z0 - D / 2 + 1.1] });
      b.box(bw, 0.25, 1.3, P.pine, { at: [bx, k * fl, z0 + D / 2 - 1.1] });
    }
    b.box(bw, 0.12, D, tint(P.paving, -0.05), { at: [bx, 0, z0] });
    throwingMachine(b, bx, z0, 2.9, 3 * fl - 0.4, 4);
    // the top floor: reeling and storage, a stair, bales of silk
    for (let i = 0; i < 3; i++) b.box(0.9, 0.7, 0.9, P.cream, { at: [bx - 1.5 + i * 1.1, 3 * fl + 0.3, z0 + 2.0] });
    b.stairs(1.0, fl, 3.0, 9, timber, { at: [cutX + 0.8, 3 * fl - fl, z0 - 2.6], rotY: -Math.PI / 2 });
    // roof over the whole block, its end exposed as a section
    coppiRoof(b, W, D, [x0, H, z0], { wall: plaster, overhang: 0.6 });

    // ---- windows on every floor, front and back
    for (let k = 0; k < n; k++) {
      const y = k * fl + (k === 0 ? 1.2 : 0.9);
      const wh = k === 0 ? 1.4 : 1.7;
      for (const x of lin(8, x0 - W / 2 + 1.4, x0 + W / 2 - 1.4)) {
        if (k === 0 && x > -11 && x < 7) continue; // the portico covers the ground floor here
        if (x < cutX) b.window(0.95, wh, { at: [x, y, z0 + D / 2], facing: '+z', frame: stone, glass: P.windowDark, bars: [2, 1] });
        b.window(0.95, wh, { at: [x, y, z0 - D / 2], facing: '-z', frame: stone, glass: P.windowDark });
      }
    }
    for (let k = 0; k < n; k++) b.window(0.95, 1.7, { at: [x0 - W / 2, k * fl + 0.9, z0 - 2], facing: '-x', frame: stone, glass: P.windowDark, bars: [2, 3] });

    // ---- the street portico: round arches on stone columns, a lean-to roof
    const pz = z0 + D / 2;
    const PD = 3.0;
    const pw = 18;
    const px = -2;
    b.archWall(pw, 4.4, 0.5, plaster, { at: [px, 0, pz + PD], facing: '+z', openings: 6, openW: 2.3, openH: 3.7 });
    for (const x of lin(7, px - pw / 2, px + pw / 2)) b.box(0.55, 3.0, 0.6, stone, { at: [x, 0, pz + PD] });
    b.box(pw, 0.3, PD, tint(plaster, -0.05), { at: [px, 4.4, pz + PD / 2] });
    b.box(pw, 0.12, PD, P.paving, { at: [px, 0, pz + PD / 2] });
    b.panel(2.2, 3.0, P.oakDark, { at: [px, 0, pz], facing: '+z', shape: 'round' });
    b.panel(2.6, 3.3, stone, { at: [px, 0, pz - 0.02], facing: '+z', shape: 'round', depth: 0.04 });
    for (const x of [px - 5.4, px + 5.4]) b.panel(1.2, 2.3, P.oakDark, { at: [x, 0, pz], facing: '+z' });
    for (const x of [px - 7.8, px - 2.6, px + 2.6, px + 7.8]) b.window(0.9, 1.2, { at: [x, 1.4, pz], facing: '+z', frame: stone, glass: P.windowDark, bars: [2, 2] });

    // ---- the wheel-pit on the river side: two stone walls, the wheel between, a tiled hood over it
    const wx = bx - 2.0;
    const wz = BANK - 2.0;
    b.sym((s) => b.box(0.7, 3.6 - WATER + 0.6, 4.6, brick, { at: [wx + s * 1.3, WATER - 0.6, BANK - 1.0] }));
    b.shed(3.4, 4.0, 0.7, P.coppi, { at: [wx, 3.6, BANK - 0.7], high: '+z' });
    waterwheel(b, { at: [wx, WATER - 0.5 + 2.7, wz], r: 2.7, width: 1.5, paddles: 18, spokes: 8, spin: b.rand(), axle: 4.5 });
    // the shaft runs back into the building under an arched opening
    b.panel(1.6, 1.8, P.timberBlack, { at: [wx, 0.3, z0 - D / 2], facing: '-z', shape: 'round' });
    // a canal sluice gate in the pit wall upstream
    b.box(0.1, 1.6, 1.6, P.oakDark, { at: [wx - 1.7, WATER - 0.2, wz] });

    // ---- the street yard: a wall with a gate, mulberry trees for the silkworms, bales of raw silk
    b.box(18.2, 2.6, 0.5, plaster, { at: [-7.9, 0, 10.4] });
    b.box(18.4, 0.18, 0.7, P.coppi, { at: [-7.9, 2.6, 10.4] });
    b.box(11.7, 2.6, 0.5, plaster, { at: [11.65, 0, 10.4] });
    b.box(11.9, 0.18, 0.7, P.coppi, { at: [11.65, 2.6, 10.4] });
    b.sym((s) => b.box(0.7, 3.2, 0.7, stone, { at: [3.5 + s * 2.3, 0, 10.4] }));
    for (const x of [-14, -6.5]) b.tree(5, { at: [x, 0, 7.2], kind: 'round', color: P.leafDark });
    for (let i = 0; i < 4; i++) b.box(0.8, 0.6, 0.8, P.cream, { at: [7 + (i % 2) * 0.9, Math.floor(i / 2) * 0.6, 4.5] });
    b.tree(9.5, { at: [16.5, 0, 6], kind: 'cypress' });

    b.collider(W, D, { at: [x0, 0, z0] });
    b.collider(pw, 0.6, { at: [px, 0, pz + PD] });
  },
};
