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
  /**
   * Small later alterations to the same building, oldest first: it keeps its name, its text and its
   * place in the lineage, and `build` asks `b.since(year)` to draw the altered pieces. In the town
   * only those pieces change. Use it for the kind of change that does not make a new building: a
   * drawbridge replaced by a fixed bridge, shutters added, a road surfaced. `note` is shown on the
   * card from that year on.
   */
  revisions?: { year: number; note: string }[];
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
  | 'transport'
  | 'castle'
  | 'monastery';

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
  castle: { label: 'Castle and château', blurb: 'The lord’s stronghold, and the country house it turned into' },
  monastery: { label: 'Abbey', blurb: 'A religious community and its buildings' },
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
    /** Size of one field in the farmland, [width, length] in metres. Long thin cells read as strips. */
    fieldSize?: [number, number];
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
  /**
   * A disaster that struck this plot and not its neighbours (shellfire, a bomb, a great fire):
   * whatever stood here in that year is left a ruin until the plot is next rebuilt. A plot that is
   * struck goes on to the later stages of its lineage; give it `keep` only for a building put up
   * after the disaster.
   */
  struck?: { year: number; note: string };
  /** The plot shown first when the lineage is referred to. */
  hero?: boolean;
}

/** A street or country road. It follows the ground; where it meets the river a bridge plot takes over. */
export interface Road {
  id: string;
  /** Polyline of [x, z] points. */
  pts: [number, number][];
  kind: 'main' | 'lane';
  /** Laid out in this year (omit for roads as old as the town). */
  since?: number;
  /** Built over or closed in this year. */
  until?: number;
}

export type TreeKind = 'round' | 'conifer' | 'poplar' | 'bush' | 'cypress' | 'pine' | 'olive';

/**
 * Something in the landscape that is not a plot building: a standing stone, a viaduct, street lamps,
 * parked cars. `build` works in world metres; `ground(x, z)` gives the height of the land there.
 */
export interface SiteProp {
  id: string;
  since?: number;
  until?: number;
  /**
   * Set when a walker must not pass through it (a town wall, say). The prop then declares its solid
   * parts with `b.collider(...)`, in world metres and outside any `b.group`.
   */
  solid?: boolean;
  build(b: Builder, ground: (x: number, z: number) => number): void;
}

/**
 * The ground the town stands on. World axes: +x east, +z south, y up; the main square is near the
 * origin and the river, if there is one, flows roughly along x.
 */
export interface Site {
  /** Middle of the area the camera may roam, and its radius in metres. */
  centre: [number, number];
  radius: number;
  river?: {
    /** z of the centre line at a given x. */
    z(x: number): number;
    /** Half the width of the channel. */
    half: number;
  };
  /** Height of the natural ground in metres, before the river channel is cut into it. */
  relief(x: number, z: number): number;
  roads: Road[];
  /** Open paved spaces, as rectangles. */
  squares: { x0: number; x1: number; z0: number; z1: number; since?: number }[];
  /** The woodland mix, most common first. `share` values are relative. */
  trees: { kind: TreeKind; share: number }[];
  /**
   * The area with earthworks (town ditches and the like): the ground is meshed finely enough there
   * to be dug into shape. Without it only the middle of the town is fine.
   */
  detail?: { x0: number; z0: number; x1: number; z1: number };
  /** Places trees never grow (beyond roads, plots, squares and the river, which are kept clear anyway). */
  clearings?: { x: number; z: number; r: number }[];
  props: SiteProp[];
  /** Wind turbines: each [x, z]. They are the one thing in the landscape that moves. */
  turbines?: { since: number; at: [number, number][] };
  /** Where the camera starts: the point it looks at, its distance, and its angles. */
  view?: { target: [number, number, number]; distance: number; azimuth: number; polar: number };
}

export interface Region {
  id: string;
  name: string;
  /** Where the town stands, for the world map: [latitude, longitude]. */
  location: [number, number];
  /** e.g. "A market town on a river". */
  subtitle: string;
  /** The welcome shown when the region is first opened: a headline and two or three sentences. */
  intro: { title: string; text: string };
  start: number;
  end: number;
  eras: Era[];
  influences: Influence[];
  lineages: Lineage[];
  plots: Plot[];
  site: Site;
}
