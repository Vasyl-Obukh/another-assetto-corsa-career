// Every race weekend of the player's own. Each is a file of its own under the
// race folder, holding the race and what of it has run.
//
// None of them is run here. Launching one puts it in the race store's slot,
// with what of it has run, and launches from there; each launch that lands is
// copied back the moment the race store says so - the same arrangement the
// career keeps with its rounds. So any number of them can be part-way at once.

import { randomUUID } from 'node:crypto';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

import { EMIT_DEBOUNCE_MS, QUICK_DIR, WRITE_DEBOUNCE_MS } from './constants.ts';
import type { QuickRaceFile, QuickRaceStore } from './types.ts';
import {
  byRecency, phaseOf, readQuickFile, titleOf,
} from './utils.ts';
import {
  lowerQuickRace, QUICK_ROUND, quickChampionship, quickProblems, quickRaceId,
} from '../../core/quick-race/index.ts';
import { validateRace } from '../../core/race-ini/index.ts';
import { scoreRound } from '../../core/season-scoring/index.ts';
import { planWeekend } from '../../core/weekend/index.ts';
import { AppError, isAppError } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  QuickRace, QuickRaceView, RaceDefinition, RaceSetup, RoundScore, WeekendPlan,
} from '../../shared/types/index.ts';
import { newQuickRace } from '../../shared/utils/quick-race/index.ts';
import { eventSessions } from '../career-store/index.ts';
import type { ClassStore } from '../class-store/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import {
  RACE_DIR, readJson, slotHolds, writeJson,
} from '../race-store/index.ts';
import type { SeriesStore } from '../series-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';

export type { QuickRaceStore } from './types.ts';

/**
 * Loads every quick race and returns a store over them.
 * @param userDataDir Folder the race folder is in
 * @param content The scan a race is lowered against
 * @param classes The class catalogue a class's grid resolves against
 * @param series The weather offer a race is generated over
 * @param settings The player's difficulty, which a field is laid over
 * @param race The store that runs a launch
 * @returns The store
 */
