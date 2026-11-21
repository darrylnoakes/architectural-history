import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { cathedral, framed, circlePts, statue, onWall, FF, TOWER, BAROQUE, type Pt } from './shared';
import { gothicFacade } from './07-gothic-duomo';

const TRAV = P.travertine;
const CX = -12.4; // chapel centre
const CZC = -3.6;

/**
 * A domed side chapel of the 1600s, opening off the north aisle: a travertine cube with paired
 * pilasters and a heavy cornice, an oval window under a curved pediment, then a drum braced by
 * scrolls, a lead-covered dome and a small lantern.
 */
export function baroqueChapel(b: Builder) {
  const w = 5.8;
  const d = 6.0;
  const h = 9.0;
  const xo = CX - w / 2; // outer face
  b.box(w + 0.4, 0.5, d + 0.4, tint(TRAV, -0.05), { at: [CX - 0.2, 0, CZC] });
  b.box(w, h, d, TRAV, { at: [CX, 0, CZC] });
  // pilasters at the corners of the outer face and of the side faces
  for (const z of [CZC - d / 2 + 0.45, CZC + d / 2 - 0.45]) {
    b.box(0.25, h - 0.9, 0.7, tint(TRAV, 0.05), { at: [xo - 0.1, 0.5, z], jitter: false });
  }
  for (const zf of [CZC - d / 2, CZC + d / 2]) b.box(0.7, h - 0.9, 0.25, tint(TRAV, 0.05), { at: [xo + 0.45, 0.5, zf + (zf > CZC ? 0.1 : -0.1)], jitter: false });
  b.box(w + 0.7, 0.35, d + 0.7, TRAV, { at: [CX - 0.15, h - 0.9, CZC], jitter: false });
  b.box(w + 1.0, 0.55, d + 1.0, TRAV, { at: [CX - 0.2, h - 0.55, CZC] });
  // a tall window with a curved (segmental) pediment, and an oval window above
  framed(b, 'round', 1.3, 3.2, [xo, 2.2, CZC], '-x', tint(TRAV, 0.06), P.windowDark, 0.22);
  onWall(b, [xo, 0, CZC], '-x', () => {
    const y0 = 5.65;
    const ped: Pt[] = [[-1.75, y0], [1.75, y0]];
    for (let i = 0; i <= 8; i++) {
      const t = (Math.PI * i) / 8;
      ped.push([1.75 * Math.cos(t), y0 + 0.25 + 0.6 * Math.sin(t)]);
    }
    b.extrude(ped, 0.3, TRAV, { at: [0, 0, 0.15] });
    const ring = circlePts(0, 0, 1, 14);
    b.extrude(ring.map(([x, y]) => [x * 0.75, 7.35 + y * 0.6] as Pt), 0.06, tint(TRAV, 0.06), { at: [0, 0, 0.03], jitter: false });
    b.extrude(ring.map(([x, y]) => [x * 0.55, 7.35 + y * 0.42] as Pt), 0.06, P.windowDark, { at: [0, 0, 0.06], jitter: false });
  });

  // drum, scroll buttresses, dome and lantern
  const y = h;
  const o8 = { segs: 8, rotY: Math.PI / 8 };
  b.cyl(2.7, 2.4, TRAV, { ...o8, at: [CX, y, CZC] });
  b.cyl(2.95, 0.35, TRAV, { ...o8, at: [CX, y + 2.4, CZC] });
  for (let k = 0; k < 4; k++) {
    const phi = (k * Math.PI) / 2;
    const ap = 2.7 * Math.cos(Math.PI / 8);
    onWall(b, [CX + ap * Math.sin(phi), y + 0.7, CZC + ap * Math.cos(phi)], phi, () => {
      b.extrude(circlePts(0, 0.6, 0.62, 10), 0.05, tint(TRAV, 0.06), { at: [0, 0, 0.02], jitter: false });
      b.extrude(circlePts(0, 0.6, 0.45, 10), 0.05, P.windowDark, { at: [0, 0, 0.05], jitter: false });
    });
    const t = Math.PI / 4 + phi;
    b.group({ at: [CX + 2.6 * Math.sin(t), y, CZC + 2.6 * Math.cos(t)], rotY: t - Math.PI / 2 }, () => {
      b.extrude([[0, 0], [1.1, 0], [1.1, 0.35], [0.55, 0.55], [0.25, 1.1], [0.2, 1.9], [0, 2.1]], 0.35, TRAV, { jitter: false });
    });
  }
  b.lathe(
    [[2.75, 0], [2.65, 0.75], [2.3, 1.55], [1.7, 2.2], [0.95, 2.6], [0.5, 2.72]],
    P.lead,
    { at: [CX, y + 2.75, CZC], segs: 8, start: Math.PI / 8 },
  );
  b.cyl(0.5, 1.2, TRAV, { ...o8, at: [CX, y + 5.4, CZC] });
  b.cyl(0.65, 0.2, TRAV, { ...o8, at: [CX, y + 6.6, CZC] });
  b.cone(0.5, 0.8, P.lead, { ...o8, at: [CX, y + 6.8, CZC] });
  b.sphere(0.18, P.gold, { at: [CX, y + 7.7, CZC], segs: 6 });
  b.collider(w, d, { at: [CX, 0, CZC] });
}

