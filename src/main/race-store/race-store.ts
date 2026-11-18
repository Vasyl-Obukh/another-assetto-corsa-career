// The race being set up, and the launch in flight. Main owns both, for the same
// reason it owns settings: they are persisted, and src/core reads them.
//
// Waiting for a result is the one thing that does not fit request/response. A
// launch resolves as soon as Content Manager has the URI and the result lands
// minutes or hours later, so the wait is detached and reaches the renderer as a
// push.

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_DEFINITION,
  DEFAULT_PLAN_HOUR,
  DRAFT_FILE,
  MAX_LATEST_ARCHIVES,
  MAX_LISTED_RESULTS,
  OUT_DIR,
  OWNER_FILE,
  RACE_DIR,
  RACE_INI_FILE,
  RESULT_TIMEOUT_MS,
  RESULTS_DIR,
  STATE_FILE,
  WRITE_DEBOUNCE_MS,
} from './constants.ts';
import type { CspSetup, RaceStore } from './types.ts';
import {
  isArchiveName, progressOf, readJson, readRecord, sameEvent, withLayout, writeJson,
} from './utils.ts';
import {
  advanceEvent,
  assertStateMatches,
  initEventState,
  nextLaunch,
  planEvent,
  prepareLaunch,
  scaleLaunch,
  skipEliminated,
} from '../../core/event/index.ts';
import { assistsPresetJson, buildRaceUri, launchUri } from '../../core/launch/index.ts';
import { buildRaceIni, validateRace } from '../../core/race-ini/index.ts';
import { archiveResults, waitForResults } from '../../core/results/index.ts';
import type { LaunchResult } from '../../core/season-scoring/index.ts';
import { readWeatherFx, readWeatherFxController } from '../../core/weather/index.ts';
import { installPlan, removePlans } from '../../core/weather-plan/index.ts';
import { MS_PER_HOUR } from '../../shared/constants/index.ts';
import { AppError, isAppError } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  AcPaths,
  DrivingAids,
  EventPlan,
  EventState,
  RaceDefinition,
  RaceOut,
  RaceSetup,
  RaceStatus,
  ResultRecord,
  Track,
} from '../../shared/types/index.ts';
import { defined } from '../../shared/utils/defined/index.ts';
import { parseClock } from '../../shared/utils/road-temperature/index.ts';
import {
  controllerFor, isDynamic, plannerFor, supportsDynamic,
} from '../../shared/utils/weather-system/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';

