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
import type { BackupContents, EnteredEvent, OfferDraft } from './types.ts';
import {
  feeOf, payOut, post, sponsorLine,
} from '../../core/career-money/index.ts';
import { chainOf, startingGrid } from '../../core/event/index.ts';
import { historicRung } from '../../core/historic-draw/index.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, clashes, seasonCalendar } from '../../core/season-calendar/index.ts';
import { seatsForSale } from '../../core/seat-offers/index.ts';
import { seedFrom } from '../../core/seeded-random/index.ts';
import {
  climateOf, formatOf, hemisphereOf, raceWeekdayOf, runRaceId,
} from '../../core/series/index.ts';
import {
  drawRenewal, drawSponsorOffer, OFFER_DAYS, sponsorChance, sponsorDrawn,
} from '../../core/sponsor-offers/index.ts';
import type { RewardCar } from '../../core/sponsor-offers/index.ts';
import { drawRound } from '../../core/weather-forecast/index.ts';
import {
  DAYS_PER_WEEK, DEFAULT_SEASON_LENGTH, MAX_START_YEAR, MIN_START_YEAR, MINUTES_PER_HOUR, SEASON_WEEKS,
} from '../../shared/constants/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  CalendarEntry,
  CalendarInvitation,
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
  Contract,
  ContractTerms,
  Discipline,
  EventPlan,
  EventSession,
  EventState,
  EventStrength,
  HistoricDraw,
  HistoricInvitation,
  InvitationState,
  KeepStanding,
  KeptOutcome,
  LaunchRecord,
  Mail,
  MailAnswer,
  NewCareerRequest,
  NewChampionshipRequest,
  OfferPick,
  RoundForecast,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeatOffer,
  SeriesAvailability,
  SeriesListing,
  SeriesSession,
  SkippedRound,
  SkipReason,
  SponsorDeal,
  SponsorEnd,
  SponsorTerms,
} from '../../shared/types/index.ts';
import { isEligible, openLevels } from '../../shared/utils/career-eligibility/index.ts';
import { readCareerSettings } from '../../shared/utils/career-settings/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';
import {
  noticeId, offerDeadline, offerId, roundFine,
} from '../../shared/utils/contracts/index.ts';
import { editionEntry, editionOver, editionsOf } from '../../shared/utils/editions/index.ts';
import { entryFeeOf } from '../../shared/utils/entry-fees/index.ts';
import { ownedCar, racingIn, withCarIn } from '../../shared/utils/garage/index.ts';
import { isHistoric, isInvited } from '../../shared/utils/historic/index.ts';
import { invitationChance, invitationId, mailStatus } from '../../shared/utils/inbox/index.ts';
import { isNationCode } from '../../shared/utils/nations/index.ts';
import { prizeSpeed, prizeTable, scaledPrize } from '../../shared/utils/prizes/index.ts';
import { clockOf } from '../../shared/utils/road-temperature/index.ts';
import {
  eligibleCarsIn, roundAvailabilityIn, roundRaceableIn, seatRaceableIn,
} from '../../shared/utils/round-availability/index.ts';
import {
  climbNewsId, dealPaid, dealRung, dealScale, dealUntil, entryDiscipline, formOf, goalNewsId, goalSettled,
  goalStanding, invitationLift, liveDeals, partnerSlots, perkOf, rewardWorth, rungFee, signingRepay, slotFree,
  sponsorFigure, sponsorMailId, sponsorNewsId, sponsorRenewalId,
} from '../../shared/utils/sponsors/index.ts';
import { standaloneStanding } from '../../shared/utils/standalone/index.ts';
import { playerPlace, playerStanding } from '../../shared/utils/standings/index.ts';
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
  kind: career.kind,
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
  ledger: career.ledger,
  garage: career.garage,
  rating: career.rating,
  globalRating: career.globalRating,
  level: career.level,
  ratingLog: career.ratingLog,
  seasons: career.seasons,
  inbox: career.inbox,
  sponsors: career.sponsors,
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
  // settings are everywhere, and so is its kind: a career made before there
  // were standalone championships says none.
  return readable ? profileOf({
    ...profile,
    kind: profile.kind === 'championship' ? 'championship' : 'career',
    settings: readCareerSettings(profile.settings),
  } as Career) : null;
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
    && Array.isArray(state.ledger)
    && Array.isArray(state.garage)
    && typeof state.rating === 'object' && state.rating !== null
    && typeof state.globalRating === 'number'
    && Array.isArray(state.ratingLog)
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
        // A historic event is entered from the season's draw of it, which an
        // entry from before seasons kept their draws has none of.
        && (entry.historic !== true || (season.historicEvents ?? []).some((draw) => draw?.series === entry.series))
        && typeof entry.championship === 'object'
        && entry.championship !== null
        && Array.isArray(entry.championship.eventFormats)
        && Array.isArray(entry.events)
        && (entry.events as readonly Partial<SeasonEvent>[]).every((event) => (
          typeof event?.date === 'string'
          && Array.isArray(event.sessions)
        ))
      ))
    ))
    && Array.isArray(state.inbox)
    && (state.sponsors === undefined || Array.isArray(state.sponsors));

  // A career from before sponsors holds none, which is what an empty list says.
  return readable ? stateOf({ ...state, sponsors: state.sponsors ?? [] } as Career) : null;
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
 * @param entry The class entered, by its class entry id, whose fee each round
 * charges - the championship's own fee where none is named
 * @returns Its rounds, dated
 */
