import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { barrel, cafeTable, ground, shutteredWindow, word } from './shared';

const X0 = -10.0; // the main block
const X1 = 5.6;
const ZF = 1.4; // its front, set back behind the forecourt
const ZB = -6.4;
const G = 3.4;
const F1 = 2.9;
const TOP = G + F1;
const GX0 = X1; // the garage on the right
const GX1 = 10.2;

/** A petrol pump of the 1950s: a tall rounded cabinet with a dial, a hose and a lit globe. */
function pump(b: Builder, x: number, z: number, color: number): void {
  b.group({ at: [x, 0, z] }, () => {
    b.box(0.7, 0.2, 0.55, P.concrete);
    b.box(0.55, 1.7, 0.42, color, { at: [0, 0.2, 0] });
    b.box(0.6, 0.22, 0.46, P.white, { at: [0, 1.5, 0] });
    b.panel(0.34, 0.34, P.white, { at: [0, 1.0, 0.21], facing: '+z', shape: 'circle', depth: 0.03 });
    b.cyl(0.08, 0.3, P.steel, { at: [0, 1.9, 0], segs: 5 });
    b.sphere(0.24, P.cream, { at: [0, 2.4, 0], segs: 8 });
    b.beam([0.3, 1.3, 0.1], [0.4, 0.6, 0.35], 0.04, 0.04, P.black);
  });
}

/** A lorry of the period: a snub-nosed cab and an open trailer with a tarpaulin, nose to local +Z. */
function lorry(b: Builder, at: [number, number, number], rotY: number, color: number): void {
  b.group({ at, rotY }, () => {
    const tyre = 0x1d1d1f;
    b.box(2.3, 1.4, 2.0, color, { at: [0, 0.8, 2.6] });
    b.box(2.2, 0.9, 1.2, color, { at: [0, 0.6, 3.9] });
    b.box(2.0, 0.08, 1.0, P.aluminium, { at: [0, 0.85, 4.5] });
    b.panel(1.9, 0.6, P.windowDark, { at: [0, 1.55, 3.61], facing: '+z' });
    b.sym((s) => b.panel(0.9, 0.55, P.windowDark, { at: [s * 1.16, 1.55, 2.7], facing: s > 0 ? '+x' : '-x' }));
    b.box(2.4, 0.35, 6.4, P.oakDark, { at: [0, 0.9, -1.6] });
    b.box(2.4, 1.7, 6.2, P.voletVert, { at: [0, 1.25, -1.6] });
    b.box(2.42, 0.12, 6.2, tint(P.voletVert, -0.08), { at: [0, 2.6, -1.6] });
    for (const z of [3.7, 1.0, -3.4, -4.6]) b.sym((s) => b.log(0.48, 0.32, tyre, { at: [s * 1.0, 0, z], segs: 8 }));
  });
}

