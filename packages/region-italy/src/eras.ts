import { P, type Era } from '@ah/kit';

export const eras: Era[] = [
  {
    id: 'archaic',
    name: 'Huts and Etruscans',
    from: -750,
    to: -300,
    tagline: 'From thatched huts to tiled roofs',
    summary:
      'The first settlement is a cluster of oval thatched huts on a hill above a river ford. Within two centuries its neighbours the ' +
      'Etruscans, trading with Greek colonists in the south, have taught it to build in squared stone, to roof with fired clay tiles and ' +
      'to raise temples on high platforms, crowned with painted terracotta figures. Houses turn rectangular and gather round a central hall open to the sky.',
    traits: ['Oval huts of wattle and thatch', 'Temples on a high podium with a deep porch', 'Painted terracotta roof ornaments', 'The first tiled roofs', 'Walls of great squared blocks'],
    materials: ['Wattle and daub', 'Mudbrick on stone footings', 'Tufa blocks', 'Terracotta'],
    color: 0x9a7a4a,
    env: { streets: 'track', treeCover: 0.85, ground: P.earth, fields: P.meadow, extent: 80 },
  },
  {
    id: 'republic',
    name: 'Roman Republic',
    from: -300,
    to: -27,
    tagline: 'The forum, the arch and concrete',
    summary:
      'As Rome takes control of Italy the town becomes a self-governing municipium with a forum, a basilica for the courts and paved ' +
      'streets. Builders discover that lime mixed with volcanic sand sets hard even under water: concrete, faced with small stones, makes ' +
      'arches and vaults cheap. Conquests in the Greek east bring columns, colonnaded gardens and a taste for marble into the houses of the rich.',
    traits: ['The atrium house', 'Round arches of cut stone', 'Concrete faced with small stones', 'Greek columns on Italian podiums', 'A forum with a basilica'],
    materials: ['Tufa and travertine', 'Concrete (opus caementicium)', 'Stucco imitating marble', 'Terracotta tile'],
    color: 0xb5734f,
    env: { streets: 'paved', treeCover: 0.6, ground: P.gravel, fields: P.crop, extent: 105 },
  },
  {
    id: 'empire',
    name: 'Roman Empire',
    from: -27,
    to: 313,
    tagline: 'Brick, marble, vault and dome',
    summary:
      'Peace and imperial money rebuild the town in fired brick and concrete, dressed with marble shipped from across the Mediterranean. ' +
      'Concrete vaults and domes roof spaces no timber could span: baths, markets and the amphitheatre. Ordinary people live stacked ' +
      'in apartment blocks five storeys high, over shops that open their whole front to the street.',
    traits: ['Brick-faced concrete', 'Barrel vaults and domes', 'Apartment blocks over shops', 'Marble columns and veneers', 'Arcades framed by columns'],
    materials: ['Fired brick', 'Concrete with pozzolana', 'Marble', 'Travertine', 'Window glass'],
    color: 0xc46f4a,
    env: { streets: 'paved', treeCover: 0.45, ground: P.gravel, fields: P.crop, extent: 130 },
  },
  {
    id: 'late-antique',
    name: 'Late Antiquity',
    from: 313,
    to: 568,
    tagline: 'Basilicas rise as the city shrinks',
    summary:
      'Christianity becomes legal in 313 and then official, and the Church adopts the Roman meeting hall, the basilica, for worship. ' +
      'Temples close and are quarried for their columns. The town, behind new walls, loses people through plague, war and the collapse of ' +
      'the western empire in 476, and the Gothic War of 535 to 554 leaves much of it in ruins, but unlike in Britain it is never abandoned.',
    traits: ['The basilica church with apse and atrium', 'Octagonal baptisteries', 'Columns reused from older buildings (spolia)', 'Mosaic', 'City walls with towers'],
    materials: ['Reused brick and marble', 'Timber roof trusses', 'Mosaic', 'Thin brick'],
    color: 0x9a8f6a,
    env: { streets: 'paved', treeCover: 0.5, ground: P.gravel, fields: P.meadow, extent: 115 },
  },
  {
    id: 'early-medieval',
    name: 'Early Middle Ages',
    from: 568,
    to: 1000,
    tagline: 'Living among the ruins',
    summary:
      'Under Lombard dukes, then Frankish and papal rule, a much smaller population lives inside the shell of the Roman town, growing ' +
      'vegetables in the old forum. People build in timber, clay and whatever the ruins supply. Only the Church builds in mortared stone, ' +
      'and the bishop, in the absence of anyone else, runs the town.',
    traits: ['Houses patched from Roman fragments', 'Two-storey houses with an outside stair', 'Small plain churches', 'Gardens and orchards inside the walls'],
    materials: ['Reused brick and tufa', 'Timber and clay', 'Thatch and reused tile'],
    color: 0x7f6a4a,
    env: { streets: 'mud', treeCover: 0.65, ground: P.earth, fields: P.meadow, extent: 85 },
  },
  {
    id: 'romanesque',
    name: 'Age of the Communes',
    from: 1000,
    to: 1250,
    tagline: 'Towers, cathedrals and self-rule',
    summary:
      'Trade revives and the town swells with merchants and craftsmen who throw off the bishop’s rule and govern themselves as a commune. ' +
      'They build a great cathedral with a separate bell tower, in a Romanesque of round arches and tiers of small arcades, banded in ' +
      'coloured marble. Rival noble families build stone towers beside their houses, and the commune builds its first town hall.',
    traits: ['Round arches in tiers of arcades', 'Striped marble', 'A freestanding bell tower', 'Family tower houses', 'An open loggia under the council hall'],
    materials: ['Marble and local stone', 'Brick', 'Timber roofs', 'Clay tiles (coppi)'],
    color: 0xa58a5c,
    env: { streets: 'cobble', treeCover: 0.45, ground: P.earth, fields: P.crop, extent: 110 },
  },
  {
    id: 'gothic',
    name: 'Gothic',
    from: 1250,
    to: 1420,
    tagline: 'Civic pride in brick and marble',
    summary:
      'Gothic arrives from France with the Cistercian monks and the preaching friars, but Italy takes only what it likes: pointed arches ' +
      'and tracery, not walls of glass or flying buttresses. Churches stay broad and frescoed. The real effort goes into the city itself: a ' +
      'battlemented town hall with a soaring tower, a paved piazza, a market loggia, and merchants’ palaces that are half fortress.',
    traits: ['Pointed arches on broad, plain walls', 'Gabled façades with mosaic and a rose window', 'Battlemented civic palaces with tall towers', 'Two-light windows under one arch', 'Open market loggias'],
    materials: ['Brick', 'Marble in coloured bands', 'Pietra forte and local stone', 'Fresco'],
    color: 0x6f86a8,
    env: { streets: 'cobble', treeCover: 0.35, ground: P.cobble, fields: P.crop, extent: 135 },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    from: 1420,
    to: 1600,
    tagline: 'Antiquity measured and reborn',
    summary:
      'In Florence around 1420 Brunelleschi studies Roman ruins and designs with round arches, classical columns and simple ratios, and ' +
      'raises a dome wider than any since antiquity. Alberti writes the rules down. Within a century every prince and banker wants a ' +
      'palace with a rusticated front and an arcaded courtyard, and architects such as Bramante, Michelangelo and Palladio are bending the ' +
      'rules with a freedom later called Mannerism.',
    traits: ['Round arches on classical columns', 'Symmetry and simple proportions', 'Rusticated palace fronts with a great cornice', 'The dome', 'Arcaded courtyards and loggias'],
    materials: ['Pietra serena against white plaster', 'Rusticated stone', 'Travertine', 'Brick and stucco'],
    color: 0xb8894a,
    env: { streets: 'cobble', treeCover: 0.3, ground: P.cobble, fields: P.crop, extent: 145 },
  },
  {
    id: 'baroque',
    name: 'Baroque',
    from: 1600,
    to: 1750,
    tagline: 'Curves, drama and the stage-set city',
    summary:
      'The Church of the Counter-Reformation wants buildings that move people, and in Rome Bernini, Borromini and Pietro da Cortona ' +
      'supply them: façades that swell and curve, columns massed for shadow, oval plans, painted ceilings that open to heaven. Streets, ' +
      'stairs, fountains and squares are designed together as theatre. Noble families answer with palaces built round ceremonial staircases.',
    traits: ['Curved and broken façades', 'Giant columns and pilasters', 'Scrolls, broken pediments and sculpture', 'Oval plans and domes', 'Fountains and grand staircases'],
    materials: ['Travertine', 'Stucco', 'Coloured marbles', 'Painted plaster in ochres'],
    color: 0xa5524a,
    env: { streets: 'cobble', treeCover: 0.28, ground: P.cobble, fields: P.crop, extent: 150 },
  },
  {
    id: 'unification',
    name: 'Neoclassical and United Italy',
    from: 1750,
    to: 1900,
    tagline: 'Opera houses, railways and a new nation',
    summary:
      'The excavation of Pompeii and Herculaneum makes a cooler, more correct classicism the fashion across Europe, and every town builds ' +
      'an opera house in it. After unification in 1861 the new state marks its arrival with prefectures, railway stations, monuments and ' +
      'broad streets cut through old quarters. Iron and glass roof the markets and arcades, and apartment blocks with shutters and balconies fill the new districts.',
    traits: ['Temple fronts and plain walls', 'The horseshoe opera house', 'Iron and glass arcades', 'Stuccoed apartment blocks with iron balconies', 'Boulevards in place of the walls'],
    materials: ['Stucco over brick', 'Cast and wrought iron', 'Glass', 'Travertine and marble for show'],
    color: 0x7a5a6a,
    env: { streets: 'setts', treeCover: 0.24, ground: P.cobble, fields: P.meadow, extent: 175 },
  },
  {
    id: 'liberty-fascist',
    name: 'Liberty and the Fascist years',
    from: 1900,
    to: 1945,
    tagline: 'Flowers, speed and white marble',
    summary:
      'The new century begins with Stile Liberty, Italy’s Art Nouveau, all flowing ironwork and ceramic flowers, and with the Futurists’ ' +
      'dreams of a city of machines. Under Fascism from 1922 the state builds on a vast scale in two competing manners: a stripped, ' +
      'monumental classicism in travertine, and Rationalism, the Italian branch of the Modern Movement, with its white grids and precise proportions.',
    traits: ['Whiplash ironwork and floral ceramics', 'Reinforced concrete frames', 'Stripped classical arcades in travertine', 'White rational grids', 'Party headquarters, post offices and stations'],
    materials: ['Reinforced concrete', 'Travertine and marble cladding', 'Glass block', 'Wrought iron and ceramic'],
    color: 0xb9a36a,
    env: { streets: 'macadam', treeCover: 0.22, ground: P.paving, fields: P.meadow, extent: 205 },
  },
  {
    id: 'postwar',
    name: 'Reconstruction and the boom',
    from: 1945,
    to: 1980,
    tagline: 'Concrete shells, flats and factories',
    summary:
      'Bombed bridges and centres are rebuilt, often exactly as they were. A state housing programme puts up whole neighbourhoods in a ' +
      'deliberately modest, village-like style, and then the economic miracle of the late 1950s covers the outskirts with speculative ' +
      'apartment blocks. Engineers such as Pier Luigi Nervi make reinforced concrete graceful, and Italian industrial design becomes famous worldwide.',
    traits: ['Ribbed concrete domes and shells', 'The palazzina: a small block of flats with balconies', 'Roller shutters and strip balconies', 'Low-rise public housing with pitched roofs', 'Large housing megastructures'],
    materials: ['Reinforced and prestressed concrete', 'Brick infill', 'Travertine and klinker cladding', 'Aluminium and glass'],
    color: 0x8e8b84,
    env: { streets: 'tarmac', treeCover: 0.2, ground: P.paving, fields: P.meadow, extent: 225 },
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    from: 1980,
    to: 2025,
    tagline: 'Restoration, reuse and a few stars',
    summary:
      'Italy turns to the care of what it has: historic centres are closed to traffic and restored, and factories, markets and barracks ' +
      'find new uses. Aldo Rossi’s writing on the memory of cities shapes architects everywhere. New building is rarer and often by ' +
      'international names, while energy rules bring external insulation, shading and solar roofs to ordinary housing.',
    traits: ['Old buildings restored and reused', 'Pedestrian historic centres', 'Glass and steel inserted into old fabric', 'Shading screens and solar roofs', 'A few sculptural public buildings'],
    materials: ['Glass and steel', 'Corten steel', 'Insulated render', 'Engineered timber', 'Lead and zinc cladding'],
    color: 0x4f8fa8,
    env: { streets: 'tarmac', treeCover: 0.26, ground: P.paving, fields: P.meadow, extent: 235 },
  },
];
