import type {
  Career,
  CareerCalendar,
  CareerEventView,
  RaceSetup,
  RoundDraw,
  RoundForecast,
  SeasonEntry,
  SeasonEvent,
} from '../../shared/types/index.ts';

/**
 * One round of a championship the career is in, with the season entry it
 * belongs to.
 */
export interface EnteredEvent {
  /**
   * The championship as the career entered it.
   */
  entry: SeasonEntry;
  /**
   * The round, dated.
   */
  event: SeasonEvent;
}

/**
 * Which round of which championship a command is about.
 */
export interface EventRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The round's id.
   */
  round: string;
}

/**
 * What entering a championship is told.
 */
export interface EnrolRequest {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which class of it, by its class entry id.
   */
  entry: string;
  /**
   * The car the season will be raced in.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked.
     */
    skin?: string;
  };
}

/**
 * The career held in memory, and the commands that change it.
 *
 * Commands rather than patches: each one validates before it applies, so the
 * renderer cannot write a career into a state the rules do not allow. Every one
 * of them returns the whole career, because every one of them changes what the
 * calendar screen renders.
 */
export interface CareerStore {
  /**
   * Reads the career as it stands.
   *
   * Null only before anything has asked for one: reading the calendar or
   * running any command starts it, since settings already holds everything a
   * career needs to begin.
   * @returns The career, or null when nothing has started one yet
   */
  get(): Career | null;
  /**
   * Composes the calendar for a season, joining the career against the
   * championship library and the installed content.
   * @param season Which season, counting from zero; the current one by default
   * @returns The dated, merged calendar
   */
  calendar(season?: number): Promise<CareerCalendar>;
  /**
   * Enters a championship for the current season.
   * @param request Which championship, which class, and in what
   * @returns The career with the season entered
   * @throws When the championship cannot be entered
   */
  enrol(request: EnrolRequest): Promise<Career>;
  /**
   * Pulls out of a championship, marking everything still to come as missed.
   * @param request Which championship and class to leave
   * @returns The career
   * @throws When that championship was not entered
   */
  withdraw(request: { series: string; entry: string }): Promise<Career>;
  /**
   * Moves the clock forward, stopping at the first enrolled weekend on the way.
   * @param date The ISO date to advance towards
   * @returns The career, with the clock wherever it stopped
   * @throws When the date is behind the clock
   */
  advanceTo(date: string): Promise<Career>;
  /**
   * The weather this career already drew for the round a race was set up from.
   *
   * The race screen asks before the library does: a career round races the draw
   * stored on its event, salted with the career and the season, and the library
   * would answer with a different one - which the screen would read as a
   * forecast that had moved under the race and stop marking its sessions.
   * @param raceId The race definition's id
   * @returns The forecast, or null when no event of this career holds that race
   */
  raceForecast(raceId: string): Promise<RoundForecast | null>;
  /**
   * The weather this career drew for a round it is in, for a race set up from
   * the championship page to race the same draw as one set up from the career.
   * @param series The championship's id
   * @param round The round's id
   * @returns The draw, or undefined when the career is not in that round or its
   * weekend is still further out than the forecast lead
   */
  draw(series: string, round: string): Promise<RoundDraw | undefined>;
  /**
   * The same draw, swapped for what this install can race.
   * @param series The championship's id
   * @param round The round's id
   * @returns The forecast, or null wherever `draw` has none
   */
  forecast(series: string, round: string): Promise<RoundForecast | null>;
  /**
   * One round as the event page shows it.
   * @param request Which championship and round
   * @returns The round, its sessions and what the career can do with it
   * @throws When no championship the career or the library holds has it
   */
  event(request: EventRequest): Promise<CareerEventView>;
  /**
   * Runs the next session of a round the career is in.
   *
   * Sets the round up first when the race being run is some other weekend, and
   * moves the clock to the weekend when it is still ahead.
   * @param request Which championship and round
   * @returns The race as it stands once the launch has started
   * @throws When the round cannot be raced now, saying why
   */
  launch(request: EventRequest): Promise<RaceSetup>;
  /**
   * Throws away what has run of a weekend and starts it again.
   *
   * For the one case that needs it: the weekend was changed on the Race screen
   * part-way through, so its progress there no longer matches the career's.
   * @param request Which championship and round
   * @returns The career
   * @throws When the round has already been raced or passed
   */
  restartEvent(request: EventRequest): Promise<Career>;
  /**
   * Forces any pending write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
  /**
   * Subscribes to changes.
   * @param listener Called with the career after every command
   * @returns A function that removes the listener
   */
  onChange(listener: (career: Career) => void): () => void;
}
