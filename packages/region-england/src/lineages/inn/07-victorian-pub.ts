import { P, mix, spread, tint, type Builder, type BuildingDef, type Facing } from '@ah/kit';
import { ground, prism } from './shared';

const X0 = -10;
const X1 = 10;
const ZF = 10.0; // main street front
const ZR = 1.0; // back of the main block
const CH = 2.6; // corner chamfer
const G = 4.3;
const F1 = 3.3;
const F2 = 3.0;
const TOP = G + F1 + F2;
const PITCH = 0.84; // about 40 degrees, Welsh slate

/** Outline of a shaped (Dutch) gable w wide and h tall, as [x, y] points. */
function shapedGable(w: number, h: number): [number, number][] {
  const a = w / 2;
  const half: [number, number][] = [
    [-a, 0],
    [-a, h * 0.3],
    [-a * 0.92, h * 0.36],
    [-a * 0.8, h * 0.38],
    [-a * 0.68, h * 0.42],
    [-a * 0.62, h * 0.5],
    [-a * 0.6, h * 0.58],
    [-a * 0.52, h * 0.6],
    [-a * 0.42, h * 0.64],
    [-a * 0.36, h * 0.72],
    [-a * 0.34, h * 0.8],
    [-a * 0.42, h * 0.8],
    [-a * 0.42, h * 0.84],
    [0, h],
  ];
  const right = half
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => [-x, y] as [number, number]);
  return [...half, ...right];
}

/** A shaped gable with a stone coping and finials, standing on a wall plane facing `facing`. */
function gableFront(b: Builder, at: [number, number, number], facing: Facing, w: number, h: number, brick: number, stone: number) {
  const ang = typeof facing === 'number' ? facing : { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 }[facing];
  b.group({ at, rotY: ang }, () => {
    b.group({ at: [0, -0.05, -0.12], scale: [1 + 0.36 / w, 1 + 0.2 / h, 1] }, () => b.extrude(shapedGable(w, h), 0.36, stone));
    b.extrude(shapedGable(w, h), 0.4, brick, { at: [0, 0, -0.08] });
    b.sym((s) => b.cyl(0.14, 0.8, stone, { at: [s * w * 0.5, h * 0.3, 0], segs: 6 }));
    b.cone(0.2, 0.7, stone, { at: [0, h + 0.1, 0], segs: 6 });
  });
}

