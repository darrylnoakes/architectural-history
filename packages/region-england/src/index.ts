import type { Region } from '@ah/kit';
import { eras } from './eras';
import { influences } from './influences';
import { plots } from './plots';
import home from './lineages/home';
import cottage from './lineages/cottage';
import merchant from './lineages/merchant';
import worship from './lineages/worship';
import power from './lineages/power';
import market from './lineages/market';
import work from './lineages/work';
import crossing from './lineages/crossing';
import culture from './lineages/culture';
import inn from './lineages/inn';
import { chapel, farm } from './extras';

export { eras, influences, plots };

export const england: Region = {
  id: 'england',
  name: 'England',
  subtitle: 'A market town on a river',
  start: -500,
  end: 2025,
  eras,
  influences,
  lineages: [home, cottage, merchant, worship, power, market, work, crossing, culture, inn, chapel, farm],
  plots,
};

export default england;
