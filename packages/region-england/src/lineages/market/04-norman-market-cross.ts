import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { barrel, beam, goods, trestle } from './shared';

/** A permanent market booth: a small timber-framed stall under a steep thatch, open at the front. */
function booth(b: Builder, x: number, z: number, rotY: number, kinds: ('basket' | 'sack' | 'pot' | 'cloth' | 'fruit')[]): void {
  const W = 3.0;
  const D = 2.2;
  const H = 2.2;
  b.group({ at: [x, 0, z], rotY }, () => {
    // corner posts, sill and wall plate
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.16, H, 0.16, P.oak, { at: [sx * (W / 2 - 0.08), 0, sz * (D / 2 - 0.08)] });
    // back and side walls of wattle and daub
    b.box(W - 0.1, H, 0.12, P.daub, { at: [0, 0, -D / 2 + 0.08] });
    for (const sx of [-1, 1]) b.box(0.12, H, D - 0.2, P.daub, { at: [sx * (W / 2 - 0.08), 0, 0] });
    b.frame(W, H, P.oak, { at: [0, 0, -D / 2 + 0.02], facing: '-z', studs: 2, rails: 1 });
    b.box(W, 0.16, 0.16, P.oak, { at: [0, H - 0.16, D / 2 - 0.08] });
    // a hinged shutter let down as a counter
    b.box(W - 0.4, 0.08, 0.7, tint(P.oak, 0.06), { at: [0, 0.85, D / 2 + 0.25] });
    for (const sx of [-1, 1]) beam(b, [sx * 1.1, 0, D / 2 + 0.5], [sx * 1.1, 0.85, D / 2 + 0.5], 0.06, P.oakDark);
    goods(b, W - 0.7, [0, 0.93, D / 2 + 0.25], 0, kinds);
    // steep thatch, ridge along the stall
    b.gable(W, D, 1.9, P.thatch, { at: [0, H, 0], ridge: 'x', overhang: 0.35, thick: 0.35, wall: P.daub });
  });
}

