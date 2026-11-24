# Building guide

How to write the procedural buildings that fill a region. Read this, then read the exemplar
`packages/region-england/src/extras/georgian-chapel.ts` and the primitives in
`packages/kit/src/builder.ts` (the doc comment on each method is the API reference). The finished
England lineages in `packages/region-england/src/lineages/` are worked examples of every kind of
building; each region's brief is `docs/LINEAGES.md` (England) or `docs/LINEAGES-<region>.md`.

## What a building is

A building is a `BuildingDef` (see `packages/kit/src/types.ts`): card text for the learner, plus a
`build(b)` function that assembles low-poly geometry with the `Builder`. A **lineage** is one plot
of land and the sequence of buildings that stood on it; each `Stage` says which building replaces
its predecessor and from what year.

The look is a **painted model town**: flat-shaded, simple forms, clear silhouettes, soft material
colours. Detail should be the detail that *identifies the style*: the shape of an arch, the pitch of
a roof, the rhythm of the windows, a jetty, a buttress, a chimney. A viewer who has never studied
architecture should be able to tell two adjacent stages apart at a glance from a drone, and find
the named features up close on foot.

## Conventions

- Units are metres. +Y is up, ground is y = 0. **The front faces +Z.** Centre the building on the
  origin and keep it inside the lineage's `plotSize` (`[width along X, depth along Z]`).
- `at` is always the **centre of a primitive's base**, so pieces stack: walls 3 m high at y 0 take a
  roof `at: [0, 3, 0]`.
- Colours come from the palette `P` (named after real materials). Use `tint(colour, ±0.05)` and
  `mix(a, b, t)` for variations rather than inventing hex values. `mat: 'glass'` gives a glossy
  reflective surface for curtain walls and water; ordinary windows are matte dark panels.
- Wall details (`panel`, `window`, `frame`) sit on a wall *surface*: give the point on the surface
  as `at` (bottom centre of the detail) and the direction the wall faces as `facing`
  (`'+z' | '-z' | '+x' | '-x'` or an angle).
- Be deterministic. Use `b.rand()`, `b.range()`, `b.pick()`, `b.chance()`, never `Math.random()`.
  The same lineage is placed on several plots with different seeds, so use these for honest
  variation (brick tone, door colour, which side the chimney is on, one bay more or less) while
  keeping every seed recognisably the same building type. `b.variant` is 0 on the hero plot.
- Budget: aim for 1,500 to 6,000 triangles per building; the gallery prints the count.
- Walk collisions default to the bounding box. If the building has a courtyard, an open ground
  floor or separate blocks, call `b.collider(w, d, { at })` per solid block instead, or
  `b.noCollide()` for things you can wander through. Use `b.deck(...)` for walkable raised surfaces.
