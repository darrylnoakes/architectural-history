# Regions: plan

England was the first region and Italy is the second. This is how regions fit into the platform, and
the plan for adding more.

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
  the globe (`at`). They are listed with their dates under the Ideas button. Once both ends exist, an influence can
  become a link: "Gothic arrives from France" opens France in 1175.

## The site

Each region also owns the ground its town stands on (`Region.site`, in the region's `site.ts`): the
river, the relief, the roads and squares with the years they appear, the mix of trees, and the
incidental scenery of each age (an aqueduct, a railway, street lamps, parked cars). The app turns
that into terrain, streets and woodland; nothing about any one town is written into the app. Field
patterns and street surfaces come from the region's eras.

The region picker switches between built regions, keeping the year where the two stories overlap.
A region joins the app when its town plan (`plots.ts`) has plots in it; until then its buildings
can be written and reviewed in the gallery without appearing anywhere.

When two regions are compared, the timeline is one bar for both: each region's eras are drawn on
their own row, and a year sits at the average of where each region's own bar would put it.

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
6. **Site and town plan.** `site.ts` (river, relief, roads, squares, scenery) and `plots.ts`
   (which lineage stands where, which plots stop rebuilding and survive, which appear late).

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
| built | **Italy**: a city on a river, 750 BC to today | The source of half of what arrives in England: the Roman town, the Renaissance, Palladio, the Baroque. The strongest single comparison, and it needed no new kit primitives. |
| 1 | **France**: a cathedral town | The birthplace of Gothic, and England's nearest neighbour in every century. With Italy it completes the main European exchanges already named in England's influences. |
| 2 | **United States**: a town that becomes a city | The other end of England's exports (the Georgian house, the factory) and the source of the steel frame, the suburb and the mall. A short timeline, so a smaller build. |
| 3 | **China**: a walled town on a canal | The first tradition that owes nothing to Rome: timber frame, courtyard plan, the roof as the main event. Needs the curved-roof and bracket work above. |
| 4 | **Japan**, **India**, **Egypt**, **Israel** | Each a distinct tradition with its own logic; order by interest. Egypt and Israel between them also carry the story of Islamic building in the eastern Mediterranean, which has no region of its own. |
| later | **Greece**, **Germany**, **Mesoamerica** | Greece could instead be folded into Italy's early stages; Germany overlaps France and England more than the others. |

A region does not have to be complete to be useful. A first pass with five or six lineages (home,
elite, worship, power, market, work) gives the library and the compare view something to show, and
the rest can follow.
