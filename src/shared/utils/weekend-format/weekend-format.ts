import type { Championship, Round, WeekendFormat } from '../../types/index.ts';

/**
 * One of a championship's weekend formats, by its id.
 * @param series The championship
 * @param id The format's id
 * @returns The format, or null when the id does not resolve
 */
const formatNamed = (series: Championship, id: string): WeekendFormat | null => (
  series.weekendFormats.find((format) => format.id === id) ?? null
);

/**
 * Reads the weekend format a round is run over.
 *
 * Null rather than a fallback to the first format when the id resolves to
 * nothing: an unresolvable id is an authoring mistake, validateSeries reports
 * it as one, and racing whichever format happened to be written first is
 * exactly the silent wrong answer this project prefers to fail on.
 * @param series The championship
 * @param round The round being raced
 * @returns The format the round names, the championship's default otherwise,
 * or null when neither id resolves
 */
export const formatOf = (series: Championship, round: Round): WeekendFormat | null => (
  formatNamed(series, round.weekendFormat ?? series.defaultWeekendFormat)
);

/**
 * The weekend format a championship runs unless a round says otherwise.
 * @param series The championship
 * @returns Its default format, or null when the id does not resolve
 */
export const defaultFormatOf = (series: Championship): WeekendFormat | null => (
  formatNamed(series, series.defaultWeekendFormat)
);
