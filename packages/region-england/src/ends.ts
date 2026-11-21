import type { StageEnd } from '@ah/kit';

/** The end of Roman Britain: masonry buildings abandoned and left to fall down. */
export const romanEnd: StageEnd = {
  year: 420,
  fate: 'ruin',
  note:
    'Roman rule in Britain ended around 410. With no army pay, coin or taxes to keep a town running, buildings like this were ' +
    'abandoned within a generation and left to fall down, and their stone and tile were carried off for reuse.',
};

/** A type that was simply rebuilt in the newer manner once it had had its day. */
export const renewedBy = (year: number): StageEnd => ({ year, fate: 'renew' });
