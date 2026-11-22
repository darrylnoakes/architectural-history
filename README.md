# A History of Architecture

An explorable, interactive history of architecture, told one place at a time. Each region is a single
town followed through its whole history. Every plot keeps its purpose while its buildings are rebuilt
in the manner of each age, so you can watch a family home go from Iron Age hut to low-energy flats
without leaving the spot.

Two regions are built:

- **England**: a market town on a river, 500 BC to today. 109 buildings. The Roman town falls into
  ruin and is forgotten; almost everything is rebuilt again and again.
- **Italy**: a city on a river in central Italy, 750 BC to today. 129 buildings. The city is never
  abandoned and keeps what it builds in stone, so the old centre stops rebuilding in the Middle
  Ages, the Renaissance and the Baroque, and the newer stages of each story stand on new ground:
  the villas outside the gate, the quarter of united Italy beyond the river, the estates at the edge.
  A wall runs round it between three gates and changes with them, from earth rampart to angled
  bastions, until most of it comes down for a boulevard after 1870.

What you can do in either:

- **Scrub or play through time.** Buildings rebuild in place; woodland retreats; tracks become
  Roman paving, cobbles and tarmac; the town spreads across the river. Nothing stands in a year
  when it could not have: England's Roman town falls into ruin after 420 and its priory after 1539;
  Italy's forum and amphitheatre after the Gothic War, its bridges in 1944; and only durable buildings
  survive as old neighbours in the modern town.
- **Three ways to move.** Turn the model like a diorama, walk the streets in first person, or fly a drone.
  Touch screens get an on-screen stick.
- **Click any building** for what it is, why it looks that way and what to look for, with the named
  features pinned on the model. A building whose inside is the point (a theatre, a mill) is whole
  in the townscape and opens up when you select it.
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
  house, or the English home beside the Italian one, with each region's eras on its own row.
- **Regions.** The title card opens a globe with the regions built and planned, and the routes the
  ideas travelled. Choosing a built region goes to its town in the same year. `docs/REGIONS.md` is
  the plan for adding more.

## Layout

This is a pnpm + Turborepo monorepo, split so that other regions and other ways of presenting the
same content can be added without rewriting it.

```
apps/
  town/              The "living town" UI (Vite + React + three.js). Deployed to Vercel.
packages/
  kit/               Procedural low-poly building kit: the Builder, the palette, shared types.
  engine/            Renderer set-up, sky and sun, camera modes (model / walk / fly), the time scale.
  region-england/    A region: eras, cross-pollination, the site (river, relief, roads, scenery), the
                     town plan, and 109 buildings in ten lineages (plus one-off extras), each a
                     generator function plus its card text.
  region-italy/      The same for Italy: 129 buildings in thirteen lineages.
docs/
  BUILDING_GUIDE.md  How to write a building.
  LINEAGES.md        The brief for every lineage and stage in the England region, and the timing rules.
  LINEAGES-italy.md  The brief for Italy.
  REGIONS.md         How regions fit the platform, and the plan for further ones.
tools/
  shot.mjs           Screenshots of buildings from the gallery page, for authoring.
```

A **region** is data: a list of eras, a list of lineages (a plot of land and the sequence of buildings
on it), the site the town stands on, and a town plan saying where each lineage stands, which plots stop
rebuilding and survive, and which appear late. A new region (France, China) is a new
`packages/region-*`, registered in `apps/town/src/regions.ts`; a new presentation (for example a long road where distance is time) is a new
`apps/*` that reads the same regions.

## Running it

```
pnpm install
pnpm dev            # http://127.0.0.1:5173
pnpm build
pnpm typecheck
```

`/gallery.html?lineage=home` shows a whole lineage in a row; `?lineage=home&id=roundhouse` shows one
building; add `&region=italy` for another region. `node tools/shot.mjs home roundhouse` (or
`italy/home atrium-house`) screenshots it (needs the dev server running).

**Graphics.** Under the ? button there is a choice of Full or Simple graphics; Simple turns off the
shadows and thins the trees for weak devices, and the choice is remembered. If the town is drawing
slowly at Full, it offers the switch itself.

Handy URL parameters: `/?y=1350` opens the town in a given year and skips the introduction;
`?r=italy` opens another region; `?q=low` (or `?q=high`) sets the graphics for that visit.

## Ideas for later

Recorded here so they are not lost; none of this is built.

- **Guided tour.** An optional mode that moves the camera from stop to stop and explains what
  changed and why, era by era.
- **Realistic look.** A toggle from the painted-model look to textured materials, richer lighting
  and vegetation. The kit already tags every surface with a named material, which is the hook for it.
- **The long road.** A second app where distance is time: one road, each era a district along it,
  with driving as well as walking and flying.
- **More regions.** France, the United States, China and others, each as its own town. The plan is
  in `docs/REGIONS.md`.
- **Links between regions.** Where an idea crossed a border and both ends are built ("Palladio
  reaches England"), let the entry open the other region in that year.
- **A date-range filter in the library**, beside the era filter.
- **Interiors.** Step inside the hall house, the church, the mill.
- **People and traffic.** Carts, market crowds, trains on the viaduct.
- **Town defences for England.** A lineage for the palisade, Roman wall, burh rampart and medieval
  town wall, as Italy has.
