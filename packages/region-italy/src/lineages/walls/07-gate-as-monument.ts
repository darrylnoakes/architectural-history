import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF } from './shared';
import { GATE, gateBlock } from './06-bastion-gate';

/** A cast-iron gas lamp on a fluted post. */
function lamp(b: Builder, x: number, z: number): void {
  b.group({ at: [x, 0, z] }, () => {
    b.cyl(0.22, 0.5, P.castIron, { segs: 8 });
    b.cyl(0.08, 3.4, P.castIron, { at: [0, 0.5, 0], segs: 6, rTop: 0.06 });
    b.cyl(0.18, 0.12, P.castIron, { at: [0, 3.85, 0], segs: 6 });
    b.cyl(0.2, 0.55, P.windowLit, { at: [0, 3.97, 0], segs: 6, rTop: 0.28, mat: 'glass' });
    b.cone(0.32, 0.3, P.castIron, { at: [0, 4.52, 0], segs: 6 });
  });
}

/** One of the pair of little neoclassical toll-houses of the dazio. */
function tollHouse(b: Builder, x: number, z: number, facing: 1 | -1, o: { render: number; stone: number }): void {
  const w = 4.6;
  const d = 3.8;
  const h = 3.9;
  b.group({ at: [x, 0, z], rotY: facing > 0 ? 0 : Math.PI }, () => {
    b.box(w + 0.3, 0.45, d + 0.3, o.stone);
    b.box(w, h, d, o.render, { at: [0, 0.45, 0] });
    // corner pilasters, entablature, low hipped roof
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.45, h, 0.45, o.stone, { at: [sx * (w / 2 - 0.15), 0.45, sz * (d / 2 - 0.15)] });
    b.box(w + 0.4, 0.5, d + 0.4, o.stone, { at: [0, h + 0.45, 0] });
    b.hip(w + 0.8, d + 0.8, 1.0, P.coppi, { at: [0, h + 0.95, 0], overhang: 0.1 });
    // a little pediment over the door on the road side, and the sign
    b.panel(1.2, 2.4, P.doorGreen, { at: [0, 0.45, d / 2], shape: 'round' });
    b.panel(1.6, 0.22, o.stone, { at: [0, 3.0, d / 2], depth: 0.12 });
    b.extrude([[-1.0, 0], [1.0, 0], [0, 0.55]], 0.25, o.stone, { at: [0, 3.22, d / 2 + 0.1] });
    b.panel(2.4, 0.45, P.white, { at: [0, h - 0.2, d / 2], depth: 0.04 });
    b.panel(1.8, 0.12, P.black, { at: [0, h - 0.04, d / 2 + 0.03], depth: 0.02 }); // the word DAZIO
    for (const sx of [-1, 1]) {
      b.window(0.9, 1.7, { at: [sx * 1.55, 1.3, d / 2], frame: o.stone, bars: [2, 3] });
      b.panel(0.42, 1.7, P.doorGreen, { at: [sx * 1.55 + sx * 0.68, 1.3, d / 2], depth: 0.04 }); // louvred shutters
      b.window(0.9, 1.7, { at: [sx * (w / 2), 1.3, 0], facing: sx > 0 ? '+x' : '-x', frame: o.stone, bars: [2, 3] });
    }
    b.window(0.9, 1.7, { at: [0, 1.3, -d / 2], facing: '-z', frame: o.stone, bars: [2, 3] });
    b.chimney(0.5, 1.2, 0.5, o.render, { at: [1.2, h + 1.2, -0.6], pots: 1 });
  });
}

/** A plane tree of the new boulevard. */
function plane(b: Builder, x: number, z: number, h: number): void {
  b.tree(h, { kind: 'round', at: [x, 0, z], color: mix(P.leaf, P.leafDark, 0.3) });
}

