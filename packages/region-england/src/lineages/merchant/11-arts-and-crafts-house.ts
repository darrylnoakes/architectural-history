import { P, linspace, tint, type Builder, type BuildingDef } from '@ah/kit';
import { beam } from './shared';

type Side = '+z' | '-z' | '+x' | '-x';
const ROT: Record<Side, number> = { '+z': -Math.PI / 2, '-z': Math.PI / 2, '+x': 0, '-x': Math.PI };

/** A battered (sloping) buttress against a wall: wide at the foot, narrowing to the top. */
function batteredButtress(b: Builder, x: number, z: number, side: Side, h: number, proj: number, w: number, color: number) {
  b.extrude([[0, 0], [proj, 0], [0.22, h], [0, h]], w, color, { at: [x, 0, z], rotY: ROT[side] });
}

/** A tall roughcast chimney, slightly tapering, with an oversailing flat cap. */
function voyseyChimney(b: Builder, x: number, y: number, z: number, h: number, color: number) {
  b.cyl(0.78, h, color, { at: [x, y, z], rTop: 0.62, segs: 4, rotY: Math.PI / 4 });
  b.box(1.15, 0.12, 1.15, tint(color, -0.08), { at: [x, y + h, z] });
  b.box(0.75, 0.2, 0.75, color, { at: [x, y + h + 0.12, z] });
  b.box(1.0, 0.08, 1.0, tint(color, -0.08), { at: [x, y + h + 0.32, z] });
}

