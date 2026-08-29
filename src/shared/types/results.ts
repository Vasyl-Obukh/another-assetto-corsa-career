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
   * Always 0 in every capture so far, including weekends where three sessions
   * ran, so it is not the session index it looks like. Identify a session by
   * its position in the array, or by type and name.
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
   * Laps completed per car, indexed by car.
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
  /**
   * AC's own finishing order: `raceResult[n]` is the index of the car that
   * finished `n`-th. Always the full length of the entry list, lapped cars
   * included, so it is safe to index. Written on race sessions only - practice
   * and qualifying carry none, even when every car set a time.
   *
   * Nothing derives standings from it yet. It has matched our laps-then-time
   * inference in every race captured, so it adds no information; it is worth
   * adopting only because it is AC's answer rather than ours and so cannot
   * inherit our sorting bugs.
   */
  raceResult?: number[];
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
   * How many sessions the weekend was *configured* with, which is not how many
   * ran: a four-session weekend stopped after the third wrote 4 here against
   * three entries in `sessions`.
   *
   * It only reveals a session that never *started*. One that started and was
   * abandoned still counts as run - quitting out of a race mid-way reported
   * 3 of 3, because AC finishes the race without the player rather than
   * ending it. AC's own field name.
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
 * Where a session's finishing order came from.
 *
 * "raceResult" is AC's own classification, which it writes on race sessions
 * only; "inferred" is ours, sorted from the lap data.
 */
export type StandingsOrder = 'raceResult' | 'inferred';

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
  /**
   * Which classification the order came from. Practice and qualifying carry no
   * raceResult, so they are always inferred.
   */
  order: StandingsOrder;
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
