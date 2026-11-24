import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { dormer, ground, lozengeRoof } from './shared';

const XO = 10.4;
const ZF = 9.6; // street face of the great hall
const ZH = 3.2; // its court face
const HH = 6.8; // its walls
const HR = 6.6; // its roof: very steep, as at Beaune
const XP = 4.4; // the hall ends here; the gate passage and porter's lodge beyond
const PW = 3.0; // gate passage width
// the courtyard wings: rooms behind two tiers of open galleries
const XG = 4.4; // gallery edge of the east wing
const XR = 6.2; // its rooms
const ZG = -4.4; // gallery edge of the back wing
const ZR = -6.2; // its rooms
const WG = 3.4; // ground storey
const WTOP = 6.4;
const WRISE = 4.6;

/** A pointed window with a stone mullion. */
function gothicWindow(b: Builder, x: number, y: number, z: number, facing: '+z' | '-z' | '+x' | '-x', w: number, h: number, stone: number): void {
  b.window(w, h, { at: [x, y, z], facing, frame: stone, glass: P.windowDark, shape: 'pointed', border: 0.1, bars: [2, 1] });
}

/** A courtyard wing, built along local X in a frame whose +Z side faces the court. */
function wing(b: Builder, len: number, stone: number, timber: number, plaster: number, tiles: number[], o: { dormers: number[]; noRoofEnd?: boolean }): void {
  const span = 6.0; // gallery 1.8 plus rooms 4.2
  const rz = -0.9; // centre of the rooms, local
  // rooms: stone below, plastered timber above
  b.box(len, WG, 4.2, stone, { at: [0, 0, rz - 0.0] });
  b.box(len, WTOP - WG, 4.2, plaster, { at: [0, WG, rz] });
  b.frame(len, WTOP - WG, timber, { at: [0, WG, rz + 2.1], facing: '+z', studs: Math.round(len / 1.4), rails: 1, beam: 0.15 });
  // ground-floor gallery: slender stone columns carrying a timber beam
  const gz = span / 2 - 0.15;
  const n = Math.max(2, Math.round(len / 3.0));
  for (const x of spread(n + 1, -len / 2 + 0.25, len / 2 - 0.25)) {
    b.cyl(0.16, WG - 0.35, stone, { at: [x, 0.15, gz], segs: 7 });
    b.box(0.42, 0.15, 0.42, stone, { at: [x, 0, gz] });
    b.box(0.4, 0.2, 0.4, stone, { at: [x, WG - 0.2, gz] });
    // upper gallery post with curved braces
    b.box(0.18, WTOP - WG, 0.18, timber, { at: [x, WG, gz] });
    b.sym((s) => b.beam([x, WTOP - 0.8, gz], [x + s * 0.6, WTOP - 0.15, gz], 0.1, 0.1, timber));
  }
  b.box(len, 0.3, 0.3, timber, { at: [0, WG, gz] });
  b.box(len, 0.2, 1.8, timber, { at: [0, WG - 0.05, rz + 2.1 + 0.9] });
  b.box(len, 0.22, 0.24, timber, { at: [0, WTOP - 0.2, gz] });
  // a boarded parapet on the upper gallery
  b.box(len, 0.85, 0.06, timber, { at: [0, WG + 0.3, gz + 0.1] });
  b.box(len, 0.08, 0.16, tint(timber, 0.08), { at: [0, WG + 1.15, gz + 0.1] });
  // doors and windows on the rooms behind the galleries
  for (const x of spread(n, -len / 2 + len / n / 2, len / 2 - len / n / 2)) {
    b.panel(0.9, 2.2, timber, { at: [x - 0.5, 0, rz + 2.1], facing: '+z', shape: 'pointed' });
    b.window(0.8, 1.2, { at: [x + 0.6, 1.0, rz + 2.1], facing: '+z', frame: stone, border: 0.08 });
    b.panel(0.9, 2.1, timber, { at: [x - 0.5, WG + 0.1, rz + 2.12], facing: '+z' });
    b.window(0.8, 1.1, { at: [x + 0.6, WG + 0.9, rz + 2.12], facing: '+z', frame: timber, border: 0.07 });
    b.window(0.6, 0.9, { at: [x, WG + 1.0, rz - 2.1], facing: '-z', frame: stone, border: 0.08 });
  }
  // the roof, swept down over the galleries, covered in glazed tiles in lozenges
  b.gable(len, span, WRISE, tiles[0], { at: [0, WTOP, 0], overhang: 0.4, thick: 0.14, wall: plaster });
  lozengeRoof(b, len, span, WRISE, tiles, { at: [0, WTOP, 0], overhang: 0.4, thick: 0.14, cell: 0.95, skipX: o.dormers.map((x) => [x - 0.9, x + 0.9] as [number, number]) });
  for (const x of o.dormers) {
    dormer(b, 1.3, 1.7, tiles[0], plaster, { at: [x, WTOP - 0.25, span / 2 - 0.1], facing: '+z', back: 1.8, rise: 1.4, frame: timber, finial: P.lead, bars: [2, 2] });
  }
  void o.noRoofEnd;
}

