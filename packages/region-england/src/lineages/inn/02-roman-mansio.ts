import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { ground } from './shared';

// plan: ranges 5 m deep round a courtyard; front faces the road (+Z)
const X0 = -9.5;
const X1 = 9.5;
const ZF = 9; // front wall
const ZB = -9.6; // back wall
const DEP = 5; // range depth
const H = 3.6; // wall height of the guest ranges
const HS = 3.2; // stable range
const PITCH = 0.47; // rise per metre of half-span, about 25 degrees

/**
 * Imbrex lines down both slopes of a gable roof, to show the Roman tegula-and-imbrex covering.
 * `hw` is the half-span at the wall, `ov` the eaves overhang, `at` the roof base centre (wall top).
 */
function imbrices(b: Builder, len: number, hw: number, ov: number, rise: number, color: number, along: 'x' | 'z', at: [number, number, number]): void {
  const n = Math.floor(len / 0.9);
  const run = hw + ov;
  const slope = Math.hypot(run, (rise * run) / hw);
  const ang = Math.atan2(rise, hw);
  const off = run / 2;
  const y = at[1] + rise * (1 - off / hw) + 0.13;
  for (const s of [1, -1]) {
    for (const p of spread(n, -len / 2 + 0.3, len / 2 - 0.3)) {
      if (along === 'x') {
        b.box(0.12, 0.08, slope, color, { at: [at[0] + p, y - 0.04, at[2] + s * off], rot: [s * ang, 0, 0], jitter: false });
      } else {
        b.box(slope, 0.08, 0.12, color, { at: [at[0] + s * off, y - 0.04, at[2] + p], rot: [0, 0, -s * ang], jitter: false });
      }
    }
  }
}

