# A History of Architecture

An explorable, interactive history of architecture. The first world is **England**: one market town on
a river, followed from 500 BC to today. Every plot keeps its purpose while its buildings are rebuilt
in the manner of each age, so you can watch a family home go from Iron Age roundhouse to low-energy
timber house without leaving the spot.

- **Scrub or play through time.** Buildings rebuild in place; woodland retreats; tracks become
  Roman paving, cobbles and tarmac; the town spreads across the river.
- **Three ways to move.** Turn the model like a diorama, walk the streets in first person, or fly a drone.
  Touch screens get an on-screen stick.
- **Click any building** for what it is, why it looks that way and what to look for, with the named
  features pinned on the model.
- **Lineage street.** Line up every building that ever stood on a plot, oldest to newest, to compare
  them side by side.
- **Ideas on the move.** Markers on the timeline show styles arriving from elsewhere (Gothic from
  France, Palladio from the Veneto) and leaving for elsewhere (the Georgian house to America).

## Layout

This is a pnpm + Turborepo monorepo, split so that other regions and other ways of presenting the
same content can be added without rewriting it.

```
apps/
  town/              The "living town" UI (Vite + React + three.js). Deployed to Vercel.
packages/
  kit/               Procedural low-poly building kit: the Builder, the palette, shared types.
  engine/            Renderer set-up, sky and sun, camera modes (model / walk / fly), the time scale.
  region-england/    The content: eras, cross-pollination, the town plan, and 108 buildings in
                     ten lineages (plus one-off extras), each a generator function plus its card text.
docs/
  BUILDING_GUIDE.md  How to write a building.
  LINEAGES.md        The brief for every lineage and stage in the England region.
tools/
  shot.mjs           Screenshots of buildings from the gallery page, for authoring.
```

A **region** is data: a list of eras, a list of lineages (a plot of land and the sequence of buildings
on it), and a town plan saying where each lineage stands. A new region (Rome, France, China) is a new
`packages/region-*`; a new presentation (for example a long road where distance is time) is a new
`apps/*` that reads the same regions.

## Running it

```
pnpm install
pnpm dev            # http://127.0.0.1:5173
pnpm build
pnpm typecheck
```

`/gallery.html?lineage=home` shows a whole lineage in a row; `?lineage=home&id=roundhouse` shows one
building. `node tools/shot.mjs home roundhouse` screenshots it (needs the dev server running).

Handy URL parameter: `/?y=1350` opens the town in a given year and skips the introduction.

## Ideas for later

Recorded here so they are not lost; none of this is built.

- **Guided tour.** An optional mode that moves the camera from stop to stop and explains what
  changed and why, era by era.
- **Realistic look.** A toggle from the painted-model look to textured materials, richer lighting
  and vegetation. The kit already tags every surface with a named material, which is the hook for it.
- **The long road.** A second app where distance is time: one road, each era a district along it,
  with driving as well as walking and flying.
- **More regions.** Rome, France, the United States, China and others, each as its own town, and
  links between them wherever an idea crossed a border: the cross-pollination entries already carry
  the id of the region they point to.
- **Interiors.** Step inside the hall house, the church, the mill.
- **People and traffic.** Carts, market crowds, trains on the viaduct.
- **Town defences.** A lineage for the palisade, Roman wall, burh rampart and medieval town wall.
