import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import { COURT, PAL, PORTAL_X, TWR, column, kingMonument, lordsColliders, lordsCourt, palaceColliders, palazzoPubblico, pave } from './shared';

/** The new museum pavilion in zone C, over the excavated Roman portico. */
const MP = { x0: 9, x1: 21, z0: -14, z1: 3, h: 6.5 };

export const civicRestoration: BuildingDef = {
  id: 'civic-restoration',
  name: 'Restored palace and civic museum',
  style: 'Contemporary conservation',
  date: 'c. 2012',
  summary:
    'The medieval palace (old) is cleaned and repaired with lime mortars and matching brick, following the Italian principle that new work must be honest about being new and reversible. ' +
    'The council still meets in its hall, while the upper floors and the lord’s wing become the civic museum. A low pavilion of travertine and glass beside it (new) holds the ticket hall and shows, under a glass floor, the remains of the Roman forum found while digging its foundations; ' +
    'a glazed bridge links it to the palace. The cars are gone: the square is repaved in stone as a pedestrian zone.',
  materials: ['restored brick and travertine', 'structural glass', 'steel', 'travertine cladding'],
  lookFor: [
    { label: 'Glass link', note: 'A glazed bridge on a slim steel frame joins old to new without touching more of the medieval wall than it must.', at: [7, 8.4, -4.5] },
    { label: 'Museum pavilion', note: 'A low, plain box of travertine and glass, deliberately quieter than the palace beside it.', at: [MP.x1 + 0.4, 4.5, -5] },
    { label: 'Roman remains under glass', note: 'Column bases of the Roman forum portico, excavated and left visible beneath a walk-on glass floor.', at: [14, 1.4, MP.z1 + 2.6] },
    { label: 'Car-free square', note: 'The square repaved in stone and closed to traffic, given back to people walking.', at: [-12, 0.6, 15] },
    { label: 'The restored tower', note: 'Seven centuries on, the tower is repaired, not rebuilt, and can be climbed by visitors.', at: [TWR.x + 2.6, 30, TWR.z + 2.6] },
  ],
  build(b) {
    palazzoPubblico(b, { stage: 2012 });
    lordsCourt(b, { restored: true });
    // the square repaved in travertine and grey stone, flush, with benches and young trees
    pave(b, 43, 14.5, 0, 14.25, mix(P.travertine, P.paving, 0.3));
    for (const z of spread(6, 8.5, 20.5)) b.box(43, 0.075, 0.25, P.pietraSerena, { at: [0, 0, z], jitter: false });
    kingMonument(b);
    pave(b, 16.5, 28.5, 13.25, -7.25, mix(P.travertine, P.paving, 0.45));
    for (const x of [-16, 4.5]) {
      b.box(3.6, 0.45, 0.6, P.travertine, { at: [x, 0, 12] });
      b.tree(5, { kind: 'round', at: [x, 0, 16.5] });
    }

    // ---- the pavilion: travertine walls, a glass front, a thin flat roof
    const { x0, x1, z0, z1, h } = MP;
    const W = x1 - x0;
    const D = z1 - z0;
    const xc = (x0 + x1) / 2;
    const zc = (z0 + z1) / 2;
    const trav = tint(P.travertine, 0.03);
    b.box(W, h, 0.5, trav, { at: [xc, 0, z0 + 0.25] });
    b.box(0.5, h, D, trav, { at: [x1 - 0.25, 0, zc] });
    b.box(0.5, h, D, trav, { at: [x0 + 0.25, 0, zc] });
    for (let y = 1; y < h; y += 1.1) b.box(0.06, 0.04, D, tint(trav, -0.08), { at: [x1 + 0.01, y, zc], jitter: false });
    b.box(W - 1, h - 0.3, 0.1, mix(P.glass, P.white, 0.2), { at: [xc, 0, z1 - 0.3], mat: 'glass' });
    for (const x of spread(6, x0 + 0.6, x1 - 0.6)) b.box(0.08, h - 0.3, 0.12, P.steel, { at: [x, 0, z1 - 0.25], jitter: false });
    b.box(W + 1.6, 0.35, D + 1.2, tint(P.concreteWhite, 0.02), { at: [xc, h, zc + 0.4] });
    // in front: the glass floor over the excavated portico, with column stumps beneath
    pave(b, W, 4.2, xc, z1 + 2.4, tint(P.travertine, -0.15), 0.01);
    for (const x of spread(5, x0 + 1.2, x1 - 1.2)) column(b, [x, 0.02, z1 + 2.4], 0.26, 0.5, tint(P.marble, -0.05), { order: 'doric' });
    b.box(W, 0.06, 4.2, 0xcfe3e6, { at: [xc, 0.55, z1 + 2.4], mat: 'glass', jitter: false });

    // ---- the glazed bridge from the palace end wall to the pavilion, at first-floor level
    const by = PAL.g;
    const bz = -4.5;
    b.box(x0 - PAL.x1, 3.2, 2.6, mix(P.glass, P.white, 0.25), { at: [(PAL.x1 + x0) / 2, by, bz], mat: 'glass' });
    b.box(x0 - PAL.x1, 0.3, 2.8, P.steel, { at: [(PAL.x1 + x0) / 2, by - 0.3, bz] });
    b.box(x0 - PAL.x1, 0.15, 2.8, P.steel, { at: [(PAL.x1 + x0) / 2, by + 3.2, bz] });
    for (const x of [PAL.x1 + 1, x0 - 1]) b.cyl(0.12, by - 0.3, P.steel, { at: [x, 0, bz], segs: 6 });
    // a glass lift beside the pavilion
    b.box(2.2, h + 2.5, 2.2, mix(P.glass, P.white, 0.25), { at: [x0 + 1.4, 0, z0 - 1.4], mat: 'glass' });
    b.box(2.4, 0.25, 2.4, P.steel, { at: [x0 + 1.4, h + 2.5, z0 - 1.4] });
    // the way round to the courtyard gate
    pave(b, 2.6, 19, 5.5, (COURT.z0 + PAL.zf) / 2 - 2, mix(P.travertine, P.paving, 0.3));
    b.box(3, 1.6, 0.1, P.cladRed, { at: [PORTAL_X + 4.2, 1.0, PAL.zf + 0.32], jitter: false }); // museum banner

    palaceColliders(b, true);
    lordsColliders(b);
    b.collider(W, 0.6, { at: [xc, 0, z0 + 0.25] });
    b.collider(0.6, D, { at: [x1 - 0.25, 0, zc] });
    b.collider(0.6, D, { at: [x0 + 0.25, 0, zc] });
    b.collider(W, 0.4, { at: [xc, 0, z1 - 0.3] });
    for (const x of [PAL.x1 + 1, x0 - 1]) b.collider(0.4, 0.4, { at: [x, 0, bz] });
    b.collider(2.4, 2.4, { at: [x0 + 1.4, 0, z0 - 1.4] });
    for (const x of [-16, 4.5]) b.collider(3.6, 0.6, { at: [x, 0, 12] });
  },
};
