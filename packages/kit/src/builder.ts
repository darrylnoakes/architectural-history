import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { P } from './palette';
import { mulberry32 } from './rng';
import type { Vec3 } from './types';

export type MatKind = 'matte' | 'glass';
export type Facing = '+z' | '-z' | '+x' | '-x' | number;
export type ArchShape = 'rect' | 'round' | 'pointed' | 'segmental' | 'circle';

export interface Opts {
  /** Position of the primitive's base centre (x, y of its bottom, z). Default [0, 0, 0]. */
  at?: Vec3;
  /** Rotation about the vertical axis, radians. */
  rotY?: number;
  /** Full Euler rotation [x, y, z] in radians, applied after rotY. Rarely needed. */
  rot?: Vec3;
  /** 'glass' gives a glossy, reflective surface. Default 'matte'. */
  mat?: MatKind;
  /** Set false to stop the tiny per-piece lightness variation. */
  jitter?: boolean;
}

export interface Collider {
  x: number;
  z: number;
  w: number;
  d: number;
  rotY: number;
}

export interface Deck {
  x: number;
  z: number;
  w: number;
  d: number;
  rotY: number;
  /** Height of the walkable surface at the centre. */
  y: number;
  /** Optional hump: height at the two Z ends (deck is a parabola between). */
  yEnds?: number;
}

export interface Built {
  object: THREE.Group;
  bounds: THREE.Box3;
  colliders: Collider[];
  decks: Deck[];
  triangles: number;
  /** True if the building asked whether to cut itself open (see `Builder.cutaway`): it has two forms. */
  hasCutaway: boolean;
}

const FACING: Record<string, number> = {
  '+z': 0,
  '+x': Math.PI / 2,
  '-z': Math.PI,
  '-x': -Math.PI / 2,
};

export function facingAngle(f: Facing | undefined): number {
  if (f === undefined) return 0;
  return typeof f === 'number' ? f : FACING[f];
}

let _materials: Record<MatKind, THREE.Material> | null = null;

/** The two shared materials every building uses. One draw call per material per building. */
export function getMaterials(): Record<MatKind, THREE.Material> {
  if (!_materials) {
    _materials = {
      matte: new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.92,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      glass: new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.12,
        metalness: 0.35,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
      }),
    };
  }
  return _materials;
}

const RUIN_GLSL = /* glsl */ `
float ruinHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruinNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(ruinHash(i), ruinHash(i + vec2(1.0, 0.0)), f.x), mix(ruinHash(i + vec2(0.0, 1.0)), ruinHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// the height to which the walls still stand at a point on the ground: mostly low, with the odd tall fragment
float ruinHeight(vec3 p) {
  float n = ruinNoise(p.xz * 0.42) * 0.65 + ruinNoise(p.xz * 1.9) * 0.35;
  return 0.4 + n * n * 4.8;
}`;

function ruinVertex(shader: { vertexShader: string }) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vRuinPos;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRuinPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
}

let _ruin: { surface: THREE.Material; depth: THREE.Material } | null = null;

/**
 * Materials that turn any building into its own ruin: everything above a ragged height is cut away,
 * so roofs go and walls stand to uneven heights, and what is left is weathered and mossed. Swap them
 * onto a built mesh (`mesh.material` and `mesh.customDepthMaterial`) to show it abandoned.
 */
