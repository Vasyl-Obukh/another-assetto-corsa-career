// A career's weekly car sale, read the way both processes need it: main charges
// a purchase at the sale price and the Store, the car page and every picker
// show the same one.

import { LAST_DAY_OF_WEEK, MONDAY, SALE_PRICE_STEP } from './constants.ts';
import type { LiveDeal } from './types.ts';
import { DAYS_PER_WEEK } from '../../constants/index.ts';
import type { CarDeal, CarSale } from '../../types/index.ts';
import { addDays, weekdayOf } from '../calendar-days/index.ts';

/**
 * The week a day falls in.
 * @param date The day, as an ISO date
 * @returns The Monday the week opens on, as an ISO date
 */
export const saleWeek = (date: string): string => (
  addDays(date, -((weekdayOf(date) - MONDAY + DAYS_PER_WEEK) % DAYS_PER_WEEK))
);

/**
 * The last day of a sale week.
 * @param week The Monday the week opens on, as an ISO date
 * @returns The Sunday it closes on, as an ISO date
 */
export const saleEnds = (week: string): string => addDays(week, LAST_DAY_OF_WEEK);

/**
 * The sale running on a day: the one a career holds, while the clock is still
 * in its week.
 * @param sale The sale the career holds, if any
 * @param today The day the clock stands at, as an ISO date
 * @returns The sale, or null when none runs this week
 */
export const liveSale = (sale: CarSale | undefined, today: string): CarSale | null => (
  sale && sale.week === saleWeek(today) ? sale : null
);

/**
 * What a car costs on sale.
 * @param price Its listed price
 * @param off What the sale takes off, as a whole percentage
 * @returns The sale price, rounded to the step - never under one step, so a
 * car priced near nothing is never given away, nor over its listed price
 */
export const salePrice = (price: number, off: number): number => Math.min(
  price,
  Math.max(SALE_PRICE_STEP, Math.round((price * (1 - off / 100)) / SALE_PRICE_STEP) * SALE_PRICE_STEP),
);

/**
 * Every car on a sale.
 * @param sale The sale running, or null
 * @returns The deals, the Deal of the week first
 */
export const saleDeals = (sale: CarSale | null): LiveDeal[] => [
  ...(sale?.headline ? [{ ...sale.headline, headline: true }] : []),
  ...(sale?.deals ?? []).map((deal) => ({ ...deal, headline: false })),
];

/**
 * A car's deal in a sale.
 * @param sale The sale running, or null
 * @param model Car folder ID
 * @returns Its deal, or null when it is not on sale
 */
export const dealOf = (sale: CarSale | null, model: string): LiveDeal | null => (
  saleDeals(sale).find((deal) => deal.model === model) ?? null
);

/**
 * What deals take off, as a car query carries it.
 * @param deals The deals
 * @returns The discounts, by folder ID
 */
export const saleOffs = (deals: readonly CarDeal[]): Record<string, number> => (
  Object.fromEntries(deals.map((deal) => [deal.model, deal.off]))
);
