import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { type XZ, arcade, flatArch, lineColliders, pave, rectCollider, wallSeg, win } from './shared';

/** The great hall over its undercroft: undercroft storey g, hall storey u. */
const GH = { x0: -15, x1: 9, z0: -12, z1: -2, g: 4.6, u: 7.4 };
/** The two-storey chapel at the east (+X) end of the hall, with its apse. */
const CH = { x0: 9, x1: 16, z0: -11, z1: -3, h: 12.5, apse: 3.2 };
/** The tower at the west end. */
const TWR = { x0: -21, x1: -15, z0: -13, z1: -6, h: 19 };
/** The precinct wall and its gate. */
const WALL_Z = 16;

const stone = P.pierreBlonde;
const dark = tint(stone, -0.08);
const roof = P.tuilePlate;

/** A pair of tall lancets under one relieving arch, with a small round opening (oculus) between their heads. */
function pairedLancets(b: Builder, x: number, y: number, z: number, facing: '+z' | '-z'): void {
  b.group({ at: [x, y, z], rotY: facing === '+z' ? 0 : Math.PI }, () => {
    flatArch(b, 2.4, 4.9, dark, { shape: 'pointed', off: 0.03 });
    for (const s of [-0.55, 0.55]) flatArch(b, 0.75, 3.3, P.windowDark, { at: [s, 0.3, 0], shape: 'pointed', off: 0.06 });
    b.panel(0.55, 0.55, P.windowDark, { at: [0, 3.75, 0.03], shape: 'circle', depth: 0.04 });
  });
}

/** Stepped buttress against a wall face that faces `facing`, base centre on the face. */
function buttress(b: Builder, x: number, z: number, h: number, facing: '+z' | '-z'): void {
  const s = facing === '+z' ? 1 : -1;
  b.box(0.9, h * 0.55, 1.0, stone, { at: [x, 0, z + s * 0.5] });
  b.box(0.9, h * 0.45, 0.6, stone, { at: [x, h * 0.55, z + s * 0.3] });
  b.beam([x, h * 0.55, z + s * 1.0], [x, h * 0.55 + 0.6, z + s * 0.6], 0.9, 0.2, dark);
}

