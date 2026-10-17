import { fake } from './fake.ts';
import { AppError } from '../../../shared/errors/index.ts';
import type {
  LaunchRecord, RaceDefinition, RaceSetup,
} from '../../../shared/types/index.ts';
import type { RaceProgress, RaceStore } from '../../race-store/index.ts';

/**
 * A race store holding one event in memory, with the controls a test moves it
 * by.
 */
export interface FakeRaceStore extends RaceStore {
  /**
   * Says how far the event in the slot has got, and whether a launch is out.
   * @param progress The progress, or null for none
   */
  setProgress(progress: RaceProgress | null): void;
  /**
   * Pushes a state to everyone listening, as a launch landing does.
   * @param setup The race store's state
   */
  push(setup: RaceSetup): void;
  /**
   * Every race loaded into the slot, and what of it had run, in order.
   */
  loaded: { definition: RaceDefinition; completed: readonly LaunchRecord[] }[];
  /**
   * How many launches were sent out, and at which step each was shortened by.
   */
  launches: (number | undefined)[];
  /**
   * Whether Results would list an archive, by the filter the store was last
   * scoped with.
   * @param archive The archive's file name
   * @returns True when it is listed
   */
  lists(archive: string): boolean;
}

/**
 * The state a race store pushes, holding only what a store reads of it.
 * @param over What the test wants it to say
 * @returns The state
 */
export const raceSetup = (over: Partial<RaceSetup> = {}): RaceSetup => ({
  definition: { id: '' } as RaceDefinition,
  plan: null,
  state: null,
  status: {
    phase: 'idle', launchIndex: null, startedAt: null, scale: null,
  },
  problems: [],
  ...over,
} as RaceSetup);

/**
 * A race store with an empty slot and nothing archived.
 * @returns The store
 */
export const fakeRaceStore = (): FakeRaceStore => {
  let setup = raceSetup();
  let progress: RaceProgress | null = null;
  let owner: string | null = null;
  let listed: (() => ReadonlySet<string> | null) | null = null;
  const listeners = new Set<(next: RaceSetup) => void>();
  const loaded: FakeRaceStore['loaded'] = [];
  const launches: FakeRaceStore['launches'] = [];

  return fake<FakeRaceStore>('race', {
    get: async () => setup,
    // Refuses while a launch is out, and owns whatever is loaded next, as the
    // real store does.
    scope: (next, results, lists) => {
      if (setup.status.phase !== 'idle') throw new AppError('run.inFlight');
      owner = next;
      listed = lists ?? null;
    },
    load: async (definition, completed) => {
      loaded.push({ definition, completed });
      setup = raceSetup({ definition, owner });

      return setup;
    },
    launch: async (options) => {
      launches.push(options?.scale);

      return setup;
    },
    empty: () => {
      if (setup.status.phase !== 'idle') throw new AppError('run.inFlight');
      setup = { ...setup, state: null };
    },
    slot: () => (setup.state && setup.state.completed.length > 0
      ? { owner: setup.owner, raceId: setup.state.raceId, completed: setup.state.completed }
      : null),
    progress: () => progress,
    launchResults: async () => [],
    onChange: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    setProgress: (next) => { progress = next; },
    push: (next) => {
      setup = next;
      listeners.forEach((listener) => listener(next));
    },
    loaded,
    launches,
    lists: (archive) => listed?.()?.has(archive) ?? true,
  });
};
