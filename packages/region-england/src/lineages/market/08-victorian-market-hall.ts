import { P, linspace, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { beam, goods } from './shared';

/** A ring of alternating-colour voussoirs round a semicircular arch in a wall facing +Z (local frame). */
function voussoirs(b: Builder, r: number, springY: number, colors: number[], n = 15, depth = 0.5): void {
  for (let i = 0; i < n; i++) {
    const a = Math.PI - ((i + 0.5) / n) * Math.PI;
    const x = Math.cos(a) * r;
    const y = springY + Math.sin(a) * r;
    b.box((Math.PI * (r + 0.28)) / n - 0.03, 0.56, 0.16, colors[i % colors.length], {
      at: [x, y, depth],
      rot: [0, 0, a - Math.PI / 2],
      jitter: false,
    });
  }
}

export const victorianMarketHall: BuildingDef = {
  id: 'victorian-market-hall',
  name: 'Covered market hall',
  style: 'Victorian High Gothic polychromy',
  date: 'c. 1865',
  summary:
    'The railway has made the town a regional centre, and the council replaces its little market house with a covered hall big enough for hundreds of stalls. ' +
    'The trading floor sits under a roof of cast iron and glass, the technology of railway stations, so it is light inside whatever the weather. ' +
    'The ends facing the square are dressed up in striped and patterned brick, a fashion spread by John Ruskin’s writing on the buildings of Venice and Verona.',
  materials: ['red, yellow and blue brick', 'cast iron', 'glass', 'stone dressings'],
  lookFor: [
    { label: 'Polychrome brickwork', note: 'Bands and arches in different coloured bricks: structural colour rather than paint.', at: [-6.5, 5.0, 8.15] },
    { label: 'Iron and glass roof', note: 'Glass held in a frame of cast and wrought iron ribs, the same system as the new railway stations.', at: [5.0, 9.6, 2.0] },
    { label: 'Ventilating lantern', note: 'A raised strip along the ridge with louvred sides lets stale air and heat escape.', at: [0, 12.2, -2.0] },
    { label: 'Entrance arch', note: 'A huge round arch with striped voussoirs and an iron fanlight, wide enough for carts.', at: [0, 6.2, 8.4] },
    { label: 'Screen gable', note: 'The brick front rises above the glass roof behind it, giving the hall a civic face.', at: [3.2, 11.4, 8.1] },
  ],
  influences: ['industrial-export', 'gothic-revival-export'],
  build(b) {
    const W = 19;
    const D = 16;
    const EH = 6.6; // eaves height
    const RH = 4.8; // rise of the glazed roof
    const red = b.pick([P.brickRed, P.brickOrange, tint(P.brickRed, 0.03)]);
    const yellow = P.brickYellow;
    const blue = P.brickBlue;
    const stone = P.portland;
    const iron = P.castIron;

    // plinth
    b.box(W + 0.4, 0.5, D + 0.4, blue);

    // side walls with arched windows between pilasters
    for (const s of [1, -1] as const) {
      const xf = s * (W / 2);
      const facing = s > 0 ? '+x' : '-x';
      b.box(0.6, EH - 0.5, D - 1.2, red, { at: [xf - s * 0.3, 0.5, 0] });
      b.box(0.66, 0.3, D - 1.2, yellow, { at: [xf - s * 0.3, 2.4, 0] });
      b.box(0.66, 0.22, D - 1.2, blue, { at: [xf - s * 0.3, 4.6, 0] });
      b.box(0.8, 0.35, D - 1.0, stone, { at: [xf - s * 0.3, EH - 0.35, 0] }); // cornice
      const zs = spread(5, -D / 2 + 0.6, D / 2 - 0.6);
      for (const z of zs) {
        b.panel(1.9, 3.6, yellow, { at: [xf, 2.1, z], facing, shape: 'round', depth: 0.05 });
        b.window(1.5, 3.3, { at: [xf, 2.2, z], facing, shape: 'round', frame: iron, bars: [3, 5], border: 0.06 });
      }
      for (const z of linspace(6, -D / 2 + 0.6, D / 2 - 0.6)) b.panel(0.5, EH - 0.85, red, { at: [xf, 0.5, z], facing, depth: 0.18 });
    }

    // the glazed roof: ridge front to back, iron ribs and a louvred lantern
    const yR = EH;
    b.gable(W - 0.4, D - 1.0, RH, P.glass, { at: [0, yR, 0], ridge: 'z', overhang: 0.2, mat: 'glass', thick: 0.06 });
    const half = (W - 0.4) / 2;
    for (const z of linspace(9, -D / 2 + 0.7, D / 2 - 0.7)) {
      for (const s of [-1, 1]) beam(b, [s * (half + 0.2), yR - 0.05, z], [0, yR + RH + 0.05, z], 0.12, iron, 0.14);
    }
    for (const t of [0.3, 0.6]) {
      for (const s of [-1, 1]) b.box(0.1, 0.1, D - 1.0, iron, { at: [s * half * (1 - t), yR + RH * t + 0.04, 0] });
    }
    const lw = 2.4;
    const yL = yR + RH * (1 - lw / 2 / half) - 0.05;
    b.box(lw, 1.15, D - 2.2, P.castIron, { at: [0, yL, 0] });
    for (const s of [1, -1] as const) {
      for (const z of spread(8, -D / 2 + 1.2, D / 2 - 1.2)) b.panel(1.4, 0.75, tint(P.slate, 0.1), { at: [s * (lw / 2), yL + 0.2, z], facing: s > 0 ? '+x' : '-x', depth: 0.06 });
    }
    b.gable(lw, D - 2.2, 0.75, P.zinc, { at: [0, yL + 1.15, 0], ridge: 'z', overhang: 0.3 });

    // the two screen fronts: the main front to the square (+z) and a smaller back entrance (-z)
    for (const s of [1, -1] as const) {
      const main = s > 0;
      b.group({ at: [0, 0, s * (D / 2 - 0.35)], rotY: main ? 0 : Math.PI }, () => {
        const T = 0.7;
        const apex = EH + RH + 0.9;
        const archR = main ? 2.4 : 1.8;
        const springY = main ? 4.0 : 3.4;
        // the gable wall, pierced by the great arch
        const arch: [number, number][] = [];
        for (let i = 0; i <= 16; i++) {
          const a = Math.PI - (i / 16) * Math.PI;
          arch.push([Math.cos(a) * archR, springY + Math.sin(a) * archR]);
        }
        b.extrude(
          [[-W / 2, 0], [-archR, 0], ...arch, [archR, 0], [W / 2, 0], [W / 2, EH + 0.6], [0, apex], [-W / 2, EH + 0.6]],
          T,
          red,
        );
        const zf = T / 2;
        // polychrome bands, broken by the openings
        for (const [y, c, h] of [
          [1.3, yellow, 0.3],
          [2.9, blue, 0.22],
          [EH - 0.4, yellow, 0.3],
        ] as [number, number, number][]) {
          for (const sx of [-1, 1]) {
            const x0 = archR + 0.6;
            const x1 = W / 2;
            b.box(x1 - x0, h, 0.08, c, { at: [sx * (x0 + x1) / 2, y, zf] });
          }
        }
        // coping and corner piers with pyramid caps
        const sl = Math.atan2(apex - EH - 0.6, W / 2);
        for (const sx of [-1, 1]) {
          b.group({ at: [sx * W / 4, (EH + 0.6 + apex) / 2 - 0.06, 0], rot: [0, 0, -sx * sl] }, () =>
            b.box(Math.hypot(W / 2, apex - EH - 0.6) + 0.2, 0.25, T + 0.2, stone),
          );
          b.box(1.1, EH + 1.6, 1.1, red, { at: [sx * (W / 2 - 0.3), 0, 0] });
          b.box(1.2, 0.3, 1.2, stone, { at: [sx * (W / 2 - 0.3), EH + 1.6, 0] });
          b.pyramid(1.1, 1.1, 1.3, P.slate, { at: [sx * (W / 2 - 0.3), EH + 1.9, 0] });
          for (const y of [1.3, EH - 0.4]) b.box(1.16, 0.3, 1.16, yellow, { at: [sx * (W / 2 - 0.3), y, 0] });
        }
        b.box(1.4, 0.4, T + 0.25, stone, { at: [0, apex - 0.1, 0] });
        b.cone(0.35, 0.9, stone, { at: [0, apex + 0.3, 0], segs: 4 });

        // the great arch: striped voussoirs, iron gates and a fanlight
        voussoirs(b, archR, springY, [stone, red, stone, blue], main ? 17 : 13, zf);
        b.box(2 * archR + 1.2, 0.3, 0.14, stone, { at: [0, springY - 0.3, zf] }); // impost band
        b.panel(2 * archR - 0.1, springY, P.windowDark, { at: [0, 0.5, -0.1], depth: 0.04 });
        for (const x of linspace(main ? 11 : 9, -archR + 0.1, archR - 0.1)) b.box(0.05, springY - 0.6, 0.05, iron, { at: [x, 0.5, zf - 0.1] });
        b.box(2 * archR, 0.1, 0.08, iron, { at: [0, springY - 0.15, zf - 0.1] });
        b.box(2 * archR, 0.08, 0.08, iron, { at: [0, 1.3, zf - 0.1] });
        b.panel(2 * archR - 0.1, archR, P.glassDark, { at: [0, springY, -0.1], shape: 'round', depth: 0.04 });
        for (let i = 1; i < 6; i++) {
          const a = (i / 6) * Math.PI;
          beam(b, [0, springY, zf - 0.1], [Math.cos(a) * archR, springY + Math.sin(a) * archR, zf - 0.1], 0.06, iron);
        }

        // flanking arched windows and a clock or rose window in the gable
        for (const sx of [-1, 1]) {
          for (const x of main ? [5.0, 7.6] : [5.6]) {
            b.panel(1.8, 3.9, yellow, { at: [sx * x, 1.6, zf], shape: 'round', depth: 0.05 });
            b.window(1.4, 3.6, { at: [sx * x, 1.7, zf], shape: 'round', frame: iron, bars: [2, 4], border: 0.06 });
          }
        }
        if (main) {
          b.panel(2.4, 2.4, stone, { at: [0, EH + 1.6, zf], shape: 'circle', depth: 0.08 });
          b.panel(2.0, 2.0, P.white, { at: [0, EH + 1.8, zf], shape: 'circle', depth: 0.1 });
          b.panel(0.08, 0.8, P.black, { at: [0, EH + 2.8, zf + 0.05], depth: 0.08 });
          b.panel(0.6, 0.08, P.black, { at: [0.27, EH + 2.8, zf + 0.05], depth: 0.08 });
          b.panel(5.6, 0.7, stone, { at: [0, springY + archR + 0.75, zf], depth: 0.08 }); // name panel
          b.panel(4.8, 0.3, tint(stone, -0.25), { at: [0, springY + archR + 0.95, zf], depth: 0.1 });
        } else {
          b.window(1.8, 1.8, { at: [0, EH + 1.1, zf], shape: 'circle', frame: stone, bars: [2, 2] });
        }
      });
    }

    // stalls glimpsed inside through the glass
    for (const x of [-5.5, -2, 2, 5.5]) {
      b.box(2.2, 0.9, D - 5, tint(P.pine, -0.05), { at: [x, 0.5, -0.5] });
      goods(b, D - 6, [x, 1.4, -0.5], Math.PI / 2, ['fruit', 'basket', 'cloth']);
    }
  },
};
