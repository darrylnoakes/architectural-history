# Italy: lineage briefs

The town is a fictional but typical city of central Italy (the country between Rome and Florence:
Lazio, Umbria, Tuscany) on a river, followed from about 750 BC to the present. It begins as huts
on a hill above a ford, becomes an Etruscan-influenced town, a Roman municipium, a shrunken
early-medieval bishop's town, a self-governing commune, a Renaissance and Baroque city, and a
provincial capital of united Italy.

The big difference from England, and the thing every lineage must show: **Italian towns were never
abandoned, and what was built in stone mostly stayed.** There is decline after the Gothic War
(535 to 554) and life among the ruins, but no clean break, and from the Middle Ages onward old
buildings are kept, altered and added to rather than replaced. So:

- Where a real town would have kept a building (the cathedral, the town hall with its tower, the
  Roman bridge, a Renaissance palace), later stages of that lineage **keep it and add to it**, or
  are a different building that will stand on another plot. The brief says which.
- In the finished town the central plots will *keep* their medieval or Renaissance building as a
  survivor, and the later stages will appear on new plots in the nineteenth and twentieth-century
  quarters. The lineage itself is simply the full sequence, oldest to newest.

Eras (see `packages/region-italy/src/eras.ts`): Huts and Etruscans (-750 to -300), Roman Republic
(-300 to -27), Roman Empire (-27 to 313), Late Antiquity (313 to 568), Early Middle Ages (568 to
1000), Age of the Communes (1000 to 1250), Gothic (1250 to 1420), Renaissance (1420 to 1600),
Baroque (1600 to 1750), Neoclassical and United Italy (1750 to 1900), Liberty and the Fascist years
(1900 to 1945), Reconstruction and the boom (1945 to 1980), Contemporary (1980 to 2025).

Materials and colour: tufa, travertine, peperino and brick; from the Middle Ages plaster in ochre,
sienna and rose; pietra serena (grey) against white in the Renaissance; clay pan-and-cover tiles
(`P.coppi`) on low-pitched roofs (about 20 to 25 degrees) in every age. Cypresses, umbrella pines and
olives (`b.tree(h, { kind: 'cypress' | 'pine' | 'olive' })`).

## Timing: each author sets it

Stage ids are fixed. The `from` years below were a first proposal, since corrected where the authors and the fact-check found better ones: **if a year is wrong for
the type in central Italy, correct it (keeping the order) and say so in your report.** In
`index.ts` each stage must also carry, where they apply (see "Timing rules" in `docs/LINEAGES.md`
and the England `index.ts` files for examples):

- `builtUntil`: the last year the type was still being newly built, if that is well before the next stage.
- `end`: what became of the type if it did not simply last until replaced. Use `gothicWar` from
  `packages/region-italy/src/ends.ts` for Roman public buildings that fell out of use (ruin from
  about 550), `renewedBy(year)` for flimsy types that were always rebuilt, or a custom
  `{ year, fate: 'ruin' | 'cleared', note }` for a datable event (a flood, an earthquake, a
  demolition, a war). Durable types that could still stand today get no `end`.

---

## The town plan

`packages/region-italy/src/site.ts` is the ground (river, relief, streets, squares, scenery) and
`plots.ts` says which lineage stands where. Because the city keeps what it builds, most plots in the
old centre carry `keep` and stop at a medieval, Renaissance or Baroque building, and the later stages
of each lineage stand on plots that appear later (`since`): villas outside the north gate, the
theatre and prefecture on the boulevard, the quarter of united Italy and the station south of the
river, the housing estates beyond the east gate. Every stage of every lineage stands somewhere.

Three stages of the power lineage (`prefecture`, `casa-del-fascio`, `regional-offices`) are modelled
beside the old civic palace when they are on the main plot and as free-standing buildings anywhere
else (`b.variant > 0`), which is how they come to stand on their own plots in the town.

---

## home: "The Family Home"

`plotSize: [14, 18]`, kind `home`. An ordinary, middling household: farmer, craftsman, shopkeeper,
clerk. Front (+Z) on the street. From the Middle Ages the house is one of a row sharing side walls.