export const materialiseEvents = (
  series: Championship,
  season: CareerSeason,
  edition: number,
  today: string,
  entry = '',
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

  return dated.map((round) => ({
    round: round.id,
    raceId: runRaceId(series.id, round.id, { season: season.index, edition }),
    date: round.date,
    entryFee: entryFeeOf(series, round.id, entry),
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
 * Whether the install can race a round the career is in, in the player's own
 * car: one that is no longer installed, or that the round does not run, stops
 * it as surely as a missing track.
 * @param availability What the install can race of the season's championship
 * @param held The entry and the round
 * @returns True when it can be launched for want of nothing installed
 */
export const heldRaceable = (availability: SeriesAvailability, held: EnteredEvent): boolean => (
  seatRaceableIn(availability, held.event.round, held.entry.entry, held.entry.car.model)
);

/**
 * One round of a championship as a confirmation lists it.
 * @param championship The championship, as the career holds it
 * @param entry The class the career is in, or would enter, by its id
 * @param edition Which of the season's editions
 * @param event The round, dated
 * @param reason What moving on does to it
 * @param historic Whether it is a historic event rather than a championship's round
 * @param fine What losing it costs under its contract, or null for nothing
 * @returns The round, named and dated
 */
export const skippedRound = (
  championship: Championship,
  entry: string,
  edition: number,
  event: Pick<SeasonEvent, 'round' | 'date'>,
  reason: SkipReason,
  historic = false,
  fine: number | null = null,
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
    fine,
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
  roundFine(held.entry, held.event),
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
          roundFine(other.entry, other.event),
        )];
      }

      return [];
    })
);

/**
 * What skipping a round the install cannot race costs: the round itself, and
 * everything launching it would, less any clash - the clock moves to its day,
 * and an event on that day is still there to be raced.
 * @param season The season it belongs to
 * @param held The entry and the round being skipped
 * @returns The rounds, the skipped one last
 */
export const skipCost = (season: CareerSeason, held: EnteredEvent): SkippedRound[] => [
  ...launchSkips(season, held, true),
  skippedRound(
    held.entry.championship,
    held.entry.entry,
    held.entry.edition,
    held.event,
    'unraceable',
    isHistoric(held.entry),
  ),
];

/**
 * What a refusal calls a lost round: its championship and its name.
 * @param round The round
 * @returns The name
 */
export const lostName = (round: SkippedRound): string => `${round.seriesName} - ${round.roundName}`;

/**
 * A season with some of its rounds marked as non-starts - and one lost because
 * the install could not race it marked so, which no contract fines.
 * @param season The season
 * @param rounds The rounds to mark, of which only the scheduled are touched
 * @returns The season
 */
export const markMissed = (season: CareerSeason, rounds: readonly SkippedRound[]): CareerSeason => {
  const key = (series: string, edition: number, round: string): string => `${series}\u0000${edition}\u0000${round}`;
  const marked = new Map(rounds.map((one) => [key(one.series, one.edition, one.round), one.reason]));

  return {
    ...season,
    entries: season.entries.map((entry) => (entry.withdrawn ? entry : {
      ...entry,
      events: entry.events.map((event) => {
        const reason = marked.get(key(entry.series, entry.edition, event.round));
        if (event.status !== 'scheduled' || reason === undefined) return event;

        return { ...event, status: 'missed' as const, ...(reason === 'unraceable' ? { unraceable: true as const } : {}) };
      }),
    })),
  };
};

/**
 * A career with its current season brought to the season's last day.
 *
 * Every round of the career's still to run in it becomes a non-start - the
 * player has been shown and confirmed what moving past the year costs - and the
 * clock stands on 31 December, so simulating the missed rounds reaches every
 * one of them - after which each edition's final standing is paid like any
 * other edition's that has run its course. The ladder moving lands here too,
 * once Phase 8 brings it.
 * @param career The career
 * @param season The season to close
 * @param rounds Its rounds still to run, as moving past the year loses them -
 * those the install cannot race marked so
 * @returns The career, its clock on the season's last day
 */
