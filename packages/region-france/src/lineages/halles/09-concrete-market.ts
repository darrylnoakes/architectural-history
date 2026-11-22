import { P, car, lamp, tint, type BuildingDef } from '@ah/kit';
import { CM, concreteMarket, goods, nave, paving, sack } from './shared';

export const concreteMarket1929: BuildingDef = {
  id: 'concrete-market',
  name: 'Concrete market hall',
  style: 'Reconstruction, engineered concrete',
  date: '1929',
  summary:
    'After the shelling of 1914 to 1918 the town rebuilds its market not in iron but in reinforced concrete, the material in which French engineers now led the world. ' +
    'The nave is covered by a single vault of concrete only a few centimetres thick, held in shape by arches that stand up out of its back, and lit through bands of glass let into the shell and a great glazed screen at each end. ' +
    'It is modelled on the Halles du Boulingrin at Reims, by the architect Émile Maigrot with Eugène Freyssinet as engineer (1927 to 1929), whose shell is about 7 cm thick and spans nearly 50 m; this one is a quarter of the size. ' +
    'Shops in low ranges down each side open onto the street.',
  materials: ['reinforced concrete', 'glass in concrete frames', 'steel doors and windows', 'terrazzo and marble'],
  lookFor: [
    { label: 'Thin concrete vault', note: 'The roof is a shell of concrete: thin, but strong because it is curved, like an eggshell.', at: [-3.4, 11.4, 6.0] },
    { label: 'Stiffening arches', note: 'Arches standing up out of the back of the shell stop it buckling, so the vault itself can be very thin.', at: [-5.6, 9.0, 8.4] },
    { label: 'Glazed bands', note: 'Strips of glass set into the shell run the length of the hall and light the stalls below.', at: [-2.6, 11.3, -2.0] },
    { label: 'Glazed end', note: 'Each end of the vault is filled with glass in a grid of slim concrete bars.', at: [0, 8.6, 8.8] },
    { label: 'Shops down the sides', note: 'Low flat-roofed ranges of shops line both sides and open onto the streets, so the hall earns rent all week.', at: [10.4, 2.2, -2.8] },
  ],
  modelledOn: 'The Halles du Boulingrin, Reims (Émile Maigrot, architect, and Eugène Freyssinet, engineer, 1927 to 1929), much reduced and simplified',
  influences: ['reinforced-concrete'],
  build(b) {
    const open = b.cutaway;
    paving(b, 25.8, 21.8, P.cobble, 0.08, [0, 0, 0], 8);
    b.box(2 * CM.XS + 1.4, 0.1, 2 * CM.Z + 3.4, P.paving, { at: [0, 0.0, 0] });
    concreteMarket(b, false, open);
    nave(b, false);

    // ---- outside: barrows of the traders who could not get a stall, a delivery van, lamps
    for (const [x, z, r] of [[-8.4, 10.0, 0.1], [7.6, 10.2, -0.2]] as [number, number, number][]) {
      b.group({ at: [x, 0.1, z], rotY: r }, () => {
        b.box(1.6, 0.1, 0.9, P.pine, { at: [0, 0.7, 0] });
        for (const sx of [-1, 1]) b.box(1.6, 0.25, 0.04, P.pine, { at: [0, 0.8, sx * 0.43] });
        b.cyl(0.4, 0.06, P.oakDark, { at: [0.3, 0.4, 0.5], rot: [Math.PI / 2, 0, 0], segs: 10 });
        b.cyl(0.4, 0.06, P.oakDark, { at: [0.3, 0.4, -0.44], rot: [Math.PI / 2, 0, 0], segs: 10 });
        b.box(0.06, 0.7, 0.06, P.oak, { at: [-0.7, 0, 0.3] });
        b.box(0.06, 0.7, 0.06, P.oak, { at: [-0.7, 0, -0.3] });
        goods(b, 1.3, [0, 0.8, 0], 0, ['fruit', 'basket']);
      });
    }
    car(b, 'thirties', P.doorGreen, [11.9, 0.1, -5.6], Math.PI);
    for (let i = 0; i < 4; i++) sack(b, [11.6 + (i % 2) * 0.5, 0.1, -2.6 + Math.floor(i / 2) * 0.5]);
    for (const [x, z] of [[-11.6, 10.2], [11.6, 10.2], [-11.6, -10.2]] as [number, number][]) lamp(b, 'gas', [x, 0.1, z], 0);
    b.box(1.2, 2.0, 0.12, tint(P.cream, -0.1), { at: [-11.8, 0.1, 3.0], rotY: Math.PI / 2 }); // a poster column's worth of bills
  },
};
