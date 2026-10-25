import type { Discipline, RatingLine } from '../../../../shared/types';

/**
 * Which lines the rating log shows: every one, the sessions that moved it, or
 * the levels gained, lost and lifted.
 */
export type RatingFilter = 'all' | 'sessions' | 'levels';

/**
 * Every rating a career holds at one moment: one per discipline, and the
 * global one.
 */
export interface RatingSnapshot {
  /**
   * Each discipline's rating.
   */
  disciplines: Record<Discipline, number>;
  /**
   * The global rating.
   */
  global: number;
}

/**
 * One point of the rating chart: a session landed, or the career opening.
 */
export interface RatingPoint {
  /**
   * The line it stands for.
   */
  line: RatingLine;
  /**
   * Every rating once it landed.
   */
  ratings: RatingSnapshot;
}

/**
 * What a championship or historic event moved a discipline's rating by, over
 * a stretch of the log.
 */
export interface RatingSeriesTotal {
  /**
   * The championship, by id.
   */
  series: string;
  /**
   * Its name.
   */
  name: string;
  /**
   * The season it ran in.
   */
  season: number;
  /**
   * Which of the season's editions.
   */
  edition: number;
  /**
   * The discipline it moved.
   */
  discipline: Discipline;
  /**
   * Whether it is a historic event.
   */
  historic: boolean;
  /**
   * How many sessions it rated.
   */
  sessions: number;
  /**
   * What they came to.
   */
  change: number;
}
