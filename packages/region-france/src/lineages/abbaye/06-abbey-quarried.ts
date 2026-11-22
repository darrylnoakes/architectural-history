import { P, type BuildingDef, type Builder } from '@ah/kit';
import { CX, GATE_X, NZ, QUAR, RANGE, abbey, cart } from './shared';

function build(b: Builder) {
  abbey(b, QUAR);
  const { E, W } = RANGE;
  // the east range as a cotton-spinning mill: a hoist and loading door cut into the back wall, bales below
  const hx = 15.5;
  b.panel(1.6, 2.4, P.oakDark, { at: [hx, 5.0, E.z0], facing: '-z' });
  b.box(0.3, 0.3, 1.6, P.oak, { at: [hx, 10.9, E.z0 - 0.8] });
  b.box(0.06, 5.4, 0.06, P.timberBlack, { at: [hx, 5.5, E.z0 - 1.45] });
  b.box(1.0, 0.8, 0.9, P.cream, { at: [hx, 4.7, E.z0 - 1.45] });
  for (const [x, y] of [[hx - 1.2, 0], [hx, 0], [hx - 0.6, 0.9]] as const) b.box(1.1, 0.9, 1.0, P.cream, { at: [x, y, E.z0 - 1.6] });
  // the west range as a barracks: a tricolour over the gate and a sentry box
  b.box(0.12, 6, 0.12, P.timberBlack, { at: [GATE_X, 13.8, W.z1 + 0.6] });
  for (const [dx, c] of [[0.5, P.doorBlue], [1.3, P.white], [2.1, P.postRed]] as const) b.box(0.8, 1.4, 0.04, c, { at: [GATE_X + dx, 17.9, W.z1 + 0.6], jitter: false });
  b.group({ at: [GATE_X + 2.4, 0, W.z1 + 1.4] }, () => {
    b.box(1.1, 2.3, 1.1, P.voletBleu);
    b.pyramid(1.4, 1.4, 0.6, P.voletBleu, { at: [0, 2.3, 0] });
    b.panel(0.7, 1.8, P.timberBlack, { at: [0, 0.1, 0.55], facing: '+z' });
  });
  b.collider(1.1, 1.1, { at: [GATE_X + 2.4, 0, W.z1 + 1.4] });
  cart(b, [11.5, 0, -15], 0.3, false);
}

export const abbeyQuarried: BuildingDef = {
  id: 'abbey-quarried',
  name: 'Abbey quarried',
  style: 'Revolution',
  date: 'c. 1800',
  summary:
    'In 1789 the Revolution takes the property of the Church to pay the nation’s debts, and in 1790 it abolishes monastic vows: the monks leave and the abbey is sold as national property. ' +
    'Its buyers want stone, not a church: the vaults are brought down and the walls quarried away and carted off to build houses, until only the west front, too useful as a landmark or too hard to fell, is left standing alone. ' +
    'The Maurist ranges are too good to waste. One becomes a cotton-spinning mill, its long rooms filled with machines; the other houses soldiers.',
  materials: ['the old stone, for sale', 'rubble', 'timber hoists and carts'],
  lookFor: [
    { label: 'West front standing alone', note: 'The front and its two towers kept when everything behind them was pulled down for building stone.', at: [CX, 9, NZ + 0.3] },
    { label: 'Stumps of the church', note: 'Walls broken off at waist height and the bases of piers and columns, all that the quarrymen left of the nave and choir.', at: [CX - 6, 1.4, -2] },
    { label: 'Shear-legs', note: 'A three-legged timber crane lowering a squared block on to a cart: the church is being sold off stone by stone.', at: [-9.5, 8.5, -7] },
    { label: 'Spinning mill', note: 'The monks’ dormitory turned into a cotton mill, with a hoist and loading door cut into the back wall.', at: [15.5, 6.5, RANGE.E.z0 - 0.3] },
    { label: 'Barracks', note: 'The entrance range taken over by the army, with a tricolour over the gate and a sentry box.', at: [GATE_X + 1.3, 17.5, RANGE.W.z1 + 0.7] },
  ],
  modelledOn:
    'Generic. The west front left standing alone is after Saint-Jean-des-Vignes at Soissons; the church pulled down for its stone is after Cluny (demolished from 1798 to the 1820s), and the monks’ buildings turned into a cotton mill after Royaumont (from 1791).',
  build,
};
