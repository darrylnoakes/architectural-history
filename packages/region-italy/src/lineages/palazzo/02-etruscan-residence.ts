import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { block } from './shared';

/** A seated terracotta figure for the ridge of the roof, facing +Z, sitting on `at`. */
function ridgeFigure(b: Builder, x: number, y: number, z: number, clay: number, hat: boolean): void {
  b.box(0.5, 0.45, 0.5, clay, { at: [x, y, z] });
  b.box(0.42, 0.65, 0.3, clay, { at: [x, y + 0.45, z - 0.05] });
  b.box(0.38, 0.12, 0.42, clay, { at: [x, y + 0.45, z + 0.2] });
  b.sphere(0.15, clay, { at: [x, y + 1.25, z], segs: 5 });
  if (hat) b.cyl(0.32, 0.05, tint(clay, -0.1), { at: [x, y + 1.33, z], segs: 7 });
}

export const etruscanResidence: BuildingDef = {
  id: 'etruscan-residence',
  name: 'Etruscan aristocratic residence',
  style: 'Etruscan (Archaic)',
  date: 'c. 580 BC',
  summary:
    'An Etruscan lord builds a grand house round a courtyard, part palace and part shrine, where the family received clients and held banquets. ' +
    'The walls are of sun-dried brick on stone footings, but the roofs are of fired clay tiles, learned from the Greeks, and they carry the display: rows of painted terracotta plaques showing horse races, banquets and processions, and life-size seated figures of ancestors or gods along the ridge. ' +
    'A colonnade of timber posts on stone bases shades the sides of the court. Compared with the chief’s hut, everything is now rectilinear, tiled and decorated.',
  materials: ['stone footings', 'sun-dried brick with clay plaster', 'timber posts', 'fired clay roof tiles', 'painted terracotta'],
  modelledOn: 'The Archaic building at Poggio Civitate (Murlo), near Siena, rebuilt about 580 BC',
  influences: ['greek-colonies'],
  lookFor: [
    { label: 'Ridge statues (acroteria)', note: 'Seated terracotta figures, some in broad-brimmed hats, line the ridge of the main range: ancestors or gods watching over the house.', at: [-3.0, 7.2, 9.0] },
    { label: 'Frieze plaques', note: 'A band of painted terracotta plaques along the top of the walls showed horse races, banquets, processions and seated assemblies.', at: [6.0, 2.8, 11.7] },
    { label: 'Colonnaded courtyard', note: 'Timber columns on stone bases carry a lean-to roof round the sides of the court.', at: [-4.6, 2.0, 0] },
    { label: 'Terracotta tiled roof', note: 'Flat pan tiles and rounded cover tiles, with moulded antefixes along the eaves, among the first fired roofs in Italy.', at: [8.5, 4.6, -6.0] },
  ],
  build(b) {
    const plaster = b.pick([P.mudbrick, tint(P.mudbrick, 0.05), P.daub]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.05)]);
    const clay = P.terracotta;
    const red = P.terracottaPainted;
    const H = 3.2;
    const R = 5; // depth of each range
    const W = 22;
    const D = 23;
    const zf = D / 2;

    // ---- the four ranges on stone footings, the front one split by the gateway
    const range = (w: number, d: number, x: number, z: number) => {
      b.box(w + 0.1, 0.6, d + 0.1, P.rubble, { at: [x, 0, z] });
      block(b, w, H, d, plaster, x, z);
    };
    b.sym((s) => range(W / 2 - 1.4, R, s * (1.4 + (W / 2 - 1.4) / 2), zf - R / 2));
    range(W, R, 0, -zf + R / 2);
    b.sym((s) => range(R, D - 2 * R, s * (W / 2 - R / 2), 0));
    // roofs: low gables over each range, the front one with its gate roof
    const pitch = 1.3;
    b.gable(W, R, pitch, tile, { at: [0, H, zf - R / 2], overhang: 0.6, wall: plaster });
    b.gable(W, R, pitch, tile, { at: [0, H, -zf + R / 2], overhang: 0.6, wall: plaster });
    b.sym((s) => b.gable(R, D - R, pitch, tile, { at: [s * (W / 2 - R / 2), H, 0], ridge: 'z', overhang: 0.5, wall: plaster }));
    b.box(W + 1.2, 0.14, 0.24, tint(tile, -0.1), { at: [0, H + pitch + 0.06, zf - R / 2] });
    b.box(W + 1.2, 0.14, 0.24, tint(tile, -0.1), { at: [0, H + pitch + 0.06, -zf + R / 2] });
    // the gateway
    b.box(2.8, 0.06, R, P.gravel, { at: [0, 0, zf - R / 2] });
    b.box(2.8, 0.7, R, P.oak, { at: [0, H - 0.7, zf - R / 2] });
    b.sym((s) => b.panel(1.2, 2.6, P.oakDark, { at: [s * 1.3, 0.05, zf - R + 0.6], facing: s > 0 ? '-x' : '+x', depth: 0.06 }));

    // ---- painted frieze plaques under the eaves, all round the outside, and antefixes on the eaves
    const plaques = (len: number, at: [number, number, number], rotY: number) => {
      b.group({ at, rotY }, () => {
        b.box(len, 0.55, 0.06, red, { at: [0, H - 0.65, 0.03] });
        const n = Math.round(len / 0.9);
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * (len / n);
          b.box(0.7, 0.38, 0.05, i % 2 ? P.cream : tint(P.cream, -0.08), { at: [x, H - 0.57, 0.06] });
          b.box(0.18, 0.2, 0.04, P.black, { at: [x - 0.15, H - 0.52, 0.1] });
          b.box(0.22, 0.12, 0.04, red, { at: [x + 0.12, H - 0.48, 0.1] });
        }
      });
    };
    plaques(W - 2.8, [0, 0, zf], 0);
    plaques(W, [0, 0, -zf], Math.PI);
    b.sym((s) => plaques(D, [s * W / 2, 0, 0], s * Math.PI / 2));
    for (let i = 0; i < 22; i++) {
      const x = -W / 2 + 0.5 + i * (W - 1) / 21;
      b.box(0.24, 0.3, 0.08, clay, { at: [x, H - 0.05, zf + 0.62] });
    }

    // ---- seated figures along the ridge of the front range, standing ones on the gable apexes
    for (const x of [-9, -6, -3, 3, 6, 9]) ridgeFigure(b, x, H + pitch + 0.1, zf - R / 2, clay, Math.abs(x) === 3 || Math.abs(x) === 9);
    b.sym((s) => {
      b.box(0.4, 0.9, 0.35, clay, { at: [s * (W / 2 - R / 2), H + pitch, -zf + 0.6] });
      b.sphere(0.16, clay, { at: [s * (W / 2 - R / 2), H + pitch + 1.05, -zf + 0.6], segs: 5 });
    });
    // feline-head waterspouts on the corners
    b.sym((s) => b.box(0.3, 0.25, 0.5, red, { at: [s * (W / 2 + 0.3), H - 0.2, zf - 0.2] }));

    // ---- the courtyard: colonnades of timber posts on stone bases along three sides
    const ci = W / 2 - R;
    const cz = zf - R;
    b.box(2 * ci, 0.05, 2 * cz, P.earth, { at: [0, 0, 0] });
    const walk = 2.0;
    const posts = (x0: number, z0: number, x1: number, z1: number, n: number) => {
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        const z = z0 + ((z1 - z0) * i) / n;
        b.box(0.5, 0.3, 0.5, P.tufa, { at: [x, 0, z] });
        b.cyl(0.15, H - 0.7, P.oak, { at: [x, 0.3, z], segs: 6, rTop: 0.13 });
        b.box(0.45, 0.2, 0.45, P.oak, { at: [x, H - 0.4, z] });
      }
    };
    posts(-ci + walk, -cz + walk, -ci + walk, cz - 0.2, 4);
    posts(ci - walk, -cz + walk, ci - walk, cz - 0.2, 4);
    posts(-ci + walk + 1.6, -cz + walk, ci - walk - 1.6, -cz + walk, 2);
    b.sym((s) => {
      b.box(0.3, 0.3, 2 * cz - walk + 0.2, P.oak, { at: [s * (ci - walk), H - 0.2, walk / 2 - 0.1] });
      b.shed(walk + 0.3, 2 * cz, 0.7, tile, { at: [s * (ci - walk / 2), H - 0.1, 0], high: s > 0 ? '+x' : '-x' });
    });
    b.box(2 * ci - 2 * walk, 0.3, 0.3, P.oak, { at: [0, H - 0.2, -cz + walk] });
    b.shed(2 * ci - 2 * walk, walk, 0.7, tile, { at: [0, H - 0.1, -cz + walk / 2], high: '-z' });
    // a small altar and a well in the court; doors into the ranges
    b.box(1.2, 0.9, 0.8, P.tufa, { at: [0, 0, 1.5] });
    b.box(1.4, 0.15, 1.0, P.tufa, { at: [0, 0.9, 1.5] });
    b.cyl(0.6, 0.7, P.tufa, { at: [1.8, 0, -1.5], segs: 8 });
    b.cyl(0.45, 0.72, P.windowDark, { at: [1.8, 0, -1.5], segs: 8 });
    for (const x of [-3, 3]) b.panel(1.2, 2.3, P.oakDark, { at: [x, 0.05, -cz], facing: '+z', depth: 0.06 });
    b.sym((s) => {
      for (const z of [-2.5, 2.5]) b.panel(1.1, 2.2, P.oakDark, { at: [s * ci, 0.05, z], facing: s > 0 ? '-x' : '+x', depth: 0.06 });
    });
    // a few small high windows on the outside
    for (const x of [-7, -3, 3, 7]) b.panel(0.5, 0.45, P.windowDark, { at: [x, 1.9, -zf], facing: '-z', depth: 0.04 });
    b.sym((s) => {
      for (const z of [-6, 0, 6]) b.panel(0.5, 0.45, P.windowDark, { at: [s * W / 2, 1.9, z], facing: s > 0 ? '+x' : '-x', depth: 0.04 });
    });
  },
};