export function getRuinMaterials(): { surface: THREE.Material; depth: THREE.Material } {
  if (!_ruin) {
    const surface = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    surface.onBeforeCompile = (shader) => {
      ruinVertex(shader);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vRuinPos;\n${RUIN_GLSL}`)
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float ruinTop = ruinHeight(vRuinPos);
          if (vRuinPos.y > ruinTop) discard;
          float ruinLum = dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(ruinLum) * vec3(0.96, 0.98, 0.9), 0.55) * 0.9;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.17, 0.24, 0.11), smoothstep(0.55, 0.0, ruinTop - vRuinPos.y) * 0.65);`,
        );
    };
    surface.customProgramCacheKey = () => 'ruin-surface';
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
    depth.onBeforeCompile = (shader) => {
      ruinVertex(shader);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vRuinPos;\n${RUIN_GLSL}`)
        .replace('void main() {', 'void main() {\n  if (vRuinPos.y > ruinHeight(vRuinPos)) discard;');
    };
    depth.customProgramCacheKey = () => 'ruin-depth';
    _ruin = { surface, depth };
  }
  return _ruin;
}

/** Trace an opening (door or window outline) on a path, left jamb up, over the head, right jamb down. */
function traceOpening(
  path: THREE.Path,
  xc: number,
  y0: number,
  w: number,
  h: number,
  shape: ArchShape,
  moveFirst: boolean,
) {
  const a = w / 2;
  if (shape === 'circle') {
    path.absarc(xc, y0 + a, a, 0, Math.PI * 2, false);
    return;
  }
  if (moveFirst) path.moveTo(xc - a, y0);
  else path.lineTo(xc - a, y0);
  if (shape === 'rect') {
    path.lineTo(xc - a, y0 + h);
    path.lineTo(xc + a, y0 + h);
  } else if (shape === 'round') {
    const hs = Math.max(0, h - a);
    path.lineTo(xc - a, y0 + hs);
    path.absarc(xc, y0 + hs, a, Math.PI, 0, true);
  } else {
    // pointed (two-centred) or segmental (shallow, single-centred)
    if (shape === 'segmental') {
      const rise = Math.min(h * 0.5, w * 0.18);
      const hs = h - rise;
      const R = (a * a + rise * rise) / (2 * rise);
      const cy = y0 + hs - (R - rise);
      const phi = Math.asin(a / R);
      path.lineTo(xc - a, y0 + hs);
      path.absarc(xc, cy, R, Math.PI / 2 + phi, Math.PI / 2 - phi, true);
    } else {
      const rise = Math.min(h * 0.6, w * 0.866);
      const hs = h - rise;
      const R = (a * a + rise * rise) / (2 * a);
      const phi = Math.atan2(rise, R - a);
      path.lineTo(xc - a, y0 + hs);
      path.absarc(xc + (R - a), y0 + hs, R, Math.PI, Math.PI - phi, true);
      path.absarc(xc - (R - a), y0 + hs, R, phi, 0, true);
    }
  }
  path.lineTo(xc + a, y0);
}

/**
 * Procedural building builder.
 *
 * Conventions (all generators rely on these):
 *  - Units are metres. +Y is up. The ground is y = 0.
 *  - The building's FRONT faces +Z. +X is to the right when you stand in front looking at it... from
 *    behind (i.e. standard right-handed axes). Centre the building on the origin.
 *  - `at` always names the centre of a primitive's BASE (its lowest face), so things stack naturally:
 *    a 3 m wall at y 0 carries a roof `at: [0, 3, 0]`.
 *  - Every primitive is merged into one mesh per material, so use as many pieces as the design needs,
 *    within reason (a building should stay under roughly 6,000 triangles).
 */
export class Builder {
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  private buckets: Record<MatKind, THREE.BufferGeometry[]> = { matte: [], glass: [] };
  private rng: () => number;
  private _colliders: Collider[] = [];
  private _decks: Deck[] = [];
  private _noCollide = false;

  constructor(
    public readonly seed = 1,
    /** 0 for the hero plot; other plots get 1, 2, 3… Use it (or rand()) to vary repeated buildings. */
    public readonly variant = 0,
    private readonly _cutaway = true,
  ) {
    this.rng = mulberry32(seed * 7919 + 13);
  }

  private _askedCutaway = false;
  /**
   * Whether to leave part of the building off so its inside can be studied (the roof of a theatre,
   * a corner of a mill). True wherever a building is shown on its own or selected; false in the
   * townscape, where it must look as it really did. A building with nothing to show inside never
   * needs to ask. Everything outside the cut must be identical in both forms.
   */
  get cutaway(): boolean {
    this._askedCutaway = true;
    return this._cutaway;
  }

  // ---------------------------------------------------------------- utilities

  /** Deterministic random number 0..1 (seeded per plot). */
  rand(): number {
    return this.rng();
  }

  /** Random number between a and b. */
  range(a: number, b: number): number {
    return a + this.rng() * (b - a);
  }

  /** Pick one item at random. */
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.rng() * items.length) % items.length];
  }

  /** True with the given probability. */
  chance(p: number): boolean {
    return this.rng() < p;
  }

  private top(): THREE.Matrix4 {
    return this.stack[this.stack.length - 1];
  }

  private localMatrix(o: Opts | undefined, extraRotY = 0): THREE.Matrix4 {
    const m = this.top().clone();
    const at = o?.at ?? [0, 0, 0];
    m.multiply(new THREE.Matrix4().makeTranslation(at[0], at[1], at[2]));
    const ry = (o?.rotY ?? 0) + extraRotY;
    if (ry) m.multiply(new THREE.Matrix4().makeRotationY(ry));
    if (o?.rot) {
      m.multiply(
        new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.rot[0], o.rot[1], o.rot[2], 'YXZ')),
      );
    }
    return m;
  }

  /**
   * Run `fn` inside a moved/rotated/scaled frame. Everything built inside is positioned relative to it.
   * Scale must be positive.
   */
  group(o: { at?: Vec3; rotY?: number; rot?: Vec3; scale?: number | Vec3 }, fn: () => void): this {
    const m = this.localMatrix(o);
    if (o.scale !== undefined) {
      const s = typeof o.scale === 'number' ? [o.scale, o.scale, o.scale] : o.scale;
      m.multiply(new THREE.Matrix4().makeScale(s[0], s[1], s[2]));
    }
    this.stack.push(m);
    try {
      fn();
    } finally {
      this.stack.pop();
    }
    return this;
  }

  /** Call fn(+1) then fn(-1): the easy way to build symmetrical pairs. Multiply your x by the sign. */
  sym(fn: (side: 1 | -1) => void): this {
    fn(1);
    fn(-1);
    return this;
  }

  /** Add any THREE geometry directly (advanced). It is transformed by the current frame and `o`. */
  add(geom: THREE.BufferGeometry, color: number, o?: Opts, extraRotY = 0): this {
    let g = geom.index ? geom.toNonIndexed() : geom;
    g.applyMatrix4(this.localMatrix(o, extraRotY));
    const c = new THREE.Color().setHex(color, THREE.SRGBColorSpace);
    if (o?.jitter !== false) c.offsetHSL(0, 0, (this.rng() - 0.5) * 0.035);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    if (g.attributes.uv) g.deleteAttribute('uv');
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'color') g.deleteAttribute(name);
    }
    this.buckets[o?.mat ?? 'matte'].push(g);
    if (g !== geom) geom.dispose();
    return this;
  }

  // ---------------------------------------------------------------- solids

  /** Box w (X) × h (Y) × d (Z), sitting on `at`. */
  box(w: number, h: number, d: number, color: number, o?: Opts): this {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }

  /** Vertical cylinder of radius r, sitting on `at`. Give `rTop` for a taper, `segs` for facet count. */
  cyl(r: number, h: number, color: number, o?: Opts & { rTop?: number; segs?: number }): this {
    const g = new THREE.CylinderGeometry(o?.rTop ?? r, r, h, o?.segs ?? 12);
    g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }

  /** Horizontal cylinder (a log, pipe, barrel vault) of radius r and length len along X, centred on `at` + r. */
  log(r: number, len: number, color: number, o?: Opts & { segs?: number; axis?: 'x' | 'z' }): this {
    const g = new THREE.CylinderGeometry(r, r, len, o?.segs ?? 10);
    g.rotateZ(Math.PI / 2);
    g.translate(0, r, 0);
    return this.add(g, color, o, o?.axis === 'z' ? Math.PI / 2 : 0);
  }

  /** Cone of base radius r, sitting on `at`. segs = 4 gives a square pyramid (rotated 45°). */
  cone(r: number, h: number, color: number, o?: Opts & { segs?: number }): this {
    const g = new THREE.ConeGeometry(r, h, o?.segs ?? 12);
    g.translate(0, h / 2, 0);
    return this.add(g, color, o);
  }

  /** Sphere centred on `at`. */
  sphere(r: number, color: number, o?: Opts & { segs?: number }): this {
    return this.add(new THREE.SphereGeometry(r, o?.segs ?? 10, Math.max(4, (o?.segs ?? 10) - 4)), color, o);
  }

  /** Low-poly blob (tree crown, bush, boulder) centred on `at`, optionally squashed/stretched. */
  blob(r: number, color: number, o?: Opts & { stretch?: Vec3; detail?: number }): this {
    const g = new THREE.IcosahedronGeometry(r, o?.detail ?? 1);
    if (o?.stretch) g.scale(o.stretch[0], o.stretch[1], o.stretch[2]);
    return this.add(g, color, o);
  }

  /** Hemispherical dome of radius r sitting on `at`. `squash` scales its height (1 = hemisphere). */
  dome(r: number, color: number, o?: Opts & { squash?: number; segs?: number }): this {
    const g = new THREE.SphereGeometry(r, o?.segs ?? 16, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(1, o?.squash ?? 1, 1);
    return this.add(g, color, o);
  }

  /**
   * Half-cylinder vault or barrel roof: spans `w` across, runs `len` along `axis`
   * (default 'z'), rising w/2 × squash. Sits on `at`.
   */
  vault(w: number, len: number, color: number, o?: Opts & { axis?: 'x' | 'z'; squash?: number; segs?: number }): this {
    const g = new THREE.CylinderGeometry(w / 2, w / 2, len, o?.segs ?? 12, 1, false, 0, Math.PI);
    // cylinder axis is Y; the half we keep bulges toward +X. Lay it down along Z with the bulge up.
    g.rotateZ(Math.PI / 2); // bulge now toward +Y, axis along X
    g.rotateY(Math.PI / 2); // axis along Z
    g.scale(1, o?.squash ?? 1, 1);
    return this.add(g, color, o, o?.axis === 'x' ? Math.PI / 2 : 0);
  }

  // ---------------------------------------------------------------- roofs

  /**
   * Pitched (gable) roof covering a w (X) × d (Z) rectangle, rising h, sitting on `at` (wall-top level).
   * `ridge` is the direction the ridge line runs: 'x' (default) puts the triangular gable ends at ±X
   * and the slopes facing front and back; 'z' puts a gable end on the front.
   * `overhang` extends the eaves and verges outward (eaves drop slightly below `at`).
   * `wall` colours the two triangular gable-end walls (give the wall material so the gable reads as
   * masonry or plaster under the roof edge); without it they take the roof colour.
   * `thick` is the roof covering thickness: about 0.15 for slate or tile, 0.4 or more for thatch.
   */
  gable(
    w: number,
    d: number,
    h: number,
    color: number,
    o?: Opts & { ridge?: 'x' | 'z'; overhang?: number; wall?: number; thick?: number },
  ): this {
    const ov = o?.overhang ?? 0;
    const alongX = (o?.ridge ?? 'x') === 'x';
    const span = alongX ? d : w;
    const run = alongX ? w : d;
    const len = run + ov * 2;
    const half = span / 2;
    const drop = (ov * h) / half;
    const t = (o?.thick ?? 0.16) * Math.hypot(half, h) / half; // vertical thickness
    const s = new THREE.Shape();
    s.moveTo(-half - ov, -drop);
    s.lineTo(0, h);
    s.lineTo(half + ov, -drop);
    s.lineTo(half + ov, -drop + t);
    s.lineTo(0, h + t);
    s.lineTo(-half - ov, -drop + t);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    const rot = alongX ? Math.PI / 2 : 0;
    this.add(g, color, o, rot);
    const tri = new THREE.Shape();
    tri.moveTo(-half, 0);
    tri.lineTo(half, 0);
    tri.lineTo(0, h);
    tri.closePath();
    const fill = new THREE.ExtrudeGeometry(tri, { depth: run, bevelEnabled: false });
    fill.translate(0, 0, -run / 2);
    return this.add(fill, o?.wall ?? color, o, rot);
  }

  /**
   * Hipped roof over a w × d rectangle, rising h. The ridge runs along the longer side.
   * `ridge` sets the ridge length (default: long side minus short side; 0 gives a pyramid).
   */
  hip(w: number, d: number, h: number, color: number, o?: Opts & { ridge?: number; overhang?: number }): this {
    const ov = o?.overhang ?? 0;
    const swap = d > w;
    const L = (swap ? d : w) + ov * 2;
    const S = (swap ? w : d) + ov * 2;
    const r = Math.max(0, Math.min(L, o?.ridge ?? L - S)) / 2;
    const drop = ov > 0 ? (ov * h) / (S / 2) : 0;
    const y0 = -drop;
    const A = [-L / 2, y0, -S / 2];
    const B = [L / 2, y0, -S / 2];
    const C = [L / 2, y0, S / 2];
    const D = [-L / 2, y0, S / 2];
    const R1 = [-r, h, 0];
    const R2 = [r, h, 0];
    const tris = [D, C, R2, D, R2, R1, B, A, R1, B, R1, R2, C, B, R2, A, D, R1, A, B, C, A, C, D];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
    g.computeVertexNormals();
    return this.add(g, color, o, swap ? Math.PI / 2 : 0);
  }

  /** Four-sided pyramid roof over a w × d rectangle. */
  pyramid(w: number, d: number, h: number, color: number, o?: Opts & { overhang?: number }): this {
    return this.hip(w, d, h, color, { ...o, ridge: 0 });
  }

  /**
   * Mono-pitch (lean-to) roof or wedge over a w × d rectangle. `high` names the side that is h tall;
   * the opposite side is at zero height. Default '-z' (high at the back).
   */
  shed(w: number, d: number, h: number, color: number, o?: Opts & { high?: '+z' | '-z' | '+x' | '-x' }): this {
    const high = o?.high ?? '-z';
    const alongZ = high === '+z' || high === '-z';
    const span = alongZ ? d : w;
    const len = alongZ ? w : d;
    const s = new THREE.Shape();
    // profile in XY: high edge at -X
    s.moveTo(-span / 2, 0);
    s.lineTo(span / 2, 0);
    s.lineTo(-span / 2, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    // profile X -> world axis so that the high edge lands on the requested side
    const rot = high === '-x' ? 0 : high === '+x' ? Math.PI : high === '-z' ? -Math.PI / 2 : Math.PI / 2;
    return this.add(g, color, o, rot);
  }

  // ---------------------------------------------------------------- profiles

  /**
   * Extrude a 2D outline. `points` are [x, y] pairs in the XY plane (y up); the solid is `depth` thick,
   * centred on Z at `at`. Use it for gable walls, pediments, stepped or curved gables, buttress profiles,
   * anything with a silhouette. `holes` are further outlines cut through it.
   */
  extrude(points: [number, number][], depth: number, color: number, o?: Opts & { holes?: [number, number][][] }): this {
    const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const h of o?.holes ?? []) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -depth / 2);
    return this.add(g, color, o);
  }

  /**
   * Spin a profile around the vertical axis. `profile` is [radius, height] pairs from bottom to top.
   * Use it for spires, turned columns, domes, cupolas, chimneys, cooling towers. `start` and `sweep`
   * (radians) make only part of the turn: an apse, an exedra, a curved bank or a bow front.
   */
  lathe(profile: [number, number][], color: number, o?: Opts & { segs?: number; start?: number; sweep?: number }): this {
    const g = new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)),
      o?.segs ?? 12,
      o?.start ?? 0,
      o?.sweep ?? Math.PI * 2,
    );
    return this.add(g, color, o);
  }

  /**
   * A straight bar of any cross-section w × h running from p0 to p1 (both [x, y, z]): rafters, braces,
   * struts, flying buttresses, cables, railings, anything that is not upright or level.
   */
  beam(p0: Vec3, p1: Vec3, w: number, h: number, color: number, o?: { mat?: MatKind; jitter?: boolean }): this {
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const dz = p1[2] - p0[2];
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-6) return this;
    const yaw = Math.atan2(dx, dz);
    const pitch = Math.atan2(dy, Math.hypot(dx, dz));
    const mid: Vec3 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
    this.group({ at: mid, rotY: yaw, rot: [-pitch, 0, 0] }, () => {
      const g = new THREE.BoxGeometry(w, h, len);
      this.add(g, color, o);
    });
    return this;
  }

  // ---------------------------------------------------------------- wall details

  /**
   * A thin raised panel on a wall: windows, doors, plaques, shutters, clock faces, string courses.
   * `at` is the bottom centre of the panel ON the wall surface; `facing` is the way the wall faces.
   * It stands `depth` proud of the wall (default 0.06). Shapes: 'rect', 'round' (round-headed),
   * 'pointed' (Gothic), 'segmental' (shallow arch), 'circle' (w is the diameter, h ignored).
   */
  panel(
    w: number,
    h: number,
    color: number,
    o?: Opts & { facing?: Facing; shape?: ArchShape; depth?: number },
  ): this {
    const depth = o?.depth ?? 0.06;
    const s = new THREE.Shape();
    traceOpening(s, 0, 0, w, h, o?.shape ?? 'rect', true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: depth + 0.03, bevelEnabled: false, curveSegments: 5 });
    g.translate(0, 0, -0.03);
    return this.add(g, color, { jitter: false, ...o }, facingAngle(o?.facing));
  }

  /**
   * A window with a frame: a `frame`-coloured surround with a darker glazed panel inside it.
   * Same placement rules as panel(). `bars` adds glazing bars: [columns, rows] of panes.
   */
  window(
    w: number,
    h: number,
    o?: Opts & {
      facing?: Facing;
      shape?: ArchShape;
      frame?: number;
      glass?: number;
      border?: number;
      bars?: [number, number];
    },
  ): this {
    const frame = o?.frame ?? P.white;
    const glass = o?.glass ?? P.windowDark;
    const border = o?.border ?? Math.min(0.12, w * 0.12);
    const shape = o?.shape ?? 'rect';
    const at = o?.at ?? [0, 0, 0];
    const ang = facingAngle(o?.facing) + (o?.rotY ?? 0);
    this.group({ at, rotY: ang }, () => {
      this.panel(w, h, frame, { shape, depth: 0.05 });
      const iw = w - border * 2;
      const ih = shape === 'circle' ? iw : h - border * 2;
      this.panel(iw, ih, glass, { at: [0, border, 0], shape, depth: 0.075, mat: o?.mat });
      const bars = o?.bars;
      if (bars) {
        const [cols, rows] = bars;
        const t = Math.min(0.05, iw * 0.06);
        for (let i = 1; i < cols; i++) {
          this.panel(t, ih, frame, { at: [-iw / 2 + (iw * i) / cols, border, 0], depth: 0.09 });
        }
        const straight = shape === 'rect' ? ih : ih - (shape === 'round' ? iw / 2 : iw * 0.5);
        for (let j = 1; j < rows; j++) {
          const y = border + (ih * j) / rows;
          if (shape !== 'rect' && y - border > straight) continue;
          this.panel(iw, t, frame, { at: [0, y, 0], depth: 0.09 });
        }
      }
    });
    return this;
  }

  /**
   * A wall slab pierced by a row of identical openings: arcades, cloisters, bridges, viaducts,
   * loggias, market-hall undercrofts. The slab is w wide, h tall and t thick, standing on `at`,
   * facing `facing`. `openings` arches of openW × openH (openH measured to the apex) are spaced
   * evenly; `sill` raises them off the ground (0 = walk-through).
   */
  archWall(
    w: number,
    h: number,
    t: number,
    color: number,
    o: Opts & {
      facing?: Facing;
      openings: number;
      openW: number;
      openH: number;
      shape?: ArchShape;
      sill?: number;
    },
  ): this {
    const n = Math.max(1, Math.floor(o.openings));
    const shape = o.shape ?? 'round';
    const sill = o.sill ?? 0;
    const pitch = w / n;
    const s = new THREE.Shape();
    if (sill <= 0 && shape !== 'circle') {
      s.moveTo(-w / 2, 0);
      for (let i = 0; i < n; i++) traceOpening(s, -w / 2 + (i + 0.5) * pitch, 0, o.openW, o.openH, shape, false);
      s.lineTo(w / 2, 0);
      s.lineTo(w / 2, h);
      s.lineTo(-w / 2, h);
      s.closePath();
    } else {
      s.moveTo(-w / 2, 0);
      s.lineTo(w / 2, 0);
      s.lineTo(w / 2, h);
      s.lineTo(-w / 2, h);
      s.closePath();
      for (let i = 0; i < n; i++) {
        const hole = new THREE.Path();
        traceOpening(hole, -w / 2 + (i + 0.5) * pitch, sill, o.openW, o.openH, shape, true);
        hole.closePath();
        s.holes.push(hole);
      }
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -t / 2);
    return this.add(g, color, o, facingAngle(o.facing));
  }

  /**
   * Exposed timber framing on a wall rectangle w × h. `at` is the bottom centre of the rectangle on the
   * wall surface. `studs` = number of vertical posts between the two corner posts, `rails` = horizontal
   * rails between sill and top plate. `brace`: 'corner' diagonals in the end bays, 'saltire' crosses,
   * 'herringbone' zigzag infill, 'curved' for the big arched braces of early frames.
   */
  frame(
    w: number,
    h: number,
    color: number,
    o?: Opts & {
      facing?: Facing;
      studs?: number;
      rails?: number;
      brace?: 'none' | 'corner' | 'saltire' | 'herringbone';
      beam?: number;
      depth?: number;
    },
  ): this {
    const beam = o?.beam ?? 0.16;
    const depth = o?.depth ?? 0.07;
    const studs = o?.studs ?? 3;
    const rails = o?.rails ?? 1;
    const brace = o?.brace ?? 'none';
    const at = o?.at ?? [0, 0, 0];
    const ang = facingAngle(o?.facing) + (o?.rotY ?? 0);
    const opt = { jitter: false as const, mat: o?.mat };
    const bar = (x0: number, y0: number, x1: number, y1: number) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const a = Math.atan2(x1 - x0, y1 - y0); // angle from vertical
      this.group({ at: [(x0 + x1) / 2, (y0 + y1) / 2, 0], rot: [0, 0, -a] }, () => {
        const g = new THREE.BoxGeometry(beam, len, depth + 0.03);
        g.translate(0, 0, depth / 2 - 0.015);
        this.add(g, color, opt);
      });
    };
    this.group({ at, rotY: ang }, () => {
      const xs: number[] = [];
      for (let i = 0; i <= studs + 1; i++) xs.push(-w / 2 + beam / 2 + ((w - beam) * i) / (studs + 1));
      const ys: number[] = [];
      for (let j = 0; j <= rails + 1; j++) ys.push(beam / 2 + ((h - beam) * j) / (rails + 1));
      for (const x of xs) bar(x, 0, x, h);
      for (const y of ys) bar(-w / 2, y, w / 2, y);
      if (brace === 'corner' || brace === 'saltire') {
        for (let j = 0; j < ys.length - 1; j++) {
          bar(xs[0], ys[j], xs[1], ys[j + 1]);
          bar(xs[xs.length - 1], ys[j], xs[xs.length - 2], ys[j + 1]);
          if (brace === 'saltire') {
            bar(xs[1], ys[j], xs[0], ys[j + 1]);
            bar(xs[xs.length - 2], ys[j], xs[xs.length - 1], ys[j + 1]);
          }
        }
      } else if (brace === 'herringbone') {
        for (let i = 0; i < xs.length - 1; i++) {
          for (let j = 0; j < ys.length - 1; j++) {
            if ((i + j) % 2 === 0) bar(xs[i], ys[j], xs[i + 1], ys[j + 1]);
            else bar(xs[i + 1], ys[j], xs[i], ys[j + 1]);
          }
        }
      }
    });
    return this;
  }

  /** Battlements around the top of a w × d rectangle. `at` is the wall-top centre. */
  crenel(w: number, d: number, color: number, o?: Opts & { merlonW?: number; merlonH?: number; t?: number }): this {
    const mw = o?.merlonW ?? 0.7;
    const mh = o?.merlonH ?? 0.8;
    const t = o?.t ?? 0.4;
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      const side = (len: number, fixed: number, alongX: boolean) => {
        const n = Math.max(2, Math.round(len / (mw * 2)));
        const pitch = len / n;
        for (let i = 0; i <= n; i++) {
          const p = -len / 2 + i * pitch;
          const bw = Math.min(mw, pitch * 0.55);
          if (alongX) this.box(bw, mh, t, color, { at: [p, 0, fixed], jitter: false, mat: o?.mat });
          else this.box(t, mh, bw, color, { at: [fixed, 0, p], jitter: false, mat: o?.mat });
        }
      };
      side(w - t, d / 2 - t / 2, true);
      side(w - t, -d / 2 + t / 2, true);
      side(d - t, w / 2 - t / 2, false);
      side(d - t, -w / 2 + t / 2, false);
    });
    return this;
  }

  // ---------------------------------------------------------------- assemblies

  /**
   * A classical column standing on `at`: shaft radius r, total height h.
   * order: 'plain' (a post), 'tuscan', 'doric', 'ionic', 'corinthian'.
   */
  column(
    r: number,
    h: number,
    color: number,
    o?: Opts & { order?: 'plain' | 'tuscan' | 'doric' | 'ionic' | 'corinthian'; segs?: number },
  ): this {
    const order = o?.order ?? 'tuscan';
    const segs = o?.segs ?? 10;
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      const q = { jitter: false as const, mat: o?.mat };
      if (order === 'plain') {
        this.cyl(r, h, color, { segs, ...q });
        return;
      }
      const baseH = order === 'doric' ? 0 : h * 0.05;
      const capH = order === 'corinthian' ? h * 0.13 : h * 0.07;
      if (baseH) this.cyl(r * 1.3, baseH, color, { segs, ...q });
      this.cyl(r, h - baseH - capH, color, { at: [0, baseH, 0], rTop: r * 0.84, segs, ...q });
      const y = h - capH;
      if (order === 'corinthian') {
        this.cyl(r * 0.86, capH * 0.8, color, { at: [0, y, 0], rTop: r * 1.35, segs, ...q });
        this.box(r * 2.9, capH * 0.2, r * 2.9, color, { at: [0, y + capH * 0.8, 0], ...q });
      } else if (order === 'ionic') {
        this.box(r * 2.9, capH * 0.45, r * 2.2, color, { at: [0, y + capH * 0.55, 0], ...q });
        for (const s of [-1, 1]) {
          this.log(capH * 0.5, r * 2.3, color, { at: [s * r * 1.25, y, 0], axis: 'z', segs: 8, ...q });
        }
      } else {
        this.cyl(r * 0.86, capH * 0.5, color, { at: [0, y, 0], rTop: r * 1.3, segs, ...q });
        this.box(r * 2.8, capH * 0.5, r * 2.8, color, { at: [0, y + capH * 0.5, 0], ...q });
      }
    });
    return this;
  }

  /** A centred row of `n` columns `spacing` apart, along `axis` (default 'x'). */
  colonnade(
    n: number,
    spacing: number,
    r: number,
    h: number,
    color: number,
    o?: Opts & { axis?: 'x' | 'z'; order?: 'plain' | 'tuscan' | 'doric' | 'ionic' | 'corinthian' },
  ): this {
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      for (let i = 0; i < n; i++) {
        const p = (i - (n - 1) / 2) * spacing;
        this.column(r, h, color, { at: o?.axis === 'z' ? [0, 0, p] : [p, 0, 0], order: o?.order, mat: o?.mat });
      }
    });
    return this;
  }

  /**
   * A flight of steps w wide, climbing h over a run of d. The lowest step is at the +Z (front) edge and
   * it climbs toward -Z, so it leads up to a front door. Rotate with rotY for other directions.
   */
  stairs(w: number, h: number, d: number, steps: number, color: number, o?: Opts): this {
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      const run = d / steps;
      for (let i = 0; i < steps; i++) {
        this.box(w, (h * (i + 1)) / steps, run, color, {
          at: [0, 0, d / 2 - (i + 0.5) * run],
          jitter: false,
          mat: o?.mat,
        });
      }
    });
    return this;
  }

  /** A chimney stack: a shaft with a slightly wider cap and optional pots. `at` is its base. */
  chimney(w: number, h: number, d: number, color: number, o?: Opts & { pots?: number; potColor?: number }): this {
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      this.box(w, h, d, color);
      this.box(w + 0.14, 0.14, d + 0.14, color, { at: [0, h - 0.02, 0] });
      const pots = o?.pots ?? 0;
      for (let i = 0; i < pots; i++) {
        const x = pots === 1 ? 0 : -w / 2 + 0.22 + ((w - 0.44) * i) / (pots - 1);
        this.cyl(0.11, 0.42, o?.potColor ?? P.terracotta, { at: [x, h + 0.12, 0], rTop: 0.09, segs: 6 });
      }
    });
    return this;
  }

  /**
   * A simple tree of total height h standing on `at`. kind: 'round', 'conifer', 'poplar', 'bush',
   * and for the Mediterranean 'cypress' (a dark spindle), 'pine' (an umbrella pine) and 'olive'.
   */
  tree(
    h: number,
    o?: Opts & { kind?: 'round' | 'conifer' | 'poplar' | 'bush' | 'cypress' | 'pine' | 'olive'; color?: number },
  ): this {
    const kind = o?.kind ?? 'round';
    const col =
      o?.color ??
      (kind === 'conifer' ? P.leafDark : kind === 'cypress' ? P.cypress : kind === 'pine' ? P.leafDark : kind === 'olive' ? P.olive : P.leaf);
    this.group({ at: o?.at, rotY: this.rng() * 6.28 }, () => {
      if (kind === 'bush') {
        this.blob(h * 0.6, col, { at: [0, h * 0.45, 0], stretch: [1.2, 0.8, 1.2] });
        return;
      }
      if (kind === 'conifer') {
        this.cyl(h * 0.035, h * 0.3, P.bark, { segs: 5 });
        this.cone(h * 0.24, h * 0.5, col, { at: [0, h * 0.2, 0], segs: 7 });
        this.cone(h * 0.18, h * 0.42, col, { at: [0, h * 0.45, 0], segs: 7 });
        this.cone(h * 0.11, h * 0.3, col, { at: [0, h * 0.7, 0], segs: 7 });
        return;
      }
      if (kind === 'cypress') {
        this.cyl(h * 0.025, h * 0.14, P.bark, { segs: 5 });
        this.blob(h * 0.11, col, { at: [0, h * 0.55, 0], stretch: [1, 4.1, 1] });
        return;
      }
      if (kind === 'pine') {
        this.cyl(h * 0.04, h * 0.78, P.bark, { segs: 5, rTop: h * 0.028 });
        this.blob(h * 0.34, col, { at: [0, h * 0.86, 0], stretch: [1.25, 0.42, 1.25] });
        return;
      }
      if (kind === 'olive') {
        this.cyl(h * 0.07, h * 0.4, 0x7a6a58, { segs: 5, rTop: h * 0.05 });
        this.blob(h * 0.36, col, { at: [0, h * 0.64, 0], stretch: [1.2, 0.8, 1.2] });
        this.blob(h * 0.22, col, { at: [-h * 0.2, h * 0.52, h * 0.08] });
        return;
      }
      if (kind === 'poplar') {
        this.cyl(h * 0.03, h * 0.25, P.bark, { segs: 5 });
        this.blob(h * 0.16, col, { at: [0, h * 0.58, 0], stretch: [1, 2.7, 1] });
        return;
      }
      this.cyl(h * 0.045, h * 0.45, P.bark, { segs: 5, rTop: h * 0.03 });
      this.blob(h * 0.3, col, { at: [0, h * 0.66, 0], stretch: [1.15, 0.95, 1.15] });
      this.blob(h * 0.2, col, { at: [h * 0.16, h * 0.56, h * 0.06] });
    });
    return this;
  }

  /** A person-sized figure (1.7 m) for scale. Used by the gallery, rarely by buildings. */
  figure(o?: Opts & { color?: number }): this {
    this.group({ at: o?.at, rotY: o?.rotY }, () => {
      this.cyl(0.2, 1.35, o?.color ?? P.doorBlue, { rTop: 0.16, segs: 6, jitter: false });
      this.sphere(0.16, 0xe0b89a, { at: [0, 1.53, 0], segs: 6, jitter: false });
    });
    return this;
  }

  // ---------------------------------------------------------------- gameplay hints

  /**
   * Walkers cannot pass through a building's bounding box by default. If the building has a courtyard,
   * an open undercroft or several separate masses, call collider() once per solid block instead:
   * each is a w × d rectangle centred on `at` (only x and z are used).
   */
  collider(w: number, d: number, o?: { at?: Vec3; rotY?: number }): this {
    this._colliders.push({ x: o?.at?.[0] ?? 0, z: o?.at?.[2] ?? 0, w, d, rotY: o?.rotY ?? 0 });
    return this;
  }

  /** Nothing here blocks walkers (open stalls, a ford, a ruin). */
  noCollide(): this {
    this._noCollide = true;
    return this;
  }

  /**
   * A surface walkers can stand on above ground level (a bridge deck, a raised terrace, a motte top).
   * w × d rectangle centred on `at` (x, z); y is the height. For a hump-backed bridge give `yEnds`
   * (height at the two Z ends) and `y` (height at the crown).
   */
  deck(w: number, d: number, y: number, o?: { at?: Vec3; rotY?: number; yEnds?: number }): this {
    this._decks.push({ x: o?.at?.[0] ?? 0, z: o?.at?.[2] ?? 0, w, d, rotY: o?.rotY ?? 0, y, yEnds: o?.yEnds });
    return this;
  }

  // ---------------------------------------------------------------- output

  finish(): Built {
    const mats = getMaterials();
    const object = new THREE.Group();
    const bounds = new THREE.Box3();
    let triangles = 0;
    for (const kind of ['matte', 'glass'] as MatKind[]) {
      const list = this.buckets[kind];
      if (!list.length) continue;
      const merged = mergeGeometries(list, false);
      for (const g of list) g.dispose();
      this.buckets[kind] = [];
      if (!merged) continue;
      if (kind === 'matte') {
        // soft contact shading: darken the lowest metre or two so buildings sit in the ground
        const pos = merged.attributes.position;
        const col = merged.attributes.color;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const t = Math.min(1, Math.max(0, y / 2.2));
          const f = 0.84 + 0.16 * t * t * (3 - 2 * t);
          col.setXYZ(i, col.getX(i) * f, col.getY(i) * f, col.getZ(i) * f);
        }
      }
      merged.computeBoundingBox();
      merged.computeBoundingSphere();
      bounds.union(merged.boundingBox!);
      triangles += merged.attributes.position.count / 3;
      const mesh = new THREE.Mesh(merged, mats[kind]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      object.add(mesh);
    }
    let colliders = this._colliders;
    if (this._noCollide) colliders = [];
    else if (!colliders.length && !bounds.isEmpty()) {
      const c = bounds.getCenter(new THREE.Vector3());
      const s = bounds.getSize(new THREE.Vector3());
      colliders = [{ x: c.x, z: c.z, w: s.x, d: s.z, rotY: 0 }];
    }
    return { object, bounds, colliders, decks: this._decks, triangles, hasCutaway: this._askedCutaway };
  }
}
