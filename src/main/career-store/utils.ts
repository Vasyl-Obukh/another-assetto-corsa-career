// The decidable parts of the career store, kept pure so they can be read and
// tested without a disk or an Electron fake behind them.

import { CAREER_SEASON_WEEKS, CAREER_VERSION, FORECAST_LEAD_DAYS } from './constants.ts';
import type { EnteredEvent } from './types.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, clashes, seasonCalendar } from '../../core/season-calendar/index.ts';
import { seedFrom } from '../../core/seeded-random/index.ts';
import {
  climateOf, formatOf, hemisphereOf, roundRaceId, roundSpans,
} from '../../core/series/index.ts';
import { drawRound } from '../../core/weather-forecast/index.ts';
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
  SkippedRound,
  SkipReason,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { isEligible } from '../../shared/utils/career-eligibility/index.ts';
import { clockOf } from '../../shared/utils/road-temperature/index.ts';
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
 * What makes one season of one career draw differently from every other.
 *
 * The career and the season, so two careers never race one year's weather or
 * field one year's drivers, and a second season of a championship rolls its own.
 * @param career The career
 * @param season Which season of it, counting from zero
 * @returns The salt every draw of that season is seeded with
 */
export const seasonSalt = (career: Career, season: number): string => `${career.id}\u0000${season}`;

/**
 * Draws one weekend's weather, once the clock has come within a week of it.
 *
 * A forecast already issued is never redrawn - that is the whole point of
 * storing it - and a weekend still further out than the lead is left alone.
 * A weekend already behind the clock is drawn too, so one passed by shows the
 * weather it had rather than a forecast still to come. Pure, because the draw
 * is stored rather than the forecast: what an install can race is asked when
 * the weekend is shown or set up.
 * @param career The career, whose id salts the draw
 * @param season Which season of the career it falls in
 * @param championship The championship it is a round of
 * @param event The weekend
 * @param date The ISO date the clock now stands at
 * @returns The weekend, with a draw when it is close enough to have one
 */
export const issueForecast = (
  career: Career,
  season: number,
  championship: Championship,
  event: SeasonEvent,
  date: string,
): SeasonEvent => {
  if (event.forecast || event.firstDay > addDays(date, FORECAST_LEAD_DAYS)) return event;

  const round = championship.rounds.find((one) => one.id === event.round);
  const climate = round && climateOf(championship, round);
  const format = round && formatOf(championship, round);
  if (!round || !climate || !format) return event;

  return {
    ...event,
    forecast: drawRound(championship.id, round, format, climate, {
      salt: seasonSalt(career, season),
      raceDay: event.raceDay,
      hemisphere: hemisphereOf(championship, round),
    }),
  };
};

/**
 * Draws the weather for every weekend of a season the clock has come within a
 * week of.
 * @param career The career, whose id salts every draw
 * @param season The season being advanced through
 * @param date The ISO date the clock now stands at
 * @returns The season, with a draw on every weekend close enough to have one
 */
export const issueForecasts = (
  career: Career,
  season: CareerSeason,
  date: string,
): CareerSeason => ({
  ...season,
  entries: season.entries.map((entry) => ({
    ...entry,
    events: entry.events.map((event) => (
      issueForecast(career, season.index, entry.championship, event, date)
    )),
  })),
});

/**
 * A career with one of its seasons replaced.
 * @param career The career
 * @param season The season as it now is, matched on its index
 * @returns The career holding it
 */
export const withSeason = (career: Career, season: CareerSeason): Career => ({
  ...career,
  seasons: career.seasons.map((one) => (one.index === season.index ? season : one)),
});

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
 * At most one, since launching another weekend gives up whichever was part-way
 * through.
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
 * button is never offered for something the command would refuse. What a
 * launch would cost the rest of the season is not a reason here: that is
 * `launchSkips`, which the player confirms rather than being refused.
 * @param held The entry and the event
 * @param raceable Whether the install can run the round
 * @returns The reason, or null when the next session can run
 */
export const launchBlock = (
  held: EnteredEvent,
  raceable: boolean,
): AppErrorInfo | null => {
  const { event } = held;
  const name = eventName(held);

  if (event.status !== 'scheduled') return appErrorInfo('career.event.closed', { round: name });
  if (!raceable) {
    return appErrorInfo('series.round.unavailable', {
      series: held.entry.championship.name, round: event.round,
    });
  }

  return null;
};

/**
 * One round of a championship as a confirmation lists it.
 * @param championship The championship, as the career holds it
 * @param entry The class the career is in, or would enter, by its id
 * @param event The round, dated
 * @param reason What moving on does to it
 * @returns The round, named and dated
 */
export const skippedRound = (
  championship: Championship,
  entry: string,
  event: SeasonEvent,
  reason: SkipReason,
): SkippedRound => {
  const at = championship.rounds.findIndex((one) => one.id === event.round);
  const held = championship.entries.find((one) => one.id === entry) ?? championship.entries[0];

  return {
    series: championship.id,
    seriesName: championship.name,
    round: event.round,
    roundName: championship.rounds[at]?.name ?? event.round,
    number: at + 1,
    ladder: held?.ladder ?? null,
    firstDay: event.firstDay,
    lastDay: event.lastDay,
    reason,
  };
};

/**
 * One of the career's rounds a move would lose: passed by unraced, or left with
 * sessions still to run.
 * @param held The entry and the event
 * @returns The round, with which of the two it is
 */