| from | id | building |
|---|---|---|
| -750 | `iron-age-hut` | Oval hut of wattle and daub on a post frame, thatched, with a porch and crossed ridge logs, as the hut-shaped urns and the Palatine post-holes show |
| -550 | `archaic-house` | Archaic house: stone footings, mudbrick or rammed-earth walls, a timber roof of terracotta tiles (among the first), two or three rooms behind a shallow porch. Cameo: Acquarossa |
| -200 | `atrium-house` | Small Republican atrium house: entrance passage, atrium with an impluvium pool under a roof opening, tablinum, a shop either side of the door, a kitchen garden behind |
| 100 | `garden-apartment` | Imperial apartment block for the comfortable: brick-faced concrete, three or four storeys, flats lit from a long living room, balconies on travertine brackets, a shop at street level. Cameo: Ostia |
| 480 | `house-in-ruins` | The same block half fallen: the family lives on the ground floor, the upper floors are roofless, openings are blocked with reused stone, a lean-to and a vegetable patch fill the yard |
| 800 | `domus-solarata` | Early medieval two-storey house with a ground-floor portico and an outside stair, built of reused Roman brick and tufa. Cameo: the Carolingian houses in the Forum of Nerva, Rome |
| 1200 | `casa-a-schiera` | Medieval row house: narrow front, a wide shop arch below, living rooms above, brick or stone, upper floor carried forward on timber brackets, a well in the yard |
| 1480 | `renaissance-house` | The row house put in order: plastered front, windows framed in grey stone, a shop with a stone counter in its opening, deep timber eaves, a small loggia on the yard |
| 1680 | `baroque-townhouse` | A small town house (palazzetto): ochre plaster, moulded window surrounds, a big arched street door, mezzanine windows, an altana (roof terrace under a tiled canopy) |
| 1885 | `umbertine-apartments` | Apartment building of united Italy: four or five storeys, stucco rustication below, iron balconies, louvred shutters, a bracketed cornice, a courtyard |
| 1962 | `palazzina` | Boom-years palazzina: concrete frame, strip balconies, roller shutters, travertine or klinker cladding, garages under, a set-back penthouse with a roof terrace |
| 2016 | `low-energy-flats` | Low-energy apartment house: external insulation, deep loggias with sliding shading, a photovoltaic roof, timber structure |

## tenement: "The Tenement"

`plotSize: [26, 16]`, kind `workers`. Where the poor live: always more people per plot than anyone else.

| from | id | building |
|---|---|---|
| -750 | `hut-cluster` | Three or four small oval huts with a pen and a storage pit |
| -300 | `tabernae-row` | A row of one-room shops, each with a back room or a mezzanine reached by a ladder, wide shuttered fronts |
| 60 | `insula` | A tall insula: five storeys of brick-faced concrete, shops at street level, outside stairs to the flats, timber balconies, the cheapest rooms at the top. Cameo: Ostia; the Insula dell'Ara Coeli, Rome |
| 450 | `portico-shacks` | The insula has fallen; timber and reused-brick shacks are built under a ruined public portico |
| 850 | `case-terrinee` | Single-storey houses of timber, clay and reused brick with thatch or shingle roofs and vegetable plots (the "domus terrineae" of the documents) |
| 1250 | `workers-row` | A row of identical narrow two-storey houses built to let to wool workers by a guild or a monastery, with an outside stair |
| 1580 | `raised-row` | The same row raised by a storey or two as the town fills up: uneven rooflines, washing lines, a shared well |
| 1880 | `casa-di-ringhiera` | Gallery-access tenement round a courtyard: every floor reached along an iron-railed balcony, one tap and one privy per landing |
| 1926 | `case-popolari` | Early public housing: courtyard blocks in a modest "barocchetto" style with gardens and wash-houses. Cameo: Garbatella, Rome |
| 1954 | `ina-casa` | An INA-Casa neighbourhood: three and four-storey blocks set at angles, pitched tile roofs, balconies, exposed brick in a concrete frame. Cameo: Tiburtino, Rome |
| 1978 | `megastructure` | A system-built slab of social housing with a raised internal street. Cameo: Corviale, Rome (reduced) |
| 2018 | `social-housing-today` | Contemporary social housing: low-rise, insulated, coloured loggias, shared ground floor |

