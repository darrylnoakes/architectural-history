import { P, tint, type Builder, type BuildingDef } from '@ah/kit';

const ZF = 6.3; // street front
const HD = 4.3; // depth of each house
const ZB = ZF - HD * 2; // court front
const PL = 0.15;
const G = 2.7;
const F = 2.5;
const H = PL + G + F;

/** One house front (door, window, window over, cellar light) on the wall at z = zw facing `facing`. */
function houseFront(b: Builder, x: number, w: number, zw: number, facing: '+z' | '-z', doorSide: 1 | -1, brick: number, door: number, front: boolean): void {
  const s = facing === '+z' ? 1 : -1;
  const arch = tint(brick, -0.12);
  const sill = P.limestone;
  const dx = x + doorSide * (w / 2 - 0.85);
  const wx = x - doorSide * 0.55;
  // door with a small overlight under a brick arch, a stone step
  b.panel(1.15, 2.6, arch, { at: [dx, PL, zw], facing, shape: 'segmental', depth: 0.03 });
  b.panel(0.9, 1.95, door, { at: [dx, PL, zw], facing, depth: 0.07 });
  b.window(0.9, 0.4, { at: [dx, PL + 2.0, zw], facing, frame: P.white, border: 0.05 });
  b.box(1.1, PL, 0.35, sill, { at: [dx, 0, zw + s * 0.17] });
  // ground-floor sash under a segmental brick arch, stone sill
  const sash = (sx: number, y: number, ww: number, hh: number) => {
    b.panel(ww + 0.25, hh + 0.2, arch, { at: [sx, y, zw], facing, shape: 'segmental', depth: 0.03 });
    b.window(ww, hh, { at: [sx, y, zw], facing, frame: P.white, bars: [2, 2], border: 0.08 });
    b.box(ww + 0.2, 0.1, 0.16, sill, { at: [sx, y - 0.1, zw + s * 0.06] });
  };
  sash(wx, PL + 0.85, 1.05, 1.45);
  sash(wx, PL + G + 0.5, 1.05, 1.35);
  if (w > 3.5) sash(dx, PL + G + 0.6, 0.7, 1.15);
  // cellar light with an iron grate in the pavement (front houses only had cellars)
  if (front) {
    b.panel(0.8, 0.3, P.timberBlack, { at: [wx, 0.02, zw], facing });
    b.box(0.9, 0.04, 0.5, P.castIron, { at: [wx, 0, zw + s * 0.27] });
  }
}

