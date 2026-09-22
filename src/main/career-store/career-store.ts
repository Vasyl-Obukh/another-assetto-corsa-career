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
  CareerStore, EnrolRequest, EnteredEvent, EventRequest,
} from './types.ts';
import {
  advanceStop,
  composeCalendar,
  currentSeason,
  enteredEvent,
  eventName,
  eventSessions,
  inProgressEvent,
  issueForecast,
  issueForecasts,
  launchBlock,
  materialiseEvents,
  readCareer,
  seasonEndDate,
  withSeason,
} from './utils.ts';
import { toDayNumber } from '../../core/season-calendar/index.ts';
import { buildStandings, scoreRound } from '../../core/season-scoring/index.ts';
import type { LaunchResult } from '../../core/season-scoring/index.ts';
import { climateOf, formatOf, roundSessions } from '../../core/series/index.ts';
import { offerForecast } from '../../core/weather-forecast/index.ts';
import { planWeekend } from '../../core/weekend/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type {
  Career,
  CareerEventView,
  CareerSeason,
  Championship,
  RaceOut,
  RaceSetup,
  RoundDraw,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { isEligible, startingLevels } from '../../shared/utils/career-eligibility/index.ts';
import { roundAvailabilityIn, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import { RACE_DIR, RESULTS_DIR } from '../race-store/index.ts';
import type { SeriesStore } from '../series-store/index.ts';
import { quarantine } from '../settings-store/index.ts';

export type { CareerStore, EnrolRequest, EventRequest } from './types.ts';

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
 * Whether a weekend's progress in the race store has come apart from what the
 * career recorded of it.
 *
 * Only possible from the Race screen: resetting or replacing the race there
 * part-way through a career weekend throws away progress the career already
 * holds results for, and the weekend cannot be picked up again from there.
 * @param event The round, as the career holds it
 * @param setup The race store as it stands
 * @returns True when the weekend can only be run again from the start
 */
const isDisturbed = (event: SeasonEvent, setup: RaceSetup): boolean => (
  event.status === 'scheduled'
  && event.sessions.length > 0
  && (setup.definition.id !== event.raceId
    || (setup.state?.completed.length ?? 0) < event.sessions.length)
);

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
 * because that is what runs a weekend, and the content store because the event
 * page plans a weekend to say what each session is.
 * @param userDataDir Folder to keep career.json in
 * @param series The championship library
 * @param race The race being set up and run
 * @param content The installed content
 * @returns A store over the career, or over none when no file loaded
 */
export const createCareerStore = async (
  userDataDir: string,
  series: SeriesStore,
  race: RaceStore,
  content: ContentStore,
): Promise<CareerStore> => {
  const file = path.join(userDataDir, CAREER_FILE);
  const tmp = `${file}.tmp`;
  const resultsDir = path.join(userDataDir, RACE_DIR, RESULTS_DIR);

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
  // a weekend's score landing while a championship is being entered would lose
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
      seasons: [{
        index: 0, startDate, endDate: seasonEndDate(startDate), entries: [],
      }],
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
   * @param request Which championship and round
   * @returns The entry and its event
   * @throws When the career is not in that championship
   */
  const heldEvent = async (season: CareerSeason, request: EventRequest): Promise<EnteredEvent> => {
    const held = enteredEvent(season, request.series, request.round);
    if (held) return held;

    const listing = await series.get(request.series);
    throw new AppError('career.event.notEntered', { series: listing?.series.name ?? request.series });
  };

  /**
   * The weather drawn for a round the career is in, issued on the spot when the
   * clock has reached its lead but nothing has moved the clock since.
   * @param season The season it falls in
   * @param held The entry and its event
   * @returns The draw, or undefined when the weekend is still further out
   */
  const drawOf = (season: CareerSeason, held: EnteredEvent): RoundDraw | undefined => {
    if (!current) return undefined;

    return issueForecast(current, season.index, held.entry.championship, held.event, current.date)
      .forecast;
  };

  /**
   * The weather drawn for a round of the current season, by its ids.
   * @param seriesId The championship's id
   * @param round The round's id
   * @returns The draw, or undefined when the career is not in that round or its
   * weekend is still further out
   */
  const roundDraw = (seriesId: string, round: string): RoundDraw | undefined => {
    const season = current && currentSeason(current);
    const held = season && enteredEvent(season, seriesId, round);

    return season && held ? drawOf(season, held) : undefined;
  };

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
   * Reads the raw race_out.json an archived launch holds.
   *
   * The raw file rather than the summary the race store serves: a summary names
   * a driver and scoring needs the car index, which is what joins a result back
   * to the seat that raced it.
   * @param archive The archive's file name
   * @returns What Assetto Corsa wrote, or null when it cannot be read
   */
  const archivedResult = async (archive: string): Promise<RaceOut | null> => {
    if (!archive) return null;

    try {
      const text = await readFile(path.join(resultsDir, archive), 'utf8');

      return (JSON.parse(text) as { result?: RaceOut }).result ?? null;
    } catch (error) {
      console.warn(`Could not read the archived result ${archive}.`, error);

      return null;
    }
  };

  /**
   * Scores whatever of a weekend has run so far.
   * @param championship The season's own copy of the championship
   * @param event The round
   * @param plan The weekend as planned
   * @param state How far through it the race store is
   * @param at When, as an ISO timestamp
   * @returns The round's score
   */
  const scoreSoFar = async (
    championship: Championship,
    event: SeasonEvent,
    plan: WeekendPlan,
    state: WeekendState,
    at: string,
  ): Promise<RoundScore> => {
    const results = (await Promise.all(state.completed.map(async (record): Promise<
    LaunchResult | null> => {
      const raceOut = await archivedResult(record.archive);

      return raceOut ? { launch: record.index, raceOut } : null;
    }))).filter((one) => one !== null);

    return scoreRound(championship, event.round, plan, state, results, at);
  };

  /**
   * Copies a weekend's progress onto the career after every launch.
   *
   * Every launch rather than only the last, so a practice or qualifying result
   * is on the event the moment it lands, and a race's points reach the
   * standings before the weekend is over. Idempotent, and that is load-bearing
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
    const score = await scoreSoFar(held.entry.championship, held.event, plan, state, at);
    const finished = state.completed.length >= state.launchCount;

    const event: SeasonEvent = {
      ...held.event,
      sessions: [...state.completed],
      score,
      status: finished ? 'raced' : 'scheduled',
    };
    replaceEntry(season, held.entry, withEvent(held.entry, event, at));

    // The clock never runs backwards, so a weekend raced early leaves it where
    // it was rather than pulling it back to the weekend's last day.
    if (finished && current.date < event.lastDay) {
      current = { ...current, date: event.lastDay };
      // Finishing one weekend can bring the next inside the forecast lead.
      const now = currentSeason(current);
      if (now) current = withSeason(current, issueForecasts(current, now, current.date));
    }
    settle();
  };

  race.onChange((setup) => {
    // Queued with the commands rather than run alongside them: adopting reads
    // archives off disk before it writes, and a championship entered meanwhile
    // would be thrown away by whichever of the two rebuilt the career second.
    void commit(() => adopt(setup)).catch((error: unknown) => {
      console.error('Could not record the weekend against the career.', error);
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

      return composeCalendar(career, held, library.series, await enteredAvailability(held));
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
      const already = season.entries.some((one) => one.series === request.series && !one.withdrawn);
      if (already) throw new AppError('career.entry.enrolled', { entry: listing.series.name });

      // A copy, and a deep one: the season must not change when the library's
      // own object does.
      const championship = structuredClone(listing.series);
      const enrolled: SeasonEntry = {
        series: request.series,
        championship,
        entry: request.entry,
        // The last seat of the class, which is the one roundRace gives up.
        playerSeat: entry.seats[entry.seats.length - 1]?.id ?? '',
        car: request.car,
        events: materialiseEvents(championship, season, career.date),
        standings: buildStandings(championship, [], new Date().toISOString()),
      };

      // Entering a championship whose opener is this week forecasts it at once,
      // rather than leaving it blank until the clock next happens to move.
      current = withSeason(career, issueForecasts(
        career,
        { ...season, entries: [...season.entries, enrolled] },
        career.date,
      ));

      return settle();
    }),

    withdraw: (request) => commit(async () => {
      const { season } = await seasonNow();
      const held = season.entries.find((one) => (
        one.series === request.series && one.entry === request.entry && !one.withdrawn
      ));
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

      return settle();
    }),

    advanceTo: (date: string) => commit(async () => {
      const { career, season } = await seasonNow();
      if (toDayNumber(date) < toDayNumber(career.date)) {
        throw new AppError('career.date.backwards', { date, from: career.date });
      }
      // Moving on would turn the rest of a weekend already begun into a
      // non-start, which is not something to do on the way past.
      const busy = inProgressEvent(season);
      if (busy) throw new AppError('career.event.inProgress', { event: eventName(busy) });

      const stop = advanceStop(season, career.date, date);
      const next: CareerSeason = issueForecasts(career, {
        ...season,
        // An enrolled weekend the clock has gone right past was never raced.
        entries: season.entries.map((entry) => ({
          ...entry,
          events: entry.events.map((event) => (
            event.status === 'scheduled' && event.lastDay < stop
              ? { ...event, status: 'missed' as const }
              : event
          )),
        })),
      }, stop);
      current = withSeason({ ...career, date: stop }, next);

      return settle();
    }),

    async raceForecast(raceId) {
      const season = current && currentSeason(current);
      if (!season) return null;

      // Any status, not only scheduled: the race screen still shows a weekend
      // that has been run through to the end.
      const held = season.entries
        .filter((entry) => !entry.withdrawn)
        .flatMap((entry) => entry.events.map((event) => ({ entry, event })))
        .find(({ event }) => event.raceId === raceId);
      const draw = held && drawOf(season, held);

      return draw ? offerForecast(draw, await series.offer()) : null;
    },

    async draw(seriesId, round) {
      return roundDraw(seriesId, round);
    },

    async forecast(seriesId, round) {
      const draw = roundDraw(seriesId, round);
      return draw ? offerForecast(draw, await series.offer()) : null;
    },

    async event(request) {
      const { career, season } = await seasonNow();
      const setup = await race.get();
      const held = enteredEvent(season, request.series, request.round);
      const listing = await series.get(request.series);

      const championship = held?.entry.championship ?? listing?.series;
      if (!championship) throw new AppError('series.notFound', { series: request.series });

      const classEntry = championship.entries.find((one) => one.id === (held?.entry.entry ?? ''))
        ?? championship.entries[0];
      const listed = held?.event ?? materialiseEvents(championship, season, career.date)
        .find((one) => one.round === request.round);
      // Drawn on read as well as stored as the clock moves, so a weekend inside
      // the lead has its weather whether or not it has been entered yet.
      const event = listed && issueForecast(
        career,
        season.index,
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
      // A career not yet in the championship has no car, so its weekend is
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

      let plan: WeekendPlan | null = null;
      if (car && raceable) {
        try {
          const definition = await series.lowerRound(championship, {
            entry: classEntry.id, round: request.round, car, draw: event.forecast,
          });
          plan = planWeekend(definition, await content.content());
        } catch (error) {
          // What the page can show without a plan is the round itself, and it
          // already says the round cannot be raced.
          console.warn(`Could not plan ${championship.name} - ${round.name}.`, error);
        }
      }

      const format = formatOf(championship, round);
      const climate = climateOf(championship, round);
      const forecast = event.forecast ? offerForecast(event.forecast, await series.offer()) : null;
      const disturbed = held ? isDisturbed(held.event, setup) : false;
      const playerSeat = held?.entry.playerSeat ?? null;
      const seat = classEntry.seats.find((one) => one.id === playerSeat);
      const prizes = classEntry.prizes ?? championship.prizes;

      const view: CareerEventView = {
        series: championship.id,
        seriesName: championship.name,
        round: round.id,
        roundName: round.name,
        number: championship.rounds.indexOf(round) + 1,
        rounds: championship.rounds.length,
        track: round.track,
        firstDay: event.firstDay,
        raceDay: event.raceDay,
        lastDay: event.lastDay,
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
          event.firstDay,
          event.score,
          playerSeat,
          !!held && event.status === 'scheduled',
        ) : [],
        blocked: held
          ? launchBlock(season, held, raceable, disturbed)
          : appErrorInfo('career.event.notEntered', { series: championship.name }),
        live: setup.definition.id === event.raceId,
        disturbed,
      };

      return view;
    },

    launch: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      const held = await heldEvent(season, request);
      const setup = await race.get();

      const availability = await series.validate(held.entry.championship);
      const block = launchBlock(
        season,
        held,
        roundRaceableIn(availability, request.round),
        isDisturbed(held.event, setup),
      );
      if (block) throw new AppError(block.code, block.params);

      // Racing a weekend still ahead of the clock moves the clock to it. Nothing
      // entered before it is left unraced by now - launchBlock saw to that - so
      // there is nothing on the way to mark missed. Forecasts are issued either
      // way, since a weekend already inside the lead may not have had its own.
      const date = career.date < held.event.firstDay ? held.event.firstDay : career.date;
      const moved = issueForecasts(career, season, date);
      const event = enteredEvent(moved, request.series, request.round)?.event ?? held.event;
      if (date !== career.date || event.forecast !== held.event.forecast) {
        current = withSeason({ ...career, date }, moved);
        settle();
      }

      // Rebuilt until a launch has run, not only when another race is set up:
      // the championship page sets a round up under the same id, and a race
      // set up before its forecast was issued would not race it.
      if (setup.definition.id !== held.event.raceId || !setup.state?.completed.length) {
        // Reset before setting up rather than trusting set() to: it only drops
        // progress once a launch has run, and it matches a saved state on its
        // launch count alone - so another weekend's untouched state, with the
        // same number of sessions, would otherwise be taken for this one's.
        await race.reset();
        await race.set(await series.lowerRound(held.entry.championship, {
          entry: held.entry.entry,
          round: request.round,
          car: held.entry.car,
          draw: event.forecast,
        }));
      }

      return race.launch();
    }),

    restartEvent: (request) => commit(async () => {
      const { season } = await seasonNow();
      const held = await heldEvent(season, request);
      if (held.event.status !== 'scheduled') {
        throw new AppError('career.event.closed', { round: eventName(held) });
      }

      const setup = await race.get();
      if (setup.definition.id === held.event.raceId) await race.reset();

      const { score: unused, ...rest } = held.event;
      replaceEntry(season, held.entry, withEvent(
        held.entry,
        { ...rest, sessions: [] },
        new Date().toISOString(),
      ));

      return settle();
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