export const closeSeason = (
  career: Career,
  season: CareerSeason,
  rounds: readonly SkippedRound[] = advanceSkips(season, addDays(season.endDate, 1)),
): Career => {
  const dated = { ...career, date: season.endDate };
  const marked = markMissed(season, rounds);

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
 * What winning a race of a class pays, as the career would be paid it.
 * @param career The career reading it
 * @param championship The championship
 * @param entry The class entry's id
 * @returns The prize, or null when the championship says nothing
 */
export const winnerPrize = (career: Career, championship: Championship, entry: string): number | null => {
  const [winner] = prizeTable(championship, entry, 'positions');

  return winner === undefined ? null : scaledPrize(winner, prizeSpeed(career));
};

/**
 * The historic events a season drew.
 * @param season The season
 * @returns Them, earliest first - none for a season that drew none
 */
export const historicDraws = (season: CareerSeason): readonly HistoricDraw[] => season.historicEvents ?? [];

/**
 * One historic event a season drew, by its id.
 * @param season The season
 * @param series The historic event's id
 * @returns The draw, or null when the season drew no such event
 */
export const drawOf = (season: CareerSeason, series: string): HistoricDraw | null => (
  historicDraws(season).find((one) => one.series === series) ?? null
);

/**
 * What entering a historic event at the player's own cost charges in one of
 * its classes.
 * @param event The historic event
 * @param entry The class, by its class entry id
 * @returns The fee, or null for nothing
 */
export const historicFee = (event: Championship, entry: string): number | null => (
  entryFeeOf(event, event.rounds[0]?.id ?? '', entry) || null
);

/**
 * A historic event the season drew, as the event its one round is - dated,
 * charging its fee, and passed by once its day is behind the clock.
 * @param draw The historic event
 * @param today The ISO date the career's clock stands at
 * @param entry The class it is entered in, or shown through, by its class
 * entry id - whose fee it charges
 * @returns The event, run by nobody yet
 */
export const drawnEvent = (draw: HistoricDraw, today: string, entry: string): SeasonEvent => {
  const fee = historicFee(draw.championship, entry);

  return {
    round: draw.round,
    raceId: draw.raceId,
    date: draw.date,
    ...(fee === null ? {} : { entryFee: fee }),
    status: draw.date < today ? 'missed' : 'scheduled',
    sessions: [],
  };
};

/**
 * The mail inviting the player to a historic event, once one came.
 * @param career The career
 * @param draw The historic event
 * @returns The mail, or null
 */
export const invitationMail = (career: Career, draw: Pick<HistoricDraw, 'raceId'>): Mail | null => (
  career.inbox.find((one) => one.id === invitationId(draw.raceId)) ?? null
);

/**
 * A career with one of its mail answered, which opens it too.
 * @param career The career
 * @param mail The mail
 * @param answer The answer
 * @param offer On a seat offer accepted, which of its offers was signed
 * @returns The career, answered on the day its clock stands at
 */
export const withReply = (career: Career, mail: Mail, answer: MailAnswer, offer?: OfferPick): Career => ({
  ...career,
  inbox: career.inbox.map((one) => (one.id === mail.id
    ? { ...one, opened: true, reply: { answer, on: career.date, ...(offer ? { offer } : {}) } }
    : one)),
});

/**
 * An edition's seat offers, as the one mail they arrive in.
 * @param season The season it is for
 * @param championship The championship, as the library holds it
 * @param edition Which of the season's editions
 * @param drafts Every class's offers, in the order the mail lists them - which
 * must not be empty
 * @param today The ISO date it arrives on
 * @returns The mail
 */
export const offerMail = (
  season: CareerSeason,
  championship: Championship,
  edition: number,
  drafts: readonly OfferDraft[],
  today: string,
): Mail => {
  const offers = drafts.map(({ terms, events, rent }): SeatOffer => {
    // The class the terms name is always one of the championship's.
    const entry = championship.entries.find((one) => one.id === terms.entry) ?? championship.entries[0];

    return {
      ...terms,
      series: championship.id,
      seriesName: championship.name,
      season: season.index,
      edition,
      opener: events[0]?.date ?? today,
      rounds: events.length,
      editions: editionsOf(championship),
      entryName: entry.name,
      ladder: entry.ladder,
      fees: events.reduce((sum, event) => sum + (event.entryFee ?? 0), 0),
      rent,
    };
  });
  const opener = offers.map((offer) => offer.opener).sort()[0] ?? today;

  return {
    id: offerId(championship.id, season.index, edition),
    kind: 'offer',
    season: season.index,
    arrived: today,
    opened: false,
    deadline: offerDeadline(today, opener),
    offers,
  };
};

/**
 * The contract accepting an offer signs: the offer's terms, and where it came
 * from and when.
 * @param mail The offer
 * @param terms What the team offers
 * @param signed The ISO date it is signed on
 * @returns The contract
 */
export const signedContract = (mail: Mail, terms: ContractTerms, signed: string): Contract => ({
  team: terms.team,
  teamName: terms.teamName,
  budget: terms.budget,
  ...(terms.nation === undefined ? {} : { nation: terms.nation }),
  entry: terms.entry,
  seat: terms.seat,
  car: terms.car,
  pay: terms.pay,
  amount: terms.amount,
  feeCover: terms.feeCover,
  prizeShare: terms.prizeShare,
  ...(terms.bonus === undefined ? {} : { bonus: terms.bonus }),
  ...(terms.lifeline ? { lifeline: true as const } : {}),
  ...(terms.keep === undefined ? {} : { keep: terms.keep }),
  ...(terms.renews === undefined ? {} : { renews: terms.renews }),
  ...(terms.bought ? { bought: true as const } : {}),
  ...(terms.pricedRounds === undefined ? {} : { pricedRounds: terms.pricedRounds }),
  offer: mail.id,
  signed,
});

/**
 * The contract a season's renewal would renew: the one the player raced the
 * championship's run before it under, still to be decided on - the edition
 * before in the same season, or last season's last.
 * @param career The career
 * @param season The season the run to be offered falls in
 * @param championship The championship, as the library holds it
 * @param edition Which of the season's editions is to be offered
 * @returns The season it ran in and the entry raced under it, or null where
 * the player raced the run before under no contract, terminated it, or its
 * team has decided already
 */
export const previousRun = (
  career: Career,
  season: CareerSeason,
  championship: Championship,
  edition: number,
): { season: CareerSeason; entry: SeasonEntry & { contract: Contract } } | null => {
  const before = edition > 0 ? season : career.seasons.find((one) => one.index === season.index - 1);
  const at = edition > 0 ? edition - 1 : editionsOf(championship) - 1;
  // The contract still in force: one terminated and bought again leaves two
  // entries of the run.
  const entry = before?.entries.find((one) => (
    one.series === championship.id && one.edition === at && !isHistoric(one) && one.contract?.ended === undefined
  ));
  const contract = entry?.contract;
  if (!before || !entry || !contract || contract.kept !== undefined) return null;

  return { season: before, entry: { ...entry, contract } };
};

/**
 * A career with what came of one contract's team deciding written onto it.
 * @param career The career
 * @param season Which season the contract ran in
 * @param series The championship's id
 * @param edition Which of that season's editions
 * @param kept What came of it
 * @returns The career
 */
export const withKept = (
  career: Career,
  season: number,
  series: string,
  edition: number,
  kept: KeptOutcome,
): Career => ({
  ...career,
  seasons: career.seasons.map((one) => (one.index !== season ? one : {
    ...one,
    entries: one.entries.map((entry) => (
      entry.series === series && entry.edition === edition && entry.contract?.ended === undefined && !isHistoric(entry)
        && entry.contract
        ? { ...entry, contract: { ...entry.contract, kept } }
        : entry
    )),
  })),
});

/**
 * A team's news that it is not keeping the player on, as the mail it arrives
 * in.
 * @param season The season the contract ran in
 * @param entry The entry raced under it, which must hold one with a place to
 * keep
 * @param standing Where the player stood when the team decided
 * @param today The ISO date it arrives on
 * @param arrivesIn Which season it arrives in, counting from zero
 * @returns The mail
 */
export const noticeMail = (
  season: CareerSeason,
  entry: SeasonEntry & { contract: Contract },
  standing: KeepStanding,
  today: string,
  arrivesIn: number,
): Mail => {
  const { contract } = entry;
  const classEntry = entry.championship.entries.find((one) => one.id === entry.entry);

  return {
    id: noticeId(entry.series, season.index, entry.edition),
    kind: 'notice',
    season: arrivesIn,
    arrived: today,
    opened: false,
    notice: {
      series: entry.series,
      seriesName: entry.championship.name,
      season: season.index,
      edition: entry.edition,
      editions: editionsOf(entry.championship),
      team: contract.team,
      teamName: contract.teamName,
      ...(contract.nation === undefined ? {} : { nation: contract.nation }),
      entryName: classEntry?.name ?? entry.entry,
      keep: contract.keep ?? standing.size,
      standing,
    },
  };
};

/**
 * The seats a class's privateers sell for one edition, priced on the rounds
 * still to race from the career's clock.
 * @param career The career
 * @param season The season the edition falls in
 * @param championship The championship
 * @param availability What the install can race of it
 * @param entry The class
 * @param edition Which of the season's editions
 * @returns The seats, as the contracts they would sign, the cheapest first
 */
export const saleSeats = (
  career: Career,
  season: CareerSeason,
  championship: Championship,
  availability: SeriesAvailability,
  entry: ClassEntry,
  edition: number,
): ContractTerms[] => {
  const events = materialiseEvents(championship, season, edition, career.date, entry.id);
  const left = events.filter((event) => event.status !== 'missed');
  if (left.length === 0) return [];

  return seatsForSale({
    championship,
    entry,
    salt: seasonSalt(career, season.index, edition),
    cars: eligibleCarsIn(availability, left[0].round, entry.id),
    fees: events.map((event) => event.entryFee ?? 0),
    winnerPrize: prizeTable(championship, entry.id, 'positions')[0] ?? 0,
  }, left.length);
};

/**
 * A career with every seat offer for one edition still to be answered turned
 * down - which entering it, on an offer or on the player's own, does.
 * @param career The career
 * @param season The season the edition falls in
 * @param series The championship's id
 * @param edition Which of the season's editions
 * @returns The career, the same one when there was nothing to decline
 */
export const declineOffers = (career: Career, season: CareerSeason, series: string, edition: number): Career => {
  const id = offerId(series, season.index, edition);
  const open = career.inbox.filter((mail) => mail.id === id && mailStatus(mail, career.date) === 'awaiting');

  return open.reduce((answered, mail) => withReply(answered, mail, 'declined'), career);
};

/**
 * Whether the player has finished an edition at a rung or above in a
 * discipline, which a works team asks of the drivers it calls.
 * @param career The career
 * @param discipline The discipline
 * @param tier The rung, 1 being the top
 * @returns True once one has run its course
 */
export const experiencedAt = (career: Career, discipline: Discipline, tier: number): boolean => (
  career.seasons.some((season) => season.entries.some((entry) => {
    if (isHistoric(entry) || entry.withdrawn || !editionOver(entry, career.date)) return false;
    const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;

    return ladder?.discipline === discipline && ladder.tier <= tier;
  }))
);

/**
 * Where a historic event's invitation stands for the player.
 * @param career The career
 * @param season The season it was drawn in
 * @param draw The historic event
 * @returns Its state
 */
export const invitationState = (career: Career, season: CareerSeason, draw: HistoricDraw): InvitationState => {
  const entry = enteredEntry(season, draw.series, 0);
  if (entry) return isInvited(entry) ? 'accepted' : 'entered';

  const mail = invitationMail(career, draw);
  const status = mail && mailStatus(mail, career.date);
  if (status) return status;
  if (draw.invitation?.outcome === 'entered') return 'closed';

  return draw.invitation ? 'uninvited' : 'pending';
};

/**
 * The installed cars each class of a historic event may race.
 * @param draw The historic event
 * @param availability What the install can race of it
 * @returns The cars, by class entry id
 */
export const drawnCars = (
  draw: Pick<HistoricDraw, 'championship' | 'round'>,
  availability: SeriesAvailability,
): Map<string, readonly string[]> => new Map(draw.championship.entries.map((entry) => [
  entry.id, eligibleCarsIn(availability, draw.round, entry.id),
]));

/**
 * The chance of a historic event's invitation: the one it was drawn on once
 * they have gone out, and otherwise the one the player's rungs give now.
 * @param career The career
 * @param draw The historic event
 * @param availability What the install can race of it
 * @returns The chance and the rung behind it, each null where there is none
 */
const chanceOf = (
  career: Career,
  draw: HistoricDraw,
  availability: SeriesAvailability,
): Pick<HistoricInvitation, 'chance' | 'discipline' | 'rung'> => {
  if (draw.invitation) {
    return {
      chance: draw.invitation.chance ?? null,
      discipline: draw.invitation.discipline ?? null,
      rung: draw.invitation.rung ?? null,
    };
  }
  const rung = historicRung(draw.championship, drawnCars(draw, availability), career.level);

  return rung
    ? {
      chance: invitationChance(rung.rung, invitationLift(career, rung.discipline)),
      discipline: rung.discipline,
      rung: rung.rung,
    }
    : { chance: null, discipline: null, rung: null };
};

/**
 * A historic event's invitation, as its page shows it.
 * @param career The career
 * @param season The season it was drawn in
 * @param draw The historic event
 * @param availability What the install can race of it
 * @param held The player's entry into it, when they are in it
 * @returns The invitation
 */
export const historicInvitation = (
  career: Career,
  season: CareerSeason,
  draw: HistoricDraw,
  availability: SeriesAvailability,
  held: SeasonEntry | null,
): HistoricInvitation => {
  const mail = invitationMail(career, draw);
  const event = held?.championship ?? draw.championship;
  // The seat an invitation offers - none once the player paid their own way
  // in, which a declined invitation's seat is not.
  const offer = held && !isInvited(held) ? null : mail?.invitation ?? null;
  const entry = event.entries.find((one) => one.id === offer?.entry);
  const seat = entry?.seats.find((one) => one.id === offer?.seat);

  return {
    state: invitationState(career, season, draw),
    invitations: draw.invitations,
    ...chanceOf(career, draw, availability),
    team: event.teams?.find((one) => one.id === seat?.team)?.name ?? null,
    car: offer?.car.model ?? null,
    mail: mail?.id ?? null,
    offer: offer && entry ? {
      entry: entry.id,
      entryName: entry.name,
      seat: offer.seat,
      car: offer.car,
    } : null,
    answered: mail?.reply?.on ?? null,
    // The class it is shown through: the one entered or offered, else the first.
    fee: historicFee(event, offer?.entry ?? held?.entry ?? event.entries[0]?.id ?? ''),
  };
};

/**
 * A historic event's invitation, as the calendar shows it.
 * @param career The career
 * @param season The season it was drawn in
 * @param draw The historic event
 * @param availability What the install can race of it
 * @param held The player's entry into it, when they are in it
 * @returns The invitation
 */
export const calendarInvitation = (
  career: Career,
  season: CareerSeason,
  draw: HistoricDraw,
  availability: SeriesAvailability,
  held: SeasonEntry | null,
): CalendarInvitation => {
  const {
    state, invitations, chance, team, car,
  } = historicInvitation(career, season, draw, availability, held);

  return {
    state, invitations, chance, team, car,
  };
};

/**
 * Every invitation still to be answered whose event a move would pass by,
 * as a confirmation lists it - it lapses, unanswered.
 * @param career The career
 * @param season The season being moved through
 * @param to The ISO date the clock would move to, or the day of the event
 * being launched
 * @param sameDay Whether an event on that day itself is lost too, as one on
 * the day of an event launched is while two events on one day clash
 * @param except The race id of an event the move answers rather than passes -
 * an invitation accepted by launching it
 * @returns The events, earliest first
 */
export const unansweredSkips = (
  career: Career,
  season: CareerSeason,
  to: string,
  sameDay = false,
  except?: string,
): SkippedRound[] => historicDraws(season)
  .filter((draw) => (
    draw.raceId !== except
    && (draw.date < to || (sameDay && draw.date === to))
    && invitationState(career, season, draw) === 'awaiting'
  ))
  .map((draw) => skippedRound(
    draw.championship,
    invitationMail(career, draw)?.invitation?.entry ?? '',
    0,
    draw,
    'unanswered',
    true,
  ));

/**
 * Two lists of what a move costs, as one, earliest first.
 * @param rounds What it loses of the career's rounds
 * @param lapsed The invitations it leaves to lapse
 * @returns Both, by date
 */
export const withLapsed = (rounds: readonly SkippedRound[], lapsed: readonly SkippedRound[]): SkippedRound[] => (
  lapsed.length === 0 ? [...rounds] : [...rounds, ...lapsed].sort((left, right) => left.date.localeCompare(right.date))
);

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
 * @param invitation Where a historic event's invitation stands, which says the
 * row is one - absent for a round of a championship
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
  invitation?: CalendarInvitation,
): CalendarEntry => {
  // A round a season's copy no longer matches keeps its id as its name rather
  // than vanishing off the calendar, which would lose a round that may already
  // have been raced.
  const at = series.rounds.findIndex((one) => one.id === event.round);
  const round = series.rounds[at];

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
    prize: winnerPrize(career, series, entry.id),
    // A standalone championship has no money to pay one in. An invitation's
    // event carries no fee, since the team covers it.
    entryFee: career.kind !== 'career' ? undefined : event.entryFee,
    multiClass: series.entries.length > 1,
    date: event.date,
    status: event.status,
    enrolled,
    // A historic event is open to anyone, whatever their level.
    eligible: invitation !== undefined || isEligible(entry.ladder, openLevels(career.level)),
    raceable: roundRaceableIn(availability, event.round),
    clash: false,
    historic: invitation !== undefined,
    ...(invitation ? { invitation } : {}),
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
 * @param drawn What the install can race of each historic event the season
 * drew
 * @param allowSameDay Whether settings allow two events on one day, which is
 * when nothing clashes
 * @returns The merged, dated calendar
 */
export const composeCalendar = (
  career: Career,
  season: CareerSeason,
  listings: readonly SeriesListing[],
  entered: ReadonlyMap<SeasonEntry, SeriesAvailability>,
  drawn: ReadonlyMap<HistoricDraw, SeriesAvailability>,
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
    const draw = isHistoric(held) ? drawOf(season, held.series) : null;
    const invitation = draw ? calendarInvitation(career, season, draw, availability, held) : undefined;

    // What the player pays, which a contract's team covers some or all of.
    return held.events.map((event) => calendarEntry(
      held.championship, availability, entry, held.edition, { ...event, entryFee: feeOf(held, event) ?? undefined },
      career, !held.withdrawn, invitation,
    ));
  });

  // Every historic event drawn and not entered is on the calendar for anyone
  // to enter, shown through the class an invitation offers, or else its first.
  const open = historicDraws(season)
    .filter((draw) => !season.entries.some((one) => one.series === draw.series))
    .flatMap((draw): CalendarEntry[] => {
      const availability = drawn.get(draw);
      const mail = invitationMail(career, draw);
      const entry = draw.championship.entries.find((one) => one.id === mail?.invitation?.entry)
        ?? draw.championship.entries[0];
      if (!availability || !entry) return [];

      return [calendarEntry(
        draw.championship,
        availability,
        entry,
        0,
        drawnEvent(draw, career.date, entry.id),
        career,
        false,
        calendarInvitation(career, season, draw, availability, null),
      )];
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

      return entries.flatMap((entry) => events.map((event) => calendarEntry(
        listing.series,
        listing.availability,
        entry,
        edition,
        { ...event, entryFee: entryFeeOf(listing.series, event.round, entry.id) },
        career,
        false,
      )));
    },
  ).flat());

  const events = [...own, ...open, ...library];
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
 * Checks the year a career or a standalone championship opens in.
 * @param year The year asked for
 * @returns The year
 * @throws When it is not a whole year within the range a career may start in
 */
