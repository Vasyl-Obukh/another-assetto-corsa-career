// The race being set up, and the launch in flight. Main owns both, for the same
// reason it owns settings: they are persisted, and src/core reads them.
//
// Waiting for a result is the one thing that does not fit request/response. A
// launch resolves as soon as Content Manager has the URI and the result lands
// minutes or hours later, so the wait is detached and reaches the renderer as a
// push.

import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_DEFINITION,
  DEFAULT_PLAN_HOUR,
  DRAFT_FILE,
  MAX_LISTED_RESULTS,
  OUT_DIR,
  RACE_DIR,
  RACE_INI_FILE,
  RESULT_TIMEOUT_MS,
  RESULTS_DIR,
  STATE_FILE,
  WRITE_DEBOUNCE_MS,
} from './constants.ts';
import type { CspSetup, RaceStore } from './types.ts';
import {
  isArchiveName, readJson, readRecord, writeJson,
} from './utils.ts';
import { buildRaceUri, launchUri } from '../../core/launch/index.ts';
import { buildRaceIni, parseClock, validateRace } from '../../core/race-ini/index.ts';
import { archiveResults, waitForResults } from '../../core/results/index.ts';
import { readWeatherFx, readWeatherFxController } from '../../core/weather/index.ts';
import { installPlan, removePlans } from '../../core/weather-plan/index.ts';
import {
  advanceWeekend, assertStateMatches, initWeekendState, nextLaunch, planWeekend, prepareLaunch,
} from '../../core/weekend/index.ts';
import { MS_PER_HOUR } from '../../shared/constants/index.ts';
import { AppError, isAppError } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  AcPaths,
  RaceDefinition,
  RaceSetup,
  RaceStatus,
  ResultRecord,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import {
  controllerFor, isDynamic, plannerFor, supportsDynamic,
} from '../../shared/utils/weather-system/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';

export type { RaceStore } from './types.ts';

/**
 * Loads the race being set up and returns a store over it.
 * @param userDataDir Folder to keep the draft, the progress and the archives in
 * @param content The scan the race is resolved and planned against
 * @param settings The store the driver name and weather system are read from
 * @returns The store, not yet pointed at any install
 */
