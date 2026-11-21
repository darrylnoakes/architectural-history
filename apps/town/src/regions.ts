import england from '@ah/england';
import type { Region } from '@ah/kit';

/** A region on the world map: either built, or planned and shown as a marker only. */
export interface RegionInfo {
  id: string;
  name: string;
  /** The place the story is told through, e.g. "A market town on a river". */
  subtitle: string;
  /** Rough span of the story, for the list. */
  span: string;
  /** [latitude, longitude]. */
  location: [number, number];
  status: 'ready' | 'planned';
  /** One or two sentences on what this region would show. */
  blurb: string;
}

/** Regions whose content is built and loaded. */
export const REGIONS: Record<string, Region> = { england };

/**
 * Every region on the map. The planned ones are the places England's story already points to (see
 * the `region` field of its cross-pollination entries) and the other great building traditions.
 */
export const REGION_LIST: RegionInfo[] = [
  {
    id: 'england',
    name: england.name,
    subtitle: england.subtitle,
    span: '500 BC to today',
    location: england.location,
    status: 'ready',
    blurb: 'Roundhouses, a Roman town and its ruin, Saxon timber, Norman stone, Gothic, Tudor, Georgian, Victorian and modern, all on the same plots.',
  },
  {
    id: 'italy',
    name: 'Italy',
    subtitle: 'A city on a river',
    span: '750 BC to today',
    location: [42.4, 12.6],
    status: 'planned',
    blurb: 'Etruscan and Roman beginnings, the classical orders at their source, Romanesque communes, the Renaissance, the Baroque and after.',
  },
  {
    id: 'france',
    name: 'France',
    subtitle: 'A cathedral town',
    span: '300 BC to today',
    location: [48.4, 2.6],
    status: 'planned',
    blurb: 'Gallo-Roman town to the birthplace of Gothic, then châteaux, Baroque grandeur, Haussmann’s boulevards, Art Nouveau and Le Corbusier.',
  },
  {
    id: 'greece',
    name: 'Greece',
    subtitle: 'A city-state by the sea',
    span: '1500 BC to today',
    location: [37.9, 23.2],
    status: 'planned',
    blurb: 'Mycenaean citadel, the temple and the orders, the Hellenistic city, Byzantine churches, Ottoman and neoclassical Athens.',
  },
  {
    id: 'germany',
    name: 'Germany',
    subtitle: 'A free trading town',
    span: 'AD 50 to today',
    location: [51.2, 10.4],
    status: 'planned',
    blurb: 'Roman frontier, Romanesque cathedrals, brick Gothic and timber-framed streets, Baroque, the Bauhaus and post-war rebuilding.',
  },
  {
    id: 'usa',
    name: 'United States',
    subtitle: 'A town that becomes a city',
    span: 'AD 1000 to today',
    location: [40.6, -75.4],
    status: 'planned',
    blurb: 'Indigenous building, colonial and Federal houses, Greek Revival, the balloon frame, the skyscraper, the suburb and the mall.',
  },
  {
    id: 'china',
    name: 'China',
    subtitle: 'A walled town on a canal',
    span: '1000 BC to today',
    location: [31.3, 120.6],
    status: 'planned',
    blurb: 'Rammed earth and timber frame, the courtyard house, bracketed roofs, pagodas, gardens, treaty-port buildings and the modern high-rise city.',
  },
  {
    id: 'japan',
    name: 'Japan',
    subtitle: 'A castle town',
    span: '300 BC to today',
    location: [35.2, 136.0],
    status: 'planned',
    blurb: 'Pit houses and raised granaries, shrines and temples, the machiya town house, the castle, Meiji westernising and Metabolism.',
  },
  {
    id: 'india',
    name: 'India',
    subtitle: 'A city on a sacred river',
    span: '500 BC to today',
    location: [25.3, 82.9],
    status: 'planned',
    blurb: 'Stupas and rock-cut halls, the temple tower, Sultanate and Mughal domes, the haveli, colonial bungalows and Chandigarh.',
  },
  {
    id: 'islamic',
    name: 'The Islamic world',
    subtitle: 'A city with a great mosque',
    span: 'AD 650 to today',
    location: [33.5, 36.3],
    status: 'planned',
    blurb: 'The courtyard mosque, the souk, the caravanserai, the madrasa and the courtyard house, from Umayyad Damascus to today.',
  },
  {
    id: 'mesoamerica',
    name: 'Mesoamerica',
    subtitle: 'A ceremonial city',
    span: '1000 BC to today',
    location: [19.4, -99.1],
    status: 'planned',
    blurb: 'Platform mounds and pyramids, the ball court and the plaza, then the Spanish colonial grid and the modern Mexican city.',
  },
];

/** Every lineage of every loaded region, with its region, for the library and the compare view. */
export function allLineages() {
  return Object.values(REGIONS).flatMap((region) => region.lineages.map((lineage) => ({ region, lineage })));
}
