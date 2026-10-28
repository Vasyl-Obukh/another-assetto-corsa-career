import type {
  CareerSeason, Contract, KeepStanding, SeasonEntry,
} from '../../../../shared/types';

/**
 * Where a contract stands: still being raced, or how it ended - its season
 * run, its team renewing it, its team letting the player go, or terminated.
 */
export type ContractEnd = 'running' | 'completed' | 'renewed' | 'released' | 'terminated';

/**
 * Where the player stands against what keeps them on while the season runs.
 */
export type KeepMark = 'kept' | 'short';

/**
 * How a contract came to be signed: an offer, a renewal of the one before,
 * a seat the player bought, or the seat a career with nothing left is offered.
 */
export type ContractOrigin = 'offered' | 'renewal' | 'bought' | 'lifeline';

/**
 * One contract the career signed, as the Contracts page lists it.
 */
export interface ContractRow {
  /**
   * The season it was raced in.
   */
  season: CareerSeason;
  /**
   * The season's entry raced under it.
   */
  entry: SeasonEntry;
  /**
   * The contract.
   */
  contract: Contract;
  /**
   * Where it stands, or how it ended.
   */
  end: ContractEnd;
  /**
   * How it came to be signed.
   */
  origin: ContractOrigin;
  /**
   * Whether its team offered to renew it and the player has not taken it -
   * still to answer, or turned down.
   */
  renewal: 'awaiting' | 'declined' | null;
  /**
   * Where the player stands against what keeps them on, as the class's table
   * is now.
   */
  standing: KeepStanding;
  /**
   * How many of its rounds the player raced.
   */
  raced: number;
  /**
   * What it paid the player: salary, bonus and their share of every prize.
   */
  earned: number;
  /**
   * What it cost the player, as a negative amount: the seat, fines, any share
   * of the fees left to them and a release fee, less a refund.
   */
  paid: number;
}

/**
 * Every contract a career signed, in figures.
 */
export interface ContractFigures {
  /**
   * How many it signed.
   */
  signed: number;
  /**
   * How many of them came each way.
   */
  origins: Record<ContractOrigin, number>;
  /**
   * How many teams it raced for under one.
   */
  teams: number;
  /**
   * What they paid the player.
   */
  earned: number;
  /**
   * What they cost the player, as a negative amount.
   */
  paid: number;
}
