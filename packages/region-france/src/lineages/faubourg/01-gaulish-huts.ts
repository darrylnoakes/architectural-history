import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { granary, heap, hurdles, patch, road, storagePit, thatchRoof } from './shared';

/**
 * One small Gaulish house: a rectangle of earth-fast oak posts with wattle-and-daub walls between
 * them, a steep thatched roof, a door in the long side. Built in its own frame: front (+z) is the
 * door side.
 */
function house(b: Builder, x: number, z: number, w: number, d: number, turn: number, thatch: number, o: { hip: boolean; porch: boolean }): void {
  const wallH = 1.7;
  const daub = b.pick([P.daub, tint(P.daub, -0.04), P.torchis]);
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    b.box(w, wallH, d, daub);
    b.box(w + 0.04, 0.25, d + 0.04, P.mud, { at: [0, 0, 0] }); // splashed foot of the wall
    // the posts showing in the wall face, every metre or so
    const nx = Math.max(2, Math.round(w / 1.1));
    for (let i = 0; i <= nx; i++) {
      const px = -w / 2 + (w * i) / nx;
      for (const s of [-1, 1]) b.box(0.14, wallH, 0.06, P.oakDark, { at: [px, 0, s * (d / 2 + 0.01)] });
    }
    // the door, off centre, and a small hatch window with a board shutter propped open
    const dx = -w * 0.18;
    b.panel(0.85, 1.55, P.oakDark, { at: [dx, 0, d / 2], facing: '+z', depth: 0.06 });
    b.panel(0.45, 0.35, P.windowDark, { at: [w * 0.25, 1.0, d / 2], facing: '+z', depth: 0.03 });
    b.beam([w * 0.25 - 0.22, 1.37, d / 2 + 0.05], [w * 0.25 + 0.22, 1.6, d / 2 + 0.35], 0.5, 0.04, P.oak);
    thatchRoof(b, w, d, 52, thatch, { at: [0, wallH, 0], hip: o.hip, ov: 0.5, wall: daub });
    if (o.porch) {
      // two posts carrying a little thatched hood over the door
      for (const s of [-1, 1]) b.cyl(0.08, 1.75, P.oak, { at: [dx + s * 0.75, 0, d / 2 + 1.1], segs: 5 });
      b.box(1.7, 0.12, 0.12, P.oak, { at: [dx, 1.75, d / 2 + 1.1] });
      b.beam([dx, 1.82, d / 2 + 1.25], [dx, 2.45, d / 2 + 0.2], 1.9, 0.25, thatch);
    }
  });
}

/** A pig of the long-legged, bristly Gaulish kind, or a sheep. */
function beast(b: Builder, x: number, z: number, rotY: number, coat: number, pig: boolean): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    const l = pig ? 0.3 : 0.24;
    for (const [lx, lz] of [[l, 0.12], [l, -0.12], [-l, 0.12], [-l, -0.12]] as const) b.box(0.07, 0.36, 0.07, P.timberBlack, { at: [lx, 0, lz] });
    b.blob(0.32, coat, { at: [0, 0.56, 0], stretch: pig ? [1.6, 0.85, 0.8] : [1.4, 0.9, 0.95], detail: 0 });
    b.box(pig ? 0.25 : 0.17, 0.2, 0.17, tint(coat, -0.25), { at: [pig ? 0.6 : 0.5, pig ? 0.45 : 0.58, 0] });
  });
}

