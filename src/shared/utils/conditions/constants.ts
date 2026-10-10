// Which fields of Conditions belong to which question.

import type { Conditions } from '../../types/race.ts';

/**
 * The fields that answer the weather question, which are merged as one group
 * rather than individually. Named here so nothing has to remember all of them
 * at each of the places that reads or clears them.
 *
 * `weatherSteps` belongs with the rest: a session choosing a steady weather
 * while the event names a plan has to lose that plan, or the merge keeps
 * both and a session that asked for one weather runs a sequence of them.
 */
export const WEATHER_FIELDS: (keyof Conditions)[] = [
  'weather',
  'weatherType',
  'weatherController',
  'weatherSteps',
];
