// The decidable parts of the career store, kept pure so they can be read and
// tested without a disk or an Electron fake behind them.

import path from 'node:path';

import {
  BACKUP_MANIFEST,
  CAREER_FILE,
  CAREER_RESULTS_DIR,
  CAREER_SEASON_WEEKS,
  CAREER_VERSION,
  FORECAST_LEAD_DAYS,
  STATE_FILE,
} from './constants.ts';
import type { BackupContents, EnteredEvent } from './types.ts';
import { chainOf, startingGrid } from '../../core/event/index.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, clashes, seasonCalendar } from '../../core/season-calendar/index.ts';
import { seedFrom } from '../../core/seeded-random/index.ts';
import {
  climateOf, formatOf, hemisphereOf, raceWeekdayOf, runRaceId,
} from '../../core/series/index.ts';
import { drawRound } from '../../core/weather-forecast/index.ts';
import {
  DAYS_PER_WEEK, DEFAULT_SEASON_LENGTH, MAX_START_YEAR, MIN_START_YEAR, MINUTES_PER_HOUR, SEASON_WEEKS,
} from '../../shared/constants/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  CalendarEntry,
  Career,
  CareerCalendar,
  CareerDriver,
  CareerProfile,
  CareerSeason,
  CareerState,
  CareerSummary,
  CareerSummaryEvent,
  Championship,
  ChampionshipRun,
  ClassEntry,
  EventPlan,
  EventSession,
  EventState,
  EventStrength,
  LaunchRecord,
  NewCareerRequest,
  RoundForecast,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
  SeriesListing,
  SeriesSession,
  SkippedRound,
  SkipReason,
} from '../../shared/types/index.ts';
import { isEligible } from '../../shared/utils/career-eligibility/index.ts';
import { readCareerSettings } from '../../shared/utils/career-settings/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';
import { editionEntry, editionsOf } from '../../shared/utils/editions/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';
import { isNationCode } from '../../shared/utils/nations/index.ts';
import { clockOf } from '../../shared/utils/road-temperature/index.ts';
import { roundAvailabilityIn, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';
import { isArchiveName } from '../race-store/index.ts';
import { readSaveFile, SAVE_ID_PATTERN, SAVES_DIR } from '../save-files/index.ts';
import type { ZipEntry } from '../zip-archive/index.ts';

/**
 * The last day a season covers, given the day it opens on: the 31 December of
 * its year, since a season is a calendar year.
 * @param startDate The ISO date the season opens
 * @returns The ISO date of its last day
 */
export const seasonEndDate = (startDate: string): string => `${startDate.slice(0, 4)}-12-31`;

/**
 * The part of a career every save shares, as career.json holds it.
 * @param career The career
 * @returns Its profile
 */
export const profileOf = (career: Career): CareerProfile => ({
  version: CAREER_VERSION,
  id: career.id,
  createdAt: career.createdAt,
  playedAt: career.playedAt,
  driver: career.driver,
  startDate: career.startDate,
  settings: career.settings,
});

/**
 * The part of a career a save holds, as state.json holds it.
 * @param career The career
 * @returns Its state
 */
export const stateOf = (career: Career): CareerState => ({
  version: CAREER_VERSION,
  date: career.date,
  money: career.money,
  rating: career.rating,
  level: career.level,
  seasons: career.seasons,
});

/**
 * Whether a value is a career's profile this build can read.
 *
 * A shape guard rather than a tolerant reader, and the difference is
 * deliberate: settings.json is coerced field by field because a user may
 * reasonably hand-edit it, while career.json is written by this app alone. One
 * that does not read is quarantined rather than half-understood.
 * @param value Whatever was parsed out of career.json
 * @returns The profile, or null when it is not one
 */
export const readProfile = (value: unknown): CareerProfile | null => {
  if (typeof value !== 'object' || value === null) return null;

  const profile = value as Partial<CareerProfile>;
  const readable = profile.version === CAREER_VERSION
    && typeof profile.id === 'string'
    && typeof profile.createdAt === 'string'
    && typeof profile.playedAt === 'string'
    && typeof profile.driver?.name === 'string'
    && typeof profile.startDate === 'string';

  // Rebuilt rather than cast, so nothing else in the file rides along into the
  // career it is joined with. Its settings are read the tolerant way, as
  // settings are everywhere.
  return readable ? profileOf({ ...profile, settings: readCareerSettings(profile.settings) } as Career) : null;
};

/**
 * Whether a value is a career's state this build can read - out of state.json
 * or a save.
 *
 * A shape guard for the reason `readProfile` is one, down to each season's own
 * copy of its championship and its formats, and each event's day and session
 * records, since a state missing those would fail the first time a round was
 * opened rather than when it was loaded.
 * @param value Whatever was parsed out of the file
 * @returns The state, or null when it is not one
 */
export const readState = (value: unknown): CareerState | null => {
  if (typeof value !== 'object' || value === null) return null;

  const state = value as Partial<CareerState>;
  const readable = state.version === CAREER_VERSION
    && typeof state.money === 'number'
    && typeof state.rating === 'object' && state.rating !== null
    && typeof state.date === 'string'
    && typeof state.level === 'object' && state.level !== null
    && Array.isArray(state.seasons)
    && (state.seasons as readonly Partial<CareerSeason>[]).every((season) => (
      // A calendar year, which a career written while a season was fifty-two
      // weeks long is not - it would close a day early, and every season after it
      // would drift a day further.
      typeof season?.startDate === 'string'
      && season.startDate.endsWith('-01-01')
      && season.endDate === seasonEndDate(season.startDate)
      && Array.isArray(season.entries)
      && (season.entries as readonly Partial<SeasonEntry>[]).every((entry) => (
        typeof entry?.edition === 'number'
        && typeof entry.championship === 'object'
        && entry.championship !== null
        && Array.isArray(entry.championship.eventFormats)
        && Array.isArray(entry.events)
        && (entry.events as readonly Partial<SeasonEvent>[]).every((event) => (
          typeof event?.date === 'string'
          && Array.isArray(event.sessions)
        ))
      ))
    ));

  return readable ? stateOf(state as Career) : null;
};

/**
 * The season a career is currently in, which is always its last.
 * @param career The career
 * @returns The season, or null when it has none
 */
export const currentSeason = (career: Career): CareerSeason | null => (
  career.seasons[career.seasons.length - 1] ?? null
);

/**
 * One season of a career, by its index.
 * @param career The career
 * @param index Which season, counting from zero; the current one when omitted
 * @returns The season, or null when the career has none by that index
 */
export const seasonOf = (career: Career, index?: number): CareerSeason | null => (
  index === undefined ? currentSeason(career) : career.seasons.find((one) => one.index === index) ?? null
);

/**
 * A season, freshly opened.
 *
 * It opens empty. Only commitments carry over from the season before, and
 * there are none yet: a contract that runs into the next year is Phase 9's,
 * and is what will enter its championship here.
 * @param index Which season it is, counting from zero
 * @param startDate The ISO date it opens, which is 1 January
 * @returns The season
 */
export const openSeason = (index: number, startDate: string): CareerSeason => ({
  index, startDate, endDate: seasonEndDate(startDate), entries: [],
});


/**
 * Dates one edition of a championship's rounds and freezes them as events.
 *
 * Each edition has an equal share of the season's weeks, the first opening the
 * year. Rounds whose day has already gone by the time the championship is
 * entered are recorded missed rather than scheduled, which is what entering a
 * championship in June means: the spring rounds happened without you.
 * @param series The championship being entered
 * @param season The season it is entered in
 * @param edition Which of the season's editions, counting from zero
 * @param today The ISO date the career's clock stands at
 * @returns Its rounds, dated
 */
export const materialiseEvents = (
  series: Championship,
  season: CareerSeason,
  edition: number,
  today: string,
): SeasonEvent[] => {
  const length = series.seasonLength ?? DEFAULT_SEASON_LENGTH;
  const share = Math.floor(CAREER_SEASON_WEEKS / editionsOf(series));
  const dated = seasonCalendar(
    series.rounds.map((round) => round.id),
    addDays(season.startDate, edition * share * DAYS_PER_WEEK),
    length,
    raceWeekdayOf(series),
    // Off the championship's own id, so its calendar is the same every time it
    // is drawn and no two seasons or editions of it wander. Without this every
    // one of the library's championships would open in the same week. Held
    // inside the weeks its own racing does not fill, so an edition always
    // finishes within its share of the year.
    seedFrom(series.id) % Math.max(1, share - SEASON_WEEKS[length] + 1),
  );

  return dated.map((round, at) => ({
    round: round.id,
    raceId: runRaceId(series.id, round.id, { season: season.index, edition }),
    date: round.date,
    entryFee: series.rounds[at]?.entryFee ?? series.entryFee,
    status: round.date < today ? 'missed' : 'scheduled',
    sessions: [],
  }));
};

/**
 * Every event of a season that is still to be raced, earliest event first.
 * @param season The season to read
 * @returns The events, with the entry each belongs to
 */
export const scheduledEvents = (season: CareerSeason): EnteredEvent[] => season.entries
  .filter((entry) => !entry.withdrawn)
  .flatMap((entry) => entry.events
    .filter((event) => event.status === 'scheduled')
    .map((event) => ({ entry, event })))
  .sort((left, right) => left.event.date.localeCompare(right.event.date));

/**
 * The edition of a championship still to come, or under way, on a date: the
 * first whose last round is not yet behind it - or the season's last, once
 * every one of them is.
 * @param series The championship
 * @param season The season
 * @param today The ISO date the career's clock stands at
 * @returns The edition, counting from zero
 */
export const editionAt = (series: Championship, season: CareerSeason, today: string): number => {
  const editions = editionsOf(series);

  for (let edition = 0; edition < editions; edition += 1) {
    const last = materialiseEvents(series, season, edition, today).at(-1);
    if (last && last.date >= today) return edition;
  }

  return editions - 1;
};

/**
 * Refuses an edition a championship does not run.
 * @param series The championship
 * @param edition Which of the season's editions was asked for
 * @throws When the season holds no such edition of it
 */
export const checkEdition = (series: Championship, edition: number): void => {
  const editions = editionsOf(series);
  if (!Number.isInteger(edition) || edition < 0 || edition >= editions) {
    throw new AppError('career.edition.unknown', { series: series.name, edition, editions });
  }
};

/**
 * Where the clock stops when it is asked to move to a date.
 *
 * At the day of the first enrolled event on the way, rather than past it:
 * skipping an event the career entered would turn it into a non-start without
 * the player ever being asked. An event on the day the clock already stands at
 * does not stop it again, or the clock could never move.
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
    .map(({ event }) => event.date)
    .find((day) => day > from && day <= to);

  return next ?? to;
};

/**
 * What makes one run of one career draw differently from every other.
 *
 * The career, the season and the edition, so two careers never race one year's
 * weather or field one year's drivers, and a second season or a second edition
 * of a championship rolls its own. The first edition is spelled exactly as a
 * season always was, so a championship that runs once a year draws what it did
 * before editions existed.
 * @param career The career
 * @param season Which season of it, counting from zero
 * @param edition Which of the season's editions, counting from zero
 * @returns The salt every draw of that run is seeded with
 */
export const seasonSalt = (career: Career, season: number, edition = 0): string => (
  edition === 0 ? `${career.id}\u0000${season}` : `${career.id}\u0000${season}\u0000${edition}`
);

/**
 * Draws one event's weather, once the clock has come within a week of it.
 *
 * A forecast already issued is never redrawn - that is the whole point of
 * storing it - and an event still further out than the lead is left alone.
 * An event already behind the clock is drawn too, so one passed by shows the
 * weather it had rather than a forecast still to come. Pure, because the draw
 * is stored rather than the forecast: what an install can race is asked when
 * the event is shown or set up.
 * @param career The career, whose id salts the draw
 * @param run Which season and edition of the championship it falls in
 * @param championship The championship it is a round of
 * @param event The event
 * @param date The ISO date the clock now stands at
 * @returns The event, with a draw when it is close enough to have one
 */
export const issueForecast = (
  career: Career,
  run: ChampionshipRun,
  championship: Championship,
  event: SeasonEvent,
  date: string,
): SeasonEvent => {
  if (event.forecast || event.date > addDays(date, FORECAST_LEAD_DAYS)) return event;

  const round = championship.rounds.find((one) => one.id === event.round);
  const climate = round && climateOf(championship, round);
  const format = round && formatOf(championship, round);
  if (!round || !climate || !format) return event;

  return {
    ...event,
    forecast: drawRound(championship.id, round, format, climate, {
      salt: seasonSalt(career, run.season, run.edition),
      raceDay: event.date,
      hemisphere: hemisphereOf(championship, round),
    }),
  };
};

/**
 * Draws the weather for every event of a season the clock has come within a
 * week of.
 * @param career The career, whose id salts every draw
 * @param season The season being advanced through
 * @param date The ISO date the clock now stands at
 * @returns The season, with a draw on every event close enough to have one
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
      issueForecast(career, { season: season.index, edition: entry.edition }, entry.championship, event, date)
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
 * The edition of a championship the career is racing: entered, and not pulled
 * out of.
 * @param season The season to look in
 * @param series The championship's id
 * @param edition Which of the season's editions
 * @returns The entry, or null when the career is not in it
 */
export const enteredEntry = (season: CareerSeason, series: string, edition: number): SeasonEntry | null => (
  season.entries.find((one) => one.series === series && one.edition === edition && !one.withdrawn) ?? null
);

/**
 * One round of a championship edition the career is in, found by its ids.
 * @param season The season to look in
 * @param series The championship's id
 * @param round The round's id
 * @param edition Which of the season's editions
 * @param withdrawn Whether an edition the career pulled out of counts, which it
 * does only for reading a round back - never for racing one
 * @returns The entry and its event, or null when the career is not in it
 */
export const enteredEvent = (
  season: CareerSeason,
  series: string,
  round: string,
  edition: number,
  withdrawn = false,
): EnteredEvent | null => {
  const entry = withdrawn ? editionEntry(season, series, edition) : enteredEntry(season, series, edition);
  const event = entry?.events.find((one) => one.round === round);

  return entry && event ? { entry, event } : null;
};

/**
 * The event the career is part-way through, if it is part-way through one.
 *
 * At most one, since launching another event gives up whichever was part-way
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
 * `launchSkips`, which the player confirms rather than being refused. An event
 * on a day the career has already raced is, since nothing is left to give up.
 * @param season The season it belongs to
 * @param held The entry and the event
 * @param raceable Whether the install can run the round
 * @param allowSameDay Whether settings allow two events on one day
 * @returns The reason, or null when the next session can run
 */
export const launchBlock = (
  season: CareerSeason,
  held: EnteredEvent,
  raceable: boolean,
  allowSameDay: boolean,
): AppErrorInfo | null => {
  const { event } = held;
  const name = eventName(held);

  if (event.status !== 'scheduled') return appErrorInfo('career.event.closed', { round: name });
  const raced = allowSameDay ? undefined : season.entries
    .filter((entry) => !entry.withdrawn && entry !== held.entry)
    .flatMap((entry) => entry.events.map((one) => ({ entry, event: one })))
    .find((other) => other.event.date === event.date && other.event.status === 'raced');
  if (raced) return appErrorInfo('career.event.sameDay', { event: eventName(raced) });
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
 * @param edition Which of the season's editions
 * @param event The round, dated
 * @param reason What moving on does to it
 * @param historic Whether it is a historic event rather than a championship's round
 * @returns The round, named and dated
 */
export const skippedRound = (
  championship: Championship,
  entry: string,
  edition: number,
  event: SeasonEvent,
  reason: SkipReason,
  historic = false,
): SkippedRound => {
  const at = championship.rounds.findIndex((one) => one.id === event.round);
  const held = championship.entries.find((one) => one.id === entry) ?? championship.entries[0];

  return {
    series: championship.id,
    edition,
    seriesName: championship.name,
    round: event.round,
    roundName: championship.rounds[at]?.name ?? event.round,
    number: at + 1,
    ladder: held?.ladder ?? null,
    date: event.date,
    reason,
    historic,
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
  held.entry.edition,
  held.event,
  held.event.sessions.length > 0 ? 'partway' : 'skipped',
  isHistoric(held.entry),
);

/**
 * What moving the clock to a date would cost: every round of the career's
 * whose day is behind it by then and has not been raced. An event on the date
 * itself is still there to be raced, so it costs nothing.
 * @param season The season being advanced through
 * @param to The ISO date the clock would move to
 * @returns The rounds lost, earliest first
 */
export const advanceSkips = (season: CareerSeason, to: string): SkippedRound[] => (
  scheduledEvents(season).filter(({ event }) => event.date < to).map(lost)
);

/**
 * What launching an event would cost the rest of the season.
 *
 * Every earlier round still unraced is lost, since the clock moves to this
 * event's day, and so is an event left part-way wherever it falls, since the
 * career races one event at a time. An event on the same day is lost too, as a
 * clash, unless settings allow two events on one day.
 * @param season The season it belongs to
 * @param held The entry and the event being launched
 * @param allowSameDay Whether settings allow two events on one day
 * @returns The rounds, earliest first
 */
export const launchSkips = (
  season: CareerSeason,
  held: EnteredEvent,
  allowSameDay: boolean,
): SkippedRound[] => (
  scheduledEvents(season)
    .filter(({ event }) => event !== held.event)
    .flatMap((other) => {
      if (other.event.date < held.event.date || other.event.sessions.length > 0) return [lost(other)];
      if (other.event.date === held.event.date && !allowSameDay) {
        return [skippedRound(
          other.entry.championship,
          other.entry.entry,
          other.entry.edition,
          other.event,
          'clash',
          isHistoric(other.entry),
        )];
      }

      return [];
    })
);

/**
 * What a refusal calls a lost round: its championship and its name.
 * @param round The round
 * @returns The name
 */
export const lostName = (round: SkippedRound): string => `${round.seriesName} - ${round.roundName}`;

/**
 * A season with some of its rounds marked as non-starts.
 * @param season The season
 * @param rounds The rounds to mark, of which only the scheduled are touched
 * @returns The season
 */
export const markMissed = (season: CareerSeason, rounds: readonly SkippedRound[]): CareerSeason => {
  const key = (series: string, edition: number, round: string): string => `${series}\u0000${edition}\u0000${round}`;
  const marked = new Set(rounds.map((one) => key(one.series, one.edition, one.round)));

  return {
    ...season,
    entries: season.entries.map((entry) => (entry.withdrawn ? entry : {
      ...entry,
      events: entry.events.map((event) => (
        event.status === 'scheduled' && marked.has(key(entry.series, entry.edition, event.round))
          ? { ...event, status: 'missed' as const }
          : event
      )),
    })),
  };
};

/**
 * A career with its current season brought to the season's last day.
 *
 * Every round of the career's still to run in it becomes a non-start - the
 * player has been shown and confirmed what moving past the year costs - and the
 * clock stands on 31 December, so simulating the missed rounds reaches every
 * one of them. What a season's end pays out - prize money for a final
 * standing, the ladder moving - lands here too, once Phases 7 and 8 bring it.
 * @param career The career
 * @param season The season to close
 * @returns The career, its clock on the season's last day
 */
export const closeSeason = (career: Career, season: CareerSeason): Career => {
  const dated = { ...career, date: season.endDate };
  const marked = markMissed(season, advanceSkips(season, addDays(season.endDate, 1)));

  return withSeason(dated, issueForecasts(dated, marked, season.endDate));
};

/**
 * Writes a start time as "HH:MM".
 * @param time "HH:MM" already, or hours as a number, or nothing
 * @returns The clock time, or null when the event does not say
 */
export const clockTime = (time: string | number | undefined): string | null => {
  if (time === undefined) return null;
  if (typeof time === 'string') return time;

  return clockOf(Math.round(time * MINUTES_PER_HOUR));
};

/**
 * Every session of an event, as the event page shows it.
 * @param plan The event planned from the season's own copy of the round
 * @param stated The format's sessions as the round states them, before a
 * distance was turned into laps - which is the only place the distance survives
 * @param records What has run so far
 * @param forecast The round's generated weather, or null when it is authored
 * or has not been forecast yet
 * @param pending Whether its weather is generated but not yet forecast, which
 * is the one thing a null forecast cannot say for itself
 * @param score What the event has paid so far
 * @param playerSeat The seat the player took, when the career is entered
 * @param live Whether the career can still run this event, which is what
 * makes the first session not yet run "next" rather than merely "later"
 * @returns One per launch, in the order they run
 */
export const eventSessions = (
  plan: EventPlan,
  stated: readonly SeriesSession[],
  records: readonly LaunchRecord[],
  forecast: RoundForecast | null,
  pending: boolean,
  score: RoundScore | undefined,
  playerSeat: string | null,
  live: boolean,
): EventSession[] => {
  const state: EventState = {
    raceId: plan.raceId, launchCount: plan.launches.length, completed: [...records],
  };

  return plan.launches.map((launch): EventSession => {
    const { index, session } = launch;
    const record = records.find((one) => one.index === index) ?? null;
    let status: EventSession['status'] = 'later';
    if (record) status = 'done';
    else if (live && index === records.length) status = 'next';

    // A race follows the chain the event composes its grid from, and a
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
      day: launch.day,
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
 * @param edition Which of the season's editions the round belongs to
 * @param event The dated round
 * @param career The career reading it
 * @param enrolled Whether the career is in this class of this edition
 * @param historic Whether it is a historic event, which the career may race
 * only while it holds the invitation
 * @returns The row
 */
export const calendarEntry = (
  series: Championship,
  availability: SeriesAvailability,
  entry: ClassEntry,
  edition: number,
  event: SeasonEvent,
  career: Career,
  enrolled: boolean,
  historic = false,
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
    edition,
    editions: editionsOf(series),
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
    date: event.date,
    status: event.status,
    enrolled,
    // Whatever the career's level, but only while the invitation stands: one
    // declined is no longer open to enter.
    eligible: historic ? enrolled : isEligible(entry.ladder, career.level),
    raceable: roundRaceableIn(availability, event.round),
    clash: false,
    historic,
  };
};

/**
 * Builds one season's calendar out of the career and the library.
 *
 * A class the career entered is drawn from its season's own copy of the
 * championship, with the dates it was entered on; every other class, and every
 * edition of it not entered, from the library, where it would fall if it were
 * entered today. So a championship edited or deleted mid-season still shows
 * the season being raced in it.
 * @param career The career
 * @param season The season to draw
 * @param listings Every championship the library holds
 * @param entered What the install can race of each entered season's own copy
 * @param allowSameDay Whether settings allow two events on one day, which is
 * when nothing clashes
 * @returns The merged, dated calendar
 */
export const composeCalendar = (
  career: Career,
  season: CareerSeason,
  listings: readonly SeriesListing[],
  entered: ReadonlyMap<SeasonEntry, SeriesAvailability>,
  allowSameDay: boolean,
): CareerCalendar => {
  const key = (series: string, entry: string, edition: number): string => (
    `${series}\u0000${entry}\u0000${edition}`
  );
  const taken = new Set(season.entries.map((one) => key(one.series, one.entry, one.edition)));

  const own = season.entries.flatMap((held): CalendarEntry[] => {
    const entry = held.championship.entries.find((one) => one.id === held.entry);
    const availability = entered.get(held);
    if (!entry || !availability) return [];

    return held.events.map((event) => calendarEntry(
      held.championship, availability, entry, held.edition, event, career, !held.withdrawn, isHistoric(held),
    ));
  });

  const library = listings.flatMap((listing) => Array.from(
    { length: editionsOf(listing.series) },
    (unused, edition) => {
      const entries = listing.series.entries
        .filter((entry) => !taken.has(key(listing.series.id, entry.id, edition)));
      if (entries.length === 0) return [];

      // Dated once per edition rather than once per class of it: every class of
      // a championship races the same rounds on the same days, and the library
      // is a hundred-odd championships deep.
      const events = materialiseEvents(listing.series, season, edition, career.date);

      return entries.flatMap((entry) => events.map((event) => (
        calendarEntry(listing.series, listing.availability, entry, edition, event, career, false)
      )));
    },
  ).flat());

  const events = [...own, ...library];
  // A pair settled by giving one up has nothing left to choose between.
  const enrolled = allowSameDay ? [] : events.filter((event) => event.enrolled && event.status !== 'missed');
  const clashing = clashes(enrolled.map((event) => event.date));
  const clashed = new Set(enrolled
    .filter((unused, at) => clashing[at])
    .map((event) => `${key(event.series, event.entry, event.edition)}\u0000${event.round}`));

  return {
    season: season.index,
    from: season.startDate,
    to: season.endDate,
    date: career.date,
    events: events
      .map((event) => ({
        ...event,
        clash: clashed.has(`${key(event.series, event.entry, event.edition)}\u0000${event.round}`),
      }))
      .sort((left, right) => (
        left.date.localeCompare(right.date)
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

/**
 * The player's own steps on the AI's strength for one round: the season's and
 * the round's together.
 * @param held The edition and the round
 * @returns The sum, zero for none
 */
export const strengthStep = (held: EnteredEvent): number => (
  (held.entry.strength ?? 0) + (held.event.strength ?? 0)
);

/**
 * What the AI's strength in one of the career's rounds is made of, below the
 * difficulty in settings.
 * @param held The edition and the round
 * @param editable Whether the round's step may still change
 * @returns Every layer, zero where nothing states one
 */
export const eventStrength = (held: EnteredEvent, editable: boolean): EventStrength => {
  const { championship } = held.entry;

  return {
    championship: championship.grid?.strength ?? 0,
    classes: championship.entries.map((one) => ({ entry: one.id, name: one.name, offset: one.grid?.strength ?? 0 })),
    round: championship.rounds.find((one) => one.id === held.event.round)?.grid?.strength ?? 0,
    season: held.entry.strength ?? 0,
    step: held.event.strength ?? 0,
    editable,
  };
};

/**
 * A driver as a career keeps them: the name trimmed, and the nation checked
 * against the flags Assetto Corsa ships.
 * @param driver Who the request names
 * @returns The driver
 * @throws When the name is empty or the nation is none Assetto Corsa has a
 * flag for
 */
export const checkedDriver = (driver: CareerDriver): CareerDriver => {
  const name = typeof driver.name === 'string' ? driver.name.trim() : '';
  if (!name) throw new AppError('career.driver.unnamed');
  if (driver.nation !== null && !isNationCode(driver.nation)) {
    throw new AppError('career.driver.nation', { nation: String(driver.nation) });
  }

  return { name, nation: driver.nation };
};

/**
 * Checks what a new career is asked to start from.
 * @param request The request
 * @returns The request, its driver tidied
 * @throws When the year, the level or the money is not one a career can start
 * with
 */
export const checkedNewCareer = (request: NewCareerRequest): NewCareerRequest => {
  const driver = checkedDriver(request.driver);
  if (!Number.isInteger(request.year) || request.year < MIN_START_YEAR || request.year > MAX_START_YEAR) {
    throw new AppError('career.year.invalid', { year: request.year, from: MIN_START_YEAR, to: MAX_START_YEAR });
  }
  if (!Number.isInteger(request.level) || request.level < 1) {
    throw new AppError('career.level.invalid', { level: request.level });
  }
  if (!Number.isFinite(request.money) || request.money < 0) {
    throw new AppError('career.money.invalid', { money: request.money });
  }

  return { ...request, driver };
};

/**
 * The event of a season whose track a career is pictured by, and when it is
 * still to come, its next: the earliest entered event still to run, or else
 * the last one raced.
 * @param season The season
 * @param clock The ISO date the career's clock stands at
 * @returns The next event, and the track to picture, either of them null
 */
const pictured = (
  season: CareerSeason | null,
  clock: string,
): { next: CareerSummaryEvent | null; track: CareerSummary['track'] } => {
  const held = (season?.entries ?? [])
    .filter((entry) => !entry.withdrawn)
    .flatMap((entry) => entry.events.map((event) => ({ entry, event })));
  const round = (one: (typeof held)[number]) => one.entry.championship.rounds.find((r) => r.id === one.event.round);

  const coming = season ? scheduledEvents(season).find((one) => one.event.date >= clock) : undefined;
  const nextRound = coming && round(coming);
  if (coming && nextRound) {
    return {
      next: {
        seriesName: coming.entry.championship.name,
        roundName: nextRound.name,
        track: nextRound.track,
        date: coming.event.date,
        historic: isHistoric(coming.entry),
      },
      track: nextRound.track,
    };
  }

  const last = held
    .filter((one) => one.event.status === 'raced')
    .sort((left, right) => right.event.date.localeCompare(left.event.date))[0];

  return { next: null, track: (last && round(last)?.track) ?? null };
};

/**
 * A career as the start screen and the Careers list show it.
 * @param career The career
 * @returns Its summary
 */
export const summarise = (career: Career): CareerSummary => {
  const season = currentSeason(career);
  const { next, track } = pictured(season, career.date);

  return {
    id: career.id,
    driver: career.driver,
    year: Number(career.date.slice(0, 4)),
    date: career.date,
    playedAt: career.playedAt,
    seasons: career.seasons.length,
    championships: (season?.entries ?? [])
      .filter((entry) => !entry.withdrawn && !isHistoric(entry))
      .flatMap((entry) => {
        const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;

        return ladder ? [{ series: entry.series, name: entry.championship.name, ladder }] : [];
      })
      // Once each, however many of its editions the season entered.
      .filter((one, at, all) => all.findIndex((other) => other.series === one.series) === at),
    next,
    track,
  };
};

/**
 * Every archive a career's launches wrote, by file name - which is what Results
 * lists of its folder, so loading an older save hides the races of the timeline
 * it left without deleting them.
 * @param career The career
 * @returns The archives' file names
 */
export const archivesOf = (career: Career): Set<string> => new Set(career.seasons
  .flatMap((season) => season.entries)
  .flatMap((entry) => entry.events)
  .flatMap((event) => event.sessions)
  // Recorded as a path, and a skipped launch archived nothing.
  .map((launch) => launch.archive.split(/[\\/]/).at(-1) ?? '')
  .filter((name) => name !== ''));

/**
 * Whether a file of a backup belongs in a career's folder: its two files, a
 * save, or an archived result - nothing else, and nothing outside the folder.
 * @param name The file's path inside the backup
 * @returns Whether it is restored
 */
export const keptInBackup = (name: string): boolean => {
  if (name === CAREER_FILE || name === STATE_FILE) return true;

  const [folder, file, ...deeper] = name.split('/');
  if (deeper.length > 0 || !file) return false;
  if (folder === SAVES_DIR) return file.endsWith('.json') && SAVE_ID_PATTERN.test(file.slice(0, -'.json'.length));

  return folder === CAREER_RESULTS_DIR && isArchiveName(file);
};

/**
 * Reads one file of a backup as JSON.
 * @param entry The file, if the backup holds it
 * @returns What it parses to, or undefined when it is missing or not JSON
 */
const parsedEntry = (entry: ZipEntry | undefined): unknown => {
  if (!entry) return undefined;
  try {
    return JSON.parse(entry.data.toString('utf8'));
  } catch {
    return undefined;
  }
};

/**
 * Reads what a backup holds, the way a career's folder is read: its profile,
 * and its state - carried on from its newest save when its state.json does not
 * read, as a career on disk would be.
 * @param entries Every file in the backup
 * @returns What it holds, or null when it holds no career that reads
 */
export const readBackup = (entries: readonly ZipEntry[]): BackupContents | null => {
  const named = new Map(entries.map((entry) => [entry.name, entry]));
  const profile = readProfile(parsedEntry(named.get(CAREER_FILE)));
  if (!profile) return null;

  const files = entries.filter((entry) => keptInBackup(entry.name));
  const saves = files
    .filter((entry) => entry.name.startsWith(`${SAVES_DIR}/`))
    .map((entry) => readSaveFile(parsedEntry(entry), path.posix.basename(entry.name, '.json'), readState))
    .filter((save) => save !== null)
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));
  const state = readState(parsedEntry(named.get(STATE_FILE))) ?? saves[0]?.state ?? null;
  if (!state) return null;

  const manifest = parsedEntry(named.get(BACKUP_MANIFEST));

  return {
    profile,
    state,
    backedUpAt: isRecord(manifest) && typeof manifest.backedUpAt === 'string' ? manifest.backedUpAt : null,
    saves: saves.length,
    results: files.filter((entry) => entry.name.startsWith(`${CAREER_RESULTS_DIR}/`)).length,
    files,
  };
};

/**
 * The name a career's backup is offered under: the driver's, the word career
 * and the day its clock stands at.
 * @param career The career
 * @returns The file's name
 */
export const backupName = (career: CareerSummary): string => {
  // Letters of any script are kept, since a file name may hold them; anything
  // else runs together into one hyphen.
  const driver = career.driver.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

  return `${driver ? `${driver}-` : ''}career-${career.date}.zip`;
};
