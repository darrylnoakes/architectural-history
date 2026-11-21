import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, riverWall } from './shared';
import { sawtooth } from './08-victorian-mill';

/** A curtain wall on a face w wide: glass bands, coloured spandrel panels and aluminium mullions. */
function curtain(b: Builder, w: number, floors: number, fh: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x', spandrel: number) {
  const rot = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 }[facing];
  b.group({ at, rotY: rot }, () => {
    for (let f = 0; f < floors; f++) {
      const y = f * fh;
      b.box(w, fh * 0.34, 0.08, spandrel, { at: [0, y, 0.04], jitter: false });
      b.box(w, fh * 0.66, 0.06, P.glassDark, { at: [0, y + fh * 0.34, 0.03], mat: 'glass', jitter: false });
      b.box(w, 0.08, 0.14, P.aluminium, { at: [0, y + fh * 0.34, 0.07], jitter: false });
    }
    for (const x of spread(Math.round(w / 1.5), -w / 2, w / 2)) b.box(0.07, floors * fh, 0.16, P.aluminium, { at: [x - w / Math.round(w / 1.5) / 2, 0, 0.08], jitter: false });
    b.box(0.07, floors * fh, 0.16, P.aluminium, { at: [w / 2 - 0.035, 0, 0.08], jitter: false });
  });
}

