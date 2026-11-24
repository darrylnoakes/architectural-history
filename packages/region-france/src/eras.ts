import { P, type Era } from '@ah/kit';

export const eras: Era[] = [
  {
    id: 'gaulish',
    name: 'The Gauls',
    from: -300,
    to: -52,
    tagline: 'Timber, earth and thatch behind a rampart',
    summary:
      'The first town is an oppidum of a Belgic tribe: a broad enclosure on a river crossing, defended by a rampart of earth, often laced with ' +
      'timber. Inside, rectangular houses of posts, wattle and thatch stand in fenced yards beside granaries, workshops and a sanctuary ' +
      'where captured weapons are hung up. The Gauls are fine carpenters and smiths, strike their own coins and drink Italian wine, but they build nothing in mortared stone.',
    traits: ['Rectangular timber houses', 'Earth ramparts, some laced with timber (murus gallicus)', 'Granaries on posts', 'Ditched sanctuaries', 'No mortar, no tile'],
    materials: ['Oak posts', 'Wattle and daub', 'Thatch', 'Earth and dry stone'],
    color: 0x8a9460,
    env: { streets: 'track', treeCover: 0.9, ground: P.earth, fields: P.meadow, extent: 85, fieldSize: [30, 36] },
  },
  {
    id: 'gallo-roman',
    name: 'Gallo-Roman',
    from: -52,
    to: 275,
    tagline: 'A Roman town in stone and tile',
    summary:
      'After Caesar’s conquest the tribe’s capital is laid out again as a Roman town: a grid of streets, a forum with its basilica, baths, ' +
      'a theatre and a monumental arch, all in mortared stone with tiled roofs. Much is built the local way under the Roman surface: ' +
      'houses are timber and cob on stone footings with deep cellars, and the old gods are housed in a temple of a shape found almost only in Gaul, Britain and the Rhineland, a tall square tower inside a gallery.',
    traits: ['A street grid and a forum', 'Small squared stone with bands of brick', 'The Romano-Celtic temple (fanum)', 'Cellars under the houses', 'Theatres with an arena'],
    materials: ['Limestone in small blocks (petit appareil)', 'Brick courses', 'Clay tile (tegula and imbrex)', 'Timber frame and cob'],
    color: 0xc0714e,
    env: { streets: 'paved', treeCover: 0.5, ground: P.gravel, fields: P.crop, extent: 135, fieldSize: [50, 50] },
  },
  {
    id: 'late-antique',
    name: 'Late Antiquity',
    from: 275,
    to: 481,
    tagline: 'Behind a wall of borrowed stone',
    summary:
      'The invasions of 275 and 276 end the open town. What is left draws in behind a wall, built over the next decades on foundations of tombstones, ' +
      'column drums and carved blocks from the ruined monuments, with towers and few gates. Inside it the bishop becomes the leading man ' +
      'of the city, and the first cathedral, plain halls (sometimes a pair) with a baptistery, goes up against the rampart.',
    traits: ['Town walls on reused carved blocks', 'Round-fronted towers', 'A shrunken, crowded town', 'The cathedral group and its baptistery', 'Ruins used as quarries'],
    materials: ['Reused Roman masonry', 'Small squared stone with brick bands', 'Timber and thatch', 'Clay tile'],
    color: 0xb59a6c,
    env: { streets: 'paved', treeCover: 0.6, ground: P.gravel, fields: P.meadow, extent: 105, fieldSize: [50, 50] },
  },
  {
    id: 'frankish',
    name: 'Merovingians and Carolingians',
    from: 481,
    to: 987,
    tagline: 'Bishops, abbeys and timber halls',
    summary:
      'Under the Frankish kings the town is a bishop’s seat and at times a royal one. Almost everything is of timber and thatch again, among ' +
      'Roman walls that are patched and lived in. Stone is kept for God: outside the walls a great abbey grows over a saint’s tomb, and ' +
      'under Charlemagne the churches are rebuilt on a larger scale, with crypts, towers and a tall entrance block, the westwork, in conscious revival of Rome.',
    traits: ['Timber halls and sunken huts', 'Abbeys outside the walls', 'Crypts for relics', 'The westwork', 'Roman columns and bricks reused'],
    materials: ['Oak, wattle and thatch', 'Reused Roman stone and brick', 'Rubble with thick mortar', 'Lead and shingles on churches'],
    color: 0x86704c,
    env: { streets: 'mud', treeCover: 0.75, ground: P.earth, fields: P.meadow, extent: 95, fieldSize: [26, 60] },
  },
  {
    id: 'romanesque',
    name: 'Romanesque',
    from: 987,
    to: 1140,
    tagline: 'Round arches, stone vaults and the lord’s tower',
    summary:
      'Around the year 1000, a monk wrote, the world put on a white robe of churches. Peace, pilgrims and reformed abbeys such as Cluny pay ' +
      'for buildings in cut stone with round arches, thick walls and, for the first time since Rome, stone vaults over wide naves. The east end ' +
      'gains an ambulatory with a ring of chapels. Lords raise mottes and then square stone keeps, and the first stone houses appear in the towns.',
    traits: ['Round arches', 'Barrel and groin vaults', 'Ambulatory with radiating chapels', 'Carved capitals and portals', 'Mottes and square keeps'],
    materials: ['Cut limestone', 'Rubble walls with ashlar dressings', 'Oak roofs', 'Stone slates and clay tile'],
    color: 0xa58d62,
    env: { streets: 'mud', treeCover: 0.55, ground: P.earth, fields: P.crop, extent: 115, fieldSize: [14, 110] },
  },
  {
    id: 'gothic',
    name: 'Gothic',
    from: 1140,
    to: 1350,
    tagline: 'Light, height and the flying buttress',
    summary:
      'In the 1140s Abbot Suger rebuilds the choir of Saint-Denis with pointed arches, ribbed vaults and walls dissolved into coloured glass, ' +
      'and within a lifetime every city of the royal domain is rebuilding its cathedral the same way, each higher than the last. The weight ' +
      'goes out through flying buttresses, so the walls can be windows. The townspeople, rich on cloth and fairs and holding charters from the king, build belfries, halls and walls of their own.',
    traits: ['Pointed arches and rib vaults', 'Flying buttresses', 'Rose windows and stained glass', 'Portals crowded with sculpture', 'Belfries and town walls'],
    materials: ['Fine limestone ashlar', 'Stained glass in lead', 'Oak roof frames', 'Lead and slate'],
    color: 0x6f86ab,
    env: { streets: 'cobble', treeCover: 0.35, ground: P.earth, fields: P.crop, extent: 135, fieldSize: [14, 110] },
  },
  {
    id: 'flamboyant',
    name: 'Late Gothic',
    from: 1350,
    to: 1500,
    tagline: 'War, plague and tracery like flames',
    summary:
      'The Black Death and the Hundred Years’ War stop the great works for two generations; towns spend on walls and guns instead. When ' +
      'building picks up again after 1450 the Gothic has turned ornamental: the Flamboyant, named after its flame-shaped tracery, covers ' +
      'porches, towers and town halls in stone lace. The streets fill with timber-framed houses, each floor jutting over the one below, and rich merchants build courtyard mansions with stair towers.',
    traits: ['Flame-shaped (flamboyant) tracery', 'Openwork gables and pinnacles', 'Jettied timber-framed houses', 'Stair towers and tall dormers', 'Machicolations and gun ports'],
    materials: ['Limestone carved very fine', 'Oak frames with cob or brick infill', 'Flat clay tiles', 'Slate'],
    color: 0x5f6f9a,
    env: { streets: 'cobble', treeCover: 0.4, ground: P.earth, fields: P.crop, extent: 135, fieldSize: [14, 110] },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    from: 1500,
    to: 1610,
    tagline: 'Italy comes to the Loire',
    summary:
      'The kings come home from their Italian wars with painters, gardeners and a taste for pilasters. At first the new ornament is simply ' +
      'laid over French shapes: steep roofs, tall dormers and stair towers dressed in medallions and candelabra. By the 1540s architects such ' +
      'as Lescot and Delorme have learned the orders properly and made a French classicism of their own. Castles turn into châteaux, with big windows, symmetry and moats kept for show.',
    traits: ['Pilasters, medallions and shell niches', 'Mullion-and-transom windows', 'Steep slate roofs with ornate dormers', 'Symmetrical fronts', 'Châteaux in place of castles'],
    materials: ['Soft white limestone (tuffeau)', 'Slate', 'Brick with stone dressings', 'Carved oak'],
    color: 0xc9a25a,
    env: { streets: 'cobble', treeCover: 0.32, ground: P.cobble, fields: P.crop, extent: 145, fieldSize: [16, 110] },
  },
  {
    id: 'classical',
    name: 'The Classical Age',
    from: 1610,
    to: 1789,
    tagline: 'Order, symmetry and the king’s engineers',
    summary:
      'Under the Bourbons France sets the taste of Europe. Brick-and-stone squares under Henri IV give way to the grave classicism of ' +
      'Mansart and Le Vau, to Versailles and its gardens, and to the hôtel particulier set between courtyard and garden. Vauban rings the frontier ' +
      'towns with bastions. After 1715 interiors turn light and curving, the Rococo; from the 1750s taste swings back to Greece and Rome, in plain walls, columns and geometry.',
    traits: ['Mansard roofs', 'Tall windows in strict rows', 'The hôtel between court and garden', 'Royal squares and formal gardens', 'Bastioned fortifications'],
    materials: ['Cut limestone', 'Brick with stone bands and quoins', 'Slate and lead', 'Wrought iron'],
    color: 0xb88a86,
    env: { streets: 'cobble', treeCover: 0.28, ground: P.cobble, fields: P.crop, extent: 155, fieldSize: [16, 110] },
  },
  {
    id: 'nineteenth',
    name: 'Revolution to Second Empire',
    from: 1789,
    to: 1870,
    tagline: 'Iron, railways and boulevards',
    summary:
      'The Revolution sells the abbeys for their stone and turns the cathedral into a Temple of Reason; Napoleon gives every chief town a ' +
      'prefecture and a law court with a temple front. Then come the railway, the spinning mill and iron: market halls, arcades and station ' +
      'sheds of iron and glass. Under Napoleon III Haussmann cuts boulevards through Paris and the provinces copy him, while Viollet-le-Duc restores, and sometimes reinvents, the Middle Ages.',
    traits: ['Temple-front public buildings', 'Iron and glass halls', 'Boulevards lined with uniform blocks', 'Mills with tall chimneys', 'Medieval buildings restored'],
    materials: ['Cut stone and plaster', 'Cast and wrought iron', 'Sheet glass', 'Zinc and slate', 'Brick'],
    color: 0x7c6a8c,
    env: { streets: 'setts', treeCover: 0.24, ground: P.cobble, fields: P.crop, extent: 180, fieldSize: [18, 120] },
  },
  {
    id: 'belle-epoque',
    name: 'Belle Époque',
    from: 1870,
    to: 1914,
    tagline: 'The Republic builds, and Art Nouveau blooms',
    summary:
      'The Third Republic builds a town hall, a school and a station for every commune, in a confident eclectic manner taught at the École ' +
      'des Beaux-Arts and copied across the world. Department stores and brasseries glitter with iron, glass and ceramic. Around 1900 Art Nouveau ' +
      'lets stems and whiplash curves loose over villas and shopfronts, at Nancy above all, while engineers quietly perfect a new material, reinforced concrete.',
    traits: ['Beaux-Arts public buildings', 'Polychrome brick and ceramic', 'Art Nouveau curves in iron and stone', 'Department stores and brasseries', 'The first reinforced concrete'],
    materials: ['Brick and cut stone', 'Iron and steel', 'Glazed ceramic', 'Zinc and slate', 'Reinforced concrete'],
    color: 0xb9a46a,
    env: { streets: 'macadam', treeCover: 0.22, ground: P.paving, fields: P.crop, extent: 205, fieldSize: [20, 130] },
  },
  {
    id: 'wars',
    name: 'War and Reconstruction',
    from: 1914,
    to: 1945,
    tagline: 'A town shelled, and rebuilt in Art Deco',
    summary:
      'From September 1914 the front runs a few kilometres from the town and four years of shellfire leave the centre in ruins, the ' +
      'cathedral roofless. The Reconstruction of the 1920s rebuilds street by street on the old plots, in brick and concrete with stepped ' +
      'gables, geometric ironwork and bow windows: at Reims one of the largest ensembles of Art Deco anywhere. The same years see garden suburbs for workers and, on the edge of taste, the white villas of Le Corbusier.',
    traits: ['Art Deco: stepped gables, zigzags, sunbursts', 'Concrete frames behind brick and stone', 'Monuments rebuilt as they were', 'Garden suburbs', 'White modern villas on stilts'],
    materials: ['Reinforced concrete', 'Brick', 'Artificial stone and mosaic', 'Wrought iron', 'Clay tile'],
    color: 0x9d7f6b,
    env: { streets: 'macadam', treeCover: 0.2, ground: P.paving, fields: P.crop, extent: 215, fieldSize: [24, 140] },
  },
  {
    id: 'trente-glorieuses',
    name: 'Trente Glorieuses',
    from: 1945,
    to: 1975,
    tagline: 'Concrete, slabs and towers',
    summary:
      'Thirty years of growth and a severe housing shortage produce the grands ensembles: slabs and towers of prefabricated concrete panels, ' +
      'set in open ground at the edge of town and put up by crane on rails. The state builds a house of culture, a hospital and offices in the ' +
      'same material; the car brings the bypass, the hypermarket and the detached pavillon. Meanwhile the old centre empties, until a law of 1962 begins to protect it.',
    traits: ['Slab and tower blocks', 'Prefabricated concrete panels', 'Buildings set in open space', 'Hypermarkets and car parks', 'The detached pavillon'],
    materials: ['Reinforced and prestressed concrete', 'Steel and aluminium', 'Plate glass', 'Asphalt'],
    color: 0x8d8d86,
    env: { streets: 'tarmac', treeCover: 0.2, ground: P.paving, fields: P.crop, extent: 240, fieldSize: [70, 150] },
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    from: 1975,
    to: 2025,
    tagline: 'Heritage, glass and the TGV',
    summary:
      'The tower blocks fall from favour and some are blown up; the old centre is cleaned, pedestrianised and listed. The state and the ' +
      'cities compete in showpiece buildings, from the Pompidou Centre onward, and the high-speed train puts the town an hour from Paris. New ' +
      'housing is low, timber-clad and thrifty with energy, and old factories and markets are kept and given new uses.',
    traits: ['Old buildings restored and reused', 'Glass and steel showpieces', 'Pedestrian streets and trams', 'Low-energy timber housing', 'Slabs demolished or remodelled'],
    materials: ['Glass and steel', 'Timber cladding', 'Exposed concrete', 'Zinc', 'Photovoltaic panels'],
    color: 0x5b9bb5,
    env: { streets: 'tarmac', treeCover: 0.26, ground: P.paving, fields: P.crop, extent: 250, fieldSize: [70, 150] },
  },
];
