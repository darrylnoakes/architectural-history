# France: lineage briefs

The town is a fictional but typical cathedral city of northern France, somewhere between Paris and
the Belgian border (Picardy, Champagne, the north of the Île-de-France: think of Soissons, Laon,
Reims, Noyon, Senlis, Saint-Quentin, Amiens), on a river in open chalk country, followed from about
300 BC to the present. It begins as the oppidum of a Belgic tribe, becomes a Gallo-Roman town, is
sacked in 275 and shrinks behind a wall, is a bishop's and sometimes a king's city under the
Franks with a great abbey outside its walls, wins a charter as a commune, rebuilds its cathedral in
the new Gothic from the 1160s, suffers the Hundred Years' War, is refortified by Vauban, stripped
by the Revolution, industrialised, **shelled to ruins between 1914 and 1918 and rebuilt in the
1920s**, and ringed with slab blocks in the 1960s.

What every lineage should show, and what makes France different from England and Italy:

- **Discontinuity by disaster, not decay.** The breaks are datable events: the invasions of 275,
  the Revolution (1789 to 1799: church property sold, abbeys quarried, statues smashed) and the
  Great War. The town plan will mark particular plots as struck in 1915, left as ruins and rebuilt
  in the 1920s; you do not model that (any building can be shown as its own ruin). Where the
  destruction and rebuilding are themselves the stage (the cathedral), the brief says so.
- **France as the source.** Gothic, the château, the hôtel particulier, the formal garden, the
  bastioned fortress, the restaurant, the arcade, the department store, reinforced concrete, Art
  Deco: say where an idea began and where it went (`influences`).
- **Northern materials.** Fine pale limestone (`P.pierreBlonde`) and chalk (`P.craie`) for anything
  grand; timber frame with cob (`P.torchis`) or brick infill for houses until the seventeenth
  century; red brick (`P.briqueNord`) with stone dressings from the sixteenth; flat clay tiles
  (`P.tuilePlate`) on steep roofs (about 50 degrees) and slate (`P.ardoise`) on anything rich,
  mansards from the 1640s, zinc (`P.zincParis`) from the 1840s. Shutters in greys, blues and
  greens (`P.voletGris`, `voletBleu`, `voletVert`).

Eras (see `packages/region-france/src/eras.ts`): The Gauls (-300 to -52), Gallo-Roman (-52 to 275),
Late Antiquity (275 to 481), Merovingians and Carolingians (481 to 987), Romanesque (987 to 1140),
Gothic (1140 to 1350), Late Gothic (1350 to 1500), Renaissance (1500 to 1610), The Classical Age
(1610 to 1789), Revolution to Second Empire (1789 to 1870), Belle Époque (1870 to 1914), War and
Reconstruction (1914 to 1945), Trente Glorieuses (1945 to 1975), Contemporary (1975 to 2025).

## Rules learned from England and Italy (read these)

- **Dates must be right for northern France.** A type's `from` is when a provincial town of the
  north would first plausibly have one, not when the first example was built in Paris. If a year
  in the tables is wrong, correct it (keeping the order) and say so in your report.
- **Cameos are credited honestly.** `modelledOn` names the real building, place, architect and
  date only where you are sure; say what is taken from it and what is generic. Do not describe a
  real building wrongly to make it fit.
- **Nothing anachronistic on the model.** No chimney stacks before about 1200 (smoke louvres and
  holes before); no glazed windows in ordinary houses before the sixteenth century; machicolations
  from the late thirteenth century; mansard roofs from the 1640s; louvred shutters from the
  eighteenth century; pointed arches from the 1140s.
- **Unfinished and altered is normal.** Cathedrals had one tower lower than the other for
  centuries; say so and build it so, rather than a tidy ideal.
- **One building that grows is one model that grows.** Where the brief says a building survives
  into later stages, build it once in `shared.ts` with options, so it stays exactly where it was.
- **Interiors: `b.cutaway`.** If the inside is the point (a theatre, a market hall's roof frame, a
  machine), model it, but leave the roof or a wall off only `if (b.cutaway)`. In the townscape that
  is false and the building must be complete; it is true when the building is selected or shown on
  its own. Everything outside the cut must be identical in both forms. The gallery shows the open
  form; add `&cutaway=0` to its URL to see the closed one.
- **Stages that are really different buildings.** Where a lineage's later stages would in reality
  stand beside or elsewhere than the earlier building, the town plan puts them on other plots.
  If such a stage also shows the older building on the main plot, it must build only its own new
  building when `b.variant > 0`, in the same position, finished on all sides, with all its
  `lookFor` anchors on the new building. The brief marks these stages **(stands alone)**.
- **Text and model must agree.** Every `lookFor` item names something that is really on the model,
  by its correct term, with its anchor on it. Hedge what you are not sure of.