export const createQuickRaceStore = async (
  userDataDir: string,
  content: ContentStore,
  classes: ClassStore,
  series: SeriesStore,
  settings: SettingsStore,
  race: RaceStore,
): Promise<QuickRaceStore> => {
  const dir = path.join(userDataDir, RACE_DIR, QUICK_DIR);
  const races = new Map<string, QuickRaceFile>();

  const names = await readdir(dir).catch(() => [] as string[]);
  await Promise.all(names.filter((name) => name.endsWith('.json')).map(async (name) => {
    const held = readQuickFile(await readJson<unknown>(path.join(dir, name)));
    if (held) races.set(held.race.id, held);
  }));

  const listeners = new Set<(views: QuickRaceView[]) => void>();
  const timers = new Map<string, NodeJS.Timeout>();
  const writes = new Map<string, Promise<void>>();
  // Scoring reads every launch's archive, so a score is kept until the race
  // runs another launch.
  const scores = new Map<string, { count: number; score: RoundScore }>();

  /**
   * Writes one race's file.
   * @param id The race
   * @returns Resolves once written
   */
  const write = async (id: string): Promise<void> => {
    const held = races.get(id);
    if (!held) return;
    await mkdir(dir, { recursive: true });
    await writeJson(path.join(dir, `${id}.json`), held);
  };

  /**
   * Writes one race's file soon, coalescing a burst of edits into one write.
   * @param id The race
   */
  const schedule = (id: string): void => {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      writes.set(id, write(id));
    }, WRITE_DEBOUNCE_MS));
  };

  /**
   * One race, or a refusal naming the id.
   * @param id The race
   * @returns What is kept of it
   * @throws AppError when there is none
   */
  const held = (id: string): QuickRaceFile => {
    const found = races.get(id);
    if (!found) throw new AppError('quick.notFound', { race: id });

    return found;
  };

  /**
   * Whether a launch of a race is with Content Manager now.
   * @param setup The race store as it stands
   * @param id The race
   * @returns True when it is
   */
  const flying = (setup: RaceSetup, id: string): boolean => (
    setup.status.phase !== 'idle' && setup.definition.id === quickRaceId(held(id).race)
  );

  /**
   * Lowers a race and plans it, folding anything that objects into the
   * problems rather than throwing.
   * @param quick The race
   * @param title What it goes by
   * @param problems The list to add to
   * @returns The race it launches as and its plan, either null when it cannot
   */
  const planned = async (
    quick: QuickRace,
    title: string,
    problems: AppErrorInfo[],
  ): Promise<{ definition: RaceDefinition | null; plan: WeekendPlan | null }> => {
    const installed = await content.content();
    const catalogue = classes.catalogue();
    problems.push(...quickProblems(quick, installed, catalogue));
    if (problems.length > 0) return { definition: null, plan: null };

    try {
      const definition = lowerQuickRace(
        quick,
        title,
        installed,
        catalogue,
        await series.offer(),
        settings.get().opponents,
      );
      problems.push(...validateRace(definition, installed));
      if (problems.length > 0) return { definition, plan: null };

      return { definition, plan: planWeekend(definition, installed) };
    } catch (error) {
      if (!isAppError(error)) throw error;
      problems.push(error.toInfo());

      return { definition: null, plan: null };
    }
  };

  /**
   * One race as its page and its card show it.
   * @param file What is kept of it
   * @param setup The race store as it stands
   * @returns The view
   */
  const view = async ({ race: quick, completed }: QuickRaceFile, setup: RaceSetup): Promise<QuickRaceView> => {
    const { tracks } = await content.content();
    const title = titleOf(quick, tracks);
    const problems: AppErrorInfo[] = [];
    const { plan } = await planned(quick, title, problems);
    const championship = quickChampionship(quick, title);
    const mine = setup.definition.id === quickRaceId(quick);
    const inFlight = mine && setup.status.phase !== 'idle';
    const phase = phaseOf(completed.length, plan?.launches.length ?? null, inFlight);

    let score: RoundScore | null = null;
    if (plan && completed.length > 0) {
      const kept = scores.get(quick.id);
      if (kept?.count === completed.length) {
        score = kept.score;
      } else {
        const state = { raceId: plan.raceId, launchCount: plan.launches.length, completed: [...completed] };
        score = scoreRound(
          championship,
          QUICK_ROUND,
          plan,
          state,
          await race.launchResults(completed),
          completed[completed.length - 1].completedAt,
        );
        scores.set(quick.id, { count: completed.length, score });
      }
    }

    return {
      race: quick,
      title,
      championship,
      plan,
      sessions: plan ? eventSessions(
        plan,
        quick.sessions,
        completed,
        null,
        false,
        quick.createdAt.slice(0, 10),
        score ?? undefined,
        plan.grid[0]?.seat ?? null,
        phase !== 'finished',
      ) : [],
      grid: plan?.grid ?? [],
      score,
      problems,
      phase,
      status: mine ? setup.status : null,
      lastRaced: completed.at(-1)?.completedAt ?? null,
    };
  };

  /**
   * Every race's view, in listing order.
   * @returns The views
   */
  const views = async (): Promise<QuickRaceView[]> => {
    const setup = await race.get();

    return (await Promise.all([...races.values()].map((one) => view(one, setup)))).sort(byRecency);
  };

  /**
   * Tells everyone watching what every race now says.
   * @returns Resolves once told, or once the failure is logged
   */
  const emit = async (): Promise<void> => {
    if (listeners.size === 0) return;

    try {
      const all = await views();
      for (const listener of listeners) listener(all);
    } catch (error) {
      console.warn('Could not describe the race weekends.', error);
    }
  };

  let announcing: NodeJS.Timeout | null = null;

  /**
   * Tells everyone watching once a burst of changes has settled: the page saves
   * on every keystroke, and every push plans every race over again.
   */
  const announce = (): void => {
    if (announcing) clearTimeout(announcing);
    announcing = setTimeout(() => {
      announcing = null;
      void emit();
    }, EMIT_DEBOUNCE_MS);
  };

  /**
   * Keeps a race and tells everyone.
   * @param file The race and its progress
   * @returns Its view
   */
  const keep = async (file: QuickRaceFile): Promise<QuickRaceView> => {
    races.set(file.race.id, file);
    schedule(file.race.id);
    announce();

    return view(file, await race.get());
  };

  // A launch that lands is copied onto its race, the same way the career keeps
  // its rounds; and a launch starting or ending changes what a race's page says.
  race.onChange((setup) => {
    const { plan, state } = setup;
    const found = [...races.values()].find(({ race: one }) => quickRaceId(one) === setup.definition.id);
    if (!found) return;

    if (plan && state && setup.status.phase === 'idle' && state.completed.length > found.completed.length) {
      races.set(found.race.id, {
        race: { ...found.race, updatedAt: new Date().toISOString() },
        completed: [...state.completed],
      });
      schedule(found.race.id);
    }
    announce();
  });

  return {
    list: views,

    get: async (id) => view(held(id), await race.get()),

    create: async () => {
      const now = new Date().toISOString();

      return keep({ race: newQuickRace(randomUUID(), now), completed: [] });
    },

    async save(next) {
      const found = held(next.id);
      if (flying(await race.get(), next.id)) throw new AppError('run.inFlight');
      if (found.completed.length > 0) {
        const { tracks } = await content.content();
        throw new AppError('quick.started', { race: titleOf(found.race, tracks) });
      }

      return keep({
        race: {
          ...next, version: found.race.version, createdAt: found.race.createdAt, updatedAt: new Date().toISOString(),
        },
        completed: [],
      });
    },

    async duplicate(id) {
      const { race: original } = held(id);
      const now = new Date().toISOString();

      return keep({
        race: {
          ...structuredClone(original), id: randomUUID(), createdAt: now, updatedAt: now,
        },
        completed: [],
      });
    },

    async remove(id) {
      held(id);
      if (flying(await race.get(), id)) throw new AppError('run.inFlight');

      const timer = timers.get(id);
      if (timer) clearTimeout(timer);
      timers.delete(id);
      races.delete(id);
      scores.delete(id);
      await writes.get(id);
      writes.delete(id);
      await rm(path.join(dir, `${id}.json`), { force: true });
      announce();
    },

    async launch(id) {
      const found = held(id);
      const { tracks } = await content.content();
      const problems: AppErrorInfo[] = [];
      const { definition, plan } = await planned(found.race, titleOf(found.race, tracks), problems);
      if (!definition || !plan) {
        const first = problems[0];
        throw first ? new AppError(first.code, first.params) : new AppError('run.notPlanned');
      }

      // Carries on from its own last launch, whatever raced in between.
      if (!slotHolds(await race.get(), definition.id, found.completed.length)) {
        await race.load(definition, found.completed);
      }

      return view(found, await race.launch());
    },

    async restart(id) {
      const found = held(id);
      const setup = await race.get();
      if (flying(setup, id)) throw new AppError('run.inFlight');
      if (setup.definition.id === quickRaceId(found.race)) await race.reset();

      scores.delete(id);

      return keep({ race: { ...found.race, updatedAt: new Date().toISOString() }, completed: [] });
    },

    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async flush() {
      if (announcing) clearTimeout(announcing);
      timers.forEach((timer, id) => {
        clearTimeout(timer);
        writes.set(id, write(id));
      });
      timers.clear();
      await Promise.all(writes.values());
    },
  };
};
