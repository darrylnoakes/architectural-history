import type { StreetSurface } from '@ah/kit';

/**
 * The fixed geography of the town: river, relief and the road network. Everything here is a pure
 * function of position so terrain, roads, trees and the walker all agree.
 * Axes: +x east, +z south, y up. The market square is at the origin.
 */

export const RIVER_Z = 78;
export const RIVER_HALF = 8;
export const WATER_Y = -1.2;
export const WORLD_CENTRE = { x: 0, z: 25 };
export const WORLD_RADIUS = 430;

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Centre line of the river: straight through the town, bending away beyond it. */
export function riverZ(x: number): number {
  if (x > 115) return RIVER_Z + 90 * smoothstep(0, 520, x - 115) + 0.02 * (x - 115);
  if (x < -100) return RIVER_Z - 70 * smoothstep(0, 460, -100 - x) - 0.03 * (-100 - x);
  return RIVER_Z;
}

export const KNOLL = { x: -205, z: -150, r: 62, h: 11 };

/** Height of the natural ground (no buildings, no bridge decks). */
export function baseHeight(x: number, z: number): number {
  const r = Math.hypot(x - WORLD_CENTRE.x, z - WORLD_CENTRE.z);
  const hills = smoothstep(215, 560, r);
  const n = 0.5 + 0.5 * Math.sin(x * 0.009 + 1.7) * Math.cos(z * 0.011 - 0.6);
  const n2 = 0.5 + 0.5 * Math.sin(x * 0.021 + z * 0.017 + 2.1);
  const d = Math.abs(z - riverZ(x));
  let h = hills * (8 + 42 * n + 11 * n2) * smoothstep(16, 170, d);
  const k = Math.hypot(x - KNOLL.x, z - KNOLL.z);
  h += KNOLL.h * (1 - smoothstep(0, KNOLL.r, k));
  h -= 2.4 * (1 - smoothstep(6.2, 10.5, d));
  return h;
}

export interface Road {
  id: string;
  /** Polyline of [x, z] points. */
  pts: [number, number][];
  kind: 'main' | 'lane';
  since?: number;
}

export const SQUARE = { x0: -27, x1: 27, z0: -23, z1: 23 };
export const BRIDGE = { z0: 65, z1: 91 };

export const roads: Road[] = [
  { id: 'high-street-north', kind: 'main', pts: [[0, -23], [0, -150], [-12, -230], [-40, -330], [-60, -470]] },
  { id: 'high-street-south', kind: 'main', pts: [[0, 23], [0, BRIDGE.z0]] },
  { id: 'london-road', kind: 'main', pts: [[0, BRIDGE.z1], [0, 170], [14, 250], [50, 350], [80, 480]] },
  { id: 'cross-street-west', kind: 'main', pts: [[-27, 0], [-150, 0], [-240, -18], [-340, -30], [-470, -80]] },
  { id: 'cross-street-east', kind: 'main', pts: [[27, 0], [150, 0], [240, -14], [340, 20], [470, 10]] },
  { id: 'mill-lane', kind: 'lane', pts: [[0, 43], [96, 43]] },
  { id: 'church-lane', kind: 'lane', pts: [[0, -53], [31, -53]], since: 600 },
  { id: 'castle-lane', kind: 'lane', pts: [[-62, 0], [-62, -36]] },
  { id: 'row-lane', kind: 'lane', pts: [[-5, -92], [-34, -92], [-62, -84]], since: 1500 },
  { id: 'station-road', kind: 'lane', pts: [[-110, 98], [110, 98]], since: 1780 },
];

export interface StreetStyle {
  color: number;
  main: number;
  lane: number;
  /** Width of a raised pavement each side, 0 for none. */
  pavement: number;
  pavementColor: number;
  /** Painted centre line. */
  lines: boolean;
}

export const STREET_STYLES: Record<StreetSurface, StreetStyle> = {
  track: { color: 0x8b7658, main: 3.4, lane: 2.2, pavement: 0, pavementColor: 0, lines: false },
  paved: { color: 0xb3ab98, main: 6, lane: 3.6, pavement: 0.5, pavementColor: 0xcfc8b6, lines: false },
  mud: { color: 0x7d6a50, main: 4.2, lane: 2.6, pavement: 0, pavementColor: 0, lines: false },
  cobble: { color: 0x8f897c, main: 5.4, lane: 3.4, pavement: 0, pavementColor: 0, lines: false },
  setts: { color: 0x74726c, main: 6.4, lane: 4.2, pavement: 1.6, pavementColor: 0xb7b2a6, lines: false },
  macadam: { color: 0x6f6b64, main: 6.8, lane: 4.6, pavement: 1.6, pavementColor: 0xbab6ab, lines: false },
  tarmac: { color: 0x4c4e52, main: 7, lane: 5, pavement: 1.7, pavementColor: 0xbfbcb3, lines: true },
};

/** Distance from (x, z) to the nearest road centre line (ignoring `since`). */
export function distToRoad(x: number, z: number): number {
  let best = Infinity;
  for (const r of roads) {
    for (let i = 0; i < r.pts.length - 1; i++) {
      const [ax, az] = r.pts[i];
      const [bx, bz] = r.pts[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      const d = Math.hypot(x - (ax + t * dx), z - (az + t * dz));
      if (d < best) best = d;
    }
  }
  return best;
}

export function inSquare(x: number, z: number, margin = 0): boolean {
  return x > SQUARE.x0 - margin && x < SQUARE.x1 + margin && z > SQUARE.z0 - margin && z < SQUARE.z1 + margin;
}

/** Cheap repeatable noise in 0..1. */
export function hash2(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const fx = x - xi;
  const fz = z - zi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash2(xi, zi);
  const b = hash2(xi + 1, zi);
  const c = hash2(xi, zi + 1);
  const d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
