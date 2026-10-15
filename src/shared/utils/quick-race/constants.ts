import { DEFAULT_TIME_OF_DAY } from '../../constants/index.ts';
import type { Conditions, SessionDefinition } from '../../types/index.ts';

/**
 * The version every quick race is written at. There is no migration before the
 * first release, so it stays 1 whatever the format becomes.
 */
export const QUICK_RACE_VERSION = 1;

/**
 * How many cars a new class races, the player's included when it is theirs.
 */
export const DEFAULT_CLASS_CARS = 12;

/**
 * What a new class's id is built from, a number after it.
 */
export const CLASS_ID_PREFIX = 'class-';

/**
 * The sessions a new race event starts with: one short race.
 */
export const DEFAULT_SESSIONS: readonly SessionDefinition[] = [{ type: 'race', laps: 5 }];

/**
 * What a new race event runs in until the player says otherwise.
 */
export const DEFAULT_CONDITIONS: Conditions = {
  timeOfDay: DEFAULT_TIME_OF_DAY,
  ambient: 22,
  trackState: 'fast',
  timeMultiplier: 1,
};
