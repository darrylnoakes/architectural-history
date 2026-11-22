import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdles, patch, thatchRoof, vegBed } from './shared';

const ZF = 5.4; // street wall of the houses
const WALL = 2.1;

/**
 * One single-room house: a frame of posts on sill stones filled with cob, a steep thatched roof with
 * a smoke louvre on the ridge (no chimney yet), a door and a shuttered window to the street.
 */
function cottage(b: Builder, x: number, w: number, d: number, thatch: number, o: { doorLeft: boolean; louvre: boolean }): void {
  const cob = b.pick([P.torchis, P.cob, tint(P.torchis, -0.04), mix(P.torchis, P.limewash, 0.5)]);
  const zc = ZF - d / 2;
  b.box(w + 0.1, 0.3, d + 0.1, P.rubble, { at: [x, 0, zc] }); // sill stones
  b.box(w, WALL - 0.3, d, cob, { at: [x, 0.3, zc] });
  // the frame: corner posts, a middle post each side, a wall plate
  for (const sz of [-1, 1]) {
    const z = zc + (sz * d) / 2;
    const f = sz > 0 ? '+z' : '-z';
    b.frame(w, WALL - 0.3, P.oakDark, { at: [x, 0.3, z], facing: f, studs: 1, rails: 0, beam: 0.17, depth: 0.05 });
  }
  for (const sx of [-1, 1]) b.frame(d, WALL - 0.3, P.oakDark, { at: [x + (sx * w) / 2, 0.3, zc], facing: sx > 0 ? '+x' : '-x', studs: 0, rails: 0, beam: 0.17, depth: 0.05 });
  // door and window on the street, a back door to the garden
  const dx = o.doorLeft ? -w * 0.22 : w * 0.22;
  b.panel(0.85, 1.75, P.oakDark, { at: [x + dx, 0.3, ZF], facing: '+z', depth: 0.06 });
  const wx = x - dx * 1.1;
  b.panel(0.55, 0.5, P.windowDark, { at: [wx, 1.2, ZF], facing: '+z', depth: 0.03 });
  b.panel(0.6, 0.55, P.oak, { at: [wx + 0.6, 1.17, ZF], facing: '+z', depth: 0.05 }); // board shutter, open
  b.panel(0.8, 1.7, P.oak, { at: [x - dx, 0.3, ZF - d], facing: '-z', depth: 0.06 });
  const h = thatchRoof(b, w, d, 52, thatch, { at: [x, WALL, zc], hip: false, ov: 0.5, wall: cob });
  if (o.louvre) {
    // a little thatched hood on the ridge where the smoke of the hearth gets out
    const top = WALL + h + 0.3;
    b.box(0.7, 0.45, 0.6, P.oakDark, { at: [x + w * 0.15, top - 0.1, zc] });
    b.gable(0.9, 0.9, 0.35, tint(thatch, -0.06), { at: [x + w * 0.15, top + 0.35, zc], thick: 0.12, ridge: 'z' });
  }
}