export const relaisRoutier: BuildingDef = {
  id: 'relais-routier',
  name: 'Relais routier',
  style: 'Post-war roadside',
  date: 'c. 1955',
  summary:
    'In the years of the post-war boom the goods of France go by lorry, and the route nationale through the town carries them day and night. Old inns on the main roads become relais routiers: a café, a tobacco counter, a long dining room serving a fixed menu at a fixed price, a few plain rooms upstairs, and petrol at the kerb. ' +
    'The best carry the round red-and-blue sign of Les Routiers, a drivers’ paper founded in 1934 whose guide sends its readers to honest food in generous helpings. The red “carotte” over the door marks a licensed seller of the state’s tobacco. ' +
    'The building is plain: rendered walls on a brick base, louvred shutters, a hipped roof of machine-made tiles, a garage for repairs. In its way it is the posting inn come back for the motor age, with the forecourt where the yard used to be.',
  materials: ['rendered brick', 'machine-made clay tiles', 'painted lettering', 'enamelled steel', 'concrete forecourt'],
  lookFor: [
    { label: 'Tabac carotte', note: 'The red double cone over the door marks a licensed tobacconist; it is said to recall the twists of tobacco once sold for chewing or grating.', at: [-6.8, G + 0.3, ZF + 1.0] },
    { label: 'Les Routiers sign', note: 'A round red-and-blue sign: the drivers’ own recommendation of a good, cheap place to eat.', at: [0.6, G + 1.5, ZF + 0.3] },
    { label: 'Petrol pumps', note: 'Two pumps on an island at the edge of the road, each with a dial and a lit glass globe on top.', at: [6.2, 2.4, 7.6] },
    { label: 'Rooms above', note: 'A row of small rooms over the café, for drivers who must sleep before the next stage, as travellers slept over the posting inn.', at: [-3.0, G + 1.6, ZF + 0.2] },
    { label: 'Lorry park', note: 'The forecourt is wide enough to pull a lorry off the road: the yard of the old inns, open to the street.', at: [-6.0, 3.0, 6.4] },
  ],
  build(b) {
    const render = b.pick([P.enduitGris, P.cream, tint(P.ochreWash, 0.12)]);
    const brick = P.briqueNord;
    const tile = b.pick([P.tileRed, P.tuilePlate]);
    const shutter = b.pick([P.voletBleu, P.voletVert, P.voletGris]);

    ground(b, 21.4, 11.0 - ZF, P.concrete, [0, (11.0 + ZF) / 2], 0.05);
    ground(b, 21.4, 1.0, P.tarmac, [0, 10.6], 0.06);

    // ---------------- the main block: café and tabac on the left, dining room on the right, rooms above
    const bw = X1 - X0;
    const bx = (X0 + X1) / 2;
    const bd = ZF - ZB;
    const bz = (ZF + ZB) / 2;
    b.box(bw, TOP, bd, render, { at: [bx, 0, bz] });
    b.box(bw + 0.06, 0.6, bd + 0.06, brick, { at: [bx, 0, bz] });
    b.box(bw + 0.08, 0.16, bd + 0.08, P.concreteWhite, { at: [bx, G - 0.1, bz] });
    b.hip(bw, bd, 2.6, tile, { at: [bx, TOP, bz], overhang: 0.5 });
    b.chimney(0.7, 2.4, 0.6, brick, { at: [-6.0, TOP + 1.0, bz - 1.0] });
    b.chimney(0.7, 2.4, 0.6, brick, { at: [2.6, TOP + 1.0, bz - 1.0] });
    // café front: a wide window, the door, the tabac door with its carotte
    b.window(3.6, 2.0, { at: [-3.4, 0.7, ZF], facing: '+z', frame: P.white, glass: P.glassDark, bars: [3, 1], border: 0.08, mat: 'glass' });
    b.panel(1.1, 2.4, P.doorRed, { at: [-0.8, 0, ZF], facing: '+z' });
    b.window(0.8, 1.4, { at: [-0.8, 0.8, ZF + 0.02], facing: '+z', frame: P.doorRed, border: 0.06, glass: P.glassDark });
    b.panel(1.0, 2.3, P.doorRed, { at: [-6.8, 0, ZF], facing: '+z' });
    b.window(1.6, 1.8, { at: [-8.6, 0.8, ZF], facing: '+z', frame: P.white, bars: [2, 1], border: 0.08 });
    for (const x of [2.0, 4.4]) b.window(1.6, 1.8, { at: [x, 0.8, ZF], facing: '+z', frame: P.white, bars: [2, 2], border: 0.08 });
    // a striped awning over the café window
    b.box(4.2, 0.08, 1.4, P.postRed, { at: [-3.4, 2.75, ZF + 0.7], rot: [0.3, 0, 0] });
    for (const x of spread(5, -5.1, -1.7)) b.box(0.35, 0.09, 1.42, P.white, { at: [x, 2.76, ZF + 0.7], rot: [0.3, 0, 0], jitter: false });
    b.box(4.2, 0.25, 0.04, P.postRed, { at: [-3.4, 2.3, ZF + 1.36] });
    // lettering painted on the render: CAFE TABAC over the ground floor, HOTEL RESTAURANT above
    word(b, 'CAFE TABAC', 0.1, P.doorRed, { at: [-4.6, G - 0.62, ZF], facing: '+z', depth: 0.02 });
    word(b, 'RESTAURANT', 0.09, P.doorBlue, { at: [3.2, G - 0.6, ZF], facing: '+z', depth: 0.02 });
    word(b, 'HOTEL', 0.12, P.doorBlue, { at: [-2.2, TOP - 0.7, ZF], facing: '+z', depth: 0.02 });
    // the carotte on its bracket
    b.box(0.06, 0.06, 0.9, P.iron, { at: [-6.8, G + 0.55, ZF + 0.45] });
    b.group({ at: [-6.8, G - 0.35, ZF + 0.9] }, () => {
      b.cone(0.28, 0.45, P.postRed, { at: [0, 0.45, 0], segs: 4 });
      b.group({ rot: [Math.PI, 0, 0], at: [0, 0.45, 0] }, () => b.cone(0.28, 0.45, P.postRed, { segs: 4 }));
      b.box(0.06, 0.2, 0.06, P.iron, { at: [0, 0.9, 0] });
    });
    // the Les Routiers roundel, red and blue
    b.panel(1.0, 1.0, P.doorBlue, { at: [0.6, G + 1.0, ZF], facing: '+z', shape: 'circle', depth: 0.06 });
    b.panel(0.7, 0.7, P.postRed, { at: [0.6, G + 1.15, ZF], facing: '+z', shape: 'circle', depth: 0.08 });
    b.panel(0.5, 0.12, P.white, { at: [0.6, G + 1.44, ZF], facing: '+z', depth: 0.1 });
    // the rooms upstairs: louvred shutters
    for (const x of [-8.6, -6.0, -3.4, 2.0, 4.4]) shutteredWindow(b, 0.9, 1.5, { at: [x, G + 0.6, ZF], facing: '+z', frame: P.white, shutter, louvred: true, bars: [2, 2] });
    for (const x of [-8.0, -4.0, 0, 4.0]) {
      shutteredWindow(b, 0.9, 1.4, { at: [x, G + 0.7, ZB], facing: '-z', frame: P.white, shutter, louvred: true, bars: [2, 1], closed: x === 0 });
      b.window(1.0, 1.2, { at: [x, 1.0, ZB], facing: '-z', frame: P.white, bars: [2, 1], border: 0.08 });
    }
    b.panel(1.0, 2.2, P.doorGreen, { at: [-1.8, 0, ZB], facing: '-z' });
    for (const z of [-4.2, -1.0]) shutteredWindow(b, 0.9, 1.4, { at: [X0, G + 0.7, z], facing: '-x', frame: P.white, shutter, louvred: true, bars: [2, 1] });

    // ---------------- the garage on the right, for running repairs
    const gw = GX1 - GX0;
    const gd = ZF - 1.0 - ZB;
    const gz = (ZF - 1.0 + ZB) / 2;
    b.box(gw, 4.0, gd, P.concreteWhite, { at: [(GX0 + GX1) / 2, 0, gz] });
    b.box(gw + 0.1, 0.4, gd + 0.1, P.concrete, { at: [(GX0 + GX1) / 2, 3.9, gz] });
    b.panel(3.4, 3.2, P.cladGrey, { at: [(GX0 + GX1) / 2, 0, ZF - 1.0], facing: '+z' });
    for (const y of spread(6, 0.4, 2.9)) b.panel(3.3, 0.05, tint(P.cladGrey, -0.12), { at: [(GX0 + GX1) / 2, y, ZF - 1.0], facing: '+z', depth: 0.08 });
    word(b, 'GARAGE', 0.08, P.doorRed, { at: [(GX0 + GX1) / 2, 3.35, ZF - 1.0], facing: '+z', depth: 0.02 });
    b.window(1.4, 0.8, { at: [GX1, 2.4, gz], facing: '+x', frame: P.steel, bars: [3, 1], border: 0.06 });

    // ---------------- the forecourt: pumps on an island, the lorry, a table outside
    b.box(3.0, 0.2, 1.2, P.concreteWhite, { at: [6.2, 0, 7.6] });
    pump(b, 5.4, 7.6, P.postRed);
    pump(b, 7.0, 7.6, P.cladYellow);
    b.cyl(0.06, 3.2, P.steel, { at: [8.6, 0, 7.6], segs: 5 });
    b.panel(1.0, 1.0, P.white, { at: [8.6, 3.2, 7.6], facing: '+z', shape: 'circle', depth: 0.06 });
    b.panel(0.7, 0.7, P.postRed, { at: [8.6, 3.35, 7.62], facing: '+z', shape: 'circle', depth: 0.08 });
    lorry(b, [-4.8, 0, 6.6], Math.PI / 2, b.pick([P.cladBlue, P.doorRed, 0xc9a23a]));
    for (const x of [-8.4, 3.4]) cafeTable(b, [x, 0.05, ZF + 1.6], P.white, P.castIron, 2, Math.PI / 2);
    barrel(b, [GX1 - 0.6, 0, ZB - 0.6], P.cladRed);
    barrel(b, [GX1 - 1.4, 0, ZB - 0.5], P.cladRed);

    // ---------------- behind: a yard with a shed
    ground(b, 21.4, 4.4, P.gravel, [0, -8.6], 0.04);
    b.box(6.0, 2.6, 3.0, brick, { at: [-6.6, 0, -9.0] });
    b.shed(6.0, 3.0, 0.6, P.cladGrey, { at: [-6.6, 2.6, -9.0], high: '+z' });
    b.panel(1.4, 2.0, P.doorGreen, { at: [-5.6, 0, -7.5], facing: '+z' });
    b.box(14.0, 1.8, 0.3, P.concrete, { at: [3.2, 0, -10.6] });

    // ---------------- colliders
    b.collider(bw, bd, { at: [bx, 0, bz] });
    b.collider(gw, gd, { at: [(GX0 + GX1) / 2, 0, gz] });
    b.collider(6.0, 3.0, { at: [-6.6, 0, -9.0] });
    b.collider(3.0, 1.2, { at: [6.2, 0, 7.6] });
    b.collider(8.6, 2.5, { at: [-4.8, 0, 6.6] });
  },
};

