import { TeamBudget } from '../../shared/types/index.ts';
import type { PaddockRole } from '../../shared/types/index.ts';

/**
 * Who a team's boss is, by how well the team is funded: a works team's team
 * principal, an independent's team manager, a privateer's team owner.
 */
export const BOSS_ROLE: Readonly<Record<TeamBudget, PaddockRole>> = {
  [TeamBudget.WORKS]: 'principal',
  [TeamBudget.INDEPENDENT]: 'manager',
  [TeamBudget.PRIVATEER]: 'owner',
};

/**
 * How many rows of a class's final table a championship's result lists, the
 * player's own added beneath where it falls lower.
 */
export const RESULT_ROWS = 5;

/**
 * The fewest rounds a run needs for its team to write at halfway.
 */
export const HALFWAY_MIN_ROUNDS = 3;

/**
 * How many of a career's latest seasons can still have news to send - the one
 * open, and the one just closed, whose editions end as it does.
 */
export const LIVE_SEASONS = 2;

/**
 * How many seats for sale market news lists at most.
 */
export const MARKET_SEATS = 12;
