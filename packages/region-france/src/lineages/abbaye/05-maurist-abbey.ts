import type { BuildingDef, Builder } from '@ah/kit';
import { CX, GATE_X, G, GH, MAUR, RANGE, abbey } from './shared';

function build(b: Builder) {
  abbey(b, MAUR);
}

export const mauristAbbey: BuildingDef = {
  id: 'maurist-abbey',
  name: 'Maurist abbey',
  style: 'Classical',
  date: 'c. 1700',
  summary:
    'The Benedictines of the Congregation of Saint-Maur, the reformed order of scholars who edit the Church Fathers and write the history of France, rebuild their monasteries one after another from the late seventeenth century. ' +
    'The medieval church is kept, but the monks’ quarters go up again as long, plain ranges of fine ashlar three storeys high, with tall windows in strict rows, string courses, hipped slate roofs and a pediment on the front: a monastery that looks like a palace or a hospital. ' +
    'The old common dormitory gives way to separate rooms with fireplaces, a library and guest apartments; the cloister is rebuilt with round arches.',
  materials: ['limestone ashlar', 'slate', 'oak sashes and casements', 'the medieval church in stone and tile'],
  lookFor: [
    { label: 'Classical ranges', note: 'Long blocks of three storeys with identical tall windows on a regular rhythm, like a château.', at: [RANGE.R.x1 + 0.2, 7, -2.5] },
    { label: 'Pediment', note: 'A triangular gable from classical architecture crowning the centre of the front.', at: [RANGE.R.x1 + 0.5, 12.8, 3] },
    { label: 'Hipped slate roof with dormers', note: 'Blue-grey slate on roofs that slope on all four sides, lit by small dormer windows.', at: [8, 14.6, RANGE.E.z0 - 0.6] },
    { label: 'Gateway', note: 'A round-arched carriage gate through the middle of the entrance range, now the front door of the monastery.', at: [GATE_X, 2.2, RANGE.W.z1 + 0.5] },
    { label: 'Medieval church kept', note: 'The Gothic choir and Romanesque nave still serve, as at Saint-Remi of Reims, where they stand to this day.', at: [CX, 9, GH - G.r3 - 1] },
  ],
  modelledOn:
    'Generic Maurist buildings, after the eighteenth-century monastic ranges of Saint-Remi at Reims (now the Musée Saint-Remi) and Saint-Ouen at Rouen (now the town hall); the church is the one this abbey already had. Saint-Remi also keeps its Romanesque nave with a Gothic choir.',
  build,
};

