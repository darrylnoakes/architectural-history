import type { Plot } from '@ah/kit';
import { greatWar } from './ends';

const E = Math.PI / 2; // front faces east (+x)
const W = -Math.PI / 2; // front faces west (-x)
const S = 0; // front faces south (+z)
const N = Math.PI; // front faces north (-z)

/** Blown up in June 1940 to slow the German advance, like many bridges of the north. */
const blown1940 = {
  year: 1940,
  note: 'In June 1940 French engineers blew the bridge to slow the German advance. For some years the river was crossed on a makeshift timber bridge built on what was left of it.',
};

/**
 * The town plan. World axes: +x east, +z south. The Grande Rue runs north-south along x = 0 and
 * the road from the west to Reims east-west along z = 0; the river flows west to east along
 * z = 96. The streets, the squares and the ground itself are in `site.ts`.
 *
 * Three things shape which plot holds what. Some plots stop at a durable building (`keep`), as in
 * any old town. Later stages of each lineage stand on new plots (`since`): the abbey outside the
 * walls, the château at the end of its avenue, the station quarter, the estates of the 1960s.
 * And the plots marked `struck: greatWar` were shelled between 1914 and 1918: whatever stood on
 * them is a ruin from 1915 until the Reconstruction rebuilds it in the 1920s.
 */