- If the inside is the point (a theatre's auditorium, the machine in a mill), build it, and leave the
  roof or a corner off only `if (b.cutaway)`. In the townscape that is false and the building must
  be whole; it is true when the building is selected or shown on its own (the gallery shows the
  open form; add `&cutaway=0` to its URL for the closed one). Everything outside the cut must be
  the same in both.
- When one building replaces another on a plot, the town compares the two models piece by piece
  (each `b.box`, `b.gable`, `b.add` and so on is a piece). Pieces that are exactly where they were
  stay put, pieces that are gone shrink away and new ones grow in their place. So when a stage is
  the same building altered (a choir added to a nave, a town hall built on to a belfry), build the
  surviving parts with the same code and the same numbers in both stages, from a shared function,
  and the change happens in place. A stage that is a different building needs no care: nothing
  matches and the whole of it is replaced. Random position jitter stops a piece matching; the small
  random lightness of colours does not. From `apps/town`, `npx tsx tools/morph-report.ts <region> <lineage>` lists how
  much each stage keeps of the one before, and from the repo root `node tools/morph-shot.mjs`
  captures a change in the town in slow motion.
- A small dated alteration that does not make a new building (a drawbridge replaced by a fixed
  bridge, a road surfaced with asphalt, lettering removed) is a revision, not a stage: list
  `revisions: [{ year, note }]` on the definition and ask `b.since(year)` in `build`. The card keeps
  its title and text and gains the note from that year; in the town only the altered pieces change.
  Build the pieces a revision touches last and with `jitter: false`, so nothing else shifts. Two or
  three revisions at most. `tools/shot.mjs … --year=1950` shows a model as it stood in a year.
- A ditch, a moat or a sunken yard is dug out of the ground itself, never painted on it:
  `b.dig(outline, depth, { slope, color, open })` lowers the ground inside an outline of (x, z)
  points, and `b.trench(x0, x1, z0, z1, depth, { slope, color })` is the straight case, a ditch
  along X with both ends open. The town's terrain, the viewer, the lineage street and the gallery
  all reshape their ground to match, and walkers go down into it. Rules:
  - Build whatever stands in or beside the hollow down to `-depth` (a bridge's trestles, the foot
    of a wall, an island outwork), and give a bridge over it a `b.deck(...)` so it can be walked.
  - The ground cannot make a vertical face. It changes height over `slope` metres (default 1.5,
    and not much less than 1.5 can be shown in the town). An earth ditch simply uses that slope. A
    ditch with walled sides carries its outline about 2 m behind the face of the wall, and the
    model draws the wall down to the bottom and something (a path, a coping, a strip of turf) over
    the 2 m behind it.
  - Edges listed in `open` have no slope: use them where one cut carries on into the next (edge
    i runs from point i to point i + 1). Two cuts that only touch along sloped edges leave a ridge
    between them.
  - A road stops at the edge of a cut and the model's own bridge or causeway carries it over, so
    a hollow across a road must have one. Nothing may be dug across a road that has no bridge.
  - `dig` follows `b.group` moves and turns. `color` paints the bottom.

Useful helpers: `b.beam(p0, p1, w, h, colour)` for any bar between two points (rafters, braces,
struts, cables, railings), `b.lathe(profile, colour, { start, sweep })` for part of a turn (an apse,
a bow front), `b.sym((side) => …)` for mirrored pairs, `b.group({ at, rotY }, () => …)` for a
moved or rotated sub-assembly, `spread(n, a, b)` and `linspace(n, a, b)` for evenly spaced items.
For shapes the primitives do not cover, `b.extrude(points, depth, …)` (any silhouette) and
`b.lathe(profile, …)` (anything turned) go a long way, and `b.add(threeGeometry, colour)` takes
any THREE geometry (region packages depend on `three`, so `import * as THREE from 'three'` works).
Write local helper functions freely inside your lineage folder.

## Accuracy

This is a learning tool. Dates, terms and claims on the card must be right for **the region**:
what was true of Florence in 1450 was not true of York.

- Model the *typical* building of its type and decade, not a fantasy version. Proportions matter
  more than ornament: storey heights, roof pitch (thatch is steep, about 50°; slate can be 30°;
  lead is nearly flat), window size and spacing.
- Where the brief names a landmark cameo, model it on that building and credit it in `modelledOn`.
- `summary`: two to four plain sentences. Say what it is, why it looks the way it does (materials,
  technology, money, who built it), and what changed from the stage before. No purple prose.
- `lookFor`: three to five features a beginner can find on the model, each with the correct term
  as `label`, a one-sentence `note`, and an `at` anchor placed on or just outside that feature
  (the gallery shows anchors as pink dots; check they sit where they should).
- `influences`: ids from the region's `influences.ts` where one clearly applies. Leave it out
  rather than cite a loose fit.
- Writing style: British spelling, no em dashes, no exclamation marks, no "iconic".

## Files

```
packages/region-<region>/src/lineages/<lineage>/
  index.ts            default export: the Lineage (id, name, role, plotSize, stages)
  01-<building>.ts    one file per building, exporting a BuildingDef
  02-<building>.ts
  shared.ts           optional local helpers
```

## Preview loop

Start the dev server with `pnpm dev` (http://127.0.0.1:5173).

```
node tools/shot.mjs <lineage> <buildingId> [views]   # default views: iso,front
node tools/shot.mjs <lineage> <buildingId> iso,back,eye,top,side
node tools/shot.mjs <lineage> all                     # every stage
node tools/shot.mjs <lineage> row                     # the whole lineage side by side
node tools/shot.mjs italy/<lineage> <buildingId>      # a lineage of another region
node tools/shot.mjs <lineage> <buildingId> iso --closed      # the closed form of a building with a cut-away
node tools/shot.mjs <lineage> <buildingId> iso --variant=1   # as built on a plot other than the main one
```

PNGs land in `shots/<lineage>/` (or `shots/<region>/<lineage>/`). The tool queues itself: at most
three screenshots run at a time however many people are calling it, so a shot can take a minute
when the machine is busy. If an image comes back blank or shows an error from someone else's
file, run it again. **Open them and look.** Check against this list:

1. Does it read instantly as the building type and period? Would it be confused with its neighbours
   in the lineage?
2. Is anything floating, sunk, inside-out, z-fighting, or missing a face? Are roofs seated on walls?
3. Do windows and doors sit on the wall surfaces and face outward? Is the back as finished as the front?
4. Is the scale right against the 1.7 m figure? Doors about 2 m, storeys 2.4 to 4 m.
5. Are the pink feature anchors on the features they name?
6. Does it fit the white plot outline?

Iterate until each building passes, then shoot the `row` and check the lineage tells its story:
the sequence should show clear, legible change from stage to stage.

Type-check with `pnpm typecheck`.

The dev server reloads the gallery whenever any source file is saved, which spoils a screenshot in
progress. If several people or agents are editing at once, run a second server with reloading off
(`NO_HMR=1 pnpm --filter @ah/town exec vite --port 5174`) and point the tool at it:
`GALLERY_URL=http://127.0.0.1:5174 node tools/shot.mjs …`. It still reads every file fresh on each
shot.

## Timing

A lineage's `index.ts` lists its stages. Besides `from`, a stage can say when its type stopped
being built (`builtUntil`) and what became of it if nothing replaced it in time (`end`: renewed,
ruined or cleared). Ruins need no modelling: any building can be shown as its own ruin. The rules
are set out under "Timing rules" in `docs/LINEAGES.md`.
