import type { Lineage } from '@ah/kit';
import { invasions, renewedBy } from '../../ends';
import { chiefsEnclosure } from './01-chiefs-enclosure';
import { forum } from './02-forum';
import { frankishPalace } from './03-frankish-palace';
import { bishopsPalace } from './04-bishops-palace';
import { belfryDef } from './05-belfry';
import { flamboyantTownHall } from './06-flamboyant-town-hall';
import { intendanceDef } from './07-intendance';
import { prefectureDef } from './08-prefecture';
import { rebuiltTownHall } from './09-rebuilt-town-hall';
import { citeAdministrativeDef } from './10-cite-administrative';
import { civicCentreDef } from './11-civic-centre';

/*
 * The belfry of 1260 and the town hall built on to it in 1510 are one model (shared.ts) kept by
 * every later stage on the main plot. Five stages are separate buildings in reality and stand alone
 * on other plots (b.variant > 0): bishops-palace (alone in both forms), intendance, prefecture,
 * cite-administrative and civic-centre, each built in zone C (x 0.5 to 21.5) beside the old hall.
 */
const lineage: Lineage = {
  id: 'pouvoir',
  name: 'L’Hôtel de Ville',
  kind: 'power',
  role: 'Who rules the town, and from where: the chief’s enclosure, the forum, the count’s and the bishop’s halls, the commune’s belfry and town hall, and beside them the buildings of the king, the state and the agglomeration.',
  plotSize: [44, 44],
  stages: [
    // timber and thatch, always rebuilt; gone once the Roman town is laid out
    { from: -300, builtUntil: -52, end: renewedBy(60), def: chiefsEnclosure },
    // the open town's forum: sacked in 275 and quarried for the new wall
    { from: 60, builtUntil: 150, end: invasions, def: forum },
    // a timber hall, rebuilt again and again until the bishop's stone palace replaces it
    { from: 600, builtUntil: 900, end: renewedBy(1180), def: frankishPalace },
    { from: 1180, builtUntil: 1240, def: bishopsPalace },
    { from: 1260, builtUntil: 1400, def: belfryDef },
    { from: 1510, builtUntil: 1560, def: flamboyantTownHall },
    // intendants and their royal squares came to an end with the Revolution
    { from: 1760, builtUntil: 1789, def: intendanceDef },
    { from: 1835, builtUntil: 1860, def: prefectureDef },
    { from: 1928, builtUntil: 1934, def: rebuiltTownHall },
    { from: 1970, builtUntil: 1980, def: citeAdministrativeDef },
    { from: 2012, def: civicCentreDef },
  ],
};

export default lineage;
