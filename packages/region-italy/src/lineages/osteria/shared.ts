import { P, facingAngle, spread, tint, type Builder, type Facing, type Vec3 } from '@ah/kit';

/** Pitch of a pan-and-cover tile roof: rise per metre of half-span (about 22 degrees). */
export const COPPI_PITCH = 0.4;

/** A flat ground surface (yard, pavement, terrace) w × d, a few centimetres thick. */
export function ground(b: Builder, w: number, d: number, color: number, at: [number, number], h = 0.04): void {
  b.box(w, h, d, color, { at: [at[0], 0, at[1]], jitter: false });
}

/** The raised Roman pavement of basalt-like stone along the street, laid once and used by every Roman building on the plot. */
export function romanPavement(b: Builder): void {
  ground(b, 21.6, 2.0, P.peperino, [0, 9.65], 0.22);
}

/** A straight round pole between two points. */
export function pole(b: Builder, a: Vec3, c: Vec3, r: number, color: number, segs = 6): void {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  const dz = c[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(Math.hypot(dx, dz), dy);
  b.group({ at: a, rotY: yaw }, () => {
    b.group({ rot: [pitch, 0, 0] }, () => b.cyl(r, len, color, { segs }));
  });
}

/**
 * A pitched roof of clay tiles with the raised lines of the cover tiles (coppi, or Roman imbrices)
 * running down both slopes. Same arguments as `b.gable`; `step` is the spacing of the cover-tile lines.
 */
export function tiledGable(
  b: Builder,
  w: number,
  d: number,
  rise: number,
  color: number,
  o: { at: Vec3; ridge?: 'x' | 'z'; overhang?: number; wall?: number; step?: number; ribColor?: number },
): void {
  const ov = o.overhang ?? 0.4;
  const along = o.ridge ?? 'x';
  b.gable(w, d, rise, color, { at: o.at, ridge: along, overhang: ov, wall: o.wall, thick: 0.14 });
  const len = (along === 'x' ? w : d) + ov * 2;
  const hw = (along === 'x' ? d : w) / 2;
  const run = hw + ov;
  const ang = Math.atan2(rise, hw);
  const slope = run / Math.cos(ang);
  const mid = run / 2; // plan distance from the ridge to the middle of the slope
  const midY = o.at[1] + rise * (1 - mid / hw) + 0.14 / Math.cos(ang) - 0.03;
  const rib = o.ribColor ?? tint(color, -0.07);
  const n = Math.max(2, Math.floor(len / (o.step ?? 0.75)));
  for (const s of [1, -1]) {
    for (const p of spread(n, -len / 2 + 0.1, len / 2 - 0.1)) {
      if (along === 'x') {
        b.box(0.13, 0.08, slope, rib, { at: [o.at[0] + p, midY, o.at[2] + s * mid], rot: [s * ang, 0, 0], jitter: false });
      } else {
        b.box(slope, 0.08, 0.13, rib, { at: [o.at[0] + s * mid, midY, o.at[2] + p], rot: [0, 0, -s * ang], jitter: false });
      }
    }
  }
  // ridge capping
  if (along === 'x') b.box(len, 0.16, 0.3, rib, { at: [o.at[0], o.at[1] + rise + 0.02, o.at[2]], jitter: false });
  else b.box(0.3, 0.16, len, rib, { at: [o.at[0], o.at[1] + rise + 0.02, o.at[2] + 0] , jitter: false });
}

/** A lean-to roof of clay tiles against a wall: high edge on side `high`, falling `rise` over its depth. */
export function tiledShed(
  b: Builder,
  w: number,
  d: number,
  rise: number,
  color: number,
  o: { at: Vec3; high: '+z' | '-z' | '+x' | '-x'; step?: number },
): void {
  b.shed(w, d, rise, color, { at: o.at, high: o.high });
  const alongZ = o.high === '+z' || o.high === '-z';
  const run = alongZ ? d : w;
  const len = alongZ ? w : d;
  const ang = Math.atan2(rise, run);
  const slope = Math.hypot(run, rise);
  const rib = tint(color, -0.07);
  const sgn = o.high === '+z' || o.high === '+x' ? 1 : -1;
  for (const p of spread(Math.max(2, Math.floor(len / (o.step ?? 0.75))), -len / 2 + 0.1, len / 2 - 0.1)) {
    if (alongZ) b.box(0.13, 0.07, slope, rib, { at: [o.at[0] + p, o.at[1] + rise / 2, o.at[2]], rot: [-sgn * ang, 0, 0], jitter: false });
    else b.box(slope, 0.07, 0.13, rib, { at: [o.at[0], o.at[1] + rise / 2, o.at[2] + p], rot: [0, 0, sgn * ang], jitter: false });
  }
}

/**
 * The frasca: a leafy branch hung out on a pole over the door, the old Italian sign that wine was
 * on sale (hence "al buon vino non serve frasca", good wine needs no branch). `at` is where the pole
 * meets the wall.
 */
export function frasca(b: Builder, at: Vec3, facing: Facing, len = 1.8): void {
  const a = facingAngle(facing);
  const end: Vec3 = [at[0] + Math.sin(a) * len, at[1] + 0.25, at[2] + Math.cos(a) * len];
  pole(b, at, end, 0.05, P.oakDark);
  b.blob(0.42, P.leafDark, { at: [end[0], end[1] - 0.45, end[2]], stretch: [0.9, 1.4, 0.9], detail: 0 });
  b.blob(0.3, P.olive, { at: [end[0], end[1] - 0.85, end[2]], detail: 0 });
}

/** A wooden barrel standing on end. */
export function barrel(b: Builder, at: Vec3, color: number = P.oak): void {
  b.lathe([[0.0, 0], [0.26, 0], [0.32, 0.4], [0.26, 0.8], [0.0, 0.8]], color, { at, segs: 8 });
  b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.18, at[2]], segs: 8 });
  b.cyl(0.33, 0.05, P.iron, { at: [at[0], at[1] + 0.58, at[2]], segs: 8 });
}