## palazzo: "The Palazzo"

`plotSize: [24, 26]`, kind `elite`. The richest household: where new fashions arrive first. In the
town the central plot will keep its Baroque palace; the villas of 1790 onward stand on new plots.

| from | id | building |
|---|---|---|
| -750 | `chiefs-hut` | A larger hut with a porch, ancillary huts and a fenced compound |
| -580 | `etruscan-residence` | An archaic aristocratic residence round a colonnaded courtyard, with terracotta frieze plaques and seated statues along the roof ridge. Cameo: Poggio Civitate (Murlo) |
| -150 | `peristyle-domus` | Atrium-and-peristyle house: Tuscan atrium, tablinum, a colonnaded garden behind, shops let out on the street front. Cameo: House of the Faun, Pompeii |
| 120 | `imperial-domus` | A marble-lined town house: a fountain court (nymphaeum), a private vaulted bath suite, an upper storey |
| 380 | `late-antique-domus` | A late Roman mansion in brick with an apsed reception hall and a fountain court. Cameo: the House of Cupid and Psyche, Ostia |
| 750 | `lombard-court` | A noble compound of the Lombard period: a hall patched from Roman masonry with a timber upper storey, a private chapel, a wall round it |
| 1130 | `tower-house` | A casa-torre: a tall family tower of stone with a house at its foot, putlog holes and timber balconies. Cameo: San Gimignano; Bologna |
| 1320 | `gothic-palazzo` | A merchant-banker's palace: wide warehouse arches below, two-light windows above, battlements, a courtyard stair, a loggia under the roof. Cameo: Palazzo Davanzati, Florence |
| 1460 | `renaissance-palazzo` | Three storeys of graded rustication, round-arched two-light windows, a huge cornice, an arcaded courtyard. Cameo: Palazzo Medici; Palazzo Strozzi |
| 1545 | `roman-palazzo` | A High Renaissance palace without columns on its front: plaster and travertine, windows in little temple frames with alternating pediments, a great cornice. Cameo: Palazzo Farnese |
| 1665 | `baroque-palazzo` | Giant pilasters, a curved centre or a balcony over the portal, a grand open staircase, a coat of arms. Cameo: Palazzo Barberini; Palazzo Carignano |
| 1790 | `neoclassical-villa` | A villa at the edge of town with a temple-front portico and a landscape garden |
| 1905 | `liberty-villa` | A Stile Liberty villino: asymmetry, a turret, flowing ironwork, ceramic friezes of flowers. Cameo: Villino Ruggeri, Pesaro; Basile in Palermo |
| 1936 | `rationalist-villa` | A white Rationalist villa: flat roof, strip windows, a terrace, thin columns. Cameo: Figini's house in the Villaggio dei Giornalisti, Milan |
| 2008 | `contemporary-villa` | A contemporary house of stone, glass and weathering steel set into the hillside |

## duomo: "The Temple and the Cathedral"

`plotSize: [32, 60]`, kind `worship`. Long axis is Z: **the entrance front is at +Z and the altar
end at -Z.** From the early Christian basilica onward this is **one building that grows**: share a
parametric church in `shared.ts` so the nave, the reused columns, the baptistery and the bell
tower stay where they are from stage to stage. The temples before it face the same way.