export type { RaceProgress, RaceSlot, RaceStore } from './types.ts';
// Re-exported because the quick-race store keeps its races beside the race
// store's own files, written the same tolerant way, and it and the career both
// carry an event part-way through on from the race the slot already holds.
export { RACE_DIR } from './constants.ts';
export {
  isArchiveName, readJson, slotHolds, withLevelsOf, writeJson,
} from './utils.ts';

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
  const ownerFile = path.join(dir, OWNER_FILE);
  const iniFile = path.join(dir, OUT_DIR, RACE_INI_FILE);
  const ownResults = path.join(dir, RESULTS_DIR);
  // Results go to the open career's folder, else to the store's own, which
  // race events of the player's own share.
  let resultsDir = ownResults;
  let listed: (() => ReadonlySet<string> | null) | null = null;
  let scopeOwner: string | null = null;

  let definition = await readJson<RaceDefinition>(draftFile) ?? structuredClone(DEFAULT_DEFINITION);
  let state = await readJson<EventState>(stateFile);
  let owner = (await readJson<{ owner: string | null }>(ownerFile))?.owner ?? null;
  let paths: AcPaths | null = null;
  let status: RaceStatus = {
    phase: 'idle', launchIndex: null, startedAt: null, scale: null, failure: null,
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
    await writeJson(ownerFile, { owner });
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
  const planned = async (problems: AppErrorInfo[]): Promise<EventPlan | null> => {
    if (problems.length > 0) return null;

    try {
      return planEvent(definition, await content.content());
    } catch (error) {
      if (!isAppError(error)) throw error;
      problems.push(error.toInfo());

      return null;
    }
  };

  /**
   * Brings the stored progress into line with the plan.
   *
   * Progress left over from an event that no longer exists, or that planned a
   * different number of launches, is worse than none: it would apply one
   * event's grid to another and look like it worked.
   * @param plan The plan to match, or null when there is none
   * @returns The progress to report, or null when there is no plan
   */
  const reconciled = (plan: EventPlan | null): EventState | null => {
    if (!plan) return null;

    let usable = state;
    if (usable) {
      try {
        assertStateMatches(plan, usable);
      } catch {
        usable = null;
      }
    }

    // Skipping happens here rather than at launch: describe() writes back a
    // reconciliation that changed anything, so a knockout that ended the
    // player's qualifying shows on the screen the moment the result lands.
    return skipEliminated(plan, usable ?? initEventState(plan), new Date().toISOString());
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

  /**
   * Every installed layout, for naming the one a result ran on.
   *
   * Best-effort: the archives are ours and readable with no install located,
   * so a scan that cannot run leaves a result unnamed rather than unlisted.
   * @returns The layouts, or none when the scan cannot be read
   */
  const installedTracks = async (): Promise<readonly Track[]> => {
    try {
      return (await content.content()).tracks;
    } catch (error) {
      if (!isAppError(error)) console.warn('Could not read the installed tracks.', error);

      return [];
    }
  };

  /**
   * Every archive in the results folder, newest first.
   * @returns The archives' file names
   */
  const archiveNames = async (): Promise<string[]> => {
    const names = await readdir(resultsDir).catch(() => [] as string[]);
    const shown = listed?.() ?? null;

    // The names are ISO timestamps, so sorting them descending is newest first
    // without stat-ing anything.
    return names.filter((name) => isArchiveName(name) && (shown?.has(name) ?? true)).sort().reverse();
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
      owner,
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
   * lives in settings; a race that names its own driver keeps it.
   * @param race The launch, already prepared
   * @returns The launch with its driver filled in
   */
  const withDriver = (race: RaceDefinition): RaceDefinition => {
    const { driverName } = settings.get();
    if (!driverName || race.playerCar.driver) return race;

    return { ...race, playerCar: { ...race.playerCar, driver: driverName } };
  };

  /**
   * Fills in the driving aids the player chose - a career's own, or else the
   * app's.
   *
   * The same arrangement `withDriver` uses, and for the same reason: aids belong
   * to the person playing, damage included, while fuel rate, tyre wear,
   * slipstream and tyre blankets are regulations and belong to the race. A race
   * naming any of them keeps it, field by field.
   * @param race The launch, already prepared
   * @param aids The aids the launch was asked to run with, if any
   * @returns The launch with its assists filled in
   */
  const withAssists = (race: RaceDefinition, aids?: DrivingAids): RaceDefinition => ({
    ...race,
    assists: { ...(aids ?? settings.get().drivingAids), ...defined(race.assists) },
  });

  /**
   * Names the controller a launch should run, and installs a plan when its
   * weather is meant to change.
   *
   * A race definition that names its own controller keeps it. Anything else
   * takes the controller from the weather system chosen in settings.
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
      // The sun follows the plan, so it has to open when the session does. And
      // both planners set the game's clock to the plan's own multiplier while it
      // plays - PURE on every update, Sol on loading it - so a plan left at one
      // would take a shortened race's clock back to real time.
      if (planner) {
        await installPlan(paths.acRoot, planner, {
          steps,
          startHour: parseClock(conditions.timeOfDay ?? DEFAULT_PLAN_HOUR),
          timeMultiplier: conditions.timeMultiplier ?? 1,
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
   * Gives the planner apps their own settings back, taking out any plan of ours.
   * @param acRoot The AC install root the planners live in
   * @returns Resolves once done; a failure is logged rather than thrown
   */
  const restorePlanners = async (acRoot: string): Promise<void> => {
    try {
      await removePlans(acRoot);
    } catch (error) {
      console.warn('Could not remove the generated weather plan.', error);
    }
  };

  /**
   * Ends the launch in flight and tells everyone.
   * @param failure Why it ended badly, or null when it did not
   * @returns Resolves once listeners have been told
   */
  const settle = async (failure: AppErrorInfo | null): Promise<void> => {
    // Every ending goes through here, so this is where the planner's own
    // settings are given back.
    if (paths) await restorePlanners(paths.acRoot);

    watching = null;
    status = {
      phase: 'idle', launchIndex: null, startedAt: null, scale: null, failure,
    };
    await emit();
  };

  /**
   * Waits for the result of the launch in flight, then records it.
   *
   * Detached from the call that started it, because a race takes as long as it
   * takes. Everything it changes reaches the renderer as a push.
   * @param plan The event being run
   * @param index Which launch is in flight
   * @param file The race_out.json to watch, as it was when the launch started
   * @param since Anything written at or before this is a previous result
   * @param signal Aborted when the user stops waiting
   * @param scale The factor the launch's race was shortened by
   * @returns Resolves once the result has been archived or given up on
   */
  const awaitResult = async (
    plan: EventPlan,
    index: number,
    file: string,
    since: number,
    signal: AbortSignal,
    scale: number,
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

    state = advanceEvent(plan, state ?? initEventState(plan), raceOut, {
      archive: path.basename(archived),
      completedAt: new Date().toISOString(),
      scale,
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
   * @param plan The event being run
   * @param index Which launch is in flight
   * @param file The race_out.json to watch, as it was when the launch started
   * @param since Anything written at or before this is a previous result
   * @param signal Aborted when the user stops waiting
   * @param scale The factor the launch's race was shortened by
   * @returns Resolves once the launch has been settled
   */
  const collect = async (
    plan: EventPlan,
    index: number,
    file: string,
    since: number,
    signal: AbortSignal,
    scale: number,
  ): Promise<void> => {
    try {
      await awaitResult(plan, index, file, since, signal, scale);
    } catch (error) {
      const failure = isAppError(error)
        ? error
        : new AppError('run.result.notRecorded', { reason: String(error) });
      console.error('Could not record the result of the launch.', error);
      await settle(failure.toInfo());
    }
  };

  /**
   * Forgets the event's progress.
   * @throws AppError when a launch is in flight
   */
  const empty = (): void => {
    if (status.phase !== 'idle') throw new AppError('run.inFlight');

    state = null;
    schedule();
  };

  return {
    use(next) {
      paths = next;
      // A different install has its own CSP config, and the probe re-runs
      // whenever the user changes an override.
      csp = null;
      // A launch the app was closed during never settled, so its plan may still
      // be installed.
      if (next && status.phase === 'idle') void restorePlanners(next.acRoot);
    },

    get: describe,

    scope(next, results, lists) {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');

      scopeOwner = next;
      resultsDir = results ?? ownResults;
      listed = lists ?? null;
    },

    // Deliberately off the draft and the event state rather than off a plan:
    // this is asked once per championship listing, and describe() reaches the
    // content scan.
    // Only the event of whoever the store is scoped to: a round another career
    // left part-way is not under way in this one.
    progress: () => (owner === scopeOwner ? progressOf(state, definition.id, status.phase !== 'idle') : null),

    weatherFx: async () => (await cspSetup()).weatherFx,

    async load(next, completed) {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');

      definition = next;
      owner = scopeOwner;
      state = null;
      if (completed.length > 0) {
        // The launch count is the plan's, which is what a saved state is
        // matched against; an event that no longer plans starts over.
        try {
          const plan = planEvent(definition, await content.content());
          state = { raceId: plan.raceId, launchCount: plan.launches.length, completed: [...completed] };
        } catch (error) {
          if (!isAppError(error)) throw error;
        }
      }
      schedule();

      return describe();
    },

    async launch(options = {}) {
      if (status.phase !== 'idle') throw new AppError('run.inFlight');
      if (!paths) throw new AppError('paths.unresolved');

      const installed = await content.content();
      const problems = validateRace(definition, installed);
      const plan = await planned(problems);
      if (!plan) throw new AppError('run.notPlanned');

      const progress = reconciled(plan) ?? initEventState(plan);
      state = progress;

      const launch = nextLaunch(plan, progress);
      if (!launch) throw new AppError('event.complete', { race: plan.raceName });

      // Shortened before anything is written, so a step the launch cannot take
      // is refused while nothing of the planner's is ours yet.
      const scale = options.scale ?? 1;
      const launched = scaleLaunch(prepareLaunch(plan, progress, launch.index), scale);

      // From here on the planner's own settings may already be ours, so every
      // way out has to give them back - a race that failed to start must not
      // leave PURE pointed at our plan.
      let raceIni: string;
      let assists: string;
      try {
        const prepared = await withWeatherSystem(withAssists(withDriver(launched), options.aids));
        raceIni = buildRaceIni(prepared, installed);
        // Sent on every launch, never omitted: with no assistsData at all,
        // Content Manager applies whatever its own Quick Drive last held, which
        // is a wrong answer that reports nothing.
        assists = assistsPresetJson(prepared.assists);
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
        scale,
        failure: null,
      };
      await emit();

      // Anything written at or before this point is a previous session's result.
      const since = Date.now();
      try {
        await launchUri(
          paths.contentManager,
          buildRaceUri(raceIni, { assistsPreset: assists }),
        );
      } catch (error) {
        await settle(null);
        throw error;
      }

      watching = new AbortController();
      status = { ...status, phase: 'waiting' };
      // Pushed as well as returned, so every status move reaches listeners the
      // same way.
      await emit();
      void collect(plan, launch.index, paths.raceOut, since, watching.signal, scale);

      return describe();
    },

    async cancel() {
      if (!watching) throw new AppError('run.notLaunched');

      watching.abort();
      await settle(null);

      return describe();
    },

    empty,

    slot: () => (state && state.completed.length > 0
      ? { owner, raceId: state.raceId, completed: state.completed }
      : null),

    async reset() {
      empty();

      return describe();
    },

    async results() {
      const newest = (await archiveNames()).slice(0, MAX_LISTED_RESULTS);
      const records = await Promise.all(
        newest.map((name) => readRecord(name, path.join(resultsDir, name))),
      );
      const tracks = await installedTracks();

      return records
        .filter((record): record is ResultRecord => record !== null)
        .map((record) => withLayout(record, tracks));
    },

    async latest() {
      const names = await archiveNames();
      const records: ResultRecord[] = [];
      // One at a time, newest first, stopping at the first archive of another
      // event: the newest event is all the preview shows.
      for (const name of names.slice(0, MAX_LATEST_ARCHIVES)) {
        const record = await readRecord(name, path.join(resultsDir, name));
        if (record) {
          if (records.length > 0 && !sameEvent(records[0], record)) break;
          records.push(record);
        }
      }
      const tracks = records.length > 0 ? await installedTracks() : [];

      return { records: records.map((record) => withLayout(record, tracks)), sessions: names.length };
    },

    async result(file) {
      if (!isArchiveName(file)) throw new AppError('run.result.notFound', { file });

      const record = await readRecord(file, path.join(resultsDir, file));
      if (!record) throw new AppError('run.result.notFound', { file });

      return withLayout(record, await installedTracks());
    },

    async launchResults(records) {
      const results = await Promise.all(records.map(async (record): Promise<LaunchResult | null> => {
        if (!record.archive || !isArchiveName(record.archive)) return null;

        try {
          const text = await readFile(path.join(resultsDir, record.archive), 'utf8');
          const raceOut = (JSON.parse(text) as { result?: RaceOut }).result;

          return raceOut ? { launch: record.index, raceOut } : null;
        } catch (error) {
          console.warn(`Could not read the archived result ${record.archive}.`, error);

          return null;
        }
      }));

      return results.filter((one) => one !== null);
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