export const checkedYear = (year: number): number => {
  if (!Number.isInteger(year) || year < MIN_START_YEAR || year > MAX_START_YEAR) {
    throw new AppError('career.year.invalid', { year, from: MIN_START_YEAR, to: MAX_START_YEAR });
  }

  return year;
};

/**
 * Checks what a new standalone championship is asked to start from, as far as
 * it can be without the library.
 * @param request The request
 * @returns The request, its driver tidied
 * @throws When the driver or the year is not one a career can start with
 */
export const checkedNewChampionship = (request: NewChampionshipRequest): NewChampionshipRequest => ({
  ...request,
  driver: checkedDriver(request.driver),
  year: checkedYear(request.year),
});

/**
 * Checks what a new career is asked to start from.
 * @param request The request
 * @returns The request, its driver tidied
 * @throws When the year, the level or the money is not one a career can start
 * with
 */
export const checkedNewCareer = (request: NewCareerRequest): NewCareerRequest => {
  const driver = checkedDriver(request.driver);
  checkedYear(request.year);
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
    kind: career.kind,
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
    standing: standaloneStanding(career),
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
  /**
   * A name as part of a file name: letters of any script kept, since a file
   * name may hold them, and anything else run together into one hyphen.
   * @param text The name
   * @returns It, lower-cased and hyphenated
   */
  const slug = (text: string): string => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  // A standalone championship is known by its championship and year instead.
  const championship = career.kind === 'championship' ? career.championships[0] : undefined;
  if (championship) return `${slug(championship.name) || 'championship'}-${career.year}.zip`;
  const driver = slug(career.driver.name);

  return `${driver ? `${driver}-` : ''}career-${career.date}.zip`;
};

