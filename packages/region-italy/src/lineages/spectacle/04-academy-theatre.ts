import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { statue } from './shared';

/** Hall walls: x -16..16, z -8..12, eaves at 12, ridge along X at z = 2. */
const HX = 16;
const HZ0 = -8;
const HZ1 = 12;
const EAVES = 12;
const RIDGE = 17.6;
const RZ = (HZ0 + HZ1) / 2;

/** Stage (proscenium) and stage front (frons scenae). */
const STAGE_H = 1.3;
const FRONS_Z = -6.2;
const STAGE_FRONT = -2.2;
/** Cavea: semi-ellipse centred here, its Z radii squashed by this factor. */
const CZ = STAGE_FRONT + 0.4;
const SQ = 0.74;

/** Cavea section, [radius, height]: the orchestra edge, thirteen tiers of seats, the top walkway. */
function caveaSteps(): [number, number][] {
  const pts: [number, number][] = [[6.4, 0.02]];
  let r = 6.4;
  let y = 0.02;
  for (let i = 0; i < 13; i++) {
    y += 0.42;
    pts.push([r, y]);
    r += 0.48;
    pts.push([r, y]);
  }
  pts.push([13.9, y]);
  return pts;
}

export const academyTheatre: BuildingDef = {
  id: 'academy-theatre',
  name: 'Academy theatre',
  style: 'Late Renaissance (Palladian)',
  date: '1585',
  summary:
    'The town’s learned academy, a club of nobles and scholars devoted to reviving antiquity, built itself a theatre to stage the tragedies of ancient Greece in the Roman manner described by Vitruvius. ' +
    'From outside it is a plain plastered hall squeezed into older buildings. Inside, a half-oval of thirteen wooden tiers, crowned by a colonnade with statues, faces a permanent stage front of two storeys of columns, ' +
    'and through its openings streets of houses recede in forced perspective. It is all timber, brick and stucco painted to look like marble. ' +
    'On the model the tiles are lifted off half the roof to show the auditorium; the real theatre is fully roofed.',
  materials: ['plastered brick', 'timber seating and stage', 'stucco painted as marble', 'coppi roof tiles'],
  modelledOn:
    'Teatro Olimpico, Vicenza: designed by Andrea Palladio in 1580 for the Accademia Olimpica, completed after his death by Vincenzo Scamozzi, who added the perspective streets; opened on 3 March 1585 with Oedipus Rex',
  influences: ['renaissance-birth'],
  lookFor: [
    {
      label: 'Frons scenae',
      note: 'The permanent stage front, copied from Roman theatres: two storeys of Corinthian columns, niches with statues of the academy’s members, and an attic of relief panels.',
      at: [-8.4, 9.0, FRONS_Z + 0.6],
    },
    {
      label: 'Porta regia',
      note: 'The great central arch. Through it, and through the side doors, streets of little palaces seem to run far away, though they are only a few metres deep.',
      at: [0, 4.2, FRONS_Z + 0.4],
    },
    {
      label: 'Semi-elliptical cavea',
      note: 'Thirteen tiers of wooden seats. Palladio flattened the Roman semicircle into a half-oval to fit the wide, shallow hall.',
      at: [6.5, 4.0, 5.0],
    },
    {
      label: 'Colonnade with statues',
      note: 'Corinthian columns crown the top of the seating, with statues on their balustrade, as in the Roman theatres Palladio drew.',
      at: [-8.0, 9.4, 8.0],
    },
    {
      label: 'Plain exterior',
      note: 'Plastered walls and a tiled roof give no hint of the interior: the theatre was fitted into the buildings of an old fortress.',
      at: [HX + 0.3, 6.0, -1.0],
    },
  ],
  build(b) {
    const plaster = tint(b.pick([P.intonacoCream, P.plaster, mix(P.intonacoOchre, P.plaster, 0.5)]), b.range(-0.03, 0.02));
    const stone = tint(P.pietraSerena, 0.12);
    const roof = tint(P.coppi, b.range(-0.03, 0.02));
    const oak = P.oak;
    const stucco = tint(P.marble, -0.04); // stucco painted as marble
    const stuccoShade = mix(stucco, P.limestoneWarm, 0.35);
    const wood = tint(P.pine, -0.08);

    // ------------------------------------------------ the hall: four plain walls, gable ends front and back
    const t = 0.7;
    b.sym((s) => {
      b.box(2 * HX, EAVES, t, plaster, { at: [0, 0, s > 0 ? HZ1 - t / 2 : HZ0 + t / 2] });
      b.extrude([[-HX, EAVES], [HX, EAVES], [0, RIDGE]], t, plaster, { at: [0, 0, s > 0 ? HZ1 - t / 2 : HZ0 + t / 2] });
      b.box(t, EAVES, HZ1 - HZ0, plaster, { at: [s * (HX - t / 2), 0, (HZ0 + HZ1) / 2] });
      // eaves cornice
      b.box(0.5, 0.35, HZ1 - HZ0 + 0.5, tint(plaster, -0.08), { at: [s * (HX + 0.1), EAVES - 0.35, (HZ0 + HZ1) / 2] });
      // a few high windows
      for (const z of [-4.5, 1.5, 7.5]) b.window(1.3, 2.0, { at: [s * HX, 8.4, z], facing: s > 0 ? '+x' : '-x', frame: stone, bars: [2, 3] });
    });
    b.box(2 * HX - 1.4, 0.25, HZ1 - HZ0 - 1.4, mix(wood, P.oakDark, 0.3), { at: [0, 0, (HZ0 + HZ1) / 2] }); // floor

    // ------------------------------------------------ roof: on the model the tiles are lifted off, leaving a few trusses
    for (const z of [HZ0 + 1.0, -1.2, 5.4, HZ1 - 1.0]) {
      b.beam([-HX + 0.3, EAVES, z], [HX - 0.3, EAVES, z], 0.3, 0.32, oak); // tie beam
      b.sym((s) => b.beam([s * (HX - 0.2), EAVES + 0.15, z], [0, RIDGE - 0.15, z], 0.26, 0.3, oak)); // rafters
      b.beam([0, EAVES, z], [0, RIDGE - 0.1, z], 0.24, 0.24, oak); // king post
    }
    b.beam([0, RIDGE - 0.2, HZ0], [0, RIDGE - 0.2, HZ1], 0.3, 0.3, oak);
    // the edges of the roof left on the gables and the eaves, so its pitch still reads
    b.sym((s) => {
      b.beam([s * (HX + 0.5), EAVES - 0.05, HZ0 - 0.4], [s * (HX + 0.5), EAVES - 0.05, HZ1 + 0.4], 1.4, 0.22, roof);
      for (const z of [HZ0 - 0.1, HZ1 + 0.1]) b.beam([s * (HX + 0.6), EAVES - 0.1, z], [0, RIDGE + 0.12, z], 0.7, 0.24, roof);
    });

    // ------------------------------------------------ front range (entrance rooms) with a rusticated portal
    const fz0 = HZ1;
    const fz1 = 16.6;
    b.box(26, 7, fz1 - fz0, plaster, { at: [0, 0, (fz0 + fz1) / 2] });
    b.hip(26, fz1 - fz0, 1.6, roof, { at: [0, 7, (fz0 + fz1) / 2], overhang: 0.4 });
    b.group({ at: [0, 0, fz1] }, () => {
      for (let i = 0; i < 6; i++) b.panel(4.4, 0.5, stone, { at: [0, i * 0.6, 0], depth: 0.12 + (i % 2) * 0.06 });
      b.panel(2.2, 3.4, P.oakDark, { at: [0, 0, 0.1], shape: 'round', depth: 0.12 });
      b.panel(3.2, 0.3, stone, { at: [0, 3.8, 0], depth: 0.2 });
      for (const x of [-9, -5, 5, 9]) b.window(1.1, 1.8, { at: [x, 3.6, 0], frame: stone, bars: [2, 3] });
    });

    // ------------------------------------------------ the scene building behind, with the perspective streets
    const az0 = -16.8;
    b.box(20, 9.5, FRONS_Z - 1.0 - az0, plaster, { at: [0, 0, (az0 + FRONS_Z - 1.0) / 2] });
    b.gable(20, FRONS_Z - 1.0 - az0, 2.4, roof, { at: [0, 9.5, (az0 + FRONS_Z - 1.0) / 2], ridge: 'z', overhang: 0.4, wall: plaster });
    b.window(1.2, 1.8, { at: [0, 6.0, az0], facing: '-z', frame: stone, bars: [2, 3] });

    // ------------------------------------------------ the stage
    b.box(26.2, STAGE_H, STAGE_FRONT - FRONS_Z, wood, { at: [0, 0, (FRONS_Z + STAGE_FRONT) / 2] });
    b.box(26.2, 0.9, 0.12, tint(stucco, -0.1), { at: [0, 0.2, STAGE_FRONT + 0.02] });

    // frons scenae: a wall of stucco with the central arch and two side doors
    const fy0 = STAGE_H - 0.05;
    const fy1 = 11.5;
    b.extrude(
      [[-13, fy0], [13, fy0], [13, fy1], [-13, fy1]],
      1.0,
      stuccoShade,
      {
        at: [0, 0, FRONS_Z - 0.5],
        holes: [
          [[-1.6, STAGE_H], [1.6, STAGE_H], [1.6, STAGE_H + 3.6], [0.8, STAGE_H + 4.6], [0, STAGE_H + 4.8], [-0.8, STAGE_H + 4.6], [-1.6, STAGE_H + 3.6]],
          [[-7.3, STAGE_H], [-5.7, STAGE_H], [-5.7, STAGE_H + 3.2], [-7.3, STAGE_H + 3.2]],
          [[5.7, STAGE_H], [7.3, STAGE_H], [7.3, STAGE_H + 3.2], [5.7, STAGE_H + 3.2]],
        ],
      },
    );
    const colX = [-11.2, -8.4, -4.6, -2.3, 2.3, 4.6, 8.4, 11.2];
    const lowTop = STAGE_H + 4.6;
    const upBase = lowTop + 0.9;
    const upTop = upBase + 3.4;
    for (const x of colX) {
      b.box(0.8, 0.5, 0.8, stucco, { at: [x, STAGE_H, FRONS_Z + 0.35] });
      b.column(0.26, lowTop - STAGE_H - 0.5, stucco, { at: [x, STAGE_H + 0.5, FRONS_Z + 0.35], order: 'corinthian', segs: 6 });
      b.box(0.7, 0.6, 0.7, stucco, { at: [x, upBase - 0.1, FRONS_Z + 0.3] });
      b.column(0.22, upTop - upBase - 0.5, stucco, { at: [x, upBase + 0.5, FRONS_Z + 0.3], order: 'corinthian', segs: 6 });
    }
    for (const [y, h] of [[lowTop, 0.75], [upTop, 0.6]] as [number, number][]) {
      b.box(26.4, h, 0.9, stucco, { at: [0, y, FRONS_Z + 0.25] });
      b.box(26.6, 0.15, 1.05, tint(stucco, -0.05), { at: [0, y + h - 0.15, FRONS_Z + 0.25] });
    }
    // attic of relief panels
    for (const x of [-9.8, -6.5, -3.4, 0, 3.4, 6.5, 9.8]) b.panel(2.4, 0.9, tint(stucco, 0.04), { at: [x, upTop + 0.75, FRONS_Z], depth: 0.1 });
    // niches with statues of the academicians
    for (const x of [-9.8, 9.8]) {
      b.panel(1.1, 2.8, tint(stuccoShade, -0.12), { at: [x, STAGE_H + 0.9, FRONS_Z], shape: 'round', depth: 0.03 });
      statue(b, [x, STAGE_H + 1.0, FRONS_Z + 0.3], 1.9, stucco);
    }
    for (const x of [-9.8, -6.5, -3.45, 3.45, 6.5, 9.8]) {
      b.panel(1.0, 2.4, tint(stuccoShade, -0.12), { at: [x, upBase + 0.4, FRONS_Z], shape: 'round', depth: 0.03 });
      statue(b, [x, upBase + 0.5, FRONS_Z + 0.3], 1.7, stucco);
    }
    b.panel(3.0, 1.1, tint(stucco, 0.04), { at: [0, upBase + 1.2, FRONS_Z], depth: 0.1 }); // relief over the arch
    // the side walls of the stage (versurae), each with a door
    b.sym((s) => {
      b.box(0.6, fy1 - STAGE_H, STAGE_FRONT - FRONS_Z + 0.3, stuccoShade, { at: [s * 13.3, STAGE_H, (FRONS_Z + STAGE_FRONT) / 2 - 0.15] });
      b.panel(1.2, 2.8, P.windowDark, { at: [s * 13.0, STAGE_H, (FRONS_Z + STAGE_FRONT) / 2], facing: s > 0 ? '-x' : '+x', depth: 0.03 });
      b.column(0.22, 4.0, stucco, { at: [s * 12.6, STAGE_H, STAGE_FRONT - 0.6], order: 'corinthian', segs: 6 });
    });

    // perspective streets: little palaces shrinking and the floor rising as they run back
    const street = (x0: number, n: number, w0: number) => {
      for (let i = 0; i < n; i++) {
        const z = FRONS_Z - 1.6 - i * 1.6;
        const h = 5.6 - i * 0.75;
        const floor = STAGE_H + i * 0.22;
        b.box(2 * w0 - i * 0.34, 0.22 + i * 0.22, 1.6, wood, { at: [x0, STAGE_H, z] });
        b.sym((s) => {
          const x = x0 + s * (w0 - i * 0.17 + 0.5);
          b.box(1.0, h, 1.5, i % 2 ? stucco : tint(P.intonacoOchre, 0.12), { at: [x, floor, z] });
          b.panel(0.32, 0.6, P.windowDark, { at: [x - s * 0.5, floor + h * 0.55, z], facing: s > 0 ? '-x' : '+x' });
        });
      }
    };
    street(0, 5, 1.5);
    street(-6.5, 3, 0.8);
    street(6.5, 3, 0.8);

    // ------------------------------------------------ the cavea, squashed into a half-oval
    const steps = caveaSteps();
    const topY = steps[steps.length - 1][1];
    b.group({ at: [0, 0, CZ], scale: [1, 1, SQ] }, () => {
      b.lathe(steps, wood, { start: -Math.PI / 2, sweep: Math.PI, segs: 16 });
      b.lathe([[0, 0.03], [6.4, 0.03]], tint(stucco, -0.08), { start: -Math.PI / 2, sweep: Math.PI, segs: 16 }); // orchestra
      // the walkway, the entablature and balustrade over the colonnade
      b.lathe([[13.3, topY + 4.0], [14.3, topY + 4.0], [14.3, topY + 4.6], [13.3, topY + 4.6], [13.3, topY + 4.0]], stucco, {
        start: -Math.PI / 2,
        sweep: Math.PI,
        segs: 16,
      });
      b.lathe([[13.4, topY + 4.6], [13.4, topY + 5.4], [14.2, topY + 5.4], [14.2, topY + 4.6]], stuccoShade, { start: -Math.PI / 2, sweep: Math.PI, segs: 16 });
      b.lathe([[14.5, 0], [14.5, topY + 5.4]], tint(stuccoShade, -0.1), { start: -Math.PI / 2, sweep: Math.PI, segs: 16 }); // back wall
    });
    // ends of the seating, closing the section
    b.sym((s) => {
      const prof: [number, number][] = [[6.4, 0], ...steps.map(([r, y]) => [r, y] as [number, number]), [14.5, topY], [14.5, 0]];
      b.extrude(
        prof.map(([r, y]) => [s * r, y]),
        0.3,
        tint(stuccoShade, -0.05),
        { at: [0, 0, CZ - 0.15] },
      );
    });
    // the colonnade on the top walkway, with statues on its balustrade
    const nc = 13;
    for (let i = 0; i < nc; i++) {
      const a = -Math.PI / 2 + ((i + 0.5) / nc) * Math.PI;
      const x = 13.8 * Math.sin(a);
      const z = CZ + 13.8 * Math.cos(a) * SQ;
      b.column(0.2, 4.0, stucco, { at: [x, topY, z], order: 'corinthian', segs: 5 });
      if (i % 2 === 0) statue(b, [x, topY + 5.4, z], 1.3, stucco);
    }

    // ------------------------------------------------ walk collisions: the outer volumes
    b.collider(2 * HX, HZ1 - HZ0, { at: [0, 0, (HZ0 + HZ1) / 2] });
    b.collider(26, fz1 - fz0, { at: [0, 0, (fz0 + fz1) / 2] });
    b.collider(20, FRONS_Z - 1.0 - az0, { at: [0, 0, (az0 + FRONS_Z - 1.0) / 2] });
  },
};
