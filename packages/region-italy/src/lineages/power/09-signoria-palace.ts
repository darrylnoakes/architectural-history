import { P, mix, spread, type BuildingDef } from '@ah/kit';
import {
  COURT,
  PAL,
  TORRICINI_Z,
  TWR,
  WING,
  brickSquare,
  lordsColliders,
  lordsCourt,
  palaceColliders,
  palazzoPubblico,
  pave,
} from './shared';

export const signoriaPalace: BuildingDef = {
  id: 'signoria-palace',
  name: 'The lord’s palace',
  style: 'Early Renaissance',
  date: 'c. 1470 to 1490',
  summary:
    'Faction fighting has worn out the commune, and a signore, a lord who in time gets a title from the pope or the emperor, now rules the town. ' +
    'He keeps the old Palazzo Pubblico and its tower (old) but turns them into his court: behind them he builds an arcaded courtyard on Corinthian columns, ' +
    'with a pilastered upper storey and an inscription praising himself, and a new wing whose front to the valley is a stack of open loggias between two slender round turrets (new). ' +
    'The commune still meets, but in a palace that now belongs to a prince; even the tower has been given a clock.',
  materials: ['brick', 'pietra serena', 'travertine', 'lime plaster', 'lead'],
  lookFor: [
    { label: 'Arcaded courtyard', note: 'Round arches on slender Corinthian columns of grey stone, the calm, measured court of the early Renaissance.', at: [COURT.x0 + 2.6, 4.2, COURT.z0 + 2.9] },
    { label: 'Twin turrets (torricini)', note: 'Two slender round towers with conical roofs flank the lord’s new front, more for show than for defence.', at: [WING.x0 - 1.8, WING.h + 3, TORRICINI_Z - 3.3] },
    { label: 'Stacked loggias', note: 'Three open arched balconies one above another, from which the lord looked out over his lands.', at: [WING.x0 - 0.8, 7.5, TORRICINI_Z] },
    { label: 'Inscription frieze', note: 'A band of white stone over the arcade, where the lord’s name and titles were carved in Roman capitals.', at: [COURT.x1 - 2.6, 7.4, (COURT.z0 + COURT.z1) / 2] },
    { label: 'Tower clock', note: 'A mechanical clock on the old civic tower tells the hours to the whole town with a single hand; public clocks had spread through Italian towns since the fourteenth century.', at: [TWR.x, TWR.shaft - 4.5, TWR.z + TWR.w / 2 + 0.4] },
  ],
  modelledOn: 'The Ducal Palace of Urbino (courtyard by Luciano Laurana, c. 1468 to 1472; the Facciata dei Torricini), much reduced',
  influences: ['renaissance-birth'],
  build(b) {
    palazzoPubblico(b, { stage: 1480 });
    lordsCourt(b);
    brickSquare(b, -21.5, 21.5, PAL.zf, 21.5);

    // ---- the lord's hanging garden on the right: walled parterres, a fountain, a loggia at the far end
    const gx0 = 7;
    const gx1 = 21.5;
    const gz0 = -21.5;
    const gz1 = 3;
    pave(b, gx1 - gx0, gz1 - gz0, (gx0 + gx1) / 2, (gz0 + gz1) / 2, mix(P.gravel, P.cotto, 0.15));
    const wallC = P.intonacoCream;
    b.box(0.45, 3, gz1 - gz0, wallC, { at: [gx0, 0, (gz0 + gz1) / 2 - 0] });
    b.box(gx1 - gx0, 3, 0.45, wallC, { at: [(gx0 + gx1) / 2, 0, gz0 + 0.2] });
    b.box(0.45, 3, gz1 - gz0, wallC, { at: [gx1 - 0.2, 0, (gz0 + gz1) / 2] });
    // front wall with a gate
    b.box(4.4, 3, 0.45, wallC, { at: [gx0 + 2.2, 0, gz1] });
    b.box(gx1 - gx0 - 7.2, 3, 0.45, wallC, { at: [(gx0 + 7.2 + gx1) / 2, 0, gz1] });
    for (const x of [gx0 + 4.4, gx0 + 7.2]) b.box(0.6, 3.6, 0.6, P.pietraSerena, { at: [x, 0, gz1] });
    for (const [x0, x1, z0, z1] of [
      [gx0, gx1, gz0, gz1],
    ] as const) {
      for (const x of [x0 + 0.2, x1 - 0.2]) for (const z of spread(6, z0 + 1, z1 - 1)) b.box(0.5, 0.15, 0.5, P.pietraSerena, { at: [x, 3, z], jitter: false });
    }
    // four box-hedged parterres round a fountain
    const fx = (gx0 + gx1) / 2;
    const fz = (gz0 + gz1) / 2 + 1;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.box(4.6, 0.6, 6.2, P.hedge, { at: [fx + sx * 3.4, 0, fz + sz * 4.2] });
        b.box(4.0, 0.1, 5.6, P.leaf, { at: [fx + sx * 3.4, 0.6, fz + sz * 4.2], jitter: false });
      }
    b.cyl(1.5, 0.6, P.travertine, { at: [fx, 0, fz], segs: 10 });
    b.cyl(1.3, 0.05, P.water, { at: [fx, 0.58, fz], segs: 10, mat: 'glass' });
    b.cyl(0.25, 1.6, P.travertine, { at: [fx, 0, fz], segs: 6 });
    b.cyl(0.6, 0.2, P.travertine, { at: [fx, 1.6, fz], segs: 8 });
    // a garden loggia against the back wall
    b.box(gx1 - gx0 - 2, 0.3, 3.2, P.pietraSerena, { at: [fx, 0, gz0 + 2.1] });
    b.colonnade(4, 3.2, 0.2, 3.6, P.pietraSerena, { at: [fx, 0.3, gz0 + 3.4], order: 'tuscan' });
    b.box(gx1 - gx0 - 2, 0.4, 0.5, P.pietraSerena, { at: [fx, 3.9, gz0 + 3.4], jitter: false });
    b.shed(gx1 - gx0 - 1.6, 3.4, 1.0, P.coppi, { at: [fx, 4.3, gz0 + 2.0], high: '-z' });
    // cypresses and an olive or two
    for (const z of [gz0 + 6, gz0 + 12, gz0 + 18]) b.tree(9, { kind: 'cypress', at: [gx1 - 1.3, 0, z] });
    b.tree(4.4, { kind: 'olive', at: [gx0 + 1.6, 0, gz0 + 6] });

    // a paved way round to the courtyard gate, between the courtyard screen and the garden wall
    pave(b, 2.6, 19, 5.5, (COURT.z0 + PAL.zf) / 2 - 2, mix(P.cotto, P.paving, 0.45));

    palaceColliders(b, true);
    lordsColliders(b);
    b.collider(0.6, gz1 - gz0, { at: [gx0, 0, (gz0 + gz1) / 2] });
    b.collider(0.6, gz1 - gz0, { at: [gx1 - 0.2, 0, (gz0 + gz1) / 2] });
    b.collider(gx1 - gx0, 0.6, { at: [(gx0 + gx1) / 2, 0, gz0 + 0.2] });
    b.collider(4.4, 0.6, { at: [gx0 + 2.2, 0, gz1] });
    b.collider(gx1 - gx0 - 7.2, 0.6, { at: [(gx0 + 7.2 + gx1) / 2, 0, gz1] });
    b.collider(3.6, 3.6, { at: [fx, 0, fz] });
  },
};
