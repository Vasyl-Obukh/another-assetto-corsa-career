// A career's sponsors: who backs the player, what each pays and asks, and the
// offers that bring them. A sponsor backs the driver rather than a seat, so a
// deal reaches every championship it covers, raced for a team or on their own.
//
// Every deal is drawn from a pool of perks and conditions and stored as drawn,
// figures and all, so a deal reads the same however the pool changes after it.

import type { Discipline } from './ladder.ts';

/**
 * What a sponsor sells, which decides what it leans on and names it.
 */
export type SponsorTrade = 'oil' | 'tyres' | 'tech' | 'drinks' | 'watch' | 'finance' | 'parts' | 'dealer' | 'apparel' | 'travel';

/**
 * Which slot a deal fills: the one main sponsor, or a partner.
 */
export type SponsorSlot = 'main' | 'partner';

/**
 * What a perk is: a main sponsor's signature - a championship's fees, pay that
 * climbs with the player, half a car or a seat, a car for the goal met - money
 * for being on target, for a result, on signing or for a goal met, a cost it
 * takes off, or something that helps without paying.
 */
export type SponsorPerkKind = 'championship' | 'climbs' | 'carBacking' | 'seatBacking' | 'carReward'
  | 'racePay' | 'signing' | 'win' | 'podium' | 'points' | 'pole' | 'prizeMatch' | 'goalBonus'
  | 'feeShare' | 'rentShare' | 'repaints'
  | 'teamInterest' | 'worksInterest' | 'betterTerms' | 'invitations';

/**
 * The car a car reward names, copied in as it was drawn.
 */
export interface SponsorCar {
  /**
   * The car's folder ID.
   */
  model: string;
  /**
   * The car's display name.
   */
  name: string;
  /**
   * What the Store sells it for.
   */
  price: number;
  /**
   * The livery it arrives in, its first.
   */
  skin?: string;
}

/**
 * One thing a sponsor gives.
 */
export interface SponsorPerk {
  /**
   * What it is.
   */
  kind: SponsorPerkKind;
  /**
   * What it pays, at the rung the deal was drawn at - absent on a perk that is
   * a share or a championship.
   */
  amount?: number;
  /**
   * The share it pays, as a percentage - of every prize for a prize match, of a
   * car's or a seat's price for backing, of a cost for a fee or rent share.
   */
  share?: number;
  /**
   * The championship whose fees it covers, by id.
   */
  series?: string;
  /**
   * That championship's name, copied in.
   */
  seriesName?: string;
  /**
   * The car a car reward gives.
   */
  car?: SponsorCar;
  /**
   * On a renewal, the amount or share it replaces - set only where it changed.
   */
  was?: number;
  /**
   * On a renewal, the name of the car it replaces.
   */
  wasCar?: string;
}

/**
 * What a sponsor asks of every race it covers.
 */
export type SponsorTargetKind = 'classPlace' | 'qualifying' | 'teammate' | 'clean' | 'start';

/**
 * A deal's target, judged on every race - or every qualifying, for a
 * qualifying target. Short of it, that race pays nothing (a main sponsor
 * half), and nothing else follows from it.
 */
export interface SponsorTarget {
  /**
   * What it asks.
   */
  kind: SponsorTargetKind;
  /**
   * The share of the class to finish or qualify in, from the top - a half, a
   * third or a quarter - on a place target.
   */
  share?: number;
  /**
   * The most cut laps a race may hold, on a clean racing target.
   */
  cuts?: number;
}

/**
 * What a goal counts.
 */
export type SponsorGoalKind = 'championshipPlace' | 'resultCount' | 'onTarget' | 'racesStarted';

/**
 * Which result a count of results counts.
 */
export type SponsorResult = 'podium' | 'win' | 'pole';

/**
 * A deal's one condition for its year: met, the sponsor would renew; missed,
 * the deal ends on its anniversary.
 */
export interface SponsorGoal {
  /**
   * What it counts.
   */
  kind: SponsorGoalKind;
  /**
   * How many: the place to finish a championship in or above, the results to
   * count, or the races to start.
   */
  count?: number;
  /**
   * A share rather than a count: of the class to finish a championship in, or
   * of the races to be on target in.
   */
  share?: number;
  /**
   * Which result, on a count of results.
   */
  result?: SponsorResult;
}

