import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { barrel, beast, goods, pot, sack, trestle } from './shared';

/**
 * A fair booth (loge): a light timber frame with plank back and sides under a shingled roof, its front
 * closed by two shutters, the lower let down on legs as a counter, the upper propped up as an awning.
 * Front faces local +Z.
 */
function booth(b: Builder, w: number, at: [number, number, number], rotY: number, kinds: Parameters<typeof goods>[4], plank: number): void {
  const d = 2.0;
  const h = 2.2;
  b.group({ at, rotY }, () => {
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) b.box(0.14, h, 0.14, P.oakDark, { at: [x, 0, z] });
    // plank back and sides
    b.box(w, h, 0.06, plank, { at: [0, 0, -d / 2] });
    for (const s of [-1, 1]) b.box(0.06, h, d, plank, { at: [s * w / 2, 0, 0] });
    for (let x = -w / 2 + 0.3; x < w / 2; x += 0.3) b.box(0.02, h, 0.02, tint(plank, -0.12), { at: [x, 0, -d / 2 - 0.035], jitter: false });
    // front: the lower shutter let down as a counter, the upper propped up as an awning
    b.box(w - 0.1, 0.9, 0.06, plank, { at: [0, 0, d / 2] });
    b.box(w - 0.1, 0.06, 0.7, tint(plank, 0.05), { at: [0, 0.9, d / 2 + 0.32] });
    goods(b, w - 0.5, [0, 0.96, d / 2 + 0.3], 0, kinds);
    b.box(w - 0.1, 0.06, 0.9, tint(plank, 0.03), { at: [0, h - 0.1, d / 2 + 0.38], rot: [-0.32, 0, 0] });
    for (const s of [-1, 1]) b.beam([s * (w / 2 - 0.2), 0.95, d / 2 + 0.75], [s * (w / 2 - 0.2), h + 0.05, d / 2 + 0.78], 0.05, 0.05, P.oak);
    // shingled gable roof, ridge along the row
    b.gable(w + 0.3, d + 0.2, 1.1, P.shingle, { at: [0, h, 0], overhang: 0.2, wall: plank, thick: 0.1 });
  });
}

/** A ridge tent of cloth on two poles and a ridge pole, its sides pegged out; open at the front (+Z). */
function tent(b: Builder, w: number, d: number, at: [number, number, number], rotY: number, cloth: number, stripe: number): void {
  b.group({ at, rotY }, () => {
    const h = 2.4;
    for (const z of [-d / 2, d / 2]) b.cyl(0.05, h + 0.25, P.oak, { at: [0, 0, z], segs: 5 });
    b.cyl(0.03, 0.6, P.oak, { at: [0, h + 0.25, d / 2], segs: 4 });
    b.box(0.25, 0.18, 0.02, stripe, { at: [0.13, h + 0.62, d / 2] }); // pennant
    const n = Math.max(3, Math.round(d / 0.6));
    const ang = Math.atan2(h - 0.25, w / 2);
    const len = Math.hypot(w / 2, h - 0.25);
    for (const s of [-1, 1]) {
      for (let i = 0; i < n; i++) {
        const z = -d / 2 + ((i + 0.5) * d) / n;
        b.box(len, 0.03, d / n, i % 2 ? stripe : cloth, { at: [s * w / 4, 0.25 + (h - 0.25) / 2 - 0.02, z], rot: [0, 0, -s * ang], jitter: false });
      }
    }
    // the back closed by a triangle of cloth
    b.extrude([[-w / 2, 0.25], [w / 2, 0.25], [0, h]], 0.03, cloth, { at: [0, 0, -d / 2] });
  });
}

