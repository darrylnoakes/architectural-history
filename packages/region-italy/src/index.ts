import type { Region } from '@ah/kit';
import { eras } from './eras';
import { influences } from './influences';
import { plots } from './plots';
import { site } from './site';
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
  intro: {
    title: 'One city, twenty-eight centuries',
    text:
      'This is a city on a river in central Italy, somewhere between Rome and Florence. It was never abandoned, and what it built in stone it mostly kept: ' +
      'so the plots rebuild age by age from huts to the Renaissance, and then the old city stands while the new one grows up beyond the river.',
  },
  start: -750,
  end: 2025,
  eras,
  influences,
  lineages: [home, tenement, palazzo, duomo, power, market, work, bridge, spectacle, osteria, walls, station, fountain],
  plots,
  site,
};

export default italy;