| from | id | building |
|---|---|---|
| -750 | `sacred-enclosure` | An open-air sanctuary: an altar, a votive pit, boundary stones, a sacred grove |
| -500 | `etruscan-temple` | A Tuscan temple: high podium, a frontal stair, a deep columned porch, wide eaves, painted terracotta figures on the ridge. Cameo: the Portonaccio temple, Veii |
| -120 | `republican-temple` | A temple of tufa and travertine with Ionic columns, half-columns along the cella walls, stuccoed white. Cameo: the Temple of Portunus, Rome |
| 20 | `imperial-temple` | A marble Corinthian temple on a high podium inside a colonnaded precinct. Cameo: the Maison Carrée, Nîmes; the Temple of Augustus, Pula |
| 400 | `early-christian-basilica` | The temple closed and quarried; a basilica built from its columns: nave, aisles, clerestory, apse, a forecourt, and an octagonal baptistery. Cameo: Santa Sabina, Rome |
| 1120 | `romanesque-duomo` | A new cathedral: a front of tiered arcades, bands of coloured marble, round arches, and a freestanding bell tower. Cameo: Pisa; Lucca |
| 1310 | `gothic-duomo` | The front remade in Italian Gothic: three gables, a rose window, mosaic, pinnacles; the nave raised on pointed arcades. Cameo: Siena; Orvieto |
| 1480 | `dome` | A ribbed, pointed, eight-sided dome with a lantern raised over the crossing. Cameo: Brunelleschi's dome, Florence |
| 1630 | `baroque-duomo` | Baroque additions: a domed side chapel, a curved flight of steps, a new top to the bell tower, statues along the front |
| 1887 | `completed-facade` | The nineteenth century "completes" the cathedral: a new marble front in a revived medieval style, and the houses crowding it are cleared. Cameo: the façade of Florence Cathedral |

## power: "The Seat of Power"

`plotSize: [44, 44]`, kind `power`. Front (+Z) faces the main square. Large and complex: give
`collider()` blocks and leave courtyards and loggias walkable. **From 1300 the Palazzo Pubblico
and its tower are never demolished**; later stages alter it and build beside it (share it in
`shared.ts`).

| from | id | building |
|---|---|---|
| -750 | `arx` | The hilltop stronghold: an earth-and-timber rampart, a gate, the chief's hut |
| -500 | `archaic-citadel` | A citadel walled in great squared blocks, with a ruler's house and a cistern |
| -150 | `republican-forum` | The forum: an aisled basilica for the courts, a small senate house (curia), a speakers' platform, porticoes. Cameo: Pompeii; Cosa |
| 100 | `imperial-forum` | The forum rebuilt in marble: a basilica with a tribunal apse, a triumphal arch at the entrance, an equestrian statue. Cameo: the Arch of Trajan, Benevento |
| 600 | `lombard-palatium` | The duke's or gastald's hall built into the ruined basilica: a timber hall, a tower, a palace chapel |
| 1000 | `bishops-palace` | The bishop-count's fortified palace: a stone hall over an undercroft, a tower, a wall |
| 1210 | `broletto` | The commune's first town hall: an open arcaded ground floor for assemblies, the council hall above, an outside stair and a speaking balcony. Cameo: the Broletto, Como |
| 1300 | `palazzo-pubblico` | The civic palace: brick and stone, battlements, a tall slender tower with a bell chamber on brackets. Cameo: Siena; Palazzo Vecchio, Florence |
| 1480 | `signoria-palace` | A lord takes over: a Renaissance arcaded courtyard and a new wing with twin turrets are added to the old palace. Cameo: the Ducal Palace, Urbino |
| 1885 | `prefecture` | United Italy: a Neo-Renaissance prefecture wing beside the old palace and a bronze monument to the king in front |
| 1934 | `casa-del-fascio` | A Rationalist party headquarters beside the old palace: a white marble grid of frame and void. Cameo: Terragni's Casa del Fascio, Como |
| 1975 | `regional-offices` | Concrete offices for the new regional government (the regions date from 1970), at the edge of the centre |
| 2012 | `civic-restoration` | The medieval palace restored as museum and council chamber, with a glass link and a paved, car-free square |

## market: "The Market"

`plotSize: [26, 22]`, kind `market`. Seen from all sides; open ground floors want explicit
colliders on piers only. The Renaissance loggia will be kept on the central plot; the arcade and the
later market halls stand on new plots.

