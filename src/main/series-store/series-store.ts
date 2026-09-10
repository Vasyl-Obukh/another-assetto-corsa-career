// The championship library, loaded from disk and answered from memory, plus the
// commands that write the user's half of it.
//
// Two rules run through all of it. A championship is found by the id inside the
// document and written by the name of the file it came from, because the two
// are allowed to disagree - `weird.json` may hold `lotus-cup`, and a name
// computed from the id would touch the wrong file. And no command ever writes
// over a file the user wrote: the only thing a write may replace is a
// championship the app ships, which reverting undoes.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SERIES_DIR } from './constants.ts';
import type { SeriesStore } from './types.ts';
import { roundRace, seriesAvailability, validateSeries } from '../../core/series/index.ts';
import { readSeries, writeSeries } from '../../core/series-file/index.ts';
import {
  deleteUserSeries,
  freeSeriesFileName,
  loadSeriesLibrary,
  nextSeriesId,
  saveUserSeries,
  seriesById,
  takenSeriesIds,
} from '../../core/series-library/index.ts';
import type { LoadedLibrary, LoadedSeries } from '../../core/series-library/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { ErrorCode } from '../../shared/errors/index.ts';
import type {
  Championship,
  Content,
  IpcRequest,
  RaceSetup,
  SeriesCommandResult,
  SeriesLibrary,
  SeriesListing,
  SeriesOrigin,
} from '../../shared/types/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';

export type { SeriesStore } from './types.ts';

/**
 * Says on the console what would not load.
 *
 * The renderer shows the same problems on the championships screen; this is so
 * a broken file is visible from a terminal too, and after a reload as well as
 * at startup.
 * @param loaded The library as it was just read
 */
const warnProblems = (loaded: LoadedLibrary): void => {
  if (loaded.problems.length === 0) return;

  console.warn(`${loaded.problems.length} championship file(s) could not be read.`);
  loaded.problems.forEach((problem) => console.warn(`  ${problem.message}`));
};

/**
 * Loads the championship library and returns a store over it.
 * @param userDataDir Folder the user's own championships live under
 * @param content The content store, for what is installed
 * @param race The race store, which takes a lowered round
 * @returns A store holding the loaded library
 */
