import type {
  EventPlan, Paddocker, SeasonEntry, SeasonEvent, Team,
} from '../../shared/types/index.ts';
import type { LaunchResult } from '../season-scoring/index.ts';

/**
 * Everything a round's debrief is written from.
 */
export interface DebriefRequest {
  /**
   * Which season the round fell in, counting from zero.
   */
  season: number;
  /**
   * The season's entry, the round recorded on it and its standings rebuilt.
   */
  entry: SeasonEntry;
  /**
   * The round, as recorded.
   */
  event: SeasonEvent;
  /**
   * The event as it was planned, whose grid every car index reads.
   */
  plan: EventPlan;
  /**
   * What Assetto Corsa wrote, one per launch that wrote anything.
   */
  results: readonly LaunchResult[];
}

/**
 * The people of the team a player races for.
 */
export interface TeamPeople {
  /**
   * The team, or null where the seat names none.
   */
  team: Team | null;
  /**
   * Its race engineer.
   */
  engineer: Paddocker;
  /**
   * Its boss.
   */
  boss: Paddocker;
}
