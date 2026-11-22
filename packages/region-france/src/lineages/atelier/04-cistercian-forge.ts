import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, BED, WATER, buttress, heap, lin, logPile, rise, riverWall, slit, tiltHammer, water, waterwheel } from './shared';

export const cistercianForge: BuildingDef = {
  id: 'cistercian-forge',
  name: 'Cistercian forge',
  style: 'Cistercian Romanesque',
  date: 'late twelfth century',
  summary:
    'The white monks of Cîteaux lived by the work of their own hands and their lay brothers’, and they were the best water engineers of their age. ' +
    'Wherever their abbeys owned iron ore and woodland they built forges, and this one, on land given by the town, is a long, plain, beautifully built hall of squared stone with buttresses, round-headed windows and a steep roof of flat tiles. ' +
    'Inside, under vaults, a wheel driven by the river turns a shaft with cams that lift a heavy hammer, which falls again and again on blooms of iron to drive out the slag: muscle work done by water. ' +
    'Water-powered hammers are recorded in France from about the late twelfth century; how many forges had them so early, and how far the monks led the way, is still debated. Select the forge to see inside.',
  materials: ['squared limestone', 'flat clay tiles', 'oak machinery', 'iron'],
  modelledOn: 'The forge of Fontenay Abbey (Côte-d’Or), built at the end of the twelfth century beside the stream that the monks diverted to drive it. Taken from it: the long buttressed stone range, the plain round-headed windows and the wheel-driven hammer. Shorter than the original (about 53 m), and the layout inside is generic',
  lookFor: [
    { label: 'Buttresses', note: 'Stone piers against the walls take the outward push of the vaults inside, one at each bay.', at: [-10.0, 3.2, -0.2] },
    { label: 'Waterwheel', note: 'The wheel in its stone pit turns the long shaft that runs through the wall to the hammer.', at: [9.9, 3.2, -12.6] },
    { label: 'Tilt hammer', note: 'Cams on the shaft press down the tail of the oak helve, lifting the iron head, which then drops onto the anvil.', at: [6.5, 2.4, -4.5] },
    { label: 'Pointed transverse arches', note: 'Stone arches across the hall carry the vaults: monks’ engineering built to last, and to keep fire from the roof.', at: [4.2, 5.2, -5.5] },
    { label: 'Hearth and bellows', note: 'Iron was reheated in a charcoal hearth blown by bellows, under a stone hood and flue.', at: [2.6, 2.4, -8.6] },
  ],
  influences: ['cistercians'],
  build(b) {
    const stone = b.pick([P.pierreBlonde, P.limestone, tint(P.pierreBlonde, -0.03)]);
    const dress = tint(stone, 0.06);
    const tile = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.04)]);
    const x0 = -2;
    const W = 28;
    const D = 9;
    const z0 = -5.5;
    const H = 5.6;
    const front = z0 + D / 2;
    const back = z0 - D / 2;
    const cutX = 4; // the two east bays are opened in the cut-away
    const bays = 7;
    const bay = W / bays;

    b.box(35, 0.04, 21.6, tint(P.grassDry, -0.02), { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tint(stone, -0.08), { coping: dress, top: 0.3 });

    // ---- the long hall: the closed part
    const cw = cutX - (x0 - W / 2);
    const cx = (cutX + x0 - W / 2) / 2;
    b.box(cw, H, D, stone, { at: [cx, 0, z0] });
    b.box(cw + 0.08, 0.5, D + 0.08, tint(stone, -0.05), { at: [cx, 0, z0] });
    // back wall of the cut part (always whole) and its plinth
    const ow = x0 + W / 2 - cutX;
    const ox = (cutX + x0 + W / 2) / 2;
    b.box(ow, H, 0.9, stone, { at: [ox, 0, back + 0.45] });
    b.box(ow + 0.08, 0.5, 0.98, tint(stone, -0.05), { at: [ox, 0, back + 0.45] });

    // buttresses at every bay, front and back, and clasping the corners
    for (let i = 0; i <= bays; i++) {
      const x = x0 - W / 2 + i * bay;
      const xx = i === 0 ? x + 0.45 : i === bays ? x - 0.45 : x;
      if (!(b.cutaway && x > cutX + 0.5)) buttress(b, [xx, 0, front], H - 0.4, '+z', dress, 0.9, 1.0);
      buttress(b, [xx, 0, back], H - 0.4, '-z', dress, 0.9, 1.0);
    }
    b.sym((s) => buttress(b, [x0 + s * (W / 2), 0, z0], H - 0.4, s > 0 ? '+x' : '-x', dress, 0.9, 1.0));

    // windows: one round-headed light per bay, high up; a door in the front
    for (let i = 0; i < bays; i++) {
      const x = x0 - W / 2 + (i + 0.5) * bay;
      if (x < cutX) slit(b, 0.8, 1.7, [x, 2.6, front], '+z', dress);
      slit(b, 0.8, 1.7, [x, 2.6, back], '-z', dress);
    }
    b.panel(1.8, 2.8, P.oakDark, { at: [-9.5, 0.3, front], facing: '+z', shape: 'round' });
    b.panel(2.3, 3.1, dress, { at: [-9.5, 0.3, front - 0.02], facing: '+z', shape: 'round', depth: 0.04 });
    b.stairs(2.4, 0.3, 0.8, 2, dress, { at: [-9.5, 0, front + 0.4] });
    slit(b, 0.8, 1.7, [x0 - W / 2, 2.6, z0], '-x', dress);
    b.panel(2.6, 3.2, P.oakDark, { at: [-3.5, 0, back], facing: '-z', shape: 'round' }); // the river door for ore and charcoal

    // the roof of flat tiles: over the whole hall, or only the closed part in the cut-away
    const rr = rise(D, 45);
    if (b.cutaway) {
      b.gable(cw, D, rr, tile, { at: [cx, H, z0], overhang: 0.4, wall: stone, thick: 0.18 });
    } else {
      b.gable(W, D, rr, tile, { at: [x0, H, z0], overhang: 0.4, wall: stone, thick: 0.18 });
    }

    // ---- the cut part: front and end walls whole, or cut down to show the forge inside
    if (b.cutaway) {
      b.box(ow, 1.2, 0.9, tint(stone, -0.06), { at: [ox, 0, front - 0.45] });
      b.box(0.9, 1.2, D, tint(stone, -0.06), { at: [x0 + W / 2 - 0.45, 0, z0] });
      b.box(0.9, H, 0.9, stone, { at: [x0 + W / 2 - 0.45, 0, back + 0.45] });
      // the gable wall of the closed part, standing as the section
      b.extrude(
        [
          [-D / 2, 0],
          [D / 2, 0],
          [0, rr],
        ],
        0.6,
        stone,
        { at: [cutX + 0.3, H, z0], rot: [0, Math.PI / 2, 0] },
      );
    } else {
      b.box(ow, H, 0.9, stone, { at: [ox, 0, front - 0.45] });
      b.box(0.9, H, D, stone, { at: [x0 + W / 2 - 0.45, 0, z0] });
      b.box(ow + 0.08, 0.5, D + 0.08, tint(stone, -0.05), { at: [ox, 0, z0] });
      for (let i = 0; i < bays; i++) {
        const x = x0 - W / 2 + (i + 0.5) * bay;
        if (x > cutX) slit(b, 0.8, 1.7, [x, 2.6, front], '+z', dress);
      }
      for (let i = bays - 2; i <= bays; i++) {
        const x = x0 - W / 2 + i * bay;
        buttress(b, [i === bays ? x - 0.45 : x, 0, front], H - 0.4, '+z', dress, 0.9, 1.0);
      }
    }
    // inside the opened bays: the floor, the transverse arches that carry the vaults
    b.box(ow - 0.9, 0.05, D - 1.8, tint(P.earth, -0.06), { at: [ox - 0.45, 0, z0], jitter: false });
    for (const x of [cutX + 0.3, cutX + bay]) {
      b.archWall(D - 1.8, H + 0.8, 0.6, dress, { at: [x, 0, z0], facing: '+x', openings: 1, openW: D - 3.0, openH: H + 0.3, shape: 'pointed' });
    }

    // the forge: the hearth under its hood and flue against the back wall, with bellows
    b.box(2.2, 0.9, 1.8, tint(stone, -0.08), { at: [2.6, 0, back + 1.8] });
    b.box(0.9, 0.1, 0.9, P.timberBlack, { at: [2.6, 0.9, back + 1.9], jitter: false });
    b.box(0.5, 0.06, 0.5, 0xd8762f, { at: [2.6, 0.97, back + 1.9], jitter: false });
    b.cyl(1.3, 1.5, dress, { at: [2.6, 2.4, back + 1.6], rTop: 0.5, segs: 4, rotY: Math.PI / 4 });
    b.box(0.9, H + rr / 2 - 2.6, 0.9, dress, { at: [2.6, 3.9, back + 1.6] });
    b.box(1.1, 0.3, 1.1, tint(dress, -0.08), { at: [2.6, H + rr / 2 + 1.0, back + 1.6] });
    b.blob(0.45, 0x6b4a32, { at: [4.0, 1.1, back + 1.6], stretch: [1.2, 0.5, 0.9], detail: 0 });
    b.beam([4.6, 1.2, back + 1.6], [5.4, 1.9, back + 1.6], 0.06, 0.06, P.oak);

    // the hammer, its cam shaft running out through the back wall to the wheel
    const wx = 9.9;
    tiltHammer(b, [6.5, 0, -4.5], 1, -11.8);
    b.panel(1.0, 1.0, P.timberBlack, { at: [wx, 0.1, back - 0.02], facing: '-z', shape: 'round' });
    // blooms and bars of iron by the anvil
    for (let i = 0; i < 5; i++) b.box(1.2, 0.08, 0.08, P.iron, { at: [5.2, 0.05 + i * 0.09, -2.4 + (i % 2) * 0.1], jitter: false });
    b.blob(0.22, 0x5a504a, { at: [5.4, 0.2, -6.0], detail: 0 });

    // ---- the wheel pit: two stone walls built out into the river, the wheel between them
    const wz = -12.6;
    b.sym((s) => b.box(0.7, 1.0 - BED, 3.6, dress, { at: [wx + s * 1.15, BED, BANK - 1.6] }));
    b.box(3.0, 0.2, 3.4, tint(stone, -0.1), { at: [wx, BED, BANK - 1.7] });
    water(b, 1.6, 3.4, [wx, WATER + 0.15, BANK - 1.6]);
    waterwheel(b, { at: [wx, 0.6, wz], r: 2.4, width: 1.2, paddles: 16, spokes: 8, spin: b.rand(), axle: 1.6, axleDir: 1 });
    b.log(0.3, 2.2, P.oakDark, { at: [wx, 0.3, (wz + back) / 2 + 0.2], axis: 'z', segs: 8 });

    // ---- the yard: ore, charcoal, a stack of finished bars, the grange wall and gate on the street
    heap(b, [-13.5, 0, 3.4], 1.8, 1.2, 0x8a5a3c); // iron ore
    heap(b, [-9.8, 0, 3.8], 2.0, 1.4, tint(P.timberBlack, 0.12)); // charcoal
    logPile(b, [-2.0, 0, 3.2], 4.0, 3);
    b.box(1.6, 0.4, 0.8, P.oak, { at: [6.0, 0, 3.5] });
    for (let i = 0; i < 6; i++) b.box(1.4, 0.08, 0.08, P.iron, { at: [6.0, 0.4 + Math.floor(i / 3) * 0.1, 3.3 + (i % 3) * 0.2], jitter: false });
    // a cart and the precinct wall with its gate
    b.box(2.6, 0.2, 1.4, P.oak, { at: [11.5, 0.9, 4.5] });
    for (const z of [3.8, 5.2]) b.log(0.5, 0.1, P.oakDark, { at: [11.5, 0, z], axis: 'x', segs: 10 });
    b.box(1.2, 0.5, 0.9, 0x8a5a3c, { at: [11.5, 1.1, 4.5] });
    b.box(13.5, 2.4, 0.6, stone, { at: [-10.6, 0, 10.4] });
    b.box(13.5, 2.4, 0.6, stone, { at: [10.6, 0, 10.4] });
    b.box(13.7, 0.2, 0.8, tile, { at: [-10.6, 2.4, 10.4] });
    b.box(13.7, 0.2, 0.8, tile, { at: [10.6, 2.4, 10.4] });
    b.sym((s) => b.box(1.0, 3.4, 1.0, dress, { at: [s * 3.6, 0, 10.4] }));
    b.archWall(8.2, 4.2, 0.8, stone, { at: [0, 0, 10.4], facing: '+z', openings: 1, openW: 3.4, openH: 3.6 });
    b.gable(8.6, 1.6, 1.4, tile, { at: [0, 4.2, 10.4], overhang: 0.2 });
    for (const x of lin(2, -15, 15)) b.tree(7, { at: [x, 0, 6.5], kind: 'round' });

    b.collider(W + 2, D + 2, { at: [x0, 0, z0] });
    b.collider(13.5, 0.6, { at: [-10.6, 0, 10.4] });
    b.collider(13.5, 0.6, { at: [10.6, 0, 10.4] });
  },
};
