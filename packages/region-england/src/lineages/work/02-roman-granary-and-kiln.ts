import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, riverWall } from './shared';

/** A Roman pot (jar or flagon) of height h, on `at`. */
function pot(b: Builder, x: number, y: number, z: number, h: number, col: number) {
  b.lathe([[0.01, 0], [h * 0.22, 0.02], [h * 0.34, h * 0.35], [h * 0.3, h * 0.7], [h * 0.14, h * 0.88], [h * 0.17, h]], col, { at: [x, y, z], segs: 8 });
}

export const romanGranaryAndKiln: BuildingDef = {
  id: 'roman-granary-and-kiln',
  name: 'Granary, pottery kiln and workshop',
  style: 'Romano-British',
  date: 'c. AD 100',
  summary:
    'Rome brought industry on a new scale: grain was taxed, stored and shipped, and pottery was made in thousands for the market rather than at home. ' +
    'The granary (horreum) is built of mortared stone with buttresses to hold its walls against the outward push of the grain, and its floor is lifted off the ground ' +
    'on low walls so that air flows underneath and keeps the grain dry and the rats out. Beside it a potter fires jars in an updraught kiln fed through a stokehole, ' +
    'and the riverbank becomes a timber quay for barges.',
  materials: ['limestone', 'lime mortar', 'Roman tile', 'oak', 'clay'],
  lookFor: [
    { label: 'Buttresses', note: 'Stone piers along the walls resist the sideways pressure of tons of loose grain.', at: [-11.2, 2.2, -1.2] },
    { label: 'Raised floor and vents', note: 'The floor sits on low walls with openings between them, so air moves under the grain store.', at: [-4.8, 0.5, -1.4] },
    { label: 'Loading platform', note: 'Carts backed up to the raised doorway, so sacks could be lifted straight in.', at: [3.1, 1.6, -6] },
    { label: 'Updraught kiln', note: 'Fire in the stokehole sends heat up through a perforated floor to the stacked pots inside the clay chamber.', at: [9.5, 1.6, 5.2] },
    { label: 'Tegula and imbrex roof', note: 'Flat flanged tiles laid with half-round tiles over the joints: a Roman invention, at the low pitch of a Mediterranean roof.', at: [-7, 7.6, -5.8] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const stone = b.pick([P.limestone, P.limestoneWarm, tint(P.limestone, -0.04)]);
    const tile = P.romanTile;

    // ---- horreum: long buttressed stone granary along the back of the plot
    const gx = -6.5;
    const gz = -5.8;
    const L = 17;
    const D = 8;
    const floor = 1.1;
    const H = 6.2;
    b.box(L, H, D, stone, { at: [gx, 0, gz] });
    // vent openings in the sub-floor walls between the buttresses
    const bays = 6;
    for (let i = 0; i < bays; i++) {
      const x = gx - L / 2 + (L / bays) * (i + 0.5);
      b.sym((s) => b.panel(0.7, 0.45, P.windowDark, { at: [x, 0.3, gz + (s * D) / 2], facing: s > 0 ? '+z' : '-z' }));
      // high slit windows for ventilation
      b.sym((s) => b.panel(0.3, 1.0, P.windowDark, { at: [x, 4.2, gz + (s * D) / 2], facing: s > 0 ? '+z' : '-z' }));
    }
    // buttresses: stepped piers along both long sides
    for (let i = 0; i <= bays; i++) {
      const x = gx - L / 2 + 0.35 + ((L - 0.7) / bays) * i;
      b.sym((s) => {
        const z = gz + s * (D / 2 + 0.45);
        b.box(0.7, H - 1.4, 0.9, stone, { at: [x, 0, z] });
        b.extrude([[-0.45, 0], [0.45, 0], [-0.45, 0.9]], 0.7, stone, { at: [x, H - 1.4, z], rotY: s > 0 ? Math.PI / 2 : -Math.PI / 2 });
      });
    }
    // string course at floor level
    b.box(L + 0.1, 0.18, D + 0.1, tint(stone, -0.06), { at: [gx, floor, gz] });
    // low-pitched tiled roof with eaves overhang and ridge of imbrices
    b.gable(L, D, 1.75, tile, { at: [gx, H, gz], overhang: 0.6, wall: stone, thick: 0.18 });
    b.log(0.14, L + 1.2, tint(tile, -0.08), { at: [gx, H + 1.8, gz], segs: 6 });
    // imbrex lines down the roof slopes
    for (let i = 0; i < 14; i++) {
      const x = gx - L / 2 + 0.6 + i * ((L - 1.2) / 13);
      b.sym((s) => {
        b.group({ at: [x, H + 0.95, gz + s * 2.2], rot: [s * 0.41, 0, 0] }, () => b.log(0.06, 4.6, tint(tile, -0.05), { axis: 'z', segs: 5 }));
      });
    }
    // loading platform and big door on the +X end
    const ex = gx + L / 2;
    b.box(2.4, floor, 4.4, stone, { at: [ex + 1.2, 0, gz] });
    b.box(2.5, 0.12, 4.5, P.oak, { at: [ex + 1.2, floor, gz] });
    b.panel(2.0, 2.4, P.oakDark, { at: [ex, floor + 0.12, gz], facing: '+x', shape: 'round' });
    b.stairs(1.4, floor, 1.6, 5, stone, { at: [ex + 1.6, 0, gz + 3.0] });
    // sacks on the platform
    for (let i = 0; i < 3; i++) b.blob(0.32, P.wattle, { at: [ex + 1.7, floor + 0.4, gz - 1.4 + i * 0.6], stretch: [1, 1.3, 1] });

    // ---- potter's workshop: a timber shed open to the yard
    const wx = -9;
    const wz = 6.2;
    const ww = 8;
    const wd = 5;
    b.box(ww, 2.7, 0.2, P.daub, { at: [wx, 0, wz - wd / 2 + 0.1] });
    b.sym((s) => b.box(0.2, 2.7, wd, P.daub, { at: [wx + s * (ww / 2 - 0.1), 0, wz] }));
    b.sym((s) => b.frame(wd, 2.7, P.oak, { at: [wx + s * ww / 2, 0, wz], facing: s > 0 ? '+x' : '-x', studs: 2, rails: 1 }));
    for (const x of [-ww / 2 + 0.15, -ww / 6, ww / 6, ww / 2 - 0.15]) b.box(0.2, 2.7, 0.2, P.oak, { at: [wx + x, 0, wz + wd / 2 - 0.1] });
    b.box(ww, 0.22, 0.24, P.oak, { at: [wx, 2.5, wz + wd / 2 - 0.1] });
    b.gable(ww, wd, 1.2, tile, { at: [wx, 2.7, wz], overhang: 0.45, wall: P.daub });
    // potter's wheel, a bench of pots and a clay heap
    b.cyl(0.4, 0.7, P.oakDark, { at: [wx - 1.6, 0, wz + 0.5], rTop: 0.45, segs: 10 });
    b.box(3.2, 0.8, 0.6, P.oak, { at: [wx + 1.4, 0, wz - 1.6] });
    for (let i = 0; i < 6; i++) pot(b, wx + 0.2 + i * 0.48, 0.8, wz - 1.6, 0.42, i % 2 ? P.concreteDark : P.terracotta);
    b.blob(0.55, P.soil, { at: [wx + 3.0, 0.2, wz + 1.3], stretch: [1, 0.6, 1] });

    // ---- updraught kiln: a clay chamber with a stokehole flue and a stoking pit
    const kx = 9.5;
    const kz = 5.2;
    b.lathe([[1.25, 0], [1.2, 0.9], [1.0, 1.35], [0.55, 1.55], [0.4, 1.55], [0.4, 1.4]], P.cob, { at: [kx, 0, kz], segs: 12 });
    b.cyl(0.5, 0.05, P.timberBlack, { at: [kx, 1.5, kz], segs: 10 });
    // flue tunnel out to the stoking pit, toward the front
    b.box(1.0, 0.7, 1.6, P.cob, { at: [kx, 0, kz + 1.6] });
    b.panel(0.55, 0.55, P.timberBlack, { at: [kx, 0, kz + 2.4], facing: '+z', shape: 'round' });
    b.box(1.6, 0.04, 1.4, P.soil, { at: [kx, 0, kz + 3.1], jitter: false });
    b.box(1.6, 0.25, 0.2, P.cob, { at: [kx, 0, kz + 3.85] });
    b.sym((s) => b.box(0.2, 0.25, 1.4, P.cob, { at: [kx + s * 0.85, 0, kz + 3.1] }));
    // fuel and finished pots
    for (let i = 0; i < 5; i++) b.log(0.09, 1.3, P.bark, { at: [kx + 2.2, (i % 2) * 0.17, kz + 2.4 + i * 0.12], axis: 'z' });
    for (let i = 0; i < 8; i++) pot(b, kx - 3.2 + (i % 4) * 0.5, 0, kz - 0.2 + Math.floor(i / 4) * 0.55, 0.55, i % 3 ? P.concreteDark : P.terracotta);

    // ---- the quay: a timber revetment with a wharf and a moored barge
    riverWall(b, -17, 17, P.oak);
    for (let i = 0; i < 18; i++) b.box(0.22, 1.6, 0.22, P.oakDark, { at: [-16.8 + i * 1.98, WATER - 0.3, BANK - 0.3] });
    b.box(34, 0.2, 0.25, P.oakDark, { at: [0, 0.05, BANK - 0.3] });
    b.group({ at: [-6, WATER - 0.25, BANK - 2.2] }, () => {
      b.box(9, 0.6, 2.4, P.oakDark);
      b.box(8.4, 0.12, 2.0, P.oak, { at: [0, 0.48, 0] });
      for (let i = 0; i < 6; i++) b.blob(0.32, P.wattle, { at: [-2.6 + i * 1.0, 0.85, 0], stretch: [1, 1.2, 1] });
    });
    // bollard posts on the quay
    for (const x of [-12, -1]) b.cyl(0.15, 0.7, P.oakDark, { at: [x, 0, BANK + 0.6], segs: 6 });

    b.collider(L + 2, D + 2, { at: [gx, 0, gz] });
    b.collider(2.4, 4.4, { at: [ex + 1.2, 0, gz] });
    b.collider(ww, wd, { at: [wx, 0, wz] });
    b.collider(2.6, 2.6, { at: [kx, 0, kz] });
  },
};
