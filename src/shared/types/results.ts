// The shapes AC writes into race_out.json, and the summaries we derive from
// them. AC's own field names are kept verbatim where it writes them, including
// number_of_sessions, so the parsed file matches what is on disk.

/**
 * One completed lap, as recorded by AC.
 */
export interface RaceOutLap {
  /**
   * Lap number, counting from 0.
   */
  lap: number;
  /**
   * Index into the session's car list.
   */
  car: number;
  /**
   * Sector times in milliseconds.
   */
  sectors: number[];
  /**
   * Milliseconds, or -1 when the lap was invalidated.
   */
  time: number;
  /**
   * How many times the car left the track on this lap.
   */
  cuts: number;
  /**
   * Tyre compound short name.
   */
  tyre: string;
}

/**
 * One session's results.
 */
export interface RaceOutSession {
  /**
   * Session index within the weekend.
   */
  event: number;
  /**
   * Session name as shown in game.
   */
  name: string;
  /**
   * AC's numeric session type; 3 is a race.
   */
  type: number;
  /**
   * Scheduled lap count, 0 for timed sessions.
   */
  lapsCount: number;
  /**
   * Scheduled duration in minutes, 0 for lap-limited sessions.
   */
  duration: number;
  /**
   * Every lap by every car, in the order they were completed.
   */
  laps: RaceOutLap[];
  /**
   * Total time per car, indexed by car.
   */
  lapstotal: number[];
  /**
   * Each car's best lap.
   */
  bestLaps: {
    /**
     * Index into the session's car list.
     */
    car: number;
    /**
     * Lap time in milliseconds.
     */
    time: number;
    /**
     * Which lap it was set on.
     */
    lap: number;
  }[];
}

/**
 * One entry in the session, in grid order.
 */
export interface RaceOutPlayer {
  /**
   * Driver name.
   */
  name: string;
  /**
   * Car folder ID.
   */
  car: string;
  /**
   * Skin folder ID.
   */
  skin: string;
}

/**
 * The whole of race_out.json, which AC overwrites every session.
 */
export interface RaceOut {
  /**
   * Track ID, joined to the layout with a hyphen rather than a slash.
   */
  track: string;
  /**
   * How many sessions the weekend contained. AC's own field name.
   */
  number_of_sessions: number;
  /**
   * Every entry, in the order car indices refer to.
   */
  players: RaceOutPlayer[];
  /**
   * Results per session.
   */
  sessions: RaceOutSession[];
  /**
   * Extra classifications such as best lap, when AC records any.
   */
  extras?: {
    /**
     * What the extra measures.
     */
    name: string;
    /**
     * The recorded time in milliseconds.
     */
    time: number;
  }[];
}

/**
 * One driver's finishing position in a session, as inferred by us.
 */
export interface Standing {
  /**
   * Finishing position, counting from 1.
   */
  position: number;
  /**
   * Driver name.
   */
  driver: string;
  /**
   * Car folder ID.
   */
  car: string;
  /**
   * Skin folder ID.
   */
  skin: string;
  /**
   * Laps completed.
   */
  laps: number;
  /**
   * Total track limit violations.
   */
  cuts: number;
  /**
   * Best valid lap in milliseconds, or null when none was set.
   */
  bestLap: number | null;
  /**
   * Sum of valid lap times in milliseconds.
   */
  totalTime: number;
}

/**
 * One session, summarised into a classification.
 */
export interface SessionSummary {
  /**
   * Session name as shown in game.
   */
  name: string;
  /**
   * AC's numeric session type.
   */
  type: number;
  /**
   * Scheduled lap count.
   */
  lapCount: number;
  /**
   * Scheduled duration in minutes.
   */
  durationMinutes: number;
  /**
   * Drivers in finishing order.
   */
  standings: Standing[];
}

/**
 * A whole weekend, summarised.
 */
export interface RaceSummary {
  /**
   * Track ID as AC recorded it.
   */
  track: string;
  /**
   * One summary per session.
   */
  sessions: SessionSummary[];
}

/**
 * Extra fields stored alongside an archived result.
 */
export interface ArchiveMeta {
  /**
   * Which race definition produced this result.
   */
  raceId?: string;
  /**
   * The race's display name at the time it was run.
   */
  raceName?: string;
  /**
   * How the result was captured, for example "watch".
   */
  source?: string;
}
