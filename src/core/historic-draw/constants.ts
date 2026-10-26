import type { HistoricFrequency } from '../../shared/types/index.ts';

/**
 * How many days each stretch of a season runs at the frequencies measured in
 * days. The others follow the calendar: a quarter, a month, or none at all.
 */
export const SLOT_DAYS: Readonly<Partial<Record<HistoricFrequency, number>>> = {
  fortnightly: 14,
  weekly: 7,
};

/**
 * How many months each stretch runs at the frequencies measured in months.
 */
export const SLOT_MONTHS: Readonly<Partial<Record<HistoricFrequency, number>>> = {
  quarterly: 3,
  monthly: 1,
};

/**
 * The days of the week a historic event may fall on, as getUTCDay numbers
 * them: Monday to Friday, which keeps them off the weekends the top rungs race.
 */
export const HISTORIC_WEEKDAYS: ReadonlySet<number> = new Set([1, 2, 3, 4, 5]);

/**
 * What a chance is out of: a percentage, so a chance of this is certain.
 */
export const INVITATION_CERTAIN = 100;
