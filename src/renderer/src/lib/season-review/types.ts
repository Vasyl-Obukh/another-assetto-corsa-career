import type {
  ChampionshipResults, LadderPosition, RacePlace,
} from '../../../../shared/types';
import type {
  ClassSeason, DriverRow, SeasonResults, TeamRow,
} from '@/lib/season-results';

/**
 * What the player made of one edition, as figures.
 */
export interface ReviewFigures {
  /**
   * Points scored.
   */
  points: number;
  /**
   * Points behind the champion, or zero for the champion.
   */
  gap: number;
  /**
   * Points clear of second, for the champion; zero otherwise.
   */
  lead: number;
  /**
   * Races won.
   */
  wins: number;
  /**
   * Races finished in the class's top three.
   */
  podiums: number;
  /**
   * Races started from the front of the class's grid.
   */
  poles: number;
  /**
   * Races in which the player set the class's fastest lap.
   */
  fastestLaps: number;
  /**
   * The best class finish, or null when nothing was driven.
   */
  best: number | null;
  /**
   * The mean class finish over the races driven, or null when none was.
   */
  average: number | null;
  /**
   * Races the player drove.
   */
  starts: number;
  /**
   * Races the edition ran.
   */
  races: number;
  /**
   * Rounds the player did not start: missed, given up, or entered too late for.
   */
  nonStarts: number;
}

/**
 * One class's champions.
 */
export interface ClassChampions {
  /**
   * The class entry's id.
   */
  entry: string;
  /**
   * The class's display name.
   */
  name: string;
  /**
   * The drivers' champion, or null for a class nobody scored in.
   */
  driver: DriverRow | null;
  /**
   * The teams' champion, or null for a class fielding no team.
   */
  team: TeamRow | null;
}

/**
 * Where the player stood after one round.
 */
export interface RoundStanding {
  /**
   * The round's id.
   */
  round: string;
  /**
   * Which round of the edition it is, counting from one.
   */
  number: number;
  /**
   * The player's position in the class after it, or null for a round not yet
   * scored.
   */
  position: number | null;
  /**
   * The player's own places in its races - never a stand-in's.
   */
  places: readonly RacePlace[];
  /**
   * What the round paid the player.
   */
  points: number;
}

/**
 * How the player fared against the other seat of their team.
 */
export interface TeammateRecord {
  /**
   * The teammate's row of the final table.
   */
  row: DriverRow;
  /**
   * Races where the player started ahead of them, and behind.
   */
  qualifying: {
    /**
     * Races the player started ahead.
     */
    ahead: number;
    /**
     * Races the player started behind.
     */
    behind: number;
  };
  /**
   * Races where the player finished ahead of them, and behind.
   */
  finish: {
    /**
     * Races the player finished ahead.
     */
    ahead: number;
    /**
     * Races the player finished behind.
     */
    behind: number;
  };
}

/**
 * One edition of a championship, looked back on.
 */
export interface ChampionshipReview {
  /**
   * The edition as the results screens read it.
   */
  results: ChampionshipResults;
  /**
   * Its final tables.
   */
  season: SeasonResults;
  /**
   * The player's class's tables, or null when the class has gone from the copy.
   */
  table: ClassSeason | null;
  /**
   * The player's row, or null when they hold none.
   */
  me: DriverRow | null;
  /**
   * How many rows the player's class table ranks - a stand-in's row included,
   * since a position counts it too, so no place is ever out of more than this.
   */
  field: number;
  /**
   * Every class's champions.
   */
  champions: readonly ClassChampions[];
  /**
   * What the player made of it, or null when they hold no row.
   */
  figures: ReviewFigures | null;
  /**
   * Where the player stood after each round.
   */
  path: readonly RoundStanding[];
  /**
   * How the player fared against their teammate, or null for a seat with none.
   */
  teammate: TeammateRecord | null;
}

/**
 * One edition as a list reads it: History, the year review, Home.
 */
