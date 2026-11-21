/** Small deterministic PRNG so every building and town is reproducible from a seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** n evenly spaced points centred inside n equal cells between a and b (never on the ends). */
export function spread(n: number, a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + ((i + 0.5) / n) * (b - a));
  return out;
}

/** n evenly spaced points from a to b inclusive. */
export function linspace(n: number, a: number, b: number): number[] {
  if (n <= 1) return [(a + b) / 2];
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + (i / (n - 1)) * (b - a));
  return out;
}
