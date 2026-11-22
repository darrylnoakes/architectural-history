import type { Region } from '@ah/kit';
import { eras } from './eras';
import { influences } from './influences';
import { plots } from './plots';
import { site } from './site';
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
  location: [52.2, -1.3],
  subtitle: 'A market town on a river',
  intro: {
    title: 'One town, twenty-five centuries',
    text:
      'This is an English market town on a river. Every plot keeps its purpose while its buildings are rebuilt in the manner of each age, ' +
      'from Iron Age roundhouses to glass and timber.',
  },
  start: -500,
  end: 2025,
  eras,
  influences,
  lineages: [home, cottage, merchant, worship, power, market, work, crossing, culture, inn, chapel, farm],
  plots,
  site,
};

export default england;
