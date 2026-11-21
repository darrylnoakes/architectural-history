import { P, spread, type BuildingDef } from '@ah/kit';
import { riverWall } from './shared';

export const artDecoFactory: BuildingDef = {
  id: 'art-deco-factory',
  name: 'By-pass factory',
  style: 'Art Deco',
  date: 'c. 1933',
  summary:
    'Electricity from the National Grid meant a factory no longer needed a river, a canal or a coal-fired engine, and new light industries making vacuum cleaners, radios and tyres ' +
    'moved out to the new arterial roads around London. Their fronts were advertisements, built to be seen from passing cars: long and white, with a showy central entrance, ' +
    'bands of coloured faience and metal windows in long strips. Behind the front, the works themselves are plain single-storey sheds.',
  materials: ['rendered concrete', 'coloured faience tiles', 'steel windows', 'glass'],
  modelledOn: 'The Hoover Building, Western Avenue, Perivale (Wallis, Gilbert and Partners, 1932 to 1935), simplified',
  lookFor: [
    { label: 'Central entrance tower', note: 'Taller than the rest and stepped back at the top, framing a grand doorway like an Egyptian temple gate.', at: [0, 12.5, 9.2] },
    { label: 'Sunburst', note: 'The rising sun, a favourite Art Deco motif, in the fanlight over the entrance.', at: [0, 4.6, 9.3] },
    { label: 'Coloured faience', note: 'Glazed tiles in red, blue and green give a bright, washable finish that would not blacken in smoky air.', at: [-9, 8.4, 8.4] },
    { label: 'Strip windows', note: 'Long runs of steel-framed windows between slim piers, possible because a concrete frame carries the load.', at: [-10.5, 2.8, 8.3] },
    { label: 'Curved corner glazing', note: 'The stair towers at each end have glass wrapped round the corner, a sign of the streamlined modern age.', at: [15.9, 6, 8.2] },
  ],
  influences: ['art-deco'],
  build(b) {
    const white = b.pick([P.whiteRender, P.cladWhite, P.faience]);
    const red = P.cladRed;
    const blue = P.cladBlue;
    const green = P.cladGreen;
    const win = P.doorGreen;
    const glass = P.glassDark;

    // ---- the works behind: a plain single-storey shed with rooflights
    const wz = -4.0;
    const wd = 12;
    b.box(33, 6.5, wd, P.brickBuff, { at: [0, 0, wz] });
    b.box(33.2, 0.4, wd + 0.2, P.concrete, { at: [0, 6.5, wz] });
    for (const x of spread(5, -15, 15)) b.gable(3.8, wd - 2, 1.1, P.glass, { at: [x, 6.9, wz], ridge: 'z', mat: 'glass' });
    for (const x of spread(8, -16.5, 16.5)) b.panel(2.4, 2.4, glass, { at: [x, 3, wz - wd / 2], facing: '-z' });
    // loading dock on the river side
    riverWall(b, -17.6, 17.6, P.concrete, { coping: P.concreteWhite });
    b.box(14, 1.1, 1.0, P.concrete, { at: [4, 0, wz - wd / 2 - 0.5] });
    for (const x of [-1, 4, 9]) b.panel(3.0, 3.4, P.cladGrey, { at: [x, 1.1, wz - wd / 2], facing: '-z' });
    b.box(14.5, 0.25, 2.6, P.concreteDark, { at: [4, 4.8, wz - wd / 2 - 1.3] });

    // ---- the white front block along the lane
    const fz = 5.4;
    const fd = 6.0;
    const fh = 8.6;
    const front = fz + fd / 2;
    b.box(31, fh, fd, white, { at: [0, 0, fz] });
    b.box(31.2, 0.5, fd + 0.2, P.concreteDark, { at: [0, 0, fz] });
    b.box(31.2, 0.35, fd + 0.2, white, { at: [0, fh, fz] });
    b.box(31.0, 0.3, 0.12, red, { at: [0, fh - 0.55, front + 0.02], jitter: false }); // faience frieze
    b.box(31.0, 0.12, 0.12, green, { at: [0, fh - 0.75, front + 0.02], jitter: false });
    // wings: piers with faience capitals, and strip windows between them, two floors
    b.sym((s) => {
      const piers = [3.6, 6.4, 9.2, 12.0, 14.0];
      for (const x of piers) {
        b.box(0.55, fh - 0.9, 0.35, white, { at: [s * x, 0.5, front + 0.17] });
        b.box(0.7, 0.45, 0.42, blue, { at: [s * x, fh - 1.4, front + 0.17], jitter: false });
        b.box(0.55, 0.22, 0.44, red, { at: [s * x, fh - 1.62, front + 0.17], jitter: false });
      }
      for (let i = 0; i < piers.length - 1; i++) {
        const cx = (s * (piers[i] + piers[i + 1])) / 2;
        const w = piers[i + 1] - piers[i] - 0.65;
        b.window(w, 2.6, { at: [cx, 1.2, front], facing: '+z', frame: win, glass, bars: [4, 3], border: 0.08 });
        b.window(w, 2.6, { at: [cx, 4.7, front], facing: '+z', frame: win, glass, bars: [4, 3], border: 0.08 });
        b.panel(w, 0.6, green, { at: [cx, 3.95, front], facing: '+z', depth: 0.03 });
      }
      // end stair towers with glazing wrapped round the corner
      const tx = s * 15.5;
      b.box(2.4, fh + 1.6, fd + 0.4, white, { at: [tx, 0, fz] });
      b.box(2.6, 0.35, fd + 0.6, white, { at: [tx, fh + 1.6, fz] });
      b.box(2.4, 0.3, 0.1, red, { at: [tx, fh + 1.1, front + 0.22], jitter: false });
      b.box(1.2, 6.6, 0.12, glass, { at: [tx + s * 0.2, 1.4, front + 0.2], mat: 'glass' });
      b.box(0.12, 6.6, 1.4, glass, { at: [tx + s * 1.22, 1.4, front - 1.0], mat: 'glass' });
      b.cyl(0.6, 6.6, glass, { at: [tx + s * 0.75, 1.4, front - 0.35], segs: 10, mat: 'glass' });
      for (let k = 0; k < 6; k++) b.cyl(0.66, 0.08, win, { at: [tx + s * 0.75, 1.4 + k * 1.3, front - 0.35], segs: 10 });
      // side windows
      for (const z of [-1.4, 1.4]) {
        b.window(1.6, 2.4, { at: [s * 15.5 + s * 1.2, 1.2, fz + z], facing: s > 0 ? '+x' : '-x', frame: win, glass, bars: [2, 3] });
        b.window(1.6, 2.4, { at: [s * 15.5 + s * 1.2, 4.7, fz + z], facing: s > 0 ? '+x' : '-x', frame: win, glass, bars: [2, 3] });
      }
    });

    // ---- central entrance block: taller, stepped, with a great doorway and sunburst
    const cz = fz + 0.6;
    const cd = fd + 1.2;
    const cf = fz + 0.6 + cd / 2;
    b.box(7.6, 11.2, cd, white, { at: [0, 0, cz] });
    b.box(6.0, 1.3, cd - 0.8, white, { at: [0, 11.2, cz - 0.2] });
    b.box(4.0, 1.0, cd - 1.6, white, { at: [0, 12.5, cz - 0.4] });
    b.box(7.8, 0.3, 0.12, red, { at: [0, 10.6, cf + 0.02], jitter: false });
    b.box(6.0, 0.25, 0.12, blue, { at: [0, 12.1, cz - 0.2 + (cd - 0.8) / 2 + 0.02], jitter: false });
    // battered pylons framing the doorway
    b.sym((s) => {
      b.extrude([[-0.75, 0], [0.75, 0], [0.55, 10.2], [-0.55, 10.2]], 0.5, white, { at: [s * 2.9, 0, cf + 0.25] });
      b.box(1.3, 0.35, 0.56, green, { at: [s * 2.9, 9.4, cf + 0.25], jitter: false });
      b.box(1.1, 0.25, 0.58, red, { at: [s * 2.9, 9.75, cf + 0.25], jitter: false });
      for (let k = 0; k < 3; k++) b.box(1.24 - k * 0.08, 0.12, 0.56, blue, { at: [s * 2.9, 8.2 + k * 0.35, cf + 0.25], jitter: false });
    });
    // the doorway: glazed doors under a sunburst fanlight, a tall window above
    b.panel(3.6, 3.0, glass, { at: [0, 0.5, cf], facing: '+z', mat: 'glass' });
    b.panel(0.1, 3.0, win, { at: [0, 0.5, cf + 0.04], facing: '+z' });
    b.panel(4.0, 2.0, P.white, { at: [0, 3.5, cf], facing: '+z', shape: 'segmental', depth: 0.05 });
    b.panel(3.4, 1.7, P.gold, { at: [0, 3.55, cf + 0.02], facing: '+z', shape: 'segmental', depth: 0.06 });
    for (let k = 0; k < 9; k++) {
      const a = -1.25 + (k * 2.5) / 8;
      b.group({ at: [0, 3.6, cf + 0.1], rot: [0, 0, a] }, () => b.box(0.08, 1.15, 0.04, red, { jitter: false }));
    }
    b.window(3.6, 4.4, { at: [0, 5.7, cf], facing: '+z', frame: win, glass, bars: [5, 6] });
    b.stairs(8.6, 0.5, 1.5, 3, P.concreteWhite, { at: [0, 0, cf + 0.75] });
    b.box(4.2, 0.6, 0.2, P.cladBlue, { at: [0, 10.15, cf + 0.06], jitter: false });

    // ---- forecourt: lawns, a path, a flagpole and a low wall to the road
    b.sym((s) => b.box(13.5, 0.06, 1.4, P.grass, { at: [s * 8.6, 0, 9.9], jitter: false }));
    b.box(4.4, 0.04, 1.6, P.paving, { at: [0, 0, 9.9], jitter: false });
    b.sym((s) => b.box(13.6, 0.5, 0.25, white, { at: [s * 8.8, 0, 10.8] }));
    b.cyl(0.06, 9.0, P.white, { at: [-9, 0, 9.9], segs: 6 });
    b.box(1.4, 0.8, 0.02, P.cladRed, { at: [-8.3, 8.0, 9.9], jitter: false });

    b.collider(31, fd, { at: [0, 0, fz] });
    b.collider(7.6, cd, { at: [0, 0, cz] });
    b.collider(33, wd, { at: [0, 0, wz] });
  },
};
