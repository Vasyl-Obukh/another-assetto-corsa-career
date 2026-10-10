import type { RoundMark, SeasonProgress } from './types.ts';
import type { CalendarEntry, Career, CareerCalendar } from '../../../../shared/types';

/**
 * The next event the career is entered in, still to be raced - including one
 * on the day the clock stands at.
 * @param events Every event of the season, earliest first
 * @param clock The ISO date the career's clock stands at
 * @returns The event, or null when nothing entered is left
 */
export const upcomingEvent = (
  events: readonly CalendarEntry[],
  clock: string,
): CalendarEntry | null => events.find((event) => (
  event.enrolled && event.status === 'scheduled' && event.date >= clock
)) ?? null;

/**
 * The other entered events on the same day as one and not given up, which are
 * what its clash is with - none unless the calendar marked it as clashing.
 * @param events Every event of the season
 * @param event The event in question
 * @returns The events it collides with
 */
export const clashingWith = (
  events: readonly CalendarEntry[],
  event: CalendarEntry,
): CalendarEntry[] => (event.clash ? events.filter((other) => (
  other !== event
  && other.enrolled
  && other.status !== 'missed'
  && other.date === event.date
)) : []);

/**
 * Every championship the career is still in this season, and how far through
 * it the player is.
 * @param career The career
 * @param calendar The season's calendar, which says which season is current
 * @returns One row per championship entered and not withdrawn from
 */
export const seasonProgress = (career: Career, calendar: CareerCalendar): SeasonProgress[] => {
  const season = career.seasons.find((one) => one.index === calendar.season);

  return (season?.entries ?? []).filter((entry) => !entry.withdrawn).map((entry) => {
    const held = entry.championship.entries.find((one) => one.id === entry.entry);
    const table = entry.standings.classes.find((one) => one.entry === entry.entry);
    // A stand-in who raced the player's seat has a row of its own under the same
    // seat id, which is neither the player's nor another driver in the field.
    const drivers = table?.drivers.filter((driver) => !driver.substitute) ?? [];
    const mine = drivers.find((driver) => driver.seat === entry.playerSeat);
    const raced = entry.events.some((event) => event.status === 'raced');
    const nextAt = entry.events.findIndex((event) => event.status === 'scheduled');

    return {
      series: entry.series,
      entry: entry.entry,
      name: entry.championship.name,
      className: entry.championship.entries.length > 1 ? held?.name ?? null : null,
      ladder: held?.ladder ?? null,
      marks: entry.events.map((event, at): RoundMark => {
        if (event.status === 'raced') return 'raced';
        if (event.status === 'missed') return 'missed';

        return at === nextAt ? 'next' : 'later';
      }),
      position: raced ? mine?.position ?? null : null,
      field: drivers.length,
      points: mine?.points ?? 0,
      next: nextAt < 0 ? null : entry.events[nextAt],
    };
  });
};
