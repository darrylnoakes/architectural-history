import * as THREE from 'three';
import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

const SZ0 = -3.8; // front of the stand
const SZ1 = -13.2; // back of the stand
const STAND_TOP = 8.6;
const ROOF_Y = 13.4;
const ROOF_TIP = -0.6;

/** A helical stair of concrete: a ramp of treads winding round a slender post, with a solid parapet. */
function helix(b: Builder, x: number, z: number, h: number, color: number): void {
  const turns = 2.25;
  const n = Math.round(turns * 16);
  const r0 = 0.45;
  const r1 = 1.9;
  const tread: number[] = [];
  const wall: number[] = [];
  const P3 = (r: number, a: number, y: number) => [x + r * Math.sin(a), y, z + r * Math.cos(a)];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * turns * Math.PI * 2;
    const a1 = ((i + 1) / n) * turns * Math.PI * 2;
    const y0 = (i / n) * h;
    const y1 = ((i + 1) / n) * h;
    const A = P3(r0, a0, y0);
    const B = P3(r1, a0, y0);
    const C = P3(r1, a1, y1);
    const D = P3(r0, a1, y1);
    tread.push(...A, ...B, ...C, ...A, ...C, ...D);
    // underside, a little lower, so the flight has thickness
    const Bl = P3(r1, a0, y0 - 0.35);
    const Cl = P3(r1, a1, y1 - 0.35);
    const Al = P3(r0, a0, y0 - 0.35);
    const Dl = P3(r0, a1, y1 - 0.35);
    tread.push(...Al, ...Cl, ...Bl, ...Al, ...Dl, ...Cl);
    const Bt = P3(r1, a0, y0 + 1.0);
    const Ct = P3(r1, a1, y1 + 1.0);
    wall.push(...Bl, ...Cl, ...Ct, ...Bl, ...Ct, ...Bt);
  }
  for (const [tris, col] of [[tread, color], [wall, tint(color, 0.04)]] as [number[], number][]) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris), 3));
    g.computeVertexNormals();
    b.add(g, col);
  }
  b.cyl(0.3, h + 1.0, color, { at: [x, 0, z], segs: 8 });
}