const lost = (held: EnteredEvent): SkippedRound => skippedRound(
  held.entry.championship,
  held.entry.entry,
  held.event,
  held.event.sessions.length > 0 ? 'partway' : 'skipped',
);

/**
 * What moving the clock to a date would cost: every round of the career's
 * whose weekend is over by then and has not been raced. A weekend the date
 * falls inside is still there to be raced, so it costs nothing.
 * @param season The season being advanced through
 * @param to The ISO date the clock would move to
 * @returns The rounds lost, earliest first
 */
export const advanceSkips = (season: CareerSeason, to: string): SkippedRound[] => (
  scheduledEvents(season).filter(({ event }) => event.lastDay < to).map(lost)
);

/**
 * What launching a weekend would cost the rest of the season.
 *
 * Every earlier round still unraced is lost, since the clock moves to this
 * weekend's opening day, and so is a weekend left part-way wherever it falls,
 * since the career races one weekend at a time. A weekend that opens during
 * this one is not lost yet, but it cannot be driven as well, so it is listed as
 * a clash.
 * @param season The season it belongs to
 * @param held The entry and the event being launched
 * @returns The rounds, earliest first
 */
export const launchSkips = (season: CareerSeason, held: EnteredEvent): SkippedRound[] => (
  scheduledEvents(season)
    .filter(({ event }) => event !== held.event)
    .flatMap((other) => {
      if (other.event.firstDay < held.event.firstDay || other.event.sessions.length > 0) return [lost(other)];
      if (other.event.firstDay <= held.event.lastDay) {
        return [skippedRound(other.entry.championship, other.entry.entry, other.event, 'clash')];
      }

      return [];
    })
);

/**
 * A season with some of its rounds marked as non-starts.
 * @param season The season
 * @param rounds The rounds to mark, of which only the scheduled are touched
 * @returns The season
 */
export const markMissed = (season: CareerSeason, rounds: readonly SkippedRound[]): CareerSeason => {
  const marked = new Set(rounds.map((one) => `${one.series}\u0000${one.round}`));

  return {
    ...season,
    entries: season.entries.map((entry) => (entry.withdrawn ? entry : {
      ...entry,
      events: entry.events.map((event) => (
        event.status === 'scheduled' && marked.has(`${entry.series}\u0000${event.round}`)
          ? { ...event, status: 'missed' as const }
          : event
      )),
    })),
  };
};

/**
 * Writes a start time as "HH:MM".
 * @param time "HH:MM" already, or hours as a number, or nothing
 * @returns The clock time, or null when the weekend does not say
 */
export const clockTime = (time: string | number | undefined): string | null => {
  if (time === undefined) return null;
  if (typeof time === 'string') return time;

  return clockOf(Math.round(time * MINUTES_PER_HOUR));
};

/**
 * Every session of an event, as the event page shows it.
 * @param plan The weekend planned from the season's own copy of the round
 * @param stated The format's sessions as the round states them, before a
 * distance was turned into laps - which is the only place the distance survives
 * @param records What has run so far
 * @param forecast The round's generated weather, or null when it is authored
 * or has not been forecast yet
 * @param pending Whether its weather is generated but not yet forecast, which
 * is the one thing a null forecast cannot say for itself
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
  pending: boolean,
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
      pending,
      inherit: source === undefined ? null : {
        from: plan.launches[source]?.session.name ?? null,
        reverse: session.inherit?.reverse,
      },
      status,
      record,
      startSlot: status === 'next' ? startingGrid(plan, state, index)?.playerSlot ?? null : null,
      // Not a substitute's: the player's seat raced without them is not their result.
      place: scored?.places.find((one) => one.seat === playerSeat && !one.substitute) ?? null,
      points: scored?.places.map((one) => ({ position: one.position, points: one.points })) ?? [],
      // A simulated race's own order is its start; a driven one's [CAR_n] order
      // puts the player first, so its start is composed again the way it was.
      startOrder: record && session.type === 'race'
        ? (record.skipped ? record.gridOrder : startingGrid(plan, state, index)?.order ?? null)
        : null,
      score: scored ?? null,
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

/**
 * A round of a championship the career is not in, as the field raced it.
 *
 * Simulated through the first class's last seat, which is where the event page
 * plans a not-entered round from, so the launches index the same grid the page
 * reads them against. That seat is simply its own driver's here, so nothing is
 * marked as a substitute.
 * @param series The championship, as the library holds it
 * @param event The round as the season dates it
 * @param salt The career and season, which seed the draw
 * @returns The round, simulated when it is behind the clock and as given otherwise
 */
export const simulatedEvent = (
  series: Championship,
  event: SeasonEvent,
  salt: string,
): SeasonEvent => {
  const entry = series.entries[0];
  if (event.status !== 'missed' || !entry) return event;

  try {
    const simulated = simulateRound({
      series,
      round: event.round,
      salt,
      recordedAt: new Date().toISOString(),
      player: { entry: entry.id },
    });
    const races = simulated.score.races.map((race) => ({
      ...race,
      places: race.places.map(({ substitute: unused, ...place }) => place),
    }));

    return {
      ...event, sessions: simulated.sessions, score: { ...simulated.score, races }, simulated: true,
    };
  } catch (error) {
    console.warn(`Could not simulate ${series.name} - ${event.round}.`, error);

    return event;
  }
};
