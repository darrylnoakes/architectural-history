import { P, tint, type BuildingDef } from '@ah/kit';
import { paling, sash } from './shared';
import { cantedPlan, prism } from './shared-prism';

export const victorianTerrace: BuildingDef = {
  id: 'victorian-terrace',
  name: 'Terraced houses',
  style: 'Victorian',
  date: 'c. 1860',
  summary:
    'The railway reached the town, and with it cheap Welsh slate, machine-made bricks and a growing class of clerks and skilled ' +
    'workers who rented rather than owned. A speculative builder bought the old house and garden and put up a short terrace on the ' +
    'plot; the family lives in the middle one, with the bright door. Each house is narrow but deep, with a bay window to the parlour, ' +
    'bands of coloured brick copied from fashionable Gothic Revival buildings, and a back extension holding the kitchen and scullery.',
  materials: ['yellow stock brick', 'red and blue brick bands', 'Welsh slate', 'plate-glass sashes', 'cast iron railings'],
  lookFor: [
    {
      label: 'Bay window',
      note: 'A canted bay, three sashes set at angles, gives the front parlour more light and a view up and down the street.',
      at: [0.75, 1.7, 6.4],
    },
    {
      label: 'Polychrome brickwork',
      note: 'Bands of red and blue-black brick laid in the yellow walls, and arches of alternating colours over doors and windows.',
      at: [2.0, 3.2, 5.65],
    },
    {
      label: 'Slate roof',
      note: 'Thin, light Welsh slate, brought cheaply by rail, allowed a lower pitch than tile and spread across the whole country.',
      at: [0, 7.3, 2.4],
    },
    {
      label: 'Chimney pots',
      note: 'Every room has a coal fire, so the stacks on the party walls carry a row of clay pots, one for each flue.',
      at: [2.3, 10.0, 1.6],
    },
    {
      label: 'Back extension',
      note: 'A narrower wing behind each house held the kitchen and scullery, with a bedroom above; the privy was at the end of the yard.',
      at: [0.35, 3.5, -4.6],
    },
  ],
  influences: ['gothic-revival-export'],
  build(b) {
    const n = 3;
    const hw = 4.6; // house width
    const W = hw * n;
    const zf = 5.6;
    const D = 8.0;
    const zb = zf - D;
    const zc = zf - D / 2;
    const g1 = 3.0;
    const H = g1 + 2.9;
    const brick = b.pick([P.brickYellow, tint(P.brickYellow, -0.05), P.brickBuff]);
    const red = b.pick([P.brickRed, P.brickOrange]);
    const blue = P.brickBlue;
    const stone = P.limestone;
    const slate = b.pick([P.slate, P.slateBlue]);
    const ours = b.pick([P.doorYellow, P.postRed, P.cladBlue]);

    // main block
    b.box(W, H, D, brick, { at: [0, 0, zc] });
    b.box(W + 0.06, 0.45, D + 0.06, blue, { at: [0, 0, zc] }); // blue-brick plinth
    // polychrome bands across the front and back
    for (const [y, c] of [[1.0, red], [g1 + 0.15, blue], [g1 + 0.3, red], [H - 0.5, red]] as [number, number][]) {
      b.box(W + 0.04, 0.15, D + 0.04, c, { at: [0, y, zc] });
    }
    b.box(W + 0.2, 0.2, D + 0.2, stone, { at: [0, H - 0.05, zc] }); // eaves cornice
    b.gable(W, D, 2.7, slate, { at: [0, H, zc], overhang: 0.25, thick: 0.1, wall: brick });
    b.box(W + 0.5, 0.12, 0.2, tint(slate, -0.1), { at: [0, H + 2.75, zc] }); // ridge tiles

    // party-wall and end stacks with pots
    for (const x of [-W / 2, -hw / 2, hw / 2, W / 2]) {
      const end = Math.abs(x) > W / 2 - 0.1;
      b.chimney(end ? 0.6 : 0.8, 2.1, 1.2, brick, { at: [x - Math.sign(x) * (end ? 0.3 : 0), H + 1.6, zc], pots: end ? 2 : 4 });
      b.box(end ? 0.64 : 0.84, 0.14, 1.24, red, { at: [x - Math.sign(x) * (end ? 0.3 : 0), H + 3.2, zc] });
    }

    // arch of alternating voussoirs over an opening
    const polyArch = (x: number, y: number, w: number, z: number) => {
      const k = 7;
      for (let i = 0; i < k; i++) {
        const a = Math.PI * (1 - (i + 0.5) / k);
        const r = w / 2 + 0.12;
        b.box(0.22, 0.2, 0.06, i % 2 ? red : brick, {
          at: [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.45 - 0.1, z + 0.02],
          rot: [0, 0, a - Math.PI / 2],
        });
      }
    };

    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * hw;
      const mirror = i % 2 === 0 ? 1 : -1; // door side alternates so doors pair up
      const dx = cx + mirror * 1.35;
      const bx = cx - mirror * 0.75;
      const isOurs = i === 1;

      // canted bay to the parlour
      const fw = 1.5;
      const p = 0.75;
      prism(b, cantedPlan(fw, p), g1 - 0.2, brick, [bx, 0, zf]);
      prism(b, cantedPlan(fw, p), 0.45, blue, [bx, 0, zf + 0.01]);
      prism(b, cantedPlan(fw + 0.2, p + 0.12), 0.22, stone, [bx, g1 - 0.25, zf]);
      b.hip(fw + 2 * p + 0.2, p + 0.2, 0.45, slate, { at: [bx, g1 - 0.03, zf + (p + 0.2) / 2] });
      sash(b, 1.15, 1.85, [bx, 0.75, zf + p + 0.01], '+z', [2, 2]);
      b.sym((s) => {
        const ax = bx + s * (fw / 2 + p / 2);
        sash(b, 0.62, 1.85, [ax, 0.75, zf + p / 2 + 0.01], s * (Math.PI / 4), [1, 2]);
      });

      // door, recessed under a polychrome round arch, with a fanlight
      const door = isOurs ? ours : b.pick([P.doorBlack, P.doorGreen, tint(P.doorBlue, -0.1), P.doorRed]);
      b.panel(1.15, 2.85, tint(brick, -0.25), { at: [dx, 0.45, zf], facing: '+z', shape: 'round', depth: 0.02 });
      b.panel(0.95, 2.1, door, { at: [dx, 0.45, zf + 0.02], facing: '+z' });
      b.window(0.95, 0.5, { at: [dx, 2.57, zf + 0.0], facing: '+z', shape: 'round', bars: [2, 1], frame: P.white });
      polyArch(dx, 2.75, 1.15, zf);
      b.stairs(1.2, 0.45, 0.5, 2, stone, { at: [dx, 0, zf + 0.25] });
      if (isOurs) b.box(0.08, 0.08, 0.03, P.gold, { at: [dx + 0.3, 1.45, zf + 0.06] });

      // first floor: two sashes over the bay, one over the door
      for (const [x, w] of [[bx, 1.0], [dx, 0.85]] as [number, number][]) {
        sash(b, w, 1.75, [x, g1 + 0.55, zf + 0.0], '+z', [2, 2]);
        b.box(w + 0.2, 0.1, 0.12, stone, { at: [x, g1 + 0.48, zf + 0.05] });
        polyArch(x, g1 + 2.38, w, zf);
      }

      // front garden: low wall with railings, tiled path, a shrub
      const gz = 8.8;
      b.box(hw, 0.5, 0.25, brick, { at: [cx, 0, gz] });
      b.box(0.25, 0.5, gz - zf - (i === 1 ? 0 : 0), brick, { at: [cx + hw / 2, 0, (gz + zf) / 2] });
      paling(b, cx - hw / 2 + 0.1, gz, dx - 0.7, gz, 0.75, P.castIron, 0.14);
      b.box(1.1, 0.03, gz - zf - 0.5, isOurs ? 0xb5523e : P.paving, { at: [dx, 0, zf + 0.5 + (gz - zf - 0.5) / 2], jitter: false });
      b.tree(b.range(0.9, 1.4), { at: [bx, 0, zf + 2.2], kind: 'bush', color: P.hedge });

      // back extension (outrigger), paired against a party wall
      const ow = 2.6;
      const od = 4.4;
      const ox = cx + mirror * (hw / 2 - ow / 2);
      const oz = zb - od / 2;
      b.box(ow, H - 0.6, od, brick, { at: [ox, 0, oz] });
      b.box(ow + 0.04, 0.45, od + 0.04, blue, { at: [ox, 0, oz] });
      b.shed(ow, od, 1.1, slate, { at: [ox, H - 0.6, oz], high: mirror > 0 ? '+x' : '-x' });
      b.chimney(0.5, 1.4, 0.7, brick, { at: [ox + mirror * (ow / 2 - 0.3), H + 0.3, oz - od / 2 + 0.6], pots: 1 });
      const fx = mirror > 0 ? '-x' : '+x';
      const wx = ox - mirror * (ow / 2);
      sash(b, 0.8, 1.4, [wx - mirror * 0.0, 0.9, oz - 0.8], fx, [2, 2]);
      sash(b, 0.8, 1.4, [wx, g1 + 0.6, oz - 0.6], fx, [2, 2]);
      b.panel(0.85, 2.0, P.doorBlack, { at: [wx, 0.1, oz + 1.3], facing: fx });
      // back windows of the main block
      sash(b, 0.95, 1.7, [cx - mirror * 1.2, 0.8, zb], '-z', [2, 2]);
      sash(b, 0.95, 1.6, [cx - mirror * 1.2, g1 + 0.6, zb], '-z', [2, 2]);
      sash(b, 0.8, 1.3, [ox, g1 + 0.7, zb - od], '-z', [2, 2]);
      // yard: dividing walls, privy at the end
      b.box(0.2, 1.8, 8.9 + zb - od, brick, { at: [cx - hw / 2 + 0.1, 0, (zb - od - 8.9) / 2] });
      b.box(1.2, 2.1, 1.1, brick, { at: [ox, 0, -8.3] });
      b.shed(1.3, 1.2, 0.3, slate, { at: [ox, 2.1, -8.3], high: '-z' });
      b.panel(0.7, 1.8, tint(P.doorGreen, 0.05), { at: [ox, 0, -7.75], facing: '+z' });
    }
    b.box(0.2, 1.8, 8.9 + zb - 4.4, brick, { at: [W / 2 - 0.1, 0, (zb - 4.4 - 8.9) / 2] });
    b.box(W, 1.8, 0.2, brick, { at: [0, 0, -8.9] });
  },
};
