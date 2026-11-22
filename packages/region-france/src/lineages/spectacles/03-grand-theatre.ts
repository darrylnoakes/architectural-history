import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { balustrade, band, statue, strip, type Pt } from './shared';

// Plan (front at +Z): steps and portico, stair hall, auditorium, stage house.
const HW = 12; // half width
const WALL_T = 0.6;
const PLINTH = 0.6; // floor level of the portico and the ground floor
const COL_Z = 15.0; // column centres
const FRONT = 11.0; // the wall behind the portico
const AUD_Z0 = -6.6; // proscenium wall
const STAIR_Z0 = 4.0; // wall between the stair hall and the auditorium
const BACK = -16.0;
const CORNICE = 11.0; // top of the entablature
const STAGE_TOP = 16.2;
const SX = HW - 0.9; // half width of the stage house

// Horseshoe of boxes: an arc of radius HR round (0, HC), its straight sides running to the proscenium.
const HR = 4.6;
const HC = -2.0;
const HZ_END = -6.2;
const BOX_D = 1.3;
const TIERS = [2.6, 4.7, 6.8, 8.9];

function horseshoe(off: number, segs = 10): Pt[] {
  const R = HR + off;
  const pts: Pt[] = [[R, HZ_END]];
  for (let i = 0; i <= segs; i++) {
    const t = Math.PI / 2 - (i / segs) * Math.PI;
    pts.push([R * Math.sin(t), HC + R * Math.cos(t)]);
  }
  pts.push([-R, HZ_END]);
  return pts;
}