export const createSeriesStore = async (
  userDataDir: string,
  content: ContentStore,
  race: RaceStore,
): Promise<SeriesStore> => {
  // The app's own are compiled in; only the user's are read from disk.
  const userDir = path.join(userDataDir, SERIES_DIR);

  let library: LoadedLibrary = await loadSeriesLibrary(userDir);
  warnProblems(library);

  const listeners = new Set<(next: SeriesLibrary) => void>();

  /**
   * Describes one loaded championship for the renderer.
   * @param one The championship and where it came from
   * @param installed What content the library has
   * @returns The listing
   */
  const listing = (one: LoadedSeries, installed: Content): SeriesListing => ({
    series: one.series,
    availability: seriesAvailability(one.series, installed),
    origin: one.origin,
  });

  /**
   * Everything the library holds, with availability worked out afresh.
   * @returns The library
   */
  const list = async (): Promise<SeriesLibrary> => {
    const installed = await content.content();

    return {
      series: library.series.map((one) => listing(one, installed)),
      problems: library.problems,
    };
  };

  /**
   * Finds one championship, or says which one it could not find.
   * @param id The championship's id
   * @returns It, with its origin and the file it came from
   * @throws When the library holds no championship with that id
   */
  const held = (id: string): LoadedSeries => {
    const found = seriesById(library, id);
    if (!found) throw new AppError('series.notFound', { series: id });

    return found;
  };

  /**
   * Insists a championship came from where a command needs it to have.
   * @param found The championship
   * @param origin Where it has to have come from
   * @param code What to raise when it did not
   * @throws When the origin is not the one wanted
   */
  const insistOrigin = (found: LoadedSeries, origin: SeriesOrigin, code: ErrorCode): void => {
    if (found.origin !== origin) throw new AppError(code, { series: found.series.id });
  };

  /**
   * Reads the directory again and tells everyone what it now holds.
   *
   * Every command ends here, and it is one list() rather than two: that call
   * reaches into the content store, which rejects while the Assetto Corsa
   * install is unlocated, so building the push separately would leave a
   * rejection with nobody to catch it.
   * @param id The championship the command leaves the user looking at
   * @returns What the command answers with
   */
  const settle = async (id: string | null): Promise<SeriesCommandResult> => {
    library = await loadSeriesLibrary(userDir);
    warnProblems(library);

    const next = await list();
    listeners.forEach((listener) => listener(next));

    return { library: next, id };
  };

  /**
   * Every id something already spends a name on.
   *
   * The loaded ids and the directory's own file stems, because a file that
   * failed to parse appears in neither the library nor in anything it is safe
   * to write over.
   * @returns The ids, lower-cased
   */
  const taken = async (): Promise<Set<string>> => {
    const ids = await takenSeriesIds(userDir);
    library.series.forEach((one) => ids.add(one.series.id.toLowerCase()));

    return ids;
  };

  /**
   * Deletes the user's file for one championship, once it is theirs to delete.
   *
   * Revert and delete are the same write with different guards and different
   * sentences, which is why they are two commands over one helper.
   * @param id The championship's id
   * @param origin Where it has to have come from
   * @param code What to raise when it did not
   * @param looking What the caller is left looking at
   * @returns What the command answers with
   */
  const removeFile = async (
    id: string,
    origin: SeriesOrigin,
    code: ErrorCode,
    looking: string | null,
  ): Promise<SeriesCommandResult> => {
    const found = held(id);
    insistOrigin(found, origin, code);
    // Non-null by the guard above: only a shipped championship has no file.
    await deleteUserSeries(userDir, found.file as string, id);

    return settle(looking);
  };

  return {
    list,

    async get(id) {
      const found = seriesById(library, id);
      if (!found) return null;

      return listing(found, await content.content());
    },

    async setupRound(request: IpcRequest<'series:setupRound'>): Promise<RaceSetup> {
      const found = seriesById(library, request.series);
      if (!found) throw new AppError('series.notFound', { series: request.series });

      const definition = roundRace({
        series: found.series,
        entry: request.entry,
        round: request.round,
        car: request.car,
      }, await content.content());

      return race.set(definition);
    },

    async customise(id) {
      const found = held(id);
      insistOrigin(found, 'shipped', 'series.notShipped');

      // A free name rather than `<id>.json`, because that name may already be
      // spent by a file of the user's holding a different id - names and ids
      // are allowed to disagree, so writing to the derived one would destroy
      // it. The id is untouched, which is what revert rests on.
      // No forkedFrom: this is the app's own championship adjusted rather than
      // a fork of it, and an id pointing at itself would say nothing.
      await saveUserSeries(userDir, found.series, freeSeriesFileName(id, await taken()));

      return settle(id);
    },

    async duplicate(id, name) {
      const found = held(id);
      const free = await taken();
      const copy: Championship = {
        ...found.series,
        id: nextSeriesId(found.series.id, free),
        ...(name ? { name } : {}),
        forkedFrom: found.series.id,
      };

      await saveUserSeries(userDir, copy, freeSeriesFileName(copy.id, free));

      return settle(copy.id);
    },

    // Reverting leaves the shipped championship at the same id; deleting leaves
    // nothing, so the caller is left looking at nothing.
    revert: (id) => removeFile(id, 'adjusted', 'series.notAdjusted', id),

    remove: (id) => removeFile(id, 'user', 'series.notDeletable', null),

    async importFrom(file) {
      const read = readSeries(await readFile(file, 'utf8'), path.basename(file));
      if (!read.series) {
        return { library: await list(), id: null, problems: read.problems };
      }

      // Taking over a shipped id is the point rather than a collision: it is
      // how "here is my adjusted Formula 1" arrives, and reverting undoes it in
      // one click. A file the user wrote is never written over, so that one is
      // renamed instead - which delete undoes just as cheaply.
      const existing = seriesById(library, read.series.id);
      const clash = existing !== null && existing.origin !== 'shipped';
      const free = await taken();
      const imported: Championship = clash
        ? { ...read.series, id: nextSeriesId(read.series.id, free) }
        : read.series;

      await saveUserSeries(userDir, imported, freeSeriesFileName(imported.id, free));
      const settled = await settle(imported.id);

      return {
        library: settled.library,
        id: imported.id,
        // Reported rather than refused: a championship the app will not accept
        // is one the user cannot fix, and the misconfigured badge makes letting
        // it in safe.
        problems: validateSeries(imported),
      };
    },

    async exportTo(id, file) {
      const text = writeSeries(held(id).series);
      try {
        // No temp file and rename here, unlike a write into our own folder:
        // the save dialog has already confirmed any overwrite, and stranding a
        // stray .tmp in someone else's folder is worse.
        await writeFile(file, text, 'utf8');
      } catch (error) {
        throw new AppError('seriesFile.writeFailed', {
          series: id, reason: (error as Error).message,
        });
      }
    },

    async reload() {
      library = await loadSeriesLibrary(userDir);
      warnProblems(library);
    },

    onChange(listener) {
      listeners.add(listener);

      return () => { listeners.delete(listener); };
    },
  };
};