export const gaulishHuts: BuildingDef = {
  id: 'gaulish-huts',
  name: 'Houses at the edge of the oppidum',
  style: 'Iron Age Gaulish vernacular',
  date: 'c. 300 BC',
  summary:
    'Outside the rampart, along the track to the gate, the poorest families of the tribe lived in small rectangular houses of oak posts with walls of wattle and daub under steep thatch. ' +
    'Archaeologists find them as patterns of post-holes, with the storage pits and granaries that went with them: grain was the wealth of these households, kept in pits sealed with clay or in little stores raised on posts out of reach of rats and damp. ' +
    'Each house was one room round a hearth, its smoke left to find its way out through the thatch; pigs, the Gauls’ favourite meat, were kept in pens beside it.',
  materials: ['oak posts', 'wattle and daub', 'straw thatch', 'clay'],
  lookFor: [
    { label: 'Earth-fast posts', note: 'The walls hang on oak posts sunk straight into the ground; their rotting feet are why such houses lasted only a generation.', at: [-8.0, 1.0, 3.35] },
    { label: 'Wattle and daub', note: 'Between the posts, hazel rods are woven into panels and plastered with clay, dung and straw.', at: [1.4, 1.2, -1.5] },
    { label: 'Steep thatch', note: 'Straw laid at about fifty degrees sheds the rain quickly; there is no chimney, the smoke seeps out through it.', at: [8.6, 3.3, 1.8] },
    { label: 'Granary on posts', note: 'A small store raised on four posts keeps the seed corn dry and away from vermin.', at: [10.4, 2.0, -4.6] },
    { label: 'Storage pit', note: 'A pit dug into the chalk and sealed with clay keeps grain for months without air.', at: [3.6, 0.4, 4.6] },
  ],
  build(b) {
    const thatch = b.pick([P.thatchOld, P.thatch, tint(P.thatchOld, 0.05)]);
    const jx = () => b.range(-0.6, 0.6);
    patch(b, 25.6, 15.6, tint(P.earth, 0.05), [0, 0]);
    // the track along the front, rutted, and a trodden path into the yard
    road(b, tint(P.earth, -0.06));
    patch(b, 2.2, 7, tint(P.earth, -0.03), [-1.8 + b.range(-0.5, 0.5), 2.0], 0.045);

    house(b, -8.0 + jx(), 1.0, 6.2, 4.6, b.range(-0.08, 0.08), thatch, { hip: true, porch: b.chance(0.6) });
    house(b, 1.4 + jx(), -3.8, 5.2, 4.2, b.range(-0.3, -0.1), tint(thatch, 0.03), { hip: b.chance(0.5), porch: false });
    house(b, 8.6, 1.6 + b.range(-0.4, 0.3), 4.4, 3.8, Math.PI / 2 + b.range(-0.12, 0.12), tint(thatch, -0.03), { hip: false, porch: b.chance(0.5) });

    granary(b, 10.4, -4.8, 2.0, 1.8, tint(thatch, 0.04), { rotY: b.range(-0.2, 0.2) });
    if (b.chance(0.5)) granary(b, 6.0, -6.2, 1.6, 1.6, tint(thatch, -0.02), { rotY: b.range(-0.3, 0.3) });
    storagePit(b, 3.6, 4.6);
    storagePit(b, 5.0, 5.0, 0.5);
    if (b.chance(0.6)) storagePit(b, -3.8, -2.0, 0.55);

    // the pen at the back, with pigs and a sheep
    const pz = -5.2;
    hurdles(b, [-12.4, pz - 2.4], [-5.2, pz - 2.4]);
    hurdles(b, [-12.4, pz - 2.4], [-12.4, pz + 1.6]);
    hurdles(b, [-12.4, pz + 1.6], [-8.0, pz + 1.6]);
    hurdles(b, [-5.2, pz - 2.4], [-5.2, pz + 0.2]);
    patch(b, 7.0, 3.8, P.mud, [-8.8, pz - 0.4], 0.05);
    beast(b, -10.6, pz - 0.6, 0.4, P.brickDark, true);
    beast(b, -8.2, pz - 1.4, -0.9, tint(P.mud, -0.05), true);
    beast(b, -6.6, pz + 0.2, 2.6, P.limewash, false);
    // a wattle fence along part of the track, firewood, a dung heap, a quern by a door
    hurdles(b, [-12.6, 5.4], [-4.2, 5.4], { h: 0.9 });
    hurdles(b, [11.0, 5.4], [12.6, 5.4], { h: 0.9 });
    heap(b, 11.2, -1.6, 0.9, P.mud);
    for (let i = 0; i < 6; i++) b.log(0.09, 1.8, P.oak, { at: [-3.3, i < 4 ? 0 : 0.17, -6.2 + (i % 4) * 0.2 + (i >= 4 ? 0.1 : 0)], axis: 'x', segs: 5 });
    b.cyl(0.32, 0.18, P.granite, { at: [-6.4, 0, 3.9], segs: 8 });
    b.cyl(0.3, 0.12, P.granite, { at: [-6.4, 0.18, 3.9], segs: 8 });

    b.collider(6.8, 5.2, { at: [-8.0, 0, 1.0] });
    b.collider(5.6, 4.6, { at: [1.4, 0, -3.8] });
    b.collider(4.2, 4.8, { at: [8.6, 0, 1.6] });
    b.collider(2.2, 2.0, { at: [10.4, 0, -4.8] });
  },
};
