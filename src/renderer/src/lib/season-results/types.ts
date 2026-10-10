import type {
  DriverStanding, EventStatus, RacePlace, RaceScore, Round, TeamStanding,
} from '../../../../shared/types';

/**
 * One race of a round, as a column of the season's grid.
 */
export interface RaceColumn {
  /**
   * Which launch of the event it is, which is what joins it to its score.
   */
  launch: number;
  /**
   * The session's own name, or null where the format names none.
   */
  name: string | null;
  /**
   * What it paid, or null while it is still to come.
   */
  score: RaceScore | null;
}

/**
 * One round, as a group of columns of the season's grid.
 */
export interface RoundColumn {
  /**
   * The round.
   */
  round: Round;
  /**
   * Where it falls in the calendar, counting from one.
   */
  number: number;
  /**
   * The day it is raced on this season, as an ISO date.
   */
  date: string;
  /**
   * What became of it.
   */
  status: EventStatus;
  /**
   * Its races, in the order they run.
   */
  races: RaceColumn[];
  /**
   * Whether it has a score at all - raced, or simulated.
   */
  scored: boolean;
}

/**
 * One driver's row, with what the tables show beside the standing itself.
 */
export interface DriverRow extends DriverStanding {
  /**
   * The row's identity: its seat, and whether it is a substitute's.
   */
  key: string;
  /**
   * Places gained since the round before, negative for places lost, or null
   * before a second round has been scored.
   */
  move: number | null;
  /**
   * Whether the row is the player's own.
   */
  player: boolean;
  /**
   * Points taken for qualifying, out of the total.
   */
  qualifyingPoints: number;
  /**
   * Points taken for fastest laps, out of the total.
   */
  fastestLapPoints: number;
  /**
   * Every place the row took, in the order the races ran.
   */
  places: RacePlace[];
}

/**
 * One team's row.
 */
export interface TeamRow extends TeamStanding {
  /**
   * Places gained since the round before, or null before a second round.
   */
  move: number | null;
  /**
   * Whether the player drives for it.
   */
  player: boolean;
}

/**
 * One class's tables.
 */
export interface ClassSeason {
  /**
   * The class entry, by its id.
   */
  entry: string;
  /**
   * Its display name.
   */
  name: string;
  /**
   * Its drivers, best placed first.
   */
  drivers: DriverRow[];
  /**
   * Its teams, best placed first.
   */
  teams: TeamRow[];
}

/**
 * A championship's season, read into the shapes its tables are drawn from.
 */
export interface SeasonResults {
  /**
   * Every round, in calendar order.
   */
  rounds: RoundColumn[];
  /**
   * How many rounds the tables count.
   */
  counted: number;
  /**
   * One table set per class entry, in the championship's own order.
   */
  classes: ClassSeason[];
}
