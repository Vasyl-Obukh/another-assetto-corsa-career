import { readFile, rename, writeFile } from 'node:fs/promises';

import { ARCHIVE_NAME } from './constants.ts';
import type { RaceProgress } from './types.ts';
import { isQuickRaceId } from '../../core/quick-race/index.ts';
import { summarise } from '../../core/results/index.ts';
import { baseRaceId } from '../../core/series/index.ts';
import type {
  EventState, RaceDefinition, RaceOut, RaceSetup, ResultRecord, Track,
} from '../../shared/types/index.ts';

/**
 * Reads a JSON file, treating anything unreadable as absent.
 *
 * Tolerant on purpose, and for the same reason the settings store is: a draft
 * race the user hand-edited into nonsense must not be the reason the app
 * refuses to open a screen.
 * @param file Absolute path to the file
 * @returns The parsed value, or null when it could not be read
 */
export const readJson = async <T>(file: string): Promise<T | null> => {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Could not read ${file}; ignoring it.`, error);
    }

    return null;
  }
};

/**
 * Writes a JSON file through a temporary name, so a crash cannot truncate it.
 * @param file Absolute path to write to
 * @param value The value to serialise
 * @returns Resolves once the file is in place, or once the failure is logged
 */
export const writeJson = async (file: string, value: unknown): Promise<void> => {
  const tmp = `${file}.tmp`;
  try {
    await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await rename(tmp, file);
  } catch (error) {
    console.error(`Could not save ${file}.`, error);
  }
};

/**
 * Whether a name is one of our archives rather than a path.
 *
 * Checked before the name is joined onto the results folder, so a crafted
 * request cannot reach outside it. The archive names archiveResults writes are
 * ISO timestamps with the colons and dots replaced, so the alphabet is narrow.
 * @param file The name to check
 * @returns True when it is safe to join
 */
export const isArchiveName = (file: string): boolean => ARCHIVE_NAME.test(file);

/**
 * Reads an archive into the record the results screen renders.
 *
 * The envelope is `{ recordedAt, raceId, raceName, result }`; a file holding a
 * bare race_out.json is read as the payload itself, which is what AC's own
 * out/race_out.json is.
 * @param file The archive's file name, without its folder
 * @param full Absolute path to it
 * @returns The record, or null when the file held no usable result
 */
export const readRecord = async (file: string, full: string): Promise<ResultRecord | null> => {
  const parsed = await readJson<Record<string, unknown>>(full);
  if (!parsed) return null;

  const wrapped = parsed.result as RaceOut | undefined;
  const result = wrapped ?? (parsed as unknown as RaceOut);
  if (!Array.isArray(result.sessions)) return null;

  return {
    file,
    // The file name is the timestamp, so a hand-copied archive with no envelope
    // still sorts and dates correctly.
    recordedAt: (parsed.recordedAt as string | undefined) ?? file.replace(/\.json$/, ''),
    ...(typeof parsed.raceId === 'string' ? { raceId: parsed.raceId } : {}),
    ...(typeof parsed.raceName === 'string' ? { raceName: parsed.raceName } : {}),
    summary: summarise(result),
  };
};

/**
 * How far through an event the app is, or null when none is under way.
 *
 * The whole of the series editor's lock. An event that has run every launch
 * is finished rather than under way, even though its state stays on disk until
 * a reset or a different race replaces it.
 * @param state The event's saved progress, or null when there is none
 * @param raceId What to call the race when there is no state to name it
 * @param inFlight Whether a launch is with Content Manager right now
 * @returns The progress, or null when nothing has started, everything has
 * finished, or both
 */
export const progressOf = (
  state: EventState | null,
  raceId: string,
  inFlight: boolean,
): RaceProgress | null => {
  const completed = state?.completed.length ?? 0;
  const finished = state !== null && completed >= state.launchCount;
  if (!inFlight && (completed === 0 || finished)) return null;

  return { raceId: state?.raceId ?? raceId, completed, inFlight };
};

/**
 * Whether the slot already holds an event exactly as far as it has run, so its
 * next launch can carry on from the race the slot holds.
 *
 * Never before its first launch: whatever set the slot up then may since have
 * been edited, or had its forecast issued, and the race has to be the one the
 * event now says.
 * @param setup The race store as it stands
 * @param raceId The event's race id
 * @param completed How many of its launches have run
 * @param owner Whose event it is: a career's id, or null for a race event of
 * the player's own - two careers can race a round under the same id
 * @returns True when launching can carry on from the slot's race
 */
export const slotHolds = (
  setup: RaceSetup,
  raceId: string,
  completed: number,
  owner: string | null,
): boolean => (
  completed > 0
  && setup.owner === owner
  && setup.definition.id === raceId
  && (setup.state?.completed.length ?? 0) === completed
);

/**
 * The race an event part-way through was set up with, its AI levels taken from
 * the same event lowered afresh - which is how the difficulty and the player's
 * own steps reach its next session while its weather, its grip and its field
 * stay what the event started with.
 * @param held The race the slot holds
 * @param fresh The same event, lowered again now
 * @returns The held race with each AI seat's levels, and each class's strength,
 * as they now are
 */
export const withLevelsOf = (held: RaceDefinition, fresh: RaceDefinition): RaceDefinition => {
  const levels = new Map((fresh.grid?.opponents ?? [])
    .flatMap((car) => (car.seat === undefined ? [] : [[car.seat, car]])));
  const opponents = held.grid?.opponents?.map((car) => {
    const now = car.seat === undefined ? undefined : levels.get(car.seat);

    return now ? { ...car, aiLevel: now.aiLevel, aiAggression: now.aiAggression } : car;
  });

  return {
    ...held,
    ...(held.grid && opponents ? { grid: { ...held.grid, opponents } } : {}),
    ...(fresh.classStrength ? { classStrength: fresh.classStrength } : {}),
    ...(fresh.aiBase === undefined ? {} : { aiBase: fresh.aiBase }),
  };
};

/**
 * A result with the layout it ran on, found among the installed tracks.
 *
 * AC records the track as its folder and layout joined by a hyphen, which
 * cannot be split back apart - folders hold hyphens of their own - so it is
 * matched against what is installed instead.
 * @param record The result
 * @param tracks Every installed layout
 * @returns The result, with its layout when one matches
 */
export const withLayout = (record: ResultRecord, tracks: readonly Track[]): ResultRecord => {
  const ran = tracks.find((track) => (track.layout ? `${track.id}-${track.layout}` : track.id) === record.summary.track);

  return ran ? { ...record, layout: { id: ran.id, layout: ran.layout, name: ran.name } } : record;
};

/**
 * Whether two archives are sessions of one event.
 *
 * A career round's race id names its run, and a race event of the player's own
 * is one event however many days it ran over, so both are one event per id.
 * Anything else - a hand-written race, or an archive from before ids named
 * runs - is one event per race and per day, the way the Results page gathers
 * them.
 * @param first One archive
 * @param other The other
 * @returns True when both belong to the same event
 */
export const sameEvent = (first: ResultRecord, other: ResultRecord): boolean => {
  const name = first.raceId ?? first.raceName;
  if (name === undefined || name !== (other.raceId ?? other.raceName)) return false;
  if (first.raceId !== undefined && (baseRaceId(first.raceId) !== first.raceId || isQuickRaceId(first.raceId))) {
    return true;
  }

  return first.recordedAt.slice(0, 10) === other.recordedAt.slice(0, 10);
};
