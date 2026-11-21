# England: lineage briefs

The town is a fictional but typical English market town on a river crossing, followed from about
500 BC to the present. Ten plots each carry a **lineage**: the sequence of buildings of one kind
that stood there. This file is the brief each lineage was built from, kept up to date with the
stage ids and `from` years actually in `packages/region-england/src/lineages/*/index.ts`.

Eras: Iron Age (-500 to 43), Roman (43 to 410), Anglo-Saxon (410 to 1066), Norman (1066 to 1190),
Gothic (1190 to 1485), Tudor and Jacobean (1485 to 1660), Stuart and Georgian (1660 to 1837),
Victorian (1837 to 1901), Edwardian and Interwar (1901 to 1945), Post-war Modern (1945 to 1980),
Contemporary (1980 to 2025).

Residential lineages (home, cottage, merchant) are placed on several plots with different seeds,
so they must vary sensibly with `b.rand()` / `b.pick()`.

## Timing rules

What stands on a plot in any given year has to be something that could really have stood there.
Three things in the data make that so (the logic is `plotSchedule` in `packages/engine/src/time.ts`):

- **`from` and `builtUntil`** bracket the years a type was actually being built. Plots other than
  the principal one lag behind the fashion, but only within that window: a 1930s semi is never
  put up in 1950.
- **`end`** says what happens to a type whose time ran out before anything replaced it. `renew`
  rebuilds it as the next stage (no plot keeps a sunken Saxon hut past about 960); `ruin` leaves
  it standing roofless (every Roman building from about 420, the priory from 1539); `cleared`
  leaves open ground (the playhouse, pulled down in 1644).
- **Survivors.** A plot may `keep` one building for good, which is how a Wealden hall house or a
  Georgian town house comes to stand among newer neighbours today. Only durable types (those with
  no `end`) can be kept.

---

## home: "The Family Home"

`plotSize: [14, 18]`. The house of an ordinary, middling family: a farmer, then a craftsman or
shopkeeper, then a clerk. Front (+Z) faces the street. Where houses of the type were attached,
build what stands on the plot honestly (a pair of semis, two or three houses of a terrace with
"ours" marked by a brighter door); leave a small yard or garden where typical.

| from | id | building |
|---|---|---|
| -500 | `roundhouse` | Iron Age roundhouse: wattle-and-daub ring wall, steep conical thatch, porch facing south-east |
| 80 | `roman-strip-house` | Romano-British strip house: long narrow shop-and-dwelling, gable end to the street with an open shop front, tile roof |
| 450 | `saxon-grubenhaus` | Early Saxon sunken-featured building (Grubenhaus) with a small post-built house beside it; thatch to the ground |
| 880 | `late-saxon-house` | Timber town house on a burh plot, the type built from late Saxon times until about 1200: plank-walled, thatched, gable end to the street, yard with workshop, well and pits |
| 1250 | `cruck-house` | Cruck-framed house: pairs of great curved timbers from ground to ridge, wattle panels, thatch |
| 1420 | `wealden-hall-house` | Wealden hall house: open hall in the centre, jettied bays each end under one hipped roof |
| 1560 | `tudor-jettied-house` | Tudor town house: close-studded frame, jettied upper floor, big brick chimney stack, glazed mullioned windows |
| 1720 | `georgian-townhouse` | Georgian town house: red brick, sash windows shrinking upward, doorcase with fanlight, parapet |
| 1860 | `victorian-terrace` | Victorian terraced house: bay window, polychrome brick bands, slate roof, chimney pots, back extension |
| 1934 | `interwar-semi` | 1930s semi-detached: two-storey bow windows, mock-Tudor gable, pebbledash, hipped roof, garage |
| 1962 | `sixties-house` | 1960s modern house (Span-style): mono-pitch or flat roof, tile-hanging or timber panels, picture windows, carport |
| 2012 | `eco-house` | Contemporary low-energy house: timber cladding, asymmetric roof with solar panels, triple-glazed tall windows, heat pump |

## cottage: "The Row"

`plotSize: [26, 14]`. Homes of labourers and the poor: the same people who built everything else.
Mostly a row of several small dwellings facing the street (+Z). This lineage shows how the cheapest
housing changed, and ends by going up.

