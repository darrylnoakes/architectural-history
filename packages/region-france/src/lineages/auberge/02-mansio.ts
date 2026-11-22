import { P, spread, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { cart, ground, horse } from './shared';

const XO = 10.2;
const ZF = 10.0; // street face
const ZFI = 5.0; // court face of the front range
const ZB = -10.2;
const ZBI = -5.4; // court face of the stables
const XW = -5.6; // court face of the west range (guest rooms)
const XE = 5.4; // court face of the east range (bath and kitchen)
const XEO = 9.2; // outer face of the east range
const H = 3.8; // storey height
const AW = 3.4; // carriage gate
const PITCH = 0.42; // tile roofs, about 23 degrees

/** A roof of Roman tiles: flat tegulae with the raised lines of the imbrices that cover their joints. */
function tegulaRoof(b: Builder, w: number, d: number, color: number, o: { at: Vec3; ridge?: 'x' | 'z'; wall?: number; ov?: number }): void {
  const along = o.ridge ?? 'x';
  const ov = o.ov ?? 0.45;
  const hw = (along === 'x' ? d : w) / 2;
  const rise = hw * PITCH;
  b.gable(w, d, rise, color, { at: o.at, ridge: along, overhang: ov, wall: o.wall, thick: 0.14 });
  const len = (along === 'x' ? w : d) + ov * 2;
  const run = hw + ov;
  const ang = Math.atan2(rise, hw);
  const slope = run / Math.cos(ang);
  const mid = run / 2;
  const midY = o.at[1] + rise * (1 - mid / hw) + 0.14 / Math.cos(ang) - 0.02;
  const rib = tint(color, -0.08);
  const n = Math.max(2, Math.floor(len / 1.05));
  for (const s of [1, -1]) {
    for (const p of spread(n, -len / 2 + 0.2, len / 2 - 0.2)) {
      if (along === 'x') b.box(0.11, 0.06, slope, rib, { at: [o.at[0] + p, midY, o.at[2] + s * mid], rot: [s * ang, 0, 0], jitter: false });
      else b.box(slope, 0.06, 0.11, rib, { at: [o.at[0] + s * mid, midY, o.at[2] + p], rot: [0, 0, -s * ang], jitter: false });
    }
  }
  if (along === 'x') b.box(len, 0.16, 0.3, rib, { at: [o.at[0], o.at[1] + rise + 0.04, o.at[2]], jitter: false });
  else b.box(0.3, 0.16, len, rib, { at: [o.at[0], o.at[1] + rise + 0.04, o.at[2]], jitter: false });
}

/** Courses of tile laid through a rubble wall at intervals, the mark of Gallo-Roman masonry. */
function tileBands(b: Builder, w: number, d: number, top: number, color: number, at: [number, number]): void {
  for (let y = 0.9; y < top - 0.3; y += 1.1) b.box(w + 0.03, 0.12, d + 0.03, color, { at: [at[0], y, at[1]], jitter: false });
}

export const mansio: BuildingDef = {
  id: 'mansio',
  name: 'Mansio (road station)',
  style: 'Gallo-Roman',
  date: 'c. AD 50',
  summary:
    'Rome ran an official post, the cursus publicus, along the roads that Agrippa laid out across Gaul from Lyon. At the end of each day’s stage stood a mansio, where an official or courier carrying a warrant got a bed, a meal, a bath and fresh animals; smaller stations between (mutationes) only changed horses. ' +
    'It is built in the Roman way the Gauls had quickly learned: small squared stone laid in mortar with courses of tile running through it, plastered inside, under roofs of flat tiles and half-round cover tiles. ' +
    'The rooms are arranged round a court entered through one carriage gate, with the stables across the back and a little bath suite heated from below. That plan, a closed yard behind an arch, is the one every inn on this plot will follow.',
  materials: ['limestone rubble and mortar', 'tile courses', 'lime plaster', 'tegula and imbrex roof tiles', 'oak'],
  lookFor: [
    { label: 'Carriage gate', note: 'The only way in: an arched gate wide enough for a travelling carriage, which could be shut at night.', at: [0, 3.6, ZF + 0.3] },
    { label: 'Bath suite', note: 'Cold, warm and hot rooms in a row, the hot room ending in a rounded apse. The floors stood on little brick pillars (a hypocaust) so the furnace’s heat could pass beneath.', at: [XEO + 1.0, 2.6, -3.7] },
    { label: 'Furnace', note: 'The praefurnium: an arched stoke-hole where a slave fed the fire that heated the bath, with its woodpile beside it.', at: [XEO + 0.4, 1.0, -0.6] },
    { label: 'Stables', note: 'Stalls across the back of the court for the post animals and the guests’ horses and mules, open on the yard behind a row of posts.', at: [-3.0, 2.2, ZBI + 0.4] },
    { label: 'Milestone', note: 'A stone column by the road giving the distance to the next town. In Gaul, unlike the rest of the empire, distances came to be given in Gaulish leagues rather than Roman miles.', at: [7.4, 1.8, ZF + 0.6] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const stone = b.pick([P.pierreBlonde, tint(P.pierreBlonde, -0.04), P.limestone]);
    const plaster = b.pick([P.limewash, P.plaster]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04)]);
    const band = P.brickRed;
    const wood = P.oak;

    ground(b, 21.0, 1.0, P.gravel, [0, ZF + 0.5], 0.05);
    ground(b, XE - XW, ZFI - ZBI, tint(P.gravel, 0.04), [(XE + XW) / 2, (ZFI + ZBI) / 2], 0.04);

    // ---------------- front range with the carriage gate
    const fz = (ZF + ZFI) / 2;
    const fd = ZF - ZFI;
    const fw = XO - AW / 2;
    b.sym((s) => {
      b.box(fw, H, fd, stone, { at: [s * (AW / 2 + fw / 2), 0, fz] });
      tileBands(b, fw, fd, H, band, [s * (AW / 2 + fw / 2), fz]);
    });
    b.box(AW, 0.8, fd, stone, { at: [0, H - 0.8, fz] });
    b.box(AW, 0.06, fd, P.paving, { at: [0, 0, fz], jitter: false });
    for (const [z, f] of [[ZF, '+z'], [ZFI, '-z']] as const) {
      b.archWall(AW + 0.6, H, 0.2, stone, { at: [0, 0, z + (f === '+z' ? 0.1 : -0.1)], facing: f, openings: 1, openW: AW, openH: H - 0.4 });
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (i / 8);
        const r = AW / 2 + 0.15;
        b.panel(0.18, 0.4, band, { at: [Math.cos(a) * r, H - 0.4 - AW / 2 + Math.sin(a) * r - 0.2, z], facing: f, depth: 0.12, rot: [0, 0, a - Math.PI / 2] });
      }
    }
    // two leaves of the gate, folded back inside the passage
    b.sym((s) => b.box(0.1, 3.0, AW / 2, wood, { at: [s * (AW / 2 - 0.1), 0, ZF - 0.9] }));
    // small high windows on the street, a door to the street room
    for (const x of [-8.4, -5.2, 5.2, 8.4]) {
      b.window(0.6, 0.8, { at: [x, 2.3, ZF], facing: '+z', frame: stone, glass: P.windowDark, bars: [2, 1], border: 0.08 });
      b.window(0.6, 0.8, { at: [x, 2.3, ZFI], facing: '-z', frame: stone, glass: P.windowDark, border: 0.08 });
    }
    b.panel(1.1, 2.3, wood, { at: [-3.1, 0, ZF], facing: '+z', shape: 'rect' });
    b.panel(1.4, 0.25, stone, { at: [-3.1, 2.3, ZF], facing: '+z', depth: 0.1 });
    tegulaRoof(b, 2 * XO, fd, tile, { at: [0, H, fz], wall: stone });

    // ---------------- west range: guest rooms behind a portico on the court
    const wz = (ZFI + ZBI) / 2;
    const wl = ZFI - ZBI;
    const ww = XW + XO - 1.8; // rooms; the last 1.8 m to the court is the portico
    const wx = -XO + ww / 2;
    b.box(ww, H - 0.4, wl, stone, { at: [wx, 0, wz] });
    tileBands(b, ww, wl, H - 0.4, band, [wx, wz]);
    const px = -XO + ww; // back wall of the portico
    for (const z of spread(5, ZBI + 0.4, ZFI - 0.4)) {
      b.cyl(0.13, H - 0.75, wood, { at: [XW - 0.2, 0.35, z], segs: 6 });
      b.box(0.4, 0.35, 0.4, stone, { at: [XW - 0.2, 0, z] });
    }
    b.box(0.3, 0.25, wl, wood, { at: [XW - 0.2, H - 0.4, wz] });
    b.box(1.8, 0.12, wl, P.paving, { at: [px + 0.9, 0, wz], jitter: false });
    for (const z of spread(4, ZBI + 1.2, ZFI - 1.2)) {
      b.panel(0.9, 2.1, wood, { at: [px, 0.1, z - 0.6], facing: '+x' });
      b.window(0.5, 0.6, { at: [px, 2.2, z + 0.6], facing: '+x', frame: plaster, border: 0.06 });
      b.window(0.5, 0.6, { at: [-XO, 2.4, z], facing: '-x', frame: stone, border: 0.06 });
    }
    b.panel(ww - 0.2, 0.7, P.intonacoRed, { at: [px, 0, wz], facing: '+x', depth: 0.01 });
    tegulaRoof(b, XW + XO, wl, tile, { at: [(XW - XO) / 2, H - 0.4, wz], ridge: 'z', wall: stone });

    // ---------------- east range: kitchen and dining room at the front, bath suite at the back
    const ex = (XE + XEO) / 2;
    const ew = XEO - XE;
    const ez0 = -0.6; // where the bath begins
    b.box(ew, H - 0.4, ZFI - ez0, stone, { at: [ex, 0, (ZFI + ez0) / 2] });
    tileBands(b, ew, ZFI - ez0, H - 0.4, band, [ex, (ZFI + ez0) / 2]);
    b.panel(1.0, 2.2, wood, { at: [XE, 0, 2.6], facing: '-x' });
    b.window(0.7, 0.8, { at: [XE, 2.0, 0.8], facing: '-x', frame: plaster, border: 0.06 });
    b.window(0.6, 0.7, { at: [XEO, 2.3, 2.6], facing: '+x', frame: stone, border: 0.06 });
    tegulaRoof(b, ew, ZFI - ez0, tile, { at: [ex, H - 0.4, (ZFI + ez0) / 2], ridge: 'z', wall: stone });
    // kitchen chimney: a smoke vent in the roof
    b.box(0.5, 0.6, 0.5, tile, { at: [ex, H + 0.4, 3.0] });
    // the bath: three rooms stepping down in height from the hot end
    const bh = H - 0.2;
    b.box(ew, bh, ez0 - ZBI, plaster, { at: [ex, 0, (ez0 + ZBI) / 2] });
    b.box(ew + 0.04, 0.5, ez0 - ZBI + 0.04, stone, { at: [ex, 0, (ez0 + ZBI) / 2] });
    for (const z of [ez0 - 0.05, -3.0]) b.box(ew + 0.08, 0.14, 0.12, band, { at: [ex, bh - 0.4, z] });
    for (const z of [-1.8, -4.1]) {
      b.window(0.5, 0.5, { at: [XE, bh - 1.1, z], facing: '-x', frame: P.white, glass: P.glassGreen, border: 0.05 });
    }
    b.panel(0.9, 2.0, wood, { at: [XE, 0, -1.0], facing: '-x' });
    tegulaRoof(b, ew, ez0 - ZBI, tile, { at: [ex, bh, (ez0 + ZBI) / 2], ridge: 'z', wall: plaster, ov: 0.3 });
    // the apse of the hot room, bulging out on the side street
    const az = -3.7;
    const ar = 1.3;
    b.lathe([[ar, 0], [ar, bh - 0.6]], plaster, { at: [XEO, 0, az], start: 0, sweep: Math.PI, segs: 8 });
    b.lathe([[ar + 0.02, 0], [ar + 0.02, 0.5]], stone, { at: [XEO, 0, az], start: 0, sweep: Math.PI, segs: 8 });
    b.lathe([[ar + 0.25, bh - 0.7], [0.05, bh + 0.25]], tile, { at: [XEO, 0, az], start: 0, sweep: Math.PI, segs: 8 });
    b.window(0.45, 0.55, { at: [XEO + ar, bh - 1.4, az], facing: '+x', frame: P.white, glass: P.glassGreen, border: 0.05 });
    // the furnace: an arched stoke-hole in a low block, with a woodpile
    b.box(1.0, 1.6, 1.6, stone, { at: [XEO + 0.5, 0, -0.6 - 0.9] });
    b.panel(0.6, 0.8, P.timberBlack, { at: [XEO + 1.0, 0.1, -1.5], facing: '+x', shape: 'round' });
    b.panel(0.9, 1.05, band, { at: [XEO + 1.0, 0.05, -1.5], facing: '+x', shape: 'round', depth: 0.04 });
    b.blob(0.15, 0xf0a040, { at: [XEO + 1.02, 0.25, -1.5], detail: 0 });
    for (let i = 0; i < 6; i++) b.log(0.1, 1.2, P.bark, { at: [XEO + 0.6 + (i % 3) * 0.2, i < 3 ? 0 : 0.2, 0.3], axis: 'z', segs: 5 });

    // ---------------- stables across the back, open on the court
    const bz = (ZB + ZBI) / 2;
    const bd = ZBI - ZB;
    b.box(2 * XO, H, 0.5, stone, { at: [0, 0, ZB + 0.25] });
    tileBands(b, 2 * XO, 0.5, H, band, [0, ZB + 0.25]);
    for (const x of spread(6, -8.0, 8.0)) b.panel(0.25, 0.9, P.windowDark, { at: [x, 2.0, ZB], facing: '-z' });
    b.sym((s) => b.box(0.5, H, bd, stone, { at: [s * (XO - 0.25), 0, bz] }));
    for (const x of spread(7, XW + 0.1, XEO - 0.2)) {
      b.box(0.28, H - 0.2, 0.28, wood, { at: [x, 0, ZBI - 0.2] });
    }
    b.box(XEO - XW + 0.6, 0.25, 0.3, wood, { at: [(XEO + XW) / 2, H - 0.25, ZBI - 0.2] });
    // stall partitions and a manger along the back wall
    for (const x of spread(8, XW + 1.2, XE - 0.4)) b.box(0.1, 1.4, 2.6, wood, { at: [x, 0, ZB + 1.8] });
    b.box(XE - XW, 0.5, 0.5, wood, { at: [(XE + XW) / 2, 0.6, ZB + 0.8] });
    b.box(2 * XO - 1, 0.06, bd - 0.8, P.thatchOld, { at: [0, 0, bz + 0.2], jitter: false });
    tegulaRoof(b, 2 * XO, bd, tile, { at: [0, H, bz], wall: stone });
    // in the court: a well, a trough, a carriage and the animals
    b.cyl(0.7, 0.8, stone, { at: [-1.6, 0, 0.6], segs: 8 });
    b.cyl(0.55, 0.05, P.windowDark, { at: [-1.6, 0.78, 0.6], segs: 8 });
    b.sym((s) => b.box(0.12, 1.6, 0.12, wood, { at: [-1.6 + s * 0.65, 0.8, 0.6] }));
    b.box(1.6, 0.1, 0.12, wood, { at: [-1.6, 2.35, 0.6] });
    b.box(2.6, 0.6, 0.8, stone, { at: [2.6, 0, -4.4] });
    b.box(2.4, 0.04, 0.6, P.water, { at: [2.6, 0.58, -4.4], mat: 'glass', jitter: false });
    cart(b, [1.2, 0, 1.6], 2.6, P.oak);
    horse(b, [2.2, 0, -3.4], Math.PI, 0x6b4a32);
    horse(b, [-3.6, 0, -2.4], 0.4, 0x8a7a6a);

    // the milestone by the road
    b.cyl(0.32, 2.0, P.limestone, { at: [7.4, 0, ZF + 0.55], segs: 8, rTop: 0.28 });
    b.box(0.8, 0.3, 0.8, P.limestone, { at: [7.4, 0, ZF + 0.55] });

    // ---------------- colliders, one per range: the gate passage and the court stay open
    b.sym((s) => b.collider(fw, fd, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.collider(ww, wl, { at: [wx, 0, wz] });
    b.collider(ew, ZFI - ZBI, { at: [ex, 0, (ZFI + ZBI) / 2] });
    b.collider(2 * XO, bd, { at: [0, 0, bz] });
  },
};
