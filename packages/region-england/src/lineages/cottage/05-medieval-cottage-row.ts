import { P, tint, type BuildingDef } from '@ah/kit';
import { bar, paling } from './shared';

const UW = 4.5; // one dwelling per bay
const GF = 2.45; // ground storey
const UF = 2.2; // upper storey
const ZF = 2.7; // ground-floor front wall
const DG = 4.8; // ground-floor depth
const JETTY = 0.5;

export const medievalCottageRow: BuildingDef = {
  id: 'medieval-cottage-row',
  name: 'Row of rented cottages',
  style: 'Gothic-period timber framing',
  date: 'c. 1350',
  summary:
    'Town landlords, often a church or a guild, built rows of identical small houses to let: each bay of the frame is one home, with a single room downstairs and one above. ' +
    'The oak frame was made in the carpenter’s yard, numbered, and raised on a low stone sill wall, with the panels filled with wattle and daub. ' +
    'The upper floor is jettied out over the street, gaining a little floor space and showing off the joist ends. ' +
    'This is the first time the plot is built as a single block of standard dwellings for rent rather than homes built by those who lived in them.',
  materials: ['oak frame', 'wattle and daub', 'clay plain tile', 'stone sill wall'],
  modelledOn: 'Lady Row, Goodramgate, York (1316), and the rows of Spon Street, Coventry',
  lookFor: [
    { label: 'Jetty', note: 'The upper storey oversails the lower one on the ends of the floor joists.', at: [0, 2.55, 3.3] },
    { label: 'Bressumer', note: 'The heavy beam along the front of the jetty that carries the upper wall.', at: [-4.5, 2.75, 3.35] },
    { label: 'Braced timber frame', note: 'Posts, rails and diagonal braces of oak, pegged together. The frame carries the weight; the panels just fill the gaps.', at: [-9.2, 4.2, 3.4] },
    { label: 'Wattle-and-daub panels', note: 'Woven staves plastered with clay and limewashed, filling the spaces between the timbers.', at: [4.0, 1.5, 2.85] },
    { label: 'One home to each bay', note: 'Every bay of the frame is a separate dwelling with its own door: one room down, one room up.', at: [9.0, 1.2, 2.9] },
  ],
  influences: [],
  build(b) {
    const n = b.variant === 0 ? 5 : b.pick([4, 5, 5]);
    const L = n * UW;
    const infill = b.pick([P.limewash, P.limewash, P.ochreWash, P.plaster]);
    const oak = b.pick([P.oak, P.oakDark, tint(P.oak, -0.05)]);
    const thatched = b.variant !== 0 && b.chance(0.3);
    const roofCol = thatched ? P.thatchOld : b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.05)]);
    const zb = ZF - DG; // back wall
    const zu = ZF + JETTY; // upper front wall
    const du = zu - zb;
    const zcu = (zu + zb) / 2;

    // stone sill wall, ground storey, jettied upper storey
    b.box(L + 0.1, 0.35, DG + 0.1, P.rubble, { at: [0, 0, ZF - DG / 2] });
    b.box(L, GF - 0.35, DG, infill, { at: [0, 0.35, ZF - DG / 2] });
    b.box(L, 0.18, du, oak, { at: [0, GF, zcu] }); // floor frame
    b.box(L, UF, du, infill, { at: [0, GF + 0.18, zcu] });
    const top = GF + 0.18 + UF;

    // joist ends under the jetty and the bressumer on them
    for (let x = -L / 2 + 0.25; x < L / 2; x += 0.45) b.box(0.13, 0.15, JETTY + 0.05, oak, { at: [x, GF - 0.12, ZF + JETTY / 2] });
    b.box(L + 0.06, 0.24, 0.24, oak, { at: [0, GF - 0.02, zu - 0.05] });

    // roof: steep plain tile (or thatch), ridge parallel to the street, no chimneys
    const rh = (du / 2) * Math.tan((50 * Math.PI) / 180);
    b.gable(L, du, rh, roofCol, { at: [0, top, zcu], overhang: thatched ? 0.45 : 0.3, thick: thatched ? 0.4 : 0.15, wall: infill });

    for (let i = 0; i < n; i++) {
      const x = -L / 2 + UW * (i + 0.5);
      const doorLeft = i % 2 === 0;
      const dx = x + (doorLeft ? -1 : 1) * 1.15;
      const wx = x + (doorLeft ? 1 : -1) * 0.75;
      // ground floor front: bay posts, door posts, sill and mid rail either side of the door
      for (const px of [x - UW / 2 + 0.1, x + UW / 2 - 0.1, dx - 0.55, dx + 0.55]) b.box(0.18, GF - 0.35, 0.1, oak, { at: [px, 0.35, ZF] });
      b.box(UW, 0.16, 0.1, oak, { at: [x, 0.35, ZF] });
      const solidL = doorLeft ? dx + 0.55 : x - UW / 2;
      const solidR = doorLeft ? x + UW / 2 : dx - 0.55;
      b.box(solidR - solidL, 0.14, 0.1, oak, { at: [(solidL + solidR) / 2, 0.95, ZF] });
      b.box(0.12, GF - 1.1, 0.1, oak, { at: [wx + (doorLeft ? 0.75 : -0.75), 1.1, ZF] });
      b.panel(0.9, 1.9, b.pick([P.oak, P.oakDark, P.oakSilver]), { at: [dx, 0.4, ZF], facing: '+z', depth: 0.08 });
      // window with diamond-set mullions, unglazed, and a shutter hung below
      b.window(1.1, 0.75, { at: [wx, 1.25, ZF + 0.02], facing: '+z', frame: oak, glass: P.timberBlack, bars: [4, 1] });
      b.box(1.1, 0.4, 0.05, tint(oak, 0.08), { at: [wx, 0.8, ZF + 0.12] });

      // upper floor: braced frame with a mid rail and a small window in the middle bay
      b.frame(UW, UF, oak, { at: [x, GF + 0.18, zu], facing: '+z', studs: 4, rails: 1, brace: 'corner', beam: 0.15 });
      b.window(0.66, 0.72, { at: [x, GF + 0.18 + 1.2, zu + 0.02], facing: '+z', frame: oak, glass: P.timberBlack, bars: [3, 1] });

      // back: plainer frame, back door and a small window
      b.frame(UW, UF, oak, { at: [x, GF + 0.18, zb], facing: '-z', studs: 2, rails: 1, beam: 0.15 });
      b.frame(UW, GF - 0.35, oak, { at: [x, 0.35, zb], facing: '-z', studs: 0, rails: 0, beam: 0.16 });
      b.panel(0.85, 1.85, P.oakDark, { at: [x + (doorLeft ? 1 : -1) * 1.0, 0.38, zb], facing: '-z', depth: 0.08 });
      b.window(0.7, 0.6, { at: [x - (doorLeft ? 1 : -1) * 0.8, 1.3, zb - 0.02], facing: '-z', frame: oak, glass: P.timberBlack, bars: [3, 1] });

      // garden strip behind, fenced off from the neighbours
      if (i > 0) paling(b, [x - UW / 2, zb - 0.3], [x - UW / 2, -6.8], { h: 1.0, color: P.oakSilver });
      b.box(0.9, 0.04, zb + 6.8 - 0.1, P.gravel, { at: [x + (doorLeft ? 1 : -1) * 1.0, 0, (zb - 0.1 - 6.8) / 2] });
      for (let k = 0; k < 3; k++) b.box(1.8, 0.2, 0.45, b.pick([P.leaf, P.leafDark, P.soil]), { at: [x + (doorLeft ? 0.8 : -0.8), 0, zb - 1.4 - k * 1.1] });
    }
    paling(b, [-L / 2, -6.8], [L / 2, -6.8], { h: 1.1, color: P.oakSilver });

    // end walls (gables): frame on both storeys
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      b.frame(DG, GF - 0.35, oak, { at: [(s * L) / 2, 0.35, ZF - DG / 2], facing: f, studs: 2, rails: 1, beam: 0.16 });
      b.frame(du, UF, oak, { at: [(s * L) / 2, GF + 0.18, zcu], facing: f, studs: 3, rails: 1, brace: 'corner', beam: 0.15 });
      // collar and king strut showing in the gable triangle
      bar(b, [(s * L) / 2 + s * 0.06, top, zb + 0.1], [(s * L) / 2 + s * 0.06, top + rh - 0.1, zcu], 0.14, oak);
      bar(b, [(s * L) / 2 + s * 0.06, top, zu - 0.1], [(s * L) / 2 + s * 0.06, top + rh - 0.1, zcu], 0.14, oak);
      b.box(0.1, rh * 0.95, 0.14, oak, { at: [(s * L) / 2 + s * 0.06, top, zcu] });
    });
  },
};
