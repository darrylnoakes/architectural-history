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

export interface Stage {
  /** Year this building replaces its predecessor on the plot (negative = BC). */
  from: number;
  def: BuildingDef;
}

export interface Lineage {
  id: string;
  name: string;
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
   * way through that stage's span, so neighbours do not all rebuild in the same year.
   */
  lag?: number;
  /** Building id at which this plot stops rebuilding: the survivor that still stands in the modern town. */
  keep?: string;
  /** The plot shown first when the lineage is referred to. */
  hero?: boolean;
}

export interface Region {
  id: string;
  name: string;
  /** e.g. "A market town on a river". */
  subtitle: string;
  start: number;
  end: number;
  eras: Era[];
  influences: Influence[];
  lineages: Lineage[];
  plots: Plot[];
}
