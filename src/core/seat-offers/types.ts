import type {
  Championship, ClassEntry, Seat, Team,
} from '../../shared/types/index.ts';
import type { SeatLift } from '../../shared/utils/sponsors/index.ts';

/**
 * Where a class sits against the rung the player may enter its discipline at:
 * on it, or one below it while the player is in the bottom half of their own -
 * no team offers a seat anywhere else.
 */
export type OfferStanding = 'rung' | 'below';

/**
 * What one class's teams are asked to offer on.
 */
export interface ClassOfferRequest {
  /**
   * The championship, as the library holds it.
   */
  championship: Championship;
  /**
   * The class.
   */
  entry: ClassEntry;
  /**
   * What makes this career's edition draw its own: the career, the season and
   * the edition.
   */
  salt: string;
  /**
   * The installed cars the class may be raced in, by folder ID.
   */
  cars: readonly string[];
  /**
   * Where the class sits against the player's rung.
   */
  standing: OfferStanding;
  /**
   * How far through the class's rung the player's rating stands, 0 at its
   * floor to 1 at the next one up.
   */
  position: number;
  /**
   * Whether the player has finished an edition at the class's rung or above in
   * its discipline.
   */
  experienced: boolean;
  /**
   * Every round's entry fee for the class, in calendar order.
   */
  fees: readonly number[];
  /**
   * What the class's race winner is paid, before the prize speed.
   */
  winnerPrize: number;
  /**
   * What the career's sponsors add in the class's discipline, nothing when
   * left out.
   */
  lift?: SeatLift;
  /**
   * What the career's prizes are multiplied by, which a salary follows.
   */
  prizeSpeed: number;
}

/**
 * A team's seat in a class: the team, and the seat it offers - its slower
 * driver's.
 */
export interface TeamSeat {
  /**
   * The team.
   */
  team: Team;
  /**
   * The seat.
   */
  seat: Seat;
}
