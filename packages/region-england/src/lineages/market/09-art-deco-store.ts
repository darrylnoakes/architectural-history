import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { roundRect, slab } from './shared';

/** Call fn at points spaced about `step` apart round a closed outline. */
function alongOutline(pts: [number, number][], step: number, fn: (x: number, z: number, ang: number) => void): void {
  let carry = step / 2;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x1 - x0, z1 - z0);
    let t = carry;
    while (t < len) {
      fn(x0 + ((x1 - x0) * t) / len, z0 + ((z1 - z0) * t) / len, Math.atan2(x1 - x0, z1 - z0));
      t += step;
    }
    carry = t - len;
  }
}

/** Block letters for the fascia: just bars, enough to read as lettering from a distance. */
function lettering(b: Builder, n: number, at: [number, number, number], color: number, facing: '+z' | '-z'): void {
  const w = 0.42;
  const gap = 0.14;
  const total = n * w + (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    const x = at[0] - total / 2 + w / 2 + i * (w + gap);
    const xx = facing === '+z' ? x : -x;
    b.panel(0.09, 0.55, color, { at: [xx - (facing === '+z' ? 0.16 : -0.16), at[1], at[2]], facing, depth: 0.05 });
    b.panel(0.42, 0.08, color, { at: [xx, at[1] + 0.47, at[2]], facing, depth: 0.05 });
    if (i % 2 === 0) b.panel(0.32, 0.08, color, { at: [xx, at[1] + 0.24, at[2]], facing, depth: 0.05 });
    if (i % 3 !== 1) b.panel(0.42, 0.08, color, { at: [xx, at[1], at[2]], facing, depth: 0.05 });
    if (i % 3 === 1) b.panel(0.09, 0.55, color, { at: [xx + (facing === '+z' ? 0.16 : -0.16), at[1], at[2]], facing, depth: 0.05 });
  }
}