| from | id | building |
|---|---|---|
| -750 | `cattle-market` | Open ground by the ford with pens and an altar: the cattle market that is the town's reason to exist |
| -200 | `forum-shops` | Rows of shops under a portico, with a stone table of standard measures |
| 60 | `macellum` | A purpose-built food market: a courtyard with a round kiosk and fountain in the middle, shops round it, marble fish counters. Cameo: Pompeii; Pozzuoli |
| 950 | `stalls-in-the-ruins` | Stalls and awnings among the standing columns on market day |
| 1290 | `grain-loggia` | A Gothic open loggia on stone piers for the grain market, with a granary above. Cameo: Orsanmichele, Florence |
| 1550 | `renaissance-loggia` | An open arcaded hall on columns for silk and gold dealers, with a bronze fountain. Cameo: the Loggia del Mercato Nuovo, Florence |
| 1877 | `galleria` | An iron-and-glass shopping arcade entered through a triumphal arch, with a glazed dome at the crossing. Cameo: the Galleria Vittorio Emanuele II, Milan (reduced) |
| 1936 | `rationalist-market` | A covered market of reinforced concrete: parabolic arches, glass-block walls, a clock |
| 2014 | `food-hall` | The covered market restored: stalls below, a new mezzanine of places to eat under the old roof. Cameo: the Mercato Centrale, Florence |

## work: "The Workshop and the Factory"

`plotSize: [36, 22]`, kind `work`. Front (+Z) faces the street; **the river runs along the back,
its near bank at local z = -11** (water at y = -1.2), so wheels, quays and mills go at the back.

| from | id | building |
|---|---|---|
| -750 | `potters-yard` | An open workshop: a kiln, a clay pit, a hearth for casting bronze |
| -250 | `fullery-and-kilns` | Republican workshops: fulling vats, kilns for black-gloss pottery, an oil press |
| 60 | `bakery` | A pistrinum: hourglass-shaped lava mills turned by donkeys, a big domed oven, a shop counter. Cameo: Pompeii |
| 150 | `horrea` | A river warehouse round a courtyard: buttressed brick walls, a ramp, a quay with travertine mooring rings. Cameo: the Horrea Epagathiana, Ostia |
| 540 | `floating-mills` | The warehouse in ruin; mills on moored boats grind corn in the current, as Belisarius ordered during the siege of Rome in 537 |
| 1150 | `fulling-mill` | A stone watermill with undershot wheels driving fulling hammers, a weir across the river, drying ground |
| 1350 | `wool-works` | The wool guild's works: a dye house and a tiratoio, a tall drying shed with open timber galleries |
| 1550 | `silk-mill` | A water-powered silk-throwing mill: a tall building of circular machines driven by a wheel in the basement. Cameo: the Bolognese silk mill |
| 1840 | `filanda` | A silk-reeling mill: a long three-storey block of big windows and a boiler chimney |
| 1905 | `hydro-plant` | A hydroelectric station dressed as a castle, with penstocks and a turbine hall. Cameo: the Taccani plant, Trezzo sull'Adda |
| 1926 | `car-factory` | A reinforced-concrete car factory with a ramp to a test track on the roof. Cameo: Fiat Lingotto, Turin (reduced) |
| 1957 | `glass-factory` | A glass curtain-walled factory with sun louvres, a canteen and a nursery. Cameo: Olivetti, Ivrea |
| 2014 | `innovation-hub` | The factory reused: studios, a museum, a garden on the roof |

## bridge: "The Bridge"

