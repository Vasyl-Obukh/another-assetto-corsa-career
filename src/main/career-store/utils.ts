// The decidable parts of the career store, kept pure so they can be read and
// tested without a disk or an Electron fake behind them.

import { CAREER_SEASON_WEEKS, CAREER_VERSION } from './constants.ts';
import type { EnteredEvent } from './types.ts';
import { addDays, clashes, seasonCalendar } from '../../core/season-calendar/index.ts';
import { seedFrom } from '../../core/seeded-random/index.ts';
import { roundRaceId, roundSpans } from '../../core/series/index.ts';
import { chainOf, startingGrid } from '../../core/weekend/index.ts';
import {
  DAYS_PER_WEEK, DEFAULT_SEASON_LENGTH, MINUTES_PER_HOUR, SEASON_WEEKS,
} from '../../shared/constants/index.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  CalendarEntry,
  Career,
  CareerCalendar,
  CareerSeason,
  Championship,
  ClassEntry,
  EventSession,
  LaunchRecord,
  RoundForecast,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
  SeriesListing,
  SeriesSession,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { isEligible } from '../../shared/utils/career-eligibility/index.ts';
import { roundAvailabilityIn, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';

/**
 * Whether a value is a career this build can read.
 *
 * A shape guard rather than a tolerant reader, and the difference is
 * deliberate: settings.json is coerced field by field because a user may
 * reasonably hand-edit it, while career.json is written by this app alone. One
 * that does not read is quarantined and the career starts empty, rather than
 * being half-understood. Down to each season's own copy of its championship and
 * each event's session records, since a file missing those would fail the first
 * time a round was opened rather than when it was loaded.
 * @param value Whatever was parsed out of the file
 * @returns The career, or null when it is not one
 */
export const readCareer = (value: unknown): Career | null => {
  if (typeof value !== 'object' || value === null) return null;

  const career = value as Partial<Career>;
  const readable = career.version === CAREER_VERSION
    && typeof career.id === 'string'
    && typeof career.date === 'string'
    && typeof career.startDate === 'string'
    && typeof career.level === 'object' && career.level !== null
    && Array.isArray(career.seasons)
    && (career.seasons as readonly Partial<CareerSeason>[]).every((season) => (
      Array.isArray(season?.entries)
      && (season.entries as readonly Partial<SeasonEntry>[]).every((entry) => (
        typeof entry?.championship === 'object'
        && entry.championship !== null
        && Array.isArray(entry.events)
        && (entry.events as readonly Partial<SeasonEvent>[]).every((event) => (
          Array.isArray(event?.sessions)
        ))
      ))
    ));

  return readable ? career as Career : null;
};

/**
 * The last day a season covers, given the day it opens on.
 * @param startDate The ISO date the season opens
 * @returns The ISO date of its last day
 */
export const seasonEndDate = (startDate: string): string => (
  addDays(startDate, CAREER_SEASON_WEEKS * DAYS_PER_WEEK - 1)
);

/**
 * The season a career is currently in, which is always its last.
 * @param career The career
 * @returns The season, or null when it has none
 */
export const currentSeason = (career: Career): CareerSeason | null => (
  career.seasons[career.seasons.length - 1] ?? null
);

/**
 * Dates a championship's rounds across a season and freezes them as events.
 *
 * Rounds whose weekend has already closed by the time the championship is
 * entered are recorded missed rather than scheduled, which is what entering a
 * championship in June means: the spring rounds happened without you.
 * @param series The championship being entered
 * @param season The season it is entered in
 * @param today The ISO date the career's clock stands at
 * @returns Its rounds, dated
 */
export const materialiseEvents = (
  series: Championship,
  season: CareerSeason,
  today: string,
): SeasonEvent[] => {
  const length = series.seasonLength ?? DEFAULT_SEASON_LENGTH;
  const dated = seasonCalendar(
    roundSpans(series),
    season.startDate,
    length,
    // Off the championship's own id, so its calendar is the same every time it
    // is drawn and no two seasons of it wander. Without this every one of the
    // library's championships would open on the same Sunday. Held inside the
    // weeks its own racing does not fill, so a season always finishes within
    // the career's year.
    seedFrom(series.id) % Math.max(1, CAREER_SEASON_WEEKS - SEASON_WEEKS[length] + 1),
  );

  return dated.map((round, at) => ({
    round: round.id,
    raceId: roundRaceId(series.id, round.id),
    firstDay: round.firstDay,
    raceDay: round.raceDay,
    lastDay: round.lastDay,
    entryFee: series.rounds[at]?.entryFee ?? series.entryFee,
    status: round.lastDay < today ? 'missed' : 'scheduled',
    sessions: [],
  }));
};

/**
 * Every event of a season that is still to be raced, earliest weekend first.
 * @param season The season to read
 * @returns The events, with the entry each belongs to
 */
export const scheduledEvents = (season: CareerSeason): EnteredEvent[] => season.entries
  .filter((entry) => !entry.withdrawn)
  .flatMap((entry) => entry.events
    .filter((event) => event.status === 'scheduled')
    .map((event) => ({ entry, event })))
  .sort((left, right) => left.event.firstDay.localeCompare(right.event.firstDay));

/**
 * Where the clock stops when it is asked to move to a date.
 *
 * At the opening day of the first enrolled weekend on the way, rather than past
 * it: skipping an event the career entered would turn it into a non-start
 * without the player ever being asked. An event already under way when the
 * clock is where it is does not stop it again, or the clock could never move.
 * @param season The season being advanced through, or null when there is none
 * @param from The ISO date the clock stands at
 * @param to The ISO date it was asked to move to
 * @returns The ISO date it should stop at
 */
export const advanceStop = (
  season: CareerSeason | null,
  from: string,
  to: string,
): string => {
  if (!season) return to;

  const next = scheduledEvents(season)
    .map(({ event }) => event.firstDay)
    .find((day) => day > from && day <= to);

  return next ?? to;
};

/**
 * One round of a championship the career is in, found by its ids.
 * @param season The season to look in
 * @param series The championship's id
 * @param round The round's id
 * @returns The entry and its event, or null when the career is not in it
 */
export const enteredEvent = (
  season: CareerSeason,
  series: string,
  round: string,
): EnteredEvent | null => {
  const entry = season.entries.find((one) => one.series === series && !one.withdrawn);
  const event = entry?.events.find((one) => one.round === round);

  return entry && event ? { entry, event } : null;
};

/**
 * The weekend the career is part-way through, if it is part-way through one.
 *
 * At most one: a weekend is set up only while no other is under way, since the
 * race store holds a single weekend's progress and setting another up throws it
 * away.
 * @param season The season to look in
 * @returns The entry and its event, or null
 */
export const inProgressEvent = (season: CareerSeason): EnteredEvent | null => (
  scheduledEvents(season).find(({ event }) => event.sessions.length > 0) ?? null
);

/**
 * What to call an event in a message: the championship and the round.
 * @param held The entry and its event
 * @returns The name
 */
export const eventName = ({ entry, event }: EnteredEvent): string => {
  const round = entry.championship.rounds.find((one) => one.id === event.round);

  return `${entry.championship.name} - ${round?.name ?? event.round}`;
};

/**
 * Why the next session of an event cannot be launched.
 *
 * One function for the page's answer and the launch command's refusal, so the
 * button is never offered for something the command would refuse. Earlier
 * weekends come first on purpose: running a later weekend ahead of the clock is
 * allowed only once nothing entered before it is left unraced.
 * @param season The season it belongs to
 * @param held The entry and the event
 * @param raceable Whether the install can run the round
 * @param disturbed Whether its weekend was changed on the Race screen part-way
 * @returns The reason, or null when the next session can run
 */
export const launchBlock = (
  season: CareerSeason,
  held: EnteredEvent,
  raceable: boolean,
  disturbed: boolean,
): AppErrorInfo | null => {
  const { event } = held;
  const name = eventName(held);

  if (event.status !== 'scheduled') return appErrorInfo('career.event.closed', { round: name });
  if (disturbed) return appErrorInfo('career.event.disturbed', { event: name });
  if (!raceable) {
    return appErrorInfo('series.round.unavailable', {
      series: held.entry.championship.name, round: event.round,
    });
  }

  const earlier = scheduledEvents(season).find((one) => (
    one.event !== event && one.event.firstDay < event.firstDay
  ));
  if (earlier) return appErrorInfo('career.event.earlierPending', { event: eventName(earlier) });

  const busy = inProgressEvent(season);
  if (busy && busy.event !== event) {
    return appErrorInfo('career.event.otherInProgress', { event: eventName(busy) });
  }

  return null;
};

/**
 * Writes a start time as "HH:MM".
 * @param time "HH:MM" already, or hours as a number, or nothing
 * @returns The clock time, or null when the weekend does not say
 */
export const clockTime = (time: string | number | undefined): string | null => {
  if (time === undefined) return null;
  if (typeof time === 'string') return time;

  const minutes = Math.round(time * MINUTES_PER_HOUR);
  const hh = String(Math.floor(minutes / MINUTES_PER_HOUR)).padStart(2, '0');
  const mm = String(minutes % MINUTES_PER_HOUR).padStart(2, '0');

  return `${hh}:${mm}`;
};

/**
 * Every session of an event, as the event page shows it.
 * @param plan The weekend planned from the season's own copy of the round
 * @param stated The format's sessions as the round states them, before a
 * distance was turned into laps - which is the only place the distance survives
 * @param records What has run so far
 * @param forecast The round's generated weather, or null when authored
 * @param firstDay The ISO date the weekend opens on
 * @param score What the weekend has paid so far
 * @param playerSeat The seat the player took, when the career is entered
 * @param live Whether the career can still run this weekend, which is what
 * makes the first session not yet run "next" rather than merely "later"
 * @returns One per launch, in the order they run
 */
export const eventSessions = (
  plan: WeekendPlan,
  stated: readonly SeriesSession[],
  records: readonly LaunchRecord[],
  forecast: RoundForecast | null,
  firstDay: string,
  score: RoundScore | undefined,
  playerSeat: string | null,
  live: boolean,
): EventSession[] => {
  const state: WeekendState = {
    raceId: plan.raceId, launchCount: plan.launches.length, completed: [...records],
  };

  return plan.launches.map((launch): EventSession => {
    const { index, session } = launch;
    const record = records.find((one) => one.index === index) ?? null;
    let status: EventSession['status'] = 'later';
    if (record) status = 'done';
    else if (live && index === records.length) status = 'next';

    // A race follows the chain the weekend composes its grid from, and a
    // knockout segment the session it names. Anything else starts from the pit
    // lane, which is said by having no source at all.
    const source = session.inherit !== undefined || session.type === 'race'
      ? chainOf(plan, index)[0]
      : undefined;
    const scored = score?.races.find((one) => one.launch === index);

    return {
      index,
      type: session.type,
      name: session.name ?? null,
      date: addDays(firstDay, launch.day),
      startsAt: clockTime(launch.race.conditions?.timeOfDay),
      laps: session.laps,
      minutes: session.laps === undefined ? session.minutes : undefined,
      distance: stated[index]?.distance,
      forecast: forecast?.sessions.find((one) => one.index === index) ?? null,
      inherit: source === undefined ? null : {
        from: plan.launches[source]?.session.name ?? null,
        reverse: session.inherit?.reverse,
      },
      status,
      record,
      startSlot: status === 'next' ? startingGrid(plan, state, index)?.playerSlot ?? null : null,
      place: scored?.places.find((one) => one.seat === playerSeat) ?? null,
      points: scored?.places.map((one) => ({ position: one.position, points: one.points })) ?? [],
    };
  });
};

/**
 * Reads one dated event into the row the calendar shows.
 * @param series The championship the row is read from - a season's own copy
 * for a class the career entered, the library's otherwise
 * @param availability What the install can race of that championship
 * @param entry The class entry the row is read through
 * @param event The dated round
 * @param career The career reading it
 * @param enrolled Whether the career is in this class this season
 * @returns The row
 */
export const calendarEntry = (
  series: Championship,
  availability: SeriesAvailability,
  entry: ClassEntry,
  event: SeasonEvent,
  career: Career,
  enrolled: boolean,
): CalendarEntry => {
  // A round a season's copy no longer matches keeps its id as its name rather
  // than vanishing off the calendar, which would lose a round that may already
  // have been raced.
  const at = series.rounds.findIndex((one) => one.id === event.round);
  const round = series.rounds[at];
  // A class's own purse where it has one, the championship's otherwise - which
  // is exactly what PrizeMoney says a class table left out means.
  const prizes = entry.prizes ?? series.prizes;

  return {
    series: series.id,
    seriesName: series.name,
    entry: entry.id,
    entryName: entry.name,
    ladder: entry.ladder,
    round: event.round,
    number: at < 0 ? 1 : at + 1,
    roundName: round?.name ?? event.round,
    track: round?.track ?? { id: '' },
    races: roundAvailabilityIn(availability, event.round)?.races ?? [],
    gridSize: entry.seats.length,
    prize: prizes?.positions?.[0] ?? null,
    entryFee: event.entryFee,
    multiClass: series.entries.length > 1,
    firstDay: event.firstDay,
    raceDay: event.raceDay,
    lastDay: event.lastDay,
    status: event.status,
    enrolled,
    eligible: isEligible(entry.ladder, career.level),
    raceable: roundRaceableIn(availability, event.round),
    clash: false,
  };
};

/**
 * Builds one season's calendar out of the career and the library.
 *
 * A class the career entered is drawn from its season's own copy of the
 * championship, with the dates it was entered on; every other class from the
 * library, where it would fall if it were entered today. So a championship
 * edited or deleted mid-season still shows the season being raced in it.
 * @param career The career
 * @param season The season to draw
 * @param listings Every championship the library holds
 * @param entered What the install can race of each entered season's own copy
 * @returns The merged, dated calendar
 */
export const composeCalendar = (
  career: Career,
  season: CareerSeason,
  listings: readonly SeriesListing[],
  entered: ReadonlyMap<SeasonEntry, SeriesAvailability>,
): CareerCalendar => {
  const key = (series: string, entry: string): string => `${series}\u0000${entry}`;
  const taken = new Set(season.entries.map((one) => key(one.series, one.entry)));

  const own = season.entries.flatMap((held): CalendarEntry[] => {
    const entry = held.championship.entries.find((one) => one.id === held.entry);
    const availability = entered.get(held);
    if (!entry || !availability) return [];

    return held.events.map((event) => calendarEntry(
      held.championship, availability, entry, event, career, !held.withdrawn,
    ));
  });

  const library = listings.flatMap((listing) => {
    const entries = listing.series.entries
      .filter((entry) => !taken.has(key(listing.series.id, entry.id)));
    if (entries.length === 0) return [];

    // Dated once per championship rather than once per class of it: every class
    // of a championship races the same rounds on the same days, and the library
    // is a hundred-odd championships deep.
    const events = materialiseEvents(listing.series, season, career.date);

    return entries.flatMap((entry) => events.map((event) => (
      calendarEntry(listing.series, listing.availability, entry, event, career, false)
    )));
  });

  const events = [...own, ...library];
  const enrolledSpans = events.filter((event) => event.enrolled);
  const clashing = clashes(enrolledSpans);
  const clashed = new Set(enrolledSpans
    .filter((unused, at) => clashing[at])
    .map((event) => `${key(event.series, event.entry)}\u0000${event.round}`));

  return {
    season: season.index,
    from: season.startDate,
    to: season.endDate,
    date: career.date,
    events: events
      .map((event) => ({
        ...event,
        clash: clashed.has(`${key(event.series, event.entry)}\u0000${event.round}`),
      }))
      .sort((left, right) => (
        left.firstDay.localeCompare(right.firstDay)
        || left.seriesName.localeCompare(right.seriesName)
      )),
  };
};