/** Statues of saints set up along the old front: on the cornice over the doors and on the gables. */
export function frontStatues(b: Builder) {
  const s = 2.3;
  for (const x of [-7.6, -4.3, 4.3, 7.6]) statue(b, [x, 10.75, FF + 0.1], s, P.marble);
  for (const x of [-7.6, 7.6]) statue(b, [x, 19.1, FF + 0.1], s * 0.85, P.marble);
}

export const baroqueDuomo: BuildingDef = {
  id: 'baroque-duomo',
  name: 'Baroque additions',
  style: 'Baroque',
  date: 'c. 1630 to 1670',
  summary:
    'The Counter-Reformation church wanted drama and rich families wanted to be remembered, so the cathedral gained a domed chapel off the north aisle, lit from its own small dome, with paired pilasters, a curved pediment and scrolls bracing the drum, in the manner of Bernini’s Chapel of the Vow at Siena (1659 to 1662). ' +
    'A curved flight of steps now spills down into the square, statues of saints stand along the front, and the Gothic spire of the bell tower was replaced by an open octagonal belfry under a lead cupola. ' +
    'As in most Italian cathedrals, the change is by addition: the Gothic front, the dome, the Romanesque flanks and the baptistery all remain, and much of the new work was inside, in marble altars and stucco.',
  materials: ['travertine', 'lead', 'marble statues', 'stucco'],
  lookFor: [
    { label: 'Domed chapel', note: 'A family or votive chapel with its own drum, dome and lantern, added to the side of the old church.', at: [CX - 1.0, 13.5, CZC + 2.3] },
    { label: 'Scroll buttresses', note: 'Curving volutes brace the chapel’s drum: a Baroque way of turning structure into ornament.', at: [CX - 2.2, 10.6, CZC + 2.2] },
    { label: 'Curved steps', note: 'Convex steps that swell out into the square, inviting people up to the doors.', at: [0, 0.8, FF + 7.8] },
    { label: 'Statues of saints', note: 'Life-size figures set along the cornice and on the gables, speaking to the crowd in the square.', at: [4.3, 13.4, FF + 0.6] },
    { label: 'New belfry', note: 'The spire was taken down and replaced by an open octagonal belfry with a bulbous lead cupola.', at: [TOWER.x, 35.5, TOWER.z + 2.6] },
  ],
  modelledOn: 'Bernini’s Chapel of the Vow (Cappella del Voto), Siena Cathedral, for the chapel',
  build(b) {
    cathedral(b, BAROQUE);
    gothicFacade(b);
    frontStatues(b);
    baroqueChapel(b);
  },
};