| from | id | building |
|---|---|---|
| -500 | `small-roundhouses` | Two or three small roundhouses with a pen and a raised granary |
| 100 | `roman-workers-row` | Row of simple timber-and-clay Roman town cottages or workshops with thatch or tile |
| 450 | `saxon-huts` | Cluster of small Saxon post-built huts with a fenced toft |
| 1100 | `cob-cottages` | Pair of one-room cob cottages with thatch, no chimneys |
| 1350 | `medieval-cottage-row` | Row of small timber-framed one-up cottages built to rent (Spon Street type) |
| 1600 | `tudor-almshouses` | Almshouse row: a charitable foundation in brick or timber frame with tall chimneys and a central gable or plaque |
| 1770 | `weavers-cottages` | Three-storey weavers' cottages with long "weavers' windows" lighting the top-floor loomshop |
| 1850 | `back-to-backs` | Victorian back-to-back terrace: one room per floor, tunnel entry to a court with shared privies and wash-house, corner shop |
| 1921 | `council-cottages` | "Homes fit for heroes": cottage-style council houses in blocks of four with gardens (Tudor Walters standard) |
| 1966 | `tower-block` | System-built tower block of flats, about 14 storeys, with balconies and a podium. Cameo: Balfron/Trellick Tower spirit, simplified |
| 2014 | `apartment-block` | Contemporary mid-rise apartments, 5 or 6 storeys: brick and metal cladding, inset balconies, ground-floor shop, roof terrace |

## merchant: "The Big House"

`plotSize: [20, 24]`. The home of the richest household in town: where new fashions arrive first.

| from | id | building |
|---|---|---|
| -500 | `great-roundhouse` | A large roundhouse compound: big house, ancillary hut, fenced yard |
| 120 | `roman-townhouse` | Roman courtyard town house (domus): wings round a colonnaded garden, tiled roofs, one heated room with a flue |
| 650 | `saxon-thegns-hall` | Thegn's timber hall with a detached bower, plank walls, shingled roof |
| 1150 | `norman-stone-house` | Norman stone town house: living hall on the first floor over a storage undercroft, round-arched two-light windows. Cameo: Jew's House, Lincoln |
| 1330 | `merchants-hall` | Medieval merchant's house: stone-vaulted shop and undercroft to the street, timber hall behind |
| 1500 | `tudor-merchants-house` | Wealthy Tudor merchant's house: three jettied storeys, carved bargeboards, oriel windows, decorative framing |
| 1630 | `jacobean-brick-house` | Jacobean brick house with shaped "Dutch" gables, mullion-and-transom windows, strapwork porch |
| 1700 | `queen-anne-house` | Queen Anne house: seven bays of red brick, hipped roof with dormers, modillion cornice, shell-hood door, tall chimneys |
| 1790 | `regency-villa` | Late Georgian / Regency villa: stucco, shallow slate roof with deep eaves, bow front, iron balcony, Greek Doric porch |
| 1865 | `victorian-villa` | High Victorian villa, Italianate or Gothic: asymmetric, tower or turret, bays, ornate bargeboards, conservatory |
| 1905 | `arts-and-crafts-house` | Arts and Crafts house: roughcast walls, sweeping tiled roof, battered buttresses, long bands of small windows. Cameo: Voysey |
| 1936 | `modernist-villa` | White Modernist villa: flat roof, ribbon windows, curved stair tower, roof terrace. Cameo: High and Over / Joldwynds type |
| 1998 | `glass-house` | Contemporary architect's house: glass and steel or timber box, frameless glazing, flat sedum roof, courtyard |

## worship: "The Church"

`plotSize: [26, 46]`. The sacred site. Long axis is Z: **the west end (tower, main door) is at +Z and
the east end (altar) at -Z.** The story here is persistence: once the stone church exists it is
never replaced, only enlarged and altered, so later stages should visibly keep earlier fabric
(the Norman nave and doorway survive inside the Gothic church; the Perpendicular tower outlasts all).

