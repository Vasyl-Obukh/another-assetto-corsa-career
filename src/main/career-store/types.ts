import type {
  Career,
  CareerCalendar,
  CareerEventView,
  ChampionshipResults,
  RaceSetup,
  SeasonEntry,
  SeasonEvent,
  SkippedRound,
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
 * A step on the AI's strength, for an edition or one round of it.
 */
export interface StrengthRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * Which of the season's editions - the one being raced when omitted.
   */
  edition?: number;
  /**
   * The round the step is for, or omitted for every round of the edition.
   */
  round?: string;
  /**
   * The step, zero for none.
   */
  strength: number;
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
  /**
   * Which season, counting from zero - the current one when omitted. Only read
   * back: a round of a closed season cannot be raced.
   */
  season?: number;
  /**
   * Which of the season's editions, counting from zero - the one the career is
   * racing when omitted, or else the one still to come.
   */
  edition?: number;
}

/**
 * Which edition of which championship a results read is about.
 */
export interface ResultsRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * Which season, counting from zero - the current one when omitted.
   */
  season?: number;
  /**
   * Which of the season's editions, counting from zero, defaulting as
   * `EventRequest.edition` does.
   */
  edition?: number;
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
  /**
   * Which of the season's editions, counting from zero - the one still to
   * come when omitted.
   */
  edition?: number;
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
   * Enters an edition of a championship for the current season.
   * @param request Which championship, which class, in what, and which edition
   * @returns The career with the edition entered
   * @throws When the championship cannot be entered
   */
  enrol(request: EnrolRequest): Promise<Career>;
  /**
   * Pulls out of an edition of a championship, marking everything still to
   * come as missed.
   * @param request Which championship, class and edition to leave - the
   * edition being raced when it names none
   * @returns The career
   * @throws When that championship was not entered
   */
  withdraw(request: { series: string; entry: string; edition?: number }): Promise<Career>;
  /**
   * Sets the player's own step on the AI's strength for an edition the career
   * is in: for every round of it, or for the one round named. Read at every
   * launch, so it reaches the next session and never one already run.
   * @param request Which championship and edition - the one being raced when
   * it names none - which round, if only one, and the step, zero for none
   * @returns The career
   * @throws When the edition is not entered, the round has been run, or the
   * step moves the AI further than a step may
   */
  strength(request: StrengthRequest): Promise<Career>;
  /**
   * Moves the clock forward, stopping at the first enrolled event on the way
   * - or, once the player has confirmed what it costs, all the way. A move past
   * 31 December closes the season and opens the next, empty.
   * @param date The ISO date to advance towards
   * @param skip Whether to go all the way, marking every round of the career's
   * passed on the way, and an event left part-way, as non-starts
   * @returns The career, with the clock wherever it stopped
   * @throws When the date is behind the clock, a launch is out, or the move
   * would lose rounds and was not confirmed
   */
  advanceTo(date: string, skip?: boolean): Promise<Career>;
  /**
   * What moving the clock to a date would cost, for the player to confirm.
   * @param date The ISO date the clock would move to
   * @returns Every round of the career's it would leave unraced
   */
  skips(date: string): Promise<SkippedRound[]>;
  /**
   * One round as the event page shows it, of any season - a closed one's
   * read-only.
   * @param request Which championship and round, and which season and edition
   * @returns The round, its sessions and what the career can do with it
   * @throws When no championship the career or the library holds has it
   */
  event(request: EventRequest): Promise<CareerEventView>;
  /**
   * An edition of a championship so far.
   *
   * The career's own rounds when it is in the edition. Otherwise every round
   * behind the clock is simulated on the spot and nothing is stored - the same
   * round always simulates the same, so there is nothing to keep.
   * @param request Which championship, and which season and edition
   * @returns Every round and what it left
   * @throws When neither the career nor the library holds the championship
   */
  results(request: ResultsRequest): Promise<ChampionshipResults>;
  /**
   * Runs the next session of a round the career is in.
   *
   * Sets the round up first when the race being run is some other event, and
   * moves the clock to the event when it is still ahead.
   * @param request Which championship, round and edition, and whether the
   * player confirmed losing the rounds `skips` on its event view lists
   * @returns The race as it stands once the launch has started
   * @throws When the round cannot be raced now, saying why
   */
  launch(request: Omit<EventRequest, 'season'> & { skip?: boolean }): Promise<RaceSetup>;
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
