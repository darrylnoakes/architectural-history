import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { barrel, ground, hangingSign } from './shared';

// storey heights shared by every range so the galleries line up
const G = 3.2;
const F1 = 2.6;
const F2 = 2.5;
const TOP = G + F1 + F2; // 8.3
const PITCH = 1.19; // tan 50 degrees

const XO = 10.5; // outer face of the side ranges
const XI = 5.5; // yard face of the side ranges
const GAL = 1.2; // gallery depth
const ZF = 10.0; // street face, ground storey
const ZFI = 4.5; // yard face of the front range
const ZBI = -5.5; // yard face of the back range
const ZB = -10.5; // back wall
const AW = 3.4; // carriage arch width

/** Open gallery along a yard face: floor, posts, rail and balusters. `len` runs along local X; outward is local +Z. */
function gallery(b: Builder, len: number, y: number, h: number, timber: number) {
  b.box(len, 0.2, GAL, timber, { at: [0, y - 0.2, GAL / 2] });
  // curved brackets under the floor, every other post
  const posts = spread(Math.max(3, Math.round(len / 2.0) + 1), -len / 2 + 0.1, len / 2 - 0.1);
  posts.forEach((x, i) => {
    b.box(0.16, h, 0.16, timber, { at: [x, y, GAL - 0.1] });
    if (i % 2 === 0) b.box(0.12, 0.7, 0.12, timber, { at: [x, y - 0.75, 0.45], rot: [0.75, 0, 0] });
  });
  b.box(len, 0.12, 0.14, timber, { at: [0, y + 0.95, GAL - 0.1] });
  b.box(len, 0.1, 0.12, timber, { at: [0, y + 0.05, GAL - 0.1] });
  b.box(len, 0.18, 0.18, timber, { at: [0, y + h - 0.18, GAL - 0.1] });
  for (const x of spread(Math.round(len / 0.32), -len / 2 + 0.2, len / 2 - 0.2)) {
    b.box(0.06, 0.85, 0.06, tint(timber, 0.08), { at: [x, y + 0.1, GAL - 0.1], jitter: false });
  }
}

