import england from '@ah/england';
import italy from '@ah/italy';
import { TimeScale, formatYear } from '@ah/engine';
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

/** A region has a town to visit once its plots are laid out. */
function hasTown(region: Region | undefined): region is Region {
  return !!region && region.plots.length > 0;
}

/**
 * Regions whose content is built and loaded. A region joins the list when its town plan is laid out;
 * until then its buildings can be worked on in the gallery without showing here.
 */
export const REGIONS: Record<string, Region> = Object.fromEntries([england, italy].filter(hasTown).map((r) => [r.id, r]));

const scales = new Map<string, TimeScale>();
/** The timeline of a region: its eras laid out on a 0..1 bar. */
export function scaleOf(region: Region): TimeScale {
  let s = scales.get(region.id);
  if (!s) scales.set(region.id, (s = new TimeScale(region.eras)));
  return s;
}

function built(region: Region, blurb: string): RegionInfo {
  return {
    id: region.id,
    name: region.name,
    subtitle: region.subtitle,
    span: `${formatYear(region.start)} to today`,
    location: region.location,
    status: hasTown(region) ? 'ready' : 'planned',
    blurb,
  };
}

/**
 * Every region on the map. The planned ones are the places England's story already points to (see
 * the `region` field of its cross-pollination entries) and the other great building traditions.
 */
export const REGION_LIST: RegionInfo[] = [
  built(england, 'Roundhouses, a Roman town and its ruin, Saxon timber, Norman stone, Gothic, Tudor, Georgian, Victorian and modern, all on the same plots.'),
  built(italy, 'Etruscan and Roman beginnings, the classical orders at their source, the communes and their towers, the Renaissance, the Baroque and after: a city that was never abandoned.'),
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
    id: 'egypt',
    name: 'Egypt',
    subtitle: 'A city on the Nile',
    span: '3000 BC to today',
    location: [29.9, 31.2],
    status: 'planned',
    blurb: 'Mud brick and reed, the temple and the pyramid, Greek and Roman Egypt, Coptic churches, the mosques and houses of medieval Cairo, and the modern city.',
  },
  {
    id: 'israel',
    name: 'Israel',
    subtitle: 'A walled city in the hills',
    span: '1800 BC to today',
    location: [31.78, 35.22],
    status: 'planned',
    blurb: 'Canaanite and Israelite towns, the Temple, Herod’s masonry, Byzantine churches, the Dome of the Rock, Crusader and Mamluk building, Ottoman walls and the white modern city.',
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
