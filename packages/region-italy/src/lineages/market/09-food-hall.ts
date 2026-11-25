import { P, tint, type BuildingDef } from '@ah/kit';
import { COUNTERS, concreteMarket, forecourtLamp, goods, marketCounter } from './shared';

export const foodHall: BuildingDef = {
  id: 'food-hall',
  name: 'Covered market restored as a food hall',
  style: 'Rationalist hall of 1936, contemporary reuse',
  date: '1936; reopened 2014',
  summary:
    'Supermarkets emptied the covered market, but the town kept the hall of 1936 instead of pulling it down: its parabolic concrete shell, ribs, glass-block ends and clock tower are repaired and cleaned, not replaced. ' +
    'Butchers, greengrocers and cheesemongers still trade on the ground floor, at the concrete and marble counters of 1936. Under the high middle of the vault a new mezzanine of steel and glass holds counters selling food to eat on the spot, and part of the glass block at the front has given way to clear glazing so the life inside can be seen from the square. ' +
    'It is a typical recent Italian project: not a new building, but a new use inserted into an old one.',
  materials: ['reinforced concrete (repaired and cleaned)', 'glass block', 'travertine', 'steel and glass (new glazing and mezzanine)', 'oak flooring'],
  lookFor: [
    { label: 'The 1936 shell, kept', note: 'The parabolic concrete arches and thin shell between them are the original structure, repaired rather than rebuilt.', at: [6.4, 7.6, 7.6] },
    { label: 'New glazing', note: 'The middle of the glass-block front has been replaced by clear glass in a slender steel grid.', at: [-3.0, 6.6, 9.2] },
    { label: 'New mezzanine', note: 'A steel deck with a glass balustrade, set under the highest part of the vault and full of tables.', at: [0, 5.9, 3.6] },
    { label: 'Steel stair', note: 'A light new stair leads up from the market floor, kept clear of the old structure.', at: [-4.2, 2.6, 5.4] },
    { label: 'Clock tower', note: 'The travertine tower of 1936 still keeps the market’s time.', at: [11.6, 12.6, 9.0] },
  ],
  modelledOn:
    'The idea of reusing a market hall this way follows the Mercato Centrale in Florence, an iron hall of 1874 by Giuseppe Mengoni whose upper floor (added in a late twentieth-century restoration) reopened as a food hall in 2014; the building shown here is the concrete market hall of the 1930s',
  influences: ['rationalism', 'rossi-city'],
  build(b) {
    concreteMarket(b, true);
    const y0 = 0.28;

    // ---- the new mezzanine under the crown of the vault (the shell is over 8 m high for |x| < 5)
    const yM = y0 + 4.5;
    const mx = 4.6; // half width
    const z0 = -7.6;
    const z1 = 3.4;
    const mz = (z0 + z1) / 2;
    b.box(2 * mx, 0.3, z1 - z0, tint(P.steel, -0.12), { at: [0, yM, mz] });
    b.box(2 * mx, 0.06, z1 - z0, P.oak, { at: [0, yM + 0.3, mz] });
    b.deck(2 * mx, z1 - z0, yM + 0.36, { at: [0, 0, mz] });
    for (const x of [-mx + 0.3, 0, mx - 0.3]) {
      for (const z of [z1 - 0.3, -2.0]) {
        b.cyl(0.11, yM - y0, P.steel, { at: [x, y0, z], segs: 6 });
        b.collider(0.3, 0.3, { at: [x, 0, z] });
      }
    }
    // glass balustrade along the front and the two sides, with a steel handrail
    b.box(2 * mx, 1.05, 0.05, P.glass, { at: [0, yM + 0.36, z1 - 0.03], mat: 'glass' });
    b.box(2 * mx, 0.06, 0.1, P.steel, { at: [0, yM + 1.41, z1 - 0.03] });
    for (const s of [-1, 1]) {
      b.box(0.05, 1.05, z1 - z0, P.glass, { at: [s * (mx - 0.03), yM + 0.36, mz], mat: 'glass' });
      b.box(0.1, 0.06, z1 - z0, P.steel, { at: [s * (mx - 0.03), yM + 1.41, mz] });
    }
    // the steel stair, rising from the front of the hall to the front edge of the deck
    const sx0 = -mx + 0.75;
    for (let i = 0; i < 15; i++) b.box(1.3, 0.05, 0.3, P.steel, { at: [sx0, y0 + 0.3 * (i + 1), z1 + 4.5 - i * 0.3] });
    for (const dx of [-0.7, 0.7]) b.beam([sx0 + dx, y0, z1 + 4.7], [sx0 + dx, yM + 0.3, z1 + 0.1], 0.08, 0.3, P.steel);
    b.collider(1.5, 4.6, { at: [sx0, 0, z1 + 2.4] });
    // tables and stools on the deck, food counters with signs along the back
    for (const x of [-2.6, 0.2, 3.0]) {
      for (const z of [1.8, -1.0, -3.8]) {
        b.cyl(0.42, 0.05, P.white, { at: [x, yM + 1.08, z], segs: 8 });
        b.cyl(0.05, 0.72, P.timberBlack, { at: [x, yM + 0.36, z], segs: 4 });
        for (const dx of [-0.7, 0.7]) b.cyl(0.18, 0.6, b.pick([P.cladYellow, P.cladRed, P.timberBlack]), { at: [x + dx, yM + 0.36, z], segs: 6 });
      }
    }
    for (const x of [-2.8, 0.2, 3.2]) {
      b.box(2.6, 1.1, 0.9, P.timberBlack, { at: [x, yM + 0.36, z0 + 0.7] });
      b.box(2.4, 0.5, 0.08, b.pick([P.cladYellow, P.cladRed, P.cladGreen, P.white]), { at: [x, yM + 2.1, z0 + 0.4] });
    }

    // ---- the market below: the old counters of 1936 in the side aisles, new ones under the deck
    for (const [x, z] of COUNTERS) {
      marketCounter(b, x, z);
      goods(b, 3.2, [x, 1.18, z], Math.PI / 2, b.pick([['fruit', 'basket'], ['fish'], ['cheese', 'pot'], ['basket', 'sack']] as const).slice());
    }
    forecourtLamp(b);
    for (const z of [-5.6, -2.0]) {
      b.box(3.6, 0.9, 1.0, P.cladWhite, { at: [0, y0, z] });
      b.box(3.7, 0.05, 1.1, P.marble, { at: [0, y0 + 0.9, z] });
      goods(b, 3.2, [0, y0 + 0.95, z], 0, ['cheese', 'pot', 'basket']);
      b.collider(3.6, 1.0, { at: [0, 0, z] });
    }

    // ---- outside: café tables under umbrellas, cycle stands, planters
    for (const [x, z] of [
      [-11.6, 5.6],
      [-11.6, 1.6],
      [-11.6, -2.4],
      [11.6, 2.4],
      [11.6, -1.8],
    ] as [number, number][]) {
      b.cyl(0.4, 0.04, P.white, { at: [x, 0.78, z], segs: 8 });
      b.cyl(0.04, 0.7, P.timberBlack, { at: [x, 0.08, z], segs: 4 });
      b.cyl(0.04, 2.4, P.timberBlack, { at: [x, 0.08, z], segs: 4 });
      b.cone(1.25, 0.45, P.cream, { at: [x, 2.1, z], segs: 8 });
    }
    // sheffield-type hoops of steel tube in front, two bicycles locked to them
    for (let i = 0; i < 4; i++) {
      const x = -9.6 + i * 1.0;
      b.beam([x, 0.08, 9.8], [x, 0.85, 9.8], 0.05, 0.05, P.steel);
      b.beam([x, 0.85, 9.8], [x, 0.85, 10.5], 0.05, 0.05, P.steel);
      b.beam([x, 0.85, 10.5], [x, 0.08, 10.5], 0.05, 0.05, P.steel);
    }
    for (const x of [-9.1, -7.1]) {
      for (const dz of [-0.45, 0.45]) b.cyl(0.33, 0.04, P.timberBlack, { at: [x - 0.02, 0.41, 10.15 + dz], rot: [0, 0, Math.PI / 2], segs: 10 });
      b.beam([x, 0.55, 9.7], [x, 0.85, 10.5], 0.04, 0.04, P.doorRed);
    }
    for (const x of [6.2, 9.0]) {
      b.box(1.6, 0.5, 0.6, P.concreteDark, { at: [x, 0.08, 10.5] });
      b.tree(1.6, { at: [x, 0.58, 10.5], kind: 'olive' });
    }
  },
};