/** A Roman transport amphora standing in a stand or leaning (tilt in radians about X). */
export function amphora(b: Builder, at: Vec3, color: number = P.terracotta, tilt = 0, rotY = 0): void {
  b.group({ at, rotY, rot: [tilt, 0, 0] }, () => {
    b.lathe([[0.0, 0], [0.05, 0.02], [0.17, 0.25], [0.2, 0.6], [0.15, 0.85], [0.06, 0.92], [0.06, 1.12], [0.08, 1.15], [0.0, 1.15]], color, { segs: 7 });
    b.box(0.32, 0.04, 0.04, color, { at: [0, 1.02, 0] });
  });
}

/** A big storage jar (dolium or impasto jar), mostly round. */
export function bigJar(b: Builder, at: Vec3, h: number, color: number = P.terracotta): void {
  const r = h * 0.42;
  b.lathe([[0.0, 0], [r * 0.5, 0], [r, h * 0.35], [r * 0.95, h * 0.7], [r * 0.55, h * 0.95], [r * 0.6, h], [0.0, h]], color, { at, segs: 9 });
}

/** A plain wooden table with two benches; `rotY` turns it. */
export function tableBenches(b: Builder, at: Vec3, rotY = 0, color: number = P.oak, len = 1.6): void {
  b.group({ at, rotY }, () => {
    b.box(len, 0.06, 0.7, color, { at: [0, 0.72, 0] });
    b.sym((s) => b.box(0.08, 0.72, 0.55, tint(color, -0.08), { at: [s * (len / 2 - 0.15), 0, 0] }));
    b.sym((s) => {
      b.box(len, 0.05, 0.26, color, { at: [0, 0.42, s * 0.6] });
      b.sym((t) => b.box(0.06, 0.42, 0.22, tint(color, -0.08), { at: [t * (len / 2 - 0.15), 0, s * 0.6] }));
    });
  });
}