- **Budget.** Aim for 1,500 to 6,000 triangles; the largest set pieces may reach about 9,000 (the
  cathedral about 14,000). Tile ribs, railings, shutters and balusters are what blow the budget:
  write cheap local helpers and thin them out on faces that are rarely seen.

## Timing: each author sets it

In `index.ts` each stage carries, where they apply (see "Timing rules" in `docs/LINEAGES.md`):

- `builtUntil`: the last year the type was still being newly built, if well before the next stage.
- `end`: what became of the type if it did not simply last until replaced. Use `invasions` from
  `packages/region-france/src/ends.ts` for Gallo-Roman buildings that did not survive 275 (ruin),
  `renewedBy(year)` for flimsy types that were always rebuilt, or a custom
  `{ year, fate: 'ruin' | 'cleared', note }` for a datable event. Durable types that could still
  stand today get no `end`. Do **not** give 1914 to 1918 as an `end`: the town plan handles it.

---

## The town plan

`packages/region-france/src/site.ts` is the ground (river, the castle hill, streets, squares,
scenery) and `plots.ts` says which lineage stands where. The Grand'Place with the town hall lies
north-west of the crossing of the two main streets, the cathedral north-east, the market place
south-west; the abbey is outside the east gate, the castle on its hill beyond the west gate, the
château at the end of an avenue to the north, and the faubourg, the station and the quarters of the
last two centuries across the river. Every stage of every lineage stands somewhere.

- Plots marked `struck: greatWar` are ruins from 1915 until their next stage in the 1920s: the town
  hall, the works, the covered market, the station and a third of the houses. The bridges are
  `struck` in 1940.
- The wall is drawn by the site between the three gate plots (`town-walls.ts`), from the pieces in
  `lineages/remparts/curtain.ts`. There is none before about 120 BC or between about 20 BC and 290. The late Roman wall of 290 to 1200 is not on this line: it is a much smaller circuit round the forum and the cathedral (`castrumProps` in `town-walls.ts`), with four plain gates, the west one on a plot of its own (`porte-du-castrum`); the triumphal arches stand on the outer gate plots, outside it, and fall into ruin. The count's hall and the first cathedrals draw the stretches of it they stand against.
  After 1885 the west and north-west sides go for boulevards; the stretch behind the cathedral stays.
- Stages marked **(stands alone)** stand on plots of their own.

---

## maison: "La Maison"

`plotSize: [14, 18]`, kind `home`. An ordinary, middling household: farmer, craftsman, shopkeeper,
clerk. Front (+Z) on the street. From the twelfth century the house stands in a row sharing side
walls: leave the side walls blank and do not mirror the layout between seeds.

| from | id | building |
|---|---|---|
| -300 | `gaulish-house` | Rectangular house of oak posts, wattle and daub under a steep thatch with a porch, in a fenced yard with a granary on four posts and a storage pit. Cameo: Acy-Romance, Ardennes |
| 30 | `gallo-roman-house` | Strip house: timber frame and cob on a stone sill, tiled roof, an open shop front on the street, a stone cellar with a stair and niches (the cellar is the Gaulish touch), a yard with a well |
| 300 | `late-roman-house` | A small house squeezed inside the new walls: rubble and reused blocks below, timber above, patched tile and thatch |
| 600 | `frankish-house` | A timber post house with a thatched roof down to head height and a sunken hut (fond de cabane) for weaving beside it |
| 1140 | `romanesque-house` | A stone town house: wide round arches of the shop below, a row of small arched windows on colonnettes (claire-voie) lighting the hall above. Cameo: the Romanesque houses of Cluny |
| 1330 | `gothic-timber-house` | Maison à pans de bois: gable to the street, each floor jettied over the one below on brackets, cob infill, a shop with a let-down counter. Cameo: Rouen, Troyes |
| 1530 | `renaissance-house` | Timber-framed still, but no longer jettied (towns banned overhangs from the 1520s): carved corner posts and brackets with Renaissance ornament, St Andrew's crosses under the windows, glazed casements, a stone ground floor |
| 1680 | `classical-house` | Maison de ville in brick with stone bands and quoins: tall small-paned windows in strict rows, a carriage door, a mansard roof of slate with dormers |
| 1868 | `immeuble-bourgeois` | Provincial block of flats in the Haussmann manner: cut stone, shop below, balconies on the second and fifth floors, a zinc mansard, a porte cochère to the court |
| 1903 | `maison-1900` | Town house of the north around 1900: polychrome brick, stone lintels, a bow window, Art Nouveau ironwork and a ceramic frieze |
| 1924 | `reconstruction-house` | House of the Reconstruction: brick and concrete, a stepped or curved Art Deco gable, a bow window, geometric ironwork, a date stone. Cameo: Saint-Quentin, Reims |
| 1968 | `pavillon` | The detached suburban pavillon of the boom years: industrialised (steel frame and concrete panels), low tiled roof, garage, clipped hedge. Cameo: the Maison Phénix |
| 2014 | `eco-house` | Low-energy house in an écoquartier: timber cladding, a mono-pitch roof with solar panels, deep south windows with sliding shutters, a shared garden |

