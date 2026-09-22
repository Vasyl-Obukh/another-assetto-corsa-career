import type {
  Championship,
  IpcRequest,
  RaceDefinition,
  RaceSetup,
  RoundDraw,
  RoundForecast,
  SeriesAvailability,
  SeriesCommandResult,
  SeriesImportResult,
  SeriesLibrary,
  SeriesListing,
  WeatherOffer,
} from '../../shared/types/index.ts';

/**
 * The championship library, and what can be asked of it.
 */
export interface SeriesStore {
  /**
   * Every championship, each with whether the install can race it.
   * @returns The library, in ladder order, with whatever failed to load
   */
  list: () => Promise<SeriesLibrary>;
  /**
   * One championship by id, with its availability.
   * @param id The championship's id
   * @returns The listing, or null when the library holds no such championship
   */
  get: (id: string) => Promise<SeriesListing | null>;
  /**
   * Sets one round up as the race being prepared.
   *
   * The round becomes an ordinary race definition and goes to the race store,
   * which validates and plans it exactly as it would a hand-authored weekend.
   * The store refuses while a launch is in flight, and that refusal is left to
   * travel rather than being pre-empted here: it is the same answer the race
   * screen already renders.
   * @param request Which round of which championship, the player's car, and
   * the weather a career has already drawn for it
   * @returns The race setup, ready for the race screen
   */
  setupRound: (
    request: IpcRequest<'series:setupRound'> & { draw?: RoundDraw },
  ) => Promise<RaceSetup>;
  /**
   * Lowers one round of a championship the caller holds into a race, without
   * setting it up.
   *
   * Takes the championship rather than an id, because a career's season races
   * its own copy of the championship rather than whatever the library holds
   * now. Drawn over the same content, class catalogue and weather offer a
   * library round is set up with, which is why this lives here rather than being
   * copied into the career store.
   * @param series The championship, as the caller holds it
   * @param request Which class, which round, the player's car, and the weather
   * a career has already drawn for it
   * @returns The race the round runs as
   */
  lowerRound: (
    series: Championship,
    request: Omit<IpcRequest<'series:setupRound'>, 'series'> & { draw?: RoundDraw },
  ) => Promise<RaceDefinition>;
  /**
   * What the install and the user's settings can race in.
   *
   * Exposed because a career stores the weather its climate drew rather than
   * the weather that will run, and needs this to turn one into the other. The
   * same offer a round is set up with, which is what keeps a forecast and its
   * race one answer.
   * @returns The offer as it stands
   */
  offer: () => Promise<WeatherOffer>;
  /**
   * What is wrong with a championship as it stands, writing nothing.
   *
   * The editor's live problem list. Takes a whole document rather than an id,
   * because what it is asked about is a draft that exists nowhere yet.
   * @param series The championship to check
   * @returns Everything wrong with it, and what it needs that is not installed
   */
  validate: (series: Championship) => Promise<SeriesAvailability>;
  /**
   * Every round's generated weather.
   *
   * Drawn over what the install can render and what the user allows, the same
   * offer a round is set up with, so the calendar shows what the race runs.
   * @param id The championship's id
   * @returns One forecast per round, empty when its weather is authored
   * @throws When the library holds no such championship
   */
  forecast: (id: string) => Promise<RoundForecast[]>;
  /**
   * The forecast of the round a race was set up from.
   * @param raceId The race definition's id
   * @returns The round's forecast, or null when the race is no generated round
   */
  raceForecast: (raceId: string) => Promise<RoundForecast | null>;
  /**
   * Writes a championship the user owns back over its own file.
   *
   * A document that does not validate is written and reported rather than
   * refused, which is the same stance importing takes: a championship the app
   * will not store is one the user cannot fix. Three things are refused - one
   * the app ships, an id that does not match the document's, and a
   * championship whose weekend has already begun.
   *
   * Written by the file it was loaded from, never by a name derived from the
   * id: the two are allowed to disagree, so `weird.json` may perfectly well
   * hold `lotus-cup`.
   * @param id The championship's id, which the document must also carry
   * @param series The championship to write
   * @returns The listing as it now stands, off the document that was written
   * @throws When it is not the user's to edit, is renamed, or is part-way
   * through a weekend
   */
  save: (id: string, series: Championship) => Promise<SeriesListing>;
  /**
   * Takes a copy of one the app ships, under its own id.
   *
   * The copy replaces the original rather than sitting beside it, because a
   * user file carrying a shipped id is what `adjusted` means - so this is both
   * "fork it" and "disable the app's own" in one write, and revert undoes both.
   * @param id The shipped championship's id
   * @returns The library, still looking at the same id
   * @throws When the id is not one the app ships
   */
  customise: (id: string) => Promise<SeriesCommandResult>;
  /**
   * Copies one championship into a separate one of the user's own.
   *
   * The id is derived here rather than sent, because only this side knows what
   * is taken: a file that failed to parse owns its name without appearing in
   * the library, so an id picked from what loaded could overwrite the very file
   * the user is trying to fix.
   * @param id The championship to copy
   * @param name What to call the copy, or undefined to keep the original's name
   * @returns The library, looking at the copy
   * @throws When the library holds no such championship
   */
  duplicate: (id: string, name?: string) => Promise<SeriesCommandResult>;
  /**
   * Writes a championship of the user's own for the first time.
   *
   * The document is the editor's draft, under an id derived here for the same
   * reason `duplicate` derives one - whatever id the draft carried is replaced.
   * @param series The drafted championship
   * @returns The library, looking at the new championship
   */
  create: (series: Championship) => Promise<SeriesCommandResult>;
  /**
   * Deletes the user's version of a championship the app ships.
   * @param id The adjusted championship's id
   * @returns The library, looking at the shipped one that is now back
   * @throws When that id is not one the user has adjusted
   */
  revert: (id: string) => Promise<SeriesCommandResult>;
  /**
   * Deletes one of the user's own championships.
   * @param id The championship's id
   * @returns The library, looking at nothing
   * @throws When the championship is not one the user wrote
   */
  remove: (id: string) => Promise<SeriesCommandResult>;
  /**
   * Reads a championship file into the user's library.
   * @param file Absolute path to the file the user picked
   * @returns What came in, under which id, and what is wrong with it
   */
  importFrom: (file: string) => Promise<SeriesImportResult>;
  /**
   * Writes one championship out as a file the user can share.
   * @param id The championship's id
   * @param file Absolute path to write it to
   * @returns Resolves once it is written
   * @throws When the library holds no such championship, or the write fails
   */
  exportTo: (id: string, file: string) => Promise<void>;
  /**
   * Works availability out afresh and tells everyone, writing nothing.
   *
   * For a change outside the library that moves what it can race - the class
   * catalogue, which decides what a spec holds. Quiet while the install is
   * unlocated, since there is nothing to judge availability against.
   * @returns Resolves once listeners have the library
   */
  refresh: () => Promise<void>;
  /**
   * Every championship racing in a spec, on a class entry or on a round.
   * @param spec The spec
   * @returns Their names, in library order
   */
  usingSpec: (spec: string) => string[];
  /**
   * Reads every championship file again.
   * @returns Resolves once the library has been replaced
   */
  reload: () => Promise<void>;
  /**
   * Subscribes to the library changing.
   * @param listener Called with the library after every command
   * @returns A function that removes the listener
   */
  onChange: (listener: (library: SeriesLibrary) => void) => () => void;
}
