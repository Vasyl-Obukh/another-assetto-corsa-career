import type { QuickRaceFile } from './types.ts';
import type {
  QuickRace, QuickRaceArchives, QuickRacePhase, QuickRaceView, Track,
} from '../../shared/types/index.ts';
import { QUICK_RACE_VERSION } from '../../shared/utils/quick-race/index.ts';

/**
 * What a quick race goes by: its own name, or its layout's when it has none.
 * @param race The race
 * @param tracks Every installed layout
 * @returns The title, empty when it has neither a name nor a track yet
 */
export const titleOf = (race: QuickRace, tracks: readonly Track[]): string => {
  const own = race.name?.trim();
  if (own) return own;
  if (!race.track) return '';

  const { id, layout } = race.track;

  return tracks.find((one) => one.id === id && one.layout === (layout ?? ''))?.name ?? id;
};

/**
 * Which archives a quick race's launches wrote, off its file alone.
 *
 * A simulated launch archived nothing, so it counts as run and lists no
 * archive.
 * @param file What is kept of the race
 * @param title What it goes by
 * @returns The race, as the Results page links to it
 */
export const archivesOf = ({ race, completed }: QuickRaceFile, title: string): QuickRaceArchives => ({
  id: race.id,
  title,
  sessions: race.sessions.length,
  run: completed.length,
  classes: race.classes.map(({ id, name }) => ({ id, name })),
  launches: completed.flatMap((launch) => (launch.archive ? [{
    ...launch,
    name: race.sessions[launch.index]?.name ?? null,
  }] : [])),
});

/**
 * Where a quick race is up to.
 * @param completed How many of its launches have run
 * @param launches How many it plans, or null when it cannot be planned
 * @param inFlight Whether a launch of it is with Content Manager now
 * @returns Its phase
 */
export const phaseOf = (completed: number, launches: number | null, inFlight: boolean): QuickRacePhase => {
  if (completed === 0 && !inFlight) return 'setup';

  return launches !== null && completed >= launches && !inFlight ? 'finished' : 'running';
};

/**
 * Reads a quick race file, tolerating whatever a hand edit made of it.
 *
 * Only the shape is checked - anything that lowers badly is reported as a
 * problem on the race rather than refused here - and a file written at another
 * version is skipped, as every other format is before the first release.
 * @param value What the file parsed to
 * @returns The race and its progress, or null when the file is not one
 */
export const readQuickFile = (value: unknown): QuickRaceFile | null => {
  if (typeof value !== 'object' || value === null) return null;

  const { race, completed } = value as Partial<QuickRaceFile>;
  if (typeof race !== 'object' || race === null) return null;
  if (race.version !== QUICK_RACE_VERSION || typeof race.id !== 'string') return null;
  if (!Array.isArray(race.classes) || !Array.isArray(race.sessions)) return null;

  return { race, completed: Array.isArray(completed) ? completed : [] };
};

/**
 * The order the Race tab lists races in: the ones part-way first, then the
 * latest changed.
 * @param left One race
 * @param right Another
 * @returns Negative when the first lists first
 */
export const byRecency = (left: QuickRaceView, right: QuickRaceView): number => (
  Number(right.phase === 'running') - Number(left.phase === 'running')
  || right.race.updatedAt.localeCompare(left.race.updatedAt)
);