/**
 * Whether the player drove a round themselves: any race of it in their own
 * seat, rather than simulated or raced by a stand-in.
 * @param entry The season's entry
 * @param event The round
 * @returns True when they did
 */
const droveRound = (entry: SeasonEntry, event: SeasonEvent): boolean => (
  (event.score?.races ?? []).some((race) => playerPlace(entry, race) !== undefined)
);

/**
 * The disciplines a career has driven races in, the most driven first.
 * @param career The career
 * @returns The disciplines
 */
const racedDisciplines = (career: Career): Discipline[] => {
  const counts = new Map<Discipline, number>();
  for (const season of career.seasons) {
    for (const entry of season.entries) {
      const discipline = entryDiscipline(entry);
      const driven = entry.events.filter((event) => droveRound(entry, event)).length;
      if (discipline && driven > 0) counts.set(discipline, (counts.get(discipline) ?? 0) + driven);
    }
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1]).map(([discipline]) => discipline);
};

/**
 * What one round brought that makes a sponsor likelier to write: a class win
 * of the player's, a class title it settled, or a rung it opened.
 * @param career The career
 * @param entry The season's entry
 * @param event The round
 * @returns What it brought
 */
const standoutOf = (
  career: Career,
  entry: SeasonEntry,
  event: SeasonEvent,
): { win: boolean; title: boolean; rung: boolean } => {
  const win = (event.score?.races ?? []).some((race) => playerPlace(entry, race)?.classPosition === 1);
  const last = entry.events.every((one) => one.date <= event.date);
  const title = last && !isHistoric(entry) && playerStanding(entry)?.position === 1;
  const rung = career.ratingLog.some((line) => line.kind === 'promotion' && line.date === event.date);

  return { win, title, rung };
};