export const victorianPub: BuildingDef = {
  id: 'victorian-pub',
  name: 'Corner public house',
  style: 'Late Victorian "gin palace"',
  date: 'c. 1895',
  summary:
    'Railways killed the coaching trade, and the old inn was pulled down for a public house built by a brewery to catch the drinkers of a growing town. ' +
    'Breweries competed in show: a ground floor of glazed tiles that could be washed clean, huge windows of etched and cut glass, gilded lettering and big gas lamps, with a corner turret and shaped gables to be seen from both streets. ' +
    'Inside, the bar was split into separate rooms for different classes of customer, each with its own door.',
  materials: ['red brick', 'glazed faience tiles', 'terracotta', 'etched plate glass', 'Welsh slate'],
  lookFor: [
    { label: 'Corner entrance', note: 'The door is set in the cut-off corner so the pub faces both streets and catches trade from each.', at: [X1 - CH / 2 + 0.3, 1.6, ZF - CH / 2 + 0.3] },
    { label: 'Glazed tile front', note: 'Glossy faience on the ground floor shrugged off soot and could be washed down, and made the pub shine at night.', at: [-6.2, 1.2, ZF + 0.3] },
    { label: 'Etched windows', note: 'Frosted, patterned glass on the lower panes kept drinkers private from the street while letting in light.', at: [-3.6, 1.6, ZF + 0.35] },
    { label: 'Gas lamps', note: 'Large lanterns on iron brackets, lit at dusk to draw customers off a dark street.', at: [X1 + 0.75, 3.4, ZF + 0.75] },
    { label: 'Shaped gable', note: 'A curving Flemish-style gable with stone coping, part of the "Queen Anne" fashion for picturesque skylines.', at: [-2.1, TOP + 2.8, ZF + 0.4] },
  ],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, 0.04), P.brickDark]);
    const stone = b.pick([P.bathStone, P.portland, P.terracotta]);
    const tileC = b.pick([tint(P.doorGreen, 0.06), mix(P.tileBrown, P.oakDark, 0.3), tint(P.doorRed, -0.05)]);
    const tileLight = tint(tileC, 0.12);
    const fascia = b.pick([P.black, P.doorGreen, tint(P.doorBlue, -0.05)]);
    const etched = mix(P.white, P.glass, 0.45);
    const slate = P.slateBlue;
    const zm = (ZF + ZR) / 2;
    const dep = ZF - ZR;

    // pavements on both streets, yard behind
    ground(b, 21.6, 0.9, P.paving, [0, ZF + 0.45], 0.1);
    ground(b, 0.9, 21.4, P.paving, [X1 + 0.45, 0], 0.1);
    ground(b, 13.5, 11, P.cobble, [X0 + 6.75, -4.5]);

    // ---------------- main block with chamfered corner
    const plan: [number, number][] = [
      [X0, ZR],
      [X1, ZR],
      [X1, ZF - CH],
      [X1 - CH, ZF],
      [X0, ZF],
    ];
    prism(b, plan, TOP, brick);
    // tiled ground floor skin and fascia, slightly proud
    const skin: [number, number][] = [
      [X0, ZF - 0.5],
      [X0, ZF + 0.12],
      [X1 - CH + 0.05, ZF + 0.12],
      [X1 + 0.12, ZF - CH + 0.05],
      [X1 + 0.12, ZR - 0.6],
      [X1 - 0.5, ZR - 0.6],
      [X1 - 0.5, ZF - CH],
      [X1 - CH, ZF - 0.5],
    ];
    prism(b, skin, G - 0.9, tileC);
    prism(b, skin, 0.5, tint(tileC, -0.12));
    prism(b, skin.map(([x, z]) => [x + (x > 0 ? 0.08 : 0), z + (z > 5 ? 0.08 : 0)] as [number, number]), 0.75, fascia, G - 0.9);
    prism(b, skin.map(([x, z]) => [x + (x > 0 ? 0.16 : 0), z + (z > 5 ? 0.16 : 0)] as [number, number]), 0.18, tileLight, G - 0.15);
    // gilded lettering on the fascia (front, corner, side)
    const letters = (x0: number, x1: number, n: number, f: Facing, fixed: number, alongX: boolean) => {
      for (const p of spread(n, x0, x1)) {
        b.panel(0.28, 0.4, P.gold, {
          at: alongX ? [p, G - 0.7, fixed] : [fixed, G - 0.7, p],
          facing: f,
          depth: 0.04,
        });
      }
    };
    letters(-8.8, 5.8, 22, '+z', ZF + 0.22, true);
    letters(-7.2, 6.8, 18, '+x', X1 + 0.22, false);
    // tiled pilasters dividing the ground floor into bays
    const front = [-9.7, -6.6, -3.6, -0.6, 2.4, 5.2, 7.2];
    for (const x of front) b.box(0.55, G - 0.9, 0.2, tileLight, { at: [x, 0, ZF + 0.18] });
    const side = [ZR - 0.4, 2.6, 5.0, 7.6];
    for (const z of side) b.box(0.2, G - 0.9, 0.55, tileLight, { at: [X1 + 0.18, 0, z] });
    // big windows: etched lower lights, clear upper lights with small transom panes
    const bigWin = (x: number, z: number, w: number, f: Facing) => {
      const fz = f === '+z';
      const at = (y: number): [number, number, number] => (fz ? [x, y, z] : [z, y, x]);
      b.window(w, 2.6, { at: at(0.5), facing: f, frame: tileLight, glass: P.windowDark, border: 0.1, bars: [2, 1] });
      b.panel(w - 0.3, 1.25, etched, { at: at(0.6), facing: f, depth: 0.1 });
      for (const p of spread(3, -w / 2 + 0.45, w / 2 - 0.45)) {
        b.panel(0.36, 0.36, P.white, { at: fz ? [x + p, 1.05, z] : [z, 1.05, x + p], facing: f, depth: 0.12 });
      }
      b.panel(w - 0.2, 0.06, tileLight, { at: at(2.75), facing: f, depth: 0.1 });
    };
    // doors in tiled surrounds with fanlights
    const pubDoor = (x: number, z: number, f: Facing) => {
      b.panel(1.4, 3.1, tileLight, { at: [x, 0, z], facing: f, shape: 'round', depth: 0.08 });
      b.panel(1.1, 2.3, P.oakDark, { at: [x, 0, z], facing: f, depth: 0.12 });
      b.panel(0.6, 1.1, etched, { at: [x, 0.95, z], facing: f, depth: 0.14 });
      b.panel(1.1, 0.55, P.windowLit, { at: [x, 2.35, z], facing: f, shape: 'round', depth: 0.12 });
    };
    for (let i = 0; i < front.length - 1; i++) {
      const x = (front[i] + front[i + 1]) / 2;
      const w = front[i + 1] - front[i] - 0.75;
      if (i === 1) pubDoor(x, ZF + 0.12, '+z');
      else if (w > 1.2) bigWin(x, ZF + 0.12, w, '+z');
    }
    for (let i = 0; i < side.length - 1; i++) {
      const z = (side[i] + side[i + 1]) / 2;
      if (i === 0) pubDoor(X1 + 0.12, z, '+x');
      else bigWin(z, X1 + 0.12, side[i + 1] - side[i] - 0.75, '+x');
    }
    // corner door on the chamfer
    const cx = X1 - CH / 2 + 0.06;
    const cz = ZF - CH / 2 + 0.06;
    pubDoor(cx, cz, Math.PI / 4);
    b.panel(1.3, 0.35, P.gold, { at: [cx + 0.05, 3.55, cz + 0.05], facing: Math.PI / 4, depth: 0.08 });

    // ---------------- upper floors: brick with stone bands, sashes with stone heads
    b.box(X1 - X0 + 0.1, 0.25, 0.14, stone, { at: [-0.05, G + F1 - 0.1, ZF] });
    b.box(0.14, 0.25, dep, stone, { at: [X1, G + F1 - 0.1, zm - CH / 2] });
    b.box(X1 - X0 + 0.3, 0.4, 0.3, stone, { at: [0, TOP - 0.35, ZF] });
    b.box(0.3, 0.4, dep + 0.3, stone, { at: [X1, TOP - 0.35, zm] });
    const sash = (x: number, y: number, z: number, h: number, f: Facing, ped: boolean, plain = false) => {
      if (plain) {
        b.window(1.1, h, { at: [x, y, z], facing: f, frame: P.white, bars: [1, 2], border: 0.09 });
        b.panel(1.35, 0.22, stone, { at: [x, y + h, z], facing: f, depth: 0.06 });
        return;
      }
      b.window(1.15, h, { at: [x, y, z], facing: f, frame: P.white, bars: [1, 2], border: 0.09, shape: 'segmental' });
      b.panel(1.45, 0.12, stone, { at: [x, y - 0.12, z], facing: f, depth: 0.1 });
      if (ped) {
        b.panel(1.5, 0.15, stone, { at: [x, y + h + 0.05, z], facing: f, depth: 0.12 });
        b.panel(1.5, 0.5, stone, { at: [x, y + h + 0.2, z], facing: f, shape: 'segmental', depth: 0.1 });
      } else {
        b.panel(1.35, 0.3, stone, { at: [x, y + h - 0.12, z], facing: f, shape: 'segmental', depth: 0.08 });
      }
    };
    for (const x of [-8.6, -6.2, 1.2, 3.6, 6.0]) {
      sash(x, G + 0.7, ZF, 2.2, '+z', true);
      sash(x, G + F1 + 0.6, ZF, 1.8, '+z', false);
    }
    for (const z of [1.8, 4.1, 6.4]) {
      sash(X1, G + 0.7, z, 2.2, '+x', true);
      sash(X1, G + F1 + 0.6, z, 1.8, '+x', false);
    }
    // canted bay over the front door, carried up through both floors into the gable
    b.group({ at: [-2.1, G, ZF] }, () => {
      prism(b, [[-1.6, 0], [1.6, 0], [1.1, 0.7], [-1.1, 0.7]], F1 + F2 - 0.4, stone);
      for (const y of [0.6, F1 + 0.5]) {
        b.window(1.5, 1.9, { at: [0, y, 0.7], facing: '+z', frame: P.white, bars: [2, 2], border: 0.09 });
        b.sym((s) => b.window(0.6, 1.9, { at: [s * 1.36, y, 0.36], facing: s * 0.95, frame: P.white, border: 0.06 }));
      }
      b.lathe([[1.7, 0], [0.2, -0.6]], stone, { at: [0, 0, 0.1], segs: 6 });
    });

    // ---------------- roof: slate, with shaped gables to the front and the side street
    const rise = (dep / 2) * PITCH;
    b.gable(X1 - X0, dep, rise, slate, { at: [0, TOP, zm], overhang: 0.25, wall: brick });
    b.box(X1 - X0, 0.12, 0.25, P.terracotta, { at: [0, TOP + rise + 0.05, zm] });
    // front cross gable
    const gw = 5.4;
    b.gable(gw, dep / 2, rise + 0.3, slate, { at: [-2.1, TOP, ZF - 0.2 - dep / 4], ridge: 'z', overhang: 0.1, wall: brick });
    gableFront(b, [-2.1, TOP, ZF + 0.12], '+z', gw + 0.6, rise + 1.9, brick, stone);
    b.window(1.4, 1.6, { at: [-2.1, TOP + 0.5, ZF + 0.32], facing: '+z', frame: P.white, shape: 'round', bars: [2, 3] });
    // side street gable over the end wall
    gableFront(b, [X1 + 0.3, TOP, zm - 0.4], '+x', dep - 1.6, rise + 2.0, brick, stone);
    b.window(1.2, 1.4, { at: [X1 + 0.5, TOP + 0.6, zm - 0.4], facing: '+x', frame: P.white, shape: 'round', bars: [2, 3] });
    // party-wall gable and chimneys
    b.chimney(1.6, rise + 2.2, 0.9, brick, { at: [X0 + 0.8, TOP, zm], pots: 4 });
    b.chimney(1.4, 2.6, 0.8, brick, { at: [4.2, TOP + rise - 1.4, zm], pots: 3 });

    // ---------------- corner turret: corbelled out at first floor, ogee lead cap and finial
    const tx = X1 - CH / 2 + 0.25;
    const tz = ZF - CH / 2 + 0.25;
    b.group({ at: [tx, G, tz] }, () => {
      b.lathe([[0.2, -0.9], [1.55, 0]], stone, { segs: 8 });
      b.cyl(1.55, F1 + F2 + 0.7, brick, { segs: 8 });
      b.cyl(1.68, 0.3, stone, { at: [0, F1 - 0.1, 0], segs: 8 });
      b.cyl(1.72, 0.4, stone, { at: [0, F1 + F2 + 0.7, 0], segs: 8 });
      for (let i = 0; i < 3; i++) {
        const a = Math.PI / 4 + (i - 1) * (Math.PI / 4);
        for (const y of [0.7, F1 + 0.6]) {
          b.window(0.75, 1.9, { at: [Math.sin(a) * 1.5, y, Math.cos(a) * 1.5], facing: a, frame: P.white, border: 0.07, bars: [1, 2] });
        }
      }
      b.lathe(
        [[1.75, 0], [1.7, 0.4], [1.3, 1.0], [0.7, 1.6], [0.35, 2.2], [0.3, 2.5], [0.12, 2.8], [0.05, 3.6]],
        P.lead,
        { at: [0, F1 + F2 + 1.1, 0], segs: 8 },
      );
      b.sphere(0.16, P.gold, { at: [0, F1 + F2 + 4.0, 0], segs: 6 });
    });

    // ---------------- gas lamps on scrolled brackets
    const lamp = (at: [number, number, number], f: number, out: number) => {
      b.group({ at, rotY: f }, () => {
        b.box(0.07, 0.07, out, P.castIron, { at: [0, 0, out / 2] });
        b.group({ at: [0, -0.55, 0], rot: [0.75, 0, 0] }, () => b.box(0.05, 0.8, 0.05, P.castIron));
        b.cyl(0.05, 0.25, P.castIron, { at: [0, -0.2, out], segs: 6 });
        b.cyl(0.26, 0.75, P.windowLit, { at: [0, -0.95, out], rTop: 0.36, segs: 6, mat: 'glass' });
        b.cyl(0.4, 0.1, P.castIron, { at: [0, -0.22, out], rTop: 0.2, segs: 6 });
        b.cyl(0.2, 0.1, P.castIron, { at: [0, -1.02, out], segs: 6 });
      });
    };
    lamp([X1 + 0.12, 4.3, ZF + 0.12], Math.PI / 4, 0.75);
    lamp([-5.1, 4.25, ZF + 0.22], 0, 0.6);
    lamp([X1 + 0.22, 4.25, 1.8], Math.PI / 2, 0.6);

    // ---------------- side wing along the side street: billiard room and kitchen, two storeys
    const WX0 = 3.6;
    const WZ0 = -10.2;
    const wH = G + F1;
    const wd = ZR - WZ0;
    const wz = (ZR + WZ0) / 2;
    b.box(X1 - WX0, wH, wd, brick, { at: [(X1 + WX0) / 2, 0, wz] });
    b.box(X1 - WX0 + 0.06, 0.5, wd + 0.06, tint(tileC, -0.1), { at: [(X1 + WX0) / 2, 0, wz] });
    b.box(X1 - WX0 + 0.1, 0.22, wd + 0.1, stone, { at: [(X1 + WX0) / 2, G - 0.1, wz] });
    b.gable(X1 - WX0, wd, ((X1 - WX0) / 2) * PITCH, slate, { at: [(X1 + WX0) / 2, wH, wz], ridge: 'z', overhang: 0.25, wall: brick });
    for (const z of [-8.4, -5.8, -3.2]) {
      sash(X1, 1.2, z, 2.4, '+x', false, true);
      sash(X1, G + 0.6, z, 1.9, '+x', false, true);
    }
    pubDoor(X1 + 0.05, -1.1, '+x'); // the jug-and-bottle door for off-sales
    for (const z of [-8, -4.5]) sash(WX0, G + 0.6, z, 1.9, '-x', false, true);
    b.panel(1.1, 2.3, P.doorGreen, { at: [WX0, 0, -2.4], facing: '-x' });
    b.window(1.2, 1.4, { at: [(X1 + WX0) / 2, wH + 0.4, WZ0], facing: '-z', frame: P.white, bars: [2, 2] });

    // back of the main block
    for (const x of [-8.4, -5.4, -2.4, 0.6]) {
      sash(x, 1.2, ZR, 2.2, '-z', false, true);
      sash(x, G + 0.7, ZR, 2.0, '-z', false, true);
      sash(x, G + F1 + 0.6, ZR, 1.7, '-z', false, true);
    }
    b.panel(1.1, 2.3, P.doorGreen, { at: [2.4, 0, ZR], facing: '-z' });

    // ---------------- yard wall, gates and the outside gents
    b.box(X1 - X0 - (X1 - WX0), 2.3, 0.35, brick, { at: [(X0 + WX0) / 2, 0, -10.2] });
    b.box(0.35, 2.3, 11.2, brick, { at: [X0 + 0.18, 0, -4.6] });
    b.box(0.4, 0.12, 11.2, stone, { at: [X0 + 0.18, 2.3, -4.6] });
    b.box(X1 - X0 - (X1 - WX0), 0.12, 0.4, stone, { at: [(X0 + WX0) / 2, 2.3, -10.2] });
    b.panel(3.0, 2.2, P.doorGreen, { at: [X0, 0, -6.0], facing: '-x', depth: 0.1 });
    b.box(4.0, 2.6, 2.2, brick, { at: [X0 + 2.4, 0, -8.9] });
    b.shed(4.2, 2.4, 0.6, slate, { at: [X0 + 2.4, 2.6, -8.9], high: '-z' });
    b.panel(0.9, 2.0, P.doorGreen, { at: [X0 + 2.4, 0, -7.8], facing: '+z' });
    // beer barrels waiting by the cellar flap
    b.box(1.6, 0.15, 1.0, P.castIron, { at: [-4.0, 0, ZR - 0.8] });
    for (const x of [-1.0, -0.3]) b.log(0.32, 0.8, P.oak, { at: [x, 0, ZR - 1.4], axis: 'z', segs: 8 });

    // ---------------- colliders
    b.collider(X1 - X0, dep, { at: [0, 0, zm] });
    b.collider(X1 - WX0, wd, { at: [(X1 + WX0) / 2, 0, wz] });
    b.collider(4.0, 2.2, { at: [X0 + 2.4, 0, -8.9] });
    b.collider(X1 - X0 - (X1 - WX0), 0.4, { at: [(X0 + WX0) / 2, 0, -10.2] });
    b.collider(0.4, 11.2, { at: [X0 + 0.18, 0, -4.6] });
  },
};
