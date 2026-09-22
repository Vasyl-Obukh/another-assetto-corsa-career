import type { CalendarCriteria, CalendarStatus } from './types.ts';

/**
 * The status filters the toolbar offers, in the order they are shown.
 */
export const CALENDAR_STATUSES: readonly CalendarStatus[] = [
  'all', 'available', 'entered', 'locked',
];

/**
 * What the calendar shows before the player narrows it.
 *
 * Everything, because a career with nothing entered would otherwise open on an
 * empty page and have no way to find something to enter.
 */
export const DEFAULT_CRITERIA: CalendarCriteria = { status: 'all', disciplines: [] };

/**
 * How many rows a standings table shows before it offers the rest.
 */
export const STANDINGS_PREVIEW = 5;

/**
 * Where the calendar remembers the filters it was left on.
 */
export const CALENDAR_MEMORY = 'career-calendar';

/**
 * How far below the pinned header today is put when the view goes to it, in
 * pixels - enough to read as a line under the header rather than touching it.
 */
export const TODAY_MARGIN = 8;