export const sixtiesFactory: BuildingDef = {
  id: 'sixties-factory',
  name: 'Post-war factory',
  style: 'Post-war Modernist',
  date: 'c. 1965',
  summary:
    'After the war, light industry was rebuilt on a standard pattern: a steel-framed shed for the machines and a smart office block at the front for the management and the drawing office. ' +
    'The shed keeps the saw-tooth north-light roof of the Victorian weaving sheds, now in steel and asbestos-cement sheeting. ' +
    'The offices wear a curtain wall of glass and coloured panels hung on a frame. Goods now leave by lorry from loading bays, and the river has become the back of the site.',
  materials: ['steel frame', 'asbestos-cement sheeting', 'glass curtain wall', 'concrete', 'brick'],
  lookFor: [
    { label: 'Saw-tooth north-light roof', note: 'Steep glazed faces turned north light the factory floor evenly, as in the weaving sheds a century before.', at: [6, 8.6, 1.6] },
    { label: 'Curtain wall', note: 'A skin of glass and coloured panels hung on the front of the frame, carrying no weight but its own.', at: [-10, 4.2, 10.3] },
    { label: 'Loading bays', note: 'Roller-shutter doors under a canopy, at the height of a lorry bed.', at: [3.5, 4.6, 3.2] },
    { label: 'Steel flue', note: 'One slim steel chimney for an oil-fired boiler, in place of the tall brick chimneys of the steam age.', at: [15.2, 14, -7.2] },
  ],
  influences: ['continental-modernism'],
  build(b) {
    const brick = b.pick([P.brickBuff, P.brickYellow, tint(P.brickBuff, -0.05)]);
    const span = b.pick([P.cladBlue, P.cladYellow, P.cladRed, P.cladGreen]);
    const sheet = P.zinc;

    // ---- the production shed: brick dado, sheeted walls, saw-tooth roof
    const sx = 3.4;
    const sz = -4.8;
    const sw = 28.4;
    const sd = 12.4;
    const sh = 5.8;
    b.box(sw, 1.4, sd, brick, { at: [sx, 0, sz] });
    b.box(sw - 0.1, sh - 1.4, sd - 0.1, sheet, { at: [sx, 1.4, sz] });
    // corrugation lines on the cladding
    for (const x of spread(30, -sw / 2, sw / 2)) {
      b.box(0.08, sh - 1.4, 0.04, tint(sheet, -0.08), { at: [sx + x, 1.4, sz - sd / 2 - 0.05], jitter: false });
    }
    b.box(sw + 0.2, 0.4, sd + 0.2, P.cladGrey, { at: [sx, sh, sz] });
    sawtooth(b, sw, sd, 6, 2.2, [sx, sh + 0.4, sz], P.concrete, P.glassDark);
    b.sym((s) => {
      const p = sd / 6;
      for (let i = 0; i < 6; i++) b.extrude([[0, 0], [p - 0.15, 2.2], [p, 2.2], [p, 0]], 0.2, sheet, { at: [sx + s * (sw / 2 - 0.1), sh + 0.4, sz - sd / 2 + i * p], rotY: -Math.PI / 2 });
    });
    // loading bays on the front of the shed, under a cantilevered canopy
    const front = sz + sd / 2;
    const bays = [3.5, 8.5, 13.5];
    for (const x of bays) {
      b.panel(3.6, 4.0, P.cladGrey, { at: [x, 0.0, front], facing: '+z', depth: 0.08 });
      for (let k = 0; k < 10; k++) b.panel(3.6, 0.04, tint(P.cladGrey, -0.12), { at: [x, 0.3 + k * 0.38, front], facing: '+z', depth: 0.1 });
      b.panel(3.9, 0.25, P.cladYellow, { at: [x, 4.0, front], facing: '+z', depth: 0.1 });
    }
    b.box(14.8, 1.1, 2.0, P.concrete, { at: [8.5, 0, front + 1.0] }); // loading dock
    b.box(15.6, 0.3, 3.6, P.cladWhite, { at: [8.5, 4.6, front + 1.8] });
    // a lorry backed up to the dock
    b.group({ at: [13.5, 0, front + 5.5] }, () => {
      b.box(2.4, 2.8, 6.0, P.cladWhite, { at: [0, 1.1, -0.9] });
      b.box(2.3, 2.0, 1.8, P.cladRed, { at: [0, 0.6, 3.0] });
      b.box(2.1, 0.8, 0.06, P.glassDark, { at: [0, 1.6, 3.92], mat: 'glass' });
      for (const z of [-2.8, -1.6, 3.0]) b.sym((s) => b.log(0.45, 0.3, P.black, { at: [s * 1.05, 0, z], segs: 10 }));
    });
    b.box(16, 0.03, 7.4, P.tarmac, { at: [8.5, 0, front + 5.1], jitter: false });

    // ---- the office block: two storeys, curtain-walled, flat roof
    const ox = -10.6;
    const oz = 6.6;
    const ow = 13.0;
    const od = 7.2;
    const fh = 3.3;
    b.box(ow, fh * 2, od, brick, { at: [ox, 0, oz] });
    curtain(b, ow - 0.1, 2, fh, [ox, 0, oz + od / 2], '+z', span);
    curtain(b, od - 0.1, 2, fh, [ox - ow / 2, 0, oz], '-x', span);
    b.box(ow + 0.6, 0.55, od + 0.6, P.cladWhite, { at: [ox, fh * 2, oz] }); // roof fascia
    // entrance: glazed doors under a thin concrete canopy, and a name board
    b.box(3.2, 2.4, 0.1, P.glass, { at: [ox + 3, 0, oz + od / 2 + 0.1], mat: 'glass' });
    b.box(4.6, 0.18, 2.4, P.concreteWhite, { at: [ox + 3, 2.7, oz + od / 2 + 1.2] });
    b.sym((s) => b.cyl(0.07, 2.7, P.steel, { at: [ox + 3 + s * 2.1, 0, oz + od / 2 + 2.2], segs: 6 }));
    b.box(6.0, 0.6, 0.1, P.cladWhite, { at: [ox - 1.5, fh * 2 + 0.6, oz + od / 2 + 0.25] });
    for (let k = 0; k < 6; k++) b.box(0.5, 0.4, 0.06, span, { at: [ox - 3.6 + k * 0.85, fh * 2 + 0.7, oz + od / 2 + 0.32], jitter: false });
    // link to the shed
    b.box(3.0, fh, 3.0, brick, { at: [ox + 1, 0, oz - od / 2 - 1.0] });

    // ---- boiler house with a steel flue, and the old riverbank behind
    const bx = 15.2;
    const bz = -7.2;
    b.box(3.4, 3.2, 3.8, brick, { at: [bx - 0.6, 0, bz - 3.0] });
    b.cyl(0.4, 16.0, P.steel, { at: [bx, 0, bz], segs: 10 });
    b.cyl(0.5, 0.3, P.castIron, { at: [bx, 16.0, bz], segs: 10 });
    for (const y of [5, 10]) b.cyl(0.5, 0.15, P.castIron, { at: [bx, y, bz], segs: 10 });
    riverWall(b, -17.6, 17.6, P.concrete, { coping: P.concreteDark });
    for (const x of spread(12, -17.4, 17.4)) b.box(0.08, 1.8, 0.08, P.castIron, { at: [x, 0, BANK + 0.6] });
    b.box(35, 1.6, 0.03, P.cladGrey, { at: [0, 0.1, BANK + 0.6], jitter: false });
    b.log(0.35, 1.6, P.concreteDark, { at: [-4, WATER + 0.4, BANK - 0.6], axis: 'z', segs: 8 });

    // ---- front: a lawn and a car park by the lane
    b.box(13, 0.05, 1.4, P.grass, { at: [-10.6, 0, 10.7], jitter: false });
    b.collider(sw, sd, { at: [sx, 0, sz] });
    b.collider(ow, od, { at: [ox, 0, oz] });
    b.collider(15, 2, { at: [8.5, 0, front + 1.0] });
    b.collider(2.4, 8, { at: [13.5, 0, front + 5.5] });
  },
};
