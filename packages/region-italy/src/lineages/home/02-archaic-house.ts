import { P, tint, type BuildingDef } from '@ah/kit';
import { coppiRoof, vegBed, well } from './shared';

export const archaicHouse: BuildingDef = {
  id: 'archaic-house',
  name: 'Archaic house',
  style: 'Etruscan archaic',
  date: 'c. 550 BC',
  summary:
    'In the seventh and sixth centuries BC the oval hut gave way to rectangular houses with straight walls and a roof of fired clay ' +
    'tiles, a new and costly technology learned from the Greeks. Heavy tiles need a square frame and solid walls, so the house stands ' +
    'on footings of squared tufa with walls of mudbrick or rammed clay above. Behind a shallow porch on posts lie two or three rooms ' +
    'side by side, each with its own door, as in the houses excavated at Acquarossa near Viterbo.',
  materials: ['tufa footings', 'mudbrick plastered with clay', 'timber posts and roof frame', 'fired terracotta tiles and antefixes'],
  modelledOn: 'The houses of the Etruscan town at Acquarossa, near Viterbo (seventh to sixth century BC)',
  influences: ['greek-colonies'],
  lookFor: [
    {
      label: 'Tiled roof',
      note: 'Broad flat pan tiles laid side by side, with narrow cover tiles over the joints: the same system the Romans used, and the ribs it makes are still on every Italian roof.',
      at: [-2.5, 3.9, 0.2],
    },
    {
      label: 'Antefixes',
      note: 'A row of painted terracotta plaques closes the lower end of each cover tile along the eaves; on houses they were simple shells and palmettes.',
      at: [1.9, 2.75, 5.6],
    },
    {
      label: 'Porch',
      note: 'A shallow porch on timber posts runs along the front; each room opens off it, so it is the hall, workshop and passage of the house.',
      at: [-3.3, 1.6, 4.3],
    },
    {
      label: 'Tufa footings',
      note: 'A base of squared blocks of the local volcanic tufa keeps the clay walls clear of the wet ground.',
      at: [5.3, 0.35, -1.2],
    },
    {
      label: 'Mudbrick walls',
      note: 'Above the footings the walls are of sun-dried brick or rammed earth, plastered with clay; only the roof was fired.',
      at: [-1.6, 1.9, -2.7],
    },
  ],
  build(b) {
    const W = 10.4;
    const zb = -2.6;
    const zf = 3.0; // front wall of the rooms
    const zp = 5.0; // front of the porch
    const foot = 0.65;
    const H = 2.75;
    const mud = tint(b.pick([P.mudbrick, P.cob, tint(P.mudbrick, 0.05)]), b.range(-0.02, 0.02));
    const tufa = P.tufa;
    const tile = tint(P.romanTile, b.range(-0.04, 0.03));
    const zc = (zf + zb) / 2;
    const D = zf - zb;

    // footings of squared tufa blocks, in two courses
    const blocks = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.round(len / 0.95);
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      for (let k = 0; k < 2; k++) {
        const joints = [0];
        for (let i = 1; i < n; i++) joints.push((i - (k ? 0.5 : 0)) / n);
        joints.push(1);
        for (let i = 0; i < joints.length - 1; i++) {
          const t0 = joints[i];
          const t1 = joints[i + 1];
          const tm = (t0 + t1) / 2;
          const l = (t1 - t0) * len - 0.04;
          if (l <= 0.1) continue;
          const x = x0 + (x1 - x0) * tm;
          const z = z0 + (z1 - z0) * tm;
          const c = tint(tufa, b.range(-0.05, 0.04));
          if (alongX) b.box(l, foot / 2 - 0.02, 0.62, c, { at: [x, k * (foot / 2), z] });
          else b.box(0.62, foot / 2 - 0.02, l, c, { at: [x, k * (foot / 2), z] });
        }
      }
    };
    blocks(-W / 2, zf, W / 2, zf);
    blocks(-W / 2, zb, W / 2, zb);
    blocks(-W / 2, zb, -W / 2, zf);
    blocks(W / 2, zb, W / 2, zf);
    b.box(W - 0.2, foot, D - 0.2, tint(tufa, -0.08), { at: [0, 0, zc] }); // core

    // clay walls
    b.box(W - 0.06, H - foot, D - 0.06, mud, { at: [0, foot, zc] });
    // cross walls show as faint pilasters front and back
    for (const x of [-W / 6, W / 6]) {
      b.box(0.5, H - foot, D + 0.04, tint(mud, -0.04), { at: [x, foot, zc] });
    }

    // the porch: a floor of beaten earth on a tufa kerb, five posts on stone bases
    b.box(W, 0.18, zp - zf, P.earth, { at: [0, 0, (zf + zp) / 2] });
    b.box(W, 0.2, 0.3, tufa, { at: [0, 0, zp - 0.15] });
    const posts = [-5.0, -1.72, 1.72, 5.0];
    for (const x of posts) {
      b.box(0.42, 0.25, 0.42, tufa, { at: [x, 0.15, zp - 0.3] });
      b.cyl(0.13, H - 0.4, P.oak, { at: [x, 0.4, zp - 0.3], segs: 6 });
    }
    b.box(W + 0.3, 0.22, 0.24, P.oakDark, { at: [0, H - 0.1, zp - 0.3] }); // beam over the posts

    // doors to the three rooms, timber frames
    for (const x of [-W / 3, 0, W / 3]) {
      b.panel(1.15, 2.05, P.oakDark, { at: [x, 0.2, zf + 0.0], facing: '+z', depth: 0.06 });
      b.panel(0.9, 1.95, x === 0 ? P.timberBlack : P.oak, { at: [x, 0.2, zf + 0.03], facing: '+z', depth: 0.06 });
    }
    // small high windows with shutters at the back and in one end
    for (const x of [-W / 3, W / 3]) {
      b.panel(0.6, 0.45, P.timberBlack, { at: [x, 1.85, zb], facing: '-z' });
      b.panel(0.7, 0.08, P.oak, { at: [x, 1.8, zb], facing: '-z', depth: 0.1 });
    }
    b.panel(0.5, 0.45, P.timberBlack, { at: [W / 2, 1.9, zc], facing: '+x' });

    // the roof: low tiled gable over rooms and porch, with wide eaves
    const ov = 0.55;
    const rz0 = zb;
    const rz1 = zp;
    const span = rz1 - rz0;
    const rc = (rz0 + rz1) / 2;
    const rise = 1.5;
    coppiRoof(b, W, span, rise, tile, { at: [0, H, rc], overhang: ov, wall: mud, thick: 0.13, step: 0.55 });
    // antefixes along both eaves, one at the foot of each cover tile
    const run = W + ov * 2;
    const n = Math.max(2, Math.round(run / 0.55));
    const L = run - 0.2;
    const half = span / 2;
    const drop = (ov * rise) / half;
    const t = (0.13 * Math.hypot(half, rise)) / half;
    const paint = [P.terracottaPainted, P.cream, tint(P.terracotta, 0.06)];
    for (const s of [1, -1]) {
      for (let i = 0; i < n; i++) {
        const u = -L / 2 + ((i + 0.5) / n) * L;
        const y = H - drop + t - 0.05;
        const z = rc + s * (half + ov + 0.01);
        b.extrude(
          [[-0.15, 0], [0.15, 0], [0.17, 0.12], [0.1, 0.25], [0, 0.29], [-0.1, 0.25], [-0.17, 0.12]],
          0.05,
          paint[i % (s > 0 ? 3 : 2)],
          { at: [u, y, z], rotY: s > 0 ? 0 : Math.PI },
        );
      }
    }
    // the gable ends left open at the top for smoke, closed with a lattice
    b.sym((s) => {
      b.extrude([[-0.45, 0], [0.45, 0], [0, 0.42]], 0.06, P.timberBlack, { at: [s * (W / 2 + 0.02), H + rise - 0.62, rc], rotY: Math.PI / 2 });
    });

    // yard: a cistern well, a domed bread oven, storage jars, a vegetable plot and an olive
    const yz = -6.2;
    well(b, [3.4, 0, yz], tufa, { frame: 'wood' });
    b.dome(0.9, tint(P.cob, -0.05), { at: [-4.6, 0, -4.4], squash: 0.85, segs: 10 });
    b.panel(0.45, 0.4, P.timberBlack, { at: [-4.6, 0, -3.52], facing: '+z', shape: 'round' });
    for (const [x, z] of [[-W / 2 + 0.6, 4.4], [-W / 2 + 1.25, 4.5], [W / 2 - 0.7, 4.3]] as [number, number][]) {
      b.cyl(0.3, 0.75, tint(P.terracotta, -0.05), { at: [x, 0.18, z], rTop: 0.18, segs: 8 });
    }
    vegBed(b, -2.0, -6.6, 4.2, 3.4, { rows: 6 });
    b.tree(b.range(3.6, 4.4), { at: [4.6, 0, -7.2], kind: 'olive' });
    // the yard enclosed by a low wall of rubble
    b.box(13.4, 0.9, 0.45, tint(tufa, -0.03), { at: [0, 0, -8.6] });
    b.sym((s) => b.box(0.45, 0.9, 5.6, tint(tufa, -0.03), { at: [s * 6.5, 0, -5.8] }));
  },
};