export const galleriedInn: BuildingDef = {
  id: 'galleried-inn',
  name: 'Galleried inn',
  style: 'Late medieval timber-framed',
  date: 'c. 1450',
  modelledOn: 'The New Inn, Gloucester (c. 1450), with the George Inn, Southwark, the last galleried inn in London',
  summary:
    'Pilgrims, merchants and carriers now travelled in numbers, and the alehouse gave way to a true inn with beds, stabling and meals, often built as an investment by a monastery or a wealthy townsman. ' +
    'Timber-framed ranges with close-set studs enclose a yard reached through a carriage arch from the street. ' +
    'The guest chambers open off galleries round the yard, so that each room had its own door without a corridor, and the yard itself doubled as a stage for travelling players.',
  materials: ['oak frame', 'wattle and daub', 'limewash', 'clay plain tiles'],
  lookFor: [
    { label: 'Open galleries', note: 'Two tiers of balconies give every chamber its own door, and later inspired the galleries of Shakespeare’s playhouses.', at: [-XI + GAL + 0.3, 6.4, -1] },
    { label: 'Carriage arch', note: 'A wide gateway through the street range, big enough for a loaded packhorse or wagon to reach the yard.', at: [0, 3.4, ZF + 0.3] },
    { label: 'Close studding', note: 'Oak studs set as close as their own width, a display of timber that showed the owner’s wealth.', at: [-6.5, 5.2, ZF + 0.8] },
    { label: 'Jetty', note: 'Each upper storey oversails the one below on the ends of the floor joists, gaining space over the street.', at: [6.5, G + 0.1, ZF + 0.6] },
    { label: 'Courtyard', note: 'Stables in the back range and chambers on three sides: the plan of the English inn for the next 400 years.', at: [1.5, 0.5, -1.5] },
  ],
  influences: ['perpendicular'],
  build(b) {
    const oak = b.pick([P.oak, tint(P.oak, -0.04), tint(P.oak, 0.04)]);
    const fill = b.pick([P.limewash, P.plaster, tint(P.ochreWash, 0.1)]);
    const tile = b.pick([P.tileRed, tint(P.tileRed, -0.05), P.tileBrown]);
    const yardX = XI - GAL;

    // cobbled yard and street pavement
    ground(b, 2 * XI, ZFI - ZBI, P.cobble, [0, (ZFI + ZBI) / 2]);
    ground(b, AW, ZF - ZFI, P.cobble, [0, (ZF + ZFI) / 2]);

    // ---------------- front (street) range: three storeys, jettied twice
    const z1 = ZF + 0.45; // first-floor face
    const z2 = z1 + 0.4; // second-floor face
    const fw = XO - AW / 2;
    b.sym((s) => {
      const xc = s * (AW / 2 + fw / 2);
      b.box(fw, G, ZF - ZFI, fill, { at: [xc, 0, (ZF + ZFI) / 2] });
      b.box(fw + 0.06, 0.3, ZF - ZFI + 0.06, P.rubble, { at: [xc, 0, (ZF + ZFI) / 2] });
      b.frame(fw, G - 0.3, oak, { at: [xc, 0.3, ZF], facing: '+z', studs: Math.round(fw / 0.5), rails: 1, beam: 0.16 });
      // ground floor: a mullioned window and a door in each half
      b.window(2.4, 1.2, { at: [s * 6.6, 1.2, ZF + 0.07], facing: '+z', frame: oak, bars: [5, 1], border: 0.1 });
      b.panel(1.0, 2.1, P.oakDark, { at: [s * 3.0, 0.3, ZF + 0.07], facing: '+z', shape: 'pointed', depth: 0.06 });
    });
    // arch: a timber gate frame with a four-centred head
    b.extrude(
      [[-AW / 2 - 0.3, 0], [-AW / 2, 0], [-AW / 2, 2.4], [-AW / 2 + 0.6, 2.85], [0, 3.0], [AW / 2 - 0.6, 2.85], [AW / 2, 2.4], [AW / 2, 0], [AW / 2 + 0.3, 0], [AW / 2 + 0.3, G], [-AW / 2 - 0.3, G]],
      0.35,
      oak,
      { at: [0, 0, ZF - 0.05] },
    );
    b.box(AW, 0.2, ZF - ZFI, tint(oak, -0.1), { at: [0, G - 0.2, (ZF + ZFI) / 2] });
    // upper storeys
    b.box(2 * XO, F1, z1 - ZFI, fill, { at: [0, G, (z1 + ZFI) / 2] });
    b.box(2 * XO, F2, z2 - ZFI, fill, { at: [0, G + F1, (z2 + ZFI) / 2] });
    // bressumers and joist ends at each jetty
    b.box(2 * XO + 0.1, 0.24, 0.25, oak, { at: [0, G - 0.04, z1 - 0.1] });
    b.box(2 * XO + 0.1, 0.24, 0.25, oak, { at: [0, G + F1 - 0.04, z2 - 0.1] });
    for (const x of spread(30, -XO + 0.2, XO - 0.2)) {
      b.box(0.12, 0.12, 0.5, tint(oak, -0.08), { at: [x, G - 0.15, ZF + 0.2], jitter: false });
    }
    b.frame(2 * XO, F1 - 0.24, oak, { at: [0, G + 0.2, z1], facing: '+z', studs: 40, rails: 1, beam: 0.15 });
    b.frame(2 * XO, F2 - 0.24, oak, { at: [0, G + F1 + 0.2, z2], facing: '+z', studs: 40, rails: 1, beam: 0.15 });
    for (const x of [-7.5, -3.8, 0, 3.8, 7.5]) {
      b.window(2.2, 1.1, { at: [x, G + 0.95, z1 + 0.07], facing: '+z', frame: oak, bars: [5, 2], border: 0.1 });
      b.window(1.8, 0.95, { at: [x, G + F1 + 0.9, z2 + 0.07], facing: '+z', frame: oak, bars: [4, 2], border: 0.1 });
    }
    // end walls of the street range
    b.sym((s) => {
      b.frame(ZF - ZFI, G - 0.3, oak, { at: [s * XO, 0.3, (ZF + ZFI) / 2], facing: s > 0 ? '+x' : '-x', studs: 5, rails: 1, brace: 'corner' });
      b.frame(z2 - ZFI, F1 + F2 - 0.2, oak, { at: [s * XO, G + 0.1, (z2 + ZFI) / 2], facing: s > 0 ? '+x' : '-x', studs: 5, rails: 2, brace: 'corner' });
    });
    // roof over the street range and its yard gallery
    const zf0 = ZFI - GAL;
    const fspan = z2 - zf0;
    const fRise = (fspan / 2) * PITCH;
    b.gable(2 * XO, fspan, fRise, tile, { at: [0, TOP, (z2 + zf0) / 2], overhang: 0.35, wall: fill });
    b.box(2 * XO + 0.7, 0.18, 0.3, tint(tile, -0.1), { at: [0, TOP + fRise + 0.05, (z2 + zf0) / 2] });
    // chimney stacks in brick, a newly fashionable luxury
    b.sym((s) => b.chimney(1.1, 3.0, 0.9, P.brickRed, { at: [s * 6, TOP + fRise - 1.6, (z2 + zf0) / 2 - 0.6], pots: 0 }));

    // the inn sign, hung over the street beside the gate
    hangingSign(b, [AW / 2 + 1.4, G + 1.0, z1 + 0.07], '+z', P.doorRed, { out: 1.6, picture: P.gold, bracket: P.oakDark, w: 1.1, h: 1.2 });

    // street-range yard face and its galleries
    b.frame(2 * XI, G - 0.3, oak, { at: [0, 0.3, ZFI], facing: '-z', studs: 12, rails: 1 });
    b.group({ at: [0, 0, ZFI], rotY: Math.PI }, () => {
      gallery(b, 2 * XI, G, F1, oak);
      gallery(b, 2 * XI, G + F1, F2, oak);
    });
    b.window(1.0, 1.0, { at: [-2.4, G + 1.0, ZFI - 0.01], facing: '-z', frame: oak, bars: [2, 2] });
    for (const x of [-3.8, 0.6, 3.8]) {
      b.panel(0.9, 2.0, P.oakDark, { at: [x, G, ZFI], facing: '-z' });
      b.panel(0.9, 1.95, P.oakDark, { at: [x, G + F1, ZFI], facing: '-z' });
    }

    // ---------------- side ranges: chambers on two galleried floors over parlours and kitchen
    const sLen = ZFI - ZBI;
    const sZ = (ZFI + ZBI) / 2;
    b.sym((s) => {
      const xc = s * (XI + XO) / 2;
      const out = s > 0 ? '+x' : '-x';
      const inn = s > 0 ? '-x' : '+x';
      b.box(XO - XI, TOP, sLen, fill, { at: [xc, 0, sZ] });
      b.box(XO - XI + 0.06, 0.3, sLen + 0.06, P.rubble, { at: [xc, 0, sZ] });
      // outer wall: square panels with corner braces, storey by storey
      for (const [y, h] of [[0.3, G - 0.3], [G, F1], [G + F1, F2]]) {
        b.frame(sLen, h, oak, { at: [s * XO, y, sZ], facing: out, studs: 7, rails: 1, brace: 'corner', beam: 0.17 });
        b.frame(sLen, h, oak, { at: [s * XI, y, sZ], facing: inn, studs: 9, rails: 1, beam: 0.15 });
      }
      for (const z of [-3, 0.4, 3]) {
        b.window(1.4, 1.0, { at: [s * XO, G + 0.9, z], facing: out, frame: oak, bars: [3, 2] });
        b.window(1.2, 0.9, { at: [s * XO, G + F1 + 0.85, z], facing: out, frame: oak, bars: [3, 2] });
      }
      // galleries on the yard face
      b.group({ at: [s * XI, 0, sZ], rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 }, () => {
        gallery(b, sLen, G, F1, oak);
        gallery(b, sLen, G + F1, F2, oak);
      });
      for (const z of spread(4, ZBI + 1.2, ZFI - 1.2)) {
        b.panel(0.9, 2.0, P.oakDark, { at: [s * XI, G, z], facing: inn });
        b.panel(0.9, 1.95, P.oakDark, { at: [s * XI, G + F1, z], facing: inn });
        b.panel(1.0, 2.1, P.oakDark, { at: [s * XI, 0.3, z + 0.9], facing: inn });
        b.window(1.2, 1.0, { at: [s * XI, 1.2, z - 0.7], facing: inn, frame: oak, bars: [3, 1] });
      }
      // roof over range and gallery, running into the street-range roof
      const span = XO - yardX;
      const rise = (span / 2) * PITCH;
      // ridge level is met by the street roof at this z, so the end is buried in it
      const zEnd = zf0 + (rise / fRise) * (fspan / 2) + 0.15;
      const len = zEnd - ZBI;
      b.gable(span, len, rise, tile, { at: [s * (XO + yardX) / 2, TOP, ZBI + len / 2], ridge: 'z', overhang: 0.3, wall: fill });
      // the gable end that shows above the stable roof
      b.frame(span - 0.4, 2.8, oak, { at: [s * (XO + yardX) / 2, TOP - 2.8, ZBI - 0.02], facing: '-z', studs: 6, rails: 1 });
      b.chimney(0.9, 2.6, 1.0, P.brickRed, { at: [s * (XO - 1.4), TOP + rise * 0.4, -1.0] });
    });

    // ---------------- back range: stables with a hayloft over
    const BH = G + 2.4;
    const bz = (ZB + ZBI) / 2;
    b.box(2 * XO, BH, ZBI - ZB, fill, { at: [0, 0, bz] });
    b.box(2 * XO + 0.06, 0.3, ZBI - ZB + 0.06, P.rubble, { at: [0, 0, bz] });
    b.frame(2 * XO, BH - 0.3, oak, { at: [0, 0.3, ZB], facing: '-z', studs: 16, rails: 1, brace: 'corner', beam: 0.17 });
    b.frame(2 * XI, BH - 0.3, oak, { at: [0, 0.3, ZBI], facing: '+z', studs: 12, rails: 1, beam: 0.17 });
    b.sym((s) => b.frame(ZBI - ZB, BH - 0.3, oak, { at: [s * XO, 0.3, bz], facing: s > 0 ? '+x' : '-x', studs: 3, rails: 1, brace: 'corner' }));
    for (const x of spread(4, -3.6, 3.6)) {
      b.panel(1.5, 2.4, tint(oak, 0.04), { at: [x, 0.3, ZBI + 0.06], facing: '+z' });
    }
    b.panel(1.4, 1.5, tint(oak, 0.04), { at: [0, G + 0.3, ZBI + 0.06], facing: '+z' });
    for (const x of [-6, -2, 2, 6]) b.panel(1.2, 0.6, P.windowDark, { at: [x, 1.6, ZB - 0.06], facing: '-z' });
    const bRise = ((ZBI - ZB) / 2) * PITCH * 0.95;
    b.gable(2 * XO, ZBI - ZB, bRise, tile, { at: [0, BH, bz], overhang: 0.3, wall: fill });

    // ---------------- yard: a stair up to the first gallery, a mounting block, barrels, a trough
    b.stairs(1.1, G, 3.6, 12, oak, { at: [-yardX + 0.65, 0, -2.6] });
    b.sym((s) => b.box(0.08, 1.0, 3.8, oak, { at: [-yardX + 0.65 + s * 0.55, 1.6, -2.6], rot: [-Math.atan2(G, 3.6), 0, 0] }));
    b.stairs(1.4, 0.75, 1.2, 3, P.rubble, { at: [3.0, 0, 2.6], rotY: Math.PI / 2 });
    barrel(b, [3.6, 0, -4.6]);
    barrel(b, [3.0, 0, -4.8], tint(P.oak, 0.05));
    b.box(2.2, 0.55, 0.6, P.oak, { at: [-1.0, 0, ZBI + 0.6] });

    // ---------------- colliders: the four ranges; the arch and yard stay open
    b.sym((s) => b.collider(fw, ZF - ZFI, { at: [s * (AW / 2 + fw / 2), 0, (ZF + ZFI) / 2] }));
    b.sym((s) => b.collider(XO - XI, sLen, { at: [s * (XI + XO) / 2, 0, sZ] }));
    b.collider(2 * XO, ZBI - ZB, { at: [0, 0, bz] });
  },
};