## faubourg: "Le Faubourg"

`plotSize: [26, 16]`, kind `workers`. Where the poor live: outside the walls, along the roads in.

| from | id | building |
|---|---|---|
| -300 | `gaulish-huts` | Three or four small post-and-thatch houses with pens and pits at the edge of the oppidum |
| 40 | `artisans-row` | A row of narrow workshop-dwellings of timber and cob along the road (a vicus street): potters, bronze workers, a bakery |
| 500 | `sunken-huts` | A Frankish hamlet: sunken huts with roofs to the ground, a post-built house, a granary on posts |
| 1150 | `one-room-houses` | Low single-room houses of timber and cob under thatch, gardens behind, outside the town gate |
| 1480 | `weavers-houses` | Timber-framed weavers' houses: long strips of window lighting the loom room, a shared well. Cameo: the saiteurs' houses of Amiens |
| 1850 | `couree` | A courée: two rows of tiny brick houses facing each other across a narrow court behind the street, one pump, one privy block. Cameo: Lille, Roubaix |
| 1872 | `familistere` | A "social palace" for a factory's workers: a brick block of flats round a glass-roofed courtyard with galleries on every floor. Cameo: the Familistère of Guise (Godin, 1859 to 1884), much reduced. Use `b.cutaway` for the glass roof |
| 1922 | `cite-jardin` | A garden suburb of the Reconstruction: paired regionalist cottages with steep tiled roofs, half-timbered gables and gardens. Cameo: the Chemin Vert, Reims |
| 1962 | `grand-ensemble` | A slab (barre) and a tower of the ZUP, in prefabricated concrete panels, with a strip of shops. The slab may run the full 26 m and stand about 30 m tall; keep it inside the plot |
| 2012 | `renewal-housing` | Urban renewal: the slab gone, low timber-and-render blocks of social housing with loggias and a shared garden |

## hotel: "L'Hôtel"

`plotSize: [24, 26]`, kind `elite`. The richest household: where new fashions arrive first.
Several stages are ranges round a courtyard: one `b.collider()` per range, court walkable.

| from | id | building |
|---|---|---|
| -300 | `aristocrats-farm` | A Gaulish noble's enclosure: a big aisled house, granaries, a palisade and a gate with trophies. Cameo: Paule, Brittany |
| 60 | `domus` | A Gallo-Roman town house: rooms round a colonnaded garden, a heated room with a furnace arch, painted plaster, a street front of shops |
| 600 | `frankish-hall` | A noble's timber hall with a private chapel and a palisade, inside the old walls |
| 1150 | `maison-forte` | A Romanesque stone house with a tower: the hall over an undercroft, an outside stair, paired round-arched windows |
| 1445 | `gothic-hotel` | A merchant-banker's hôtel round a court: a stair tower, a chapel over the gate, flamboyant dormers, carved figures at false windows. Cameo: the Palais Jacques-Cœur, Bourges; the Hôtel de Cluny, Paris |
| 1540 | `renaissance-hotel` | Pilasters in tiers, mullion-and-transom windows, medallions, an open loggia on the court, steep roofs with ornate dormers. Cameo: the Hôtel Pincé, Angers; the Hôtel d'Assézat, Toulouse |
| 1625 | `brick-and-stone-hotel` | The Henri IV and Louis XIII manner: red brick with stone quoins and bands, tall slate roofs each over its own pavilion. Cameo: the Place des Vosges, Paris |
| 1705 | `hotel-particulier` | The classic hôtel between court and garden: a carriage gate in a screen wall, a forecourt, the main block with a pediment, a formal garden behind. Cameo: the Hôtel de Soubise and Hôtel Matignon, Paris |
| 1780 | `neoclassical-hotel` | Louis XVI: a colonnade, a domed round salon bulging into the garden, a flat roof behind a balustrade. Cameo: the Hôtel de Salm, Paris |
| 1902 | `art-nouveau-villa` | An Art Nouveau villa: asymmetry, a great curved studio window, flowing ironwork and stone, glazed ceramic. Cameo: the Villa Majorelle, Nancy (Sauvage, 1901 to 1902) |
| 1930 | `modern-villa` | A white villa on stilts with ribbon windows, a ramp and a roof garden. Cameo: the Villa Savoye, Poissy (Le Corbusier, 1928 to 1931) |
| 2005 | `contemporary-house` | A house as a greenhouse: a cheap steel and polycarbonate frame doubling the living space. Cameo: the houses of Lacaton and Vassal |