/**
 * Every car a class of the library may field, off its championship's opener.
 * @param listing The championship
 * @param entry The class
 * @returns The cars, by folder ID
 */
export const classCars = (listing: SeriesListing, entry: Pick<ClassEntry, 'id'>): readonly string[] => (
  eligibleCarsIn(listing.availability, listing.series.rounds[0]?.id ?? '', entry.id)
);

/**
 * Every round the player drove whose sponsor draw has not been made yet.
 * @param season The season
 * @returns The rounds, oldest first
 */
const undrawnRounds = (season: CareerSeason): { entry: SeasonEntry; event: SeasonEvent }[] => {
  const drawn = new Set(season.sponsorDraws ?? []);

  return season.entries
    .flatMap((entry) => entry.events
      .filter((event) => event.status === 'raced' && !drawn.has(event.raceId) && droveRound(entry, event))
      .map((event) => ({ entry, event })))
    .sort((left, right) => left.event.date.localeCompare(right.event.date));
};

/**
 * Whether anything about to happen may name a car reward: a sponsor's draw
 * still to make, or a deal's year run out.
 * @param career The career
 * @returns True when the cars on offer are worth looking up
 */
export const wantsRewards = (career: Career): boolean => {
  const season = currentSeason(career);

  return career.kind === 'career' && !!season && (
    undrawnRounds(season).length > 0 || liveDeals(career).some((deal) => deal.until <= career.date)
  );
};

/**
 * Sends a sponsor's offer for every round the player drove whose draw has not
 * been made yet, once each - at the chance their form sets and a standout
 * result raises. A round too long ago for its offer still to be open draws
 * nothing.
 * @param career The career
 * @param rewards The cars a car reward may name
 * @returns The career, every offer due sent - the same one when none was
 */
