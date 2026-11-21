import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, BED, END, hump, band, side, steps, archCurve, archRing, type ZY } from './shared';

export const CONCRETE_W = 8.6;
export const CONCRETE_CROWN = 1.9;

/** Art Deco lamp: a slim fluted post with a stepped cap and a tall glass lantern. */
function decoLamp(b: Builder, x: number, y: number, z: number, metal: number): void {
  b.group({ at: [x, y, z] }, () => {
    b.box(0.34, 0.3, 0.34, metal);
    b.cyl(0.09, 2.9, metal, { at: [0, 0.3, 0], rTop: 0.06, segs: 8 });
    b.box(0.22, 0.08, 0.22, metal, { at: [0, 3.2, 0] });
    b.cyl(0.15, 0.6, P.windowLit, { at: [0, 3.28, 0], segs: 8, mat: 'glass' });
    b.cyl(0.19, 0.06, metal, { at: [0, 3.88, 0], segs: 8 });
    b.cyl(0.12, 0.08, metal, { at: [0, 3.94, 0], segs: 8 });
  });
}

/** The 1936 road bridge. Also used, kept and weathered, by the 2001 stage. */
export function concreteBridge(b: Builder, o: { aged?: boolean } = {}): void {
  const W = CONCRETE_W;
  const f = hump(CONCRETE_CROWN);
  const age = o.aged ? -0.06 : 0;
  const conc = tint(P.concreteWhite, age);
  const face = tint(P.portland, age); // Portland stone dressings on pylons and abutments
  const bronze = P.bronze;
  const rib = tint(P.concrete, age); // the structure below the deck is plain grey concrete
  b.deck(W - 0.6, 26, CONCRETE_CROWN, { yEnds: 0 });

  // shallow segmental arch, rise about one eighth of the span, springing from the abutments
  const spring = -1.45;
  const rise = 2.15;
  const intra = archCurve(-BANK, BANK, spring, rise, 'segmental', 24);
  const ribT = 0.5;
  const ribs = [-3.85, -1.3, 1.3, 3.85];
  const slabT = 0.38;
  const under = (z: number) => f(z) - slabT;
  const ribTop = (z: number) => {
    // extrados height at z (linear search on the offset curve is enough here)
    const R = (BANK * BANK + rise * rise) / (2 * rise);
    const cy = spring + rise - R;
    return cy + Math.sqrt(Math.max(0, R * R - z * z)) + ribT;
  };
  for (const x of ribs) {
    archRing(b, intra, ribT, 0.6, rib, x);
    // open spandrel: slender columns from the rib up to the deck
    for (const z of [-7.0, -5.6, -4.2, -2.8, 2.8, 4.2, 5.6, 7.0]) {
      const y0 = ribTop(z) - 0.1;
      const y1 = under(z);
      if (y1 - y0 > 0.15) b.box(0.5, y1 - y0, 0.5, rib, { at: [x, y0, z] });
    }
  }
  // transverse beams under the deck at each column line, and the deck slab with fascia
  for (const z of [-7.0, -5.6, -4.2, -2.8, 2.8, 4.2, 5.6, 7.0]) b.box(ribs[3] - ribs[0] + 0.7, 0.3, 0.4, conc, { at: [0, under(z) - 0.25, z] });
  band(b, 0, W, -END, END, under, (z) => f(z) - 0.05, conc, 28);
  b.sym((s) => band(b, s * (W / 2 + 0.03), 0.08, -BANK - 0.5, BANK + 0.5, (z) => under(z) - 0.08, (z) => f(z) + 0.05, tint(conc, 0.03), 28));

  // abutments: concrete, faced in stone, with a stepped Deco outline
  b.sym((s) => {
    const pts: ZY[] = [];
    for (const z of steps(6, BANK, END)) pts.push([s * z, under(z)]);
    pts.push([s * END, -0.4], [s * (BANK + 0.01), -0.4], [s * (BANK + 0.01), BED - 0.1], [s * (BANK - 0.4), BED - 0.1], [s * (BANK - 0.4), spring + 0.3]);
    side(b, pts, W + 0.6, face);
    for (const [dx, h] of [[0, 0.3], [0.25, 0.6]] as [number, number][]) b.box(W + 0.7 + dx, h, 0.3, tint(face, -0.04), { at: [0, BED - 0.1, s * (BANK - 0.5 - dx * 0.5)] });
  });

  // roadway, kerbed footways and a white centre line
  const fw = 1.4;
  band(b, 0, W - 2 * fw, -END, END, (z) => f(z) - 0.06, (z) => f(z), P.tarmac, 28);
  band(b, 0, 0.12, -END, END, (z) => f(z) - 0.02, (z) => f(z) + 0.008, P.white, 28);
  b.sym((s) => band(b, s * (W / 2 - fw / 2), fw, -END, END, (z) => f(z) - 0.06, (z) => f(z) + 0.14, P.paving, 28));

  // parapets: solid, with vertical fins in the Deco manner, and lamps
  b.sym((s) => {
    const x = s * (W / 2 - 0.15);
    band(b, x, 0.3, -END + 1.2, END - 1.2, (z) => f(z) + 0.1, (z) => f(z) + 1.1, conc, 28);
    band(b, x, 0.38, -END + 1.2, END - 1.2, (z) => f(z) + 1.1, (z) => f(z) + 1.18, tint(conc, 0.04), 28);
    for (const z of steps(14, -10.5, 10.5)) b.box(0.08, 0.9, 0.22, tint(conc, -0.05), { at: [s * (W / 2 + 0.03), f(z) + 0.15, z] });
    for (const z of [-5.0, 5.0]) decoLamp(b, x, f(z) + 1.18, z, bronze);

    // pylons at the bridge ends: stepped, fluted, crowned with a lantern
    b.sym((t) => {
      const z = t * (END - 0.7);
      const y = f(z) - 0.05;
      b.group({ at: [s * (W / 2 + 0.05), y, z] }, () => {
        b.box(1.0, 0.4, 1.3, tint(face, -0.03));
        b.box(0.85, 2.6, 1.1, face, { at: [0, 0.4, 0] });
        b.box(0.7, 0.5, 0.95, face, { at: [0, 3.0, 0] });
        b.box(0.55, 0.4, 0.75, face, { at: [0, 3.5, 0] });
        // flutes on the outer and road faces
        for (const dz of [-0.3, 0, 0.3]) {
          b.box(0.88, 2.2, 0.08, tint(face, -0.07), { at: [0, 0.6, dz] });
        }
        b.cyl(0.24, 0.8, P.windowLit, { at: [0, 3.9, 0], segs: 8, mat: 'glass' });
        b.box(0.5, 0.1, 0.5, bronze, { at: [0, 4.7, 0] });
        b.box(0.18, 0.25, 0.18, bronze, { at: [0, 4.8, 0] });
      });
    });
  });
}

