import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { archPanel, archivolt } from './shared';

const WALL = P.intonacoCream;
const STONE = P.travertine;

/**
 * One elevation of a block of the galleria: arched shopfronts with a mezzanine on the ground floor,
 * two storeys of windows between pilasters, string courses and a cornice. Local frame: the wall face
 * is z = 0, running along x for `len`, facing +z.
 */
function elevation(b: Builder, len: number, at: [number, number, number], rotY: number, inner: boolean): void {
  b.group({ at, rotY }, () => {
    const n = Math.max(2, Math.round(len / 3.2));
    const pitch = len / n;
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * pitch;
      // shopfront: a stone arch framing glass, an iron transom with the mezzanine light above
      archPanel(b, 2.5, 4.75, STONE, [x, 0, 0], '+z', 'round', 0.05, undefined, 3);
      archPanel(b, 2.1, 4.5, P.glassDark, [x, 0.1, 0], '+z', 'round', 0.08, 'glass', 3);
      b.box(2.1, 0.12, 0.12, P.castIron, { at: [x, 3.2, 0.1] });
      if (inner) b.box(1.9, 0.38, 0.06, P.timberBlack, { at: [x, 2.7, 0.14] }); // shop name board
      if (inner) b.box(1.5, 0.12, 0.04, P.gold, { at: [x, 2.83, 0.18], jitter: false });
      // first floor: tall window with a pediment; second floor: smaller window
      b.panel(1.5, 2.45, STONE, { at: [x, 5.9, 0], depth: 0.05 });
      b.panel(1.15, 2.2, P.windowDark, { at: [x, 6.0, 0], depth: 0.07 });
      b.extrude([[-0.95, 0], [0.95, 0], [0, 0.45]], 0.2, STONE, { at: [x, 8.4, 0.1] });
      b.panel(1.05, 1.7, P.windowDark, { at: [x, 9.65, 0], depth: 0.07 });
      if (inner) b.box(1.5, 0.08, 0.35, P.castIron, { at: [x, 5.9, 0.17] }); // balcony rail
    }
    for (let i = 0; i <= n; i++) b.panel(0.42, 6.9, tint(WALL, -0.04), { at: [-len / 2 + i * pitch, 5.3, 0], depth: 0.1 });
    b.box(len, 0.45, 0.25, STONE, { at: [0, 4.95, 0.1] });
    b.box(len, 0.3, 0.2, STONE, { at: [0, 9.1, 0.08] });
    b.box(len + 0.2, 0.55, 0.55, STONE, { at: [0, 12.45, 0.2] });
  });
}

/** An entrance arch at the end of an arm: an arched screen wall with a moulded archivolt. */
function portal(b: Builder, w: number, h: number, archW: number, archH: number, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    b.archWall(w, h, 0.7, WALL, { openings: 1, openW: archW, openH: archH, shape: 'round' });
    archivolt(b, archW / 2, 0.45, archH - archW / 2, 0.12, STONE, [0, 0, 0.35], '+z', 10);
    for (const s of [-1, 1]) {
      b.box(0.9, archH - archW / 2, 0.25, STONE, { at: [s * (archW / 2 + 0.45), 0, 0.4] });
      b.box(w - archW, 0.4, 0.3, STONE, { at: [s * (w / 2 + archW / 2) / 2, archH - archW / 2, 0.4] });
    }
    b.box(w + 0.3, 0.5, 1.0, STONE, { at: [0, h - 0.5, 0] });
  });
}