export const sendSponsorOffers = (career: Career, rewards: readonly RewardCar[] = []): Career => {
  const season = currentSeason(career);
  if (career.kind !== 'career' || !season) return career;

  const drawn = new Set(season.sponsorDraws ?? []);
  const rounds = undrawnRounds(season);
  if (rounds.length === 0) return career;

  const form = formOf(career);
  const live = liveDeals(career);
  const waiting = career.inbox
    .filter((mail) => mailStatus(mail, career.date) === 'awaiting')
    .flatMap((mail) => (mail.sponsor ? [mail.sponsor] : []));
  const raced = racedDisciplines(career);
  const championships = season.entries
    .filter((entry) => !isHistoric(entry) && !entry.withdrawn && !entry.contract)
    .flatMap((entry) => {
      const discipline = entryDiscipline(entry);

      return discipline ? [{ series: entry.series, name: entry.championship.name, discipline }] : [];
    });
  const sent: Mail[] = [];

  for (const { entry, event } of rounds) {
    const deadline = addDays(event.date, OFFER_DAYS);
    if (!form || deadline < career.date) continue;
    const offered: SponsorTerms[] = [
      ...live, ...waiting, ...sent.flatMap((mail) => (mail.sponsor ? [mail.sponsor] : [])),
    ];
    const salt = `${career.id}\u0000${event.raceId}`;
    const free = {
      main: !offered.some((one) => one.slot === 'main'),
      partner: offered.filter((one) => one.slot === 'partner').length < partnerSlots(career.level),
    };
    const pick = sponsorDrawn(salt, sponsorChance(form, standoutOf(career, entry, event)), form, free);
    // Replacing a deal, the one whose year runs out first.
    const replaces = pick?.replace
      ? live.filter((one) => one.slot === pick.slot).sort((left, right) => left.until.localeCompare(right.until))[0]
      : undefined;
    const offer = pick && (!pick.replace || replaces) ? drawSponsorOffer({
      salt,
      slot: pick.slot,
      level: career.level,
      rating: career.rating,
      globalRating: career.globalRating,
      raced,
      held: offered.map((one) => one.sponsor.trade),
      names: [...career.sponsors, ...offered].map((one) => one.sponsor.name),
      championships,
      prizeSpeed: career.settings.prizeSpeed,
      rewards,
    }) : null;
    if (offer) {
      sent.push({
        id: sponsorMailId(event.raceId),
        kind: 'sponsor',
        season: season.index,
        arrived: event.date,
        opened: false,
        deadline,
        sponsor: { ...offer, ...(replaces ? { replaces: replaces.id } : {}) },
      });
    }
  }

  const known = new Set(career.inbox.map((mail) => mail.id));

  return {
    ...withSeason(career, { ...season, sponsorDraws: [...drawn, ...rounds.map((one) => one.event.raceId)] }),
    inbox: [...career.inbox, ...sent.filter((mail) => !known.has(mail.id))],
  };
};

/**
 * Every deal whose goal has just been settled as met.
 * @param career The career
 * @returns The deals, not yet marked
 */
export const goalsDue = (career: Career): SponsorDeal[] => (
  career.kind === 'career' ? liveDeals(career).filter((deal) => !deal.goalMet && goalSettled(career, deal)) : []
);

/**
 * Marks a deal's goal met: the day its bonus falls due and its car comes - into
 * the garage in its first livery, racing owned wherever it is rented, or paid
 * as what it would sell for when it cannot come. News goes out for whatever it
 * brought.
 * @param career The career
 * @param deal The deal
 * @param skin The car's first livery, or null when the install has no such car
 * @returns The career
 */
export const withGoalMet = (career: Career, deal: SponsorDeal, skin: string | null | undefined): Career => {
  const on = deal.until < career.date ? deal.until : career.date;
  const seasonNow = currentSeason(career);
  const car = perkOf(deal, 'carReward')?.car;
  const bonus = perkOf(deal, 'goalBonus')?.amount;
  const worth = car ? rewardWorth(deal, car.price) : 0;
  const comes = car && skin !== null && !ownedCar(career, car.model);
  const marked = {
    ...career,
    sponsors: career.sponsors.map((one) => (one.id === deal.id ? { ...one, goalMet: on } : one)),
  };

  let next: Career = marked;
  if (car && comes) {
    const painted = skin === undefined ? {} : { skin };
    next = {
      ...next,
      garage: [...next.garage, {
        model: car.model, ...painted, paid: worth, bought: on, reward: deal.sponsor.name,
      }],
    };
    if (seasonNow) {
      next = withSeason(next, withCarIn(seasonNow, racingIn(seasonNow, car.model, 'rented'), {
        model: car.model, ...painted, source: 'owned',
      }));
    }
  } else if (car) {
    next = post(next, [sponsorLine(deal, 'carReward', `sponsor:${deal.id}:reward`, worth, {
      date: on, season: seasonNow?.index ?? 0,
    })]);
  }
  if (!car && !bonus) return next;

  return {
    ...next,
    inbox: [...next.inbox, {
      id: goalNewsId(deal.id),
      kind: 'sponsorNews',
      season: seasonNow?.index ?? 0,
      arrived: on,
      opened: false,
      sponsorNews: {
        kind: 'goalMet',
        deal: deal.id,
        sponsor: deal.sponsor,
        slot: deal.slot,
        goal: deal.goal,
        reached: goalStanding(career, deal).reached,
        paid: 0,
        ...(bonus ? { bonus: sponsorFigure(bonus, dealScale(deal, career.level)) } : {}),
        ...(car ? { car } : {}),
        ...(car && !comes ? { carPaid: worth } : {}),
      },
    }],
  };
};

/**
 * The rung a deal paid on before it last climbed: the one its news last named,
 * or the one it was signed on.
 * @param career The career
 * @param deal The deal
 * @returns The rung
 */
const rungBeforeClimb = (career: Career, deal: SponsorDeal): number => {
  const climbs = career.inbox.flatMap(({ sponsorNews: news }) => (
    news?.kind === 'climbed' && news.deal === deal.id && news.rung !== undefined ? [news.rung] : []
  ));

  return Math.min(deal.rung, ...climbs);
};

/**
 * Sends the news of every deal that has climbed to a rung it had not reached:
 * once a rung, each figure still to pay saying what it paid before.
 * @param career The career
 * @returns The career, every word due sent - the same one when none was
 */
export const sendClimbNews = (career: Career): Career => {
  if (career.kind !== 'career') return career;
  const known = new Set(career.inbox.map((mail) => mail.id));
  const news = liveDeals(career).flatMap((deal): Mail[] => {
    const rung = dealRung(deal, career.level);
    if (!perkOf(deal, 'climbs') || rung >= deal.rung || known.has(climbNewsId(deal.id, rung))) return [];
    const scale = dealScale(deal, career.level);
    const before = rungFee(rungBeforeClimb(career, deal)) / rungFee(deal.rung);

    return [{
      id: climbNewsId(deal.id, rung),
      kind: 'sponsorNews',
      season: currentSeason(career)?.index ?? 0,
      arrived: career.date,
      opened: false,
      sponsorNews: {
        kind: 'climbed',
        deal: deal.id,
        sponsor: deal.sponsor,
        slot: deal.slot,
        goal: deal.goal,
        reached: 0,
        paid: 0,
        rung,
        // A signing bonus was paid the day it signed, so it has nothing to rise.
        rises: deal.perks.flatMap((perk) => (perk.amount === undefined || perk.kind === 'signing' ? [] : [{
          kind: perk.kind, amount: sponsorFigure(perk.amount, scale), was: sponsorFigure(perk.amount, before),
        }])),
      },
    }];
  });

  return news.length === 0 ? career : { ...career, inbox: [...career.inbox, ...news] };
};

