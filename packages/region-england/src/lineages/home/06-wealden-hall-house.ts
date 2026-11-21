import { P, tint, type BuildingDef } from '@ah/kit';
import { curvedTimber, hipGablet, paling } from './shared';

export const wealdenHallHouse: BuildingDef = {
  id: 'wealden-hall-house',
  name: 'Wealden hall house',
  style: 'Late medieval timber frame',
  date: 'c. 1420',
  summary:
    'After the Black Death land was cheap and wages high, and prosperous yeomen and tradesmen, especially in Kent and Sussex, built ' +
    'houses like this. The middle is still an open hall, heated by a hearth in the floor and open to the roof, but the two ends now ' +
    'have upper floors, a parlour and chamber at one end and service rooms at the other. The upper floors project as jetties, and ' +
    'because the hall between them has no upper floor its front is set back under a single hipped roof, the giveaway of a Wealden house.',
  materials: ['oak frame', 'wattle and daub, limewashed', 'handmade clay peg tiles', 'unglazed oak window mullions'],
  lookFor: [
    {
      label: 'Jetty',
      note: 'The upper floor of each end bay projects over the one below, carried on the ends of the floor joists.',
      at: [-4.6, 2.75, 4.2],
    },
    {
      label: 'Recessed hall and flying wall plate',
      note: 'The open hall front is set back, and the eaves beam leaps across it from jetty to jetty, propped by curved braces.',
      at: [0, 5.0, 4.1],
    },
    {
      label: 'Hall window',
      note: 'A tall opening with diamond-section oak mullions and no glass; shutters were closed against the weather.',
      at: [-1.0, 3.3, 3.55],
    },
    {
      label: 'Hipped roof with gablets',
      note: 'One roof covers the whole house; little triangular gablets at the top of each hip probably helped let out the smoke of the hall hearth. Many Wealden roofs were thatched at first.',
      at: [3.4, 8.9, 0.3],
    },
    {
      label: 'Arched doorhead',
      note: 'The main door opens into a cross passage at the low end of the hall, under a pointed arch cut in the oak.',
      at: [2.2, 2.3, 3.45],
    },
  ],
  build(b) {
    const L = b.pick([12, 12.4]);
    const D = 6.4;
    const zf = D / 2;
    const jet = 0.65;
    const g1 = 2.6; // ground storey
    const fl = 0.28; // floor zone
    const H = 5.2; // wall plate
    const bw = b.pick([3.0, 3.2]); // end bay width
    const hw = L - 2 * bw;
    const daub = b.pick([P.limewash, tint(P.limewash, -0.03), tint(P.ochreWash, 0.12)]);
    const oak = b.pick([P.oak, P.oakSilver, tint(P.oak, 0.06)]);
    const tile = b.pick([P.tileRed, tint(P.tileRed, -0.05), P.tileBrown]);

    b.box(L + 0.12, 0.25, D + 0.12, P.rubble);

    // hall: full height, front flush with the ground storey of the ends
    b.box(hw, H - 0.25, D, daub, { at: [0, 0.25, 0] });
    b.frame(hw, H - 0.25, oak, { at: [0, 0.25, zf], facing: '+z', studs: 3, rails: 1, beam: 0.2 });

    b.sym((s) => {
      const x = s * (L / 2 - bw / 2);
      // ground storey
      b.box(bw, g1 - 0.25, D, daub, { at: [x, 0.25, 0] });
      b.frame(bw, g1 - 0.25, oak, { at: [x, 0.25, zf], facing: '+z', studs: 3, rails: 1, brace: 'corner' });
      // jettied upper storey (front only)
      b.box(bw, H - g1 - fl, D + jet, daub, { at: [x, g1 + fl, jet / 2] });
      b.frame(bw, H - g1 - fl, oak, { at: [x, g1 + fl, zf + jet], facing: '+z', studs: 4, rails: 1, brace: 'corner' });
      // floor zone: joist ends and the bressumer
      b.box(bw, fl, D, oak, { at: [x, g1, 0] });
      for (let i = 0; i < 8; i++) {
        b.box(0.12, 0.14, jet, oak, { at: [x - bw / 2 + 0.2 + i * ((bw - 0.4) / 7), g1 + 0.04, zf + jet / 2] });
      }
      b.box(bw, 0.18, 0.2, tint(oak, -0.05), { at: [x, g1 + fl - 0.06, zf + jet - 0.1] });
      // upper windows, small and shuttered
      b.window(1.1, 0.8, { at: [x, g1 + fl + 0.8, zf + jet + 0.04], facing: '+z', frame: oak, glass: P.timberBlack, bars: [4, 1] });
      // end walls
      const fx = s > 0 ? '+x' : '-x';
      b.frame(D, g1 - 0.25, oak, { at: [s * (L / 2), 0.25, 0], facing: fx, studs: 5, rails: 1, brace: 'corner' });
      b.frame(D + jet, H - g1 - fl, oak, { at: [s * (L / 2), g1 + fl, jet / 2], facing: fx, studs: 6, rails: 1, brace: 'corner' });
      b.window(0.9, 0.7, { at: [s * (L / 2 + 0.04), 1.0, -1.2], facing: fx, frame: oak, glass: P.timberBlack, bars: [3, 1] });
      // the inner corner posts of the jettied bays
      b.box(0.22, H - g1 - fl, 0.22, oak, { at: [s * (hw / 2 + 0.11), g1 + fl, zf + jet - 0.11] });
    });

    // flying wall plate across the hall, propped by curved braces
    const pz = zf + jet - 0.11;
    b.box(hw + 0.2, 0.24, 0.22, tint(oak, -0.05), { at: [0, H - 0.24, pz] });
    for (const x of [-hw / 4, hw / 4]) {
      curvedTimber(b, [0, 0], [0, 0.9], [jet - 0.05, 1.3], -0.16, 0.16, oak, { at: [x, H - 1.55, zf + 0.02], rotY: -Math.PI / 2 });
    }

    // hall window: tall, diamond mullions, unglazed; and the arched door to the cross passage
    b.window(2.0, 2.4, { at: [-1.0, 1.7, zf + 0.04], facing: '+z', frame: oak, glass: P.timberBlack, bars: [7, 2] });
    b.panel(1.2, 2.25, oak, { at: [hw / 2 - 0.9, 0.2, zf + 0.04], facing: '+z', shape: 'pointed' });
    b.panel(1.0, 2.05, P.oakDark, { at: [hw / 2 - 0.9, 0.2, zf + 0.06], facing: '+z', shape: 'pointed' });
    // back door opposite
    b.panel(1.0, 2.0, P.oakDark, { at: [hw / 2 - 0.9, 0.25, -zf - 0.04], facing: '-z', shape: 'pointed' });
    // back wall framing
    b.frame(hw, H - 0.25, oak, { at: [0, 0.25, -zf], facing: '-z', studs: 7, rails: 2 });
    b.sym((s) => {
      const x = s * (L / 2 - bw / 2);
      b.frame(bw, g1 - 0.25, oak, { at: [x, 0.25, -zf], facing: '-z', studs: 3, rails: 1, brace: 'corner' });
      b.frame(bw, H - g1 - 0.25, oak, { at: [x, g1 + 0.25, -zf], facing: '-z', studs: 3, rails: 1, brace: 'corner' });
    });
    b.window(1.8, 1.6, { at: [-0.8, 2.2, -zf - 0.04], facing: '-z', frame: oak, glass: P.timberBlack, bars: [6, 2] });

    // one hipped roof over everything, with smoke gablets
    hipGablet(b, L, D + jet, 4.1, tile, { at: [0, H, jet / 2], overhang: 0.4, g: 0.7 });

    // garden: a paling to the street, a path, a kitchen garden behind
    b.box(1.2, 0.03, 4.2, P.gravel, { at: [hw / 2 - 0.9, 0, zf + 2.4], jitter: false });
    paling(b, -6.8, 8.4, hw / 2 - 1.6, 8.4, 1.1, P.oakSilver, 0.2);
    paling(b, hw / 2 - 0.2, 8.4, 6.8, 8.4, 1.1, P.oakSilver, 0.2);
    for (let i = 0; i < 6; i++) b.box(0.5, 0.12, 3.0, P.soil, { at: [-5 + i * 1.0, 0, -6.6] });
    b.tree(b.range(4.5, 5.5), { at: [4.8, 0, -7.0] });
  },
};
