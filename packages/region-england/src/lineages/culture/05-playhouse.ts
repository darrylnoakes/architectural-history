import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { ruinWall } from './shared';
import { PRIORY, westDoorway } from './04-priory';

export const playhouse: BuildingDef = {
  id: 'playhouse',
  name: 'Playhouse',
  style: 'Elizabethan timber-framed',
  date: '1599',
  summary:
    'Henry VIII dissolved the priory in 1539. Its lands were sold and its walls quarried for building stone until only the arched west doorway of its church was left standing, in a broken stretch of the front. ' +
    'Sixty years later a company of players put up this open-air playhouse beside it: a ring of some twenty sides, with three storeys of timber-framed galleries ' +
    'round an open yard, roofed in thatch. Groundlings paid a penny to stand in the yard, more to sit in the galleries, and the stage ' +
    'thrust out among them. It is a building for paying crowds rather than for God or a lord, framed in oak by house carpenters.',
  materials: ['oak frame', 'lath and lime plaster', 'water-reed thatch', 'brick plinth', 'reused priory stone'],
  modelledOn: "The Globe, Bankside, Southwark (1599), as rebuilt in Shakespeare's Globe (1997)",
  lookFor: [
    { label: 'Open yard', note: 'Unroofed, so the plays ran in daylight. The groundlings stood here, close round the stage.', at: [-3.5, 1.2, 3.5] },
    { label: 'Thrust stage', note: 'A platform pushed out into the audience, so actors were watched from three sides.', at: [-3.5, 2.2, -3.2] },
    { label: 'The heavens', note: 'The canopy over the stage, held up on two painted columns and painted underneath with stars.', at: [-3.5, 7.4, -3.0] },
    { label: 'Thatched roof', note: 'Thatch over the galleries only. In 1613 a cannon fired during Henry VIII set the Globe thatch alight and it burned down.', at: [-3.5, 12.2, 10] },
    { label: 'Ruined priory doorway', note: 'The Norman west doorway of the priory church, left standing where it was built when the rest was quarried after the Dissolution.', at: [-16.4, 5.6, 11] },
  ],
  build(b) {
    const n = 20;
    const cx = -3.5;
    const cz = 0;
    const Ro = 12; // outer radius (to the corners)
    const Ri = 8.4; // inner radius
    const H = 9.6; // eaves
    const floors = [3.4, 6.5];
    const step = (Math.PI * 2) / n;
    const half = Math.PI / n;
    const plaster = tint(P.limewash, b.range(-0.03, 0));
    const oak = b.pick([P.oak, tint(P.oak, -0.05)]);
    const thatch = P.thatch;
    // lathes are turned by half a facet so that facet 0 faces the street (+Z)
    const ring = { at: [cx, 0, cz] as [number, number, number], rotY: half, segs: n };
    const facetPos = (k: number, r: number): [number, number, number] => {
      const a = k * step;
      const ap = r * Math.cos(half);
      return [cx + ap * Math.sin(a), cz + ap * Math.cos(a), a];
    };
    const stageFacets = new Set([9, 10, 11]);

    // brick plinth, outer wall and its timber framing
    b.lathe([[Ro + 0.12, 0], [Ro + 0.12, 0.7], [Ri - 0.12, 0.7], [Ri - 0.12, 0], [Ro + 0.12, 0]], P.brickRed, ring);
    b.lathe([[Ro, 0.7], [Ro, H]], plaster, ring);
    b.lathe([[Ri + 0.4, 0.7], [Ri + 0.4, H]], tint(plaster, -0.08), ring); // back wall of the galleries, seen from the yard
    const fw = 2 * Ro * Math.sin(half);
    for (let k = 0; k < n; k++) {
      const [x, z, a] = facetPos(k, Ro);
      if (k === 0) b.frame(fw - 0.05, H - 3.4, oak, { at: [x, 3.4, z], facing: a, studs: 1, rails: 1, beam: 0.18 });
      else b.frame(fw - 0.05, H - 0.7, oak, { at: [x, 0.7, z], facing: a, studs: 1, rails: 2, brace: k % 2 ? 'none' : 'corner', beam: 0.18 });
    }
    // gallery floors and the thatched ring roof, ridged in the middle
    for (const y of floors) b.lathe([[Ri - 0.1, y], [Ro, y], [Ro, y + 0.25], [Ri - 0.1, y + 0.25], [Ri - 0.1, y]], oak, ring);
    const Rm = (Ro + Ri) / 2;
    b.lathe(
      [[Ro + 0.6, H - 0.35], [Rm, H + 2.3], [Ri - 0.6, H - 0.3], [Ri - 0.6, H + 0.15], [Rm, H + 2.8], [Ro + 0.6, H + 0.1], [Ro + 0.6, H - 0.35]],
      thatch,
      ring,
    );

    // the yard face: posts at every corner, balustraded fronts to each gallery
    const yardPost = (k: number): [number, number] => {
      const a = (k + 0.5) * step;
      return [cx + Ri * Math.sin(a), cz + Ri * Math.cos(a)];
    };
    const iw = 2 * Ri * Math.sin(half);
    for (let k = 0; k < n; k++) {
      const [px, pz] = yardPost(k);
      b.box(0.3, H - 0.3, 0.3, oak, { at: [px, 0.7, pz], rotY: (k + 0.5) * step });
      if (stageFacets.has(k)) continue;
      const [x, z, a] = facetPos(k, Ri);
      for (const y of [0.7, ...floors.map((f) => f + 0.25)]) {
        b.box(iw - 0.3, 0.95, 0.08, mix(oak, plaster, 0.35), { at: [x, y, z], rotY: a });
        b.box(iw, 0.12, 0.16, oak, { at: [x, y + 0.95, z], rotY: a });
      }
    }
    b.cyl(Ri, 0.05, tint(P.earth, 0.05), { at: [cx, 0, cz], rotY: half, segs: n });

    // main entrance on the street side
    b.panel(1.8, 2.6, P.oakDark, { at: [cx, 0.05, cz + Ro * Math.cos(half)], facing: '+z' });
    b.panel(2.4, 0.5, oak, { at: [cx, 2.65, cz + Ro * Math.cos(half)], facing: '+z', depth: 0.2 });

    // two stair turrets outside the ring
    b.sym((s) => {
      const [x, z, a] = facetPos(s > 0 ? 7 : 13, Ro + 1.4);
      b.box(3.4, H - 1.2, 2.8, plaster, { at: [x, 0, z], rotY: a });
      b.frame(3.4, H - 1.9, oak, { at: [x + Math.sin(a) * 1.4, 0.7, z + Math.cos(a) * 1.4], facing: a, studs: 2, rails: 2, beam: 0.18 });
      b.box(3.5, 0.7, 2.9, P.brickRed, { at: [x, 0, z], rotY: a });
      b.gable(3.4, 2.8, 1.8, thatch, { at: [x, H - 1.2, z], rotY: a, ridge: 'z', overhang: 0.25, wall: plaster, thick: 0.35 });
      b.panel(1.0, 2.1, P.oakDark, { at: [x + Math.sin(a) * 1.42, 0.05, z + Math.cos(a) * 1.42], facing: a });
    });

    // ---------------------------------------------------------------- stage, tiring house, heavens, hut
    const fz = cz - Ri * Math.cos(step * 1.5); // frons scenae: the chord across the three stage facets
    const fwid = 2 * Ri * Math.sin(step * 1.5) + 0.3;
    const painted = tint(P.doorRed, 0.05);
    b.box(fwid, H - 0.7, 0.4, painted, { at: [cx, 0.7, fz] });
    b.panel(2.4, 3.2, P.black, { at: [cx, 2.0, fz + 0.2], facing: '+z', shape: 'round' });
    b.sym((s) => b.panel(1.2, 2.3, P.oakDark, { at: [cx + s * 3.0, 2.0, fz + 0.2], facing: '+z' }));
    for (const y of [5.4, 8.4]) b.box(fwid, 0.12, 0.6, P.gold, { at: [cx, y, fz + 0.3] });
    b.box(fwid - 0.4, 0.95, 0.08, oak, { at: [cx, 6.6, fz + 0.7] }); // lords' rooms balcony front
    b.box(fwid, 0.25, 0.9, oak, { at: [cx, 6.5, fz + 0.45] });

    const sw = 9.4;
    const sd = 5.8;
    const sh = 1.5;
    const sz = fz + 0.2 + sd / 2;
    b.box(sw, sh, sd, oak, { at: [cx, 0, sz] });
    b.box(sw + 0.1, 0.12, sd + 0.1, tint(P.pine, -0.05), { at: [cx, sh, sz] });
    b.sym((s) => b.column(0.32, 6.0, tint(P.marble, -0.04), { at: [cx + s * 3.3, sh, sz + 1.4], order: 'corinthian', segs: 8 }));
    const hy = sh + 6.0;
    const hd = sd + 1.2;
    b.box(sw + 0.8, 0.35, hd, oak, { at: [cx, hy, fz + hd / 2] });
    b.box(sw + 0.6, 0.06, hd - 0.2, P.doorBlue, { at: [cx, hy - 0.06, fz + hd / 2] }); // painted sky
    for (let i = 0; i < 6; i++) b.box(0.18, 0.02, 0.18, P.gold, { at: [cx - 3.5 + i * 1.4, hy - 0.08, fz + 1.5 + (i % 3) * 1.6] });
    b.gable(sw + 0.8, hd + 1.2, 2.8, thatch, { at: [cx, hy + 0.35, fz + hd / 2 - 0.6], ridge: 'z', overhang: 0.3, wall: painted, thick: 0.35 });
    // the hut above the heavens, with the flag that showed a play was on
    const hutZ = fz - 1.2;
    const hutY = H + 0.4;
    b.box(5, 2.6, 3.2, plaster, { at: [cx, hutY, hutZ] });
    b.frame(5, 2.6, oak, { at: [cx, hutY, hutZ + 1.6], facing: '+z', studs: 2, rails: 0, beam: 0.16 });
    b.gable(5, 3.2, 1.6, thatch, { at: [cx, hutY + 2.6, hutZ], overhang: 0.25, wall: plaster, thick: 0.3 });
    b.cyl(0.07, 4.0, P.oakDark, { at: [cx, hutY + 3.6, hutZ], segs: 5 });
    b.box(1.8, 1.1, 0.04, b.pick([P.white, P.black, P.postRed]), { at: [cx + 0.95, hutY + 6.4, hutZ] });

    // ---------------------------------------------------------------- the ruined priory doorway
    // the middle of the priory's west front, still standing where it stood, with stubs of the nave walls
    const stone = tint(P.limestone, -0.05);
    const N = PRIORY.nave;
    const nz = (N.z0 + N.z1) / 2;
    const nw = N.z1 - N.z0;
    ruinWall(b, nw, 8.7, 10.2, 1.1, stone, { at: [N.x0 + 0.55, 0, nz], rotY: Math.PI / 2, arch: { w: 1.6, h: 3.0 } });
    westDoorway(b, stone, true);
    ruinWall(b, 3.2, 0.8, 3.4, 0.9, stone, { at: [N.x0 + 1.6, 0, N.z0 + 0.45], endHigh: 3.4 });
    ruinWall(b, 2.4, 0.4, 2.2, 0.9, stone, { at: [N.x0 + 1.2, 0, N.z1 - 0.45], endHigh: 2.2 });
    for (const [x, z, r] of [[-13.6, 10.2, 0.7], [-14.8, 6.6, 0.5], [-16.2, 14.2, 0.45]]) {
      b.blob(r, tint(stone, -0.04), { at: [x, 0, z], stretch: [1.3, 0.6, 1], detail: 0 });
    }
    b.blob(0.9, P.leafDark, { at: [N.x0 + 0.4, 7.0, nz + 2.0], stretch: [1.2, 1.8, 0.6], detail: 0 }); // ivy
    b.tree(5.5, { at: [14.5, 0, -9] });

    // ---------------------------------------------------------------- walk collisions
    const gd = Ro - Ri + 0.3;
    for (let k = 1; k < n; k++) {
      const [x, z, a] = facetPos(k, (Ro + Ri) / 2);
      b.collider(fw * 0.98, gd, { at: [x, 0, z], rotY: a });
    }
    b.sym((s) => {
      const [x, z, a] = facetPos(s > 0 ? 7 : 13, Ro + 1.4);
      b.collider(3.4, 2.8, { at: [x, 0, z], rotY: a });
    });
    b.collider(sw, sd, { at: [cx, 0, sz] });
    b.sym((s) => b.collider(1.1, (nw - 1.6) / 2, { at: [N.x0 + 0.55, 0, nz + s * (0.8 + (nw - 1.6) / 4)] }));
  },
};