## cathedrale: "La Cathédrale"

`plotSize: [34, 66]`, kind `worship`. Long axis is Z: **the entrance (west) front is at +Z and the
choir at -Z.** From the Romanesque cathedral on this is **one building that grows**: a parametric
church in `shared.ts`. The largest models in the region: write cheap window, buttress and arcade
helpers. Say on each card what survives from before.

| from | id | building |
|---|---|---|
| -300 | `gaulish-sanctuary` | A square ditched and palisaded enclosure with a timber shrine and a trophy of captured weapons. Cameo: Gournay-sur-Aronde, Oise |
| 40 | `fanum` | A Romano-Celtic temple: a tall square cella rising like a tower out of a lower gallery on all four sides, in a walled precinct. Cameo: the Temple of Janus, Autun |
| 380 | `cathedral-group` | The first cathedral, against the town wall: two plain halls side by side and a small baptistery between them. Cameo: the Baptistery of Saint-Jean, Poitiers |
| 830 | `carolingian-cathedral` | A basilica with a crypt and a westwork: a towered entrance block with a chapel upstairs. Cameo: Saint-Riquier (Centula) as drawn; the Reims of Archbishop Ebbo |
| 1050 | `romanesque-cathedral` | Round arches, a tribune gallery, twin west towers, a crossing tower, and the French invention: an ambulatory with radiating chapels. Cameo: Saint-Étienne, Nevers; Jumièges |
| 1165 | `early-gothic-cathedral` | A new choir rising east of the old Romanesque nave, which still stands: four-storey elevation, the first flying buttresses, pointed arches. Building site at the join. Cameo: Laon, Noyon, Notre-Dame de Paris |
| 1245 | `high-gothic-cathedral` | The nave and west front complete: three deep portals full of sculpture, a rose, a gallery of kings, two towers of which only one is finished, flying buttresses with pinnacles. Cameo: Reims, Amiens |
| 1500 | `flamboyant-cathedral` | The second tower finished with an openwork flamboyant crown, a transept front with a flame-traceried rose, side chapels between the buttresses. Cameo: the Tour de Beurre, Rouen; Beauvais; Troyes |
| 1793 | `temple-of-reason` | The Revolution: the kings beheaded, the spire over the crossing pulled down for its lead, a tricolour and the words "Temple de la Raison" over the door, hay stored in the nave |
| 1850 | `restored-cathedral` | The restoration: a new timber and lead spire over the crossing, the statues recut, chimeras on the galleries, the houses against the walls cleared. Cameo: Viollet-le-Duc at Notre-Dame de Paris and Amiens |
| 1914 | `shelled-cathedral` | September 1914: the roof burned, the vaults pierced, the statues calcined, sandbags at the portals. Cameo: Reims |
| 1938 | `rebuilt-cathedral` | Restored between the wars with a new roof on a fireproof frame of small concrete members, the glass replaced. Cameo: Henri Deneux at Reims (reopened 1938) |

## abbaye: "L'Abbaye"

`plotSize: [40, 44]`, kind `monastery`. The great abbey outside the walls. **The church lies
along the -X side of the plot, entrance front at +Z, choir at -Z; the cloister and its ranges fill
the +X side.** One complex that grows: share it in `shared.ts`.

| from | id | building |
|---|---|---|
| 560 | `merovingian-monastery` | A burial church over a saint's tomb, with a crypt, timber cells and a wall. Cameo: Saint-Médard, Soissons; the crypts of Jouarre |
| 830 | `carolingian-abbey` | A planned monastery: church, cloister with dormitory, refectory and cellar, a gate hall. Cameo: the Plan of St Gall; the gate hall of Lorsch |
| 1090 | `romanesque-abbey` | A great vaulted abbey church with several towers and a narthex. Cameo: Cluny III (very much reduced); Paray-le-Monial |
| 1144 | `gothic-choir` | The abbot rebuilds the choir: a double ambulatory with a ring of chapels and almost no wall, the Romanesque nave left standing behind it. The first Gothic building. Cameo: Saint-Denis (Suger, 1140 to 1144) |
| 1700 | `maurist-abbey` | The reformed Benedictines of Saint-Maur rebuild the monks' quarters as long classical ranges round the cloister, like a palace; the medieval church kept. Cameo: Saint-Ouen, Rouen; Saint-Remi, Reims |
| 1800 | `abbey-quarried` | Sold in the Revolution: the church pulled down for its stone, leaving the west front standing alone; the ranges turned into a cotton mill and a barracks. Cameo: Saint-Jean-des-Vignes, Soissons; Cluny |
| 1995 | `abbey-museum` | What is left restored as a museum and cultural centre, the plan of the lost church marked out in the grass |