export const normanMarketCross: BuildingDef = {
  id: 'norman-market-cross',
  name: 'Market cross with booths and stocks',
  style: 'Norman (Romanesque)',
  date: 'c. 1200',
  summary:
    'The lord of the manor has bought a royal charter for a weekly market, and a tall stone cross now marks the spot where tolls are paid and deals are struck. ' +
    'Stone is back for the first time since Rome, but only for the cross; the traders work from small thatched booths that have become permanent. ' +
    'The stocks stand alongside as a warning: the market court punished short weights and bad ale on the spot.',
  materials: ['limestone', 'oak', 'wattle and daub', 'straw thatch'],
  lookFor: [
    { label: 'Market cross', note: 'A tall tapering shaft on a socket stone, set on steps. It marked the market place and reminded traders to deal honestly.', at: [0, 7.6, 0.4] },
    { label: 'Calvary steps', note: 'The square stepped base. Traders sat on it, and proclamations were read from it.', at: [1.8, 0.6, 1.9] },
    { label: 'Socket stone', note: 'The heavy block the shaft is mortised into, often the only part of a medieval cross to survive today.', at: [0, 1.7, 0.55] },
    { label: 'Stocks', note: 'Wooden boards that locked an offender’s ankles in public view.', at: [5.4, 0.9, 2.4] },
    { label: 'Thatched booths', note: 'Small permanent stalls, the first step from a trestle on market day toward a real shop.', at: [-6.1, 3.2, -4.6] },
  ],
  influences: ['norman-romanesque'],
  build(b) {
    const stone = b.pick([P.limestone, P.limestoneWarm, P.ragstone]);
    // cobbled square around the cross
    b.group({ scale: [1.1, 1, 0.88] }, () => b.cyl(9.4, 0.04, mix(P.cobble, P.earth, 0.5), { segs: 18 }));

    // three square steps
    for (let i = 0; i < 3; i++) {
      const s = 4.2 - i * 1.1;
      b.box(s, 0.38, s, tint(stone, -0.03 + i * 0.02), { at: [0, 0.04 + i * 0.38, 0] });
    }
    // socket stone with chamfered top
    const yS = 0.04 + 3 * 0.38;
    b.box(1.1, 0.5, 1.1, stone, { at: [0, yS, 0] });
    b.pyramid(1.1, 1.1, 0.3, stone, { at: [0, yS + 0.5, 0] });
    // tall tapering shaft: square with chamfered corners (an octagon of unequal sides)
    const y0 = yS + 0.6;
    const sh = 5.6;
    b.cyl(0.3, sh, stone, { at: [0, y0, 0], rTop: 0.2, segs: 8, rotY: Math.PI / 8 });
    // a moulded collar and a simple cross head with rounded arm ends
    b.cyl(0.28, 0.18, tint(stone, -0.05), { at: [0, y0 + sh, 0], segs: 8, rotY: Math.PI / 8 });
    const yH = y0 + sh + 0.18;
    b.box(0.32, 1.25, 0.26, stone, { at: [0, yH, 0] });
    b.box(1.05, 0.3, 0.26, stone, { at: [0, yH + 0.55, 0] });
    for (const s of [-1, 1]) b.log(0.15, 0.26, stone, { at: [s * 0.52, yH + 0.55, 0], axis: 'z', segs: 8 });
    b.log(0.16, 0.26, stone, { at: [0, yH + 1.1, 0], axis: 'z', segs: 8 });
    b.collider(4.3, 4.3, { at: [0, 0, 0] });

    // thatched booths: a row at the back, two at the sides
    booth(b, -6.1, -5.6, 0, ['pot', 'pot', 'basket']);
    booth(b, -2.6, -6.3, 0, ['cloth', 'cloth', 'cloth']);
    booth(b, 2.6, -6.3, 0, ['sack', 'basket', 'sack']);
    booth(b, 6.1, -5.6, 0, ['fruit', 'basket', 'fruit']);
    booth(b, -8.3, 0.8, Math.PI / 2, ['basket', 'sack', 'basket']);
    if (b.variant % 2 === 0) booth(b, 8.3, -0.4, -Math.PI / 2, ['pot', 'cloth', 'pot']);
    for (const x of [-6.1, -2.6, 2.6, 6.1]) b.collider(3.4, 2.6, { at: [x, 0, x * x > 20 ? -5.6 : -6.3] });
    b.collider(2.6, 3.4, { at: [-8.3, 0, 0.8] });
    if (b.variant % 2 === 0) b.collider(2.6, 3.4, { at: [8.3, 0, -0.4] });

    // trestles on market day at the front
    trestle(b, 2.4, 0.8, [-4.6, 0, 4.6], 0.2);
    goods(b, 2, [-4.6, 0.88, 4.6], 0.2, ['fruit', 'basket', 'fruit']);
    barrel(b, [-2.6, 0, 5.4]);

    // the stocks: two posts, a sill and a pair of hinged boards with leg holes, and a bench
    b.group({ at: [5.4, 0, 3.6], rotY: -0.25 }, () => {
      const oak = P.oakDark;
      for (const s of [-1, 1]) b.box(0.2, 1.1, 0.2, oak, { at: [s * 1.0, 0, 0] });
      b.box(2.3, 0.14, 0.24, oak, { at: [0, 0.02, 0] });
      b.box(2.2, 0.28, 0.14, P.oak, { at: [0, 0.36, 0] });
      b.box(2.2, 0.28, 0.14, P.oak, { at: [0, 0.64, 0] });
      for (const x of [-0.6, -0.25, 0.25, 0.6]) b.panel(0.14, 0.14, P.timberBlack, { at: [x, 0.57, 0.07], facing: '+z', shape: 'circle', depth: 0.02 });
      b.box(2.3, 0.08, 0.36, P.oak, { at: [0, 0.4, -0.75] });
      for (const s of [-1, 1]) b.box(0.1, 0.4, 0.3, P.oak, { at: [s * 0.95, 0, -0.75] });
      // whipping post beside it
      b.box(0.22, 2.4, 0.22, oak, { at: [1.6, 0, -0.3] });
      b.box(0.4, 0.1, 0.12, P.iron, { at: [1.6, 1.7, -0.15] });
    });
  },
};
