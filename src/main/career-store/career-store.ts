// The career: one clock, the championships it has entered, and what came of
// them. Kept in career.json beside settings.json, written atomically and
// debounced, the way the settings store writes its own.
//
// A championship the career enters is copied into the season whole, and the
// season reads only that copy from then on - so the library's championship is a
// rulebook the career never touches, and an edit to it reaches the next season
// rather than the one being raced.
//
// Phase 6 turns this into named saves, rolling autosaves and several careers at
// once. Nothing here is in its way: a save is a copy of this file, and a second
// career is a second one.

import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { CAREER_FILE, CAREER_VERSION, WRITE_DEBOUNCE_MS } from './constants.ts';
import type {
  CareerStore, EnrolRequest, EnteredEvent, EventRequest, ResultsRequest,
} from './types.ts';
import {
  advanceSkips,
  advanceStop,
  checkEdition,
  closeSeason,
  composeCalendar,
  currentSeason,
  editionAt,
  enteredEntry,
  enteredEvent,
  eventName,
  eventSessions,
  eventStrength,
  inProgressEvent,
  issueForecast,
  issueForecasts,
  launchBlock,
  launchSkips,
  lostName,
  markMissed,
  materialiseEvents,
  openSeason,
  readCareer,
  seasonOf,
  seasonSalt,
  simulatedEvent,
  skippedRound,
  strengthStep,
  withSeason,
} from './utils.ts';
import { planEvent } from '../../core/event/index.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, toDayNumber } from '../../core/season-calendar/index.ts';
import { scoreRound } from '../../core/season-scoring/index.ts';
import { climateOf, formatOf, roundSessions } from '../../core/series/index.ts';
import { offerForecast } from '../../core/weather-forecast/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  Career,
  CareerEventView,
  CareerSeason,
  Championship,
  EventPlan,
  RaceDefinition,
  RaceSetup,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
} from '../../shared/types/index.ts';
import { keptStep, withStrength } from '../../shared/utils/ai-figure/index.ts';
import { isEligible, startingLevels } from '../../shared/utils/career-eligibility/index.ts';
import {
  editionEntry, editionsOf, enteredEdition, seasonYear,
} from '../../shared/utils/editions/index.ts';
import { roundAvailabilityIn, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';
import { buildStandings, entryResults, roundResult } from '../../shared/utils/standings/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import { slotHolds, withLevelsOf } from '../race-store/index.ts';
import type { SeriesStore } from '../series-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';
import { quarantine } from '../settings-store/index.ts';

export type {
  CareerStore, EnrolRequest, EventRequest, ResultsRequest, StrengthRequest,
} from './types.ts';
// Re-exported because a quick race's page lists its sessions the way a
// round's page does.
export { eventSessions } from './utils.ts';

/**
 * The first day of the current year, as an ISO calendar date.
 *
 * Where a new career's first season opens. A season is a year of racing, and
 * starting one on whatever day the app happened to be opened would put most of
 * every calendar behind the player before they had raced anything.
 * @returns The ISO YYYY-MM-DD date of 1 January
 */
const startOfYear = (): string => `${new Date().getUTCFullYear()}-01-01`;

/**
 * The still-scheduled round a race id belongs to, in a season.
 * @param season The season to look in
 * @param raceId The race's id
 * @returns The entry and its event, or null when the race is no round of it
 */
const scheduledHeld = (season: CareerSeason, raceId: string): EnteredEvent | null => {
  for (const entry of season.entries) {
    const event = entry.events.find((one) => one.raceId === raceId && one.status === 'scheduled');
    if (event && !entry.withdrawn) return { entry, event };
  }

  return null;
};

/**
 * Loads the career file and returns a store over it.
 *
 * Takes the series store because a round is lowered through it - it holds the
 * weather offer and the class catalogue a race is drawn over - the race store
 * because that is what runs an event, the content store because the event
 * page plans an event to say what each session is, and settings because they
 * say whether two events on one day clash.
 * @param userDataDir Folder to keep career.json in
 * @param series The championship library
 * @param race The race being set up and run
 * @param content The installed content
 * @param settings The user's settings
 * @returns A store over the career, or over none when no file loaded
 */
export const createCareerStore = async (
  userDataDir: string,
  series: SeriesStore,
  race: RaceStore,
  content: ContentStore,
  settings: SettingsStore,
): Promise<CareerStore> => {
  const file = path.join(userDataDir, CAREER_FILE);
  const tmp = `${file}.tmp`;

  let current: Career | null = null;
  try {
    current = readCareer(JSON.parse(await readFile(file, 'utf8')));
    if (current === null) {
      const moved = await quarantine(file);
      console.warn(`Career file was not one this build reads; ${moved ? `moved to ${moved}` : 'ignoring it'}.`);
    }
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    if (!missing) {
      const moved = await quarantine(file);
      console.warn(`Career file was unreadable; ${moved ? `moved to ${moved}` : 'ignoring it'}.`, error);
    }
  }

  const listeners = new Set<(career: Career) => void>();
  let timer: NodeJS.Timeout | null = null;
  let pending: Promise<void> = Promise.resolve();
  // Commands run one after another, the way the class store runs its edits.
  // Every one of them reads the career, awaits something - the library, the
  // installed content, an archived result - and then rebuilds it from what it
  // read, so two overlapping commands would each write over the other's work:
  // an event's score landing while a championship is being entered would lose
  // one or the other. Queued, each reads the career when its turn comes.
  let queue: Promise<unknown> = Promise.resolve();
  // Holds the one in-flight start, so ensure() never runs twice over.
  let starting: Promise<Career> | null = null;

  /**
   * Runs one command once every command before it has finished.
   * @param command The command, which reads the career as it then stands
   * @returns What the command answers with
   */
  const commit = <T>(command: () => Promise<T>): Promise<T> => {
    const run = queue.then(command);
    queue = run.catch(() => undefined);

    return run;
  };

  /**
   * Writes the career, replacing the file in one step.
   * @returns Resolves once it is written or the failure is logged
   */
  const write = async (): Promise<void> => {
    if (!current) return;

    const snapshot = JSON.stringify(current, null, 2);
    try {
      await writeFile(tmp, snapshot, 'utf8');
      await rename(tmp, file);
    } catch (error) {
      console.error('Could not save the career.', error);
    }
  };

  /**
   * Schedules a write and tells everyone watching.
   * @returns The career as it now stands
   */
  const settle = (): Career => {
    const career = current;
    if (!career) throw new AppError('career.none');

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      pending = write();
    }, WRITE_DEBOUNCE_MS);

    for (const listener of listeners) listener(career);

    return career;
  };

  /**
   * Starts a career, which is what the first thing to want one does.
   *
   * A career needs nothing a form could ask for - the driver's name is already
   * in settings and the season opens at the start of the year - so nothing
   * refuses to draw until a button is pressed. The clock starts where the
   * season does, so the whole of it is still ahead.
   * @returns The career, freshly started
   */
  const start = async (): Promise<Career> => {
    const library = await series.list();
    const startDate = startOfYear();

    current = {
      version: CAREER_VERSION,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      startDate,
      date: startDate,
      level: startingLevels(library.series),
      seasons: [openSeason(0, startDate)],
    };

    return settle();
  };

  /**
   * The career as it stands, started first if it has not been.
   * @returns The career
   */
  const ensure = async (): Promise<Career> => {
    if (current) return current;
    // Latched rather than awaited afresh: reading the calendar starts a career
    // and is deliberately not queued, so two screens asking at once would
    // otherwise each start one and the second would throw the first away.
    starting ??= start();

    return starting;
  };

  /**
   * The season a command works on, started first if there is no career yet.
   * @returns The career and its current season
   * @throws When the career somehow has no season, which nothing can reach
   */
  const seasonNow = async (): Promise<{ career: Career; season: CareerSeason }> => {
    const career = await ensure();
    const season = currentSeason(career);
    if (!season) throw new AppError('career.season.notFound', { season: 0 });

    return { career, season };
  };

  /**
   * One round the career is in, or a refusal saying it is not.
   * @param season The season to look in
   * @param request Which championship and round, and which edition - the one
   * being raced when it names none
   * @returns The entry and its event
   * @throws When the career is not in that championship
   */
  const heldEvent = async (
    season: CareerSeason,
    request: Omit<EventRequest, 'season'>,
  ): Promise<EnteredEvent> => {
    const edition = request.edition ?? enteredEdition(season, request.series);
    const held = edition === null ? null : enteredEvent(season, request.series, request.round, edition);
    if (held) return held;

    const listing = await series.get(request.series);
    throw new AppError('career.event.notEntered', { series: listing?.series.name ?? request.series });
  };

  /**
   * The season and edition a read asks for, its defaults filled in: the current
   * season, and the edition the career is racing, or else the one still to come.
   * @param request Which championship, and the season and edition it names
   * @param request.series The championship's id
   * @param request.season Which season, when it names one
   * @param request.edition Which edition, when it names one
   * @returns The career, the season, the library's championship and the edition
   * @throws When the career has no such season
   */
  const runAsked = async (request: { series: string; season?: number; edition?: number }) => {
    const career = await ensure();
    const season = seasonOf(career, request.season);
    if (!season) throw new AppError('career.season.notFound', { season: request.season ?? 0 });
    const listing = await series.get(request.series);
    const edition = request.edition
      ?? enteredEdition(season, request.series)
      ?? (listing ? editionAt(listing.series, season, career.date) : 0);

    return {
      career, season, listing, edition,
    };
  };

  /**
   * Lowers one of the career's rounds under the id its event carries.
   *
   * The id is the run's rather than the round's: the race store holds one event
   * at a time by it, and the event plan seeds a grid off it - so the page that
   * plans a round and the launch that races it lower it exactly alike.
   * @param championship The season's own copy of the championship
   * @param request What the round is lowered with
   * @param raceId The event's own race id
   * @param step The player's own steps on the AI's strength for the round
   * @returns The race the round runs as
   */
  const lowerEvent = async (
    championship: Championship,
    request: Parameters<SeriesStore['lowerRound']>[1],
    raceId: string,
    step: number,
  ): Promise<RaceDefinition> => ({ ...await series.lowerRound(championship, request, step), id: raceId });

  /**
   * Replaces one season entry, and the season around it, in the career.
   * @param season The season the entry belongs to
   * @param before The entry as it was
   * @param after The entry as it now is
   */
  const replaceEntry = (season: CareerSeason, before: SeasonEntry, after: SeasonEntry): void => {
    if (!current) throw new AppError('career.none');

    const next: CareerSeason = {
      ...season,
      entries: season.entries.map((one) => (one === before ? after : one)),
    };
    current = withSeason(current, next);
  };

  /**
   * An entry with one of its events replaced, and its standings rebuilt from
   * every round it has now scored.
   * @param entry The entry
   * @param event The event as it now is
   * @param at When, as an ISO timestamp
   * @returns The entry
   */
  const withEvent = (entry: SeasonEntry, event: SeasonEvent, at: string): SeasonEntry => {
    const events = entry.events.map((one) => (one.round === event.round ? event : one));
    const scores = events.map((one) => one.score).filter((one) => one !== undefined);

    return {
      ...entry,
      events,
      standings: buildStandings(entry.championship, scores, at),
    };
  };

  /**
   * Simulates every round the clock has passed without the player.
   *
   * A round entered too late, skipped, or given up on by withdrawing is raced
   * by the field all the same, with the player's seat driven by the driver it
   * names. Simulated once its day has come, and stored, so it never
   * changes again: a later edit to the championship or to settings cannot
   * rewrite a round that has been run. Whatever of an event the player did
   * drive before abandoning it stays as it was driven.
   * @param career The career
   * @returns The career, with every such round simulated
   */
  const simulateMissed = async (career: Career): Promise<Career> => {
    const at = new Date().toISOString();
    let next = career;

    for (const season of career.seasons) {
      const entries = await Promise.all(season.entries.map(async (entry) => {
        const salt = seasonSalt(career, season.index, entry.edition);
        const due = entry.events.filter((event) => (
          event.status === 'missed' && !event.simulated && event.date <= career.date
        ));
        let updated = entry;

        for (const event of due) {
          try {
            const simulated = simulateRound({
              series: entry.championship,
              round: event.round,
              salt,
              recordedAt: at,
              field: entry.field,
              player: { entry: entry.entry },
              completed: event.sessions,
              results: await race.launchResults(event.sessions),
            });
            updated = withEvent(updated, {
              ...event, sessions: simulated.sessions, score: simulated.score, simulated: true,
            }, at);
          } catch (error) {
            // Left as a plain non-start, which pays nobody anything - and marked
            // all the same, since the season's copy never changes and would only
            // fail again on every catch-up.
            console.warn(`Could not simulate ${entry.championship.name} - ${event.round}.`, error);
            updated = withEvent(updated, { ...event, simulated: true }, at);
          }
        }

        return updated;
      }));

      if (entries.some((entry, index) => entry !== season.entries[index])) {
        next = withSeason(next, { ...season, entries });
      }
    }

    return next;
  };

  /**
   * Brings the career's missed rounds up to date, after anything that can have
   * passed or given one up.
   */
  const catchUp = async (): Promise<void> => {
    if (current) current = await simulateMissed(current);
  };

  /**
   * Copies an event's progress onto the career after every launch.
   *
   * Every launch rather than only the last, so a practice or qualifying result
   * is on the event the moment it lands, and a race's points reach the
   * standings before the event is over. Idempotent, and that is load-bearing
   * rather than tidy: the race store pushes its whole state on every change, so
   * the same progress arrives here again and again, and is only acted on when it
   * holds more than the career already does.
   * @param setup The race store's state, which carries the plan and the run
   * @returns Resolves once recorded, or immediately when there is nothing new
   */
  const adopt = async (setup: RaceSetup): Promise<void> => {
    const { plan, state } = setup;
    if (!current || !plan || !state) return;
    if (setup.status.phase !== 'idle') return;

    const season = currentSeason(current);
    const held = season && scheduledHeld(season, plan.raceId);
    if (!season || !held) return;
    if (state.completed.length <= held.event.sessions.length) return;

    const at = new Date().toISOString();
    const score = scoreRound(
      held.entry.championship,
      held.event.round,
      plan,
      state,
      await race.launchResults(state.completed),
      at,
    );
    const finished = state.completed.length >= state.launchCount;

    const event: SeasonEvent = {
      ...held.event,
      sessions: [...state.completed],
      score,
      status: finished ? 'raced' : 'scheduled',
    };
    replaceEntry(season, held.entry, withEvent(held.entry, event, at));

    // The clock never runs backwards, so an event raced early leaves it where
    // it was rather than pulling it back to the event's day.
    if (finished && current.date < event.date) {
      current = { ...current, date: event.date };
      // Finishing one event can bring the next inside the forecast lead, and
      // take the clock past the race day of a round given up on.
      const now = currentSeason(current);
      if (now) current = withSeason(current, issueForecasts(current, now, current.date));
      await catchUp();
    }
    settle();
  };

  // A career saved before missed rounds were simulated, or one whose clock was
  // moved while this build was not running, is brought up to date on load.
  if (current) {
    const caught = await simulateMissed(current);
    if (caught !== current) {
      current = caught;
      settle();
    }
  }

  race.onChange((setup) => {
    // Queued with the commands rather than run alongside them: adopting reads
    // archives off disk before it writes, and a championship entered meanwhile
    // would be thrown away by whichever of the two rebuilt the career second.
    void commit(() => adopt(setup)).catch((error: unknown) => {
      console.error('Could not record the event against the career.', error);
    });
  });

  /**
   * What the install can race of each championship the season has entered.
   * @param season The season
   * @returns One availability per entry, of its own copy of the championship
   */
  const enteredAvailability = async (
    season: CareerSeason,
  ): Promise<Map<SeasonEntry, SeriesAvailability>> => new Map(await Promise.all(
    season.entries.map(async (entry): Promise<[SeasonEntry, SeriesAvailability]> => (
      [entry, await series.validate(entry.championship)]
    )),
  ));

  return {
    get: () => current,

    async calendar(index) {
      const career = await ensure();
      const at = index ?? (currentSeason(career)?.index ?? 0);
      const held = career.seasons.find((one) => one.index === at);
      if (!held) throw new AppError('career.season.notFound', { season: at });

      const library = await series.list();

      return composeCalendar(
        career,
        held,
        library.series,
        await enteredAvailability(held),
        settings.get().allowSameDayEvents,
      );
    },

    enrol: (request: EnrolRequest) => commit(async () => {
      const { career, season } = await seasonNow();

      const listing = await series.get(request.series);
      if (!listing) throw new AppError('series.notFound', { series: request.series });
      const entry = listing.series.entries.find((one) => one.id === request.entry);
      if (!entry) throw new AppError('series.entry.unknown', { entry: request.entry });

      if (!listing.availability.available) {
        throw new AppError('career.series.unavailable', { series: listing.series.name });
      }
      if (!isEligible(entry.ladder, career.level)) {
        throw new AppError('career.entry.ineligible', { entry: entry.name });
      }
      const edition = request.edition ?? editionAt(listing.series, season, career.date);
      checkEdition(listing.series, edition);
      if (enteredEntry(season, request.series, edition)) {
        throw new AppError('career.entry.enrolled', { entry: listing.series.name });
      }

      // A copy, and a deep one: the season must not change when the library's
      // own object does.
      const championship = structuredClone(listing.series);
      const events = materialiseEvents(championship, season, edition, career.date);
      // Every round already behind the clock would be a season raced entirely
      // without the player.
      if (events.every((one) => one.status === 'missed')) {
        throw new AppError('career.edition.over', { series: listing.series.name });
      }
      const enrolled: SeasonEntry = {
        series: request.series,
        edition,
        championship,
        entry: request.entry,
        // The last seat of the class, which is the one roundRace gives up.
        playerSeat: entry.seats[entry.seats.length - 1]?.id ?? '',
        car: request.car,
        // Salted like the forecasts, so two careers, two seasons and two
        // editions of one championship field different drivers.
        field: await series.drawField(
          championship,
          request.entry,
          request.car,
          seasonSalt(career, season.index, edition),
        ),
        events,
        standings: buildStandings(championship, [], new Date().toISOString()),
      };

      // Entering a championship whose opener is this week forecasts it at once,
      // rather than leaving it blank until the clock next happens to move.
      current = withSeason(career, issueForecasts(
        career,
        { ...season, entries: [...season.entries, enrolled] },
        career.date,
      ));
      // The rounds already behind the clock happened without the player.
      await catchUp();

      return settle();
    }),

    withdraw: (request) => commit(async () => {
      const { season } = await seasonNow();
      // The edition named, or else the earliest of this class's still running.
      const held = season.entries
        .filter((one) => (
          one.series === request.series
          && one.entry === request.entry
          && !one.withdrawn
          && (request.edition === undefined
            ? one.events.some((event) => event.status === 'scheduled')
            : one.edition === request.edition)
        ))
        .sort((left, right) => left.edition - right.edition)[0];
      if (!held) throw new AppError('career.entry.notEnrolled', { entry: request.entry });

      replaceEntry(season, held, {
        ...held,
        withdrawn: true,
        // Everything still to come becomes a non-start. What was already raced
        // stays exactly as it was: those rounds happened.
        events: held.events.map((event) => (
          event.status === 'scheduled' ? { ...event, status: 'missed' as const } : event
        )),
      });
      // Only what is already behind the clock; the rest is simulated as it comes.
      await catchUp();

      return settle();
    }),

    strength: (request) => commit(async () => {
      const { season } = await seasonNow();
      const step = keptStep(request.strength);
      const edition = request.edition ?? enteredEdition(season, request.series);
      const entry = edition === null ? null : enteredEntry(season, request.series, edition);
      if (!entry) {
        const listing = await series.get(request.series);
        throw new AppError('career.event.notEntered', { series: listing?.series.name ?? request.series });
      }

      if (request.round === undefined) {
        replaceEntry(season, entry, withStrength(entry, step));

        return settle();
      }

      const event = entry.events.find((one) => one.round === request.round);
      if (!event) {
        throw new AppError('career.event.notFound', { series: entry.championship.name, round: request.round });
      }
      // A round already run keeps what it raced at, which its sessions record.
      if (event.status !== 'scheduled') {
        const round = entry.championship.rounds.find((one) => one.id === event.round);
        throw new AppError('career.event.closed', { round: round?.name ?? event.round });
      }

      replaceEntry(season, entry, {
        ...entry,
        events: entry.events.map((one) => (one === event ? withStrength(one, step) : one)),
      });

      return settle();
    }),

    advanceTo: (date: string, skip = false) => commit(async () => {
      const { career, season } = await seasonNow();
      if (toDayNumber(date) < toDayNumber(career.date)) {
        throw new AppError('career.date.backwards', { date, from: career.date });
      }
      // A session out at the game is being raced for a round the move could give
      // up, or close the season under, and its result would then land nowhere.
      if (race.progress()?.inFlight) throw new AppError('run.inFlight');
      // Moving on would turn the rest of an event already begun into a
      // non-start, which is not something to do on the way past - unless the
      // player was shown that and confirmed it.
      const busy = inProgressEvent(season);
      if (busy && !skip) throw new AppError('career.event.inProgress', { event: eventName(busy) });

      let working = career;
      let year = season;
      // Confirmed, the clock goes all the way; otherwise it stops at the first
      // event of the career's on the way rather than pass it unasked.
      let stop = skip ? date : advanceStop(year, working.date, date);
      // An event on the clock's own day is no stop, so moving on unconfirmed
      // would still lose it - and nothing is lost unasked.
      const unasked = skip ? undefined : advanceSkips(year, stop)[0];
      if (unasked) throw new AppError('career.event.earlierPending', { event: lostName(unasked) });

      // A move past 31 December closes the year on the way: whatever of it was
      // still to run is given up and raced by the field, and the next opens empty.
      while (stop > year.endDate) {
        working = await simulateMissed(closeSeason(working, year));
        year = openSeason(year.index + 1, addDays(year.endDate, 1));
        working = { ...working, date: year.startDate, seasons: [...working.seasons, year] };
        stop = skip ? date : advanceStop(year, working.date, date);
      }

      // An enrolled event the clock has gone right past was never raced.
      const next = issueForecasts(working, markMissed(year, advanceSkips(year, stop)), stop);
      current = withSeason({ ...working, date: stop }, next);
      await catchUp();

      return settle();
    }),

    async skips(date) {
      const { season } = await seasonNow();

      return advanceSkips(season, date);
    },

    async event(request) {
      const {
        career, season, listing, edition,
      } = await runAsked(request);
      // A season behind the current one is history: read back, never raced.
      const closed = season !== currentSeason(career);
      const setup = await race.get();
      const held = enteredEvent(season, request.series, request.round, edition, closed);

      const championship = held?.entry.championship ?? listing?.series;
      if (!championship) throw new AppError('series.notFound', { series: request.series });
      if (!held) checkEdition(championship, edition);

      const classEntry = championship.entries.find((one) => one.id === (held?.entry.entry ?? ''))
        ?? championship.entries[0];
      const salt = seasonSalt(career, season.index, edition);
      // A championship the career is not in is dated as if entered today.
      const dated = held ? [] : materialiseEvents(championship, season, edition, career.date);
      const found = dated.find((one) => one.round === request.round);
      const listed = held?.event ?? (found && simulatedEvent(championship, found, salt));
      // Drawn on read as well as stored as the clock moves, so an event inside
      // the lead has its weather whether or not it has been entered yet.
      const event = listed && issueForecast(
        career,
        { season: season.index, edition },
        championship,
        listed,
        career.date,
      );
      const round = championship.rounds.find((one) => one.id === request.round);
      if (!classEntry || !event || !round) {
        throw new AppError('career.event.notFound', { series: championship.name, round: request.round });
      }

      const availability = held || !listing ? await series.validate(championship) : listing.availability;
      const raceable = roundRaceableIn(availability, request.round);
      // A career not yet in the championship has no car, so its event is
      // planned in the first one the class could field - the sessions, their
      // lengths and their weather do not depend on which.
      const roundAvailable = roundAvailabilityIn(availability, request.round);
      const carsOf = (entry: string): readonly string[] => (
        roundAvailable?.entries.find((one) => one.entry === entry)?.eligible
        ?? availability.entries.find((one) => one.entry === entry)?.eligible
        ?? []
      );
      const firstCar = carsOf(classEntry.id)[0];
      const car = held?.entry.car ?? (firstCar ? { model: firstCar } : null);

      let plan: EventPlan | null = null;
      if (car && raceable) {
        try {
          const definition = await lowerEvent(championship, {
            entry: classEntry.id, round: request.round, car, draw: event.forecast, field: held?.entry.field,
          }, event.raceId, held ? strengthStep(held) : 0);
          plan = planEvent(definition, await content.content());
        } catch (error) {
          // What the page can show without a plan is the round itself, and it
          // already says the round cannot be raced.
          console.warn(`Could not plan ${championship.name} - ${round.name}.`, error);
        }
      }

      const format = formatOf(championship, round);
      const climate = climateOf(championship, round);
      const forecast = event.forecast ? offerForecast(event.forecast, await series.offer()) : null;
      const playerSeat = held?.entry.playerSeat ?? null;
      const seat = classEntry.seats.find((one) => one.id === playerSeat);
      const prizes = classEntry.prizes ?? championship.prizes;

      let blocked: AppErrorInfo | null = appErrorInfo('career.event.notEntered', { series: championship.name });
      if (closed) blocked = appErrorInfo('career.season.closed', { year: seasonYear(season) });
      else if (held) blocked = launchBlock(season, held, raceable, settings.get().allowSameDayEvents);

      const view: CareerEventView = {
        series: championship.id,
        season: season.index,
        edition,
        editions: editionsOf(championship),
        seriesName: championship.name,
        round: round.id,
        roundName: round.name,
        number: championship.rounds.indexOf(round) + 1,
        rounds: championship.rounds.length,
        track: round.track,
        date: event.date,
        climate,
        prize: prizes?.positions?.[0] ?? null,
        gridSize: classEntry.seats.length,
        status: event.status,
        clock: career.date,
        entered: held ? {
          entry: classEntry.id,
          entryName: classEntry.name,
          ladder: classEntry.ladder,
          car: held.entry.car,
          team: championship.teams?.find((one) => one.id === seat?.team)?.name ?? null,
        } : null,
        strength: held ? eventStrength(held, !closed && event.status === 'scheduled') : null,
        classes: championship.entries.map((one) => ({
          id: one.id,
          name: one.name,
          ladder: one.ladder,
          eligible: isEligible(one.ladder, career.level),
          cars: carsOf(one.id),
        })),
        raceable,
        sessions: plan ? eventSessions(
          plan,
          format ? roundSessions(format, round) : [],
          event.sessions,
          forecast,
          climate !== null && forecast === null,
          event.score,
          playerSeat,
          !closed && !!held && event.status === 'scheduled',
        ) : [],
        blocked,
        skips: !closed && held && event.status === 'scheduled'
          ? launchSkips(season, held, settings.get().allowSameDayEvents)
          : [],
        // Whatever is already over is a non-start from the moment it is entered.
        behind: closed ? [] : dated
          .filter((one) => one.status === 'missed')
          .map((one) => skippedRound(championship, classEntry.id, edition, one, 'behind')),
        live: !closed && setup.definition.id === event.raceId,
        grid: plan?.grid ?? [],
        // Not the player in a round they were not there for, nor in any round
        // of a championship they are not in.
        substituted: event.status === 'missed',
      };

      return view;
    },

    async results(request: ResultsRequest) {
      const {
        career, season, listing, edition,
      } = await runAsked(request);
      const held = editionEntry(season, request.series, edition);
      if (held) return entryResults(held, season.index);

      if (!listing) throw new AppError('series.notFound', { series: request.series });
      checkEdition(listing.series, edition);

      // Simulated afresh on every read and never stored: the same round of the
      // same edition always comes out the same, so there is nothing to keep.
      const salt = seasonSalt(career, season.index, edition);
      const rounds = materialiseEvents(listing.series, season, edition, career.date)
        .map((event) => roundResult(simulatedEvent(listing.series, event, salt)));

      return {
        championship: listing.series, season: season.index, edition, rounds, playerSeat: null, playerEntry: null,
      };
    },

    launch: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      const held = await heldEvent(season, request);

      const availability = await series.validate(held.entry.championship);
      const block = launchBlock(
        season,
        held,
        roundRaceableIn(availability, request.round),
        settings.get().allowSameDayEvents,
      );
      if (block) throw new AppError(block.code, block.params);

      // What this event costs the rest of the season, which the player has to
      // have been shown and agreed to - an event on the same day included,
      // unless settings allow two on one day.
      const lost = launchSkips(season, held, settings.get().allowSameDayEvents);
      if (lost.length > 0 && !request.skip) {
        const partway = lost.find((one) => one.reason === 'partway');
        if (partway) throw new AppError('career.event.otherInProgress', { event: lostName(partway) });
        const earlier = lost.find((one) => one.reason !== 'clash');
        throw earlier
          ? new AppError('career.event.earlierPending', { event: lostName(earlier) })
          : new AppError('career.event.sameDay', { event: lostName(lost[0]) });
      }

      // Racing an event still ahead of the clock moves the clock to it, and
      // everything confirmed lost on the way becomes a non-start. Forecasts are
      // issued either way, since an event already inside the lead may not have
      // had its own.
      const date = career.date < held.event.date ? held.event.date : career.date;
      const moved = issueForecasts(career, markMissed(season, lost), date);
      const event = enteredEvent(moved, request.series, request.round, held.entry.edition)?.event ?? held.event;

      // Part-way through, the event carries on from the race the slot holds,
      // with only its AI levels taken afresh. What has run comes from the
      // career's own record, so a quick race raced in between costs it nothing.
      const fresh = await lowerEvent(held.entry.championship, {
        entry: held.entry.entry,
        round: request.round,
        car: held.entry.car,
        draw: event.forecast,
        field: held.entry.field,
      }, event.raceId, strengthStep(held));
      const setup = await race.get();
      await race.load(
        slotHolds(setup, event.raceId, event.sessions.length) ? withLevelsOf(setup.definition, fresh) : fresh,
        event.sessions,
      );
      const launched = await race.launch({ scale: request.scale });

      // Kept only once the launch is away, so one that fails to start costs the
      // season nothing.
      if (date !== career.date || lost.length > 0 || event.forecast !== held.event.forecast) {
        current = withSeason({ ...career, date }, moved);
        await catchUp();
        settle();
      }

      return launched;
    }),

    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        pending = write();
      }
      await pending;
    },

    onChange(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};
