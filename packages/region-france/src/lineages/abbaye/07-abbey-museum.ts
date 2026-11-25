import { P, mix, type BuildingDef, type Builder } from '@ah/kit';
import { CRYPT, CX, GARTH, GATE_X, MUSE, NZ, RANGE, abbey, flat, rectPts } from './shared';

function build(b: Builder) {
  abbey(b, MUSE);
  // a glass entrance pavilion before the old gate
  const gx = GATE_X;
  const z0 = RANGE.W.z1;
  b.box(6.4, 0.1, 3.6, P.paving, { at: [gx, 0, z0 + 1.8], jitter: false });
  b.box(6, 3.4, 3.2, P.glass, { at: [gx, 0.1, z0 + 1.7], mat: 'glass' });
  b.box(6.6, 0.3, 3.8, P.steel, { at: [gx, 3.5, z0 + 1.8] });
  for (const sx of [-1, 1]) for (const sz of [0.2, 3.3]) b.box(0.12, 3.4, 0.12, P.steel, { at: [gx + sx * 2.95, 0.1, z0 + sz] });
  flat(b, rectPts(-0.9, 0, 0.9, 2.4), P.glassDark, [gx, 0.1, z0 + 3.3], '+z', 0.02);
  b.collider(6, 3.2, { at: [gx, 0, z0 + 1.7] });
  // a paved forecourt, trees and benches
  b.box(18, 0.04, 4.4, mix(P.paving, P.gravel, 0.4), { at: [2, 0, 19.6], jitter: false });
  for (const x of [-3, 9.5, 14.5]) b.tree(6.5, { at: [x, 0, 20.2], kind: 'round' });
  for (const x of [-1, 11.8]) b.box(1.8, 0.45, 0.5, P.oak, { at: [x, 0, 18.6] });
}

export const abbeyMuseum: BuildingDef = {
  id: 'abbey-museum',
  name: 'Abbey museum',
  style: 'Contemporary conservation',
  date: 'c. 1995',
  summary:
    'Mill and barracks gone, the town buys what is left and restores it as a museum and cultural centre: the Maurist ranges hold the collections, concerts and a library, and the cloister becomes a garden. ' +
    'Nothing is rebuilt that cannot be proved. The lost church is shown only by its plan, its walls and pier bases marked out in stone in the lawn behind the old west front, which is cleaned and repaired; the crypt under the choir, the oldest work on the site, is opened to visitors. ' +
    'A new entrance is added in glass and steel, plainly modern, so that no one could mistake it for part of the old abbey.',
  materials: ['restored limestone', 'slate', 'glass and steel', 'lawn and gravel'],
  lookFor: [
    { label: 'Plan marked in the grass', note: 'Stone strips trace the walls of the vanished church, and low blocks the bases of its piers and columns.', at: [CX - 8.5, 0.4, -8] },
    { label: 'West front', note: 'The one part of the church that survived, cleaned and repaired as the gateway to the site.', at: [CX, 9, NZ + 0.3] },
    { label: 'Cloister garden', note: 'The garth replanted with box-edged beds and gravel paths, the walks rebuilt round it.', at: [(GARTH.x0 + GARTH.x1) / 2 + 3.3, 1, (GARTH.z0 + GARTH.z1) / 2 + 2.8] },
    { label: 'Crypt', note: 'The half-sunk crypt over the founding saint’s grave, built about 560 and never pulled down: every church on the site stood over it in turn.', at: [CX + CRYPT.w / 2 + 0.2, 1.6, -16.5] },
    { label: 'Glass pavilion', note: 'The new entrance, deliberately unlike the old work, as the conservation charters of the twentieth century ask.', at: [GATE_X, 3.9, RANGE.W.z1 + 3.4] },
  ],
  modelledOn:
    'Generic. The restored ranges as museum and the church plan marked in the ground follow the Musée Saint-Remi at Reims, the Abbaye aux Dames of Saintes and the remains of Cluny.',
  build,
};