export const galleria: BuildingDef = {
  id: 'galleria',
  name: 'Shopping arcade (galleria)',
  style: 'Eclectic, Neo-Renaissance with iron and glass',
  date: 'c. 1877',
  summary:
    'United Italy celebrates itself with covered shopping streets: two arcades crossing under barrel vaults of iron and glass, with a glazed dome over the crossing. ' +
    'The model is the Galleria Vittorio Emanuele II in Milan, designed by Giuseppe Mengoni and finished in 1877, itself following the Paris passages and Brussels’ Galeries Saint-Hubert. ' +
    'The walls are dressed in a borrowed Renaissance of pilasters and pediments, but the roof is pure engineering, and the entrance from the square is a triumphal arch for shoppers. ' +
    'Cafés, booksellers and tailors replace the open stall: trade has moved behind plate glass.',
  materials: ['brick faced with stucco and stone', 'cast and wrought iron', 'glass', 'marble and mosaic paving'],
  lookFor: [
    { label: 'Triumphal arch entrance', note: 'A great arch framed by paired columns and crowned by an attic with an inscription, like a Roman victory arch.', at: [0, 11.5, 10.8] },
    { label: 'Glazed barrel vault', note: 'Curved iron ribs carry panes of glass over each arm, so the street inside is lit by daylight but dry.', at: [0, 15.8, -6.0] },
    { label: 'Glass dome', note: 'An octagonal dome of iron and glass rises over the crossing of the two arms.', at: [3.0, 19.0, 0] },
    { label: 'Mosaic floor', note: 'At the crossing the marble floor carries the arms of the House of Savoy, the new royal family, in mosaic.', at: [0, 0.4, 0] },
    { label: 'Shopfronts with mezzanine', note: 'Each arched shopfront has an iron transom; above it a mezzanine floor for stock and offices.', at: [-2.6, 3.4, 6.2] },
  ],
  modelledOn: 'The Galleria Vittorio Emanuele II, Milan (Giuseppe Mengoni, 1865 to 1877), much reduced',
  influences: ['iron-and-glass'],
  build(b) {
    const A = 2.5; // half width of each arm
    const HX = 12.5; // half length along X
    const HZ = 10; // half length along Z
    const H = 13; // cornice height

    // paving of the arms: marble with the mosaic at the crossing
    b.box(2 * HX, 0.12, 2 * A, tint(P.marble, -0.06), { at: [0, 0, 0], jitter: false });
    b.box(2 * A, 0.12, 2 * HZ + 0.6, tint(P.marble, -0.06), { at: [0, 0, 0.3], jitter: false });
    for (const z of [-7.5, -5, 5, 7.5]) b.box(2 * A, 0.01, 0.15, P.marbleRed, { at: [0, 0.12, z], jitter: false });
    for (const x of [-10, -7.5, -5, 5, 7.5, 10]) b.box(0.15, 0.01, 2 * A, P.marbleRed, { at: [x, 0.12, 0], jitter: false });
    b.cyl(2.4, 0.02, P.marbleYellow, { at: [0, 0.12, 0], segs: 8, rotY: Math.PI / 8 });
    b.cyl(1.2, 0.03, P.intonacoRed, { at: [0, 0.12, 0], segs: 12 });
    b.box(1.7, 0.04, 0.35, P.white, { at: [0, 0.12, 0], jitter: false });
    b.box(0.35, 0.04, 1.7, P.white, { at: [0, 0.12, 0], jitter: false });

    // ---- the four blocks between the arms
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const bw = HX - A;
        const bd = HZ - A;
        const cx = sx * (A + bw / 2);
        const cz = sz * (A + bd / 2);
        b.box(bw, H, bd, WALL, { at: [cx, 0, cz] });
        b.collider(bw, bd, { at: [cx, 0, cz] });
        // outer elevations and those facing into the arms
        elevation(b, bw, [cx, 0, sz * HZ], sz > 0 ? 0 : Math.PI, false);
        elevation(b, bd, [sx * HX, 0, cz], sx > 0 ? Math.PI / 2 : -Math.PI / 2, false);
        elevation(b, bw, [cx, 0, sz * A], sz > 0 ? Math.PI : 0, true);
        elevation(b, bd, [sx * A, 0, cz], sx > 0 ? -Math.PI / 2 : Math.PI / 2, true);
        // a low roof of zinc behind a balustraded parapet
        b.hip(bw - 0.6, bd - 0.6, 1.6, P.zinc, { at: [cx, H, cz] });
        for (const [w, d, x, z] of [
          [bw, 0.3, cx, sz * (HZ - 0.15)],
          [0.3, bd, sx * (HX - 0.15), cz],
        ] as [number, number, number, number][]) {
          b.box(w, 0.9, d, WALL, { at: [x, H, z] });
          b.box(w + 0.1, 0.15, d + 0.1, STONE, { at: [x, H + 0.9, z] });
        }
      }
    }

    // ---- iron and glass: a barrel vault over each arm, ribs, and the dome over the crossing
    b.vault(2 * A, 2 * HZ - 0.6, P.glass, { at: [0, H, -0.3], axis: 'z', segs: 10, mat: 'glass' });
    b.vault(2 * A, 2 * HX - 0.6, P.glass, { at: [0, H, 0], axis: 'x', segs: 10, mat: 'glass' });
    for (const z of [-9, -7, -5, -3, 3, 5, 7, 9]) archivolt(b, A - 0.05, 0.12, 0, 0.14, P.castIron, [0, H, z], '+z', 6);
    for (const x of [-11, -9, -7, -5, -3, 3, 5, 7, 9, 11]) archivolt(b, A - 0.05, 0.12, 0, 0.14, P.castIron, [x, H, 0], '+x', 6);
    for (const s of [-1, 1]) {
      b.box(0.3, 0.3, 2 * HZ, P.castIron, { at: [s * A, H - 0.15, 0] });
      b.box(2 * HX, 0.3, 0.3, P.castIron, { at: [0, H - 0.15, s * A] });
    }
    // the dome: an octagonal drum, a glazed dome with iron ribs, a lantern
    const rD = 3.4;
    b.cyl(rD, 1.6, P.castIron, { at: [0, H + 0.4, 0], segs: 8, rotY: Math.PI / 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.panel(2.0, 1.0, P.glass, { at: [Math.cos(a) * rD * 0.93, H + 0.7, Math.sin(a) * rD * 0.93], facing: Math.PI / 2 - a, depth: 0.04, mat: 'glass' });
    }
    const prof: [number, number][] = [
      [rD, 0],
      [rD - 0.2, 1.3],
      [rD - 0.8, 2.6],
      [rD - 1.9, 3.6],
      [0.7, 4.0],
    ];
    const yD = H + 2.0;
    b.lathe(prof, P.glass, { at: [0, yD, 0], segs: 8, mat: 'glass', rotY: Math.PI / 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      for (let k = 0; k < prof.length - 1; k++) {
        const [r0, h0] = prof[k];
        const [r1, h1] = prof[k + 1];
        b.beam([Math.cos(a) * r0, yD + h0, Math.sin(a) * r0], [Math.cos(a) * r1, yD + h1, Math.sin(a) * r1], 0.14, 0.14, P.castIron);
      }
    }
    b.cyl(0.75, 0.9, P.castIron, { at: [0, yD + 4.0, 0], segs: 8 });
    b.cone(0.85, 0.7, P.zinc, { at: [0, yD + 4.9, 0], segs: 8 });

    // ---- the entrances: a triumphal arch to the square, plainer arches at the other three ends
    b.group({ at: [0, 0, HZ + 0.25] }, () => {
      b.archWall(10, 17, 0.7, WALL, { openings: 1, openW: 2 * A - 0.2, openH: 11, shape: 'round' });
      archivolt(b, A - 0.1, 0.5, 11 - A + 0.1, 0.14, STONE, [0, 0, 0.35], '+z', 10);
      for (const s of [-1, 1]) b.box(2.6, 0.6, 0.9, STONE, { at: [s * 3.85, 0, 0] });
      for (const s of [-1, 1]) {
        for (const x of [3.3, 4.4]) {
          b.box(0.9, 1.6, 0.9, STONE, { at: [s * x, 0, 0.35] });
          b.column(0.3, 8.4, STONE, { at: [s * x, 1.6, 0.4], order: 'corinthian', segs: 8 });
        }
        b.box(2.2, 0.9, 1.0, STONE, { at: [s * 3.85, 10.0, 0.3] }); // entablature block over the pair
        b.panel(1.2, 2.2, P.windowDark, { at: [s * 3.85, 4.0, 0.36], shape: 'round', depth: 0.06 }); // niches
        b.panel(0.9, 0.9, STONE, { at: [s * 1.95, 12.0, 0.36], shape: 'circle', depth: 0.06 });
        b.cyl(0.4, 1.4, P.marble, { at: [s * 3.85, 17.0, 0.0], rTop: 0.25, segs: 6 }); // statues on the attic
        b.sphere(0.25, P.marble, { at: [s * 3.85, 18.6, 0.0], segs: 6 });
        b.collider(2.5, 1.4, { at: [s * 3.85, 0, HZ + 0.6] });
      }
      b.box(10.3, 0.7, 1.1, STONE, { at: [0, 10.9, 0.0] });
      b.panel(5.6, 1.3, P.marble, { at: [0, 13.6, 0.36], depth: 0.06 }); // inscription
      for (let k = 0; k < 6; k++) b.panel(0.65, 0.22, P.bronze, { at: [-2.1 + k * 0.84, 14.1, 0.36], depth: 0.1 });
      b.panel(1.1, 1.4, P.intonacoRed, { at: [0, 15.4, 0.36], shape: 'round', depth: 0.08 }); // the royal arms
      b.panel(0.5, 0.15, P.white, { at: [0, 15.9, 0.36], depth: 0.12 });
      b.box(10.4, 0.5, 1.0, STONE, { at: [0, 16.6, 0] });
    });
    portal(b, 7, 16.0, 2 * A - 0.2, 10.5, [0, 0, -HZ - 0.2], Math.PI);
    portal(b, 7, 16.0, 2 * A - 0.2, 10.5, [HX - 0.3, 0, 0], Math.PI / 2);
    portal(b, 7, 16.0, 2 * A - 0.2, 10.5, [-HX + 0.3, 0, 0], -Math.PI / 2);
    for (const t of [-1, 1]) {
      b.collider(1.0, 0.8, { at: [t * 3.0, 0, -HZ - 0.35] });
      for (const sx of [-1, 1]) b.collider(0.8, 1.0, { at: [sx * HX, 0, t * 3.0] });
    }

    // café tables in the arm, a lamp post at the crossing
    for (const [x, z] of [
      [-1.4, 5.8],
      [1.4, 7.0],
      [-1.4, 8.4],
      [-7.0, 1.3],
      [-9.0, -1.3],
    ] as [number, number][]) {
      b.cyl(0.35, 0.05, P.marble, { at: [x, 0.85, z], segs: 8 });
      b.cyl(0.04, 0.73, P.castIron, { at: [x, 0.12, z], segs: 4 });
      for (const s of [-1, 1]) b.box(0.36, 0.85, 0.36, P.castIron, { at: [x + s * 0.55, 0.12, z] });
    }
    for (const [x, z] of [
      [1.9, 1.9],
      [-1.9, -1.9],
    ] as [number, number][]) {
      b.cyl(0.06, 3.6, P.castIron, { at: [x, 0.12, z], segs: 5 });
      b.sphere(0.22, P.windowLit, { at: [x, 3.9, z], segs: 6 });
    }
  },
};
