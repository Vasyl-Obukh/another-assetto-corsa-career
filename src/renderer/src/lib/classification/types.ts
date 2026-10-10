import type {
  Championship, GridEntry, LaunchRecord, RacePlace, RaceScore, SessionType, Standing,
} from '../../../../shared/types';

/**
 * What one session's classification is read from. Any of it may be missing: a
 * quick race has an archive and no career, and a simulated session has a career
 * and no archive.
 */
export interface ClassificationSource {
  /**
   * Which kind of session it was.
   */
  type: SessionType;
  /**
   * The archive's own classification, for a session that was driven.
   */
  standings?: readonly Standing[] | null;
  /**
   * What the session left on the career, whose classification says which car
   * of the grid each place was.
   */
  record?: LaunchRecord | null;
  /**
   * The event's entry list, which the record's car indices index into.
   */
  grid?: readonly GridEntry[];
  /**
   * The race's score, for a scored race.
   */
  score?: RaceScore | null;
  /**
   * The order the race started in, as car indices into the grid.
   */
  startOrder?: readonly number[] | null;
  /**
   * The championship, for flags and team names.
   */
  series?: Championship | null;
  /**
   * Whether the grid's first car was someone other than the player.
   */
  substituted?: boolean;
  /**
   * One class entry to list alone, by its id: its own positions, its own
   * leader for the gaps and its own fastest lap. Every car when unset.
   */
  entry?: string;
}

/**
 * How far a car finished behind the one in front of the table.
 */
export type ClassifiedGap =
  | {
    /**
     * Laps down on the winner.
     */
    laps: number;
  }
  | {
    /**
     * Milliseconds behind: on total race time in a race, on best lap otherwise.
     */
    ms: number;
  };

/**
 * One row of a session's classification.
 */
export interface ClassifiedRow {
  /**
   * The row's identity.
   */
  key: string;
  /**
   * Where it finished, counting from one.
   */
  position: number;
  /**
   * The driver's name.
   */
  driver: string;
  /**
   * The driver's nation code, when anything names one.
   */
  nation?: string;
  /**
   * The team's display name, or null for none.
   */
  team: string | null;
  /**
   * The car and its livery, when either is known.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, or an empty string.
     */
    skin: string;
  } | null;
  /**
   * Laps completed, or null for a simulated session.
   */
  laps: number | null;
  /**
   * Best valid lap in milliseconds, or null.
   */
  bestLap: number | null;
  /**
   * Track limit violations, or null for a simulated session.
   */
  cuts: number | null;
  /**
   * The winner's race time, on their row alone.
   */
  total: number | null;
  /**
   * How far behind the front it finished, or null for the front or unknown.
   */
  gap: ClassifiedGap | null;
  /**
   * What it took from a scored race.
   */
  place: RacePlace | null;
  /**
   * Where it started a race, counting from one, or null.
   */
  started: number | null;
  /**
   * Whether it set the fastest lap.
   */
  fastest: boolean;
  /**
   * Whether it is the player.
   */
  player: boolean;
  /**
   * Which class entry the car raced in, by its id, or null when the grid does
   * not say.
   */
  entry: string | null;
  /**
   * Where it finished among its own class, counting from one, or null when
   * the grid does not say what class it was.
   */
  classPosition: number | null;
}