## pouvoir: "L'Hôtel de Ville"

`plotSize: [44, 44]`, kind `power`. Who rules the town, and from where. Front (+Z) faces the main
square. Give explicit colliders and leave squares, arcades and courts walkable. **The belfry of
1260 and the town hall of 1510 are one building that is never demolished** (share it). The
stages marked **(stands alone)** are separate buildings in reality: see the rule above.

| from | id | building |
|---|---|---|
| -300 | `chiefs-enclosure` | The assembly place of the oppidum: a palisaded enclosure, the chief's big house, a gate with a platform |
| 60 | `forum` | The forum: a paved square with porticoes, a basilica across one end, a small senate house, and a half-buried vaulted gallery (cryptoporticus) under one wing. Cameo: Bavay; the cryptoporticus of Reims |
| 600 | `frankish-palace` | The king's or count's hall in a corner of the old walls: a timber hall on stone footings, a chapel, a tower made from a Roman bastion |
| 1180 | `bishops-palace` | **(stands alone)** The bishop-count's palace beside the cathedral: a great stone hall over a vaulted undercroft, with a chapel. Cameo: the synodal hall of Sens; the Palais du Tau, Reims |
| 1260 | `belfry` | The commune's answer: a square stone belfry with a watch gallery and bells, and a market hall with the aldermen's room above. Cameo: the belfries of Picardy and Flanders (Abbeville, Boulogne) |
| 1510 | `flamboyant-town-hall` | A new town hall built on to the belfry: an arcade on the square, tall windows, niches with statues, a steep slate roof with dormers. Cameo: Compiègne, Saint-Quentin, Arras |
| 1760 | `intendance` | **(stands alone)** The royal intendant's residence closing one side of a new royal square with a statue of Louis XV: arcades, giant pilasters, balustrades. Cameo: the Place Royale, Reims; the Place Stanislas, Nancy |
| 1835 | `prefecture` | **(stands alone)** The prefecture and law court of the new order: a temple front of Doric columns, plain wings. Cameo: the palais de justice of the 1830s |
| 1928 | `rebuilt-town-hall` | The town hall and belfry, ruined in the war, rebuilt as they were on a concrete frame, with an Art Deco council chamber wing. Cameo: Arras (rebuilt 1924 to 1932), Saint-Quentin |
| 1970 | `cite-administrative` | **(stands alone)** The state's offices in a concrete slab on stilts, with a car park |
| 2012 | `civic-centre` | **(stands alone)** The offices of the agglomeration: glass, timber fins, a planted forecourt and a tram stop |

## chateau: "Le Château"

`plotSize: [44, 48]`, kind `castle`. On rising ground at the edge of the town. Two buildings in
turn: the castle (to the Renaissance) and the country house that replaces it nearby. In the town
the castle plot will run motte to restored castle, and a second plot will carry the two châteaux.

| from | id | building |
|---|---|---|
| 960 | `motte` | A motte and bailey: a timber tower on an earth mound, a bailey with a hall and stables inside a palisade and ditch |
| 1100 | `donjon` | A square stone keep with flat buttresses and a first-floor door, inside a stone ring wall on the old mound. Cameo: Loches, Houdan |
| 1220 | `philippian-castle` | The royal formula: a regular four-sided plan, round corner towers, a twin-towered gate, a great round keep, arrow loops. Cameo: Dourdan; Coucy; the Louvre of Philip Augustus |
| 1395 | `residential-castle` | The castle made a palace: towers heightened with machicolations and conical slate roofs, a great hall with tall windows, a chapel. Cameo: Pierrefonds (1393 to 1407). Carries a custom `end`: slighted on royal orders in 1617 and left a ruin |
| 1520 | `renaissance-chateau` | A château of the Loire kind: symmetry, pilasters between the windows, great dormers and chimneys, an open staircase, a moat for show. Cameo: Azay-le-Rideau; Villers-Cotterêts |
| 1660 | `classical-chateau` | The main block between pavilions under a dome, a forecourt, and behind it a parterre, clipped trees and a long canal on the axis. Cameo: Vaux-le-Vicomte (Le Vau and Le Nôtre, 1656 to 1661) |
| 1865 | `restored-castle` | The medieval ruin rebuilt as a romantic dream of the Middle Ages, more complete than it ever was. Cameo: Viollet-le-Duc at Pierrefonds (1857 to 1885). Shares the `residential-castle` model |

## halles: "Les Halles"

`plotSize: [26, 22]`, kind `market`. Seen from all sides; open ground floors want colliders on
piers only.

