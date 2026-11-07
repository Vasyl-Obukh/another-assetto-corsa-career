import type {
  CareerSeason, RacePlace, RaceScore, SeasonEntry, SeasonEvent,
} from '../../types/index.ts';

/**
 * What a career's deals add to the seats it is offered in one discipline.
 */
export interface SeatLift {
  /**
   * How much likelier any team is to call, as a share.
   */
  interest: number;
  /**
   * How much likelier a works team is to call on top, as a share.
   */
  works: number;
  /**
   * The points a works seat before the player is ready rises by.
   */
  bar: number;
  /**
   * How much a salary rises, as a share.
   */
  salary: number;
  /**
   * Whether an independent's fee cover comes a step up.
   */
  cover: boolean;
  /**
   * How much cheaper a paid seat comes, as a share.
   */
  seatPrice: number;
}

/**
 * Where a career's form stands: how far down its classes it averaged over its
 * latest rounds, as a quarter of the field.
 */
export type FormBand = 'top' | 'upper' | 'lower' | 'bottom';

/**
 * One race a deal covers and the player drove, and whether it met the deal's
 * target.
 */
export interface JudgedRace {
  /**
   * The season it was raced in.
   */
  season: CareerSeason;
  /**
   * The season's entry it belongs to.
   */
  entry: SeasonEntry;
  /**
   * The round.
   */
  event: SeasonEvent;
  /**
   * The race, scored.
   */
  race: RaceScore;
  /**
   * The player's own place in it.
   */
  place: RacePlace;
  /**
   * How many cars raced in the player's class.
   */
  size: number;
  /**
   * Whether it is the round's first race the player drove - which a
   * qualifying is judged on, since the round's grid came off it.
   */
  first: boolean;
  /**
   * Whether it met the deal's target. A qualifying target is judged on the
   * round's first race alone, so every other race of the round reads false.
   */
  onTarget: boolean;
  /**
   * Whether it is one the deal's race pay is judged on: every race, or the
   * round's first for a qualifying target.
   */
  paid: boolean;
}

/**
 * How far a deal's goal has got.
 */
export interface GoalStanding {
  /**
   * What the player has reached: a championship place (0 for none yet), a
   * count, or a share of races on target.
   */
  reached: number;
  /**
   * What the goal asks: the place to be in or above, the count, or the share.
   */
  needed: number;
  /**
   * Whether it is met as things stand.
   */
  met: boolean;
  /**
   * Whether it is on course, or null before there is anything to judge.
   */
  onCourse: boolean | null;
}
