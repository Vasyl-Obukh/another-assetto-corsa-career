import type { Discipline, SponsorSlot, SponsorTrade } from '../../shared/types/index.ts';

/**
 * Everything one sponsor's offer is drawn from.
 */
export interface SponsorDrawRequest {
  /**
   * What the draw is seeded with: the career and the round that brought it.
   */
  salt: string;
  /**
   * Which slot it is for.
   */
  slot: SponsorSlot;
  /**
   * The rung each discipline holds, 1 being the top.
   */
  level: Readonly<Record<Discipline, number>>;
  /**
   * The rating each discipline holds.
   */
  rating: Readonly<Record<Discipline, number>>;
  /**
   * The global rating, which an offer covering any racing is read on.
   */
  globalRating: number;
  /**
   * The disciplines the career raced, most raced first.
   */
  raced: readonly Discipline[];
  /**
   * The trades the career's deals already hold, which no offer is drawn for.
   */
  held: readonly SponsorTrade[];
  /**
   * The names the career's deals already hold, which no offer takes again.
   */
  names: readonly string[];
  /**
   * The championships a Championship covered signature may name: those the
   * career has entered on its own, by discipline.
   */
  championships: readonly { series: string; name: string; discipline: Discipline }[];
  /**
   * The career's prize speed, which every figure follows.
   */
  prizeSpeed: number;
}