| from | id | building |
|---|---|---|
| -300 | `gaulish-market` | Open ground by the gate: pens, granaries on posts, a booth where coins are struck |
| 50 | `macellum` | A Gallo-Roman food market: shops round a small court behind a portico. Cameo: Saint-Bertrand-de-Comminges |
| 640 | `fair` | The abbey's fair: rows of timber booths and tents round a cross, set up each year. Cameo: the Lendit fair of Saint-Denis; later the fairs of Champagne |
| 1290 | `timber-halle` | A great timber market hall: a forest of oak posts under an immense tiled roof that comes down almost to the ground. Cameo: Milly-la-Forêt; Saint-Pierre-sur-Dives |
| 1785 | `grain-hall` | A circular grain hall round an open court, all arcades. Cameo: the Halle au Blé, Paris (Le Camus de Mézières, 1763 to 1767) |
| 1838 | `passage` | A covered arcade of shops under a glass roof, with a rotunda. Cameo: the Galerie Vivienne, Paris; the Passage Pommeraye, Nantes. Use `b.cutaway` if the glass roof hides the inside |
| 1866 | `iron-halles` | A market pavilion of cast iron and glass on a brick base, with louvred clerestories. Cameo: Baltard's Halles of Paris (1853 to 1870) |
| 1895 | `grand-magasin` | A department store: an iron frame, a great glazed front, a corner dome, a light well with galleries and a grand stair. Cameo: Au Bon Marché, Paris (Boileau and Eiffel) |
| 1929 | `concrete-market` | A covered market under a thin parabolic concrete vault only a few centimetres thick. Cameo: the Halles du Boulingrin, Reims (Maigrot and Freyssinet, 1927 to 1929) |
| 1969 | `hypermarket` | A hypermarket: one vast flat shed with a canopy, a sign on a mast and a car park. Cameo: the first Carrefour, Sainte-Geneviève-des-Bois (1963) |
| 2012 | `market-today` | The concrete market of 1929 restored and reopened, with a market square outside. **The same building as `concrete-market`** (share the geometry with a `restored` flag). Cameo: the Boulingrin, reopened 2012 |

## atelier: "L'Atelier"

`plotSize: [36, 22]`, kind `work`, `river: [-27, -11]`. Front (+Z) faces the street; **the river
runs along the back, its near bank at local z = -11** (water at y = -1.2), so wheels, quays and
washing places go at the back and may project a few metres over the water.

| from | id | building |
|---|---|---|
| -300 | `gaulish-forge` | A smith's and a bronze-caster's workshops under thatched shelters, with charcoal stacks |
| 60 | `potters-quarter` | Gallo-Roman potteries: big round kilns, drying sheds, stacks of red tableware, a quay. Cameo: La Graufesenque; Lezoux |
| 620 | `abbey-mill` | The abbey's watermill with a vertical wheel, a bakehouse and a brewhouse |
| 1180 | `cistercian-forge` | A long stone building with buttresses and vaults where a water-powered hammer works iron. Cameo: the forge of Fontenay Abbey |
| 1300 | `drapers-works` | The cloth town: a fulling mill, a dye house with vats and a washing stage on the river, cloth stretched on tenter frames |
| 1680 | `royal-manufactory` | Colbert's royal manufactory: a long symmetrical range with a pediment and bell turret, a gate, a court. Cameo: the Manufacture des Rames (Van Robais), Abbeville |
| 1835 | `spinning-mill` | A spinning mill: a tall brick block of many windows on iron columns, an engine house and a square chimney |
| 1872 | `iron-frame-mill` | A mill standing in the river on stone piers, its iron frame shown on the outside as a diamond lattice filled with coloured brick. Cameo: the Menier chocolate mill, Noisiel (Saulnier, 1871 to 1872) |
| 1921 | `concrete-workshop` | A reinforced-concrete workshop: wide thin arches, rooflights between them, a frame left bare. Cameo: Perret's Esders workshop, Paris (1919); Freyssinet |
| 2010 | `reused-works` | The works reused: studios, a concert hall and a café in the old sheds, a tower kept as a landmark. Cameo: the Lieu Unique, Nantes; La Condition Publique, Roubaix |

## pont: "Le Pont"

`plotSize: [16, 40]`, kind `crossing`, `river: [-12, 12]`. **The road runs along Z through the
origin; the river flows along X between z = -12 and z = +12.** Banks at y = 0, water at y = -1.2,
bed about y = -2.4. A deck must meet the road (y = 0) at z = ±17. Call `b.noCollide()` and
`b.deck(width, 34, crownY, { yEnds: 0 })`.

