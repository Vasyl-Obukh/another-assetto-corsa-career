import type { SessionType } from '../../../../shared/types';

/**
 * Assetto Corsa's numeric session types, by what the app calls them.
 */
export const AC_TYPES: Readonly<Record<number, SessionType>> = {
  1: 'practice',
  2: 'qualify',
  3: 'race',
  4: 'hotlap',
  5: 'timeAttack',
  6: 'drift',
  7: 'drag',
};

/**
 * The separator an event's archive puts between the race and the session.
 */
export const NAME_SEPARATOR = ' - ';