export const createRaceStore = async (
  userDataDir: string,
  content: ContentStore,
  settings: SettingsStore,
): Promise<RaceStore> => {
  const dir = path.join(userDataDir, RACE_DIR);
  const draftFile = path.join(dir, DRAFT_FILE);
  const stateFile = path.join(dir, STATE_FILE);
  const iniFile = path.join(dir, OUT_DIR, RACE_INI_FILE);
  const resultsDir = path.join(dir, RESULTS_DIR);

  let definition = await readJson<RaceDefinition>(draftFile) ?? structuredClone(DEFAULT_DEFINITION);
  let state = await readJson<WeekendState>(stateFile);
  let paths: AcPaths | null = null;
  let status: RaceStatus = {
    phase: 'idle', launchIndex: null, startedAt: null, failure: null,
  };
  let watching: AbortController | null = null;
  // Held rather than re-read, and dropped when use() points us somewhere else.
  let csp: Promise<CspSetup> | null = null;

  const listeners = new Set<(setup: RaceSetup) => void>();
  let timer: NodeJS.Timeout | null = null;
  let pending: Promise<void> = Promise.resolve();

  const write = async (): Promise<void> => {
    await mkdir(dir, { recursive: true });
    await writeJson(draftFile, definition);
    await writeJson(stateFile, state);
  };

  const schedule = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; pending = write(); }, WRITE_DEBOUNCE_MS);
  };

  /**
   * Plans the current definition, folding anything it objects to into the
   * problem list rather than throwing.
   *
   * validateRace does not resolve a grid, so a race that passes it can still be
   * unplannable - too many cars for the track's pit boxes, or a car with no
   * liveries. Both raise from buildGrid, and the setup screen wants them listed
   * beside the rest rather than as a failed call.
   * @param problems The list to add to
   * @returns The plan, or null when the race cannot be planned
   */
  const planned = async (problems: AppErrorInfo[]): Promise<WeekendPlan | null> => {
    if (problems.length > 0) return null;

    try {
      return planWeekend(definition, await content.content());
    } catch (error) {
      if (!isAppError(error)) throw error;
      problems.push(error.toInfo());

      return null;
    }
  };

  /**
   * Brings the stored progress into line with the plan.
   *
   * Progress left over from a weekend that no longer exists, or that planned a
   * different number of launches, is worse than none: it would apply one
   * weekend's grid to another and look like it worked.
   * @param plan The plan to match, or null when there is none
   * @returns The progress to report, or null when there is no plan
   */
  const reconciled = (plan: WeekendPlan | null): WeekendState | null => {
    if (!plan) return null;
    if (!state) return initWeekendState(plan);

    try {
      assertStateMatches(plan, state);
    } catch {
      return initWeekendState(plan);
    }

    return state;
  };

  /**
   * How CSP is set up, read once per install.
   *
   * Enabled is the shipped default, so an install we cannot see into reads as
   * both modules on rather than as neither.
   * @returns The controller and modules the install runs
   */
  const cspSetup = async (): Promise<CspSetup> => {
    if (!paths) return { defaultController: null, weatherFx: { weatherFx: true, rainFx: true } };

    // Independent files, so read together rather than one after the other.
    csp ??= Promise.all([
      readWeatherFxController(paths.documents),
      readWeatherFx(paths.acRoot, paths.documents),
    ]).then(
      ([defaultController, weatherFx]) => ({ defaultController, weatherFx }),
      // A failed read is not cached, or one unlucky moment would be the answer
      // for the rest of the session.
      (error: unknown) => { csp = null; throw error; },
    );

    return csp;
  };

  const describe = async (): Promise<RaceSetup> => {
    const installed = await content.content();
    const problems = validateRace(definition, installed);
    const plan = await planned(problems);
    const current = reconciled(plan);
    const { defaultController, weatherFx } = await cspSetup();

    // A reconciliation that happened is a real change, so it is written back
    // rather than recomputed on every read.
    if (current !== state) {
      state = current;
      schedule();
    }

    return {
      definition,
      plan,
      state,
      status,
      problems,
      defaultController,
      weatherFx,
    };
  };

  const emit = async (): Promise<void> => {
    if (listeners.size === 0) return;

    try {
      const setup = await describe();
      for (const listener of listeners) listener(setup);
    } catch (error) {
      // Losing the install while a race runs is not worth crashing over; the
      // next call through IPC reports it properly.
      console.warn('Could not describe the race setup.', error);
    }
  };

  /**
   * Puts the user's name on the timing screen.
   *
   * The name is a property of the person playing rather than of a race, so it
   * lives in settings; a race file that names its own driver keeps it, which is
   * what lets a spike race under a name of its own.
   * @param race The launch, already prepared
   * @returns The launch with its driver filled in
   */
  const withDriver = (race: RaceDefinition): RaceDefinition => {
    const { driverName } = settings.get();
    if (!driverName || race.playerCar.driver) return race;

    return { ...race, playerCar: { ...race.playerCar, driver: driverName } };
  };

  /**
   * Names the controller a launch should run, and installs a plan when its
   * weather is meant to change.
   *
   * A race definition that names its own controller keeps it, which is what lets
   * a hand-written spike file pick one. Anything else takes the controller from
   * the weather system chosen in settings.
   * @param race The launch, already prepared
   * @returns The launch with its controller filled in
   */
  const withWeatherSystem = async (race: RaceDefinition): Promise<RaceDefinition> => {
    const system = settings.get().weatherSystem;
    const conditions = race.conditions ?? {};
    const steps = conditions.weatherSteps;
    const dynamic = isDynamic(steps) && supportsDynamic(system);

    if (dynamic && paths && steps) {
      const planner = plannerFor(system);
      // The sun follows the plan, so it has to open when the session does.
      if (planner) {
        await installPlan(paths.acRoot, planner, {
          steps,
          startHour: parseClock(conditions.timeOfDay ?? DEFAULT_PLAN_HOUR),
        });
      }
    }

    if (conditions.weatherController) return race;

    const controller = controllerFor(system, dynamic);

    return controller
      ? { ...race, conditions: { ...conditions, weatherController: controller } }
      : race;
  };

  /**
   * Ends the launch in flight and tells everyone.
   * @param failure Why it ended badly, or null when it did not
   * @returns Resolves once listeners have been told
   */
  const settle = async (failure: AppErrorInfo | null): Promise<void> => {
    // Every ending goes through here, so this is where the planner's own
    // settings are given back.
    if (paths) {
      try {
        await removePlans(paths.acRoot);
      } catch (error) {
        console.warn('Could not remove the generated weather plan.', error);
      }
    }

    watching = null;
    status = {
      phase: 'idle', launchIndex: null, startedAt: null, failure,
    };
    await emit();
  };

  /**
   * Waits for the result of the launch in flight, then records it.
   *
   * Detached from the call that started it, because a race takes as long as it
   * takes. Everything it changes reaches the renderer as a push.
   * @param plan The weekend being run
   * @param index Which launch is in flight
   * @param file The race_out.json to watch, as it was when the launch started
   * @param since Anything written at or before this is a previous result
   * @param signal Aborted when the user stops waiting
   * @returns Resolves once the result has been archived or given up on
   */
  const awaitResult = async (
    plan: WeekendPlan,
    index: number,
    file: string,
    since: number,
    signal: AbortSignal,
  ): Promise<void> => {
    const raceOut = await waitForResults(file, { since, signal });

    // An abort is the user cancelling, which cancel() has already settled.
    if (signal.aborted) return;

    if (!raceOut) {
      await settle(new AppError('run.resultTimedOut', {
        hours: RESULT_TIMEOUT_MS / MS_PER_HOUR,
      }).toInfo());

      return;
    }

    // Named after the session rather than the launch number: "Rain shakedown -
    // Qualifying" says what the archive holds in a way "- launch 1" never did.
    const session = plan.launches[index]?.session;
    const archived = await archiveResults(raceOut, resultsDir, {
      raceId: plan.raceId,
      raceName: plan.launches.length > 1 && session
        ? `${plan.raceName} - ${session.name ?? session.type}`
        : plan.raceName,
    });

    state = advanceWeekend(plan, state ?? initWeekendState(plan), raceOut, {
      archive: path.basename(archived),
      completedAt: new Date().toISOString(),
    });
    schedule();
    await settle(null);
  };

  /**
   * Runs the wait, and settles the launch however it ends.
   *
   * Nothing is on a caller's stack by this point, so a failure archiving the
   * result would otherwise be an unhandled rejection and leave the launch
   * reading as still running for ever - with the planner's settings still ours.
   * @param plan The weekend being run
   * @param index Which launch is in flight
   * @param file The race_out.json to watch, as it was when the launch started
   * @param since Anything written at or before this is a previous result
   * @param signal Aborted when the user stops waiting
   * @returns Resolves once the launch has been settled
   */
  const collect = async (
    plan: WeekendPlan,
    index: number,
    file: string,
    since: number,
    signal: AbortSignal,
  ): Promise<void> => {
    try {
      await awaitResult(plan, index, file, since, signal);
    } catch (error) {
      const failure = isAppError(error)
        ? error
        : new AppError('run.result.notRecorded', { reason: String(error) });
      console.error('Could not record the result of the launch.', error);
      await settle(failure.toInfo());
    }
  };

  return {
    use(next) {
      paths = next;
      // A different install has its own CSP config, and the probe re-runs
      // whenever the user changes an override.
      csp = null;
    },

    get: describe,

    async set(next) {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');

      // Editing a weekend that has already started restarts it: a launch
      // inherits its grid from the one before, which means nothing once the
      // sessions it came from have changed.
      if (state && state.completed.length > 0) state = null;

      definition = next;
      schedule();

      return describe();
    },

    async launch() {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');
      if (!paths) throw new AppError('paths.unresolved');

      const installed = await content.content();
      const problems = validateRace(definition, installed);
      const plan = await planned(problems);
      if (!plan) throw new AppError('run.notPlanned');

      const progress = reconciled(plan) ?? initWeekendState(plan);
      state = progress;

      const launch = nextLaunch(plan, progress);
      if (!launch) throw new AppError('weekend.complete', { race: plan.raceName });

      const launched = prepareLaunch(plan, progress, launch.index);

      // From here on the planner's own settings may already be ours, so every
      // way out has to give them back - a race that failed to start must not
      // leave PURE pointed at our plan.
      let raceIni: string;
      try {
        const prepared = await withWeatherSystem(withDriver(launched));
        raceIni = buildRaceIni(prepared, installed);
        await mkdir(path.dirname(iniFile), { recursive: true });
        await writeFile(iniFile, raceIni);
      } catch (error) {
        await settle(null);
        throw error;
      }

      status = {
        phase: 'launching',
        launchIndex: launch.index,
        startedAt: new Date().toISOString(),
        failure: null,
      };
      await emit();

      // Anything written at or before this point is a previous session's result.
      const since = Date.now();
      try {
        await launchUri(paths.contentManager, buildRaceUri(raceIni));
      } catch (error) {
        await settle(null);
        throw error;
      }

      watching = new AbortController();
      status = { ...status, phase: 'waiting' };
      // Pushed as well as returned, so every status move reaches listeners the
      // same way.
      await emit();
      void collect(plan, launch.index, paths.raceOut, since, watching.signal);

      return describe();
    },

    async cancel() {
      if (!watching) throw new AppError('run.notLaunched');

      watching.abort();
      await settle(null);

      return describe();
    },

    async reset() {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');

      state = null;
      schedule();

      return describe();
    },

    async results() {
      const names = await readdir(resultsDir).catch(() => [] as string[]);
      // The names are ISO timestamps, so sorting them descending is newest first
      // without stat-ing anything.
      const newest = names.filter(isArchiveName).sort().reverse().slice(0, MAX_LISTED_RESULTS);
      const records = await Promise.all(
        newest.map((name) => readRecord(name, path.join(resultsDir, name))),
      );

      return records.filter((record): record is ResultRecord => record !== null);
    },

    async result(file) {
      if (!isArchiveName(file)) throw new AppError('run.result.notFound', { file });

      const record = await readRecord(file, path.join(resultsDir, file));
      if (!record) throw new AppError('run.result.notFound', { file });

      return record;
    },

    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async flush() {
      if (timer) { clearTimeout(timer); timer = null; pending = write(); }
      await pending;
    },
  };
};
