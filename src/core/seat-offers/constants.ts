import { TeamBudget } from '../../shared/types/index.ts';

/**
 * How likely each team is to offer the player its seat, as a percentage, on
 * the player's own rung: a works team from the top half of the rung once the
 * player has finished an edition at it, rising across that half, an
 * independent from a quarter of the way in, rising to the top, and a
 * privateer to anyone - and either of the first two now and then short of
 * that. A rung below the player's, every team calls at its own flat chance,
 * the teams that pay most likely, since there the player is the proven driver.
 */
export const OFFER_CHANCE = {
  rung: {
    [TeamBudget.WORKS]: {
      from: 0.5, low: 15, high: 45, short: 5,
    },
    [TeamBudget.INDEPENDENT]: {
      from: 0.25, low: 25, high: 50, short: 5,
    },
    [TeamBudget.PRIVATEER]: {
      from: 0, low: 50, high: 50, short: 50,
    },
  },
  below: {
    [TeamBudget.WORKS]: 45,
    [TeamBudget.INDEPENDENT]: 50,
    [TeamBudget.PRIVATEER]: 30,
  },
} as const;

/**
 * How far up their own rung the player may stand and still be offered seats a
 * rung below it: the bottom half.
 */
export const BELOW_UNTIL = 0.5;

/**
 * How many of a class's seats are going in an edition, as the odds of each
 * count from none up, in percent: a single-class championship's class may
 * have up to three, each class of a multi-class one up to two.
 */
export const SEATS_GOING = {
  single: [30, 35, 25, 10],
  multi: [40, 40, 20],
} as const;

/**
 * Which teams fill a class's seats when more call than are going: the best
 * funded first.
 */
export const BUDGET_RANK: Record<TeamBudget, number> = {
  [TeamBudget.WORKS]: 0,
  [TeamBudget.INDEPENDENT]: 1,
  [TeamBudget.PRIVATEER]: 2,
};

/**
 * A works team's salary for an edition, as a range over the edition's entry
 * fees - before the career's prize speed.
 */
export const SALARY_RANGE = [1.4, 2.2] as const;

/**
 * A privateer's price for its seat, as a range over the edition's entry fees.
 */
export const SEAT_PRICE_RANGE = [1.1, 1.4] as const;

/**
 * The shares of every purse a works team leaves the player, as percentages.
 */
export const WORKS_SHARES = [20, 25, 30] as const;

/**
 * The shares of every purse an independent leaves the player, as percentages.
 */
export const INDEPENDENT_SHARES = [40, 45, 50, 55, 60] as const;

/**
 * How likely an independent is to cover only half of each entry fee.
 */
export const HALF_COVER_CHANCE = 0.5;

/**
 * How likely an independent is to put a standings bonus in its contract.
 */
export const INDEPENDENT_BONUS_CHANCE = 0.4;

/**
 * A works team's standings bonus: winning the class, and a podium in it, each
 * as a share of the salary.
 */
export const WORKS_BONUS = [
  { upTo: 1, share: 0.4 },
  { upTo: 3, share: 0.13 },
] as const;

/**
 * An independent's standings bonus for winning the class, as a share of the
 * edition's entry fees - before the career's prize speed.
 */
export const INDEPENDENT_BONUS_SHARE = 0.5;

/**
 * What a seat whose championship charges nothing to enter is priced off
 * instead: a quarter of the class's race win per round, which is roughly what
 * every fee of the top rung comes to.
 */
export const FEELESS_SHARE = 0.25;

/**
 * The share of every purse the lifeline seat leaves the player, as a
 * percentage.
 */
export const LIFELINE_SHARE = 50;

/**
 * Amounts are rounded to this, so an offer reads as a figure a team would
 * write rather than a computed one - to this smaller step under `ROUND_ABOVE`.
 */
export const ROUND_TO = 500;

/**
 * The smaller step amounts under `ROUND_ABOVE` are rounded to.
 */
export const ROUND_SMALL = 100;

/**
 * Where the step amounts are rounded to grows from `ROUND_SMALL` to
 * `ROUND_TO`.
 */
export const ROUND_ABOVE = 10_000;

/**
 * What keeps the player on, as the share of the class's table from the top
 * they have to finish in - or ahead of their teammate. A privateer keeps
 * anyone who will pay again.
 */
export const KEEP_SHARE: Record<TeamBudget, number | null> = {
  [TeamBudget.WORKS]: 1 / 3,
  [TeamBudget.INDEPENDENT]: 1 / 2,
  [TeamBudget.PRIVATEER]: null,
};

/**
 * What a renewed salary rises by on the player's final place in the class:
 * a quarter for the title, a tenth for a podium.
 */
export const RENEWAL_RAISE = [
  { upTo: 1, raise: 0.25 },
  { upTo: 3, raise: 0.1 },
] as const;

/**
 * The lowest place that improves an independent's renewal: every fee covered,
 * and more of the prizes.
 */
export const RENEWAL_PODIUM = 3;

/**
 * How many points more of the prizes an independent's renewal leaves the
 * player after a podium.
 */
export const RENEWAL_SHARE_STEP = 5;

/**
 * The most of the prizes an independent's renewal ever leaves the player, as
 * a percentage - the top of what an independent offers at all.
 */
export const RENEWAL_SHARE_CAP = 60;

/**
 * A privateer's price for a seat the player asks to buy, as a range over the
 * season's entry fees - dearer than its offer, since a team that calls wants
 * the driver and one called names its price.
 */
export const SALE_PRICE_RANGE = [1.3, 1.5] as const;
