import { P, linspace, tint, type Builder, type BuildingDef } from '@ah/kit';
import { beam, sash } from './shared';

/** A curved cast-iron balcony railing round a bow: posts on an arc and a top rail. */
function bowRailing(b: Builder, cx: number, y: number, cz: number, r: number, iron: number) {
  const n = 15;
  let prev: [number, number, number] | null = null;
  for (let i = 0; i <= n; i++) {
    const a = -1.2 + (2.4 * i) / n;
    const x = cx + Math.sin(a) * r;
    const z = cz + Math.cos(a) * r;
    b.box(0.04, 0.95, 0.04, iron, { at: [x, y, z] });
    const top: [number, number, number] = [x, y + 0.95, z];
    if (prev) {
      beam(b, prev, top, 0.06, iron);
      beam(b, [prev[0], y + 0.12, prev[2]], [x, y + 0.12, z], 0.04, iron);
    }
    prev = top;
  }
}

export const regencyVilla: BuildingDef = {
  id: 'regency-villa',
  name: 'Regency villa',
  style: 'Regency',
  date: 'c. 1815',
  summary:
    'The richest family no longer wants a house in a row but a detached villa in its own garden. ' +
    'Brick walls disappear under smooth stucco scored to look like stone, and Welsh slate, cheap to ship by sea and canal, allows a low roof with deep overhanging eaves. ' +
    'Full-height bow windows and cast-iron balconies bring in light and views, and the porch uses the stocky Greek Doric order, fashionable since the buildings of Athens were measured and published.',
  materials: ['stucco over brick', 'Welsh slate', 'cast iron', 'painted timber sashes'],
  lookFor: [
    { label: 'Bow window', note: 'A full-height curved bay, giving the rooms behind it light and views on three sides.', at: [-4.1, 2.6, 12.0] },
    { label: 'Iron balcony', note: 'Light cast-iron railings, made cheaply in quantity by the new ironworks.', at: [4.1, 5.2, 12.2] },
    { label: 'Greek Doric porch', note: 'Thick fluted columns with no base and a plain cushion capital, copied from Athenian temples.', at: [0.9, 2.2, 12.2] },
    { label: 'Shallow roof and deep eaves', note: 'Slate can be laid at a low pitch, so the roof nearly disappears behind wide overhanging eaves.', at: [0, 8.4, 11.6] },
    { label: 'Stucco', note: 'Lime render over brick, lined out on the ground floor to imitate courses of stone.', at: [-1.7, 1.4, 10.6] },
  ],
  influences: ['greek-revival'],
  build(b) {
    const stucco = b.pick([P.stucco, P.cream, tint(P.stucco, -0.03)]);
    const trim = tint(stucco, 0.05);
    const iron = b.pick([P.castIron, P.doorGreen, P.black]);
    const door = b.pick([P.doorBlack, P.doorGreen, P.doorBlue]);
    const W = 13;
    const D = 11;
    const zc = 5.0;
    const zf = zc + D / 2; // 10.5
    const zb = zc - D / 2;
    const base = 0.45;
    const g = 3.8;
    const f = 3.3;
    const H = base + g + f; // 7.55

    b.box(W + 0.1, base, D + 0.1, tint(stucco, -0.1), { at: [0, 0, zc] });
    b.box(W, H, D, stucco, { at: [0, 0, zc] });
    // lined rustication on the ground floor and a first-floor band
    for (let i = 1; i <= 7; i++) {
      for (const sz of [1, -1]) b.box(W + 0.03, 0.03, 0.02, tint(stucco, -0.09), { at: [0, base + i * 0.5, zc + sz * (D / 2 + 0.01)] });
      for (const sx of [1, -1]) b.box(0.02, 0.03, D + 0.03, tint(stucco, -0.09), { at: [sx * (W / 2 + 0.01), base + i * 0.5, zc] });
    }
    b.box(W + 0.12, 0.18, D + 0.12, trim, { at: [0, base + g, zc] });

    // ---- twin bows rising the full height either side of the porch
    const bowR = 1.9;
    const bowZ = zf - 0.9;
    b.sym((s) => {
      const bx = s * 4.1;
      b.cyl(bowR, H, stucco, { at: [bx, 0, bowZ], segs: 16 });
      b.cyl(bowR + 0.05, base, tint(stucco, -0.1), { at: [bx, 0, bowZ], segs: 16 });
      b.cyl(bowR + 0.06, 0.18, trim, { at: [bx, base + g, bowZ], segs: 16 });
      for (const a of [-0.8, 0, 0.8]) {
        const x = bx + Math.sin(a) * bowR;
        const z = bowZ + Math.cos(a) * bowR;
        sash(b, [x, base + 0.05, z], a, 1.0, 2.9, { bars: [2, 5] });
        sash(b, [x, base + g + 0.35, z], a, 1.0, 2.3, { bars: [2, 4] });
      }
      // first-floor balcony round the bow, with a tented canopy over it
      b.cyl(bowR + 0.45, 0.12, trim, { at: [bx, base + g + 0.18, bowZ], segs: 16 });
      bowRailing(b, bx, base + g + 0.3, bowZ, bowR + 0.4, iron);
      b.cone(bowR + 0.55, 0.75, tint(P.lead, 0.05), { at: [bx, base + g + 2.85, bowZ], segs: 16 });
      for (const a of [-1.0, 0, 1.0]) b.box(0.04, 0.6, 0.04, iron, { at: [bx + Math.sin(a) * (bowR + 0.45), base + g + 2.3, bowZ + Math.cos(a) * (bowR + 0.45)] });
    });

    // ---- shallow hipped slate roof with deep eaves and a plain soffit
    const ov = 1.1;
    b.box(W + ov * 2 - 0.1, 0.22, D + ov * 2 - 0.1, trim, { at: [0, H - 0.05, zc] });
    b.hip(W + 0.1, D + 0.1, 2.1, P.slate, { at: [0, H + 0.17, zc], overhang: ov });
    // chimney stacks with pots on the hips
    b.sym((s) => b.chimney(0.8, 2.4, 1.6, stucco, { at: [s * 3.6, H + 1.1, zc], pots: 3 }));

    // ---- Greek Doric porch: two columns, plain entablature, balcony railing on top
    const pz = zf + 1.8;
    b.box(3.3, base, 2.2, tint(stucco, -0.1), { at: [0, 0, zf + 1.0] });
    b.sym((s) => {
      b.column(0.24, 3.2, trim, { at: [s * 1.25, base, pz - 0.15], order: 'doric', segs: 12 });
      b.box(0.5, 3.2, 0.5, trim, { at: [s * 1.25, base, zf + 0.25] }); // anta against the wall
    });
    b.box(3.3, 0.55, 2.2, trim, { at: [0, base + 3.2, zf + 1.0] });
    for (const x of linspace(6, -1.4, 1.4)) b.panel(0.18, 0.3, tint(trim, -0.1), { at: [x, base + 3.32, zf + 2.1], facing: '+z', depth: 0.03 });
    for (const x of linspace(10, -1.5, 1.5)) b.box(0.04, 0.8, 0.04, iron, { at: [x, base + 3.75, zf + 2.05] });
    b.box(3.2, 0.05, 0.05, iron, { at: [0, base + 4.55, zf + 2.05] });
    b.sym((s) => {
      for (const z of linspace(4, zf + 0.2, zf + 2.0)) b.box(0.04, 0.8, 0.04, iron, { at: [s * 1.6, base + 3.75, z] });
      b.box(0.05, 0.05, 1.9, iron, { at: [s * 1.6, base + 4.55, zf + 1.1] });
    });
    // door with a semicircular fanlight; French window above onto the porch roof
    b.window(1.4, 3.15, { at: [0, base, zf], facing: '+z', shape: 'round', frame: P.white, bars: [1, 1], border: 0.08 });
    b.panel(1.24, 2.4, door, { at: [0, base + 0.02, zf], facing: '+z', depth: 0.1 });
    b.stairs(2.4, base, 0.6, 2, tint(stucco, -0.06), { at: [0, 0, zf + 2.4] });
    sash(b, [0, base + g + 0.25, zf], '+z', 1.15, 2.6, { bars: [2, 5] });

    // ---- sides and garden front
    for (const sx of [-1, 1]) {
      const fx = sx > 0 ? '+x' : '-x';
      for (const z of [zc - 2.4, zc + 2.4]) {
        sash(b, [sx * W / 2, base + 0.6, z], fx, 1.15, 2.6, { sill: trim });
        sash(b, [sx * W / 2, base + g + 0.5, z], fx, 1.15, 2.2, { sill: trim });
      }
    }
    for (const x of [-4, 0, 4]) {
      sash(b, [x, base + 0.05, zb], '-z', 1.2, 2.9, { bars: [2, 5] });
      sash(b, [x, base + g + 0.5, zb], '-z', 1.15, 2.2, { sill: trim });
    }
    // cast-iron verandah along the garden front
    for (const x of linspace(6, -5.8, 5.8)) b.box(0.08, 3.0, 0.08, iron, { at: [x, base, zb - 1.9] });
    b.box(12, 0.12, 0.12, iron, { at: [0, base + 2.95, zb - 1.9] });
    b.shed(12.2, 2.0, 0.55, tint(P.lead, 0.08), { at: [0, base + 3.05, zb - 1.0], high: '+z' });
    b.box(12.2, 0.12, 2.0, tint(stucco, -0.06), { at: [0, 0, zb - 1.0] });

    // ---- grounds: gravel sweep, dwarf wall with railings, a cedar and shrubs
    b.box(9, 0.04, 1.6, P.gravel, { at: [0, 0, 11.3] });
    b.sym((s) => {
      b.box(7.8, 0.5, 0.35, tint(stucco, -0.08), { at: [s * 5.6, 0, 11.8] });
      for (const x of linspace(16, 2.0, 9.4)) b.box(0.04, 0.9, 0.04, iron, { at: [s * x, 0.5, 11.8] });
      b.box(7.6, 0.05, 0.05, iron, { at: [s * 5.6, 1.35, 11.8] });
      b.box(0.55, 1.5, 0.55, trim, { at: [s * 1.6, 0, 11.8] });
      b.sphere(0.25, trim, { at: [s * 1.6, 1.75, 11.8], segs: 8 });
    });
    const tx = b.variant === 0 ? 5.5 : b.pick([-5.5, 5.5]);
    b.tree(10, { at: [tx, 0, -7.5], kind: 'conifer', color: P.leafDark });
    b.tree(6, { at: [-tx, 0, -9], kind: 'round' });
    b.box(18, 0.04, 9, P.grass, { at: [0, 0, -6.8] });
  },
};