/** A small round café table with two or three chairs. */
export function cafeTable(b: Builder, at: Vec3, top: number, frame: number, chairs = 2, rot = 0): void {
  b.group({ at, rotY: rot }, () => {
    b.cyl(0.36, 0.04, top, { at: [0, 0.72, 0], segs: 10 });
    b.cyl(0.03, 0.72, frame, { segs: 5 });
    b.cyl(0.22, 0.03, frame, { segs: 6 });
    for (let i = 0; i < chairs; i++) {
      const a = (i / chairs) * Math.PI * 2;
      b.group({ at: [Math.sin(a) * 0.68, 0, Math.cos(a) * 0.68], rotY: a }, () => {
        b.box(0.42, 0.04, 0.42, frame, { at: [0, 0.44, 0] });
        b.box(0.42, 0.42, 0.04, frame, { at: [0, 0.46, 0.2] });
        b.sym((s) => b.box(0.03, 0.44, 0.03, frame, { at: [s * 0.18, 0, -0.18] }));
        b.sym((s) => b.box(0.03, 0.44, 0.03, frame, { at: [s * 0.18, 0, 0.18] }));
      });
    }
  });
}

/** A square market umbrella on a pole. */
export function umbrella(b: Builder, at: Vec3, size: number, color: number): void {
  b.cyl(0.03, 2.3, P.white, { at, segs: 5 });
  b.pyramid(size, size, 0.45, color, { at: [at[0], at[1] + 2.1, at[2]] });
  b.box(size, 0.14, size, color, { at: [at[0], at[1] + 1.97, at[2]], jitter: false });
}

/**
 * A window with a pair of louvred shutters (persiane) folded back either side of it.
 * `at` is the bottom centre on the wall surface.
 */
export function shutteredWindow(
  b: Builder,
  w: number,
  h: number,
  o: { at: Vec3; facing: Facing; frame: number; shutter: number; surround?: number; shape?: 'rect' | 'round' | 'segmental'; open?: boolean },
): void {
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    if (o.surround !== undefined) {
      b.panel(w + 0.3, h + 0.3, o.surround, { at: [0, -0.15, 0], shape: o.shape ?? 'rect', depth: 0.05 });
      b.box(w + 0.5, 0.08, 0.16, o.surround, { at: [0, -0.18, 0.04] });
    }
    b.window(w, h, { frame: o.frame, bars: [2, 3], border: 0.07, shape: o.shape ?? 'rect' });
    if (o.open === false) {
      b.panel(w, h, o.shutter, { depth: 0.12, shape: o.shape ?? 'rect' });
      b.panel(0.03, h - 0.1, tint(o.shutter, -0.15), { at: [0, 0.05, 0], depth: 0.14 });
    } else {
      b.sym((s) => {
        b.panel(w / 2, h * (o.shape && o.shape !== 'rect' ? 0.85 : 1), o.shutter, { at: [s * (w * 0.75 + 0.04), 0, 0], depth: 0.07 });
        for (const y of spread(5, 0.1, h * 0.8)) {
          b.panel(w / 2 - 0.08, 0.025, tint(o.shutter, -0.12), { at: [s * (w * 0.75 + 0.04), y, 0], depth: 0.09 });
        }
      });
    }
  });
}

/**
 * An arcade of round arches on columns: a wall slab pierced by n arches springing from the capitals,
 * with the columns under it. `len` runs along local X; the arcade faces local +Z. `at` is the centre
 * of its base on the line of the columns. Returns the height of the top of the arcade wall.
 */
