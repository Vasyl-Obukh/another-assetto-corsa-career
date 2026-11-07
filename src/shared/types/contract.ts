// A team's seat for one edition of a championship, offered through the inbox
// and kept on the season entry it is raced under.
//
// Every figure is fixed when the offer is drawn and copied onto the contract
// as it is signed, so a contract reads the same once its championship is edited
// or gone.

import type { LadderPosition } from './ladder.ts';
import type { TeamBudget } from './series.ts';

/**
 * What a contract pays on: a salary the team pays the player, a free seat
 * nobody pays for, or a seat the player pays the team for.
 */
export type ContractPay = 'salary' | 'free' | 'seat';

/**
 * One tier of a contract's standings bonus: what finishing the edition at or
 * above a place in the class's table pays.
 */
export interface ContractBonus {
  /**
   * The lowest place that earns it, counting from one.
   */
  upTo: number;
  /**
   * What it pays, already at the career's prize speed.
   */
  amount: number;
}

/**
 * What a team offers: its seat in one class of one edition, and what it pays.
 */
export interface ContractTerms {
  /**
   * The team, by its id in the championship.
   */
  team: string;
  /**
   * The team's display name, copied in.
   */
  teamName: string;
  /**
   * How well funded the team is, which shaped the terms.
   */
  budget: TeamBudget;
  /**
   * The team's nation, as Assetto Corsa's code, when it has one.
   */
  nation?: string;
  /**
   * The class the seat is in, by its class entry id.
   */
  entry: string;
  /**
   * The seat, by its id - the team's slower driver's, who races whatever round
   * the player misses.
   */
  seat: string;
  /**
   * The team's car the seat races, which is never the player's to rent or buy.
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
  /**
   * What the contract pays on.
   */
  pay: ContractPay;
  /**
   * The salary for the edition, already at the career's prize speed, or what
   * the seat costs - zero for a free seat.
   */
  amount: number;
  /**
   * How much of every entry fee the team covers: 1 for all of it, 0.5 for half.
   */
  feeCover: number;
  /**
   * The share of every race's and the final standing's purse that is the
   * player's, as a percentage - the team keeps the rest.
   */
  prizeShare: number;
  /**
   * What the player's final place in the class pays on top, best tier first -
   * absent for none.
   */
  bonus?: readonly ContractBonus[];
  /**
   * Set on the one seat a career with nothing left to race on is always
   * offered.
   */
  lifeline?: true;
  /**
   * The lowest place in the class's table that keeps the player on for the
   * next season - or a finish ahead of their teammate does. Absent where the
   * team keeps anyone who will pay again: a privateer's seat.
   */
  keep?: number;
  /**
   * Set on a renewal: the contract it renews, and what that one paid, which
   * the offer shows its own terms against.
   */
  renews?: Renewal;
  /**
   * Set on a seat the player asked a team for and bought, rather than one
   * offered.
   */
  bought?: true;
  /**
   * How many rounds a seat bought part-way through a season was priced on,
   * where fewer than the season holds - which is what its refund is worked
   * out of.
   */
  pricedRounds?: number;
}

/**
 * The contract a renewal renews: which run it was, where the player finished
 * it, and what it paid.
 */
export interface Renewal {
  /**
   * Which season it ran in, counting from zero.
   */
  season: number;
  /**
   * Which of that season's editions.
   */
  edition: number;
  /**
   * The player's place in the class's table when the team decided.
   */
  place: number;
  /**
   * The salary for the season, or what the seat cost - zero for a free seat.
   */
  amount: number;
  /**
   * How much of every entry fee the team covered.
   */
  feeCover: number;
  /**
   * The share of every purse that was the player's, as a percentage.
   */
  prizeShare: number;
}

/**
 * What came of a contract's team deciding whether to keep the player on: a
 * renewal offered, that renewal signed, or no renewal at all.
 */
export type KeptOutcome = 'offered' | 'renewed' | 'released';

/**
 * A seat offer, as its mail carries it.
 */
export interface SeatOffer extends ContractTerms {
  /**
   * The championship, by its id.
   */
  series: string;
  /**
   * The championship's display name, copied in.
   */
  seriesName: string;
  /**
   * Which season it is for, counting from zero.
   */
  season: number;
  /**
   * Which of the season's editions, counting from zero.
   */
  edition: number;
  /**
   * The day the edition opens, as an ISO date.
   */
  opener: string;
  /**
   * How many rounds the edition holds.
   */
  rounds: number;
  /**
   * How many editions the championship runs a season, which names this one.
   */
  editions: number;
  /**
   * The class's display name.
   */
  entryName: string;
  /**
   * The class's discipline and rung.
   */
  ladder: LadderPosition;
  /**
   * What the edition's entry fees come to in the class - what racing it on the
   * player's own would cost before a car.
   */
  fees: number;
  /**
   * A round's rent of the cheapest car the class may be raced in, which racing
   * it on the player's own adds in a rented car.
   */
  rent: number;
}

/**
 * Which of a mail's offers is meant: a team offers one seat in a class, so the
 * two name it.
 */
export interface OfferPick {
  /**
   * The class, by its class entry id.
   */
  entry: string;
  /**
   * The team, by its id in the championship.
   */
  team: string;
}

/**
 * A contract signed, as the season entry raced under it keeps it.
 */
export interface Contract extends ContractTerms {
  /**
   * What a sponsor paid of a seat bought, which holds that deal's seat backing
   * until the season finishes and is not the player's to have refunded.
   */
  backed?: {
    /**
     * The deal, by id.
     */
    deal: string;
    /**
     * What it paid.
     */
    amount: number;
  };
  /**
   * The mail it was offered in, by id.
   */
  offer: string;
  /**
   * The career's date it was signed on, as an ISO date.
   */
  signed: string;
  /**
   * The career's date it was terminated on, once it was.
   */
  ended?: string;
  /**
   * What came of the team deciding whether to keep the player on, once it
   * has - as the next season's offers were drawn.
   */
  kept?: KeptOutcome;
}

/**
 * Where a contract's player stands against what keeps them on, in the class's
 * table as it is.
 */
export interface KeepStanding {
  /**
   * The player's place in the class's table, or null before they have raced.
   */
  place: number | null;
  /**
   * Their teammate's place, or null for a seat with none, or a teammate not
   * yet classified.
   */
  mate: number | null;
  /**
   * How many drivers the class's table holds.
   */
  size: number;
  /**
   * Whether that is enough to be kept on.
   */
  kept: boolean;
}
