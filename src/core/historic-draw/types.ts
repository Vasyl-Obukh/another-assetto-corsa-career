import type { Discipline } from '../../shared/types/index.ts';

/**
 * One stretch of a season that draws at most one historic event.
 */
export interface HistoricSlot {
  /**
   * Which stretch of the season it is, counting from zero - what seeds its
   * draw, so the same stretch draws the same way however often it is asked.
   */
  index: number;
  /**
   * Its first day, as an ISO date.
   */
  from: string;
  /**
   * Its last day, as an ISO date.
   */
  to: string;
}

/**
 * One historic event a season drew, and the day it fell on.
 */
export interface HistoricPick {
  /**
   * The historic event, by its id.
   */
  id: string;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
}

/**
 * What a season's draw is made over.
 */
export interface HistoricDrawRequest {
  /**
   * The stretches of the season, in order, each drawing one event.
   */
  slots: readonly HistoricSlot[];
  /**
   * The historic events that may be drawn, by id - in a stable order, since
   * the draw shuffles them itself.
   */
  pool: readonly string[];
  /**
   * The days the career already races on, avoided where a stretch has another
   * day to offer.
   */
  busy: ReadonlySet<string>;
  /**
   * The ISO date the draw places nothing before, so a season drawn part-way
   * through never dates an event behind the clock.
   */
  from: string;
  /**
   * What makes this season's draw its own: the career and the season.
   */
  salt: string;
}

/**
 * The rung that decides a historic event's invitation, and its discipline.
 */
export interface HistoricRung {
  /**
   * The discipline the player holds it in.
   */
  discipline: Discipline;
  /**
   * The rung, 1 being the top.
   */
  rung: number;
}

/**
 * The seat a historic event invites the player to, and the car it races.
 */
export interface HistoricSeat {
  /**
   * The class it is in, by its class entry id.
   */
  entry: string;
  /**
   * The seat, by its id.
   */
  seat: string;
  /**
   * The car the seat races.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when the seat names one.
     */
    skin?: string;
  };
}