| from | id | building |
|---|---|---|
| -500 | `iron-age-shrine` | Small rectangular timber shrine in a ditched and fenced sacred enclosure, with carved posts |
| 120 | `romano-celtic-temple` | Romano-Celtic temple: tall square cella with a lower lean-to ambulatory all round, within a walled precinct |
| 410 | `ruined-temple` | The temple roofless and collapsing, half-robbed, with a few early graves |
| 680 | `saxon-church` | Anglo-Saxon church: very tall narrow nave, small square chancel, tiny windows, long-and-short quoins, pilaster strips. Cameo: Escomb / Bradwell |
| 1120 | `norman-church` | Norman church: nave, chancel with apse, squat west tower, round-arched windows, chevron doorway, flat buttresses |
| 1240 | `early-english-church` | Early English Gothic: aisles added, lancet windows, steep roofs, buttresses, a broach spire on the tower |
| 1340 | `decorated-church` | Decorated Gothic: wider aisles with traceried windows, a big east window, south porch, taller spire |
| 1470 | `perpendicular-church` | Perpendicular "wool church": clerestory, low-pitched lead roofs behind battlements, huge windows, tall west tower with pinnacles (spire gone) |
| 1868 | `victorian-restoration` | Victorian restoration: steep new roofs, a vestry, a lychgate, a clock on the tower, churchyard yews and gravestones |

## power: "The Seat of Power"

`plotSize: [44, 44]`. Whoever rules the town lives or governs here. Front (+Z) faces the town.
Large and complex: use `collider()` per block and `deck()` for the motte.

| from | id | building |
|---|---|---|
| -500 | `chieftains-enclosure` | Hillfort-style enclosure: bank, ditch and palisade with a timber gate, the chief's great roundhouse and four-post granaries inside |
| 75 | `forum-basilica` | Roman forum and basilica: colonnaded courtyard with an aisled hall across the back, pedimented entrance |
| 600 | `saxon-great-hall` | Saxon lord's great hall: long timber hall with bowed walls, buttress posts, shingled roof, carved gables, within a fence. Cameo: Yeavering |
| 1068 | `motte-and-bailey` | Norman motte-and-bailey: timber tower on an earth mound, palisaded bailey with hall and stables, timber gatehouse and bridge |
| 1130 | `stone-keep` | Square stone keep with corner turrets, forebuilding and battlements on the site, stone curtain wall. Cameo: Rochester / Hedingham |
| 1290 | `edwardian-castle` | Castle enlarged: twin-towered gatehouse, round corner towers, curtain wall with wall-walk, great hall in the bailey |
| 1575 | `elizabethan-manor` | Castle abandoned; an Elizabethan manor replaces it: E-plan, brick, huge mullioned windows, tall chimneys, a fragment of ruined castle wall kept in the garden |
| 1735 | `palladian-hall` | Palladian town hall / shire hall: rusticated base, giant portico with pediment, Venetian window, hipped roof and cupola |
| 1874 | `gothic-revival-town-hall` | Victorian Gothic Revival town hall: polychrome brick and stone, pointed arcades, steep roofs, tall clock tower. Cameo: Manchester Town Hall, reduced |
| 1967 | `brutalist-civic-centre` | Brutalist civic centre: board-marked concrete office slab on pilotis, a drum-shaped council chamber, raised plaza |
| 2008 | `civic-hub` | Contemporary civic hub and library: glazed atrium, timber fins, green roof, the 1874 clock tower retained beside it |

## market: "The Market"

`plotSize: [22, 18]`. An island in the middle of the market square, seen from all sides, so every
face matters. Trade is why the town exists.

| from | id | building |
|---|---|---|
| -500 | `trading-ground` | Open ground with four-post granaries, storage pits and a few hurdle stalls |
| 90 | `roman-macellum` | Roman market building: row of shops (tabernae) behind a colonnaded portico, tiled roof |
| 750 | `saxon-market` | Open market: timber stalls and a wooden preaching cross on a stepped base |
| 1200 | `norman-market-cross` | Tall stone market cross on steps, with thatched stalls and a set of stocks (the age of market charters) |
| 1480 | `gothic-buttercross` | Gothic market cross: open octagonal stone shelter with pointed arches, buttresses, pinnacles and a central lantern. Cameo: Chichester / Malmesbury |
| 1590 | `tudor-market-hall` | Timber-framed market hall raised on oak posts: open trading floor below, town chamber above. Cameo: Ledbury |
| 1750 | `georgian-market-house` | Georgian market house: stone arcade below, assembly room with pediment and cupola above. Cameo: Abingdon |
| 1865 | `victorian-market-hall` | Victorian covered market: cast-iron and glass roof behind a polychrome brick front with a big arched entrance |
| 1932 | `art-deco-store` | Art Deco department store: faience-tiled front, long bands of metal windows, rounded corner, fin sign, flat roof |
| 1964 | `shopping-precinct` | Post-war shopping precinct: two-storey concrete range with a canopy, upper walkway, mosaic panel, clock |
| 2005 | `market-pavilion` | Contemporary market pavilion: timber-and-glass hall with a sweeping roof, open stalls spilling into the square |