export const bishopsPalace: BuildingDef = {
  id: 'bishops-palace',
  name: 'Bishop-count’s palace',
  style: 'Early Gothic',
  date: 'c. 1180',
  summary:
    'By the twelfth century the bishop is lord of the town: in several cities of the north (Laon, Beauvais, Noyon, Châlons) the king had granted him the powers of the count as well, so that he coins money, holds the courts and takes the tolls. ' +
    'His palace beside the cathedral is built to show it, in cut stone: a great hall raised over a vaulted undercroft used for storage, reached by an outside stair and lit by tall paired lancets in the new pointed style, with a two-storey chapel at its end (the lower chapel for the household, the upper one for the bishop) and a tower. ' +
    'This is the power the townspeople will soon challenge by forming a commune.',
  materials: ['limestone ashlar', 'rubble', 'oak roof', 'flat clay tiles'],
  lookFor: [
    { label: 'Vaulted undercroft', note: 'The ground storey is vaulted in stone for storage and to carry the hall; its small windows sit between the buttresses.', at: [GH.x0 + 4, 1.6, GH.z1 + 0.3] },
    { label: 'Great hall', note: 'The bishop’s hall on the upper floor, where he held court, judged and feasted, lit by pairs of tall pointed lancets under a relieving arch.', at: [GH.x0 + 9.8, GH.g + 3.0, GH.z1 + 0.3] },
    { label: 'Outside stair', note: 'A broad stone stair climbs the front of the building to the hall door on the first floor.', at: [-3.7, 2.4, GH.z1 + 5.5] },
    { label: 'Two-storey chapel', note: 'A chapel of two storeys with a rounded apse: the lower for the household, the upper reached from the hall for the bishop himself.', at: [CH.x1 + CH.apse - 0.2, 7.5, (CH.z0 + CH.z1) / 2] },
    { label: 'Gate in the precinct wall', note: 'A wall with a gateway closes the bishop’s court off from the town.', at: [2.4, 4.8, WALL_Z + 0.6] },
  ],
  modelledOn:
    'The bishop’s palaces of Laon (twelfth-century double chapel) and Sens (the synodal hall, built a generation later, about 1230 to 1240), and the Palais du Tau, Reims (chapel about 1207); generic and reduced',
  build(b) {
    // the court before the palace (the same building stands alone on any plot)
    pave(b, -21.5, 21.5, -21.5, WALL_Z + 0.6, mix(P.gravel, P.earth, 0.3), -0.02);
    // ---- the great hall
    const { x0, x1, z0, z1, g, u } = GH;
    const W = x1 - x0;
    const D = z1 - z0;
    const xc = (x0 + x1) / 2;
    const zc = (z0 + z1) / 2;
    b.box(W, g + u, D, stone, { at: [xc, 0, zc] });
    b.box(W + 0.2, 0.3, D + 0.2, dark, { at: [xc, g, zc], jitter: false });
    b.box(W + 0.4, 0.6, D + 0.4, dark, { at: [xc, 0, zc], jitter: false });
    const bays = spread(6, x0 + 2, x1 - 2);
    const butt = spread(7, x0, x1);
    for (const x of butt.slice(1, -1)) {
      buttress(b, x, z1, g + u - 0.6, '+z');
      buttress(b, x, z0, g + u - 0.6, '-z');
    }
    bays.forEach((x, i) => {
      // the undercroft: small round-headed windows and doors
      if (i === 1 || i === 4) flatArch(b, 1.5, 2.5, P.oakDark, { at: [x, 0, z1], shape: 'round', off: 0.05, n: 3 });
      else flatArch(b, 0.6, 1.1, P.windowDark, { at: [x, 1.6, z1], shape: 'round', off: 0.05, n: 2 });
      flatArch(b, 0.6, 1.1, P.windowDark, { at: [x, 1.6, z0], facing: '-z', shape: 'round', off: 0.05, n: 2 });
      // the hall: paired lancets
      if (i !== 2) pairedLancets(b, x, g + 1.2, z1 + 0.01, '+z');
      pairedLancets(b, x, g + 1.2, z0 - 0.01, '-z');
    });
    // the steep roof, about 52 degrees, with a stone gable at the west
    b.gable(W, D, 6.4, roof, { at: [xc, g + u, zc], overhang: 0.3, wall: stone, thick: 0.18 });
    b.box(W + 0.6, 0.12, 0.25, tint(roof, -0.15), { at: [xc, g + u + 6.5, zc], jitter: false });
    // the outside stair along the front, up to the hall door in the middle bay
    const sx = bays[2];
    b.stairs(2.2, g, 7.6, 16, dark, { at: [sx, 0, z1 + 2.2 + 3.8] });
    b.box(2.6, g, 2.2, dark, { at: [sx, 0, z1 + 1.1] });
    for (const s2 of [-1, 1]) b.box(0.25, 1.0, 2.2, stone, { at: [sx + s2 * 1.2, g, z1 + 1.1], jitter: false });
    flatArch(b, 1.6, 3.2, P.oakDark, { at: [sx, g, z1], shape: 'pointed', off: 0.05 });
    flatArch(b, 2.2, 3.7, dark, { at: [sx, g, z1], shape: 'pointed', off: 0.03 });
    b.deck(2.6, 2.2, g, { at: [sx, 0, z1 + 1.1] });

    // ---- the two-storey chapel and its apse, its roof a little lower than the hall's
    const cxc = (CH.x0 + CH.x1) / 2;
    const czc = (CH.z0 + CH.z1) / 2;
    const cD = CH.z1 - CH.z0;
    b.box(CH.x1 - CH.x0, CH.h, cD, stone, { at: [cxc, 0, czc] });
    b.lathe([[CH.apse, 0], [CH.apse, CH.h]], stone, { at: [CH.x1, 0, czc], start: 0, sweep: Math.PI, segs: 7 });
    b.lathe([[CH.apse + 0.3, CH.h - 0.1], [0.1, CH.h + 3.2]], roof, { at: [CH.x1, 0, czc], start: 0, sweep: Math.PI, segs: 7 });
    b.gable(CH.x1 - CH.x0 + 0.3, cD, 5.0, roof, { at: [cxc + 0.15, CH.h, czc], overhang: 0.3, wall: stone, thick: 0.18 });
    b.box(CH.x1 - CH.x0 + 0.1, 0.3, cD + 0.1, dark, { at: [cxc, g, czc], jitter: false });
    for (const sgn of [-1, 1]) {
      const z = sgn > 0 ? CH.z1 : CH.z0;
      flatArch(b, 0.8, 1.6, P.windowDark, { at: [cxc, 1.6, z], facing: sgn > 0 ? '+z' : '-z', shape: 'round', n: 3 });
      flatArch(b, 1.0, 4.0, P.windowDark, { at: [cxc, g + 1.8, z], facing: sgn > 0 ? '+z' : '-z', shape: 'pointed' });
    }
    // windows round the apse, lower and upper chapel
    for (const a of [0.45, Math.PI / 2, Math.PI - 0.45]) {
      const px = CH.x1 + Math.sin(a) * (CH.apse + 0.02);
      const pz = czc + Math.cos(a) * (CH.apse + 0.02);
      flatArch(b, 0.6, 1.3, P.windowDark, { at: [px, 1.8, pz], facing: a, shape: 'round', n: 2 });
      flatArch(b, 0.8, 3.6, P.windowDark, { at: [px, g + 2.0, pz], facing: a, shape: 'pointed' });
    }
    // a small bellcote on the chapel gable
    b.box(0.8, 1.6, 1.2, stone, { at: [CH.x0 + 0.5, CH.h + 4.4, czc] });
    b.cone(0.75, 1.4, P.ardoise, { at: [CH.x0 + 0.5, CH.h + 6.0, czc], segs: 4 });
    b.box(0.08, 1.0, 0.6, dark, { at: [CH.x0 + 0.5, CH.h + 7.4, czc], jitter: false });

    // ---- the tower at the west end: the lord's strongpoint, crenellated
    const tx = (TWR.x0 + TWR.x1) / 2;
    const tz = (TWR.z0 + TWR.z1) / 2;
    const tW = TWR.x1 - TWR.x0;
    const tD = TWR.z1 - TWR.z0;
    b.box(tW, TWR.h, tD, stone, { at: [tx, 0, tz] });
    b.box(tW + 0.3, 0.3, tD + 0.3, dark, { at: [tx, g, tz], jitter: false });
    b.crenel(tW + 0.2, tD + 0.2, stone, { at: [tx, TWR.h, tz], merlonW: 0.7, merlonH: 0.9, t: 0.4 });
    b.box(tW - 0.6, 0.2, tD - 0.6, dark, { at: [tx, TWR.h - 0.2, tz], jitter: false });
    for (const y of [6, 10, 14.5]) {
      flatArch(b, 0.4, 1.4, P.windowDark, { at: [tx, y, TWR.z1], shape: 'round', n: 2 });
      flatArch(b, 0.4, 1.4, P.windowDark, { at: [TWR.x0, y, tz], facing: '-x', shape: 'round', n: 2 });
      flatArch(b, 0.4, 1.4, P.windowDark, { at: [tx, y, TWR.z0], facing: '-z', shape: 'round', n: 2 });
    }
    win(b, 1.1, 2.4, { at: [tx, g + 1.4, TWR.z1], shape: 'round', frame: dark, mullion: true });

    // ---- the precinct wall along the front, with a gatehouse arch in the middle
    const wl: XZ[] = [[-21.5, WALL_Z], [-1.8, WALL_Z]];
    const wr: XZ[] = [[1.8, WALL_Z], [21.5, WALL_Z]];
    for (const line of [wl, wr]) {
      wallSeg(b, line[0], line[1], 0.9, 4.2, mix(stone, P.rubble, 0.35));
      b.crenel(Math.abs(line[1][0] - line[0][0]), 0.9, mix(stone, P.rubble, 0.35), { at: [(line[0][0] + line[1][0]) / 2, 4.2, WALL_Z], merlonW: 0.6, merlonH: 0.7, t: 0.3 });
      lineColliders(b, line, 1.0);
    }
    b.group({ at: [0, 0, WALL_Z] }, () => {
      arcade(b, 6.4, 6.0, 2.6, stone, { openings: 1, openW: 3.4, openH: 4.6, shape: 'pointed', n: 3 });
      b.gable(6.6, 2.8, 2.0, roof, { at: [0, 6.0, 0] });
      flatArch(b, 0.9, 1.4, mix(stone, P.windowDark, 0.4), { at: [0, 4.2, 1.31], shape: 'pointed' }); // an empty niche for the patron saint
    });
    // the archway itself is open: shade only the soffit, so walkers pass through
    for (const s of [-1, 1]) b.collider(1.4, 2.6, { at: [s * 2.5, 0, WALL_Z] });

    // a well in the court and the colliders of the buildings
    b.cyl(0.9, 0.9, dark, { at: [-8, 0, 7], segs: 8 });
    b.collider(1.8, 1.8, { at: [-8, 0, 7] });
    rectCollider(b, x0, x1, z0 - 1, z1 + 1);
    rectCollider(b, sx - 1.3, sx + 1.3, z1, z1 + 9.8);
    rectCollider(b, CH.x0, CH.x1 + CH.apse, CH.z0, CH.z1);
    rectCollider(b, TWR.x0, TWR.x1, TWR.z0, TWR.z1);
    b.tree(9, { kind: 'round', at: [14, 0, 8] });
    b.tree(7, { kind: 'round', at: [-17, 0, 9] });
  },
};

/** Footprint of the stand-alone palace and its walled court, for the report. */
export const BISHOPS_FOOTPRINT = { x0: -21.5, x1: 21.5, z0: -13, z1: WALL_Z + 1.3 };