| from | id | building |
|---|---|---|
| -300 | `ford` | A ford with a line of stakes and a dugout canoe |
| -90 | `gaulish-bridge` | A timber bridge on trestles of driven piles, as Caesar found on the rivers of Gaul |
| 120 | `roman-bridge` | Stone piers with cutwaters carrying a timber road on strutted beams, the usual Roman bridge of the north. Cameo: the Roman bridge at Trier |
| 1185 | `inhabited-bridge` | A medieval bridge of pointed arches with a chapel on one pier, houses along it and mill wheels under the arches. Cameo: the Pont Saint-Bénézet, Avignon; the Grand Pont, Paris |
| 1320 | `fortified-bridge` | The bridge closed by tall square gate towers. Cameo: the Pont Valentré, Cahors (1308 to 1378) |
| 1630 | `pont-neuf` | A new kind of bridge: wide, no houses, raised pavements, half-round bays over every pier, carved masks (no royal statue: a provincial town could not afford one). Cameo: the Pont Neuf, Paris (1578 to 1607) |
| 1775 | `perronet-bridge` | Very flat arches on piers so thin they hardly block the river, a level road, a stone balustrade. Cameo: the Pont de Neuilly and Pont de la Concorde (Perronet) |
| 1830 | `suspension-bridge` | A light road hung from cables of iron wire over masonry pylons. Cameo: Marc Seguin's bridge at Tournon (1825) |
| 1947 | `prestressed-bridge` | After two wars of demolitions: one very flat span of prestressed concrete, hinged at the abutments. Cameo: Freyssinet's bridge at Luzancy on the Marne (1941 to 1946) |
| 2006 | `footbridge` | A footbridge of two crossing curves, one an arch and one a hanging band, with no pier in the river. Cameo: the Passerelle Simone-de-Beauvoir, Paris (Feichtinger) |

## spectacles: "Les Spectacles"

`plotSize: [40, 36]`, kind `culture`. Where the town goes to be entertained and improved. Use
`b.cutaway` wherever the auditorium or hall is the point.

| from | id | building |
|---|---|---|
| 80 | `theatre-amphitheatre` | The Gallo-Roman hybrid: an arena with seating round most of it and a stage building on the flat side. Cameo: the Arènes de Lutèce, Paris; Grand, Vosges |
| 1560 | `jeu-de-paume` | A real-tennis court: a long tall hall with a gallery under a penthouse roof along the side, lit from high up. The ancestor of the French theatre |
| 1780 | `grand-theatre` | A free-standing theatre with a portico of giant columns across the whole front, statues on the balustrade, a great staircase and a horseshoe auditorium. Cameo: the Grand Théâtre, Bordeaux (Victor Louis, 1773 to 1780) |
| 1862 | `museum` | A museum built as a palace of the arts: a domed centre, pavilions with tall slate roofs, sculpture, top-lit galleries. Cameo: the Musée de Picardie, Amiens (1855 to 1867) |
| 1889 | `cirque` | A permanent circus: a polygonal brick and iron hall under a tent-like roof with a lantern. Cameo: the Cirque d'Amiens (1889); the Cirque of Reims |
| 1927 | `carnegie-library` | A library given to the rebuilt town: an Art Deco temple of learning with a mosaic porch and a semicircular bookstack behind. Cameo: the Bibliothèque Carnegie, Reims (Max Sainsaulieu, 1921 to 1927) |
| 1966 | `maison-de-la-culture` | A house of culture: two auditoria of different shapes under a concrete roof, a glazed foyer. Cameo: the Maison de la Culture, Amiens (1966) |
| 2010 | `art-centre` | A gallery under a white roof like a great woven hat, a lattice of laminated timber. Cameo: the Centre Pompidou-Metz (Shigeru Ban and Jean de Gastines, 2010) |

## auberge: "L'Auberge"

`plotSize: [22, 22]`, kind `hospitality`. Food, drink and a bed. Courtyard types: one collider
per range, arch and yard walkable.

