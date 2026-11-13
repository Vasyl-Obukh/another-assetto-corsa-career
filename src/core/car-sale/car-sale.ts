// Drawing a week's car sale, pure and seeded.

import type { CarDeal, CarSale } from '../../shared/types/index.ts';
import {
  DEAL_OFF, HEADLINE_OFF, SALE_SHARE,
} from '../../shared/utils/car-sale/index.ts';
import {
  intIn, randomFrom, seedFrom, shuffle,
} from '../seeded-random/index.ts';

/**
 * Draws a week's sale at random from the cars that can be on it: the Deal of
 * the week, then a share of the rest. Nothing of the week before is read, so a
 * car may be on sale two weeks running.
 * @param models Every car the sale may name, by folder ID
 * @param week The Monday the week opens on, as an ISO date
 * @param salt What tells one career's draw from another's - its id
 * @returns The sale
 */
export const drawSale = (models: readonly string[], week: string, salt: string): CarSale => {
  // The week leads the seed: seedFrom is a running hash, and weeks differing in
  // their last character would otherwise seed within a hair of each other.
  const random = randomFrom(seedFrom(`${week}\u0000${salt}`));
  // Sorted first, so the order the library lists them in decides nothing.
  const [first, ...rest] = shuffle([...models].sort(), random);
  const share = SALE_SHARE[0] + random() * (SALE_SHARE[1] - SALE_SHARE[0]);
  const count = rest.length === 0 ? 0 : Math.max(1, Math.round(models.length * share));
  const deals = rest.slice(0, count).map((model): CarDeal => ({ model, off: intIn(DEAL_OFF, random) }));

  return {
    week,
    headline: first === undefined ? null : { model: first, off: intIn(HEADLINE_OFF, random) },
    deals,
  };
};