export const stadium: BuildingDef = {
  id: 'stadium',
  name: 'Municipal stadium',
  style: 'Rationalist engineering in reinforced concrete',
  date: '1932',
  summary:
    'Football and athletics became mass entertainment between the wars, and the Fascist regime promoted sport and paid for stadiums in town after town. ' +
    'This one shows the engineer’s art more than the architect’s: the concrete is left bare, and every part is shaped by the forces in it. ' +
    'The roof over the main stand is a thin slab hung from cantilevered beams, so no columns block the view; spiral stairs wind up to the upper terraces, and a slender tower marks the stadium across the town. ' +
    'Where the opera house seated two thousand by rank, the stand and the open terraces hold everyone together.',
  materials: ['reinforced concrete, left exposed', 'steel railings', 'cinder running track', 'grass'],
  modelledOn:
    'Stadio Giovanni Berta (now Artemio Franchi), Florence, by Pier Luigi Nervi (1930-32), a fragment much reduced; at Florence the tower stands on the opposite stand',
  influences: ['rationalism'],
  lookFor: [
    {
      label: 'Cantilevered roof',
      note: 'The canopy is carried only from behind: each beam is deep where it meets its column and tapers to a knife edge over the front rows.',
      at: [8.0, ROOF_Y + 0.6, -3.0],
    },
    {
      label: 'Spiral stairs',
      note: 'Helical flights of thin concrete wind up the outside of the stand, each step cantilevered from the twisting flight.',
      at: [18.0, 5.0, -9.0],
    },
    {
      label: 'Tower',
      note: 'A slender concrete tower with a stair inside, a landmark visible from far off and a platform for flags.',
      at: [-6.0, 27.0, -16.0],
    },
    {
      label: 'Raking stand',
      note: 'Terraces of concrete steps on sloping beams, the space underneath used for changing rooms and stores.',
      at: [0, 5.5, -9.0],
    },
    {
      label: 'Running track',
      note: 'A cinder track round the pitch: stadiums of the time were built for athletics as much as for football.',
      at: [-10.0, 0.6, -1.0],
    },
  ],
  build(b) {
    const conc = tint(P.concrete, b.range(-0.03, 0.02));
    const concDark = tint(conc, -0.08);
    const track = mix(P.brickOrange, P.earth, 0.45);
    const grass = tint(P.grass, 0.02);
    const W = 32;

    // ------------------------------------------------ pitch and track
    b.box(40, 0.05, 15.2, grass, { at: [0, 0, 10.4] });
    b.box(40, 0.06, 5.6, track, { at: [0, 0, 0.0] });
    for (let i = 1; i < 5; i++) b.box(40, 0.02, 0.06, P.white, { at: [0, 0.06, -2.8 + i * 1.12] });
    b.box(40, 0.02, 0.12, P.white, { at: [0, 0.06, 3.6] }); // touchline
    b.box(0.12, 0.02, 14.4, P.white, { at: [0, 0.06, 10.8] }); // halfway line
    for (let i = 0; i <= 14; i++) {
      const a = -Math.PI / 2 + (i / 14) * Math.PI;
      b.box(1.4, 0.02, 0.12, P.white, { at: [6.2 * Math.sin(a), 0.06, 18 - 6.2 * Math.cos(a) * 0.98], rotY: a + Math.PI / 2 });
    }
    b.box(W, 1.1, 0.25, concDark, { at: [0, 0, SZ0 + 0.4] }); // the low wall in front of the stand

    // ------------------------------------------------ the stand: stepped terraces on sloping beams
    const steps = 14;
    const prof: [number, number][] = [[-SZ0, 0]];
    for (let i = 0; i < steps; i++) {
      const z = SZ0 + ((SZ1 - SZ0) * i) / steps;
      const y = 1.2 + ((STAND_TOP - 1.2) * (i + 1)) / steps;
      prof.push([-z, y], [-(SZ0 + ((SZ1 - SZ0) * (i + 1)) / steps), y]);
    }
    prof.push([-SZ1, 0]);
    b.extrude(prof, W, conc, { at: [0, 0, 0], rotY: Math.PI / 2 });
    // the back wall with its windows, and the frames showing at the ends
    for (let i = 0; i < 7; i++) {
      const x = -13.7 + i * 4.57;
      b.window(2.4, 1.4, { at: [x, 4.4, SZ1], facing: '-z', frame: concDark, bars: [4, 1] });
      b.panel(1.2, 2.4, P.doorGreen, { at: [x + 1.6, 0, SZ1], facing: '-z' });
    }
    // a railing along the top
    b.box(W, 1.0, 0.1, P.castIron, { at: [0, STAND_TOP, SZ1 + 0.15] });

    // ------------------------------------------------ the cantilevered roof
    const xs = [-15.2, -10.1, -5.05, 0, 5.05, 10.1, 15.2];
    for (const x of xs) {
      // column behind the stand, rising to the root of the beam
      b.box(0.6, ROOF_Y, 0.9, conc, { at: [x, 0, SZ1 - 0.6] });
      // the beam: deep at the root, tapering to the tip, with a knee down to the column
      b.extrude(
        [
          [-(SZ1 - 1.05), ROOF_Y + 0.1],
          [-ROOF_TIP, ROOF_Y - 0.25],
          [-ROOF_TIP, ROOF_Y - 0.55],
          [-(SZ1 + 2.5), ROOF_Y - 1.9],
          [-(SZ1 - 0.15), ROOF_Y - 3.2],
          [-(SZ1 - 1.05), ROOF_Y - 3.2],
        ],
        0.4,
        conc,
        { at: [x, 0, 0], rotY: Math.PI / 2 },
      );
    }
    // the thin roof slab on the beams, falling slightly to the front
    b.beam([0, ROOF_Y + 0.12, SZ1 - 1.1], [0, ROOF_Y - 0.2, ROOF_TIP], W + 1.2, 0.18, tint(conc, 0.04));

    // ------------------------------------------------ the spiral stairs at the ends of the stand
    b.sym((s) => {
      helix(b, s * 18.0, -9.0, STAND_TOP, conc);
      b.box(1.6, 0.35, 2.4, conc, { at: [s * 16.8, STAND_TOP - 0.35, -9.6] }); // landing bridge to the stand
    });

    // ------------------------------------------------ the tower
    {
      const tx = -6;
      const tz = -16.2;
      const H = 26;
      b.box(2.2, H, 2.2, conc, { at: [tx, 0, tz] });
      b.sym((s) => b.box(0.35, H + 1.2, 0.6, concDark, { at: [tx + s * 1.25, 0, tz] })); // fins
      b.box(0.5, H - 6, 0.06, P.windowDark, { at: [tx, 3, tz + 1.12] }); // the slot of the stair
      b.box(3.6, 0.3, 3.6, conc, { at: [tx, H, tz] });
      b.box(3.6, 1.0, 0.1, P.castIron, { at: [tx, H + 0.3, tz + 1.75] });
      b.box(3.6, 1.0, 0.1, P.castIron, { at: [tx, H + 0.3, tz - 1.75] });
      b.box(3.0, 0.25, 3.0, conc, { at: [tx, H + 2.6, tz] });
      b.sym((s) => b.box(0.25, 2.3, 0.25, conc, { at: [tx + s * 1.3, H + 0.3, tz + 1.3] }));
      b.sym((s) => b.box(0.25, 2.3, 0.25, conc, { at: [tx + s * 1.3, H + 0.3, tz - 1.3] }));
      b.cyl(0.06, 5, P.steel, { at: [tx, H + 2.85, tz], segs: 4 });
      b.box(1.6, 1.0, 0.04, b.pick([P.postRed, P.white, P.doorGreen]), { at: [tx + 0.85, H + 6.6, tz] });
      b.panel(1.0, 2.2, P.doorGreen, { at: [tx, 0, tz + 1.1] });
    }

    // flagpoles by the track
    for (const x of [-14, 14]) b.cyl(0.05, 6, P.steel, { at: [x, 0, 4.4], segs: 4 });

    // ------------------------------------------------ walk collisions
    b.collider(W, SZ0 - SZ1 + 0.4, { at: [0, 0, (SZ0 + SZ1) / 2] });
    for (const x of xs) b.collider(0.8, 1.0, { at: [x, 0, SZ1 - 0.6] });
    b.sym((s) => b.collider(1.2, 1.2, { at: [s * 18, 0, -9] }));
    b.collider(3.0, 3.0, { at: [-6, 0, -16.2] });
  },
};
