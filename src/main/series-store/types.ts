import type {
  IpcRequest, RaceSetup, SeriesLibrary, SeriesListing,
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
   * @param request Which round of which championship, and the player's car
   * @returns The race setup, ready for the race screen
   */
  setupRound: (request: IpcRequest<'series:setupRound'>) => Promise<RaceSetup>;
  /**
   * Reads every championship file again.
   * @returns Resolves once the library has been replaced
   */
  reload: () => Promise<void>;
}