export interface EditionSummary {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The championship's display name.
   */
  name: string;
  /**
   * Which season it ran in, counting from zero.
   */
  season: number;
  /**
   * Which of the season's editions, counting from zero.
   */
  edition: number;
  /**
   * How many editions the championship runs a season.
   */
  editions: number;
  /**
   * The class entered, by its id.
   */
  entry: string;
  /**
   * The class's discipline and rung, or null when the class has gone.
   */
  ladder: LadderPosition | null;
  /**
   * The player's position in the class, or null before anything is scored.
   */
  position: number | null;
  /**
   * How many drivers the class's table holds.
   */
  field: number;
  /**
   * The player's points.
   */
  points: number;
  /**
   * The player's wins.
   */
  wins: number;
  /**
   * The drivers' champion's name, or the leader's while it runs, or null.
   */
  champion: string | null;
  /**
   * Whether the champion is the player.
   */
  title: boolean;
  /**
   * Rounds run so far, raced or not.
   */
  run: number;
  /**
   * Rounds the player did not start.
   */
  missed: number;
  /**
   * Rounds the edition holds.
   */
  rounds: number;
  /**
   * Whether its last round has run.
   */
  over: boolean;
  /**
   * Whether the player pulled out of it.
   */
  withdrawn: boolean;
  /**
   * The player's position after each scored round, for a sparkline.
   */
  path: readonly number[];
}

/**
 * One season, looked back on.
 */
export interface YearReview {
  /**
   * Every edition the season entered, in calendar order.
   */
  editions: readonly EditionSummary[];
  /**
   * The editions still running.
   */
  running: readonly EditionSummary[];
  /**
   * The season in numbers.
   */
  totals: {
    /**
     * Editions entered.
     */
    championships: number;
    /**
     * Editions over.
     */
    finished: number;
    /**
     * Editions the player won.
     */
    titles: number;
    /**
     * Races driven.
     */
    starts: number;
    /**
     * Rounds not started.
     */
    nonStarts: number;
    /**
     * Races won.
     */
    wins: number;
    /**
     * Races finished on the podium.
     */
    podiums: number;
    /**
     * Races started from pole.
     */
    poles: number;
    /**
     * Fastest laps set.
     */
    fastestLaps: number;
  };
}

/**
 * What became of a historic event the season drew, as the player sees it.
 *
 * "declined" is one the player turned down ahead of its day, and "missed" one
 * the clock simply went past.
 */
export type HistoricOutcome = 'scheduled' | 'raced' | 'declined' | 'missed';

/**
 * One historic event of a season, as a list of them reads it.
 */
export interface HistoricRow {
  /**
   * The historic event, by its id.
   */
  series: string;
  /**
   * Its round, by its id.
   */
  round: string;
  /**
   * Its display name.
   */
  name: string;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * The track and layout it runs on.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name, when the circuit has more than one.
     */
    layout?: string;
  };
  /**
   * The discipline and rung of the class the player was invited into.
   */
  ladder: LadderPosition | null;
  /**
   * The car the player was invited to drive, by its folder ID.
   */
  car: string;
  /**
   * The team behind the seat, by its display name, or null.
   */
  team: string | null;
  /**
   * The driver whose seat it is, who races it when the player does not.
   */
  driver: string | null;
  /**
   * What became of it.
   */
  outcome: HistoricOutcome;
  /**
   * Whether any of its sessions has run, past which it can no longer be
   * declined.
   */
  started: boolean;
  /**
   * Where the player started its last race within their class, once driven.
   */
  qualified: number | null;
  /**
   * Where the player finished its last race within their class, once driven.
   */
  finished: number | null;
  /**
   * Whether the event races more than one class, which is when a place is
   * worth saying is the class's.
   */
  multiClass: boolean;
  /**
   * The prize money the player's places earned, or null for none.
   */
  prize: number | null;
}

/**
 * A season's historic events, looked back on.
 */
export interface HistoricReview {
  /**
   * Every one the season drew, earliest first.
   */
  rows: readonly HistoricRow[];
  /**
   * How many were raced.
   */
  raced: number;
  /**
   * How many the player won.
   */
  wins: number;
  /**
   * How many the player finished in the top three of their class.
   */
  podiums: number;
  /**
   * The prize money they earned between them.
   */
  prize: number;
  /**
   * How many were declined or passed by.
   */
  notRaced: number;
}