export const grandTheatre: BuildingDef = {
  id: 'grand-theatre',
  name: 'Grand Théâtre',
  style: 'Neoclassical (Louis XVI)',
  date: '1780',
  summary:
    'The plays have long left the tennis court, and the town, rich on trade and run by a royal intendant, builds a theatre as a public monument standing free on its own square. ' +
    'The front is a temple portico of giant Corinthian columns across its whole width, crowned by statues of the Muses; behind it a grand staircase rises in a hall of its own, for going to the theatre is now a social parade. ' +
    'The hall is no longer a long box but a horseshoe of boxes in tiers, so that everyone can see the stage, and each other. ' +
    'Select it to see inside: the roofs over the stair hall and the auditorium lift off.',
  materials: ['cut limestone', 'slate roofs', 'timber boxes and stage', 'gilded and painted plaster', 'red velvet'],
  modelledOn:
    'The Grand Théâtre, Bordeaux, by Victor Louis (1773 to 1780; opened 7 April 1780), reduced to about half its size: the portico of twelve columns with twelve statues on the balustrade, the staircase hall and the columned horseshoe are taken from it. ' +
    'Amiens had its own theatre of 1778 to 1780, with a much smaller front.',
  influences: ['neoclassicism'],
  lookFor: [
    {
      label: 'Giant portico',
      note: 'Twelve Corinthian columns, rising through two storeys, run across the whole front: the theatre presents itself as a temple of the arts.',
      at: [-5, 5.0, COL_Z + 0.5],
    },
    {
      label: 'Statues on the balustrade',
      note: 'At Bordeaux they are the nine Muses with Juno, Venus and Minerva, one over each column.',
      at: [3, CORNICE + 2.4, COL_Z],
    },
    {
      label: 'Grand staircase',
      note: 'One broad flight rises to a landing and splits into two that turn back up to the first floor, under a gallery of columns. At Bordeaux it inspired Garnier’s stair at the Paris Opéra.',
      at: [0, 3.0, 7.5],
    },
    {
      label: 'Horseshoe of boxes',
      note: 'Tiers of boxes round a horseshoe-shaped hall, with giant columns rising in front of them to carry the ceiling. The cheapest seats were at the top, and the standing pit (parterre) below.',
      at: [-5.6, 5.5, 0.6],
    },
    {
      label: 'Stage house',
      note: 'The tall block behind the proscenium holds the stage, the flying machinery and the painted scenery.',
      at: [HW - 0.6, 14.0, -10.5],
    },
  ],
  build(b) {
    const cutaway = b.cutaway;
    const stone = tint(P.pierreBlonde, b.range(-0.03, 0.01));
    const stoneDk = tint(stone, -0.07);
    const roof = tint(P.ardoise, b.range(-0.02, 0.03));
    const red = tint(P.doorRed, 0.08);
    const gold = tint(P.gold, -0.05);
    const ivory = tint(P.cream, 0.03);
    const oak = P.oak;
    const boxDark = mix(mix(P.doorRed, P.black, 0.4), P.cream, 0.25);
    const frontD = FRONT - BACK;

    // ------------------------------------------------ the shell: walls (hollow where the inside is shown)
    const zMid = (FRONT + BACK) / 2;
    b.sym((s) => b.box(WALL_T, CORNICE, frontD, stone, { at: [s * (HW - WALL_T / 2), 0, zMid] }));
    b.box(HW * 2, CORNICE, WALL_T, stone, { at: [0, 0, FRONT - WALL_T / 2] });
    b.box(HW * 2, CORNICE, WALL_T, stone, { at: [0, 0, BACK + WALL_T / 2] });
    b.box(HW * 2 - 2 * WALL_T, 11, WALL_T, stone, { at: [0, 0, AUD_Z0 - WALL_T / 2] });
    b.box(HW * 2 - 2 * WALL_T, CORNICE, 0.4, tint(stone, -0.03), { at: [0, 0, STAIR_Z0] });
    b.box(HW * 2 - 2 * WALL_T, PLINTH, frontD - 2 * WALL_T, stoneDk, { at: [0, 0, zMid] }); // ground floor
    // plinth, main cornice and balustrade all round
    b.box(HW * 2 + 0.2, PLINTH, frontD + 0.2, stoneDk, { at: [0, 0, zMid] });
    const corn = (y: number, h: number, p: number) => {
      b.box(HW * 2 + 2 * p, h, 0.5 + p, stoneDk, { at: [0, y, BACK + (0.5 + p) / 2 - p] });
      b.box(HW * 2 + 2 * p, h, 0.5 + p, stoneDk, { at: [0, y, FRONT - (0.5 + p) / 2 + p] });
      b.sym((s) => b.box(0.5 + p, h, frontD, stoneDk, { at: [s * (HW + p - (0.5 + p) / 2), y, zMid] }));
    };
    corn(CORNICE - 1.2, 0.5, 0.1);
    corn(CORNICE - 0.4, 0.4, 0.25);
    b.sym((s) => balustrade(b, [s * (HW - 0.1), BACK + 0.2], [s * (HW - 0.1), FRONT - 0.2], CORNICE, stone, 1.0, 2.0));
    balustrade(b, [-HW + 0.2, BACK + 0.1], [HW - 0.2, BACK + 0.1], CORNICE, stone, 1.0, 2.0);
    // giant pilasters, arched ground windows and square upper windows down the sides and back
    const bays = 7;
    const bayD = frontD / bays;
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      for (let i = 0; i <= bays; i++) {
        const z = BACK + i * bayD;
        b.panel(0.7, CORNICE - 1.2 - PLINTH, tint(stone, 0.03), { at: [s * HW, PLINTH, z], facing: f, depth: 0.16 });
      }
      for (let i = 0; i < bays; i++) {
        const z = BACK + (i + 0.5) * bayD;
        b.panel(1.5, 3.5, P.windowDark, { at: [s * HW, PLINTH + 0.5, z], facing: f, shape: 'round', depth: 0.04 });
        b.panel(0.4, 0.5, stone, { at: [s * HW, PLINTH + 3.7, z], facing: f, depth: 0.12 }); // keystone
        b.window(1.4, 2.0, { at: [s * HW, 6.0, z], facing: f, frame: stone });
        b.panel(1.7, 0.18, stoneDk, { at: [s * HW, 8.0, z], facing: f, depth: 0.14 });
      }
    });
    for (let i = 0; i <= 7; i++) {
      b.panel(0.7, CORNICE - 1.2 - PLINTH, tint(stone, 0.03), { at: [-HW + i * ((HW * 2) / 7), PLINTH, BACK], facing: '-z', depth: 0.16 });
    }
    for (let i = 0; i < 7; i++) {
      const x = -HW + (i + 0.5) * ((HW * 2) / 7);
      if (i === 3) b.panel(3.0, 4.2, oak, { at: [x, PLINTH, BACK], facing: '-z' }); // scenery door
      else b.window(1.3, 3.0, { at: [x, PLINTH + 0.6, BACK], facing: '-z', frame: stone });
      b.window(1.2, 1.9, { at: [x, 6.1, BACK], facing: '-z', frame: stone });
    }

    // ------------------------------------------------ the stage house rising behind the balustrade
    const sd = AUD_Z0 - BACK;
    const sz = (AUD_Z0 + BACK) / 2;
    b.box(SX * 2, STAGE_TOP - CORNICE, sd, stone, { at: [0, CORNICE, sz] });
    b.box(SX * 2 + 0.4, 0.4, sd + 0.4, stoneDk, { at: [0, STAGE_TOP - 0.4, sz] });
    b.hip(SX * 2 + 0.4, sd + 0.4, 2.6, roof, { at: [0, STAGE_TOP, sz] });
    b.sym((s) => {
      for (const z of [-14, -11.3, -8.6]) b.window(1.0, 1.6, { at: [s * SX, 13.0, z], facing: s > 0 ? '+x' : '-x', frame: stone });
    });
    b.window(2.2, 1.6, { at: [0, 13.0, AUD_Z0], frame: stone, shape: 'segmental', bars: [3, 2] });
    // the stage, behind the curtain
    b.box(SX * 2, 1.6, sd - 0.6, tint(oak, -0.05), { at: [0, 0, sz] });

    // ------------------------------------------------ the portico: steps, twelve columns, entablature, statues
    const pd = COL_Z + 0.6 - FRONT;
    b.stairs(HW * 2 + 0.6, PLINTH, 2.0, 3, stoneDk, { at: [0, 0, COL_Z + 0.6 + 1.0] });
    b.box(HW * 2 + 0.2, PLINTH, pd, stoneDk, { at: [0, 0, FRONT + pd / 2] });
    for (let i = 0; i < 12; i++) {
      const x = -11 + i * 2;
      b.box(0.95, 0.35, 0.95, stone, { at: [x, PLINTH, COL_Z] });
      b.column(0.38, CORNICE - 1.6 - PLINTH - 0.35, stone, { at: [x, PLINTH + 0.35, COL_Z], order: 'corinthian', segs: 8 });
    }
    // entablature: architrave, frieze and cornice, returning over the portico
    b.box(HW * 2 + 0.2, 1.2, pd, stone, { at: [0, CORNICE - 1.6, FRONT + pd / 2] });
    b.box(HW * 2 + 0.5, 0.4, pd + 0.4, stoneDk, { at: [0, CORNICE - 0.4, FRONT + pd / 2 + 0.1] });
    b.panel(HW * 2 + 0.2, 0.12, stoneDk, { at: [0, CORNICE - 1.15, FRONT + pd], depth: 0.04 });
    balustrade(b, [-HW + 0.1, COL_Z + 0.35], [HW - 0.1, COL_Z + 0.35], CORNICE, stone, 1.0, 0.75);
    b.sym((s) => balustrade(b, [s * (HW - 0.1), FRONT], [s * (HW - 0.1), COL_Z + 0.35], CORNICE, stone, 1.0, 0.8));
    for (let i = 0; i < 12; i++) {
      const x = -11 + i * 2;
      b.box(0.7, 1.0, 0.7, stone, { at: [x, CORNICE, COL_Z + 0.35] });
      statue(b, [x, CORNICE + 1.0, COL_Z + 0.35], 2.3, tint(stone, 0.06));
    }
    // the portico ceiling and the front wall behind: doors below, windows above
    b.box(HW * 2, 0.2, pd, tint(stone, -0.1), { at: [0, CORNICE - 1.8, FRONT + pd / 2] });
    for (let i = 0; i < 5; i++) {
      const x = -8 + i * 4;
      b.panel(1.7, 3.4, i === 2 ? P.doorBlack : tint(P.doorBlack, 0.06), { at: [x, PLINTH, FRONT], shape: 'round' });
      b.panel(2.2, 0.2, stoneDk, { at: [x, PLINTH + 3.6, FRONT], depth: 0.12 });
      b.window(1.4, 2.2, { at: [x, 5.6, FRONT], frame: stone, bars: [2, 2] });
    }

    // ------------------------------------------------ the stair hall
    const hallW = HW * 2 - 2 * WALL_T;
    // the central flight, the landing against the auditorium wall, and the two returning flights
    b.stairs(4.2, 2.6, 3.6, 9, stone, { at: [0, PLINTH, 8.0] });
    b.box(hallW - 2, 2.6, 2.0, stone, { at: [0, PLINTH, STAIR_Z0 + 0.2 + 1.0] });
    b.sym((s) => {
      b.stairs(2.4, 3.0, 4.4, 10, stone, { at: [s * 4.6, PLINTH + 2.6, 7.4], rotY: Math.PI });
    });
    // the first-floor gallery round three sides, carried on columns
    const gy = PLINTH + 5.6;
    b.box(hallW, 0.35, 1.6, stone, { at: [0, gy - 0.35, FRONT - WALL_T - 0.8] });
    b.sym((s) => {
      b.box(2.2, 0.35, FRONT - STAIR_Z0 - 2.6, stone, { at: [s * (hallW / 2 - 1.1), gy - 0.35, (FRONT + STAIR_Z0) / 2 - 0.4] });
      for (const z of [6.0, FRONT - WALL_T - 1.6]) b.column(0.24, gy - 0.35 - PLINTH, stone, { at: [s * (hallW / 2 - 2.2), PLINTH, z], order: 'tuscan', segs: 6 });
      balustrade(b, [s * (hallW / 2 - 2.2), STAIR_Z0 + 2.4], [s * (hallW / 2 - 2.2), FRONT - WALL_T - 1.6], gy, stone, 0.9, 0.7);
      // upper columns round the well, carrying the ceiling
      for (const z of [6.0, FRONT - WALL_T - 1.6]) b.column(0.2, CORNICE - 1.3 - gy, stone, { at: [s * (hallW / 2 - 2.2), gy, z], order: 'tuscan', segs: 6 });
    });
    b.box(hallW, 0.1, FRONT - STAIR_Z0 - 0.6, tint(P.marble, -0.05), { at: [0, PLINTH, (FRONT + STAIR_Z0) / 2] }); // marble floor
    b.panel(2.4, 3.4, P.doorBlack, { at: [0, gy, STAIR_Z0 + 0.2], shape: 'round' }); // into the boxes
    b.sym((s) => b.panel(1.4, 2.6, P.doorBlack, { at: [s * 3.0, PLINTH + 2.6, STAIR_Z0 + 0.2], shape: 'round' }));

    // ------------------------------------------------ the auditorium: proscenium, parterre, the horseshoe
    const ad = STAIR_Z0 - AUD_Z0;
    b.box(hallW, 0.4, ad, tint(oak, -0.05), { at: [0, PLINTH, (AUD_Z0 + STAIR_Z0) / 2] });
    for (let r = 0; r < 5; r++) b.box(5.6, 0.45, 0.5, red, { at: [0, PLINTH + 0.4, -4.4 + r * 1.0] });
    b.panel(10.6, 8.6, gold, { at: [0, PLINTH + 0.6, AUD_Z0], depth: 0.06 }); // proscenium frame
    b.panel(9.4, 7.6, red, { at: [0, PLINTH + 1.0, AUD_Z0], depth: 0.09 }); // curtain
    b.panel(3.2, 1.2, gold, { at: [0, PLINTH + 8.9, AUD_Z0], shape: 'segmental', depth: 0.08 }); // the arms over the stage
    b.box(9.6, 1.6, 0.8, oak, { at: [0, 0, AUD_Z0 + 0.4] }); // forestage
    const front = horseshoe(0);
    const backL = horseshoe(BOX_D);
    TIERS.forEach((y, i) => {
      band(b, front, backL, y, tint(oak, -0.08));
      strip(b, front.map(([x, z]) => [x, z, y, y + 0.95] as [number, number, number, number]), ivory);
      strip(b, front.map(([x, z]) => [x, z, y + 0.82, y + 0.95] as [number, number, number, number]), gold);
      strip(b, backL.map(([x, z]) => [x, z, y, y + 2.1] as [number, number, number, number]), boxDark);
      if (i < 3) {
        for (let k = 1; k < front.length - 1; k += 2) {
          b.beam([front[k][0], y + 1.05, front[k][1]], [backL[k][0], y + 1.05, backL[k][1]], 0.1, 2.1, tint(ivory, -0.1));
        }
      }
    });
    // twelve giant columns in front of the boxes, carrying the ceiling
    for (let k = 0; k < 12; k++) {
      const t = Math.PI / 2 + 0.12 - (k / 11) * (Math.PI + 0.24);
      const R = HR - 0.15;
      const p: [number, number, number] = [R * Math.sin(t), TIERS[0], HC + R * Math.cos(t)];
      b.cyl(0.2, CORNICE - 1.6 - TIERS[0], ivory, { at: p, segs: 6, jitter: false });
      b.cyl(0.2, 0.4, gold, { at: [p[0], CORNICE - 1.6, p[2]], rTop: 0.32, segs: 6, jitter: false });
    }

    // ------------------------------------------------ roofs over the foyer and auditorium: whole in the town, lifted off when selected
    const rd = FRONT - AUD_Z0;
    if (cutaway) {
      // the main beams the roof sat on
      for (const z of [AUD_Z0 + 0.4, STAIR_Z0, FRONT - 0.4]) b.box(hallW, 0.35, 0.35, oak, { at: [0, CORNICE - 0.4, z] });
    } else {
      b.box(hallW, 0.3, rd, tint(stone, -0.12), { at: [0, CORNICE - 0.45, (FRONT + AUD_Z0) / 2] });
      b.hip(hallW - 0.6, rd - 0.6, 3.2, roof, { at: [0, CORNICE - 0.15, (FRONT + AUD_Z0) / 2] });
    }

    // ------------------------------------------------ walk collisions and the raised portico floor
    b.collider(HW * 2, frontD, { at: [0, 0, zMid] });
    for (let i = 0; i < 12; i++) b.collider(0.95, 0.95, { at: [-11 + i * 2, 0, COL_Z] });
    b.deck(HW * 2, COL_Z + 2.6 - FRONT, PLINTH, { at: [0, 0, (COL_Z + 2.6 + FRONT) / 2] });
  },
};