`plotSize: [16, 40]`, kind `crossing`. **The road runs along Z through the origin; the river flows
along X between z = -12 and z = +12** (wider than England's). Banks at y = 0, water at y = -1.2,
bed about y = -2.4. A deck must meet the road (y = 0) at z = ±17. Call `b.noCollide()` and
`b.deck(width, 34, crownY, { yEnds: 0 })`. Roman and Renaissance decks are nearly level.
In the town the old bridge with its shops will be kept; the later bridges stand downstream.

| from | id | building |
|---|---|---|
| -750 | `ford-and-ferry` | A gravel ford and a raft ferry on a rope |
| -520 | `pile-bridge` | A timber pile bridge built without iron, in the keeping of priests. Cameo: the Pons Sublicius, Rome |
| -140 | `stone-arch-bridge` | The first stone bridge: round arches of tufa faced in travertine, with a flood opening through each pier. Cameo: the Pons Fabricius, Rome |
| 550 | `broken-bridge` | One arch cut in the Gothic War and patched in timber, with a tower at the bridgehead |
| 1100 | `fortified-bridge` | Repaired in stone, with a gate tower and a wayside chapel. Cameo: the Ponte Nomentano, Rome |
| 1345 | `shop-bridge` | Rebuilt after a great flood on low segmental arches, with shops along both sides and an open gap in the middle. Cameo: the Ponte Vecchio, Florence |
| 1569 | `renaissance-bridge` | Three flattened arches of great elegance, pointed cutwaters, statues at the corners. Cameo: the Ponte Santa Trinita, Florence |
| 1880 | `iron-bridge` | A wrought-iron girder bridge on masonry piers for the new quarters and the tram |
| 1944 | `bailey-bridge` | The bridge blown up by the retreating German army; a military Bailey bridge on the stumps of the piers |
| 1958 | `rebuilt-bridge` | Rebuilt "where it was, as it was" from stones dredged from the river. Cameo: the Ponte Santa Trinita again |
| 1972 | `concrete-bridge` | A sculpted reinforced-concrete road bridge. Cameo: Musmeci's bridge over the Basento, Potenza |
| 2008 | `footbridge` | A slender arched footbridge of steel and glass. Cameo: Calatrava's Ponte della Costituzione, Venice |

## spectacle: "Spectacle"

`plotSize: [40, 36]`, kind `culture`. Where the town goes to be entertained. The amphitheatre
plot will keep its ring of houses; the theatres stand on a second plot, the stadium, sports hall and
auditorium on new ground.

| from | id | building |
|---|---|---|
| -700 | `tumulus` | An Etruscan tumulus tomb: a great earth mound on a drum of cut tufa. Cameo: the Banditaccia necropolis, Cerveteri |
| 70 | `amphitheatre` | A stone amphitheatre: an oval arena, seating on radial vaults, an outer wall of arcades framed by half-columns. Cameo: Verona; the Colosseum (much reduced) |
| 1000 | `arena-houses` | Houses and a fortified tower built into the arches, the arena a garden: the oval survives as a ring of houses. Cameo: Piazza dell'Anfiteatro, Lucca |
| 1585 | `academy-theatre` | A learned academy's indoor theatre: a plain exterior hiding a Roman stage front and semicircular seating. Cameo: the Teatro Olimpico, Vicenza |
| 1778 | `opera-house` | A teatro all'italiana: a neoclassical front with a carriage porch, a horseshoe auditorium with tiers of boxes, a tall stage house. Cameo: La Scala, Milan |
| 1911 | `liberty-cinema` | A Stile Liberty cinema and variety theatre with an ironwork canopy |
| 1932 | `stadium` | A reinforced-concrete stadium: a cantilevered grandstand roof, spiral stairs, a slender tower. Cameo: the Stadio Berta, Florence (Nervi) |
| 1957 | `sports-hall` | A ribbed concrete dome carried on a ring of Y-shaped struts. Cameo: the Palazzetto dello Sport, Rome (Nervi) |
| 2002 | `auditorium` | Three lead-clad concert halls like great beetles round an open-air theatre. Cameo: the Parco della Musica, Rome (Piano) |

The amphitheatre should carry `end: gothicWar`-style ruin (games ended earlier, in the fifth
century; choose the year) so it stands as a ruin until the houses move in.

## osteria: "The Osteria"

`plotSize: [22, 22]`, kind `hospitality`. Food, drink and a bed.

| from | id | building |
|---|---|---|
| -750 | `hearth-hut` | A communal hut with an outdoor cooking hearth |
| -200 | `caupona` | A Republican tavern: a counter on the street, a dining room, rooms to let above |
| 60 | `thermopolium` | A street bar with an L-shaped masonry counter with jars sunk in it and a painted shrine, and an inn with a stable yard behind. Cameo: Pompeii; Ostia |
| 500 | `xenodochium` | A church hostel for pilgrims and the poor: a plain hall, a chapel, a well |
| 1050 | `pilgrim-hospital` | A hospital on the pilgrim road to Rome: a long hall, a loggia, a chapel. Cameo: Santa Maria della Scala, Siena |
| 1380 | `locanda` | A medieval inn: a courtyard, stables, an outside stair and gallery, a tavern on the ground floor with a branch hung out as a sign |
| 1470 | `renaissance-inn` | A Renaissance inn with open loggias and terracotta ornament. Cameo: the Albergo dell'Orso, Rome |
| 1740 | `posting-inn` | A posting inn on the Grand Tour road: a carriage court, a clock, arcaded stables |
| 1831 | `grand-cafe` | A neoclassical grand café with Doric porches and stone lions. Cameo: the Caffè Pedrocchi, Padua |
| 1898 | `grand-hotel` | A Belle Époque grand hotel: a corner cupola, an iron-and-glass canopy, terraces |
| 1958 | `bar-and-pensione` | A modern bar with a neon sign and an aluminium front, tables outside, a small pensione above |
| 2016 | `boutique-hotel` | A historic building restored as a small hotel and wine bar |

## walls: "Walls and Gates"

`plotSize: [30, 16]`, kind `defence`. **The road runs along Z through the origin and passes
through the gate; the wall runs along X** and is cut off at the plot edges. Leave the gateway
walkable (colliders either side).

| from | id | building |
|---|---|---|
| -750 | `rampart` | An earth bank, a ditch and a timber gate |
| -400 | `etruscan-gate` | A wall of huge squared blocks laid without mortar and an arched gate with carved heads. Cameo: the Porta all'Arco, Volterra |
| -30 | `roman-gate` | A city gate with two carriage arches, a windowed gallery above and flanking towers. Cameo: the Porta Praetoria, Aosta; the Porta Venere, Spello |
| 275 | `aurelian-gate` | A brick-faced concrete wall with square towers and a gate between round-fronted towers. Cameo: the Aurelian Walls and Porta San Sebastiano, Rome |
| 1150 | `communal-gate` | A tall gate-tower in the commune's new wall, with a fresco of the Virgin over the arch and a customs post. Cameo: the Porta San Niccolò, Florence |
| 1540 | `bastion-gate` | Low, thick, angled bastions for the age of cannon, with a rusticated gate. Cameo: Sanmicheli's Porta Nuova, Verona |
| 1870 | `gate-as-monument` | The walls pulled down for a ring of boulevards; the old gate left standing alone in a new square, with the customs sheds beside it |

## station: "The Station"

`plotSize: [40, 24]`, kind `transport`. The street front is +Z; the tracks run along X behind (at
about z = -9, on the ground).

| from | id | building |
|---|---|---|
| 1864 | `first-station` | The first station: a stuccoed neoclassical front and an iron train shed |
| 1934 | `rationalist-station` | A long, low station faced in stone, with a cascade of glass over the concourse. Cameo: Santa Maria Novella, Florence |
| 2013 | `high-speed-station` | A glass-and-steel gallery for the high-speed line. Cameo: Porta Susa, Turin |

## fountain: "The Fountain"

`plotSize: [12, 12]`, kind `culture`. Stands in the middle of a square; `noCollide` is wrong here
(it is solid), so give one collider.

| from | id | building |
|---|---|---|
| 1278 | `civic-fountain` | A many-sided medieval fountain of two stacked marble basins with carved panels and a bronze bowl. Cameo: the Fontana Maggiore, Perugia |
| 1643 | `baroque-fountain` | A Baroque fountain: figures, shells and rockwork round a jet of water. Cameo: Bernini's fountains in Rome |
