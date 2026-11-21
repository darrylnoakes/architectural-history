# A History of Architecture

An explorable, interactive history of architecture. The first world is **England**: one market town on
a river, followed from 500 BC to today. Every plot keeps its purpose while its buildings are rebuilt
in the manner of each age, so you can watch a family home go from Iron Age roundhouse to low-energy
timber house without leaving the spot.

- **Scrub or play through time.** Buildings rebuild in place; woodland retreats; tracks become
  Roman paving, cobbles and tarmac; the town spreads across the river. Nothing stands in a year
  when it could not have: the Roman town falls into ruin after 420, the priory after 1539, and only
  durable buildings survive as old neighbours in the modern town.
- **Three ways to move.** Turn the model like a diorama, walk the streets in first person, or fly a drone.
  Touch screens get an on-screen stick.
- **Click any building** for what it is, why it looks that way and what to look for, with the named
  features pinned on the model.
- **Lineage street.** Line up every building that ever stood on a plot, oldest to newest, to compare
  them side by side.
- **Ideas on the move.** Markers on the timeline show styles arriving from elsewhere (Gothic from
  France, Palladio from the Veneto) and leaving for elsewhere (the Georgian house to America). The
  Ideas button lists them all; choosing one goes to that year.
- **The library.** Every building with a picture rendered from its model, filtered by region, type
  and era, or searched by name, style and material.
- **Through time.** Any one lineage on its own: turn the model round and step through every building
  that stood on the plot.
- **Compare.** Any two lineages side by side, sharing one timeline: the family home beside the great
  house now, the English home beside the Italian one once a second region exists.
- **Regions.** The title card opens a globe with the regions built and planned, and the routes the
  ideas travelled. `docs/REGIONS.md` is the plan for adding them.

## Layout

This is a pnpm + Turborepo monorepo, split so that other regions and other ways of presenting the
same content can be added without rewriting it.

```
apps/
  town/              The "living town" UI (Vite + React + three.js). Deployed to Vercel.
packages/
  kit/               Procedural low-poly building kit: the Builder, the palette, shared types.
  engine/            Renderer set-up, sky and sun, camera modes (model / walk / fly), the time scale.
  region-england/    The content: eras, cross-pollination, the town plan, and 109 buildings in
                     ten lineages (plus one-off extras), each a generator function plus its card text.
docs/
  BUILDING_GUIDE.md  How to write a building.
  LINEAGES.md        The brief for every lineage and stage in the England region.
  REGIONS.md         The plan for further regions, and what the platform needs first.
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

Handy URL parameters: `/?y=1350` opens the town in a given year and skips the introduction;
`?q=low` turns off shadows and thins the trees for weak devices.

## Ideas for later

Recorded here so they are not lost; none of this is built.

- **Guided tour.** An optional mode that moves the camera from stop to stop and explains what
  changed and why, era by era.
- **Realistic look.** A toggle from the painted-model look to textured materials, richer lighting
  and vegetation. The kit already tags every surface with a named material, which is the hook for it.
- **The long road.** A second app where distance is time: one road, each era a district along it,
  with driving as well as walking and flying.
- **More regions.** Italy, France, the United States, China and others, each as its own town, and
  links between them wherever an idea crossed a border. The plan is in `docs/REGIONS.md`.
- **A date-range filter in the library**, beside the era filter.
- **Interiors.** Step inside the hall house, the church, the mill.
- **People and traffic.** Carts, market crowds, trains on the viaduct.
- **Town defences.** A lineage for the palisade, Roman wall, burh rampart and medieval town wall.