export const fair: BuildingDef = {
  id: 'fair',
  name: 'The abbey’s fair',
  style: 'Merovingian to Capetian, temporary timber',
  date: 'c. 640 to 1290',
  summary:
    'With the Roman market gone, trade comes back as a fair: once a year, on the feast of the abbey’s saint, the monks hold the right to a market on open ground and take a toll on everything sold. ' +
    'For a few weeks rows of timber booths and cloth tents go up round a cross that marks the fair’s peace, selling wine, honey, cloth, madder for dye and horses, and then they are taken down again. ' +
    'King Dagobert is said to have granted the abbey of Saint-Denis its fair in the 630s; in the twelfth and thirteenth centuries the great fairs of Champagne at Troyes, Provins, Lagny and Bar-sur-Aube were where Flemish cloth met Italian merchants and bankers.',
  materials: ['oak and pine boards', 'shingles', 'linen and wool cloth'],
  lookFor: [
    { label: 'Fair cross', note: 'The cross in the middle stands for the peace of the fair: crimes committed during it were judged by the abbey’s court.', at: [0, 4.6, 0] },
    { label: 'Booths (loges)', note: 'Each booth’s lower shutter folds down as a counter and the upper one props up as an awning; at the end of the fair the whole thing is taken apart.', at: [-2.6, 2.4, -7.3] },
    { label: 'Tents', note: 'Travelling merchants sell from cloth tents pegged out on poles.', at: [8.6, 2.6, 5.2] },
    { label: 'Wine barrels', note: 'The fairs of Saint-Denis were known above all for wine; the barrel, an invention of the Gauls, had long replaced the Roman amphora.', at: [3.4, 1.0, -3.4] },
    { label: 'Toll table', note: 'At the entrance the abbey’s agent takes the toll (tonlieu) on goods coming in, the abbey’s main profit from the fair.', at: [-1.6, 1.3, 9.2] },
  ],
  modelledOn: 'The fair of Saint-Denis, which by tradition King Dagobert granted to the abbey (later the Lendit fair), and the fairs of Champagne; the booths and tents are generic',
  build(b) {
    b.noCollide();
    // a trodden meadow, worn bare along the lanes between the booths
    b.box(25.4, 0.04, 21.4, P.grassDry, { jitter: false });
    b.box(17.0, 0.02, 13.0, tint(P.earth, 0.06), { at: [0, 0.04, 0], jitter: false });
    b.box(3.4, 0.02, 9.0, tint(P.earth, 0.06), { at: [0, 0.04, 6.5], jitter: false });
    for (let i = 0; i < 8; i++) b.box(b.range(0.8, 2), 0.012, b.range(0.6, 1.4), tint(P.earth, b.range(-0.08, 0.02)), { at: [b.range(-8, 8), 0.06, b.range(-6, 6)], rotY: b.range(0, 3), jitter: false });

    // ---- the cross on its stepped base
    b.box(2.4, 0.3, 2.4, P.pierreBlonde);
    b.box(1.6, 0.3, 1.6, tint(P.pierreBlonde, -0.03), { at: [0, 0.3, 0] });
    b.box(0.9, 0.5, 0.9, P.pierreBlonde, { at: [0, 0.6, 0] });
    b.box(0.26, 4.2, 0.26, P.oak, { at: [0, 1.1, 0] });
    b.box(1.6, 0.24, 0.24, P.oak, { at: [0, 4.0, 0] });

    // ---- the rows of booths round the open square
    const planks = [P.pine, tint(P.pine, -0.06), P.larch, P.oakSilver];
    const kindsList: Parameters<typeof goods>[4][] = [['cloth', 'cloth'], ['pot', 'basket'], ['cheese', 'basket'], ['sack', 'basket'], ['fruit', 'basket'], ['cloth', 'pot']];
    for (const x of [-7.8, -2.6, 2.6, 7.8]) booth(b, 2.6, [x, 0, -8.6], 0, b.pick(kindsList), b.pick(planks));
    for (const x of [-7.8, -4.6, 4.6, 7.8]) booth(b, 2.6, [x, 0, 8.6], Math.PI, b.pick(kindsList), b.pick(planks));
    for (const s of [-1, 1]) for (const z of [-3.0, 0.4]) booth(b, 2.6, [s * 10.9, 0, z], -s * Math.PI / 2, b.pick(kindsList), b.pick(planks));

    // ---- tents of the travelling merchants
    tent(b, 2.6, 3.0, [9.4, 0, 5.0], -Math.PI / 2, P.cream, P.doorRed);
    tent(b, 2.4, 2.6, [-9.6, 0, 5.2], Math.PI / 2, P.cream, P.doorBlue);
    tent(b, 2.2, 2.4, [-10.6, 0, -8.4], Math.PI / 4, tint(P.cream, -0.05), P.ochreWash);
    trestle(b, 1.6, 0.7, [9.4, 0, 3.0], -Math.PI / 2);
    goods(b, 1.3, [9.4, 0.88, 3.0], -Math.PI / 2, ['cloth']);
    trestle(b, 1.6, 0.7, [-9.6, 0, 3.2], Math.PI / 2);
    goods(b, 1.3, [-9.6, 0.88, 3.2], Math.PI / 2, ['pot', 'basket']);

    // ---- the wine merchants' barrels, honey in pots, bales of wool
    for (let i = 0; i < 4; i++) barrel(b, [2.8 + (i % 2) * 0.7, 0, -3.8 + Math.floor(i / 2) * 0.7]);
    barrel(b, [4.6, 0, -2.4], true, 0.3);
    barrel(b, [4.4, 0.66, -2.4], true, 0.3);
    for (let i = 0; i < 5; i++) pot(b, [-4.2 + i * 0.35, 0, -3.6], 1.1, P.tileBrown);
    for (let i = 0; i < 3; i++) b.box(0.9, 0.6, 0.6, P.cream, { at: [-4.4 + i * 0.95, 0, 3.0], rotY: 0.1 * i });
    for (let i = 0; i < 4; i++) sack(b, [3.8 + (i % 2) * 0.5, 0, 3.0 + Math.floor(i / 2) * 0.5]);

    // ---- the toll table of the abbey's agent at the way in, a chest for the takings
    trestle(b, 1.8, 0.8, [-1.9, 0, 9.4]);
    b.box(0.5, 0.3, 0.3, P.oakDark, { at: [-2.3, 0.88, 9.4] });
    b.box(0.4, 0.02, 0.3, P.cream, { at: [-1.5, 0.88, 9.4] }); // the tally
    b.box(0.6, 0.45, 0.4, P.oakDark, { at: [-3.2, 0, 9.0] });
    b.box(0.62, 0.05, 0.42, P.iron, { at: [-3.2, 0.45, 9.0] });
    // a banner of the abbey on a tall pole
    b.cyl(0.05, 5.0, P.oak, { at: [2.0, 0, 9.6], segs: 5 });
    b.box(0.03, 1.4, 0.9, P.doorRed, { at: [2.0, 3.4, 9.1] });
    b.box(0.035, 0.2, 0.5, P.gold, { at: [2.0, 4.1, 9.1] });

    // ---- horse dealers: a rope corral and a cart
    for (const [x, z] of [[-7.6, -1.0], [-4.6, -1.0], [-4.6, 2.0], [-7.6, 2.0]] as [number, number][]) b.box(0.1, 1.1, 0.1, P.oakDark, { at: [x, 0, z] });
    for (const [x0, z0, x1, z1] of [[-7.6, -1.0, -4.6, -1.0], [-4.6, -1.0, -4.6, 2.0], [-7.6, 2.0, -7.6, -1.0]] as [number, number, number, number][]) b.beam([x0, 1.0, z0], [x1, 1.0, z1], 0.03, 0.03, P.cream);
    beast(b, [-6.6, 0, -0.2], 0.3, 'horse', P.oak);
    beast(b, [-5.6, 0, 1.0], 2.8, 'horse', tint(P.oakDark, 0.05));
    beast(b, [-6.8, 0, 1.4], 4.2, 'horse', tint(P.cream, -0.12));
    b.group({ at: [6.2, 0, 0.0], rotY: 1.2 }, () => {
      b.box(1.5, 0.12, 2.6, P.oak, { at: [0, 0.75, 0] });
      for (const s of [-1, 1]) {
        b.box(0.08, 0.4, 2.6, P.oak, { at: [s * 0.72, 0.87, 0] });
        b.cyl(0.6, 0.12, P.oakDark, { at: [s * 0.86, 0.6, 0], rot: [0, 0, Math.PI / 2], segs: 10 });
      }
      b.beam([0, 0.8, 1.3], [0, 0.4, 3.0], 0.1, 0.1, P.oak);
      for (let i = 0; i < 2; i++) barrel(b, [-0.35 + i * 0.7, 0.87, -0.5], true);
    });
  },
};