/**
 * A sponsor's mail asking for another year of a deal whose goal was met.
 * @param career The career
 * @param deal The deal
 * @param rewards The cars a renewal's car reward may name
 * @returns The mail
 */
const renewalMail = (career: Career, deal: SponsorDeal, rewards: readonly RewardCar[]): Mail => ({
  id: sponsorRenewalId(deal.id),
  kind: 'sponsor',
  season: currentSeason(career)?.index ?? 0,
  arrived: deal.until,
  opened: false,
  deadline: addDays(deal.until, OFFER_DAYS),
  sponsor: drawRenewal({
    salt: `${career.id}\u0000${deal.id}`,
    deal,
    level: career.level,
    rating: career.rating,
    globalRating: career.globalRating,
    prizeSpeed: career.settings.prizeSpeed,
    rewards,
  }),
});

/**
 * Ends every deal whose year has run out, on its anniversary. With its goal
 * marked met its sponsor asks for another year; otherwise it sends news, so
 * every goal has to have been marked first.
 * @param career The career
 * @param rewards The cars a renewal's car reward may name
 * @returns The career, paid up and every deal due ended - the same one when
 * none was
 */
export const endSponsorYears = (career: Career, rewards: readonly RewardCar[] = []): Career => {
  const due = liveDeals(career).filter((deal) => deal.until <= career.date);
  if (due.length === 0) return career;

  // Paid up first, so the news says what the deal came to.
  const paid = payOut(career);
  const news: Mail[] = [];
  const ended = new Map(due.map((deal) => {
    if (deal.goalMet) {
      news.push(renewalMail(career, deal, rewards));
    } else {
      const goal = goalStanding(career, deal);
      news.push({
        id: sponsorNewsId(deal.id),
        kind: 'sponsorNews',
        season: currentSeason(career)?.index ?? 0,
        arrived: deal.until,
        opened: false,
        sponsorNews: {
          deal: deal.id,
          sponsor: deal.sponsor,
          slot: deal.slot,
          goal: deal.goal,
          reached: goal.reached,
          paid: dealPaid(paid, deal.id),
        },
      });
    }
    const why: SponsorEnd = deal.goalMet ? 'goalMet' : 'goalMissed';

    return [deal.id, { on: deal.until, why }];
  }));
  const known = new Set(paid.inbox.map((mail) => mail.id));

  return {
    ...paid,
    sponsors: paid.sponsors.map((deal) => {
      const end = ended.get(deal.id);

      return end ? { ...deal, ended: end } : deal;
    }),
    inbox: [...paid.inbox, ...news.filter((mail) => !known.has(mail.id))],
  };
};

/**
 * Ends a deal early, by the player's choice or replaced by another sponsor's,
 * repaying the share of its signing bonus its year has left.
 * @param career The career
 * @param deal The deal
 * @param why Why it ends
 * @returns The career, the deal ended
 */
export const endSponsor = (career: Career, deal: SponsorDeal, why: 'mine' | 'replaced'): Career => {
  const repay = signingRepay(deal, career.date);
  const season = currentSeason(career)?.index ?? 0;
  const repaid = repay > 0
    ? post(career, [sponsorLine(deal, 'signing', `sponsor:${deal.id}:repay`, -repay, { date: career.date, season })])
    : career;

  return {
    ...repaid,
    sponsors: repaid.sponsors.map((one) => (one.id === deal.id ? { ...one, ended: { on: career.date, why } } : one)),
  };
};

/**
 * Signs a sponsor's offer: its deal for a year from today, its signing bonus
 * paid, and any deal it replaces ended. Refused once its slot is taken, or
 * while another sponsor of its trade backs the player.
 * @param career The career
 * @param mail The offer's mail
 * @returns The career, signed
 */
export const signSponsor = (career: Career, mail: Mail): Career => {
  const offer = mail.sponsor;
  const name = offer?.sponsor.name ?? mail.id;
  if (!offer || mailStatus(mail, career.date) !== 'awaiting') throw new AppError('sponsor.closed', { sponsor: name });

  const live = liveDeals(career);
  const replaced = offer.replaces === undefined ? undefined : live.find((deal) => deal.id === offer.replaces);
  const others = live.filter((deal) => deal !== replaced);
  if (others.some((deal) => deal.sponsor.trade === offer.sponsor.trade)) {
    throw new AppError('sponsor.trade', { sponsor: name });
  }
  if (!slotFree({ sponsors: others, level: career.level }, offer.slot)) {
    throw new AppError('sponsor.slotFull', { sponsor: name });
  }

  const ended = replaced ? endSponsor(career, replaced, 'replaced') : career;
  const terms: SponsorTerms = {
    sponsor: offer.sponsor,
    slot: offer.slot,
    covers: offer.covers,
    perks: offer.perks,
    target: offer.target,
    goal: offer.goal,
    rung: offer.rung,
  };
  const deal: SponsorDeal = {
    ...terms,
    id: mail.id,
    signed: career.date,
    until: dealUntil(career.date),
    ...(offer.renews === undefined ? {} : { renews: offer.renews }),
  };
  const signing = perkOf(deal, 'signing')?.amount ?? 0;
  const season = currentSeason(career)?.index ?? 0;
  const signed = post({ ...ended, sponsors: [...ended.sponsors, deal] }, signing > 0
    ? [sponsorLine(deal, 'signing', `sponsor:${deal.id}:signing`, signing, { date: career.date, season })]
    : []);
  // The new signing bonus may pay the old one's repayment.
  if (replaced && signed.money < 0) {
    throw new AppError('sponsor.repay.short', { repay: career.money - ended.money, money: career.money });
  }

  return withReply(signed, mail, 'accepted');
};