export const backToBacks: BuildingDef = {
  id: 'back-to-backs',
  name: 'Back-to-back terrace',
  style: 'Victorian speculative terrace',
  date: 'c. 1850',
  summary:
    'Factory towns grew faster than anyone could house their workers, and speculative builders answered with the back-to-back: two rows of houses built against a shared spine wall, one row facing the street and the other a court behind. ' +
    'Each family had one room on each floor, and the whole court shared a water pump, a wash-house and a block of privies. ' +
    'Cheap mass-made brick and Welsh slate, carried by canal and railway, replace local stone and thatch for good. ' +
    'Reformers blamed such courts for cholera, and most towns banned new back-to-backs over the following decades, though Leeds went on building them until the 1930s.',
  materials: ['red brick', 'Welsh slate', 'pine sashes', 'cast iron'],
  lookFor: [
    { label: 'Back-to-back houses', note: 'Every street house shares its back wall with a court house behind, so neither has a back window or through draught.', at: [-6.2, 4.2, 6.4] },
    { label: 'Tunnel entry', note: 'A passage through the row, under the upstairs rooms, leading to the court behind.', at: [-1.8, 1.4, 6.5] },
    { label: 'Shared privies', note: 'One block of earth closets for the whole court, emptied by night-soil men.', at: [-3.5, 2.4, -6.3] },
    { label: 'Corner shop', note: 'The end house is a shop with a big glazed front and a painted fascia, selling food and coal by the pennyworth.', at: [8.8, 3.2, 6.5] },
    { label: 'Spine-wall chimneys', note: 'The stacks rise from the shared central wall, each serving four fireplaces: two front houses and two back.', at: [2.4, 9.3, 2.0] },
  ],
  influences: ['industrial-export'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, -0.04), P.brickDark, tint(P.brickOrange, -0.06)]);
    const slate = b.pick([P.slate, P.slateBlue]);
    const doors = [P.doorGreen, P.doorBlue, P.doorRed, P.doorBlack, P.oakDark, tint(P.doorGreen, 0.06)];
    // bays from left to right: house, house, tunnel, house, house, shop
    const bays: { kind: 'house' | 'tunnel' | 'shop'; w: number }[] = [
      { kind: 'house', w: 4.0 },
      { kind: 'house', w: 4.0 },
      { kind: 'tunnel', w: 1.2 },
      { kind: 'house', w: 4.0 },
      { kind: 'house', w: 4.0 },
      { kind: 'shop', w: 4.8 },
    ];
    if (b.variant !== 0 && b.chance(0.5)) bays.unshift(bays.splice(1, 1)[0]); // tunnel shifts one bay
    const L = bays.reduce((a, c) => a + c.w, 0);
    const zc = ZF - HD;
    const rh = HD * Math.tan((30 * Math.PI) / 180);

    b.box(L, H, HD * 2, brick, { at: [0, 0, zc] });
    b.box(L + 0.06, 0.18, HD * 2 + 0.06, tint(brick, -0.08), { at: [0, H - 0.18, zc] }); // dentil eaves course
    b.gable(L, HD * 2, rh, slate, { at: [0, H, zc], overhang: 0.18, thick: 0.12, wall: brick });

    let x0 = -L / 2;
    let houseNo = 0;
    const stackXs: number[] = [];
    bays.forEach((bay, i) => {
      const x = x0 + bay.w / 2;
      if (bay.kind === 'tunnel') {
        for (const [z, f] of [
          [ZF, '+z'],
          [ZB, '-z'],
        ] as const) {
          b.panel(bay.w + 0.25, 2.5, tint(brick, -0.12), { at: [x, 0, z], facing: f, shape: 'round', depth: 0.03 });
          b.panel(bay.w - 0.1, 2.3, P.timberBlack, { at: [x, 0, z], facing: f, shape: 'round', depth: 0.06 });
        }
        b.box(bay.w - 0.1, 0.04, HD * 2 + 0.4, P.cobble, { at: [x, 0, zc] });
      } else if (bay.kind === 'shop') {
        // shopfront: pilasters, stallriser, big window, recessed door, fascia
        const sf = P.doorGreen;
        b.box(bay.w - 0.2, 3.0, 0.2, sf, { at: [x, 0, ZF + 0.08] });
        b.box(bay.w - 0.6, 0.6, 0.12, tint(sf, -0.06), { at: [x - 0.45, 0.05, ZF + 0.22] });
        b.window(bay.w - 1.9, 1.75, { at: [x - 0.45, 0.68, ZF + 0.18], facing: '+z', frame: sf, bars: [3, 2], mat: 'glass', glass: P.glassDark, border: 0.08 });
        b.panel(0.9, 2.15, P.timberBlack, { at: [x + bay.w / 2 - 0.85, 0.05, ZF + 0.18], facing: '+z' });
        b.box(bay.w, 0.6, 0.32, tint(sf, -0.1), { at: [x, 2.45, ZF + 0.12] });
        b.panel(bay.w - 1.2, 0.26, P.cream, { at: [x, 2.62, ZF + 0.28], facing: '+z' });
        b.sym((k) => b.box(0.24, 3.05, 0.34, tint(sf, -0.08), { at: [x + k * (bay.w / 2 - 0.12), 0, ZF + 0.12] }));
        // upstairs of the shop and its back house
        b.window(1.05, 1.35, { at: [x - 0.9, PL + G + 0.5, ZF], facing: '+z', frame: P.white, bars: [2, 2] });
        b.window(1.05, 1.35, { at: [x + 0.9, PL + G + 0.5, ZF], facing: '+z', frame: P.white, bars: [2, 2] });
        houseFront(b, x, bay.w, ZB, '-z', 1, brick, b.pick(doors), false);
        // shop window round the corner and an enamel advertising sign
        b.window(1.6, 1.6, { at: [L / 2, 0.75, ZF - 1.4], facing: '+x', frame: sf, bars: [2, 2], mat: 'glass', glass: P.glassDark });
        b.panel(1.1, 0.75, P.cladBlue, { at: [L / 2, 2.0, ZF - 3.2], facing: '+x', depth: 0.04 });
        b.panel(0.9, 0.22, P.cream, { at: [L / 2, 2.3, ZF - 3.2], facing: '+x', depth: 0.06 });
        b.window(1.05, 1.35, { at: [L / 2, PL + G + 0.5, ZF - 2.2], facing: '+x', frame: P.white, bars: [2, 2] });
      } else {
        const side: 1 | -1 = houseNo % 2 === 0 ? -1 : 1;
        houseFront(b, x, bay.w, ZF, '+z', side, brick, b.pick(doors), true);
        houseFront(b, x, bay.w, ZB, '-z', side, brick, b.pick(doors), false);
        houseNo++;
      }
      if (bay.kind !== 'tunnel' && i < bays.length - 1) stackXs.push(x0 + bay.w);
      x0 += bay.w;
    });
    // spine-wall stacks: every other party wall, each with four pots
    const used = stackXs.filter((_, i) => i % 2 === 0);
    used.push(L / 2 - 0.35);
    for (const sx of used) b.chimney(0.75, rh + 1.25, 1.4, brick, { at: [sx, H, zc], pots: 4 });

    // the court: setts, privy block, wash-house with copper chimney, pump, washing line
    b.box(L, 0.04, ZB + 7, P.cobble, { at: [0, 0, (ZB - 7) / 2], jitter: false });
    const pz = -6.3;
    b.box(7.4, 2.2, 1.3, brick, { at: [-4.2, 0, pz] });
    b.shed(7.6, 1.5, 0.45, slate, { at: [-4.2, 2.2, pz], high: '-z' });
    for (let i = 0; i < 4; i++) b.panel(0.75, 1.75, b.pick([P.oakSilver, P.doorGreen]), { at: [-7.0 + i * 1.85, 0.05, pz + 0.65], facing: '+z' });
    // ash pit
    b.box(1.6, 1.0, 1.2, brick, { at: [-9.6, 0, pz] });
    // wash-house
    b.box(3.4, 2.4, 1.6, brick, { at: [3.6, 0, pz + 0.1] });
    b.shed(3.6, 1.8, 0.5, slate, { at: [3.6, 2.4, pz + 0.1], high: '-z' });
    b.panel(0.9, 1.9, P.oakSilver, { at: [3.0, 0.05, pz + 0.9], facing: '+z' });
    b.window(0.8, 0.7, { at: [4.4, 1.2, pz + 0.9], facing: '+z', frame: P.white, bars: [2, 2] });
    b.chimney(0.5, 1.6, 0.5, brick, { at: [4.9, 2.6, pz - 0.2], pots: 1 });
    // pump
    b.cyl(0.16, 1.3, P.castIron, { at: [-0.8, 0, -3.6], segs: 8 });
    b.sphere(0.18, P.castIron, { at: [-0.8, 1.35, -3.6], segs: 6 });
    b.box(0.08, 0.08, 0.5, P.castIron, { at: [-0.8, 1.15, -3.3] });
    b.box(0.5, 0.25, 0.4, P.limestone, { at: [-0.8, 0, -3.15] });
    // washing line
    b.box(0.08, 2.0, 0.08, P.oakSilver, { at: [6.5, 0, -3.6] });
    b.box(0.08, 2.0, 0.08, P.oakSilver, { at: [10.5, 0, -4.2] });
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.7) / 4.6;
      b.box(0.55, 0.65, 0.03, b.pick([P.white, P.cream, P.doorBlue, P.pinkWash]), { at: [6.5 + 4 * t, 1.25, -3.6 - 0.6 * t], rotY: Math.atan2(0.6, 4) });
    }
  },
};
