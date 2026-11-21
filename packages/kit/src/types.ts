import type { Builder } from './builder';

export type Vec3 = [number, number, number];

/** Something worth noticing on a building. `at` is in building-local metres and drives the in-world callout. */
export interface Feature {
  label: string;
  note: string;
  at?: Vec3;
}

export interface BuildingDef {
  /** Unique within the region, kebab-case, e.g. "wealden-hall-house". */
  id: string;
  /** Plain name of the building type, e.g. "Wealden hall house". */
  name: string;
  /** Architectural style or tradition, e.g. "Late medieval vernacular". */
  style: string;
  /** Display date, e.g. "c. 1420". */
  date: string;
  /** Two to four sentences: what it is, why it looks like this, what changed since its predecessor. */
  summary: string;
  /** Short list of the main materials. */
  materials: string[];
  /** Three to five things to look for, ideally each with an `at` anchor. */
  lookFor: Feature[];
  /** Real building this is modelled on, if it is a landmark cameo. */
  modelledOn?: string;
  /** Ids from the region's `influences` list that shaped this building. */
  influences?: string[];
  build(b: Builder): void;
}

/** What becomes of a building type when its time is up on a plot that has not already replaced it. */
export interface StageEnd {
  /** The year it goes out of use. */
  year: number;
  /**
   * ruin = abandoned and left standing roofless until something new is built;
   * cleared = pulled down, the plot left open until something new is built;
   * renew = rebuilt at once as the next building in the lineage (no plot keeps it longer than this).
   */
  fate: 'ruin' | 'cleared' | 'renew';
  /** One or two sentences on what happened, shown on the card while the plot stands ruined or empty. */
  note?: string;
}

export interface Stage {
  /** Year this building first replaces its predecessor (negative = BC). */
  from: number;
  /**
   * The last year buildings of this type were still being put up. Plots that lag behind the fashion
   * adopt it some way between `from` and this. Defaults to the year the next stage begins.
   */
  builtUntil?: number;
  /** Set when the type did not simply last until it was replaced. Types without it are durable. */
  end?: StageEnd;
  def: BuildingDef;
}

/**
 * What a plot is for. Lineage ids and names belong to their region; the kind is shared, so the
 * family home of one region can be set beside the family home of another.
 */
export type BuildingKind =
  | 'home'
  | 'workers'
  | 'elite'
  | 'worship'
  | 'power'
  | 'market'
  | 'work'
  | 'crossing'
  | 'culture'
  | 'hospitality'
  | 'farm'
  | 'defence'
  | 'transport';

export const KINDS: Record<BuildingKind, { label: string; blurb: string }> = {
  home: { label: 'Family home', blurb: 'The house of an ordinary, middling household' },
  workers: { label: 'Workers’ housing', blurb: 'Homes of labourers and the poor' },
  elite: { label: 'Great house', blurb: 'The home of the richest household in town' },
  worship: { label: 'Place of worship', blurb: 'The sacred site and its buildings' },
  power: { label: 'Seat of power', blurb: 'Where whoever rules the town lives or governs' },
  market: { label: 'Market', blurb: 'Where the town buys and sells' },
  work: { label: 'Workplace', blurb: 'Where the town makes things' },
  crossing: { label: 'River crossing', blurb: 'Fords and bridges' },
  culture: { label: 'Leisure and learning', blurb: 'Baths, theatres, halls and the like' },
  hospitality: { label: 'Inn', blurb: 'Food, drink and a bed for the night' },
  farm: { label: 'Farm', blurb: 'Rural buildings at the edge of the town' },
  defence: { label: 'Walls and gates', blurb: 'What kept the town safe, and marked where it ended' },
  transport: { label: 'Station', blurb: 'Where the railway and its successors arrive' },
};

export interface Lineage {
  id: string;
  name: string;
  kind: BuildingKind;
  /** One line on what this plot is and whose story it tells. */
  role: string;
  /** Maximum footprint [width along X, depth along Z] in metres. */
  plotSize: [number, number];
  /** If a river crosses the plot: the [z0, z1] band it occupies in plot-local metres. */
  river?: [number, number];
  stages: Stage[];
}

export type StreetSurface = 'track' | 'paved' | 'mud' | 'cobble' | 'setts' | 'macadam' | 'tarmac';

export interface Era {
  id: string;
  name: string;
  from: number;
  to: number;
  /** A few words under the era name. */
  tagline: string;
  /** Three or four sentences on what drives the architecture of the period. */
  summary: string;
  /** Short bullets: characteristic forms and ideas. */
  traits: string[];
  materials: string[];
  /** UI accent colour for the era band (sRGB hex). */
  color: number;
  /** Hints for the landscape renderer. */
  env: {
    streets: StreetSurface;
    /** 0 = open farmland, 1 = wildwood. */
    treeCover: number;
    /** Ground colour inside the settlement. */
    ground: number;
    /** Colour of farmland around the settlement. */
    fields: number;
    /** Rough radius of the built-up area in metres. */
    extent: number;
  };
}

export interface Influence {
  id: string;
  year: number;
  /** in = an idea arriving; out = an idea exported; home = a home-grown development. */
  dir: 'in' | 'out' | 'home';
  /** Where it came from or went to, e.g. "Île-de-France". */
  place: string;
  /** Region id this could link to once that region exists. */
  region?: string;
  title: string;
  text: string;
  /** Where on the globe the idea came from or went to: [latitude, longitude]. */
  at?: [number, number];
}

/** Where a lineage stands in the town. Local +Z (the building's front) is rotated by rotY. */
export interface Plot {
  id: string;
  lineage: string;
  x: number;
  z: number;
  rotY: number;
  seed: number;
  /** The plot is empty before this year (used for suburbs that appear late). */
  since?: number;
  /**
   * How far this plot lags behind the fashion, 0..1: it adopts each new stage this fraction of the
   * way through the years that type was being built, so neighbours do not all rebuild in the same year.
   */
  lag?: number;
  /**
   * Building id at which this plot stops rebuilding: the survivor that still stands in the modern town.
   * Only durable types (stages with no `end`) can be kept.
   */
  keep?: string;
  /** Building ids this plot never has: it goes straight from the stage before to the stage after. */
  skip?: string[];
  /** The plot shown first when the lineage is referred to. */
  hero?: boolean;
}

export interface Region {
  id: string;
  name: string;
  /** Where the town stands, for the world map: [latitude, longitude]. */
  location: [number, number];
  /** e.g. "A market town on a river". */
  subtitle: string;
  start: number;
  end: number;
  eras: Era[];
  influences: Influence[];
  lineages: Lineage[];
  plots: Plot[];
}