/**
 * Who a sponsor is.
 */
export interface Sponsor {
  /**
   * Its name, drawn off its trade's book of real companies.
   */
  name: string;
  /**
   * What it sells.
   */
  trade: SponsorTrade;
  /**
   * Where it is from, as Assetto Corsa's nation code.
   */
  nation: string;
  /**
   * Its logo, by the name of its file among the renderer's sponsor assets -
   * absent for a brand that has none, which shows its initials.
   */
  logo?: string;
}

/**
 * What a sponsor offers: who it is, which slot it fills, what it covers, pays
 * and asks.
 */
export interface SponsorTerms {
  /**
   * Who it is.
   */
  sponsor: Sponsor;
  /**
   * Which slot it fills.
   */
  slot: SponsorSlot;
  /**
   * The discipline it covers, or null for any racing.
   */
  covers: Discipline | null;
  /**
   * What it gives, a main sponsor's signature first.
   */
  perks: readonly SponsorPerk[];
  /**
   * What it asks of every race.
   */
  target: SponsorTarget;
  /**
   * What it asks of its year.
   */
  goal: SponsorGoal;
  /**
   * The rung its figures were drawn at, 1 being the top - what a perk that
   * climbs with the player scales from.
   */
  rung: number;
}

/**
 * A sponsor's offer, as its mail holds it.
 */
export interface SponsorOffer extends SponsorTerms {
  /**
   * The deal it would replace, by id, when its slot is filled.
   */
  replaces?: string;
  /**
   * The deal it renews, by id, for a sponsor asking for another year.
   */
  renews?: string;
}

/**
 * How a deal ended: its year run out with its goal met or missed, ended by the
 * player, or replaced by another sponsor's.
 */
export type SponsorEnd = 'goalMet' | 'goalMissed' | 'mine' | 'replaced';

/**
 * A deal signed - kept on the career once it ends, so its history reads back.
 */
export interface SponsorDeal extends SponsorTerms {
  /**
   * The offer's mail id, which is the deal's own.
   */
  id: string;
  /**
   * The day it was signed, as an ISO date.
   */
  signed: string;
  /**
   * The day its year runs out, as an ISO date: the same date a year on.
   */
  until: string;
  /**
   * The deal it renewed, by id.
   */
  renews?: string;
  /**
   * The day its goal was met, as an ISO date, which is the day its goal bonus
   * and its car came.
   */
  goalMet?: string;
  /**
   * How and when it ended, once it has.
   */
  ended?: {
    /**
     * The day, as an ISO date.
     */
    on: string;
    /**
     * Why.
     */
    why: SponsorEnd;
  };
}

/**
 * One of a deal's figures risen with the player.
 */
export interface SponsorRise {
  /**
   * The perk.
   */
  kind: SponsorPerkKind;
  /**
   * What it pays now.
   */
  amount: number;
  /**
   * What it paid.
   */
  was: number;
}

/**
 * A sponsor telling the player something of a deal: by default that its year
 * has run out with its goal missed, or else that its goal is met or that it has
 * climbed with them.
 */
export interface SponsorNews {
  /**
   * What it says, when that is not a goal missed.
   */
  kind?: 'goalMet' | 'climbed';
  /**
   * The goal bonus paid, on a goal met.
   */
  bonus?: number;
  /**
   * The car a goal met brought.
   */
  car?: SponsorCar;
  /**
   * What the car would have sold for, on a goal met whose car could not come.
   */
  carPaid?: number;
  /**
   * The rung it climbed to, 1 being the top.
   */
  rung?: number;
  /**
   * Each figure it climbed from.
   */
  rises?: readonly SponsorRise[];
  /**
   * The deal, by id.
   */
  deal: string;
  /**
   * Who it is.
   */
  sponsor: Sponsor;
  /**
   * Which slot it filled.
   */
  slot: SponsorSlot;
  /**
   * What its goal asked.
   */
  goal: SponsorGoal;
  /**
   * How far the player got towards it.
   */
  reached: number;
  /**
   * What the deal paid over its year.
   */
  paid: number;
}
