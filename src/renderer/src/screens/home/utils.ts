import { HISTORIC_BEHIND, HISTORIC_SHOWN, RECENT_FINISH_DAYS } from './constants.ts';
import type { RoundMark, SeasonProgress } from './types.ts';
import type {
  CalendarEntry, Career, CareerCalendar, CareerSeason, SeasonEntry,
} from '../../../../shared/types';
import { addDays } from '../../../../shared/utils/calendar-days';
import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import { championshipEntries } from '../../../../shared/utils/historic';
import type { EditionSummary, HistoricRow } from '@/lib/season-review';
import { editionOver, editionSummary } from '@/lib/season-review';

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

  return (season ? championshipEntries(season) : []).filter((entry) => !entry.withdrawn).map((entry) => {
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
      season: season?.index ?? 0,
      edition: entry.edition,
      editions: editionsOf(entry.championship),
      year: season ? seasonYear(season) : 0,
      over: editionOver(entry, career.date),
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

/**
 * The editions of a season that finished lately - within a fortnight of the
 * clock - and are worth saying so on Home until the career has moved on.
 * @param season The season
 * @param clock The ISO date the career's clock stands at
 * @returns Their summaries, the latest to finish first
 */
export const recentlyFinished = (season: CareerSeason, clock: string): EditionSummary[] => championshipEntries(season)
  .filter((entry) => !entry.withdrawn && editionOver(entry, clock))
  .filter((entry) => (entry.events.at(-1)?.date ?? '') >= addDays(clock, -RECENT_FINISH_DAYS))
  .sort((left, right) => (right.events.at(-1)?.date ?? '').localeCompare(left.events.at(-1)?.date ?? ''))
  .map((entry) => editionSummary(entry, season.index, clock));

/**
 * The championships a season raced, one each: the latest edition of each class
 * entered, which is what entering again in the next season starts from.
 * @param season The season
 * @returns One entry per championship and class, in calendar order
 */
export const racedLastSeason = (season: CareerSeason): SeasonEntry[] => {
  const latest = new Map<string, SeasonEntry>();
  championshipEntries(season).forEach((entry) => {
    const key = `${entry.series}\u0000${entry.entry}`;
    const held = latest.get(key);
    if (!held || held.edition < entry.edition) latest.set(key, entry);
  });

  return [...latest.values()].sort((left, right) => (
    (left.events[0]?.date ?? '').localeCompare(right.events[0]?.date ?? '')
  ));
};

/**
 * The edition of a championship a career can still enter this season: the
 * first with a round left on or after the clock.
 * @param events Every event of the season, earliest first
 * @param series The championship's id
 * @param clock The ISO date the career's clock stands at
 * @returns The edition and the day its first round runs, or null when every
 * edition of the season is behind the clock
 */
export const editionAhead = (
  events: readonly CalendarEntry[],
  series: string,
  clock: string,
): { edition: number; opens: string } | null => {
  const own = events.filter((one) => one.series === series);
  const edition = own.find((one) => one.date >= clock)?.edition;
  if (edition === undefined) return null;
  const opens = own.filter((one) => one.edition === edition).map((one) => one.date).sort()[0];

  return opens === undefined ? null : { edition, opens };
};

/**
 * The historic events Home shows around the clock: the last few behind it and
 * those coming up, in the order they run.
 * @param rows Every historic event of the season, earliest first
 * @param clock The ISO date the career's clock stands at
 * @returns The ones to show
 */
export const stripRows = (rows: readonly HistoricRow[], clock: string): HistoricRow[] => {
  const ahead = rows.findIndex((row) => row.date >= clock);
  const from = Math.max(0, (ahead < 0 ? rows.length : ahead) - HISTORIC_BEHIND);
  const start = Math.max(0, Math.min(from, rows.length - HISTORIC_SHOWN));

  return rows.slice(start, start + HISTORIC_SHOWN);
};