## work: "The Works"

`plotSize: [36, 22]`. Where the town makes things. Front (+Z) faces the lane; **the river runs along
the back: its near bank is at local z = -11** (water at y = -1.2), so waterwheels, wharves and
loading doors go on the -Z side.

| from | id | building |
|---|---|---|
| -500 | `iron-age-smithy` | Open-sided smithy with a bowl furnace, a pottery clamp kiln and a weaving hut with an upright loom |
| 100 | `roman-granary-and-kiln` | Roman buttressed granary (horreum) on a raised floor, with an updraught pottery kiln and a workshop |
| 800 | `saxon-watermill` | Small Saxon watermill with a horizontal or undershot wheel, timber sluice, thatched roof. Cameo: Tamworth |
| 1090 | `norman-watermill` | Norman manorial watermill: stone base, timber upper, undershot wheel, mill race (Domesday counted about 6,000) |
| 1320 | `tithe-barn` | Great medieval tithe barn: stone, buttressed, immense tiled roof, two tall cart porches, with the mill beside it |
| 1590 | `fulling-mill` | Tudor cloth works: fulling mill with waterwheel, timber-framed workshop, tenter frames for drying cloth |
| 1785 | `arkwright-mill` | Water-powered cotton mill: plain five-storey brick box with rows of small windows, bell cupola, wheel house. Cameo: Cromford / Masson |
| 1870 | `victorian-mill` | Steam mill: larger, iron-framed, engine house and boiler house, a very tall chimney, north-light weaving sheds |
| 1933 | `art-deco-factory` | Art Deco "by-pass" factory: long white front, central tower, strip windows, coloured faience bands. Cameo: Hoover Building |
| 1965 | `sixties-factory` | Post-war factory: saw-tooth north-light roof, curtain-walled office block, loading bays |
| 2016 | `timber-workspace` | Contemporary maker space and studios in mass timber: saw-tooth solar roof echoing the old sheds, big glazing, riverside terrace |

## crossing: "The River Crossing"

`plotSize: [14, 30]`. **The road runs along Z (through the origin); the river flows along X between
z = -8 and z = +8.** Banks are at y = 0, the water surface at y = -1.2, the bed at about y = -2.2.
A bridge deck must meet the road (y = 0) at z = ±13 and may hump in between. Call
`b.noCollide()` and `b.deck(width, 26, crownY, { yEnds: 0 })` so walkers can cross.
Width grows with traffic: 3 m in the Middle Ages to 9 m for cars.

