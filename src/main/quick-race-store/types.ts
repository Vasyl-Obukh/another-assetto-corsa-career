import type {
  LaunchRecord, QuickRace, QuickRaceView,
} from '../../shared/types/index.ts';

/**
 * One quick race as it is kept on disk: the race and what of it has run.
 */
export interface QuickRaceFile {
  /**
   * The race as written.
   */
  race: QuickRace;
  /**
   * Every launch of it run so far, in order - kept here rather than in the
   * race store's slot, which holds only whichever event raced last.
   */
  completed: readonly LaunchRecord[];
}

/**
 * Every race event of the player's own, and the commands that change them.
 *
 * The races are run through the race store, one launch at a time: launching
 * one puts it in the store's slot together with what of it has run, and each
 * launch that lands is copied back here. So any number of them can be part-way
 * at once, and a championship event raced in between costs none of them
 * anything.
 */
export interface QuickRaceStore {
  /**
   * Every quick race, the ones part-way first and then the latest changed.
   * @returns One view per race
   */
  list(): Promise<QuickRaceView[]>;
  /**
   * One quick race.
   * @param id The race's id
   * @returns Its view
   * @throws AppError when there is no race with that id
   */
  get(id: string): Promise<QuickRaceView>;
  /**
   * Makes a new race event, with nothing picked yet.
   * @returns Its view
   */
  create(): Promise<QuickRaceView>;
  /**
   * Replaces a race that has not started.
   * @param race The race as edited
   * @returns Its view
   * @throws AppError when it has started, or a launch of it is in flight
   */
  save(race: QuickRace): Promise<QuickRaceView>;
  /**
   * Makes a copy of a race, with none of its results.
   * @param id The race to copy
   * @returns The copy's view
   */
  duplicate(id: string): Promise<QuickRaceView>;
  /**
   * Deletes a race. Its archived results stay with every other result.
   * @param id The race to delete
   * @returns Resolves once it is gone
   * @throws AppError when a launch of it is in flight
   */
  remove(id: string): Promise<void>;
  /**
   * Launches the next session of a race.
   * @param id The race
   * @returns Its view, with the launch in flight
   * @throws AppError when it cannot be launched, or another launch is in flight
   */
  launch(id: string): Promise<QuickRaceView>;
  /**
   * Throws away what has run of a race, so it can be changed and run again.
   * @param id The race
   * @returns Its view
   * @throws AppError when a launch of it is in flight
   */
  restart(id: string): Promise<QuickRaceView>;
  /**
   * Sets a race's own step on the AI's strength - the one thing about it that
   * may still change once a session has run. Read at every launch, so it
   * reaches the next session and never one already run.
   * @param id The race
   * @param strength The step, zero for none
   * @returns Its view
   * @throws AppError when the step moves the AI further than a step may
   */
  strength(id: string, strength: number): Promise<QuickRaceView>;
  /**
   * Subscribes to any race changing, a launch of one landing included.
   * @param listener Called with every race whenever any of them changes
   * @returns A function that removes the listener
   */
  onChange(listener: (races: QuickRaceView[]) => void): () => void;
  /**
   * Forces any pending write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
}