export const artsAndCraftsHouse: BuildingDef = {
  id: 'arts-and-crafts-house',
  name: 'Arts and Crafts house',
  style: 'Arts and Crafts',
  date: 'c. 1905',
  summary:
    'Turning away from machine-made Victorian ornament, architects such as C. F. A. Voysey looked back to the farmhouses and cottages of the English countryside. ' +
    'The house is long and low, its walls coated in white roughcast and braced by sloping buttresses, its big plain roof brought down over the upper windows and swept low over the porch. ' +
    'Windows are long rows of small leaded casements in stone mullions. Decoration is limited to good craftsmanship: hand-forged iron brackets, plank doors on long strap hinges, green-painted woodwork.',
  materials: ['roughcast render', 'green slate', 'Bath stone dressings', 'wrought iron', 'oak'],
  modelledOn: 'The houses of C. F. A. Voysey, such as Broadleys, Windermere (1898) and The Orchard, Chorleywood (1899–1900)',
  lookFor: [
    { label: 'Roughcast walls', note: 'Render with small stones mixed in, thrown on wet and limewashed white: cheap, weatherproof and plain.', at: [-6.5, 1.6, 9.1] },
    { label: 'Battered buttresses', note: 'Buttresses that slope inward as they rise, giving the low house a sturdy, rooted look.', at: [-8.0, 1.4, 9.8] },
    { label: 'Bands of casements', note: 'Long rows of small leaded casement windows between stone mullions, tucked up under the eaves.', at: [-5.4, 4.0, 9.3] },
    { label: 'Sweeping roof and catslide', note: 'The roof dominates, coming down low over the walls and sweeping down further over the porch.', at: [-1.5, 4.0, 11.0] },
    { label: 'Iron gutter brackets', note: 'Thin wrought-iron brackets carry the gutter on its own, without a fascia board: a Voysey signature.', at: [-3.8, 5.3, 9.7] },
  ],
  influences: ['arts-and-crafts-export'],
  build(b) {
    const render = b.pick([P.whiteRender, P.limewash, tint(P.whiteRender, -0.02)]);
    const slate = b.pick([0x5f6e66, 0x66736a, P.slate]);
    const stone = P.bathStone;
    const green = b.pick([0x3d6b4a, P.doorGreen]);
    const iron = P.black;
    const W = 17;
    const zb = 1.0;
    const zf = 9.0;
    const zc = (zf + zb) / 2;
    const D = zf - zb;
    const H = 5.2; // low eaves: the roof comes down to the first-floor window heads

    // ---- main range
    b.box(W, H, D, render, { at: [0, 0, zc] });
    b.box(W + 0.06, 0.3, D + 0.06, tint(render, -0.12), { at: [0, 0, zc] });
    const rh = 4.4;
    const ov = 0.65;
    b.gable(W, D, rh, slate, { at: [0, H, zc], overhang: ov, wall: render, thick: 0.18 });
    b.box(W + 1.4, 0.16, 0.26, tint(slate, -0.08), { at: [0, H + rh + 0.1, zc] });
    // gutters on iron brackets along both eaves
    const drop = (ov * rh) / (D / 2);
    for (const sz of [1, -1]) {
      const gz = zc + sz * (D / 2 + ov - 0.05);
      b.box(W + 1.3, 0.14, 0.16, iron, { at: [0, H - drop - 0.16, gz] });
      for (const x of linspace(13, -W / 2 + 0.3, W / 2 - 0.3)) {
        beam(b, [x, H - 0.75, zc + sz * (D / 2)], [x, H - drop - 0.12, gz], 0.04, iron, 0.06);
        b.box(0.04, 0.45, 0.06, iron, { at: [x, H - 0.75, zc + sz * (D / 2 + 0.03)] });
      }
    }

    // ---- gabled wing at the right, projecting forward
    const gx = 5.4;
    const gw = 5.2;
    const gz0 = zf - 1;
    const gz1 = 10.6;
    b.box(gw, H, gz1 - gz0, render, { at: [gx, 0, (gz0 + gz1) / 2] });
    b.gable(gw, gz1 - gz0 + 0.4, 3.0, slate, { at: [gx, H, (gz0 + gz1) / 2 + 0.2], ridge: 'z', overhang: 0.45, wall: render, thick: 0.18 });
    b.box(gw - 0.2, 0.12, 0.08, tint(render, -0.1), { at: [gx, H - 0.06, gz1 + 0.02] });
    // a wide window of the hall in the gable front, small one in the apex
    b.window(3.6, 1.6, { at: [gx, 1.1, gz1], facing: '+z', frame: stone, bars: [6, 2], border: 0.12 });
    b.window(2.6, 1.0, { at: [gx, 3.5, gz1], facing: '+z', frame: stone, bars: [4, 2], border: 0.12 });
    b.window(0.8, 0.7, { at: [gx, H + 0.9, gz1 + 0.2], facing: '+z', frame: stone, bars: [2, 1] });

    // ---- battered buttresses at the corners and along the front
    for (const sx of [-1, 1]) {
      batteredButtress(b, sx * (W / 2 - 0.35), zb, '-z', 3.4, 0.9, 0.55, render);
      batteredButtress(b, sx * (W / 2), zb + 0.45, sx > 0 ? '+x' : '-x', 3.4, 0.9, 0.55, render);
    }
    batteredButtress(b, -W / 2 + 0.35, zf, '+z', 3.4, 0.9, 0.55, render);
    batteredButtress(b, -W / 2, zf - 0.45, '-x', 3.4, 0.9, 0.55, render);
    batteredButtress(b, gx - gw / 2 + 0.3, gz1, '+z', 3.4, 0.9, 0.55, render);
    batteredButtress(b, gx + gw / 2 - 0.3, gz1, '+z', 3.4, 0.9, 0.55, render);
    batteredButtress(b, -3.6, zf, '+z', 3.2, 0.8, 0.5, render);

    // ---- long bands of leaded casements in stone mullions
    const band = (x: number, y: number, z: number, w: number, h: number, facing: Side) => {
      const lights = Math.max(2, Math.round(w / 0.55));
      b.window(w, h, { at: [x, y, z], facing, frame: stone, bars: [lights, 2], border: 0.1 });
    };
    band(-5.4, 3.3, zf, 5.4, 1.15, '+z');
    band(-5.4, 0.9, zf, 3.8, 1.4, '+z');
    band(0.5, 3.3, zf, 2.6, 1.15, '+z');
    band(-4.5, 3.3, zb, 6.2, 1.15, '-z');
    band(3.5, 3.3, zb, 4.0, 1.15, '-z');
    band(-4.5, 0.9, zb, 4.6, 1.4, '-z');
    band(4.0, 0.9, zb, 3.4, 1.4, '-z');
    for (const sx of [-1, 1]) {
      band(sx * W / 2, 3.3, zc, 2.2, 1.15, sx > 0 ? '+x' : '-x');
      band(sx * W / 2, H + 1.3, zc, 1.1, 0.9, sx > 0 ? '+x' : '-x');
    }

    // ---- porch under a catslide: the front slope of the roof swept down low
    const px0 = -2.8;
    const px1 = 2.2;
    const cw = px1 - px0;
    const cx = (px0 + px1) / 2;
    const slope = rh / (D / 2);
    const ext = 2.0; // how far the catslide runs out past the eaves
    const zEave = zf + ov;
    const yEave = H - drop;
    const ySlide = yEave - ext * slope;
    // continue the plane of the roof down and out
    beam(b, [cx, yEave + 0.1, zEave - 0.4], [cx, ySlide + 0.1, zEave + ext], cw, slate, 0.2);
    b.sym((s) => {
      b.extrude([[0, 0], [0, yEave - 0.1], [ext + 0.4, ySlide - 0.15], [ext + 0.4, 0]], 0.4, render, { at: [cx + s * (cw / 2 - 0.2), 0, zf], rotY: -Math.PI / 2 });
    });
    // green door with long strap hinges, set back in the porch, and a heart-pierced letter plate
    b.panel(1.3, 2.2, green, { at: [cx, 0.15, zf], facing: '+z', depth: 0.08 });
    for (const y of [0.6, 1.8]) b.box(1.0, 0.07, 0.03, iron, { at: [cx - 0.1, 0.15 + y, zf + 0.1] });
    b.panel(0.6, 0.5, P.windowDark, { at: [cx + 1.5, 1.2, zf], facing: '+z' });
    b.box(cw - 0.8, 0.05, ext + 0.4, P.paving, { at: [cx, 0, zf + (ext + 0.4) / 2] });

    // ---- tall chimneys
    voyseyChimney(b, -2.0, H + 1.0, zc - 0.6, 5.2, render);
    voyseyChimney(b, -W / 2 + 0.6, 2.0, zc, H + rh - 0.4, render);

    // ---- a single-storey service wing at the back, its roof a lean-to catslide
    b.box(5.5, 2.8, 3.8, render, { at: [-4.5, 0, zb - 1.9] });
    b.shed(6.2, 4.3, 1.6, slate, { at: [-4.5, 2.8, zb - 1.9], high: '+z' });
    band(-4.5, 0.9, zb - 3.8, 3.0, 1.2, '-z');
    b.panel(1.0, 2.0, green, { at: [-7.25, 0, zb - 2.2], facing: '-x' });

    // ---- garden: low stone wall, flagged path, lawn, a water butt and an orchard tree
    b.sym((s) => b.box(8.0, 0.75, 0.4, P.rubble, { at: [s * 5.8, 0, 11.8] }));
    b.box(1.4, 0.04, 2.2, P.paving, { at: [cx, 0, 11.4] });
    b.box(18, 0.04, 9, P.grass, { at: [0, 0, -6.8] });
    b.cyl(0.4, 0.9, P.oak, { at: [-W / 2 - 0.55, 0, zf - 1.6], segs: 10 });
    b.tree(6, { at: [5.5, 0, -7.5], kind: 'round' });
    b.tree(5, { at: [-1.5, 0, -9], kind: 'round', color: P.leaf });
    b.box(1.8, 1.2, 0.8, P.hedge, { at: [-8.8, 0, 11.2] });
  },
};
