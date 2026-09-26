// What simulating a round is handed, and what it hands back.

import type {
  Championship, FieldSeat, GridEntry, LaunchRecord, RoundScore,
} from '../../shared/types/index.ts';
import type { LaunchResult } from '../season-scoring/index.ts';

/**
 * The player's part in a simulated round, when the career is in the
 * championship. They never drive one: their seat is raced by the driver it
 * names, whose places are marked `substitute`.
 */
export interface SimulatedPlayer {
  /**
   * The class entry they race in, by its id. Their seat is its last, as it is
   * when a round is lowered for real.
   */
  entry: string;
}

/**
 * One car of a simulated grid, with the pace it races on.
 */
export interface SimulatedCar {
  /**
   * The car as scoring reads it.
   */
  entry: GridEntry;
  /**
   * Its pace, in AI levels: the driver's offset, the class's and the round's,
   * less a gap per class so the classes keep their order overall.
   */
  pace: number;
}

/**
 * One round to simulate.
 */
export interface SimulationRequest {
  /**
   * The championship, as the season holds it.
   */
  series: Championship;
  /**
   * Which round of it, by id.
   */
  round: string;
  /**
   * The career and season the round belongs to, which seeds every draw - the
   * same salt the season's field and forecasts are drawn with.
   */
  salt: string;
  /**
   * When the round is recorded, as an ISO timestamp.
   */
  recordedAt: string;
  /**
   * The season's frozen field, when the career is in the championship. Without
   * one every seat races on what drawField would freeze for it, so a round
   * simulated before entering is raced by the drivers entering then fields.
   */
  field?: readonly FieldSeat[];
  /**
   * The player, when the career is in the championship.
   */
  player?: SimulatedPlayer;
  /**
   * Launches of the weekend that were actually driven, in the order they ran.
   * Simulation carries on from the first launch these do not cover, so a
   * weekend abandoned part-way keeps what was raced.
   */
  completed?: readonly LaunchRecord[];
  /**
   * What Assetto Corsa wrote for those launches, for their lap times.
   */
  results?: readonly LaunchResult[];
}

/**
 * A simulated round.
 */
export interface SimulatedRound {
  /**
   * Every launch of the weekend, the driven ones first and as they were handed
   * in. Car indices follow the grid a real lowering builds - the player's seat
   * first, then every other seat in entry-list order - so the event page reads
   * these exactly as it reads driven ones.
   */
  sessions: LaunchRecord[];
  /**
   * The round's score.
   */
  score: RoundScore;
}