export const concreteArchBridge: BuildingDef = {
  id: 'concrete-arch-bridge',
  name: 'Reinforced-concrete arch bridge',
  style: 'Interwar Art Deco',
  date: '1936',
  summary:
    'Motor lorries and buses were too heavy for the iron girders, so the county council rebuilt the crossing in reinforced concrete: concrete for compression, steel bars cast inside it for tension. ' +
    'A single shallow arch now clears the river, and its spandrels are left open, with slender columns carrying the deck, so the bridge uses far less material than a solid masonry arch. ' +
    'The engineering is plain, but the pylons, lamps and finned parapets are styled in the Art Deco manner of the new cinemas and roadhouses.',
  materials: ['reinforced concrete', 'Portland stone facing', 'bronze', 'tarmac'],
  lookFor: [
    { label: 'Open spandrels', note: 'Between the arch and the deck there are only columns, not solid walls: the arch ribs do the work.', at: [4.4, 1.0, -5.6] },
    { label: 'Arch rib', note: 'Four parallel ribs of reinforced concrete, with a rise of only about one eighth of the span.', at: [4.4, -0.3, 6.4] },
    { label: 'Pylon', note: 'Stepped and fluted end pylons crowned with lanterns, the Art Deco signature of bridges such as Twickenham Bridge (1933).', at: [4.6, 4.6, 12.3] },
    { label: 'Deco lamp', note: 'Slim bronze lamp posts with tall glass lanterns, lit by electricity rather than gas.', at: [4.4, 5.6, 5.0] },
    { label: 'Kerbed footway', note: 'Raised pavements either side of a tarmac carriageway with a white centre line, laid out for motor traffic.', at: [-3.8, 1.8, -2.0] },
  ],
  influences: ['art-deco'],
  build(b) {
    b.noCollide();
    concreteBridge(b);
  },
};
