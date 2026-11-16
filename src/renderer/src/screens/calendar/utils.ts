import {
  CALENDAR_EVENT_KINDS, CALENDAR_STATUSES, CALENDAR_VIEWS, DEFAULT_CRITERIA,
} from './constants.ts';
import type {
  AgendaDay, CalendarCriteria, CalendarStatus, CalendarView, MonthTick, SeasonMonth,
} from './types.ts';
import { DAYS_PER_WEEK, DISCIPLINES } from '../../../../shared/constants';
import type { CalendarEntry, Discipline } from '../../../../shared/types';
import { addDays, weekdayOf } from '../../../../shared/utils/calendar-days';
import { isRecord, memberOf } from '../../../../shared/utils/coerce';
import { readMembers } from '@/lib/stored-preference';

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
  const { status, disciplines, kinds } = criteria;

  if (disciplines.length > 0 && !disciplines.includes(event.ladder.discipline)) return false;
  if (kinds.length > 0 && !kinds.includes(event.historic ? 'historic' : 'championship')) return false;
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
  // season under way would vanish from the calendar it is being raced on. A
  // historic event is in no championship library: the season drew it from the
  // ones switched on, so it stays.
  (event.historic || listed.has(event.series) || event.enrolled) && passesFilter(event, criteria)
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
 * A key telling one event apart from every other on the calendar: a round of
 * one edition of a championship, for one of its class entries.
 * @param event The event
 * @returns Its key
 */
export const eventKey = (event: CalendarEntry): string => (
  `${event.series}-${event.edition}-${event.entry}-${event.round}`
);

/**
 * How far down a day's list an event goes: the career's own events first,
 * then what it could enter, then everything else.
 * @param event The event
 * @returns Its rank, lowest first
 */
export const eventRank = (event: CalendarEntry): number => {
  if (event.enrolled) return 0;
  if (event.eligible && event.raceable) return 1;

  return 2;
};

/**
 * Groups events into the days the agenda lists them under, each day's own
 * ranked by `eventRank` and otherwise left in the order it was given.
 * @param events The events to group, earliest first
 * @returns One group per race day that has anything on it
 */
export const agendaDays = (events: readonly CalendarEntry[]): AgendaDay[] => {
  const days = new Map<string, CalendarEntry[]>();

  events.forEach((event) => {
    const held = days.get(event.date);
    if (held) {
      held.push(event);

      return;
    }

    days.set(event.date, [event]);
  });

  return [...days].map(([date, own]) => ({
    date,
    events: own.toSorted((a, b) => eventRank(a) - eventRank(b)),
  }));
};

/**
 * How many events each status filter would leave, under the disciplines already
 * picked - which is what the status buttons count.
 * @param events The events the filters choose from
 * @param criteria What the calendar is filtered to
 * @returns The count for every status
 */
export const statusCounts = (
  events: readonly CalendarEntry[],
  criteria: CalendarCriteria,
): Record<CalendarStatus, number> => Object.fromEntries(CALENDAR_STATUSES.map((status) => [
  status,
  events.filter((event) => passesFilter(event, { ...criteria, status })).length,
])) as Record<CalendarStatus, number>;

/**
 * The event the clock should move to next: the next one the career is entered
 * in, or failing that the next one at all.
 * @param events Every event of the season, earliest first
 * @param clock The ISO date the career's clock stands at
 * @returns The event, or null once nothing is left to come
 */
export const nextEvent = (events: readonly CalendarEntry[], clock: string): CalendarEntry | null => (
  events.find((event) => event.enrolled && event.date > clock)
  ?? events.find((event) => event.date > clock)
  ?? null
);

/**
 * The first day of the month a date falls in.
 * @param date The ISO date
 * @returns The ISO date of that month's first day
 */
export const monthOf = (date: string): string => `${date.slice(0, 7)}-01`;

/**
 * Moves a month's first day by whole months.
 * @param month The ISO date of a month's first day
 * @param months How many months to move it, back when negative
 * @returns The ISO date of that month's first day
 */
export const shiftMonth = (month: string, months: number): string => {
  const moved = new Date(`${month}T00:00:00Z`);
  moved.setUTCMonth(moved.getUTCMonth() + months);

  return moved.toISOString().slice(0, 10);
};

/**
 * Every month a season touches, each with a tick per race day in it.
 *
 * A race day the career is entered in reads as its own, or as a clash where one
 * of its events collides - so the strip doubles as a map of the season.
 * @param from The season's opening day, as an ISO date
 * @param to The season's closing day, as an ISO date
 * @param events Every event of the season
 * @returns The months, in order
 */
export const seasonMonths = (
  from: string,
  to: string,
  events: readonly CalendarEntry[],
): SeasonMonth[] => {
  const months: SeasonMonth[] = [];

  for (let month = monthOf(from); month <= to; month = shiftMonth(month, 1)) {
    const next = shiftMonth(month, 1);
    const ticks = agendaDays(events.filter((event) => event.date >= month && event.date < next))
      .map((day): MonthTick => {
        const yours = day.events.filter((event) => event.enrolled);
        if (yours.some((event) => event.clash)) return 'clash';

        return yours.length > 0 ? 'yours' : 'other';
      });

    months.push({ start: month, ticks });
  }

  return months;
};

/**
 * The days the month grid draws: whole weeks from the Monday on or before the
 * month's first day to the Sunday on or after its last.
 * @param month The ISO date of the month's first day
 * @returns Every day of the grid, as ISO dates
 */
export const monthGrid = (month: string): string[] => {
  // getUTCDay counts from Sunday; the grid's weeks start on a Monday.
  const lead = (weekdayOf(month) + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const start = addDays(month, -lead);
  const last = addDays(shiftMonth(month, 1), -1);
  const days: string[] = [];

  for (let day = start; day <= last || days.length % DAYS_PER_WEEK !== 0; day = addDays(day, 1)) {
    days.push(day);
  }

  return days;
};

/**
 * The day the month view lists on arrival: its first race day still to come, or
 * failing that its first race day at all, or failing both its first day.
 * @param events The events the filters leave
 * @param month The ISO date of the month's first day
 * @param today The ISO date the career's clock stands at
 * @returns The ISO date to list
 */
export const defaultDay = (
  events: readonly CalendarEntry[],
  month: string,
  today: string,
): string => {
  const inMonth = events
    .map((event) => event.date)
    .filter((day) => monthOf(day) === month)
    .toSorted();

  return inMonth.find((day) => day >= today) ?? inMonth[0] ?? month;
};

/**
 * Reads the filters the calendar was saved with, keeping what is still valid
 * and falling back to the default for the rest.
 * @param stored Whatever the saved preference held
 * @returns The filters to open on
 */
export const readCriteria = (stored: unknown): CalendarCriteria => {
  if (!isRecord(stored)) return DEFAULT_CRITERIA;

  return {
    status: memberOf(stored.status, CALENDAR_STATUSES) ?? DEFAULT_CRITERIA.status,
    disciplines: readMembers(stored.disciplines, DISCIPLINES),
    // Missing reads as nothing picked, which shows both.
    kinds: readMembers(stored.kinds, CALENDAR_EVENT_KINDS),
  };
};

/**
 * Reads the layout the calendar was saved with.
 * @param stored Whatever the saved preference held
 * @returns The layout to open on, the timeline unless another was saved
 */
export const readView = (stored: unknown): CalendarView => memberOf(stored, CALENDAR_VIEWS) ?? 'days';
