// The championship library, loaded from disk and answered from memory.
//
// A store rather than the three free functions this was, because the library
// stopped being a compiled constant: it is files now, in two directories, and
// something has to hold what they said. Shaped like its siblings -
// create*(userDataDir, ...) awaited once at startup - and reload() is what the
// series editor will call when it has written one.

import path from 'node:path';

import { SERIES_DIR } from './constants.ts';
import type { SeriesStore } from './types.ts';
import { roundRace, seriesAvailability } from '../../core/series/index.ts';
import { loadSeriesLibrary, seriesById } from '../../core/series-library/index.ts';
import type { LoadedLibrary, LoadedSeries } from '../../core/series-library/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  Content, IpcRequest, RaceSetup, SeriesListing,
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

  /**
   * Describes one loaded championship for the renderer.
   * @param held The championship and where it came from
   * @param installed What content the library has
   * @returns The listing
   */
  const listing = (held: LoadedSeries, installed: Content): SeriesListing => ({
    series: held.series,
    availability: seriesAvailability(held.series, installed),
    origin: held.origin,
  });

  return {
    async list() {
      const installed = await content.content();

      return {
        series: library.series.map((held) => listing(held, installed)),
        problems: library.problems,
      };
    },

    async get(id) {
      const held = seriesById(library, id);
      if (!held) return null;

      return listing(held, await content.content());
    },

    async setupRound(request: IpcRequest<'series:setupRound'>): Promise<RaceSetup> {
      const held = seriesById(library, request.series);
      if (!held) throw new AppError('series.notFound', { series: request.series });

      const definition = roundRace({
        series: held.series,
        entry: request.entry,
        round: request.round,
        car: request.car,
      }, await content.content());

      return race.set(definition);
    },

    async reload() {
      library = await loadSeriesLibrary(userDir);
      warnProblems(library);
    },
  };
};
