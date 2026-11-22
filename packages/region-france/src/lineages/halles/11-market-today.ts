import { P, lamp, tint, type BuildingDef } from '@ah/kit';
import { CM, concreteMarket, nave, paving } from './shared';

export const marketToday: BuildingDef = {
  id: 'market-today',
  name: 'The concrete market restored',
  style: 'Reconstruction concrete, restored',
  date: '1929; reopened 2012',
  summary:
    'Supermarkets on the ring road emptied the covered market, and halls like this one were closed and nearly demolished; instead it was listed as a historic monument and restored. ' +
    'The thin vault was repaired and cleaned, its glazing renewed, and the hall reopened as a food market, with the square around it paved and planted for the market to spill out on market days. ' +
    'It is the same building as in 1929: the change is in how the town values it. The Halles du Boulingrin at Reims, closed in 1988 and listed in 1990, reopened in this way in 2012.',
  materials: ['reinforced concrete, repaired and cleaned', 'new glazing', 'steel', 'stone paving'],
  lookFor: [
    { label: 'The 1929 vault, kept', note: 'The shell and its stiffening arches are the original structure, repaired rather than replaced.', at: [-3.4, 11.4, 6.0] },
    { label: 'Renewed glazing', note: 'Clear new glass in the bands of the vault and the ends lets in more light than ever.', at: [0, 8.6, 8.8] },
    { label: 'Market square', note: 'The streets round the hall are paved as a square, with trees and café tables, for markets held outside as well as in.', at: [-11.4, 1.0, 9.6] },
    { label: 'Shops reopened', note: 'The side shops trade again under freshly painted fascias.', at: [10.4, 3.2, 2.8] },
  ],
  modelledOn: 'The Halles du Boulingrin, Reims, restored and reopened in 2012',
  influences: ['reinforced-concrete'],
  build(b) {
    const open = b.cutaway;
    paving(b, 25.8, 21.8, tint(P.paving, 0.05), 0.08, [0, 0, 0], 14);
    b.box(2 * CM.XS + 1.4, 0.1, 2 * CM.Z + 3.4, tint(P.pierreBlonde, -0.04), { at: [0, 0.0, 0] });
    concreteMarket(b, true, open);
    nave(b, true);

    // ---- the square: trees in the corners, café tables, a few stalls outside, bicycles, new lamps
    for (const [x, z] of [[-12.0, -9.6], [12.0, -9.6], [-12.0, 6.6], [12.0, 6.6], [-12.0, -1.6], [12.0, -1.6]] as [number, number][]) {
      b.cyl(0.6, 0.12, P.castIron, { at: [x, 0.08, z], segs: 8 });
      b.tree(5.2, { at: [x, 0.1, z], kind: 'round' });
    }
    for (const [x, z] of [[-11.0, 10.2], [-9.4, 10.4], [-11.2, 8.8]] as [number, number][]) {
      b.cyl(0.35, 0.04, P.white, { at: [x, 0.78, z], segs: 8 });
      b.cyl(0.04, 0.7, P.timberBlack, { at: [x, 0.08, z], segs: 4 });
      for (const dx of [-0.55, 0.55]) b.box(0.4, 0.45, 0.4, P.cladRed, { at: [x + dx, 0.08, z] });
    }
    b.cyl(0.04, 2.5, P.timberBlack, { at: [-10.3, 0.08, 9.5], segs: 4 });
    b.cone(1.6, 0.5, P.cream, { at: [-10.3, 2.2, 9.5], segs: 8 });
    // a weekend stall under a white awning by the side door
    b.group({ at: [9.2, 0.08, 10.2], rotY: 0 }, () => {
      b.box(2.4, 0.85, 0.9, P.cladWhite);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.05, 2.3, 0.05, P.steel, { at: [sx * 1.25, 0, sz * 0.6] });
      b.box(2.7, 0.05, 1.5, P.white, { at: [0, 2.3, 0] });
      for (let k = 0; k < 4; k++) b.blob(0.18, b.pick([P.doorRed, P.leaf, P.cladYellow]), { at: [-0.9 + k * 0.6, 1.0, 0], stretch: [1.1, 0.6, 1], detail: 0 });
    });
    for (let i = 0; i < 4; i++) {
      const x = 4.0 + i * 0.9;
      b.beam([x, 0.08, 10.6], [x, 0.8, 10.6], 0.05, 0.05, P.steel);
      b.beam([x, 0.8, 10.6], [x + 0.5, 0.8, 10.6], 0.05, 0.05, P.steel);
      b.beam([x + 0.5, 0.8, 10.6], [x + 0.5, 0.08, 10.6], 0.05, 0.05, P.steel);
    }
    for (const [x, z] of [[-6.8, 10.6], [6.8, -10.6]] as [number, number][]) lamp(b, 'modern', [x, 0.08, z], z > 0 ? Math.PI : 0);
  },
};
