import type { StageEnd } from '@ah/kit';

/**
 * The Gothic War of 535 to 554: the usual end of a Roman public building in an Italian town.
 * Unlike in Britain the town itself lived on, so the ruin stood among inhabited streets.
 */
export const gothicWar: StageEnd = {
  year: 550,
  fate: 'ruin',
  note:
    'The western empire ended in 476, but it was the long war of 535 to 554, when the eastern emperor’s armies fought the Goths for Italy, ' +
    'together with plague and famine, that emptied the town’s great buildings. They were left to decay and quarried for stone, lime and columns.',
};

/** A type that was simply rebuilt in the newer manner once it had had its day. */
export const renewedBy = (year: number): StageEnd => ({ year, fate: 'renew' });
