import { P, type Era } from '@ah/kit';

export const eras: Era[] = [
  {
    id: 'iron-age',
    name: 'Iron Age',
    from: -500,
    to: 43,
    tagline: 'Round houses in a cleared wood',
    summary:
      'Britain before Rome builds in what the land gives: hazel rods, clay, oak posts and straw. Almost everything is round. ' +
      'A family lives in one big circular room under a conical thatch with the hearth in the middle, and a settlement is a loose ' +
      'cluster of such houses behind a bank, a ditch and a timber palisade. Nothing is meant to last more than a generation, and little does.',
    traits: ['Circular plans', 'Conical thatched roofs', 'Earth banks and palisades', 'No chimneys, no windows'],
    materials: ['Wattle and daub', 'Oak posts', 'Wheat-straw thatch', 'Turf'],
    color: 0x8a9a5b,
    env: { streets: 'track', treeCover: 1, ground: P.earth, fields: P.meadow, extent: 75 },
  },
  {
    id: 'roman',
    name: 'Roman',
    from: 43,
    to: 410,
    tagline: 'Straight lines, stone and tile',
    summary:
      'The conquest of AD 43 brings an entire building culture at once: surveyed streets, mortar, fired brick and roof tile, glass, ' +
      'underfloor heating and the classical orders. Buildings turn rectangular and public life gets architecture of its own, ' +
      'with a forum, baths and temples. It is an imported, urban way of building, and it depends on an economy that will not outlast the legions.',
    traits: ['Rectangular, axial plans', 'Columns and pediments', 'Round arches and vaults', 'Red tiled roofs', 'A street grid'],
    materials: ['Stone and flint with tile courses', 'Lime mortar and concrete', 'Terracotta tile', 'Painted plaster'],
    color: 0xc46f4a,
    env: { streets: 'paved', treeCover: 0.55, ground: P.gravel, fields: P.crop, extent: 105 },
  },
  {
    id: 'anglo-saxon',
    name: 'Anglo-Saxon',
    from: 410,
    to: 1066,
    tagline: 'Timber halls among the ruins',
    summary:
      'When Roman rule ends the towns empty and the skills of mortar and tile are lost within a lifetime. The incoming English are ' +
      'carpenters: they build rectangular timber halls and small sunken-floored huts, and leave the Roman ruins as quarries. ' +
      'Stone returns only with Christianity after 597, in tall, narrow, small-windowed churches often built from reused Roman brick.',
    traits: ['Timber halls with steep roofs', 'Sunken-floored huts', 'Tall narrow stone churches', 'Tiny round or triangular-headed windows'],
    materials: ['Oak planks and posts', 'Thatch and shingles', 'Reused Roman stone and brick'],
    color: 0x7f6a4a,
    env: { streets: 'mud', treeCover: 0.8, ground: P.earth, fields: P.meadow, extent: 85 },
  },
  {
    id: 'norman',
    name: 'Norman',
    from: 1066,
    to: 1190,
    tagline: 'Castles and round arches',
    summary:
      'The Conquest replaces the ruling class and then rebuilds the country in its image. Within two generations nearly every ' +
      'cathedral and most parish churches are rebuilt in the Romanesque style of Normandy, with thick walls, round arches and massive ' +
      'piers, while castles, first of earth and timber and then of stone, hold down the towns. It is architecture as a statement of permanence.',
    traits: ['Round arches', 'Thick walls, small windows', 'Square keeps and mottes', 'Zigzag (chevron) carving', 'Flat buttresses'],
    materials: ['Rubble and ashlar stone', 'Caen limestone', 'Oak', 'Thatch and shingle for ordinary houses'],
    color: 0x9a927c,
    env: { streets: 'mud', treeCover: 0.6, ground: P.earth, fields: P.grassDry, extent: 100 },
  },
  {
    id: 'gothic',
    name: 'Gothic',
    from: 1190,
    to: 1485,
    tagline: 'Pointed arches, light and height',
    summary:
      'The pointed arch, the rib vault and the buttress arrive from France and change what stone can do: walls thin out, windows ' +
      'grow, and churches climb. English masons then take the style their own way, through Early English lancets and Decorated tracery ' +
      'to the great glass grids of the Perpendicular. Meanwhile wool money pays for timber-framed halls, guildhalls, stone bridges and market crosses.',
    traits: ['Pointed arches', 'Buttresses and pinnacles', 'Window tracery and spires', 'Timber-framed open halls', 'Jettied upper floors'],
    materials: ['Dressed limestone and flint', 'Oak framing with wattle infill', 'Lead and clay tile', 'Stained glass'],
    color: 0x6f86a8,
    env: { streets: 'mud', treeCover: 0.4, ground: P.earth, fields: P.crop, extent: 115 },
  },
  {
    id: 'tudor',
    name: 'Tudor and Jacobean',
    from: 1485,
    to: 1660,
    tagline: 'Chimneys, glass and black-and-white',
    summary:
      'Peace, the sale of monastery lands and cheaper brick and glass shift building from the church to the house. The open hall with a ' +
      'central hearth gives way to chimneys and upper floors, so houses grow tall, glazed and comfortable. Timber framing reaches its ' +
      'showiest, and Renaissance ornament arrives second-hand from Italy by way of Flanders, applied to buildings that are still Gothic underneath.',
    traits: ['Tall brick chimney stacks', 'Close-studded and patterned timber framing', 'Mullioned windows', 'Jetties and gables', 'Symmetrical show fronts'],
    materials: ['Oak frame with plaster or brick infill', 'Red brick', 'Clay tile', 'Leaded glass'],
    color: 0x8f4f3a,
    env: { streets: 'cobble', treeCover: 0.36, ground: P.earth, fields: P.crop, extent: 125 },
  },
  {
    id: 'georgian',
    name: 'Stuart and Georgian',
    from: 1660,
    to: 1837,
    tagline: 'Symmetry, proportion and brick',
    summary:
      'After the Restoration, and the Great Fire of London in 1666, towns are rebuilt in brick and stone to classical rules learned ' +
      'from Italy, France and Holland. Proportion matters more than ornament: flat fronts, sash windows shrinking floor by floor, a ' +
      'doorcase, a cornice. The same grammar serves a terrace, a town hall and a cotton mill, and by the 1780s water and then steam are driving the first factories.',
    traits: ['Strict symmetry', 'Sash windows', 'Columns, pediments and cornices', 'Terraces and squares', 'Hidden, low-pitched roofs'],
    materials: ['Red and yellow brick', 'Portland and Bath stone', 'Welsh slate', 'Stucco', 'Cast iron'],
    color: 0xc0714a,
    env: { streets: 'cobble', treeCover: 0.32, ground: P.gravel, fields: P.meadow, extent: 140 },
  },
  {
    id: 'victorian',
    name: 'Victorian',
    from: 1837,
    to: 1901,
    tagline: 'Iron, steam and a battle of styles',
    summary:
      'Railways move slate, brick and plate glass anywhere in the country, and factories mass-produce ornament. Towns multiply in size, ' +
      'filling with terraces, mills, stations and town halls. With no single agreed style, architects argue over the right one: Gothic for ' +
      'churches and civic pride, Italianate for banks, iron and glass for the new building types that have no precedent at all.',
    traits: ['Gothic Revival pointed arches', 'Polychrome brickwork', 'Bay windows', 'Iron and glass roofs', 'Clock towers and chimneys'],
    materials: ['Machine-made brick', 'Welsh slate', 'Cast and wrought iron', 'Plate glass', 'Terracotta'],
    color: 0x7a3f33,
    env: { streets: 'setts', treeCover: 0.27, ground: P.cobble, fields: P.meadow, extent: 175 },
  },
  {
    id: 'interwar',
    name: 'Edwardian and Interwar',
    from: 1901,
    to: 1945,
    tagline: 'Suburbs, Arts and Crafts, Art Deco',
    summary:
      'A reaction against the machine produces the Arts and Crafts house and the garden suburb, and between the wars four million ' +
      'new homes are built, most of them semi-detached with a nod to the Tudor past. Alongside them come two imports: the glamour of ' +
      'Art Deco for cinemas and factories, and the white flat-roofed Modernism brought by architects fleeing the Continent.',
    traits: ['Semi-detached houses with bay windows', 'Mock-Tudor gables', 'Streamlined Art Deco fronts', 'Steel frames behind stone', 'Flat roofs and strip windows'],
    materials: ['Brick and pebbledash', 'Steel frame', 'Faience tiles', 'Reinforced concrete', 'Crittall steel windows'],
    color: 0xb9a36a,
    env: { streets: 'macadam', treeCover: 0.27, ground: P.paving, fields: P.meadow, extent: 205 },
  },
  {
    id: 'postwar',
    name: 'Post-war Modern',
    from: 1945,
    to: 1980,
    tagline: 'Concrete, towers and the car',
    summary:
      'Bomb damage, a housing shortage and a confident welfare state put architects in charge of rebuilding. Ornament is rejected ' +
      'outright in favour of function, system building and exposed concrete. Town centres are cleared for shopping precincts, civic ' +
      'centres, ring roads and tower blocks: some of it humane and well made, much of it resented, and all of it unmistakable.',
    traits: ['Exposed board-marked concrete', 'Flat roofs', 'Ribbon windows', 'Towers and slabs', 'Raised walkways and precincts'],
    materials: ['Reinforced and precast concrete', 'Curtain-wall glazing', 'Dark engineering brick', 'Aluminium'],
    color: 0x8e8b84,
    env: { streets: 'tarmac', treeCover: 0.26, ground: P.paving, fields: P.meadow, extent: 220 },
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    from: 1980,
    to: 2025,
    tagline: 'Glass, reuse and low energy',
    summary:
      'Faith in the clean sweep fades. Old buildings are converted rather than cleared, Postmodernism brings back colour and joke, and ' +
      'British High-Tech turns structure and services into the ornament. Since 2000 the pressure has been energy: thick insulation, ' +
      'timber structure, solar roofs and triple glazing shape new buildings as firmly as the classical orders once did.',
    traits: ['Glass walls and atria', 'Exposed steel structure', 'Timber cladding', 'Solar panels and green roofs', 'Old buildings reused'],
    materials: ['Glass and steel', 'Engineered timber (CLT)', 'Zinc and aluminium cladding', 'Insulated render'],
    color: 0x4f8fa8,
    env: { streets: 'tarmac', treeCover: 0.31, ground: P.paving, fields: P.meadow, extent: 230 },
  },
];
