import { P, tint, type BuildingDef } from '@ah/kit';
import { hurdle, pitched, vegBed, woodpile } from './shared';

export const lateRomanHouse: BuildingDef = {
  id: 'late-roman-house',
  name: 'House inside the walls',
  style: 'Late Antique',
  date: 'c. AD 300 to 450',
  summary:
    'After the raids of 275 the town shrank behind a new wall enclosing only a fraction of the old one, and houses were packed into the space inside. ' +
    'They were built from whatever lay about in the ruined quarters outside: rubble, squared blocks and broken carvings from temples and tombs for the ground floor, salvaged tiles for the roof, ' +
    'and where tiles ran short, thatch. Upstairs the walls are timber and cob again. The old shop front has been walled up to a single door: trade was thinner, and safety mattered more.',
  materials: ['reused stone blocks and rubble', 'oak frame and cob', 'salvaged Roman tiles', 'straw thatch'],
  lookFor: [
    {
      label: 'Reused blocks (spolia)',
      note: 'Big squared stones, a column drum and a carved fragment taken from ruined public buildings are built into the lower wall.',
      at: [-6.1, 0.9, 8.3],
    },
    {
      label: 'Walled-up shop opening',
      note: 'The outline of a wide opening is still visible, filled in with smaller rubble and leaving only a narrow door.',
      at: [-2.5, 2.3, 8.3],
    },
    {
      label: 'Timber upper storey',
      note: 'Above the stone the house is framed in timber and filled with cob, quicker and cheaper to build.',
      at: [-1.2, 3.9, 8.25],
    },
    {
      label: 'Patched roof of tile and thatch',
      note: 'Salvaged Roman tiles cover the front of the roof; the back, where they ran out, is thatched.',
      at: [-1.2, 6.2, -1.0],
    },
  ],
  build(b) {
    const xc = -3.2;
    const W = 6.4;
    const zF = 8.1;
    const zB = -2.1;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const g = 2.8;
    const eaves = 5.1;
    const rubble = tint(P.rubble, b.range(-0.05, 0.02));
    const blockStone = tint(P.pierreBlonde, b.range(-0.06, 0));
    const cob = tint(b.pick([P.torchis, P.daub, P.cob]), b.range(-0.03, 0.02));
    const tile = tint(P.romanTile, b.range(-0.06, 0.0));
    const thatch = tint(b.pick([P.thatchOld, P.thatch]), b.range(-0.04, 0.02));

    // ground storey of rubble and reused stone
    b.box(W, g, D, rubble, { at: [xc, 0, zc] });
    for (let i = 0; i < 5; i++) b.box(W + 0.02, 0.05, D + 0.02, tint(rubble, -0.1), { at: [xc, 0.5 + i * 0.5, zc], jitter: false });
    // big blocks in the lowest courses, on the front and the yard side
    const blocks: [number, number, number, number][] = [
      [-6.0, 0, 1.2, 0.6], [-4.6, 0, 1.4, 0.6], [-6.1, 0.6, 0.9, 0.55], [0.0 - 0.7, 0, 1.3, 0.62], [-1.4 - 0.6, 0.62, 1.0, 0.5],
    ];
    for (const [x, y, w, h] of blocks) b.box(w, h - 0.04, 0.1, tint(blockStone, b.range(-0.04, 0.03)), { at: [x, y + 0.02, zF + 0.03] });
    for (const [z, y, w, h] of [[6.5, 0, 1.6, 0.62], [3.0, 0, 1.2, 0.6], [-0.6, 0, 1.5, 0.58], [4.6, 0.62, 1.1, 0.5]] as [number, number, number, number][]) {
      b.box(0.1, h - 0.04, w, tint(blockStone, b.range(-0.04, 0.03)), { at: [xc + W / 2 + 0.03, y + 0.02, z] });
    }
    // a column drum laid on its side, and a carved fragment of a frieze
    b.log(0.32, 1.1, tint(blockStone, 0.04), { at: [-4.9, 1.2, zF - 0.2], axis: 'z', segs: 10 });
    b.box(1.2, 0.5, 0.12, blockStone, { at: [xc + W / 2 + 0.04 - 0.0, 1.35, zF - 0.2 - 3.0], rotY: Math.PI / 2 });
    b.panel(0.32, 0.3, tint(blockStone, -0.12), { at: [xc + W / 2 + 0.1, 1.45, 4.7], facing: '+x', shape: 'circle', depth: 0.05 });
    b.panel(0.32, 0.3, tint(blockStone, -0.12), { at: [xc + W / 2 + 0.1, 1.45, 5.5], facing: '+x', shape: 'circle', depth: 0.05 });
    b.panel(1.8, 0.1, tint(blockStone, -0.08), { at: [xc + W / 2 + 0.1, 1.38, 5.1], facing: '+x', depth: 0.05 });

    // the old shop opening, walled up with smaller stuff, leaving a door
    b.panel(4.0, 2.35, P.brickOrange, { at: [-2.5, 0, zF], facing: '+z', depth: 0.02 });
    b.panel(3.7, 2.2, tint(rubble, 0.07), { at: [-2.5, 0, zF], facing: '+z', depth: 0.04 });
    b.panel(1.0, 2.0, P.oakDark, { at: [-1.6, 0, zF], facing: '+z', depth: 0.07 });
    b.panel(0.5, 0.45, P.timberBlack, { at: [-3.2, 1.3, zF], facing: '+z', depth: 0.07 });
    b.box(1.4, 0.18, 0.5, blockStone, { at: [-1.6, 0, zF + 0.25] });

    // timber upper storey with cob
    const uh = eaves - g;
    b.box(W, uh, D, cob, { at: [xc, g, zc] });
    b.box(W + 0.1, 0.2, D + 0.1, P.oakDark, { at: [xc, g, zc] });
    b.frame(W, uh, P.oak, { at: [xc, g, zF], facing: '+z', studs: 3, rails: 1, brace: 'corner', beam: 0.17, depth: 0.05 });
    b.frame(W, uh, P.oak, { at: [xc, g, zB], facing: '-z', studs: 3, rails: 1, brace: 'corner', beam: 0.17, depth: 0.05 });
    b.frame(D, uh, P.oak, { at: [xc + W / 2, g, zc], facing: '+x', studs: 6, rails: 1, brace: 'corner', beam: 0.17, depth: 0.05 });
    b.window(0.8, 0.75, { at: [-4.7, 3.7, zF + 0.04], facing: '+z', frame: P.oakDark, glass: P.timberBlack });
    b.window(0.8, 0.75, { at: [-1.7, 3.7, zF + 0.04], facing: '+z', frame: P.oakDark, glass: P.timberBlack });
    b.window(0.8, 0.75, { at: [xc + W / 2 + 0.04, 3.7, 1.0], facing: '+x', frame: P.oakDark, glass: P.timberBlack });
    b.window(0.7, 0.65, { at: [xc, 3.7, zB - 0.04], facing: '-z', frame: P.oakDark, glass: P.timberBlack });
    b.panel(0.9, 2.0, P.oakDark, { at: [xc + 1.2, 0, zB], facing: '-z' });

    // the roof: salvaged tiles at the front, thatch at the back where they ran out
    const rise = 2.6;
    const zT = 2.0;
    pitched(b, W, zF - zT + 0.2, rise, tile, { at: [xc, eaves, (zF + zT - 0.2) / 2], ridge: 'z', overhang: 0.45, ends: 0.35, wall: cob, thick: 0.14, ribs: 0.48 });
    pitched(b, W, zT - zB, rise, thatch, { at: [xc, eaves, (zT + zB) / 2], ridge: 'z', overhang: 0.5, ends: 0.4, wall: cob, thick: 0.4 });

    // a thatched lean-to workshop against the yard side
    const lx = 1.6;
    b.box(3.0, 2.2, 4.4, tint(P.wattle, 0.05), { at: [lx, 0, 4.6] });
    b.frame(4.4, 2.2, P.oak, { at: [lx + 1.5, 0, 4.6], facing: '+x', studs: 3, rails: 0, beam: 0.14, depth: 0.04 });
    b.shed(3.6, 5.0, 1.3, thatch, { at: [lx + 0.1, 2.2, 4.6], high: '-x' });
    b.box(1.8, 2.0, 0.08, P.windowDark, { at: [lx + 0.2, 0, 6.82] });
    b.box(0.14, 2.2, 0.14, P.oak, { at: [lx - 0.8, 0, 6.85] });
    b.box(0.14, 2.2, 0.14, P.oak, { at: [lx + 1.2, 0, 6.85] });
    woodpile(b, [lx, 0, 7.6], 2.2, 2);

    // the yard behind: a stretch of the old Roman masonry with its brick bands, garden, hens' fence
    const ox = 3.8;
    b.box(5.6, 2.4, 0.7, rubble, { at: [ox, 0, -7.9] });
    for (const y of [0.6, 1.4]) b.box(5.62, 0.18, 0.72, P.brickOrange, { at: [ox, y, -7.9], jitter: false });
    b.box(1.6, 0.9, 0.72, rubble, { at: [ox - 1.6, 2.4, -7.9] });
    b.box(1.2, 0.45, 0.72, rubble, { at: [ox + 1.2, 2.4, -7.9] });
    b.blob(0.5, P.leafDark, { at: [ox + 2.4, 2.4, -7.7], detail: 0 });
    hurdle(b, -6.7, -8.6, 0.9, -8.6);
    hurdle(b, -6.7, -8.6, -6.7, zB);
    hurdle(b, 6.7, -7.5, 6.7, 8.6);
    hurdle(b, 3.1, 8.6, 6.7, 8.6);
    vegBed(b, -3.6, -5.2, 5.2, 3.6, { rows: 6 });
    vegBed(b, 3.8, -4.6, 3.6, 3.0, { rows: 4, color: P.leafDark });
    b.box(1.8, 0.5, 1.4, tint(P.soil, 0.1), { at: [4.8, 0, 0.4] }); // dung heap
    b.tree(b.range(3.6, 4.4), { at: [-0.6, 0, -7.4], kind: 'round', color: P.leaf });
  },
};