| from | id | building |
|---|---|---|
| -500 | `ford` | Ford with stepping stones, a hurdle causeway on the banks and a dugout canoe |
| 120 | `roman-timber-bridge` | Roman bridge: timber trestle deck on squared stone piers with cutwaters |
| 420 | `ruined-piers` | The bridge fallen: broken stone piers in the stream, and a rope ferry |
| 950 | `saxon-plank-bridge` | Saxon timber bridge on pile trestles with a plank deck and rails |
| 1210 | `medieval-stone-bridge` | Medieval stone bridge: pointed arches, triangular cutwaters with pedestrian refuges, a small bridge chapel. Cameo: Wakefield / St Ives |
| 1800 | `iron-bridge` | Cast-iron arch bridge: one span of five ribs with ring-and-ogee spandrels, stone abutments. Cameo: the Iron Bridge, Coalbrookdale |
| 1885 | `victorian-truss-bridge` | Wrought-iron lattice truss bridge on stone piers with ornate lamp standards, wide enough for a tram |
| 1936 | `concrete-arch-bridge` | Reinforced-concrete arch bridge with open spandrels, Art Deco pylons and lamps |
| 2001 | `millennium-footbridge` | The 1936 road bridge kept, with a new steel cable-stayed footbridge beside it (the plot is too narrow for a tilting arch like Gateshead's) |

## culture: "Leisure and Learning"

`plotSize: [34, 30]`. Where the town goes to wash, pray, be entertained and show off. The most
varied lineage, with several landmark cameos.

| from | id | building |
|---|---|---|
| -500 | `round-barrow` | A Bronze Age round barrow on the common, already ancient: grassy mound with a ring ditch and a standing stone |
| 110 | `roman-baths` | Roman public baths: barrel-vaulted hot rooms, apse, furnace stoke-hole, colonnaded exercise yard |
| 430 | `ruined-baths` | The baths in ruin: broken vaults, fallen columns, trees growing through |
| 1140 | `priory` | Small priory: church, cloister with an arcade, chapter house and dormitory range round a square garth. Dissolved 1539 and left in ruins |
| 1599 | `playhouse` | The priory quarried away; a polygonal timber playhouse with a thatched gallery roof and open yard stands by its ruined arch. Pulled down 1644, the ground then open until 1771. Cameo: the Globe |
| 1771 | `assembly-rooms` | Georgian assembly rooms: Palladian block with portico, tall ballroom windows, flanking wings. Cameo: Bath / York Assembly Rooms |
| 1870 | `crystal-palace` | Iron-and-glass exhibition hall and winter garden: modular bays, barrel-vaulted transept. Cameo: the Crystal Palace |
| 1936 | `art-deco-cinema` | Art Deco cinema: cream faience, rounded corner, tall fin tower, canopy. Cameo: Odeon |
| 1972 | `brutalist-arts-centre` | Brutalist arts centre and theatre: stacked concrete terraces, two fly towers. Cameo: National Theatre |
| 2010 | `concert-hall` | Contemporary concert hall: curved glass and steel shell over the halls. Cameo: Sage Gateshead |

## inn: "The Inn"

`plotSize: [22, 22]`. Hospitality on the square: the most English of building types.

| from | id | building |
|---|---|---|
| -500 | `feasting-house` | A communal roundhouse with an outdoor cooking pit and drying racks |
| 70 | `roman-mansio` | Roman mansio (official inn): rooms round a small courtyard, stable range, tiled roofs |
| 700 | `saxon-alehouse` | Saxon alehouse: timber hut with an ale-stake (a pole with a bush) to show brewing |
| 1100 | `norman-alehouse` | Larger thatched alehouse with a brewhouse lean-to |
| 1400 | `galleried-inn` | Medieval galleried coaching inn: timber-framed ranges round a courtyard with open galleries, carriage arch. Cameo: the George Inn, Southwark / the New Inn, Gloucester |
| 1735 | `georgian-coaching-inn` | Georgian coaching inn: brick front, sash windows, big carriage arch to the yard, stables, a swinging sign |
| 1890 | `victorian-pub` | Victorian gin-palace pub: glazed tiles, etched windows, big lamps, corner entrance, elaborate gables |
| 1934 | `roadhouse-pub` | 1930s "improved" pub in brewers' Tudor: half-timbered gables, tall chimneys, car park |
| 1968 | `estate-pub` | 1960s estate pub: flat-roofed brick box, fascia sign, picture windows |
| 2012 | `gastropub` | The pub rebuilt and reworked as a gastropub and microbrewery: glazed extension, terrace, visible brewing tanks |

## farm: "The Farm"

`plotSize: [14, 18]`. A one-off at the edge of the town fields: the rural building the town plots
never had. It is given up after the Black Death and the ground cleared.

| from | id | building |
|---|---|---|
| 1150 | `longhouse` | Peasant longhouse: low cob walls, people at one end and cattle at the other, thatch, smoke gablet, no chimney |

## chapel: "The Chapel"

`plotSize: [12, 18]`. A one-off rather than a lineage: it appears once and stays.

| from | id | building |
|---|---|---|
| 1790 | `georgian-chapel` | Nonconformist chapel: a plain brick preaching box with a pedimented front and round-headed windows |