export function columnArcade(
  b: Builder,
  len: number,
  n: number,
  colH: number,
  wallH: number,
  color: number,
  o: { at: Vec3; rotY?: number; colColor?: number; r?: number; order?: 'tuscan' | 'doric' | 'ionic' | 'corinthian' | 'plain'; t?: number; endPiers?: boolean },
): void {
  const pitch = len / n;
  const r = o.r ?? 0.2;
  const t = o.t ?? 0.45;
  b.group({ at: o.at, rotY: o.rotY ?? 0 }, () => {
    b.archWall(len, wallH, t, color, { at: [0, colH, 0], openings: n, openW: pitch - r * 2.4, openH: (pitch - r * 2.4) / 2, shape: 'round' });
    for (let i = 1; i < n; i++) {
      b.column(r, colH, o.colColor ?? color, { at: [-len / 2 + i * pitch, 0, 0], order: o.order ?? 'ionic' });
    }
    if (o.endPiers !== false) {
      b.sym((s) => b.box(r * 2.4, colH, t, color, { at: [s * (len / 2 - r * 1.2), 0, 0] }));
    }
  });
}

/** A simple painted letter sign: a board with a band of `text` blocks along it (letters suggested, not spelt). */
export function letterBoard(
  b: Builder,
  w: number,
  h: number,
  board: number,
  ink: number,
  o: { at: Vec3; facing: Facing; letters: number },
): void {
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    b.panel(w, h, board, { depth: 0.05 });
    const lw = (w * 0.8) / o.letters;
    for (const x of spread(o.letters, -w * 0.4, w * 0.4)) {
      b.panel(lw * 0.62, h * 0.55, ink, { at: [x, h * 0.22, 0], depth: 0.08 });
    }
  });
}

/**
 * Block letters for a sign, as rectangles on a 3 × 5 grid per letter. Supported letters:
 * A B C D E F G H I L N O P R S T Z and space. `at` is the bottom centre of the word on the wall.
 */
const GLYPHS: Record<string, string[]> = {
  A: ['111', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  L: ['100', '100', '100', '100', '111'],
  N: ['101', '111', '111', '111', '101'],
  O: ['111', '101', '101', '101', '111'],
  P: ['111', '101', '111', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  ' ': ['000', '000', '000', '000', '000'],
};

export function word(
  b: Builder,
  text: string,
  cell: number,
  color: number,
  o: { at: Vec3; facing: Facing; depth?: number; mat?: 'glass' | 'matte' },
): void {
  const chars = text.toUpperCase().split('');
  const cw = cell * 4;
  const total = chars.length * cw - cell;
  b.group({ at: o.at, rotY: facingAngle(o.facing) }, () => {
    chars.forEach((ch, i) => {
      const g = GLYPHS[ch] ?? GLYPHS[' '];
      const x0 = -total / 2 + i * cw;
      g.forEach((row, r) => {
        // merge runs of filled cells in each row into one bar
        let c = 0;
        while (c < 3) {
          if (row[c] !== '1') {
            c++;
            continue;
          }
          let e = c;
          while (e + 1 < 3 && row[e + 1] === '1') e++;
          const wbar = (e - c + 1) * cell;
          b.box(wbar, cell, o.depth ?? 0.06, color, { at: [x0 + c * cell + wbar / 2, (4 - r) * cell, (o.depth ?? 0.06) / 2], jitter: false, mat: o.mat });
          c = e + 1;
        }
      });
    });
  });
}

/** A Canary palm, the favourite tree of the Belle Époque hotel garden. */
export function palm(b: Builder, at: Vec3, h: number): void {
  b.cyl(0.22, h, P.bark, { at, rTop: 0.18, segs: 7 });
  const top: Vec3 = [at[0], at[1] + h, at[2]];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const droop = i % 2 ? -0.9 : -0.5;
    b.beam(top, [top[0] + Math.sin(a) * 2.0, top[1] + droop, top[2] + Math.cos(a) * 2.0], 0.45, 0.05, P.leafDark);
  }
  b.blob(0.35, P.leafDark, { at: [top[0], top[1] - 0.1, top[2]], detail: 0 });
}
