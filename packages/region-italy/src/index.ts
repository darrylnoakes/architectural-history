import type { Region } from '@ah/kit';
import { eras } from './eras';
import { influences } from './influences';
import { plots } from './plots';
import home from './lineages/home';
import tenement from './lineages/tenement';
import palazzo from './lineages/palazzo';
import duomo from './lineages/duomo';
import power from './lineages/power';
import market from './lineages/market';
import work from './lineages/work';
import bridge from './lineages/bridge';
import spectacle from './lineages/spectacle';
import osteria from './lineages/osteria';
import walls from './lineages/walls';
import station from './lineages/station';
import fountain from './lineages/fountain';

export { eras, influences, plots };

export const italy: Region = {
  id: 'italy',
  name: 'Italy',
  location: [42.7, 12.3],
  subtitle: 'A city on a river',
  start: -750,
  end: 2025,
  eras,
  influences,
  lineages: [home, tenement, palazzo, duomo, power, market, work, bridge, spectacle, osteria, walls, station, fountain],
  plots,
};

export default italy;