export const artDecoStore: BuildingDef = {
  id: 'art-deco-store',
  name: 'Department store',
  style: 'Art Deco (streamlined)',
  date: 'c. 1932',
  summary:
    'The market hall has been sold and pulled down, and a department store takes the island site: one shop selling everything under one roof, with fixed prices and lifts. ' +
    'Its steel frame means the walls carry no weight, so the front can be wrapped in long horizontal bands of metal windows that sweep round rounded corners. ' +
    'Glazed cream faience tiles keep it clean in a smoky town, and a stepped central tower with a projecting sign makes sure it is seen from every street into the square.',
  materials: ['steel frame', 'glazed faience', 'metal (Crittall) windows', 'plate glass', 'bronze'],
  lookFor: [
    { label: 'Faience cladding', note: 'Glazed, machine-made ceramic blocks: bright, washable and cheap to mould into ornament.', at: [-6.0, 4.9, 7.3] },
    { label: 'Ribbon windows', note: 'Continuous horizontal bands of steel-framed windows, possible because the frame, not the wall, holds the building up.', at: [-4.0, 6.6, 7.3] },
    { label: 'Rounded corner', note: 'The bands wrap round a curved corner, the streamlined look of liners and express trains.', at: [-8.7, 8.0, 6.4] },
    { label: 'Fin sign', note: 'A vertical blade carrying the store’s name, meant to be read from far down the street.', at: [9.6, 9.5, 7.3] },
    { label: 'Stepped tower', note: 'The centre rises in setbacks with vertical fins, a jazz-age skyscraper in miniature.', at: [0, 16.4, 7.6] },
  ],
  influences: ['art-deco', 'chicago-frame'],
  build(b) {
    const W = 19;
    const D = 14.4;
    const R = 3.6;
    const faience = P.faience;
    const accent = b.variant === 0 ? P.cladGreen : b.pick([P.cladGreen, P.black, P.cladBlue]);
    const metal = P.castIron;
    const outer = roundRect(W, D, R, 6);
    const core = roundRect(W - 0.5, D - 0.5, R - 0.25, 6);
    const band = roundRect(W + 0.06, D + 0.06, R + 0.03, 6);

    // ground floor: black stall riser, plate-glass shop windows, fascia
    slab(b, outer, 0, 0.6, P.black);
    slab(b, core, 0.6, 2.9, P.glassDark, 'glass');
    alongOutline(roundRect(W - 0.4, D - 0.4, R - 0.2, 6), 2.4, (x, z) => b.box(0.16, 2.9, 0.16, P.bronze, { at: [x, 0.6, z] }));
    slab(b, outer, 3.5, 0.9, faience);
    slab(b, band, 3.85, 0.12, accent);
    // canopy over the pavement all round
    slab(b, roundRect(W + 2.2, D + 2.2, R + 1.1, 6), 3.3, 0.22, tint(faience, -0.12));
    slab(b, roundRect(W + 2.26, D + 2.26, R + 1.13, 6), 3.34, 0.1, accent);

    // two upper storeys of faience spandrels and ribbon windows
    let y = 4.4;
    for (let f = 0; f < 2; f++) {
      slab(b, outer, y, 1.0, faience);
      slab(b, band, y + 0.9, 0.08, accent);
      y += 1.0;
      slab(b, core, y, 2.2, P.glassDark, 'glass');
      alongOutline(roundRect(W - 0.42, D - 0.42, R - 0.21, 6), 0.95, (x, z) => b.box(0.08, 2.2, 0.08, metal, { at: [x, y, z] }));
      slab(b, roundRect(W - 0.42, D - 0.42, R - 0.21, 6), y + 1.45, 0.06, metal); // transom
      y += 2.2;
    }
    // parapet with stripes
    slab(b, outer, y, 1.6, faience, undefined, roundRect(W - 0.8, D - 0.8, R - 0.4, 6));
    for (const dy of [0.35, 0.6]) slab(b, band, y + dy, 0.1, accent);
    slab(b, roundRect(W + 0.2, D + 0.2, R + 0.1, 6), y + 1.6, 0.14, tint(faience, -0.05), undefined, roundRect(W - 0.8, D - 0.8, R - 0.4, 6));
    const yTop = y + 1.6;
    // flat roof and the lift motor room
    slab(b, core, yTop - 1.0, 0.1, P.asphalt);
    b.box(4, 2.9, 3, faience, { at: [-4, yTop - 1.0, -3] });
    b.box(4.2, 0.15, 3.2, tint(faience, -0.05), { at: [-4, yTop + 1.9, -3] });

    // central stepped tower with fins over the main entrance, on front and back
    for (const s of [1, -1] as const) {
      const zf = s * (D / 2);
      const facing = s > 0 ? '+z' : '-z';
      const main = s > 0;
      const tw = main ? 4.6 : 3.4;
      const th = main ? yTop + 3.2 : yTop + 1.2;
      b.box(tw, th - 4.4, 1.0, faience, { at: [0, 4.4, zf] });
      b.box(tw - 1.0, 0.8, 0.8, faience, { at: [0, th, zf - s * 0.1] });
      b.box(tw - 2.0, 0.7, 0.6, faience, { at: [0, th + 0.8, zf - s * 0.2] });
      // tall stair window between fins
      b.panel(tw - 1.6, th - 6.2, P.glassDark, { at: [0, 5.0, zf + s * 0.5], facing, depth: 0.04, mat: 'glass' });
      for (const k of [-1, 0, 1]) b.box(0.22, th - 4.2, 0.5, faience, { at: [k * (tw / 2 - 0.4) * (main ? 1 : 1), 4.4, zf + s * 0.7] });
      for (const k of [-0.5, 0.5]) b.box(0.08, th - 6.2, 0.08, metal, { at: [k * (tw - 1.6) / 2, 5.0, zf + s * 0.56] });
      b.panel(tw - 1.6, 0.25, accent, { at: [0, th - 0.6, zf + s * 0.5], facing, depth: 0.06 });
      // a sunburst over the doors
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (0.15 + (0.7 * i) / 6);
        b.group({ at: [0, 4.45, zf + s * 0.52], rotY: main ? 0 : Math.PI }, () =>
          b.box(0.1, 0.9, 0.05, P.gold, { rot: [0, 0, a - Math.PI / 2] }),
        );
      }
      // entrance doors under the canopy, recessed into the shop front
      b.panel(3.0, 2.7, P.bronze, { at: [0, 0.3, zf + s * 0.05], facing, depth: 0.08 });
      for (const dx of [-0.75, 0.75]) b.panel(1.2, 2.4, P.glassDark, { at: [dx, 0.3, zf + s * 0.1], facing, depth: 0.06, mat: 'glass' });
      b.box(3.4, 0.3, 1.2, P.black, { at: [0, 0, zf + s * 0.4] });
      // name lettering on the fascia either side of the tower
      for (const sx of [-1, 1]) lettering(b, main ? 6 : 4, [sx * 5.6 * (main ? 1 : -1), 3.65, zf + s * 0.01], accent === P.black ? P.gold : P.black, facing);
    }

    // the fin sign: a tall blade standing out from the front right corner
    const c = W / 2 - R + Math.cos(Math.PI / 4) * R;
    const cz = D / 2 - R + Math.sin(Math.PI / 4) * R;
    b.group({ at: [c + 0.2, 4.8, cz + 0.2], rotY: Math.PI / 4 }, () => {
      b.box(0.3, 7.2, 1.6, accent, { at: [0, 0, 0.7] });
      b.box(0.36, 7.3, 0.12, P.gold, { at: [0, -0.05, 1.5] });
      for (let i = 0; i < 6; i++) {
        for (const s of [-1, 1]) b.box(0.04, 0.7, 0.9, P.cream, { at: [s * 0.16, 0.6 + i * 1.08, 0.7] });
      }
      b.box(0.3, 0.6, 0.6, accent, { at: [0, 7.2, 0.4] });
    });
    // flagpole on the tower
    b.cyl(0.06, 4, metal, { at: [0, yTop + 4.7, D / 2 - 0.3], segs: 5 });
  },
};
