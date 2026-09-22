import type { AgendaDay, CalendarCriteria } from './types.ts';
import type { CalendarEntry, Discipline } from '../../../../shared/types';

/**
 * Whether one event passes the filters.
 *
 * "available" is what the career can act on right now - its level reaches the
 * rung and the install can run the round. "locked" is the opposite question and
 * is about the ladder alone, since a round you are too junior for is a
 * different thing from one whose track you have not installed.
 * @param event The event
 * @param criteria What the calendar is filtered to
 * @returns True when it is shown
 */
export const passesFilter = (event: CalendarEntry, criteria: CalendarCriteria): boolean => {
  const { status, disciplines } = criteria;

  if (disciplines.length > 0 && !disciplines.includes(event.ladder.discipline)) return false;
  if (status === 'entered') return event.enrolled;
  if (status === 'locked') return !event.eligible;
  if (status === 'available') return event.eligible && event.raceable && !event.enrolled;

  return true;
};

/**
 * Narrows a calendar to what should be on screen.
 *
 * The championships the user switched off are dropped here rather than in main,
 * the way the Championships page drops them: which library a career sees is a
 * settings question, and main serves the whole of it.
 *
 * Handed the ids rather than the library and the settings, because working them
 * out means `isListed`, which lives behind the championships barrel - and that
 * barrel re-exports components, which reach react-router, which nothing under
 * test may import. The screen resolves it and passes the answer down.
 * @param events Every event of the season
 * @param listed The ids of the championships the user's switches leave listed
 * @param criteria What the calendar is filtered to
 * @returns The events to show, in the order they were given
 */
export const shownEvents = (
  events: readonly CalendarEntry[],
  listed: ReadonlySet<string>,
  criteria: CalendarCriteria,
): CalendarEntry[] => events.filter((event) => (
  // A championship switched off after it was entered keeps its place, or a
  // season under way would vanish from the calendar it is being raced on.
  (listed.has(event.series) || event.enrolled) && passesFilter(event, criteria)
));

/**
 * Every discipline a set of events holds, in the order they first appear.
 * @param events The events to read
 * @returns The disciplines, without repeats
 */
export const offeredDisciplines = (
  events: readonly CalendarEntry[],
): Discipline[] => [...new Set(events.map((event) => event.ladder.discipline))];

/**
 * Groups events into the days the agenda lists them under.
 * @param events The events to group, earliest first
 * @returns One group per race day that has anything on it
 */
export const agendaDays = (events: readonly CalendarEntry[]): AgendaDay[] => {
  const days = new Map<string, CalendarEntry[]>();

  events.forEach((event) => {
    const held = days.get(event.raceDay);
    if (held) {
      held.push(event);

      return;
    }

    days.set(event.raceDay, [event]);
  });

  return [...days].map(([date, own]) => ({ date, events: own }));
};

/**
 * How many weekends of a season the career is entered in, and how many of them
 * collide with another.
 * @param events Every event of the season, unfiltered
 * @returns The two counts
 */
export const commitments = (
  events: readonly CalendarEntry[],
): { enrolled: number; clashes: number } => ({
  enrolled: events.filter((event) => event.enrolled).length,
  clashes: events.filter((event) => event.enrolled && event.clash).length,
});
