// The closed sets a championship file's strings have to belong to.

import { WeatherType } from '../../shared/constants/index.ts';
import { CarSpec, Discipline, TeamBudget } from '../../shared/types/index.ts';
import type { SessionType, TrackStateName } from '../../shared/types/index.ts';
import { numericEnumValues, stringEnumValues } from '../../shared/utils/coerce/index.ts';

/**
 * Every discipline, for checking one read off disk.
 */
export const DISCIPLINES: readonly Discipline[] = stringEnumValues(Discipline);

/**
 * Every car spec, for checking one read off disk.
 *
 * This is the one the compiler used to check. A spec that is not a member here
 * indexes SPEC_CARS to undefined, which reads as a class nobody owns rather
 * than as a mistake.
 */
export const SPECS: readonly CarSpec[] = stringEnumValues(CarSpec);

/**
 * Every team budget tier, for checking one read off disk.
 */
export const TEAM_BUDGETS: readonly TeamBudget[] = stringEnumValues(TeamBudget);

/**
 * Every CSP weather type, without the reverse mapping a numeric enum carries.
 */
export const WEATHER_TYPES: readonly number[] = numericEnumValues(WeatherType);

/**
 * Every session type, for checking one read off disk.
 *
 * Written out rather than derived: SessionType is a string literal union rather
 * than an enum, so there is no Object.values to ask. The race screen's own
 * SESSION_TYPES is deliberately not reused - that one is the three the menu
 * offers, and a hand-authored file may name any of the seven.
 */
export const SESSION_TYPES: readonly SessionType[] = [
  'practice', 'qualify', 'race', 'hotlap', 'timeAttack', 'drift', 'drag',
];

/**
 * Every track state, for the same reason.
 */
export const TRACK_STATE_NAMES: readonly TrackStateName[] = ['green', 'fast', 'optimum'];

/**
 * The revision a championship file is migrated from.
 *
 * Revision 2 carried an `entrants` count where revision 3 carries a seat list,
 * and the count converts to seats losslessly - so a file written before seats
 * existed is read rather than refused.
 */
export const MIGRATABLE_VERSION = 2;

/**
 * The revision that conversion produces.
 *
 * Stamped literally rather than as SERIES_FORMAT_VERSION, even though the two
 * are the same number today. A migration may only claim the revision it
 * actually wrote: label a revision 2 file as whatever the build currently reads
 * and a later revision 4 would find its own step quietly skipped, which is the
 * silent "a field means two things" the version field exists to prevent. Left
 * behind, it fails the version gate loudly instead.
 */
export const SEATS_VERSION = 3;

/**
 * The file extension a championship is written as.
 */
export const SERIES_FILE_EXTENSION = '.json';