export const hotelDieu: BuildingDef = {
  id: 'hotel-dieu',
  name: 'Hôtel-Dieu (hospital for the poor)',
  style: 'Late Gothic, Burgundian',
  date: 'c. 1445',
  modelledOn:
    'The Hôtel-Dieu of Beaune, founded in 1443 by Nicolas Rolin, chancellor of the Duke of Burgundy, and his wife Guigone de Salins: the great hall with its chapel, the galleried court, the canopy at the door and the glazed roofs are taken from it, much reduced and fitted to this plot. The glazed roofs are Burgundian and would not have been seen in a town of the north',
  summary:
    'A different house altogether from the inn: the Hôtel-Dieu, “God’s house”, took in the sick poor, pilgrims and travellers without money for charity, not for payment, and stood on its own ground near the cathedral for centuries. This one is a rich layman’s foundation of the kind built after the miseries of the Hundred Years’ War, and it borrows its looks from the most famous of them, at Beaune in Burgundy. ' +
    'Its heart is one great hall of the poor: beds in curtained alcoves down both long walls, often two patients to a bed, facing a chapel at the far end so that the sick could follow Mass without rising. ' +
    'Round the court run two tiers of galleries, and the wings on the court are roofed in glazed tiles laid in coloured lozenges, as at Beaune, where the hall itself is slated. That patterned roof is a Burgundian fashion borrowed for this model: the hôtels-Dieu of Picardy and Champagne were roofed in slate or plain tile and looked much plainer. The tiles seen at Beaune today were largely relaid in the nineteenth and twentieth centuries; Beaune served as a hospital until 1971.',
  materials: ['limestone', 'oak framing and galleries', 'slate', 'glazed clay tiles', 'lead'],
  lookFor: [
    { label: 'Great hall of the poor', note: 'The Grande Salle des Pôvres: one long, lofty hall of curtained beds under a timber roof, its tie beams painted, open from end to end so air could move and nurses see every bed.', at: [-2.0, HH + 1.2, (ZF + ZH) / 2] },
    { label: 'Chapel at the end', note: 'The last bay of the hall is the chapel, behind an open screen, lit by the great window in the end wall: the sick lay within sight of the altar.', at: [-XO - 0.2, 4.6, (ZF + ZH) / 2] },
    { label: 'Glazed tile roof', note: 'Clay tiles glazed in yellow, green, red-brown and black, laid in interlocking lozenges: a costly display of the founder’s wealth.', at: [-3.0, WTOP + 2.4, ZG + 1.4] },
    { label: 'Galleries', note: 'Two tiers of open galleries on slender stone columns and oak posts run round the court, sheltering the doors of the wards and offices.', at: [XG - 0.2, WG + 0.8, -1.0] },
    { label: 'Canopy (auvent)', note: 'A pointed timber canopy roofed in slate, with pinnacles and finials, shelters the street door where the poor came to ask for a bed.', at: [XP + PW / 2 + 0.5, 5.6, ZF + 1.0] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, tint(P.pierreBlonde, -0.04)]);
    const timber = P.oakDark;
    const plaster = P.torchis;
    const slate = b.pick([P.ardoise, tint(P.ardoise, -0.03)]);
    const glazed = [0x8a3b24, 0xd8a83a, 0x3f6a44, 0x26292b];

    ground(b, 21.4, 1.0, P.cobble, [0, ZF + 0.5], 0.05);
    ground(b, XG + XO, ZH - ZG, tint(P.paving, -0.05), [(XG - XO) / 2, (ZH + ZG) / 2], 0.04);

    // ---------------- the street range: the great hall, the gate passage and the porter’s lodge
    const hz = (ZF + ZH) / 2;
    const hd = ZF - ZH;
    const hl = XP + XO;
    const hx = (XP - XO) / 2;
    const cut = b.cutaway;
    // walls; when cut away, the long walls of the hall stop at the tie beams so the beds can be seen
    b.box(hl, HH, 0.6, stone, { at: [hx, 0, ZF - 0.3] });
    b.box(hl, HH, 0.6, stone, { at: [hx, 0, ZH + 0.3] });
    b.box(0.7, HH, hd, stone, { at: [-XO + 0.35, 0, hz] });
    b.box(0.5, HH, hd, stone, { at: [XP + 0.25, 0, hz] });
    b.box(hl + 0.1, 0.5, hd + 0.1, tint(stone, -0.06), { at: [hx, 0, hz] });
    // a moulded cornice along the eaves of both long walls
    b.box(2 * XO + 0.1, 0.25, 0.8, tint(stone, 0.04), { at: [0, HH - 0.25, ZF - 0.3] });
    b.box(2 * XO + 0.1, 0.25, 0.8, tint(stone, 0.04), { at: [0, HH - 0.25, ZH + 0.3] });
    // the gate passage and the porter’s lodge, under the same roof
    const px = XP + PW / 2 + 0.5;
    b.box(XO - (XP + PW + 0.5), HH, hd, stone, { at: [(XO + XP + PW + 0.5) / 2, 0, hz] });
    b.box(PW, HH - 4.2, hd, stone, { at: [px, 4.2, hz] });
    b.box(PW, 0.06, hd, P.cobble, { at: [px, 0, hz], jitter: false });
    b.panel(PW - 0.4, 3.6, timber, { at: [px, 0, ZF - 1.2], facing: '+z', shape: 'pointed' });
    b.panel(0.05, 3.4, P.timberBlack, { at: [px, 0, ZF - 1.2], facing: '+z', depth: 0.09 });
    b.window(1.0, 1.4, { at: [8.9, 1.2, ZF], facing: '+z', frame: stone, bars: [2, 2], border: 0.1 });
    b.window(1.0, 1.4, { at: [8.9, 4.2, ZF], facing: '+z', frame: stone, bars: [2, 2], border: 0.1 });
    // tall pointed windows high in the hall walls; the great chapel window in the end wall
    for (const x of [-7.0, -3.6, -0.2, 3.0]) {
      gothicWindow(b, x, 3.2, ZF, '+z', 1.1, 3.0, stone);
      gothicWindow(b, x, 3.2, ZH, '-z', 1.1, 3.0, stone);
    }
    gothicWindow(b, -XO, 2.0, hz, '-x', 2.4, 4.4, stone);
    b.panel(0.9, 0.9, stone, { at: [-XO, 4.9, hz], facing: '-x', shape: 'circle', depth: 0.1 });
    gothicWindow(b, XO, 3.0, hz, '+x', 1.0, 2.0, stone);
    // buttresses on the street wall
    for (const x of [-8.8, -5.3, -1.9, 1.4]) b.box(0.6, 4.6, 0.5, stone, { at: [x, 0, ZF + 0.25] });

    // the steep slate roof, its small dormers on the street, the flèche
    const roofAt: [number, number, number] = [0, HH, hz];
    if (!cut) {
      b.gable(2 * XO, hd, HR, slate, { at: roofAt, overhang: 0.45, thick: 0.15, wall: stone });
      for (const x of [-7.4, -3.0, 1.4]) dormer(b, 1.0, 1.2, slate, stone, { at: [x, HH + 1.0, ZF - 0.6], facing: '+z', back: 1.6, rise: 0.9, frame: stone, finial: P.lead });
      for (const x of [-5.2, -0.8]) dormer(b, 1.0, 1.2, slate, stone, { at: [x, HH + 1.0, ZH + 0.6], facing: '-z', back: 1.6, rise: 0.9, frame: stone, finial: P.lead });
    } else {
      // the gable over the lodge end stays; the hall is open to the sky
      b.gable(XO - XP, hd, HR, slate, { at: [(XO + XP) / 2, HH, hz], overhang: 0.45, thick: 0.15, wall: stone });
    }
    // the flèche over the chapel end: a slender lead spire on a little open lantern
    const fx = -6.6;
    if (!cut) b.group({ at: [fx, HH + HR - 0.6, hz] }, () => {
      b.box(0.9, 1.4, 0.9, P.lead);
      b.lathe([[0.62, 0], [0.62, 0.15], [0.45, 0.4], [0.06, 3.6], [0.02, 4.2]], P.lead, { at: [0, 1.4, 0], segs: 8 });
      b.sym((s) => b.panel(0.4, 0.8, P.windowDark, { at: [0, 0.3, s * 0.45], facing: s > 0 ? '+z' : '-z' }));
      b.cyl(0.03, 0.8, P.gold, { at: [0, 5.6, 0], segs: 4 });
    });

    // inside the hall (seen when the roof is lifted): tie beams, the beds, the chapel screen and altar
    for (const x of spread(6, -XO + 1.4, XP - 1.0)) b.box(0.28, 0.32, hd - 0.6, timber, { at: [x, HH - 0.7, hz] });
    if (cut) {
      b.box(hl - 1.0, 0.06, hd - 1.2, P.tileRed, { at: [hx, 0.5, hz], jitter: false });
      for (const s of [1, -1] as const) {
        const z = hz + s * (hd / 2 - 1.3);
        for (const x of spread(6, -5.4, XP - 1.2)) {
          b.box(1.0, 0.62, 1.8, P.white, { at: [x, 0.5, z] });
          // the curtained alcove: a red tester and back, curtains drawn back at the foot
          b.box(1.3, 0.45, 2.1, P.doorRed, { at: [x, 2.5, z - s * 0.05] });
          b.box(1.3, 2.0, 0.08, P.doorRed, { at: [x, 0.5, z + s * 1.0] });
          b.box(0.1, 2.0, 0.5, tint(P.doorRed, -0.06), { at: [x + 0.6, 0.5, z - s * 0.8] });
        }
      }
      // the chapel screen across the hall, open in the middle, and the altar beyond
      b.sym((t) => b.box(0.2, 3.2, 1.8, timber, { at: [-6.6, 0.5, hz + t * 1.9] }));
      b.box(0.2, 0.8, hd - 1.2, timber, { at: [-6.6, 3.7, hz] });
      b.box(1.0, 1.1, 2.2, stone, { at: [-9.2, 0.5, hz] });
      b.box(0.2, 1.0, 1.6, P.gold, { at: [-9.6, 1.6, hz] });
    }

    // the canopy (auvent) over the street door: a pointed slate hood on brackets, with pinnacles
    b.group({ at: [px, 4.1, ZF] }, () => {
      b.sym((s) => b.beam([s * 1.6, -0.6, 0.05], [s * 1.6, 0.05, 1.2], 0.18, 0.18, timber));
      b.box(3.6, 0.2, 1.4, timber, { at: [0, 0, 0.7] });
      b.extrude([[-1.9, 0], [1.9, 0], [0, 2.6]], 1.5, slate, { at: [0, 0.2, 0.75] });
      b.extrude([[-1.6, 0], [1.6, 0], [0, 2.2]], 0.1, timber, { at: [0, 0.2, 1.51] });
      for (const x of [-1.9, 0, 1.9]) {
        const y = x === 0 ? 2.8 : 0.2;
        b.cyl(0.06, x === 0 ? 1.4 : 1.1, P.lead, { at: [x, y, 1.5], segs: 4 });
        b.cone(0.14, 0.5, P.lead, { at: [x, y + (x === 0 ? 1.4 : 1.1), 1.5], segs: 4 });
      }
    });

    // ---------------- the courtyard wings with their galleries and glazed roofs
    const ex = (XG + XO) / 2;
    const elen = ZH - ZG;
    b.group({ at: [ex, 0, (ZH + ZG) / 2], rotY: -Math.PI / 2 }, () => {
      wing(b, elen, stone, timber, plaster, glazed, { dormers: [-1.6, 2.0] });
    });
    // its outer face on the side street: small windows
    for (const z of [-2.6, 0.6]) b.window(0.7, 1.1, { at: [XO, 1.2, z], facing: '+x', frame: stone, border: 0.08 });
    const bz = (ZG + (-XO)) / 2;
    b.group({ at: [0, 0, bz] }, () => {
      wing(b, 2 * XO, stone, timber, plaster, glazed, { dormers: [-7.2, -3.0, 1.2, 5.4] });
    });
    // the well in the court, under a wrought-iron crown
    b.group({ at: [-3.4, 0, -0.4] }, () => {
      b.cyl(0.85, 0.9, stone, { segs: 8 });
      b.cyl(0.7, 0.05, P.windowDark, { at: [0, 0.88, 0], segs: 8 });
      b.sym((s) => b.box(0.08, 1.9, 0.08, P.iron, { at: [s * 0.75, 0.9, 0] }));
      b.sym((s) => b.beam([s * 0.75, 2.8, 0], [0, 3.3, 0], 0.06, 0.06, P.iron));
      b.box(0.04, 0.6, 0.04, P.iron, { at: [0, 2.7, 0] });
      b.cone(0.12, 0.3, P.iron, { at: [0, 3.3, 0], segs: 4 });
    });
    // the west side of the court: a wall with a garden door
    b.box(0.6, 3.6, ZH - ZG, stone, { at: [-XO + 0.3, 0, (ZH + ZG) / 2] });
    b.box(0.8, 0.14, ZH - ZG, slate, { at: [-XO + 0.3, 3.6, (ZH + ZG) / 2] });
    b.panel(1.0, 2.2, timber, { at: [-XO + 0.6, 0, -0.6], facing: '+x', shape: 'pointed' });

    // ---------------- colliders: one per range; the gate passage and the court stay open
    b.collider(XP + 0.5 + XO, hd, { at: [(XP + 0.5 - XO) / 2, 0, hz] });
    b.collider(XO - (XP + PW + 0.5), hd, { at: [(XO + XP + PW + 0.5) / 2, 0, hz] });
    b.collider(XO - XR + 0.1, elen, { at: [(XR + XO) / 2, 0, (ZH + ZG) / 2] });
    b.collider(2 * XO, ZR + XO, { at: [0, 0, (-XO + ZR) / 2] });
    b.collider(0.6, ZH - ZG, { at: [-XO + 0.3, 0, (ZH + ZG) / 2] });
  },
};
