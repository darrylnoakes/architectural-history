import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { dormer, mansard, onWall, yardBounds } from './shared';

/** A wrought or cast iron railing along X: rails and bars, `at` the bottom centre. */
function railing(b: Builder, len: number, h: number, at: [number, number, number], step: number, col: number): void {
  const [x, y, z] = at;
  b.box(len, 0.06, 0.06, col, { at: [x, y + h - 0.06, z], jitter: false });
  b.box(len, 0.05, 0.05, col, { at: [x, y + 0.08, z], jitter: false });
  const n = Math.max(2, Math.round(len / step));
  for (let i = 0; i <= n; i++) b.box(0.025, h - 0.1, 0.025, col, { at: [x - len / 2 + (i * len) / n, y + 0.05, z], jitter: false });
}

export const immeubleBourgeois: BuildingDef = {
  id: 'immeuble-bourgeois',
  name: 'Apartment block (immeuble de rapport)',
  style: 'Second Empire, in the Haussmann manner',
  date: 'c. 1868',
  summary:
    'Between 1853 and 1870 Baron Haussmann cut boulevards through Paris and lined them with uniform blocks of cut stone, and provincial cities copied them along the new streets to their stations. ' +
    'This is a block built by an investor to let (an immeuble de rapport): shops on the ground floor with an entresol over them, the best flat on the second floor behind a continuous balcony, plainer floors above, a second balcony on the fifth, and maids’ rooms in the zinc mansard. ' +
    'Our household now rents a flat; a porte cochère, watched by the concierge, leads to the court behind.',
  materials: ['cut limestone (pierre de taille)', 'cast and wrought iron', 'zinc roof', 'plaster rear walls'],
  influences: ['haussmann-export'],
  lookFor: [
    {
      label: 'Continuous balcony',
      note: 'The balcon filant runs the whole width of the second floor, the étage noble where the richest tenant lived; a second one repeats the line on the fifth.',
      at: [-4.0, 7.3, 8.6],
    },
    {
      label: 'Zinc mansard',
      note: 'Sheets of zinc, cheap and light, cover the mansard, with dormers lighting the maids’ rooms under the roof.',
      at: [-3.9, 20.3, 7.3],
    },
    {
      label: 'Porte cochère',
      note: 'A tall carriage door in the middle bay opens into a passage to the court, past the concierge’s lodge.',
      at: [0.0, 3.8, 8.0],
    },
    {
      label: 'Shopfronts',
      note: 'Painted timber shopfronts with big panes of plate glass fill the ground floor on either side of the door.',
      at: [-3.9, 1.6, 8.15],
    },
    {
      label: 'Rusticated base',
      note: 'Deep horizontal joints cut in the stone of the ground floor and entresol make a heavy base for the smoother floors above.',
      at: [6.2, 5.4, 7.9],
    },
  ],
  build(b) {
    const stone = tint(b.pick([P.pierreBlonde, P.craie, P.limestone]), b.range(-0.03, 0.01));
    const dress = tint(stone, 0.04);
    const iron = P.castIron;
    const zinc = tint(P.zincParis, b.range(-0.03, 0.03));
    const shopA = b.pick([P.doorGreen, P.doorRed, tint(P.doorBlue, 0.04), P.oakDark]);
    const shopB = b.pick([P.doorGreen, P.doorRed, P.doorBlack, tint(P.oak, -0.05)]);
    const render = tint(b.pick([P.enduitGris, P.plaster, P.stucco]), b.range(-0.03, 0.01));
    const W = 13.6;
    const zF = 7.8;
    const zB = -2.4;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const levels = [0, 4.0, 6.8, 10.1, 13.1, 16.0, 18.7];
    const top = levels[6];
    const bays = [-5.2, -2.6, 0, 2.6, 5.2];

    b.box(W, top, D, stone, { at: [0, 0, zc] });
    b.box(W, top - 6.8, 0.06, render, { at: [0, 6.8, zB - 0.02] });
    // rustication of the base
    for (let y = 0.5; y < 6.8; y += 0.5) b.box(W, 0.06, 0.06, tint(stone, -0.15), { at: [0, y, zF + 0.0], jitter: false });
    // string courses and the main cornice
    for (const y of [6.8, 10.1, 16.0]) b.box(W, 0.24, 0.16, dress, { at: [0, y - 0.24, zF + 0.06] });
    b.box(W, 0.35, 0.45, dress, { at: [0, top - 0.1, zF + 0.15] });
    b.box(W, 0.12, 0.65, tint(dress, 0.03), { at: [0, top + 0.25, zF + 0.2] });

    // ground floor: two shopfronts and the porte cochère
    for (const [sx, col] of [[-3.9, shopA], [3.9, shopB]] as [number, number][]) {
      b.box(4.9, 3.6, 0.25, col, { at: [sx, 0, zF + 0.1] });
      b.box(4.5, 2.5, 0.1, P.glass, { at: [sx, 0.55, zF + 0.2], mat: 'glass' });
      b.box(1.0, 2.6, 0.12, tint(col, -0.1), { at: [sx + 1.6, 0, zF + 0.22] });
      b.box(5.1, 0.6, 0.35, col, { at: [sx, 3.1, zF + 0.12] }); // signboard
      b.box(4.0, 0.3, 0.37, P.cream, { at: [sx, 3.25, zF + 0.12], jitter: false });
      for (const dx of [-0.8, 0.4]) b.box(0.06, 2.5, 0.14, col, { at: [sx + dx, 0.55, zF + 0.24] });
      // an awning on its arms
      b.group({ at: [sx, 3.05, zF + 0.3], rot: [0.35, 0, 0] }, () => b.box(4.8, 0.05, 0.95, b.pick([0xc84a3a, 0x3a6a4a, 0xd8cdb4]), { at: [0, 0, 0.45] }));
    }
    b.panel(2.4, 4.4, dress, { at: [0, 0, zF], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(2.0, 4.1, P.doorGreen, { at: [0, 0, zF], facing: '+z', shape: 'round', depth: 0.1 });
    b.panel(1.8, 0.9, P.glassDark, { at: [0, 3.05, zF], facing: '+z', shape: 'round', depth: 0.12 });
    b.panel(0.04, 3.0, tint(P.doorGreen, -0.15), { at: [0, 0, zF], facing: '+z', depth: 0.12 });
    b.panel(0.5, 0.6, dress, { at: [0, 4.2, zF], facing: '+z', depth: 0.14 });
    // entresol: low windows
    for (const x of bays) b.window(1.2, 1.7, { at: [x, 4.55, zF + 0.02], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 3], mat: 'glass', border: 0.08 });

    // upper floors: tall windows, surrounds, pediments on the second floor, guards elsewhere
    const floors: [number, number][] = [[6.8, 2.45], [10.1, 2.25], [13.1, 2.15], [16.0, 1.95]];
    floors.forEach(([y, h], fi) => {
      for (const [i, x] of bays.entries()) {
        b.panel(1.6, h + 0.25, dress, { at: [x, y + 0.2, zF + 0.02], facing: '+z', depth: 0.04 });
        b.window(1.2, h, { at: [x, y + 0.3, zF + 0.03], facing: '+z', frame: P.white, glass: P.glassDark, bars: [2, 4], mat: 'glass', border: 0.08 });
        if (fi === 0) {
          onWall(b, [x, y + 0.35 + h, zF + 0.06], '+z', () => {
            if (i % 2 === 0) b.extrude([[-0.95, 0], [0.95, 0], [0, 0.5]], 0.2, dress, { at: [0, 0, 0.08] });
            else b.box(1.9, 0.25, 0.2, dress, { at: [0, 0, 0.08] });
          });
        } else {
          b.box(1.7, 0.18, 0.18, dress, { at: [x, y + 0.36 + h, zF + 0.1] });
        }
        if (fi === 1 || fi === 2) railing(b, 1.25, 0.9, [x, y + 0.3, zF + 0.16], 0.42, iron);
      }
    });
    // the two continuous balconies on carved consoles
    for (const y of [6.8, 16.0]) {
      b.box(W - 0.4, 0.2, 0.85, dress, { at: [0, y + 0.1, zF + 0.42] });
      for (const x of [-6.2, -3.9, -1.3, 1.3, 3.9, 6.2]) b.box(0.22, 0.5, 0.75, dress, { at: [x, y - 0.4, zF + 0.38] });
      railing(b, W - 0.5, 1.0, [0, y + 0.3, zF + 0.8], 0.3, iron);
      for (const s of [1, -1]) b.box(0.05, 1.0, 0.8, iron, { at: [s * (W / 2 - 0.27), y + 0.3, zF + 0.42], jitter: false });
    }

    // zinc mansard, dormers, chimney stacks with pots
    const roofY = top + 0.37;
    mansard(b, W, D + 0.4, 2.6, 1.1, 0.9, zinc, tint(zinc, 0.06), stone, { at: [0, roofY, zc] });
    for (const x of bays) dormer(b, [x, roofY, zF - 0.05], '+z', 1.3, 2.0, zinc, zinc, { frame: P.white, bars: [2, 3], depth: 1.0, shape: 'round' });
    for (const x of [-2.6, 2.6]) dormer(b, [x, roofY, zB + 0.15], '-z', 1.2, 1.8, zinc, zinc, { frame: P.white, bars: [2, 3], depth: 1.0 });
    for (const s of [1, -1]) {
      b.chimney(2.4, 1.6, 0.7, tint(P.briqueNord, 0.03), { at: [s * (W / 2 - 1.4), roofY + 2.8, zc + 1.5], pots: 5 });
      b.chimney(1.8, 1.4, 0.7, tint(P.briqueNord, 0.03), { at: [s * (W / 2 - 1.1), roofY + 2.8, zc - 2.0], pots: 3 });
    }

    // the court front: render, plain windows in rows, the stair window offset between the floors
    for (const x of [-5.0, -2.5, 2.5, 5.0]) {
      for (const y of [1.0, 4.4, 7.4, 10.6, 13.5, 16.3]) b.window(1.1, 1.75, { at: [x, y, zB - 0.04], facing: '-z', frame: P.white, glass: P.glassDark, bars: [2, 1], border: 0.07 });
    }
    for (const y of [5.9, 9.0, 12.2, 15.0]) b.window(0.9, 1.3, { at: [0, y, zB - 0.04], facing: '-z', frame: P.white, glass: P.glassDark, border: 0.07 });
    b.panel(2.0, 3.6, P.doorGreen, { at: [0, 0, zB - 0.02], facing: '-z', shape: 'segmental', depth: 0.08 });
    // the court: paving, a low workshop range at the back, a tree
    // the old walls of the plot still bound the court
    const wall = tint(render, -0.04);
    yardBounds(b, zB, tint(P.rubble, 0.03), P.zincParis);
    b.box(13.2, 0.04, 6.6, P.paving, { at: [0, 0, -5.4], jitter: false });
    b.box(13.5, 3.2, 2.4, wall, { at: [0, 0, -7.6] });
    b.shed(13.5, 2.6, 0.9, zinc, { at: [0, 3.2, -7.6], high: '-z' });
    for (const x of [-4.5, -1.5, 1.5, 4.5]) b.panel(1.8, 2.4, x < 0 ? P.oakDark : tint(P.voletGris, -0.1), { at: [x, 0, -6.4], facing: '+z' });
    b.tree(b.range(4.5, 5.5), { at: [4.6, 0, -4.4], kind: 'round', color: P.leaf });
    b.cyl(0.05, 2.4, P.castIron, { at: [-4.6, 0, -4.0], segs: 6 });
    b.box(0.4, 0.8, 0.4, P.castIron, { at: [-4.6, 0, -4.0] }); // pump
  },
};