| from | id | building |
|---|---|---|
| -300 | `gaulish-hall` | A feasting hall with a hearth, benches and Italian wine jars, in a fenced enclosure |
| 50 | `mansio` | A Roman road station: rooms round a courtyard, stables, a small bath suite |
| 800 | `hostelry` | The abbey's guest house by the road: a timber hall, a kitchen, a stable |
| 1380 | `hostellerie` | A medieval inn: timber-framed, a carriage arch to a galleried yard, stables, a hanging sign |
| 1445 | `hotel-dieu` | **(stands alone)** A hospital for the poor: one great hall of beds with a chapel at its end, a galleried courtyard, roofs of slate and plain tile (Beaune's glazed roofs are Burgundian and left out). Cameo: the Hôtel-Dieu, Beaune (1443 to 1451) |
| 1690 | `relais-de-poste` | A posting inn on the royal road: a wide carriage gate, a yard of stables and coach houses, a dovecote |
| 1800 | `cafe-restaurant` | A café and one of the first restaurants: mirrors, small tables, a painted shopfront under an arcade. Cameo: the arcades of the Palais-Royal, Paris |
| 1905 | `brasserie` | A big Art Nouveau brasserie: a glazed front in curving wood and iron, ceramic panels, a glass canopy, a terrace. Cameo: the Brasserie Excelsior, Nancy (1911) |
| 1955 | `relais-routier` | A lorry drivers' stop on the main road: café, tobacco counter with its red sign, rooms above, two petrol pumps |
| 2014 | `bistro-today` | The brasserie of 1905 restored, with a terrace on a car-free street. **The same building as `brasserie`** (share the geometry with a `restored` flag) |

## remparts: "Les Remparts"

`plotSize: [30, 16]`, kind `defence`. **The road runs along Z through the origin and passes
through the gate; the wall runs along X** and is cut off at the plot edges; outside the town is
+Z. Leave the gateway walkable (colliders either side, none across).

**Also write `curtain.ts`**, exactly as in `packages/region-italy/src/lineages/walls/curtain.ts`
(read it: same exports `WallStage`, `curtain`, `corner`, `terminal`, `CURTAIN`, same rules): the
town's wall circuit is drawn from these pieces, and your gate stages must build their own wall
stubs by calling `curtain`, so plot and circuit always match. Under about 30 triangles per metre.
The stage with no wall (`monumental-arch`) has no curtain.

| from | id | building |
|---|---|---|
| -120 | `murus-gallicus` | The Gaulish rampart: an earth bank faced in dry stone with the ends of its timber lacing showing in rows, a ditch, a timber gate tower set back in a funnel entrance. Cameo: the Porte du Rebout, Bibracte. Carries an `end`: abandoned and levelled after the conquest (about 20 BC) |
| 200 | `monumental-arch` | No wall: the open Roman town marks its entrance on each main road with a triple arch covered in reliefs. After 275 the town shrinks into a much smaller walled circuit and the arches are left outside it, in ruin from about 450 until the wall of 1200 is built on their line. Cameo: the Porte de Mars, Reims |
| 290 | `castrum-wall` | The late Roman wall: small squared stone with brick bands on a base of reused carved blocks, round-fronted towers, a plain gate of one arched passage between two towers. It stands only on the inner plot `porte-du-castrum` (290 to 1200); the outer gate plots skip it. Cameo: Le Mans, Senlis (Reims, where the arches became the gates, is cited as the contrast) |
| 1200 | `philippian-gate` | A new wall for the grown town: a gate between two round towers with arrow loops, a portcullis, a curtain with round towers and a ditch. Cameo: the walls of Philip Augustus |
| 1420 | `fortified-gate` | The Hundred Years' War: the gate raised with machicolations and steep roofs, a drawbridge, and an outwork (boulevard) for the first guns |
| 1680 | `vauban-gate` | Vauban: low brick-faced ramparts with angled bastions, a ditch and a triangular outwork, and a gate dressed as a triumphal arch with the king's trophies. Cameo: the Porte de Paris and the citadel, Lille |
| 1885 | `gate-and-boulevard` | The fortress declassified: ramparts levelled and the ditch filled for a tree-lined boulevard that passes in front of the monumental gate, kept as a monument on the town side; the old road, now a narrow street, still runs through the arch. A small square beside it with the toll (octroi) pavilions, a railed garden and lamps. Revisions: octroi abolished (1949), electric street lights (1958) |

## gare: "La Gare"

`plotSize: [40, 24]`, kind `transport`. The street front is +Z; the tracks run along X behind, at
the same places as Italy's station (read `packages/region-italy/src/lineages/station/shared.ts`:
two tracks at z = -8.5 and -10.75, a platform, rails that the open line will join).

| from | id | building |
|---|---|---|
| 1849 | `embarcadere` | The first station: a neat classical pavilion and a timber and iron shed |
| 1893 | `grande-gare` | A Belle Époque station: a stone front with a great glazed arch and a clock between sculpted figures, a wide iron and glass train shed. Cameo: the station of Tours (Laloux, 1898) |
| 1928 | `reconstruction-station` | Rebuilt after the war in concrete and brick: an Art Deco clock tower, mosaics, a low wide hall. Kept on the main station plot to the present. Revisions: the line electrified, with an electric locomotive in place of the steam Pacific (1959); regional trains only once the high-speed station opens (2007). Cameo: the stations of Lens (1927) and Rouen (1928) |
| 2007 | `gare-tgv` | The high-speed station, on a plot of its own on open ground along the line east of the town (the old station stays in use): a long canopy of steel and glass over the platform, a glass hall, a TGV at the platform, and in front a bus station and car parks. Cameo: Champagne-Ardenne TGV (2007) |
