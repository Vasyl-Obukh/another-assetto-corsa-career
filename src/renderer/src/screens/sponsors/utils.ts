import type { DealRow } from './types.ts';
import type { Career } from '../../../../shared/types';
import { LOWEST_RUNG, ratingFloor } from '../../../../shared/utils/career-eligibility';
import {
  bestRung, dealPaid, judgedRaces,
} from '../../../../shared/utils/sponsors';

/**
 * Every deal a career signed, newest first, with what each came to.
 * @param career The career
 * @returns The rows
 */
export const dealRows = (career: Career): DealRow[] => [...career.sponsors].reverse().map((deal) => ({
  deal,
  paid: dealPaid(career, deal.id),
  races: judgedRaces(career, deal).length,
  end: career.sponsors.some((one) => one.renews === deal.id) ? 'renewed' : deal.ended?.why ?? 'running',
}));

/**
 * The partner slots still to open, each with the rung that opens it and the
 * rating that reaches that rung.
 * @param career The career
 * @returns The slots, nearest first
 */
export const lockedSlots = (career: Career): { rung: number; rating: number }[] => {
  // Every rung below the lowest the ladder names holds its slots already.
  const best = Math.min(bestRung(career.level), LOWEST_RUNG);

  return Array.from({ length: best - 1 }, (unused, at) => best - 1 - at)
    .map((rung) => ({ rung, rating: ratingFloor(rung) }));
};

/**
 * What every sponsor paid in one season, repayments taken off.
 * @param career The career
 * @param season Which season, counting from zero
 * @returns The sum
 */
export const paidIn = (career: Career, season: number): number => career.ledger
  .filter((line) => line.sponsor && line.season === season)
  .reduce((sum, line) => sum + line.amount, 0);
