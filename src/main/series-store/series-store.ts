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
import { isEditable, roundOfRace, weekendOf } from './utils.ts';
import {
  roundRace, seriesAvailability, seriesForecast, validateSeries,
} from '../../core/series/index.ts';
import { parseSeries, readSeries, writeSeries } from '../../core/series-file/index.ts';
import {
  deleteUserSeries,
  freeSeriesFileName,
  loadSeriesLibrary,
  newSeriesId,
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
  WeatherOffer,
} from '../../shared/types/index.ts';
import { usesSpec } from '../../shared/utils/eligibility/index.ts';
import { weatherOffer } from '../../shared/utils/weather-types/index.ts';
import type { ClassStore } from '../class-store/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';

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
 * @param classes The class store, whose catalogue every spec resolves against
 * @param settings The settings store, for the weather generation may use
 * @returns A store holding the loaded library
 */
export const createSeriesStore = async (
  userDataDir: string,
  content: ContentStore,
  race: RaceStore,
  classes: ClassStore,
  settings: SettingsStore,
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
   * @returns The listing, including any weekend of it that is under way
   */
  const listing = (one: LoadedSeries, installed: Content): SeriesListing => ({
    series: one.series,
    availability: seriesAvailability(one.series, installed, classes.catalogue()),
    origin: one.origin,
    activeByDefault: one.activeByDefault,
    filler: one.filler,
    weekend: weekendOf(one.series, race.progress()),
  });

  /**
   * What generated weather may be drawn over, as the install and settings stand.
   *
   * Setting a round up and forecasting it both ask this, which is what keeps
   * the race and its forecast one draw.
   * @param installed What content the library has
   * @returns The weather on offer
   */
  const offer = async (installed: Content): Promise<WeatherOffer> => {
    const { allowedWeather, weatherSystem } = settings.get();
    let rainFx = true;
    try {
      ({ rainFx } = await race.weatherFx());
    } catch (error) {
      // Enabled is CSP's own default, and an unreadable config is no reason to
      // refuse to forecast.
      console.warn('Could not read the RainFX setting.', error);
    }

    return weatherOffer(
      installed.weather.map((preset) => preset.type),
      allowedWeather,
      weatherSystem,
      rainFx,
    );
  };

  /**
   * Lowers one round of a championship into a race, setting nothing up.
   * @param series The championship, as the caller holds it
   * @param request Which class, which round, and the player's car
   * @returns The race the round runs as
   */
  const lowerRound: SeriesStore['lowerRound'] = async (series, request) => {
    const installed = await content.content();

    return roundRace({ series, ...request }, installed, classes.catalogue(), await offer(installed));
  };

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
   * Finds a championship the editor is allowed to write over, or says why not.
   *
   * Every refusal a save can make, in one place and before anything is
   * written - which is the shape held() and insistOrigin() already give the
   * other commands.
   * @param id The championship's id
   * @param series The document offered for it
   * @returns It, with the file to write and the origin that allowed it
   * @throws When the app ships it, when the document renames it, or when a
   * weekend of it has already begun
   */
  const writable = (id: string, series: Championship): LoadedSeries => {
    const found = held(id);
    if (!isEditable(found.origin)) throw new AppError('series.notEditable', { series: id });

    // The id is what the library keys on, so a rename is Duplicate's job.
    if (series.id !== id) {
      throw new AppError('series.id.immutable', { series: id, id: series.id });
    }

    const underway = weekendOf(found.series, race.progress());
    if (underway) {
      throw new AppError('series.weekendInProgress', { series: id, round: underway.round });
    }

    return found;
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

    lowerRound,

    async setupRound(request: IpcRequest<'series:setupRound'>): Promise<RaceSetup> {
      const found = seriesById(library, request.series);
      if (!found) throw new AppError('series.notFound', { series: request.series });

      return race.set(await lowerRound(found.series, {
        entry: request.entry, round: request.round, car: request.car,
      }));
    },

    async forecastFor(series) {
      return seriesForecast(series, await offer(await content.content()));
    },

    async validate(series) {
      return seriesAvailability(series, await content.content(), classes.catalogue());
    },

    async forecast(id) {
      const { series } = held(id);

      return seriesForecast(series, await offer(await content.content()));
    },

    async raceForecast(raceId) {
      const found = roundOfRace(library.series.map((one) => one.series), raceId);
      if (!found) return null;

      const forecasts = seriesForecast(found.series, await offer(await content.content()));
      return forecasts.find((one) => one.round === found.round) ?? null;
    },

    async save(id, series) {
      // Non-null by the origin guard inside: only a shipped championship has no
      // file of its own.
      const file = writable(id, series).file as string;

      // The payload is unknown at runtime however the contract types it, and
      // main is where a write is checked. parseSeries also normalises, so what
      // is written and what is answered with are both the parsed document
      // rather than what the renderer happened to send.
      const parsed = parseSeries(series, file);
      if (!parsed.series) {
        throw new AppError('series.save.unreadable', {
          series: id,
          reason: parsed.problems[0]?.message ?? 'it is not a championship',
        });
      }

      await saveUserSeries(userDir, parsed.series, file);
      await settle(id);

      // Off the reloaded library rather than off `parsed`, so the answer
      // carries the origin and the weekend state the listing is built with.
      const after = seriesById(library, id);
      if (!after) throw new AppError('series.notFound', { series: id });

      return listing(after, await content.content());
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
        id: newSeriesId(),
        ...(name ? { name } : {}),
        forkedFrom: found.series.id,
      };

      await saveUserSeries(userDir, copy, freeSeriesFileName(copy.id, free));

      return settle(copy.id);
    },

    async create(drafted) {
      const id = newSeriesId();
      const file = freeSeriesFileName(id, await taken());

      // Checked as save checks it, or a draft that will not load is written
      // anyway and becomes a load problem the user has to delete by hand.
      const parsed = parseSeries({ ...drafted, id }, file);
      if (!parsed.series) {
        throw new AppError('series.save.unreadable', {
          series: id,
          reason: parsed.problems[0]?.message ?? 'it is not a championship',
        });
      }

      await saveUserSeries(userDir, parsed.series, file);

      return settle(id);
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
        ? { ...read.series, id: newSeriesId() }
        : read.series;

      await saveUserSeries(userDir, imported, freeSeriesFileName(imported.id, free));
      const settled = await settle(imported.id);

      return {
        library: settled.library,
        id: imported.id,
        // Reported rather than refused: a championship the app will not accept
        // is one the user cannot fix, and the misconfigured badge makes letting
        // it in safe.
        problems: validateSeries(imported, classes.catalogue()),
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

    async refresh() {
      try {
        const next = await list();
        listeners.forEach((listener) => listener(next));
      } catch (error) {
        // Availability needs the scan, and there is none until the install is
        // located; the championships screen asks again once it is.
        if (!(error instanceof AppError && error.code === 'ipc.pathsNotLocated')) throw error;
      }
    },

    usingSpec(spec) {
      return library.series.filter((one) => usesSpec(one.series, spec)).map((one) => one.series.name);
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
