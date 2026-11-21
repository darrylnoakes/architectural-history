import * as THREE from 'three';

/**
 * Shared colour palette (sRGB hex). Named after the real building material so
 * that building code reads like a specification: `b.box(6, 3, 4, P.limewash)`.
 * Tones are deliberately soft and slightly desaturated for the model-town look.
 */
export const P = {
  // --- earth & vegetable materials
  thatch: 0xc9a85c,
  thatchOld: 0x9c8552,
  reed: 0xb8a468,
  turf: 0x7c9a54,
  wattle: 0xb99b6b,
  daub: 0xd8c39a,
  cob: 0xd9b98a,
  mud: 0x8a6f52,
  earth: 0x9b8262,
  // --- timber
  oak: 0x7a5a3a,
  oakDark: 0x4a3626,
  oakSilver: 0xa39a8a,
  timberBlack: 0x2e2a28,
  pine: 0xc79a62,
  larch: 0xb98f6a,
  cedar: 0xa9764f,
  shingle: 0x8d7355,
  weatherboard: 0xe9e4d6,
  // --- renders & plasters
  limewash: 0xf1ead8,
  plaster: 0xe8dcc0,
  ochreWash: 0xe2b86c,
  pinkWash: 0xe3b4a0,
  stucco: 0xeee6d2,
  pebbledash: 0xd6ccb4,
  whiteRender: 0xf4f1ea,
  // --- stone
  limestone: 0xd9cfb4,
  limestoneWarm: 0xdcc48e,
  bathStone: 0xe4cf9c,
  sandstone: 0xc9a377,
  sandstoneRed: 0xb5735a,
  gritstone: 0x8f8672,
  granite: 0x9a9a98,
  flint: 0x6f7378,
  rubble: 0xa89f8c,
  ragstone: 0xb9b4a0,
  marble: 0xeeeae2,
  portland: 0xe9e6dc,
  // --- Italian stones and plasters
  travertine: 0xe6dcc3,
  tufa: 0xb89f76,
  peperino: 0x8d8a80,
  pietraSerena: 0x8a9096,
  pietraForte: 0xb39a6b,
  marbleGreen: 0x3f5a4a,
  marbleRed: 0xa5524a,
  marbleYellow: 0xd9b25f,
  porphyry: 0x6e2f3a,
  intonacoOchre: 0xe3b25c,
  intonacoSienna: 0xc9773f,
  intonacoRose: 0xdc9f86,
  intonacoRed: 0xb4533c,
  intonacoCream: 0xf0dfb4,
  cotto: 0xb86a48,
  coppi: 0xc47a50,
  terracottaPainted: 0xb5402e,
  mudbrick: 0xc2a074,
  cypress: 0x2f4a36,
  olive: 0x8a9a72,
  // --- fired clay
  brickRed: 0xa9573f,
  brickOrange: 0xc0714a,
  brickDark: 0x7a3f33,
  brickYellow: 0xd2b574,
  brickBlue: 0x5a5f72,
  brickBuff: 0xcfb58f,
  romanTile: 0xc46f4a,
  tileRed: 0xb5593c,
  tileBrown: 0x8c5a40,
  terracotta: 0xc9744f,
  faience: 0xf2ead6,
  // --- roofing
  slate: 0x5b6470,
  slateBlue: 0x4f5d70,
  stoneSlate: 0x9a927c,
  lead: 0x8e969c,
  copperGreen: 0x7fb5a0,
  zinc: 0x9aa3a8,
  asphalt: 0x4a4a4c,
  // --- metal & glass
  iron: 0x3c4046,
  castIron: 0x2f3438,
  steel: 0x8a949c,
  aluminium: 0xc5ccd0,
  bronze: 0x7d6240,
  gold: 0xd9b04a,
  glass: 0x9ec4d4,
  glassDark: 0x34485a,
  glassGreen: 0x8fbfb0,
  windowDark: 0x2c3540,
  windowLit: 0xf2d98a,
  // --- concrete & modern
  concrete: 0xb9b6ae,
  concreteDark: 0x8e8b84,
  concreteWhite: 0xdedbd2,
  tarmac: 0x4b4d50,
  paving: 0xbcb5a4,
  cobble: 0x8f8a7e,
  cladWhite: 0xf0efea,
  cladGrey: 0x6f757b,
  cladRed: 0xb5443a,
  cladBlue: 0x3f6f9c,
  cladYellow: 0xe0b33c,
  cladGreen: 0x5c8f6a,
  solar: 0x1f2a44,
  // --- paint
  white: 0xf5f3ee,
  cream: 0xefe5c8,
  black: 0x262626,
  doorRed: 0x8f2f2a,
  doorGreen: 0x2f5a44,
  doorBlue: 0x2f466b,
  doorBlack: 0x24262a,
  doorYellow: 0xd8a93a,
  postRed: 0xc23b2e,
  // --- landscape
  grass: 0x8fae62,
  grassDry: 0xa8ad6c,
  meadow: 0x9dba68,
  hedge: 0x587a40,
  leaf: 0x6f9a4c,
  leafDark: 0x4d7340,
  leafAutumn: 0xb98f3c,
  bark: 0x6a5240,
  water: 0x6fa7b8,
  sand: 0xdccf9f,
  gravel: 0xb5ad9b,
  chalk: 0xf0eee4,
  soil: 0x6e5740,
  crop: 0xd4c06a,
} as const;

export type PaletteName = keyof typeof P;

const _c = new THREE.Color();
const _d = new THREE.Color();

/** Lighten (amount > 0) or darken (amount < 0) a colour. amount is roughly -1..1 lightness. */
export function tint(color: number, amount: number): number {
  _c.setHex(color, THREE.SRGBColorSpace).offsetHSL(0, 0, amount);
  return _c.getHex(THREE.SRGBColorSpace);
}

/** Blend two colours. t = 0 gives a, t = 1 gives b. */
export function mix(a: number, b: number, t: number): number {
  _c.setHex(a, THREE.SRGBColorSpace);
  _d.setHex(b, THREE.SRGBColorSpace);
  _c.lerp(_d, t);
  return _c.getHex(THREE.SRGBColorSpace);
}
