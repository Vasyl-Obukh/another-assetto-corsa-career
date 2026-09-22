// What a race paid, and what a season adds up to.
//
// Deliberately not called Standing: that name is taken by one driver's place in
// one session (see results.ts), which is a different thing and a correct name
// for what it is. These are the championship's own tables, built from those.
//
// Points are paid on CLASS position rather than on overall position. A
// multi-class grid runs one race and settles several championships in it, so an
// LMGT3 car that wins its class scores what a win pays although it crossed the
// line twenty-fifth. For the single-class championships the two are the same
// number.

/**
 * What one car took away from one race.
 */
export interface RacePlace {
  /**
   * Which seat of the championship this was, by its id.
   */
  seat: string;
  /**
   * Which class entry that seat belongs to.
   */
  entry: string;
  /**
   * Which team fielded it, or null when the seat names none.
   */
  team: string | null;
  /**
   * The driver's name as the race was run with it.
   */
  driver: string;
  /**
   * Where it finished overall, counting from one.
   */
  position: number;
  /**
   * Where it finished within its own class, counting from one.
   */
  classPosition: number;
  /**
   * Where it started, counting from one, or null when nothing qualified it.
   */
  qualifyingPosition: number | null;
  /**
   * Whether it set the fastest lap of its class.
   */
  fastestLap: boolean;
  /**
   * Points for where it finished.
   */
  finishPoints: number;
  /**
   * Points for the fastest lap, or zero.
   */
  fastestLapPoints: number;
  /**
   * Points for where it qualified, or zero.
   */
  qualifyingPoints: number;
  /**
   * The three above, summed.
   */
  points: number;
}

/**
 * One race of a weekend, scored.
 */
export interface RaceScore {
  /**
   * Which launch of the weekend it was, counting from zero - what matches it to
   * the session it scored, since two races of one weekend may share a name.
   */
  launch: number;
  /**
   * The session's id in its weekend format, or null when it has none.
   */
  session: string | null;
  /**
   * The session's display name, as the format names it.
   */
  name: string;
  /**
   * Which points system paid it, by its id.
   */
  pointsSystem: string;
  /**
   * What every car took from it, by class entry and then in finishing order.
   *
   * Grouped rather than one finishing order, because a multi-class race settles
   * several championships at once and each row's `classPosition` is what it was
   * paid on. `position` carries the overall finish for anything that wants to
   * read the race back as one table.
   */
  places: readonly RacePlace[];
}

/**
 * One round of a championship, scored.
 *
 * A round rather than a race, because a sprint weekend is one round that scores
 * twice - and a season counts rounds.
 */
export interface RoundScore {
  /**
   * Which round this scored, by its id.
   */
  round: string;
  /**
   * When it was scored, as an ISO timestamp.
   */
  recordedAt: string;
  /**
   * Every race of the weekend that paid points, in the order they ran.
   */
  races: readonly RaceScore[];
}

/**
 * One driver's row in a class's table.
 */
export interface DriverStanding {
  /**
   * Which seat, by its id. The row's identity - a name may be shared.
   */
  seat: string;
  /**
   * The driver's name.
   */
  driver: string;
  /**
   * Which team fields the seat, or null when it names none.
   */
  team: string | null;
  /**
   * Where this row stands, counting from one.
   */
  position: number;
  /**
   * Points scored so far.
   */
  points: number;
  /**
   * Races won in this class.
   */
  wins: number;
  /**
   * Races finished in the class's top three.
   */
  podiums: number;
  /**
   * Best class finish so far, or null when nothing has been raced.
   */
  bestFinish: number | null;
  /**
   * How many races this row has been classified in.
   */
  races: number;
}

/**
 * One team's row in a class's table.
 */
export interface TeamStanding {
  /**
   * Which team, by its id.
   */
  team: string;
  /**
   * The team's display name.
   */
  name: string;
  /**
   * Where this row stands, counting from one.
   */
  position: number;
  /**
   * Points scored by every seat the team fields in this class.
   */
  points: number;
  /**
   * Races won by any of them.
   */
  wins: number;
}

/**
 * One class entry's championship, which is one table of drivers and one of
 * teams.
 */
export interface ClassStandings {
  /**
   * Which class entry this settles, by its id.
   */
  entry: string;
  /**
   * The class's display name.
   */
  name: string;
  /**
   * Every seat of the class, best placed first.
   */
  drivers: readonly DriverStanding[];
  /**
   * Every team fielding a seat in it, best placed first.
   */
  teams: readonly TeamStanding[];
}

/**
 * A season's standings.
 *
 * A list of class tables and no overall one: a multi-class championship has no
 * single ranking, because a Hypercar and an LMGT3 are not racing each other. A
 * single-class championship's table is simply the only entry in this list.
 */
export interface SeasonStandings {
  /**
   * One table per class entry, in the championship's own order.
   */
  classes: readonly ClassStandings[];
  /**
   * When these were last rebuilt, as an ISO timestamp.
   */
  updatedAt: string;
}