export const romanMansio: BuildingDef = {
  id: 'roman-mansio',
  name: 'Mansio',
  style: 'Romano-British',
  date: 'c. AD 100',
  summary:
    'The Roman state ran an official posting service, the cursus publicus, and every day’s journey along its roads ended at a mansio, where officials with a travel warrant could eat, sleep, bathe and change horses. ' +
    'It is a Mediterranean courtyard house transplanted to Britain: mortared masonry walls, rendered and painted, under low-pitched roofs of fired clay tile, all quite new to the island. ' +
    'Guest rooms open off a portico round the yard, the stables fill the back range and a small bath suite projects at one side.',
  materials: ['mortared stone', 'lime render', 'fired clay roof tile', 'oak'],
  lookFor: [
    { label: 'Courtyard plan', note: 'Four ranges turn their backs to the road and open onto a private yard, the plan of a Roman town house.', at: [0, 0.6, -0.5] },
    { label: 'Tegulae and imbrices', note: 'Flat tiles with raised edges (tegulae), their joints capped by half-round tiles (imbrices) that make the ribbed stripes.', at: [-5, 4.6, 7.2] },
    { label: 'Portico', note: 'A covered walk on columns along the street front, giving shade, shelter and a dignified face to the road.', at: [4.4, 2.3, 10.6] },
    { label: 'Stable range', note: 'Fresh horses for the imperial post were kept here, with wide doors opening onto the yard.', at: [-2.5, 1.6, ZB + DEP + 0.2] },
    { label: 'Bath suite', note: 'Even a roadside inn had heated baths. The apse held a warm plunge pool, heated from the furnace by the flue.', at: [X1 + 1.3, 2.0, -0.6] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const render = b.pick([P.limewash, P.plaster, tint(P.plaster, 0.03)]);
    const dado = b.pick([P.sandstoneRed, tint(P.terracotta, -0.08)]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04), P.terracotta]);
    const imbrex = tint(tile, -0.08);
    const stone = P.limestone;
    const zFr = ZF - DEP; // inner face of front range
    const zBr = ZB + DEP; // inner face of back range
    const zM = (zFr + zBr) / 2;
    const sideLen = zFr - zBr;

    // gravel yard and road verge
    ground(b, 21, 21.6, P.gravel, [0, -0.3]);
    ground(b, 21, 1.8, tint(P.gravel, -0.08), [0, 10.0], 0.05);

    // ---- walls: plinth, rendered body, red-painted dado band
    const block = (w: number, d: number, x: number, z: number, h: number) => {
      b.box(w + 0.2, 0.35, d + 0.2, stone, { at: [x, 0, z] });
      b.box(w, h, d, render, { at: [x, 0, z] });
      b.box(w + 0.04, 0.5, d + 0.04, dado, { at: [x, 0.35, z] });
    };
    const gw = 3.0; // gate passage width
    const fw = (X1 - X0 - gw) / 2;
    block(fw, DEP, X0 + fw / 2, ZF - DEP / 2, H);
    block(fw, DEP, X1 - fw / 2, ZF - DEP / 2, H);
    block(DEP, sideLen, X0 + DEP / 2, zM, H);
    block(DEP, sideLen, X1 - DEP / 2, zM, H);
    block(X1 - X0, DEP, 0, ZB + DEP / 2, HS);

    // gateway: arched faces front and back with a passage between
    for (const [z, f] of [[ZF, '+z'], [zFr, '-z']] as const) {
      b.archWall(gw, H, 0.3, render, { at: [0, 0, z - (f === '+z' ? 0.15 : -0.15)], facing: f, openings: 1, openW: 2.4, openH: 3.0, shape: 'round' });
    }
    b.box(gw, 0.35, DEP, render, { at: [0, H - 0.35, ZF - DEP / 2] });
    // voussoir ring in stone on the street face
    b.panel(2.9, 3.25, stone, { at: [0, 0.35, ZF], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(2.4, 3.0, P.soil, { at: [0, 0, ZF], facing: '+z', shape: 'round', depth: 0.08 });

    // ---- roofs, low pitched; side-range roofs run on into the front and back roofs
    const rf = (DEP / 2) * PITCH;
    b.gable(X1 - X0, DEP, rf, tile, { at: [0, H, ZF - DEP / 2], overhang: 0.4, wall: render });
    b.gable(X1 - X0, DEP, rf, tile, { at: [0, HS, ZB + DEP / 2], overhang: 0.4, wall: render });
    b.sym((s) => {
      const x = s > 0 ? X1 - DEP / 2 : X0 + DEP / 2;
      b.gable(DEP, sideLen + DEP, rf, tile, { at: [x, H, zM + DEP / 4], ridge: 'z', overhang: 0.4, wall: render });
      imbrices(b, sideLen - 1, DEP / 2, 0.4, rf, imbrex, 'z', [x, H, zM]);
    });
    imbrices(b, X1 - X0, DEP / 2, 0.4, rf, imbrex, 'x', [0, H, ZF - DEP / 2]);
    imbrices(b, X1 - X0, DEP / 2, 0.4, rf, imbrex, 'x', [0, HS, ZB + DEP / 2]);
    // ridge tiles
    b.box(X1 - X0 + 0.8, 0.14, 0.24, imbrex, { at: [0, H + rf + 0.05, ZF - DEP / 2] });
    b.box(X1 - X0 + 0.8, 0.14, 0.24, imbrex, { at: [0, HS + rf + 0.05, ZB + DEP / 2] });

    // ---- street portico
    const pz = ZF + 1.5;
    const ph = 2.7;
    for (const x of spread(10, X0 + 0.4, X1 - 0.4)) {
      if (Math.abs(x) < 1.6) continue;
      b.column(0.17, ph, stone, { at: [x, 0.3, pz], order: 'tuscan' });
    }
    b.box(X1 - X0, 0.3, 1.9, stone, { at: [0, 0, ZF + 0.9] });
    b.box(X1 - X0, 0.25, 0.3, render, { at: [0, ph + 0.3, pz] });
    b.shed(X1 - X0 + 0.2, 1.9, 0.6, tile, { at: [0, ph + 0.55, ZF + 0.95], high: '-z' });

    // ---- courtyard portico on the two side ranges
    b.sym((s) => {
      const xin = s > 0 ? X1 - DEP : X0 + DEP;
      const xc = xin - s * 1.4;
      for (const z of spread(5, zBr + 1, zFr - 1)) b.column(0.14, 2.6, render, { at: [xc, 0, z], order: 'plain' });
      b.box(0.25, 0.25, sideLen - 0.4, render, { at: [xc, 2.6, zM] });
      b.shed(1.7, sideLen - 0.2, 0.55, tile, { at: [xin - s * 0.75, 2.85, zM], high: s > 0 ? '+x' : '-x' });
      // guest-room doors and windows on the yard
      for (const z of spread(4, zBr + 1.2, zFr - 1.2)) {
        b.panel(1.0, 2.1, P.oakDark, { at: [xin, 0.15, z], facing: s > 0 ? '-x' : '+x' });
      }
    });

    // ---- small high windows on the outer walls
    const win = (x: number, y: number, z: number, f: '+z' | '-z' | '+x' | '-x') =>
      b.window(0.7, 0.8, { at: [x, y, z], facing: f, frame: stone, bars: [2, 2], border: 0.08 });
    for (const x of [-7.6, -4.6, 4.6, 7.6]) win(x, 1.9, ZF, '+z');
    for (const x of [-7.5, -4.5, -1.5, 1.5, 4.5]) win(x, 1.8, ZB, '-z');
    for (const z of spread(3, zBr + 1, zFr - 1)) win(X0, 2.0, z, '-x');
    for (const z of [ZF - 2.5, ZB + 2.5]) {
      win(X0, 2.0, z, '-x');
      win(X1, 2.0, z, '+x');
    }

    // ---- stables: wide doors onto the yard, a loft hatch
    for (const x of spread(4, -4.4, 4.4)) {
      b.panel(1.8, 2.3, tint(P.oak, -0.05), { at: [x, 0.2, zBr], facing: '+z' });
      b.panel(0.1, 2.3, P.oakDark, { at: [x, 0.2, zBr + 0.06], facing: '+z' });
    }
    b.box(3.0, 0.5, 0.6, P.rubble, { at: [6.2, 0, zBr + 1.0] }); // water trough
    b.box(2.8, 0.06, 0.45, P.water, { at: [6.2, 0.48, zBr + 1.0], jitter: false });

    // ---- bath suite on the east: apse with a warm plunge and a furnace flue
    b.group({ at: [X1, 0, -0.6] }, () => {
      b.cyl(1.5, 0.35, stone, { segs: 12 });
      b.cyl(1.4, 3.0, render, { segs: 12 });
      b.cyl(1.42, 0.5, dado, { at: [0, 0.35, 0], segs: 12 });
      b.dome(1.45, tile, { at: [0, 3.0, 0], squash: 0.45, segs: 12 });
      b.window(0.5, 0.6, { at: [1.38, 2.0, 0], facing: '+x', frame: stone, border: 0.06 });
    });
    b.box(0.6, 0.9, 0.6, P.brickRed, { at: [X1 - 1.4, H + rf - 0.3, -4.2] });

    // ---- yard: well head
    b.cyl(0.7, 0.75, stone, { at: [0, 0, zM], segs: 10 });
    b.cyl(0.52, 0.06, P.windowDark, { at: [0, 0.72, zM], segs: 10 });
    b.sym((s) => b.box(0.12, 1.6, 0.12, P.oak, { at: [s * 0.6, 0.75, zM] }));
    b.box(1.4, 0.12, 0.12, P.oak, { at: [0, 2.3, zM] });

    // milestone by the road
    b.cyl(0.3, 1.5, P.limestone, { at: [X1 - 0.4, 0, 10.6], segs: 10 });

    // ---- colliders: each range is solid, the gate and yard are open
    b.collider(fw, DEP, { at: [X0 + fw / 2, 0, ZF - DEP / 2] });
    b.collider(fw, DEP, { at: [X1 - fw / 2, 0, ZF - DEP / 2] });
    b.collider(DEP, sideLen, { at: [X0 + DEP / 2, 0, zM] });
    b.collider(DEP, sideLen, { at: [X1 - DEP / 2, 0, zM] });
    b.collider(X1 - X0, DEP, { at: [0, 0, ZB + DEP / 2] });
    b.collider(2.8, 2.8, { at: [X1, 0, -0.6] });
    b.collider(1.4, 1.4, { at: [0, 0, zM] });
  },
};