export const plots: Plot[] = [
  // --- the cathedral, with its west front on the parvis and the bishop's palace on its north side
  { id: 'cathedrale', lineage: 'cathedrale', x: 60, z: -40, rotY: W, seed: 11, hero: true },
  { id: 'eveche', lineage: 'pouvoir', x: 60, z: -76, rotY: S, seed: 12, since: 1180, keep: 'bishops-palace' },

  // --- the town hall on the Grand'Place: the belfry stands from 1260, is ruined in 1915 and rebuilt
  { id: 'pouvoir', lineage: 'pouvoir', x: -32, z: -73, rotY: S, seed: 13, hero: true, skip: ['bishops-palace', 'intendance', 'prefecture', 'cite-administrative', 'civic-centre'], struck: greatWar },
  { id: 'intendance', lineage: 'pouvoir', x: 96, z: -88, rotY: S, seed: 14, since: 1760, keep: 'intendance' },
  { id: 'prefecture', lineage: 'pouvoir', x: 124, z: -37, rotY: N, seed: 15, since: 1835, keep: 'prefecture' },
  { id: 'cite-administrative', lineage: 'pouvoir', x: 86, z: 163.5, rotY: N, seed: 16, since: 1970, keep: 'cite-administrative' },
  { id: 'civic-centre', lineage: 'pouvoir', x: 110, z: 163.5, rotY: N, seed: 17, since: 2012 },

  // --- the abbey outside the east gate, and the castle on its hill to the west
  { id: 'abbaye', lineage: 'abbaye', x: 215, z: -32, rotY: W, seed: 18, hero: true },
  { id: 'chateau-fort', lineage: 'chateau', x: -245, z: -62, rotY: S, seed: 19, hero: true, skip: ['renaissance-chateau', 'classical-chateau'] },
  { id: 'chateau', lineage: 'chateau', x: -36, z: -200, rotY: E, seed: 20, since: 1520, keep: 'classical-chateau' },

  // --- markets: the timber hall in the market place, and what each later century added elsewhere
  { id: 'halles', lineage: 'halles', x: -48, z: 55, rotY: S, seed: 21, hero: true, keep: 'timber-halle' },
  { id: 'halle-au-ble', lineage: 'halles', x: -46, z: 18.5, rotY: N, seed: 22, since: 1767, keep: 'grain-hall' },
  { id: 'passage', lineage: 'halles', x: 16.5, z: 38.5, rotY: W, seed: 23, since: 1826, keep: 'passage' },
  { id: 'marche-couvert', lineage: 'halles', x: 104, z: 71.5, rotY: N, seed: 24, since: 1866, skip: ['grand-magasin', 'hypermarket'], struck: greatWar },
  { id: 'grand-magasin', lineage: 'halles', x: -16.5, z: 20, rotY: E, seed: 25, since: 1895, keep: 'grand-magasin' },
  { id: 'hypermarche', lineage: 'halles', x: 190, z: 152.5, rotY: N, seed: 26, since: 1969, keep: 'hypermarket' },

  // --- work: the mills on the north bank, the iron mill in the river on the south
  { id: 'atelier', lineage: 'atelier', x: 60, z: 73, rotY: N, seed: 27, hero: true, skip: ['iron-frame-mill'], struck: greatWar },
  { id: 'moulin', lineage: 'atelier', x: -100, z: 119, rotY: S, seed: 28, since: 1872, keep: 'iron-frame-mill' },

  // --- bridges: the old bridge, blown in 1940; the suspension bridge downstream; the footbridge
  { id: 'pont', lineage: 'pont', x: 0, z: 96, rotY: S, seed: 29, hero: true, skip: ['suspension-bridge', 'footbridge'], struck: blown1940 },
  { id: 'pont-suspendu', lineage: 'pont', x: 128, z: 96, rotY: S, seed: 30, since: 1830, skip: ['footbridge'], struck: blown1940 },
  { id: 'passerelle', lineage: 'pont', x: -62, z: 96, rotY: S, seed: 31, since: 2006 },

  // --- spectacles: one plot each, as the town acquired them
  { id: 'theatre', lineage: 'spectacles', x: -112, z: 24, rotY: N, seed: 32, hero: true, keep: 'grand-theatre' },
  { id: 'musee', lineage: 'spectacles', x: 131, z: 159.5, rotY: N, seed: 33, since: 1862, keep: 'museum' },
  { id: 'cirque', lineage: 'spectacles', x: -128, z: 159.5, rotY: N, seed: 34, since: 1889, keep: 'cirque' },
  { id: 'bibliotheque', lineage: 'spectacles', x: -80, z: -165.5, rotY: S, seed: 35, since: 1927, keep: 'carnegie-library' },
  { id: 'maison-de-la-culture', lineage: 'spectacles', x: -172, z: 159.5, rotY: N, seed: 36, since: 1966, keep: 'maison-de-la-culture' },
  { id: 'centre-d-art', lineage: 'spectacles', x: 170, z: 62, rotY: W, seed: 37, since: 2010 },

  // --- food, drink and a bed; the Hôtel-Dieu is a separate foundation and survives
  { id: 'auberge', lineage: 'auberge', x: 16.5, z: -85, rotY: W, seed: 38, hero: true, skip: ['hotel-dieu', 'cafe-restaurant', 'brasserie', 'relais-routier', 'bistro-today'], keep: 'relais-de-poste' },
  { id: 'hotel-dieu', lineage: 'auberge', x: -16.5, z: 64, rotY: E, seed: 39, since: 1445, keep: 'hotel-dieu' },
  { id: 'cafe', lineage: 'auberge', x: -69, z: -28, rotY: E, seed: 40, since: 1785, keep: 'cafe-restaurant' },
  { id: 'brasserie', lineage: 'auberge', x: 37, z: 164, rotY: W, seed: 41, since: 1905, skip: ['relais-routier'] },
  { id: 'relais-routier', lineage: 'auberge', x: -216, z: 152.5, rotY: N, seed: 42, since: 1955, keep: 'relais-routier' },

  // --- gates, changing together with the wall between them (`town-walls.ts`)
  { id: 'porte-nord', lineage: 'remparts', x: 0, z: -128, rotY: N, seed: 43, hero: true },
  { id: 'porte-est', lineage: 'remparts', x: 146, z: 0, rotY: E, seed: 44, keep: 'vauban-gate' },
  { id: 'porte-ouest', lineage: 'remparts', x: -150, z: 0, rotY: W, seed: 45 },

  // --- the railway
  // the town's station, rebuilt after 1918, stays in use; the high-speed station of 2007 is a new
  // one further along the line, beyond the grand ensemble, as such stations usually were
  { id: 'gare', lineage: 'gare', x: 0, z: 184, rotY: N, seed: 46, hero: true, struck: greatWar, keep: 'reconstruction-station' },
  { id: 'gare-tgv', lineage: 'gare', x: 300, z: 184, rotY: N, seed: 49, since: 2007 },

  // --- the hôtel: each stops at a different century; the villas stand outside
  { id: 'hotel', lineage: 'hotel', x: 40, z: 19, rotY: N, seed: 51, hero: true, keep: 'hotel-particulier' },
  { id: 'hotel-2', lineage: 'hotel', x: 66, z: 18.5, rotY: N, seed: 52, since: 1150, lag: 0.3, keep: 'gothic-hotel' },
  { id: 'hotel-3', lineage: 'hotel', x: -100, z: -18.5, rotY: S, seed: 53, since: 1445, lag: 0.4, keep: 'renaissance-hotel' },
  { id: 'hotel-4', lineage: 'hotel', x: 94, z: 18.5, rotY: N, seed: 54, since: 1625, keep: 'brick-and-stone-hotel' },
  { id: 'hotel-5', lineage: 'hotel', x: -80, z: 18.5, rotY: N, seed: 55, since: 1780, keep: 'neoclassical-hotel' },
  { id: 'villa-1900', lineage: 'hotel', x: -40, z: 154.5, rotY: N, seed: 56, since: 1902, keep: 'art-nouveau-villa' },
  { id: 'villa-moderne', lineage: 'hotel', x: 110, z: -191.5, rotY: N, seed: 57, since: 1930, keep: 'modern-villa' },
  { id: 'maison-serre', lineage: 'hotel', x: 140, z: -191.5, rotY: N, seed: 58, since: 2005 },

  // --- the family home, along the Grande Rue and the cross street
  { id: 'maison-1', lineage: 'maison', x: 14.5, z: 13, rotY: W, seed: 61, hero: true, keep: 'classical-house' },
  { id: 'maison-2', lineage: 'maison', x: 14.5, z: -14, rotY: W, seed: 62, lag: 0.2, skip: ['immeuble-bourgeois', 'maison-1900'], struck: greatWar, keep: 'reconstruction-house' },
  { id: 'maison-3', lineage: 'maison', x: 14.5, z: -65, rotY: W, seed: 63, lag: 0.3, keep: 'gothic-timber-house' },
  { id: 'maison-4', lineage: 'maison', x: 14.5, z: -107, rotY: W, seed: 65, since: 1140, lag: 0.5, keep: 'renaissance-house' },
  { id: 'maison-5', lineage: 'maison', x: -14.5, z: -104, rotY: E, seed: 66, since: 30, lag: 0.4, keep: 'immeuble-bourgeois' },
  { id: 'maison-6', lineage: 'maison', x: -14.5, z: 41, rotY: E, seed: 67, lag: 0.25, skip: ['maison-1900'], struck: greatWar, keep: 'reconstruction-house' },
  { id: 'maison-7', lineage: 'maison', x: 14.5, z: 67, rotY: W, seed: 68, lag: 0.45, keep: 'gothic-timber-house' },
  { id: 'maison-8', lineage: 'maison', x: -119, z: -14.5, rotY: S, seed: 70, since: 30, lag: 0.3, keep: 'classical-house' },
  { id: 'maison-10', lineage: 'maison', x: 36, z: -14, rotY: S, seed: 72, lag: 0.15, keep: 'renaissance-house' },
  { id: 'maison-11', lineage: 'maison', x: 100, z: -14, rotY: S, seed: 73, since: 30, lag: 0.35, skip: ['immeuble-bourgeois'], struck: greatWar, keep: 'reconstruction-house' },
  { id: 'maison-12', lineage: 'maison', x: 114, z: -14, rotY: S, seed: 74, since: 1140, lag: 0.5, keep: 'classical-house' },
  // (no apartment block here first: nobody pulled down a six-storey block of the 1870s for two small houses)
  { id: 'maison-13', lineage: 'maison', x: 118, z: 14.5, rotY: N, seed: 75, since: 1330, lag: 0.6, skip: ['immeuble-bourgeois'], keep: 'maison-1900' },
  // crowded against the south flank of the cathedral
  { id: 'maison-18', lineage: 'maison', x: 50, z: -14, rotY: S, seed: 85, since: 300, lag: 0.4, keep: 'gothic-timber-house' },
  { id: 'maison-19', lineage: 'maison', x: 64, z: -14, rotY: S, seed: 86, since: 1140, lag: 0.2, skip: ['immeuble-bourgeois'], struck: greatWar, keep: 'reconstruction-house' },
  { id: 'maison-20', lineage: 'maison', x: 78, z: -14, rotY: S, seed: 87, since: 30, lag: 0.55, keep: 'renaissance-house' },
  // the rue des Moulins, behind the hôtels
  { id: 'maison-21', lineage: 'maison', x: 40, z: 41, rotY: S, seed: 88, since: 30, lag: 0.5, skip: ['maison-1900'], keep: 'immeuble-bourgeois' },
  { id: 'maison-22', lineage: 'maison', x: 54, z: 41, rotY: S, seed: 89, since: 1140, lag: 0.35, keep: 'classical-house' },
  { id: 'maison-23', lineage: 'maison', x: 68, z: 41, rotY: S, seed: 90, since: 1330, lag: 0.3, skip: ['immeuble-bourgeois', 'maison-1900'], struck: greatWar, keep: 'reconstruction-house' },
  { id: 'maison-24', lineage: 'maison', x: 82, z: 41, rotY: S, seed: 98, since: 1330, lag: 0.6, keep: 'gothic-timber-house' },
  // beyond the river: the station quarter
  { id: 'maison-15', lineage: 'maison', x: -14.5, z: 148.5, rotY: E, seed: 77, since: 1868, lag: 0.2, keep: 'immeuble-bourgeois' },
  { id: 'maison-16', lineage: 'maison', x: 14.5, z: 148.5, rotY: W, seed: 78, since: 1903, keep: 'maison-1900' },
  { id: 'maison-17', lineage: 'maison', x: 57, z: 150.5, rotY: N, seed: 79, since: 1924, keep: 'reconstruction-house' },
  // the lotissement of the boom years, and the écoquartier opposite
  { id: 'pavillon-1', lineage: 'maison', x: 25, z: -224.5, rotY: S, seed: 80, since: 1968, keep: 'pavillon' },
  { id: 'pavillon-2', lineage: 'maison', x: 45, z: -224.5, rotY: S, seed: 81, since: 1968, lag: 0.3, keep: 'pavillon' },
  { id: 'pavillon-3', lineage: 'maison', x: 65, z: -224.5, rotY: S, seed: 82, since: 1968, lag: 0.6, keep: 'pavillon' },
  { id: 'eco-1', lineage: 'maison', x: 30, z: -195.5, rotY: N, seed: 83, since: 2014 },
  { id: 'eco-2', lineage: 'maison', x: 50, z: -195.5, rotY: N, seed: 84, since: 2014 },

  // --- the faubourg across the river, and the workers' housing of each later age
  { id: 'faubourg', lineage: 'faubourg', x: -36, z: 122.5, rotY: S, seed: 91, hero: true, keep: 'weavers-houses' },
  { id: 'faubourg-2', lineage: 'faubourg', x: 22, z: 122.5, rotY: S, seed: 92, since: 40, lag: 0.3, skip: ['couree', 'familistere'], struck: greatWar, keep: 'cite-jardin' },
  { id: 'couree', lineage: 'faubourg', x: 52, z: 122.5, rotY: S, seed: 93, since: 1850, keep: 'couree' },
  { id: 'familistere', lineage: 'faubourg', x: 82, z: 122.5, rotY: S, seed: 94, since: 1872, keep: 'familistere' },
  { id: 'cite-jardin', lineage: 'faubourg', x: -70, z: 152.5, rotY: N, seed: 95, since: 1922, keep: 'cite-jardin' },
  { id: 'zup', lineage: 'faubourg', x: 232, z: 149.5, rotY: N, seed: 96, since: 1962 },
  { id: 'zup-2', lineage: 'faubourg', x: 262, z: 149.5, rotY: N, seed: 97, since: 1962, lag: 0.3, keep: 'grand-ensemble' },
];
