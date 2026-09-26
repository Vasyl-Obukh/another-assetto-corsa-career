// The closed sets a championship file's strings have to belong to.

import { WeatherType } from '../../shared/constants/index.ts';
import {
  Climate, Hemisphere, SeasonLength, TeamBudget,
} from '../../shared/types/index.ts';
import type { GridStart, SessionType, TrackStateName } from '../../shared/types/index.ts';
import { numericEnumValues, stringEnumValues } from '../../shared/utils/coerce/index.ts';

/**
 * Every team budget tier, for checking one read off disk.
 */
export const TEAM_BUDGETS: readonly TeamBudget[] = stringEnumValues(TeamBudget);

/**
 * Every climate, for checking one read off disk.
 */
export const CLIMATES: readonly Climate[] = stringEnumValues(Climate);

/**
 * Every hemisphere, for checking one read off disk.
 */
export const HEMISPHERES: readonly Hemisphere[] = stringEnumValues(Hemisphere);

/**
 * Every season length, for checking one read off disk.
 */
export const SEASON_LENGTHS: readonly SeasonLength[] = stringEnumValues(SeasonLength);

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
 * Every place a race may start the player at by name, beside a slot number.
 */
export const GRID_START_PLACES: readonly GridStart[] = ['last', 'pole', 'random'];

/**
 * Every track state, for the same reason.
 */
export const TRACK_STATE_NAMES: readonly TrackStateName[] = ['green', 'fast', 'optimum'];

/**
 * The file extension a championship is written as.
 */
export const SERIES_FILE_EXTENSION = '.json';