export const gateAsMonument: BuildingDef = {
  id: 'gate-as-monument',
  name: 'The gate alone in a square',
  style: 'Nineteenth-century town planning',
  date: '1860s to 1880s',
  summary:
    'After unification the walls were no longer needed for defence and stood in the way of growth, traffic and fresh air. Town after town pulled them down and laid a ring of tree-lined boulevards on their line, as Giuseppe Poggi did in Florence from 1865, when the city was briefly the capital of Italy. ' +
    'The old gates were kept as monuments, standing alone in new squares with the cut ends of the wall faced off. The town still taxed food and goods coming in (the dazio, abolished only in 1930), so the line of the vanished wall became a customs line, with a pair of little toll-houses at each gate.',
  materials: ['the 16th-century stone gate', 'stucco and stone for the toll-houses', 'stone setts and macadam', 'cast iron'],
  modelledOn: 'The gates kept by Giuseppe Poggi in Florence’s new squares (Porta San Gallo, Porta alla Croce) and the toll-houses at Milan’s Porta Venezia',
  lookFor: [
    { label: 'Freestanding gate', note: 'The walls have gone and the gate stands alone, kept as a monument to the town’s history and its new square.', at: [-GATE.w / 2 - 0.4, 5, (GATE.front + GATE.back) / 2] },
    { label: 'Toll-house', note: 'Officials of the dazio checked carts here and charged duty on wine, meat, flour and other goods entering the town.', at: [10.6, 4.6, -1] },
    { label: 'Boulevard (viale)', note: 'A wide avenue planted with plane trees laid out on the line of the demolished walls, for carriages and for walking.', at: [-12, 1.2, -6.3] },
    { label: 'Gas lamps', note: 'Cast-iron lamps lit by town gas, part of the modern equipment of the new quarters.', at: [4.4, 4.6, 2.6] },
  ],
  build(b) {
    const stone = mix(P.travertine, P.tufa, 0.35);
    const sett = mix(P.cobble, P.paving, 0.4);
    const macadam = mix(P.gravel, P.tarmac, 0.25);

    // ---------------------------------------------------------------- the square and the boulevard
    b.box(HALF * 2, 0.06, 16, sett, { jitter: false });
    // the boulevard runs along X where the walls stood: a carriage way and two tree-lined walks
    b.box(HALF * 2, 0.08, 4.4, macadam, { at: [0, 0, 3.5], jitter: false });
    for (const z of [1.3, 5.7]) b.box(HALF * 2, 0.16, 0.3, P.limestone, { at: [0, 0, z], jitter: false });
    // the old road through the gate, in stone setts with wheel-strips of granite
    b.sym((s) => b.box(0.6, 0.09, 16, P.granite, { at: [s * 0.8, 0, 0], jitter: false }));
    // young plane trees, newly planted along the walks
    for (const x of [-13, -9.5, -6, 6, 9.5, 13]) plane(b, x, 6.5, 4.6);
    for (const x of [-13.4, -7.6, 7.6, 13.4]) plane(b, x, -6.6, 4.4);

    // ---------------------------------------------------------------- the gate, kept
    gateBlock(b, stone);
    // where the wall was cut off, a fresh band of stone at the base of each side
    b.sym((s) => b.box(0.3, 0.7, GATE.front - GATE.back + 0.6, tint(stone, 0.06), { at: [s * (GATE.w / 2 + 0.3), 0, (GATE.front + GATE.back) / 2] }));

    // ---------------------------------------------------------------- the toll-houses and the customs line
    const render = mix(P.intonacoCream, P.intonacoOchre, 0.35);
    b.sym((s) => {
      tollHouse(b, s * 10.6, -1.4, 1, { render, stone: P.limestone });
      // iron railings from the toll-house to the gate, with a swing barrier across the boulevard walk
      const x0 = GATE.w / 2 + 0.6;
      const x1 = 10.6 - 2.5;
      b.box(x1 - x0, 0.25, 0.3, P.limestone, { at: [s * (x0 + x1) / 2, 0, -3.6] });
      for (let x = x0; x <= x1 + 0.01; x += 0.25) b.box(0.04, 1.5, 0.04, P.castIron, { at: [s * x, 0.25, -3.6], jitter: false });
      b.box(x1 - x0, 0.06, 0.06, P.castIron, { at: [s * (x0 + x1) / 2, 1.65, -3.6], jitter: false });
      lamp(b, s * 4.4, 2.6);
      lamp(b, s * 4.4, -8.0 + 0.6);
    });
    // ---------------------------------------------------------------- walking
    b.sym((s) =>
      b.collider((GATE.w - GATE.ow) / 2 + 0.6, GATE.front - GATE.back + 0.8, { at: [s * ((GATE.w + GATE.ow) / 4 + 0.3), 0, (GATE.front + GATE.back) / 2] }),
    );
    b.sym((s) => b.collider(5.0, 4.2, { at: [s * 10.6, 0, -1.4] }));
  },
};