export const oneRoomHouses: BuildingDef = {
  id: 'one-room-houses',
  name: 'Cottages outside the gate',
  style: 'Romanesque-period vernacular',
  date: 'c. 1150',
  summary:
    'As the town prospered in the twelfth century, people who could not afford a house within the walls built along the roads outside the gates: labourers, carters, gardeners, tanners and the poor. ' +
    'Their houses were single rooms of timber and cob under thatch, with a hearth on the floor and a hole or a little hood in the ridge for the smoke; the chimney had not yet reached such houses. ' +
    'Each stood at the front of a long strip of garden where the family grew vegetables and kept a pig or hens. Such faubourgs (from the old French forsbourg, “outside the town”) were the first thing burned when an enemy came, and they were rebuilt each time.',
  materials: ['oak frame on sill stones', 'cob (torchis)', 'straw thatch', 'wattle fences'],
  lookFor: [
    { label: 'Smoke louvre', note: 'A small hooded opening on the ridge lets out the smoke of the open hearth inside; there is no chimney.', at: [-9.1, 5.5, 3.2] },
    { label: 'Cob on a timber frame', note: 'Oak posts and plates make the frame, filled with cob: clay, chalk and straw rammed between the timbers.', at: [-2.6, 1.3, ZF + 0.1] },
    { label: 'Sill stones', note: 'A course of rough stones under the frame keeps the timbers off the wet ground: a step up from the earth-fast posts of earlier houses.', at: [4.2, 0.2, ZF + 0.2] },
    { label: 'Garden strip', note: 'Behind each house a long garden of vegetable beds and a few fruit trees fed the household.', at: [3.8, 0.5, -4.6] },
    { label: 'Board shutter', note: 'The small window has no glass, only a wooden shutter opened by day.', at: [-9.0, 1.5, ZF + 0.2] },
  ],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, tint(P.thatch, -0.05)]);
    patch(b, 25.6, 15.6, mix(P.grass, P.earth, 0.3), [0, 0]);
    patch(b, 25.6, 2.2, tint(P.earth, -0.04), [0, 6.8], 0.05); // the road

    // three or four cottages along the road, of slightly different widths
    const four = b.chance(0.55);
    const plan: [number, number][] = four
      ? [[-9.6, 5.6], [-3.4, 5.2], [2.8, 5.6], [9.4, 5.0]]
      : [[-9.2, 6.2], [-2.6, 5.6], [5.4, 6.4]];
    plan.forEach(([x, w], i) => {
      cottage(b, x, w, 4.4, tint(thatch, b.range(-0.04, 0.04)), { doorLeft: (i + (four ? 1 : 0)) % 2 === 0, louvre: i !== 1 || four });
      b.collider(w + 0.4, 4.8, { at: [x, 0, ZF - 2.2] });
    });
    if (!four) {
      // a lean-to shed for a cart at the right end
      for (const [px, pz] of [[10.2, 5.0], [12.4, 5.0], [10.2, 2.6], [12.4, 2.6]] as const) b.box(0.15, 2.0, 0.15, P.oak, { at: [px, 0, pz] });
      b.shed(2.8, 3.2, 0.7, thatch, { at: [11.3, 2.0, 3.8], high: '-z' });
      b.box(1.3, 0.5, 2.2, P.oak, { at: [11.3, 0.5, 3.8] });
      b.log(0.45, 0.08, P.oakDark, { at: [10.6, 0.05, 3.8], axis: 'x', segs: 10 });
    }

    // the gardens behind, divided by wattle fences, each with beds, a fruit tree, a hen house
    const xs = four ? [-12.6, -6.4, -0.6, 6.0, 12.6] : [-12.6, -5.8, 1.4, 12.6];
    for (let k = 0; k < xs.length; k++) hurdles(b, [xs[k], 0.4], [xs[k], -7.6], { h: 0.95 });
    hurdles(b, [-12.6, -7.6], [12.6, -7.6], { h: 0.95 });
    for (let k = 0; k < xs.length - 1; k++) {
      const x0 = xs[k] + 0.4;
      const x1 = xs[k + 1] - 0.4;
      const w = x1 - x0;
      vegBed(b, w * 0.55, 3.6, [x0 + w * 0.3, -5.2], { rows: 5 });
      b.tree(b.range(3.5, 4.6), { kind: 'round', at: [x0 + w * 0.8, 0, -5.6 + b.range(-0.6, 0.6)], color: mix(P.leaf, P.leafDark, b.rand()) });
      if (k % 2 === 1) {
        b.box(1.0, 0.8, 0.8, P.wattle, { at: [x0 + w * 0.78, 0, -1.6] });
        b.shed(1.2, 1.0, 0.35, thatch, { at: [x0 + w * 0.78, 0.8, -1.6], high: '-z' });
      }
    }
  },
};
