# Regions: plan

England is the first region. This is the plan for adding others, and for what has to change in the
platform before the second one can be switched to.

## What already works across regions

- **Kinds.** Every lineage has a `kind` (`home`, `workers`, `elite`, `worship`, `power`, `market`,
  `work`, `crossing`, `culture`, `hospitality`, `farm`; see `KINDS` in `packages/kit/src/types.ts`).
  Lineage ids and names belong to a region; the kind is shared. It is what lets the library filter by
  type and the compare view put an English family home beside an Italian one.
- **The registry.** `apps/town/src/regions.ts` lists every region on the map (`REGION_LIST`, with
  planned ones) and the loaded ones (`REGIONS`). The library, the single-building viewer and the
  compare view read from `REGIONS`, so a new region's buildings appear in all three as soon as it is
  registered, before its town exists.
- **Cross-pollination.** An influence can name the `region` it came from or went to, and where on
  the globe (`at`). The region picker draws these as arcs. Once both ends exist, an influence can
  become a link: "Gothic arrives from France" opens France in 1175.

## What is still England-only

The town itself. The river, the relief, the roads, the square and the incidental scenery (stone
circle, viaduct, lamps, cars) live in `apps/town/src/world/layout.ts` and `scenery.ts`, not in the
region. Before a second town can be shown:

1. Move the site into the region as data (`Region.site`: river course or coastline, relief, roads
   with the years they appear, the square, scenery props with their years).
2. Make the engine take a region instead of importing England, and rebuild when the region changes.
3. Give the timeline a scale that can hold two regions with different eras (for compare across
   regions it currently uses the first region's eras).

None of this is needed to start writing a region's buildings: they can be authored and reviewed in
the gallery and seen in the library and compare view first.

## How a region gets built

The England process, which worked and should be repeated:

1. **Brief.** A `docs/LINEAGES-<region>.md` like England's: the town's premise, the eras, and for
   each lineage its stages with ids and years. Decide here which kinds the region has (a Chinese
   town has no inn lineage in the English sense, but it has a teahouse; an American town's story
   starts late).
2. **Eras and influences** for the region, written first so buildings can cite them.
3. **Buildings.** One author per lineage in parallel, each working against the gallery and the
   building guide. England took ten authors for 109 buildings.
4. **Timing.** Build windows, endings and survivors (`builtUntil`, `end`, `keep`), so no year shows
   anything that could not have stood.
5. **Fact-check.** An independent pass over all card text, era summaries and influences.
6. **Town plan.** Plots, roads and scenery, once the site is data (above).

## Kit work other traditions will need

The kit was written with European buildings in mind. Known gaps:

- **Curved roofs.** Upturned eaves and sagging ridge lines (China, Japan) need a roof primitive
  with a curved profile; `gable` and `hip` are straight.
- **Bracket sets.** Dougong under the eaves, at least as a repeated block.
- **Pointed and bulbous domes, minarets.** `lathe` covers the forms; a ribbed or tiled surface may
  need help.
- **Screens and lattices.** Jali, mashrabiya, shoji: a pierced panel primitive.
- **Terraced platforms and stepped pyramids.** Possible with boxes; a helper would save effort.

These are platform fixes, to be made as the first region that needs them is written.

## Order

Suggested, with reasons. Each is a town followed through time, like England.

| Order | Region | Why here |
|---|---|---|
| 1 | **Italy**: a city on a river, 750 BC to today | The source of half of what arrives in England: the Roman town, the Renaissance, Palladio, the Baroque. The strongest single comparison, and it needs no new kit primitives. |
| 2 | **France**: a cathedral town | The birthplace of Gothic, and England's nearest neighbour in every century. With Italy it completes the main European exchanges already named in England's influences. |
| 3 | **United States**: a town that becomes a city | The other end of England's exports (the Georgian house, the factory) and the source of the steel frame, the suburb and the mall. A short timeline, so a smaller build. |
| 4 | **China**: a walled town on a canal | The first tradition that owes nothing to Rome: timber frame, courtyard plan, the roof as the main event. Needs the curved-roof and bracket work above. |
| 5 | **Japan**, **the Islamic world**, **India** | Each a distinct tradition with its own logic; order by interest. |
| later | **Greece**, **Germany**, **Mesoamerica** | Greece could instead be folded into Italy's early stages; Germany overlaps France and England more than the others. |

A region does not have to be complete to be useful. A first pass with five or six lineages (home,
elite, worship, power, market, work) gives the library and the compare view something to show, and
the rest can follow.
