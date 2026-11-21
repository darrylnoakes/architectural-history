import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { blockLetters, type Pt } from './shared';

/** Plan outline (x, z) of a rectangle with its front-right (+x, +z) corner rounded, grown by `off`. */
function roundedPlan(x0: number, x1: number, z0: number, z1: number, r: number, off = 0): Pt[] {
  const pts: Pt[] = [[x0 - off, z0 - off], [x1 + off, z0 - off], [x1 + off, z1 - r]];
  for (let i = 1; i < 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push([x1 - r + (r + off) * Math.cos(a), z1 - r + (r + off) * Math.sin(a)]);
  }
  pts.push([x1 - r, z1 + off], [x0 - off, z1 + off]);
  return pts;
}

/** Raise a plan outline (x, z points, anticlockwise seen from above) into a solid h tall, base at y. */
function raise(b: Builder, pts: Pt[], y: number, h: number, color: number, mat?: 'glass'): void {
  b.extrude(
    pts.map(([x, z]) => [x, -z] as Pt),
    h,
    color,
    { at: [0, y + h / 2, 0], rot: [-Math.PI / 2, 0, 0], mat },
  );
}

export const artDecoCinema: BuildingDef = {
  id: 'art-deco-cinema',
  name: 'Cinema',
  style: 'Art Deco (Streamline Moderne)',
  date: '1936',
  summary:
    'The glass hall has gone, as the original Crystal Palace went in the fire of 1936. In its place is a picture palace for the talkies, ' +
    'when most people went to the cinema at least once a week. Cinema chains wanted a building that was its own advertisement: ' +
    'a front of cream glazed faience, swept round the corner in streamlined bands, a tall fin to be seen down the street, and the name in lights. ' +
    'Behind the show front, the auditorium is a plain brick box seating well over a thousand.',
  materials: ['cream faience', 'black faience bands', 'brick', 'steel frame', 'neon'],
  modelledOn: "The Odeon circuit of Oscar Deutsch, designed by Harry Weedon's office (1935-39)",
  lookFor: [
    { label: 'Faience', note: 'Glazed terracotta slabs, easy to wash, bright in any weather, and made in standard sizes for a chain of cinemas.', at: [-12.5, 6, 10.2] },
    { label: 'Fin tower', note: 'A slab standing up from the front like a ship\'s funnel or a radio mast: pure advertisement, with nothing inside.', at: [-10.2, 19, 10.4] },
    { label: 'Rounded corner', note: 'Streamlined like a liner or a train: the horizontal bands sweep round the curve without a break.', at: [11.8, 7.2, 8.8] },
    { label: 'Canopy', note: 'A flat slab over the entrance, lit underneath and lettered with what is showing.', at: [1.2, 4.4, 12.6] },
    { label: 'Brick auditorium', note: 'Plain brick behind the showy front: the money went where the street could see it.', at: [12.3, 8, -8] },
  ],
  influences: ['art-deco'],
  build(b) {
    const cream = tint(P.faience, b.range(-0.02, 0.01));
    const black = P.black;
    const brick = b.pick([P.brickRed, P.brickOrange, tint(P.brickRed, 0.04)]);
    const fz0 = 2;
    const fz1 = 10;
    const fx0 = -15;
    const fx1 = 13;
    const fh = 10.2;
    const r = 5;

    // ---------------------------------------------------------------- auditorium: a brick box
    const az0 = -14.4;
    const ah = 13.2;
    b.box(24, ah, fz0 - az0 + 0.5, brick, { at: [0, 0, (az0 + fz0) / 2 - 0.25] });
    b.box(24.3, 0.4, fz0 - az0 + 0.8, tint(cream, -0.04), { at: [0, ah, (az0 + fz0) / 2 - 0.25] });
    b.gable(23, fz0 - az0 - 1, 2.0, P.cladGrey, { at: [0, ah, (az0 + fz0) / 2 - 0.4], ridge: 'z' });
    b.sym((s) => {
      for (const z of spread(5, az0, fz0)) b.box(0.6, ah - 0.4, 0.9, tint(brick, -0.05), { at: [s * 12.15, 0, z] });
      b.panel(1.8, 2.2, P.doorBlack, { at: [s * 12, 0, az0 + 3], facing: s > 0 ? '+x' : '-x' });
      b.box(2.4, 0.15, 1.2, tint(cream, -0.03), { at: [s * 12.6, 2.4, az0 + 3] });
    });
    b.panel(3.6, 3.0, P.doorBlack, { at: [0, 0, az0], facing: '-z' }); // scenery and service doors at the back
    b.box(2.6, 3.2, 4.4, brick, { at: [-13.3, 0, az0 + 8] }); // boiler house
    b.chimney(0.9, 7, 0.9, brick, { at: [-13.3, 3.2, az0 + 7] });
    // projection box on the roof at the front
    b.box(8, 2.4, 3.0, brick, { at: [0, ah, fz0 - 1.6] });

    // ---------------------------------------------------------------- the faience front block
    raise(b, roundedPlan(fx0, fx1, fz0, fz1, r, 0.12), 0, 0.5, black);
    raise(b, roundedPlan(fx0, fx1, fz0, fz1, r), 0.5, fh - 0.5, cream);
    // streamline bands and the ribbon window round the corner
    raise(b, roundedPlan(fx0, fx1, fz0, fz1, r, 0.06), 4.6, 0.35, black);
    raise(b, roundedPlan(fx0, fx1, fz0, fz1, r, 0.04), 6.0, 1.5, P.glassDark, 'glass');
    for (const y of [5.3, 7.9, 8.4, 8.9]) raise(b, roundedPlan(fx0, fx1, fz0, fz1, r, 0.05), y, 0.14, y > 7 ? tint(cream, -0.08) : black);
    raise(b, roundedPlan(fx0, fx1, fz0, fz1, r, 0.14), fh, 0.35, tint(cream, 0.03));

    // raised centre slab for the name, stepped back in two stages like a ziggurat
    const sx = 1.2;
    b.box(14, 3.4, 1.2, cream, { at: [sx, fh, fz1 - 0.6] });
    b.box(9, 1.2, 1.0, cream, { at: [sx, fh + 3.4, fz1 - 0.7] });
    b.box(14.3, 0.2, 1.4, black, { at: [sx, fh + 3.4, fz1 - 0.6] });
    blockLetters(b, 'ODEON', 2.2, P.postRed, { at: [sx, fh + 0.6, fz1 + 0.05], depth: 0.25, gap: 0.9 });
    // tall windows of the first-floor café, between faience piers
    for (const x of spread(5, sx - 6, sx + 6)) {
      b.window(1.3, 4.2, { at: [x, 4.9, fz1], facing: '+z', frame: black, glass: P.glassDark, bars: [1, 4] });
    }

    // the fin tower with its neon strips
    const finX = -10.2;
    b.box(1.4, 21, 7, cream, { at: [finX, 0, fz1 - 3.2] });
    b.box(1.6, 0.4, 7.2, black, { at: [finX, 21, fz1 - 3.2] });
    b.box(0.3, 14, 0.3, P.postRed, { at: [finX, 6, fz1 + 0.35] });
    for (let i = 0; i < 4; i++) b.box(1.8 - i * 0.2, 0.25, 7.4 - i * 0.6, black, { at: [finX, 14 + i * 1.6, fz1 - 3.2] });

    // ---------------------------------------------------------------- entrance under the canopy
    const cw = 15;
    b.box(cw, 0.45, 3.0, cream, { at: [sx, 3.7, fz1 + 1.5] });
    b.box(cw + 0.1, 0.2, 3.1, black, { at: [sx, 3.7, fz1 + 1.55] });
    b.box(cw + 0.1, 0.65, 0.12, P.white, { at: [sx, 4.15, fz1 + 3.02] });
    b.box(cw - 0.6, 0.04, 2.4, P.windowLit, { at: [sx, 3.66, fz1 + 1.5] });
    for (const x of spread(6, sx - 5, sx + 5)) {
      b.panel(1.4, 2.6, P.glassDark, { at: [x, 0.5, fz1], facing: '+z', depth: 0.05 });
      b.panel(0.08, 2.6, P.gold, { at: [x, 0.5, fz1], facing: '+z', depth: 0.08 });
    }
    b.sym((s) => b.panel(1.3, 1.8, P.cladYellow, { at: [sx + s * 6.6, 1.1, fz1], facing: '+z', depth: 0.08 }));
    b.panel(1.3, 1.8, P.cladYellow, { at: [-13, 1.1, fz1], facing: '+z', depth: 0.08 });
    b.stairs(cw, 0.5, 1.2, 2, tint(P.concrete, 0.05), { at: [sx, 0, fz1 + 0.6] });
    // side: the curved corner carries the exit
    b.panel(1.8, 2.4, P.doorBlack, { at: [fx1, 0.5, fz0 + 1.6], facing: '+x' });
    b.box(30, 0.06, 15 - fz1, tint(P.paving, 0.02), { at: [0, 0, (fz1 + 15) / 2] });

    b.collider(24, fz0 - az0 + 0.5, { at: [0, 0, (az0 + fz0) / 2 - 0.25] });
    b.collider(fx1 - fx0, fz1 - fz0, { at: [(fx0 + fx1) / 2, 0, (fz0 + fz1) / 2] });
    b.collider(2.6, 4.4, { at: [-13.3, 0, az0 + 8] });
  },
};
