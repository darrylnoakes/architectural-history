import type { StageEnd } from '@ah/kit';

/**
 * The invasions of 275 and 276: the usual end of the open Gallo-Roman town. Unlike in Britain
 * the town lived on, but smaller and behind a wall built of its own monuments.
 */
export const invasions: StageEnd = {
  year: 275,
  fate: 'ruin',
  note:
    'In 275 and 276 Frankish and Alamannic raiders crossed the Rhine and burned their way across northern Gaul. The open town was sacked. ' +
    'When order returned the survivors built a wall round a part of it, and took the stone for it from buildings like this one.',
};

/** A type that was simply rebuilt in the newer manner once it had had its day. */
export const renewedBy = (year: number): StageEnd => ({ year, fate: 'renew' });

/**
 * The Great War, for the plots that the town plan marks as struck (`Plot.struck`): the front ran
 * past the town from September 1914 to 1918.
 */
export const greatWar = {
  year: 1915,
  note:
    'From September 1914 the front line ran a few kilometres from the town, and for four years it lay under German guns. ' +
    'This building was one of many left a burnt-out shell. It was rebuilt in the 1920s, when the whole centre was reconstructed.',
};
